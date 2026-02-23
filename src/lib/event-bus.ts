// ============================================================
// YYC3 Hacker Chatbot — Global Event Bus
// Phase 18.4: Unified Event Stream
//
// 五维统一事件总线:
//   D1 智能维 → orchestrate.*  (Agent 协作编排事件)
//   D2 数据维 → persist.*      (持久化引擎事件)
//   D3 架构维 → mcp.*          (MCP 工具链事件)
//   D4 体验维 → ui.*           (用户交互事件)
//   D5 安全维 → security.*     (安全审计事件)
//
// 设计原则:
//   - 类型安全的发布/订阅 (typed pub/sub)
//   - 环形缓冲区 (ringbuffer, 保留最近 500 条)
//   - 无依赖 (zero deps, 纯 TS 实现)
//   - React Hook: useEventBus() 订阅实时流
//   - 全局单例 eventBus
//
// 生命周期:
//   任意模块 → eventBus.emit(event) → 所有 subscriber 回调
//                                    → ringbuffer 存档
//                                    → LiveLogStream 消费
// ============================================================

import { useEffect, useState, useRef, useSyncExternalStore } from 'react';

// ============================================================
// 1. Event Types
// ============================================================

export type EventCategory =
  | 'persist' // D2 数据维: 持久化引擎
  | 'orchestrate' // D1 智能维: Agent 协作编排
  | 'mcp' // D3 架构维: MCP 工具链
  | 'system' // 系统层: 集群/设备/网络
  | 'security' // D5 安全维: 审计/加密/权限
  | 'ui'; // D4 体验维: 用户交互

export type EventLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface BusEvent {
  id: string;
  timestamp: string;
  category: EventCategory;
  type: string; // e.g., 'persist.write', 'mcp.call', 'orchestrate.agent_started'
  level: EventLevel;
  source: string; // module/component name
  message: string;
  metadata?: Record<string, unknown>;
}

export type EventSubscriber = (event: BusEvent) => void;
export interface EventFilter {
  category?: EventCategory | EventCategory[];
  level?: EventLevel | EventLevel[];
  type?: string | RegExp;
}

// ============================================================
// 2. Ring Buffer
// ============================================================

class RingBuffer<T> {
  private buffer: T[];
  private head = 0;
  private _size = 0;

  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this._size < this.capacity) this._size++;
  }

  toArray(): T[] {
    if (this._size < this.capacity) {
      return this.buffer.slice(0, this._size);
    }

    // When full, read from head (oldest) to end, then wrap to beginning
    return [
      ...this.buffer.slice(this.head),
      ...this.buffer.slice(0, this.head),
    ];
  }

  get size(): number { return this._size; }

  last(n: number): T[] {
    const arr = this.toArray();

    return arr.slice(-n);
  }

  clear(): void {
    this.head = 0;
    this._size = 0;
  }
}

// ============================================================
// 3. Event Bus Core
// ============================================================

let _idCounter = 0;

function nextId(): string {
  return `evt-${Date.now().toString(36)}-${(++_idCounter).toString(36)}`;
}

class EventBus {
  private subscribers = new Map<string, { fn: EventSubscriber; filter?: EventFilter }>();
  private history: RingBuffer<BusEvent>;
  private _version = 0; // snapshot version for useSyncExternalStore
  private _snapshotListeners = new Set<() => void>();

  constructor(bufferSize = 500) {
    this.history = new RingBuffer<BusEvent>(bufferSize);
  }

  // --- Publish ---

  emit(event: Omit<BusEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): BusEvent {
    const full: BusEvent = {
      id: event.id || nextId(),
      timestamp: event.timestamp || new Date().toISOString(),
      ...event,
    };

    this.history.push(full);
    this._version++;

    // Notify all matching subscribers
    for (const sub of this.subscribers.values()) {
      if (this.matchFilter(full, sub.filter)) {
        try { sub.fn(full); } catch { /* subscriber errors don't crash bus */ }
      }
    }

    // Notify snapshot listeners (for useSyncExternalStore)
    for (const listener of this._snapshotListeners) {
      try { listener(); } catch { /* ignore */ }
    }

    return full;
  }

  // Convenience emitters

  persist(type: string, message: string, level: EventLevel = 'info', metadata?: Record<string, unknown>): BusEvent {
    return this.emit({ category: 'persist', type: `persist.${type}`, level, source: 'PersistEngine', message, metadata });
  }

  orchestrate(type: string, message: string, level: EventLevel = 'info', metadata?: Record<string, unknown>): BusEvent {
    return this.emit({ category: 'orchestrate', type: `orchestrate.${type}`, level, source: 'Orchestrator', message, metadata });
  }

  mcp(type: string, message: string, level: EventLevel = 'info', metadata?: Record<string, unknown>): BusEvent {
    return this.emit({ category: 'mcp', type: `mcp.${type}`, level, source: 'MCP', message, metadata });
  }

  system(type: string, message: string, level: EventLevel = 'info', metadata?: Record<string, unknown>): BusEvent {
    return this.emit({ category: 'system', type: `system.${type}`, level, source: 'System', message, metadata });
  }

  security(type: string, message: string, level: EventLevel = 'warn', metadata?: Record<string, unknown>): BusEvent {
    return this.emit({ category: 'security', type: `security.${type}`, level, source: 'Sentinel', message, metadata });
  }

  // --- Subscribe ---

  on(fn: EventSubscriber, filter?: EventFilter): string {
    const id = nextId();

    this.subscribers.set(id, { fn, filter });

    return id;
  }

  off(subscriptionId: string): void {
    this.subscribers.delete(subscriptionId);
  }

  // --- Query ---

  getHistory(n?: number): BusEvent[] {
    return n ? this.history.last(n) : this.history.toArray();
  }

  getByCategory(category: EventCategory, n = 50): BusEvent[] {
    return this.history.toArray().filter(e => e.category === category).slice(-n);
  }

  get version(): number { return this._version; }
  get totalEvents(): number { return this.history.size; }

  clear(): void {
    this.history.clear();
    this._version++;
    for (const listener of this._snapshotListeners) {
      try { listener(); } catch { /* ignore */ }
    }
  }

  // --- useSyncExternalStore support ---

  subscribe(listener: () => void): () => void {
    this._snapshotListeners.add(listener);

    return () => { this._snapshotListeners.delete(listener); };
  }

  getSnapshot(): number {
    return this._version;
  }

  // --- Internal ---

  private matchFilter(event: BusEvent, filter?: EventFilter): boolean {
    if (!filter) return true;

    if (filter.category) {
      const cats = Array.isArray(filter.category) ? filter.category : [filter.category];

      if (!cats.includes(event.category)) return false;
    }

    if (filter.level) {
      const levels = Array.isArray(filter.level) ? filter.level : [filter.level];

      if (!levels.includes(event.level)) return false;
    }

    if (filter.type) {
      if (typeof filter.type === 'string') {
        if (!event.type.includes(filter.type)) return false;
      } else {
        if (!filter.type.test(event.type)) return false;
      }
    }

    return true;
  }
}

// ============================================================
// 4. Global Singleton
// ============================================================

export const eventBus = new EventBus(500);

// ============================================================
// 5. React Hook: useEventBus()
// ============================================================

/**
 * Subscribe to EventBus events reactively.
 *
 * @param filter - Optional filter by category/level/type
 * @param maxItems - Maximum number of events to keep in state (default: 100)
 * @returns Array of matching BusEvent objects (newest last)
 */
export function useEventBus(filter?: EventFilter, maxItems = 100): BusEvent[] {
  const filterRef = useRef(filter);

  filterRef.current = filter;

  const [events, setEvents] = useState<BusEvent[]>([]);

  useEffect(() => {
    // Load initial history
    const history = eventBus.getHistory();
    const filtered = filter
      ? history.filter(e => matchFilterStatic(e, filter))
      : history;

    setEvents(filtered.slice(-maxItems));

    // Subscribe to new events
    const subId = eventBus.on(event => {
      setEvents(prev => {
        const next = [...prev, event];

        return next.length > maxItems ? next.slice(-maxItems) : next;
      });
    }, filterRef.current);

    return () => { eventBus.off(subId); };
  }, [
    // Stringify filter to detect changes
    filter?.category?.toString(),
    filter?.level?.toString(),
    filter?.type?.toString(),
    maxItems,
  ]);

  return events;
}

/**
 * useEventBusVersion — lightweight hook that re-renders when any event is emitted.
 * Use with eventBus.getHistory() for manual reads.
 */
export function useEventBusVersion(): number {
  return useSyncExternalStore(
    listener => eventBus.subscribe(listener),
    () => eventBus.getSnapshot(),
  );
}

// Static filter matcher (no class context needed)
function matchFilterStatic(event: BusEvent, filter: EventFilter): boolean {
  if (filter.category) {
    const cats = Array.isArray(filter.category) ? filter.category : [filter.category];

    if (!cats.includes(event.category)) return false;
  }
  if (filter.level) {
    const levels = Array.isArray(filter.level) ? filter.level : [filter.level];

    if (!levels.includes(event.level)) return false;
  }
  if (filter.type) {
    if (typeof filter.type === 'string') {
      if (!event.type.includes(filter.type)) return false;
    } else {
      if (!filter.type.test(event.type)) return false;
    }
  }

  return true;
}

// ============================================================
// 6. Dimension Labels (for UI display)
// ============================================================

export const EVENT_CATEGORY_META: Record<EventCategory, {
  label: string;
  labelZh: string;
  dimension: string;
  color: string;
  bgColor: string;
}> = {
  orchestrate: { label: 'Intelligence', labelZh: '智能维', dimension: 'D1', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  persist: { label: 'Data', labelZh: '数据维', dimension: 'D2', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  mcp: { label: 'Architecture', labelZh: '架构维', dimension: 'D3', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  ui: { label: 'Experience', labelZh: '体验维', dimension: 'D4', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  security: { label: 'Security', labelZh: '安全维', dimension: 'D5', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  system: { label: 'System', labelZh: '系统层', dimension: 'SYS', color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
};
