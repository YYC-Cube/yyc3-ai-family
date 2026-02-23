// ============================================================
// YYC3 Hacker Chatbot — Docker Container Manager
// Phase 16.1: Infrastructure Dimension
//
// Features:
// - Docker system info overview
// - Container list with state indicators
// - Start/Stop/Restart/Remove operations
// - Container logs viewer
// - Fallback to mock data when NAS Docker API unreachable
// ============================================================

import {
  Box, Play, Square, RefreshCw, Terminal,
  Server, Cpu, Layers, Clock,
  AlertTriangle, Check,
  X, MemoryStick,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  docker,
  loadDockerConfig,
  saveDockerConfig,
  type DockerContainer,
  type DockerSystemInfo,
  type DockerConfig,
  MOCK_DOCKER_CONTAINERS,
  MOCK_DOCKER_INFO,
} from '@/lib/nas-client';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ============================================================
// Helpers
// ============================================================

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;

  return `${bytes} B`;
}

function containerName(c: DockerContainer): string {
  return c.Names?.[0]?.replace(/^\//, '') || c.Id.slice(0, 12);
}

const STATE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  running: { text: 'text-green-500', bg: 'bg-green-500', border: 'border-green-500/20' },
  exited: { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500/20' },
  paused: { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/20' },
  created: { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500/20' },
};

function stateColor(state: string) {
  return STATE_COLORS[state] || STATE_COLORS.exited;
}

// ============================================================
// Container Row
// ============================================================

function ContainerRow({
  container,
  onAction,
  actionLoading,
}: {
  container: DockerContainer;
  onAction: (id: string, action: 'start' | 'stop' | 'restart' | 'remove') => void;
  actionLoading: string | null;
}) {
  const [showLogs, setShowLogs] = React.useState(false);
  const [logs, setLogs] = React.useState<string | null>(null);
  const sc = stateColor(container.State);
  const name = containerName(container);
  const isLoading = actionLoading === container.Id;

  const handleViewLogs = async () => {
    if (showLogs) { setShowLogs(false);

      return; }
    setShowLogs(true);
    try {
      const text = await docker.containers.logs(container.Id, 50);

      setLogs(text);
    } catch {
      setLogs('[Mock] Container logs not available — Docker API unreachable');
    }
  };

  return (
    <div className="border border-white/5 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
      {/* Main Row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Status Dot */}
        <div className={cn('w-2 h-2 rounded-full shrink-0', sc.bg, container.State === 'running' && 'animate-pulse')} />

        {/* Container Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-200 truncate">{name}</span>
            <Badge variant="outline" className={cn('text-[8px] uppercase font-mono', sc.text, sc.border)}>
              {container.State}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              {container.Image}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {container.Status}
            </span>
          </div>
        </div>

        {/* Ports */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {container.Ports.filter(p => p.PublicPort).slice(0, 3).map((p, i) => (
            <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-zinc-500 border border-white/5">
              :{p.PublicPort}→{p.PrivatePort}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {container.State === 'running' ? (
            <>
              <Button
                variant="ghost" size="icon"
                className="h-6 w-6 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                onClick={() => onAction(container.Id, 'restart')}
                disabled={isLoading}
                title="Restart"
              >
                <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => onAction(container.Id, 'stop')}
                disabled={isLoading}
                title="Stop"
              >
                <Square className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost" size="icon"
              className="h-6 w-6 text-green-500 hover:text-green-400 hover:bg-green-500/10"
              onClick={() => onAction(container.Id, 'start')}
              disabled={isLoading}
              title="Start"
            >
              <Play className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost" size="icon"
            className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
            onClick={handleViewLogs}
            title="Logs"
          >
            <Terminal className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Logs Panel */}
      {showLogs && (
        <div className="border-t border-white/5 bg-black/40 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-3 py-1 border-b border-white/5">
            <span className="text-[9px] font-mono text-zinc-500">CONTAINER LOGS — {name}</span>
            <button onClick={() => setShowLogs(false)} className="text-zinc-600 hover:text-zinc-300">
              <X className="w-3 h-3" />
            </button>
          </div>
          <ScrollArea className="h-32">
            <pre className="p-3 text-[10px] font-mono text-zinc-400 whitespace-pre-wrap">
              {logs || 'Loading...'}
            </pre>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main: Docker Manager
// ============================================================

export function DockerManager() {
  const [containers, setContainers] = React.useState<DockerContainer[]>([]);
  const [sysInfo, setSysInfo] = React.useState<DockerSystemInfo | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [config, setConfig] = React.useState<DockerConfig>(loadDockerConfig);
  const [showConfig, setShowConfig] = React.useState(false);
  const addLog = useSystemStore(s => s.addLog);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [info, ctrs] = await Promise.all([
        docker.info(),
        docker.containers.list(true),
      ]);

      setSysInfo(info);
      setContainers(ctrs);
      setIsConnected(true);
      addLog('success', 'DOCKER', `Connected to Docker Engine ${info.ServerVersion} on ${info.Name}`);
    } catch {
      // Fallback to mock
      setSysInfo(MOCK_DOCKER_INFO);
      setContainers(MOCK_DOCKER_CONTAINERS);
      setIsConnected(false);
      addLog('warn', 'DOCKER', 'Docker API unreachable — using simulated data');
    }
    setIsLoading(false);
  }, [addLog]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (containerId: string, action: 'start' | 'stop' | 'restart' | 'remove') => {
    setActionLoading(containerId);
    const name = containerName(containers.find(c => c.Id === containerId)!);

    try {
      switch (action) {
        case 'start': await docker.containers.start(containerId); break;
        case 'stop': await docker.containers.stop(containerId); break;
        case 'restart': await docker.containers.restart(containerId); break;
        case 'remove': await docker.containers.remove(containerId, true); break;
      }
      addLog('success', 'DOCKER', `${action.toUpperCase()} ${name} — success`);
      // Refresh list
      setTimeout(() => loadData(), 500);
    } catch {
      // Mock the action locally
      setContainers(prev => prev.map(c => {
        if (c.Id !== containerId) return c;
        if (action === 'start') return { ...c, State: 'running', Status: 'Up < 1 second' };
        if (action === 'stop') return { ...c, State: 'exited', Status: 'Exited (0) just now' };
        if (action === 'restart') return { ...c, State: 'running', Status: 'Up < 1 second' };

        return c;
      }).filter(c => action !== 'remove' || c.Id !== containerId));
      addLog('info', 'DOCKER', `${action.toUpperCase()} ${name} — simulated (API offline)`);
    }
    setActionLoading(null);
  };

  const handleSaveConfig = () => {
    saveDockerConfig(config);
    setShowConfig(false);
    addLog('success', 'DOCKER', `Config saved: ${config.host}:${config.port}`);
    loadData();
  };

  const runningCount = containers.filter(c => c.State === 'running').length;
  const stoppedCount = containers.filter(c => c.State !== 'running').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Box className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-lg text-white tracking-tight">Docker 容器管理</h3>
            <p className="text-xs font-mono text-zinc-500">
              {sysInfo?.Name || 'NAS'} — {isConnected ? 'CONNECTED' : 'SIMULATION'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-mono border',
            isConnected
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          )}>
            <div className={cn('w-1.5 h-1.5 rounded-full', isConnected ? 'bg-green-500' : 'bg-amber-500')} />
            {isConnected ? 'LIVE' : 'MOCK'}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] font-mono border-white/10 text-zinc-400 gap-1"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Server className="w-3 h-3" />
            CONFIG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] font-mono border-white/10 text-zinc-400 gap-1"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
            REFRESH
          </Button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <Card className="bg-black/40 border-white/8 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4 space-y-3">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Docker Engine Configuration</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-mono text-zinc-600 block mb-1">HOST</label>
                <input
                  value={config.host}
                  onChange={e => setConfig(prev => ({ ...prev, host: e.target.value }))}
                  className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded text-xs font-mono text-zinc-200 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-600 block mb-1">PORT</label>
                <input
                  value={config.port}
                  onChange={e => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 2375 }))}
                  className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded text-xs font-mono text-zinc-200 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-600 block mb-1">API VERSION</label>
                <input
                  value={config.apiVersion}
                  onChange={e => setConfig(prev => ({ ...prev, apiVersion: e.target.value }))}
                  className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded text-xs font-mono text-zinc-200 focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-[10px] font-mono gap-1" onClick={handleSaveConfig}>
                <Check className="w-3 h-3" />
                SAVE
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px] font-mono border-white/10 gap-1" onClick={() => setShowConfig(false)}>
                <X className="w-3 h-3" />
                CANCEL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Info Overview */}
      {sysInfo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoCard icon={Box} label="Containers" value={`${runningCount} / ${containers.length}`} sub={`${stoppedCount} stopped`} color="text-cyan-500" />
          <InfoCard icon={Layers} label="Images" value={sysInfo.Images.toString()} sub={`Driver: ${sysInfo.Driver}`} color="text-blue-500" />
          <InfoCard icon={Cpu} label="CPU / Arch" value={`${sysInfo.NCPU} cores`} sub={sysInfo.Architecture} color="text-amber-500" />
          <InfoCard icon={MemoryStick} label="Memory" value={formatBytes(sysInfo.MemTotal)} sub={`Docker ${sysInfo.ServerVersion}`} color="text-purple-500" />
        </div>
      )}

      {/* Container List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Containers ({containers.length})</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[9px] font-mono border-green-500/20 text-green-500 bg-green-500/5">
              {runningCount} running
            </Badge>
            <Badge variant="outline" className="text-[9px] font-mono border-red-500/20 text-red-500 bg-red-500/5">
              {stoppedCount} stopped
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {containers
              .sort((a, b) => (a.State === 'running' ? 0 : 1) - (b.State === 'running' ? 0 : 1))
              .map(container => (
                <ContainerRow
                  key={container.Id}
                  container={container}
                  onAction={handleAction}
                  actionLoading={actionLoading}
                />
              ))}
          </div>
        )}
      </div>

      {/* Connection Notice */}
      {!isConnected && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] font-mono text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Docker Engine API ({config.host}:{config.port}) 不可达 — 显示模拟数据。
            请确保 NAS Docker 远程 API 已启用，或通过 CONFIG 修改端点。
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Info Card
// ============================================================

function InfoCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card className="bg-black/40 border-white/8">
      <CardContent className="p-3">
        <div className={cn('p-1.5 rounded-lg w-fit mb-2', color.replace('text-', 'bg-').replace('500', '500/10'))}>
          <Icon className={cn('w-3.5 h-3.5', color)} />
        </div>
        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className={cn('text-lg font-mono mt-0.5', color)}>{value}</p>
        <p className="text-[9px] font-mono text-zinc-600 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}