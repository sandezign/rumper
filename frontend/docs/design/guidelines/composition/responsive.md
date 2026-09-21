# Responsive Composition

## Responsive strategy

The canonical desktop workspace transforms by task priority, not by simply
shrinking all three regions.

## Breakpoint behavior

| Width | Composition |
|---|---|
| `>= 1280px` | Full header + assistant rail + analysis workspace + map |
| `1024-1279px` | Analysis + map split; assistant opens as sheet |
| `768-1023px` | Analysis-first view with map as peer tab or full-width section |
| `< 768px` | Single-column analysis; assistant and map open as dedicated views |

## Wide desktop

- Keep all three regions visible.
- Keep the map at least 45% of the viewport.
- Keep assistant and analysis independently scrollable.
- Keep global header actions visible with labels.

## Compact desktop and tablet landscape

- Move the assistant into a sheet or collapsible supporting panel.
- Preserve the analysis + map relationship.
- Keep tabs and decision summary visible.
- Avoid narrowing analysis cards below readable width.

## Tablet

- Use an analysis-first layout.
- Offer map as a clearly labeled peer view or full-width section.
- Place assistant access in the header or local action area.
- Do not show three compressed columns.

## Mobile

Recommended reading order:

```text
Header
Location identity and status
Decision summary and limitations
Top findings
Map summary and map access
Evidence and actions
Assistant access
```

- Use a single column.
- Keep global actions in a menu or clearly labeled action group.
- Show the map as a dedicated full-width view or section.
- Keep the assistant as a dedicated view or bottom sheet, not a permanent rail.
- Keep touch targets at least 44x44px.

## Tabs and views

On smaller screens, tabs may switch between `Ringkasan`, `Bukti`, and `Peta`
only when safety-critical limitations remain visible in the summary. Do not
place limitations exclusively in a hidden tab.

## Tables, cards, and maps

- Collapse card grids to one column.
- Convert tables to prioritized columns or labeled record lists.
- Move map visuals below explanatory copy or into a dedicated view.
- Keep map legends visible and controls reachable.

## Responsive safety checks

- Preserve evidence and limitation meaning after reflow.
- Preserve logical keyboard and screen-reader order.
- Avoid horizontal page scrolling.
- Avoid fixed-height content panels on mobile.
- Do not let sticky actions cover findings or map controls.

## Correct examples

- Assistant rail becomes a sheet at compact desktop.
- Analysis and map become peer views on tablet.
- Mobile starts with decision summary and limitations.

## Incorrect examples

- Three 33% columns on tablet.
- Map hidden entirely on mobile with no text alternative.
- Assistant shown before the verified analysis summary.

## Rules

- Transform by task priority.
- Never compress all desktop regions into unusable columns.
- Preserve safety-critical content in the primary mobile flow.
