# Vaultwise — Security Architecture & Threat Model

## 1. Security Philosophy

Financial tracking software handles confidential, personal records. Vaultwise enforces **privacy and security by design**:

1. **Zero Silent Cloud Sync**: The native Windows desktop app does not transmit financial figures across the internet.
2. **Defensive Input Handling**: Every external input (user forms, CSV files, Excel spreadsheets) is treated as potentially hostile.
3. **Data Isolation**: Multi-tenant authorization checks are enforced at the database query layer for every web transaction.
4. **Honest Cryptography**: Encryption claims reflect verified AES-256 / SQLCipher mechanisms and Windows DPAPI credential protection.

---

## 2. Web Application Security Architecture

### 2.1 Password Hashing & Credentials
- Passwords hashed using **bcrypt** with work factor (salt rounds) $\ge 12$.
- Passwords are never logged, echoed in API responses, or stored in plaintext.
- Registration enforces a minimum password length of 8 characters, requiring alphanumeric diversity.

### 2.2 Token Authentication & Session Integrity
- Stateless **JSON Web Tokens (JWT)** signed via HMAC-SHA256 (`HS256`).
- Expiration: Short-lived access tokens (1440 minutes / 24 hours in dev, configurable down to 15-60 minutes in high-security production).
- Secret keys loaded exclusively from environment variables (`JWT_SECRET_KEY`); never checked into version control.

### 2.3 Injection Prevention & ORM Protections
- All database interactions use **SQLAlchemy ORM** parameterized queries, preventing SQL injection vulnerabilities.
- User-supplied search queries are explicitly escaped to prevent wildcard DOS attacks on SQL `LIKE` statements.

### 2.4 CORS & Transport Security
- Cross-Origin Resource Sharing (CORS) restricted to verified frontend origins (`http://localhost:5173` in development).
- Production deployment guides require mandatory HTTPS termination with HSTS headers.

---

## 3. Desktop Application Security Architecture

### 3.1 Local Storage Encryption (SQLCipher)
- The desktop SQLite database (`vaultwise.db`) is encrypted using **SQLCipher (AES-256 in CBC mode)**.
- Without the master key, raw reads of the database file produce cryptographically random ciphertext.
- Database keys are never written to source code, binary assets, or plain text configuration files.

### 3.2 Key Protection (Windows DPAPI)
- The encryption key is derived or securely stored using **Windows Credential Protection / Data Protection API (DPAPI)** via `flutter_secure_storage`.
- The key is bound to the logged-in Windows user account and protected by the operating system's hardware or TPM-backed credential manager.

---

## 4. Safe Import & File Upload Protections

CSV and Excel files are prone to significant vulnerabilities if processed naively:
1. **Spreadsheet Formula Injection (CSV Injection)**:
   - Malicious formulas (e.g. `=cmd|' /C calc'!A0` or `=HYPERLINK(...)`) can trigger remote code execution when opened in Microsoft Excel.
   - Mitigation: Openpyxl is invoked with formula parsing explicitly disabled (`data_only=True`). Export engines sanitize cells starting with `=`, `+`, `-`, or `@`.
2. **Resource Exhaustion (Zip Bombs & Excessive Files)**:
   - Upload file size is strictly capped at **10 MB**.
   - Input streams are processed in memory with row limits (maximum 10,000 rows per batch).
3. **Macro Stripping**:
   - Vaultwise only supports `.csv`, `.xlsx`, and `.xls`. Macro-enabled `.xlsm` files are rejected.

---

## 5. Logging & Privacy Standards

- Standard logs never record:
  - Account passwords or authentication tokens.
  - Raw financial descriptions, balances, or transaction notes.
- Error diagnostics emit sanitized error codes and UUID traces without leaking sensitive customer state.

---

## 6. Optional AI Analysis Privacy Rules

- Deterministic local/server calculations are the default.
- AI analysis is strictly **opt-in** and requires explicit user consent stored in `user_settings`.
- Only sanitized aggregate numbers (e.g., total spent per category in a month) are transmitted; individual item descriptions and notes are excluded.
- Third-party API keys are never exposed in frontend JavaScript bundles or desktop binaries.
