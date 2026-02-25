/**
 * @file YYC³ Family-π³ Agent Latency Dashboard
 * @description Agent推理延迟监控面板 - P50/P95延迟基线
 * @author YYC³ Team
 * @version 1.0.0
 *
 * 功能:
 * - 展示7个Agent的推理延迟统计
 * - P50/P95延迟基线
 * - 节点分配建议
 * - 超时阈值警告
 */

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Gauge,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export interface AgentLatencyMetric {
  agentId: string;
  agentName: string;
  node: 'M4 Max' | 'iMac M4';
  model: string;
  p50: number;
  p95: number;
  max: number;
  samples: number;
  lastUpdated: number;
  status: 'optimal' | 'warning' | 'critical';
}

export interface LatencyThresholds {
  optimal: number;
  warning: number;
  critical: number;
}

// ============================================================
// Default Metrics (based on NAS审计报告)
// ============================================================

export const DEFAULT_AGENT_LATENCY: AgentLatencyMetric[] = [
  {
    agentId: 'navigator',
    agentName: '智愈·领航员',
    node: 'M4 Max',
    model: 'qwen2.5:7b',
    p50: 2850,
    p95: 3200,
    max: 3500,
    samples: 156,
    lastUpdated: Date.now(),
    status: 'optimal',
  },
  {
    agentId: 'thinker',
    agentName: '洞见·思想家',
    node: 'M4 Max',
    model: 'qwen2.5:7b',
    p50: 2920,
    p95: 3400,
    max: 3800,
    samples: 89,
    lastUpdated: Date.now(),
    status: 'optimal',
  },
  {
    agentId: 'prophet',
    agentName: '预见·先知',
    node: 'M4 Max',
    model: 'qwen2.5:7b',
    p50: 3100,
    p95: 3500,
    max: 4000,
    samples: 67,
    lastUpdated: Date.now(),
    status: 'optimal',
  },
  {
    agentId: 'bole',
    agentName: '知遇·伯乐',
    node: 'iMac M4',
    model: 'codegeex4:latest',
    p50: 12500,
    p95: 14200,
    max: 15100,
    samples: 45,
    lastUpdated: Date.now(),
    status: 'warning',
  },
  {
    agentId: 'pivot',
    agentName: '元启·天枢',
    node: 'iMac M4',
    model: 'glm4:9b',
    p50: 10200,
    p95: 11800,
    max: 12500,
    samples: 78,
    lastUpdated: Date.now(),
    status: 'warning',
  },
  {
    agentId: 'sentinel',
    agentName: '卫安·哨兵',
    node: 'iMac M4',
    model: 'phi3:mini',
    p50: 9200,
    p95: 10500,
    max: 11200,
    samples: 134,
    lastUpdated: Date.now(),
    status: 'warning',
  },
  {
    agentId: 'grandmaster',
    agentName: '格物·宗师',
    node: 'iMac M4',
    model: 'glm4:9b',
    p50: 10800,
    p95: 12200,
    max: 13000,
    samples: 56,
    lastUpdated: Date.now(),
    status: 'warning',
  },
];

export const LATENCY_THRESHOLDS: Record<'M4 Max' | 'iMac M4', LatencyThresholds> = {
  'M4 Max': { optimal: 3000, warning: 5000, critical: 8000 },
  'iMac M4': { optimal: 8000, warning: 12000, critical: 15000 },
};

// ============================================================
// Helpers
// ============================================================

function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }

  return `${ms}ms`;
}

function getLatencyColor(ms: number, node: 'M4 Max' | 'iMac M4'): string {
  const thresholds = LATENCY_THRESHOLDS[node];

  if (ms <= thresholds.optimal) return 'text-green-500';
  if (ms <= thresholds.warning) return 'text-amber-500';

  return 'text-red-500';
}

function getStatusIcon(status: 'optimal' | 'warning' | 'critical') {
  switch (status) {
    case 'optimal':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
  }
}

// ============================================================
// Agent Latency Card
// ============================================================

function AgentLatencyCard({ metric }: { metric: AgentLatencyMetric }) {
  const thresholds = LATENCY_THRESHOLDS[metric.node];
  const progressValue = Math.min(100, (metric.p95 / thresholds.critical) * 100);

  return (
    <div className="border border-white/5 rounded-lg bg-zinc-900/30 p-3 hover:bg-zinc-900/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(metric.status)}
          <span className="text-sm font-medium text-white">{metric.agentName}</span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-[9px] font-mono',
            metric.node === 'M4 Max'
              ? 'border-amber-500/30 text-amber-400'
              : 'border-blue-500/30 text-blue-400',
          )}
        >
          {metric.node}
        </Badge>
      </div>

      <div className="text-[10px] font-mono text-zinc-500 mb-2">{metric.model}</div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider">P50</div>
          <div className={cn('text-lg font-mono', getLatencyColor(metric.p50, metric.node))}>
            {formatLatency(metric.p50)}
          </div>
        </div>
        <div>
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider">P95</div>
          <div className={cn('text-lg font-mono', getLatencyColor(metric.p95, metric.node))}>
            {formatLatency(metric.p95)}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={progressValue} className="h-1.5" />
        <div className="flex justify-between text-[9px] font-mono text-zinc-500">
          <span>0</span>
          <span>阈值: {formatLatency(thresholds.critical)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div className="text-[9px] text-zinc-500">
          样本: <span className="text-zinc-400">{metric.samples}</span>
        </div>
        <div className="text-[9px] text-zinc-500">
          MAX: <span className={cn('font-mono', getLatencyColor(metric.max, metric.node))}>
            {formatLatency(metric.max)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function AgentLatencyDashboard() {
  const [metrics] = React.useState<AgentLatencyMetric[]>(DEFAULT_AGENT_LATENCY);
  const [sortBy, setSortBy] = React.useState<'p50' | 'p95' | 'name'>('p95');

  const sortedMetrics = React.useMemo(() => {
    const sorted = [...metrics];

    if (sortBy === 'p50') {
      sorted.sort((a, b) => a.p50 - b.p50);
    } else if (sortBy === 'p95') {
      sorted.sort((a, b) => a.p95 - b.p95);
    } else {
      sorted.sort((a, b) => a.agentName.localeCompare(b.agentName));
    }

    return sorted;
  }, [metrics, sortBy]);

  const m4MaxAgents = sortedMetrics.filter(m => m.node === 'M4 Max');
  const imacAgents = sortedMetrics.filter(m => m.node === 'iMac M4');

  const avgP50 = Math.round(metrics.reduce((sum, m) => sum + m.p50, 0) / metrics.length);
  const avgP95 = Math.round(metrics.reduce((sum, m) => sum + m.p95, 0) / metrics.length);

  const optimalCount = metrics.filter(m => m.status === 'optimal').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const criticalCount = metrics.filter(m => m.status === 'critical').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Gauge className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg text-white tracking-tight">Agent 推理延迟监控</h3>
            <p className="text-xs font-mono text-zinc-500">P50/P95 延迟基线</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'p50' | 'p95' | 'name')}
            className="h-7 px-2 text-[10px] font-mono bg-zinc-900 border border-white/10 rounded text-zinc-400"
          >
            <option value="p95">按 P95 排序</option>
            <option value="p50">按 P50 排序</option>
            <option value="name">按名称排序</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="border border-white/5 rounded-lg bg-zinc-900/30 p-3">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">平均 P50</div>
          <div className="text-xl font-mono text-white">{formatLatency(avgP50)}</div>
        </div>
        <div className="border border-white/5 rounded-lg bg-zinc-900/30 p-3">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">平均 P95</div>
          <div className="text-xl font-mono text-white">{formatLatency(avgP95)}</div>
        </div>
        <div className="border border-white/5 rounded-lg bg-zinc-900/30 p-3">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">状态分布</div>
          <div className="flex items-center gap-2">
            <span className="text-green-500 font-mono">{optimalCount}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-amber-500 font-mono">{warningCount}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-red-500 font-mono">{criticalCount}</span>
          </div>
        </div>
        <div className="border border-white/5 rounded-lg bg-zinc-900/30 p-3">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">总样本</div>
          <div className="text-xl font-mono text-white">
            {metrics.reduce((sum, m) => sum + m.samples, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* M4 Max Agents */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-zinc-300">M4 Max 节点</span>
          <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-400">
            延迟敏感
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {m4MaxAgents.map(metric => (
            <AgentLatencyCard key={metric.agentId} metric={metric} />
          ))}
        </div>
      </div>

      {/* iMac M4 Agents */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-zinc-300">iMac M4 节点</span>
          <Badge variant="outline" className="text-[9px] font-mono border-blue-500/30 text-blue-400">
            超时阈值 15s
          </Badge>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {imacAgents.map(metric => (
            <AgentLatencyCard key={metric.agentId} metric={metric} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="border border-amber-500/20 rounded-lg bg-amber-500/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-400">优化建议</span>
        </div>
        <ul className="space-y-1 text-xs text-zinc-400">
          <li className="flex items-start gap-2">
            <TrendingDown className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
            <span>Navigator、Prophet 已锁定在 M4 Max，延迟最优</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
            <span>iMac M4 上 Agent P95 接近 15s 超时阈值，建议切换到量化模型</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
            <span>Bole 可尝试 codegeex4:Q4_K_M 量化版，预计延迟降至 ~8s</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AgentLatencyDashboard;
