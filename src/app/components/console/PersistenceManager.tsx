import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Database, HardDrive, Download, Upload, Save, Trash2,
  RefreshCw, Clock, CheckCircle2, AlertCircle, Archive,
  ArrowRight, Copy, Settings, Wifi, WifiOff, BarChart3,
  FolderOpen, Shield, Layers, ChevronRight, Check,
  History, FileText
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { useSystemStore } from "@/lib/store";
import {
  getPersistenceEngine,
  loadEngineConfig,
  saveEngineConfig,
  type PersistDomain,
  type StorageStats,
  type PersistSnapshot,
  type SyncStrategy,
  type PersistenceEngineConfig,
} from "@/lib/persistence-engine";

// --- Domain Metadata ---
const DOMAIN_META: Record<PersistDomain, { label: string; icon: typeof Database; color: string }> = {
  chat_sessions:    { label: 'Chat Sessions', icon: FileText, color: 'text-blue-400' },
  chat_messages:    { label: 'Chat Messages', icon: FileText, color: 'text-blue-300' },
  agent_sessions:   { label: 'Agent Sessions', icon: Database, color: 'text-amber-400' },
  agent_messages:   { label: 'Agent Messages', icon: Database, color: 'text-amber-300' },
  metrics_snapshots:{ label: 'Metrics', icon: BarChart3, color: 'text-green-400' },
  system_logs:      { label: 'System Logs', icon: FileText, color: 'text-zinc-400' },
  workflows:        { label: 'Workflows', icon: Layers, color: 'text-purple-400' },
  templates:        { label: 'Templates', icon: FolderOpen, color: 'text-pink-400' },
  artifacts:        { label: 'Artifacts', icon: Archive, color: 'text-cyan-400' },
  mcp_registry:     { label: 'MCP Registry', icon: Settings, color: 'text-amber-500' },
  mcp_call_log:     { label: 'MCP Call Log', icon: Clock, color: 'text-orange-400' },
  device_configs:   { label: 'Device Configs', icon: HardDrive, color: 'text-green-500' },
  llm_configs:      { label: 'LLM Configs', icon: Shield, color: 'text-red-400' },
  llm_usage:        { label: 'LLM Usage', icon: BarChart3, color: 'text-emerald-400' },
  preferences:      { label: 'Preferences', icon: Settings, color: 'text-zinc-400' },
  knowledge_base:   { label: 'Knowledge Base', icon: Database, color: 'text-blue-500' },
  agent_profiles:   { label: 'Agent Profiles', icon: Database, color: 'text-amber-600' },
};

const STRATEGY_OPTIONS: Array<{ value: SyncStrategy; label: string; desc: string }> = [
  { value: 'local-only', label: 'Local Only', desc: 'localStorage only, no NAS sync' },
  { value: 'auto', label: 'Auto', desc: 'Sync to NAS when available, fallback to local' },
  { value: 'dual-write', label: 'Dual Write', desc: 'Always write to both localStorage and NAS' },
  { value: 'nas-primary', label: 'NAS Primary', desc: 'NAS as primary storage, local as cache' },
];

export function PersistenceManager() {
  const addLog = useSystemStore((s) => s.addLog);
  const isMobile = useSystemStore((s) => s.isMobile);

  const engine = React.useMemo(() => getPersistenceEngine(), []);

  const [stats, setStats] = React.useState<StorageStats | null>(null);
  const [nasAvailable, setNasAvailable] = React.useState(false);
  const [config, setConfig] = React.useState<PersistenceEngineConfig>(loadEngineConfig);
  const [snapshots, setSnapshots] = React.useState<PersistSnapshot[]>(engine.getSnapshots());
  const [loading, setLoading] = React.useState<string | null>(null);
  const [activeSection, setActiveSection] = React.useState<'overview' | 'domains' | 'snapshots' | 'config'>('overview');
  const [domainData, setDomainData] = React.useState<Record<string, number>>({});

  // Load stats
  const refreshStats = React.useCallback(async () => {
    setLoading('stats');
    const s = await engine.getStats();
    setStats(s);
    setDomainData(s.domainCounts);
    setLoading(null);
  }, [engine]);

  React.useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleCheckNas = async () => {
    setLoading('nas');
    const available = await engine.checkNasHealth();
    setNasAvailable(available);
    addLog(available ? 'success' : 'warn', 'PERSIST', `NAS health check: ${available ? 'ONLINE' : 'OFFLINE'}`);
    setLoading(null);
  };

  const handleCreateSnapshot = async () => {
    setLoading('snapshot');
    try {
      const snap = await engine.createSnapshot();
      setSnapshots(engine.getSnapshots());
      addLog('success', 'PERSIST', `Snapshot created: ${snap.id} (${snap.metadata.totalRecords} records)`);
    } catch (e) {
      addLog('error', 'PERSIST', `Snapshot failed: ${e}`);
    }
    setLoading(null);
  };

  const handleExport = () => {
    const json = engine.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yyc3-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('success', 'PERSIST', 'Full data exported as JSON');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const result = engine.importFromJSON(text);
        addLog('success', 'PERSIST', `Imported ${result.imported} items, ${result.errors.length} errors`);
        refreshStats();
      } catch (err) {
        addLog('error', 'PERSIST', `Import failed: ${err}`);
      }
    };
    input.click();
  };

  const handleClearDomain = async (domain: PersistDomain) => {
    await engine.clear(domain);
    addLog('warn', 'PERSIST', `Cleared domain: ${domain}`);
    refreshStats();
  };

  const handleUpdateConfig = (updates: Partial<PersistenceEngineConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    engine.updateConfig(updates);
    saveEngineConfig(newConfig);
    addLog('info', 'PERSIST', `Config updated: ${JSON.stringify(updates)}`);
  };

  const handleFlushQueue = async () => {
    setLoading('flush');
    const result = await engine.flushSyncQueue();
    addLog('info', 'PERSIST', `Sync queue flushed: ${result.success} synced, ${result.failed} failed`);
    setLoading(null);
  };

  const sections: Array<{ id: typeof activeSection; label: string; icon: typeof Database }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'domains', label: 'Domains', icon: Database },
    { id: 'snapshots', label: 'Snapshots', icon: History },
    { id: 'config', label: 'Config', icon: Settings },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Database className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl text-white tracking-tight">Persistence Engine</h2>
            <p className="text-xs text-zinc-500 font-mono">Full-chain Data Persistence v17.1</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-mono gap-1",
              nasAvailable ? "text-green-400 border-green-500/20" : "text-zinc-500 border-white/10"
            )}
          >
            {nasAvailable ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            NAS: {nasAvailable ? 'ONLINE' : 'OFFLINE'}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-500">
            {config.strategy.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0.5">
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-t-lg transition-colors",
              activeSection === sec.id
                ? "bg-white/5 text-white border-b-2 border-primary"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <sec.icon className="w-3.5 h-3.5" />
            {sec.label}
          </button>
        ))}
      </div>

      {/* SECTION: Overview */}
      {activeSection === 'overview' && (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-4")}>
            <Card className="bg-zinc-900/40 border-white/5">
              <CardContent className="p-4">
                <div className="text-[10px] text-zinc-500 font-mono mb-1">Total Records</div>
                <div className="text-2xl text-white font-mono">{stats?.totalRecords || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/40 border-white/5">
              <CardContent className="p-4">
                <div className="text-[10px] text-zinc-500 font-mono mb-1">Storage Size</div>
                <div className="text-2xl text-white font-mono">{stats?.totalSizeKB || 0}<span className="text-sm text-zinc-500"> KB</span></div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/40 border-white/5">
              <CardContent className="p-4">
                <div className="text-[10px] text-zinc-500 font-mono mb-1">Domains</div>
                <div className="text-2xl text-white font-mono">{Object.keys(stats?.domainCounts || {}).length}</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/40 border-white/5">
              <CardContent className="p-4">
                <div className="text-[10px] text-zinc-500 font-mono mb-1">Snapshots</div>
                <div className="text-2xl text-white font-mono">{snapshots.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1.5" onClick={handleCheckNas} disabled={loading === 'nas'}>
              {loading === 'nas' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />} Check NAS
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1.5" onClick={handleCreateSnapshot} disabled={loading === 'snapshot'}>
              {loading === 'snapshot' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Create Snapshot
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1.5" onClick={handleExport}>
              <Download className="w-3 h-3" /> Export All
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1.5" onClick={handleImport}>
              <Upload className="w-3 h-3" /> Import
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1.5" onClick={handleFlushQueue}
              disabled={loading === 'flush' || engine.syncQueue.length === 0}>
              {loading === 'flush' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
              Flush Queue ({engine.syncQueue.length})
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1.5" onClick={refreshStats} disabled={loading === 'stats'}>
              {loading === 'stats' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Refresh
            </Button>
          </div>

          {/* Domain Distribution */}
          <Card className="bg-zinc-900/40 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400">Data Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(domainData).sort((a, b) => b[1] - a[1]).map(([domain, count]) => {
                  const meta = DOMAIN_META[domain as PersistDomain];
                  const maxCount = Math.max(...Object.values(domainData), 1);
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={domain} className="flex items-center gap-3">
                      <span className={cn("text-[10px] font-mono w-28 truncate", meta?.color || 'text-zinc-400')}>
                        {meta?.label || domain}
                      </span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", meta?.color?.replace('text-', 'bg-') || 'bg-zinc-500')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION: Domains */}
      {activeSection === 'domains' && (
        <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2 xl:grid-cols-3")}>
          {(Object.entries(DOMAIN_META) as [PersistDomain, typeof DOMAIN_META[PersistDomain]][]).map(([domain, meta]) => {
            const count = domainData[domain] || 0;
            const Icon = meta.icon;
            return (
              <Card key={domain} className="bg-zinc-900/40 border-white/5 group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", meta.color)} />
                      <span className="text-xs font-mono text-zinc-300">{meta.label}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono text-zinc-500">{count} records</Badge>
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono mb-3">{domain}</div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[9px] font-mono text-zinc-400" onClick={refreshStats}>
                      <RefreshCw className="w-2.5 h-2.5 mr-1" /> Refresh
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[9px] font-mono text-red-400" onClick={() => handleClearDomain(domain)}>
                      <Trash2 className="w-2.5 h-2.5 mr-1" /> Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* SECTION: Snapshots */}
      {activeSection === 'snapshots' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono text-zinc-500 uppercase">Snapshots ({snapshots.length})</h3>
            <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono border-white/10 gap-1"
              onClick={handleCreateSnapshot} disabled={loading === 'snapshot'}>
              <Save className="w-3 h-3" /> New Snapshot
            </Button>
          </div>
          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 font-mono text-xs">
              <Archive className="w-8 h-8 mx-auto mb-2 opacity-20" />
              No snapshots yet. Create one to backup your data.
            </div>
          ) : (
            <div className="space-y-2">
              {snapshots.map(snap => (
                <Card key={snap.id} className="bg-zinc-900/40 border-white/5">
                  <CardContent className="p-3 flex items-center gap-4">
                    <Archive className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-zinc-300">{snap.id}</div>
                      <div className="text-[10px] text-zinc-600 font-mono">
                        {new Date(snap.timestamp).toLocaleString()} | {snap.metadata.totalRecords} records | {Math.round(snap.metadata.sizeBytes / 1024)} KB
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[9px] font-mono text-cyan-400"
                        onClick={async () => {
                          await engine.restoreSnapshot(snap);
                          addLog('success', 'PERSIST', `Restored snapshot: ${snap.id}`);
                          refreshStats();
                        }}>
                        <Upload className="w-2.5 h-2.5 mr-1" /> Restore
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: Config */}
      {activeSection === 'config' && (
        <div className="space-y-4">
          <Card className="bg-zinc-900/40 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400">Sync Strategy</CardTitle>
              <CardDescription className="text-[11px]">How data is persisted between localStorage and NAS SQLite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {STRATEGY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleUpdateConfig({ strategy: opt.value })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                    config.strategy === opt.value
                      ? "bg-primary/5 border-primary/30 text-white"
                      : "border-white/5 text-zinc-400 hover:border-white/15"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                    config.strategy === opt.value ? "border-primary" : "border-zinc-600"
                  )}>
                    {config.strategy === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="text-xs font-mono">{opt.label}</div>
                    <div className="text-[10px] text-zinc-500">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400">Auto-Save</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">Auto-save interval</span>
                <select
                  value={config.autoSaveInterval}
                  onChange={(e) => handleUpdateConfig({ autoSaveInterval: parseInt(e.target.value) })}
                  className="h-7 bg-zinc-900 border border-white/10 rounded text-[11px] font-mono px-2 text-white"
                >
                  <option value="0">Disabled</option>
                  <option value="10000">10 seconds</option>
                  <option value="30000">30 seconds</option>
                  <option value="60000">1 minute</option>
                  <option value="300000">5 minutes</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">Snapshot interval</span>
                <select
                  value={config.snapshotInterval}
                  onChange={(e) => handleUpdateConfig({ snapshotInterval: parseInt(e.target.value) })}
                  className="h-7 bg-zinc-900 border border-white/10 rounded text-[11px] font-mono px-2 text-white"
                >
                  <option value="0">Disabled</option>
                  <option value="1800000">30 minutes</option>
                  <option value="3600000">1 hour</option>
                  <option value="21600000">6 hours</option>
                  <option value="86400000">24 hours</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">Max retries</span>
                <select
                  value={config.maxRetries}
                  onChange={(e) => handleUpdateConfig({ maxRetries: parseInt(e.target.value) })}
                  className="h-7 bg-zinc-900 border border-white/10 rounded text-[11px] font-mono px-2 text-white"
                >
                  <option value="1">1</option>
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
