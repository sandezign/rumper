# 08 — Prompt Registry

Source: `app/prompts/__init__.py` + `app/prompts/*.md`. Rule (CLAUDE.md #4): every
prompt lives as an agent-skill-format `.md` file; code never inlines prompt prose.

## 1. File format & loader

Each file: YAML frontmatter (`name`, `description`, `used_by`, optional `schema`,
`params`, `grounded`) followed by the prompt body. The loader strips the frontmatter
(everything up to the first `\n---` after the opening `---`), wraps the body in
`string.Template`, and caches per name (`lru_cache`). Variables use `$name`
(`Template.safe_substitute`) — chosen over f-strings/format so JSON braces in prompt
text never collide; unknown variables are left intact rather than raising.

API: `render(name, **variables) -> str`. Frontmatter `params` are documentation of
the call-site settings (temperature, max_output_tokens, thinking_budget, timeouts) —
the **call site** is authoritative; keep both in sync.

## 2. Inventory

| name | used by | output schema | vars | role |
|---|---|---|---|---|
| `guardrails` | prepended to all four research prompts | — | — | research-assistant rules: Bahasa Indonesia, calm; never fabricate sources/URLs/numbers/events; area-level vs house-point evidence distinction; STD-SCR-001 confidence definitions; no decision language |
| `research_plan` | `research_graph.plan` | `PlanDraft` | `$guardrails $brief $spatial` | ≤2 sharp, location-specific id-ID web queries per textual category; must go beyond known spatial facts; includes good/bad query example |
| `research_search` | `research_graph.search` (grounded) | free text + grounding | `$guardrails $category $query` | one grounded search; ≤~250 words of factual findings with years/numbers; honest when nothing found |
| `research_assess` | `research_graph.assess` | `AssessDraft` | `$guardrails $blocks` | per-category sufficiency judgment; if insufficient but promising, ≤2 refined queries reusing names (kampung/kali/jalan) discovered in earlier results; don't waste budget when clearly exhausted |
| `research_extract` | `research_graph.extract` | `CategoryDraft` | `$guardrails $category $spatial $research_text $source_list` | structured findings citing `source_indices` from the numbered source list (empty = evidence gap); must not duplicate the spatial facts; proposes 0–100 score with anchor bands (80–100 / 65–79 / 50–64 / 25–49 / 0–24) |
| `compose_summary` | `composer.compose_summary` | `SummaryDraft` | `$context $band $rec $facts` | 4–6 calm id-ID sentences from the fact sheet ONLY; must name top risk, top strength, next validation step; no new facts, no certainty language, no numeric scores (labels only) |
| `chat_system` | `chat_graph.turn` (via chat_turn) | `ChatTurnDraft` | — | workspace persona + hard rules: domain-scoped (off_topic flag), never fabricate location facts or judge before research, extract intake fields (enum constraints listed), ask ONE next question in priority order (address → workplace → mode → purpose → concerns), confirm-then-`ready_to_research`, ≤4 short suggestion chips (≤30 chars) |
| `chat_qa` | `chat_graph.turn` in report_qa mode | — | `$report` | mode addendum: answer ONLY from the report fact sheet; not covered → say so and point to the field checklist; cite confidence labels; never start new research; `ready_to_research` always false |
| `chat_turn` | `chat_graph.turn` | `ChatTurnDraft` | `$system $qa_block $intake_status $conversation` | per-turn assembly: system + optional QA block + intake status summary + last-12-message window + reply instruction |

## 3. Conventions for new prompts

1. Frontmatter must name the consuming function (`used_by`) and structured-output
   schema when applicable.
2. Research prompts always start with `$guardrails`.
3. Bahasa Indonesia for everything user-adjacent; keep instructions imperative and
   short — model budget is enforced at the call site, not by prose.
4. The LLM only ever sees source **indices**; URL resolution stays in code
   (anti-fabrication invariant, doc 05 §2).
