// ============================================================
// YYC3 Hacker Chatbot — WebSocket Heartbeat Hook
// Phase 20.1: Real-time Family Heartbeat Stream
//
// Connection strategy:
//   1. Attempt WebSocket to ws://192.168.3.45:9090/ws/heartbeat
//   2. On success: receive real heartbeat data from NAS relay
//   3. On failure: graceful fallback to local simulation
//   4. Exponential backoff reconnection
//   5. Event Bus integration for heartbeat events
//
// Protocol (inbound from NAS):
//   {
//     "type": "heartbeat",
//     "memberId": "navigator" | "m4-max" | ...,
//     "memberType": "agent" | "device",
//     "presence": "online" | "idle" | "busy" | "away" | "offline",
//     "heartbeatCount": number,
//     "signalMessage": string,
//     "timestamp": string (ISO)
//   }
//
//   {
//     "type": "batch_heartbeat",
//     "members": HeartbeatPayload[],
//     "timestamp": string
//   }
//
// Protocol (outbound to NAS):
//   { "type": "pong" }
//   { "type": "subscribe", "channels": ["heartbeat"] }
//
// Design: "陪伴是一种无形的爱，信号代表我们都在"
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';

import type { AgentProfile, DeviceMemberProfile, PresenceStatus, MoodState } from './agent-identity';
import {
  loadAgentProfiles,
  loadDeviceMembers,
  saveAgentProfiles,
  saveDeviceMembers,
  simulateHeartbeats,
} from './agent-identity';
import { eventBus } from './event-bus';
import { writeAgentProfiles } from './persistence-engine';

// ============================================================
// 1. Types
// ============================================================

export type HeartbeatWsStatus = 'connecting' | 'connected' | 'disconnected' | 'simulation';

interface HeartbeatPayload {
  memberId: string;
  memberType: 'agent' | 'device';
  presence: PresenceStatus;
  heartbeatCount: number;
  signalMessage?: string;
  timestamp: string;
  // Optional extended fields
  mood?: string;
  activeIdentity?: 'primary' | 'secondary' | 'tertiary';
}

interface HeartbeatWsMessage {
  type: 'heartbeat' | 'batch_heartbeat' | 'ping' | 'connected' | 'error';
  memberId?: string;
  memberType?: 'agent' | 'device';
  presence?: PresenceStatus;
  heartbeatCount?: number;
  signalMessage?: string;
  timestamp?: string;
  members?: HeartbeatPayload[];
  error?: string;
}

export interface HeartbeatState {
  agentProfiles: Record<string, AgentProfile>;
  deviceMembers: Record<string, DeviceMemberProfile>;
  wsStatus: HeartbeatWsStatus;
  lastHeartbeat: string;
  totalHeartbeats: number;
  endpoint: string;
}

// ============================================================
// 2. Configuration
// ============================================================

const HEARTBEAT_WS_CONFIG_KEY = 'yyc3-heartbeat-ws-config';

interface HeartbeatWsConfig {
  host: string;
  port: number;
  path: string;
}

const DEFAULT_HEARTBEAT_CONFIG: HeartbeatWsConfig = {
  host: '192.168.3.45',
  port: 9090,
  path: '/ws/heartbeat',
};

function loadHeartbeatConfig(): HeartbeatWsConfig {
  try {
    const raw = localStorage.getItem(HEARTBEAT_WS_CONFIG_KEY);

    if (raw) return { ...DEFAULT_HEARTBEAT_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }

  return { ...DEFAULT_HEARTBEAT_CONFIG };
}

function getHeartbeatWsUrl(): string {
  const cfg = loadHeartbeatConfig();

  return `ws://${cfg.host}:${cfg.port}${cfg.path}`;
}

// ============================================================
// 3. Constants
// ============================================================

const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 3000;
const SIMULATION_INTERVAL = 8000; // Fallback simulation every 8s
const WS_CONNECT_TIMEOUT = 5000;

// ============================================================
// 4. Hook: useHeartbeatWebSocket
// ============================================================

export function useHeartbeatWebSocket(): HeartbeatState {
  const [agentProfiles, setAgentProfiles] = useState<Record<string, AgentProfile>>(loadAgentProfiles);
  const [deviceMembers, setDeviceMembers] = useState<Record<string, DeviceMemberProfile>>(loadDeviceMembers);
  const [wsStatus, setWsStatus] = useState<HeartbeatWsStatus>('connecting');
  const [lastHeartbeat, setLastHeartbeat] = useState<string>(new Date().toISOString());
  const [totalHeartbeats, setTotalHeartbeats] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const simulationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const endpointRef = useRef(getHeartbeatWsUrl());
  // Refs to hold latest state for simulation (avoids closure stale data)
  const agentProfilesRef = useRef(agentProfiles);
  const deviceMembersRef = useRef(deviceMembers);

  agentProfilesRef.current = agentProfiles;
  deviceMembersRef.current = deviceMembers;

  // --- Apply a single heartbeat payload ---
  const applyHeartbeat = useCallback((payload: HeartbeatPayload) => {
    const now = payload.timestamp || new Date().toISOString();

    if (payload.memberType === 'agent') {
      setAgentProfiles(prev => {
        const existing = prev[payload.memberId];

        if (!existing) return prev;
        const updated = {
          ...prev,
          [payload.memberId]: {
            ...existing,
            presence: payload.presence,
            heartbeatCount: payload.heartbeatCount ?? existing.heartbeatCount + 1,
            lastSeen: now,
            ...(payload.signalMessage ? { signalMessage: payload.signalMessage } : {}),
            ...(payload.mood ? { primary: { ...existing.primary, mood: payload.mood as MoodState } } : {}),
            ...(payload.activeIdentity ? { activeIdentity: payload.activeIdentity } : {}),
            updatedAt: now,
          },
        };

        saveAgentProfiles(updated);

        return updated;
      });
    } else if (payload.memberType === 'device') {
      setDeviceMembers(prev => {
        const existing = prev[payload.memberId];

        if (!existing) return prev;
        const updated = {
          ...prev,
          [payload.memberId]: {
            ...existing,
            presence: payload.presence,
            heartbeatCount: payload.heartbeatCount ?? existing.heartbeatCount + 1,
            lastSeen: now,
            ...(payload.signalMessage ? { signalMessage: payload.signalMessage } : {}),
          },
        };

        saveDeviceMembers(updated);

        return updated;
      });
    }

    setLastHeartbeat(now);
    setTotalHeartbeats(prev => prev + 1);
  }, []);

  // --- Handle WS message ---
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const msg: HeartbeatWsMessage = JSON.parse(event.data as string);

      switch (msg.type) {
        case 'connected':
          console.log('[Heartbeat WS] Server acknowledged connection');
          eventBus.system('heartbeat_ws_connected', 'Heartbeat WebSocket connected to NAS', 'success', {
            endpoint: endpointRef.current,
          });
          break;

        case 'heartbeat':
          if (msg.memberId && msg.memberType && msg.presence) {
            applyHeartbeat({
              memberId: msg.memberId,
              memberType: msg.memberType,
              presence: msg.presence,
              heartbeatCount: msg.heartbeatCount ?? 0,
              signalMessage: msg.signalMessage,
              timestamp: msg.timestamp || new Date().toISOString(),
            });
          }
          break;

        case 'batch_heartbeat':
          if (msg.members && Array.isArray(msg.members)) {
            for (const member of msg.members) {
              applyHeartbeat(member);
            }
            eventBus.system('heartbeat_batch', `Batch heartbeat: ${msg.members.length} members`, 'info', {
              count: msg.members.length,
            });
          }
          break;

        case 'ping':
          // Respond with pong
          wsRef.current?.send(JSON.stringify({ type: 'pong' }));
          break;

        case 'error':
          console.warn('[Heartbeat WS] Server error:', msg.error);
          eventBus.system('heartbeat_ws_error', `Heartbeat WS error: ${msg.error}`, 'error');
          break;

        default:
          break;
      }
    } catch {
      // Ignore parse errors
    }
  }, [applyHeartbeat]);

  // --- Start simulation fallback ---
  const startSimulation = useCallback(() => {
    if (simulationTimerRef.current) return; // Already running

    simulationTimerRef.current = setInterval(() => {
      if (!mountedRef.current) return;

      // Read current state from refs (always fresh, no closure stale data)
      const currentAgents = agentProfilesRef.current;
      const currentDevices = deviceMembersRef.current;
      const { profiles: newProfiles, deviceMembers: newDevices } = simulateHeartbeats(currentAgents, currentDevices);

      // Update both states independently (React 18 auto-batches)
      setAgentProfiles(newProfiles);
      setDeviceMembers(newDevices);

      // Persist to localStorage
      saveAgentProfiles(newProfiles);
      saveDeviceMembers(newDevices);

      const onlineCount = Object.values(newProfiles).filter(p => p.presence === 'online').length
        + Object.values(newDevices).filter(d => d.presence === 'online').length;

      eventBus.system('heartbeat', `Family heartbeat pulse (SIM) — ${onlineCount} members online`, 'info', {
        source: 'simulation',
        onlineCount,
      });

      setLastHeartbeat(new Date().toISOString());
      setTotalHeartbeats(prev => prev + 1);
    }, SIMULATION_INTERVAL);
  }, []);

  // --- Stop simulation ---
  const stopSimulation = useCallback(() => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
  }, []);

  // --- Connect to WebSocket ---
  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = getHeartbeatWsUrl();

    endpointRef.current = url;

    try {
      setWsStatus('connecting');
      const ws = new WebSocket(url);

      // Connection timeout
      const connectTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
        }
      }, WS_CONNECT_TIMEOUT);

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close();

          return; }
        clearTimeout(connectTimeout);
        console.log(`[Heartbeat WS] Connected to ${url}`);
        setWsStatus('connected');
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;

        // Stop simulation — we have real data now
        stopSimulation();

        // Subscribe to heartbeat channel
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['heartbeat'],
        }));

        eventBus.system('heartbeat_ws', `Heartbeat WS connected: ${url}`, 'success');
      };

      ws.onmessage = handleMessage;

      ws.onclose = () => {
        if (!mountedRef.current) return;
        clearTimeout(connectTimeout);
        console.log(`[Heartbeat WS] Disconnected from ${url}`);
        setWsStatus('simulation');
        wsRef.current = null;

        // Start simulation fallback
        startSimulation();

        // Schedule reconnect
        scheduleReconnect();
      };

      ws.onerror = () => {
        clearTimeout(connectTimeout);
        // onclose will fire after onerror
      };

      wsRef.current = ws;
    } catch {
      setWsStatus('simulation');
      startSimulation();
      scheduleReconnect();
    }
  }, [handleMessage, startSimulation, stopSimulation]);

  // --- Schedule reconnect ---
  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * 1.5,
          MAX_RECONNECT_DELAY,
        );
        connect();
      }
    }, reconnectDelayRef.current);
  }, [connect]);

  // --- Lifecycle ---
  useEffect(() => {
    mountedRef.current = true;

    // Attempt real WebSocket first
    connect();

    // If WS doesn't connect within timeout, simulation starts via onclose/onerror

    return () => {
      mountedRef.current = false;
      stopSimulation();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, stopSimulation]);

  // --- Persist agent profiles to NAS periodically (every 60s) ---
  useEffect(() => {
    const interval = setInterval(() => {
      const profilesArray = Object.values(agentProfiles);

      if (profilesArray.length > 0) {
        writeAgentProfiles(profilesArray).catch(() => {
          // Silent fail — localStorage already saved synchronously
        });
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [agentProfiles]);

  return {
    agentProfiles,
    deviceMembers,
    wsStatus,
    lastHeartbeat,
    totalHeartbeats,
    endpoint: endpointRef.current,
  };
}