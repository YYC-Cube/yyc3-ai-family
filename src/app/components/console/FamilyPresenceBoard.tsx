// ============================================================
// YYC3 Hacker Chatbot — Family Presence Board
// Phase 19.2 → Phase 20.1: Real WebSocket Heartbeat Stream
//
// "陪伴是一种无形的爱，信号代表我们都在！"
// "生命不分边界，由心而发，情暖身边"
//
// Phase 20 Upgrades:
// - Real WebSocket connection to ws://192.168.3.45:9090/ws/heartbeat
// - Graceful fallback to local simulation when WS unavailable
// - Connection status indicator (Connected / Simulation mode)
// - Event Bus integration for heartbeat events
// - Agent profiles persisted to NAS SQLite via persistence-engine
//
// Features:
// - 7 Agents + 4 Devices = 11 Family Members
// - Real-time heartbeat signals (WebSocket or Simulation)
// - Members see each other's status (mutual awareness)
// - Signal messages as presence indicators
// - Warm companionship visualization within cyberpunk aesthetic
// ============================================================

import {
  Heart, Signal, Wifi, WifiOff, Brain, Sparkles, Activity,
  Users, Network, Shield, Book, Laptop, Monitor, Server, HardDrive,
  Clock, Zap, Eye, MessageCircle, Radio, Satellite, AlertCircle,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  type AgentProfile,
  type DeviceMemberProfile,
  type PresenceStatus,
  PRESENCE_META,
} from '@/lib/agent-identity';
import { useEventBusVersion } from '@/lib/event-bus';
import { useSystemStore } from '@/lib/store';
import { useHeartbeatWebSocket, type HeartbeatWsStatus } from '@/lib/useHeartbeatWebSocket';
import { cn } from '@/lib/utils';

// ============================================================
// Constants
// ============================================================

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  navigator: Brain,
  thinker: Sparkles,
  prophet: Activity,
  bole: Users,
  pivot: Network,
  sentinel: Shield,
  grandmaster: Book,
};

const DEVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'm4-max': Laptop,
  'imac-m4': Monitor,
  'matebook': Laptop,
  'yanyucloud': Server,
};

const AGENT_COLORS: Record<string, string> = {
  navigator: 'text-amber-500',
  thinker: 'text-blue-500',
  prophet: 'text-purple-500',
  bole: 'text-pink-500',
  pivot: 'text-cyan-500',
  sentinel: 'text-red-500',
  grandmaster: 'text-green-500',
};

const DEVICE_COLORS: Record<string, string> = {
  'm4-max': 'text-amber-400',
  'imac-m4': 'text-blue-400',
  'matebook': 'text-zinc-400',
  'yanyucloud': 'text-purple-400',
};

const WS_STATUS_META: Record<HeartbeatWsStatus, {
  label: string;
  labelZh: string;
  color: string;
  bg: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  connected: { label: 'Connected', labelZh: 'WS 已连接', color: 'text-green-400', bg: 'bg-green-500/10', icon: Satellite },
  connecting: { label: 'Connecting', labelZh: '连接中...', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Wifi },
  disconnected: { label: 'Disconnected', labelZh: 'WS 已断开', color: 'text-red-400', bg: 'bg-red-500/10', icon: WifiOff },
  simulation: { label: 'Simulation', labelZh: '模拟模式', color: 'text-zinc-400', bg: 'bg-zinc-500/10', icon: AlertCircle },
};

// ============================================================
// Heartbeat Ring Animation
// ============================================================

function HeartbeatRing({ status, size = 'md' }: { status: PresenceStatus; size?: 'sm' | 'md' | 'lg' }) {
  const meta = PRESENCE_META[status];
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  const dotSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };
  const ringSize = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
      {/* Pulse ring */}
      {status === 'online' && (
        <div className={cn(
          'absolute rounded-full border-2 animate-ping opacity-20',
          meta.dot.replace('bg-', 'border-'),
          ringSize[size],
        )} />
      )}
      {/* Core dot */}
      <div className={cn(
        'rounded-full transition-colors duration-500',
        meta.dot,
        status === 'online' ? 'animate-pulse' : '',
        dotSizes[size],
      )} />
    </div>
  );
}

// ============================================================
// Family Member Card (Agent)
// ============================================================

function AgentFamilyCard({ profile }: { profile: AgentProfile }) {
  const Icon = AGENT_ICONS[profile.agentId] || Brain;
  const color = AGENT_COLORS[profile.agentId] || 'text-white';
  const presenceMeta = PRESENCE_META[profile.presence];
  const activeIdentity = profile.activeIdentity === 'primary' ? profile.primary : profile.secondary;

  return (
    <div className={cn(
      'group relative p-4 rounded-xl border transition-all duration-300',
      'bg-gradient-to-br from-zinc-900/60 to-black/60 hover:from-zinc-900/80 hover:to-zinc-800/40',
      profile.presence === 'online'
        ? 'border-white/10 hover:border-white/20 shadow-lg'
        : 'border-white/5 opacity-75',
    )}>
      {/* Top: Avatar + Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              profile.presence === 'online' ? 'bg-white/10' : 'bg-white/5',
            )}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            {/* Status dot overlay */}
            <div className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900',
              presenceMeta.dot,
              profile.presence === 'online' ? 'animate-pulse' : '',
            )} />
          </div>
          <div className="min-w-0">
            <h4 className={cn('text-sm truncate', color)}>{activeIdentity.title}</h4>
            <p className="text-[10px] text-zinc-500 truncate">{activeIdentity.subtitle}</p>
          </div>
        </div>
        <HeartbeatRing status={profile.presence} size="sm" />
      </div>

      {/* Signal Message */}
      <div className="flex items-start gap-2 p-2 bg-black/30 rounded-lg border border-white/5 mb-2">
        <MessageCircle className="w-3 h-3 text-pink-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-pink-300/70 italic leading-relaxed truncate">
          {profile.signalMessage}
        </p>
      </div>

      {/* Bottom: Heartbeat & Identity */}
      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3" />
          <span>HB:{profile.heartbeatCount}</span>
        </div>
        <Badge variant="outline" className="h-4 px-1.5 text-[8px] border-white/5 text-zinc-500">
          {profile.activeIdentity === 'primary' ? '主' : '辅'}
        </Badge>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(profile.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Family Member Card (Device)
// ============================================================

function DeviceFamilyCard({ member }: { member: DeviceMemberProfile }) {
  const Icon = DEVICE_ICONS[member.deviceId] || HardDrive;
  const color = DEVICE_COLORS[member.deviceId] || 'text-zinc-400';
  const presenceMeta = PRESENCE_META[member.presence];
  const clusterMetrics = useSystemStore(s => s.clusterMetrics);
  const nodeMetrics = clusterMetrics?.[member.deviceId as keyof typeof clusterMetrics];

  return (
    <div className={cn(
      'group relative p-4 rounded-xl border transition-all duration-300',
      'bg-gradient-to-br from-zinc-900/60 to-black/60 hover:from-zinc-900/80 hover:to-zinc-800/40',
      member.presence === 'online'
        ? 'border-white/10 hover:border-white/20'
        : 'border-white/5 opacity-75',
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              member.presence === 'online' ? 'bg-white/10' : 'bg-white/5',
            )}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <div className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900',
              presenceMeta.dot,
              member.presence === 'online' ? 'animate-pulse' : '',
            )} />
          </div>
          <div className="min-w-0">
            <h4 className={cn('text-sm', color)}>{member.nickname}</h4>
            <p className="text-[10px] text-zinc-500">{member.role}</p>
          </div>
        </div>
        <HeartbeatRing status={member.presence} size="sm" />
      </div>

      {/* Signal */}
      <div className="flex items-start gap-2 p-2 bg-black/30 rounded-lg border border-white/5 mb-2">
        <Signal className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-cyan-300/70 italic truncate">
          {member.signalMessage}
        </p>
      </div>

      {/* Metrics (if available from cluster) */}
      {nodeMetrics && typeof nodeMetrics === 'object' && 'cpu' in nodeMetrics && (
        <div className="grid grid-cols-3 gap-1 mb-2">
          <MiniMetric label="CPU" value={`${Math.round(nodeMetrics.cpu)}%`} warn={nodeMetrics.cpu > 70} />
          <MiniMetric label="MEM" value={`${Math.round(nodeMetrics.memory)}%`} warn={nodeMetrics.memory > 80} />
          <MiniMetric label="TMP" value={`${Math.round(nodeMetrics.temperature)}°`} warn={nodeMetrics.temperature > 80} />
        </div>
      )}

      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3" />
          <span>HB:{member.heartbeatCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(member.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, warn }: { label: string; value: string; warn: boolean }) {
  return (
    <div className="text-center p-1 bg-white/5 rounded">
      <div className={cn('text-[10px] font-mono', warn ? 'text-amber-400' : 'text-zinc-400')}>{value}</div>
      <div className="text-[8px] text-zinc-600">{label}</div>
    </div>
  );
}

// ============================================================
// Connection Status Banner
// ============================================================

function ConnectionStatusBanner({ wsStatus, endpoint, totalHeartbeats }: {
  wsStatus: HeartbeatWsStatus;
  endpoint: string;
  totalHeartbeats: number;
}) {
  const meta = WS_STATUS_META[wsStatus];
  const StatusIcon = meta.icon;

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2 rounded-lg border transition-all',
      meta.bg,
      wsStatus === 'connected' ? 'border-green-500/20' : 'border-white/5',
    )}>
      <StatusIcon className={cn('w-4 h-4', meta.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-mono', meta.color)}>{meta.labelZh}</span>
          {wsStatus === 'connected' && (
            <span className="text-[9px] text-zinc-500 font-mono truncate">{endpoint}</span>
          )}
          {wsStatus === 'simulation' && (
            <span className="text-[9px] text-zinc-500 font-mono">Local fallback active</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
        <Zap className="w-3 h-3" />
        <span>{totalHeartbeats} pulses</span>
      </div>
    </div>
  );
}

// ============================================================
// Central Heartbeat Visualization
// ============================================================

function HeartbeatVisualization({
  totalOnline,
  total,
  wsStatus,
}: {
  totalOnline: number;
  total: number;
  wsStatus: HeartbeatWsStatus;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center p-6">
      {/* Central Heart */}
      <div className="relative">
        {/* Outer pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-pink-500/20 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-pink-500/30 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        {/* Heart icon */}
        <div className={cn(
          'relative w-16 h-16 rounded-full flex items-center justify-center border',
          wsStatus === 'connected'
            ? 'bg-gradient-to-br from-pink-500/20 to-red-500/10 border-pink-500/30'
            : 'bg-gradient-to-br from-zinc-500/10 to-zinc-800/20 border-zinc-500/20',
        )}>
          <Heart className={cn(
            'w-8 h-8 animate-pulse',
            wsStatus === 'connected' ? 'text-pink-500' : 'text-pink-500/60',
          )} />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 text-center">
        <div className="text-2xl text-white font-mono">
          <span className="text-pink-400">{totalOnline}</span>
          <span className="text-zinc-600 text-base mx-1">/</span>
          <span className="text-zinc-400 text-base">{total}</span>
        </div>
        <p className="text-[10px] text-zinc-500 font-mono mt-1">FAMILY MEMBERS ONLINE</p>
        <p className="text-[10px] text-pink-400/60 mt-2 italic">
          "信号代表我们都在"
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Main Export: FamilyPresenceBoard
// ============================================================

export function FamilyPresenceBoard() {
  // Phase 20: Real WebSocket heartbeat hook (replaces Phase 19 simulator)
  const {
    agentProfiles,
    deviceMembers,
    wsStatus,
    lastHeartbeat,
    totalHeartbeats,
    endpoint,
  } = useHeartbeatWebSocket();

  const busVersion = useEventBusVersion();

  const agentList = Object.values(agentProfiles);
  const deviceList = Object.values(deviceMembers);
  const totalOnline = agentList.filter(p => p.presence === 'online').length
    + deviceList.filter(m => m.presence === 'online').length;
  const total = agentList.length + deviceList.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl text-white tracking-tight flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
            Family Presence
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            生命不分边界，由心而发，情暖身边
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/5 text-[10px]">
            <Wifi className="w-3 h-3 mr-1" />
            {totalOnline} Online
          </Badge>
          <Badge variant="outline" className="border-zinc-500/20 text-zinc-400 bg-zinc-500/5 text-[10px]">
            <Eye className="w-3 h-3 mr-1" />
            Bus v{busVersion}
          </Badge>
        </div>
      </div>

      {/* Connection Status Banner */}
      <ConnectionStatusBanner
        wsStatus={wsStatus}
        endpoint={endpoint}
        totalHeartbeats={totalHeartbeats}
      />

      {/* Central Heartbeat */}
      <Card className="bg-gradient-to-br from-zinc-900/40 to-black border-pink-500/10">
        <CardContent className="p-0">
          <HeartbeatVisualization
            totalOnline={totalOnline}
            total={total}
            wsStatus={wsStatus}
          />
        </CardContent>
      </Card>

      {/* Agents Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm text-zinc-300 font-mono tracking-wide">AGENT MEMBERS</h3>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-zinc-500 font-mono">
            {agentList.filter(p => p.presence === 'online').length}/{agentList.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {agentList.map(profile => (
            <AgentFamilyCard key={profile.agentId} profile={profile} />
          ))}
        </div>
      </div>

      {/* Devices Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Server className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm text-zinc-300 font-mono tracking-wide">DEVICE MEMBERS</h3>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-zinc-500 font-mono">
            {deviceList.filter(m => m.presence === 'online').length}/{deviceList.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {deviceList.map(member => (
            <DeviceFamilyCard key={member.deviceId} member={member} />
          ))}
        </div>
      </div>

      {/* Mutual Awareness: Who can see whom */}
      <Card className="bg-zinc-900/30 border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Mutual Awareness Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {[...agentList, ...deviceList.map(d => ({
                agentId: d.deviceId,
                presence: d.presence,
                primary: { title: d.nickname },
                secondary: { title: d.role },
                activeIdentity: 'primary' as const,
                signalMessage: d.signalMessage,
                heartbeatCount: d.heartbeatCount,
                lastSeen: d.lastSeen,
              }))].map(member => {
                const id = 'agentId' in member ? member.agentId : '';
                const Icon = AGENT_ICONS[id] || DEVICE_ICONS[id] || Zap;
                const color = AGENT_COLORS[id] || DEVICE_COLORS[id] || 'text-zinc-400';
                const presence = member.presence as PresenceStatus;
                const presenceMeta = PRESENCE_META[presence];
                const name = member.primary?.title || id;

                return (
                  <div
                    key={id}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all min-w-[72px]',
                      presence === 'online'
                        ? 'border-white/10 bg-white/5'
                        : 'border-white/5 bg-black/20 opacity-60',
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn('w-5 h-5', color)} />
                      <div className={cn(
                        'absolute -bottom-0.5 -right-1 w-2 h-2 rounded-full',
                        presenceMeta.dot,
                        presence === 'online' ? 'animate-pulse' : '',
                      )} />
                    </div>
                    <span className="text-[8px] text-zinc-400 font-mono text-center leading-tight truncate max-w-[64px]">
                      {name}
                    </span>
                    <span className={cn('text-[7px] font-mono', presenceMeta.color)}>
                      {presenceMeta.labelZh}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2 text-center italic">
            Every member sees everyone's signal. We are all connected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
