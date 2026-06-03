---
@file: 256-YYC3-AF-原型交互-可用性测试计划.md
@description: YYC3-AF-原型交互可用性测试计划，用于记录和验证系统可用性测试结果
@author: YanYuCloudCube Team
@version: v2.0.0
@created: 2026-02-15
@updated: 2026-02-17
@status: published
@tags: [原型交互],[可用性测试],[测试计划]
---

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 256-YYC3-AF-原型交互-可用性测试计划

## 概述

本文档详细描述YYC³(YanYuCloudCube)-Family-AI-原型交互-可用性测试计划相关内容，YYC³-Family-AI不仅仅是一个软件系统，而是一个"智能生命体"。它以"五化一体"为法则，以插件化架构为骨骼，以AI能力为灵魂，构建一个能够自我进化、持续学习的智能协同平台。

基于**行业应用开发全生命周期闭环架构**，本文档整合了**YYC3 -π³无边界设计理念**与**大数据技术栈**，为YYC3 Family-π³ Chatbot提供全面的可用性测试框架，确保系统在各种使用场景下的用户体验质量。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景

YYC³(YanYuCloudCube)-Family-AI 本地一站式智能工作平台是一个**完全本地化、一体化、自进化**的智能工作生态系统。它以"五化一体"为法则，以Family-AI为核心，以多机协同为骨架，以NAS存储为基石，构建一个能够学习、积累、生成、迭代的闭环智能平台。

**技术栈概览**：
- **前端框架**：React 18 + TypeScript + Tailwind CSS v4
- **状态管理**：Zustand
- **UI组件库**：Radix UI + Recharts + react-resizable-panels
- **架构模式**：纯前端架构，直接NAS连接，无后端服务器
- **目标平台**：桌面端（主要）、平板、移动端（响应式）

#### 1.2 文档目标
- 规范YYC3 Family-π³ Chatbot的可用性测试流程和标准
- 为测试团队提供详细的测试用例和验收标准
- 确保系统在各种使用场景下的用户体验质量
- 支持持续改进和用户反馈收集闭环

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

### 3. 架构概览

#### 3.1 系统架构

```
App.tsx (LanguageProvider > AppContent)
  |
  +-- YYC3Background ............... z-0, absolute, pointer-events-none
  +-- Sidebar ...................... z-20, hover-expand/pin, mobile drawer
  +-- <main> ....................... z-10, flex-1
  |     |
  |     +-- [terminal view] ....... PanelGroup (resizable)
  |     |     +-- ChatArea ......... Panel order=1, minSize=25
  |     |     +-- PanelResizeHandle  3px blue glow handle
  |     |     +-- ArtifactsPanel ... Panel order=2, collapsible
  |     |
  |     +-- [console view] ........ ConsoleView (20+ lazy-loaded sub-tabs)
  |     +-- [monitor view] ........ ServiceHealthMonitor
  |     +-- [projects view] ....... ProjectsView
  |     +-- [artifacts view] ...... ArtifactsView
  |     +-- [services view] ....... ServicesView
  |     +-- [knowledge view] ...... KnowledgeBaseView
  |     +-- [bookmarks view] ...... BookmarksView
  |
  +-- SettingsModal ................ z-50, Radix Dialog, 7 tabs
  +-- ErrorBoundary ................ wraps <main> content
```

#### 3.2 视图模式枚举

```typescript
type ViewMode = 'terminal' | 'console' | 'projects' | 'artifacts'
             | 'monitor' | 'services' | 'knowledge' | 'bookmarks';
```

### 4. 状态管理与数据流

#### 4.1 Zustand Store (`useSystemStore`)

| 状态切片 | 类型 | 持久化 | 说明 |
|---|---|---|---|
| `activeView` | `ViewMode` | Preferences | 当前顶层视图 |
| `consoleTab` | `string` | Preferences | 活跃的console子标签 |
| `consoleAgent` | `string \| null` | Preferences | AI标签中的活跃代理 |
| `chatMode` | `'navigate' \| 'ai'` | 否（默认：'navigate'） | 聊天输入路由模式 |
| `messages` | `ChatMessage[]` | chat_messages | 主聊天历史 |
| `isStreaming` | `boolean` | 否 | LLM响应进行中 |
| `isArtifactsOpen` | `boolean` | 否 | 右侧面板可见性 |
| `activeArtifact` | `ChatArtifact \| null` | 否 | 正在查看的代码工件 |
| `agentChatHistories` | `Record<string, AgentChatMessage[]>` | agent_messages | 每代理聊天状态 |
| `navFavorites` | `string[]` | 持久化 | ArtifactsPanel收藏项 |
| `isSettingsOpen` | `boolean` | 否 | 设置模态框可见性 |
| `settingsTab` | `string` | 否 | 活跃设置标签 |
| `sidebarCollapsed` | `boolean` | 否 | 侧边栏展开状态 |
| `sidebarPinned` | `boolean` | 否 | 侧边栏固定状态 |
| `isMobile` / `isTablet` | `boolean` | 否 | 响应式断点 |
| `status` / `latency` / `cpuLoad` | 各种 | 否 | 系统健康指标 |
| `clusterMetrics` | `ClusterMetricsSnapshot \| null` | metrics_snapshots | 实时集群数据 |
| `logs` | `LogEntry[]` | system_logs | 滚动100条记录 |

#### 4.2 localStorage键值

| 键 | 内容 | 写入者 |
|---|---|---|
| `yyc3-appearance-config` | JSON：颜色、字体、透明度、阴影等 | SettingsModal > Appearance |
| `yyc3-bg-image` | dataURL（base64 PNG/JPG） | SettingsModal > Appearance |
| `yyc3-models-config` | JSON：ModelConfig[] | SettingsModal > Models |
| `yyc3-llm-provider-config` | JSON：ProviderConfig[] | 从模型配置同步 |
| `yyc3-llm-usage` | JSON：UsageRecord[]（最多1000条） | LLM调用后的trackUsage() |
| 各种持久化键 | 聊天消息、代理历史、日志、指标 | persistence-binding.ts |

#### 4.3 数据流：聊天消息生命周期

```
用户输入文本 -> handleSend() -> onSendMessage(text)
  |
  +-> addMessage(userMsg) -> Zustand store -> React重新渲染
  +-> setIsStreaming(true)
  |
  +-> [chatMode === 'navigate']
  |     +-> matchNavigationIntent(text)
  |     +-> 如果匹配：setTimeout(action, 600ms) + addMessage(aiResponse)
  |     +-> 如果不匹配：addMessage(helpMsg)
  |
  +-> [chatMode === 'ai']
        +-> hasConfiguredProvider() 检查
        +-> 如果false：addMessage(configHintMsg)
        +-> 如果true：
              +-> addMessage(emptyAiPlaceholder)
              +-> generalStreamChat(text, history, onChunk, signal)
              +-> onChunk：accumulated += content -> updateLastAiMessage(accumulated)
              +-> 完成时：trackUsage() + addLog()
              +-> 错误时：updateLastAiMessage(errorMsg)
              +-> finally：setIsStreaming(false)
```

### 5. 测试环境设置

#### 5.1 前置条件

| 项目 | 要求 |
|---|---|
| 浏览器 | Chrome 120+（需要`queryLocalFonts()` API） |
| 屏幕 | 桌面1920x1080（主要），测试768px（平板），375px（移动端） |
| 开发工具 | 控制台打开用于错误监控 |
| localStorage | 全新测试前清空：`localStorage.clear()` |
| 网络 | 可选：本地Ollama实例在`http://localhost:11434` |

#### 5.2 快速重置流程

```javascript
// 在浏览器控制台运行以重置所有状态
localStorage.clear();
location.reload();
```

#### 5.3 状态检查流程

```javascript
// 在浏览器控制台运行以检查当前Zustand状态
// （Zustand stores可通过模块作用域访问）
// 使用React DevTools > Components > AppContent > hooks检查store
```

### 6. 模块测试矩阵

#### 6.1 侧边栏导航

**文件**：`/src/app/components/layout/Sidebar.tsx`
**状态**：`activeView`、`sidebarCollapsed`、`sidebarPinned`、`isMobile`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| SB-01 | 悬停展开（桌面） | 鼠标移到折叠的侧边栏上 | 侧边栏在200ms内从56px展开到224px | P0 |
| SB-02 | 悬停折叠延迟 | 鼠标移开展开的侧边栏 | 侧边栏在300ms延迟后折叠 | P0 |
| SB-03 | 固定侧边栏 | 展开侧边栏 -> 点击固定图标 | 侧边栏保持展开；固定图标以主色高亮 | P1 |
| SB-04 | 取消固定侧边栏 | 点击固定侧边栏上的固定图标 | 侧边栏折叠；恢复悬停行为 | P1 |
| SB-05 | 导航到所有视图 | 点击每个导航项：terminal、console、monitor、projects、artifacts、services、knowledge、bookmarks | `activeView`改变；主内容区域更新；导航项显示激活状态（蓝色左边框+背景） | P0 |
| SB-06 | 新会话按钮 | 点击"+" / "New Session" | `activeView`重置为'terminal'；消息清空；工件面板关闭 | P0 |
| SB-07 | 设置快捷方式 | 点击底部的设置按钮 | SettingsModal打开，'general'标签激活 | P0 |
| SB-08 | GitOps快捷方式 | 点击底部的GitHub图标 | SettingsModal打开，'gitops'标签激活 | P1 |
| SB-09 | 折叠工具提示 | 侧边栏折叠时悬停在导航图标上 | 工具提示标签在每个图标右侧显示 | P2 |
| SB-10 | 移动端汉堡菜单 | 调整到<768px；点击汉堡菜单 | 抽屉从左侧滑入，带有遮罩背景 | P0 |
| SB-11 | 移动端抽屉关闭 | 点击抽屉后面的遮罩区域 | 抽屉关闭 | P0 |
| SB-12 | 移动端导航自动关闭 | 在移动端抽屉中，点击导航项 | 视图改变且抽屉关闭 | P0 |
| SB-13 | 激活状态指示器 | 导航到'console' | Console导航项显示蓝色左边框、主色背景；之前的激活项失去样式 | P1 |

#### 6.2 ChatArea（终端视图）

**文件**：`/src/app/components/chat/ChatArea.tsx`
**状态**：`messages`、`isStreaming`、`isArtifactsOpen`、`chatMode`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| CA-01 | 空状态（欢迎） | 全新加载或新会话 | ClaudeWelcome组件可见，带有logo、3个快速操作按钮 | P0 |
| CA-02 | 发送消息（Enter） | 输入"hello" + 按Enter | 消息出现在聊天中；AI响应跟随；输入清空 | P0 |
| CA-03 | 发送消息（按钮） | 输入"hello" + 点击EXECUTE按钮 | 同CA-02 | P0 |
| CA-04 | Shift+Enter换行 | 输入文本 + Shift+Enter + 更多文本 | 在textarea中插入换行；消息不发送 | P1 |
| CA-05 | 空输入防止 | 空输入时点击EXECUTE | 什么也不发生；按钮应被禁用 | P1 |
| CA-06 | 流式指示器 | 发送任意消息 | "BUSY..."脉冲动画在消息下方出现；EXECUTE按钮禁用 | P0 |
| CA-07 | 新消息自动滚动 | 发送多条消息溢出视口 | 每条消息后聊天区域自动滚动到底部 | P0 |
| CA-08 | 消息保持在视图中 | 发送5+条消息；向上滚动；等待 | 消息保持在原位（不向下滑动或消失） | P0 |
| CA-09 | 搜索栏（Ctrl+K） | 按Ctrl+K（或Mac上的Cmd+K） | SearchPalette打开 | P1 |
| CA-10 | 搜索栏输入 | 在搜索栏中输入 | SearchPalette下拉菜单显示过滤结果 | P1 |
| CA-11 | 文件附件 | 点击回形针图标 -> 选择文件 | 文件作为标签出现在输入区域，带有名称、大小和X按钮 | P1 |
| CA-12 | 文件拖放 | 将文件拖到输入区域 | 放置区域遮罩出现；放置将文件添加到附件 | P1 |
| CA-13 | 移除附件 | 点击附件文件标签上的X | 文件标签从附件列表中移除 | P2 |
| CA-14 | 文件夹上传 | 点击文件夹上传图标 -> 选择文件夹 | 文件夹中的多个文件作为附件标签出现 | P2 |
| CA-15 | 提示模板菜单 | 点击灯泡图标 | 提示模板下拉菜单打开，显示分类模板 | P1 |
| CA-16 | 插入提示模板 | 点击模板项 | 模板文本插入到textarea | P1 |
| CA-17 | 快速选择器（Ctrl+J） | 按Ctrl+J或点击+图标 | 模型/MCP工具选择器下拉菜单打开 | P1 |
| CA-18 | 模型选择插入@ | 点击快速选择器中的"GPT-4o" | `@gpt-4o `插入到textarea；选择器关闭 | P2 |
| CA-19 | MCP工具插入/ | 点击快速选择器中的"Figma MCP" | `/mcp-figma `插入到textarea；选择器关闭 | P2 |
| CA-20 | 语音输入 | 点击麦克风图标（仅Chrome） | 权限提示出现；图标变红并带有脉冲动画；语音转文本开始 | P2 |
| CA-21 | 语音自动停止 | 开始语音输入；等待30秒 | 语音录制自动停止；图标返回默认 | P2 |
| CA-22 | 网络搜索按钮 | 点击地球"Web Search"按钮 | 按钮存在且可点击（功能待定） | P3 |

#### 6.3 聊天模式切换（导航 vs AI）

**文件**：`/src/app/App.tsx`（handleSendMessage）、`/src/app/components/chat/ChatArea.tsx`（切换UI）
**状态**：`chatMode`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| CM-01 | 默认模式为导航 | 全新加载 | 顶部栏显示琥珀色指南针图标 + "Navigate Mode" / "Pilot Mode"标签 | P0 |
| CM-02 | 切换到AI模式 | 点击模式切换按钮 | 按钮变为绿色聊天图标 + "AI Chat"标签；占位符变为"Ask AI anything..." / "Toward AI question..." | P0 |
| CM-03 | 切换回导航 | 再次点击模式切换按钮 | 返回琥珀色指南针 + 原始占位符 | P0 |
| CM-04 | 导航：关键字匹配 | 在导航模式下，输入"dashboard" + Enter | AI响应"Navigated to: Dashboard"；视图切换到console > dashboard | P0 |
| CM-05 | 导航：中文关键字 | 输入"Run Warehouse" + Enter | AI响应"Navigated to: DevOps"；视图切换到console > devops标签 | P0 |
| CM-06 | 导航：代理关键字 | 输入"navigator" + Enter | AI响应"Navigated to: Agent: navigator"；视图切换到console > ai标签，带有navigator代理 | P1 |
| CM-07 | 导航：未知关键字 | 输入"random gibberish" + Enter | AI响应帮助消息，列出可用关键字并建议切换到AI模式 | P0 |
| CM-08 | AI：未配置提供者 | 切换到AI模式；发送任意消息（未设置API密钥） | AI响应警告："No AI provider configured" + 指示到Settings > AI Models | P0 |
| CM-09 | AI：已配置提供者 | 在Settings > Models中配置API密钥；切换到AI模式；发送"Hello" | 空的AI占位符消息出现；流式块实时更新消息；最终响应可见 | P0 |
| CM-10 | AI：流式显示 | 在AI模式下使用有效提供者发送消息 | 消息内容随着块的到达逐字符增长 | P0 |
| CM-11 | AI：中止前一个 | 发送消息A；立即发送消息B | 第一个请求中止（AbortController）；第二个请求继续 | P1 |
| CM-12 | AI：错误处理 | 配置无效的API密钥；在AI模式下发送消息 | 显示错误消息："Request error: ..."，带有故障排除提示 | P1 |
| CM-13 | AI：所有提供者失败 | 配置已关闭提供者的API密钥 | 后备消息："All providers unavailable" | P1 |
| CM-14 | AI：AI模式中的导航 | 在AI模式下，输入"Open dashboard" | 触发仪表板导航且AI尝试响应 | P2 |
| CM-15 | AI：使用跟踪 | 完成成功的AI响应 | localStorage中的`yyc3-llm-usage`包含新的UsageRecord条目 | P2 |
| CM-16 | AI：日志条目 | 在AI模式下发送消息 | Zustand store中的`logs`包含该请求的LLM_BRIDGE条目 | P2 |

#### 6.4 ArtifactsPanel

**文件**：`/src/app/components/chat/ArtifactsPanel.tsx`
**状态**：`isArtifactsOpen`、`activeArtifact`、`navFavorites`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| AP-01 | 切换打开/关闭 | 点击ChatArea顶部栏中的ARTIFACTS按钮 | 面板从右侧展开；调整大小句柄出现 | P0 |
| AP-02 | 切换关闭 | 再次点击ARTIFACTS按钮（或面板中的X） | 面板折叠；调整大小句柄隐藏 | P0 |
| AP-03 | 调整大小句柄拖动 | 拖动聊天和工件之间的蓝色调整大小句柄 | 两个面板按比例调整大小；句柄悬停时发光 | P0 |
| AP-04 | 最小大小强制 | 将调整大小句柄拖到最左侧 | 聊天面板不低于25%宽度；工件不低于30% | P1 |
| AP-05 | 通过拖动折叠 | 将工件面板拖到最小 -> 继续拖动 | 面板折叠到0；`isArtifactsOpen`变为false | P1 |
| AP-06 | 项目导航树 | 打开工件面板（无活动工件） | 两级项目导航树可见："Core Modules"、"Infrastructure"、"AI Agents"等 | P1 |
| AP-07 | 收藏/取消收藏导航项 | 点击导航项上的星形图标 | 项目添加到收藏夹（通过Zustand持久化）；星形图标填充 | P1 |
| AP-08 | 收藏持久化 | 收藏项目 -> 刷新页面 | 重新加载后收藏项目保持收藏状态 | P1 |
| AP-09 | 类别折叠/展开 | 点击导航树中的类别标题 | 类别项目切换可见性 | P2 |
| AP-10 | 代码工件视图 | 从聊天中，点击代码块上的"OPEN_ARTIFACT" | ArtifactsPanel显示带有语言标签的语法高亮代码 | P0 |
| AP-11 | 复制工件代码 | 点击工件视图中的复制按钮 | 代码复制到剪贴板；短暂的对勾反馈 | P1 |
| AP-12 | 下载工件 | 点击下载按钮 | 触发`.txt`文件下载 | P2 |
| AP-13 | 代码/预览切换 | 点击眼睛/代码切换 | 在原始代码和预览之间切换（如果适用） | P2 |

#### 6.5 欢迎屏幕（ClaudeWelcome）

**文件**：`/src/app/components/chat/ClaudeWelcome.tsx`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| WL-01 | Logo显示 | 查看空聊天 | YYC3 logo图像在带有绿色脉冲点的渐变卡片中可见 | P1 |
| WL-02 | 标题国际化 | 在设置中切换语言 | 标题改变："YYC3_OS is ready"（zh）/ "YYC3_OS READY"（en） | P1 |
| WL-03 | 快速操作1 | 点击"Build React Component" | 消息发送到聊天；AI响应跟随 | P0 |
| WL-04 | 快速操作2 | 点击"Deploy Microservice" | 消息发送到聊天；AI响应跟随 | P0 |
| WL-05 | 快速操作3 | 点击"Scan Vulnerabilities" | 消息发送到聊天；AI响应跟随 | P0 |
| WL-06 | 动画 | 加载时观察欢迎屏幕 | fade-in + zoom-in-95动画在700ms内平滑播放 | P2 |

#### 6.6 消息气泡与流式传输

**文件**：`/src/app/components/chat/MessageBubble.tsx`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| MB-01 | 用户消息对齐 | 发送用户消息 | 消息右对齐，带有显示User图标的slate头像 | P0 |
| MB-02 | AI消息对齐 | 接收AI响应 | 消息左对齐，带有彩色代理图标；代理名称 + 角色徽章可见 | P0 |
| MB-03 | 代码块渲染 | AI响应包含` ```python\nprint("hi")\n``` ` | 带有行号、语言标签、复制按钮的语法高亮代码块 | P0 |
| MB-04 | 打开工件按钮 | AI响应中的代码块 | 代码块标题中可见"OPEN_ARTIFACT"按钮；点击打开ArtifactsPanel | P1 |
| MB-05 | 复制代码按钮 | 点击代码块标题中的复制图标 | 代码复制到剪贴板；图标短暂显示对勾 | P1 |
| MB-06 | 内联代码渲染 | AI响应包含`` `variable` `` | 用等宽字体、主色、微妙背景/边框渲染 | P1 |
| MB-07 | 代理角色徽章 | 带有`agentRole: 'architect'`的AI消息 | 代理名称旁边的紫色"ARCHITECT"徽章 | P2 |
| MB-08 | 时间戳显示 | 所有消息 | 标题右侧的10px等宽字体时间戳 | P2 |
| MB-09 | 悬停效果 | 悬停在AI消息上 | 微妙的背景变化，轻微向上平移，边框出现 | P2 |
| MB-10 | 流式空状态 | AI模式；流式传输期间出现空占位符消息 | 空消息气泡可见；内容随着块的到达而增长 | P0 |

#### 6.7 SearchPalette（Ctrl+K）

**文件**：`/src/app/components/search/SearchPalette.tsx`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| SP-01 | 通过快捷方式打开 | 按Ctrl+K（或Cmd+K） | SearchPalette下拉菜单在搜索输入下方打开 | P0 |
| SP-02 | 通过输入焦点打开 | 点击搜索栏并输入文本 | 下拉菜单打开，显示过滤结果 | P0 |
| SP-03 | Escape关闭 | 调色板打开时按Escape | 调色板关闭 | P1 |
| SP-04 | 外部点击关闭 | 点击调色板区域外部 | 调色板关闭 | P1 |
| SP-05 | 终端命令 | 输入命令关键字（例如，"deploy"） | 终端命令条目在结果中带有图标出现 | P1 |
| SP-06 | 导航结果 | 输入"dashboard" | 匹配"dashboard"的Console标签和视图出现 | P1 |
| SP-07 | 空查询 | 空查询打开调色板 | 显示默认类别（Files、Code、Chat、Commands） | P2 |
| SP-08 | 无结果状态 | 输入随机不匹配的文本 | 显示"No results found"消息 | P2 |

#### 6.8 ConsoleView（20+子标签）

**文件**：`/src/app/components/console/ConsoleView.tsx`
**状态**：`consoleTab`、`consoleAgent`

> **注意**：ConsoleView包含20+个延迟加载的子模块。每个子标签是一个单独的测试范围。

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| CV-01 | 默认标签 | 切换到Console视图 | Dashboard标签激活并加载 | P0 |
| CV-02 | 标签切换 | 点击console侧边栏中的每个标签 | 内容区域更新；无闪烁/闪烁；如果延迟则显示加载微调器 | P0 |
| CV-03 | 延迟加载 | 切换到尚未加载的标签 | 加载器微调器短暂出现；组件挂载无错误 | P0 |
| CV-04 | 代理聊天（AI标签） | 导航到AI标签 + 选择代理 | AgentChatInterface加载，带有特定于代理的系统提示 | P1 |
| CV-05 | 代理历史持久化 | 向代理发送消息；切换离开；切换回来 | 该代理的聊天历史保留 | P1 |
| CV-06 | 架构标签 | 打开Architecture标签 | ClusterTopology组件渲染 | P1 |

### 7. 跨领域关注点

#### 7.1 响应式与布局

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| RL-01 | 桌面断点 | 1920x1080 | 所有功能正常；侧边栏悬停展开 | P0 |
| RL-02 | 平板断点 | 768x1024 | 侧边栏变为抽屉；布局调整 | P0 |
| RL-03 | 移动断点 | 375x667 | 抽屉导航；单列布局；触摸优化 | P0 |
| RL-04 | 超宽屏 | 2560x1440 | 内容居中；最大宽度限制 | P1 |
| RL-05 | 窄屏 | 320x568 | 水平滚动最小化；关键功能可访问 | P1 |

#### 7.2 国际化（i18n）

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| I18-01 | 语言切换 | 在Settings > General中切换语言 | 所有UI文本更新；无未翻译文本 | P0 |
| I18-02 | 中文显示 | 切换到中文 | 正确显示中文字符；无乱码 | P0 |
| I18-03 | 英文显示 | 切换到英文 | 正确显示英文文本 | P0 |
| I18-04 | 持久化 | 切换语言后刷新页面 | 语言选择保持 | P1 |

#### 7.3 持久化与恢复

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| PS-01 | 聊天历史持久化 | 发送消息；刷新页面 | 聊天历史恢复 | P0 |
| PS-02 | 设置持久化 | 更改设置；刷新页面 | 设置恢复 | P0 |
| PS-03 | 代理历史持久化 | 向代理发送消息；刷新页面 | 代理聊天历史恢复 | P0 |
| PS-04 | 收藏持久化 | 收藏项目；刷新页面 | 收藏项目保持收藏状态 | P0 |
| PS-05 | 清除数据 | 清除localStorage；刷新页面 | 所有状态重置为默认 | P1 |

#### 7.4 性能

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| PF-01 | 初始加载 | 打开应用 | 在3秒内加载 | P0 |
| PF-02 | 标签切换 | 切换标签 | 在500ms内切换 | P0 |
| PF-03 | 流式响应 | 发送AI消息 | 流式响应无明显延迟 | P0 |
| PF-04 | 大聊天历史 | 加载100+条消息 | 在2秒内加载 | P1 |
| PF-05 | 内存使用 | 长时间使用 | 内存使用稳定 | P1 |

### 8. 已知问题与风险矩阵

#### 8.1 已知问题

| ID | 问题描述 | 严重性 | 状态 | 备注 |
|---|---|---|---|---|
| KN-01 | Chrome语音输入API限制 | 中 | 已知 | 仅Chrome支持`queryLocalFonts()` |
| KN-02 | 移动端性能 | 低 | 已知 | 大型聊天历史可能较慢 |
| KN-03 | 离线模式 | 中 | 已知 | 某些功能需要网络连接 |

#### 8.2 风险矩阵

| 风险 | 概率 | 影响 | 缓解措施 |
|---|---|---|---|
| 浏览器兼容性 | 中 | 高 | 测试主要浏览器 |
| 性能退化 | 低 | 高 | 持续监控 |
| 数据丢失 | 低 | 高 | 定期备份 |

### 9. 回归检查清单

#### 9.1 核心功能

- [ ] 侧边栏导航正常工作
- [ ] 聊天功能正常工作
- [ ] AI集成正常工作
- [ ] 工件面板正常工作
- [ ] 设置正常工作

#### 9.2 UI/UX

- [ ] 响应式布局正常工作
- [ ] 国际化正常工作
- [ ] 动画流畅
- [ ] 无视觉故障

#### 9.3 性能

- [ ] 加载时间可接受
- [ ] 标签切换快速
- [ ] 流式响应流畅
- [ ] 内存使用稳定

#### 9.4 兼容性

- [ ] Chrome正常工作
- [ ] Firefox正常工作
- [ ] Safari正常工作
- [ ] Edge正常工作

### 10. 测试报告模板

#### 10.1 测试执行摘要

| 指标 | 值 |
|---|---|
| 测试用例总数 | XX |
| 通过 | XX |
| 失败 | XX |
| 阻塞 | XX |
| 通过率 | XX% |

#### 10.2 缺陷摘要

| 严重性 | 数量 |
|---|---|
| 严重 | XX |
| 高 | XX |
| 中 | XX |
| 低 | XX |

#### 10.3 建议

- 列出改进建议
- 列出未来功能
- 列出已知限制

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
