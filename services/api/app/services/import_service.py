import io
import csv
import re
from datetime import datetime, date
from typing import Dict, Any, List, Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import openpyxl
from dateutil import parser as date_parser

from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.imports import ImportPreviewResponse, ImportPreviewRow, ColumnMappingRequest, ImportCommitResponse


def sanitize_cell_value(val: Any) -> str:
    if val is None:
        return ""
    s = str(val).strip()
    # CSV / Formula Injection defense: prepend single quote if cell starts with formula tokens
    if s and s[0] in ("=", "+", "-", "@", "\t", "\r"):
        # If it's a negative number like -14.99, allow it for amount parsing
        if not re.match(r"^-\d+(\.\d+)?$", s):
            s = "'" + s
    return s


def parse_amount_to_cents(amount_str: str) -> Tuple[int, str]:
    # Returns (cents, type: 'expense' | 'income')
    clean = re.sub(r"[^\d\.\-\+]", "", str(amount_str).strip())
    if not clean:
        raise ValueError("Amount is empty")

    val = float(clean)
    cents = int(round(abs(val) * 100))
    tx_type = "expense" if val < 0 else "expense"  # default to expense unless marked income
    return cents, tx_type


def parse_date_str(date_str: str, custom_format: Optional[str] = None) -> date:
    s = str(date_str).strip()
    if custom_format:
        try:
            return datetime.strptime(s, custom_format).date()
        except Exception:
            pass

    # Fallback to dateutil parser
    dt = date_parser.parse(s, dayfirst=False, fuzzy=True)
    return dt.date()


async def preview_uploaded_file(
    file: UploadFile,
    user_id: str,
    db: AsyncSession,
) -> ImportPreviewResponse:
    content = await file.read()
    filename = file.filename or "statement.csv"
    ext = filename.lower().split(".")[-1]

    rows_data: List[Dict[str, Any]] = []
    headers: List[str] = []

    if ext == "csv":
        # Decode CSV with UTF-8 fallback
        try:
            text = content.decode("utf-8-sig")
        except UnicodeDecodeError:
            text = content.decode("latin-1")

        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            raise HTTPException(status_code=400, detail="CSV file has no headers.")
        headers = [h.strip() for h in reader.fieldnames if h]

        for i, row in enumerate(reader):
            if i >= 1000:  # limit preview parsing
                break
            rows_data.append({k.strip(): sanitize_cell_value(v) for k, v in row.items() if k})

    elif ext in ("xlsx", "xls"):
        # Excel: Openpyxl with data_only=True (disables formula execution)
        wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True, read_only=True)
        sheet = wb.active
        iter_rows = sheet.iter_rows(values_only=True)
        raw_headers = next(iter_rows, None)
        if not raw_headers:
            raise HTTPException(status_code=400, detail="Excel spreadsheet is empty.")

        headers = [str(h).strip() for h in raw_headers if h is not None]
        for i, row in enumerate(iter_rows):
            if i >= 1000:
                break
            row_dict = {}
            for col_idx, h in enumerate(headers):
                cell_val = row[col_idx] if col_idx < len(row) else ""
                row_dict[h] = sanitize_cell_value(cell_val)
            rows_data.append(row_dict)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload .csv or .xlsx files only.",
        )

    if not rows_data:
        raise HTTPException(status_code=400, detail="No data rows found in the uploaded file.")

    # Suggest mappings
    suggested: Dict[str, str] = {}
    lower_headers = {h.lower(): h for h in headers}

    for lh, h in lower_headers.items():
        if any(k in lh for k in ["date", "time", "posted"]):
            if "date" not in suggested:
                suggested["date"] = h
        elif any(k in lh for k in ["amount", "total", "debit", "cost", "sum"]):
            if "amount" not in suggested:
                suggested["amount"] = h
        elif any(k in lh for k in ["desc", "memo", "payee", "merchant", "narrative", "name"]):
            if "description" not in suggested:
                suggested["description"] = h
        elif any(k in lh for k in ["cat", "category"]):
            if "category" not in suggested:
                suggested["category"] = h
        elif any(k in lh for k in ["type"]):
            if "type" not in suggested:
                suggested["type"] = h

    # Check for duplicates on preview sample
    preview_items: List[ImportPreviewRow] = []
    duplicate_count = 0

    date_col = suggested.get("date")
    amt_col = suggested.get("amount")
    desc_col = suggested.get("description")

    for i, row in enumerate(rows_data[:10]):
        row_num = i + 1
        is_val = True
        err_msg = None
        d_val = None
        a_val = None
        tx_type = "expense"

        try:
            if date_col and row.get(date_col):
                parsed_d = parse_date_str(row[date_col])
                d_val = parsed_d.isoformat()
            if amt_col and row.get(amt_col):
                cents, tx_type = parse_amount_to_cents(row[amt_col])
                a_val = f"{cents / 100:.2f}"
        except Exception as e:
            is_val = False
            err_msg = str(e)

        preview_items.append(
            ImportPreviewRow(
                row_number=row_num,
                raw_data=row,
                detected_date=d_val,
                detected_amount=a_val,
                detected_description=row.get(desc_col, "") if desc_col else "",
                detected_category=row.get(suggested.get("category", ""), ""),
                detected_type=tx_type,
                is_valid=is_val,
                validation_error=err_msg,
            )
        )

    return ImportPreviewResponse(
        filename=filename,
        total_rows=len(rows_data),
        headers=headers,
        suggested_mappings=suggested,
        preview_rows=preview_items,
        duplicate_count=duplicate_count,
    )


async def execute_import(
    file_content: bytes,
    filename: str,
    mapping: ColumnMappingRequest,
    user_id: str,
    db: AsyncSession,
) -> ImportCommitResponse:
    ext = filename.lower().split(".")[-1]
    rows_data: List[Dict[str, Any]] = []

    if ext == "csv":
        try:
            text = file_content.decode("utf-8-sig")
        except UnicodeDecodeError:
            text = file_content.decode("latin-1")
        reader = csv.DictReader(io.StringIO(text))
        for row in reader:
            rows_data.append({k.strip(): sanitize_cell_value(v) for k, v in row.items() if k})
    else:
        wb = openpyxl.load_workbook(io.BytesIO(file_content), data_only=True, read_only=True)
        sheet = wb.active
        iter_rows = sheet.iter_rows(values_only=True)
        raw_headers = next(iter_rows, None)
        headers = [str(h).strip() for h in raw_headers if h is not None]
        for row in iter_rows:
            row_dict = {}
            for col_idx, h in enumerate(headers):
                cell_val = row[col_idx] if col_idx < len(row) else ""
                row_dict[h] = sanitize_cell_value(cell_val)
            rows_data.append(row_dict)

    # Fetch user categories for auto-matching
    cat_res = await db.execute(select(Category).where(Category.user_id == user_id))
    categories = {c.name.lower(): c.id for c in cat_res.scalars().all()}
    fallback_cat_id = categories.get("other")

    batch_id = f"import-{int(datetime.now().timestamp())}"
    imported_count = 0
    skipped_duplicates = 0
    failed_count = 0
    errors: List[str] = []

    for idx, row in enumerate(rows_data):
        row_num = idx + 1
        try:
            raw_date = row.get(mapping.date_column)
            raw_amt = row.get(mapping.amount_column)
            raw_desc = row.get(mapping.description_column)

            if not raw_date or not raw_amt or not raw_desc:
                failed_count += 1
                errors.append(f"Row {row_num}: Missing required fields (date, amount, or description).")
                continue

            parsed_date = parse_date_str(raw_date, mapping.date_format)
            cents, parsed_type = parse_amount_to_cents(raw_amt)

            # If user mapped an explicit type column
            if mapping.type_column and row.get(mapping.type_column):
                t_val = str(row[mapping.type_column]).lower()
                if "inc" in t_val or "credit" in t_val:
                    parsed_type = "income"
                elif "transfer" in t_val:
                    parsed_type = "transfer"
                else:
                    parsed_type = "expense"

            # Match category
            cat_id = fallback_cat_id
            if mapping.category_column and row.get(mapping.category_column):
                cat_str = str(row[mapping.category_column]).lower().strip()
                if cat_str in categories:
                    cat_id = categories[cat_str]

            notes = row.get(mapping.notes_column) if mapping.notes_column else None

            # Duplicate check: (user_id, date, amount_cents, type)
            dup_q = select(Transaction).where(
                Transaction.user_id == user_id,
                Transaction.date == parsed_date,
                Transaction.amount_cents == cents,
                Transaction.type == parsed_type,
                Transaction.description == raw_desc.strip(),
            )
            existing_dup = (await db.execute(dup_q)).scalars().first()

            if existing_dup:
                if mapping.duplicate_policy == "skip":
                    skipped_duplicates += 1
                    continue
                elif mapping.duplicate_policy == "overwrite":
                    existing_dup.category_id = cat_id
                    existing_dup.notes = notes
                    existing_dup.import_batch_id = batch_id
                    imported_count += 1
                    continue

            # Insert transaction
            tx = Transaction(
                user_id=user_id,
                category_id=cat_id,
                amount_cents=cents,
                type=parsed_type,
                date=parsed_date,
                description=raw_desc.strip(),
                notes=notes,
                import_batch_id=batch_id,
            )
            db.add(tx)
            imported_count += 1

        except Exception as e:
            failed_count += 1
            errors.append(f"Row {row_num}: {str(e)}")

    await db.commit()
    return ImportCommitResponse(
        total_processed=len(rows_data),
        imported_count=imported_count,
        skipped_duplicates=skipped_duplicates,
        failed_count=failed_count,
        errors=errors[:20],  # cap returned errors
    )
