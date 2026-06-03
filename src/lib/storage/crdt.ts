// ============================================================
// YYC3 AI Family — CRDT Primitives for Conflict-Free Merges
// Phase: 前端一体化存储架构 · 无冲突合并
//
// 继承自 YYC3-CloudIntelli-Matrix crdt.ts 设计思想
// 轻量化实现，精确对接 StorageOrchestrator.syncUpstream
//
// 核心原语:
//   1. LWWRegister<T> — Last-Writer-Wins Register (时间戳决胜)
//   2. GCounter — Grow-only Counter (多节点无冲突计数)
//   3. mergeState — 通用状态合并 (LWW / deep-merge / prefer-local)
//   4. mergeArrays — 数组级 CRDT 合并 (用于同步已存在的数�?)
//
// 使用场景:
//   NAS SQLite 同步时: 同一数据在本地和远端被同时修改
//   CrossTab 同步时: 两个标签页同时写入同一 domain
// ============================================================

// ============================================================
// 1. LWW Register (Last-Writer-Wins)
// ============================================================

export interface LWWEntry<T> {
  value: T;
  timestamp: number;
  nodeId: string;
}

export class LWWRegister<T> {
  private entry: LWWEntry<T>;

  constructor(initialValue: T, nodeId = 'local') {
    this.entry = { value: initialValue, timestamp: Date.now(), nodeId };
  }

  get value(): T { return this.entry.value; }
  get timestamp(): number { return this.entry.timestamp; }

  set(value: T, nodeId?: string): void {
    this.entry = { value, timestamp: Date.now(), nodeId: nodeId ?? this.entry.nodeId };
  }

  /** 合并远端值 — 时间戳大的赢 */
  merge(remote: LWWEntry<T>): { winner: 'local' | 'remote'; merged: T } {
    if (remote.timestamp > this.entry.timestamp) {
      this.entry = remote;

      return { winner: 'remote', merged: remote.value };
    }

    return { winner: 'local', merged: this.entry.value };
  }

  export(): LWWEntry<T> {
    return { ...this.entry };
  }

  static import<T>(data: LWWEntry<T>): LWWRegister<T> {
    const reg = new LWWRegister(data.value, data.nodeId);

    reg.entry = { ...data };

    return reg;
  }
}

// ============================================================
// 2. G-Counter (Grow-only Counter)
// ============================================================

export class GCounter {
  private counts = new Map<string, number>();
  readonly nodeId: string;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.counts.set(nodeId, 0);
  }

  increment(amount = 1): void {
    const current = this.counts.get(this.nodeId) ?? 0;

    this.counts.set(this.nodeId, current + amount);
  }

  get value(): number {
    let total = 0;

    for (const count of this.counts.values()) total += count;

    return total;
  }

  merge(remoteCounts: Map<string, number>): void {
    for (const [node, count] of remoteCounts) {
      const local = this.counts.get(node) ?? 0;

      this.counts.set(node, Math.max(local, count)); // max merge
    }
  }

  export(): Map<string, number> {
    return new Map(this.counts);
  }
}

// ============================================================
// 3. Merge Strategies
// ============================================================

export type MergeStrategy = 'lww' | 'merge-deep' | 'prefer-local';

/** 通用状态合并 */
export function mergeState<T extends Record<string, unknown>>(
  local: T,
  remote: T,
  strategy: MergeStrategy = 'lww',
  localTimestamp?: number,
  remoteTimestamp?: number,
): T {
  switch (strategy) {
    case 'lww':
      return (remoteTimestamp && localTimestamp && remoteTimestamp > localTimestamp) ? remote : local;
    case 'merge-deep':
      return { ...local, ...remote };
    case 'prefer-local':
      return { ...remote, ...local };
    default:
      return local;
  }
}

// ============================================================
// 4. Array-level CRDT Merge (for PersistDomain record arrays)
// ============================================================

/**
 * 合并两条记录数组 — 用于 NAS 同步冲突
 * 规则: 按 id 归并，相同 id 取 timestamp 大的版本
 */
export function mergeRecordArrays<T extends { id: string } & Record<string, unknown>>(
  local: T[],
  remote: T[],
): { merged: T[]; localWins: number; remoteWins: number } {
  const map = new Map<string, T>();
  let localWins = 0;
  let remoteWins = 0;

  // 先插入本地记录
  for (const rec of local) {
    map.set(rec.id, rec);
  }

  // 远程记录按时间戳覆盖
  for (const rec of remote) {
    const existing = map.get(rec.id);

    if (!existing) {
      map.set(rec.id, rec);
      remoteWins++;
    } else {
      const localTs = typeof (existing as any).updatedAt === 'string'
        ? new Date((existing as any).updatedAt).getTime() : 0;
      const remoteTs = typeof (rec as any).updatedAt === 'string'
        ? new Date((rec as any).updatedAt).getTime() : 0;

      if (remoteTs > localTs) {
        map.set(rec.id, rec);
        remoteWins++;
      } else {
        localWins++;
      }
    }
  }

  return { merged: Array.from(map.values()), localWins, remoteWins };
}
