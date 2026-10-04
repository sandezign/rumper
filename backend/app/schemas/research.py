"""Agent IO schemas (docs/06). Draft* variants are what the LLM is allowed to return:
it references sources by index — code resolves URLs so the model can never fabricate them."""
from typing import Literal

from pydantic import BaseModel, Field

Confidence = Literal["data_kuat", "data_sedang", "perlu_validasi"]

CATEGORIES = ("banjir", "commute", "akses", "fasilitas", "lingkungan")
CATEGORY_LABELS = {
    "banjir": "Ketahanan Banjir",
    "commute": "Efisiensi Commute",
    "akses": "Akses Fisik dan Jalan",
    "fasilitas": "Fasilitas Esensial",
    "lingkungan": "Kualitas Lingkungan dan Red Flags",
}


class Evidence(BaseModel):
    source_title: str
    url: str | None = None
    published_at: str | None = None
    accessed_at: str
    kind: Literal["grounded_search", "routes_api", "places_api", "geocoding",
                  "warehouse", "inarisk", "elevation_api"]


class Finding(BaseModel):
    claim: str
    evidence: list[Evidence] = Field(default_factory=list)
    confidence: Confidence
    limitation: str = ""
    validation_action: str = ""
    is_red_flag: bool = False
    is_critical: bool = False
    is_evidence_gap: bool = False


class CategoryResult(BaseModel):
    category: str
    findings: list[Finding] = Field(default_factory=list)
    proposed_score: int | None = None
    score_rationale: str = ""
    confidence: Confidence = "perlu_validasi"


# --- LLM-facing draft schemas (structured output) ---

class FindingDraft(BaseModel):
    claim: str
    source_indices: list[int] = Field(default_factory=list, description="Indeks sumber dari daftar bernomor")
    confidence: Confidence
    limitation: str
    validation_action: str
    is_red_flag: bool = False
    is_critical: bool = False


class CategoryDraft(BaseModel):
    findings: list[FindingDraft]
    proposed_score: int | None = Field(None, ge=0, le=100)
    score_rationale: str
    confidence: Confidence


class SummaryDraft(BaseModel):
    summary: str


class PlanDraft(BaseModel):
    """Research plan: targeted queries per textual category (docs/11 plan node)."""
    banjir: list[str] = Field(default_factory=list, max_length=3)
    akses: list[str] = Field(default_factory=list, max_length=3)
    lingkungan: list[str] = Field(default_factory=list, max_length=3)


class CategoryAssessment(BaseModel):
    category: Literal["banjir", "akses", "lingkungan"]
    sufficient: bool
    missing: str = ""
    refined_queries: list[str] = Field(default_factory=list, max_length=2)


class AssessDraft(BaseModel):
    assessments: list[CategoryAssessment]


class ResearchBrief(BaseModel):
    """Facts-only input for researchers (doc 06 §1)."""
    property_name: str | None
    address_text: str
    formatted_address: str | None
    lat: float | None
    lng: float | None
    kelurahan: str | None
    kecamatan: str | None
    kota: str | None
    in_jabodetabek: bool
    workplace_text: str
    workplace_lat: float | None
    workplace_lng: float | None
    transport_mode: str
    purpose: str | None
    buying_stage: str | None
    dp_timeline: str | None
    concerns: list[str] = Field(default_factory=list)
    concern_notes: str | None = None
