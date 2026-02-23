-- ============================================================
-- YYC³ AI Family — PostgreSQL 数据库 Schema (修复版)
--
-- 数据库: yyc3_aify
-- 端口: 5433
-- 用户: yyc3_aify
-- ============================================================

-- ============================================================
-- 1. 创建Schema和扩展
-- ============================================================

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS telemetry;
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. 核心表: 模型配置
-- ============================================================

CREATE TABLE IF NOT EXISTS core.models (
    id              VARCHAR(64) PRIMARY KEY,
    name            VARCHAR(128) NOT NULL,
    provider        VARCHAR(32) NOT NULL,
    tier            VARCHAR(16) NOT NULL DEFAULT 'cloud-paid',
    categories      VARCHAR(64)[] NOT NULL DEFAULT '{}',

    context_window  INTEGER NOT NULL DEFAULT 4096,
    max_output      INTEGER NOT NULL DEFAULT 2048,
    supports_streaming BOOLEAN NOT NULL DEFAULT true,
    supports_vision BOOLEAN NOT NULL DEFAULT false,
    supports_tools  BOOLEAN NOT NULL DEFAULT false,

    local_available BOOLEAN NOT NULL DEFAULT false,
    local_nodes     VARCHAR(32)[] DEFAULT '{}',
    ollama_name     VARCHAR(64),
    cloud_available BOOLEAN NOT NULL DEFAULT false,
    cloud_endpoint  VARCHAR(256),

    avg_latency_ms  INTEGER,
    p95_latency_ms  INTEGER,
    throughput      INTEGER,
    max_concurrent  INTEGER DEFAULT 4,

    input_price_per_m   DECIMAL(10,4) DEFAULT 0,
    output_price_per_m  DECIMAL(10,4) DEFAULT 0,
    is_free             BOOLEAN NOT NULL DEFAULT false,

    recommended_agents  VARCHAR(32)[] DEFAULT '{}',

    is_authorized       BOOLEAN NOT NULL DEFAULT false,
    auth_company        VARCHAR(128),
    auth_code           VARCHAR(64),
    auth_validity       VARCHAR(32),
    auth_certificate    VARCHAR(256),

    is_active       BOOLEAN NOT NULL DEFAULT true,
    priority        INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_tier CHECK (tier IN ('local', 'cloud-free', 'cloud-paid', 'authorized'))
);

CREATE INDEX IF NOT EXISTS idx_models_provider ON core.models(provider);
CREATE INDEX IF NOT EXISTS idx_models_tier ON core.models(tier);
CREATE INDEX IF NOT EXISTS idx_models_active ON core.models(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_models_authorized ON core.models(is_authorized) WHERE is_authorized = true;

-- ============================================================
-- 3. 核心表: Agent配置
-- ============================================================

CREATE TABLE IF NOT EXISTS core.agents (
    id              VARCHAR(32) PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    name_cn         VARCHAR(64) NOT NULL,
    role            VARCHAR(32) NOT NULL,
    description     TEXT NOT NULL,
    avatar          VARCHAR(256),
    color           VARCHAR(16) DEFAULT '#00ff88',

    primary_use_case    TEXT NOT NULL,
    local_priority      VARCHAR(64)[] DEFAULT '{}',
    authorized_priority VARCHAR(64)[] DEFAULT '{}',
    cloud_priority      VARCHAR(64)[] DEFAULT '{}',
    fallback_chain      VARCHAR(64)[] DEFAULT '{}',

    temperature      DECIMAL(3,2) DEFAULT 0.5,
    max_tokens       INTEGER DEFAULT 4096,
    top_p            DECIMAL(3,2) DEFAULT 0.9,

    system_prompt    TEXT,
    capabilities     VARCHAR(32)[] DEFAULT '{}',

    total_requests   BIGINT DEFAULT 0,
    total_tokens     BIGINT DEFAULT 0,
    avg_latency_ms   INTEGER,
    success_rate     DECIMAL(5,2) DEFAULT 100.00,

    is_active        BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_active ON core.agents(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agents_role ON core.agents(role);

-- ============================================================
-- 4. 核心表: 会话
-- ============================================================

CREATE TABLE IF NOT EXISTS core.conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(256),
    agent_id        VARCHAR(32) NOT NULL REFERENCES core.agents(id),
    model_id        VARCHAR(64) NOT NULL REFERENCES core.models(id),

    status          VARCHAR(16) NOT NULL DEFAULT 'active',
    message_count   INTEGER NOT NULL DEFAULT 0,
    total_tokens    BIGINT NOT NULL DEFAULT 0,
    total_cost      DECIMAL(10,6) DEFAULT 0,

    context_summary TEXT,
    context_tokens  INTEGER DEFAULT 0,

    user_id         VARCHAR(64),
    device_id       VARCHAR(64),
    client_ip       INET,

    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'deleted'))
);

CREATE INDEX IF NOT EXISTS idx_conversations_agent ON core.conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_model ON core.conversations(model_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON core.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_started ON core.conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON core.conversations(user_id);

-- ============================================================
-- 5. 核心表: 消息
-- ============================================================

CREATE TABLE IF NOT EXISTS core.messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES core.conversations(id) ON DELETE CASCADE,

    role            VARCHAR(16) NOT NULL,
    content         TEXT NOT NULL,
    content_type    VARCHAR(32) DEFAULT 'text',

    model_id        VARCHAR(64) REFERENCES core.models(id),
    agent_id        VARCHAR(32) REFERENCES core.agents(id),

    prompt_tokens   INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens    INTEGER DEFAULT 0,

    latency_ms      INTEGER,
    first_token_ms  INTEGER,

    temperature     DECIMAL(3,2),
    finish_reason   VARCHAR(32),

    metadata        JSONB DEFAULT '{}',
    is_edited       BOOLEAN DEFAULT false,
    is_deleted      BOOLEAN DEFAULT false,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_role CHECK (role IN ('system', 'user', 'assistant', 'function', 'tool'))
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON core.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_role ON core.messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_model ON core.messages(model_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON core.messages(created_at DESC);

-- ============================================================
-- 6. 核心表: 推理记录
-- ============================================================

CREATE TABLE IF NOT EXISTS core.inference_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES core.conversations(id),
    message_id      UUID REFERENCES core.messages(id),

    model_id        VARCHAR(64) NOT NULL REFERENCES core.models(id),
    agent_id        VARCHAR(32) REFERENCES core.agents(id),

    request_type    VARCHAR(16) NOT NULL,
    prompt_tokens   INTEGER NOT NULL,
    prompt_hash     VARCHAR(64),

    completion_tokens INTEGER NOT NULL,
    total_tokens    INTEGER NOT NULL,

    latency_ms      INTEGER NOT NULL,
    first_token_ms  INTEGER,
    tokens_per_second DECIMAL(10,2),

    input_cost      DECIMAL(10,6) DEFAULT 0,
    output_cost     DECIMAL(10,6) DEFAULT 0,
    total_cost      DECIMAL(10,6) DEFAULT 0,

    status          VARCHAR(16) NOT NULL DEFAULT 'success',
    error_message   TEXT,

    node_id         VARCHAR(32),
    endpoint        VARCHAR(256),

    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_request_type CHECK (request_type IN ('chat', 'completion', 'embedding', 'function')),
    CONSTRAINT valid_status CHECK (status IN ('success', 'error', 'timeout', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_inference_model ON core.inference_logs(model_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inference_agent ON core.inference_logs(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inference_status ON core.inference_logs(status);
CREATE INDEX IF NOT EXISTS idx_inference_created ON core.inference_logs(created_at DESC);

-- ============================================================
-- 7. 核心表: 授权验证
-- ============================================================

CREATE TABLE IF NOT EXISTS core.authorizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id        VARCHAR(64) NOT NULL REFERENCES core.models(id),

    company         VARCHAR(128) NOT NULL,
    auth_code       VARCHAR(64) NOT NULL,
    validity        VARCHAR(32) NOT NULL,
    certificate_path VARCHAR(256),

    is_verified     BOOLEAN NOT NULL DEFAULT false,
    verified_at     TIMESTAMPTZ,
    verified_by     VARCHAR(64),

    valid_from      DATE,
    valid_until     DATE,

    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_model ON core.authorizations(model_id);
CREATE INDEX IF NOT EXISTS idx_auth_verified ON core.authorizations(is_verified);

-- ============================================================
-- 8. 核心表: 用户偏好
-- ============================================================

CREATE TABLE IF NOT EXISTS core.user_preferences (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         VARCHAR(64) NOT NULL UNIQUE,

    default_agent   VARCHAR(32) REFERENCES core.agents(id),
    default_model   VARCHAR(64) REFERENCES core.models(id),

    prefer_local    BOOLEAN NOT NULL DEFAULT true,
    auto_fallback   BOOLEAN NOT NULL DEFAULT true,
    stream_response BOOLEAN NOT NULL DEFAULT true,

    theme           VARCHAR(16) DEFAULT 'dark',
    language        VARCHAR(8) DEFAULT 'zh-CN',
    font_size       INTEGER DEFAULT 14,

    notify_on_complete  BOOLEAN DEFAULT true,
    notify_on_error     BOOLEAN DEFAULT true,

    extra_config    JSONB DEFAULT '{}',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_prefs_user ON core.user_preferences(user_id);

-- ============================================================
-- 9. 核心表: 系统配置
-- ============================================================

CREATE TABLE IF NOT EXISTS core.system_config (
    key             VARCHAR(64) PRIMARY KEY,
    value           TEXT NOT NULL,
    value_type      VARCHAR(16) NOT NULL DEFAULT 'string',
    description     TEXT,
    is_secret       BOOLEAN NOT NULL DEFAULT false,
    is_editable     BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_value_type CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'array'))
);

-- ============================================================
-- 10. 遥测表: 服务延迟
-- ============================================================

CREATE TABLE IF NOT EXISTS telemetry.service_latency (
    id              BIGSERIAL PRIMARY KEY,
    service_id      VARCHAR(64) NOT NULL,
    service_name    VARCHAR(128) NOT NULL,
    service_type    VARCHAR(32) NOT NULL,

    latency_ms      INTEGER NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'unknown',

    source_node     VARCHAR(32),
    target_node     VARCHAR(32),
    target_host     VARCHAR(128),
    target_port     INTEGER,

    timestamp       BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_service_status CHECK (status IN ('healthy', 'degraded', 'down', 'unknown'))
);

CREATE INDEX IF NOT EXISTS idx_latency_service ON telemetry.service_latency(service_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_latency_timestamp ON telemetry.service_latency(timestamp DESC);

-- ============================================================
-- 11. 触发器: 自动更新 updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_models_updated_at ON core.models;
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON core.models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON core.agents;
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON core.agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON core.conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON core.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_prefs_updated_at ON core.user_preferences;
CREATE TRIGGER update_user_prefs_updated_at BEFORE UPDATE ON core.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_config_updated_at ON core.system_config;
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON core.system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_authorizations_updated_at ON core.authorizations;
CREATE TRIGGER update_authorizations_updated_at BEFORE UPDATE ON core.authorizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 12. 触发器: 更新会话统计
-- ============================================================

CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE core.conversations
    SET
        message_count = message_count + 1,
        total_tokens = total_tokens + COALESCE(NEW.total_tokens, 0),
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_conversation_on_message ON core.messages;
CREATE TRIGGER update_conversation_on_message AFTER INSERT ON core.messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();

-- ============================================================
-- 13. 视图: 模型概览
-- ============================================================

CREATE OR REPLACE VIEW core.v_model_overview AS
SELECT
    m.id,
    m.name,
    m.provider,
    m.tier,
    m.is_authorized,
    m.local_available,
    m.cloud_available,
    m.is_free,
    m.avg_latency_ms,
    array_length(m.recommended_agents, 1) as agent_count,
    (SELECT COUNT(*) FROM core.inference_logs il WHERE il.model_id = m.id) as total_requests,
    (SELECT AVG(il.latency_ms) FROM core.inference_logs il WHERE il.model_id = m.id) as actual_avg_latency
FROM core.models m
WHERE m.is_active = true
ORDER BY m.priority DESC, m.name;

-- ============================================================
-- 14. 视图: Agent概览
-- ============================================================

CREATE OR REPLACE VIEW core.v_agent_overview AS
SELECT
    a.id,
    a.name,
    a.name_cn,
    a.role,
    a.total_requests,
    a.success_rate,
    a.avg_latency_ms,
    m.name as default_model_name,
    array_length(a.capabilities, 1) as capability_count
FROM core.agents a
LEFT JOIN core.models m ON m.id = a.local_priority[1]
WHERE a.is_active = true
ORDER BY a.total_requests DESC;

-- ============================================================
-- 15. 视图: 会话概览
-- ============================================================

CREATE OR REPLACE VIEW core.v_conversation_overview AS
SELECT
    c.id,
    c.title,
    c.status,
    c.message_count,
    c.total_tokens,
    a.name_cn as agent_name,
    m.name as model_name,
    c.started_at,
    c.last_message_at
FROM core.conversations c
JOIN core.agents a ON a.id = c.agent_id
JOIN core.models m ON m.id = c.model_id
ORDER BY c.started_at DESC;

-- ============================================================
-- 16. 初始数据: 七大智能体
-- ============================================================

INSERT INTO core.agents (id, name, name_cn, role, description, primary_use_case, local_priority, authorized_priority, cloud_priority, fallback_chain, temperature, max_tokens, capabilities, system_prompt) VALUES
('navigator', 'Navigator', '智愈·领航员', 'Commander', '全域资源调度与路径规划', '全域资源调度与路径规划',
 ARRAY['qwen2.5:7b'], ARRAY['CodeGeeX4-ALL-9B'], ARRAY['GLM-4.7', 'claude-sonnet-4-20250514', 'deepseek-chat'],
 ARRAY['qwen2.5:7b', 'GLM-4.7-Flash', 'GLM-4.7'], 0.3, 4096, ARRAY['scheduling', 'routing', 'coordination'],
 '你是智愈·领航员，YYC³ AI Family的指挥官。你负责全域资源调度与路径规划，以高效、精准的方式协调各个Agent完成任务。'),

('thinker', 'Thinker', '洞见·思想家', 'Strategist', '深度逻辑推理与决策分析', '深度逻辑推理与决策分析',
 ARRAY['qwen2.5:7b'], ARRAY['CodeGeeX4-ALL-9B'], ARRAY['claude-sonnet-4-20250514', 'deepseek-reasoner', 'gpt-4o'],
 ARRAY['qwen2.5:7b', 'deepseek-reasoner', 'claude-sonnet-4-20250514'], 0.5, 8192, ARRAY['reasoning', 'analysis', 'strategy'],
 '你是洞见·思想家，YYC³ AI Family的策略师。你擅长深度逻辑推理与决策分析，为复杂问题提供深刻的洞察和解决方案。'),

('prophet', 'Prophet', '预见·先知', 'Predictor', '趋势预测与风险前置', '趋势预测与风险前置',
 ARRAY['qwen2.5:7b'], ARRAY['CodeGeeX4-ALL-9B']::VARCHAR(64)[], ARRAY['deepseek-reasoner', 'GLM-4.7', 'gemini-2.5-flash'],
 ARRAY['qwen2.5:7b', 'deepseek-reasoner', 'gemini-2.5-flash'], 0.4, 4096, ARRAY['prediction', 'forecasting', 'risk_analysis'],
 '你是预见·先知，YYC³ AI Family的预测者。你擅长趋势预测与风险前置，帮助团队提前识别潜在问题并制定应对策略。'),

('bole', 'Bole', '知遇·伯乐', 'Evaluator', '模型评估与优选匹配', '模型评估与优选匹配',
 ARRAY['codegeex4:latest', 'glm4:9b'], ARRAY['CodeGeeX4-ALL-9B'], ARRAY['GLM-4.7', 'deepseek-chat'],
 ARRAY['codegeex4:latest', 'GLM-4.7', 'deepseek-chat'], 0.3, 4096, ARRAY['evaluation', 'matching', 'optimization'],
 '你是知遇·伯乐，YYC³ AI Family的评估师。你擅长模型评估与优选匹配，为不同任务推荐最合适的AI模型。'),

('pivot', 'Pivot', '元启·天枢', 'Coordinator', '核心状态管理与上下文', '核心状态管理与上下文',
 ARRAY['qwen2.5:7b', 'phi3:mini'], ARRAY['ChatGLM3-6B'], ARRAY['GLM-4-Long', 'GLM-4.7-Flash', 'gemini-2.5-flash'],
 ARRAY['qwen2.5:7b', 'GLM-4.7-Flash', 'GLM-4-Long'], 0.2, 4096, ARRAY['coordination', 'context_management', 'state_tracking'],
 '你是元启·天枢，YYC³ AI Family的协调者。你负责核心状态管理与上下文维护，确保系统各部分协调运转。'),

('sentinel', 'Sentinel', '卫安·哨兵', 'Guardian', '安全边界防护与审计', '安全边界防护与审计',
 ARRAY['qwen2.5:7b', 'phi3:mini'], ARRAY['CogAgent'], ARRAY['claude-sonnet-4-20250514', 'GLM-4.7-Flash'],
 ARRAY['qwen2.5:7b', 'GLM-4.7-Flash', 'claude-sonnet-4-20250514'], 0.1, 4096, ARRAY['security', 'audit', 'monitoring'],
 '你是卫安·哨兵，YYC³ AI Family的守护者。你负责安全边界防护与审计，确保系统安全稳定运行。'),

('grandmaster', 'Grandmaster', '格物·宗师', 'Scholar', '知识库构建与本体论', '知识库构建与本体论',
 ARRAY['codegeex4:latest'], ARRAY['CodeGeeX4-ALL-9B', 'CogVideoX-5B'], ARRAY['gpt-4o', 'GLM-4.7', 'claude-sonnet-4-20250514'],
 ARRAY['codegeex4:latest', 'GLM-4.7', 'gpt-4o'], 0.4, 8192, ARRAY['knowledge', 'ontology', 'learning'],
 '你是格物·宗师，YYC³ AI Family的学者。你负责知识库构建与本体论研究，为系统提供知识支撑。')
ON CONFLICT (id) DO UPDATE SET
    name_cn = EXCLUDED.name_cn,
    role = EXCLUDED.role,
    description = EXCLUDED.description,
    primary_use_case = EXCLUDED.primary_use_case,
    local_priority = EXCLUDED.local_priority,
    authorized_priority = EXCLUDED.authorized_priority,
    cloud_priority = EXCLUDED.cloud_priority,
    fallback_chain = EXCLUDED.fallback_chain,
    temperature = EXCLUDED.temperature,
    max_tokens = EXCLUDED.max_tokens,
    capabilities = EXCLUDED.capabilities,
    system_prompt = EXCLUDED.system_prompt;

-- ============================================================
-- 17. 初始数据: 授权模型
-- ============================================================

INSERT INTO core.models (id, name, provider, tier, categories, context_window, max_output, supports_streaming, supports_vision, supports_tools, local_available, local_nodes, ollama_name, cloud_available, cloud_endpoint, avg_latency_ms, is_free, recommended_agents, is_authorized, auth_company, auth_code, auth_validity, auth_certificate) VALUES
('CodeGeeX4-ALL-9B', 'CodeGeeX4-ALL-9B (授权)', 'zhipu', 'authorized', ARRAY['coding', 'reasoning'], 128000, 8192, true, false, true, true, ARRAY['m4-max', 'imac-m4'], 'codegeex4:latest', true, 'https://open.bigmodel.cn/api/paas/v4', 5300, true, ARRAY['bole', 'grandmaster'], true, '洛阳沫言酒店管理有限公司', '202411283053152737', '永久有效', '/Users/yanyu/YYC3-Mac-Max/智谱授权书/ZhiPu_CodeGeeX4-ALL-9B.png'),

('ChatGLM3-6B', 'ChatGLM3-6B (授权)', 'zhipu', 'authorized', ARRAY['conversation', 'reasoning'], 8192, 2048, true, false, false, ARRAY[]::VARCHAR(32)[], NULL, true, 'https://open.bigmodel.cn/api/paas/v4', NULL, true, ARRAY['pivot'], true, '洛阳沫言酒店管理有限公司', '202411283053152737', '永久有效', '/Users/yanyu/YYC3-Mac-Max/智谱授权书/ZhiPu_ChatGLM3-6B.png'),

('CogAgent', 'CogAgent (授权)', 'zhipu', 'authorized', ARRAY['vision', 'automation', 'reasoning'], 32000, 4096, true, true, true, false, ARRAY[]::VARCHAR(32)[], NULL, true, 'https://open.bigmodel.cn/api/paas/v4', NULL, true, ARRAY['navigator', 'sentinel'], true, '洛阳沫言酒店管理有限公司', '202411283053152737', '永久有效', '/Users/yanyu/YYC3-Mac-Max/智谱授权书/ZhiPu_CogAgent.png'),

('CogVideoX-5B', 'CogVideoX-5B (授权)', 'zhipu', 'authorized', ARRAY['video', 'vision'], 8192, 2048, true, false, false, false, ARRAY[]::VARCHAR(32)[], NULL, true, 'https://open.bigmodel.cn/api/paas/v4', NULL, true, ARRAY['grandmaster'], true, '洛阳沫言酒店管理有限公司', '202411283053152737', '永久有效', '/Users/yanyu/YYC3-Mac-Max/智谱授权书/ZhiPu_CogVideoX-5B.png')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    provider = EXCLUDED.provider,
    tier = EXCLUDED.tier,
    categories = EXCLUDED.categories,
    context_window = EXCLUDED.context_window,
    max_output = EXCLUDED.max_output,
    local_available = EXCLUDED.local_available,
    local_nodes = EXCLUDED.local_nodes,
    ollama_name = EXCLUDED.ollama_name,
    cloud_available = EXCLUDED.cloud_available,
    cloud_endpoint = EXCLUDED.cloud_endpoint,
    is_authorized = EXCLUDED.is_authorized,
    auth_company = EXCLUDED.auth_company,
    auth_code = EXCLUDED.auth_code,
    auth_validity = EXCLUDED.auth_validity,
    auth_certificate = EXCLUDED.auth_certificate;

-- ============================================================
-- 18. 初始数据: 本地模型
-- ============================================================

INSERT INTO core.models (id, name, provider, tier, categories, context_window, max_output, supports_streaming, supports_vision, supports_tools, local_available, local_nodes, ollama_name, avg_latency_ms, throughput, max_concurrent, is_free, recommended_agents) VALUES
('qwen2.5:7b', 'Qwen 2.5 7B (本地)', 'ollama', 'local', ARRAY['conversation', 'reasoning', 'coding'], 128000, 8192, true, false, false, true, ARRAY['m4-max'], 'qwen2.5:7b', 2800, 45, 4, true, ARRAY['navigator', 'thinker', 'prophet', 'pivot', 'sentinel']),

('glm4:9b', 'GLM-4 9B (本地)', 'ollama', 'local', ARRAY['conversation', 'reasoning'], 128000, 8192, true, false, false, true, ARRAY['imac-m4'], 'glm4:9b', 5200, 28, 2, true, ARRAY['bole', 'pivot', 'sentinel']),

('codegeex4:latest', 'CodeGeeX4 (本地)', 'ollama', 'local', ARRAY['coding', 'reasoning'], 128000, 8192, true, false, true, true, ARRAY['m4-max', 'imac-m4'], 'codegeex4:latest', 5300, 25, 3, true, ARRAY['bole', 'grandmaster']),

('phi3:mini', 'Phi-3 Mini 3.8B (本地)', 'ollama', 'local', ARRAY['conversation', 'reasoning'], 128000, 8192, true, false, false, true, ARRAY['imac-m4'], 'phi3:mini', 4900, 55, 3, true, ARRAY['sentinel', 'pivot'])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    local_available = EXCLUDED.local_available,
    local_nodes = EXCLUDED.local_nodes,
    ollama_name = EXCLUDED.ollama_name,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    throughput = EXCLUDED.throughput,
    max_concurrent = EXCLUDED.max_concurrent;

-- ============================================================
-- 19. 初始数据: 云端模型
-- ============================================================

INSERT INTO core.models (id, name, provider, tier, categories, context_window, max_output, supports_streaming, supports_vision, supports_tools, cloud_available, cloud_endpoint, input_price_per_m, output_price_per_m, is_free, recommended_agents) VALUES
('GLM-4.7', 'GLM-4.7 (云端)', 'zhipu', 'cloud-paid', ARRAY['reasoning', 'coding', 'conversation'], 200000, 128000, true, false, true, true, 'https://open.bigmodel.cn/api/paas/v4', 0, 0, false, ARRAY['navigator', 'thinker', 'grandmaster']),

('GLM-4.7-Flash', 'GLM-4.7 Flash (免费云端)', 'zhipu', 'cloud-free', ARRAY['conversation', 'reasoning'], 200000, 128000, true, false, false, true, 'https://open.bigmodel.cn/api/paas/v4', 0, 0, true, ARRAY['pivot', 'sentinel']),

('GLM-4-Long', 'GLM-4 Long (1M上下文)', 'zhipu', 'cloud-paid', ARRAY['conversation', 'reasoning'], 1000000, 4096, true, false, false, true, 'https://open.bigmodel.cn/api/paas/v4', 0, 0, false, ARRAY['pivot', 'grandmaster']),

('gpt-4o', 'GPT-4o', 'openai', 'cloud-paid', ARRAY['reasoning', 'coding', 'conversation', 'vision'], 128000, 16384, true, true, true, true, 'https://api.openai.com/v1', 2.5, 10, false, ARRAY['thinker', 'grandmaster']),

('claude-sonnet-4-20250514', 'Claude 4 Sonnet', 'anthropic', 'cloud-paid', ARRAY['reasoning', 'coding', 'conversation', 'vision'], 200000, 64000, true, true, true, true, 'https://api.anthropic.com/v1', 3, 15, false, ARRAY['thinker', 'navigator', 'sentinel']),

('deepseek-chat', 'DeepSeek-V3', 'deepseek', 'cloud-paid', ARRAY['reasoning', 'coding', 'conversation'], 128000, 8192, true, false, true, true, 'https://api.deepseek.com/v1', 0.14, 0.28, false, ARRAY['navigator', 'bole', 'prophet']),

('deepseek-reasoner', 'DeepSeek-R1', 'deepseek', 'cloud-paid', ARRAY['reasoning'], 128000, 8192, true, false, false, true, 'https://api.deepseek.com/v1', 0.55, 2.2, false, ARRAY['thinker', 'prophet']),

('gemini-2.5-flash', 'Gemini 2.5 Flash (免费)', 'google', 'cloud-free', ARRAY['reasoning', 'conversation', 'vision'], 1048576, 65536, true, true, false, true, 'https://generativelanguage.googleapis.com/v1beta/openai', 0, 0, true, ARRAY['pivot', 'prophet'])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    provider = EXCLUDED.provider,
    tier = EXCLUDED.tier,
    categories = EXCLUDED.categories,
    context_window = EXCLUDED.context_window,
    max_output = EXCLUDED.max_output,
    cloud_available = EXCLUDED.cloud_available,
    cloud_endpoint = EXCLUDED.cloud_endpoint,
    input_price_per_m = EXCLUDED.input_price_per_m,
    output_price_per_m = EXCLUDED.output_price_per_m,
    is_free = EXCLUDED.is_free;

-- ============================================================
-- 20. 授权记录
-- ============================================================

INSERT INTO core.authorizations (model_id, company, auth_code, validity, certificate_path, is_verified, verified_at)
SELECT
    id,
    auth_company,
    auth_code,
    auth_validity,
    auth_certificate,
    true,
    NOW()
FROM core.models
WHERE is_authorized = true
ON CONFLICT DO NOTHING;

-- ============================================================
-- 21. 系统配置
-- ============================================================

INSERT INTO core.system_config (key, value, value_type, description, is_secret, is_editable) VALUES
('app.name', 'YYC³ AI Family', 'string', '应用名称', false, true),
('app.version', '1.0.0', 'string', '应用版本', false, true),
('app.port', '3200', 'number', '应用端口', false, true),
('db.version', '15', 'string', '数据库版本', false, false),
('auth.company', '洛阳沫言酒店管理有限公司', 'string', '授权公司', false, false),
('auth.code', '202411283053152737', 'string', '授权编号', false, false),
('auth.validity', '永久有效', 'string', '授权有效期', false, false),
('ollama.host', 'localhost', 'string', 'Ollama主机', false, true),
('ollama.port', '11434', 'number', 'Ollama端口', false, true),
('redis.host', 'localhost', 'string', 'Redis主机', false, true),
('redis.port', '6379', 'number', 'Redis端口', false, true),
('cache.ttl', '3600', 'number', '缓存过期时间(秒)', false, true),
('rate.limit.max', '100', 'number', 'API限流最大请求数', false, true),
('rate.limit.window', '900000', 'number', 'API限流窗口(毫秒)', false, true)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- ============================================================
-- 22. 完成
-- ============================================================

SELECT 'YYC³ AI Family 数据库 Schema 初始化完成' AS result;
SELECT
    (SELECT COUNT(*) FROM core.models) as models_count,
    (SELECT COUNT(*) FROM core.agents) as agents_count,
    (SELECT COUNT(*) FROM core.authorizations) as authorizations_count,
    (SELECT COUNT(*) FROM core.system_config) as config_count;
