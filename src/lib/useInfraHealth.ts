import { useState, useCallback, useRef, useEffect } from 'react';
import { useSystemStore } from './store';
import { eventBus } from './event-bus';
import { loadDeviceConfigs, type DeviceConfig } from './nas-client';
import { loadProviderConfigs } from './llm-bridge';
import {
  getPgTelemetryConfig, getPgTelemetryState, writeLatencyEntry,
  migrateLatencyToPostgres, readLatencyHistory as pgReadLatency,
} from './pg-telemetry-client';
import type { PgLatencyRecord, MigrationResult } from './pg-telemetry-client';

// ============================================================
// YYC3 — Infrastructure Health Check Engine
// Phase 39: Real connectivity probes for all infrastructure
//
// Performs actual network/service health checks:
//   - Device HTTP reachability (all 4 cluster nodes)
//   - Docker Engine API ping (NAS F4-423)
//   - NAS SQLite HTTP Proxy test
//   - Ollama local LLM endpoint health
//   - PostgreSQL 15 endpoint probe (192.168.3.22:5433)
//   - Telemetry WebSocket endpoint
//   - WebCrypto API availability
//   - localStorage integrity check
//   - LLM Provider configuration audit
//   - EventBus statistics
//
// All results emit to EventBus for NeuralLinkOverlay visibility.
// Designed for CommandCenter, /health slash command, and
// dedicated InfraHealthMatrix panel.
// ============================================================

export type InfraStatus = 'unknown' | 'checking' | 'online' | 'degraded' | 'offline';

export interface InfraCheck {
  id: string;
  name: string;
  nameZh: string;
  category: 'device' | 'service' | 'runtime' | 'provider';
  status: InfraStatus;
  latencyMs?: number;
  detail?: string;
  endpoint?: string;
  lastChecked?: number;
}

export interface InfraHealthReport {
  checks: InfraCheck[];
  status: 'idle' | 'running' | 'done';
  summary: {
    total: number;
    online: number;
    degraded: number;
    offline: number;
    unknown: number;
  };
  startedAt: number;
  completedAt: number;
  totalMs: number;
}

// ============================================================
// Latency History Ring Buffer (Phase 41)
// Records latency over multiple health check scans for trending
// ============================================================

export interface LatencyHistoryEntry {
  timestamp: number;
  latencyMs: number;
  status: InfraStatus;
}

const MAX_HISTORY_ENTRIES = 30; // keep last 30 data points per check
const _latencyHistory = new Map<string, LatencyHistoryEntry[]>();

// Phase 42: Persist latency history to localStorage
const LATENCY_HISTORY_LS_KEY = 'yyc3_latency_history';

function loadPersistedLatencyHistory(): void {
  try {
    const raw = localStorage.getItem(LATENCY_HISTORY_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, LatencyHistoryEntry[]>;
      for (const [key, entries] of Object.entries(parsed)) {
        if (Array.isArray(entries)) {
          _latencyHistory.set(key, entries.slice(-MAX_HISTORY_ENTRIES));
        }
      }
    }
  } catch { /* ignore corrupt data */ }
}

function persistLatencyHistory(): void {
  try {
    const data: Record<string, LatencyHistoryEntry[]> = {};
    _latencyHistory.forEach((entries, id) => {
      data[id] = entries;
    });
    localStorage.setItem(LATENCY_HISTORY_LS_KEY, JSON.stringify(data));
  } catch { /* storage full or blocked */ }
}

// Auto-load on module init
loadPersistedLatencyHistory();

export function recordLatency(checkId: string, latencyMs: number | undefined, status: InfraStatus) {
  if (latencyMs === undefined) return;
  const history = _latencyHistory.get(checkId) || [];
  const entry: LatencyHistoryEntry = { timestamp: Date.now(), latencyMs, status };
  history.push(entry);
  if (history.length > MAX_HISTORY_ENTRIES) {
    history.splice(0, history.length - MAX_HISTORY_ENTRIES);
  }
  _latencyHistory.set(checkId, history);
  // Phase 42: Auto-persist after recording
  persistLatencyHistory();
  // Phase 43: Dual-write to PG telemetry schema if enabled
  const pgConfig = getPgTelemetryConfig();
  if (pgConfig.enabled) {
    writeLatencyEntry(checkId, entry).catch(() => {
      // Silent fail — localStorage is the primary store
    });
  }
}

export function getLatencyHistory(checkId?: string): Map<string, LatencyHistoryEntry[]> | LatencyHistoryEntry[] {
  if (checkId) return _latencyHistory.get(checkId) || [];
  return new Map(_latencyHistory);
}

export function getAllLatencyHistories(): Record<string, LatencyHistoryEntry[]> {
  const result: Record<string, LatencyHistoryEntry[]> = {};
  _latencyHistory.forEach((entries, id) => {
    result[id] = [...entries];
  });
  return result;
}

// Phase 42: Clear all latency history
export function clearLatencyHistory(): void {
  _latencyHistory.clear();
  try { localStorage.removeItem(LATENCY_HISTORY_LS_KEY); } catch { /* ignore */ }
}

// Phase 42: Import latency history from JSON
export function importLatencyHistory(data: Record<string, LatencyHistoryEntry[]>): number {
  let imported = 0;
  for (const [key, entries] of Object.entries(data)) {
    if (Array.isArray(entries)) {
      const existing = _latencyHistory.get(key) || [];
      const merged = [...existing, ...entries]
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-MAX_HISTORY_ENTRIES);
      _latencyHistory.set(key, merged);
      imported += entries.length;
    }
  }
  persistLatencyHistory();
  return imported;
}

// Phase 42: Export latency history as JSON
export function exportLatencyHistory(): { exportedAt: string; checkCount: number; totalEntries: number; data: Record<string, LatencyHistoryEntry[]> } {
  const data = getAllLatencyHistories();
  const totalEntries = Object.values(data).reduce((sum, entries) => sum + entries.length, 0);
  return {
    exportedAt: new Date().toISOString(),
    checkCount: Object.keys(data).length,
    totalEntries,
    data,
  };
}

// ============================================================
// Phase 44: PG Telemetry Sync & Query Functions
// Exported for use by MetricsHistoryDashboard, SlashCommandEngine, etc.
// ============================================================

/**
 * Sync all localStorage latency data to PG telemetry schema.
 * Returns migration result with counts and timing.
 */
export async function syncLatencyToPg(): Promise<MigrationResult> {
  const localData = getAllLatencyHistories();
  return migrateLatencyToPostgres(localData);
}

/**
 * Query PG telemetry for latency history.
 * Falls back to localStorage if PG is not available.
 */
export async function queryPgLatencyHistory(
  checkId?: string,
  fromTimestamp?: number,
  toTimestamp?: number,
  limit?: number,
): Promise<{ source: 'pg' | 'localStorage'; data: LatencyHistoryEntry[]; checkId?: string }> {
  const pgState = getPgTelemetryState();
  const pgConfig = getPgTelemetryConfig();

  // Try PG first if enabled and connected
  if (pgConfig.enabled && (pgState.status === 'connected' || pgState.status === 'unknown')) {
    const pgResult = await pgReadLatency(checkId, fromTimestamp, toTimestamp, limit);
    if (pgResult.ok && pgResult.data.length > 0) {
      const mapped: LatencyHistoryEntry[] = pgResult.data.map((r: PgLatencyRecord) => ({
        timestamp: r.timestamp,
        latencyMs: r.latency_ms,
        status: r.status as InfraStatus,
      }));
      return { source: 'pg', data: mapped, checkId };
    }
  }

  // Fallback to localStorage
  if (checkId) {
    const entries = _latencyHistory.get(checkId) || [];
    let filtered = entries;
    if (fromTimestamp) filtered = filtered.filter(e => e.timestamp >= fromTimestamp);
    if (toTimestamp) filtered = filtered.filter(e => e.timestamp <= toTimestamp);
    if (limit) filtered = filtered.slice(-limit);
    return { source: 'localStorage', data: filtered, checkId };
  }

  // Return all entries merged
  const allEntries: LatencyHistoryEntry[] = [];
  _latencyHistory.forEach((entries) => {
    let filtered = entries;
    if (fromTimestamp) filtered = filtered.filter(e => e.timestamp >= fromTimestamp);
    if (toTimestamp) filtered = filtered.filter(e => e.timestamp <= toTimestamp);
    allEntries.push(...filtered);
  });
  allEntries.sort((a, b) => a.timestamp - b.timestamp);
  if (limit) return { source: 'localStorage', data: allEntries.slice(-limit) };
  return { source: 'localStorage', data: allEntries };
}

// --- Individual check runners ---

async function probeHTTP(url: string, timeoutMs = 3000): Promise<{ ok: boolean; latencyMs: number; detail?: string }> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);
    return { ok: true, latencyMs: latency, detail: `${latency}ms` };
  } catch {
    const latency = Math.round(performance.now() - start);
    return { ok: false, latencyMs: latency, detail: latency > timeoutMs - 200 ? 'Timeout' : 'Unreachable' };
  }
}

async function checkDevice(device: DeviceConfig): Promise<Partial<InfraCheck>> {
  const httpSvc = device.services.find(s => s.enabled && (s.protocol === 'http' || s.protocol === 'https'));
  if (!httpSvc) {
    return { status: 'unknown', detail: 'No HTTP service' };
  }
  const url = `${httpSvc.protocol}://${device.ip}:${httpSvc.port}${httpSvc.path || '/'}`;
  const result = await probeHTTP(url);
  return {
    status: result.ok ? 'online' : 'offline',
    latencyMs: result.latencyMs,
    detail: result.ok ? `${device.ip}:${httpSvc.port} (${result.latencyMs}ms)` : `${device.ip} ${result.detail}`,
    endpoint: url,
  };
}

async function checkDockerAPI(): Promise<Partial<InfraCheck>> {
  const url = 'http://192.168.3.45:2375/v1.41/_ping';
  const result = await probeHTTP(url, 4000);
  return {
    status: result.ok ? 'online' : 'offline',
    latencyMs: result.latencyMs,
    detail: result.ok ? `Docker Engine ${result.latencyMs}ms` : `Docker API ${result.detail}`,
    endpoint: url,
  };
}

async function checkSQLiteProxy(): Promise<Partial<InfraCheck>> {
  const url = 'http://192.168.3.45:8484/api/db/query';
  const result = await probeHTTP(url, 4000);
  return {
    status: result.ok ? 'online' : 'offline',
    latencyMs: result.latencyMs,
    detail: result.ok ? `SQLite HTTP ${result.latencyMs}ms` : `SQLite Proxy ${result.detail}`,
    endpoint: url,
  };
}

async function checkOllama(): Promise<Partial<InfraCheck>> {
  // Ollama listens on localhost:11434 on the M4 Max
  const url = 'http://192.168.3.22:11434/api/tags';
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);
    if (res.ok) {
      try {
        const data = await res.json() as { models?: Array<{ name: string }> };
        const modelCount = data.models?.length ?? 0;
        return {
          status: 'online',
          latencyMs: latency,
          detail: `${modelCount} models loaded (${latency}ms)`,
          endpoint: url,
        };
      } catch {
        return { status: 'online', latencyMs: latency, detail: `Ollama OK (${latency}ms)`, endpoint: url };
      }
    }
    return { status: 'degraded', latencyMs: latency, detail: `HTTP ${res.status}`, endpoint: url };
  } catch {
    // Try no-cors fallback
    const fallback = await probeHTTP('http://192.168.3.22:11434/', 3000);
    return {
      status: fallback.ok ? 'online' : 'offline',
      latencyMs: fallback.latencyMs,
      detail: fallback.ok ? `Ollama (no-cors ${fallback.latencyMs}ms)` : `Ollama ${fallback.detail}`,
      endpoint: url,
    };
  }
}

async function checkPG15(): Promise<Partial<InfraCheck>> {
  // Browser can't do raw TCP to PG, so we probe the port via HTTP (will get refused but latency measured)
  const url = 'http://192.168.3.22:5433/';
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);
    // No-cors opaque response means something is listening on the port
    return {
      status: 'online',
      latencyMs: latency,
      detail: `PG15 port open (${latency}ms)`,
      endpoint: '192.168.3.22:5433',
    };
  } catch {
    const latency = Math.round(performance.now() - start);
    // Short latency = connection refused (port closed), long = timeout (host down)
    if (latency < 500) {
      return { status: 'degraded', latencyMs: latency, detail: 'Port responded (connection refused)', endpoint: '192.168.3.22:5433' };
    }
    return { status: 'offline', latencyMs: latency, detail: latency > 2500 ? 'Timeout' : 'Unreachable', endpoint: '192.168.3.22:5433' };
  }
}

async function checkTelemetryWS(): Promise<Partial<InfraCheck>> {
  const url = 'ws://192.168.3.22:3001/telemetry';
  const start = performance.now();
  return new Promise<Partial<InfraCheck>>((resolve) => {
    try {
      const ws = new WebSocket(url);
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          status: 'offline',
          latencyMs: Math.round(performance.now() - start),
          detail: 'Timeout (agent not deployed)',
          endpoint: url,
        });
      }, 4000);

      ws.onopen = () => {
        clearTimeout(timeout);
        const latency = Math.round(performance.now() - start);
        ws.close();
        resolve({ status: 'online', latencyMs: latency, detail: `WS connected (${latency}ms)`, endpoint: url });
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        const latency = Math.round(performance.now() - start);
        resolve({
          status: 'offline',
          latencyMs: latency,
          detail: 'WebSocket refused',
          endpoint: url,
        });
      };
    } catch {
      resolve({ status: 'offline', detail: 'WebSocket API error', endpoint: url });
    }
  });
}

function checkWebCrypto(): Partial<InfraCheck> {
  try {
    const hasSubtle = typeof crypto !== 'undefined' && crypto.subtle;
    const hasGetRandom = typeof crypto !== 'undefined' && crypto.getRandomValues;
    if (hasSubtle && hasGetRandom) {
      return { status: 'online', detail: 'AES-GCM + getRandomValues OK' };
    }
    return { status: 'degraded', detail: hasGetRandom ? 'No SubtleCrypto' : 'Limited Crypto' };
  } catch {
    return { status: 'offline', detail: 'Web Crypto unavailable' };
  }
}

function checkLocalStorage(): Partial<InfraCheck> {
  try {
    let yyc3Keys = 0;
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('yyc3')) {
        yyc3Keys++;
        totalSize += (localStorage.getItem(key) || '').length;
      }
    }
    const sizeKB = (totalSize / 1024).toFixed(1);
    return { status: 'online', detail: `${yyc3Keys} keys, ${sizeKB}KB` };
  } catch {
    return { status: 'offline', detail: 'localStorage blocked' };
  }
}

function checkProviders(): Partial<InfraCheck> {
  try {
    const configs = loadProviderConfigs();
    const enabled = configs.filter(c => c.enabled && c.apiKey);
    if (enabled.length === 0) {
      return { status: 'degraded', detail: 'No providers configured' };
    }
    return { status: 'online', detail: `${enabled.length} provider(s) active` };
  } catch {
    return { status: 'offline', detail: 'Provider config error' };
  }
}

function checkEventBus(): Partial<InfraCheck> {
  return {
    status: 'online',
    detail: `${eventBus.totalEvents} events, v${eventBus.version}`,
  };
}

// --- Compile all checks ---

function buildInitialChecks(): InfraCheck[] {
  const devices = loadDeviceConfigs();
  return [
    // Devices
    ...devices.map(d => ({
      id: `device-${d.id}`,
      name: d.displayName,
      nameZh: d.displayName,
      category: 'device' as const,
      status: 'unknown' as InfraStatus,
      endpoint: d.ip,
    })),
    // Services
    { id: 'svc-docker', name: 'Docker Engine (NAS)', nameZh: 'Docker 引擎 (NAS)', category: 'service' as const, status: 'unknown' as InfraStatus, endpoint: '192.168.3.45:2375' },
    { id: 'svc-sqlite', name: 'SQLite HTTP Proxy', nameZh: 'SQLite HTTP 代理', category: 'service' as const, status: 'unknown' as InfraStatus, endpoint: '192.168.3.45:8484' },
    { id: 'svc-ollama', name: 'Ollama LLM Server', nameZh: 'Ollama 推理服务', category: 'service' as const, status: 'unknown' as InfraStatus, endpoint: '192.168.3.22:11434' },
    { id: 'svc-pg15', name: 'PostgreSQL 15', nameZh: 'PostgreSQL 15', category: 'service' as const, status: 'unknown' as InfraStatus, endpoint: '192.168.3.22:5433' },
    { id: 'svc-telemetry', name: 'Telemetry Agent (WS)', nameZh: '遥测代理 (WS)', category: 'service' as const, status: 'unknown' as InfraStatus, endpoint: '192.168.3.22:3001' },
    // Runtime
    { id: 'rt-crypto', name: 'Web Crypto API', nameZh: 'Web Crypto 加密 API', category: 'runtime' as const, status: 'unknown' as InfraStatus },
    { id: 'rt-storage', name: 'localStorage', nameZh: '本地存储', category: 'runtime' as const, status: 'unknown' as InfraStatus },
    { id: 'rt-eventbus', name: 'EventBus', nameZh: '事件总线', category: 'runtime' as const, status: 'unknown' as InfraStatus },
    // Provider
    { id: 'prov-llm', name: 'LLM Providers', nameZh: 'LLM Provider 配置', category: 'provider' as const, status: 'unknown' as InfraStatus },
  ];
}

// ============================================================
// Main Hook: useInfraHealth
// ============================================================

export function useInfraHealth() {
  const addLog = useSystemStore((s) => s.addLog);
  const [checks, setChecks] = useState<InfraCheck[]>(() => buildInitialChecks());
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [startedAt, setStartedAt] = useState(0);
  const [completedAt, setCompletedAt] = useState(0);
  const runningRef = useRef(false);

  const updateCheck = useCallback((id: string, update: Partial<InfraCheck>) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, ...update, lastChecked: Date.now() } : c));
  }, []);

  const runHealthCheck = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    const start = Date.now();
    setStartedAt(start);
    setRunStatus('running');

    // Reset all to checking
    setChecks(prev => prev.map(c => ({ ...c, status: 'checking' as InfraStatus })));

    addLog('info', 'INFRA_HEALTH', 'Infrastructure health check started');
    eventBus.emit({
      category: 'system',
      type: 'system.infra_health_start',
      level: 'info',
      source: 'InfraHealth',
      message: 'Infrastructure health check started',
    });

    const devices = loadDeviceConfigs();

    // Run all checks concurrently
    const checkTasks: Array<{ id: string; runner: () => Promise<Partial<InfraCheck>> | Partial<InfraCheck> }> = [
      // Device checks
      ...devices.map(d => ({
        id: `device-${d.id}`,
        runner: () => checkDevice(d),
      })),
      // Service checks
      { id: 'svc-docker', runner: checkDockerAPI },
      { id: 'svc-sqlite', runner: checkSQLiteProxy },
      { id: 'svc-ollama', runner: checkOllama },
      { id: 'svc-pg15', runner: checkPG15 },
      { id: 'svc-telemetry', runner: checkTelemetryWS },
      // Sync checks
      { id: 'rt-crypto', runner: () => checkWebCrypto() },
      { id: 'rt-storage', runner: () => checkLocalStorage() },
      { id: 'rt-eventbus', runner: () => checkEventBus() },
      { id: 'prov-llm', runner: () => checkProviders() },
    ];

    await Promise.allSettled(
      checkTasks.map(async ({ id, runner }) => {
        try {
          const result = await runner();
          updateCheck(id, result);
          // Phase 41: Record latency history for trending
          recordLatency(id, result.latencyMs, result.status || 'unknown');
        } catch {
          updateCheck(id, { status: 'offline', detail: 'Check failed' });
          recordLatency(id, undefined, 'offline');
        }
      })
    );

    const elapsed = Date.now() - start;
    setCompletedAt(Date.now());
    setRunStatus('done');
    runningRef.current = false;

    // Compute summary for log
    const finalChecks = checkTasks.length;
    addLog('success', 'INFRA_HEALTH', `Health check complete in ${elapsed}ms (${finalChecks} checks)`);
    eventBus.emit({
      category: 'system',
      type: 'system.infra_health_complete',
      level: 'success',
      source: 'InfraHealth',
      message: `Infrastructure health check complete (${elapsed}ms)`,
      metadata: { elapsed, checkCount: finalChecks },
    });
  }, [addLog, updateCheck]);

  // Single-target recheck
  const recheckSingle = useCallback(async (checkId: string) => {
    updateCheck(checkId, { status: 'checking' });
    const devices = loadDeviceConfigs();

    const runners: Record<string, () => Promise<Partial<InfraCheck>> | Partial<InfraCheck>> = {
      'svc-docker': checkDockerAPI,
      'svc-sqlite': checkSQLiteProxy,
      'svc-ollama': checkOllama,
      'svc-pg15': checkPG15,
      'svc-telemetry': checkTelemetryWS,
      'rt-crypto': () => checkWebCrypto(),
      'rt-storage': () => checkLocalStorage(),
      'rt-eventbus': () => checkEventBus(),
      'prov-llm': () => checkProviders(),
    };

    // Device checks
    for (const d of devices) {
      runners[`device-${d.id}`] = () => checkDevice(d);
    }

    const runner = runners[checkId];
    if (runner) {
      try {
        const result = await runner();
        updateCheck(checkId, result);
      } catch {
        updateCheck(checkId, { status: 'offline', detail: 'Recheck failed' });
      }
    }
  }, [updateCheck]);

  // Compute summary
  const summary = {
    total: checks.length,
    online: checks.filter(c => c.status === 'online').length,
    degraded: checks.filter(c => c.status === 'degraded').length,
    offline: checks.filter(c => c.status === 'offline').length,
    unknown: checks.filter(c => c.status === 'unknown' || c.status === 'checking').length,
  };

  const report: InfraHealthReport = {
    checks,
    status: runStatus,
    summary,
    startedAt,
    completedAt,
    totalMs: completedAt ? completedAt - startedAt : 0,
  };

  return {
    ...report,
    runHealthCheck,
    recheckSingle,
  };
}

// ============================================================
// Singleton for cross-module access (SlashCommandEngine etc.)
// ============================================================

let _lastReport: InfraHealthReport | null = null;

export function setLastInfraReport(report: InfraHealthReport) {
  _lastReport = report;
}

export function getLastInfraReport(): InfraHealthReport | null {
  return _lastReport;
}