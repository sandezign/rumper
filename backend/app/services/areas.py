"""Curated areas (docs/21): corridor facts, deterministic classification, agent brief.

What is real here: commute comes from the Google Routes API, elevation and flood class from
the same cached providers the research pipeline uses, facility counts from the OSM warehouse.
What is not yet real: corridor *geometry*. Until doc 19 Wave B ingests kelurahan polygons a
corridor is a named centroid, so every aggregate below is a point reading and says so in its
`method` field. We do not pretend otherwise.
"""
import asyncio
import logging
from typing import Any

from pydantic import BaseModel, Field

from app.prompts import render
from app.providers import gmaps, hazards, llm
from app.services.spatial import _nearest, _within

log = logging.getLogger("rumper.areas")

# 8 Jabodetabek corridors (PRD-12). Centroids are the representative point of the corridor,
# not a polygon centroid — see module docstring.
CORRIDORS: list[dict[str, Any]] = [
    {"id": "bintaro-pondok-aren", "name": "Bintaro & Pondok Aren",
     "region": "Tangerang Selatan", "lat": -6.288, "lng": 106.726},
    {"id": "serpong-bsd", "name": "Serpong & BSD Fringe",
     "region": "Kab. Tangerang / Tangsel Border", "lat": -6.319, "lng": 106.663},
    {"id": "sawangan-bojongsari", "name": "Sawangan & Bojongsari",
     "region": "Kota Depok / Tangsel Border", "lat": -6.404, "lng": 106.762},
    {"id": "margonda-beji", "name": "Margonda & Beji",
     "region": "Kota Depok", "lat": -6.372, "lng": 106.827},
    {"id": "pamulang-ciputat", "name": "Pamulang & Ciputat",
     "region": "Tangerang Selatan", "lat": -6.341, "lng": 106.744},
    {"id": "cibubur-cipayung", "name": "Cibubur & Cipayung",
     "region": "Depok / Jakarta Timur Border", "lat": -6.371, "lng": 106.889},
    {"id": "bekasi-barat-kranji", "name": "Bekasi Barat & Kranji",
     "region": "Kota Bekasi", "lat": -6.238, "lng": 106.983},
    {"id": "cikarang-transit", "name": "Cikarang Transit Corridor",
     "region": "Kabupaten Bekasi", "lat": -6.261, "lng": 107.152},
]

_FACILITY_KINDS = ("hospital", "school", "market", "supermarket")
_DEFAULT_TOLERANCE_MIN = 60


# ── facts ────────────────────────────────────────────────────────────────────

async def _corridor_facts(c: dict, anchor: tuple[float, float]) -> dict[str, Any]:
    """Everything deterministic for one corridor. Every call here is real."""
    lat, lng = c["lat"], c["lng"]
    departure = gmaps.next_weekday_at_wib(0, 7)  # next Monday 07:00 WIB — the peak case

    route, elev, flood, station, toll, *fac = await asyncio.gather(
        gmaps.compute_route((lat, lng), anchor, mode="TRANSIT",
                            departure_rfc3339=departure, with_polyline=True),
        hazards.elevation_profile(lat, lng),
        hazards.inarisk_flood(lat, lng),
        _nearest("station", lat, lng, 8),
        _nearest("toll_gate", lat, lng, 8),
        *[_within(k, lat, lng, 3.0, limit=50) for k in _FACILITY_KINDS],
    )

    return {
        **{k: c[k] for k in ("id", "name", "region")},
        "centroid": {"lat": lat, "lng": lng},
        "commute": None if not route else {
            "minutes": route["duration_min"],
            "mode": "TRANSIT",
            "distance_km": route["distance_km"],
            "transfers": route.get("transfers"),
            "polyline": route.get("polyline"),
            "departure_window": "senin_07_00_wib",
        },
        "elevation": None if not elev else {
            "elevation_m": elev["elevation_m"],
            "relative_m": elev["relative_m"],
            "low_lying": elev["low_lying"],
            "method": "pembacaan titik pusat koridor (grid 3x3, jarak 500 m)",
        },
        "flood": None if not flood else {
            **flood,
            "resolution_note": "indeks bahaya regional InaRISK — bukan pengukuran per-RT",
        },
        "transit": [t for t in (
            None if not station else {"type": "krl", "label": station["name"],
                                      "distance_km": station["distance_km"],
                                      "headway_min": None},
            None if not toll else {"type": "tol", "label": toll["name"],
                                   "distance_km": toll["distance_km"],
                                   "headway_min": None},
        ) if t],
        "facilities": {k: len(v) for k, v in zip(_FACILITY_KINDS, fac)}
                      | {"nearest_station_km": station["distance_km"] if station else None},
    }


# ── classification (pure code — the agent never touches this) ─────────────────

def classify(facts: dict, tolerance_min: int, dealbreakers: set[str]) -> dict[str, Any]:
    """Category + the machine-readable reasons behind it (docs/21 §4).

    Returns `unknowns` rather than guessing whenever a required fact is missing — an area
    with no commute figure is not 'fine', it is unmeasured (PRD-11 principle 3).
    """
    unknowns: list[dict] = []
    commute = (facts.get("commute") or {}).get("minutes")
    flood_class = (facts.get("flood") or {}).get("class")
    low_lying = (facts.get("elevation") or {}).get("low_lying")

    if commute is None:
        unknowns.append({"field": "commute",
                         "text": "Rute transit ke titik aktivitas belum bisa dihitung.",
                         "suggested_action": "Cek manual di Google Maps pada jam berangkat."})
    if flood_class is None:
        unknowns.append({"field": "flood",
                         "text": "Indeks bahaya banjir belum tersedia untuk titik ini.",
                         "suggested_action": "Tanya warga soal riwayat genangan saat survei."})

    violated: list[str] = []
    if "flood_safety" in dealbreakers and (flood_class == "tinggi" or low_lying):
        violated.append("flood_safety")
    if "commute_reliability" in dealbreakers and commute is not None and commute > tolerance_min:
        violated.append("commute_reliability")

    compromises: list[str] = []
    if flood_class == "sedang":
        compromises.append("flood_safety")
    if low_lying:
        compromises.append("flood_safety")
    if commute is not None and tolerance_min < commute <= tolerance_min * 1.25:
        compromises.append("commute_reliability")

    if violated:
        category = "challenge_assumptions"
    elif commute is not None and commute > tolerance_min * 1.25:
        category = "challenge_assumptions"
    elif compromises:
        category = "interesting_tradeoff"
    elif commute is None:
        category = "interesting_tradeoff"  # unmeasured is never "strong fit"
    else:
        category = "strong_fit"

    return {"category": category, "violated": violated,
            "compromises": compromises, "unknowns": unknowns}


CATEGORY_LABEL = {
    "strong_fit": "Kesesuaian Kuat",
    "interesting_tradeoff": "Kompromi Menarik",
    "challenge_assumptions": "Opsi Alternatif",
}


# ── agent: narrative only ────────────────────────────────────────────────────

class _Reason(BaseModel):
    area_id: str
    fit: str = Field(description="1 kalimat: kenapa selaras")
    tradeoff: str = Field(description="1 kalimat: kompromi nyata")


class _BriefBatch(BaseModel):
    briefs: list[_Reason]


def _fact_sheet(f: dict, cls: dict) -> str:
    c, e, fl = f.get("commute"), f.get("elevation"), f.get("flood")
    return (
        f"- id={f['id']} | {f['name']} ({f['region']}) | kategori={cls['category']}\n"
        f"  komuter={'?' if not c else str(c['minutes']) + ' menit ' + c['mode']}"
        f" | elevasi={'?' if not e else str(e['elevation_m']) + ' mdpl'}"
        f" | banjir={'?' if not fl else fl['class']}\n"
        f"  fasilitas={f['facilities']} | stasiun_km={f['facilities'].get('nearest_station_km')}"
    )


_ALLOWED_NUM_SLACK = {"1", "2", "3"}  # ordinals in prose, not claims


def _numbers(text: str) -> set[str]:
    import re
    return {n for n in re.findall(r"\d+(?:[.,]\d+)?", text)} - _ALLOWED_NUM_SLACK


async def compose_briefs(items: list[tuple[dict, dict]]) -> dict[str, dict]:
    """One batched call for every corridor (docs/21 §6). Falls back to a deterministic
    template when the model is unavailable or breaks a guardrail — never to silence."""
    fallback = {
        f["id"]: {
            "fit": f"Kategori {CATEGORY_LABEL[cls['category']]} berdasarkan data komuter dan elevasi.",
            "tradeoff": "Rincian kompromi belum tersedia.",
        }
        for f, cls in items
    }
    try:
        prompt = render("area_brief", sheet="\n".join(_fact_sheet(f, c) for f, c in items))
        out = await llm.structured(prompt, _BriefBatch, temperature=0.4,
                                   max_output_tokens=900, thinking_budget=0)
    except Exception as e:  # noqa: BLE001 — prose is never allowed to fail the endpoint
        log.warning("area brief composition failed: %s", e)
        return fallback

    allowed = {f["id"] for f, _ in items}
    facts_by_id = {f["id"]: f for f, _ in items}
    result = dict(fallback)
    for b in out.briefs:
        if b.area_id not in allowed:
            continue  # invented an area — drop it
        # guardrail: no numeral that isn't in this corridor's own fact sheet
        sheet_nums = _numbers(_fact_sheet(facts_by_id[b.area_id],
                                          next(c for f, c in items if f["id"] == b.area_id)))
        if _numbers(b.fit + " " + b.tradeoff) - sheet_nums:
            log.warning("area brief for %s invented a number; using fallback", b.area_id)
            continue
        result[b.area_id] = {"fit": b.fit.strip(), "tradeoff": b.tradeoff.strip()}
    return result


# ── orchestration ────────────────────────────────────────────────────────────

async def build_areas(*, anchor: tuple[float, float], anchor_label: str,
                      tolerance_min: int = _DEFAULT_TOLERANCE_MIN,
                      dealbreakers: set[str] | None = None) -> dict[str, Any]:
    dealbreakers = dealbreakers or set()
    facts = await asyncio.gather(*[_corridor_facts(c, anchor) for c in CORRIDORS])
    classed = [(f, classify(f, tolerance_min, dealbreakers)) for f in facts]
    briefs = await compose_briefs(classed)

    areas = []
    for f, cls in classed:
        b = briefs[f["id"]]
        areas.append({
            **f,
            "category": cls["category"],
            "category_label": CATEGORY_LABEL[cls["category"]],
            "fit_reasons": [{"key": "overall", "text": b["fit"]}],
            "tradeoffs": [{"key": "overall", "text": b["tradeoff"]}],
            "unknowns": cls["unknowns"],
            "dealbreaker_conflicts": cls["violated"],
        })

    # Priority order: the rail, the grid and the map markers all read this list, so the
    # ordering belongs here rather than being re-derived in each view.
    ORDER = {"strong_fit": 0, "interesting_tradeoff": 1, "challenge_assumptions": 2}
    areas.sort(key=lambda a: (ORDER[a["category"]],
                              (a.get("commute") or {}).get("minutes") or 10**6))

    counts: dict[str, int] = {}
    for a in areas:
        counts[a["category"]] = counts.get(a["category"], 0) + 1

    return {
        "anchor": {"label": anchor_label, "lat": anchor[0], "lng": anchor[1]},
        "areas": areas,
        "meta": {
            "counts": counts,
            "commute_tolerance_min": tolerance_min,
            "sources": ["Google Routes API", "InaRISK BNPB", "Google Elevation",
                        "OpenStreetMap warehouse"],
            "geometry_note": ("Koridor masih diwakili titik pusat; batas wilayah kelurahan "
                              "menyusul (docs/19)."),
        },
    }
