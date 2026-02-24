/**
 * @file YYC³ AI Family 数据库连接模块
 * @description PostgreSQL连接池和操作封装
 * @author YYC³ Team
 * @version 1.0.0
 */

import pg from 'pg';

const { Pool } = pg;

// ============================================================
// Types
// ============================================================

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface ModelRecord {
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
  is_free: boolean;
  recommended_agents: string[];
  is_authorized: boolean;
  auth_company: string | null;
  auth_code: string | null;
  auth_validity: string | null;
}

export interface AgentRecord {
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
  total_requests: number;
  avg_latency_ms: number | null;
  success_rate: number;
}

export interface ConversationRecord {
  id: string;
  title: string | null;
  agent_id: string;
  model_id: string;
  status: string;
  message_count: number;
  total_tokens: number;
  started_at: Date;
  last_message_at: Date | null;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  model_id: string | null;
  agent_id: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number | null;
  created_at: Date;
}

export interface InferenceLogRecord {
  id: string;
  conversation_id: string | null;
  message_id: string | null;
  model_id: string;
  agent_id: string | null;
  request_type: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status: string;
  error_message: string | null;
  node_id: string | null;
  created_at: Date;
}

// ============================================================
// Database Connection
// ============================================================

class DatabaseConnection {
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

    this.pool.on('error', err => {
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

  getPool(): pg.Pool {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }

    return this.pool;
  }

  async query<T extends pg.QueryResultRow = any>(sql: string, params?: any[]): Promise<T[]> {
    const pool = this.getPool();
    const result = await pool.query<T>(sql, params);

    return result.rows;
  }

  async queryOne<T extends pg.QueryResultRow = any>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);

    return rows.length > 0 ? rows[0] : null;
  }

  async execute(sql: string, params?: any[]): Promise<number> {
    const pool = this.getPool();
    const result = await pool.query(sql, params);

    return result.rowCount || 0;
  }

  async transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const pool = this.getPool();
    const client = await pool.connect();

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
// Model Operations
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
      ORDER BY avg_latency_ms ASC
    `);
  }

  async findAuthorized(): Promise<ModelRecord[]> {
    return db.query<ModelRecord>(`
      SELECT * FROM core.models 
      WHERE is_authorized = true AND is_active = true
    `);
  }

  async updateStats(id: string, stats: {
    avgLatencyMs?: number;
    totalRequests?: number;
  }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (stats.avgLatencyMs !== undefined) {
      updates.push(`avg_latency_ms = $${paramIndex++}`);
      values.push(stats.avgLatencyMs);
    }

    if (updates.length === 0) return;

    values.push(id);
    await db.execute(`
      UPDATE core.models 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramIndex}
    `, values);
  }
}

// ============================================================
// Agent Operations
// ============================================================

export class AgentRepository {
  async findAll(): Promise<AgentRecord[]> {
    return db.query<AgentRecord>(`
      SELECT * FROM core.agents 
      WHERE is_active = true 
      ORDER BY total_requests DESC
    `);
  }

  async findById(id: string): Promise<AgentRecord | null> {
    return db.queryOne<AgentRecord>(`
      SELECT * FROM core.agents WHERE id = $1
    `, [id]);
  }

  async updateStats(id: string, stats: {
    totalRequests?: number;
    totalTokens?: number;
    avgLatencyMs?: number;
    successRate?: number;
  }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (stats.totalRequests !== undefined) {
      updates.push(`total_requests = total_requests + $${paramIndex++}`);
      values.push(stats.totalRequests);
    }

    if (stats.totalTokens !== undefined) {
      updates.push(`total_tokens = total_tokens + $${paramIndex++}`);
      values.push(stats.totalTokens);
    }

    if (stats.avgLatencyMs !== undefined) {
      updates.push(`avg_latency_ms = $${paramIndex++}`);
      values.push(stats.avgLatencyMs);
    }

    if (stats.successRate !== undefined) {
      updates.push(`success_rate = $${paramIndex++}`);
      values.push(stats.successRate);
    }

    if (updates.length === 0) return;

    values.push(id);
    await db.execute(`
      UPDATE core.agents 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramIndex}
    `, values);
  }
}

// ============================================================
// Conversation Operations
// ============================================================

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
    `, [data.title, data.agentId, data.modelId, data.userId, data.deviceId]);

    return result!.id;
  }

  async findById(id: string): Promise<ConversationRecord | null> {
    return db.queryOne<ConversationRecord>(`
      SELECT * FROM core.conversations WHERE id = $1
    `, [id]);
  }

  async findByUserId(userId: string, limit = 20): Promise<ConversationRecord[]> {
    return db.query<ConversationRecord>(`
      SELECT * FROM core.conversations 
      WHERE user_id = $1 AND status != 'deleted'
      ORDER BY started_at DESC
      LIMIT $2
    `, [userId, limit]);
  }

  async update(id: string, data: {
    title?: string;
    status?: string;
    contextSummary?: string;
  }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (data.contextSummary !== undefined) {
      updates.push(`context_summary = $${paramIndex++}`);
      values.push(data.contextSummary);
    }

    if (updates.length === 0) return;

    values.push(id);
    await db.execute(`
      UPDATE core.conversations 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramIndex}
    `, values);
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

// ============================================================
// Message Operations
// ============================================================

export class MessageRepository {
  async create(data: {
    conversationId: string;
    role: string;
    content: string;
    modelId?: string;
    agentId?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    latencyMs?: number;
    temperature?: number;
  }): Promise<string> {
    const result = await db.queryOne<{ id: string }>(`
      INSERT INTO core.messages (
        conversation_id, role, content, model_id, agent_id,
        prompt_tokens, completion_tokens, total_tokens, latency_ms, temperature
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      data.conversationId, data.role, data.content, data.modelId, data.agentId,
      data.promptTokens || 0, data.completionTokens || 0, data.totalTokens || 0,
      data.latencyMs, data.temperature,
    ]);

    return result!.id;
  }

  async findByConversationId(conversationId: string, limit = 100): Promise<MessageRecord[]> {
    return db.query<MessageRecord>(`
      SELECT * FROM core.messages 
      WHERE conversation_id = $1 AND is_deleted = false
      ORDER BY created_at ASC
      LIMIT $2
    `, [conversationId, limit]);
  }

  async getRecentMessages(conversationId: string, limit = 10): Promise<MessageRecord[]> {
    return db.query<MessageRecord>(`
      SELECT * FROM core.messages 
      WHERE conversation_id = $1 AND is_deleted = false
      ORDER BY created_at DESC
      LIMIT $2
    `, [conversationId, limit]);
  }

  async delete(id: string): Promise<void> {
    await db.execute(`
      UPDATE core.messages 
      SET is_deleted = true 
      WHERE id = $1
    `, [id]);
  }
}

// ============================================================
// Inference Log Operations
// ============================================================

export class InferenceLogRepository {
  async create(data: {
    conversationId?: string;
    messageId?: string;
    modelId: string;
    agentId?: string;
    requestType: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    firstTokenMs?: number;
    status: string;
    errorMessage?: string;
    nodeId?: string;
    endpoint?: string;
  }): Promise<string> {
    const result = await db.queryOne<{ id: string }>(`
      INSERT INTO core.inference_logs (
        conversation_id, message_id, model_id, agent_id, request_type,
        prompt_tokens, completion_tokens, total_tokens, latency_ms, first_token_ms,
        status, error_message, node_id, endpoint
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      data.conversationId, data.messageId, data.modelId, data.agentId, data.requestType,
      data.promptTokens, data.completionTokens, data.totalTokens, data.latencyMs, data.firstTokenMs,
      data.status, data.errorMessage, data.nodeId, data.endpoint,
    ]);

    return result!.id;
  }

  async findByModelId(modelId: string, limit = 100): Promise<InferenceLogRecord[]> {
    return db.query<InferenceLogRecord>(`
      SELECT * FROM core.inference_logs 
      WHERE model_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [modelId, limit]);
  }

  async findByAgentId(agentId: string, limit = 100): Promise<InferenceLogRecord[]> {
    return db.query<InferenceLogRecord>(`
      SELECT * FROM core.inference_logs 
      WHERE agent_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [agentId, limit]);
  }

  async getStatsByModel(modelId: string, hours = 24): Promise<{
    totalRequests: number;
    successRate: number;
    avgLatencyMs: number;
    totalTokens: number;
  }> {
    const result = await db.queryOne<{
      total_requests: string;
      success_rate: string;
      avg_latency_ms: string;
      total_tokens: string;
    }>(`
      SELECT 
        COUNT(*) as total_requests,
        ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
        ROUND(AVG(latency_ms)) as avg_latency_ms,
        SUM(total_tokens) as total_tokens
      FROM core.inference_logs
      WHERE model_id = $1 AND created_at > NOW() - INTERVAL '${hours} hours'
    `, [modelId]);

    return {
      totalRequests: parseInt(result?.total_requests || '0'),
      successRate: parseFloat(result?.success_rate || '0'),
      avgLatencyMs: parseInt(result?.avg_latency_ms || '0'),
      totalTokens: parseInt(result?.total_tokens || '0'),
    };
  }
}

// ============================================================
// System Config Operations
// ============================================================

export class SystemConfigRepository {
  async get(key: string): Promise<string | null> {
    const result = await db.queryOne<{ value: string }>(`
      SELECT value FROM core.system_config WHERE key = $1
    `, [key]);

    return result?.value || null;
  }

  async set(key: string, value: string): Promise<void> {
    await db.execute(`
      INSERT INTO core.system_config (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
    `, [key, value]);
  }

  async getAll(): Promise<Record<string, string>> {
    const rows = await db.query<{ key: string; value: string }>(`
      SELECT key, value FROM core.system_config
    `);

    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;

      return acc;
    }, {} as Record<string, string>);
  }
}

// ============================================================
// Repository Instances
// ============================================================

export const modelRepository = new ModelRepository();
export const agentRepository = new AgentRepository();
export const conversationRepository = new ConversationRepository();
export const messageRepository = new MessageRepository();
export const inferenceLogRepository = new InferenceLogRepository();
export const systemConfigRepository = new SystemConfigRepository();
