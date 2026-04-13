@echo off
chcp 65001 >nul
echo ========================================
echo    云矜ku - 后端服务启动
echo ========================================
echo.

echo [1/3] 检查Python环境...
python --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Python环境
    pause
    exit /b 1
)

echo.
echo [2/3] 检查Python依赖...
cd /d "%~dp0ai_service"
pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo 警告: Python依赖安装可能有问题，但继续启动...
)

echo.
echo [3/3] 启动服务...
echo.
echo 正在启动Python AI识别服务 (端口5000)...
start "AI识别服务" cmd /k "cd /d "%~dp0ai_service" && python app.py"

echo 等待AI服务启动...
timeout /t 3 /nobreak >nul

echo.
echo 正在启动Express后端服务 (端口3001)...
cd /d "%~dp0"
start "Express后端" cmd /k "node server.js"

echo.
echo ========================================
echo    所有服务已启动！
echo ========================================
echo.
echo 服务地址:
echo   - Express后端: http://localhost:3001
echo   - AI识别服务: http://localhost:5000
echo.
echo 测试接口:
echo   - 健康检查: http://localhost:3001/health
echo   - API文档:   http://localhost:3001/api
echo.
echo 按任意键关闭此窗口（服务将继续运行）...
pause >nul