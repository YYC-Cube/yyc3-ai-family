import {
  Rocket, Play, Terminal, Shield, Database,
  Activity, Zap, Brain, Radio, CheckCircle2,
  XCircle, Loader2, ChevronRight,
  GitBranch, Cpu, Network,
  RefreshCw, ArrowRight, Wifi, WifiOff,
  FileText, Key, Settings,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { loadAgentCustomConfig, getMergedAgents } from '@/lib/branding-config';
import { eventBus, useEventBus } from '@/lib/event-bus';
import { useTranslation } from '@/lib/i18n';
import { loadProviderConfigs } from '@/lib/llm-bridge';
import { PROVIDERS } from '@/lib/llm-providers';
import { getPgTelemetryState, checkPgTelemetryHealth, getPgTelemetryConfig } from '@/lib/pg-telemetry-client';
import { useSystemStore } from '@/lib/store';
import type { PipelineRun, StageStatus } from '@/lib/useDAGExecutor';
import { getRunnerHealth, checkRunnerHealth, onRunnerHealthChange, useDAGExecutor, registerGlobalExecutor } from '@/lib/useDAGExecutor';
import { cn } from '@/lib/utils';

// ============================================================
// CommandCenter — Real-time Dashboard Command Center
// Phase 38→39: Functional operations hub with real infra health
//
// Features:
//   - Quick Action Toolbar (deploy, build, test, diagnose)
//   - Live Pipeline Execution Monitor
//   - Agent Status Matrix
//   - Provider Health Grid
//   - Real-time EventBus Feed (last 15 events)
//   - System Quick Stats
//   - Infrastructure Health Matrix (Phase 39)
// ============================================================

// --- Lazy-load InfraHealthMatrix (Phase 39) ---
const InfraHealthMatrix = React.lazy(() =>
  import('./InfraHealthMatrix').then(m => ({ default: m.InfraHealthMatrix })),
);

// --- Stage Status Icon ---
function StageStatusIcon({ status }: { status: StageStatus }) {
  switch (status) {
    case 'success': return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
    case 'failed': return <XCircle className="w-3 h-3 text-red-400" />;
    case 'running': return <Loader2 className="w-3 h-3 text-sky-400 animate-spin" />;
    case 'cancelled': return <XCircle className="w-3 h-3 text-amber-400" />;
    case 'skipped': return <ChevronRight className="w-3 h-3 text-zinc-600" />;
    default: return <div className="w-3 h-3 rounded-full bg-zinc-700" />;
  }
}

// --- Pipeline Run Card ---
function PipelineRunCard({ run, onCancel }: { run: PipelineRun; onCancel: (id: string) => void }) {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const elapsed = run.completedAt
    ? ((run.completedAt - run.startedAt) / 1000).toFixed(1)
    : ((Date.now() - run.startedAt) / 1000).toFixed(0);

  const statusColors: Record<string, string> = {
    running: 'border-sky-500/30 bg-sky-500/5',
    success: 'border-emerald-500/30 bg-emerald-500/5',
    failed: 'border-red-500/30 bg-red-500/5',
    cancelled: 'border-amber-500/30 bg-amber-500/5',
  };

  return (
    <div className={cn(
      'border rounded-lg p-3 transition-all',
      statusColors[run.status] || 'border-zinc-700/50 bg-zinc-900/30',
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-mono text-zinc-200">{run.name}</span>
          <Badge variant="outline" className={cn(
            'text-[8px] font-mono',
            run.status === 'running' ? 'text-sky-400 border-sky-500/30' :
            run.status === 'success' ? 'text-emerald-400 border-emerald-500/30' :
            run.status === 'failed' ? 'text-red-400 border-red-500/30' :
            'text-amber-400 border-amber-500/30',
          )}>
            {run.status.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-zinc-500">{elapsed}s</span>
          {run.status === 'running' && (
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onCancel(run.id)}>
              <XCircle className="w-3 h-3 text-red-400" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-800 rounded-full mb-2 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            run.status === 'running' ? 'bg-sky-500' :
            run.status === 'success' ? 'bg-emerald-500' :
            run.status === 'failed' ? 'bg-red-500' : 'bg-amber-500',
          )}
          style={{ width: `${run.progress}%` }}
        />
      </div>

      {/* Stages mini-view */}
      <div className="flex items-center gap-1">
        {run.stages.map((stage, i) => (
          <React.Fragment key={stage.name}>
            <div className="flex items-center gap-0.5" title={`${stage.name}: ${stage.status}`}>
              <StageStatusIcon status={stage.status} />
              <span className={cn(
                'text-[8px] font-mono',
                stage.status === 'success' ? 'text-emerald-500' :
                stage.status === 'running' ? 'text-sky-400' :
                stage.status === 'failed' ? 'text-red-400' :
                'text-zinc-600',
              )}>
                {stage.name}
              </span>
            </div>
            {i < run.stages.length - 1 && (
              <ArrowRight className="w-2.5 h-2.5 text-zinc-700 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// --- Quick Action Button ---
function QuickActionButton({ icon: Icon, label, description, color, onClick, loading }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'flex flex-col items-start gap-1.5 p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30',
        'hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <div className={cn('w-6 h-6 rounded flex items-center justify-center border border-zinc-700/50 bg-zinc-800/60', color)}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
        </div>
        <span className="text-[10px] font-mono text-zinc-300 group-hover:text-white">{label}</span>
      </div>
      <span className="text-[9px] text-zinc-600">{description}</span>
    </button>
  );
}

// --- Main Component ---
export function CommandCenter() {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const navigateToConsoleTab = useSystemStore(s => s.navigateToConsoleTab);
  const navigateToAgent = useSystemStore(s => s.navigateToAgent);
  const clusterMetrics = useSystemStore(s => s.clusterMetrics);
  const systemStatus = useSystemStore(s => s.status);
  const dbConnected = useSystemStore(s => s.dbConnected);
  const agentHistories = useSystemStore(s => s.agentChatHistories);
  const runDiagnosis = useSystemStore(s => s.runDiagnosis);
  const addLog = useSystemStore(s => s.addLog);

  // DAG Executor
  const dagExecutor = useDAGExecutor();
  const { execute, cancel, runs } = dagExecutor;

  // Register for global access (cross-module)
  React.useEffect(() => {
    registerGlobalExecutor(dagExecutor);
  }, [dagExecutor]);

  // Phase 42: Runner health tracking
  const [runnerHealth, setRunnerHealth] = React.useState(getRunnerHealth);

  React.useEffect(() => {
    return onRunnerHealthChange(() => setRunnerHealth(getRunnerHealth()));
  }, []);

  const handleRunnerCheck = React.useCallback(async () => {
    addLog('info', 'CMD_CENTER', 'Checking runner service health...');
    await checkRunnerHealth();
  }, [addLog]);

  // EventBus live feed
  const recentEvents = useEventBus(undefined, 15);

  // Phase 51: Merged agents (built-in + custom) with reactive updates
  const [mergedAgentList, setMergedAgentList] = React.useState(() => getMergedAgents(loadAgentCustomConfig()));

  React.useEffect(() => {
    const refresh = () => setMergedAgentList(getMergedAgents(loadAgentCustomConfig()));

    window.addEventListener('yyc3-agents-update', refresh);

    return () => window.removeEventListener('yyc3-agents-update', refresh);
  }, []);

  // Provider status
  const providerStatus = React.useMemo(() => {
    const configs = loadProviderConfigs();

    return configs.filter(c => c.enabled && c.apiKey).map(c => ({
      id: c.providerId,
      name: PROVIDERS[c.providerId]?.displayName || c.providerId,
      enabled: true,
    }));
  }, []);

  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // --- Quick Actions ---
  const handleQuickDeploy = React.useCallback(async () => {
    setActionLoading('deploy');
    await execute('Quick Deploy', ['Checkout', 'Install', 'Test', 'Build', 'Push Image', 'Deploy', 'Health Check'], {
      target: 'nas-docker', host: '192.168.3.22',
    });
    setActionLoading(null);
  }, [execute]);

  const handleQuickBuild = React.useCallback(async () => {
    setActionLoading('build');
    await execute('Frontend Build', ['Install', 'Lint', 'Type Check', 'Unit Test', 'Build'], {
      service: 'yyc3-chatbot', type: 'vite',
    });
    setActionLoading(null);
  }, [execute]);

  const handleQuickTest = React.useCallback(async () => {
    setActionLoading('test');
    await execute('Test Suite', ['Install', 'Unit Test', 'Integration Test', 'Coverage Report'], {
      service: 'yyc3-chatbot', coverage: true,
    });
    setActionLoading(null);
  }, [execute]);

  const handleSecurityScan = React.useCallback(async () => {
    setActionLoading('security');
    await execute('Security Scan', ['Checkout', 'Dependency Audit', 'SAST Scan', 'Secret Detection', 'Report'], {
      policy: 'strict',
    });
    setActionLoading(null);
  }, [execute]);

  const handleDiagnosis = React.useCallback(async () => {
    runDiagnosis();
    addLog('info', 'CMD_CENTER', zh ? '系统诊断已启动 (含基础设施探活)' : 'System diagnosis started (with infra probing)');
    eventBus.emit({
      category: 'system',
      type: 'system.diagnosis_started',
      level: 'info',
      source: 'CMD_CENTER',
      message: 'Full system diagnosis with infrastructure health probes initiated',
    });
  }, [runDiagnosis, addLog, zh]);

  const handleDbTest = React.useCallback(async () => {
    addLog('info', 'CMD_CENTER', `PostgreSQL connection test → 192.168.3.22:5433 (yyc3_max)`);
    eventBus.emit({
      category: 'system',
      type: 'system.db_test',
      level: 'info',
      source: 'CMD_CENTER',
      message: 'Database connection test initiated',
      metadata: { host: '192.168.3.22', port: 5433, user: 'yyc3_max' },
    });
    // Real probe: attempt HTTP to PG15 port
    const start = performance.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      await fetch('http://192.168.3.22:5433/', { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
      clearTimeout(timeout);
      const latency = Math.round(performance.now() - start);

      addLog('success', 'CMD_CENTER', `PG15 port probe successful (${latency}ms) — TCP accepting connections`);
      eventBus.emit({
        category: 'system', type: 'system.db_test_result', level: 'success',
        source: 'CMD_CENTER', message: `PG15 probe OK (${latency}ms)`,
        metadata: { latencyMs: latency, status: 'port_open' },
      });
    } catch {
      const latency = Math.round(performance.now() - start);

      addLog('warn', 'CMD_CENTER', `PG15 probe: ${latency > 2500 ? 'Timeout' : 'Port closed/refused'} (${latency}ms) — using local fallback`);
      eventBus.emit({
        category: 'system', type: 'system.db_test_result', level: 'warn',
        source: 'CMD_CENTER', message: `PG15 probe failed (${latency}ms)`,
        metadata: { latencyMs: latency, status: latency > 2500 ? 'timeout' : 'refused' },
      });
    }
  }, [addLog]);

  // M4 metrics
  const m4 = clusterMetrics?.['m4-max'];

  return (
    <div className="space-y-4">
      {/* Quick Actions Toolbar */}
      <Card className="bg-zinc-900/30 border-zinc-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {zh ? '快速操作' : 'Quick Actions'}
            {actionLoading && (
              <Badge variant="outline" className="text-[8px] font-mono text-sky-400 border-sky-500/30 ml-auto animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin mr-1" />
                {zh ? '执行中...' : 'Running...'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <QuickActionButton
              icon={Rocket} label={zh ? '快速部署' : 'Deploy'}
              description={zh ? '部署到 NAS Docker' : 'Deploy to NAS Docker'}
              color="text-emerald-400" onClick={handleQuickDeploy}
              loading={actionLoading === 'deploy'}
            />
            <QuickActionButton
              icon={Play} label={zh ? '构建' : 'Build'}
              description={zh ? '前端生产构建' : 'Frontend prod build'}
              color="text-sky-400" onClick={handleQuickBuild}
              loading={actionLoading === 'build'}
            />
            <QuickActionButton
              icon={Activity} label={zh ? '测试' : 'Test'}
              description={zh ? '运行测试套件' : 'Run test suite'}
              color="text-purple-400" onClick={handleQuickTest}
              loading={actionLoading === 'test'}
            />
            <QuickActionButton
              icon={Shield} label={zh ? '安全扫描' : 'Security'}
              description={zh ? '依赖审计+SAST' : 'Dep audit + SAST'}
              color="text-red-400" onClick={handleSecurityScan}
              loading={actionLoading === 'security'}
            />
            <QuickActionButton
              icon={RefreshCw} label={zh ? '系统诊断' : 'Diagnose'}
              description={zh ? '深度自检' : 'Deep self-check'}
              color="text-amber-400" onClick={handleDiagnosis}
            />
            <QuickActionButton
              icon={Database} label={zh ? 'PG15 测试' : 'PG15 Test'}
              description={zh ? '数据库连通性' : 'DB connectivity'}
              color="text-cyan-400" onClick={handleDbTest}
            />
          </div>
        </CardContent>
      </Card>

      {/* Phase 42: Execution Mode & Runner Status Bar */}
      <div className="flex items-center gap-3 px-1 flex-wrap">
        {/* Execution Mode Toggle */}
        <div className="flex items-center gap-1 bg-black/30 rounded-lg border border-white/5 p-0.5">
          <span className="text-[8px] font-mono text-zinc-600 px-1.5">{zh ? '执行模式' : 'Exec Mode'}</span>
          {(['simulated', 'real'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => dagExecutor.setExecutionMode(mode)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[9px] font-mono transition-all',
                dagExecutor.executionMode === mode
                  ? mode === 'real'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/10 text-white'
                  : 'text-zinc-600 hover:text-zinc-300',
              )}
            >
              {mode === 'simulated' ? (zh ? '模拟' : 'SIM') : (zh ? '真实' : 'REAL')}
            </button>
          ))}
        </div>

        {/* Runner Service Status */}
        <div className="flex items-center gap-1.5 bg-black/30 rounded-lg border border-white/5 p-0.5 px-2">
          <span className="text-[8px] font-mono text-zinc-600">Runner</span>
          <div className={cn('w-1.5 h-1.5 rounded-full',
            runnerHealth.status === 'online' ? 'bg-emerald-500' :
            runnerHealth.status === 'checking' ? 'bg-sky-500 animate-pulse' :
            runnerHealth.status === 'offline' ? 'bg-red-500' :
            runnerHealth.status === 'error' ? 'bg-amber-500' : 'bg-zinc-600',
          )} />
          <span className={cn('text-[8px] font-mono',
            runnerHealth.status === 'online' ? 'text-emerald-400' :
            runnerHealth.status === 'offline' ? 'text-red-400' : 'text-zinc-500',
          )}>
            {runnerHealth.status === 'online' ? `${runnerHealth.latencyMs}ms` :
             runnerHealth.status === 'checking' ? '...' :
             runnerHealth.status.toUpperCase()}
          </span>
          <button
            onClick={handleRunnerCheck}
            className="text-zinc-600 hover:text-zinc-300 transition-colors p-0.5"
            title={zh ? '检查 Runner 服务' : 'Check runner health'}
          >
            <RefreshCw className={cn('w-2.5 h-2.5', runnerHealth.status === 'checking' && 'animate-spin')} />
          </button>
        </div>

        {/* Phase 43: PG Telemetry Status */}
        {(() => {
          const pg = getPgTelemetryState();
          const pgConfig = getPgTelemetryConfig();

          return (
            <div className="flex items-center gap-1.5 bg-black/30 rounded-lg border border-white/5 p-0.5 px-2">
              <span className="text-[8px] font-mono text-zinc-600">PG:Tel</span>
              <div className={cn('w-1.5 h-1.5 rounded-full',
                pg.status === 'connected' ? 'bg-cyan-500' :
                pg.status === 'checking' ? 'bg-sky-500 animate-pulse' :
                pg.status === 'disconnected' ? 'bg-red-500' :
                pg.status === 'error' ? 'bg-amber-500' : 'bg-zinc-600',
              )} />
              <span className={cn('text-[8px] font-mono',
                pg.status === 'connected' ? 'text-cyan-400' :
                pg.status === 'disconnected' ? 'text-red-400' : 'text-zinc-500',
              )}>
                {pg.status === 'connected' ? `${pg.latencyMs}ms` :
                 pg.status === 'checking' ? '...' :
                 pgConfig.enabled ? pg.status.toUpperCase() : 'OFF'}
              </span>
              <button
                onClick={() => checkPgTelemetryHealth()}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-0.5"
                title={zh ? '检查 PG Telemetry 连接' : 'Check PG telemetry health'}
              >
                <RefreshCw className={cn('w-2.5 h-2.5', pg.status === 'checking' && 'animate-spin')} />
              </button>
            </div>
          );
        })()}

        {/* Pipeline Stats */}
        {runs.length > 0 && (
          <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-600 ml-auto">
            <span>{runs.filter(r => r.status === 'success').length} <span className="text-emerald-500">pass</span></span>
            <span>{runs.filter(r => r.status === 'failed').length} <span className="text-red-500">fail</span></span>
            <span>{runs.filter(r => r.status === 'running').length} <span className="text-sky-500">run</span></span>
          </div>
        )}
      </div>

      {/* Pipeline Execution Monitor */}
      {runs.length > 0 && (
        <Card className="bg-zinc-900/30 border-zinc-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              {zh ? 'Pipeline 执行监控' : 'Pipeline Execution'}
              <Badge variant="outline" className="text-[8px] font-mono text-zinc-500 border-zinc-700 ml-auto">
                {runs.filter(r => r.status === 'running').length} {zh ? '运行中' : 'running'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {runs.slice(0, 5).map(run => (
              <PipelineRunCard key={run.id} run={run} onCancel={cancel} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Infrastructure Health Matrix (Phase 39) */}
      <React.Suspense fallback={
        <div className="flex items-center justify-center h-16 text-zinc-600 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-mono text-[10px]">LOADING_INFRA_HEALTH...</span>
        </div>
      }>
        <InfraHealthMatrix />
      </React.Suspense>

      {/* Two Column: Agent Matrix + Provider Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agent Status Matrix */}
        <Card className="bg-zinc-900/30 border-zinc-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              {zh ? 'AI Agent 状态' : 'Agent Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1.5">
              {mergedAgentList.map(agent => {
                const history = agentHistories[agent.id] || [];
                const hasSession = history.length > 0;

                return (
                  <button
                    key={agent.id}
                    onClick={() => navigateToAgent(agent.id)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border transition-all hover:-translate-y-0.5',
                      hasSession
                        ? 'border-zinc-700/50 bg-zinc-800/30 hover:bg-zinc-800/50'
                        : 'border-zinc-800/30 bg-transparent hover:bg-zinc-900/50',
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full', hasSession ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700')} />
                    <div className="flex-1 text-left">
                      <div className={cn('text-[10px] font-mono flex items-center gap-1', agent.color)}>
                        {zh ? (agent.name.includes('·') ? agent.name.split('·')[1] : agent.name) : agent.nameEn}
                        {(agent as any).isCustom && (
                          <span className="text-[7px] px-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/20">USR</span>
                        )}
                      </div>
                      <div className="text-[8px] text-zinc-600">
                        {hasSession ? `${history.length} ${zh ? '条消息' : 'msgs'}` : (zh ? '空闲' : 'Idle')}
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Provider Health + System Quick Stats */}
        <Card className="bg-zinc-900/30 border-zinc-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
              <Network className="w-3.5 h-3.5 text-sky-400" />
              {zh ? 'Provider & 系统' : 'Provider & System'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Providers */}
            <div>
              <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-1.5">
                {zh ? 'LLM Provider 状态' : 'LLM Provider Status'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {providerStatus.length > 0 ? providerStatus.map(p => (
                  <Badge key={p.id} variant="outline" className="text-[8px] font-mono text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                    <Wifi className="w-2.5 h-2.5 mr-0.5" />
                    {p.name}
                  </Badge>
                )) : (
                  <Badge variant="outline" className="text-[8px] font-mono text-zinc-500 border-zinc-700">
                    <WifiOff className="w-2.5 h-2.5 mr-0.5" />
                    {zh ? '未配置 Provider' : 'No providers'}
                  </Badge>
                )}
              </div>
            </div>

            {/* System Quick Stats */}
            <div className="border-t border-zinc-800/50 pt-2">
              <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mb-1.5">
                {zh ? '系统概览' : 'System Overview'}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'CPU', value: m4 ? `${Math.round(m4.cpu)}%` : '--', color: (m4?.cpu ?? 0) > 70 ? 'text-amber-400' : 'text-zinc-300' },
                  { label: 'MEM', value: m4 ? `${Math.round(m4.memory)}%` : '--', color: (m4?.memory ?? 0) > 80 ? 'text-amber-400' : 'text-zinc-300' },
                  { label: 'DISK', value: m4 ? `${Math.round(m4.disk)}%` : '--', color: 'text-zinc-300' },
                  { label: 'TEMP', value: m4 ? `${Math.round(m4.temperature)}C` : '--', color: (m4?.temperature ?? 0) > 70 ? 'text-red-400' : 'text-zinc-300' },
                  { label: 'PG15', value: dbConnected ? 'LIVE' : 'OFF', color: dbConnected ? 'text-emerald-400' : 'text-zinc-600' },
                  { label: 'STATUS', value: systemStatus.toUpperCase(), color: systemStatus === 'optimal' ? 'text-emerald-400' : systemStatus === 'warning' ? 'text-amber-400' : 'text-red-400' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between px-2 py-1 bg-zinc-800/20 rounded text-[9px] font-mono">
                    <span className="text-zinc-600">{stat.label}</span>
                    <span className={stat.color}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick nav to key areas */}
            <div className="border-t border-zinc-800/50 pt-2 flex items-center gap-1.5 flex-wrap">
              {[
                { label: zh ? '硬件遥测' : 'HW Monitor', tab: 'hardware_monitor', icon: Cpu, color: 'text-violet-400' },
                { label: 'DevOps', tab: 'devops', icon: Terminal, color: 'text-emerald-400' },
                { label: zh ? '安全审计' : 'Security', tab: 'security_audit', icon: Shield, color: 'text-red-400' },
                { label: zh ? '流式诊断' : 'Stream Diag', tab: 'stream_diagnostics', icon: Radio, color: 'text-sky-400' },
                { label: zh ? '基础设施' : 'Infra', tab: 'infra_health', icon: Activity, color: 'text-emerald-400' },
                { label: zh ? '运维脚本' : 'Ops Scripts', tab: 'ops_script', icon: FileText, color: 'text-amber-400' },
                { label: zh ? '遥测代理' : 'Telemetry', tab: 'telemetry_agent_manager', icon: Radio, color: 'text-pink-400' },
              ].map(q => (
                <Button
                  key={q.tab}
                  variant="ghost"
                  size="sm"
                  className={cn('h-6 text-[9px] font-mono gap-1 px-2', q.color)}
                  onClick={() => navigateToConsoleTab(q.tab)}
                >
                  <q.icon className="w-3 h-3" />
                  {q.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live EventBus Feed */}
      <Card className="bg-zinc-900/30 border-zinc-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-pink-400" />
            {zh ? '实时事件流' : 'Live Event Feed'}
            <Badge variant="outline" className="text-[8px] font-mono text-zinc-600 border-zinc-700 ml-auto">
              {recentEvents.length} {zh ? '事件' : 'events'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px]">
            <div className="space-y-0.5">
              {recentEvents.slice().reverse().slice(0, 15).map(event => {
                const levelColors: Record<string, string> = {
                  info: 'text-sky-500',
                  success: 'text-emerald-500',
                  warn: 'text-amber-500',
                  error: 'text-red-500',
                  debug: 'text-zinc-600',
                };
                const levelIcons: Record<string, string> = {
                  info: '-',
                  success: '+',
                  warn: '~',
                  error: '!',
                  debug: '.',
                };

                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-2 py-1 px-2 rounded hover:bg-zinc-800/20 transition-colors text-[9px] font-mono"
                  >
                    <span className={cn('shrink-0 mt-0.5 w-2 text-center', levelColors[event.level])}>
                      {levelIcons[event.level] || '-'}
                    </span>
                    <span className="text-zinc-600 shrink-0 w-[52px]">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={cn(
                      'shrink-0 w-16 truncate',
                      event.category === 'system' ? 'text-zinc-500' :
                      event.category === 'orchestrate' ? 'text-cyan-500' :
                      event.category === 'persist' ? 'text-green-500' :
                      event.category === 'mcp' ? 'text-amber-500' :
                      event.category === 'security' ? 'text-red-500' :
                      'text-purple-500',
                    )}>
                      {event.source.slice(0, 10)}
                    </span>
                    <span className="text-zinc-400 truncate flex-1">{event.message}</span>
                  </div>
                );
              })}
              {recentEvents.length === 0 && (
                <div className="text-center text-zinc-700 text-[10px] font-mono py-8">
                  {zh ? '等待事件...' : 'Awaiting events...'}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Model Routing Status (Phase 40) */}
      <Card className="bg-zinc-900/30 border-zinc-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
            <Key className="w-3.5 h-3.5 text-pink-400" />
            {zh ? '模型路由状态' : 'Model Routing'}
            <Badge variant="outline" className={cn(
              'text-[8px] font-mono ml-auto',
              providerStatus.length > 0 ? 'text-emerald-400 border-emerald-500/20' : 'text-zinc-600 border-zinc-700',
            )}>
              {providerStatus.length} {zh ? '活跃' : 'active'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.values(PROVIDERS).slice(0, 8).map(p => {
              const isActive = providerStatus.some(ps => ps.id === p.id);

              return (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border transition-all',
                    isActive
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-zinc-800/30 bg-transparent opacity-50',
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full', isActive ? 'bg-emerald-500' : 'bg-zinc-700')} />
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-[9px] font-mono truncate', isActive ? p.color : 'text-zinc-600')}>
                      {p.displayName}
                    </div>
                    <div className="text-[7px] font-mono text-zinc-700 truncate">
                      {p.defaultModel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800/50">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] font-mono gap-1 px-2 text-zinc-500 hover:text-white"
              onClick={() => {
                const store = useSystemStore.getState();

                store.openSettings('models');
              }}
            >
              <Settings className="w-3 h-3" />
              {zh ? '配置模型' : 'Configure'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] font-mono gap-1 px-2 text-zinc-500 hover:text-white"
              onClick={() => navigateToConsoleTab('ops_script')}
            >
              <FileText className="w-3 h-3" />
              {zh ? '运维脚本' : 'Ops Scripts'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}