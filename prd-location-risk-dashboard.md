# PRD: Rumper Location Risk Dashboard

## Metadata

| Field | Value |
|-------|-------|
| **Author** | [TODO — PRD author name] |
| **Status** | Draft |
| **Created** | 2026-06-28 |
| **Last Updated** | 2026-06-28 |
| **Version** | 0.3 |
| **Related Docs** | `PRD rumah pertama.md`, `context.md`, `docs/09-frontend.md`, `docs/12-chat-workspace.md`, `docs/14-map-delivery.md`, `docs/16-workspace-shell-and-analysis.md`, `landing_page_vs_dashboard_content_mapping.md` |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?

> First-time home buyers in Jabodetabek ("Si Commuter" and "Si Perencana" personas) are purchasing properties under severe "information asymmetry." While listing portals and sales agents display pristine home specifications and photos, they conceal critical location-based risks (e.g., historical flooding, grueling weekday commute times, and poor road access). Buyers lack an objective, independent platform to evaluate whether a property location is safe and convenient *before* committing booking fees or down payments.

**Evidence:**
- Traditional search portals (e.g., Rumah123, Lamudi) emphasize promotion and prices, providing zero independent environmental or infrastructure data.
- Sales agents push undocumented verbal claims ("100% bebas banjir", "10 menit ke stasiun") that lead to real buyer regrets when actual conditions are different.
- Historical data shows that buyers often check a property only on weekends, completely missing weekday rush-hour traffic bottlenecks or rainy season flooding.

**Key Insight:**
To establish credibility as an independent Location Risk Advisor, the application dashboard must not hide behind simple visual ratings. It must present a comprehensive location risk assessment that separates hard evidence, visual maps, and user priorities. Scores must be subordinate to concrete findings, and safety-critical limitations must never be hidden.

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Provide rapid location intelligence | Report generation time | 100% of successful intakes generate a report in < 3 minutes |
| G2 | Maximize buyer field-validation prep | Checklist engagement | > 50% of users click "Buka checklist" or check items on site |
| G3 | Facilitate professional continuation | Expert review request rate | > 10% of generated checks click the WhatsApp "Tinjau analis" CTA |

---

## 3. Non-Goals

- **Not building:** A property marketplace. We do not list or sell houses.
- **Not solving for:** Property investors or developers seeking to advertise.
- **Not changing:** The preliminary nature of the prototype check. The report is explicitly labeled as a preliminary "Mini Check" and does not issue a final legal or risk guarantee.
- **Deferred to future:** Interactive custom map layers or user-uploaded photos.

---

## 4. Target Users

### Primary Persona: "Si Commuter"
- **Who:** Young working professional in Jakarta metropolitan area looking to buy a house in suburban Jabodetabek (e.g., Bekasi, Tangerang, Depok).
- **Context:** Commutes daily to Jakarta central business districts using public transit or motorcycles.
- **Motivation:** Find affordable housing without sacrificing physical health and spending 4 hours a day in traffic.
- **Current workaround:** Guessing routes on Google Maps, asking in online forums, or believing developer advertisements.
- **Jobs to be done:** "As a commuter buyer, I want to see the real rush-hour travel times and distance to active train stations so that I don't buy a house that leaves me physically exhausted every day."

### Secondary Persona: "Si Perencana"
- **Who:** Newly married couples or young families planning for their children's future.
- **Context:** Focused on long-term residential suitability and child safety.
- **Motivation:** Ensure the house has access to high-quality healthcare, reputable school zones, and is safe from flooding.
- **Current workaround:** Visiting the site multiple times during different seasons.
- **Jobs to be done:** "As a young parent, I want to know if this neighborhood floods during the rainy season and if there's a hospital nearby so that my family is safe."

### Anti-Persona
- **Who is this NOT for:**
  - Real estate listing agents who want to promote properties and hide location risks.
  - Property investors seeking commercial yield data.

---

## 5. Main Dashboard Feature Set (Current Implementation UI)

The Rumper Location Risk Dashboard workspace comprises four primary modules structured as a global header and a three-region layout:

### A. Global Header Navigation
- **Brand Identity:** Left-aligned green house icon and wordmark "Rumper" routing back to `/app`.
- **Hamburger Button:** Displays on mobile/tablet viewports to toggle the slide-in left AI Assistant rail drawer.
- **Context Meta:** Center-aligned display text: `"Analisis properti - diperbarui {tanggal}"` (e.g., "Analisis properti - diperbarui 28 Jun 2026").
- **CTA Actions:**
  - **Tinjau Analis (Expert Review):** A bordered button on dark background with user-check icon. Opens a WhatsApp concierge link pre-filled with the current audit context.
  - **Unduh Laporan (Share/PDF):** A primary button in brand-green (`#00ed64`) with a download icon. Triggers a static PDF report download.
- **Profile Avatar:** Far-right circular avatar displaying user profile picture or letter indicator, routing to `/app/akun`.

### B. Left Region: AI Assistant Rail (~340px width)
- **Active Audit Dropdown Selector:** An interactive dropdown that lets users switch between their properties.
  - **Dropdown Header:** Displays current selected property name (e.g., `Grand Galaxy City, RT.009/RW...`) with a down chevron. Clicking expands the popover list.
  - **Audit Tersedia Popover List:** Renders all cached audits:
    - **Audit Info:** Display format is `[Property Title]` and a subtext `{Score}/100 · {Band Label} · Hasil awal` (e.g., `54/100 · Hati-hati · Hasil awal`).
    - **Visual Indicator Dot:** A color-coded circular dot matching the risk band (e.g., **orange** for `hati_hati`, **blue/teal** for `layak_dengan_catatan`).
    - **Current Marker:** A green checkmark tick `✓` next to the currently selected audit in the list.
    - **Fresh Start Button:** A green circular **"+"** button on the right of the dropdown trigger to launch a new location search.
- **Deep Thinking Progress Logger:** A step-by-step progress checklist displayed while the research is executing. Items:
  - ✓ *Memindai data spasial (banjir, elevasi, tol, fasilitas)...*
  - ✓ *Menyusun rencana riset...*
  - ✓ *Mencari & memperdalam bukti dari web...*
  - ✓ *Mengekstrak temuan & sumber...*
  - ✓ *Menghitung skor & menyusun laporan...*
- **Conversational Chat Workspace:**
  - **Chat Feed:** Shows messages from the assistant detailing the final status, specific support links, and findings.
  - **Chat Input Composer:** A text input field ("Tanya soal lokasi ini...") with a send icon. Locked during active research execution.
  - **Compliance Footer:** Caption at the bottom: `"Mini Check awal, belum ditinjau analis - bukan jaminan. Validasi di lapangan sebelum DP."`

### C. Center Region: Analysis Workspace (Interactive Report)
- **Segmented Workspace Navigation Tabs:** A sticky tab menu at the top:
  - **Ringkasan:** The master overview panel.
  - **Bukti (N):** The detailed evidence page with temuan counter (e.g., "Bukti 37").
  - **Checklist (N):** The physical validation checklist with item counter (e.g., "Checklist 15").

#### Tab 1: Ringkasan (Overview)
- **Actionable Recommendation Banner:** A pale-green banner located above the main summary displaying the top next validation step (e.g., "Langkah utama: Cek elevasi titik rumah dan bandingkan dengan ketinggian banjir yang dilaporkan di area terdekat.").
- **Warning Disclaimer Banner:** A prominent pale-yellow card clarifying that the check is an early-stage opinion ("opini kedua awal") and not a final safety guarantee.
- **Ringkasan Section:** Text paragraph summarizing key property strengths (access to hospitals, schools) and primary concerns (flooding history, commute time).
- **Temuan Prioritas (Priority Findings) Grid:** A 2x2 grid displaying key location risks. Each card has a severity-colored border/header and contains:
  - **Severity badge:** e.g., `Risiko tinggi` (amber/red) or `Perlu perhatian` (orange/yellow).
  - **Finding Title:** Category name (e.g., "Ketahanan Banjir").
  - **Claim Context:** Sentence explaining the finding (e.g., "Pada Maret 2025, banjir di Grand Galaxy City mencapai ketinggian air 1,2 meter hingga 1,5 meter...").
  - **Validation Steps:** Actionable validation copy (e.g., "Validasi: Cek elevasi titik rumah...").
- **Keterbatasan Bukti (Evidence Limitations) Section:** Bulleted items explaining metrics details and missing information:
  - Jarak ke Pintu Tol Terdekat (e.g., 1.96 km Pekayon/Bekasi Barat).
  - Jarak ke Stasiun Terdekat (e.g., 2.05 km LRT Cikunir 2).
  - Jarak ke Fasilitas Umum (RS 0.48 km, sekolah 0.2 km).
  - Explicit database gap details ("Tidak ditemukan peta genangan banjir spesifik...").
- **Checklist Preview Section:** Shows first three checklist actions with a link `"Buka checklist (15)"` pointing to the Checklist tab.

#### Tab 2: Bukti (Supporting Evidence Log)
- **Header Summary:** Section title "BUKTI PENDUKUNG" and count of items (e.g., "37 temuan"). Subtitle: `"Setiap temuan didukung data dan memiliki keterbatasan yang perlu diverifikasi di lapangan."`
- **Paginated Evidence Cards:** A vertical list of detailed findings cards, each containing:
  - **Category Tag:** Three-letter abbreviation in gray background (e.g., `BJR` for Banjir, `AKS` for Akses).
  - **Finding Category Title:** Bold text category (e.g., **Ketahanan Banjir**).
  - **Rating Outline Badge:** Colored status outline pill at the right:
    - `Cukup baik` (green)
    - `Perlu perhatian` (orange)
    - `Risiko tinggi` (red/pink)
  - **Finding Narrative Text:** Paragraph explaining the raw observation (e.g., "Indeks bahaya banjir InaRISK BNPB...").
  - **Metadata Row:**
    - **Sumber:** Clickable source names (e.g., `InaRISK BNPB (layer bahaya banjir)`, or news URLs like `indonesiamove.com`, `kompas.com`, `detik.com` with `+N` indicator for multiple news articles).
    - **Kepercayaan:** Level of evidence strength (`Data kuat`, `Data sedang`, `Perlu validasi`).
    - **Diamati:** Date stamp of research retrieval (e.g., `2026-06-28`).
  - **Keterbatasan Box:** A highlighted yellow callout detailing why this area data might not apply directly to the house:
    - Format: `Keterbatasan: [Text]` (e.g., `"Keterbatasan: Resolusi raster area, bukan per-rumah."`).
  - **Langkah Validasi Instruction:** Actionable fieldwork direction with checkmark icon:
    - Format: `Langkah validasi: [Text]` (e.g., `"Langkah validasi: Tanyakan ke minimal 2 warga/satpam..."`).

#### Tab 3: Checklist (Field Survey checklist)
- **Header Details:** Title "CHECKLIST SURVEI KEDUA", subtitle `"Selesaikan sebelum keputusan uang muka atau booking fee."` and badge tracking `"Progres {X} dari {Y} selesai"`.
- **Actionable Checklist Cards:** A vertical list of check items. Each item includes:
  - **Empty Circle Checkbox:** Clickable visual indicator.
  - **Verification Title:** Bold instruction (e.g., **Verifikasi kondisi drainase dan elevasi spesifik di titik rumah.**).
  - **Context Description:** Lighter subtext linking the action back to a specific finding.
  - **Category association Badge:** `Terkait: {Kategori}` (e.g., `Terkait: Banjir` or `Terkait: Akses`).

### D. Right Region: Map & Geo-Evidence Workspace
- **Bukti Lokasi Meta Card:**
  - Property candidate title & address details.
  - Overall **RLS Score Badge:** Styled as a colored circle/pill (`54` - orange indicating "Hati-hati").
  - Recommendation & Band labels (e.g., "Hati-hati · Validasi lebih lanjut sebelum memutuskan").
  - **Dimension Breakdown Grid:** Mini progress bars tracking five categories:
    - **Banjir:** 24/100 (Risiko Tinggi)
    - **Commute:** 50/100 (Sedang)
    - **Akses:** 64/100 (Sedang)
    - **Fasilitas:** 100/100 (Sangat Baik)
    - **Lingkungan:** 64/100 (Sedang)
- **Interactive Map Canvas:** Renders geospatial markings:
  - Property target center pin.
  - Radius rings (e.g., "Zona ±3 km" representing commute or transit buffers).
  - Active flood boundaries or InaRISK flood risk contours.
  - Points of Interest (POI) icons representing schools, hospitals, transit doors.
  - Critical hazard rings ("Red flag (ring = kritis)").
- **Floating Legend Card:** An overlay card detailing map symbols:
  - Travel buffer zone (e.g., 5-10 mnt berkendara).
  - InaRISK flood context boundary.
  - Candidate house pin.
  - Essential facilities, stations & toll gates icons.
  - Red flag critical hazard circle.
- **Bukti Tertaut Card:** Bottom overlay banner displaying: `"Pilih titik di peta untuk melihat bukti yang sama dengan temuan."`

---

## 6. Solution Overview

**Approach:** 
The Rumper Location Risk Dashboard is implemented as a three-region responsive layout (Assistant rail · Analysis workspace · Map panel) built with React, Tailwind v4, and Lucide icons. The interface operates under strict decision-safety guidelines: brand-green is never used for positive indicators or score rings, and safety-critical limitations are always visible.

**Key Design Decisions:**

1. **Three-Region Layout (Split Pane):** 
   Ensures the assistant chat, report findings, and map visualizer are viewed side-by-side on desktop. Each region scrolls independently, allowing the user to examine maps while reading findings.
   *Alternative considered:* Single column dashboard with scroll sections. *Rejected* because users need spatial map context while reading evidence reports.

2. **Subordinating Score to Evidence:**
   The RLS score is positioned alongside a prominent disclaimer card and a "Preliminary report" badge to prevent buyers from relying entirely on a single number.
   *Alternative considered:* Displaying a simple letter grade (A/B/C). *Rejected* to avoid false confidence and align with the "AI never owns the final score" principle.

3. **Responsive Reflow for Mobile:**
   On smaller screens (tablet/mobile), the Map Panel is hidden by default and accessible via a floating "Peta risiko" button. The Assistant rail is transformed into a drawer menu toggled by the hamburger button, maximizing reading area for the analysis report.

**Wireframes/Mockups:** Refer to the prototype design system (`frontend/docs/design/README.md`) and the `dashboard.html` layout mockup.

---

## 7. Technical Scope

### Affected Architecture Layers

| Layer | Changes | Details |
|-------|---------|---------|
| **Database** | None | Uses existing tables: `intakes`, `research_jobs`, `findings`, `category_scores`, `reports` |
| **Backend** | Modified | Optimize polling endpoint `GET /api/checks/{intake_id}` and LangGraph research execution response times |
| **Frontend** | Modified | Refactor `Workspace.tsx` and sub-components (`AppShell`, `AssistantRail`, `MapPanel`, `analysis/ScoreCard`) to follow MongoDB-inspired tokens |
| **API** | None | Keeps existing FastAPI REST contract (`POST /api/intakes`, `GET /api/checks/{id}`) |
| **Integrations** | None | Uses existing Google Maps / InaRISK API clients |

### Database Changes
- No schema migrations required for this phase.

### API Surface
- Polling: `GET /api/checks/{intake_id}` returns status `pending`, `running`, or `done` with the compiled report payload.
- Export: `GET /api/checks/{intake_id}/report.pdf` serves the static PDF report.

### Feature Flag Strategy
- Flag name: `rumper-risk-dashboard`
- Default: `off`
- Implementation: Active checking in `frontend/src/components/Workspace.tsx`.

---

## 8. Hypotheses & Assumptions

| # | Hypothesis | Validation Method | Status |
|---|-----------|-------------------|--------|
| H1 | Displaying raw evidence and data limitations increases user trust | Survey question on transparency post-check | Unvalidated |
| H2 | Tying the overall score to a field-survey checklist increases user action | Measure click-through and checkbox interactions on the checklist tab | Unvalidated |
| H3 | A clear disclaimer stating the report is preliminary drives conversion to expert reviews | Track CTR of the "Tinjau analis" button in the global header | Unvalidated |

**Key assumptions that could invalidate this plan:**
- **Assumption:** Third-party APIs (Google Maps, InaRISK BNPB) have high uptime and response rates. If APIs time out, report generation will fail.
  - *Mitigation:* Implement strict timeouts (SOP-RSCH-001) and display explicit "evidence gaps" rather than failing the entire report.

---

## 9. Success Metrics

### Primary KPI
- **Metric:** Intake-to-Report Success Rate
- **Baseline:** [TODO — current baseline from logs]
- **Target:** > 95% of successful intakes generate a valid report
- **Timeline:** 14 days post-GA

### Secondary KPIs
- **Metric:** Checklist Click Rate (Engagement)
- **Baseline:** [TODO]
- **Target:** > 50%
- **Timeline:** 14 days post-GA
- **Metric:** Expert Review WhatsApp CTR
- **Baseline:** [TODO]
- **Target:** > 10%
- **Timeline:** 14 days post-GA

### Guardrail Metrics
- Page Load Time (LCP): Must stay under 2.5 seconds.
- Quota Overuse: Active monitoring of Google API tokens usage per user to stay under 50k token limit.

### Release Criteria
- [ ] No brand-green used for semantic safety/low-risk.
- [ ] Responsive layout matches design guidelines on iOS and Android.
- [ ] Error states handled gracefully if geocoding or BNPB API fails.

---

## 10. Risk Assessment (SVPG Framework)

| Risk Type | Level | Description | Mitigation |
|-----------|-------|-------------|------------|
| **Value** | Medium | Users might check the score and leave without reading the evidence. | Force progressive disclosure: display key warning panels above the fold. |
| **Usability** | Medium | The three-region layout can look crowded on smaller screens. | Enforce responsive reflow rules (hidden map panel + floating action toggle). |
| **Feasibility** | Low | The layout code is standard CSS Grid, but leaflet/mapbox integration needs optimization. | Use lightweight map containers and debounced resize listeners. |
| **Viability** | High | Legal liability if a user buys a house that later floods despite a moderate score. | Embed prominent disclaimer card on the Report Ringkasan tab and PDF. |

---

## 11. Dependencies & Risks

### Cross-Team Dependencies
- [ ] Design Team — Asset delivery for final icons and map styling configurations.

### Third-Party Dependencies
- [ ] Google Maps Places Autocomplete & Distance Matrix API — Critical for routing and POI calculations. Risk: cost spikes and API limits. (Mitigation: token-ledgers and caching).
- [ ] InaRISK BNPB Data Service — Critical for flood risk categories. Risk: slow response times. (Mitigation: async category timeouts).

---

## 12. Implementation Approach

### PR Breakdown Strategy

| # | PR Scope | Estimated Size | Dependencies | Labels |
|---|----------|---------------|--------------|--------|
| 1 | App Shell & Responsive Layout grid | ~350 lines | None | `frontend`, `styling` |
| 2 | Analysis Workspace: Ringkasan, Bukti, and Checklist tabs | ~500 lines | PR 1 | `frontend` |
| 3 | Map Panel & Leaflet layers integration | ~300 lines | PR 1 | `frontend`, `map` |
| 4 | Assistant Rail Integration & Chat Flow | ~400 lines | PR 1, PR 2 | `frontend`, `api` |
| 5 | Integration testing and error states | ~200 lines | PR 3, PR 4 | `testing` |

**Total estimated size:** ~1750 lines across 5 PRs.

### Testing Plan
- **Unit tests:** Check ScoreCard ring coloring logic (ensuring no brand-green is rendered).
- **Integration tests:** Test polling flow on `/api/checks/{id}` with mocked backend errors.
- **E2E tests:** Validate full journey: intake submission -> loading screen -> workspace rendering on desktop and mobile.

### Rollout Plan
1. **Staging / Internal Dogfooding (3 days):** Enable via feature flag `rumper-risk-dashboard` for team accounts.
2. **Beta Test (1 week):** Enable for 10% of new registrants.
3. **General Availability (GA):** Full rollout, flag default `on`.

---

## 13. Stakeholder Sign-Off

| Role | Name | Status |
|------|------|--------|
| PM | [TODO] | [ ] Approved |
| Eng Lead | [TODO] | [ ] Approved |
| Design | [TODO] | [ ] Approved |

---

## Appendix

### Change Log
| Date | Version | Changes |
|------|---------|---------|
| 2026-06-28 | 0.3 | Document detailed specifications for "Bukti" (detailed claims, trust level, observed date, limitations, and checkmark steps) and "Checklist" (title, derived subtext, and tags) tabs, along with the detailed structure of the active audit dropdown selector based on UI screenshots. |
| 2026-06-28 | 0.2 | Update document based on exact dashboard UI implementation details, including header actions, assistant progress rails, priority findings, and map legends. |
| 2026-06-28 | 0.1 | Initial draft generated from prototype specs and conversation files |

### FAQ

- **Q: Mengapa ring skor kelayakan tidak menggunakan warna hijau brand (brand-green)?**
  - **A:** Hijau brand Rumper (`#00ed64`) adalah warna identitas and aksi saja. Penggunaan warna hijau brand pada skor kelayakan dapat memberi kesan keliru bahwa lokasi tersebut "pasti aman / terverifikasi", padahal analisis bersifat awal dan membutuhkan validasi lapangan.

- **Q: Bagaimana jika data banjir dari BNPB tidak tersedia di lokasi perumahan baru?**
  - **A:** Sistem akan menandai kategori banjir sebagai "Data belum cukup" (evidence gap) dan menyusun panduan checklist khusus bagi pembeli untuk memverifikasi riwayat genangan secara langsung kepada warga setempat.

### Research & References
- [docs/16-workspace-shell-and-analysis.md](file:///Users/arisandy/Downloads/rumper-main%20NEW/docs/16-workspace-shell-and-analysis.md)
- [docs/09-frontend.md](file:///Users/arisandy/Downloads/rumper-main%20NEW/docs/09-frontend.md)
- [landing_page_vs_dashboard_content_mapping.md](file:///Users/arisandy/.gemini/antigravity/brain/09c623c6-ea1f-42fe-a759-194200a82680/landing_page_vs_dashboard_content_mapping.md)
