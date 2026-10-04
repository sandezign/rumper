# Accessibility Composition

## Core standard

All Rumper interfaces must meet WCAG AA and remain understandable without
color, pointer input, animation, or map interaction.

## Canonical workspace landmarks

Use meaningful landmarks:

```text
header: global actions
aside: AI assistant
main: verified analysis workspace
section or complementary region: map evidence
```

Each region needs an accessible label. Independent scroll regions must be
keyboard reachable and must not trap focus.

## Keyboard order

Recommended desktop order:

1. Skip link
2. Global header and actions
3. Analysis workspace
4. Map controls and text alternative
5. Assistant rail

The DOM order should prioritize verified analysis over assistive AI content,
even when the assistant is visually placed first.

## Focus

- Show visible high-contrast focus for every control.
- Keep focus within dialogs and sheets, then restore it on close.
- Do not move focus automatically for routine map updates.
- Announce significant asynchronous analysis updates.

## Color and contrast

- Meet 4.5:1 for normal text.
- Meet 3:1 for large text, controls, and focus indicators.
- Pair semantic and map colors with labels, icons, or patterns.
- Do not use a green score ring as the only interpretation.

## Maps

- Provide a text summary of important spatial findings.
- Make layer controls and markers keyboard operable where supported.
- Provide visible legends with text labels.
- Do not require hover to reveal evidence.

## Assistant and AI

- Label AI-generated content explicitly.
- Announce generated responses without interrupting current reading.
- Keep assistant suggestions keyboard operable.
- Do not make AI output sound like verified source evidence.

## Responsive accessibility

- Preserve logical reading order after visual rearrangement.
- Keep touch targets at least 44x44px.
- Avoid sticky elements covering focused controls.
- Provide equivalent content when panels become sheets or tabs.

## Motion

Respect reduced-motion preferences. Do not animate critical evidence in ways
that delay access or create false certainty.

## Correct examples

- Map finding has a visible text summary.
- Current tab uses text and indicator, not color alone.
- Assistant region is labeled "Asisten AI".

## Incorrect examples

- Keyboard focus enters the map and cannot leave.
- A risk area is represented only by a pink translucent circle.
- AI progress updates repeatedly interrupt screen-reader output.

## Rules

- Use semantic HTML before ARIA.
- Test keyboard, zoom, reflow, contrast, and screen-reader reading order.
- Verified analysis remains accessible before assistive AI content.
