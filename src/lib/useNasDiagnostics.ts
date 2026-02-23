// ============================================================
// YYC3 Hacker Chatbot — NAS Auto-Diagnostics Hook
// Phase 22: Startup Self-Diagnostics Engine
//
// Runs automatically on dashboard mount:
//   1. NAS SQLite HTTP Proxy connectivity
//   2. Docker Engine API ping
//   3. Heartbeat WebSocket endpoint
//   4. Device cluster reachability (HTTP services)
//
// Reports to Event Bus + Zustand store logs
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';

import { eventBus } from './event-bus';
import { testSQLiteConnection, loadDeviceConfigs, type DeviceConfig } from './nas-client';
import { docker } from './nas-client';
import { useSystemStore } from './store';

// ============================================================
// Types
// ============================================================

export type DiagStatus = 'idle' | 'running' | 'done';
export type CheckStatus = 'pending' | 'checking' | 'ok' | 'warn' | 'fail';

export interface DiagCheck {
  id: string;
  label: string;
  labelZh: string;
  category: 'nas' | 'docker' | 'websocket' | 'device';
  status: CheckStatus;
  latencyMs?: number;
  detail?: string;
  icon: string; // emoji indicator
}

export interface DiagResult {
  status: DiagStatus;
  checks: DiagCheck[];
  startedAt: number;
  completedAt: number;
  passCount: number;
  failCount: number;
  warnCount: number;
  totalMs: number;
}

// ============================================================
// Default Checks Template
// ============================================================

const INITIAL_CHECKS: DiagCheck[] = [
  {
    id: 'sqlite-proxy',
    label: 'NAS SQLite HTTP Proxy',
    labelZh: 'NAS SQLite 数据库代理',
    category: 'nas',
    status: 'pending',
    icon: 'DB',
  },
  {
    id: 'docker-engine',
    label: 'Docker Engine API',
    labelZh: 'Docker 引擎 API',
    category: 'docker',
    status: 'pending',
    icon: 'DK',
  },
  {
    id: 'heartbeat-ws',
    label: 'Heartbeat WebSocket Relay',
    labelZh: '心跳 WebSocket 服务',
    category: 'websocket',
    status: 'pending',
    icon: 'WS',
  },
  {
    id: 'device-m4-max',
    label: 'MacBook Pro M4 Max',
    labelZh: 'MacBook Pro M4 Max',
    category: 'device',
    status: 'pending',
    icon: 'M4',
  },
  {
    id: 'device-imac-m4',
    label: 'iMac M4',
    labelZh: 'iMac M4',
    category: 'device',
    status: 'pending',
    icon: 'iM',
  },
  {
    id: 'device-yanyucloud',
    label: 'TerraMaster F4-423 NAS',
    labelZh: '铁威马 F4-423 NAS',
    category: 'device',
    status: 'pending',
    icon: 'NAS',
  },
  {
    id: 'device-matebook',
    label: 'MateBook X Pro',
    labelZh: 'MateBook X Pro',
    category: 'device',
    status: 'pending',
    icon: 'HW',
  },
];

// ============================================================
// Diagnostic Runners
// ============================================================

async function checkSQLite(): Promise<Partial<DiagCheck>> {
  try {
    const result = await testSQLiteConnection();

    if (result.success) {
      return {
        status: 'ok',
        latencyMs: result.latencyMs,
        detail: `v${result.version} | ${result.latencyMs}ms`,
      };
    }

    return {
      status: 'fail',
      latencyMs: result.latencyMs,
      detail: result.error || 'Connection refused',
    };
  } catch (e) {
    return {
      status: 'fail',
      detail: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

async function checkDocker(): Promise<Partial<DiagCheck>> {
  const start = performance.now();

  try {
    const ok = await docker.ping();
    const latency = Math.round(performance.now() - start);

    if (ok) {
      return { status: 'ok', latencyMs: latency, detail: `Pong | ${latency}ms` };
    }

    return { status: 'fail', latencyMs: latency, detail: 'No response' };
  } catch {
    return {
      status: 'fail',
      latencyMs: Math.round(performance.now() - start),
      detail: 'Connection refused',
    };
  }
}

async function checkWebSocket(): Promise<Partial<DiagCheck>> {
  const start = performance.now();

  return new Promise(resolve => {
    try {
      const ws = new WebSocket('ws://192.168.3.45:9090/ws/heartbeat');
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          status: 'warn',
          latencyMs: Math.round(performance.now() - start),
          detail: 'Timeout (not deployed?)',
        });
      }, 4000);

      ws.onopen = () => {
        clearTimeout(timeout);
        const latency = Math.round(performance.now() - start);

        ws.close();
        resolve({ status: 'ok', latencyMs: latency, detail: `Connected | ${latency}ms` });
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve({
          status: 'warn',
          latencyMs: Math.round(performance.now() - start),
          detail: 'Not reachable (deploy via NAS Toolkit)',
        });
      };
    } catch {
      resolve({ status: 'fail', detail: 'WebSocket API unavailable' });
    }
  });
}

async function checkDevice(deviceId: string, devices: DeviceConfig[]): Promise<Partial<DiagCheck>> {
  const device = devices.find(d => d.id === deviceId);

  if (!device) return { status: 'fail', detail: 'Device not found in registry' };

  const httpService = device.services.find(
    s => s.enabled && (s.protocol === 'http' || s.protocol === 'https'),
  );

  if (!httpService) {
    return { status: 'warn', detail: 'No HTTP service enabled' };
  }

  const start = performance.now();
  const url = `${httpService.protocol}://${device.ip}:${httpService.port}${httpService.path || '/'}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);

    return { status: 'ok', latencyMs: latency, detail: `${device.ip}:${httpService.port} | ${latency}ms` };
  } catch {
    const latency = Math.round(performance.now() - start);

    return {
      status: latency > 2800 ? 'warn' : 'fail',
      latencyMs: latency,
      detail: `${device.ip} unreachable`,
    };
  }
}

// ============================================================
// Hook: useNasDiagnostics
// ============================================================

export function useNasDiagnostics(autoRun = true): DiagResult & {
  runDiagnostics: () => Promise<void>;
  reset: () => void;
} {
  const [checks, setChecks] = useState<DiagCheck[]>([...INITIAL_CHECKS]);
  const [status, setStatus] = useState<DiagStatus>('idle');
  const [startedAt, setStartedAt] = useState(0);
  const [completedAt, setCompletedAt] = useState(0);
  const ranRef = useRef(false);
  const addLog = useSystemStore(s => s.addLog);

  const updateCheck = useCallback((id: string, update: Partial<DiagCheck>) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, ...update } : c));
  }, []);

  const runDiagnostics = useCallback(async () => {
    const start = Date.now();

    setStartedAt(start);
    setStatus('running');
    setChecks(INITIAL_CHECKS.map(c => ({ ...c, status: 'checking' as CheckStatus })));

    eventBus.system('diagnostics_start', 'NAS auto-diagnostics started', 'info');
    addLog('info', 'DIAG', 'NAS auto-diagnostics scan initiated...');

    const devices = loadDeviceConfigs();

    // Run all checks in parallel
    const checkRunners: { id: string; runner: () => Promise<Partial<DiagCheck>> }[] = [
      { id: 'sqlite-proxy', runner: checkSQLite },
      { id: 'docker-engine', runner: checkDocker },
      { id: 'heartbeat-ws', runner: checkWebSocket },
      { id: 'device-m4-max', runner: () => checkDevice('m4-max', devices) },
      { id: 'device-imac-m4', runner: () => checkDevice('imac-m4', devices) },
      { id: 'device-yanyucloud', runner: () => checkDevice('yanyucloud', devices) },
      { id: 'device-matebook', runner: () => checkDevice('matebook', devices) },
    ];

    const results = await Promise.allSettled(
      checkRunners.map(async ({ id, runner }) => {
        updateCheck(id, { status: 'checking' });
        const result = await runner();

        updateCheck(id, result);

        return { id, ...result };
      }),
    );

    // Compute summary
    const finalChecks = results.map(r => {
      if (r.status === 'fulfilled') return r.value;

      return { id: 'unknown', status: 'fail' as CheckStatus };
    });

    const pass = finalChecks.filter(c => c.status === 'ok').length;
    const fail = finalChecks.filter(c => c.status === 'fail').length;
    const warn = finalChecks.filter(c => c.status === 'warn').length;
    const elapsed = Date.now() - start;

    setCompletedAt(Date.now());
    setStatus('done');

    const level = fail > 2 ? 'error' : fail > 0 ? 'warn' : 'success';
    const msg = `Diagnostics complete: ${pass} OK, ${warn} WARN, ${fail} FAIL (${elapsed}ms)`;

    eventBus.system('diagnostics_complete', msg, level, { pass, fail, warn, elapsed });
    addLog(level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'success', 'DIAG', msg);
  }, [addLog, updateCheck]);

  const reset = useCallback(() => {
    setChecks([...INITIAL_CHECKS]);
    setStatus('idle');
    setStartedAt(0);
    setCompletedAt(0);
  }, []);

  // Auto-run on mount (once)
  useEffect(() => {
    if (autoRun && !ranRef.current) {
      ranRef.current = true;
      // Delay slightly to let UI render first
      const timer = setTimeout(() => {
        runDiagnostics();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [autoRun, runDiagnostics]);

  const passCount = checks.filter(c => c.status === 'ok').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warnCount = checks.filter(c => c.status === 'warn').length;

  return {
    status,
    checks,
    startedAt,
    completedAt,
    passCount,
    failCount,
    warnCount,
    totalMs: completedAt ? completedAt - startedAt : 0,
    runDiagnostics,
    reset,
  };
}
