# 00 — Overview: Rumper AI Research Agent Prototype

> **Status:** Approved for build · June 2026
> **GCP project:** `rumper-499015` · Region `asia-southeast2` (Jakarta)
> **Scope:** Working prototype — intake → automated desk research → preliminary Mini Check

## 1. What we are building

An **AI research agent system** that automates the analyst desk-research workflow
(SOP-RSCH-001, `~/dev/rumper-2/operations/research/`) so a first-time buyer who submits a
shortlisted location receives an evidence-grounded, preliminary **Mini Check** in minutes
instead of hours:

1. **Intake** — buyer submits location + context (workplace, transport mode, concerns).
2. **Research pipeline** — five category researchers run in parallel:
   flood resilience · commute efficiency · physical access · essential facilities ·
   environment & red flags. Each produces *findings* with evidence, confidence labels,
   limitations, and field-validation actions.
3. **Scoring engine (pure code)** — STD-SCR-001: 0–100 per category × weights
   (30/25/15/15/15), interpretation bands, red-flag override, recommendation rules.
4. **Mini Check report** — Bahasa Indonesia summary + findings + checklist + disclaimer,
   delivered to the frontend result view. Explicitly preliminary; final reports remain
   human-reviewed (concierge workflow unchanged).

This is the "analyst copilot" position allowed by ARCHITECTURE.md §5: AI assists research
and explanation; **AI does not own the score**.

## 2. Why this fits the validated strategy

- Pre-mortem tiger #1 (inconsistent scoring) → deterministic scoring engine + rubric in code.
- Pre-mortem tiger #2 (data accuracy) → per-finding source, access date, confidence,
  evidence-gap handling; grounded search citations only.
- Pre-mortem tiger #6 (unbounded research time) → per-category timeout + stop rules.
- Operations-first principle (rumper-2 README) → the agent first serves the **internal
  analyst** and the Mini Check preview; it does not replace quality review.

## 3. Spec set (read in order)

| Doc | Contents |
|---|---|
| [01-prototype-architecture.md](01-prototype-architecture.md) | Runtime topology, components, data flow |
| [02-tech-stack-and-decisions.md](02-tech-stack-and-decisions.md) | Stack + ADR-001…ADR-008 |
| [03-project-structure.md](03-project-structure.md) | Backend/frontend file layout |
| [04-data-model.md](04-data-model.md) | Postgres schema (`rumper` db) |
| [05-api-contract.md](05-api-contract.md) | REST contract (FE/BE source of truth) |
| [06-agent-pipeline.md](06-agent-pipeline.md) | Researchers, prompts, guardrails, stop rules |
| [07-scoring-and-confidence.md](07-scoring-and-confidence.md) | STD-SCR-001 in code |
| [08-gcp-and-deployment.md](08-gcp-and-deployment.md) | APIs, keys, secrets, Cloud Run path |
| [09-frontend.md](09-frontend.md) | Design language (MongoDB-inspired tokens) + route map; ops fallback views |
| [10-geo-data-warehouse.md](10-geo-data-warehouse.md) | Batch-ingested geo datasets + SpatialFacts |
| [11-deep-research-graph.md](11-deep-research-graph.md) | LangGraph plan/search/assess/refine workflow (supersedes 06's single-pass orchestration) |
| [12-chat-workspace.md](12-chat-workspace.md) | Chat-first UI, guided intake, report QA, guardrails |
| [13-auth-quota-usage.md](13-auth-quota-usage.md) | Google login, 50k-token quota, usage ledger, pricing table |
| [14-map-delivery.md](14-map-delivery.md) | Map workspace region (rich data delivery) |
| [15-llm-model-cost-comparison.md](15-llm-model-cost-comparison.md) | Gemini 3.5/3.1 vs 2.5-flash cost & capability analysis, model recommendation |
| [16-workspace-shell-and-analysis.md](16-workspace-shell-and-analysis.md) | Three-region app shell + Mini Check analysis region |
| [17-marketing-and-onboarding.md](17-marketing-and-onboarding.md) | Landing → register/login → onboarding flow |
| [18-ux-revamp-adoption-analysis.md](18-ux-revamp-adoption-analysis.md) | Gap analysis: revamped UI/UX journey → integrated backend; API delta, mock strategy, adoption waves |
| [19-area-boundary-and-flood-mapping.md](19-area-boundary-and-flood-mapping.md) | Area geometry & flood-hazard rendering: source survey, kelurahan/raster decision, proposed ADR-014…016 |
| [21-curated-areas-api.md](21-curated-areas-api.md) | Curated-areas hub: field inventory, profile-scoped API contract, deterministic vs agent split, cost model |
| [SDD-ALIGNMENT.md](SDD-ALIGNMENT.md) | Living register: doc↔code drift, per-doc change list for the revamp, docs-first rule |

UI design system (vendored, source of truth for visuals): [`frontend/docs/design/`](../frontend/docs/design/README.md).
Implementation tier (rebuild-grade, file-by-file): [`backend/docs/`](../backend/docs/README.md)
and [`frontend/docs/`](../frontend/docs/README.md). This set (00–17) stays the
*what/why* + contract tier; those document *how* the code implements it.

## 4. Out of scope (prototype)

User accounts/auth, payments, PDF generation, multi-property compare, interactive map
layers, monitoring/alerts, user-facing chat agent, geography outside Jabodetabek,
ML-based scoring. These stay gated per ARCHITECTURE.md §6/§7.

## 5. Definition of done (prototype)

- A real Jabodetabek address submitted through the frontend returns, within ~3 minutes,
  a Mini Check where: all five categories are scored or explicitly evidence-gapped;
  every material finding has a source and confidence label; RLS, band, and recommendation
  come from the deterministic engine; red-flag override is enforced; output is Bahasa
  Indonesia with the standard disclaimer.
