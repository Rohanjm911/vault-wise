from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    type: str = Field(default="expense", pattern="^(expense|income)$")
    color_hex: str = Field(default="#2563EB", pattern="^#[0-9A-Fa-f]{6}$")
    icon_name: str = Field(default="tag", max_length=50)

    @field_validator("name")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Category name cannot be empty")
        return stripped


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    type: Optional[str] = Field(None, pattern="^(expense|income)$")
    color_hex: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon_name: Optional[str] = Field(None, max_length=50)


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    is_system: bool = False
    created_at: datetime
