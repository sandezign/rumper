"""Curated areas endpoint (docs/21 §3)."""
from fastapi import APIRouter, Depends, Query

from app.core.auth import current_user
from app.models import User
from app.services import areas as areas_svc

router = APIRouter(prefix="/api/areas", tags=["areas"])


@router.get("")
async def list_areas(
    anchor_lat: float = Query(..., ge=-90, le=90),
    anchor_lng: float = Query(..., ge=-180, le=180),
    # Places descriptions are full formatted addresses (well over 120 chars). The label is
    # display-only, so it is truncated rather than allowed to fail the request.
    anchor_label: str = Query("Titik aktivitas", max_length=300),
    tolerance_min: int = Query(60, ge=10, le=240),
    dealbreakers: str = Query("", max_length=200),
    user: User = Depends(current_user),
) -> dict:
    """Corridors scored against *this* buyer's anchor.

    The anchor arrives as a query parameter because the Buyer Priority Profile still lives
    client-side (docs/18 GAP-01 is only partly done). When `GET /api/profile` lands this
    reads the confirmed profile server-side instead and the params become optional.
    """
    keys = {d.strip() for d in dealbreakers.split(",") if d.strip()}
    return await areas_svc.build_areas(
        anchor=(anchor_lat, anchor_lng),
        anchor_label=anchor_label[:80],
        tolerance_min=tolerance_min,
        dealbreakers=keys,
    )
