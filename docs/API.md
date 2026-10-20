# Vaultwise — REST API Specification

## 1. Overview & Conventions

Base URL: `/api/v1`

All requests and responses use `application/json` unless streaming files (`text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/pdf`).

### 1.1 Authentication
Protected endpoints require an HTTP Authorization header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### 1.2 Error Responses
Errors conform to standard RFC 7807 problem details:
```json
{
  "detail": "Descriptive message explaining the validation or business failure",
  "error_code": "INVALID_TRANSACTION_AMOUNT",
  "status_code": 422
}
```

---

## 2. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Creates a new user account and seeds default categories.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "Jane Doe"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "c1f7a0b3-e289-4a0b-9fbf-b620ec4cfd2a",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "created_at": "2026-10-20T00:00:00Z"
  }
  ```

### `POST /auth/login`
Authenticates credentials and returns access and refresh tokens.
- **Request Body**: `OAuth2PasswordRequestForm` or JSON:
  ```json
  {
    "username": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 86400
  }
  ```

### `GET /auth/me`
Retrieves the profile and settings of the authenticated user.
- **Response** (`200 OK`):
  ```json
  {
    "id": "c1f7a0b3-e289-4a0b-9fbf-b620ec4cfd2a",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "settings": {
      "currency_code": "USD",
      "currency_symbol": "$",
      "date_format": "YYYY-MM-DD",
      "theme_mode": "light",
      "ai_consent": false
    }
  }
  ```

---

## 3. Transactions Endpoints (`/transactions`)

### `GET /transactions`
List transactions with pagination, sorting, and multi-criteria filtering.
- **Query Parameters**:
  - `page` (default: 1): Page number.
  - `page_size` (default: 25, max: 100): Rows per page.
  - `start_date` (`YYYY-MM-DD`): Inclusive start date.
  - `end_date` (`YYYY-MM-DD`): Inclusive end date.
  - `category_id` (UUID): Filter by category.
  - `type` (`expense` | `income` | `transfer`): Filter by type.
  - `search` (string): Text search across description and notes.
  - `sort_by` (`date` | `amount_cents`): Sorting field.
  - `sort_order` (`asc` | `desc`): Sorting direction.
- **Response** (`200 OK`):
  ```json
  {
    "items": [
      {
        "id": "7bf317c3-38e5-4299-ba6d-495034cb72e7",
        "category_id": "00a12e20-7f28-4ad0-b8f3-8b770519fbb3",
        "category_name": "Groceries",
        "category_color": "#10B981",
        "amount_cents": 5420,
        "amount_display": "54.20",
        "type": "expense",
        "date": "2026-10-18",
        "description": "Trader Joe's groceries",
        "notes": "Weekly produce and pantry items",
        "created_at": "2026-10-18T14:32:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 25,
    "total_pages": 1
  }
  ```

### `POST /transactions`
Records a new transaction.
- **Request Body**:
  ```json
  {
    "category_id": "00a12e20-7f28-4ad0-b8f3-8b770519fbb3",
    "amount_cents": 5420,
    "type": "expense",
    "date": "2026-10-18",
    "description": "Trader Joe's groceries",
    "notes": "Weekly produce"
  }
  ```

### `PUT /transactions/{id}`
Updates an existing transaction.

### `DELETE /transactions/{id}`
Deletes an existing transaction (`204 No Content`).

---

## 4. Categories Endpoints (`/categories`)

- `GET /categories`: List all categories (system defaults + user customized).
- `POST /categories`: Create a new custom category.
- `PUT /categories/{id}`: Update a user category.
- `DELETE /categories/{id}`: Delete a category (reassigns associated records to "Other").

---

## 5. Budgets Endpoints (`/budgets`)

- `GET /budgets`: Get active budgets for a period (`period=YYYY-MM`).
- `POST /budgets`: Set overall or category budget.
- `DELETE /budgets/{id}`: Delete a budget.

---

## 6. Dashboard & Analytics (`/analytics`)

### `GET /analytics/dashboard`
- **Query Parameters**: `period` (`this_month`, `last_month`, `last_30_days`, `ytd`, `custom`), `start_date`, `end_date`.
- **Response** (`200 OK`):
  ```json
  {
    "summary": {
      "total_spending_cents": 142500,
      "total_income_cents": 400000,
      "net_savings_cents": 257500,
      "budget_limit_cents": 200000,
      "remaining_budget_cents": 57500,
      "budget_utilization_percent": 71.25,
      "transaction_count": 42
    },
    "trend": [
      { "date": "2026-10-01", "spending_cents": 4200, "income_cents": 0 },
      { "date": "2026-10-02", "spending_cents": 11500, "income_cents": 0 }
    ],
    "category_breakdown": [
      {
        "category_id": "...",
        "category_name": "Groceries",
        "category_color": "#10B981",
        "amount_cents": 42000,
        "percentage": 29.47
      }
    ],
    "recent_transactions": [ ... ]
  }
  ```

### `GET /analytics/history`
Historical period comparisons (Current vs. Previous).
- **Query Parameters**: `period_type` (`month`, `3_months`, `6_months`, `year`, `custom`), `reference_date`.

---

## 7. Import & Export (`/imports`, `/exports`)

- `POST /imports/preview`: Parse CSV or Excel file and return column suggestions and 10 preview rows.
- `POST /imports/commit`: Execute import with verified column mapping and duplicate resolution policy.
- `GET /exports/csv`: Stream transactions as CSV.
- `GET /exports/excel`: Stream transactions and summary sheets as `.xlsx`.
- `GET /exports/pdf`: Generate styled, printable summary PDF report.

---

## 8. Settings & Optional AI (`/settings`, `/ai`)

- `GET /settings` / `PUT /settings`: Read/write user preferences.
- `POST /ai/insights`: Generates optional qualitative analysis if user has explicitly enabled `ai_consent`.
