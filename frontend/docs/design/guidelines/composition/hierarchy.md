# Hierarchy Composition

## Decision hierarchy

Every evidence-led screen should answer these questions in order:

1. What location or decision is being evaluated?
2. What is the current review or evidence status?
3. What are the most important findings and limitations?
4. What evidence supports each finding?
5. What should the buyer do next?

## Canonical workspace hierarchy

| Priority | Region or content |
|---|---|
| Global | Location identity, expert review, share/report action |
| Primary | Analysis summary, important limitations, top findings |
| Supporting | Map evidence, source detail, confidence explanation |
| Assistive | AI assistant prompts, summaries, and suggested questions |

The assistant rail is visually persistent but must remain subordinate to the
verified analysis workspace.

## Score hierarchy

A score is a summary signal, not a conclusion.

- Place a plain-language interpretation beside or below the score.
- Explain which modules contribute to it.
- Show limitations and confidence.
- Do not use bright brand green for the score ring.
- Use neutral visualization plus an explicit semantic label.
- Never label a score as safe or suitable.

## Action hierarchy

- Keep one primary action per decision point.
- Global actions belong in the header.
- Finding-specific actions remain beside the relevant finding.
- Secondary actions use quieter styling.
- Destructive actions remain separated from primary completion actions.

## Evidence hierarchy

```text
Finding
├── Plain-language interpretation
├── Source evidence
├── Confidence
├── Limitations
└── Recommended action
```

Do not show confidence without explaining what it refers to.

## Progressive disclosure

May be disclosed progressively:

- detailed methodology;
- secondary source metadata;
- advanced map-layer settings;
- historical supporting detail.

Must remain visible:

- important limitations;
- preliminary or AI-generated status;
- confirmed high-risk findings;
- missing evidence that affects the decision;
- recommended next action.

## Visual hierarchy techniques

Use typography, spacing, position, and surface contrast before saturated color.
Reserve semantic color for labeled status and bright green for primary actions.

## Correct examples

- "Risiko sedang" is followed by key findings and limitations.
- The review status appears near the report or analysis identity.
- Expert review is a global supporting action, not the conclusion.

## Incorrect examples

- A large green score dominates while limitations are hidden below.
- The assistant summary appears more authoritative than cited evidence.
- Multiple bright-green actions compete in the header and cards.

## Rules

- Lead with decision meaning, not metrics.
- Keep evidence and interpretation visually distinct.
- Keep limitations visible near relevant findings.
- Use hierarchy to reduce anxiety, not to conceal uncertainty.
