/**
 * @file YYC³ Family-π³ Redis Client
 * @description Redis集成层客户端 - L01基础设施层
 * @author YYC³ Team
 * @version 1.0.0
 *
 * 架构定位: Redis 在九层架构中位于 L01 基础设施层
 *
 * 职责边界:
 * - Session 缓存: 存储用户会话状态
 * - Agent 对话上下文缓存: 减少重复推理调用
 * - 推理结果缓存: 缓存高频查询结果
 * - PubSub 事件总线: Agent 间通信
 *
 * 数据流:
 *   App State → RedisClient.set(key, data)
 *            → [NAS 在线] 写入 Redis
 *            → [NAS 离线] localStorage fallback
 */

import { eventBus } from './event-bus';

// ============================================================
// Configuration
// ============================================================

const REDIS_BASE_URL = 'http://192.168.3.45:6379';
const REDIS_TIMEOUT = 5000;

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  enabled: boolean;
  lastConnected?: number;
  lastError?: string;
}

let _config: RedisConfig = {
  host: '192.168.3.45',
  port: 6379,
  enabled: false,
};

const REDIS_CONFIG_KEY = 'yyc3-redis-config';

try {
  const raw = localStorage.getItem(REDIS_CONFIG_KEY);

  if (raw) {
    const saved = JSON.parse(raw);

    _config = { ..._config, ...saved };
  }
} catch { /* ignore */ }

export function getRedisConfig(): RedisConfig {
  return { ..._config };
}

export function setRedisConfig(updates: Partial<RedisConfig>): void {
  _config = { ..._config, ...updates };
  try {
    localStorage.setItem(REDIS_CONFIG_KEY, JSON.stringify(_config));
  } catch { /* ignore */ }
  _notifyListeners();
}

// ============================================================
// Connection Status
// ============================================================

export type RedisStatus = 'unknown' | 'checking' | 'connected' | 'disconnected' | 'error';

interface RedisState {
  status: RedisStatus;
  latencyMs?: number;
  lastChecked?: number;
  version?: string;
  keyCount?: number;
  usedMemory?: string;
  error?: string;
}

let _redisState: RedisState = { status: 'unknown' };
const _redisListeners = new Set<() => void>();

function _notifyListeners() {
  _redisListeners.forEach(fn => fn());
}

export function getRedisState(): RedisState {
  return _redisState;
}

export function onRedisChange(fn: () => void): () => void {
  _redisListeners.add(fn);

  return () => { _redisListeners.delete(fn); };
}

// ============================================================
// HTTP Helper (Redis over HTTP proxy)
// ============================================================

async function redisFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<{ ok: boolean; data?: T; error?: string; latencyMs: number }> {
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDIS_TIMEOUT);
    const res = await fetch(`http://${_config.host}:${_config.port}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    clearTimeout(timeout);
    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json() as T;

      return { ok: true, data, latencyMs };
    }
    const errText = await res.text().catch(() => res.statusText);

    return { ok: false, error: `HTTP ${res.status}: ${errText}`, latencyMs };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : 'Unknown error';

    return { ok: false, error: msg, latencyMs };
  }
}

// ============================================================
// Health Check
// ============================================================

export async function checkRedisHealth(): Promise<RedisState> {
  _redisState = { ..._redisState, status: 'checking' };
  _notifyListeners();

  const result = await redisFetch<{
    redis_version?: string;
    connected_clients?: number;
    used_memory_human?: string;
    db0?: string;
    keys?: number;
  }>('/api/info');

  if (result.ok && result.data) {
    const state: RedisState = {
      status: 'connected',
      latencyMs: result.latencyMs,
      lastChecked: Date.now(),
      version: result.data.redis_version,
      usedMemory: result.data.used_memory_human,
      keyCount: result.data.keys || 0,
    };

    _redisState = state;
    setRedisConfig({ lastConnected: Date.now(), lastError: undefined });
    eventBus.emit({
      category: 'persist',
      type: 'persist.redis_connected',
      level: 'success',
      source: 'REDIS',
      message: `Redis connected (${result.latencyMs}ms)`,
      metadata: { latencyMs: result.latencyMs, version: result.data.redis_version },
    });
  } else {
    const state: RedisState = {
      status: result.error?.includes('abort') || result.error?.includes('Failed to fetch') ? 'disconnected' : 'error',
      latencyMs: result.latencyMs,
      lastChecked: Date.now(),
      error: result.error,
    };

    _redisState = state;
    setRedisConfig({ lastError: result.error });
    eventBus.emit({
      category: 'persist',
      type: 'persist.redis_failed',
      level: 'warn',
      source: 'REDIS',
      message: `Redis unreachable: ${result.error}`,
    });
  }

  _notifyListeners();

  return _redisState;
}

// ============================================================
// Cache Key Prefixes
// ============================================================

export const REDIS_KEYS = {
  SESSION: 'yyc3:session:',
  AGENT_CONTEXT: 'yyc3:agent:ctx:',
  AGENT_HISTORY: 'yyc3:agent:history:',
  INFERENCE_CACHE: 'yyc3:inference:',
  LLM_RESPONSE: 'yyc3:llm:response:',
  METRICS: 'yyc3:metrics:',
  DEVICE_STATUS: 'yyc3:device:',
  WORKFLOW_STATE: 'yyc3:workflow:',
} as const;

// ============================================================
// Session Cache
// ============================================================

export interface SessionData {
  id: string;
  userId: string;
  createdAt: number;
  lastActive: number;
  preferences: Record<string, unknown>;
}

export async function setSession(sessionId: string, data: SessionData): Promise<boolean> {
  const key = `${REDIS_KEYS.SESSION}${sessionId}`;
  const localKey = `yyc3_session_${sessionId}`;

  try {
    if (_config.enabled) {
      const result = await redisFetch('/api/set', {
        method: 'POST',
        body: JSON.stringify({ key, value: JSON.stringify(data), ex: 86400 }),
      });

      if (result.ok) {
        localStorage.setItem(localKey, JSON.stringify(data));

        return true;
      }
    }
    localStorage.setItem(localKey, JSON.stringify(data));

    return true;
  } catch {
    localStorage.setItem(localKey, JSON.stringify(data));

    return false;
  }
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  const key = `${REDIS_KEYS.SESSION}${sessionId}`;
  const localKey = `yyc3_session_${sessionId}`;

  try {
    if (_config.enabled) {
      const result = await redisFetch<{ value: string }>('/api/get', {
        method: 'POST',
        body: JSON.stringify({ key }),
      });

      if (result.ok && result.data?.value) {
        return JSON.parse(result.data.value) as SessionData;
      }
    }
  } catch { /* fallback to localStorage */ }

  const local = localStorage.getItem(localKey);

  return local ? JSON.parse(local) : null;
}

// ============================================================
// Agent Context Cache
// ============================================================

export interface AgentContext {
  agentId: string;
  conversationId: string;
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }[];
  metadata: {
    model: string;
    provider: string;
    totalTokens: number;
  };
}

export async function setAgentContext(ctx: AgentContext): Promise<boolean> {
  const key = `${REDIS_KEYS.AGENT_CONTEXT}${ctx.agentId}:${ctx.conversationId}`;
  const localKey = `yyc3_agent_ctx_${ctx.agentId}_${ctx.conversationId}`;

  try {
    if (_config.enabled) {
      const result = await redisFetch('/api/set', {
        method: 'POST',
        body: JSON.stringify({ key, value: JSON.stringify(ctx), ex: 3600 }),
      });

      if (result.ok) {
        localStorage.setItem(localKey, JSON.stringify(ctx));

        return true;
      }
    }
    localStorage.setItem(localKey, JSON.stringify(ctx));

    return true;
  } catch {
    localStorage.setItem(localKey, JSON.stringify(ctx));

    return false;
  }
}

export async function getAgentContext(
  agentId: string,
  conversationId: string,
): Promise<AgentContext | null> {
  const key = `${REDIS_KEYS.AGENT_CONTEXT}${agentId}:${conversationId}`;
  const localKey = `yyc3_agent_ctx_${agentId}_${conversationId}`;

  try {
    if (_config.enabled) {
      const result = await redisFetch<{ value: string }>('/api/get', {
        method: 'POST',
        body: JSON.stringify({ key }),
      });

      if (result.ok && result.data?.value) {
        return JSON.parse(result.data.value) as AgentContext;
      }
    }
  } catch { /* fallback */ }

  const local = localStorage.getItem(localKey);

  return local ? JSON.parse(local) : null;
}

// ============================================================
// Inference Result Cache
// ============================================================

export interface InferenceCacheEntry {
  hash: string;
  prompt: string;
  response: string;
  model: string;
  provider: string;
  latencyMs: number;
  timestamp: number;
  tokens: number;
}

export function hashPrompt(prompt: string): string {
  let hash = 0;

  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);

    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(16);
}

export async function cacheInferenceResult(entry: InferenceCacheEntry): Promise<boolean> {
  const key = `${REDIS_KEYS.INFERENCE_CACHE}${entry.hash}`;
  const localKey = `yyc3_inference_${entry.hash}`;

  try {
    if (_config.enabled) {
      const result = await redisFetch('/api/set', {
        method: 'POST',
        body: JSON.stringify({ key, value: JSON.stringify(entry), ex: 86400 * 7 }),
      });

      if (result.ok) {
        localStorage.setItem(localKey, JSON.stringify(entry));

        return true;
      }
    }
    localStorage.setItem(localKey, JSON.stringify(entry));

    return true;
  } catch {
    localStorage.setItem(localKey, JSON.stringify(entry));

    return false;
  }
}

export async function getCachedInference(prompt: string): Promise<InferenceCacheEntry | null> {
  const hash = hashPrompt(prompt);
  const key = `${REDIS_KEYS.INFERENCE_CACHE}${hash}`;
  const localKey = `yyc3_inference_${hash}`;

  try {
    if (_config.enabled) {
      const result = await redisFetch<{ value: string }>('/api/get', {
        method: 'POST',
        body: JSON.stringify({ key }),
      });

      if (result.ok && result.data?.value) {
        return JSON.parse(result.data.value) as InferenceCacheEntry;
      }
    }
  } catch { /* fallback */ }

  const local = localStorage.getItem(localKey);

  return local ? JSON.parse(local) : null;
}

// ============================================================
// Metrics Cache
// ============================================================

export interface MetricSnapshot {
  timestamp: number;
  cpu: number;
  memory: number;
  disk: number;
  network: { in: number; out: number };
  latency: number;
}

export async function cacheMetrics(deviceId: string, metrics: MetricSnapshot): Promise<boolean> {
  const key = `${REDIS_KEYS.METRICS}${deviceId}`;
  const localKey = `yyc3_metrics_${deviceId}`;

  try {
    if (_config.enabled) {
      const result = await redisFetch('/api/lpush', {
        method: 'POST',
        body: JSON.stringify({ key, value: JSON.stringify(metrics) }),
      });

      if (result.ok) {
        return true;
      }
    }
    const existing = localStorage.getItem(localKey);
    const list = existing ? JSON.parse(existing) : [];

    list.unshift(metrics);
    if (list.length > 1000) list.pop();
    localStorage.setItem(localKey, JSON.stringify(list));

    return true;
  } catch {
    return false;
  }
}

// ============================================================
// Mock Data (Fallback)
// ============================================================

export const MOCK_REDIS_INFO = {
  redis_version: '7.4.2',
  redis_mode: 'standalone',
  os: 'Linux 6.12.41+ x86_64',
  arch_bits: '64',
  tcp_port: 6379,
  connected_clients: 1,
  used_memory_human: '1.13M',
  total_system_memory_human: '31.20G',
  keyspace_hits: 0,
  keyspace_misses: 0,
  keys: 6,
  uptime_in_seconds: 18,
};

export const MOCK_REDIS_KEYS = [
  { key: 'eth0-network', type: 'hash', ttl: -1 },
  { key: 'eth1-network', type: 'hash', ttl: -1 },
  { key: 'all-network', type: 'hash', ttl: -1 },
  { key: 'diskio', type: 'hash', ttl: -1 },
  { key: 'load_average', type: 'hash', ttl: -1 },
  { key: 'cpuio', type: 'hash', ttl: -1 },
];

// ============================================================
// Export
// ============================================================

export const redis = {
  info: checkRedisHealth,
  session: {
    set: setSession,
    get: getSession,
  },
  agent: {
    setContext: setAgentContext,
    getContext: getAgentContext,
  },
  inference: {
    cache: cacheInferenceResult,
    get: getCachedInference,
    hash: hashPrompt,
  },
  metrics: {
    cache: cacheMetrics,
  },
};
