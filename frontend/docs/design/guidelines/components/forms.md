# Forms and Inputs

## Available components

`Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Label`,
`Field`, `SearchField`, `AddressField`, and `LocationIntakeForm`.

## When to use

Use forms to collect the minimum information required for the user's next
decision or task.

## When not to use

- Do not ask for information without explaining why it is needed.
- Do not use placeholders as labels.
- Do not use a select for two to five mutually exclusive options; use radios.

## Anatomy

```text
Label + optional requirement
Control
Description or helper text
Validation message
```

## Token mapping

Controls use `surface-canvas`, `text-primary`, `border-strong`, `radius-md`,
`text-body`, minimum 44px height, and visible `border-focus` ring. Errors use
semantic-danger tokens with text and icon.

## Variants

- Text, textarea, select, checkbox, radio, switch.
- Search and address fields.
- Grouped location-intake form.

## Sizes

Use minimum 44px control height. Textareas grow with content within sensible
limits. Do not create compact customer-facing controls below 44px.

## States

Define default, hover, focus-visible, filled, error, disabled, read-only, and
loading states.

## Behavior and interaction

Validate after meaningful interaction, preserve entered values after errors,
and place correction guidance beside the affected field.

## Responsive behavior

Stack fields on mobile. Use columns only when fields are closely related and
remain readable. Keep submit actions after the final field in reading order.

## Accessibility

- Every control needs a persistent visible label.
- Associate descriptions and errors with controls.
- Use `aria-invalid` and alert error messages.
- Preserve keyboard and Radix interaction behavior.

## Content guidance

Use direct labels and helpful examples. State why sensitive or unusual
information is required.

## Decision tree

```text
Short freeform? -> Input
Long freeform? -> Textarea
Two to five exclusive choices? -> RadioGroup
Long predefined list? -> Select
Independent boolean? -> Checkbox
Immediate setting? -> Switch
Property location? -> AddressField or LocationIntakeForm
```

## Correct examples

```tsx
<Field>
  <Label htmlFor="address">Alamat properti</Label>
  <Input id="address" aria-describedby="address-help" />
  <p id="address-help">Masukkan alamat selengkap mungkin.</p>
</Field>
```

## Incorrect examples

```tsx
<Input placeholder="Alamat properti" />
<Select>{/* Yes / No */}</Select>
```

## Rules

- Collect the minimum required information.
- Use labels, descriptions, and actionable validation.
- Never erase valid input after an error.

## Related components and foundations

Read `../../foundations/setup.md`, `../../foundations/tokens.md`,
`feedback-states.md`, and `buttons.md`.
