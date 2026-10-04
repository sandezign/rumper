"""Usage ledger (docs/13) — one row per metered LLM call, nihonjung usage_events pattern."""
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class UsageEvent(Base):
    __tablename__ = "usage_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    provider: Mapped[str] = mapped_column(Text, default="gemini")
    kind: Mapped[str] = mapped_column(Text, default="llm")
    operation: Mapped[str] = mapped_column(Text)  # chat_turn|plan|search|assess|extract|compose|summary
    model: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    est_cost_usd: Mapped[Decimal] = mapped_column(Numeric(12, 6), default=0)
    meta: Mapped[dict] = mapped_column(JSONB, default=dict)  # conversation_id, job_id
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ModelPrice(Base):
    __tablename__ = "model_prices"

    model: Mapped[str] = mapped_column(Text, primary_key=True)
    input_usd_per_1m: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    output_usd_per_1m: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
