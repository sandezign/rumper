# Feedback, Overlays, and Disclosure

## Available components

`Alert`, `Toast`, `Tooltip`, `Skeleton`, `Progress`, `Spinner`, `EmptyState`,
`ErrorState`, `IncompleteEvidenceState`, `Dialog`, `AlertDialog`, `Popover`,
`Accordion`, and `Collapsible`.

## When to use

Use feedback to explain system state, completion, failure, missing evidence, or
the result of an action.

## When not to use

- Do not replace meaningful state copy with a spinner or color.
- Do not put safety-critical limitations only in optional disclosure.
- Do not use toasts for errors requiring recovery decisions.

## Anatomy

```text
[icon] Title
Description and impact
Recovery or next action
```

## Token mapping

Use appropriate semantic tokens, `radius-md` or `radius-lg`, approved
elevation for overlays, and `motion-interactive` or `motion-reveal`.

## Variants

- Loading, empty, error, incomplete evidence, success, and disabled.
- Alert, toast, tooltip, dialog, popover, accordion, and collapsible.

## Sizes

Keep tooltips concise. Dialogs use a mobile-safe width and max width appropriate
to the task. Touch targets remain at least 44x44px.

## States

Every data-dependent component defines loading, empty, error, incomplete, and
success states where relevant.

## Behavior and interaction

State what happened, what remains available, and what the user can do next.
Manage focus in overlays and restore it on close.

## Responsive behavior

Dialogs become near-full-width on mobile. Avoid overlays for content that
belongs in the normal reading flow.

## Accessibility

Announce asynchronous changes appropriately. Preserve Radix focus management,
escape behavior, keyboard interaction, and accessible names.

## Content guidance

Use calm, actionable copy. Success confirms an action but never implies
unsupported property safety.

## Decision tree

```text
Brief confirmation? -> Toast
Important contextual notice? -> Alert
Short control hint? -> Tooltip
Focused task or decision? -> Dialog
Missing evidence affects decision? -> IncompleteEvidenceState
No content or failure? -> EmptyState or ErrorState
Secondary methodology detail? -> Accordion or Collapsible
```

## Correct examples

```tsx
<Alert variant="warning">
  <AlertTitle>Perlu validasi lebih lanjut</AlertTitle>
  <AlertDescription>Data tahun terbaru belum tersedia.</AlertDescription>
</Alert>
```

## Incorrect examples

```tsx
<Tooltip>Keterbatasan penting yang harus dibaca pembeli...</Tooltip>
```

## Rules

- Explain state and recovery.
- Keep safety-critical content visible.
- Do not rely on motion, color, or icons alone.

## Related components and foundations

Read `badges.md`, `evidence.md`, `buttons.md`, and
`../../foundations/styles.md`.
