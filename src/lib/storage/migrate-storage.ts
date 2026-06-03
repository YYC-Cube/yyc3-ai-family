// ============================================================
// YYC3 AI Family — Lightweight Storage Migration Utilities
// Phase: 前端一体化存储架构 · 键迁移工具
//
// 继承自 YYC3-CloudIntelli-Matrix migrate-storage.ts 设计思想
// 用于 localStorage 旧键 → Zustand/IndexedDB 安全迁移
//
// 功能:
//   1. migrateKey — 读取 JSON 后回调，成功后删除旧 key
//   2. migrateKeyWithMerge — 读取+合并默认值，成功后删除
//   3. migrateKeyAsArray — 验证为数组后再回调
//   4. migrateRawString — 读取原始字符串
//   5. scanLegacyKeys — 扫描所有 yyc3 开头的旧键
// ============================================================

const LS_PREFIX = 'yyc3';

/**
 * 从 localStorage 读取 JSON 并回调，成功后删除 key
 */
export function migrateKey<T>(key: string, setter: (value: T) => void): boolean {
  try {
    const raw = localStorage.getItem(key);

    if (raw) {
      setter(JSON.parse(raw));
      localStorage.removeItem(key);

      return true;
    }
  } catch { /* ignore */ }

  return false;
}

/**
 * 读取 JSON 后与默认值合并，再回调
 */
export function migrateKeyWithMerge<T extends object>(
  key: string,
  defaults: T,
  setter: (value: T) => void,
): boolean {
  try {
    const raw = localStorage.getItem(key);

    if (raw) {
      setter({ ...defaults, ...JSON.parse(raw) });
      localStorage.removeItem(key);

      return true;
    }
  } catch { /* ignore */ }

  return false;
}

/**
 * 读取 JSON 并验证为数组，再回调
 */
export function migrateKeyAsArray<T>(
  key: string,
  setter: (value: T[]) => void,
): boolean {
  try {
    const raw = localStorage.getItem(key);

    if (raw) {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        setter(parsed);
        localStorage.removeItem(key);

        return true;
      }
    }
  } catch { /* ignore */ }

  return false;
}

/**
 * 读取原始字符串，再回调
 */
export function migrateRawString(key: string, setter: (value: string) => void): boolean {
  try {
    const raw = localStorage.getItem(key);

    if (raw) {
      setter(raw);
      localStorage.removeItem(key);

      return true;
    }
  } catch { /* ignore */ }

  return false;
}

/**
 * 扫描所有 yyc3 开头的旧键
 */
export function scanLegacyKeys(): { key: string; sizeBytes: number; preview: string }[] {
  const result: { key: string; sizeBytes: number; preview: string }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (!key || !key.startsWith(LS_PREFIX)) continue;

    const raw = localStorage.getItem(key) || '';

    result.push({
      key,
      sizeBytes: raw.length * 2,
      preview: raw.slice(0, 80) + (raw.length > 80 ? '...' : ''),
    });
  }

  return result.sort((a, b) => b.sizeBytes - a.sizeBytes);
}

/**
 * 批量迁移，返回成功/失败计数
 */
export function batchMigrate(migrations: { key: string; handler: (value: unknown) => void }[]): {
  success: number;
  failed: number;
} {
  let success = 0;
  let failed = 0;

  for (const { key, handler } of migrations) {
    try {
      const raw = localStorage.getItem(key);

      if (raw) {
        handler(JSON.parse(raw));
        localStorage.removeItem(key);
        success++;
      }
    } catch {
      failed++;
    }
  }

  return { success, failed };
}
