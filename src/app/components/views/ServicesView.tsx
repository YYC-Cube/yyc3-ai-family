import * as React from "react";
import {
  Globe, Plus, Trash2, ExternalLink, Search, Star, StarOff,
  Server, Database, Code2, Shield, Cloud, Wifi, Monitor,
  GitBranch, Box, FileText, Edit3, Save, X, ChevronDown, ChevronRight
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

// --- Service Data Types ---
interface ServiceItem {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  pinned: boolean;
}

interface ServiceCategory {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'devops', label: 'DevOps', labelEn: 'DevOps', icon: Server, color: 'text-blue-400' },
  { id: 'database', label: '数据库', labelEn: 'Database', icon: Database, color: 'text-emerald-400' },
  { id: 'monitor', label: '监控', labelEn: 'Monitoring', icon: Monitor, color: 'text-amber-400' },
  { id: 'code', label: '代码仓库', labelEn: 'Code Repos', icon: Code2, color: 'text-purple-400' },
  { id: 'security', label: '安全', labelEn: 'Security', icon: Shield, color: 'text-red-400' },
  { id: 'cloud', label: '云服务', labelEn: 'Cloud', icon: Cloud, color: 'text-cyan-400' },
  { id: 'network', label: '网络', labelEn: 'Network', icon: Wifi, color: 'text-green-400' },
  { id: 'docs', label: '文档', labelEn: 'Documentation', icon: FileText, color: 'text-pink-400' },
  { id: 'other', label: '其他', labelEn: 'Other', icon: Globe, color: 'text-zinc-400' },
];

const STORAGE_KEY = 'yyc3-services';

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 's1', name: 'Portainer', url: 'https://192.168.1.100:9443', description: 'Docker容器管理面板', category: 'devops', icon: 'Box', color: 'text-blue-400', pinned: true },
  { id: 's2', name: 'Grafana', url: 'https://192.168.1.100:3000', description: '监控仪表盘', category: 'monitor', icon: 'Monitor', color: 'text-amber-400', pinned: true },
  { id: 's3', name: 'GitLab', url: 'https://git.example.com', description: '自托管代码仓库', category: 'code', icon: 'GitBranch', color: 'text-purple-400', pinned: true },
  { id: 's4', name: 'PostgreSQL Admin', url: 'https://192.168.1.100:5050', description: 'pgAdmin 数据库管理', category: 'database', icon: 'Database', color: 'text-emerald-400', pinned: false },
  { id: 's5', name: 'Nginx Proxy Manager', url: 'https://192.168.1.100:81', description: '反向代理管理', category: 'network', icon: 'Wifi', color: 'text-green-400', pinned: false },
  { id: 's6', name: 'Ollama WebUI', url: 'http://192.168.1.100:11434', description: '本地LLM推理服务', category: 'devops', icon: 'Server', color: 'text-cyan-400', pinned: true },
  { id: 's7', name: 'MinIO', url: 'https://192.168.1.100:9001', description: '对象存储控制台', category: 'cloud', icon: 'Cloud', color: 'text-sky-400', pinned: false },
  { id: 's8', name: 'Prometheus', url: 'https://192.168.1.100:9090', description: '指标采集服务', category: 'monitor', icon: 'Monitor', color: 'text-orange-400', pinned: false },
  { id: 's9', name: 'Vault', url: 'https://vault.example.com', description: '密钥管理服务', category: 'security', icon: 'Shield', color: 'text-red-400', pinned: false },
  { id: 's10', name: 'Notion', url: 'https://notion.so', description: '团队协作与文档', category: 'docs', icon: 'FileText', color: 'text-zinc-300', pinned: false },
  { id: 's11', name: 'Jenkins', url: 'https://192.168.1.100:8080', description: 'CI/CD 自动化引擎', category: 'devops', icon: 'Server', color: 'text-indigo-400', pinned: false },
  { id: 's12', name: 'Synology DSM', url: 'https://192.168.1.200:5001', description: 'NAS 管理面板', category: 'network', icon: 'Globe', color: 'text-teal-400', pinned: true },
];

function loadServices(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_SERVICES;
}

function saveServices(services: ServiceItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch { /* ignore */ }
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Box, Server, Database, Code2, Shield, Cloud, Wifi, Monitor, GitBranch, FileText, Globe
};

export function ServicesView() {
  const { t, language } = useTranslation();
  const [services, setServices] = React.useState<ServiceItem[]>(() => loadServices());
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', url: '', description: '', category: 'other' });
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set(SERVICE_CATEGORIES.map(c => c.id)));

  React.useEffect(() => { saveServices(services); }, [services]);

  const togglePin = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addService = () => {
    if (!form.name.trim() || !form.url.trim()) return;
    const cat = SERVICE_CATEGORIES.find(c => c.id === form.category);
    setServices(prev => [...prev, {
      id: `s-${Date.now()}`,
      name: form.name,
      url: form.url,
      description: form.description,
      category: form.category,
      icon: 'Globe',
      color: cat?.color || 'text-zinc-400',
      pinned: false,
    }]);
    setForm({ name: '', url: '', description: '', category: 'other' });
    setShowAddForm(false);
  };

  const startEdit = (s: ServiceItem) => {
    setEditingId(s.id);
    setForm({ name: s.name, url: s.url, description: s.description, category: s.category });
  };

  const saveEdit = (id: string) => {
    const cat = SERVICE_CATEGORIES.find(c => c.id === form.category);
    setServices(prev => prev.map(s => s.id === id ? {
      ...s, name: form.name, url: form.url, description: form.description, category: form.category, color: cat?.color || s.color
    } : s));
    setEditingId(null);
  };

  const filtered = services.filter(s => {
    const matchCat = activeCategory === 'all' || s.category === activeCategory;
    const matchSearch = !search.trim() || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()) || s.url.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const pinnedServices = filtered.filter(s => s.pinned);
  const groupedByCategory = SERVICE_CATEGORIES.map(cat => ({
    ...cat,
    items: filtered.filter(s => s.category === cat.id && !s.pinned),
  })).filter(g => g.items.length > 0);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background/50 overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#0EA5E9]" />
          </div>
          <div>
            <h2 className="text-sm font-mono tracking-wider text-[#0EA5E9]">{t('services.title')}</h2>
            <p className="text-[10px] text-muted-foreground font-mono">{services.length} {language === 'zh' ? '个服务' : ' services'} | {pinnedServices.length} {language === 'zh' ? '已收藏' : ' pinned'}</p>
          </div>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-xs font-mono" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-3.5 h-3.5" />
          {t('services.add')}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-border/50 flex items-center gap-3 shrink-0 bg-background/20">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'zh' ? '搜索服务...' : 'Search services...'}
            className="pl-8 h-8 text-xs font-mono bg-muted/20"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              "px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-colors",
              activeCategory === 'all' ? "bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/30" : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            )}
          >ALL</button>
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-colors",
                activeCategory === cat.id ? "bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/30" : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              )}
            >
              {language === 'zh' ? cat.label : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mx-4 mt-3 p-4 rounded-lg border border-dashed border-[#0EA5E9]/30 bg-[#0EA5E9]/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <h5 className="text-xs font-mono text-[#0EA5E9] flex items-center gap-2"><Plus className="w-3 h-3" /> {language === 'zh' ? '注册新服务' : 'NEW_SERVICE'}</h5>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder={language === 'zh' ? '服务名称' : 'Service Name'} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder="URL (https://...)" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder={language === 'zh' ? '描述' : 'Description'} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="h-8 text-xs font-mono bg-muted/20 border border-border rounded-md px-2 text-foreground"
            >
              {SERVICE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{language === 'zh' ? c.label : c.labelEn}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>{language === 'zh' ? '取消' : 'Cancel'}</Button>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={addService}><Save className="w-3 h-3" /> {language === 'zh' ? '添加' : 'Add'}</Button>
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Pinned / Favorites */}
          {pinnedServices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest">{language === 'zh' ? '收藏服务' : 'PINNED'}</span>
                <div className="flex-1 h-px bg-amber-400/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinnedServices.map(s => (
                  <ServiceCard key={s.id} service={s} language={language} onTogglePin={togglePin} onDelete={deleteService} onEdit={startEdit} editingId={editingId} form={form} setForm={setForm} onSaveEdit={saveEdit} onCancelEdit={() => setEditingId(null)} />
                ))}
              </div>
            </div>
          )}

          {/* Grouped by category */}
          {groupedByCategory.map(group => {
            const isExpanded = expandedCategories.has(group.id);
            const Icon = group.icon;
            return (
              <div key={group.id}>
                <button onClick={() => toggleCategory(group.id)} className="flex items-center gap-2 mb-2 w-full group">
                  {isExpanded ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
                  <Icon className={cn("w-3.5 h-3.5", group.color)} />
                  <span className={cn("text-[11px] font-mono uppercase tracking-widest", group.color)}>{language === 'zh' ? group.label : group.labelEn}</span>
                  <span className="text-[9px] text-zinc-600 font-mono">{group.items.length}</span>
                  <div className="flex-1 h-px bg-border/30" />
                </button>
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-5">
                    {group.items.map(s => (
                      <ServiceCard key={s.id} service={s} language={language} onTogglePin={togglePin} onDelete={deleteService} onEdit={startEdit} editingId={editingId} form={form} setForm={setForm} onSaveEdit={saveEdit} onCancelEdit={() => setEditingId(null)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
              <Globe className="w-12 h-12 mb-4 text-[#0EA5E9]/20" />
              <p className="font-mono text-sm">{language === 'zh' ? '未找到匹配的服务' : 'No services found'}</p>
              <p className="text-xs mt-1">{language === 'zh' ? '尝试修改搜索条件或添加新服务' : 'Try adjusting filters or add a new service'}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// --- Service Card Component ---
function ServiceCard({ service, language, onTogglePin, onDelete, onEdit, editingId, form, setForm, onSaveEdit, onCancelEdit }: {
  service: ServiceItem;
  language: string;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (s: ServiceItem) => void;
  editingId: string | null;
  form: { name: string; url: string; description: string; category: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; url: string; description: string; category: string }>>;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
}) {
  const IconComp = ICON_MAP[service.icon] || Globe;
  const isEditing = editingId === service.id;

  if (isEditing) {
    return (
      <div className="p-3 rounded-lg border border-[#0EA5E9]/30 bg-[#0EA5E9]/5 space-y-2 animate-in fade-in duration-150">
        <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" placeholder="Name" />
        <Input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" placeholder="URL" />
        <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" placeholder="Description" />
        <div className="flex gap-1.5 justify-end">
          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={onCancelEdit}><X className="w-3 h-3" /></Button>
          <Button size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={() => onSaveEdit(service.id)}><Save className="w-3 h-3" /> SAVE</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group p-3 rounded-lg border border-border/50 bg-card/50 hover:border-[#0EA5E9]/30 hover:bg-[#0EA5E9]/5 transition-all cursor-pointer relative">
      <div className="flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-lg bg-muted/20 border border-border flex items-center justify-center shrink-0", service.color)}>
          <IconComp className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-mono truncate group-hover:text-[#0EA5E9] transition-colors">{service.name}</h4>
            {service.pinned && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />}
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{service.description}</p>
          <p className="text-[9px] text-zinc-600 font-mono truncate mt-1">{service.url}</p>
        </div>
      </div>
      {/* Actions overlay */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onTogglePin(service.id); }} className="p-1 hover:bg-amber-500/10 rounded transition-colors" title={service.pinned ? (language === 'zh' ? '取消收藏' : 'Unpin') : (language === 'zh' ? '收藏' : 'Pin')}>
          {service.pinned ? <StarOff className="w-3 h-3 text-amber-400" /> : <Star className="w-3 h-3 text-zinc-500" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onEdit(service); }} className="p-1 hover:bg-white/10 rounded transition-colors">
          <Edit3 className="w-3 h-3 text-zinc-400" />
        </button>
        <a href={service.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1 hover:bg-[#0EA5E9]/10 rounded transition-colors">
          <ExternalLink className="w-3 h-3 text-[#0EA5E9]" />
        </a>
        <button onClick={(e) => { e.stopPropagation(); onDelete(service.id); }} className="p-1 hover:bg-red-500/10 rounded transition-colors">
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      </div>
    </div>
  );
}

export default ServicesView;
