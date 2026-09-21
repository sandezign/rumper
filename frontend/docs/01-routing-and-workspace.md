# 01 — Routing & Workspace Container

Source: `src/main.tsx`, `src/components/Workspace.tsx`, `src/components/AppShellV3.tsx`.
Specs: docs/09 (routes), docs/12 (rail), docs/14 (map), docs/16 (shell + analysis),
docs/17 (marketing/onboarding).

## 1. Routes (`main.tsx`)

`main.tsx` wraps the router in `ThemeProvider` + `TooltipProvider`.

| path | element | purpose |
|---|---|---|
| `/` | `Landing` | public marketing brief (docs/17) |
| `/login` | `AuthPage mode="login"` | Google sign-in (docs/13) |
| `/register` | `AuthPage mode="register"` | Google sign-in + future-proof fields |
| `/app` | `AppEntry` | journey router — redirects on `hasConfirmedProfile()` (`lib/profile.ts`) |
| `/app/start` | `OnboardingWizard` | revamped 9-screen wizard (`features/onboarding/wizard/*`); confirms the profile, then → `/app/areas` |
| `/app/areas` | `AreasHub` | `LocationDataLoadingScreen` → hub; `fetchAreas()` is a mock seam (`features/areas/api.ts`) |
| `/app/location` | `LocationHome` | entry hero + Places autocomplete → `/app/intake` |
| `/app/intake` | `Onboarding` | guided 7-step intake wizard (docs/17) |
| `/app/account` | `Account` | profile + token usage + logout (docs/16) |
| `/app/c/:threadId` | `Workspace` | active audit → first-run loader / V3 three-region workspace (docs/16) |
| `/form` | `Intake` | operations fallback: classic form |
| `/check/:id` | `Check` | operations report view (reuses `analysis/`) |
| `/dev/research-loading` | `DevResearchLoading` | **DEV-only** (`import.meta.env.DEV`): mock the first-run loader without the API |
| `/dev/map-platform`, `/dev/map-platform-v2` | `DevMapPlayground[V2]` | **DEV-only**: mocked design playgrounds for the earlier map iterations (`components/v3/*`). The V3 playground is gone — V3 now runs on real data at `/app/c/:threadId` |
| `*` | `NotFound` | catch-all 404 (calm design-system page) for unknown URLs — incl. `/dev/*` in prod builds and typos; must stay last |

**Legacy redirects.** Paths are English (docs/09 §Route convention); the previous id-ID paths
stay as permanent `<Navigate replace>` routes so links already shared (WhatsApp, bookmarks)
keep resolving: `/masuk` → `/login` · `/daftar` → `/register` · `/app/mulai` → `/app/start` ·
`/app/akun` → `/app/account` · `/cek/:id` → `/check/:id` (via `LegacyCheckRedirect`, which
preserves the id). They are never linked to from inside the app — the app always uses the
English path — so they cost one render and no maintenance.

## 2. Workspace state (single container component)

`Workspace` owns all cross-cutting state; the regions are presentational:

- auth: `user`, `loginOpen`, `pendingText` (ref — message typed before login, replayed
  after);
- audits: `convos` (one audit = one conversation; the header's Active Audit dropdown);
- chat: `activeId`, `messages`, `thinking`, `assistantOpen` (assistant column);
- research: `research: {active, step, label} | null`, `intakeId`, `stopWatch` ref;
- artifacts: `report`, `mapData`, `downloading` (PDF);
- cross-panel selection (V3): `activeAnalysisTab`, `activeMapTab`, `selectedEvidence`,
  `visibleLayers`, `activeFacilityCategory`;
- modals: `quotaModal`.

`index = buildEvidenceIndex(report, mapData)` (`features/analysis/evidence.ts`) is memoised
here and handed to both the analysis panels and the map, so an evidence row and its marker
are the same object under the same id — see §5.

`firstRunLoading = !!research?.active && !report` decides the layout (full-screen loader vs
three-region). Projects/folders from the backend are intentionally **not** surfaced.

## 3. Flows

**Bootstrap** (mount): `me()`; when authenticated, `listConversations()`. Failure =
anonymous (no redirect; login is lazy).

**Deep link**: once `user` is set and `threadId ≠ activeId`, `openConvo(threadId, false)`.

**openConvo(id)**: `navigate(/app/c/:id)`; reset chat/research/artifacts; `getConversation`;
set messages + `intake_id`; by `job_status`: `done` → `loadReportAndMap`; `running|pending`
→ `startWatching`.

**newChat()** ("+"/new audit): `clearWizard()` + navigate `/app` (LocationHome → fresh wizard).

**send(text)** (report_qa follow-ups): push user message + `thinking`; `sendMessageSSE` with
`onStatus`; append assistant message (+chips) + token counters. The backend guards `report_qa`
from starting research, so follow-ups are pure Q&A. Errors: 401 → `LoginModal`;
`quota_exceeded` → `QuotaModal`; else error bubble. (New audits are created by the wizard via
`createConversationFromIntake`, not here.)

**startWatching(intakeId)**: `watchResearch` (REST poll of `getCheck`, 1.5 s — Firebase
Hosting buffers SSE) → `research {active, step, total, pct, label}` (all server-owned,
rendered verbatim); `done` → `loadReportAndMap` + flip convo to `report_qa`; else failure
bubble.

**No 3-column flash before the loader**: `openConvo(id, pushUrl, researchHint)` optimistically
sets `research.active` (showing the full-screen `ResearchLoading` immediately) when it expects
a running job — either the wizard/intake submit navigated here with `{ state: { research: true } }`
(the hint), or the in-memory `convo.state === "researching"`. After `getConversation` resolves it
keeps watching if the job is running, else clears the optimistic loader. So submit → full-screen
loader → 3-column report, with no intermediate workspace flash.

**loadReportAndMap(intakeId)**: `getCheck` + `getMap` in parallel; store report + map only on
`done`. Errors swallowed (map is optional).

**downloadPdf()**: `GET /api/checks/{intakeId}/report.pdf` → blob download (backend enforces
the daily cap); surfaced as the shell's **Bagikan / Unduh laporan** action.

**Logout**: handled on the Account page (`/app/account`), not the rail.

## 4. Layout (`Workspace` at `/app/c/:id`)

- **First-run loading** (`research.active && !report`): full-screen `ResearchLoading` (docs/17).
- **V3 three-region** (otherwise): `AppShellV3` renders the **dark-teal** 72px header (brand ·
  meta · Tinjau analis · Unduh laporan · **Active Audit** dropdown (`convos` + "Audit baru") ·
  profile avatar → `/app/account`) and the row — analysis (left, `flex-1`:
  `AnalysisWorkspaceV3` when `report`, else `AnalysisPending`) · assistant column
  (`AssistantColumnV3`, 380px, collapsible) · drag handle · **map** (right).

  **The map is the dominant region**: its default width is `55vw` (docs/14 asks for ≥50% on
  wide desktop) and it keeps tracking the viewport on resize until the user drags the
  divider (min 320px, max 70vw). Opening the assistant borrows width from the map first, so
  the analysis column never drops below 360px. Below `lg` the map becomes a full-screen
  overlay behind the floating "Peta risiko" button.

  The composer is disabled while research runs and is follow-up-only in `report_qa`. The
  assistant starts open while there is no report and collapses to the `AssistantPillV3`
  once the Mini Check lands (the pill sits on the map on desktop, over the analysis column
  below `lg` / while the report is pending). Entry (LocationHome) and the wizard
  (Onboarding) are separate routes (docs/17), not `Workspace`.

## 5. Cross-panel selection (V3)

One id space, produced by `buildEvidenceIndex` (see 03 §7):

- analysis → map: `onSelectEvidence(id)` sets `selectedEvidence` and switches the map to
  that item's `mapTab`; the map pans/zooms to it and rings the marker.
- map → analysis: `onMarkerClick(id)` opens the map inspector and, for findings-backed
  items, jumps the analysis column to **Evidence Risk** and scrolls the row into view
  (spatial-only facility markers jump to **Nearby Facilities** instead).
- map tab change clears the selection and mirrors the analysis tab (`facilities` →
  Nearby Facilities, other non-overview tabs → Evidence Risk).
- `visibleLayers` (per-row "Tampilkan di peta" switches) force a layer on regardless of the
  active map tab; `activeFacilityCategory` filters the facility layer.
