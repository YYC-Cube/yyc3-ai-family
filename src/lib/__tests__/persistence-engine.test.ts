// ============================================================
// YYC3 Hacker Chatbot — Persistence Engine Unit Tests (Vitest)
// Phase 48: Test Coverage Enhancement (P1)
//
// Tests: LocalStorageAdapter CRUD, PersistenceEngine read/write,
//        snapshot creation/restoration, export/import, config
//        management, event system, sync queue, domain utilities.
//
// Run: npx vitest run src/lib/__tests__/persistence-engine.test.ts
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';

import {
  LocalStorageAdapter,
  getPersistenceEngine,
  loadEngineConfig,
  saveEngineConfig,
  getDomainStorageKey,
  type PersistEvent,
  type PersistenceEngineConfig,
} from '../persistence-engine';

const LS_PREFIX = 'yyc3-persist-';
const ENGINE_CONFIG_KEY = 'yyc3-persistence-config';

// ============================================================
// Setup
// ============================================================

beforeEach(() => {
  // Clean all yyc3 persistence keys
  const keys = Object.keys(localStorage).filter(k =>
    k.startsWith('yyc3-persist-') || k === ENGINE_CONFIG_KEY || k === 'yyc3-snapshots',
  );

  keys.forEach(k => localStorage.removeItem(k));
});

// ============================================================
// Suite 1: LocalStorageAdapter — CRUD
// ============================================================

describe('LocalStorageAdapter — CRUD', () => {
  const adapter = new LocalStorageAdapter();

  beforeEach(() => {
    localStorage.removeItem(`${LS_PREFIX}chat_sessions`);
    localStorage.removeItem(`${LS_PREFIX}system_logs`);
    localStorage.removeItem(`${LS_PREFIX}metrics_snapshots`);
    localStorage.removeItem(`${LS_PREFIX}preferences`);
  });

  it('PE-01: read returns empty array when no data', async () => {
    const data = await adapter.read('chat_sessions');

    expect(data).toEqual([]);
  });

  it('PE-02: write + read round-trip', async () => {
    const records = [
      { id: 'sess-1', title: 'Test Session', messages: [] },
      { id: 'sess-2', title: 'Another', messages: [] },
    ];

    await adapter.write('chat_sessions', records);
    const loaded = await adapter.read('chat_sessions');

    expect(loaded).toHaveLength(2);
    expect((loaded[0] as Record<string, unknown>).id).toBe('sess-1');
  });

  it('PE-03: append adds record to existing', async () => {
    await adapter.write('system_logs', [{ id: 'log-1', message: 'first' }]);
    await adapter.append('system_logs', { id: 'log-2', message: 'second' });
    const logs = await adapter.read('system_logs');

    expect(logs).toHaveLength(2);
  });

  it('PE-04: append to empty domain', async () => {
    await adapter.append('chat_sessions', { id: 'sess-1', title: 'New' });
    const data = await adapter.read('chat_sessions');

    expect(data).toHaveLength(1);
  });

  it('PE-05: append trims metrics to 500', async () => {
    const bulk = Array.from({ length: 510 }, (_, i) => ({ id: `m-${i}`, value: i }));

    await adapter.write('metrics_snapshots', bulk);
    await adapter.append('metrics_snapshots', { id: 'm-510', value: 510 });
    const data = await adapter.read('metrics_snapshots');

    // The append reads existing (510), pushes (511), then slices to last 500
    expect(data.length).toBeLessThanOrEqual(500);
  });

  it('PE-06: remove deletes by id', async () => {
    await adapter.write('chat_sessions', [
      { id: 's1', title: 'Keep' },
      { id: 's2', title: 'Remove' },
      { id: 's3', title: 'Keep' },
    ]);
    await adapter.remove('chat_sessions', 's2');
    const data = await adapter.read('chat_sessions');

    expect(data).toHaveLength(2);
    expect(data.every(r => (r as Record<string, unknown>).id !== 's2')).toBe(true);
  });

  it('PE-07: remove non-existent id is no-op', async () => {
    await adapter.write('chat_sessions', [{ id: 's1', title: 'Keep' }]);
    await adapter.remove('chat_sessions', 'non-existent');
    const data = await adapter.read('chat_sessions');

    expect(data).toHaveLength(1);
  });

  it('PE-08: clear removes domain data', async () => {
    await adapter.write('chat_sessions', [{ id: 's1' }]);
    await adapter.clear('chat_sessions');
    const data = await adapter.read('chat_sessions');

    expect(data).toEqual([]);
    expect(localStorage.getItem(`${LS_PREFIX}chat_sessions`)).toBeNull();
  });

  it('PE-09: adapter name and isOnline', () => {
    expect(adapter.name).toBe('localStorage');
    expect(adapter.isOnline).toBe(true);
  });

  it('PE-10: ping returns true', async () => {
    const ok = await adapter.ping();

    expect(ok).toBe(true);
  });
});

// ============================================================
// Suite 2: LocalStorageAdapter — getStats
// ============================================================

describe('LocalStorageAdapter — getStats', () => {
  const adapter = new LocalStorageAdapter();

  beforeEach(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(LS_PREFIX));

    keys.forEach(k => localStorage.removeItem(k));
  });

  it('PE-11: getStats returns zero when empty', async () => {
    const stats = await adapter.getStats();

    expect(stats.totalRecords).toBe(0);
    expect(stats.totalSizeKB).toBe(0);
    expect(stats.adapter).toBe('localStorage');
    expect(stats.isOnline).toBe(true);
    expect(stats.pendingSyncs).toBe(0);
  });

  it('PE-12: getStats counts records across domains', async () => {
    await adapter.write('chat_sessions', [{ id: 's1' }, { id: 's2' }]);
    await adapter.write('system_logs', [{ id: 'l1' }]);
    const stats = await adapter.getStats();

    expect(stats.totalRecords).toBe(3);
    expect(stats.domainCounts['chat_sessions']).toBe(2);
    expect(stats.domainCounts['system_logs']).toBe(1);
    expect(stats.totalSizeKB).toBeGreaterThan(0);
  });
});

// ============================================================
// Suite 3: PersistenceEngine — Core Operations
// ============================================================

describe('PersistenceEngine — Core Operations', () => {
  beforeEach(() => {
    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith(LS_PREFIX) || k === ENGINE_CONFIG_KEY,
    );

    keys.forEach(k => localStorage.removeItem(k));
  });

  it('PE-13: engine reads from localStorage', async () => {
    const engine = getPersistenceEngine();

    localStorage.setItem(`${LS_PREFIX}preferences`, JSON.stringify([{ theme: 'dark' }]));
    const data = await engine.read('preferences');

    expect(data).toHaveLength(1);
    expect((data[0] as Record<string, unknown>).theme).toBe('dark');
  });

  it('PE-14: engine writes to localStorage', async () => {
    const engine = getPersistenceEngine();

    await engine.write('chat_sessions', [{ id: 'test', title: 'Test' }]);
    const raw = localStorage.getItem(`${LS_PREFIX}chat_sessions`);

    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toHaveLength(1);
  });

  it('PE-15: engine append adds record', async () => {
    const engine = getPersistenceEngine();

    await engine.write('system_logs', [{ id: 'log-1' }]);
    await engine.append('system_logs', { id: 'log-2' });
    const data = await engine.read('system_logs');

    expect(data).toHaveLength(2);
  });

  it('PE-16: engine remove deletes by id', async () => {
    const engine = getPersistenceEngine();

    await engine.write('artifacts', [
      { id: 'a1', name: 'Keep' },
      { id: 'a2', name: 'Delete' },
    ]);
    await engine.remove('artifacts', 'a2');
    const data = await engine.read('artifacts');

    expect(data).toHaveLength(1);
    expect((data[0] as Record<string, unknown>).id).toBe('a1');
  });

  it('PE-17: engine clear empties domain', async () => {
    const engine = getPersistenceEngine();

    await engine.write('templates', [{ id: 't1' }, { id: 't2' }]);
    await engine.clear('templates');
    const data = await engine.read('templates');

    expect(data).toEqual([]);
  });
});

// ============================================================
// Suite 4: PersistenceEngine — Event System
// ============================================================

describe('PersistenceEngine — Event System', () => {
  it('PE-18: emits write event', async () => {
    const engine = getPersistenceEngine();
    const events: PersistEvent[] = [];
    const unsub = engine.on(e => events.push(e));

    await engine.write('chat_sessions', [{ id: '1' }, { id: '2' }]);
    unsub();
    const writeEvent = events.find(e => e.type === 'write');

    expect(writeEvent).toBeDefined();
    expect(writeEvent!.type).toBe('write');
    if (writeEvent!.type === 'write') {
      expect(writeEvent!.domain).toBe('chat_sessions');
      expect(writeEvent!.recordCount).toBe(2);
    }
  });

  it('PE-19: emits append event', async () => {
    const engine = getPersistenceEngine();
    const events: PersistEvent[] = [];
    const unsub = engine.on(e => events.push(e));

    await engine.append('system_logs', { id: 'log-1' });
    unsub();
    const appendEvent = events.find(e => e.type === 'append');

    expect(appendEvent).toBeDefined();
  });

  it('PE-20: emits clear event', async () => {
    const engine = getPersistenceEngine();
    const events: PersistEvent[] = [];
    const unsub = engine.on(e => events.push(e));

    await engine.clear('workflows');
    unsub();
    const clearEvent = events.find(e => e.type === 'clear');

    expect(clearEvent).toBeDefined();
    if (clearEvent!.type === 'clear') {
      expect(clearEvent!.domain).toBe('workflows');
    }
  });

  it('PE-21: unsubscribe stops events', async () => {
    const engine = getPersistenceEngine();
    const events: PersistEvent[] = [];
    const unsub = engine.on(e => events.push(e));

    await engine.write('preferences', [{ id: '1' }]);
    unsub();
    await engine.write('preferences', [{ id: '2' }]); // after unsub
    expect(events).toHaveLength(1);
  });
});

// ============================================================
// Suite 5: PersistenceEngine — Snapshots
// ============================================================

describe('PersistenceEngine — Snapshots', () => {
  beforeEach(() => {
    localStorage.removeItem('yyc3-snapshots');
    const keys = Object.keys(localStorage).filter(k => k.startsWith(LS_PREFIX));

    keys.forEach(k => localStorage.removeItem(k));
  });

  it('PE-22: createSnapshot captures data', async () => {
    const engine = getPersistenceEngine();

    await engine.write('chat_sessions', [{ id: 's1', title: 'Test' }]);
    await engine.write('preferences', [{ language: 'zh' }]);
    const snapshot = await engine.createSnapshot(['chat_sessions', 'preferences']);

    expect(snapshot.id).toMatch(/^snap-/);
    expect(snapshot.domains).toContain('chat_sessions');
    expect(snapshot.domains).toContain('preferences');
    expect(snapshot.data['chat_sessions']).toHaveLength(1);
    expect(snapshot.metadata.totalRecords).toBe(2);
    expect(snapshot.metadata.sizeBytes).toBeGreaterThan(0);
  });

  it('PE-23: getSnapshots returns stored snapshots', async () => {
    const engine = getPersistenceEngine();

    await engine.createSnapshot(['chat_sessions']);
    await engine.createSnapshot(['preferences']);
    const snapshots = engine.getSnapshots();

    expect(snapshots.length).toBeGreaterThanOrEqual(2);
  });

  it('PE-24: snapshots capped at 10', async () => {
    const engine = getPersistenceEngine();

    for (let i = 0; i < 12; i++) {
      await engine.createSnapshot(['preferences']);
    }
    const snapshots = engine.getSnapshots();

    expect(snapshots.length).toBeLessThanOrEqual(10);
  });

  it('PE-25: restoreSnapshot writes data back', async () => {
    const engine = getPersistenceEngine();

    await engine.write('chat_sessions', [{ id: 'original', title: 'Original' }]);
    const snapshot = await engine.createSnapshot(['chat_sessions']);

    await engine.clear('chat_sessions');
    expect(await engine.read('chat_sessions')).toEqual([]);
    await engine.restoreSnapshot(snapshot);
    const restored = await engine.read('chat_sessions');

    expect(restored).toHaveLength(1);
    expect((restored[0] as Record<string, unknown>).id).toBe('original');
  });
});

// ============================================================
// Suite 6: PersistenceEngine — Export / Import
// ============================================================

describe('PersistenceEngine — Export / Import', () => {
  beforeEach(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('yyc3'));

    keys.forEach(k => localStorage.removeItem(k));
  });

  it('PE-26: exportToJSON includes yyc3 keys', () => {
    const engine = getPersistenceEngine();

    localStorage.setItem('yyc3-persist-preferences', JSON.stringify([{ lang: 'zh' }]));
    localStorage.setItem('yyc3-other-key', '"test"');
    const json = engine.exportToJSON();
    const parsed = JSON.parse(json);

    expect(parsed.platform).toBe('YYC3 Hacker Chatbot');
    expect(parsed.data['yyc3-persist-preferences']).toBeDefined();
    expect(parsed.data['yyc3-other-key']).toBeDefined();
    expect(parsed.exportedAt).toBeDefined();
  });

  it('PE-27: importFromJSON restores yyc3 keys', () => {
    const engine = getPersistenceEngine();
    const importData = JSON.stringify({
      data: {
        'yyc3-persist-chat_sessions': [{ id: 'imported', title: 'From Backup' }],
        'yyc3-test-config': { key: 'value' },
        'non-yyc3-key': 'should-skip',
      },
    });
    const result = engine.importFromJSON(importData);

    expect(result.imported).toBe(2);
    expect(result.errors).toHaveLength(1); // non-yyc3 key skipped
    expect(localStorage.getItem('yyc3-persist-chat_sessions')).toBeTruthy();
    expect(localStorage.getItem('yyc3-test-config')).toBeTruthy();
    expect(localStorage.getItem('non-yyc3-key')).toBeNull();
  });

  it('PE-28: importFromJSON handles invalid JSON', () => {
    const engine = getPersistenceEngine();
    const result = engine.importFromJSON('not valid json');

    expect(result.imported).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ============================================================
// Suite 7: Engine Configuration
// ============================================================

describe('PersistenceEngine — Configuration', () => {
  beforeEach(() => {
    localStorage.removeItem(ENGINE_CONFIG_KEY);
  });

  it('PE-29: loadEngineConfig returns defaults when no saved config', () => {
    const config = loadEngineConfig();

    expect(config.strategy).toBe('auto');
    expect(config.autoSaveInterval).toBe(30000);
    expect(config.maxRetries).toBe(3);
    expect(config.snapshotInterval).toBe(3600000);
  });

  it('PE-30: saveEngineConfig persists to localStorage', () => {
    const config: PersistenceEngineConfig = {
      strategy: 'dual-write',
      autoSaveInterval: 60000,
      maxRetries: 5,
      snapshotInterval: 7200000,
    };

    saveEngineConfig(config);
    const loaded = loadEngineConfig();

    expect(loaded.strategy).toBe('dual-write');
    expect(loaded.autoSaveInterval).toBe(60000);
  });

  it('PE-31: engine updateConfig merges partial updates', () => {
    const engine = getPersistenceEngine();

    engine.updateConfig({ strategy: 'nas-primary' });
    const config = engine.getConfig();

    expect(config.strategy).toBe('nas-primary');
    expect(config.maxRetries).toBe(3); // default preserved
  });
});

// ============================================================
// Suite 8: Utility Functions
// ============================================================

describe('PersistenceEngine — Utilities', () => {
  it('PE-32: getDomainStorageKey returns correct key', () => {
    expect(getDomainStorageKey('chat_sessions')).toBe('yyc3-persist-chat_sessions');
    expect(getDomainStorageKey('agent_messages')).toBe('yyc3-persist-agent_messages');
    expect(getDomainStorageKey('knowledge_base')).toBe('yyc3-persist-knowledge_base');
  });

  it('PE-33: engine properties are accessible', () => {
    const engine = getPersistenceEngine();

    expect(typeof engine.nasAvailable).toBe('boolean');
    expect(Array.isArray(engine.syncQueue)).toBe(true);
    expect(typeof engine.lastSync).toBe('number');
    expect(['auto', 'local-only', 'nas-primary', 'dual-write']).toContain(engine.strategy);
  });

  it('PE-34: flushSyncQueue with empty queue returns zero', async () => {
    const engine = getPersistenceEngine();
    const result = await engine.flushSyncQueue();

    expect(result.success).toBe(0);
    expect(result.failed).toBe(0);
  });
});

// ============================================================
// Suite 9: NAS Adapter (offline graceful degradation)
// ============================================================

describe('PersistenceEngine — NAS Offline', () => {
  it('PE-35: engine getStats works without NAS', async () => {
    const engine = getPersistenceEngine();
    const stats = await engine.getStats();

    expect(stats.adapter).toBe('localStorage');
  });

  it('PE-36: engine getNasStats returns null when NAS unavailable', async () => {
    const engine = getPersistenceEngine();
    const nasStats = await engine.getNasStats();

    expect(nasStats).toBeNull();
  });
});
