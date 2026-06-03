// ============================================================
// YYC3 AI Family — IndexedDB Storage Adapter
// Phase: 前�?一体化存储架构
//
// 基于 Dexie.js 的 IndexedDB 适配器，实现 StorageAdapter 接口
// 用于大容量数据持久化，突破 localStorage 5MB 限制
//
// 数据流:
//   App → PersistenceEngine → IndexedDBAdapter → Dexie.js → IndexedDB
//
// 特点:
//   - 完全兼容 StorageAdapter 接口
//   - 自动版本管理 + Schema 迁移
//   - 事务支持
//   - 加密字段自动处理
//   - 存储空间监控
// ============================================================

import Dexie, { type Table } from 'dexie';

import type { PersistDomain, StorageAdapter, StorageStats } from '@/lib/persistence-engine';

import { CacheManager } from './cache-manager';

// ============================================================
// 1. IndexedDB Schema Definitions
// ============================================================

const DB_NAME = 'yyc3-family-db';
// DB_VERSION is used by Dexie version() calls above
const _DB_VERSION = 3;

/**
 * IndexedDB 域记�?模型 — 统一存�?所有 PersistDomain
 */
export interface DomainRecord {
  id: string; // 唯一标识
  domain: string; // PersistDomain 域
  data: unknown; // 序列化数据
  version: number; // 数据版本
  encrypted: boolean; // 是否加密
  checksum?: string; // 数据校验和
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  synced: boolean; // 是否已同步
}

/**
 * 文件�?录 — 用于存�大文件内�?
 */
export interface FileRecord {
  id: string; // 文件哈希/ID
  name: string; // 文件�?
  mimeType: string; // MIME 类型
  size: number; // �?节数
  data: ArrayBuffer; // 二进制数据
  compressed: boolean; // 是否压缩
  tags: string[]; // �?签
  createdAt: string;
  updatedAt: string;
}

/**
 * 同步日�? — 记�数据变更历史
 */
export interface SyncJournal {
  id: string;
  domain: string;
  action: 'create' | 'update' | 'delete';
  entityId: string;
  timestamp: string;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

// ============================================================
// 2. Dexie Database Class
// ============================================================

class YYC3Database extends Dexie {
  domains!: Table<DomainRecord, string>;
  files!: Table<FileRecord, string>;
  journals!: Table<SyncJournal, string>;

  constructor() {
    super(DB_NAME);

    // Version 1: 核心域存储
    this.version(1).stores({
      domains: 'id, domain, createdAt, updatedAt, synced, version',
      files: 'id, name, mimeType, size, createdAt',
      journals: 'id, domain, status, timestamp, [domain+status]',
    });

    // Version 2: 添加�?引优化
    this.version(2).stores({
      domains: 'id, domain, createdAt, updatedAt, synced, version, [domain+synced]',
      files: 'id, name, mimeType, size, createdAt, [mimeType+size]',
      journals: 'id, domain, status, timestamp, [domain+status], [status+timestamp]',
    });

    // Version 3: 添加压�标志
    this.version(3).stores({
      domains: 'id, domain, createdAt, updatedAt, synced, version, encrypted, [domain+synced]',
      files: 'id, name, mimeType, size, createdAt, compressed, [mimeType+size]',
      journals: 'id, domain, status, timestamp, retryCount, [domain+status], [status+timestamp]',
    });
  }
}

let _dbInstance: YYC3Database | null = null;

function getDB(): YYC3Database {
  if (!_dbInstance) {
    _dbInstance = new YYC3Database();
  }

  return _dbInstance;
}

// ============================================================
// 3. IndexedDB Adapter
// ============================================================

export class IndexedDBAdapter implements StorageAdapter {
  readonly name = 'IndexedDB';
  readonly isOnline = true;

  private ready: Promise<void>;
  private cache = new CacheManager<unknown[]>(30_000); // 30s TTL

  constructor() {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    try {
      const db = getDB();

      await db.open();
      console.log('[IndexedDB] Database opened:', DB_NAME);
    } catch (err) {
      console.error('[IndexedDB] Failed to open database:', err);
      throw err;
    }
  }

  private async ensureReady(): Promise<void> {
    await this.ready;
  }

  async read(domain: PersistDomain): Promise<unknown[]> {
    // 缓存读取：30s TTL 内直接返回，避免频繁 IndexedDB 查询
    const cached = this.cache.get(domain);

    if (cached) return cached;

    try {
      await this.ensureReady();
      const db = getDB();

      const records = await db.domains
        .where('domain')
        .equals(domain)
        .toArray();

      // 按 updatedAt 排序
      records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      let result: unknown[];

      if (records.length === 1) {
        const data = records[0].data;

        result = Array.isArray(data) ? data : [data];
      } else {
        result = records.map(r => r.data);
      }

      this.cache.set(domain, result);

      return result;
    } catch (err) {
      console.warn('[IndexedDB] read failed:', domain, err);

      return [];
    }
  }

  async write(domain: PersistDomain, data: unknown[]): Promise<void> {
    try {
      await this.ensureReady();
      const db = getDB();
      const now = new Date().toISOString();

      await db.transaction('rw', db.domains, async () => {
        await db.domains.where('domain').equals(domain).delete();

        const record: DomainRecord = {
          id: `domain-${domain}`,
          domain,
          data,
          version: 1,
          encrypted: false,
          createdAt: now,
          updatedAt: now,
          synced: false,
        };

        await db.domains.add(record);
      });

      // �?��缓存
      this.cache.delete(domain);
    } catch (err) {
      console.warn('[IndexedDB] write failed:', domain, err);
    }
  }

  async append(domain: PersistDomain, record: unknown): Promise<void> {
    try {
      await this.ensureReady();
      const existing = await this.read(domain);

      existing.push(record);
      await this.write(domain, existing);
    } catch (err) {
      console.warn('[IndexedDB] append failed:', domain, err);
    }
  }

  async remove(domain: PersistDomain, id: string): Promise<void> {
    try {
      await this.ensureReady();
      const db = getDB();

      // 从 domains 表中查找并过滤
      const domainRecord = await db.domains
        .where('domain')
        .equals(domain)
        .first();

      if (domainRecord) {
        const data = domainRecord.data as Record<string, unknown>[];
        const filtered = data.filter(item => {
          const rec = item as Record<string, unknown>;

          return rec.id !== id;
        });

        domainRecord.data = filtered;
        domainRecord.updatedAt = new Date().toISOString();
        await db.domains.put(domainRecord);
      }
    } catch (err) {
      console.warn('[IndexedDB] remove failed:', domain, id, err);
    }
  }

  async clear(domain: PersistDomain): Promise<void> {
    try {
      await this.ensureReady();
      const db = getDB();

      await db.domains.where('domain').equals(domain).delete();
    } catch (err) {
      console.warn('[IndexedDB] clear failed:', domain, err);
    }
  }

  async getStats(): Promise<StorageStats> {
    try {
      await this.ensureReady();
      const db = getDB();

      const allRecords = await db.domains.toArray();
      const domainCounts: Record<string, number> = {};
      let totalBytes = 0;

      for (const record of allRecords) {
        const json = JSON.stringify(record.data);
        const bytes = json.length * 2; // UTF-16

        totalBytes += bytes;

        const domain = record.domain;
        const data = record.data;

        domainCounts[domain] = Array.isArray(data) ? data.length : 1;
      }

      // 计算 IndexedDB 总用量
      let indexedDBSizeBytes = totalBytes;

      try {
        if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();

          indexedDBSizeBytes = estimate.usage || totalBytes;
        }
      } catch { /* fallback to approximation */ }

      return {
        adapter: this.name,
        totalRecords: allRecords.length,
        totalSizeKB: Math.round(indexedDBSizeBytes / 1024 * 10) / 10,
        domainCounts,
        lastSync: Date.now(),
        isOnline: true,
        pendingSyncs: allRecords.filter(r => !r.synced).length,
      };
    } catch (err) {
      console.warn('[IndexedDB] getStats failed:', err);

      return {
        adapter: this.name,
        totalRecords: 0,
        totalSizeKB: 0,
        domainCounts: {},
        lastSync: 0,
        isOnline: true,
        pendingSyncs: 0,
      };
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.ensureReady();
      const db = getDB();

      await db.domains.count();

      return true;
    } catch {
      return false;
    }
  }

  // ============================================================
  // IndexedDB 特有方法
  // ============================================================

  /**
   * 获取存储估算信息
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number; usageDetails?: Record<string, number> }> {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();

        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          usageDetails: (estimate as any).usageDetails as Record<string, number> | undefined,
        };
      }
    } catch { /* fallback */ }

    return { usage: 0, quota: 0 };
  }

  /**
   * 存储大文件
   */
  async storeFile(
    id: string,
    name: string,
    mimeType: string,
    data: ArrayBuffer,
    tags: string[] = [],
  ): Promise<void> {
    await this.ensureReady();
    const db = getDB();
    const now = new Date().toISOString();

    await db.files.put({
      id,
      name,
      mimeType,
      size: data.byteLength,
      data,
      compressed: false,
      tags,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * 读取大文件
   */
  async getFile(id: string): Promise<FileRecord | undefined> {
    await this.ensureReady();
    const db = getDB();

    return db.files.get(id);
  }

  /**
   * 删除大文件
   */
  async deleteFile(id: string): Promise<void> {
    await this.ensureReady();
    const db = getDB();

    await db.files.delete(id);
  }

  /**
   * 获取同步日志
   */
  async getPendingSyncs(): Promise<SyncJournal[]> {
    await this.ensureReady();
    const db = getDB();

    return db.journals
      .where('status')
      .equals('pending')
      .toArray();
  }

  /**
   * 记录同步日志
   */
  async recordSyncJournal(journal: Omit<SyncJournal, 'id'>): Promise<void> {
    await this.ensureReady();
    const db = getDB();

    await db.journals.add({
      ...journal,
      id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
  }

  /**
   * 清空所有数据
   */
  async purge(): Promise<void> {
    await this.ensureReady();
    const db = getDB();

    await db.transaction('rw', db.domains, db.files, db.journals, async () => {
      await db.domains.clear();
      await db.files.clear();
      await db.journals.clear();
    });
  }

  /**
   * 导出所有数据（用于快照）
   */
  async exportAll(): Promise<{
    domains: DomainRecord[];
    files: { id: string; name: string; mimeType: string; size: number }[];
  }> {
    await this.ensureReady();
    const db = getDB();

    const domains = await db.domains.toArray();
    const files = await db.files.toArray();

    return {
      domains,
      files: files.map(f => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size,
      })),
    };
  }

  /**
   * 导入数据恢复
   */
  async importAll(data: { domains: DomainRecord[] }): Promise<void> {
    await this.ensureReady();
    const db = getDB();

    await db.transaction('rw', db.domains, async () => {
      await db.domains.clear();
      for (const record of data.domains) {
        await db.domains.add(record);
      }
    });
  }
}

// ============================================================
// 4. Singleton Export
// ============================================================

export const indexedDBAdapter = new IndexedDBAdapter();
