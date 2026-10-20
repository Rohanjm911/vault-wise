# Vaultwise — Feature Documentation

This document provides a comprehensive and verifiable reference for every feature in **Vaultwise: Your Money. Your Rules.** Each feature is evaluated against strict architectural and functional criteria.

---

## Feature Index

1. [Dashboard & Financial Overview](#1-dashboard--financial-overview)
2. [Transaction Management](#2-transaction-management)
3. [Category Management](#3-category-management)
4. [Budget Planning & Utilization Tracking](#4-budget-planning--utilization-tracking)
5. [Spending History & Period Comparisons](#5-spending-history--period-comparisons)
6. [CSV and Excel File Import](#6-csv-and-excel-file-import)
7. [Financial Data Export & Reports](#7-financial-data-export--reports)
8. [Search, Filtering & Multi-Criteria Queries](#8-search-filtering--multi-criteria-queries)
9. [Data-Driven Financial Insights](#9-data-driven-financial-insights)
10. [Optional AI-Assisted Analysis](#10-optional-ai-assisted-analysis)
11. [User Authentication & Session Management](#11-user-authentication--session-management)
12. [Desktop Local Database Encryption & Key Storage](#12-desktop-local-database-encryption--key-storage)
13. [Settings, Formatting & Preferences](#13-settings-formatting--preferences)

---

## 1. Dashboard & Financial Overview

1. **Feature Name**: Dashboard & Financial Overview
2. **Purpose & Problem Solved**: Gives users an immediate, clear snapshot of their financial health without cognitive overload or fabricated estimates.
3. **User-Facing Behaviour**: Displays summary KPI cards (Total Spending, Total Income, Remaining Budget, Budget Utilization %, Transaction Count), spending trend charts (solid colors, no gradients), category distribution breakdown, and recent transactions. Dynamic filtering by period (This Month, Last Month, Last 30 Days, Year-to-Date, Custom).
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Main landing view upon signing in (Web) or opening the application (Desktop).
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/dashboard/DashboardPage.tsx`, `apps/web/src/features/dashboard/components/SummaryCards.tsx`, `apps/web/src/features/dashboard/components/SpendingTrendChart.tsx`, `apps/web/src/features/dashboard/components/CategoryBreakdownChart.tsx`
   - Desktop: `apps/desktop/lib/features/dashboard/presentation/dashboard_screen.dart`, `apps/desktop/lib/features/dashboard/presentation/widgets/summary_card.dart`
   - API: `services/api/app/api/v1/dashboard.py`, `services/api/app/services/analytics_service.py`
7. **Data Inputs & Outputs**:
   - Inputs: Date range filters, selected account/category filters.
   - Outputs: Aggregated income, aggregated spending, budget metrics, timeseries points, category shares.
8. **Storage Location**:
   - Web: PostgreSQL database (queried through FastAPI).
   - Desktop: Local encrypted SQLite database.
9. **Validation Rules**: Date range start must be $\le$ date range end. Monetary aggregates calculated using integer cents / fixed-point decimals.
10. **Security & Privacy Considerations**: Tenant isolation enforced per user ID on web; queries scoped to authenticated session. No external data telemetry.
11. **States**:
    - *Loading*: Skeleton cards with accessible aria-busy indicators.
    - *Empty*: Helpful onboarding prompt explaining how to add the first transaction or import statements.
    - *Success*: Accurate KPI metrics and charts with zero-based solid color styling.
    - *Error*: Clear retry button and actionable diagnostics message.
12. **Relevant Tests**:
    - Backend: `services/api/app/tests/test_analytics.py`
    - Web: `apps/web/tests/features/dashboard.test.tsx`
    - Desktop: `apps/desktop/test/features/dashboard_test.dart`
14. **Implementation Status**: Verified (Automated Backend, Web & Desktop Tests Passing).

---

## 2. Transaction Management

1. **Feature Name**: Transaction Management (CRUD)
2. **Purpose & Problem Solved**: Allows precise recording, auditing, and maintenance of financial debits and credits with zero data loss or rounding discrepancies.
3. **User-Facing Behaviour**: Table and list view of transactions with sorting, pagination, search, category tags, and inline edit/delete. Creation modal with date picker, category dropdown, amount input with auto-formatting, description, and notes.
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Navigation item "Transactions" (`/transactions`).
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/transactions/TransactionsPage.tsx`, `TransactionModal.tsx`, `TransactionTable.tsx`
   - Desktop: `apps/desktop/lib/features/transactions/presentation/transactions_screen.dart`
   - API: `services/api/app/api/v1/transactions.py`, `services/api/app/models/transaction.py`
7. **Data Inputs & Outputs**:
   - Inputs: `amount` (cents/decimal), `type` (expense, income, transfer), `category_id`, `date`, `description`, `notes`.
   - Outputs: Created/updated transaction record with UUID, timestamps, and normalized amounts.
8. **Storage Location**:
   - Web: `transactions` table in PostgreSQL.
   - Desktop: `transactions` table in local SQLite.
9. **Validation Rules**: Amount must be $> 0$; type must be in `['expense', 'income', 'transfer']`; date must be valid ISO-8601; description max 255 chars; precision strictly 2 decimal places.
10. **Security & Privacy Considerations**: Server validates user ownership before edit or delete. Parameterized SQL prevents SQL injection.
11. **States**:
    - *Loading*: Table skeleton.
    - *Empty*: "No transactions recorded for this criteria. Add a transaction or adjust filters."
    - *Success*: Paginated rows with clear badges for expense (red/coral solid) and income (emerald/green solid).
    - *Error*: Toast notification with error reason.
12. **Relevant Tests**:
    - Backend: `services/api/app/tests/test_transactions.py`
    - Web: `apps/web/tests/features/transactions.test.tsx`
    - Desktop: `apps/desktop/test/features/transactions_test.dart`
14. **Implementation Status**: Verified (Full CRUD, Input Validation, Automated Tests Passing).

---

## 3. Category Management

1. **Feature Name**: Category Management
2. **Purpose & Problem Solved**: Categorizes spending into intuitive, customizable buckets while preventing orphaned records upon modification.
3. **User-Facing Behaviour**: Pre-seeded with 12 standard categories (Food, Groceries, Housing, etc.). Users can add custom categories, change colors/icons, or soft-delete unused categories. Deleting a category reassigns existing transactions to "Other".
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Settings $\rightarrow$ Categories or Quick Manager in Transaction modal.
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/categories/CategoriesPage.tsx`
   - Desktop: `apps/desktop/lib/features/categories/presentation/categories_screen.dart`
   - API: `services/api/app/api/v1/categories.py`, `services/api/app/models/category.py`
7. **Data Inputs & Outputs**:
   - Inputs: Name, type (expense/income), color code (solid hex), icon name.
   - Outputs: Persisted Category entity.
8. **Storage Location**: `categories` table in respective databases.
9. **Validation Rules**: Name must be unique per user and 1-50 characters; color must be a valid solid 6-character HEX code (no gradients).
10. **Security & Privacy Considerations**: Users can only modify their own categories or default system templates cloned to their tenant.
11. **States**: Full loading, empty, and conflict warning states when duplicate names are entered.
12. **Relevant Tests**: CRUD tests in backend and frontend component test suites.
14. **Implementation Status**: Verified (Standard & Custom Categories, Safe Deletion, Verified).

---

## 4. Budget Planning & Utilization Tracking

1. **Feature Name**: Budget Planning & Utilization Tracking
2. **Purpose & Problem Solved**: Prevents overspending by setting monthly and category-level spending caps, tracking real-time utilization without mathematical errors.
3. **User-Facing Behaviour**: Set overall and per-category spending limits for a given period. Progress bars with solid color coding (safe green, warning amber, overbudget crimson). Displays exact numerical remaining balance: $\text{Limit} - \text{Spending}$.
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Navigation item "Budgets" (`/budgets`).
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/budgets/BudgetsPage.tsx`, `BudgetCard.tsx`, `BudgetModal.tsx`
   - Desktop: `apps/desktop/lib/features/budgets/presentation/budgets_screen.dart`
   - API: `services/api/app/api/v1/budgets.py`, `services/api/app/services/budget_service.py`
7. **Data Inputs & Outputs**:
   - Inputs: Category ID (or null for overall), period (YYYY-MM), amount limit.
   - Outputs: Budget progress, remaining amount, utilization percentage.
8. **Storage Location**: `budgets` table.
9. **Validation Rules**:
   - Amount $\ge 0$.
   - Zero budget with spending $> 0$ flags 100%+ overbudget without throwing division by zero.
   - Negative remaining amount indicates overspending explicitly.
10. **Security & Privacy Considerations**: Calculations executed on server (web) or local engine (desktop).
11. **States**:
    - *Unconfigured*: Clear "Set up a monthly budget" action.
    - *Active*: Clear progress indicators.
    - *Exceeded*: High-contrast warning banner showing exact overspend amount.
12. **Relevant Tests**: `services/api/app/tests/test_budgets.py`, edge cases for zero limit, exact match, and heavy overspend.
14. **Implementation Status**: Verified (Zero Division Guarded, Overbudget Detection, Verified).

---

## 5. Spending History & Period Comparisons

1. **Feature Name**: Previous Spending & Spending History
2. **Purpose & Problem Solved**: Dedicated deep-dive analytics comparing current spending against equivalent previous periods (week, month, 3 months, 6 months, year).
3. **User-Facing Behaviour**: Period-over-period delta cards showing absolute currency difference ($\pm \$X$) and percentage change ($\pm Y\%$). Detailed category shift breakdown highlighting which areas grew or shrank.
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Navigation item "History" (`/history`).
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/history/HistoryPage.tsx`
   - Desktop: `apps/desktop/lib/features/history/presentation/history_screen.dart`
   - API: `services/api/app/api/v1/history.py`
7. **Data Inputs & Outputs**:
   - Inputs: Selected target period, comparison mode (previous equivalent period or custom range).
   - Outputs: Comparison metrics, delta amounts, delta percentages, highest growth categories.
8. **Storage Location**: Computed dynamically from historical `transactions`.
9. **Validation Rules**:
   - If previous spending is 0 and current $> 0$, percentage is rendered as "N/A (No prior spending recorded)" rather than mathematical infinity.
   - Partial periods are explicitly labeled (e.g., "Month to date vs. same 19 days last month").
10. **Security & Privacy Considerations**: Read-only queries scoped to authenticated user records.
11. **States**:
    - *No History*: "Your spending history will appear here once you start recording transactions."
    - *Partial History*: Clear indication of available date coverage.
    - *Complete*: Side-by-side comparative charts and tables.
12. **Relevant Tests**: `services/api/app/tests/test_history.py` covering boundary tests, zero denominator, leap year, and month length differences.
14. **Implementation Status**: Verified (Zero Denominator Guarded, Period Comparisons, Verified).

---

## 6. CSV and Excel File Import

1. **Feature Name**: CSV and Excel Import Engine
2. **Purpose & Problem Solved**: Seamlessly onboard historical bank statements and spreadsheet logs without manual entry or spreadsheet macro vulnerabilities.
3. **User-Facing Behaviour**: Drag-and-drop file uploader (`.csv`, `.xlsx`, `.xls`). Auto-detects headers or lets user map columns (Date, Amount, Description, Category, Type). Generates an interactive preview of parsed rows, flags duplicates or invalid data, and reports row-by-row validation errors before committing.
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Navigation item "Import" (`/import`).
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/imports/ImportPage.tsx`, `ColumnMapper.tsx`, `ImportPreviewTable.tsx`
   - Desktop: `apps/desktop/lib/features/imports/presentation/imports_screen.dart`
   - API: `services/api/app/api/v1/imports.py`, `services/api/app/services/import_service.py`
7. **Data Inputs & Outputs**:
   - Inputs: Uploaded file, column mapping dictionary, duplicate handling strategy (skip, overwrite, allow).
   - Outputs: Import summary (total rows, inserted count, skipped duplicates count, failed count with error reasons).
8. **Storage Location**: Parsed records written to `transactions`.
9. **Validation Rules**:
   - Strictly untrusted input. Spreadsheets parsed with formula calculation disabled (`data_only=True` in openpyxl) to prevent formula injection / CSV injection.
   - File size capped at 10MB.
   - Date formats parsed with strict fallback checks.
   - Duplicate detection checks `(date, amount, description, type)`.
10. **Security & Privacy Considerations**: Files parsed in memory or temporary isolated directory and immediately deleted. Never stored on disk in public folders.
11. **States**:
    - *File Select*: Dropzone with format and size notes.
    - *Mapping & Preview*: Interactive column picker with sample data preview.
    - *Importing*: Progress indicator showing processed row count.
    - *Summary*: Complete breakdown of successes and row-level issues.
12. **Relevant Tests**: Unit tests with malformed CSVs, BOM headers, currency symbols (`$`, `€`), negative expense notation `(12.50)`, and duplicate detection tests.
14. **Implementation Status**: Verified (CSV/Excel Parsers, Injection Defense, Verified).

---

## 7. Financial Data Export & Reports

1. **Feature Name**: Financial Data Export & Reports
2. **Purpose & Problem Solved**: Guarantees user data portability and provides presentation-ready summary reports in standard formats.
3. **User-Facing Behaviour**: Export transactions or comprehensive summary reports to CSV, Excel (`.xlsx`), and clean printable PDF reports. User can filter by date range or category before triggering download.
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Navigation item "Reports" (`/reports`) and Export button in Transactions.
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/reports/ReportsPage.tsx`, `apps/web/src/services/exportService.ts`
   - Desktop: `apps/desktop/lib/features/reports/presentation/reports_screen.dart`
   - API: `services/api/app/api/v1/exports.py`, `services/api/app/services/export_service.py`
7. **Data Inputs & Outputs**:
   - Inputs: Date range, categories, export format (`csv`, `xlsx`, `pdf`).
   - Outputs: Formatted binary file stream with accurate content headers.
8. **Storage Location**: Ephemeral download streams.
9. **Validation Rules**: Exported totals must match dashboard figures for the identical filter window down to the exact cent.
10. **Security & Privacy Considerations**: Explicit user prompt warning that exported documents contain sensitive financial details.
11. **States**: Instant progress spinner, completed download trigger, error handling on timeout.
12. **Relevant Tests**: Verification tests ensuring generated CSV/Excel matches raw DB rows.
14. **Implementation Status**: Verified (CSV, Excel, PDF Export with Solid Styling, Verified).

---

## 8. Search, Filtering & Multi-Criteria Queries

1. **Feature Name**: Search & Multi-Criteria Filtering
2. **Purpose & Problem Solved**: Rapidly locate specific transactions or slice financial datasets by amount, date, type, or textual description.
3. **User-Facing Behaviour**: Global and local search input with instant debounced filtering. Filter pills for transaction type (Expense, Income, Transfer), Category multi-select, and min/max amount range sliders.
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Toolbar in Transactions, Dashboard, and History.
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/components/FilterBar.tsx`, `apps/web/src/hooks/useTransactionFilters.ts`
   - Desktop: `apps/desktop/lib/shared/widgets/filter_toolbar.dart`
   - API: `services/api/app/api/v1/transactions.py` query parameters.
7. **Data Inputs & Outputs**:
   - Inputs: `search`, `category_ids`, `start_date`, `end_date`, `min_amount`, `max_amount`, `type`.
   - Outputs: Filtered result dataset with pagination metadata.
8. **Storage Location**: Indexed SQL queries with composite indexes.
9. **Validation Rules**: Min amount $\le$ max amount; sanitize text queries to escape SQL LIKE wildcard exploits.
10. **Security & Privacy Considerations**: Query filters bound using parameterized queries.
11. **States**: Loading results indicator, empty filter results state with "Clear all filters" shortcut.
12. **Relevant Tests**: Query builder tests and UI filter interaction tests.
14. **Implementation Status**: Verified (Full Multi-criteria Querying & Filtering, Verified).

---

## 9. Data-Driven Financial Insights

1. **Feature Name**: Data-Driven Financial Insights
2. **Purpose & Problem Solved**: Automatically extracts actionable, rule-based observations from spending habits (e.g., disproportionate dining expenses, recurring weekly spikes, budget threshold warnings).
3. **User-Facing Behaviour**: Cards on Dashboard and History showing high-confidence insights with clear explanatory calculations.
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Insights widget on Dashboard.
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/dashboard/components/FinancialInsights.tsx`
   - Desktop: `apps/desktop/lib/features/dashboard/presentation/widgets/insights_card.dart`
   - API: `services/api/app/services/insights_service.py`
7. **Data Inputs & Outputs**:
   - Inputs: Transaction history, category aggregates, active budgets.
   - Outputs: Array of structured insight objects (type, title, description, metric, severity).
8. **Storage Location**: Derived in real-time or cached in session.
9. **Validation Rules**: Every insight must cite specific numerical evidence (e.g. "Dining represented 42% of spending this month, up from 28% last month"). No vague or speculative advice.
10. **Security & Privacy Considerations**: Deterministic rules execute 100% locally or on tenant's authenticated backend. No third-party network requests.
11. **States**:
    - *Insufficient Data*: "Insights require at least 5 recorded transactions across 2 categories."
    - *Active*: Priority cards categorized by Opportunity, Alert, and Trend.
12. **Relevant Tests**: Test cases for budget threshold breaches, category concentration triggers, and period surges.
14. **Implementation Status**: Verified (Deterministic Data-Driven Insights, Verified).

---

## 10. Optional AI-Assisted Analysis

1. **Feature Name**: Optional AI-Assisted Analysis
2. **Purpose & Problem Solved**: Allows advanced qualitative querying of financial history (e.g. "Summarize my recurring grocery trends") for users who explicitly opt-in.
3. **User-Facing Behaviour**: Disabled by default. A dedicated settings toggle requires explicit confirmation. When enabled, users can request an AI summary. An inspection drawer shows exactly what aggregated summary numbers will be sent prior to dispatch.
4. **Supported Application**: Web (optional backend extension); Desktop remains offline-first.
5. **Screen / Entry Point**: Settings $\rightarrow$ AI Insights / Dashboard optional drawer.
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/settings/AiSettings.tsx`, `apps/web/src/features/dashboard/components/AiAnalysisModal.tsx`
   - API: `services/api/app/services/ai_service.py`
7. **Data Inputs & Outputs**:
   - Inputs: Aggregated category totals and period deltas (never raw bank accounts, names, or full notes).
   - Outputs: Natural language summary of trends.
8. **Storage Location**: User consent stored in user preferences.
9. **Validation Rules**: Requires valid API key configured on server; strictly opt-in; falls back smoothly to deterministic insights if unavailable or unconfigured.
10. **Security & Privacy Considerations**: Data minimization; keys stored server-side only in environment variables; zero transmission when disabled.
11. **States**: Disabled state, consent prompt, loading stream, error fallback.
12. **Relevant Tests**: Mocked provider tests, validation of payload redaction.
14. **Implementation Status**: Verified (Opt-in Consent, Data Minimization, Key Isolation, Verified).

---

## 11. User Authentication & Session Management

1. **Feature Name**: Web User Authentication & Session Management
2. **Purpose & Problem Solved**: Guarantees secure, multi-tenant isolation of financial records on the web platform.
3. **User-Facing Behaviour**: Clean, distraction-free Login and Registration forms. Password strength indicators, remember me option, session timeout warnings, and secure logout.
4. **Supported Application**: Web application. (Desktop is local-first and does not require a web login).
5. **Screen / Entry Point**: `/login` and `/register`.
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/auth/LoginPage.tsx`, `apps/web/src/features/auth/RegisterPage.tsx`, `apps/web/src/features/auth/AuthContext.tsx`
   - API: `services/api/app/api/v1/auth.py`, `services/api/app/core/security.py`, `services/api/app/models/user.py`
7. **Data Inputs & Outputs**:
   - Inputs: Email address, password, name.
   - Outputs: Secure JWT access token, refresh token, user profile.
8. **Storage Location**: PostgreSQL `users` table.
9. **Validation Rules**:
   - Passwords hashed using bcrypt with salt rounds $\ge 12$.
   - Passwords must be at least 8 characters with numbers and mixed case.
   - Email format validated via Pydantic `EmailStr`.
10. **Security & Privacy Considerations**: Passwords never logged or stored in plain text. Tokens expire after configured window. Rate limiting on authentication endpoints to prevent brute-force attacks.
11. **States**: Form validation feedback, loading spinner, error messages for invalid credentials without revealing whether email exists.
12. **Relevant Tests**: `services/api/app/tests/test_auth.py` covering token issuance, expiration, invalid passwords, and registration uniqueness.
14. **Implementation Status**: Verified (Bcrypt Hashing, JWT Bearer Auth, Tenant Isolation, Verified).

---

## 12. Desktop Local Database Encryption & Key Storage

1. **Feature Name**: Desktop Local Database Encryption & Key Protection
2. **Purpose & Problem Solved**: Protects desktop financial records at rest on Windows devices against physical extraction or local malware inspection.
3. **User-Facing Behaviour**: Seamless background protection. On first launch, Vaultwise initializes an encrypted local database. Options in Settings allow backing up the encrypted database and restoring from an existing backup file.
4. **Supported Application**: Windows Desktop Application.
5. **Screen / Entry Point**: Transparent on startup; Settings $\rightarrow$ Security & Backups.
6. **Relevant Files & Modules**:
   - Desktop: `apps/desktop/lib/core/database/database_helper.dart`, `apps/desktop/lib/core/security/vault_key_manager.dart`
7. **Data Inputs & Outputs**:
   - Inputs: Master key managed via Windows Credential Protection / DPAPI or secure passphrase.
   - Outputs: Encrypted SQLite database file (`vaultwise.db`) using verified AES-256 / SQLCipher.
8. **Storage Location**: `%APPDATA%\Vaultwise\vaultwise.db` on Windows.
9. **Validation Rules**: Unencrypted database access attempts fail with authentication error. Backup files validated with integrity checksum before restoration.
10. **Security & Privacy Considerations**: Database keys are never hardcoded in source or binary. Keys stored using Windows secure credential storage.
11. **States**: Key generation on first boot, unlocked state, backup progress, restore confirmation modal.
12. **Relevant Tests**: Unit tests for key generation, encryption initialization, and backup file verification.
14. **Implementation Status**: Verified (SQLite FFI, Metadata Integrity, Checksummed Backups, Verified).

---

## 13. Settings, Formatting & Preferences

1. **Feature Name**: Settings, Formatting & Preferences
2. **Purpose & Problem Solved**: Personalizes currency formatting, date conventions, and regional preferences without altering historical monetary amounts.
3. **User-Facing Behaviour**: Choose preferred currency symbol (USD `$`, EUR `€`, GBP `£`, INR `₹`, CAD `$`, AUD `$`, JPY `¥`), date format (`YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`), number formatting, and light/dark theme preference (solid colors only, no gradients).
4. **Supported Application**: Both (Web & Windows Desktop).
5. **Screen / Entry Point**: Navigation item "Settings" (`/settings`).
6. **Relevant Files & Modules**:
   - Web: `apps/web/src/features/settings/SettingsPage.tsx`
   - Desktop: `apps/desktop/lib/features/settings/presentation/settings_screen.dart`
   - Shared Specs: `packages/shared-specs/`
7. **Data Inputs & Outputs**:
   - Inputs: Currency code, symbol, format strings, theme choice.
   - Outputs: Persisted user settings object.
8. **Storage Location**:
   - Web: `user_settings` table in PostgreSQL.
   - Desktop: Local encrypted preferences table.
9. **Validation Rules**: Display currency change does not modify stored integer amounts; no automatic unverified FX conversion.
10. **Security & Privacy Considerations**: Stored locally or per-user.
11. **States**: Instant reactive update across all displayed figures upon preference save.
12. **Relevant Tests**: Formatting utility tests across all supported currencies and date strings.
14. **Implementation Status**: Verified (Localization, Formatting, Theme Switching, No Gradients, Verified).
