// ============================================================
// YYC3 — PG Proxy Deployment Toolkit
// Phase 46: One-stop deployment & monitoring for yyc3-pg-proxy
//
// Features:
//   - Step-by-step deployment wizard (SSH → PG verify → Schema → Proxy → Health)
//   - Auto-generated pg-proxy.js v2, package.json, systemd/launchd service files
//   - Schema validation with table/view/extension checks
//   - Real-time connection status dashboard
//   - Copy-to-clipboard for all scripts
//
// Architecture: Frontend → yyc3-pg-proxy (:3003) → PostgreSQL 15 (:5433)
// ============================================================

import {
  Server, Database, CheckCircle2, XCircle, Loader2,
  Copy, Check, Terminal, Rocket, Shield, RefreshCw,
  FileText, Play, AlertTriangle,
  Cpu, BarChart3, Layers, ArrowRight, Package, Wrench, Clock, Wifi,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { eventBus } from '@/lib/event-bus';
import type { SchemaValidationResult } from '@/lib/pg-telemetry-client';
import {
  getPgTelemetryConfig, setPgTelemetryConfig, getPgTelemetryState,
  checkPgTelemetryHealth, validateTelemetrySchema,
  getMigrationSQL, getPgProxyScriptV2, getPgProxyPackageJson,
  getPgProxyServiceTemplate, getPgProxyLaunchdTemplate, getDeployScript,
} from '@/lib/pg-telemetry-client';
import { cn } from '@/lib/utils';

// ============================================================
// Deploy Step Definition
// ============================================================

interface DeployStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'running' | 'done' | 'error' | 'skipped';
  detail?: string;
}

const INITIAL_STEPS: DeployStep[] = [
  { id: 'prereq', title: '环境预检', titleEn: 'Prerequisites', description: 'Node.js, PostgreSQL 15, yyc3_max user', icon: Shield, status: 'pending' },
  { id: 'files', title: '生成部署文件', titleEn: 'Generate Files', description: 'pg-proxy.js, package.json', icon: FileText, status: 'pending' },
  { id: 'schema', title: '应用 Schema', titleEn: 'Apply Schema', description: 'telemetry.metrics, thermal_log, alerts, latency_history', icon: Database, status: 'pending' },
  { id: 'install', title: '安装依赖', titleEn: 'Install Dependencies', description: 'npm install express pg cors', icon: Package, status: 'pending' },
  { id: 'start', title: '启动服务', titleEn: 'Start Service', description: 'node pg-proxy.js (port 3003)', icon: Play, status: 'pending' },
  { id: 'health', title: '健康检查', titleEn: 'Health Check', description: 'GET http://192.168.3.22:3003/health', icon: Wifi, status: 'pending' },
  { id: 'validate', title: 'Schema 验证', titleEn: 'Schema Validation', description: 'Verify all 4 tables + 2 views exist', icon: CheckCircle2, status: 'pending' },
];

// ============================================================
// CopyButton Component
// ============================================================

function CopyButton({ text, label, size = 'sm' }: { text: string; label: string; size?: 'sm' | 'xs' }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        'text-zinc-400 hover:text-white transition-all',
        size === 'xs' ? 'h-6 px-2 text-[9px]' : 'h-7 px-3 text-[10px]',
      )}
      onClick={handleCopy}
    >
      {copied ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
      {copied ? 'Copied!' : label}
    </Button>
  );
}

// ============================================================
// Step Indicator
// ============================================================

function StepIndicator({ step, index, isLast }: { step: DeployStep; index: number; isLast: boolean }) {
  const statusColors = {
    pending: 'border-zinc-700 bg-zinc-800 text-zinc-600',
    running: 'border-sky-500 bg-sky-500/10 text-sky-400 animate-pulse',
    done: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    error: 'border-red-500 bg-red-500/10 text-red-400',
    skipped: 'border-zinc-600 bg-zinc-800/50 text-zinc-600',
  };

  const lineColors = {
    pending: 'bg-zinc-800',
    running: 'bg-sky-500/30',
    done: 'bg-emerald-500/30',
    error: 'bg-red-500/30',
    skipped: 'bg-zinc-800/50',
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
          statusColors[step.status],
        )}>
          {step.status === 'running' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : step.status === 'done' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : step.status === 'error' ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <span className="text-[10px] font-mono">{index + 1}</span>
          )}
        </div>
        {!isLast && (
          <div className={cn('w-0.5 h-8 transition-all', lineColors[step.status])} />
        )}
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2">
          <step.icon className={cn('w-3.5 h-3.5', step.status === 'done' ? 'text-emerald-400' : step.status === 'error' ? 'text-red-400' : 'text-zinc-500')} />
          <span className={cn('text-xs font-mono', step.status === 'done' ? 'text-emerald-400' : step.status === 'error' ? 'text-red-400' : 'text-zinc-300')}>
            {step.title}
          </span>
          <span className="text-[9px] text-zinc-600">{step.titleEn}</span>
        </div>
        <p className="text-[9px] text-zinc-600 mt-0.5 ml-5">{step.description}</p>
        {step.detail && (
          <p className={cn('text-[9px] mt-0.5 ml-5 font-mono', step.status === 'error' ? 'text-red-400/80' : 'text-zinc-500')}>
            {step.detail}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Schema Validation Panel
// ============================================================

function SchemaValidationPanel({ result }: { result: SchemaValidationResult | null }) {
  if (!result) return null;

  return (
    <div className="space-y-3">
      {/* Overall Status */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono',
        result.valid
          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
          : 'border-red-500/20 bg-red-500/5 text-red-400',
      )}>
        {result.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        {result.valid ? 'Schema Valid — All Objects Verified' : result.error || 'Schema Incomplete'}
        <span className="text-zinc-500 ml-auto">{result.latencyMs}ms</span>
      </div>

      {/* Tables */}
      {result.tables.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {result.tables.map(t => (
            <div
              key={t.name}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded border text-[9px] font-mono',
                t.exists
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                  : 'border-red-500/20 bg-red-500/5 text-red-400',
              )}
            >
              {t.exists ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              <span className="truncate">{t.name.replace('telemetry.', '')}</span>
              {t.exists && <span className="text-zinc-500 ml-auto">{t.rowCount}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Views & Extensions */}
      <div className="flex items-center gap-2 flex-wrap">
        {result.views.map(v => (
          <Badge key={v.name} variant="outline" className="text-[8px] border-cyan-500/20 text-cyan-400">
            VIEW: {v.name.replace('telemetry.', '')}
          </Badge>
        ))}
        {result.extensions.map(ext => (
          <Badge key={ext} variant="outline" className="text-[8px] border-violet-500/20 text-violet-400">
            EXT: {ext}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function PgProxyDeployKit() {
  const [steps, setSteps] = React.useState<DeployStep[]>(INITIAL_STEPS);
  const [activeTab, setActiveTab] = React.useState<'wizard' | 'files' | 'status' | 'validate'>('status');
  const [pgState, setPgState] = React.useState(getPgTelemetryState());
  const [pgConfig, setPgConfigLocal] = React.useState(getPgTelemetryConfig());
  const [testing, setTesting] = React.useState(false);
  const [validating, setValidating] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<SchemaValidationResult | null>(null);
  const [proxyUrlInput, setProxyUrlInput] = React.useState(pgConfig.baseUrl);

  // Refresh state
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPgState(getPgTelemetryState());
      setPgConfigLocal(getPgTelemetryConfig());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    const result = await checkPgTelemetryHealth();

    setPgState(result);
    setTesting(false);
    eventBus.emit({
      category: 'persist', type: 'persist.pg_proxy_test', level: result.status === 'connected' ? 'success' : 'warn',
      source: 'PG_DEPLOY', message: `PG Proxy connection test: ${result.status} (${result.latencyMs}ms)`,
    });
  };

  const handleValidateSchema = async () => {
    setValidating(true);
    const result = await validateTelemetrySchema();

    setValidationResult(result);
    setValidating(false);
    eventBus.emit({
      category: 'persist', type: 'persist.pg_schema_validate', level: result.valid ? 'success' : 'warn',
      source: 'PG_DEPLOY', message: `Schema validation: ${result.valid ? 'VALID' : 'INVALID'} (${result.latencyMs}ms)`,
    });
  };

  const handleUpdateProxyUrl = () => {
    setPgTelemetryConfig({ baseUrl: proxyUrlInput.trim() || 'http://192.168.3.22:3003' });
    setPgConfigLocal(getPgTelemetryConfig());
  };

  const handleToggleEnabled = () => {
    setPgTelemetryConfig({ enabled: !pgConfig.enabled });
    setPgConfigLocal(getPgTelemetryConfig());
  };

  // Simulate deployment wizard
  const handleRunWizard = async () => {
    setActiveTab('wizard');
    const newSteps = [...INITIAL_STEPS];

    setSteps(newSteps);

    for (let i = 0; i < newSteps.length; i++) {
      newSteps[i] = { ...newSteps[i], status: 'running' };
      setSteps([...newSteps]);
      await new Promise(r => setTimeout(r, 800 + Math.random() * 400));

      if (i === 5) {
        // Health check step — actually test the connection
        try {
          const result = await checkPgTelemetryHealth();

          setPgState(result);
          if (result.status === 'connected') {
            newSteps[i] = { ...newSteps[i], status: 'done', detail: `Connected (${result.latencyMs}ms)` };
          } else {
            newSteps[i] = { ...newSteps[i], status: 'error', detail: result.error || 'Connection failed — deploy proxy first' };
          }
        } catch {
          newSteps[i] = { ...newSteps[i], status: 'error', detail: 'Connection failed — is the proxy running?' };
        }
      } else if (i === 6) {
        // Validate step
        try {
          const result = await validateTelemetrySchema();

          setValidationResult(result);
          if (result.valid) {
            newSteps[i] = { ...newSteps[i], status: 'done', detail: `${result.tables.length} tables verified` };
          } else {
            newSteps[i] = { ...newSteps[i], status: pgState.status === 'connected' ? 'error' : 'skipped', detail: result.error || 'Schema not yet deployed' };
          }
        } catch {
          newSteps[i] = { ...newSteps[i], status: 'skipped', detail: 'Cannot validate — proxy not connected' };
        }
      } else {
        newSteps[i] = { ...newSteps[i], status: 'done' };
      }
      setSteps([...newSteps]);
    }
  };

  const statusDot = pgState.status === 'connected' ? 'bg-emerald-500' :
    pgState.status === 'checking' ? 'bg-sky-500 animate-pulse' :
    pgState.status === 'disconnected' ? 'bg-red-500' :
    pgState.status === 'error' ? 'bg-amber-500' : 'bg-zinc-700';

  const TABS = [
    { id: 'status', label: 'Connection', icon: Wifi },
    { id: 'wizard', label: 'Deploy Wizard', icon: Rocket },
    { id: 'files', label: 'Files & Scripts', icon: FileText },
    { id: 'validate', label: 'Validate', icon: Shield },
  ] as const;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl text-white tracking-tight flex items-center gap-3">
            <Server className="w-6 h-6 text-cyan-400" />
            PG Proxy Deploy Kit
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            yyc3-pg-proxy v2 — REST → PostgreSQL 15 Telemetry Proxy on 192.168.3.22:3003
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan-500/20 text-cyan-400 bg-cyan-500/5 text-[10px]">
            <Rocket className="w-3 h-3 mr-1" />
            Phase 46
          </Badge>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 border border-white/5">
            <div className={cn('w-2 h-2 rounded-full', statusDot)} />
            <span className="text-[9px] font-mono text-zinc-400">
              {pgState.status === 'connected' ? `Online (${pgState.latencyMs}ms)` : pgState.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-black/30 rounded-lg border border-white/5 p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono transition-all',
              activeTab === tab.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Connection Status */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          {/* Config Card */}
          <Card className="bg-zinc-900/40 border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wrench className="w-4 h-4 text-cyan-400" />
                Proxy Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL Input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-black/30 rounded-lg border border-white/5 px-3 py-2">
                  <span className="text-[9px] text-zinc-600 font-mono shrink-0">BASE_URL</span>
                  <input
                    type="text"
                    value={proxyUrlInput}
                    onChange={e => setProxyUrlInput(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-mono text-white outline-none"
                    placeholder="http://192.168.3.22:3003"
                  />
                </div>
                <Button size="sm" variant="outline" className="h-9 px-3 text-[10px] border-cyan-500/20 text-cyan-400" onClick={handleUpdateProxyUrl}>
                  Save
                </Button>
              </div>

              {/* Enable Toggle + Test */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleEnabled}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-all',
                      pgConfig.enabled ? 'bg-cyan-500/30 border border-cyan-500/50' : 'bg-zinc-800 border border-white/10',
                    )}
                  >
                    <div className={cn(
                      'absolute w-4 h-4 rounded-full transition-all top-[3px]',
                      pgConfig.enabled ? 'left-[24px] bg-cyan-400' : 'left-[3px] bg-zinc-500',
                    )} />
                  </button>
                  <span className="text-xs font-mono text-zinc-400">
                    {pgConfig.enabled ? 'PG Telemetry Enabled' : 'PG Telemetry Disabled'}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="h-8 px-3 text-[10px] border-white/10" onClick={handleTestConnection} disabled={testing}>
                  {testing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                  Test Connection
                </Button>
              </div>

              {/* Connection Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-black/30 rounded-lg border border-white/5 p-3 text-center">
                  <div className="text-[9px] font-mono text-zinc-500 mb-1">Status</div>
                  <div className={cn('text-sm font-mono',
                    pgState.status === 'connected' ? 'text-emerald-400' :
                    pgState.status === 'error' ? 'text-red-400' : 'text-zinc-400',
                  )}>
                    {pgState.status.toUpperCase()}
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg border border-white/5 p-3 text-center">
                  <div className="text-[9px] font-mono text-zinc-500 mb-1">Latency</div>
                  <div className="text-sm font-mono text-cyan-400">
                    {pgState.latencyMs !== undefined ? `${pgState.latencyMs}ms` : '—'}
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg border border-white/5 p-3 text-center">
                  <div className="text-[9px] font-mono text-zinc-500 mb-1">Tables</div>
                  <div className="text-sm font-mono text-violet-400">
                    {pgState.tableCount !== undefined ? pgState.tableCount : '—'}
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg border border-white/5 p-3 text-center">
                  <div className="text-[9px] font-mono text-zinc-500 mb-1">Rows</div>
                  <div className="text-sm font-mono text-amber-400">
                    {pgState.rowCount !== undefined ? pgState.rowCount.toLocaleString() : '—'}
                  </div>
                </div>
              </div>

              {pgState.error && (
                <div className="text-[9px] font-mono text-red-400/80 bg-red-500/5 border border-red-500/10 rounded p-2">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {pgState.error}
                </div>
              )}

              {pgConfig.lastConnected && (
                <div className="text-[9px] font-mono text-zinc-600">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Last connected: {new Date(pgConfig.lastConnected).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Architecture Diagram */}
          <Card className="bg-zinc-900/40 border-white/5">
            <CardContent className="p-4">
              <div className="text-[9px] font-mono text-zinc-500 mb-3 uppercase tracking-wider">Architecture Flow</div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[
                  { label: 'Browser', sub: 'React 18', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
                  { label: '→', sub: '', color: 'text-zinc-600', bg: '' },
                  { label: 'yyc3-pg-proxy', sub: ':3003 (Express)', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                  { label: '→', sub: '', color: 'text-zinc-600', bg: '' },
                  { label: 'PostgreSQL 15', sub: ':5433 (yyc3_max)', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                  { label: '→', sub: '', color: 'text-zinc-600', bg: '' },
                  { label: 'telemetry.*', sub: '4 tables + 2 views', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                ].map((node, i) => (
                  node.bg ? (
                    <div key={i} className={cn('px-3 py-2 rounded-lg border text-center', node.bg)}>
                      <div className={cn('text-[10px] font-mono', node.color)}>{node.label}</div>
                      <div className="text-[8px] text-zinc-500">{node.sub}</div>
                    </div>
                  ) : (
                    <ArrowRight key={i} className="w-4 h-4 text-zinc-700 shrink-0" />
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: Deploy Wizard */}
      {activeTab === 'wizard' && (
        <div className="space-y-4">
          <Card className="bg-zinc-900/40 border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Rocket className="w-4 h-4 text-cyan-400" />
                Deployment Wizard
              </CardTitle>
              <CardDescription className="text-[10px]">
                Step-by-step deployment flow for yyc3-pg-proxy on 192.168.3.22
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {steps.map((step, i) => (
                <StepIndicator key={step.id} step={step} index={i} isLast={i === steps.length - 1} />
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRunWizard}
              className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Run Deploy Wizard
            </Button>
            <span className="text-[9px] text-zinc-600 font-mono">
              (Steps 1-4 are simulated — copy scripts to deploy manually on 192.168.3.22)
            </span>
          </div>

          {validationResult && (
            <Card className="bg-zinc-900/40 border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Wizard Validation Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SchemaValidationPanel result={validationResult} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB: Files & Scripts */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          {/* File Cards */}
          {[
            { title: 'pg-proxy.js (v2)', desc: 'Express REST → PG proxy with validate + aggregation endpoints', fn: getPgProxyScriptV2, label: 'Copy pg-proxy.js', icon: Server },
            { title: 'package.json', desc: 'NPM dependencies: express, pg, cors', fn: getPgProxyPackageJson, label: 'Copy package.json', icon: Package },
            { title: 'Schema SQL (DDL)', desc: 'CREATE TABLE for metrics, thermal_log, alerts, latency_history + views', fn: getMigrationSQL, label: 'Copy SQL', icon: Database },
            { title: 'systemd Service', desc: 'Linux service unit for auto-start', fn: getPgProxyServiceTemplate, label: 'Copy systemd', icon: Terminal },
            { title: 'launchd Plist', desc: 'macOS LaunchDaemon for auto-start', fn: getPgProxyLaunchdTemplate, label: 'Copy launchd', icon: Cpu },
            { title: 'Deploy Script', desc: 'One-shot bash: mkdir → write files → npm install → migrate → start → health check', fn: getDeployScript, label: 'Copy deploy.sh', icon: Rocket },
          ].map(file => (
            <Card key={file.title} className="bg-zinc-900/40 border-white/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <file.icon className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-mono text-white">{file.title}</div>
                      <div className="text-[9px] text-zinc-500">{file.desc}</div>
                    </div>
                  </div>
                  <CopyButton text={file.fn()} label={file.label} />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Quick Deploy Command */}
          <Card className="bg-zinc-900/40 border-cyan-500/10">
            <CardContent className="p-4">
              <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase tracking-wider">Quick Deploy (SSH into 192.168.3.22 first)</div>
              <div className="bg-black/50 rounded p-3 font-mono text-[10px] text-cyan-400 border border-white/5">
                <div className="text-zinc-600"># 1. SSH to target host</div>
                <div>ssh yyc3@192.168.3.22</div>
                <div className="text-zinc-600 mt-2"># 2. Create directory & install</div>
                <div>sudo mkdir -p /opt/yyc3/pg-proxy && cd /opt/yyc3/pg-proxy</div>
                <div className="text-zinc-600 mt-2"># 3. Paste pg-proxy.js and package.json (use buttons above)</div>
                <div>npm install --production</div>
                <div className="text-zinc-600 mt-2"># 4. Run schema migration</div>
                <div>psql -h localhost -p 5433 -U yyc3_max -d yyc3 -f schema.sql</div>
                <div className="text-zinc-600 mt-2"># 5. Start proxy</div>
                <div>node pg-proxy.js</div>
                <div className="text-zinc-600 mt-2"># 6. Test</div>
                <div>curl http://localhost:3003/health</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: Validate */}
      {activeTab === 'validate' && (
        <div className="space-y-4">
          <Card className="bg-zinc-900/40 border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-cyan-400" />
                Telemetry Schema Validation
              </CardTitle>
              <CardDescription className="text-[10px]">
                Query information_schema to verify all telemetry objects exist in PostgreSQL 15
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleValidateSchema}
                disabled={validating || !pgConfig.enabled}
                className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
              >
                {validating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                Run Schema Validation
              </Button>

              {!pgConfig.enabled && (
                <div className="text-[9px] font-mono text-amber-400/80 bg-amber-500/5 border border-amber-500/10 rounded p-2">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Enable PG Telemetry in the Connection tab first
                </div>
              )}

              <SchemaValidationPanel result={validationResult} />

              {/* Expected Schema */}
              <div className="bg-black/30 rounded-lg border border-white/5 p-3">
                <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase tracking-wider">Expected Schema Objects</div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  <div>
                    <div className="text-zinc-400 mb-1">Tables (4)</div>
                    {['telemetry.metrics', 'telemetry.thermal_log', 'telemetry.alerts', 'telemetry.latency_history'].map(t => (
                      <div key={t} className="text-zinc-600 flex items-center gap-1">
                        <Database className="w-2.5 h-2.5" /> {t}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-zinc-400 mb-1">Views (2)</div>
                    {['telemetry.v_latest_metrics', 'telemetry.v_latency_summary'].map(v => (
                      <div key={v} className="text-zinc-600 flex items-center gap-1">
                        <BarChart3 className="w-2.5 h-2.5" /> {v}
                      </div>
                    ))}
                    <div className="text-zinc-400 mt-2 mb-1">Extensions</div>
                    {['uuid-ossp', 'pgvector', 'pg_trgm'].map(e => (
                      <div key={e} className="text-zinc-600 flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5" /> {e}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
