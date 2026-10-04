"""research job fine-grained progress (server-driven loader)

Revision ID: e1f2a3b4c5d6
Revises: d8750dfbaf58
Create Date: 2026-06-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'e1f2a3b4c5d6'
down_revision: Union[str, None] = 'd8750dfbaf58'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Server owns the research loader's progress: a 0..100 bar + a human label,
    # alongside the existing coarse 1..5 step (categories_done). The FE only renders
    # these values — no client-side faking.
    op.add_column('research_jobs',
                  sa.Column('progress_pct', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('research_jobs',
                  sa.Column('progress_note', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('research_jobs', 'progress_note')
    op.drop_column('research_jobs', 'progress_pct')
