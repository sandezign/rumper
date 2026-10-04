import asyncio
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import check_quota, current_user
from app.core.security import rate_limit
from app.core.usage import tokens_used_today
from app.db.session import get_db, session_factory
from app.models import Conversation, Intake, Message, Project, Report, ResearchJob, User
from app.schemas.chat import (
    CreateConversation,
    CreateConversationFromIntake,
    CreateProject,
    SendMessage,
)
from app.services import advisor, chat_service
from app.services.scoring import BAND_LABELS

router = APIRouter(prefix="/api", tags=["chat"])


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


_REVIEW_STATE = {
    "pending": "Analisis berjalan", "running": "Analisis berjalan",
    "done": "Hasil awal", "failed": "Riset gagal",
}


def _convo_json(
    c: Conversation,
    intake: Intake | None = None,
    job: ResearchJob | None = None,
    report: Report | None = None,
) -> dict:
    """Base conversation; optionally enriched with audit metadata for the Active Audit
    list (property name + score + band + review state)."""
    d = {
        "id": str(c.id), "title": c.title, "state": c.state,
        "project_id": str(c.project_id) if c.project_id else None,
        "intake_id": str(c.intake_id) if c.intake_id else None,
        "updated_at": c.updated_at.isoformat(),
    }
    if intake is not None:
        d["property_name"] = intake.property_name or intake.formatted_address or intake.address_text
    if report is not None:
        d["rls_score"] = float(report.rls_score) if report.rls_score is not None else None
        d["band"] = report.band
        d["band_label"] = BAND_LABELS.get(report.band or "", "")
    if job is not None:
        d["review_state"] = _REVIEW_STATE.get(job.status, "")
    return d


async def _owned_convo(db: AsyncSession, user: User, convo_id: str) -> Conversation:
    try:
        cid = uuid.UUID(convo_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Percakapan tidak ditemukan.")
    convo = (await db.execute(select(Conversation).where(
        Conversation.id == cid, Conversation.user_id == user.id))).scalar_one_or_none()
    if convo is None:
        raise HTTPException(status_code=404, detail="Percakapan tidak ditemukan.")
    return convo


@router.get("/projects")
async def list_projects(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> list:
    rows = (await db.execute(select(Project).where(Project.user_id == user.id)
                             .order_by(Project.created_at.desc()))).scalars().all()
    return [{"id": str(p.id), "name": p.name} for p in rows]


@router.post("/projects", status_code=201)
async def create_project(payload: CreateProject, user: User = Depends(current_user),
                         db: AsyncSession = Depends(get_db)) -> dict:
    p = Project(user_id=user.id, name=payload.name)
    db.add(p)
    await db.commit()
    return {"id": str(p.id), "name": p.name}


@router.patch("/projects/{project_id}")
async def rename_project(project_id: str, payload: CreateProject,
                         user: User = Depends(current_user),
                         db: AsyncSession = Depends(get_db)) -> dict:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Proyek tidak ditemukan.")
    p = (await db.execute(select(Project).where(
        Project.id == pid, Project.user_id == user.id))).scalar_one_or_none()
    if p is None:
        raise HTTPException(status_code=404, detail="Proyek tidak ditemukan.")
    p.name = payload.name
    await db.commit()
    return {"id": str(p.id), "name": p.name}


@router.get("/conversations")
async def list_conversations(user: User = Depends(current_user),
                             db: AsyncSession = Depends(get_db)) -> list:
    # one join: each audit row carries its property/score/band/review-state for the selector
    stmt = (
        select(Conversation, Intake, ResearchJob, Report)
        .outerjoin(Intake, Conversation.intake_id == Intake.id)
        .outerjoin(ResearchJob, ResearchJob.intake_id == Conversation.intake_id)
        .outerjoin(Report, Report.job_id == ResearchJob.id)
        .where(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(50)
    )
    rows = (await db.execute(stmt)).all()
    return [_convo_json(c, intake, job, report) for (c, intake, job, report) in rows]


@router.post("/conversations/from-intake", status_code=201)
async def create_conversation_from_intake(
    payload: CreateConversationFromIntake,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Guided wizard submit: structured intake → conversation + research job (no LLM)."""
    await check_quota(db, user)
    convo = Conversation(user_id=user.id)
    db.add(convo)
    await db.flush()
    draft = payload.model_dump(exclude_none=True)
    label = payload.property_name or payload.address_text
    request_text = (
        f"Analisis {label} untuk banjir, commute, akses, fasilitas, dan red flag lingkungan."
    )
    intake_id = await chat_service.start_audit_from_draft(db, user, convo, draft, request_text)
    if intake_id is None:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail=('Lokasi itu belum bisa saya petakan secara tepat. Coba tulis nama '
                    'area/perumahan + kecamatan/kota, atau bagikan pin Google Maps.'),
        )
    return {"conversation_id": str(convo.id), "intake_id": str(intake_id)}


@router.post("/conversations", status_code=201)
async def create_conversation(payload: CreateConversation, user: User = Depends(current_user),
                              db: AsyncSession = Depends(get_db)) -> dict:
    project_id = None
    if payload.project_id:
        project_id = uuid.UUID(payload.project_id)
    c = Conversation(user_id=user.id, project_id=project_id)
    db.add(c)
    await db.commit()
    return _convo_json(c)


@router.get("/conversations/{convo_id}")
async def get_conversation(convo_id: str, user: User = Depends(current_user),
                           db: AsyncSession = Depends(get_db)) -> dict:
    convo = await _owned_convo(db, user, convo_id)
    msgs = (await db.execute(select(Message).where(Message.conversation_id == convo.id)
                             .order_by(Message.created_at))).scalars().all()
    job_status = None
    if convo.intake_id:
        job = (await db.execute(select(ResearchJob).where(
            ResearchJob.intake_id == convo.intake_id))).scalar_one_or_none()
        job_status = job.status if job else None
    return {
        **_convo_json(convo),
        "job_status": job_status,
        "expects": ("address" if convo.state in ("gathering", "report_qa")
                    and not (convo.intake_draft or {}).get("address_text") else None),
        "messages": [
            {"id": str(m.id), "role": m.role, "content": m.content,
             "suggestions": (m.meta or {}).get("suggestions", []),
             "citations": (m.meta or {}).get("citations", []),
             "created_at": m.created_at.isoformat()}
            for m in msgs
        ],
    }


@router.get("/conversations/{convo_id}/advisor")
async def advisor_manifest(convo_id: str, user: User = Depends(current_user),
                           db: AsyncSession = Depends(get_db)) -> dict:
    """Topics the advisor drawer opens on, with openers derived from this report.

    Deterministic — no LLM call — so opening the drawer costs nothing and every opener is
    something the report actually holds.
    """
    convo = await _owned_convo(db, user, convo_id)
    return await advisor.manifest(db, convo.intake_id)


@router.post("/conversations/{convo_id}/reset", status_code=204)
async def reset_conversation(convo_id: str, user: User = Depends(current_user),
                             db: AsyncSession = Depends(get_db)) -> Response:
    """Clear the transcript, keeping the conversation and its bound intake.

    The advisor drawer offers "mulai ulang" when a thread has wandered. The *audit* is not
    touched — only the chat around it — so no location quota is spent and the report the
    buyer paid attention to stays exactly where it was.
    """
    convo = await _owned_convo(db, user, convo_id)
    await db.execute(delete(Message).where(Message.conversation_id == convo.id))
    await db.commit()
    return Response(status_code=204)


@router.post("/conversations/{convo_id}/messages")
async def send_message(convo_id: str, payload: SendMessage,
                       user: User = Depends(current_user),
                       db: AsyncSession = Depends(get_db)) -> StreamingResponse:
    """SSE: status events (thinking/tool highlights) then a final `message` event."""
    await check_quota(db, user)
    convo = await _owned_convo(db, user, convo_id)
    convo_id_u, user_id = convo.id, user.id

    async def gen():
        yield _sse("status", {"label": "Memahami pesan Anda…"})
        async with session_factory()() as s:
            convo_ = (await s.execute(select(Conversation).where(
                Conversation.id == convo_id_u))).scalar_one()
            user_ = (await s.execute(select(User).where(User.id == user_id))).scalar_one()

            has_msgs = (await s.execute(
                select(Message.id).where(Message.conversation_id == convo_.id).limit(1)
            )).first() is not None
            if not has_msgs:
                convo_.title = payload.content[:60]

            # transition researching → report_qa/gathering by job status
            if convo_.state == "researching" and convo_.intake_id:
                job = (await s.execute(select(ResearchJob).where(
                    ResearchJob.intake_id == convo_.intake_id))).scalar_one_or_none()
                if job and job.status == "done":
                    convo_.state = "report_qa"
                    # clear location fields: a follow-up research needs a FRESH address;
                    # workplace/moda/purpose are kept (and remembered in user profile)
                    convo_.intake_draft = {
                        k: v for k, v in (convo_.intake_draft or {}).items()
                        if k not in ("address_text", "property_name", "maps_link", "concern_notes")
                    }
                    yield _sse("status", {"label": "Memuat laporan riset…"})
                elif job and job.status == "failed":
                    convo_.state = "gathering"

            s.add(Message(conversation_id=convo_.id, role="user", content=payload.content))
            if convo_.state == "report_qa":
                yield _sse("status", {"label": "Mencari jawaban di laporan…"})
            else:
                yield _sse("status", {"label": "Menyusun balasan…"})

            try:
                # Closed vocabulary: an unrecognised topic is dropped rather than forwarded,
                # so the field cannot be used to inject instructions into the prompt.
                topic = payload.topic if payload.topic in advisor.TOPIC_IDS else None
                reply, suggestions, citations, started_job = await chat_service.run_turn(
                    s, user_, convo_, payload.content, topic=topic)
            except Exception:
                yield _sse("error", {"detail": "Gagal memproses pesan. Coba lagi."})
                return
            s.add(Message(conversation_id=convo_.id, role="assistant", content=reply,
                          meta={"suggestions": suggestions, "citations": citations}))
            await s.commit()
            used_today = await tokens_used_today(s, user_.id)
            yield _sse("message", {
                "reply": reply,
                "suggestions": suggestions,
                "citations": citations,
                "expects": ("address" if convo_.state in ("gathering", "report_qa")
                            and not (convo_.intake_draft or {}).get("address_text") else None),
                "state": convo_.state,
                "intake_id": str(convo_.intake_id) if convo_.intake_id else None,
                "research_started": bool(started_job),
                "tokens_used_today": used_today,
                "token_limit": user_.token_limit,
            })

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.get("/places/autocomplete")
async def places_autocomplete(
    q: str,
    near_lat: float | None = None,
    near_lng: float | None = None,
    radius_m: int = 12000,
    user: User = Depends(current_user),
    _=Depends(rate_limit("autocomplete", 60, 60)),
) -> list:
    """Address picker (docs/12 UI). Min 4 chars; ≤5 suggestions.

    `near_lat`/`near_lng` scope the search to a circle — the areas hub passes the chosen
    corridor's centroid so the buyer can only pick a house inside the corridor they are
    evaluating (docs/21 §9).
    """
    from app.providers import gmaps

    if len(q.strip()) < 4:
        return []
    bias = (near_lat, near_lng) if near_lat is not None and near_lng is not None else None
    return await gmaps.autocomplete(q.strip(), bias=bias, radius_m=radius_m)


@router.get("/places/geocode")
async def places_geocode(
    q: str, user: User = Depends(current_user),
    _=Depends(rate_limit("geocode", 60, 60)),
) -> dict:
    """Resolve a place description to coordinates — used by the areas hub to turn the
    profile's anchor label into the gravity centre (docs/21 §3). Area-tolerant, so
    "sekitar BSD" resolves like it does in chat."""
    from app.providers import gmaps

    if len(q.strip()) < 3:
        raise HTTPException(status_code=422, detail="Kata kunci lokasi terlalu pendek.")
    geo = await gmaps.geocode_smart(q.strip())
    if not geo:
        raise HTTPException(
            status_code=404,
            detail="Lokasi tidak dapat dipetakan. Coba nama yang lebih spesifik.",
        )
    return {"lat": geo["lat"], "lng": geo["lng"],
            "formatted_address": geo["formatted_address"]}


_RESEARCH_STEPS = {
    0: "Menyiapkan riset…",
    1: "Memindai data spasial: banjir, elevasi, tol, fasilitas…",
    2: "Menyusun rencana riset…",
    3: "Mencari & memperdalam bukti dari web…",
    4: "Mengekstrak temuan & sumber…",
    5: "Menghitung skor & menyusun laporan…",
}


@router.get("/research/{intake_id}/events")
async def research_events(intake_id: str, user: User = Depends(current_user)) -> StreamingResponse:
    """SSE progress for a running research job (node highlights for the UI)."""
    try:
        iid = uuid.UUID(intake_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Tidak ditemukan.")

    async def gen():
        last = None
        for _ in range(400):  # ~10 min cap
            async with session_factory()() as s:
                job = (await s.execute(select(ResearchJob).where(
                    ResearchJob.intake_id == iid))).scalar_one_or_none()
            if job is None:
                yield _sse("error", {"detail": "Job tidak ditemukan."})
                return
            cur = (job.status, job.categories_done)
            if cur != last:
                last = cur
                yield _sse("progress", {
                    "status": job.status,
                    "step": job.categories_done,
                    "label": _RESEARCH_STEPS.get(job.categories_done, "Memproses…"),
                })
            if job.status in ("done", "failed"):
                yield _sse("finished", {"status": job.status, "error": job.error})
                return
            await asyncio.sleep(1.5)

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
