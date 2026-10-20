from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.category import Category
from app.services.export_service import generate_csv_export, generate_excel_export, generate_pdf_report

router = APIRouter(prefix="/exports", tags=["Exports"])


async def fetch_filtered_transactions(
    user_id: str,
    db: AsyncSession,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[str] = None,
    type: Optional[str] = None,
):
    filters = [Transaction.user_id == user_id]
    if start_date:
        filters.append(Transaction.date >= start_date)
    if end_date:
        filters.append(Transaction.date <= end_date)
    if category_id:
        filters.append(Transaction.category_id == category_id)
    if type:
        filters.append(Transaction.type == type)

    query = select(Transaction).where(and_(*filters)).order_by(Transaction.date.desc(), Transaction.created_at.desc())
    res = await db.execute(query)
    return res.scalars().all()


CURRENCY_SYMBOLS = {
    "USD": "$",
    "INR": "₹",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "CAD": "$",
    "AUD": "$",
    "AED": "AED",
    "SAR": "SAR",
    "SGD": "S$",
    "CHF": "Fr",
    "CNY": "¥",
    "BRL": "R$",
    "ZAR": "R",
    "KRW": "₩",
    "RUB": "₽",
    "MXN": "$",
    "NZD": "$",
}


def resolve_currency(
    currency_code: Optional[str],
    currency_symbol: Optional[str],
    user: User,
) -> tuple[str, str]:
    user_settings = user.settings
    code = (currency_code or (user_settings.currency_code if user_settings else None) or "USD").upper()
    default_sym = CURRENCY_SYMBOLS.get(code, "$")

    if currency_symbol:
        sym = currency_symbol
    elif user_settings and user_settings.currency_symbol and (not currency_code or currency_code.upper() == user_settings.currency_code.upper()):
        sym = user_settings.currency_symbol
    else:
        sym = default_sym

    return code, sym


@router.get("/csv")
async def export_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[str] = None,
    type: Optional[str] = None,
    currency_code: Optional[str] = None,
    currency_symbol: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resolved_code, resolved_symbol = resolve_currency(currency_code, currency_symbol, current_user)
    txs = await fetch_filtered_transactions(current_user.id, db, start_date, end_date, category_id, type)
    output = generate_csv_export(txs, currency_code=resolved_code, currency_symbol=resolved_symbol)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=vaultwise-transactions-{date.today().isoformat()}.csv"},
    )


@router.get("/excel")
async def export_excel(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[str] = None,
    type: Optional[str] = None,
    currency_code: Optional[str] = None,
    currency_symbol: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resolved_code, resolved_symbol = resolve_currency(currency_code, currency_symbol, current_user)
    txs = await fetch_filtered_transactions(current_user.id, db, start_date, end_date, category_id, type)
    buf = generate_excel_export(txs, currency_code=resolved_code, currency_symbol=resolved_symbol)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=vaultwise-report-{date.today().isoformat()}.xlsx"},
    )


@router.get("/pdf")
async def export_pdf(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[str] = None,
    type: Optional[str] = None,
    currency_code: Optional[str] = None,
    currency_symbol: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resolved_code, resolved_symbol = resolve_currency(currency_code, currency_symbol, current_user)
    txs = await fetch_filtered_transactions(current_user.id, db, start_date, end_date, category_id, type)
    category_name = None
    if category_id:
        cat_res = await db.execute(select(Category).where(Category.id == category_id))
        cat_obj = cat_res.scalar_one_or_none()
        if cat_obj:
            category_name = cat_obj.name

    buf = generate_pdf_report(
        transactions=txs,
        start_date=start_date,
        end_date=end_date,
        category_name=category_name,
        type_filter=type,
        currency_code=resolved_code,
        currency_symbol=resolved_symbol,
    )
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=vaultwise-statement-{date.today().isoformat()}.pdf"},
    )
