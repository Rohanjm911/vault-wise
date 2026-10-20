@echo off
title Vaultwise Stopper
chcp 65001 >nul
cls

echo ==============================================================================
echo                      🛑 STOPPING VAULTWISE SERVICES
echo ==============================================================================
echo.

echo [1/3] Terminating servers on Port 8000 (Backend API)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo   • Killing PID %%a on Port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Terminating servers on Port 5173 (Frontend Web)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo   • Killing PID %%a on Port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

echo [3/3] Terminating servers on Port 4173 (Production Preview)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4173" ^| findstr "LISTENING"') do (
    echo   • Killing PID %%a on Port 4173...
    taskkill /F /PID %%a >nul 2>&1
)

:: Gracefully close any remaining command windows titled with Vaultwise
taskkill /FI "WINDOWTITLE eq Vaultwise Backend API*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Vaultwise Web Frontend*" /F >nul 2>&1

echo.
echo ==============================================================================
echo                      ✅ ALL VAULTWISE SERVICES STOPPED
echo ==============================================================================
echo Ports 8000, 5173, and 4173 are now free.
echo.
pause
