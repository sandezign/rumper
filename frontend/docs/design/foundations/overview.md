# Foundations Overview

Foundations define the visual and technical decisions shared by every Rumper
component and composition. Read them before creating components, layouts,
themes, or implementation tokens.

## Required reading order

1. Read [`setup.md`](setup.md) for packages, providers, CSS order, Vite,
   TypeScript, and shadcn/ui ownership.
2. Read [`styles.md`](styles.md) for AI-facing visual patterns and decisions.
3. Read [`tokens.md`](tokens.md) for exact token names, values, Tailwind CSS v4
   mappings, and component contracts.
4. Read [`icon-discovery.md`](icon-discovery.md) before choosing or importing an
   icon.

## Foundation catalog

| Foundation | Purpose | Read when |
|---|---|---|
| [`setup.md`](setup.md) | Application stack and integration contract | Starting or configuring an application |
| [`styles.md`](styles.md) | Visual patterns and usage guidance | Designing in Figma Make or composing UI |
| [`tokens.md`](tokens.md) | Technical token source of truth | Writing code, variables, or theme mappings |
| [`icon-discovery.md`](icon-discovery.md) | Verified Lucide icon selection | Selecting or importing icons |

## Information ownership

| Question | Authority |
|---|---|
| Which visual pattern should I use? | `styles.md` |
| What exact token name or value should I use? | `tokens.md` |
| How is the application configured? | `setup.md` |
| Which icon exists and how should it be imported? | `icon-discovery.md` |
| How do I discover and verify component APIs? | `../guidelines/components.md` |
| How should a specific component behave? | `../guidelines/components/{category}.md` |
| How should components solve a recurring user task? | `../guidelines/patterns/{name}.md` |
| How should content form a page-level layout? | `../guidelines/composition/{category}.md` |

## Three-layer token architecture

```text
Primitive values -> Semantic purpose -> Component tokens
```

- Primitive tokens define raw values.
- Semantic tokens define purpose and enable modes.
- Component tokens define approved component-specific usage.

Interface code uses semantic or component tokens. Do not use primitive values
or hardcoded visual values directly in components.

## Shared foundation rules

- Use DM Sans for display, body, labels, and controls.
- Use monospace only for evidence IDs, source IDs, timestamps, and aligned
  technical values.
- Use a 4px spacing base and prefer 8px increments.
- Use white and soft reading surfaces, pale-green feature surfaces, and
  selective deep-teal framing.
- Use bright brand green for primary actions and small brand accents only.
- Never use bright brand green as semantic positive.
- Use compact radii and flat bordered cards.
- Reserve shadows for raised or temporary layers.
- Respect reduced-motion preferences.
- Keep every token and style purpose documented.

## Before adding a foundation

Add a new foundation token or style only when:

1. An existing token cannot represent the required purpose.
2. At least two components or compositions require the same role or value.
3. The new item has a clear semantic name and documented usage.
4. Light, dark, accessibility, and responsive implications are understood.
5. The relevant foundation and component guidelines are updated.

## Do not create

- One-off tokens for a single arbitrary value.
- Duplicate aliases with unclear ownership.
- Semantic names based only on appearance, such as `nice-green`.
- Component tokens that bypass semantic roles.
- Raw hex, spacing, radius, or shadow values inside components.

## Rules

- Read the relevant foundation before implementation.
- Use `styles.md` for visual decisions and `tokens.md` for exact values.
- Keep foundation rules framework-independent where possible.
- Keep shadcn/ui and Tailwind integration details in `setup.md`.
- Document intentional exceptions and keep them local.
