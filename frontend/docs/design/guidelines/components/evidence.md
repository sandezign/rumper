# Evidence Components

## Available components

`EvidenceCard`, `EvidenceSummary`, `SourceCitation`, `ConfidenceIndicator`,
`LimitationNotice`, `EvidenceTable`, and `EvidencePopover`.

## When to use

Use evidence components whenever a finding or recommendation depends on an
external source, inference, or review state.

## When not to use

- Do not present AI interpretation as source evidence.
- Do not hide conflicting evidence.
- Do not use a badge, score, or color as proof.

## Anatomy

```text
Source fact and identity
Date and relevance
Rumper interpretation
Confidence
Limitations
Original source link
```

## Token mapping

Use standard card tokens, semantic status tokens, `text-body-sm`, and monospace
only for source IDs or timestamps.

## Variants

- Single-source evidence card.
- Multi-source evidence summary or table.
- Source citation.
- Confidence indicator.
- Visible limitation notice.
- Map evidence popover.

## Sizes

Do not force fixed heights. Evidence summaries must remain readable and source
links must retain 44px touch targets where interactive.

## States

Clearly label preliminary, incomplete, inferred, AI-generated, reviewed, and
verified states. Define loading, unavailable, error, and conflicting states.

## Behavior and interaction

Link to original sources when available. Keep limitations beside the relevant
evidence. Preserve conflicting sources rather than silently resolving them.

## Responsive behavior

Stack source metadata and interpretation on mobile. Convert evidence tables to
readable records when needed.

## Accessibility

Pair semantic states with text and icons. Use meaningful link text and text
alternatives for visual evidence.

## Content guidance

Separate source fact from Rumper interpretation. State what is known, uncertain,
limited, and actionable.

## Decision tree

```text
One source? -> EvidenceCard
Multiple comparable sources? -> EvidenceTable
Short source reference? -> SourceCitation
Important uncertainty? -> LimitationNotice
Confidence needs explanation? -> ConfidenceIndicator + text
Spatial evidence? -> MapPanel + EvidencePopover + text summary
```

## Correct examples

```tsx
<EvidenceCard
  status="incomplete"
  source="Portal data pemerintah"
  limitation="Data pembaruan 2026 belum tersedia."
/>
```

## Incorrect examples

```tsx
<Badge className="bg-primary">Terverifikasi aman</Badge>
```

## Rules

- Evidence, interpretation, confidence, limitation, and action remain distinct.
- Brand green is never evidence status.
- Never guarantee safety or suitability.

## Related components and foundations

Read `badges.md`, `tables.md`, `maps.md`, `reports.md`, and
`../../foundations/tokens.md`.
