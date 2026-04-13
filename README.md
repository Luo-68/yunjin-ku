已部署阿里云，可通过http://47.110.125.139/网站进行使用
1.  **AI 智能识别 (Smart Recognition)**
    *   上传服饰图片，AI 自动分析民族归属、历史时期及工艺特点。
    *   提供详细的文化解读和知识图谱关联。
    *   模拟颗粒流体扫描动效，营造"唤醒"的仪式感。

2.  **锦绣画廊 (Heritage Gallery)**
    *   沉浸式瀑布流展示 56 个民族的精美服饰。
    *   支持按民族、朝代、工艺多维度筛选。
    *   深色模式下的高级感视觉体验，突出服饰质感。

3.  **共赏社区 (Cultural Community)**
    *   类 TikTok/抖音 的竖屏沉浸式浏览体验。
    *   用户分享、点赞、评论，构建活跃的文化交流圈。
    *   连接传统与现代设计，激发年轻一代的创造设计风格 (Design Style)

*   **视觉调性**: 现代科技 (Modern Tech) + 东方美学 (Oriental Aesthetics)
*   **配色方案**: 墨 (Ink Black) + 金 (Luxury Gold) + 留白 (Negative Space)
*   **动画效果**:
    *   使用 GSAP 实现流畅的滚动视差和元素入场动画。
    *   Active Theory 风格的颗粒/流体动效。
    *   电影级的 Hero 视频背景。

##  技术栈 (Tech Stack)

*   **Framework**: React 19 + Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Animation**: GSAP (GreenSock Animation Platform)
*   **Icons**: Lucide React
*   **Routing**: React Router DOM

##  快速开始 (Quick Start)

### 一键启动（推荐）

**Windows系统：**
双击运行项目根目录下的 `start.bat` 文件即可一键启动前后端服务。

**命令行启动：**
```bash
# 仅启动前端
npm run dev

# 启动前端和后端
npm run start:all
```

### 手动启动

```bash
# Install dependencies
npm install

# Install backend dependencies (if backend exists)
cd backend
npm install
cd ..

# Run development server
npm run dev

# Build for production
npm run build
```

### 访问地址
- 前端：http://localhost:3000
- 后端：http://localhost:3001

详细启动说明请查看 [START_GUIDE.md](./START_GUIDE.md)

响应式支持
项目完全适配桌面端、平板及移动端设备，确保在任何屏幕尺寸下都能提供最佳的视觉体验。

© 2026 Yun Jin Ku. All rights reserved.


---

## 完成！所有文件已发送

以上就是**云矜裤 (Yun Jin Ku)** 项目的全部源代码！

###  文件清单汇总

✅ **配置文件 (7个)**
- `package.json`
- `index.html`
- `tailwind.config.ts`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `postcss.config.js`

✅ **核心文件 (3个)**
- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`

✅ **布局组件 (3个)**
- `src/layouts/RootLayout.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`

✅ **功能组件 (1个)**
- `src/components/ParticleCanvas.tsx`

✅ **页面组件 (5个)**
- `src/pages/Home/index.tsx`
- `src/pages/Recognition/index.tsx`
- `src/pages/Gallery/index.tsx`
- `src/pages/Share/index.tsx`
- `src/pages/About/index.tsx`

✅ **文档 (1个)**
- `README.md`

---

###  部署步骤

1. **创建项目文件夹并复制所有代码**
2. **安装依赖**：
   ```bash
   pnpm install
启动开发服务器：
pnpm dev
访问 http://localhost:3000
