# Tabs and Segmented Controls

## Available components

`Tabs` and `SegmentedControl`, built from shadcn/ui `Tabs` and `ToggleGroup`.

## When to use

- Use tabs for peer views within the same context.
- Use segmented controls for two to five mutually exclusive display modes.

## When not to use

- Do not use tabs for app-level navigation or sequential steps.
- Do not hide safety-critical limitations in inactive tabs.
- Do not use tabs for more than five options.

## Anatomy

```text
Tab list: [active tab] [tab] [tab]
Tab panel: content for active peer view
```

## Token mapping

Use `text-body-sm-medium`, `border-default`, `border-focus`, `surface-canvas`,
and `motion-interactive`. Active states use text, indicator, and semantic
selection state, not color alone.

## Variants

- **Tabs:** peer content views with labeled panels.
- **Segmented control:** compact display-mode selection.

## Sizes

Controls must remain at least 44px high. Labels should stay on one line and
remain understandable.

## States

Define default, hover, focus-visible, active/selected, and disabled states.

## Behavior and interaction

Tabs support arrow-key navigation and correctly associate triggers with
panels. Preserve selection when appropriate.

## Responsive behavior

Allow contained horizontal scrolling or choose another control on mobile. Do
not truncate labels beyond comprehension.

## Accessibility

Preserve Radix tab semantics and keyboard behavior. Use visible focus and a
non-color active indicator.

## Content guidance

Use short, parallel nouns such as "Ringkasan", "Bukti", and "Metodologi".

## Decision tree

```text
Peer content views? -> Tabs
Two to five display modes? -> SegmentedControl
Sequential process? -> Use steps, not tabs
App destination? -> Navigation
```

## Correct examples

```tsx
<Tabs defaultValue="summary">...</Tabs>
```

## Incorrect examples

```tsx
<Tabs><TabsTrigger value="limits">Keterbatasan penting</TabsTrigger></Tabs>
```

## Rules

- Use two to five options.
- Never hide safety-critical content in inactive views.
- Do not use color alone for selection.

## Related components and foundations

Read `navigation.md`, `feedback-states.md`, and `../../foundations/styles.md`.
