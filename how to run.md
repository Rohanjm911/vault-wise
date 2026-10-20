# 🚀 Vaultwise — How to Run Guide

<div align="center">

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="40" height="40" alt="Python" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" width="40" height="40" alt="FastAPI" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="40" height="40" alt="React" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="40" height="40" alt="TypeScript" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="40" height="40" alt="Vite" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="40" height="40" alt="Tailwind" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" width="40" height="40" alt="SQLite" />

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)

<p align="center">
  <strong>Comprehensive execution guide for running Vaultwise Web App & FastAPI Backend.</strong>
</p>

</div>

---

## 📋 Table of Contents

1. [Tech Stack & Real-Life Logos](#1--tech-stack--real-life-logos)
2. [Prerequisites Checklist](#2--prerequisites-checklist)
3. [Quick Start (TL;DR)](#3--quick-start-tldr)
4. [Part 1: Running FastAPI Backend Server](#4--part-1-running-fastapi-backend-server)
5. [Part 2: Running React Web Application](#5--part-2-running-react-web-application)
6. [Demo Account Credentials](#6--demo-account-credentials)
7. [Testing & Quality Verification](#7--testing--quality-verification)
8. [Troubleshooting & FAQs](#8--troubleshooting--faqs)

---

## 1. 🛠️ Tech Stack & Real-Life Logos

| Technology             |                                                                      Logo                                                                       |    Version     | Role in Vaultwise                                        |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------: | :------------: | :------------------------------------------------------- |
| **Python**             |         <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="32" height="32" alt="Python" />         | `3.12+ / 3.14` | Backend programming runtime                              |
| **FastAPI**            |       <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" width="32" height="32" alt="FastAPI" />        |   `^0.115.0`   | Asynchronous high-performance REST API                   |
| **Uvicorn**            |           <img src="https://raw.githubusercontent.com/encode/uvicorn/master/docs/uvicorn.png" width="32" height="32" alt="Uvicorn" />           |   `^0.34.0`    | Lightning-fast ASGI web server                           |
| **React**              |          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="32" height="32" alt="React" />           |    `19.3.1`    | Component-based UI frontend                              |
| **TypeScript**         |   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="32" height="32" alt="TypeScript" />   |    `~7.0.2`    | Static type safety and developer productivity            |
| **Vite**               |          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="32" height="32" alt="Vite" />          |    `^8.3.4`    | Next-generation frontend bundler & dev server            |
| **Tailwind CSS**       | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="32" height="32" alt="Tailwind CSS" /> |   `^3.4.19`    | Utility-first CSS with Neumorphic + Neo-Brutalist tokens |
| **SQLite**             |         <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" width="32" height="32" alt="SQLite" />         |  `3.x / FFI`   | Local development database storage                       |
| **SQLAlchemy**         |   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlalchemy/sqlalchemy-original.svg" width="32" height="32" alt="SQLAlchemy" />   |   `^2.0.38`    | Modern async Python ORM                                  |

---

## 2. 🧰 Prerequisites Checklist

Ensure the following tools are installed on your Windows machine before running the project:

- [x] **Python 3.12+** (Python 3.13 or 3.14 recommended, with `Add python.exe to PATH` checked).
- [x] **Node.js v20+** (Node.js v22/v24 LTS recommended) and **npm**.
- [x] **PowerShell 7+** or standard Windows PowerShell.

Verify installations in your terminal:

```powershell
python --version
node --version
npm --version
```

---

## 3. ⚡ Quick Start (TL;DR)

### 🖱️ Option A: One-Click Windows Batch Scripts (Recommended)

You can directly double-click the `.bat` files in the root folder:

- **`start.bat`**: Starts both the FastAPI backend (port 8000) and Web app (port 5173) in separate windows and automatically opens your browser.
- **`stop.bat`**: Gracefully terminates both servers and frees up ports 8000 and 5173.
- **`build.bat`**: Compiles the complete production build (`npm run build`).

### ⌨️ Option B: Manual Terminal Execution

Open **3 separate terminal windows** inside the root directory `Vault wise`:

```powershell
# Terminal 1: Backend API Server
cd services/api
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Web Frontend Application
cd apps/web
npm run dev

# Terminal 3: Native Windows Desktop App
cd apps/desktop
flutter run -d windows
```

- **Web Dashboard**: `http://localhost:5173/` (or `http://localhost:4173/` for production preview)
- **Interactive Swagger API Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc API Reference**: `http://127.0.0.1:8000/redoc`

---

## 4. 🐍 Part 1: Running FastAPI Backend Server

### Step 1: Navigate to API Directory

```powershell
cd services/api
```

### Step 2: Create & Activate Virtual Environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

_(If PowerShell restricts script execution, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)_

### Step 3: Install Backend Dependencies

```powershell
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Copy the template configuration if not already present:

```powershell
Copy-Item "..\..\.env.example" ".env"
```

### Step 5: Run Database Migrations

Execute Alembic migrations to prepare SQLite database tables:

```powershell
alembic upgrade head
```

### Step 6: Start the Uvicorn Server

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

You will see output indicating startup:

```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process using WatchFiles
INFO:     Application startup complete.
```

---

## 5. 🌐 Part 2: Running React Web Application

### Step 1: Navigate to Web Directory

```powershell
cd apps/web
```

### Step 2: Install NPM Packages

```powershell
npm install
```

### Step 3: Run in Development Mode

```powershell
npm run dev
```

Vite will start the dev server at:
👉 **`http://localhost:5173/`**

### Step 4: (Alternative) Build & Run Production Preview

If you want to test the optimized production build:

```powershell
npm run build
npm run preview
```

The production preview will be served at:
👉 **`http://localhost:4173/`**

---

## 6. 🔑 Demo Account Credentials

A pre-seeded demonstration account is available for immediate testing across all apps:

| Field             | Demo Credential                                              |
| :---------------- | :----------------------------------------------------------- |
| **Email Address** | `demo@vaultwise.com`                                         |
| **Password**      | `Password123!`                                               |
| **Quick Fill**    | Click the **"Fill Demo Account"** button on the Login screen |

### Features to explore in Demo Mode:

- **Interactive Pie Chart**: Hover over segments on the Dashboard to see real-time **pop-out radial animation**, center amount/share card, and legend sync.
- **Watermarked PDF Statement**: Go to **Reports**, apply date or category filters, and click **Download PDF Report** to view the embedded vector chart and brand logo watermark.
- **Top Currency Switcher**: Click the currency button in the top header (`₹ INR`, `$ USD`, `€ EUR`, etc.) to switch application-wide currency symbols and values.
- **Transactions & Budgets**: Add expenses, inspect categories, and track budget utilization with visual progress indicators.

---

## 7. 🧪 Testing & Quality Verification

Run automated test suites to ensure 100% integrity across codebases:

### 1. Backend Test Suite (FastAPI / Pytest)

```powershell
cd services/api
.\.venv\Scripts\Activate.ps1
python -m pytest app/tests
```

_(Runs 6 test suites covering auth, transactions, analytics, budgets, and safe PDF/CSV/Excel exports)._

### 2. Web App Test Suite (Vitest)

```powershell
cd apps/web
npm test -- --run
```

_(Runs 4 test files and 8 test cases verifying authentication screens, summary metrics, currency conversions, and pie chart pop-out states)._

---

## 8. ❓ Troubleshooting & FAQs

### Q1: `activate.ps1 cannot be loaded because running scripts is disabled`

**Solution**: Open PowerShell and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Q2: Port 8000 is already in use

**Solution**: Stop any orphaned uvicorn process or specify another port:

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
uvicorn app.main:app --port 8000 --reload
```

---

<div align="center">
  <sub>Vaultwise — Financial Statement & Personal Wealth Management (Your Money. Your Rules.)</sub>
</div>
