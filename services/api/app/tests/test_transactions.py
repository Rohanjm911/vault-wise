import pytest
from httpx import AsyncClient


async def get_authenticated_user_token(client: AsyncClient, email: str = "txuser@example.com") -> str:
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Tx User"},
    )
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_transaction_crud_and_validation(client: AsyncClient):
    token = await get_authenticated_user_token(client, "crud_tx@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch seeded categories
    cat_resp = await client.get("/api/v1/categories", headers=headers)
    assert cat_resp.status_code == 200
    categories = cat_resp.json()
    assert len(categories) >= 12
    grocery_cat = next(c for c in categories if c["name"] == "Groceries")

    # 2. Add an expense transaction ($45.50 -> 4550 cents)
    tx_payload = {
        "category_id": grocery_cat["id"],
        "amount_cents": 4550,
        "type": "expense",
        "date": "2026-10-15",
        "description": "Weekly Whole Foods",
        "notes": "Produce and dairy",
    }
    create_resp = await client.post("/api/v1/transactions", json=tx_payload, headers=headers)
    assert create_resp.status_code == 201
    created_tx = create_resp.json()
    assert created_tx["amount_cents"] == 4550
    assert created_tx["amount_display"] == "45.50"
    assert created_tx["category_name"] == "Groceries"
    tx_id = created_tx["id"]

    # 3. Negative amounts must be rejected by validation
    invalid_tx = {
        "category_id": grocery_cat["id"],
        "amount_cents": -500,
        "type": "expense",
        "date": "2026-10-15",
        "description": "Negative spending",
    }
    inv_resp = await client.post("/api/v1/transactions", json=invalid_tx, headers=headers)
    assert inv_resp.status_code == 422

    # 4. Filter transactions by category and search
    search_resp = await client.get("/api/v1/transactions?search=Foods", headers=headers)
    assert search_resp.status_code == 200
    results = search_resp.json()
    assert results["total"] == 1
    assert results["items"][0]["id"] == tx_id

    # 5. Update transaction
    update_resp = await client.put(
        f"/api/v1/transactions/{tx_id}",
        json={"amount_cents": 5000, "description": "Weekly Whole Foods - Updated"},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["amount_cents"] == 5000
    assert update_resp.json()["amount_display"] == "50.00"

    # 6. Delete transaction
    del_resp = await client.delete(f"/api/v1/transactions/{tx_id}", headers=headers)
    assert del_resp.status_code == 204

    # 7. Confirm deleted
    get_resp = await client.get(f"/api/v1/transactions/{tx_id}", headers=headers)
    assert get_resp.status_code == 404
