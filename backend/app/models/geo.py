import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Double, Index, Integer, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class GeoFeature(Base):
    __tablename__ = "geo_features"
    __table_args__ = (Index("ix_geo_features_kind_lat_lng", "kind", "lat", "lng"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kind: Mapped[str] = mapped_column(Text)  # toll_gate|station|hospital|...|sutet_tower|landfill|industrial|cemetery|rail_point
    name: Mapped[str] = mapped_column(Text, default="")
    lat: Mapped[float] = mapped_column(Double)
    lng: Mapped[float] = mapped_column(Double)
    source: Mapped[str] = mapped_column(Text, default="osm")
    osm_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    meta: Mapped[dict] = mapped_column(JSONB, default=dict)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PointCache(Base):
    __tablename__ = "point_cache"
    __table_args__ = (UniqueConstraint("kind", "lat_r", "lng_r"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kind: Mapped[str] = mapped_column(Text)  # inarisk_flood|elevation
    lat_r: Mapped[float] = mapped_column(Double)  # rounded 4dp
    lng_r: Mapped[float] = mapped_column(Double)
    value: Mapped[dict] = mapped_column(JSONB, default=dict)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, default="running")  # running|done|failed
    feature_count: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
