from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict


class TransactionBase(BaseModel):
    category_id: Optional[str] = None
    amount_cents: int = Field(gt=0, description="Amount in minor units, e.g. 1050 for $10.50")
    type: str = Field(default="expense", pattern="^(expense|income|transfer)$")
    date: date
    description: str = Field(min_length=1, max_length=255)
    notes: Optional[str] = Field(None, max_length=2000)

    @field_validator("description")
    @classmethod
    def clean_description(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Description cannot be blank")
        return s


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    category_id: Optional[str] = None
    amount_cents: Optional[int] = Field(None, gt=0)
    type: Optional[str] = Field(None, pattern="^(expense|income|transfer)$")
    date: Optional[date] = None
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    notes: Optional[str] = Field(None, max_length=2000)


class TransactionOut(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    amount_display: str
    import_batch_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class TransactionPagination(BaseModel):
    items: List[TransactionOut]
    total: int
    page: int
    page_size: int
    total_pages: int
