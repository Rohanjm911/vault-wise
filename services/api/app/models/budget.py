import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, BigInteger, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    period: Mapped[str] = mapped_column(
        String(7),  # e.g. '2026-10'
        nullable=False,
        index=True,
    )
    limit_cents: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="budgets")
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="budgets", lazy="joined")

    __table_args__ = (
        UniqueConstraint("user_id", "category_id", "period", name="uq_user_category_period"),
        Index("idx_budget_user_period", "user_id", "period"),
    )
