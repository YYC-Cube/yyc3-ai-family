# YYC³ AI Family — 数据库集成文档

> **YanYuCloudCube**
> 言启象限 | 语枢未来
> **Words Initiate Quadrants, Language Serves as Core for the Future**

---

## 📋 文档概述

本文档详细记录了 YYC³ AI Family 项目的数据库集成方案，包括：

- 数据库 Schema 设计
- 迁移脚本
- 连接模块
- 数据闭环 API
- 验证方法

---

## 🗄️ 数据库架构

### 连接信息

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **主机** | `localhost` | 本地开发 |
| **端口** | `5433` | 避免与系统默认冲突 |
| **数据库名** | `yyc3_aify` | AI Family 数据库 |
| **用户** | `yyc3_aify` | 专用用户 |
| **密码** | `Yyc3_Aify_2026_Secure!` | 安全密码 |

### Schema 结构

```
yyc3_aify/
├── core/                   # 核心业务数据
│   ├── models              # 模型配置
│   ├── agents              # Agent配置
│   ├── conversations       # 会话
│   ├── messages            # 消息
│   ├── inference_logs      # 推理记录
│   ├── authorizations      # 授权验证
│   ├── user_preferences    # 用户偏好
│   └── system_config       # 系统配置
├── telemetry/              # 遥测数据
│   ├── node_metrics        # 节点指标
│   └── service_latency     # 服务延迟
└── analytics/              # 分析数据
    └── usage_stats         # 使用统计
```

---

## 📊 表结构设计

### 1. core.models (模型配置)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) | 主键 |
| `name` | VARCHAR(128) | 模型名称 |
| `provider` | VARCHAR(32) | 提供商 |
| `tier` | VARCHAR(16) | 层级 (local/cloud-free/cloud-paid/authorized) |
| `categories` | VARCHAR(64)[] | 能力分类 |
| `context_window` | INTEGER | 上下文窗口 |
| `max_output` | INTEGER | 最大输出 |
| `local_available` | BOOLEAN | 本地可用 |
| `cloud_available` | BOOLEAN | 云端可用 |
| `is_authorized` | BOOLEAN | 是否授权 |
| `auth_company` | VARCHAR(128) | 授权公司 |
| `auth_code` | VARCHAR(64) | 授权编号 |

### 2. core.agents (Agent配置)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(32) | 主键 |
| `name` | VARCHAR(64) | 英文名 |
| `name_cn` | VARCHAR(64) | 中文名 |
| `role` | VARCHAR(32) | 角色 |
| `local_priority` | VARCHAR(64)[] | 本地模型优先级 |
| `authorized_priority` | VARCHAR(64)[] | 授权模型优先级 |
| `cloud_priority` | VARCHAR(64)[] | 云端模型优先级 |
| `fallback_chain` | VARCHAR(64)[] | 回退链 |
| `temperature` | DECIMAL(3,2) | 温度参数 |
| `max_tokens` | INTEGER | 最大Token |

### 3. core.conversations (会话)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `title` | VARCHAR(256) | 标题 |
| `agent_id` | VARCHAR(32) | Agent ID |
| `model_id` | VARCHAR(64) | 模型 ID |
| `status` | VARCHAR(16) | 状态 |
| `message_count` | INTEGER | 消息数 |
| `total_tokens` | BIGINT | 总Token |

### 4. core.messages (消息)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `conversation_id` | UUID | 会话 ID |
| `role` | VARCHAR(16) | 角色 |
| `content` | TEXT | 内容 |
| `prompt_tokens` | INTEGER | 提示Token |
| `completion_tokens` | INTEGER | 完成Token |
| `latency_ms` | INTEGER | 延迟 |

### 5. core.inference_logs (推理记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `model_id` | VARCHAR(64) | 模型 ID |
| `agent_id` | VARCHAR(32) | Agent ID |
| `request_type` | VARCHAR(16) | 请求类型 |
| `total_tokens` | INTEGER | 总Token |
| `latency_ms` | INTEGER | 延迟 |
| `status` | VARCHAR(16) | 状态 |

---

## 🔧 使用方法

### 1. 创建数据库

```bash
cd /Users/yanyu/YYC3-Mac-Max/Family-π³/database

# 添加执行权限
chmod +x migrate.sh

# 创建数据库和用户
./migrate.sh create-db
```

### 2. 执行迁移

```bash
# 执行Schema迁移
./migrate.sh migrate
```

### 3. 验证迁移

```bash
# 验证迁移结果
./migrate.sh verify

# 或使用完整验证脚本
chmod +x verify.sh
./verify.sh
```

### 4. 查看状态

```bash
# 显示数据库状态
./migrate.sh status
```

### 5. 备份与恢复

```bash
# 导出数据
./migrate.sh export

# 导入数据
./migrate.sh import backups/yyc3_aify_20260223.sql
```

---

## 🌐 API 端点

### 基础路径

```
http://localhost:3001/api/v1/db
```

### 端点列表

| 方法 | 端点 | 说明 |
|------|------|------|
| **GET** | `/health` | 健康检查 |
| **GET** | `/models` | 获取所有模型 |
| **GET** | `/models/:id` | 获取单个模型 |
| **GET** | `/models/:id/stats` | 获取模型统计 |
| **GET** | `/agents` | 获取所有Agent |
| **GET** | `/agents/:id` | 获取单个Agent |
| **GET** | `/conversations` | 获取会话列表 |
| **POST** | `/conversations` | 创建会话 |
| **GET** | `/conversations/:id` | 获取单个会话 |
| **PATCH** | `/conversations/:id` | 更新会话 |
| **DELETE** | `/conversations/:id` | 删除会话 |
| **GET** | `/conversations/:id/messages` | 获取消息列表 |
| **POST** | `/conversations/:id/messages` | 创建消息 |
| **POST** | `/inference-logs` | 创建推理记录 |
| **GET** | `/inference-logs` | 获取推理记录 |
| **GET** | `/config` | 获取所有配置 |
| **GET** | `/config/:key` | 获取单个配置 |
| **PUT** | `/config/:key` | 更新配置 |
| **GET** | `/stats/overview` | 统计概览 |

### 示例请求

```bash
# 健康检查
curl http://localhost:3001/api/v1/db/health

# 获取所有模型
curl http://localhost:3001/api/v1/db/models

# 获取本地可用模型
curl "http://localhost:3001/api/v1/db/models?local=true"

# 获取授权模型
curl "http://localhost:3001/api/v1/db/models?authorized=true"

# 创建会话
curl -X POST http://localhost:3001/api/v1/db/conversations \
  -H "Content-Type: application/json" \
  -d '{"agentId":"navigator","modelId":"qwen2.5:7b"}'

# 创建消息
curl -X POST http://localhost:3001/api/v1/db/conversations/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{"role":"user","content":"你好"}'

# 获取统计
curl http://localhost:3001/api/v1/db/stats/overview
```

---

## 📁 文件结构

```
Family-π³/
├── database/
│   ├── schema/
│   │   └── 001_init_schema.sql    # Schema定义
│   ├── migrate.sh                  # 迁移脚本
│   └── verify.sh                   # 验证脚本
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── database.ts         # 数据库连接模块
│   │   └── routes/
│   │       └── dbRoutes.ts         # 数据闭环API
│   ├── .env                        # 环境变量
│   └── package.json                # 依赖配置
└── docs/
    └── YYC3-Family-Pi-数据库集成文档.md
```

---

## 🔄 数据闭环流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据闭环流程                               │
└─────────────────────────────────────────────────────────────────┘

1. 用户请求
   └─→ 前端发送请求到 API

2. API处理
   └─→ 创建会话记录
   └─→ 调用 AI 模型

3. 模型推理
   └─→ 记录推理日志
   └─→ 更新模型统计

4. 响应返回
   └─→ 保存消息记录
   └─→ 更新会话统计

5. 数据分析
   └─→ 聚合使用统计
   └─→ 计算性能指标

6. 优化反馈
   └─→ 调整模型路由
   └─→ 优化资源配置
```

---

## 📈 初始数据

### 七大智能体

| ID | 名称 | 角色 |
|----|------|------|
| `navigator` | 智愈·领航员 | Commander |
| `thinker` | 洞见·思想家 | Strategist |
| `prophet` | 预见·先知 | Predictor |
| `bole` | 知遇·伯乐 | Evaluator |
| `pivot` | 元启·天枢 | Coordinator |
| `sentinel` | 卫安·哨兵 | Guardian |
| `grandmaster` | 格物·宗师 | Scholar |

### 授权模型

| 模型 | 用途 | 授权状态 |
|------|------|----------|
| CodeGeeX4-ALL-9B | 代码生成 | ✅ 永久授权 |
| ChatGLM3-6B | 对话 | ✅ 永久授权 |
| CogAgent | GUI自动化 | ✅ 永久授权 |
| CogVideoX-5B | 视频生成 | ✅ 永久授权 |

### 本地模型

| 模型 | 部署节点 | 状态 |
|------|----------|------|
| qwen2.5:7b | m4-max | ✅ 可用 |
| glm4:9b | imac-m4 | ✅ 可用 |
| codegeex4:latest | m4-max, imac-m4 | ✅ 可用 |
| phi3:mini | imac-m4 | ✅ 可用 |

---

## 🔐 安全配置

### 数据库安全

- 专用数据库用户
- 强密码策略
- 连接池限制
- SSL 连接（生产环境）

### API 安全

- CORS 配置
- 请求限流
- 输入验证
- 错误处理

---

## 📝 维护指南

### 日常维护

```bash
# 检查数据库状态
./migrate.sh status

# 备份数据库
./migrate.sh export

# 查看日志
tail -f /var/log/postgresql/*.log
```

### 性能优化

```sql
-- 分析表
ANALYZE core.models;
ANALYZE core.agents;
ANALYZE core.conversations;
ANALYZE core.messages;
ANALYZE core.inference_logs;

-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname IN ('core', 'telemetry', 'analytics')
ORDER BY idx_scan DESC;

-- 清理旧数据
DELETE FROM telemetry.node_metrics 
WHERE created_at < NOW() - INTERVAL '30 days';

DELETE FROM telemetry.service_latency 
WHERE created_at < NOW() - INTERVAL '30 days';
```

### 故障排除

```bash
# 检查连接
pg_isready -h localhost -p 5433 -U yyc3_aify

# 检查进程
ps aux | grep postgres

# 检查日志
tail -100 /usr/local/var/log/postgres.log

# 重启服务
brew services restart postgresql@15
```

---

## 📚 相关文档

- [YYC³ AI Family 集成部署文档](./YYC3-Family-Pi-集成部署文档.md)
- [YYC³ Family-Pi 综合操作指导手册](./YYC3-Family-Pi-综合操作指导手册.md)
- [项目指南](../.trae/rules/ai-family.md)

---

<div align="center">

**YYC³ AI Family**

*言启象限 | 语枢未来*

**万象归元于云枢 | 深栈智启新纪元**

---

*文档最后更新：2026-02-23*

</div>
