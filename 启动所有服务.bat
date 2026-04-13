@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    Yun Jin Ku - Start All Services
echo ========================================
echo.

echo [1/6] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)
echo [OK] Node.js installed
node --version

echo.
echo [2/6] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found
    pause
    exit /b 1
)
echo [OK] Python installed
python --version

echo.
echo [3/6] Checking frontend dependencies...
if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies ready
)

echo.
echo [4/6] Checking backend dependencies...
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies ready
)

echo.
echo [5/6] Stopping old services (by port)...
echo.

REM Kill processes on specific ports
for %%p in (3000 3001 5000) do (
    for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%p " ^| findstr "LISTENING"') do (
        taskkill /f /pid %%a >nul 2>&1
        if not errorlevel 1 echo [OK] Stopped process on port %%p (PID: %%a)
    )
)

echo.
echo [6/6] Starting all services...
echo.

echo Starting AI Service (port 5000)...
start "AI Service" cmd /k "cd /d %~dp0backend\ai_service && python app.py"

timeout /t 2 /nobreak >nul

echo Starting Express Backend (port 3001)...
start "Express Backend" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 2 /nobreak >nul

echo Starting Frontend (port 3000)...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo    All services started!
echo ========================================
echo.
echo Service URLs:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:3001
echo   - AI Service: http://localhost:5000
echo.
echo Note: Close individual service windows to stop them
echo.
pause
