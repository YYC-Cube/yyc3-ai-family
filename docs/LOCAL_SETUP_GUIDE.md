# YYC3 Hacker Chatbot -- 本地化部署完整指南

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future**
> *万象归元于云枢 | 深栈智启新纪元*
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**

---

> **版本**: Phase 28 | **日期**: 2026-02-16
> **适用环境**: macOS (Apple Silicon) / Linux / Windows WSL2
> **运行时**: Node.js 20+ | pnpm 9+ | Vite 6 | React 18 | Tailwind CSS v4

---

## 目录

1. [环境准备](#1-环境准备)
2. [项目文件导出与结构](#2-项目文件导出与结构)
3. [依赖安装与验证](#3-依赖安装与验证)
4. [缺失文件补全](#4-缺失文件补全)
5. [TypeScript 配置](#5-typescript-配置)
6. [本地开发服务器启动](#6-本地开发服务器启动)
7. [LLM Provider 配置与实测](#7-llm-provider-配置与实测)
8. [本地 NAS 连接配置](#8-本地-nas-连接配置)
9. [Ollama 本地模型对接](#9-ollama-本地模型对接)
10. [测试体系运行](#10-测试体系运行)
11. [生产构建与 NAS 部署](#11-生产构建与-nas-部署)
12. [可选: Express 后端微服务](#12-可选-express-后端微服务)
13. [常见问题排查](#13-常见问题排查)
14. [文件清单与架构概览](#14-文件清单与架构概览)

---

## 1. 环境准备

### 1.1 必需工具

```bash
# Node.js 20+ (推荐 LTS)
node --version   # 需要 >= 20.0.0

# pnpm (推荐 9.x, 项目使用 pnpm lockfile)
npm install -g pnpm@latest
pnpm --version   # 需要 >= 9.0.0

# Git
git --version
```

### 1.2 推荐工具

```bash
# VS Code + 推荐扩展
code --install-extension bradlc.vscode-tailwindcss      # Tailwind CSS IntelliSense
code --install-extension dbaeumer.vscode-eslint          # ESLint
code --install-extension esbenp.prettier-vscode          # Prettier
code --install-extension vitest.explorer                 # Vitest Explorer (测试面板)
code --install-extension ms-vscode.vscode-typescript-next # TypeScript Nightly
```

### 1.3 网络要求

| 服务 | 用途 | 是否必需 |
|------|------|---------|
| Google Fonts CDN | Inter / Fira Code / JetBrains Mono 字体 | 推荐 (离线可降级) |
| LLM API 端点 | OpenAI / Anthropic / DeepSeek / Z.AI 等 | AI模式必需 |
| 本地 NAS (192.168.x.x) | 数据持久化 / Docker 管理 | 可选 (自动降级 localStorage) |
| Ollama (localhost:11434) | 本地 LLM 推理 | 可选 |

---

## 2. 项目文件导出与结构

### 2.1 从 Figma Make 导出

在 Figma Make 编辑器中:

1. 点击右上角 **Export** 或 **Download Code**
2. 选择 **Download as ZIP**
3. 解压到本地目录

```bash
mkdir -p ~/projects/yyc3-hacker-chatbot
cd ~/projects/yyc3-hacker-chatbot
# 将 ZIP 解压到此处
unzip ~/Downloads/yyc3-export.zip -d .
```

### 2.2 初始化 Git

```bash
git init
git add .
git commit -m "Phase 28: Initial local import from Figma Make"
```

### 2.3 项目目录结构

```
yyc3-hacker-chatbot/
├── docs/                          # 设计文档 + 执行摘要
│   ├── LOCAL_SETUP_GUIDE.md       # ← 本文件
│   ├── execution_summary_v16.md   # Phase 28 交付摘要
│   └── ...                        # 其他阶段文档
├── src/
│   ├── app/
│   │   ├── App.tsx                # 主入口 (三联式布局 + 路由)
│   │   └── components/
│   │       ├── chat/              # 聊天区: ChatArea, MessageBubble, ArtifactsPanel
│   │       ├── console/           # 控制台 21 个标签页
│   │       ├── layout/            # Sidebar 侧边栏
│   │       ├── monitoring/        # 健康监控
│   │       ├── search/            # 全局搜索面板
│   │       ├── settings/          # 设置模态框
│   │       ├── views/             # 主视图 (Projects, Artifacts, Services 等)
│   │       ├── ui/                # shadcn/Radix UI 基础组件
│   │       └── figma/             # Figma 导入组件
│   ├── lib/
│   │   ├── store.ts               # Zustand 全局状态 (单一数据源)
│   │   ├── types.ts               # TypeScript 类型定义
│   │   ├── llm-bridge.ts          # LLM 统一桥接 (1048行, 7 Provider)
│   │   ├── llm-providers.ts       # Provider 注册表
│   │   ├── llm-router.ts          # 智能路由 + 熔断器
│   │   ├── mcp-protocol.ts        # MCP 协议层 (1326行)
│   │   ├── agent-orchestrator.ts  # Agent 编排引擎 (1427行)
│   │   ├── persistence-engine.ts  # 持久化引擎 (830行)
│   │   ├── persistence-binding.ts # 持久化 ↔ Zustand 绑定
│   │   ├── persist-schemas.ts     # Zod v4 验证 Schema
│   │   ├── event-bus.ts           # 事件总线
│   │   ├── nas-client.ts          # NAS/集群 HTTP 客户端
│   │   ├── i18n.tsx               # 国际化 (中/英)
│   │   ├── crypto.ts              # 加密工具
│   │   └── __tests__/             # Vitest 测试
│   │       ├── setup.ts
│   │       ├── persist-schemas.test.ts
│   │       └── core-test-suite.ts # In-app 测试框架 (160+ 测试)
│   ├── server/                    # Express 后端 (可选独立部署)
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── ws.ts
│   ├── styles/
│   │   ├── index.css              # 样式入口
│   │   ├── tailwind.css           # Tailwind v4 配置
│   │   ├── theme.css              # 设计系统 Token
│   │   └── fonts.css              # 字体导入
│   └── types/
│       └── global.d.ts            # 全局类型声明 (Web Speech API 等)
├── package.json
├── vite.config.ts                 # Vite 6 配置
├── vitest.config.ts               # Vitest 测试配置
├── postcss.config.mjs             # PostCSS (Tailwind v4 自动)
└── guidelines/                    # 开发指引
```

---

## 3. 依赖安装与验证

### 3.1 修改 package.json

Figma Make 的 `package.json` 将 React 列为 `peerDependencies`，本地需要移动到 `dependencies`:

```bash
cd ~/projects/yyc3-hacker-chatbot
```

编辑 `package.json`，进行以下修改:

```jsonc
{
  "name": "yyc3-hacker-chatbot",  // ← 改名
  "private": true,
  "version": "0.28.0",             // ← 更新版本
  "type": "module",
  "scripts": {
    "dev": "vite",                  // ← 新增
    "build": "vite build",
    "preview": "vite preview",      // ← 新增
    "test": "vitest run",           // ← 新增
    "test:watch": "vitest",         // ← 新增
    "test:coverage": "vitest run --coverage",  // ← 新增
    "type-check": "tsc --noEmit",   // ← 新增
    "lint": "eslint src/ --ext .ts,.tsx"       // ← 新增(可选)
  },
  "dependencies": {
    // ... 保留现有 dependencies 不变 ...
    "react": "^18.3.1",             // ← 从 peerDependencies 移入
    "react-dom": "^18.3.1"          // ← 从 peerDependencies 移入
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@types/react": "^18.3.12",     // ← 新增
    "@types/react-dom": "^18.3.1",  // ← 新增
    "@types/react-syntax-highlighter": "^15.5.13", // ← 新增
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "typescript": "^5.6.0",         // ← 新增
    "vite": "6.3.5",
    "vitest": "^3.2.0",             // ← 新增
    "@vitest/coverage-v8": "^3.2.0",  // ← 新增(可选)
    "jsdom": "^26.1.0"              // ← 新增 (Vitest jsdom 环境)
  }
  // ← 删除 peerDependencies 和 peerDependenciesMeta 部分
  // ← 保留 pnpm.overrides 部分
}
```

### 3.2 删除旧 lockfile 并重装

```bash
# 删除 Figma Make 生成的 lockfile (如果有)
rm -f pnpm-lock.yaml

# 安装所有依赖
pnpm install

# 验证安装
pnpm ls react react-dom zustand zod vite vitest
```

### 3.3 验证关键包版本

```bash
# 应输出:
#   react@18.3.x
#   zustand@5.0.x
#   zod@4.3.x
#   vite@6.3.x
#   tailwindcss@4.1.x

pnpm ls --depth 0 | grep -E "react|zustand|zod|vite|tailwindcss"
```

---

## 4. 缺失文件补全

Figma Make 环境不导出某些标准文件，需要手动创建:

### 4.1 创建 `tsconfig.json`

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client", "vitest/globals"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.d.ts",
    "vite.config.ts",
    "vitest.config.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### 4.2 创建 `index.html` (Vite 入口)

```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="YYC3 Hacker Chatbot - Cyberpunk DevOps Intelligence Platform" />
    <title>YYC3 Hacker Chatbot</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="dark">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
```

### 4.3 创建 `src/main.tsx` (React 挂载点)

```bash
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import '@/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
```

### 4.4 创建 `src/vite-env.d.ts`

```bash
cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />
EOF
```

### 4.5 创建 `public/favicon.svg` (可选)

```bash
mkdir -p public
cat > public/favicon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0EA5E9"/>
  <text x="16" y="24" text-anchor="middle" fill="white" font-size="20" font-family="monospace" font-weight="bold">Y3</text>
</svg>
EOF
```

### 4.6 创建 `.gitignore`

```bash
cat > .gitignore << 'EOF'
node_modules/
dist/
.vite/
*.local
.env
.env.local
.env.*.local
coverage/
*.tsbuildinfo
.DS_Store
EOF
```

---

## 5. TypeScript 配置

### 5.1 验证类型检查通过

```bash
pnpm type-check
# 或
npx tsc --noEmit
```

### 5.2 常见类型错误修复

**问题 1: `figma:asset` 虚拟模块报错**

如果项目中有 `import img from "figma:asset/xxx.png"` 这类导入，需要添加声明:

```typescript
// src/types/figma-asset.d.ts
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}
```

> 注意: 如果你不使用 Figma 导入的图片资源，可以直接替换为本地 `/public` 目录下的图片。

**问题 2: `@types/react-syntax-highlighter` 缺失**

```bash
pnpm add -D @types/react-syntax-highlighter
```

**问题 3: 第三方库缺少类型**

```bash
# 按需安装
pnpm add -D @types/react-slick @types/react-responsive-masonry
```

---

## 6. 本地开发服务器启动

### 6.1 启动 Vite Dev Server

```bash
pnpm dev
# 或
npx vite

# 默认输出:
#   VITE v6.3.5  ready in 800 ms
#
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: http://192.168.x.x:5173/
```

### 6.2 访问验证

打开浏览器访问 `http://localhost:5173/`，应看到:

1. **深色背景** + 宝石蓝(`#0EA5E9`)边线的赛博朋克界面
2. **左侧栏**: 导航图标 (Terminal/Console/Projects/Artifacts/Monitor等)
3. **中央区域**: 聊天区 (Neural Link 输入框)
4. **右侧**: 可推拉的 Artifacts 面板

### 6.3 快速功能验证

| 操作 | 预期结果 |
|------|---------|
| 点击左侧 Console 图标 | 进入控制台，看到 21 个标签页 |
| 按 `Ctrl+K` / `Cmd+K` | 弹出全局搜索面板 |
| 按 `Ctrl+M` | 切换 导航模式 ↔ AI模式 |
| 输入 "打开仪表盘" (导航模式) | 自动跳转到 Dashboard 标签页 |
| 输入 "流式诊断" (导航模式) | 跳转到 Stream Diagnostics 标签页 |
| Console → 测试框架 | 看到 Framework Tests + Core Logic Tests 双面板 |
| Console → 流式诊断 | 看到 Provider Health + E2E Stream Test 面板 |

---

## 7. LLM Provider 配置与实测

### 7.1 进入设置

1. 点击左侧栏底部 **齿轮图标** → Settings Modal
2. 或在聊天框输入 "设置" / "settings" (导航模式)
3. 切换到 **AI 模型** 标签页

### 7.2 配置 Provider

在 Settings > AI Models 中，为至少一个 Provider 配置 API Key:

| Provider | 端点 | API Key 获取 |
|----------|------|-------------|
| **OpenAI** | `https://api.openai.com/v1` | [platform.openai.com](https://platform.openai.com/api-keys) |
| **Anthropic** | `https://api.anthropic.com` | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| **DeepSeek** | `https://api.deepseek.com/v1` | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| **智谱 Z.AI** | `https://open.bigmodel.cn/api/paas/v4` | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta` | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Groq** | `https://api.groq.com/openai/v1` | [console.groq.com](https://console.groq.com/keys) |
| **Ollama (本地)** | `http://localhost:11434` | 无需 Key (见第 9 节) |

### 7.3 API Key 存储位置

API Key 存储在 **浏览器 localStorage** 中:

```
localStorage key: yyc3_llm_configs
格式: JSON 数组 [{providerId, apiKey, enabled, defaultModel, endpoint}, ...]
```

> **安全提示**: API Key 仅存储在你的浏览器本地，不会发送到任何第三方服务器。
> 项目的 LLM 请求直接从浏览器发出到 Provider API。
> 如需更高安全性，请使用 CORS 代理或后端中转 (见第 12 节)。

### 7.4 E2E 流式输出实测

1. 进入 Console → **流式诊断** (Stream Diagnostics)
2. 点击 **Check All Providers** → 验证 Provider 连通性
3. 选择测试 Prompt:
   - `Ping (Simple)` — 最快验证连通性
   - `Count (Medium)` — 测试流式逐 token 输出
   - `Code Gen (Complex)` — 测试长文本生成 + 代码质量
4. 点击 **Run Stream Test**
5. 观察:
   - Token 实时流入预览区
   - First Token Time (TTFT) — 首 token 延迟
   - Throughput — token/秒吞吐率
   - Provider + Model 信息

### 7.5 在 ChatArea 中实测

1. 按 `Ctrl+M` 切换到 **AI 模式** (输入框提示文字会变化)
2. 输入任意消息，如 "解释 React 的 useEffect Hook"
3. 观察:
   - 消息气泡出现，流式文字逐步填充
   - 底部状态栏显示当前 Provider / Model
   - 完成后 Token 用量记录到 LLM 用量面板

### 7.6 CORS 问题处理

浏览器直连 API 可能遇到 CORS 限制。解决方案:

**方案 A: 使用支持 CORS 的 Provider (推荐)**

- OpenAI、Groq、DeepSeek 等大部分 Provider 的 API 已支持浏览器直连
- 智谱 Z.AI 需要配置 CORS 代理

**方案 B: 本地 CORS 代理**

```bash
# 安装简易代理
npx local-cors-proxy --proxyUrl https://api.openai.com --port 8010

# 在 Settings 中设置端点为:
# http://localhost:8010/proxy/v1
```

**方案 C: Vite Dev Server 代理**

编辑 `vite.config.ts`:

```typescript
export default defineConfig({
  // ... 现有配置 ...
  server: {
    proxy: {
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, ''),
      },
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
    },
  },
});
```

然后在 Settings 中将端点设为 `/api/openai/v1`。

---

## 8. 本地 NAS 连接配置

### 8.1 NAS 架构

项目设计为前端直连本地 NAS HTTP API，无需中间服务器:

```
浏览器 (localhost:5173)
   │
   ├── HTTP → NAS (192.168.x.x:5000) — SQLite 数据持久化
   ├── HTTP → NAS Docker API (192.168.x.x:2375) — 容器管理
   └── WS   → NAS WebSocket — 实时心跳/日志
```

### 8.2 设备配置

1. 进入 Console → **Dashboard** (总控台)
2. 点击 **设备管理** 区域的设备卡片
3. 编辑设备 IP / 主机名 / 端口

或在 Console → **NAS 部署** (NAS Deployment) 中配置:

- NAS IP 地址
- SQLite API 端口
- Docker API 端口
- SSH 端口 (用于远程部署)

### 8.3 持久化层降级策略

```
┌──────────────────────────────────────┐
│ PersistenceEngine                     │
│                                       │
│  NAS Online?                          │
│    ├── YES → NasSQLiteAdapter         │
│    │         (双写 NAS + localStorage)│
│    └── NO  → LocalStorageAdapter      │
│              (自动降级, 队列等待同步)   │
└──────────────────────────────────────┘
```

如果没有 NAS，系统自动使用 `localStorage`，所有功能正常运行。

### 8.4 NAS SQLite 端点要求

如果你有铁威马 / 群晖 / QNAP NAS，需要在 NAS 上部署一个轻量 HTTP API 供前端查询 SQLite:

```bash
# NAS 上部署 (Docker 方式)
docker run -d \
  --name yyc3-sqlite-api \
  -p 5000:5000 \
  -v /path/to/yyc3.db:/data/yyc3.db \
  your-sqlite-http-image

# API 格式:
# POST /api/query { sql: "SELECT * FROM ...", params: [] }
# 返回: { rows: [...], columns: [...] }
```

---

## 9. Ollama 本地模型对接

### 9.1 安装 Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# 启动服务
ollama serve
# 默认监听: http://localhost:11434
```

### 9.2 拉取模型

```bash
# 推荐模型
ollama pull llama3.2            # 3B, 轻量快速
ollama pull qwen2.5:7b          # 7B, 中文优化
ollama pull deepseek-r1:8b      # 8B, 推理增强
ollama pull codellama:13b       # 13B, 代码专用

# 验证
ollama list
```

### 9.3 配置 Ollama CORS

Ollama 默认不允许浏览器跨域请求，需要设置环境变量:

```bash
# macOS / Linux
export OLLAMA_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
ollama serve

# 或永久配置 (macOS)
launchctl setenv OLLAMA_ORIGINS "http://localhost:5173"

# 或 systemd (Linux)
sudo systemctl edit ollama
# 添加:
# [Service]
# Environment="OLLAMA_ORIGINS=http://localhost:5173"
sudo systemctl restart ollama
```

### 9.4 在 YYC3 中启用 Ollama

1. 启动 dev server 后，YYC3 会自动探测 `localhost:11434`
2. 进入 Console → **Ollama** 标签页 → 查看已发现的模型
3. Settings → AI Models → 找到 "Local (Ollama)" Provider
4. 启用 → 选择默认模型 → 无需 API Key

### 9.5 Ollama 自动发现机制

`useOllamaDiscovery.ts` Hook 每 30 秒轮询一次 Ollama `/api/tags` 端点:

```
GET http://localhost:11434/api/tags
→ 解析模型列表 → 更新 llm-providers.ts 的 Local Provider models
→ 可在 Settings 中选择
```

---

## 10. 测试体系运行

### 10.1 三层测试架构

```
┌─────────────────────────────────────────┐
│ Layer 1: In-App Framework Tests (55)     │ ← 浏览器内运行
│   Type Audit / Component / Module / Int  │
├─────────────────────────────────────────┤
│ Layer 2: In-App Core Logic Tests (81)    │ ← 浏览器内运行
│   63 Core + 18 Zod Schema               │
├─────────────────────────────────────────┤
│ Layer 3: Vitest Unit Tests (24+)         │ ← Node.js/CI 运行
│   Zod Schema Validation                 │
└─────────────────────────────────────────┘
```

### 10.2 运行 In-App 测试 (浏览器)

1. 启动 dev server: `pnpm dev`
2. 打开 `http://localhost:5173/`
3. 进入 Console → **测试框架** (Test Framework)
4. 点击 **Framework Tests** 标签 → **Run All** → 观察 55 个测试全绿
5. 点击 **Core Logic Tests** 标签 → **Run All** → 观察 81 个测试全绿

### 10.3 运行 Vitest (终端/CI)

```bash
# 单次运行
pnpm test
# 或
npx vitest run

# 监听模式 (开发时)
pnpm test:watch
# 或
npx vitest

# 带覆盖率
pnpm test:coverage
# 或
npx vitest run --coverage

# 运行特定测试文件
npx vitest run src/lib/__tests__/persist-schemas.test.ts
```

### 10.4 Vitest 预期输出

```
 ✓ src/lib/__tests__/persist-schemas.test.ts (24 tests) 45ms
   ✓ ChatMessageSchema (4 tests)
   ✓ ChatSessionSchema (2 tests)
   ✓ AgentHistoryRecordSchema (2 tests)
   ✓ PreferencesSchema (2 tests)
   ✓ SystemLogSchema (2 tests)
   ✓ KnowledgeEntrySchema (2 tests)
   ✓ LLMProviderConfigSchema (2 tests)
   ✓ validateRecord helper (2 tests)
   ✓ validateArray helper (3 tests)
   ✓ Convenience validators (3 tests)

 Test Files  1 passed (1)
      Tests  24 passed (24)
   Start at  12:00:00
   Duration  0.8s
```

### 10.5 运行 E2E 冒烟测试

在 Console → **烟雾测试** (Smoke Test):

- 23 个测试目标 (5 主视图 + 18 控制台标签页)
- 测试每个组件的 lazy-load 挂载 + 错误边界

### 10.6 GitHub Actions CI (可选)

创建 `.github/workflows/ci.yml`:

```yaml
name: YYC3 CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: npx tsc --noEmit

      - name: Run Vitest
        run: pnpm test

      - name: Build
        run: pnpm build
```

---

## 11. 生产构建与 NAS 部署

### 11.1 构建

```bash
pnpm build

# 输出到 dist/ 目录:
# dist/
#   ├── index.html
#   ├── assets/
#   │   ├── index-[hash].js       (~800KB gzipped)
#   │   ├── index-[hash].css      (~60KB gzipped)
#   │   └── vendor-[hash].js      (React + 依赖)
#   └── favicon.svg
```

### 11.2 本地预览

```bash
pnpm preview
# → http://localhost:4173/
```

### 11.3 部署到 NAS (Nginx)

```bash
# 1. 复制 dist/ 到 NAS
scp -r dist/ user@192.168.x.x:/var/www/yyc3/

# 2. NAS 上的 Nginx 配置
cat > /etc/nginx/conf.d/yyc3.conf << 'EOF'
server {
    listen 8080;
    server_name yyc3.local;
    root /var/www/yyc3;
    index index.html;

    # SPA 路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长期缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
EOF

# 3. 重载 Nginx
nginx -t && nginx -s reload
```

### 11.4 部署到 NAS (Docker)

```bash
# Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# nginx.conf
cat > nginx.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 构建并推送到 NAS
docker build -t yyc3-chatbot:latest .
docker save yyc3-chatbot:latest | ssh user@NAS_IP 'docker load'
ssh user@NAS_IP 'docker run -d --name yyc3 -p 8080:80 --restart always yyc3-chatbot:latest'
```

---

## 12. 可选: Express 后端微服务

`src/server/` 目录包含一个独立的 Express 后端，用于:

- PostgreSQL 数据持久化 (替代 localStorage)
- WebSocket 实时心跳
- API Key 安全中转 (避免前端暴露)

### 12.1 独立部署后端

```bash
# 创建独立后端项目
mkdir -p ~/projects/yyc3-server
cd ~/projects/yyc3-server
npm init -y

# 安装依赖
npm i express pg cors ws dotenv uuid
npm i -D typescript @types/express @types/pg @types/ws @types/cors @types/uuid ts-node

# 复制 server 文件
cp ~/projects/yyc3-hacker-chatbot/src/server/*.ts ./

# 创建 .env
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yyc3_devops
DB_USER=yyc3_admin
DB_PASSWORD=your_secure_password
SERVER_PORT=3001
WS_HEARTBEAT_MS=2000
CORS_ORIGIN=http://localhost:5173
EOF

# 启动
npx ts-node index.ts
```

### 12.2 前端连接后端

前端默认直连 NAS/localStorage。如需连接 Express 后端:

1. 编辑 `src/lib/nas-client.ts` 中的 API 端点
2. 编�� `src/lib/useWebSocket.ts` 中的 WebSocket URL
3. 在 Vite 配置中添加代理:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3001',
    '/ws': { target: 'ws://localhost:3001', ws: true },
  }
}
```

---

## 13. 常见问题排查

### Q1: `pnpm dev` 报错 "Cannot find module '@/lib/store'"

**原因**: 路径别名未生效
**解决**: 确认 `tsconfig.json` 的 `paths` 配置和 `vite.config.ts` 的 `resolve.alias` 一致:

```typescript
// vite.config.ts — 应已包含:
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### Q2: Tailwind CSS 样式不生效

**原因**: Tailwind v4 使用 `@tailwindcss/vite` 插件，不再需要 `tailwind.config.js`
**检查**:

1. `vite.config.ts` 中包含 `tailwindcss()` 插件
2. `src/styles/tailwind.css` 中有 `@import 'tailwindcss' source(none);`
3. `src/styles/index.css` 正确导入了 `tailwind.css` 和 `theme.css`
4. `src/main.tsx` 中导入了 `@/styles/index.css`

### Q3: 字体加载失败 (离线环境)

**原因**: Google Fonts CDN 不可达
**解决**: 下载字体文件到 `public/fonts/` 并修改 `src/styles/fonts.css`:

```css
/* 替换 Google Fonts 导入为本地字体 */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 300 700;
  font-display: swap;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Variable.woff2') format('woff2');
  font-weight: 100 800;
  font-display: swap;
}
@font-face {
  font-family: 'Fira Code';
  src: url('/fonts/FiraCode-Variable.woff2') format('woff2');
  font-weight: 300 700;
  font-display: swap;
}
```

### Q4: LLM API 调用报 CORS 错误

见 [第 7.6 节](#76-cors-问题处理)

### Q5: Vitest 报 "Cannot find module 'vitest'"

```bash
pnpm add -D vitest jsdom @vitest/coverage-v8
```

### Q6: `zod` 版本冲突

项目使用 Zod v4 (`^4.3.6`)，确保没有其他包依赖 Zod v3:

```bash
pnpm ls zod
# 应只显示 zod@4.x.x

# 如有冲突，在 package.json 中添加:
"pnpm": {
  "overrides": {
    "zod": "^4.3.6"
  }
}
```

### Q7: `react-resizable-panels` 拖动手柄不可见

确保 `theme.css` 中包含 resize handle 的样式。如缺失:

```css
[data-panel-resize-handle-id] {
  background: var(--border);
  transition: background 0.2s;
}
[data-panel-resize-handle-id]:hover,
[data-panel-resize-handle-id][data-resize-handle-active] {
  background: var(--primary);
}
```

### Q8: `ImageWithFallback` 组件找不到

该组件位于 `/src/app/components/figma/ImageWithFallback.tsx`，是 Figma Make 环境的受保护文件。
在本地环境中，如果导出不完整:

```typescript
// src/app/components/figma/ImageWithFallback.tsx
import React from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function ImageWithFallback({ fallback, alt, ...props }: ImageWithFallbackProps) {
  const [error, setError] = React.useState(false);

  if (error && fallback) {
    return <img {...props} src={fallback} alt={alt} />;
  }

  return (
    <img
      {...props}
      alt={alt}
      onError={() => setError(true)}
    />
  );
}
```

### Q9: 构建 `dist/` 体积过大

```bash
# 分析包体积
npx vite-bundle-visualizer

# 常见优化:
# 1. 确认所有 console tab 都使用 React.lazy() (已实现)
# 2. 检查 recharts 是否被 tree-shake
# 3. 考虑按需导入 lucide-react 图标
```

### Q10: Hot Module Replacement (HMR) 不工作

```bash
# 检查 Vite 插件
# vite.config.ts 应包含:
plugins: [react(), tailwindcss()]

# 如仍有问题，清理缓存:
rm -rf node_modules/.vite
pnpm dev
```

---

## 14. 文件清单与架构概览

### 14.1 核心 lib 模块行数统计

| 模块 | 文件 | 行数 | 职责 |
|------|------|------|------|
| LLM Bridge | `llm-bridge.ts` | ~1048 | 统一 LLM 调用 (7 Provider / SSE / 熔断) |
| MCP Protocol | `mcp-protocol.ts` | ~1326 | MCP 工具协议层 |
| Agent Orchestrator | `agent-orchestrator.ts` | ~1427 | 7 Agent 协作编排 |
| Persistence Engine | `persistence-engine.ts` | ~830 | 全链路数据持久化 |
| NAS Client | `nas-client.ts` | ~600 | NAS/集群 HTTP 客户端 |
| Zustand Store | `store.ts` | ~400 | 全局状态管理 |
| Types | `types.ts` | ~350 | TypeScript 类型定义 |
| Persist Schemas | `persist-schemas.ts` | ~200 | Zod v4 验证 Schema |
| Event Bus | `event-bus.ts` | ~200 | 全局事件发布/订阅 |

### 14.2 组件统计

| 类别 | 数量 | 位置 |
|------|------|------|
| Console 标签页 | 21 | `src/app/components/console/` |
| UI 基础组件 (shadcn) | 35+ | `src/app/components/ui/` |
| Chat 组件 | 5 | `src/app/components/chat/` |
| Views | 5 | `src/app/components/views/` |
| Layout | 1 | `src/app/components/layout/` |
| 其他 | 3 | `monitoring/`, `search/`, `settings/` |

### 14.3 测试统计

| 层级 | 数量 | 运行环境 |
|------|------|---------|
| In-App Framework | 55 | 浏览器 |
| In-App Core Logic | 63 | 浏览器 |
| In-App Zod Schema | 18 | 浏览器 |
| Vitest Unit | 24 | Node.js |
| Smoke Test | 23 | 浏览器 |
| **总计** | **183** | |

### 14.4 数据流架构

```
┌─────────────────────────────────────────────────┐
│                   用户界面                        │
│  ChatArea ←→ Sidebar ←→ ConsoleView ←→ Views    │
└─────────┬───────────────────────────────┬───────┘
          │                               │
┌─────────▼─────────┐         ┌──────────▼────────┐
│   Zustand Store    │         │   Event Bus        │
│   (单一数据源)     │◄───────►│   (解耦通信)       │
└─────────┬─────────┘         └───────────────────┘
          │
    ┌─────┴─────────────────────┐
    │                           │
┌───▼──────────┐  ┌────────────▼────────────┐
│ LLM Bridge   │  │ Persistence Engine       │
│ (7 Provider) │  │ (localStorage / NAS)     │
│ + Router     │  │ + Zod Validation         │
│ + Circuit    │  │ + Binding Layer          │
│   Breaker    │  └────────────┬────────────┘
└──────────────┘               │
                      ┌────────┴────────┐
                      │                 │
                ┌─────▼──────┐   ┌──────▼─────┐
                │ localStorage│   │ NAS SQLite  │
                │ (离线优先)  │   │ (在线同步)  │
                └────────────┘   └────────────┘
```

---

## 快速启动 TL;DR

```bash
# 1. 环境
node -v  # >= 20
pnpm -v  # >= 9

# 2. 解压 + 进入目录
cd ~/projects/yyc3-hacker-chatbot

# 3. 修改 package.json (移 react 到 dependencies, 加 scripts)
# 4. 创建 tsconfig.json, index.html, src/main.tsx (见第 4 节)

# 5. 安装
pnpm install

# 6. 启动
pnpm dev

# 7. 测试
pnpm test              # Vitest (终端)
# 浏览器中: Console → 测试框架 → Run All

# 8. 配置 AI
# Settings → AI Models → 添加 API Key
# Console → 流式诊断 → Run Stream Test

# 9. 构建
pnpm build
pnpm preview
```

---

*YYC3 Hacker Chatbot | Phase 28 | 本地化部署指南 v1.0*
*万象归元于云枢; 深栈智启新纪元*
