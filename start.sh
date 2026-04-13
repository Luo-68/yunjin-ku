#!/bin/bash

echo ""
echo "========================================"
echo "    云矜裤项目 - 一键启动工具"
echo "========================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "[错误] 未检测到npm"
    exit 1
fi

echo "[信息] Node.js版本:"
node --version
echo "[信息] npm版本:"
npm --version
echo ""

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "[信息] 检测到首次运行，正在安装依赖..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        exit 1
    fi
    echo ""
    echo "[成功] 依赖安装完成"
    echo ""
fi

# 检查后端目录
if [ -d "backend" ]; then
    echo "[信息] 检测到后端目录，准备启动后端服务..."
    if [ ! -d "backend/node_modules" ]; then
        echo "[信息] 正在安装后端依赖..."
        cd backend
        npm install
        cd ..
    fi
fi

echo ""
echo "========================================"
echo "    正在启动云矜裤项目..."
echo "========================================"
echo ""

# 启动服务
if [ -d "backend" ]; then
    echo "[信息] 启动前端和后端服务..."
    echo "[提示] 前端地址: http://localhost:3000"
    echo "[提示] 后端地址: http://localhost:3001"
    echo ""
    echo "[提示] 按 Ctrl+C 停止所有服务"
    echo ""
    npm run start:all
else
    echo "[信息] 启动前端服务..."
    echo "[提示] 访问地址: http://localhost:3000"
    echo ""
    echo "[提示] 按 Ctrl+C 停止服务"
    echo ""
    npm run dev
fi