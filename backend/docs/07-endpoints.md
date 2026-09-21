# 07 — HTTP Endpoints (as implemented)

Source: `app/routers/auth.py`, `chat.py`, `intakes.py`, `checks.py`,
`app/schemas/api.py`, `chat.py`. Contract tier: docs/05 (intake/check), docs/12 §6
(chat), docs/13 (auth/quota), docs/14 (map). JSON `snake_case`; UUIDs as strings;
errors `{"detail": <id-ID actionable message | structured object>}`.

Auth model: chat/auth/project/conversation/research-event routes require the session
cookie (`current_user` → 401 "Silakan masuk terlebih dahulu."). The ops-fallback
intake/check routes are unauthenticated by design (doc 05). Invalid UUID path params
are mapped to 404, never 422.

## 1. Auth (`/api/auth`)

| Route | Behavior |
|---|---|
| `POST /google` `{credential}` | Rate-limited 10/min/IP. Verify the GIS ID token (doc 03 §1). Find user by `google_sub` or create one (`token_limit = settings.default_token_limit`); identity fields (email/name/picture URL) refreshed on every login; the Google avatar is mirrored into `picture_base64` best-effort (doc 03 §1.1). Issue the cookie pair: `rumper_access` (1-day JWT) + `rumper_refresh` (7-day opaque, path `/api/auth`, sha256-hashed in `refresh_tokens`). → user JSON |
| `POST /refresh` | Rate-limited 30/min/IP. Rotate the refresh cookie (single-use; reuse revokes the user's whole token family) and set fresh access+refresh cookies. Missing/invalid/expired → 401 "Sesi berakhir. Silakan masuk lagi.". → user JSON |
| `GET /me` | → user JSON incl. live `tokens_used_today` |
| `PUT /me/picture` `{picture_base64}` | Replace the stored avatar: data-URI base64, PNG/JPEG/WebP by magic bytes, decoded ≤ 1 MB (413 above; 422 invalid format). → user JSON |
| `POST /logout` | revoke the refresh token, delete both cookies → `{"ok": true}` |

User JSON: `{id, email, name, picture, tokens_used_today, token_limit}` where
`picture` = `picture_base64` (data URI) when stored, else the Google URL.

Cross-cutting (doc 03 §1.2): security headers on every response; unsafe `/api`
requests from a foreign `Origin` → 403; auth rate limits → 429.

## 2. Projects

- `GET /api/projects` → `[{id, name}]`, newest first.
- `POST /api/projects` `{name 1..80}` → 201 `{id, name}`.
- `PATCH /api/projects/{id}` `{name}` → rename own project; 404 otherwise.

## 3. Conversations

Conversation JSON: `{id, title, state, project_id?, intake_id?, updated_at}`.

- `GET /api/conversations` → own conversations, `updated_at` desc, limit 50.
- `POST /api/conversations` `{project_id?}` → 201 conversation JSON.
- `GET /api/conversations/{id}` → conversation JSON + `job_status`
  (job status for `intake_id`, else null) + `messages:
  [{id, role, content, suggestions (from meta), created_at}]` in chronological order.

Ownership: `_owned_convo` filters by `user_id`; missing/foreign/invalid id → 404
"Percakapan tidak ditemukan.".

## 4. Chat turn — `POST /api/conversations/{id}/messages` `{content 1..2000}`

**SSE response** (`text/event-stream`, headers `Cache-Control: no-cache`,
`X-Accel-Buffering: no`). Quota is checked (402, doc 03 §1) and ownership verified
*before* streaming starts. Event protocol (`event: <name>\ndata: <json>\n\n`):

1. `status {label}` — progressive id-ID status lines ("Memahami pesan Anda…", then
   "Memuat laporan riset…" / "Mencari jawaban di laporan…" / "Menyusun balasan…").
2. `error {detail}` — turn failed; stream ends.
3. `message {reply, suggestions[], state, intake_id?, research_started,
   tokens_used_today, token_limit}` — final event.

Handler flow (inside the generator, fresh session — the request session can't span a
stream): first message in the conversation sets `title = content[:60]`; if state is
`researching`, re-check the job and transition to `report_qa` (done) or back to
`gathering` (failed); persist the user `Message`; call `chat_service.run_turn`
(doc 06); persist the assistant `Message` with `meta.suggestions`; commit; emit
`message`.

## 5. Research progress — `GET /api/research/{intake_id}/events`

SSE poller for a running job (auth required): every 1.5 s read the job row (up to 400
iterations ≈ 10 min); on change emit
`progress {status, step: categories_done, label}` with labels
`0 "Menyiapkan riset…" · 1 "Memindai data spasial: banjir, elevasi, tol, fasilitas…" ·
2 "Menyusun rencana riset…" · 3 "Mencari & memperdalam bukti dari web…" ·
4 "Mengekstrak temuan & sumber…" · 5 "Menghitung skor & menyusun laporan…"`;
terminal status → `finished {status, error?}` and close. Unknown job →
`error {detail}`.

> **The SPA does not consume this in prod.** Firebase Hosting (in front of Cloud Run)
> **buffers** the stream, so an `EventSource` receives the whole thing at the end instead
> of incrementally. The frontend therefore polls `GET /api/checks/{intake_id}` (§7, which
> returns a server-owned `progress {step, total, pct, label}` object while running) every
> 1.5 s. This endpoint is kept for direct/non-Hosting consumers but is currently unused by
> the FE. (Note: it still emits the coarse `categories_done`-based label; the richer
> progress lives on the check endpoint / `research_jobs.progress_pct|progress_note`.)

## 6. Ops intake — `POST /api/intakes` (no auth)

Body `IntakeCreate` (docs/05): required `full_name`, `whatsapp` (validator strips
non-digits, ≥8 digits), `address_text ≥5`, `workplace_text ≥3`, `transport_mode`
pattern-checked; both consents must be `true` (validator). Geocode
`property_name, address_text` (prefix only when not already contained); failure →
400 "Alamat tidak dapat dipetakan. Bagikan pin Google Maps atau tulis alamat yang
lebih lengkap (nama perumahan, kecamatan, kota).". "Failure" here means `geocode_smart`
returned `None` — which now also covers Maps transport/parse/shape errors, since the
provider never raises (docs/04 §2 resilience contract). That closes the earlier bug where
a non-JSON Maps body or a result missing `geometry` surfaced as a 500 instead of this 400.
Insert `Intake` + `ResearchJob`, commit, then
`BackgroundTasks.add_task(run_research, job.id, geo)`.
→ 201 `{intake_id, status: "pending"}`. Outside Jabodetabek is accepted but flagged.

## 7. Check result — `GET /api/checks/{intake_id}` (no auth)

Joins job + intake by `intake_id` (404 when unknown).
- `pending|running` → `{status, categories_done, progress: {step (1–5), total (5),
  pct (0–100), label}}` — server-owned loader progress the FE renders verbatim; set by the
  orchestrator from the graph's per-node/per-query stream (`_PHASES`). `categories_done`
  mirrors `progress.step` (back-compat);
- `failed` → `{status: "failed", error}`;
- `done` → `{status: "done", report: {...}}` with: `report_type`, `property
  {name, formatted_address, lat, lng, in_jabodetabek}`, `rls_score` (float|null),
  `band`, `band_label` ("Data belum cukup" fallback), `recommendation`,
  `recommendation_label`, `summary`, `categories` (all five in `CATEGORIES` order:
  `{category, label, weight, score, confidence (perlu_validasi when missing),
  rationale, findings[]}`), `red_flags` (findings with `is_red_flag`),
  `evidence_gaps` (findings with `is_evidence_gap`), `checklist`, `disclaimer`
  (`scoring.DISCLAIMER` verbatim), `created_at` ISO.

Finding JSON: `{claim, evidence, confidence, limitation, validation_action,
is_red_flag, is_critical, is_evidence_gap}`.

## 8. Map payload — `GET /api/checks/{intake_id}/map` (no auth)

404 when job unknown or intake has no coordinates. Combines DB + live
`spatial.build_map_facts(lat, lng)` (doc 05 §3):

```json
{
  "property": {"name", "formatted_address", "lat", "lng"},
  "rls": {"score", "band", "band_label", "recommendation_label"},
  "category_scores": {"banjir": 60, ...},
  "flood": {"index", "class"} | null,
  "elevation": {"elevation_m", "relative_m", "low_lying"} | null,
  "nearest_toll": {feature} | null,
  "nearest_station": {feature} | null,
  "facilities": [feature...],
  "red_flags": [feature + {"label", "critical"}...]
}
```
Feature = `{name, kind, lat, lng, distance_km, ingested_at, pos_source}`.
`pos_source` (docs/10 §5) reports how the coordinate was placed — `osm_node` |
`osm_centroid` | `osm_vertex_mean` | `osm_bbox_center` | `google_place`, defaulting to
`osm_legacy` for rows ingested before the centroid fix. Works even while the
report is absent (`rls` fields null).

## 9. Health + SPA

`GET /api/health` → `{status: "ok", db: bool}`. Any other GET path falls through to
the static SPA when `backend/static` exists (doc 01 §1).

### Stale research jobs (2026-08-30)

`run_research` is an in-process `asyncio` task started by `chat_service`. It does **not**
survive the worker dying — a deploy, a Cloud Run instance recycle, a crash, or `uvicorn
--reload` picking up an edit. Before this fix the row stayed `status="running"` forever and
the client polled until its own cap, which presents to the user as "the API is extremely
slow" when in fact nothing is running at all.

`GET /api/checks/{intake_id}` now treats a `pending`/`running` job older than
`RESEARCH_MAX_RUNTIME` (15 min) as dead: it flips the row to `failed` with a plain-language
error and returns that. Detection happens at **read time** rather than in a background
reaper — no schema change, correct with any worker count, and the very next poll gets a
real answer.

15 minutes is comfortably above a healthy run: the graph is bounded by
`MAX_GROUNDED_CALLS = 15` with a 40 s per-query timeout and `max_refine_iterations` search
rounds.

The frontend drops the area→conversation link on a failed audit, so the hub offers
"Analisis" again instead of an entry that bounces back to the error.

**Not fixed here:** there is still no retry endpoint — the buyer re-runs from the hub. A
durable queue (jobs surviving restarts) is the real answer and is out of prototype scope.
