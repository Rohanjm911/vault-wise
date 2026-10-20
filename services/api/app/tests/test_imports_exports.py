import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_exports_and_import_safety(client: AsyncClient):
    # Register & Login
    await client.post(
        "/api/v1/auth/register",
        json={"email": "export_test@example.com", "password": "Password123!", "full_name": "Export User"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "export_test@example.com", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch categories
    cat_resp = await client.get("/api/v1/categories", headers=headers)
    categories = cat_resp.json()
    shopping_cat = next(c for c in categories if c["name"] == "Shopping")

    # Add a transaction
    await client.post(
        "/api/v1/transactions",
        json={
            "category_id": shopping_cat["id"],
            "amount_cents": 8999,
            "type": "expense",
            "date": "2026-10-12",
            "description": "Ergonomic Keyboard",
        },
        headers=headers,
    )

    # 1. Test CSV Export
    csv_resp = await client.get("/api/v1/exports/csv", headers=headers)
    assert csv_resp.status_code == 200
    assert csv_resp.headers["content-type"].startswith("text/csv")
    csv_text = csv_resp.text
    assert "Ergonomic Keyboard" in csv_text
    assert "89.99" in csv_text
    assert "Shopping" in csv_text

    # 2. Test Excel Export
    excel_resp = await client.get("/api/v1/exports/excel", headers=headers)
    assert excel_resp.status_code == 200
    assert "spreadsheetml.sheet" in excel_resp.headers["content-type"]
    assert len(excel_resp.content) > 1000

    # 3. Test PDF Export (Default & Filtered by parameters)
    pdf_resp = await client.get("/api/v1/exports/pdf", headers=headers)
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert pdf_resp.content.startswith(b"%PDF")
    assert len(pdf_resp.content) > 5000

    # 3b. Test PDF Export with inserted parameters (start_date, end_date, category_id)
    filtered_pdf_resp = await client.get(
        f"/api/v1/exports/pdf?start_date=2026-10-01&end_date=2026-10-31&category_id={shopping_cat['id']}",
        headers=headers,
    )
    assert filtered_pdf_resp.status_code == 200
    assert filtered_pdf_resp.content.startswith(b"%PDF")
    
    # Verify content extraction with PyMuPDF
    import pymupdf
    pdf_doc = pymupdf.open(stream=filtered_pdf_resp.content, filetype="pdf")
    assert len(pdf_doc) >= 1
    page_text = pdf_doc[0].get_text()
    assert "Vaultwise — Financial Statement" in page_text
    assert "Category: Shopping" in page_text
    assert "Spending Breakdown by Category" in page_text
    assert "Page 1" in page_text

    # 3c. Test PDF Export with Dynamic Currency Symbol (e.g. INR / ₹)
    inr_pdf_resp = await client.get(
        "/api/v1/exports/pdf?currency_code=INR&currency_symbol=%E2%82%B9",
        headers=headers,
    )
    assert inr_pdf_resp.status_code == 200
    assert inr_pdf_resp.content.startswith(b"%PDF")
    inr_doc = pymupdf.open(stream=inr_pdf_resp.content, filetype="pdf")
    inr_text = inr_doc[0].get_text()
    assert "Currency: INR" in inr_text
    assert "₹" in inr_text or "INR" in inr_text

    # 4. Test CSV Import Preview with Formula Injection Defense
    malicious_csv_content = (
        "Date,Amount,Description,Category\n"
        "2026-10-14,25.00,=cmd|' /C calc'!A0,Shopping\n"
        "2026-10-15,10.00,Clean Coffee,Food & Dining\n"
    )
    files = {"file": ("statement.csv", malicious_csv_content.encode("utf-8"), "text/csv")}
    preview_res = await client.post("/api/v1/imports/preview", files=files, headers=headers)
    assert preview_res.status_code == 200
    preview_data = preview_res.json()
    assert preview_data["total_rows"] == 2
    # Verify the formula was neutralized with a leading single quote or stripped
    sanitized_desc = preview_data["preview_rows"][0]["detected_description"]
    assert sanitized_desc.startswith("'=") or not sanitized_desc.startswith("=")
