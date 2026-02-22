# V-3 与项目根目录文件差异记录

## 概述
本文档记录从 V-3 目录复制文件到项目根目录时发现的重要差异。

## 配置文件差异

### 1. vite.config.ts

**项目根目录版本特点：**
- 包含 PWA 插件配置 (VitePWA)
- 支持多环境模式加载 (loadEnv)
- 配置了 GitHub Pages 部署路径
- 包含完整的 PWA manifest 配置
- 有 workbox 缓存策略

**V-3 版本特点：**
- 更简洁的配置
- 包含 CORS 代理配置（用于开发模式）
- 支持 OpenAI, DeepSeek, Anthropic, Zhipu, Gemini, Groq 等云 LLM 提供商
- 没有 PWA 配置

**建议：** 合并两个版本的配置，保留 PWA 功能的同时添加 CORS 代理支持。

### 2. package.json

**项目根目录版本特点：**
- 名称: `yyc3-hacker-chatbot`
- 版本: `0.33.0`
- 更多的脚本命令（dev:1, dev:2, dev:3, dev:4, server:* 等）
- 包含后端相关依赖：@types/cors, @types/express, @types/pg, @types/ws, @types/uuid
- 包含 vite-plugin-pwa 和 workbox-window
- react 和 react-dom 作为直接依赖

**V-3 版本特点：**
- 名称: `@figma/my-make-file`
- 版本: `0.0.1`
- 简化的脚本命令
- react 和 react-dom 作为 peerDependencies
- 没有后端相关依赖
- 没有 PWA 相关依赖

**建议：** 保留项目根目录的配置，因为它是更完整的生产环境配置。

## 已复制的文件列表

### 监控组件
- ✅ src/app/components/monitoring/HardwareMonitor.tsx
- ✅ src/app/components/monitoring/NeuralLinkOverlay.tsx

### 核心库文件
- ✅ src/lib/types.ts
- ✅ src/lib/utils.ts
- ✅ src/lib/persistence-engine.ts
- ✅ src/lib/db-schema.ts
- ✅ src/lib/agent-orchestrator.ts
- ✅ src/lib/llm-bridge.ts
- ✅ src/lib/mcp-protocol.ts
- ✅ src/lib/persistence-binding.ts
- ✅ src/lib/persist-schemas.ts
- ✅ src/lib/llm-providers.ts
- ✅ src/lib/llm-router.ts
- ✅ src/lib/agent-identity.ts
- ✅ src/lib/nas-client.ts
- ✅ src/lib/crypto.ts
- ✅ src/lib/event-bus.ts
- ✅ src/lib/useHeartbeatWebSocket.ts
- ✅ src/lib/useMetricsSimulator.ts
- ✅ src/lib/useNasDiagnostics.ts
- ✅ src/lib/useOllamaDiscovery.ts
- ✅ src/lib/api.ts
- ✅ src/lib/store.ts
- ✅ src/lib/i18n.tsx
- ✅ src/lib/kb-utils.ts
- ✅ src/lib/proxy-endpoints.ts
- ✅ src/lib/useWebSocket.ts

### 服务器文件
- ✅ src/server/index.ts
- ✅ src/server/routes.ts
- ✅ src/server/ws.ts

### 样式和入口文件
- ✅ src/styles/theme.css
- ✅ src/main.tsx
- ✅ src/types/global.d.ts
- ✅ src/app/App.tsx

## 关键差异说明

### HardwareMonitor.tsx
- V-3 版本包含完整的 M4 Max 硬件监控功能
- 包含 56 核 CPU 负载可视化（16P+4E CPU + 40 GPU 核心）
- 集成 PostgreSQL 15 连接状态显示
- 包含热监控和内存压力告警

### NeuralLinkOverlay.tsx
- V-3 版本提供实时协作 HUD
- 显示系统健康状态、活跃 Agent、流式状态
- 包含事件总线实时订阅
- 支持键盘快捷键（Ctrl+H 切换 HUD）

### types.ts
- V-3 版本包含完整的类型定义系统
- 包含 CollaborationTask, DatabaseConfig, HardwareSnapshot 等新类型
- 定义了完整的 Agent 注册表

### utils.ts
- V-3 版本包含数据库和硬件工具函数
- persistToLocalDB() 函数用于本地数据库持久化
- getHardwareTelemetry() 函数用于获取硬件遥测数据

## 未复制的文件

以下文件存在于 V-3 但未复制到项目根目录：

### 配置文件
- V-3/vite.config.ts（与项目根目录有差异）
- V-3/package.json（与项目根目录有差异）
- V-3/tsconfig.json
- V-3/vitest.config.ts
- V-3/postcss.config.mjs
- V-3/index.html

### 文档文件
- V-3/docs/*（大量文档文件）
- V-3/guidelines/*
- V-3/ATTRIBUTIONS.md
- V-3/TRUST_MENTORSHIP_AGREEMENT.md

### 脚本文件
- V-3/scripts/*
- V-3/config/*

### 测试文件
- V-3/src/lib/__tests__/*

## 建议

1. **配置文件合并**：手动合并 vite.config.ts，保留 PWA 功能并添加 CORS 代理支持
2. **依赖管理**：保留项目根目录的 package.json 配置，但检查是否需要添加 V-3 中的新依赖
3. **文档同步**：考虑将 V-3 中的重要文档同步到项目根目录的 docs 文件夹
4. **测试文件**：复制 V-3 中的测试文件到项目根目录
5. **脚本工具**：评估 V-3/scripts 中的工具脚本是否有用

## 下一步行动

1. 运行类型检查确保没有类型错误
2. 运行构建测试确保所有文件正确集成
3. 测试新复制的功能（硬件监控、NeuralLink HUD）
4. 根据需要调整配置文件