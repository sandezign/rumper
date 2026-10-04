# Tables and Structured Data

## Available components

`Table`, `EvidenceTable`, `ComparisonTable`, and `ResponsiveRecordList`.

## When to use

Use tables when users need to scan or compare consistent values across rows and
columns.

## When not to use

- Do not use tables for narrative explanations.
- Do not compress evidence until summaries become unreadable.
- Do not force wide tables to create horizontal page scrolling.

## Anatomy

```text
Caption or title
Header row
Body rows
Optional row actions and pagination
```

## Token mapping

Use `surface-canvas`, `border-default`, `border-soft`, `text-body-sm`, and
`space-sm` or `space-md`. Semantic values require text and icons.

## Variants

- **Table:** general structured data.
- **Evidence table:** sources, dates, relevance, confidence, limitations.
- **Comparison table:** locations, findings, or service scope.
- **Responsive record list:** stacked mobile representation.

## Sizes

Default rows are at least 48px. Use comfortable 56px rows for dense evidence
summaries. Align text left, numbers right, and actions right.

## States

Define default, hover for interactive rows, selected, loading, empty, and error
states. Static rows do not need hover styling.

## Behavior and interaction

Provide sorting only when useful. Keep headers visible and descriptive. Keep
row actions discoverable and keyboard accessible.

## Responsive behavior

Prioritize columns, use contained horizontal scrolling, or convert rows into
labeled records. Never let the page itself scroll horizontally.

## Accessibility

Use proper table semantics, captions, header scopes, keyboard-operable actions,
and non-color status labels.

## Content guidance

Use concise headers. Explain abbreviations and source limitations.

## Decision tree

```text
Consistent values to compare? -> Table
Multiple sources? -> EvidenceTable
Locations or packages? -> ComparisonTable
Small screen cannot preserve meaning? -> ResponsiveRecordList
Narrative content? -> Cards or sections
```

## Correct examples

```tsx
<Table>
  <TableCaption>Sumber bukti yang digunakan</TableCaption>
  ...
</Table>
```

## Incorrect examples

```tsx
<div className="overflow-x-auto w-screen">...</div>
```

## Rules

- Keep tables readable and semantically correct.
- Use status labels, not color-only cells.
- Provide responsive alternatives for important data.

## Related components and foundations

Read `evidence.md`, `feedback-states.md`, and `../../foundations/styles.md`.
