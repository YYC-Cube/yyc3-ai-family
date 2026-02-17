// ============================================================
// YYC3 Hacker Chatbot — PostgreSQL 15 Database Schema
// Phase 9: Data Persistence Layer (L02)
//
// 部署指南:
// 1. 在本机 PostgreSQL 15 中创建数据库:
//    CREATE DATABASE yyc3_devops;
//
// 2. 连接后执行 SCHEMA_SQL:
//    psql -d yyc3_devops -f schema.sql
//
// 3. 配置 .env:
//    YYC3_DB_HOST=localhost
//    YYC3_DB_PORT=5432
//    YYC3_DB_NAME=yyc3_devops
//    YYC3_DB_USER=yyc3_admin
//    YYC3_DB_PASSWORD=<your_password>
//
// 4. 启动后端 API 服务 (Express/Fastify):
//    配合 /src/lib/api.ts 中的接口定义
// ============================================================

export const SCHEMA_VERSION = '9.0.0';

/**
 * 完整 SQL Schema — 复制到 psql 或 pgAdmin 中执行
 */
export const SCHEMA_SQL = `
-- ============================================================
-- YYC3 DevOps Platform — PostgreSQL 15 Schema
-- Version: ${SCHEMA_VERSION}
-- Generated: 2026-02-14
-- ============================================================

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. 终端会话表 (Terminal Chat Sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(255) DEFAULT 'New Session',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  is_archived   BOOLEAN DEFAULT FALSE,
  metadata      JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sessions_created ON yyc3_sessions(created_at DESC);
CREATE INDEX idx_sessions_archived ON yyc3_sessions(is_archived);

-- ============================================================
-- 2. 终端消息表 (Terminal Messages)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID REFERENCES yyc3_sessions(id) ON DELETE CASCADE,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('user', 'ai', 'system')),
  content       TEXT NOT NULL,
  agent_name    VARCHAR(100),
  agent_role    VARCHAR(50),
  timestamp     TIMESTAMPTZ DEFAULT NOW(),
  tokens_used   INTEGER DEFAULT 0,
  metadata      JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_messages_session ON yyc3_messages(session_id, timestamp);
CREATE INDEX idx_messages_role ON yyc3_messages(role);

-- ============================================================
-- 3. 智能体对话会话表 (Agent Chat Sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_agent_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id      VARCHAR(50) NOT NULL,
  agent_name    VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  turn_count    INTEGER DEFAULT 0,
  total_tokens  INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  metadata      JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_agent_sessions_agent ON yyc3_agent_sessions(agent_id);
CREATE INDEX idx_agent_sessions_active ON yyc3_agent_sessions(is_active);

-- ============================================================
-- 4. 智能体对话消息表 (Agent Messages)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_agent_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID REFERENCES yyc3_agent_sessions(id) ON DELETE CASCADE,
  agent_id        VARCHAR(50) NOT NULL,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'agent', 'system')),
  content         TEXT NOT NULL,
  timestamp       TIMESTAMPTZ DEFAULT NOW(),
  thinking_time   INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_agent_messages_session ON yyc3_agent_messages(session_id, timestamp);
CREATE INDEX idx_agent_messages_agent ON yyc3_agent_messages(agent_id);

-- ============================================================
-- 5. 系统指标时序表 (Metrics Time-Series)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_metrics (
  id            BIGSERIAL PRIMARY KEY,
  node_id       VARCHAR(50) NOT NULL,
  metric_type   VARCHAR(50) NOT NULL,
  value         DOUBLE PRECISION NOT NULL,
  unit          VARCHAR(20) DEFAULT '%',
  recorded_at   TIMESTAMPTZ DEFAULT NOW(),
  metadata      JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_metrics_node_type ON yyc3_metrics(node_id, metric_type, recorded_at DESC);
CREATE INDEX idx_metrics_time ON yyc3_metrics(recorded_at DESC);

-- 自动分区 (可选 — 适用于大量数据)
-- 每天一个分区，保留 90 天
-- CREATE TABLE yyc3_metrics_partitioned (...) PARTITION BY RANGE (recorded_at);

-- ============================================================
-- 6. 系统日志表 (System Logs)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_logs (
  id            BIGSERIAL PRIMARY KEY,
  level         VARCHAR(10) NOT NULL CHECK (level IN ('info', 'warn', 'error', 'success', 'debug')),
  source        VARCHAR(100) NOT NULL,
  message       TEXT NOT NULL,
  timestamp     TIMESTAMPTZ DEFAULT NOW(),
  metadata      JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_logs_level ON yyc3_logs(level, timestamp DESC);
CREATE INDEX idx_logs_source ON yyc3_logs(source, timestamp DESC);
CREATE INDEX idx_logs_time ON yyc3_logs(timestamp DESC);

-- ============================================================
-- 7. 工件表 (Artifacts)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_artifacts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(255) NOT NULL,
  artifact_type   VARCHAR(50) NOT NULL CHECK (artifact_type IN ('react', 'api', 'config', 'script', 'doc', 'image', 'schema')),
  language        VARCHAR(50) NOT NULL,
  content         TEXT NOT NULL,
  size_bytes      INTEGER DEFAULT 0,
  version         VARCHAR(20) DEFAULT 'v1.0',
  generated_by    VARCHAR(100),
  agent_id        VARCHAR(50),
  tags            TEXT[] DEFAULT '{}',
  is_starred      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_artifacts_type ON yyc3_artifacts(artifact_type);
CREATE INDEX idx_artifacts_agent ON yyc3_artifacts(agent_id);
CREATE INDEX idx_artifacts_starred ON yyc3_artifacts(is_starred);
CREATE INDEX idx_artifacts_tags ON yyc3_artifacts USING GIN(tags);

-- ============================================================
-- 8. 项目注册表 (Project Registry)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT,
  project_type    VARCHAR(50) NOT NULL CHECK (project_type IN ('frontend', 'backend', 'infra', 'library', 'fullstack')),
  language        VARCHAR(50) NOT NULL,
  language_color  VARCHAR(20) DEFAULT 'bg-blue-500',
  branch          VARCHAR(100) DEFAULT 'main',
  status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'development', 'archived')),
  health          VARCHAR(20) DEFAULT 'healthy' CHECK (health IN ('healthy', 'warning', 'error')),
  service_count   INTEGER DEFAULT 0,
  stars           INTEGER DEFAULT 0,
  last_commit_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_projects_status ON yyc3_projects(status);
CREATE INDEX idx_projects_type ON yyc3_projects(project_type);

-- ============================================================
-- 9. 硬件节点表 (Cluster Nodes)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_nodes (
  id              VARCHAR(50) PRIMARY KEY,
  display_name    VARCHAR(100) NOT NULL,
  node_type       VARCHAR(20) NOT NULL CHECK (node_type IN ('workstation', 'server', 'nas', 'edge')),
  hostname        VARCHAR(255),
  ip_address      INET,
  cpu_model       VARCHAR(100),
  ram_gb          INTEGER,
  storage_desc    TEXT,
  os              VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'standby', 'offline', 'maintenance')),
  last_heartbeat  TIMESTAMPTZ DEFAULT NOW(),
  metadata        JSONB DEFAULT '{}'::jsonb
);

-- ============================================================
-- 10. 用户配置表 (User Preferences)
-- ============================================================
CREATE TABLE IF NOT EXISTS yyc3_preferences (
  key             VARCHAR(100) PRIMARY KEY,
  value           JSONB NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 触发器: 自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sessions_updated
  BEFORE UPDATE ON yyc3_sessions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_agent_sessions_updated
  BEFORE UPDATE ON yyc3_agent_sessions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_artifacts_updated
  BEFORE UPDATE ON yyc3_artifacts
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- 初始数据: 硬件节点注册
-- ============================================================
INSERT INTO yyc3_nodes (id, display_name, node_type, hostname, cpu_model, ram_gb, storage_desc, os, status)
VALUES
  ('m4-max', 'MacBook Pro M4 Max', 'workstation', 'mbp-m4max.local', 'Apple M4 Max (16P+40E)', 128, '2TB NVMe SSD', 'macOS Sequoia 15.3', 'online'),
  ('imac-m4', 'iMac M4', 'workstation', 'imac-m4.local', 'Apple M4 (10 cores)', 32, '1TB NVMe SSD', 'macOS Sequoia 15.3', 'online'),
  ('matebook', 'MateBook X Pro', 'edge', 'matebook.local', 'Intel Core Ultra 9', 32, '1TB NVMe SSD', 'Windows 11 / WSL2', 'standby'),
  ('yanyucloud', 'YanYuCloud NAS F4-423', 'nas', 'yanyucloud.local', 'Intel Celeron N5105', 8, '32TB RAID6 HDD + 4TB RAID1 SSD', 'TOS 5.1', 'online')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 初始配置
-- ============================================================
INSERT INTO yyc3_preferences (key, value)
VALUES
  ('language', '"zh"'),
  ('theme', '"cyberpunk-dark"'),
  ('dev_mode', 'true'),
  ('auto_save_artifacts', 'true'),
  ('inference_temperature', '0.7'),
  ('inference_max_tokens', '8192'),
  ('default_model', '"claude-3.5-opus"')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 视图: 最近活跃的智能体会话
-- ============================================================
CREATE OR REPLACE VIEW v_active_agent_sessions AS
SELECT
  s.id,
  s.agent_id,
  s.agent_name,
  s.turn_count,
  s.total_tokens,
  s.created_at,
  s.updated_at,
  (SELECT COUNT(*) FROM yyc3_agent_messages m WHERE m.session_id = s.id) as message_count
FROM yyc3_agent_sessions s
WHERE s.is_active = TRUE
ORDER BY s.updated_at DESC;

-- ============================================================
-- 视图: 系统健康概览
-- ============================================================
CREATE OR REPLACE VIEW v_system_health AS
SELECT
  n.id as node_id,
  n.display_name,
  n.status,
  n.last_heartbeat,
  (SELECT value FROM yyc3_metrics WHERE node_id = n.id AND metric_type = 'cpu' ORDER BY recorded_at DESC LIMIT 1) as latest_cpu,
  (SELECT value FROM yyc3_metrics WHERE node_id = n.id AND metric_type = 'memory' ORDER BY recorded_at DESC LIMIT 1) as latest_memory,
  (SELECT value FROM yyc3_metrics WHERE node_id = n.id AND metric_type = 'disk' ORDER BY recorded_at DESC LIMIT 1) as latest_disk
FROM yyc3_nodes n
ORDER BY n.display_name;
`;

/**
 * 数据库表名常量 — 用于 API 层引用
 */
export const DB_TABLES = {
  SESSIONS: 'yyc3_sessions',
  MESSAGES: 'yyc3_messages',
  AGENT_SESSIONS: 'yyc3_agent_sessions',
  AGENT_MESSAGES: 'yyc3_agent_messages',
  METRICS: 'yyc3_metrics',
  LOGS: 'yyc3_logs',
  ARTIFACTS: 'yyc3_artifacts',
  PROJECTS: 'yyc3_projects',
  NODES: 'yyc3_nodes',
  PREFERENCES: 'yyc3_preferences',
} as const;

/**
 * 数据库视图常量
 */
export const DB_VIEWS = {
  ACTIVE_AGENT_SESSIONS: 'v_active_agent_sessions',
  SYSTEM_HEALTH: 'v_system_health',
} as const;
