# Vaultwise Shared Domain Specifications

This package documents the shared domain models, financial calculation rules, precision conventions, and data exchange schemas for **Vaultwise**.

Both the **Web Application** (React + FastAPI) and **Windows Desktop Application** (Flutter + SQLite) implement these exact rules to ensure 100% calculation consistency and import/export compatibility, while strictly maintaining separate storage and no automatic data synchronization.

---

## 1. Monetary Precision Rules

- **Precision-Safe Representation**: Financial amounts must never be stored, summed, or divided using IEEE-754 binary floating-point numbers due to catastrophic rounding and precision drift.
- **Internal Storage**:
  - In PostgreSQL / SQLite: Stored as integer cents (i.e. `$12.50` -> `1250`) or `DECIMAL(14, 2)`.
  - In Python: `decimal.Decimal` (with `ROUND_HALF_UP`).
  - In Dart / TypeScript: Represented with explicit minor units (cents) or dedicated fixed-point arithmetic utilities.
- **Negative Values**: Negative numbers are not used for normal expenses. Transactions explicitly declare a `type`:
  - `expense`: Represents spending.
  - `income`: Represents incoming funds.
  - `transfer`: Excluded from ordinary spending calculations unless specified.

---

## 2. Calculation Formulas

### Budget Utilization
$$\text{Remaining Budget} = \text{Budget Limit} - \text{Eligible Spending}$$
$$\text{Utilization (\%)} = \begin{cases} 
\left(\frac{\text{Eligible Spending}}{\text{Budget Limit}}\right) \times 100 & \text{if } \text{Budget Limit} > 0 \\
0 & \text{if } \text{Budget Limit} = 0 \text{ and Spending} = 0 \\
\infty \text{ (Over budget)} & \text{if } \text{Budget Limit} = 0 \text{ and Spending} > 0
\end{cases}$$

- A negative remaining budget represents overspending.
- If no budget is set, the UI displays a clear setup prompt rather than fabricating figures.

### Historical Comparison
$$\text{Absolute Change} = \text{Current Spending} - \text{Previous Spending}$$
$$\text{Percentage Change} = \begin{cases}
\left(\frac{\text{Current Spending} - \text{Previous Spending}}{\text{Previous Spending}}\right) \times 100 & \text{if } \text{Previous Spending} > 0 \\
\text{undefined} & \text{if } \text{Previous Spending} = 0
\end{cases}$$

- When previous spending is 0, the UI explicitly notes that a percentage comparison is undefined, avoiding division by zero.

---

## 3. Data Integrity & Categories

- Standard categories are seeded on initial setup:
  - Food & Dining, Groceries, Transportation, Housing, Utilities, Healthcare, Shopping, Entertainment, Education, Travel, Personal Care, Income, Other.
- Renaming or deleting a category preserves historical transactions by reassigning them to "Other" or retaining an archive reference. Transactions are never silently deleted.
