from datetime import datetime, date
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.budget import BudgetProgressOut


async def calculate_budget_progress(
    db: AsyncSession,
    user_id: str,
    period: str,  # 'YYYY-MM'
) -> List[BudgetProgressOut]:
    # Determine start and end date for the period
    year, month = map(int, period.split("-"))
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    # Fetch user budgets for this period
    query = (
        select(Budget)
        .where(Budget.user_id == user_id, Budget.period == period)
        .order_by(Budget.category_id.asc().nulls_first())
    )
    result = await db.execute(query)
    budgets = result.scalars().all()

    progress_list: List[BudgetProgressOut] = []

    for b in budgets:
        # Calculate spending in this period
        if b.category_id:
            spending_query = select(func.sum(Transaction.amount_cents)).where(
                Transaction.user_id == user_id,
                Transaction.category_id == b.category_id,
                Transaction.type == "expense",
                Transaction.date >= start_date,
                Transaction.date < end_date,
            )
        else:
            # Overall monthly budget
            spending_query = select(func.sum(Transaction.amount_cents)).where(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                Transaction.date >= start_date,
                Transaction.date < end_date,
            )

        spending_res = await db.execute(spending_query)
        spent_cents = spending_res.scalar() or 0

        remaining_cents = b.limit_cents - spent_cents
        is_over = remaining_cents < 0

        # Safe division for utilization
        if b.limit_cents > 0:
            utilization = round((spent_cents / b.limit_cents) * 100.0, 2)
        else:
            utilization = 0.0 if spent_cents == 0 else 100.0

        cat_name = b.category.name if b.category else "Overall Monthly Budget"
        cat_color = b.category.color_hex if b.category else "#2563EB"

        progress_list.append(
            BudgetProgressOut(
                id=b.id,
                category_id=b.category_id,
                category_name=cat_name,
                category_color=cat_color,
                period=b.period,
                limit_cents=b.limit_cents,
                spent_cents=spent_cents,
                remaining_cents=remaining_cents,
                utilization_percent=utilization,
                is_over_budget=is_over,
            )
        )

    return progress_list
