// ============================================================
// YYC3 AI Family — Cross-Tab Storage Sync via BroadcastChannel
// Phase: 前端一体化存储架构 · 跨标签页同步
//
// 继承自 YYC3-CloudIntelli-Matrix broadcast-channel.ts 设计思想
// 轻量化重新实现，精确对接 StorageOrchestrator
//
// 核心功能:
//   1. 单频道全局广播 — 所有标签页通过统一频道感知存储变更
//   2. 域路由 — 消息携带 domain，各层按需响应
//   3. 自动 rehydrate — 收到变更通知后自动刷新对应域的数据
//   4. 静默降级 — BroadcastChannel 不可用时不抛异常
// ============================================================

import type { PersistDomain } from '@/lib/persistence-engine';

// ============================================================
// 1. Channel Configuration
// ============================================================

const CHANNEL_NAME = 'yyc3-storage-sync';

export type SyncAction = 'write' | 'append' | 'remove' | 'clear' | 'ping';

export interface StorageSyncMessage {
  domain: PersistDomain;
  action: SyncAction;
  timestamp: number;
  sourceTab: string;
}

// ============================================================
// 2. Singleton Channel
// ============================================================

let channel: BroadcastChannel | null = null;
let tabId: string | null = null;
const listeners = new Map<string, Set<(msg: StorageSyncMessage) => void>>();

function getTabId(): string {
  if (!tabId) {
    tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }

  return tabId;
}

function ensureChannel(): BroadcastChannel | null {
  if (channel) return channel;
  if (typeof BroadcastChannel === 'undefined') return null;

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent) => {
      const msg = event.data as StorageSyncMessage;

      if (!msg || !msg.domain) return;
      if (msg.sourceTab === getTabId()) return; // 忽略自己的消息

      const domainListeners = listeners.get(msg.domain);

      if (domainListeners) {
        domainListeners.forEach(fn => fn(msg));
      }

      // 也通知通配监听器
      const wildcardListeners = listeners.get('*');

      if (wildcardListeners) {
        wildcardListeners.forEach(fn => fn(msg));
      }
    };

    return channel;
  } catch {
    return null;
  }
}

// ============================================================
// 3. Public API
// ============================================================

/**
 * 广播存储变更通知 — 其他标签页将收到并可选刷新
 */
export function broadcastStorageChange(domain: PersistDomain, action: SyncAction): void {
  const ch = ensureChannel();

  if (!ch) return;

  const msg: StorageSyncMessage = {
    domain,
    action,
    timestamp: Date.now(),
    sourceTab: getTabId(),
  };

  try {
    ch.postMessage(msg);
  } catch {
    // 静默降级
  }
}

/**
 * 监听特定域的跨标签变更
 * 返回取消监听的清理函数
 */
export function onStorageChange(
  domain: PersistDomain | '*',
  handler: (msg: StorageSyncMessage) => void,
): () => void {
  if (!listeners.has(domain)) {
    listeners.set(domain, new Set());
  }
  listeners.get(domain)!.add(handler);

  return () => {
    listeners.get(domain)?.delete(handler);
  };
}

/**
 * 初始化 — 发送一次 ping 宣告本标签页上线
 */
export function initCrossTabSync(): void {
  const ch = ensureChannel();

  if (!ch) return;

  // 本标签上线通知
  try {
    ch.postMessage({
      domain: 'preferences',
      action: 'ping',
      timestamp: Date.now(),
      sourceTab: getTabId(),
    } as StorageSyncMessage);
  } catch {
    // 静默
  }
}

/**
 * 销毁 — 关闭频道，清理监听器
 */
export function destroyCrossTabSync(): void {
  if (channel) {
    try { channel.close(); } catch { /* ignore */ }
    channel = null;
  }
  listeners.clear();
  tabId = null;
}
