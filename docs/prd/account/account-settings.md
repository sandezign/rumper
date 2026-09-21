# PRD: Account & Quota Settings

## Metadata

| Field | Value |
|-------|-------|
| **Author** | Antigravity AI |
| **Status** | Draft |
| **Created** | 2026-07-08 |
| **Last Updated** | 2026-07-08 |
| **Version** | 0.1 |
| **Related Docs** | `docs/13-auth-quota-usage.md` |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?

> In an AI-heavy application like Rumper, deep research pipeline executions consume a significant amount of LLM tokens. Without strict metering and quota enforcement, a single user could inadvertently or maliciously rack up enormous cloud costs. We need a billing-grade ledger to track real unit economics from day one, and users need a transparent interface to manage their identity and view their token usage.

**Evidence:**
- Deep research runs are the most expensive path in the application.
- Relying solely on Google OAuth state (or expiring picture URLs) causes session instability; we need first-party sessions that we completely control.
- To establish a future pricing model (monetization foundation), we must learn the real cost per "Mini Check" based on actual user behavior.

**Key Insight:**
Auth is not just about logging in; it's the gateway to cost control. Google Sign-In simply proves identity, but our backend must issue proprietary JWTs, strictly meter every LLM call before execution, and store this in an append-only ledger (`usage_events`) separate from debugging traces (LangSmith).

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Cost control & prevention | Max tokens used per unpaid user | Strict enforcement of the 50,000 token limit |
| G2 | Unit economic visibility | Ledger accuracy | 100% of LLM calls accurately recorded in `usage_events` |
| G3 | Session security | Unauthorized access | Zero successful reuse of rotated refresh tokens |

---

## 3. Non-Goals

- **Not building:** A paid subscription tier or payment gateway (yet). The UI will only show upgrade-interest CTAs upon hitting the quota.
- **Not solving for:** Password-based or email-link authentication. We are exclusively using Google Sign-In.
- **Not changing:** LangSmith's role. LangSmith remains for debugging/evals, while our internal ledger is for billing.

---

## 4. Target Users

### Primary Persona
- **Who:** All registered Rumper users (First-time home buyers).
- **Context:** They are using the app and might run multiple location checks, consuming tokens.
- **Motivation:** To understand how many "free" checks they have left and to manage their basic profile (name, avatar, logout).
- **Current workaround:** N/A (New feature)
- **Jobs to be done:** "As a user, I want to see how much of my free quota I've used so that I don't run out of tokens in the middle of analyzing an important property."

---

## 5. User Stories & Key Flows

### Story 1: Viewing Profile & Usage
**As a** logged-in user, **I want to** access my account settings, **so that** I can see my profile details and check my remaining token quota.

**Flow:**
1. User clicks their profile avatar in the Global Header.
2. User is routed to `/app/account`.
3. User views their mirrored Google profile picture, name, and email.
4. User views a progress bar showing their token usage (e.g., 20,000 / 50,000 tokens used).
5. User clicks "Keluar" to securely log out.

### Story 2: Hitting the Quota Limit
**As an** active user, **I want to** be notified when I hit my token limit, **so that** I understand why the AI cannot perform further research.

**Flow:**
1. User attempts to start a new chat or research job.
2. The backend checks `users.tokens_used` against `users.token_limit`.
3. The limit is exceeded, returning a `402 quota_exceeded` error.
4. The frontend catches the error and displays a modal/state indicating the quota is exhausted, with a CTA to express interest in upgrading.

---

## 6. Solution Overview

**Approach:** 
Implement a robust first-party session mechanism atop Google Identity Services, paired with a strict, choke-point LLM usage ledger.

**Key Design Decisions:**

1. **First-Party JWTs with Refresh Rotation.** We do not rely on Google's session. We issue a 1-day HS256 JWT access token and a 7-day opaque refresh token (stored as SHA256 hashes). Presenting a rotated token revokes the entire token family to prevent theft.
2. **Append-Only Usage Ledger.** Every Gemini response is captured at a single choke point (`providers/llm.py`) and recorded in `usage_events` with calculated costs based on the `model_prices` table.
3. **Mirrored Profile Pictures.** We download the user's Google avatar (max 1 MB) and store it as a base64 data URI to prevent broken images when Google's signed URLs expire.

---

## 7. Technical Scope

### Affected Architecture Layers

| Layer | Changes | Details |
|-------|---------|---------|
| **Database** | Modified | `users` (added tokens/picture), `refresh_tokens`, `usage_events`, `model_prices` tables. |
| **Backend** | Modified | `POST /api/auth/google`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`. LLM provider choke point. |
| **Frontend** | Modified | `/app/account` view, Axios interceptors for 401 refresh logic, and 402 quota handling. |

### API Surface
- [x] **New endpoints/procedures:** 
  - `PUT /api/auth/me/picture` (Upload custom avatar)
- [x] **Modified endpoints/procedures:**
  - `POST /api/auth/google` (Handles GIS credential and issues cookies)
  - `POST /api/auth/refresh` (Rotates refresh token)

---

## 8. Hypotheses & Assumptions

| # | Hypothesis | Validation Method | Status |
|---|-----------|-------------------|--------|
| H1 | We believe 50,000 tokens is sufficient for a user to complete 1-2 full Mini Checks. | We'll know we're right if the average `tokens_used` for 2 completed deep researches is < 50k. | Unvalidated |
| H2 | We believe storing profile pictures as base64 URIs in PostgreSQL will prevent UI broken image issues. | We'll know we're right if we see 0 frontend errors related to expired avatar image URLs. | Unvalidated |

**Key assumptions that could invalidate this plan:**
- **Base64 DB Bloat.** Storing images directly in the DB could bloat row sizes. **Mitigation:** Strict 1MB size limit and only using this for avatars, not general media.

---

## 9. Success Metrics

### Primary KPI
- **Metric:** Token Ledger Accuracy
- **Target:** The sum of `usage_events.total_tokens` matches `users.tokens_used` exactly for all users.

### Secondary KPIs
- **Metric:** Quota hit rate
- **Target:** Measure the percentage of users who hit the 50k cap to determine pricing tiers.

### Guardrail Metrics (must not regress)
- **API Security:** 0 successful CSRF or stolen token reuse attacks.

---

## 10. Risk Assessment

| Risk Type | Level | Description | Mitigation |
|-----------|-------|-------------|------------|
| **Value** | Low | Essential for business survival (cost control). | |
| **Usability** | Low | Transparent background token refresh. | Frontend Axios interceptors handle the 401 -> refresh -> retry flow automatically. |
| **Feasibility**| Medium | Implementing strict refresh token rotation requires precise DB transactions. | Follow documented best practices for token family revocation. |
| **Viability** | High | Critical for controlling Gemini API costs. | Hard cap enforced before any LLM execution. |

---

## 11. Dependencies & Risks

### Third-Party Dependencies
- [x] **Google Identity Services (GIS)** — Required for ID token issuance.
- [x] **Gemini API** — Usage metadata parsing depends on their response schema stability.

---

## 12. Implementation Approach

### PR Breakdown Strategy

| # | PR Scope | Estimated Size | Dependencies | Labels |
|---|----------|---------------|--------------|--------|
| 1 | DB Schema (`users`, `refresh_tokens`, `usage_events`, `model_prices`) | ~150 lines | None | `database`, `backend` |
| 2 | Auth Endpoints (Google GIS, Refresh, Logout, Security Headers) | ~400 lines | PR 1 | `backend`, `auth` |
| 3 | LLM Usage Choke Point & Ledger Insertion | ~200 lines | PR 1 | `backend`, `ai` |
| 4 | Frontend Account View (`/app/account`) & Axios Interceptors | ~300 lines | PR 2, 3 | `frontend` |

---

## 13. Stakeholder Sign-Off

| Role | Name | Status |
|------|------|--------|
| PM | [TODO] | [ ] Approved |
| Eng Lead | [TODO] | [ ] Approved |
| Design | [TODO] | [ ] Approved |
