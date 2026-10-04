"""Prompt registry — every LLM prompt lives as an agent-skill-format .md file here.

File layout (skill format): YAML frontmatter (name, description, used_by, params) then
the prompt body. Variables use `$name` (string.Template) so JSON/braces in prompt text
never collide. Code never inlines prompt prose — always `render("<name>", **vars)`.
"""
from functools import lru_cache
from pathlib import Path
from string import Template

_DIR = Path(__file__).parent


@lru_cache(maxsize=None)
def _template(name: str) -> Template:
    raw = (_DIR / f"{name}.md").read_text(encoding="utf-8")
    if raw.startswith("---"):
        end = raw.index("\n---", 3)
        raw = raw[end + 4:]
    return Template(raw.strip())


def render(name: str, **variables: str) -> str:
    return _template(name).safe_substitute(**variables)
