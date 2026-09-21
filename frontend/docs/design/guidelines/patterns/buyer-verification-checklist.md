# Buyer Verification Checklist Pattern

## Purpose

Turn findings and limitations into a practical, trackable set of buyer
verification actions.

## Components combined

- Checklist heading and progress summary
- Checklist items with explicit status
- Related finding or evidence link
- Owner, due timing, or context where useful
- Completion or exception note

Read `../components/forms.md`, `../components/badges.md`,
`../components/navigation.md`, and `../composition/content-safety.md`.

## Required order

1. Explain the checklist scope and what completion means.
2. Prioritize actions by decision impact or timing.
3. Connect each action to a finding, limitation, or missing source.
4. Allow users to record completion and notes.
5. Keep unresolved high-impact actions visible.

## States

- Not started, in progress, completed, blocked, and not applicable.
- A completed action means the action was performed, not that the property is safe.
- Blocked items identify the blocker and an alternative next step.

## Responsive behavior

- Use a single-column prioritized list on small screens.
- Keep item status, action, and related finding together.
- Move secondary metadata below the action rather than compressing it.

## Decision safety

- Never convert checklist completion into a safety guarantee.
- Do not automatically mark actions complete based only on AI output.
- Keep unresolved high-impact limitations prominent.

## Rules

- Every item starts with a concrete verb.
- Avoid vague actions such as "Check further."
- Do not hide blocked or incomplete critical actions.
