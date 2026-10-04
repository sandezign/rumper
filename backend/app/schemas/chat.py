"""Chat workspace schemas (docs/12)."""
from pydantic import BaseModel, Field


class ChatTurnDraft(BaseModel):
    """The only thing the LLM may return per turn (docs/12 §3)."""
    reply: str
    address_text: str | None = None
    property_name: str | None = None
    workplace_text: str | None = None
    transport_mode: str | None = Field(None, pattern="^(mobil|motor|krl|transjakarta|campuran)$")
    purpose: str | None = Field(None, pattern="^(tinggal_sendiri|tinggal_keluarga)$")
    concerns: list[str] | None = None
    concern_notes: str | None = None
    ready_to_research: bool = False
    off_topic: bool = False
    suggestions: list[str] = Field(default_factory=list, max_length=4)
    # Which report categories this answer drew on. A closed vocabulary on purpose: the
    # model can only *point at* one of the five scored categories, never invent a source
    # title or URL. The server drops anything outside the list, so a chip in the UI always
    # corresponds to a category the buyer can open and check (CLAUDE.md global rule 2).
    citations: list[str] = Field(default_factory=list, max_length=5)


class SendMessage(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    #: Advisor topic the drawer is scoped to (`app.services.advisor.TOPIC_IDS`). Closed
    #: vocabulary, validated in the router — an unknown value is ignored rather than passed
    #: to the model, so a client cannot smuggle instructions in through this field.
    topic: str | None = Field(default=None, max_length=32)


class CreateProject(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class CreateConversation(BaseModel):
    project_id: str | None = None


class CreateConversationFromIntake(BaseModel):
    """Guided wizard submit (docs/12 §guided onboarding): structured intake → research,
    no LLM gathering. Mirrors the _start_research draft."""
    address_text: str = Field(min_length=3, max_length=300)
    property_name: str | None = Field(None, max_length=200)
    workplace_text: str = Field(min_length=1, max_length=200)
    transport_mode: str = Field(pattern="^(mobil|motor|krl|transjakarta|campuran)$")
    concerns: list[str] = Field(default_factory=list, max_length=8)
    concern_notes: str | None = Field(None, max_length=500)
    purpose: str | None = Field(None, pattern="^(tinggal_sendiri|tinggal_keluarga)$")
    buying_stage: str | None = Field(None, max_length=40)
    dp_timeline: str | None = Field(None, max_length=40)


class GoogleLogin(BaseModel):
    # GIS One Tap / button → `credential` (ID token); custom button (OAuth2 token client)
    # → `access_token`. One of the two is required.
    credential: str | None = None
    access_token: str | None = None


class UpdatePicture(BaseModel):
    # data URI; 1 MB binary ≈ 1.4 MB base64 — anything bigger is rejected pre-decode
    picture_base64: str = Field(min_length=30, max_length=1_500_000)
