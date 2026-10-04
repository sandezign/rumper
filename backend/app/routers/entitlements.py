"""Entitlement state for the current user (docs/18 GAP-11/GAP-12).

Read-only. There is no endpoint that *grants* a plan over HTTP: until Midtrans is approved
the only writer is `scripts/grant_entitlement.py`, run deliberately by an operator. A
self-serve upgrade route would be a way to give yourself a paid plan for free.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import current_user
from app.db.session import get_db
from app.models import Conversation, Entitlement, User

router = APIRouter(prefix="/api", tags=["entitlements"])

#: Free-tier location cap. Mirrors `LOCATION_LIMIT` in the frontend catalogue.
FREE_LOCATION_LIMIT = 5


@router.get("/entitlements")
async def get_entitlements(user: User = Depends(current_user),
                           db: AsyncSession = Depends(get_db)) -> dict:
    row = (await db.execute(select(Entitlement).where(
        Entitlement.user_id == user.id))).scalar_one_or_none()

    # Locations "used" is how many audits actually exist — derived, never a counter that can
    # drift from reality if a row is deleted.
    used = (await db.execute(
        select(func.count()).select_from(Conversation).where(
            Conversation.user_id == user.id, Conversation.intake_id.is_not(None))
    )).scalar_one()

    plan = row.plan if row else "free"
    extra = row.extra_locations if row else 0
    return {
        "plan": plan,
        "unlocked": plan != "free",
        "locations_used": used,
        "locations_limit": FREE_LOCATION_LIMIT + extra,
        "source": row.source if row else None,
        "granted_at": row.granted_at.isoformat() if row else None,
    }
