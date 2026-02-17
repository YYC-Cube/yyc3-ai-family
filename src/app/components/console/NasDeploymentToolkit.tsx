// ============================================================
// YYC3 Hacker Chatbot — NAS Deployment Toolkit
// Phase 21: Infrastructure Deployment & Connectivity Matrix
//
// Features:
// 1. NAS SQLite Table Manager (one-click CREATE TABLE execution)
// 2. WebSocket Heartbeat Service Deployer (Docker + script gen)
// 3. Full Service Connectivity Matrix (real-time endpoint testing)
// 4. Deployment Checklist (Phase 19-20 task tracking)
// 5. Event Bus integration for deployment events
//
// Design: "万象归元于云枢; 深栈智启新纪元"
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Rocket, Database, Wifi, WifiOff, Server, CheckCircle2,
  XCircle, Clock, Copy, Play, Loader2, RefreshCw,
  Terminal, FileCode, Box, Radio, AlertTriangle, Check,
  ChevronRight, Satellite, Zap, HardDrive,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  querySQLite,
  testSQLiteConnection,
  loadSQLiteConfig,
  loadDeviceConfigs,
  type DeviceConfig,
} from "@/lib/nas-client";
import { NAS_TABLE_DEFINITIONS } from "@/lib/persistence-engine";
import { eventBus } from "@/lib/event-bus";

// ============================================================
// Types
// ============================================================

interface TableStatus {
  name: string;
  sql: string;
  status: 'pending' | 'creating' | 'exists' | 'created' | 'error';
  error?: string;
  rowCount?: number;
}

interface ServiceTestResult {
  deviceId: string;
  serviceId: string;
  serviceName: string;
  status: 'untested' | 'testing' | 'up' | 'down' | 'timeout';
  latencyMs?: number;
  error?: string;
}

interface DeploymentTask {
  id: string;
  phase: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done' | 'blocked';
  category: 'database' | 'websocket' | 'docker' | 'config' | 'docs';
  autoCheck?: () => Promise<boolean>;
}

// ============================================================
// Deployment Tasks Definition
// ============================================================

const DEPLOYMENT_TASKS: DeploymentTask[] = [
  {
    id: 'dt-01',
    phase: 'Phase 20',
    title: 'Create knowledge_base table on NAS SQLite',
    description: 'Execute CREATE TABLE knowledge_base on NAS SQLite HTTP Proxy (192.168.3.45:8484)',
    status: 'pending',
    category: 'database',
  },
  {
    id: 'dt-02',
    phase: 'Phase 20',
    title: 'Create agent_profiles table on NAS SQLite',
    description: 'Execute CREATE TABLE agent_profiles on NAS SQLite HTTP Proxy (192.168.3.45:8484)',
    status: 'pending',
    category: 'database',
  },
  {
    id: 'dt-03',
    phase: 'Phase 20',
    title: 'Deploy Heartbeat WebSocket service on NAS',
    description: 'Deploy ws://192.168.3.45:9090/ws/heartbeat relay service via Docker container',
    status: 'pending',
    category: 'websocket',
  },
  {
    id: 'dt-04',
    phase: 'Phase 20',
    title: 'Verify NAS SQLite HTTP Proxy connectivity',
    description: 'Test connection to http://192.168.3.45:8484/api/db/query',
    status: 'pending',
    category: 'config',
  },
  {
    id: 'dt-05',
    phase: 'Phase 20',
    title: 'Verify Docker Engine API connectivity',
    description: 'Test connection to http://192.168.3.45:2375/v1.41/_ping',
    status: 'pending',
    category: 'docker',
  },
  {
    id: 'dt-06',
    phase: 'Phase 21',
    title: 'Update project documentation',
    description: 'Update YYC3-Hacker-Chatbot.md and YYC3-AI-Agent.md with Phase 19-20 content',
    status: 'done',
    category: 'docs',
  },
];

// ============================================================
// WebSocket Server Template Code
// ============================================================

const WS_SERVER_CODE = `// ============================================================
// YYC3 Family Heartbeat WebSocket Server
// Deploy on: 铁威马 F4-423 NAS (192.168.3.45:9090)
//
// Protocol:
//   Inbound:  { type: "subscribe", channels: ["heartbeat"] }
//             { type: "pong" }
//   Outbound: { type: "heartbeat", memberId, memberType, presence, ... }
//             { type: "batch_heartbeat", members: [...], timestamp }
//             { type: "ping" }
//             { type: "connected" }
// ============================================================

const WebSocket = require('ws');

const PORT = 9090;
const HEARTBEAT_INTERVAL = 8000; // 8s broadcast cycle
const PING_INTERVAL = 30000;     // 30s keepalive ping

const wss = new WebSocket.Server({ port: PORT, path: '/ws/heartbeat' });

console.log(\`[Heartbeat WS] Server listening on ws://0.0.0.0:\${PORT}/ws/heartbeat\`);

// --- Family members registry ---
const familyMembers = {
  agents: [
    { memberId: 'navigator',   memberType: 'agent',  name: '智愈·领航员' },
    { memberId: 'thinker',     memberType: 'agent',  name: '洞见·思想家' },
    { memberId: 'prophet',     memberType: 'agent',  name: '预见·先知' },
    { memberId: 'bole',        memberType: 'agent',  name: '知遇·伯乐' },
    { memberId: 'pivot',       memberType: 'agent',  name: '元启·天枢' },
    { memberId: 'sentinel',    memberType: 'agent',  name: '卫安·哨兵' },
    { memberId: 'grandmaster', memberType: 'agent',  name: '格物·宗师' },
  ],
  devices: [
    { memberId: 'm4-max',     memberType: 'device', name: 'MacBook Pro M4 Max' },
    { memberId: 'imac-m4',    memberType: 'device', name: 'iMac M4' },
    { memberId: 'matebook',   memberType: 'device', name: 'MateBook X Pro' },
    { memberId: 'yanyucloud', memberType: 'device', name: '铁威马 F4-423' },
  ],
};

const presenceStates = ['online', 'idle', 'busy', 'away', 'offline'];
const signals = [
  '陪伴无声，信号有心',
  '守护每一个数据包',
  '向量空间中等你',
  '静默守望，随时待命',
  '知识图谱正在生长',
  '正在深度思考中...',
  '安全边界已加固',
];

let heartbeatCounter = 0;

// --- Generate batch heartbeat ---
function generateBatchHeartbeat() {
  heartbeatCounter++;
  const all = [...familyMembers.agents, ...familyMembers.devices];
  const members = all.map(m => ({
    memberId: m.memberId,
    memberType: m.memberType,
    presence: presenceStates[Math.floor(Math.random() * 3)], // bias toward online
    heartbeatCount: heartbeatCounter,
    signalMessage: signals[Math.floor(Math.random() * signals.length)],
    timestamp: new Date().toISOString(),
  }));
  return { type: 'batch_heartbeat', members, timestamp: new Date().toISOString() };
}

// --- Connection handling ---
wss.on('connection', (ws) => {
  console.log('[Heartbeat WS] Client connected');
  ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'subscribe') {
        console.log('[Heartbeat WS] Client subscribed to:', msg.channels);
      } else if (msg.type === 'pong') {
        // Client is alive
      }
    } catch { /* ignore */ }
  });

  ws.on('close', () => {
    console.log('[Heartbeat WS] Client disconnected');
  });
});

// --- Broadcast heartbeats ---
setInterval(() => {
  const batch = generateBatchHeartbeat();
  const payload = JSON.stringify(batch);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}, HEARTBEAT_INTERVAL);

// --- Keepalive ping ---
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'ping' }));
    }
  });
}, PING_INTERVAL);
`;

const DOCKER_COMPOSE_YAML = `# ============================================================
# YYC3 Heartbeat WebSocket Service - Docker Compose
# Deploy on: 铁威马 F4-423 NAS
# ============================================================

version: '3.8'

services:
  yyc3-heartbeat-ws:
    image: node:20-alpine
    container_name: yyc3-heartbeat-ws
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./heartbeat-server.js:/app/server.js:ro
    command: node server.js
    ports:
      - "9090:9090"
    environment:
      - NODE_ENV=production
    labels:
      com.yyc3.service: heartbeat-ws
      com.yyc3.phase: "20"
    healthcheck:
      test: ["CMD", "node", "-e", "const ws=new(require('ws'))('ws://localhost:9090/ws/heartbeat');ws.on('open',()=>{ws.close();process.exit(0)});ws.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),3000)"]
      interval: 30s
      timeout: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
`;

// ============================================================
// Sub-components
// ============================================================

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "gap-1.5 text-[10px] transition-colors",
        copied ? "text-green-400" : "text-zinc-400 hover:text-white"
      )}
      onClick={handleCopy}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {label || (copied ? 'Copied!' : 'Copy')}
    </Button>
  );
}

// ============================================================
// 1. NAS Table Manager
// ============================================================

function NasTableManager() {
  const [tables, setTables] = React.useState<TableStatus[]>([
    { name: 'knowledge_base', sql: NAS_TABLE_DEFINITIONS.knowledge_base, status: 'pending' },
    { name: 'agent_profiles', sql: NAS_TABLE_DEFINITIONS.agent_profiles, status: 'pending' },
  ]);
  const [sqliteConnected, setSqliteConnected] = React.useState<boolean | null>(null);
  const [sqliteVersion, setSqliteVersion] = React.useState('');
  const [latency, setLatency] = React.useState(0);
  const [testing, setTesting] = React.useState(false);

  // Test SQLite connection
  const testConnection = React.useCallback(async () => {
    setTesting(true);
    try {
      const result = await testSQLiteConnection();
      setSqliteConnected(result.success);
      setLatency(result.latencyMs);
      if (result.version) setSqliteVersion(result.version);

      if (result.success) {
        eventBus.system('deploy_sqlite_ping', `NAS SQLite connected (${result.latencyMs}ms, v${result.version})`, 'success');
        // Check if tables exist
        for (let i = 0; i < tables.length; i++) {
          try {
            const check = await querySQLite(
              `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
              [tables[i].name]
            );
            if (check.rows.length > 0) {
              // Get row count
              const countResult = await querySQLite(`SELECT COUNT(*) FROM ${tables[i].name}`);
              const count = (countResult.rows[0]?.[0] as number) || 0;
              setTables(prev => {
                const next = [...prev];
                next[i] = { ...next[i], status: 'exists', rowCount: count };
                return next;
              });
            }
          } catch {
            // Table doesn't exist yet — status stays pending
          }
        }
      } else {
        eventBus.system('deploy_sqlite_ping', `NAS SQLite unreachable: ${result.error}`, 'error');
      }
    } catch {
      setSqliteConnected(false);
    } finally {
      setTesting(false);
    }
  }, [tables]);

  React.useEffect(() => {
    testConnection();
  }, []); // eslint-disable-line

  // Create table
  const createTable = React.useCallback(async (index: number) => {
    setTables(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'creating', error: undefined };
      return next;
    });

    try {
      await querySQLite(tables[index].sql.trim());
      // Also create indexes if it's knowledge_base
      if (tables[index].name === 'knowledge_base') {
        await querySQLite(`CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category)`);
        await querySQLite(`CREATE INDEX IF NOT EXISTS idx_kb_importance ON knowledge_base(importance)`);
      }

      setTables(prev => {
        const next = [...prev];
        next[index] = { ...next[index], status: 'created', rowCount: 0 };
        return next;
      });

      eventBus.persist('table_created', `Table "${tables[index].name}" created on NAS SQLite`, 'success', {
        table: tables[index].name,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setTables(prev => {
        const next = [...prev];
        next[index] = { ...next[index], status: 'error', error: msg };
        return next;
      });

      eventBus.persist('table_create_error', `Failed to create "${tables[index].name}": ${msg}`, 'error');
    }
  }, [tables]);

  const createAllTables = React.useCallback(async () => {
    for (let i = 0; i < tables.length; i++) {
      if (tables[i].status === 'pending' || tables[i].status === 'error') {
        await createTable(i);
      }
    }
  }, [tables, createTable]);

  const config = loadSQLiteConfig();

  return (
    <Card className="bg-zinc-900/50 border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="w-5 h-5 text-green-400" />
          NAS SQLite Table Manager
        </CardTitle>
        <CardDescription className="font-mono text-[10px]">
          Target: http://{config.host}:{config.port} | DB: {config.dbPath}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg border",
          sqliteConnected === null
            ? "bg-zinc-800/50 border-white/5"
            : sqliteConnected
            ? "bg-green-500/5 border-green-500/20"
            : "bg-red-500/5 border-red-500/20"
        )}>
          {testing ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          ) : sqliteConnected ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          <div className="flex-1 min-w-0">
            <span className={cn(
              "text-xs font-mono",
              sqliteConnected ? "text-green-400" : sqliteConnected === false ? "text-red-400" : "text-zinc-400"
            )}>
              {testing ? 'Testing connection...' : sqliteConnected ? `Connected (v${sqliteVersion})` : 'Unreachable'}
            </span>
            {sqliteConnected && <span className="text-[9px] text-zinc-500 ml-2">{latency}ms</span>}
          </div>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={testConnection} disabled={testing}>
            <RefreshCw className={cn("w-3 h-3", testing && "animate-spin")} />
          </Button>
        </div>

        {/* Tables */}
        <div className="space-y-2">
          {tables.map((table, idx) => (
            <div
              key={table.name}
              className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  table.status === 'exists' || table.status === 'created' ? "bg-green-500" :
                  table.status === 'creating' ? "bg-amber-500 animate-pulse" :
                  table.status === 'error' ? "bg-red-500" :
                  "bg-zinc-600"
                )} />
                <div>
                  <span className="text-sm text-white font-mono">{table.name}</span>
                  {table.rowCount !== undefined && (
                    <span className="text-[9px] text-zinc-500 ml-2">({table.rowCount} rows)</span>
                  )}
                  {table.error && (
                    <p className="text-[9px] text-red-400 mt-0.5">{table.error}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[8px] h-5",
                    table.status === 'exists' || table.status === 'created'
                      ? "border-green-500/20 text-green-400"
                      : table.status === 'error'
                      ? "border-red-500/20 text-red-400"
                      : "border-white/10 text-zinc-500"
                  )}
                >
                  {table.status === 'exists' ? 'EXISTS' :
                   table.status === 'created' ? 'CREATED' :
                   table.status === 'creating' ? 'CREATING...' :
                   table.status === 'error' ? 'ERROR' :
                   'PENDING'}
                </Badge>
                {(table.status === 'pending' || table.status === 'error') && sqliteConnected && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-cyan-400 hover:text-cyan-300"
                    onClick={() => createTable(idx)}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-green-500/20 text-green-400 hover:bg-green-500/10"
            onClick={createAllTables}
            disabled={!sqliteConnected || tables.every(t => t.status === 'exists' || t.status === 'created')}
          >
            <Rocket className="w-3.5 h-3.5 mr-1.5" />
            Create All Tables
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-400"
            onClick={testConnection}
            disabled={testing}
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", testing && "animate-spin")} />
            Refresh Status
          </Button>
        </div>

        {/* SQL Preview */}
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
            View SQL Definitions
          </summary>
          <div className="mt-2 space-y-2">
            {tables.map(table => (
              <div key={table.name} className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <CopyButton text={table.sql.trim()} />
                </div>
                <pre className="bg-black/50 border border-white/5 rounded-lg p-3 text-[10px] text-green-400 font-mono overflow-x-auto">
                  {table.sql.trim()}
                </pre>
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 2. WebSocket Service Deployer
// ============================================================

function WsServiceDeployer() {
  const [activeCode, setActiveCode] = React.useState<'server' | 'docker'>('server');
  const [wsTestStatus, setWsTestStatus] = React.useState<'untested' | 'testing' | 'up' | 'down'>('untested');
  const [wsTestLatency, setWsTestLatency] = React.useState(0);

  const testWsConnection = React.useCallback(async () => {
    setWsTestStatus('testing');
    const start = performance.now();

    try {
      const ws = new WebSocket('ws://192.168.3.45:9090/ws/heartbeat');
      const timeout = setTimeout(() => {
        ws.close();
        setWsTestStatus('down');
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        setWsTestLatency(Math.round(performance.now() - start));
        setWsTestStatus('up');
        ws.close();
        eventBus.system('deploy_ws_test', 'Heartbeat WS reachable', 'success');
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        setWsTestLatency(Math.round(performance.now() - start));
        setWsTestStatus('down');
        eventBus.system('deploy_ws_test', 'Heartbeat WS unreachable', 'warn');
      };
    } catch {
      setWsTestStatus('down');
    }
  }, []);

  return (
    <Card className="bg-zinc-900/50 border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="w-5 h-5 text-pink-400" />
          Heartbeat WebSocket Service
        </CardTitle>
        <CardDescription className="font-mono text-[10px]">
          Target: ws://192.168.3.45:9090/ws/heartbeat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WS Test */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg border",
          wsTestStatus === 'up' ? "bg-green-500/5 border-green-500/20" :
          wsTestStatus === 'down' ? "bg-red-500/5 border-red-500/20" :
          "bg-zinc-800/50 border-white/5"
        )}>
          {wsTestStatus === 'testing' ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          ) : wsTestStatus === 'up' ? (
            <Satellite className="w-4 h-4 text-green-400" />
          ) : wsTestStatus === 'down' ? (
            <WifiOff className="w-4 h-4 text-red-400" />
          ) : (
            <Wifi className="w-4 h-4 text-zinc-500" />
          )}
          <span className={cn(
            "text-xs font-mono",
            wsTestStatus === 'up' ? "text-green-400" :
            wsTestStatus === 'down' ? "text-red-400" : "text-zinc-400"
          )}>
            {wsTestStatus === 'testing' ? 'Testing WebSocket...' :
             wsTestStatus === 'up' ? `Connected (${wsTestLatency}ms)` :
             wsTestStatus === 'down' ? 'Not reachable — Deploy service first' :
             'Not tested'}
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={testWsConnection}>
            <RefreshCw className={cn("w-3 h-3", wsTestStatus === 'testing' && "animate-spin")} />
          </Button>
        </div>

        {/* Code Tabs */}
        <div className="flex items-center gap-1 border-b border-white/5 pb-1">
          <button
            onClick={() => setActiveCode('server')}
            className={cn(
              "px-3 py-1.5 rounded-t text-[10px] font-mono transition-colors",
              activeCode === 'server'
                ? "bg-white/10 text-green-400 border border-white/10 border-b-transparent"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <FileCode className="w-3 h-3 inline mr-1" />
            heartbeat-server.js
          </button>
          <button
            onClick={() => setActiveCode('docker')}
            className={cn(
              "px-3 py-1.5 rounded-t text-[10px] font-mono transition-colors",
              activeCode === 'docker'
                ? "bg-white/10 text-cyan-400 border border-white/10 border-b-transparent"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Box className="w-3 h-3 inline mr-1" />
            docker-compose.yml
          </button>
        </div>

        {/* Code Display */}
        <div className="relative">
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <CopyButton text={activeCode === 'server' ? WS_SERVER_CODE : DOCKER_COMPOSE_YAML} />
          </div>
          <ScrollArea className="h-[320px]">
            <pre className="bg-black/50 border border-white/5 rounded-lg p-4 text-[10px] font-mono overflow-x-auto">
              <code className={activeCode === 'server' ? "text-green-400/80" : "text-cyan-400/80"}>
                {activeCode === 'server' ? WS_SERVER_CODE : DOCKER_COMPOSE_YAML}
              </code>
            </pre>
          </ScrollArea>
        </div>

        {/* Deployment Steps */}
        <div className="space-y-2">
          <h4 className="text-[10px] text-zinc-500 font-mono tracking-wider">DEPLOYMENT STEPS</h4>
          {[
            { step: 1, text: 'Copy heartbeat-server.js to NAS: /Volume2/yyc3/heartbeat/', icon: Copy },
            { step: 2, text: 'Copy docker-compose.yml to same directory', icon: FileCode },
            { step: 3, text: 'SSH into NAS: ssh root@192.168.3.45', icon: Terminal },
            { step: 4, text: 'Run: cd /Volume2/yyc3/heartbeat && docker compose up -d', icon: Play },
            { step: 5, text: 'Verify: FamilyPresenceBoard will auto-switch to "Connected" mode', icon: CheckCircle2 },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[9px] font-mono text-zinc-500 shrink-0">
                {item.step}
              </div>
              <item.icon className="w-3 h-3 text-zinc-600 shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 3. Service Connectivity Matrix
// ============================================================

function ServiceConnectivityMatrix() {
  const [devices, setDevices] = React.useState<DeviceConfig[]>(loadDeviceConfigs);
  const [results, setResults] = React.useState<ServiceTestResult[]>([]);
  const [scanning, setScanning] = React.useState(false);
  const [lastScan, setLastScan] = React.useState<string | null>(null);

  const runFullScan = React.useCallback(async () => {
    setScanning(true);
    const newResults: ServiceTestResult[] = [];

    // Initialize all as testing
    for (const device of devices) {
      for (const svc of device.services.filter(s => s.enabled)) {
        newResults.push({
          deviceId: device.id,
          serviceId: svc.id,
          serviceName: svc.name,
          status: 'testing',
        });
      }
    }
    setResults([...newResults]);

    // Test each service
    for (let i = 0; i < newResults.length; i++) {
      const r = newResults[i];
      const device = devices.find(d => d.id === r.deviceId)!;
      const svc = device.services.find(s => s.id === r.serviceId)!;

      const start = performance.now();
      try {
        if (svc.protocol === 'ssh' || svc.protocol === 'tcp') {
          // Can't test from browser
          newResults[i] = { ...r, status: 'untested' };
        } else if (svc.protocol === 'ws') {
          // Test WebSocket
          const wsUp = await new Promise<boolean>((resolve) => {
            try {
              const ws = new WebSocket(`ws://${device.ip}:${svc.port}${svc.path || ''}`);
              const timeout = setTimeout(() => { ws.close(); resolve(false); }, 3000);
              ws.onopen = () => { clearTimeout(timeout); ws.close(); resolve(true); };
              ws.onerror = () => { clearTimeout(timeout); resolve(false); };
            } catch { resolve(false); }
          });
          const lat = Math.round(performance.now() - start);
          newResults[i] = { ...r, status: wsUp ? 'up' : 'down', latencyMs: lat };
        } else {
          // HTTP/HTTPS test
          const url = `${svc.protocol}://${device.ip}:${svc.port}${svc.path || '/'}`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          try {
            await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
            clearTimeout(timeout);
            const lat = Math.round(performance.now() - start);
            newResults[i] = { ...r, status: 'up', latencyMs: lat };
          } catch {
            clearTimeout(timeout);
            const lat = Math.round(performance.now() - start);
            newResults[i] = { ...r, status: lat > 2900 ? 'timeout' : 'down', latencyMs: lat };
          }
        }
      } catch {
        newResults[i] = { ...r, status: 'down' };
      }

      setResults([...newResults]);
    }

    setLastScan(new Date().toLocaleTimeString());
    setScanning(false);

    const upCount = newResults.filter(r => r.status === 'up').length;
    const totalTestable = newResults.filter(r => r.status !== 'untested').length;
    eventBus.system('deploy_scan', `Connectivity scan: ${upCount}/${totalTestable} services reachable`, upCount > 0 ? 'success' : 'warn');
  }, [devices]);

  // Group results by device
  const groupedResults = React.useMemo(() => {
    const grouped: Record<string, ServiceTestResult[]> = {};
    for (const r of results) {
      if (!grouped[r.deviceId]) grouped[r.deviceId] = [];
      grouped[r.deviceId].push(r);
    }
    return grouped;
  }, [results]);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'up': return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
      case 'down': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
      case 'timeout': return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      case 'testing': return <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />;
      default: return <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Satellite className="w-5 h-5 text-cyan-400" />
              Service Connectivity Matrix
            </CardTitle>
            <CardDescription className="font-mono text-[10px]">
              {lastScan ? `Last scan: ${lastScan}` : 'No scan performed yet'}
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
            onClick={runFullScan}
            disabled={scanning}
          >
            {scanning ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />}
            {scanning ? 'Scanning...' : 'Full Scan'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.length === 0 ? (
          <div className="text-center py-8 text-zinc-600">
            <Satellite className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Click "Full Scan" to test all endpoints</p>
            <p className="text-[10px] mt-1">Tests HTTP, HTTPS, and WebSocket services across 4 devices</p>
          </div>
        ) : (
          devices.map(device => {
            const deviceResults = groupedResults[device.id] || [];
            if (deviceResults.length === 0) return null;
            const upCount = deviceResults.filter(r => r.status === 'up').length;

            return (
              <div key={device.id} className="space-y-1.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Server className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs text-white font-mono">{device.displayName}</span>
                  <span className="text-[9px] text-zinc-600 font-mono">{device.ip}</span>
                  <div className="flex-1 h-px bg-white/5" />
                  <Badge variant="outline" className={cn(
                    "text-[8px] h-4",
                    upCount === deviceResults.length
                      ? "border-green-500/20 text-green-400"
                      : upCount > 0
                      ? "border-amber-500/20 text-amber-400"
                      : "border-red-500/20 text-red-400"
                  )}>
                    {upCount}/{deviceResults.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {deviceResults.map(r => (
                    <div
                      key={r.serviceId}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-mono",
                        r.status === 'up'
                          ? "bg-green-500/5 border-green-500/10"
                          : r.status === 'down' || r.status === 'timeout'
                          ? "bg-red-500/5 border-red-500/10"
                          : "bg-white/5 border-white/5"
                      )}
                    >
                      {statusIcon(r.status)}
                      <span className="text-zinc-300 flex-1 truncate">{r.serviceName}</span>
                      {r.latencyMs !== undefined && r.status !== 'untested' && (
                        <span className={cn(
                          "text-[8px]",
                          r.status === 'up' ? "text-green-500" : "text-red-500"
                        )}>
                          {r.latencyMs}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Summary */}
        {results.length > 0 && (
          <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-500">
            <span className="text-green-400">{results.filter(r => r.status === 'up').length} UP</span>
            <span className="text-red-400">{results.filter(r => r.status === 'down').length} DOWN</span>
            <span className="text-amber-400">{results.filter(r => r.status === 'timeout').length} TIMEOUT</span>
            <span className="text-zinc-500">{results.filter(r => r.status === 'untested').length} SKIP</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// 4. Deployment Checklist
// ============================================================

function DeploymentChecklist() {
  const [tasks, setTasks] = React.useState(DEPLOYMENT_TASKS);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nextStatus = t.status === 'done' ? 'pending' : 'done';
      return { ...t, status: nextStatus };
    }));
  };

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    database: Database,
    websocket: Radio,
    docker: Box,
    config: Server,
    docs: FileCode,
  };

  const categoryColors: Record<string, string> = {
    database: 'text-green-400',
    websocket: 'text-pink-400',
    docker: 'text-cyan-400',
    config: 'text-amber-400',
    docs: 'text-purple-400',
  };

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const progress = Math.round((doneCount / tasks.length) * 100);

  return (
    <Card className="bg-zinc-900/50 border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          Deployment Checklist
        </CardTitle>
        <CardDescription className="font-mono text-[10px]">
          Phase 19-21 deployment tasks · {doneCount}/{tasks.length} complete
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-[10px] font-mono text-zinc-500">{progress}% complete</div>

        {/* Tasks */}
        <div className="space-y-1.5">
          {tasks.map(task => {
            const Icon = categoryIcons[task.category] || Server;
            const color = categoryColors[task.category] || 'text-zinc-400';

            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                  task.status === 'done'
                    ? "bg-green-500/5 border-green-500/10 opacity-70"
                    : "bg-black/20 border-white/5 hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  task.status === 'done'
                    ? "border-green-500 bg-green-500/20"
                    : "border-zinc-600"
                )}>
                  {task.status === 'done' && <Check className="w-3 h-3 text-green-400" />}
                </div>
                <Icon className={cn("w-4 h-4 shrink-0", color)} />
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-xs",
                    task.status === 'done' ? "text-zinc-500 line-through" : "text-white"
                  )}>
                    {task.title}
                  </div>
                  <div className="text-[9px] text-zinc-600 truncate">{task.description}</div>
                </div>
                <Badge variant="outline" className="text-[8px] h-4 border-white/10 text-zinc-500 shrink-0">
                  {task.phase}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Main Export: NasDeploymentToolkit
// ============================================================

export function NasDeploymentToolkit() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl text-white tracking-tight flex items-center gap-3">
            <Rocket className="w-6 h-6 text-amber-400" />
            NAS Deployment Toolkit
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            深栈智启新纪元 — Infrastructure deployment & connectivity management
          </p>
        </div>
        <Badge variant="outline" className="border-amber-500/20 text-amber-400 bg-amber-500/5 text-[10px]">
          <HardDrive className="w-3 h-3 mr-1" />
          Phase 21
        </Badge>
      </div>

      {/* Deployment Checklist (top-level overview) */}
      <DeploymentChecklist />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* NAS Table Manager */}
        <NasTableManager />

        {/* WebSocket Service Deployer */}
        <WsServiceDeployer />
      </div>

      {/* Service Connectivity Matrix (full width) */}
      <ServiceConnectivityMatrix />
    </div>
  );
}