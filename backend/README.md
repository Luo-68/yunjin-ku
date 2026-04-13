# 云矜裤后端服务

## 📋 说明

这是云矜裤项目的后端服务，提供API接口支持前端功能。

## 🚀 快速启动

### 安装依赖
```bash
npm install
```

### 启动服务
```bash
npm run dev
```

服务将在 http://localhost:3001 启动

## 📡 API接口

### 健康检查
```
GET /health
```

### API信息
```
GET /api
```

### AI识别（开发中）
```
POST /api/recognition
Content-Type: application/json

{
  "image": "base64_encoded_image"
}
```

### 画廊数据（开发中）
```
GET /api/gallery
```

## 🔧 开发说明

### 添加新接口
1. 在 `server.js` 中添加新的路由
2. 实现业务逻辑
3. 返回JSON格式的响应

### 数据库集成
如需添加数据库支持，可以安装相关依赖：
```bash
npm install mongoose  # MongoDB
# 或
npm install sequelize  # MySQL/PostgreSQL
```

## 📝 项目结构

```
backend/
├── server.js          # 主服务文件
├── package.json       # 项目配置
└── README.md          # 说明文档
```

## 💡 扩展建议

- 添加用户认证API
- 集成AI识别服务
- 实现数据持久化
- 添加文件上传功能
- 实现社区分享API

---

*后端服务 - 云矜裤项目*