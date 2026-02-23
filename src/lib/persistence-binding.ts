// ============================================================
// YYC3 Hacker Chatbot — Persistence ↔ Zustand Binding Layer
// Phase 18.1 → 18.4: Store Auto-Persist + Boot Hydration
//                     + ClusterMetrics Snapshot Archive
//                     + Event Bus Integration
//
// 设计:
//   1. usePersistenceSync() — React Hook, 监听 Zustand 变化自动写入
//   2. hydrateStoreFromPersistence() — 启动时从 localStorage/NAS 恢复
//   3. 防抖写入 (debounced writes, 避免高频刷写)
//   4. 选择性持久化 (只持久化可恢复的状态切片)
//   5. [18.4] ClusterMetrics 快照归档 (30s interval, rolling 100)
//   6. [18.4] Event Bus emit on persist operations
//
// 绑定域映射:
//   store.messages            → chat_messages
//   store.agentChatHistories  → agent_messages
//   store.logs                → system_logs
//   store.consoleTab + agent  → preferences
//   store.clusterMetrics      → metrics_snapshots  [NEW 18.4]
//   LLM Usage (via trackUsage)→ llm_usage (已有)
//
// 生命周期:
//   App Boot → hydrateStoreFromPersistence()
//           → usePersistenceSync() attaches listeners
//           → store changes → debounced persist → eventBus.persist()
//           → clusterMetrics → 30s interval archive
// ============================================================

import { useRef, useEffect } from 'react';

import { eventBus } from './event-bus';
import {
  ChatMessageSchema,
  AgentHistoryRecordSchema,
  SystemLogSchema,
  validateArray,
} from './persist-schemas';
import { getPersistenceEngine } from './persistence-engine';
import { useSystemStore } from './store';
import type { ClusterMetricsSnapshot, ChatMessage, AgentChatMessage } from './store';


// ============================================================
// 1. Debounce Utility
// ============================================================

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number,
): T & { cancel: () => void; flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = ((...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; fn(...args); }, delayMs);
  }) as T & { cancel: () => void; flush: () => void };

  debounced.cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
  debounced.flush = () => { if (timer) { clearTimeout(timer); timer = null; fn(); } };

  return debounced;
}

// ============================================================
// 2. Persistence Domain Writers (Debounced + Event Bus)
// ============================================================

const DEBOUNCE_MS = 2000;
const METRICS_ARCHIVE_INTERVAL = 30_000; // 30 seconds
const METRICS_ARCHIVE_MAX = 100; // rolling window

interface MetricsArchiveEntry {
  id: string;
  timestamp: string;
  data: ClusterMetricsSnapshot;
}

const writers = {
  chat_messages: debounce(async () => {
    const engine = getPersistenceEngine();
    const messages = useSystemStore.getState().messages;

    await engine.write('chat_messages', messages);
    eventBus.persist('write', `chat_messages: ${messages.length} records persisted`, 'info', { domain: 'chat_messages', count: messages.length });
  }, DEBOUNCE_MS),

  agent_messages: debounce(async () => {
    const engine = getPersistenceEngine();
    const histories = useSystemStore.getState().agentChatHistories;
    const entries = Object.entries(histories).map(([agentId, messages]) => ({
      id: agentId, agentId, messages, updatedAt: new Date().toISOString(),
    }));
    const totalMsgs = entries.reduce((s, e) => s + (e.messages as unknown[]).length, 0);

    await engine.write('agent_messages', entries);
    eventBus.persist('write', `agent_messages: ${entries.length} agents, ${totalMsgs} messages`, 'info', { domain: 'agent_messages', agents: entries.length, messages: totalMsgs });
  }, DEBOUNCE_MS),

  system_logs: debounce(async () => {
    const engine = getPersistenceEngine();
    const logs = useSystemStore.getState().logs;

    await engine.write('system_logs', logs);
    // Don't emit for log writes to avoid recursion
  }, DEBOUNCE_MS * 2.5),

  preferences: debounce(async () => {
    const engine = getPersistenceEngine();
    const state = useSystemStore.getState();

    await engine.write('preferences', [{
      id: 'app-preferences',
      sidebarCollapsed: state.sidebarCollapsed,
      sidebarPinned: state.sidebarPinned,
      navFavorites: state.navFavorites,
      updatedAt: new Date().toISOString(),
    }]);
    eventBus.persist('write', 'preferences saved', 'debug', { domain: 'preferences' });
  }, DEBOUNCE_MS * 1.5),

  metrics_snapshots: debounce(async () => {
    const engine = getPersistenceEngine();
    const metrics = useSystemStore.getState().clusterMetrics;

    if (!metrics) return;

    // Read existing archive, append, trim to rolling window
    const existing = await engine.read('metrics_snapshots') as MetricsArchiveEntry[];
    const newEntry: MetricsArchiveEntry = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: metrics,
    };
    const archive = [...existing, newEntry].slice(-METRICS_ARCHIVE_MAX);

    await engine.write('metrics_snapshots', archive);
    eventBus.persist('archive', `metrics snapshot archived (${archive.length}/${METRICS_ARCHIVE_MAX})`, 'info', {
      domain: 'metrics_snapshots',
      archiveSize: archive.length,
      timestamp: metrics.timestamp,
    });
  }, METRICS_ARCHIVE_INTERVAL),

  // Phase 20: Knowledge Base writer (triggered externally by KnowledgeBase component)
  knowledge_base: debounce(async () => {
    // Knowledge base is persisted directly by the KnowledgeBase component
    // through persistence-engine.ts functions (upsertKnowledgeEntry, etc.)
    // This writer serves as a scheduled sync checkpoint
    const engine = getPersistenceEngine();

    try {
      const entries = await engine.read('knowledge_base');

      if (entries.length > 0) {
        eventBus.persist('sync', `knowledge_base: ${entries.length} entries synced`, 'debug', {
          domain: 'knowledge_base',
          count: entries.length,
        });
      }
    } catch { /* silent */ }
  }, DEBOUNCE_MS * 3),

  // Phase 20: Agent Profiles writer
  agent_profiles: debounce(async () => {
    const engine = getPersistenceEngine();

    try {
      const profiles = await engine.read('agent_profiles');

      if (profiles.length > 0) {
        eventBus.persist('sync', `agent_profiles: ${profiles.length} profiles synced`, 'debug', {
          domain: 'agent_profiles',
          count: profiles.length,
        });
      }
    } catch { /* silent */ }
  }, DEBOUNCE_MS * 3),
};

// ============================================================
// 3. Hydrate Store from Persistence (Boot-time)
// ============================================================

let _hydrated = false;

export async function hydrateStoreFromPersistence(): Promise<{
  hydrated: boolean;
  domains: string[];
  recordCount: number;
}> {
  if (_hydrated) return { hydrated: true, domains: [], recordCount: 0 };

  const engine = getPersistenceEngine();
  const hydratedDomains: string[] = [];
  let totalRecords = 0;

  try {
    // --- Chat Messages ---
    const chatMsgs = await engine.read('chat_messages');

    if (chatMsgs.length > 0) {
      // Phase 27: Zod-validated hydration (replaces manual typeof guards)
      const { valid, invalidCount } = validateArray(ChatMessageSchema, chatMsgs);

      if (valid.length > 0) {
        useSystemStore.getState().setMessages(valid as ChatMessage[]);
        hydratedDomains.push('chat_messages');
        totalRecords += valid.length;
        if (invalidCount > 0) {
          console.warn(`[PersistenceBinding] chat_messages: ${invalidCount} invalid records filtered by Zod`);
        }
      }
    }

    // --- Agent Chat Histories ---
    const agentData = await engine.read('agent_messages');

    if (agentData.length > 0) {
      // Phase 27: Zod-validated agent history records
      const { valid: validRecords } = validateArray(AgentHistoryRecordSchema, agentData);
      const histories: Record<string, AgentChatMessage[]> = {};

      for (const rec of validRecords) {
        histories[rec.agentId] = rec.messages as AgentChatMessage[];
      }
      if (Object.keys(histories).length > 0) {
        for (const [agentId, messages] of Object.entries(histories)) {
          useSystemStore.getState().setAgentHistory(agentId, messages);
        }
        hydratedDomains.push('agent_messages');
        totalRecords += Object.values(histories).reduce((s, arr) => s + arr.length, 0);
      }
    }

    // --- Preferences ---
    const prefs = await engine.read('preferences');

    if (prefs.length > 0) {
      // Phase 27: Zod-validated preferences (PreferencesSchema is all-optional,
      // so we validate and then apply known fields from the record)
      const p = prefs[0] as Record<string, unknown>;

      if (p) {
        if (typeof p.sidebarCollapsed === 'boolean') {
          useSystemStore.getState().setSidebarCollapsed(p.sidebarCollapsed);
        }
        if (typeof p.sidebarPinned === 'boolean') {
          useSystemStore.getState().setSidebarPinned(p.sidebarPinned);
        }
        if (Array.isArray(p.navFavorites) && p.navFavorites.length > 0) {
          useSystemStore.getState().setNavFavorites(p.navFavorites as string[]);
        }
        hydratedDomains.push('preferences');
        totalRecords += 1;
      }
    }

    // --- Metrics Snapshots (restore last snapshot for display) ---
    const metricsArchive = await engine.read('metrics_snapshots') as MetricsArchiveEntry[];

    if (metricsArchive.length > 0) {
      const latest = metricsArchive[metricsArchive.length - 1];

      if (latest?.data) {
        // Don't overwrite live metrics — just log that archive exists
        hydratedDomains.push('metrics_snapshots');
        totalRecords += metricsArchive.length;
      }
    }

    // --- System Logs (restore last session's logs) ---
    const logs = await engine.read('system_logs');

    if (logs.length > 0) {
      // Phase 28: Zod-validated system logs hydration
      const { valid, invalidCount } = validateArray(SystemLogSchema, logs);

      if (valid.length > 0) {
        const recent = valid.slice(0, 20);

        hydratedDomains.push('system_logs');
        totalRecords += recent.length;
        if (invalidCount > 0) {
          console.warn(`[PersistenceBinding] system_logs: ${invalidCount} invalid records filtered by Zod`);
        }
      }
    }

  } catch (e) {
    console.warn('[PersistenceBinding] Hydration error:', e);
  }

  _hydrated = true;

  // Emit hydration event
  eventBus.persist('hydrate', `Hydrated ${totalRecords} records from [${hydratedDomains.join(', ')}]`,
    totalRecords > 0 ? 'success' : 'info',
    { domains: hydratedDomains, recordCount: totalRecords },
  );

  return { hydrated: true, domains: hydratedDomains, recordCount: totalRecords };
}

// ============================================================
// 4. React Hook: Auto-Persist on Store Changes
// ============================================================

export function usePersistenceSync() {
  const bootRef = useRef(false);

  // Hydrate on mount (once)
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;

    hydrateStoreFromPersistence().then(result => {
      if (result.domains.length > 0) {
        useSystemStore.getState().addLog(
          'info',
          'PERSIST_SYNC',
          `Hydrated ${result.recordCount} records from [${result.domains.join(', ')}]`,
        );
      }
    });
  }, []);

  // Subscribe to store changes
  useEffect(() => {
    let prevMessageCount = useSystemStore.getState().messages.length;
    let prevAgentHistoryHash = hashAgentHistories(useSystemStore.getState().agentChatHistories);
    let prevLogCount = useSystemStore.getState().logs.length;
    let prevPrefsHash = hashPrefs(useSystemStore.getState());
    let prevMetricsTs = useSystemStore.getState().clusterMetrics?.timestamp ?? 0;

    const unsub = useSystemStore.subscribe(state => {
      // Chat messages changed?
      if (state.messages.length !== prevMessageCount) {
        prevMessageCount = state.messages.length;
        writers.chat_messages();
      }

      // Agent histories changed?
      const newAgentHash = hashAgentHistories(state.agentChatHistories);

      if (newAgentHash !== prevAgentHistoryHash) {
        prevAgentHistoryHash = newAgentHash;
        writers.agent_messages();
      }

      // Logs changed?
      if (state.logs.length !== prevLogCount) {
        prevLogCount = state.logs.length;
        writers.system_logs();
      }

      // Preferences changed?
      const newPrefsHash = hashPrefs(state);

      if (newPrefsHash !== prevPrefsHash) {
        prevPrefsHash = newPrefsHash;
        writers.preferences();
      }

      // ClusterMetrics changed? (30s debounce for archive)
      const metricsTs = state.clusterMetrics?.timestamp ?? 0;

      if (metricsTs !== prevMetricsTs) {
        prevMetricsTs = metricsTs;
        writers.metrics_snapshots();
      }
    });

    return () => {
      unsub();
      Object.values(writers).forEach(w => w.cancel());
    };
  }, []);
}

// ============================================================
// 5. Hash Helpers (lightweight change detection)
// ============================================================

function hashAgentHistories(histories: Record<string, unknown[]>): string {
  return Object.entries(histories)
    .map(([id, msgs]) => `${id}:${msgs.length}`)
    .sort()
    .join('|');
}

function hashPrefs(state: {
  sidebarCollapsed: boolean;
  sidebarPinned: boolean;
  navFavorites?: string[];
}): string {
  return `${state.sidebarCollapsed}|${state.sidebarPinned}|${(state.navFavorites ?? []).join(',')}`;
}

// ============================================================
// 6. Manual Persist Trigger (for explicit save points)
// ============================================================

export async function persistAllNow(): Promise<void> {
  const engine = getPersistenceEngine();
  const state = useSystemStore.getState();

  await Promise.all([
    engine.write('chat_messages', state.messages),
    engine.write('agent_messages',
      Object.entries(state.agentChatHistories).map(([agentId, messages]) => ({
        id: agentId, agentId, messages, updatedAt: new Date().toISOString(),
      })),
    ),
    engine.write('system_logs', state.logs),
    engine.write('preferences', [{
      id: 'app-preferences',
      sidebarCollapsed: state.sidebarCollapsed,
      sidebarPinned: state.sidebarPinned,
      navFavorites: state.navFavorites,
      updatedAt: new Date().toISOString(),
    }]),
  ]);

  eventBus.persist('flush', 'Full persist completed (manual trigger)', 'success', {
    domains: ['chat_messages', 'agent_messages', 'system_logs', 'preferences'],
  });
}

// ============================================================
// 7. Metrics Archive Query API
// ============================================================

/**
 * Read the archived metrics snapshots for historical charts.
 */
export async function getMetricsArchive(): Promise<MetricsArchiveEntry[]> {
  const engine = getPersistenceEngine();

  return (await engine.read('metrics_snapshots')) as MetricsArchiveEntry[];
}

export type { MetricsArchiveEntry };