# Report Decision Summary Pattern

## Purpose

Help buyers understand a report's most important findings, limitations, and
next actions before reading full detail.

## Components combined

- `ReportStatus`
- `ReportSummary`
- Key risk findings
- Key limitations and missing coverage
- Recommended actions
- Links to evidence and full finding sections

Read `../components/reports.md`, `../components/evidence.md`,
`../composition/hierarchy.md`, and `../composition/content-safety.md`.

## Required order

1. Identify report status, location, scope, and date.
2. Summarize the most decision-relevant findings.
3. State key limitations and missing coverage.
4. Recommend prioritized buyer actions.
5. Link to supporting evidence and detailed sections.

## States

- Draft or preliminary: visibly label incomplete review.
- Reviewed: state the review scope, not merely "verified."
- Updated: identify material changes since the previous report.
- Incomplete: identify unavailable sections and decision impact.
- Exported: preserve status, limitations, source dates, and attribution.

## Responsive behavior

- Keep summary, limitations, and actions before supporting visuals.
- Use a readable single report column on small screens.
- Ensure exported or printed output preserves information hierarchy.

## Decision safety

- Never describe the overall property as safe or approved.
- Do not let an overall score replace finding-level explanation.
- Keep key limitations visible in the summary and export.

## Rules

- The summary must remain useful without opening every finding.
- Do not hide critical limitations at the end of the report.
- Do not separate recommended actions from the findings that justify them.
