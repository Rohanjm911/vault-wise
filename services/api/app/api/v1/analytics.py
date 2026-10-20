from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import DashboardResponse, HistoricalComparisonOut
from app.services.analytics_service import get_dashboard_data, get_history_comparison_data

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    period: str = Query("this_month", pattern="^(this_month|last_month|last_30_days|ytd|custom)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_dashboard_data(
        db=db,
        user_id=current_user.id,
        period_key=period,
        custom_start=start_date,
        custom_end=end_date,
    )


@router.get("/history", response_model=HistoricalComparisonOut)
async def get_history_comparison(
    period_type: str = Query("month", pattern="^(month|3_months|6_months|year)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_history_comparison_data(
        db=db,
        user_id=current_user.id,
        period_type=period_type,
    )
