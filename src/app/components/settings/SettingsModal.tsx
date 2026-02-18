import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Server, Cpu, GitBranch, Box, Shield, Settings2, Lock, Fingerprint, Eye, FileWarning, Plus, Trash2, Edit3, Save, CheckCircle2, Puzzle, Code2, Palette, Bot, Upload, ImageIcon, Type, Search, Layers, Sparkles, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Switch } from "@/app/components/ui/switch";
import { Slider } from "@/app/components/ui/slider";
import { useTranslation } from "@/lib/i18n";
import {
  loadProviderConfigs,
  saveProviderConfigs,
  type ProviderConfig,
} from "@/lib/llm-bridge";
import { PROVIDERS } from "@/lib/llm-providers";
import { maskApiKey } from "@/lib/crypto";
import { AGENT_REGISTRY } from "@/lib/types";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export function SettingsModal({ open, onOpenChange, defaultTab = "general" }: SettingsModalProps) {
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  React.useEffect(() => {
    if (open && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300 yyc3-overlay-bg" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] border border-border shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-10 sm:rounded-lg md:w-[90vw] h-[85vh] p-0 overflow-hidden yyc3-panel-bg">

          <DialogPrimitive.Title className="sr-only">{t('settings.title')}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t('settings.desc')}
          </DialogPrimitive.Description>

          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-muted/30 border-r border-border flex flex-col">
              <div className="h-14 flex items-center px-6 border-b border-border shrink-0">
                <h2 className="text-lg font-bold font-mono tracking-wider text-primary flex items-center gap-2">
                   <Settings2 className="w-5 h-5 animate-spin-slow" />
                   {t('settings.title')}
                </h2>
              </div>
              <ScrollArea className="flex-1">
                 <div className="p-2 space-y-1">
                    <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Server} label={t('settings.tab.general')} />
                     <TabButton active={activeTab === 'models'} onClick={() => setActiveTab('models')} icon={Cpu} label={t('settings.tab.models')} />
                     <TabButton active={activeTab === 'gitops'} onClick={() => setActiveTab('gitops')} icon={GitBranch} label={t('settings.tab.gitops')} />
                     <TabButton active={activeTab === 'extensions'} onClick={() => setActiveTab('extensions')} icon={Box} label={t('settings.tab.extensions')} />
                     <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Shield} label={t('settings.tab.security')} />
                    <div className="my-2 border-t border-border/30 mx-4" />
                    <TabButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} icon={Palette} label={t('settings.tab.appearance')} />
                    <TabButton active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} icon={Bot} label={t('settings.tab.agents')} />
                 </div>
              </ScrollArea>
              <div className="p-4 border-t border-border text-xs text-muted-foreground font-mono">
                YYC3 Kernel v3.0.1
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-background/50">
               <div className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl shrink-0">
                  <div>
                    <h3 className="text-sm font-semibold font-mono uppercase animate-in fade-in slide-in-from-left-2">{t(`settings.tab.${activeTab}`)}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">{t('settings.desc')}</p>
                  </div>
                  <DialogPrimitive.Close asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all hover:rotate-90">
                      <X className="w-4 h-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DialogPrimitive.Close>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar border-r-2 border-border/30 max-h-[calc(85vh-3.5rem)]">
                 <div className="p-8">
                   {activeTab === 'general' && <GeneralSettings language={language} setLanguage={setLanguage} t={t} />}
                   {activeTab === 'models' && <ModelsSettings t={t} />}
                   {activeTab === 'gitops' && <GitOpsSettings t={t} />}
                   {activeTab === 'extensions' && <ExtensionsSettings t={t} />}
                   {activeTab === 'security' && <SecuritySettings t={t} />}
                   {activeTab === 'appearance' && <AppearanceSettings t={t} />}
                   {activeTab === 'agents' && <AgentsSettings t={t} />}
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
        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-md font-mono relative overflow-hidden group",
        active
          ? "bg-primary/10 text-primary shadow-[inset_4px_0_0_0_rgba(14,165,233,1)]"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon className={cn("w-4 h-4 transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")} />
      <span className="relative z-10">{label}</span>
      {active && <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent z-0"></div>}
    </button>
  )
}

function GeneralSettings({ language, setLanguage, t }: GeneralSettingsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6">
        <div className="space-y-2">
           <label className="text-sm font-medium font-mono">{t('settings.workspace_name')}</label>
           <Input placeholder="Enter workspace name" defaultValue="DevOps_Playground_Alpha" className="font-mono bg-muted/20 focus-visible:ring-primary transition-all" />
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
           <div className="space-y-0.5">
              <label className="text-sm font-medium font-mono block">{t('settings.language')}</label>
              <span className="text-xs text-muted-foreground">Select system interface language</span>
           </div>
           <div className="flex items-center gap-2 bg-muted p-1 rounded-lg border border-border">
              <button
                onClick={() => setLanguage('en')}
                className={cn("text-xs font-mono px-3 py-1 rounded transition-all", language === 'en' ? "bg-primary text-primary-foreground shadow-sm" : "hover:text-foreground text-muted-foreground")}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('zh')}
                className={cn("text-xs font-mono px-3 py-1 rounded transition-all", language === 'zh' ? "bg-primary text-primary-foreground shadow-sm" : "hover:text-foreground text-muted-foreground")}
              >
                中文
              </button>
           </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
           <div className="space-y-0.5">
              <label className="text-sm font-medium font-mono block">{t('settings.dev_mode')}</label>
              <span className="text-xs text-muted-foreground">{t('settings.dev_mode_desc')}</span>
           </div>
           <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
           <div className="space-y-0.5">
              <label className="text-sm font-medium font-mono block">{t('settings.auto_save')}</label>
              <span className="text-xs text-muted-foreground">{t('settings.auto_save_desc')}</span>
           </div>
           <Switch />
        </div>
      </div>
    </div>
  )
}

const MODELS_STORAGE_KEY = 'yyc3-models-config';

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'standby';
  latency: string;
  apiKey: string;
  endpoint: string;
  isCustom: boolean;
}

const DEFAULT_MODELS: ModelConfig[] = [
  { id: 'claude-4', name: 'Claude 4 Sonnet', provider: 'Anthropic', status: 'active', latency: '24ms', apiKey: '', endpoint: 'https://api.anthropic.com/v1', isCustom: false },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', status: 'standby', latency: '45ms', apiKey: '', endpoint: 'https://api.openai.com/v1', isCustom: false },
  { id: 'deepseek-r1', name: 'DeepSeek-R1', provider: 'DeepSeek', status: 'standby', latency: '18ms', apiKey: '', endpoint: 'https://api.deepseek.com/v1', isCustom: false },
  { id: 'glm-4', name: 'GLM-4', provider: '智谱 AI (Zhipu)', status: 'standby', latency: '32ms', apiKey: '', endpoint: 'https://open.bigmodel.cn/api/paas/v4', isCustom: false },
  { id: 'llama-3-70b', name: 'Llama-3-70b', provider: 'Groq', status: 'standby', latency: '12ms', apiKey: '', endpoint: 'https://api.groq.com/openai/v1', isCustom: false },
  { id: 'gemini-2.5', name: 'Gemini 2.5 Pro', provider: 'Google', status: 'standby', latency: '38ms', apiKey: '', endpoint: 'https://generativelanguage.googleapis.com/v1beta', isCustom: false },
];

function loadModels(): ModelConfig[] {
  try {
    const raw = localStorage.getItem(MODELS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_MODELS;
}

function saveModels(models: ModelConfig[]) {
  try {
    localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(models));
  } catch { /* ignore */ }
}

function ModelsSettings({ t }: TranslationProps) {
  const [models, setModels] = React.useState<ModelConfig[]>(() => loadModels());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ name: '', provider: '', apiKey: '', endpoint: '' });
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newModel, setNewModel] = React.useState({ name: '', provider: '', apiKey: '', endpoint: '' });

  // Sync model configs to LLM Bridge provider configs whenever models change
  React.useEffect(() => {
    saveModels(models);

    // Map model configs to provider configs for the LLM Bridge
    const providerMap: Record<string, ProviderConfig> = {};
    for (const model of models) {
      // Try to match to a known provider
      const providerLower = model.provider.toLowerCase();
      let providerId = '';

      if (providerLower.includes('anthropic') || providerLower.includes('claude')) providerId = 'anthropic';
      else if (providerLower.includes('openai') || providerLower.includes('gpt')) providerId = 'openai';
      else if (providerLower.includes('deepseek')) providerId = 'deepseek';
      else if (providerLower.includes('zhipu') || providerLower.includes('智谱') || providerLower.includes('glm') || providerLower.includes('z.ai')) providerId = 'zhipu';
      else if (providerLower.includes('google') || providerLower.includes('gemini')) providerId = 'google';
      else if (providerLower.includes('groq')) providerId = 'groq';
      else if (providerLower.includes('ollama')) providerId = 'ollama';
      else if (providerLower.includes('lm studio')) providerId = 'lmstudio';

      if (providerId && model.apiKey) {
        // Use the first match with an API key for each provider
        if (!providerMap[providerId] || model.status === 'active') {
          providerMap[providerId] = {
            providerId,
            apiKey: model.apiKey,
            endpoint: model.endpoint || PROVIDERS[providerId]?.defaultEndpoint || '',
            enabled: model.status === 'active',
            defaultModel: PROVIDERS[providerId]?.defaultModel || model.id,
          };
        }
      }
    }

    saveProviderConfigs(Object.values(providerMap));
  }, [models]);

  const handleToggleStatus = (id: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'standby' as const : 'active' as const } : m));
  };

  const handleStartEdit = (model: ModelConfig) => {
    setEditingId(model.id);
    setEditForm({ name: model.name, provider: model.provider, apiKey: model.apiKey, endpoint: model.endpoint });
  };

  const handleSaveEdit = (id: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...editForm } : m));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setModels(prev => prev.filter(m => m.id !== id));
  };

  const handleAddModel = () => {
    if (!newModel.name.trim()) return;
    const id = `custom-${Date.now()}`;
    setModels(prev => [...prev, {
      id,
      name: newModel.name,
      provider: newModel.provider || 'Custom',
      status: 'standby',
      latency: '-',
      apiKey: newModel.apiKey,
      endpoint: newModel.endpoint,
      isCustom: true,
    }]);
    setNewModel({ name: '', provider: '', apiKey: '', endpoint: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      {/* Model Cards */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium font-mono">Registered Models</h4>
        <Button size="sm" variant="outline" className="h-7 text-xs font-mono gap-1.5" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-3 h-3" />
          ADD MODEL
        </Button>
      </div>

      {/* Add Model Form */}
      {showAddForm && (
        <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <h5 className="text-xs font-mono text-primary flex items-center gap-2">
            <Plus className="w-3 h-3" /> NEW_MODEL_REGISTRATION
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Model name" value={newModel.name} onChange={e => setNewModel(p => ({ ...p, name: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder="Provider (e.g. OpenAI)" value={newModel.provider} onChange={e => setNewModel(p => ({ ...p, provider: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder="API Endpoint URL" value={newModel.endpoint} onChange={e => setNewModel(p => ({ ...p, endpoint: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder="API Key (optional)" type="password" value={newModel.apiKey} onChange={e => setNewModel(p => ({ ...p, apiKey: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={handleAddModel}><Save className="w-3 h-3" /> Register</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map(model => (
          <div key={model.id} className={cn(
            "p-4 rounded-lg border flex flex-col gap-2 transition-all group relative",
            model.status === 'active'
              ? "bg-primary/5 border-primary shadow-[0_0_15px_rgba(14,165,233,0.1)]"
              : "bg-background border-border hover:border-primary/50 hover:bg-muted/5"
          )}>
            {editingId === model.id ? (
              /* Edit Mode */
              <div className="space-y-2">
                <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" placeholder="Name" />
                <Input value={editForm.provider} onChange={e => setEditForm(p => ({ ...p, provider: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" placeholder="Provider" />
                <Input value={editForm.endpoint} onChange={e => setEditForm(p => ({ ...p, endpoint: e.target.value }))} className="h-7 text-xs font-mono bg-muted/20" placeholder="Endpoint" />
                <Input value={editForm.apiKey} onChange={e => setEditForm(p => ({ ...p, apiKey: e.target.value }))} type="password" className="h-7 text-xs font-mono bg-muted/20" placeholder="API Key" />
                <div className="flex gap-1.5 justify-end pt-1">
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => setEditingId(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                  <Button size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={() => handleSaveEdit(model.id)}>
                    <Save className="w-3 h-3" /> SAVE
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm font-mono group-hover:text-primary transition-colors">{model.name}</h4>
                    <span className="text-xs text-muted-foreground">{model.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleStatus(model.id)} className={cn(
                      "w-2 h-2 rounded-full transition-shadow duration-500 cursor-pointer",
                      model.status === 'active' ? "bg-green-500 shadow-[0_0_5px_#22c55e] animate-pulse" : "bg-muted-foreground hover:bg-amber-500"
                    )} title={`Click to ${model.status === 'active' ? 'deactivate' : 'activate'}`} />
                  </div>
                </div>
                {model.endpoint && (
                  <div className="text-[9px] font-mono text-zinc-500 truncate">{model.endpoint}</div>
                )}
                <div className="mt-1 text-[10px] font-mono flex items-center gap-2 justify-between">
                  <div className="flex gap-2">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-foreground border border-transparent group-hover:border-border">{model.status.toUpperCase()}</span>
                    <span className="text-muted-foreground">{model.latency}</span>
                    {model.apiKey && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    {model.isCustom && <span className="px-1 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">CUSTOM</span>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleStartEdit(model)} className="p-1 hover:bg-white/10 rounded transition-colors"><Edit3 className="w-3 h-3 text-zinc-400" /></button>
                    {model.isCustom && (
                      <button onClick={() => handleDelete(model.id)} className="p-1 hover:bg-red-500/10 rounded transition-colors"><Trash2 className="w-3 h-3 text-red-400" /></button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-border space-y-4">
        <h4 className="text-sm font-medium font-mono">{t('settings.inference')}</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span>{t('settings.temp')}</span>
              <span>0.7</span>
            </div>
            <Slider defaultValue={[0.7]} max={1} step={0.1} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span>{t('settings.tokens')}</span>
              <span>4096</span>
            </div>
            <Slider defaultValue={[4096]} max={8192} step={128} />
          </div>
        </div>
      </div>
    </div>
  )
}

function GitOpsSettings({ t }: TranslationProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
       <div className="p-4 rounded-lg border border-dashed border-border bg-muted/5 hover:bg-muted/10 transition-colors">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border group-hover:border-primary transition-colors">
                <GitBranch className="w-6 h-6 text-foreground" />
             </div>
             <div>
               <h4 className="font-bold text-sm font-mono">GitHub Connection</h4>
               <p className="text-xs text-muted-foreground">Connected as @dev_operator</p>
             </div>
             <Button variant="outline" size="sm" className="ml-auto text-xs font-mono hover:bg-primary hover:text-primary-foreground transition-all">Re-Connect</Button>
          </div>
       </div>

       <div className="space-y-4">
          <h4 className="text-sm font-medium font-mono">Repositories</h4>
          <div className="grid gap-2">
             <RepoItem name="yyc3-core-infrastructure" branch="main" status="Synced" />
             <RepoItem name="yyc3-frontend-v2" branch="develop" status="1 commit ahead" />
             <RepoItem name="yyc3-agent-swarm" branch="feature/new-planner" status="Syncing..." />
          </div>
       </div>

       <div className="flex gap-2 pt-4">
          <Button className="flex-1 font-mono text-xs gap-2 hover:scale-[1.02] transition-transform">
             <GitBranch className="w-3 h-3" />
             PULL REQUEST
          </Button>
          <Button variant="outline" className="flex-1 font-mono text-xs gap-2 hover:scale-[1.02] transition-transform">
             SYNC ALL
          </Button>
       </div>
    </div>
  )
}

function RepoItem({ name, branch, status }: RepoItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded bg-muted/10 border border-border/50 font-mono text-xs hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer group">
       <div className="flex items-center gap-2">
          <GitBranch className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-foreground">{name}</span>
       </div>
       <div className="flex items-center gap-3">
          <span className="text-primary bg-primary/10 px-1.5 rounded">{branch}</span>
          <span className="text-muted-foreground">{status}</span>
       </div>
    </div>
  )
}

const PLUGINS_STORAGE_KEY = 'yyc3-plugins-config';

interface PluginConfig {
  id: string;
  name: string;
  desc: string;
  version: string;
  author: string;
  category: 'self-developed' | 'community' | 'official';
  enabled: boolean;
  icon: string; // emoji or text
  color: string;
}

const DEFAULT_PLUGINS: PluginConfig[] = [
  { id: 'yyc3-neural-link', name: 'YYC3 Neural Link', desc: '多模型意图解析与自动路由引擎', version: '2.1.0', author: 'YYC3 Team', category: 'self-developed', enabled: true, icon: '🧠', color: 'text-amber-500' },
  { id: 'yyc3-dag-engine', name: 'DAG Workflow Engine', desc: '可视化工作流编排与DAG执行器', version: '1.4.0', author: 'YYC3 Team', category: 'self-developed', enabled: true, icon: '⚡', color: 'text-blue-500' },
  { id: 'yyc3-mcp-bridge', name: 'MCP Bridge', desc: 'Model Context Protocol 服务器桥接', version: '3.0.0', author: 'YYC3 Team', category: 'self-developed', enabled: true, icon: '🔗', color: 'text-cyan-500' },
  { id: 'yyc3-cluster-monitor', name: 'Cluster Monitor', desc: '四节点集群实时监控与告警', version: '1.2.0', author: 'YYC3 Team', category: 'self-developed', enabled: true, icon: '📡', color: 'text-green-500' },
  { id: 'yyc3-code-review', name: 'Code Review Agent', desc: 'AI驱动代码审查与最佳实践建议', version: '0.9.0', author: 'YYC3 Team', category: 'self-developed', enabled: false, icon: '🔍', color: 'text-purple-500' },
  { id: 'docker-compose-gen', name: 'Docker Compose Generator', desc: '根据架构描述自动生成 docker-compose.yml', version: '1.0.0', author: 'community', category: 'community', enabled: true, icon: '🐳', color: 'text-sky-500' },
  { id: 'figma-sync', name: 'Figma Design Sync', desc: 'Figma设计稿与代码组件双向同步', version: '2.0.0', author: 'official', category: 'official', enabled: true, icon: '🎨', color: 'text-pink-500' },
  { id: 'nas-file-browser', name: 'NAS File Browser', desc: 'YanYuCloud NAS 远程文件浏览器', version: '1.1.0', author: 'YYC3 Team', category: 'self-developed', enabled: true, icon: '💾', color: 'text-emerald-500' },
];

function loadPlugins(): PluginConfig[] {
  try {
    const raw = localStorage.getItem(PLUGINS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_PLUGINS;
}

function savePlugins(plugins: PluginConfig[]) {
  try {
    localStorage.setItem(PLUGINS_STORAGE_KEY, JSON.stringify(plugins));
  } catch { /* ignore */ }
}

function ExtensionsSettings({ t }: TranslationProps) {
  const [plugins, setPlugins] = React.useState<PluginConfig[]>(() => loadPlugins());
  const [filterCategory, setFilterCategory] = React.useState<string>('all');
  const [showAddPlugin, setShowAddPlugin] = React.useState(false);
  const [newPlugin, setNewPlugin] = React.useState({ name: '', desc: '', version: '0.1.0', author: '' });

  React.useEffect(() => {
    savePlugins(plugins);
  }, [plugins]);

  const handleTogglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleDeletePlugin = (id: string) => {
    setPlugins(prev => prev.filter(p => p.id !== id));
  };

  const handleAddPlugin = () => {
    if (!newPlugin.name.trim()) return;
    setPlugins(prev => [...prev, {
      id: `custom-${Date.now()}`,
      name: newPlugin.name,
      desc: newPlugin.desc || 'Custom self-developed plugin',
      version: newPlugin.version,
      author: newPlugin.author || 'YYC3 Team',
      category: 'self-developed',
      enabled: false,
      icon: '🔧',
      color: 'text-orange-500',
    }]);
    setNewPlugin({ name: '', desc: '', version: '0.1.0', author: '' });
    setShowAddPlugin(false);
  };

  const filtered = plugins.filter(p => filterCategory === 'all' || p.category === filterCategory);
  const enabledCount = plugins.filter(p => p.enabled).length;
  const selfDevCount = plugins.filter(p => p.category === 'self-developed').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-border bg-muted/10 text-center">
          <div className="text-lg font-mono text-primary">{plugins.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Plugins</div>
        </div>
        <div className="p-3 rounded-lg border border-border bg-muted/10 text-center">
          <div className="text-lg font-mono text-green-500">{enabledCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Enabled</div>
        </div>
        <div className="p-3 rounded-lg border border-border bg-muted/10 text-center">
          <div className="text-lg font-mono text-amber-500">{selfDevCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Self-Developed</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1">
          {['all', 'self-developed', 'community', 'official'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-colors",
                filterCategory === cat
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
              )}
            >
              {cat === 'all' ? 'ALL' : cat === 'self-developed' ? '自研' : cat === 'community' ? 'Community' : 'Official'}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs font-mono gap-1.5" onClick={() => setShowAddPlugin(!showAddPlugin)}>
          <Plus className="w-3 h-3" />
          NEW PLUGIN
        </Button>
      </div>

      {/* Add Plugin Form */}
      {showAddPlugin && (
        <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <h5 className="text-xs font-mono text-primary flex items-center gap-2">
            <Code2 className="w-3 h-3" /> CREATE_SELF_DEVELOPED_PLUGIN
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Plugin name" value={newPlugin.name} onChange={e => setNewPlugin(p => ({ ...p, name: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder="Author" value={newPlugin.author} onChange={e => setNewPlugin(p => ({ ...p, author: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20" />
            <Input placeholder="Description" value={newPlugin.desc} onChange={e => setNewPlugin(p => ({ ...p, desc: e.target.value }))} className="h-8 text-xs font-mono bg-muted/20 col-span-2" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddPlugin(false)}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={handleAddPlugin}><Puzzle className="w-3 h-3" /> Create</Button>
          </div>
        </div>
      )}

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(plugin => (
          <div
            key={plugin.id}
            className={cn(
              "p-4 rounded-lg border transition-all group",
              plugin.enabled
                ? "bg-muted/5 border-border hover:border-primary/30"
                : "bg-muted/5 border-border/50 opacity-60 hover:opacity-80"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted/20 border border-border flex items-center justify-center text-lg shrink-0">
                {plugin.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-mono truncate">{plugin.name}</h4>
                  <span className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0",
                    plugin.category === 'self-developed' ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : plugin.category === 'official' ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  )}>
                    {plugin.category === 'self-developed' ? '自研' : plugin.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{plugin.desc}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-muted-foreground">
                  <span>v{plugin.version}</span>
                  <span>·</span>
                  <span>{plugin.author}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Switch checked={plugin.enabled} onCheckedChange={() => handleTogglePlugin(plugin.id)} />
                {plugin.category === 'self-developed' && (
                  <button onClick={() => handleDeletePlugin(plugin.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded transition-all">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecuritySettings({ t }: TranslationProps) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-green-500/10 border-green-500/20">
            <div className="flex items-center gap-4">
               <Shield className="w-8 h-8 text-green-500" />
               <div>
                  <h4 className="font-bold text-sm text-green-500">SYSTEM SECURE</h4>
                  <p className="text-xs text-muted-foreground">All security systems operational. No threats detected.</p>
               </div>
            </div>
            <Button size="sm" className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/50">RUN AUDIT</Button>
         </div>

         <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 rounded bg-muted/5 border border-border">
               <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-primary" />
                  <div className="space-y-0.5">
                     <div className="text-sm font-medium font-mono">Data Encryption (AES-256)</div>
                     <div className="text-xs text-muted-foreground">At-rest data protection active</div>
                  </div>
               </div>
               <Switch defaultChecked disabled />
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-muted/5 border border-border">
               <div className="flex items-center gap-3">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <div className="space-y-0.5">
                     <div className="text-sm font-medium font-mono">Biometric / MFA Auth</div>
                     <div className="text-xs text-muted-foreground">Require YubiKey or Authenticator</div>
                  </div>
               </div>
               <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-muted/5 border border-border">
               <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-primary" />
                  <div className="space-y-0.5">
                     <div className="text-sm font-medium font-mono">Input Sanitization</div>
                     <div className="text-xs text-muted-foreground">XSS/SQLi filter middleware</div>
                  </div>
               </div>
               <Switch defaultChecked disabled />
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-muted/5 border border-border">
               <div className="flex items-center gap-3">
                  <FileWarning className="w-4 h-4 text-primary" />
                  <div className="space-y-0.5">
                     <div className="text-sm font-medium font-mono">Access Logs</div>
                     <div className="text-xs text-muted-foreground">Retention: 90 Days</div>
                  </div>
               </div>
               <Button variant="outline" size="sm" className="h-7 text-xs">VIEW LOGS</Button>
            </div>
         </div>
      </div>
    )
}

const ACCENT_PRESETS = [
  { id: 'sky', label: 'Gem Blue', color: '#0EA5E9' },
  { id: 'violet', label: 'Violet', color: '#8B5CF6' },
  { id: 'emerald', label: 'Emerald', color: '#10B981' },
  { id: 'rose', label: 'Rose', color: '#F43F5E' },
  { id: 'amber', label: 'Amber', color: '#F59E0B' },
  { id: 'cyan', label: 'Cyan', color: '#06B6D4' },
  { id: 'pink', label: 'Pink', color: '#EC4899' },
  { id: 'lime', label: 'Lime', color: '#84CC16' },
  { id: 'orange', label: 'Orange', color: '#F97316' },
  { id: 'indigo', label: 'Indigo', color: '#6366F1' },
];

const APPEARANCE_STORAGE_KEY = 'yyc3-appearance-config';

interface AppearanceConfig {
  accentColor: string;
  panelOpacity: number;
  bgBlur: boolean;
  scanline: boolean;
  glowEffect: boolean;
  customColor: string;
  shadowColor: string;
  borderColor: string;
  glowColor: string;
  bgColor: string;
  bgImageDataUrl: string;
  bgImageName: string;
  shadowIntensity: number;
  overlayOpacity: number;
  fontFamily: string;
  monoFontFamily: string;
  fontSize: number;
  bgBrightness: number;
  bgBlurPx: number;
}

const DEFAULT_APPEARANCE: AppearanceConfig = {
  accentColor: '#0EA5E9',
  panelOpacity: 80,
  bgBlur: true,
  scanline: true,
  glowEffect: true,
  customColor: '#0EA5E9',
  shadowColor: '#0EA5E930',
  borderColor: '#2d3748',
  glowColor: '#0EA5E9',
  bgColor: '#050505',
  bgImageDataUrl: '',
  bgImageName: '',
  shadowIntensity: 50,
  overlayOpacity: 80,
  fontFamily: 'system-ui',
  monoFontFamily: 'JetBrains Mono',
  fontSize: 14,
  bgBrightness: 70,
  bgBlurPx: 0,
};

function loadAppearance(): AppearanceConfig {
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (raw) return { ...DEFAULT_APPEARANCE, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_APPEARANCE;
}

const BG_IMAGE_STORAGE_KEY = 'yyc3-bg-image';

function saveAppearance(config: AppearanceConfig) {
  try {
    // Store bg image separately (can be large)
    if (config.bgImageDataUrl && config.bgImageDataUrl !== '__stored__') {
      localStorage.setItem(BG_IMAGE_STORAGE_KEY, config.bgImageDataUrl);
    } else if (!config.bgImageDataUrl) {
      localStorage.removeItem(BG_IMAGE_STORAGE_KEY);
    }
    const toSave = { ...config, bgImageDataUrl: config.bgImageDataUrl ? '__stored__' : '' };
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore - may exceed quota for large images */ }
}

function loadAppearanceFull(): AppearanceConfig {
  const base = loadAppearance();
  if (base.bgImageDataUrl === '__stored__') {
    try {
      base.bgImageDataUrl = localStorage.getItem(BG_IMAGE_STORAGE_KEY) || '';
    } catch { base.bgImageDataUrl = ''; }
  }
  return base;
}

// Curated font list (common + popular design/coding fonts)
const POPULAR_FONTS = [
  'system-ui', 'Inter', 'Roboto', 'Noto Sans SC', 'Noto Sans', 'PingFang SC',
  'SF Pro Display', 'Helvetica Neue', 'Arial', 'Microsoft YaHei',
  'Source Han Sans', 'Lato', 'Open Sans', 'Poppins', 'Montserrat',
  'DM Sans', 'IBM Plex Sans', 'Nunito', 'Rubik', 'Manrope',
  'Geist', 'Plus Jakarta Sans', 'Outfit',
  'LXGW WenKai', 'HarmonyOS Sans', 'Alibaba PuHuiTi',
  'Coco', 'Didot', 'Grouch BT', 'Marydale', 'Planet Kosmos',
];

const POPULAR_MONO_FONTS = [
  'JetBrains Mono', 'Fira Code', 'Hack Nerd Font', 'Hack Nerd Font Mono',
  'Hack Nerd Font Propo', 'Source Code Pro', 'Cascadia Code', 'Consolas',
  'SF Mono', 'IBM Plex Mono', 'Ubuntu Mono', 'Inconsolata',
  'Roboto Mono', 'JetBrains Mono NL', 'MonoLisa', 'Operator Mono',
  'Monaspace Neon', 'Monaspace Argon', 'Geist Mono',
  'H2D2-Alevita', 'HabanoST', 'LHF Claretian',
];

function AppearanceSettings({ t }: TranslationProps) {
  const [config, setConfig] = React.useState<AppearanceConfig>(() => loadAppearanceFull());
  const bgFileRef = React.useRef<HTMLInputElement>(null);
  const [localFonts, setLocalFonts] = React.useState<string[]>([]);
  const [fontSearch, setFontSearch] = React.useState('');
  const [monoFontSearch, setMonoFontSearch] = React.useState('');
  const [showFontDropdown, setShowFontDropdown] = React.useState(false);
  const [showMonoDropdown, setShowMonoDropdown] = React.useState(false);
  const fontDropdownRef = React.useRef<HTMLDivElement>(null);
  const monoDropdownRef = React.useRef<HTMLDivElement>(null);

  // Detect local fonts using queryLocalFonts API
  const detectLocalFonts = React.useCallback(async () => {
    try {
      if ('queryLocalFonts' in window) {
        const fonts: FontData[] = await window.queryLocalFonts();
        const familySet = new Set<string>();
        for (const font of fonts) {
          familySet.add(font.family);
        }
        const sorted = Array.from(familySet).sort((a, b) => a.localeCompare(b));
        setLocalFonts(sorted);
      }
    } catch {
      // Permission denied or unsupported — use fallback
      setLocalFonts([]);
    }
  }, []);

  // Close font dropdowns on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) setShowFontDropdown(false);
      if (monoDropdownRef.current && !monoDropdownRef.current.contains(e.target as Node)) setShowMonoDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Persist + apply CSS variables to :root
  React.useEffect(() => {
    saveAppearance(config);
    const root = document.documentElement;
    root.style.setProperty('--primary', config.accentColor);
    root.style.setProperty('--ring', config.accentColor);
    root.style.setProperty('--accent-foreground', config.accentColor);
    root.style.setProperty('--border', config.borderColor);
    root.style.setProperty('--input', config.borderColor);
    root.style.setProperty('--background', config.bgColor);
    root.style.setProperty('--yyc3-overlay-opacity', String(config.overlayOpacity / 100));
    root.style.setProperty('--yyc3-shadow-intensity', String(config.shadowIntensity / 100));

    // Font
    root.style.setProperty('--yyc3-font-family', `"${config.fontFamily}", system-ui, sans-serif`);
    root.style.setProperty('--yyc3-mono-font', `"${config.monoFontFamily}", "JetBrains Mono", monospace`);
    root.style.setProperty('--font-sans', `"${config.fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`);
    root.style.setProperty('--font-mono', `"${config.monoFontFamily}", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`);
    root.style.setProperty('--yyc3-font-size', `${config.fontSize}px`);
    document.body.style.fontFamily = `"${config.fontFamily}", system-ui, -apple-system, sans-serif`;
    document.body.style.fontSize = `${config.fontSize}px`;

    // Notify YYC3Background component (same-tab custom event)
    window.dispatchEvent(new Event('yyc3-bg-update'));

    // Scanline
    const scanlineEl = document.querySelector('.scanline') as HTMLElement | null;
    if (scanlineEl) scanlineEl.style.display = config.scanline ? '' : 'none';

    // Glow
    const existingStyle = document.getElementById('yyc3-glow-style');
    if (existingStyle) existingStyle.remove();
    const style = document.createElement('style');
    style.id = 'yyc3-glow-style';
    style.textContent = `.glow-text { text-shadow: ${config.glowEffect ? `0 0 10px ${config.glowColor}80, 0 0 20px ${config.glowColor}50` : 'none'}; }`;
    document.head.appendChild(style);
  }, [config]);

  const setAccent = (color: string) => setConfig(prev => ({
    ...prev,
    accentColor: color,
    glowColor: color,
    shadowColor: color + '30',
  }));

  // Background image upload
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setConfig(prev => ({ ...prev, bgImageDataUrl: dataUrl, bgImageName: file.name }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Build font list (merged local + popular)
  const allFonts = React.useMemo(() => {
    const set = new Set([...POPULAR_FONTS, ...localFonts]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [localFonts]);

  const allMonoFonts = React.useMemo(() => {
    const monoFromLocal = localFonts.filter(f =>
      /mono|code|consol|courier|hack|fira|jetbrain|terminal|fixed|nerd/i.test(f)
    );
    const set = new Set([...POPULAR_MONO_FONTS, ...monoFromLocal]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [localFonts]);

  const filteredFonts = allFonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()));
  const filteredMonoFonts = allMonoFonts.filter(f => f.toLowerCase().includes(monoFontSearch.toLowerCase()));

  const shadowBlur = Math.round(config.shadowIntensity * 0.4);
  const shadowSpread = Math.round(config.shadowIntensity * 0.15);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ============ SECTION: Background ============ */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <ImageIcon className="w-4 h-4" style={{ color: config.accentColor }} />
          {t('settings.background')}
        </h4>

        {/* Background Color */}
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/10">
          <input
            type="color"
            value={config.bgColor}
            onChange={e => setConfig(prev => ({ ...prev, bgColor: e.target.value }))}
            className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-foreground">{t('settings.bg_color')}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">--background CSS variable</div>
          </div>
          <div className="flex gap-1.5">
            {['#050505', '#0a0a0f', '#0f172a', '#1a1a2e', '#0d1117', '#000000'].map(c => (
              <button key={c} onClick={() => setConfig(prev => ({ ...prev, bgColor: c }))}
                className={cn("w-6 h-6 rounded border transition-all hover:scale-110", config.bgColor === c ? "border-white/40 ring-1 ring-white/20" : "border-border/30")}
                style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
        </div>

        {/* Background Image Upload */}
        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/5 hover:bg-muted/10 transition-colors">
          <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
          <div className="flex items-center gap-4">
            {config.bgImageDataUrl && config.bgImageDataUrl !== '__stored__' ? (
              <div className="w-20 h-14 rounded-lg overflow-hidden border border-border shrink-0">
                <img src={config.bgImageDataUrl} alt="bg" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-14 rounded-lg border border-border/50 bg-muted/10 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono text-foreground">{t('settings.bg_image')}</div>
              {config.bgImageName ? (
                <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{config.bgImageName}</div>
              ) : (
                <div className="text-[10px] text-muted-foreground mt-0.5">JPG / PNG / WebP</div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono gap-1" onClick={() => bgFileRef.current?.click()}>
                <Upload className="w-3 h-3" />
                {t('settings.bg_image_upload')}
              </Button>
              {config.bgImageDataUrl && (
                <Button size="sm" variant="ghost" className="h-7 text-[10px] font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => setConfig(prev => ({ ...prev, bgImageDataUrl: '', bgImageName: '' }))}>
                  {t('settings.bg_image_clear')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Brightness + Blur sliders (only when image is set) */}
        {config.bgImageDataUrl && (
          <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">{t('settings.bg_brightness')}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: config.accentColor, backgroundColor: config.accentColor + '15' }}>{config.bgBrightness}%</span>
              </div>
              <Slider value={[config.bgBrightness]} onValueChange={([val]) => setConfig(prev => ({ ...prev, bgBrightness: val }))} min={10} max={100} step={5} />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>10% (Dark)</span>
                <span>100% (Original)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">{t('settings.bg_blur_amount')}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: config.accentColor, backgroundColor: config.accentColor + '15' }}>{config.bgBlurPx}px</span>
              </div>
              <Slider value={[config.bgBlurPx]} onValueChange={([val]) => setConfig(prev => ({ ...prev, bgBlurPx: val }))} min={0} max={30} step={1} />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>0px (Sharp)</span>
                <span>30px (Heavy blur)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ SECTION: Accent Color ============ */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Palette className="w-4 h-4" style={{ color: config.accentColor }} />
          {t('settings.accent_color')}
        </h4>
        <div className="grid grid-cols-5 gap-3">
          {ACCENT_PRESETS.map(preset => (
            <button key={preset.id} onClick={() => setAccent(preset.color)}
              className={cn("group relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:scale-105",
                config.accentColor === preset.color ? "border-white/30 bg-white/5 shadow-lg" : "border-border/30 hover:border-white/20")}>
              <div className="w-8 h-8 rounded-full border-2 transition-shadow"
                style={{ backgroundColor: preset.color, borderColor: config.accentColor === preset.color ? '#fff' : 'transparent', boxShadow: config.accentColor === preset.color ? `0 0 12px ${preset.color}80` : 'none' }} />
              <span className="text-[9px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">{preset.label}</span>
              {config.accentColor === preset.color && <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 text-white" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <span className="text-xs font-mono text-muted-foreground">Custom:</span>
          <input type="color" value={config.customColor}
            onChange={e => { setConfig(prev => ({ ...prev, customColor: e.target.value })); setAccent(e.target.value); }}
            className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent" />
          <code className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">{config.accentColor}</code>
        </div>
      </div>

      {/* ============ SECTION: Border + Shadow ============ */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Layers className="w-4 h-4" style={{ color: config.accentColor }} />
          Border / Shadow
        </h4>

        {/* Border Color */}
        <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/10" style={{ borderColor: config.borderColor }}>
          <input type="color" value={config.borderColor.slice(0, 7)}
            onChange={e => setConfig(prev => ({ ...prev, borderColor: e.target.value }))}
            className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-foreground">Border Color</div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {[
              { label: 'D', color: '#2d3748' }, { label: 'S', color: '#1a202c' },
              { label: 'B', color: '#4a5568' }, { label: 'A', color: config.accentColor },
            ].map(p => (
              <button key={p.label} onClick={() => setConfig(prev => ({ ...prev, borderColor: p.color }))}
                className={cn("w-6 h-6 rounded border text-[8px] font-mono flex items-center justify-center transition-all hover:scale-110",
                  config.borderColor === p.color ? "border-white/40" : "border-border/30")}
                style={{ backgroundColor: p.color }} title={p.label}>
                <span className="text-white/60">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shadow Color + Intensity */}
        <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/10">
          <input type="color" value={config.shadowColor.slice(0, 7)}
            onChange={e => setConfig(prev => ({ ...prev, shadowColor: e.target.value + '30' }))}
            className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-foreground">Shadow Color</div>
          </div>
          <code className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded shrink-0">{config.shadowColor}</code>
        </div>

        {/* Shadow Intensity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">{t('settings.shadow_intensity')}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: config.accentColor, backgroundColor: config.accentColor + '15' }}>{config.shadowIntensity}%</span>
          </div>
          <Slider value={[config.shadowIntensity]} onValueChange={([val]) => setConfig(prev => ({ ...prev, shadowIntensity: val }))} min={0} max={100} step={5} />
          <div className="flex gap-3">
            <div className="flex-1 h-14 rounded-lg border border-border/30 bg-muted/10 flex items-center justify-center text-[10px] font-mono text-muted-foreground"
              style={{ boxShadow: `0 ${Math.round(shadowBlur * 0.3)}px ${shadowBlur}px ${shadowSpread}px ${config.shadowColor}` }}>
              Shadow
            </div>
            <div className="flex-1 h-14 rounded-lg border border-border/30 bg-muted/10 flex items-center justify-center text-[10px] font-mono text-muted-foreground"
              style={{ boxShadow: `0 0 ${shadowBlur}px ${config.shadowColor}, inset 0 0 ${Math.round(shadowBlur * 0.6)}px ${config.shadowColor}` }}>
              Inset
            </div>
          </div>
        </div>

        {/* Glow Color */}
        <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/10">
          <input type="color" value={config.glowColor}
            onChange={e => setConfig(prev => ({ ...prev, glowColor: e.target.value }))}
            className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-foreground">Glow / Neon Color</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono shrink-0"
            style={{ color: config.glowColor, textShadow: `0 0 8px ${config.glowColor}80, 0 0 16px ${config.glowColor}40` }}>
            Y3
          </div>
        </div>
      </div>

      {/* ============ SECTION: Opacity Controls ============ */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Eye className="w-4 h-4" style={{ color: config.accentColor }} />
          Opacity
        </h4>

        {/* Panel Opacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">{t('settings.opacity')}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: config.accentColor, backgroundColor: config.accentColor + '15' }}>{config.panelOpacity}%</span>
          </div>
          <Slider value={[config.panelOpacity]} onValueChange={([val]) => setConfig(prev => ({ ...prev, panelOpacity: val }))} min={20} max={100} step={5} />
        </div>

        {/* Overlay / L2+ Page Opacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-muted-foreground">{t('settings.overlay_opacity')}</span>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">{t('settings.overlay_opacity_desc')}</div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded shrink-0" style={{ color: config.accentColor, backgroundColor: config.accentColor + '15' }}>{config.overlayOpacity}%</span>
          </div>
          <Slider value={[config.overlayOpacity]} onValueChange={([val]) => setConfig(prev => ({ ...prev, overlayOpacity: val }))} min={30} max={100} step={5} />
          {/* Preview: mini overlay stack */}
          <div className="relative h-20 rounded-lg border border-border/30 bg-muted/5 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-muted-foreground/30">BASE LAYER</div>
            <div className="absolute inset-x-4 inset-y-2 rounded-md border border-border/40 flex items-center justify-center text-[10px] font-mono"
              style={{ backgroundColor: `rgba(17,17,17,${config.overlayOpacity / 100})`, backdropFilter: config.bgBlur ? 'blur(8px)' : 'none' }}>
              <span style={{ color: config.accentColor }}>L2 Overlay ({config.overlayOpacity}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ SECTION: Font Selection ============ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium font-mono flex items-center gap-2">
            <Type className="w-4 h-4" style={{ color: config.accentColor }} />
            {t('settings.font_family')}
          </h4>
          <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono gap-1.5" onClick={detectLocalFonts}>
            <Search className="w-3 h-3" />
            {t('settings.detect_fonts')}
          </Button>
        </div>
        {localFonts.length > 0 && (
          <div className="text-[10px] font-mono px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
            {t('settings.font_count').replace('{count}', String(localFonts.length))}
          </div>
        )}

        {/* Main Font Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-muted-foreground block">{t('settings.font_family_desc')}</label>
          <div className="relative" ref={fontDropdownRef}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={showFontDropdown ? fontSearch : config.fontFamily}
                  onFocus={() => { setShowFontDropdown(true); setFontSearch(''); }}
                  onChange={e => setFontSearch(e.target.value)}
                  placeholder="Search fonts..."
                  className="pl-8 h-9 text-xs font-mono bg-muted/20"
                  style={{ fontFamily: `"${config.fontFamily}", system-ui` }}
                />
              </div>
            </div>
            {showFontDropdown && (
              <div className="absolute z-50 top-full mt-1 left-0 right-0 max-h-[280px] overflow-y-auto bg-background border border-border rounded-lg shadow-xl">
                <div className="p-1">
                  {filteredFonts.slice(0, 100).map(f => (
                    <button key={f}
                      onClick={() => { setConfig(prev => ({ ...prev, fontFamily: f })); setShowFontDropdown(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs rounded-md transition-colors flex items-center justify-between group",
                        config.fontFamily === f ? "bg-primary/10 text-primary" : "hover:bg-muted/30 text-foreground"
                      )}>
                      <span style={{ fontFamily: `"${f}", system-ui` }}>{f}</span>
                      <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100" style={{ fontFamily: `"${f}", system-ui` }}>AaBbCc 你好</span>
                    </button>
                  ))}
                  {filteredFonts.length === 0 && (
                    <div className="px-3 py-4 text-xs text-muted-foreground text-center font-mono">No fonts found</div>
                  )}
                  {filteredFonts.length > 100 && (
                    <div className="px-3 py-2 text-[10px] text-muted-foreground text-center font-mono border-t border-border/30">
                      Showing 100 of {filteredFonts.length} — refine search
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Font preview */}
          <div className="p-3 rounded-lg border border-border/30 bg-muted/5" style={{ fontFamily: `"${config.fontFamily}", system-ui` }}>
            <div className="text-sm text-foreground">The quick brown fox jumps over the lazy dog</div>
            <div className="text-sm text-foreground mt-1">敏捷的棕色狐狸跳过了懒惰的狗 — 0123456789</div>
          </div>
        </div>

        {/* Mono Font Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-muted-foreground block">{t('settings.mono_font')} — {t('settings.mono_font_desc')}</label>
          <div className="relative" ref={monoDropdownRef}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={showMonoDropdown ? monoFontSearch : config.monoFontFamily}
                onFocus={() => { setShowMonoDropdown(true); setMonoFontSearch(''); }}
                onChange={e => setMonoFontSearch(e.target.value)}
                placeholder="Search mono fonts..."
                className="pl-8 h-9 text-xs bg-muted/20"
                style={{ fontFamily: `"${config.monoFontFamily}", monospace` }}
              />
            </div>
            {showMonoDropdown && (
              <div className="absolute z-50 top-full mt-1 left-0 right-0 max-h-[240px] overflow-y-auto bg-background border border-border rounded-lg shadow-xl">
                <div className="p-1">
                  {filteredMonoFonts.slice(0, 60).map(f => (
                    <button key={f}
                      onClick={() => { setConfig(prev => ({ ...prev, monoFontFamily: f })); setShowMonoDropdown(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs rounded-md transition-colors flex items-center justify-between group",
                        config.monoFontFamily === f ? "bg-primary/10 text-primary" : "hover:bg-muted/30 text-foreground"
                      )}>
                      <span style={{ fontFamily: `"${f}", monospace` }}>{f}</span>
                      <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100" style={{ fontFamily: `"${f}", monospace` }}>const x = 42;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="p-3 rounded-lg border border-border/30 bg-muted/5" style={{ fontFamily: `"${config.monoFontFamily}", monospace` }}>
            <div className="text-xs text-foreground">{'const app = createServer({ port: 3000 });'}</div>
            <div className="text-xs text-muted-foreground mt-1">{'// 0Oo 1lI |!¡ {}[] () <> ,.;: "'}</div>
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-muted-foreground">{t('settings.font_size')}</span>
              <span className="text-[10px] text-muted-foreground/60 ml-2">{t('settings.font_size_desc')}</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: config.accentColor, backgroundColor: config.accentColor + '15' }}>{config.fontSize}px</span>
          </div>
          <Slider value={[config.fontSize]} onValueChange={([val]) => setConfig(prev => ({ ...prev, fontSize: val }))} min={10} max={20} step={1} />
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>10px</span>
            <span>14px (default)</span>
            <span>20px</span>
          </div>
        </div>
      </div>

      {/* ============ SECTION: Visual Effect Toggles ============ */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: config.accentColor }} />
          Visual Effects
        </h4>
        <div className="grid gap-2">
          {[
            { key: 'bgBlur' as const, label: t('settings.bg_blur'), desc: 'Backdrop blur on panels and overlays' },
            { key: 'scanline' as const, label: t('settings.scanline'), desc: 'CRT-style animated scanline overlay' },
            { key: 'glowEffect' as const, label: t('settings.glow'), desc: 'Neon glow effects on primary elements' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <label className="text-xs font-medium font-mono block">{item.label}</label>
                <span className="text-[10px] text-muted-foreground">{item.desc}</span>
              </div>
              <Switch checked={config[item.key]} onCheckedChange={val => setConfig(prev => ({ ...prev, [item.key]: val }))} />
            </div>
          ))}
        </div>
      </div>

      {/* ============ SECTION: Theme Preview ============ */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium font-mono flex items-center gap-2">
          <Monitor className="w-4 h-4" style={{ color: config.accentColor }} />
          {t('settings.theme_preview')}
        </h4>
        <div className="p-5 rounded-xl border relative overflow-hidden" style={{
          backgroundColor: `rgba(0,0,0,${config.panelOpacity / 100})`,
          borderColor: config.borderColor,
          boxShadow: `0 ${Math.round(shadowBlur * 0.3)}px ${shadowBlur}px ${shadowSpread}px ${config.shadowColor}`,
          fontFamily: `"${config.fontFamily}", system-ui`,
          fontSize: `${config.fontSize}px`,
        }}>
          {config.scanline && (
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
          )}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ backgroundColor: `${config.accentColor}15`, borderLeft: `2px solid ${config.accentColor}` }}>
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: config.accentColor, boxShadow: config.glowEffect ? `0 0 6px ${config.glowColor}80` : 'none' }} />
              <span className="text-xs" style={{ color: config.accentColor, fontFamily: `"${config.monoFontFamily}", monospace`, textShadow: config.glowEffect ? `0 0 8px ${config.glowColor}50` : 'none' }}>terminal.exe</span>
              <div className="ml-auto w-1.5 h-6 rounded-full" style={{ backgroundColor: config.accentColor }} />
            </div>
            <div className="flex items-center gap-3 px-3">
              <div className="w-7 h-7 rounded-lg border flex items-center justify-center text-[10px]"
                style={{ fontFamily: `"${config.monoFontFamily}", monospace`, borderColor: `${config.accentColor}50`, backgroundColor: `${config.accentColor}10`, color: config.accentColor, boxShadow: config.glowEffect ? `0 0 10px ${config.glowColor}30` : 'none' }}>
                Y3
              </div>
              <div className="space-y-0.5">
                <div className="text-xs" style={{ color: config.accentColor, fontFamily: `"${config.monoFontFamily}", monospace` }}>YYC3_DEVOPS</div>
                <div className="text-[9px] text-zinc-500">v3.0.1-beta</div>
              </div>
            </div>
            {/* L2 overlay preview inside */}
            <div className="rounded border px-3 py-2" style={{ borderColor: config.borderColor, backgroundColor: `rgba(17,17,17,${config.overlayOpacity / 100})`, backdropFilter: config.bgBlur ? 'blur(8px)' : 'none' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                <span className="text-[10px] text-zinc-400" style={{ fontFamily: `"${config.monoFontFamily}", monospace` }}>SYSTEM READY</span>
                <span className="ml-auto text-[9px]" style={{ color: config.accentColor, fontFamily: `"${config.monoFontFamily}", monospace` }}>42ms</span>
              </div>
            </div>
            <div className="flex gap-2 px-3">
              <div className="px-3 py-1.5 rounded text-[10px] border cursor-pointer" style={{ fontFamily: `"${config.monoFontFamily}", monospace`, borderColor: `${config.accentColor}40`, color: config.accentColor, backgroundColor: `${config.accentColor}10` }}>EXECUTE</div>
              <div className="px-3 py-1.5 rounded text-[10px] border text-zinc-500" style={{ fontFamily: `"${config.monoFontFamily}", monospace`, borderColor: config.borderColor }}>CANCEL</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Reset ============ */}
      <div className="flex justify-end pt-2">
        <Button variant="outline" size="sm"
          className="h-8 text-xs font-mono gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
          onClick={() => {
            setConfig(DEFAULT_APPEARANCE);
            localStorage.removeItem(BG_IMAGE_STORAGE_KEY);
            const root = document.documentElement;
            root.style.setProperty('--primary', DEFAULT_APPEARANCE.accentColor);
            root.style.setProperty('--ring', DEFAULT_APPEARANCE.accentColor);
            root.style.setProperty('--accent-foreground', DEFAULT_APPEARANCE.accentColor);
            root.style.setProperty('--border', DEFAULT_APPEARANCE.borderColor);
            root.style.setProperty('--input', DEFAULT_APPEARANCE.borderColor);
            root.style.setProperty('--background', DEFAULT_APPEARANCE.bgColor);
            document.body.style.fontFamily = '';
            document.body.style.fontSize = '';
          }}>
          RESET TO DEFAULT
        </Button>
      </div>
    </div>
  );
}

const AGENT_STATUS_STORAGE_KEY = 'yyc3-agent-status';

function loadAgentStatus(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(AGENT_STATUS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return Object.fromEntries(AGENT_REGISTRY.map(a => [a.id, true]));
}

function saveAgentStatus(status: Record<string, boolean>) {
  try { localStorage.setItem(AGENT_STATUS_STORAGE_KEY, JSON.stringify(status)); } catch { /* ignore */ }
}

function AgentsSettings({ t }: TranslationProps) {
  const [agentStatus, setAgentStatus] = React.useState<Record<string, boolean>>(() => loadAgentStatus());
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null);

  React.useEffect(() => { saveAgentStatus(agentStatus); }, [agentStatus]);

  const toggleAgent = (id: string) => {
    setAgentStatus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const enabledCount = Object.values(agentStatus).filter(Boolean).length;
  const selected = selectedAgent ? AGENT_REGISTRY.find(a => a.id === selectedAgent) : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-border bg-muted/10 text-center">
          <div className="text-lg font-mono text-primary">{AGENT_REGISTRY.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Agents</div>
        </div>
        <div className="p-3 rounded-lg border border-border bg-muted/10 text-center">
          <div className="text-lg font-mono text-green-500">{enabledCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Enabled</div>
        </div>
        <div className="p-3 rounded-lg border border-border bg-muted/10 text-center">
          <div className="text-lg font-mono text-amber-500">{AGENT_REGISTRY.length - enabledCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Standby</div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENT_REGISTRY.map(agent => {
          const isEnabled = agentStatus[agent.id] ?? true;
          const isSelected = selectedAgent === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
              className={cn(
                "p-4 rounded-lg border transition-all group cursor-pointer relative overflow-hidden",
                isSelected
                  ? `${agent.bgColor} ${agent.borderColor} shadow-lg`
                  : isEnabled
                    ? "bg-muted/5 border-border hover:border-primary/30"
                    : "bg-muted/5 border-border/50 opacity-50"
              )}
            >
              {/* Subtle gradient background */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none" />
              )}

              <div className="relative z-10 flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center text-lg shrink-0", agent.bgColor, agent.borderColor)}>
                  <Bot className={cn("w-5 h-5", agent.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={cn("text-sm font-mono", isSelected ? agent.color : "text-foreground")}>{agent.name}</h4>
                    <span className="text-[9px] font-mono text-muted-foreground">{agent.nameEn}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded border", agent.bgColor, agent.borderColor, agent.color)}>
                      {agent.role}
                    </span>
                    <span className={cn("text-[9px] font-mono", isEnabled ? "text-green-400" : "text-zinc-500")}>
                      {isEnabled ? 'ACTIVE' : 'STANDBY'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{agent.desc}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{agent.descEn}</p>
                </div>
                <div className="shrink-0" onClick={e => e.stopPropagation()}>
                  <Switch checked={isEnabled} onCheckedChange={() => toggleAgent(agent.id)} />
                </div>
              </div>

              {/* Expanded Detail */}
              {isSelected && (
                <div className="relative z-10 mt-4 pt-3 border-t border-border/30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">{t('settings.agent_name')}</span>
                      <div className={agent.color}>{agent.name} ({agent.nameEn})</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">{t('settings.agent_role')}</span>
                      <div className="text-foreground">{agent.role}</div>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-muted-foreground">{t('settings.agent_desc')}</span>
                      <div className="text-foreground">{agent.desc}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">{t('settings.agent_status')}</span>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", isEnabled ? "bg-green-500 animate-pulse shadow-[0_0_4px_#22c55e]" : "bg-zinc-500")} />
                        <span className={isEnabled ? "text-green-400" : "text-zinc-500"}>{isEnabled ? 'ONLINE' : 'OFFLINE'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Icon</span>
                      <div className="text-foreground">{agent.icon}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs font-mono gap-1.5"
          onClick={() => setAgentStatus(Object.fromEntries(AGENT_REGISTRY.map(a => [a.id, true])))}
        >
          <CheckCircle2 className="w-3 h-3" />
          ENABLE ALL
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs font-mono gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
          onClick={() => setAgentStatus(Object.fromEntries(AGENT_REGISTRY.map(a => [a.id, false])))}
        >
          STANDBY ALL
        </Button>
      </div>
    </div>
  );
}
