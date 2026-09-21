# 16 — Workspace Shell + Analysis region

The authenticated app (`/app`, `/app/c/:threadId`) is the **canonical three-region evidence
workspace** from the design system (`frontend/docs/design/guidelines/composition/layout.md`),
realized in the UX `dashboard.html` concept. This doc owns the **app shell** and the
**analysis (Mini Check) region**. The chat rail is docs/12; the map is docs/14.

## 1. App shell

```
┌────────────────────────────────────────────────────────────┐
│ Global header (72px): hamburger · brand · meta · actions     │
├───────────────┬──────────────────────┬───────────────────────┤
│ Assistant rail│ Analysis workspace   │ Map workspace         │
│ ~340px        │ flexible, readable   │ min(432px,30vw), ≥45% │
└───────────────┴──────────────────────┴───────────────────────┘
```

- **Global header** (`AppShell.tsx`): **dark-teal** surface (`bg-brand-teal-deep`, follows
  `dashboard.html .app-header`) + bottom hairline; on-dark text. Hamburger (mobile) toggles the
  rail. Brand (green house mark + "Rumper") → `/app`. Center `header-meta` ("Analisis properti ·
  diperbarui <tgl>"). Right: **Tinjau analis** (outline-on-dark; = expert-review continuation,
  §4), **Bagikan** (primary; = the existing PDF download, §4), and a **profile avatar** →
  `/app/account` (Account page: profile, token usage detail, logout — moved out of the rail).
- **Grid**: rail (`--sidebar-width: 340px`) · analysis (`flex-1`) · map. The **map is a static
  column only on wide desktop (≥`lg`/1024px)**; below that it's hidden and opened as a
  full-screen overlay via the floating **"Peta risiko"** button (avoids a cramped 3rd column on
  tablet). Each region scrolls **independently**; fixed height below the header. Tokens:
  `--map-panel-width: min(432px,30vw)`.

## 2. Lifecycle

Entry (location-home + guided wizard) lives at `/app` and `/app/start` (docs/17). `Workspace`
mounts only at `/app/c/:threadId` and renders:

| State | Layout |
|---|---|
| Research running, no report yet (first run) | **Full-screen `ResearchLoading`** (docs/17) |
| `report_qa` (done) | Three regions: rail (~340px) · analysis · map |
| done-but-no-report fallback (job failed/legacy) | Three regions; analysis center shows a pending/empty note |

The rail composer is **disabled while research is active**; in `report_qa` it's enabled for
**follow-up questions only**. **Active Audit selector** lists conversations enriched with
`property_name · rls_score/100 · band_label · review_state` + a band-colored dot. **+** →
`newChat()` → `/app` (fresh wizard). Driven by the existing `getConversation` /
`watchResearch` / `loadReportAndMap` flows (frontend/docs/01).

## 3. Analysis region (`src/components/analysis/*`)

Built from the `Report` (`lib/api.ts`). Peer-view **tabs** (sticky): **Ringkasan · Bukti ·
Checklist**. Order follows the analysis-summary + report-decision-summary patterns: status →
key findings → score explanation → confidence/limitations → next action.

**Ringkasan:**
1. **Red-flag panel first** when any `is_critical` (STD-SCR-001 override; never hidden).
2. **ScoreCard** — circular `rls_score`/100 (**never brand-green**; neutral ring tinted by
   band via semantic tokens), `ValidationBadge` "Hasil awal · belum ditinjau analis",
   property name, `RiskBadge` from band, plain-language recommendation, one primary
   **action-banner** (the top next action). Score is subordinate to findings.
3. **DisclaimerCard** — always visible.
4. **Priority findings** — `FindingCard` grid from `categories` + `red_flags`: `RiskBadge`
   (band/severity) + `ConfidenceBadge` (docs/09), claim, `limitation`, `validation_action`
   link. Categories with `score === null` show "Data belum cukup".
5. **Evidence limitations** — from `evidence_gaps`, beside the findings (not buried).
6. **Checklist** — inline preview of `report.checklist` + "Buka checklist" → Checklist tab.

**Bukti:** bordered list of evidence cards (category code + title + `SeverityBadge`, claim,
meta `Sumber/Kepercayaan/Diamati`, amber limitation, labeled **"Langkah validasi:"** note);
**paginated** — 20 per page with a "Muat … bukti lagi" load‑more button. Tabs bar is 50px with
a deep‑teal active underline. Long claims/limitations use `Clamped` (truncate + tooltip);
validation actions are labeled (not faux‑links). *(See `docs/prd/core-workspace/evidence-risk-panel.md` for specific content strategy and wireframes).*

**Checklist:** full `report.checklist` (item · category · reason), visual checkboxes only.

## 4. Scope guardrails (header actions)

- **Tinjau analis (Expert Review):** opens the existing human-review continuation — the
  `wa.me` WhatsApp link. Not a new backend feature.
- **Bagikan:** triggers the **existing** `GET /api/checks/{intake_id}/report.pdf` download
  (backend enforces the daily cap); shown only when a report exists. No new export pipeline.

## 5. Decision-safety rules honored

- Brand-green is action/identity only — never score ring, confidence, or "positive/safe".
- Evidence · interpretation · confidence · limitations · next action stay visibly separate.
- Critical red flags first; safety-critical limitations never behind tabs/hover/disclosure.
- Assistant (rail) output never styled as verified analysis; the score never replaces findings.
