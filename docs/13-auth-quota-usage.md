# 13 — Auth, Token Quota & Usage Ledger (monetization foundation)

We meter **every LLM invoke per user** from day one to learn real unit economics
(mirrors nihonjung's `usage_events` pattern, doc 29 there).

## 1. Auth — Google Sign-In as identity proof, first-party sessions

Google login only proves identity; sessions are **our** tokens — we never depend on
Google OAuth state (or its expiring picture URLs) after sign-in:

- Frontend uses Google Identity Services (GIS) → ID token (`credential`).
- `POST /api/auth/google {credential}` → backend verifies against
  `https://oauth2.googleapis.com/tokeninfo` (aud must equal `GOOGLE_OAUTH_CLIENT_ID`)
  → upsert `users` by `google_sub` (identity fields refreshed on every login) →
  issue the token pair as httpOnly cookies (`secure` outside localhost,
  `SameSite=Lax`):
  - **access token** — 1-day HS256 JWT `rumper_access` (signed `APP_SECRET`,
    `typ: access`), checked by every authenticated route;
  - **refresh token** — 7-day opaque secret `rumper_refresh` (cookie path
    `/api/auth` only), stored **sha256-hashed** in `refresh_tokens` and
    **single-use**: `POST /api/auth/refresh` rotates it (old revoked, new issued)
    and returns a fresh access token. Presenting an already-rotated token = stolen
    cookie → all of that user's refresh tokens are revoked.
    `POST /api/auth/logout` revokes the token and clears both cookies.
  - Frontend refreshes transparently: a 401 triggers one single-flight
    `/api/auth/refresh` then a retry; if that also fails, the login modal opens.
- **Profile picture is mirrored, not hot-linked**: at login the backend fetches the
  Google avatar bytes and stores them as a base64 data URI in
  `users.picture_base64` (PNG/JPEG/WebP decided by magic-byte sniffing, **max 1 MB**
  decoded). Users can replace it via `PUT /api/auth/me/picture {picture_base64}`
  (same validation). `/api/auth/me` serves `picture_base64` first, the Google URL
  only as fallback.
- UX: anyone can browse; clicking send on the first message without a session opens
  the **login modal** (docs/12 UI). The modal copy includes the privacy/consent line
  (so chat-created intakes don't need separate consent checkboxes).
- The OAuth client secret stays unused for the GIS ID-token flow (kept for future
  server-side flows).

## 2. Tables

**users** — `id · google_sub unique · email · name · picture (URL fallback) ·
picture_base64 (data URI ≤1 MB) · tokens_used bigint · token_limit int (default
50000) · created_at`.

**refresh_tokens** — `id · user_id fk cascade · token_hash sha256 unique ·
expires_at · revoked_at? · created_at`. Raw secrets never stored.

**usage_events** (append-only ledger) — `id · user_id · provider ("gemini") · kind
("llm") · operation (chat_turn | plan | search | assess | extract | compose | summary)
· model · input_tokens · output_tokens · total_tokens · est_cost_usd numeric(12,6) ·
meta jsonb (conversation_id, job_id, trace hints) · created_at`.

**model_prices** — `model pk · input_usd_per_1m numeric · output_usd_per_1m numeric ·
updated_at`. Seeded with `gemini-3.5-flash` (estimate — **verify against the official
price list before launch**). Cost per event = tokens/1M × price; recomputable later
since raw token counts are stored.

## 3. Capture point — `providers/llm.py` (single choke point, CLAUDE.md rule 4)

- A `ContextVar` carries `{user_id, conversation_id, job_id, operation}`; the chat
  service and orchestrator set it before calls.
- After every Gemini response, read `usage_metadata` (prompt/candidates/thoughts token
  counts) → insert `usage_events` row + atomic `users.tokens_used += total`.
- No user context (e.g. ops-form intake without login) → event with `user_id=null`
  is still written (cost audit complete even when unowned).
- LangSmith traces the same calls (ADR-011); the ledger is our **billing-grade** copy,
  LangSmith is debugging/eval (same separation nihonjung uses).

## 4. Quota enforcement

- Default cap: **50,000 total tokens per user** (lifetime, prototype) — settings
  `default_token_limit`, per-user override via `users.token_limit`.
- Checked **before** metered work: each chat turn, and before starting a research job
  (which is the expensive path — a deep-research run consumes a large share of the cap;
  that is intentional: we learn what real limits/pricing must be).
- Over cap → HTTP 402 `{"detail": "quota_exceeded", "tokens_used", "token_limit"}`;
  UI shows the quota state and an upgrade-interest CTA (no payment yet).
- Sidebar shows a usage meter (`tokens_used / token_limit`) from `/api/auth/me`.

## 5. What we learn (monetization questions this answers)

1. Real cost per Mini Check (sum of a job's usage_events) vs. Rp tiers in the business plan.
2. Chat-turn cost distribution → free-tier sizing.
3. Cap-hit rate → conversion pressure point for paid tiers.

## 6. API security baseline (FE↔BE communication)

Minimum standard enforced in code (`app/core/security.py` + cookie settings), on top
of the CORS allow-list:

1. **Cookies**: httpOnly (no JS access), `SameSite=Lax`, `Secure` outside localhost;
   the refresh cookie is path-scoped to `/api/auth` so it never rides ordinary API
   calls.
2. **CSRF defense-in-depth**: unsafe `/api` requests (POST/PUT/PATCH/DELETE) with an
   `Origin` header that is neither `FRONTEND_ORIGIN` nor our own origin → 403.
3. **Security headers** on every response: `X-Content-Type-Options: nosniff`,
   `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
   `Permissions-Policy` (camera/mic/geolocation off), HSTS when HTTPS, and
   `Cache-Control: no-store` for `/api/*`.
4. **Rate limiting** (per-IP, in-memory per instance): `POST /api/auth/google`
   10/min, `POST /api/auth/refresh` 30/min → 429.
5. **Token hygiene**: algorithm pinned to HS256 with `typ` claim check; refresh
   secrets hashed at rest; rotation reuse-detection revokes the token family;
   uploaded images validated by magic bytes + 1 MB cap (declared mime not trusted).
