# Pattern Guidelines Overview

Patterns are reusable solutions to recurring user tasks. A pattern combines
multiple primitive or composite components, content rules, states, and
interactions into a repeatable workflow.

Patterns are not single components and do not define page-level geometry.
Use component guidelines for reusable UI units and composition guidelines for
layouts, regions, hierarchy, and responsive arrangement.

## Taxonomy

```text
Foundation -> Component -> Pattern -> Layout or template -> Page
```

| Layer | Owns | Example |
|---|---|---|
| Foundation | Visual and behavioral rules | Color, spacing, typography |
| Primitive component | Small reusable control | Button, Input, Badge |
| Composite component | Reusable contained unit with one responsibility | EvidenceCard, MapLegend |
| Pattern | Recurring multi-component task or workflow | Risk finding, assistant conversation |
| Layout or template | Page-level spatial arrangement | Three-region evidence workspace |
| Page | A specific route with real content and state | Cluster Bintaro analysis page |

## Pattern catalog

| User task | Read |
|---|---|
| Enter and validate a property location | [`location-intake.md`](location-intake.md) |
| Ask questions and follow AI-assisted analysis | [`assistant-conversation.md`](assistant-conversation.md) |
| Understand the overall analysis result | [`analysis-summary.md`](analysis-summary.md) |
| Understand and act on one risk | [`risk-finding.md`](risk-finding.md) |
| Explore spatial evidence on a map | [`map-evidence-exploration.md`](map-evidence-exploration.md) |
| Track buyer verification work | [`buyer-verification-checklist.md`](buyer-verification-checklist.md) |
| Review a decision-oriented report summary | [`report-decision-summary.md`](report-decision-summary.md) |

## Before using a pattern

1. Confirm the user task recurs in more than one page or state.
2. Read the pattern guideline and every linked component guideline.
3. Use the pattern's required information order and states.
4. Use composition guidelines to place the pattern on the page.
5. Do not convert a one-off page section into a named pattern prematurely.

## Shared pattern rules

- Each pattern solves one recognizable user task.
- Keep evidence, interpretation, confidence, limitations, and actions distinct.
- Define loading, empty, error, incomplete, and completed states where relevant.
- Preserve logical reading and action order after responsive reflow.
- Keep safety-critical evidence and limitations visible.
- Label AI-generated, inferred, preliminary, reviewed, and verified content.
- Use existing components before creating a pattern-specific component.
- Document meaningful pattern variations; do not create arbitrary variants.

## Pattern versus component decision tree

```text
Is it one reusable, independently testable UI unit?
|
|-- Yes -> Component
|
`-- No
    |
    |-- Does it combine components to solve a recurring user task?
    |   `-- Yes -> Pattern
    |
    `-- Does it define page-level placement or region proportions?
        `-- Yes -> Composition or layout template
```

## Rules

- Use this file as the pattern router.
- Patterns may contain components, but patterns are not component variants.
- Layouts may place patterns, but layouts must not redefine pattern behavior.
- Pages may specialize content, but must preserve required pattern safety rules.
