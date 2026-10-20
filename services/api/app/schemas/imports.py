from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ImportPreviewRow(BaseModel):
    row_number: int
    raw_data: Dict[str, Any]
    detected_date: Optional[str] = None
    detected_amount: Optional[str] = None
    detected_description: Optional[str] = None
    detected_category: Optional[str] = None
    detected_type: Optional[str] = None
    is_valid: bool = True
    validation_error: Optional[str] = None


class ImportPreviewResponse(BaseModel):
    filename: str
    total_rows: int
    headers: List[str]
    suggested_mappings: Dict[str, str]
    preview_rows: List[ImportPreviewRow]
    duplicate_count: int


class ColumnMappingRequest(BaseModel):
    filename: str
    date_column: str
    amount_column: str
    description_column: str
    category_column: Optional[str] = None
    type_column: Optional[str] = None
    notes_column: Optional[str] = None
    duplicate_policy: str = Field(default="skip", pattern="^(skip|overwrite|allow)$")
    date_format: Optional[str] = None


class ImportCommitResponse(BaseModel):
    total_processed: int
    imported_count: int
    skipped_duplicates: int
    failed_count: int
    errors: List[str]
