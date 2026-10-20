import math
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionOut,
    TransactionPagination,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def serialize_transaction(tx: Transaction) -> TransactionOut:
    amount_dollars = f"{tx.amount_cents / 100:.2f}"
    return TransactionOut(
        id=tx.id,
        user_id=tx.user_id,
        category_id=tx.category_id,
        category_name=tx.category.name if tx.category else "Uncategorized",
        category_color=tx.category.color_hex if tx.category else "#64748B",
        amount_cents=tx.amount_cents,
        amount_display=amount_dollars,
        type=tx.type,
        date=tx.date,
        description=tx.description,
        notes=tx.notes,
        import_batch_id=tx.import_batch_id,
        created_at=tx.created_at,
        updated_at=tx.updated_at,
    )


@router.get("", response_model=TransactionPagination)
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[str] = None,
    type: Optional[str] = Query(None, pattern="^(expense|income|transfer)$"),
    search: Optional[str] = None,
    min_amount_cents: Optional[int] = Query(None, ge=0),
    max_amount_cents: Optional[int] = Query(None, ge=0),
    sort_by: str = Query("date", pattern="^(date|amount_cents|description)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    filters = [Transaction.user_id == current_user.id]

    if start_date:
        filters.append(Transaction.date >= start_date)
    if end_date:
        filters.append(Transaction.date <= end_date)
    if category_id:
        filters.append(Transaction.category_id == category_id)
    if type:
        filters.append(Transaction.type == type)
    if min_amount_cents is not None:
        filters.append(Transaction.amount_cents >= min_amount_cents)
    if max_amount_cents is not None:
        filters.append(Transaction.amount_cents <= max_amount_cents)
    if search:
        search_pattern = f"%{search.strip()}%"
        filters.append(
            or_(
                Transaction.description.ilike(search_pattern),
                Transaction.notes.ilike(search_pattern),
            )
        )

    # Count total
    count_query = select(func.count(Transaction.id)).where(and_(*filters))
    total_count_res = await db.execute(count_query)
    total = total_count_res.scalar() or 0

    # Build ordering
    sort_column = getattr(Transaction, sort_by)
    order_clause = desc(sort_column) if sort_order == "desc" else asc(sort_column)

    # Query items with pagination
    offset = (page - 1) * page_size
    query = (
        select(Transaction)
        .where(and_(*filters))
        .order_by(order_clause, desc(Transaction.created_at))
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)
    transactions = result.scalars().all()

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return TransactionPagination(
        items=[serialize_transaction(tx) for tx in transactions],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify category if provided
    if payload.category_id:
        cat_result = await db.execute(
            select(Category).where(
                Category.id == payload.category_id,
                or_(Category.user_id == current_user.id, Category.is_system == True),
            )
        )
        if not cat_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected category does not exist or does not belong to user.",
            )

    tx = Transaction(
        user_id=current_user.id,
        category_id=payload.category_id,
        amount_cents=payload.amount_cents,
        type=payload.type,
        date=payload.date,
        description=payload.description.strip(),
        notes=payload.notes.strip() if payload.notes else None,
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return serialize_transaction(tx)


@router.get("/{tx_id}", response_model=TransactionOut)
async def get_transaction(
    tx_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.id == tx_id, Transaction.user_id == current_user.id)
    )
    tx = result.scalars().first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    return serialize_transaction(tx)


@router.put("/{tx_id}", response_model=TransactionOut)
async def update_transaction(
    tx_id: str,
    payload: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.id == tx_id, Transaction.user_id == current_user.id)
    )
    tx = result.scalars().first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

    if payload.category_id is not None:
        cat_result = await db.execute(
            select(Category).where(
                Category.id == payload.category_id,
                or_(Category.user_id == current_user.id, Category.is_system == True),
            )
        )
        if not cat_result.scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category.")
        tx.category_id = payload.category_id

    if payload.amount_cents is not None:
        tx.amount_cents = payload.amount_cents
    if payload.type is not None:
        tx.type = payload.type
    if payload.date is not None:
        tx.date = payload.date
    if payload.description is not None:
        tx.description = payload.description.strip()
    if payload.notes is not None:
        tx.notes = payload.notes.strip() if payload.notes else None

    await db.commit()
    await db.refresh(tx)
    return serialize_transaction(tx)


@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    tx_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.id == tx_id, Transaction.user_id == current_user.id)
    )
    tx = result.scalars().first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

    await db.delete(tx)
    await db.commit()
    return None
