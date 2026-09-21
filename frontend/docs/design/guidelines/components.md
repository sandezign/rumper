# Component Guidelines

This file is the AI-tool entry point for discovering and using Rumper
components. It explains where component APIs come from and routes tools to the
appropriate granular guideline.

Do not treat this file as a substitute for reading component source,
properties, or the relevant category guideline.

## Source of truth

Use this priority when component guidance conflicts:

1. Exported component source and TypeScript properties define what currently
   exists and which APIs are valid.
2. Specific component documentation defines approved usage, restrictions, and
   product behavior.
3. [`components/overview.md`](components/overview.md) defines the component
   catalog, alternative names, and shared component rules.
4. Component-category guidelines define behavior shared by a component family.
5. Pattern guidelines define how multiple components solve a recurring task.
6. Composition guidelines define page-level placement and hierarchy.

Do not invent a component, property, variant, or export because it appears in a
design or guideline. Verify it exists in source before writing implementation
code.

## Component discovery workflow

### Step 1: Check the catalog

Read [`components/overview.md`](components/overview.md) to find the approved
component, alternative names, foundation, and category guideline.

### Step 2: Read the component guideline

Read the linked file under `components/` before using or creating the
component. Follow its usage, anatomy, variants, states, token mappings,
responsive behavior, accessibility, content rules, and anti-patterns.

### Step 3: Verify the implementation

When application source exists:

1. Inspect the application's exported component barrel files, if provided.
2. Inspect the component source and TypeScript properties.
3. Verify every imported component and property exists.
4. Preserve the documented component contract and accessibility behavior.
5. Treat source as the authority for current API availability.

Typical source locations:

```text
src/components/ui/          shadcn/ui primitives owned by the application
src/components/evidence/    evidence-specific composite components
src/components/maps/        map-specific composite components
src/components/reports/     report-specific composite components
src/components/risks/       risk-specific composite components
```

shadcn/ui is a source-distribution workflow, not a runtime component package.
Generated primitives are copied into and owned by the application.

If no component source exists yet, treat APIs shown in guidelines as proposed
contracts rather than implemented exports.

## Component taxonomy

| Layer | Definition | Examples |
|---|---|---|
| Primitive component | Small reusable control with a focused interaction | `Button`, `Input`, `Badge`, `Tabs` |
| Composite component | Reusable contained unit with one responsibility | `EvidenceCard`, `MapLegend`, `RiskCard` |
| Pattern | Several components solving a recurring user task | Risk finding, map evidence exploration |
| Composition | Page-level placement, regions, hierarchy, and responsive arrangement | Three-region evidence workspace |

Use [`patterns/overview.md`](patterns/overview.md) when several components work
together to complete a recurring task. Do not create a large workflow
component merely to avoid documenting a pattern.

## Component category router

| Need | Read |
|---|---|
| Full component catalog and alternative names | [`components/overview.md`](components/overview.md) |
| Buttons and action hierarchy | [`components/buttons.md`](components/buttons.md) |
| Icons inside components | [`components/icons.md`](components/icons.md) |
| Navigation controls | [`components/navigation.md`](components/navigation.md) |
| Tabs and segmented controls | [`components/tabs.md`](components/tabs.md) |
| Forms, inputs, and validation | [`components/forms.md`](components/forms.md) |
| Cards and contained surfaces | [`components/cards.md`](components/cards.md) |
| Badges and compact statuses | [`components/badges.md`](components/badges.md) |
| Tables and structured records | [`components/tables.md`](components/tables.md) |
| Feedback, overlays, and disclosure | [`components/feedback-states.md`](components/feedback-states.md) |
| Maps and location units | [`components/maps.md`](components/maps.md) |
| Evidence units | [`components/evidence.md`](components/evidence.md) |
| Reports and findings | [`components/reports.md`](components/reports.md) |

## Per-component documentation requirements

Create a dedicated component specification when a component:

- is Rumper-specific and reused across multiple pages or patterns;
- has a meaningful API, variants, or state model;
- contains decision-safety or accessibility requirements;
- cannot be fully explained by its category guideline.

Each dedicated component specification must cover:

1. **Usage**: when to use, when not to use, and related components.
2. **Semantic purpose**: the single responsibility the component communicates.
3. **Anatomy**: required and optional visible parts.
4. **Variants and states**: approved visual variants and interaction states.
5. **API**: implemented properties, types, defaults, and constraints.
6. **Accessibility**: keyboard, focus, names, announcements, and alternatives.
7. **Decision safety**: evidence, confidence, limitation, and status rules.
8. **Examples**: correct and incorrect usage.
9. **Related patterns**: recurring workflows that use the component.

Do not create individual specifications for unchanged shadcn/ui primitives
unless Rumper adds restrictions, variants, tokens, or behavior that differs
from the generated source.

## Shared component rules

- Prefer approved components over raw controls or one-off custom UI.
- Verify component exports and properties before implementation.
- Reuse an approved primitive before creating a new low-level component.
- Keep reusable primitives under `src/components/ui/`.
- Keep product-specific composite components outside `ui/`, grouped by feature.
- Use semantic or component tokens; never hardcode visual values when tokens
  exist.
- Define default, hover, focus-visible, active or selected, loading, disabled,
  error, and empty states where relevant.
- Preserve Radix and shadcn/ui accessibility behavior.
- Keep touch targets at least 44x44px.
- Pair semantic colors with visible text and icons.
- Never use bright brand green to mean safe, verified, approved, positive
  evidence, or low risk.
- Never hide safety-critical evidence or limitations in optional interaction.

## Correct usage

```tsx
import { Button } from "@/components/ui/button"
import { EvidenceCard } from "@/components/evidence/evidence-card"

<EvidenceCard
  source={source}
  confidence="medium"
  limitations={limitations}
  action={<Button variant="secondary">Tinjau sumber</Button>}
/>
```

Use this only after verifying that `EvidenceCard` and its properties exist in
the application source.

## Incorrect usage

```tsx
<SafePropertyCard verified scoreColor="#00ed64" />
```

This invents an unverified component and API, hardcodes a color, uses brand
green as a safety signal, and makes an unsupported safety claim.

## Rules

- Read this file before discovering or selecting components.
- Read the relevant granular component guideline before implementation.
- Verify actual component APIs in source.
- Use pattern guidelines for recurring multi-component tasks.
- Use composition guidelines for page-level layout.
- Document proposed APIs explicitly until they are implemented.
