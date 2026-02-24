import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Slider } from '@/app/components/ui/slider';
import { Switch } from '@/app/components/ui/switch';
import {
  AGENT_COLOR_PRESETS,
  DEFAULT_BRANDING,
  getMergedAgents,
  loadAgentCustomConfig,
  loadBranding,
  saveAgentCustomConfig,
  saveBranding,
  type AgentCustomConfig,
  type AgentOverride,
  type BrandingConfig,
  type CustomAgent,
} from '@/lib/branding-config';
import { maskApiKey } from '@/lib/crypto';
import { useTranslation } from '@/lib/i18n';
import { loadProviderConfigs, saveProviderConfigs, type ProviderConfig } from '@/lib/llm-bridge';
import { useSystemStore } from '@/lib/store';
import { AGENT_REGISTRY } from '@/lib/types';
import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Box,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Code2,
  Cpu,
  Edit3,
  Eye,
  Fingerprint,
  GitBranch,
  Grip,
  Lock,
  Monitor,
  Palette,
  Plus,
  Puzzle,
  RotateCcw,
  Save,
  Server,
  Settings2,
  Shield,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import * as React from 'react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export function SettingsModal({ open, onOpenChange, defaultTab = 'general' }: SettingsModalProps) {
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const isMobile = useSystemStore(s => s.isMobile);
  // Mobile: show sidebar or content (not both)
  const [mobileShowContent, setMobileShowContent] = React.useState(false);
  const [brandingLabel, setBrandingLabel] = React.useState(() => {
    const b = loadBranding();
    return `${b.appName || 'YYC3'} Kernel v${b.version || '3.0.1'}`;
  });

  // Scroll-to-top/bottom: sentinel refs + visibility tracking
  const topSentinelRef = React.useRef<HTMLDivElement>(null);
  const bottomSentinelRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [showScrollBottom, setShowScrollBottom] = React.useState(true);

  React.useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowScrollTop(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, mobileShowContent]);

  React.useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowScrollBottom(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, mobileShowContent]);

  const scrollToTop = React.useCallback(() => {
    topSentinelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToBottom = React.useCallback(() => {
    bottomSentinelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  const scrollByPage = React.useCallback((direction: 'up' | 'down') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const pageHeight = container.clientHeight * 0.8;
    container.scrollBy({
      top: direction === 'down' ? pageHeight : -pageHeight,
      behavior: 'smooth',
    });
  }, []);

  React.useEffect(() => {
    if (open && defaultTab) {
      setActiveTab(defaultTab);
      // On mobile, when opened with a specific tab, go directly to content
      if (isMobile && defaultTab) {
        setMobileShowContent(true);
      }
    }
    if (!open) {
      setMobileShowContent(false);
    }
  }, [open, defaultTab, isMobile]);

  React.useEffect(() => {
    const handler = () => {
      const b = loadBranding();
      setBrandingLabel(`${b.appName || 'YYC3'} Kernel v${b.version || '3.0.1'}`);
    };
    window.addEventListener('yyc3-branding-update', handler);
    return () => window.removeEventListener('yyc3-branding-update', handler);
  }, []);

  // Mobile: clicking a tab auto-switches to content view
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setMobileShowContent(true);
    }
  };

  const settingsContent = (
    <>
      {activeTab === 'general' && (
        <GeneralSettings
          language={language}
          setLanguage={setLanguage}
          t={t}
          onSwitchTab={handleTabClick}
        />
      )}
      {activeTab === 'models' && <ModelsSettings t={t} />}
      {activeTab === 'gitops' && <GitOpsSettings t={t} />}
      {activeTab === 'extensions' && <ExtensionsSettings t={t} />}
      {activeTab === 'security' && <SecuritySettings t={t} />}
      {activeTab === 'appearance' && <AppearanceSettings t={t} />}
      {activeTab === 'agents' && <AgentsSettings t={t} />}
    </>
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300 yyc3-overlay-bg" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] border border-border shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-10 p-0 overflow-hidden yyc3-panel-bg',
            isMobile
              ? 'max-w-[100vw] w-full h-[100dvh] rounded-none'
              : 'max-w-5xl sm:rounded-lg md:w-[90vw] h-[85vh]',
          )}
        >
          <DialogPrimitive.Title className="sr-only">{t('settings.title')}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t('settings.desc')}
          </DialogPrimitive.Description>

          <div className="flex h-full">
            {/* Sidebar — hidden on mobile when showing content */}
            <div
              className={cn(
                'bg-muted/30 border-r border-border flex flex-col',
                isMobile ? (mobileShowContent ? 'hidden' : 'w-full') : 'w-64',
              )}
            >
              <div className="h-14 flex items-center px-6 border-b border-border shrink-0">
                <h2 className="text-lg font-bold font-mono tracking-wider text-primary flex items-center gap-2 flex-1">
                  <Settings2 className="w-5 h-5 animate-spin-slow" />
                  {t('settings.title')}
                </h2>
                {isMobile && (
                  <DialogPrimitive.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </DialogPrimitive.Close>
                )}
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  <TabButton
                    active={activeTab === 'general'}
                    onClick={() => handleTabClick('general')}
                    icon={Server}
                    label={t('settings.tab.general')}
                  />
                  <TabButton
                    active={activeTab === 'models'}
                    onClick={() => handleTabClick('models')}
                    icon={Cpu}
                    label={t('settings.tab.models')}
                  />
                  <TabButton
                    active={activeTab === 'gitops'}
                    onClick={() => handleTabClick('gitops')}
                    icon={GitBranch}
                    label={t('settings.tab.gitops')}
                  />
                  <TabButton
                    active={activeTab === 'extensions'}
                    onClick={() => handleTabClick('extensions')}
                    icon={Box}
                    label={t('settings.tab.extensions')}
                  />
                  <TabButton
                    active={activeTab === 'security'}
                    onClick={() => handleTabClick('security')}
                    icon={Shield}
                    label={t('settings.tab.security')}
                  />
                  <div className="my-2 border-t border-border/30 mx-4" />
                  <TabButton
                    active={activeTab === 'appearance'}
                    onClick={() => handleTabClick('appearance')}
                    icon={Palette}
                    label={t('settings.tab.appearance')}
                  />
                  <TabButton
                    active={activeTab === 'agents'}
                    onClick={() => handleTabClick('agents')}
                    icon={Bot}
                    label={t('settings.tab.agents')}
                  />
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border text-xs text-muted-foreground font-mono">
                {brandingLabel}
              </div>
            </div>

            {/* Content — on mobile, full-width when showing content */}
            <div
              className={cn(
                'flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-background/50',
                isMobile && !mobileShowContent && 'hidden',
              )}
            >
              <div
                className={cn(
                  'h-14 border-b border-border flex items-center justify-between bg-background/50 backdrop-blur-xl shrink-0',
                  isMobile ? 'px-4' : 'px-8',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile back button */}
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                      onClick={() => setMobileShowContent(false)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold font-mono uppercase animate-in fade-in slide-in-from-left-2 truncate">
                      {t(`settings.tab.${activeTab}`)}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      {t('settings.desc')}
                    </p>
                  </div>
                </div>
                <DialogPrimitive.Close asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all hover:rotate-90 shrink-0"
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogPrimitive.Close>
              </div>

              {/* Scrollable content — native overflow-y-auto for reliable scrolling */}
              <div className="flex-1 min-h-0 relative">
                <div
                  className="absolute inset-0 overflow-y-auto"
                  ref={scrollContainerRef}
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div ref={topSentinelRef} className="h-0 w-0" aria-hidden />
                  <div className={cn(isMobile ? 'p-4 pb-8' : 'p-8')}>{settingsContent}</div>
                  <div ref={bottomSentinelRef} className="h-0 w-0" aria-hidden />
                </div>

                {/* Floating scroll navigation buttons — outside scroll container */}
                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                  {showScrollTop && (
                    <button
                      onClick={() => scrollByPage('up')}
                      onDoubleClick={scrollToTop}
                      className="w-9 h-9 rounded-full bg-primary/60 hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 backdrop-blur-sm transition-all hover:scale-110 animate-in fade-in zoom-in-75 duration-200"
                      title={
                        t('settings.tab.general') === '通用设置'
                          ? '向上滚动 (双击回顶部)'
                          : 'Scroll up (double-click = top)'
                      }
                    >
                      <ChevronsUp className="w-4 h-4" />
                    </button>
                  )}
                  {showScrollBottom && (
                    <button
                      onClick={() => scrollByPage('down')}
                      onDoubleClick={scrollToBottom}
                      className="w-9 h-9 rounded-full bg-primary/60 hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 backdrop-blur-sm transition-all hover:scale-110 animate-in fade-in zoom-in-75 duration-200"
                      title={
                        t('settings.tab.general') === '通用设置'
                          ? '向下滚动 (双击到底部)'
                          : 'Scroll down (double-click = bottom)'
                      }
                    >
                      <ChevronsDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface TranslationProps {
  t: (key: string) => string;
}

interface GeneralSettingsProps extends TranslationProps {
  language: string;
  setLanguage: (lang: 'zh' | 'en') => void;
}

interface ModelCardProps {
  name: string;
  provider: string;
  status: 'active' | 'standby';
  latency: string;
  apiKey?: string;
  endpoint?: string;
  onEdit?: () => void;
  onToggle?: () => void;
  isEditing?: boolean;
  onSave?: (data: { name: string; provider: string; apiKey: string; endpoint: string }) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isCustom?: boolean;
}

interface RepoItemProps {
  name: string;
  branch: string;
  status: string;
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-md font-mono relative overflow-hidden group',
        active
          ? 'bg-primary/15 text-primary shadow-[inset_3px_0_0_0_hsl(var(--primary))] border border-primary/20'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.98] border border-transparent',
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 transition-all duration-300',
          active
            ? 'scale-110 text-primary drop-shadow-[0_0_4px_rgba(14,165,233,0.5)]'
            : 'group-hover:scale-110 group-hover:text-primary/60',
        )}
      />
      <span className="relative z-10">{label}</span>
      {active && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-primary/4 to-transparent z-0" />
          <ChevronRight className="w-3 h-3 text-primary/50 ml-auto" />
        </>
      )}
    </button>
  );
}

interface GeneralSettingsWithTabProps extends GeneralSettingsProps {
  onSwitchTab?: (tab: string) => void;
}

function GeneralSettings({ language, setLanguage, t, onSwitchTab }: GeneralSettingsWithTabProps) {
  const [branding, setBranding] = React.useState<BrandingConfig>(() => loadBranding());
  const logoFileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    saveBranding(branding);
  }, [branding]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setBranding(prev => ({ ...prev, logoDataUrl: dataUrl, logoFileName: file.name }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ============ SECTION: Branding ============ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium font-mono flex items-center gap-2">
            <Grip className="w-4 h-4 text-primary" />
            {t('settings.branding')}
          </h4>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] font-mono gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            onClick={() => {
              setBranding({ ...DEFAULT_BRANDING });
            }}
          >
            <RotateCcw className="w-3 h-3" />
            {t('settings.branding_reset')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t('settings.branding_desc')}</p>

        {/* Logo Upload + Text */}
        <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 space-y-4">
          <input
            ref={logoFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          <div className="flex items-center gap-4">
            {/* Logo Preview */}
            <div className="w-14 h-14 rounded-lg border border-primary/50 bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              {branding.logoDataUrl ? (
                <img src={branding.logoDataUrl} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-mono text-sm">{branding.logoText || 'Y3'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-xs font-mono text-foreground">{t('settings.logo_image')}</div>
              {branding.logoFileName ? (
                <div className="text-[10px] text-muted-foreground truncate">
                  {branding.logoFileName}
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground">
                  PNG / SVG / JPG (rec. 64x64)
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] font-mono gap-1"
                onClick={() => logoFileRef.current?.click()}
              >
                <Upload className="w-3 h-3" />
                {t('settings.logo_upload')}
              </Button>
              {branding.logoDataUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[10px] font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() =>
                    setBranding(prev => ({ ...prev, logoDataUrl: '', logoFileName: '' }))
                  }
                >
                  {t('settings.logo_clear')}
                </Button>
              )}
            </div>
          </div>

          {/* Logo Text (when no image) */}
          {!branding.logoDataUrl && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-muted-foreground">
                {t('settings.logo_text')} — {t('settings.logo_text_desc')}
              </label>
              <Input
                value={branding.logoText}
                onChange={e =>
                  setBranding(prev => ({ ...prev, logoText: e.target.value.slice(0, 4) }))
                }
                placeholder="Y3"
                maxLength={4}
                className="h-8 text-xs font-mono bg-muted/20 w-32"
              />
            </div>
          )}
        </div>

        {/* App Name + Tagline + Version */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground">
              {t('settings.app_name')}
            </label>
            <Input
              value={branding.appName}
              onChange={e => setBranding(prev => ({ ...prev, appName: e.target.value }))}
              placeholder="YYC3_DEVOPS"
              className="h-8 text-xs font-mono bg-muted/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground">
              {t('settings.app_tagline')}
            </label>
            <Input
              value={branding.tagline}
              onChange={e => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="v3.0.1-beta"
              className="h-8 text-xs font-mono bg-muted/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground">
              {t('settings.app_version')}
            </label>
            <Input
              value={branding.version}
              onChange={e => setBranding(prev => ({ ...prev, version: e.target.value }))}
              placeholder="3.0.1"
              className="h-8 text-xs font-mono bg-muted/20"
            />
          </div>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              {t('settings.branding_preview')}
            </span>
            {onSwitchTab && (
              <button
                onClick={() => onSwitchTab('appearance')}
                className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1"
              >
                {t('settings.goto_appearance')} <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/80">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shrink-0 overflow-hidden shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              {branding.logoDataUrl ? (
                <img src={branding.logoDataUrl} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-mono text-xs">{branding.logoText || 'Y3'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-mono text-sm tracking-wider text-primary glow-text truncate">
                {branding.appName || 'YYC3_DEVOPS'}
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono">
                {branding.tagline || 'v3.0.1-beta'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ SECTION: System Preferences ============ */}
      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium font-mono">{t('settings.workspace_name')}</label>
          <Input
            placeholder="Enter workspace name"
            defaultValue="DevOps_Playground_Alpha"
            className="font-mono bg-muted/20 focus-visible:ring-primary transition-all"
          />
        </div>
      </div>

      {/* ============ SECTION: Language ============ */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          {t('settings.language')}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLanguage('zh')}
            className={cn(
              'p-3 rounded-lg border transition-all duration-200',
              language === 'zh'
                ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60',
            )}
          >
            <div className="text-sm font-medium">简体中文</div>
            <div className="text-[10px] text-muted-foreground">Simplified Chinese</div>
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              'p-3 rounded-lg border transition-all duration-200',
              language === 'en'
                ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60',
            )}
          >
            <div className="text-sm font-medium">English</div>
            <div className="text-[10px] text-muted-foreground">English (US)</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function ModelsSettings({ t }: TranslationProps) {
  const [providerConfigs, setProviderConfigs] = React.useState<ProviderConfig[]>(() =>
    loadProviderConfigs(),
  );

  const handleToggleProvider = (providerId: string) => {
    setProviderConfigs(prev =>
      prev.map(cfg => (cfg.id === providerId ? { ...cfg, enabled: !cfg.enabled } : cfg)),
    );
    saveProviderConfigs(
      providerConfigs.map(cfg => (cfg.id === providerId ? { ...cfg, enabled: !cfg.enabled } : cfg)),
    );
  };

  const handleUpdateConfig = (providerId: string, updates: Partial<ProviderConfig>) => {
    const newConfigs = providerConfigs.map(cfg =>
      cfg.id === providerId ? { ...cfg, ...updates } : cfg,
    );
    setProviderConfigs(newConfigs);
    saveProviderConfigs(newConfigs);
  };

  const handleAddCustomProvider = () => {
    const newProvider: ProviderConfig = {
      id: `custom-${Date.now()}`,
      name: 'Custom Provider',
      provider: 'custom',
      enabled: false,
      apiKey: '',
      endpoint: '',
      model: '',
    };
    const newConfigs = [...providerConfigs, newProvider];
    setProviderConfigs(newConfigs);
    saveProviderConfigs(newConfigs);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          {t('settings.models.title')}
        </h4>
        <p className="text-xs text-muted-foreground">{t('settings.models.desc')}</p>
      </div>

      <div className="grid gap-4">
        {providerConfigs.map(config => (
          <ModelCard
            key={config.id}
            name={config.name}
            provider={config.provider}
            status={config.enabled ? 'active' : 'standby'}
            apiKey={config.apiKey}
            endpoint={config.endpoint}
            onToggle={() => handleToggleProvider(config.id)}
            isCustom={config.provider === 'custom'}
            onSave={data => handleUpdateConfig(config.id, data)}
            onDelete={() => {
              const newConfigs = providerConfigs.filter(cfg => cfg.id !== config.id);
              setProviderConfigs(newConfigs);
              saveProviderConfigs(newConfigs);
            }}
          />
        ))}

        <Button
          onClick={handleAddCustomProvider}
          variant="outline"
          className="w-full border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/50 gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('settings.models.add_custom')}
        </Button>
      </div>
    </div>
  );
}

function ModelCard({
  name,
  provider,
  status,
  apiKey,
  endpoint,
  onToggle,
  isCustom,
  onSave,
  onDelete,
}: ModelCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({
    name,
    apiKey: apiKey || '',
    endpoint: endpoint || '',
  });

  const handleSave = () => {
    onSave?.(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ name, apiKey: apiKey || '', endpoint: endpoint || '' });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-muted-foreground">
            {t('settings.models.provider_name')}
          </label>
          <Input
            value={editData.name}
            onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
            className="h-8 text-xs font-mono bg-muted/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-muted-foreground">API Key</label>
          <Input
            type="password"
            value={editData.apiKey}
            onChange={e => setEditData(prev => ({ ...prev, apiKey: e.target.value }))}
            className="h-8 text-xs font-mono bg-muted/20"
          />
        </div>
        {provider === 'custom' && (
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground">
              {t('settings.models.endpoint')}
            </label>
            <Input
              value={editData.endpoint}
              onChange={e => setEditData(prev => ({ ...prev, endpoint: e.target.value }))}
              className="h-8 text-xs font-mono bg-muted/20"
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="h-7 text-[10px] font-mono gap-1">
            <Save className="w-3 h-3" />
            {t('settings.models.save')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-7 text-[10px] font-mono"
          >
            {t('settings.models.cancel')}
          </Button>
          {isCustom && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-7 text-[10px] font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
            >
              <Trash2 className="w-3 h-3" />
              {t('settings.models.delete')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-card/80 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'w-2 h-2 rounded-full shrink-0',
              status === 'active'
                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                : 'bg-muted-foreground/50',
            )}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium font-mono truncate">{name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{provider}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={status === 'active'} onCheckedChange={onToggle} />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {apiKey && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="text-[10px] font-mono text-muted-foreground">
            {t('settings.models.api_key')}:{' '}
            <span className="font-mono text-foreground">{maskApiKey(apiKey)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function GitOpsSettings({ t }: TranslationProps) {
  const [repos, setRepos] = React.useState<RepoItemProps[]>([
    { name: 'YYC3-AI-Family', branch: 'main', status: 'Active' },
    { name: 'YYC3-Docs', branch: 'docs', status: 'Active' },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          {t('settings.gitops.title')}
        </h4>
        <p className="text-xs text-muted-foreground">{t('settings.gitops.desc')}</p>
      </div>

      <div className="grid gap-4">
        {repos.map((repo, idx) => (
          <div key={idx} className="p-4 rounded-lg border border-border bg-card/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm font-medium font-mono">{repo.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{repo.branch}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'px-2 py-1 rounded text-[10px] font-mono',
                    repo.status === 'Active'
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {repo.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExtensionsSettings({ t }: TranslationProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-primary" />
          {t('settings.extensions.title')}
        </h4>
        <p className="text-xs text-muted-foreground">{t('settings.extensions.desc')}</p>
      </div>

      <div className="grid gap-4">
        <div className="p-4 rounded-lg border border-border bg-card/80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium font-mono">MCP Protocol</div>
              <div className="text-[10px] text-muted-foreground font-mono">v1.0.0</div>
            </div>
            <Switch defaultChecked />
          </div>
          <p className="text-xs text-muted-foreground">{t('settings.extensions.mcp_desc')}</p>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card/80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium font-mono">AI Assistant</div>
              <div className="text-[10px] text-muted-foreground font-mono">v2.1.0</div>
            </div>
            <Switch defaultChecked />
          </div>
          <p className="text-xs text-muted-foreground">{t('settings.extensions.ai_desc')}</p>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings({ t }: TranslationProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          {t('settings.security.title')}
        </h4>
        <p className="text-xs text-muted-foreground">{t('settings.security.desc')}</p>
      </div>

      <div className="grid gap-4">
        <div className="p-4 rounded-lg border border-border bg-card/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-primary" />
              <div>
                <div className="text-sm font-medium font-mono">
                  {t('settings.security.api_keys')}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {t('settings.security.api_keys_desc')}
                </div>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-4 h-4 text-primary" />
              <div>
                <div className="text-sm font-medium font-mono">
                  {t('settings.security.biometric')}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {t('settings.security.biometric_desc')}
                </div>
              </div>
            </div>
            <Switch />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-primary" />
              <div>
                <div className="text-sm font-medium font-mono">
                  {t('settings.security.privacy')}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {t('settings.security.privacy_desc')}
                </div>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings({ t }: TranslationProps) {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'cyberpunk'>('cyberpunk');
  const [fontSize, setFontSize] = React.useState(14);
  const [showTransitions, setShowTransitions] = React.useState(true);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          {t('settings.appearance.title')}
        </h4>
        <p className="text-xs text-muted-foreground">{t('settings.appearance.desc')}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium font-mono">{t('settings.appearance.theme')}</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'p-3 rounded-lg border transition-all duration-200',
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60',
              )}
            >
              <Monitor className="w-5 h-5 mx-auto mb-2" />
              <div className="text-xs font-medium font-mono text-center">
                {t('settings.appearance.light')}
              </div>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'p-3 rounded-lg border transition-all duration-200',
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60',
              )}
            >
              <Monitor className="w-5 h-5 mx-auto mb-2" />
              <div className="text-xs font-medium font-mono text-center">
                {t('settings.appearance.dark')}
              </div>
            </button>
            <button
              onClick={() => setTheme('cyberpunk')}
              className={cn(
                'p-3 rounded-lg border transition-all duration-200',
                theme === 'cyberpunk'
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60',
              )}
            >
              <Sparkles className="w-5 h-5 mx-auto mb-2" />
              <div className="text-xs font-medium font-mono text-center">
                {t('settings.appearance.cyberpunk')}
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium font-mono flex items-center justify-between">
            {t('settings.appearance.font_size')}
            <span className="text-xs text-muted-foreground font-mono">{fontSize}px</span>
          </label>
          <Slider
            value={[fontSize]}
            onValueChange={([value]) => setFontSize(value)}
            min={12}
            max={18}
            step={1}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/80">
          <div>
            <div className="text-sm font-medium font-mono">
              {t('settings.appearance.transitions')}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              {t('settings.appearance.transitions_desc')}
            </div>
          </div>
          <Switch checked={showTransitions} onCheckedChange={setShowTransitions} />
        </div>
      </div>
    </div>
  );
}

function AgentsSettings({ t }: TranslationProps) {
  const [customConfig, setCustomConfig] = React.useState<AgentCustomConfig>(() =>
    loadAgentCustomConfig(),
  );
  const mergedAgents = getMergedAgents(AGENT_REGISTRY, customConfig);

  const handleToggleAgent = (agentId: string) => {
    const newDisabled = customConfig.disabled.includes(agentId)
      ? customConfig.disabled.filter(id => id !== agentId)
      : [...customConfig.disabled, agentId];
    setCustomConfig(prev => ({ ...prev, disabled: newDisabled }));
    saveAgentCustomConfig({ ...customConfig, disabled: newDisabled });
  };

  const handleUpdateOverride = (agentId: string, updates: Partial<AgentOverride>) => {
    const overrides = { ...customConfig.overrides };
    if (overrides[agentId]) {
      overrides[agentId] = { ...overrides[agentId], ...updates };
    } else {
      overrides[agentId] = updates as AgentOverride;
    }
    setCustomConfig(prev => ({ ...prev, overrides }));
    saveAgentCustomConfig({ ...customConfig, overrides });
  };

  const handleAddCustomAgent = () => {
    const id = `custom-${Date.now()}`;
    const newAgent: CustomAgent = {
      id,
      name: `Custom Agent ${customConfig.customAgents.length + 1}`,
      description: 'Custom agent configuration',
      role: 'assistant',
      color: AGENT_COLOR_PRESETS[customConfig.customAgents.length % AGENT_COLOR_PRESETS.length],
      systemPrompt: 'You are a helpful AI assistant.',
    };
    setCustomConfig(prev => ({
      ...prev,
      customAgents: [...prev.customAgents, newAgent],
    }));
    saveAgentCustomConfig({
      ...customConfig,
      customAgents: [...customConfig.customAgents, newAgent],
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          {t('settings.agents.title')}
        </h4>
        <p className="text-xs text-muted-foreground">{t('settings.agents.desc')}</p>
      </div>

      <div className="grid gap-4">
        {mergedAgents.map(agent => {
          const isDisabled = customConfig.disabled.includes(agent.id);
          const override = customConfig.overrides[agent.id];
          return (
            <div
              key={agent.id}
              className={cn(
                'p-4 rounded-lg border transition-all duration-200',
                isDisabled
                  ? 'border-border bg-muted/20 opacity-50'
                  : 'border-border bg-card/80 hover:border-primary/30',
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-lg"
                    style={{ backgroundColor: override?.color || agent.color }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium font-mono truncate">
                        {override?.name || agent.name}
                      </div>
                      {isDisabled && (
                        <div className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-muted text-muted-foreground">
                          Disabled
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">
                      {override?.description || agent.description}
                    </div>
                  </div>
                </div>
                <Switch checked={!isDisabled} onCheckedChange={() => handleToggleAgent(agent.id)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted-foreground">
                    {t('settings.agents.display_name')}
                  </label>
                  <Input
                    value={override?.name || agent.name}
                    onChange={e => handleUpdateOverride(agent.id, { name: e.target.value })}
                    disabled={isDisabled}
                    className="h-8 text-xs font-mono bg-muted/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted-foreground">
                    {t('settings.agents.color')}
                  </label>
                  <div className="flex gap-2">
                    {AGENT_COLOR_PRESETS.map(color => (
                      <button
                        key={color}
                        onClick={() => handleUpdateOverride(agent.id, { color })}
                        disabled={isDisabled}
                        className={cn(
                          'w-6 h-6 rounded-full border-2 transition-all duration-200',
                          (override?.color || agent.color) === color
                            ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                            : 'border-transparent hover:scale-110',
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <Button
          onClick={handleAddCustomAgent}
          variant="outline"
          className="w-full border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/50 gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('settings.agents.add_custom')}
        </Button>
      </div>
    </div>
  );
}
