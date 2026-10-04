"""Flood-area geometry for the maps (docs/19 Wave A).

Answers "which real polygon do we draw for flood risk?". Not a hand-drawn blob: the
kelurahan boundary from BIG (1:10,000), carrying the InaRISK *regional* hazard index
sampled at the property point. Both facts travel together so the UI can label the polygon
for what it is — a real administrative boundary tinted by an area-level index, never a
measured flood extent (ADR-015).
"""
import asyncio
import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from app.core.auth import current_user
from app.db.session import get_db
from app.models import Conversation, GeoFeature, Intake, Report, ResearchJob, User
from app.providers.big import kelurahan_at
from app.providers.hazards import inarisk_flood

log = logging.getLogger("rumper.hazard")

router = APIRouter(prefix="/api/hazard", tags=["hazard"])

_SOURCES = ["BIG RBI Administrasi_AR_KelDesa_10K", "InaRISK BNPB"]
# Said once, here, so every caller renders the same caveat.
_DISCLAIMER = (
    "Batas wilayah kelurahan (BIG, 1:10.000). Indeks bahaya banjir InaRISK bersifat "
    "regional dan diambil di satu titik — bukan pengukuran genangan per-RT."
)


async def _flood_area(intake: Intake) -> dict | None:
    """Boundary + hazard index for one analysed location."""
    boundary, flood = await asyncio.gather(
        kelurahan_at(intake.lat, intake.lng),
        inarisk_flood(intake.lat, intake.lng),
        return_exceptions=True,
    )
    if isinstance(boundary, BaseException) or not boundary:
        return None  # no real geometry → draw nothing, rather than approximate one
    if isinstance(flood, BaseException):
        flood = None
    return {
        "id": str(intake.id),
        "intake_id": str(intake.id),
        "label": intake.property_name or intake.formatted_address,
        "region": None,
        "point": {"lat": intake.lat, "lng": intake.lng},
        "boundary": boundary,
        "flood": flood,
        "disclaimer": _DISCLAIMER,
    }


def _from_warehouse(f: GeoFeature) -> dict:
    m = f.meta or {}
    return {
        "id": m.get("corridor_id") or str(f.id),
        "intake_id": None,
        "label": f.name,
        "region": m.get("region"),
        "point": {"lat": f.lat, "lng": f.lng},
        "boundary": {
            "name": f.name, "kecamatan": m.get("kecamatan"), "kota": m.get("kota"),
            "provinsi": m.get("provinsi"), "area_ha": m.get("area_ha"),
            "rings": m.get("rings") or [], "source": m.get("boundary_source", "BIG RBI"),
        },
        "flood": m.get("flood"),
        "disclaimer": _DISCLAIMER,
    }


@router.get("/flood-areas")
async def flood_areas(
    intake_id: str | None = Query(None, description="Limit to one location"),
    user: User = Depends(current_user),
    db=Depends(get_db),
) -> dict:
    """Flood polygons.

    Without `intake_id`: the **pre-ingested corridor boundaries** from the geo warehouse
    (`make ingest-boundaries`, weekly). Served from rows, not live calls — kelurahan
    borders move on the order of years and InaRISK is a published model, not a live feed,
    so fetching either per request buys only latency. This is also why the areas map has
    polygons before anyone has run a single analysis.

    With `intake_id`: the boundary for that one analysed property, looked up live (cached
    180 days) because a property point is arbitrary and cannot be pre-ingested.
    """
    if not intake_id:
        rows = (await db.execute(
            select(GeoFeature).where(GeoFeature.kind == "kelurahan")
        )).scalars().all()
        return {
            "areas": [_from_warehouse(f) for f in rows],
            "sources": _SOURCES,
            "freshness": "warehouse",
        }

    # Intakes carry no owner column — ownership runs through the conversation that created
    # them, which is also what scopes every other read of this data.
    q = (
        select(Intake)
        .join(ResearchJob, ResearchJob.intake_id == Intake.id)
        .join(Report, Report.job_id == ResearchJob.id)
        .join(Conversation, Conversation.intake_id == Intake.id)
        .where(
            Conversation.user_id == user.id,
            Intake.lat.is_not(None),
            Intake.lng.is_not(None),
        )
    )
    if intake_id:
        q = q.where(Intake.id == intake_id)
    intakes = (await db.execute(q)).scalars().unique().all()

    results = await asyncio.gather(*(_flood_area(i) for i in intakes))
    areas = [a for a in results if a]
    return {"areas": areas, "sources": _SOURCES, "freshness": "live"}
