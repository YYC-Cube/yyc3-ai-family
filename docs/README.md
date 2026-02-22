# YYC3 Hacker Chatbot - Cyberpunk DevOps Intelligence Platform

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future**
> *万象归元于云枢 | 深栈智启新纪元*
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**

---

```
   ██╗   ██╗██╗   ██╗ ██████╗██████╗     ███████╗  █████╗  ███╗   ███╗ ██╗  ██╗    ██╗   ██╗
   ╚██╗ ██╔╝╚██╗ ██╔╝██╔════╝╚════██╗    ██╔════╝ ██╔══██╗ ████╗ ████║ ██║  ██║    ╚██╗ ██╔╝
    ╚████╔╝  ╚████╔╝ ██║      █████╔╝    █████╗   ███████║ ██╔████╔██║ ██║  ██║     ╚████╔╝
     ╚██╔╝    ╚██╔╝  ██║      ╚═══██╗    ██╔══╝   ██╔══██║ ██║╚██╔╝██║ ██║  ██║      ╚██╔╝
      ██║      ██║   ╚██████╗██████╔╝    ██║      ██║  ██║ ██║ ╚═╝ ██║ ██║  ███████╗  ██║
      ╚═╝      ╚═╝    ╚═════╝╚═════╝     ╚═╝      ╚═╝  ╚═╝ ╚═╝     ╚═╝ ╚═╝  ╚══════╝  ╚═╝
```

> **YanYuCloudCube** | 言启象限 | 语枢未来
> 万象归元于云枢 | 深栈智启新纪元
> *All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Philosophy & Design System](#2-core-philosophy--design-system)
3. [Nine-Layer Architecture](#3-nine-layer-architecture)
4. [Hardware Cluster Topology](#4-hardware-cluster-topology)
5. [Technology Stack](#5-technology-stack)
6. [Feature Modules](#6-feature-modules)
7. [Seven AI Agents](#7-seven-ai-agents)
8. [Five-Level Navigation](#8-five-level-navigation)
9. [Phase 1-24 Evolution](#9-phase-1-24-evolution)
10. [Project Structure](#10-project-structure)
11. [Data Persistence Strategy](#11-data-persistence-strategy)
12. [API & Documentation](#12-api--documentation)
13. [Getting Started](#13-getting-started)
14. [Testing Framework](#14-testing-framework)

---

## 1. Project Overview

**YYC3 AI-Family** is a DevOps intelligence platform designed with **Cyberpunk aesthetics** as the core design language, following the philosophy of "practicality as the foundation, efficiency as the accumulation." The project is **purely frontend-driven and self-used**, with no backend server dependency, directly connecting to a local NAS and Mac device cluster as the database/storage nodes.

### Positioning & Mission

| Dimension | Description |
|-----------|-------------|
| **Core Positioning** | Personal DevOps intelligence command center, integrating AI multi-agents, CI/CD orchestration, and cluster monitoring |
| **Design Language** | Cyberpunk + modern minimalism fusion, CRT scanlines, glassmorphism, neon glow |
| **Architecture Philosophy** | Nine-layer functional architecture + five-level hierarchical autonomous unit navigation |
| **Drive Mode** | Pure frontend SPA, WebSocket/SSE real-time data streams, localStorage persistence + PostgreSQL ready |
| **User Scale** | Purely self-used (Single-Tenant), targeting internal development scenarios within the YYC3 Family |

### Core Metrics

- **Components**: 50+ React components (35+ console tabs)
- **Code Volume**: 25,000+ LOC (TypeScript/TSX)
- **AI Agents**: 7 personalized agents with dual identity system
- **LLM Providers**: 8 integrated (OpenAI, Anthropic, DeepSeek, Zhipu, Google, Groq, Ollama, LM Studio)
- **Architecture Layers**: L01-L09 fully active
- **Completed Phases**: Phase 24/24
- **Console Tabs**: 19 functional tabs
- **Persist Domains**: 17 data domains
- **MCP Servers**: 5 preset + custom registry
- **i18n**: Chinese/English full coverage

---

## 2. Core Philosophy & Design System

### 2.1 五高五标五化 (5H-5S-5M)

YYC3's core quality system permeates the entire architecture design:

#### 五高 (Five Highs) - Quality Foundation

| Identifier | Name | Implementation |
|------------|------|----------------|
| H1 | **High Availability** | WebSocket degradation strategy, ErrorBoundary global capture, simulation engine auto-switch |
| H2 | **High Performance** | React.lazy lazy loading, Zustand atomic selectors, virtual scrolling log streams |
| H3 | **High Security** | Level 5 security level simulation, Sentinel Agent auditing, permission degradation mechanism |
| H4 | **High Scalability** | Nine-layer decoupled architecture, plugin system (Extensions), custom MCP templates |
| H5 | **High Intelligence** | Seven AI Agent collaboration, intent parsing navigation, voice recognition integration |

#### 五标 (Five Standards) - Collaboration Language

| Identifier | Name | Implementation |
|------------|------|----------------|
| S1 | **Standardized Interfaces** | TypeScript strict typing, REST API layer (api.ts), WebSocket message protocol |
| S2 | **Standardized Data** | PostgreSQL Schema (db-schema.ts), Zustand Store unified state tree |
| S3 | **Standardized Processes** | DAG workflow orchestrator, CI/CD Pipeline visualization |
| S4 | **Standardized Components** | shadcn/ui + Radix primitives, design token system (theme.css) |
| S5 | **Standardized Documentation** | 13 phase documents, architecture design document, execution summary |

#### 五化 (Five Modernizations) - Continuous Evolution

| Identifier | Name | Implementation |
|------------|------|----------------|
| M1 | **Automation** | MCP template one-click application, Pipeline auto-build, DAG auto-orchestration |
| M2 | **Intelligence** | Agent intent parsing, voice interaction, trend prediction (Prophet) |
| M3 | **Visualization** | Cluster topology map, real-time metric charts, DAG visualization canvas |
| M4 | **Containerization** | Docker container status monitoring, image management, service orchestration |
| M5 | **Ecosystem** | Plugin management platform (8 presets), MCP server integration, extension evolution layer |

### 2.2 Design System

```
Theme: Cyberpunk / Sci-Fi Industrial

Color Palette:
  - Primary:    #0EA5E9 (Tech Blue / 科技蓝)
  - Background: #0F172A → #1E293B (Deep Space Gradient)
  - Success:    #22C55E (Neon Green)
  - Warning:    #F59E0B (Amber Alert)
  - Error:      #EF4444 (Critical Red)
  - Agent Specific Colors: Amber / Blue / Purple / Pink / Cyan / Red / Green

Typography:
  - Interface:  System Sans Stack (-apple-system, "Segoe UI", Roboto)
  - Code:  JetBrains Mono / Fira Code
  - Terminal:  Monospace

Visual Effects:
  - CRT scanline overlay
  - Glassmorphism cards
  - Neon glow text
  - Micro-interaction animations (Motion/Framer Motion)
  - Deep space gradient background
```

---

## 3. Nine-Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│              L09 系统设置层 (Configuration)           │  ← 全局配置中枢
├─────────────────────────────────────────────────────┤
│              L08 扩展演进层 (Evolution)               │  ← 插件生态 + 前沿技术
├─────────────────────────────────────────────────────┤
│              L07 用户交互层 (Interaction)             │  ← 全渠道触达
├─────────────────────────────────────────────────────┤
│              L06 应用表现层 (Presentation)            │  ← UI/UX 渲染
├─────────────────────────────────────────────────────┤
│              L05 业务逻辑层 (Business Logic)          │  ← 核心业务流
├─────────────────────────────────────────────────────┤
│              L04 AI 智能层 (Artificial Intelligence)  │  ← 7 Agent + 模型池
├─────────────────────────────────────────────────────┤
│              L03 核心服务层 (Core Services)           │  ← API + 认证 + 调度
├─────────────────────────────────────────────────────┤
│              L02 数据存储层 (Persistence)             │  ← DB + Cache + Search
├─────────────────────────────────────────────────────┤
│              L01 基础设施层 (Infrastructure)          │  ← 硬件 + 容器 + 网络
└─────────────────────────────────────────────────────┘
```

### Layer State Matrix

| Layer | Name | Frontend Implementation | Core Components | Status |
|-------|------|-----------------------|-----------------|--------|
| L09 | 系统设置层 | SettingsView + SettingsModal | 集群配置、安全策略、AI 模型管理 | ACTIVE |
| L08 | 扩展演进层 | Extensions 页面 | 8 预设插件、自研插件、分类过滤 | ACTIVE |
| L07 | 用户交互层 | ChatArea + Voice + QuickSelector | 语音识别、快捷键、搜索面板 | ACTIVE |
| L06 | 应用表现层 | 全组件 UI 层 | shadcn/ui、Tailwind v4、Motion | ACTIVE |
| L05 | 业务逻辑层 | Store + API | Zustand 状态树、REST API 层 | ACTIVE |
| L04 | AI 智能层 | AgentChatInterface | 7 Agent、模型池 (47 models)、GLM-4 | ACTIVE |
| L03 | 核心服务层 | api.ts + WebSocket | REST 接口、WS 实时通信、健康检查 | ACTIVE |
| L02 | 数据存储层 | DatabaseSelector + db-schema | PostgreSQL Schema、11 DB 选择器 | ACTIVE |
| L01 | 基础设施层 | ClusterTopology + Metrics | 4 节点拓扑、实时指标模拟 | ACTIVE |

---

## 4. Hardware Cluster Topology

```
                    ┌─────────────────────────┐
                    │   YYC3 Cluster Network   │
                    │      192.168.3.x/24      │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
   ┌────┴────┐            ┌──────┴──────┐           ┌────┴────┐
   │ M4 Max  │            │ YanYuCloud  │           │ iMac M4 │
   │ (Main)  │◄──────────►│    NAS      │◄─────────►│ (Aux)   │
   └────┬────┘            └──────┬──────┘           └────┬────┘
        │                        │                        │
        │                   ┌────┴────┐                   │
        │                   │MateBook │                   │
        └──────────────────►│ (Edge)  │◄──────────────────┘
                            └─────────┘
```

| Node | Device | Role | Core Configuration | Network Address |
|------|--------|------|--------------------|-----------------|
| **M4-Max** | MacBook Pro M4 Max | Orchestrator (主力) | M4 Max (16P+40E), 128GB, 4TB | localhost |
| **iMac-M4** | iMac M4 | Visual/Auxiliary | M4 (10P+10E), 32GB, 2TB | LAN |
| **YanYuCloud** | 铁威马 F4-423 NAS | Data Center | Intel Quad, 32GB, 32TB HDD + 4TB SSD, RAID6 | 192.168.3.45:9898 |
| **MateBook** | 华为 MateBook X Pro | Edge/Test (Standby) | Intel 12th, 32GB, 1TB | LAN |

---

## 5. Technology Stack

### 5.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | Strict Mode | Type Safety |
| Tailwind CSS | v4.1.12 | Atomic Styles |
| Vite | 6.3.5 | Build Tool |
| Zustand | ^5.0.11 | Global State Management |

### 5.2 UI Component Library

| Technology | Purpose |
|------------|---------|
| Radix UI | Accessibility Primitives (20+ primitives) |
| shadcn/ui | Pre-built Components (40+ components) |
| Lucide React | Icon System (0.487.0) |
| Motion | Animation Engine |
| Recharts | Data Visualization Charts |
| React DnD | Drag-and-Drop Interaction (DAG Orchestration) |
| React Resizable Panels | Panel Split Layout |
| React Syntax Highlighter | Code Syntax Highlighting |

### 5.3 Infrastructure

| Technology | Purpose |
|------------|---------|
| WebSocket | Real-time Bidirectional Communication (ws://localhost:3001) |
| Web Speech API | Voice Recognition (Chinese Continuous Mode) |
| localStorage | Frontend Persistence (Templates, Models, Plugins, DB Connections) |
| PostgreSQL 15 | Database Schema Ready (db-schema.ts) |
| Express/Fastify | Backend API Service (Optional Integration) |

---

## 6. Feature Modules

### 6.1 Terminal Control (Terminal View)

**ChatArea** - Main Interaction Interface
- AI Dialog Streaming Response (Typewriter Effect)
- Message Bubbles (Markdown Parsing + Code Highlighting)
- Voice Input (Web Speech API, Chinese Continuous Recognition, 30-second Timeout)
- Quick Selector ("+" Popup, Keyboard Shortcut Prompts)
- Global Search Panel (Ctrl+K / Cmd+K)
- Artifacts Panel Sidebar (Code Preview + Rendering)

**ClaudeWelcome** - Welcome Guide
- Animated Card Entry
- Quick Action Buttons

### 6.2 System Console (Console View)

Five-tab Architecture:

| Tab | Component | Function |
|-----|-----------|----------|
| **Total Control** | ClusterTopology + ActivityChart + LiveLogStream | Cluster Topology Map, CPU Utilization Real-time Chart, Kernel Log Stream |
| **Healing Center** | AgentChatInterface (x7) | 7 AI Agent Independent Chat Interfaces, History Persistence |
| **Architecture Overview** | Nine-layer Architecture Visualization | L01-L09 Full Display, Status Indicators |
| **DevOps** | DevOpsTerminal | 5 Sub-tabs: Pipeline / Containers / MCP Templates / DAG / Terminal |
| **System Settings** | SettingsView | Cluster Configuration, Interface Settings, Security Policies |

### 6.3 DevOps Terminal (DevOpsTerminal)

| Sub-tab | Function |
|---------|----------|
| **Pipeline** | CI/CD Pipeline Visualization (Build → Test → Security → Deploy → Notify), Real-time Status |
| **Containers** | Docker Container List, CPU/MEM Monitoring, Start/Stop Operations |
| **MCP Templates** | MCP Server Configuration Template Library (Figma MCP Top Preset), One-click Copy Application, Custom Edit Persistence |
| **DAG Orchestrator** | Visual Workflow Orchestrator, Drag-and-Drop Node Creation, SVG Connections, 9 Node Types |
| **Terminal** | Simulated Bash Terminal, Command Parsing (ls, cd, help, git) |

### 6.4 Project Management (Projects View)

- Panel Group Layout
- Project List (6 Preset Projects)
- File Tree Browser
- Project Status Indicators (active/archived/development)

### 6.5 Artifact Management (Artifacts View)

- Artifact List (Categories: react/api/config/script/doc)
- Preview Panel
- Tagging System
- Favorite Functionality

### 6.6 Service Health Monitoring (Service Health Monitor)

- Real-time Health Metrics (Uptime, Latency, Requests, Errors)
- Service Cards (API Gateway, Auth, Storage, Network, Security, Analytics)
- Security Audit Logs

### 6.7 Global Settings (Settings Modal)

| Page | Function |
|------|----------|
| **General Settings** | Workspace Name, Language Toggle (Chinese/English), Theme |
| **AI Models** | Fully Editable Architecture (Inline Edit name/provider/endpoint/apiKey), ADD MODEL, localStorage Persistence, Includes GLM-4 (ZhiPu) |
| **GitOps** | Git Repository Configuration, Branch Strategies |
| **Extensions Plugins** | 8 Preset Plugin Management Platform, Category Filtering, Enable/Disable, New Self-developed Plugin |
| **Security Policies** | Security Level Configuration, Audit Logs |

---

## 7. Seven AI Agents

YYC3's AI core adopts a "Seven Star Synergy" architecture, with each Agent having an independent personality, specialized domain, and persistent chat history:

| Agent | Nickname | Role | Color | Core Capabilities |
|-------|----------|------|-------|-------------------|
| Healing·Navigator | Navigator | Full-domain Command | Amber | Resource Scheduling, Path Planning, Full-domain Scanning, Task Orchestration |
| Insight·Thinker | Thinker | Deep Reasoning | Blue | Logical Reasoning, Decision Analysis, Causal Inference, Solution Evaluation |
| Forecast·Prophet | Prophet | Trend Prediction | Purple | Trend Prediction, Risk Prepositioning, Anomaly Alerts, Capacity Planning |
| Encounter·Bole | Bole | Model Evaluation | Pink | Model Evaluation, Optimal Matching, Benchmark Testing, Capability Profiling |
| Origin·Pivot | Pivot | State Management | Cyan | State Management, Context Maintenance, Memory Retrieval, Session Orchestration |
| Guardian·Sentinel | Sentinel | Security Protection | Red | Security Protection, Intrusion Detection, Audit Logs, Compliance Scanning |
| Scholar·Grandmaster | Grandmaster | Knowledge Construction | Green | Knowledge Construction, Ontology, Semantic Retrieval, Document Generation |

### Agent Interaction Mode

```
User Input → Intent Parsing Engine → Agent Routing
                              │
              ┌────────────────┼────────────────┐
              │                │                │
          Navigator      Thinker/Prophet     Sentinel
          (Scheduling)        (Analysis)           (Security)
              │                │                │
              └────────────────┼────────────────┘
                               │
                        Pivot (State Synchronization)
                               │
                     Response → User Interface
```

---

## 8. Five-Level Navigation

```
L1 (Dock)        : Total Control | Healing Center | Architecture Overview | DevOps | System Settings
                         │
L2 (Agent Grid)  : Navigator | Thinker | Prophet | Bole | Pivot | Sentinel | Grandmaster
                         │
L3 (Tab System)  : Pipeline | Containers | MCP Templates | DAG | Terminal
                         │
L4 (Sub-panels)  : Detail Panels | Editors | Previewers | Configurators
                         │
L5 (Actions)     : Button Groups | Shortcuts | Right-click Menus | Quick Selectors
```

---

## 9. Phase 1-24 Evolution

### Completed Phases

| Phase | Theme | Core Deliverables |
|-------|-------|-------------------|
| 1 | Foundation | React + Tailwind project init, App entry, basic routing |
| 2 | UI Library | shadcn/ui integration, 40+ UI primitives, design tokens |
| 3 | Chat Core | ChatArea, MessageBubble, streaming response, Markdown parsing |
| 4 | Console V1 | ConsoleView, ClusterTopology, real-time charts |
| 5 | Agent System | 7 AI Agent personas, independent chat interfaces |
| 6 | Architecture | Nine-layer visualization, layer interactions |
| 7 | Navigation | Five-level nav system, Sidebar collapse/expand/pin |
| 8 | Projects & Artifacts | ProjectsView, ArtifactsView, panel layouts |
| 9 | Data Persistence | PostgreSQL Schema, API service layer, WebSocket client |
| 10 | Real-time Engine | Metrics simulator, WebSocket degradation, cluster data |
| 11 | Workflow Engine | DAG visual orchestrator, MCP template system |
| 12 | DevOps Terminal | 5-tab architecture, Pipeline/Container monitoring |
| 13 | Seven Enhancements | Figma MCP, GLM-4, Docker MCP, Extensions, Web Speech, DB persist, Quick Selector |
| **14** | **LLM Infrastructure** | **AES-GCM crypto, 8 Provider registry, unified API proxy + SSE streaming, 3-state circuit breaker, smart router with failover** |
| **14.2** | **Smart Router** | **Health-score routing, exponential backoff, concurrency limiting, auto failover chain** |
| **15** | **NAS Integration** | **NAS SQLite HTTP proxy client, Docker Engine API, device health check, 4-node cluster registry** |
| **16** | **MCP Protocol** | **Full MCP JSON-RPC 2.0 implementation, 5 preset servers, tool/resource/prompt schema, mock runtime** |
| **17** | **Persistence Engine** | **Full-chain persistence (17 domains), LocalStorage + NAS SQLite dual-write, snapshot versioning, import/export** |
| **17.2** | **Agent Orchestration** | **Multi-agent collaboration (5 modes: pipeline/parallel/debate/ensemble/delegation), task decomposition, result aggregation** |
| **18** | **Event Bus** | **Five-dimensional event bus, ring buffer (500), typed pub/sub, React hooks, LiveLogStream consumer** |
| **19** | **Agent Identity** | **Dual identity system, FamilyPresenceBoard, KnowledgeBase CRUD, heartbeat WebSocket** |
| **20** | **Family Presence** | **Real-time family member presence via WebSocket heartbeat relay on NAS** |
| **21** | **NAS Deployment** | **NasDeploymentToolkit: connectivity diagnostics, deploy scripts, NAS service management** |
| **22** | **Metrics & Deploy** | **MetricsHistoryDashboard (historical trend analysis), RemoteDockerDeploy (one-click container deployment)** |
| **23** | **Ollama & API Docs** | **OllamaManager (local model discovery/management), ApiDocsViewer (interactive API reference), useOllamaDiscovery hook** |
| **24** | **UI Polish & Types** | **Sidebar history removal, ProjectsView rewrite, ArtifactsPanel toolbar, Ollama->Provider auto-sync, type system unification (types.ts), SmokeTestRunner (23 test targets)** |

---

## 10. Project Structure

```
/
├── docs/                                  # Design docs & phase summaries
│   ├── README.md                          # This file
│   ├── api-routes.md                      # Global API route documentation (Phase 25)
│   ├── typescript-types.md                # Full TypeScript type catalog (Phase 25)
│   ├── YYC3-Integrated-Architecture-Design-9.md
│   ├── YYC3-Design-System-Colors.md
│   ├── YYC3-Navigation-System-Design*.md
│   ├── YYC3-Five-Dimensional-Implementation-Plan.md
│   ├── execution_summary_v2~v13.md
│   └── project_summary.md
├── guidelines/
│   └── Guidelines.md
├── src/
│   ├── app/
│   │   ├── App.tsx                        # Main entry (ErrorBoundary + Lazy Loading + Ollama Sync)
│   │   └── components/
│   │       ├── chat/                      # Chat module
│   │       │   ├── ChatArea.tsx           # Main chat (voice + Quick Selector)
│   │       │   ├── MessageBubble.tsx      # Message bubbles
│   │       │   ├── ClaudeWelcome.tsx      # Welcome page
│   │       │   ├── ArtifactsPanel.tsx     # Artifacts sidebar (preview/code toggle)
│   │       │   └── YYC3Background.tsx     # Cyberpunk background
│   │       ├── console/                   # Console module (19 tabs)
│   │       │   ├── ConsoleView.tsx        # Console main view
│   │       │   ├── AgentChatInterface.tsx # Agent chat (7 agents)
│   │       │   ├── AgentIdentityCard.tsx  # Agent dual identity cards
│   │       │   ├── AgentOrchestrator.tsx  # Multi-agent collaboration
│   │       │   ├── ApiDocsViewer.tsx      # Interactive API docs
│   │       │   ├── DevOpsTerminal.tsx     # DevOps terminal
│   │       │   ├── DockerManager.tsx      # Docker management
│   │       │   ├── FamilyPresenceBoard.tsx# Family presence
│   │       │   ├── KnowledgeBase.tsx      # Knowledge base CRUD
│   │       │   ├── LiveLogStream.tsx      # Real-time log stream
│   │       │   ├── McpServiceBuilder.tsx  # MCP tool chain builder
│   │       │   ├── McpWorkflowsView.tsx   # MCP workflows
│   │       │   ├── MetricsHistoryDashboard.tsx # Historical metrics
│   │       │   ├── NasDeploymentToolkit.tsx# NAS deployment tools
│   │       │   ├── NasDiagnosticsPanel.tsx# NAS diagnostics
│   │       │   ├── OllamaManager.tsx      # Ollama local models
│   │       │   ├── PersistenceManager.tsx # Persistence management
│   │       │   ├── RemoteDockerDeploy.tsx # Remote Docker deploy
│   │       │   ├── SettingsView.tsx       # System settings
│   │       │   ├── SmokeTestRunner.tsx    # E2E smoke tests (23 targets)
│   │       │   ├── TestFrameworkRunner.tsx # Integrated test framework (Phase 25)
│   │       │   ├── TokenUsageDashboard.tsx# Token analytics
│   │       │   └── WorkflowOrchestrator.tsx # DAG orchestrator
│   │       ├── layout/
│   │       │   └── Sidebar.tsx            # Side navigation
│   │       ├── monitoring/
│   │       │   └── ServiceHealthMonitor.tsx
│   │       ├── search/
│   │       │   └── SearchPalette.tsx
│   │       ├── settings/
│   │       │   └── SettingsModal.tsx
│   │       ├── views/
│   │       │   ├── ProjectsView.tsx       # Projects (grouped layout)
│   │       │   └── ArtifactsView.tsx
│   │       └── ui/                        # shadcn/ui components (40+)
│   ├── lib/
│   │   ├── types.ts                       # Centralized type definitions (Phase 24)
│   │   ├── store.ts                       # Zustand global state
│   │   ├── api.ts                         # REST API service layer
│   │   ├── llm-bridge.ts                  # Unified LLM bridge (SSE)
│   │   ├── llm-providers.ts              # 8 Provider registry
│   │   ├── llm-router.ts                 # Smart router + circuit breaker
│   │   ├── crypto.ts                      # AES-GCM encryption
│   │   ├── nas-client.ts                 # NAS & cluster client
│   │   ├── mcp-protocol.ts              # MCP protocol layer
│   │   ├── event-bus.ts                  # Five-dimensional event bus
│   │   ├── persistence-engine.ts        # Full-chain persistence
│   │   ├── persistence-binding.ts       # Store <-> persistence binding
│   │   ├── agent-orchestrator.ts        # Multi-agent collaboration
│   │   ├── agent-identity.ts            # Agent identity system
│   │   ├── db-schema.ts                 # PostgreSQL schema
│   │   ├── i18n.tsx                      # Internationalization
│   │   ├── useMetricsSimulator.ts       # Metrics simulation engine
│   │   ├── useWebSocket.ts              # WebSocket client
│   │   ├── useHeartbeatWebSocket.ts     # Heartbeat WebSocket
│   │   ├── useNasDiagnostics.ts         # NAS diagnostics hook
│   │   ├── useOllamaDiscovery.ts        # Ollama auto-discovery hook
│   │   └── utils.ts                      # Utility functions
│   ├── server/
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── ws.ts
│   └── styles/
│       ├── theme.css                      # Design tokens
│       ├── index.css
│       ├── tailwind.css
│       └── fonts.css
├── package.json
├── vite.config.ts
└── postcss.config.mjs
```

---

## 11. Data Persistence Strategy

### Architecture (Phase 17-18)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Zustand      │────►│  Persistence     │────►│  NAS SQLite      │
│  (Runtime)    │     │  Engine (17      │     │  (192.168.3.45)  │
│               │     │   domains)       │     │                  │
└──────────────┘     └──────┬───────────┘     └──────────────────┘
                            │
                     ┌──────┴───────────┐
                     │  localStorage    │
                     │  (Always-on      │
                     │   Fallback)      │
                     └──────────────────┘
```

### Persist Domains (17)

| Domain | Description | Sync Strategy |
|--------|-------------|---------------|
| chat_sessions | Terminal sessions | Dual-write |
| chat_messages | Chat messages | Dual-write |
| agent_sessions | Agent session meta | Dual-write |
| agent_messages | Agent histories | Dual-write |
| metrics_snapshots | 30s cluster metrics | Append-only |
| system_logs | Event logs | Append-only |
| workflows | DAG definitions | On-save |
| templates | Custom templates | On-save |
| artifacts | Generated code | On-save |
| mcp_registry | MCP servers | On-save |
| mcp_call_log | MCP call history | Append-only |
| device_configs | Device settings | On-save |
| llm_configs | Provider configs | On-save (encrypted) |
| llm_usage | Token usage | Append-only |
| preferences | User prefs | On-save |
| knowledge_base | KB articles | Dual-write |
| agent_profiles | Identity cards | On-save |

---

## 12. API & Documentation

See detailed documentation:
- **[API Routes](./api-routes.md)** - All REST, WebSocket, LLM, Docker, NAS, MCP endpoints
- **[TypeScript Types](./typescript-types.md)** - Full type catalog (80+ interfaces, 30+ type aliases)
- **[Architecture Design](./YYC3-Integrated-Architecture-Design-9.md)** - Nine-layer architecture
- **[Navigation Design](./YYC3-Navigation-System-Design.md)** - Five-level navigation
- **[Five-Dimensional Plan](./YYC3-Five-Dimensional-Implementation-Plan.md)** - Implementation roadmap

---

## 13. Getting Started

### Environment Requirements

- Node.js >= 18
- pnpm (recommended) or npm
- Modern browser (Chrome/Safari/Edge, must support Web Speech API)

### Quick Start

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build production version
pnpm build
```

### Optional: Start Backend Service

```bash
# Create PostgreSQL database
psql -c "CREATE DATABASE yyc3_devops;"

# Execute Schema
# (refer to src/lib/db-schema.ts for SCHEMA_SQL)

# Start Express backend
cd src/server && node index.ts
# Listening on http://localhost:3001
# WebSocket: ws://localhost:3001/ws
```

### NAS Connection

```
IronWare F4-423 Management Panel: http://192.168.3.45:9898
RAID6 Configuration: 4x8TB HDD + 4TB SSD Cache
```

---

## 14. Testing Framework

### Smoke Test Runner (Phase 24)
- 23 test targets: 5 main views + 18 console tabs
- Dynamic import validation
- Timing per test, batch execution
- JSON report export
- Access: Console tab `smoke_test` or Neural Link command "smoke test"

### Test Framework Runner (Phase 25)
- **Type Audit**: Runtime validation of all 80+ TypeScript interfaces
- **Component Tests**: Core component mount/render verification
- **Integration Tests**: Cross-module dependency validation
- **Module Health**: Dynamic import + export verification for all lib modules
- Access: Console tab `test_framework` or Neural Link command "test framework"

---

> **YYC3 Hacker Chatbot** - Phase 24 Complete | Phase 25 In Progress
> 实用为本 | 高效为积累
> *Built with precision. Evolved with purpose.*
