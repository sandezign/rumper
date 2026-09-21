# Location Intake Pattern

## Purpose

Collect the minimum location information required to begin a property check,
validate it clearly, and explain what happens next.

## Use when

- Starting a new property or neighborhood analysis.
- Refining an ambiguous address before analysis.

Do not use this pattern for general profile editing or advanced map filtering.

## Components combined

- `AddressField` or `SearchField`
- Optional structured `Field`, `Select`, or `RadioGroup`
- Validation message or `Alert`
- Primary `Button`
- Contextual privacy and scope explanation

Read `../components/forms.md`, `../components/buttons.md`, and
`../components/feedback-states.md`.

## Required order

1. Explain what location information is needed and why.
2. Request the minimum required address or location.
3. Resolve ambiguity or show validation beside the affected field.
4. State the expected analysis scope and limitations.
5. Provide one action-specific primary button.

## States

- Initial: empty fields with visible labels and useful examples.
- Resolving: clearly labeled address lookup or location matching.
- Ambiguous: show distinct candidate locations for user confirmation.
- Invalid: preserve input and provide correction guidance.
- Ready: confirm the selected location before starting analysis.
- Submission failure: retain all input and provide recovery.

## Responsive behavior

- Use a narrow single-column form on all screen sizes.
- Keep the primary action after the fields in reading order.
- Move optional contextual guidance below the form on small screens.

## Decision safety

- Do not imply that entering an address guarantees complete evidence.
- Explain unavailable coverage before analysis where known.
- Use fictional or anonymized addresses in public examples.

## Rules

- Do not request information that is not needed to begin the check.
- Do not use a placeholder as the only field label.
- Do not clear valid input after an error.
- Do not begin analysis before the user confirms an ambiguous location.
