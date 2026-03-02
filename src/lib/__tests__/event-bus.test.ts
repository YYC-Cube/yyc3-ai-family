// ============================================================
// YYC3 Hacker Chatbot — Event Bus Unit Tests (Vitest)
// Phase P0: Core Module Test Coverage
//
// Tests: RingBuffer, EventBus emit/subscribe, event filtering,
//        history management, React hooks, category emitters.
//
// Run: npx vitest run src/lib/__tests__/event-bus.test.ts
// ============================================================

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  eventBus,
  useEventBus,
  useEventBusVersion,
  EVENT_CATEGORY_META,
  type BusEvent,
  type EventCategory,
  type EventFilter,
} from '../event-bus';

// Import RingBuffer via internal access for testing
// Note: RingBuffer is not exported, so we test via eventBus.getHistory()

// ============================================================
// Setup / Teardown
// ============================================================

beforeEach(() => {
  // Clear event bus history between tests
  eventBus.clear();
});

// ============================================================
// Suite 1: Event History (RingBuffer functionality via eventBus)
// ============================================================

describe('Event Bus — Event History', () => {
  it('EB-01: getHistory returns all events', () => {
    eventBus.emit({ category: 'system', type: 'test1', level: 'info', source: 'Test', message: 'Event 1' });
    eventBus.emit({ category: 'system', type: 'test2', level: 'info', source: 'Test', message: 'Event 2' });
    eventBus.emit({ category: 'system', type: 'test3', level: 'info', source: 'Test', message: 'Event 3' });

    const history = eventBus.getHistory();

    expect(history).toHaveLength(3);
    expect(history.map(h => h.message)).toEqual(['Event 1', 'Event 2', 'Event 3']);
  });

  it('EB-02: getHistory(n) returns last n events', () => {
    for (let i = 1; i <= 10; i++) {
      eventBus.emit({ category: 'system', type: `test${i}`, level: 'info', source: 'Test', message: `Event ${i}` });
    }

    const history = eventBus.getHistory(5);

    expect(history).toHaveLength(5);
    expect(history.map(h => h.message)).toEqual(['Event 6', 'Event 7', 'Event 8', 'Event 9', 'Event 10']);
  });

  it('EB-03: history respects buffer capacity (500)', () => {
    // Emit 600 events
    for (let i = 0; i < 600; i++) {
      eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: `Event ${i}` });
    }

    const history = eventBus.getHistory();

    expect(history.length).toBeLessThanOrEqual(500);
  });

  it('EB-04: clear removes all history', () => {
    eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: 'Event 1' });
    eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: 'Event 2' });

    expect(eventBus.getHistory()).toHaveLength(2);

    eventBus.clear();

    expect(eventBus.getHistory()).toHaveLength(0);
  });
});

// ============================================================
// Suite 2: EventBus Emit & Subscribe
// ============================================================

describe('Event Bus — Emit & Subscribe', () => {
  it('EB-10: emit creates event with id and timestamp', () => {
    const event = eventBus.emit({
      category: 'system',
      type: 'system.test',
      level: 'info',
      source: 'Test',
      message: 'Test event',
    });

    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeDefined();
    expect(event.category).toBe('system');
    expect(event.type).toBe('system.test');
    expect(event.level).toBe('info');
    expect(event.source).toBe('Test');
    expect(event.message).toBe('Test event');
  });

  it('EB-11: emit notifies subscribers', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber);

    eventBus.emit({
      category: 'system',
      type: 'system.test',
      level: 'info',
      source: 'Test',
      message: 'Test event',
    });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber.mock.calls[0][0].message).toBe('Test event');

    eventBus.off(subId);
  });

  it('EB-12: emit with custom id and timestamp', () => {
    const customId = 'custom-id-123';
    const customTimestamp = '2026-03-01T12:00:00Z';

    const event = eventBus.emit({
      id: customId,
      timestamp: customTimestamp,
      category: 'system',
      type: 'system.test',
      level: 'info',
      source: 'Test',
      message: 'Test event',
    });

    expect(event.id).toBe(customId);
    expect(event.timestamp).toBe(customTimestamp);
  });

  it('EB-13: subscriber errors do not crash bus', () => {
    const errorSubscriber = () => {
      throw new Error('Subscriber error');
    };
    const normalSubscriber = vi.fn();

    const subId1 = eventBus.on(errorSubscriber);
    const subId2 = eventBus.on(normalSubscriber);

    expect(() => {
      eventBus.emit({
        category: 'system',
        type: 'system.test',
        level: 'info',
        source: 'Test',
        message: 'Test event',
      });
    }).not.toThrow();

    expect(normalSubscriber).toHaveBeenCalledTimes(1);

    eventBus.off(subId1);
    eventBus.off(subId2);
  });

  it('EB-14: multiple subscribers receive same event', () => {
    const subscriber1 = vi.fn();
    const subscriber2 = vi.fn();
    const subscriber3 = vi.fn();

    const subId1 = eventBus.on(subscriber1);
    const subId2 = eventBus.on(subscriber2);
    const subId3 = eventBus.on(subscriber3);

    eventBus.emit({
      category: 'system',
      type: 'system.test',
      level: 'info',
      source: 'Test',
      message: 'Broadcast test',
    });

    expect(subscriber1).toHaveBeenCalledTimes(1);
    expect(subscriber2).toHaveBeenCalledTimes(1);
    expect(subscriber3).toHaveBeenCalledTimes(1);

    eventBus.off(subId1);
    eventBus.off(subId2);
    eventBus.off(subId3);
  });
});

// ============================================================
// Suite 3: Event Filtering
// ============================================================

describe('Event Bus — Event Filtering', () => {
  it('EB-15: filter by category', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { category: 'persist' });

    eventBus.emit({
      category: 'persist',
      type: 'persist.write',
      level: 'info',
      source: 'Test',
      message: 'Persist event',
    });

    eventBus.emit({
      category: 'system',
      type: 'system.test',
      level: 'info',
      source: 'Test',
      message: 'System event',
    });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber.mock.calls[0][0].category).toBe('persist');

    eventBus.off(subId);
  });

  it('EB-16: filter by multiple categories', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { category: ['persist', 'mcp'] });

    eventBus.emit({ category: 'persist', type: 'persist.write', level: 'info', source: 'Test', message: 'Persist' });
    eventBus.emit({ category: 'mcp', type: 'mcp.call', level: 'info', source: 'Test', message: 'MCP' });
    eventBus.emit({ category: 'system', type: 'system.test', level: 'info', source: 'Test', message: 'System' });

    expect(subscriber).toHaveBeenCalledTimes(2);

    eventBus.off(subId);
  });

  it('EB-17: filter by level', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { level: 'error' });

    eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: 'Info' });
    eventBus.emit({ category: 'system', type: 'test', level: 'error', source: 'Test', message: 'Error' });
    eventBus.emit({ category: 'system', type: 'test', level: 'warn', source: 'Test', message: 'Warn' });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber.mock.calls[0][0].level).toBe('error');

    eventBus.off(subId);
  });

  it('EB-18: filter by type string', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { type: 'write' });

    eventBus.emit({ category: 'persist', type: 'persist.write', level: 'info', source: 'Test', message: 'Write' });
    eventBus.emit({ category: 'persist', type: 'persist.read', level: 'info', source: 'Test', message: 'Read' });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber.mock.calls[0][0].type).toBe('persist.write');

    eventBus.off(subId);
  });

  it('EB-19: filter by type regex', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { type: /^persist\./ });

    eventBus.emit({ category: 'persist', type: 'persist.write', level: 'info', source: 'Test', message: 'Write' });
    eventBus.emit({ category: 'persist', type: 'persist.read', level: 'info', source: 'Test', message: 'Read' });
    eventBus.emit({ category: 'mcp', type: 'mcp.call', level: 'info', source: 'Test', message: 'Call' });

    expect(subscriber).toHaveBeenCalledTimes(2);

    eventBus.off(subId);
  });

  it('EB-20: combined filters', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { category: 'persist', level: 'info' });

    eventBus.emit({ category: 'persist', type: 'persist.write', level: 'info', source: 'Test', message: 'Match' });
    eventBus.emit({ category: 'persist', type: 'persist.write', level: 'error', source: 'Test', message: 'Wrong level' });
    eventBus.emit({ category: 'mcp', type: 'mcp.call', level: 'info', source: 'Test', message: 'Wrong category' });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber.mock.calls[0][0].message).toBe('Match');

    eventBus.off(subId);
  });
});

// ============================================================
// Suite 4: Event History
// ============================================================

describe('Event Bus — History', () => {
  it('EB-21: getHistory returns all events', () => {
    eventBus.emit({ category: 'system', type: 'test1', level: 'info', source: 'Test', message: 'Event 1' });
    eventBus.emit({ category: 'system', type: 'test2', level: 'info', source: 'Test', message: 'Event 2' });
    eventBus.emit({ category: 'system', type: 'test3', level: 'info', source: 'Test', message: 'Event 3' });

    const history = eventBus.getHistory();

    expect(history).toHaveLength(3);
    expect(history.map(h => h.message)).toEqual(['Event 1', 'Event 2', 'Event 3']);
  });

  it('EB-22: getHistory(n) returns last n events', () => {
    for (let i = 1; i <= 10; i++) {
      eventBus.emit({ category: 'system', type: `test${i}`, level: 'info', source: 'Test', message: `Event ${i}` });
    }

    const history = eventBus.getHistory(5);

    expect(history).toHaveLength(5);
    expect(history.map(h => h.message)).toEqual(['Event 6', 'Event 7', 'Event 8', 'Event 9', 'Event 10']);
  });

  it('EB-23: getByCategory returns filtered events', () => {
    eventBus.emit({ category: 'persist', type: 'persist.write', level: 'info', source: 'Test', message: 'Persist 1' });
    eventBus.emit({ category: 'system', type: 'system.test', level: 'info', source: 'Test', message: 'System 1' });
    eventBus.emit({ category: 'persist', type: 'persist.read', level: 'info', source: 'Test', message: 'Persist 2' });
    eventBus.emit({ category: 'mcp', type: 'mcp.call', level: 'info', source: 'Test', message: 'MCP 1' });

    const persistEvents = eventBus.getByCategory('persist');

    expect(persistEvents).toHaveLength(2);
    expect(persistEvents.every(e => e.category === 'persist')).toBe(true);
  });

  it('EB-24: history respects buffer capacity (500)', () => {
    // Emit 600 events
    for (let i = 0; i < 600; i++) {
      eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: `Event ${i}` });
    }

    const history = eventBus.getHistory();

    expect(history.length).toBeLessThanOrEqual(500);
  });

  it('EB-25: clear removes all history', () => {
    eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: 'Event 1' });
    eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: 'Event 2' });

    expect(eventBus.getHistory()).toHaveLength(2);

    eventBus.clear();

    expect(eventBus.getHistory()).toHaveLength(0);
  });
});

// ============================================================
// Suite 5: Convenience Emitters
// ============================================================

describe('Event Bus — Convenience Emitters', () => {
  it('EB-26: persist emitter', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { category: 'persist' });

    eventBus.persist('write', 'Data persisted', 'info', { domain: 'test' });

    expect(subscriber).toHaveBeenCalledTimes(1);
    const event = subscriber.mock.calls[0][0];

    expect(event.category).toBe('persist');
    expect(event.type).toBe('persist.write');
    expect(event.message).toBe('Data persisted');
    expect(event.metadata?.domain).toBe('test');

    eventBus.off(subId);
  });

  it('EB-27: orchestrate emitter', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { category: 'orchestrate' });

    eventBus.orchestrate('agent_started', 'Agent navigator started', 'info', { agentId: 'navigator' });

    expect(subscriber).toHaveBeenCalledTimes(1);
    const event = subscriber.mock.calls[0][0];

    expect(event.category).toBe('orchestrate');
    expect(event.type).toBe('orchestrate.agent_started');
    expect(event.source).toBe('Orchestrator');

    eventBus.off(subId);
  });

  it('EB-28: mcp emitter', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { category: 'mcp' });

    eventBus.mcp('tool_call', 'Called filesystem tool', 'info');

    expect(subscriber).toHaveBeenCalledTimes(1);
    const event = subscriber.mock.calls[0][0];

    expect(event.category).toBe('mcp');
    expect(event.type).toBe('mcp.tool_call');
    expect(event.source).toBe('MCP');

    eventBus.off(subId);
  });

  it('EB-29: system emitter', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { category: 'system' });

    eventBus.system('diagnosis.start', 'Starting diagnosis', 'warn');

    expect(subscriber).toHaveBeenCalledTimes(1);
    const event = subscriber.mock.calls[0][0];

    expect(event.category).toBe('system');
    expect(event.type).toBe('system.diagnosis.start');
    expect(event.source).toBe('System');

    eventBus.off(subId);
  });

  it('EB-30: security emitter', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber, { category: 'security' });

    eventBus.security('audit', 'Security audit complete', 'warn', { findings: 0 });

    expect(subscriber).toHaveBeenCalledTimes(1);
    const event = subscriber.mock.calls[0][0];

    expect(event.category).toBe('security');
    expect(event.type).toBe('security.audit');
    expect(event.source).toBe('Sentinel');
    expect(event.level).toBe('warn');

    eventBus.off(subId);
  });
});

// ============================================================
// Suite 6: Version & Snapshot
// ============================================================

describe('Event Bus — Version & Snapshot', () => {
  it('EB-31: version increments on emit', () => {
    const initialVersion = eventBus.version;

    eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: 'Event' });

    expect(eventBus.version).toBe(initialVersion + 1);
  });

  it('EB-32: version increments on clear', () => {
    const initialVersion = eventBus.version;

    eventBus.clear();

    expect(eventBus.version).toBeGreaterThan(initialVersion);
  });

  it('EB-33: getSnapshot returns current version', () => {
    const snapshot = eventBus.getSnapshot();

    expect(snapshot).toBe(eventBus.version);
  });

  it('EB-34: subscribe notifies on version change', () => {
    const listener = vi.fn();
    const unsubscribe = eventBus.subscribe(listener);

    eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: 'Event' });

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();

    eventBus.emit({ category: 'system', type: 'test2', level: 'info', source: 'Test', message: 'Event 2' });

    // Should not be called after unsubscribe
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// Suite 7: Event Category Metadata
// ============================================================

describe('Event Bus — Category Metadata', () => {
  it('EB-35: all categories have metadata', () => {
    const categories: EventCategory[] = ['persist', 'orchestrate', 'mcp', 'ui', 'security', 'system'];

    for (const category of categories) {
      const meta = EVENT_CATEGORY_META[category];

      expect(meta).toBeDefined();
      expect(meta.label).toBeTruthy();
      expect(meta.labelZh).toBeTruthy();
      expect(meta.dimension).toBeTruthy();
      expect(meta.color).toBeTruthy();
      expect(meta.bgColor).toBeTruthy();
    }
  });

  it('EB-36: persist category has correct metadata', () => {
    const meta = EVENT_CATEGORY_META.persist;

    expect(meta.label).toBe('Data');
    expect(meta.labelZh).toBe('数据维');
    expect(meta.dimension).toBe('D2');
  });

  it('EB-37: orchestrate category has correct metadata', () => {
    const meta = EVENT_CATEGORY_META.orchestrate;

    expect(meta.label).toBe('Intelligence');
    expect(meta.labelZh).toBe('智能维');
    expect(meta.dimension).toBe('D1');
  });

  it('EB-38: security category has correct metadata', () => {
    const meta = EVENT_CATEGORY_META.security;

    expect(meta.label).toBe('Security');
    expect(meta.labelZh).toBe('安全维');
    expect(meta.dimension).toBe('D5');
  });
});

// ============================================================
// Suite 8: Edge Cases
// ============================================================

describe('Event Bus — Edge Cases', () => {
  it('EB-39: handles empty message', () => {
    const event = eventBus.emit({
      category: 'system',
      type: 'test',
      level: 'info',
      source: 'Test',
      message: '',
    });

    expect(event.message).toBe('');
  });

  it('EB-40: handles undefined metadata', () => {
    const event = eventBus.emit({
      category: 'system',
      type: 'test',
      level: 'info',
      source: 'Test',
      message: 'Test',
    });

    expect(event.metadata).toBeUndefined();
  });

  it('EB-41: handles complex metadata', () => {
    const complexMetadata = {
      nested: { object: { value: 42 } },
      array: [1, 2, 3],
      date: new Date().toISOString(),
    };

    const event = eventBus.emit({
      category: 'system',
      type: 'test',
      level: 'info',
      source: 'Test',
      message: 'Test',
      metadata: complexMetadata,
    });

    expect(event.metadata).toEqual(complexMetadata);
  });

  it('EB-42: off non-existent subscription is no-op', () => {
    expect(() => {
      eventBus.off('non-existent-id');
    }).not.toThrow();
  });

  it('EB-43: getHistory by category with no matches returns empty', () => {
    eventBus.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: 'Event' });

    const persistEvents = eventBus.getByCategory('persist');

    expect(persistEvents).toEqual([]);
  });
});

// ============================================================
// Suite 9: React Hooks (Mock Tests)
// ============================================================

describe('Event Bus — React Hooks', () => {
  it('EB-44: useEventBusVersion returns version number', () => {
    // Note: This is a simplified test since we can't fully test React hooks
    // without a proper React testing environment
    const version = eventBus.getSnapshot();

    expect(typeof version).toBe('number');
    expect(version).toBeGreaterThanOrEqual(0);
  });

  it('EB-45: useEventBus filter function exists', () => {
    // Verify the function is exported and callable
    expect(typeof useEventBus).toBe('function');
  });

  it('EB-46: useEventBusVersion hook exists', () => {
    expect(typeof useEventBusVersion).toBe('function');
  });
});

// ============================================================
// Suite 10: Integration Scenarios
// ============================================================

describe('Event Bus — Integration Scenarios', () => {
  it('EB-47: full workflow: emit → filter → history', () => {
    const persistSubscriber = vi.fn();
    const errorSubscriber = vi.fn();

    const subId1 = eventBus.on(persistSubscriber, { category: 'persist', level: 'info' });
    const subId2 = eventBus.on(errorSubscriber, { level: 'error' });

    // Emit various events
    eventBus.persist('write', 'Data written', 'info');
    eventBus.persist('read', 'Data read', 'info');
    eventBus.security('violation', 'Security violation detected', 'error');
    eventBus.system('startup', 'System started', 'info');

    // Check subscribers
    expect(persistSubscriber).toHaveBeenCalledTimes(2);
    expect(errorSubscriber).toHaveBeenCalledTimes(1);

    // Check history
    const history = eventBus.getHistory();

    expect(history).toHaveLength(4);

    // Check filtered history
    const persistEvents = eventBus.getByCategory('persist');

    expect(persistEvents).toHaveLength(2);

    // Cleanup
    eventBus.off(subId1);
    eventBus.off(subId2);
  });

  it('EB-48: high volume event processing', () => {
    const subscriber = vi.fn();
    const subId = eventBus.on(subscriber);

    // Emit 100 events rapidly
    for (let i = 0; i < 100; i++) {
      eventBus.emit({
        category: 'system',
        type: 'bulk_test',
        level: 'info',
        source: 'Test',
        message: `Bulk event ${i}`,
      });
    }

    expect(subscriber).toHaveBeenCalledTimes(100);

    eventBus.off(subId);
  });

  it('EB-49: event bus singleton consistency', () => {
    // Verify eventBus is a singleton
    const eventBus1 = eventBus;
    const eventBus2 = eventBus;

    expect(eventBus1).toBe(eventBus2);

    // Emit from one reference
    eventBus1.emit({ category: 'system', type: 'test', level: 'info', source: 'Test', message: 'Test' });

    // Verify other reference sees the event
    expect(eventBus2.getHistory()).toHaveLength(1);
  });

  it('EB-50: five dimensions workflow', () => {
    const allEvents: BusEvent[] = [];
    const subId = eventBus.on(event => allEvents.push(event));

    // D1: Intelligence
    eventBus.orchestrate('task_start', 'Task started', 'info');

    // D2: Data
    eventBus.persist('checkpoint', 'State saved', 'info');

    // D3: Architecture
    eventBus.mcp('tool_executed', 'MCP tool executed', 'info');

    // D4: Experience
    eventBus.emit({ category: 'ui', type: 'ui.navigate', level: 'info', source: 'UI', message: 'Navigation' });

    // D5: Security
    eventBus.security('scan_complete', 'Security scan complete', 'success');

    // System
    eventBus.system('health_check', 'Health check passed', 'info');

    expect(allEvents).toHaveLength(6);
    expect(allEvents.map(e => e.category)).toEqual([
      'orchestrate',
      'persist',
      'mcp',
      'ui',
      'security',
      'system',
    ]);

    eventBus.off(subId);
  });
});
