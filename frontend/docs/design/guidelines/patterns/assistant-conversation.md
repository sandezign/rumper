# Assistant Conversation Pattern

## Purpose

Help users ask follow-up questions, understand analysis progress, and identify
next actions without presenting AI output as verified evidence.

## Components combined

- Assistant identity and status
- User and assistant messages
- Clearly labeled `AnalysisProgress`
- `AssistantSummary`
- Suggested questions or actions
- Prompt composer with submit action
- Relevant evidence links

Read `../components/feedback-states.md`, `../components/buttons.md`,
`../components/forms.md`, and `../composition/content-safety.md`.

## Required order

1. Show the user's question or requested task.
2. Label AI processing or simulated progress explicitly.
3. Present a concise assistant interpretation.
4. Link to the verified evidence or analysis that supports it.
5. State uncertainty and recommend a practical next action.

## States

- Empty: explain supported questions and show useful suggestions.
- Thinking: show labeled activity without fabricated technical detail.
- Partial: distinguish available findings from pending or unavailable evidence.
- Complete: summarize and link to verified analysis.
- Error: explain what failed and offer retry without losing the prompt.

## Responsive behavior

- Desktop: place in the assistant rail and keep it subordinate to analysis.
- Mobile: present as a separate task view or sheet, not beside compressed data.
- Keep the composer reachable without covering essential evidence.

## Accessibility

- Announce new messages and progress changes without excessive interruption.
- Preserve chronological reading order.
- Give icon-only composer actions accessible names.

## Decision safety

- AI summaries are interpretation, never proof.
- Never use the assistant's confidence as evidence confidence.
- Link important claims to sources or verified analysis.
- Keep limitations visible in the summary, not only in linked detail.

## Rules

- Do not fabricate tool logs, source retrieval, or completed checks.
- Do not allow the assistant to visually dominate verified analysis.
- Do not use bright brand green to imply a favorable result.
