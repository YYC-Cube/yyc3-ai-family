// ============================================================
// YYC3 AI Family — Unified Storage Dashboard
// Phase: 前端一�?化存�?架构
//
// 三层存�?统�??览仪表盘：
//   - L1 localStorage：小数据即时存�?
//   - L2 IndexedDB：大数据高容量
//   - L3 NAS SQLite：持久化远程同步
//
// 功能：
//   - 各层健康状�?指示器
//   - 容量使用情况环形图
//   - 同步状�?�?实时更新
//   - 手动触发同步/刷新
//   - 快照管理（导入/导出）
//   - 存储迁�?向导
// ============================================================

import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  Download,
  HardDrive,
  RefreshCw,
  Server,
  Trash2,
  Upload,
  Wifi, WifiOff,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { useIsSyncing, useStorage, useStorageCapacity } from '@/lib/storage/storage-context';
import { storageMigrationManager, type MigrationPlan, type MigrationProgress } from '@/lib/storage/storage-migration';
import { cn } from '@/lib/utils';
// ============================================================
// Tier Meta
// ============================================================

const TIER_META: Record<string, { label: string; icon: typeof Database; color: string; desc: string }> = {
  'L1-localStorage': { label: 'L1 localStorage', icon: HardDrive, color: 'text-amber-400', desc: '小数据即时存取，<5MB' },
  'L2-indexedDB': { label: 'L2 IndexedDB', icon: Database, color: 'text-cyan-400', desc: '大数据高容量，数百MB+' },
  'L3-nas': { label: 'L3 NAS SQLite', icon: Server, color: 'text-green-400', desc: '远程持久化，跨设备共享' },
};

// ============================================================
// Main Dashboard Component
// ============================================================

export function StorageDashboard() {
  const {
    orchestratorStats, engineStats,
    syncStatus, lastSyncTime, pendingChanges, isOnline,
    refresh, sync, exportSnapshot, importSnapshot, purgeAll,
  } = useStorage();
  const { usedMB, quotaMB, percent } = useStorageCapacity();
  const isSyncing = useIsSyncing();

  const offline = syncStatus === 'offline';

  function resolveStatusColor() {
    if (offline) return 'text-red-400';
    if (isSyncing) return 'text-amber-400';

    return 'text-green-400';
  }
  function resolveStatusIcon() {
    if (offline) return WifiOff;
    if (isSyncing) return RefreshCw;

    return CheckCircle2;
  }
  function resolveStatusLabel() {
    if (offline) return '离线';
    if (isSyncing) return '同步中';

    return '在线';
  }
  const statusColor = resolveStatusColor();
  const statusIcon = resolveStatusIcon();
  const statusLabel = resolveStatusLabel();
  const StatusIcon = statusIcon;

  const tiers = orchestratorStats?.tiers || [];

  const formatTime = (ts: number | null) => {
    if (!ts) return '从未';
    const diff = Date.now() - ts;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;

    return `${Math.floor(diff / 86400000)} 天前`;
  };

  const handleExport = async () => {
    const json = await exportSnapshot();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `yyc3-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (!file) return;
      const text = await file.text();

      await importSnapshot(text);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">存储中心</h2>
          <p className="text-xs text-zinc-500 mt-0.5">三层存储架构 · 全链路数据管�?</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn('gap-1', statusColor)}>
            <StatusIcon className="w-3 h-3" />
            {statusLabel}
          </Badge>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={refresh} disabled={isSyncing}>
            <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Sync Status Bar */}
      <Card className="bg-zinc-900/40 border-white/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <span className={cn(
                'flex items-center gap-1',
                isOnline ? 'text-green-400' : 'text-red-400',
              )}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? '在线' : '离线'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                上次同步: {formatTime(lastSyncTime)}
              </span>
              {pendingChanges > 0 && (
                <span className="text-amber-400">
                  待同步: {pendingChanges} 项
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={sync}
              disabled={!isOnline || isSyncing}
            >
              {isSyncing ? '同步中...' : '立即同步'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Storage Health — 3 Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['L1-localStorage', 'L2-indexedDB', 'L3-nas'] as const).map(tier => {
          const meta = TIER_META[tier];
          const health = tiers.find(t => t.tier === tier);
          const Icon = meta.icon;

          return (
            <Card key={tier} className={cn(
              'bg-zinc-900/40 border',
              health?.available ? 'border-white/10' : 'border-red-900/40',
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('w-4 h-4', meta.color)} />
                    <CardTitle className="text-xs font-semibold text-zinc-300">{meta.label}</CardTitle>
                  </div>
                  <Badge variant="outline" className={cn(
                    'text-[10px] px-1.5 py-0',
                    health?.available ? 'text-green-400 border-green-800/50' : 'text-red-400 border-red-800/50',
                  )}>
                    {health?.available ? '正常' : '不可用'}
                  </Badge>
                </div>
                <CardDescription className="text-[10px] mt-1">{meta.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 text-[11px] text-zinc-400">
                  <div className="flex justify-between">
                    <span>记录数</span>
                    <span className="text-zinc-300">{health?.recordCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>大小</span>
                    <span className="text-zinc-300">{health?.sizeKB ?? 0} KB</span>
                  </div>
                  {health && (
                    <div className="flex justify-between">
                      <span>延迟</span>
                      <span className={cn(
                        health.latencyMs < 50 && 'text-green-400',
                        health.latencyMs >= 50 && health.latencyMs < 200 && 'text-amber-400',
                        health.latencyMs >= 200 && 'text-red-400',
                      )}>{health.latencyMs}ms</span>
                    </div>
                  )}
                  {health?.lastError && (
                    <div className="text-[10px] text-red-400 truncate mt-1">
                      {health.lastError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Capacity Usage */}
      <Card className="bg-zinc-900/40 border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-400">容量使�?</CardTitle>
          <CardDescription className="text-[10px]">IndexedDB 存储配额使用情�?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={percent} className="h-2 bg-zinc-800" />
            </div>
            <div className="text-xs text-zinc-400 text-right whitespace-nowrap">
              <span className="text-zinc-300">{usedMB} MB</span> / {quotaMB} MB
              <span className={cn('ml-2', percent > 80 ? 'text-red-400' : 'text-zinc-500')}>
                ({percent}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Stats */}
      <Card className="bg-zinc-900/40 border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-400">数据域统计</CardTitle>
          <CardDescription className="text-[10px]">各存储域的数据记�?分布</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {engineStats?.domainCounts && Object.entries(engineStats.domainCounts).map(([domain, count]) => (
              <div key={domain} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-zinc-400 truncate">{domain}</span>
                <span className="text-[11px] text-zinc-300 ml-2">{count}</span>
              </div>
            ))}
          </div>
          {engineStats && (
            <div className="mt-3 flex items-center gap-4 text-[11px] text-zinc-500">
              <span>总记录: <strong className="text-zinc-300">{engineStats.totalRecords}</strong></span>
              <span>总大小: <strong className="text-zinc-300">{engineStats.totalSizeKB} KB</strong></span>
              <span>适配器: <strong className="text-zinc-300">{engineStats.adapter}</strong></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-zinc-900/40 border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-400">数据管理</CardTitle>
          <CardDescription className="text-[10px]">快照导出/导入、数据清空</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleExport}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              导出快照
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleImport}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              导入快照
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-red-400 hover:text-red-300" onClick={purgeAll}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              清空数据
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Migration Wizard Sub-component
// ============================================================

export function StorageMigrationWizard() {
  const [plan, setPlan] = useState<MigrationPlan | null>(null);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [checking, setChecking] = useState(false);

  const checkMigration = async () => {
    setChecking(true);
    try {
      const result = await storageMigrationManager.assess();

      setPlan(result);
    } finally {
      setChecking(false);
    }
  };

  const startMigration = async () => {
    if (!plan) return;
    const result = await storageMigrationManager.migrate(
      plan.from,
      plan.to,
      plan.domains,
      setProgress,
    );

    setProgress(result);
  };

  return (
    <Card className="bg-zinc-900/40 border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-purple-400" />
          存储迁移工具
        </CardTitle>
        <CardDescription className="text-[10px]">localStorage → IndexedDB 数据迁移</CardDescription>
      </CardHeader>
      <CardContent>
        {!plan && !progress && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={checkMigration}
            disabled={checking}
          >
            {checking ? '检查中...' : '检查迁移需求'}
          </Button>
        )}

        {plan && !progress && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-300 space-y-1">
              <p>检测到需要迁移:</p>
              <p className="text-zinc-400">{plan.domains.length} 个数据域, {plan.estimatedRecords} 条记录, {plan.estimatedSizeKB} KB</p>
              <p className="text-zinc-500 text-[10px]">{plan.from} → {plan.to}</p>
            </div>
            <Button size="sm" className="h-8 text-xs" onClick={startMigration}>
              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
              开始迁移
            </Button>
          </div>
        )}

        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(
                'text-xs',
                progress.status === 'completed' && 'text-green-400',
                progress.status === 'failed' && 'text-red-400',
                progress.status === 'running' && 'text-amber-400',
                progress.status === 'paused' && 'text-zinc-400',
                !progress.status && 'text-zinc-400',
              )}>
                {progress.status === 'running' && '迁移中...'}
                {progress.status === 'completed' && '迁移完成'}
                {progress.status === 'failed' && '迁移失败'}
                {progress.status === 'paused' && '已暂停'}
              </span>
              <span className="text-[10px] text-zinc-500">
                {progress.domainsCompleted}/{progress.domainsTotal} 域
              </span>
            </div>
            <Progress
              value={progress.domainsTotal > 0 ? (progress.domainsCompleted / progress.domainsTotal) * 100 : 0}
              className="h-1.5 bg-zinc-800"
            />
            {progress.error && (
              <p className="text-[10px] text-red-400">{progress.error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
