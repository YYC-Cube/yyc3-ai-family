---
@file: YYC3-AF-完整设计-Figma-AI提示词.md
@description: YYC³ AI Family 全量完整版 Figma AI 设计提示词
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-03-02
@updated: 2026-03-02
@status: published
@tags: [Figma],[AI提示词],[设计系统],[UI/UX]
---

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ AI Family - 全量完整版 Figma AI 设计提示词

## 📋 目录

- [项目背景与定位](#项目背景与定位)
- [核心设计理念](#核心设计理念)
- [设计系统规范](#设计系统规范)
- [九层架构设计要求](#九层架构设计要求)
- [七大AI智能体设计](#七大ai智能体设计)
- [五级导航体系](#五级导航体系)
- [响应式设计要求](#响应式设计要求)
- [可访问性标准](#可访问性标准)
- [动画与交互规范](#动画与交互规范)
- [数据可视化规范](#数据可视化规范)
- [设计交付物要求](#设计交付物要求)

---

## 项目背景与定位

### 🎯 项目概述

**YYC³ AI Family** 是一个以 **赛博朋克美学** 为核心设计语言的 DevOps 智能平台，遵循"实用为基、效率为积"的理念。该项目是 **纯前端驱动且自用** 的，无后端服务器依赖，直接连接本地 NAS 和 Mac 设备集群作为数据库/存储节点。

**核心理念**: AI 不是工具，而是伙伴。七大智能体如同家庭成员，各司其职、协同共进，共同构建一个智能、高效、温暖的开发环境。

### 📊 项目规模

| 指标 | 数值 | 设计影响 |
|-------|------|---------|
| **组件数量** | 93+ React 组件 | 需要高度模块化和可复用的组件设计 |
| **代码量** | 25,000+ 行代码 | 需要清晰的设计系统和组件库 |
| **AI 智能体** | 7 个个性化智能体 | 每个智能体需要独特的视觉标识和交互风格 |
| **LLM 提供商** | 8 个集成 | 需要统一的模型选择和配置界面 |
| **架构层级** | L01-L09 全部激活 | 九层架构需要清晰的层级导航和信息架构 |
| **控制台标签页** | 19 个功能标签页 | 需要高效的标签页管理和快速切换 |
| **持久化域** | 17 个数据域 | 需要清晰的数据展示和管理界面 |
| **国际化** | 中英文全覆盖 | 需要支持多语言和RTL布局 |

### 🎨 设计语言

```
主题：赛博朋克 / 科幻工业

核心理念：
  - 深空渐变背景 (#0F172A → #1E293B)
  - 霓虹发光效果 (Box Shadow + Text Shadow)
  - 玻璃拟态卡片 (Backdrop Blur + 半透明背景)
  - CRT 扫描线叠加 (线性渐变 + 动画)
  - 高对比度数据展示 (科技蓝 #0EA5E9, 霓虹绿 #22C55E)
```

---

## 核心设计理念

### 五高五标五化 (5H-5S-5M)

#### 🏆 五高 (Five Highs) - 质量基础

| 标识符 | 名称 | 设计要求 |
|------------|------|---------|
| **H1** | **高可用性** | 界面在降级模式下仍可用，关键操作有备用方案 |
| **H2** | **高性能** | 组件懒加载、虚拟滚动、60fps流畅动画 |
| **H3** | **高安全性** | 敏感操作二次确认、权限可视化、安全状态指示 |
| **H4** | **高可扩展性** | 模块化组件、主题系统、插件架构支持 |
| **H5** | **高智能化** | AI 驱动的交互、自适应布局、预测性交互 |

#### 📏 五标 (Five Standards) - 协作语言

| 标识符 | 名称 | 设计要求 |
|------------|------|---------|
| **S1** | **标准化接口** | 统一的组件API、设计令牌系统、命名规范 |
| **S2** | **标准化数据** | 统一的数据格式化、图表规范、加载状态 |
| **S3** | **标准化流程** | 统一的操作流程、错误处理、用户反馈 |
| **S4** | **标准化组件** | 统一的组件库、设计系统文档、Figma组件 |
| **S5** | **标准化文档** | 统一的设计规范、交付物标准、版本管理 |

#### 🔄 五化 (Five Modernizations) - 持续演进

| 标识符 | 名称 | 设计要求 |
|------------|------|---------|
| **M1** | **自动化** | 设计令牌自动同步、组件库自动更新、响应式适配 |
| **M2** | **智能化** | 智能推荐、自适应布局、预测性输入、上下文感知 |
| **M3** | **可视化** | 数据可视化、流程可视化、关系可视化、时间线可视化 |
| **M4** | **模块化** | 原子设计、组件变体、模式库、模板系统 |
| **M5** | **生态化** | 插件系统、API可视化、开发者工具、社区功能 |

---

## 设计系统规范

### 🎨 调色板系统

#### 主色系

```css
/* 主色 - 科技蓝 */
--primary-50: #E0F2FE;
--primary-100: #BAE6FD;
--primary-200: #7DD3FC;
--primary-300: #38BDF8;
--primary-400: #0EA5E9;  /* 主色 */
--primary-500: #0284C7;
--primary-600: #0369A1;
--primary-700: #075985;
--primary-800: #0C4A6E;
--primary-900: #082F49;

/* 次色 - 深紫 */
--secondary-50: #F5F3FF;
--secondary-100: #EDE9FE;
--secondary-200: #DDD6FE;
--secondary-300: #C4B5FD;
--secondary-400: #A78BFA;  /* 次色 */
--secondary-500: #8B5CF6;
--secondary-600: #7C3AED;
--secondary-700: #6D28D9;
--secondary-800: #5B21B6;
--secondary-900: #4C1D95;
```

#### 功能色系

```css
/* 成功 - 霓虹绿 */
--success-50: #F0FDF4;
--success-100: #DCFCE7;
--success-200: #BBF7D0;
--success-300: #86EFAC;
--success-400: #4ADE80;
--success-500: #22C55E;  /* 主色 */
--success-600: #16A34A;
--success-700: #15803D;
--success-800: #166534;
--success-900: #14532D;

/* 警告 - 琥珀色 */
--warning-50: #FFFBEB;
--warning-100: #FEF3C7;
--warning-200: #FDE68A;
--warning-300: #FCD34D;
--warning-400: #FBBF24;
--warning-500: #F59E0B;  /* 主色 */
--warning-600: #D97706;
--warning-700: #B45309;
--warning-800: #92400E;
--warning-900: #78350F;

/* 错误 - 关键红 */
--error-50: #FEF2F2;
--error-100: #FEE2E2;
--error-200: #FECACA;
--error-300: #FCA5A5;
--error-400: #F87171;
--error-500: #EF4444;  /* 主色 */
--error-600: #DC2626;
--error-700: #B91C1C;
--error-800: #991B1B;
--error-900: #7F1D1D;
```

#### 智能体专属色系

```css
/* 工程师 - 琥珀色 */
--agent-engineer: #F59E0B;

/* 设计师 - 蓝色 */
--agent-designer: #0EA5E9;

/* 产品经理 - 紫色 */
--agent-product: #8B5CF6;

/* 测试员 - 粉色 */
--agent-tester: #EC4899;

/* 运维 - 青色 */
--agent-devops: #06B6D4;

/* 安全 - 红色 */
--agent-security: #EF4444;

/* 数据 - 绿色 */
--agent-data: #22C55E;
```

#### 中性色系

```css
/* 背景色系 - 深空渐变 */
--bg-primary: #0F172A;      /* 主背景 */
--bg-secondary: #1E293B;    /* 次级背景 */
--bg-tertiary: #334155;     /* 三级背景 */
--bg-elevated: #475569;     /* 悬浮背景 */

/* 文本色系 */
--text-primary: #F8FAFC;   /* 主文本 */
--text-secondary: #CBD5E1;  /* 次级文本 */
--text-tertiary: #94A3B8;   /* 三级文本 */
--text-muted: #64748B;      /* 弱化文本 */

/* 边框色系 */
--border-light: rgba(255, 255, 255, 0.1);
--border-medium: rgba(255, 255, 255, 0.2);
--border-heavy: rgba(255, 255, 255, 0.3);
```

### 📐 间距系统

```css
/* 8px 网格系统 */
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### 🔤 字体系统

```css
/* 界面字体 - 系统无衬线栈 */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;

/* 代码字体 - 等宽字体 */
--font-mono: "JetBrains Mono", "Fira Code", "SF Mono", 
             "Consolas", "Liberation Mono", monospace;

/* 终端字体 - 等宽字体 */
--font-terminal: "Menlo", "Monaco", "Courier New", monospace;

/* 字号系统 */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px */
--text-5xl: 3rem;     /* 48px */
```

### 🎭 圆角系统

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### ✨ 阴影系统

```css
/* 霓虹发光效果 */
--shadow-neon-blue: 0 0 20px rgba(14, 165, 233, 0.5);
--shadow-neon-green: 0 0 20px rgba(34, 197, 94, 0.5);
--shadow-neon-purple: 0 0 20px rgba(139, 92, 246, 0.5);

/* 玻璃拟态阴影 */
--shadow-glass-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-glass-md: 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-glass-lg: 0 10px 15px rgba(0, 0, 0, 0.3);

/* 悬浮阴影 */
--shadow-float: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
```

### 🌙 玻璃拟态效果

```css
/* 玻璃拟态基础类 */
.glass {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

/* 强玻璃拟态 */
.glass-strong {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 📺 CRT 扫描线效果

```css
/* CRT 扫描线叠加层 */
.crt-scanlines {
  position: relative;
  overflow: hidden;
}

.crt-scanlines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10;
}
```

---

## 九层架构设计要求

### L01 - 基础设施层 (Infrastructure)

#### 🏗️ 基础设施监控仪表盘

**设计要求:**

1. **实时资源监控**
   - CPU使用率：环形进度图 + 实时曲线
   - 内存使用率：进度条 + 详细数据
   - 磁盘使用率：多磁盘饼图
   - 网络流量：双向流量图（上行/下行）

2. **容器状态可视化**
   - 容器网格布局，每个容器显示：
     - 容器名称和图标
     - 状态指示器（运行/停止/重启）
     - 资源使用（CPU/内存）
     - 端口映射
   - 容器详情抽屉

3. **网络拓扑图**
   - 4节点拓扑图（M4 Max, iMac, NAS, MateBook）
   - 节点连接状态可视化
   - 网络流量动态指示
   - 节点健康状态指示

4. **告警中心**
   - 实时告警列表，支持：
     - 严重级别分类（严重/警告/信息）
     - 时间线视图
     - 告警聚合
     - 一键操作（确认/静音/处理）

5. **设计要点:**
   - 使用深色主题，突出数据可视化
   - 实时数据更新动画（但不干扰用户）
   - 复杂关系用网络图可视化
   - 关键指标用大字突出显示
   - 支持时间范围选择（实时/1小时/24小时/7天）

**组件清单:**
- `ClusterTopologyView` - 集群拓扑图
- `ResourceMonitorCard` - 资源监控卡片
- `ContainerGridView` - 容器网格视图
- `NetworkTopologyMap` - 网络拓扑图
- `AlertCenterPanel` - 告警中心面板
- `RealTimeMetricsChart` - 实时指标图表

---

### L02 - 数据存储层 (Persistence)

#### 🗄️ 数据管理界面

**设计要求:**

1. **数据库监控**
   - 查询性能图表（QPS/延迟）
   - 连接池状态（活跃/空闲/最大）
   - 锁状态可视化
   - 慢查询列表

2. **缓存管理**
   - Redis缓存命中率仪表盘
   - 内存使用热力图
   - 键值浏览器（支持搜索/过滤）
   - TTL管理界面

3. **文件管理**
   - NAS文件浏览器（树形导航）
   - 大文件上传进度条
   - 文件预览（图片/视频/文本）
   - 批量操作（选择/移动/删除）

4. **备份恢复**
   - 备份计划配置（定时/触发）
   - 恢复向导（步骤式）
   - 备份历史时间线
   - 存储空间使用统计

5. **设计要点:**
   - 表格数据为主，支持排序/筛选/搜索
   - 复杂操作使用向导式界面
   - 大文件操作显示进度条和预估时间
   - 危险操作（如删除）需要二次确认
   - 批量操作支持选择和多选

**组件清单:**
- `DatabaseMonitorDashboard` - 数据库监控仪表盘
- `CacheManagementPanel` - 缓存管理面板
- `NASFileExplorer` - NAS文件浏览器
- `BackupRestoreWizard` - 备份恢复向导
- `DataMigrationTool` - 数据迁移工具
- `QueryPerformanceChart` - 查询性能图表

---

### L03 - 核心服务层 (Core Services)

#### 🔧 服务管理界面

**设计要求:**

1. **API网关**
   - API路由配置表（路径/方法/目标）
   - 限流配置滑动条
   - 熔断器状态指示器
   - API性能仪表盘

2. **用户认证**
   - 登录/注册表单
   - 权限管理矩阵（角色 vs 权限）
   - 会话管理列表
   - 双因素认证设置

3. **消息队列**
   - 消息查看器（支持搜索/过滤）
   - 重试配置界面
   - 死信队列管理
   - 消息流可视化

4. **日志查看**
   - 结构化日志搜索（支持正则）
   - 日志级别过滤
   - 日志分析图表
   - 日志导出功能

5. **配置中心**
   - 配置编辑器（支持YAML/JSON）
   - 版本历史对比
   - 环境配置切换
   - 配置导入导出

6. **设计要点:**
   - 复杂配置使用分步骤表单
   - 实时数据流使用时间线或日志流展示
   - 状态变化有明确的视觉反馈
   - 支持配置导入导出
   - 提供配置模板和示例

**组件清单:**
- `APIGatewayConfigPanel` - API网关配置面板
- `AuthManagementDashboard` - 认证管理仪表盘
- `MessageQueueViewer` - 消息队列查看器
- `StructuredLogViewer` - 结构化日志查看器
- `ConfigurationEditor` - 配置编辑器
- `HealthCheckMonitor` - 健康检查监控器

---

### L04 - AI智能层 (Artificial Intelligence)

#### 🧠 AI智能体界面

**设计要求:**

1. **7大智能体聊天界面**
   - 每个智能体有独特的视觉风格和对话气泡
   - 智能体头像（SVG图标 + 动态状态）
   - 消息气泡样式（用户/智能体区分）
   - 打字动画和思考状态
   - 消息时间戳和状态指示

2. **模型管理**
   - AI模型列表（8个提供商 + 47个模型）
   - 模型性能对比图表
   - 模型切换配置
   - Token使用统计

3. **提示词工程**
   - 提示词编辑器（支持语法高亮）
   - 提示词模板库
   - 测试工具面板
   - 版本历史对比

4. **知识库管理**
   - 文档上传拖放区
   - 向量检索结果列表
   - 知识图谱可视化
   - 文档标注工具

5. **AI训练监控**
   - 训练进度条
   - 损失曲线图表
   - 评估指标卡片
   - 模型版本管理

6. **设计要点:**
   - 聊天界面区分用户消息和AI消息（左右布局，不同颜色）
   - AI思考状态有加载动画指示
   - 支持Markdown渲染（代码高亮/表格/链接）
   - 支持流式响应（逐字显示）
   - 支持消息操作（复制/编辑/删除/引用）

**组件清单:**
- `AgentChatInterface` - 智能体聊天界面
- `ModelSelectionPanel` - 模型选择面板
- `PromptEditor` - 提示词编辑器
- `KnowledgeBaseManager` - 知识库管理器
- `AITrainingMonitor` - AI训练监控
- `TokenUsageTracker` - Token使用追踪器

---

### L05 - 业务逻辑层 (Business Logic)

#### 💼 业务流程编排

**设计要求:**

1. **DAG工作流编排**
   - 可视化画布（节点拖拽/连线）
   - 节点类型库（任务/条件/并行/子流程）
   - 工作流属性面板
   - 执行监控面板

2. **CI/CD Pipeline**
   - Pipeline可视化（阶段/步骤）
   - 执行状态指示（成功/失败/进行中）
   - 日志流查看器
   - Pipeline配置编辑器

3. **任务调度**
   - 调度任务列表
   - 定时规则配置（Cron表达式）
   - 任务执行历史
   - 任务依赖关系图

4. **业务规则引擎**
   - 规则编辑器（可视化/代码）
   - 规则测试工具
   - 规则激活状态
   - 规则执行日志

5. **设计要点:**
   - 流程可视化使用节点图，支持拖拽和连线
   - 执行状态使用颜色编码（绿色成功/红色失败/黄色进行中）
   - 复杂配置使用分步骤表单或向导
   - 提供模板和示例，降低配置门槛
   - 支持导出和导入工作流配置

**组件清单:**
- `DAGWorkflowCanvas` - DAG工作流画布
- `CICDPipelineView` - CI/CD Pipeline视图
- `TaskSchedulerPanel` - 任务调度面板
- `BusinessRuleEditor` - 业务规则编辑器
- `WorkflowExecutionMonitor` - 工作流执行监控
- `ProcessTemplateLibrary` - 流程模板库

---

### L06 - 应用表现层 (Presentation)

#### 🎨 UI组件库

**设计要求:**

1. **基础组件**
   - Button（按钮）：5种变体（默认/主色/次要/幽灵/链接）
   - Input（输入框）：支持前后缀/验证/清空
   - Select（选择器）：单选/多选/可搜索
   - Checkbox/Radio（单选/复选）
   - Switch（开关）
   - Slider（滑块）
   - Progress（进度条）

2. **数据展示组件**
   - Table（表格）：支持排序/筛选/分页/固定列
   - Card（卡片）：基础/悬浮/玻璃拟态
   - List（列表）：虚拟滚动/分组
   - Tree（树形）：支持拖拽/异步加载
   - Timeline（时间线）

3. **反馈组件**
   - Modal（模态框）：确认/表单/信息
   - Drawer（抽屉）：左/右/上/下
   - Toast（通知）：4种级别（成功/警告/错误/信息）
   - Alert（警告条）：可关闭/图标
   - Loading（加载）：骨架屏/旋转器/进度条

4. **导航组件**
   - Tabs（标签页）：可关闭/可拖拽
   - Breadcrumb（面包屑）
   - Menu（菜单）：下拉/上下文/级联
   - Sidebar（侧边栏）：可折叠/嵌套
   - Pagination（分页）

5. **设计要点:**
   - 所有组件支持深色模式
   - 组件状态变体（默认/悬停/激活/禁用/加载）
   - 统一的hover/active/focus状态
   - 支持自定义主题色
   - 无障碍支持（键盘导航/ARIA属性）

**组件清单:**
- `Button` - 按钮组件
- `Input` - 输入框组件
- `Select` - 选择器组件
- `Table` - 表格组件
- `Card` - 卡片组件
- `Modal` - 模态框组件
- `Toast` - 通知组件
- `Tabs` - 标签页组件
- `Sidebar` - 侧边栏组件
- `Breadcrumb` - 面包屑组件

---

### L07 - 用户交互层 (Interaction)

#### 📱 多模态交互界面

**设计要求:**

1. **语音交互**
   - 语音输入按钮（脉冲动画）
   - 语音波形可视化
   - 语音识别结果实时显示
   - 语音反馈提示

2. **快捷键面板**
   - 快捷键列表（分类显示）
   - 快捷键搜索
   - 自定义快捷键配置
   - 快捷键冲突检测

3. **智能搜索**
   - 全局搜索输入框（Cmd/Ctrl + K）
   - 搜索结果分类（页面/功能/命令）
   - 搜索历史
   - 智能建议

4. **手势操作**
   - 移动端手势引导
   - 手势反馈动画
   - 手势设置面板

5. **设计要点:**
   - 语音输入状态有明显的视觉反馈
   - 快捷键面板支持模糊搜索
   - 搜索结果支持键盘导航
   - 手势操作有引导动画
   - 多模态交互无缝切换

**组件清单:**
- `VoiceInputButton` - 语音输入按钮
- `VoiceWaveformVisualizer` - 语音波形可视化
- `ShortcutPanel` - 快捷键面板
- `GlobalSearchBar` - 全局搜索栏
- `GestureGuide` - 手势引导
- `CommandPalette` - 命令面板

---

### L08 - 扩展演进层 (Evolution)

#### 🔌 插件系统界面

**设计要求:**

1. **插件市场**
   - 插件列表（分类/搜索/排序）
   - 插件详情页（功能/截图/评价）
   - 插件安装/卸载
   - 插件更新提示

2. **插件管理**
   - 已安装插件列表
   - 插件配置面板
   - 插件权限管理
   - 插件启用/禁用

3. **MCP服务器管理**
   - MCP服务器列表
   - 服务器配置编辑器
   - 服务器状态监控
   - 服务器日志查看

4. **自定义开发**
   - 插件开发向导
   - API文档浏览器
   - 代码编辑器（简单版）
   - 测试运行器

5. **设计要点:**
   - 插件列表支持分类和搜索
   - 插件详情页突出核心功能
   - 插件配置使用分步骤表单
   - MCP服务器状态实时更新
   - 开发工具提供模板和示例

**组件清单:**
- `PluginMarketplace` - 插件市场
- `PluginManager` - 插件管理器
- `MCPServerManager` - MCP服务器管理器
- `PluginConfigPanel` - 插件配置面板
- `PluginDevWizard` - 插件开发向导
- `APIDocBrowser` - API文档浏览器

---

### L09 - 系统设置层 (Configuration)

#### ⚙️ 系统设置界面

**设计要求:**

1. **集群配置**
   - 节点管理（添加/删除/编辑）
   - 节点连接测试
   - 节点健康检查配置
   - 负载均衡策略

2. **安全策略**
   - 安全级别选择（1-5级）
   - 密钥管理（添加/删除/轮换）
   - 访问控制策略
   - 审计日志配置

3. **AI模型管理**
   - 模型提供商配置
   - API密钥管理
   - 模型参数调优
   - 模型性能监控

4. **界面设置**
   - 主题切换（深色/浅色/自定义）
   - 字体大小调整
   - 语言切换
   - 布局模式切换

5. **系统信息**
   - 系统概览
   - 版本信息
   - 许可证信息
   - 技术支持

6. **设计要点:**
   - 设置界面使用侧边栏导航
   - 配置项分组显示
   - 复杂配置使用分步骤表单
   - 危险操作需要确认
   - 配置更改即时预览

**组件清单:**
- `ClusterConfigPanel` - 集群配置面板
- `SecurityPolicySettings` - 安全策略设置
- `AIModelManager` - AI模型管理器
- `ThemeSettings` - 主题设置
- `SystemInfoPanel` - 系统信息面板
- `ConfigExportImport` - 配置导出导入

---

## 七大AI智能体设计

### 🤖 智能体设计原则

每个智能体需要：

1. **独特的视觉标识**
   - 专属颜色
   - 独特的图标
   - 个性化的头像

2. **个性化的交互风格**
   - 对话气泡样式
   - 动画效果
   - 语言风格

3. **专属的功能界面**
   - 能力展示区
   - 工作区
   - 历史记录

### 1. 🛠️ 工程师 (Engineer)

**视觉标识:**
- 专属色: #F59E0B (琥珀色)
- 图标: ⚙️ (齿轮)
- 头像: 赛博朋克风格的工程师头像

**对话气泡样式:**
- 背景色: rgba(245, 158, 11, 0.2)
- 边框: 2px solid rgba(245, 158, 11, 0.5)
- 霓虹发光: 0 0 20px rgba(245, 158, 11, 0.3)

**功能界面:**
- 代码编辑器集成
- Git操作面板
- 项目结构树
- 任务看板

**动画效果:**
- 代码输入动画（打字机效果）
- 构建进度动画
- 成功/失败状态切换动画

### 2. 🎨 设计师 (Designer)

**视觉标识:**
- 专属色: #0EA5E9 (科技蓝)
- 图标: 🎨 (调色板)
- 头像: 赛博朋克风格的设计师头像

**对话气泡样式:**
- 背景色: rgba(14, 165, 233, 0.2)
- 边框: 2px solid rgba(14, 165, 233, 0.5)
- 霓虹发光: 0 0 20px rgba(14, 165, 233, 0.3)

**功能界面:**
- 设计稿预览
- 组件库面板
- 色彩选择器
- 原型交互演示

**动画效果:**
- 设计元素淡入淡出
- 色彩渐变动画
- 悬浮微交互

### 3. 📊 数据分析师 (Data Analyst)

**视觉标识:**
- 专属色: #22C55E (霓虹绿)
- 图标: 📊 (图表)
- 头像: 赛博朋克风格的数据分析师头像

**对话气泡样式:**
- 背景色: rgba(34, 197, 94, 0.2)
- 边框: 2px solid rgba(34, 197, 94, 0.5)
- 霓虹发光: 0 0 20px rgba(34, 197, 94, 0.3)

**功能界面:**
- 数据可视化图表
- 数据集管理
- 分析报告
- SQL查询编辑器

**动画效果:**
- 图表动画（增长/变化）
- 数据流可视化
- 统计数字滚动动画

### 4. 🧪 测试员 (Tester)

**视觉标识:**
- 专属色: #EC4899 (粉色)
- 图标: 🧪 (试管)
- 头像: 赛博朋克风格的测试员头像

**对话气泡样式:**
- 背景色: rgba(236, 72, 153, 0.2)
- 边框: 2px solid rgba(236, 72, 153, 0.5)
- 霓虹发光: 0 0 20px rgba(236, 72, 153, 0.3)

**功能界面:**
- 测试用例管理
- 测试执行面板
- Bug跟踪列表
- 测试报告

**动画效果:**
- 测试运行进度动画
- Bug标记动画
- 测试通过/失败状态切换

### 5. 🔐 安全专家 (Security)

**视觉标识:**
- 专属色: #EF4444 (关键红)
- 图标: 🔐 (锁)
- 头像: 赛博朋克风格的安全专家头像

**对话气泡样式:**
- 背景色: rgba(239, 68, 68, 0.2)
- 边框: 2px solid rgba(239, 68, 68, 0.5)
- 霓虹发光: 0 0 20px rgba(239, 68, 68, 0.3)

**功能界面:**
- 安全扫描面板
- 漏洞报告
- 权限审计
- 安全日志

**动画效果:**
- 扫描雷达动画
- 警告闪烁动画
- 安全状态指示器

### 6. 📦 产品经理 (Product Manager)

**视觉标识:**
- 专属色: #8B5CF6 (深紫)
- 图标: 📦 (包裹)
- 头像: 赛博朋克风格的产品经理头像

**对话气泡样式:**
- 背景色: rgba(139, 92, 246, 0.2)
- 边框: 2px solid rgba(139, 92, 246, 0.5)
- 霓虹发光: 0 0 20px rgba(139, 92, 246, 0.3)

**功能界面:**
- 产品看板
- 需求管理
- 迭代规划
- 用户故事地图

**动画效果:**
- 看板卡片拖拽动画
- 需求优先级调整动画
- 里程碑达成动画

### 7. 🚀 运维专家 (DevOps)

**视觉标识:**
- 专属色: #06B6D4 (青色)
- 图标: 🚀 (火箭)
- 头像: 赛博朋克风格的运维专家头像

**对话气泡样式:**
- 背景色: rgba(6, 182, 212, 0.2)
- 边框: 2px solid rgba(6, 182, 212, 0.5)
- 霓虹发光: 0 0 20px rgba(6, 182, 212, 0.3)

**功能界面:**
- 部署流水线
- 监控仪表盘
- 告警中心
- 日志查看器

**动画效果:**
- 流水线执行动画
- 告警脉冲动画
- 系统状态变化动画

---

## 五级导航体系

### 🧭 导航架构

```
Level 1: 主导航
  ├── Dashboard (仪表盘)
  ├── Console (控制台)
  ├── Agents (智能体)
  ├── Analytics (分析)
  └── Settings (设置)

Level 2: 功能导航
  ├── Console
  │   ├── Infrastructure (基础设施)
  │   ├── Database (数据库)
  │   ├── Services (服务)
  │   ├── AI Intelligence (AI智能)
  │   ├── Business Logic (业务逻辑)
  │   └── Extensions (扩展)

Level 3: 页面导航
  ├── Infrastructure
  │   ├── Cluster (集群)
  │   ├── Containers (容器)
  │   ├── Network (网络)
  │   └── Monitoring (监控)
  ├── Database
  │   ├── PostgreSQL (PostgreSQL)
  │   ├── Cache (缓存)
  │   ├── Files (文件)
  │   └── Backup (备份)

Level 4: 组件导航
  ├── Cluster
  │   ├── Topology (拓扑)
  │   ├── Nodes (节点)
  │   └── Metrics (指标)
  ├── Containers
  │   ├── List (列表)
  │   ├── Logs (日志)
  │   └── Resources (资源)

Level 5: 操作导航
  ├── Topology
  │   ├── View (查看)
  │   ├── Edit (编辑)
  │   ├── Config (配置)
  │   └── Actions (操作)
```

### 📍 面包屑设计

```html
<!-- 面包屑组件 -->
<nav class="breadcrumb">
  <a href="/console">Console</a>
  <span class="separator">/</span>
  <a href="/console/infrastructure">Infrastructure</a>
  <span class="separator">/</span>
  <a href="/console/infrastructure/cluster">Cluster</a>
  <span class="separator">/</span>
  <span class="current">Topology</span>
</nav>
```

### 🗂️ 侧边栏设计

**设计要求:**
- 支持折叠/展开
- 支持嵌套菜单
- 活动状态高亮
- 图标 + 文字布局
- 悬停状态反馈

---

## 响应式设计要求

### 📱 断点系统

```css
/* 断点定义 */
--breakpoint-xs: 375px;   /* 小屏手机 */
--breakpoint-sm: 640px;   /* 大屏手机 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 小屏桌面 */
--breakpoint-xl: 1280px;  /* 桌面 */
--breakpoint-2xl: 1536px; /* 大屏桌面 */
--breakpoint-3xl: 1920px; /* 超大屏 */
```

### 📐 布局适配

| 断点 | 布局 | 侧边栏 | 导航 |
|------|------|--------|------|
| **XS (<640px)** | 单列 | 抽屉式 | 底部标签栏 |
| **SM (640-768px)** | 单列 | 抽屉式 | 底部标签栏 |
| **MD (768-1024px)** | 单列 | 抽屉式 | 侧边栏 |
| **LG (1024-1280px)** | 双列 | 侧边栏 | 侧边栏 |
| **XL (1280-1536px)** | 双列 | 侧边栏 | 侧边栏 |
| **2XL (>1536px)** | 三列 | 侧边栏 | 侧边栏 |

### 👆 触摸优化

**触摸目标尺寸:**
- 最小触摸目标: 44x44px
- 推荐触摸目标: 48x48px
- 按钮/链接: 最小高度 44px

**手势操作:**
- 滑动: 切换页面/标签
- 长按: 上下文菜单
- 双指缩放: 缩放图表/图片
- 下拉刷新: 刷新数据

---

## 可访问性标准

### ♿ 无障碍设计

**1. 键盘导航**
- 所有交互元素可通过键盘访问
- Tab顺序符合逻辑
- 焦点状态清晰可见
- 支持快捷键操作

**2. 屏幕阅读器**
- 所有图片有alt文本
- 表单有关联的label
- 使用语义化HTML
- ARIA属性完整

**3. 色彩对比度**
- 文本对比度 ≥ 4.5:1
- 大文本对比度 ≥ 3:1
- 非文本元素对比度 ≥ 3:1
- 不仅依赖颜色传达信息

**4. 字体缩放**
- 支持200%缩放不破坏布局
- 使用相对单位
- 避免固定尺寸

---

## 动画与交互规范

### ✨ 动画时长

```css
/* 动画时长系统 */
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 1000ms;
```

### 🌊 缓动函数

```css
/* 缓动函数 */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 🎯 交互反馈

**Hover状态:**
- 背景色变化
- 边框色变化
- 阴影增强
- 过渡时间: 200ms

**Active状态:**
- 元素下沉效果
- 背景色加深
- 缩放效果 (0.98)

**Focus状态:**
- 蓝色光环
- 2px轮廓
- z-index提升

**Loading状态:**
- 旋转器动画
- 骨架屏
- 进度条

**Disabled状态:**
- 降低不透明度 (0.5)
- 禁用指针事件
- 灰色显示

---

## 数据可视化规范

### 📊 图表类型

**1. 折线图 (Line Chart)**
- 用途: 时间序列数据、趋势分析
- 颜色: 主色渐变
- 交互: 悬停显示数据点、缩放、平移

**2. 柱状图 (Bar Chart)**
- 用途: 分类数据对比
- 颜色: 多色系列
- 交互: 悬停显示数值、点击筛选

**3. 饼图/环形图 (Pie/Donut Chart)**
- 用途: 占比分析
- 颜色: 分类色系
- 交互: 悬停高亮、点击展开

**4. 面积图 (Area Chart)**
- 用途: 数量随时间变化
- 颜色: 渐变填充
- 交互: 悬停显示数据、区域选择

**5. 散点图 (Scatter Plot)**
- 用途: 相关性分析
- 颜色: 分类着色
- 交互: 悬停显示详情、框选

**6. 热力图 (Heatmap)**
- 用途: 密度分析
- 颜色: 色谱渐变
- 交互: 悬停显示数值

**7. 桑基图 (Sankey Diagram)**
- 用途: 流向分析
- 颜色: 流量着色
- 交互: 悬停高亮路径

**8. 树图 (Treemap)**
- 用途: 层级数据
- 颜色: 分类着色
- 交互: 悬停显示详情、点击展开

### 🎨 图表配色

```css
/* 图表色系 */
--chart-color-1: #0EA5E9;  /* 主色 */
--chart-color-2: #8B5CF6;  /* 紫色 */
--chart-color-3: #EC4899;  /* 粉色 */
--chart-color-4: #22C55E;  /* 绿色 */
--chart-color-5: #F59E0B;  /* 琥珀 */
--chart-color-6: #06B6D4;  /* 青色 */
--chart-color-7: #EF4444;  /* 红色 */
--chart-color-8: #6366F1;  /* 靛蓝 */
```

### 📏 图表规范

**1. 坐标轴**
- X轴: 时间/分类标签
- Y轴: 数值刻度
- 网格线: 轻微显示 (透明度 0.1)

**2. 图例**
- 位置: 图表右侧或底部
- 样式: 图标 + 标签
- 交互: 点击显示/隐藏

**3. 提示框**
- 触发: 悬停
- 内容: 数据标签 + 数值
- 样式: 玻璃拟态卡片

**4. 动画**
- 加载: 从左到右
- 数据变化: 平滑过渡
- 持续时间: 300-500ms

---

## 设计交付物要求

### 📦 交付物清单

**1. 设计系统文件**
- Design Tokens (设计令牌)
- Color Palette (调色板)
- Typography System (字体系统)
- Icon Library (图标库)
- Component Library (组件库)

**2. 页面设计稿**
- Desktop (1920x1080)
- Tablet (1024x768)
- Mobile (375x667)
- Dark Mode (深色模式)
- Light Mode (浅色模式)

**3. 交互原型**
- 交互流程图
- 微交互设计
- 动画演示
- 状态转换

**4. 设计规范文档**
- Design System Guide
- Component Documentation
- Interaction Guidelines
- Accessibility Standards

**5. 切图资源**
- SVG图标
- PNG图片 (@1x, @2x, @3x)
- WebP图片
- Lottie动画

### 📝 命名规范

**文件命名:**
- 格式: `Layer-Page-Component-variant`
- 示例: `L01-Infrastructure-Cluster-Topology.figma`

**图层命名:**
- 格式: `Component/Element/State`
- 示例: `Button/Primary/Default`

**变量命名:**
- 格式: `--category-property-modifier`
- 示例: `--color-primary-500`

### 🔍 质量检查清单

**设计质量:**
- [ ] 符合设计系统规范
- [ ] 组件一致性
- [ ] 响应式适配完整
- [ ] 深色模式完整
- [ ] 可访问性标准

**交互质量:**
- [ ] 微交互流畅
- [ ] 状态转换清晰
- [ ] 动画性能良好
- [ ] 错误处理完善
- [ ] 加载状态明确

**文档质量:**
- [ ] 设计系统文档完整
- [ ] 组件文档清晰
- [ ] 交互说明详细
- [ ] 开发规范明确
- [ ] 交付物齐全

---

<div align="center">

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

**YanYuCloudCube Team**
**admin@0379.email**

**让AI成为每个人的良师益友** 🚀✨

</div>
