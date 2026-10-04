"""entitlements

One row per user, written only when a plan is actually granted. No row = free trial, so the
table starts empty and nobody is silently upgraded by the migration itself.

Revision ID: a1b2c3d4e5f6
Revises: e1f2a3b4c5d6
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "a1b2c3d4e5f6"
down_revision = "e1f2a3b4c5d6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "entitlements",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("plan", sa.Text(), nullable=False, server_default="free"),
        sa.Column("extra_locations", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("source", sa.Text(), nullable=False, server_default="manual_grant"),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("granted_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("entitlements")
