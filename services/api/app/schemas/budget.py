from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict


class BudgetBase(BaseModel):
    category_id: Optional[str] = None
    period: str = Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$", description="Period formatted as YYYY-MM")
    limit_cents: int = Field(ge=0, description="Budget cap in minor units")


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    limit_cents: int = Field(ge=0)


class BudgetOut(BudgetBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime


class BudgetProgressOut(BaseModel):
    id: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    period: str
    limit_cents: int
    spent_cents: int
    remaining_cents: int
    utilization_percent: float
    is_over_budget: bool
