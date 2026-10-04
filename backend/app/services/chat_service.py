"""Chat turn driver: invokes the checkpointed chat graph (chat_graph.py), syncs the
intake draft, and triggers the research pipeline when the user confirms (docs/12)."""
import asyncio
import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.usage import usage_ctx
from app.models import (
    CategoryScore,
    Conversation,
    Finding,
    Intake,
    Message,
    Report,
    ResearchJob,
    User,
)
from app.providers import gmaps
from app.schemas.research import CATEGORY_LABELS
from app.services import advisor, chat_graph
from app.services.orchestrator import run_research
from app.services.scoring import BAND_LABELS, RECOMMENDATION_LABELS

log = logging.getLogger("rumper.chat")

STARTER_SUGGESTIONS = [
    "Cek rumah incaran di Bekasi",
    "Seberapa rawan banjir area ini?",
    "Commute ke SCBD realistis nggak?",
    "Apa saja yang Rumper periksa?",
]


async def _report_context(db: AsyncSession, intake_id: uuid.UUID) -> str:
    job = (await db.execute(select(ResearchJob).where(ResearchJob.intake_id == intake_id))).scalar_one_or_none()
    if job is None or job.status != "done":
        return ""
    report = (await db.execute(select(Report).where(Report.job_id == job.id))).scalar_one()
    scores = (await db.execute(select(CategoryScore).where(CategoryScore.job_id == job.id))).scalars().all()
    findings = (await db.execute(select(Finding).where(Finding.job_id == job.id))).scalars().all()
    lines = [
        f"Skor total: {report.rls_score} ({BAND_LABELS.get(report.band or '', 'data belum cukup')})",
        f"Rekomendasi: {RECOMMENDATION_LABELS[report.recommendation]}",
        f"Ringkasan: {report.summary}",
        "Skor kategori: " + "; ".join(f"{CATEGORY_LABELS[s.category]}={s.score}" for s in scores),
        "Temuan:",
    ]
    for f in findings:
        flag = " [RED FLAG]" if f.is_red_flag else (" [GAP]" if f.is_evidence_gap else "")
        lines.append(f"- ({CATEGORY_LABELS[f.category]}/{f.confidence}){flag} {f.claim}"
                     + (f" | Validasi: {f.validation_action}" if f.validation_action else ""))
    lines.append("Checklist: " + "; ".join(i["item"] for i in (report.checklist or [])))
    return "\n".join(lines)[:15000]


_PROFILE_FIELDS = ("workplace_text", "transport_mode", "purpose")


def _profile_block(user: User) -> str:
    p = user.profile or {}
    lines = []
    if p.get("workplace_text"):
        lines.append(f"Tempat kerja/aktivitas: {p['workplace_text']}")
    if p.get("transport_mode"):
        lines.append(f"Moda transportasi: {p['transport_mode']}")
    if p.get("purpose"):
        lines.append(f"Tujuan tinggal: {p['purpose']}")
    if p.get("last_area"):
        lines.append(f"Area yang terakhir dicek: {p['last_area']}")
    return "\n".join(lines)


def _remember_profile(user: User, draft: dict) -> None:
    """Merge profile-worthy intake facts into the user's persistent memory."""
    p = dict(user.profile or {})
    for f in _PROFILE_FIELDS:
        if draft.get(f):
            p[f] = draft[f]
    if draft.get("address_text"):
        p["last_area"] = draft.get("property_name") or draft["address_text"]
    user.profile = p


async def run_turn(
    db: AsyncSession, user: User, convo: Conversation, user_message: str,
    topic: str | None = None,
) -> tuple[str, list[str], list[str], uuid.UUID | None]:
    """Returns (assistant_reply, suggestions, citations, started_job_id)."""
    usage_ctx.set({"user_id": str(user.id), "conversation_id": str(convo.id),
                   "operation": "chat_turn"})

    qa_context = ""
    if convo.state == "report_qa" and convo.intake_id:
        qa_context = await _report_context(db, convo.intake_id)

    # seed a fresh conversation's draft from remembered profile (docs/12 memory)
    if not convo.intake_draft:
        seeded = {f: (user.profile or {}).get(f) for f in _PROFILE_FIELDS
                  if (user.profile or {}).get(f)}
        if seeded:
            convo.intake_draft = seeded

    g = await chat_graph.graph()
    state = await g.ainvoke(
        {
            "messages": [{"role": "user", "content": user_message}],
            "mode": convo.state,
            "report_context": qa_context,
            "user_profile": _profile_block(user),
            "intake_draft": convo.intake_draft or {},
            # Scoped by the advisor drawer. The instruction is looked up from a closed table,
            # never taken from the request body (see routers/chat.py).
            "focus": (f"=== FOKUS TOPIK ===\n{advisor.FOCUS_INSTRUCTION[topic]}"
                      if topic in advisor.FOCUS_INSTRUCTION else ""),
        },
        # project = namespace in the checkpoint store (docs/12); thread = conversation
        config={"configurable": {
            "thread_id": str(convo.id),
            "checkpoint_ns": str(convo.project_id) if convo.project_id else "",
        }},
    )
    reply: str = state.get("reply", "")
    suggestions: list[str] = state.get("suggestions", [])
    citations: list[str] = state.get("citations", [])
    convo.intake_draft = state.get("intake_draft", convo.intake_draft or {})
    _remember_profile(user, convo.intake_draft)

    started_job: uuid.UUID | None = None
    geo: dict | None = None
    # New research starts only from gathering — report_qa turns are pure Q&A (a fresh
    # audit is started via the wizard / "+" button, not by typing in an existing thread).
    if convo.state == "gathering" and state.get("ready"):
        started_job, geo = await _start_research(db, user, convo, convo.intake_draft or {})
        if started_job is None:
            # drop the unmappable address so the next turn re-collects it, and replace
            # the model's now-irrelevant chips with actionable ones (deadlock fix)
            d = dict(convo.intake_draft or {})
            d.pop("address_text", None)
            d.pop("property_name", None)
            convo.intake_draft = d
            reply = ("Lokasi itu belum bisa saya petakan secara tepat. Coba tulis nama "
                     "area/perumahan + kecamatan/kota (mis. \"BSD City, Serpong, Tangerang "
                     "Selatan\"), atau pilih dari pencarian alamat di bawah kolom chat.")
            suggestions = ["BSD City, Tangerang Selatan", "Tulis area + kota", "Kirim link Google Maps"]
        else:
            convo.state = "researching"
            reply = (reply or "Siap!") + (
                " Deep research dimulai — saya memindai data banjir, elevasi, tol, "
                "fasilitas, lalu riset web berlapis. Hasil + peta muncul ~2 menit lagi."
            )
    await db.commit()
    # spawn AFTER commit — the background task reads the job row in its own session
    if started_job is not None and geo is not None:
        _spawn_research(user, convo, started_job, geo)
    return reply, suggestions, citations, started_job


_bg_tasks: set[asyncio.Task] = set()  # strong refs — fire-and-forget tasks must not be GC'd


def _spawn_research(user: User, convo: Conversation, job_id: uuid.UUID, geo: dict) -> None:
    ctx = {"user_id": str(user.id), "conversation_id": str(convo.id), "job_id": str(job_id)}

    async def _run():
        usage_ctx.set(ctx)
        await run_research(job_id, geo)

    task = asyncio.get_running_loop().create_task(_run())
    _bg_tasks.add(task)
    task.add_done_callback(_bg_tasks.discard)


async def start_audit_from_draft(
    db: AsyncSession, user: User, convo: Conversation, draft: dict, request_text: str,
) -> uuid.UUID | None:
    """Guided-wizard path (docs/12): a structured intake → research, with NO LLM gathering.
    Seeds the thread (so the dashboard chat opens on the analysis request) and spawns the job.
    Returns the intake_id, or None when the address can't be geocoded (caller → 400)."""
    usage_ctx.set({"user_id": str(user.id), "conversation_id": str(convo.id),
                   "operation": "from_intake"})
    convo.intake_draft = draft
    started_job, geo = await _start_research(db, user, convo, draft)
    if started_job is None or geo is None:
        return None
    convo.state = "researching"
    convo.title = (draft.get("property_name") or draft.get("address_text") or "Audit")[:60]
    _remember_profile(user, draft)
    # Seed only the analysis request. The "Deep Thinking" progress card and the result summary
    # are rendered by the UI (docs/16) from the live job + report — not stored as messages.
    db.add(Message(conversation_id=convo.id, role="user", content=request_text))
    await db.commit()
    _spawn_research(user, convo, started_job, geo)
    return convo.intake_id


async def _start_research(
    db: AsyncSession, user: User, convo: Conversation, draft: dict,
) -> tuple[uuid.UUID | None, dict | None]:
    d = draft
    query = d["address_text"]
    if d.get("property_name") and d["property_name"].lower() not in query.lower():
        query = f"{d['property_name']}, {query}"
    geo = await gmaps.geocode_smart(query)
    if geo is None:
        return None, None
    workplace_geo = await gmaps.geocode_smart(d["workplace_text"])
    intake = Intake(
        full_name=user.name or user.email,
        whatsapp="-",  # chat flow: contact = logged-in account (docs/13 §1)
        property_name=d.get("property_name"),
        address_text=d["address_text"],
        lat=geo["lat"], lng=geo["lng"],
        formatted_address=geo["formatted_address"],
        in_jabodetabek=geo["in_jabodetabek"],
        purpose=d.get("purpose"),
        workplace_text=d["workplace_text"],
        workplace_lat=workplace_geo["lat"] if workplace_geo else None,
        workplace_lng=workplace_geo["lng"] if workplace_geo else None,
        transport_mode=d["transport_mode"],
        concerns={"categories": d.get("concerns", []), "notes": d.get("concern_notes")},
        consent_whatsapp=False, consent_privacy=True,
    )
    db.add(intake)
    await db.flush()
    job = ResearchJob(intake_id=intake.id)
    db.add(job)
    convo.intake_id = intake.id
    await db.flush()
    return job.id, geo
