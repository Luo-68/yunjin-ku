@echo off
echo ========================================
echo    Stop All Services
echo ========================================
echo.

echo Stopping all related processes...
echo.

echo Stopping Node.js processes (frontend and backend)...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js processes stopped
) else (
    echo [INFO] No running Node.js processes
)

echo.
echo Stopping Python processes (AI service)...
taskkill /f /im python.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python processes stopped
) else (
    echo [INFO] No running Python processes
)

echo.
echo ========================================
echo    All services stopped
echo ========================================
echo.
timeout /t 2 /nobreak >nul