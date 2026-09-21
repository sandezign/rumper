# 03 — Components & Pages

Built on the vendored design system (`frontend/docs/design/`) with a **hybrid** foundation:
CSS-variable tokens + DM Sans + `lucide-react` + a focused set of shadcn-style primitives.
Specs: docs/09, 12, 14, 16, 17.

## 0. `ui/` primitives (`src/components/ui/*`)

Application-owned, shadcn new-york style, tuned to Rumper tokens:

- `button.tsx` — `cva` variants `primary` (bright-green pill + deep-teal text) · `secondary`
  · `ghost` · `outlineOnDark` · `destructive` · `link`; sizes `default` (min-h-11) · `sm` ·
  `icon`. `asChild` via Radix `Slot`.
- `badge.tsx` — variants `neutral` · `outline` · `positive` · `warning` · `danger` ·
  `unknown` (semantic bg+text; brand-green is never a variant).
- `tabs.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, `switch.tsx` — Radix wrappers
  (focus management + keyboard behavior preserved). `switch.tsx` is the single toggle
  primitive (track inner width = 2× thumb, so the thumb sits flush at both ends); use it
  instead of hand-rolled `role="switch"` buttons.
- `card.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx` — flat bordered surfaces / 44px-min
  form controls with visible focus rings.

`theme-provider.tsx` (light/dark/system), `lib/utils.ts` (`cn`), `lib/risk.ts` (band/score/
confidence → semantic tokens; **no brand-green**).

## 0b. V3 workspace (live at `/app/c/:threadId`)

The shipped workspace. `AppShellV3` + `features/analysis/*` + `MapPanelV3`, all fed by the
real API through the evidence index (§7) — there is no mock path.

- `AppShellV3.tsx` — header (incl. the Active Audit dropdown) + analysis · assistant · map
  row with the drag-resizable, ≥50%-by-default map column (doc 01 §4).
- `features/analysis/components/AnalysisWorkspaceV3.tsx` — underline tab bar with count
  chips (**Overview** · **Evidence Risk** *n* · **Nearby Facilities** *n*), counts from the
  index. Panels: `OverviewPanelV3` (score ring + per-category bars + disclaimer + summary +
  priority findings + `report.checklist`), `EvidencePanelV3` (one accordion row per finding:
  claim, limitation, sources, confidence, validation step, `ui/switch` map-layer toggle),
  `FacilitiesPanelV3` (warehouse facilities grouped by Kesehatan / Pendidikan / Ritel /
  Transportasi with per-kind breakdown; expand to focus a single marker).
- `features/analysis/components/AssistantColumnV3.tsx` — collapsible chat column (messages,
  suggestion chips, thinking dots, `disabled`/`placeholder`); `AssistantPillV3` reopens it.
- Sections 1–4 below describe the **previous** shell (`AppShell`, `AssistantRail`,
  `analysis/*`, `MapPanel`), still used by the ops `/check/:id` view and the `/dev/*`
  playgrounds.

## 1. AppShell (`AppShell.tsx`)

The three-region shell (docs/16). **Dark-teal** 72px global header: hamburger (mobile rail
drawer) · brand (green house mark) · `meta` · **Tinjau analis** (outline-on-dark → WhatsApp) ·
**Bagikan** (primary → existing PDF download) · **profile avatar** (`user` prop) → `/app/account`.
Below: `rail` (left column / mobile drawer, controlled via `railOpen`/`onRailOpenChange`) ·
`analysis` (center, `flex-1`) · optional `map` (right `min(432px,30vw)` / mobile overlay).
Independent scroll per region.

## 2. AssistantRail (`AssistantRail.tsx`)

Chat rail (docs/12). Props: `convos`, `activeId`, `expectsAddress`, `messages`, `thinking`,
`research`, `reportReady`, `onSend`, `onOpenConvo`, `onNewChat`, `onViewReport?`, `disabled`
(disabled while research runs; follow-up-only in `report_qa`). No account footer — profile +
logout live on the header avatar / Account page.

- Header ("AI Assistant") + **Active Audit** selector (`DropdownMenu` of `convos`): each item =
  band-colored dot + `property_name` (fallback title) + `rls_score`/100 · `band_label` ·
  `review_state`; `+` = `onNewChat` (→ LocationHome). Thread (user bubble deep-teal / assistant
  bordered); `thinking` dots; **Deep Thinking** card (deep-teal, monospace `RESEARCH_STEPS`,
  ✓/▸/· by `research.step`); report-ready bubble + "Lihat detail laporan" (`onViewReport`);
  suggestion chips; composer + disclaimer. (Entry hero now lives in `LocationHome`, §5.)

## 3. Analysis region (`src/components/analysis/*`)

From the `Report` type (docs/16), styled to `dashboard.html`'s report-workspace. `Tabs`
**Ringkasan / Bukti / Checklist** (deep-teal active underline + count chips), one scroll
container. Findings flattened from `report.categories` so each carries its category label/code.

- `ScoreCard` — risk ring tinted by `bandHex` (**never brand-green**, `#e8edef` track) +
  `ValidationBadge` + property + `RiskBadge` + recommendation + a green primary **action
  banner** (→ Checklist tab).
- `badges.tsx` — `RiskBadge` (band), `SeverityBadge` (per-finding: critical→danger /
  red-flag→warning / else→positive, with dot), `ConfidenceBadge`, `ValidationBadge`.
- **Ringkasan**: ScoreCard → amber `Disclaimer` → summary → **Temuan prioritas** (2-col
  finding cards: severity + category title + clamped claim + validation action) → **Keterbatasan
  bukti** (bullets) → checklist preview.
- **Bukti**: bordered list of evidence cards (category code chip + title + severity, clamped
  claim, meta chips `Sumber/Kepercayaan/Diamati`, amber limitation note, action) + disclaimer.
- **Checklist**: interactive tasks (checkbox toggles local state) with a **progress bar**,
  `Terkait: <category>` tag, and a "Minta tinjauan analis" CTA (→ WhatsApp).
- `ui/clamped.tsx` (`Clamped`) — truncates long claims/limitations with a tooltip for the full
  text, so detail panels don't become walls of text (shared with the rail).

## 4. MapPanel (`MapPanel.tsx`) — map workspace (docs/14)

`@vis.gl/react-google-maps`; all marker/circle/legend/InfoWindow logic preserved, re-skinned
to tokens. Header strip (title · property · band-tinted score badge · category mini-bars via
`scoreHex`), raster `Map` (POIs hidden), `HtmlMarker` (OverlayView) for property/facilities/
toll/station/red-flags, `MapCircle` (±3 km band-tinted + 1 km flood), collapsible `Legend`,
Street-View `InfoWindow`, and the **linked-evidence bar** (selected marker ↔ finding). The
report/findings digest now lives in the analysis region, not here.

## 4b. MapPanelV3 (`MapPanelV3.tsx`) — V3 map workspace (docs/14)

Also `@vis.gl/react-google-maps` (**no Leaflet anywhere in the app** — the leaflet /
react-leaflet deps were dropped when this panel was ported). Adds on top of `MapPanel`:
**centred** floating layer tabs (Ringkasan · Risiko · Perjalanan · Fasilitas · Tol & akses,
each with its feature count; the row shifts left of the inspector while it is open, and a
tab with no data is dimmed and explains itself instead of opening a blank canvas), a
tab-aware legend, confidence-based marker treatment (dashed/amber outlines for weaker
evidence, red ring + larger icon for critical red flags), de-emphasis of everything but the
selection, a camera that pans/zooms to the selected evidence, and an **edge-anchored
inspector** (right overlay on desktop, full sheet below `lg`) showing Street View, claim,
distance, sources, confidence badge, limitation and the validation step — every field read
from the evidence index, nothing synthesised. `MAPS_KEY` missing → the panel renders its
"Peta belum dapat dimuat" state and the written findings still stand.

**Per-tab contract** — each tab widens exactly one layer, and **Ringkasan is the composite**
so the default view is never a bare pin: survey radius + flood context + the nearest
facility *of each kind* + station + toll + every red flag. Perjalanan and Tol & akses draw
a dashed straight-line connector to their single feature (straight-line because
`distance_km` is as-the-crow-flies — we have no routing call). Station and toll gate also
belong to the Transportasi facility group, so the Facilities tab renders them too. With
nothing selected, the linked-evidence bar carries result chips (skor · band · banjir ·
elevasi · stasiun · tol · fasilitas · red flag) rather than a placeholder hint.

## 5. Flow screens (docs/17) + auth/marketing

- `LocationHome` (`/app`) — entry hero + progress topbar; property field with Places
  autocomplete + example chips; submit → stash via `lib/wizard.ts` → `/app/start`.
- `Onboarding` (`/app/start`) — guided 7-step wizard (thread + option-chip dock + status
  panel + progress). `wizardToIntake()` maps options → intake; Confirm →
  `createConversationFromIntake` → `/app/c/:id` (401 → `/login`, geocode 400 → step 1).
- `ResearchLoading` — full-screen first-run loader (steps + input summary) fed by
  `watchResearch`; rendered by `Workspace` when `research.active && !report`. Its 5 step
  cards mirror the backend loader steps 1:1 (orchestrator `_PHASES`, same set as
  `RESEARCH_STEPS`). **Purely server-driven**: the backend owns the step/pct/label
  (`progress` object on `GET /api/checks/{id}`); this component only renders `research.step`
  / `research.pct` / `research.label` as-is — **no client-side timers or faked "creep"**.
  The backend announces each node at its top (so the bar reflects the node that is *running*,
  not the one that just finished) and reports per-query `done/total` during the long web-
  search node, so the meter advances on real signal. The workspace unmounts the loader the
  moment the report lands. Preview/tune it without the API at
  `/dev/research-loading` (`pages/DevResearchLoading.tsx`, DEV-only route — mocks the step
  flow via timeouts + seeds a wizard summary; "Restart" remounts to replay).
- `Account` (`/app/account`) — account settings hub, four tabs (PRD-13 §4 Module 5):
  **Profil** (identity from `me()`, work anchors + work pattern written back through
  `lib/profile.ts`), **Kuota** (location meter against `locationLimit()`, daily token meter,
  upgrade CTA; transaction history is an explicit empty state — no provider, so no invoices),
  **Arsip** (analysed conversations with their band-derived verdict and RLS score → workspace),
  **Berbagi** (per-property due-diligence brief; live share links are stated as not available).
- `AuthModal` — upfront auth gate (PRD-13 §4 Module 1). Google is the live path (the same
  `GoogleSignInButton` the /login page uses). WhatsApp OTP has no backend, so production shows
  it as unavailable and the 6-digit step renders in dev only, labelled as a design preview.
  `RequireAuth` renders it in place of a redirect so a deep link survives the gate; the gated
  page is *not* mounted behind it (an unauthenticated render would fire a screenful of 401s).
- `GoogleSignInButton` — GIS inject + `googleLogin` (docs/13); shared by `AuthModal`/
  `LoginModal`/`AuthPage`.
- `LoginModal`, `QuotaModal` — shadcn `Dialog` (legacy ops shell). `AuthPage` (`mode`) —
  `/login` & `/register`.
- `Landing` (`/`) — the public marketing page, one responsive implementation (no V(n) variants:
  the former `LandingV2` + `blocks/hero-section-1` are gone). Base width follows the 390w mobile
  design 1:1; `md`/`lg` widen the same sections to the 1440w desktop layout — nothing is
  mobile-only or desktop-only. Sections in order: fixed transparent header (centre links +
  Masuk/Mulai on `lg`, disclosure menu below it), deep-teal hero (badge, h1 48→84px, location
  search → `/app?q=`, three proof points), illustrative Mini Check summary card
  (`ReportPreview` + `RiskDial`, labelled *Contoh* — never a real score), `#periksa` (3 pitfalls),
  `#contoh` (one finding shown with source, evidence strength, survey actions), `#kategori`
  (the 5 STD-SCR-001 categories), `#cara-kerja` (3 steps, dark), `#tentang` (buyer-side stance),
  `#faq` (native `<details>`, see the `faq-chevron` rules in `index.css`) + closing CTA and the
  preliminary-Mini-Check disclaimer. Copy is Bahasa Indonesia; the design's English sample
  strings are translated, `Location Risk Index` kept as the term of art.
- **Landing artwork** — every glyph on the page (logo mark, hamburger, hero badge/checks, the
  risk dial, the five category icons, chevrons, arrows) is exported from the Figma frame and
  imported through `src/assets/landing/index.ts`; that barrel maps each file to its Figma node
  id. They are rendered as `<img>` via the local `Art` helper because the design bakes its own
  colours in — **do not** substitute a lucide (or other icon-library) lookalike, and do not
  recolour them in CSS. Source copies live in `docs/design/figma-exports/landing/`; re-export
  with the Figma MCP when the design changes. All are under 4 KB, so Vite inlines them.
- `lib/wizard.ts` — wizard answers (sessionStorage) + `wizardToIntake()` option→field mapping.

## 5b. Commerce (`features/commerce/*`, `lib/entitlements.ts`)

PRD-13 Modules 2–4. `lib/entitlements.ts` is the single source of truth for **both** what the
plan allows and what the passes cost — `LOCATION_LIMIT`, the three `TIERS` (Single Rp50.000 /
Shortlist Bundle Rp120.000 / Expert Rp350.000 with their original prices, features and bundled
quota), `formatRp`, `hasSubscription()`, `locationLimit()`, `canRecurate()` and the
`useEntitlement()` hook. Every price on every screen reads from there, so the drawer, the
checkout, the interception and the billing tab cannot disagree.

- `useCommerce()` — the trio as one hook (`openUpgrade(tier?)`, `openZeroQuota()`, `modals`).
  The workspace, the areas hub and the account hub each call it once instead of re-declaring
  three pieces of state; `modals` is rendered at the bottom of the page.
- `UpgradeDrawer` — right drawer (480px desktop / bottom sheet mobile) with three selectable
  tier rows; the selected row expands to its feature list. Footer CTA carries the price.
- `InAppCheckoutModal` — **production** renders the pass summary and says checkout is not open,
  then records interest. It deliberately shows no QR code and no virtual-account number: a
  buyer could try to pay one and the money would go nowhere. **Dev** renders the full Midtrans
  Snap surface (QRIS / VA / e-wallet tabs) behind a "pratinjau desain" banner, with obviously
  non-payable placeholder numbers; completing it calls `grantPreviewPass`, a session-scoped
  grant that is a no-op in a production build.
- `ZeroQuotaModal` — interception when the free trial is spent: reassurance that the archive
  survives, then Single Pass vs Shortlist Bundle. Triggered from the areas hub (evaluating a
  corridor with no quota left) and the property switcher.
- `features/export/PdfDueDiligenceModal` — three-page brief (ringkasan & rekomendasi · skor per
  faktor with confidence and evidence gaps · checklist + disclaimer). Every figure is read off
  the `Report`; nothing is illustrative. There is no server-side PDF generation (docs/00 §4),
  so "download" is the browser printing the sheet — see the `.rumper-print-sheet` rules in
  `index.css`.

## 6. Operations pages

- `Intake` (`/form`) — five-section form, token-styled; same validation/submit → `/check/:id`.
- `Check` (`/check/:id`) — polls `getCheck` (4 s); token loading/error; `done` renders
  `AnalysisWorkspace` (shared with the workspace).

## 7. Evidence index (`features/analysis/evidence.ts`)

The one derivation of "what the V3 workspace shows" from the two API payloads
(`GET /api/checks/{id}` + `…/map`). `buildEvidenceIndex(report, mapData)` returns:

- `items` — one `EvidenceItem` per researcher finding, in report-category order (the
  **Evidence Risk** rows). `report.red_flags` / `report.evidence_gaps` are *views* over the
  same category findings server-side, so they are deliberately not appended (they would
  duplicate rows and double the tab badge).
- `byId` — every selectable thing on the map: the finding items **plus** a synthesised item
  for each warehouse feature no finding mentions, described only from the fields we have
  (name, distance, ingest date) so a marker click never invents a claim.
- `facilityGroups`, `evidenceCount`, `facilityCount` — the facilities tab + tab badges.

**Ids.** A feature's id is `feat:{kind}:{lat},{lng}` (5-dp). A finding whose claim names a
feature ("Akses tol terdekat: Gerbang Tol Jelupang ~1.87 km") adopts that feature's id, so
the row and the marker are one selectable object; the first finding to match a feature
claims it, and unmatched findings get `find:{category}:{i}` anchored at the property.
Per-item `mapTab`/`layerKey` come from the feature kind when linked, else the report
category — that mapping is what drives the cross-panel sync in doc 01 §5.
