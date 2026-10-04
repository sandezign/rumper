"""Unified LLM access — single entry point for all model calls (CLAUDE.md rule 4).

Like nihonjung (ADR-015 there): everything goes through LangChain's
`ChatGoogleGenerativeAI`, so LangSmith traces carry token usage automatically and
LangGraph nodes show child LLM runs. The same `usage_metadata` feeds our billing-grade
`usage_events` ledger (docs/13 §3).

Two-step grounding pattern (docs/06 §3): grounded calls return prose + citations from
grounding metadata; a later structured call references sources by index — the model
never writes URLs.
"""
from typing import TypeVar

from google.genai import types as genai_types
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel

from app.core.config import get_settings
from app.core.usage import record_llm_usage

T = TypeVar("T", bound=BaseModel)

_models: dict = {}


def _chat(*, temperature: float | None, max_output_tokens: int | None,
          thinking_budget: int | None) -> ChatGoogleGenerativeAI:
    s = get_settings()
    temp = temperature if temperature is not None else s.llm_temperature
    key = (temp, max_output_tokens, thinking_budget)
    if key not in _models:
        kwargs: dict = {}
        if thinking_budget is not None:
            kwargs["thinking_budget"] = thinking_budget
        _models[key] = ChatGoogleGenerativeAI(
            model=s.gemini_model, google_api_key=s.gemini_api_key,
            temperature=temp, max_output_tokens=max_output_tokens, **kwargs,
        )
    return _models[key]


async def _meter(msg) -> None:
    um = getattr(msg, "usage_metadata", None) or {}
    if um:
        await record_llm_usage(get_settings().gemini_model,
                               um.get("input_tokens", 0), um.get("output_tokens", 0))


async def grounded(
    prompt: str, *, temperature: float | None = None,
    max_output_tokens: int | None = None, thinking_budget: int | None = None,
) -> tuple[str, list[dict]]:
    """Google-Search-grounded generation. Returns (text, sources).

    sources: [{"title": str, "url": str}] from grounding metadata only.
    """
    model = _chat(temperature=temperature, max_output_tokens=max_output_tokens,
                  thinking_budget=thinking_budget)
    resp = await model.ainvoke(
        prompt, tools=[genai_types.Tool(google_search=genai_types.GoogleSearch())])
    await _meter(resp)
    text = resp.text() if callable(getattr(resp, "text", None)) else str(resp.content)
    sources: list[dict] = []
    gm = (resp.response_metadata or {}).get("grounding_metadata") or {}
    for chunk in gm.get("grounding_chunks", []):
        web = chunk.get("web") or {}
        if web.get("uri"):
            sources.append({"title": web.get("title") or web["uri"], "url": web["uri"]})
    return text, sources


async def structured(
    prompt: str, schema: type[T], *, temperature: float | None = None,
    max_output_tokens: int | None = None, thinking_budget: int | None = None,
) -> T:
    """Schema-bound generation. One retry on parse failure."""
    model = _chat(temperature=temperature, max_output_tokens=max_output_tokens,
                  thinking_budget=thinking_budget)
    runnable = model.with_structured_output(schema, include_raw=True)
    last_err: Exception | None = None
    for _ in range(2):
        try:
            result = await runnable.ainvoke(prompt)
            raw = result.get("raw") if isinstance(result, dict) else None
            if raw is not None:
                await _meter(raw)
            parsed = result.get("parsed") if isinstance(result, dict) else result
            if isinstance(parsed, schema):
                return parsed
            err = result.get("parsing_error") if isinstance(result, dict) else None
            raise RuntimeError(f"parse failed: {err}")
        except Exception as e:  # noqa: BLE001 — retried once, then surfaced
            last_err = e
    raise RuntimeError(f"structured output failed: {last_err}")
