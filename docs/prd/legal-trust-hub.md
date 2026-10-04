# PRD: Legal & Trust Hub (Privacy Policy, Terms of Service, Security)

## Metadata

| Field | Value |
|---|---|
| **Author** | [TODO — PRD author name] |
| **Status** | In Review |
| **Created** | 2026-10-04 |
| **Last Updated** | 2026-10-04 |
| **Version** | 1.0 |
| **Related Docs** | `prd-rumper-landing-page.md`, `docs/09-frontend.md`, `docs/17-marketing-and-onboarding.md`, `RUMPER — BUSINESS & PRODUCT PLAN.md`, [Grupy.chat Syarat & Privasi](https://grupy.chat/syarat), [Memverr Legal & Security](https://www.memverr.com/security) |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?

> First-time home buyers in Jabodetabek considering Rumper for location risk intelligence need transparent, binding proof of Rumper's developer-independence, data privacy safeguards (UU PDP No. 27/2022), and cloud data security before they input personal commute details, office destinations, and contact numbers. Currently, the landing page (`frontend/src/pages/v2/LandingV2.tsx`) contains dead/broken footer links (`/terms`, `/privacy`, and lacks a dedicated `/security` overview), leaving prospective users unsure of platform legitimacy, liability boundaries, and data handling practices.

**Evidence:**
- Footer links in `LandingV2.tsx` (lines 766–768) explicitly direct to `/terms` and `/privacy`, which currently resolve to `NotFound.tsx` (404), degrading consumer trust at the final consideration stage.
- Users of property platforms in Indonesia are traditionally wary of lead-generation spam; without an explicit non-brokerage disclaimer and UU PDP compliance statement, users hesitate to submit their WhatsApp and commute destinations.
- Reference platforms (*Grupy.chat* and *Memverr*) demonstrate that modern Indonesian SaaS platforms require plain-language legal terms and visible security certifications/pillars to convert trust-sensitive local users.

**Key Insight:**
For a pre-purchase risk advisory service whose whole value proposition is **unbiased independence from developers**, legal and security pages are not boilerplate formalities—they are primary conversion and trust-building assets. Translating legal requirements into clear, accessible, and structured terms cements the platform's positioning as an objective ally that never sells leads or takes developer kickbacks.

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Eliminate broken legal links on the landing page | 404 error rate on `/terms`, `/privacy`, `/security` | 0% (100% resolution to active pages) |
| G2 | Maximize user reassurance on data privacy and non-brokerage independence | Readability & bounce rate on legal pages | Average time on page > 45s, bounce < 35% |
| G3 | Fulfill Indonesian regulatory compliance (UU PDP No. 27/2022 & PSE Kominfo) | Compliance checklist completion rate | 100% mandatory statutory clauses covered |
| G4 | Establish trust parity with benchmark SaaS platforms (Grupy & Memverr) | User feedback on security credibility | Positive trust sentiment in onboarding wizard |

---

## 3. Non-Goals

- **Not building:** A dynamic CMS or admin portal for arbitrary legal document creation (content will be structured React/Markdown components version-controlled in the codebase).
- **Not building:** A certified legal counsel / notary validation engine (content provides informational and platform binding terms, not individual legal advice to buyers).
- **Not solving for:** Real estate dispute mediation between developers and buyers (explicitly stated in the disclaimers).
- **Not changing:** Core onboarding wizard auth flow (`/v2/start`, `/app/start`) or existing geodata calculation APIs.
- **Deferred to future:** Interactive cookie consent banner with granular tracking categories (to be introduced when non-essential analytics tracking is expanded).

---

## 4. Target Users

### Primary Persona
- **Who:** "Si Perencana" (First-time homebuyer in Jabodetabek, 26–35 years old, digital-native professional).
- **Context:** Inspecting Rumper before putting in their office destination or paying for an in-depth location risk report.
- **Motivation:** Wants reassurance that Rumper will not sell their phone number to aggressive property brokers and that Rumper's risk rating has clear liability boundaries.
- **Current workaround:** Looking for company addresses, checking social proof, or abandoning the page due to missing legal backing.
- **Jobs to be done:** *"When I evaluate an independent location risk report, I want to clearly understand how my data is stored and confirm that Rumper doesn't take commissions from developers, so I can trust the advice without fearing spam or biased recommendations."*

### Secondary Persona
- **Who:** Legal / Compliance Auditor & Regulatory Body (Kominfo / Lembaga PDP / Payment Gateway Partner).
- **How they're impacted:** Evaluates whether Rumper qualifies as a legitimate, registered Penyelenggara Sistem Elektronik (PSE) complying with UU PDP 27/2022.
- **Context:** Verification during merchant onboarding (e.g., Midtrans/Xendit) or domain validation.

### Anti-Persona
- **Who is this NOT for:**
  - Real estate developers seeking to contest individual flood or commute ratings through legal intimidation (addressed strictly via our methodology and disclaimer clauses).
  - Commercial data aggregators looking to scrape Rumper's geocoded database (strictly banned under Terms of Service Section 3).

---

## 5. User Stories & Key Flows

### Story 1: Visitor Inspects Legal Terms & Privacy from Landing Page (Happy Path)
**As a** prospective homebuyer on the landing page, **I want to** click "Syarat Layanan", "Kebijakan Privasi", or "Keamanan" in the footer, **so that** I can review how my personal and commute data is handled.

**Flow:**
1. User scrolls to the footer of `LandingV2` or `LandingV3`.
2. User clicks on "Syarat Layanan" (`/terms`), "Kebijakan Privasi" (`/privacy`), or "Keamanan Data" (`/security`).
3. User is routed immediately without page reload via client-side routing (`react-router-dom`).
4. Page renders with consistent Rumper branding (brandmark, theme toggle, clean typography max-width 780px).
5. User sees the last updated date, concise summary lead paragraph, and interactive Table of Contents (TOC).
6. User clicks a section in the TOC (e.g., "Independensi & Batasan Tanggung Jawab") and smoothly scrolls to the anchor.
7. User reads the clear, plain-language Indonesian text with highlighted callout blocks.
8. User clicks "Kembali ke Beranda" or CTA "Cek Lokasi Sekarang" to resume onboarding.

### Story 2: Tech-Savvy Buyer Inspects Data Security & Infrastructure
**As a** user about to purchase a Premium Report, **I want to** review the platform's security safeguards on `/security`, **so that** I can trust the payment and data transit integrity.

**Flow:**
1. User navigates to `/security` from the footer or account settings.
2. User views the 6 core security pillars rendered in modern visual cards (inspired by Memverr):
   - SSL/TLS 256-bit Transit Encryption
   - Cloud Infrastructure & Enterprise Hosting
   - Access Control & OAuth 2.0 Google Authentication
   - Automated Daily Backups & Disaster Recovery
   - 24/7 Monitoring & Audit Logging
   - Privacy Compliance (UU PDP No. 27/2022) & Zero Data Selling
3. User notices the "Responsible Disclosure" contact email (`security@rumper.id` / `halo@rumper.id`) for reporting vulnerabilities.
4. User clicks "Coba Gratis dengan Google" or returns to checkout with full confidence.

### Story 3: User Accesses Indonesian Aliases (`/syarat`, `/privasi`, `/keamanan`)
**As a** user typing the URL in Indonesian or clicking a shared link, **I want to** be redirected seamlessly to the canonical route, **so that** no 404 occurs.

**Flow:**
1. User enters `rumper.id/syarat` or `rumper.id/privasi`.
2. Router intercepts the legacy/localized path and issues a `301/replace` redirect to `/terms` or `/privacy`.
3. Canonical page loads with correct OpenGraph metadata and schema.org markup.

### Flows NOT Covered
- In-app interactive data export / account deletion self-service button (users request deletion via designated privacy email `privasi@rumper.id` as specified in Section 5 of Privacy Policy).
- Physical legal document signing / PDF e-signature flow (click-through acceptance upon sign-up is standard).

---

## 6. Solution Overview

**Approach:**
Implement a dedicated, responsive **Legal & Trust Hub** containing three specialized views (`/terms`, `/privacy`, `/security`) built as unified, clean components adhering to Rumper's design system. The copy adopts a hybrid of Grupy's conversational plain-language Indonesian clarity and Memverr's reassuring card-based technical presentation.

**Key Design Decisions:**

1. **Route Convention (English URLs with Indonesian on-screen copy).** Following `docs/09-frontend.md` §Route convention, canonical URLs are `/terms`, `/privacy`, and `/security`, while `/syarat`, `/privasi`, and `/keamanan` act as automatic permanent redirects.
2. **Dedicated Layout Shell (`LegalLayout.tsx`).** A shared layout ensures consistent navigation, sticky progress/TOC header, dark/light theme toggle, print stylesheet, and back-to-home actions across all legal documents.
3. **Card-Based Visual Structure for `/security`.** Rather than an unbroken block of text, security practices are presented as visual modular cards with clear iconography (Lucide icons: `ShieldCheck`, `Lock`, `Server`, `Key`, `RefreshCw`, `Eye`), matching best-in-class SaaS expectations (Memverr).
4. **Explicit Statutory Alignment with UU PDP No. 27/2022.** The Privacy Policy explicitly itemizes the 8 Subject Rights (Hak Subjek Data Pribadi) mandated under Indonesian law to protect against regulatory liabilities.

**Wireframes/Mockups:**
- Clean, centered reading column (`max-w-3xl`, `780px` max reading line length).
- Sticky utility navigation bar with Rumper logo, breadcrumb, and "Coba Cek Lokasi" CTA.
- Mobile drawer / top jump menu for instant navigation between sections.

---

## 7. Technical Scope

### Affected Architecture Layers

| Layer | Changes | Details |
|---|---|---|
| **Database** | None | No schema changes required; legal content is static/rendered client-side. |
| **Backend** | None | No API changes needed. |
| **Frontend** | Major | New pages under `frontend/src/pages/legal/`, updated routes in `frontend/src/main.tsx`, and updated footer anchors in `LandingV2.tsx` and `LandingV3.tsx`. |
| **API** | None | No backend endpoints required. |
| **Integrations** | None | Standard mailto / WhatsApp links for contact and reporting. |

### Database Changes
- [x] New tables/models: None
- [x] New fields on existing tables: None
- [x] Migration strategy: N/A

### API Surface
- [x] New endpoints: None
- [x] Modified endpoints: None

### Frontend File Inventory & Routing

1. **`frontend/src/pages/legal/LegalLayout.tsx`**:
   Shared container with header, breadcrumb navigation, theme toggle, and footer links.
2. **`frontend/src/pages/legal/TermsPage.tsx`**:
   Full content for Terms of Service (Independensi, Ruang Lingkup, Batasan Tanggung Jawab, Hak Cipta, Yurisdiksi).
3. **`frontend/src/pages/legal/PrivacyPage.tsx`**:
   Full content for Privacy Policy (UU PDP compliance, data types, third-party processors, retention, subject rights).
4. **`frontend/src/pages/legal/SecurityPage.tsx`**:
   Full content for Security Center (SSL/TLS, cloud hosting, OAuth, backup, monitoring, vulnerability reporting).
5. **`frontend/src/main.tsx`**:
   Register routes:
   - `/terms` → `<TermsPage />`
   - `/privacy` → `<PrivacyPage />`
   - `/security` → `<SecurityPage />`
   - Permanent redirects: `/syarat` → `/terms`, `/privasi` → `/privacy`, `/keamanan` → `/security`.
6. **`frontend/src/pages/v2/LandingV2.tsx` & `LandingV3.tsx`**:
   Update footer navigation links to point to `/terms`, `/privacy`, and `/security`.

### Feature Flag Strategy
- Flag name: N/A (Standard public web page; direct deployment to production).

---

## 8. Hypotheses & Assumptions

| # | Hypothesis | Validation Method | Status |
|---|---|---|---|
| H1 | We believe adding transparent legal and security pages will decrease user drop-off before intake because first-time buyers require institutional trust. | Track intake completion rate before and after legal page deployment. | Unvalidated |
| H2 | We believe presenting security in a visual card format (Memverr style) will drive higher engagement than plain legal walls of text. | Measure scroll depth and time on `/security` vs `/terms`. | Unvalidated |
| H3 | We believe explicitly stating "100% Independen, Tanpa Komisi Broker/Developer" in the Terms will reinforce Rumper's primary value proposition. | Qualitative user feedback during onboarding. | Partially Validated |

**Key assumptions that could invalidate this plan:**
- **Regulatory updates under UU PDP.** Implementing regulations (Peraturan Pemerintah turunan UU PDP) could mandate specific consent checkboxes on sign-up. **Mitigation:** Draft terms to be modular so specific consent language can be updated in one place.
- **Third-party API terms change.** If Google Routes or InaRISK change data redistribution terms, Rumper's disclaimer must protect against API downtime. **Mitigation:** Include explicit third-party data reliance disclaimer in Section 1 of `/terms`.

---

## 9. Success Metrics

### Primary KPI
- **Metric:** Legal page availability & 404 eradication.
- **Baseline:** 100% 404 error rate on `/terms` and `/privacy` links from footer.
- **Target:** 0% 404 errors, 100% successful route resolution.
- **Timeline:** Immediately upon PR deployment.

### Secondary KPIs
- **Landing page conversion rate (Visitor to Start Search):** Target > 30% (PRD Landing Page G1).
- **Average scroll depth on `/security`:** Target > 65%.

### Guardrail Metrics
- Page load time (LCP) on legal pages must remain < 1.2s.
- Zero layout shift (CLS < 0.05) on dark/light theme toggle.

### Release Criteria
- [ ] All 3 pages (`/terms`, `/privacy`, `/security`) render with zero console errors.
- [ ] Mobile responsive check passes at 375px, 768px, and 1280px widths.
- [ ] WhatsApp and mailto links open correctly.
- [ ] Localized aliases (`/syarat`, `/privasi`, `/keamanan`) redirect without broken states.

---

## 10. Risk Assessment (SVPG Framework)

| Risk Type | Level | Description | Mitigation |
|---|---|---|---|
| **Value** | Low | High necessity; legal and security pages are standard table-stakes for credible SaaS. | Adopt verified patterns from Grupy & Memverr. |
| **Usability** | Low | Long-form reading fatigue. | Implement sticky Table of Contents (TOC) and clear typography hierarchy. |
| **Feasibility** | Low | Pure frontend React implementation with zero backend/database dependency. | Reuse existing design system and CSS variables. |
| **Viability** | Medium | Potential legal exposure if users mistake advisory scores for legal land warranties. | Prominently feature explicit disclaimers: Rumper is an analytical risk advisor, not a notary or structural engineer. |

---

## 11. Dependencies & Risks

### Cross-Team Dependencies
- [ ] Legal Counsel Review — Final sign-off on Indonesian jurisdiction clauses before major funding/launch.
- [ ] Marketing / Brand Lead — Confirmation of official support emails (`halo@rumper.id`, `privasi@rumper.id`).

### Third-Party Dependencies
- [ ] Lucide React — UI icons for security pillars (already installed in `frontend/package.json`).
- [ ] React Router DOM — Client-side navigation (already installed and active).

---

## 12. Implementation Approach

### PR Breakdown Strategy

| # | PR Scope | Estimated Size | Dependencies | Labels |
|---|---|---|---|---|
| 1 | **Legal Layout & Component Shell**: Create `LegalLayout.tsx`, header/footer breadcrumb, and TOC component. | ~180 lines | None | `frontend`, `ui` |
| 2 | **Content Pages Implementation**: Draft and implement `TermsPage.tsx`, `PrivacyPage.tsx`, and `SecurityPage.tsx` with full Indonesian copy. | ~450 lines | PR 1 | `frontend`, `content` |
| 3 | **Routing & Landing Page Integration**: Register routes in `main.tsx`, configure aliases (`/syarat`, etc.), and wire footer links in `LandingV2.tsx` and `LandingV3.tsx`. | ~70 lines | PR 2 | `frontend`, `router` |

**Total estimated size:** ~700 lines across 3 PRs.

### Testing Plan
- **Unit / Component tests:** Verify that `LegalLayout`, `TermsPage`, `PrivacyPage`, and `SecurityPage` mount and unmount cleanly.
- **Routing tests:** Ensure navigating to `/syarat` and `/privasi` replaces URL to `/terms` and `/privacy`.
- **Responsive verification:** Inspect card wrapping on `/security` on small mobile viewports.

### Rollout Plan
1. **Development & Verification:** Verify all pages in local Vite environment (`npm run dev`).
2. **Review & Visual Audit:** Review typography, contrast ratios, and dark mode compatibility.
3. **Production Deployment:** Merge into main branch and deploy with frontend bundle.

### Rollback Criteria
- Critical layout breaks or route conflicts with `/app/*` paths.
- Rollback procedure: Revert routing commit in `main.tsx`.

---

## 13. Stakeholder Sign-Off

| Role | Name | Status |
|---|---|---|
| PM | [TODO — Product Manager] | [ ] Approved |
| Eng Lead | [TODO — Engineering Lead] | [ ] Approved |
| Legal / Compliance | [TODO — Legal Specialist] | [ ] Approved |

---

## Appendix

### Change Log
| Date | Version | Changes |
|---|---|---|
| 2026-10-04 | 1.0 | Initial comprehensive PRD created based on Grupy & Memverr benchmarks and Rumper product context. |

### FAQ

- **Q: Mengapa URL menggunakan bahasa Inggris (`/terms`, `/privacy`, `/security`) sementara kontennya berbahasa Indonesia?**
  - **A:** Sesuai konvensi rute arsitektur Rumper (`docs/09-frontend.md`), seluruh path URL menggunakan bahasa Inggris baku untuk konsistensi routing, sementara on-screen copy sepenuhnya menggunakan Bahasa Indonesia. Untuk kemudahan pengguna lokal, alias `/syarat`, `/privasi`, dan `/keamanan` otomatis dialihkan (*redirect*).
- **Q: Apakah Rumper membutuhkan persetujuan cookie terpisah?**
  - **A:** Pada fase saat ini, Rumper hanya menggunakan cookie sesi esensial untuk autentikasi. Ketentuan ini dijelaskan di Kebijakan Privasi Bagian 6 (Cookies & Penyimpanan Lokal). Banner interaktif akan ditambahkan saat analytics pihak ketiga diaktifkan.
- **Q: Apa perbedaan mendasar antara halaman `/privacy` dan `/security`?**
  - **A:** `/privacy` berfokus pada hak hukum subjek data, jenis data yang dikumpulkan, dan kepatuhan terhadap UU PDP. `/security` berfokus pada arsitektur teknis perlindungan data (enkripsi, cloud hosting, backup, dan pelaporan kerentanan) untuk membangun kepercayaan teknis pengguna.

### Research & References
- **UU RI No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**.
- **Grupy.chat Syarat Layanan & Kebijakan Privasi** (`https://grupy.chat/syarat`, `https://grupy.chat/privasi`).
- **Memverr Security & Legal Pages** (`https://www.memverr.com/security`, `https://www.memverr.com/privacy-policy`, `https://www.memverr.com/terms-of-service`).
- **Rumper Master PRD & Landing Page Architecture** (`prd-rumper-landing-page.md`, `docs/09-frontend.md`).
