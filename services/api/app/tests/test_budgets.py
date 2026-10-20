import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_budget_calculations_and_edge_cases(client: AsyncClient):
    # Register & Login
    await client.post(
        "/api/v1/auth/register",
        json={"email": "budget_test@example.com", "password": "Password123!", "full_name": "Budget User"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "budget_test@example.com", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch categories
    cat_resp = await client.get("/api/v1/categories", headers=headers)
    categories = cat_resp.json()
    dining_cat = next(c for c in categories if c["name"] == "Food & Dining")

    # 1. Set budget of $200.00 (20000 cents) for 2026-10
    budget_payload = {
        "category_id": dining_cat["id"],
        "period": "2026-10",
        "limit_cents": 20000,
    }
    b_resp = await client.post("/api/v1/budgets", json=budget_payload, headers=headers)
    assert b_resp.status_code == 201
    b_data = b_resp.json()
    assert b_data["limit_cents"] == 20000
    assert b_data["spent_cents"] == 0
    assert b_data["remaining_cents"] == 20000
    assert b_data["utilization_percent"] == 0.0
    assert not b_data["is_over_budget"]

    # 2. Add an expense of $50.00 (5000 cents)
    await client.post(
        "/api/v1/transactions",
        json={
            "category_id": dining_cat["id"],
            "amount_cents": 5000,
            "type": "expense",
            "date": "2026-10-10",
            "description": "Dinner with friends",
        },
        headers=headers,
    )

    # Re-check budget progress: spent should be $50, remaining $150, utilization 25%
    progress_res = await client.get("/api/v1/budgets?period=2026-10", headers=headers)
    assert progress_res.status_code == 200
    budgets = progress_res.json()
    dining_b = next(b for b in budgets if b["category_id"] == dining_cat["id"])
    assert dining_b["spent_cents"] == 5000
    assert dining_b["remaining_cents"] == 15000
    assert dining_b["utilization_percent"] == 25.0
    assert not dining_b["is_over_budget"]

    # 3. Add an expense that exceeds the budget ($200.00 more -> total $250.00 spent on $200.00 budget)
    await client.post(
        "/api/v1/transactions",
        json={
            "category_id": dining_cat["id"],
            "amount_cents": 20000,
            "type": "expense",
            "date": "2026-10-18",
            "description": "Fancy celebratory banquet",
        },
        headers=headers,
    )

    progress_res2 = await client.get("/api/v1/budgets?period=2026-10", headers=headers)
    dining_b2 = next(b for b in progress_res2.json() if b["category_id"] == dining_cat["id"])
    assert dining_b2["spent_cents"] == 25000
    assert dining_b2["remaining_cents"] == -5000  # negative remaining indicates overspending
    assert dining_b2["utilization_percent"] == 125.0
    assert dining_b2["is_over_budget"] is True

    # 4. Zero Budget Edge Case: limit_cents = 0 with spending > 0
    zero_b_resp = await client.post(
        "/api/v1/budgets",
        json={"category_id": dining_cat["id"], "period": "2026-10", "limit_cents": 0},
        headers=headers,
    )
    assert zero_b_resp.status_code == 201
    zero_b = zero_b_resp.json()
    assert zero_b["limit_cents"] == 0
    assert zero_b["remaining_cents"] == -25000
    assert zero_b["is_over_budget"] is True
