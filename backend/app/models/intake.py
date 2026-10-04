import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Double, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Intake(Base):
    __tablename__ = "intakes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(Text)
    whatsapp: Mapped[str] = mapped_column(Text)  # PII — never logged
    property_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    maps_link: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_text: Mapped[str] = mapped_column(Text)
    lat: Mapped[float | None] = mapped_column(Double, nullable=True)
    lng: Mapped[float | None] = mapped_column(Double, nullable=True)
    formatted_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    in_jabodetabek: Mapped[bool] = mapped_column(Boolean, default=True)
    purpose: Mapped[str | None] = mapped_column(Text, nullable=True)
    buying_stage: Mapped[str | None] = mapped_column(Text, nullable=True)
    dp_timeline: Mapped[str | None] = mapped_column(Text, nullable=True)
    workplace_text: Mapped[str] = mapped_column(Text)
    workplace_lat: Mapped[float | None] = mapped_column(Double, nullable=True)
    workplace_lng: Mapped[float | None] = mapped_column(Double, nullable=True)
    transport_mode: Mapped[str] = mapped_column(Text)
    concerns: Mapped[dict] = mapped_column(JSONB, default=dict)
    consent_whatsapp: Mapped[bool] = mapped_column(Boolean)
    consent_privacy: Mapped[bool] = mapped_column(Boolean)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
