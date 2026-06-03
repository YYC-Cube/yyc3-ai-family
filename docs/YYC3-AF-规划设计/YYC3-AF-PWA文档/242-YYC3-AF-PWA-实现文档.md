---
@file: 242-YYC3-AF-PWA-实现文档.md
@description: YYC3-AF-PWA实现文档，包括PWA配置、Service Worker、Manifest、测试验证等。
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-18
@updated: 2026-02-18
@status: published
@tags: [PWA],[实现文档],[Service Worker],[Manifest],[测试验证]
---

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 242-YYC3-AF-PWA-实现文档

## 概述

本文档详细描述 YYC³(YanYuCloudCube)-AI-Family-PWA 的完整实现方案，包括 PWA 配置、Service Worker 实现、Manifest 配置、测试验证等。YYC³-AI-Family-PWA 不仅仅是一个软件系统，而是一个"智能生命体"。它以"五化一体"为法则，以插件化架构为骨骼，以 AI 能力为灵魂，构建一个能够自我进化、持续学习的智能协同平台。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景

YYC³(YanYuCloudCube)-AI-Family-PWA 本地一站式智能工作平台是一个**完全本地化、一体化、自进化**的智能工作生态系统。它以"五化一体"为法则，以 AI Family 为核心，以多机协同为骨架，以 NAS 存储为基石，构建一个能够学习、积累、生成、迭代的闭环智能平台。

#### 1.2 实现目标

- 实现 PWA 完整功能：离线支持、应用安装、推送通知
- 优化用户体验：快速加载、流畅交互、离线可用
- 提升应用性能：缓存策略、资源优化、懒加载
- 支持多平台：iOS、Android、桌面端

### 2. 实现方案

#### 2.1 技术栈

**前端框架：**
- React 18.3.1
- TypeScript 5.8.3
- Vite 6.3.5
- Tailwind CSS 4.1.12

**PWA 工具：**
- vite-plugin-pwa 1.2.0
- workbox-window 7.4.0
- Workbox 7.4.0

**构建工具：**
- Vite 6.3.5
- pnpm 10.28.2

#### 2.2 架构设计

**PWA 架构层次：**

```
┌─────────────────────────────────────────┐
│         应用层 (Application)          │
│  React Components + TypeScript       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Service Worker 层             │
│  sw.js + Workbox Runtime          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       缓存层 (Cache)               │
│  Cache API + IndexedDB            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       存储层 (Storage)             │
│  LocalStorage + SessionStorage      │
└─────────────────────────────────────┘
```

**Service Worker 生命周期：**

```
Install → Activated → Fetch → Update → Install
    ↓          ↓          ↓        ↓
  缓存资源    清理旧缓存  拦截请求  新版本
```

### 3. 核心实现

#### 3.1 Manifest 配置

**文件位置：** `/public/manifest.json`

**配置内容：**

```json
{
  "name": "YYC3 AI-Family",
  "short_name": "YYC3",
  "description": "Family AI - 人机协同 · 智爱同行。YYC3 AI-Family 是一个以赛博朋克美学为核心的 DevOps 智能平台。",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#0EA5E9",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "zh-CN",
  "dir": "ltr",
  "icons": [
    {
      "src": "pwa/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "pwa/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "pwa/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "pwa/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "pwa/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "pwa/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "pwa/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "pwa/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": [
    "productivity",
    "developer-tools",
    "utilities"
  ],
  "shortcuts": [
    {
      "name": "AI 对话",
      "short_name": "对话",
      "description": "快速打开 AI 对话界面",
      "url": "/",
      "icons": [
        {
          "src": "pwa/icon-192x192.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "系统设置",
      "short_name": "设置",
      "description": "快速打开系统设置",
      "url": "/?tab=settings",
      "icons": [
        {
          "src": "pwa/icon-192x192.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "集群监控",
      "short_name": "监控",
      "description": "快速打开集群监控",
      "url": "/?tab=cluster",
      "icons": [
        {
          "src": "pwa/icon-192x192.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "screenshots": [
    {
      "src": "screenshot-wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "YYC3 AI-Family 主界面"
    },
    {
      "src": "screenshot-narrow.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "YYC3 AI-Family 移动端界面"
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false,
  "edge_side_panel": {
    "preferred_width": 400
  },
  "launch_handler": {
    "client_mode": ["navigate-existing", "auto"]
  }
}
```

**配置说明：**

| 字段 | 值 | 说明 |
|------|-----|------|
| name | YYC3 AI-Family | 应用完整名称 |
| short_name | YYC3 | 应用短名称（用于桌面图标） |
| description | Family AI - 人机协同 · 智爱同行 | 应用描述 |
| start_url | / | 应用启动 URL |
| display | standalone | 显示模式（standalone、fullscreen、minimal-ui） |
| background_color | #0F172A | 背景色（深空色） |
| theme_color | #0EA5E9 | 主题色（科技蓝） |
| orientation | portrait-primary | 屏幕方向 |
| scope | / | 应用作用域 |
| icons | 8 种尺寸 | 应用图标（72x72 ~ 512x512） |
| shortcuts | 3 个快捷方式 | AI 对话、系统设置、集群监控 |
| categories | 3 个分类 | productivity、developer-tools、utilities |

#### 3.2 Service Worker 实现

**文件位置：** `/public/sw.js`

**核心代码：**

```javascript
const CACHE_NAME = 'yyc3-ai-family-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa/icon-72x72.png',
  '/pwa/icon-96x96.png',
  '/pwa/icon-128x128.png',
  '/pwa/icon-144x144.png',
  '/pwa/icon-152x152.png',
  '/pwa/icon-192x192.png',
  '/pwa/icon-384x384.png',
  '/pwa/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

**功能说明：**

| 事件 | 功能 | 说明 |
|------|------|------|
| install | 安装 Service Worker | 缓存静态资源 |
| activate | 激活 Service Worker | 清理旧缓存 |
| fetch | 拦截网络请求 | 返回缓存或网络请求 |
| message | 接收消息 | 跳过等待，立即激活 |

**缓存策略：**

- **Cache First**：优先使用缓存，缓存不存在时从网络获取
- **Network First**：优先从网络获取，网络失败时使用缓存
- **Stale While Revalidate**：返回缓存，同时在后台更新缓存

#### 3.3 Vite PWA 插件配置

**文件位置：** `/vite.config.ts`

**配置代码：**

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa/icon-*.png'],
      manifest: {
        name: 'YYC3 AI-Family',
        short_name: 'YYC3',
        description: 'Family AI - 人机协同 · 智爱同行。YYC3 AI-Family 是一个以赛博朋克美学为核心的 DevOps 智能平台。',
        theme_color: '#0EA5E9',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'AI 对话',
            short_name: '对话',
            description: '快速打开 AI 对话界面',
            url: '/',
            icons: [{ src: 'pwa/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: '系统设置',
            short_name: '设置',
            description: '快速打开系统设置',
            url: '/?tab=settings',
            icons: [{ src: 'pwa/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: '集群监控',
            short_name: '监控',
            description: '快速打开集群监控',
            url: '/?tab=cluster',
            icons: [{ src: 'pwa/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
```

**配置说明：**

| 配置项 | 值 | 说明 |
|--------|-----|------|
| registerType | autoUpdate | 自动更新 Service Worker |
| includeAssets | favicon.svg, pwa/icon-*.png | 包含的静态资源 |
| manifest | 应用清单配置 | Manifest 配置 |
| workbox | Workbox 配置 | 缓存策略配置 |

#### 3.4 HTML PWA 标签

**文件位置：** `/index.html`

**添加的标签：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Family AI π³ - Cyberpunk DevOps Intelligence Platform" />
    <meta name="theme-color" content="#0EA5E9" />
    <title>Family AI π³</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    
    <!-- PWA 标签 -->
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/pwa/icon-192x192.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="YYC3" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="application-name" content="YYC3 AI-Family" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    
    <!-- Service Worker 注册脚本 -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
              console.log('Service Worker registration failed:', error);
            });
        });
      }
    </script>
  </body>
</html>
```

**标签说明：**

| 标签 | 说明 |
|------|------|
| `<link rel="manifest">` | 链接到 Manifest 文件 |
| `<link rel="apple-touch-icon">` | Apple 设备图标 |
| `<meta name="apple-mobile-web-app-capable">` | 启用全屏模式 |
| `<meta name="apple-mobile-web-app-status-bar-style">` | 状态栏样式 |
| `<meta name="apple-mobile-web-app-title">` | 应用标题 |
| `<meta name="mobile-web-app-capable">` | 启用移动端 Web 应用 |
| `<meta name="application-name">` | 应用名称 |

### 4. PWA 图标

#### 4.1 图标规格

**图标目录：** `/public/pwa/`

**图标列表：**

| 图标 | 尺寸 | 用途 | 设备 |
|------|------|------|------|
| icon-72x72.png | 72x72 | iOS 6+ | iPhone 4/4S/5/5S |
| icon-96x96.png | 96x96 | Android 低分辨率 | 低分辨率 Android |
| icon-128x128.png | 128x128 | Android 中等分辨率 | 中等分辨率 Android |
| icon-144x144.png | 144x144 | iOS 7+ | iPhone 6/6S/7/8 |
| icon-152x152.png | 152x152 | iOS 8-10 | iPhone 6+/6S+/7+/8+ |
| icon-192x192.png | 192x192 | PWA 主图标 | Android 高分辨率 |
| icon-384x384.png | 384x384 | Android 超高分辨率 | 超高分辨率 Android |
| icon-512x512.png | 512x512 | iOS 11+、应用商店 | iPhone X/XS/11/12/13/14/15 |

#### 4.2 图标生成

**使用 ImageMagick 生成图标：**

```bash
# 安装 ImageMagick
brew install imagemagick

# 生成 72x72 图标
convert /Users/yanyu/Family-π³/public/yyc3-logo-royalblue.png \
  -resize 72x72 \
  /Users/yanyu/Family-π³/public/pwa/icon-72x72.png

# 生成 96x96 图标
convert /Users/yanyu/Family-π³/public/yyc3-logo-royalblue.png \
  -resize 96x96 \
  /Users/yanyu/Family-π³/public/pwa/icon-96x96.png

# 生成 128x128 图标
convert /Users/yanyu/Family-π³/public/yyc3-logo-royalblue.png \
  -resize 128x128 \
  /Users/yanyu/Family-π³/public/pwa/icon-128x128.png

# 生成 144x144 图标
convert /Users/yanyu/Family-π³/public/yyc3-logo-royalblue.png \
  -resize 144x144 \
  /Users/yanyu/Family-π³/public/pwa/icon-144x144.png

# 生成 152x152 图标
convert /Users/yanyu/Family-π³/public/yyc3-logo-royalblue.png \
  -resize 152x152 \
  /Users/yanyu/Family-π³/public/pwa/icon-152x152.png

# 生成 192x192 图标
convert /Users/yanyu/Family-π³/public/yyc3-logo-royalblue.png \
  -resize 192x192 \
  /Users/yanyu/Family-π³/public/pwa/icon-192x192.png

# 生成 384x384 图标
convert /Users/yanyu/Family-π³/public/yyc3-logo-royalblue.png \
  -resize 384x384 \
  /Users/yanyu/Family-π³/public/pwa/icon-384x384.png

# 生成 512x512 图标
convert /Users/yanyu/Family-π³/public/yyc3-logo-royalblue.png \
  -resize 512x512 \
  /Users/yanyu/Family-π³/public/pwa/icon-512x512.png
```

**使用 Sharp 生成图标：**

```bash
# 安装 Sharp
pnpm add -D sharp

# 创建脚本
cat > create-icons.js << 'EOF'
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const input = '/Users/yanyu/Family-π³/public/yyc3-logo-royalblue.png';
const outputDir = '/Users/yanyu/Family-π³/public/pwa/';

sizes.forEach(size => {
  sharp(input)
    .resize(size, size)
    .toFile(`${outputDir}icon-${size}x${size}.png`)
    .then(() => console.log(`${size}x${size} icon created`))
    .catch(err => console.error(`Error creating ${size}x${size} icon:`, err));
});
EOF

# 运行脚本
node create-icons.js

# 清理
rm create-icons.js
```

### 5. 测试验证

#### 5.1 本地测试

**启动开发服务器：**

```bash
pnpm run dev
```

**访问应用：**

- 本地：http://localhost:3113/
- 网络：http://192.168.3.33:3113/

#### 5.2 Service Worker 检查

**Chrome/Edge:**

1. 打开开发者工具（F12）
2. 切换到 "Application" 标签
3. 左侧菜单找到 "Service Workers"
4. 检查 Service Worker 是否已注册
5. 查看状态（running、activated、waiting）

**Safari:**

1. 打开开发者工具（Option + Command + I）
2. 切换到 "Service Workers" 标签
3. 检查 Service Worker 是否已注册

#### 5.3 Manifest 检查

**Chrome/Edge:**

1. 打开开发者工具（F12）
2. 切换到 "Application" 标签
3. 左侧菜单找到 "Manifest"
4. 查看应用清单信息
5. 检查图标是否正确加载

#### 5.4 PWA 安装测试

**Chrome/Edge 安装：**

1. 访问 http://localhost:3113/
2. 地址栏右侧会显示安装图标（+ 或下载图标）
3. 点击安装图标
4. 确认安装
5. 应用会以独立窗口打开
6. 检查应用图标和标题

**Safari 安装：**

1. 访问 http://localhost:3113/
2. 点击分享按钮（方框带向上箭头）
3. 选择 "添加到主屏幕"
4. 确认添加
5. 在主屏幕找到应用图标
6. 点击打开应用

#### 5.5 离线功能测试

**测试离线缓存：**

1. 访问 http://localhost:3113/
2. 等待 Service Worker 完成缓存
3. 打开开发者工具 → Network 标签
4. 选择 "Offline" 模式
5. 刷新页面
6. 检查应用是否正常显示

**测试离线功能：**

1. 在离线模式下
2. 尝试浏览应用
3. 检查静态资源是否加载
4. 检查应用功能是否可用

#### 5.6 Lighthouse 测试

**运行 Lighthouse 审计：**

1. 打开 Chrome DevTools
2. 点击 "Lighthouse" 标签
3. 选择 "Progressive Web App"
4. 点击 "Analyze page load"
5. 等待审计完成
6. 查看得分（目标：90+）

**Lighthouse 检查项：**

- **PWA Optimized**：应用是否符合 PWA 标准
- **Installable**：应用是否可安装
- **Offline Support**：是否支持离线
- **HTTPS**：是否使用 HTTPS（生产环境）
- **Service Worker**：Service Worker 是否正确配置
- **Manifest**：Manifest 是否正确配置
- **Icons**：图标是否正确配置
- **Theme Color**：主题色是否配置
- **Display Mode**：显示模式是否配置

### 6. 部署方案

#### 6.1 GitHub Pages 部署

**构建生产版本：**

```bash
pnpm run build
```

**提交到 GitHub：**

```bash
git add .
git commit -m "Add PWA support"
git push origin main
```

**自动部署：**

GitHub Actions 会自动部署到 GitHub Pages

**访问应用：**

https://your-username.github.io/yyc3-ai-family/

#### 6.2 Vercel 部署

**安装 Vercel CLI：**

```bash
pnpm add -g vercel
```

**部署：**

```bash
vercel --prod
```

**访问应用：**

https://your-app.vercel.app/

#### 6.3 Netlify 部署

**安装 Netlify CLI：**

```bash
pnpm add -g netlify-cli
```

**部署：**

```bash
netlify deploy --prod
```

**访问应用：**

https://your-app.netlify.app/

### 7. 性能优化

#### 7.1 缓存策略优化

**静态资源缓存：**

```javascript
{
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'images',
    expiration: {
      maxEntries: 60,
      maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
    }
  }
}
```

**API 请求缓存：**

```javascript
{
  urlPattern: /^https:\/\/api\.example\.com\/.*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api',
    networkTimeoutSeconds: 10,
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 5 * 60 // 5 minutes
    }
  }
}
```

**字体缓存：**

```javascript
{
  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'google-fonts',
    expiration: {
      maxEntries: 10,
      maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
    }
  }
}
```

#### 7.2 性能监控

**Lighthouse 得分：**

- **Performance**: 目标 90+
- **Accessibility**: 目标 90+
- **Best Practices**: 目标 90+
- **SEO**: 目标 90+
- **PWA**: 目标 100

**Web Vitals：**

- **LCP (Largest Contentful Paint)**: 目标 < 2.5s
- **FID (First Input Delay)**: 目标 < 100ms
- **CLS (Cumulative Layout Shift)**: 目标 < 0.1

### 8. 故障排除

#### 8.1 Service Worker 未注册

**问题：** Service Worker 未注册或状态为 error

**解决方案：**

1. 检查浏览器是否支持 Service Worker
2. 检查 sw.js 文件是否存在
3. 检查 Service Worker 代码是否有语法错误
4. 清除浏览器缓存并刷新
5. 检查控制台是否有错误信息

#### 8.2 Manifest 未加载

**问题：** Manifest 未加载或图标不显示

**解决方案：**

1. 检查 manifest.json 文件是否存在
2. 检查 manifest.json 路径是否正确
3. 检查 manifest.json 语法是否正确
4. 检查图标文件是否存在
5. 清除浏览器缓存并刷新

#### 8.3 离线功能不工作

**问题：** 离线模式下应用无法访问

**解决方案：**

1. 检查 Service Worker 是否已激活
2. 检查缓存列表是否包含所需资源
3. 检查 Fetch 事件处理是否正确
4. 清除缓存并重新注册 Service Worker
5. 检查网络请求是否被正确拦截

#### 8.4 PWA 无法安装

**问题：** 浏览器不显示安装提示

**解决方案：**

1. 检查是否使用 HTTPS（生产环境）
2. 检查 manifest.json 是否正确配置
3. 检查 Service Worker 是否已注册
4. 检查是否满足 PWA 安装条件
5. 尝试手动触发安装（Chrome DevTools）

### 9. 后续计划

#### 9.1 短期计划

- 完成 Lighthouse 审计，确保 PWA 得分达到 90+
- 部署到生产环境（GitHub Pages）
- 邀请用户测试离线功能和安装体验

#### 9.2 中期计划

- 优化缓存策略，提升性能
- 添加推送通知功能
- 实现后台同步功能

#### 9.3 长期计划

- 构建完整的 PWA 生态系统
- 持续技术创新
- 拓展业务场景

## 附录

### A. 参考文档

- [PWA 规范](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite PWA 插件](https://vite-plugin-pwa.netlify.app/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)

### B. 术语表

- **PWA**：Progressive Web App，渐进式 Web 应用
- **Service Worker**：服务工作线程，提供离线支持
- **Manifest**：应用清单，定义应用元数据
- **Cache API**：缓存接口，用于存储网络响应
- **Lighthouse**：Google 开发的 Web 应用审计工具

### C. 文件清单

| 文件 | 位置 | 说明 |
|------|------|------|
| manifest.json | /public/manifest.json | PWA 应用清单 |
| sw.js | /public/sw.js | Service Worker |
| index.html | /index.html | PWA 标签 |
| vite.config.ts | /vite.config.ts | Vite PWA 插件 |
| PWA 图标 | /public/pwa/ | PWA 图标目录 |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
