"""Per-user commercial entitlement (docs/18 GAP-12).

One row per user, created on first grant. Absent row = free trial, which is the honest
default: no row is ever written speculatively, so "has a plan" and "row exists" mean the
same thing.

`source` records *how* the plan was granted. Until Midtrans is live the only value in use is
`manual_grant`, written by `scripts/grant_entitlement.py` — so a plan that was injected by
hand can always be told apart from one somebody paid for.
"""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base

#: Pass keys shared with the frontend catalogue (`lib/entitlements.ts`).
PLANS = ("free", "single", "bundle", "analyst")

#: Extra location quota each pass bundles, on top of the free cap.
PLAN_EXTRA_LOCATIONS = {"free": 0, "single": 0, "bundle": 3, "analyst": 3}


class Entitlement(Base):
    __tablename__ = "entitlements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    plan: Mapped[str] = mapped_column(Text, default="free")
    #: Bundled quota, denormalised at grant time so changing the catalogue later cannot
    #: silently take capacity away from someone who already has it.
    extra_locations: Mapped[int] = mapped_column(Integer, default=0)
    #: "manual_grant" | "midtrans" — never inferred.
    source: Mapped[str] = mapped_column(Text, default="manual_grant")
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())
