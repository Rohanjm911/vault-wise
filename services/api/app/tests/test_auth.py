import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Vaultwise API"


@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    # 1. Register a new user
    register_payload = {
        "email": "testuser@example.com",
        "password": "SuperSecretPassword123!",
        "full_name": "Test User",
    }
    reg_resp = await client.post("/api/v1/auth/register", json=register_payload)
    assert reg_resp.status_code == 201
    user_data = reg_resp.json()
    assert user_data["email"] == "testuser@example.com"
    assert "id" in user_data

    # 2. Duplicate registration should fail
    dup_resp = await client.post("/api/v1/auth/register", json=register_payload)
    assert dup_resp.status_code == 400
    assert "already exists" in dup_resp.json()["detail"]

    # 3. Login with correct credentials
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "SuperSecretPassword123!"},
    )
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    token = token_data["access_token"]

    # 4. Access /auth/me with bearer token
    me_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "testuser@example.com"
    assert me_data["settings"]["currency_code"] == "USD"

    # 5. Invalid password fails
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401
