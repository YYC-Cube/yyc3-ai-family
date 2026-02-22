// ============================================================
// YYC3 Hacker Chatbot — NAS Auto-Diagnostics Panel
// Phase 22: Visual diagnostics report on dashboard startup
//
// Design: Compact panel showing NAS/Docker/WS/Device health
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, AlertTriangle, Loader2,
  RefreshCw, Zap, Shield, Wifi, Database, Box,
  Server, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useNasDiagnostics, type DiagCheck, type CheckStatus } from "@/lib/useNasDiagnostics";

// ============================================================
// Status helpers
// ============================================================

function StatusIcon({ status }: { status: CheckStatus }) {
  switch (status) {
    case 'ok': return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
    case 'fail': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    case 'warn': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    case 'checking': return <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />;
    default: return <div className="w-3.5 h-3.5 rounded-full bg-zinc-700" />;
  }
}

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case 'nas': return <Database className="w-3 h-3" />;
    case 'docker': return <Box className="w-3 h-3" />;
    case 'websocket': return <Wifi className="w-3 h-3" />;
    case 'device': return <Server className="w-3 h-3" />;
    default: return <Shield className="w-3 h-3" />;
  }
}

const statusColors: Record<CheckStatus, string> = {
  ok: 'text-green-400',
  fail: 'text-red-400',
  warn: 'text-amber-400',
  checking: 'text-cyan-400',
  pending: 'text-zinc-500',
};

// ============================================================
// DiagnosticsPanel Component
// ============================================================

export function NasDiagnosticsPanel() {
  const diag = useNasDiagnostics(true);
  const [expanded, setExpanded] = React.useState(true);

  // Auto-collapse after scan completes and all pass
  React.useEffect(() => {
    if (diag.status === 'done' && diag.failCount === 0 && diag.warnCount === 0) {
      const timer = setTimeout(() => setExpanded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [diag.status, diag.failCount, diag.warnCount]);

  // Overall health indicator
  const overallStatus = diag.status === 'running' ? 'scanning' :
    diag.failCount > 2 ? 'critical' :
    diag.failCount > 0 ? 'degraded' :
    diag.warnCount > 0 ? 'partial' :
    diag.passCount > 0 ? 'healthy' : 'idle';

  const headerColors: Record<string, { border: string; bg: string; text: string; dot: string }> = {
    scanning: { border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', text: 'text-cyan-400', dot: 'bg-cyan-500 animate-pulse' },
    healthy: { border: 'border-green-500/20', bg: 'bg-green-500/5', text: 'text-green-400', dot: 'bg-green-500' },
    partial: { border: 'border-amber-500/20', bg: 'bg-amber-500/5', text: 'text-amber-400', dot: 'bg-amber-500' },
    degraded: { border: 'border-red-500/20', bg: 'bg-red-500/5', text: 'text-red-400', dot: 'bg-red-500 animate-pulse' },
    critical: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500 animate-pulse' },
    idle: { border: 'border-white/5', bg: 'bg-zinc-900/30', text: 'text-zinc-400', dot: 'bg-zinc-600' },
  };

  const colors = headerColors[overallStatus] || headerColors.idle;

  return (
    <div className={cn(
      "rounded-xl border transition-all duration-500",
      colors.border, colors.bg,
    )}>
      {/* Header (always visible) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
          <Zap className={cn("w-4 h-4", colors.text)} />
          <span className={cn("text-xs font-mono tracking-wider", colors.text)}>
            {overallStatus === 'scanning' ? 'DIAGNOSTICS RUNNING...' :
             overallStatus === 'healthy' ? 'INFRASTRUCTURE HEALTHY' :
             overallStatus === 'partial' ? 'PARTIAL CONNECTIVITY' :
             overallStatus === 'degraded' ? 'CONNECTIVITY DEGRADED' :
             overallStatus === 'critical' ? 'CRITICAL FAILURES' :
             'DIAGNOSTICS IDLE'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {diag.status === 'done' && (
            <div className="flex items-center gap-2 text-[9px] font-mono">
              <span className="text-green-400">{diag.passCount} OK</span>
              {diag.warnCount > 0 && <span className="text-amber-400">{diag.warnCount} WARN</span>}
              {diag.failCount > 0 && <span className="text-red-400">{diag.failCount} FAIL</span>}
              <span className="text-zinc-600">{diag.totalMs}ms</span>
            </div>
          )}
          {diag.status === 'running' && (
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-3 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {/* Check Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-1.5">
            {diag.checks.map((check) => (
              <DiagCheckItem key={check.id} check={check} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
            <span className="text-[9px] text-zinc-600 font-mono">
              {diag.completedAt ? `Last scan: ${new Date(diag.completedAt).toLocaleTimeString()}` : 'Waiting...'}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-zinc-400 hover:text-white gap-1"
              onClick={() => { diag.reset(); setTimeout(() => diag.runDiagnostics(), 100); }}
              disabled={diag.status === 'running'}
            >
              <RefreshCw className={cn("w-3 h-3", diag.status === 'running' && "animate-spin")} />
              Re-scan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Individual Check Item
// ============================================================

function DiagCheckItem({ check }: { check: DiagCheck }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono transition-all",
      check.status === 'ok' ? "bg-green-500/5 border-green-500/10" :
      check.status === 'fail' ? "bg-red-500/5 border-red-500/10" :
      check.status === 'warn' ? "bg-amber-500/5 border-amber-500/10" :
      check.status === 'checking' ? "bg-cyan-500/5 border-cyan-500/10" :
      "bg-zinc-800/30 border-white/5"
    )}>
      <StatusIcon status={check.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <CategoryIcon category={check.category} />
          <span className={cn("truncate", statusColors[check.status])}>
            {check.icon}
          </span>
        </div>
        {check.detail && check.status !== 'pending' && check.status !== 'checking' && (
          <div className="text-[8px] text-zinc-500 truncate mt-0.5">
            {check.detail}
          </div>
        )}
      </div>
      {check.latencyMs !== undefined && check.status === 'ok' && (
        <span className="text-[8px] text-green-500 shrink-0">{check.latencyMs}ms</span>
      )}
    </div>
  );
}
