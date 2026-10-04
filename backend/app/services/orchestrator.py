"""Research job lifecycle: invoke the deep-research graph (docs/11) and persist its
output. Runs as a FastAPI background task with its own sessions (ADR-007)."""
import asyncio
import logging
import time
import uuid
from datetime import datetime, timezone

from sqlalchemy import select, update

from app.core.config import get_settings
from app.db.session import session_factory
from app.models import CategoryScore, Intake, Report, ResearchJob
from app.models import Finding as FindingRow
from app.schemas.research import CATEGORIES, CategoryResult, ResearchBrief
from app.services.research_graph import graph

log = logging.getLogger("rumper.orchestrator")

# Server-owned loader progress (the FE only renders these). Each graph node announces
# its phase at the top (research_graph._progress), so the loader reflects the node that
# is *running*. Map phase → (named step 1..5, base bar %, id-ID label). `search` reports
# per-query done/total and fills the band below.
_PHASES: dict[str, tuple[int, int, str]] = {
    "spatial_scan": (1, 6, "Memindai data spasial: banjir, elevasi, tol, fasilitas…"),
    "plan": (2, 18, "Menyusun rencana riset…"),
    "search": (3, 28, "Mencari & memperdalam bukti dari web…"),
    "assess": (3, 66, "Menilai kecukupan bukti…"),
    "extract": (4, 78, "Mengekstrak temuan & sumber…"),
    "score": (5, 90, "Menghitung skor…"),
    "compose": (5, 96, "Menyiapkan laporan awal…"),
}
_SEARCH_BAND = (28, 62)  # search bar fills lo→hi as grounded queries complete


class _ProgressTracker:
    """Persists monotonic loader progress from the graph's custom-stream events."""

    def __init__(self, job_id: uuid.UUID) -> None:
        self.job_id = job_id
        self.step = 1
        self.pct = 2
        # Per-phase wall clock. "Why is the analysis slow?" was previously unanswerable
        # without a LangSmith trace; this makes the shape of every run visible in the logs
        # at zero cost (no extra model calls, no schema change).
        self._t0 = time.monotonic()
        self._phase: str | None = None
        self._phase_t0 = self._t0
        self.timings: dict[str, float] = {}

    def _mark(self, phase: str) -> None:
        if phase == self._phase:
            return
        now = time.monotonic()
        if self._phase is not None:
            self.timings[self._phase] = self.timings.get(self._phase, 0.0) + (now - self._phase_t0)
        self._phase, self._phase_t0 = phase, now

    def summary(self) -> str:
        self._mark("__end__")
        self.timings.pop("__end__", None)
        parts = ", ".join(
            f"{k}={v:.1f}s" for k, v in sorted(self.timings.items(), key=lambda kv: -kv[1])
        )
        return f"total={time.monotonic() - self._t0:.1f}s  {parts}"

    async def handle(self, event: dict) -> None:
        phase = event.get("phase")
        base = _PHASES.get(phase)
        if base is None:
            return
        self._mark(phase)
        step, pct, label = base
        total = event.get("total")
        if event.get("phase") == "search" and total:
            lo, hi = _SEARCH_BAND
            done = event.get("done", 0)
            pct = lo + round((hi - lo) * done / total)
            label = f"Mencari & memperdalam bukti dari web ({done}/{total})…"
        step = max(self.step, step)
        pct = max(self.pct, min(99, pct))  # 100% is reserved for status=done
        self.step, self.pct = step, pct
        await _set_progress(self.job_id, step, pct, label)


def build_brief(intake: Intake, geo: dict | None) -> ResearchBrief:
    concerns = intake.concerns or {}
    return ResearchBrief(
        property_name=intake.property_name,
        address_text=intake.address_text,
        formatted_address=intake.formatted_address,
        lat=intake.lat, lng=intake.lng,
        kelurahan=(geo or {}).get("kelurahan"),
        kecamatan=(geo or {}).get("kecamatan"),
        kota=(geo or {}).get("kota"),
        in_jabodetabek=intake.in_jabodetabek,
        workplace_text=intake.workplace_text,
        workplace_lat=intake.workplace_lat, workplace_lng=intake.workplace_lng,
        transport_mode=intake.transport_mode,
        purpose=intake.purpose, buying_stage=intake.buying_stage,
        dp_timeline=intake.dp_timeline,
        concerns=concerns.get("categories", []),
        concern_notes=concerns.get("notes"),
    )


async def _set_progress(job_id: uuid.UUID, step: int, pct: int, label: str) -> None:
    async with session_factory()() as db:
        await db.execute(update(ResearchJob).where(ResearchJob.id == job_id)
                         .values(categories_done=step, progress_pct=pct, progress_note=label))
        await db.commit()


async def _invoke_graph(job_id: uuid.UUID, brief: ResearchBrief, trace_id: uuid.UUID) -> dict:
    """Stream the graph so the loader's progress moves in real time; return final state.

    `updates` carries each node's full state (nodes return `{**state, ...}`); `custom`
    carries the per-node/per-query progress events the loader renders."""
    state: dict = {}
    progress = _ProgressTracker(job_id)
    config = {"run_id": trace_id, "metadata": {"job_id": str(job_id)},
              "configurable": {"thread_id": f"job:{job_id}"}}
    g = await graph()
    async for mode, chunk in g.astream(
        {"brief": brief.model_dump()}, config=config, stream_mode=["updates", "custom"],
    ):
        if mode == "updates":
            for _node, out in chunk.items():
                state = out
        elif mode == "custom":
            await progress.handle(chunk)
    log.info("research %s phase timings: %s", job_id, progress.summary())
    return state


async def run_research(job_id: uuid.UUID, geo: dict | None) -> None:
    factory = session_factory()
    trace_id = uuid.uuid4()
    async with factory() as db:
        job = (await db.execute(select(ResearchJob).where(ResearchJob.id == job_id))).scalar_one()
        intake = (await db.execute(select(Intake).where(Intake.id == job.intake_id))).scalar_one()
        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        job.trace_id = str(trace_id)
        job.categories_done = 1
        job.progress_pct = 2
        job.progress_note = "Membaca lokasi & memindai data spasial…"
        await db.commit()

    try:
        brief = build_brief(intake, geo)
        state = await asyncio.wait_for(
            _invoke_graph(job_id, brief, trace_id),
            timeout=get_settings().graph_timeout_seconds,
        )
        results = {c: CategoryResult.model_validate(r) for c, r in state["results"].items()}
        engine = state["engine"]

        async with factory() as db:
            for cat in CATEGORIES:
                r = results.get(cat)
                if r is None:
                    continue
                for f in r.findings:
                    db.add(FindingRow(
                        job_id=job_id, category=cat, claim=f.claim,
                        evidence=[e.model_dump() for e in f.evidence],
                        confidence=f.confidence, limitation=f.limitation,
                        validation_action=f.validation_action,
                        is_red_flag=f.is_red_flag, is_critical=f.is_critical,
                        is_evidence_gap=f.is_evidence_gap,
                    ))
                db.add(CategoryScore(
                    job_id=job_id, category=cat,
                    score=engine["category_scores"].get(cat),
                    proposed_score=r.proposed_score,
                    confidence=r.confidence, rationale=r.score_rationale,
                ))
            db.add(Report(
                job_id=job_id, rls_score=engine["rls_score"], band=engine["band"],
                recommendation=engine["recommendation"], summary=state.get("summary", ""),
                checklist=state.get("checklist", []),
            ))
            await db.execute(
                update(ResearchJob).where(ResearchJob.id == job_id)
                .values(status="done", finished_at=datetime.now(timezone.utc))
            )
            await db.commit()
    except Exception:
        log.exception("research job %s failed", job_id)
        async with factory() as db:
            await db.execute(
                update(ResearchJob).where(ResearchJob.id == job_id)
                .values(status="failed", finished_at=datetime.now(timezone.utc),
                        error="Riset gagal diproses. Coba lagi, atau bagikan pin Google Maps "
                              "yang lebih tepat.")
            )
            await db.commit()
