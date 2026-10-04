# 18 — UX Revamp Adoption Analysis (gamification journey → integrated app)

> **Status:** Analysis · draft for approval · 2026-08-29
> **Sources scanned:** `~/dev/rumper-apps/rumper` (integrated app, this repo) and
> `~/dev/rumper-apps/rumper-web-gamification-main` (UI/UX revamp, frontend-only).
> **Companion docs:** [19 — Area boundaries & flood mapping](19-area-boundary-and-flood-mapping.md) ·
> [SDD-ALIGNMENT.md](SDD-ALIGNMENT.md)

This document answers one question: **what has to be true for the revamped post-login
journey to run on the real backend?** It is the analysis tier — it does not specify
implementation. Every API change it proposes lands in `docs/05` (contract) before code,
per CLAUDE.md rule 8.

---

## 1. Method

The revamp repo is a Figma-Make prototype: React 19 + Vite + Tailwind v4 + **react-leaflet**,
no router, no data layer, all state in `App.tsx` and `useWizardStore.ts`, all content from
`src/data/mockCuratedAreas.ts` and `src/data/mockProperties.ts` or inlined in components.
It carries its own PRD set (`docs/prd/PRD-00 … PRD-12`) which is the authoritative statement
of intent for the new journey.

The scan was done in three passes:

1. **Journey diff** — enumerate every screen/state the revamp can reach, and place each one
   against the shipped journey (`docs/16`, `docs/17`).
2. **Field-level data-flow scan** — for each rendered value in the revamp, trace where the
   equivalent value would come from in the integrated stack (endpoint → service → provider →
   dataset), and record where the trace dead-ends.
3. **Guardrail check** — test each new behaviour against the non-negotiables in
   `CLAUDE.md`, the ADRs (`docs/02`) and STD-SCR-001.

Everything below is derived from reading both codebases, not from the PRDs alone; where a
PRD claims a capability the code does not have, that is called out.

---

## 2. The two journeys

**Shipped today** (`docs/17` → `docs/16`):

```
/  landing ──▶ /masuk Google Sign-In ──▶ /app  LocationHome (1 address)
   ──▶ /app/mulai  7-step guided onboarding ──▶ POST /api/conversations/from-intake
   ──▶ ResearchLoading (polls GET /api/checks/{id})
   ──▶ /app/c/:threadId  three-region workspace
        [assistant rail 340px] [analysis: Ringkasan · Bukti · Checklist] [Google map 55vw]
```

**Revamp** (`App.tsx` `appFlowState`, PRD-11 + PRD-12 + PRD-00):

```
wizard (Setup Gravitasi: 5 narrative stages + 4 parameter steps)
   ──▶ loading (LocationDataLoadingScreen, ~2.5 s synthesis animation)
   ──▶ curated-areas (Hub: 8 Jabodetabek corridors · Peta / Daftar / Shortlist
                      + AreaDetailDrawer + AreaComparisonModal)
   ──▶ UnlockAreaQuotaModal ("1 kuota akan digunakan")
   ──▶ workspace (5-step stepper, per-property)
        Tahap 1 Ringkasan · 2 Faktor Risiko · 3 Perjalanan · 4 Checklist · 5 Fasilitas
        + VerticalTimeline, SubHeaderTabs, Leaflet MapPanel, AssistantDrawer,
          PropertyModal (multi-property, quota 5), UpgradeBanner/Drawer (Rp50.000)
```

The structural change is not cosmetic. The shipped app is **one address → one report,
metered by LLM tokens**. The revamp is **a buyer profile → a set of candidate areas → a
metered set of per-location reports, sold per location**. Three whole concepts appear that
the backend has never modelled: a **persistent buyer profile**, an **area** (as a
first-class entity above a property), and a **location-scoped entitlement**.

The five workspace tabs, by contrast, map cleanly onto the existing Mini Check report.
That is the good news, and it is where adoption should start.

---

## 3. Surface inventory

| Revamp surface | Nearest shipped surface | Verdict |
|---|---|---|
| `ResponsiveWizardShell` + `Stage1…Stage4` | `Onboarding.tsx` (7-step guided) | ✅ **Ported** → `features/onboarding/wizard/`, mounted at `/app/start` |
| `wizard/steps/Step1…Step4` | onboarding steps 1–6 | ✅ **Ported**; output persisted via `lib/profile.ts` (GAP-01 tier 0) |
| `LocationDataLoadingScreen` | `ResearchLoading.tsx` | ✅ **Ported** as the areas synthesis loader. NOTE: it is a *client-side* animation over a mock fetch — the **research** loader must keep using server-owned progress (docs/05) |
| `curated-areas/*` (6 components) | — none — | ✅ **Ported** (6 of 7) → `features/areas/`; `CuratedAreasMapScreen` excluded — Leaflet, needs Google Maps rebuild (ADR-017) |
| `AppHeader` (property picker, quota, plan badge) | `AppShellV3` header | ✅ **Ported** as `JourneyHeader` — location switcher, Profil Kamu, quota chip, plan badge |
| `SubHeaderTabs` + `VerticalTimeline` | analysis tabs (Ringkasan/Bukti/Checklist) | ✅ **Ported** — 5-step `StepTabs` with lock states, `features/workspace/parts.tsx` |
| `ScoreCard` | `analysis/ScoreCard.tsx` | ✅ **Ported** as `RingkasanCard` (Tahap 01 gauge, band, evidence strength, source count) on the real report |
| `FactorRisksCard` | `OverviewPanelV3` findings grid | ✅ **Ported** as `FactorList` — 5 categories, score bars, confidence chips, red-flag pill |
| `DeepDiveEvidenceWorkspace` | `EvidencePanelV3` | **Port visual**, same data |
| `CommuteWorkspace` | (map "Perjalanan" tab, `/routes`) | **Port**, needs contract extension |
| `ChecklistWorkspace` | analysis Checklist tab | **Port**, needs persistence |
| `FasilitasWorkspace` | `FacilitiesPanelV3` | **Port visual**, same data |
| `MapPanel` (react-leaflet) | `v3/MapPanelV3` (Google Maps) | ✅ **Rebuilt** on `@vis.gl/react-google-maps` as `workspace/ReportMap` — layer pills, kind markers, radius, evidence bar, fullscreen (ADR-017) |
| `AssistantDrawer` | `AssistantColumnV3` + chat SSE | **Port visual**, rewire context |
| `UpgradeBanner` / `LockedStepCard` | `QuotaModal.tsx` | ✅ **Ported** as `LockedSteps` (Rp50.000 banner + Tahap 2–5 locked cards); payment itself still GAP-12 |
| `PropertyModal` (5-location list) | Active Audit selector (conversations) | **Merge** — same idea, different quota semantics |
| `MobileBottomNav` / `MobileBottomSheet` | map full-screen overlay | **New**, additive |

**Design assets** (`src/assets/illustrations/onboarding/*.svg`, `mascott-rumper.webp`,
`src/imports/**` Figma exports) are new and have no counterpart. They are pure additions —
adopt them into `frontend/src/assets/` and register the tokens in
`frontend/docs/design/foundations/`. The revamp's `DESIGN.md` palette is the **same**
MongoDB-inspired system already in `frontend/docs/design/foundations/tokens.md`
(`#00684a` primary, `#00ed64` accent, `#001e2b` deep teal, evidence positive/warning/danger).
No token reconciliation is needed — only a naming pass from the revamp's flat hex values to
the existing `--brand-*` / `--semantic-*` variables.

---

## 4. Field-level data-flow scan

Legend for **Gap class**:

| Class | Meaning | Action |
|---|---|---|
| **W** | Wire-up — value exists in a shipped endpoint | FE mapping only |
| **C** | Contract change — data exists server-side, not exposed or wrong shape | amend `docs/05` → endpoint |
| **B** | Backend feature — needs new persistence/logic, data obtainable | new spec + table + endpoint |
| **D** | Data gap — no trustworthy source today | mock behind flag + research track |
| **X** | Conflict — contradicts a current guardrail/ADR | product decision first |

### 4.1 Wizard → Buyer Priority Profile

| Rendered / collected | Source today | Class |
|---|---|---|
| `householdType`, `workPattern` | nothing — `useWizardStore` local state | **B** |
| `mainAnchor`, `secondAnchor` | `intakes.workplace_text` (single, free text) | **C** |
| `budgetMin/Max`, `budgetPreset` | nothing | **B** |
| `selectedCorridors[]` | nothing | **B** |
| `selectedFriction`, `scenarioResponses{}` | nothing (PRD-11 `BuyerPriorityProfile`) | **B** |
| priority weights / dealbreakers / confidence | nothing | **B** |

The backend has `users.profile` (JSONB, currently holding facts remembered in chat) and the
`intakes` row. Neither is a versioned, user-confirmable profile. PRD-11 §9 already specifies
the schema (`BuyerPriorityProfile`, `schemaVersion`, `status: draft|confirmed`, `updatedAt`);
that schema is sound and should be adopted essentially as written.

### 4.2 Curated Areas hub

| Rendered | Source today | Class |
|---|---|---|
| area `name`, `region` | — | **B** (needs an `areas` dataset) |
| `latLng`, `mapCoordinates` | — | **B** |
| `category` / `categoryLabel` (strong-fit / trade-off / challenge) | — | **B** (derive from profile + facts) |
| `commuteMinutes` to gravity centre | Routes API exists (`/routes`), but point→point only | **C** |
| `elevationDpl`, `elevationScore` | `hazards.elevation_profile()` — per point | **C** |
| `priceRange`, `priceMin/Max` | — | **D + X** (see GAP-13) |
| `latLngRoute[]` transit waypoints | `/routes` returns encoded polyline for DRIVE only | **C** |
| `transitOptions[]` (KRL/tol/MRT/LRT + interval) | `geo_features` has `station`, `toll_gate`; **no headway/interval data** | **C** + **D** (interval) |
| `essentialFacilities` (hospital/school/market/transit + km) | `geo_features` + `spatial.py` | **C** |
| `registeredPropertiesCount`, `checkpointsCount` | — | **D** |
| `summaryNarrative`, `cocokReason`, `tradeoffReason` | — | **B** (composer can generate, must cite) |
| shortlist / bookmark state | — | **B** |
| comparison matrix (2–3 areas) | — | **B + X** (see GAP-15) |

### 4.3 Workspace shell + Tahap 1 Ringkasan

| Rendered | Source today | Class |
|---|---|---|
| `score` 68/100 | `report.rls_score` | **W** |
| verdict badge "Layak dengan catatan" | `report.band_label` | **W** |
| property status `INVESTIGASI` / `LANJUTKAN` / `TUNDA` | derivable from `report.recommendation` | **W** (needs mapping table, §6.4) |
| `riskSummary` one-liner | `report.summary` (long) | **C** (add a short field, or clamp client-side) |
| 5 factor rows + scores | `report.categories[]` (`banjir`/`commute`/`akses`/`fasilitas`/`lingkungan`, weights 30/25/15/15/15) | **W** — exact match |
| `evidenceCount`, `gapCount` | derivable from `categories[].findings` / `evidence_gaps` | **W** |
| red-flag pill "RISIKO UTAMA" | `report.red_flags[]`, `is_critical` | **W** |
| stepper node completion state | — | **B** |
| quota badge "1 lokasi tersisa" of 5 | token quota exists, **location quota does not** | **B + X** (GAP-11) |
| property list (multi-location switcher) | `GET /api/conversations` (enriched) | **W** |

Tahap 1 is almost entirely a **wire-up**. That is the single most important finding in this
document: the revamp's summary screen and the shipped Mini Check report are the same data
model, down to the five category codes and their weights.

### 4.4 Tahap 2 Faktor Risiko

| Rendered | Source today | Class |
|---|---|---|
| 5 category deep-dive cards | `report.categories[]` | **W** |
| confidence badges Data kuat / sedang / Perlu validasi | `finding.confidence` | **W** |
| claim, limitation, validation action, sources+dates | `finding.*`, `evidence[]` | **W** |
| evidence-gap cards | `report.evidence_gaps[]` | **W** |
| "Tambahkan ke checklist" from a gap card | — no write path | **B** (GAP-09) |
| inline map layer toggle per category | needs per-category geometry | **C/D** (doc 19) |

### 4.5 Tahap 3 Perjalanan

| Rendered | Source today | Class |
|---|---|---|
| 4 route options (KRL · Tol · Arteri · Sekolah) | `/routes` returns **2** legs (station, toll), mode `DRIVE` only | **C** |
| per-route `legs[]` (walk → feeder → KRL) | not returned — Routes API can do `TRANSIT` | **C** |
| peak vs off-peak duration | not returned — Routes API supports `departureTime` | **C** |
| "Sekolah" route | requires a school destination from the profile | **B** |
| risk badge per route ("macet Cikunir") | — | **D** (needs congestion evidence, or drop to a cited finding) |

### 4.6 Tahap 4 Checklist

| Rendered | Source today | Class |
|---|---|---|
| checklist items + category + reason | `report.checklist[]` | **W** |
| item `priority` high/medium/low | not in contract; derivable (`is_critical` > `is_red_flag` > gap) | **C** |
| `tip` per item | not in contract | **C** |
| checked/unchecked state, progress bar | **not persisted anywhere** | **B** (GAP-09) |
| "Minta tinjauan analis" | `wa.me` link (`docs/16` §4) | **W** |

### 4.7 Tahap 5 Fasilitas

| Rendered | Source today | Class |
|---|---|---|
| 4 categories (kesehatan · pendidikan · belanja · stasiun) | `/map` `facilities[]` kinds map cleanly: hospital+clinic+pharmacy → kesehatan; school → pendidikan; market+supermarket → belanja; station → stasiun | **W** |
| per-category count + nearest km | computable from the same array | **W** |
| proximity label variant | presentation rule | **W** |
| POI detail expansion | `/map` already carries name/lat/lng/distance/ingested_at | **W** |

### 4.8 Map panel

| Rendered | Source today | Class |
|---|---|---|
| property pin, radius circle | `/map` `property` + presentation | **W** |
| facility / red-flag markers | `/map` `facilities[]`, `red_flags[]` | **W** |
| route polylines | `/routes` (2 legs) | **C** |
| **flood polygon** (`FLOOD_POLYGON` hardcoded in `MapPanel.tsx:45`) | `/map` `flood` = `{index, class}` at a **point** only | **D** → **doc 19** |
| **liquefaction polygon** (PRD-00 §8) | no dataset ingested at all | **D** |
| tab-aware `flyTo` / `TAB_CONFIG` | presentation | **W** |
| info bar "BNPB 2024 • 95m from property" | distance-to-hazard-edge needs geometry | **D** → doc 19 |

### 4.9 Assistant + entitlements

| Rendered | Source today | Class |
|---|---|---|
| assistant drawer, streaming reply, suggestions | `POST /api/conversations/{id}/messages` (SSE) — fully built | **W** |
| property-scoped context isolation (PRD-11 FR-1135) | chat is conversation-scoped; 1 conversation ↔ 1 intake | **W** (already isolated) |
| evidence citations in answers | `chat_service` + `chat_graph` grounded on the report | **W** |
| Rp50.000 / Rp150.000 price anchor, "Upgrade sekarang" | **no payment code exists**; `docs/13` says "upgrade-interest CTA (no payment yet)" | **B + X** (GAP-12) |
| free/paid comparison table (FR-1140) | — | **B** |
| step gating (Tahap N requires N-1 complete) | — | **B + X** (GAP-14) |

---

## 5. Gap register

| ID | Gap | Class | Blocking? | Notes |
|---|---|---|---|---|
| **GAP-01** | Buyer Priority Profile: schema, persistence, versioning, edit/reset | B | Wave 2 | **Partial** — PRD-11 §9 schema + versioned localStorage in `lib/profile.ts`; `GET/PUT /api/profile` still owed |
| **GAP-02** | Scenario → priority mapping table (deterministic, versioned) | B | Wave 2 | must **not** be LLM-generated (PRD-11 §10) |
| **GAP-03** | `areas` entity: identity, geometry, membership of a property in an area | B | Wave 3 | depends on doc 19 boundary decision |
| **GAP-04** | Area fit classification (strong-fit / trade-off / challenge) | B | Wave 3 | deterministic from profile + SpatialFacts; AI writes prose only |
| **GAP-05** | Area-level aggregates (commute, elevation, facilities) | C | Wave 3 | needs an area centroid/representative point contract |
| **GAP-06** | Shortlist + comparison persistence | B | Wave 3 | small table, low risk |
| **GAP-07** | Multi-mode commute (KRL / tol / arteri / sekolah) with legs + peak-hour | C | Wave 2 | Google Routes API supports `TRANSIT` + `departureTime`; cost per call must be metered |
| **GAP-08** | Transit headway / interval ("setiap 8–10 menit") | D | Wave 3 | not in OSM reliably; GTFS for KRL/TransJakarta is the candidate source |
| **GAP-09** | Checklist state persistence + append custom items | B | Wave 2 | unlocks the "Tambahkan ke checklist" cross-tab flows (PRD-00 §7) |
| **GAP-10** | Per-property step/stage progress state | B | Wave 2 | small; drives the stepper and the teaser cards |
| **GAP-11** | Location-based quota (5 locations) alongside token quota | B/X | Wave 1 | see §7.1 |
| **GAP-12** | Payment + entitlement persistence (3 passes: Rp50k / Rp120k / Rp350k) | B/X | Wave 4 | PRD-13 commerce UI ported: 3-tier `UpgradeDrawer`, `InAppCheckoutModal`, `ZeroQuotaModal`, account billing tab. Still **records interest only** — production renders no QR code and no VA number, because a provider that would receive the money does not exist. Snap surface is dev-only, entitlement grant is session-scoped and impossible in a prod build |
| **GAP-13** | Corridor price ranges (`Rp 950 Jt – 2,8 M`) | D/X | Wave 3 | **conflicts with ADR-010** — see §7.3 |
| **GAP-14** | Sequential step gating | X | Wave 1 | conflicts with STD-SCR-001 §7 exposure rule — see §7.2 |
| **GAP-15** | Side-by-side area comparison | X | Wave 3 | `docs/00` §4 lists multi-property compare as out of scope |
| **GAP-16** | ~~Leaflet (revamp) vs Google Maps~~ | X | — | **Closed** — ADR-017: Google Maps stays; revamp map design is re-implemented on `@vis.gl/react-google-maps` |
| **GAP-17** | Flood/liquefaction **area geometry** for map overlays | D | Wave 2 | **entire subject of [doc 19](19-area-boundary-and-flood-mapping.md)** |
| **GAP-18** | `registeredPropertiesCount` / `checkpointsCount` per area | D | Wave 3 | no inventory; either drop or redefine as "checkpoints in our checklist template" |
| **GAP-19** | Short `riskSummary` field (one line) | C | Wave 1 | trivial contract addition |
| **GAP-20** | Item `priority` + `tip` on checklist entries | C | Wave 2 | derivable server-side; keep deterministic |
| **GAP-21** | OSM-sourced marker coordinates drift against the Google basemap | C | Wave 1 | **Tier 1 fixed** (true centroids, `pos_source`); Tier 2 Google reconciliation proposed — ADR-019, docs/10 §5 |
| **GAP-22** | URLs are mixed id-ID/English (`/masuk`, `/app/mulai`) | C | Wave 1 | **Fixed** — English routes + permanent redirects, docs/09 §Route convention |

---

## 6. API delta (contract-first sketch)

These are **proposals for `docs/05`**, not implementation. Nothing here should be coded until
`docs/05` is amended and this section is marked accepted.

### 6.1 Additive, no new concepts (Wave 1–2)

```
GET  /api/checks/{intake_id}                # + report.summary_short (GAP-19)
                                            # + checklist[].priority, .tip (GAP-20)
GET  /api/checks/{intake_id}/routes         # extend: modes[] query param
                                            #   ?modes=transit,drive,arterial
                                            #   → legs[] per route, peak/offpeak duration
PATCH /api/checks/{intake_id}/checklist     # {item_id, checked} (GAP-09)
POST  /api/checks/{intake_id}/checklist     # append custom/gap-derived item (GAP-09)
GET/PUT /api/checks/{intake_id}/progress    # {step, completed_steps[]} (GAP-10)
```

### 6.2 New concepts (Wave 2–3)

```
GET  /api/profile                           # BuyerPriorityProfile | null
PUT  /api/profile                           # confirm/edit; server validates mapping version
POST /api/profile/scenarios                 # answers[] → draft priorities (deterministic)
DELETE /api/profile                         # reset

GET  /api/areas?profile_version=…           # curated areas + fit explanation
GET  /api/areas/{area_id}                   # deep-dive drawer payload
GET  /api/areas/{area_id}/geometry          # boundary polygon (doc 19)
POST /api/areas/{area_id}/shortlist         # + DELETE
GET  /api/areas/compare?ids=a,b,c           # comparison matrix (pending GAP-15)
```

### 6.3 Entitlement (Wave 1 partial, Wave 4 full)

```
GET  /api/entitlements                      # {plan, locations_used, locations_limit,
                                            #  tokens_used, token_limit, unlocked_intake_ids[]}
POST /api/entitlements/unlock               # {intake_id} → consumes 1 location quota
```

Payment integration is deliberately **not** in this sketch. `POST /api/entitlements/unlock`
must exist first as a free-tier quota consumer so the whole UI can be built and tested before
any money moves.

### 6.4 Enum mapping (code-owned, must live in `docs/07`)

The revamp's property statuses are a presentation of the existing recommendation enum:

| `report.recommendation` | Revamp status | Badge |
|---|---|---|
| `proceed` | `LANJUTKAN` | success |
| `proceed_with_caution` | `LANJUTKAN` | success |
| `verify_further` | `INVESTIGASI` | warning |
| `avoid_until_resolved` | `TUNDA` | danger |

Bands stay as-is (`relatif_kuat` ≥80 · `layak_dengan_catatan` ≥65 · `hati_hati` ≥50 ·
`risiko_tinggi`). The mapping is one-way and lives in code, not in the FE — the FE renders
`band_label` and a status derived server-side, so the two never drift.

---

## 7. Conflicts with current guardrails — resolve before building

These are the items where the revamp, taken literally, would break a rule the product has
already committed to. Each needs an explicit decision, not a silent implementation.

### 7.1 Two incompatible quota models (GAP-11)

`docs/13` meters **50,000 LLM tokens per user, lifetime**, to learn unit economics. The
revamp meters **5 locations**, then sells the 6th. These measure different things and both
are legitimate: tokens are the cost, locations are the price. **Recommendation:** keep the
token ledger as the internal cost meter (never shown as the user-facing limit), and introduce
`locations_limit` as the user-facing quota. The 402 path stays, but its `detail` becomes
`location_quota_exceeded` for the new flow. Doc 13 needs a §7 addendum.

### 7.2 Sequential step gating vs. red-flag exposure (GAP-14)

PRD-00 §6.1 requires Tahap 3 to be locked until Tahap 2 is complete. STD-SCR-001 §7 and
CLAUDE.md rule 3 require that **critical red flags can never be hidden**. A critical finding
in the `lingkungan` category (Tahap 2/5 territory) that a free user cannot reach is a direct
violation. PRD-00 §6.2 and PRD-11 FR-1123 both acknowledge this and say red flags stay visible
in Tahap 1. **Recommendation:** gating may hide *depth* (evidence, sources, checklist detail)
but never *existence or severity*. Tahap 1 must surface every `is_critical` finding with its
severity and its category, regardless of plan or step state. Add this as an invariant test.

### 7.3 Corridor price ranges vs. listing-independence (GAP-13)

ADR-010 states that listing-independence is structural, not editorial — the moat is that
Rumper is buyer-paid and never embedded in a seller funnel. `mockCuratedAreas.ts` shows
`priceRange: "Rp 950 Jt – 2,8 M"` per corridor, which is listing-derived data in every
commercial source. Scraping or licensing listing prices would put a seller-funnel dependency
into the core recommendation surface. **Recommendation:** if a price signal is needed, source
it from **Zona Nilai Tanah (ZNT)** published by ATR/BPN via `bhumi.atrbpn.go.id` and/or
municipal **NJOP** — both are official land-value zones, published per zone/polygon, and
independent of any listing platform. Label it explicitly as *nilai tanah zona (ZNT/NJOP)*,
not *harga rumah*, because it is not the same quantity. If that framing is unacceptable to
product, drop the price metric from the area card rather than compromise ADR-010.

### 7.4 Map provider — **DECIDED: Google Maps** (ADR-017)

`docs/14` §2 records that Leaflet/OSM was removed in the V3 port and the app is Google Maps
only — one provider for map, Places autocomplete, Elevation, Routes and Street View, on a
referrer-restricted browser key. The revamp is react-leaflet.

**Decision (2026-08-30, ADR-017):** Google Maps stays. Our own geo data already comes from
Google services, and Street View in the evidence inspector is a capability Leaflet cannot
replace. The revamp's map *design* is adopted in full — `TAB_CONFIG`, the 0.75 s `flyTo`,
layer pills, info bar, floating detail card — re-implemented on `@vis.gl/react-google-maps`.
`MapPanel.tsx` in the prototype is a visual reference, not a port target.

**Consequence — GAP-21.** Keeping the Google basemap while the POI warehouse is OSM-sourced
means the two surveys disagree, and our markers can land beside the feature Google labels.
Root cause and remedy are specified in **docs/10 §5** and decided in **ADR-019**: Overpass
`out center` returns a *bounding-box* centre (badly wrong for campuses and concave sites), now
replaced by a true area-weighted centroid at ingestion; targeted Google reconciliation of only
the surfaced features is the bounded Tier 2. Re-sourcing the warehouse from Google is rejected
— the Maps ToS does not permit storing it, and full Jabodetabek enumeration runs ~$4.5k–14k
per pass.

### 7.5 URL language — **DECIDED: English paths, Indonesian copy** (GAP-22)

Shipped routes mixed the two (`/masuk`, `/daftar`, `/app/mulai`, `/app/akun`, `/cek/:id`
beside `/app/c/:threadId`). URLs are engineering identifiers shared with logs, analytics and
deep links; copy is product surface, and the two should not move together. All paths are now
English, with permanent redirects from the id-ID originals so links already shared over
WhatsApp keep working. Convention and the reserved route names for the revamp are in
**docs/09 §Route convention**.

### 7.6 Scope statements now stale

`docs/00` §4 lists as out of scope: user accounts, payments, multi-property compare,
interactive map layers. Three of those four have since shipped or are now required (auth
shipped in `docs/13`; interactive layers in `docs/14`; compare and payments are requested
here). `docs/00` §4 must be rewritten rather than quietly ignored — see `SDD-ALIGNMENT.md`.

---

## 8. Mock strategy

The instruction is: adopt the UI first, mock what the API does not yet provide. To keep mocks
from becoming permanent shadow truth, they follow five rules.

1. **Mocks live behind the real contract.** A mocked endpoint has the same path, method and
   response shape as the accepted `docs/05` entry. The FE never imports a mock module; it
   calls `lib/api.ts` exactly as it will in production.
2. **Server-side, not client-side.** Mocks are FastAPI handlers gated on
   `settings.mock_endpoints: set[str]` (from env), returning fixture JSON from
   `backend/app/mocks/*.json`. This keeps one wire format and lets the FE be finished and
   demoable while the real implementation lands behind it.
3. **Every mocked payload is visibly labelled.** Mocked responses carry
   `"_mock": true` and every user-facing card renders the existing *Perlu validasi*
   treatment. A buyer must never see fabricated evidence styled as `Data kuat`. This is
   CLAUDE.md rule 2 applied to mocks.
4. **No mock may invent evidence.** Mocked *layout* data (counts, labels, geometry stubs) is
   allowed. Mocked *findings, claims, sources or confidence levels* are not — those render as
   explicit evidence gaps instead. A mock that fabricates a citation is a defect, not a
   placeholder.
5. **Each mock has a retirement condition** recorded in the register below, and a mock with
   no owner or no condition is deleted rather than kept.

| Mocked | Retires when | Owner |
|---|---|---|
| `GET /api/areas*` | GAP-03/04/05 land (doc 19 boundary decision + area ingestion) | backend |
| area `price_range` | ZNT/NJOP ingestion accepted, or field dropped (§7.3) | product |
| `transit_options[].interval` | GTFS ingestion (GAP-08) | backend |
| route `modes=transit` legs | Routes API `TRANSIT` wired + cost measured (GAP-07) | backend |
| flood/liquefaction geometry | doc 19 Wave A ships | backend |
| `registered_properties_count`, `checkpoints_count` | redefined or dropped (GAP-18) | product |

---

## 9. Adoption waves

Sequenced so each wave is shippable, and so the highest-value/lowest-risk work is not blocked
behind the hardest unknown (area data).

**Wave 0 — decisions (no code).** Resolve §7.1–§7.6. Amend `docs/00` §4, `docs/05`, `docs/13`
§7, `docs/14` §2, `docs/16` §3. Accept doc 19's boundary decision. Output: an updated SDD and
a signed-off API delta.

**Wave 1 — workspace re-skin on real data.** Port `AppHeader`, `SubHeaderTabs`,
`VerticalTimeline`, `ScoreCard`, `FactorRisksCard`, `DeepDiveEvidenceWorkspace`,
`FasilitasWorkspace`, `MobileBottomNav/Sheet`, and the design assets. Includes GAP-21 (marker positions) and GAP-22 (English routes), both already landed. All five tabs render
from the existing `GET /api/checks/{id}` and `/map`. Add GAP-19. Entitlement UI renders
against a stubbed `GET /api/entitlements`. **No new backend concepts.** This alone delivers
most of the visible revamp.

**Wave 2 — depth + continuity.** GAP-07 (multi-mode commute), GAP-09 (checklist
persistence), GAP-10 (progress state), GAP-20, GAP-01/02 (profile foundation, PRD-11 I1),
doc 19 Wave A (kelurahan geometry + raster flood overlay). Assistant drawer rewired to the
existing SSE chat.

**Wave 3 — curated areas.** GAP-03/04/05/06, GAP-08, GAP-13 decision, GAP-15 decision. This
is the wave with real data risk; PRD-11 §11 independently reaches the same conclusion
(area recommendations last, gated on coverage thresholds).

**Wave 4 — commerce.** GAP-12: payment provider, entitlement persistence, receipts,
refund/support route. Gated on the commercial decision in §7.1 and PRD-11 §16 decision 5.

---

## 10. Open decisions

1. **Quota semantics** — locations, tokens, or both? (§7.1)
2. **What gating may hide** — depth only, or existence too? (§7.2) *Recommended: depth only.*
3. **Price signal** — ZNT/NJOP, or no price on area cards? (§7.3)
4. ~~Map provider~~ — **decided**: Google Maps (ADR-017, §7.4).
5. **Is `Setup Gravitasi` mandatory** for new users, optional, or progressive? (PRD-11 §16.1)
6. **Is Premium one-time per location** or a subscription? UI copy is blocked on this
   (PRD-11 §16.5, PRD-04 §1).
7. **Does an "area" have a formal boundary** or is it a named centroid + radius? — answered
   by doc 19, needs product sign-off.
8. **Multi-property compare** — in scope now? (`docs/00` §4 vs PRD-12 §4.5)

### Wave 1 addenda (2026-08-30)

| Item | Status |
|---|---|
| Header split into `variant="areas"` / `"workspace"` | done — the hub has no property yet, so it offers "Lanjut ke Workspace" instead of a switcher |
| Location switcher → `PropertySwitcherModal` | done — modal, not dropdown; shows quota state + each property's band-derived verdict |
| Fullscreen "Rumper Advisor" (replaces side drawer) | done — same chat pipeline, conversation already bound to the intake |
| Re-kurasi from the profile menu | done — gated by `lib/entitlements.ts`; free trial opens the upgrade drawer |
| Corridor ordering strong_fit → tradeoff → challenge | done — sorted in `services/areas.py`, then by commute |
| `make reset-user-data` | new — wipes journey rows + usage ledger; keeps users, geo warehouse, point cache |

**GAP-11/GAP-12 note:** `hasSubscription()` returns `false` for everyone in production
because no payment provider or entitlement endpoint exists. `lib/entitlements.ts` is
deliberately the only place that decides — it also owns the pass catalogue and the location
cap — so the whole app flips when `GET /api/entitlements` lands, and no screen fakes an
entitlement meanwhile. The dev-only preview grant (`CHECKOUT_PREVIEW`, sessionStorage) exists
so the unlocked state can be designed; it is unreachable in a production build.
