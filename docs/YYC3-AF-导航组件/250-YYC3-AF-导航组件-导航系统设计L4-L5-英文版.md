# YYC3 Navigation System Design - Level 4 & Level 5 (The Micro-Universe)

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future**
> *万象归元于云枢 | 深栈智启新纪元*
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**

---

## 🧭 Navigation Deep Dive: From Macro to Nano

While Levels 1-3 handle the structural navigation of the platform, **Level 4 (Resource Units)** and **Level 5 (Detail Properties)** are where the actual operational work occurs. These levels are dynamic, context-sensitive, and data-driven.

### 🟡 Level 4: Resource Units Navigation (The "Nano" View)

**Design Goal**: Provide navigation within a specific collection of resources identified by the Level 3 context.

**Contextual Behavior**:

* **When in L04 AI Intelligence**: Tabs or Cards representing specific Agents (Navigator, Thinker, Oracle).
* **When in L01 Infrastructure**: List or Grid of specific Nodes, Pods, or Clusters.
* **When in L05 Business**: List of active Projects or Workflows.

**UI Pattern**:

* **Split View**: A secondary list panel appearing to the right of the L3 sidebar.
* **Card Grid**: Main content area displays a grid of resource cards (as seen in the current ConsoleView).
* **Search/Filter Bar**: Localized search for this specific resource set.

**Example: AI Intelligence Layer (L4)**

* *Navigation Items*:
    1. **Agent: Navigator** (Status: Idle)
    2. **Agent: Thinker** (Status: Thinking)
    3. **Agent: Oracle** (Status: Offline)
    4. **Vector DB: Main** (Status: Ready)

### 🔴 Level 5: Detail Properties Navigation (The "Pico" View)

**Design Goal**: Deep introspection of a single resource unit selected in Level 4.

**Contextual Behavior**:

* Activated when a specific Resource (e.g., "Agent: Navigator") is clicked.
* Replaces the main content area or opens a slide-over panel.

**UI Pattern**:

* **Internal Tabs**: Located within the resource view.
* **Standard Tabs**:
  * `Overview`: Health, Vital Metrics, Summary.
  * `Config`: YAML/JSON configuration editor.
  * `Logs`: Real-time streaming logs.
  * `Metrics`: Historical performance charts.
  * `Terminal`: SSH/Exec console (for L1/L4 resources).
  * `Trace`: Distributed tracing (for L3/L5 resources).

**Example: Agent: Navigator (L5 View)**

* **Tab 1: Status**: "Current Task: Analyzing Codebase..."
* **Tab 2: Conversation**: Chat history with this agent.
* **Tab 3: Memory**: View RAG context and short-term memory.
* **Tab 4: Settings**: Adjust temperature, model (GPT-4/Claude-3), and prompts.

---

## 🔄 Interaction Flow Example

1. **User Clicks L1 "System"**: Sidebar shows L1-L9 layers.
2. **User Clicks L3 "L01 Infrastructure"**: Main area shows K8s Clusters.
3. **User Clicks L4 "Cluster-Alpha"**: Main area focuses on Cluster-Alpha.
4. **User Clicks L5 "Nodes" Tab**: Views list of nodes in that cluster.
5. **User Clicks Specific Node**: Opens detailed node metrics.

## 🎨 Visual Hierarchy Summary

| Level | Component | Color/Style | Permanence |
| :--- | :--- | :--- | :--- |
| **L1** | Main Sidebar | Glass/Dark | Permanent |
| **L2** | Top Bar | Transparent | Permanent |
| **L3** | Context Sidebar | Layer Colors | Contextual (Arch View) |
| **L4** | Resource List/Grid | Card/Surface | Dynamic |
| **L5** | Detail Tabs | Accent Underline | Dynamic |

---
*Design Date: 2026-02-08 | Status: Design Completed*

# YYC3 分层自治单元导航栏设计 (Layered Autonomous Unit Navigation)

## 🧭 导航架构设计原则

基于 **九层功能架构体系** 与 **五高五标五化** 核心机制，本设计旨在构建一个清晰、高效、可扩展的导航系统，实现对庞大 DevOps 平台的精准掌控。

### 1. 核心原则

* **层级映射 (Mapping)**: 导航结构严格镜像架构层级。
* **全息可视 (Holographic)**: 导航不仅是入口，更是状态监控器（如红点、进度条）。
* **情境感知 (Contextual)**: 根据当前选中的层级，动态展示相关工具与视图。

### 2. 五级导航体系 (Five-Level Navigation System)

#### 🟢 Level 1: 全局功能锚点 (Global Anchors)

*定位：系统左侧一级侧边栏，提供顶级业务域的快速切换。*

| 图标 | 名称 | 对应架构域 | 功能描述 |
| :--- | :--- | :--- | :--- |
| 🏠 | **Home** | Portal | 综合概览与快捷入口 |
| 📊 | **Dashboard** | Visual | 全局关键指标监控 |
| 🤖 | **AI Intelligence** | Layer-04 | 智能体管理与模型训练 |
| 💼 | **Business** | Layer-05 | 项目管理与业务流程 |
| 🗄️ | **Data** | Layer-02 | 数据库管理与存储概览 |
| ⚙️ | **System** | Layer-01/09 | 基础设施与系统设置 |

#### 🔵 Level 2: 功能视图切片 (Functional Perspectives)

*定位：顶部二级标签栏，提供当前上下文的不同维度视图。*

* **📐 Architecture View**: 拓扑结构与层级关系。
* **🔍 Search**: 全局检索与代码搜索。
* **📚 Documentation**: 架构文档与 API 说明。
* **🧪 Testing**: 单元测试与集成测试状态。
* **📈 Monitoring**: 实时性能监控与告警。

#### 🟣 Level 3: 架构层级树 (Architecture Layer Tree)

*定位：左侧二级侧边栏（可折叠），提供九层架构的垂直钻取能力。*

* **Layer-09** System Settings (系统设置)
* **Layer-08** Extension & Evolution (扩展演进)
* **Layer-07** User Interaction (用户交互)
* **Layer-06** App Presentation (应用表现)
* **Layer-05** Business Logic (业务逻辑)
* **Layer-04** AI Intelligence (AI智能)
* **Layer-03** Core Services (核心服务)
* **Layer-02** Data Storage (数据存储)
* **Layer-01** Infrastructure (基础设施)

---
*Design Date: 2026-02-08 | Status: Implementation Ready*

<div align="center">

> **「***YanYuCloudCube***」**
> **「***<admin@0379.email>***」**
> **「***Words Initiate Quadrants, Language Serves as Core for the Future***」**
> **「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」**

</div>
