# YYC3 Hacker Chatbot - Environment Variables & State Keys Reference

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future**
> *万象归元于云枢 | 深栈智启新纪元*
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**

---

## Table of Contents

1. [Environment Variables (.env)](#1-environment-variables)
2. [localStorage Keys (Client-Side State)](#2-localstorage-keys)
3. [Network Endpoints](#3-network-endpoints)
4. [Constants & Configuration Values](#4-constants--configuration-values)

---

## 1. Environment Variables

> Since YYC3 is a pure-frontend SPA, environment variables are consumed at build time via Vite's `import.meta.env`.

### 1.1 NAS Infrastructure

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_NAS_HOST` | `192.168.3.45` | TerraMaster F4-423 NAS IP |
| `VITE_NAS_SQLITE_PORT` | `8484` | SQLite HTTP Proxy port |
| `VITE_NAS_DOCKER_PORT` | `2375` | Docker Engine API port |
| `VITE_HEARTBEAT_WS_HOST` | `192.168.3.45` | WebSocket heartbeat server host |
| `VITE_HEARTBEAT_WS_PORT` | `9090` | WebSocket heartbeat server port |
| `VITE_HEARTBEAT_WS_PATH` | `/ws/heartbeat` | WebSocket heartbeat path |

### 1.2 Cluster Device IPs

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DEVICE_M4_MAX` | `192.168.3.22` | MacBook Pro M4 Max |
| `VITE_DEVICE_IMAC_M4` | `192.168.3.77` | iMac M4 |
| `VITE_DEVICE_MATEBOOK` | `192.168.3.66` | MateBook X Pro |
| `VITE_DEVICE_NAS` | `192.168.3.45` | YanYuCloud NAS |

### 1.3 LLM Provider API Keys

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_OPENAI_API_KEY` | *(empty)* | OpenAI API key |
| `VITE_ANTHROPIC_API_KEY` | *(empty)* | Anthropic API key |
| `VITE_DEEPSEEK_API_KEY` | *(empty)* | DeepSeek API key |
| `VITE_ZHIPU_API_KEY` | *(empty)* | Zhipu (GLM) API key |
| `VITE_GOOGLE_API_KEY` | *(empty)* | Google AI (Gemini) API key |
| `VITE_GROQ_API_KEY` | *(empty)* | Groq API key |

### 1.4 Local LLM Services

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_OLLAMA_HOST` | `localhost` | Ollama service host |
| `VITE_OLLAMA_PORT` | `11434` | Ollama service port |
| `VITE_LMSTUDIO_HOST` | `localhost` | LM Studio host |
| `VITE_LMSTUDIO_PORT` | `1234` | LM Studio port |

### 1.5 Application Config

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_PERSISTENCE_STRATEGY` | `localStorage` | `localStorage` or `nasSqlite` |
| `VITE_METRICS_ARCHIVE_INTERVAL` | `30000` | Metrics snapshot interval (ms) |
| `VITE_HEARTBEAT_SIMULATION_INTERVAL` | `8000` | Heartbeat fallback sim interval (ms) |
| `VITE_LOG_LEVEL` | `info` | Console log level |

---

## 2. localStorage Keys (Client-Side State)

### 2.1 Appearance & UI

| Key | Module | Description | Size Estimate |
|-----|--------|-------------|---------------|
| `yyc3-appearance-config` | `App.tsx` | Accent color, font family, font size, bg color, etc. | ~500B |
| `yyc3-bg-image` | `App.tsx` | Background image DataURL (stored separately to avoid quota) | ~50KB-2MB |

### 2.2 LLM & Provider Configuration

| Key | Module | Description | Size Estimate |
|-----|--------|-------------|---------------|
| `yyc3-llm-provider-config` | `llm-bridge.ts` | Array of ProviderConfig objects (apiKey, endpoint, enabled, model) | ~1KB |
| `yyc3-llm-usage` | `llm-bridge.ts` | Token usage tracking per provider | ~2KB |
| `yyc3-llm-router-state` | `llm-router.ts` | Smart router circuit breaker states and priority weights | ~1KB |

### 2.3 Agent & Identity

| Key | Module | Description | Size Estimate |
|-----|--------|-------------|---------------|
| `yyc3-agent-profiles` | `agent-identity.ts` | 7 agent profiles with presence, mood, identities | ~5KB |
| `yyc3-device-members` | `agent-identity.ts` | 4 device member profiles with presence | ~2KB |
| `yyc3-knowledge-base` | `agent-identity.ts` | Knowledge base entries (articles, snippets) | ~10KB+ |

### 2.4 Orchestrator & MCP

| Key | Module | Description | Size Estimate |
|-----|--------|-------------|---------------|
| `yyc3-orchestrator-tasks` | `agent-orchestrator.ts` | Orchestration task queue and history | ~5KB |
| `yyc3-mcp-registry` | `mcp-protocol.ts` | Registered MCP tool servers | ~3KB |
| `yyc3-mcp-servers` | `mcp-protocol.ts` | MCP server connection configs | ~2KB |
| `yyc3-mcp-call-log` | `mcp-protocol.ts` | MCP tool invocation audit log | ~5KB |

### 2.5 NAS & Infrastructure

| Key | Module | Description | Size Estimate |
|-----|--------|-------------|---------------|
| `yyc3-device-configs` | `nas-client.ts` | Cluster device IP/port/service configs | ~2KB |
| `yyc3-nas-sqlite-config` | `nas-client.ts` | NAS SQLite HTTP proxy connection config | ~200B |
| `yyc3-docker-config` | `nas-client.ts` | Docker Engine API connection config | ~200B |
| `yyc3-heartbeat-ws-config` | `useHeartbeatWebSocket.ts` | Heartbeat WebSocket connection config | ~200B |
| `yyc3-ollama-config` | `useOllamaDiscovery.ts` | Ollama service host/port config | ~200B |

### 2.6 Persistence Engine

| Key | Module | Description | Size Estimate |
|-----|--------|-------------|---------------|
| `yyc3-persistence-config` | `persistence-engine.ts` | Engine strategy (localStorage/nasSqlite) | ~200B |
| `yyc3-persist-chat_messages` | `persistence-engine.ts` | Persisted chat messages | ~10KB |
| `yyc3-persist-chat_sessions` | `persistence-engine.ts` | Chat session metadata | ~2KB |
| `yyc3-persist-agent_messages` | `persistence-engine.ts` | Per-agent chat histories | ~10KB |
| `yyc3-persist-preferences` | `persistence-engine.ts` | User preferences snapshot | ~500B |
| `yyc3-persist-metrics_snapshots` | `persistence-engine.ts` | Archived cluster metrics | ~20KB |
| `yyc3-persist-system_logs` | `persistence-engine.ts` | System log entries | ~5KB |
| `yyc3-persist-knowledge_base` | `persistence-engine.ts` | Knowledge base entries | ~10KB+ |
| `yyc3-snapshots` | `persistence-engine.ts` | Manual state snapshots (max 10) | ~50KB |

### 2.7 Security

| Key | Module | Description | Size Estimate |
|-----|--------|-------------|---------------|
| `yyc3-crypto-salt` | `crypto.ts` | Encryption salt for API key storage | ~64B |

---

## 3. Network Endpoints

### 3.1 NAS SQLite HTTP Proxy

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `http://192.168.3.45:8484/api/db/query` | Execute SQL query |
| `POST` | `http://192.168.3.45:8484/api/db/execute` | Execute SQL mutation |
| `GET` | `http://192.168.3.45:8484/api/db/tables` | List tables |
| `GET` | `http://192.168.3.45:8484/api/db/health` | Health check |

### 3.2 Docker Engine API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `http://192.168.3.45:2375/v1.41/info` | Docker system info |
| `GET` | `http://192.168.3.45:2375/v1.41/containers/json` | List containers |
| `POST` | `http://192.168.3.45:2375/v1.41/containers/create` | Create container |
| `POST` | `http://192.168.3.45:2375/v1.41/containers/{id}/start` | Start container |
| `POST` | `http://192.168.3.45:2375/v1.41/containers/{id}/stop` | Stop container |
| `DELETE` | `http://192.168.3.45:2375/v1.41/containers/{id}` | Remove container |
| `POST` | `http://192.168.3.45:2375/v1.41/images/create` | Pull image |
| `GET` | `http://192.168.3.45:2375/v1.41/images/json` | List images |

### 3.3 Ollama API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `http://localhost:11434/api/tags` | List models |
| `GET` | `http://localhost:11434/api/ps` | Running models |
| `POST` | `http://localhost:11434/api/chat` | Chat completion (SSE) |
| `POST` | `http://localhost:11434/api/generate` | Text generation (SSE) |
| `DELETE` | `http://localhost:11434/api/delete` | Delete model |

### 3.4 LLM Provider Endpoints

| Provider | Base URL | API Format |
|----------|----------|------------|
| OpenAI | `https://api.openai.com/v1` | OpenAI |
| Anthropic | `https://api.anthropic.com/v1` | Anthropic |
| DeepSeek | `https://api.deepseek.com/v1` | OpenAI-compatible |
| Zhipu (GLM) | `https://open.bigmodel.cn/api/paas/v4` | OpenAI-compatible |
| Google (Gemini) | `https://generativelanguage.googleapis.com/v1beta` | OpenAI-compatible |
| Groq | `https://api.groq.com/openai/v1` | OpenAI-compatible |
| Ollama | `http://localhost:11434/v1` | OpenAI-compatible |
| LM Studio | `http://localhost:1234/v1` | OpenAI-compatible |

### 3.5 WebSocket Endpoints

| URL | Protocol | Description |
|-----|----------|-------------|
| `ws://192.168.3.45:9090/ws/heartbeat` | Custom JSON | Family heartbeat stream |

---

## 4. Constants & Configuration Values

### 4.1 File Upload

| Constant | Value | Location |
|----------|-------|----------|
| `MAX_FILE_SIZE` | 10MB (10,485,760 bytes) | `types.ts` |
| `MAX_FILES` | 10 | `types.ts` |

### 4.2 Performance

| Constant | Value | Location |
|----------|-------|----------|
| Ring Buffer Size | 500 events | `event-bus.ts` |
| Log History | 100 entries | `store.ts` |
| Metrics Archive Max | 10 snapshots | `persistence-engine.ts` |
| Persist Debounce | 2000ms | `persistence-binding.ts` |
| WS Connect Timeout | 5000ms | `useHeartbeatWebSocket.ts` |
| WS Max Reconnect Delay | 30000ms | `useHeartbeatWebSocket.ts` |
| Simulation Interval | 8000ms | `useHeartbeatWebSocket.ts` |

### 4.3 Circuit Breaker (LLM Router)

| Constant | Value | Location |
|----------|-------|----------|
| Failure Threshold | 3 | `llm-router.ts` |
| Recovery Timeout | 60000ms | `llm-router.ts` |
| Half-Open Max Requests | 1 | `llm-router.ts` |

### 4.4 MCP Protocol

| Constant | Value | Location |
|----------|-------|----------|
| Protocol Version | `2024-11-05` | `mcp-protocol.ts` |
| Max Call Log Entries | 100 | `mcp-protocol.ts` |
| Server Timeout | 10000ms | `mcp-protocol.ts` |

### 4.5 KB Backend Services (Phase 32)

| Variable | Default Port | NAS Endpoint | Service |
|----------|-------------|--------------|---------|
| `VITE_KB_VECTOR_PORT` | `8090` | `http://{NAS_IP}:8090/api/v1/kb/vector-search` | Chroma / FAISS |
| `VITE_KB_MULTIMODAL_PORT` | `8091` | `http://{NAS_IP}:8091/api/v1/ocr/recognize` | PaddleOCR + Whisper |
| `VITE_KB_NLP_PORT` | `8092` | `http://{NAS_IP}:8092/api/v1/nlp/ner` | HanLP + Neo4j |

### 4.6 KB Search Weights (Phase 32 Fuzzy Search)

| Field | Weight | Location |
|-------|--------|----------|
| Title match | 5x | `kb-utils.ts` |
| Summary match | 3x | `kb-utils.ts` |
| Tag match | 4x | `kb-utils.ts` |
| Content match | 1x | `kb-utils.ts` |

---

## 5. Development Environment Files (Phase 33)

> **Important**: Figma Make sandbox does NOT export dotfiles (`.env`, `.gitignore`, etc.).
> All templates are stored in `config/` with non-dot names.
> Run `scripts/setup.sh` to auto-generate dotfiles from templates.

### 5.1 Template → Dotfile Mapping

| Source (in `config/`) | Generated Target | Purpose | Git Tracked |
|----------------------|-----------------|---------|-------------|
| `config/env.example` | `.env.example` | Master template (31 variables) | Target: Yes |
| `config/env.development` | `.env.development` | Dev defaults (debug, localStorage) | Target: Yes |
| `config/env.production` | `.env.production` | NAS prod defaults (nasSqlite, warn) | Target: Yes |
| *(from .env.example)* | `.env.local` | Personal overrides (API keys) | Target: **No** |
| `config/gitignore` | `.gitignore` | Git ignore rules | Target: Yes |
| `config/editorconfig` | `.editorconfig` | Editor code style (2-space indent) | Target: Yes |
| `config/nvmrc` | `.nvmrc` | Node.js version lock (20) | Target: Yes |
| `config/npmrc` | `.npmrc` | pnpm config (auto-install-peers) | Target: Yes |
| `config/vscode-extensions.json` | `.vscode/extensions.json` | 10 recommended VS Code extensions | Target: Yes |

### 5.2 Scripts

| Script | Usage | Purpose |
|--------|-------|---------|
| `scripts/setup.sh` | `./scripts/setup.sh` | One-click bootstrap (detects project root from any dir) |
| `scripts/install-deps.sh` | `./scripts/install-deps.sh [--local\|--ci]` | Dependency install (3 modes) |
| `scripts/verify-env.ts` | `npx tsx scripts/verify-env.ts` | Environment variable validator |

---

*Document updated by YYC3 Phase 33 — Environment Bootstrap*
