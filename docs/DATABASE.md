# Vaultwise — Database Architecture & Schema Documentation

## 1. Overview & Principles

Vaultwise employs two separate relational database engines:
1. **PostgreSQL 18** (Web Backend): High-performance, concurrent, ACID-compliant multi-tenant persistence managed via SQLAlchemy 2.0 and Alembic.
2. **Encrypted SQLite / SQLCipher** (Windows Desktop): Self-contained, zero-configuration, encrypted local database file on the client machine.

Both database engines adhere to identical schema concepts, naming conventions, and financial precision policies.

---

## 2. Financial Precision & Date Standards

### 2.1 Currency Representation
- Monetary values are stored as **integer cents** (`BIGINT` in PostgreSQL, `INTEGER` in SQLite).
  - Example: `$12.50` is stored as `1250`.
  - Example: `-$4.99` is stored as `-499`.
- Rationale: IEEE 754 floating-point types (`FLOAT`, `DOUBLE`, `REAL`) introduce cumulative rounding errors that are unacceptable in financial accounting.

### 2.2 Timezone & Date Standards
- All timestamps (`created_at`, `updated_at`) are stored in **UTC** as ISO-8601 timestamps (`TIMESTAMPTZ` in PostgreSQL, text in SQLite).
- Transaction dates (`date`) are stored as calendar dates (`DATE` in PostgreSQL, ISO `YYYY-MM-DD` strings in SQLite) to preserve the user's localized transaction day irrespective of server timezone shifts.

---

## 3. Entity Relationship Diagram (Conceptual)

```
       +-----------------------+
       |         users         |
       +-----------------------+
       | id (UUID, PK)         |
       | email (VARCHAR, UQ)   |
       | hashed_password (STR) |
       | full_name (VARCHAR)   |
       | created_at (TIMESTAMP)|
       +-----------+-----------+
                   |
       +-----------+-----------------------------------+
       | 1:N                                           | 1:N
+------v----------------+                       +------v----------------+
|       categories      |                       |        budgets        |
+-----------------------+                       +-----------------------+
| id (UUID, PK)         |                       | id (UUID, PK)         |
| user_id (UUID, FK)    |                       | user_id (UUID, FK)    |
| name (VARCHAR(50))    |                       | category_id (FK, Null)|
| type (VARCHAR(20))    |                       | period (VARCHAR(7))   |
| color_hex (CHAR(7))   |                       | limit_cents (BIGINT)  |
| is_system (BOOLEAN)   |                       +-----------------------+
+-----------+-----------+
            | 1:N
+-----------v-----------+                       +-----------------------+
|      transactions     |                       |     user_settings     |
+-----------------------+                       +-----------------------+
| id (UUID, PK)         |                       | user_id (UUID, PK, FK)|
| user_id (UUID, FK)    |                       | currency_code (CHAR(3)|
| category_id (UUID, FK)|                       | currency_symbol (STR) |
| amount_cents (BIGINT) |                       | date_format (VARCHAR) |
| type (VARCHAR(20))    |                       | theme_mode (VARCHAR)  |
| date (DATE)           |                       | ai_consent (BOOLEAN)  |
| description (VARCHAR) |                       +-----------------------+
| notes (TEXT, Nullable)|
| created_at (TIMESTAMP)|
+-----------------------+
```

---

## 4. Table Definitions

### 4.1 `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / CHAR(36) | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Login email address |
| `hashed_password`| VARCHAR(255) | NOT NULL | Bcrypt hash with salt rounds $\ge 12$ |
| `full_name` | VARCHAR(100) | NOT NULL | User's display name |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account status flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record update timestamp |

### 4.2 `categories` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / CHAR(36) | PRIMARY KEY | Category identifier |
| `user_id` | UUID / CHAR(36) | NULLABLE, INDEX | User owner (NULL for shared system defaults) |
| `name` | VARCHAR(50) | NOT NULL | Human-readable category title |
| `type` | VARCHAR(20) | NOT NULL | `expense` or `income` |
| `color_hex` | VARCHAR(7) | NOT NULL | Solid hex color code (e.g., `#2563EB`) |
| `icon_name` | VARCHAR(50) | NOT NULL | Icon key (e.g., `shopping-cart`, `home`) |
| `is_system` | BOOLEAN | DEFAULT FALSE | Whether it is a pre-seeded system category |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

### 4.3 `transactions` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / CHAR(36) | PRIMARY KEY | Transaction identifier |
| `user_id` | UUID / CHAR(36) | NOT NULL, INDEX | Owning user identifier |
| `category_id` | UUID / CHAR(36) | NOT NULL, INDEX, FK | Associated category |
| `amount_cents` | BIGINT / INTEGER | NOT NULL | Amount in integer minor units ($10.50 = 1050) |
| `type` | VARCHAR(20) | NOT NULL | `expense`, `income`, or `transfer` |
| `date` | DATE / VARCHAR(10)| NOT NULL, INDEX | Transaction occurrence date (`YYYY-MM-DD`) |
| `description` | VARCHAR(255) | NOT NULL | Transaction summary |
| `notes` | TEXT | NULLABLE | Detailed user notes |
| `import_batch_id`| VARCHAR(64) | NULLABLE | Identifier of import batch if imported |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Update timestamp |

**Indexes**:
- `idx_transactions_user_date` on `(user_id, date DESC)`
- `idx_transactions_user_category` on `(user_id, category_id)`
- `idx_transactions_duplicate_check` on `(user_id, date, amount_cents, type)`

### 4.4 `budgets` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / CHAR(36) | PRIMARY KEY | Budget identifier |
| `user_id` | UUID / CHAR(36) | NOT NULL, INDEX | Owning user identifier |
| `category_id` | UUID / CHAR(36) | NULLABLE, INDEX | Specific category budget (NULL = overall monthly cap) |
| `period` | VARCHAR(7) | NOT NULL | Month string (`YYYY-MM`) |
| `limit_cents` | BIGINT / INTEGER | NOT NULL | Budget cap in integer cents |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Constraint**: `UNIQUE(user_id, category_id, period)` ensures at most one budget per category per month.

### 4.5 `user_settings` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | UUID / CHAR(36) | PRIMARY KEY, FK | Linked user |
| `currency_code` | VARCHAR(3) | DEFAULT 'USD' | ISO 4217 currency code |
| `currency_symbol`| VARCHAR(5) | DEFAULT '$' | Rendered display symbol |
| `date_format` | VARCHAR(20) | DEFAULT 'YYYY-MM-DD' | Formatting pattern |
| `theme_mode` | VARCHAR(10) | DEFAULT 'light' | Theme (`light`, `dark`) |
| `ai_consent` | BOOLEAN | DEFAULT FALSE | Explicit consent for AI features |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Modification timestamp |

---

## 5. Migrations & Seed Data

Alembic manages migrations in `services/api/alembic/`.
Initial migration seeds system default categories:
1. Groceries (`#10B981`)
2. Food & Dining (`#F59E0B`)
3. Transportation (`#3B82F6`)
4. Housing & Rent (`#6366F1`)
5. Utilities (`#8B5CF6`)
6. Healthcare (`#EC4899`)
7. Shopping (`#14B8A6`)
8. Entertainment (`#F97316`)
9. Education (`#06B6D4`)
10. Personal Care (`#84CC16`)
11. Income / Salary (`#059669`)
12. Other (`#64748B`)
