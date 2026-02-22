import React from "react";
import {
  Terminal,
  FolderOpen,
  Package,
  User,
  PlusCircle,
  TerminalSquare,
  Activity,
  Pin,
  PinOff,
  Menu,
  X,
  Settings,
  Github,
  Globe,
  BookOpen,
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { useTranslation } from "@/lib/i18n";
import { useSystemStore } from "@/lib/store";
import { loadBranding, type BrandingConfig } from "@/lib/branding-config";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onNewSession: () => void;
  onOpenSettings: (tab?: string) => void;
}

// Export utility buttons for header usage
export interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

// === Collapsed width / expanded width ===
const W_COLLAPSED = 56;
const W_EXPANDED = 224;

export function Sidebar({ activeView, onViewChange, onNewSession, onOpenSettings }: SidebarProps) {
  const { t } = useTranslation();
  const collapsed = useSystemStore((s) => s.sidebarCollapsed);
  const pinned = useSystemStore((s) => s.sidebarPinned);
  const isMobile = useSystemStore((s) => s.isMobile);
  const setSidebarCollapsed = useSystemStore((s) => s.setSidebarCollapsed);
  const toggleSidebarPin = useSystemStore((s) => s.toggleSidebarPin);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Branding — listen for updates from Settings
  const [branding, setBranding] = React.useState<BrandingConfig>(() => loadBranding());
  React.useEffect(() => {
    const handler = () => setBranding(loadBranding());
    window.addEventListener('yyc3-branding-update', handler);
    return () => window.removeEventListener('yyc3-branding-update', handler);
  }, []);

  // --- Hover sensing: expand on enter, collapse on leave (unless pinned) ---
  const handleMouseEnter = () => {
    if (pinned || isMobile) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setSidebarCollapsed(false);
  };

  const handleMouseLeave = () => {
    if (pinned || isMobile) return;
    hoverTimer.current = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 300);
  };

  // Clean up timer
  React.useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  // Close mobile drawer on view change
  const handleViewChange = (view: string) => {
    onViewChange(view);
    if (isMobile) setMobileOpen(false);
  };

  const isExpanded = isMobile ? mobileOpen : !collapsed;

  // --- Mobile: hamburger trigger ---
  if (isMobile) {
    return (
      <>
        {/* Mobile trigger bar */}
        <div className="fixed top-0 left-0 right-0 h-12 bg-black/90 backdrop-blur-md border-b border-white/5 flex items-center px-3 gap-3 z-40">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center border border-primary/50 text-primary font-mono text-[10px] overflow-hidden shrink-0">
            {branding.logoDataUrl ? (
              <img src={branding.logoDataUrl} alt="logo" className="w-full h-full object-cover" />
            ) : (
              branding.logoText || 'Y3'
            )}
          </div>
          <span className="font-mono text-xs text-primary tracking-wider truncate">{branding.appName || 'YYC3'}</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-zinc-500 font-mono">ONLINE</span>
          </div>
        </div>

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-[280px] h-full animate-in slide-in-from-left duration-200">
              <SidebarContent
                activeView={activeView}
                onViewChange={handleViewChange}
                onNewSession={() => { onNewSession(); setMobileOpen(false); }}
                onOpenSettings={(tab) => { onOpenSettings(tab); setMobileOpen(false); }}
                isExpanded={true}
                onClose={() => setMobileOpen(false)}
                t={t}
                branding={branding}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // --- Desktop: hover-sensing sidebar ---
  return (
    <div
      className="relative h-full shrink-0 z-20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: isExpanded ? W_EXPANDED : W_COLLAPSED,
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <SidebarContent
        activeView={activeView}
        onViewChange={handleViewChange}
        onNewSession={onNewSession}
        onOpenSettings={onOpenSettings}
        isExpanded={isExpanded}
        pinned={pinned}
        onTogglePin={toggleSidebarPin}
        t={t}
        branding={branding}
      />
    </div>
  );
}

// === Inner sidebar content (shared between mobile drawer + desktop) ===

interface SidebarContentProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onNewSession: () => void;
  onOpenSettings: (tab?: string) => void;
  isExpanded: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
  onClose?: () => void;
  t: (key: string) => string;
  branding: BrandingConfig;
}

function SidebarContent({
  activeView, onViewChange, onNewSession, onOpenSettings,
  isExpanded, pinned, onTogglePin, onClose, t, branding
}: SidebarContentProps) {
  return (
    <div className={cn(
      "flex flex-col h-full border-r border-border bg-card/80 backdrop-blur-sm overflow-hidden",
      isExpanded ? "w-full" : "w-[56px]"
    )}>
      {/* Logo Area */}
      <div className="p-3 border-b border-border flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 text-primary font-mono text-xs shrink-0 shadow-[0_0_10px_rgba(14,165,233,0.3)] overflow-hidden">
          {branding.logoDataUrl ? (
            <img src={branding.logoDataUrl} alt="logo" className="w-full h-full object-cover" />
          ) : (
            <span>{branding.logoText || 'Y3'}</span>
          )}
        </div>
        {isExpanded && (
          <div className="flex-1 min-w-0 animate-in fade-in duration-150">
            <h1 className="font-mono text-sm tracking-wider text-primary glow-text truncate">{branding.appName || 'YYC3_DEVOPS'}</h1>
            <p className="text-[10px] text-muted-foreground font-mono">{branding.tagline || 'v3.0.1-beta'}</p>
          </div>
        )}
        {isExpanded && onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-zinc-500" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
        {isExpanded && onTogglePin && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 shrink-0 transition-colors", pinned ? "text-primary" : "text-zinc-600 hover:text-zinc-400")}
            onClick={onTogglePin}
            title={pinned ? "取消固定" : "固定侧边栏"}
          >
            {pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className={cn("space-y-4", isExpanded ? "p-2" : "p-1 py-2")}>

          {/* Quick Action */}
          <div className={isExpanded ? "px-1" : "px-0.5"}>
            {isExpanded ? (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                onClick={onNewSession}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                {t('sidebar.new_session')}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 mx-auto border-primary/30 text-primary hover:bg-primary/10 flex"
                onClick={onNewSession}
                title={t('sidebar.new_session')}
              >
                <PlusCircle className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Core Views */}
          <div className="space-y-0.5">
            {isExpanded && (
              <h3 className="px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">SYSTEM</h3>
            )}
            <NavItem icon={Terminal} label={t('sidebar.terminal')} active={activeView === 'terminal'} collapsed={!isExpanded} onClick={() => onViewChange('terminal')} />
            <NavItem icon={TerminalSquare} label={t('sidebar.console')} active={activeView === 'console'} collapsed={!isExpanded} onClick={() => onViewChange('console')} />
            <NavItem icon={Activity} label={t('sidebar.monitor')} active={activeView === 'monitor'} collapsed={!isExpanded} onClick={() => onViewChange('monitor')} />
            <NavItem icon={FolderOpen} label={t('sidebar.projects')} active={activeView === 'projects'} collapsed={!isExpanded} onClick={() => onViewChange('projects')} />
            <NavItem icon={Package} label={t('sidebar.artifacts')} active={activeView === 'artifacts'} collapsed={!isExpanded} onClick={() => onViewChange('artifacts')} />
          </div>

          {/* Navigation & Tools */}
          <div className="space-y-0.5">
            {isExpanded && (
              <h3 className="px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">NAVIGATE</h3>
            )}
            <NavItem icon={Globe} label={t('sidebar.services')} active={activeView === 'services'} collapsed={!isExpanded} onClick={() => onViewChange('services')} />
            <NavItem icon={BookOpen} label={t('sidebar.knowledge')} active={activeView === 'knowledge'} collapsed={!isExpanded} onClick={() => onViewChange('knowledge')} />
            <NavItem icon={Bookmark} label={t('sidebar.bookmarks')} active={activeView === 'bookmarks'} collapsed={!isExpanded} onClick={() => onViewChange('bookmarks')} />
          </div>
        </div>
      </ScrollArea>

      {/* User Status + Quick Settings */}
      <div className={cn("border-t border-border mt-auto bg-black/20 shrink-0", isExpanded ? "p-3" : "p-2")}>
        {isExpanded ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center relative shrink-0">
                <User className="w-4 h-4 text-primary" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background shadow-[0_0_5px_#22c55e] animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono truncate text-primary/90">{t('agent.user')}</p>
                <p className="text-xs text-muted-foreground truncate font-mono">{t('sidebar.status_online')}</p>
              </div>
            </div>
            {/* Quick Settings Row */}
            <div className="flex items-center gap-1 pt-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-primary hover:bg-primary/10 transition-all"
                onClick={() => onOpenSettings('general')}
                title={t('sidebar.settings')}
              >
                <Settings className="w-3 h-3 shrink-0" />
                <span className="truncate">{t('sidebar.settings')}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-primary hover:bg-primary/10 transition-all"
                onClick={() => onOpenSettings('gitops')}
                title={t('sidebar.gitops')}
              >
                <Github className="w-3 h-3 shrink-0" />
                <span className="truncate">{t('sidebar.gitops')}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center relative">
              <User className="w-4 h-4 text-primary" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-zinc-600 hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => onOpenSettings('general')}
              title={t('sidebar.settings')}
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-zinc-600 hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => onOpenSettings('gitops')}
              title={t('sidebar.gitops')}
            >
              <Github className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// === NavItem with collapsed/expanded modes ===

function NavItem({ icon: Icon, label, active, collapsed, onClick }: NavItemProps) {
  if (collapsed) {
    return (
      <div className="flex justify-center px-1">
        <Button
          variant={active ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "w-10 h-10 relative group transition-all duration-200",
            active
              ? "bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(14,165,233,0.15)]"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={onClick}
          title={label}
        >
          <Icon className="w-4 h-4" />
          {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" />}
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 text-white text-[11px] font-mono rounded-md border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
            {label}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 font-mono text-xs h-9 transition-all duration-200",
        active
          ? "bg-primary/10 text-primary border-l-2 border-primary rounded-none pl-3 shadow-[inset_10px_0_20px_-10px_rgba(14,165,233,0.3)]"
          : "text-muted-foreground hover:text-foreground border-l-2 border-transparent pl-3 hover:translate-x-0.5"
      )}
      onClick={onClick}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Button>
  );
}