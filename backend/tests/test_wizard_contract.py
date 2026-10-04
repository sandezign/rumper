"""The wizard's option→contract mappings must satisfy the intake schema.

A 422 here is invisible until a real buyer picks the affected option: `purpose` shipped with
`tinggal_pasangan`, which the schema's two-value pattern rejects, so every "pasangan"
household hit 422 on POST /api/conversations/from-intake and could never generate a report.

These read the literal maps out of frontend/src/lib/wizard.ts, so the test fails if the two
sides drift again — which is the whole point of "contract is the boundary" (CLAUDE.md §8).
"""
import json
import re
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.schemas.chat import CreateConversationFromIntake

_WIZARD = Path(__file__).resolve().parents[2] / "frontend" / "src" / "lib" / "wizard.ts"
_BASE = {"address_text": "Sektor 4, BSD", "workplace_text": "Telkomsat",
         "transport_mode": "motor"}


def _values(const_name: str) -> list[str]:
    """Right-hand side of a `const <name>: Record<string, string> = { … }` literal."""
    src = _WIZARD.read_text()
    block = re.search(rf"const {const_name}[^}}]*}}", src, re.S)
    assert block, f"{const_name} not found in wizard.ts"
    return sorted({m.group(1) for m in re.finditer(r':\s*"([^"]+)"', block.group(0))})


@pytest.mark.parametrize("field,const", [
    ("transport_mode", "TRANSPORT"),
    ("buying_stage", "STAGE"),
    ("purpose", "HOUSEHOLD_TO_PURPOSE"),
])
def test_every_wizard_option_is_accepted_by_the_intake_schema(field, const):
    for value in _values(const):
        try:
            CreateConversationFromIntake(**{**_BASE, field: value})
        except ValidationError as e:
            pytest.fail(
                f"wizard.ts {const} emits {field}={value!r}, which the intake schema "
                f"rejects: {e.errors()[0]['msg']}"
            )


def test_the_regression_itself_would_be_caught():
    """Guard the guard: the schema really does reject the value that shipped."""
    with pytest.raises(ValidationError):
        CreateConversationFromIntake(**_BASE, purpose="tinggal_pasangan")
