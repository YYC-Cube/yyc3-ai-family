import {
  Cpu, Thermometer, HardDrive,
  Wifi, Activity, Zap, Clock, ArrowUpRight, ArrowDownRight,
  Database, GitBranch, Box, RefreshCw,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { eventBus } from '@/lib/event-bus';
import { useTranslation } from '@/lib/i18n';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ============================================================
// HardwareMonitor — M4 Max 56-Core Telemetry Dashboard
//
// Visualizes Apple M4 Max hardware telemetry:
//   - 16 Performance cores + 40 GPU cores grid
//   - Memory pressure gauge (128GB Unified)
//   - Thermal zones
//   - Disk I/O throughput (SN850X PCIe 4.0)
//   - Network throughput
//   - Process summary
//   - PostgreSQL 15 connection status
//
// Data source: clusterMetrics from Zustand store
// Fallback: simulated data when real metrics unavailable
// ============================================================

// --- Core Status Visualization ---
interface CoreCellProps {
  index: number;
  type: 'P' | 'GPU';
  load: number;
  label?: string;
}

function CoreCell({ index, type, load, label }: CoreCellProps) {
  const color = load > 90 ? 'bg-red-500' : load > 70 ? 'bg-amber-500' : load > 40 ? 'bg-sky-500' : load > 10 ? 'bg-emerald-500' : 'bg-zinc-700';
  const glowColor = load > 90 ? 'shadow-red-500/30' : load > 70 ? 'shadow-amber-500/20' : load > 40 ? 'shadow-sky-500/10' : 'shadow-transparent';

  return (
    <div
      className={cn(
        'relative rounded-[2px] transition-all duration-500 group cursor-default',
        type === 'P' ? 'w-5 h-5' : 'w-3 h-3',
        load > 70 && 'shadow-[0_0_4px]',
        glowColor,
      )}
      title={`${type} Core ${index}: ${load.toFixed(0)}%`}
    >
      <div className={cn('w-full h-full rounded-[2px] transition-all duration-500', color)} style={{ opacity: Math.max(0.15, load / 100) }} />
      {/* Active indicator */}
      {load > 50 && (
        <div className="absolute inset-0 rounded-[2px] animate-pulse opacity-30" style={{ background: load > 90 ? '#ef4444' : load > 70 ? '#f59e0b' : '#0ea5e9' }} />
      )}
    </div>
  );
}

// --- Ring Gauge ---
function RingGauge({ value, max, label, unit, color, size = 80 }: { value: number; max: number; label: string; unit: string; color: string; size?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const strokeColor = pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : color;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#27272a" strokeWidth="4" fill="none"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={strokeColor} strokeWidth="4" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-mono text-zinc-200">{pct.toFixed(0)}%</span>
        </div>
      </div>
      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// --- Stat Card ---
function StatCard({ icon: Icon, label, value, unit, trend, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 hover:border-zinc-700/50 transition-colors group">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-6 h-6 rounded flex items-center justify-center bg-zinc-800/80 border border-zinc-700/50', color)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{label}</span>
        {trend && (
          <div className="ml-auto">
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-red-400" /> :
             trend === 'down' ? <ArrowDownRight className="w-3 h-3 text-emerald-400" /> :
             <Activity className="w-3 h-3 text-zinc-600" />}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-mono text-zinc-200">{value}</span>
        <span className="text-[9px] font-mono text-zinc-600">{unit}</span>
      </div>
    </div>
  );
}

// --- Process Item ---
function ProcessItem({ name, cpu, mem, pid }: { name: string; cpu: number; mem: number; pid: number }) {
  return (
    <div className="flex items-center gap-3 py-1.5 px-2 hover:bg-zinc-800/30 rounded text-[10px] font-mono transition-colors">
      <span className="text-zinc-600 w-10 text-right">{pid}</span>
      <span className="text-zinc-300 flex-1 truncate">{name}</span>
      <span className={cn('w-12 text-right', cpu > 50 ? 'text-amber-400' : 'text-zinc-500')}>{cpu.toFixed(1)}%</span>
      <span className={cn('w-12 text-right', mem > 1000 ? 'text-sky-400' : 'text-zinc-500')}>{mem > 1024 ? `${(mem / 1024).toFixed(1)}G` : `${mem}M`}</span>
    </div>
  );
}

// === Main Component ===
export function HardwareMonitor() {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const clusterMetrics = useSystemStore(s => s.clusterMetrics);
  const cpuLoad = useSystemStore(s => s.cpuLoad);
  const dbConnected = useSystemStore(s => s.dbConnected);
  const addLog = useSystemStore(s => s.addLog);

  // Simulated per-core loads (P-cores + GPU cores)
  const [coreTick, setCoreTick] = React.useState(0);
  const coreLoadsRef = React.useRef<{ pCores: number[]; gpuCores: number[] }>({
    pCores: Array.from({ length: 16 }, () => Math.random() * 30 + 5),
    gpuCores: Array.from({ length: 40 }, () => Math.random() * 20 + 2),
  });

  // Simulate per-core metrics evolution
  React.useEffect(() => {
    const timer = setInterval(() => {
      const baseCpu = cpuLoad || 20;

      coreLoadsRef.current = {
        pCores: coreLoadsRef.current.pCores.map((prev, i) => {
          const target = baseCpu + (Math.random() - 0.5) * 40 + (i < 4 ? 15 : 0);

          return Math.max(1, Math.min(100, prev * 0.7 + target * 0.3 + (Math.random() - 0.5) * 10));
        }),
        gpuCores: coreLoadsRef.current.gpuCores.map(prev => {
          const target = baseCpu * 0.4 + Math.random() * 25;

          return Math.max(0, Math.min(100, prev * 0.75 + target * 0.25 + (Math.random() - 0.5) * 8));
        }),
      };
      setCoreTick(t => t + 1);
    }, 2000);

    return () => clearInterval(timer);
  }, [cpuLoad]);

  const { pCores, gpuCores } = coreLoadsRef.current;

  // Derived metrics
  const m4 = clusterMetrics?.['m4-max'];
  const memUsed = m4?.memory ?? 42;
  const diskUsed = m4?.disk ?? 35;
  const netUsage = m4?.network ?? 18;
  const temp = m4?.temperature ?? 52;
  const uptime = m4?.uptime ?? 86400;
  const procs = m4?.processes ?? 312;

  // Uptime format
  const uptimeStr = React.useMemo(() => {
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);

    return h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`;
  }, [uptime]);

  // Mock process list
  const processes = React.useMemo(() => [
    { name: 'node (vite dev)', cpu: 8.2, mem: 1240, pid: 1847 },
    { name: 'postgres (yyc3_max)', cpu: 3.1, mem: 890, pid: 2341 },
    { name: 'ollama serve', cpu: cpuLoad > 50 ? 45.6 : 2.4, mem: 8192, pid: 3012 },
    { name: 'Docker Desktop', cpu: 4.7, mem: 2048, pid: 892 },
    { name: 'Chromium Helper', cpu: 12.3, mem: 3200, pid: 4523 },
    { name: 'WindowServer', cpu: 2.1, mem: 450, pid: 112 },
    { name: 'mds_stores', cpu: 1.8, mem: 320, pid: 234 },
    { name: 'kernel_task', cpu: 0.8, mem: 180, pid: 0 },
  ], [cpuLoad]);

  // --- Phase 36.1: Thermal Alert Auto-Detection via EventBus ---
  const lastThermalAlertRef = React.useRef<number>(0);

  React.useEffect(() => {
    const now = Date.now();

    // Throttle: at most one alert every 30 seconds
    if (now - lastThermalAlertRef.current < 30000) return;

    if (temp > 85) {
      lastThermalAlertRef.current = now;
      eventBus.emit({
        category: 'system',
        type: 'system.thermal_critical',
        level: 'error',
        source: 'HW_MONITOR',
        message: `THERMAL CRITICAL: CPU Die at ${temp}C — throttling likely`,
        metadata: { temperature: temp, zone: 'CPU Die', limit: 105 },
      });
    } else if (temp > 70) {
      lastThermalAlertRef.current = now;
      eventBus.emit({
        category: 'system',
        type: 'system.thermal_warning',
        level: 'warn',
        source: 'HW_MONITOR',
        message: `Thermal warning: CPU Die at ${temp}C`,
        metadata: { temperature: temp, zone: 'CPU Die', limit: 105 },
      });
    }

    if (memUsed > 90) {
      eventBus.emit({
        category: 'system',
        type: 'system.memory_pressure',
        level: 'warn',
        source: 'HW_MONITOR',
        message: `Memory pressure high: ${memUsed.toFixed(0)}% (${(memUsed * 1.28).toFixed(0)}GB / 128GB)`,
        metadata: { memoryPercent: memUsed, usedGB: memUsed * 1.28, totalGB: 128 },
      });
    }
  }, [temp, memUsed, coreTick]); // Re-check each core tick

  // --- Phase 36.1: Emit mount event ---
  React.useEffect(() => {
    eventBus.system('hw_monitor.mounted', 'Hardware Monitor panel opened');

    return () => { eventBus.system('hw_monitor.unmounted', 'Hardware Monitor panel closed'); };
  }, []);

  const handleRefresh = () => {
    addLog('info', 'HW_MONITOR', 'Manual telemetry refresh triggered');
    eventBus.system('hw_monitor.refresh', 'Manual telemetry refresh triggered', 'info', {
      cpuLoad, memUsed, diskUsed, temp, uptime,
    });
  };

  // --- Phase 36.1: Quick Action handler with EventBus ---
  const handleQuickAction = React.useCallback((actionLabel: string) => {
    addLog('info', 'HW_MONITOR', `Action: ${actionLabel}`);
    eventBus.system('hw_monitor.action', `Quick action: ${actionLabel}`, 'info', {
      action: actionLabel,
      dbConnected,
    });
  }, [addLog, dbConnected]);

  return (
    <div className="h-full flex flex-col min-h-0 bg-background/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="font-mono text-sm text-zinc-200">
              {zh ? 'M4 Max 硬件遥测' : 'M4 Max Hardware Telemetry'}
            </h2>
            <p className="text-[10px] font-mono text-zinc-600">
              Apple M4 Max | 16P+4E CPU | 40-core GPU | 128GB Unified | yyc3-22 (192.168.3.22)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(
            'text-[9px] font-mono gap-1',
            dbConnected
              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
              : 'border-zinc-700 text-zinc-500',
          )}>
            <Database className="w-3 h-3" />
            PG15:{dbConnected ? 'CONNECTED' : 'OFFLINE'}
          </Badge>
          <Badge variant="outline" className="text-[9px] font-mono gap-1 border-zinc-700 text-zinc-400">
            <Clock className="w-3 h-3" />
            UP:{uptimeStr}
          </Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh}>
            <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* CPU Core Grid */}
        <Card className="bg-zinc-900/30 border-zinc-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              {zh ? 'CPU 核心矩阵' : 'CPU Core Matrix'}
              <span className="ml-auto text-zinc-600 normal-case">{zh ? '平均负载' : 'Avg Load'}: {cpuLoad}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* P-Cores (Performance): 16 cores in 4x4 grid */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider">P-Cores (16)</span>
                <span className="text-[8px] font-mono text-zinc-600">{zh ? '高性能核心' : 'Performance Cores'}</span>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {pCores.map((load, i) => (
                  <CoreCell key={`p-${i}`} index={i} type="P" load={load} />
                ))}
              </div>
            </div>

            {/* GPU Cores: 40 cores in 10x4 grid */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono text-sky-400 uppercase tracking-wider">GPU Cores (40)</span>
                <span className="text-[8px] font-mono text-zinc-600">{zh ? '图形/AI 计算核心' : 'Graphics/AI Compute'}</span>
              </div>
              <div className="grid grid-cols-10 gap-0.5">
                {gpuCores.map((load, i) => (
                  <CoreCell key={`g-${i}`} index={i} type="GPU" load={load} />
                ))}
              </div>
            </div>

            {/* Load Legend */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-4 text-[8px] font-mono text-zinc-600">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-[1px] bg-zinc-700" /> 0-10%</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-[1px] bg-emerald-500" /> 10-40%</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-[1px] bg-sky-500" /> 40-70%</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-[1px] bg-amber-500" /> 70-90%</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-[1px] bg-red-500" /> 90%+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gauges Row */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-zinc-900/30 border-zinc-800/50 flex flex-col items-center p-4">
            <RingGauge value={cpuLoad} max={100} label="CPU" unit="%" color="#8b5cf6" />
          </Card>
          <Card className="bg-zinc-900/30 border-zinc-800/50 flex flex-col items-center p-4">
            <RingGauge value={memUsed} max={100} label={zh ? '内存' : 'MEM'} unit="%" color="#0ea5e9" />
            <span className="text-[8px] font-mono text-zinc-600 mt-1">{(memUsed * 1.28).toFixed(1)}/{128} GB</span>
          </Card>
          <Card className="bg-zinc-900/30 border-zinc-800/50 flex flex-col items-center p-4">
            <RingGauge value={diskUsed} max={100} label={zh ? '磁盘' : 'DISK'} unit="%" color="#a78bfa" />
            <span className="text-[8px] font-mono text-zinc-600 mt-1">SN850X 2TB</span>
          </Card>
          <Card className="bg-zinc-900/30 border-zinc-800/50 flex flex-col items-center p-4">
            <RingGauge value={temp} max={110} label={zh ? '温度' : 'TEMP'} unit="C" color="#f59e0b" size={80} />
            <span className={cn(
              'text-[8px] font-mono mt-1',
              temp > 85 ? 'text-red-400' : temp > 70 ? 'text-amber-400' : 'text-zinc-600',
            )}>
              {temp > 85 ? (zh ? '过热!' : 'HOT!') : temp > 70 ? (zh ? '偏高' : 'WARM') : (zh ? '正常' : 'NORMAL')}
            </span>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard icon={Zap} label={zh ? '功耗' : 'Power'} value={Math.round(30 + cpuLoad * 0.9)} unit="W" trend={cpuLoad > 50 ? 'up' : 'stable'} color="text-amber-400" />
          <StatCard icon={Wifi} label={zh ? '网络' : 'Network'} value={netUsage} unit="Mbps" trend="stable" color="text-cyan-400" />
          <StatCard icon={GitBranch} label={zh ? '进程' : 'Procs'} value={procs} unit="" trend="stable" color="text-violet-400" />
          <StatCard icon={HardDrive} label={zh ? '磁盘IO' : 'Disk I/O'} value={Math.round(120 + Math.random() * 80)} unit="MB/s" trend="stable" color="text-pink-400" />
        </div>

        {/* Process List + PG15 Status */}
        <div className="grid grid-cols-2 gap-4">
          {/* Process List */}
          <Card className="bg-zinc-900/30 border-zinc-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                {zh ? '活跃进程' : 'Active Processes'}
                <span className="ml-auto text-zinc-600 normal-case">Top {processes.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 py-1 px-2 text-[8px] font-mono text-zinc-600 uppercase tracking-wider border-b border-zinc-800/50 mb-1">
                <span className="w-10 text-right">PID</span>
                <span className="flex-1">NAME</span>
                <span className="w-12 text-right">CPU%</span>
                <span className="w-12 text-right">MEM</span>
              </div>
              {processes.map(p => (
                <ProcessItem key={p.pid} {...p} />
              ))}
            </CardContent>
          </Card>

          {/* PostgreSQL 15 Status */}
          <Card className="bg-zinc-900/30 border-zinc-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                PostgreSQL 15 {zh ? '状态' : 'Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {[
                  { label: zh ? '连接状态' : 'Connection', value: dbConnected ? 'CONNECTED' : 'OFFLINE', color: dbConnected ? 'text-emerald-400' : 'text-zinc-600' },
                  { label: zh ? '端口' : 'Port', value: '5433', color: 'text-zinc-300' },
                  { label: zh ? '用户' : 'User', value: 'yyc3_max', color: 'text-zinc-300' },
                  { label: zh ? '主机' : 'Host', value: '192.168.3.22', color: 'text-zinc-300' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-600">{item.label}</span>
                    <span className={item.color}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800/50 pt-2 space-y-1.5">
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Schemas</div>
                {[
                  { name: 'orchestration', desc: zh ? '任务生命周期' : 'Task lifecycle', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { name: 'knowledge', desc: zh ? 'pgvector 向量记忆' : 'pgvector memory', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { name: 'telemetry', desc: zh ? '硬件遥测数据' : 'Hardware telemetry', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                ].map(schema => (
                  <div key={schema.name} className="flex items-center gap-2 px-2 py-1.5 rounded bg-zinc-800/30">
                    <div className={cn('w-1.5 h-1.5 rounded-full', schema.bg.replace('/10', ''))} />
                    <span className={cn('text-[10px] font-mono', schema.color)}>{schema.name}</span>
                    <span className="text-[9px] text-zinc-600 ml-auto">{schema.desc}</span>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-zinc-800/50 pt-2">
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2">{zh ? '快速操作' : 'Quick Actions'}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: zh ? '连接测试' : 'Test Connection', icon: Wifi },
                    { label: zh ? '创建快照' : 'Create Snapshot', icon: Database },
                    { label: zh ? '查看日志' : 'View Logs', icon: Activity },
                    { label: zh ? 'Schema 迁移' : 'Schema Migrate', icon: GitBranch },
                  ].map(action => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 justify-start gap-1.5"
                      onClick={() => handleQuickAction(action.label)}
                    >
                      <action.icon className="w-3 h-3" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Thermal Zone Visualization */}
        <Card className="bg-zinc-900/30 border-zinc-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              {zh ? '热力区域图' : 'Thermal Zone Map'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* SoC layout representation */}
              <div className="relative w-48 h-32 bg-zinc-800/30 rounded-lg border border-zinc-700/30 overflow-hidden">
                {/* CPU Zone */}
                <div
                  className="absolute top-2 left-2 w-20 h-12 rounded border border-zinc-600/30 flex items-center justify-center transition-all duration-1000"
                  style={{
                    background: `rgba(${Math.min(255, temp * 3)}, ${Math.max(0, 200 - temp * 2)}, 50, 0.15)`,
                  }}
                >
                  <span className="text-[8px] font-mono text-zinc-400">CPU {temp}C</span>
                </div>
                {/* GPU Zone */}
                <div
                  className="absolute top-2 right-2 w-20 h-12 rounded border border-zinc-600/30 flex items-center justify-center transition-all duration-1000"
                  style={{
                    background: `rgba(${Math.min(255, (temp - 5) * 3)}, ${Math.max(0, 200 - (temp - 5) * 2)}, 80, 0.12)`,
                  }}
                >
                  <span className="text-[8px] font-mono text-zinc-400">GPU {Math.max(30, temp - 5)}C</span>
                </div>
                {/* Memory Zone */}
                <div
                  className="absolute bottom-2 left-2 right-2 h-10 rounded border border-zinc-600/30 flex items-center justify-center"
                  style={{
                    background: `rgba(59, 130, 246, ${memUsed / 300})`,
                  }}
                >
                  <span className="text-[8px] font-mono text-zinc-400">{zh ? '统一内存' : 'Unified Memory'} {(memUsed * 1.28).toFixed(0)}GB / 128GB</span>
                </div>
              </div>

              {/* Thermal stats */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                {[
                  { zone: 'CPU Die', temp: temp, limit: 105 },
                  { zone: 'GPU Die', temp: Math.max(30, temp - 5), limit: 105 },
                  { zone: 'SSD (SN850X)', temp: Math.max(25, temp - 15), limit: 85 },
                  { zone: 'Ambient', temp: Math.max(20, temp - 28), limit: 45 },
                ].map(z => (
                  <div key={z.zone} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">{z.zone}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700',
                            z.temp > z.limit * 0.85 ? 'bg-red-500' :
                            z.temp > z.limit * 0.7 ? 'bg-amber-500' :
                            'bg-emerald-500',
                          )}
                          style={{ width: `${(z.temp / z.limit) * 100}%` }}
                        />
                      </div>
                      <span className={cn(
                        z.temp > z.limit * 0.85 ? 'text-red-400' :
                        z.temp > z.limit * 0.7 ? 'text-amber-400' :
                        'text-zinc-400',
                      )}>
                        {z.temp}C
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}