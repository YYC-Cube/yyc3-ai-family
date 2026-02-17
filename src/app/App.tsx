import * as React from "react";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { ChatArea } from "@/app/components/chat/ChatArea";
import { ArtifactsPanel } from "@/app/components/chat/ArtifactsPanel";
import { YYC3Background } from "@/app/components/chat/YYC3Background";
import { SettingsModal } from "@/app/components/settings/SettingsModal";
import { LanguageProvider } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useSystemStore } from "@/lib/store";
import type { ChatMessage, ViewMode } from "@/lib/types";
import { useMetricsSimulator } from "@/lib/useMetricsSimulator";
import { useWebSocket } from "@/lib/useWebSocket";
import { usePersistenceSync } from "@/lib/persistence-binding";
import { eventBus } from "@/lib/event-bus";
import { _registerEventBusRef } from "@/lib/agent-orchestrator";
// NOTE: theme.css is already imported via main.tsx → index.css → theme.css
// Do NOT re-import it here to avoid double Tailwind CSS processing.
import { Loader2 } from "lucide-react";
import { useOllamaDiscovery } from "@/lib/useOllamaDiscovery";
import { updateOllamaModels } from "@/lib/llm-providers";
import { generalStreamChat, hasConfiguredProvider, trackUsage, loadProviderConfigs } from "@/lib/llm-bridge";
import type { LLMMessage } from "@/lib/llm-bridge";
import { PROVIDERS } from "@/lib/llm-providers";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelHandle } from "react-resizable-panels";

// Lazy Load Components
const ConsoleView = React.lazy(() => import('@/app/components/console/ConsoleView').then(module => ({ default: module.ConsoleView })));
const ServiceHealthMonitor = React.lazy(() => import('@/app/components/monitoring/ServiceHealthMonitor').then(module => ({ default: module.ServiceHealthMonitor })));
const ProjectsView = React.lazy(() => import('@/app/components/views/ProjectsView').then(module => ({ default: module.ProjectsView })));
const ArtifactsView = React.lazy(() => import('@/app/components/views/ArtifactsView').then(module => ({ default: module.ArtifactsView })));
const ServicesView = React.lazy(() => import('@/app/components/views/ServicesView').then(module => ({ default: module.ServicesView })));
const KnowledgeBaseView = React.lazy(() => import('@/app/components/views/KnowledgeBaseView').then(module => ({ default: module.KnowledgeBaseView })));
const BookmarksView = React.lazy(() => import('@/app/components/views/BookmarksView').then(module => ({ default: module.BookmarksView })));

// Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center h-screen bg-black text-red-500 font-mono flex-col gap-4">
          <h1 className="text-2xl font-bold">SYSTEM_CRITICAL_FAILURE</h1>
          <p className="text-sm">Initiating failover protocol...</p>
          <p className="text-xs text-red-400/60 max-w-md truncate">{this.state.errorMessage}</p>
          <button onClick={() => this.setState({ hasError: false, errorMessage: '' })} className="px-4 py-2 border border-red-500 hover:bg-red-500/10 transition-colors">
            RETRY_MODULE
          </button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 border border-red-500/50 hover:bg-red-500/10 transition-colors text-red-400/70 text-xs">
            REBOOT_KERNEL
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// === Responsive breakpoint hook ===
function useResponsive() {
  const setIsMobile = useSystemStore((s) => s.setIsMobile);
  const setIsTablet = useSystemStore((s) => s.setIsTablet);

  React.useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setIsMobile, setIsTablet]);
}

function AppContent() {
  const { language } = useTranslation();

  // === Responsive detection ===
  useResponsive();
  const isMobile = useSystemStore((s) => s.isMobile);

  // === Phase 18.1: Auto-persist store ↔ PersistenceEngine ===
  usePersistenceSync();

  // === Phase 18.4: Register Event Bus for cross-module access ===
  React.useEffect(() => { _registerEventBusRef(eventBus); }, []);

  // === Restore appearance config on mount ===
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('yyc3-appearance-config');
      if (raw) {
        const cfg = JSON.parse(raw);
        const root = document.documentElement;
        if (cfg.accentColor) {
          root.style.setProperty('--primary', cfg.accentColor);
          root.style.setProperty('--ring', cfg.accentColor);
          root.style.setProperty('--accent-foreground', cfg.accentColor);
        }
        if (cfg.borderColor) {
          root.style.setProperty('--border', cfg.borderColor);
          root.style.setProperty('--input', cfg.borderColor);
        }
        if (cfg.bgColor) {
          root.style.setProperty('--background', cfg.bgColor);
        }
        if (cfg.overlayOpacity !== undefined) {
          root.style.setProperty('--yyc3-overlay-opacity', String(cfg.overlayOpacity / 100));
        }
        if (cfg.shadowIntensity !== undefined) {
          root.style.setProperty('--yyc3-shadow-intensity', String(cfg.shadowIntensity / 100));
        }
        // Font restoration
        if (cfg.fontFamily) {
          root.style.setProperty('--yyc3-font-family', `"${cfg.fontFamily}", system-ui, sans-serif`);
          root.style.setProperty('--font-sans', `"${cfg.fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`);
          document.body.style.fontFamily = `"${cfg.fontFamily}", system-ui, -apple-system, sans-serif`;
        }
        if (cfg.monoFontFamily) {
          root.style.setProperty('--yyc3-mono-font', `"${cfg.monoFontFamily}", "JetBrains Mono", monospace`);
          root.style.setProperty('--font-mono', `"${cfg.monoFontFamily}", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`);
        }
        if (cfg.fontSize) {
          root.style.setProperty('--yyc3-font-size', `${cfg.fontSize}px`);
          document.body.style.fontSize = `${cfg.fontSize}px`;
        }
        if (cfg.scanline === false) {
          const scanlineEl = document.querySelector('.scanline') as HTMLElement | null;
          if (scanlineEl) scanlineEl.style.display = 'none';
        }
        if (cfg.glowColor && cfg.glowEffect !== undefined) {
          const style = document.createElement('style');
          style.id = 'yyc3-glow-style';
          style.textContent = `.glow-text { text-shadow: ${cfg.glowEffect ? `0 0 10px ${cfg.glowColor}80, 0 0 20px ${cfg.glowColor}50` : 'none'}; }`;
          document.head.appendChild(style);
        }
        // Background image is restored by YYC3Background component from localStorage directly
      }
    } catch { /* ignore */ }
  }, []);

  // === Start real-time metrics simulation engine ===
  const { status: wsStatus } = useWebSocket();
  useMetricsSimulator(wsStatus === 'connected' ? 0 : 2000);

  // === Phase 24: Ollama → Provider Registry Auto-Sync ===
  const { models: ollamaModels, status: ollamaStatus } = useOllamaDiscovery();
  React.useEffect(() => {
    if (ollamaStatus === 'connected' && ollamaModels.length > 0) {
      const mapped = ollamaModels.map(m => ({
        id: m.name,
        name: m.name,
        parameterSize: m.details?.parameter_size || 'unknown',
        family: m.details?.family || 'unknown',
      }));
      updateOllamaModels(mapped);
      useSystemStore.getState().addLog('info', 'OLLAMA_SYNC', `Synced ${mapped.length} models to Provider Registry`);
    }
  }, [ollamaModels, ollamaStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Zustand Global State ===
  const activeView = useSystemStore((s) => s.activeView);
  const setActiveView = useSystemStore((s) => s.setActiveView);

  const messages = useSystemStore((s) => s.messages);
  const addMessage = useSystemStore((s) => s.addMessage);
  const isStreaming = useSystemStore((s) => s.isStreaming);
  const setIsStreaming = useSystemStore((s) => s.setIsStreaming);
  const isArtifactsOpen = useSystemStore((s) => s.isArtifactsOpen);
  const setIsArtifactsOpen = useSystemStore((s) => s.setIsArtifactsOpen);
  const toggleArtifactsPanel = useSystemStore((s) => s.toggleArtifactsPanel);
  const activeArtifact = useSystemStore((s) => s.activeArtifact);
  const setActiveArtifact = useSystemStore((s) => s.setActiveArtifact);

  const isSettingsOpen = useSystemStore((s) => s.isSettingsOpen);
  const openSettings = useSystemStore((s) => s.openSettings);
  const closeSettings = useSystemStore((s) => s.closeSettings);
  const settingsTab = useSystemStore((s) => s.settingsTab);

  const newSession = useSystemStore((s) => s.newSession);
  const navigateToAgent = useSystemStore((s) => s.navigateToAgent);
  const navigateToConsoleTab = useSystemStore((s) => s.navigateToConsoleTab);
  const addLog = useSystemStore((s) => s.addLog);
  const chatMode = useSystemStore((s) => s.chatMode);
  const updateLastAiMessage = useSystemStore((s) => s.updateLastAiMessage);

  // === Ctrl+M: Quick toggle between navigate/AI mode ===
  const toggleChatMode = useSystemStore((s) => s.toggleChatMode);
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+M (or Cmd+M on Mac) toggles chat mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        toggleChatMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleChatMode]);

  // === AbortController for AI streaming ===
  const abortRef = React.useRef<AbortController | null>(null);

  // === Imperative ref for artifacts panel (collapsible) ===
  const artifactsPanelRef = React.useRef<ImperativePanelHandle>(null);

  // Sync collapse/expand with store state
  React.useEffect(() => {
    if (!artifactsPanelRef.current) return;
    if (isArtifactsOpen) {
      if (artifactsPanelRef.current.isCollapsed()) {
        artifactsPanelRef.current.expand(30);
      }
    } else {
      if (artifactsPanelRef.current.isExpanded()) {
        artifactsPanelRef.current.collapse();
      }
    }
  }, [isArtifactsOpen]);

  // === Navigation Intent Matching ===
  const matchNavigationIntent = (lowerText: string): { target: string; action: () => void } | null => {
    // Agent navigation
    const agentMap: Record<string, string> = {
      'navigator': 'navigator', '领航员': 'navigator',
      'sentinel': 'sentinel', '哨兵': 'sentinel',
      'thinker': 'thinker', '思想家': 'thinker',
      'prophet': 'prophet', '先知': 'prophet',
      'bole': 'bole', '伯乐': 'bole',
      'pivot': 'pivot', '天枢': 'pivot',
      'grandmaster': 'grandmaster', '宗师': 'grandmaster',
    };
    for (const [keyword, agentId] of Object.entries(agentMap)) {
      if (lowerText.includes(keyword)) {
        return { target: `Agent: ${agentId}`, action: () => navigateToAgent(agentId) };
      }
    }

    // Console tab navigation
    const tabMap: [string[], string, string][] = [
      [['architecture', '架构'], 'architecture', 'Architecture'],
      [['dashboard', '仪表盘', '总控'], 'dashboard', 'Dashboard'],
      [['devops', 'pipeline', '运维', 'dag', 'workflow', '工作流', 'template', '模板'], 'devops', 'DevOps'],
      [['mcp', '工具链', 'tool chain'], 'mcp', 'MCP Tools'],
      [['persist', '持久化', 'snapshot', '快照', '备份'], 'persist', 'Persistence'],
      [['编排', 'orchestrat', '协作', 'collaborat', 'multi-agent'], 'orchestrate', 'Orchestration'],
      [['身份', 'identity', '角色卡', 'role card'], 'agent_identity', 'Agent Identity'],
      [['家人', 'family', '陪伴'], 'family_presence', 'Family Presence'],
      [['知识', 'knowledge', 'kb'], 'knowledge_base', 'Knowledge Base'],
      [['部署工具', 'deploy toolkit', '连通性', 'connectivity'], 'nas_deployment', 'NAS Deployment'],
      [['历史指标', 'metrics history', '趋势', 'trend'], 'metrics_history', 'Metrics History'],
      [['远程部署', 'remote deploy', '一键部署', 'docker compose', '容器部署'], 'remote_docker_deploy', 'Remote Deploy'],
      [['诊断', 'diagnostic', '自诊断', 'self-check', '健康检查'], 'dashboard', 'Diagnostics'],
      [['ollama', '本地模型', 'local model', '离线模型'], 'ollama_manager', 'Ollama Manager'],
      [['api文档', 'api doc', '接口文档', 'api reference'], 'api_docs', 'API Docs'],
      [['smoke', '烟雾测试', 'e2e', '冒烟'], 'smoke_test', 'Smoke Test'],
      [['test framework', '测试框架', 'type audit', '类型审计', 'test suite', '测试套件'], 'test_framework', 'Test Framework'],
      [['stream diagnostic', '流式诊断', 'streaming test', '流式测试', 'e2e stream', 'provider health'], 'stream_diagnostics', 'Stream Diagnostics'],
    ];
    for (const [keywords, tab, label] of tabMap) {
      if (keywords.some(k => lowerText.includes(k))) {
        return { target: label, action: () => navigateToConsoleTab(tab) };
      }
    }

    // View navigation
    if (lowerText.includes('project') || lowerText.includes('项目')) {
      return { target: 'Projects', action: () => setActiveView('projects') };
    }
    if (lowerText.includes('artifact') || lowerText.includes('工件') || lowerText.includes('制品')) {
      return { target: 'Artifacts', action: () => setActiveView('artifacts') };
    }
    if (lowerText.includes('monitor') || lowerText.includes('监控') || lowerText.includes('health')) {
      return { target: 'Monitor', action: () => setActiveView('monitor') };
    }
    if (lowerText.includes('settings') || lowerText.includes('设置') || lowerText.includes('config')) {
      return { target: 'Settings', action: () => navigateToConsoleTab('settings') };
    }

    return null;
  };

  // === Neural Link: Intent-driven Navigation + AI Chat ===
  const handleSendMessage = React.useCallback(async (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessage(newMessage);
    setIsStreaming(true);

    const lowerText = text.toLowerCase().trim();
    const currentMode = useSystemStore.getState().chatMode;

    // === Built-in Commands (工作在所有模式下) ===
    const builtinCommands = {
      'ls': () => {
        const helpMsg = language === 'zh'
          ? `**可用命令列表**\n\n📋 **导航命令**\n- 仪表盘 / dashboard\n- 架构 / architecture\n- DevOps / devops\n- 项目 / projects\n- 监控 / monitor\n- 设置 / settings\n- 知识库 / knowledge\n- 部署工具 / deploy\n\n🤖 **AI 命令**\n- 任意问题 → 发送给 AI\n- ollama list → 查看本地模型\n\n🎛️ **系统命令**\n- ls / help → 显示此帮助\n- status → 系统状态\n\n💡 **模式切换**\n- 点击顶栏切换「导航」/「AI 对话」模式\n- 快捷键: Ctrl+M (Mac: Cmd+M)\n\n---\n\n💬 现在可以输入问题开始 AI 对话，或输入导航命令跳转页面。`
          : `**Available Commands**\n\n📋 **Navigation**\n- dashboard\n- architecture\n- devops\n- projects\n- monitor\n- settings\n- knowledge\n- deploy\n\n🤖 **AI Commands**\n- Any question → Send to AI\n- ollama list → List local models\n\n🎛️ **System Commands**\n- ls / help → Show this help\n- status → System status\n\n💡 **Mode Switch**\n- Toggle \"Navigate\" / \"AI Chat\" in top bar\n- Shortcut: Ctrl+M (Mac: Cmd+M)\n\n---\n\n💬 Enter a question to chat with AI, or use navigation commands.`;
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: helpMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: "YYC3 Core",
        });
        setIsStreaming(false);
      },
      'help': () => builtinCommands['ls'](),
      'status': () => {
        const configs = loadProviderConfigs();
        const availableProviders = configs.filter(c => c.apiKey);
        const statusMsg = language === 'zh'
          ? `**系统状态**\n\n🤖 **AI Provider**\n${availableProviders.length > 0
            ? availableProviders.map(p => {
              const provider = PROVIDERS[p.providerId];
              return `- ${provider?.name || p.providerId}: ✅ 正常`;
            }).join('\n')
            : '- ⚠️ 未配置 AI Provider'}\n\n💾 **存储策略**\n- 当前: localStorage\n\n🎨 **当前模式**\n- ${currentMode === 'navigate' ? '导航模式' : 'AI 对话'}\n\n---\n\n💡 输入 \`ls\` 查看可用命令`
          : `**System Status**\n\n🤖 **AI Provider**\n${availableProviders.length > 0
            ? availableProviders.map(p => {
              const provider = PROVIDERS[p.providerId];
              return `- ${provider?.name || p.providerId}: ✅ Active`;
            }).join('\n')
            : '- ⚠️ No AI Provider configured'}\n\n💾 **Storage**\n- Current: localStorage\n\n🎨 **Current Mode**\n- ${currentMode === 'navigate' ? 'Navigate' : 'AI Chat'}\n\n---\n\n💡 Type \`ls\` for available commands`;
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: statusMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: "YYC3 Core",
        });
        setIsStreaming(false);
      },
    };

    // Check for built-in commands first (精确匹配)
    if (builtinCommands[lowerText as keyof typeof builtinCommands]) {
      addLog('info', 'BUILTIN_CMD', `Executing: ${lowerText}`);
      setTimeout(() => builtinCommands[lowerText as keyof typeof builtinCommands](), 300);
      return;
    }

    // Also check for commands with arguments (如 "ollama list")
    if (lowerText === 'ollama list' || lowerText.startsWith('ollama ')) {
      // This will be handled by the AI or special logic
      addLog('info', 'CMD_PREFIX', `Ollama command detected: ${lowerText}`);
    }

    // --- Navigate Mode ---
    if (currentMode === 'navigate') {
      const intent = matchNavigationIntent(lowerText);

      if (intent) {
        setTimeout(() => intent.action(), 600);
        addLog('info', 'NEURAL_LINK', `Navigating to: ${intent.target}`);

        setTimeout(() => {
          const navMsg = language === 'zh'
            ? `✅ 已导航至: **${intent.target}**\n\n视界已同步。如需 AI 对话，请点击顶栏切换至「AI 对话」模式。`
            : `✅ Navigated to: **${intent.target}**\n\nVisual context synced. Switch to "AI Chat" mode in the top bar for AI conversation.`;
          addMessage({
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: navMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            agentName: "YYC3 Core",
          });
          setIsStreaming(false);
        }, 800);
      } else {
        addLog('info', 'NEURAL_LINK', `No navigation match for: "${text.substring(0, 40)}"`);

        setTimeout(() => {
          const unknownMsg = language === 'zh'
            ? `🔍 未识别导航意图。\n\n可用关键词：「仪表盘」「架构」「DevOps」「项目」「监控」「设置」「Ollama」等。\n\n💡 如需 AI 对话，请切换至「AI 对话」模式。`
            : `🔍 Navigation intent not recognized.\n\nAvailable keywords: "dashboard", "architecture", "devops", "projects", "monitor", "settings", "ollama", etc.\n\n💡 Switch to "AI Chat" mode for AI conversation.`;
          addMessage({
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: unknownMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            agentName: "YYC3 Core",
          });
          setIsStreaming(false);
        }, 600);
      }
      return;
    }

    // --- AI Chat Mode ---
    // Check if any provider is configured
    if (!hasConfiguredProvider()) {
      addLog('warn', 'LLM_BRIDGE', 'No AI provider configured');
      setTimeout(() => {
        const noProviderMsg = language === 'zh'
          ? `⚠️ 尚未配置 AI 模型。\n\n请前往 **设置 → AI 模型** 配置至少一个 Provider 的 API Key（支持 OpenAI、Anthropic、DeepSeek、智谱、Groq、Ollama 等）。\n\n配置完成后即可在此直接与 AI 对话。`
          : `⚠️ No AI provider configured.\n\nGo to **Settings → AI Models** to set up at least one provider API key (supports OpenAI, Anthropic, DeepSeek, Zhipu, Groq, Ollama, etc.).\n\nOnce configured, you can chat with AI directly here.`;
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: noProviderMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: "YYC3 Core",
        });
        setIsStreaming(false);
      }, 300);
      return;
    }

    // Also check for navigation intents in AI mode (e.g., "go to dashboard")
    // Smart Auto-Switch: detect nav intent, auto-execute, and prepend context to AI response
    const navIntent = matchNavigationIntent(lowerText);
    const isExplicitNav = navIntent && (
      lowerText.includes('go to') || lowerText.includes('打开') ||
      lowerText.includes('跳转') || lowerText.includes('navigate') ||
      lowerText.includes('open') || lowerText.includes('show me') ||
      lowerText.includes('切换到') || lowerText.includes('转到') ||
      lowerText.includes('进入') || lowerText.includes('看看')
    );
    if (isExplicitNav && navIntent) {
      // Auto-execute the navigation
      setTimeout(() => navIntent.action(), 600);
      addLog('info', 'SMART_NAV', `AI mode auto-nav: ${navIntent.target}`);
    }

    // Build chat history for LLM context
    const currentMessages = useSystemStore.getState().messages;
    const chatHistory: LLMMessage[] = currentMessages
      .filter(m => m.id !== newMessage.id) // exclude the message we just added
      .slice(-20)
      .map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }));

    // Create placeholder AI message for streaming
    const aiMsgId = (Date.now() + 1).toString();
    addMessage({
      id: aiMsgId,
      role: "ai",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentName: "YYC3 Core",
    });

    // Abort any previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = "";

    try {
      addLog('info', 'LLM_BRIDGE', `Streaming request: "${text.substring(0, 40)}..."`);

      // Show current model info before AI response
      const configs = loadProviderConfigs();
      const availableProviders = configs.filter(c => c.apiKey);
      const currentProvider = availableProviders.length > 0 ? availableProviders[0] : null;

      if (currentProvider) {
        const provider = PROVIDERS[currentProvider.providerId];
        if (provider) {
          const modelInfo = language === 'zh'
            ? `**当前使用的 AI 模型**\n\n**${provider.name}**\n- 模型: ${currentProvider.defaultModel || provider.defaultModel}\n- 状态: 正常 ✅\n\n💭 正在思考...\n\n---\n\n`
            : `**Current AI Model**\n\n**${provider.name}**\n- Model: ${currentProvider.defaultModel || provider.defaultModel}\n- Status: Active ✅\n\n💭 Thinking...\n\n---\n\n`;

          // Prepend model info to the AI message
          updateLastAiMessage(modelInfo);
        }
      }

      const response = await generalStreamChat(
        text,
        chatHistory,
        (chunk) => {
          if (chunk.type === 'content') {
            accumulated += chunk.content;
            updateLastAiMessage(accumulated);
          }
        },
        controller.signal
      );

      if (response) {
        // Track usage
        trackUsage(response, 'general');
        addLog('info', 'LLM_BRIDGE', `Response complete: ${response.provider}/${response.model} (${response.latencyMs}ms, ${response.usage.totalTokens} tokens)`);
      } else {
        // Fallback: all providers failed or returned null
        const fallbackMsg = language === 'zh'
          ? `⚠️ AI 请求失败，所有 Provider 均不可用。请检查 **设置 → AI 模型** 中的 API Key 和网络连接。`
          : `⚠️ AI request failed — all providers unavailable. Check your API keys and network in **Settings → AI Models**.`;
        updateLastAiMessage(fallbackMsg);
        addLog('warn', 'LLM_BRIDGE', 'All providers failed, template fallback');
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === 'Request aborted') {
        addLog('info', 'LLM_BRIDGE', 'Request aborted by user');
      } else {
        const errorMsg = language === 'zh'
          ? `❌ 请求出错: ${error.message || '未知错误'}\n\n请检查网络连接和 API 配置。`
          : `❌ Request error: ${error.message || 'Unknown error'}\n\nCheck your network and API configuration.`;
        updateLastAiMessage(errorMsg);
        addLog('error', 'LLM_BRIDGE', `Stream error: ${error.message}`);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [language, addMessage, setIsStreaming, addLog, navigateToAgent, navigateToConsoleTab, setActiveView, updateLastAiMessage]);

  const handleOpenArtifact = (code: string, lang: string) => {
    setActiveArtifact({
      code,
      language: lang,
      title: 'generated_component.tsx',
    });
  };

  return (
    <div className="flex h-screen w-full text-foreground overflow-hidden font-sans selection:bg-primary/30 relative">
      <YYC3Background />
      <div className="scanline" />

      <Sidebar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view as ViewMode)}
        onNewSession={newSession}
        onOpenSettings={openSettings}
      />

      <main className={cn(
        "flex-1 flex min-w-0 min-h-0 relative z-10 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isMobile && "pt-12 flex-col"
      )}>
        <ErrorBoundary>
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-full w-full text-primary gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-mono text-xs tracking-widest">LOADING_MODULE...</span>
            </div>
          }>
            {activeView === 'terminal' ? (
              /* === Three-column resizable layout (Vercel v0 style) === */
              isMobile ? (
                /* Mobile: stack vertically, no resizable panels */
                <div className="flex-1 flex flex-col min-w-0 h-full">
                  <ChatArea
                    messages={messages}
                    isStreaming={isStreaming}
                    onSendMessage={handleSendMessage}
                    onOpenArtifact={handleOpenArtifact}
                    isArtifactsOpen={isArtifactsOpen}
                    onToggleArtifacts={toggleArtifactsPanel}
                    onOpenSettings={openSettings}
                  />
                  {isArtifactsOpen && (
                    <ArtifactsPanel
                      isOpen={isArtifactsOpen}
                      onClose={() => setIsArtifactsOpen(false)}
                      artifact={activeArtifact}
                    />
                  )}
                </div>
              ) : (
                /* Desktop: resizable horizontal panels */
                <PanelGroup direction="horizontal" className="h-full w-full" autoSaveId="yyc3-main-layout">
                  {/* Chat Panel */}
                  <Panel
                    defaultSize={40}
                    minSize={25}
                    id="chat-panel"
                    order={1}
                  >
                    <ChatArea
                      messages={messages}
                      isStreaming={isStreaming}
                      onSendMessage={handleSendMessage}
                      onOpenArtifact={handleOpenArtifact}
                      isArtifactsOpen={isArtifactsOpen}
                      onToggleArtifacts={toggleArtifactsPanel}
                      onOpenSettings={openSettings}
                    />
                  </Panel>

                  {/* Resize Handle */}
                  <PanelResizeHandle className={cn(
                    "w-[3px] relative group/handle hover:w-[5px] transition-all duration-200 z-20",
                    !isArtifactsOpen && "pointer-events-none opacity-0 w-0"
                  )}>
                    <div className="absolute inset-0 bg-[#0EA5E9]/20 group-hover/handle:bg-[#0EA5E9]/50 transition-colors" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-10 rounded-full bg-[#0EA5E9]/40 group-hover/handle:bg-[#0EA5E9]/80 group-hover/handle:h-16 transition-all shadow-[0_0_8px_rgba(14,165,233,0.3)]" />
                  </PanelResizeHandle>

                  {/* Artifacts Panel — always mounted, collapsible */}
                  <Panel
                    ref={artifactsPanelRef}
                    defaultSize={60}
                    minSize={30}
                    collapsible={true}
                    collapsedSize={0}
                    id="artifacts-panel"
                    order={2}
                    onCollapse={() => setIsArtifactsOpen(false)}
                    onExpand={() => setIsArtifactsOpen(true)}
                  >
                    <ArtifactsPanel
                      isOpen={isArtifactsOpen}
                      onClose={() => setIsArtifactsOpen(false)}
                      artifact={activeArtifact}
                    />
                  </Panel>
                </PanelGroup>
              )
            ) : activeView === 'console' ? (
              <ConsoleView />
            ) : activeView === 'monitor' ? (
              <ServiceHealthMonitor />
            ) : activeView === 'projects' ? (
              <ProjectsView />
            ) : activeView === 'artifacts' ? (
              <ArtifactsView />
            ) : activeView === 'services' ? (
              <ServicesView />
            ) : activeView === 'knowledge' ? (
              <KnowledgeBaseView />
            ) : activeView === 'bookmarks' ? (
              <BookmarksView />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono">
                <div className="text-center animate-pulse">
                  <p className="text-xl mb-2">UNKNOWN_VIEW</p>
                  <p className="text-xs">View &quot;{activeView}&quot; not recognized.</p>
                </div>
              </div>
            )}
          </React.Suspense>
        </ErrorBoundary>
      </main>

      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={(open) => {
          if (!open) closeSettings();
        }}
        defaultTab={settingsTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
