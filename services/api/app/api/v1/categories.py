from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, update

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryOut])
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Category)
        .where(or_(Category.user_id == current_user.id, Category.is_system == True))
        .order_by(Category.name.asc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check duplicate category name for this user
    existing = await db.execute(
        select(Category).where(
            Category.user_id == current_user.id,
            Category.name.ilike(payload.name),
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with name '{payload.name}' already exists.",
        )

    category = Category(
        user_id=current_user.id,
        name=payload.name,
        type=payload.type,
        color_hex=payload.color_hex,
        icon_name=payload.icon_name,
        is_system=False,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: str,
    payload: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.user_id == current_user.id)
    )
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    if payload.name is not None:
        category.name = payload.name
    if payload.type is not None:
        category.type = payload.type
    if payload.color_hex is not None:
        category.color_hex = payload.color_hex
    if payload.icon_name is not None:
        category.icon_name = payload.icon_name

    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.user_id == current_user.id)
    )
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    if category.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="System categories cannot be deleted.",
        )

    # Reassign existing transactions to fallback 'Other' category if available, or set to null
    other_cat_result = await db.execute(
        select(Category).where(
            Category.user_id == current_user.id,
            Category.name == "Other",
        )
    )
    other_cat = other_cat_result.scalars().first()
    fallback_id = other_cat.id if other_cat else None

    await db.execute(
        update(Transaction)
        .where(Transaction.user_id == current_user.id, Transaction.category_id == category_id)
        .values(category_id=fallback_id)
    )

    await db.delete(category)
    await db.commit()
    return None
