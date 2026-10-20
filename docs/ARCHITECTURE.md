# Vaultwise — Architecture & System Design

## 1. System Overview

**Vaultwise** is a privacy-first, professional personal finance analyzer built under the philosophy: **"Your Money. Your Rules."**

The platform delivers a responsive, modern web application accessible via desktop and mobile browsers, built with React, TypeScript, Tailwind CSS, Vite, and Recharts, backed by a FastAPI REST API and a PostgreSQL/SQLite database engine.

```
+--------------------------------------------------------------------------+
|                        VAULTWISE WEB PLATFORM                            |
+--------------------------------------------------------------------------+

      [ WEB FRONTEND APPLICATION ]
+--------------------------------------+
| React 19 + TypeScript + Vite         |
| (Tailwind CSS, Recharts, Lucide)     |
+------------------+-------------------+
                   | HTTPS / JSON API
+------------------v-------------------+
|      FastAPI Backend API             |
| (Python 3.12+ / 3.14 + Pydantic v2)  |
+------------------+-------------------+
                   | Asyncpg / SQLAlchemy 2.0
+------------------v-------------------+
|   PostgreSQL / SQLite Database       |
| (Multi-tenant User Scoped Storage)   |
+--------------------------------------+
```

---

## 2. Technology Stack & Component Responsibilities

### 2.1 Web Application (`apps/web`)
- **Framework**: React 19 / Vite / TypeScript.
- **Styling**: Tailwind CSS adhering strictly to the **solid colors only** design rule. Absolutely NO gradients are permitted anywhere in the layout, cards, buttons, or charts.
- **Charts**: Recharts with flat, high-contrast palette and radial pop-out interactions.
- **State Management**: React Query / Context API for responsive caching and optimistic UI updates.
- **PWA Capabilities**: Service worker caching for shell assets and a web application manifest.

### 2.2 FastAPI Backend (`services/api`)
- **Runtime**: Python 3.12+ / 3.14.
- **API Framework**: FastAPI with Pydantic v2 schemas for strict input validation.
- **Database Access**: SQLAlchemy 2.0 async engine paired with `asyncpg` for PostgreSQL and SQLite for local development and automated unit tests.
- **Migrations**: Alembic for version-controlled, reproducible schema revisions.
- **Authentication**: JWT tokens (Access + Refresh) with bcrypt password hashing ($\ge 12$ rounds).
- **Import/Export Engine**: In-memory spreadsheet parsing via `openpyxl` with formulas disabled, defensive CSV parsing, and PDF report generation.

---

## 4. Financial Domain Rules & Precision Safety

1. **Precision Rule**: Binary floating-point numbers (`f32`, `f64`, `double`) are strictly prohibited for storing or computing monetary sums.
   - Database: Integer cents (`BIGINT` or `INTEGER`), representing `$14.99` as `1499`.
   - API / UI: Formatted with exact two-decimal fixed representation (`14.99`).
2. **Deterministic Calculations**:
   - Budget remaining = $\text{Budget Limit} - \text{Eligible Spending}$.
   - Overspending = when remaining is negative.
   - History percentage change: Handled gracefully when denominator is zero (reported as "N/A" rather than division by zero or infinity).
3. **Category Integrity**: Deleting a category never deletes or cascades out transactions. Existing records are transferred to an "Other" fallback category.

---

## 5. Security Architecture Highlights

- **Principle of Least Privilege**: All API endpoints authenticate the bearer token and inject `current_user` into every query filter.
- **Zero Cloud Leakage on Desktop**: The Flutter desktop application has no networking permissions configured for financial telemetry.
- **Safe File Import**: CSV and Excel files are treated as untrusted user input; spreadsheet formula execution is strictly disabled.
- **Defense in Depth**: Solid-state security with CSRF mitigation, HTTP-only secure cookies or bearer headers, strict rate limiting on authentication routes, and defensive sanitization of text searches.
