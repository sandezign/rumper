"""Grant (or revoke) a plan for one user, by email.

The only writer of `entitlements` while Midtrans approval is pending. Deliberately a script
and not an endpoint: a self-serve HTTP grant would hand anyone a paid plan for free.

    uv run python -m scripts.grant_entitlement someone@example.com bundle --note "pre-launch"
    uv run python -m scripts.grant_entitlement someone@example.com free      # revoke

Every grant is stamped `source="manual_grant"`, so once real payments land these rows stay
distinguishable from ones somebody actually paid for.
"""
from __future__ import annotations

import argparse
import asyncio
import sys
import uuid

from sqlalchemy import select

from app.db.session import session_factory
from app.models import Entitlement, User
from app.models.entitlement import PLAN_EXTRA_LOCATIONS, PLANS


async def grant(email: str, plan: str, note: str | None) -> int:
    if plan not in PLANS:
        print(f"unknown plan {plan!r}; expected one of {', '.join(PLANS)}", file=sys.stderr)
        return 2

    async with session_factory()() as db:
        user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if user is None:
            print(f"no user with email {email!r}", file=sys.stderr)
            return 1

        row = (await db.execute(select(Entitlement).where(
            Entitlement.user_id == user.id))).scalar_one_or_none()

        if plan == "free":
            if row is None:
                print(f"{email} is already on the free trial")
                return 0
            await db.delete(row)
            await db.commit()
            print(f"revoked: {email} is back on the free trial")
            return 0

        extra = PLAN_EXTRA_LOCATIONS[plan]
        if row is None:
            row = Entitlement(id=uuid.uuid4(), user_id=user.id)
            db.add(row)
        row.plan = plan
        row.extra_locations = extra
        row.source = "manual_grant"
        row.note = note
        await db.commit()
        print(f"granted: {email} -> {plan} (+{extra} lokasi, source=manual_grant)")
        return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("email")
    ap.add_argument("plan", choices=list(PLANS))
    ap.add_argument("--note", default=None, help="why this was granted by hand")
    args = ap.parse_args()
    return asyncio.run(grant(args.email, args.plan, args.note))


if __name__ == "__main__":
    raise SystemExit(main())
