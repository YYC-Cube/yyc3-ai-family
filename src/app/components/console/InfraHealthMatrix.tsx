import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useInfraHealth, setLastInfraReport, recordLatency, getAllLatencyHistories } from "@/lib/useInfraHealth";
import type { InfraCheck, InfraStatus, LatencyHistoryEntry } from "@/lib/useInfraHealth";
import {
  Server, Box, Database, Cpu, Wifi, WifiOff,
  RefreshCw, Loader2, CheckCircle2, XCircle,
  AlertTriangle, HelpCircle, Clock, Activity,
  Shield, HardDrive, Radio, Zap, Network,
  MemoryStick, Globe, Key, BarChart3, TrendingUp,
  ChevronDown, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { SafeChartContainer } from "@/app/components/ui/safe-chart-container";

// ============================================================
// Phase 41: Latency Trend Chart (Recharts)
// ============================================================

interface LatencyChartPoint {
  time: string;
  timestamp: number;
  [checkId: string]: string | number;
}

const SERVICE_COLORS: Record<string, string> = {
  'svc-docker': '#06b6d4',
  'svc-sqlite': '#22c55e',
  'svc-ollama': '#f59e0b',
  'svc-pg15': '#8b5cf6',
  'svc-telemetry': '#ec4899',
};

const SERVICE_LABELS: Record<string, string> = {
  'svc-docker': 'Docker',
  'svc-sqlite': 'SQLite',
  'svc-ollama': 'Ollama',
  'svc-pg15': 'PG15',
  'svc-telemetry': 'Telemetry',
};

interface TrendTooltipPayload {
  name: string;
  value: number;
  color: string;
}

function LatencyTrendTooltip({ active, payload, label }: { active?: boolean; payload?: TrendTooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900/95 border border-white/10 rounded-lg p-2 shadow-xl backdrop-blur-sm">
      <p className="text-[9px] text-zinc-500 font-mono mb-1">{label}</p>
      {payload.map((entry: TrendTooltipPayload) => (
        <div key={entry.name} className="flex items-center gap-1.5 text-[9px]">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-400 font-mono">{SERVICE_LABELS[entry.name] || entry.name}:</span>
          <span className="font-mono" style={{ color: entry.color }}>{entry.value}ms</span>
        </div>
      ))}
    </div>
  );
}

function LatencyTrendChart({ histories }: { histories: Record<string, LatencyHistoryEntry[]> }) {
  const { language } = useTranslation();
  const zh = language === 'zh';

  const serviceIds = Object.keys(SERVICE_COLORS).filter(id => histories[id]?.length > 1);

  if (serviceIds.length === 0) {
    return (
      <div className="text-center text-[9px] font-mono text-zinc-700 py-6">
        {zh ? '需要至少 2 次健康检查扫描才能生成趋势图' : 'Run health checks 2+ times to generate trends'}
      </div>
    );
  }

  // Build unified time series
  const allTimestamps = new Set<number>();
  serviceIds.forEach(id => {
    histories[id]?.forEach(e => allTimestamps.add(e.timestamp));
  });
  const sortedTs = Array.from(allTimestamps).sort((a, b) => a - b);

  const chartData: LatencyChartPoint[] = sortedTs.map(ts => {
    const point: LatencyChartPoint = {
      time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: ts,
    };
    serviceIds.forEach(id => {
      const entry = histories[id]?.find(e => e.timestamp === ts);
      if (entry) {
        point[id] = entry.latencyMs;
      }
    });
    return point;
  });

  // Compute stats
  const stats = serviceIds.map(id => {
    const entries = histories[id] || [];
    const values = entries.map(e => e.latencyMs);
    const avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const current = values.length > 0 ? values[values.length - 1] : 0;
    const trend = values.length >= 2 ? values[values.length - 1] - values[values.length - 2] : 0;
    return { id, label: SERVICE_LABELS[id], avg, max, current, trend, color: SERVICE_COLORS[id] };
  });

  return (
    <div className="space-y-2">
      {/* Stats Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {stats.map(s => (
          <div key={s.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/30 border border-zinc-800/50">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[8px] font-mono text-zinc-400">{s.label}</span>
            <span className="text-[8px] font-mono" style={{ color: s.color }}>{s.current}ms</span>
            {s.trend !== 0 && (
              <span className={cn("text-[7px] font-mono", s.trend > 0 ? "text-red-400" : "text-emerald-400")}>
                {s.trend > 0 ? '↑' : '↓'}{Math.abs(s.trend)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[140px] w-full min-h-0">
        <SafeChartContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              {serviceIds.map(id => (
                <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SERVICE_COLORS[id]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={SERVICE_COLORS[id]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 8, fill: '#52525b', fontFamily: 'ui-monospace' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 8, fill: '#52525b', fontFamily: 'ui-monospace' }}
              axisLine={false}
              tickLine={false}
              unit="ms"
            />
            <Tooltip content={<LatencyTrendTooltip />} />
            {serviceIds.map(id => (
              <Area
                key={id}
                type="monotone"
                dataKey={id}
                stroke={SERVICE_COLORS[id]}
                fill={`url(#grad-${id})`}
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
            ))}
          </AreaChart>
        </SafeChartContainer>
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

// --- SummaryBar: Overall scan summary ---
function SummaryBar({ summary, totalMs }: { summary: { total: number; online: number; degraded: number; offline: number; unknown: number }; totalMs?: number }) {
  const { language } = useTranslation();
  const zh = language === 'zh';
  return (
    <div className="flex items-center gap-2 flex-wrap text-[9px] font-mono px-1">
      <div className="flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        <span className="text-emerald-400">{summary.online}</span>
        <span className="text-zinc-600">{zh ? '在线' : 'online'}</span>
      </div>
      {summary.degraded > 0 && (
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span className="text-amber-400">{summary.degraded}</span>
          <span className="text-zinc-600">{zh ? '降级' : 'degraded'}</span>
        </div>
      )}
      {summary.offline > 0 && (
        <div className="flex items-center gap-1">
          <XCircle className="w-3 h-3 text-red-500" />
          <span className="text-red-400">{summary.offline}</span>
          <span className="text-zinc-600">{zh ? '离线' : 'offline'}</span>
        </div>
      )}
      {totalMs !== undefined && (
        <span className="text-zinc-600 ml-auto">
          <Clock className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
          {totalMs}ms
        </span>
      )}
    </div>
  );
}

// --- HealthCheckRow: Individual check row ---
function HealthCheckRow({ check, onRecheck }: { check: InfraCheck; onRecheck?: (id: string) => void }) {
  const { language } = useTranslation();
  const zh = language === 'zh';

  const statusIcon = {
    online: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
    degraded: <AlertTriangle className="w-3 h-3 text-amber-500" />,
    offline: <XCircle className="w-3 h-3 text-red-500" />,
    checking: <Loader2 className="w-3 h-3 text-sky-400 animate-spin" />,
    unknown: <HelpCircle className="w-3 h-3 text-zinc-600" />,
  };

  const statusColor = {
    online: 'text-emerald-400',
    degraded: 'text-amber-400',
    offline: 'text-red-400',
    checking: 'text-sky-400',
    unknown: 'text-zinc-600',
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.02] transition-colors group">
      {statusIcon[check.status]}
      <span className={cn("text-[10px] font-mono flex-1 truncate", statusColor[check.status])}>
        {zh ? check.nameZh : check.name}
      </span>
      {check.latencyMs !== undefined && (
        <span className="text-[8px] font-mono text-zinc-600">
          {check.latencyMs}ms
        </span>
      )}
      {check.detail && (
        <span className="text-[8px] font-mono text-zinc-700 max-w-[120px] truncate" title={check.detail}>
          {check.detail}
        </span>
      )}
      {onRecheck && (
        <button
          onClick={() => onRecheck(check.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-zinc-600 hover:text-zinc-300"
          title={zh ? '重新检查' : 'Recheck'}
        >
          <RefreshCw className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

export function InfraHealthMatrix() {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const { checks, status, summary, totalMs, runHealthCheck, recheckSingle, ...report } = useInfraHealth();

  // Phase 41: Trend chart visibility toggle
  const [showTrends, setShowTrends] = React.useState(false);

  // Persist report for cross-module access
  React.useEffect(() => {
    setLastInfraReport({ checks, status, summary, startedAt: report.startedAt, completedAt: report.completedAt, totalMs });
  }, [checks, status, summary, totalMs, report.startedAt, report.completedAt]);

  // Auto-run on mount
  React.useEffect(() => {
    const timer = setTimeout(() => runHealthCheck(), 600);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Group by category
  const grouped = React.useMemo(() => {
    const groups: Record<string, InfraCheck[]> = {};
    for (const c of checks) {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    }
    return groups;
  }, [checks]);

  const categoryLabels: Record<string, { zh: string; en: string; icon: React.ComponentType<{ className?: string }> }> = {
    device: { zh: '集群节点', en: 'Cluster Nodes', icon: Server },
    service: { zh: '基础服务', en: 'Infrastructure Services', icon: Network },
    runtime: { zh: '运行时环境', en: 'Runtime Environment', icon: Zap },
    provider: { zh: 'LLM 配置', en: 'LLM Configuration', icon: Key },
  };

  const overallStatus = summary.offline > 2 ? 'critical' :
    summary.offline > 0 || summary.degraded > 1 ? 'warning' :
    summary.online === summary.total ? 'optimal' : 'checking';

  const overallColors: Record<string, string> = {
    critical: 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.08)]',
    warning: 'border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.06)]',
    optimal: 'border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.06)]',
    checking: 'border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.06)]',
  };

  return (
    <Card className={cn("bg-zinc-900/30 transition-all duration-500", overallColors[overallStatus] || "border-zinc-800/50")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          {zh ? '基础设施健康矩阵' : 'Infrastructure Health Matrix'}
          <Badge variant="outline" className={cn(
            "text-[8px] font-mono ml-auto",
            overallStatus === 'optimal' ? "text-emerald-400 border-emerald-500/20" :
            overallStatus === 'warning' ? "text-amber-400 border-amber-500/20" :
            overallStatus === 'critical' ? "text-red-400 border-red-500/20" :
            "text-sky-400 border-sky-500/20"
          )}>
            {summary.online}/{summary.total} {zh ? '在线' : 'Online'}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={runHealthCheck}
            disabled={status === 'running'}
            title={zh ? '全量重新检查' : 'Run full health check'}
          >
            {status === 'running'
              ? <Loader2 className="w-3 h-3 text-sky-400 animate-spin" />
              : <RefreshCw className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
            }
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary bar */}
        {status !== 'idle' && <SummaryBar summary={summary} totalMs={totalMs} />}

        {/* Grouped checks */}
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {(['device', 'service', 'runtime', 'provider'] as const).map(cat => {
              const items = grouped[cat];
              if (!items) return null;
              const meta = categoryLabels[cat];
              const CatIcon = meta.icon;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CatIcon className="w-3 h-3 text-zinc-500" />
                    <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                      {zh ? meta.zh : meta.en}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-700 ml-auto">
                      {items.filter(c => c.status === 'online').length}/{items.length}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {items.map(check => (
                      <HealthCheckRow key={check.id} check={check} onRecheck={recheckSingle} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Latency Trend Chart */}
        {showTrends && <LatencyTrendChart histories={getAllLatencyHistories()} />}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => setShowTrends(!showTrends)}
          title={zh ? '切换趋势图' : 'Toggle trends'}
        >
          {showTrends
            ? <ChevronDown className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
            : <ChevronRight className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
          }
        </Button>
      </CardContent>
    </Card>
  );
}