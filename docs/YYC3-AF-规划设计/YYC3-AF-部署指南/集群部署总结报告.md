# YYC³ AI Family - 集群部署总结报告

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

**文档版本**: 1.0.0
**部署日期**: 2026-02-22
**部署状态**: ✅ 完成
**项目阶段**: L01 基础设施层 + L02 数据存储层 + L04 AI 智能层

---

## 📋 目录

1. [部署概述](#1-部署概述)
2. [集群架构](#2-集群架构)
3. [节点配置](#3-节点配置)
4. [服务部署](#4-服务部署)
5. [模型分布](#5-模型分布)
6. [智能体映射](#6-智能体映射)
7. [网络拓扑](#7-网络拓扑)
8. [文档索引](#8-文档索引)
9. [下一步计划](#9-下一步计划)

---

## 1. 部署概述

### 1.1 部署目标

构建 YYC³ AI Family 的基础设施层 (L01)、数据存储层 (L02) 和 AI 智能层 (L04)，实现：

- ✅ 多节点协同的硬件集群
- ✅ 分布式数据库服务
- ✅ 向量数据库支持
- ✅ 多节点 Ollama 推理服务
- ✅ 7 大智能体模型部署

### 1.2 部署成果

| 维度 | 成果 |
|------|------|
| **节点数量** | 3 个活跃节点 (M4 Max, NAS, iMac M4) |
| **数据库服务** | 2 个 PostgreSQL + 1 个 Redis |
| **AI 模型** | 14+ 个本地模型 |
| **服务端口** | 12+ 个服务端口 |
| **文档产出** | 6 份详细文档 |

---

## 2. 集群架构

### 2.1 架构图

```
                    ┌─────────────────────────────────────────────────────┐
                    │              YYC³ Cluster Network                   │
                    │                192.168.3.x/24                       │
                    └────────────────────────┬────────────────────────────┘
                                             │
        ┌────────────────────────────────────┼────────────────────────────────────┐
        │                                    │                                    │
   ┌────┴────┐                        ┌──────┴──────┐                     ┌──────┴──────┐
   │ M4 Max  │                        │ YanYuCloud  │                     │   iMac M4   │
   │ (Main)  │◄──────────────────────►│    NAS      │◄───────────────────►│  (yyc3-77)  │
   │ 编排器   │                        │  数据中心    │                     │  辅助推理    │
   └────┬────┘                        └──────┬──────┘                     └──────┬──────┘
        │                                    │                                    │
        │  ┌─────────────────────────────────┴────────────────────────────────┐   │
        │  │                        服务分布                                   │   │
        │  │  M4 Max: Frontend(3200), API(3210), Ollama(11434), PG(5433)      │   │
        │  │  NAS: pgvector(5434), Docker(2375), Ollama(11434), WS(9090)      │   │
        │  │  iMac: Ollama(11434), SSH(22)                                     │   │
        │  └──────────────────────────────────────────────────────────────────┘   │
        │                                                                           │
        └───────────────────────────────────────────────────────────────────────────┘
```

### 2.2 九层架构映射

| 层级 | 名称 | 部署状态 | 说明 |
|------|------|----------|------|
| L01 | 基础设施层 | ✅ 完成 | 硬件集群、网络配置 |
| L02 | 数据存储层 | ✅ 完成 | PostgreSQL, Redis, pgvector |
| L03 | 核心服务层 | 🟡 规划中 | API Gateway, 认证服务 |
| L04 | AI 智能层 | ✅ 完成 | Ollama, 7 智能体模型 |
| L05 | 业务逻辑层 | 🟡 规划中 | 业务流程编排 |
| L06 | 应用表现层 | 🟡 规划中 | 前端 UI |
| L07 | 用户交互层 | 🟡 规划中 | 多渠道接入 |
| L08 | 扩展演进层 | 🟡 规划中 | 插件生态 |
| L09 | 系统设置层 | 🟡 规划中 | 全局配置 |

---

## 3. 节点配置

### 3.1 M4 Max (编排器/主力)

| 项目 | 配置 |
|------|------|
| **设备** | MacBook Pro M4 Max |
| **芯片** | Apple M4 Max (16P + 40E) |
| **内存** | 128 GB |
| **存储** | 4 TB SSD |
| **IP** | localhost / 192.168.3.x |
| **角色** | 编排器、主力推理节点 |

**部署服务**:
- PostgreSQL 15 (yyc3_aify) - 端口 5433
- Redis - 端口 6379
- Ollama - 端口 11434
- AI Family Frontend - 端口 3200
- API Server - 端口 3210
- WebSocket Server - 端口 3001

### 3.2 YanYuCloud NAS (数据中心)

| 项目 | 配置 |
|------|------|
| **设备** | 铁威马 F4-423 |
| **CPU** | Intel Quad Core |
| **内存** | 32 GB |
| **存储** | 32 TB HDD (RAID6) + 4 TB SSD |
| **IP** | 192.168.3.45 |
| **角色** | 数据中心、存储节点 |

**部署服务**:
- pgvector (yyc3_vectors) - 端口 5434
- Docker API - 端口 2375
- Ollama - 端口 11434
- WebSocket Heartbeat - 端口 9090
- SQLite HTTP Proxy - 端口 8484
- SSH - 端口 9557
- Web 管理 - 端口 9898

### 3.3 iMac M4 (辅助推理)

| 项目 | 配置 |
|------|------|
| **设备** | iMac (Mac16,3) |
| **芯片** | Apple M4 (4P + 6E) |
| **内存** | 32 GB |
| **存储** | 926 GB SSD |
| **IP** | 192.168.3.77 |
| **角色** | 辅助推理节点 |

**部署服务**:
- Ollama - 端口 11434
- SSH - 端口 22

---

## 4. 服务部署

### 4.1 数据库服务

| 服务 | 主机 | 端口 | 用途 | 状态 |
|------|------|------|------|------|
| PostgreSQL (yyc3_aify) | M4 Max | 5433 | 主数据库 | ✅ |
| pgvector (yyc3_vectors) | NAS | 5434 | 向量数据库 | ✅ |
| Redis | M4 Max | 6379 | 缓存服务 | ✅ |

### 4.2 AI 模型服务

| 服务 | 主机 | 端口 | 版本 | 状态 |
|------|------|------|------|------|
| Ollama | M4 Max | 11434 | Latest | ✅ |
| Ollama | NAS | 11434 | Docker | ✅ |
| Ollama | iMac | 11434 | 0.16.3 | ✅ |

### 4.3 Web 服务

| 服务 | 主机 | 端口 | 框架 | 状态 |
|------|------|------|------|------|
| Frontend | M4 Max | 3200 | React + Vite | 🟡 待启动 |
| API Server | M4 Max | 3210 | Express | 🟡 待启动 |
| WebSocket | M4 Max | 3001 | ws | 🟡 待启动 |

### 4.4 NAS 基础服务

| 服务 | 端口 | 状态 |
|------|------|------|
| Docker API | 2375 | ✅ |
| SQLite HTTP | 8484 | ✅ |
| WebSocket Relay | 9090 | ✅ |
| SSH | 9557 | ✅ |
| Web 管理 | 9898 | ✅ |

---

## 5. 模型分布

### 5.1 M4 Max 模型

| 模型 | 参数量 | 大小 | 用途 |
|------|--------|------|------|
| codegeex4:latest | 9.4B | 5.4 GB | 代码生成 |
| qwen2.5:7b | 7.6B | 4.7 GB | 通用对话 |
| qwen2.5-coder:1.5b | 1.5B | 0.9 GB | 轻量代码 |
| nomic-embed-text | 137M | 0.3 GB | 文本嵌入 |

### 5.2 iMac M4 模型

| 模型 | 参数量 | 大小 | 用途 | 智能体 |
|------|--------|------|------|--------|
| glm4:9b | 9B | 5.5 GB | 核心协调 | Pivot |
| phi3:mini | 3.8B | 2.2 GB | 安全哨兵 | Sentinel |
| codegeex4:latest | 9.4B | 5.5 GB | 代码评估 | Bole |
| phi3:14b | 14B | 7.9 GB | 备用 | Sentinel |
| llama3:latest | 8B | 4.7 GB | 通用 | - |
| codellama:latest | 7B | 3.8 GB | 代码 | - |
| mixtral:latest | 47B | 26 GB | 大模型 | - |

### 5.3 模型存储统计

| 节点 | 存储路径 | 大小 |
|------|----------|------|
| M4 Max | ~/.ollama/models | ~11 GB |
| iMac M4 | ~/.ollama/models | 52 GB |
| NAS | Docker Volume | - |

---

## 6. 智能体映射

### 6.1 七大智能体部署

| 智能体 | 角色 | 主模型 | 备用模型 | 部署节点 | 状态 |
|--------|------|--------|----------|----------|------|
| **Navigator** | 领航员 | ChatGLM3-6B | Qwen2.5-7B | M4 Max | 🟡 待部署主模型 |
| **Thinker** | 思想家 | DeepSeek-V3 | CodeGeeX4-9B | API + M4 Max | ✅ |
| **Prophet** | 先知 | Qwen2.5-7B | DeepSeek-V3 | M4 Max | ✅ |
| **Bole** | 伯乐 | CodeGeeX4-9B | Qwen2.5-7B | iMac M4 | ✅ |
| **Sentinel** | 哨兵 | Phi-3-mini | Phi-3-14B | iMac M4 | ✅ |
| **Pivot** | 天枢 | GLM4-9B | Qwen2.5-7B | iMac M4 | ✅ |
| **Grandmaster** | 宗师 | DeepSeek-V3 | Qwen2.5-14B | API + M4 Max | ✅ |

### 6.2 智能体 API 端点

```typescript
const agentEndpoints = {
  navigator: 'http://localhost:11434',      // M4 Max
  thinker: 'https://api.deepseek.com',      // Cloud API
  prophet: 'http://localhost:11434',        // M4 Max
  bole: 'http://192.168.3.77:11434',        // iMac M4
  sentinel: 'http://192.168.3.77:11434',    // iMac M4
  pivot: 'http://192.168.3.77:11434',       // iMac M4
  grandmaster: 'https://api.deepseek.com',  // Cloud API
};
```

---

## 7. 网络拓扑

### 7.1 端口分布

| 端口 | 服务 | 主机 | 访问范围 |
|------|------|------|----------|
| 22 | SSH | iMac | 内网 |
| 3001 | WebSocket | M4 Max | 本地 |
| 3200 | Frontend | M4 Max | 本地 |
| 3210 | API Server | M4 Max | 本地 |
| 5433 | PostgreSQL | M4 Max | 本地 |
| 5434 | pgvector | NAS | 内网 |
| 6379 | Redis | M4 Max | 本地 |
| 8484 | SQLite HTTP | NAS | 内网 |
| 9090 | WS Relay | NAS | 内网 |
| 9557 | SSH | NAS | 内网 |
| 9898 | NAS Web | NAS | 内网 |
| 11434 | Ollama | M4 Max/NAS/iMac | 内网 |
| 2375 | Docker API | NAS | 内网 |

### 7.2 SSH 配置

```bash
# ~/.ssh/config

# NAS
Host nas
    HostName 192.168.3.45
    User YYC
    Port 9557
    IdentityFile ~/.ssh/yyc3_ed25519

# iMac M4
Host yyc3-77
    HostName 192.168.3.77
    User my
    Port 22
    IdentityFile ~/.ssh/yyc3_ed25519
```

---

## 8. 文档索引

### 8.1 已生成文档

| 文档名称 | 路径 | 说明 |
|----------|------|------|
| L01-基础设施层完整部署报告 | [docs/L01-基础设施层完整部署报告.md](./L01-基础设施层完整部署报告.md) | NAS 服务部署、硬件拓扑 |
| 7大智能体模型选型与部署规划 | [docs/7大智能体模型选型与部署规划.md](./7大智能体模型选型与部署规划.md) | 智能体模型映射 |
| NAS-pgvector向量数据库部署指南 | [docs/NAS-pgvector向量数据库部署指南.md](./NAS-pgvector向量数据库部署指南.md) | 向量数据库部署 |
| 服务连接配置手册 | [docs/服务连接配置手册.md](./服务连接配置手册.md) | 全栈服务连接配置 |
| iMac-M4-yyc3-77部署报告 | [docs/iMac-M4-yyc3-77部署报告.md](./iMac-M4-yyc3-77部署报告.md) | iMac 节点部署 |

### 8.2 相关配置文件

| 文件 | 路径 | 说明 |
|------|------|------|
| 环境变量 | Max-Management/Max_Postgres/.env.combined | 全量环境配置 |
| SSH 配置 | ~/.ssh/config | SSH 别名配置 |
| Ollama 模型 | ~/.ollama/models | 模型存储目录 |

---

## 9. 下一步计划

### 9.1 待完成任务

| 任务 | 优先级 | 状态 |
|------|--------|------|
| 部署 ChatGLM3-6B 到 M4 Max | 高 | 🟡 待执行 |
| 配置云端 API Keys | 高 | 🟡 待执行 |
| 实现 LLM Bridge 智能路由 | 高 | 🟡 待执行 |
| 启动 AI Family Frontend | 高 | 🟡 待执行 |
| 启动 API Server | 高 | 🟡 待执行 |
| 集成测试 | 高 | 🟡 待执行 |

### 9.2 项目启动测试清单

```bash
# 1. 检查所有服务连接
./scripts/test-all-connections.sh

# 2. 启动前端
cd Family-π³/AI-Family && pnpm dev

# 3. 启动 API
cd Family-π³/API && pnpm dev

# 4. 测试 Ollama 连接
curl http://localhost:11434/api/tags
curl http://192.168.3.77:11434/api/tags

# 5. 测试数据库连接
psql -h localhost -p 5433 -U yyc3 -d yyc3_aify -c "SELECT 1"
PGPASSWORD=yyc3_vector_2026 psql -h 192.168.3.45 -p 5434 -U yyc3 -d yyc3_vectors -c "SELECT 1"

# 6. 测试向量功能
PGPASSWORD=yyc3_vector_2026 psql -h 192.168.3.45 -p 5434 -U yyc3 -d yyc3_vectors -c "SELECT * FROM documents LIMIT 1"
```

### 9.3 里程碑

| 阶段 | 目标 | 状态 |
|------|------|------|
| Phase 1 | 基础设施部署 | ✅ 完成 |
| Phase 2 | 数据存储层部署 | ✅ 完成 |
| Phase 3 | AI 模型层部署 | ✅ 完成 |
| Phase 4 | 核心服务层开发 | 🟡 进行中 |
| Phase 5 | 业务逻辑层开发 | 🔲 待开始 |
| Phase 6 | 应用表现层开发 | 🔲 待开始 |

---

## 附录

### A. 快速启动命令

```bash
# 连接各节点
ssh nas          # 连接 NAS
ssh yyc3-77      # 连接 iMac

# 数据库连接
psql -h localhost -p 5433 -U yyc3 -d yyc3_aify                    # 主数据库
PGPASSWORD=yyc3_vector_2026 psql -h 192.168.3.45 -p 5434 -U yyc3 -d yyc3_vectors  # 向量数据库
redis-cli -h localhost -p 6379                                    # Redis

# Ollama 测试
curl http://localhost:11434/api/tags          # M4 Max
curl http://192.168.3.45:11434/api/tags       # NAS
curl http://192.168.3.77:11434/api/tags       # iMac

# 启动项目
cd Family-π³/AI-Family && pnpm dev            # 前端
cd Family-π³/API && pnpm dev                  # API
```

### B. 故障排查

| 问题 | 解决方案 |
|------|----------|
| NAS SSH 连接失败 | 检查端口 9557，确认 NAS 开机 |
| PostgreSQL 连接失败 | 检查服务状态 `pg_isready -h localhost -p 5433` |
| Ollama 模型加载失败 | 重启服务 `ollama serve` |
| iMac 连接失败 | 使用 `ssh yyc3-77` 别名连接 |

---

<div align="center">

**YYC³ AI Family**

*言启象限 | 语枢未来*

**万象归元于云枢 | 深栈智启新纪元**

**亦师亦友亦伯乐；一言一语一协同**

---

*文档版本: 1.0.0*
*最后更新: 2026-02-22*
*作者: YYC³ Team*

</div>
