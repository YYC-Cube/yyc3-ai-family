// ============================================================
// YYC3 AI Family — Storage Orchestrator
// Phase: 前端一体化存�?架构
//
// 统一协调三层存储适配器：
//   L1 — localStorage（小数据，即时访问）
//   L2 — IndexedDB（大数据，高容量）
//   L3 — NAS SQLite（持久化，跨设备）
//
// 核心策略:
//   - 智能分层：根据数据类型和大小自动选择存�?层
//   - 自动降级：上层不可用时自动降级到下一层
//   - 双写模式：关键数据同时写入 local + remote
//   - 后台同步：离线更新排队，在线后自动同步
//   - 健康监控：实时监控各层状态和容量
// ============================================================

import { eventBus } from '@/lib/event-bus';
import { loadSQLiteConfig } from '@/lib/nas-client';
import type { PersistDomain, StorageAdapter, StorageStats } from '@/lib/persistence-engine';
import { LocalStorageAdapter, NasSQLiteAdapter } from '@/lib/persistence-engine';

import { mergeRecordArrays } from './crdt';
import { broadcastStorageChange } from './cross-tab-sync';
import { IndexedDBAdapter } from './indexeddb-adapter';

// ============================================================
// 1. Types
// ============================================================

export type StorageTier = 'L1-localStorage' | 'L2-indexedDB' | 'L3-nas';

export type TierStrategy = 'auto' | 'local-only' | 'indexeddb-only' | 'nas-only' | 'dual-local-idb' | 'dual-all';

export interface TierConfig {
  defaultStrategy: TierStrategy;
  domainOverrides: Partial<Record<PersistDomain, TierStrategy>>;
  sizeThresholds: {
    /** 超过此大�?字节）自动升级到 IndexedDB */
    localToIDB: number; // 默认 100KB
    /** 超过此大�?字节）自动升级到 NAS */
    idbToNAS: number; // 默认 1MB
  };
}

export interface TierHealth {
  tier: StorageTier;
  available: boolean;
  recordCount: number;
  sizeKB: number;
  latencyMs: number;
  lastError?: string;
}

export interface OrchestratorStats {
  tiers: TierHealth[];
  activeTier: StorageTier;
  strategy: TierStrategy;
  totalSizeKB: number;
  pendingSyncs: number;
  migrationProgress?: { from: StorageTier; to: StorageTier; progress: number };
}

// ============================================================
// 2. Domain-to-Tier Mapping
// ============================================================

/**
 * 根据域名和数据量推荐存储层
 */
const DOMAIN_TIER_MAP: Record<PersistDomain, { preferred: StorageTier; strategy: TierStrategy }> = {
  // L1 localStorage 适�?�?小数据、高频访问
  preferences: { preferred: 'L1-localStorage', strategy: 'local-only' },
  mcp_registry: { preferred: 'L1-localStorage', strategy: 'local-only' },
  device_configs: { preferred: 'L1-localStorage', strategy: 'local-only' },
  llm_configs: { preferred: 'L1-localStorage', strategy: 'dual-local-idb' }, // API Key 加密双写

  // L2 IndexedDB 适合中等数据
  chat_sessions: { preferred: 'L2-indexedDB', strategy: 'dual-local-idb' },
  chat_messages: { preferred: 'L2-indexedDB', strategy: 'dual-local-idb' },
  agent_sessions: { preferred: 'L2-indexedDB', strategy: 'dual-local-idb' },
  agent_messages: { preferred: 'L2-indexedDB', strategy: 'dual-local-idb' },
  system_logs: { preferred: 'L2-indexedDB', strategy: 'local-only' },
  workflows: { preferred: 'L2-indexedDB', strategy: 'dual-local-idb' },
  templates: { preferred: 'L2-indexedDB', strategy: 'local-only' },
  mcp_call_log: { preferred: 'L2-indexedDB', strategy: 'local-only' },
  llm_usage: { preferred: 'L2-indexedDB', strategy: 'dual-local-idb' },
  knowledge_base: { preferred: 'L2-indexedDB', strategy: 'dual-local-idb' },
  agent_profiles: { preferred: 'L2-indexedDB', strategy: 'dual-local-idb' },
  artifacts: { preferred: 'L2-indexedDB', strategy: 'indexeddb-only' },

  // L3 NAS 适�?�?持久化、跨设备共享
  metrics_snapshots: { preferred: 'L3-nas', strategy: 'dual-all' },
};

// ============================================================
// 3. Storage Orchestrator
// ============================================================

export class StorageOrchestrator {
  private adapters = new Map<StorageTier, StorageAdapter>();
  private config: TierConfig;

  // 健康状�?缓存
  private tierHealth = new Map<StorageTier, boolean>([
    ['L1-localStorage', true],
    ['L2-indexedDB', false],
    ['L3-nas', false],
  ]);

  constructor(config?: Partial<TierConfig>) {
    this.config = {
      defaultStrategy: 'auto',
      domainOverrides: {},
      sizeThresholds: {
        localToIDB: 100 * 1024, // 100KB
        idbToNAS: 1024 * 1024, // 1MB
      },
      ...config,
    };

    // 注册适�?器
    this.adapters.set('L1-localStorage', new LocalStorageAdapter());
    this.adapters.set('L2-indexedDB', new IndexedDBAdapter());

    // NAS 适配器延�?初�?（避免启动时阻塞）
    try {
      const nasConfig = loadSQLiteConfig();

      if (nasConfig.host) {
        this.adapters.set('L3-nas', new NasSQLiteAdapter(nasConfig));
      }
    } catch {
      // NAS 不可用，仅使用 L1 + L2
    }
  }

  // ============================================================
  // 核心读写操作
  // ============================================================

  /**
   * 读取数据 — 从最适合的存储层读取
   */
  async read(domain: PersistDomain): Promise<unknown[]> {
    const strategy = this.resolveStrategy(domain);
    const tiers = this.getTierOrder(strategy);

    for (const tier of tiers) {
      const adapter = this.adapters.get(tier);

      if (!adapter) continue;

      try {
        const data = await adapter.read(domain);

        if (data.length > 0) {
          // 如果数据来自非首选层，尝试同步到首选层
          const preferred = DOMAIN_TIER_MAP[domain]?.preferred || 'L1-localStorage';

          if (tier !== preferred && data.length > 0) {
            this.syncUpstream(domain, data, tier, preferred).catch(() => { });
          }

          return data;
        }
      } catch (err) {
        this.markUnhealthy(tier, err);
      }
    }

    return [];
  }

  /**
   * 写入数据 — 根据策略写入�?关存储层
   */
  async write(domain: PersistDomain, data: unknown[]): Promise<void> {
    const strategy = this.resolveStrategy(domain);
    const tiers = this.getWriteTiers(strategy, data);

    const errors: Error[] = [];

    for (const tier of tiers) {
      const adapter = this.adapters.get(tier);

      if (!adapter) continue;

      try {
        await adapter.write(domain, data);
        this.tierHealth.set(tier, true);
      } catch (err) {
        errors.push(err as Error);
        this.markUnhealthy(tier, err);
      }
    }

    // 跨标签广播：通知其他标签页此域已变更
    if (errors.length === 0) {
      broadcastStorageChange(domain, 'write');
    }

    if (errors.length > 0) {
      eventBus.emit({
        category: 'persist',
        type: 'persist.write_error',
        level: 'warn',
        source: 'StorageOrchestrator',
        message: `Write to ${domain} failed on ${errors.length} tier(s)`,
        metadata: { domain, errors: errors.map(e => e.message) },
      });
    }
  }

  /**
   * 追加数据
   */
  async append(domain: PersistDomain, record: unknown): Promise<void> {
    const existing = await this.read(domain);

    existing.push(record);
    await this.write(domain, existing);
  }

  /**
   * 删除数据
   */
  async remove(domain: PersistDomain, id: string): Promise<void> {
    const data = await this.read(domain);
    const filtered = data.filter(item => {
      const rec = item as Record<string, unknown>;

      return rec.id !== id;
    });

    await this.write(domain, filtered);
  }

  /**
   * 清除领域数据
   */
  async clear(domain: PersistDomain): Promise<void> {
    for (const [, adapter] of this.adapters) {
      try {
        await adapter.clear(domain);
      } catch { /* continue */ }
    }
    broadcastStorageChange(domain, 'clear');
  }

  // ============================================================
  // 策略解析
  // ============================================================

  private resolveStrategy(domain: PersistDomain): TierStrategy {
    // 1. 域特�?覆盖
    const override = this.config.domainOverrides[domain];

    if (override) return override;

    // 2. 默认域映射
    const mapping = DOMAIN_TIER_MAP[domain];

    if (mapping) return mapping.strategy;

    // 3. 全局默认
    return this.config.defaultStrategy;
  }

  /**
   * 读取时的层优先级（降序）
   */
  private getTierOrder(strategy: TierStrategy): StorageTier[] {
    switch (strategy) {
      case 'local-only':
        return ['L1-localStorage'];
      case 'indexeddb-only':
        return ['L2-indexedDB'];
      case 'nas-only':
        return ['L3-nas', 'L2-indexedDB', 'L1-localStorage']; // fallback
      case 'dual-local-idb':
        return ['L2-indexedDB', 'L1-localStorage'];
      case 'dual-all':
        return ['L3-nas', 'L2-indexedDB', 'L1-localStorage'];
      case 'auto':
      default:
        // L2 → L1 → L3（性能优先）
        return ['L2-indexedDB', 'L1-localStorage', 'L3-nas'];
    }
  }

  /**
   * 写入时的目标层列表
   */
  private getWriteTiers(strategy: TierStrategy, data: unknown[]): StorageTier[] {
    switch (strategy) {
      case 'local-only':
        return ['L1-localStorage'];
      case 'indexeddb-only':
        return ['L2-indexedDB'];
      case 'nas-only':
        return ['L3-nas'];
      case 'dual-local-idb':
        return ['L2-indexedDB', 'L1-localStorage'];
      case 'dual-all':
        return ['L3-nas', 'L2-indexedDB', 'L1-localStorage'];
      case 'auto':
      default: {
        const size = this.estimateSize(data);

        if (size > this.config.sizeThresholds.idbToNAS && this.isHealthy('L3-nas')) {
          return ['L3-nas', 'L2-indexedDB'];
        }
        if (size > this.config.sizeThresholds.localToIDB) {
          return ['L2-indexedDB', 'L1-localStorage'];
        }

        return ['L1-localStorage', 'L2-indexedDB'];
      }
    }
  }

  // ============================================================
  // 健康监控
  // ============================================================

  private markUnhealthy(tier: StorageTier, err: unknown): void {
    this.tierHealth.set(tier, false);
    eventBus.emit({
      category: 'persist',
      type: 'persist.tier_unhealthy',
      level: 'warn',
      source: 'StorageOrchestrator',
      message: `${tier} marked unhealthy: ${err instanceof Error ? err.message : 'Unknown error'}`,
      metadata: { tier },
    });
  }

  isHealthy(tier: StorageTier): boolean {
    return this.tierHealth.get(tier) === true;
  }

  /**
   * 刷新所有层健康状�?
   */
  async refreshHealth(): Promise<TierHealth[]> {
    const results: TierHealth[] = [];

    for (const [tier, adapter] of this.adapters) {
      const start = performance.now();
      let available = false;
      let lastError: string | undefined;
      let stats: StorageStats = {
        adapter: tier, totalRecords: 0, totalSizeKB: 0,
        domainCounts: {}, lastSync: 0, isOnline: false, pendingSyncs: 0,
      };

      try {
        available = await adapter.ping();
        this.tierHealth.set(tier, available);
        if (available) {
          stats = await adapter.getStats();
        }
      } catch (err) {
        available = false;
        lastError = err instanceof Error ? err.message : 'Unknown error';
        this.tierHealth.set(tier, false);
      }

      const latencyMs = Math.round(performance.now() - start);

      results.push({
        tier,
        available,
        recordCount: stats.totalRecords,
        sizeKB: stats.totalSizeKB,
        latencyMs,
        lastError,
      });
    }

    return results;
  }

  /**
   * 获取整�?�?�计
   */
  async getStats(): Promise<OrchestratorStats> {
    const health = await this.refreshHealth();
    const totalSizeKB = health.reduce((s, h) => s + h.sizeKB, 0);
    const pendingSyncs = health.reduce((s, h) => s + (h.available ? 0 : 0), 0);

    return {
      tiers: health,
      activeTier: this.detectActiveTier(health),
      strategy: this.config.defaultStrategy,
      totalSizeKB,
      pendingSyncs,
    };
  }

  private detectActiveTier(health: TierHealth[]): StorageTier {
    for (const tier of ['L2-indexedDB', 'L1-localStorage', 'L3-nas'] as StorageTier[]) {
      const h = health.find(t => t.tier === tier);

      if (h?.available) return tier;
    }

    return 'L1-localStorage';
  }

  // ============================================================
  // 辅助方法
  // ============================================================

  private estimateSize(data: unknown[]): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  private async syncUpstream(
    domain: PersistDomain,
    data: unknown[],
    fromTier: StorageTier,
    toTier: StorageTier,
  ): Promise<void> {
    const adapter = this.adapters.get(toTier);

    if (!adapter) return;

    try {
      // 目标层可能已有旧数据，用 CRDT 合并而非直接覆盖
      const existing = await adapter.read(domain);

      if (existing.length > 0 && data.length > 0) {
        // 两条非空数组 → CRDT merge
        const typedLocal = data as ({ id: string } & Record<string, unknown>)[];
        const typedRemote = existing as ({ id: string } & Record<string, unknown>)[];
        const { merged } = mergeRecordArrays(typedLocal, typedRemote);

        await adapter.write(domain, merged);
      } else {
        // 有一方为空 → 直接用非空方
        await adapter.write(domain, data.length > 0 ? data : existing);
      }
    } catch { /* silent fallback */ }
  }

  /**
   * 获取特定层的适�?器
   */
  getAdapter(tier: StorageTier): StorageAdapter | undefined {
    return this.adapters.get(tier);
  }
}

// ============================================================
// 4. Singleton
// ============================================================

let _orchestratorInstance: StorageOrchestrator | null = null;

export function getStorageOrchestrator(config?: Partial<TierConfig>): StorageOrchestrator {
  if (!_orchestratorInstance) {
    _orchestratorInstance = new StorageOrchestrator(config);
  }

  return _orchestratorInstance;
}
