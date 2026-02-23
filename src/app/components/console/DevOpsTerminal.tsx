import {
  Terminal, GitBranch, GitCommit, Play, Pause, CheckCircle2,
  XCircle, Clock, RefreshCw, ChevronRight,
  Box, ArrowRight, Loader2, RotateCcw, Rocket,
  Layers, Tag, CircleDot,
  Workflow, Network,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { cn } from '@/lib/utils';

import { McpWorkflowsView } from './McpWorkflowsView';
import { WorkflowOrchestrator } from './WorkflowOrchestrator';

// --- Type Definitions ---

type PipelineStatus = 'running' | 'success' | 'failed' | 'pending' | 'skipped';
type ContainerStatus = 'running' | 'stopped' | 'restarting' | 'exited';

interface PipelineStage {
  id: string;
  name: string;
  status: PipelineStatus;
  duration: string;
  jobs: PipelineJob[];
}

interface PipelineJob {
  id: string;
  name: string;
  status: PipelineStatus;
  duration: string;
}

interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  cpu: string;
  mem: string;
  ports: string;
  uptime: string;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: string;
}

// --- Mock Data ---

const INITIAL_PIPELINES: PipelineStage[] = [
  {
    id: 'build', name: 'Build', status: 'success', duration: '2m 14s',
    jobs: [
      { id: 'compile', name: 'Compile TypeScript', status: 'success', duration: '1m 02s' },
      { id: 'lint', name: 'ESLint + Prettier', status: 'success', duration: '32s' },
      { id: 'bundle', name: 'Vite Bundle', status: 'success', duration: '40s' },
    ],
  },
  {
    id: 'test', name: 'Test', status: 'success', duration: '3m 45s',
    jobs: [
      { id: 'unit', name: 'Unit Tests (Vitest)', status: 'success', duration: '1m 22s' },
      { id: 'integration', name: 'Integration Tests', status: 'success', duration: '2m 01s' },
      { id: 'coverage', name: 'Coverage Report', status: 'success', duration: '22s' },
    ],
  },
  {
    id: 'security', name: 'Security', status: 'running', duration: '1m 12s',
    jobs: [
      { id: 'sast', name: 'SAST Scan', status: 'success', duration: '45s' },
      { id: 'deps', name: 'Dependency Audit', status: 'running', duration: '27s' },
      { id: 'secrets', name: 'Secret Scanner', status: 'pending', duration: '-' },
    ],
  },
  {
    id: 'deploy', name: 'Deploy', status: 'pending', duration: '-',
    jobs: [
      { id: 'staging', name: 'Deploy to Staging', status: 'pending', duration: '-' },
      { id: 'smoke', name: 'Smoke Tests', status: 'pending', duration: '-' },
      { id: 'prod', name: 'Deploy to Prod', status: 'pending', duration: '-' },
    ],
  },
];

const INITIAL_CONTAINERS: ContainerInfo[] = [
  { id: 'c1', name: 'yyc3-gateway', image: 'nginx:alpine', status: 'running', cpu: '2.1%', mem: '128MB', ports: '80:80, 443:443', uptime: '14d 6h' },
  { id: 'c2', name: 'yyc3-api-core', image: 'node:20-slim', status: 'running', cpu: '12.4%', mem: '512MB', ports: '3000:3000', uptime: '14d 6h' },
  { id: 'c3', name: 'yyc3-postgres', image: 'postgres:16', status: 'running', cpu: '5.8%', mem: '1.2GB', ports: '5432:5432', uptime: '14d 6h' },
  { id: 'c4', name: 'yyc3-redis', image: 'redis:7-alpine', status: 'running', cpu: '0.3%', mem: '64MB', ports: '6379:6379', uptime: '14d 6h' },
  { id: 'c5', name: 'yyc3-worker', image: 'python:3.12-slim', status: 'running', cpu: '8.2%', mem: '256MB', ports: '-', uptime: '3d 12h' },
  { id: 'c6', name: 'yyc3-prometheus', image: 'prom/prometheus', status: 'stopped', cpu: '-', mem: '-', ports: '9090:9090', uptime: '-' },
];

const COMMAND_RESPONSES: Record<string, string[]> = {
  'help': [
    'YYC3 DevOps Shell v3.0.1 - Available Commands:',
    '  help              Show this help message',
    '  status            Show cluster status summary',
    '  docker ps         List running containers',
    '  docker logs <id>  View container logs',
    '  git log           Show recent commits',
    '  git status        Show working tree status',
    '  deploy staging    Deploy to staging environment',
    '  deploy prod       Deploy to production (requires approval)',
    '  pipeline run      Trigger CI/CD pipeline',
    '  pipeline status   Show pipeline status',
    '  clear             Clear terminal',
    '  whoami            Print current operator identity',
    '  uptime            Show system uptime',
  ],
  'status': [
    'CLUSTER STATUS REPORT',
    '=====================',
    '  Orchestrator:  MacBook Pro M4 Max    [ONLINE]  CPU: 12%  RAM: 24/128GB',
    '  Auxiliary:     iMac M4               [ONLINE]  CPU: 8%   RAM: 12/32GB',
    '  Data Center:   YanYuCloud NAS        [ACTIVE]  RAID6: Healthy  IOPS: 4200',
    '  Edge Node:     MateBook X Pro        [STANDBY] CPU: 2%   RAM: 8/32GB',
    '  Containers:    5/6 Running           Pods: 3 Active',
    '  Last Incident: None (72h clean)',
  ],
  'whoami': [
    'dev_operator@yyc3-cluster',
    'Clearance: Level 5 (Architect)',
    'Session: JWT-YYC3-2026-02-10T08:00:00Z',
  ],
  'uptime': [
    'System uptime: 14 days, 6 hours, 32 minutes',
    'Last reboot: 2026-01-27 02:00:00 UTC (scheduled maintenance)',
  ],
  'docker ps': [
    'CONTAINER ID   NAME              IMAGE              STATUS     PORTS',
    'a1b2c3d4e5f6   yyc3-gateway      nginx:alpine       Running    80:80, 443:443',
    'f6e5d4c3b2a1   yyc3-api-core     node:20-slim       Running    3000:3000',
    'b2c3d4e5f6a1   yyc3-postgres     postgres:16        Running    5432:5432',
    'c3d4e5f6a1b2   yyc3-redis        redis:7-alpine     Running    6379:6379',
    'd4e5f6a1b2c3   yyc3-worker       python:3.12-slim   Running    -',
    'e5f6a1b2c3d4   yyc3-prometheus   prom/prometheus    Stopped    9090:9090',
  ],
  'git log': [
    'commit a3f7b2e (HEAD -> main, origin/main)',
    'Author: dev_operator <dev@yyc3.local>',
    'Date:   2026-02-10 08:42:00 +0800',
    '',
    '    feat(devops): add CI/CD pipeline visualization',
    '',
    'commit 8d4c1a9',
    'Author: dev_operator <dev@yyc3.local>',
    'Date:   2026-02-09 16:30:00 +0800',
    '',
    '    fix(console): resolve neural link state sync issue',
    '',
    'commit 2e5f8b3',
    'Author: dev_operator <dev@yyc3.local>',
    'Date:   2026-02-09 10:15:00 +0800',
    '',
    '    refactor(theme): implement dark-first CSS variable system',
  ],
  'git status': [
    'On branch main',
    'Your branch is up to date with \'origin/main\'.',
    '',
    'Changes not staged for commit:',
    '  modified:   src/app/components/console/ConsoleView.tsx',
    '  modified:   src/styles/theme.css',
    '',
    'Untracked files:',
    '  src/app/components/console/DevOpsTerminal.tsx',
  ],
  'pipeline status': [
    'Pipeline #127 — Branch: main',
    '  [OK] Build        2m 14s',
    '  [OK] Test         3m 45s',
    '  [..] Security     1m 12s  (running)',
    '  [--] Deploy       -       (pending)',
  ],
  'pipeline run': [
    'Triggering pipeline #128 on branch: main',
    'Commit: a3f7b2e feat(devops): add CI/CD pipeline visualization',
    'Pipeline queued. Estimated time: ~8 minutes.',
  ],
  'deploy staging': [
    'Deploying to staging environment...',
    'Building Docker image: yyc3-core:latest',
    'Pushing to registry: registry.yyc3.local/yyc3-core:latest',
    'Updating deployment: yyc3-staging-deployment',
    'Rollout status: 3/3 pods updated',
    'Deployment complete. Staging URL: https://staging.yyc3.local',
  ],
  'deploy prod': [
    'ERROR: Production deployment requires manual approval.',
    'Run `deploy prod --approve` with Level 5 clearance.',
    'Current clearance: Level 5 (Architect) — Eligible.',
  ],
};

// --- Subcomponents ---

function StatusIcon({ status }: { status: PipelineStatus | ContainerStatus }) {
  switch (status) {
    case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'running': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'pending': return <Clock className="w-4 h-4 text-zinc-500" />;
    case 'skipped': return <ChevronRight className="w-4 h-4 text-zinc-600" />;
    case 'stopped': return <Pause className="w-4 h-4 text-zinc-500" />;
    case 'restarting': return <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />;
    case 'exited': return <XCircle className="w-4 h-4 text-red-400" />;
    default: return <CircleDot className="w-4 h-4 text-zinc-600" />;
  }
}

function statusColor(status: PipelineStatus | ContainerStatus): string {
  switch (status) {
    case 'success': case 'running': return 'text-green-500';
    case 'failed': case 'exited': return 'text-red-500';
    case 'restarting': return 'text-amber-500';
    default: return 'text-zinc-500';
  }
}

// --- Pipeline View ---
function PipelineView() {
  const [pipeline, setPipeline] = React.useState(INITIAL_PIPELINES);
  const [expandedStage, setExpandedStage] = React.useState<string | null>(null);

  // Simulate pipeline progress
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPipeline(prev => prev.map(stage => {
        if (stage.id === 'security') {
          return {
            ...stage,
            status: 'success' as PipelineStatus,
            duration: '2m 05s',
            jobs: stage.jobs.map(job => ({
              ...job,
              status: 'success' as PipelineStatus,
              duration: job.id === 'deps' ? '55s' : job.id === 'secrets' ? '25s' : job.duration,
            })),
          };
        }
        if (stage.id === 'deploy') {
          return {
            ...stage,
            status: 'running' as PipelineStatus,
            jobs: stage.jobs.map((job, idx) => ({
              ...job,
              status: idx === 0 ? 'running' as PipelineStatus : 'pending' as PipelineStatus,
            })),
          };
        }

        return stage;
      }));
    }, 5000);

    const timer2 = setTimeout(() => {
      setPipeline(prev => prev.map(stage => {
        if (stage.id === 'deploy') {
          return {
            ...stage,
            status: 'success' as PipelineStatus,
            duration: '4m 30s',
            jobs: stage.jobs.map(job => ({
              ...job,
              status: 'success' as PipelineStatus,
              duration: job.id === 'staging' ? '2m 10s' : job.id === 'smoke' ? '1m 05s' : '1m 15s',
            })),
          };
        }

        return stage;
      }));
    }, 12000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
              Pipeline #127
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px] border-white/10 text-zinc-400">
              <GitBranch className="w-3 h-3 mr-1" /> main
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1">
            <RotateCcw className="w-3 h-3" /> Retry
          </Button>
          <Button size="sm" className="h-8 text-xs font-mono gap-1">
            <Rocket className="w-3 h-3" /> Run Pipeline
          </Button>
        </div>
      </div>

      {/* Commit Info */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 rounded-lg border border-white/5">
        <GitCommit className="w-4 h-4 text-primary shrink-0" />
        <div className="min-w-0">
          <span className="text-sm text-zinc-200 font-mono">feat(devops): add CI/CD pipeline visualization</span>
          <span className="text-xs text-zinc-500 ml-3 font-mono">a3f7b2e</span>
        </div>
        <span className="text-[10px] text-zinc-500 ml-auto whitespace-nowrap font-mono">2 min ago</span>
      </div>

      {/* Pipeline Stages */}
      <div className="flex items-center gap-2">
        {pipeline.map((stage, idx) => (
          <div key={stage.id} className="contents">
            <button
              onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              className={cn(
                'flex-1 p-4 rounded-xl border transition-all group cursor-pointer',
                stage.status === 'success' && 'bg-green-500/5 border-green-500/20 hover:border-green-500/40',
                stage.status === 'running' && 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40',
                stage.status === 'failed' && 'bg-red-500/5 border-red-500/20 hover:border-red-500/40',
                stage.status === 'pending' && 'bg-zinc-900/50 border-white/5 hover:border-white/10',
                expandedStage === stage.id && 'ring-1 ring-primary/30',
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon status={stage.status} />
                <span className="text-sm font-mono text-zinc-200">{stage.name}</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">{stage.duration}</span>
            </button>
            {idx < pipeline.length - 1 && (
              <ArrowRight className={cn(
                'w-4 h-4 shrink-0',
                pipeline[idx].status === 'success' ? 'text-green-500/50' : 'text-zinc-700',
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Expanded Stage Jobs */}
      {expandedStage && (
        <Card className="bg-black/40 border-white/10 animate-in slide-in-from-top-2 duration-300">
          <CardHeader className="py-3 border-b border-white/5">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              {pipeline.find(s => s.id === expandedStage)?.name} — Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pipeline.find(s => s.id === expandedStage)?.jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <StatusIcon status={job.status} />
                  <span className="text-sm font-mono text-zinc-300">{job.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-500">{job.duration}</span>
                  <Badge variant="outline" className={cn('text-[10px] capitalize', statusColor(job.status))}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Containers View ---
function ContainersView() {
  const [containers, setContainers] = React.useState(INITIAL_CONTAINERS);

  // Simulate container metric updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setContainers(prev => prev.map(c => {
        if (c.status !== 'running') return c;
        const cpuVal = parseFloat(c.cpu);
        const newCpu = Math.max(0.1, cpuVal + (Math.random() - 0.5) * 3).toFixed(1);

        return { ...c, cpu: `${newCpu}%` };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAction = (containerId: string, action: 'start' | 'stop' | 'restart') => {
    setContainers(prev => prev.map(c => {
      if (c.id !== containerId) return c;
      switch (action) {
        case 'start': return { ...c, status: 'running' as ContainerStatus, cpu: '1.0%', mem: '64MB', uptime: '0s' };
        case 'stop': return { ...c, status: 'stopped' as ContainerStatus, cpu: '-', mem: '-', uptime: '-' };
        case 'restart': return { ...c, status: 'restarting' as ContainerStatus };
        default: return c;
      }
    }));

    if (action === 'restart') {
      setTimeout(() => {
        setContainers(prev => prev.map(c => {
          if (c.id !== containerId) return c;

          return { ...c, status: 'running' as ContainerStatus, cpu: '1.2%', uptime: '0s' };
        }));
      }, 2000);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Running', value: containers.filter(c => c.status === 'running').length, color: 'text-green-500' },
          { label: 'Stopped', value: containers.filter(c => c.status === 'stopped' || c.status === 'exited').length, color: 'text-zinc-500' },
          { label: 'Total CPU', value: containers.filter(c => c.status === 'running').reduce((acc, c) => acc + parseFloat(c.cpu || '0'), 0).toFixed(1) + '%', color: 'text-blue-500' },
          { label: 'Images', value: new Set(containers.map(c => c.image)).size, color: 'text-purple-500' },
        ].map(stat => (
          <div key={stat.label} className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 text-center">
            <div className={cn('text-lg font-mono', stat.color)}>{stat.value}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Container List */}
      <Card className="bg-black/40 border-white/10">
        <CardContent className="p-0">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-4 px-4 py-2 border-b border-white/10 text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
            <span>Status</span>
            <span>Container</span>
            <span>CPU</span>
            <span>Memory</span>
            <span>Ports</span>
            <span>Uptime</span>
            <span>Actions</span>
          </div>
          {containers.map(container => (
            <div key={container.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-4 items-center px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
              <StatusIcon status={container.status} />
              <div className="min-w-0">
                <div className="text-sm font-mono text-zinc-200 truncate">{container.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> {container.image}
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-400 w-14 text-right">{container.cpu}</span>
              <span className="text-xs font-mono text-zinc-400 w-16 text-right">{container.mem}</span>
              <span className="text-[10px] font-mono text-zinc-500 w-28">{container.ports}</span>
              <span className="text-[10px] font-mono text-zinc-500 w-16">{container.uptime}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {container.status === 'stopped' ? (
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-green-500 hover:bg-green-500/10" onClick={() => handleAction(container.id, 'start')}>
                    <Play className="w-3 h-3" />
                  </Button>
                ) : (
                  <div className="contents">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-amber-500 hover:bg-amber-500/10" onClick={() => handleAction(container.id, 'restart')}>
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-red-500 hover:bg-red-500/10" onClick={() => handleAction(container.id, 'stop')}>
                      <Pause className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Interactive Terminal ---
function InteractiveTerminal() {
  const [lines, setLines] = React.useState<TerminalLine[]>([
    { id: '0', type: 'system', content: 'YYC3 DevOps Shell v3.0.1', timestamp: new Date().toISOString() },
    { id: '1', type: 'system', content: 'Kernel: Darwin 24.3.0 arm64 (M4 Max)', timestamp: new Date().toISOString() },
    { id: '2', type: 'system', content: 'Connected to: yyc3-cluster (4 nodes)', timestamp: new Date().toISOString() },
    { id: '3', type: 'system', content: 'Type "help" for available commands.\n', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = React.useState('');
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = React.useState(-1);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');

      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const ts = new Date().toISOString();

    // Add input line
    const inputLine: TerminalLine = {
      id: Math.random().toString(36).substring(2, 11),
      type: 'input',
      content: cmd,
      timestamp: ts,
    };

    if (trimmed === 'clear') {
      setLines([
        { id: Math.random().toString(36).substring(2, 11), type: 'system', content: 'Terminal cleared.', timestamp: ts },
      ]);

      return;
    }

    const response = COMMAND_RESPONSES[trimmed];

    if (response) {
      const outputLines: TerminalLine[] = response.map(line => ({
        id: Math.random().toString(36).substring(2, 11),
        type: 'output' as const,
        content: line,
        timestamp: ts,
      }));

      setLines(prev => [...prev, inputLine, ...outputLines]);
    } else {
      setLines(prev => [...prev, inputLine, {
        id: Math.random().toString(36).substring(2, 11),
        type: 'error',
        content: `yyc3-shell: command not found: ${cmd}`,
        timestamp: ts,
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      processCommand(input);
      setHistory(prev => [input, ...prev]);
      setHistoryIdx(-1);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIdx < history.length - 1) {
        const newIdx = historyIdx + 1;

        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;

        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-black/60 rounded-xl border border-white/10 overflow-hidden animate-in fade-in duration-500">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[10px] font-mono text-zinc-500 ml-2">dev_operator@yyc3-cluster — DevOps Shell</span>
        <Badge variant="outline" className="ml-auto text-[10px] font-mono text-green-500 border-green-500/20">
          SSH ACTIVE
        </Badge>
      </div>

      {/* Terminal Body */}
      <ScrollArea className="flex-1 font-mono text-xs" ref={scrollRef}>
        <div className="p-4 space-y-0.5" onClick={() => inputRef.current?.focus()}>
          {lines.map(line => (
            <div key={line.id} className={cn(
              'whitespace-pre-wrap',
              line.type === 'input' && 'text-green-400',
              line.type === 'output' && 'text-zinc-300',
              line.type === 'error' && 'text-red-400',
              line.type === 'system' && 'text-cyan-500/70',
            )}>
              {line.type === 'input' ? (
                <span>
                  <span className="text-primary">yyc3</span>
                  <span className="text-zinc-500">:</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-zinc-500">$ </span>
                  {line.content}
                </span>
              ) : (
                line.content
              )}
            </div>
          ))}

          {/* Input Line */}
          <div className="flex items-center mt-1">
            <span className="text-primary">yyc3</span>
            <span className="text-zinc-500">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-zinc-500">$ </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-green-400 caret-green-400 ml-0.5"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// --- Main Export ---
export function DevOpsTerminal() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl md:text-2xl text-white tracking-tight flex items-center gap-3">
            <Terminal className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            DevOps Control Center
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 mt-1 font-mono">CI/CD | Containers | Shell | MCP Templates | DAG Orchestrator</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] border-green-500/20 text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            ALL SYSTEMS NOMINAL
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="bg-zinc-900/50 border border-white/5 p-1 h-auto flex-wrap">
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-1.5 text-xs font-mono">
            <GitBranch className="w-3.5 h-3.5" /> Pipeline
          </TabsTrigger>
          <TabsTrigger value="containers" className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-1.5 text-xs font-mono">
            <Box className="w-3.5 h-3.5" /> Containers
          </TabsTrigger>
          <TabsTrigger value="terminal" className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-1.5 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" /> Shell
          </TabsTrigger>
          <TabsTrigger value="workflows" className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-1.5 text-xs font-mono">
            <Workflow className="w-3.5 h-3.5" /> Templates
          </TabsTrigger>
          <TabsTrigger value="dag" className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-1.5 text-xs font-mono">
            <Network className="w-3.5 h-3.5" /> DAG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <PipelineView />
        </TabsContent>

        <TabsContent value="containers">
          <ContainersView />
        </TabsContent>

        <TabsContent value="terminal">
          <InteractiveTerminal />
        </TabsContent>

        <TabsContent value="workflows">
          <McpWorkflowsView />
        </TabsContent>

        <TabsContent value="dag">
          <WorkflowOrchestrator />
        </TabsContent>
      </Tabs>
    </div>
  );
}