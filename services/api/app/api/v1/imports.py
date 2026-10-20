from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.imports import ImportPreviewResponse, ImportCommitResponse, ColumnMappingRequest
from app.services.import_service import preview_uploaded_file, execute_import

router = APIRouter(prefix="/imports", tags=["Imports"])


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected.")
    return await preview_uploaded_file(file, current_user.id, db)


@router.post("/commit", response_model=ImportCommitResponse)
async def commit_import(
    file: UploadFile = File(...),
    mapping_json: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        mapping_dict = json.loads(mapping_json)
        mapping = ColumnMappingRequest(**mapping_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid column mapping configuration: {str(e)}")

    content = await file.read()
    filename = file.filename or "statement.csv"

    return await execute_import(
        file_content=content,
        filename=filename,
        mapping=mapping,
        user_id=current_user.id,
        db=db,
    )
