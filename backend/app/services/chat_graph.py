"""Checkpointed chat graph: conversation history + intake draft live in LangGraph state,
persisted to Postgres (thread_id = conversation_id) via AsyncPostgresSaver.

One `turn` node per user message — the structured-output guardrails of docs/12 §3/§4.
"""
import logging
import operator
from typing import Annotated, TypedDict

from langgraph.graph import END, StateGraph

from app.core.usage import set_operation
from app.db.checkpointer import get_checkpointer
from app.prompts import render
from app.providers import llm
from app.schemas.chat import ChatTurnDraft
from app.schemas.research import CATEGORIES

log = logging.getLogger("rumper.chatgraph")

REQUIRED_FIELDS = ("address_text", "workplace_text", "transport_mode")
OPTIONAL_FIELDS = ("property_name", "purpose", "concerns", "concern_notes")

OFF_TOPIC_STEER = (
    " Saya asisten Rumper khusus risiko lokasi rumah (banjir, commute, akses, fasilitas, "
    "lingkungan) di Indonesia — yuk kembali ke rencana rumah Anda."
)



class ChatState(TypedDict, total=False):
    messages: Annotated[list[dict], operator.add]  # [{"role","content"}] — checkpointed
    intake_draft: dict
    mode: str               # gathering | report_qa
    report_context: str     # injected per turn when in report_qa
    focus: str              # advisor topic instruction, when the drawer scoped the turn
    user_profile: str       # remembered facts block, injected per turn (docs/12)
    # per-turn outputs (overwritten each invoke)
    reply: str
    suggestions: list[str]
    citations: list[str]
    ready: bool
    off_topic: bool


def _draft_summary(draft: dict) -> str:
    known = []
    for k, label in (("address_text", "alamat"), ("property_name", "perumahan"),
                     ("workplace_text", "tempat kerja"), ("transport_mode", "moda"),
                     ("purpose", "tujuan")):
        if draft.get(k):
            known.append(f"{label}: {draft[k]}")
    if draft.get("concerns"):
        known.append("kekhawatiran: " + ", ".join(draft["concerns"]))
    missing = [k for k in REQUIRED_FIELDS if not draft.get(k)]
    return (f"Data intake terkumpul → {'; '.join(known) or '(belum ada)'}. "
            f"Field wajib yang masih kosong: {', '.join(missing) or 'tidak ada — siap riset'}.")


async def turn(state: ChatState) -> ChatState:
    set_operation("chat_turn")
    history = state.get("messages", [])
    draft_state = dict(state.get("intake_draft") or {})
    qa = state.get("mode") == "report_qa" and state.get("report_context")

    convo_lines = "\n".join(f"{m['role']}: {m['content'][:600]}" for m in history[-12:])
    prompt = render(
        "chat_turn",
        system=render("chat_system"),
        qa_block=render("chat_qa", report=state["report_context"]) if qa else "",
        focus=state.get("focus", ""),
        user_profile=state.get("user_profile") or "(belum ada)",
        intake_status=_draft_summary(draft_state),
        conversation=convo_lines,
    )
    try:
        out = await llm.structured(prompt, ChatTurnDraft, temperature=0.4)
    except Exception:
        log.exception("chat turn failed")
        return {
            "messages": [{"role": "assistant",
                          "content": "Maaf, ada kendala memproses pesan Anda. Coba kirim ulang."}],
            "reply": "Maaf, ada kendala memproses pesan Anda. Coba kirim ulang.",
            "suggestions": [], "citations": [], "ready": False, "off_topic": False,
        }

    reply = out.reply.strip()
    if out.off_topic:
        reply = (reply or "Maaf, itu di luar cakupan saya.") + OFF_TOPIC_STEER
    else:
        for f in REQUIRED_FIELDS + OPTIONAL_FIELDS:
            v = getattr(out, f)
            if v:
                draft_state[f] = v

    # in QA mode a new research additionally requires a FRESH address extracted this
    # conversation segment (the old one is cleared on entering report_qa)
    ready = bool(out.ready_to_research and not out.off_topic
                 and all(draft_state.get(f) for f in REQUIRED_FIELDS))
    return {
        "messages": [{"role": "assistant", "content": reply}],
        "intake_draft": draft_state,
        "reply": reply,
        "suggestions": out.suggestions,
        # Server-side allowlist: the model proposes, code decides. Anything outside the five
        # scored categories is dropped rather than shown, so a citation chip can never point
        # at something the buyer cannot open in the report.
        "citations": [c for c in out.citations if c in CATEGORIES],
        "ready": ready,
        "off_topic": out.off_topic,
    }


_GRAPH = None


async def graph():
    global _GRAPH
    if _GRAPH is None:
        g = StateGraph(ChatState)
        g.add_node("turn", turn)
        g.set_entry_point("turn")
        g.add_edge("turn", END)
        _GRAPH = g.compile(checkpointer=await get_checkpointer())
    return _GRAPH
