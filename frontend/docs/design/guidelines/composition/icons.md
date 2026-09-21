# Icon Composition

## Icon relationships

Icons support labels, actions, navigation, map evidence, and semantic states.
They do not replace clear language.

## Placement patterns

| Pattern | Placement |
|---|---|
| Button icon | Before label by default; after label for forward/export action |
| Section status | Before heading with visible status text |
| Assistant identity | Before assistant label and beside assistant messages |
| Map legend | Before each visible layer label |
| Finding marker | Beside finding title or within labeled evidence visualization |
| Input action | Trailing position with accessible name |

## Canonical workspace icons

- Global actions use a single icon plus visible label.
- Assistant identity uses a consistent AI icon but must include "AI" text.
- Map legends use shapes and labels, not color dots alone.
- Property markers remain visually distinct from risk and evidence markers.
- Status icons use semantic tokens and visible text.

## Spacing

- Use 4-8px between icon and compact label.
- Use 8-12px between icon and button label.
- Use 12-16px between status icon and a larger content block.

## Color

Icons inherit text color through `currentColor`. Use semantic color only when
the icon is paired with matching visible text.

## Responsive behavior

Keep meaningful icons stable in size. Remove decorative icons before hiding
labels. Never reduce a labeled global action to an ambiguous icon without an
accessible alternate.

## Accessibility

- Meaningful icons need visible text or an accessible name.
- Decorative icons use `aria-hidden="true"`.
- Icon-only buttons need a tooltip and `aria-label`.
- Map legend symbols need text labels.

## Correct examples

- Share icon followed by "Bagikan laporan".
- Orange warning icon followed by "Perlu validasi".
- Property marker visually and textually distinct from risk layers.

## Incorrect examples

- Three colored map dots without labels.
- Sparkle icon used to imply AI output is verified.
- An unlabeled headset icon for expert review.

## Rules

- Use Lucide icons only.
- Keep icon meaning consistent.
- Pair semantic and map icons with labels.
- Read `../components/icons.md` before implementation.
