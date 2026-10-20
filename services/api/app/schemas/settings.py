from typing import Optional
from pydantic import BaseModel, Field


class SettingsUpdate(BaseModel):
    currency_code: Optional[str] = Field(None, min_length=3, max_length=3)
    currency_symbol: Optional[str] = Field(None, min_length=1, max_length=5)
    date_format: Optional[str] = Field(None, max_length=20)
    theme_mode: Optional[str] = Field(None, pattern="^(light|dark)$")
    ai_consent: Optional[bool] = None
