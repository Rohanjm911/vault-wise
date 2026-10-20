from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    currency_code: Mapped[str] = mapped_column(
        String(3),
        default="USD",
        nullable=False,
    )
    currency_symbol: Mapped[str] = mapped_column(
        String(5),
        default="$",
        nullable=False,
    )
    date_format: Mapped[str] = mapped_column(
        String(20),
        default="YYYY-MM-DD",
        nullable=False,
    )
    theme_mode: Mapped[str] = mapped_column(
        String(10),
        default="light",
        nullable=False,
    )
    ai_consent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="settings")
