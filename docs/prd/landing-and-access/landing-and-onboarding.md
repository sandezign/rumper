# PRD: Landing & Access Onboarding

## Metadata

| Field | Value |
|-------|-------|
| **Author** | Antigravity AI |
| **Status** | Draft |
| **Created** | 2026-07-08 |
| **Last Updated** | 2026-07-08 |
| **Version** | 0.1 |
| **Related Docs** | `prd-rumper-landing-page.md`, `docs/17-marketing-and-onboarding.md` |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?

> First-time home buyers in Jabodetabek are making high-stakes, long-term housing decisions without access to unbiased location risk data. Traditional property marketplaces act as marketing agents for developers, highlighting promotions while concealing critical risks such as flood exposure, traffic bottlenecks, and lack of nearby facilities. Buyers need an independent, objective advisory interface that helps them identify location red flags *before* paying down payments.

**Evidence:**
- Property search portals (Rumah123, Lamudi) emphasize pricing, home photos, and floor plans, completely omitting independent environmental and infrastructure data.
- Jabodetabek buyers face severe "information asymmetry" where developers push verbal claims ("100% bebas banjir") that are historically inaccurate.
- Competitors like Hometrix.ai in Australia validate that home buyers convert highly when presented with clean, structured report previews and a clear positioning of developer-independence.

**Key Insight:**
To convert anxious home buyers, the landing page must first validate their hidden fears (Common Pitfalls) and present an empathetic reality check (Real Regrets) before introducing Rumper's technical solution. Trust is established by demonstrating complete neutrality (no developer commission) and showing a visual preview of our geo-data report.

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Drive user acquisition | Landing page conversion rate | > 30% of visitors complete the onboarding search |
| G2 | Maximize landing engagement | Average scroll depth | > 70% of visitors scroll past the Report Preview section |
| G3 | Establish platform trust | Bounce rate | < 45% bounce rate |

---

## 3. Non-Goals

- **Not building:** A property listing marketplace. We do not sell houses.
- **Not solving for:** Real estate investors. We focus exclusively on primary residence buyers.
- **Not changing:** We are not providing financial or legal advice (mortgage rates, contract reviews).

---

## 4. Target Users

### Primary Persona
- **Who:** "Si Commuter" & "Si Perencana" (Young professionals / young couples in Jabodetabek, 25-36 years old).
- **Context:** They have a shortlist of properties but are anxious about making the wrong choice regarding commute times or flood risks.
- **Motivation:** To validate if a property location is safe, convenient, and suitable for their long-term plans.
- **Current workaround:** Asking on Facebook groups, Reddit, or trusting the real estate agent blindly.
- **Jobs to be done:** "As a first-time home buyer, I want to see the objective risks of a neighborhood so that I don't regret my purchase and get stuck with a 15-year mortgage on a bad house."

### Anti-Persona
- **Who is this NOT for:**
  - Real estate investors seeking ROI data.
  - Users looking for properties outside Jabodetabek.

---

## 5. User Stories & Key Flows

### Story 1: Landing Page Discovery & Trust Building
**As a** first-time home buyer, **I want to** understand Rumper's value proposition without logging in, **so that** I can decide if this tool is trustworthy and relevant to my fears.

**Flow:**
1. User lands on `/`.
2. User sees the Hero Section ("Jangan Beli Rumah Sebelum Cek Risikonya") and can immediately input a property name to search, or click "Cek Risiko".
3. User scrolls through "Jebakan Lokasi" (Common Pitfalls) and "Real Regrets".
4. User reviews the "Cara Kerja Rumper" process and Visual Report Preview.
5. User reviews additional trust-building sections: Detailed Explanations, Rumper's Independence Position, Target User Profiles, and FAQ.
6. User clicks "Mulai Analisis Gratis" CTA at the bottom.
7. User is redirected to `/app` (if logged in) or `/login` (if not).

### Story 2: Seamless Registration / Login
**As an** interested home buyer, **I want to** log in quickly using my Google account, **so that** I don't have to remember another password and can start my analysis immediately.

**Flow:**
1. User lands on `/register` or `/login`.
2. User sees the value panel and the primary "Google Sign-In" button.
3. User authenticates via Google OAuth.
4. User is redirected to the onboarding wizard (`/app`).

### Story 3: Guided Intake Onboarding
**As a** new user, **I want to** provide context about my lifestyle and target location in a guided, easy-to-understand format, **so that** the AI can personalize its location risk research for me.

**Flow:**
1. User enters `/app` and sees the "Mulai analisis lokasi" progress topbar.
2. User inputs a property in the Google Places autocomplete field and submits.
3. User navigates through a 7-step guided option flow (`/app/start`):
   - Properti shortlist (pre-seeded)
   - Lokasi aktivitas (optional)
   - Moda transportasi
   - Prioritas risiko (multi-select)
   - Tahap & timeline
   - Catatan tambahan (optional)
4. User reviews their choices on the final "Review & Confirm" step.
5. User clicks "Confirm & Mulai Analisis".
6. The system sends a `POST /api/conversations/from-intake` and navigates to the workspace loader (`/app/c/:id`).

---

## 6. Solution Overview

**Approach:** 
The application shifts from a "cold entry" chat to a structured funnel: **landing → register/login → onboarding → workspace**. This ensures the user is briefed on Rumper's value proposition, smoothly authenticated via Google, and guided through a deterministic 7-step wizard that gathers essential context to seed the AI research pipeline perfectly.

**Key Design Decisions:**

1. **Deterministic Guided Wizard (Not free-text).** The 7-step onboarding is implemented as discrete choice chips and inputs rather than a free-typed chat. This bypasses unreliable LLM intent-gathering, guarantees structured data for the backend, and reduces token costs.
2. **Deep-Teal Premium Aesthetic.** The landing page abandons the "warm-paper/Fraunces" look in favor of a modern, deep-teal and bright-green token system to project authority, neutrality, and reliability.
3. **Google Auth as Primary Gate.** Custom form fields (name, phone) are visually present for future-proofing but do not block sign-in. Google OAuth is the real mechanism to ensure high conversion rates.

---

## 7. Technical Scope

### Affected Architecture Layers

| Layer | Changes | Details |
|-------|---------|---------|
| **Frontend** | New / Modified | Landing (`/`), Register/Login (`/register`, `/login`), LocationHome (`/app`), Onboarding Wizard (`/app/start`). |
| **Backend** | None | Relies on existing Google OAuth (`/api/auth`) and conversation start endpoints. |
| **Integrations**| Affected | Google Places API autocomplete required on `/app` step 1. |

### Feature Flag Strategy
- Flag name: `[TODO - feature flag if required for new landing]`
- Default: `on` (Replacing old landing)

---

## 8. Hypotheses & Assumptions

| # | Hypothesis | Validation Method | Status |
|---|-----------|-------------------|--------|
| H1 | We believe a landing page that highlights buyer "regrets/pitfalls" will convert better because it triggers loss aversion. | We'll know we're right if the bounce rate is < 45% and scroll depth > 70%. | Unvalidated |
| H2 | We believe a deterministic 7-step wizard will increase completion rates compared to a free-text chatbot intake. | We'll know we're right if >80% of users who start the wizard reach the final submit button. | Unvalidated |

**Key assumptions that could invalidate this plan:**
- **Users are willing to log in before seeing any free value.** If the Google Auth wall causes too much drop-off, we may need to allow "guest" searches for the first report. **Mitigation:** Ensure the landing page visual report preview is compelling enough to justify the login wall.

---

## 9. Success Metrics

### Primary KPI
- **Metric:** Landing page conversion rate (To onboarding)
- **Baseline:** [TODO — need current baseline]
- **Target:** > 30% of visitors complete the onboarding search
- **Timeline:** 1 month post-launch

### Secondary KPIs
- **Metric:** Average scroll depth
- **Target:** > 70% of visitors scroll past the Report Preview section
- **Metric:** Wizard Completion Rate
- **Target:** > 80% of users who start step 1 complete step 7

### Guardrail Metrics (must not regress)
- Bounce rate must stay below 45%

---

## 10. Risk Assessment

| Risk Type | Level | Description | Mitigation |
|-----------|-------|-------------|------------|
| **Value** | Medium | Will users trust a new tool with their Google account? | Prominent trust badges on the login screen ("Data not shared with agents"). |
| **Usability** | Low | The 7-step wizard might feel too long. | Use clear progress indicators ("Langkah X dari 7", "± 3 menit") and single-click chips. |
| **Feasibility**| Low | Standard frontend React implementation. | Reuse existing design tokens and `placesAutocomplete`. |

---

## 11. Dependencies & Risks

### Third-Party Dependencies
- [x] **Google Places API** — Required for property autocomplete on step 1.
- [x] **Google OAuth** — Required for user sign-in.

---

## 12. Implementation Approach

### PR Breakdown Strategy

| # | PR Scope | Estimated Size | Dependencies | Labels |
|---|----------|---------------|--------------|--------|
| 1 | Landing Page (`/`) UI implementation | ~400 lines | None | `frontend`, `ui` |
| 2 | Auth views (`/register`, `/login`) | ~150 lines | None | `frontend`, `auth` |
| 3 | LocationHome (`/app`) & Places API | ~200 lines | PR 2 | `frontend` |
| 4 | 7-step Onboarding Wizard (`/app/start`) | ~500 lines | PR 3 | `frontend`, `wizard` |

### Testing Plan
- **E2E tests:** Verify the entire flow from Landing -> Google Auth -> 7-step Wizard -> `POST /api/conversations/from-intake`.

---

## 13. Stakeholder Sign-Off

| Role | Name | Status |
|------|------|--------|
| PM | [TODO] | [ ] Approved |
| Eng Lead | [TODO] | [ ] Approved |
| Design | [TODO] | [ ] Approved |
