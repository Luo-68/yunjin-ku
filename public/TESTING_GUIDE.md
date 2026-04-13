# 测试指南

## 🎯 概述
本文档提供云矜裤项目的完整测试策略，包括单元测试、集成测试、E2E测试和性能测试的实施指南。

## 📋 测试环境设置

### 安装测试依赖
```bash
# 安装测试相关依赖
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @vitejs/plugin-react
npm install --save-dev jsdom
```

### 配置测试环境
创建 `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

创建测试设置文件 `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

更新 `package.json` 脚本:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

## 🧪 单元测试

### 组件测试示例

#### 测试布局组件
```typescript
// src/components/layout/__tests__/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';

describe('Navbar Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders navigation links', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('AI识别')).toBeInTheDocument();
    expect(screen.getByText('锦绣画廊')).toBeInTheDocument();
    expect(screen.getByText('共赏社区')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    renderWithRouter(<Navbar />);
    
    const homeLink = screen.getByText('首页');
    expect(homeLink).toHaveClass('text-gold-500');
  });
});
```

#### 测试工具函数
```typescript
// src/utils/__tests__/helpers.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from '../helpers';

describe('cn utility function', () => {
  it('merges classnames correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('handles conditional classes', () => {
    expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class');
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class');
  });

  it('removes duplicate classes', () => {
    expect(cn('text-red-500', 'text-red-500')).toBe('text-red-500');
  });
});
```

### Hook测试

#### 测试自定义Hook
```typescript
// src/hooks/__tests__/useAnimation.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAnimation } from '../useAnimation';

describe('useAnimation Hook', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useAnimation());
    
    expect(result.current.isAnimating).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('starts animation correctly', () => {
    const { result } = renderHook(() => useAnimation());
    
    act(() => {
      result.current.startAnimation();
    });
    
    expect(result.current.isAnimating).toBe(true);
  });

  it('completes animation after duration', async () => {
    const { result } = renderHook(() => useAnimation({ duration: 100 }));
    
    act(() => {
      result.current.startAnimation();
    });
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(result.current.isAnimating).toBe(false);
    expect(result.current.progress).toBe(1);
  });
});
```

## 🔗 集成测试

### API服务测试

#### 测试AI识别服务
```typescript
// src/services/__tests__/aiRecognition.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../aiRecognition';

// Mock fetch API
global.fetch = vi.fn();

describe('AI Recognition Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully recognizes clothing', async () => {
    const mockResponse = {
      ethnicity: '汉族',
      dynasty: '清朝',
      craftsmanship: ['刺绣', '织锦'],
      confidence: 0.95,
      description: '传统汉族服饰'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await aiService.recognizeClothing(file);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ethnic-clothing-recognize'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      })
    );
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    await expect(aiService.recognizeClothing(file))
      .rejects.toThrow('服饰识别失败，请重试');
  });
});
```

### 路由测试

#### 测试页面路由
```typescript
// src/__tests__/routing.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../App';

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
};

describe('App Routing', () => {
  it('renders home page on default route', () => {
    renderWithRouter('/');
    expect(screen.getByText('云矜裤')).toBeInTheDocument();
  });

  it('renders recognition page', () => {
    renderWithRouter('/recognition');
    expect(screen.getByText('AI智能识别')).toBeInTheDocument();
  });

  it('renders gallery page', () => {
    renderWithRouter('/gallery');
    expect(screen.getByText('锦绣画廊')).toBeInTheDocument();
  });

  it('redirects to home for unknown routes', () => {
    renderWithRouter('/unknown-route');
    expect(screen.getByText('云矜裤')).toBeInTheDocument();
  });
});
```

## 🎭 E2E测试

### 安装Playwright
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 创建E2E测试
```typescript
// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if main elements are present
    await expect(page.locator('h1')).toContainText('云矜裤');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('navigation should work', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Click on gallery link
    await page.click('text=锦绣画廊');
    await expect(page).toHaveURL('http://localhost:3000/gallery');
    
    // Verify gallery page content
    await expect(page.locator('h1')).toContainText('锦绣画廊');
  });

  test('AI recognition page functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/recognition');
    
    // Check if upload area is present
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Test file upload (when implemented)
    // await page.setInputFiles('input[type="file"]', 'test-image.jpg');
    // await expect(page.locator('.recognition-result')).toBeVisible();
  });
});
```

### 创建Playwright配置
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## ⚡ 性能测试

### 性能指标测试
```typescript
// src/__tests__/performance.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PerformanceObserver } from 'perf_hooks';

describe('Performance Tests', () => {
  it('measures component render time', async () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration}ms`);
        expect(entry.duration).toBeLessThan(100); // Should render in less than 100ms
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    performance.mark('render-start');
    const { container } = render(<YourComponent />);
    performance.mark('render-end');
    
    performance.measure('component-render', 'render-start', 'render-end');
  });
});
```

### 图片加载性能
```typescript
// src/__tests__/imagePerformance.test.ts
describe('Image Performance', () => {
  it('lazy loads images', async () => {
    const { container } = render(<GalleryPage />);
    
    // Check that images have loading="lazy" attribute
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  it('uses appropriate image sizes', () => {
    const { container } = render(<GalleryPage />);
    
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('srcset');
      expect(img).toHaveAttribute('sizes');
    });
  });
});
```

## 🔧 测试工具函数

### 常用测试工具
```typescript
// src/test/utils.tsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export const renderWithRouter = (component: React.ReactElement, initialRoute = '/') => {
  return render(
    <BrowserRouter initialEntries={[initialRoute]}>
      {component}
    </BrowserRouter>
  );
};

export const createMockFile = (name: string, size: number, type: string): File => {
  return new File(['test content'], name, { type, size });
};

export const waitForAnimation = async (duration = 300) => {
  await new Promise(resolve => setTimeout(resolve, duration));
};
```

## 📊 测试覆盖率

### 覆盖率配置
在 `vitest.config.ts` 中添加:
```typescript
export default defineConfig({
  test: {
    // ... other config
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  }
});
```

### 运行覆盖率测试
```bash
npm run test:coverage
```

## 🚀 CI/CD集成

### GitHub Actions配置
```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run build
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## 📋 测试检查清单

### 组件测试
- [ ] 组件是否正确渲染
- [ ] Props是否正确传递
- [ ] 事件处理是否正确
- [ ] 条件渲染逻辑
- [ ] 错误边界处理
- [ ] 加载状态处理

### 功能测试
- [ ] 路由导航
- [ ] 表单验证
- [ ] API调用
- [ ] 文件上传
- [ ] 用户认证
- [ ] 数据持久化

### 性能测试
- [ ] 组件渲染性能
- [ ] 图片加载优化
- [ ] 代码分割
- [ ] 缓存策略
- [ ] 内存泄漏

### 兼容性测试
- [ ] 不同浏览器(Chrome, Firefox, Safari, Edge)
- [ ] 不同设备(桌面, 平板, 手机)
- [ ] 不同分辨率
- [ ] 网络条件(慢网络, 离线)

### 可访问性测试
- [ ] 键盘导航
- [ ] 屏幕阅读器支持
- [ ] 颜色对比度
- [ ] 焦点管理
- [ ] ARIA标签

## 🔍 调试技巧

### 常见测试问题
1. **异步操作**: 使用 `waitFor` 处理异步更新
2. **定时器**: 使用 `vi.useFakeTimers()` 模拟定时器
3. **API调用**: 使用 `msw` (Mock Service Worker) 模拟API响应
4. **路由**: 使用 `MemoryRouter` 进行路由测试
5. **状态管理**: 提供必要的context和providers

### 调试工具
```bash
# 运行测试并查看UI
npm run test:ui

# 运行特定测试文件
npm test -- --run src/components/__tests__/Navbar.test.tsx

# 调试模式
npm test -- --run --reporter=verbose
```

---
*最后更新: 2025年12月8日*
*测试负责人: QA团队*