// ============================================================
// YYC3 Hacker Chatbot — Remote Docker Compose Deployment
// Phase 22: One-click container creation via Docker Engine API
//
// Features:
//   1. Service template registry (heartbeat-ws, sqlite-proxy, etc.)
//   2. Docker image pull + container create + start workflow
//   3. Real-time deployment log stream
//   4. Container health check post-deploy
//   5. Direct Docker Engine API (192.168.3.45:2375)
//
// Design: "万象归元于云枢; 深栈智启新纪元"
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Rocket, Box, Play, Square, Trash2, RefreshCw,
  Loader2, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, Terminal, Zap, Download, Settings,
  Shield, Eye, Clock, Container, Layers,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { docker, loadDockerConfig, type DockerContainer, type DockerSystemInfo } from "@/lib/nas-client";
import { eventBus } from "@/lib/event-bus";

// ============================================================
// Types
// ============================================================

interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  image: string;
  containerName: string;
  ports: Array<{ host: number; container: number; protocol: string }>;
  env: Record<string, string>;
  volumes: Array<{ host: string; container: string; mode: string }>;
  command?: string[];
  labels: Record<string, string>;
  healthcheck?: {
    test: string[];
    interval: string;
    timeout: string;
    retries: number;
  };
  restartPolicy: string;
  category: 'core' | 'monitoring' | 'data' | 'ai';
}

type DeployStep = 'idle' | 'pulling' | 'creating' | 'starting' | 'verifying' | 'done' | 'error';

interface DeployLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

// ============================================================
// Service Templates
// ============================================================

const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: 'heartbeat-ws',
    name: 'YYC3 Heartbeat WebSocket',
    description: 'Family presence heartbeat relay service (ws://NAS:9090/ws/heartbeat)',
    image: 'node:20-alpine',
    containerName: 'yyc3-heartbeat-ws',
    ports: [{ host: 9090, container: 9090, protocol: 'tcp' }],
    env: { NODE_ENV: 'production' },
    volumes: [
      { host: '/Volume2/yyc3/heartbeat/heartbeat-server.js', container: '/app/server.js', mode: 'ro' },
    ],
    command: ['node', 'server.js'],
    labels: { 'com.yyc3.service': 'heartbeat-ws', 'com.yyc3.phase': '22' },
    healthcheck: {
      test: ['CMD', 'node', '-e', "const ws=new(require('ws'))('ws://localhost:9090/ws/heartbeat');ws.on('open',()=>{ws.close();process.exit(0)});ws.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),3000)"],
      interval: '30s',
      timeout: '5s',
      retries: 3,
    },
    restartPolicy: 'unless-stopped',
    category: 'core',
  },
  {
    id: 'sqlite-proxy',
    name: 'YYC3 SQLite HTTP Proxy',
    description: 'SQLite over HTTP API for browser-based DB access (http://NAS:8484)',
    image: 'yyc3/sqlite-http:latest',
    containerName: 'yyc3-sqlite-proxy',
    ports: [{ host: 8484, container: 8484, protocol: 'tcp' }],
    env: { DB_PATH: '/data/yyc3.db', PORT: '8484' },
    volumes: [
      { host: '/Volume2/yyc3/data', container: '/data', mode: 'rw' },
    ],
    labels: { 'com.yyc3.service': 'sqlite-proxy', 'com.yyc3.phase': '15' },
    restartPolicy: 'unless-stopped',
    category: 'data',
  },
  {
    id: 'redis-cache',
    name: 'Redis Cache',
    description: 'High-performance key-value cache for session & metrics buffering',
    image: 'redis:7-alpine',
    containerName: 'yyc3-redis',
    ports: [{ host: 6379, container: 6379, protocol: 'tcp' }],
    env: {},
    volumes: [
      { host: '/Volume2/yyc3/redis-data', container: '/data', mode: 'rw' },
    ],
    command: ['redis-server', '--appendonly', 'yes'],
    labels: { 'com.yyc3.service': 'redis-cache', 'com.yyc3.phase': '22' },
    restartPolicy: 'unless-stopped',
    category: 'data',
  },
  {
    id: 'mcp-server',
    name: 'MCP Tool Server',
    description: 'Model Context Protocol tool execution server (JSON-RPC 2.0)',
    image: 'python:3.12-slim',
    containerName: 'yyc3-mcp-server',
    ports: [{ host: 8080, container: 8080, protocol: 'tcp' }],
    env: { PYTHONUNBUFFERED: '1' },
    volumes: [
      { host: '/Volume2/yyc3/mcp-server', container: '/app', mode: 'rw' },
    ],
    command: ['python', 'main.py'],
    labels: { 'com.yyc3.service': 'mcp-server', 'com.yyc3.phase': '16' },
    restartPolicy: 'unless-stopped',
    category: 'ai',
  },
];

// ============================================================
// Docker API Helpers (Extended)
// ============================================================

const dockerConfig = loadDockerConfig();

function dockerApiUrl(path: string): string {
  return `http://${dockerConfig.host}:${dockerConfig.port}/${dockerConfig.apiVersion}${path}`;
}

async function dockerApiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(dockerApiUrl(path), {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Docker API ${res.status}: ${text}`);
    }

    const contentType = res.headers.get('content-type');
    if (contentType?.includes('json')) {
      return await res.json() as T;
    }
    return {} as T;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Create container from template
async function createContainerFromTemplate(template: ServiceTemplate): Promise<string> {
  const portBindings: Record<string, Array<{ HostPort: string }>> = {};
  const exposedPorts: Record<string, Record<string, never>> = {};

  for (const port of template.ports) {
    const key = `${port.container}/${port.protocol}`;
    portBindings[key] = [{ HostPort: String(port.host) }];
    exposedPorts[key] = {};
  }

  const binds = template.volumes.map(v => `${v.host}:${v.container}:${v.mode}`);

  const body: Record<string, unknown> = {
    Image: template.image,
    ExposedPorts: exposedPorts,
    Env: Object.entries(template.env).map(([k, v]) => `${k}=${v}`),
    Labels: template.labels,
    WorkingDir: '/app',
    HostConfig: {
      PortBindings: portBindings,
      Binds: binds,
      RestartPolicy: {
        Name: template.restartPolicy === 'unless-stopped' ? 'unless-stopped' : 'no',
      },
    },
  };

  if (template.command) {
    body.Cmd = template.command;
  }

  if (template.healthcheck) {
    body.Healthcheck = {
      Test: template.healthcheck.test,
      Interval: parseDuration(template.healthcheck.interval),
      Timeout: parseDuration(template.healthcheck.timeout),
      Retries: template.healthcheck.retries,
    };
  }

  const result = await dockerApiCall<{ Id: string }>(
    `/containers/create?name=${template.containerName}`,
    { method: 'POST', body: JSON.stringify(body) }
  );

  return result.Id;
}

function parseDuration(s: string): number {
  // Convert "30s" -> nanoseconds
  const match = s.match(/^(\d+)([smh])$/);
  if (!match) return 30_000_000_000;
  const val = parseInt(match[1]);
  const unit = match[2];
  const multiplier = unit === 'h' ? 3_600_000_000_000 : unit === 'm' ? 60_000_000_000 : 1_000_000_000;
  return val * multiplier;
}

// ============================================================
// Sub-components
// ============================================================

function DeployLogViewer({ logs }: { logs: DeployLog[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [logs.length]);

  const levelColors: Record<string, string> = {
    info: 'text-zinc-400',
    success: 'text-green-400',
    warn: 'text-amber-400',
    error: 'text-red-400',
  };

  const levelIcons: Record<string, string> = {
    info: '>>',
    success: '++',
    warn: '!!',
    error: '**',
  };

  return (
    <div
      ref={scrollRef}
      className="h-[200px] bg-black/50 border border-white/5 rounded-lg p-3 overflow-y-auto font-mono text-[10px] space-y-0.5"
    >
      {logs.length === 0 ? (
        <div className="text-zinc-600 text-center py-8">Deployment log will appear here...</div>
      ) : (
        logs.map(log => (
          <div key={log.id} className={cn("flex gap-2", levelColors[log.level])}>
            <span className="text-zinc-600 shrink-0">{log.timestamp}</span>
            <span className="shrink-0">{levelIcons[log.level] || '>>'}</span>
            <span>{log.message}</span>
          </div>
        ))
      )}
    </div>
  );
}

// ============================================================
// Service Template Card
// ============================================================

function ServiceTemplateCard({
  template,
  existingContainers,
  onDeploy,
  isDeploying,
}: {
  template: ServiceTemplate;
  existingContainers: DockerContainer[];
  onDeploy: (template: ServiceTemplate) => void;
  isDeploying: boolean;
}) {
  const existing = existingContainers.find(c =>
    c.Names.some(n => n === `/${template.containerName}`)
  );

  const isRunning = existing?.State === 'running';
  const isStopped = existing?.State === 'exited';
  const exists = !!existing;

  const categoryColors: Record<string, string> = {
    core: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    monitoring: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    data: 'text-green-400 border-green-500/20 bg-green-500/5',
    ai: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
  };

  return (
    <Card className={cn(
      "bg-zinc-900/40 border-white/5 transition-all hover:border-white/10",
      isRunning && "ring-1 ring-green-500/20"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            {template.name}
          </CardTitle>
          <Badge variant="outline" className={cn("text-[8px] h-4", categoryColors[template.category])}>
            {template.category}
          </Badge>
        </div>
        <CardDescription className="text-[10px]">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Container Info */}
        <div className="space-y-1.5 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Image</span>
            <span className="text-zinc-300">{template.image}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Container</span>
            <span className="text-zinc-300">{template.containerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Ports</span>
            <span className="text-zinc-300">
              {template.ports.map(p => `${p.host}:${p.container}`).join(', ')}
            </span>
          </div>
          {template.volumes.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Volumes</span>
              <span className="text-zinc-300 text-right truncate max-w-[200px]">
                {template.volumes.length} mount(s)
              </span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border",
          isRunning ? "bg-green-500/5 border-green-500/10" :
          isStopped ? "bg-amber-500/5 border-amber-500/10" :
          exists ? "bg-zinc-800/50 border-white/5" :
          "bg-zinc-800/30 border-white/5"
        )}>
          {isRunning ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          ) : isStopped ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : exists ? (
            <Square className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <Box className="w-3.5 h-3.5 text-zinc-600" />
          )}
          <span className={cn(
            "text-[10px] font-mono",
            isRunning ? "text-green-400" :
            isStopped ? "text-amber-400" :
            "text-zinc-500"
          )}>
            {isRunning ? `Running — ${existing!.Status}` :
             isStopped ? `Stopped — ${existing!.Status}` :
             exists ? existing!.State :
             'Not deployed'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!exists ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
              onClick={() => onDeploy(template)}
              disabled={isDeploying}
            >
              {isDeploying ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Rocket className="w-3.5 h-3.5 mr-1.5" />
              )}
              Deploy
            </Button>
          ) : isRunning ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 text-amber-400 hover:bg-amber-500/10"
                onClick={async () => {
                  try { await docker.containers.stop(existing!.Id); } catch { /* */ }
                }}
              >
                <Square className="w-3 h-3 mr-1" /> Stop
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-cyan-400 hover:bg-cyan-500/10"
                onClick={async () => {
                  try { await docker.containers.restart(existing!.Id); } catch { /* */ }
                }}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-green-500/20 text-green-400 hover:bg-green-500/10"
                onClick={async () => {
                  try { await docker.containers.start(existing!.Id); } catch { /* */ }
                }}
              >
                <Play className="w-3 h-3 mr-1" /> Start
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400 hover:bg-red-500/10"
                onClick={async () => {
                  try { await docker.containers.remove(existing!.Id, true); } catch { /* */ }
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Main Component
// ============================================================

export function RemoteDockerDeploy() {
  const [dockerConnected, setDockerConnected] = React.useState<boolean | null>(null);
  const [dockerInfo, setDockerInfo] = React.useState<DockerSystemInfo | null>(null);
  const [containers, setContainers] = React.useState<DockerContainer[]>([]);
  const [deployLogs, setDeployLogs] = React.useState<DeployLog[]>([]);
  const [activeDeployId, setActiveDeployId] = React.useState<string | null>(null);
  const [deployStep, setDeployStep] = React.useState<DeployStep>('idle');
  const [loading, setLoading] = React.useState(true);

  const addLog = React.useCallback((level: DeployLog['level'], message: string) => {
    setDeployLogs(prev => [...prev, {
      id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      message,
    }]);
  }, []);

  // Initialize
  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const ok = await docker.ping();
      setDockerConnected(ok);

      if (ok) {
        const [info, containerList] = await Promise.all([
          docker.info().catch(() => null),
          docker.containers.list(true).catch(() => []),
        ]);
        setDockerInfo(info);
        setContainers(containerList);
      }
    } catch {
      setDockerConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  // Deploy a service
  const deployService = React.useCallback(async (template: ServiceTemplate) => {
    setActiveDeployId(template.id);
    setDeployLogs([]);

    addLog('info', `Starting deployment: ${template.name}`);
    addLog('info', `Target: ${dockerConfig.host}:${dockerConfig.port}`);

    // Step 1: Pull image
    setDeployStep('pulling');
    addLog('info', `Pulling image: ${template.image}...`);
    try {
      const pullUrl = dockerApiUrl(`/images/create?fromImage=${encodeURIComponent(template.image)}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      
      const res = await fetch(pullUrl, {
        method: 'POST',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text();
        // Image might already exist locally
        if (!text.includes('not found')) {
          addLog('warn', `Image pull warning: ${text.slice(0, 100)}`);
        }
      }
      
      addLog('success', `Image ready: ${template.image}`);
    } catch (err) {
      addLog('warn', `Image pull skipped (may exist locally): ${err instanceof Error ? err.message : 'timeout'}`);
    }

    // Step 2: Create container
    setDeployStep('creating');
    addLog('info', `Creating container: ${template.containerName}...`);
    let containerId: string;
    try {
      containerId = await createContainerFromTemplate(template);
      addLog('success', `Container created: ${containerId.slice(0, 12)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('Conflict') || msg.includes('already in use')) {
        addLog('warn', `Container "${template.containerName}" already exists. Attempting start...`);
        // Try to find and start existing container
        const existing = containers.find(c => c.Names.some(n => n === `/${template.containerName}`));
        if (existing) {
          containerId = existing.Id;
        } else {
          addLog('error', `Cannot find existing container. Remove it manually first.`);
          setDeployStep('error');
          eventBus.system('deploy_error', `Deploy failed: ${template.name} - container conflict`, 'error');
          setActiveDeployId(null);
          return;
        }
      } else {
        addLog('error', `Container creation failed: ${msg}`);
        setDeployStep('error');
        eventBus.system('deploy_error', `Deploy failed: ${template.name} - ${msg}`, 'error');
        setActiveDeployId(null);
        return;
      }
    }

    // Step 3: Start container
    setDeployStep('starting');
    addLog('info', `Starting container...`);
    try {
      await dockerApiCall(`/containers/${containerId}/start`, { method: 'POST' });
      addLog('success', `Container started successfully!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('304') || msg.includes('already started')) {
        addLog('info', `Container was already running.`);
      } else {
        addLog('error', `Start failed: ${msg}`);
        setDeployStep('error');
        setActiveDeployId(null);
        return;
      }
    }

    // Step 4: Verify
    setDeployStep('verifying');
    addLog('info', `Verifying deployment...`);
    await new Promise(r => setTimeout(r, 2000));

    try {
      const updatedContainers = await docker.containers.list(true);
      setContainers(updatedContainers);
      const deployed = updatedContainers.find(c =>
        c.Names.some(n => n === `/${template.containerName}`)
      );

      if (deployed?.State === 'running') {
        addLog('success', `Deployment verified: ${template.containerName} is RUNNING`);
        addLog('success', `Ports: ${template.ports.map(p => `${p.host}:${p.container}`).join(', ')}`);
        setDeployStep('done');
        eventBus.system('deploy_success', `${template.name} deployed successfully on ${dockerConfig.host}`, 'success', {
          container: template.containerName,
          image: template.image,
        });
      } else {
        addLog('warn', `Container state: ${deployed?.State || 'unknown'}. Check logs manually.`);
        setDeployStep('done');
      }
    } catch {
      addLog('warn', `Could not verify container state. It may still be starting.`);
      setDeployStep('done');
    }

    setActiveDeployId(null);
  }, [addLog, containers]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl text-white tracking-tight flex items-center gap-3">
            <Rocket className="w-6 h-6 text-purple-400" />
            Remote Docker Deployment
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            One-click container deployment via Docker Engine API
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-purple-500/20 text-purple-400 bg-purple-500/5 text-[10px]">
            Phase 22
          </Badge>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Docker Engine Status */}
      <Card className="bg-zinc-900/40 border-white/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                dockerConnected ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                {loading ? (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                ) : dockerConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm text-white font-mono">
                  Docker Engine {dockerConnected ? 'Connected' : 'Disconnected'}
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono">
                  http://{dockerConfig.host}:{dockerConfig.port}/{dockerConfig.apiVersion}
                </p>
              </div>
            </div>

            {dockerInfo && (
              <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Box className="w-3 h-3" />
                  <span>{dockerInfo.ContainersRunning}/{dockerInfo.Containers} running</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download className="w-3 h-3" />
                  <span>{dockerInfo.Images} images</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Settings className="w-3 h-3" />
                  <span>v{dockerInfo.ServerVersion}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  <span>{dockerInfo.NCPU} CPU / {Math.round(dockerInfo.MemTotal / 1024 / 1024 / 1024)}GB</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Templates Grid */}
      <div>
        <h3 className="text-sm text-zinc-400 font-mono mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          SERVICE TEMPLATES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICE_TEMPLATES.map(template => (
            <ServiceTemplateCard
              key={template.id}
              template={template}
              existingContainers={containers}
              onDeploy={deployService}
              isDeploying={activeDeployId === template.id}
            />
          ))}
        </div>
      </div>

      {/* Deployment Log */}
      <Card className="bg-zinc-900/40 border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-400" />
              Deployment Log
            </div>
            {deployStep !== 'idle' && (
              <Badge variant="outline" className={cn(
                "text-[8px] h-5",
                deployStep === 'done' ? "border-green-500/20 text-green-400" :
                deployStep === 'error' ? "border-red-500/20 text-red-400" :
                "border-cyan-500/20 text-cyan-400"
              )}>
                {deployStep === 'pulling' && <><Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" /> Pulling image...</>}
                {deployStep === 'creating' && <><Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" /> Creating container...</>}
                {deployStep === 'starting' && <><Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" /> Starting...</>}
                {deployStep === 'verifying' && <><Eye className="w-2.5 h-2.5 mr-1" /> Verifying...</>}
                {deployStep === 'done' && <><CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Complete</>}
                {deployStep === 'error' && <><XCircle className="w-2.5 h-2.5 mr-1" /> Failed</>}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeployLogViewer logs={deployLogs} />
        </CardContent>
      </Card>

      {/* Running Containers Summary */}
      {containers.length > 0 && (
        <Card className="bg-zinc-900/40 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Box className="w-4 h-4 text-cyan-400" />
              Active Containers ({containers.filter(c => c.State === 'running').length}/{containers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {containers.slice(0, 10).map(container => (
                <div
                  key={container.Id}
                  className="flex items-center justify-between px-3 py-2 bg-black/30 rounded-lg border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      container.State === 'running' ? "bg-green-500 animate-pulse" : "bg-zinc-600"
                    )} />
                    <span className="text-xs text-white font-mono">{container.Names[0]?.replace('/', '')}</span>
                    <span className="text-[9px] text-zinc-600 font-mono">{container.Image}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-mono",
                      container.State === 'running' ? "text-green-400" : "text-zinc-500"
                    )}>
                      {container.Status}
                    </span>
                    {container.Ports[0]?.PublicPort && (
                      <Badge variant="outline" className="text-[8px] h-4 border-white/10 text-zinc-500">
                        :{container.Ports[0].PublicPort}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}