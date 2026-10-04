"""REST contract (docs/05)."""
import re

from pydantic import BaseModel, Field, field_validator


class IntakeCreate(BaseModel):
    full_name: str = Field(min_length=1)
    whatsapp: str = Field(min_length=8)
    property_name: str | None = None
    maps_link: str | None = None
    address_text: str = Field(min_length=5)
    purpose: str | None = None
    buying_stage: str | None = None
    dp_timeline: str | None = None
    workplace_text: str = Field(min_length=3)
    transport_mode: str = Field(pattern="^(mobil|motor|krl|transjakarta|campuran)$")
    concerns: list[str] = Field(default_factory=list)
    concern_notes: str | None = None
    consent_whatsapp: bool
    consent_privacy: bool

    @field_validator("whatsapp")
    @classmethod
    def digits_only(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) < 8:
            raise ValueError("Nomor WhatsApp tidak valid")
        return digits

    @field_validator("consent_whatsapp", "consent_privacy")
    @classmethod
    def must_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Persetujuan diperlukan untuk melanjutkan")
        return v


class IntakeCreated(BaseModel):
    intake_id: str
    status: str = "pending"


class HealthResponse(BaseModel):
    status: str = "ok"
    db: bool
