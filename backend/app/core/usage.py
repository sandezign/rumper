"""Usage metering (docs/13 §3): ContextVar carries attribution; llm.py records every call.
Quota is a DAILY budget (50k tokens), resetting at midnight Asia/Jakarta (WIB)."""
import logging
import uuid
from contextvars import ContextVar
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import session_factory
from app.models import ModelPrice, UsageEvent, User

WIB = timezone(timedelta(hours=7))


def _today_start_utc() -> datetime:
    now_wib = datetime.now(WIB)
    start_wib = now_wib.replace(hour=0, minute=0, second=0, microsecond=0)
    return start_wib.astimezone(timezone.utc)


def next_reset_iso() -> str:
    """ISO timestamp of the next WIB midnight (when the daily quota resets)."""
    now_wib = datetime.now(WIB)
    nxt = (now_wib + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return nxt.isoformat()


async def count_events_today(db: AsyncSession, user_id: uuid.UUID, operation: str) -> int:
    """How many events of `operation` the user logged since WIB midnight (e.g. pdf cap)."""
    total = await db.scalar(
        select(func.count()).select_from(UsageEvent).where(
            UsageEvent.user_id == user_id,
            UsageEvent.operation == operation,
            UsageEvent.created_at >= _today_start_utc(),
        )
    )
    return int(total or 0)


async def tokens_used_today(db: AsyncSession, user_id: uuid.UUID) -> int:
    total = await db.scalar(
        select(func.coalesce(func.sum(UsageEvent.total_tokens), 0)).where(
            UsageEvent.user_id == user_id,
            UsageEvent.created_at >= _today_start_utc(),
        )
    )
    return int(total or 0)

log = logging.getLogger("rumper.usage")

# {user_id, conversation_id, job_id, operation} — set by chat service / orchestrator
usage_ctx: ContextVar[dict] = ContextVar("usage_ctx", default={})

_price_cache: dict[str, tuple[Decimal, Decimal]] = {}


def set_operation(operation: str) -> None:
    ctx = dict(usage_ctx.get())
    ctx["operation"] = operation
    usage_ctx.set(ctx)


async def _prices(model: str) -> tuple[Decimal, Decimal]:
    if model in _price_cache:
        return _price_cache[model]
    async with session_factory()() as db:
        row = (await db.execute(select(ModelPrice).where(ModelPrice.model == model))).scalar_one_or_none()
    pair = (row.input_usd_per_1m, row.output_usd_per_1m) if row else (Decimal(0), Decimal(0))
    _price_cache[model] = pair
    return pair


async def record_llm_usage(model: str, input_tokens: int, output_tokens: int) -> None:
    """Append a usage_events row + bump the user's lifetime counter. Never raises."""
    try:
        ctx = usage_ctx.get()
        total = input_tokens + output_tokens
        p_in, p_out = await _prices(model)
        cost = (Decimal(input_tokens) * p_in + Decimal(output_tokens) * p_out) / Decimal(1_000_000)
        user_id = ctx.get("user_id")
        meta = {k: str(v) for k, v in ctx.items() if k in ("conversation_id", "job_id") and v}
        async with session_factory()() as db:
            db.add(UsageEvent(
                user_id=uuid.UUID(str(user_id)) if user_id else None,
                operation=ctx.get("operation", "unknown"), model=model,
                input_tokens=input_tokens, output_tokens=output_tokens,
                total_tokens=total, est_cost_usd=cost, meta=meta,
            ))
            if user_id:
                await db.execute(update(User).where(User.id == uuid.UUID(str(user_id)))
                                 .values(tokens_used=User.tokens_used + total))
            await db.commit()
    except Exception:  # noqa: BLE001 — metering must never break the request
        log.exception("usage recording failed")


async def seed_model_prices() -> None:
    """Upsert default pricing — ESTIMATES; verify against the official list (docs/13 §2)."""
    from sqlalchemy.dialects.postgresql import insert as pg_insert
    defaults = [
        ("gemini-3.5-flash", Decimal("0.30"), Decimal("2.50")),
        ("gemini-3.1-flash-lite", Decimal("0.10"), Decimal("0.40")),
    ]
    async with session_factory()() as db:
        for model, p_in, p_out in defaults:
            stmt = pg_insert(ModelPrice).values(
                model=model, input_usd_per_1m=p_in, output_usd_per_1m=p_out,
            ).on_conflict_do_nothing(index_elements=["model"])
            await db.execute(stmt)
        await db.commit()
