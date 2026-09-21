# 09 — Frontend: design language + routes (overview)

Vite + React + TypeScript + Tailwind v4 static SPA (ADR-009). Mobile-first. All copy
Bahasa Indonesia. Talks only to `docs/05` endpoints via `src/lib/api.ts` — same-origin
`/api` (dev: Vite proxy → :8000; prod: served by FastAPI). Build output → `backend/static/`.

The product surface is the **three-region workspace** (assistant rail · analysis · map),
spec'd in [`docs/16`](16-workspace-shell-and-analysis.md); the marketing + onboarding flow
is in [`docs/17`](17-marketing-and-onboarding.md). The chat-first behaviour stays in
[`docs/12`](12-chat-workspace.md); the map stays in [`docs/14`](14-map-delivery.md). This
file owns the **design language** and the **route map**.

## Design language (MongoDB-inspired system — `frontend/docs/design/`)

The in-repo design system (`frontend/docs/design/`, vendored from the UX team) is the source
of truth. Implemented as three-layer tokens (primitive → semantic → component) in
`frontend/src/index.css` via Tailwind v4 `@theme inline`.

- **Type:** DM Sans for all display/body/labels/controls; system monospace only for evidence
  IDs/timestamps. Composite type classes (`text-heading-1..5`, `text-body*`, `text-caption*`,
  `text-micro-uppercase`, `text-button`, `text-code`).
- **Color:** white/soft canvas surfaces for reading & evidence; pale-green `#e3fcef` for
  non-semantic feature emphasis; deep-teal `#001e2b` for heroes/major CTAs/footer; bright
  brand-green `#00ed64` **for primary actions and brand accents only**. Semantic states —
  positive / warning / danger / unknown — each pair color with visible text + icon.
- **Hard rule:** brand-green is action/identity, **never** "safe / verified / positive /
  low-risk". Score rings are never brand-green. Critical limitations are never hidden behind
  tabs/hover/accordions/payment.
- **Shape/elevation:** compact radii (inputs 8px, cards 12px, feature panels 16px, buttons &
  pills full); flat bordered cards by default, shadows reserved for raised/temporary layers.
- **Map / Proof Engine UI:**
  - **Map Tabs:** Active state uses a brand-green border, bold text, and solid icon. Inactive state uses a gray border/text with no background.
  - **Evidence Markers:** Marker/polygon opacity and stroke reflect `confidence_level`. `data_kuat` = solid/high-contrast, `perlu_validasi` = dashed stroke/translucent fill.
  - **Empty States:** When a map tab layer has an evidence gap (no data), a translucent text overlay appears on the map canvas.
- 44px touch targets, WCAG AA contrast, visible focus rings, reduced-motion respected.

The old warm-cream `#FAF7F2` / navy `#16243D` / Plus Jakarta Sans language is **superseded**
by the above (see `frontend/docs/design/README.md` for source reconciliation).

## Route convention — English URLs, Bahasa Indonesia copy

**URL path segments are English; everything the user reads is Bahasa Indonesia.** The two are
deliberately decoupled: the URL is an engineering identifier (shared with the API surface,
analytics, logs, deep links and docs), while copy is product surface. Mixing the two produced
`/masuk` next to `/app/c/:threadId`, which is neither consistent nor translatable.

Rules:

1. Path segments are lowercase English, hyphenated when multi-word (`/app/area-detail`, not
   `/app/detail_area` or `/app/detail-area-nya`).
2. Route names never change when copy changes. "Setup Gravitasi" → "Prioritas Saya" is a copy
   change; the route stays `/app/profile`.
3. A renamed route keeps a **permanent redirect** from its old path so shared links and
   WhatsApp-delivered URLs survive. Legacy id-ID paths are redirects, not aliases — they are
   never linked to from within the app.
4. Path params are stable identifiers (`:id`, `:threadId`), never human-readable slugs.

## Routes (`src/main.tsx`)

| path | element | purpose |
|---|---|---|
| `/` | `Landing` | public marketing brief (docs/17) |
| `/login` · `/register` | `AuthPage` | Google sign-in (+ future-proof fields) (docs/13, 17) |
| `/app` | `AppEntry` | journey router: no confirmed profile → `/app/start`, else → `/app/areas` |
| `/app/start` | `OnboardingWizard` | **revamped 9-screen priority wizard** (5 narrative stages + 4 parameter steps), produces the Buyer Priority Profile (docs/18 Wave 1, PRD-11) |
| `/app/areas` | `AreasHub` | synthesis loader → corridor hub (Peta Interaktif · Daftar Area) on real `GET /api/areas`; "Evaluasi" runs the research pipeline in-journey → `/app/c/:id` |
| `/app/location` | `LocationHome` | property address entry, Places autocomplete (docs/17 §3) |
| `/app/intake` | `Onboarding` | remaining intake fields → `POST /api/conversations/from-intake` (docs/17 §4) |
| `/app/account` | `Account` | profile, token usage detail, logout (docs/16 §1) |
| `/app/c/:threadId` | `LocationWorkspace` | 5-step location workspace on the revamped UI, rendering the real Mini Check (docs/18 Wave 1) |
| `/form` | `Intake` | operations fallback: classic form (below) |
| `/check/:id` | `Check` | operations report view, polled by intake id (below) |

The post-login shell (`features/areas/components/JourneyHeader.tsx`) carries a **location
switcher**: every analysed corridor, the current one checked, and "+ Evaluasi lokasi lain"
back to the hub. It is the one place to move between `/app/c/:threadId` audits.

**Legacy redirects** (permanent, `<Navigate replace>`): `/masuk` → `/login` ·
`/daftar` → `/register` · `/app/mulai` → `/app/start` · `/app/akun` → `/app/account` ·
`/cek/:id` → `/check/:id`.

Journey order is **wizard → areas → (address step) → workspace**. Evaluating a corridor no
longer leaves for `/app/location`: `EvaluatePropertyModal` asks only for the address the
draft is missing, submits `POST /api/conversations/from-intake`, and lands on the workspace.
`/app/location` and `/app/intake` remain as the standalone entry for a buyer who already
knows the address: the buyer picks a
corridor before being asked for any address. `/app/areas/:areaId` (deep link to one corridor)
and `/app/locations/:intakeId` (5-step workspace, replacing `/app/c/:threadId`) are reserved
for when their specs land.

## Operations fallback — route `/form` (intake form)

Single page, sectioned (prototype simplification of the multi-step PRD; one section
per screen is a fast-follow). Sections:

1. **Lokasi** — `property_name`, `address_text` (required), `maps_link` (optional)
2. **Konteks** — `purpose`, `buying_stage`, `dp_timeline` (selects)
3. **Rutinitas** — `workplace_text` (required), `transport_mode` (radio)
4. **Kekhawatiran** — `concerns` (checkbox: banjir/commute/akses/fasilitas/lingkungan)
   + `concern_notes`
5. **Kontak & consent** — `full_name`, `whatsapp`, two consent checkboxes (required)

Submit → `POST /api/intakes` → redirect `/check/{intake_id}`. Inline validation,
disabled submit until consents checked. Hero copy: "Rumahnya bagus. Risikonya sudah
dicek?" + CTA `Cek Risiko Lokasi Rumah Saya`.

## Operations fallback — route `/check/:id` (Mini Check result)

The same Mini Check rendered in the workspace analysis region (docs/16); this route is the
ops/standalone view, restyled to the token system and reusing `src/components/analysis/*`.

Polls `GET /api/checks/{id}` every 4 s while `pending/running`; progress state shows
which categories are done ("Menganalisis 5 kategori risiko…").

When `done`, render in order:

1. **Red-flag panel** (only if critical red flags) — above everything (override rule)
2. **Score card** — RLS number, band label, recommendation label (visually distinct:
   score ≠ recommendation), "Mini Check awal — belum ditinjau analis" badge
3. **Ringkasan** — composed summary
4. **Category cards** ×5 — weight, score (or "Data belum cukup"), confidence badge,
   findings as evidence cards (claim, source links, limitation, validation action)
5. **Evidence gaps** list
6. **Checklist survei lapangan** — checkbox list (visual only)
7. **Disclaimer** panel + WhatsApp continuation CTA (`wa.me` link placeholder)

`failed` → error message + link back to form. **ConfidenceBadge** maps evidence strength
(not location safety, never brand-green): `data_kuat` → neutral/strong (Data kuat) ·
`data_sedang` → warning outline (Data sedang) · `perlu_validasi` → warning solid
(Perlu validasi). Each badge carries an icon + text.
