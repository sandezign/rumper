# Map Evidence Exploration Pattern

## Purpose

Allow users to inspect spatial evidence, understand map symbols and precision,
and connect map observations to written findings.

## Components combined

- `MapPanel`
- Property and evidence markers
- Visible `MapLegend`
- Optional `MapLayerControl`
- `EvidencePopover`
- Written location or evidence summary

Read `../components/maps.md`, `../components/evidence.md`,
`../composition/layout.md`, and `../composition/content-safety.md`.

## Required order

1. Identify the target location.
2. Show active evidence layers and a visible legend.
3. Let users inspect a marker, zone, or layer.
4. Present source, date, precision, confidence, and limitations.
5. Connect important spatial evidence to a written finding.

## States

- Loading: preserve map region and identify loading layers.
- No layer data: explain missing coverage without implying no risk.
- Partial layers: identify available and unavailable evidence.
- Selected evidence: synchronize selected map feature and written detail.
- Map failure: preserve a text summary and source links.

## Responsive behavior

- Desktop: the map may be dominant when spatial evidence materially helps.
- Mobile: place the written summary before the map and provide a focused map view.
- Keep legends and controls reachable without covering essential map context.

## Accessibility

- Provide text alternatives for important map findings.
- Keep all layer and zoom controls keyboard operable.
- Pair colors and symbols with labels.

## Decision safety

- Show source precision and date.
- Do not imply boundary or marker precision beyond source accuracy.
- A blank map does not mean no risk.

## Rules

- Maps are evidence interfaces, not decorative backdrops.
- Never omit the legend or text summary.
- Do not place essential evidence only inside a hover interaction.
