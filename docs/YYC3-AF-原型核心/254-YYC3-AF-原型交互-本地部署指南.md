---
@file: 254-YYC3-AF-原型交互-本地部署指南.md
@description: YYC3-AF-原型交互本地部署指南，提供完整的本地化部署流程和配置说明
@author: YanYuCloudCube Team
@version: v28.0.0
@created: 2026-02-16
@updated: 2026-02-17
@status: published
@tags: [原型交互],[本地部署],[配置指南]
---

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 254-YYC3-AF-原型交互-本地部署指南

## 概述

本文档详细描述YYC³(YanYuCloudCube)-Family-AI-原型交互-本地部署指南相关内容，YYC³-Family-AI不仅仅是一个软件系统，而是一个"智能生命体"。它以"五化一体"为法则，以插件化架构为骨骼，以AI能力为灵魂，构建一个能够自我进化、持续学习的智能协同平台。

基于**行业应用开发全生命周期闭环架构**，本文档整合了**YYC3 -π³无边界设计理念**与**大数据技术栈**，为YYC3 Family-π³ Chatbot提供完整的本地化部署流程和配置说明。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景

YYC³(YanYuCloudCube)-Family-AI 本地一站式智能工作平台是一个**完全本地化、一体化、自进化**的智能工作生态系统。它以"五化一体"为法则，以Family-AI为核心，以多机协同为骨架，以NAS存储为基石，构建一个能够学习、积累、生成、迭代的闭环智能平台。

**版本信息**：
- 版本：Phase 28
- 日期：2026-02-16
- 适用环境：macOS (Apple Silicon) / Linux / Windows WSL2
- 运行时：Node.js 20+ | pnpm 9+ | Vite 6 | React 18 | Tailwind CSS v4

#### 1.2 文档目标
- 提供完整的本地化部署流程
- 规范环境配置和依赖管理
- 为开发团队提供清晰的部署参考依据
- 支持快速启动和功能验证

### 2. 设计原则

#### 2.1 五高原则
- 高效协同
  - 分布式任务分配与实时状态同步
  - 多机协同架构与边缘计算支持
- 高维智能
  - 多模态感知与决策融合模型
  - GLM 4.7 / GPT-4.1 / 智源Emu3 AI能力集成
- 高可靠韧性
  - 故障检测与自愈自学系统
  - 容器化部署与自动扩缩容
- 高成长进化
  - 持续学习管道与知识蒸馏
  - 大数据驱动的模型迭代优化
- 高安全合规
  - 零信任架构与动态权限管理
  - 数据加密与隐私保护机制

#### 2.2 五标体系
- 架构标准
  - 微服务、事件驱动、API优先
  - 无边界设计架构与动态响应式布局
- 接口标准
  - 统一API契约、消息格式、通信协议
  - RESTful + GraphQL + WebSocket多协议支持
- 数据标准
  - 数据模型、命名规范、隐私保护
  - 大数据湖仓一体化架构
- 安全标准
  - 认证机制、加密策略、访问控制
  - GDPR/个人信息保护法合规
- 演进标准
  - 版本管理、灰度发布、回滚策略
  - A/B测试与渐进式交付

#### 2.3 五化架构
- 流程自动化
  - 脚本化流程、触发器机制
  - DevOps流水线与自动化测试
- 能力模块化
  - 功能解耦、标准化接口
  - 微前端与微服务架构
- 决策智能化
  - 机器学习模型、规则引擎
  - 大数据分析与智能推荐
- 知识图谱化
  - 实体关系抽取、知识网络构建
  - 知识图谱与向量数据库
- 治理持续化
  - 嵌入式治理、实时监控
  - 可观测性平台与告警体系

#### 2.4 无边界设计理念（YYC3 -π³集成）
- **无边界核心**：去除传统UI边界，实现沉浸式体验
- **无按钮设计**：依托手势、语音、眼动等自然交互
- **动态布局**：响应式设计，自适应多端多屏
- **多模态交互**：融合语音、手势、眼动、触觉输入
- **上下文感知**：AI驱动的智能响应与个性化适配

#### 2.5 大数据技术栈
- **数据采集**：实时数据流采集与批量数据处理
- **数据存储**：数据湖、数据仓库、向量数据库
- **数据处理**：批处理、流处理、实时计算
- **数据分析**：BI报表、数据挖掘、机器学习
- **数据服务**：数据API、数据可视化、数据治理

### 3. 环境准备

#### 3.1 必需工具

**Node.js 20+ (推荐 LTS)**：
```bash
node --version   # 需要 >= 20.0.0
```

**pnpm (推荐 9.x, 项目使用 pnpm lockfile)**：
```bash
npm install -g pnpm@latest
pnpm --version   # 需要 >= 9.0.0
```

**Git**：
```bash
git --version
```

#### 3.2 推荐工具

**VS Code + 推荐扩展**：
```bash
code --install-extension bradlc.vscode-tailwindcss      # Tailwind CSS IntelliSense
code --install-extension dbaeumer.vscode-eslint          # ESLint
code --install-extension esbenp.prettier-vscode          # Prettier
code --install-extension vitest.explorer                 # Vitest Explorer (测试面板)
code --install-extension ms-vscode.vscode-typescript-next # TypeScript Nightly
```

#### 3.3 网络要求

| 服务 | 用途 | 是否必需 |
|------|------|---------|
| Google Fonts CDN | Inter / Fira Code / JetBrains Mono 字体 | 推荐 (离线可降级) |
| LLM API 端点 | OpenAI / Anthropic / DeepSeek / Z.AI 等 | AI模式必需 |
| 本地 NAS (192.168.x.x) | 数据持久化 / Docker 管理 | 可选 (自动降级 localStorage) |
| Ollama (localhost:11434) | 本地 LLM 推理 | 可选 |

### 4. 项目文件导出与结构

#### 4.1 从 Figma Make 导出

在 Figma Make 编辑器中:
1. 点击右上角 **Export** 或 **Download Code**
2. 选择 **Download as ZIP**
3. 解压到本地目录

```bash
mkdir -p ~/projects/yyc3-Family-π³-chatbot
cd ~/projects/yyc3-Family-π³-chatbot
# 将 ZIP 解压到此处
unzip ~/Downloads/yyc3-export.zip -d .
```

#### 4.2 初始化 Git

```bash
git init
git add .
git commit -m "Phase 28: Initial local import from Figma Make"
```

#### 4.3 项目目录结构

```
yyc3-Family-π³-chatbot/
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

### 5. 依赖安装与验证

#### 5.1 修改 package.json

Figma Make 的 `package.json` 将 React 列为 `peerDependencies`，本地需要移动到 `dependencies`:

```bash
cd ~/projects/yyc3-Family-π³-chatbot
```

编辑 `package.json`，进行以下修改:

```jsonc
{
  "name": "yyc3-Family-π³-chatbot",
  "private": true,
  "version": "0.28.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/ --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/react-syntax-highlighter": "^15.5.13",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "typescript": "^5.6.0",
    "vite": "6.3.5",
    "vitest": "^3.2.0",
    "@vitest/coverage-v8": "^3.2.0",
    "jsdom": "^26.1.0"
  }
}
```

#### 5.2 删除旧 lockfile 并重装

```bash
# 删除 Figma Make 生成的 lockfile (如果有)
rm -f pnpm-lock.yaml

# 安装所有依赖
pnpm install

# 验证安装
pnpm ls react react-dom zustand zod vite vitest
```

#### 5.3 验证关键包版本

```bash
# 应输出:
#   react@18.3.x
#   zustand@5.0.x
#   zod@4.3.x
#   vite@6.3.x
#   tailwindcss@4.1.x

pnpm ls --depth 0 | grep -E "react|zustand|zod|vite|tailwindcss"
```

### 6. 缺失文件补全

#### 6.1 创建 `tsconfig.json`

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

#### 6.2 创建 `index.html` (Vite 入口)

```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="YYC3 Family-π³ Chatbot - Cyberpunk DevOps Intelligence Platform" />
    <title>YYC3 Family-π³ Chatbot</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="dark">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
```

#### 6.3 创建 `src/main.tsx` (React 挂载点)

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

#### 6.4 创建 `src/vite-env.d.ts`

```bash
cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />
EOF
```

#### 6.5 创建 `public/favicon.svg` (可选)

```bash
mkdir -p public
cat > public/favicon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0EA5E9"/>
  <text x="16" y="24" text-anchor="middle" fill="white" font-size="20" font-family="monospace" font-weight="bold">Y3</text>
</svg>
EOF
```

#### 6.6 创建 `.gitignore`

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

### 7. TypeScript 配置

#### 7.1 验证类型检查通过

```bash
pnpm type-check
# 或
npx tsc --noEmit
```

#### 7.2 常见类型错误修复

**问题 1: `figma:asset` 虚拟模块报错**

如果项目中有 `import img from "figma:asset/xxx.png"` 这类导入，需要添加声明:

```typescript
// src/types/figma-asset.d.ts
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}
```

**问题 2: `@types/react-syntax-highlighter` 缺失**

```bash
pnpm add -D @types/react-syntax-highlighter
```

**问题 3: 第三方库缺少类型**

```bash
# 按需安装
pnpm add -D @types/react-slick @types/react-responsive-masonry
```

### 8. 本地开发服务器启动

#### 8.1 启动 Vite Dev Server

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

#### 8.2 访问验证

打开浏览器访问 `http://localhost:5173/`，应看到:

1. **深色背景** + 宝石蓝(`#0EA5E9`)边线的赛博朋克界面
2. **左侧栏**: 导航图标 (Terminal/Console/Projects/Artifacts/Monitor等)
3. **中央区域**: 聊天区 (Neural Link 输入框)
4. **右侧**: 可推拉的 Artifacts 面板

#### 8.3 快速功能验证

| 操作 | 预期结果 |
|------|---------|
| 点击左侧 Console 图标 | 进入控制台，看到 21 个标签页 |
| 按 `Ctrl+K` / `Cmd+K` | 弹出全局搜索面板 |
| 按 `Ctrl+M` | 切换 导航模式 ↔ AI模式 |
| 输入 "打开仪表盘" (导航模式) | 自动跳转到 Dashboard 标签页 |
| 输入 "流式诊断" (导航模式) | 跳转到 Stream Diagnostics 标签页 |
| Console → 测试框架 | 看到 Framework Tests + Core Logic Tests 双面板 |
| Console → 流式诊断 | 看到 Provider Health + E2E Stream Test 面板 |

### 9. LLM Provider 配置与实测

#### 9.1 进入设置

1. 点击左侧栏底部 **齿轮图标** → Settings Modal
2. 或在聊天框输入 "设置" / "settings" (导航模式)
3. 切换到 **AI 模型** 标签页

#### 9.2 配置 Provider

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

#### 9.3 API Key 存储位置

API Key 存储在 **浏览器 localStorage** 中:

```
localStorage key: yyc3_llm_configs
格式: JSON 数组 [{providerId, apiKey, enabled, defaultModel, endpoint}, ...]
```

> **安全提示**: API Key 仅存储在你的浏览器本地，不会发送到任何第三方服务器。
> 项目的 LLM 请求直接从浏览器发出到 Provider API。
> 如需更高安全性，请使用 CORS 代理或后端中转。

#### 9.4 E2E 流式输出实测

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

#### 9.5 在 ChatArea 中实测

1. 按 `Ctrl+M` 切换到 **AI 模式** (输入框提示文字会变化)
2. 输入任意消息，如 "解释 React 的 useEffect Hook"
3. 观察:
   - 消息气泡出现，流式文字逐步填充
   - 底部状态栏显示当前 Provider / Model
   - 完成后 Token 用量记录到 LLM 用量面板

#### 9.6 CORS 问题处理

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

### 10. 本地 NAS 连接配置

#### 10.1 NAS 架构

项目设计为前端直连本地 NAS HTTP API，无需中间服务器:

```
浏览器 (localhost:5173)
   │
   ├── HTTP → NAS (192.168.x.x:5000) — SQLite 数据持久化
   ├── HTTP → NAS Docker API (192.168.x.x:2375) — 容器管理
   └── WS   → NAS WebSocket — 实时心跳/日志
```

#### 10.2 设备配置

1. 进入 Console → **Dashboard** (总控台)
2. 点击 **设备管理** 区域的设备卡片
3. 编辑设备 IP / 主机名 / 端口

或在 Console → **NAS 部署** (NAS Deployment) 中配置:
- NAS IP 地址
- SQLite API 端口
- Docker API 端口
- SSH 端口 (用于远程部署)

#### 10.3 持久化层降级策略

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

#### 10.4 NAS SQLite 端点要求

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

### 11. Ollama 本地模型对接

#### 11.1 安装 Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# 启动服务
ollama serve
# 默认监听: http://localhost:11434
```

#### 11.2 拉取模型

```bash
# 推荐模型
ollama pull llama3.2            # 3B, 轻量快速
ollama pull qwen2.5:7b          # 7B, 中文优化
ollama pull deepseek-r1:8b      # 8B, 推理增强
ollama pull codellama:13b       # 13B, 代码专用

# 验证
ollama list
```

#### 11.3 配置 Ollama CORS

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

#### 11.4 在 YYC3 中启用 Ollama

1. 启动 dev server 后，YYC3 会自动探测 `localhost:11434`
2. 进入 Console → **Ollama** 标签页 → 查看已发现的模型
3. Settings → AI Models → 找到 "Local (Ollama)" Provider
4. 启用 → 选择默认模型 → 无需 API Key

#### 11.5 Ollama 自动发现机制

`useOllamaDiscovery.ts` Hook 每 30 秒轮询一次 Ollama `/api/tags` 端点:

```
GET http://localhost:11434/api/tags
→ 解析模型列表 → 更新 llm-providers.ts 的 Local Provider models
→ 可在 Settings 中选择
```

### 12. 测试体系运行

#### 12.1 三层测试架构

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

#### 12.2 运行 In-App 测试 (浏览器)

1. 启动 dev server: `pnpm dev`
2. 打开 `http://localhost:5173/`
3. 进入 Console → **测试框架** (Framework Tests)
4. 点击 **Run All Tests**
5. 观察:
   - 测试进度条
   - 通过/失败统计
   - 失败测试的错误详情

#### 12.3 运行 Vitest 单元测试 (CLI)

```bash
# 运行所有测试
pnpm test

# 监听模式 (开发时使用)
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# 运行特定测试文件
pnpm test persist-schemas
```

### 13. 生产构建与 NAS 部署

#### 13.1 生产构建

```bash
# 构建生产版本
pnpm build

# 输出目录: dist/
# 文件大小: ~500KB (gzip 后 ~150KB)

# 预览构建结果
pnpm preview
```

#### 13.2 部署到 NAS

**方案 A: 静态文件部署**

```bash
# 将 dist/ 目录复制到 NAS Web 服务器
scp -r dist/* user@nas:/var/www/yyc3/

# 或使用 rsync
rsync -avz dist/ user@nas:/var/www/yyc3/
```

**方案 B: Docker 容器部署**

```dockerfile
# Dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

```bash
# 构建镜像
docker build -t yyc3-Family-π³-chatbot .

# 运行容器
docker run -d -p 80:80 yyc3-Family-π³-chatbot
```

#### 13.3 环境变量配置

```bash
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_WS_BASE_URL=wss://api.example.com
VITE_ENABLE_ANALYTICS=true
```

### 14. 常见问题排查

#### 14.1 依赖安装问题

**问题**: `pnpm install` 失败

**解决方案**:
```bash
# 清除缓存
pnpm store prune

# 重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 14.2 TypeScript 类型错误

**问题**: 类型检查失败

**解决方案**:
```bash
# 更新类型定义
pnpm add -D @types/react @types/react-dom

# 重新生成类型
pnpm type-check
```

#### 14.3 Vite 开发服务器问题

**问题**: 端口被占用

**解决方案**:
```bash
# 指定端口
pnpm dev --port 3000

# 或修改 vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

#### 14.4 LLM 连接问题

**问题**: 无法连接到 LLM Provider

**解决方案**:
1. 检查 API Key 是否正确
2. 检查网络连接
3. 检查 CORS 配置
4. 使用代理或后端中转

### 15. 文件清单与架构概览

#### 15.1 核心文件清单

| 文件路径 | 说明 | 行数 |
|---|---|---|
| `src/lib/llm-bridge.ts` | LLM 统一桥接 | 1048 |
| `src/lib/mcp-protocol.ts` | MCP 协议层 | 1326 |
| `src/lib/agent-orchestrator.ts` | Agent 编排引擎 | 1427 |
| `src/lib/persistence-engine.ts` | 持久化引擎 | 830 |
| `src/app/App.tsx` | 主入口 | ~500 |
| `src/lib/store.ts` | Zustand 全局状态 | ~300 |

#### 15.2 架构概览

```
┌─────────────────────────────────────────┐
│           用户界面层 (UI Layer)          │
│  React 18 + Tailwind CSS v4 + Radix UI │
├─────────────────────────────────────────┤
│           状态管理层 (State Layer)       │
│         Zustand + Persistence           │
├─────────────────────────────────────────┤
│           业务逻辑层 (Logic Layer)       │
│  LLM Bridge + Agent Orchestrator + MCP │
├─────────────────────────────────────────┤
│           数据持久层 (Data Layer)        │
│      NAS SQLite + LocalStorage         │
└─────────────────────────────────────────┘
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
