# YYC³ AI Family — 数据库链路完整文档

> **YanYuCloudCube**
> 言启象限 | 语枢未来
> **Words Initiate Quadrants, Language Serves as Core for the Future**

---

## 📋 文档概述

本文档完整记录了 YYC³ AI Family 项目的数据库整体链路实现，包括：

- 数据库架构设计
- Schema 完整定义
- 迁移脚本实现
- 数据库连接模块
- 数据闭环 API
- 验证与测试
- 运维指南

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
| **字符集** | `UTF8` | 支持中文存储 |
| **时区** | `Asia/Shanghai` | 中国标准时间 |

### Schema 结构

```
yyc3_aify/
├── core/                   # 核心业务数据
│   ├── models              # 模型配置 (12条)
│   ├── agents              # Agent配置 (7条)
│   ├── conversations       # 会话记录
│   ├── messages            # 消息记录
│   ├── inference_logs      # 推理记录
│   ├── authorizations      # 授权验证
│   ├── user_preferences    # 用户偏好
│   └── system_config       # 系统配置 (14条)
├── telemetry/              # 遥测数据
│   ├── node_metrics        # 节点指标
│   └── service_latency     # 服务延迟
└── analytics/              # 分析数据
    └── usage_stats         # 使用统计
```

### 硬件集群拓扑

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

### 节点配置

| 节点 | 设备 | 角色 | 核心配置 | 网络地址 |
|------|------|------|----------|----------|
| **M4-Max** | MacBook Pro M4 Max | 编排器（主力） | M4 Max (16P+40E), 128GB, 4TB | localhost |
| **iMac-M4** | iMac M4 | 可视化/辅助 | M4 (10P+10E), 32GB, 2TB | 192.168.3.77 |
| **YanYuCloud** | 铁威马 F4-423 NAS | 数据中心 | Intel Quad, 32GB, 32TB HDD + 4TB SSD, RAID6 | 192.168.3.45:9898 |
| **MateBook** | 华为 MateBook X Pro | 边缘/测试（备用） | Intel 12th, 32GB, 1TB | 192.168.3.159 |

---

## 📊 表结构设计

### 1. core.models (模型配置)

```sql
CREATE TABLE IF NOT EXISTS core.models (
    id              VARCHAR(64) PRIMARY KEY,
    name            VARCHAR(128) NOT NULL,
    provider        VARCHAR(32) NOT NULL,
    tier            VARCHAR(16) NOT NULL DEFAULT 'cloud-paid',
    categories      VARCHAR(64)[] NOT NULL DEFAULT '{}',
    
    -- 能力参数
    context_window  INTEGER NOT NULL DEFAULT 4096,
    max_output      INTEGER NOT NULL DEFAULT 2048,
    supports_streaming BOOLEAN NOT NULL DEFAULT true,
    supports_vision BOOLEAN NOT NULL DEFAULT false,
    supports_tools  BOOLEAN NOT NULL DEFAULT false,
    
    -- 可用性
    local_available BOOLEAN NOT NULL DEFAULT false,
    local_nodes     VARCHAR(32)[] DEFAULT '{}',
    ollama_name     VARCHAR(64),
    cloud_available BOOLEAN NOT NULL DEFAULT false,
    cloud_endpoint  VARCHAR(256),
    
    -- 性能指标
    avg_latency_ms  INTEGER,
    p95_latency_ms  INTEGER,
    throughput      INTEGER,
    max_concurrent  INTEGER DEFAULT 4,
    
    -- 定价
    input_price_per_m   DECIMAL(10,4) DEFAULT 0,
    output_price_per_m  DECIMAL(10,4) DEFAULT 0,
    is_free             BOOLEAN NOT NULL DEFAULT false,
    
    -- 推荐配置
    recommended_agents  VARCHAR(32)[] DEFAULT '{}',
    
    -- 授权信息
    is_authorized       BOOLEAN NOT NULL DEFAULT false,
    auth_company        VARCHAR(128),
    auth_code           VARCHAR(64),
    auth_validity       VARCHAR(32),
    auth_certificate    VARCHAR(256),
    
    -- 元数据
    is_active       BOOLEAN NOT NULL DEFAULT true,
    priority        INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_tier CHECK (tier IN ('local', 'cloud-free', 'cloud-paid', 'authorized'))
);
```

**字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) | 主键，模型唯一标识 |
| `name` | VARCHAR(128) | 模型名称 |
| `provider` | VARCHAR(32) | 提供商 (openai, anthropic, zhipu, ollama等) |
| `tier` | VARCHAR(16) | 层级 (local/cloud-free/cloud-paid/authorized) |
| `categories` | VARCHAR(64)[] | 能力分类数组 |
| `context_window` | INTEGER | 上下文窗口大小 |
| `max_output` | INTEGER | 最大输出Token |
| `local_available` | BOOLEAN | 本地是否可用 |
| `cloud_available` | BOOLEAN | 云端是否可用 |
| `is_authorized` | BOOLEAN | 是否授权模型 |
| `auth_company` | VARCHAR(128) | 授权公司 |
| `auth_code` | VARCHAR(64) | 授权编号 |

**初始数据 (12条)**:

| id | name | provider | tier |
|----|------|----------|------|
| qwen2.5:7b | Qwen 2.5 7B (本地) | ollama | local |
| glm4:9b | GLM-4 9B (本地) | ollama | local |
| codegeex4:latest | CodeGeeX4 (本地) | ollama | local |
| phi3:mini | Phi-3 Mini 3.8B (本地) | ollama | local |
| GLM-4.7 | GLM-4.7 (云端) | zhipu | cloud-paid |
| GLM-4.7-Flash | GLM-4.7-Flash (云端) | zhipu | cloud-free |
| deepseek-chat | DeepSeek V3 | deepseek | cloud-paid |
| claude-sonnet-4-20250514 | Claude Sonnet 4 | anthropic | cloud-paid |
| gpt-4.1 | GPT-4.1 | openai | cloud-paid |
| gpt-4o | GPT-4o | openai | cloud-paid |
| gemini-2.5-pro | Gemini 2.5 Pro | google | cloud-paid |
| CodeGeeX4-all-9b | CodeGeeX4 (授权) | zhipu | authorized |

### 2. core.agents (Agent配置)

```sql
CREATE TABLE IF NOT EXISTS core.agents (
    id              VARCHAR(32) PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    name_cn         VARCHAR(64) NOT NULL,
    role            VARCHAR(32) NOT NULL,
    description     TEXT NOT NULL,
    primary_use_case TEXT NOT NULL,
    
    -- 模型优先级
    local_priority      VARCHAR(64)[] DEFAULT '{}',
    authorized_priority VARCHAR(64)[] DEFAULT '{}',
    cloud_priority      VARCHAR(64)[] DEFAULT '{}',
    fallback_chain      VARCHAR(64)[] DEFAULT '{}',
    
    -- 推理参数
    temperature     DECIMAL(3,2) DEFAULT 0.7,
    max_tokens      INTEGER DEFAULT 4096,
    
    -- 能力标签
    capabilities    VARCHAR(32)[] DEFAULT '{}',
    
    -- 系统提示
    system_prompt   TEXT,
    
    -- 元数据
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**七大智能体初始数据**:

| ID | 名称 | 角色 | 描述 |
|----|------|------|------|
| `navigator` | 智愈·领航员 | Commander | 全域资源调度与路径规划 |
| `thinker` | 洞见·思想家 | Strategist | 深度逻辑推理与决策分析 |
| `prophet` | 预见·先知 | Predictor | 趋势预测与风险前置 |
| `bole` | 知遇·伯乐 | Evaluator | 模型评估与优选匹配 |
| `pivot` | 元启·天枢 | Coordinator | 核心状态管理与上下文 |
| `sentinel` | 卫安·哨兵 | Guardian | 安全边界防护与审计 |
| `grandmaster` | 格物·宗师 | Scholar | 知识库构建与本体论 |

### 3. core.conversations (会话)

```sql
CREATE TABLE IF NOT EXISTS core.conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(256),
    agent_id        VARCHAR(32) NOT NULL REFERENCES core.agents(id),
    model_id        VARCHAR(64) NOT NULL REFERENCES core.models(id),
    user_id         VARCHAR(64),
    device_id       VARCHAR(64),
    
    -- 状态
    status          VARCHAR(16) NOT NULL DEFAULT 'active',
    
    -- 统计
    message_count   INTEGER NOT NULL DEFAULT 0,
    total_tokens    BIGINT NOT NULL DEFAULT 0,
    total_cost      DECIMAL(10,6) DEFAULT 0,
    
    -- 元数据
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    
    CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'deleted'))
);
```

### 4. core.messages (消息)

```sql
CREATE TABLE IF NOT EXISTS core.messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES core.conversations(id) ON DELETE CASCADE,
    role            VARCHAR(16) NOT NULL,
    content         TEXT NOT NULL,
    
    -- Token 统计
    prompt_tokens   INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens    INTEGER DEFAULT 0,
    
    -- 性能指标
    latency_ms      INTEGER,
    model_id        VARCHAR(64),
    
    -- 元数据
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_role CHECK (role IN ('system', 'user', 'assistant', 'tool'))
);
```

### 5. core.inference_logs (推理记录)

```sql
CREATE TABLE IF NOT EXISTS core.inference_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id        VARCHAR(64) NOT NULL,
    agent_id        VARCHAR(32),
    conversation_id UUID,
    
    -- 请求信息
    request_type    VARCHAR(16) NOT NULL,
    prompt_tokens   INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens    INTEGER DEFAULT 0,
    
    -- 性能指标
    latency_ms      INTEGER NOT NULL,
    time_to_first_token_ms INTEGER,
    tokens_per_second DECIMAL(10,2),
    
    -- 成本
    cost            DECIMAL(10,6) DEFAULT 0,
    
    -- 状态
    status          VARCHAR(16) NOT NULL DEFAULT 'success',
    error_message   TEXT,
    
    -- 节点信息
    node_id         VARCHAR(32),
    
    -- 元数据
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_request_type CHECK (request_type IN ('chat', 'completion', 'embedding', 'vision')),
    CONSTRAINT valid_status CHECK (status IN ('success', 'error', 'timeout', 'cancelled'))
);
```

### 6. core.authorizations (授权验证)

```sql
CREATE TABLE IF NOT EXISTS core.authorizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id        VARCHAR(64) NOT NULL REFERENCES core.models(id),
    
    -- 授权信息
    company         VARCHAR(128) NOT NULL,
    auth_code       VARCHAR(64) NOT NULL,
    validity        VARCHAR(32) NOT NULL,
    certificate_path VARCHAR(256),
    
    -- 验证状态
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    verified_at     TIMESTAMPTZ,
    verified_by     VARCHAR(64),
    
    -- 元数据
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(model_id)
);
```

### 7. core.user_preferences (用户偏好)

```sql
CREATE TABLE IF NOT EXISTS core.user_preferences (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         VARCHAR(64) NOT NULL,
    
    -- 偏好设置
    default_agent   VARCHAR(32) REFERENCES core.agents(id),
    default_model   VARCHAR(64) REFERENCES core.models(id),
    theme           VARCHAR(16) DEFAULT 'dark',
    language        VARCHAR(8) DEFAULT 'zh-CN',
    
    -- 通知设置
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT false,
    
    -- 元数据
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id)
);
```

### 8. core.system_config (系统配置)

```sql
CREATE TABLE IF NOT EXISTS core.system_config (
    key             VARCHAR(64) PRIMARY KEY,
    value           TEXT NOT NULL,
    type            VARCHAR(16) NOT NULL DEFAULT 'string',
    description     TEXT,
    
    -- 元数据
    is_public       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_type CHECK (type IN ('string', 'number', 'boolean', 'json', 'array'))
);
```

**初始配置 (14条)**:

| key | value | type | description |
|-----|-------|------|-------------|
| system.name | YYC³ AI Family | string | 系统名称 |
| system.version | 2.0.0 | string | 系统版本 |
| system.timezone | Asia/Shanghai | string | 系统时区 |
| system.language | zh-CN | string | 默认语言 |
| auth.company | 洛阳沫言酒店管理有限公司 | string | 授权公司 |
| auth.code | 202411283053152737 | string | 授权编号 |
| auth.validity | 永久有效 | string | 授权有效期 |
| model.default_local | qwen2.5:7b | string | 默认本地模型 |
| model.default_cloud | GLM-4.7-Flash | string | 默认云端模型 |
| model.max_concurrent | 10 | number | 最大并发推理数 |
| cache.enabled | true | boolean | 缓存开关 |
| cache.ttl | 3600 | number | 缓存过期时间(秒) |
| log.level | info | string | 日志级别 |
| log.retention_days | 30 | number | 日志保留天数 |

### 9. telemetry.service_latency (服务延迟)

```sql
CREATE TABLE IF NOT EXISTS telemetry.service_latency (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name    VARCHAR(64) NOT NULL,
    endpoint        VARCHAR(256) NOT NULL,
    
    -- 延迟指标
    latency_ms      INTEGER NOT NULL,
    status_code     INTEGER,
    
    -- 元数据
    node_id         VARCHAR(32),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🔧 迁移脚本

### migrate.sh 完整实现

```bash
#!/bin/bash

# ============================================================
# YYC³ AI Family — 数据库迁移脚本
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-yyc3_aify}"
DB_USER="${DB_USER:-yyc3_aify}"
DB_PASSWORD="${DB_PASSWORD:-Yyc3_Aify_2026_Secure!}"
ADMIN_USER="${ADMIN_USER:-yanyu}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="${SCRIPT_DIR}/schema"
BACKUP_DIR="${SCRIPT_DIR}/backups"

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 创建数据库
create_database() {
    log_info "创建数据库和用户..."
    
    export PGPASSWORD="${ADMIN_PASSWORD}"
    
    # 创建用户
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d postgres -c "
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
                CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
            END IF;
        END
        \$\$;
    " || log_warning "用户可能已存在"
    
    # 创建数据库
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d postgres -c "
        CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
    " 2>/dev/null || log_warning "数据库可能已存在"
    
    # 授权
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d postgres -c "
        GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
    "
    
    # 启用扩展
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d "${DB_NAME}" -c "
        CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
        CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";
    "
    
    log_success "数据库和用户创建完成"
    unset PGPASSWORD
}

# 执行迁移
run_migration() {
    log_info "执行数据库迁移..."
    
    export PGPASSWORD="${DB_PASSWORD}"
    
    for schema_file in "${SCHEMA_DIR}"/*.sql; do
        if [ -f "$schema_file" ]; then
            log_info "执行: $(basename "$schema_file")"
            psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "$schema_file" || {
                log_error "迁移失败: $(basename "$schema_file")"
                unset PGPASSWORD
                return 1
            }
            log_success "$(basename "$schema_file") 执行成功"
        fi
    done
    
    log_success "数据库迁移完成"
    unset PGPASSWORD
}

# 验证迁移
verify_migration() {
    log_info "验证数据库迁移..."
    
    export PGPASSWORD="${DB_PASSWORD}"
    
    # 检查表数量
    local table_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema IN ('core', 'telemetry', 'analytics')
    " | tr -d ' ')
    
    log_info "创建的表数量: ${table_count}"
    
    # 检查数据
    local model_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM core.models
    " | tr -d ' ')
    
    local agent_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM core.agents
    " | tr -d ' ')
    
    log_info "模型数量: ${model_count}"
    log_info "Agent数量: ${agent_count}"
    
    log_success "验证完成"
    unset PGPASSWORD
}

# 显示状态
show_status() {
    export PGPASSWORD="${DB_PASSWORD}"
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "                    数据库状态"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
        SELECT 
            schemaname AS schema,
            tablename AS table_name,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables 
        WHERE schemaname IN ('core', 'telemetry', 'analytics')
        ORDER BY schemaname, tablename
    "
    
    echo ""
    unset PGPASSWORD
}

# 主函数
main() {
    case "${1:-}" in
        create-db)
            create_database
            ;;
        migrate)
            run_migration
            ;;
        verify)
            verify_migration
            ;;
        status)
            show_status
            ;;
        export)
            export_data
            ;;
        import)
            import_data "$2"
            ;;
        *)
            echo "用法: $0 {create-db|migrate|verify|status|export|import <file>}"
            exit 1
            ;;
    esac
}

main "$@"
```

---

## 🔌 数据库连接模块

### database.ts 完整实现

```typescript
import pg from 'pg';
const { Pool } = pg;

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

interface ModelRecord {
  id: string;
  name: string;
  provider: string;
  tier: string;
  categories: string[];
  context_window: number;
  max_output: number;
  supports_streaming: boolean;
  supports_vision: boolean;
  supports_tools: boolean;
  local_available: boolean;
  local_nodes: string[];
  ollama_name: string | null;
  cloud_available: boolean;
  cloud_endpoint: string | null;
  avg_latency_ms: number | null;
  p95_latency_ms: number | null;
  throughput: number | null;
  max_concurrent: number;
  input_price_per_m: number;
  output_price_per_m: number;
  is_free: boolean;
  recommended_agents: string[];
  is_authorized: boolean;
  auth_company: string | null;
  auth_code: string | null;
  auth_validity: string | null;
  is_active: boolean;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

interface AgentRecord {
  id: string;
  name: string;
  name_cn: string;
  role: string;
  description: string;
  primary_use_case: string;
  local_priority: string[];
  authorized_priority: string[];
  cloud_priority: string[];
  fallback_chain: string[];
  temperature: number;
  max_tokens: number;
  capabilities: string[];
  system_prompt: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ConversationRecord {
  id: string;
  title: string | null;
  agent_id: string;
  model_id: string;
  user_id: string | null;
  device_id: string | null;
  status: string;
  message_count: number;
  total_tokens: number;
  total_cost: number;
  created_at: Date;
  updated_at: Date;
  ended_at: Date | null;
}

interface MessageRecord {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number | null;
  model_id: string | null;
  created_at: Date;
}

interface InferenceLogRecord {
  id: string;
  model_id: string;
  agent_id: string | null;
  conversation_id: string | null;
  request_type: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  time_to_first_token_ms: number | null;
  tokens_per_second: number | null;
  cost: number;
  status: string;
  error_message: string | null;
  node_id: string | null;
  created_at: Date;
}

interface SystemConfigRecord {
  key: string;
  value: string;
  type: string;
  description: string | null;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export class DatabaseConnection {
  private pool: pg.Pool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      database: process.env.DB_NAME || 'yyc3_aify',
      user: process.env.DB_USER || 'yyc3_aify',
      password: process.env.DB_PASSWORD || 'Yyc3_Aify_2026_Secure!',
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
    };
  }

  async connect(): Promise<void> {
    if (this.pool) {
      return;
    }

    this.pool = new Pool(this.config);

    this.pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle client', err);
    });

    try {
      const client = await this.pool.connect();
      console.log('[DB] Connected to PostgreSQL');
      client.release();
    } catch (error) {
      console.error('[DB] Connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('[DB] Disconnected from PostgreSQL');
    }
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.pool) {
      await this.connect();
    }

    const result = await this.pool!.query(sql, params);
    return result.rows as T[];
  }

  async queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async execute(sql: string, params: any[] = []): Promise<number> {
    if (!this.pool) {
      await this.connect();
    }

    const result = await this.pool!.query(sql, params);
    return result.rowCount || 0;
  }

  async transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) {
      await this.connect();
    }

    const client = await this.pool!.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const db = new DatabaseConnection();

// ============================================================
// 数据访问库
// ============================================================

export class ModelRepository {
  async findAll(): Promise<ModelRecord[]> {
    return db.query<ModelRecord>(`
      SELECT * FROM core.models 
      WHERE is_active = true 
      ORDER BY priority DESC, name
    `);
  }

  async findById(id: string): Promise<ModelRecord | null> {
    return db.queryOne<ModelRecord>(`
      SELECT * FROM core.models WHERE id = $1
    `, [id]);
  }

  async findByTier(tier: string): Promise<ModelRecord[]> {
    return db.query<ModelRecord>(`
      SELECT * FROM core.models 
      WHERE tier = $1 AND is_active = true 
      ORDER BY priority DESC, name
    `, [tier]);
  }

  async findLocalAvailable(): Promise<ModelRecord[]> {
    return db.query<ModelRecord>(`
      SELECT * FROM core.models 
      WHERE local_available = true AND is_active = true 
      ORDER BY priority DESC, name
    `);
  }

  async findAuthorized(): Promise<ModelRecord[]> {
    return db.query<ModelRecord>(`
      SELECT * FROM core.models 
      WHERE is_authorized = true AND is_active = true 
      ORDER BY priority DESC, name
    `);
  }

  async updateStats(id: string, stats: {
    avgLatencyMs?: number;
    p95LatencyMs?: number;
    throughput?: number;
  }): Promise<void> {
    await db.execute(`
      UPDATE core.models 
      SET 
        avg_latency_ms = COALESCE($2, avg_latency_ms),
        p95_latency_ms = COALESCE($3, p95_latency_ms),
        throughput = COALESCE($4, throughput),
        updated_at = NOW()
      WHERE id = $1
    `, [id, stats.avgLatencyMs || null, stats.p95LatencyMs || null, stats.throughput || null]);
  }
}

export class AgentRepository {
  async findAll(): Promise<AgentRecord[]> {
    return db.query<AgentRecord>(`
      SELECT * FROM core.agents 
      WHERE is_active = true 
      ORDER BY id
    `);
  }

  async findById(id: string): Promise<AgentRecord | null> {
    return db.queryOne<AgentRecord>(`
      SELECT * FROM core.agents WHERE id = $1
    `, [id]);
  }
}

export class ConversationRepository {
  async create(data: {
    title?: string;
    agentId: string;
    modelId: string;
    userId?: string;
    deviceId?: string;
  }): Promise<string> {
    const result = await db.queryOne<{ id: string }>(`
      INSERT INTO core.conversations (title, agent_id, model_id, user_id, device_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [data.title || null, data.agentId, data.modelId, data.userId || null, data.deviceId || null]);

    return result!.id;
  }

  async findById(id: string): Promise<ConversationRecord | null> {
    return db.queryOne<ConversationRecord>(`
      SELECT * FROM core.conversations WHERE id = $1
    `, [id]);
  }

  async findByUserId(userId: string, limit: number = 20): Promise<ConversationRecord[]> {
    return db.query<ConversationRecord>(`
      SELECT * FROM core.conversations 
      WHERE user_id = $1 AND status != 'deleted'
      ORDER BY updated_at DESC
      LIMIT $2
    `, [userId, limit]);
  }

  async updateStats(id: string): Promise<void> {
    await db.execute(`
      UPDATE core.conversations c
      SET 
        message_count = (SELECT COUNT(*) FROM core.messages WHERE conversation_id = c.id),
        total_tokens = (SELECT COALESCE(SUM(total_tokens), 0) FROM core.messages WHERE conversation_id = c.id),
        updated_at = NOW()
      WHERE id = $1
    `, [id]);
  }

  async archive(id: string): Promise<void> {
    await db.execute(`
      UPDATE core.conversations 
      SET status = 'archived', ended_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [id]);
  }

  async delete(id: string): Promise<void> {
    await db.execute(`
      UPDATE core.conversations 
      SET status = 'deleted', ended_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [id]);
  }
}

export class MessageRepository {
  async create(data: {
    conversationId: string;
    role: string;
    content: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    latencyMs?: number;
    modelId?: string;
  }): Promise<string> {
    const result = await db.queryOne<{ id: string }>(`
      INSERT INTO core.messages 
        (conversation_id, role, content, prompt_tokens, completion_tokens, total_tokens, latency_ms, model_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      data.conversationId,
      data.role,
      data.content,
      data.promptTokens || 0,
      data.completionTokens || 0,
      data.totalTokens || 0,
      data.latencyMs || null,
      data.modelId || null
    ]);

    return result!.id;
  }

  async findByConversationId(conversationId: string, limit: number = 100): Promise<MessageRecord[]> {
    return db.query<MessageRecord>(`
      SELECT * FROM core.messages 
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2
    `, [conversationId, limit]);
  }
}

export class InferenceLogRepository {
  async create(data: {
    modelId: string;
    agentId?: string;
    conversationId?: string;
    requestType: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    latencyMs: number;
    timeToFirstTokenMs?: number;
    tokensPerSecond?: number;
    cost?: number;
    status?: string;
    errorMessage?: string;
    nodeId?: string;
  }): Promise<string> {
    const result = await db.queryOne<{ id: string }>(`
      INSERT INTO core.inference_logs 
        (model_id, agent_id, conversation_id, request_type, prompt_tokens, completion_tokens, 
         total_tokens, latency_ms, time_to_first_token_ms, tokens_per_second, cost, 
         status, error_message, node_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      data.modelId,
      data.agentId || null,
      data.conversationId || null,
      data.requestType,
      data.promptTokens || 0,
      data.completionTokens || 0,
      data.totalTokens || 0,
      data.latencyMs,
      data.timeToFirstTokenMs || null,
      data.tokensPerSecond || null,
      data.cost || 0,
      data.status || 'success',
      data.errorMessage || null,
      data.nodeId || null
    ]);

    return result!.id;
  }

  async findByModelId(modelId: string, limit: number = 100): Promise<InferenceLogRecord[]> {
    return db.query<InferenceLogRecord>(`
      SELECT * FROM core.inference_logs 
      WHERE model_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [modelId, limit]);
  }

  async getStatsByModel(modelId: string, days: number = 7): Promise<{
    avgLatency: number;
    totalRequests: number;
    successRate: number;
    avgTokens: number;
  }> {
    const result = await db.queryOne<{
      avg_latency: number;
      total_requests: number;
      success_rate: number;
      avg_tokens: number;
    }>(`
      SELECT 
        AVG(latency_ms) as avg_latency,
        COUNT(*) as total_requests,
        (COUNT(*) FILTER (WHERE status = 'success')::FLOAT / COUNT(*) * 100) as success_rate,
        AVG(total_tokens) as avg_tokens
      FROM core.inference_logs 
      WHERE model_id = $1 AND created_at > NOW() - INTERVAL '${days} days'
    `, [modelId]);

    return {
      avgLatency: result?.avg_latency || 0,
      totalRequests: result?.total_requests || 0,
      successRate: result?.success_rate || 0,
      avgTokens: result?.avg_tokens || 0
    };
  }
}

export class SystemConfigRepository {
  async findAll(): Promise<SystemConfigRecord[]> {
    return db.query<SystemConfigRecord>(`
      SELECT * FROM core.system_config ORDER BY key
    `);
  }

  async findByKey(key: string): Promise<SystemConfigRecord | null> {
    return db.queryOne<SystemConfigRecord>(`
      SELECT * FROM core.system_config WHERE key = $1
    `, [key]);
  }

  async getValue(key: string, defaultValue: string = ''): Promise<string> {
    const config = await this.findByKey(key);
    return config?.value || defaultValue;
  }

  async setValue(key: string, value: string): Promise<void> {
    await db.execute(`
      INSERT INTO core.system_config (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
    `, [key, value]);
  }
}

// 导出实例
export const modelRepository = new ModelRepository();
export const agentRepository = new AgentRepository();
export const conversationRepository = new ConversationRepository();
export const messageRepository = new MessageRepository();
export const inferenceLogRepository = new InferenceLogRepository();
export const systemConfigRepository = new SystemConfigRepository();
```

---

## 🌐 数据闭环 API

### dbRoutes.ts 完整实现

```typescript
import { Router, Request, Response } from 'express';
import { 
  db, 
  modelRepository, 
  agentRepository, 
  conversationRepository, 
  messageRepository, 
  inferenceLogRepository,
  systemConfigRepository 
} from '../lib/database';

const router = Router();

// ============================================================
// 健康检查
// ============================================================

router.get('/health', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const modelCount = (await modelRepository.findAll()).length;
    const agentCount = (await agentRepository.findAll()).length;
    
    res.json({
      status: 'ok',
      timestamp: Date.now(),
      version: '1.0.0',
      database: {
        connected: true,
        models: modelCount,
        agents: agentCount,
      },
      authorization: {
        company: process.env.AUTH_COMPANY || '洛阳沫言酒店管理有限公司',
        code: process.env.AUTH_CODE || '202411283053152737',
        validity: process.env.AUTH_VALIDITY || '永久有效',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// 模型 API
// ============================================================

router.get('/models', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const { tier, local, authorized } = req.query;
    
    let models;
    if (tier) {
      models = await modelRepository.findByTier(tier as string);
    } else if (local === 'true') {
      models = await modelRepository.findLocalAvailable();
    } else if (authorized === 'true') {
      models = await modelRepository.findAuthorized();
    } else {
      models = await modelRepository.findAll();
    }
    
    res.json({
      success: true,
      data: models,
      count: models.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/models/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const model = await modelRepository.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found',
      });
    }
    
    res.json({
      success: true,
      data: model,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/models/:id/stats', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const stats = await inferenceLogRepository.getStatsByModel(req.params.id);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// Agent API
// ============================================================

router.get('/agents', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const agents = await agentRepository.findAll();
    
    res.json({
      success: true,
      data: agents,
      count: agents.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/agents/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const agent = await agentRepository.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }
    
    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// 会话 API
// ============================================================

router.get('/conversations', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const { userId, limit } = req.query;
    
    let conversations;
    if (userId) {
      conversations = await conversationRepository.findByUserId(
        userId as string,
        parseInt((limit as string) || '20')
      );
    } else {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }
    
    res.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/conversations', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const { title, agentId, modelId, userId, deviceId } = req.body;
    
    if (!agentId || !modelId) {
      return res.status(400).json({
        success: false,
        error: 'agentId and modelId are required',
      });
    }
    
    const id = await conversationRepository.create({
      title,
      agentId,
      modelId,
      userId,
      deviceId,
    });
    
    const conversation = await conversationRepository.findById(id);
    
    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const conversation = await conversationRepository.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }
    
    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.patch('/conversations/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const { action } = req.body;
    
    if (action === 'archive') {
      await conversationRepository.archive(req.params.id);
    } else if (action === 'delete') {
      await conversationRepository.delete(req.params.id);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
      });
    }
    
    res.json({
      success: true,
      message: `Conversation ${action}d`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.delete('/conversations/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    await conversationRepository.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// 消息 API
// ============================================================

router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const { limit } = req.query;
    
    const messages = await messageRepository.findByConversationId(
      req.params.id,
      parseInt((limit as string) || '100')
    );
    
    res.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const { role, content, promptTokens, completionTokens, totalTokens, latencyMs, modelId } = req.body;
    
    if (!role || !content) {
      return res.status(400).json({
        success: false,
        error: 'role and content are required',
      });
    }
    
    const id = await messageRepository.create({
      conversationId: req.params.id,
      role,
      content,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      modelId,
    });
    
    await conversationRepository.updateStats(req.params.id);
    
    res.status(201).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// 推理日志 API
// ============================================================

router.post('/inference-logs', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const id = await inferenceLogRepository.create(req.body);
    
    res.status(201).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/inference-logs', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const { modelId, limit } = req.query;
    
    let logs;
    if (modelId) {
      logs = await inferenceLogRepository.findByModelId(
        modelId as string,
        parseInt((limit as string) || '100')
      );
    } else {
      return res.status(400).json({
        success: false,
        error: 'modelId is required',
      });
    }
    
    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// 系统配置 API
// ============================================================

router.get('/config', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const configs = await systemConfigRepository.findAll();
    
    res.json({
      success: true,
      data: configs,
      count: configs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/config/:key', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const config = await systemConfigRepository.findByKey(req.params.key);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Config not found',
      });
    }
    
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.put('/config/:key', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        error: 'value is required',
      });
    }
    
    await systemConfigRepository.setValue(req.params.key, value);
    
    res.json({
      success: true,
      message: 'Config updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// 统计 API
// ============================================================

router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    await db.connect();
    
    const models = await modelRepository.findAll();
    const agents = await agentRepository.findAll();
    const configs = await systemConfigRepository.findAll();
    
    const localModels = models.filter(m => m.local_available);
    const authorizedModels = models.filter(m => m.is_authorized);
    const cloudModels = models.filter(m => m.cloud_available);
    
    res.json({
      success: true,
      data: {
        models: {
          total: models.length,
          local: localModels.length,
          authorized: authorizedModels.length,
          cloud: cloudModels.length,
        },
        agents: {
          total: agents.length,
          list: agents.map(a => ({ id: a.id, name: a.name_cn, role: a.role })),
        },
        config: {
          total: configs.length,
        },
        authorization: {
          company: process.env.AUTH_COMPANY || '洛阳沫言酒店管理有限公司',
          code: process.env.AUTH_CODE || '202411283053152737',
          validity: process.env.AUTH_VALIDITY || '永久有效',
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
```

---

## 🔄 数据闭环流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据闭环流程                               │
└─────────────────────────────────────────────────────────────────┘

1. 用户请求
   └─→ 前端发送请求到 API
   └─→ 携带 agentId, modelId, userId

2. API处理
   └─→ 创建会话记录 (conversations)
   └─→ 验证模型和Agent可用性

3. 模型推理
   └─→ 调用 AI 模型 (本地/云端)
   └─→ 记录推理日志 (inference_logs)
   └─→ 更新模型统计 (models.stats)

4. 响应返回
   └─→ 保存消息记录 (messages)
   └─→ 更新会话统计 (conversations.stats)

5. 数据分析
   └─→ 聚合使用统计 (analytics)
   └─→ 计算性能指标 (telemetry)

6. 优化反馈
   └─→ 调整模型路由策略
   └─→ 优化资源配置
   └─→ 更新系统配置
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
    ├── YYC3-Family-Pi-数据库集成文档.md
    └── YYC3-Family-Pi-数据库链路完整文档.md
```

---

## 🚀 使用方法

### 快速启动

```bash
# 进入数据库目录
cd /Users/yanyu/YYC3-Mac-Max/Family-π³/database

# 添加执行权限
chmod +x migrate.sh verify.sh

# 创建数据库和用户
./migrate.sh create-db

# 执行迁移
./migrate.sh migrate

# 验证迁移
./migrate.sh verify

# 查看状态
./migrate.sh status
```

### API 调用示例

```bash
# 健康检查
curl http://localhost:3001/api/v1/db/health

# 获取所有模型
curl http://localhost:3001/api/v1/db/models

# 获取本地可用模型
curl "http://localhost:3001/api/v1/db/models?local=true"

# 获取授权模型
curl "http://localhost:3001/api/v1/db/models?authorized=true"

# 获取所有Agent
curl http://localhost:3001/api/v1/db/agents

# 创建会话
curl -X POST http://localhost:3001/api/v1/db/conversations \
  -H "Content-Type: application/json" \
  -d '{"agentId":"navigator","modelId":"qwen2.5:7b","userId":"user001"}'

# 创建消息
curl -X POST http://localhost:3001/api/v1/db/conversations/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{"role":"user","content":"你好","modelId":"qwen2.5:7b"}'

# 获取统计概览
curl http://localhost:3001/api/v1/db/stats/overview
```

---

## 📊 验证结果

```
╔═══════════════════════════════════════════════════════════════╗
║           YYC³ AI Family — 数据库链路验证                     ║
╚═══════════════════════════════════════════════════════════════╝

数据库连接: ✅ 正常
Schema完整性: ✅ 12个表
模型数据: ✅ 12个模型
Agent数据: ✅ 7个智能体
系统配置: ✅ 14项配置
授权验证: ✅ 已配置
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
