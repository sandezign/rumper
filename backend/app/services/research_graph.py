"""LangGraph deep-research workflow (docs/11): spatial_scan → plan → search ⇄ assess
(query-refinement loop) → extract → score → compose.

State carries plain dicts (Pydantic dumped) so the graph stays serializable.
"""
import asyncio
import logging
from datetime import date
from typing import TypedDict

from langgraph.config import get_stream_writer
from langgraph.graph import END, StateGraph

from app.core.config import get_settings
from app.providers import llm
from app.schemas.research import (
    AssessDraft,
    CategoryDraft,
    CategoryResult,
    Evidence,
    Finding,
    PlanDraft,
    ResearchBrief,
)
from app.core.usage import set_operation
from app.prompts import render
from app.services import composer, scoring, spatial
from app.services.researchers.base import brief_block, evidence_gap_result

GUARDRAILS = render("guardrails")

log = logging.getLogger("rumper.graph")


def _progress(phase: str, **extra) -> None:
    """Emit a live progress event for the loader (consumed by the orchestrator via
    `stream_mode="custom"` and persisted on the ResearchJob). Each node announces its
    phase at the top so the bar reflects the node that is *running*, not the one that
    just finished; `search` additionally reports per-query `done/total`. No-op outside
    a streaming run (e.g. unit tests calling the graph directly)."""
    try:
        writer = get_stream_writer()
    except Exception:  # noqa: BLE001 — not inside a graph stream context
        return
    if writer is not None:
        writer({"phase": phase, **extra})

TEXTUAL = ("banjir", "akses", "lingkungan")
MAX_GROUNDED_CALLS = 15

_GAP_ACTIONS = {
    "banjir": "Tanyakan ke minimal 2 warga/satpam riwayat banjir (kedalaman, durasi, akses "
              "tergenang) dan cek titik di inarisk.bnpb.go.id.",
    "akses": "Telusuri jalan akses via Street View lalu uji berkendara pada jam sibuk.",
    "lingkungan": "Amati radius ~1 km saat survei: industri, TPA, SUTET, rel, kebisingan; "
                  "tanyakan keamanan ke RT/RW.",
}

_CATEGORY_TOPIC = {
    "banjir": "riwayat banjir/genangan, sungai/kali terdekat, kualitas klaim bebas banjir",
    "akses": "kondisi & lebar jalan akses, single access point, kemacetan pintu masuk, koneksi tol/stasiun",
    "lingkungan": "SUTET/TPA/pabrik/rel, keluhan bau/bising/polusi, isu keamanan atau konflik lahan",
}


class ResearchState(TypedDict, total=False):
    brief: dict
    spatial: dict
    plans: dict[str, list[str]]
    notes: dict[str, list[dict]]
    iteration: int
    grounded_calls: int
    results: dict[str, dict]
    engine: dict
    summary: str
    checklist: list[dict]


def _brief(state: ResearchState) -> ResearchBrief:
    return ResearchBrief.model_validate(state["brief"])


# ---------- nodes ----------

async def spatial_scan(state: ResearchState) -> ResearchState:
    _progress("spatial_scan")
    brief = _brief(state)
    facts = await spatial.build_spatial_facts(brief)
    commute = await spatial.commute_result(brief, facts)
    fasilitas = spatial.fasilitas_result(brief, facts)
    return {
        **state,
        "spatial": facts,
        "results": {"commute": commute.model_dump(), "fasilitas": fasilitas.model_dump()},
        "notes": {c: [] for c in TEXTUAL},
        "iteration": 0,
        "grounded_calls": 0,
    }


async def plan(state: ResearchState) -> ResearchState:
    _progress("plan")
    set_operation("plan")
    brief = _brief(state)
    prompt = render("research_plan", guardrails=GUARDRAILS, brief=brief_block(brief),
                    spatial=spatial.describe_for_llm(state["spatial"]))
    draft = await llm.structured(prompt, PlanDraft, max_output_tokens=700, thinking_budget=0)
    plans = {"banjir": draft.banjir[:2], "akses": draft.akses[:2], "lingkungan": draft.lingkungan[:2]}
    for cat in TEXTUAL:  # never start a category with zero queries
        if not plans[cat]:
            plans[cat] = [f"{_CATEGORY_TOPIC[cat].split(',')[0]} {brief.property_name or brief.address_text}"]
    return {**state, "plans": plans}


async def search(state: ResearchState) -> ResearchState:
    set_operation("search")
    budget = MAX_GROUNDED_CALLS - state["grounded_calls"]
    tasks: list[tuple[str, str]] = []
    for cat in TEXTUAL:
        for q in state["plans"].get(cat, []):
            if len(tasks) < budget:
                tasks.append((cat, q))

    total = len(tasks)
    completed = 0
    _progress("search", done=0, total=total)

    async def _one(cat: str, q: str) -> tuple[str, dict]:
        nonlocal completed
        try:
            text, sources = await asyncio.wait_for(
                llm.grounded(
                    render("research_search", guardrails=GUARDRAILS, category=cat, query=q),
                    max_output_tokens=1100, thinking_budget=0,
                ),
                timeout=40,
            )
            note = {"query": q, "text": text, "sources": sources}
        except Exception as e:  # noqa: BLE001 — assess sees the gap
            log.warning("search failed (%s: %s): %s", cat, q, e)
            note = {"query": q, "text": "", "sources": []}
        completed += 1
        _progress("search", done=completed, total=total)
        return cat, note

    notes = {c: list(state["notes"].get(c, [])) for c in TEXTUAL}
    for cat, note in await asyncio.gather(*[_one(c, q) for c, q in tasks]):
        notes[cat].append(note)
    return {**state, "notes": notes,
            "grounded_calls": state["grounded_calls"] + len(tasks),
            "plans": {c: [] for c in TEXTUAL}}


async def assess(state: ResearchState) -> ResearchState:
    _progress("assess")
    set_operation("assess")
    blocks = []
    for cat in TEXTUAL:
        joined = "\n".join(
            f"- query: {n['query']}\n  hasil: {(n['text'] or '(kosong)')[:1500]}"
            for n in state["notes"][cat]
        )
        blocks.append(f"### {cat}\n{joined}")
    prompt = render("research_assess", guardrails=GUARDRAILS, blocks="\n".join(blocks))
    draft = await llm.structured(prompt, AssessDraft, max_output_tokens=700, thinking_budget=0)
    plans = {c: [] for c in TEXTUAL}
    for a in draft.assessments:
        if not a.sufficient and a.refined_queries:
            plans[a.category] = a.refined_queries[:2]
    return {**state, "plans": plans, "iteration": state["iteration"] + 1}


def route_after_search(state: ResearchState) -> str:
    """First round gets a sufficiency check; refinement-round results go straight to
    extract (extraction reads ALL notes — a second assess adds latency, not signal)."""
    return "assess" if state["iteration"] == 0 else "extract"


def route_after_assess(state: ResearchState) -> str:
    s = get_settings()
    has_pending = any(state["plans"].get(c) for c in TEXTUAL)
    if (has_pending and state["iteration"] <= s.max_refine_iterations
            and state["grounded_calls"] < MAX_GROUNDED_CALLS):
        return "search"
    return "extract"


def _seed_findings(cat: str, facts: dict) -> list[Finding]:
    """Deterministic findings from warehouse facts, added by code (not the LLM)."""
    today = date.today().isoformat()
    out: list[Finding] = []
    if cat == "banjir":
        flood = facts.get("flood")
        if flood:
            out.append(Finding(
                claim=f"Indeks bahaya banjir InaRISK BNPB untuk titik ini: {flood['index']} "
                      f"(kelas {flood['class']}).",
                evidence=[Evidence(source_title="InaRISK BNPB (layer bahaya banjir)",
                                   url="https://inarisk.bnpb.go.id", accessed_at=today, kind="inarisk")],
                confidence="data_sedang",
                limitation="Resolusi raster area, bukan per-rumah.",
                validation_action=_GAP_ACTIONS["banjir"],
                is_red_flag=flood["class"] == "tinggi",
            ))
        elev = facts.get("elevation")
        if elev:
            rel = elev["relative_m"]
            out.append(Finding(
                claim=f"Elevasi tanah ~{elev['elevation_m']} m; titik ini {abs(rel):.1f} m "
                      f"{'lebih rendah' if rel < 0 else 'lebih tinggi'} dari rata-rata sekitarnya (grid 500 m)"
                      + (" — indikasi cekungan." if elev["low_lying"] else "."),
                evidence=[Evidence(source_title="Google Elevation API (grid 3x3, 500 m)",
                                   accessed_at=today, kind="elevation_api")],
                confidence="data_kuat",
                limitation="Elevasi bukan satu-satunya penentu genangan (drainase menentukan).",
                validation_action="Saat hujan deras, amati arah aliran air di jalan akses.",
                is_red_flag=bool(elev["low_lying"]),
            ))
    if cat == "akses":
        for key, label in (("nearest_toll", "pintu tol"), ("nearest_station", "stasiun")):
            f = facts.get(key)
            if f:
                out.append(Finding(
                    claim=f"{label.capitalize()} terdekat: {f['name'] or 'tanpa nama'} ~{f['distance_km']} km.",
                    evidence=[Evidence(source_title=f"OpenStreetMap warehouse (data {f['ingested_at']})",
                                       accessed_at=today, kind="warehouse")],
                    confidence="data_kuat",
                    limitation="Jarak garis lurus, bukan waktu tempuh.",
                    validation_action="Uji rute ke akses utama pada jam sibuk.",
                ))
    if cat == "lingkungan":
        for f in facts.get("red_flag_features", []):
            out.append(Finding(
                claim=f"Terdeteksi {f['label']}: {f['name'] or 'tanpa nama'} ~{f['distance_km']} km dari titik.",
                evidence=[Evidence(source_title=f"OpenStreetMap warehouse (data {f['ingested_at']})",
                                   accessed_at=today, kind="warehouse")],
                confidence="data_sedang",
                limitation="Posisi dari peta; dampak nyata (bau/bising/medan) perlu dicek di lokasi.",
                validation_action=f"Verifikasi {f['label']} saat survei: jarak nyata dan gangguannya.",
                is_red_flag=True, is_critical=f["critical"],
            ))
    return out


async def extract(state: ResearchState) -> ResearchState:
    _progress("extract")
    set_operation("extract")
    today = date.today().isoformat()
    results = dict(state["results"])

    async def _one(cat: str) -> tuple[str, CategoryResult]:
        seeds = _seed_findings(cat, state["spatial"])
        notes = [n for n in state["notes"][cat] if n["text"]]
        # union of sources, deduped by url
        sources: list[dict] = []
        seen_urls: set[str] = set()
        for n in notes:
            for s in n["sources"]:
                if s["url"] not in seen_urls:
                    seen_urls.add(s["url"])
                    sources.append(s)
        if not notes:
            if seeds:
                return cat, CategoryResult(
                    category=cat, findings=seeds, proposed_score=None,
                    score_rationale="Hanya fakta spasial; riset web tidak menghasilkan temuan.",
                    confidence="data_sedang",
                )
            return cat, evidence_gap_result(
                cat, f"Belum ada bukti {cat} yang dapat diverifikasi dari deep research.",
                _GAP_ACTIONS[cat],
            )
        research_text = "\n\n".join(f"[query: {n['query']}]\n{n['text']}" for n in notes)
        source_list = "\n".join(f"[{i}] {s['title']}" for i, s in enumerate(sources)) or "(tidak ada)"
        prompt = render(
            "research_extract", guardrails=GUARDRAILS, category=cat,
            spatial=spatial.describe_for_llm(state["spatial"]),
            research_text=research_text[:20000], source_list=source_list,
        )
        try:
            draft = await llm.structured(prompt, CategoryDraft, max_output_tokens=2200, thinking_budget=256)
        except Exception:
            return cat, CategoryResult(
                category=cat, findings=seeds or evidence_gap_result(cat, "Ekstraksi gagal.", _GAP_ACTIONS[cat]).findings,
                proposed_score=None, score_rationale="Ekstraksi gagal — fakta spasial saja.",
                confidence="perlu_validasi",
            )
        findings = list(seeds)
        for fd in draft.findings:
            ev = [Evidence(source_title=sources[i]["title"], url=sources[i]["url"],
                           accessed_at=today, kind="grounded_search")
                  for i in fd.source_indices if 0 <= i < len(sources)]
            f = Finding(claim=fd.claim, evidence=ev, confidence=fd.confidence,
                        limitation=fd.limitation, validation_action=fd.validation_action,
                        is_red_flag=fd.is_red_flag, is_critical=fd.is_critical)
            if not f.evidence:  # doc 06 §4 floors
                f.is_evidence_gap = True
                f.confidence = "perlu_validasi"
            elif f.confidence == "data_kuat":
                f.confidence = "data_sedang"  # web evidence is area-level at best
            findings.append(f)
        order = {"data_kuat": 0, "data_sedang": 1, "perlu_validasi": 2}
        worst = max((f.confidence for f in findings), key=lambda c: order[c], default="perlu_validasi")
        return cat, CategoryResult(
            category=cat, findings=findings, proposed_score=draft.proposed_score,
            score_rationale=draft.score_rationale, confidence=worst,
        )

    for cat, res in await asyncio.gather(*[_one(c) for c in TEXTUAL]):
        results[cat] = res.model_dump()
    return {**state, "results": results}


async def score(state: ResearchState) -> ResearchState:
    _progress("score")
    results = [CategoryResult.model_validate(state["results"][c]) for c in state["results"]]
    engine = scoring.compute(results, state["spatial"], _brief(state).transport_mode)
    return {**state, "engine": {
        "category_scores": engine.category_scores,
        "rls_score": engine.rls_score, "band": engine.band,
        "recommendation": engine.recommendation,
    }, "checklist": engine.checklist}


async def compose(state: ResearchState) -> ResearchState:
    _progress("compose")
    results = [CategoryResult.model_validate(state["results"][c]) for c in state["results"]]
    engine = scoring.EngineOutput(
        category_scores=state["engine"]["category_scores"],
        rls_score=state["engine"]["rls_score"], band=state["engine"]["band"],
        recommendation=state["engine"]["recommendation"], checklist=state["checklist"],
    )
    summary = await composer.compose_summary(_brief(state), results, engine)
    return {**state, "summary": summary}


def build_graph():
    g = StateGraph(ResearchState)
    g.add_node("spatial_scan", spatial_scan)
    g.add_node("plan", plan)
    g.add_node("search", search)
    g.add_node("assess", assess)
    g.add_node("extract", extract)
    g.add_node("score", score)
    g.add_node("compose", compose)
    g.set_entry_point("spatial_scan")
    g.add_edge("spatial_scan", "plan")
    g.add_edge("plan", "search")
    g.add_conditional_edges("search", route_after_search, {"assess": "assess", "extract": "extract"})
    g.add_conditional_edges("assess", route_after_assess, {"search": "search", "extract": "extract"})
    g.add_edge("extract", "score")
    g.add_edge("score", "compose")
    g.add_edge("compose", END)
    return g.compile()


_GRAPH = None


async def graph():
    """Compiled with the Postgres checkpointer — research jobs are durable threads
    (`thread_id = job:<job_id>`), replayable for audit/debug."""
    global _GRAPH
    if _GRAPH is None:
        from app.db.checkpointer import get_checkpointer

        g = StateGraph(ResearchState)
        g.add_node("spatial_scan", spatial_scan)
        g.add_node("plan", plan)
        g.add_node("search", search)
        g.add_node("assess", assess)
        g.add_node("extract", extract)
        g.add_node("score", score)
        g.add_node("compose", compose)
        g.set_entry_point("spatial_scan")
        g.add_edge("spatial_scan", "plan")
        g.add_edge("plan", "search")
        g.add_conditional_edges("search", route_after_search, {"assess": "assess", "extract": "extract"})
        g.add_conditional_edges("assess", route_after_assess, {"search": "search", "extract": "extract"})
        g.add_edge("extract", "score")
        g.add_edge("score", "compose")
        g.add_edge("compose", END)
        _GRAPH = g.compile(checkpointer=await get_checkpointer())
    return _GRAPH
