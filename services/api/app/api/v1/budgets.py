from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.budget import Budget
from app.models.category import Category
from app.schemas.budget import BudgetCreate, BudgetProgressOut
from app.services.budget_service import calculate_budget_progress

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("", response_model=List[BudgetProgressOut])
async def get_budgets(
    period: Optional[str] = Query(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not period:
        period = datetime.now().strftime("%Y-%m")
    return await calculate_budget_progress(db, current_user.id, period)


@router.post("", response_model=BudgetProgressOut, status_code=status.HTTP_201_CREATED)
async def create_or_update_budget(
    payload: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify category if specified
    if payload.category_id:
        cat_res = await db.execute(
            select(Category).where(
                Category.id == payload.category_id,
                Category.user_id == current_user.id,
            )
        )
        if not cat_res.scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category.")

    # Check existing budget for this user, category, and period
    existing = await db.execute(
        select(Budget).where(
            Budget.user_id == current_user.id,
            Budget.category_id == payload.category_id,
            Budget.period == payload.period,
        )
    )
    budget = existing.scalars().first()

    if budget:
        budget.limit_cents = payload.limit_cents
    else:
        budget = Budget(
            user_id=current_user.id,
            category_id=payload.category_id,
            period=payload.period,
            limit_cents=payload.limit_cents,
        )
        db.add(budget)

    await db.commit()
    await db.refresh(budget)

    # Return refreshed progress item
    progress_list = await calculate_budget_progress(db, current_user.id, payload.period)
    matched = next((p for p in progress_list if p.id == budget.id), None)
    if not matched:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to calculate budget.")
    return matched


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id)
    )
    budget = result.scalars().first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")

    await db.delete(budget)
    await db.commit()
    return None
