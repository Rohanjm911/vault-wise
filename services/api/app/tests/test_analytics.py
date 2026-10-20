from datetime import date
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard_and_history_analytics(client: AsyncClient):
    # Register & Login
    await client.post(
        "/api/v1/auth/register",
        json={"email": "analytics_test@example.com", "password": "Password123!", "full_name": "Analytics User"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "analytics_test@example.com", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch categories
    cat_resp = await client.get("/api/v1/categories", headers=headers)
    categories = cat_resp.json()
    housing_cat = next(c for c in categories if c["name"] == "Housing & Rent")
    salary_cat = next(c for c in categories if c["name"] == "Salary & Income")

    today = date.today().isoformat()

    # Empty Dashboard Test
    dash_empty = await client.get("/api/v1/analytics/dashboard?period=this_month", headers=headers)
    assert dash_empty.status_code == 200
    empty_data = dash_empty.json()
    assert empty_data["summary"]["total_spending_cents"] == 0
    assert empty_data["summary"]["total_income_cents"] == 0
    assert empty_data["summary"]["transaction_count"] == 0

    # Add Income ($3,500.00 -> 350000 cents)
    await client.post(
        "/api/v1/transactions",
        json={
            "category_id": salary_cat["id"],
            "amount_cents": 350000,
            "type": "income",
            "date": today,
            "description": "Monthly Salary",
        },
        headers=headers,
    )

    # Add Housing Expense ($1,200.00 -> 120000 cents)
    await client.post(
        "/api/v1/transactions",
        json={
            "category_id": housing_cat["id"],
            "amount_cents": 120000,
            "type": "expense",
            "date": today,
            "description": "Apartment Rent",
        },
        headers=headers,
    )

    # Check Populated Dashboard
    dash_pop = await client.get("/api/v1/analytics/dashboard?period=this_month", headers=headers)
    assert dash_pop.status_code == 200
    pop_data = dash_pop.json()
    assert pop_data["summary"]["total_spending_cents"] == 120000
    assert pop_data["summary"]["total_income_cents"] == 350000
    assert pop_data["summary"]["net_savings_cents"] == 230000
    assert pop_data["summary"]["transaction_count"] == 2
    assert len(pop_data["category_breakdown"]) == 1
    assert pop_data["category_breakdown"][0]["category_name"] == "Housing & Rent"
    assert pop_data["category_breakdown"][0]["percentage"] == 100.0

    # Check History Comparison (Previous month had 0 spending -> percentage_change must be None, not DivisionByZero!)
    history_resp = await client.get("/api/v1/analytics/history?period_type=month", headers=headers)
    assert history_resp.status_code == 200
    hist_data = history_resp.json()
    assert hist_data["current_spending_cents"] == 120000
    assert hist_data["previous_spending_cents"] == 0
    assert hist_data["percentage_change"] is None  # Safe handling of zero denominator
