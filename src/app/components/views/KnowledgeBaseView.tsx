import * as React from "react";
import {
  BookOpen, Plus, Trash2, Search, FileText,
  Tag, Clock, Edit3, Save, Star, SortAsc,
  Upload, Download, Sparkles, Loader2, Zap,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import {
  exportKnowledgeJSON,
  pickJSONFile,
  parseImportJSON,
  mergeEntries,
  fuzzySearchSimpleDocs,
  getHighlightSegments,
  canGenerateSummary,
  generateEntrySummary,
  type HighlightSegment,
  type KBImportResult,
} from "@/lib/kb-utils";
import type { KnowledgeEntry } from "@/lib/agent-identity";

// --- Knowledge Doc Types ---
interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  size: number;  // characters
}

interface DocCategory {
  id: string;
  label: string;
  labelEn: string;
  color: string;
}

const DOC_CATEGORIES: DocCategory[] = [
  { id: 'devops', label: 'DevOps运维', labelEn: 'DevOps', color: 'text-blue-400' },
  { id: 'architecture', label: '架构设计', labelEn: 'Architecture', color: 'text-purple-400' },
  { id: 'api', label: 'API文档', labelEn: 'API Docs', color: 'text-cyan-400' },
  { id: 'config', label: '配置手册', labelEn: 'Config Manual', color: 'text-amber-400' },
  { id: 'security', label: '安全策略', labelEn: 'Security', color: 'text-red-400' },
  { id: 'tutorial', label: '教程指南', labelEn: 'Tutorials', color: 'text-green-400' },
  { id: 'notes', label: '技术笔记', labelEn: 'Tech Notes', color: 'text-pink-400' },
  { id: 'nas', label: 'NAS设备', labelEn: 'NAS Device', color: 'text-emerald-400' },
];

const KB_STORAGE_KEY = 'yyc3-knowledge-base';

const DEFAULT_DOCS: KnowledgeDoc[] = [
  { id: 'kb1', title: 'YYC3 系统架构文档', content: '# YYC3 系统架构\n\n## 整体架构\n四节点分布式集群：M4-Max（主控）、iMac-M4（渲染）、MateBook（移动）、YanYuCloud NAS（存储）。\n\n## 技术栈\n- 前端：React 18 + TypeScript + Tailwind CSS v4\n- 状态管理：Zustand + PersistenceEngine\n- AI推理：多模型路由（Claude/GPT/DeepSeek/Ollama）\n- 部署：Docker Compose + Portainer\n\n## 核心模块\n1. ChatEngine - 对话引擎\n2. NeuralLink - 意图解析\n3. AgentSwarm - 七大智能体集群\n4. PersistenceEngine - 数据持久化', category: 'architecture', tags: ['架构', '集群', 'YYC3'], starred: true, createdAt: '2025-12-01', updatedAt: '2026-02-10', size: 280 },
  { id: 'kb2', title: 'Docker Compose 部署指南', content: '# Docker Compose 部署\n\n## 前置条件\n- Docker 24.0+\n- Docker Compose v2.20+\n\n## 一键部署\n```bash\ncd /opt/yyc3\ndocker compose up -d\n```\n\n## 服务列表\n- yyc3-frontend: :3000\n- yyc3-api: :8080\n- postgres: :5432\n- redis: :6379\n- ollama: :11434', category: 'devops', tags: ['Docker', '部署', 'Compose'], starred: true, createdAt: '2025-11-15', updatedAt: '2026-01-28', size: 200 },
  { id: 'kb3', title: 'Ollama 本地推理配置', content: '# Ollama 配置手册\n\n## 安装\n```bash\ncurl -fsSL https://ollama.ai/install.sh | sh\n```\n\n## 模型管理\n```bash\nollama pull qwen2.5:72b\nollama pull deepseek-r1:32b\nollama list\n```\n\n## GPU配置\n- Apple Silicon: 自动启用Metal加速\n- NVIDIA: 需安装CUDA驱动', category: 'config', tags: ['Ollama', 'LLM', '配置'], starred: false, createdAt: '2026-01-05', updatedAt: '2026-02-12', size: 180 },
  { id: 'kb4', title: 'NAS RAID6 维护手册', content: '# 铁威马 F4-423 RAID6 维护\n\n## 磁盘状态检查\n```bash\nmdadm --detail /dev/md0\nsmartctl -a /dev/sda\n```\n\n## 故障恢复\n1. 识别故障磁盘\n2. 热拔插更换\n3. 重建阵列\n\n## 备份策略\n- 每日增量备份至远程\n- 每周全量快照', category: 'nas', tags: ['NAS', 'RAID', '维护'], starred: false, createdAt: '2025-10-20', updatedAt: '2026-02-01', size: 160 },
  { id: 'kb5', title: 'RESTful API 规范', content: '# YYC3 API 规范\n\n## 认证\n- Bearer Token 认证\n- API Key 支持\n\n## 端点规范\n- GET /api/v1/agents - 获取智能体列表\n- POST /api/v1/chat - 发送对话\n- GET /api/v1/metrics - 获取集群指标\n\n## 错误码\n- 400: 请求参数错误\n- 401: 认证失败\n- 429: 请求频率限制\n- 500: 服务器内部错误', category: 'api', tags: ['API', 'REST', '接口'], starred: false, createdAt: '2026-01-10', updatedAt: '2026-02-08', size: 220 },
  { id: 'kb6', title: '安全审计 Checklist', content: '# 安全审计清单\n\n## OWASP Top 10\n- [ ] SQL注入防护\n- [ ] XSS过滤\n- [ ] CSRF Token\n- [ ] 敏感数据加密\n\n## 基础设施安全\n- [ ] SSH密钥认证\n- [ ] 防火墙规则\n- [ ] SSL/TLS证书\n- [ ] 容器镜像扫描', category: 'security', tags: ['安全', '审计', 'OWASP'], starred: true, createdAt: '2026-01-20', updatedAt: '2026-02-14', size: 190 },
  { id: 'kb7', title: 'React 18 + Zustand 状态管理', content: '# 状态管理最佳实践\n\n## Zustand Store 设计\n- 按功能模块切片\n- 使用selector避免不必要渲染\n- 搭配immer处理深层更新\n\n## 持久化策略\n- PersistenceEngine: 防抖写入localStorage\n- 启动时hydrate恢复\n- 关键数据自动备份至NAS', category: 'tutorial', tags: ['React', 'Zustand', '状态管理'], starred: false, createdAt: '2026-02-01', updatedAt: '2026-02-13', size: 170 },
  { id: 'kb8', title: 'MCP 工具链集成笔记', content: '# MCP (Model Context Protocol) 集成\n\n## 已接入工具\n- Figma MCP: 设计稿转代码\n- GitHub MCP: 代码仓库操作\n- Docker MCP: 容器管理\n- Filesystem MCP: 本地文件操作\n- PostgreSQL MCP: 数据库查询\n\n## 配置要点\n- 统一通过MCP Bridge桥接\n- 支持工具链组合编排\n- 权限沙箱隔离', category: 'notes', tags: ['MCP', '工具链', '集成'], starred: false, createdAt: '2026-02-05', updatedAt: '2026-02-15', size: 210 },
];

function loadKB(): KnowledgeDoc[] {
  try {
    const raw = localStorage.getItem(KB_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_DOCS;
}

function saveKB(docs: KnowledgeDoc[]) {
  try { localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(docs)); } catch { /* ignore */ }
}

// --- Highlight text component ---
function HighlightText({ text, query }: { text: string; query: string }) {
  const segments = getHighlightSegments(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark key={i} className="bg-[#0EA5E9]/25 text-[#0EA5E9] rounded-sm px-0.5">{seg.text}</mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

// --- AI Summary inline indicator ---
function AISummaryButton({
  doc,
  language,
  onSummaryDone,
}: {
  doc: KnowledgeDoc;
  language: string;
  onSummaryDone: (summary: string) => void;
}) {
  const [generating, setGenerating] = React.useState(false);
  const [streamText, setStreamText] = React.useState('');
  const abortRef = React.useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    if (generating) {
      abortRef.current?.abort();
      setGenerating(false);
      return;
    }

    if (!canGenerateSummary()) return;

    setGenerating(true);
    setStreamText('');
    abortRef.current = new AbortController();

    const result = await generateEntrySummary(
      { title: doc.title, content: doc.content, tags: doc.tags },
      (text, done) => {
        setStreamText(text);
        if (done && text) {
          onSummaryDone(text);
          setGenerating(false);
        }
      },
      abortRef.current.signal
    );

    if (!result) setGenerating(false);
  };

  const hasProvider = canGenerateSummary();

  return (
    <div className="mt-3">
      <Button
        size="sm"
        variant="outline"
        className={cn(
          "h-6 text-[10px] gap-1 font-mono",
          generating
            ? "border-amber-500/30 text-amber-400"
            : "border-[#0EA5E9]/30 text-[#0EA5E9]"
        )}
        onClick={handleGenerate}
        disabled={!hasProvider && !generating}
        title={!hasProvider ? (language === 'zh' ? '未配置LLM供应商' : 'No LLM provider configured') : ''}
      >
        {generating ? (
          <><Loader2 className="w-3 h-3 animate-spin" /> {language === 'zh' ? '生成中...' : 'Generating...'}</>
        ) : (
          <><Sparkles className="w-3 h-3" /> {language === 'zh' ? 'AI摘要' : 'AI Summary'}</>
        )}
      </Button>
      {streamText && (
        <div className="mt-2 p-2 rounded-md bg-[#0EA5E9]/5 border border-[#0EA5E9]/20 text-[11px] font-mono text-[#0EA5E9]/80 animate-in fade-in duration-300">
          <span className="text-[9px] text-zinc-500 block mb-1">AI Summary:</span>
          {streamText}
        </div>
      )}
    </div>
  );
}

// --- Import Result Toast ---
function ImportResultBanner({ result, language, onDismiss }: { result: KBImportResult | null; language: string; onDismiss: () => void }) {
  if (!result) return null;
  return (
    <div className={cn(
      "mx-3 mt-2 p-2.5 rounded-lg border text-[10px] font-mono animate-in slide-in-from-top-2 duration-200 shrink-0",
      result.success
        ? "bg-green-500/5 border-green-500/20 text-green-400"
        : "bg-red-500/5 border-red-500/20 text-red-400"
    )}>
      <div className="flex items-center justify-between">
        <span>
          {result.success
            ? `${language === 'zh' ? '导入成功' : 'Import OK'}: ${result.added} ${language === 'zh' ? '条新增' : 'added'}, ${result.merged} ${language === 'zh' ? '条合并' : 'merged'}`
            : `${language === 'zh' ? '导入失败' : 'Import failed'}`
          }
        </span>
        <button onClick={onDismiss} className="text-zinc-500 hover:text-zinc-300">x</button>
      </div>
      {result.errors.length > 0 && (
        <div className="mt-1 text-[9px] text-red-400/70 max-h-12 overflow-y-auto">
          {result.errors.slice(0, 3).map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
    </div>
  );
}

export function KnowledgeBaseView() {
  const { t, language } = useTranslation();
  const [docs, setDocs] = React.useState<KnowledgeDoc[]>(() => loadKB());
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [selectedDoc, setSelectedDoc] = React.useState<string | null>(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'updated' | 'title' | 'size' | 'score'>('updated');
  const [form, setForm] = React.useState({ title: '', content: '', category: 'notes', tags: '' });
  const [importResult, setImportResult] = React.useState<KBImportResult | null>(null);

  React.useEffect(() => { saveKB(docs); }, [docs]);

  const addDoc = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString().slice(0, 10);
    setDocs(prev => [...prev, {
      id: `kb-${Date.now()}`,
      title: form.title,
      content: form.content,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
      createdAt: now,
      updatedAt: now,
      size: form.content.length,
    }]);
    setForm({ title: '', content: '', category: 'notes', tags: '' });
    setShowAddForm(false);
  };

  const deleteDoc = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    if (selectedDoc === id) setSelectedDoc(null);
  };

  const toggleStar = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, starred: !d.starred } : d));
  };

  const saveDocEdit = () => {
    if (!selectedDoc) return;
    setDocs(prev => prev.map(d => d.id === selectedDoc ? { ...d, content: editContent, updatedAt: new Date().toISOString().slice(0, 10), size: editContent.length } : d));
    setIsEditing(false);
  };

  // --- Export handler ---
  const handleExport = () => {
    // Convert KnowledgeDoc[] to KnowledgeEntry[] for export compatibility
    const entries: KnowledgeEntry[] = docs.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      summary: '',
      category: d.category as KnowledgeEntry['category'],
      tags: d.tags,
      linkedAgents: [],
      source: 'KnowledgeBaseView Export',
      importance: 'medium' as const,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      accessCount: 0,
    }));
    exportKnowledgeJSON(entries);
  };

  // --- Import handler ---
  const handleImport = async () => {
    const content = await pickJSONFile();
    if (!content) return;

    // Convert current docs to KnowledgeEntry format for merge
    const existingEntries: KnowledgeEntry[] = docs.map(d => ({
      id: d.id, title: d.title, content: d.content, summary: '',
      category: d.category as KnowledgeEntry['category'],
      tags: d.tags, linkedAgents: [], source: '', importance: 'medium' as const,
      createdAt: d.createdAt, updatedAt: d.updatedAt, accessCount: 0,
    }));

    const result = parseImportJSON(content, existingEntries);
    setImportResult(result);

    if (result.success) {
      const merged = mergeEntries(existingEntries, result.entries);
      // Convert back to KnowledgeDoc format
      const newDocs: KnowledgeDoc[] = merged.map(e => ({
        id: e.id, title: e.title, content: e.content,
        category: e.category, tags: e.tags,
        starred: docs.find(d => d.id === e.id)?.starred ?? false,
        createdAt: e.createdAt, updatedAt: e.updatedAt,
        size: e.content.length,
      }));
      setDocs(newDocs);
    }

    // Auto-dismiss after 5s
    setTimeout(() => setImportResult(null), 5000);
  };

  // --- Fuzzy search with scoring ---
  const filtered = React.useMemo(() => {
    let results = docs.filter(d => activeCategory === 'all' || d.category === activeCategory);

    if (search.trim()) {
      const fuzzyResults = fuzzySearchSimpleDocs(results, search);
      results = fuzzyResults.map(r => r.item);
      // If sorting by score and we have search
      if (sortBy === 'score') {
        return fuzzyResults.map(r => r.item);
      }
    }

    // Apply non-score sort
    return results.sort((a, b) => {
      if (sortBy === 'updated') return b.updatedAt.localeCompare(a.updatedAt);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'size') return b.size - a.size;
      return 0;
    });
  }, [docs, search, activeCategory, sortBy]);

  const currentDoc = selectedDoc ? docs.find(d => d.id === selectedDoc) : null;
  const starredCount = docs.filter(d => d.starred).length;
  const hasSearch = search.trim().length > 0;

  return (
    <div className="flex-1 flex h-full bg-background/50 overflow-hidden">
      {/* Left Panel - Doc List */}
      <div className="w-[340px] lg:w-[380px] border-r border-border flex flex-col shrink-0">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-[#0EA5E9]" />
            </div>
            <div>
              <h2 className="text-xs font-mono tracking-wider text-[#0EA5E9]">{t('kb.title')}</h2>
              <p className="text-[9px] text-muted-foreground font-mono">{docs.length} {language === 'zh' ? '篇文档' : 'docs'} | {starredCount} {language === 'zh' ? '已标星' : 'starred'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Export */}
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-500 hover:text-[#0EA5E9]" onClick={handleExport} title={t('kb.export')}>
              <Download className="w-3.5 h-3.5" />
            </Button>
            {/* Import */}
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-500 hover:text-[#0EA5E9]" onClick={handleImport} title={t('kb.import')}>
              <Upload className="w-3.5 h-3.5" />
            </Button>
            {/* Add */}
            <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px] font-mono border-[#0EA5E9]/30 text-[#0EA5E9]" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Import Result Banner */}
        <ImportResultBanner result={importResult} language={language} onDismiss={() => setImportResult(null)} />

        {/* Search + Filter */}
        <div className="px-3 py-2 border-b border-border/50 space-y-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('kb.search_hint')}
              className="pl-8 h-7 text-[11px] font-mono bg-muted/20"
            />
            {hasSearch && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-mono text-[#0EA5E9]/60 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" /> {language === 'zh' ? '模糊' : 'fuzzy'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <button onClick={() => setActiveCategory('all')} className={cn("px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition-colors", activeCategory === 'all' ? "bg-[#0EA5E9]/15 text-[#0EA5E9]" : "text-zinc-500 hover:text-zinc-300")}>
              ALL
            </button>
            {DOC_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={cn("px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition-colors", activeCategory === cat.id ? "bg-[#0EA5E9]/15 text-[#0EA5E9]" : "text-zinc-500 hover:text-zinc-300")}>
                {language === 'zh' ? cat.label : cat.labelEn}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <SortAsc className="w-3 h-3 text-zinc-600" />
            {(['updated', 'title', 'size', ...(hasSearch ? ['score'] as const : [])] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s as typeof sortBy)} className={cn("px-1.5 py-0.5 rounded text-[9px] font-mono", sortBy === s ? "bg-zinc-800 text-zinc-200" : "text-zinc-600 hover:text-zinc-400")}>
                {s === 'updated' ? (language === 'zh' ? '最近' : 'Recent') : s === 'title' ? (language === 'zh' ? '标题' : 'Title') : s === 'size' ? (language === 'zh' ? '大小' : 'Size') : (language === 'zh' ? '匹配度' : 'Score')}
              </button>
            ))}
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mx-3 mt-2 p-3 rounded-lg border border-dashed border-[#0EA5E9]/30 bg-[#0EA5E9]/5 space-y-2 animate-in slide-in-from-top-2 duration-200 shrink-0">
            <Input placeholder={language === 'zh' ? '文档标题' : 'Title'} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" />
            <textarea placeholder={language === 'zh' ? '文档内容 (支持Markdown)' : 'Content (Markdown)'} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="w-full h-20 text-xs font-mono bg-muted/20 border border-border rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/30 text-foreground" />
            <div className="flex gap-2">
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="h-7 text-[10px] font-mono bg-muted/20 border border-border rounded px-1.5 text-foreground flex-1">
                {DOC_CATEGORIES.map(c => <option key={c.id} value={c.id}>{language === 'zh' ? c.label : c.labelEn}</option>)}
              </select>
              <Input placeholder={language === 'zh' ? '标签(逗号分隔)' : 'Tags (comma)'} value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="h-7 text-[10px] font-mono bg-muted/20 flex-1" />
            </div>
            <div className="flex gap-1 justify-end">
              <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setShowAddForm(false)}>{language === 'zh' ? '取消' : 'Cancel'}</Button>
              <Button size="sm" className="h-6 text-[10px] gap-1" onClick={addDoc}><Save className="w-3 h-3" /></Button>
            </div>
          </div>
        )}

        {/* Doc List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filtered.map(doc => {
              const cat = DOC_CATEGORIES.find(c => c.id === doc.category);
              return (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedDoc(doc.id); setIsEditing(false); setEditContent(doc.content); }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-all group",
                    selectedDoc === doc.id
                      ? "bg-[#0EA5E9]/10 border border-[#0EA5E9]/30"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <FileText className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", cat?.color || 'text-zinc-500')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono truncate">
                          {hasSearch ? <HighlightText text={doc.title} query={search} /> : doc.title}
                        </span>
                        {doc.starred && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[9px] text-zinc-600 font-mono">
                        <span className={cn("px-1 py-0.5 rounded", cat?.color || 'text-zinc-500')} style={{ background: 'rgba(255,255,255,0.05)' }}>
                          {language === 'zh' ? cat?.label : cat?.labelEn}
                        </span>
                        <span>{doc.updatedAt}</span>
                        <span>{doc.size} chars</span>
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {doc.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[8px] px-1 py-0.5 bg-zinc-800/50 rounded text-zinc-500 font-mono">
                              #{hasSearch ? <HighlightText text={tag} query={search} /> : tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-12 text-zinc-600">
                <Search className="w-8 h-8 mb-3 text-[#0EA5E9]/20" />
                <p className="text-xs font-mono">{hasSearch ? t('kb.no_results') : (language === 'zh' ? '暂无文档' : 'No documents')}</p>
                {hasSearch && <p className="text-[9px] text-zinc-600 mt-1">{t('kb.search_hint')}</p>}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="h-7 border-t border-border flex items-center justify-between px-3 shrink-0 bg-background/30 text-[9px] font-mono text-zinc-600">
          <span>{filtered.length} / {docs.length} {language === 'zh' ? '篇' : 'docs'}</span>
          <span>{DOC_CATEGORIES.length} {language === 'zh' ? '个分类' : 'categories'}</span>
        </div>
      </div>

      {/* Right Panel - Doc Viewer/Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentDoc ? (
          <>
            {/* Doc Header */}
            <div className="h-12 border-b border-border flex items-center justify-between px-5 bg-background/30 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <h3 className="text-sm font-mono truncate">{currentDoc.title}</h3>
                <span className="text-[9px] font-mono text-zinc-500">{currentDoc.updatedAt}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStar(currentDoc.id)} title={currentDoc.starred ? 'Unstar' : 'Star'}>
                  {currentDoc.starred ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <Star className="w-3.5 h-3.5 text-zinc-500" />}
                </Button>
                <Button variant="ghost" size="icon" className={cn("h-7 w-7", isEditing ? "text-[#0EA5E9]" : "text-zinc-500")} onClick={() => { setIsEditing(!isEditing); setEditContent(currentDoc.content); }}>
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
                {isEditing && (
                  <Button size="sm" className="h-7 text-[10px] gap-1" onClick={saveDocEdit}>
                    <Save className="w-3 h-3" /> {language === 'zh' ? '保存' : 'Save'}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => deleteDoc(currentDoc.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Doc Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-3xl">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full min-h-[500px] bg-muted/10 border border-border rounded-lg p-4 text-sm font-mono text-foreground resize-y focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/30"
                  />
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    {/* Simple Markdown rendering with search highlights */}
                    {currentDoc.content.split('\n').map((line, i) => {
                      const renderLine = (text: string) => hasSearch ? <HighlightText text={text} query={search} /> : text;

                      if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-mono text-[#0EA5E9] mb-3 mt-4">{renderLine(line.slice(2))}</h1>;
                      if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-mono text-[#0EA5E9]/80 mb-2 mt-3">{renderLine(line.slice(3))}</h2>;
                      if (line.startsWith('### ')) return <h3 key={i} className="text-xs font-mono text-zinc-300 mb-1 mt-2">{renderLine(line.slice(4))}</h3>;
                      if (line.startsWith('```')) return <div key={i} className="text-[10px] text-zinc-500 font-mono">{line}</div>;
                      if (line.startsWith('- [ ]')) return <div key={i} className="flex items-center gap-2 text-xs font-mono text-zinc-400 py-0.5"><input type="checkbox" disabled className="accent-[#0EA5E9]" />{renderLine(line.slice(5))}</div>;
                      if (line.startsWith('- [x]')) return <div key={i} className="flex items-center gap-2 text-xs font-mono text-zinc-400 py-0.5 line-through opacity-60"><input type="checkbox" checked disabled className="accent-[#0EA5E9]" />{renderLine(line.slice(5))}</div>;
                      if (line.startsWith('- ')) return <div key={i} className="text-xs font-mono text-zinc-400 pl-4 py-0.5">{renderLine(line)}</div>;
                      if (line.match(/^\d+\./)) return <div key={i} className="text-xs font-mono text-zinc-400 pl-4 py-0.5">{renderLine(line)}</div>;
                      if (line.trim() === '') return <div key={i} className="h-2" />;
                      return <p key={i} className="text-xs text-zinc-300 leading-relaxed">{renderLine(line)}</p>;
                    })}
                  </div>
                )}

                {/* AI Summary Button */}
                {!isEditing && (
                  <AISummaryButton
                    doc={currentDoc}
                    language={language}
                    onSummaryDone={(_summary) => {
                      // Could auto-save summary to doc metadata in future
                    }}
                  />
                )}

                {/* Tags */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3 h-3 text-zinc-600" />
                    {currentDoc.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-full text-[#0EA5E9] font-mono">
                        #{hasSearch ? <HighlightText text={tag} query={search} /> : tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-zinc-600">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {language === 'zh' ? '创建' : 'Created'}: {currentDoc.createdAt}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {language === 'zh' ? '更新' : 'Updated'}: {currentDoc.updatedAt}</span>
                    <span>{currentDoc.size} chars</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
            <BookOpen className="w-16 h-16 mb-4 text-[#0EA5E9]/15" />
            <h3 className="text-sm font-mono mb-1">{language === 'zh' ? '选择文档查看' : 'Select a document'}</h3>
            <p className="text-xs">{language === 'zh' ? '从左侧列表选择或创建新文档' : 'Choose from the list or create a new document'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default KnowledgeBaseView;
