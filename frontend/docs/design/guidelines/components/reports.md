# Reports and Findings

## Available components

`ReportPreviewCard`, `ReportSummary`, `FindingSection`, `ScoreExplanation`,
`RecommendedActions`, and `ReportStatus`.

## When to use

Use report components to turn evidence into a clear decision-support narrative.

## When not to use

- Do not let a score replace findings or evidence.
- Do not present a preliminary report as final.
- Do not fabricate proof in report-preview visuals.

## Anatomy

```text
Report identity and status
Decision summary
Important limitations
Findings with evidence and confidence
Recommended next actions
Methodology and sources
```

## Token mapping

Use approved report-preview, card, semantic, typography, and elevation tokens.
Report status uses explicit labels, not color alone.

## Variants

- **Preview:** demonstrates report structure with fictional data.
- **Preliminary:** visibly incomplete or awaiting review.
- **Reviewed:** reviewed with stated scope.
- **Final:** completed within documented evidence and limitations.

## Sizes

Use readable 720px long-form width where appropriate. Avoid fixed-height
findings. Report-preview cards may use approved preview elevation.

## States

Define loading, preliminary, incomplete, reviewed, final, error, and unavailable
states.

## Behavior and interaction

Lead with the decision summary and important limitations. Every significant
finding includes evidence, confidence, limitation, and practical next action.

## Responsive behavior

Move report visuals below explanatory copy on mobile. Keep findings in logical
reading order and actions close to their findings.

## Accessibility

Use semantic headings, landmarks, clear status text, accessible score
explanations, and text alternatives for visual summaries.

## Content guidance

Use calm, direct Bahasa Indonesia. Explain scores in plain language. Never
guarantee that a property is safe or suitable.

## Decision tree

```text
Overall result and next decision? -> ReportSummary
One significant finding? -> FindingSection
Score shown? -> ScoreExplanation
Practical next steps? -> RecommendedActions
Compact demonstration? -> ReportPreviewCard
Review stage? -> ReportStatus + visible supporting text
```

## Correct examples

```tsx
<FindingSection
  title="Risiko banjir"
  confidence="sedang"
  limitation="Batas area berasal dari peta skala regional."
/>
```

## Incorrect examples

```tsx
<ReportSummary score={92} conclusion="Aman untuk dibeli" />
```

## Rules

- Lead with decision summary and limitations.
- Pair every finding with evidence and next action.
- Distinguish preliminary, reviewed, and final reports.

## Related components and foundations

Read `evidence.md`, `cards.md`, `badges.md`, `feedback-states.md`, and
`../../foundations/styles.md`.
