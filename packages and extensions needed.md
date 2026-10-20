# 📦 Vaultwise — Packages and Extensions Needed

<div align="center">

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="38" height="38" alt="VS Code" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="38" height="38" alt="Python" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="38" height="38" alt="Node.js" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="38" height="38" alt="React" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="38" height="38" alt="TypeScript" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" width="38" height="38" alt="Flutter" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" width="38" height="38" alt="SQLite" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="38" height="38" alt="PostgreSQL" />

<br/>

[![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![Python](https://img.shields.io/badge/Python_3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js_20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript_7-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Flutter](https://img.shields.io/badge/Flutter_3.47+-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)

<p align="center">
  <strong>Complete inventory of system runtimes, IDE extensions, npm packages, python libraries, and flutter dependencies required to develop and build Vaultwise.</strong>
</p>

</div>

---

## 📋 Table of Contents

1. [Tech Stack & Real-Life Logos](#1--tech-stack--real-life-logos)
2. [Recommended VS Code / Cursor Extensions](#2--recommended-vs-code--cursor-extensions)
3. [System Runtimes & Toolchains](#3--system-runtimes--toolchains)
4. [Backend Dependencies (FastAPI / Python)](#4--backend-dependencies-fastapi--python)
5. [Frontend Dependencies (React / TypeScript / Vite)](#5--frontend-dependencies-react--typescript--vite)
6. [Desktop Dependencies (Flutter / Dart)](#6--desktop-dependencies-flutter--dart)
7. [One-Click Installation Commands](#7--one-click-installation-commands)

---

## 1. 🛠️ Tech Stack & Real-Life Logos

| Ecosystem             | Technology         |                                                                 Real-Life Logo                                                                  |    Version    | Purpose                       |
| :-------------------- | :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------: | :-----------: | :---------------------------- |
| **IDE**               | Visual Studio Code |        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="30" height="30" alt="VS Code" />         |    Latest     | Development Environment       |
| **Backend Runtime**   | Python             |         <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="30" height="30" alt="Python" />         | `3.12 - 3.14` | API Engine & Report Lab       |
| **API Framework**     | FastAPI            |       <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" width="30" height="30" alt="FastAPI" />        |  `0.115.0+`   | REST API Architecture         |
| **Web Runtime**       | Node.js            |        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="30" height="30" alt="Node.js" />         | `v20+ / v24`  | Web Build & Test Environment  |
| **UI Library**        | React              |          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="30" height="30" alt="React" />           |   `19.3.1`    | Reactive Web Interface        |
| **Language**          | TypeScript         |   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="30" height="30" alt="TypeScript" />   |   `~7.0.2`    | Static Type Soundness         |
| **CSS Framework**     | Tailwind CSS       |   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="30" height="30" alt="Tailwind" />   |   `3.4.19`    | Modern Neumorphic Styling     |
| **Bundler**           | Vite               |          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="30" height="30" alt="Vite" />          |    `8.3.4`    | HMR & Production Bundler      |
| **Desktop Framework** | Flutter            |       <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" width="30" height="30" alt="Flutter" />        |    `3.47+`    | Windows C++ Native Desktop    |
| **Desktop Language**  | Dart               |            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg" width="30" height="30" alt="Dart" />            |    `3.13+`    | Client-Side Desktop Code      |
| **Database**          | SQLite & FFI       |         <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" width="30" height="30" alt="SQLite" />         |     `3.x`     | Local Encrypted Storage       |
| **Database (Prod)**   | PostgreSQL         |   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="30" height="30" alt="PostgreSQL" />   |     `16+`     | Server Scalability            |
| **Build Tools**       | Visual Studio C++  | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-plain.svg" width="30" height="30" alt="Visual Studio" /> |    `2022`     | Windows C++ Desktop Compilers |

---

## 2. 🧩 Recommended VS Code / Cursor Extensions

To enable optimal syntax highlighting, autocompletion, linting, and database inspection, install the following extensions in VS Code:

| Extension Name                | Extension Identifier        | Publisher                         | Why You Need It                                                        |
| :---------------------------- | :-------------------------- | :-------------------------------- | :--------------------------------------------------------------------- |
| **Python**                    | `ms-python.python`          | Microsoft                         | Python debugging, virtual environment detection, and execution.        |
| **Pylance**                   | `ms-python.vscode-pylance`  | Microsoft                         | Ultra-fast Python static type checking and auto-imports.               |
| **Flutter**                   | `Dart-Code.flutter`         | Dart Code                         | Flutter device selector, hot reload, widget tree inspector.            |
| **Dart**                      | `Dart-Code.dart-code`       | Dart Code                         | Dart syntax, formatting, refactoring, and SDK management.              |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Tailwind Labs                     | Class autocompletion, hover previews, and linting for neo-classes.     |
| **SQLite Viewer**             | `qwtel.sqlite-viewer`       | Florian Klampfer                  | Directly explore and query `vaultwise_dev.db` inside VS Code.          |
| **REST Client**               | `humao.rest-client`         | Huachao Mao                       | Execute raw HTTP requests directly from `.http` files against the API. |
| **DotENV**                    | `mikestead.dotenv`          | mikestead                         | Syntax highlighting for `.env` files.                                  |
| **Oxlint / ESLint**           | `oxc.oxc-vscode`            | The JavaScript Oxidation Compiler | Blazing-fast JavaScript and TypeScript code inspection.                |
| **Prettier**                  | `esbenp.prettier-vscode`    | Prettier                          | Automated code formatting on file save.                                |

### Quick VS Code Extension Installation Command:

Run this PowerShell command to install all required extensions at once:

```powershell
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension Dart-Code.flutter
code --install-extension Dart-Code.dart-code
code --install-extension bradlc.vscode-tailwindcss
code --install-extension qwtel.sqlite-viewer
code --install-extension mikestead.dotenv
code --install-extension esbenp.prettier-vscode
```

---

## 3. ⚙️ System Runtimes & Toolchains

Before installing application packages, verify these core tools are on your system `PATH`:

```text
1. Python 3.12+ (Python 3.13 / 3.14 confirmed)
   • Includes: pip, venv, setuptools
   • Check: python --version

2. Node.js 20+ (Node.js 24 LTS confirmed)
   • Includes: npm 10+
   • Check: node --version && npm --version

3. Flutter SDK 3.47+ & Dart SDK 3.13+
   • Check: flutter --version && dart --version
   • Enable Windows Desktop: flutter config --enable-windows-desktop

4. Visual Studio 2022 Community
   • Workload required: "Desktop development with C++"
   • Needed to build the native Windows Flutter runner executable (.exe)
```

---

## 4. 🐍 Backend Dependencies (FastAPI / Python)

Defined in [`services/api/requirements.txt`](file:///d:/projects%20and%20certificates/projects/uilities%20and%20others/Vault%20wise/services/api/requirements.txt):

| Category              | Package             | Version     | Purpose                                                               |
| :-------------------- | :------------------ | :---------- | :-------------------------------------------------------------------- |
| **API Framework**     | `fastapi`           | `>=0.115.0` | Asynchronous high-speed REST framework with automatic OpenAPI schemas |
| **ASGI Server**       | `uvicorn[standard]` | `>=0.34.0`  | Production-grade ASGI server with Cython uvloop & httptools           |
| **Validation**        | `pydantic`          | `>=2.10.0`  | Strict data validation and settings schemas                           |
| **Config**            | `pydantic-settings` | `>=2.8.0`   | Type-safe environment variable parsing from `.env`                    |
| **Email Checking**    | `email-validator`   | `>=2.0.0`   | RFC-compliant email validation                                        |
| **ORM**               | `SQLAlchemy`        | `>=2.0.38`  | Modern async database engine and mapped models                        |
| **Async Loop**        | `greenlet`          | `>=3.1.0`   | Required for SQLAlchemy async greenlet workers on Windows             |
| **PostgreSQL Driver** | `psycopg[binary]`   | `>=3.2.0`   | Binary C-based PostgreSQL driver                                      |
| **Async Postgres**    | `asyncpg`           | `>=0.30.0`  | Native asynchronous PostgreSQL client library                         |
| **Async SQLite**      | `aiosqlite`         | `>=0.21.0`  | Async SQLite driver for zero-configuration local development          |
| **Migrations**        | `alembic`           | `>=1.14.0`  | Schema version control and automated migrations                       |
| **Password Hashing**  | `passlib[bcrypt]`   | `>=1.7.4`   | Password hashing algorithm                                            |
| **C Cryptography**    | `bcrypt`            | `>=4.2.0`   | Fast C-implemented bcrypt encryption routines                         |
| **Token Security**    | `pyjwt`             | `>=2.10.0`  | Stateless JSON Web Token generation & verification                    |
| **Form Uploads**      | `python-multipart`  | `>=0.0.20`  | Streaming file uploads for CSV/Excel statements                       |
| **Spreadsheets**      | `openpyxl`          | `>=3.1.5`   | Excel workbook parser & generator                                     |
| **PDF Engine**        | `reportlab`         | `>=5.0.0`   | Vector PDF statements, category pie charts & watermark canvas         |
| **PDF Verification**  | `pymupdf`           | `>=2.0.0`   | PDF text extraction and visual validation                             |
| **Utilities**         | `python-dateutil`   | `>=2.9.0`   | Flexible calendar date parsing                                        |
| **Testing**           | `pytest`            | `>=8.3.0`   | Core test runner                                                      |
| **Async Testing**     | `pytest-asyncio`    | `>=0.25.0`  | Async event loop test harness                                         |
| **HTTP Testing**      | `httpx`             | `>=0.28.0`  | Async HTTP client for integration test requests                       |

---

## 5. 🌐 Frontend Dependencies (React / TypeScript / Vite)

Defined in [`apps/web/package.json`](file:///d:/projects%20and%20certificates/projects/uilities%20and%20others/Vault%20wise/apps/web/package.json):

### Production Dependencies (`dependencies`):

| Package          | Version   | Purpose                                                                              |
| :--------------- | :-------- | :----------------------------------------------------------------------------------- |
| `react`          | `^19.3.1` | Next-gen React core library                                                          |
| `react-dom`      | `^19.3.1` | React DOM renderer                                                                   |
| `recharts`       | `^3.10.1` | Vector charts (Pie, Sector, Tooltip, ResponsiveContainer) with hover pop-out effects |
| `lucide-react`   | `^1.59.0` | Modern, lightweight, customizable SVG icon set                                       |
| `clsx`           | `^2.1.1`  | Tiny utility for conditionally constructing `className` strings                      |
| `tailwind-merge` | `^3.7.0`  | Efficiently merges Tailwind CSS classes without style conflicts                      |

### Developer Dependencies (`devDependencies`):

| Package                     | Version   | Purpose                                            |
| :-------------------------- | :-------- | :------------------------------------------------- |
| `typescript`                | `~7.0.2`  | TypeScript compiler and language server            |
| `vite`                      | `^8.3.4`  | High-performance build tool and development server |
| `@vitejs/plugin-react`      | `^6.1.2`  | Fast Refresh and JSX transformation                |
| `tailwindcss`               | `^3.4.19` | Tailwind CSS utility compiler                      |
| `postcss`                   | `^8.5.31` | CSS post-processing pipeline                       |
| `autoprefixer`              | `^10.6.1` | Adds vendor prefixes to CSS automatically          |
| `vitest`                    | `^5.0.5`  | Native Vite unit testing runner                    |
| `@testing-library/react`    | `^16.3.3` | React component testing utilities                  |
| `@testing-library/jest-dom` | `^7.0.1`  | Custom jest matchers for DOM assertions            |
| `jsdom`                     | `^29.1.1` | Headless browser DOM simulation for tests          |
| `oxlint`                    | `^1.88.0` | High-speed Rust-based JavaScript/TypeScript linter |

---

## 6. 💻 Desktop Dependencies (Flutter / Dart)

Defined in [`apps/desktop/pubspec.yaml`](file:///d:/projects%20and%20certificates/projects/uilities%20and%20others/Vault%20wise/apps/desktop/pubspec.yaml):

| Package              | Version        | Purpose                                                         |
| :------------------- | :------------- | :-------------------------------------------------------------- |
| `flutter`            | `sdk: flutter` | Flutter UI framework for Windows desktop                        |
| `sqflite_common_ffi` | `^2.3.4+4`     | FFI-based SQLite engine for Windows desktop                     |
| `path_provider`      | `^2.1.5`       | Resolves standard Windows paths (`%APPDATA%`, `%LOCALAPPDATA%`) |
| `path`               | `^1.9.1`       | Cross-platform file path manipulation                           |
| `intl`               | `^0.20.2`      | Internationalization, currency formatting, and date parsing     |
| `uuid`               | `^4.5.1`       | RFC-4122 UUID v4 generation for local entity IDs                |
| `crypto`             | `^3.0.6`       | SHA-256 and encryption hashing functions                        |
| `csv`                | `^6.0.0`       | Robust RFC-4180 CSV parser and serializer                       |
| `cupertino_icons`    | `^1.0.8`       | Fallback asset icon glyphs                                      |
| `flutter_lints`      | `^6.0.0`       | Recommended Dart style guidelines and static analysis rules     |

---

## 7. 🚀 One-Click Installation Commands

Use these copy-paste PowerShell snippets to install everything from scratch:

### 1. Install Backend Virtualenv & Packages:

```powershell
cd "d:\projects and certificates\projects\uilities and others\Vault wise\services\api"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Install Web Packages:

```powershell
cd "d:\projects and certificates\projects\uilities and others\Vault wise\apps\web"
npm install
```

### 3. Install Desktop Packages:

```powershell
cd "d:\projects and certificates\projects\uilities and others\Vault wise\apps\desktop"
flutter pub get
```

---

<div align="center">
  <sub>Vaultwise — Financial Statement & Personal Wealth Management (Your Money. Your Rules.)</sub>
</div>
