// ============================================================
// YYC3 Hacker Chatbot — Token Usage Analytics Dashboard
// Phase 14.4: Data Dimension (D2) — Recharts Visualization
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Area, AreaChart,
} from "recharts";
import {
  Coins, Zap, Clock, TrendingUp, Activity, RefreshCw,
  ShieldCheck, ShieldAlert, ShieldOff, BarChart3, Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  getUsageSummary,
  type UsageRecord,
} from "@/lib/llm-bridge";
import { PROVIDERS } from "@/lib/llm-providers";
import { getRouter, type ProviderHealthScore, type RouterSummary } from "@/lib/llm-router";

// ============================================================
// Data Helpers
// ============================================================

const USAGE_STORAGE_KEY = 'yyc3-llm-usage';

function loadUsageRecords(): UsageRecord[] {
  try {
    return JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY) || '[]');
  } catch { return []; }
}

// Agent colors
const AGENT_COLORS: Record<string, string> = {
  navigator: '#f59e0b',
  thinker: '#3b82f6',
  prophet: '#a855f7',
  bole: '#ec4899',
  pivot: '#06b6d4',
  sentinel: '#ef4444',
  grandmaster: '#22c55e',
};

const AGENT_NAMES: Record<string, string> = {
  navigator: '领航员',
  thinker: '思想家',
  prophet: '先知',
  bole: '伯乐',
  pivot: '天枢',
  sentinel: '哨兵',
  grandmaster: '宗师',
};

// Provider colors
const PROVIDER_COLORS: Record<string, string> = {
  openai: '#10b981',
  anthropic: '#fb923c',
  deepseek: '#60a5fa',
  zhipu: '#a78bfa',
  google: '#38bdf8',
  groq: '#f472b6',
  ollama: '#e4e4e7',
  lmstudio: '#fbbf24',
};

// Circuit breaker state colors/icons
function CircuitIcon({ state }: { state: string }) {
  if (state === 'CLOSED') return <ShieldCheck className="w-3.5 h-3.5 text-green-500" />;
  if (state === 'HALF_OPEN') return <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />;
  return <ShieldOff className="w-3.5 h-3.5 text-red-500" />;
}

// ============================================================
// Custom Recharts Tooltip
// ============================================================

function CyberTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900/95 border border-white/10 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-[10px] font-mono text-zinc-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[11px] font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-300">{entry.name}:</span>
          <span className="text-white">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ============================================================
// Stat Card
// ============================================================

function StatCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  color: string;
  trend?: 'up' | 'down' | 'flat';
}) {
  return (
    <Card className="bg-black/40 border-white/8">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg bg-opacity-10", color.replace('text-', 'bg-').replace('500', '500/10'))}>
            <Icon className={cn("w-4 h-4", color)} />
          </div>
          {trend && (
            <TrendingUp className={cn("w-3.5 h-3.5",
              trend === 'up' ? 'text-green-500' :
              trend === 'down' ? 'text-red-500 rotate-180' :
              'text-zinc-500 rotate-90'
            )} />
          )}
        </div>
        <div className="mt-3">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{label}</p>
          <p className={cn("text-xl font-mono mt-0.5", color)}>{value}</p>
          {sub && <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Main Dashboard
// ============================================================

export function TokenUsageDashboard() {
  const [records, setRecords] = React.useState<UsageRecord[]>([]);
  const [routerSummary, setRouterSummary] = React.useState<RouterSummary | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    setRecords(loadUsageRecords());
    try {
      const router = getRouter();
      setRouterSummary(router.getRouterSummary());
    } catch { /* no router yet */ }
  }, [refreshKey]);

  const summary = React.useMemo(() => getUsageSummary(), [refreshKey]);

  // === Derived chart data ===

  // 1. Daily tokens (line/area chart)
  const dailyData = React.useMemo(() => {
    const byDate: Record<string, { tokens: number; cost: number; calls: number }> = {};
    for (const r of records) {
      if (!byDate[r.date]) byDate[r.date] = { tokens: 0, cost: 0, calls: 0 };
      byDate[r.date].tokens += r.totalTokens;
      byDate[r.date].cost += r.costUsd;
      byDate[r.date].calls += 1;
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14) // last 14 days
      .map(([date, data]) => ({
        date: date.slice(5), // MM-DD
        tokens: data.tokens,
        cost: Math.round(data.cost * 10000) / 10000,
        calls: data.calls,
      }));
  }, [records]);

  // 2. By provider (pie chart)
  const providerData = React.useMemo(() => {
    return Object.entries(summary.byProvider)
      .map(([pid, data]) => ({
        name: PROVIDERS[pid]?.displayName || pid,
        value: data.tokens,
        cost: data.cost,
        calls: data.calls,
        color: PROVIDER_COLORS[pid] || '#71717a',
      }))
      .sort((a, b) => b.value - a.value);
  }, [summary]);

  // 3. By agent (bar chart)
  const agentData = React.useMemo(() => {
    return Object.entries(summary.byAgent)
      .map(([aid, data]) => ({
        name: AGENT_NAMES[aid] || aid,
        agentId: aid,
        tokens: data.tokens,
        cost: data.cost,
        calls: data.calls,
        color: AGENT_COLORS[aid] || '#71717a',
      }))
      .sort((a, b) => b.tokens - a.tokens);
  }, [summary]);

  // 4. Latency distribution
  const latencyData = React.useMemo(() => {
    const buckets: Record<string, number> = {
      '<500ms': 0, '500-1s': 0, '1-2s': 0, '2-5s': 0, '>5s': 0,
    };
    for (const r of records) {
      if (r.latencyMs < 500) buckets['<500ms']++;
      else if (r.latencyMs < 1000) buckets['500-1s']++;
      else if (r.latencyMs < 2000) buckets['1-2s']++;
      else if (r.latencyMs < 5000) buckets['2-5s']++;
      else buckets['>5s']++;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [records]);

  // 5. Router health scores
  const healthScores = routerSummary?.providers || [];

  const hasData = records.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg text-white tracking-tight">LLM 用量分析</h3>
            <p className="text-xs text-zinc-500 font-mono">Token Analytics & Router Health</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-[10px] font-mono border-white/10"
          onClick={() => setRefreshKey(k => k + 1)}
        >
          <RefreshCw className="w-3 h-3" />
          REFRESH
        </Button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Zap}
          label="Total Tokens"
          value={summary.totalTokens > 0 ? formatNum(summary.totalTokens) : '0'}
          sub={`Today: ${formatNum(summary.todayTokens)}`}
          color="text-amber-500"
          trend={summary.todayTokens > 0 ? 'up' : 'flat'}
        />
        <StatCard
          icon={Coins}
          label="Total Cost"
          value={`$${summary.totalCost.toFixed(4)}`}
          sub={`Today: $${summary.todayCost.toFixed(4)}`}
          color="text-emerald-500"
          trend={summary.todayCost > 0 ? 'up' : 'flat'}
        />
        <StatCard
          icon={Activity}
          label="API Calls"
          value={summary.totalCalls.toString()}
          sub={`${Object.keys(summary.byProvider).length} providers active`}
          color="text-blue-500"
        />
        <StatCard
          icon={Clock}
          label="Avg Latency"
          value={records.length > 0 ? `${Math.round(records.reduce((s, r) => s + r.latencyMs, 0) / records.length)}ms` : '—'}
          sub={records.length > 0 ? `${records.length} samples` : 'No data'}
          color="text-purple-500"
        />
      </div>

      {hasData ? (
        <>
          {/* Charts Row 1: Daily Trend + Provider Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Daily Token Trend */}
            <Card className="lg:col-span-2 bg-black/40 border-white/8">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Daily Token Usage (14d)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] p-2 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={{ stroke: '#ffffff08' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={{ stroke: '#ffffff08' }} />
                    <Tooltip content={<CyberTooltip />} />
                    <Area type="monotone" dataKey="tokens" stroke="#f59e0b" fill="url(#tokenGrad)" strokeWidth={2} name="Tokens" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Provider Distribution Pie */}
            <Card className="bg-black/40 border-white/8">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400">Provider Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] p-2 flex items-center">
                {providerData.length > 0 ? (
                  <div className="w-full flex items-center">
                    <div className="w-1/2 h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={providerData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={65}
                            dataKey="value"
                            stroke="none"
                          >
                            {providerData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CyberTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-1.5 pl-2">
                      {providerData.map(p => (
                        <div key={p.name} className="flex items-center gap-2 text-[10px] font-mono">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="text-zinc-400 truncate">{p.name}</span>
                          <span className="text-zinc-600 ml-auto">{formatNum(p.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-600 text-xs font-mono text-center w-full">No provider data</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Agent Usage + Latency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Agent Token Usage Bar */}
            <Card className="bg-black/40 border-white/8">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Agent Token Consumption
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[200px] p-2 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentData} layout="vertical" barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={{ stroke: '#ffffff08' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={50} axisLine={{ stroke: '#ffffff08' }} />
                    <Tooltip content={<CyberTooltip />} />
                    <Bar dataKey="tokens" name="Tokens" radius={[0, 4, 4, 0]}>
                      {agentData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Latency Distribution */}
            <Card className="bg-black/40 border-white/8">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Latency Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[200px] p-2 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={latencyData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={{ stroke: '#ffffff08' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={{ stroke: '#ffffff08' }} />
                    <Tooltip content={<CyberTooltip />} />
                    <Bar dataKey="count" name="Requests" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* Empty State */
        <Card className="bg-black/40 border-white/8">
          <CardContent className="py-16 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-zinc-800/50 mb-4">
              <BarChart3 className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-400 text-sm">No usage data yet</p>
            <p className="text-zinc-600 text-xs font-mono mt-1">
              Send messages to any Agent via LLM Bridge to start tracking
            </p>
          </CardContent>
        </Card>
      )}

      {/* Router Health Panel */}
      <Card className="bg-black/40 border-white/8">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Router Health & Circuit Breakers
            </span>
            {routerSummary && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(
                  "text-[9px] font-mono",
                  routerSummary.overallHealth >= 80 ? "border-green-500/30 text-green-500" :
                  routerSummary.overallHealth >= 50 ? "border-amber-500/30 text-amber-500" :
                  "border-red-500/30 text-red-500"
                )}>
                  HEALTH: {routerSummary.overallHealth}%
                </Badge>
                <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-zinc-500">
                  {routerSummary.healthyCount}H / {routerSummary.degradedCount}D / {routerSummary.brokenCount}B
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthScores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {healthScores.map(hs => (
                <ProviderHealthCard key={hs.providerId} health={hs} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-xs font-mono">
                No router data — health metrics populate after first LLM call
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Calls Table */}
      {records.length > 0 && (
        <Card className="bg-black/40 border-white/8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Recent API Calls</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-zinc-500 px-4 py-2">Date</th>
                    <th className="text-left text-zinc-500 px-4 py-2">Agent</th>
                    <th className="text-left text-zinc-500 px-4 py-2">Provider</th>
                    <th className="text-left text-zinc-500 px-4 py-2">Model</th>
                    <th className="text-right text-zinc-500 px-4 py-2">Tokens</th>
                    <th className="text-right text-zinc-500 px-4 py-2">Cost</th>
                    <th className="text-right text-zinc-500 px-4 py-2">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(-20).reverse().map((r, i) => (
                    <tr key={i} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-1.5 text-zinc-500">{r.date}</td>
                      <td className="px-4 py-1.5">
                        <span style={{ color: AGENT_COLORS[r.agentId] || '#a1a1aa' }}>
                          {AGENT_NAMES[r.agentId] || r.agentId}
                        </span>
                      </td>
                      <td className="px-4 py-1.5" style={{ color: PROVIDER_COLORS[r.provider] || '#a1a1aa' }}>
                        {PROVIDERS[r.provider]?.displayName || r.provider}
                      </td>
                      <td className="px-4 py-1.5 text-zinc-400">{r.model}</td>
                      <td className="px-4 py-1.5 text-right text-zinc-300">{r.totalTokens.toLocaleString()}</td>
                      <td className="px-4 py-1.5 text-right text-emerald-500">${r.costUsd.toFixed(4)}</td>
                      <td className="px-4 py-1.5 text-right text-zinc-400">{r.latencyMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Provider Health Card Sub-component
// ============================================================

function ProviderHealthCard({ health }: { health: ProviderHealthScore }) {
  const provider = PROVIDERS[health.providerId];
  const providerName = provider?.displayName || health.providerId;
  const color = PROVIDER_COLORS[health.providerId] || '#71717a';

  return (
    <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-mono text-zinc-300 truncate">{providerName}</span>
        </div>
        <CircuitIcon state={health.circuitState} />
      </div>

      {/* Score Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] font-mono text-zinc-500">SCORE</span>
          <span className={cn("text-[10px] font-mono",
            health.score >= 80 ? "text-green-500" :
            health.score >= 50 ? "text-amber-500" :
            "text-red-500"
          )}>{health.score}/100</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500",
              health.score >= 80 ? "bg-green-500" :
              health.score >= 50 ? "bg-amber-500" :
              "bg-red-500"
            )}
            style={{ width: `${health.score}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div className="flex justify-between">
          <span className="text-[9px] font-mono text-zinc-600">Circuit</span>
          <span className={cn("text-[9px] font-mono",
            health.circuitState === 'CLOSED' ? "text-green-500" :
            health.circuitState === 'HALF_OPEN' ? "text-amber-500" :
            "text-red-500"
          )}>{health.circuitState}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] font-mono text-zinc-600">Latency</span>
          <span className="text-[9px] font-mono text-zinc-400">{health.avgLatencyMs}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] font-mono text-zinc-600">Success</span>
          <span className="text-[9px] font-mono text-zinc-400">{Math.round(health.successRate * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] font-mono text-zinc-600">Requests</span>
          <span className="text-[9px] font-mono text-zinc-400">{health.totalRequests}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Number Formatter
// ============================================================

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}