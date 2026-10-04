# Component Catalog

Always prefer approved components over plain HTML elements or one-off custom
UI. Do NOT write code using a component until you have read its guidelines
file.

shadcn/ui components are copied into and owned by the application:

```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

Rumper-specific composite components are reusable contained units built from
approved primitives:

```tsx
import { EvidenceCard } from "@/components/evidence/evidence-card"
import { RiskCard } from "@/components/risks/risk-card"
import { ReportSummary } from "@/components/reports/report-summary"
```

## Component boundaries

Use this catalog for primitive and composite components:

- A **primitive component** is a small reusable control, such as `Button`,
  `Input`, or `Badge`.
- A **composite component** is an independently reusable contained unit with
  one responsibility, such as `EvidenceCard` or `MapLegend`.
- A **pattern** combines multiple components to solve a recurring user task,
  such as explaining one risk or exploring map evidence.
- A **composition** defines page-level placement, region proportions, and
  hierarchy.

Read [`../patterns/overview.md`](../patterns/overview.md) before turning a
multi-component workflow into a component. A pattern may contain components,
but it is not a component variant.

## Common pattern routes

| Combination or workflow | Pattern guideline |
|---|---|
| Location intake form and validation flow | [`location-intake.md`](../patterns/location-intake.md) |
| Assistant messages, progress, summary, and composer | [`assistant-conversation.md`](../patterns/assistant-conversation.md) |
| Score, top findings, confidence, limitations, and next action | [`analysis-summary.md`](../patterns/analysis-summary.md) |
| Risk card, evidence, limitation, and recommended action | [`risk-finding.md`](../patterns/risk-finding.md) |
| Map, legend, layers, popovers, and written summary | [`map-evidence-exploration.md`](../patterns/map-evidence-exploration.md) |
| Checklist items, status, and related evidence | [`buyer-verification-checklist.md`](../patterns/buyer-verification-checklist.md) |
| Report summary, findings, limitations, and actions | [`report-decision-summary.md`](../patterns/report-decision-summary.md) |

## Shared component rules

- Read the linked category guideline before using or creating a component.
- Reuse an approved shadcn/ui primitive before creating a new low-level
  component.
- Keep reusable primitives under `src/components/ui/`.
- Keep product-specific compositions outside `ui/`, grouped by feature.
- Use semantic Rumper tokens and approved variants; do not add arbitrary
  visual values.
- Preserve Radix accessibility behavior and keyboard interactions.
- Define default, hover, focus-visible, pressed or selected, loading, disabled,
  error, and empty states where relevant.
- Keep touch targets at least 44x44px.
- Pair semantic colors with visible text and icons.
- Never use bright `brand-green` to mean safe, verified, approved, positive
  evidence, or low risk.
- Never hide safety-critical evidence or limitations inside optional
  interaction.

## Buttons and actions

| Component | Alt names | Purpose | Foundation | Guidelines |
|---|---|---|---|---|
| Button | CTA, action button | Primary, supporting, subtle, and destructive actions | shadcn/ui `Button` | `buttons.md` |
| IconButton | Icon action, compact action | Icon-only action with accessible name and tooltip | shadcn/ui `Button` + `Tooltip` | `buttons.md` |
| ButtonGroup | Action group, button bar | Groups closely related actions | shadcn/ui `ButtonGroup` or composed `Button` | `buttons.md` |
| CopyButton | Copy action | Copies evidence IDs, links, or report references | `Button` + Lucide icon | `buttons.md` |
| DownloadButton | Export action, report download | Downloads or exports a report or source | `Button` | `buttons.md` |

## Inputs and forms

| Component | Alt names | Purpose | Foundation | Guidelines |
|---|---|---|---|---|
| Input | Text input, text field | Single-line text entry | shadcn/ui `Input` | `forms.md` |
| Textarea | Multi-line input, notes field | Multi-line text entry | shadcn/ui `Textarea` | `forms.md` |
| Select | Dropdown, picker | Selection from a predefined list | shadcn/ui `Select` | `forms.md` |
| Checkbox | Check, boolean field | Independent boolean selection | shadcn/ui `Checkbox` | `forms.md` |
| RadioGroup | Radio buttons, single choice | Two to five mutually exclusive choices | shadcn/ui `RadioGroup` | `forms.md` |
| Switch | Toggle, setting | Immediate on/off setting | shadcn/ui `Switch` | `forms.md` |
| Label | Field label | Persistent accessible control label | shadcn/ui `Label` | `forms.md` |
| Field | Form field, input group | Label, control, description, and validation message | shadcn/ui `Field` or composed primitives | `forms.md` |
| SearchField | Search bar, location search | Searches locations, evidence, or reports | `Input` + `Button` | `forms.md` |
| AddressField | Location field, property address | Structured property or location entry | Composed form primitives | `forms.md` |
| LocationIntakeForm | Location form, check form | Collects the minimum information needed to begin a check | Composed form primitives | `forms.md` |

## Navigation

| Component | Alt names | Purpose | Foundation | Guidelines |
|---|---|---|---|---|
| TopNavigation | Header nav, primary nav | Marketing and application-level navigation | Composed navigation primitives | `navigation.md` |
| MobileNavigation | Mobile menu, nav drawer | Small-screen application navigation | shadcn/ui `Sheet` + navigation links | `navigation.md` |
| Breadcrumb | Breadcrumbs, location trail | Shows hierarchy in reports, evidence, and methodology views | shadcn/ui `Breadcrumb` | `navigation.md` |
| FooterNavigation | Footer links, footer nav | Groups secondary and legal navigation | Composed links | `navigation.md` |
| Pagination | Page controls, result pages | Moves through long evidence or report lists | shadcn/ui `Pagination` | `navigation.md` |
| Tabs | Tab bar, content tabs | Switches between peer views in one context | shadcn/ui `Tabs` | `tabs.md` |
| SegmentedControl | View switcher, toggle group | Switches between two to five display modes | shadcn/ui `ToggleGroup` | `tabs.md` |

## Cards and surfaces

| Component | Alt names | Purpose | Foundation | Guidelines |
|---|---|---|---|---|
| Card | Base card, content card | Groups related content within a shared boundary | shadcn/ui `Card` | `cards.md` |
| FeatureCard | Feature panel, capability card | Highlights an important capability or explanation | `Card` | `cards.md` |
| DarkFeatureCard | Dark panel, dark feature | Highlights important content on deep teal | `Card` | `cards.md` |
| RiskCard | Finding card, risk finding | Shows finding, severity, evidence, confidence, limitation, and action | `Card` + `Badge` | `cards.md` |
| EvidenceCard | Source card, citation card | Shows source evidence, relevance, confidence, and limitations | `Card` + `Badge` | `evidence.md` |
| ReportPreviewCard | Report card, preview | Previews report structure and selected findings | `Card` | `reports.md` |
| PricingCard | Package card, plan card | Compares service scope without hiding safety-critical details | `Card` | `cards.md` |
| StatCard | Metric card, score tile | Shows a metric with context and explanation | `Card` | `cards.md` |

## Feedback and status

| Component | Alt names | Purpose | Foundation | Guidelines |
|---|---|---|---|---|
| Badge | Tag, label, status pill | Shows compact status or metadata | shadcn/ui `Badge` | `badges.md` |
| RiskBadge | Severity badge, risk status | Shows labeled risk severity | `Badge` | `badges.md` |
| ConfidenceBadge | Confidence label | Shows evidence confidence | `Badge` | `badges.md` |
| ValidationBadge | Review state, validation status | Shows preliminary, incomplete, inferred, or verified state | `Badge` | `badges.md` |
| SourceBadge | Source label, data-source tag | Identifies source type or authority | `Badge` | `badges.md` |
| Alert | Notice, warning, callout | Shows important contextual information | shadcn/ui `Alert` | `feedback-states.md` |
| Toast | Notification, snackbar | Confirms brief actions or recoverable events | shadcn/ui `Sonner` | `feedback-states.md` |
| Tooltip | Hint, info tip | Gives a short label or supporting explanation | shadcn/ui `Tooltip` | `feedback-states.md` |
| Skeleton | Loading placeholder | Preserves layout while content loads | shadcn/ui `Skeleton` | `feedback-states.md` |
| Progress | Progress bar, completion | Shows determinate progress | shadcn/ui `Progress` | `feedback-states.md` |
| Spinner | Loading indicator | Shows short indeterminate activity | shadcn/ui `Spinner` | `feedback-states.md` |
| EmptyState | No-results state, blank state | Explains absent content and the next action | Composed feedback primitives | `feedback-states.md` |
| ErrorState | Failure state, error panel | Explains failure, retained content, and recovery | `Alert` + action | `feedback-states.md` |
| IncompleteEvidenceState | Missing-evidence state | Explains missing evidence and decision impact | `Alert` + evidence metadata | `feedback-states.md` |

## Overlays and disclosure

| Component | Alt names | Purpose | Foundation | Guidelines |
|---|---|---|---|---|
| Dialog | Modal, confirmation | Focused task or consequential confirmation | shadcn/ui `Dialog` | `feedback-states.md` |
| AlertDialog | Destructive confirmation | Confirms irreversible or risky actions | shadcn/ui `AlertDialog` | `feedback-states.md` |
| Sheet | Drawer, side panel | Mobile navigation or supporting task panel | shadcn/ui `Sheet` | `navigation.md` |
| Popover | Context panel, floating detail | Shows supporting controls or evidence details | shadcn/ui `Popover` | `feedback-states.md` |
| Accordion | Expandable sections, disclosure | Reveals methodology or secondary detail | shadcn/ui `Accordion` | `feedback-states.md` |
| Collapsible | Expand section, show more | Reveals a single secondary region | shadcn/ui `Collapsible` | `feedback-states.md` |

Do not place safety-critical limitations only inside dialogs, popovers,
accordions, collapsibles, tooltips, or hover states.

## Tables and structured data

| Component | Alt names | Purpose | Foundation | Guidelines |
|---|---|---|---|---|
| Table | Data table, results table | Scans and compares consistent columns | shadcn/ui `Table` | `tables.md` |
| EvidenceTable | Source table, citations table | Compares sources, dates, relevance, confidence, and limitations | `Table` | `tables.md` |
| ComparisonTable | Compare table, package comparison | Compares locations, findings, or package scope | `Table` | `tables.md` |
| ResponsiveRecordList | Mobile table, stacked records | Presents table data as labeled records on small screens | Custom composition | `tables.md` |

## Maps and location

| Component | Alt names | Purpose | Foundation | Guidelines |
|---|---|---|---|---|
| MapPanel | Risk map, location map | Shows location layers and evidence spatially | Custom composition | `maps.md` |
| MapMarker | Location pin, evidence marker | Marks a property, source, or finding | Map-library primitive + Lucide icon | `maps.md` |
| MapLegend | Legend, map key | Explains map colors, symbols, and precision | Custom composition | `maps.md` |
| MapLayerControl | Layers, layer switcher | Toggles available evidence layers | Composed form controls | `maps.md` |
| EvidencePopover | Map popup, source popup | Shows source, date, confidence, and limitations | shadcn/ui `Popover` | `maps.md` |
| LocationSummary | Address summary, location header | Shows location identity and check status | Custom composition | `maps.md` |

## Evidence and reports

| Component | Alt names | Purpose | Foundation | Guidelines |
|---|---|---|---|---|
| EvidenceSummary | Source summary, evidence overview | Separates source fact, interpretation, confidence, and limitation | Custom composition | `evidence.md` |
| SourceCitation | Citation, source reference | Links a finding to its original source | Custom composition | `evidence.md` |
| ConfidenceIndicator | Confidence meter, confidence level | Communicates confidence with text and supporting visual | `Badge` + composed content | `evidence.md` |
| LimitationNotice | Caveat, evidence limitation | Keeps relevant uncertainty visible | `Alert` | `evidence.md` |
| ReportSummary | Decision summary, report overview | Leads with key findings, limitations, and next actions | Custom composition | `reports.md` |
| FindingSection | Finding group, risk section | Organizes one finding with supporting evidence | Custom composition | `reports.md` |
| ScoreExplanation | Score details, score breakdown | Explains a score in plain language | Custom composition | `reports.md` |
| RecommendedActions | Next steps, action plan | Lists practical buyer actions linked to findings | Custom composition | `reports.md` |
| ReportStatus | Report state, review status | Distinguishes preliminary, reviewed, and final reports | `Badge` + supporting copy | `reports.md` |

## Button variant decision tree

```text
What button variant should I use?
|
|-- Main call to action, one per section?
|   `-- Primary
|
|-- Supporting action beside a primary action?
|   `-- Secondary
|
|-- Low-emphasis local action?
|   `-- Ghost
|
|-- Navigation to another page or source?
|   `-- Link
|
`-- Irreversible or risky action?
    `-- Destructive
```

Rules:

- Use only one primary button per visible section or decision point.
- Use action-specific labels, not vague labels such as "Continue".
- Bright brand green identifies the primary action, never positive evidence.
- Destructive actions require an explicit label and confirmation where
  appropriate.
- Icon-only buttons require an accessible name and tooltip.

## Input component selection

```text
How should the user provide information?
|
|-- Short freeform text?
|   `-- Input
|
|-- Long freeform text?
|   `-- Textarea
|
|-- Two to five mutually exclusive choices?
|   `-- RadioGroup
|
|-- Choose from a longer predefined list?
|   `-- Select
|
|-- Independent boolean form value?
|   `-- Checkbox
|
|-- Immediate on or off setting?
|   `-- Switch
|
|-- Search locations, evidence, or reports?
|   `-- SearchField
|
`-- Enter a property or location?
    `-- AddressField or LocationIntakeForm
```

## Feedback component selection

```text
How should information or state be shown?
|
|-- Brief confirmation or recoverable event?
|   `-- Toast
|
|-- Compact status or metadata?
|   `-- Badge
|
|-- Important contextual notice?
|   `-- Alert
|
|-- Short control explanation on hover and focus?
|   `-- Tooltip
|
|-- Focused task or user decision?
|   `-- Dialog
|
|-- Missing data that affects the decision?
|   `-- IncompleteEvidenceState
|
`-- No content, failure, or loading?
    `-- EmptyState, ErrorState, Skeleton, Progress, or Spinner
```

## Evidence component and pattern decision tree

```text
What evidence pattern should I use?
|
|-- One source supporting a finding?
|   `-- EvidenceCard
|
|-- Multiple comparable sources?
|   `-- EvidenceTable
|
|-- Spatial evidence exploration workflow?
|   `-- Use the map-evidence-exploration pattern
|
|-- Important uncertainty or caveat?
|   `-- LimitationNotice beside the finding
|
|-- Overall result and next decision?
|   `-- Use the report-decision-summary pattern
|
`-- Individual report finding?
    `-- Use the risk-finding pattern
```

## Navigation hierarchy

```text
What navigation component should I use?
|
|-- Marketing or application-level navigation?
|   `-- TopNavigation
|
|-- Small-screen application navigation?
|   `-- MobileNavigation
|
|-- Hierarchy inside a report or evidence view?
|   `-- Breadcrumb
|
|-- Peer views inside the same context?
|   `-- Tabs
|
`-- Two to five display modes?
    `-- SegmentedControl
```

Do not use tabs as a replacement for application-level navigation. Do not hide
the primary user task inside a generic overflow menu.

## Common props and contracts

Most reusable components should accept:

- `className`: additional layout classes without redefining core appearance
- `disabled`: prevents interaction and communicates disabled state
- `aria-label`: required when visible text does not provide an accessible name

Form components should also support:

- persistent visible label
- optional description or helper text
- validation message
- required, disabled, and read-only states
- controlled value and change callback

Evidence and report compositions should expose:

- source or finding identity
- verification or validation state
- confidence
- limitations
- practical next action

Do not standardize a prop until at least two components need the same contract.
