# Rumper Design Tokens

This is the master token catalog for Rumper interfaces. Use these tokens for
all React, Tailwind CSS v4, shadcn/ui, Figma Make, and AI-generated work.

Tokens follow three layers:

```text
Primitive values -> Semantic purpose -> Component tokens
```

Use semantic or component tokens in interface code. Primitive values exist to
define the system and must not be used directly inside components.

## Naming pattern

Rumper tokens follow:

```text
--{category}-{role}
```

| Category | Examples | Purpose |
|---|---|---|
| `brand-*` | `green`, `green-hover`, `teal-deep` | Brand identity and actions |
| `surface-*` | `canvas`, `soft`, `feature`, `dark` | Page and content surfaces |
| `text-*` | `primary`, `secondary`, `muted`, `on-dark` | Text hierarchy |
| `border-*` | `default`, `soft`, `strong`, `dark` | Component boundaries and dividers |
| `semantic-*` | `positive`, `warning`, `danger`, `unknown` | Evidence and system states |
| `space-*` | `xs`, `md`, `section`, `hero` | Layout rhythm |
| `radius-*` | `sm`, `lg`, `full` | Shape hierarchy |
| `shadow-*` | `subtle`, `raised`, `overlay` | Elevation hierarchy |
| `motion-*` | `press`, `interactive`, `reveal` | Interaction timing |
| `breakpoint-*` | `sm`, `md`, `lg`, `xl` | Responsive behavior |

## Tailwind CSS v4 mapping

Map semantic tokens through `@theme inline` in `src/index.css`. Use the
generated utilities instead of hardcoded values.

```css
@theme inline {
  --font-sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;

  --color-background: var(--surface-canvas);
  --color-foreground: var(--text-primary);
  --color-primary: var(--brand-green);
  --color-primary-foreground: var(--text-on-primary);
  --color-surface: var(--surface-default);
  --color-surface-soft: var(--surface-soft);
  --color-surface-feature: var(--surface-feature);
  --color-surface-dark: var(--surface-dark);
  --color-border: var(--border-default);
  --color-ring: var(--border-focus);
  --color-brand-green-hover: var(--brand-green-hover);
  --color-brand-green-pressed: var(--brand-green-pressed);
  --color-brand-green-dark: var(--brand-green-dark);
  --color-brand-green-soft: var(--brand-green-soft);
  --color-brand-teal-deep: var(--brand-teal-deep);
  --color-brand-teal: var(--brand-teal);
  --color-brand-teal-mid: var(--brand-teal-mid);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary: var(--text-tertiary);
  --color-text-on-dark: var(--text-on-dark);
  --color-text-on-dark-muted: var(--text-on-dark-muted);
  --color-border-soft: var(--border-soft);
  --color-border-strong: var(--border-strong);
  --color-border-dark: var(--border-dark);
  --color-semantic-positive: var(--semantic-positive);
  --color-semantic-positive-bg: var(--semantic-positive-bg);
  --color-semantic-positive-text: var(--semantic-positive-text);
  --color-semantic-warning: var(--semantic-warning);
  --color-semantic-warning-bg: var(--semantic-warning-bg);
  --color-semantic-warning-text: var(--semantic-warning-text);
  --color-semantic-danger: var(--semantic-danger);
  --color-semantic-danger-bg: var(--semantic-danger-bg);
  --color-semantic-danger-text: var(--semantic-danger-text);
  --color-semantic-unknown: var(--semantic-unknown);
  --color-semantic-unknown-bg: var(--semantic-unknown-bg);
  --color-semantic-unknown-text: var(--semantic-unknown-text);

  --spacing-xxs: var(--space-xxs);
  --spacing-xs: var(--space-xs);
  --spacing-sm: var(--space-sm);
  --spacing-md: var(--space-md);
  --spacing-lg: var(--space-lg);
  --spacing-xl: var(--space-xl);
  --spacing-2xl: var(--space-2xl);
  --spacing-3xl: var(--space-3xl);
  --spacing-section-sm: var(--space-section-sm);
  --spacing-section: var(--space-section);
  --spacing-section-lg: var(--space-section-lg);
  --spacing-hero: var(--space-hero);

  --radius-xs: var(--radius-xs);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-2xl: var(--radius-2xl);
}
```

## Known collision: named spacing vs. `max-w-*`

Our spacing scale uses t-shirt names (`--spacing-xs … --spacing-3xl`) so `p-md`, `gap-xs`,
`px-xl` work — over a thousand usages depend on it. Tailwind resolves `max-w-<name>` against
**`--spacing-*` before `--container-*`**, so those keys shadow the container scale:
`max-w-xl` computed to `--space-xl` (24px) instead of 36rem, and every `max-w-xs…3xl` in the
app was affected.

Declaring `--container-*` in `@theme` does **not** fix it — spacing still wins. Renaming the
spacing tokens would touch every existing screen. The fix is a block of **unlayered**
`.max-w-*` rules at the end of `src/index.css`; unlayered CSS beats anything in
`@layer utilities`, so they win regardless of source order.

Consequences to remember:

- Adding a responsive variant (`md:max-w-lg`) requires adding it to that block too — the
  unlayered override would otherwise beat it.
- Prefer `max-w-*` for widths and the named scale only for padding/gap, so the two
  namespaces stay conceptually separate.

The revamp's utility names (`bg-canvas-white`, `text-deep-teal`, `bg-soft-green`,
`text-tertiary-ink`, `border-subtle-border`, `bg-evidence-positive-bg`, …) are **aliases**
declared in `@theme inline` onto the tokens above — they add no new colours, so the palette
still has one source of truth. Motion utilities used by the revamp
(`animate-orbit-spin`, `animate-float-1…5`, `animate-check-pop`, …) are plain CSS classes
at the end of `src/index.css`, each disabled under `prefers-reduced-motion`.

Define the complete primitive and semantic variable values in `:root` and
`.dark` before `@theme inline`. Define composite typography classes as shared
utilities in the same global stylesheet; do not recreate them inside
components.

Examples:

```tsx
<section className="bg-surface-feature px-xl py-section">
  <div className="rounded-lg border border-border bg-background p-xl">
    <h2 className="text-heading-2 text-foreground">Ringkasan lokasi</h2>
  </div>
</section>
```

Do not use arbitrary Tailwind values such as `bg-[#00ed64]`, `p-[22px]`, or
`rounded-[13px]` when a token exists.

# Color Tokens

## Color palette overview

Rumper uses a dual-mode palette built from white and pale-green reading
surfaces, deep-teal framing regions, and bright-green primary actions.

| Role | Value | Token | Frequency | Usage |
|---|---:|---|---|---|
| White canvas | `#ffffff` | `--surface-canvas` | Dominant | Page, card, table, and reading surfaces |
| Soft surface | `#f9fbfa` | `--surface-default` | Frequent | Quiet sections and controls |
| Feature surface | `#e3fcef` | `--surface-feature` | Selective | Non-semantic feature emphasis |
| Deep teal | `#001e2b` | `--brand-teal-deep` | Selective | Heroes, major CTAs, footer |
| Bright green | `#00ed64` | `--brand-green` | Sparse | Primary actions and brand accents |
| Primary ink | `#001e2b` | `--text-primary` | Dominant | Headings and body text |
| Hairline | `#e1e5e8` | `--border-default` | Frequent | Cards, dividers, quiet controls |

Bright `brand-green` is an action and identity color. It does not mean safe,
verified, approved, positive evidence, or low risk.

## Brand tokens

| Token | Value | Tailwind | Usage |
|---|---:|---|---|
| `--brand-green` | `#00ed64` | `bg-primary`, `text-primary` | Primary actions and small accents |
| `--brand-green-hover` | `#00b545` | `bg-brand-green-hover` | Primary hover state |
| `--brand-green-pressed` | `#008c34` | `bg-brand-green-pressed` | Primary pressed state |
| `--brand-green-dark` | `#00684a` | `text-brand-green-dark` | Links and visible focus treatment |
| `--brand-green-soft` | `#c3f0d2` | `bg-brand-green-soft` | Non-semantic supporting tint |
| `--brand-teal-deep` | `#001e2b` | `bg-brand-teal-deep` | Heroes, major CTAs, footer |
| `--brand-teal` | `#003d4f` | `bg-brand-teal` | Supporting dark panels |
| `--brand-teal-mid` | `#00684a` | `bg-brand-teal-mid` | Restrained dark-surface accent |

## Surface tokens

| Token | Value | Tailwind | Usage |
|---|---:|---|---|
| `--surface-canvas` | `#ffffff` | `bg-background` | Page and primary reading surface |
| `--surface-default` | `#f9fbfa` | `bg-surface` | Quiet section or control background |
| `--surface-soft` | `#f4f7f6` | `bg-surface-soft` | Recessed or secondary grouping |
| `--surface-feature` | `#e3fcef` | `bg-surface-feature` | Feature emphasis, never semantic success |
| `--surface-dark` | `#001e2b` | `bg-surface-dark` | Dark content framing |
| `--surface-overlay` | `#ffffff` | `bg-surface-overlay` | Dialogs, popovers, menus |
| `--surface-scrim` | `rgba(0,30,43,0.56)` | `bg-surface-scrim` | Modal backdrop |

## Text tokens

| Token | Value | Tailwind | Usage |
|---|---:|---|---|
| `--text-primary` | `#001e2b` | `text-foreground` | Primary content |
| `--text-secondary` | `#3d4f5b` | `text-text-secondary` | Supporting content |
| `--text-tertiary` | `#5c6c7a` | `text-text-tertiary` | Metadata and low-priority content |
| `--text-muted` | `#7c8c9a` | `text-muted-foreground` | Placeholders and disabled labels |
| `--text-on-primary` | `#001e2b` | `text-primary-foreground` | Text on bright-green primary action |
| `--text-on-dark` | `#ffffff` | `text-text-on-dark` | Primary text on deep teal |
| `--text-on-dark-muted` | `#a8b3bc` | `text-text-on-dark-muted` | Supporting text on deep teal |

## Border tokens

| Token | Value | Tailwind | Usage |
|---|---:|---|---|
| `--border-default` | `#e1e5e8` | `border-border` | Default card and divider |
| `--border-soft` | `#eceff1` | `border-border-soft` | Quiet separator |
| `--border-strong` | `#c1ccd6` | `border-border-strong` | Inputs and interactive boundaries |
| `--border-dark` | `#1c2d38` | `border-border-dark` | Boundaries on deep teal |
| `--border-focus` | `#00684a` | `ring-ring`, `border-ring` | Focus and selected state |

## Semantic status tokens

Semantic colors always require visible text and icons.

| Role | Base | Background | Text | Usage |
|---|---:|---:|---:|---|
| Positive | `#318266` | `#dceee7` | `#155641` | Verified supporting evidence only |
| Warning | `#d79a2b` | `#fff8e0` | `#714900` | Validation required or caution |
| Danger | `#c95746` | `#f4ded9` | `#7d3025` | Confirmed high-risk or destructive state |
| Unknown | `#5c6c7a` | `#f4f7f6` | `#3d4f5b` | Missing, incomplete, or unresolved evidence |

Use these token groups:

```text
semantic-positive, semantic-positive-bg, semantic-positive-text
semantic-warning, semantic-warning-bg, semantic-warning-text
semantic-danger, semantic-danger-bg, semantic-danger-text
semantic-unknown, semantic-unknown-bg, semantic-unknown-text
```

## Color decision trees

### Background color

```text
What background should I use?
|
|-- Page, card, evidence table, or long-form reading?
|   `-- bg-background
|
|-- Quiet section or control grouping?
|   `-- bg-surface
|
|-- Recessed secondary grouping?
|   `-- bg-surface-soft
|
|-- Important feature emphasis without status meaning?
|   `-- bg-surface-feature
|
|-- Hero, major CTA, or footer?
|   `-- bg-brand-teal-deep
|
|-- Primary action?
|   `-- bg-primary + text-primary-foreground
|
`-- Evidence or system status?
    `-- Appropriate semantic background + semantic text + icon
```

### Text color

```text
What text color should I use?
|
|-- Primary content users must read?
|   `-- text-foreground
|
|-- Supporting explanation?
|   `-- text-text-secondary
|
|-- Metadata or tertiary content?
|   `-- text-text-tertiary
|
|-- Placeholder or disabled content?
|   `-- text-muted-foreground
|
|-- Text on bright-green primary action?
|   `-- text-primary-foreground
|
|-- Text on deep teal?
|   `-- text-text-on-dark or text-text-on-dark-muted
|
`-- Semantic state?
    `-- Appropriate semantic text token
```

### Border color

```text
What border should I use?
|
|-- Standard card or divider?
|   `-- border-border
|
|-- Quiet separator?
|   `-- border-border-soft
|
|-- Input or interactive boundary?
|   `-- border-border-strong
|
|-- Focused or selected control?
|   `-- border-ring + visible focus ring
|
|-- Boundary on a dark surface?
|   `-- border-border-dark
|
`-- Large layout region?
    `-- Prefer surface contrast; avoid unnecessary borders
```

## Color rules

- Never use raw hex values inside components.
- Never use `brand-green` as semantic positive.
- Never rely on color alone for risk, confidence, validation, or status.
- Use white surfaces for evidence tables and long-form reading.
- Use `surface-feature` for feature emphasis only.
- Do not use bright green or semantic colors as large section backgrounds.
- Pair dark surfaces with `text-on-dark` tokens.

# Typography Tokens

## Font families

Rumper uses DM Sans for all display, body, labels, and controls.

| Family | Token | Tailwind | Usage |
|---|---|---|---|
| DM Sans | `font-sans` | `font-sans` | All customer-facing and UI text |
| DM Sans | `font-display` | `font-display` | Display and heading semantics |
| System monospace | `font-mono` | `font-mono` | Evidence IDs, source IDs, timestamps, aligned technical values |

Do not require Euclid Circular A or Fraunces. Do not use monospace for ordinary
body copy.

## Composite type scale

Always use composite typography classes. Do not set font size, weight, and
line height independently.

| Class | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---:|---:|---:|---:|---|
| `text-hero-display` | 72px | 500 | 1.10 | -1.5px | Wide-desktop marketing hero |
| `text-display-lg` | 56px | 500 | 1.15 | -1px | Major section opener |
| `text-heading-1` | 48px | 500 | 1.20 | -0.5px | Page-level heading |
| `text-heading-2` | 36px | 500 | 1.25 | -0.5px | Major section heading |
| `text-heading-3` | 28px | 500 | 1.30 | normal | Card or report-section heading |
| `text-heading-4` | 22px | 500 | 1.35 | normal | Feature or subsection heading |
| `text-heading-5` | 18px | 600 | 1.40 | normal | Compact card heading |
| `text-subtitle` | 18px | 400 | 1.50 | normal | Lead or hero supporting copy |
| `text-body` | 16px | 400 | 1.55 | normal | Primary body text |
| `text-body-medium` | 16px | 500 | 1.55 | normal | Emphasized body text |
| `text-body-sm` | 14px | 400 | 1.50 | normal | Supporting body and tables |
| `text-body-sm-medium` | 14px | 500 | 1.50 | normal | Controls and active labels |
| `text-caption` | 13px | 400 | 1.40 | normal | Captions and metadata |
| `text-caption-bold` | 13px | 600 | 1.40 | normal | Badges and compact labels |
| `text-micro` | 12px | 500 | 1.40 | normal | Fine metadata |
| `text-micro-uppercase` | 11px | 600 | 1.40 | 1px | Eyebrows and category labels |
| `text-button` | 14px | 600 | 1.30 | normal | Button labels |
| `text-code` | 14px | 400 | 1.55 | normal | Evidence IDs and technical values |

Responsive display sizes:

| Viewport | Hero display | Heading 1 |
|---|---:|---:|
| `< 480px` | 36px | 32px |
| `480-767px` | 48px | 40px |
| `768-1279px` | 56px | 44px |
| `>= 1280px` | 72px | 48px |

## Typography decision tree

```text
What typography class should I use?
|
|-- Marketing hero?
|   `-- text-hero-display
|
|-- Page title?
|   `-- text-heading-1
|
|-- Major section heading?
|   `-- text-heading-2
|
|-- Card or report-section heading?
|   `-- text-heading-3, text-heading-4, or text-heading-5
|
|-- Lead or supporting introduction?
|   `-- text-subtitle
|
|-- Primary body content?
|   `-- text-body
|
|-- Supporting content or table cell?
|   `-- text-body-sm
|
|-- Badge or compact label?
|   `-- text-caption-bold
|
|-- Eyebrow or category label?
|   `-- text-micro-uppercase
|
|-- Button label?
|   `-- text-button
|
`-- Evidence ID, source ID, timestamp, or aligned technical value?
    `-- text-code + font-mono
```

## Typography patterns

```tsx
<header>
  <p className="text-micro-uppercase text-brand-green-dark">
    Pemeriksaan lokasi
  </p>
  <h1 className="text-heading-1 text-foreground">
    Pahami lokasi sebelum membayar DP
  </h1>
  <p className="text-subtitle text-text-secondary">
    Tinjau bukti, keterbatasan, dan langkah berikutnya.
  </p>
</header>
```

```tsx
<section>
  <h2 className="text-heading-3 text-foreground">Risiko banjir</h2>
  <p className="text-body text-text-secondary">Bukti dan interpretasi...</p>
  <code className="font-mono text-code text-text-tertiary">SRC-2026-0042</code>
</section>
```

## Typography rules

- Use composite classes; never assemble arbitrary font size and line height.
- Use DM Sans for all standard UI text.
- Use sentence case for headings, buttons, navigation, and labels.
- Use uppercase only for `text-micro-uppercase`.
- Keep body copy at 16px by default and no smaller than 14px for supporting
  content.
- Keep long-form text between approximately 55 and 75 characters per line.
- Use weight and spacing before adding color for hierarchy.

# Spacing Tokens

## Spacing scale

Rumper uses a 4px base unit with 8px as the primary increment.

| Token | Value | Tailwind examples | Usage |
|---|---:|---|---|
| `space-xxs` | 4px | `gap-xxs`, `p-xxs` | Icon-to-label micro gap |
| `space-xs` | 8px | `gap-xs`, `p-xs` | Compact internal gap |
| `space-sm` | 12px | `gap-sm`, `p-sm` | Compact component padding |
| `space-md` | 16px | `gap-md`, `p-md` | Default internal spacing |
| `space-lg` | 20px | `gap-lg`, `p-lg` | Comfortable component spacing |
| `space-xl` | 24px | `gap-xl`, `p-xl` | Standard card padding |
| `space-2xl` | 32px | `gap-2xl`, `p-2xl` | Feature card or panel padding |
| `space-3xl` | 40px | `gap-3xl`, `p-3xl` | Large content grouping |
| `space-section-sm` | 48px | `py-section-sm` | Compact section separation |
| `space-section` | 64px | `py-section` | Default section separation |
| `space-section-lg` | 96px | `py-section-lg` | Marketing section separation |
| `space-hero` | 120px | `py-hero` | Wide-desktop hero spacing only |

## Spacing decision tree

```text
What spacing should I use?
|
|-- Icon to adjacent label?
|   `-- gap-xxs or gap-xs
|
|-- Controls inside a compact component?
|   `-- gap-sm or gap-md
|
|-- Standard card padding?
|   `-- p-xl
|
|-- Feature panel padding?
|   `-- p-2xl
|
|-- Related content groups?
|   `-- gap-xl or gap-2xl
|
|-- Major sections?
|   `-- py-section-sm, py-section, or py-section-lg
|
`-- Wide-desktop marketing hero?
    `-- py-hero
```

## Container and gutter tokens

| Token | Value | Usage |
|---|---:|---|
| `container-max` | 1280px | Maximum page width |
| `gutter-mobile` | 16px | Mobile page gutter |
| `gutter-tablet` | 20px | Tablet page gutter |
| `gutter-desktop` | 32px | Desktop page gutter |
| `content-readable` | 720px | Long-form reading width |

## Spacing rules

- Use spacing tokens; never use arbitrary gaps or padding.
- Use 20px, 24px, or 32px padding for cards and panels.
- Keep related items closer than unrelated groups.
- Reduce section spacing on smaller screens.
- Preserve useful whitespace; do not fill empty space with decoration.
- Align related content to a shared grid.

# Radius Tokens

## Radius scale

Aligned to the revamped UI on 2026-08-30 (docs/18 Wave 1) so ported markup renders as
designed. Previous values are shown for reference — every `rounded-*` in the app changed.

| Token | Value | Was | Tailwind | Usage |
|---|---:|---:|---|---|
| `radius-xs` | 4px | 4px | `rounded-xs` | Compact tags or internal details |
| `radius-sm` | 12px | 6px | `rounded-sm` | Badges and chips |
| `radius-md` | 14px | 8px | `rounded-md` | Inputs and compact panels |
| `radius-lg` | 16px | 12px | `rounded-lg` | Standard cards |
| `radius-xl` | 20px | 16px | `rounded-xl` | Feature panels |
| `radius-2xl` | 16px | 24px | `rounded-2xl` | Cards in the revamped surfaces |
| `radius-3xl` | 24px | — | `rounded-3xl` | Pills and large floating surfaces |
| `radius-full` | 9999px | 9999px | `rounded-full` | Buttons and status pills |

> **`xl` (20px) is deliberately larger than `2xl` (16px).** The reference derives
> `sm`–`xl` from a 1rem base and leaves `2xl`/`3xl` at Tailwind's defaults, so the scale is
> not monotonic. It is kept faithful because the revamp's markup is built against exactly
> these values; do not "fix" it without re-checking every ported surface.

## Radius rules

- Use `rounded-full` for primary and secondary buttons.
- Use `rounded-md` for form controls.
- Use `rounded-lg` for standard cards.
- Use `rounded-2xl` for cards on the revamped surfaces (wizard, workspace); `rounded-3xl`
  for large floating pills.
- Do not create arbitrary radii.
- Do not use pill shapes for large content containers.

# Elevation Tokens

## Elevation scale

| Token | Value | Usage |
|---|---|---|
| `shadow-flat` | `none` | Default cards, tables, page sections |
| `shadow-subtle` | `0 1px 2px rgba(0,30,43,0.04)` | Hover-raised tiles |
| `shadow-raised` | `0 4px 12px rgba(0,30,43,0.08)` | Raised cards and menus |
| `shadow-preview` | `0 12px 24px -4px rgba(0,30,43,0.12)` | Report previews and evidence popovers |
| `shadow-overlay` | `0 16px 48px -8px rgba(0,30,43,0.16)` | Dialogs and overlays |

## Elevation decision tree

```text
What elevation should I use?
|
|-- Default card, table, or page region?
|   `-- shadow-flat + border-border
|
|-- Hover-raised interactive tile?
|   `-- shadow-subtle
|
|-- Raised menu or important card?
|   `-- shadow-raised
|
|-- Report preview or evidence popover?
|   `-- shadow-preview
|
`-- Dialog or overlay?
    `-- shadow-overlay
```

## Elevation rules

- Use borders, spacing, and surface color before shadows.
- Default cards use no shadow.
- Do not apply elevation to every card.
- Stronger elevation means a more temporary or foreground layer.
- Do not use decorative glow effects.

# Motion Tokens

## Duration scale

| Token | Value | Usage |
|---|---:|---|
| `motion-press` | 100ms | Pressed-state feedback |
| `motion-interactive` | 180ms | Hover, focus, selected, and control transitions |
| `motion-reveal` | 260ms | Expand, collapse, and content reveal |
| `motion-emphasis` | 420ms | Rare major visual emphasis |
| `motion-stagger` | 40ms | Small sequence offset |

## Easing tokens

| Token | Value | Usage |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Common state transitions |
| `ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements entering or expanding |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving or collapsing |

## Motion rules

- Use motion to explain state change, not as decoration.
- Use `motion-interactive` for most interactions.
- Do not delay access to critical evidence.
- Avoid looping decorative motion and auto-advancing carousels.
- Respect `prefers-reduced-motion`.
- Reduced-motion mode must preserve all information and state feedback.

# Breakpoint Tokens

## Responsive scale

| Token | Range | Usage |
|---|---|---|
| `breakpoint-xs` | `< 480px` | Single-column mobile, 36px hero |
| `breakpoint-sm` | `480-767px` | Wide mobile, selective paired content |
| `breakpoint-md` | `768-1023px` | Tablet and two-column feature layouts |
| `breakpoint-lg` | `1024-1279px` | Full navigation and three-column comparisons |
| `breakpoint-xl` | `>= 1280px` | Full 1280px container and 72px hero |

## Responsive rules

- Start with a single-column mobile layout.
- Add selective two-column layouts from 768px.
- Show full navigation and three-column comparisons from 1024px.
- Use the full 1280px container only from 1280px.
- Move map and report visuals below explanatory copy on mobile.
- Preserve logical reading and keyboard order after reflow.
- Never allow horizontal page scrolling.

# Component Token Contracts

Component tokens combine semantic foundations. They do not introduce new raw
values.

| Component token | Required foundation mapping |
|---|---|
| `button-primary` | `brand-green`, `text-on-primary`, `text-button`, `radius-full`, minimum 44px target |
| `button-secondary` | transparent or canvas, `text-primary`, `border-strong`, `text-button`, `radius-full` |
| `input-default` | `surface-canvas`, `text-primary`, `border-strong`, `radius-md`, minimum 44px height |
| `input-focus` | `border-focus`, visible focus ring |
| `card-base` | `surface-canvas`, `border-default`, `radius-lg`, `space-xl`, `shadow-flat` |
| `card-feature` | approved surface, `radius-xl`, `space-2xl`, restrained elevation |
| `badge-semantic` | matching semantic background, text, icon, `radius-full` |
| `map-popover` | `surface-overlay`, `border-default`, `radius-lg`, `shadow-preview` |
| `report-preview` | `surface-canvas`, `radius-xl`, `shadow-preview` |
| `dialog` | `surface-overlay`, `radius-xl`, `shadow-overlay`, `surface-scrim` |

# Common Patterns

## Primary action

```tsx
<Button className="min-h-11 rounded-full bg-primary px-xl text-button text-primary-foreground">
  Periksa lokasi ini
</Button>
```

## Standard evidence card

```tsx
<article className="rounded-lg border border-border bg-background p-xl shadow-none">
  <p className="text-caption-bold text-text-tertiary">Sumber pemerintah</p>
  <h3 className="text-heading-5 text-foreground">Peta risiko banjir</h3>
  <p className="text-body-sm text-text-secondary">Ringkasan bukti...</p>
</article>
```

## Semantic warning

```tsx
<div className="rounded-md bg-semantic-warning-bg p-md text-semantic-warning-text">
  <span className="text-caption-bold">Perlu validasi lebih lanjut</span>
</div>
```

## Dark feature surface

```tsx
<section className="rounded-2xl bg-brand-teal-deep p-2xl text-text-on-dark">
  <h2 className="text-heading-2">Tinjau bukti sebelum mengambil keputusan</h2>
  <p className="text-body text-text-on-dark-muted">...</p>
</section>
```

# Token Rules

- Always use semantic or component tokens in interface code.
- Never use raw hex, arbitrary spacing, arbitrary radii, or arbitrary shadows
  when a token exists.
- Never use bright brand green as semantic positive.
- Pair every semantic color with visible text and icons.
- Use composite typography classes; do not independently assemble type styles.
- Use DM Sans for all standard UI text.
- Use monospace only for IDs, timestamps, and aligned technical values.
- Use the 4px spacing base and prefer 8px increments.
- Use flat bordered cards by default.
- Reserve shadows for raised or temporary layers.
- Use motion to explain changes and respect reduced-motion preferences.
- Do not introduce a new token until at least two components or compositions
  require the same value or role.
- Document intentional exceptions and keep them local.
