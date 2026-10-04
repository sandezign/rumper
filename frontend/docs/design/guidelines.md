# Rumper UI Design System Guidelines

## Product character

This is a **B2C property decision-support** product with a **calm, structured,
evidence-led** UI style.

- **Density**: Balanced — breathable marketing and intake surfaces, with
  compact but readable dashboards, evidence views, maps, and reports.
- **Surface strategy**: Dual-mode — white `surface-canvas` and pale-green
  `surface-feature` content areas paired with deep-teal `brand-teal-deep` hero,
  CTA, and footer regions. Flat bordered cards create structure; dark surfaces
  create emphasis.
- **Color palette**: Mostly neutral white, soft green, and deep teal surfaces.
  Bright `brand-green` is used sparingly for primary actions, active states,
  and small brand accents only. It must never imply that evidence is positive,
  verified, low-risk, or safe.
- **Typography**: DM Sans for display, body, labels, and controls. Use
  monospace only for evidence IDs, source identifiers, timestamps, and aligned
  technical values.
- **Corner style**: Compact (`rounded-md` 8px for inputs and compact panels,
  `rounded-lg` 12px for standard cards, `rounded-xl` 16px for feature panels,
  `rounded-2xl` 24px for major showcases, and `rounded-full` for buttons and
  status pills).
- **Elevation**: Border-driven — default cards use `border-default` borders and no
  shadow. Shadows are reserved for raised report previews, evidence popovers,
  menus, dialogs, and overlays.
- **Voice**: Buyer-first, calm, clear, and actionable. Protect, do not
  frighten. State what is known, uncertain, limited, and actionable.

## Reading order

**MUST READ before writing any code:**
1. This file (`guidelines.md`) — product character, rules, and workflows
2. `foundations/setup.md` — token usage, providers, CSS imports, and build
   configuration
3. `foundations/overview.md` — foundation catalog and reading router
4. `foundations/styles.md` and `foundations/tokens.md` — visual guidance and
   exact technical tokens
5. `guidelines/components.md` — component discovery and source-of-truth rules
6. `guidelines/components/overview.md` — full component catalog and alternative
   names
7. `guidelines/patterns/overview.md` — recurring multi-component task patterns
8. `guidelines/composition/overview.md` — page-level layout and hierarchy

**Read on-demand:**
- `guidelines/components/{name}.md` — read BEFORE using that component
- `guidelines/patterns/{name}.md` — read before implementing a recurring task
  or workflow
- `guidelines/composition/` — read when building page-level layouts or
  arranging regions
- `foundations/icon-discovery.md` — read before selecting or adding an icon
- `mongodb/DESIGN.md` — read when resolving visual-direction or token conflicts

## Workflows

### Before using a component
1. Read `guidelines/components.md` for discovery and API source-of-truth rules
2. Check `guidelines/components/overview.md` for the component catalog
3. Read `guidelines/components/{name}.md` for the specific component category
4. Verify the actual export and properties in application source
5. Follow its anatomy, token mapping, variants, states, responsive behavior,
   accessibility, content rules, and anti-patterns
6. Reuse an approved variant before creating a new one
7. Do NOT write code using a component until you have read its guidelines file

### Before using a pattern
1. Check `guidelines/patterns/overview.md` for the recurring task
2. Read `guidelines/patterns/{name}.md` for its required information order,
   components, states, responsive behavior, and safety rules
3. Read every component guideline referenced by the pattern
4. Use composition guidelines to place the pattern on the page
5. Do NOT redefine a pattern as a one-off component or page-specific behavior

### Before using an icon
1. Check `foundations/icon-discovery.md` for the approved icon family and
   available icons
2. Do NOT guess icon names — verify that the icon exists first
3. If an icon does not exist, choose another approved icon and verify it
4. Use one consistent outlined icon family with approximately 2px strokes
5. Use 16px icons for compact metadata, 20px for controls, and 24px for
   standard feature or status use
6. Never create inline SVG icons when an approved icon already exists

### When building a layout
1. Read `guidelines/composition/layout.md` for containers, grids, and page
   structure
2. Read `guidelines/composition/surfaces.md` for surface layering and
   background rules
3. Read `guidelines/composition/hierarchy.md` for action and information
   priority
4. Start with a single-column mobile layout, then add selective two-column
   layouts from 768px and full navigation or three-column layouts from 1024px
5. Use the 1280px maximum container only from 1280px
6. Apply spacing tokens — never hardcode arbitrary pixel values
7. Use `surface-canvas` for reading and data surfaces, `surface-feature` for
   non-semantic emphasis, and `brand-teal-deep` for heroes, major CTAs, and
   footer regions

Composition defines where content belongs. Use a pattern guideline to define
how a recurring multi-component task behaves inside that layout.

### When presenting risk or evidence
1. Read `guidelines/composition/content-safety.md`
2. Separate source evidence, Rumper interpretation, confidence, limitations,
   and recommended actions
3. Label preliminary, incomplete, inferred, AI-generated, and verified
   information clearly
4. Pair every semantic color with visible text and an icon
5. Show source name, date, relevance, confidence, limitations, and source link
   when available
6. Never present a score, badge, map, or AI interpretation as sufficient proof

### When building maps or reports
1. Read `guidelines/components/maps.md`,
   `guidelines/components/evidence.md`, and
   `guidelines/components/reports.md`
2. Provide text alternatives for every important map, chart, score, and report
   visual
3. Place limitations beside the related finding, not only at the bottom
4. Move map and report visuals below explanatory copy on mobile
5. Define loading, empty, error, incomplete-evidence, success, and disabled
   states

## Rules

IMPORTANT: Every interface MUST separate **evidence**, **interpretation**,
**confidence**, **limitations**, and **next actions**. Do not combine them into
an unexplained score or status.

IMPORTANT: Bright `brand-green` is ALWAYS a brand and action color. Never use
it to mean safe, verified, approved, positive evidence, or low risk. Use the
distinct `semantic-positive` token only for verified positive evidence.

IMPORTANT: Never guarantee that a property is safe, suitable, risk-free, or
verified. Preliminary and AI-generated findings MUST be visibly labeled.

IMPORTANT: Safety-critical limitations MUST remain visible. Never hide them
behind payment, hover, tabs, accordions, or progressive disclosure.

IMPORTANT: Public examples MUST use fictional or anonymized property,
customer, and evidence data.

- Use DM Sans for all display, body, label, and control text. Do not require
  Euclid Circular A or Fraunces.
- Use design-system components over raw HTML controls when approved components
  exist.
- Use design-system tokens for color, typography, spacing, radii, elevation,
  and motion — never introduce arbitrary values without documenting an
  exception.
- Use a 4px base spacing unit and prefer 8px increments.
- Use 20px, 24px, or 32px padding for cards and panels.
- Use 48px, 64px, or 96px spacing between major sections.
- Use one primary button per section or decision point.
- Use action-specific labels such as "Periksa lokasi ini" or "Tinjau bukti",
  not vague labels such as "Lanjut".
- Use `rounded-full` bright-green primary buttons with deep-teal text.
- Use `rounded-lg` 12px, a `border-default` border, and no default shadow for
  standard cards.
- Use white `surface-canvas` for evidence tables and long-form reading surfaces. Never
  place large evidence tables directly on deep-teal surfaces.
- Use `surface-feature` for feature emphasis only, never as semantic success.
- Keep touch targets at least 44x44px.
- Meet WCAG AA contrast and provide visible high-contrast focus states.
- Keep every control keyboard operable and preserve logical reading order
  after responsive reflow.
- Use semantic HTML before ARIA. Give meaningful icons accessible names and
  hide decorative icons from assistive technology.
- Use visible labels for form controls. Placeholders are examples, not labels.
- Use radios instead of a select when there are two to five mutually exclusive
  options.
- Validate forms after meaningful interaction, preserve entered data, and
  place correction guidance beside the affected field.
- Use tabs only for peer views in the same context. Use two to five tabs and
  never rely on color alone for the active state.
- Use cards only when content benefits from a shared boundary. Never combine
  unrelated sections into one card.
- Use badges for compact metadata or states, not full explanations. Show no
  more than three badges together without grouping or reducing them.
- Treat maps as evidence interfaces, not decorative backdrops. Always provide
  a visible legend and text summary for important findings.
- Explain scores in plain language and keep them subordinate to findings and
  evidence.
- Use progressive disclosure for methodology and secondary detail only. Never
  hide essential evidence or limitations.
- Avoid horizontal page scrolling. Contain wide tables or convert them into
  prioritized columns or stacked records on small screens.
- Use shadows only for raised previews, popovers, menus, dialogs, and overlays.
- Use motion to explain state changes, keep common transitions between 150ms
  and 200ms, and respect reduced-motion preferences.
- Use Bahasa Indonesia for customer-facing product content unless the task
  explicitly requires another language.
- Use unambiguous dates such as `13 Jun 2026`.
- Do not copy MongoDB trademarks, logos, product names, product copy,
  proprietary imagery, or reference-specific product components.
