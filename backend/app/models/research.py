import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ResearchJob(Base):
    __tablename__ = "research_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intake_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("intakes.id"), unique=True)
    status: Mapped[str] = mapped_column(Text, default="pending")  # pending|running|done|failed
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    categories_done: Mapped[int] = mapped_column(Integer, default=0)  # coarse 1..5 step (named loader steps)
    progress_pct: Mapped[int] = mapped_column(Integer, default=0, server_default="0")  # 0..100 bar
    progress_note: Mapped[str | None] = mapped_column(Text, nullable=True)  # live id-ID label
    trace_id: Mapped[str | None] = mapped_column(Text, nullable=True)  # LangSmith run id
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("research_jobs.id"))
    category: Mapped[str] = mapped_column(Text)  # banjir|commute|akses|fasilitas|lingkungan
    claim: Mapped[str] = mapped_column(Text)
    evidence: Mapped[list] = mapped_column(JSONB, default=list)
    confidence: Mapped[str] = mapped_column(Text)  # data_kuat|data_sedang|perlu_validasi
    limitation: Mapped[str] = mapped_column(Text, default="")
    validation_action: Mapped[str] = mapped_column(Text, default="")
    is_red_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    is_critical: Mapped[bool] = mapped_column(Boolean, default=False)
    is_evidence_gap: Mapped[bool] = mapped_column(Boolean, default=False)


class CategoryScore(Base):
    __tablename__ = "category_scores"
    __table_args__ = (UniqueConstraint("job_id", "category"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("research_jobs.id"))
    category: Mapped[str] = mapped_column(Text)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    proposed_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    confidence: Mapped[str] = mapped_column(Text)
    rationale: Mapped[str] = mapped_column(Text, default="")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("research_jobs.id"), unique=True)
    report_type: Mapped[str] = mapped_column(Text, default="mini_check_preliminary")
    rls_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    band: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendation: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text, default="")
    checklist: Mapped[list] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
