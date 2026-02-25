// ============================================================
// YYC3 Hacker Chatbot — Smart Knowledge Base
// Phase 19.3 → Phase 20.2: NAS SQLite Persistence
// Phase 32: Export/Import + AI Summary + Fuzzy Search
//
// Phase 20 Upgrades:
// - CRUD operations routed through persistence-engine.ts
// - Dual-write: localStorage + NAS SQLite (when available)
// - Async load/save with loading states
// - Event Bus integration for knowledge operations
// - Persistence status indicator
//
// Phase 32 Enhancements:
// - JSON Export/Import with validation & merge
// - LLM Bridge auto-summary generation (streaming)
// - Fuzzy search with keyword highlighting
// - NAS backend interface stubs (vector search, OCR/ASR, KG NER)
//
// Features:
// - Knowledge entries with categories, tags, and agent links
// - Full-text search
// - Category filters
// - Create/Edit/Delete entries (persisted to NAS)
// - Agent association
// - Importance levels
// ============================================================

import {
  BookOpen, Search, Plus, Edit3, Trash2, Brain,
  Shield, Terminal, Layers, Award, Bug, Heart, X, Check,
  ChevronDown, Clock, Eye, Sparkles,
  Database, Loader2, CloudOff, Cloud, Download, Upload,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  type KnowledgeEntry,
  type KnowledgeCategory,
  KNOWLEDGE_CATEGORY_META,
  loadKnowledgeBase,
  saveKnowledgeBase,
} from '@/lib/agent-identity';
import { AGENT_CAPABILITIES } from '@/lib/agent-orchestrator';
import { eventBus } from '@/lib/event-bus';
import {
  exportKnowledgeJSON,
  pickJSONFile,
  parseImportJSON,
  mergeEntries,
  fuzzySearchEntries,
  getHighlightSegments,
  canGenerateSummary,
  generateEntrySummary,
  type KBImportResult,
} from '@/lib/kb-utils';
import {
  readKnowledgeEntries,
  writeKnowledgeEntries,
  upsertKnowledgeEntry,
  deleteKnowledgeEntry as deleteKnowledgeFromEngine,
  getPersistenceEngine,
} from '@/lib/persistence-engine';
import { cn } from '@/lib/utils';

// ============================================================
// Icon Map for Categories
// ============================================================

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  architecture: Layers,
  devops: Terminal,
  security: Shield,
  'ai-ml': Brain,
  'best-practice': Award,
  troubleshooting: Bug,
  family: Heart,
  general: BookOpen,
};

const IMPORTANCE_META: Record<string, { color: string; bg: string; label: string }> = {
  low: { color: 'text-zinc-400', bg: 'bg-zinc-500/10', label: 'Low' },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Medium' },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'High' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical' },
};

// ============================================================
// Default Seed Knowledge
// ============================================================

const SEED_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'kb-001',
    title: 'AES-GCM 端到端加密架构',
    content: 'YYC3 平台采用 AES-256-GCM 对称加密方案保护所有 API Key 和敏感配置数据。加密在前端完成，密钥派生采用 PBKDF2，盐值唯一。解密仅在运行时临时进行，密文持久化到 localStorage。',
    summary: '前端 AES-GCM 加密方案，保护 API Key 安全',
    category: 'security',
    tags: ['加密', 'AES-GCM', 'API Key', 'PBKDF2'],
    linkedAgents: ['sentinel'],
    source: 'Phase 14 Implementation',
    importance: 'critical',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
    accessCount: 42,
  },
  {
    id: 'kb-002',
    title: '五维事件总线 Event Bus 设计',
    content: '全局五维类型化事件总线：D1智能维(orchestrate.*)、D2数据维(persist.*)、D3架构维(mcp.*)、D4体验维(ui.*)、D5安全维(security.*)。500容量RingBuffer，支持发布/订阅/过滤/历史查询，React Hook集成。',
    summary: '五维Event Bus架构，500容量RingBuffer',
    category: 'architecture',
    tags: ['Event Bus', '五维', 'RingBuffer', 'Pub/Sub'],
    linkedAgents: ['navigator', 'pivot'],
    source: 'Phase 18.4',
    importance: 'high',
    createdAt: '2026-02-08T09:00:00Z',
    updatedAt: '2026-02-12T16:00:00Z',
    accessCount: 28,
  },
  {
    id: 'kb-003',
    title: '多Agent协作编排五模式',
    content: '支持5种协作模式：1.Pipeline(串行接力)、2.Parallel(并行汇总)、3.Debate(辩论仲裁)、4.Ensemble(集成共识)、5.Delegation(委托分工)。每种模式有预设工作流和Agent角色分配算法。',
    summary: '五种Agent协作模式：Pipeline/Parallel/Debate/Ensemble/Delegation',
    category: 'ai-ml',
    tags: ['Agent', '协作', '编排', 'Multi-Agent', '工作流'],
    linkedAgents: ['navigator', 'thinker', 'grandmaster'],
    source: 'Phase 17.2',
    importance: 'high',
    createdAt: '2026-02-05T11:00:00Z',
    updatedAt: '2026-02-11T10:00:00Z',
    accessCount: 35,
  },
  {
    id: 'kb-004',
    title: 'Docker Engine API 直连方案',
    content: '通过铁威马F4-423 NAS (192.168.3.45:2375) 的Docker Engine REST API直连，支持容器列表、启停、日志查看、镜像管理。前端直接发HTTP请求到Docker API v1.41，无需后端代理。',
    summary: 'NAS Docker Engine API直连方案',
    category: 'devops',
    tags: ['Docker', 'NAS', 'API', '铁威马', '容器'],
    linkedAgents: ['pivot', 'navigator'],
    source: 'Phase 15.2',
    importance: 'medium',
    createdAt: '2026-01-28T14:00:00Z',
    updatedAt: '2026-02-09T08:00:00Z',
    accessCount: 19,
  },
  {
    id: 'kb-005',
    title: '家庭设备集群拓扑',
    content: 'MacBook Pro M4 Max(主力)→iMac M4(视觉辅助)→MateBook X Pro(边缘测试)→铁威马F4-423 NAS(数据中心)。全部通过192.168.3.x内网互联，支持SSH/Ollama/Docker/SQLite等多服务端口。',
    summary: '4设备家庭集群拓扑结构',
    category: 'family',
    tags: ['集群', '家庭', '设备', '拓扑', 'M4 Max'],
    linkedAgents: ['navigator', 'pivot'],
    source: 'Manual - docs/yyc3-Max.md',
    importance: 'high',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-14T09:00:00Z',
    accessCount: 56,
  },
  {
    id: 'kb-006',
    title: 'MCP JSON-RPC 2.0 四层传输',
    content: 'MCP工具链采用HTTP JSON-RPC 2.0协议，四层传输架构：L1序列化层→L2传输层→L3协议层→L4应用层。支持工具注册、调用、结果解析、错误处理全链路。',
    summary: 'MCP四层传输协议架构',
    category: 'architecture',
    tags: ['MCP', 'JSON-RPC', '协议', '传输'],
    linkedAgents: ['grandmaster', 'thinker'],
    source: 'Phase 18.3',
    importance: 'medium',
    createdAt: '2026-02-07T15:00:00Z',
    updatedAt: '2026-02-13T11:00:00Z',
    accessCount: 15,
  },
  {
    id: 'kb-007',
    title: 'WebSocket 心跳协议规范',
    content: 'Family Presence Board 心跳协议：ws://192.168.3.45:9090/ws/heartbeat。入站消息类型：heartbeat(单成员)、batch_heartbeat(批量)、ping(保活)。出站：pong、subscribe。每个payload含memberId、memberType、presence、heartbeatCount、signalMessage。NAS中继服务聚合所有家庭成员状态并广播。',
    summary: 'Family心跳WebSocket协议定义',
    category: 'architecture',
    tags: ['WebSocket', '心跳', '协议', 'Family Presence', 'NAS'],
    linkedAgents: ['pivot', 'sentinel'],
    source: 'Phase 20.1',
    importance: 'high',
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
    accessCount: 1,
  },
  {
    id: 'kb-008',
    title: 'NAS 部署工具链',
    content: 'Phase 21 NAS Deployment Toolkit：含NAS SQLite Table Manager（一键建表knowledge_base/agent_profiles）、Heartbeat WS Service Deployer（生成heartbeat-server.js + docker-compose.yml）、Service Connectivity Matrix（全集群服务端口扫描：HTTP/HTTPS/WS）、Deployment Checklist（Phase 19-21部署清单追踪）。所有操作直连NAS HTTP API，无后端中间件。',
    summary: 'NAS部署工具链：一键建表+WS服务部署+连通性矩阵',
    category: 'devops',
    tags: ['NAS', '部署', 'SQLite', 'WebSocket', 'Docker', 'Connectivity'],
    linkedAgents: ['navigator', 'pivot'],
    source: 'Phase 21',
    importance: 'high',
    createdAt: '2026-02-14T14:00:00Z',
    updatedAt: '2026-02-14T14:00:00Z',
    accessCount: 1,
  },
];

// ============================================================
// Highlight Text Component (Phase 32)
// ============================================================

function HighlightText({ text, query }: { text: string; query: string }) {
  const segments = getHighlightSegments(text, query);

  return (
    <>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark key={i} className="bg-cyan-500/25 text-cyan-300 rounded-sm px-0.5">{seg.text}</mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

// ============================================================
// Import Result Banner (Phase 32)
// ============================================================

function ImportResultBanner({ result, onDismiss }: { result: KBImportResult | null; onDismiss: () => void }) {
  if (!result) return null;

  return (
    <div className={cn(
      'p-3 rounded-lg border text-xs font-mono animate-in slide-in-from-top-2 duration-200',
      result.success
        ? 'bg-green-500/5 border-green-500/20 text-green-400'
        : 'bg-red-500/5 border-red-500/20 text-red-400',
    )}>
      <div className="flex items-center justify-between">
        <span>
          {result.success
            ? `Import OK: ${result.added} added, ${result.merged} merged`
            : 'Import failed'
          }
        </span>
        <button onClick={onDismiss} className="text-zinc-500 hover:text-zinc-300 text-sm">x</button>
      </div>
      {result.errors.length > 0 && (
        <div className="mt-1 text-[9px] text-red-400/70 max-h-16 overflow-y-auto">
          {result.errors.slice(0, 5).map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Knowledge Entry Editor
// ============================================================

function KnowledgeEditor({
  entry,
  onSave,
  onCancel,
  isSaving,
}: {
  entry?: KnowledgeEntry;
  onSave: (entry: KnowledgeEntry) => void;
  onCancel: () => void;
  isSaving?: boolean;
}) {
  const isNew = !entry;
  const [draft, setDraft] = React.useState<KnowledgeEntry>(entry || {
    id: `kb-${Date.now().toString(36)}`,
    title: '',
    content: '',
    summary: '',
    category: 'general' as KnowledgeCategory,
    tags: [],
    linkedAgents: [],
    source: 'Manual Input',
    importance: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  });

  return (
    <div className="space-y-4 p-5 bg-zinc-900/60 border border-white/10 rounded-xl animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-white font-mono">{isNew ? 'NEW ENTRY' : 'EDIT ENTRY'}</h3>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}><X className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" className="text-green-400" disabled={isSaving} onClick={() => {
            onSave({ ...draft, updatedAt: new Date().toISOString() });
          }}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Title</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
          value={draft.title}
          onChange={e => setDraft({ ...draft, title: e.target.value })}
          placeholder="Knowledge entry title..."
        />
      </div>

      {/* Summary */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Summary</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
          value={draft.summary}
          onChange={e => setDraft({ ...draft, summary: e.target.value })}
          placeholder="Brief summary..."
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Content</label>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 h-28 resize-none"
          value={draft.content}
          onChange={e => setDraft({ ...draft, content: e.target.value })}
          placeholder="Detailed knowledge content..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Category</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none"
            value={draft.category}
            onChange={e => setDraft({ ...draft, category: e.target.value as KnowledgeCategory })}
          >
            {Object.entries(KNOWLEDGE_CATEGORY_META).map(([key, meta]) => (
              <option key={key} value={key} className="bg-zinc-900">{meta.labelZh}</option>
            ))}
          </select>
        </div>

        {/* Importance */}
        <div>
          <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Importance</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none"
            value={draft.importance}
            onChange={e => setDraft({ ...draft, importance: e.target.value as 'low' | 'medium' | 'high' | 'critical' })}
          >
            {Object.entries(IMPORTANCE_META).map(([key, meta]) => (
              <option key={key} value={key} className="bg-zinc-900">{meta.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Tags (comma-separated)</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
          value={draft.tags.join(', ')}
          onChange={e => setDraft({ ...draft, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="tag1, tag2, ..."
        />
      </div>

      {/* Linked Agents */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Linked Agents</label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(AGENT_CAPABILITIES).map(([id, cap]) => (
            <button
              key={id}
              onClick={() => {
                const agents = draft.linkedAgents.includes(id)
                  ? draft.linkedAgents.filter(a => a !== id)
                  : [...draft.linkedAgents, id];

                setDraft({ ...draft, linkedAgents: agents });
              }}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all',
                draft.linkedAgents.includes(id)
                  ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                  : 'text-zinc-500 border-white/5 hover:border-white/20',
              )}
            >
              {cap.nameZh}
            </button>
          ))}
        </div>
      </div>

      {/* Source */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Source</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
          value={draft.source}
          onChange={e => setDraft({ ...draft, source: e.target.value })}
        />
      </div>
    </div>
  );
}

// ============================================================
// Knowledge Entry Display Card (Updated Phase 32)
// ============================================================

function KnowledgeCard({
  entry,
  onEdit,
  onDelete,
  searchQuery,
  onSummaryUpdate,
}: {
  entry: KnowledgeEntry;
  onEdit: () => void;
  onDelete: () => void;
  searchQuery?: string;
  onSummaryUpdate?: (id: string, summary: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [aiGenerating, setAiGenerating] = React.useState(false);
  const [aiSummary, setAiSummary] = React.useState('');
  const abortRef = React.useRef<AbortController | null>(null);
  const catMeta = KNOWLEDGE_CATEGORY_META[entry.category];
  const CatIcon = CATEGORY_ICONS[entry.category] || BookOpen;
  const impMeta = IMPORTANCE_META[entry.importance];
  const hasSearch = !!searchQuery?.trim();

  const handleAISummary = async () => {
    if (aiGenerating) {
      abortRef.current?.abort();
      setAiGenerating(false);

      return;
    }
    if (!canGenerateSummary()) return;

    setAiGenerating(true);
    setAiSummary('');
    abortRef.current = new AbortController();

    await generateEntrySummary(
      { title: entry.title, content: entry.content, tags: entry.tags },
      (text, done) => {
        setAiSummary(text);
        if (done && text) {
          setAiGenerating(false);
          onSummaryUpdate?.(entry.id, text);
        }
      },
      abortRef.current.signal,
    );
    setAiGenerating(false);
  };

  return (
    <Card className="bg-zinc-900/40 border-white/5 hover:border-white/10 transition-all group">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className={cn('p-1.5 rounded-lg shrink-0 mt-0.5', catMeta.bg)}>
              <CatIcon className={cn('w-4 h-4', catMeta.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm text-white truncate">
                {hasSearch ? <HighlightText text={entry.title} query={searchQuery!} /> : entry.title}
              </h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {hasSearch ? <HighlightText text={entry.summary} query={searchQuery!} /> : entry.summary}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {/* AI Summary button */}
            <Button
              size="sm"
              variant="ghost"
              className={cn('h-6 px-1.5', aiGenerating ? 'text-amber-400' : 'text-cyan-400')}
              onClick={handleAISummary}
              disabled={!canGenerateSummary() && !aiGenerating}
              title={canGenerateSummary() ? 'AI Summary' : 'No LLM provider configured'}
            >
              {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={onEdit}>
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-1.5 text-red-400" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* AI Summary Stream */}
        {aiSummary && (
          <div className="mb-2 p-2 rounded-md bg-cyan-500/5 border border-cyan-500/15 text-[10px] font-mono text-cyan-400/80 animate-in fade-in duration-300">
            <span className="text-[8px] text-zinc-600 block mb-0.5">AI Summary:</span>
            {aiSummary}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className={cn('text-[8px] h-4 px-1.5', catMeta.color, 'border-current/20')}>
            {catMeta.labelZh}
          </Badge>
          <Badge variant="outline" className={cn('text-[8px] h-4 px-1.5', impMeta.color, 'border-current/20')}>
            {impMeta.label}
          </Badge>
          {entry.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-[8px] h-4 px-1.5 text-zinc-400 border-white/5">
              {hasSearch ? <HighlightText text={tag} query={searchQuery!} /> : tag}
            </Badge>
          ))}
          {entry.tags.length > 3 && (
            <span className="text-[8px] text-zinc-500">+{entry.tags.length - 3}</span>
          )}
        </div>

        {/* Expandable Content */}
        {expanded && (
          <div className="mt-3 p-3 bg-black/30 rounded-lg border border-white/5 text-xs text-zinc-400 leading-relaxed animate-in slide-in-from-top-2 duration-200">
            {hasSearch ? <HighlightText text={entry.content} query={searchQuery!} /> : entry.content}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-600">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {entry.accessCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {new Date(entry.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Linked Agents (mini icons) */}
            <div className="flex items-center gap-0.5">
              {entry.linkedAgents.slice(0, 3).map(agentId => (
                <span key={agentId} className="text-[8px] text-zinc-500 px-1 py-0.5 bg-white/5 rounded">
                  {AGENT_CAPABILITIES[agentId]?.nameZh.split(' ')[0] || agentId}
                </span>
              ))}
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center gap-0.5"
            >
              <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
              {expanded ? 'Less' : 'More'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Stats Banner
// ============================================================

function KnowledgeStats({ entries, nasAvailable }: { entries: KnowledgeEntry[]; nasAvailable: boolean }) {
  const catCounts: Record<string, number> = {};

  for (const e of entries) {
    catCounts[e.category] = (catCounts[e.category] || 0) + 1;
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {Object.entries(KNOWLEDGE_CATEGORY_META).map(([key, meta]) => {
          const CatIcon = CATEGORY_ICONS[key] || BookOpen;

          return (
            <div key={key} className={cn('p-3 rounded-lg border border-white/5 text-center', meta.bg)}>
              <CatIcon className={cn('w-4 h-4 mx-auto mb-1', meta.color)} />
              <div className={cn('text-lg font-mono', meta.color)}>{catCounts[key] || 0}</div>
              <div className="text-[8px] text-zinc-500">{meta.labelZh}</div>
            </div>
          );
        })}
      </div>
      {/* Persistence Status Indicator */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
        <Database className="w-3 h-3" />
        <span>Persistence:</span>
        <span className={nasAvailable ? 'text-green-400' : 'text-zinc-400'}>
          {nasAvailable ? (
            <span className="flex items-center gap-1">
              <Cloud className="w-3 h-3" /> NAS SQLite + localStorage (dual-write)
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CloudOff className="w-3 h-3" /> localStorage only (NAS offline)
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Main Export: KnowledgeBase
// ============================================================

export function KnowledgeBase() {
  const [entries, setEntries] = React.useState<KnowledgeEntry[]>([]);
  const [search, setSearch] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState<KnowledgeCategory | 'all'>('all');
  const [editingEntry, setEditingEntry] = React.useState<KnowledgeEntry | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [nasAvailable, setNasAvailable] = React.useState(false);
  const [importResult, setImportResult] = React.useState<KBImportResult | null>(null);

  // Load from persistence engine on mount
  React.useEffect(() => {
    let cancelled = false;

    async function loadEntries() {
      setIsLoading(true);
      try {
        // Check NAS health
        const engine = getPersistenceEngine();
        const nasOk = await engine.checkNasHealth();

        if (!cancelled) setNasAvailable(nasOk);

        // Read from persistence engine (localStorage first, fast)
        const persisted = await readKnowledgeEntries();

        if (!cancelled) {
          if (persisted.length > 0) {
            setEntries(persisted as KnowledgeEntry[]);
          } else {
            // First run: seed with defaults and persist them
            setEntries(SEED_KNOWLEDGE);
            await writeKnowledgeEntries(SEED_KNOWLEDGE);
            // Also write to legacy localStorage for backward compat
            saveKnowledgeBase(SEED_KNOWLEDGE);
            eventBus.persist('knowledge_seed', `Knowledge base seeded with ${SEED_KNOWLEDGE.length} entries`, 'info');
          }
        }
      } catch (_err) {
        // Fallback to legacy localStorage
        if (!cancelled) {
          const legacy = loadKnowledgeBase();

          setEntries(legacy.length > 0 ? legacy : SEED_KNOWLEDGE);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadEntries();

    return () => { cancelled = true; };
  }, []);

  // Filter & search (Phase 32: fuzzy search with scoring)
  const filtered = React.useMemo(() => {
    let result = entries;

    if (filterCategory !== 'all') {
      result = result.filter(e => e.category === filterCategory);
    }
    if (search.trim()) {
      // Fuzzy search with weighted scoring
      const fuzzyResults = fuzzySearchEntries(result, search);

      return fuzzyResults.map(r => r.item);
    }

    return result;
  }, [entries, search, filterCategory]);

  // Export handler (Phase 32)
  const handleExport = React.useCallback(() => {
    exportKnowledgeJSON(entries);
  }, [entries]);

  // Import handler (Phase 32)
  const handleImport = React.useCallback(async () => {
    const content = await pickJSONFile();

    if (!content) return;

    const result = parseImportJSON(content, entries);

    setImportResult(result);

    if (result.success) {
      const merged = mergeEntries(entries, result.entries);

      setEntries(merged);
      // Persist merged data
      try {
        await writeKnowledgeEntries(merged);
        saveKnowledgeBase(merged);
      } catch { /* fallback already in saveKnowledgeBase */ }
    }

    setTimeout(() => setImportResult(null), 5000);
  }, [entries]);

  // AI Summary update handler (Phase 32)
  const handleSummaryUpdate = React.useCallback(async (entryId: string, summary: string) => {
    setEntries(prev => {
      const updated = prev.map(e =>
        e.id === entryId ? { ...e, summary, updatedAt: new Date().toISOString() } : e,
      );

      saveKnowledgeBase(updated);

      return updated;
    });
    // Also persist to NAS
    const entry = entries.find(e => e.id === entryId);

    if (entry) {
      try {
        await upsertKnowledgeEntry({ ...entry, summary, updatedAt: new Date().toISOString() });
      } catch { /* ignore */ }
    }
  }, [entries]);

  // Save handler: persist through engine
  const handleSave = React.useCallback(async (entry: KnowledgeEntry) => {
    setIsSaving(true);
    try {
      // Update local state
      setEntries(prev => {
        const idx = prev.findIndex(e => e.id === entry.id);

        if (idx >= 0) {
          const next = [...prev];

          next[idx] = entry;

          return next;
        }

        return [entry, ...prev];
      });

      // Persist via engine (dual-write to localStorage + NAS)
      await upsertKnowledgeEntry(entry);

      // Legacy localStorage backup
      setEntries(current => {
        saveKnowledgeBase(current);

        return current;
      });

      eventBus.persist('knowledge_update', `Knowledge entry saved: ${entry.title}`, 'info', {
        entryId: entry.id,
        category: entry.category,
        importance: entry.importance,
      });
    } catch (err) {
      console.warn('[KnowledgeBase] Save error:', err);
      eventBus.persist('knowledge_error', `Failed to persist: ${entry.title}`, 'error');
    } finally {
      setIsSaving(false);
      setEditingEntry(null);
      setIsCreating(false);
    }
  }, []);

  // Delete handler: persist through engine
  const handleDelete = React.useCallback(async (id: string) => {
    try {
      setEntries(prev => {
        const filtered = prev.filter(e => e.id !== id);

        saveKnowledgeBase(filtered); // Legacy backup

        return filtered;
      });

      // Delete from persistence engine (dual-write)
      await deleteKnowledgeFromEngine(id);

      eventBus.persist('knowledge_delete', `Knowledge entry deleted: ${id}`, 'warn', { entryId: id });
    } catch (err) {
      console.warn('[KnowledgeBase] Delete error:', err);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mr-3" />
        <span className="text-sm text-zinc-400 font-mono">Loading knowledge base...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Knowledge Base
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            格物致知 — 智能知识库 · {entries.length} entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-500 hover:text-cyan-400"
            onClick={handleExport}
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-500 hover:text-cyan-400"
            onClick={handleImport}
            title="Import JSON"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Import Result Banner (Phase 32) */}
      <ImportResultBanner result={importResult} onDismiss={() => setImportResult(null)} />

      {/* Stats */}
      <KnowledgeStats entries={entries} nasAvailable={nasAvailable} />

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 placeholder:text-zinc-600"
            placeholder="Search knowledge..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-[10px] font-mono border transition-all',
              filterCategory === 'all'
                ? 'text-white border-white/20 bg-white/10'
                : 'text-zinc-500 border-white/5 hover:border-white/15',
            )}
          >
            All
          </button>
          {Object.entries(KNOWLEDGE_CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key as KnowledgeCategory)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[10px] font-mono border transition-all',
                filterCategory === key
                  ? cn(meta.color, meta.bg, 'border-current/30')
                  : 'text-zinc-500 border-white/5 hover:border-white/15',
              )}
            >
              {meta.labelZh}
            </button>
          ))}
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingEntry) && (
        <KnowledgeEditor
          entry={editingEntry || undefined}
          onSave={handleSave}
          onCancel={() => { setIsCreating(false); setEditingEntry(null); }}
          isSaving={isSaving}
        />
      )}

      {/* Entries List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-600">
            <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No knowledge entries found</p>
            <p className="text-[10px] mt-1">Try adjusting your search or create a new entry</p>
          </div>
        ) : (
          filtered.map(entry => (
            <KnowledgeCard
              key={entry.id}
              entry={entry}
              onEdit={() => setEditingEntry(entry)}
              onDelete={() => handleDelete(entry.id)}
              searchQuery={search}
              onSummaryUpdate={handleSummaryUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
