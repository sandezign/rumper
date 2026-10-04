# 03 — Auth, Sessions & Usage Metering

Source: `app/core/auth.py`, `app/core/security.py`, `app/core/usage.py`.
Spec: docs/13.

## 1. First-party token pair (`core/auth.py`)

Google login is identity proof only; sessions are our tokens. Constants:
`ACCESS_COOKIE = "rumper_access"` (TTL 1 day) · `REFRESH_COOKIE = "rumper_refresh"`
(TTL 7 days, cookie `path="/api/auth"` so it never rides ordinary API calls) ·
`MAX_PICTURE_BYTES = 1_048_576`.

- `verify_google_credential(credential)` — GETs
  `https://oauth2.googleapis.com/tokeninfo?id_token=<credential>` (httpx, timeout 10 s).
  Non-200 → `401 "Login Google tidak valid."`. The token's `aud` must equal
  `settings.google_oauth_client_id`, else `401 "... (aud)."`. Returns the tokeninfo
  payload (`sub`, `email`, `name`, `picture`).
- **Access token** (stateless): `make_access_token(user_id)` — HS256 JWT
  `{"uid", "typ": "access", "iat", "exp": now + 1d}` signed `settings.app_secret`.
  `_decode_access` pins `algorithms=["HS256"]`, requires `typ == "access"`, and
  returns `None` on **any** failure — invalid token simply means unauthenticated.
- **Refresh token** (stateful, single-use): raw value `secrets.token_urlsafe(48)`;
  only its **sha256 hex** is stored (`refresh_tokens` row with `expires_at`,
  doc 02 §3).
  - `new_refresh_token(db, user_id) -> raw` — adds the row (caller commits).
  - `rotate_refresh_token(db, raw) -> (User, new_raw) | None` — looks up by hash.
    Row missing or expired → None. Row already revoked → **reuse detection**: the
    cookie leaked, so every active refresh token of that user is revoked, then None.
    Valid → mark revoked, issue a replacement, commit, return it.
  - `revoke_refresh_token(db, raw)` — logout path.
- Dependencies: `optional_user` reads the `rumper_access` cookie → `User | None`;
  `current_user` raises `401 "Silakan masuk terlebih dahulu."` when `None`.
- `check_quota(db, user) -> int` — computes `tokens_used_today`; if
  `used >= user.token_limit` raises **402** with structured detail:
  ```json
  {"code": "quota_exceeded", "tokens_used_today": <int>, "token_limit": <int>,
   "message": "Kuota token harian Anda habis. Kuota direset setiap tengah malam WIB."}
  ```
  Otherwise returns today's usage. Called **before** the LLM turn (doc 07 §4).

Cookie attributes (set via `_set_auth_cookies` in `routers/auth.py`): both
`httponly`, `samesite=lax`, and `secure` iff **the request arrived over https**
(`_forwarded_proto(request) == "https"`) — robust for a local http backend, prod, and a
dev server proxied to a remote API alike (the comma-separated `frontend_origin` can't
decide this — it may list both http and https origins). access `max_age=86400`, refresh
`max_age=7*86400` + `path=/api/auth`.

## 1.1 Profile picture storage (base64, ≤1 MB)

Google picture URLs expire/rate-limit, so avatars are **mirrored** into
`users.picture_base64` as a `data:image/...;base64,...` URI; `users.picture` keeps
the original URL only as fallback (`_user_json` prefers the mirror).

- `_sniff_image(bytes) -> mime | None` — magic bytes only: PNG `\x89PNG\r\n\x1a\n`,
  JPEG `\xff\xd8\xff`, WebP `RIFF....WEBP`. The declared mime is never trusted.
- `fetch_picture_base64(url)` — login-time mirror: GET (follow redirects, 10 s),
  reject non-200 / empty / > 1 MB / unsniffable; returns a data URI or `None`.
  Best-effort — failures must never break login.
- `validate_picture_data_uri(value)` — user-upload validation for
  `PUT /api/auth/me/picture`: strict regex
  `data:image/(png|jpeg|jpg|webp);base64,<base64>`, strict b64decode, decoded size
  ≤ 1 MB (else **413** "Ukuran gambar maksimal 1 MB."), magic-byte sniff (else
  **422**); returns the value re-encoded with the *sniffed* mime. The Pydantic field
  caps the raw payload at 1.5 M chars before any decode work.

## 1.2 HTTP hardening (`core/security.py`)

- `SecurityHeadersMiddleware` (outermost) — on every response:
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  (camera/mic/geolocation off), HSTS (1 y, includeSubDomains) when the forwarded
  proto is https, `Cache-Control: no-store` for `/api/*` (setdefault — SSE handlers
  keep their own `no-cache`).
- `OriginCheckMiddleware` — CSRF defense-in-depth on top of SameSite=Lax: unsafe
  methods (POST/PUT/PATCH/DELETE) on `/api/*` with an `Origin` header that is in
  neither `settings.frontend_origins` (the comma-split allow-list) nor our own origin
  (x-forwarded-proto + Host) → `403 {"detail": "Origin tidak diizinkan."}`. Requests
  without Origin (curl, server-to-server) pass — this guards browsers, not clients.
  `FRONTEND_ORIGIN` is comma-separated, so prod can additionally allow a dev origin —
  e.g. `https://rumper.web.app,http://localhost:3000` lets a local FE (mode B) talk to
  prod (CORS `allow_origins` uses the same list).
- `rate_limit(name, limit, window_seconds)` — dependency factory; per-IP sliding
  window (`X-Forwarded-For` first hop, else peer address) in a process-local dict →
  **429** "Terlalu banyak percobaan. Coba lagi sebentar lagi.". Applied to
  `/api/auth/google` (10/min) and `/api/auth/refresh` (30/min). Limitation: state is
  per instance — fine for the prototype, move to Redis/Cloud Armor for real scale.

## 2. Daily quota window

Quota is a **daily** budget resetting at midnight Asia/Jakarta:
`WIB = timezone(timedelta(hours=7))`; `_today_start_utc()` = today 00:00 WIB converted
to UTC. `tokens_used_today(db, user_id)` =
`SUM(usage_events.total_tokens) WHERE user_id = :uid AND created_at >= today_start`
(coalesced to 0).

## 3. Attribution via ContextVar

`usage_ctx: ContextVar[dict]` carries `{user_id, conversation_id, job_id, operation}`.
Setters:
- chat service sets `{user_id, conversation_id, operation: "chat_turn"}` per turn;
- the research spawner copies `{user_id, conversation_id, job_id}` into the background
  task's context (ContextVars don't cross `create_task` unless set inside);
- graph nodes call `set_operation("plan"|"search"|"assess"|"extract"|"compose")`
  before their LLM calls (copy-and-set so sibling tasks don't clobber each other).

`providers/llm.py` is the single metering point: after every model response it calls
`record_llm_usage(model, input_tokens, output_tokens)` with the LangChain
`usage_metadata`.

## 4. Recording + pricing (`record_llm_usage`)

Wrapped in `try/except` that logs and swallows everything — **metering must never
break a request**. Steps:
1. Read `usage_ctx`; `total = input + output`.
2. Price lookup `_prices(model)` — module-level dict cache over `model_prices`
   (unknown model → `(0, 0)`).
3. `cost = (input·p_in + output·p_out) / 1_000_000` (Decimal).
4. In a fresh session: insert `UsageEvent(user_id?, operation
   (default "unknown"), model, tokens, est_cost_usd, meta={conversation_id?, job_id?})`
   and, when a user is attributed, `UPDATE users SET tokens_used = tokens_used + total`.

`seed_model_prices()` (lifespan startup) upserts defaults with
`ON CONFLICT (model) DO NOTHING` — estimates, verify against the official price list:

| model | input $/1M | output $/1M |
|---|---|---|
| `gemini-3.5-flash` | 0.30 | 2.50 |
| `gemini-3.1-flash-lite` | 0.10 | 0.40 |

Dev reset: `make reset-usage [EMAIL=...]` deletes today's (WIB) usage_events rows.
