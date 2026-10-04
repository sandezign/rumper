"""Point lookups with Postgres cache (docs/10): InaRISK flood index + elevation profile."""
import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.config import get_settings
from app.db.session import session_factory
from app.models import PointCache

log = logging.getLogger("rumper.hazards")

_INARISK_BASES = [
    "https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_banjir/ImageServer",
    "https://gis.bnpb.go.id/arcgis/rest/services/inarisk/layer_bahaya_banjir/ImageServer",
]
_ELEVATION_URL = "https://maps.googleapis.com/maps/api/elevation/json"

_INARISK_TTL = timedelta(days=90)


async def _cache_get(kind: str, lat: float, lng: float, ttl: timedelta | None) -> dict | None:
    lat_r, lng_r = round(lat, 4), round(lng, 4)
    async with session_factory()() as db:
        row = (await db.execute(
            select(PointCache).where(
                PointCache.kind == kind, PointCache.lat_r == lat_r, PointCache.lng_r == lng_r,
            )
        )).scalar_one_or_none()
    if row is None:
        return None
    if ttl and row.fetched_at < datetime.now(timezone.utc) - ttl:
        return None
    return row.value


async def _cache_put(kind: str, lat: float, lng: float, value: dict) -> None:
    lat_r, lng_r = round(lat, 4), round(lng, 4)
    async with session_factory()() as db:
        stmt = pg_insert(PointCache).values(
            kind=kind, lat_r=lat_r, lng_r=lng_r, value=value,
        ).on_conflict_do_update(
            index_elements=["kind", "lat_r", "lng_r"],
            set_={"value": value, "fetched_at": datetime.now(timezone.utc)},
        )
        await db.execute(stmt)
        await db.commit()


async def inarisk_flood(lat: float, lng: float) -> dict[str, Any] | None:
    """InaRISK flood hazard at point → {"index": float 0..1, "class": rendah|sedang|tinggi}."""
    cached = await _cache_get("inarisk_flood", lat, lng, _INARISK_TTL)
    if cached is not None:
        return cached or None
    params = {
        "geometry": f'{{"x":{lng},"y":{lat},"spatialReference":{{"wkid":4326}}}}',
        "geometryType": "esriGeometryPoint",
        "returnGeometry": "false",
        "returnCatalogItems": "false",
        "f": "json",
    }
    value: dict | None = None
    for base in _INARISK_BASES:
        try:
            async with httpx.AsyncClient(timeout=20, verify=False) as http:
                r = await http.get(f"{base}/identify", params=params)
            if r.status_code != 200:
                continue
            raw = r.json().get("value")
            if raw in (None, "NoData", ""):
                value = {}
                break
            idx = float(raw)
            cls = "rendah" if idx < 0.333 else ("sedang" if idx < 0.666 else "tinggi")
            value = {"index": round(idx, 3), "class": cls}
            break
        except Exception as e:  # noqa: BLE001 — try next base
            log.warning("inarisk base failed: %s", e)
    if value is None:
        return None  # unreachable — do NOT cache failures
    await _cache_put("inarisk_flood", lat, lng, value)
    return value or None


async def elevation_profile(lat: float, lng: float) -> dict[str, Any] | None:
    """3x3 grid (500 m spacing) → {"elevation_m", "relative_m", "low_lying"}."""
    cached = await _cache_get("elevation", lat, lng, None)
    if cached is not None:
        return cached or None
    d = 0.0045  # ~500 m in degrees
    points = [(lat + dy * d, lng + dx * d) for dy in (-1, 0, 1) for dx in (-1, 0, 1)]
    locs = "|".join(f"{p[0]:.6f},{p[1]:.6f}" for p in points)
    try:
        async with httpx.AsyncClient(timeout=20) as http:
            r = await http.get(_ELEVATION_URL, params={
                "locations": locs, "key": get_settings().maps_api_key,
            })
        data = r.json()
        if data.get("status") != "OK":
            raise RuntimeError(data.get("status"))
        elevs = [res["elevation"] for res in data["results"]]
        center = elevs[4]
        neighbors = [e for i, e in enumerate(elevs) if i != 4]
        relative = center - sum(neighbors) / len(neighbors)
        value = {
            "elevation_m": round(center, 1),
            "relative_m": round(relative, 1),
            "low_lying": relative <= -2.0,
        }
    except Exception as e:  # noqa: BLE001
        log.warning("elevation failed: %s", e)
        return None
    await _cache_put("elevation", lat, lng, value)
    return value


async def point_hazards(lat: float, lng: float) -> dict[str, Any]:
    flood, elev = await asyncio.gather(inarisk_flood(lat, lng), elevation_profile(lat, lng))
    return {"flood": flood, "elevation": elev}
