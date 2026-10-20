from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.user_settings import UserSettings
from app.schemas.user import UserSettingsOut
from app.schemas.settings import SettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=UserSettingsOut)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = result.scalars().first()
    if not user_settings:
        # Create default if missing
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)
        await db.commit()
        await db.refresh(user_settings)
    return user_settings


@router.put("", response_model=UserSettingsOut)
async def update_settings(
    payload: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = result.scalars().first()
    if not user_settings:
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)

    if payload.currency_code is not None:
        user_settings.currency_code = payload.currency_code.upper()
    if payload.currency_symbol is not None:
        user_settings.currency_symbol = payload.currency_symbol
    if payload.date_format is not None:
        user_settings.date_format = payload.date_format
    if payload.theme_mode is not None:
        user_settings.theme_mode = payload.theme_mode
    if payload.ai_consent is not None:
        user_settings.ai_consent = payload.ai_consent

    await db.commit()
    await db.refresh(user_settings)
    return user_settings
