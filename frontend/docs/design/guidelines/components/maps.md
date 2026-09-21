# Maps and Location Components

## Available components

`MapPanel`, `MapMarker`, `MapLegend`, `MapLayerControl`, `EvidencePopover`, and
`LocationSummary`.

## When to use

Use maps when spatial relationships materially help a buyer understand a
finding or source.

## When not to use

- Do not use maps as decorative backdrops.
- Do not rely on a map alone for a safety-critical finding.
- Do not imply exact boundaries when source precision is limited.

## Anatomy

```text
Location summary
Map viewport + markers/layers
Layer controls + visible legend
Text summary + evidence detail
```

## Token mapping

Use approved surface, border, radius, semantic, popover, and elevation tokens.
Markers and layers must match legend labels and text summaries.

## Variants

- Property location map.
- Risk-layer map.
- Evidence-source map.
- Comparison map when multiple locations are meaningful.

## Sizes

Map controls remain at least 44x44px. Map panels must provide enough height for
meaningful interaction without dominating the full page.

## States

Define loading, unavailable, incomplete layers, error, selected marker, and
selected layer states.

## Behavior and interaction

Keep layer controls discoverable and keyboard operable. Evidence popovers show
source, date, confidence, limitation, and source link.

## Responsive behavior

Move maps below explanatory copy on mobile. Provide a readable text summary
before or immediately after the map.

## Accessibility

Provide text alternatives for every important finding. Do not require pointer
interaction. Use visible labels and non-color distinctions.

## Content guidance

State source precision, coverage limits, and whether boundaries are inferred.

## Decision tree

```text
Spatial relationship changes understanding? -> MapPanel + text summary
Layer needs explanation? -> MapLegend
Multiple evidence layers? -> MapLayerControl
Specific source point? -> MapMarker + EvidencePopover
No spatial value? -> Use evidence card or table
```

## Correct examples

```tsx
<MapPanel aria-label="Peta bukti risiko banjir" />
<p>Lokasi berada sekitar 350 meter dari area yang dipetakan...</p>
```

## Incorrect examples

```tsx
<MapPanel className="absolute inset-0 opacity-50" />
```

## Rules

- Maps are evidence interfaces.
- Always include a legend and text summary.
- Communicate precision and limitations.

## Related components and foundations

Read `evidence.md`, `feedback-states.md`, `forms.md`, and
`../../foundations/styles.md`.
