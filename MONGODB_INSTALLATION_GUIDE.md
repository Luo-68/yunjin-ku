# MongoDB 安装和使用指南

## 目录
1. [什么是 MongoDB](#什么是-mongodb)
2. [安装 MongoDB](#安装-mongodb)
3. [启动 MongoDB](#启动-mongodb)
4. [验证 MongoDB 是否运行](#验证-mongodb-是否运行)
5. [配置云矜ku 项目使用 MongoDB](#配置云矜ku-项目使用-mongodb)
6. [常用 MongoDB 命令](#常用-mongodb-命令)
7. [故障排除](#故障排除)

---

## 什么是 MongoDB

MongoDB 是一个流行的 NoSQL 数据库，以文档形式存储数据。云矜ku 项目使用 MongoDB 来存储用户信息、会话数据等。

**为什么选择 MongoDB？**
- 易于使用，无需定义复杂的表结构
- 与 Node.js 集成良好
- 支持灵活的数据模型
- 适合现代 Web 应用

---

## 安装 MongoDB

### Windows 系统

#### 方法一：使用官方安装程序（推荐）

1. **下载 MongoDB**
   - 访问 MongoDB 官网：https://www.mongodb.com/try/download/community
   - 选择 Windows 版本
   - 下载 MSI 安装包

2. **运行安装程序**
   - 双击下载的 `.msi` 文件
   - 点击 "Next" 接受许可协议
   - 选择 "Complete" 完整安装
   - 勾选 "Install MongoDB as a Service"（安装为 Windows 服务）
   - 勾选 "Install MongoDB Compass"（可选，可视化工具）
   - 点击 "Install" 开始安装
   - 安装完成后点击 "Finish"

3. **配置环境变量**
   - 默认安装路径：`C:\Program Files\MongoDB\Server\版本号\bin`
   - 安装程序通常会自动添加到系统环境变量

#### 方法二：使用 Chocolatey（包管理器）

如果你已经安装了 Chocolatey，可以快速安装：

```powershell
# 以管理员身份运行 PowerShell
choco install mongodb -y
```

### macOS 系统

使用 Homebrew 安装：

```bash
# 安装 Homebrew（如果还没安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 MongoDB
brew tap mongodb/brew
brew install mongodb-community

# 启动 MongoDB
brew services start mongodb-community
```

### Linux 系统 (Ubuntu/Debian)

```bash
# 导入 MongoDB 公钥
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 68818C72E52529D4

# 添加 MongoDB 仓库
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# 更新包列表
sudo apt-get update

# 安装 MongoDB
sudo apt-get install -y mongodb-org

# 启动 MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 启动 MongoDB

### Windows 系统

#### 方式一：作为 Windows 服务启动（推荐）

如果你安装时勾选了"Install MongoDB as a Service"：

1. **启动服务**
   - 按 `Win + R`，输入 `services.msc` 回车
   - 找到 "MongoDB"
   - 右键选择"启动"

2. **使用命令行启动**
   ```powershell
   # 启动服务
   net start MongoDB

   # 停止服务
   net stop MongoDB
   ```

#### 方式二：手动启动

```powershell
# 进入 MongoDB 安装目录
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# 启动 MongoDB（前台运行）
mongod

# 指定数据目录（如果默认目录不存在）
mongod --dbpath "C:\data\db"

# 后台运行
start /B mongod
```

### macOS/Linux 系统

```bash
# 启动 MongoDB 服务
sudo systemctl start mongod

# 或使用 brew（macOS）
brew services start mongodb-community
```

---

## 验证 MongoDB 是否运行

### 方法一：检查端口

MongoDB 默认使用端口 27017。

```powershell
# Windows
netstat -ano | findstr :27017

# macOS/Linux
netstat -an | grep 27017
```

如果看到 `LISTENING` 状态，说明 MongoDB 正在运行。

### 方法二：使用 MongoDB Shell 连接

```powershell
# Windows
mongo

# 或使用新版 MongoDB Shell
mongosh

# macOS/Linux
mongosh
```

成功连接后会看到类似的提示符：
```
MongoDB shell version v5.0.0
connecting to: mongodb://127.0.0.1:27017
```

### 方法三：使用云矜ku 后端测试

```powershell
# 在项目根目录运行后端
cd backend
node server.js
```

如果看到 `✅ MongoDB 连接成功`，说明 MongoDB 正常运行。

---

## 配置云矜ku 项目使用 MongoDB

### 1. 创建环境配置文件

在 `backend` 目录下创建 `.env` 文件：

```bash
# 复制示例文件
cd backend
copy .env.example .env
```

### 2. 编辑 `.env` 文件

```env
# MongoDB 数据库配置
MONGODB_URI=mongodb://localhost:27017/yun-jin-ku

# Session 配置
SESSION_SECRET=your-secret-key-here-change-this-in-production

# 邮件服务配置（可选）
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 前端地址
FRONTEND_URL=http://localhost:3000

# 端口
PORT=3001
```

### 3. 启动后端服务

```powershell
# 进入后端目录
cd backend

# 启动服务
node server.js
```

看到以下信息表示成功：
```
========================================
    云矜裤后端服务启动成功
========================================
服务地址: http://localhost:3001
API文档: http://localhost:3001/api
健康检查: http://localhost:3001/health
========================================
✅ MongoDB 连接成功
========================================
```

---

## 常用 MongoDB 命令

### MongoDB Shell 基本操作

```javascript
// 连接到数据库
use yun-jin-ku

// 显示所有数据库
show dbs

// 显示当前数据库的集合（表）
show collections

// 查看集合中的所有文档
db.users.find()

// 查看集合中的文档数量
db.users.count()

// 删除集合
db.users.drop()

// 删除数据库
use yun-jin-ku
db.dropDatabase()
```

### 云矜ku 相关操作

```javascript
// 切换到云矜ku 数据库
use yun-jin-ku

// 查看所有用户
db.users.find({}, {password: 0})  // 不显示密码

// 查看特定用户
db.users.findOne({username: "test"})

// 删除某个用户
db.users.deleteOne({username: "test"})

// 查看会话数据
db.sessions.find()

// 清空所有会话
db.sessions.deleteMany({})
```

---

## 故障排除

### 问题 1：MongoDB 无法启动

**症状：**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**解决方案：**

1. **检查 MongoDB 服务是否运行**
   ```powershell
   # Windows
   services.msc
   # 找到 MongoDB 服务，确保状态为"正在运行"
   ```

2. **手动启动 MongoDB**
   ```powershell
   # 尝试直接运行 mongod
   mongod

   # 如果提示数据目录不存在，创建目录
   mkdir C:\data\db
   mongod --dbpath "C:\data\db"
   ```

3. **检查端口占用**
   ```powershell
   netstat -ano | findstr :27017
   ```

4. **查看 MongoDB 日志**
   - Windows: `C:\Program Files\MongoDB\Server\版本号\log\mongod.log`

### 问题 2：权限错误

**症状：**
```
Error: EACCES: permission denied
```

**解决方案：**

- Windows: 以管理员身份运行命令提示符
- macOS/Linux: 使用 `sudo`

### 问题 3：端口被占用

**症状：**
```
Address already in use
```

**解决方案：**

1. **找到占用端口的进程**
   ```powershell
   netstat -ano | findstr :27017
   ```

2. **终止进程**
   ```powershell
   taskkill /PID <进程ID> /F
   ```

3. **或修改 MongoDB 端口**
   - 编辑 MongoDB 配置文件 `mongod.conf`
   - 修改 `port` 为其他端口

### 问题 4：数据库连接超时

**症状：**
```
MongoTimeoutError: Server selection timed out
```

**解决方案：**

1. **检查 MongoDB 是否运行**
   ```powershell
   netstat -ano | findstr :27017
   ```

2. **检查防火墙设置**
   - 确保 MongoDB 端口（27017）未被阻止

3. **检查 MongoDB 配置**
   ```env
   # 确保 .env 文件中的配置正确
   MONGODB_URI=mongodb://localhost:27017/yun-jin-ku
   ```

---

## MongoDB 可视化工具（可选）

### MongoDB Compass（官方工具）

1. 下载安装：https://www.mongodb.com/try/download/compass
2. 启动后输入连接字符串：`mongodb://localhost:27017`
3. 可以直观地查看和管理数据库

### 其他推荐工具

- **MongoDB for VS Code** - VS Code 插件
- **NoSQLBooster** - 功能强大的 MongoDB GUI
- **Studio 3T** - 专业的 MongoDB 客户端

---

## 安全建议

### 生产环境配置

1. **启用身份验证**
   ```javascript
   // 创建管理员用户
   use admin
   db.createUser({
     user: "admin",
     pwd: "strong-password",
     roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
   })

   // 修改连接字符串
   MONGODB_URI=mongodb://admin:strong-password@localhost:27017/yun-jin-ku?authSource=admin
   ```

2. **限制网络访问**
   - 仅允许本地访问
   - 配置防火墙规则

3. **定期备份数据**
   ```bash
   mongodump --db yun-jin-ku --out /path/to/backup
   ```

4. **更新 SESSION_SECRET**
   ```env
   SESSION_SECRET=use-a-very-long-random-string-here
   ```

---

## 总结

现在你已经掌握了：

✅ MongoDB 的安装方法
✅ 启动和验证 MongoDB
✅ 配置云矜ku 项目使用 MongoDB
✅ 常用 MongoDB 命令
✅ 常见问题的解决方法

**下一步：**
1. 启动 MongoDB 服务
2. 启动后端服务
3. 测试注册和登录功能

如有问题，请参考故障排除部分或联系技术支持。

---

## 附录：快速启动脚本

创建 `start-mongodb.bat` 文件（Windows）：

```batch
@echo off
echo Starting MongoDB...
net start MongoDB
if %ERRORLEVEL% EQU 0 (
    echo MongoDB started successfully!
) else (
    echo Failed to start MongoDB. Trying manual start...
    mongod --dbpath "C:\data\db"
)
pause
```

创建 `stop-mongodb.bat` 文件（Windows）：

```batch
@echo off
echo Stopping MongoDB...
net stop MongoDB
if %ERRORLEVEL% EQU 0 (
    echo MongoDB stopped successfully!
) else (
    echo MongoDB was not running.
)
pause
```

---

**文档版本：** 1.0
**最后更新：** 2026年3月5日
**适用项目：** 云矜ku (Yun Jin Ku)