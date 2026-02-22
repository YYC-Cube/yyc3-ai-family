// ============================================================
// YYC3 Hacker Chatbot — Metrics History Dashboard
// Phase 22: Historical metrics visualization from archived snapshots
//
// Data source: persistence-engine → metrics_snapshots domain
// Visualization: Recharts line/area charts
// Features:
//   - Multi-node overlay (M4 Max, iMac, MateBook, NAS)
//   - CPU / Memory / Disk / Network / Temperature
//   - Time range selector (last 30m / 1h / 6h / all)
//   - Auto-refresh from live archive
//   - Export archived data
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3, Cpu, HardDrive, Wifi, Thermometer,
  Clock, RefreshCw, Loader2, Download, Layers,
  Monitor, Database as DbIcon, TrendingUp,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { getMetricsArchive, type MetricsArchiveEntry } from "@/lib/persistence-binding";

// ============================================================
// Types
// ============================================================

type MetricKey = 'cpu' | 'memory' | 'disk' | 'network' | 'temperature';
type TimeRange = '30m' | '1h' | '6h' | 'all';
type NodeId = 'm4-max' | 'imac-m4' | 'matebook' | 'yanyucloud';

interface ChartDataPoint {
  time: string;
  timestamp: number;
  'm4-max': number;
  'imac-m4': number;
  'matebook': number;
  'yanyucloud': number;
}

const NODE_META: Record<NodeId, { label: string; color: string; strokeColor: string }> = {
  'm4-max':     { label: 'M4 Max',    color: '#f59e0b', strokeColor: '#f59e0b' },
  'imac-m4':    { label: 'iMac M4',   color: '#3b82f6', strokeColor: '#3b82f6' },
  'matebook':   { label: 'MateBook',  color: '#22c55e', strokeColor: '#22c55e' },
  'yanyucloud': { label: 'NAS F4',    color: '#06b6d4', strokeColor: '#06b6d4' },
};

const METRIC_META: Record<MetricKey, { label: string; icon: React.ComponentType<{ className?: string }>; unit: string; max: number }> = {
  cpu:         { label: 'CPU Usage',     icon: Cpu,          unit: '%',  max: 100 },
  memory:      { label: 'Memory Usage',  icon: Monitor,      unit: '%',  max: 100 },
  disk:        { label: 'Disk Usage',    icon: HardDrive,    unit: '%',  max: 100 },
  network:     { label: 'Network I/O',   icon: Wifi,         unit: 'Mbps', max: 1000 },
  temperature: { label: 'Temperature',   icon: Thermometer,  unit: '°C', max: 100 },
};

const TIME_RANGES: { id: TimeRange; label: string; ms: number }[] = [
  { id: '30m', label: '30 min', ms: 30 * 60 * 1000 },
  { id: '1h',  label: '1 hour', ms: 60 * 60 * 1000 },
  { id: '6h',  label: '6 hours', ms: 6 * 60 * 60 * 1000 },
  { id: 'all', label: 'All', ms: Infinity },
];

// ============================================================
// Data Processing
// ============================================================

function processArchive(
  archive: MetricsArchiveEntry[],
  metricKey: MetricKey,
  timeRange: TimeRange,
): ChartDataPoint[] {
  const now = Date.now();
  const rangeDef = TIME_RANGES.find(r => r.id === timeRange) || TIME_RANGES[3];
  const cutoff = rangeDef.ms === Infinity ? 0 : now - rangeDef.ms;

  return archive
    .filter(entry => {
      const ts = new Date(entry.timestamp).getTime();
      return ts >= cutoff;
    })
    .map(entry => {
      const ts = new Date(entry.timestamp).getTime();
      return {
        time: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: ts,
        'm4-max': Math.round((entry.data['m4-max']?.[metricKey] ?? 0) * 10) / 10,
        'imac-m4': Math.round((entry.data['imac-m4']?.[metricKey] ?? 0) * 10) / 10,
        'matebook': Math.round((entry.data['matebook']?.[metricKey] ?? 0) * 10) / 10,
        'yanyucloud': Math.round((entry.data['yanyucloud']?.[metricKey] ?? 0) * 10) / 10,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

function computeStats(data: ChartDataPoint[], nodeId: NodeId): { avg: number; max: number; min: number; current: number } {
  if (data.length === 0) return { avg: 0, max: 0, min: 0, current: 0 };
  const values = data.map(d => d[nodeId]);
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    avg: Math.round((sum / values.length) * 10) / 10,
    max: Math.round(Math.max(...values) * 10) / 10,
    min: Math.round(Math.min(...values) * 10) / 10,
    current: values[values.length - 1] || 0,
  };
}

// ============================================================
// Custom Tooltip
// ============================================================

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900/95 border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-sm">
      <p className="text-[10px] text-zinc-400 font-mono mb-2">{label}</p>
      {payload.map((entry: TooltipPayloadEntry) => (
        <div key={entry.name} className="flex items-center gap-2 text-[10px]">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-300 font-mono">
            {NODE_META[entry.name as NodeId]?.label || entry.name}:
          </span>
          <span className="font-mono" style={{ color: entry.color }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function MetricsHistoryDashboard() {
  const [archive, setArchive] = React.useState<MetricsArchiveEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeMetric, setActiveMetric] = React.useState<MetricKey>('cpu');
  const [timeRange, setTimeRange] = React.useState<TimeRange>('all');
  const [enabledNodes, setEnabledNodes] = React.useState<Set<NodeId>>(
    new Set(['m4-max', 'imac-m4', 'matebook', 'yanyucloud'])
  );
  const [chartType, setChartType] = React.useState<'line' | 'area'>('area');

  // Load archive data
  const loadArchive = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMetricsArchive();
      setArchive(data);
    } catch {
      setArchive([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadArchive(); }, [loadArchive]);

  // Auto-refresh every 30s
  React.useEffect(() => {
    const interval = setInterval(loadArchive, 30000);
    return () => clearInterval(interval);
  }, [loadArchive]);

  // Process chart data
  const chartData = React.useMemo(
    () => processArchive(archive, activeMetric, timeRange),
    [archive, activeMetric, timeRange]
  );

  // Toggle node
  const toggleNode = (nodeId: NodeId) => {
    setEnabledNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        if (next.size > 1) next.delete(nodeId); // Keep at least 1
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Export data
  const exportData = () => {
    const json = JSON.stringify({
      exportedAt: new Date().toISOString(),
      metric: activeMetric,
      timeRange,
      dataPoints: chartData.length,
      data: chartData,
    }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yyc3-metrics-${activeMetric}-${timeRange}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const metricMeta = METRIC_META[activeMetric];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Metrics History Dashboard
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Historical cluster metrics from archived snapshots ({archive.length} data points)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan-500/20 text-cyan-400 bg-cyan-500/5 text-[10px]">
            <TrendingUp className="w-3 h-3 mr-1" />
            Phase 22
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-zinc-400"
            onClick={loadArchive}
            disabled={loading}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Metric Selector */}
        <div className="flex items-center gap-1 bg-black/30 rounded-lg border border-white/5 p-1">
          {(Object.keys(METRIC_META) as MetricKey[]).map(key => {
            const meta = METRIC_META[key];
            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono transition-all",
                  activeMetric === key
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <meta.icon className="w-3 h-3" />
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-1 bg-black/30 rounded-lg border border-white/5 p-1">
          <Clock className="w-3 h-3 text-zinc-600 mx-1" />
          {TIME_RANGES.map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-mono transition-all",
                timeRange === range.id
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-1 bg-black/30 rounded-lg border border-white/5 p-1">
          <button
            onClick={() => setChartType('area')}
            className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-mono transition-all",
              chartType === 'area' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-mono transition-all",
              chartType === 'line' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Line
          </button>
        </div>

        {/* Node Toggle */}
        <div className="flex items-center gap-1">
          {(Object.keys(NODE_META) as NodeId[]).map(nodeId => {
            const meta = NODE_META[nodeId];
            const active = enabledNodes.has(nodeId);
            return (
              <button
                key={nodeId}
                onClick={() => toggleNode(nodeId)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[9px] font-mono border transition-all",
                  active
                    ? "border-opacity-30 bg-opacity-10"
                    : "border-white/5 text-zinc-600 bg-transparent"
                )}
                style={{
                  borderColor: active ? meta.color : undefined,
                  backgroundColor: active ? `${meta.color}15` : undefined,
                  color: active ? meta.color : undefined,
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Export */}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[10px] text-zinc-400 hover:text-white ml-auto"
          onClick={exportData}
          disabled={chartData.length === 0}
        >
          <Download className="w-3 h-3 mr-1" />
          Export
        </Button>
      </div>

      {/* Main Chart */}
      <Card className="bg-zinc-900/40 border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <metricMeta.icon className="w-4 h-4 text-cyan-400" />
            {metricMeta.label} Over Time
            <span className="text-zinc-500 text-[10px] font-mono">({metricMeta.unit})</span>
          </CardTitle>
          <CardDescription className="text-[10px] font-mono">
            {chartData.length} data points |
            Range: {timeRange === 'all' ? 'All available' : TIME_RANGES.find(r => r.id === timeRange)?.label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[300px] text-cyan-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-mono text-xs">Loading metrics archive...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-zinc-600">
              <Layers className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No metrics data archived yet</p>
              <p className="text-[10px] mt-1">Metrics snapshots are archived every 30 seconds while the dashboard is active</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    {(Object.keys(NODE_META) as NodeId[]).map(nodeId => (
                      <linearGradient key={nodeId} id={`grad-${nodeId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={NODE_META[nodeId].color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={NODE_META[nodeId].color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#71717a', fontSize: 9 }}
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff08' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 9 }}
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff08' }}
                    domain={[0, activeMetric === 'network' ? 'auto' : metricMeta.max]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                    formatter={(value: string) => NODE_META[value as NodeId]?.label || value}
                  />
                  {(Object.keys(NODE_META) as NodeId[]).map(nodeId => (
                    enabledNodes.has(nodeId) && (
                      <Area
                        key={nodeId}
                        type="monotone"
                        dataKey={nodeId}
                        stroke={NODE_META[nodeId].strokeColor}
                        fill={`url(#grad-${nodeId})`}
                        strokeWidth={1.5}
                        dot={false}
                        animationDuration={500}
                      />
                    )
                  ))}
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#71717a', fontSize: 9 }}
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff08' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 9 }}
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff08' }}
                    domain={[0, activeMetric === 'network' ? 'auto' : metricMeta.max]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                    formatter={(value: string) => NODE_META[value as NodeId]?.label || value}
                  />
                  {(Object.keys(NODE_META) as NodeId[]).map(nodeId => (
                    enabledNodes.has(nodeId) && (
                      <Line
                        key={nodeId}
                        type="monotone"
                        dataKey={nodeId}
                        stroke={NODE_META[nodeId].strokeColor}
                        strokeWidth={1.5}
                        dot={false}
                        animationDuration={500}
                      />
                    )
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(NODE_META) as NodeId[]).filter(n => enabledNodes.has(n)).map(nodeId => {
            const meta = NODE_META[nodeId];
            const stats = computeStats(chartData, nodeId);
            return (
              <Card key={nodeId} className="bg-zinc-900/40 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="text-xs font-mono" style={{ color: meta.color }}>{meta.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { label: 'Current', value: stats.current },
                      { label: 'Average', value: stats.avg },
                      { label: 'Peak', value: stats.max },
                      { label: 'Min', value: stats.min },
                    ] as const).map(stat => (
                      <div key={stat.label} className="text-center">
                        <div className="text-[9px] text-zinc-500 font-mono">{stat.label}</div>
                        <div className="text-sm font-mono text-white">
                          {stat.value}
                          <span className="text-[8px] text-zinc-500 ml-0.5">{metricMeta.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Archive Info */}
      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 px-1">
        <span>
          <DbIcon className="w-3 h-3 inline mr-1" />
          Archive: {archive.length} snapshots (30s interval, rolling 100)
        </span>
        <span>
          {archive.length > 0 && (
            <>
              First: {new Date(archive[0]?.timestamp).toLocaleString()} |
              Latest: {new Date(archive[archive.length - 1]?.timestamp).toLocaleString()}
            </>
          )}
        </span>
      </div>
    </div>
  );
}