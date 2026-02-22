// ============================================================
// YYC3 Hacker Chatbot — API Service Layer
// Phase 9: Data Persistence API
//
// 架构说明:
// - 前端通过此层与后端 REST API 通信
// - 后端服务 (Express/Fastify) 监听 localhost:3001
// - 当后端不可用时，自动降级为 localStorage mock
// - 所有接口均为 Promise-based，方便后续替换
//
// 后端对接指南:
// 1. 创建 Express 服务: npm init && npm i express pg cors
// 2. 配置 PostgreSQL 连接池 (pg.Pool)
// 3. 按照下方 ApiEndpoints 实现 REST 路由
// 4. 修改 API_BASE_URL 指向你的后端
// ============================================================

// --- 配置 ---

const API_BASE_URL = 'http://localhost:3001/api/v1';
const API_TIMEOUT = 5000;

// --- 连接状态 ---

export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

let _connectionStatus: ConnectionStatus = 'checking';
let _lastCheck = 0;
const CHECK_INTERVAL = 30000; // 30s

/**
 * 检测后端 API 是否可用
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    _connectionStatus = res.ok ? 'connected' : 'disconnected';
    _lastCheck = Date.now();
    return res.ok;
  } catch {
    _connectionStatus = 'disconnected';
    _lastCheck = Date.now();
    return false;
  }
}

export function getConnectionStatus(): ConnectionStatus {
  if (Date.now() - _lastCheck > CHECK_INTERVAL) {
    checkConnection(); // fire-and-forget refresh
  }
  return _connectionStatus;
}

// --- 通用 Fetch 封装 ---

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; fromCache: boolean }> {
  // 检查连接状态
  if (_connectionStatus === 'checking') {
    await checkConnection();
  }

  if (_connectionStatus === 'disconnected') {
    // 降级到 localStorage
    return { data: null, error: 'BACKEND_OFFLINE', fromCache: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      return { data: null, error: `HTTP ${res.status}: ${errorText}`, fromCache: false };
    }

    const data = await res.json() as T;
    return { data, error: null, fromCache: false };
  } catch (err) {
    _connectionStatus = 'disconnected';
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, error: message, fromCache: true };
  }
}

// --- TypeScript 接口 (与 PostgreSQL Schema 对齐) ---

export interface DBSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  metadata: Record<string, unknown>;
}

export interface DBMessage {
  id: string;
  session_id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  agent_name?: string;
  agent_role?: string;
  timestamp: string;
  tokens_used: number;
}

export interface DBAgentSession {
  id: string;
  agent_id: string;
  agent_name: string;
  created_at: string;
  updated_at: string;
  turn_count: number;
  total_tokens: number;
  is_active: boolean;
}

export interface DBAgentMessage {
  id: string;
  session_id: string;
  agent_id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  thinking_time: number;
}

export interface DBMetricPoint {
  id: number;
  node_id: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
}

export interface DBLogEntry {
  id: number;
  level: 'info' | 'warn' | 'error' | 'success' | 'debug';
  source: string;
  message: string;
  timestamp: string;
}

export interface DBArtifact {
  id: string;
  title: string;
  artifact_type: string;
  language: string;
  content: string;
  size_bytes: number;
  version: string;
  generated_by?: string;
  agent_id?: string;
  tags: string[];
  is_starred: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBNode {
  id: string;
  display_name: string;
  node_type: string;
  hostname: string;
  cpu_model: string;
  ram_gb: number;
  storage_desc: string;
  os: string;
  status: string;
  last_heartbeat: string;
}

export interface DBProject {
  id: string;
  name: string;
  description: string;
  project_type: string;
  language: string;
  language_color: string;
  branch: string;
  status: string;
  health: string;
  service_count: number;
  stars: number;
  last_commit_at: string;
  created_at: string;
}

// --- localStorage Fallback 工具 ---

function localGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`yyc3_${key}`);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function localSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(`yyc3_${key}`, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// --- API 服务对象 ---

export const api = {
  // === Sessions ===
  sessions: {
    async list(): Promise<DBSession[]> {
      const result = await apiFetch<DBSession[]>('/sessions');
      if (result.fromCache) {
        return localGet<DBSession[]>('sessions', []);
      }
      return result.data ?? [];
    },

    async create(title: string): Promise<DBSession | null> {
      const result = await apiFetch<DBSession>('/sessions', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      if (result.fromCache) {
        const session: DBSession = {
          id: crypto.randomUUID(),
          title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_archived: false,
          metadata: {},
        };
        const sessions = localGet<DBSession[]>('sessions', []);
        sessions.unshift(session);
        localSet('sessions', sessions);
        return session;
      }
      return result.data;
    },

    async archive(id: string): Promise<void> {
      const result = await apiFetch(`/sessions/${id}/archive`, { method: 'PATCH' });
      if (result.fromCache) {
        const sessions = localGet<DBSession[]>('sessions', []);
        const idx = sessions.findIndex(s => s.id === id);
        if (idx >= 0) {
          sessions[idx].is_archived = true;
          localSet('sessions', sessions);
        }
      }
    },
  },

  // === Messages ===
  messages: {
    async list(sessionId: string): Promise<DBMessage[]> {
      const result = await apiFetch<DBMessage[]>(`/sessions/${sessionId}/messages`);
      if (result.fromCache) {
        return localGet<DBMessage[]>(`messages_${sessionId}`, []);
      }
      return result.data ?? [];
    },

    async create(sessionId: string, msg: Omit<DBMessage, 'id' | 'session_id' | 'tokens_used'>): Promise<DBMessage | null> {
      const result = await apiFetch<DBMessage>(`/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify(msg),
      });
      if (result.fromCache) {
        const newMsg: DBMessage = {
          ...msg,
          id: crypto.randomUUID(),
          session_id: sessionId,
          tokens_used: 0,
        };
        const messages = localGet<DBMessage[]>(`messages_${sessionId}`, []);
        messages.push(newMsg);
        localSet(`messages_${sessionId}`, messages);
        return newMsg;
      }
      return result.data;
    },
  },

  // === Agent Sessions ===
  agentSessions: {
    async getOrCreate(agentId: string, agentName: string): Promise<DBAgentSession | null> {
      const result = await apiFetch<DBAgentSession>(`/agents/${agentId}/session`, {
        method: 'POST',
        body: JSON.stringify({ agent_name: agentName }),
      });
      if (result.fromCache) {
        const key = `agent_session_${agentId}`;
        let session = localGet<DBAgentSession | null>(key, null);
        if (!session) {
          session = {
            id: crypto.randomUUID(),
            agent_id: agentId,
            agent_name: agentName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            turn_count: 0,
            total_tokens: 0,
            is_active: true,
          };
          localSet(key, session);
        }
        return session;
      }
      return result.data;
    },

    async reset(agentId: string): Promise<void> {
      await apiFetch(`/agents/${agentId}/session/reset`, { method: 'POST' });
      localSet(`agent_messages_${agentId}`, []);
      localSet(`agent_session_${agentId}`, null);
    },
  },

  // === Agent Messages ===
  agentMessages: {
    async list(agentId: string): Promise<DBAgentMessage[]> {
      const result = await apiFetch<DBAgentMessage[]>(`/agents/${agentId}/messages`);
      if (result.fromCache) {
        return localGet<DBAgentMessage[]>(`agent_messages_${agentId}`, []);
      }
      return result.data ?? [];
    },

    async create(agentId: string, msg: Omit<DBAgentMessage, 'id' | 'session_id' | 'thinking_time'>): Promise<DBAgentMessage | null> {
      const result = await apiFetch<DBAgentMessage>(`/agents/${agentId}/messages`, {
        method: 'POST',
        body: JSON.stringify(msg),
      });
      if (result.fromCache) {
        const newMsg: DBAgentMessage = {
          ...msg,
          id: crypto.randomUUID(),
          session_id: '',
          thinking_time: 0,
        };
        const messages = localGet<DBAgentMessage[]>(`agent_messages_${agentId}`, []);
        messages.push(newMsg);
        localSet(`agent_messages_${agentId}`, messages);
        return newMsg;
      }
      return result.data;
    },
  },

  // === Metrics ===
  metrics: {
    async record(nodeId: string, metricType: string, value: number, unit = '%'): Promise<void> {
      const result = await apiFetch('/metrics', {
        method: 'POST',
        body: JSON.stringify({ node_id: nodeId, metric_type: metricType, value, unit }),
      });
      if (result.fromCache) {
        const key = `metrics_${nodeId}_${metricType}`;
        const points = localGet<Array<{ value: number; recorded_at: string }>>(key, []);
        points.push({ value, recorded_at: new Date().toISOString() });
        // 保留最近 200 个点
        if (points.length > 200) points.splice(0, points.length - 200);
        localSet(key, points);
      }
    },

    async query(nodeId: string, metricType: string, limit = 60): Promise<DBMetricPoint[]> {
      const result = await apiFetch<DBMetricPoint[]>(
        `/metrics?node_id=${nodeId}&metric_type=${metricType}&limit=${limit}`
      );
      if (result.fromCache) {
        const key = `metrics_${nodeId}_${metricType}`;
        const points = localGet<Array<{ value: number; recorded_at: string }>>(key, []);
        return points.slice(-limit).map((p, i) => ({
          id: i,
          node_id: nodeId,
          metric_type: metricType,
          value: p.value,
          unit: '%',
          recorded_at: p.recorded_at,
        }));
      }
      return result.data ?? [];
    },
  },

  // === Logs ===
  logs: {
    async list(limit = 50, level?: string): Promise<DBLogEntry[]> {
      const params = new URLSearchParams({ limit: String(limit) });
      if (level) params.set('level', level);
      const result = await apiFetch<DBLogEntry[]>(`/logs?${params}`);
      if (result.fromCache) {
        return localGet<DBLogEntry[]>('logs', []).slice(0, limit);
      }
      return result.data ?? [];
    },

    async create(entry: Omit<DBLogEntry, 'id' | 'timestamp'>): Promise<void> {
      const result = await apiFetch('/logs', {
        method: 'POST',
        body: JSON.stringify(entry),
      });
      if (result.fromCache) {
        const logs = localGet<DBLogEntry[]>('logs', []);
        logs.unshift({
          ...entry,
          id: Date.now(),
          timestamp: new Date().toISOString(),
        });
        if (logs.length > 200) logs.length = 200;
        localSet('logs', logs);
      }
    },
  },

  // === Preferences ===
  preferences: {
    async get(key: string): Promise<unknown> {
      const result = await apiFetch<{ value: unknown }>(`/preferences/${key}`);
      if (result.fromCache) {
        return localGet(`pref_${key}`, null);
      }
      return result.data?.value ?? null;
    },

    async set(key: string, value: unknown): Promise<void> {
      await apiFetch(`/preferences/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
      localSet(`pref_${key}`, value);
    },
  },

  // === Projects CRUD ===
  projects: {
    async list(): Promise<DBProject[]> {
      const result = await apiFetch<DBProject[]>('/projects');
      if (result.fromCache) {
        return localGet<DBProject[]>('projects', []);
      }
      return result.data ?? [];
    },

    async get(id: string): Promise<DBProject | null> {
      const result = await apiFetch<DBProject>(`/projects/${id}`);
      if (result.fromCache) {
        const projects = localGet<DBProject[]>('projects', []);
        return projects.find(p => p.id === id) ?? null;
      }
      return result.data;
    },

    async create(project: Omit<DBProject, 'id' | 'created_at' | 'last_commit_at' | 'stars' | 'service_count'>): Promise<DBProject | null> {
      const result = await apiFetch<DBProject>('/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      });
      if (result.fromCache) {
        const newProject: DBProject = {
          ...project,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          last_commit_at: new Date().toISOString(),
          stars: 0,
          service_count: 0,
        };
        const projects = localGet<DBProject[]>('projects', []);
        projects.unshift(newProject);
        localSet('projects', projects);
        return newProject;
      }
      return result.data;
    },

    async update(id: string, data: Partial<DBProject>): Promise<DBProject | null> {
      const result = await apiFetch<DBProject>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (result.fromCache) {
        const projects = localGet<DBProject[]>('projects', []);
        const idx = projects.findIndex(p => p.id === id);
        if (idx >= 0) {
          projects[idx] = { ...projects[idx], ...data };
          localSet('projects', projects);
          return projects[idx];
        }
        return null;
      }
      return result.data;
    },

    async remove(id: string): Promise<boolean> {
      const result = await apiFetch(`/projects/${id}`, { method: 'DELETE' });
      if (result.fromCache) {
        const projects = localGet<DBProject[]>('projects', []);
        const filtered = projects.filter(p => p.id !== id);
        localSet('projects', filtered);
      }
      return true;
    },
  },

  // === Artifacts CRUD ===
  artifacts: {
    async list(type?: string): Promise<DBArtifact[]> {
      const params = type && type !== 'all' ? `?type=${type}` : '';
      const result = await apiFetch<DBArtifact[]>(`/artifacts${params}`);
      if (result.fromCache) {
        return localGet<DBArtifact[]>('artifacts', []);
      }
      return result.data ?? [];
    },

    async get(id: string): Promise<DBArtifact | null> {
      const result = await apiFetch<DBArtifact>(`/artifacts/${id}`);
      if (result.fromCache) {
        const artifacts = localGet<DBArtifact[]>('artifacts', []);
        return artifacts.find(a => a.id === id) ?? null;
      }
      return result.data;
    },

    async create(artifact: {
      title: string;
      artifact_type: string;
      language: string;
      content: string;
      generated_by?: string;
      agent_id?: string;
      tags?: string[];
      version?: string;
    }): Promise<DBArtifact | null> {
      const result = await apiFetch<DBArtifact>('/artifacts', {
        method: 'POST',
        body: JSON.stringify(artifact),
      });
      if (result.fromCache) {
        const newArtifact: DBArtifact = {
          id: crypto.randomUUID(),
          title: artifact.title,
          artifact_type: artifact.artifact_type,
          language: artifact.language,
          content: artifact.content,
          size_bytes: new TextEncoder().encode(artifact.content).length,
          version: artifact.version ?? 'v1.0',
          generated_by: artifact.generated_by,
          agent_id: artifact.agent_id,
          tags: artifact.tags ?? [],
          is_starred: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const artifacts = localGet<DBArtifact[]>('artifacts', []);
        artifacts.unshift(newArtifact);
        localSet('artifacts', artifacts);
        return newArtifact;
      }
      return result.data;
    },

    async update(id: string, data: Partial<DBArtifact>): Promise<DBArtifact | null> {
      const result = await apiFetch<DBArtifact>(`/artifacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (result.fromCache) {
        const artifacts = localGet<DBArtifact[]>('artifacts', []);
        const idx = artifacts.findIndex(a => a.id === id);
        if (idx >= 0) {
          artifacts[idx] = { ...artifacts[idx], ...data, updated_at: new Date().toISOString() };
          localSet('artifacts', artifacts);
          return artifacts[idx];
        }
        return null;
      }
      return result.data;
    },

    async remove(id: string): Promise<boolean> {
      const result = await apiFetch(`/artifacts/${id}`, { method: 'DELETE' });
      if (result.fromCache) {
        const artifacts = localGet<DBArtifact[]>('artifacts', []);
        const filtered = artifacts.filter(a => a.id !== id);
        localSet('artifacts', filtered);
      }
      return true;
    },

    async toggleStar(id: string): Promise<DBArtifact | null> {
      const result = await apiFetch<DBArtifact>(`/artifacts/${id}/star`, { method: 'PATCH' });
      if (result.fromCache) {
        const artifacts = localGet<DBArtifact[]>('artifacts', []);
        const idx = artifacts.findIndex(a => a.id === id);
        if (idx >= 0) {
          artifacts[idx].is_starred = !artifacts[idx].is_starred;
          localSet('artifacts', artifacts);
          return artifacts[idx];
        }
        return null;
      }
      return result.data;
    },
  },

  // === Health ===
  async health(): Promise<{ status: string; db: string; uptime: number } | null> {
    const result = await apiFetch<{ status: string; db: string; uptime: number }>('/health');
    return result.data;
  },
};

// --- 后端路由参考 (供你创建 Express 服务时使用) ---
//
// GET    /api/v1/health                          → 健康检查
// GET    /api/v1/sessions                        → 列出会话
// POST   /api/v1/sessions                        → 创建会话
// PATCH  /api/v1/sessions/:id/archive            → 归档会话
// GET    /api/v1/sessions/:id/messages            → 列出消息
// POST   /api/v1/sessions/:id/messages            → 创建消息
// POST   /api/v1/agents/:agentId/session          → 获取/创建智能体会话
// POST   /api/v1/agents/:agentId/session/reset    → 重置智能体会话
// GET    /api/v1/agents/:agentId/messages          → 列出智能体消息
// POST   /api/v1/agents/:agentId/messages          → 创建智能体消息
// POST   /api/v1/metrics                          → 写入指标
// GET    /api/v1/metrics?node_id=&metric_type=&limit= → 查询指标
// GET    /api/v1/logs?limit=&level=                → 列出日志
// POST   /api/v1/logs                              → 写入日志
// GET    /api/v1/preferences/:key                  → 读取配置
// PUT    /api/v1/preferences/:key                  → 写入配置
// GET    /api/v1/projects                        → 列出项目
// GET    /api/v1/projects/:id                    → 获取项目
// POST   /api/v1/projects                        → 创建项目
// PUT    /api/v1/projects/:id                    → 更新项目
// DELETE /api/v1/projects/:id                    → 删除项目
// GET    /api/v1/artifacts                       → 列出工件
// GET    /api/v1/artifacts/:id                   → 获取工件
// POST   /api/v1/artifacts                       → 创建工件
// PUT    /api/v1/artifacts/:id                   → 更新工件
// DELETE /api/v1/artifacts/:id                   → 删除工件
// PATCH  /api/v1/artifacts/:id/star              → 切换工件星标