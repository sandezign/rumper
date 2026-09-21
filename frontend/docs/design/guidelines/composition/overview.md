# Composition Guidelines Overview

Composition guidelines define page-level spatial structure: shells, regions,
proportions, hierarchy, surfaces, and responsive rearrangement.

Composition does not define recurring task behavior. Read
[`../patterns/overview.md`](../patterns/overview.md) when multiple components
combine to solve a repeatable user workflow.

## Canonical application layout

The main desktop experience uses a **three-region evidence workspace**:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Global header: brand, review action, share/report action             │
├───────────────┬───────────────────────┬──────────────────────────────┤
│ Assistant rail│ Analysis workspace    │ Map and spatial evidence     │
│ 18-22%        │ 26-32%                │ Remaining width, minimum 45% │
│               │ tabs + findings       │ legend + layers + popovers   │
└───────────────┴───────────────────────┴──────────────────────────────┘
```

This is the default desktop layout for location analysis. It is a reusable
system, not a requirement to reproduce the reference screenshot literally.

## Composition catalog

| Need | Read |
|---|---|
| Page shell, columns, grids, and app layouts | `layout.md` |
| Information and action priority | `hierarchy.md` |
| White, soft, pale-green, and deep-teal layering | `surfaces.md` |
| Icon placement and icon-text relationships | `icons.md` |
| Mobile, tablet, and desktop transformations | `responsive.md` |
| Keyboard, focus, contrast, and assistive technology | `accessibility.md` |
| Evidence, confidence, limitations, AI, and decision safety | `content-safety.md` |

## Reading order

Before composing a page:

1. Read `../../guidelines.md`.
2. Read `../../foundations/styles.md`.
3. Read `../../foundations/tokens.md`.
4. Read this file and `layout.md`.
5. Read the relevant pattern and component guidelines.
6. Read `content-safety.md` for every evidence, map, score, or report surface.

## Shared composition rules

- Build mobile-first, then apply the canonical desktop workspace where useful.
- Keep evidence, interpretation, confidence, limitations, and actions distinct.
- Use one dominant action per section or decision point.
- Make the map dominant only when spatial evidence materially helps.
- Keep the assistant supportive; it must not replace verified evidence.
- Use bright brand green for actions, not scores or positive evidence.
- Preserve logical reading order when regions rearrange.
- Never hide safety-critical limitations in optional disclosure.
- Use white reading surfaces, flat bordered cards, and restrained elevation.

## Common layouts and templates

| Layout or template | Composition |
|---|---|
| Location-analysis workspace | Header + assistant rail + analysis workspace + map |
| Report view | Header + readable report column + optional evidence index |
| Evidence detail | Finding summary + source facts + interpretation + limitations |
| Intake flow | Narrow form + contextual guidance + one primary action |
| Marketing page | Deep-teal hero + neutral evidence sections + dark CTA |

## Correct use of the reference layout

- Preserve the map-dominant spatial workspace.
- Preserve separate assistant and verified analysis regions.
- Preserve top-level tabs inside the analysis workspace.
- Preserve persistent global actions in the header.
- Replace decorative or misleading score color with semantic-safe treatment.
- Label AI-generated summaries and simulated progress explicitly.

## Rules

- Use this overview as the composition router.
- Use `layout.md` as the authority for the canonical workspace.
- Use component guidelines for component-level behavior.
- Use pattern guidelines for recurring multi-component tasks.
- Do not treat a single screenshot as a complete responsive specification.
