# Analysis Summary Pattern

## Purpose

Give users an understandable overview of the current analysis before they
inspect individual findings.

## Components combined

- Analysis or report status
- Optional score visualization with `ScoreExplanation`
- Confidence indicator
- Key limitations
- Top risk findings
- Primary next action

Read `../components/reports.md`, `../components/evidence.md`,
`../components/cards.md`, and `../composition/hierarchy.md`.

## Required order

1. State analysis status and coverage.
2. Summarize the most decision-relevant findings.
3. Explain any score in plain language.
4. Show confidence and limitations beside the interpretation.
5. Provide the next review or verification action.

## States

- Loading: preserve summary structure and label work in progress.
- Partial: show available findings and missing coverage explicitly.
- Complete: show current findings without implying permanent certainty.
- No significant finding: explain scope and remaining uncertainty.
- Error: retain available verified content and identify unavailable sections.

## Responsive behavior

- Keep status, key finding, and limitation before charts or decorative visuals.
- Stack score, findings, and action vertically on small screens.
- Do not require horizontal scrolling to understand the result.

## Decision safety

- The score is subordinate to findings and evidence.
- Do not use brand green for score rings or favorable interpretation.
- "No significant finding" never means "safe."

## Rules

- Do not show an unexplained score.
- Do not hide limitations below unrelated content.
- Do not combine unrelated risk categories into one vague status.
