"""OSM Overpass client for batch ingestion (docs/10). Not used at request time."""
import asyncio
import logging
from typing import Any

import httpx

log = logging.getLogger("rumper.osm")

_OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

# Jabodetabek bbox (S, W, N, E) — docs/10 §1
BBOX = (-6.95, 106.30, -5.90, 107.40)


def _bbox() -> str:
    return f"{BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]}"


# dataset kind -> overpass query body (within bbox)
QUERIES: dict[str, str] = {
    "toll_gate": f"""
        node["barrier"="toll_booth"]({_bbox()});
        node["highway"="motorway_junction"]({_bbox()});
    """,
    "station": f"""
        node["railway"="station"]({_bbox()});
        way["railway"="station"]({_bbox()});
    """,
    "hospital": f"""
        nwr["amenity"="hospital"]({_bbox()});
    """,
    "clinic": f"""
        nwr["amenity"="clinic"]({_bbox()});
    """,
    "school": f"""
        nwr["amenity"="school"]({_bbox()});
    """,
    "market": f"""
        nwr["amenity"="marketplace"]({_bbox()});
    """,
    "supermarket": f"""
        nwr["shop"="supermarket"]({_bbox()});
    """,
    "pharmacy": f"""
        nwr["amenity"="pharmacy"]({_bbox()});
    """,
    "sutet_tower": f"""
        way["power"="line"]["voltage"~"^(1[5-9]|[2-9])[0-9]{{4}}$|^[1-9][0-9]{{5,}}$"]({_bbox()});
    """,
    "landfill": f"""
        nwr["landuse"="landfill"]({_bbox()});
        nwr["amenity"~"waste_disposal|waste_transfer_station"]({_bbox()});
    """,
    "industrial": f"""
        way["landuse"="industrial"]({_bbox()});
        relation["landuse"="industrial"]({_bbox()});
    """,
    "cemetery": f"""
        nwr["landuse"="cemetery"]({_bbox()});
        nwr["amenity"="grave_yard"]({_bbox()});
    """,
    "rail_point": f"""
        way["railway"="rail"]["usage"!="industrial"]({_bbox()});
    """,
}

# kinds whose result geometry we sample as vertex points (lines/areas, not POIs)
_GEOMETRY_KINDS = {"sutet_tower", "rail_point"}
_SAMPLE_EVERY = {"sutet_tower": 2, "rail_point": 10}

# Kinds that can come back as ways/relations, i.e. areas. For these we ask Overpass for the
# full geometry and compute a true area centroid (docs/10 §5). Overpass's own `out center`
# returns the centre of the **bounding box**, which for a campus, an L-shaped complex or an
# industrial estate sits far from the site — and for a concave shape can fall outside it
# entirely. Rendered over the Google basemap (docs/14) that reads as a wrong pin. Only
# `toll_gate` is node-only, so it keeps the cheaper `out center`.
_AREA_KINDS = {
    "station", "hospital", "clinic", "school", "market", "supermarket",
    "pharmacy", "landfill", "industrial", "cemetery",
}


def _ring_centroid(ring: list[dict]) -> tuple[float, float, float] | None:
    """Area-weighted centroid of one closed ring -> (lat, lng, |area|).

    Shoelace formula in lon/lat space. Jabodetabek spans ~1 degree, so treating degrees as
    planar for a *centroid* is accurate to well under a metre — far below the error we are
    removing. Returns None for a degenerate (zero-area) ring.
    """
    pts = [(p["lon"], p["lat"]) for p in ring if "lat" in p and "lon" in p]
    if len(pts) < 3:
        return None
    if pts[0] != pts[-1]:
        pts.append(pts[0])
    a2 = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        cross = x0 * y1 - x1 * y0
        a2 += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    if abs(a2) < 1e-12:
        return None
    area = a2 / 2.0
    return cy / (6.0 * area), cx / (6.0 * area), abs(area)


def _rings(el: dict) -> list[list[dict]]:
    """Outer rings: a way carries `geometry`; a relation carries `members[].geometry`."""
    if el.get("geometry"):
        return [el["geometry"]]
    return [
        m["geometry"] for m in el.get("members", [])
        if m.get("type") == "way" and m.get("geometry")
        and m.get("role", "outer") in ("outer", "")
    ]


def _position(el: dict) -> tuple[float, float, str] | None:
    """(lat, lng, pos_source) for one element.

    `pos_source` travels into `meta` so the map inspector can state how a marker was placed
    and so we can measure how much of the warehouse still sits on a bbox centre
    (docs/10 §5). Preference: node > area centroid > vertex mean > Overpass bbox centre.
    """
    if "lat" in el and "lon" in el:
        return el["lat"], el["lon"], "osm_node"
    best: tuple[float, float, float] | None = None
    for ring in _rings(el):
        c = _ring_centroid(ring)
        if c and (best is None or c[2] > best[2]):  # largest outer ring wins
            best = c
    if best:
        return best[0], best[1], "osm_centroid"
    verts = [p for ring in _rings(el) for p in ring if "lat" in p and "lon" in p]
    if verts:  # open way / single line — geometry present but no area
        return (sum(p["lat"] for p in verts) / len(verts),
                sum(p["lon"] for p in verts) / len(verts), "osm_vertex_mean")
    if "center" in el:
        return el["center"]["lat"], el["center"]["lon"], "osm_bbox_center"
    return None

# precision over recall (docs/10): facility POIs without any usable name are dropped —
# we cite facilities by name in reports, so unnamed rows are noise. Infrastructure/area
# kinds keep unnamed rows (presence is the signal, not the label).
_REQUIRE_NAME = {"hospital", "clinic", "school", "market", "supermarket", "pharmacy"}
_NAME_FALLBACK_TAGS = ("name", "short_name", "alt_name", "ref", "operator", "brand")


def _best_name(tags: dict) -> str:
    for t in _NAME_FALLBACK_TAGS:
        if tags.get(t):
            return str(tags[t])
    return ""


async def fetch(kind: str) -> list[dict[str, Any]]:
    """Run the Overpass query for a dataset kind → [{name, lat, lng, osm_id, meta}]."""
    body = QUERIES[kind]
    # `out geom;` is body-mode, so tags come along with the geometry.
    needs_geom = kind in _GEOMETRY_KINDS or kind in _AREA_KINDS
    out_mode = "out geom;" if needs_geom else "out center tags;"
    query = f"[out:json][timeout:180];({body});{out_mode}"
    data: dict | None = None
    last_exc: Exception | None = None
    for url in _OVERPASS_URLS:
        for attempt in range(2):
            try:
                async with httpx.AsyncClient(
                    timeout=200,
                    headers={"User-Agent": "rumper-ingest/0.1 (location research; fadlysyah96@gmail.com)"},
                ) as http:
                    r = await http.post(url, data={"data": query})
                if r.status_code == 200:
                    data = r.json()
                    break
                if r.status_code in (429, 504):
                    await asyncio.sleep(15 * (attempt + 1))
                    continue
                r.raise_for_status()
            except Exception as e:  # noqa: BLE001 — try mirror next
                last_exc = e
        if data is not None:
            break
    if data is None:
        raise RuntimeError(f"overpass failed for {kind}: {last_exc}")

    features: list[dict[str, Any]] = []
    seen: set[tuple] = set()  # dedupe: OSM maps many POIs as node AND way (same spot)

    def _add(name: str, lat: float, lng: float, osm_id, meta: dict) -> None:
        if kind in _REQUIRE_NAME and not name:
            return
        key = (name.strip().lower(), round(lat, 4), round(lng, 4))  # ~11 m grid
        if key in seen:
            return
        seen.add(key)
        features.append({"name": name, "lat": lat, "lng": lng, "osm_id": osm_id, "meta": meta})

    for el in data.get("elements", []):
        tags = el.get("tags", {})
        name = _best_name(tags)
        if kind in _GEOMETRY_KINDS:
            step = _SAMPLE_EVERY[kind]
            geom = el.get("geometry") or []
            for i, pt in enumerate(geom):
                if i % step == 0:
                    _add(name or tags.get("voltage", ""), pt["lat"], pt["lon"], el.get("id"),
                         {"voltage": tags.get("voltage")} if kind == "sutet_tower" else {})
            continue
        pos = _position(el)
        if pos is None:
            continue
        lat, lng, pos_source = pos
        meta = {k: tags[k] for k in ("amenity", "landuse", "shop", "railway", "highway") if k in tags}
        meta["pos_source"] = pos_source
        _add(name, lat, lng, el.get("id"), meta)
    log.info("overpass %s: %d features (deduped)", kind, len(features))
    return features
