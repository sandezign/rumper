# Cards and Surfaces

## Available components

`Card`, `FeatureCard`, `DarkFeatureCard`, `RiskCard`, `PricingCard`, and
`StatCard`. Evidence and report cards have dedicated guidelines.

## When to use

Use cards when related content benefits from a shared boundary, action, or
scanning unit.

## When not to use

- Do not wrap every section in a card.
- Do not combine unrelated content in one card.
- Do not make a complex card clickable when it contains other controls.

## Anatomy

```text
Header: label, title, status
Content: primary information
Footer: supporting detail and actions
```

## Token mapping

Standard cards use `surface-canvas`, `border-default`, `radius-lg`,
`space-xl`, and `shadow-flat`. Feature cards may use approved feature or dark
surfaces, `radius-xl`, and `space-2xl`.

## Variants

- **Base:** general related content.
- **Feature:** important capability or explanation.
- **Dark feature:** important framing on deep teal.
- **Risk:** finding, severity, evidence, confidence, limitation, and action.
- **Pricing:** service comparison without hiding safety-critical information.
- **Stat:** metric with context and explanation.

## Sizes

Use 24px padding for standard cards and 32px for feature cards. Avoid fixed
heights unless aligning a simple comparable grid.

## States

Static cards have no hover state. Interactive cards define hover,
focus-visible, selected, loading, disabled, and error states.

## Behavior and interaction

Keep actions predictable and subordinate to content. Whole-card links are
allowed only when the card has one destination and no nested controls.

## Responsive behavior

Collapse card grids from three to two to one column. Preserve content order and
avoid fixed heights on mobile.

## Accessibility

Use semantic headings, logical order, and visible focus for interactive cards.
Do not communicate card status through border color alone.

## Content guidance

Write concise titles. Risk cards must explain evidence and limitations, not
only severity or score.

## Decision tree

```text
Related content needs a boundary? -> Card
Important capability? -> FeatureCard
Deep-teal emphasis? -> DarkFeatureCard
Risk finding? -> RiskCard
Metric with context? -> StatCard
No shared purpose? -> Do not use a card
```

## Correct examples

```tsx
<Card className="rounded-lg border-border bg-background p-xl shadow-none">
  ...
</Card>
```

## Incorrect examples

```tsx
<Card className="rounded-[30px] shadow-2xl">...</Card>
```

## Rules

- Standard cards are flat, bordered, and 12px rounded.
- Use surface hierarchy before shadows.
- Keep limitations visible in risk cards.

## Related components and foundations

Read `evidence.md`, `reports.md`, `badges.md`, and
`../../foundations/styles.md`.
