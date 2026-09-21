# Rumper Style Guidelines

Use this file when creating or evaluating Rumper interfaces in Figma Make,
design tools, prototypes, or visual implementation work.

This file explains which visual styles are available and how to use them.
Exact token names, values, CSS variables, and Tailwind mappings are defined in
`tokens.md`.

## Product style

Rumper is a **B2C property decision-support** product with a **calm,
structured, evidence-led** visual style.

- Use breathable layouts for marketing and intake experiences.
- Use compact but readable layouts for dashboards, evidence, maps, and reports.
- Make important decisions and limitations easy to find.
- Prefer structured clarity over decorative complexity.
- Protect, do not frighten.
- Never make a property appear safe, suitable, or verified without evidence.

## Visual character

Rumper uses a dual-mode visual identity:

- white and soft surfaces for reading, evidence, forms, tables, and reports;
- pale-green surfaces for non-semantic feature emphasis;
- deep-teal surfaces for heroes, major calls to action, and footer regions;
- bright-green pill actions used sparingly;
- compact rounded cards with flat borders;
- restrained shadows for temporary or raised layers.

Bright brand green is an action and identity color. It must never communicate
safe, verified, approved, positive evidence, or low risk.

## Layout principles

- Start every layout as a single-column mobile experience.
- Use grid and flex layouts. Use absolute positioning only for map markers,
  overlays, or deliberate decorative composition.
- Align related content to a shared grid.
- Keep related items visually closer than unrelated groups.
- Use one dominant action per section or decision point.
- Place the primary decision, finding, or action before supporting detail.
- Place limitations beside the relevant finding, not only at the bottom.
- Keep scores subordinate to findings and evidence.
- Avoid horizontal page scrolling.

### Container widths

| Pattern | Width | Usage |
|---|---:|---|
| Full page container | 1280px maximum | Marketing, dashboard, and report layouts |
| Readable content | Approximately 720px maximum | Long-form explanation and methodology |
| Mobile gutter | 16px | Viewports below 768px |
| Tablet gutter | 20px | Viewports from 768px |
| Desktop gutter | 32px | Viewports from 1024px |

### Common layouts and templates

| Surface | Recommended layout |
|---|---|
| Marketing page | Deep-teal hero, white or soft sections, evidence preview, dark CTA |
| Intake flow | Narrow readable form, supporting explanation, one primary action |
| Dashboard | Summary first, risk and evidence cards, map or report detail below |
| Evidence view | Finding summary, source facts, interpretation, confidence, limitations |
| Report preview | Decision summary, important limitations, findings, next actions |

## Surface strategy

Surface color and spacing establish hierarchy. Borders define contained
components. Shadows identify raised or temporary layers.

| Surface | Usage |
|---|---|
| White canvas | Page content, cards, evidence tables, reports, forms |
| Soft surface | Quiet sections, recessed areas, control groups |
| Pale-green feature surface | Feature emphasis without status meaning |
| Deep-teal surface | Hero, major CTA, footer, important framing |
| Overlay surface | Dialog, menu, popover, floating evidence detail |

Rules:

- Use white for evidence tables and long-form reading.
- Do not place large data tables directly on deep teal.
- Use pale green for feature emphasis only, never semantic success.
- Avoid nesting more than two visually distinct card surfaces.
- Use dark surfaces selectively so they retain emphasis.
- Do not use bright green or semantic status colors as large section
  backgrounds.

## Color usage

The interface should remain mostly neutral. Saturated color is reserved for
actions, active states, small accents, and labeled semantic states.

### Brand colors

| Style | Usage |
|---|---|
| Bright green | Primary actions and restrained brand accents |
| Green hover and pressed | Interactive states for bright-green actions |
| Dark green | Links, focus treatment, and restrained active indicators |
| Deep teal | Hero, CTA, footer, and important framing |
| Pale green | Feature emphasis without status meaning |

### Semantic colors

| State | Meaning |
|---|---|
| Positive | Verified supporting evidence only |
| Warning | Validation required or caution |
| Danger | Confirmed high-risk or destructive action |
| Unknown | Missing, incomplete, or unresolved evidence |

Every semantic color must be paired with visible text and an icon.

Do not rely on color alone for risk, confidence, validation, or status.

### Color decision tree

```text
What color treatment should I use?
|
|-- Primary action?
|   `-- Bright-green pill with deep-teal text
|
|-- Reading, evidence, report, table, or form?
|   `-- White canvas with deep-teal text
|
|-- Quiet secondary grouping?
|   `-- Soft surface
|
|-- Feature emphasis without status meaning?
|   `-- Pale-green feature surface
|
|-- Hero, major CTA, or footer?
|   `-- Deep-teal surface with white text
|
`-- Evidence or system status?
    `-- Labeled semantic color with icon
```

## Typography hierarchy

Use **DM Sans** for all display, body, labels, and controls.

Use a system monospace font only for evidence IDs, source identifiers,
timestamps, and aligned technical values.

| Style | Desktop size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| Hero display | 72px | 500 | 1.10 | Wide-desktop marketing hero |
| Large display | 56px | 500 | 1.15 | Major section opener |
| Heading 1 | 48px | 500 | 1.20 | Page title |
| Heading 2 | 36px | 500 | 1.25 | Major section heading |
| Heading 3 | 28px | 500 | 1.30 | Card or report-section heading |
| Heading 4 | 22px | 500 | 1.35 | Feature or subsection heading |
| Heading 5 | 18px | 600 | 1.40 | Compact card heading |
| Subtitle | 18px | 400 | 1.50 | Lead and supporting introduction |
| Body | 16px | 400 | 1.55 | Primary body text |
| Small body | 14px | 400 | 1.50 | Supporting content and tables |
| Caption | 13px | 400 or 600 | 1.40 | Metadata and badges |
| Micro uppercase | 11px | 600 | 1.40 | Eyebrow and category label |
| Button | 14px | 600 | 1.30 | Button label |

### Typography rules

- Use sentence case for headings, buttons, navigation, and labels.
- Use uppercase only for short eyebrow or category labels.
- Keep body text at 16px by default.
- Do not use supporting content smaller than 14px unless it is compact
  metadata.
- Keep long-form text between approximately 55 and 75 characters per line.
- Use weight and spacing before adding color for hierarchy.
- Do not require Euclid Circular A or Fraunces.

### Typography decision tree

```text
What typography style should I use?
|
|-- Marketing hero?
|   `-- Hero display
|
|-- Page title?
|   `-- Heading 1
|
|-- Major section heading?
|   `-- Heading 2
|
|-- Card or report-section heading?
|   `-- Heading 3, 4, or 5
|
|-- Primary reading content?
|   `-- Body
|
|-- Supporting content or table cell?
|   `-- Small body
|
|-- Badge or metadata?
|   `-- Caption
|
`-- Evidence ID, source ID, or timestamp?
    `-- Monospace technical style
```

## Spacing scale

Use a 4px base unit and prefer 8px increments.

| Style | Value | Usage |
|---|---:|---|
| Micro | 4px | Icon-to-label gap |
| Extra small | 8px | Compact internal gap |
| Small | 12px | Compact component padding |
| Medium | 16px | Default internal spacing |
| Large | 20px | Comfortable component spacing |
| Extra large | 24px | Standard card padding |
| 2x large | 32px | Feature panel padding |
| 3x large | 40px | Large content grouping |
| Small section | 48px | Compact section separation |
| Default section | 64px | Standard section separation |
| Large section | 96px | Marketing section separation |
| Hero | 120px | Wide-desktop hero only |

### Spacing rules

- Use 20px, 24px, or 32px padding for cards and panels.
- Use 48px, 64px, or 96px between major sections.
- Reduce section spacing on smaller screens.
- Preserve useful whitespace.
- Do not fill empty space with decoration.
- Do not use arbitrary spacing values.

## Border radius system

Rumper uses compact radii for a structured professional tone.

| Style | Value | Usage |
|---|---:|---|
| Extra small | 4px | Compact tags and internal details |
| Small | 6px | Badges and chips |
| Medium | 8px | Inputs and compact panels |
| Large | 12px | Standard cards |
| Extra large | 16px | Feature panels |
| 2x large | 24px | Major showcases |
| Full | Pill | Buttons and status pills |

Rules:

- Cards use 12px by default.
- Inputs use 8px.
- Buttons and status pills use full pill radius.
- Feature panels use 16px.
- Use 24px only for major showcases.
- Do not use pill shapes for large content containers.
- Do not invent arbitrary corner values.

## Borders

- Use subtle hairline borders for default cards and dividers.
- Use stronger borders for inputs and interactive boundaries.
- Use a visible dark-green border and focus ring for focused controls.
- Use dark borders on deep-teal surfaces.
- Prefer surface contrast over borders between large layout regions.
- Never use borders as decoration around every nested element.

## Elevation

Rumper is border-driven. Shadows are reserved for raised or temporary layers.

| Level | Treatment | Usage |
|---|---|---|
| Flat | No shadow, hairline border | Default cards, tables, page sections |
| Subtle | Very light short shadow | Hover-raised tile |
| Raised | Small soft shadow | Menu or important raised card |
| Preview | Medium shadow | Report preview or evidence popover |
| Overlay | Strongest approved shadow | Dialog and overlay |

Rules:

- Default cards have no shadow.
- Use borders, spacing, and surface color before elevation.
- Stronger elevation means a more temporary or foreground layer.
- Do not apply shadows to every card.
- Do not use decorative glow effects.

## Responsive behavior

| Viewport | Behavior |
|---|---|
| Below 480px | Single column, 16px gutters, 36px hero |
| 480-767px | Single column with selective paired content, 48px hero |
| 768-1023px | Two-column feature layouts, 20px gutters, 56px hero |
| 1024-1279px | Full navigation and three-column comparisons, 32px gutters |
| 1280px and above | Full 1280px container and 72px hero |

Rules:

- Start with a single-column mobile layout.
- Add selective two-column layouts from 768px.
- Show full navigation and three-column comparisons from 1024px.
- Move map and report visuals below explanatory copy on mobile.
- Convert wide tables into contained scrolling regions, prioritized columns,
  or stacked records.
- Never allow horizontal page scrolling.
- Preserve logical reading and keyboard order after reflow.
- Keep touch targets at least 44x44px.

## Motion

Motion explains state changes and relationships. It is not decorative.

| Style | Duration | Usage |
|---|---:|---|
| Press | 100ms | Pressed-state feedback |
| Interactive | 180ms | Hover, focus, selected, and control transitions |
| Reveal | 260ms | Expand, collapse, and content reveal |
| Emphasis | 420ms | Rare major visual emphasis |

Rules:

- Use interactive motion for most state changes.
- Do not delay access to critical evidence.
- Avoid looping decorative motion.
- Do not use auto-advancing carousels.
- Respect reduced-motion preferences.
- Reduced-motion mode must preserve all information and state feedback.

## Evidence and status styles

Every evidence or risk presentation must visibly separate:

1. Source evidence
2. Rumper interpretation
3. Confidence
4. Limitations
5. Recommended next action

Use cards, badges, alerts, maps, and reports to support this structure. Never
compress these elements into an unexplained score or color.

### Status rules

- Positive means verified supporting evidence only.
- Warning means validation required or caution.
- Danger means confirmed high risk or destructive action.
- Unknown means missing, incomplete, or unresolved evidence.
- Preliminary and AI-generated output must be visibly labeled.
- Safety-critical limitations remain visible and cannot be hidden behind
  payment, hover, tabs, accordions, or progressive disclosure.

## Common patterns

### Standard card

- White surface
- 12px radius
- Hairline border
- 24px padding
- No default shadow

### Feature panel

- White, pale-green, or deep-teal approved surface
- 16px radius
- 32px padding
- No shadow unless raised above surrounding content

### Primary button

- Bright-green background
- Deep-teal text
- Pill radius
- Minimum 44px touch target
- One primary button per visible section

### Form control

- White surface
- 8px radius
- Strong border
- Minimum 44px height
- Persistent visible label
- Visible focus ring

### Evidence card

- White surface
- 12px radius
- Hairline border
- Source, date, relevance, confidence, limitation, and source link
- Semantic color only when paired with visible text and icon

### Dark feature region

- Deep-teal background
- White primary text and muted supporting text
- Bright-green primary action
- No large evidence table directly on the dark surface

## Style rules

- Use the styles defined in this file and the exact tokens in `tokens.md`.
- Keep interfaces mostly neutral; use saturated colors sparingly.
- Never use bright brand green as semantic positive.
- Never rely on color alone to communicate meaning.
- Use DM Sans for all standard UI text.
- Use the spacing scale and shared grid.
- Use compact radii and flat bordered cards.
- Reserve shadows for raised and temporary layers.
- Use responsive layouts from mobile first.
- Use motion only to clarify changes.
- Keep evidence, interpretation, confidence, limitations, and actions distinct.
- Document intentional style exceptions and keep them local.
