# YYC3  -- 可用性测试计划 v2.0

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future**
> *万象归元于云枢 | 深栈智启新纪元*
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**

---

> **日期：** 2026-02-15
> **平台：** React 18 + TypeScript + Tailwind CSS v4 + Zustand + Radix UI + Recharts + react-resizable-panels
> **架构：** 纯前端，直接 NAS 连接，无后端服务器
> **目标：** 桌面（主要）、平板、移动端（响应式）

---

## 目录

1. [架构概览](#1-架构概览)
2. [状态管理与数据流](#2-状态管理与数据流)
3. [测试环境设置](#3-测试环境设置)
4. [模块测试矩阵](#4-模块测试矩阵)
   - 4.1 侧边栏导航
   - 4.2 ChatArea（终端视图）
   - 4.3 聊天模式切换（导航 vs AI）
   - 4.4 ArtifactsPanel
   - 4.5 欢迎屏幕（ClaudeWelcome）
   - 4.6 消息气泡与流式传输
   - 4.7 SearchPalette（Ctrl+K）
   - 4.8 ConsoleView（20+ 子标签页）
   - 4.9 ServiceHealthMonitor
   - 4.10 ProjectsView
   - 4.11 ArtifactsView
   - 4.12 ServicesView
   - 4.13 KnowledgeBaseView
   - 4.14 BookmarksView
   - 4.15 SettingsModal（7 个标签页）
   - 4.16 YYC3Background（自定义背景）
   - 4.17 持久化与恢复
   - 4.18 i18n（国际化）
   - 4.19 响应式与布局
   - 4.20 LLM 桥接集成
5. [跨领域关注点](#5-跨领域关注点)
6. [已知问题与风险矩阵](#6-已知问题与风险矩阵)
7. [回归检查清单](#7-回归检查清单)

---

## 1. 架构概览

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

### 视图模式枚举

```typescript
type ViewMode = 'terminal' | 'console' | 'projects' | 'artifacts'
             | 'monitor' | 'services' | 'knowledge' | 'bookmarks';
```

---

## 2. 状态管理与数据流

### Zustand Store (`useSystemStore`)

| 状态片段 | 类型 | 持久化 | 备注 |
|---|---|---|---|
| `activeView` | `ViewMode` | Preferences | 当前顶层视图 |
| `consoleTab` | `string` | Preferences | 活跃的控制台子标签页 |
| `consoleAgent` | `string \| null` | Preferences | AI 标签页中的活跃智能体 |
| `chatMode` | `'navigate' \| 'ai'` | 否（默认：'navigate'） | 聊天输入路由模式 |
| `messages` | `ChatMessage[]` | chat_messages | 主聊天历史 |
| `isStreaming` | `boolean` | 否 | LLM 响应进行中 |
| `isArtifactsOpen` | `boolean` | 否 | 右侧面板可见性 |
| `activeArtifact` | `ChatArtifact \| null` | 否 | 正在查看的代码工件 |
| `agentChatHistories` | `Record<string, AgentChatMessage[]>` | agent_messages | 每个智能体的聊天状态 |
| `navFavorites` | `string[]` | 持久化 | ArtifactsPanel 收藏项 |
| `isSettingsOpen` | `boolean` | 否 | 设置模态框可见性 |
| `settingsTab` | `string` | 否 | 活跃的设置标签页 |
| `sidebarCollapsed` | `boolean` | 否 | 侧边栏展开状态 |
| `sidebarPinned` | `boolean` | 否 | 侧边栏固定状态 |
| `isMobile` / `isTablet` | `boolean` | 否 | 响应式断点 |
| `status` / `latency` / `cpuLoad` | 各种 | 否 | 系统健康指标 |
| `clusterMetrics` | `ClusterMetricsSnapshot \| null` | metrics_snapshots | 实时集群数据 |
| `logs` | `LogEntry[]` | system_logs | 滚动 100 条记录 |

### localStorage 键

| 键 | 内容 | 写入者 |
|---|---|---|
| `yyc3-appearance-config` | JSON: colors, fonts, opacity, shadow, etc. | SettingsModal > Appearance |
| `yyc3-bg-image` | dataURL (base64 PNG/JPG) | SettingsModal > Appearance |
| `yyc3-models-config` | JSON: ModelConfig[] | SettingsModal > Models |
| `yyc3-llm-provider-config` | JSON: ProviderConfig[] | 从模型配置同步 |
| `yyc3-llm-usage` | JSON: UsageRecord[] (max 1000) | trackUsage() 在 LLM 调用后 |
| 各种持久化键 | 聊天消息、智能体历史、日志、指标 | persistence-binding.ts |

### 数据流：聊天消息生命周期

```
用户输入文本 -> handleSend() -> onSendMessage(text)
  |
  +-> addMessage(userMsg) -> Zustand store -> React 重新渲染
  +-> setIsStreaming(true)
  |
  +-> [chatMode === 'navigate']
  |     +-> matchNavigationIntent(text)
  |     +-> 如果匹配：setTimeout(action, 600ms) + addMessage(aiResponse)
  |     +-> 如果不匹配：addMessage(helpMsg)
  |
  +-> [chatMode === 'ai']
        +-> hasConfiguredProvider() 检查
        +-> 如果 false：addMessage(configHintMsg)
        +-> 如果 true：
              +-> addMessage(emptyAiPlaceholder)
              +-> generalStreamChat(text, history, onChunk, signal)
              +-> onChunk: accumulated += content -> updateLastAiMessage(accumulated)
              +-> 完成时：trackUsage() + addLog()
              +-> 错误时：updateLastAiMessage(errorMsg)
              +-> finally: setIsStreaming(false)
```

---

## 3. 测试环境设置

### 前置条件

| 项目 | 要求 |
|---|---|
| 浏览器 | Chrome 120+（`queryLocalFonts()` API 必需） |
| 屏幕 | 桌面 1920x1080（主要），测试 768px（平板）、375px（移动端） |
| DevTools | 控制台打开用于错误监控 |
| localStorage | 全新测试前清除：`localStorage.clear()` |
| 网络 | 可选：本地 Ollama 实例在 `http://localhost:11434` |

### 快速重置程序

```javascript
// 在浏览器控制台运行以重置所有状态
localStorage.clear();
location.reload();
```

### 检查状态程序

```javascript
// 在浏览器控制台运行以检查当前 Zustand 状态
// (Zustand stores 可通过模块作用域访问)
// 使用 React DevTools > Components > AppContent > hooks 检查 store
```

---

## 4. 模块测试矩阵

---

### 4.1 侧边栏导航

**文件：** `/src/app/components/layout/Sidebar.tsx`
**状态：** `activeView`, `sidebarCollapsed`, `sidebarPinned`, `isMobile`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| SB-01 | 悬停展开（桌面） | 鼠标移到折叠的侧边栏上 | 侧边栏在 200ms 内从 56px 展开到 224px | P0 |
| SB-02 | 悬停折叠延迟 | 鼠标移开展开的侧边栏 | 侧边栏在 300ms 延迟后折叠 | P0 |
| SB-03 | 固定侧边栏 | 展开侧边栏 -> 点击固定图标 | 侧边栏保持展开；固定图标以主色高亮 | P1 |
| SB-04 | 取消固定侧边栏 | 点击固定侧边栏上的固定图标 | 侧边栏折叠；恢复悬停行为 | P1 |
| SB-05 | 导航到所有视图 | 点击每个导航项：terminal, console, monitor, projects, artifacts, services, knowledge, bookmarks | `activeView` 更改；主内容区域更新；导航项显示活动状态（蓝色左边框 + 背景） | P0 |
| SB-06 | 新会话按钮 | 点击 "+" / "New Session" | `activeView` 重置为 'terminal'；消息清除；工件面板关闭 | P0 |
| SB-07 | 设置快捷方式 | 点击底部的设置按钮 | SettingsModal 打开并激活 'general' 标签页 | P0 |
| SB-08 | GitOps 快捷方式 | 点击底部的 GitHub 图标 | SettingsModal 打开并激活 'gitops' 标签页 | P1 |
| SB-09 | 折叠工具提示 | 侧边栏折叠时悬停在导航图标上 | 每个图标右侧显示工具提示标签 | P2 |
| SB-10 | 移动端汉堡菜单 | 调整到 <768px；点击汉堡菜单 | 抽屉从左侧滑入并带有覆盖背景 | P0 |
| SB-11 | 移动端抽屉关闭 | 点击抽屉背后的覆盖区域 | 抽屉关闭 | P0 |
| SB-12 | 移动端导航自动关闭 | 在移动端抽屉中，点击导航项 | 视图更改且抽屉关闭 | P0 |
| SB-13 | 活动状态指示器 | 导航到 'console' | Console 导航项显示蓝色左边框、主色背景；之前的活动项失去样式 | P1 |

---

### 4.2 ChatArea（终端视图）

**文件：** `/src/app/components/chat/ChatArea.tsx`
**状态：** `messages`, `isStreaming`, `isArtifactsOpen`, `chatMode`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| CA-01 | 空状态（欢迎） | 全新加载或新会话 | ClaudeWelcome 组件可见，带有 logo、3 个快速操作按钮 | P0 |
| CA-02 | 发送消息（Enter） | 输入 "hello" + 按 Enter | 消息出现在聊天中；AI 响应跟随；输入清除 | P0 |
| CA-03 | 发送消息（按钮） | 输入 "hello" + 点击 EXECUTE 按钮 | 同 CA-02 | P0 |
| CA-04 | Shift+Enter 换行 | 输入文本 + Shift+Enter + 更多文本 | 在 textarea 中插入换行；消息不发送 | P1 |
| CA-05 | 空发送预防 | 输入为空时点击 EXECUTE | 无任何操作；按钮应禁用 | P1 |
| CA-06 | 流式传输指示器 | 发送任何消息 | "BUSY..." 脉冲动画出现在消息下方；EXECUTE 按钮禁用 | P0 |
| CA-07 | 新消息自动滚动 | 发送多条消息以溢出视口 | 每条消息后聊天区域自动滚动到底部 | P0 |
| CA-08 | 消息持久显示 | 发送 5+ 条消息；向上滚动；等待 | 消息保持原位（不向下滑动或消失） | P0 |
| CA-09 | 搜索栏（Ctrl+K） | 按 Ctrl+K（或 Mac 上的 Cmd+K） | SearchPalette 打开 | P1 |
| CA-10 | 搜索栏输入 | 在搜索栏中输入 | SearchPalette 下拉菜单出现并显示过滤结果 | P1 |
| CA-11 | 文件附件 | 点击回形针图标 -> 选择文件 | 文件作为标签出现在输入区域，带有名称、大小和 X 按钮 | P1 |
| CA-12 | 文件拖放 | 将文件拖到输入区域上方 | 放置区域覆盖层出现；放置时将文件添加到附件 | P1 |
| CA-13 | 移除附件 | 点击附加文件标签上的 X | 文件标签从附件列表中移除 | P2 |
| CA-14 | 文件夹上传 | 点击文件夹上传图标 -> 选择文件夹 | 文件夹中的多个文件作为附件标签出现 | P2 |
| CA-15 | 提示模板菜单 | 点击灯泡图标 | 提示模板下拉菜单打开，显示分类模板 | P1 |
| CA-16 | 插入提示模板 | 点击模板项 | 模板文本插入到 textarea | P1 |
| CA-17 | 快速选择器（Ctrl+J） | 按 Ctrl+J 或点击 + 图标 | 模型/MCP 工具选择器下拉菜单打开 | P1 |
| CA-18 | 模型选择插入 @ | 在快速选择器中点击 "GPT-4o" | `@gpt-4o ` 插入到 textarea；选择器关闭 | P2 |
| CA-19 | MCP 工具插入 / | 在快速选择器中点击 "Figma MCP" | `/mcp-figma ` 插入到 textarea；选择器关闭 | P2 |
| CA-20 | 语音输入 | 点击麦克风图标（仅 Chrome） | 出现权限提示；图标变为红色并带有脉冲动画；语音转文本开始 | P2 |
| CA-21 | 语音自动停止 | 开始语音输入；等待 30 秒 | 语音录制自动停止；图标恢复默认 | P2 |
| CA-22 | 网络搜索按钮 | 点击地球 "Web Search" 按钮 | 按钮存在且可点击（功能待定） | P3 |

---

### 4.3 聊天模式切换（导航 vs AI）

**文件：** `/src/app/App.tsx` (handleSendMessage), `/src/app/components/chat/ChatArea.tsx` (toggle UI)
**状态：** `chatMode`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| CM-01 | 默认模式为导航 | 全新加载 | 顶部栏显示琥珀色指南针图标 + "Navigate Mode" / "Pilot Mode" 标签 | P0 |
| CM-02 | 切换到 AI 模式 | 点击模式切换按钮 | 按钮变为绿色聊天图标 + "AI Chat" 标签；占位符更改为 "Ask AI anything..." / "Toward AI question..." | P0 |
| CM-03 | 切换回导航 | 再次点击模式切换按钮 | 返回琥珀色指南针 + 原始占位符 | P0 |
| CM-04 | 导航：关键字匹配 | 在导航模式下，输入 "dashboard" + Enter | AI 响应 "Navigated to: Dashboard"；视图切换到 console > dashboard | P0 |
| CM-05 | 导航：中文关键字 | 输入 "Run Warehouse" + Enter | AI 响应 "Navigated to: DevOps"；视图切换到 console > devops 标签页 | P0 |
| CM-06 | 导航：智能体关键字 | 输入 "navigator" + Enter | AI 响应 "Navigated to: Agent: navigator"；视图切换到 console > ai 标签页并选择 navigator 智能体 | P1 |
| CM-07 | 导航：未知关键字 | 输入 "random gibberish" + Enter | AI 响应帮助消息，列出可用关键字并建议切换到 AI 模式 | P0 |
| CM-08 | AI：未配置提供商 | 切换到 AI 模式；发送任何消息（未设置 API 密钥） | AI 响应警告："No AI provider configured" + 指示到设置 > AI 模型 | P0 |
| CM-09 | AI：已配置提供商 | 在设置 > 模型中配置 API 密钥；切换到 AI 模式；发送 "Hello" | 出现空的 AI 占位符消息；流式传输块实时更新消息；最终响应可见 | P0 |
| CM-10 | AI：流式传输显示 | 在 AI 模式下使用有效提供商发送消息 | 消息内容随着块到达逐字符增长 | P0 |
| CM-11 | AI：中止前一个 | 发送消息 A；立即发送消息 B | 第一个请求中止（AbortController）；第二个请求继续 | P1 |
| CM-12 | AI：错误处理 | 配置无效 API 密钥；在 AI 模式下发送消息 | 显示错误消息："Request error: ..." 并带有故障排除提示 | P1 |
| CM-13 | AI：所有提供商失败 | 配置已关闭提供商的 API 密钥 | 回退消息："All providers unavailable" | P1 |
| CM-14 | AI：AI 模式下的导航 | 在 AI 模式下，输入 "Open dashboard" | 仪表板导航触发且 AI 尝试响应 | P2 |
| CM-15 | AI：使用跟踪 | 完成成功的 AI 响应 | localStorage 中的 `yyc3-llm-usage` 包含新的 UsageRecord 条目 | P2 |
| CM-16 | AI：日志条目 | 在 AI 模式下发送消息 | Zustand store 中的 `logs` 包含该请求的 LLM_BRIDGE 条目 | P2 |

---

### 4.4 ArtifactsPanel

**文件：** `/src/app/components/chat/ArtifactsPanel.tsx`
**状态：** `isArtifactsOpen`, `activeArtifact`, `navFavorites`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| AP-01 | 切换打开/关闭 | 点击 ChatArea 顶部栏的 ARTIFACTS 按钮 | 面板从右侧展开；出现调整大小手柄 | P0 |
| AP-02 | 切换关闭 | 再次点击 ARTIFACTS 按钮（或面板中的 X） | 面板折叠；调整大小手柄隐藏 | P0 |
| AP-03 | 调整大小手柄拖动 | 拖动聊天和工件之间的蓝色调整大小手柄 | 两个面板按比例调整大小；手柄悬停时发光 | P0 |
| AP-04 | 最小尺寸强制 | 将调整大小手柄拖动到最左侧 | 聊天面板不低于 25% 宽度；工件不低于 30% | P1 |
| AP-05 | 通过拖动折叠 | 将工件面板拖动到最小 -> 继续拖动 | 面板折叠到 0；`isArtifactsOpen` 变为 false | P1 |
| AP-06 | 项目导航树 | 打开工件面板（无活动工件） | 可见两级项目导航树："Core Modules"、"Infrastructure"、"AI Agents" 等 | P1 |
| AP-07 | 收藏/取消收藏导航项 | 点击导航项上的星形图标 | 项目添加到收藏夹（通过 Zustand 持久化）；星形图标填充 | P1 |
| AP-08 | 收藏持久化 | 收藏项目 -> 刷新页面 | 重新加载后收藏项目保持收藏状态 | P1 |
| AP-09 | 类别折叠/展开 | 点击导航树中的类别标题 | 类别项目切换可见性 | P2 |
| AP-10 | 代码工件视图 | 从聊天中，点击代码块上的 "OPEN_ARTIFACT" | ArtifactsPanel 显示带有语言标签的语法高亮代码 | P0 |
| AP-11 | 复制工件代码 | 点击工件视图中的复制按钮 | 代码复制到剪贴板；短暂的对勾反馈 | P1 |
| AP-12 | 下载工件 | 点击下载按钮 | 触发 `.txt` 文件下载 | P2 |
| AP-13 | 代码/预览切换 | 点击眼睛/代码切换 | 在原始代码和预览之间切换（如果适用） | P2 |

---

### 4.5 欢迎屏幕（ClaudeWelcome）

**文件：** `/src/app/components/chat/ClaudeWelcome.tsx`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| WL-01 | Logo 显示 | 查看空聊天 | YYC3 logo 图像在带有绿色脉冲点的渐变卡片中可见 | P1 |
| WL-02 | 标题国际化 | 在设置中切换语言 | 标题更改："YYC3_OS is ready" (zh) / "YYC3_OS READY" (en) | P1 |
| WL-03 | 快速操作 1 | 点击 "Build React Component" | 消息发送到聊天；AI 响应跟随 | P0 |
| WL-04 | 快速操作 2 | 点击 "Deploy Microservice" | 消息发送到聊天；AI 响应跟随 | P0 |
| WL-05 | 快速操作 3 | 点击 "Scan Vulnerabilities" | 消息发送到聊天；AI 响应跟随 | P0 |
| WL-06 | 动画 | 加载时观察欢迎屏幕 | fade-in + zoom-in-95 动画在 700ms 内平滑播放 | P2 |

---

### 4.6 消息气泡与流式传输

**文件：** `/src/app/components/chat/MessageBubble.tsx`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| MB-01 | 用户消息对齐 | 发送用户消息 | 消息右对齐，带有显示用户图标的 slate 头像 | P0 |
| MB-02 | AI 消息对齐 | 接收 AI 响应 | 消息左对齐，带有彩色智能体图标；智能体名称 + 角色徽章可见 | P0 |
| MB-03 | 代码块渲染 | AI 响应包含 ` ```python\nprint("hi")\n``` ` | 带有行号、语言标签、复制按钮的语法高亮代码块 | P0 |
| MB-04 | 打开工件按钮 | AI 响应中的代码块 | "OPEN_ARTIFACT" 按钮在代码块标题中可见；点击打开 ArtifactsPanel | P1 |
| MB-05 | 复制代码按钮 | 点击代码块标题中的复制图标 | 代码复制到剪贴板；图标短暂显示对勾 | P1 |
| MB-06 | 内联代码渲染 | AI 响应包含 `` `variable` `` | 使用等宽字体、主色、微妙背景/边框渲染 | P1 |
| MB-07 | 智能体角色徽章 | 带有 `agentRole: 'architect'` 的 AI 消息 | 智能体名称旁边的紫色 "ARCHITECT" 徽章 | P2 |
| MB-08 | 时间戳显示 | 所有消息 | 标题右侧 10px 等宽字体中的时间戳 | P2 |
| MB-09 | 悬停效果 | 悬停在 AI 消息上 | 微妙的背景变化、轻微向上平移、边框出现 | P2 |
| MB-10 | 流式传输空状态 | AI 模式；流式传输期间出现空的占位符消息 | 空消息气泡可见；内容随着块到达而增长 | P0 |

---

### 4.7 SearchPalette（Ctrl+K）

**文件：** `/src/app/components/search/SearchPalette.tsx`

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| SP-01 | 通过快捷键打开 | 按 Ctrl+K（或 Cmd+K） | SearchPalette 下拉菜单在搜索输入下方打开 | P0 |
| SP-02 | 通过输入焦点打开 | 点击搜索栏并输入文本 | 下拉菜单打开并显示过滤结果 | P0 |
| SP-03 | 按 Escape 关闭 | 调色板打开时按 Escape | 调色板关闭 | P1 |
| SP-04 | 点击外部关闭 | 点击调色板区域外部 | 调色板关闭 | P1 |
| SP-05 | 终端命令 | 输入命令关键字（例如，"deploy"） | 终端命令条目在结果中带有图标出现 | P1 |
| SP-06 | 导航结果 | 输入 "dashboard" | 匹配 "dashboard" 的控制台标签页和视图出现 | P1 |
| SP-07 | 空查询 | 使用空查询打开调色板 | 显示默认类别（文件、代码、聊天、命令） | P2 |
| SP-08 | 无结果状态 | 输入随机不匹配的文本 | 显示 "No results found" 消息 | P2 |

---

### 4.8 ConsoleView（20+ 子标签页）

**文件：** `/src/app/components/console/ConsoleView.tsx`
**状态：** `consoleTab`, `consoleAgent`

> **注意：** ConsoleView 包含 20+ 个延迟加载的子模块。每个子标签页是一个单独的测试范围。

| ID | 测试用例 | 步骤 | 预期结果 | 优先级 |
|---|---|---|---|---|
| CV-01 | 默认标签页 | 切换到控制台视图 | 仪表板标签页活动并加载 | P0 |
| CV-02 | 标签页切换 | 点击控制台侧边栏中的每个标签页 | 内容区域更新；无闪烁/闪烁；如果延迟则出现加载旋转器 | P0 |
| CV-03 | 延迟加载 | 切换到尚未加载的标签页 | 加载旋转器短暂出现；组件无错误挂载 | P0 |
| CV-04 | 智能体聊天（AI 标签页） | 导航到 AI 标签页 + 选择智能体 | AgentChatInterface 加载并带有智能体特定的系统提示 | P1 |
| CV-05 | 智能体历史持久化 | 向智能体发送消息；切换离开；切换回 | 该智能体的聊天历史保留 | P1 |
| CV-06 | 架构标签页 | 打开架构标签页 | ClusterTopology 组件渲染 | P1 |
