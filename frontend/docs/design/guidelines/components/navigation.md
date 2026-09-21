# Navigation

## Available components

`TopNavigation`, `MobileNavigation`, `Breadcrumb`, `FooterNavigation`,
`Pagination`, and supporting links or sheets.

## When to use

- Use top navigation for marketing and application-level destinations.
- Use breadcrumbs for deep report, evidence, or methodology hierarchy.
- Use pagination for long result sets.

## When not to use

- Do not use tabs as application-level navigation.
- Do not hide the primary user task in an overflow menu.
- Do not show desktop navigation unchanged on mobile.

## Anatomy

```text
Brand | primary destinations | utility actions | primary CTA
```

## Token mapping

Use `surface-canvas` or `brand-teal-deep`, `text-primary` or `text-on-dark`,
`border-default`, `space-md`, and approved button tokens.

## Variants

- **Top navigation:** primary destinations and CTA.
- **Mobile navigation:** sheet with the same destination order.
- **Breadcrumb:** current hierarchy, not interaction history.
- **Footer navigation:** grouped secondary and legal destinations.
- **Pagination:** long evidence and report result sets.

## Sizes

Keep navigation controls at least 44px high. Use a maximum of five primary
destinations before grouping secondary items.

## States

Define default, hover, focus-visible, active/current, expanded, and disabled
states. Current location must not rely on color alone.

## Behavior and interaction

Collapse full navigation below 1024px. Preserve destination order between
desktop and mobile. Breadcrumb links navigate; the current item is not linked.

## Responsive behavior

Use `MobileNavigation` below 1024px. Keep the primary CTA discoverable without
covering content.

## Accessibility

Use semantic `nav`, accessible labels for multiple navigation regions,
`aria-current`, keyboard-operable menus, and managed focus in sheets.

## Content guidance

Use short destination nouns. Keep labels consistent across desktop, mobile,
breadcrumbs, and footer.

## Decision tree

```text
App or marketing destination? -> TopNavigation
Mobile destinations? -> MobileNavigation
Deep hierarchy? -> Breadcrumb
Peer content views? -> Tabs
Long result set? -> Pagination
```

## Correct examples

```tsx
<nav aria-label="Navigasi utama">...</nav>
<Breadcrumb aria-label="Lokasi laporan">...</Breadcrumb>
```

## Incorrect examples

```tsx
<Tabs>Produk / Harga / Tentang</Tabs>
```

## Rules

- Preserve hierarchy and reading order.
- Keep the current destination visible.
- Do not use navigation patterns for local actions.

## Related components and foundations

Read `tabs.md`, `buttons.md`, and `../../foundations/styles.md`.
