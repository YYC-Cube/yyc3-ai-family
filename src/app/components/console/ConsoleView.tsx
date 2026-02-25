import {
  Terminal, Shield, Brain, Activity,
  Network, Book, ArrowRight,
  Users, Layers2, Server, HardDrive, Key,
  Sparkles, Briefcase, Monitor, Smartphone, Settings,
  LayoutDashboard, Sliders, Database, BarChart3, Box,
  Wrench, Heart, BookOpen, Rocket, TrendingUp, CloudCog,
  Cpu, FileText, FlaskConical, TestTube2, Radio,
  Infinity as InfinityIcon,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { CyberSkeleton } from '@/app/components/ui/cyber-skeleton';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { getPersistenceEngine } from '@/lib/persistence-engine';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

import { ActivityChart } from './ActivityChart';
import { AgentChatInterface } from './AgentChatInterface';
import { ComponentErrorBoundary } from './ComponentErrorBoundary';
import { DatabaseSelector } from './DatabaseSelector';
import { DeviceCardManager } from './DeviceCardManager';
import { DevOpsTerminal } from './DevOpsTerminal';
import { DockerManager } from './DockerManager';
import { LiveLogStream } from './LiveLogStream';
import { NasDiagnosticsPanel } from './NasDiagnosticsPanel';
import { SettingsView } from './SettingsView';
import { TokenUsageDashboard } from './TokenUsageDashboard';


// Lazy-load Phase 16.2 + 17.1 + 17.2 components
const McpServiceBuilder = React.lazy(() => import('./McpServiceBuilder').then(m => ({ default: m.McpServiceBuilder })));
const PersistenceManager = React.lazy(() => import('./PersistenceManager').then(m => ({ default: m.PersistenceManager })));
const AgentOrchestrator = React.lazy(() => import('./AgentOrchestrator').then(m => ({ default: m.AgentOrchestrator })));

// Lazy-load Phase 19 components
const AgentIdentityCards = React.lazy(() => import('./AgentIdentityCard').then(m => ({ default: m.AgentIdentityCards })));
const FamilyPresenceBoard = React.lazy(() => import('./FamilyPresenceBoard').then(m => ({ default: m.FamilyPresenceBoard })));
const KnowledgeBaseView = React.lazy(() => import('./KnowledgeBase').then(m => ({ default: m.KnowledgeBase })));

// Lazy-load Phase 21 components
const NasDeploymentToolkit = React.lazy(() => import('./NasDeploymentToolkit').then(m => ({ default: m.NasDeploymentToolkit })));

// Lazy-load Phase 22 components
const MetricsHistoryDashboard = React.lazy(() => import('./MetricsHistoryDashboard').then(m => ({ default: m.MetricsHistoryDashboard })));
const RemoteDockerDeploy = React.lazy(() => import('./RemoteDockerDeploy').then(m => ({ default: m.RemoteDockerDeploy })));

// Phase 23: Ollama Manager + API Docs Viewer
const OllamaManager = React.lazy(() => import('./OllamaManager').then(m => ({ default: m.OllamaManager })));
const ApiDocsViewer = React.lazy(() => import('./ApiDocsViewer').then(m => ({ default: m.ApiDocsViewer })));

// Phase 24.5: E2E Smoke Test Runner
const SmokeTestRunner = React.lazy(() => import('./SmokeTestRunner').then(m => ({ default: m.SmokeTestRunner })));

// Phase 25: Integrated Test Framework
const TestFrameworkRunner = React.lazy(() => import('./TestFrameworkRunner').then(m => ({ default: m.TestFrameworkRunner })));

// Phase 28: E2E Streaming Diagnostics
const StreamDiagnostics = React.lazy(() => import('./StreamDiagnostics').then(m => ({ default: m.StreamDiagnostics })));

// Phase 35: Security Audit
const SecurityAudit = React.lazy(() => import('./SecurityAudit').then(m => ({ default: m.SecurityAudit })));

// Phase 36: Hardware Monitor (M4 Max Telemetry)
const HardwareMonitor = React.lazy(() => import('@/app/components/monitoring/HardwareMonitor').then(m => ({ default: m.HardwareMonitor })));

// Phase 38: Command Center (Dashboard enhancement)
const CommandCenter = React.lazy(() => import('./CommandCenter').then(m => ({ default: m.CommandCenter })));

// Phase 39: Infrastructure Health Matrix (standalone view)
const InfraHealthMatrix = React.lazy(() => import('./InfraHealthMatrix').then(m => ({ default: m.InfraHealthMatrix })));

// Phase 40: Operations Script Generator
const OpsScriptGenerator = React.lazy(() => import('./OpsScriptGenerator').then(m => ({ default: m.OpsScriptGenerator })));

// Phase 41: Telemetry Agent Manager
const TelemetryAgentManager = React.lazy(() => import('./TelemetryAgentManager').then(m => ({ default: m.TelemetryAgentManager })));

// Phase 45: Mode Control Panel, Operation Manual, Nine-Layer Architecture
const ModeControlPanel = React.lazy(() => import('./ModeControlPanel').then(m => ({ default: m.ModeControlPanel })));
const OperationManual = React.lazy(() => import('./OperationManual').then(m => ({ default: m.OperationManual })));
const NineLayerArchitecture = React.lazy(() => import('./NineLayerArchitecture').then(m => ({ default: m.NineLayerArchitecture })));

// Phase 46: PG Proxy Deploy Kit
const PgProxyDeployKit = React.lazy(() => import('./PgProxyDeployKit').then(m => ({ default: m.PgProxyDeployKit })));

// --- Type Definitions ---

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

interface LayerInfo {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// --- System Data ---
const NAV_DATA: {
  l1: NavItem[];
  agents: AgentInfo[];
  layers: LayerInfo[];
} = {
  l1: [
    { id: 'dashboard', icon: LayoutDashboard, label: '总控台', desc: 'Main Console' },
    { id: 'ai', icon: Brain, label: '智愈中心', desc: 'AI Core' },
    { id: 'agent_identity', icon: Heart, label: '身份卡片', desc: 'Agent Identity' },
    { id: 'family_presence', icon: Users, label: '家人在线', desc: 'Family Presence' },
    { id: 'knowledge_base', icon: BookOpen, label: '知识库', desc: 'Knowledge Base' },
    { id: 'token_usage', icon: BarChart3, label: 'LLM 用量', desc: 'Token Analytics' },
    { id: 'ollama_manager', icon: Cpu, label: 'Ollama', desc: 'Local Models' },
    { id: 'architecture', icon: Layers2, label: '架构全景', desc: 'Structure' },
    { id: 'docker', icon: Box, label: 'Docker', desc: 'Containers' },
    { id: 'devops', icon: Terminal, label: 'DevOps', desc: 'Operations' },
    { id: 'mcp', icon: Wrench, label: 'MCP', desc: 'Tool Chain' },
    { id: 'persist', icon: HardDrive, label: '持久化', desc: 'Persistence' },
    { id: 'orchestrate', icon: Network, label: '协作编排', desc: 'Orchestrate' },
    { id: 'nas_deployment', icon: Rocket, label: 'NAS 部署', desc: 'NAS Deploy' },
    { id: 'metrics_history', icon: TrendingUp, label: '历史指标', desc: 'Metrics History' },
    { id: 'remote_docker_deploy', icon: CloudCog, label: '远程部署', desc: 'Remote Deploy' },
    { id: 'api_docs', icon: FileText, label: 'API 文档', desc: 'API Reference' },
    { id: 'smoke_test', icon: FlaskConical, label: '烟雾测试', desc: 'Smoke Test' },
    { id: 'test_framework', icon: TestTube2, label: '测试框架', desc: 'Test Framework' },
    { id: 'stream_diagnostics', icon: Radio, label: '流式诊断', desc: 'Stream Diagnostics' },
    { id: 'security_audit', icon: Shield, label: '安全审计', desc: 'Security Audit' },
    { id: 'hardware_monitor', icon: Monitor, label: '硬件遥测', desc: 'HW Telemetry' },
    { id: 'infra_health', icon: Activity, label: '基础设施', desc: 'Infra Health' },
    { id: 'ops_script', icon: Terminal, label: '运维脚本', desc: 'Ops Scripts' },
    { id: 'telemetry_agent_manager', icon: Radio, label: '遥测代理', desc: 'Telemetry Agent' },
    { id: 'mode_control', icon: Briefcase, label: '模式控制', desc: 'Mode Control' },
    { id: 'operation_manual', icon: BookOpen, label: '操作手册', desc: 'Manual' },
    { id: 'nine_layer_architecture', icon: Layers2, label: '九层蓝图', desc: '9-Layer Blueprint' },
    { id: 'pg_proxy_deploy_kit', icon: Server, label: 'PG代理部署', desc: 'PG Proxy Deploy' },
    { id: 'settings', icon: Sliders, label: '系统设置', desc: 'Configuration' },
  ],
  agents: [
    { id: 'navigator', name: '智愈·领航员', role: 'Navigator', desc: '全域资源调度与路径规划', icon: Brain, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'thinker', name: '洞见·思想家', role: 'Thinker', desc: '深度逻辑推理与决策分析', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'prophet', name: '预见·先知', role: 'Prophet', desc: '趋势预测与风险前置', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { id: 'bole', name: '知遇·伯乐', role: 'Talent Scout', desc: '模型评估与优选匹配', icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { id: 'pivot', name: '元启·天枢', role: 'Pivot', desc: '核心状态管理与上下文', icon: Network, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { id: 'sentinel', name: '卫安·哨兵', role: 'Sentinel', desc: '安全边界防护与审计', icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { id: 'grandmaster', name: '格物·宗师', role: 'Grandmaster', desc: '知识库构建与本体论', icon: Book, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  ],
  layers: [
    { id: 'L09', label: 'L09 系统设置层', desc: 'Configuration', icon: Settings, color: 'text-zinc-400' },
    { id: 'L08', label: 'L08 扩展演进层', desc: 'Evolution', icon: InfinityIcon, color: 'text-indigo-400' },
    { id: 'L07', label: 'L07 用户交互层', desc: 'Interaction', icon: Smartphone, color: 'text-pink-400' },
    { id: 'L06', label: 'L06 应用表现层', desc: 'Presentation', icon: Monitor, color: 'text-cyan-400' },
    { id: 'L05', label: 'L05 业务逻辑层', desc: 'Business Logic', icon: Briefcase, color: 'text-red-400' },
    { id: 'L04', label: 'L04 AI 智能层', desc: 'Artificial Intelligence', icon: Sparkles, color: 'text-amber-400' },
    { id: 'L03', label: 'L03 核心服务层', desc: 'Core Services', icon: Key, color: 'text-purple-400' },
    { id: 'L02', label: 'L02 数据存储层', desc: 'Persistence', icon: Database, color: 'text-green-400' },
    { id: 'L01', label: 'L01 基础设施层', desc: 'Infrastructure', icon: Server, color: 'text-blue-400' },
  ],
};

// --- ConsoleView: Now reads directly from Zustand store ---

export function ConsoleView() {
  // === Zustand store — single source of truth ===
  const activeTab = useSystemStore(s => s.consoleTab);
  const setActiveTab = useSystemStore(s => s.setConsoleTab);
  const selectedAgent = useSystemStore(s => s.consoleAgent);
  const setSelectedAgent = useSystemStore(s => s.setConsoleAgent);
  const clusterMetrics = useSystemStore(s => s.clusterMetrics);
  const systemStatus = useSystemStore(s => s.status);
  const dbConnected = useSystemStore(s => s.dbConnected);
  const isMobile = useSystemStore(s => s.isMobile);
  const addLog = useSystemStore(s => s.addLog);

  // startTransition wrappers — keep current view visible while lazy panel loads
  const handleTabChange = React.useCallback((tabId: string) => {
    React.startTransition(() => { setActiveTab(tabId); });
  }, [setActiveTab]);

  const handleAgentSelect = React.useCallback((agentId: string | null) => {
    React.startTransition(() => { setSelectedAgent(agentId); });
  }, [setSelectedAgent]);

  // Phase 50: NAS Sync status polling
  const [syncStatus, setSyncStatus] = React.useState<{
    nasOnline: boolean; pendingCount: number; lastSyncTime: number;
    retryAttempt: number; overflowCount: number;
  }>({ nasOnline: false, pendingCount: 0, lastSyncTime: 0, retryAttempt: 0, overflowCount: 0 });

  React.useEffect(() => {
    const engine = getPersistenceEngine();
    const update = () => setSyncStatus(engine.getSyncStatus());

    update();
    const interval = setInterval(update, 5000);
    const unsub = engine.on(ev => {
      if (ev.type === 'sync' || ev.type === 'queue-flush' || ev.type === 'queue-overflow') {
        update();
      }
    });

    return () => { clearInterval(interval); unsub(); };
  }, []);

  // Phase 50: Error handler for ComponentErrorBoundary
  const handleComponentError = React.useCallback((error: Error, _errorInfo: React.ErrorInfo) => {
    addLog('error', 'ERROR_BOUNDARY', `Component crashed: ${error.message}`);
  }, [addLog]);

  // Derive status badge
  const statusLabel = systemStatus === 'optimal' ? 'SYSTEM OPTIMAL'
    : systemStatus === 'warning' ? 'SYSTEM WARNING'
    : systemStatus === 'critical' ? 'SYSTEM CRITICAL'
    : 'SYSTEM BOOTING';

  // Map status to concrete Tailwind classes (dynamic interpolation doesn't work)
  const statusClasses = systemStatus === 'optimal'
    ? { badge: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-500', text: 'text-green-500' }
    : systemStatus === 'warning'
    ? { badge: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500', text: 'text-amber-500' }
    : systemStatus === 'critical'
    ? { badge: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500', text: 'text-red-500' }
    : { badge: 'bg-zinc-500/10 border-zinc-500/20', dot: 'bg-zinc-500', text: 'text-zinc-500' };

  return (
    <div className="flex h-full w-full bg-[#050505] text-foreground font-sans overflow-hidden animate-in fade-in duration-500">

      {/* L1: The Dock (Minimalist Navigation) */}
      <nav className={cn(
        'border-r border-white/5 bg-black/40 flex flex-col items-center py-4 md:py-6 z-30 shrink-0 overflow-y-auto overflow-x-hidden',
        isMobile ? 'w-12 gap-2' : 'w-16 gap-3',
      )}>
        <div className="p-1.5 md:p-2 rounded-xl bg-primary/10 text-primary mb-2 md:mb-3 shrink-0">
          <Terminal className="w-4 h-4 md:w-6 md:h-6" />
        </div>
        {NAV_DATA.l1.map(item => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={cn(
              'p-2.5 md:p-3 rounded-xl transition-all relative group shrink-0',
              activeTab === item.id
                ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5',
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="sr-only">{item.label}</span>
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-md border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {item.label}
            </div>
          </button>
        ))}
      </nav>

      {/* Main Stage */}
      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#050505] to-[#050505]">

        {/* Dynamic Header */}
        <header className="h-12 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-base md:text-xl tracking-tight text-white flex items-center gap-2 md:gap-3">
              {NAV_DATA.l1.find(t => t.id === activeTab)?.icon && React.createElement(NAV_DATA.l1.find(t => t.id === activeTab)!.icon, { className: 'w-5 h-5 text-muted-foreground' })}
              {NAV_DATA.l1.find(t => t.id === activeTab)?.label}
            </h1>
            {selectedAgent && (
              <>
                <span className="text-zinc-600">/</span>
                <Badge variant="outline" className={cn(
                  'border-opacity-20 bg-opacity-5',
                  NAV_DATA.agents.find(a => a.id === selectedAgent)?.color,
                )}>
                  {NAV_DATA.agents.find(a => a.id === selectedAgent)?.name}
                </Badge>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Database Selector */}
            <DatabaseSelector />
            {/* DB Connection Indicator */}
            <div className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-mono',
                   dbConnected
                     ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-500'
                     : 'bg-zinc-800/50 border border-white/5 text-zinc-600',
            )}>
              <Database className="w-3 h-3" />
              {dbConnected ? 'PG:LIVE' : 'PG:LOCAL'}
            </div>
            {/* Phase 50: NAS Sync Status Indicator */}
            {!isMobile && (
              <div className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-mono',
                     syncStatus.nasOnline
                       ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                       : syncStatus.pendingCount > 0
                       ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                       : 'bg-zinc-800/50 border border-white/5 text-zinc-600',
              )}>
                <HardDrive className="w-3 h-3" />
                {syncStatus.nasOnline
                       ? (syncStatus.pendingCount > 0 ? `SYNC:${syncStatus.pendingCount}` : 'NAS:OK')
                       : (syncStatus.pendingCount > 0 ? `Q:${syncStatus.pendingCount}` : 'NAS:OFF')}
                {syncStatus.retryAttempt > 0 && (
                  <span className="text-amber-400/60">R{syncStatus.retryAttempt}</span>
                )}
              </div>
            )}
            {/* System Status */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full border',
              statusClasses.badge,
            )}>
              <div className={cn('w-1.5 h-1.5 rounded-full animate-pulse', statusClasses.dot)} />
              <span className={cn('text-[10px] font-medium tracking-wide', statusClasses.text)}>{statusLabel}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)]">

            {/* VIEW: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">

                {/* 0. NAS Auto-Diagnostics (Phase 22) */}
                <div className="col-span-full">
                  <NasDiagnosticsPanel />
                </div>

                {/* 1. Topology Map */}
                <div className="col-span-full">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Network className="w-5 h-5 text-primary" />
                                    Cluster Topology
                    </h3>
                    <div className="flex items-center gap-3">
                      {clusterMetrics && (
                        <span className="text-[10px] font-mono text-zinc-500">
                                        M4: {Math.round(clusterMetrics['m4-max'].cpu)}% CPU | {Math.round(clusterMetrics['m4-max'].memory)}% MEM
                        </span>
                      )}
                      <Badge variant="outline" className="font-mono text-[10px] border-white/10 text-zinc-400">
                                        ENV: LOCAL_DEV
                      </Badge>
                    </div>
                  </div>
                  <DeviceCardManager />
                </div>

                {/* 2. System Status & Load */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-zinc-900 to-black border-white/10 flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Orchestrator Load (M4 Max)</span>
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        {clusterMetrics ? (
                                        clusterMetrics['m4-max'].cpu > 70 ? 'High Load' :
                                        clusterMetrics['m4-max'].cpu > 40 ? 'Moderate' : 'High Efficiency'
                                      ) : 'Initializing...'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Real-time resource allocation across 16P+40E cores.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-[250px] p-0 px-4 pb-4">
                    <ActivityChart color="#f59e0b" label="CPU Utilization" />
                  </CardContent>
                </Card>

                {/* 3. Live Logs */}
                <Card className="bg-zinc-900/50 border-white/5 flex flex-col h-full min-h-[300px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                      <Terminal className="w-4 h-4" />
                                    Cluster Kernel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-hidden relative">
                    <div className="absolute inset-0">
                      <LiveLogStream />
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Real-time Metrics Grid (from simulation engine) */}
                {clusterMetrics && (
                  <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {([
                      { nodeId: 'm4-max', label: 'M4 Max', color: 'text-amber-500' },
                      { nodeId: 'imac-m4', label: 'iMac M4', color: 'text-blue-500' },
                      { nodeId: 'matebook', label: 'MateBook', color: 'text-green-500' },
                      { nodeId: 'yanyucloud', label: 'YanYuCloud', color: 'text-cyan-500' },
                    ] as const).map(node => {
                      const m = clusterMetrics[node.nodeId];

                      return (
                        <Card key={node.nodeId} className="bg-zinc-900/40 border-white/5">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className={cn('text-xs font-mono', node.color)}>{node.label}</span>
                              <div className={cn(
                                'w-2 h-2 rounded-full',
                                        m.cpu < 5 ? 'bg-zinc-500' : 'bg-green-500 animate-pulse',
                              )} />
                            </div>
                            <div className="space-y-2">
                              <MetricBar label="CPU" value={m.cpu} max={100} color="bg-amber-500" />
                              <MetricBar label="MEM" value={m.memory} max={100} color="bg-blue-500" />
                              <MetricBar label="DSK" value={m.disk} max={100} color="bg-green-500" />
                              <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-2">
                                <span>{Math.round(m.temperature)}°C</span>
                                <span>{m.processes} procs</span>
                                <span>{Math.round(m.network)} Mbps</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* 5. Command Center — Quick Actions, Pipelines, Agent Status (Phase 38) */}
                <div className="col-span-full">
                  <React.Suspense fallback={
                    <CyberSkeleton label="LOADING_COMMAND_CENTER..." variant="card" accentColor="text-primary" minHeight="h-32" />
                  }>
                    <CommandCenter />
                  </React.Suspense>
                </div>
              </div>
            )}

            {/* VIEW: AI CENTER */}
            {activeTab === 'ai' && !selectedAgent && (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-2xl md:text-3xl text-white tracking-tight">AI 智能体矩阵</h2>
                  <div className="text-xs md:text-sm text-zinc-500">Select an agent to access its neural console</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {NAV_DATA.agents.map(agent => (
                    <Card
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent.id)}
                      className={cn(
                        'bg-zinc-900/40 border-white/5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group',
                        'hover:border-opacity-50 hover:bg-zinc-900/80',
                      )}
                    >
                      <CardHeader className="relative overflow-hidden">
                        <div className={cn('absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity', agent.color)}>
                          <agent.icon className="w-16 h-16 -rotate-12 translate-x-4 -translate-y-4" />
                        </div>
                        <CardTitle className={cn('flex items-center gap-2 text-lg', agent.color)}>
                          <agent.icon className="w-5 h-5" />
                          {agent.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {agent.desc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="bg-black/40 text-zinc-400 border border-white/5">Auto-GPT</Badge>
                          <Badge variant="secondary" className="bg-black/40 text-zinc-400 border border-white/5">v4.0</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-white/5 pt-4">
                        <div className="w-full flex items-center justify-between text-xs text-zinc-500">
                          <span>Idle</span>
                          <ArrowRight className="w-4 h-4 group-hover:text-white transition-colors" />
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: AGENT DETAIL (Drill Down) */}
            {activeTab === 'ai' && selectedAgent && (
              <div className="animate-in slide-in-from-right-8 duration-300">
                <div className="mb-6">
                  <Button variant="ghost" className="pl-0 gap-2 text-zinc-400 hover:text-white" onClick={() => handleAgentSelect(null)}>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                                Back to Matrix
                  </Button>
                </div>

                <div className={cn(
                  'grid gap-4 md:gap-6',
                          isMobile ? 'grid-cols-1' : 'grid-cols-12 h-[calc(100vh-12rem)]',
                )}>
                  {/* Left: Agent Chat Interface */}
                  <div className={cn(
                    'bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col',
                              isMobile ? 'h-[60vh]' : 'col-span-8',
                  )}>
                    <ComponentErrorBoundary componentName="AgentChat" accentColor="text-amber-500" onError={handleComponentError} showHomeAction onGoHome={() => handleAgentSelect(null)}>
                      <AgentChatInterface agentId={selectedAgent} className="h-full" />
                    </ComponentErrorBoundary>
                  </div>

                  {/* Right: State & Tools */}
                  <div className={cn(
                    'space-y-4 md:space-y-6',
                              isMobile ? '' : 'col-span-4',
                  )}>
                    <Card className="bg-black/40 border-white/10">
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm text-zinc-400">Active Tools</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {['Search', 'Calculator', 'Code_Interpreter', 'Vector_DB'].map(tool => (
                          <div key={tool} className="flex items-center justify-between text-sm px-3 py-2 bg-white/5 rounded border border-white/5">
                            <span>{tool}</span>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-black/40 border-white/10">
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm text-zinc-400">Agent Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { label: 'Response Time', value: '1.2s', color: 'text-green-500' },
                          { label: 'Tokens Used', value: '12.8K', color: 'text-amber-500' },
                          { label: 'Session Turns', value: '0', color: 'text-blue-500' },
                          { label: 'Context Window', value: '128K', color: 'text-purple-500' },
                        ].map(metric => (
                          <div key={metric.label} className="flex items-center justify-between text-sm px-3 py-2 bg-white/5 rounded border border-white/5">
                            <span className="text-zinc-400 text-xs font-mono">{metric.label}</span>
                            <span className={`text-xs font-mono ${metric.color}`}>{metric.value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-black/40 border-white/10 flex-1">
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm text-zinc-400">Cognitive Load</CardTitle>
                      </CardHeader>
                      <CardContent className="h-48 p-0 px-4 pb-4">
                        <ActivityChart color="#a855f7" label="Neural Activity" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: ARCHITECTURE */}
            {activeTab === 'architecture' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-2xl md:text-3xl text-white tracking-tight">九层架构全景</h2>
                  <div className="text-xs md:text-sm text-zinc-500">The 9-Layer Neural Architecture</div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {NAV_DATA.layers.map((layer, index) => (
                    <div
                      key={layer.id}
                      className="group relative flex items-center"
                    >
                      {/* Connection Line */}
                      {index !== NAV_DATA.layers.length - 1 && (
                        <div className="absolute left-5 md:left-6 top-12 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent h-10 z-0" />
                      )}

                      <div className={cn(
                        'w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 bg-black flex items-center justify-center z-10 mr-3 md:mr-6 shrink-0 transition-colors',
                        'group-hover:border-primary/50 group-hover:bg-primary/10',
                      )}>
                        <layer.icon className={cn('w-4 h-4 md:w-5 md:h-5', layer.color)} />
                      </div>

                      <div className="flex-1 p-3 md:p-4 rounded-xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all flex items-center justify-between group-hover:translate-x-1 md:group-hover:translate-x-2">
                        <div>
                          <h3 className="text-sm md:text-base text-zinc-200">{layer.label}</h3>
                          <p className="text-[10px] md:text-xs text-zinc-500">{layer.desc}</p>
                        </div>
                        <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-8">Inspect</Button>
                          <Button size="sm" variant="outline" className="h-8 border-white/10">Logs</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: SETTINGS */}
            {activeTab === 'settings' && (
              <SettingsView />
            )}

            {/* VIEW: SECURITY AUDIT */}
            {activeTab === 'security_audit' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_SECURITY_AUDIT..." variant="table" accentColor="text-red-500" />
              }>
                <SecurityAudit />
              </React.Suspense>
            )}

            {/* VIEW: DEVOPS */}
            {activeTab === 'devops' && (
              <ComponentErrorBoundary componentName="DevOpsTerminal" onError={handleComponentError}>
                <DevOpsTerminal />
              </ComponentErrorBoundary>
            )}

            {/* VIEW: TOKEN USAGE */}
            {activeTab === 'token_usage' && (
              <ComponentErrorBoundary componentName="TokenUsageDashboard" onError={handleComponentError}>
                <TokenUsageDashboard />
              </ComponentErrorBoundary>
            )}

            {/* VIEW: DOCKER */}
            {activeTab === 'docker' && (
              <ComponentErrorBoundary componentName="DockerManager" accentColor="text-cyan-500" onError={handleComponentError}>
                <DockerManager />
              </ComponentErrorBoundary>
            )}

            {/* VIEW: MCP SERVICE BUILDER (Phase 16.2) */}
            {activeTab === 'mcp' && (
              <ComponentErrorBoundary componentName="McpServiceBuilder" accentColor="text-purple-500" onError={handleComponentError}>
                <React.Suspense fallback={
                  <CyberSkeleton label="LOADING_MCP_MODULE..." variant="card" accentColor="text-purple-500" />
                }>
                  <McpServiceBuilder />
                </React.Suspense>
              </ComponentErrorBoundary>
            )}

            {/* VIEW: PERSISTENCE ENGINE (Phase 17.1) */}
            {activeTab === 'persist' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_PERSIST_MODULE..." variant="table" accentColor="text-cyan-500" />
              }>
                <PersistenceManager />
              </React.Suspense>
            )}

            {/* VIEW: MULTI-AGENT ORCHESTRATOR (Phase 17.2) */}
            {activeTab === 'orchestrate' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_ORCHESTRATOR_MODULE..." variant="card" accentColor="text-amber-500" />
              }>
                <AgentOrchestrator />
              </React.Suspense>
            )}

            {/* VIEW: AGENT IDENTITY CARDS (Phase 19) */}
            {activeTab === 'agent_identity' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_AGENT_IDENTITY_MODULE..." variant="card" accentColor="text-pink-500" />
              }>
                <AgentIdentityCards />
              </React.Suspense>
            )}

            {/* VIEW: FAMILY PRESENCE BOARD (Phase 19) */}
            {activeTab === 'family_presence' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_FAMILY_PRESENCE_MODULE..." variant="card" accentColor="text-pink-500" />
              }>
                <FamilyPresenceBoard />
              </React.Suspense>
            )}

            {/* VIEW: KNOWLEDGE BASE (Phase 19) */}
            {activeTab === 'knowledge_base' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_KNOWLEDGE_BASE_MODULE..." variant="table" accentColor="text-green-500" />
              }>
                <KnowledgeBaseView />
              </React.Suspense>
            )}

            {/* VIEW: NAS DEPLOYMENT TOOLKIT (Phase 21) */}
            {activeTab === 'nas_deployment' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_NAS_DEPLOYMENT_MODULE..." variant="card" accentColor="text-emerald-500" />
              }>
                <NasDeploymentToolkit />
              </React.Suspense>
            )}

            {/* VIEW: METRICS HISTORY DASHBOARD (Phase 22) */}
            {activeTab === 'metrics_history' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_METRICS_HISTORY_MODULE..." variant="chart" accentColor="text-amber-500" />
              }>
                <MetricsHistoryDashboard />
              </React.Suspense>
            )}

            {/* VIEW: REMOTE DOCKER DEPLOY (Phase 22) */}
            {activeTab === 'remote_docker_deploy' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_REMOTE_DEPLOY_MODULE..." variant="card" accentColor="text-cyan-500" />
              }>
                <RemoteDockerDeploy />
              </React.Suspense>
            )}

            {/* VIEW: OLLAMA MANAGER (Phase 23) */}
            {activeTab === 'ollama_manager' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_OLLAMA_MANAGER_MODULE..." variant="card" accentColor="text-purple-500" />
              }>
                <OllamaManager />
              </React.Suspense>
            )}

            {/* VIEW: API DOCS VIEWER (Phase 23) */}
            {activeTab === 'api_docs' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_API_DOCS_VIEWER_MODULE..." variant="table" accentColor="text-blue-500" />
              }>
                <ApiDocsViewer />
              </React.Suspense>
            )}

            {/* VIEW: SMOKE TEST RUNNER (Phase 24.5) */}
            {activeTab === 'smoke_test' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_SMOKE_TEST_RUNNER_MODULE..." variant="table" accentColor="text-amber-500" />
              }>
                <SmokeTestRunner />
              </React.Suspense>
            )}

            {/* VIEW: TEST FRAMEWORK RUNNER (Phase 25) */}
            {activeTab === 'test_framework' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_TEST_FRAMEWORK_RUNNER_MODULE..." variant="table" accentColor="text-green-500" />
              }>
                <TestFrameworkRunner />
              </React.Suspense>
            )}

            {/* VIEW: STREAM DIAGNOSTICS (Phase 28) */}
            {activeTab === 'stream_diagnostics' && (
              <ComponentErrorBoundary componentName="StreamDiagnostics" accentColor="text-blue-500" onError={handleComponentError}>
                <React.Suspense fallback={
                  <CyberSkeleton label="LOADING_STREAM_DIAGNOSTICS_MODULE..." variant="chart" accentColor="text-blue-500" />
                }>
                  <StreamDiagnostics />
                </React.Suspense>
              </ComponentErrorBoundary>
            )}

            {/* VIEW: HARDWARE MONITOR (Phase 36) */}
            {activeTab === 'hardware_monitor' && (
              <ComponentErrorBoundary componentName="HardwareMonitor" accentColor="text-amber-500" onError={handleComponentError}>
                <React.Suspense fallback={
                  <CyberSkeleton label="LOADING_HARDWARE_TELEMETRY..." variant="chart" accentColor="text-amber-500" />
                }>
                  <HardwareMonitor />
                </React.Suspense>
              </ComponentErrorBoundary>
            )}

            {/* VIEW: INFRASTRUCTURE HEALTH (Phase 39) */}
            {activeTab === 'infra_health' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_INFRA_HEALTH..." variant="chart" accentColor="text-emerald-500" />
              }>
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-2xl md:text-3xl text-white tracking-tight flex items-center gap-3">
                      <Activity className="w-7 h-7 text-emerald-400" />
                            Infrastructure Health
                    </h2>
                    <div className="text-xs md:text-sm text-zinc-500">Real-time connectivity probes for all cluster services</div>
                  </div>
                  <InfraHealthMatrix />
                </div>
              </React.Suspense>
            )}

            {/* VIEW: OPERATIONS SCRIPT GENERATOR (Phase 40) */}
            {activeTab === 'ops_script' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_OPS_SCRIPT_GENERATOR..." variant="card" accentColor="text-primary" />
              }>
                <OpsScriptGenerator />
              </React.Suspense>
            )}

            {/* VIEW: TELEMETRY AGENT MANAGER (Phase 41) */}
            {activeTab === 'telemetry_agent_manager' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_TELEMETRY_AGENT_MANAGER..." variant="table" accentColor="text-cyan-500" />
              }>
                <TelemetryAgentManager />
              </React.Suspense>
            )}

            {/* VIEW: MODE CONTROL PANEL (Phase 45) */}
            {activeTab === 'mode_control' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_MODE_CONTROL..." variant="card" accentColor="text-amber-500" />
              }>
                <ModeControlPanel />
              </React.Suspense>
            )}

            {/* VIEW: OPERATION MANUAL (Phase 45) */}
            {activeTab === 'operation_manual' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_OPERATION_MANUAL..." variant="table" accentColor="text-blue-500" />
              }>
                <OperationManual />
              </React.Suspense>
            )}

            {/* VIEW: NINE-LAYER ARCHITECTURE (Phase 45) */}
            {activeTab === 'nine_layer_architecture' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_NINE_LAYER_ARCHITECTURE..." variant="card" accentColor="text-indigo-500" />
              }>
                <NineLayerArchitecture />
              </React.Suspense>
            )}

            {/* VIEW: PG PROXY DEPLOY KIT (Phase 46) */}
            {activeTab === 'pg_proxy_deploy_kit' && (
              <React.Suspense fallback={
                <CyberSkeleton label="LOADING_PG_PROXY_DEPLOY_KIT..." variant="card" accentColor="text-cyan-500" />
              }>
                <PgProxyDeployKit />
              </React.Suspense>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// --- Metric Bar Sub-component ---
function MetricBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-zinc-500 w-7">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">{Math.round(value)}%</span>
    </div>
  );
}
