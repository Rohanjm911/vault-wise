# Vaultwise — Import & Export Documentation

## 1. Overview & Data Portability

Vaultwise empowers users with total ownership over their financial records. Because the Web and Desktop applications operate separate databases without automatic synchronization, the **Import & Export Engine** serves as the primary bridge for manual data transfer and statement ingestion.

---

## 2. Import Engine

### 2.1 Supported File Types
- **CSV (`.csv`)**: UTF-8, UTF-8 with BOM, ASCII, comma/semicolon/tab delimited.
- **Excel (`.xlsx`, `.xls`)**: Microsoft Excel spreadsheets processed with formula calculation disabled.

### 2.2 Expected Data Columns
Vaultwise maps external files to standard internal transaction fields:

| Field Name | Required? | Accepted Formats / Examples |
|---|---|---|
| **Date** | Yes | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY/MM/DD` |
| **Amount** | Yes | Positive numbers (`14.99`, `$14.99`, `1,250.00`). If negative, mapped to expense. |
| **Type** | No (Inferred) | `expense`, `income`, `debit`, `credit`. Inferred if amount has sign or debit/credit column exists. |
| **Description** | Yes | Merchant or description string (`Trader Joe's`, `Payroll`). |
| **Category** | Optional | Category name (auto-matched to existing categories, fallback to "Other"). |
| **Notes** | Optional | Extended notes or memo field. |

### 2.3 Interactive Column Mapping Workflow
1. **Upload & Parse**: The server/local engine reads the first 10 rows and proposes field mappings based on header heuristics.
2. **User Confirmation**: The user confirms or reassigns column mappings in an interactive modal table.
3. **Duplicate Resolution Choice**:
   - `skip`: Skip records that match existing `(date, amount, type, description)`.
   - `overwrite`: Update existing matches.
   - `allow`: Import all rows regardless of duplicates.
4. **Validation & Dry-Run**: Every row is checked for date validity, positive amounts, and length constraints.
5. **Commit & Batch Report**: Generates an import summary report detailing total rows, inserted count, skipped count, and row-level errors.

### 2.4 Security & CSV Injection Defense
- Spreadsheets are parsed using `openpyxl` with `data_only=True` to prevent macro or external formula execution.
- Text cells starting with formula symbols (`=`, `+`, `-`, `@`) are stripped or escaped.
- File upload is limited to 10 MB and max 10,000 rows.

---

## 3. Export Engine

### 3.1 CSV Export
- Clean, RFC-4180 compliant CSV export containing all filtered transactions with standard headers:
  `ID, Date, Type, Category, Amount, Currency, Description, Notes`.

### 3.2 Excel Export (`.xlsx`)
- Multi-sheet Excel workbook:
  - **Summary Sheet**: KPI metrics (Income, Expenses, Net Savings, Budget Utilization) for the export window.
  - **Category Breakdown**: Tabulated category spending with subtotals.
  - **Transactions**: Complete transaction register.

### 3.3 PDF Report Generation
- **Category Breakdown Pie Chart**: Vector-rendered pie chart visualizing spending (or income) distribution across categories with precise amounts and percentages matching the applied filters (`start_date`, `end_date`, `category_id`, `type`).
- **Brand Logo Watermark**: The official Vaultwise logo is embedded with low opacity (0.07) across every statement page as an authentic security watermark without obscuring financial figures.
- **Header & Ledger**: Includes active parameter badges, KPI summary block (Income, Spending, Savings, Count), and structured transaction history with running page footers. Adheres strictly to solid colors (no gradients).
