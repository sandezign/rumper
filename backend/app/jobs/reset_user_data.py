"""Wipe per-user journey data so curation can be re-run from scratch (dev only).

Deletes the audit trail — conversations, intakes, research jobs, reports, findings,
scores, agent checkpoints — plus the usage ledger, which is what enforces the daily token
cap; without resetting that, a fresh curation would 402 before it started.

Deliberately KEPT:
  users / refresh_tokens  you stay logged in
  geo_features            the 26k-row OSM warehouse; re-ingesting is slow
  point_cache             cached elevation/flood facts; re-fetching costs Maps quota
  model_prices, projects, ingestion_runs

Usage:  make reset-user-data          (asks first)
        make reset-user-data FORCE=1  (no prompt)
"""
import asyncio
import os
import sys

from sqlalchemy import text

from app.db.session import session_factory

# Child-first: several of these FKs have no ON DELETE CASCADE.
TABLES = [
    "findings", "category_scores", "reports", "research_jobs",
    "messages", "conversations", "intakes",
    "checkpoint_writes", "checkpoint_blobs", "checkpoints",
    "usage_events",
]
KEPT = ("users", "refresh_tokens", "geo_features", "point_cache", "model_prices")


async def main() -> int:
    async with session_factory()() as db:
        counts = {
            t: (await db.execute(text(f'select count(*) from "{t}"'))).scalar()
            for t in TABLES
        }
        total = sum(counts.values())
        print(f"About to delete {total} rows across {len(TABLES)} tables:")
        for t, n in counts.items():
            if n:
                print(f"  {t:<22} {n}")
        print("Keeping: " + ", ".join(KEPT))
        if not total:
            print("\nNothing to delete.")
            return 0
        if not os.environ.get("FORCE") and input("\nProceed? [y/N] ").strip().lower() != "y":
            print("Aborted.")
            return 1
        for t in TABLES:
            await db.execute(text(f'delete from "{t}"'))
        await db.commit()
        print(f"\n✓ Deleted {total} rows. Curation can re-run from a clean slate.")
        print(
            "\nNote: the browser also keeps an area→conversation map in localStorage\n"
            '  ("rumper.areas.v1", plus "rumper.profile.v1" / sessionStorage "rumper_wizard").\n'
            "  The areas hub reconciles it against live conversations on load, so stale\n"
            "  links self-heal — but a hard refresh is the quickest way to see it."
        )
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
