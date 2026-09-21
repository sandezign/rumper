# Icon Discovery

Lucide is the approved Rumper icon system. Use icons from `lucide-react` and
verify that every icon exists before writing code.

## Discovery workflow

Before using an icon:

1. Identify the icon's exact purpose: action, navigation, status, evidence,
   map, or decoration.
2. Search the official Lucide icon catalog or installed `lucide-react`
   exports.
3. Verify the exact exported React component name.
4. Prefer the simplest icon that matches the meaning.
5. Import the verified icon directly from `lucide-react`.
6. Add visible text or an accessible name.
7. If no suitable icon exists, choose another verified icon instead of
   inventing one.

Do not guess icon names.

## Static imports

Use direct named imports for icons known during development. Direct imports are
tree-shakable and include only imported icons in the final bundle.

```tsx
import { Headphones, MapPin, Search, Share2 } from "lucide-react"
```

```tsx
<Search aria-hidden="true" />
<Button>
  <Share2 aria-hidden="true" />
  Bagikan laporan
</Button>
```

Do not import the complete icon library or use dynamic loading for static
icons.

## Dynamic icons

Use dynamic icon loading only when the icon name is genuinely supplied at
runtime, such as trusted configuration or CMS data.

Validate the name and provide a fallback:

```tsx
import { CircleHelp } from "lucide-react"
import { DynamicIcon } from "lucide-react/dynamic"

function ConfiguredIcon({ name }: { name?: string }) {
  if (!name) return <CircleHelp aria-hidden="true" />
  return <DynamicIcon name={name} aria-hidden="true" />
}
```

Do not allow unvalidated runtime icon names to break a screen.

## Approved sizes

| Size | Usage |
|---:|---|
| 16px | Compact metadata and badges |
| 20px | Controls, buttons, and navigation |
| 24px | Feature, status, and map use |

Lucide defaults to `currentColor` and approximately 2px stroke width. Preserve
this system unless a documented component guideline requires otherwise.

## Semantic roles

| Purpose | Selection guidance |
|---|---|
| Primary action | Familiar action icon paired with visible label |
| Icon-only action | Familiar icon with tooltip and accessible name |
| Navigation | Destination icon paired with destination label |
| Risk or status | Icon paired with semantic text and color |
| Evidence source | Stable icon representing the source category |
| Property marker | Visually distinct property/location icon |
| Decoration | Restrained icon hidden from assistive technology |

## Rumper icon vocabulary

These are preferred starting points, subject to verification against the
installed Lucide version:

| Meaning | Preferred icon |
|---|---|
| Property or target location | `MapPin`, `House` |
| Search or inspect | `Search` |
| Share report | `Share2` |
| Expert review | `Headphones` or `UserRoundCheck` |
| Evidence source | `FileText`, `Database`, `Landmark` |
| Warning or validation required | `TriangleAlert` |
| Confirmed danger | `OctagonAlert` |
| Incomplete or unknown | `CircleHelp` |
| Verified review state | `BadgeCheck` |
| Map layers | `Layers` |
| External source | `ExternalLink` |
| Copy identifier | `Copy` |
| Download report | `Download` |

Verify the exact exported name before importing it. Availability may differ by
installed Lucide version.

## Accessibility

- Decorative icons use `aria-hidden="true"`.
- Meaningful icons need visible text or an accessible name.
- Icon-only buttons require an `aria-label` and tooltip.
- Do not rely on an icon alone for risk, confidence, validation, or map
  meaning.
- Do not repeat visible label text through an unnecessary icon title.

## Correct examples

```tsx
import { TriangleAlert } from "lucide-react"

<div className="text-semantic-warning-text">
  <TriangleAlert aria-hidden="true" />
  <span>Perlu validasi lebih lanjut</span>
</div>
```

## Incorrect examples

```tsx
import { RiskSafeVerifiedIcon } from "lucide-react"

<button><Share2 /></button>
```

The first example guesses a nonexistent or unverified icon. The second has no
visible label, tooltip, or accessible name.

## Rules

- Use `lucide-react` only.
- Verify every icon name before use.
- Prefer direct named imports for static icons.
- Use dynamic icons only for genuine runtime names with validation and
  fallback.
- Use `currentColor` and the approved size scale.
- Pair semantic and map icons with visible labels.
- Never create inline SVG replacements when an approved icon exists.
