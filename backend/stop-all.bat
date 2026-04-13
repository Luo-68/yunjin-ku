@echo off
chcp 65001 >nul
echo ========================================
echo    云矜ku - 停止所有后端服务
echo ========================================
echo.

taskkill /FI "WINDOWTITLE eq AI识别服务*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Express后端*" /T /F 2>nul
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul

echo.
echo 所有服务已停止！
echo.
pause