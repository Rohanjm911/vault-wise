from datetime import date, datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc

from app.models.transaction import Transaction
from app.models.category import Category
from app.models.budget import Budget
from app.schemas.analytics import (
    DashboardResponse,
    DashboardSummary,
    SpendingTrendPoint,
    CategoryBreakdownItem,
    HistoricalComparisonOut,
    CategoryHistoryTrend,
    InsightItem,
)
from app.schemas.budget import BudgetProgressOut
from app.services.budget_service import calculate_budget_progress
from app.api.v1.transactions import serialize_transaction


def resolve_date_range(
    period_key: str,
    custom_start: Optional[date] = None,
    custom_end: Optional[date] = None,
) -> Tuple[date, date, str]:
    today = date.today()
    if period_key == "this_month":
        start = date(today.year, today.month, 1)
        end = today
        name = "This Month"
    elif period_key == "last_month":
        first_this_month = date(today.year, today.month, 1)
        prev_month_end = first_this_month - timedelta(days=1)
        start = date(prev_month_end.year, prev_month_end.month, 1)
        end = prev_month_end
        name = "Last Month"
    elif period_key == "last_30_days":
        start = today - timedelta(days=29)
        end = today
        name = "Last 30 Days"
    elif period_key == "ytd":
        start = date(today.year, 1, 1)
        end = today
        name = "Year to Date"
    elif period_key == "custom" and custom_start and custom_end:
        start = custom_start
        end = custom_end
        name = f"{custom_start.isoformat()} to {custom_end.isoformat()}"
    else:
        # Default to this month
        start = date(today.year, today.month, 1)
        end = today
        name = "This Month"

    return start, end, name


async def get_dashboard_data(
    db: AsyncSession,
    user_id: str,
    period_key: str = "this_month",
    custom_start: Optional[date] = None,
    custom_end: Optional[date] = None,
) -> DashboardResponse:
    start_date, end_date, _ = resolve_date_range(period_key, custom_start, custom_end)

    # 1. Total Spending & Income
    spending_query = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date,
    )
    income_query = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date >= start_date,
        Transaction.date <= end_date,
    )
    count_query = select(func.count(Transaction.id)).where(
        Transaction.user_id == user_id,
        Transaction.date >= start_date,
        Transaction.date <= end_date,
    )

    tot_spending = (await db.execute(spending_query)).scalar() or 0
    tot_income = (await db.execute(income_query)).scalar() or 0
    tx_count = (await db.execute(count_query)).scalar() or 0
    net_savings = tot_income - tot_spending

    # 2. Budgets for active period
    current_month_str = start_date.strftime("%Y-%m")
    budgets_progress = await calculate_budget_progress(db, user_id, current_month_str)

    # Overall budget calculations
    overall_budget_item = next((b for b in budgets_progress if b.category_id is None), None)
    if overall_budget_item:
        budget_limit = overall_budget_item.limit_cents
        remaining_budget = overall_budget_item.remaining_cents
        utilization = overall_budget_item.utilization_percent
        has_budget = True
    elif len(budgets_progress) > 0:
        budget_limit = sum(b.limit_cents for b in budgets_progress)
        remaining_budget = budget_limit - tot_spending
        utilization = round((tot_spending / budget_limit * 100.0), 2) if budget_limit > 0 else 100.0
        has_budget = True
    else:
        budget_limit = 0
        remaining_budget = 0
        utilization = 0.0
        has_budget = False

    summary = DashboardSummary(
        total_spending_cents=tot_spending,
        total_income_cents=tot_income,
        net_savings_cents=net_savings,
        budget_limit_cents=budget_limit,
        remaining_budget_cents=remaining_budget,
        budget_utilization_percent=utilization,
        has_budget=has_budget,
        transaction_count=tx_count,
    )

    # 3. Timeseries Trend (Grouped by date)
    trend_query = (
        select(
            Transaction.date,
            func.coalesce(
                func.sum(
                    Transaction.amount_cents
                ).filter(Transaction.type == "expense"),
                0,
            ).label("expense_sum"),
            func.coalesce(
                func.sum(
                    Transaction.amount_cents
                ).filter(Transaction.type == "income"),
                0,
            ).label("income_sum"),
        )
        .where(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
        )
        .group_by(Transaction.date)
        .order_by(Transaction.date.asc())
    )
    trend_res = await db.execute(trend_query)
    raw_trend = trend_res.all()

    # Fill continuous dates if range is <= 60 days
    trend_map = {row.date.isoformat(): (row.expense_sum, row.income_sum) for row in raw_trend}
    trend_points: List[SpendingTrendPoint] = []
    days_span = (end_date - start_date).days + 1

    if days_span <= 62:
        curr = start_date
        while curr <= end_date:
            c_str = curr.isoformat()
            exp, inc = trend_map.get(c_str, (0, 0))
            trend_points.append(
                SpendingTrendPoint(
                    date=c_str,
                    spending_cents=exp,
                    income_cents=inc,
                )
            )
            curr += timedelta(days=1)
    else:
        for row in raw_trend:
            trend_points.append(
                SpendingTrendPoint(
                    date=row.date.isoformat(),
                    spending_cents=row.expense_sum,
                    income_cents=row.income_sum,
                )
            )

    # 4. Category Breakdown
    cat_query = (
        select(
            Category.id,
            Category.name,
            Category.color_hex,
            func.sum(Transaction.amount_cents).label("total_spent"),
        )
        .join(Transaction, Transaction.category_id == Category.id, isouter=True)
        .where(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= start_date,
            Transaction.date <= end_date,
        )
        .group_by(Category.id, Category.name, Category.color_hex)
        .order_by(desc("total_spent"))
    )
    cat_res = await db.execute(cat_query)
    cat_rows = cat_res.all()

    category_breakdown: List[CategoryBreakdownItem] = []
    for c in cat_rows:
        pct = round((c.total_spent / tot_spending * 100.0), 2) if tot_spending > 0 else 0.0
        category_breakdown.append(
            CategoryBreakdownItem(
                category_id=c.id,
                category_name=c.name or "Uncategorized",
                category_color=c.color_hex or "#64748B",
                amount_cents=c.total_spent,
                percentage=pct,
            )
        )

    # 5. Recent 5 transactions
    recent_query = (
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(5)
    )
    recent_txs = (await db.execute(recent_query)).scalars().all()

    # 6. Data-backed Financial Insights
    insights: List[InsightItem] = []

    # Overbudget or near-budget insight
    for b in budgets_progress:
        if b.is_over_budget:
            over_amt = abs(b.remaining_cents) / 100.0
            insights.append(
                InsightItem(
                    id=f"overbudget-{b.category_id or 'overall'}",
                    type="budget_warning",
                    title=f"Budget Exceeded: {b.category_name}",
                    description=f"Spending of ${b.spent_cents / 100:.2f} has exceeded your limit of ${b.limit_cents / 100:.2f} by ${over_amt:.2f}.",
                    severity="critical",
                    metric=f"{b.utilization_percent:.1f}% utilized",
                )
            )
        elif b.utilization_percent >= 85.0:
            insights.append(
                InsightItem(
                    id=f"nearbudget-{b.category_id or 'overall'}",
                    type="budget_warning",
                    title=f"Approaching Limit: {b.category_name}",
                    description=f"You have used {b.utilization_percent:.1f}% of your ${b.limit_cents / 100:.2f} budget.",
                    severity="warning",
                    metric=f"${b.remaining_cents / 100:.2f} remaining",
                )
            )

    # Top spending category concentration
    if category_breakdown and tot_spending > 0:
        top_cat = category_breakdown[0]
        if top_cat.percentage >= 40.0:
            insights.append(
                InsightItem(
                    id=f"high-concentration-{top_cat.category_id}",
                    type="top_category",
                    title=f"High Category Concentration: {top_cat.category_name}",
                    description=f"{top_cat.category_name} accounts for {top_cat.percentage:.1f}% (${top_cat.amount_cents / 100:.2f}) of your total spending in this period.",
                    severity="info",
                    metric=f"{top_cat.percentage:.1f}% of total",
                )
            )

    # Savings rate insight
    if tot_income > 0:
        savings_rate = round((net_savings / tot_income) * 100.0, 1)
        if savings_rate >= 20.0:
            insights.append(
                InsightItem(
                    id="healthy-savings-rate",
                    type="savings_rate",
                    title="Healthy Savings Rate",
                    description=f"You have retained {savings_rate:.1f}% of your recorded income (${net_savings / 100:.2f}) during this period.",
                    severity="success",
                    metric=f"{savings_rate:.1f}% saved",
                )
            )

    return DashboardResponse(
        summary=summary,
        trend=trend_points,
        category_breakdown=category_breakdown,
        budgets=budgets_progress,
        recent_transactions=[serialize_transaction(tx) for tx in recent_txs],
        insights=insights,
    )


async def get_history_comparison_data(
    db: AsyncSession,
    user_id: str,
    period_type: str = "month",  # 'month', '3_months', '6_months', 'year'
) -> HistoricalComparisonOut:
    today = date.today()

    if period_type == "month":
        # Current month to date vs Previous month equivalent days
        curr_start = date(today.year, today.month, 1)
        curr_end = today

        # Calculate previous month boundaries
        prev_month_end = curr_start - timedelta(days=1)
        prev_start = date(prev_month_end.year, prev_month_end.month, 1)
        # Match day number or clamp to max days in previous month
        prev_day = min(today.day, prev_month_end.day)
        prev_end = date(prev_month_end.year, prev_month_end.month, prev_day)
        period_name = "Month over Month"
        is_partial = today.day < 28
        explanation = (
            f"Comparing {curr_start.strftime('%b 1')}–{curr_end.strftime('%b %d')} with the equivalent period "
            f"{prev_start.strftime('%b 1')}–{prev_end.strftime('%b %d')}."
        )
    elif period_type == "3_months":
        curr_end = today
        curr_start = today - timedelta(days=89)
        prev_end = curr_start - timedelta(days=1)
        prev_start = prev_end - timedelta(days=89)
        period_name = "Last 3 Months vs Prior 3 Months"
        is_partial = False
        explanation = "Comparing the past 90 days with the preceding 90 days."
    elif period_type == "6_months":
        curr_end = today
        curr_start = today - timedelta(days=179)
        prev_end = curr_start - timedelta(days=1)
        prev_start = prev_end - timedelta(days=179)
        period_name = "Last 6 Months vs Prior 6 Months"
        is_partial = False
        explanation = "Comparing the past 180 days with the preceding 180 days."
    else:  # year
        curr_start = date(today.year, 1, 1)
        curr_end = today
        prev_start = date(today.year - 1, 1, 1)
        prev_day = min(today.day, 28 if (today.month == 2 and today.day == 29) else today.day)
        prev_end = date(today.year - 1, today.month, prev_day)
        period_name = "Year to Date vs Last Year to Date"
        is_partial = True
        explanation = f"Comparing {curr_start.year} YTD with the same date range in {prev_start.year}."

    # Total spending in current vs previous
    curr_sum_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= curr_start,
        Transaction.date <= curr_end,
    )
    prev_sum_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= prev_start,
        Transaction.date <= prev_end,
    )

    curr_total = (await db.execute(curr_sum_q)).scalar() or 0
    prev_total = (await db.execute(prev_sum_q)).scalar() or 0
    abs_diff = curr_total - prev_total

    # Percentage change safe division
    if prev_total > 0:
        pct_change = round(((curr_total - prev_total) / prev_total) * 100.0, 2)
    else:
        pct_change = None  # Explicitly undefined when previous denominator is 0

    # Category comparison breakdown
    # Fetch all categories
    cat_res = await db.execute(
        select(Category).where(or_(Category.user_id == user_id, Category.is_system == True))
    )
    categories = cat_res.scalars().all()

    category_trends: List[CategoryHistoryTrend] = []
    for cat in categories:
        c_curr_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id,
            Transaction.category_id == cat.id,
            Transaction.type == "expense",
            Transaction.date >= curr_start,
            Transaction.date <= curr_end,
        )
        c_prev_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id,
            Transaction.category_id == cat.id,
            Transaction.type == "expense",
            Transaction.date >= prev_start,
            Transaction.date <= prev_end,
        )

        c_curr = (await db.execute(c_curr_q)).scalar() or 0
        c_prev = (await db.execute(c_prev_q)).scalar() or 0

        if c_curr > 0 or c_prev > 0:
            c_diff = c_curr - c_prev
            c_pct = round(((c_curr - c_prev) / c_prev) * 100.0, 2) if c_prev > 0 else None
            category_trends.append(
                CategoryHistoryTrend(
                    category_id=cat.id,
                    category_name=cat.name,
                    category_color=cat.color_hex,
                    current_amount_cents=c_curr,
                    previous_amount_cents=c_prev,
                    absolute_change_cents=c_diff,
                    percentage_change=c_pct,
                )
            )

    # Sort category trends by current spend
    category_trends.sort(key=lambda x: x.current_amount_cents, reverse=True)

    # Historical timeseries (e.g., past 6 months monthly totals)
    trend_history: List[SpendingTrendPoint] = []
    # Generate past 6 months labels
    for i in range(5, -1, -1):
        m_date = today - timedelta(days=i * 30)
        m_start = date(m_date.year, m_date.month, 1)
        if m_date.month == 12:
            m_end = date(m_date.year + 1, 1, 1) - timedelta(days=1)
        else:
            m_end = date(m_date.year, m_date.month + 1, 1) - timedelta(days=1)

        m_exp_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= m_start,
            Transaction.date <= m_end,
        )
        m_inc_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.date >= m_start,
            Transaction.date <= m_end,
        )

        exp_val = (await db.execute(m_exp_q)).scalar() or 0
        inc_val = (await db.execute(m_inc_q)).scalar() or 0

        trend_history.append(
            SpendingTrendPoint(
                date=m_start.strftime("%Y-%m"),
                spending_cents=exp_val,
                income_cents=inc_val,
            )
        )

    return HistoricalComparisonOut(
        period_name=period_name,
        current_range=f"{curr_start.isoformat()} to {curr_end.isoformat()}",
        previous_range=f"{prev_start.isoformat()} to {prev_end.isoformat()}",
        current_spending_cents=curr_total,
        previous_spending_cents=prev_total,
        absolute_difference_cents=abs_diff,
        percentage_change=pct_change,
        is_partial_period=is_partial,
        explanation=explanation,
        category_trends=category_trends,
        trend_history=trend_history,
    )
