import * as React from "react";
import {
  X, Copy, Download, Code2, Eye, ChevronLeft, ChevronRight,
  RefreshCw, ExternalLink, Maximize2, Minimize2,
  ChevronDown, File,
  Globe, MonitorPlay, Smartphone,
  Star, Search, LayoutGrid, MoreHorizontal,
  Plus, Layers, Server, Bot, Wrench, Rocket, Hash
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTranslation } from "@/lib/i18n";
import { useSystemStore } from "@/lib/store";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface ArtifactsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: {
    code: string;
    language: string;
    title: string;
  } | null;
}

// --- Project Navigation Data ---
interface NavCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  description?: string;
  type: 'module' | 'service' | 'agent' | 'tool' | 'config';
}

const PROJECT_NAV_DATA: NavCategory[] = [
  {
    id: "core", label: "核心模块", icon: Layers,
    items: [
      { id: "chat-engine", label: "ChatEngine", description: "对话引擎核心", type: "module" },
      { id: "neural-link", label: "NeuralLink", description: "意图解析引擎", type: "module" },
      { id: "artifact-renderer", label: "ArtifactRenderer", description: "制品渲染器", type: "module" },
      { id: "state-manager", label: "StateManager", description: "全局状态管理", type: "module" },
      { id: "event-bus", label: "EventBus", description: "事件总线", type: "module" },
    ]
  },
  {
    id: "infra", label: "基础设施", icon: Server,
    items: [
      { id: "nas-connector", label: "NAS Connector", description: "铁威马F4-423连接", type: "service" },
      { id: "ws-gateway", label: "WebSocket Gateway", description: "实时数据网关", type: "service" },
      { id: "metrics-engine", label: "MetricsEngine", description: "集群指标引擎", type: "service" },
      { id: "persistence", label: "PersistenceEngine", description: "数据持久化层", type: "service" },
      { id: "docker-runtime", label: "Docker Runtime", description: "容器运行时", type: "service" },
    ]
  },
  {
    id: "agents", label: "智能体集群", icon: Bot,
    items: [
      { id: "navigator", label: "Navigator 领航员", description: "任务分发与路由", type: "agent" },
      { id: "sentinel", label: "Sentinel 哨兵", description: "安全审计与监控", type: "agent" },
      { id: "thinker", label: "Thinker 思想家", description: "深度推理与分析", type: "agent" },
      { id: "prophet", label: "Prophet 先知", description: "预测与趋势分析", type: "agent" },
      { id: "bole", label: "Bole 伯乐", description: "人才与资源优化", type: "agent" },
      { id: "pivot", label: "Pivot 天枢", description: "架构核心枢纽", type: "agent" },
      { id: "grandmaster", label: "Grandmaster 宗师", description: "总控与决策", type: "agent" },
    ]
  },
  {
    id: "tools", label: "工具链", icon: Wrench,
    items: [
      { id: "mcp-figma", label: "Figma MCP", description: "设计转代码", type: "tool" },
      { id: "mcp-github", label: "GitHub MCP", description: "代码仓库接入", type: "tool" },
      { id: "mcp-docker", label: "Docker MCP", description: "容器编排", type: "tool" },
      { id: "mcp-filesystem", label: "Filesystem MCP", description: "本地文件操作", type: "tool" },
      { id: "mcp-postgres", label: "PostgreSQL MCP", description: "数据库查询", type: "tool" },
    ]
  },
  {
    id: "deploy", label: "部署与运维", icon: Rocket,
    items: [
      { id: "ci-cd", label: "CI/CD Pipeline", description: "持续集成/交付", type: "service" },
      { id: "smoke-test", label: "Smoke Test", description: "冒烟测试套件", type: "tool" },
      { id: "test-framework", label: "Test Framework", description: "测试框架管理", type: "tool" },
      { id: "remote-deploy", label: "Remote Deploy", description: "远程容器部署", type: "service" },
    ]
  },
];

// Type badge color map
const TYPE_COLORS: Record<NavItem['type'], string> = {
  module: 'text-amber-400 bg-amber-500/10',
  service: 'text-emerald-400 bg-emerald-500/10',
  agent: 'text-purple-400 bg-purple-500/10',
  tool: 'text-cyan-400 bg-cyan-500/10',
  config: 'text-zinc-400 bg-zinc-500/10',
};

// --- Project Nav Category ---
function ProjectNavCategory({
  category,
  favorites,
  onToggleFav,
  selectedId,
  onSelect,
}: {
  category: NavCategory;
  favorites: Set<string>;
  onToggleFav: (id: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(true);
  const Icon = category.icon;

  return (
    <div className="mb-1">
      {/* Level 1 - Category Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-[#0EA5E9]/5 rounded-md text-[11px] font-mono uppercase tracking-widest group transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0 transition-transform" />
        ) : (
          <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0 transition-transform" />
        )}
        <Icon className="w-3.5 h-3.5 text-[#0EA5E9] shrink-0" />
        <span className="text-[#0EA5E9]/80 group-hover:text-[#0EA5E9]">{category.label}</span>
        <span className="ml-auto text-[9px] text-zinc-600">{category.items.length}</span>
      </button>

      {/* Level 2 - Items */}
      {isOpen && (
        <div className="ml-2 border-l border-[#0EA5E9]/10 pl-1">
          {category.items.map(item => {
            const isFav = favorites.has(item.id);
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[11px] cursor-pointer group/item transition-all ml-1",
                  isSelected
                    ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                    : "hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
                )}
                onClick={() => onSelect(item.id)}
              >
                {/* Star toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFav(item.id); }}
                  className={cn(
                    "shrink-0 transition-all hover:scale-125",
                    isFav ? "text-amber-400" : "text-zinc-700 group-hover/item:text-zinc-500"
                  )}
                  title={isFav ? "取消收藏" : "收藏"}
                >
                  <Star className={cn("w-3 h-3", isFav && "fill-amber-400")} />
                </button>

                {/* Label + Desc */}
                <div className="min-w-0 flex-1">
                  <div className="font-mono truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-[9px] text-zinc-600 truncate">{item.description}</div>
                  )}
                </div>

                {/* Type badge */}
                <span className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded font-mono shrink-0 hidden group-hover/item:inline-block",
                  TYPE_COLORS[item.type]
                )}>
                  {item.type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Preview Viewport Sizes ---
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export function ArtifactsPanel({ isOpen, onClose, artifact }: ArtifactsPanelProps) {
  const { t } = useTranslation();
  const isMobile = useSystemStore((s) => s.isMobile);
  const navFavoritesArr = useSystemStore((s) => s.navFavorites);
  const toggleNavFavorite = useSystemStore((s) => s.toggleNavFavorite);
  const [activeTab, setActiveTab] = React.useState<'code' | 'preview'>('code');
  const [isMaximized, setIsMaximized] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [selectedNavItem, setSelectedNavItem] = React.useState("chat-engine");
  const [previewViewport, setPreviewViewport] = React.useState<ViewportSize>('desktop');
  const [navSearch, setNavSearch] = React.useState("");
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Derive favorites Set from Zustand array (with defaults for first-time)
  const favorites = React.useMemo(() => {
    if (navFavoritesArr.length === 0) {
      return new Set(["navigator", "nas-connector", "mcp-figma"]);
    }
    return new Set(navFavoritesArr);
  }, [navFavoritesArr]);

  // Toggle favorite via Zustand
  const handleToggleFav = React.useCallback((id: string) => {
    // If using defaults (store empty), initialize store first
    if (navFavoritesArr.length === 0) {
      const defaults = ["navigator", "nas-connector", "mcp-figma"];
      const hasIt = defaults.includes(id);
      const next = hasIt ? defaults.filter(d => d !== id) : [...defaults, id];
      useSystemStore.getState().setNavFavorites(next);
    } else {
      toggleNavFavorite(id);
    }
  }, [navFavoritesArr, toggleNavFavorite]);

  // Build sorted nav data (favorites first as a category)
  const navDataWithFavorites = React.useMemo(() => {
    // Gather all favorite items from all categories
    const favItems: NavItem[] = [];
    PROJECT_NAV_DATA.forEach(cat => {
      cat.items.forEach(item => {
        if (favorites.has(item.id)) {
          favItems.push(item);
        }
      });
    });

    const favCategory: NavCategory | null = favItems.length > 0
      ? { id: 'favorites', label: '收藏', icon: Star, items: favItems }
      : null;

    // Filter by search
    const filterItems = (items: NavItem[]) => {
      if (!navSearch.trim()) return items;
      const q = navSearch.toLowerCase();
      return items.filter(i =>
        i.label.toLowerCase().includes(q) ||
        (i.description?.toLowerCase().includes(q))
      );
    };

    const result: NavCategory[] = [];
    if (favCategory && !navSearch.trim()) {
      result.push(favCategory);
    }
    PROJECT_NAV_DATA.forEach(cat => {
      const filtered = filterItems(cat.items);
      if (filtered.length > 0) {
        result.push({ ...cat, items: filtered });
      }
    });
    return result;
  }, [favorites, navSearch]);

  // Auto-switch to preview after artifact is loaded
  React.useEffect(() => {
    if (artifact?.code) {
      setActiveTab('preview');
    }
  }, [artifact?.code]);

  const handleCopy = React.useCallback(() => {
    if (artifact?.code) {
      navigator.clipboard.writeText(artifact.code).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [artifact?.code]);

  // Generate an HTML document for iframe preview
  const previewHtml = React.useMemo(() => {
    if (!artifact?.code) return '';
    const isReact = artifact.language === 'tsx' || artifact.language === 'typescript' || artifact.language === 'jsx';
    const isHtml = artifact.language === 'html';

    if (isHtml) {
      return artifact.code;
    }

    if (isReact) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #1a1a1a; }
    .preview-container { padding: 2rem; min-height: 100vh; }
    pre { background: #f3f4f6; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 13px; border: 1px solid #e5e7eb; }
    code { font-family: 'SF Mono', 'Fira Code', monospace; }
  </style>
</head>
<body>
  <div class="preview-container">
    <div style="margin-bottom: 1rem; padding: 0.75rem 1rem; background: linear-gradient(135deg, #0EA5E9, #3b82f6); border-radius: 8px; color: white; font-size: 13px; font-family: monospace;">
      LIVE_PREVIEW — ${artifact.title}
    </div>
    <pre><code>${artifact.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
  </div>
</body>
</html>`;
    }

    // Fallback: wrap code in pre
    return `<!DOCTYPE html>
<html><head><style>
  body { margin: 0; padding: 2rem; font-family: monospace; background: #fafafa; color: #333; font-size: 13px; }
  pre { white-space: pre-wrap; word-wrap: break-word; }
</style></head>
<body><pre>${artifact.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`;
  }, [artifact]);

  if (!isOpen) return null;

  const viewportWidths: Record<ViewportSize, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out z-10 animate-in fade-in duration-200",
      isMobile ? "w-full" : "w-full",
      isMaximized && "fixed inset-0 z-50"
    )}>
      {/* === Top Toolbar === */}
      <div className="h-10 border-b border-[#0EA5E9]/20 flex items-center px-2 bg-background/80 backdrop-blur-sm shrink-0">
        {/* Left: Collapse + View Mode Toggle */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-[#0EA5E9] transition-colors"
            onClick={onClose}
            title="收起面板"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-4 bg-[#0EA5E9]/20 mx-1" />

          {/* Eye (Preview) / Code Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 transition-all",
              activeTab === 'preview'
                ? "text-[#0EA5E9] bg-[#0EA5E9]/10 shadow-[0_0_8px_rgba(14,165,233,0.2)]"
                : "text-zinc-500 hover:text-[#0EA5E9]"
            )}
            onClick={() => setActiveTab('preview')}
            title="预览模式"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 transition-all",
              activeTab === 'code'
                ? "text-[#0EA5E9] bg-[#0EA5E9]/10 shadow-[0_0_8px_rgba(14,165,233,0.2)]"
                : "text-zinc-500 hover:text-[#0EA5E9]"
            )}
            onClick={() => setActiveTab('code')}
            title="源码模式"
          >
            <Code2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Center: Viewport selector (preview mode only) + Breadcrumb */}
        <div className="flex-1 min-w-0 mx-3 flex items-center gap-2">
          {activeTab === 'preview' && (
            <div className="flex items-center gap-0.5 border border-[#0EA5E9]/15 rounded-md px-0.5 py-0.5 bg-background/50">
              {([
                { key: 'desktop' as ViewportSize, icon: MonitorPlay, label: 'Desktop' },
                { key: 'tablet' as ViewportSize, icon: Globe, label: 'Tablet' },
                { key: 'mobile' as ViewportSize, icon: Smartphone, label: 'Mobile' },
              ]).map(vp => (
                <Button
                  key={vp.key}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-5 w-5 transition-colors",
                    previewViewport === vp.key
                      ? "text-[#0EA5E9] bg-[#0EA5E9]/10"
                      : "text-zinc-600 hover:text-[#0EA5E9]"
                  )}
                  onClick={() => setPreviewViewport(vp.key)}
                  title={vp.label}
                >
                  <vp.icon className="w-3 h-3" />
                </Button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 truncate">
            {activeTab === 'code' ? (
              <>
                <span className="text-[#0EA5E9]">/</span>
                <span className="text-zinc-400">{selectedNavItem}</span>
              </>
            ) : (
              <>
                <span className="text-[#0EA5E9] uppercase tracking-wider">{t('chat.artifacts')}</span>
                <ChevronRight className="w-2.5 h-2.5 text-zinc-700" />
                <span className="text-zinc-400 truncate">{artifact?.title || 'untitled'}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Action Icons */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 transition-colors", copied ? "text-green-500" : "text-zinc-500 hover:text-[#0EA5E9]")}
            onClick={handleCopy}
            title={copied ? "已复制" : "复制代码"}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-[#0EA5E9]" title="下载">
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-[#0EA5E9]"
            onClick={() => {
              if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src; // reload
              }
            }}
            title="刷新预览"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-[#0EA5E9]" title="外部打开">
            <ExternalLink className="w-3 h-3" />
          </Button>

          <div className="w-px h-4 bg-[#0EA5E9]/20 mx-0.5" />

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-500 hover:text-[#0EA5E9]"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "还原" : "最大化"}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-destructive hover:rotate-90 transition-all"
            onClick={onClose}
            title="关闭"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* === Content Area === */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'code' ? (
          /* Code mode: Project Nav (left) + Code Editor (right) with internal resizable split */
          <PanelGroup direction="horizontal" className="h-full w-full">
            {/* Project Navigation Panel */}
            <Panel defaultSize={28} minSize={15} maxSize={45} id="project-nav" order={1}>
              <div className="h-full flex flex-col border-r border-[#0EA5E9]/10 bg-[#0a0a0a]">
                {/* Nav Toolbar */}
                <div className="h-8 border-b border-[#0EA5E9]/10 flex items-center px-2 gap-1 shrink-0 bg-[#0d0d0d]">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-[#0EA5E9]" title="新建">
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-[#0EA5E9]" title="复制">
                    <Copy className="w-3 h-3" />
                  </Button>
                  <div className="flex-1 min-w-0 mx-1">
                    <div className="relative">
                      <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-zinc-600" />
                      <input
                        type="text"
                        placeholder="搜索..."
                        value={navSearch}
                        onChange={(e) => setNavSearch(e.target.value)}
                        className="w-full h-5 pl-5 pr-1 bg-white/5 border border-[#0EA5E9]/10 rounded text-[10px] font-mono text-zinc-400 placeholder:text-zinc-700 focus:outline-none focus:border-[#0EA5E9]/30 transition-colors"
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-[#0EA5E9]" title="布局">
                    <LayoutGrid className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-[#0EA5E9]" title="更多">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>

                {/* Project Name Header */}
                <div className="h-8 border-b border-[#0EA5E9]/10 flex items-center px-3 gap-2 shrink-0 bg-[#0d0d0d]">
                  <Hash className="w-3 h-3 text-[#0EA5E9]" />
                  <span className="text-[10px] font-mono text-[#0EA5E9]/80 uppercase tracking-widest truncate">
                    {artifact?.title?.split('.')[0] || 'YYC3_DEVOPS'}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] text-zinc-600 font-mono">ONLINE</span>
                  </div>
                </div>

                {/* Navigation Items */}
                <ScrollArea className="flex-1">
                  <div className="py-2 px-1">
                    {navDataWithFavorites.map(cat => (
                      <ProjectNavCategory
                        key={cat.id}
                        category={cat}
                        favorites={favorites}
                        onToggleFav={handleToggleFav}
                        selectedId={selectedNavItem}
                        onSelect={setSelectedNavItem}
                      />
                    ))}
                  </div>
                </ScrollArea>

                {/* Nav Footer Stats */}
                <div className="h-7 border-t border-[#0EA5E9]/10 flex items-center justify-between px-3 shrink-0 bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-600">
                    <Star className="w-2.5 h-2.5 text-amber-500" />
                    <span>{favorites.size} 收藏</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-600">
                    {PROJECT_NAV_DATA.reduce((sum, c) => sum + c.items.length, 0)} 项
                  </div>
                </div>
              </div>
            </Panel>

            {/* Internal Resize Handle */}
            <PanelResizeHandle className="w-[2px] relative group/inner hover:w-[3px] transition-all">
              <div className="absolute inset-0 bg-[#0EA5E9]/10 group-hover/inner:bg-[#0EA5E9]/40 transition-colors" />
            </PanelResizeHandle>

            {/* Code Editor Panel */}
            <Panel defaultSize={72} minSize={40} id="code-editor" order={2}>
              <div className="h-full flex flex-col bg-[#0d0d0d]">
                {/* Tab Bar */}
                <div className="h-8 border-b border-[#0EA5E9]/10 flex items-center px-2 bg-[#0a0a0a] shrink-0">
                  <div className="flex items-center gap-0.5 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-t bg-[#0d0d0d] border-b-2 border-[#0EA5E9] text-[#0EA5E9]">
                      <File className="w-3 h-3" />
                      <span>{selectedNavItem}</span>
                      <button className="ml-1 text-zinc-600 hover:text-zinc-300 transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Code Content */}
                <ScrollArea className="flex-1">
                  {artifact ? (
                    <div className="text-xs font-mono">
                      <SyntaxHighlighter
                        language={artifact.language}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                        showLineNumbers={true}
                        lineNumberStyle={{ minWidth: "2.5em", paddingRight: "1em", color: "#333", textAlign: "right" }}
                      >
                        {artifact.code}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600 font-mono text-sm p-8">
                      <div className="text-center">
                        <Code2 className="w-10 h-10 mx-auto mb-3 text-[#0EA5E9]/20" />
                        <p>SELECT_MODULE_TO_VIEW</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Panel>
          </PanelGroup>
        ) : (
          /* Preview mode: Full-width iframe preview */
          <div className="h-full flex flex-col bg-[#fafafa]">
            {artifact?.code ? (
              <div className="flex-1 flex items-start justify-center overflow-auto p-0 bg-white">
                <div
                  className={cn(
                    "h-full transition-all duration-300 border-x border-zinc-200/50",
                    previewViewport === 'desktop' && "w-full",
                    previewViewport !== 'desktop' && "shadow-lg rounded-lg my-4"
                  )}
                  style={{
                    width: viewportWidths[previewViewport],
                    maxWidth: '100%',
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    srcDoc={previewHtml}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="Live Preview"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0d0d0d]">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#0EA5E9]/30 flex items-center justify-center mb-4 animate-pulse-slow">
                  <Eye className="w-6 h-6 text-[#0EA5E9]" />
                </div>
                <h3 className="text-sm font-mono text-foreground mb-2">PREVIEW_MODE</h3>
                <p className="text-xs text-muted-foreground font-mono max-w-xs">
                  智能编程完成后自动渲染预览。输入指令开始编程。
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === Footer Status Bar === */}
      <div className="h-7 border-t border-[#0EA5E9]/20 bg-background/80 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-mono">
          <span className="text-[#0EA5E9]">{activeTab === 'preview' ? 'LIVE_PREVIEW' : artifact?.language?.toUpperCase() || 'CODE'}</span>
          <span>UTF-8</span>
          {activeTab === 'preview' && (
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              RENDERING
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-mono">
          {artifact && activeTab === 'code' && <span>{artifact.code.split('\n').length} lines</span>}
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}