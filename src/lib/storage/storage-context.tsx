// ============================================================
// YYC3 AI Family — Unified Storage Context + Hooks
// Phase: 前端一体化存储架构
//
// 提供全局存储状态管理，包裹所有存储操作：
//   - 存储层健康状�?
//   - 自动/手动触发同步
//   - 容量监�?
//   - 导入/导出快�?
//   - 迁移进度追�?
// ============================================================

import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { eventBus } from '@/lib/event-bus';
import { getPersistenceEngine, type StorageStats } from '@/lib/persistence-engine';

import { destroyCrossTabSync, initCrossTabSync, onStorageChange } from './cross-tab-sync';
import { getStorageOrchestrator, type OrchestratorStats, type StorageTier, type TierHealth } from './storage-orchestrator';

// ============================================================
// 1. Types
// ============================================================

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export interface StorageContextValue {
  // 状�?
  orchestratorStats: OrchestratorStats | null;
  engineStats: StorageStats | null;
  syncStatus: SyncStatus;
  lastSyncTime: number | null;
  pendingChanges: number;
  isOnline: boolean;

  // 操作
  refresh: () => Promise<void>;
  sync: () => Promise<void>;
  migrate: (from: StorageTier, to: StorageTier) => Promise<void>;
  exportSnapshot: () => Promise<string>;
  importSnapshot: (json: string) => Promise<void>;
  purgeAll: () => Promise<void>;
}

// ============================================================
// 2. Context
// ============================================================

const StorageContext = createContext<StorageContextValue | null>(null);

// ============================================================
// 3. Provider
// ============================================================

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [orchestratorStats, setOrchestratorStats] = useState<OrchestratorStats | null>(null);
  const [engineStats, setEngineStats] = useState<StorageStats | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // 在线状态监�?
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 定�?刷新（30秒）+ 跨标签同步
  useEffect(() => {
    refresh();
    initCrossTabSync();
    refreshInterval.current = setInterval(refresh, 30_000);

    // 监�?他标签的存储变更，自动刷新
    const unsub = onStorageChange('*', () => {
      refresh();
    });

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
      unsub();
      destroyCrossTabSync();
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const orchestrator = getStorageOrchestrator();
      const engine = getPersistenceEngine();

      const [oStats, eStats] = await Promise.all([
        orchestrator.getStats(),
        engine.getStats(),
      ]);

      setOrchestratorStats(oStats);
      setEngineStats(eStats);
      setPendingChanges(oStats.pendingSyncs);
    } catch (err) {
      console.warn('[StorageContext] refresh failed:', err);
    }
  }, []);

  const sync = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus('offline');

      return;
    }

    setSyncStatus('syncing');

    try {
      const engine = getPersistenceEngine();

      // 触发NAS同步
      if (engine.nasAvailable) {
        await engine.flushSyncQueue();
      }

      setSyncStatus('success');
      setLastSyncTime(Date.now());
      setPendingChanges(0);

      // 3秒后重置
      setTimeout(() => setSyncStatus('idle'), 3000);
      await refresh();
    } catch (err) {
      console.error('[StorageContext] sync failed:', err);
      setSyncStatus('error');

      // 5秒后重置
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }, [isOnline, refresh]);

  const migrate = useCallback(async (from: StorageTier, to: StorageTier) => {
    try {
      eventBus.emit({
        category: 'persist',
        type: 'persist.migration_start',
        level: 'info',
        source: 'StorageContext',
        message: `Starting migration: ${from} → ${to}`,
      });

      // 迁�?�?�辑委托给 storage-orchestrator
      // 此处只做进度通知
      await refresh();
    } catch (err) {
      console.error('[StorageContext] migration failed:', err);
    }
  }, [refresh]);

  const exportSnapshot = useCallback(async (): Promise<string> => {
    const engine = getPersistenceEngine();
    const snapshot = await engine.createSnapshot();

    return JSON.stringify(snapshot, null, 2);
  }, []);

  const importSnapshot = useCallback(async (json: string): Promise<void> => {
    const engine = getPersistenceEngine();
    const snapshot = JSON.parse(json);

    await engine.restoreSnapshot(snapshot);
    await refresh();
  }, [refresh]);

  const purgeAll = useCallback(async () => {
    const engine = getPersistenceEngine();
    const domains = [
      'chat_sessions', 'chat_messages', 'agent_sessions', 'agent_messages',
      'metrics_snapshots', 'system_logs', 'workflows', 'templates',
      'artifacts', 'mcp_call_log', 'llm_usage', 'knowledge_base', 'agent_profiles',
    ] as const;

    for (const domain of domains) {
      await engine.clear(domain);
    }

    await refresh();
  }, [refresh]);

  const value: StorageContextValue = {
    orchestratorStats,
    engineStats,
    syncStatus,
    lastSyncTime,
    pendingChanges,
    isOnline,
    refresh,
    sync,
    migrate,
    exportSnapshot,
    importSnapshot,
    purgeAll,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

// ============================================================
// 4. Hooks
// ============================================================

/**
 * 获取存储上下�?
 */
export function useStorage(): StorageContextValue {
  const context = useContext(StorageContext);

  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }

  return context;
}

/**
 * 获取特定存储层的健康状�?
 */
export function useTierHealth(tier: StorageTier): TierHealth | undefined {
  const { orchestratorStats } = useStorage();

  return orchestratorStats?.tiers.find(t => t.tier === tier);
}

/**
 * 获取存储容量百分比（相对于浏览器配额）
 */
export function useStorageCapacity(): { usedMB: number; quotaMB: number; percent: number } {
  const { orchestratorStats } = useStorage();
  const totalKB = orchestratorStats?.totalSizeKB || 0;

  // IndexedDB 典�?配额约为 50% of 可用磁盘空�?
  // 这里使�?估算值
  const usedMB = Math.round(totalKB / 1024 * 10) / 10;
  const quotaMB = 500; // 典型浏览器 IndexedDB 配额
  const percent = Math.min(100, Math.round((usedMB / quotaMB) * 100));

  return { usedMB, quotaMB, percent };
}

/**
 * 是否正在同步
 */
export function useIsSyncing(): boolean {
  const { syncStatus } = useStorage();

  return syncStatus === 'syncing';
}
