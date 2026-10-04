"""STD-SCR-001 deterministic engine (docs/07). Pure functions — no LLM, reproducible."""
from dataclasses import dataclass

from app.schemas.research import CategoryResult

WEIGHTS = {"banjir": 0.30, "commute": 0.25, "akses": 0.15, "fasilitas": 0.15, "lingkungan": 0.15}

BAND_LABELS = {
    "relatif_kuat": "Relatif kuat",
    "layak_dengan_catatan": "Layak dengan catatan",
    "hati_hati": "Hati-hati",
    "risiko_tinggi": "Risiko tinggi / perlu validasi kuat",
}

RECOMMENDATION_LABELS = {
    "proceed": "Lanjutkan dengan catatan standar",
    "proceed_with_caution": "Lanjutkan dengan catatan",
    "verify_further": "Validasi lebih lanjut sebelum memutuskan",
    "avoid_until_resolved": "Tunda sampai risiko utama terjawab",
}

DISCLAIMER = (
    "Mini Check ini adalah opini kedua awal berdasarkan sinyal lokasi yang tersedia dan "
    "belum ditinjau analis. Ini bukan jaminan bahwa lokasi aman, bebas banjir, atau sesuai. "
    "Lakukan survei fisik dan validasi temuan material sebelum membayar booking fee atau DP."
)


@dataclass
class EngineOutput:
    category_scores: dict[str, int | None]  # post-clamp
    rls_score: float | None
    band: str | None
    recommendation: str
    checklist: list[dict]


def spatial_baseline(category: str, spatial: dict, transport_mode: str) -> int | None:
    """Deterministic baselines from warehouse facts (docs/07 §3 v2)."""
    if not spatial:
        return None
    if category == "banjir":
        flood = spatial.get("flood")
        if not flood:
            return None
        base = {"rendah": 80, "sedang": 55, "tinggi": 30}[flood["class"]]
        elev = spatial.get("elevation")
        if elev:
            if elev["low_lying"]:
                base -= 10
            elif elev["elevation_m"] >= 25:
                base += 5
        return max(0, min(100, base))
    if category == "akses":
        toll, station = spatial.get("nearest_toll"), spatial.get("nearest_station")
        if not toll and not station:
            return None
        base = 70
        if toll:
            if toll["distance_km"] <= 5:
                base += 10
            elif toll["distance_km"] > 15:
                base -= 10
        if station and transport_mode in ("krl", "campuran"):
            if station["distance_km"] <= 3:
                base += 10
            elif station["distance_km"] > 8:
                base -= 5
        return max(0, min(100, base))
    if category == "lingkungan":
        base = 85
        penalties = {"sutet_tower": 40, "landfill": 30, "industrial": 15,
                     "rail_point": 10, "cemetery": 5}
        seen: set[str] = set()
        for f in spatial.get("red_flag_features", []):
            if f["kind"] not in seen:
                seen.add(f["kind"])
                base -= penalties.get(f["kind"], 10)
        return max(0, min(100, base))
    return None


def clamp_category(result: CategoryResult, baseline: int | None) -> int | None:
    """Baseline band first, then the v1 rubric clamps (docs/07 §3)."""
    if result.category in ("commute", "fasilitas"):
        return result.proposed_score  # deterministic researchers compute their own score
    if result.proposed_score is None and baseline is None:
        return None
    if baseline is not None:
        proposal = result.proposed_score if result.proposed_score is not None else baseline
        score = max(baseline - 15, min(baseline + 15, proposal))
    else:
        score = max(0, min(100, result.proposed_score))
    if any(f.is_critical for f in result.findings):
        return min(score, 24)
    if any(f.is_red_flag for f in result.findings):
        score = min(score, 64)
    if result.confidence == "perlu_validasi" and baseline is None:
        score = max(40, min(75, score))
    return max(0, min(100, score))


def compute(results: list[CategoryResult], spatial: dict | None = None,
            transport_mode: str = "") -> EngineOutput:
    spatial = spatial or {}
    scores: dict[str, int | None] = {}
    for r in results:
        baseline = spatial_baseline(r.category, spatial, transport_mode)
        scores[r.category] = clamp_category(r, baseline)

    scored = {c: s for c, s in scores.items() if s is not None}
    rls: float | None = None
    if len(scored) >= 3:
        total_w = sum(WEIGHTS[c] for c in scored)
        rls = round(sum(s * WEIGHTS[c] for c, s in scored.items()) / total_w, 2)

    band = None
    if rls is not None:
        band = ("relatif_kuat" if rls >= 80 else
                "layak_dengan_catatan" if rls >= 65 else
                "hati_hati" if rls >= 50 else "risiko_tinggi")

    all_findings = [f for r in results for f in r.findings]
    critical = [f for f in all_findings if f.is_critical]
    red_flags = [f for f in all_findings if f.is_red_flag]
    has_gap_in_core = any(
        s is None for c, s in scores.items() if c in ("banjir", "commute")
    )

    if rls is None:
        rec = "verify_further"
    elif rls >= 80 and not red_flags and not has_gap_in_core:
        rec = "proceed"
    elif rls >= 65:
        rec = "proceed_with_caution"
    elif rls >= 50:
        rec = "verify_further"
    else:
        rec = "avoid_until_resolved"

    if critical:
        # red-flag override (STD-SCR-001 §7): floor at verify_further
        if rec in ("proceed", "proceed_with_caution"):
            rec = "verify_further"
        if rls is not None and (rls < 50 or len(critical) >= 2):
            rec = "avoid_until_resolved"

    checklist = []
    seen = set()
    for r in results:
        for f in r.findings:
            needs_action = f.is_red_flag or f.is_evidence_gap or f.confidence == "perlu_validasi"
            if needs_action and f.validation_action and f.validation_action not in seen:
                seen.add(f.validation_action)
                checklist.append({
                    "item": f.validation_action,
                    "category": r.category,
                    "reason": f.claim,
                })

    return EngineOutput(
        category_scores=scores, rls_score=rls, band=band,
        recommendation=rec, checklist=checklist,
    )
