# 云矜裤项目 - 一键启动指南

## 🚀 快速启动

### Windows系统
双击运行 `start.bat` 文件即可一键启动项目。

### 命令行启动

#### 仅启动前端
```bash
npm run dev
```

#### 启动前端和后端（如果后端已配置）
```bash
npm run start:all
```

## 📋 启动说明

### 首次启动
1. 双击 `start.bat` 文件
2. 系统会自动检测Node.js和npm
3. 自动安装项目依赖
4. 启动开发服务器

### 访问地址
- **前端地址**: http://localhost:3000
- **后端地址**: http://localhost:3001（如果后端已配置）

## 🔧 配置说明

### 添加后端服务

如果需要添加后端服务，请按以下步骤操作：

1. 创建 `backend` 目录
2. 在 `backend` 目录中初始化Node.js项目：
   ```bash
   cd backend
   npm init -y
   ```

3. 安装必要的依赖（例如Express）：
   ```bash
   npm install express
   ```

4. 创建 `backend/package.json`，添加启动脚本：
   ```json
   {
     "scripts": {
       "dev": "node server.js"
     }
   }
   ```

5. 创建 `backend/server.js`：
   ```javascript
   const express = require('express');
   const app = express();
   const port = 3001;

   app.get('/', (req, res) => {
     res.json({ message: '云矜裤后端服务运行中' });
   });

   app.listen(port, () => {
     console.log(`后端服务运行在 http://localhost:${port}`);
   });
   ```

6. 重新运行 `start.bat`，将自动启动前后端服务

## 🛠️ 常见问题

### Node.js未安装
请访问 [Node.js官网](https://nodejs.org/) 下载并安装Node.js（推荐v18或更高版本）

### 端口被占用
如果3000端口被占用，可以修改 `vite.config.ts` 中的端口配置：
```typescript
export default defineConfig({
  server: {
    port: 3000 // 修改为其他端口
  }
})
```

### 依赖安装失败
尝试删除 `node_modules` 文件夹和 `package-lock.json` 文件，然后重新运行：
```bash
npm install
```

或者使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 启动失败
如果启动失败，请按以下步骤排查：

1. **运行诊断工具**：
   ```bash
   diagnose.bat
   ```

2. **运行快速修复**：
   ```bash
   fix.bat
   ```

3. **仅启动前端**（排除后端问题）：
   ```bash
   start-frontend-only.bat
   ```

4. **使用简易启动**：
   ```bash
   start-simple.bat
   ```

### concurrently 错误
如果提示 `concurrently` 未找到，运行：
```bash
npm install concurrently --save-dev
```

### 后端启动失败
检查 `backend` 目录下的依赖是否安装：
```bash
cd backend
npm install
cd ..
```

## 📝 项目结构

```
yun-jin-ku/
├── start.bat              # 一键启动脚本（Windows）
├── package.json           # 前端项目配置
├── src/                   # 前端源代码
├── public/                # 静态资源
├── backend/               # 后端目录（可选）
│   ├── package.json       # 后端项目配置
│   └── server.js          # 后端服务文件
└── node_modules/          # 依赖包
```

## 💡 使用提示

- 启动后不要关闭命令行窗口
- 按 `Ctrl+C` 可以停止服务
- 修改代码后浏览器会自动刷新（热更新）
- 查看控制台输出了解运行状态

## 📞 技术支持

如遇问题，请检查：
1. Node.js版本是否正确
2. 网络连接是否正常
3. 端口是否被占用
4. 依赖是否正确安装

---

*最后更新: 2025年12月*