from typing import List, Optional
from pydantic import BaseModel
from app.schemas.transaction import TransactionOut
from app.schemas.budget import BudgetProgressOut


class DashboardSummary(BaseModel):
    total_spending_cents: int
    total_income_cents: int
    net_savings_cents: int
    budget_limit_cents: int
    remaining_budget_cents: int
    budget_utilization_percent: float
    has_budget: bool
    transaction_count: int


class SpendingTrendPoint(BaseModel):
    date: str
    spending_cents: int
    income_cents: int


class CategoryBreakdownItem(BaseModel):
    category_id: Optional[str]
    category_name: str
    category_color: str
    amount_cents: int
    percentage: float


class InsightItem(BaseModel):
    id: str
    type: str  # 'budget_warning', 'spending_surge', 'top_category', 'savings_rate', 'pattern'
    title: str
    description: str
    severity: str  # 'info', 'warning', 'critical', 'success'
    metric: Optional[str] = None


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    trend: List[SpendingTrendPoint]
    category_breakdown: List[CategoryBreakdownItem]
    budgets: List[BudgetProgressOut]
    recent_transactions: List[TransactionOut]
    insights: List[InsightItem]


class CategoryHistoryTrend(BaseModel):
    category_id: Optional[str]
    category_name: str
    category_color: str
    current_amount_cents: int
    previous_amount_cents: int
    absolute_change_cents: int
    percentage_change: Optional[float] = None


class HistoricalComparisonOut(BaseModel):
    period_name: str
    current_range: str
    previous_range: str
    current_spending_cents: int
    previous_spending_cents: int
    absolute_difference_cents: int
    percentage_change: Optional[float] = None
    is_partial_period: bool = False
    explanation: Optional[str] = None
    category_trends: List[CategoryHistoryTrend]
    trend_history: List[SpendingTrendPoint]
