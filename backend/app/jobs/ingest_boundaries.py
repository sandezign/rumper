"""Weekly ingestion of kelurahan boundaries + flood index (docs/10 §3, docs/19 Wave A).

Administrative boundaries change on the order of years and InaRISK's hazard index is a
published regional model, not a live feed. Fetching either per request buys nothing but
latency and rate-limit exposure — so both land in the geo warehouse on the same weekly
cadence as the OSM datasets, and the API reads rows instead of calling out.

Stored as `geo_features(kind="kelurahan")`: lat/lng is the polygon's own centroid, `meta`
carries the ring geometry, the admin names, and the flood reading sampled at the corridor
point that found it.

    make ingest-boundaries
"""
import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import delete

from app.db.session import session_factory
from app.models import GeoFeature, IngestionRun
from app.providers.big import kelurahan_at
from app.providers.hazards import inarisk_flood
from app.services.areas import CORRIDORS

log = logging.getLogger("rumper.ingest.boundaries")

KIND = "kelurahan"
OVERVIEW_VERTICES = 160


def _centroid(ring: list[list[float]]) -> tuple[float, float]:
    """Area-weighted (shoelace) centroid — not the bbox centre, which drifts badly on the
    long thin kelurahan that follow a river or a road."""
    a = cx = cy = 0.0
    for i in range(len(ring) - 1):
        x0, y0 = ring[i]
        x1, y1 = ring[i + 1]
        cross = x0 * y1 - x1 * y0
        a += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    if a == 0:  # degenerate — fall back to the vertex mean
        return (sum(p[1] for p in ring) / len(ring), sum(p[0] for p in ring) / len(ring))
    a *= 0.5
    return (cy / (6 * a), cx / (6 * a))


async def _one(corridor: dict) -> dict | None:
    lat, lng = corridor["lat"], corridor["lng"]
    boundary, flood = await asyncio.gather(
        # The corridor map draws at z11 where 500 vertices is invisible detail; the
        # workspace fetches full precision live for the single property it shows.
        kelurahan_at(lat, lng, max_vertices=OVERVIEW_VERTICES),
        inarisk_flood(lat, lng),
        return_exceptions=True,
    )
    if isinstance(boundary, BaseException) or not boundary:
        log.warning("no boundary for corridor %s", corridor["id"])
        return None
    if isinstance(flood, BaseException):
        flood = None
    clat, clng = _centroid(boundary["rings"][0])
    return {
        "name": boundary["name"] or corridor["name"],
        "lat": clat,
        "lng": clng,
        "meta": {
            "corridor_id": corridor["id"],
            "corridor_name": corridor["name"],
            "region": corridor["region"],
            # The point the hazard index was sampled at — kept so the reading is traceable
            # and never mistaken for a whole-polygon measurement.
            "sampled_at": {"lat": lat, "lng": lng},
            "kecamatan": boundary["kecamatan"],
            "kota": boundary["kota"],
            "provinsi": boundary["provinsi"],
            "area_ha": boundary["area_ha"],
            "rings": boundary["rings"],
            "flood": flood,
            "boundary_source": boundary["source"],
        },
    }


async def main() -> None:
    factory = session_factory()
    async with factory() as db:
        run = IngestionRun(dataset=KIND)
        db.add(run)
        await db.commit()
        run_id = run.id
    try:
        # Sequential: BIG is a free public service, and 8 corridors is not worth a burst.
        rows = []
        for c in CORRIDORS:
            r = await _one(c)
            if r:
                rows.append(r)
            print(f"  {c['id']:<24} {'ok — ' + r['name'] if r else 'no polygon'}")

        async with factory() as db:
            await db.execute(delete(GeoFeature).where(GeoFeature.kind == KIND))
            db.add_all([
                GeoFeature(kind=KIND, name=r["name"], lat=r["lat"], lng=r["lng"],
                           source="big", meta=r["meta"])
                for r in rows
            ])
            run = await db.get(IngestionRun, run_id)
            run.status = "done"
            run.feature_count = len(rows)
            run.finished_at = datetime.now(timezone.utc)
            await db.commit()
        print(f"\n{KIND}: {len(rows)} boundaries ingested")
    except Exception as e:
        log.exception("ingest %s failed", KIND)
        async with factory() as db:
            run = await db.get(IngestionRun, run_id)
            run.status = "failed"
            run.error = str(e)[:500]
            run.finished_at = datetime.now(timezone.utc)
            await db.commit()
        raise


if __name__ == "__main__":
    asyncio.run(main())
