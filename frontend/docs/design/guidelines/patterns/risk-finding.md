# Risk Finding Pattern

## Purpose

Explain one decision-relevant risk, the evidence supporting it, its
limitations, and the buyer's next action.

## Components combined

- Finding title and `RiskBadge`
- Plain-language interpretation
- `EvidenceCard`, `EvidenceSummary`, or source citations
- Confidence indicator
- `LimitationNotice`
- Recommended action

Read `../components/cards.md`, `../components/badges.md`,
`../components/evidence.md`, and `../components/reports.md`.

## Required order

1. Name the finding and labeled severity.
2. Explain why it matters to the buyer.
3. Present source facts separately from Rumper interpretation.
4. State confidence and limitations.
5. Recommend a concrete verification or decision action.

## States

- Preliminary: clearly label unreviewed or incomplete interpretation.
- Incomplete evidence: identify missing evidence and its decision impact.
- Reviewed: identify reviewer and review scope when available.
- Updated: show material changes to the finding.
- Not applicable: explain why the category does not apply.

## Responsive behavior

- Keep the title, meaning, limitation, and action visible before secondary detail.
- Stack supporting sources below the finding on small screens.
- Do not hide limitations in an accordion or popover.

## Decision safety

- Severity and confidence are different concepts and must remain separate.
- Absence of evidence is not evidence of absence.
- Link important claims to their source and date.

## Rules

- One finding pattern covers one coherent risk.
- Do not use color alone to communicate severity.
- Do not recommend an action without connecting it to the finding.
