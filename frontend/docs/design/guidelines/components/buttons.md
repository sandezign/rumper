# Buttons and Actions

## Available components

`Button`, `IconButton`, `ButtonGroup`, `CopyButton`, and `DownloadButton`.
Build from the application-owned shadcn/ui `Button`.

## When to use

- Use buttons to trigger actions; use links for navigation.
- Use one primary button per visible section or decision point.
- Use icon buttons only for familiar, repeated actions with accessible names.

## When not to use

- Do not use buttons as status labels or decorative pills.
- Do not use disabled buttons without explaining how to enable them.
- Do not use bright green to imply positive evidence.

## Anatomy

```text
[leading icon] Label [trailing icon or progress]
```

Use a visible label by default. Icon-only buttons require a tooltip and
accessible name.

## Token mapping

| Property | Primary | Secondary | Ghost | Destructive |
|---|---|---|---|---|
| Background | `brand-green` | `surface-canvas` | transparent | `semantic-danger` |
| Text | `text-on-primary` | `text-primary` | `text-primary` | white |
| Border | none | `border-strong` | none | none |
| Radius | `radius-full` | `radius-full` | `radius-md` | `radius-full` |
| Type | `text-button` | `text-button` | `text-button` | `text-button` |

## Variants

- **Primary:** main action, one per section.
- **Secondary:** supporting action beside or below primary.
- **Ghost:** low-emphasis local action.
- **Link:** navigation or source access.
- **Destructive:** irreversible or risky action with explicit consequence.
- **On-dark:** primary or outlined action on deep teal.

## Sizes

| Size | Minimum height | Icon | Usage |
|---|---:|---:|---|
| Default | 44px | 20px | Most actions |
| Large | 48px | 20px | Marketing or major CTA |
| Icon | 44x44px | 20px | Icon-only action |

Do not create compact buttons below the minimum touch target.

## States

Define default, hover, focus-visible, pressed, loading, and disabled states.
Loading buttons retain width, use `aria-busy`, and keep a meaningful name.
State priority: disabled, loading, pressed, focus, hover, default.

## Behavior and interaction

- Use action-specific Bahasa Indonesia labels such as "Periksa lokasi ini".
- Confirm destructive actions when consequences are not easily reversible.
- Keep grouped actions closely related and visually ordered by importance.

## Responsive behavior

Stack action groups on mobile when labels would wrap or touch targets become
crowded. Keep the primary action first in reading order and full-width only
when it improves completion.

## Accessibility

- Keep targets at least 44x44px.
- Show a visible focus ring.
- Give icon-only buttons an accessible name and tooltip.
- Announce loading and completion when the result is not otherwise visible.

## Content guidance

Use verbs that state the result: "Tinjau bukti", "Unduh laporan", or "Salin
ID sumber". Avoid vague labels such as "Lanjut", "Ya", or "Klik di sini".

## Decision tree

```text
Main action? -> Primary
Supporting action? -> Secondary
Low-emphasis local action? -> Ghost
Navigation or source? -> Link
Irreversible action? -> Destructive
```

## Correct examples

```tsx
<Button>Periksa lokasi ini</Button>
<Button variant="secondary">Lihat metodologi</Button>
```

## Incorrect examples

```tsx
<Button>Lanjut</Button>
<Button className="bg-green-500">Aman</Button>
```

## Rules

- One primary action per section.
- Preserve approved variants and tokens.
- Never communicate evidence status with button color.

## Related components and foundations

Read `../../foundations/tokens.md`, `../../foundations/styles.md`,
`feedback-states.md`, and `navigation.md`.
