# Icons

## Available components

Use verified icons from `lucide-react`. Common roles include action, navigation,
status, evidence type, map marker, and decorative support.

## When to use

- Use icons to reinforce a visible label or communicate a familiar action.
- Use status icons with visible semantic text.
- Use icons to distinguish evidence and map-layer types.

## When not to use

- Do not replace clear labels with unfamiliar icons.
- Do not use icons as decoration when they add noise.
- Do not invent icon names or inline SVG replacements.

## Anatomy

```text
[icon] + optional visible label + optional accessible name
```

## Token mapping

Icons inherit `currentColor`. Use `text-primary`, `text-secondary`,
`text-on-dark`, or the appropriate semantic text token.

## Variants

- **Action:** interactive control icon.
- **Navigation:** reinforces a destination label.
- **Status:** paired with semantic label.
- **Evidence:** identifies source or evidence type.
- **Decorative:** hidden from assistive technology.

## Sizes

| Size | Usage |
|---:|---|
| 16px | Metadata and compact labels |
| 20px | Controls and navigation |
| 24px | Feature and status use |

## States

Interactive icons follow their parent control states. Status icons follow the
matching semantic state. Selected icons may use fill only when the meaning
remains clear.

## Behavior and interaction

Icons do not handle interaction independently; place them inside approved
buttons, links, tabs, or controls.

## Responsive behavior

Keep icon sizes stable across breakpoints. Remove nonessential decorative icons
before shrinking meaningful icons.

## Accessibility

- Meaningful icons need visible labels or accessible names.
- Decorative icons use `aria-hidden="true"`.
- Never rely on an icon alone for risk or evidence status.

## Content guidance

Choose the simplest icon that matches the meaning. Keep one icon meaning
consistent throughout the product.

## Decision tree

```text
Familiar action with no visible label? -> IconButton + tooltip + aria-label
Status? -> Semantic icon + visible text
Decoration only? -> aria-hidden
No verified Lucide icon? -> Choose another verified icon
```

## Correct examples

```tsx
<Search aria-hidden="true" />
<Button aria-label="Salin ID sumber"><Copy aria-hidden="true" /></Button>
```

## Incorrect examples

```tsx
<UnknownIcon />
<AlertTriangle className="text-yellow-500" />
```

## Rules

- Use Lucide only.
- Verify icon names before use.
- Use approximately 2px outlined strokes consistently.

## Related components and foundations

Read `../../foundations/icon-discovery.md`, `buttons.md`, `badges.md`, and
`maps.md`.
