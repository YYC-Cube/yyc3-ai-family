// ============================================================
// YYC3 Hacker Chatbot — Device Card Manager
// Phase 15.2 + Device Info Cards: Editable/Read-only
//
// Features:
// - Editable fields: hostname, displayName, IP
// - Read-only fields: chip, cores, RAM, storage, OS (auto-detected)
// - Device status visualization with ping health
// - Network services integration with status indicators
// - Sync/maintain capability for future upgrades
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Laptop, Monitor, Server, HardDrive, Cpu, Wifi,
  Edit3, Check, X, RefreshCw, Globe, ChevronDown, ChevronUp,
  ExternalLink, Zap, Save,
  MemoryStick, Thermometer, Activity,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useSystemStore } from "@/lib/store";
import {
  loadDeviceConfigs,
  saveDeviceConfigs,
  pingDevice,
  type DeviceConfig,
} from "@/lib/nas-client";

// ============================================================
// Color Mappings
// ============================================================

const COLOR_MAP: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  amber:  { text: 'text-amber-500',  bg: 'bg-amber-500',  border: 'border-amber-500/20', glow: 'shadow-amber-500/10' },
  blue:   { text: 'text-blue-500',   bg: 'bg-blue-500',   border: 'border-blue-500/20',  glow: 'shadow-blue-500/10' },
  purple: { text: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500/20', glow: 'shadow-purple-500/10' },
  zinc:   { text: 'text-zinc-400',   bg: 'bg-zinc-500',   border: 'border-zinc-500/20',  glow: 'shadow-zinc-500/10' },
  green:  { text: 'text-green-500',  bg: 'bg-green-500',  border: 'border-green-500/20', glow: 'shadow-green-500/10' },
  cyan:   { text: 'text-cyan-500',   bg: 'bg-cyan-500',   border: 'border-cyan-500/20',  glow: 'shadow-cyan-500/10' },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MBP: Laptop,
  iMC: Monitor,
  HW:  Laptop,
  NAS: Server,
};

// ============================================================
// Status Helpers
// ============================================================

function StatusDot({ status }: { status: string }) {
  const cls = status === 'online'
    ? 'bg-green-500 animate-pulse'
    : status === 'standby'
    ? 'bg-amber-500 animate-pulse'
    : status === 'offline'
    ? 'bg-red-500'
    : 'bg-zinc-600';
  return <div className={cn("w-2 h-2 rounded-full shrink-0", cls)} />;
}

function ServiceStatusDot({ status }: { status: string }) {
  const cls = status === 'up' ? 'bg-green-500' : status === 'down' ? 'bg-red-500' : 'bg-zinc-600';
  return <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", cls)} />;
}

// ============================================================
// Editable Field Component
// ============================================================

function EditableField({
  label,
  value,
  isEditing,
  onChange,
  placeholder,
  mono = true,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  if (!isEditing) {
    return (
      <div>
        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{label}</span>
        <div className={cn("text-xs text-zinc-200 mt-0.5", mono && "font-mono")}>{value || '—'}</div>
      </div>
    );
  }
  return (
    <div>
      <span className="text-[8px] font-mono text-primary/70 uppercase tracking-widest flex items-center gap-1">
        <Edit3 className="w-2 h-2" />
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-0.5 px-2 py-1 bg-black/60 border border-primary/30 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-primary/60 placeholder:text-zinc-700"
      />
    </div>
  );
}

// ============================================================
// ReadOnly Field Component
// ============================================================

function ReadOnlyField({ label, value, icon: Icon }: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded border border-white/3">
      {Icon && <Icon className="w-3 h-3 text-zinc-600 shrink-0" />}
      <div className="min-w-0">
        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest block">{label}</span>
        <span className="text-[10px] font-mono text-zinc-400 truncate block">{value}</span>
      </div>
    </div>
  );
}

// ============================================================
// Single Device Card
// ============================================================

function DeviceCard({
  device,
  isEditing,
  onUpdate,
  onPing,
  isPinging,
  clusterMetric,
}: {
  device: DeviceConfig;
  isEditing: boolean;
  onUpdate: (updates: Partial<DeviceConfig>) => void;
  onPing: () => void;
  isPinging: boolean;
  clusterMetric?: { cpu: number; memory: number; disk: number; temperature: number; network: number };
}) {
  const [expanded, setExpanded] = React.useState(false);
  const colors = COLOR_MAP[device.color] || COLOR_MAP.zinc;
  const DevIcon = ICON_MAP[device.icon] || Server;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border transition-all",
      "bg-zinc-900/40 hover:bg-zinc-900/60",
      isEditing ? "border-primary/30 shadow-lg shadow-primary/5" : colors.border,
    )}>
      {/* Background glow */}
      {device.status === 'online' && (
        <div className={cn("absolute -right-10 -top-10 w-28 h-28 rounded-full blur-3xl opacity-10", colors.bg)} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between p-4 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("p-2 rounded-lg border shrink-0", colors.border, `${colors.bg}/10`)}>
            <DevIcon className={cn("w-5 h-5", colors.text)} />
          </div>
          <div className="min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={device.displayName}
                onChange={e => onUpdate({ displayName: e.target.value })}
                className="bg-black/60 border border-primary/30 rounded px-2 py-0.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-primary/60 w-full"
              />
            ) : (
              <h3 className="text-sm text-zinc-100 truncate">{device.displayName}</h3>
            )}
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{device.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Ping status */}
          {isPinging ? (
            <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
          ) : (
            <StatusDot status={device.status} />
          )}
          <Badge variant="outline" className={cn(
            "text-[9px] uppercase font-mono",
            device.status === 'online' ? 'border-green-500/30 text-green-500 bg-green-500/5'
            : device.status === 'standby' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5'
            : device.status === 'offline' ? 'border-red-500/30 text-red-500 bg-red-500/5'
            : 'border-zinc-500/30 text-zinc-500'
          )}>
            {device.status}
          </Badge>
        </div>
      </div>

      {/* Editable + ReadOnly Fields */}
      <div className="px-4 pb-3 space-y-2 relative z-10">
        {/* Editable Row */}
        <div className="grid grid-cols-2 gap-2">
          <EditableField
            label="Hostname"
            value={device.hostName}
            isEditing={isEditing}
            onChange={v => onUpdate({ hostName: v })}
            placeholder="hostname"
          />
          <EditableField
            label="IP Address"
            value={device.ip}
            isEditing={isEditing}
            onChange={v => onUpdate({ ip: v })}
            placeholder="192.168.x.x"
          />
        </div>

        {/* Read-Only Specs */}
        <div className="grid grid-cols-2 gap-1.5">
          <ReadOnlyField label="Chip" value={device.chip} icon={Cpu} />
          <ReadOnlyField label="Cores" value={device.cores} icon={Activity} />
          <ReadOnlyField label="RAM" value={device.ram} icon={MemoryStick} />
          <ReadOnlyField label="Storage" value={device.storage} icon={HardDrive} />
        </div>

        {/* Live Metrics (if available from cluster) */}
        {clusterMetric && (
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
              <span>LIVE METRICS</span>
              {device.latencyMs > 0 && <span className="text-zinc-600">{device.latencyMs}ms</span>}
            </div>
            <MiniMetricBar label="CPU" value={clusterMetric.cpu} color={colors.bg} />
            <MiniMetricBar label="MEM" value={clusterMetric.memory} color="bg-blue-500" />
            <MiniMetricBar label="DSK" value={clusterMetric.disk} color="bg-green-500" />
            <div className="flex justify-between text-[9px] font-mono text-zinc-600 pt-1">
              <span className="flex items-center gap-1"><Thermometer className="w-2.5 h-2.5" />{Math.round(clusterMetric.temperature)}°C</span>
              <span className="flex items-center gap-1"><Wifi className="w-2.5 h-2.5" />{Math.round(clusterMetric.network)} Mbps</span>
            </div>
          </div>
        )}

        {/* Services Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between pt-2 border-t border-white/5 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            SERVICES ({device.services.filter(s => s.enabled).length}/{device.services.length})
          </span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Expanded Services */}
        {expanded && (
          <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
            {device.services.map(svc => (
              <div key={svc.id} className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded border text-[10px] font-mono",
                svc.enabled
                  ? "bg-black/20 border-white/5"
                  : "bg-black/10 border-transparent opacity-50"
              )}>
                <div className="flex items-center gap-2 min-w-0">
                  <ServiceStatusDot status={svc.enabled ? svc.status : 'down'} />
                  <span className="text-zinc-300 truncate">{svc.name}</span>
                  <span className="text-zinc-600">:{svc.port}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-zinc-600 uppercase text-[8px]">{svc.protocol}</span>
                  {svc.enabled && svc.status === 'up' && (svc.protocol === 'http' || svc.protocol === 'https') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`${svc.protocol}://${device.ip}:${svc.port}${svc.path || ''}`, '_blank');
                      }}
                      className="p-0.5 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-colors"
                      title="Open in browser"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = device.services.map(s =>
                          s.id === svc.id ? { ...s, enabled: !s.enabled } : s
                        );
                        onUpdate({ services: updated });
                      }}
                      className={cn(
                        "p-0.5 rounded transition-colors",
                        svc.enabled ? "text-green-500 hover:text-red-500" : "text-zinc-600 hover:text-green-500"
                      )}
                      title={svc.enabled ? "Disable" : "Enable"}
                    >
                      {svc.enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ping button */}
      {!isEditing && (
        <div className="px-4 pb-3 relative z-10">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-6 text-[9px] font-mono border-white/8 text-zinc-500 hover:text-zinc-200 gap-1"
            onClick={onPing}
            disabled={isPinging}
          >
            {isPinging ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Zap className="w-2.5 h-2.5" />}
            PING
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Mini Metric Bar
// ============================================================

function MiniMetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono text-zinc-600 w-6">{label}</span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[9px] font-mono text-zinc-500 w-7 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

// ============================================================
// Main: Device Card Manager
// ============================================================

export function DeviceCardManager() {
  const [devices, setDevices] = React.useState<DeviceConfig[]>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [pinging, setPinging] = React.useState<Record<string, boolean>>({});
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);
  const clusterMetrics = useSystemStore(s => s.clusterMetrics);
  const addLog = useSystemStore(s => s.addLog);

  // Load on mount
  React.useEffect(() => {
    setDevices(loadDeviceConfigs());
  }, []);

  const metricMap: Record<string, string> = {
    'm4-max': 'm4-max',
    'imac-m4': 'imac-m4',
    'matebook': 'matebook',
    'yanyucloud': 'yanyucloud',
  };

  const handleUpdate = (deviceId: string, updates: Partial<DeviceConfig>) => {
    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, ...updates } : d
    ));
  };

  const handleSave = () => {
    saveDeviceConfigs(devices);
    setIsEditing(false);
    setLastSaved(new Date().toLocaleTimeString());
    addLog('success', 'DEVICE_MGR', 'Device configurations saved to localStorage');
  };

  const handleCancel = () => {
    setDevices(loadDeviceConfigs());
    setIsEditing(false);
  };

  const handlePing = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    setPinging(p => ({ ...p, [deviceId]: true }));
    addLog('info', 'DEVICE_MGR', `Pinging ${device.displayName} (${device.ip})...`);

    const result = await pingDevice(device);

    setDevices(prev => prev.map(d =>
      d.id === deviceId
        ? {
            ...d,
            status: result.reachable ? 'online' : 'offline',
            lastPing: Date.now(),
            latencyMs: result.latencyMs,
          }
        : d
    ));

    addLog(
      result.reachable ? 'success' : 'warn',
      'DEVICE_MGR',
      result.reachable
        ? `${device.displayName} ONLINE (${result.latencyMs}ms)`
        : `${device.displayName} UNREACHABLE`
    );

    setPinging(p => ({ ...p, [deviceId]: false }));
  };

  const handlePingAll = async () => {
    for (const d of devices) {
      handlePing(d.id);
    }
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg text-white tracking-tight">集群设备矩阵</h3>
            <p className="text-xs text-zinc-500 font-mono">
              {onlineCount}/{devices.length} nodes online
              {lastSaved && <span className="ml-2 text-zinc-600">Last saved: {lastSaved}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-mono border-white/10 text-zinc-400 gap-1"
                onClick={handleCancel}
              >
                <X className="w-3 h-3" />
                CANCEL
              </Button>
              <Button
                size="sm"
                className="h-7 text-[10px] font-mono gap-1"
                onClick={handleSave}
              >
                <Save className="w-3 h-3" />
                SAVE
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-mono border-white/10 text-zinc-400 gap-1"
                onClick={handlePingAll}
              >
                <RefreshCw className="w-3 h-3" />
                PING ALL
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-mono border-white/10 text-zinc-400 gap-1"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-3 h-3" />
                EDIT
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode Banner */}
      {isEditing && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-[10px] font-mono text-primary">
          <Edit3 className="w-3.5 h-3.5 shrink-0" />
          <span>编辑模式 — Hostname, Display Name, IP 可修改 | Chip, Cores, RAM, Storage 为系统自动识别 (只读)</span>
        </div>
      )}

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map(device => {
          const metricKey = metricMap[device.id] as keyof typeof clusterMetrics | undefined;
          const metric = metricKey && clusterMetrics ? clusterMetrics[metricKey as 'm4-max' | 'imac-m4' | 'matebook' | 'yanyucloud'] : undefined;

          return (
            <DeviceCard
              key={device.id}
              device={device}
              isEditing={isEditing}
              onUpdate={(updates) => handleUpdate(device.id, updates)}
              onPing={() => handlePing(device.id)}
              isPinging={!!pinging[device.id]}
              clusterMetric={metric}
            />
          );
        })}
      </div>
    </div>
  );
}