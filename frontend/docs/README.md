# Frontend implementation docs (rebuild-grade)

Implementation-level docs for the Vite + React SPA. Together with the root specs
(docs/09 design language + routes, docs/12 chat/assistant rail, docs/13 auth/quota,
docs/14 map workspace, docs/16 shell + analysis, docs/17 marketing/onboarding,
docs/05 API contract) they are sufficient to rebuild `frontend/src/` from scratch.

The UI **design system** (tokens, components, patterns, composition) is vendored in
[`design/`](design/README.md) and is the source of truth for visuals.

| Doc | Covers | Source files |
|---|---|---|
| [01-routing-and-workspace.md](01-routing-and-workspace.md) | Routes, Workspace state & flows (login gate, SSE, research watch), V3 cross-panel sync | `src/main.tsx`, `src/components/Workspace.tsx`, `AppShellV3.tsx` |
| [02-api-client.md](02-api-client.md) | Typed API client, SSE parsing, error model | `src/lib/api.ts` |
| [03-components.md](03-components.md) | V3 workspace (shell, analysis panels, MapPanelV3, evidence index), previous shell, Landing/Login/Register, ui/* primitives, Intake/Check | `src/components/*`, `src/features/analysis/*`, `src/pages/*` |
| [design/](design/README.md) | Vendored design system: tokens, components, patterns, composition | `src/index.css`, `src/components/ui/*` |

## 1. Stack

React 19 + TypeScript ~5.8, Vite 6, Tailwind CSS v4 (via `@tailwindcss/vite` — no
tailwind.config; tokens live in CSS as three-layer variables exposed through
`@theme inline`), `react-router-dom` 7, `@vis.gl/react-google-maps` 1.8. UI foundation
(hybrid shadcn): `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`,
`tw-animate-css`, and a focused Radix set (`react-dialog`, `react-tabs`,
`react-dropdown-menu`, `react-tooltip`, `react-slot`). shadcn-style primitives are
application-owned under `src/components/ui/`; the `@` alias points at `src/`. No state or
data-fetching library — plain hooks + the typed client in `lib/api.ts`.

Scripts: `dev` = `vite --port 3000` · `build` = `tsc -b && vite build` ·
`preview` = `vite preview`.

## 2. Layout

```
frontend/
├── index.html                 # mounts #root, loads DM Sans
├── components.json            # shadcn config (new-york, css vars, lucide, @ aliases)
├── vite.config.ts             # react + tailwind plugins; @ alias; dev proxy /api → :8000;
│                              # build.outDir = ../backend/static (emptyOutDir)
└── src/
    ├── main.tsx               # BrowserRouter + routes (docs/09 route map)
    ├── index.css              # three-layer tokens + @theme inline + type utils (§4)
    ├── lib/{api.ts,utils.ts}  # the ONLY fetch layer (doc 02) + cn() helper
    ├── components/
    │   ├── ui/                # shadcn-style primitives (button, badge, tabs, dialog, …)
    │   ├── analysis/          # Mini Check region (docs/16): ScoreCard, FindingCard, …
    │   ├── theme-provider.tsx # light/dark/system
    │   ├── AppShellV3.tsx     # 72px header + analysis·assistant·map row (docs/16) — LIVE
    │   ├── MapPanelV3.tsx     # V3 map workspace, Google Maps (docs/14) — LIVE
    │   ├── Workspace.tsx      # cross-cutting state container (doc 01)
    │   ├── AppShell/AssistantRail/MapPanel.tsx  # previous shell (ops /check/:id, /dev/*)
    │   └── Landing/Login/Register/ResearchLoading.tsx  # docs/17
    ├── lib/entitlements.ts    # plan + pass catalogue, the one place the paywall decides
    ├── features/analysis/     # V3 analysis panels + evidence.ts index (doc 03 §0b, §7)
    ├── features/commerce/     # upgrade drawer, checkout, zero-quota modal (doc 03 §5b)
    ├── features/export/       # due-diligence PDF brief (doc 03 §5b)
    └── pages/                 # Intake (ops form), Check (ops report view)
```

Conventions: all copy is Bahasa Indonesia; all server IO goes through `lib/api.ts`
(components never call `fetch` directly); requests are same-origin `/api/*` with
cookies (`credentials: "include"`) — dev relies on the Vite proxy, prod on the
backend serving the bundle (ADR-009).

## 3. Build-time environment (`import.meta.env`)

| var | used by | purpose |
|---|---|---|
| `VITE_GOOGLE_MAPS_KEY` | `MapPanelV3`, `MapPanel` | Maps JS API + static Street View thumbnails (browser key, referrer-restricted) |
| `VITE_GOOGLE_CLIENT_ID` | `GoogleSignInButton` (`AuthModal`, `LoginModal`, `AuthPage`) | Google Identity Services client id; must match backend `google_oauth_client_id` |

Both are public identifiers, not secrets; set them in `frontend/.env.local`
(gitignored) for dev and in the build environment for prod.

## 4. Design tokens & custom classes (`src/index.css`)

Tokens follow the vendored system ([`design/foundations/tokens.md`](design/foundations/tokens.md)),
implemented as three layers — primitive (`--rumper-*`) → semantic (`--brand-*`, `--surface-*`,
`--text-*`, `--border-*`, `--semantic-*`, spacing/radius/elevation) → shadcn aliases
(`--background`, `--primary`, …) — and exposed to utilities via `@theme inline`. Font: **DM Sans**
(`--font-sans`). Brand-green `#00ed64` is action/identity only — never score rings or
positive/safe states. Composite type utilities (`text-heading-1..5`, `text-body*`,
`text-caption*`, `text-micro-uppercase`, `text-button`, `text-code`) are defined in the same file.

Custom classes (used by the map + chat):
- `.map-emoji` — 28 px white circle marker; `.danger` variant red border/bg;
  `.critical` variant 36 px, strong red, `pulse-ring` animation;
- `.map-pin` — 36 px navy circle (the candidate-house pin), `pulse-ring`;
- `.dots` — three bouncing dots (thinking indicator), staggered `bounce-dot`;
- `.fade-up` — 0.25 s enter animation for messages/cards.

Band/score/confidence → semantic presentation lives in `src/lib/risk.ts` (shared by the
analysis region and the map), using the semantic token palette — **never brand-green**: band
`relatif_kuat`→positive · `layak_dengan_catatan`→teal/neutral · `hati_hati`→warning ·
`risiko_tinggi`→danger; `scoreHex()` for category mini-bars; confidence
`data_kuat`→neutral · `data_sedang`→outline · `perlu_validasi`→warning.
