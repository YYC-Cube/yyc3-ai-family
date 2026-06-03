// ============================================================
// YYC3 AI Family — Lightweight Cache Manager with TTL
// Phase: 前端一体化存储架构 · IndexedDB 读取缓存
//
// 继承自 YYC3-CloudIntelli-Matrix cache-manager.ts 设计思想
// 超轻量实现，仅保留 TTL + getOrSet 模式
//
// 核心功能:
//   1. TTL 自动过期
//   2. getOrSet — 缓存穿透保护，支持 async factory
//   3. 命中率统计
//   4. 全局命名缓存
// ============================================================

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;
  private stats = { hits: 0, misses: 0 };

  constructor(defaultTTL = 60_000) {
    this.defaultTTL = defaultTTL;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;

      return undefined;
    }
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;

      return undefined;
    }
    entry.hits++;
    this.stats.hits++;

    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
      hits: 0,
    });
  }

  /** 缓存穿透保护：缓存命中直接返回，否则调用 factory 填充缓存 */
  getOrSet(key: string, factory: () => T | Promise<T>, ttl?: number): T | Promise<T> {
    const cached = this.get(key);

    if (cached !== undefined) return cached;

    const value = factory();

    if (value instanceof Promise) {
      return value.then(resolved => { this.set(key, resolved, ttl);

        return resolved; });
    }
    this.set(key, value, ttl);

    return value;
  }

  delete(key: string): void { this.cache.delete(key); }
  clear(): void { this.cache.clear(); this.stats = { hits: 0, misses: 0 }; }

  get size(): number { return this.cache.size; }

  getStats() {
    const total = this.stats.hits + this.stats.misses;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 100) : 0,
      size: this.cache.size,
    };
  }
}

const globalCaches = new Map<string, CacheManager>();

export function getGlobalCache<T>(name: string, ttl = 60_000): CacheManager<T> {
  let cache = globalCaches.get(name) as CacheManager<T> | undefined;

  if (!cache) {
    cache = new CacheManager<T>(ttl);
    globalCaches.set(name, cache);
  }

  return cache;
}

export function clearAllGlobalCaches(): void {
  globalCaches.forEach(c => c.clear());
  globalCaches.clear();
}
