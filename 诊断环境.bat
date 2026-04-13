@echo off
echo ========================================
echo    Yun Jin Ku - Environment Diagnostics
echo ========================================
echo.

echo [1] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not installed
) else (
    echo [OK] Node.js installed
)

echo.
echo [2] Checking Python...
python --version
if %errorlevel% neq 0 (
    echo [ERROR] Python not installed
) else (
    echo [OK] Python installed
)

echo.
echo [3] Checking frontend dependencies...
if exist "node_modules\" (
    echo [OK] Frontend dependencies installed
) else (
    echo [ERROR] Frontend dependencies missing, run: npm install
)

echo.
echo [4] Checking backend dependencies...
if exist "backend\node_modules\" (
    echo [OK] Backend dependencies installed
) else (
    echo [ERROR] Backend dependencies missing, run: cd backend ^&^& npm install
)

echo.
echo [5] Checking port availability...
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port 3000 is in use
) else (
    echo [OK] Port 3000 available
)

netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port 3001 is in use
) else (
    echo [OK] Port 3001 available
)

netstat -ano | findstr ":5000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port 5000 is in use
) else (
    echo [OK] Port 5000 available
)

echo.
echo [6] Checking configuration files...
if exist "backend\.env" (
    echo [OK] Backend config file exists
) else (
    echo [WARNING] Backend config missing, copy .env.example to .env
)

if exist "backend\ai_service\.env" (
    echo [OK] AI service config file exists
) else (
    echo [WARNING] AI service config missing, copy .env.example to .env
)

echo.
echo ========================================
echo    Diagnostics complete
echo ========================================
echo.
pause