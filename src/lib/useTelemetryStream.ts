import { useEffect, useRef, useState, useCallback } from 'react';

import { eventBus } from './event-bus';
import { useSystemStore } from './store';

// ============================================================
// YYC3 — Hardware Telemetry Stream Hook
// Phase 37: Real WebSocket/SSE → 192.168.3.22 Telemetry Agent
//
// Connection strategy (ordered by priority):
//   1. WebSocket  ws://192.168.3.22:3177/telemetry
//   2. SSE        http://192.168.3.22:3177/sse/telemetry
//   3. Fallback   Local simulation (identical to prev. behavior)
//
// Data contract (TelemetryFrame):
//   - pCores:    number[]  (16 P-core loads)
//   - gpuCores:  number[]  (40 GPU-core loads)
//   - processes: ProcessInfo[]
//   - thermal:   ThermalZone[]
//   - diskIO:    { readMBps, writeMBps }
//   - netIO:     { rxMbps, txMbps }
//   - memory:    { usedGB, totalGB, pressure }
//   - uptime:    number (seconds)
//
// Graceful degradation:
//   If all real connections fail, seamlessly switch to
//   high-fidelity simulation with no user-visible glitch.
// ============================================================

// --- Data Types ---

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  mem: number; // MB
}

export interface ThermalZone {
  zone: string;
  temp: number;
  limit: number;
}

export interface TelemetryFrame {
  pCores: number[];
  gpuCores: number[];
  processes: ProcessInfo[];
  thermal: ThermalZone[];
  diskIO: { readMBps: number; writeMBps: number };
  netIO: { rxMbps: number; txMbps: number };
  memory: { usedGB: number; totalGB: number; pressure: number };
  uptime: number;
  timestamp: number;
}

export type TelemetrySource = 'websocket' | 'sse' | 'simulation';

// --- Constants ---

const WS_URL = 'ws://192.168.3.22:3177/telemetry';
const SSE_URL = 'http://192.168.3.22:3177/sse/telemetry';
const RECONNECT_BASE_MS = 3000;
const RECONNECT_MAX_MS = 30000;
const SIMULATION_INTERVAL_MS = 2000;

// --- Simulation Engine ---

function createSimulatedFrame(
  prevFrame: TelemetryFrame | null,
  cpuLoad: number,
): TelemetryFrame {
  const base = cpuLoad || 20;
  const now = Date.now();

  // P-Cores: 16 cores with realistic variation
  const pCores = Array.from({ length: 16 }, (_, i) => {
    const prev = prevFrame?.pCores[i] ?? (base + (Math.random() - 0.5) * 20);
    const target = base + (Math.random() - 0.5) * 40 + (i < 4 ? 15 : 0);

    return Math.max(1, Math.min(100, prev * 0.7 + target * 0.3 + (Math.random() - 0.5) * 10));
  });

  // GPU Cores: 40 cores
  const gpuCores = Array.from({ length: 40 }, (_, i) => {
    const prev = prevFrame?.gpuCores[i] ?? (base * 0.3 + Math.random() * 15);
    const target = base * 0.4 + Math.random() * 25;

    return Math.max(0, Math.min(100, prev * 0.75 + target * 0.25 + (Math.random() - 0.5) * 8));
  });

  // Processes with realistic CPU spikes
  const processes: ProcessInfo[] = [
    { name: 'node (vite dev)', cpu: 6 + Math.random() * 8, mem: 1100 + Math.random() * 300, pid: 1847 },
    { name: 'postgres (yyc3_max)', cpu: 2 + Math.random() * 4, mem: 800 + Math.random() * 200, pid: 2341 },
    { name: 'ollama serve', cpu: cpuLoad > 50 ? 30 + Math.random() * 30 : 1 + Math.random() * 4, mem: 7000 + Math.random() * 2000, pid: 3012 },
    { name: 'Docker Desktop', cpu: 3 + Math.random() * 5, mem: 1800 + Math.random() * 500, pid: 892 },
    { name: 'Chromium Helper', cpu: 8 + Math.random() * 10, mem: 2800 + Math.random() * 800, pid: 4523 },
    { name: 'WindowServer', cpu: 1 + Math.random() * 3, mem: 400 + Math.random() * 100, pid: 112 },
    { name: 'mds_stores', cpu: 0.5 + Math.random() * 3, mem: 280 + Math.random() * 80, pid: 234 },
    { name: 'kernel_task', cpu: 0.3 + Math.random() * 1.5, mem: 150 + Math.random() * 60, pid: 0 },
  ];

  const prevTemp = prevFrame?.thermal[0]?.temp ?? 48;
  const cpuTemp = Math.max(30, Math.min(95, prevTemp + (Math.random() - 0.5) * 3 + (base - 40) * 0.02));

  const thermal: ThermalZone[] = [
    { zone: 'CPU Die', temp: Math.round(cpuTemp * 10) / 10, limit: 105 },
    { zone: 'GPU Die', temp: Math.round(Math.max(30, cpuTemp - 5 + (Math.random() - 0.5) * 2) * 10) / 10, limit: 105 },
    { zone: 'SSD (SN850X)', temp: Math.round(Math.max(25, cpuTemp - 15 + (Math.random() - 0.5) * 2) * 10) / 10, limit: 85 },
    { zone: 'Ambient', temp: Math.round(Math.max(20, cpuTemp - 28 + (Math.random() - 0.5) * 1) * 10) / 10, limit: 45 },
  ];

  const prevDiskRead = prevFrame?.diskIO.readMBps ?? 150;
  const prevDiskWrite = prevFrame?.diskIO.writeMBps ?? 80;

  return {
    pCores,
    gpuCores,
    processes,
    thermal,
    diskIO: {
      readMBps: Math.round(Math.max(10, prevDiskRead + (Math.random() - 0.5) * 60)),
      writeMBps: Math.round(Math.max(5, prevDiskWrite + (Math.random() - 0.5) * 40)),
    },
    netIO: {
      rxMbps: Math.round(80 + Math.random() * 120),
      txMbps: Math.round(20 + Math.random() * 60),
    },
    memory: {
      usedGB: +(38 + Math.random() * 20).toFixed(1),
      totalGB: 128,
      pressure: +(30 + Math.random() * 15).toFixed(1),
    },
    uptime: (prevFrame?.uptime ?? 86400) + SIMULATION_INTERVAL_MS / 1000,
    timestamp: now,
  };
}

// --- Main Hook ---

export function useTelemetryStream() {
  const cpuLoad = useSystemStore(s => s.cpuLoad);
  const addLog = useSystemStore(s => s.addLog);

  const [source, setSource] = useState<TelemetrySource>('simulation');
  const [connected, setConnected] = useState(false);
  const [frame, setFrame] = useState<TelemetryFrame | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const frameRef = useRef<TelemetryFrame | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const cpuLoadRef = useRef(cpuLoad);

  cpuLoadRef.current = cpuLoad;

  // --- Simulation fallback ---
  const startSimulation = useCallback(() => {
    if (simTimerRef.current) return; // already running

    setSource('simulation');
    setConnected(false);

    const tick = () => {
      if (!mountedRef.current) return;
      const newFrame = createSimulatedFrame(frameRef.current, cpuLoadRef.current);

      frameRef.current = newFrame;
      setFrame(newFrame);
    };

    tick(); // initial frame
    simTimerRef.current = setInterval(tick, SIMULATION_INTERVAL_MS);
  }, []);

  const stopSimulation = useCallback(() => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
  }, []);

  // --- Handle incoming telemetry frame ---
  const handleFrame = useCallback((data: unknown) => {
    try {
      const parsed = data as TelemetryFrame;

      // Validate minimum required fields
      if (parsed && Array.isArray(parsed.pCores) && parsed.pCores.length > 0) {
        frameRef.current = parsed;
        setFrame(parsed);

        return true;
      }
    } catch { /* ignore */ }

    return false;
  }, []);

  // --- WebSocket connection ---
  const tryWebSocket = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      const ws = new WebSocket(WS_URL);

      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close();

          return; }
        stopSimulation();
        setSource('websocket');
        setConnected(true);
        setConnectionAttempts(0);

        addLog('success', 'TELEMETRY', `WebSocket connected to ${WS_URL}`);
        eventBus.system('telemetry.ws_connected', `Telemetry WebSocket connected to 192.168.3.22`, 'success', {
          endpoint: WS_URL,
          source: 'websocket',
        });

        // Request telemetry stream
        ws.send(JSON.stringify({ type: 'subscribe', channel: 'telemetry' }));
      };

      ws.onmessage = event => {
        try {
          const msg = JSON.parse(event.data as string);

          if (msg.type === 'telemetry') {
            handleFrame(msg.data);
          } else if (msg.type === 'heartbeat') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch { /* ignore parse errors */ }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        wsRef.current = null;
        setConnected(false);

        eventBus.system('telemetry.ws_disconnected', 'Telemetry WebSocket disconnected, trying SSE...', 'warn');

        // Try SSE as fallback
        trySSE();
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // WebSocket constructor failed, try SSE
      trySSE();
    }
  }, [stopSimulation, addLog, handleFrame]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- SSE connection ---
  const trySSE = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      const es = new EventSource(SSE_URL);

      esRef.current = es;

      es.onopen = () => {
        if (!mountedRef.current) { es.close();

          return; }
        stopSimulation();
        setSource('sse');
        setConnected(true);
        setConnectionAttempts(0);

        addLog('success', 'TELEMETRY', `SSE connected to ${SSE_URL}`);
        eventBus.system('telemetry.sse_connected', `Telemetry SSE connected to 192.168.3.22`, 'success', {
          endpoint: SSE_URL,
          source: 'sse',
        });
      };

      es.addEventListener('telemetry', event => {
        try {
          const data = JSON.parse(event.data);

          handleFrame(data);
        } catch { /* ignore */ }
      });

      es.onerror = () => {
        if (!mountedRef.current) return;
        es.close();
        esRef.current = null;
        setConnected(false);

        // Both WS and SSE failed → fall back to simulation
        setConnectionAttempts(prev => prev + 1);

        eventBus.system('telemetry.fallback_simulation',
          'Both WebSocket & SSE unreachable, using local simulation', 'info');

        startSimulation();
        scheduleReconnect();
      };
    } catch {
      startSimulation();
      scheduleReconnect();
    }
  }, [stopSimulation, startSimulation, addLog, handleFrame]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Reconnection with exponential backoff ---
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(1.5, connectionAttempts),
      RECONNECT_MAX_MS,
    );

    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current && source === 'simulation') {
        tryWebSocket();
      }
    }, delay);
  }, [connectionAttempts, source, tryWebSocket]);

  // --- Manual reconnect ---
  const reconnect = useCallback(() => {
    // Cleanup existing connections
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    stopSimulation();
    setConnectionAttempts(0);

    addLog('info', 'TELEMETRY', 'Manual reconnection initiated to 192.168.3.22');
    eventBus.system('telemetry.manual_reconnect', 'Manual telemetry reconnection triggered', 'info');

    tryWebSocket();
  }, [stopSimulation, addLog, tryWebSocket]);

  // --- Lifecycle ---
  useEffect(() => {
    mountedRef.current = true;

    // Start with simulation immediately for instant UI, then try real connection
    startSimulation();

    // Attempt real connection after a short delay (non-blocking)
    const initTimer = setTimeout(() => {
      if (mountedRef.current) {
        tryWebSocket();
      }
    }, 1000);

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimer);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      stopSimulation();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    frame,
    source,
    connected,
    connectionAttempts,
    reconnect,
  };
}
