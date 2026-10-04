# Rumper Design System (vendored)

This directory is the in-repo **source of truth** for Rumper's UI design system. It is
vendored from the UX team's `~/dev/Rumper UI/design guideline/` so the prototype is
self-contained and version-controlled with the code (SDD).

Start at [`DESIGN.md`](DESIGN.md), then the required reading order it lists
(`guidelines.md` → `foundations/setup.md` → `foundations/styles.md` →
`foundations/tokens.md` → `foundations/icon-discovery.md` →
`guidelines/components.md` → patterns → composition).

## How this maps to the implementation

- Tokens (`foundations/tokens.md`) are implemented in `frontend/src/index.css`
  (three layers: primitive → semantic → component, exposed via `@theme inline`).
- shadcn-style primitives live in `frontend/src/components/ui/` (Button, Badge, Tabs,
  Dialog, DropdownMenu, Tooltip, Card, Input, Textarea, Label) — hybrid adoption
  (tokens + DM Sans + lucide-react + a focused Radix set; the chat rail and Google-Maps
  panel stay custom).
- The canonical three-region workspace (assistant rail · analysis · map) is specified in
  `docs/16-workspace-shell-and-analysis.md` and built in `src/components/AppShell.tsx` +
  `Workspace.tsx`.

## Source reconciliation (read before changing visuals)

The UX team also produced realized HTML mockups in
`~/dev/Rumper UI/apps/website/campaign-concepts/`. Findings:

- **`dashboard.html`** (the app) uses tokens that agree with this guideline: deep-teal
  `#001e2b`/`#062832`, bright-green `#00ed64`/`#00e676`, white/near-white surfaces, DM Sans,
  340px assistant rail, ~`min(432px,30vw)` map. It is the canonical **composition**
  reference for the workspace.
- **`shared.css`** (marketing) still carries an older warm-editorial look — paper `#f7f5ef`,
  **Fraunces** serif, lime `#c8f765`. This is **deprecated for the app**. `ui-components.css`
  already overrode the lime with bright-green `#00ed64`.

Decision (per the approved refactor plan): **the app uses this token system**
(`foundations/tokens.md`). The marketing landing page reconciles to the same tokens
(deep-teal hero + bright-green CTA + white sections). Fraunces, if used at all, is an
explicitly documented **marketing-surface-only** display exception — never in the app.

Mandatory product rules carry over unchanged: brand-green is action/identity only (never
"safe/positive/verified"); every finding separates evidence · interpretation · confidence ·
limitations · next action; critical limitations stay visible; Bahasa Indonesia, calm tone.
