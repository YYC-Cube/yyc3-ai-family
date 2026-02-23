import * as React from 'react';

import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useEventBus, EVENT_CATEGORY_META, type BusEvent, type EventCategory } from '@/lib/event-bus';
import { cn } from '@/lib/utils';

// ============================================================
// LiveLogStream — Phase 18.4 Upgrade
// Now consumes real Event Bus events alongside simulated system logs.
// Five-dimension color-coded: D1(Intelligence) D2(Data) D3(Architecture) D4(Experience) D5(Security)
// ============================================================

interface LogEntry {
  id: string;
  time: string;
  level: string;
  source: string;
  msg: string;
  color: string;
  dimension?: string;
  isReal?: boolean;
}

// Simulated system log templates (ambient background activity)
interface LogTemplate {
  level: string;
  source: string;
  msg: string;
  color: string;
}

const LOG_TEMPLATES: LogTemplate[] = [
  { level: 'INFO', source: 'M4-MAX', msg: 'Optimizing neural weights [Sector 7]...', color: 'text-blue-400' },
  { level: 'INFO', source: 'M4-MAX', msg: 'Allocating tensor cores: 128/256 active.', color: 'text-blue-400' },
  { level: 'OK', source: 'NAS-YYC', msg: 'Volume1 (RAID6) consistency check passed.', color: 'text-green-400' },
  { level: 'DEBUG', source: 'IMAC-M4', msg: 'Render queue flushed: 4.2GB assets.', color: 'text-zinc-500' },
  { level: 'WARN', source: 'NET', msg: 'Latency spike detected in Local Bridge (2ms).', color: 'text-amber-400' },
  { level: 'INFO', source: 'NAS-YYC', msg: 'Syncing distributed ledger to NVMe Cache...', color: 'text-blue-400' },
  { level: 'SEC', source: 'GATEWAY', msg: 'Firewall deflected packet from 192.168.1.x', color: 'text-purple-400' },
  { level: 'AI', source: 'CORE', msg: 'Context window expanding to 32k tokens.', color: 'text-cyan-400' },
  { level: 'SYS', source: 'KERNEL', msg: 'Cluster heartbeat: OK.', color: 'text-zinc-400' },
  { level: 'INFO', source: 'HUAWEI', msg: 'Edge node status: Standby.', color: 'text-zinc-500' },
];

// Map EventBus categories to display properties
function busEventToLogEntry(event: BusEvent): LogEntry {
  const meta = EVENT_CATEGORY_META[event.category];
  const levelMap: Record<string, string> = {
    debug: 'DEBUG', info: 'INFO', warn: 'WARN', error: 'ERR', success: 'OK',
  };

  return {
    id: event.id,
    time: event.timestamp.split('T')[1]?.split('.')[0] || '',
    level: levelMap[event.level] || event.level.toUpperCase(),
    source: `${meta?.dimension || 'SYS'}`,
    msg: event.message,
    color: meta?.color || 'text-zinc-400',
    dimension: meta?.dimension,
    isReal: true,
  };
}

// Category filter buttons
const FILTER_OPTIONS: { id: 'all' | EventCategory; label: string; color: string }[] = [
  { id: 'all', label: 'ALL', color: 'text-white' },
  { id: 'orchestrate', label: 'D1', color: 'text-cyan-400' },
  { id: 'persist', label: 'D2', color: 'text-green-400' },
  { id: 'mcp', label: 'D3', color: 'text-amber-400' },
  { id: 'system', label: 'SYS', color: 'text-zinc-400' },
  { id: 'security', label: 'D5', color: 'text-red-400' },
];

export function LiveLogStream({ className, speed = 2500 }: { className?: string; speed?: number }) {
  const [simLogs, setSimLogs] = React.useState<LogEntry[]>([]);
  const [filter, setFilter] = React.useState<'all' | EventCategory>('all');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Subscribe to real Event Bus events
  const busEvents = useEventBus(
    filter !== 'all' ? { category: filter } : undefined,
    80,
  );

  // Generate ambient simulated logs
  const generateLog = React.useCallback((): LogEntry => {
    const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];

    return {
      id: Math.random().toString(36).substring(2, 11),
      time: new Date().toISOString().split('T')[1].split('.')[0],
      ...template,
      dimension: 'SYS',
      isReal: false,
    };
  }, []);

  React.useEffect(() => {
    setSimLogs(Array.from({ length: 3 }, () => generateLog()));

    const interval = setInterval(() => {
      setSimLogs(prev => {
        const newLog = generateLog();
        const newLogs = [...prev, newLog];

        if (newLogs.length > 30) newLogs.shift();

        return newLogs;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [speed, generateLog]);

  // Merge simulated + real events, sorted by time
  const allLogs = React.useMemo(() => {
    const realEntries = busEvents.map(busEventToLogEntry);

    // If filtering to a specific category, don't show sim logs
    if (filter !== 'all' && filter !== 'system') {
      return realEntries.slice(-50);
    }

    // Merge and sort by time (newest last)
    const merged = [...simLogs, ...realEntries];

    merged.sort((a, b) => a.time.localeCompare(b.time));

    return merged.slice(-60);
  }, [simLogs, busEvents, filter]);

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');

      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [allLogs]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Filter bar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/5 shrink-0">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={cn(
              'px-1.5 py-0.5 text-[8px] font-mono rounded transition-colors',
              filter === opt.id
                ? `${opt.color} bg-white/10`
                : 'text-zinc-600 hover:text-zinc-400',
            )}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-[8px] text-zinc-700 font-mono">
          {busEvents.length} events
        </span>
      </div>

      {/* Log stream */}
      <ScrollArea className="flex-1 font-mono text-[10px] md:text-xs" ref={scrollRef}>
        <div className="flex flex-col gap-0.5 p-2">
          {allLogs.map(log => (
            <div
              key={log.id}
              className={cn(
                'flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300',
                log.isReal && 'bg-white/[0.02] rounded px-1 -mx-1',
              )}
            >
              <span className="text-zinc-600 shrink-0">[{log.time}]</span>
              <span className={cn(
                'w-6 shrink-0 text-right font-mono',
                log.dimension === 'D1' ? 'text-cyan-500' :
                log.dimension === 'D2' ? 'text-green-500' :
                log.dimension === 'D3' ? 'text-amber-500' :
                log.dimension === 'D5' ? 'text-red-500' :
                'text-zinc-600',
              )}>
                {log.dimension || 'SYS'}
              </span>
              <span className={cn('w-12 shrink-0 text-right pr-1', log.color)}>
                {log.level}
              </span>
              <span className={cn(
                'truncate',
                log.isReal ? 'text-zinc-200' : 'text-zinc-400',
              )}>
                {log.msg}
              </span>
            </div>
          ))}
          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  );
}
