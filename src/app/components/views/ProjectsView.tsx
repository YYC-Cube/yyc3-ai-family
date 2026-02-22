import * as React from "react";
import { cn } from "@/lib/utils";
import {
  FolderOpen, FileCode, GitBranch, GitCommit, Clock,
  Star, Search, Plus, Filter,
  ChevronRight, ChevronDown, ChevronLeft, File, FolderClosed,
  Terminal, Globe, Database, Server, Package,
  Activity, CheckCircle2, AlertCircle, ExternalLink,
  Trash2, X, Save, ArrowLeft,
  Eye, Code2, Columns, PanelRightClose, PanelRightOpen,
  Figma, Layers, MoreHorizontal, RefreshCw, Copy
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Input } from "@/app/components/ui/input";
import { useSystemStore } from "@/lib/store";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// --- Types ---

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  lastCommit: string;
  lastAccessTime: number; // timestamp for MRU ordering
  branch: string;
  status: "active" | "archived" | "development";
  health: "healthy" | "warning" | "error";
  services: number;
  type: "frontend" | "backend" | "infra" | "library" | "fullstack";
  group: "starred" | "figma" | "recent";
}

interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  size?: string;
  modified?: string;
}

// --- Initial Mock Data ---

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "yyc3-core",
    name: "yyc3-core",
    description: "YYC3 Hacker Chatbot 核心平台 — 九层架构主系统",
    language: "TypeScript",
    languageColor: "bg-blue-500",
    stars: 42,
    lastCommit: "2 分钟前",
    lastAccessTime: Date.now() - 120000,
    branch: "main",
    status: "development",
    health: "healthy",
    services: 7,
    type: "fullstack",
    group: "starred"
  },
  {
    id: "yyc3-design-system",
    name: "yyc3-design-system",
    description: "赛博朋克设计系统 — 五高五标五化组件库",
    language: "TypeScript",
    languageColor: "bg-blue-500",
    stars: 35,
    lastCommit: "12 小时前",
    lastAccessTime: Date.now() - 43200000,
    branch: "main",
    status: "development",
    health: "healthy",
    services: 1,
    type: "library",
    group: "starred"
  },
  {
    id: "yyc3-figma-tokens",
    name: "yyc3-figma-tokens",
    description: "Figma Design Tokens — 设计变量同步管道",
    language: "TypeScript",
    languageColor: "bg-blue-500",
    stars: 18,
    lastCommit: "6 小时前",
    lastAccessTime: Date.now() - 21600000,
    branch: "main",
    status: "active",
    health: "healthy",
    services: 1,
    type: "library",
    group: "figma"
  },
  {
    id: "yyc3-figma-plugin",
    name: "yyc3-figma-plugin",
    description: "Figma Plugin — 设计到代码自动化桥接",
    language: "TypeScript",
    languageColor: "bg-blue-500",
    stars: 22,
    lastCommit: "1 天前",
    lastAccessTime: Date.now() - 86400000,
    branch: "develop",
    status: "development",
    health: "healthy",
    services: 2,
    type: "frontend",
    group: "figma"
  },
  {
    id: "yyc3-gateway",
    name: "yyc3-gateway",
    description: "API 网关 — Nginx 反向代理 + 速率限制 + SSL 终止",
    language: "Nginx",
    languageColor: "bg-green-500",
    stars: 12,
    lastCommit: "3 天前",
    lastAccessTime: Date.now() - 259200000,
    branch: "main",
    status: "active",
    health: "healthy",
    services: 2,
    type: "infra",
    group: "recent"
  },
  {
    id: "yyc3-agent-runtime",
    name: "yyc3-agent-runtime",
    description: "AI 智能体运行时 — 7 大智能体的推理引擎与工具链",
    language: "Python",
    languageColor: "bg-yellow-500",
    stars: 28,
    lastCommit: "1 天前",
    lastAccessTime: Date.now() - 86400000,
    branch: "develop",
    status: "development",
    health: "healthy",
    services: 3,
    type: "backend",
    group: "recent"
  },
  {
    id: "yyc3-data-pipeline",
    name: "yyc3-data-pipeline",
    description: "数据流水线 — ETL + 向量化 + 知识图谱构建",
    language: "Python",
    languageColor: "bg-yellow-500",
    stars: 15,
    lastCommit: "5 天前",
    lastAccessTime: Date.now() - 432000000,
    branch: "main",
    status: "active",
    health: "warning",
    services: 4,
    type: "backend",
    group: "recent"
  },
  {
    id: "yyc3-nas-controller",
    name: "yyc3-nas-controller",
    description: "YanYuCloud NAS 控制器 — RAID 管理 + 存储调度 + 备份策略",
    language: "Go",
    languageColor: "bg-cyan-500",
    stars: 8,
    lastCommit: "1 周前",
    lastAccessTime: Date.now() - 604800000,
    branch: "main",
    status: "active",
    health: "healthy",
    services: 2,
    type: "infra",
    group: "recent"
  },
];

const FILE_TREE: FileTreeNode[] = [
  {
    name: "src", type: "folder", children: [
      {
        name: "app", type: "folder", children: [
          { name: "App.tsx", type: "file", size: "9.9KB", modified: "just now" },
          {
            name: "components", type: "folder", children: [
              { name: "chat/", type: "folder" },
              { name: "console/", type: "folder" },
              { name: "layout/", type: "folder" },
              { name: "monitoring/", type: "folder" },
              { name: "settings/", type: "folder" },
              { name: "ui/", type: "folder" },
              { name: "views/", type: "folder" },
            ]
          }
        ]
      },
      {
        name: "lib", type: "folder", children: [
          { name: "store.ts", type: "file", size: "5.8KB", modified: "just now" },
          { name: "types.ts", type: "file", size: "8.2KB", modified: "just now" },
          { name: "api.ts", type: "file", size: "12.4KB", modified: "just now" },
          { name: "useOllamaDiscovery.ts", type: "file", size: "7.1KB", modified: "just now" },
        ]
      },
      {
        name: "styles", type: "folder", children: [
          { name: "theme.css", type: "file", size: "3.2KB", modified: "1 day ago" },
          { name: "fonts.css", type: "file", size: "0.4KB", modified: "2 weeks ago" },
          { name: "index.css", type: "file", size: "1.1KB", modified: "1 week ago" },
        ]
      }
    ]
  },
  { name: "package.json", type: "file", size: "2.4KB", modified: "1 hour ago" },
  { name: "vite.config.ts", type: "file", size: "0.6KB", modified: "1 week ago" },
  { name: "tsconfig.json", type: "file", size: "0.3KB", modified: "2 weeks ago" },
];

const RECENT_COMMITS = [
  { hash: "f9e1d4a", message: "feat(phase24): project view redesign + Ollama sync", author: "dev_operator", time: "刚刚", branch: "main" },
  { hash: "c7b2e3f", message: "feat(phase23): Ollama discovery + API docs viewer", author: "dev_operator", time: "1 小时前", branch: "main" },
  { hash: "a3f7b2e", message: "feat(phase22): remote Docker Compose deployment", author: "dev_operator", time: "2 小时前", branch: "main" },
  { hash: "8d4c1a9", message: "fix(console): resolve neural link state sync issue", author: "dev_operator", time: "昨天 16:30", branch: "main" },
  { hash: "2e5f8b3", message: "refactor(theme): implement dark-first CSS variable system", author: "dev_operator", time: "昨天 10:15", branch: "main" },
];

// Language color map
const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500", Python: "bg-yellow-500", Go: "bg-cyan-500",
  Rust: "bg-orange-500", Java: "bg-red-500", Nginx: "bg-green-500",
  YAML: "bg-purple-500", Bash: "bg-zinc-400", Dockerfile: "bg-sky-500",
};

// --- File Tree Component ---

function FileTreeItem({ node, depth = 0 }: { node: FileTreeNode; depth?: number }) {
  const [isOpen, setIsOpen] = React.useState(depth < 2);

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-white/5 rounded text-sm group transition-colors"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          ) : (
            <FolderClosed className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
          )}
          <span className="text-zinc-300 font-mono text-xs truncate">{node.name}</span>
        </button>
        {isOpen && node.children && (
          <div>
            {node.children.map((child, idx) => (
              <FileTreeItem key={`${child.name}-${idx}`} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 rounded text-sm cursor-pointer group transition-colors"
      style={{ paddingLeft: `${depth * 16 + 24}px` }}
    >
      <FileCode className="w-3.5 h-3.5 text-blue-400/70 shrink-0" />
      <span className="text-zinc-400 font-mono text-xs truncate flex-1">{node.name}</span>
      {node.size && (
        <span className="text-[10px] text-zinc-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{node.size}</span>
      )}
    </div>
  );
}

// --- Create Project Dialog ---

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (project: ProjectItem) => void;
}

function CreateProjectDialog({ open, onClose, onCreate }: CreateProjectDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [language, setLanguage] = React.useState("TypeScript");
  const [projectType, setProjectType] = React.useState<ProjectItem["type"]>("fullstack");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: description.trim(),
      language,
      languageColor: LANG_COLORS[language] ?? "bg-zinc-500",
      stars: 0,
      lastCommit: "刚刚",
      lastAccessTime: Date.now(),
      branch: "main",
      status: "development",
      health: "healthy",
      services: 0,
      type: projectType,
      group: "recent",
    };

    onCreate(newProject);
    setName("");
    setDescription("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[480px] max-w-[95vw] bg-zinc-900 border border-white/10 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-sm font-mono text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            NEW_PROJECT
          </h3>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">项目名称 *</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="yyc3-new-service"
              className="bg-black/40 border-white/10 font-mono text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">描述</label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="服务描述..."
              className="bg-black/40 border-white/10 font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">语言</label>
              <div className="flex flex-wrap gap-1">
                {Object.keys(LANG_COLORS).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-mono transition-colors",
                      language === lang
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-zinc-500 hover:text-zinc-300 bg-white/5"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">类型</label>
              <div className="flex flex-wrap gap-1">
                {(["fullstack", "backend", "frontend", "infra", "library"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setProjectType(t)}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors",
                      projectType === t
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-zinc-500 hover:text-zinc-300 bg-white/5"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <Button type="button" variant="ghost" className="text-xs font-mono" onClick={onClose}>CANCEL</Button>
            <Button type="submit" className="text-xs font-mono gap-1" disabled={!name.trim()}>
              <Save className="w-3 h-3" /> CREATE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Group Icons ---
const GROUP_CONFIG: Record<string, { icon: typeof Star; label: string; color: string }> = {
  starred: { icon: Star, label: "星标项目", color: "text-amber-500" },
  figma: { icon: Figma, label: "Figma", color: "text-pink-400" },
  recent: { icon: Clock, label: "近期项目", color: "text-primary" },
};

const typeIcons: Record<string, typeof Globe> = {
  frontend: Globe,
  backend: Server,
  infra: Database,
  library: Package,
  fullstack: Terminal,
};

const healthConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  healthy: { icon: CheckCircle2, className: "text-green-500" },
  warning: { icon: AlertCircle, className: "text-amber-500" },
  error: { icon: AlertCircle, className: "text-red-500" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "ACTIVE", className: "text-green-500 border-green-500/20 bg-green-500/5" },
  development: { label: "IN_DEV", className: "text-amber-500 border-amber-500/20 bg-amber-500/5" },
  archived: { label: "ARCHIVED", className: "text-zinc-500 border-zinc-500/20 bg-zinc-500/5" },
};

// --- Main Component ---

export function ProjectsView() {
  const [projects, setProjects] = React.useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = React.useState<string | null>("yyc3-core");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showCreate, setShowCreate] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    starred: true,
    figma: true,
    recent: true,
  });
  const [docPanelOpen, setDocPanelOpen] = React.useState(true);
  const [docViewMode, setDocViewMode] = React.useState<'preview' | 'code' | 'split'>('code');
  const addLog = useSystemStore((s) => s.addLog);
  const isMobile = useSystemStore((s) => s.isMobile);
  const isTablet = useSystemStore((s) => s.isTablet);

  const [mobileShowDetail, setMobileShowDetail] = React.useState(false);

  const handleSelectProject = (id: string) => {
    setSelectedProject(id);
    // Update MRU access time
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, lastAccessTime: Date.now() } : p
    ));
    if (isMobile) setMobileShowDetail(true);
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Group projects by category and sort by MRU
  const groupedProjects = React.useMemo(() => {
    const filtered = projects.filter(p => {
      if (!searchQuery) return true;
      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const groups: Record<string, ProjectItem[]> = {
      starred: [],
      figma: [],
      recent: [],
    };

    filtered.forEach(p => {
      if (groups[p.group]) {
        groups[p.group].push(p);
      } else {
        groups.recent.push(p);
      }
    });

    // Sort each group by MRU (most recently used first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.lastAccessTime - a.lastAccessTime);
    });

    return groups;
  }, [projects, searchQuery]);

  const selected = projects.find(p => p.id === selectedProject);

  const handleCreate = (project: ProjectItem) => {
    setProjects(prev => [project, ...prev]);
    setSelectedProject(project.id);
    addLog('success', 'PROJECTS', `Created project: ${project.name}`);
  };

  const handleDelete = (id: string) => {
    const proj = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject === id) setSelectedProject(null);
    setConfirmDelete(null);
    if (proj) addLog('warn', 'PROJECTS', `Deleted project: ${proj.name}`);
  };

  const handleToggleStar = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const isStarred = p.group === 'starred';
      return { ...p, group: isStarred ? 'recent' : 'starred', stars: isStarred ? 0 : 1 };
    }));
  };

  const handleStatusChange = (id: string, status: ProjectItem["status"]) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, status } : p
    ));
    addLog('info', 'PROJECTS', `Updated project status: ${id} → ${status}`);
  };

  return (
    <div className="flex h-full bg-[#050505] text-foreground font-sans overflow-hidden animate-in fade-in duration-500 w-full">
      {isMobile ? (
        mobileShowDetail && selected ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-3 border-b border-white/5 bg-black/30">
              <Button variant="ghost" size="sm" className="text-xs font-mono gap-1 text-zinc-400" onClick={() => setMobileShowDetail(false)}>
                <ArrowLeft className="w-3 h-3" /> BACK
              </Button>
            </div>
            {renderInteractionArea(selected)}
          </div>
        ) : (
          renderGroupedSidebar()
        )
      ) : (
        <PanelGroup direction="horizontal" className="h-full w-full">
          {/* Left: Grouped Project Navigation */}
          <Panel defaultSize={isTablet ? 28 : 22} minSize={16} maxSize={35} id="projects-nav" order={1}>
            {renderGroupedSidebar()}
          </Panel>
          <PanelResizeHandle className="w-1 bg-white/5 hover:bg-primary/30 active:bg-primary/50 transition-colors cursor-col-resize relative group">
            <div className="absolute inset-y-0 -left-1 -right-1" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-zinc-600 group-hover:bg-primary/60 transition-colors" />
          </PanelResizeHandle>

          {/* Center: Interaction Area */}
          <Panel minSize={30} id="projects-interaction" order={2}>
            <div className="flex-1 flex flex-col min-w-0 h-full">
              {selected ? renderInteractionArea(selected) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500 font-mono text-sm">
                  <div className="text-center">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>SELECT_PROJECT_TO_VIEW</p>
                    <p className="text-[10px] text-zinc-600 mt-1">选择一个项目查看详情</p>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          {/* Right: Document Panel with Toolbar */}
          {docPanelOpen && selected && (
            <>
              <PanelResizeHandle className="w-1 bg-white/5 hover:bg-primary/30 active:bg-primary/50 transition-colors cursor-col-resize relative group">
                <div className="absolute inset-y-0 -left-1 -right-1" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-zinc-600 group-hover:bg-primary/60 transition-colors" />
              </PanelResizeHandle>
              <Panel defaultSize={isTablet ? 35 : 40} minSize={25} id="projects-doc" order={3}>
                {renderDocumentPanel(selected)}
              </Panel>
            </>
          )}
        </PanelGroup>
      )}

      <CreateProjectDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[380px] max-w-[95vw] bg-zinc-900 border border-red-500/20 rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-mono text-white">DELETE_PROJECT</h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {projects.find(p => p.id === confirmDelete)?.name}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mb-4">此操作不可逆。项目及其所有关联数据将被永久删除。</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="text-xs font-mono" onClick={() => setConfirmDelete(null)}>CANCEL</Button>
              <Button variant="destructive" className="text-xs font-mono gap-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20" onClick={() => handleDelete(confirmDelete)}>
                <Trash2 className="w-3 h-3" /> CONFIRM_DELETE
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // === Grouped Sidebar with Starred/Figma/Recent ===
  function renderGroupedSidebar() {
    return (
      <div className="h-full border-r border-white/5 flex flex-col bg-black/30">
        {/* Header */}
        <div className="p-3 border-b border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-white flex items-center gap-2 font-mono">
              <FolderOpen className="w-4 h-4 text-primary" />
              项目导航
            </h2>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-zinc-500 hover:text-primary" onClick={() => setShowCreate(true)}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-zinc-500 hover:text-primary">
                <Filter className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
            <Input
              placeholder="搜索项目..."
              className="pl-8 h-7 bg-zinc-900/60 border-white/5 text-xs font-mono"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grouped Project List */}
        <ScrollArea className="flex-1">
          <div className="p-1.5 space-y-1">
            {(["starred", "figma", "recent"] as const).map(groupKey => {
              const config = GROUP_CONFIG[groupKey];
              const GroupIcon = config.icon;
              const items = groupedProjects[groupKey] || [];
              const isExpanded = expandedGroups[groupKey];

              return (
                <div key={groupKey}>
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors group"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
                    )}
                    <GroupIcon className={cn("w-3.5 h-3.5 shrink-0", config.color)} />
                    <span className="text-[11px] font-mono text-zinc-400 flex-1 text-left">{config.label}</span>
                    <span className="text-[9px] text-zinc-600 font-mono">{items.length}</span>
                  </button>

                  {/* Group Items */}
                  {isExpanded && items.length > 0 && (
                    <div className="ml-3 pl-2 border-l border-white/5 space-y-0.5 mb-1">
                      {items.map(project => {
                        const TypeIcon = typeIcons[project.type] || Terminal;
                        const HealthIcon = healthConfig[project.health].icon;
                        return (
                          <button
                            key={project.id}
                            onClick={() => handleSelectProject(project.id)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded transition-all group/item",
                              selectedProject === project.id
                                ? "bg-primary/10 border-l-2 border-primary"
                                : "hover:bg-white/5 border-l-2 border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <TypeIcon className={cn(
                                "w-3 h-3 shrink-0",
                                selectedProject === project.id ? "text-primary" : "text-zinc-600"
                              )} />
                              <span className={cn(
                                "text-xs font-mono truncate flex-1",
                                selectedProject === project.id ? "text-primary" : "text-zinc-300"
                              )}>
                                {project.name}
                              </span>
                              <HealthIcon className={cn("w-2.5 h-2.5 shrink-0", healthConfig[project.health].className)} />
                            </div>
                            <p className="text-[9px] text-zinc-600 mt-0.5 truncate ml-5">{project.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isExpanded && items.length === 0 && (
                    <div className="ml-5 pl-2 py-2 text-[9px] text-zinc-700 font-mono">EMPTY</div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Queue / Stats Footer */}
        <div className="p-2 border-t border-white/5 bg-black/20">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div>
              <div className="text-xs font-mono text-white">{projects.length}</div>
              <div className="text-[8px] text-zinc-500 uppercase font-mono">Total</div>
            </div>
            <div>
              <div className="text-xs font-mono text-green-500">{projects.filter(p => p.group === 'starred').length}</div>
              <div className="text-[8px] text-zinc-500 uppercase font-mono">Starred</div>
            </div>
            <div>
              <div className="text-xs font-mono text-amber-500">{projects.reduce((acc, p) => acc + p.services, 0)}</div>
              <div className="text-[8px] text-zinc-500 uppercase font-mono">Services</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === Center: Interaction Area ===
  function renderInteractionArea(sel: ProjectItem) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Project Header */}
        <div className="p-4 border-b border-white/5 bg-black/20">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm text-white font-mono">{sel.name}</h2>
                <Badge variant="outline" className={cn("text-[9px]", statusConfig[sel.status].className)}>{statusConfig[sel.status].label}</Badge>
              </div>
              <p className="text-[11px] text-zinc-500">{sel.description}</p>
            </div>
            <div className="flex gap-1 shrink-0 items-center">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-400 hover:text-amber-500" onClick={() => handleToggleStar(sel.id)}>
                <Star className={cn("w-3.5 h-3.5", sel.group === 'starred' && "fill-amber-500 text-amber-500")} />
              </Button>
              {!isMobile && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-primary"
                  onClick={() => setDocPanelOpen(!docPanelOpen)}
                  title={docPanelOpen ? "收起文档面板" : "展开文档面板"}
                >
                  {docPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500" onClick={() => setConfirmDelete(sel.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Info Bar */}
          <div className="flex gap-4 mt-3 flex-wrap">
            {[
              { label: "Lang", value: sel.language, icon: <div className={cn("w-2 h-2 rounded-full", sel.languageColor)} /> },
              { label: "Branch", value: sel.branch, icon: <GitBranch className="w-3 h-3 text-zinc-500" /> },
              { label: "Svcs", value: String(sel.services), icon: <Server className="w-3 h-3 text-zinc-500" /> },
              { label: "Commit", value: sel.lastCommit, icon: <Clock className="w-3 h-3 text-zinc-500" /> },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-1">
                {stat.icon}
                <span className="text-[10px] text-zinc-600 font-mono">{stat.label}:</span>
                <span className="text-[10px] text-zinc-300 font-mono">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interaction Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* File Tree */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader className="py-2.5 px-3 border-b border-white/5">
                <CardTitle className="text-xs font-mono flex items-center gap-2 text-zinc-400">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" /> FILE_TREE
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-0.5">{FILE_TREE.map((node, idx) => <FileTreeItem key={`${node.name}-${idx}`} node={node} />)}</div>
              </CardContent>
            </Card>

            {/* Recent Commits */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader className="py-2.5 px-3 border-b border-white/5">
                <CardTitle className="text-xs font-mono flex items-center gap-2 text-zinc-400">
                  <GitCommit className="w-3.5 h-3.5 text-primary" /> RECENT_COMMITS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {RECENT_COMMITS.map(commit => (
                  <div key={commit.hash} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <span className="text-[10px] font-mono text-primary shrink-0">{commit.hash.substring(0, 7)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 font-mono truncate">{commit.message}</p>
                      <span className="text-[10px] text-zinc-600 font-mono">{commit.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Files", value: "162", sub: "+15 this week", color: "text-blue-500" },
                { label: "Lines of Code", value: "31.2K", sub: "+2.8K this week", color: "text-green-500" },
                { label: "Test Coverage", value: "87.3%", sub: "Phase 23 validated", color: "text-amber-500" },
                { label: "Build Time", value: "1m 56s", sub: "esbuild optimized", color: "text-purple-500" },
              ].map(stat => (
                <Card key={stat.label} className="bg-zinc-900/40 border-white/5">
                  <CardContent className="p-3">
                    <div className={cn("text-lg font-mono", stat.color)}>{stat.value}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{stat.label}</div>
                    <div className="text-[9px] text-zinc-600 font-mono">{stat.sub}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // === Right: Document Panel with Visual Toolbar ===
  function renderDocumentPanel(sel: ProjectItem) {
    return (
      <div className="h-full flex flex-col bg-black/20 border-l border-white/5">
        {/* Document Toolbar — Visual Icons + Expand/Collapse */}
        <div className="h-10 border-b border-white/5 flex items-center px-2 gap-1 bg-black/30 shrink-0">
          {/* Left: Navigation & View Controls */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-primary"
            onClick={() => setDocPanelOpen(false)}
            title="收起面板"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-4 bg-white/10 mx-0.5" />

          {/* View Mode Toggle Icons */}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 transition-colors", docViewMode === 'preview' ? "text-primary bg-primary/10" : "text-zinc-500 hover:text-zinc-300")}
            onClick={() => setDocViewMode('preview')}
            title="预览模式"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 transition-colors", docViewMode === 'code' ? "text-primary bg-primary/10" : "text-zinc-500 hover:text-zinc-300")}
            onClick={() => setDocViewMode('code')}
            title="代码模式"
          >
            <Code2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 transition-colors", docViewMode === 'split' ? "text-primary bg-primary/10" : "text-zinc-500 hover:text-zinc-300")}
            onClick={() => setDocViewMode('split')}
            title="分屏模式"
          >
            <Columns className="w-3.5 h-3.5" />
          </Button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0 mx-2">
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 truncate">
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">{sel.name}</span>
              <ChevronRight className="w-2.5 h-2.5 text-zinc-700" />
              <span className="text-zinc-500">package.json</span>
            </div>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-primary" title="复制路径">
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-primary" title="刷新">
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-primary" title="外部打开">
              <ExternalLink className="w-3 h-3" />
            </Button>

            <div className="w-px h-4 bg-white/10 mx-0.5" />

            {/* Expand/Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-500 hover:text-primary"
              onClick={() => setDocPanelOpen(false)}
              title="折叠文档区"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-300" title="更多操作">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="h-8 border-b border-white/5 flex items-center px-2 bg-black/20 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-0.5 text-[10px] font-mono">
            <button className="px-2.5 py-1 rounded text-primary bg-primary/10 border-b border-primary">
              package.json
            </button>
            <button className="px-2.5 py-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
              tsconfig.json
            </button>
            <button className="px-2.5 py-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
              README.md
            </button>
          </div>
        </div>

        {/* Document Content */}
        <ScrollArea className="flex-1">
          {docViewMode === 'code' && (
            <div className="p-0 font-mono text-xs">
              {/* Line-numbered code display */}
              <div className="flex">
                <div className="w-12 shrink-0 text-right pr-3 select-none">
                  {Array.from({ length: 25 }, (_, i) => (
                    <div key={i} className="text-[10px] text-zinc-700 py-[1px]">{i + 1}</div>
                  ))}
                </div>
                <div className="flex-1 text-[11px] overflow-x-auto">
                  <pre className="text-zinc-300 leading-[18px]">
                    <span className="text-zinc-600">{'{'}</span>{'\n'}
                    <span className="text-cyan-400">{`  "name"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"${sel.name}"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`  "version"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"1.0.0"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`  "description"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"${sel.description}"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`  "main"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"dist/index.js"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`  "type"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"module"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`  "scripts"`}</span><span className="text-zinc-500">:</span> <span className="text-zinc-600">{'{'}</span>{'\n'}
                    <span className="text-cyan-400">{`    "dev"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"vite dev"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`    "build"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"vite build"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`    "test"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"vitest run"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`    "lint"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"eslint src/**/*.{ts,tsx}"`}</span>{'\n'}
                    <span className="text-zinc-600">{'  }'}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`  "dependencies"`}</span><span className="text-zinc-500">:</span> <span className="text-zinc-600">{'{'}</span>{'\n'}
                    <span className="text-cyan-400">{`    "react"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"^18.3.1"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`    "react-dom"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"^18.3.1"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`    "zustand"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"^5.0.11"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`    "tailwindcss"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"^4.1.12"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`    "lucide-react"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"^0.487.0"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`    "recharts"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"^2.15.2"`}</span>{'\n'}
                    <span className="text-zinc-600">{'  }'}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`  "devDependencies"`}</span><span className="text-zinc-500">:</span> <span className="text-zinc-600">{'{'}</span>{'\n'}
                    <span className="text-cyan-400">{`    "vite"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"^6.3.5"`}</span><span className="text-zinc-500">,</span>{'\n'}
                    <span className="text-cyan-400">{`    "@vitejs/plugin-react"`}</span><span className="text-zinc-500">:</span> <span className="text-green-400">{`"^4.7.0"`}</span>{'\n'}
                    <span className="text-zinc-600">{'  }'}</span>{'\n'}
                    <span className="text-zinc-600">{'}'}</span>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {docViewMode === 'preview' && (
            <div className="p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center mb-4 animate-pulse-slow">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-mono text-zinc-300 mb-2">PREVIEW_MODE</h3>
              <p className="text-[11px] text-zinc-600 font-mono max-w-xs">
                项目 "{sel.name}" 的可视化预览区。选择文件后自动渲染预览内容。
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
                <Card className="bg-zinc-900/60 border-white/5">
                  <CardContent className="p-3 text-center">
                    <div className="text-sm font-mono text-primary">{sel.services}</div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">服务实例</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/60 border-white/5">
                  <CardContent className="p-3 text-center">
                    <div className="text-sm font-mono text-green-500">{sel.health === 'healthy' ? '100%' : sel.health === 'warning' ? '87%' : '42%'}</div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">健康度</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {docViewMode === 'split' && (
            <div className="flex h-full min-h-[400px]">
              <div className="flex-1 border-r border-white/5 p-3">
                <div className="text-[10px] text-zinc-600 font-mono mb-2 uppercase">Source</div>
                <pre className="text-[10px] text-zinc-400 font-mono leading-relaxed overflow-x-auto">
{`{
  "name": "${sel.name}",
  "version": "1.0.0",
  "type": "module"
}`}
                </pre>
              </div>
              <div className="flex-1 p-3">
                <div className="text-[10px] text-zinc-600 font-mono mb-2 uppercase">Preview</div>
                <div className="space-y-2">
                  <div className="text-xs text-zinc-300 font-mono">{sel.name}</div>
                  <Badge variant="outline" className={statusConfig[sel.status].className}>{statusConfig[sel.status].label}</Badge>
                  <p className="text-[10px] text-zinc-500">{sel.description}</p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Document Footer */}
        <div className="h-7 border-t border-white/5 bg-black/30 flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-600">
            <span>JSON</span>
            <span>UTF-8</span>
            <span>LF</span>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-600">
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
          </div>
        </div>
      </div>
    );
  }
}