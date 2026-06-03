// ============================================================
// YYC3 AI Family — Pure Frontend Persistence Service
// 前端一体化 · 零后端依赖
//
// 所有数据通过 IndexedDB/localStorage 持久化，
// 使用下层 persistence-engine + storage-orchestrator
// ============================================================

import { getPersistenceEngine } from '@/lib/persistence-engine';

// ============================================================
// Types (保持与原有 api.ts 兼容)
// ============================================================

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

export type ConnectionStatus = 'connected';

// ============================================================
// 纯前端 Storage Adapter
// ============================================================

const engine = () => getPersistenceEngine();

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`yyc3_${key}`);

    return raw ? JSON.parse(raw) as T : fallback;
  } catch { return fallback; }
}

function lsSet(key: string, value: unknown): void {
  try { localStorage.setItem(`yyc3_${key}`, JSON.stringify(value)); } catch { /* quota */ }
}

function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================
// Public API (纯前端，零网络请求)
// ============================================================

export function getConnectionStatus(): ConnectionStatus {
  return 'connected';
}

export const api = {
  // === Sessions ===
  sessions: {
    async list(): Promise<DBSession[]> {
      return lsGet<DBSession[]>('sessions', []);
    },

    async create(title: string): Promise<DBSession> {
      const session: DBSession = {
        id: uid(),
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false,
        metadata: {},
      };
      const sessions = lsGet<DBSession[]>('sessions', []);

      sessions.unshift(session);
      lsSet('sessions', sessions);

      return session;
    },

    async archive(id: string): Promise<void> {
      const sessions = lsGet<DBSession[]>('sessions', []);
      const idx = sessions.findIndex(s => s.id === id);

      if (idx >= 0) { sessions[idx].is_archived = true; lsSet('sessions', sessions); }
    },
  },

  // === Messages ===
  messages: {
    async list(sessionId: string): Promise<DBMessage[]> {
      return lsGet<DBMessage[]>(`messages_${sessionId}`, []);
    },

    async create(sessionId: string, msg: Omit<DBMessage, 'id' | 'session_id' | 'tokens_used'>): Promise<DBMessage> {
      const newMsg: DBMessage = { ...msg, id: uid(), session_id: sessionId, tokens_used: 0 };
      const messages = lsGet<DBMessage[]>(`messages_${sessionId}`, []);

      messages.push(newMsg);
      lsSet(`messages_${sessionId}`, messages);

      return newMsg;
    },
  },

  // === Agent Sessions ===
  agentSessions: {
    async getOrCreate(agentId: string, agentName: string): Promise<DBAgentSession> {
      const key = `agent_session_${agentId}`;
      let session = lsGet<DBAgentSession | null>(key, null);

      if (!session) {
        session = {
          id: uid(), agent_id: agentId, agent_name: agentName,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          turn_count: 0, total_tokens: 0, is_active: true,
        };
        lsSet(key, session);
      }

      return session;
    },

    async reset(agentId: string): Promise<void> {
      lsSet(`agent_messages_${agentId}`, []);
      lsSet(`agent_session_${agentId}`, null);
    },
  },

  // === Agent Messages ===
  agentMessages: {
    async list(agentId: string): Promise<DBAgentMessage[]> {
      return lsGet<DBAgentMessage[]>(`agent_messages_${agentId}`, []);
    },

    async create(agentId: string, msg: Omit<DBAgentMessage, 'id' | 'session_id' | 'thinking_time'>): Promise<DBAgentMessage> {
      const newMsg: DBAgentMessage = { ...msg, id: uid(), session_id: '', thinking_time: 0 };
      const messages = lsGet<DBAgentMessage[]>(`agent_messages_${agentId}`, []);

      messages.push(newMsg);
      lsSet(`agent_messages_${agentId}`, messages);

      return newMsg;
    },
  },

  // === Metrics (前端 IndexedDB 持久化) ===
  metrics: {
    async record(points: { node_id: string; metric_type: string; value: number; unit: string }[]): Promise<void> {
      const existing = lsGet<any[]>('metrics', []);

      existing.push(...points.map(p => ({ ...p, id: Date.now(), recorded_at: new Date().toISOString() })));
      lsSet('metrics', existing.slice(-1000));
    },

    async query(nodeId?: string): Promise<any[]> {
      const all = lsGet<any[]>('metrics', []);

      return nodeId ? all.filter(m => m.node_id === nodeId) : all;
    },
  },

  // === Projects ===
  projects: {
    async list(): Promise<any[]> {
      return lsGet<any[]>('projects', []);
    },

    async create(data: any): Promise<any> {
      const project = { ...data, id: uid(), created_at: new Date().toISOString() };
      const projects = lsGet<any[]>('projects', []);

      projects.push(project);
      lsSet('projects', projects);

      return project;
    },

    async update(id: string, data: any): Promise<void> {
      const projects = lsGet<any[]>('projects', []);
      const idx = projects.findIndex((p: any) => p.id === id);

      if (idx >= 0) { projects[idx] = { ...projects[idx], ...data }; lsSet('projects', projects); }
    },

    async remove(id: string): Promise<void> {
      const projects = lsGet<any[]>('projects', []).filter((p: any) => p.id !== id);

      lsSet('projects', projects);
    },
  },

  // === Artifacts ===
  artifacts: {
    async list(): Promise<any[]> {
      return lsGet<any[]>('artifacts', []);
    },

    async create(data: any): Promise<any> {
      const artifact = { ...data, id: uid(), created_at: new Date().toISOString() };
      const artifacts = lsGet<any[]>('artifacts', []);

      artifacts.push(artifact);
      lsSet('artifacts', artifacts);

      return artifact;
    },

    async update(id: string, data: any): Promise<void> {
      const artifacts = lsGet<any[]>('artifacts', []);
      const idx = artifacts.findIndex((a: any) => a.id === id);

      if (idx >= 0) { artifacts[idx] = { ...artifacts[idx], ...data }; lsSet('artifacts', artifacts); }
    },

    async remove(id: string): Promise<void> {
      lsSet('artifacts', lsGet<any[]>('artifacts', []).filter((a: any) => a.id !== id));
    },

    async toggleStar(id: string): Promise<void> {
      const artifacts = lsGet<any[]>('artifacts', []);
      const idx = artifacts.findIndex((a: any) => a.id === id);

      if (idx >= 0) { artifacts[idx].is_starred = !artifacts[idx].is_starred; lsSet('artifacts', artifacts); }
    },
  },

  // === Nodes (Cluster Devices) ===
  nodes: {
    async list(): Promise<any[]> {
      return lsGet<any[]>('nodes', []);
    },

    async update(id: string, data: any): Promise<void> {
      const nodes = lsGet<any[]>('nodes', []);
      const idx = nodes.findIndex((n: any) => n.id === id);

      if (idx >= 0) { nodes[idx] = { ...nodes[idx], ...data }; lsSet('nodes', nodes); }
    },
  },
};
