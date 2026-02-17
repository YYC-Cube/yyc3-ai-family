# YYC3 Hacker Chatbot - Global API Route Documentation

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future**
> *万象归元于云枢 | 深栈智启新纪元*
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [REST API Service Layer (api.ts)](#2-rest-api-service-layer)
3. [NAS & Cluster Client (nas-client.ts)](#3-nas--cluster-client)
4. [LLM Bridge API (llm-bridge.ts)](#4-llm-bridge-api)
5. [LLM Smart Router (llm-router.ts)](#5-llm-smart-router)
6. [MCP Protocol Layer (mcp-protocol.ts)](#6-mcp-protocol-layer)
7. [Event Bus (event-bus.ts)](#7-event-bus)
8. [Persistence Engine (persistence-engine.ts)](#8-persistence-engine)
9. [Crypto Module (crypto.ts)](#9-crypto-module)
10. [WebSocket Endpoints](#10-websocket-endpoints)
11. [Environment Variables & Configuration](#11-environment-variables--configuration)
12. [Error Code Reference](#12-error-code-reference)

---

## 1. Architecture Overview

```
Browser (React SPA)
  |
  +-- REST API Layer (api.ts)        --> localhost:3001/api/v1/*
  +-- NAS SQLite HTTP (nas-client)   --> 192.168.3.45:8484/api/db/*
  +-- Docker Engine API              --> 192.168.3.45:2375/v1.41/*
  +-- LLM Bridge (llm-bridge.ts)     --> Multiple Provider APIs (SSE)
  +-- WebSocket                      --> localhost:3001/ws
  +-- Heartbeat WS                   --> 192.168.3.45:9090/ws/heartbeat
  +-- Ollama API                     --> localhost:11434/*
  |
  +-- localStorage Fallback (all modules auto-degrade)
```

### Degradation Strategy
All API modules implement a **dual-write fallback** pattern:
1. Try remote endpoint (NAS/Server)
2. On failure -> degrade to `localStorage` mock
3. Queue pending writes for sync when connectivity resumes

---

## 2. REST API Service Layer

**Base URL**: `http://localhost:3001/api/v1`
**Timeout**: 5000ms
**Source File**: `/src/lib/api.ts`

### 2.1 Health Check

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/health` | System health check | `{ status, db, uptime }` |

### 2.2 Sessions API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/sessions` | List all chat sessions | - | `DBSession[]` |
| `POST` | `/sessions` | Create new session | `{ title: string }` | `DBSession` |
| `PATCH` | `/sessions/:id/archive` | Archive a session | - | `void` |

**DBSession Schema**:
```typescript
interface DBSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  metadata: Record<string, unknown>;
}
```

### 2.3 Messages API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/sessions/:id/messages` | List messages in session | - | `DBMessage[]` |
| `POST` | `/sessions/:id/messages` | Create message | `{ role, content, agent_name?, agent_role?, timestamp }` | `DBMessage` |

**DBMessage Schema**:
```typescript
interface DBMessage {
  id: string;
  session_id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  agent_name?: string;
  agent_role?: string;
  timestamp: string;
  tokens_used: number;
}
```

### 2.4 Agent Sessions API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/agents/:agentId/session` | Get or create agent session | `{ agent_name: string }` | `DBAgentSession` |
| `POST` | `/agents/:agentId/session/reset` | Reset agent session | - | `void` |

### 2.5 Agent Messages API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/agents/:agentId/messages` | List agent messages | - | `DBAgentMessage[]` |
| `POST` | `/agents/:agentId/messages` | Create agent message | `{ agent_id, role, content, timestamp }` | `DBAgentMessage` |

### 2.6 Metrics API

| Method | Endpoint | Description | Request Body / Query | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/metrics` | Record metric point | `{ node_id, metric_type, value, unit }` | `void` |
| `GET` | `/metrics?node_id=&metric_type=&limit=` | Query metric history | Query params | `DBMetricPoint[]` |

### 2.7 Logs API

| Method | Endpoint | Description | Query / Body | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/logs?limit=&level=` | List system logs | Query params | `DBLogEntry[]` |
| `POST` | `/logs` | Create log entry | `{ level, source, message }` | `void` |

### 2.8 Preferences API

| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| `GET` | `/preferences/:key` | Read preference | - | `{ value: unknown }` |
| `PUT` | `/preferences/:key` | Write preference | `{ value: unknown }` | `void` |

### 2.9 Projects CRUD

| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| `GET` | `/projects` | List all projects | - | `DBProject[]` |
| `GET` | `/projects/:id` | Get project by ID | - | `DBProject` |
| `POST` | `/projects` | Create project | `Omit<DBProject, 'id'|'created_at'|...>` | `DBProject` |
| `PUT` | `/projects/:id` | Update project | `Partial<DBProject>` | `DBProject` |
| `DELETE` | `/projects/:id` | Delete project | - | `boolean` |

### 2.10 Artifacts CRUD

| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| `GET` | `/artifacts?type=` | List artifacts | Query params | `DBArtifact[]` |
| `GET` | `/artifacts/:id` | Get artifact | - | `DBArtifact` |
| `POST` | `/artifacts` | Create artifact | `{ title, artifact_type, language, content, ... }` | `DBArtifact` |
| `PUT` | `/artifacts/:id` | Update artifact | `Partial<DBArtifact>` | `DBArtifact` |
| `DELETE` | `/artifacts/:id` | Delete artifact | - | `boolean` |
| `PATCH` | `/artifacts/:id/star` | Toggle star | - | `DBArtifact` |

---

## 3. NAS & Cluster Client

**Source File**: `/src/lib/nas-client.ts`

### 3.1 SQLite HTTP Proxy

**Base URL**: `http://192.168.3.45:8484/api/db`
**Timeout**: 10000ms

| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| `POST` | `/query` | Execute SQL query | `{ db: string, sql: string, params: unknown[] }` | `SQLiteQueryResult` |

**SQLiteQueryResult Schema**:
```typescript
interface SQLiteQueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  changesCount: number;
}
```

### 3.2 Docker Engine API

**Base URL**: `http://192.168.3.45:2375/v1.41`
**Timeout**: 8000ms

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/info` | Docker system info | `DockerSystemInfo` |
| `GET` | `/_ping` | Docker health check | `"OK"` |
| `GET` | `/containers/json?all=true` | List containers | `DockerContainer[]` |
| `POST` | `/containers/:id/start` | Start container | `void` |
| `POST` | `/containers/:id/stop` | Stop container | `void` |
| `POST` | `/containers/:id/restart` | Restart container | `void` |
| `DELETE` | `/containers/:id?force=` | Remove container | `void` |
| `GET` | `/containers/:id/logs?stdout=true&stderr=true&tail=` | Container logs | `string` |
| `GET` | `/images/json` | List images | `DockerImage[]` |

### 3.3 Device Health Check

| Function | Target | Method | Timeout |
|----------|--------|--------|---------|
| `pingDevice(device)` | Any HTTP service on device | `HEAD` (no-cors) | 3000ms |
| `pingService(device, serviceId)` | Specific service endpoint | `HEAD` (no-cors) | 3000ms |

### 3.4 Device Registry (4 Nodes)

| Node ID | IP | Key Ports |
|---------|-----|-----------|
| `m4-max` | 192.168.3.22 | SSH:22, Ollama:11434, Dev:5173 |
| `imac-m4` | 192.168.3.77 | SSH:22, Ollama:11434 |
| `matebook` | 192.168.3.66 | RDP:3389 |
| `yanyucloud` | 192.168.3.45 | TOS:9898, Docker:2375, SQLite:8484, WS:9090, SMB:445, WebDAV:5005 |

---

## 4. LLM Bridge API

**Source File**: `/src/lib/llm-bridge.ts`

### 4.1 Provider Endpoints

| Provider | API Format | Default Endpoint | Auth Header |
|----------|-----------|------------------|-------------|
| OpenAI | `openai` | `https://api.openai.com/v1` | `Authorization: Bearer <key>` |
| Anthropic | `anthropic` | `https://api.anthropic.com/v1` | `x-api-key: <key>` |
| DeepSeek | `openai` | `https://api.deepseek.com/v1` | `Authorization: Bearer <key>` |
| Z.AI (Zhipu) | `openai` | `https://open.bigmodel.cn/api/paas/v4` | `Authorization: Bearer <key>` |
| Google | `openai` | `https://generativelanguage.googleapis.com/v1beta/openai` | `Authorization: Bearer <key>` |
| Groq | `openai` | `https://api.groq.com/openai/v1` | `Authorization: Bearer <key>` |
| Ollama | `openai` | `http://localhost:11434/v1` | (none) |
| LM Studio | `openai` | `http://localhost:1234/v1` | (none) |

### 4.2 Core Functions

| Function | Type | Description |
|----------|------|-------------|
| `streamChat(opts, onChunk)` | Streaming | SSE stream LLM call, returns `LLMResponse` |
| `chat(opts)` | Synchronous | Non-streaming LLM call |
| `agentStreamChat(agentId, msg, history, onChunk, signal)` | Agent-routed | Auto-routes to best provider with failover |
| `checkProviderHealth(providerId, apiKey, endpoint?)` | Health | Tests provider connectivity |
| `trackUsage(response, agentId)` | Analytics | Records token usage to localStorage |
| `getUsageSummary()` | Analytics | Aggregates usage by provider/agent/date |

### 4.3 SSE Stream Formats

**OpenAI Format**:
```
data: {"choices":[{"delta":{"content":"token"},"finish_reason":null}]}
data: [DONE]
```

**Anthropic Format**:
```
data: {"type":"message_start","message":{"usage":{"input_tokens":N}}}
data: {"type":"content_block_delta","delta":{"text":"token"}}
data: {"type":"message_delta","usage":{"output_tokens":N},"delta":{"stop_reason":"end_turn"}}
data: {"type":"message_stop"}
```

---

## 5. LLM Smart Router

**Source File**: `/src/lib/llm-router.ts`

### 5.1 Circuit Breaker States

```
CLOSED (normal) --[failureThreshold exceeded]--> OPEN (blocked)
OPEN --[recoveryTimeMs elapsed]--> HALF_OPEN (testing)
HALF_OPEN --[success]--> CLOSED
HALF_OPEN --[failure]--> OPEN
```

### 5.2 Router Functions

| Function | Description |
|----------|-------------|
| `getFailoverChain(candidates)` | Sort providers by health score, filter by circuit state |
| `canRequest(providerId)` | Check if circuit breaker allows request |
| `acquireSlot(providerId)` | Get concurrency slot (max 3 per provider) |
| `releaseSlot(providerId)` | Release concurrency slot |
| `recordSuccess(providerId, latencyMs)` | Update health score on success |
| `recordFailure(providerId, errorCode, retryAfterMs)` | Update health score + circuit on failure |

### 5.3 Health Score Components

| Factor | Weight | Description |
|--------|--------|-------------|
| Success Rate | 40% | Recent success/failure ratio |
| Latency | 30% | Average response time (sliding window) |
| Circuit State | 20% | CLOSED=100, HALF_OPEN=50, OPEN=0 |
| Concurrency | 10% | Current load / max slots |

---

## 6. MCP Protocol Layer

**Source File**: `/src/lib/mcp-protocol.ts`

### 6.1 JSON-RPC 2.0 Methods

| Method | Category | Description |
|--------|----------|-------------|
| `initialize` | Lifecycle | Capability negotiation |
| `ping` | Lifecycle | Health check |
| `tools/list` | Tools | Enumerate available tools |
| `tools/call` | Tools | Invoke a tool with arguments |
| `resources/list` | Resources | List available resources |
| `resources/read` | Resources | Read resource by URI |
| `resources/templates/list` | Resources | List URI templates |
| `prompts/list` | Prompts | List prompt templates |
| `prompts/get` | Prompts | Get prompt with args applied |
| `logging/setLevel` | Utilities | Set server log level |
| `completion/complete` | Utilities | Auto-completion |

### 6.2 Preset MCP Servers (5)

| Server ID | Name | Transport | Tools | Resources |
|-----------|------|-----------|-------|-----------|
| `mcp-filesystem` | Filesystem | stdio | read_file, write_file, list_directory, search_files | File root |
| `mcp-postgres` | PostgreSQL | stdio | query | Database schema |
| `mcp-yyc3-cluster` | YYC3 Cluster | stdio | cluster_status, docker_containers, sqlite_query, system_diagnostics, deploy_service | Metrics, projects, logs, containers, configs |
| `mcp-github` | GitHub | stdio | search_repositories, create_issue, get_file_contents | Repos, issues |
| `mcp-web-search` | Web Search | stdio | brave_web_search, brave_local_search | - |

### 6.3 Registry Functions

| Function | Description |
|----------|-------------|
| `getAllMCPServers()` | Merge presets + custom servers from localStorage |
| `registerMCPServer(server)` | Add/update server in registry |
| `removeMCPServer(serverId)` | Remove custom server |
| `executeMCPCall(serverId, method, params)` | Execute (mock runtime in frontend mode) |
| `getMCPCallLog()` | Retrieve call history |

---

## 7. Event Bus

**Source File**: `/src/lib/event-bus.ts`

### 7.1 Event Categories (Five Dimensions)

| Category | Dimension | Color | Description |
|----------|-----------|-------|-------------|
| `orchestrate` | D1 Intelligence | cyan | Agent collaboration events |
| `persist` | D2 Data | green | Persistence engine events |
| `mcp` | D3 Architecture | amber | MCP tool chain events |
| `ui` | D4 Experience | purple | User interaction events |
| `security` | D5 Security | red | Audit & encryption events |
| `system` | SYS | zinc | Cluster/device/network events |

### 7.2 API

| Method | Description |
|--------|-------------|
| `eventBus.emit(event)` | Publish event to all subscribers |
| `eventBus.on(fn, filter?)` | Subscribe with optional filter |
| `eventBus.off(subscriptionId)` | Unsubscribe |
| `eventBus.getHistory(n?)` | Get last N events from ring buffer |
| `eventBus.getByCategory(cat, n?)` | Filter history by category |
| `eventBus.persist(type, msg)` | Convenience: emit persist event |
| `eventBus.orchestrate(type, msg)` | Convenience: emit orchestrate event |
| `eventBus.mcp(type, msg)` | Convenience: emit MCP event |
| `eventBus.system(type, msg)` | Convenience: emit system event |
| `eventBus.security(type, msg)` | Convenience: emit security event |

### 7.3 React Hooks

| Hook | Description |
|------|-------------|
| `useEventBus(filter?, maxItems?)` | Reactive subscription, returns BusEvent[] |
| `useEventBusVersion()` | Lightweight re-render trigger on any event |

---

## 8. Persistence Engine

**Source File**: `/src/lib/persistence-engine.ts`

### 8.1 Persist Domains (17)

| Domain | Data Type | Description |
|--------|-----------|-------------|
| `chat_sessions` | Session records | Terminal chat sessions |
| `chat_messages` | Message records | Chat messages per session |
| `agent_sessions` | Agent session records | Agent session metadata |
| `agent_messages` | Agent message records | Agent chat histories |
| `metrics_snapshots` | Cluster metrics | 30s interval snapshots |
| `system_logs` | Log entries | System event logs |
| `workflows` | DAG workflows | CI/CD pipeline definitions |
| `templates` | Custom templates | User-created templates |
| `artifacts` | Code artifacts | Generated code/configs |
| `mcp_registry` | MCP servers | Custom MCP server definitions |
| `mcp_call_log` | Call records | MCP call history |
| `device_configs` | Device configs | Cluster device settings |
| `llm_configs` | Provider configs | API keys & endpoints |
| `llm_usage` | Usage records | Token consumption tracking |
| `preferences` | Key-value pairs | User preferences |
| `knowledge_base` | KB articles | Knowledge base entries |
| `agent_profiles` | Agent profiles | Agent identity cards |

### 8.2 Storage Adapters

| Adapter | Backend | Priority | Description |
|---------|---------|----------|-------------|
| `LocalStorageAdapter` | Browser localStorage | Default | Always available, offline-first |
| `NasSQLiteAdapter` | NAS SQLite HTTP Proxy | Primary (when online) | Dual-write with localStorage |

---

## 9. Crypto Module

**Source File**: `/src/lib/crypto.ts`

| Function | Description |
|----------|-------------|
| `encrypt(plaintext, passphrase)` | AES-GCM 256-bit encryption |
| `decrypt(ciphertext, passphrase)` | AES-GCM 256-bit decryption |
| `getDeviceSalt()` | Get/generate persistent device salt |

**Key Derivation**: PBKDF2, 100,000 iterations, SHA-256

---

## 10. WebSocket Endpoints

| Endpoint | Port | Protocol | Description |
|----------|------|----------|-------------|
| `ws://localhost:3001/ws` | 3001 | WS | Main data stream (metrics, logs) |
| `ws://192.168.3.45:9090/ws/heartbeat` | 9090 | WS | Family presence heartbeat relay |

### 10.1 Ollama API (Direct HTTP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `http://localhost:11434/api/tags` | List installed models |
| `GET` | `http://localhost:11434/api/ps` | List running models |
| `POST` | `http://localhost:11434/api/generate` | Generate completion |
| `POST` | `http://localhost:11434/api/chat` | Chat completion |
| `POST` | `http://localhost:11434/api/pull` | Pull model |
| `DELETE` | `http://localhost:11434/api/delete` | Delete model |

---

## 11. Environment Variables & Configuration

### 11.1 localStorage Keys

| Key | Module | Description |
|-----|--------|-------------|
| `yyc3-llm-provider-config` | llm-bridge.ts | Encrypted provider API keys & endpoints |
| `yyc3-llm-usage` | llm-bridge.ts | Token usage records (last 1000) |
| `yyc3-device-configs` | nas-client.ts | Device registry overrides |
| `yyc3-nas-sqlite-config` | nas-client.ts | SQLite proxy connection config |
| `yyc3-docker-config` | nas-client.ts | Docker Engine API config |
| `yyc3-mcp-registry` | mcp-protocol.ts | Custom MCP server definitions |
| `yyc3-mcp-call-log` | mcp-protocol.ts | MCP call history (last 200) |
| `yyc3-crypto-salt` | crypto.ts | Device-specific encryption salt |
| `yyc3_sessions` | api.ts | Cached chat sessions |
| `yyc3_messages_*` | api.ts | Cached messages per session |
| `yyc3_projects` | api.ts | Cached projects |
| `yyc3_artifacts` | api.ts | Cached artifacts |
| `yyc3_logs` | api.ts | Cached system logs |
| `yyc3_pref_*` | api.ts | User preferences |

### 11.2 Network Configuration Defaults

| Config | Default Value | Override Method |
|--------|--------------|-----------------|
| API Base URL | `http://localhost:3001/api/v1` | Modify `api.ts` constant |
| NAS SQLite Host | `192.168.3.45:8484` | localStorage `yyc3-nas-sqlite-config` |
| NAS SQLite DB Path | `/Volume2/yyc3/yyc3.db` | localStorage `yyc3-nas-sqlite-config` |
| Docker Host | `192.168.3.45:2375` | localStorage `yyc3-docker-config` |
| Docker API Version | `v1.41` | localStorage `yyc3-docker-config` |
| Ollama Endpoint | `http://localhost:11434` | Provider config |

---

## 12. Error Code Reference

### 12.1 LLM Error Codes

| Code | HTTP Status | Retryable | Description |
|------|-------------|-----------|-------------|
| `AUTH_FAILED` | 401, 403 | No | Invalid API key |
| `RATE_LIMITED` | 429 | Yes | Rate limit exceeded |
| `CONTEXT_TOO_LONG` | 400 | No | Input exceeds context window |
| `MODEL_NOT_FOUND` | 404 | No | Model ID not available |
| `NETWORK_ERROR` | - | Yes | Network connectivity issue |
| `CORS_ERROR` | - | Yes | CORS policy blocked |
| `TIMEOUT` | - | Yes | Request timeout |
| `PROVIDER_ERROR` | 5xx | Yes | Server-side error |
| `UNKNOWN` | Other | No | Unclassified error |

### 12.2 Circuit Breaker States

| State | Behavior | Transition |
|-------|----------|------------|
| `CLOSED` | All requests pass through | -> OPEN after 3 failures in 60s |
| `OPEN` | All requests blocked | -> HALF_OPEN after 30s cooldown |
| `HALF_OPEN` | 1 test request allowed | -> CLOSED on success, -> OPEN on failure |

---

## 13. Phase 26 — TypeScript Compliance Update

### 13.1 Zero `as any` Enforcement

All API-facing modules now use typed interfaces instead of `any`:

| Module | Before | After |
|--------|--------|-------|
| `persistence-engine.ts` | `(item as any).id` | `(item as Record<string, unknown>).id` with `typeof` guard |
| `persistence-binding.ts` | `chatMsgs.filter((m: any) => ...)` | `chatMsgs.filter((m: unknown) => { ... })` with domain cast |
| `agent-orchestrator.ts` | `(globalThis as any).__yyc3_event_bus_ref` | `EventBusRef` interface + typed global access |

### 13.2 localStorage Key Registry

See `/docs/env-variables-reference.md` for complete inventory of 27 localStorage keys used across 12 modules.

### 13.3 Test Coverage for API Functions

| API Function | Test ID | Status |
|-------------|---------|--------|
| `loadProviderConfigs()` | LLM-02 | PASS |
| `saveProviderConfigs()` | LLM-02 | PASS |
| `hasConfiguredProvider()` | LLM-01, LLM-03-05 | PASS |
| `getEnabledProviderIds()` | LLM-06 | PASS |
| `getPersistenceEngine()` | mod:persistence | PASS |
| `_registerEventBusRef()` | mod:agent_orchestrator | PASS |

---

## 14. Phase 28-29 — Stream Diagnostics & Zod Validation Layer

### 14.1 Stream Diagnostics Console Panel (Phase 28)

**Source File**: `/src/app/components/console/StreamDiagnostics.tsx`

Real-time E2E streaming test tool for all configured LLM providers.

| Feature | Description |
|---------|-------------|
| Provider Health Check | Batch-test all enabled providers for connectivity |
| E2E Stream Test | Send prompt, measure TTFT + throughput + completion |
| Circuit Breaker Status | Display current CLOSED/OPEN/HALF_OPEN per provider |
| Test Presets | Ping (Simple), Count (Medium), Code Gen (Complex) |

### 14.2 Zod v4 Validation Layer (Phase 26-28)

**Source File**: `/src/lib/persist-schemas.ts`

| Schema | Domain | Hydration | Write |
|--------|--------|-----------|-------|
| `ChatMessageSchema` | `chat_messages` | YES | Planned |
| `AgentChatMessageSchema` | `agent_messages` | YES | Planned |
| `AgentHistoryRecordSchema` | `agent_messages` | YES | Planned |
| `SystemLogSchema` | `system_logs` | YES | Planned |
| `PreferencesSchema` | `preferences` | Planned | Planned |
| `KnowledgeEntrySchema` | `knowledge_base` | Planned | Planned |
| `LLMProviderConfigSchema` | `llm_configs` | Planned | Planned |
| `NodeMetricsSchema` | `metrics_snapshots` | Planned | Planned |
| `MetricsSnapshotSchema` | `metrics_snapshots` | Planned | Planned |

### 14.3 Test Inventory (Phase 29)

| Layer | Count | Environment | Source File |
|-------|-------|-------------|-------------|
| In-App Core Logic Tests | 65 | Browser | `core-test-suite.ts` |
| In-App Zod Schema Tests | 18 | Browser | `core-test-suite.ts` |
| Vitest Zod Schema Tests | 44 | Node.js / CI | `persist-schemas.test.ts` |
| Smoke Tests | 25 targets | Browser | `SmokeTestRunner.tsx` |
| **Total Unique Tests** | **151+** | | |

### 14.4 Console Tab Registry (21 Tabs)

| # | Tab ID | Label | Phase |
|---|--------|-------|-------|
| 1 | `dashboard` | Dashboard | P4 |
| 2 | `ai` | AI Center | P7 |
| 3 | `agent_identity` | Agent Identity | P19 |
| 4 | `family_presence` | Family Presence | P19 |
| 5 | `knowledge_base` | Knowledge Base | P19 |
| 6 | `token_usage` | Token Usage | P14 |
| 7 | `ollama_manager` | Ollama Manager | P23 |
| 8 | `architecture` | Architecture | P4 |
| 9 | `docker` | Docker Manager | P15 |
| 10 | `devops` | DevOps Terminal | P12 |
| 11 | `mcp` | MCP Builder | P16 |
| 12 | `persist` | Persistence | P17 |
| 13 | `orchestrate` | Orchestrator | P17 |
| 14 | `nas_deployment` | NAS Deploy | P21 |
| 15 | `metrics_history` | Metrics History | P22 |
| 16 | `remote_docker_deploy` | Remote Deploy | P22 |
| 17 | `api_docs` | API Docs | P23 |
| 18 | `smoke_test` | Smoke Test | P24 |
| 19 | `test_framework` | Test Framework | P25 |
| 20 | `stream_diagnostics` | Stream Diagnostics | P28 |
| 21 | `settings` | Settings | P4 |

### 14.5 Project Infrastructure Files (Phase 29)

| File | Purpose | Status |
|------|---------|--------|
| `tsconfig.json` | TypeScript strict mode configuration | NEW |
| `index.html` | Vite SPA entry point | NEW |
| `src/main.tsx` | React root mount with StrictMode | NEW |
| `src/vite-env.d.ts` | Vite `import.meta.env` type declarations (22 vars) | NEW |
| `.env.example` | Complete environment variable template (44 vars) | NEW |
| `.gitignore` | Git ignore rules | NEW |
| `public/favicon.svg` | App favicon (gemstone blue Y3) | NEW |

---

> **YYC3 Hacker Chatbot** - API Routes Documentation v29.0
> Updated: 2026-02-16
