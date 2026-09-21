# Badges and Status Labels

## Available components

`Badge`, `RiskBadge`, `ConfidenceBadge`, `ValidationBadge`, and `SourceBadge`.

## When to use

Use badges for compact status or metadata that remains understandable without a
full explanation.

## When not to use

- Do not use badges for essential explanations.
- Do not use bright brand green as safe or verified.
- Do not show more than three badges together without grouping or reducing.

## Anatomy

```text
[optional icon] concise visible label
```

## Token mapping

Use `radius-full`, `text-caption-bold`, semantic background and text tokens,
and 4px by 10px padding. Source and neutral badges use quiet neutral tokens.

## Variants

- **Risk:** labeled severity.
- **Confidence:** labeled confidence.
- **Validation:** preliminary, incomplete, inferred, reviewed, or verified.
- **Source:** source type or authority.
- **Neutral:** compact non-semantic metadata.

## Sizes

Use one default compact size. Do not shrink below readable 13px label text.

## States

Badges are normally static. Interactive badges must be implemented as approved
buttons or controls, not styled static badges.

## Behavior and interaction

Place badges near the content they qualify. A badge never replaces the
corresponding explanation.

## Responsive behavior

Wrap badge groups cleanly. Reduce the number shown before reducing text size.

## Accessibility

Pair semantic color with visible text and icon. Ensure text contrast and avoid
color-only distinctions.

## Content guidance

Use concise sentence-case labels such as "Perlu validasi", "Keyakinan sedang",
or "Sumber pemerintah".

## Decision tree

```text
Compact severity? -> RiskBadge
Compact confidence? -> ConfidenceBadge
Review state? -> ValidationBadge
Source type? -> SourceBadge
Needs explanation? -> Use body content or Alert, not Badge
```

## Correct examples

```tsx
<Badge variant="warning">Perlu validasi</Badge>
```

## Incorrect examples

```tsx
<Badge className="bg-primary">Aman</Badge>
```

## Rules

- Use semantic tokens and explicit labels.
- Never use badges as proof.
- Do not overload the interface with badge clusters.

## Related components and foundations

Read `evidence.md`, `feedback-states.md`, and `../../foundations/tokens.md`.
