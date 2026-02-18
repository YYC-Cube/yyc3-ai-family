import * as React from "react";
import {
  Bookmark, Plus, Trash2, ExternalLink, Search, Star, StarOff,
  FolderOpen, Edit3, Save, X, ChevronDown, ChevronRight,
  Globe, GitBranch, Box, Server, Code2, FileText, Layers,
  GripVertical, Copy, CheckCircle2, Tag
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

// --- Bookmark Types ---
interface BookmarkItem {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  starred: boolean;
  status: 'active' | 'archived' | 'maintenance';
  createdAt: string;
}

interface BookmarkCategory {
  id: string;
  label: string;
  labelEn: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BOOKMARK_CATEGORIES: BookmarkCategory[] = [
  { id: 'frontend', label: '前端项目', labelEn: 'Frontend', color: 'text-blue-400', icon: Code2 },
  { id: 'backend', label: '后端服务', labelEn: 'Backend', color: 'text-green-400', icon: Server },
  { id: 'devops', label: 'DevOps', labelEn: 'DevOps', color: 'text-amber-400', icon: Box },
  { id: 'docs', label: '文档站', labelEn: 'Documentation', color: 'text-purple-400', icon: FileText },
  { id: 'repo', label: '代码仓库', labelEn: 'Repositories', color: 'text-pink-400', icon: GitBranch },
  { id: 'design', label: '设计资源', labelEn: 'Design', color: 'text-cyan-400', icon: Layers },
  { id: 'tools', label: '在线工具', labelEn: 'Tools', color: 'text-orange-400', icon: Globe },
  { id: 'infra', label: '基础设施', labelEn: 'Infrastructure', color: 'text-emerald-400', icon: Server },
];

const BOOKMARKS_STORAGE_KEY = 'yyc3-bookmarks';

const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id: 'b1', name: 'YYC3 Frontend', url: 'http://localhost:3000', description: 'YYC3 Hacker Chatbot 前端主应用', category: 'frontend', tags: ['React', 'TypeScript', 'Tailwind'], starred: true, status: 'active', createdAt: '2025-12-01' },
  { id: 'b2', name: 'Figma 设计稿', url: 'https://figma.com/file/yyc3-design', description: 'YYC3 UI/UX 设计源文件', category: 'design', tags: ['UI', 'Figma', '设计'], starred: true, status: 'active', createdAt: '2025-11-20' },
  { id: 'b3', name: 'GitHub - yyc3-core', url: 'https://github.com/user/yyc3-core', description: '核心代码仓库', category: 'repo', tags: ['Git', '源码', 'Core'], starred: true, status: 'active', createdAt: '2025-10-15' },
  { id: 'b4', name: 'GitHub - yyc3-agent-swarm', url: 'https://github.com/user/yyc3-agent-swarm', description: '智能体集群代码仓库', category: 'repo', tags: ['Git', 'Agent', 'Swarm'], starred: false, status: 'active', createdAt: '2025-11-01' },
  { id: 'b5', name: 'Portainer Dashboard', url: 'https://192.168.1.100:9443', description: 'Docker 容器管理面板', category: 'devops', tags: ['Docker', 'Portainer'], starred: true, status: 'active', createdAt: '2025-10-20' },
  { id: 'b6', name: 'Grafana Monitoring', url: 'https://192.168.1.100:3000', description: '集群监控仪表盘', category: 'devops', tags: ['Grafana', '监控'], starred: false, status: 'active', createdAt: '2025-11-10' },
  { id: 'b7', name: 'API 文档 (Swagger)', url: 'https://api.yyc3.local/docs', description: 'YYC3 RESTful API 在线文档', category: 'docs', tags: ['API', 'Swagger', 'REST'], starred: false, status: 'active', createdAt: '2026-01-05' },
  { id: 'b8', name: 'Storybook 组件库', url: 'https://storybook.yyc3.local', description: 'UI组件库预览与测试', category: 'docs', tags: ['Storybook', '组件', 'UI'], starred: false, status: 'active', createdAt: '2026-01-10' },
  { id: 'b9', name: 'NAS File Manager', url: 'https://192.168.1.200:5001/filemanager', description: '铁威马NAS文件管理器', category: 'infra', tags: ['NAS', '文件', '存储'], starred: false, status: 'active', createdAt: '2025-10-01' },
  { id: 'b10', name: 'Jenkins CI/CD', url: 'https://192.168.1.100:8080', description: '持续集成/持续交付', category: 'devops', tags: ['Jenkins', 'CI/CD'], starred: false, status: 'active', createdAt: '2025-12-15' },
  { id: 'b11', name: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', description: 'Tailwind CSS 官方文档', category: 'tools', tags: ['CSS', 'Tailwind'], starred: false, status: 'active', createdAt: '2026-01-20' },
  { id: 'b12', name: 'React Router v7', url: 'https://reactrouter.com/en/main', description: 'React Router 官方文档', category: 'tools', tags: ['React', 'Router'], starred: false, status: 'active', createdAt: '2026-01-25' },
  { id: 'b13', name: 'Ollama API Server', url: 'http://192.168.1.100:11434', description: '本地LLM推理API', category: 'backend', tags: ['Ollama', 'LLM', 'API'], starred: true, status: 'active', createdAt: '2026-02-01' },
  { id: 'b14', name: 'PostgreSQL Admin', url: 'https://192.168.1.100:5050', description: 'pgAdmin数据库管理', category: 'infra', tags: ['PostgreSQL', 'DB'], starred: false, status: 'active', createdAt: '2025-12-01' },
  { id: 'b15', name: 'MinIO Console', url: 'https://192.168.1.100:9001', description: '对象存储管理面板', category: 'infra', tags: ['MinIO', '对象存储'], starred: false, status: 'active', createdAt: '2026-01-15' },
  { id: 'b16', name: 'YYC3 旧版前端 (Legacy)', url: 'http://localhost:3001', description: '旧版前端（已归档）', category: 'frontend', tags: ['Legacy', '归档'], starred: false, status: 'archived', createdAt: '2025-08-01' },
];

function loadBookmarks(): BookmarkItem[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_BOOKMARKS;
}

function saveBookmarks(items: BookmarkItem[]) {
  try { localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 bg-green-500/10 border-green-500/20',
  archived: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  maintenance: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  active: { zh: '运行中', en: 'Active' },
  archived: { zh: '已归档', en: 'Archived' },
  maintenance: { zh: '维护中', en: 'Maintenance' },
};

export function BookmarksView() {
  const { t, language } = useTranslation();
  const [bookmarks, setBookmarks] = React.useState<BookmarkItem[]>(() => loadBookmarks());
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set(BOOKMARK_CATEGORIES.map(c => c.id)));
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', url: '', description: '', category: 'tools', tags: '', status: 'active' as 'active' | 'archived' | 'maintenance' });

  React.useEffect(() => { saveBookmarks(bookmarks); }, [bookmarks]);

  const addBookmark = () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setBookmarks(prev => [...prev, {
      id: `b-${Date.now()}`,
      name: form.name,
      url: form.url,
      description: form.description,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
      status: form.status,
      createdAt: new Date().toISOString().slice(0, 10),
    }]);
    setForm({ name: '', url: '', description: '', category: 'tools', tags: '', status: 'active' });
    setShowAddForm(false);
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const toggleStar = (id: string) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, starred: !b.starred } : b));
  };

  const startEdit = (b: BookmarkItem) => {
    setEditingId(b.id);
    setForm({ name: b.name, url: b.url, description: b.description, category: b.category, tags: b.tags.join(', '), status: b.status });
  };

  const saveEdit = (id: string) => {
    setBookmarks(prev => prev.map(b => b.id === id ? {
      ...b,
      name: form.name,
      url: form.url,
      description: form.description,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: form.status,
    } : b));
    setEditingId(null);
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = bookmarks.filter(b => {
    const matchCat = activeCategory === 'all' || b.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.url.toLowerCase().includes(q) || b.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const starredItems = filtered.filter(b => b.starred);
  const groupedByCategory = BOOKMARK_CATEGORIES.map(cat => ({
    ...cat,
    items: filtered.filter(b => b.category === cat.id),
  })).filter(g => g.items.length > 0);

  const totalActive = bookmarks.filter(b => b.status === 'active').length;
  const totalArchived = bookmarks.filter(b => b.status === 'archived').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-background/50 overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-[#0EA5E9]" />
          </div>
          <div>
            <h2 className="text-sm font-mono tracking-wider text-[#0EA5E9]">{t('bookmarks.title')}</h2>
            <p className="text-[10px] text-muted-foreground font-mono">{totalActive} {language === 'zh' ? '活跃' : 'active'} | {totalArchived} {language === 'zh' ? '已归档' : 'archived'} | {starredItems.length} {language === 'zh' ? '收藏' : 'starred'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/30 rounded p-0.5 border border-border/50">
            <button onClick={() => setViewMode('grid')} className={cn("px-2 py-0.5 rounded text-[10px] font-mono", viewMode === 'grid' ? "bg-[#0EA5E9]/15 text-[#0EA5E9]" : "text-zinc-500")}>
              {language === 'zh' ? '卡片' : 'Grid'}
            </button>
            <button onClick={() => setViewMode('list')} className={cn("px-2 py-0.5 rounded text-[10px] font-mono", viewMode === 'list' ? "bg-[#0EA5E9]/15 text-[#0EA5E9]" : "text-zinc-500")}>
              {language === 'zh' ? '列表' : 'List'}
            </button>
          </div>
          <Button size="sm" className="h-8 gap-1.5 text-xs font-mono" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-3.5 h-3.5" />
            {t('bookmarks.add')}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-border/50 flex items-center gap-3 shrink-0 bg-background/20">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={language === 'zh' ? '搜索项目...' : 'Search projects...'} className="pl-8 h-8 text-xs font-mono bg-muted/20" />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          <button onClick={() => setActiveCategory('all')} className={cn("px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap", activeCategory === 'all' ? "bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/30" : "text-zinc-500 hover:text-zinc-300 border border-transparent")}>
            ALL ({bookmarks.length})
          </button>
          {BOOKMARK_CATEGORIES.map(cat => {
            const count = bookmarks.filter(b => b.category === cat.id).length;
            if (count === 0) return null;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={cn("px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap", activeCategory === cat.id ? "bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/30" : "text-zinc-500 hover:text-zinc-300 border border-transparent")}>
                {language === 'zh' ? cat.label : cat.labelEn} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mx-4 mt-3 p-4 rounded-lg border border-dashed border-[#0EA5E9]/30 bg-[#0EA5E9]/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <h5 className="text-xs font-mono text-[#0EA5E9] flex items-center gap-2"><Plus className="w-3 h-3" /> {language === 'zh' ? '添加项目书签' : 'ADD_PROJECT_BOOKMARK'}</h5>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder={language === 'zh' ? '项目名称' : 'Project Name'} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder="URL (https://...)" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder={language === 'zh' ? '描述' : 'Description'} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder={language === 'zh' ? '标签(逗号分隔)' : 'Tags (comma)'} value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20 border border-border rounded-md px-2 text-foreground">
              {BOOKMARK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{language === 'zh' ? c.label : c.labelEn}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as BookmarkItem['status'] }))} className="h-8 text-xs font-mono bg-muted/20 border border-border rounded-md px-2 text-foreground">
              <option value="active">{language === 'zh' ? '运行中' : 'Active'}</option>
              <option value="maintenance">{language === 'zh' ? '维护中' : 'Maintenance'}</option>
              <option value="archived">{language === 'zh' ? '已归档' : 'Archived'}</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>{language === 'zh' ? '取消' : 'Cancel'}</Button>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={addBookmark}><Save className="w-3 h-3" /> {language === 'zh' ? '添加' : 'Add'}</Button>
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Starred section */}
          {starredItems.length > 0 && activeCategory === 'all' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest">{language === 'zh' ? '收藏项目' : 'STARRED'}</span>
                <div className="flex-1 h-px bg-amber-400/10" />
              </div>
              <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-1.5")}>
                {starredItems.map(b => (
                  <BookmarkCard key={b.id} bookmark={b} language={language} viewMode={viewMode} editingId={editingId} form={form} setForm={setForm as React.Dispatch<React.SetStateAction<{ name: string; url: string; description: string; category: string; tags: string; status: 'active' | 'archived' | 'maintenance' }>>} onToggleStar={toggleStar} onDelete={deleteBookmark} onEdit={startEdit} onSaveEdit={saveEdit} onCancelEdit={() => setEditingId(null)} onCopyUrl={copyUrl} copiedId={copiedId} />
                ))}
              </div>
            </div>
          )}

          {/* Grouped by category */}
          {groupedByCategory.map(group => {
            const isExpanded = expandedCategories.has(group.id);
            const Icon = group.icon;
            const items = activeCategory === 'all' ? group.items.filter(b => !b.starred) : group.items;
            if (items.length === 0 && activeCategory === 'all') return null;
            return (
              <div key={group.id}>
                <button onClick={() => toggleCategoryExpand(group.id)} className="flex items-center gap-2 mb-2 w-full">
                  {isExpanded ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
                  <Icon className={cn("w-3.5 h-3.5", group.color)} />
                  <span className={cn("text-[11px] font-mono uppercase tracking-widest", group.color)}>{language === 'zh' ? group.label : group.labelEn}</span>
                  <span className="text-[9px] text-zinc-600 font-mono">{items.length}</span>
                  <div className="flex-1 h-px bg-border/30" />
                </button>
                {isExpanded && (
                  <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-5" : "space-y-1.5 ml-5")}>
                    {items.map(b => (
                      <BookmarkCard key={b.id} bookmark={b} language={language} viewMode={viewMode} editingId={editingId} form={form} setForm={setForm as React.Dispatch<React.SetStateAction<{ name: string; url: string; description: string; category: string; tags: string; status: 'active' | 'archived' | 'maintenance' }>>} onToggleStar={toggleStar} onDelete={deleteBookmark} onEdit={startEdit} onSaveEdit={saveEdit} onCancelEdit={() => setEditingId(null)} onCopyUrl={copyUrl} copiedId={copiedId} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
              <Bookmark className="w-12 h-12 mb-4 text-[#0EA5E9]/20" />
              <p className="font-mono text-sm">{language === 'zh' ? '未找到匹配的项目' : 'No projects found'}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// --- Bookmark Card Component ---
function BookmarkCard({ bookmark, language, viewMode, editingId, form, setForm, onToggleStar, onDelete, onEdit, onSaveEdit, onCancelEdit, onCopyUrl, copiedId }: {
  bookmark: BookmarkItem;
  language: string;
  viewMode: 'grid' | 'list';
  editingId: string | null;
  form: { name: string; url: string; description: string; category: string; tags: string; status: 'active' | 'archived' | 'maintenance' };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; url: string; description: string; category: string; tags: string; status: 'active' | 'archived' | 'maintenance' }>>;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (b: BookmarkItem) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onCopyUrl: (id: string, url: string) => void;
  copiedId: string | null;
}) {
  const isEditing = editingId === bookmark.id;
  const cat = BOOKMARK_CATEGORIES.find(c => c.id === bookmark.category);
  const Icon = cat?.icon || Globe;

  if (isEditing) {
    return (
      <div className="p-3 rounded-lg border border-[#0EA5E9]/30 bg-[#0EA5E9]/5 space-y-2">
        <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" placeholder="Name" />
        <Input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" placeholder="URL" />
        <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" placeholder="Description" />
        <div className="flex gap-1.5 justify-end">
          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={onCancelEdit}><X className="w-3 h-3" /></Button>
          <Button size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={() => onSaveEdit(bookmark.id)}><Save className="w-3 h-3" /> SAVE</Button>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="group flex items-center gap-3 px-3 py-2 rounded-lg border border-border/30 hover:border-[#0EA5E9]/30 hover:bg-[#0EA5E9]/5 transition-all">
        <Icon className={cn("w-4 h-4 shrink-0", cat?.color)} />
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-xs font-mono truncate">{bookmark.name}</span>
          {bookmark.starred && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />}
          <span className={cn("text-[8px] px-1.5 py-0.5 rounded border font-mono shrink-0", STATUS_COLORS[bookmark.status])}>
            {STATUS_LABELS[bookmark.status]?.[language] || bookmark.status}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono truncate hidden md:block">{bookmark.description}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onCopyUrl(bookmark.id, bookmark.url)} className="p-1 hover:bg-white/10 rounded transition-colors">
            {copiedId === bookmark.id ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
          </button>
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-[#0EA5E9]/10 rounded transition-colors">
            <ExternalLink className="w-3 h-3 text-[#0EA5E9]" />
          </a>
          <button onClick={() => onEdit(bookmark)} className="p-1 hover:bg-white/10 rounded transition-colors"><Edit3 className="w-3 h-3 text-zinc-400" /></button>
          <button onClick={() => onDelete(bookmark.id)} className="p-1 hover:bg-red-500/10 rounded transition-colors"><Trash2 className="w-3 h-3 text-red-400" /></button>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div className={cn("group p-3 rounded-lg border transition-all cursor-pointer relative", bookmark.status === 'archived' ? "border-border/30 opacity-60" : "border-border/50 bg-card/50 hover:border-[#0EA5E9]/30 hover:bg-[#0EA5E9]/5")}>
      <div className="flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-lg bg-muted/20 border border-border flex items-center justify-center shrink-0", cat?.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-mono truncate group-hover:text-[#0EA5E9] transition-colors">{bookmark.name}</h4>
            {bookmark.starred && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />}
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{bookmark.description}</p>
          <p className="text-[9px] text-zinc-600 font-mono truncate mt-1">{bookmark.url}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded border font-mono", STATUS_COLORS[bookmark.status])}>
              {STATUS_LABELS[bookmark.status]?.[language] || bookmark.status}
            </span>
            {bookmark.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[8px] px-1 py-0.5 bg-zinc-800/50 rounded text-zinc-500 font-mono">#{tag}</span>
            ))}
          </div>
        </div>
      </div>
      {/* Action overlay */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); onToggleStar(bookmark.id); }} className="p-1 hover:bg-amber-500/10 rounded">
          {bookmark.starred ? <StarOff className="w-3 h-3 text-amber-400" /> : <Star className="w-3 h-3 text-zinc-500" />}
        </button>
        <button onClick={e => { e.stopPropagation(); onCopyUrl(bookmark.id, bookmark.url); }} className="p-1 hover:bg-white/10 rounded">
          {copiedId === bookmark.id ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
        </button>
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1 hover:bg-[#0EA5E9]/10 rounded">
          <ExternalLink className="w-3 h-3 text-[#0EA5E9]" />
        </a>
        <button onClick={e => { e.stopPropagation(); onEdit(bookmark); }} className="p-1 hover:bg-white/10 rounded"><Edit3 className="w-3 h-3 text-zinc-400" /></button>
        <button onClick={e => { e.stopPropagation(); onDelete(bookmark.id); }} className="p-1 hover:bg-red-500/10 rounded"><Trash2 className="w-3 h-3 text-red-400" /></button>
      </div>
    </div>
  );
}

export default BookmarksView;
