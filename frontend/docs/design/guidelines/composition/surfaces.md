# Surface Composition

## Surface roles

| Surface | Role |
|---|---|
| `surface-canvas` | Primary reading, cards, analysis, forms, tables |
| `surface-default` | Quiet app regions and supporting sections |
| `surface-soft` | Recessed grouping and secondary controls |
| `surface-feature` | Non-semantic feature emphasis |
| `brand-teal-deep` | Heroes, major CTAs, terminal-like process panels |
| `surface-overlay` | Popovers, dialogs, menus, map detail |

## Canonical workspace layering

```text
White global header
├── White assistant rail
├── Soft analysis workspace containing white cards
└── Map canvas containing white overlay controls
```

Use hairline dividers between the assistant, analysis, and map regions.

## Assistant surfaces

- Use white for the rail.
- Use deep teal only for clearly labeled process or system-detail panels.
- Use pale green for an AI-generated summary only when labeled as AI-generated;
  it is not a verified-positive state.
- Keep the prompt composer on white with strong interactive border.

## Analysis surfaces

- Use a soft workspace surface behind white cards.
- Use flat bordered cards for scores, findings, and modules.
- Use semantic-tinted callouts only for labeled states.
- Do not make every card elevated.

## Map surfaces

- Keep map controls and legends on white overlay surfaces.
- Use preview or overlay elevation for popovers and legends.
- Keep overlays compact and avoid covering target markers or risk zones.
- Maintain enough contrast against the map without making controls dominant.

## Dark surfaces

Deep teal is appropriate for:

- major framing;
- system-process detail;
- important dark feature panels;
- global CTA or footer.

Deep teal is not appropriate for:

- large evidence tables;
- long-form body content;
- every card;
- semantic danger or positive status.

## Surface nesting

Avoid more than two levels of contained surfaces:

```text
Workspace surface -> Card
Map canvas -> Overlay
Dark feature region -> Compact content
```

Do not create card-inside-card-inside-card structures.

## Correct examples

- Soft analysis background with white finding cards.
- White map legend with restrained overlay shadow.
- Deep-teal process panel clearly labeled as progress or activity.

## Incorrect examples

- Pale-green AI summary interpreted as verified positive evidence.
- Multiple shadowed white cards floating inside another card.
- Large evidence content directly on a dark surface.

## Rules

- Use surface roles consistently.
- Use borders and surface contrast before shadow.
- Brand and feature surfaces never replace semantic labels.
- Keep overlays temporary and compact.
