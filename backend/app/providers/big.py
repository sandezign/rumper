"""Badan Informasi Geospasial (BIG) — official Indonesian administrative boundaries.

Supplies the *kelurahan/desa* polygon a property sits in, at 1:10,000 (RBI). This is the
finest real administrative geometry that exists nationally: RT/RW are neighbourhood
groupings, not mapped territories, so no polygon below this level is available to draw
(ADR-014, docs/19 §2).

Why this matters for the flood layer: InaRISK publishes a *regional* hazard index, sampled
at a point. Drawing that as a hand-made blob would invent an extent the data does not have
(ADR-015). Attaching it to the kelurahan the point falls in is the honest rendering — the
polygon is real, the index is admittedly area-level, and the label says so.

Service: https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/
         Administrasi_AR_KelDesa_10K/MapServer/0  (ArcGIS, open, no key)
"""
import logging
from datetime import timedelta
from typing import Any

import httpx

from app.providers.hazards import _cache_get, _cache_put

log = logging.getLogger("rumper.big")

_URL = (
    "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/"
    "Administrasi_AR_KelDesa_10K/MapServer/0/query"
)
# Administrative boundaries change on the order of years; a long TTL keeps a free public
# service from being hammered once per report view.
_TTL = timedelta(days=180)
# Cap the payload. Kelurahan rings run 400–3000 vertices; past ~600 the extra detail is
# invisible at the zoom the report map uses.
_MAX_VERTICES = 600


def _perpendicular_distance(pt, start, end) -> float:
    (x, y), (x1, y1), (x2, y2) = pt, start, end
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return ((x - x1) ** 2 + (y - y1) ** 2) ** 0.5
    return abs(dy * x - dx * y + x2 * y1 - y2 * x1) / ((dx * dx + dy * dy) ** 0.5)


def _simplify(points: list[list[float]], epsilon: float) -> list[list[float]]:
    """Ramer–Douglas–Peucker. Keeps the ring's shape; drops collinear filler."""
    if len(points) < 3:
        return points
    dmax, index = 0.0, 0
    for i in range(1, len(points) - 1):
        d = _perpendicular_distance(points[i], points[0], points[-1])
        if d > dmax:
            dmax, index = d, i
    if dmax <= epsilon:
        return [points[0], points[-1]]
    left = _simplify(points[: index + 1], epsilon)
    right = _simplify(points[index:], epsilon)
    return left[:-1] + right


def _thin(ring: list[list[float]], max_vertices: int = _MAX_VERTICES) -> list[list[float]]:
    """Simplify until under the vertex cap, widening tolerance geometrically.

    Starts at ~1.1 m in degrees; each pass doubles. Bounded so a pathological ring cannot
    spin here.
    """
    out = ring
    eps = 1e-5
    for _ in range(12):
        if len(out) <= max_vertices:
            break
        out = _simplify(ring, eps)
        eps *= 2
    return out


async def kelurahan_at(
    lat: float, lng: float, *, max_vertices: int = _MAX_VERTICES,
) -> dict[str, Any] | None:
    """Kelurahan/desa polygon containing the point.

    Returns {name, kecamatan, kota, provinsi, area_ha, rings: [[[lng,lat], …]], source}
    or None when BIG is unreachable or the point falls outside coverage.
    """
    cached = await _cache_get("big_kelurahan", lat, lng, _TTL)
    if cached is not None:
        if cached and max_vertices < _MAX_VERTICES:
            # Cache holds full detail; thin a copy for callers that draw at low zoom.
            return {**cached, "rings": [_thin(r, max_vertices) for r in cached["rings"]]}
        return cached or None

    params = {
        "geometry": f"{lng},{lat}",
        "geometryType": "esriGeometryPoint",
        "inSR": 4326,
        "spatialRel": "esriSpatialRelIntersects",
        "outFields": "NAMOBJ,WADMKC,WADMKK,WADMPR,LUASWH",
        "returnGeometry": "true",
        "outSR": 4326,
        "f": "json",
    }
    try:
        async with httpx.AsyncClient(timeout=25) as http:
            r = await http.get(_URL, params=params)
        data = r.json()
    except (httpx.HTTPError, ValueError) as e:
        log.warning("BIG kelurahan lookup failed: %s", e)
        return None  # not cached: a transient outage should not poison the cache

    features = data.get("features") or []
    if not features:
        # A real negative (offshore, or outside coverage) — cache it so we stop asking.
        await _cache_put("big_kelurahan", lat, lng, {})
        return None

    f = features[0]
    attrs = f.get("attributes") or {}
    rings = [_thin(ring) for ring in (f.get("geometry") or {}).get("rings", []) if ring]
    if not rings:
        await _cache_put("big_kelurahan", lat, lng, {})
        return None

    out = {
        "name": attrs.get("NAMOBJ"),
        "kecamatan": attrs.get("WADMKC"),
        "kota": attrs.get("WADMKK"),
        "provinsi": attrs.get("WADMPR"),
        "area_ha": round(attrs["LUASWH"], 1) if attrs.get("LUASWH") is not None else None,
        "rings": rings,
        "source": "BIG RBI Administrasi_AR_KelDesa_10K (1:10.000)",
    }
    await _cache_put("big_kelurahan", lat, lng, out)
    if max_vertices < _MAX_VERTICES:
        return {**out, "rings": [_thin(r, max_vertices) for r in out["rings"]]}
    return out
