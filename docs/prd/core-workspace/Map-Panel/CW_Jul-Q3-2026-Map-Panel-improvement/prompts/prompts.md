# Prompt Library

## Prompt Quality Rules

Every prompt should include:

- Role
- Product/project context
- User context
- Task
- Desired output format
- Constraints
- Tone

## Research Brief Prompt

```text
Act as a senior UX research strategist.

Project: [name]
Product module: [module]
Target user: [description]
Business goal: [what the business needs to decide]
Known constraints: [constraints]

Output:
1. A tight problem statement
2. Three answerable research questions
3. Recommended research method with rationale
4. Draft success criteria
5. One key assumption to pressure-test
```

## Persona Prompt

```text
Act as a senior product designer.

Based on these notes: [paste notes]

Create a UX persona with:
- Name or role archetype
- Context of use
- Top three goals
- Top three pain points
- Key behaviors
- What success looks like

Flag anything assumed vs. grounded in evidence.
```

## User Flow Prompt

```text
Act as a senior UX designer.

Product: [name]
Feature / menu area: [name]
User: [persona]
User goal: [goal]
Current pain: [pain]

Create:
1. Current-state flow
2. Proposed flow
3. Happy path
4. One error or edge path
5. Friction points and design implications

Format as a structured flow and table.
```

## Figma Make Prompt

```text
Generate a [screen/component] for Rumper.

Product module: [module]
Feature area: [area]
User goal: [goal]
Business goal: [goal]
Required elements:
- [Element]
- [Element]
- [Element]

Style:
- Dense operational UI
- Clear hierarchy
- Consistent with Rumper design system
- Accessible contrast and focus states

States needed:
default, hover, focus, disabled, loading, empty, error
```

## Handoff Prompt

```text
Act as a senior UX designer preparing developer handoff.

Feature: [name]
Screens: [list]
Components: [list]
Interactions: [list]
Known edge cases: [list]

Write developer-ready annotations covering:
1. Behavior
2. States
3. Conditional logic
4. Validation
5. Accessibility
6. API/data dependencies

Format as a markdown table.
```

## Prompt Log

| Date | Task | Prompt Name | Tool | Rating | Notes |
|---|---|---|---|---|---|
| [YYYY-MM-DD] | [Task] | [Name] | [Tool] | 1-5 | [What worked / what to improve] |

