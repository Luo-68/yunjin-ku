# API集成指南

## 🎯 概述
本文档指导如何在云矜裤项目中集成各种API服务，包括AI识别、文件上传、用户认证等。

## 🔧 AI识别API集成

### 当前状态
- Recognition页面已创建基础UI
- 需要集成实际的AI识别服务

### 推荐集成方案

#### 方案1: 阿里云视觉智能
```typescript
// src/services/aiRecognition.ts
interface RecognitionResult {
  ethnicity: string;
  dynasty: string;
  craftsmanship: string[];
  confidence: number;
  description: string;
}

class AIRecognitionService {
  private baseURL = 'https://vision.aliyun.com/api';
  private apiKey = process.env.REACT_APP_AI_API_KEY;

  async recognizeClothing(imageFile: File): Promise<RecognitionResult> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await fetch(`${this.baseURL}/ethnic-clothing-recognize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('AI识别失败:', error);
      throw new Error('服饰识别失败，请重试');
    }
  }
}

export const aiService = new AIRecognitionService();
```

#### 方案2: 腾讯云AI
```typescript
// src/services/tencentAI.ts
interface TencentAIResult {
  result: {
    ethnic_group: string;
    period: string;
    features: string[];
    cultural_info: string;
  };
  error_code: number;
  error_msg: string;
}

class TencentAIService {
  async analyzeClothing(imageBase64: string): Promise<TencentAIResult> {
    // 腾讯云AI集成代码
  }
}
```

### 前端集成步骤

1. **在Recognition页面中添加API调用**
```typescript
// src/pages/Recognition/index.tsx
import { aiService } from '@/services/aiRecognition';

const handleImageUpload = async (file: File) => {
  setLoading(true);
  try {
    const result = await aiService.recognizeClothing(file);
    setRecognitionResult(result);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

2. **添加加载状态管理**
```typescript
const [loading, setLoading] = useState(false);
const [result, setResult] = useState<RecognitionResult | null>(null);
```

## 📁 文件上传API

### 图片上传服务
```typescript
// src/services/fileUpload.ts
interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

class FileUploadService {
  private uploadURL = '/api/upload';

  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
    
    const response = await fetch(this.uploadURL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('上传失败');
    }
    
    return await response.json();
  }

  async uploadToCDN(file: File): Promise<string> {
    // 上传到CDN的实现
    const response = await this.uploadImage(file);
    return response.url;
  }
}

export const fileService = new FileUploadService();
```

## 👤 用户认证API

### JWT认证集成
```typescript
// src/services/auth.ts
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  private tokenKey = 'yun_jin_ku_token';
  private userKey = 'yun_jin_ku_user';

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('登录失败');
    }

    const data = await response.json();
    this.setToken(data.token);
    this.setUser(data.user);
    
    return data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('注册失败');
    }

    return await response.json();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}

export const authService = new AuthService();
```

## 📊 数据统计API

### 用户行为统计
```typescript
// src/services/analytics.ts
interface PageViewEvent {
  page: string;
  userId?: string;
  timestamp: number;
  referrer?: string;
}

interface InteractionEvent {
  action: string;
  element: string;
  value?: any;
  userId?: string;
}

class AnalyticsService {
  async trackPageView(event: PageViewEvent): Promise<void> {
    await fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  }

  async trackInteraction(event: InteractionEvent): Promise<void> {
    await fetch('/api/analytics/interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  }
}

export const analyticsService = new AnalyticsService();
```

## 🔗 API错误处理

### 统一错误处理
```typescript
// src/utils/apiErrorHandler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any): string => {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 400:
        return '请求参数错误';
      case 401:
        return '未授权，请重新登录';
      case 403:
        return '权限不足';
      case 404:
        return '请求的资源不存在';
      case 500:
        return '服务器内部错误';
      default:
        return error.message || '未知错误';
    }
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return '网络连接失败，请检查网络';
  }
  
  return '操作失败，请重试';
};
```

## 🔐 环境变量配置

### 创建环境变量文件
```bash
# .env.local
REACT_APP_AI_API_KEY=your_ai_api_key_here
REACT_APP_UPLOAD_API_URL=https://your-upload-api.com
REACT_APP_AUTH_API_URL=https://your-auth-api.com
REACT_APP_ANALYTICS_API_URL=https://your-analytics-api.com
```

### TypeScript类型声明
```typescript
// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_AI_API_KEY: string;
    readonly REACT_APP_UPLOAD_API_URL: string;
    readonly REACT_APP_AUTH_API_URL: string;
    readonly REACT_APP_ANALYTICS_API_URL: string;
  }
}
```

## 📱 使用示例

### 在组件中使用API服务
```typescript
// src/pages/Recognition/index.tsx
import { useState } from 'react';
import { aiService } from '@/services/aiRecognition';
import { fileService } from '@/services/fileUpload';

const RecognitionPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. 上传图片
      const uploadResult = await fileService.uploadImage(file);
      
      // 2. AI识别
      const recognitionResult = await aiService.recognizeClothing(file);
      
      setResult(recognitionResult);
    } catch (error) {
      console.error('处理失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {loading && <div>识别中...</div>}
      {result && <div>识别结果: {result.ethnicity}</div>}
    </div>
  );
};
```

## 🔍 调试和监控

### API调用日志
```typescript
// src/utils/apiLogger.ts
export const apiLogger = {
  logRequest: (url: string, options: RequestInit) => {
    console.log(`[API Request] ${options.method || 'GET'} ${url}`);
  },
  
  logResponse: (url: string, response: Response, duration: number) => {
    console.log(`[API Response] ${response.status} ${url} (${duration}ms)`);
  },
  
  logError: (url: string, error: any) => {
    console.error(`[API Error] ${url}:`, error);
  }
};
```

## ⚠️ 安全注意事项

1. **API密钥保护**: 不要在客户端代码中暴露敏感的API密钥
2. **输入验证**: 对用户输入进行严格的验证和清理
3. **HTTPS**: 所有API调用必须使用HTTPS协议
4. **错误信息**: 不要向用户暴露详细的错误信息
5. **请求限流**: 实现客户端请求限流机制

## 🚀 下一步计划

1. 选择合适的AI服务提供商
2. 设置后端API服务器
3. 实现用户认证系统
4. 添加数据统计功能
5. 配置CDN和图片优化

---
*最后更新: 2025年12月8日*
*技术负责人: 开发团队*