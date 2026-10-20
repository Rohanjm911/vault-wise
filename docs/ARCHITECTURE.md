# Vaultwise — Architecture & System Design

## 1. System Overview

**Vaultwise** is a privacy-first, professional personal finance analyzer built under the philosophy: **"Your Money. Your Rules."**

The project delivers two distinct client applications:
1. **Web Application**: Accessible via modern desktop and mobile browsers, built with React, TypeScript, Tailwind CSS, Vite, and Recharts, backed by a FastAPI REST API and a PostgreSQL database.
2. **Native Windows Desktop Application**: An offline-first, locally encrypted desktop application built with Flutter & Dart, storing data in an encrypted SQLite database using SQLCipher and Windows secure credential protection.

```
+--------------------------------------------------------------------------+
|                               VAULTWISE                                  |
+--------------------------------------------------------------------------+

      [ WEB PLATFORM ]                                 [ WINDOWS DESKTOP ]
+---------------------------+                     +---------------------------+
| React + TypeScript + Vite |                     | Flutter Desktop (Windows) |
| (Tailwind CSS, Recharts)  |                     | (Material / Fluent Style) |
+-------------+-------------+                     +-------------+-------------+
              | HTTPS / JSON                                    | Direct FFI
+-------------v-------------+                     +-------------v-------------+
|    FastAPI Backend API    |                     | Local Database Engine     |
| (Python 3.14 + Pydantic)  |                     | (SQLite + SQLCipher AES)  |
+-------------+-------------+                     +-------------+-------------+
              | Asyncpg / SQLAlchemy                            | Windows DPAPI
+-------------v-------------+                     +-------------v-------------+
|   PostgreSQL 18 Database  |                     | Windows Credential Locker |
| (Multi-tenant User Scoped)|                     | (Local Encryption Key)    |
+---------------------------+                     +---------------------------+

               \                                               /
                \-- User-Initiated Export / Import (CSV/JSON) -/
                    (NO automatic or silent background sync)
```

---

## 2. Mandatory Data Isolation: Why Web and Desktop Remain Separate

A primary requirement of Vaultwise is **strict data separation by default**:

- **No Automatic Synchronization**: The desktop application operates completely offline without reporting financial data to any server or cloud database.
- **Privacy Assurance**: Users who prefer local-only custody of their finances can use the Windows application with zero telemetry, zero accounts, and zero cloud exposure.
- **Independent Data Models**: The web application persists data in PostgreSQL with multi-tenant row-level authorization. The desktop application persists data in an encrypted SQLite file on the local machine.
- **User-Initiated Interoperability**: If a user wishes to migrate or transfer records between desktop and web, they must perform an **explicit, user-initiated export and import** workflow. The system warns about potential duplicates and requires review before applying imported records.

---

## 3. Technology Stack & Component Responsibilities

### 3.1 Web Application (`apps/web`)
- **Framework**: React 19 / Vite / TypeScript.
- **Styling**: Tailwind CSS adhering strictly to the **solid colors only** design rule. Absolutely NO gradients are permitted anywhere in the layout, cards, buttons, or charts.
- **Charts**: Recharts with flat, high-contrast palette.
- **State Management**: React Query / Context API for responsive caching and optimistic UI updates.
- **PWA Capabilities**: Service worker caching for shell assets and a web application manifest.

### 3.2 FastAPI Backend (`services/api`)
- **Runtime**: Python 3.14.
- **API Framework**: FastAPI with Pydantic v2 schemas for strict input validation.
- **Database Access**: SQLAlchemy 2.0 async engine paired with `asyncpg` for PostgreSQL and SQLite for automated unit tests.
- **Migrations**: Alembic for version-controlled, reproducible schema revisions.
- **Authentication**: JWT tokens (Access + Refresh) with bcrypt password hashing ($\ge 12$ rounds).
- **Import/Export Engine**: In-memory spreadsheet parsing via `openpyxl` with formulas disabled, defensive CSV parsing, and PDF report generation.

### 3.3 Windows Desktop Application (`apps/desktop`)
- **Framework**: Flutter 3.47+ / Dart 3.13+.
- **Platform Target**: Native Windows desktop (`windows-x64`).
- **Persistence**: SQLite with SQLCipher encryption (`sqflite_common_ffi` with encryption pragma).
- **Key Storage**: Windows Credential Locker / DPAPI via `flutter_secure_storage` with Windows DPAPI backend.
- **Financial Calculations**: Pure Dart domain layer sharing the same calculation formulas and precision rules as the web service.

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
