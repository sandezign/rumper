"""Batch geo ingestion (docs/10 §3). Weekly cadence; idempotent delete+insert per kind.

    uv run python -m app.jobs.ingest_geo                  # all datasets
    uv run python -m app.jobs.ingest_geo toll_gate school # subset
"""
import asyncio
import logging
import sys
from datetime import datetime, timezone

from sqlalchemy import delete

from app.db.session import session_factory
from app.models import GeoFeature, IngestionRun
from app.providers import osm

log = logging.getLogger("rumper.ingest")


async def ingest_kind(kind: str) -> int:
    factory = session_factory()
    async with factory() as db:
        run = IngestionRun(dataset=kind)
        db.add(run)
        await db.commit()
        run_id = run.id
    try:
        features = await osm.fetch(kind)
        async with factory() as db:
            await db.execute(delete(GeoFeature).where(GeoFeature.kind == kind))
            db.add_all([
                GeoFeature(kind=kind, name=f["name"], lat=f["lat"], lng=f["lng"],
                           osm_id=f.get("osm_id"), meta=f.get("meta", {}))
                for f in features
            ])
            run = await db.get(IngestionRun, run_id)
            run.status = "done"
            run.feature_count = len(features)
            run.finished_at = datetime.now(timezone.utc)
            await db.commit()
        return len(features)
    except Exception as e:
        log.exception("ingest %s failed", kind)
        async with factory() as db:
            run = await db.get(IngestionRun, run_id)
            run.status = "failed"
            run.error = str(e)[:500]
            run.finished_at = datetime.now(timezone.utc)
            await db.commit()
        return 0


async def main(kinds: list[str]) -> None:
    for kind in kinds:  # sequential — be polite to Overpass
        n = await ingest_kind(kind)
        print(f"{kind}: {n} features")
        await asyncio.sleep(5)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    requested = sys.argv[1:] or list(osm.QUERIES.keys())
    unknown = [k for k in requested if k not in osm.QUERIES]
    if unknown:
        sys.exit(f"unknown datasets: {unknown}; available: {list(osm.QUERIES)}")
    asyncio.run(main(requested))
