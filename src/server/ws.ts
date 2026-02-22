// ============================================================
// YYC3 — WebSocket Server (Real-time Metrics Broadcast)
// Phase 10: Server-side WebSocket with pg persistence
//
// 协议说明:
// - Client → Server: { type: 'subscribe', channels: ['metrics','logs'] }
// - Server → Client: { type: 'metrics', data: ClusterMetrics }
// - Server → Client: { type: 'log', data: LogEntry }
// - Server → Client: { type: 'heartbeat', timestamp: number }
// ============================================================

import { WebSocketServer, WebSocket } from 'ws';
import { Pool } from 'pg';
import http from 'http';

interface WsClient {
  ws: WebSocket;
  subscriptions: Set<string>;
  lastPing: number;
}

export function createWebSocketServer(server: http.Server, pool: Pool): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients: Map<string, WsClient> = new Map();
  let clientIdCounter = 0;

  // === Connection Handler ===
  wss.on('connection', (ws: WebSocket) => {
    const clientId = `ws-${++clientIdCounter}`;
    const client: WsClient = {
      ws,
      subscriptions: new Set(['metrics', 'logs', 'heartbeat']),
      lastPing: Date.now(),
    };
    clients.set(clientId, client);

    console.log(`[WS] Client connected: ${clientId} (total: ${clients.size})`);

    // Send welcome
    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      timestamp: Date.now(),
      availableChannels: ['metrics', 'logs', 'heartbeat', 'agents'],
    }));

    // Handle messages from client
    ws.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        switch (msg.type) {
          case 'subscribe':
            if (Array.isArray(msg.channels)) {
              msg.channels.forEach((ch: string) => client.subscriptions.add(ch));
            }
            break;
          case 'unsubscribe':
            if (Array.isArray(msg.channels)) {
              msg.channels.forEach((ch: string) => client.subscriptions.delete(ch));
            }
            break;
          case 'pong':
            client.lastPing = Date.now();
            break;
          default:
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`[WS] Client disconnected: ${clientId} (total: ${clients.size})`);
    });

    ws.on('error', (err: Error) => {
      console.error(`[WS] Client error ${clientId}:`, err.message);
      clients.delete(clientId);
    });
  });

  // === Broadcast Utility ===
  function broadcast(channel: string, data: unknown): void {
    const payload = JSON.stringify({ type: channel, data, timestamp: Date.now() });
    for (const [, client] of clients) {
      if (client.ws.readyState === WebSocket.OPEN && client.subscriptions.has(channel)) {
        client.ws.send(payload);
      }
    }
  }

  // === Metrics Collection & Broadcast (every 2s) ===
  const HEARTBEAT_MS = parseInt(process.env.WS_HEARTBEAT_MS || '2000', 10);

  setInterval(async () => {
    if (clients.size === 0) return;

    try {
      // Query latest metrics for all nodes
      const { rows } = await pool.query(`
        SELECT DISTINCT ON (node_id, metric_type)
          node_id, metric_type, value, unit, recorded_at
        FROM yyc3_metrics
        ORDER BY node_id, metric_type, recorded_at DESC
      `);

      // Build cluster metrics object
      const clusterMetrics: Record<string, Record<string, number>> = {};
      for (const row of rows) {
        if (!clusterMetrics[row.node_id]) clusterMetrics[row.node_id] = {};
        clusterMetrics[row.node_id][row.metric_type] = row.value;
      }

      broadcast('metrics', clusterMetrics);
    } catch (err) {
      console.error('[WS] Metrics query error:', (err as Error).message);
    }
  }, HEARTBEAT_MS);

  // === Heartbeat (every 10s) ===
  setInterval(() => {
    broadcast('heartbeat', { timestamp: Date.now(), clients: clients.size });

    // Prune stale connections
    const now = Date.now();
    for (const [id, client] of clients) {
      if (now - client.lastPing > 60000) {
        client.ws.terminate();
        clients.delete(id);
        console.log(`[WS] Pruned stale client: ${id}`);
      }
    }
  }, 10000);

  // === Log Broadcast (called externally when new log is created) ===
  // You can call broadcastLog from routes.ts after inserting a log:
  //   import { broadcastLog } from './ws';
  //   broadcastLog({ level, source, message });
  (globalThis as Record<string, unknown>).__yyc3_broadcast = broadcast;

  console.log('[WS] WebSocket server initialized');
  return wss;
}
