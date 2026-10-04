import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import current_user
from app.db.session import get_db
from app.models import CategoryScore, Finding, Intake, Report, ResearchJob, User
from app.schemas.research import CATEGORIES, CATEGORY_LABELS
from app.services.scoring import BAND_LABELS, DISCLAIMER, RECOMMENDATION_LABELS, WEIGHTS

router = APIRouter(prefix="/api/checks", tags=["checks"])


class _SourceTable:
    """Report-level evidence de-duplication (docs/05).

    A grounded-search run cites the same ~60 articles from several findings, and the old
    payload embedded the full object every time — then embedded whole findings a second
    time under `red_flags`/`evidence_gaps`. Same report, ~10x the bytes. Here each distinct
    source is emitted once with an integer id and findings carry `evidence_ids`.
    """

    def __init__(self) -> None:
        self._by_key: dict[str, int] = {}
        self.items: list[dict] = []

    def ids_for(self, evidence: list[dict] | None) -> list[int]:
        out: list[int] = []
        for e in evidence or []:
            key = (e.get("url") or "") + "|" + (e.get("source_title") or "")
            idx = self._by_key.get(key)
            if idx is None:
                idx = len(self.items)
                self._by_key[key] = idx
                self.items.append({"id": idx, **e})
            if idx not in out:
                out.append(idx)
        return out


def _finding_json(f: Finding, sources: _SourceTable) -> dict:
    return {
        "claim": f.claim,
        "evidence_ids": sources.ids_for(f.evidence),
        "confidence": f.confidence,
        "limitation": f.limitation,
        "validation_action": f.validation_action,
        "is_red_flag": f.is_red_flag,
        "is_critical": f.is_critical,
        "is_evidence_gap": f.is_evidence_gap,
    }


PDF_DAILY_LIMIT = 5

# Backstop for the multi-worker case below. A healthy run finishes well inside this: the
# graph is bounded to MAX_GROUNDED_CALLS with a 40s per-query timeout.
RESEARCH_MAX_RUNTIME = timedelta(minutes=15)

# When *this* worker started. Research runs as an in-process asyncio task, so a job that
# began before this process booted cannot be owned by it — the worker that owned it is gone.
# That turns "wait 15 minutes to find out" into an instant, accurate answer, which matters
# because `uvicorn --reload` respawns on every backend edit.
_BOOT_AT = datetime.now(timezone.utc)


def _as_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _is_stale(job: ResearchJob) -> bool:
    """A running job whose owning process is gone.

    Two independent signals:
      1. It predates this worker's boot. Exact for the single-instance deployment we run
         (ADR-009). With several workers a sibling could still own it, hence…
      2. …the absolute runtime cap, which is safe regardless of worker count.
    """
    started = _as_utc(job.started_at)
    if started is None:
        return False
    if started < _BOOT_AT:
        return True
    return datetime.now(timezone.utc) - started > RESEARCH_MAX_RUNTIME


@router.get("/{intake_id}/report.pdf")
async def download_report_pdf(intake_id: str, db: AsyncSession = Depends(get_db),
                              user: User = Depends(current_user)):
    """Mini Check PDF — capped at 5 downloads per user per WIB day (cost control)."""
    from fastapi import Response

    from app.core.usage import count_events_today
    from app.models import UsageEvent
    from app.services.pdf_report import build_pdf

    used = await count_events_today(db, user.id, "report_pdf")
    if used >= PDF_DAILY_LIMIT:
        raise HTTPException(status_code=429, detail={
            "code": "pdf_limit",
            "message": f"Batas unduh laporan {PDF_DAILY_LIMIT}x per hari tercapai. "
                       "Coba lagi setelah tengah malam WIB.",
        })
    try:
        iid = uuid.UUID(intake_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")
    row = (await db.execute(
        select(ResearchJob, Intake).join(Intake, ResearchJob.intake_id == Intake.id)
        .where(ResearchJob.intake_id == iid)
    )).first()
    if row is None or row[0].status != "done":
        raise HTTPException(status_code=404, detail="Laporan belum tersedia.")
    job, intake = row
    report = (await db.execute(select(Report).where(Report.job_id == job.id))).scalar_one()
    scores = {s.category: s for s in
              (await db.execute(select(CategoryScore).where(CategoryScore.job_id == job.id))).scalars()}
    findings = (await db.execute(select(Finding).where(Finding.job_id == job.id))).scalars().all()
    by_cat: dict = {}
    for f in findings:
        by_cat.setdefault(f.category, []).append(f)

    pdf = build_pdf(intake, report, scores, by_cat)
    db.add(UsageEvent(user_id=user.id, provider="internal", kind="pdf",
                      operation="report_pdf", meta={"intake_id": str(iid)}))
    await db.commit()
    name = (intake.property_name or "lokasi").replace(" ", "-")[:40]
    return Response(pdf, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="rumper-minicheck-{name}.pdf"',
    })


@router.get("/{intake_id}/map")
async def get_check_map(intake_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    from app.services.spatial import build_map_facts

    try:
        iid = uuid.UUID(intake_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")
    row = (await db.execute(
        select(ResearchJob, Intake).join(Intake, ResearchJob.intake_id == Intake.id)
        .where(ResearchJob.intake_id == iid)
    )).first()
    if row is None or row[1].lat is None:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")
    job, intake = row
    report = (await db.execute(select(Report).where(Report.job_id == job.id))).scalar_one_or_none()
    scores = (await db.execute(select(CategoryScore).where(CategoryScore.job_id == job.id))).scalars().all()
    facts = await build_map_facts(intake.lat, intake.lng)
    return {
        "property": {"name": intake.property_name, "formatted_address": intake.formatted_address,
                     "lat": intake.lat, "lng": intake.lng},
        "rls": {
            "score": float(report.rls_score) if report and report.rls_score is not None else None,
            "band": report.band if report else None,
            "band_label": BAND_LABELS.get(report.band or "", "Data belum cukup") if report else None,
            "recommendation_label": RECOMMENDATION_LABELS[report.recommendation] if report else None,
        },
        "category_scores": {s.category: s.score for s in scores},
        **facts,
    }


@router.get("/{intake_id}/route")
async def get_check_route(
    intake_id: str,
    dest_lat: float = Query(..., ge=-90, le=90),
    dest_lng: float = Query(..., ge=-180, le=180),
    mode: str = Query("DRIVE", pattern="^(DRIVE|TWO_WHEELER|TRANSIT|WALK)$"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Street route from the property to an arbitrary point (docs/18 GAP-07).

    Backs "tap a facility, see how you actually get there". `/routes` only ever covered the
    nearest station and toll gate, so tapping a hospital or a school could show nothing
    better than a straight line — which misstates distance in a city where the road network,
    not the crow, decides the trip.

    Costs one Routes API call, so it is fetched on tap rather than bundled into `/map`.
    Returns `null` fields on failure and the caller draws no path, never a fake one.
    """
    from app.providers.gmaps import compute_route

    try:
        iid = uuid.UUID(intake_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")
    intake = (await db.execute(select(Intake).where(Intake.id == iid))).scalar_one_or_none()
    if intake is None or intake.lat is None:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")

    r = await compute_route(
        (intake.lat, intake.lng), (dest_lat, dest_lng), mode=mode, with_polyline=True,
    )
    if not r or not r.get("polyline"):
        return {"polyline": None, "duration_min": None, "distance_km": None, "mode": mode}
    return {
        "polyline": r["polyline"],
        "duration_min": r["duration_min"],
        "distance_km": r["distance_km"],
        "mode": mode,
    }


@router.get("/{intake_id}/routes")
async def get_check_routes(intake_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    """Real street routes from the property to the nearest station / toll gate (docs/14 §3).

    The map draws these instead of straight lines. Kept out of `/map` because it costs a
    Routes API call per request and the map payload is warehouse-only; a failed or disabled
    route simply returns `null` and the map falls back to the straight-line connector.
    """
    from app.providers.gmaps import compute_route
    from app.services.spatial import _nearest

    try:
        iid = uuid.UUID(intake_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")
    intake = (await db.execute(select(Intake).where(Intake.id == iid))).scalar_one_or_none()
    if intake is None or intake.lat is None:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")

    origin = (intake.lat, intake.lng)
    station = await _nearest("station", intake.lat, intake.lng, 15.0)
    toll = await _nearest("toll_gate", intake.lat, intake.lng, 25.0)

    async def _route(dest: dict | None) -> dict | None:
        if not dest:
            return None
        r = await compute_route(origin, (dest["lat"], dest["lng"]), mode="DRIVE", with_polyline=True)
        if not r or not r.get("polyline"):
            return None
        return {
            "polyline": r["polyline"],
            "distance_km": r["distance_km"],
            "duration_min": r["duration_min"],
            "mode": "DRIVE",
        }

    return {"station": await _route(station), "toll": await _route(toll)}


@router.get("/{intake_id}")
async def get_check(intake_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    try:
        iid = uuid.UUID(intake_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")
    row = (await db.execute(
        select(ResearchJob, Intake).join(Intake, ResearchJob.intake_id == Intake.id)
        .where(ResearchJob.intake_id == iid)
    )).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")
    job, intake = row

    if job.status in ("pending", "running") and _is_stale(job):
        # Research runs as an in-process asyncio task (chat_service), so it does not survive
        # the worker dying — a deploy, a Cloud Run recycle, a crash, or `--reload` picking up
        # an edit. The row is left saying "running" forever and the client polls until it
        # times out, which reads as "the API is very slow".
        #
        # Detected at read time rather than by a background reaper: no schema change, and
        # the very next poll gets a real answer instead of an endless spinner.
        job.status = "failed"
        job.error = (
            "Analisis terhenti karena server dimulai ulang di tengah proses. "
            "Silakan jalankan ulang analisis untuk lokasi ini."
        )
        job.finished_at = datetime.now(timezone.utc)
        await db.commit()
        return {"status": "failed", "error": job.error}

    if job.status in ("pending", "running"):
        # Server-owned loader progress — the FE renders these verbatim (no client faking).
        return {
            "status": job.status,
            "categories_done": job.categories_done,  # kept for back-compat
            "progress": {
                "step": max(1, job.categories_done or 1),
                "total": 5,
                "pct": job.progress_pct or 0,
                "label": job.progress_note or "Menyiapkan riset…",
            },
        }
    if job.status == "failed":
        return {"status": "failed", "error": job.error}

    report = (await db.execute(select(Report).where(Report.job_id == job.id))).scalar_one()
    findings = (await db.execute(select(Finding).where(Finding.job_id == job.id))).scalars().all()
    scores = {
        s.category: s for s in
        (await db.execute(select(CategoryScore).where(CategoryScore.job_id == job.id))).scalars()
    }

    sources = _SourceTable()
    categories = []
    # index findings as (category, position) so the flag/gap lists can reference them
    # instead of carrying a second copy of the object.
    ref_of: dict[int, dict] = {}
    for cat in CATEGORIES:
        s = scores.get(cat)
        cat_findings = [f for f in findings if f.category == cat]
        categories.append({
            "category": cat,
            "label": CATEGORY_LABELS[cat],
            "weight": WEIGHTS[cat],
            "score": s.score if s else None,
            "confidence": s.confidence if s else "perlu_validasi",
            "rationale": s.rationale if s else "",
            "findings": [_finding_json(f, sources) for f in cat_findings],
        })
        for i, f in enumerate(cat_findings):
            ref_of[id(f)] = {"category": cat, "index": i}

    return {
        "status": "done",
        "report": {
            "report_type": report.report_type,
            "property": {
                "name": intake.property_name,
                "formatted_address": intake.formatted_address,
                "lat": intake.lat, "lng": intake.lng,
                "in_jabodetabek": intake.in_jabodetabek,
            },
            "rls_score": float(report.rls_score) if report.rls_score is not None else None,
            "band": report.band,
            "band_label": BAND_LABELS.get(report.band or "", "Data belum cukup"),
            "recommendation": report.recommendation,
            "recommendation_label": RECOMMENDATION_LABELS[report.recommendation],
            "summary": report.summary,
            "categories": categories,
            # References, not copies (docs/05). The finding itself lives in `categories`.
            "red_flags": [ref_of[id(f)] for f in findings if f.is_red_flag and id(f) in ref_of],
            "evidence_gaps": [ref_of[id(f)] for f in findings
                              if f.is_evidence_gap and id(f) in ref_of],
            "sources": sources.items,
            "checklist": report.checklist,
            "disclaimer": DISCLAIMER,
            "created_at": report.created_at.isoformat(),
        },
    }
