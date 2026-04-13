# 部署指南

## 🎯 概述
本文档提供云矜裤项目的完整部署流程，包括开发环境、测试环境、生产环境的部署步骤和最佳实践。

## 📋 部署前检查清单

### 代码质量检查
- [ ] 所有测试通过 (`npm test`)
- [ ] 代码检查通过 (`npm run lint`)
- [ ] TypeScript编译通过 (`npm run build`)
- [ ] 没有控制台错误和警告
- [ ] 性能测试通过

### 环境配置
- [ ] 环境变量配置正确
- [ ] API端点配置正确
- [ ] 数据库连接配置
- [ ] CDN配置
- [ ] SSL证书配置

### 资源优化
- [ ] 图片压缩和优化
- [ ] 代码分割配置
- [ ] 缓存策略配置
- [ ] Gzip压缩启用
- [ ] 安全头配置

## 🚀 本地部署

### 开发环境部署
```bash
# 1. 克隆项目
git clone <repository-url>
cd yun-jin-ku

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# 打开浏览器访问 http://localhost:3000
```

### 生产环境本地测试
```bash
# 1. 构建生产版本
npm run build

# 2. 预览生产版本
npm run preview

# 3. 访问预览
# 打开浏览器访问 http://localhost:4173
```

## ☁️ 云部署方案

### Vercel部署 (推荐)

#### 自动部署 (Git集成)
1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入GitHub仓库
4. 配置环境变量:
   ```
   REACT_APP_AI_API_KEY=your_ai_api_key
   REACT_APP_API_URL=your_api_url
   ```
5. 点击 "Deploy"

#### 手动部署 (CLI)
```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署项目
vercel --prod

# 4. 配置环境变量
vercel env add REACT_APP_AI_API_KEY
vercel env add REACT_APP_API_URL
```

#### Vercel配置文件
创建 `vercel.json`:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Netlify部署

#### 自动部署
1. 登录 [Netlify](https://netlify.com)
2. 连接GitHub仓库
3. 配置构建设置:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
4. 设置环境变量
5. 部署

#### Netlify配置文件
创建 `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 阿里云部署

#### OSS + CDN部署
```bash
# 1. 构建项目
npm run build

# 2. 安装阿里云CLI
npm install -g @alicloud/cli

# 3. 配置阿里云CLI
aliyun configure

# 4. 上传到OSS
aliyun oss cp dist/ oss://your-bucket-name/ --recursive

# 5. 配置CDN (在阿里云控制台完成)
```

#### 阿里云部署脚本
创建 `scripts/deploy-aliyun.sh`:
```bash
#!/bin/bash

# 阿里云部署脚本
set -e

echo "开始构建项目..."
npm run build

echo "上传到OSS..."
aliyun oss cp dist/ oss://your-bucket-name/ --recursive --force

echo "刷新CDN缓存..."
aliyun cdn RefreshObjectCaches --ObjectPath https://your-domain.com/

echo "部署完成！"
```

### 腾讯云部署

#### COS + CDN部署
```bash
# 1. 安装腾讯云CLI
npm install -g @tencentcloud/cli

# 2. 配置腾讯云CLI
tccli configure

# 3. 部署到COS
tccli cos upload --bucket your-bucket --local-path ./dist --cos-path /

# 4. 配置CDN刷新
tccli cdn PurgeUrlsCache --Urls https://your-domain.com/
```

## 🐳 Docker部署

### Dockerfile配置
```dockerfile
# 构建阶段
FROM node:18-alpine as build-stage

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage

# 复制构建文件
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx配置
创建 `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # 安全头
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # React Router支持
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Docker Compose配置
```yaml
# docker-compose.yml
version: '3.8'

services:
  yun-jin-ku:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - yun-jin-ku
    restart: unless-stopped
```

### 构建和运行
```bash
# 1. 构建Docker镜像
docker build -t yun-jin-ku .

# 2. 运行容器
docker run -d -p 3000:80 --name yun-jin-ku-app yun-jin-ku

# 3. 使用Docker Compose
docker-compose up -d

# 4. 查看日志
docker logs yun-jin-ku-app
```

## 🔧 环境变量配置

### 开发环境
```bash
# .env.development
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AI_API_KEY=dev_ai_key
REACT_APP_ENVIRONMENT=development
```

### 生产环境
```bash
# .env.production
REACT_APP_API_URL=https://api.yunjinku.com
REACT_APP_AI_API_KEY=prod_ai_key
REACT_APP_ENVIRONMENT=production
REACT_APP_GA_TRACKING_ID=GA-XXXXXXXX
```

### 环境变量类型声明
```typescript
// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_URL: string;
    readonly REACT_APP_AI_API_KEY: string;
    readonly REACT_APP_ENVIRONMENT: 'development' | 'production' | 'test';
    readonly REACT_APP_GA_TRACKING_ID?: string;
  }
}
```

## 🔄 持续集成/部署

### GitHub Actions完整配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.API_URL }}
        REACT_APP_AI_API_KEY: ${{ secrets.AI_API_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./
```

## 📊 监控和分析

### 性能监控
```typescript
// src/utils/performance.ts
export const measurePerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      
      console.log(`页面加载时间: ${pageLoadTime}ms`);
      
      // 发送到分析服务
      if (window.gtag) {
        window.gtag('event', 'page_load_time', {
          value: pageLoadTime
        });
      }
    });
  }
};
```

### 错误监控
```typescript
// src/utils/errorTracking.ts
export const initErrorTracking = () => {
  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    
    // 发送到错误跟踪服务
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: event.error?.message || 'Unknown error',
        fatal: false
      });
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: event.reason?.message || 'Unhandled promise rejection',
        fatal: false
      });
    }
  });
};
```

## 🛡️ 安全最佳实践

### 安全头配置
```nginx
# 在nginx配置中添加
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 依赖安全检查
```bash
# 检查依赖安全漏洞
npm audit

# 自动修复安全漏洞
npm audit fix

# 定期更新依赖
npm update
```

## 🔍 部署验证

### 部署后检查清单
- [ ] 网站可以正常访问
- [ ] 所有页面加载正常
- [ ] 导航功能正常
- [ ] 图片和资源加载正常
- [ ] API调用正常
- [ ] 表单提交正常
- [ ] 移动端适配正常
- [ ] 性能指标符合要求
- [ ] 安全头配置正确
- [ ] SSL证书有效
- [ ] 404页面配置正确
- [ ] 重定向规则工作正常

### 自动化验证脚本
```bash
#!/bin/bash
# scripts/verify-deployment.sh

set -e

URL="https://your-domain.com"

echo "验证部署..."

# 检查网站状态
curl -s -o /dev/null -w "%{http_code}" $URL

# 检查关键页面
curl -s "$URL" | grep -q "云矜裤"
curl -s "$URL/gallery" | grep -q "锦绣画廊"
curl -s "$URL/recognition" | grep -q "AI智能识别"

echo "部署验证通过！"
```

## 🚨 回滚策略

### 快速回滚
```bash
# 如果使用Git部署，可以快速回滚到上一个版本
git revert HEAD
npm run build
# 重新部署
```

### 备份策略
- 保留最近5个版本的构建文件
- 数据库备份
- 配置文件备份
- 快速切换机制

---
*最后更新: 2025年12月8日*
*运维负责人: DevOps团队*