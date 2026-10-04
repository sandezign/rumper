from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import Intake, ResearchJob
from app.providers import gmaps
from app.schemas.api import IntakeCreate, IntakeCreated
from app.services.orchestrator import run_research

router = APIRouter(prefix="/api/intakes", tags=["intakes"])


@router.post("", response_model=IntakeCreated, status_code=201)
async def create_intake(
    payload: IntakeCreate, background: BackgroundTasks, db: AsyncSession = Depends(get_db),
) -> IntakeCreated:
    query = payload.address_text
    if payload.property_name and payload.property_name.lower() not in query.lower():
        query = f"{payload.property_name}, {query}"
    geo = await gmaps.geocode_smart(query)
    if geo is None:
        raise HTTPException(
            status_code=400,
            detail="Alamat tidak dapat dipetakan. Bagikan pin Google Maps atau tulis alamat "
                   "yang lebih lengkap (nama perumahan, kecamatan, kota).",
        )
    workplace_geo = await gmaps.geocode_smart(payload.workplace_text)

    intake = Intake(
        full_name=payload.full_name,
        whatsapp=payload.whatsapp,
        property_name=payload.property_name,
        maps_link=payload.maps_link,
        address_text=payload.address_text,
        lat=geo["lat"], lng=geo["lng"],
        formatted_address=geo["formatted_address"],
        in_jabodetabek=geo["in_jabodetabek"],
        purpose=payload.purpose,
        buying_stage=payload.buying_stage,
        dp_timeline=payload.dp_timeline,
        workplace_text=payload.workplace_text,
        workplace_lat=workplace_geo["lat"] if workplace_geo else None,
        workplace_lng=workplace_geo["lng"] if workplace_geo else None,
        transport_mode=payload.transport_mode,
        concerns={"categories": payload.concerns, "notes": payload.concern_notes},
        consent_whatsapp=payload.consent_whatsapp,
        consent_privacy=payload.consent_privacy,
    )
    db.add(intake)
    await db.flush()
    job = ResearchJob(intake_id=intake.id)
    db.add(job)
    await db.commit()

    background.add_task(run_research, job.id, geo)
    return IntakeCreated(intake_id=str(intake.id))
