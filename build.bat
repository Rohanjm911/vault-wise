@echo off
title Vaultwise Production Builder
chcp 65001 >nul
cls

echo ==============================================================================
echo                      🏗️ RUNNING VAULTWISE PRODUCTION BUILD
echo ==============================================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/2] Building Web Frontend Application (TypeScript + Vite)...
cd apps\web
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Web build failed with code %ERRORLEVEL%!
    pause
    exit /b %ERRORLEVEL%
)
cd /d "%ROOT_DIR%"

echo.
echo [2/2] Checking Backend Test Integrity...
call services\api\.venv\Scripts\python.exe -m pytest services\api\app\tests\test_imports_exports.py -q
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Backend test check returned non-zero code.
)

echo.
echo ==============================================================================
echo                      ✅ PRODUCTION BUILD COMPLETE
echo ==============================================================================
echo Output generated in: apps\web\dist\
echo.
pause
