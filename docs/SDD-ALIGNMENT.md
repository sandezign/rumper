# SDD Alignment Register

> **Status:** Living document · opened 2026-08-29
> **Purpose:** keep `docs/` (the spec set that implementation is built from) true to the code
> that exists and to the code we are about to write for the UI/UX revamp.
> **Companions:** [18 — UX revamp adoption analysis](18-ux-revamp-adoption-analysis.md) ·
> [19 — Area boundaries & flood mapping](19-area-boundary-and-flood-mapping.md)

Rumper is built specs-first: `docs/` is the source of truth, not a description written after
the fact. That only holds if drift is found and closed deliberately. This file is where drift
is recorded, where the revamp's doc changes are tracked, and where the docs-first rule for the
adoption work is written down.

---

## 1. Document tiers

| Tier | Location | Owns | Changes when |
|---|---|---|---|
| **Vision** | `ARCHITECTURE.md`, `context.md`, business plan, PRD | why we exist, market, phasing | strategy changes |
| **Spec / contract** | `docs/00–19` | what we build + the FE/BE contract | before implementation |
| **Feature PRD** | `docs/prd/**` | per-surface product detail | before a surface is built |
| **Implementation** | `backend/docs/`, `frontend/docs/` | how the code actually works, file-by-file | with the code, same PR |
| **Design system** | `frontend/docs/design/` | tokens, components, visual truth | with design changes |

Precedence when sources conflict is set by `CLAUDE.md`: `docs/` wins over `ARCHITECTURE.md`
and the business tier; ADRs in `docs/02` win over older prose.

---

## 2. Drift found (verified against code, 2026-08-29)

Each row was checked by reading the implementation, not by comparing documents.

| # | Drift | Evidence | Severity | Fix |
|---|---|---|---|---|
| **D1** | `docs/13` §4 describes the quota as **"50,000 total tokens per user (lifetime, prototype)"**. The code implements a **daily** budget resetting at WIB midnight. | `backend/app/core/usage.py:1-2` docstring "Quota is a DAILY budget (50k tokens), resetting at midnight Asia/Jakarta (WIB)"; `_today_start_utc()`, `next_reset_iso()`, `tokens_used_today()` | **High** — the doc misstates the commercial model, and doc 18 §7.1 builds on it | rewrite `docs/13` §4 as a daily budget; state the reset time |
| **D2** | `CLAUDE.md` rule 8 names `docs/05` the FE/BE contract boundary, but `docs/05` documents **4 endpoints** (`POST /api/intakes`, `GET /api/checks/{id}`, `/routes`, `/health`) out of ~20 shipped. Auth, projects, conversations, chat SSE, places autocomplete, research events, `/map` and `/report.pdf` are specified only in `docs/12,13,14,16` prose or in `backend/docs/07`. | `grep '^## ' docs/05-api-contract.md`; `backend/app/routers/*.py` | **High** — there is no single contract to diff against when adding the revamp's endpoints | make `docs/05` the index of *all* endpoints; keep detail in the owning doc but list every route with its owner |
| **D3** | `docs/14` §1 states the map payload requires auth and ownership. `backend/docs/07` §8 states `GET /api/checks/{id}/map` is **"(no auth)"**. | `docs/14` §1 vs `backend/docs/07` §8 | **Medium** — a security-relevant contradiction across tiers | decide, then make both say the same thing |
| **D4** | `docs/00` §4 lists as out of scope: user accounts/auth, interactive map layers, multi-property compare, payments. Auth shipped (`docs/13`), interactive layers shipped (`docs/14`), and compare + payments are now requested by the revamp. | `docs/00` §4 vs `docs/13`, `docs/14`, PRD-12 | **Medium** — the scope statement no longer bounds anything | rewrite §4 as current scope + explicitly deferred |
| **D5** | `GET /api/checks/{id}/report.pdf` exists in code and is referenced by `docs/16` §4, but has **no contract-tier entry**. | `backend/app/routers/checks.py`; absent from `docs/05` | **Low** | add to `docs/05` with its daily cap |
| **D6** | `ARCHITECTURE.md` §4.3's 1–5 RLS formula is superseded by STD-SCR-001. | already flagged in `CLAUDE.md` + ADR-003 | Tracked | add an inline "superseded" banner in `ARCHITECTURE.md` §4.3 itself |

D1 and D2 should be closed **before** the revamp work starts, because doc 18's API delta and
entitlement analysis both build directly on them.

---

## 3. Change register for the revamp

What each spec doc must gain or lose to describe the new journey. Nothing in the "New content"
column is implemented until that doc is amended and reviewed — that is the docs-first rule
(§5).

| Doc | Change | New content | Wave |
|---|---|---|---|
| `00-overview.md` | **Rewrite §3 index + §4 scope** | add 18, 19, SDD-ALIGNMENT to the table; restate scope (D4) | 0 |
| `02-tech-stack-and-decisions.md` | **Add ADRs** | ADR-014 (kelurahan is the finest unit), ADR-015 (raster hazard, never synthesised polygons), ADR-016 (enable PostGIS — executes ADR-013), ~~ADR-017~~ **written**, ADR-018 (location quota vs token quota, doc 18 §7.1), ~~ADR-019~~ **written** | 0 |
| `04-data-model.md` | **Extend** | `buyer_profiles`, `profile_scenarios`; `checklist_state`; `check_progress`; `entitlements`; `shortlists` | 0–2 |
| `05-api-contract.md` | **Restructure + extend** | become the full route index (D2); add doc 18 §6.1–6.3 endpoints; add `report.pdf` (D5) | 0 |
| `07-scoring-and-confidence.md` | **Extend** | recommendation → property-status mapping (doc 18 §6.4); checklist `priority` derivation rule (GAP-20) | 1 |
| `09-frontend.md` | ~~Rewrite route map~~ **done (partial)** | English URL convention + legacy redirects landed; reserved revamp routes named. Still owed: asset + token adoption from the revamp `DESIGN.md` | 1 |
| `10-geo-data-warehouse.md` | **Extend** | §5 coordinate accuracy & provider reconciliation **written**; still owed: `geo_areas`, `geo_area_members`, `geo_area_facts`; BIG kelurahan ingestion job; InaRISK tile proxy (doc 19 §6) | 2 |
| `12-chat-workspace.md` | **Amend** | assistant as a drawer scoped to the active location; context contract per PRD-11 §8.4 | 2 |
| `13-auth-quota-usage.md` | **Rewrite §4, add §7** | fix D1; add location quota alongside the token ledger; entitlement model | 0 |
| `14-map-delivery.md` | **Amend §2, extend** | provider settled (ADR-017); `pos_source` provenance in the payload + rendering rule **written**; still owed: tab-aware layer config, hazard raster overlay + legend contract | 0–2 |
| `16-workspace-shell-and-analysis.md` | **Rewrite §3** | 3 tabs (Ringkasan/Bukti/Checklist) → 5 steps (Ringkasan/Faktor Risiko/Perjalanan/Checklist/Fasilitas); stepper; gating rules incl. the red-flag invariant (doc 18 §7.2) | 1 |
| `17-marketing-and-onboarding.md` | **Rewrite §4** | 7-step guided onboarding → scenario-led priority discovery producing a `BuyerPriorityProfile` | 2 |
| **new** `20-buyer-priority-profile.md` | **Create** | promote PRD-11 §9 schema + §10 scenario mapping rules to spec tier | 2 |
| **new** `21-curated-areas.md` | **Create** | promote PRD-12 to spec tier once doc 19 Wave B lands | 3 |
| **new** `22-entitlements-and-payment.md` | **Create** | promote PRD-04 + the commercial decision to spec tier | 4 |
| `ARCHITECTURE.md` | **Annotate** | superseded banner on §4.3 (D6); add areas + profile to §4 component map | 0 |
| `backend/docs/07-endpoints.md` | **Sync** | every contract change lands here in the same PR as the code | per wave |
| `frontend/docs/01-routing-and-workspace.md` | **Sync** | new routes + flow states | per wave |

---

## 4. Where the revamp's PRDs live

`rumper-web-gamification-main/docs/prd/PRD-00 … PRD-12` are the authoritative product intent
for the new journey and must not be lost when the prototype repo goes cold. They are **feature
PRD tier**, not spec tier.

**Action:** copy them into `docs/prd/revamp-2026-08/` in this repo, unmodified, with a
`README.md` stating: they are imported source material dated 2026-08-22; where they conflict
with `docs/00–19` or an ADR, the spec tier wins; and the conflicts already identified are
listed in doc 18 §7. Do not edit the imported files — record decisions against them in the
spec tier instead, so the original intent stays legible.

The prototype's `DESIGN.md` palette is the same system as
`frontend/docs/design/foundations/tokens.md` (`#00684a` / `#00ed64` / `#001e2b` + the
evidence positive/warning/danger ramp). Only a naming pass is needed — flat hex values in the
prototype map onto the existing `--brand-*` and `--semantic-*` variables. The illustration set
(`src/assets/illustrations/onboarding/*`, `mascott-rumper.webp`) and the Figma exports in
`src/imports/` are net-new assets: move them to `frontend/src/assets/` and register them in
`frontend/docs/design/`.

---

## 5. Docs-first rule for the adoption work

Binding for every change in doc 18's waves.

1. **No endpoint is implemented before its contract entry is merged.** A new or changed route
   lands in `docs/05` (and its owning doc) first, in its own review. The PR that adds the
   handler cites the contract section it implements.
2. **A mock is a contract implementation, not a shortcut.** Mocked endpoints match the
   accepted contract shape exactly and carry `"_mock": true` (doc 18 §8). Adding a mock does
   not skip step 1.
3. **A guardrail conflict is resolved in an ADR, not in a component.** The five conflicts in
   doc 18 §7 each need an ADR in `docs/02` before the affected UI is built.
4. **Implementation docs move with the code.** `backend/docs/` and `frontend/docs/` are
   updated in the same PR as the change they describe — they are rebuild-grade, so a stale one
   is a defect.
5. **Data-source additions are documented before ingestion.** Any new external dataset gets a
   row in `docs/10` §1 (source, method, cadence, table) and a note on its resolution and
   vintage before a job is written. Doc 19 §3 is the current backlog.
6. **Every user-visible number states where it came from.** Contract fields that carry
   resolution or aggregation caveats (`resolution_note`, `method`) are part of the contract,
   not optional decoration (doc 19 §7–8).

---

## 6. Definition of "aligned"

The SDD is aligned when all of the following hold. Check at the end of each wave.

- Every route in `backend/app/routers/` appears in `docs/05` with an owning doc.
- No statement in `docs/00–19` contradicts `backend/docs/` or `frontend/docs/`.
- Every ADR-worthy decision taken during the wave has an ADR in `docs/02`.
- `docs/00` §4 describes actual current scope.
- Every dataset queried in `backend/app/providers/` and `backend/app/jobs/` has a row in
  `docs/10` §1.
- No mock is live without a retirement condition and an owner in doc 18 §8.
- The red-flag exposure invariant (doc 18 §7.2) has a passing test.

---

## 6a. Decisions taken

| Date | Decision | Recorded in | Code landed |
|---|---|---|---|
| 2026-08-30 | **URLs are English; on-screen copy stays Bahasa Indonesia.** Legacy id-ID paths become permanent redirects. Convention, not an ADR — it governs naming, not architecture. | `docs/09` §Route convention; doc 18 §7.5 | `frontend/src/main.tsx` + 12 components |
| 2026-08-30 | **Google Maps is the sole map provider.** Revamp map design adopted, `react-leaflet` is not. | **ADR-017**; doc 18 §7.4 | — (Wave 1 UI) |
| 2026-08-30 | **OSM stays the warehouse; Google reconciles only what is rendered.** Tier 1 (true centroids) implemented; Tier 2 (place_id reconciliation) proposed; Tier 3 (Google-sourced warehouse) rejected on ToS + cost. | **ADR-019**; `docs/10` §5 | `providers/osm.py`, `services/spatial.py`, `docs/14`, `backend/docs/07`, `lib/api.ts` |

## 7. Immediate actions

Ordered. Items 1–3 are Wave 0 and block everything else.

1. **Close D1 and D2** — rewrite `docs/13` §4 (daily quota) and restructure `docs/05` into the
   full route index. Both are corrections to existing docs, not new design.
2. **Take the remaining decisions in doc 18 §7** — quota model, what gating may hide, price
   signal, stale scope — as ADR-014, ADR-016 and ADR-018. Map provider (ADR-017) and URL
   language are done; see §6a.
3. **Sign off doc 19 §5** (three-layer model) and run its §3 verification spike from a Cloud
   Run egress IP before committing to the BIG and InaRISK endpoints.
4. **Import the revamp PRDs** into `docs/prd/revamp-2026-08/` with the precedence README.
5. **Amend `docs/05`, `docs/07`, `docs/09`, `docs/16`** for Wave 1, then start the workspace
   re-skin — which needs no new backend concepts and delivers most of the visible revamp.
6. **Resolve D3, D4, D5** as part of the Wave 0 doc pass.
