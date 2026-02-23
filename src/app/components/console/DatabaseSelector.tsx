import {
  Database, X, Check, AlertTriangle, Loader2,
  ChevronDown, Shield, Zap, GripHorizontal,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/app/components/ui/button';
import { testSQLiteConnection, loadSQLiteConfig, saveSQLiteConfig, type NasSQLiteConfig } from '@/lib/nas-client';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// === Draggable hook for popover panels ===
function useDraggable(enabled: boolean) {
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const isDragging = React.useRef(false);
  const dragOffset = React.useRef({ x: 0, y: 0 });
  const panelRef = React.useRef<HTMLDivElement>(null);

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    if (!enabled || !panelRef.current) return;
    isDragging.current = true;
    const rect = panelRef.current.getBoundingClientRect();

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [enabled]);

  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pw = panelRef.current?.offsetWidth || 0;
    const ph = panelRef.current?.offsetHeight || 0;
    // Clamp within viewport
    const newX = Math.max(0, Math.min(vw - pw, e.clientX - dragOffset.current.x));
    const newY = Math.max(0, Math.min(vh - ph, e.clientY - dragOffset.current.y));

    setPosition({ x: newX, y: newY });
  }, []);

  const handlePointerUp = React.useCallback(() => {
    isDragging.current = false;
  }, []);

  const reset = React.useCallback(() => setPosition(null), []);

  return {
    panelRef,
    position,
    reset,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
  };
}

// --- Database & Cache Types ---

interface DBOption {
  id: string;
  name: string;
  type: 'relational' | 'nosql' | 'cache' | 'search' | 'timeseries';
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  defaultPort: number;
  desc: string;
}

interface ValidationResult {
  status: 'idle' | 'validating' | 'success' | 'error';
  message: string;
}

const DB_OPTIONS: DBOption[] = [
  // Relational
  { id: 'postgresql', name: 'PostgreSQL', type: 'relational', icon: 'PG', color: 'text-blue-400', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/10', defaultPort: 5432, desc: 'ACID-compliant relational DB' },
  { id: 'mysql', name: 'MySQL', type: 'relational', icon: 'My', color: 'text-orange-400', borderColor: 'border-orange-500/30', bgColor: 'bg-orange-500/10', defaultPort: 3306, desc: 'Widely-used open-source RDBMS' },
  { id: 'mariadb', name: 'MariaDB', type: 'relational', icon: 'Ma', color: 'text-amber-400', borderColor: 'border-amber-500/30', bgColor: 'bg-amber-500/10', defaultPort: 3306, desc: 'MySQL-compatible fork' },
  { id: 'sqlite', name: 'SQLite', type: 'relational', icon: 'SL', color: 'text-sky-400', borderColor: 'border-sky-500/30', bgColor: 'bg-sky-500/10', defaultPort: 0, desc: 'Embedded zero-config database' },
  // NoSQL
  { id: 'mongodb', name: 'MongoDB', type: 'nosql', icon: 'MG', color: 'text-green-400', borderColor: 'border-green-500/30', bgColor: 'bg-green-500/10', defaultPort: 27017, desc: 'Document-oriented NoSQL' },
  { id: 'cassandra', name: 'Cassandra', type: 'nosql', icon: 'CA', color: 'text-teal-400', borderColor: 'border-teal-500/30', bgColor: 'bg-teal-500/10', defaultPort: 9042, desc: 'Wide-column distributed store' },
  // Cache
  { id: 'redis', name: 'Redis', type: 'cache', icon: 'RD', color: 'text-red-400', borderColor: 'border-red-500/30', bgColor: 'bg-red-500/10', defaultPort: 6379, desc: 'In-memory key-value cache' },
  { id: 'memcached', name: 'Memcached', type: 'cache', icon: 'MC', color: 'text-emerald-400', borderColor: 'border-emerald-500/30', bgColor: 'bg-emerald-500/10', defaultPort: 11211, desc: 'High-perf distributed caching' },
  { id: 'dragonfly', name: 'Dragonfly', type: 'cache', icon: 'DF', color: 'text-violet-400', borderColor: 'border-violet-500/30', bgColor: 'bg-violet-500/10', defaultPort: 6379, desc: 'Redis-compatible modern cache' },
  // Search & TimeSeries
  { id: 'elasticsearch', name: 'Elasticsearch', type: 'search', icon: 'ES', color: 'text-yellow-400', borderColor: 'border-yellow-500/30', bgColor: 'bg-yellow-500/10', defaultPort: 9200, desc: 'Full-text search engine' },
  { id: 'clickhouse', name: 'ClickHouse', type: 'timeseries', icon: 'CH', color: 'text-pink-400', borderColor: 'border-pink-500/30', bgColor: 'bg-pink-500/10', defaultPort: 8123, desc: 'Column-oriented OLAP engine' },
];

const TYPE_LABELS: Record<string, string> = {
  relational: 'Relational DB',
  nosql: 'NoSQL',
  cache: 'Cache / KV',
  search: 'Search Engine',
  timeseries: 'OLAP / TimeSeries',
};

// Mock projects
const MOCK_PROJECTS = [
  { id: 'yyc3-core', name: 'yyc3-core' },
  { id: 'yyc3-gateway', name: 'yyc3-gateway' },
  { id: 'yyc3-agent-runtime', name: 'yyc3-agent-runtime' },
  { id: 'yyc3-data-pipeline', name: 'yyc3-data-pipeline' },
  { id: 'yyc3-monitor', name: 'yyc3-monitor' },
];

const STORAGE_KEY = 'yyc3-db-selector-state';

interface StoredDBState {
  selectedDB: string | null;
  selectedProject: string;
  host: string;
  port: string;
  validated: boolean;
}

function loadDBState(): StoredDBState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  return null;
}

function saveDBState(state: StoredDBState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function DatabaseSelector() {
  const stored = React.useMemo(() => loadDBState(), []);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDB, setSelectedDB] = React.useState<string | null>(stored?.selectedDB ?? null);
  const [selectedProject, setSelectedProject] = React.useState<string>(stored?.selectedProject ?? 'yyc3-core');
  const [host, setHost] = React.useState(stored?.host ?? 'localhost');
  const [port, setPort] = React.useState(stored?.port ?? '');
  const [validation, setValidation] = React.useState<ValidationResult>(
    stored?.validated
      ? { status: 'success', message: `Restored from local storage — previously validated.` }
      : { status: 'idle', message: '' },
  );
  const [showProjectDropdown, setShowProjectDropdown] = React.useState(false);
  const [filterType, setFilterType] = React.useState<string>('all');
  const addLog = useSystemStore(s => s.addLog);
  const setDbConnected = useSystemStore(s => s.setDbConnected);
  const isMobile = useSystemStore(s => s.isMobile);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const { panelRef, position, reset: resetDrag, dragHandlers } = useDraggable(isOpen && !isMobile);

  // Restore dbConnected on mount if previously validated
  React.useEffect(() => {
    if (stored?.validated) {
      setDbConnected(true);
    }
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  // Persist state changes to localStorage
  React.useEffect(() => {
    saveDBState({
      selectedDB,
      selectedProject,
      host,
      port,
      validated: validation.status === 'success',
    });
  }, [selectedDB, selectedProject, host, port, validation.status]);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      // Check both the trigger container and the draggable panel
      const clickedTrigger = popoverRef.current?.contains(e.target as Node);
      const clickedPanel = panelRef.current?.contains(e.target as Node);

      if (!clickedTrigger && !clickedPanel) {
        setIsOpen(false);
        resetDrag();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, resetDrag]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fill port when DB selected
  React.useEffect(() => {
    if (selectedDB) {
      const db = DB_OPTIONS.find(d => d.id === selectedDB);

      if (db) {
        if (selectedDB === 'sqlite') {
          // Auto-fill NAS SQLite defaults
          const sqliteConfig = loadSQLiteConfig();

          setHost(sqliteConfig.host);
          setPort(sqliteConfig.port.toString());
        } else {
          setPort(db.defaultPort > 0 ? db.defaultPort.toString() : 'N/A');
        }
      }
    }
  }, [selectedDB]);

  const handleValidate = async () => {
    if (!selectedDB) {
      setValidation({ status: 'error', message: 'Please select a database type first.' });

      return;
    }
    setValidation({ status: 'validating', message: 'Validating connection...' });

    const db = DB_OPTIONS.find(d => d.id === selectedDB);

    // === Real NAS SQLite validation ===
    if (selectedDB === 'sqlite') {
      const sqliteConfig: NasSQLiteConfig = {
        host: host || '192.168.3.45',
        port: parseInt(port) || 8484,
        dbPath: '/Volume2/yyc3/yyc3.db',
      };

      try {
        const result = await testSQLiteConnection(sqliteConfig);

        if (result.success) {
          saveSQLiteConfig(sqliteConfig);
          setValidation({
            status: 'success',
            message: `SQLite ${result.version} @ ${host}:${port} — Connected (${result.latencyMs}ms)`,
          });
          addLog('success', 'DB_SELECTOR', `NAS SQLite connected: v${result.version} (${result.latencyMs}ms)`);
          setDbConnected(true);
        } else {
          // NAS unreachable — fallback to localStorage mock
          setValidation({
            status: 'success',
            message: `SQLite @ NAS unreachable — using localStorage fallback. ${result.error?.slice(0, 60)}`,
          });
          addLog('warn', 'DB_SELECTOR', `NAS SQLite unreachable, localStorage fallback active`);
          setDbConnected(true);
        }
      } catch {
        setValidation({
          status: 'success',
          message: 'SQLite — localStorage fallback mode (NAS offline)',
        });
        addLog('warn', 'DB_SELECTOR', 'NAS offline, using localStorage as SQLite fallback');
        setDbConnected(true);
      }

      return;
    }

    // === Other databases: attempt real HTTP connection ===
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const url = `http://${host}:${port}/`;

      await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
      clearTimeout(timeout);
      setValidation({ status: 'success', message: `${db?.name} @ ${host}:${port} — Endpoint reachable.` });
      addLog('success', 'DB_SELECTOR', `Validated ${db?.name} connection for project ${selectedProject}`);
      setDbConnected(true);
    } catch {
      // Endpoint unreachable — still allow with mock
      if (host && port) {
        setValidation({ status: 'success', message: `${db?.name} @ ${host}:${port} — Accepted (endpoint not verified).` });
        addLog('info', 'DB_SELECTOR', `${db?.name} config saved (endpoint not verified)`);
        setDbConnected(true);
      } else {
        setValidation({ status: 'error', message: 'Host and port are required.' });
      }
    }
  };

  const handleApply = () => {
    if (validation.status !== 'success') {
      handleValidate();

      return;
    }
    const db = DB_OPTIONS.find(d => d.id === selectedDB);

    addLog('success', 'DB_SELECTOR', `Applied ${db?.name} to project: ${selectedProject}`);
    setIsOpen(false);
    resetDrag();
  };

  const filteredDBs = DB_OPTIONS.filter(db => filterType === 'all' || db.type === filterType);
  const typeGroups = [...new Set(filteredDBs.map(db => db.type))];

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-mono transition-all cursor-pointer',
          'hover:scale-105 active:scale-95',
          isOpen
            ? 'bg-primary/20 border border-primary/40 text-primary shadow-[0_0_10px_rgba(14,165,233,0.2)]'
            : 'bg-zinc-800/50 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10',
        )}
      >
        <Database className="w-3 h-3" />
        DB_SELECT
      </button>

      {/* Mobile backdrop */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-150"
          onClick={() => { setIsOpen(false); resetDrag(); }}
        />
      )}

      {/* Popup — draggable on desktop, centered on mobile */}
      {isOpen && (
        <div
          ref={panelRef}
          className={cn(
            'bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col',
            isMobile
              ? 'fixed left-2 right-2 top-[10dvh] bottom-[10dvh] max-h-[80dvh]'
              : position
                ? 'fixed'
                : 'absolute top-full right-0 mt-2',
          )}
          style={
            !isMobile && position
              ? { left: position.x, top: position.y, width: 420, maxHeight: 520 }
              : !isMobile
                ? { width: 420, maxHeight: 520 }
                : undefined
          }
        >
          {/* Header — drag handle on desktop */}
          <div
            className={cn(
              'flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900/50 shrink-0',
              !isMobile && 'cursor-grab active:cursor-grabbing select-none',
            )}
            {...(!isMobile ? dragHandlers : {})}
          >
            <div className="flex items-center gap-2">
              {!isMobile && <GripHorizontal className="w-3.5 h-3.5 text-zinc-600" />}
              <Database className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-white tracking-wider">DATABASE_PROVISIONER</span>
            </div>
            <button onClick={() => { setIsOpen(false); resetDrag(); }} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Project Selector */}
          <div className="px-4 py-2.5 border-b border-white/5 bg-zinc-900/30">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1 block">Target Project</label>
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs font-mono text-zinc-200 hover:border-white/20 transition-colors"
              >
                <span>{selectedProject}</span>
                <ChevronDown className={cn('w-3 h-3 text-zinc-500 transition-transform', showProjectDropdown && 'rotate-180')} />
              </button>
              {showProjectDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-md z-10 overflow-hidden">
                  {MOCK_PROJECTS.map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => { setSelectedProject(proj.id); setShowProjectDropdown(false); }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-white/5 transition-colors',
                        selectedProject === proj.id ? 'text-primary bg-primary/5' : 'text-zinc-300',
                      )}
                    >
                      {proj.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Type Filter Tabs */}
          <div className="px-4 py-2 border-b border-white/5 flex gap-1 overflow-x-auto">
            {['all', 'relational', 'nosql', 'cache', 'search', 'timeseries'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap transition-colors',
                  filterType === type
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-white/5',
                )}
              >
                {type === 'all' ? 'ALL' : TYPE_LABELS[type]?.toUpperCase() || type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* DB Grid */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {typeGroups.map(type => (
              <div key={type}>
                <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1.5 px-1">
                  {TYPE_LABELS[type]}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredDBs.filter(db => db.type === type).map(db => (
                    <button
                      key={db.id}
                      onClick={() => { setSelectedDB(db.id); setValidation({ status: 'idle', message: '' }); }}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all text-left group',
                        selectedDB === db.id
                          ? cn(db.borderColor, db.bgColor, 'shadow-lg')
                          : 'border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-white/10',
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded flex items-center justify-center shrink-0 text-[10px] font-mono transition-colors',
                        selectedDB === db.id
                          ? cn(db.bgColor, db.color, 'border', db.borderColor)
                          : 'bg-zinc-800/50 text-zinc-500 border border-white/5 group-hover:text-zinc-300',
                      )}>
                        {db.icon}
                      </div>
                      <div className="min-w-0">
                        <div className={cn(
                          'text-xs font-mono truncate',
                          selectedDB === db.id ? db.color : 'text-zinc-300',
                        )}>
                          {db.name}
                        </div>
                        <div className="text-[9px] text-zinc-600 truncate">{db.desc}</div>
                      </div>
                      {selectedDB === db.id && (
                        <Check className={cn('w-3.5 h-3.5 shrink-0 ml-auto', db.color)} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Connection Config */}
          {selectedDB && (
            <div className="px-4 py-3 border-t border-white/5 bg-zinc-900/40 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[9px] font-mono text-zinc-500 block mb-0.5">HOST</label>
                  <input
                    value={host}
                    onChange={e => setHost(e.target.value)}
                    className="w-full px-2 py-1 bg-black/50 border border-white/10 rounded text-xs font-mono text-zinc-200 focus:outline-none focus:border-primary/50"
                    placeholder="localhost"
                  />
                </div>
                <div className="w-20">
                  <label className="text-[9px] font-mono text-zinc-500 block mb-0.5">PORT</label>
                  <input
                    value={port}
                    onChange={e => setPort(e.target.value)}
                    className="w-full px-2 py-1 bg-black/50 border border-white/10 rounded text-xs font-mono text-zinc-200 focus:outline-none focus:border-primary/50"
                    placeholder="5432"
                  />
                </div>
              </div>

              {/* Validation Status */}
              {validation.status !== 'idle' && (
                <div className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded text-[10px] font-mono',
                  validation.status === 'validating' && 'bg-primary/5 text-primary border border-primary/20',
                  validation.status === 'success' && 'bg-green-500/5 text-green-400 border border-green-500/20',
                  validation.status === 'error' && 'bg-red-500/5 text-red-400 border border-red-500/20',
                )}>
                  {validation.status === 'validating' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {validation.status === 'success' && <Check className="w-3 h-3" />}
                  {validation.status === 'error' && <AlertTriangle className="w-3 h-3" />}
                  <span>{validation.message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-[10px] font-mono border-white/10 text-zinc-300 hover:text-white gap-1.5"
                  onClick={handleValidate}
                  disabled={validation.status === 'validating'}
                >
                  {validation.status === 'validating' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Shield className="w-3 h-3" />
                  )}
                  VALIDATE
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-7 text-[10px] font-mono bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                  onClick={handleApply}
                  disabled={validation.status === 'validating'}
                >
                  <Zap className="w-3 h-3" />
                  APPLY_TO_PROJECT
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}