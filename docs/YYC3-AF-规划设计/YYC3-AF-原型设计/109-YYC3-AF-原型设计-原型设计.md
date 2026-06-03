---
@file: 109-YYC3-Family-AI-原型设计-原型设计.md
@description: YYC3-「项目名称」开发阶段类原型设计，用于原型设计指导文档
@author: YanYuCloudCube Team
@version: v1.2.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [开发阶段],[原型设计],[指导文档]
---

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 109-YYC3-Family-AI-原型设计-原型设计

## 概述

本文档详细描述YYC³(YanYuCloudCube)-Family-AI-原型设计-原型设计相关内容，YYC³-Family-AI不仅仅是一个软件系统，而是一个"智能生命体"。它以"五化一体"为法则，以插件化架构为骨骼，以AI能力为灵魂，构建一个能够自我进化、持续学习的智能协同平台。

基于**行业应用开发全生命周期闭环架构**，本文档整合了**YYC3 -π³无边界设计理念**与**大数据技术栈**，为行业应用开发提供从需求分析到部署运维的完整文档体系支撑。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景

YYC³(YanYuCloudCube)-Family-AI 本地一站式智能工作平台是一个**完全本地化、一体化、自进化**的智能工作生态系统。它以"五化一体"为法则，以Family-AI为核心，以多机协同为骨架，以NAS存储为基石，构建一个能够学习、积累、生成、迭代的闭环智能平台。

**行业应用开发全生命周期闭环**涵盖：

- **需求规划阶段**：项目立项、需求分析、可行性评估
- **项目规划阶段**：项目管理、进度控制、资源分配
- **架构设计阶段**：系统架构、数据架构、技术选型
- **详细设计阶段**：模块设计、UI/UX设计、交互设计
- **设计原型阶段**：YYC3 -π³无边界设计、多模态交互
- **开发实施阶段**：代码实现、组件封装、第三方集成
- **测试验证阶段**：单元测试、集成测试、E2E测试
- **部署运维阶段**：CI/CD、监控告警、性能优化

#### 1.2 文档目标

- 规范原型设计相关的业务标准与技术落地要求
- 为项目相关人员提供清晰的参考依据
- 保障相关模块开发、实施、运维的一致性与规范性
- 支持行业应用开发全生命周期的文档闭环管理

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

### 3. 原型设计

---

## 快速统计

| 指标 | 数量 |
|--------|-------|
| 总文件数 (src/) | 116 |
| 构建配置文件 | 7 |
| CSS 管道文件 | 4 |
| 核心库模块 | 18 |
| React 组件 | 57 |
| UI 基础组件 (shadcn) | 37 |
| Hooks | 5 |
| 测试文件 | 3 |
| 服务器文件 (仅参考) | 3 |
| 类型声明 | 2 |
| 文档 | 40+ |
| `any` 违规 | **0** |

---

## 1. 构建配置层

> 这些文件控制构建流水线。手动编辑的版本优先。

| # | 文件 | 行数 | 角色 | 状态 |
|---|------|-------|------|--------|
| 1 | `/package.json` | 102 | 依赖清单。`react`/`react-dom` 在 `peerDependencies` 中（平台提供）。Zustand v5、Zod v4、Tailwind v4。 | 清洁 |
| 2 | `/tsconfig.json` | 33 | TypeScript 配置。`strict: true`，路径别名 `@/* -> ./src/*`，目标 ES2022。 | 清洁 |
| 3 | `/vite.config.ts` | 22 | Vite + `@vitejs/plugin-react` + `@tailwindcss/vite`。别名 `@` -> `./src`。 | 清洁 |
| 4 | `/vitest.config.ts` | 35 | Vitest 配置。jsdom 环境，设置文件，覆盖率阈值 (60/50/60/60)。 | 清洁 |
| 5 | `/postcss.config.mjs` | 15 | 空的 PostCSS 配置（Tailwind v4 由 Vite 插件处理）。 | 清洁 |
| 6 | `/index.html` | 15 | HTML 入口。`lang="zh-CN"`，主题色 `#0EA5E9`，加载 `/src/main.tsx`。 | 清洁 |
| 7 | `/public/favicon.svg` | 4 | 宝石蓝 `Y3` 等宽图标，32x32，rx=6。 | 清洁 |

### 关键约束

- `react` / `react-dom` **必须**保留在 `peerDependencies` 中（Figma Make 沙箱提供它们）
- `@tailwindcss/vite` 插件替代基于 PostCSS 的 Tailwind 处理
- `assetsInclude` 仅覆盖 `*.svg` 和 `*.csv`（从不包括 `.css`/`.tsx`/`.ts`）

---

## 2. CSS 管道层

> 单一 Tailwind 入口点。无重复 `@import "tailwindcss"`。

```
main.tsx
  -> @/styles/index.css
       -> ./fonts.css          (Google Fonts: Inter, Fira Code, JetBrains Mono)
       -> ./tailwind.css       (唯一的 @import 'tailwindcss')
       -> ./theme.css          (@theme tokens + :root vars + @layer base/utilities)
```

| # | 文件 | 行数 | 角色 | 状态 |
|---|------|-------|------|--------|
| 8 | `/src/styles/index.css` | 3 | 聚合器：按顺序导入 fonts -> tailwind -> theme。 | 清洁 |
| 9 | `/src/styles/fonts.css` | 1 | Google Fonts `@import url(...)` 用于 Inter、Fira Code、JetBrains Mono。 | 清洁 |
| 10 | `/src/styles/tailwind.css` | 5 | `@import 'tailwindcss' source(none)` + `@source` 指令 + `tw-animate-css`。 | **已修复 P30** |
| 11 | `/src/styles/theme.css` | 261 | 设计令牌（`@theme`）、`:root` 暗色变量、`.light` 覆盖、基础排版、工具类（scanline、glow-text、scrollbar、overlay）。 | **已修复 P30** |

### 第 30 阶段已应用的修复

1. **`tailwind.css`**：添加 `@source not "../server/**"` 以将 `src/server/` 从 Tailwind 扫描中排除（这些文件导入 `express`/`pg`/`ws`，这些在沙箱中未安装）。
2. **`theme.css`**：删除重复的 `@import "tailwindcss"`（导致双重 Tailwind 根 -> CSS 编译失败 -> 级联模块加载错误）。
3. **`App.tsx`**：删除冗余的 `import "@/styles/theme.css"`（已通过 index.css 链导入）。

---

## 3. 入口层

| # | 文件 | 行数 | 角色 | 状态 |
|---|------|-------|------|--------|
| 12 | `/src/main.tsx` | 15 | React 18 根挂载，带有 `StrictMode`。导入 `@/styles/index.css`。 | 清洁 |
| 13 | `/src/vite-env.d.ts` | 58 | Vite 环境类型（`ImportMetaEnv`）+ `figma:asset/*` 模块声明。 | **已修复 P30** |
| 14 | `/src/types/global.d.ts` | 139 | Web Speech API、Local Font Access API、Window 扩展。 | 清洁 |

### 第 30 阶段修复

- **`vite-env.d.ts`**：添加 `declare module 'figma:asset/*'` 以便 TypeScript 解析 `ClaudeWelcome.tsx` 使用的虚拟模块。

---

## 4. 主应用程序

| # | 文件 | 行数 | 角色 | 状态 |
|---|------|-------|------|--------|
| 15 | `/src/app/App.tsx` | 605 | 根组件。`LanguageProvider` 包装器、`ErrorBoundary`、响应式检测、三面板可调整布局（Vercel v0 风格）、7 个视图的 `React.lazy` 代码分割、ChatMode 双模式（导航/AI）、LLM Bridge 流式集成。 | 清洁 |

### App.tsx 架构

```
<LanguageProvider>
  <AppContent>
    <YYC3Background />           -- CSS 背景效果
    <div.scanline />              -- CRT 扫描线覆盖
    <Sidebar />                   -- 左侧导航
    <main>
      <ErrorBoundary>
        <React.Suspense>
          activeView === 'terminal'  -> PanelGroup (Chat + Artifacts)
          activeView === 'console'   -> <ConsoleView /> (lazy)
          activeView === 'monitor'   -> <ServiceHealthMonitor /> (lazy)
          activeView === 'projects'  -> <ProjectsView /> (lazy)
          activeView === 'artifacts' -> <ArtifactsView /> (lazy)
          activeView === 'services'  -> <ServicesView /> (lazy)
          activeView === 'knowledge' -> <KnowledgeBaseView /> (lazy)
          activeView === 'bookmarks' -> <BookmarksView /> (lazy)
        </React.Suspense>
      </ErrorBoundary>
    </main>
    <SettingsModal />             -- 21 标签页设置对话框
  </AppContent>
</LanguageProvider>
```

---

## 5. 聊天组件

| # | 文件 | 角色 | 关键依赖 |
|---|------|------|-----------------|
| 16 | `chat/ChatArea.tsx` | 聊天主区域：输入栏、消息列表、文件附件、提示模板、模式指示器 | SearchPalette、MessageBubble、ClaudeWelcome、store |
| 17 | `chat/ClaudeWelcome.tsx` | 带有 Logo + 快速操作的欢迎屏幕 | `figma:asset/bbf3e3fa...png`（平台虚拟模块） |
| 18 | `chat/MessageBubble.tsx` | 用户/AI 消息气泡，带有代码块高亮 | react-syntax-highlighter (vscDarkPlus) |
| 19 | `chat/ArtifactsPanel.tsx` | 代码预览面板 + 项目导航树 | react-resizable-panels、react-syntax-highlighter |
| 20 | `chat/YYC3Background.tsx` | 来自 localStorage 的动态背景图像/亮度/模糊 | 无（纯 CSS） |

### 关于 `figma:asset` 的说明

`ClaudeWelcome.tsx` 第 5 行导入：

```typescript
import logoImg from "figma:asset/bbf3e3fa0f74d88bf01cb28b236dfeee49fdfab5.png";
```

这是一个在构建时解析的 Figma Make 虚拟模块。如果资产哈希无效，此导入将失败并级联为动态模块加载错误。**隔离测试**：暂时注释掉此导入并使用回退来验证。

---

## 6. 布局、设置、搜索

| # | 文件 | 角色 |
|---|------|------|
| 21 | `layout/Sidebar.tsx` | 左侧边栏：视图导航、会话列表、状态指示器、固定/折叠 |
| 22 | `settings/SettingsModal.tsx` | 21 标签页设置对话框（AI 模型、外观、MCP、持久化等） |
| 23 | `search/SearchPalette.tsx` | Cmd+K 全局搜索面板 |
| 24 | `monitoring/ServiceHealthMonitor.tsx` | 网络监控仪表板视图 |

---

## 7. 视图组件 (React.lazy)

| # | 文件 | 角色 |
|---|------|------|
| 25 | `views/ProjectsView.tsx` | 带有文件树的项目目录浏览器 |
| 26 | `views/ArtifactsView.tsx` | 构建产物日志查看器 |
| 27 | `views/ServicesView.tsx` | 服务注册和管理 |
| 28 | `views/KnowledgeBaseView.tsx` | 知识库 CRUD 接口 |
| 29 | `views/BookmarksView.tsx` | 带有拖放的收藏夹管理器 |

---

## 8. 控制台组件

> 所有组件通过 `ConsoleView.tsx` 加载，该文件本身使用 `React.lazy` 加载重型子面板。

| # | 文件 | 角色 |
|---|------|------|
| 30 | `console/ConsoleView.tsx` | 控制台标签页路由器（20+ 标签页），延迟加载子面板 |
| 31 | `console/ActivityChart.tsx` | 实时活动迷你图（Recharts） |
| 32 | `console/AgentChatInterface.tsx` | 每个代理的聊天，带有 LLM Bridge 流式传输 |
| 33 | `console/AgentIdentityCard.tsx` | 代理双身份角色卡 |
| 34 | `console/AgentOrchestrator.tsx` | 多代理协作 UI |
| 35 | `console/ApiDocsViewer.tsx` | 交互式 API 文档 |
| 36 | `console/ClusterTopology.tsx` | 设备集群拓扑图 |
| 37 | `console/CoreTestPanel.tsx` | 应用内程序化测试运行器 |
| 38 | `console/DatabaseSelector.tsx` | NAS SQLite / localStorage 切换 |
| 39 | `console/DevOpsTerminal.tsx` | DAG 工作流编辑器 + 模板库 |
| 40 | `console/DeviceCardManager.tsx` | 4 节点设备监控卡 |
| 41 | `console/DockerManager.tsx` | Docker 容器管理 |
| 42 | `console/FamilyPresenceBoard.tsx` | 家庭心跳存在板 |
| 43 | `console/KnowledgeBase.tsx` | 知识库面板（控制台嵌入） |
| 44 | `console/LiveLogStream.tsx` | 实时事件总线日志流 |
| 45 | `console/McpServiceBuilder.tsx` | MCP 工具链构建器 |
| 46 | `console/McpWorkflowsView.tsx` | MCP 工作流可视化 |
| 47 | `console/MetricsHistoryDashboard.tsx` | 历史指标图表 |
| 48 | `console/NasDeploymentToolkit.tsx` | NAS 连接性和部署工具 |
| 49 | `console/NasDiagnosticsPanel.tsx` | 启动自诊断 |
| 50 | `console/OllamaManager.tsx` | 本地 Ollama 模型管理 |
| 51 | `console/PersistenceManager.tsx` | 数据持久化快照和导出 |
| 52 | `console/RemoteDockerDeploy.tsx` | 一键远程 Docker 部署 |
| 53 | `console/SettingsView.tsx` | 控制台嵌入式设置 |
| 54 | `console/SmokeTestRunner.tsx` | 25 目标冒烟测试运行器 |
| 55 | `console/StreamDiagnostics.tsx` | LLM 提供商流式传输健康测试 |
| 56 | `console/TestFrameworkRunner.tsx` | 应用内测试框架（NAV-16、I18N-03、21 个标签页） |
| 57 | `console/TokenUsageDashboard.tsx` | Token 使用分析 |
| 58 | `console/WorkflowOrchestrator.tsx` | DAG 工作流执行引擎 |

---

## 9. UI 基础组件 (shadcn/Radix)

> `/src/app/components/ui/` 中的 37 个组件。标准 shadcn 原语。

| 文件 | 组件 |
|------|-----------|
| `accordion.tsx` | Accordion |
| `alert-dialog.tsx` | AlertDialog |
| `alert.tsx` | Alert |
| `aspect-ratio.tsx` | AspectRatio |
| `avatar.tsx` | Avatar |
| `badge.tsx` | Badge |
| `breadcrumb.tsx` | Breadcrumb |
| `button.tsx` | Button |
| `calendar.tsx` | Calendar |
| `card.tsx` | Card |
| `carousel.tsx` | Carousel |
| `chart.tsx` | Chart |
| `checkbox.tsx` | Checkbox |
| `collapsible.tsx` | Collapsible |
| `command.tsx` | Command (cmdk) |
| `context-menu.tsx` | ContextMenu |
| `dialog.tsx` | Dialog |
| `drawer.tsx` | Drawer (vaul) |
| `dropdown-menu.tsx` | DropdownMenu |
| `form.tsx` | Form (react-hook-form) |
| `hover-card.tsx` | HoverCard |
| `input-otp.tsx` | InputOTP |
| `input.tsx` | Input |
| `label.tsx` | Label |
| `menubar.tsx` | Menubar |
| `navigation-menu.tsx` | NavigationMenu |
| `pagination.tsx` | Pagination |
| `popover.tsx` | Popover |
| `progress.tsx` | Progress |
| `radio-group.tsx` | RadioGroup |
| `resizable.tsx` | Resizable |
| `scroll-area.tsx` | ScrollArea |
| `select.tsx` | Select |
| `separator.tsx` | Separator |
| `sheet.tsx` | Sheet |
| `sidebar.tsx` | Sidebar |
| `skeleton.tsx` | Skeleton |
| `slider.tsx` | Slider |
| `sonner.tsx` | Sonner (toast) |
| `switch.tsx` | Switch |
| `table.tsx` | Table |
| `tabs.tsx` | Tabs |
| `textarea.tsx` | Textarea |
| `toggle-group.tsx` | ToggleGroup |
| `toggle.tsx` | Toggle |
| `tooltip.tsx` | Tooltip |
| `use-mobile.ts` | useMobile hook |
| `utils.ts` | cn() utility |

### 受保护文件

- `/src/app/components/figma/ImageWithFallback.tsx` - 平台提供，**请勿修改**。

---

## 10. 核心库层

> 构成智能/数据/协议骨干的重型模块。

| # | 文件 | ~行数 | 角色 |
|---|------|--------|------|
| 59 | `/src/lib/llm-bridge.ts` | 1048 | 7 提供商统一 LLM 接口。SSE 流式传输、断路器、故障转移链、令牌跟踪、`generalStreamChat()`、`agentStreamChat()`。 |
| 60 | `/src/lib/llm-providers.ts` | 大 | 提供商注册表：OpenAI、Anthropic、DeepSeek、Zhipu、Google、Groq、本地（Ollama/LM Studio）。模型目录、API 格式定义、代理路由权重。 |
| 61 | `/src/lib/llm-router.ts` | 大 | 智能 LLM 路由器。健康分数路由（0-100）、3 状态断路器（CLOSED/OPEN/HALF_OPEN）、指数退避、并发负载跟踪。 |
| 62 | `/src/lib/mcp-protocol.ts` | 1326 | MCP JSON-RPC 2.0 层。工具/资源/提示架构、服务注册表、连接管理、离线模拟运行时。 |
| 63 | `/src/lib/agent-orchestrator.ts` | 1427 | 多代理协作。5 种模式（Pipeline/Parallel/Debate/Ensemble/Delegation）、任务分解、DAG 执行、结果聚合、学习循环。 |
| 64 | `/src/lib/persistence-engine.ts` | 830 | 全链持久化。StorageAdapter 接口（策略模式）、LocalStorageAdapter、NasSQLiteAdapter、自动降级、版本化快照、导入/导出。 |
| 65 | `/src/lib/persistence-binding.ts` | 中 | Zustand <-> PersistenceEngine 绑定。`usePersistenceSync()` hook、防抖写入、启动水合、ClusterMetrics 归档（30 秒间隔）。 |
| 66 | `/src/lib/persist-schemas.ts` | 223 | Zod v4 架构：ChatMessage、ChatSession、AgentHistory、Preferences、SystemLog、KnowledgeEntry、LLMProviderConfig、NodeMetrics、MetricsSnapshot。`validateRecord()`、`validateArray()`、域验证器。 |
| 67 | `/src/lib/store.ts` | 大 | Zustand v5 全局状态。导航、布局、聊天、代理历史、设置、系统健康、集群指标、日志、DAG 工作流。 |
| 68 | `/src/lib/types.ts` | 大 | 集中式类型系统。SystemStatus、ViewMode、AgentId、AgentRole、AGENT_REGISTRY、ChatMessage、AgentChatMessage、ChatArtifact、PromptTemplate、DAG 类型、FileAttachment。 |
| 69 | `/src/lib/i18n.tsx` | 中 | LanguageProvider (React Context)。zh/en 翻译、`useTranslation()` hook、`t()` 键查找。 |
| 70 | `/src/lib/event-bus.ts` | 中 | 五维事件总线。类型化发布/订阅、环形缓冲区（500 个事件）、`useEventBus()` hook、`useSyncExternalStore` 集成。 |
| 71 | `/src/lib/nas-client.ts` | 中 | NAS HTTP 客户端。设备注册表（4 个节点）、SQLite 代理、Docker Engine API、网络健康检测、设备配置持久化。 |
| 72 | `/src/lib/crypto.ts` | 中 | Web Crypto API。AES-GCM 256 位加密、PBKDF2 密钥派生、设备固定盐。 |
| 73 | `/src/lib/api.ts` | 中 | REST API 层。当后端不可用时自动降级到 localStorage 模拟。 |
| 74 | `/src/lib/db-schema.ts` | 中 | PostgreSQL 15 架构定义（参考，不在沙箱中执行）。 |
| 75 | `/src/lib/agent-identity.ts` | 中 | 代理身份系统。双身份（主 + 次）、存在状态、情绪状态、每设备端口映射。 |
| 76 | `/src/lib/utils.ts` | 6 | `cn()` = `twMerge(clsx(...))`。 |

---

## 11. 自定义 Hooks

| # | 文件 | 角色 |
|---|------|------|
| 77 | `/src/lib/useWebSocket.ts` | 多端点 WebSocket 客户端。设备配置发现、指数退避重新连接、回退到模拟。 |
| 78 | `/src/lib/useMetricsSimulator.ts` | 4 个硬件节点（M4 Max、iMac M4、MateBook、NAS）的实时指标模拟。 |
| 79 | `/src/lib/useOllamaDiscovery.ts` | Ollama 本地 LLM 自动发现。探测 `/api/tags`、`/api/ps`，自动注册模型。 |
| 80 | `/src/lib/useHeartbeatWebSocket.ts` | 家庭心跳 WebSocket。来自 NAS 中继的实时存在流。 |
| 81 | `/src/lib/useNasDiagnostics.ts` | 启动自诊断。SQLite 代理、Docker API、WebSocket、集群可达性。 |

---

## 12. 测试层

| # | 文件 | 角色 | 测试数量 |
|---|------|------|------------|
| 82 | `/src/lib/__tests__/setup.ts` | Vitest 设置。每次测试前后清除 localStorage。 | - |
| 83 | `/src/lib/__tests__/persist-schemas.test.ts` | Zod 架构验证测试。13 个套件，44 个测试用例（ZOD-01 至 ZOD-44）。 | 44 |
| 84 | `/src/lib/__tests__/core-test-suite.ts` | 应用内程序化测试套件。用于浏览器控制台的 `CoreTestRunner.runAll()`。 | 25+ |

---

## 13. 服务器文件（仅参考）

> 这些文件**不会**在 Figma Make 沙箱中执行。它们作为独立 Express 后端的部署参考存在。

| # | 文件 | 导入（沙箱中未安装） | 角色 |
|---|------|-----------------------------------|------|
| 85 | `/src/server/index.ts` | `express`, `cors`, `pg`, `ws`, `dotenv` | Express 服务器入口点 |
| 86 | `/src/server/routes.ts` | `express`, `pg`, `uuid` | 15 个 REST API 端点 |
| 87 | `/src/server/ws.ts` | `ws`, `pg`, `http` | WebSocket 指标广播 |

### 重要说明

这些文件通过 `tailwind.css` 中的 `@source not "../server/**"` 从 Tailwind 扫描中排除（第 30 阶段修复）。

---

## 14. 手动编辑的文件

> 这些文件由项目所有者手动编辑。助手在修改前**必须读取当前内容**。

| 文件 | 编辑内容 |
|------|----------------|
| `/src/lib/__tests__/setup.ts` | 测试设置逻辑 |
| `/src/lib/__tests__/persist-schemas.test.ts` | Zod 测试用例（44 个测试） |
| `/src/lib/persist-schemas.ts` | Zod 架构 + 验证器 |
| `/docs/execution_summary_v15.md` | 执行摘要内容 |
| `/vitest.config.ts` | 测试配置 |
| `/src/main.tsx` | 入口点导入 |
| `/src/vite-env.d.ts` | 环境类型声明 + figma:asset 模块 |
| `/tsconfig.json` | 编译器选项 |
| `/index.html` | HTML 元数据 + 结构 |
| `/public/favicon.svg` | 品牌图标 |

---

## 15. 第 30 阶段修复摘要

### 修复 1：Tailwind 源排除

**文件**：`/src/styles/tailwind.css`

```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
@source not "../server/**";          /* <-- 已添加 */

@import 'tw-animate-css';
```

**原因**：`@source '../**/*.{js,ts,jsx,tsx}'` 扫描了导入 `express`、`pg`、`ws`（在 Figma Make 沙箱中未安装）的 `src/server/` 文件。这导致 Tailwind/Vite CSS 编译失败，级联为 `TypeError: Failed to fetch dynamically imported module`。

### 修复 2：figma:asset 类型声明

**文件**：`/src/vite-env.d.ts`

```typescript
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}
```

**原因**：`ClaudeWelcome.tsx` 导入 `figma:asset/bbf3e3fa...png`。如果没有此声明，TypeScript 无法解析虚拟模块，可能会破坏 Vite 的模块图并导致构建错误。

### 之前的修复（仍然有效）

- **`theme.css`**：删除重复的 `@import "tailwindcss"`（正在创建双重 Tailwind 根）
- **`App.tsx`**：删除冗余的 `import "@/styles/theme.css"`（已通过 index.css 链导入）

---

## 16. 依赖映射

### 运行时依赖（package.json `dependencies`）

| 类别 | 包 |
|----------|----------|
| UI 框架 | `@radix-ui/*`（19 个包）、`class-variance-authority`、`clsx`、`tailwind-merge`、`tw-animate-css` |
| 状态 | `zustand` ^5.0.11 |
| 验证 | `zod` ^4.3.6 |
| 图表 | `recharts` 2.15.2 |
| 布局 | `react-resizable-panels` 2.1.7 |
| 动画 | `motion` 12.23.24 |
| 图标 | `lucide-react` 0.487.0 |
| 代码显示 | `react-syntax-highlighter` ^16.1.0 |
| 日期 | `date-fns` 3.6.0 |
| 表单 | `react-hook-form` 7.55.0 |
| 提示 | `sonner` 2.0.3 |
| 命令 | `cmdk` 1.1.1 |
| 抽屉 | `vaul` 1.1.2 |
| DnD | `react-dnd` 16.0.1、`react-dnd-html5-backend` 16.0.1 |
| Material UI | `@mui/material` 7.3.5、`@emotion/react`、`@emotion/styled`、`@mui/icons-material` |
| 轮播 | `react-slick` 0.31.0 |
| 砌体 | `react-responsive-masonry` 2.7.1 |
| 日历 | `react-day-picker` 8.10.1 |
| OTP | `input-otp` 1.4.2 |
| 轮播引擎 | `embla-carousel-react` 8.6.0 |
| 主题 | `next-themes` 0.4.6 |
| Popper | `@popperjs/core` 2.11.8、`react-popper` 2.3.0 |

### 开发依赖

| 包 | 版本 | 角色 |
|---------|---------|------|
| `tailwindcss` | 4.1.12 | CSS 框架 |
| `@tailwindcss/vite` | 4.1.12 | Vite 插件 |
| `@vitejs/plugin-react` | 4.7.0 | React Fast Refresh |
| `typescript` | ^5.7.0 | 类型系统 |
| `vite` | 6.3.5 | 构建工具 |
| `vitest` | ^3.2.0 | 测试运行器 |
| `jsdom` | ^25.0.0 | 测试 DOM |
| `@types/react` | ^18.3.0 | React 类型 |
| `@types/react-dom` | ^18.3.0 | ReactDOM 类型 |
| `@types/react-syntax-highlighter` | ^15.5.0 | 高亮器类型 |

### 对等依赖（平台提供）

| 包 | 版本 | 说明 |
|---------|---------|------|
| `react` | 18.3.1 | **请勿移至 dependencies** |
| `react-dom` | 18.3.1 | **请勿移至 dependencies** |

---

## 17. 故障排除检查清单

如果在所有修复后 `TypeError: Failed to fetch dynamically imported module` 仍然存在：

1. **验证 CSS 链**：`index.css` 导入 `tailwind.css`（单个 `@import 'tailwindcss'`），然后导入 `theme.css`（无 tailwindcss 导入）。只有一个 Tailwind 根。
2. **验证服务器排除**：`tailwind.css` 具有 `@source not "../server/**"`。
3. **验证无冗余主题导入**：`App.tsx` 不直接导入 `theme.css`。
4. **隔离 figma:asset**：暂时注释掉 `ClaudeWelcome.tsx` 中的 `import logoImg from "figma:asset/..."` 并用占位符字符串替换。
5. **检查延迟导入**：每个 `React.lazy(() => import('...').then(m => ({ default: m.X })))` 必须匹配目标模块的实际命名导出。
6. **循环依赖检查**：如果可用，运行 `npx madge --circular src/`，或手动验证 lib 模块中无 A->B->A 导入链。
7. **控制台错误**：检查浏览器 DevTools Network 选项卡中块文件的具体 404/500 错误。

---

文档已生成至 /docs/PROJECT_FILE_REGISTRY.md，包含全部 17 个章节：构建配置层、CSS管线层、入口层、主应用、Chat组件、Layout/Settings/Search、View组件、Console组件（29个）、UI基础组件（37个shadcn）、核心Lib层（18个模块含行数和职责）、Hooks层、测试层、Server参考文件、手动编辑文件清单、Phase 30修复摘要、完整依赖地图、以及故障排查清单。

如果 Figma Make 预览中错误仍存在，可按文档第17章的 Troubleshooting Checklist 逐步隔离
后续每个 Phase 结束后可更新此文档的 Quick Stats 和 Fixes Summary 部分保持同步

*由第 30 阶段代码库审计生成。最后更新：2026-02-17。*

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
