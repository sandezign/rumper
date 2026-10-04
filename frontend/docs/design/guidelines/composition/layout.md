# Layout Composition

## Canonical desktop workspace

Use the three-region evidence workspace for location-analysis screens:

```text
Global header
├── Assistant rail
├── Analysis workspace
└── Map workspace
```

### Region proportions

| Region | Preferred width | Minimum | Maximum |
|---|---:|---:|---:|
| Assistant rail | 20% | 280px | 400px |
| Analysis workspace | 28% | 400px | 560px |
| Map workspace | Flexible | 45% viewport | Remaining width |

At wide desktop widths, the map receives remaining space. Do not reduce the map
below a useful spatial viewport merely to preserve fixed side-panel widths.

### Global header

- Span the full application width.
- Use approximately 72px height.
- Place brand identity at the start.
- Place global actions such as expert review and report sharing at the end.
- Keep global actions separate from local workspace actions.
- Use a bottom hairline border and white surface.

### Assistant rail

- Use a fixed-width supporting rail, not the primary evidence region.
- Keep the rail header fixed.
- Make conversation content independently scrollable.
- Keep the prompt input anchored at the bottom.
- Clearly distinguish user prompts, AI summaries, progress, and verified data.
- Do not let assistant content cover or replace analysis findings.

### Analysis workspace

- Use a white or soft reading surface with independent vertical scrolling.
- Keep peer-view tabs sticky at the top when content scrolls.
- Present decision summary and limitations before detailed modules.
- Use cards for score explanation, risks, evidence, and recommended actions.
- Keep content width readable and avoid dense edge-to-edge text.

### Map workspace

- Use the largest region when spatial evidence is central.
- Keep map legend visible without obscuring the target location.
- Anchor zoom and map controls consistently.
- Keep evidence popovers close to selected markers.
- Provide a text summary outside the map.

## Grid and alignment

- Use shared horizontal alignment within each region.
- Use 24px standard panel padding and 16-24px card gaps.
- Use hairline dividers between major workspace regions.
- Do not nest arbitrary grids inside each other.
- Keep card edges and headings aligned inside the analysis workspace.

## Scrolling model

The desktop shell uses fixed viewport height below the header:

| Region | Scroll behavior |
|---|---|
| Global header | Fixed or sticky |
| Assistant rail | Independent content scroll; input remains visible |
| Analysis workspace | Independent vertical scroll |
| Map workspace | Fixed viewport; map interaction handles movement |

Avoid nested scroll regions inside cards. Use one scroll container per major
workspace region.

## Alternative layouts

### Report-first layout

Use a readable report column up to approximately 720px with an optional
evidence index or map beside it. Do not force the full three-region workspace
for long-form reports.

### Intake layout

Use a narrow primary form column with contextual guidance. The map may appear
after the location is sufficiently defined.

### Marketing layout

Use the standard page container and section rhythm rather than the fixed-height
workspace shell.

## Layout decision tree

```text
Is spatial evidence central to the task?
|
|-- Yes, and assistant support is useful
|   `-- Three-region evidence workspace
|
|-- Yes, but assistant support is not central
|   `-- Analysis + map split view
|
|-- Long-form report or methodology
|   `-- Readable report-first layout
|
|-- Information collection
|   `-- Narrow intake layout
|
`-- Marketing or education
    `-- Standard page sections
```

## Correct examples

- Map retains at least 45% of the wide desktop viewport.
- Tabs remain inside the analysis workspace.
- Assistant input remains visible while conversation content scrolls.

## Incorrect examples

- A map reduced to a narrow decorative strip.
- One page-level scroll plus nested panel and card scrollbars.
- AI assistant output displayed as the verified analysis workspace.

## Rules

- Preserve independent region responsibilities.
- Do not make all three regions equal width.
- Do not use the fixed workspace shell for every product page.
- Preserve meaningful map space and readable analysis width.
