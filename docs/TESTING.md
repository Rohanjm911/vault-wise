# Vaultwise — Testing Strategy & Verification Guide

## 1. Quality & Verification Philosophy

Vaultwise follows a rigorous test-driven approach to ensure monetary accuracy and system stability.
**Rule**: No feature is marked "verified" without passing automated tests.

---

## 2. Test Suites Overview

### 2.1 Backend Tests (`services/api/app/tests/`)
- **Framework**: `pytest`, `pytest-asyncio`, `httpx` (`AsyncClient`).
- **Target Coverage**:
  - `test_auth.py`: User registration, login, token refresh, duplicate emails, password validation.
  - `test_transactions.py`: CRUD operations, pagination, search, category association, decimal precision.
  - `test_budgets.py`: Budget calculation engine, remaining budget, overbudget conditions, zero budget limits.
  - `test_analytics.py`: Dashboard aggregation, timeseries generation, period comparison deltas, zero denominator handling.
  - `test_imports.py`: CSV and Excel file parsing, formula sanitization, column mapping, duplicate detection.
  - `test_exports.py`: CSV, Excel, and PDF generation accuracy.

### 2.2 Web Frontend Tests (`apps/web/tests/`)
- **Framework**: Vitest, React Testing Library, jsdom.
- **Target Coverage**:
  - Dashboard component rendering, KPI calculation accuracy, empty states.
  - Transaction modal input validation, decimal parsing, currency formatting.
  - Filter bar interaction and query parameter binding.
  - Accessibility audit (ARIA labels, keyboard focus, error announcements).

### 2.3 Windows Desktop Tests (`apps/desktop/test/`)
- **Framework**: `flutter_test`.
- **Target Coverage**:
  - `domain/calculations_test.dart`: Precision-safe arithmetic, budget utilization formulas, delta percentage calculations.
  - `data/database_test.dart`: SQLite operations, local CRUD, key encryption initialization.
  - `features/dashboard_test.dart`: Widget test for summary cards, trend indicators, empty states.

---

## 3. Financial Edge Cases Matrix

| Edge Case | Expected Behaviour | Automated Test |
|---|---|---|
| **Zero Budget ($0.00)** with $100 spending | Remaining budget = `-$100.00`, utilization rendered as `>100% (Over budget)` without division by zero error | `test_zero_budget_overspend` |
| **No Budget Set** | UI displays "Set a budget" onboarding CTA; does not invent an arbitrary limit | `test_no_budget_state` |
| **No Transactions** | Honest empty state: "No transactions recorded yet"; dashboard shows zeroed totals | `test_dashboard_empty_dataset` |
| **Zero Previous Period Spending** | Percentage change rendered as "N/A (No prior spending)" rather than `inf%` or `NaN` | `test_history_zero_denominator` |
| **Partial Current Month** | Labels clearly indicate partial comparison (e.g. "Oct 1 - Oct 19 vs. Sep 1 - Sep 19") | `test_partial_period_delta` |
| **Negative Amounts in Input** | Rejected by validator: transactions must be positive with explicit `expense` or `income` type | `test_negative_amount_validation` |
| **Duplicate CSV Import** | Duplicate detection identifies `(date, amount, type, description)` and offers skip or warn options | `test_duplicate_import_detection` |
| **Spreadsheet Formula Injection** | Cells starting with `=SUM(...)` or `=cmd|...` are imported strictly as plain strings | `test_formula_injection_defense` |

---

## 4. Execution Commands

### Running Backend Tests:
```powershell
# From services/api:
pytest -v
```

### Running Web Frontend Tests:
```powershell
# From apps/web:
npm run test
```

### Running Desktop Flutter Tests:
```powershell
# From apps/desktop:
flutter test
```
