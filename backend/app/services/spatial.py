"""SpatialFacts builder (docs/10 §4): deterministic facts from the geo warehouse +
point caches. Also produces the deterministic CategoryResults (commute, fasilitas)
and seed findings/baselines for the textual categories."""
import asyncio
from datetime import date
from typing import Any

from sqlalchemy import select

from app.db.session import session_factory
from app.models import GeoFeature
from app.providers import hazards
from app.providers.gmaps import haversine_km
from app.schemas.research import CategoryResult, Evidence, Finding, ResearchBrief

_RED_FLAG_RULES = [
    # (kind, label, search_radius_km, flag_radius_km, critical_radius_km)
    ("sutet_tower", "jalur SUTET (listrik tegangan tinggi)", 1.0, 0.25, 0.25),
    ("landfill", "TPA/pengolahan sampah", 3.0, 1.5, 1.0),
    ("industrial", "kawasan industri", 2.0, 1.0, None),
    ("cemetery", "pemakaman", 1.0, 0.3, None),
    ("rail_point", "rel kereta aktif", 1.0, 0.2, None),
]

_FACILITY_KINDS = ["hospital", "clinic", "pharmacy", "school", "market", "supermarket", "station"]


async def _nearest(kind: str, lat: float, lng: float, radius_km: float) -> dict | None:
    rows = await _within(kind, lat, lng, radius_km, limit=1)
    return rows[0] if rows else None


async def _within(kind: str, lat: float, lng: float, radius_km: float, limit: int = 5) -> list[dict]:
    deg = radius_km / 111.0
    async with session_factory()() as db:
        rows = (await db.execute(
            select(GeoFeature).where(
                GeoFeature.kind == kind,
                GeoFeature.lat.between(lat - deg, lat + deg),
                GeoFeature.lng.between(lng - deg, lng + deg),
            )
        )).scalars().all()
    out = [
        {"name": r.name, "kind": kind, "lat": r.lat, "lng": r.lng,
         "distance_km": round(haversine_km(lat, lng, r.lat, r.lng), 2),
         "ingested_at": r.ingested_at.date().isoformat(),
         # how this coordinate was placed (docs/10 §5). Rows ingested before the centroid
         # fix carry no marker → "osm_legacy", which the map treats as low-precision.
         "pos_source": (r.meta or {}).get("pos_source", "osm_legacy")}
        for r in rows
    ]
    out = [o for o in out if o["distance_km"] <= radius_km]
    out.sort(key=lambda x: x["distance_km"])
    return out[:limit]


async def build_spatial_facts(brief: ResearchBrief) -> dict[str, Any]:
    """One deterministic fact sheet per intake point."""
    lat, lng = brief.lat, brief.lng
    if lat is None or lng is None:
        return {}

    hazard_task = hazards.point_hazards(lat, lng)
    toll_task = _nearest("toll_gate", lat, lng, 25.0)
    station_task = _nearest("station", lat, lng, 15.0)
    fac_tasks = {k: _nearest(k, lat, lng, 10.0) for k in _FACILITY_KINDS if k != "station"}
    flags_tasks = {kind: _within(kind, lat, lng, search_km, limit=3)
                   for kind, _, search_km, _, _ in _RED_FLAG_RULES}

    hazard, toll, station = await asyncio.gather(hazard_task, toll_task, station_task)
    facilities = dict(zip(fac_tasks.keys(), await asyncio.gather(*fac_tasks.values())))
    flags_raw = dict(zip(flags_tasks.keys(), await asyncio.gather(*flags_tasks.values())))

    red_flag_features = []
    for kind, label, _search, flag_km, critical_km in _RED_FLAG_RULES:
        for f in flags_raw.get(kind, []):
            if f["distance_km"] <= flag_km:
                red_flag_features.append({
                    **f, "label": label,
                    "critical": critical_km is not None and f["distance_km"] <= critical_km,
                })

    return {
        "flood": hazard.get("flood"),
        "elevation": hazard.get("elevation"),
        "nearest_toll": toll,
        "nearest_station": station,
        "facilities": facilities,
        "red_flag_features": red_flag_features,
    }


def describe_for_llm(spatial: dict[str, Any]) -> str:
    """Compact id-ID summary of SpatialFacts for plan/extract prompts."""
    lines = []
    flood = spatial.get("flood")
    if flood:
        lines.append(f"InaRISK indeks bahaya banjir: {flood['index']} (kelas {flood['class']})")
    elev = spatial.get("elevation")
    if elev:
        rel = elev["relative_m"]
        lines.append(
            f"Elevasi tanah ~{elev['elevation_m']} m; {abs(rel):.1f} m "
            f"{'lebih rendah' if rel < 0 else 'lebih tinggi'} dari rata-rata sekitar 500 m"
            + (" (cekungan/dataran rendah)" if elev["low_lying"] else "")
        )
    toll = spatial.get("nearest_toll")
    if toll:
        lines.append(f"Pintu tol terdekat: {toll['name'] or 'tanpa nama'} ~{toll['distance_km']} km")
    station = spatial.get("nearest_station")
    if station:
        lines.append(f"Stasiun terdekat: {station['name'] or 'tanpa nama'} ~{station['distance_km']} km")
    for f in spatial.get("red_flag_features", []):
        lines.append(f"Terdeteksi {f['label']}: {f['name'] or 'tanpa nama'} ~{f['distance_km']} km"
                     + (" [KRITIS]" if f["critical"] else ""))
    fac = spatial.get("facilities") or {}
    have = [f"{k} {v['distance_km']} km" for k, v in fac.items() if v]
    if have:
        lines.append("Fasilitas (warehouse OSM): " + ", ".join(have))
    return "\n".join(lines) if lines else "(belum ada data spasial untuk titik ini)"


async def build_map_facts(lat: float, lng: float) -> dict[str, Any]:
    """Richer variant for the map panel (docs/14): more features, wider radii."""
    hazard_task = hazards.point_hazards(lat, lng)
    toll_task = _nearest("toll_gate", lat, lng, 25.0)
    station_task = _nearest("station", lat, lng, 15.0)
    fac_kinds = ["hospital", "clinic", "pharmacy", "school", "market", "supermarket"]
    fac_tasks = {k: _within(k, lat, lng, 5.0, limit=8) for k in fac_kinds}
    flags_tasks = {kind: _within(kind, lat, lng, 3.0, limit=6)
                   for kind, _, _, _, _ in _RED_FLAG_RULES}
    hazard, toll, station = await asyncio.gather(hazard_task, toll_task, station_task)
    facilities_by_kind = dict(zip(fac_tasks.keys(), await asyncio.gather(*fac_tasks.values())))
    flags_raw = dict(zip(flags_tasks.keys(), await asyncio.gather(*flags_tasks.values())))

    facilities = [f for fs in facilities_by_kind.values() for f in fs]
    red_flags = []
    for kind, label, _search, flag_km, critical_km in _RED_FLAG_RULES:
        for f in flags_raw.get(kind, []):
            red_flags.append({
                **f, "label": label,
                "critical": critical_km is not None and f["distance_km"] <= critical_km,
            })
    return {
        "flood": hazard.get("flood"),
        "elevation": hazard.get("elevation"),
        "nearest_toll": toll,
        "nearest_station": station,
        "facilities": facilities,
        "red_flags": red_flags,
    }


# ---- deterministic category results ----

def _ev(title: str, date_str: str | None = None) -> list[Evidence]:
    return [Evidence(source_title=title, accessed_at=date.today().isoformat(),
                     published_at=date_str, kind="warehouse")]


def fasilitas_result(brief: ResearchBrief, spatial: dict[str, Any]) -> CategoryResult:
    fac = spatial.get("facilities") or {}
    if not any(fac.values()):
        return CategoryResult(
            category="fasilitas",
            findings=[Finding(
                claim="Data fasilitas untuk area ini belum tersedia di warehouse.",
                confidence="perlu_validasi",
                limitation="Cakupan OSM area ini mungkin tipis.",
                validation_action="Cek langsung fasilitas esensial terdekat saat survei.",
                is_evidence_gap=True,
            )],
            proposed_score=None, score_rationale="Evidence gap.", confidence="perlu_validasi",
        )
    score = 100
    findings: list[Finding] = []
    family = (brief.purpose or "").startswith("tinggal_keluarga")
    transit = brief.transport_mode in ("krl", "campuran")
    checks = [
        ("hospital", "RS", 5.0, 25, True), ("clinic", "klinik", 3.0, 0, True),
        ("pharmacy", "apotek", 3.0, 15, True),
        ("market", "pasar", 3.0, 0, True), ("supermarket", "supermarket", 3.0, 15, True),
        ("school", "sekolah", 3.0, 15, family),
    ]
    market_found = False
    for kind, label, max_km, penalty, relevant in checks:
        if not relevant:
            continue
        f = fac.get(kind)
        if f and f["distance_km"] <= max_km:
            if kind in ("market", "supermarket"):
                if market_found:
                    continue
                market_found = True
            findings.append(Finding(
                claim=f"{label.capitalize()} terdekat: {f['name'] or 'tanpa nama'} (~{f['distance_km']} km).",
                evidence=_ev(f"OpenStreetMap warehouse (data {f['ingested_at']})"),
                confidence="data_kuat",
                limitation="Keberadaan fasilitas tidak sama dengan kualitasnya.",
                validation_action="Kunjungi fasilitas yang penting bagi Anda saat survei.",
            ))
        elif penalty:
            if kind == "supermarket" and market_found:
                continue
            score -= penalty
            findings.append(Finding(
                claim=f"Tidak ditemukan {label} dalam ~{max_km:g} km di data warehouse.",
                evidence=_ev("OpenStreetMap warehouse"),
                confidence="data_sedang",
                limitation="Data OSM Indonesia bisa tidak lengkap.",
                validation_action=f"Pastikan {label} terdekat saat survei.",
            ))
    nearest_station = spatial.get("nearest_station")
    if transit:
        if nearest_station and nearest_station["distance_km"] <= 8:
            findings.append(Finding(
                claim=f"Stasiun terdekat {nearest_station['name']} ~{nearest_station['distance_km']} km.",
                evidence=_ev("OpenStreetMap warehouse"), confidence="data_kuat",
                limitation="Akses first-mile ke stasiun perlu diuji.",
                validation_action="Uji perjalanan rumah→stasiun pada jam berangkat.",
            ))
        else:
            score -= 10
    return CategoryResult(
        category="fasilitas", findings=findings,
        proposed_score=max(0, min(100, score)),
        score_rationale="Skor deterministik dari cakupan fasilitas warehouse OSM.",
        confidence="data_kuat",
    )


async def commute_result(brief: ResearchBrief, spatial: dict[str, Any]) -> CategoryResult:
    """Routes API is inherently realtime — reuse v1 logic, enriched with toll context."""
    from app.services.researchers.commute import run as commute_run
    result = await commute_run(brief)
    toll = spatial.get("nearest_toll")
    if toll and brief.transport_mode in ("mobil", "campuran"):
        result.findings.append(Finding(
            claim=f"Akses tol terdekat: {toll['name'] or 'gerbang tol'} ~{toll['distance_km']} km dari rumah.",
            evidence=_ev(f"OpenStreetMap warehouse (data {toll['ingested_at']})"),
            confidence="data_kuat",
            limitation="Jarak garis lurus; waktu tempuh ke gerbang perlu diuji.",
            validation_action="Uji waktu rumah→gerbang tol pada jam sibuk.",
        ))
    return result
