"""Durable LangGraph checkpointer — Postgres-backed (nihonjung doc-34 pattern).

Chat conversations are LangGraph threads (`thread_id = conversation_id`); research jobs
are threads too (`thread_id = job:<job_id>`). AsyncPostgresSaver over a psycopg3 pool;
`prepare_threshold=0` keeps it pooler-safe (Neon/PgBouncer transaction mode).
"""
from __future__ import annotations

import logging

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool

from app.core.config import get_settings

log = logging.getLogger("rumper.checkpointer")

_checkpointer: AsyncPostgresSaver | None = None
_pool: AsyncConnectionPool | None = None


def _conninfo() -> str:
    url = get_settings().database_url
    for prefix in ("postgresql+asyncpg://", "postgresql+psycopg2://",
                   "postgresql+psycopg://", "postgres://"):
        if url.startswith(prefix):
            return "postgresql://" + url[len(prefix):]
    return url


async def init_checkpointer() -> AsyncPostgresSaver:
    global _checkpointer, _pool
    if _checkpointer is not None:
        return _checkpointer
    _pool = AsyncConnectionPool(
        conninfo=_conninfo(), min_size=1, max_size=4, max_idle=120,
        max_lifetime=1800, timeout=30,
        check=AsyncConnectionPool.check_connection,
        kwargs={"autocommit": True, "prepare_threshold": 0},
        open=False,
    )
    await _pool.open()
    _checkpointer = AsyncPostgresSaver(conn=_pool)  # type: ignore[arg-type]
    await _checkpointer.setup()  # idempotent table creation
    log.info("LangGraph Postgres checkpointer ready")
    return _checkpointer


async def get_checkpointer() -> AsyncPostgresSaver:
    if _checkpointer is None:
        await init_checkpointer()
    assert _checkpointer is not None
    return _checkpointer


async def close_checkpointer() -> None:
    global _checkpointer, _pool
    if _pool is not None:
        await _pool.close()
    _checkpointer = None
    _pool = None
