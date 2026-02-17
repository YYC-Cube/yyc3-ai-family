---
@file: 999-YYC3-Family-AI-原型交互-API路由.md
@description: YYC3-Family-AI原型交互API路由，定义了全局API路由文档和接口规范
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-16
@updated: 2026-02-17
@status: published
@tags: [原型交互],[API路由],[接口文档]
---

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 999-YYC3-Family-AI-原型交互-API路由

## 概述

本文档详细描述YYC³(YanYuCloudCube)-Family-AI-原型交互-API路由相关内容，YYC³-Family-AI不仅仅是一个软件系统，而是一个"智能生命体"。它以"五化一体"为法则，以插件化架构为骨骼，以AI能力为灵魂，构建一个能够自我进化、持续学习的智能协同平台。

基于**行业应用开发全生命周期闭环架构**，本文档整合了**YYC3 -π³无边界设计理念**与**大数据技术栈**，为YYC3 Family-π³ Chatbot的全局API路由提供完整的文档。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景

YYC³(YanYuCloudCube)-Family-AI 本地一站式智能工作平台是一个**完全本地化、一体化、自进化**的智能工作生态系统。它以"五化一体"为法则，以Family-AI为核心，以多机协同为骨架，以NAS存储为基石，构建一个能够学习、积累、生成、迭代的闭环智能平台。

**版本**：Phase 29.0 | **更新日期**：2026-02-16
**架构**：纯前端SPA -> 本地NAS/集群直连

#### 1.2 文档目标
- 提供全局API路由的完整参考
- 定义REST API服务层
- 规范NAS和集群客户端
- 确保API接口的一致性

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

#### 3.1 降级策略

所有API模块实现**双写回退**模式：
1. 尝试远程端点 (NAS/Server)
2. 失败时 -> 降级到 `localStorage` 模拟
3. 队列化待写入操作，在连接恢复时同步

### 4. REST API服务层

**基础URL**：`http://localhost:3001/api/v1`
**超时**：5000ms
**源文件**：`/src/lib/api.ts`

#### 4.1 健康检查

| 方法 | 端点 | 描述 | 响应 |
|--------|----------|-------------|----------|
| `GET` | `/health` | 系统健康检查 | `{ status, db, uptime }` |

#### 4.2 会话API

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `GET` | `/sessions` | 列出所有聊天会话 | - | `DBSession[]` |
| `POST` | `/sessions` | 创建新会话 | `{ title: string }` | `DBSession` |
| `PATCH` | `/sessions/:id/archive` | 归档会话 | - | `void` |

**DBSession架构**：
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

#### 4.3 消息API

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `GET` | `/sessions/:id/messages` | 列出会话中的消息 | - | `DBMessage[]` |
| `POST` | `/sessions/:id/messages` | 创建消息 | `{ role, content, agent_name?, agent_role?, timestamp }` | `DBMessage` |

**DBMessage架构**：
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

### 5. NAS和集群客户端

**基础URL**：`http://192.168.3.45:8484/api/db`
**超时**：3000ms
**源文件**：`/src/lib/nas-client.ts`

#### 5.1 数据库查询

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `POST` | `/query` | 执行SQL查询 | `{ sql: string, params?: any[] }` | `{ rows: any[], columns: string[] }` |
| `POST` | `/batch` | 批量执行查询 | `{ queries: Query[] }` | `Result[]` |

#### 5.2 文件操作

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `GET` | `/files/list` | 列出目录文件 | `{ path: string }` | `FileInfo[]` |
| `POST` | `/files/upload` | 上传文件 | `FormData` | `{ success: boolean, path: string }` |
| `DELETE` | `/files/delete` | 删除文件 | `{ path: string }` | `{ success: boolean }` |

### 6. LLM Bridge API

**源文件**：`/src/lib/llm-bridge.ts`

#### 6.1 流式聊天

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `POST` | `/llm/chat/stream` | 流式聊天 | `{ messages, provider, model, stream: true }` | `SSE Stream` |
| `POST` | `/llm/chat` | 非流式聊天 | `{ messages, provider, model }` | `{ content, usage }` |

#### 6.2 提供商管理

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `GET` | `/llm/providers` | 列出所有提供商 | - | `ProviderConfig[]` |
| `POST` | `/llm/providers/config` | 配置提供商 | `{ provider, config }` | `ProviderConfig` |
| `DELETE` | `/llm/providers/:id` | 删除提供商配置 | - | `void` |

### 7. LLM智能路由器

**源文件**：`/src/lib/llm-router.ts`

#### 7.1 路由决策

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `POST` | `/router/route` | 获取最优路由 | `{ agent_id, task_type, context }` | `{ provider, model, confidence }` |
| `GET` | `/router/health` | 获取路由器健康状态 | - | `{ providers: ProviderHealth[] }` |

#### 7.2 故障转移

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `POST` | `/router/failover` | 执行故障转移 | `{ failed_provider, context }` | `{ new_provider, retry_count }` |
| `GET` | `/router/failover/history` | 获取故障转移历史 | - | `FailoverRecord[]` |

### 8. MCP协议层

**源文件**：`/src/lib/mcp-protocol.ts`

#### 8.1 服务器管理

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `GET` | `/mcp/servers` | 列出MCP服务器 | - | `MCPServer[]` |
| `POST` | `/mcp/servers/start` | 启动MCP服务器 | `{ server_id, config }` | `{ pid, status }` |
| `POST` | `/mcp/servers/stop` | 停止MCP服务器 | `{ server_id }` | `{ success: boolean }` |

#### 8.2 工具调用

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `POST` | `/mcp/tools/call` | 调用MCP工具 | `{ server_id, tool_name, arguments }` | `{ result, error }` |
| `GET` | `/mcp/tools/list` | 列出可用工具 | `{ server_id }` | `Tool[]` |

### 9. 事件总线

**源文件**：`/src/lib/event-bus.ts`

#### 9.1 事件发布

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `POST` | `/events/publish` | 发布事件 | `{ event_type, payload, timestamp }` | `{ success: boolean, event_id }` |

#### 9.2 事件订阅

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `POST` | `/events/subscribe` | 订阅事件 | `{ event_types, callback }` | `{ subscription_id }` |
| `DELETE` | `/events/subscribe/:id` | 取消订阅 | - | `void` |

### 10. 持久化引擎

**源文件**：`/src/lib/persistence-engine.ts`

#### 10.1 数据持久化

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `POST` | `/persist/save` | 保存数据 | `{ key, value, strategy }` | `{ success: boolean }` |
| `GET` | `/persist/load` | 加载数据 | `{ key, strategy }` | `{ value }` |
| `DELETE` | `/persist/delete` | 删除数据 | `{ key, strategy }` | `{ success: boolean }` |

### 11. 加密模块

**源文件**：`/src/lib/crypto.ts`

#### 11.1 加密解密

| 方法 | 端点 | 描述 | 请求体 | 响应 |
|--------|----------|-------------|-------------|----------|
| `POST` | `/crypto/encrypt` | 加密数据 | `{ data, key }` | `{ encrypted, iv }` |
| `POST` | `/crypto/decrypt` | 解密数据 | `{ encrypted, iv, key }` | `{ data }` |
| `POST` | `/crypto/hash` | 哈希数据 | `{ data, algorithm }` | `{ hash }` |

### 12. WebSocket端点

#### 12.1 心跳WebSocket

| 协议 | 端点 | 描述 |
|--------|----------|-------------|
| WS | `ws://192.168.3.45:9090/ws/heartbeat` | 设备存在心跳 |

#### 12.2 应用WebSocket

| 协议 | 端点 | 描述 |
|--------|----------|-------------|
| WS | `ws://localhost:3001/ws` | 应用实时通信 |

### 13. 错误代码参考

| 代码 | 描述 | HTTP状态 |
|------|------|----------|
| `ERR_0001` | 网络连接失败 | 503 |
| `ERR_0002` | 数据库查询错误 | 500 |
| `ERR_0003` | LLM API错误 | 502 |
| `ERR_0004` | 认证失败 | 401 |
| `ERR_0005` | 权限不足 | 403 |
| `ERR_0006` | 请求超时 | 408 |
| `ERR_0007` | 数据验证失败 | 400 |
| `ERR_0008` | 资源未找到 | 404 |
| `ERR_0009` | 服务器内部错误 | 500 |

### 14. 实施指南

#### 14.1 组件架构

**API核心组件**：
- APIServiceLayer：API服务层
- NASClient：NAS客户端
- LLMBridge：LLM桥接
- LLMRouter：LLM路由器
- MCPProtocol：MCP协议层
- EventBus：事件总线
- PersistenceEngine：持久化引擎
- CryptoModule：加密模块

#### 14.2 性能优化

**API优化**：
- 请求批处理
- 响应缓存
- 连接池管理
- 超时控制

#### 14.3 可访问性

**无障碍设计**：
- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式
- 焦点管理

### 15. 维护与更新

#### 15.1 版本管理

- API路由版本：1.0.0
- 最后更新：2026-02-17
- 维护团队：YanYuCloudCube DevOps Team

#### 15.2 更新流程

1. 评估API变更需求
2. 设计新的API方案
3. 测试API的有效性
4. 更新API文档
5. 通知开发团队实施变更
6. 进行回归测试

#### 15.3 反馈收集

- 通过用户调研收集API使用反馈
- 通过A/B测试验证API方案效果
- 定期审查API的有效性
- 收集开发团队的实现反馈

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
