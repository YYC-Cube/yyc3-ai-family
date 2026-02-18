import { useEffect, useRef, useCallback, useState } from 'react';
import { useSystemStore } from './store';
import type { ClusterMetricsSnapshot } from './store';
import { loadDeviceConfigs } from './nas-client';
import { eventBus } from './event-bus';

// ============================================================
// YYC3 — Enhanced WebSocket Client Hook
// Phase 15.2: Multi-endpoint real-time data streams
//
// Connection strategy:
// 1. Load device configs → discover WS endpoints
// 2. Attempt connection to primary WS relay (NAS or M4-Max)
// 3. On success → receive real cluster metrics + logs
// 4. On failure → fallback to simulation engine
// 5. Exponential backoff reconnection
// 6. Supports multiple WS channels: metrics, logs, docker, heartbeat
// ============================================================

const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 2000;

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'simulation';

interface WsMessage {
  type: string;
  data: unknown;
  timestamp: number;
  source?: string;
}

// Module-level state to avoid changing hook count
// (adding useState/useRef inside the hook would break HMR reconciliation)
let _endpointIdx = 0;
let _activeEndpoint: string | null = null;

function getWsEndpoints(): string[] {
  const devices = loadDeviceConfigs();
  const endpoints: string[] = [];

  // Priority 1: NAS WS relay service
  const nas = devices.find(d => d.id === 'yanyucloud');
  if (nas) {
    endpoints.push(`ws://${nas.ip}:3001/ws`);
  }

  // Priority 2: M4-Max local WS
  const m4 = devices.find(d => d.id === 'm4-max');
  if (m4) {
    endpoints.push(`ws://${m4.ip}:3001/ws`);
  }

  // Priority 3: localhost fallback
  endpoints.push('ws://localhost:3001/ws');

  return endpoints;
}

export function useWebSocket() {
  // === CRITICAL: Hook order must match original exactly ===
  // useRef, useRef, useRef, useState, useRef — DO NOT reorder
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(INITIAL_RECONNECT_DELAY);
  const [status, setStatus] = useState<WsStatus>('connecting');
  const mountedRef = useRef(true);

  const updateMetrics = useSystemStore((s) => s.updateMetrics);
  const addLog = useSystemStore((s) => s.addLog);
  const setDbConnected = useSystemStore((s) => s.setDbConnected);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const msg: WsMessage = JSON.parse(event.data as string);

      switch (msg.type) {
        case 'connected':
          console.log('[WS] Server acknowledged connection');
          break;

        case 'metrics': {
          // Transform server metrics to ClusterMetricsSnapshot
          const raw = msg.data as Record<string, Record<string, number>>;
          const defaults = { cpu: 0, memory: 0, disk: 0, network: 0, temperature: 35, processes: 0, uptime: 0 };
          const snapshot: ClusterMetricsSnapshot = {
            'm4-max': { ...defaults, ...raw['m4-max'] },
            'imac-m4': { ...defaults, ...raw['imac-m4'] },
            'matebook': { ...defaults, ...raw['matebook'] },
            'yanyucloud': { ...defaults, ...raw['yanyucloud'] },
            timestamp: msg.timestamp,
          };
          updateMetrics(snapshot);
          break;
        }

        case 'log': {
          const logData = msg.data as { level: 'info' | 'warn' | 'error' | 'success'; source: string; message: string };
          addLog(logData.level, `[WS] ${logData.source}`, logData.message);
          break;
        }

        case 'docker_event': {
          const dockerData = msg.data as { action: string; container: string };
          addLog('info', 'DOCKER_WS', `${dockerData.action}: ${dockerData.container}`);
          break;
        }

        case 'heartbeat':
          wsRef.current?.send(JSON.stringify({ type: 'pong' }));
          break;

        default:
          // Emit to event bus for specialized hooks
          eventBus.emit({
            category: 'system',
            type: `ws:${msg.type}`,
            level: 'info',
            source: 'WebSocket',
            message: `WS message: ${msg.type}`,
            metadata: msg.data as Record<string, unknown>
          });
          break;
      }
    } catch {
      // Ignore parse errors
    }
  }, [updateMetrics, addLog]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const endpoints = getWsEndpoints();
    const url = endpoints[_endpointIdx % endpoints.length];

    try {
      setStatus('connecting');
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        console.log(`[WS] Connected to ${url}`);
        setStatus('connected');
        _activeEndpoint = url;
        setDbConnected(true);
        reconnectDelay.current = INITIAL_RECONNECT_DELAY;
        _endpointIdx = 0; // Reset to primary on success

        // Subscribe to all channels
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['metrics', 'logs', 'heartbeat', 'docker_events'],
        }));
      };

      ws.onmessage = handleMessage;

      ws.onclose = () => {
        if (!mountedRef.current) return;
        console.log(`[WS] Connection to ${url} closed, trying next endpoint...`);
        setStatus('simulation');
        _activeEndpoint = null;
        setDbConnected(false);
        // Try next endpoint
        _endpointIdx = (_endpointIdx + 1) % endpoints.length;
        scheduleReconnect();
      };

      ws.onerror = () => {
        setDbConnected(false);
      };

      wsRef.current = ws;
    } catch {
      setStatus('simulation');
      setDbConnected(false);
      _endpointIdx = (_endpointIdx + 1) % endpoints.length;
      scheduleReconnect();
    }
  }, [handleMessage, setDbConnected]);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

    reconnectTimer.current = setTimeout(() => {
      if (mountedRef.current) {
        reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, MAX_RECONNECT_DELAY);
        connect();
      }
    }, reconnectDelay.current);
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const send = useCallback((type: string, data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  return { status, send, activeEndpoint: _activeEndpoint };
}

/**
 * Phase 35: Dedicated hook for streaming Docker container logs
 */
export function useDockerLogs(containerId: string | null) {
  const { send } = useWebSocket();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!containerId) {
      setLogs([]);
      return;
    }

    const subId = `docker_logs:${containerId}`;
    send('subscribe', { channel: subId });
    setLogs(['[WS] Establishing real-time connection to container stdout...']);

    const unsubscribe = eventBus.on((event) => {
      if (event.type === 'ws:docker_logs' && event.metadata?.containerId === containerId) {
        setLogs(prev => [...prev.slice(-200), (event.metadata as any).line]);
      }
    });
    
    return () => {
      send('unsubscribe', { channel: subId });
      eventBus.off(unsubscribe);
    };
  }, [containerId, send]);

  return logs.join('\n');
}
