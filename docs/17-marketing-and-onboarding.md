# 17 — Marketing + Onboarding flow

The product is no longer entered cold. The UX flow is **landing → register/login →
onboarding → workspace**, so first-time buyers are briefed before they start. Screens follow
the UX `campaign-concepts/` mockups, restyled to the token system (docs/09); all copy Bahasa
Indonesia.

```
/  Landing ──▶ /register Register ─┐
            └▶ /login   Login ───┤──▶ /app  (onboarding, single column)
                                  │          └▶ research ─▶ /app/c/:id (3-region, docs/16)
returning login ─────────────────┘
```

## 1. Landing (`/` → `Landing.tsx`)

Public marketing brief, reconciled to the app token system (deep-teal hero, white/soft
sections, bright-green CTA pill — **no** warm-paper/Fraunces; that look is deprecated, see
`frontend/docs/design/README.md`). Sections (from `landing-page.html`):

- Deep-teal hero: eyebrow "Mini Check Risiko Lokasi · Jabodetabek", headline "Cek risiko
  lokasi sebelum bayar DP.", lead, primary CTA "Mulai Mini Check gratis" → `/app` (or
  `/login` if not authed), trust strip.
- Problem cards · sample-report preview (deep-teal showcase) · "5 hal yang Rumper cek" (the
  scoring categories) · cara kerja (4 steps) · limited-beta CTA · FAQ (Rumper tidak menjamin
  lokasi bebas risiko; bukan agen properti).

Marketing-only Fraunces display is an allowed, documented exception **if** the team wants the
editorial hero; default is DM Sans.

## 2. Register / Login (`/register`, `/login`)

Auth stays **Google Sign-In** (docs/13) — the real mechanism. The mockups' split layout
(value panel + form) is kept; the Google button is the primary action. Extra fields (full
name, etc.) render as **future-proof, non-blocking** inputs (kept "in case needed later", per
product direction) — they do not gate sign-in and are not yet sent to the backend. Prototype
notes from the mockups ("akun prototipe, kata sandi tidak disimpan") only apply if a
password field is shown; with Google we show the standard privacy note (data not shared with
agents/sellers/developers). After auth: new user → `/app` (onboarding); returning user with
history → `/app` (most recent audit can be opened from the rail).

## 3. LocationHome entry (`/app` → `LocationHome.tsx`, `location-home.html`)

Centered hero with a **progress topbar** ("Mulai analisis lokasi" + bar) marking the start of
the journey: headline "Rumahnya bagus. / Risikonya sudah dicek?", a single **property field
with Google Places autocomplete** (reuse `placesAutocomplete`), example-area chips, and the
data-source note. Submitting stashes the property in the wizard draft (`lib/wizard.ts`,
sessionStorage) → `navigate('/app/start')`. No backend call here.

## 3a. Revamped priority wizard (`/app/start`, docs/18 Wave 1)

The 9-screen wizard (5 narrative stages + 4 parameter steps) now owns the entry of the
journey; §4 below describes the intake wizard that follows it at `/app/intake`.

**Step 2 — Titik Gravitasi** collects the buyer's daily anchors and is backed by the **live
Places autocomplete** (`GET /api/places/autocomplete`, docs/12), not a fixed option list. A
hardcoded list of 13 Jakarta business districts cannot express a real buyer's anchor — a
specific campus, factory, hospital or suburban office — and any such list silently pushes
people toward locations we happen to have listed.

Behaviour, matching the server contract (min 4 chars, ≤5 suggestions, 60 req/min):

- 300 ms debounce, and the 4-char floor is enforced client-side so we never spend a call
  the server would reject;
- responses are sequence-guarded, so a slow earlier request cannot overwrite a newer one;
- distinct empty / too-short / loading / not-found / error states — a 401 says the session
  expired (after `lib/api`'s single silent refresh attempt has already failed);
- the current pick stays visible and checked even when it is absent from live results.

Each anchor stores Google's **`place_id`** alongside the label
(`BuyerPriorityProfile.anchors[].placeId`). Place IDs are storable indefinitely under the
Maps terms (docs/10 §5.3), so commute origins resolve later without re-geocoding.

## 3b. What the wizard collects, and where it goes

The wizard is only worth its length if its answers change the research. Mapping below is by
**stable option id**, never the display label.

### Carried by the existing intake contract (`POST /api/conversations/from-intake`)

| Wizard field | Intake field | Rule |
|---|---|---|
| primary anchor | `workplace_text` | PRD-11 FR-1124 — never ask for the workplace twice |
| friction `flood-access` | `concerns: [banjir, akses]` | |
| friction `commute-discrepancy` | `concerns: [commute]` | |
| friction `essential-facilities` | `concerns: [fasilitas, lingkungan]` | |
| `householdType` | `purpose` | single / pasangan / keluarga-muda |
| work pattern, budget, 2nd anchor, corridors | `concern_notes` | short context line the researchers read |

**Frictions that map to nothing on purpose:** `tradeoff-confusion`, `research-overload`,
`budget-kpr`, `something-else`. They are real problems but none is one of the five scored
categories, so they leave `concerns` empty and the backend's default — research all five —
applies. Narrowing the research because a buyer said "I'm overwhelmed" would be worse than
researching everything.

### Collected but the contract cannot express it — API gaps

| Data | Why it matters | Needs |
|---|---|---|
| **Second anchor** (+ `place_id`) | a two-earner household has two commutes; we can only score one | `intakes.workplace_2*` + a second commute leg in `/routes` |
| **Work pattern** | a remote worker should not be scored the same on commute as a 5-day WFO buyer; today the 25% commute weight is fixed | weight modulation — but STD-SCR-001 weights are code-owned (ADR-001), so this needs a scoring decision, not a field |
| **Budget range** | can gate corridor suitability and flag over-reach | `intakes.budget_min/max`, and doc 21's `land_value` to compare against |
| **Preferred corridors** | the buyer's own shortlist should bias the areas hub | doc 21 `GET /api/areas` |
| **Anchor `place_id`** | avoids re-geocoding a free-text workplace on every check | `intakes.workplace_place_id` |
| **Scenario responses** | the actual priority signal | blocked on the PRD-11 §10 mapping (GAP-02) — stored raw, deliberately unmapped |

### Correctness note

Stage 1 previously **auto-selected** `flood-access` on mount, so a buyer who never touched the
screen still had "takut banjir" recorded as their stated concern — which, once the mapping
above exists, would have silently set `concerns: [banjir, akses]` for them. Removed: the
friction is now only recorded when the buyer picks one.

## 4. Onboarding wizard (`/app/start` → `Onboarding.tsx`, `onboarding.html`)

A **guided 7-step option flow** (not free-typed chat): a conversation thread (AI prompt +
chosen-answer bubbles) + an option-chip dock, a right status panel (step checklist + live
dossier + "± 3 menit" trust card), and a topbar "Langkah X dari 7" progress.

1. **Properti shortlist** — autocomplete input (pre-seeded from LocationHome).
2. Lokasi aktivitas (opsional) · 3. Moda transportasi · 4. **Prioritas risiko** (multi) ·
   5. Tahap & timeline · 6. Catatan tambahan (opsional) — single/multi-select chips.
7. **Review & Confirm** — per-row summary with **Edit** jumps → **Confirm & Mulai Analisis**.

`wizardToIntake()` (`lib/wizard.ts`) maps option labels → intake fields. Confirm →
`POST /api/conversations/from-intake` (docs/12) → `navigate('/app/c/:id')`. 401 → `/login`;
geocode `400` → inline error, jump back to step 1. This **bypasses the LLM gathering**
(deterministic, cheaper); the dashboard chat opens on the seeded analysis request.

## 5. Research feedback (`research-loading.html` → `ResearchLoading.tsx`)

On first analysis, `Workspace` (at `/app/c/:id`, `research.active && !report`) renders a
**full-screen** stepped loader: 4 conceptual steps + input summary (from the wizard draft) +
"± 1 menit" + "hasil awal, bukan rekomendasi final", fed by the existing `watchResearch` SSE
(docs/11) — no backend change. On completion → three-region dashboard (docs/16).

## 6. Account (`/app/account` → `Account.tsx`)

Reached from the header profile avatar (docs/16): profile (avatar/name/email), **token usage
detail** (today used/limit, %, reset note), and **Keluar** (logout → `/`). Uses `me()`/`logout()`.

## 7. Guardrails

Bahasa Indonesia, calm/non-alarmist. Never guarantee a location is safe/suitable. Disclaimer
present on landing (FAQ), the wizard, the loader, and the report. Options are user-provided —
confidence is still labeled per finding in the report.
