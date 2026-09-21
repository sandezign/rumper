# CLAUDE.md — Rumper (root guardrails)

**Rumper** is a buyer-side **location risk advisor** for first-time homebuyers in Jabodetabek.
This repo holds the product/business docs **and** the working prototype of the **AI Research
Agent** that automates analyst desk research (SOP-RSCH-001) into a preliminary **Mini Check**.

We follow **Specs-Driven Development (SDD)**: implement from `docs/` — the spec set is the
source of truth. Start at [`docs/00-overview.md`](docs/00-overview.md).

## Canonical document hierarchy (when sources conflict)

1. `docs/` (this repo) — prototype specs, newest decisions (ADRs in `docs/02`).
2. `~/dev/rumper-2` — operations standards: **STD-SCR-001** (scoring), **SOP-RSCH-001**
   (research workflow), PRDs (universal app prompt, dashboard, intake).
3. `ARCHITECTURE.md`, `context.md`, business plan, PRD (this repo) — vision tier.
   Note: ARCHITECTURE.md §4.3's 1–5 RLS formula is **superseded** by STD-SCR-001 (0–100
   per category × weights). See ADR-003.

## Global rules (do not violate)

1. **AI never owns the final score or recommendation.** Category scores are proposed by
   researchers, clamped by deterministic rules; the RLS formula, bands, and red-flag
   override are **pure code** (`scoring.py`). Output is always a *preliminary* Mini Check
   labeled for human review — never a final human-reviewed recommendation.
2. **Every material finding carries evidence + confidence** (`Data kuat` / `Data sedang` /
   `Perlu validasi`) or is an explicit evidence gap. Never invent sources; grounded search
   citations only. Confidence describes evidence strength, not location quality.
3. **Critical red flags cannot be hidden by a high total score** (STD-SCR-001 §7 override).
4. **All LLM calls go through `backend/app/providers/llm.py`** (LangChain
   `ChatGoogleGenerativeAI`, structured output; no raw REST to Gemini). All external geo
   data through `backend/app/providers/` clients.
   **All prompts live as agent-skill-format `.md` files in `backend/app/prompts/`**
   (frontmatter: name/description/used_by/params; `$var` templating) — never inline
   prompt prose in code; use `app.prompts.render("<name>", **vars)`.
5. **No secrets in the repo or browser.** Keys live in `backend/.env` (gitignored) locally
   and Secret Manager (`rumper-env`) in GCP. Project: **`rumper-499015`**, region
   **`asia-southeast2` (Jakarta)**; all cloud resources named `rumper-*`.
6. **User-facing language is Bahasa Indonesia**; calm, non-alarmist, evidence-based tone.
   Always separate: score · evidence confidence · interpretation · missing info · next
   action. Always include the disclaimer (decision support, not a guarantee).
7. **No customer PII in the repo** — fictional data only in samples/tests/docs.
8. **Contract is the boundary**: FE/BE share `docs/05-api-contract.md`; JSON `snake_case`;
   IDs are UUIDs.
9. **Scope discipline**: prototype = intake → agent research → Mini Check. No accounts,
   payments, PDF generation, listings integration, or autonomous user-facing chat.

## Layout

- `backend/` — FastAPI + agent pipeline (Python 3.12, uv). Specs: `docs/01,03–08`;
  implementation docs: `backend/docs/` (rebuild-grade, keep in sync with code).
- `frontend/` — Vite + React static SPA: chat workspace + intake + Mini Check result,
  served by the backend in prod (ADR-009). Specs: `docs/09,12,14`; implementation
  docs: `frontend/docs/`.
- `docs/` — prototype spec set (`00-overview.md` is the index).
