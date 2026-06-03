# 开发者指南 · Development Guide

> **YanYuCloudCube™** | **言启象限 · 语枢未来**
>
> *万象归元于云枢 | 深栈智启新纪元*

---

## 📋 目录

1. [环境要求](#1-环境要求)
2. [快速开始](#2-快速开始)
3. [项目架构](#3-项目架构)
4. [存储架构详解](#4-存储架构详解)
5. [品牌系统](#5-品牌系统)
6. [AI 智能体系统](#6-ai-智能体系统)
7. [测试指南](#7-测试指南)
8. [构建与部署](#8-构建与部署)
9. [故障排查](#9-故障排查)

---

## 1. 环境要求

### 必备工具

| 工具 | 版本要求 | 验证命令 |
|------|---------|---------|
| Node.js | >= 20.x | `node --version` |
| pnpm | >= 9.x | `pnpm --version` |
| Git | >= 2.x | `git --version` |

### 可选工具

| 工具 | 用途 |
|------|------|
| Docker Desktop | 容器管理功能 |
| Ollama | 本地 LLM 运行 |
| Playwright | E2E 测试浏览器 |

### 推荐 IDE

| IDE | 插件 |
|-----|------|
| VS Code | ESLint, Prettier, Tailwind CSS IntelliSense |
| WebStorm | 内置 TypeScript 支持 |

## 2. 快速开始

### 2.1 克隆与安装

```bash
git clone https://github.com/YanYuCloudCube/Family-π³.git
cd Family-π³
pnpm install
```

### 2.2 启动开发环境

```bash
# 开发服务器（HMR 热更新）
pnpm dev

# 访问 http://localhost:3003
```

### 2.3 常用命令

```bash
pnpm dev              # 启动开发服务器 (端口 3003)
pnpm build            # 生产构建
pnpm test             # 运行单元测试
pnpm test:e2e         # 运行 E2E 测试
pnpm lint             # ESLint 检查
pnpm lint:fix         # 自动修复 ESLint
pnpm type-check       # TypeScript 类型检查
pnpm format           # Prettier 格式化
```

## 3. 项目架构

### 3.1 顶层结构

```
Family-π³/
├── src/                     # 前端源代码
│   ├── app/
│   │   ├── components/      # React 组件
│   │   │   ├── ui/          # shadcn/ui + 自定义 UI 组件
│   │   │   ├── console/     # 系统控制台视图 (30+)
│   │   │   ├── chat/        # 聊天界面组件
│   │   │   ├── settings/    # 设置面板
│   │   │   ├── layout/      # 侧边栏、导航布局
│   │   │   ├── views/       # 独立视图页面
│   │   │   ├── monitoring/  # 监控面板
│   │   │   └── search/      # 全局搜索
│   │   └── App.tsx          # 应用入口 + 路由
│   ├── lib/
│   │   ├── storage/         # ⭐ 三层存储架构 (9 文件)
│   │   ├── store.ts         # Zustand 状态管理
│   │   ├── llm-bridge.ts    # LLM 集成桥接
│   │   ├── api.ts           # 纯前端持久化服务
│   │   ├── branding-config.ts # 品牌配置
│   │   └── ...
│   └── env.d.ts             # 全局类型声明
├── e2e/                     # Playwright E2E 测试
├── docs/                    # 文档 (20+ 目录)
├── packages/
│   └── bigmodel-sdk/        # LLM SDK（独立包）
├── scripts/                 # 部署脚本
└── public/                  # 静态资源
```

### 3.2 组件层级

```
App.tsx (入口)
├── LanguageProvider (i18n)
│   ├── Sidebar (五级导航 L1)
│   ├── ChatArea (聊天区域)
│   │   ├── ClaudeWelcome (欢迎页 + BrandLogo)
│   │   └── MessageBubble (消息气泡)
│   ├── ConsoleView (控制台)
│   │   ├── ClusterTopology (集群拓扑)
│   │   ├── AgentChatInterface (AI 智能体)
│   │   ├── StorageDashboard (存储监控)
│   │   └── ...
│   ├── SettingsModal (设置 + 品牌配置)
│   └── YYC3Background (背景)
└── ErrorBoundary (全局错误捕获)
```

### 3.3 关键依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| react | ^18.3.1 | UI 框架 |
| zustand | ^5.0.11 | 状态管理 |
| dexie | ^4.4.3 | IndexedDB ORM |
| lucide-react | 0.487.0 | 图标系统 |
| recharts | 2.15.2 | 图表可视化 |
| class-variance-authority | 0.7.1 | 组件样式变体 |

## 4. 存储架构详解

### 4.1 三层存储模型

```
┌───────────────────────────────────────────────────────────────┐
│                     PersistenceEngine                         │
│                  (统一存储接口抽象层)                            │
├───────────────────────────────────────────────────────────────┤
│                    StorageOrchestrator                         │
│               (智能分层路由 + 自动降级)                          │
├──────────┬──────────────┬──────────────┬──────────────────────┤
│  L1      │  L2          │  L3          │  辅助层              │
│localStor-│ IndexedDB   │ NAS SQLite   │                      │
│age       │ (Dexie)     │              │                      │
│          │              │              │  CrossTab Sync       │
│ 偏好设置  │ Agent 对话   │ 持久化备份   │ (BroadcastChannel)   │
│ 缓存键值  │ 集群指标     │ 历史数据     │  CRDT 冲突合并       │
│ 当前状态  │ 系统日志     │ 设备档案     │  CacheManager TTL    │
└──────────┴──────────────┴──────────────┴──────────────────────┘
```

### 4.2 存储模块清单

| 文件 | 角色 |
|------|------|
| `persistence-engine.ts` | 统一存储接口抽象层 |
| `storage-orchestrator.ts` | 智能分层路由 + 自动降级 |
| `indexeddb-adapter.ts` | IndexedDB 适配器（Dexie.js） |
| `cache-manager.ts` | TTL 缓存管理（IndexedDB 读取缓存） |
| `cross-tab-sync.ts` | BroadcastChannel 跨标签同步 |
| `crdt.ts` | LWW Register + mergeRecordArrays |
| `storage-context.tsx` | React Context + Hooks |
| `storage-encryption.ts` | AES-GCM 256-bit 加密 |
| `storage-migration.ts` | 存储迁移管理器 |
| `migrate-storage.ts` | localStorage 旧键迁移工具 |

### 4.3 使用示例

```typescript
// 通过 StorageOrchestrator 写入（自动分层）
import { getStorageOrchestrator } from '@/lib/storage/storage-orchestrator';

const orchestrator = getStorageOrchestrator();
await orchestrator.write('preferences', [{ key: 'theme', value: 'dark' }]);
// 自动广播 CrossTab 通知其他标签页

// 通过 PersistenceEngine 读取（统一接口）
import { getPersistenceEngine } from '@/lib/persistence-engine';
const engine = getPersistenceEngine();
const data = await engine.read('chat_messages');

// CRDT 合并（NAS 同步时自动调用）
import { mergeRecordArrays } from '@/lib/storage/crdt';
const { merged, localWins, remoteWins } = mergeRecordArrays(localArr, remoteArr);
```

### 4.4 数据域映射

| PersistDomain | 存储层 | 说明 |
|--------------|--------|------|
| `preferences` | L1 | 用户偏好、主题设置 |
| `chat_messages` | L2 | 对话历史 |
| `agent_messages` | L2 | 智能体对话 |
| `metrics_snapshots` | L2 | 集群指标快照 |
| `system_logs` | L2 | 系统日志 |
| `projects` | L2 | 项目数据 |
| `artifacts` | L2 | 工件记录 |
| `nas_backup` | L3 | NAS 持久化备份 |

### 4.5 跨标签同步

```typescript
// 监听其他标签页的存储变更
import { onStorageChange } from '@/lib/storage/cross-tab-sync';

const unsubscribe = onStorageChange('chat_messages', (msg) => {
  console.log('Received cross-tab update:', msg.action, msg.timestamp);
  refreshChatData();
});
// 清理
unsubscribe();
```

### 4.6 缓存层

```typescript
// CacheManager 自动用于 IndexedDB 读取
// 默认 TTL: 30 秒
// write() 时自动失效对应缓存

// 也可独立使用
import { CacheManager } from '@/lib/storage/cache-manager';
const cache = new CacheManager<MyType>(60_000); // 60s TTL
cache.getOrSet('my-key', () => expensiveComputation());
console.log(cache.getStats()); // { hits, misses, hitRate, size }
```

## 5. 品牌系统

### 5.1 BrandLogo 组件

```tsx
// 统一品牌标识组件
import { BrandLogo, YYC3Logo } from '@/app/components/ui/brand-logo';

// 三种尺寸
<BrandLogo size="sm" />    // 32px - 侧边栏
<BrandLogo size="md" />    // 48px - 默认
<BrandLogo size="lg" />    // 96px - 欢迎页

// 带文字
<BrandLogo size="md" showText />

// 仅 SVG 图标
<YYC3Logo className="w-10 h-10" />
```

### 5.2 品牌配置

```typescript
// 配置存储在 localStorage 中
import { loadBranding, saveBranding, DEFAULT_BRANDING } from '@/lib/branding-config';

const config = loadBranding();
saveBranding({ ...config, appName: 'My Custom Name' });
// 自动触发 'yyc3-branding-update' 事件
// BrandLogo 组件自动响应更新
```

### 5.3 配置项

| 配置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| appName | string | YYC³_DEVOPS | 应用名称 |
| tagline | string | v3.0.1-beta | 副标题 |
| logoText | string | Y3 | SVG 内文字 |
| logoDataUrl | base64 | '' | 上传图片 |
| logoFileName | string | '' | 文件名显示 |

## 6. AI 智能体系统

### 6.1 八大智能体

| 智能体 | 角色标识 | 颜色 | Prompt 文件 |
|-------|---------|------|------------|
| Navigator 言启·千行 | navigator | amber | `llm-providers.ts` |
| Thinker 语枢·万物 | thinker | blue | `llm-providers.ts` |
| Prophet 预见·先知 | prophet | purple | `llm-providers.ts` |
| Bole 知遇·伯乐 | bole | pink | `llm-providers.ts` |
| Pivot 元启·天枢 | pivot | cyan | `llm-providers.ts` |
| Sentinel 智云·守护 | sentinel | red | `llm-providers.ts` |
| Grandmaster 格物·宗师 | grandmaster | green | `llm-providers.ts` |
| Grace 创想·灵韵 | grace | violet | `llm-providers.ts` |

### 6.2 LLM 提供商

支持 8 个 LLM 提供商：OpenAI、Anthropic、DeepSeek、智谱 GLM、Google Gemini、Groq、Ollama（本地）、LM Studio（本地）。

## 7. 测试指南

### 7.1 运行测试

```bash
# 单元测试
pnpm test                    # 全部
pnpm test -- --reporter=verbose  # 详细输出

# E2E 测试
pnpm test:e2e                # 运行全部 E2E
pnpm test:e2e:ui             # UI 模式
pnpm test:e2e:debug          # 调试模式

# 特定测试文件
pnpm vitest run src/lib/__tests__/crdt.test.ts
```

### 7.2 测试结构

```
src/lib/__tests__/
├── crdt.test.ts              # CRDT 合并测试
├── persistence-engine.test.ts # 存储引擎测试
├── store.test.ts             # Zustand store 测试
├── branding-config.test.ts   # 品牌配置测试
├── mcp-protocol.test.ts      # MCP 协议测试
├── event-bus.test.ts         # 事件总线测试
├── llm-bridge.test.ts        # LLM 桥接测试
└── ...
```

## 8. 构建与部署

### 8.1 生产构建

```bash
pnpm build
# 输出在 dist/ 目录
```

### 8.2 构建产物

```
dist/
├── index.html
├── assets/
│   ├── index-*.js            # 主入口
│   ├── ConsoleView-*.js      # Console 视图（懒加载）
│   └── ...
├── sw.js                     # Service Worker (PWA)
└── workbox-*.js              # Workbox 运行时
```

### 8.3 部署

```bash
# 预览构建
pnpm preview

# 部署到 GitHub Pages
# 自动通过 CI/CD 流水线部署
```

## 9. 故障排查

### 9.1 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| `pnpm install` 失败 | 网络问题 | 尝试 `pnpm install --no-frozen-lockfile` |
| 端口被占用 | 已有进程 | `lsof -i :3003` 查找并关闭 |
| TypeScript 类型错误 | 类型依赖缺失 | `pnpm add -D @types/xxx` |
| 存储操作报错 | 浏览器限制 | 使用 `http://localhost` 而非 `file://` |
| Service Worker 不更新 | 缓存问题 | DevTools → Application → Clear storage |

### 9.2 调试技巧

```typescript
// 检查存储状态
import { getStorageOrchestrator } from '@/lib/storage/storage-orchestrator';
const stats = await getStorageOrchestrator().getStats();
console.table(stats.tiers);

// 查看缓存命中率
import { getGlobalCache } from '@/lib/storage/cache-manager';
const cache = getGlobalCache('indexeddb');
console.log(cache.getStats());

// 清除所有存储
import { clearAllGlobalCaches } from '@/lib/storage/cache-manager';
clearAllGlobalCaches();
localStorage.clear();
```

### 9.3 获取帮助

- **GitHub Issues**: <https://github.com/YanYuCloudCube/Family-π³/issues>
- **项目文档**: `docs/` 目录
- **邮件**: admin@0379.email

---

> **YanYuCloudCube™** | **言启象限 · 语枢未来**
>
> *万象归元于云枢 | 深栈智启新纪元*
>
> **Words Initiate Quadrants, Language Serves as Core for Future**
