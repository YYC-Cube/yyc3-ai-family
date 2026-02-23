// ============================================================
// YYC3 Hacker Chatbot — Full-chain Data Persistence Engine
// Phase 17.1: 全链路数据持久化引擎
//
// 统一抽象层:
//   - StorageAdapter 接口 (Strategy Pattern)
//   - LocalStorageAdapter (默认，离线优先)
//   - NasSQLiteAdapter  (NAS 在线时自动同步)
//   - 自动降级 + 恢复
//   - 全链路覆盖: Chat/Agent/Metrics/Workflow/MCP/Artifacts
//   - 版本化快照 + 数据导入导出
//
// 数据流:
//   App State → PersistenceEngine.save(domain, data)
//            → Active Adapter.write()
//            → [NAS 在线] 双写 NAS + localStorage
//            → [NAS 离线] localStorage only + 队列等待同步
// ============================================================

import { querySQLite, testSQLiteConnection, type NasSQLiteConfig, loadSQLiteConfig } from './nas-client';

// ============================================================
// 1. Types & Interfaces
// ============================================================

export type PersistDomain =
  | 'chat_sessions'
  | 'chat_messages'
  | 'agent_sessions'
  | 'agent_messages'
  | 'metrics_snapshots'
  | 'system_logs'
  | 'workflows'
  | 'templates'
  | 'artifacts'
  | 'mcp_registry'
  | 'mcp_call_log'
  | 'device_configs'
  | 'llm_configs'
  | 'llm_usage'
  | 'preferences'
  | 'knowledge_base'
  | 'agent_profiles';

export interface PersistRecord {
  id: string;
  domain: PersistDomain;
  data: unknown;
  version: number;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface PersistSnapshot {
  id: string;
  timestamp: string;
  domains: PersistDomain[];
  data: Record<PersistDomain, unknown[]>;
  metadata: {
    appVersion: string;
    totalRecords: number;
    sizeBytes: number;
  };
}

export interface StorageStats {
  adapter: string;
  totalRecords: number;
  totalSizeKB: number;
  domainCounts: Record<string, number>;
  lastSync: number;
  isOnline: boolean;
  pendingSyncs: number;
}

// ============================================================
// 2. Storage Adapter Interface
// ============================================================

export interface StorageAdapter {
  readonly name: string;
  readonly isOnline: boolean;

  // Core CRUD
  read(domain: PersistDomain): Promise<unknown[]>;
  write(domain: PersistDomain, data: unknown[]): Promise<void>;
  append(domain: PersistDomain, record: unknown): Promise<void>;
  remove(domain: PersistDomain, id: string): Promise<void>;
  clear(domain: PersistDomain): Promise<void>;

  // Metadata
  getStats(): Promise<StorageStats>;

  // Health
  ping(): Promise<boolean>;
}

// ============================================================
// 3. LocalStorage Adapter
// ============================================================

const LS_PREFIX = 'yyc3-persist-';

export class LocalStorageAdapter implements StorageAdapter {
  readonly name = 'localStorage';
  readonly isOnline = true;

  async read(domain: PersistDomain): Promise<unknown[]> {
    try {
      const raw = localStorage.getItem(`${LS_PREFIX}${domain}`);

      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  async write(domain: PersistDomain, data: unknown[]): Promise<void> {
    try {
      localStorage.setItem(`${LS_PREFIX}${domain}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`[Persistence] localStorage write failed for ${domain}:`, e);
    }
  }

  async append(domain: PersistDomain, record: unknown): Promise<void> {
    const existing = await this.read(domain);

    existing.push(record);
    // Keep reasonable limits
    const maxRecords = domain.includes('metrics') ? 500 : domain.includes('log') ? 1000 : 200;
    const trimmed = existing.slice(-maxRecords);

    await this.write(domain, trimmed);
  }

  async remove(domain: PersistDomain, id: string): Promise<void> {
    const existing = await this.read(domain);
    const filtered = existing.filter(r => {
      const rec = r as Record<string, unknown>;

      return rec.id !== id;
    });

    await this.write(domain, filtered);
  }

  async clear(domain: PersistDomain): Promise<void> {
    localStorage.removeItem(`${LS_PREFIX}${domain}`);
  }

  async getStats(): Promise<StorageStats> {
    const domains = Object.keys(localStorage)
      .filter(k => k.startsWith(LS_PREFIX))
      .map(k => k.replace(LS_PREFIX, ''));

    let totalSize = 0;
    let totalRecords = 0;
    const domainCounts: Record<string, number> = {};

    for (const domain of domains) {
      const raw = localStorage.getItem(`${LS_PREFIX}${domain}`) || '[]';

      totalSize += raw.length * 2; // approximate bytes (UTF-16)
      try {
        const arr = JSON.parse(raw);

        domainCounts[domain] = Array.isArray(arr) ? arr.length : 1;
        totalRecords += domainCounts[domain];
      } catch {
        domainCounts[domain] = 0;
      }
    }

    return {
      adapter: this.name,
      totalRecords,
      totalSizeKB: Math.round(totalSize / 1024 * 10) / 10,
      domainCounts,
      lastSync: Date.now(),
      isOnline: true,
      pendingSyncs: 0,
    };
  }

  async ping(): Promise<boolean> {
    try {
      localStorage.setItem('__ping__', '1');
      localStorage.removeItem('__ping__');

      return true;
    } catch { return false; }
  }
}

// ============================================================
// 4. NAS SQLite Adapter
// ============================================================

export class NasSQLiteAdapter implements StorageAdapter {
  readonly name = 'NAS SQLite';
  private _isOnline = false;
  private config: NasSQLiteConfig;

  constructor(config?: NasSQLiteConfig) {
    this.config = config || loadSQLiteConfig();
  }

  get isOnline() { return this._isOnline; }

  async read(domain: PersistDomain): Promise<unknown[]> {
    try {
      const result = await querySQLite(
        `SELECT data FROM yyc3_persist WHERE domain = ? ORDER BY updated_at DESC`,
        [domain],
        this.config,
      );

      return result.rows.map((row: unknown[]) => {
        const data = row[0] as string;

        try { return JSON.parse(data); } catch { return data; }
      });
    } catch {
      this._isOnline = false;

      return [];
    }
  }

  async write(domain: PersistDomain, data: unknown[]): Promise<void> {
    try {
      // Clear existing and bulk insert
      await querySQLite(`DELETE FROM yyc3_persist WHERE domain = ?`, [domain], this.config);
      for (const item of data) {
        const rec = item as Record<string, unknown>;
        const id = (typeof rec.id === 'string' ? rec.id : null) || crypto.randomUUID();
        const json = JSON.stringify(item);

        await querySQLite(
          `INSERT INTO yyc3_persist (id, domain, data, version, synced) VALUES (?, ?, ?, 1, 1)`,
          [id, domain, json],
          this.config,
        );
      }
    } catch {
      this._isOnline = false;
    }
  }

  async append(domain: PersistDomain, record: unknown): Promise<void> {
    try {
      const rec = record as Record<string, unknown>;
      const id = (typeof rec.id === 'string' ? rec.id : null) || crypto.randomUUID();
      const json = JSON.stringify(record);

      await querySQLite(
        `INSERT OR REPLACE INTO yyc3_persist (id, domain, data, version, synced) VALUES (?, ?, ?, 1, 1)`,
        [id, domain, json],
        this.config,
      );
    } catch {
      this._isOnline = false;
    }
  }

  async remove(domain: PersistDomain, id: string): Promise<void> {
    try {
      await querySQLite(
        `DELETE FROM yyc3_persist WHERE domain = ? AND id = ?`,
        [domain, id],
        this.config,
      );
    } catch {
      this._isOnline = false;
    }
  }

  async clear(domain: PersistDomain): Promise<void> {
    try {
      await querySQLite(`DELETE FROM yyc3_persist WHERE domain = ?`, [domain], this.config);
    } catch {
      this._isOnline = false;
    }
  }

  async getStats(): Promise<StorageStats> {
    try {
      const result = await querySQLite(
        `SELECT domain, COUNT(*) as cnt FROM yyc3_persist GROUP BY domain`,
        [],
        this.config,
      );
      const domainCounts: Record<string, number> = {};
      let totalRecords = 0;

      for (const row of result.rows) {
        domainCounts[row[0] as string] = row[1] as number;
        totalRecords += row[1] as number;
      }

      return {
        adapter: this.name,
        totalRecords,
        totalSizeKB: 0, // would need separate query
        domainCounts,
        lastSync: Date.now(),
        isOnline: this._isOnline,
        pendingSyncs: 0,
      };
    } catch {
      this._isOnline = false;

      return {
        adapter: this.name,
        totalRecords: 0,
        totalSizeKB: 0,
        domainCounts: {},
        lastSync: 0,
        isOnline: false,
        pendingSyncs: 0,
      };
    }
  }

  async ping(): Promise<boolean> {
    try {
      const result = await testSQLiteConnection(this.config);

      this._isOnline = result.success;

      return result.success;
    } catch {
      this._isOnline = false;

      return false;
    }
  }
}

// ============================================================
// 5. Persistence Engine (Orchestrator)
// ============================================================

export type SyncStrategy = 'local-only' | 'nas-primary' | 'dual-write' | 'auto';

// Maximum number of items allowed in the sync queue before oldest are evicted
const MAX_SYNC_QUEUE_SIZE = 1000;

// Exponential backoff configuration for NAS retry
const BACKOFF_BASE_MS = 1000; // 1 second initial delay
const BACKOFF_MAX_MS = 60000; // 60 seconds max delay
const BACKOFF_MULTIPLIER = 2; // double each attempt

export interface PersistenceEngineConfig {
  strategy: SyncStrategy;
  autoSaveInterval: number; // ms, 0 = disabled
  maxRetries: number;
  snapshotInterval: number; // ms, 0 = disabled
}

const ENGINE_CONFIG_KEY = 'yyc3-persistence-config';

const DEFAULT_ENGINE_CONFIG: PersistenceEngineConfig = {
  strategy: 'auto',
  autoSaveInterval: 30000, // 30 seconds
  maxRetries: 3,
  snapshotInterval: 3600000, // 1 hour
};

export function loadEngineConfig(): PersistenceEngineConfig {
  try {
    const raw = localStorage.getItem(ENGINE_CONFIG_KEY);

    if (raw) return { ...DEFAULT_ENGINE_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }

  return { ...DEFAULT_ENGINE_CONFIG };
}

export function saveEngineConfig(config: PersistenceEngineConfig): void {
  try {
    localStorage.setItem(ENGINE_CONFIG_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

class PersistenceEngine {
  private localStorage: LocalStorageAdapter;
  private nasAdapter: NasSQLiteAdapter;
  private config: PersistenceEngineConfig;
  private _nasAvailable = false;
  private _syncQueue: { domain: PersistDomain; action: string; data?: unknown }[] = [];
  private _lastSync = 0;
  private _listeners: ((event: PersistEvent) => void)[] = [];
  private _retryAttempt = 0; // Phase 50: exponential backoff counter
  private _retryTimer: ReturnType<typeof setTimeout> | null = null;
  private _queueOverflowCount = 0; // Phase 50: track how many items were evicted

  constructor() {
    this.localStorage = new LocalStorageAdapter();
    this.nasAdapter = new NasSQLiteAdapter();
    this.config = loadEngineConfig();
  }

  get nasAvailable() { return this._nasAvailable; }
  get syncQueue() { return this._syncQueue; }
  get lastSync() { return this._lastSync; }
  get strategy() { return this.config.strategy; }
  get retryAttempt() { return this._retryAttempt; }
  get queueOverflowCount() { return this._queueOverflowCount; }

  // --- Event System ---
  on(listener: (event: PersistEvent) => void) {
    this._listeners.push(listener);

    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  private emit(event: PersistEvent) {
    this._listeners.forEach(l => l(event));
  }

  // --- Core Operations ---

  async read(domain: PersistDomain): Promise<unknown[]> {
    // Always read from localStorage (fast, offline-first)
    return this.localStorage.read(domain);
  }

  async write(domain: PersistDomain, data: unknown[]): Promise<void> {
    // Always write to localStorage first
    await this.localStorage.write(domain, data);
    this.emit({ type: 'write', domain, recordCount: data.length });

    // Dual-write to NAS if available
    if (this.shouldSyncToNas()) {
      try {
        await this.nasAdapter.write(domain, data);
        this._lastSync = Date.now();
        this.emit({ type: 'sync', domain, target: 'nas', success: true });
      } catch {
        this.enqueue({ domain, action: 'write', data });
        this.emit({ type: 'sync', domain, target: 'nas', success: false });
      }
    }
  }

  async append(domain: PersistDomain, record: unknown): Promise<void> {
    await this.localStorage.append(domain, record);
    this.emit({ type: 'append', domain, recordCount: 1 });

    if (this.shouldSyncToNas()) {
      try {
        await this.nasAdapter.append(domain, record);
        this._lastSync = Date.now();
      } catch {
        this.enqueue({ domain, action: 'append', data: record });
      }
    }
  }

  async remove(domain: PersistDomain, id: string): Promise<void> {
    await this.localStorage.remove(domain, id);
    if (this.shouldSyncToNas()) {
      try { await this.nasAdapter.remove(domain, id); } catch { /* queue */ }
    }
  }

  async clear(domain: PersistDomain): Promise<void> {
    await this.localStorage.clear(domain);
    if (this.shouldSyncToNas()) {
      try { await this.nasAdapter.clear(domain); } catch { /* queue */ }
    }
    this.emit({ type: 'clear', domain });
  }

  // --- Health & Stats ---

  async checkNasHealth(): Promise<boolean> {
    this._nasAvailable = await this.nasAdapter.ping();

    return this._nasAvailable;
  }

  async getStats(): Promise<StorageStats> {
    return this.localStorage.getStats();
  }

  async getNasStats(): Promise<StorageStats | null> {
    if (!this._nasAvailable) return null;
    try { return await this.nasAdapter.getStats(); }
    catch { return null; }
  }

  // --- Queue Management (Phase 50) ---

  /**
   * Push an item to sync queue with size cap.
   * Evicts oldest items when MAX_SYNC_QUEUE_SIZE is exceeded.
   */
  private enqueue(item: { domain: PersistDomain; action: string; data?: unknown }) {
    this._syncQueue.push(item);
    if (this._syncQueue.length > MAX_SYNC_QUEUE_SIZE) {
      const evicted = this._syncQueue.length - MAX_SYNC_QUEUE_SIZE;

      this._syncQueue = this._syncQueue.slice(-MAX_SYNC_QUEUE_SIZE);
      this._queueOverflowCount += evicted;
      this.emit({ type: 'queue-overflow', evicted, currentSize: this._syncQueue.length });
      console.warn(`[Persistence] Sync queue overflow: evicted ${evicted} oldest items (total evicted: ${this._queueOverflowCount})`);
    }
    // Start backoff retry timer if not already running
    this.scheduleRetry();
  }

  /**
   * Schedule an exponential backoff retry for flushing the queue.
   * Doubles delay each failed attempt: 1s → 2s → 4s → 8s → ... → 60s max.
   */
  private scheduleRetry() {
    if (this._retryTimer) return; // already scheduled
    if (this._syncQueue.length === 0) return;

    const delay = Math.min(
      BACKOFF_BASE_MS * Math.pow(BACKOFF_MULTIPLIER, this._retryAttempt),
      BACKOFF_MAX_MS,
    );

    this._retryTimer = setTimeout(async () => {
      this._retryTimer = null;
      // Re-check NAS availability before flush
      const online = await this.checkNasHealth();

      if (online && this._syncQueue.length > 0) {
        const result = await this.flushSyncQueue();

        if (result.failed > 0) {
          // Increase backoff for next attempt
          this._retryAttempt = Math.min(this._retryAttempt + 1, 10);
          this.scheduleRetry();
        } else {
          // Success — reset backoff
          this._retryAttempt = 0;
        }
      } else if (this._syncQueue.length > 0) {
        // NAS still offline — increase backoff
        this._retryAttempt = Math.min(this._retryAttempt + 1, 10);
        this.scheduleRetry();
      }
    }, delay);
  }

  /**
   * Get comprehensive sync status for UI indicators.
   */
  getSyncStatus(): {
    nasOnline: boolean;
    pendingCount: number;
    lastSyncTime: number;
    retryAttempt: number;
    nextRetryMs: number;
    overflowCount: number;
    strategy: SyncStrategy;
    } {
    const nextRetryMs = this._retryTimer
      ? Math.min(BACKOFF_BASE_MS * Math.pow(BACKOFF_MULTIPLIER, this._retryAttempt), BACKOFF_MAX_MS)
      : 0;

    return {
      nasOnline: this._nasAvailable,
      pendingCount: this._syncQueue.length,
      lastSyncTime: this._lastSync,
      retryAttempt: this._retryAttempt,
      nextRetryMs,
      overflowCount: this._queueOverflowCount,
      strategy: this.config.strategy,
    };
  }

  // --- Sync Queue ---

  async flushSyncQueue(): Promise<{ success: number; failed: number }> {
    if (!this._nasAvailable || this._syncQueue.length === 0) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    const remaining: typeof this._syncQueue = [];

    for (const item of this._syncQueue) {
      try {
        if (item.action === 'write' && item.data) {
          await this.nasAdapter.write(item.domain, item.data as unknown[]);
        } else if (item.action === 'append' && item.data) {
          await this.nasAdapter.append(item.domain, item.data);
        }
        success++;
      } catch {
        failed++;
        remaining.push(item);
      }
    }

    this._syncQueue = remaining;
    if (success > 0) this._lastSync = Date.now();
    this.emit({ type: 'queue-flush', success, failed });

    return { success, failed };
  }

  // --- Snapshots ---

  async createSnapshot(domains?: PersistDomain[]): Promise<PersistSnapshot> {
    const allDomains: PersistDomain[] = domains || [
      'chat_sessions', 'chat_messages', 'agent_sessions', 'agent_messages',
      'workflows', 'templates', 'artifacts', 'mcp_registry',
      'device_configs', 'llm_configs', 'llm_usage', 'preferences',
    ];

    const data: Record<string, unknown[]> = {};
    let totalRecords = 0;
    let totalSize = 0;

    for (const domain of allDomains) {
      const records = await this.read(domain);

      data[domain] = records;
      totalRecords += records.length;
      totalSize += JSON.stringify(records).length;
    }

    const snapshot: PersistSnapshot = {
      id: `snap-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      domains: allDomains,
      data: data as Record<PersistDomain, unknown[]>,
      metadata: {
        appVersion: '16.2',
        totalRecords,
        sizeBytes: totalSize,
      },
    };

    // Store snapshot in localStorage
    const snapshots = this.getSnapshots();

    snapshots.unshift(snapshot);
    // Keep last 10 snapshots
    try {
      localStorage.setItem('yyc3-snapshots', JSON.stringify(snapshots.slice(0, 10)));
    } catch { /* ignore */ }

    this.emit({ type: 'snapshot-created', snapshotId: snapshot.id });

    return snapshot;
  }

  getSnapshots(): PersistSnapshot[] {
    try {
      return JSON.parse(localStorage.getItem('yyc3-snapshots') || '[]');
    } catch { return []; }
  }

  async restoreSnapshot(snapshot: PersistSnapshot): Promise<void> {
    for (const domain of snapshot.domains) {
      const records = snapshot.data[domain];

      if (records) {
        await this.write(domain, records);
      }
    }
    this.emit({ type: 'snapshot-restored', snapshotId: snapshot.id });
  }

  // --- Export / Import ---

  exportToJSON(): string {
    const allKeys = Object.keys(localStorage)
      .filter(k => k.startsWith('yyc3'));

    const exportData: Record<string, unknown> = {};

    for (const key of allKeys) {
      try {
        exportData[key] = JSON.parse(localStorage.getItem(key) || '""');
      } catch {
        exportData[key] = localStorage.getItem(key);
      }
    }

    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: '17.1',
      platform: 'YYC3 Hacker Chatbot',
      data: exportData,
    }, null, 2);
  }

  importFromJSON(jsonStr: string): { imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    try {
      const parsed = JSON.parse(jsonStr);
      const data = parsed.data || parsed;

      for (const [key, value] of Object.entries(data)) {
        if (!key.startsWith('yyc3')) {
          errors.push(`Skipped non-YYC3 key: ${key}`);
          continue;
        }
        try {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          imported++;
        } catch (e) {
          errors.push(`Failed to import ${key}: ${e}`);
        }
      }
    } catch (e) {
      errors.push(`JSON parse error: ${e}`);
    }

    return { imported, errors };
  }

  // --- Configuration ---

  updateConfig(config: Partial<PersistenceEngineConfig>): void {
    this.config = { ...this.config, ...config };
    saveEngineConfig(this.config);
    this.emit({ type: 'config-updated' });
  }

  getConfig(): PersistenceEngineConfig {
    return { ...this.config };
  }

  // --- Private ---

  private shouldSyncToNas(): boolean {
    if (!this._nasAvailable) return false;
    switch (this.config.strategy) {
      case 'local-only': return false;
      case 'nas-primary': return true;
      case 'dual-write': return true;
      case 'auto': return this._nasAvailable;
      default: return false;
    }
  }
}

// ============================================================
// 6. Event Types
// ============================================================

export type PersistEvent =
  | { type: 'write'; domain: PersistDomain; recordCount: number }
  | { type: 'append'; domain: PersistDomain; recordCount: number }
  | { type: 'clear'; domain: PersistDomain }
  | { type: 'sync'; domain: PersistDomain; target: string; success: boolean }
  | { type: 'queue-flush'; success: number; failed: number }
  | { type: 'snapshot-created'; snapshotId: string }
  | { type: 'snapshot-restored'; snapshotId: string }
  | { type: 'config-updated' }
  | { type: 'error'; message: string }
  | { type: 'queue-overflow'; evicted: number; currentSize: number };

// ============================================================
// 7. Singleton Instance
// ============================================================

let _instance: PersistenceEngine | null = null;

export function getPersistenceEngine(): PersistenceEngine {
  if (!_instance) {
    _instance = new PersistenceEngine();
  }

  return _instance;
}

// ============================================================
// 8. React Hook Helper
// ============================================================

export function getDomainStorageKey(domain: PersistDomain): string {
  return `${LS_PREFIX}${domain}`;
}

// ============================================================
// 9. Domain-specific Utility Functions
// ============================================================

export async function persistChatSession(session: {
  id: string;
  title: string;
  messages: unknown[];
  createdAt: string;
}): Promise<void> {
  const engine = getPersistenceEngine();
  const sessions = (await engine.read('chat_sessions')) as Record<string, unknown>[];
  const idx = sessions.findIndex(s => s.id === session.id);

  if (idx >= 0) {
    sessions[idx] = { ...sessions[idx], ...session, updatedAt: new Date().toISOString() };
  } else {
    sessions.push({ ...session, updatedAt: new Date().toISOString() });
  }
  await engine.write('chat_sessions', sessions);
}

export async function persistAgentHistory(agentId: string, messages: unknown[]): Promise<void> {
  const engine = getPersistenceEngine();
  const histories = (await engine.read('agent_messages')) as Record<string, unknown>[];
  const existing = histories.find(h => h.agentId === agentId);

  if (existing) {
    existing.messages = messages;
    existing.updatedAt = new Date().toISOString();
  } else {
    histories.push({ id: agentId, agentId, messages, updatedAt: new Date().toISOString() });
  }
  await engine.write('agent_messages', histories);
}

export async function persistMetricsSnapshot(snapshot: unknown): Promise<void> {
  const engine = getPersistenceEngine();

  await engine.append('metrics_snapshots', {
    id: `m-${Date.now()}`,
    ...snapshot as object,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================
// 10. Knowledge Base Persistence (Phase 20)
// ============================================================

/**
 * Read all knowledge entries from persistence engine.
 * Falls back to empty array if no data found.
 */
export async function readKnowledgeEntries(): Promise<unknown[]> {
  const engine = getPersistenceEngine();

  return engine.read('knowledge_base');
}

/**
 * Write the full knowledge base (overwrite).
 * Dual-writes to localStorage + NAS SQLite when available.
 */
export async function writeKnowledgeEntries(entries: unknown[]): Promise<void> {
  const engine = getPersistenceEngine();

  await engine.write('knowledge_base', entries);
}

/**
 * Upsert a single knowledge entry (append or replace by id).
 */
export async function upsertKnowledgeEntry(entry: unknown): Promise<void> {
  const engine = getPersistenceEngine();
  const entries = (await engine.read('knowledge_base')) as Record<string, unknown>[];
  const rec = entry as Record<string, unknown>;
  const id = rec.id;
  const idx = entries.findIndex(e => e.id === id);

  if (idx >= 0) {
    entries[idx] = entry as Record<string, unknown>;
  } else {
    entries.unshift(entry as Record<string, unknown>);
  }
  await engine.write('knowledge_base', entries);
}

/**
 * Delete a single knowledge entry by id.
 */
export async function deleteKnowledgeEntry(id: string): Promise<void> {
  const engine = getPersistenceEngine();

  await engine.remove('knowledge_base', id);
}

// ============================================================
// 11. Agent Profiles Persistence (Phase 20)
// ============================================================

/**
 * Read agent profiles from persistence engine.
 */
export async function readAgentProfiles(): Promise<unknown[]> {
  const engine = getPersistenceEngine();

  return engine.read('agent_profiles');
}

/**
 * Write all agent profiles (overwrite).
 */
export async function writeAgentProfiles(profiles: unknown[]): Promise<void> {
  const engine = getPersistenceEngine();

  await engine.write('agent_profiles', profiles);
}

// ============================================================
// 12. NAS SQLite Table Definitions (Reference for deployment)
// ============================================================

/**
 * SQL statements to create the `knowledge_base` and `agent_profiles`
 * tables on the NAS SQLite HTTP Proxy (192.168.3.45:8484).
 *
 * These use the existing `yyc3_persist` generic table by default.
 * Optionally, dedicated tables can be created for richer indexing:
 *
 * CREATE TABLE IF NOT EXISTS knowledge_base (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   content TEXT,
 *   summary TEXT,
 *   category TEXT NOT NULL DEFAULT 'general',
 *   tags TEXT,           -- JSON array serialized
 *   linked_agents TEXT,  -- JSON array serialized
 *   source TEXT,
 *   importance TEXT DEFAULT 'medium',
 *   access_count INTEGER DEFAULT 0,
 *   created_at TEXT DEFAULT (datetime('now')),
 *   updated_at TEXT DEFAULT (datetime('now'))
 * );
 *
 * CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category);
 * CREATE INDEX IF NOT EXISTS idx_kb_importance ON knowledge_base(importance);
 *
 * CREATE TABLE IF NOT EXISTS agent_profiles (
 *   agent_id TEXT PRIMARY KEY,
 *   data TEXT NOT NULL,    -- Full JSON profile
 *   presence TEXT DEFAULT 'offline',
 *   heartbeat_count INTEGER DEFAULT 0,
 *   last_seen TEXT DEFAULT (datetime('now')),
 *   updated_at TEXT DEFAULT (datetime('now'))
 * );
 */
export const NAS_TABLE_DEFINITIONS = {
  knowledge_base: `
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      summary TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      tags TEXT,
      linked_agents TEXT,
      source TEXT,
      importance TEXT DEFAULT 'medium',
      access_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `,
  agent_profiles: `
    CREATE TABLE IF NOT EXISTS agent_profiles (
      agent_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      presence TEXT DEFAULT 'offline',
      heartbeat_count INTEGER DEFAULT 0,
      last_seen TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `,
};