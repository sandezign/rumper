# Rumper Design System

This directory is the source of truth for Rumper's MongoDB-inspired interface
system. It guides Figma Make, coding AI tools, designers, and developers
building marketing, intake, dashboard, map, evidence, and report experiences.

Rumper adapts a deep-teal, bright-green, white, and pale-green visual language
for a buyer-first property decision-support product. It does not copy MongoDB
product concepts, trademarks, copy, or proprietary assets.

## Product character

Rumper is:

- buyer-first;
- calm and evidence-led;
- structured and actionable;
- professional without being intimidating;
- transparent about uncertainty and limitations.

Protect, do not frighten. Never guarantee that a property is safe, suitable,
risk-free, or verified.

## Visual direction

- Use white and soft surfaces for reading, evidence, forms, tables, and
  reports.
- Use pale-green surfaces for non-semantic feature emphasis.
- Use deep-teal surfaces for heroes, major calls to action, footer regions, and
  important framing.
- Use bright brand green sparingly for primary actions and small brand accents.
- Use DM Sans for display, body, labels, and controls.
- Use compact radii, flat bordered cards, and restrained elevation.
- Use the canonical three-region evidence workspace for wide-desktop location
  analysis: assistant rail, verified analysis workspace, and map workspace.

Bright brand green is an action and identity color. It must never communicate
safe, verified, approved, positive evidence, or low risk. Use the distinct
semantic-positive tokens only for verified supporting evidence.

## Required reading order

Before writing code or generating a design:

1. Read [`guidelines.md`](guidelines.md) for product character, workflows, and
   mandatory rules.
2. Read [`foundations/setup.md`](foundations/setup.md) for React, Vite,
   Tailwind CSS v4, shadcn/ui, packages, providers, and build configuration.
3. Read [`foundations/styles.md`](foundations/styles.md) for visual patterns,
   layout, typography, spacing, surfaces, and responsive behavior.
4. Read [`foundations/tokens.md`](foundations/tokens.md) for exact token names,
   values, Tailwind mappings, and component-token contracts.
5. Read [`foundations/icon-discovery.md`](foundations/icon-discovery.md) before
   selecting or importing icons.
6. Read [`guidelines/components.md`](guidelines/components.md) before
   discovering, selecting, or using a component.
7. Read [`guidelines/patterns/overview.md`](guidelines/patterns/overview.md)
   before implementing a recurring multi-component task or workflow.
8. Read [`guidelines/composition/overview.md`](guidelines/composition/overview.md)
   before composing a page or multi-component experience.
9. Read [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) before distributing interfaces,
   reports, exported assets, or applications.

Read the specific component, pattern, and composition files required by the
task before implementation.

## Information ownership

Each rule has one authoritative home:

| Rule type | Authority |
|---|---|
| System direction and reading order | This file |
| AI workflows and mandatory product rules | [`guidelines.md`](guidelines.md) |
| Application and package setup | [`foundations/setup.md`](foundations/setup.md) |
| Visual style selection | [`foundations/styles.md`](foundations/styles.md) |
| Exact token definitions and mappings | [`foundations/tokens.md`](foundations/tokens.md) |
| Icon selection and verification | [`foundations/icon-discovery.md`](foundations/icon-discovery.md) |
| Attribution and adaptation boundaries | [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) |
| Component discovery and source-of-truth rules | [`guidelines/components.md`](guidelines/components.md) |
| Component selection | [`guidelines/components/overview.md`](guidelines/components/overview.md) |
| Component behavior and states | Specific file under `guidelines/components/` |
| Recurring multi-component task or workflow | Specific file under `guidelines/patterns/` |
| Page-level layout, spatial structure, and hierarchy | Specific file under `guidelines/composition/` |

When guidance conflicts, follow this priority:

1. User safety, accessibility, and truthful evidence communication.
2. Explicit requirements in the current task.
3. This master design-system direction.
4. The authoritative granular guideline for the relevant rule.
5. Existing interface patterns.

Do not silently invent tokens, component variants, or composition patterns.
Document necessary exceptions and keep them local.

## Foundation catalog

| Foundation | Purpose |
|---|---|
| [`overview.md`](foundations/overview.md) | Foundation reading router and ownership |
| [`setup.md`](foundations/setup.md) | Packages, shadcn/ui ownership, CSS order, providers, Vite, and TypeScript |
| [`styles.md`](foundations/styles.md) | AI-facing visual patterns and style decisions |
| [`tokens.md`](foundations/tokens.md) | Technical primitive, semantic, and component tokens |
| [`icon-discovery.md`](foundations/icon-discovery.md) | Verified Lucide icon selection and imports |

## Component catalog

Start with
[`guidelines/components.md`](guidelines/components.md), then
[`guidelines/components/overview.md`](guidelines/components/overview.md), and
finally the relevant category:

| Category | Guideline |
|---|---|
| Buttons and actions | [`buttons.md`](guidelines/components/buttons.md) |
| Icons | [`icons.md`](guidelines/components/icons.md) |
| Navigation | [`navigation.md`](guidelines/components/navigation.md) |
| Tabs and segmented controls | [`tabs.md`](guidelines/components/tabs.md) |
| Forms and inputs | [`forms.md`](guidelines/components/forms.md) |
| Cards and surfaces | [`cards.md`](guidelines/components/cards.md) |
| Badges and status labels | [`badges.md`](guidelines/components/badges.md) |
| Tables and structured data | [`tables.md`](guidelines/components/tables.md) |
| Feedback, overlays, and disclosure | [`feedback-states.md`](guidelines/components/feedback-states.md) |
| Maps and location | [`maps.md`](guidelines/components/maps.md) |
| Evidence | [`evidence.md`](guidelines/components/evidence.md) |
| Reports and findings | [`reports.md`](guidelines/components/reports.md) |

shadcn/ui is a CLI and source-distribution workflow, not a runtime component
package. Generated components are application-owned under
`src/components/ui/`. Rumper-specific evidence, map, report, and risk
compositions live outside `ui/`, grouped by feature.

## Pattern catalog

Start with
[`guidelines/patterns/overview.md`](guidelines/patterns/overview.md), then read
the recurring task pattern being implemented:

| User task | Guideline |
|---|---|
| Enter and validate a property location | [`location-intake.md`](guidelines/patterns/location-intake.md) |
| Ask questions and follow AI-assisted analysis | [`assistant-conversation.md`](guidelines/patterns/assistant-conversation.md) |
| Understand the overall analysis result | [`analysis-summary.md`](guidelines/patterns/analysis-summary.md) |
| Understand and act on one risk | [`risk-finding.md`](guidelines/patterns/risk-finding.md) |
| Explore spatial evidence on a map | [`map-evidence-exploration.md`](guidelines/patterns/map-evidence-exploration.md) |
| Track buyer verification work | [`buyer-verification-checklist.md`](guidelines/patterns/buyer-verification-checklist.md) |
| Review a decision-oriented report summary | [`report-decision-summary.md`](guidelines/patterns/report-decision-summary.md) |

## Composition catalog

Start with
[`guidelines/composition/overview.md`](guidelines/composition/overview.md),
then read the relevant page-level composition guideline:

| Category | Guideline |
|---|---|
| Canonical app shell, grids, and region proportions | [`layout.md`](guidelines/composition/layout.md) |
| Information, evidence, score, and action priority | [`hierarchy.md`](guidelines/composition/hierarchy.md) |
| Surface layering and elevation | [`surfaces.md`](guidelines/composition/surfaces.md) |
| Icon placement and icon-text relationships | [`icons.md`](guidelines/composition/icons.md) |
| Mobile, tablet, and desktop transformations | [`responsive.md`](guidelines/composition/responsive.md) |
| Keyboard, focus, contrast, and assistive technology | [`accessibility.md`](guidelines/composition/accessibility.md) |
| AI, evidence, confidence, limitations, and decision safety | [`content-safety.md`](guidelines/composition/content-safety.md) |

## Canonical application layout

Wide-desktop location analysis uses:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Global header: brand, expert review, and share/report action         │
├───────────────┬───────────────────────┬──────────────────────────────┤
│ Assistant rail│ Verified analysis     │ Map and spatial evidence     │
│ 18-22%        │ 26-32%                │ Remaining width, minimum 45% │
└───────────────┴───────────────────────┴──────────────────────────────┘
```

The assistant is supportive and must not replace verified analysis. On smaller
screens, transform regions according to task priority rather than compressing
all three columns.

## Token architecture

Use three layers:

```text
Primitive values -> Semantic purpose -> Component tokens
```

Use semantic or component tokens in interface code. Never use raw hex,
arbitrary spacing, arbitrary radii, or arbitrary shadows when a token exists.

Examples:

```css
/* Primitive */
--rumper-green-400: #00ed64;

/* Semantic */
--primary: var(--rumper-green-400);

/* Component */
--button-primary-bg: var(--primary);
```

## Mandatory decision-safety rules

- Every significant finding separates evidence, interpretation, confidence,
  limitations, and recommended next action.
- Preliminary, incomplete, inferred, AI-generated, reviewed, and verified
  information is visibly labeled.
- Scores remain subordinate to findings and evidence.
- Bright brand green is not used for score rings or positive evidence.
- Maps include legends, text summaries, source precision, and limitations.
- AI activity logs and summaries are clearly labeled and never presented as
  proof.
- Safety-critical limitations remain visible and are never hidden behind
  payment, hover, tabs, accordions, or progressive disclosure.
- Public examples use fictional or anonymized property, customer, and evidence
  data.

## Accessibility requirements

- Meet WCAG AA contrast.
- Keep controls keyboard operable.
- Keep touch targets at least 44x44px.
- Provide visible high-contrast focus states.
- Pair semantic colors and map symbols with visible text and icons.
- Provide text alternatives for maps, charts, scores, and report visuals.
- Preserve logical reading order after responsive reflow.
- Respect reduced-motion preferences.

## Implementation stack

Rumper applications use:

- React and TypeScript;
- Vite;
- Tailwind CSS v4 with `@tailwindcss/vite`;
- shadcn/ui components copied into application source;
- Radix UI behavior preserved by generated components;
- Lucide icons through `lucide-react`;
- CSS variables and `@theme inline`;
- application-owned light, dark, and system theme support.

## Known gaps

The following documentation remains to be created:

- automated broken-link and token-usage validation;
- production token CSS or JSON artifacts;
- implemented application component library.

Do not infer that a missing implementation or guideline already exists.

## Master rules

- Read the relevant guideline before generating or implementing UI.
- Prefer approved components, patterns, and compositions over one-off solutions.
- Use DM Sans and approved tokens.
- Keep interfaces mostly neutral and use saturated colors sparingly.
- Use flat bordered cards by default and reserve shadows for raised layers.
- Use one primary action per decision point.
- Keep assistant output subordinate to verified evidence.
- Never guarantee property safety or suitability.
- Document exceptions and unresolved evidence explicitly.
