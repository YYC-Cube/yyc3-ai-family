import {
  Brain, Cpu, Shield, ChevronRight,
  TerminalSquare, Eye, EyeOff, Maximize2, Minimize2,
  Network,
  ArrowUpRight, Database, Radio,
} from 'lucide-react';
import * as React from 'react';

import { eventBus } from '@/lib/event-bus';
import { useTranslation } from '@/lib/i18n';
import { useSystemStore } from '@/lib/store';
import { AGENT_REGISTRY } from '@/lib/types';
import { cn } from '@/lib/utils';

// ============================================================
// NeuralLinkOverlay — Real-time Collaboration HUD
//
// A floating heads-up display providing constant system awareness:
//   - System health pulse (optimal/warning/critical)
//   - Active agent indicator
//   - Streaming status
//   - Event bus live feed (last 5 events)
//   - Quick-nav breadcrumb
//   - Hardware vitals mini-bars
//   - Keyboard shortcut hints
//
// Design: "Neural Link = 人机神经链接, always-on awareness"
// ============================================================

// --- Compact Mini-Bar Component ---
function MiniBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex items-center gap-1.5 group" title={`${label}: ${value.toFixed(1)}%`}>
      <span className="text-[8px] font-mono text-zinc-500 w-6 text-right uppercase tracking-wider">{label}</span>
      <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[8px] font-mono text-zinc-500 w-7">{pct.toFixed(0)}%</span>
    </div>
  );
}

// --- Pulse Dot ---
function PulseDot({ status }: { status: 'optimal' | 'warning' | 'critical' | 'booting' }) {
  const colors = {
    optimal: 'bg-emerald-500 shadow-emerald-500/50',
    warning: 'bg-amber-500 shadow-amber-500/50',
    critical: 'bg-red-500 shadow-red-500/50',
    booting: 'bg-sky-500 shadow-sky-500/50',
  };

  return (
    <div className="relative">
      <div className={cn('w-2 h-2 rounded-full shadow-[0_0_6px]', colors[status])} />
      <div className={cn('absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40', colors[status])} />
    </div>
  );
}

// --- Event Feed Item ---
function EventItem({ event }: { event: { level: string; source: string; message: string; timestamp: string } }) {
  const levelColors: Record<string, string> = {
    info: 'text-sky-400',
    success: 'text-emerald-400',
    warn: 'text-amber-400',
    error: 'text-red-400',
    debug: 'text-zinc-500',
  };

  return (
    <div className="flex items-start gap-1.5 text-[9px] font-mono leading-tight py-0.5 animate-in fade-in slide-in-from-right-2 duration-300">
      <span className={cn('shrink-0 mt-0.5', levelColors[event.level] || 'text-zinc-500')}>
        {event.level === 'error' ? '!' : event.level === 'warn' ? '~' : event.level === 'success' ? '+' : '-'}
      </span>
      <span className="text-zinc-600 shrink-0">{event.source.slice(0, 8)}</span>
      <span className="text-zinc-400 truncate">{event.message.slice(0, 50)}</span>
    </div>
  );
}

// --- Main Component ---
export function NeuralLinkOverlay() {
  const { t: _t, language } = useTranslation();
  const status = useSystemStore(s => s.status);
  const cpuLoad = useSystemStore(s => s.cpuLoad);
  const latency = useSystemStore(s => s.latency);
  const isStreaming = useSystemStore(s => s.isStreaming);
  const activeView = useSystemStore(s => s.activeView);
  const consoleTab = useSystemStore(s => s.consoleTab);
  const consoleAgent = useSystemStore(s => s.consoleAgent);
  const chatMode = useSystemStore(s => s.chatMode);
  const clusterMetrics = useSystemStore(s => s.clusterMetrics);
  const dbConnected = useSystemStore(s => s.dbConnected);
  const messages = useSystemStore(s => s.messages);
  const isMobile = useSystemStore(s => s.isMobile);
  const setActiveView = useSystemStore(s => s.setActiveView);
  const navigateToConsoleTab = useSystemStore(s => s.navigateToConsoleTab);
  const navigateToAgent = useSystemStore(s => s.navigateToAgent);

  // HUD visibility state
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [eventFeed, setEventFeed] = React.useState<{
    id: string; level: string; source: string; message: string; timestamp: string;
  }[]>([]);

  // Subscribe to Event Bus for live feed
  React.useEffect(() => {
    const subId = eventBus.on(event => {
      setEventFeed(prev => [
        { id: event.id, level: event.level, source: event.source, message: event.message, timestamp: event.timestamp },
        ...prev.slice(0, 4),
      ]);
    });

    return () => { eventBus.off(subId); };
  }, []);

  // Keyboard toggle: Ctrl+H for HUD
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Don't render on mobile
  if (isMobile) return null;
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 w-8 h-8 rounded-full bg-black/80 border border-zinc-700/50 flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary/30 transition-all hover:scale-110 backdrop-blur-md group"
        title="Show Neural Link HUD (Ctrl+H)"
      >
        <Eye className="w-3.5 h-3.5 group-hover:animate-pulse" />
      </button>
    );
  }

  // Derive active agent info
  const activeAgent = consoleAgent
    ? AGENT_REGISTRY.find(a => a.id === consoleAgent)
    : null;

  // Derive metrics
  const m4Metrics = clusterMetrics?.['m4-max'];
  const memUsage = m4Metrics?.memory ?? 42;
  const diskUsage = m4Metrics?.disk ?? 35;
  const netUsage = m4Metrics?.network ?? 15;
  const temp = m4Metrics?.temperature ?? 48;

  // View label
  const viewLabels: Record<string, string> = {
    terminal: language === 'zh' ? '终端' : 'Terminal',
    console: language === 'zh' ? '控制台' : 'Console',
    projects: language === 'zh' ? '项目' : 'Projects',
    monitor: language === 'zh' ? '监控' : 'Monitor',
    artifacts: language === 'zh' ? '产物' : 'Artifacts',
    services: language === 'zh' ? '服务' : 'Services',
    knowledge: language === 'zh' ? '知识库' : 'Knowledge',
    bookmarks: language === 'zh' ? '收藏' : 'Bookmarks',
  };

  const statusLabels: Record<string, string> = {
    optimal: 'OPTIMAL',
    warning: 'WARNING',
    critical: 'CRITICAL',
    booting: 'BOOTING',
  };

  return (
    <div className={cn(
      'fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
      isExpanded
        ? 'bottom-4 right-4 w-[320px]'
        : 'bottom-4 right-4 w-[200px]',
    )}>
      {/* Main HUD Panel */}
      <div className={cn(
        'bg-black/85 backdrop-blur-xl border rounded-xl overflow-hidden transition-all duration-300',
        status === 'optimal' ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]' :
        status === 'warning' ? 'border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.08)]' :
        status === 'critical' ? 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]' :
        'border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.08)]',
      )}>
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <PulseDot status={status} />
            <span className="text-[9px] font-mono text-zinc-300 tracking-widest">
              NEURAL_LINK
            </span>
            {isStreaming && (
              <span className="text-[8px] font-mono text-sky-400 animate-pulse flex items-center gap-0.5">
                <Radio className="w-2.5 h-2.5" />
                STREAM
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
              title="Hide HUD (Ctrl+H)"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* System Status Row */}
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="flex-1">
            {/* Breadcrumb: View > Tab > Agent */}
            <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-400 mb-1">
              <button
                className="text-zinc-300 hover:text-primary transition-colors cursor-pointer"
                onClick={() => {
                  setActiveView(activeView as any);
                  eventBus.emit({ category: 'ui', type: 'ui.hud_navigate', level: 'info', source: 'NeuralLink', message: `HUD nav: view=${activeView}` });
                }}
                title={`Navigate to ${activeView}`}
              >
                {viewLabels[activeView] || activeView}
              </button>
              {activeView === 'console' && (
                <>
                  <ChevronRight className="w-2.5 h-2.5 text-zinc-600" />
                  <button
                    className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    onClick={() => {
                      navigateToConsoleTab(consoleTab);
                      eventBus.emit({ category: 'ui', type: 'ui.hud_navigate', level: 'info', source: 'NeuralLink', message: `HUD nav: console/${consoleTab}` });
                    }}
                    title={`Navigate to ${consoleTab}`}
                  >
                    {consoleTab}
                  </button>
                </>
              )}
              {activeAgent && (
                <>
                  <ChevronRight className="w-2.5 h-2.5 text-zinc-600" />
                  <button
                    className={cn(activeAgent.color, 'hover:opacity-80 transition-opacity cursor-pointer')}
                    onClick={() => {
                      navigateToAgent(activeAgent.id);
                      eventBus.emit({ category: 'ui', type: 'ui.hud_navigate', level: 'info', source: 'NeuralLink', message: `HUD nav: agent=${activeAgent.id}` });
                    }}
                    title={`Navigate to ${activeAgent.nameEn}`}
                  >
                    {language === 'zh' ? activeAgent.name : activeAgent.nameEn}
                  </button>
                </>
              )}
            </div>

            {/* Status + Mode */}
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-[8px] font-mono tracking-widest px-1.5 py-0.5 rounded',
                status === 'optimal' ? 'text-emerald-400 bg-emerald-500/10' :
                status === 'warning' ? 'text-amber-400 bg-amber-500/10' :
                status === 'critical' ? 'text-red-400 bg-red-500/10' :
                'text-sky-400 bg-sky-500/10',
              )}>
                {statusLabels[status]}
              </span>
              <span className={cn(
                'text-[8px] font-mono tracking-wider px-1.5 py-0.5 rounded',
                chatMode === 'ai'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-amber-400 bg-amber-500/10',
              )}>
                {chatMode === 'ai' ? 'AI_MODE' : 'NAV_MODE'}
              </span>
              {dbConnected && (
                <Database className="w-3 h-3 text-emerald-500" />
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="text-right">
            <div className="text-[9px] font-mono text-zinc-400">
              <span className="text-primary">{latency}</span>ms
            </div>
            <div className="text-[8px] font-mono text-zinc-600">
              {messages.length} msgs
            </div>
          </div>
        </div>

        {/* Hardware Vitals Mini-Bars */}
        <div className="px-3 pb-2 space-y-0.5">
          <MiniBar value={cpuLoad} max={100} color={cpuLoad > 80 ? 'bg-red-500' : cpuLoad > 60 ? 'bg-amber-500' : 'bg-emerald-500'} label="CPU" />
          <MiniBar value={memUsage} max={100} color={memUsage > 85 ? 'bg-red-500' : memUsage > 70 ? 'bg-amber-500' : 'bg-sky-500'} label="MEM" />
          {isExpanded && (
            <>
              <MiniBar value={diskUsage} max={100} color="bg-violet-500" label="DSK" />
              <MiniBar value={netUsage} max={100} color="bg-cyan-500" label="NET" />
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono text-zinc-500 w-6 text-right uppercase tracking-wider">TMP</span>
                <span className={cn(
                  'text-[9px] font-mono',
                  temp > 85 ? 'text-red-400' : temp > 70 ? 'text-amber-400' : 'text-zinc-400',
                )}>
                  {temp}C
                </span>
              </div>
            </>
          )}
        </div>

        {/* Expanded: Live Event Feed */}
        {isExpanded && (
          <div className="border-t border-white/5 px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                EVENT_STREAM
              </span>
              <span className="text-[8px] font-mono text-zinc-700">{eventFeed.length}/5</span>
            </div>
            <div className="space-y-0 min-h-[50px]">
              {eventFeed.length === 0 ? (
                <div className="text-[9px] font-mono text-zinc-700 py-2 text-center">
                  {language === 'zh' ? '等待事件...' : 'Awaiting events...'}
                </div>
              ) : (
                eventFeed.map(e => <EventItem key={e.id} event={e} />)
              )}
            </div>
          </div>
        )}

        {/* Expanded: Active Agent Card */}
        {isExpanded && activeAgent && (
          <div className="border-t border-white/5 px-3 py-2">
            <button
              className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
              onClick={() => {
                navigateToAgent(activeAgent.id);
                eventBus.emit({ category: 'ui', type: 'ui.hud_agent_click', level: 'info', source: 'NeuralLink', message: `Agent clicked: ${activeAgent.id}` });
              }}
              title={`Go to ${activeAgent.nameEn} console`}
            >
              <div className={cn(
                'w-6 h-6 rounded flex items-center justify-center border',
                activeAgent.bgColor, activeAgent.borderColor,
              )}>
                <Brain className={cn('w-3.5 h-3.5', activeAgent.color)} />
              </div>
              <div className="flex-1">
                <div className={cn('text-[10px] font-mono', activeAgent.color)}>
                  {language === 'zh' ? activeAgent.name : activeAgent.nameEn}
                </div>
                <div className="text-[8px] text-zinc-600">
                  {language === 'zh' ? activeAgent.desc : activeAgent.descEn}
                </div>
              </div>
              <ArrowUpRight className="w-3 h-3 text-zinc-700" />
            </button>
          </div>
        )}

        {/* Expanded: Quick Navigation */}
        {isExpanded && (
          <div className="border-t border-white/5 px-3 py-1.5 flex items-center gap-1">
            {[
              { icon: Cpu, label: 'HW', tab: 'hardware_monitor', color: 'text-violet-400' },
              { icon: TerminalSquare, label: 'DevOps', tab: 'devops', color: 'text-emerald-400' },
              { icon: Shield, label: 'Sec', tab: 'security_audit', color: 'text-red-400' },
              { icon: Network, label: 'MCP', tab: 'mcp', color: 'text-pink-400' },
            ].map(q => (
              <button
                key={q.tab}
                onClick={() => {
                  navigateToConsoleTab(q.tab);
                  eventBus.emit({ category: 'ui', type: 'ui.hud_quicknav', level: 'info', source: 'NeuralLink', message: `Quick nav: ${q.tab}` });
                }}
                className={cn(
                  'flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono transition-all hover:bg-white/5',
                  q.color,
                )}
                title={`Open ${q.label}`}
              >
                <q.icon className="w-2.5 h-2.5" />
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Expanded: Keyboard Shortcuts */}
        {isExpanded && (
          <div className="border-t border-white/5 px-3 py-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {[
              { keys: '⌘M', label: language === 'zh' ? '模式' : 'Mode' },
              { keys: '⌘K', label: language === 'zh' ? '搜索' : 'Search' },
              { keys: '⌘H', label: 'HUD' },
              { keys: '/', label: language === 'zh' ? '命令' : 'Cmd' },
            ].map(s => (
              <div key={s.keys} className="flex items-center gap-1 text-[8px] font-mono text-zinc-600">
                <kbd className="px-1 py-0.5 bg-zinc-800/80 rounded border border-zinc-700/50 text-[7px] text-zinc-400">{s.keys}</kbd>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Scanline Effect */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </div>
  );
}