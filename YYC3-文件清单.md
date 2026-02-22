# YYC3 项目全量文件清单

## 📁 项目全量文件清单

### 🔹 根目录 — 项目配置

文件 简述

- package.json 项目依赖声明，71+ 依赖包（React 18 / Zustand 5 / Tailwind 4 / Recharts / Motion 等）
- tsconfig.json TypeScript 编译配置
- vite.config.ts Vite 6 构建配置
- vitest.config.ts Vitest 测试框架配置
- postcss.config.mjs PostCSS / Tailwind 处理链配置
- index.html SPA 入口 HTML
- ATTRIBUTIONS.md 开源致谢声明
- TRUST_MENTORSHIP_AGREEMENT.md AI Family 导师协议
- extensions.json VSCode 推荐扩展
**🔹 /config/ — 环境与编辑器配置（6 文件）**
文件 简述
- env.development.tsx 开发环境变量模板
- env.example 环境变量示例文件
- env.production 生产环境变量
- editorconfig/main.tsx EditorConfig 规范
- gitignore/main.tsx Git 忽略规则
- npmrc/main.tsx npm 配置
- nvmrc/main.tsx Node 版本锁定
- vscode-extensions.json VSCode 扩展推荐
**🔹 /scripts/ — 运维脚本（3 文件）**
文件 简述
- install-deps.sh 依赖安装脚本
- setup.sh 项目初始化脚本
- verify-env.ts 环境变量校验脚本
**🔹 /guidelines/ — 项目规范（2 文件，手动编辑）**
文件 简述
- Guidelines.md ⚠️ 核心开发规范，记录 Phase 47-51 全部变更日志、P0-P2 待办追踪
- UI-UX.md ⚠️ UI/UX 改进任务清单，涵盖 Agent 聊天、同步状态、移动端、骨架屏、暗色主题等设计规范
**🔹 /src/styles/ — 样式层（4 文件）**
文件 简述
- theme.css ⚠️ 核心主题，赛博朋克 CSS 变量、cyber-shimmer keyframes（Phase 52 新增）
- index.css 全局样式入口
- tailwind.css Tailwind v4 指令文件
- fonts.css 字体导入声明
**🔹 /src/types/ — TypeScript 声明（1 文件）**
文件 简述
global.d.ts 全局类型声明（figma:asset、import.meta.env 扩展等）
**🔹 /src/ — 应用入口（2 文件）**
文件 简述
main.tsx Vite 入口，挂载 React 根节点
vite-env.d.ts Vite 类型引用声明
**🔹 /src/app/ — 主应用**
文件 简述
App.tsx 根组件，7 个主视图 + ComponentErrorBoundary 包裹（Phase 50 改造）
**🔹 /src/app/components/chat/ — 聊天 UI（6 文件）**
文件 简述
- ChatArea.tsx 主聊天区域容器
- MessageBubble.tsx 消息气泡组件（支持 Markdown/代码高亮）
- ArtifactsPanel.tsx 制品面板（代码块/图表渲染）
- ClaudeWelcome.tsx 欢迎界面组件
- SlashCommandEngine.tsx ⚠️ 斜杠命令引擎，40+ 命令注册，支持 NAS/Docker/MCP 操作
- YYC3Background.tsx 赛博朋克粒子背景动画
**🔹 /src/app/components/console/ — 控制台面板（30 文件，核心区域）**
文件 简述 变更阶段
- ConsoleView.tsx ⚠️ 九层蓝图控制台主视图，24 面板 Tab + NAS 状态指示器 Phase 50/52 重度改造
- AgentChatInterface.tsx ⚠️ Agent 聊天界面，LLM 流式集成 + 模板降级 Phase 49
- AgentIdentityCard.tsx 智能体身份卡片，全字段可编辑 Phase 51
- AgentOrchestrator.tsx 智能体编排面板
- ComponentErrorBoundary.tsx ⚠️ 赛博朋克错误边界，Retry/Stack Trace/Compact Phase 50 新建
- ActivityChart.tsx 活动统计图表
- ApiDocsViewer.tsx API 文档查看器
- ClusterTopology.tsx 集群拓扑可视化
**🔹 /src/app/components/console/ — 控制台面板（30 文件，核心区域）**
文件 简述 变更阶段
- CommandCenter.tsx 命令中心面板
- CoreTestPanel.tsx 核心测试运行面板
- DatabaseSelector.tsx 数据库选择器（拖动支持，Phase 52）
- DevOpsTerminal.tsx DevOps 终端模拟器
- DeviceCardManager.tsx NAS 设备卡片管理
- DockerManager.tsx Docker 容器管理面板
- FamilyPresenceBoard.tsx AI Family 成员在线状态看板
- InfraHealthMatrix.tsx 基础设施健康矩阵
- KnowledgeBase.tsx 知识库面板
- LiveLogStream.tsx 实时日志流显示
- McpServiceBuilder.tsx MCP 服务构建器
- McpWorkflowsView.tsx MCP 工作流视图
- MetricsHistoryDashboard.tsx 指标历史仪表盘
- ModeControlPanel.tsx 模式控制面板
- NasDeploymentToolkit.tsx NAS 部署工具包
- NasDiagnosticsPanel.tsx NAS 诊断面板
- NineLayerArchitecture.tsx 九层架构可视化
- OllamaManager.tsx Ollama 模型管理面板
- OperationManual.tsx 运维手册查看器
- OpsScriptGenerator.tsx 运维脚本生成器
- PersistenceManager.tsx 持久化管理器
- PgProxyDeployKit.tsx PostgreSQL 代理部署工具
- RemoteDockerDeploy.tsx 远程 Docker 部署面板
- SecurityAudit.tsx 安全审计面板
**🔹 /src/app/components/console/ — 控制台面板（30 文件，核心区域）**
文件 简述 变更阶段
- SettingsView.tsx 设置入口视图
- SmokeTestRunner.tsx 冒烟测试运行器
- StreamDiagnostics.tsx 流式传输诊断面板
- TelemetryAgentManager.tsx 遥测代理管理器
- TestFrameworkRunner.tsx 测试框架运行器
- TokenUsageDashboard.tsx Token 用量仪表盘
- WorkflowOrchestrator.tsx 工作流编排器 Phase 52 新增
**🔹 /src/app/components/layout/ — 布局组件（2 文件）**
文件 简述
- Sidebar.tsx 侧边栏导航（桌面端）
- MobileNavBar.tsx ⚠️ 移动端底部标签栏，九层蓝图 Tab ID 修复（Phase 52）
**🔹 /src/app/components/monitoring/ — 监控组件（3 文件）**
文件 简述
- HardwareMonitor.tsx ⚠️ M4 Max 硬件监控面板，CPU/GPU/RAM/SSD 实时指标
- NeuralLinkOverlay.tsx ⚠️ 神经链路全屏叠加层，赛博朋克 HUD 效果
- ServiceHealthMonitor.tsx 微服务健康监控
**🔹 /src/app/components/search/ — 搜索组件（1 文件）**
文件 简述
- SearchPalette.tsx 全局搜索面板（Cmd+K 快捷键）
**🔹 /src/app/components/settings/ — 设置组件（1 文件）**
文件 简述
- SettingsModal.tsx ⚠️ 系统设置弹窗，7 个子页面 + 移动端响应式 + 品牌预览同步 + 浮动回顶按钮（Phase 51/52 重度改造）
**🔹 /src/app/components/views/ — 主视图页面（5 文件）**
文件 简述
- ArtifactsView.tsx 制品库视图
- BookmarksView.tsx 书签管理视图
- KnowledgeBaseView.tsx 知识库视图
- ProjectsView.tsx 项目管理视图
- ServicesView.tsx 服务目录视图
**🔹 /src/app/components/ui/ — UI 基础组件库（39 文件）**
文件 简述 状态
- cyber-skeleton.tsx ⚠️ 赛博朋克骨架屏，shimmer 动画 Phase 52 新建
- safe-chart-container.tsx ⚠️ 安全图表容器，ResizeObserver 防护 Phase 52 新建
- scroll-area.tsx ⚠️ ScrollArea，新增 showTrack prop + -webkit-overflow-scrolling: touch Phase 52 改造
- resizable-panels.tsx ⚠️ 自定义可调面板（替代 react-resizable-panels） 自定义实现
- accordion.tsx Radix 手风琴 基础 UI 新增
- alert-dialog.tsx 警告对话框 基础 UI 新增
- alert.tsx 警告提示 基础 UI 新增
- aspect-ratio.tsx 宽高比容器 基础 UI 新增
- avatar.tsx 头像组件 基础 UI 新增
- badge.tsx 徽章标签 基础 UI 新增
- breadcrumb.tsx 面包屑导航 基础 UI 新增
- button.tsx 按钮组件 基础 UI 新增
- calendar.tsx 日历选择器 基础 UI 新增
- card.tsx 卡片容器 基础 UI 新增
- carousel.tsx 轮播组件 基础 UI 新增
- chart.tsx 图表基础组件 基础 UI 新增
- checkbox.tsx 复选框 基础 UI 新增
- collapsible.tsx 折叠面板 基础 UI 新增
- command.tsx 命令面板（cmdk） 基础 UI 新增
- context-menu.tsx 右键菜单 基础 UI 新增
- dialog.tsx 对话框 基础 UI 新增
- drawer.tsx 抽屉面板 基础 UI 新增
- dropdown-menu.tsx 下拉菜单 基础 UI 新增
- form.tsx 表单组件（react-hook-form） 基础 UI 新增
- hover-card.tsx 悬停卡片 基础 UI 新增
- input-otp.tsx OTP 输入框 基础 UI 新增
- input.tsx 输入框 基础 UI 新增
- label.tsx 标签 基础 UI 新增
- menubar.tsx 菜单栏 基础 UI 新增
- navigation-menu.tsx 导航菜单 基础 UI 新增
- pagination.tsx 分页器 基础 UI 新增
- popover.tsx 弹出框 基础 UI 新增
- progress.tsx 进度条 基础 UI 新增
- radio-group.tsx 单选组 基础 UI 新增
- resizable.tsx 原始可调大小组件 基础 UI 新增
- select.tsx 下拉选择 基础 UI 新增
- separator.tsx 分隔线 基础 UI 新增
- sheet.tsx Sheet 面板 基础 UI 新增
- sidebar.tsx 侧边栏基础组件 基础 UI 新增
- skeleton.tsx 原始骨架屏 基础 UI 新增
- slider.tsx 滑块 基础 UI 新增
- sonner.tsx Toast 通知 基础 UI 新增
- switch.tsx 开关 基础 UI 新增
- table.tsx 数据表格 基础 UI 新增
- tabs.tsx 标签页 基础 UI 新增
- textarea.tsx 多行输入框 基础 UI 新增
- toggle-group.tsx 切换组 基础 UI 新增
- toggle.tsx 切换按钮 基础 UI 新增
- tooltip.tsx 工具提示 基础 UI 新增
- use-mobile.ts 移动端检测 Hook 工具 工具
- utils.ts 工具函数（cn 合并类名） 工具
**🔹 /src/app/components/figma/ — Figma 集成（1 文件，受保护）**
文件 简述
- ImageWithFallback.tsx 🔒 图片回退组件（系统保护文件，禁止修改）
🔹 /src/lib/ — 核心库层（22 文件）
文件 简述 状态
- store.ts Zustand 全局 Store，导航/布局/聊天/Agent/设置/系统 全部 actions 核心
- llm-bridge.ts ⚠️ LLM 桥接层，7 Provider 流式调用 + agentStreamChat + Usage 追踪 核心/手动编辑
- agent-orchestrator.ts 智能体编排引擎 核心
- mcp-protocol.ts ⚠️ MCP 协议实现，Server Presets/Tool Schema/executeMCPCall/代码生成 Phase 47 重写
- persistence-engine.ts ⚠️ 持久化引擎，LocalStorage + NAS 双写 + 队列限 + 指数退避 Phase 50 改造
- pg-telemetry-client.ts ⚠️ PostgreSQL 遥测客户端，端口 5433 直连 + 三 Schema 查询 手动编辑
- nas-client.ts NAS 客户端，设备注册表 + SQLite/Docker 配置 核心
- proxy-endpoints.ts ⚠️ 代理端点配置（LLM API 转发路由） 手动编辑
- branding-config.ts 品牌定制配置（Phase 51） Phase 51
- agent-identity.ts 智能体身份定义（7 大 Agent 配置）
- crypto.ts Web Crypto AES-GCM 加密/解密 API Key 核心
- llm-providers.ts LLM Provider 定义（OpenAI/Claude/Gemini/Ollama 等） 核心
- llm-router.ts LLM 路由选择逻辑 核心
- persist-schemas.ts 持久化 Schema 定义 核心
- persistence-binding.ts Store ↔ Persistence 绑定层 核心
- db-schema.ts 数据库 Schema 定义（orchestration/knowledge/telemetry） 核心
- event-bus.ts 全局事件总线 核心
- i18n.tsx 国际化支持 核心
- kb-utils.ts 知识库工具函数 核心
- api.ts API 客户端封装
- types.ts 全局类型定义
- utils.ts 通用工具函数 工具
**🔹 /src/lib/ — 自定义 Hooks（8 文件）**
文件 简述
- useDAGExecutor.ts DAG 有向无环图执行器
- useHeartbeatWebSocket.ts 心跳 WebSocket 连接
- useInfraHealth.ts 基础设施健康检查
- useMetricsSimulator.ts 指标模拟器（开发用）
- useNasDiagnostics.ts NAS 诊断数据采集
- useOllamaDiscovery.ts Ollama 模型自动发现
- useTelemetryStream.ts 遥测数据流订阅 核心
- useWebSocket.ts 通用 WebSocket Hook 核心
**🔹 /src/lib/**tests**/ — 测试文件（8 文件，Phase 48 批量新建）**
文件 简述 用例数
- setup.ts 测试环境初始化（DOM mock / localStorage mock） —
- store.test.ts Zustand Store 全量测试 44
- llm-bridge.test.ts LLM Bridge 测试 20
- persistence-engine.test.ts 持久化引擎测试 36
- nas-client.test.ts NAS 客户端测试 24
- mcp-protocol.test.ts MCP 协议测试 47
- persist-schemas.test.ts Schema 持久化测试 —
- branding-config.test.ts 品牌配置测试（Phase 51） —
core-test-suite.ts 核心测试套件入口 —
**🔹 /src/server/ — 后端服务（3 文件）**
文件 简述
- index.ts Express 服务入口
- routes.ts API 路由定义
- ws.ts WebSocket 服务端
**🔹 /docs/ — 项目文档（37 文件）**
类别 文件数 包含
**架构设计文档** 6 YYC3-Integrated-Architecture-Design*.md, Navigation-System-Design*.md
**设计系统文档** 2 YYC3-Design-System-Colors.md, Typography-Spacing.md
**AI/Agent 文档** 3 YYC3-AI-Agent.md, AI-Knowledge-Base.md, Five-Dimensional-Plan.md
**Phase 总结** 3 Phase-14*.md, Phase-15-16.1*.md
**执行摘要** 17 execution_summary_v2 ~ v17, final.md
**Z.ai 系列** 5 Z.ai.md, Z.ai_IDE.md, Z.ai_Model.md, Z.ai_helper.md, Z.ai_key.md
**运维/测试** 5 LOCAL_SETUP_GUIDE, operations-guide, CORE_TEST_REPORT, USABILITY_TEST_PLAN, env-variables-reference.md
**总览** 3 README.md, project_summary.md, PROJECT_FILE_REGISTRY.md

## 📊 统计摘要

维度 数量
TSX/TS 源文件总计 ~105 个
— UI 基础组件 (/ui/) 39
— 控制台面板 (/console/) 30
— 核心库 (/lib/) 30（含 Hooks + Tests）
— 视图/布局/监控/其他 ~16
**⚠️ 手动编辑文件（修改前必读） 15 个**

- 测试文件 8 个（171+ 用例）
- 文档文件 39 个
- 配置文件 ~12 个
**⚠️ 修改前必须先读取的文件清单（15 个）**
- /guidelines/Guidelines.md
- /guidelines/UI-UX.md
- /src/styles/theme.css
- /src/lib/llm-bridge.ts
- /src/lib/mcp-protocol.ts
- /src/lib/persistence-engine.ts
- /src/lib/pg-telemetry-client.ts
- /src/lib/proxy-endpoints.ts
- /src/app/components/console/ConsoleView.tsx
- /src/app/components/console/ComponentErrorBoundary.tsx
- /src/app/components/console/AgentChatInterface.tsx
- /src/app/components/layout/MobileNavBar.tsx
- /src/app/components/settings/SettingsModal.tsx
- /src/app/components/ui/cyber-skeleton.tsx
- /src/app/components/ui/safe-chart-container.tsx
- /src/app/components/ui/scroll-area.tsx  

这份清单覆盖了项目 全部 150+ 文件，按目录分层、标注变更阶段和手动编辑标记。后续任何 Phase 的工作，都可以此为基线进行增量对比。

---

## -----------------------版本分割线------------------------

---

## （Phase 50 → 51 → 52） 的精确代码文件变更清单，按 Phase 分组，每个文件标注 新增/修改 及具体改动内容

📋 V160 → 当前版本 代码文件变更清单
🔵 Phase 50 — NAS 同步队列优化 + 错误边界

### 文件路径 类型 变更内容

**1** /src/app/components/console/ComponentErrorBoundary.tsx 🆕 新增 赛博朋克风格局部错误边界组件（222 行），支持 Retry/Stack Trace/Compact 模式、componentName 标注、onError 回调

**2** /src/lib/persistence-engine.ts ✏️ 修改 ① 新增 MAX_SYNC_QUEUE_SIZE = 1000 常量；② 新增 enqueue() 私有方法（统一队列管理，超限自动淘汰最旧条目）；③ 新增 scheduleRetry() 指数退避重试（1s→2s→4s→...→60s max）；④ 新增 getSyncStatus() 返回 NAS 状态/待同步数/重试计数/溢出数；⑤ 新增 queue-overflow 事件类型

**3** /src/app/components/console/ConsoleView.tsx ✏️ 修改 ① 头部新增 NAS 同步状态指示器（NAS:OK / NAS:OFF / Q:N / SYNC:N）；② 6 个关键面板包裹 ComponentErrorBoundary（AgentChat / DevOps / TokenUsage / Docker / MCP / StreamDiagnostics / HardwareMonitor）

**4** /src/app/App.tsx ✏️ 修改 ① 导入 ComponentErrorBoundary；② 7 个主视图（Console / Monitor / Projects / Artifacts / Services / Knowledge / Bookmarks）均包裹 ComponentErrorBoundary，各配 onError 回调记录至 console.error

🟣 Phase 51 — 品牌定制 + 智能体卡片全字段编辑

### 文件路径 类型 变更内容

**5** /src/lib/branding-config.ts 🆕 新增 品牌+智能体定制配置模块：BrandingConfig 接口（appName/tagline/version/logoText/logoDataUrl）、AgentCustomConfig 接口（overrides/customAgents）、loadBranding()/saveBranding()、loadAgentCustomConfig()/saveAgentCustomConfig()、getMergedAgents() 合并逻辑、AGENT_COLOR_PRESETS 颜色预设、localStorage 分离存储 logo 大数据

**6** /src/lib/**tests**/branding-config.test.ts 🆕 新增 Phase 51 品牌配置测试套件：BrandingConfig CRUD、logo 存储分离、AgentCustomConfig 持久化、getMergedAgents 合并逻辑、默认降级行为、AGENT_COLOR_PRESETS 结构验证、save 事件派发

**7** /src/app/components/settings/SettingsModal.tsx ✏️ 修改 ① 新增「品牌定制」设置面板（应用名称/标语/版本/Logo 上传/Logo 文字）；② 新增「智能体卡片」设置面板（全字段编辑：名称/角色/描述/颜色/图标、新增/删除自定义 Agent）；③ 跨设置面板品牌预览实时同步（侧边栏 logo/名称随编辑同步更新）；④ 导入 branding-config.ts 全部 API

**8** /src/app/components/console/AgentIdentityCard.tsx ✏️ 修改 智能体身份卡片支持全字段可编辑模式 + 自定义 Agent 增删

**9** /src/app/components/layout/Sidebar.tsx ✏️ 修改 读取 loadBranding() 显示自定义 appName/logoText/tagline，响应品牌配置

变更事件
🟢 Phase 52（Current State）— 响应式 / 骨架屏 / 图表安全 / 滚动优化

# 文件路径 类型 变更内容

**10** /src/app/components/ui/cyber-skeleton.tsx 🆕 新增 赛博朋克骨架屏组件（229 行），5 种 variant：spinner（默认居中）、card（头部+4 卡片网格+内容区）、chart（工具栏+柱状图占位，高度 useMemo 稳定）、table（表头+6 行数据，宽度 useMemo 稳定）、pulse（紧凑脉冲点）；内含 ShimmerBar 子组件 + useStableRandoms Hook

**11** /src/app/components/ui/safe-chart-container.tsx 🆕 新增 安全图表容器（83 行），包裹 Recharts ResponsiveContainer，通过 ResizeObserver 检测容器尺寸 > 0 后才渲染图表，防止 width(-1) height(-1) 错误；支持 minWidth/minHeight/className/style props

**12** /src/app/components/ui/scroll-area.tsx ✏️ 修改 ① 新增 showTrack?: boolean prop（始终显示滚动条轨道，forceMount + bg-white/[0.04]）；② Viewport 添加 style={{ WebkitOverflowScrolling: 'touch' }} 弹性滚动；③ ScrollAreaThumb 颜色改为 bg-primary/30 hover:bg-primary/50 + min-h-[32px]

**13** /src/app/components/layout/MobileNavBar.tsx ✏️ 修改 ① 修复九层蓝图 tab ID（nine_layer_architecture）；② Console 模块 tab 切换包裹 React.startTransition；③ 完善 consoleModules 列表（14 个快捷模块入口）

**14** /src/app/components/console/ConsoleView.tsx ✏️ 修改 ① 导入 CyberSkeleton，全部 24 处 <React.Suspense fallback> 替换为 `<CyberSkeleton variant="card

**15** /src/app/components/console/DatabaseSelector.tsx ✏️ 修改 新增拖动支持（drag interaction）

**16** /src/app/components/settings/SettingsModal.tsx ✏️ 修改 ① 移动端响应式布局（isMobile 检测 → 侧边栏变底部 tab / 全屏面板）；② 所有 7 个子页面 ScrollArea 改为 absolute inset-0 定位策略（修复无法上下滚动）；③ 新增 IntersectionObserver 驱动的浮动"回到顶部"按钮（赛博朋克动画）；④ 导入 ArrowUp 图标

**17** /src/styles/theme.css ✏️ 修改 ① 新增 @keyframes shimmer 动画（translateX -100% → 100%）用于 CyberSkeleton 骨架屏效果

### 📊 变更统计

**维度**   **数量**

- 🆕 新增文件 5 个
- ✏️ 修改文件 12 个
- 总变更文件 17 个
- 新增代码量 ~750 行（新文件）
- 修改涉及行 ~600+ 行（跨 12 个文件）

**🆕 新增文件一览**（5 个）

/src/app/components/console/ComponentErrorBoundary.tsx   — 222 行  (Phase 50)

/src/lib/branding-config.ts                              — ~200 行  (Phase 51)

/src/lib/**tests**/branding-config.test.ts               — ~100 行  (Phase 51)

/src/app/components/ui/cyber-skeleton.tsx                 — 229 行  (Phase 52)

/src/app/components/ui/safe-chart-container.tsx           — 83 行   (Phase 52)

**✏️ 修改文件一览**（12 个）

- /src/lib/persistence-engine.ts                           (Phase 50) — 队列上限+退避+getSyncStatus
- /src/app/components/console/ConsoleView.tsx              (Phase 50+52) — ErrorBoundary+NAS指示器+CyberSkeleton+startTransition
- /src/app/App.tsx                                         (Phase 50) — 7视图ErrorBoundary包裹
- /src/app/components/settings/SettingsModal.tsx            (Phase 51+52) — 品牌定制+Agent编辑+移动端响应式+滚动修复+回顶按钮
- /src/app/components/console/AgentIdentityCard.tsx         (Phase 51) — 全字段可编辑
- /src/app/components/layout/Sidebar.tsx                   (Phase 51) — 品牌配置读取
- /src/app/components/ui/scroll-area.tsx                   (Phase 52) — showTrack+touch滚动+thumb样式
- /src/app/components/layout/MobileNavBar.tsx              (Phase 52) — tab ID修复+startTransition
- /src/app/components/console/DatabaseSelector.tsx          (Phase 52) — 拖动支持
- /src/styles/theme.css                                    (Phase 52) — shimmer keyframes

**⚠️ 融合注意事项**

SettingsModal.tsx 是跨两个 Phase（51+52）的重度修改文件，融合时请以当前版本为准，它包含品牌定制 + 移动端响应式 + 滚动修复 + 回顶按钮四层改动

ConsoleView.tsx 同样跨 Phase 50+52 修改，ErrorBoundary 包裹 + CyberSkeleton 替换 + startTransition 三层叠加

branding-config.ts 是 Phase 51 全新依赖，SettingsModal 和 Sidebar 都依赖它，融合时需确保此文件先到位

scroll-area.tsx 的 showTrack prop 是 SettingsModal 滚动修复的前置依赖

safe-chart-container.tsx 替换了所有 ResponsiveContainer 的直接使用，涉及多个图表面板

---
