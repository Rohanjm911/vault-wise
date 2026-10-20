@echo off
title Vaultwise Starter
chcp 65001 >nul
cls

echo ==============================================================================
echo                      🚀 STARTING VAULTWISE SERVICES
echo ==============================================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/3] Checking Backend Python Environment...
if not exist "services\api\.venv\Scripts\python.exe" (
    echo [!] Virtual environment not found in services\api\.venv!
    echo [!] Creating virtual environment and installing dependencies...
    python -m venv services\api\.venv
    call services\api\.venv\Scripts\pip install -r services\api\requirements.txt
)

echo [2/3] Launching FastAPI Backend Server (Port 8000)...
start "Vaultwise Backend API (Port 8000)" cmd /k "cd /d ""%ROOT_DIR%services\api"" && title Vaultwise Backend API (Port 8000) && call .\.venv\Scripts\activate.bat && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Launching Web Frontend Application (Port 5173)...
start "Vaultwise Web Frontend (Port 5173)" cmd /k "cd /d ""%ROOT_DIR%apps\web"" && title Vaultwise Web Frontend (Port 5173) && npm run dev"

echo.
echo ==============================================================================
echo                      ✅ VAULTWISE SERVICES LAUNCHED
echo ==============================================================================
echo   • Web Dashboard:    http://localhost:5173/
echo   • Interactive API:  http://127.0.0.1:8000/docs
echo   • ReDoc Reference:  http://127.0.0.1:8000/redoc
echo.
echo Opening web dashboard in default browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173/

echo.
echo [Note] Keep the service windows open while using Vaultwise.
echo Run 'stop.bat' to terminate both servers whenever you're done.
echo ==============================================================================
echo.
pause
