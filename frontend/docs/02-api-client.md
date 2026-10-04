# 02 — API Client (`src/lib/api.ts`)

The only fetch layer. Same-origin `/api`; cookies carry the session
(`credentials: "include"` on every call). Mirrors the backend contract
(backend/docs/07; docs/05/12/13/14).

## 1. Core helper, token refresh & error model

`req<T>(path, init?, retried=false)` — fetch with credentials;
`Content-Type: application/json` added only when a body exists; non-OK →
`throw new ApiError(status, body.detail ?? statusText)` (body parsed best-effort).
`ApiError{status, detail}` — `detail` may be a string or the structured quota object
`{code: "quota_exceeded", tokens_used_today, token_limit, message}` (consumers
type-narrow on `detail.code`).

**Silent token refresh** (backend/docs/03 §1): the access cookie lives 1 day, the
refresh cookie 7 days. On a **401** (except for `/api/auth/*` paths themselves and
at most once per request) the client calls `tryRefresh()` — a single-flight
`POST /api/auth/refresh` shared by all concurrent 401s — and retries the original
request when it succeeds. A failed refresh lets the 401 propagate, which the
Workspace turns into the login modal.

## 2. Types (must mirror the backend JSON exactly)

`Confidence = "data_kuat" | "data_sedang" | "perlu_validasi"` ·
`Evidence{source_title, url|null, accessed_at, kind}` ·
`Finding{claim, evidence[], confidence, limitation, validation_action, is_red_flag,
is_critical, is_evidence_gap}` ·
`Category{category, label, weight, score|null, confidence, rationale, findings[]}` ·
`Report{report_type, property{name|null, formatted_address|null, lat|null, lng|null,
in_jabodetabek}, rls_score|null, band|null, band_label, recommendation,
recommendation_label, summary, categories[], red_flags[], evidence_gaps[],
checklist[{item, category, reason}], disclaimer}` ·
`MapFeature{kind, name, lat, lng, distance_km, label?, critical?, ingested_at?}` ·
`MapData{property, rls{score, band, band_label, recommendation_label},
category_scores, flood|null, elevation|null, nearest_toll|null,
nearest_station|null, facilities[], red_flags[]}` ·
`User{id, email, name, picture|null, tokens_used_today, token_limit}` ·
`Convo{id, title, state, project_id|null, intake_id|null, updated_at}` ·
`ChatMessage{id?, role: "user"|"assistant", content, suggestions?}` ·
`CheckResponse` = discriminated union on `status`:
`{status: "pending"|"running", categories_done?, progress?: {step, total, pct, label}}` |
`{status: "failed", error}` | `{status: "done", report}`. `progress` is server-owned loader
state (the FE renders it verbatim — see `watchResearch` / `ResearchLoading`).

## 3. Endpoint wrappers

- auth: `googleLogin(credential)` POST `/api/auth/google` · `me()` ·
  `logout()` POST · `updatePicture(picture_base64)` PUT `/api/auth/me/picture`
  (data-URI base64, ≤1 MB decoded; the `picture` field in `User` may be a data URI —
  it drops straight into `<img src>`).
- projects/conversations: `listProjects()`, `createProject(name)`,
  `renameProject(id, name)` PATCH, `listConversations()`,
  `createConversation(project_id?)`, `getConversation(id)` (→ Convo + `messages` +
  `job_status`).
- report/map: `getCheck(id)` → `CheckResponse`; `getMap(id)` → `MapData`.
- ops form: `createIntake(payload: IntakePayload)` → `{intake_id}` —
  `IntakePayload` mirrors backend `IntakeCreate` (snake_case, consents booleans).

## 4. `sendMessageSSE(convoId, content, onStatus) -> Promise<SendResult>`

POST `/api/conversations/{id}/messages` and **manually parse the SSE body** (POST →
can't use EventSource): read the stream with `TextDecoder`, split the buffer on
`\n\n`, parse `event:` / `data:` lines per frame (default event `message`).
A pre-stream **401** gets one `tryRefresh()` + re-POST before failing.
Dispatch: `status` → `onStatus(label)` (thinking indicator); `error` →
`throw ApiError(500, detail)`; `message` → capture
`SendResult{reply, suggestions, state, intake_id|null, research_started,
tokens_used_today, token_limit}`. Stream ends without a `message` event → throw
"Stream terputus. Coba lagi.". Non-OK pre-stream response → ApiError with the parsed
detail (this is how 401/402 surface).

## 5. `watchResearch(intakeId, onProgress, onFinished) -> stop()`

**REST polling** of `getCheck` (`GET /api/checks/{id}`) every 1.5 s, not SSE. The SSE
`/api/research/{id}/events` endpoint streams fine on Cloud Run but **Firebase Hosting
buffers it** (in prod the whole stream lands at once at the end → the loader sticks at
step 1 then jumps to done), so we poll instead — same behaviour local and prod. The poll
just **relays the server's own progress**: the backend owns step/pct/label; the FE never
fakes it. Each tick: `done` → `onFinished("done")`; `failed` → `onFinished("failed", error)`;
otherwise `onProgress({status, step, total, pct, label})` from `res.progress` (falls back to
`categories_done` if `progress` is absent). Transient fetch errors are swallowed and
retried; a ~11 min cap (440 polls) ends with `onFinished("failed", …)`. Returns a stopper
for unmount/convo-switch cleanup. (Backend `/events` is left in place but unused by the FE.)

## Routes (map)

`getRoutes(intakeId)` → `{station, toll}` of `{polyline, distance_km, duration_min, mode}`
(either may be `null`). Called by `Workspace.loadReportAndMap` **after** the report resolves
and deliberately not awaited — it is a billable Google Routes call and the workspace must
render without it. `MapPanelV3` decodes the polyline with the Maps `geometry` library and
falls back to a dashed straight line when the value is `null`.
