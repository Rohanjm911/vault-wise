import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        String(20),  # 'expense' or 'income'
        default="expense",
        nullable=False,
    )
    color_hex: Mapped[str] = mapped_column(
        String(7),  # Solid Hex only, e.g. '#10B981'
        nullable=False,
        default="#2563EB",
    )
    icon_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="tag",
    )
    is_system: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped[Optional["User"]] = relationship("User", back_populates="categories")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        back_populates="category",
        lazy="selectin",
    )
    budgets: Mapped[list["Budget"]] = relationship(
        "Budget",
        back_populates="category",
        lazy="selectin",
    )

    __table_args__ = (
        Index("idx_category_user_name", "user_id", "name"),
    )
