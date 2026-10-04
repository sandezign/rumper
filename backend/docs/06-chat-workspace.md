# 06 — Chat Workspace (graph + turn driver)

Source: `app/services/chat_graph.py`, `app/services/chat_service.py`,
`app/schemas/chat.py`. Spec: docs/12. HTTP layer: doc 07 §4.

## 1. Conversation state machine (DB-owned, not LLM-owned)

`conversations.state`: `gathering → researching → report_qa` (back to `gathering`
on job failure). Transitions happen in code:
- gathering → researching: the chat graph reports `ready` and geocoding succeeds
  (§3.3);
- researching → report_qa / gathering: checked at the **start of the next user
  message** against the job status (doc 07 §4), and mirrored client-side when the
  progress stream finishes.

## 2. Chat graph (`chat_graph.py`)

One-node LangGraph (`turn → END`) compiled with the shared Postgres checkpointer —
conversation history and the intake draft live in **graph state**, persisted per
thread (`thread_id = conversation_id`, `checkpoint_ns = project_id or ""`), not in our
tables. Our `messages` table is a UI mirror (doc 07 §4).

State (`ChatState`): `messages: Annotated[list[dict], operator.add]` (append-only
`{role, content}`) · `intake_draft: dict` · `mode` (`gathering|report_qa`) ·
`report_context: str` (injected per turn in QA mode) · per-turn outputs `reply`,
`suggestions`, `ready`, `off_topic`.

Field contracts: `REQUIRED_FIELDS = (address_text, workplace_text, transport_mode)`;
`OPTIONAL_FIELDS = (property_name, purpose, concerns, concern_notes)`.

`ChatTurnDraft` (`schemas/chat.py`) — the **only** thing the LLM may return per turn:
`reply` + one optional slot per intake field (`transport_mode` pattern
`mobil|motor|krl|transjakarta|campuran`; `purpose` pattern
`tinggal_sendiri|tinggal_keluarga`) + `ready_to_research` + `off_topic` +
`suggestions[≤4]`. The model never calls tools or mutates state directly.

### `turn(state)` node

1. `set_operation("chat_turn")`.
2. Prompt = `render("chat_turn", system=render("chat_system"), qa_block=
   render("chat_qa", report=...)` when `mode == report_qa` and context present else
   `""`, `intake_status=_draft_summary(draft)`, `conversation=` last **12** messages,
   each truncated to **600** chars, as `role: content` lines).
   `_draft_summary` lists known fields with id-ID labels + which required fields are
   still missing ("tidak ada — siap riset" when complete).
3. `llm.structured(prompt, ChatTurnDraft, temperature=0.4)`. On exception: canned
   apology reply ("Maaf, ada kendala memproses pesan Anda. Coba kirim ulang."), no
   draft change, `ready=False`.
4. `off_topic=true` → append the fixed steering copy `OFF_TOPIC_STEER` ("Saya asisten
   Rumper khusus risiko lokasi rumah … yuk kembali ke rencana rumah Anda.") to the
   reply (fallback reply "Maaf, itu di luar cakupan saya.") and **skip** field
   extraction. Otherwise merge every non-empty extracted field into the draft.
5. Return: assistant message appended to `messages`, updated `intake_draft`, `reply`,
   `suggestions`, `off_topic`, and
   `ready = ready_to_research && !off_topic && all(required fields present)`.

## 3. Turn driver (`chat_service.py`)

`STARTER_SUGGESTIONS` (hero chips, code-owned): "Cek rumah incaran di Bekasi" ·
"Seberapa rawan banjir area ini?" · "Commute ke SCBD realistis nggak?" · "Apa saja
yang Rumper periksa?".

### 3.1 `run_turn(db, user, convo, user_message) -> (reply, suggestions, started_job_id)`

1. Set `usage_ctx = {user_id, conversation_id, operation: chat_turn}`.
2. `report_qa` with an intake → build `_report_context` (§3.2).
3. Invoke the chat graph with the new user message, `mode=convo.state`,
   `report_context`, config `{thread_id: convo.id, checkpoint_ns: convo.project_id
   or ""}` (project = namespace in the checkpoint store).
4. Sync `convo.intake_draft` from graph state.
5. If `state == gathering` and graph says `ready` → `_start_research` (§3.3):
   - geocode failed → replace the reply with "Alamatnya belum bisa saya petakan.
     Bisa kirim nama perumahan + kecamatan/kota, atau tempel link Google Maps?";
   - else `convo.state = "researching"` and append the canned kickoff suffix
     ("Deep research dimulai — … Hasil + peta muncul ~2 menit lagi.").
6. `db.commit()`, **then** spawn the research task (§3.4) — the background task reads
   the job row in its own session, so the row must be committed first.

### 3.2 `_report_context(db, intake_id) -> str`

Empty string unless the job is `done`. Otherwise a fact sheet capped at **15000**
chars: total score + band label, recommendation label, summary, per-category scores,
every finding as `- (label/confidence)[ RED FLAG| GAP] claim | Validasi: action`, and
the checklist items. This is the only ground truth the QA mode may answer from
(prompt `chat_qa` enforces it).

### 3.3 `_start_research(db, user, convo) -> (job_id?, geo?)`

Geocode query = `intake_draft.address_text`, prefixed with `property_name, ` when the
name isn't already contained in it (case-insensitive). Geocode `None` → `(None, None)`.
Workplace geocoded too (nullable). Creates `Intake` from the draft with chat-flow
specifics: `full_name = user.name or user.email`, `whatsapp = "-"` (contact = the
logged-in account, docs/13 §1), `consent_whatsapp=False`, `consent_privacy=True`,
`concerns={"categories": draft.concerns, "notes": draft.concern_notes}`; flushes,
creates `ResearchJob(intake_id)`, links `convo.intake_id`, flushes, returns
`(job.id, geo)`.

### 3.4 `_spawn_research(user, convo, job_id, geo)`

Fire-and-forget `asyncio.create_task` running `run_research(job_id, geo)` with
`usage_ctx` set to `{user_id, conversation_id, job_id}` inside the task. Tasks are
held in a module-level `set` with a done-callback discard — strong references so the
event loop can't GC a running job. (The form flow instead uses FastAPI
`BackgroundTasks`, doc 07 §5.)
