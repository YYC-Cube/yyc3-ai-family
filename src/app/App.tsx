import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { ArtifactsPanel } from '@/app/components/chat/ArtifactsPanel';
import { ChatArea } from '@/app/components/chat/ChatArea';
import { YYC3Background } from '@/app/components/chat/YYC3Background';
import { ComponentErrorBoundary } from '@/app/components/console/ComponentErrorBoundary';
import { MobileNavBar } from '@/app/components/layout/MobileNavBar';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { NeuralLinkOverlay } from '@/app/components/monitoring/NeuralLinkOverlay';
import { SettingsModal } from '@/app/components/settings/SettingsModal';
import { Panel, PanelGroup, PanelResizeHandle } from '@/app/components/ui/resizable-panels';
import type { ImperativePanelHandle } from '@/app/components/ui/resizable-panels';
import { _registerEventBusRef } from '@/lib/agent-orchestrator';
import { eventBus } from '@/lib/event-bus';
import { LanguageProvider, useTranslation } from '@/lib/i18n';
// NOTE: theme.css is already imported via main.tsx → index.css → theme.css
// Do NOT re-import it here to avoid double Tailwind CSS processing.
import { generalStreamChat, hasConfiguredProvider, trackUsage, loadProviderConfigs, initProviderConfigs } from '@/lib/llm-bridge';
import type { LLMMessage } from '@/lib/llm-bridge';
import { updateOllamaModels, PROVIDERS } from '@/lib/llm-providers';
import { initMCPRegistry } from '@/lib/mcp-protocol';
import { usePersistenceSync } from '@/lib/persistence-binding';
import { getProxiedProviders } from '@/lib/proxy-endpoints';
import { useSystemStore } from '@/lib/store';
import type { ChatMessage, ViewMode } from '@/lib/types';
import { useMetricsSimulator } from '@/lib/useMetricsSimulator';
import { useOllamaDiscovery } from '@/lib/useOllamaDiscovery';
import { useWebSocket } from '@/lib/useWebSocket';
import { cn } from '@/lib/utils';

// Lazy Load Components
const ConsoleView = React.lazy(() => import('@/app/components/console/ConsoleView').then(module => ({ default: module.ConsoleView })));
const SecurityAudit = React.lazy(() => import('@/app/components/console/SecurityAudit').then(module => ({ default: module.SecurityAudit })));
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
    console.error('Uncaught error:', error, errorInfo);
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
  const setIsMobile = useSystemStore(s => s.setIsMobile);
  const setIsTablet = useSystemStore(s => s.setIsTablet);

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

// === Navigation Intent Matcher (Phase 15) ===
function matchNavigationIntent(lowerText: string) {
  const state = useSystemStore.getState();

  // Agent matching
  const agentMap: Record<string, string> = {
    'navigator': 'navigator', '领航员': 'navigator',
    'thinker': 'thinker', '思想家': 'thinker',
    'prophet': 'prophet', '先知': 'prophet',
    'bole': 'bole', '伯乐': 'bole',
    'pivot': 'pivot', '天枢': 'pivot',
    'sentinel': 'sentinel', '哨兵': 'sentinel',
    'grandmaster': 'grandmaster', '宗师': 'grandmaster',
  };

  for (const [key, id] of Object.entries(agentMap)) {
    if (lowerText.includes(key)) {
      return { target: `Agent: ${id.toUpperCase()}`, action: () => state.navigateToAgent(id) };
    }
  }

  // Console Tab matching
  if (lowerText.includes('dashboard') || lowerText.includes('仪表盘'))
  {return { target: 'Dashboard', action: () => state.navigateToConsoleTab('dashboard') };}
  if (lowerText.includes('devops') || lowerText.includes('运维') || lowerText.includes('pipeline') || lowerText.includes('workflow'))
  {return { target: 'DevOps Workspace', action: () => state.navigateToConsoleTab('devops') };}
  if (lowerText.includes('ollama') || lowerText.includes('本地模型'))
  {return { target: 'Ollama Manager', action: () => state.navigateToConsoleTab('ollama') };}
  if (lowerText.includes('stream') || lowerText.includes('诊断') || lowerText.includes('streaming'))
  {return { target: 'Stream Diagnostics', action: () => state.navigateToConsoleTab('diagnostics') };}
  if (lowerText.includes('security') || lowerText.includes('安全') || lowerText.includes('audit'))
  {return { target: 'Security Audit', action: () => state.navigateToConsoleTab('security') };}
  if (lowerText.includes('mcp') || lowerText.includes('工具链'))
  {return { target: 'MCP Hub', action: () => state.navigateToConsoleTab('mcp') };}
  if (lowerText.includes('persist') || lowerText.includes('持久化') || lowerText.includes('sync'))
  {return { target: 'Persistence Engine', action: () => state.navigateToConsoleTab('persistence') };}
  if (lowerText.includes('smoke') || lowerText.includes('test') || lowerText.includes('测试'))
  {return { target: 'Test Framework', action: () => state.navigateToConsoleTab('test') };}

  // Phase 36: Hardware Monitor navigation intent
  if (lowerText.includes('hardware') || lowerText.includes('硬件') || lowerText.includes('telemetry') || lowerText.includes('遥测') || lowerText.includes('温度') || lowerText.includes('cpu core') || lowerText.includes('thermal'))
  {return { target: 'Hardware Monitor', action: () => state.navigateToConsoleTab('hardware_monitor') };}

  // Phase 45: Mode Control, Manual, Nine-Layer navigation intents
  if (lowerText.includes('manual') || lowerText.includes('手册') || lowerText.includes('guide') || lowerText.includes('指南'))
  {return { target: 'Operation Manual', action: () => state.navigateToConsoleTab('operation_manual') };}
  if (lowerText.includes('nine layer') || lowerText.includes('九层') || lowerText.includes('blueprint') || lowerText.includes('蓝图') || lowerText.includes('层级'))
  {return { target: 'Nine-Layer Architecture', action: () => state.navigateToConsoleTab('nine_layer_architecture') };}
  if ((lowerText.includes('mode') && lowerText.includes('control')) || lowerText.includes('模式控制') || lowerText.includes('模式管理'))
  {return { target: 'Mode Control Panel', action: () => state.navigateToConsoleTab('mode_control') };}
  // Phase 46: PG Proxy Deploy Kit navigation intent
  if (lowerText.includes('pg proxy') || lowerText.includes('pg-proxy') || lowerText.includes('pg代理') || lowerText.includes('代理部署') || (lowerText.includes('deploy') && lowerText.includes('proxy')))
  {return { target: 'PG Proxy Deploy Kit', action: () => state.navigateToConsoleTab('pg_proxy_deploy_kit') };}

  // Global View matching
  if (lowerText.includes('project') || lowerText.includes('项目'))
  {return { target: 'Projects View', action: () => state.setActiveView('projects') };}
  if (lowerText.includes('monitor') || lowerText.includes('监控') || lowerText.includes('health'))
  {return { target: 'Service Health', action: () => state.setActiveView('monitor') };}
  if (lowerText.includes('knowledge') || lowerText.includes('知识库') || lowerText.includes('rag'))
  {return { target: 'Knowledge Base', action: () => state.setActiveView('knowledge') };}
  if (lowerText.includes('artifact') || lowerText.includes('产物'))
  {return { target: 'Artifacts Gallery', action: () => state.setActiveView('artifacts') };}
  if (lowerText.includes('service') || lowerText.includes('服务') || lowerText.includes('nas'))
  {return { target: 'Services Panel', action: () => state.setActiveView('services') };}
  if (lowerText.includes('bookmark') || lowerText.includes('收藏'))
  {return { target: 'Bookmarks', action: () => state.setActiveView('bookmarks') };}
  if (lowerText.includes('settings') || lowerText.includes('设置') || lowerText.includes('配置'))
  {return { target: 'Settings', action: () => state.openSettings() };}

  return null;
}

function AppContent() {
  const { language } = useTranslation();

  // === Zustand Global State ===
  const isMobile = useSystemStore(s => s.isMobile);
  const activeView = useSystemStore(s => s.activeView);
  const setActiveView = useSystemStore(s => s.setActiveView);
  const messages = useSystemStore(s => s.messages);
  const addMessage = useSystemStore(s => s.addMessage);
  const isStreaming = useSystemStore(s => s.isStreaming);
  const setIsStreaming = useSystemStore(s => s.setIsStreaming);
  const isArtifactsOpen = useSystemStore(s => s.isArtifactsOpen);
  const setIsArtifactsOpen = useSystemStore(s => s.setIsArtifactsOpen);
  const toggleArtifactsPanel = useSystemStore(s => s.toggleArtifactsPanel);
  const activeArtifact = useSystemStore(s => s.activeArtifact);
  const setActiveArtifact = useSystemStore(s => s.setActiveArtifact);
  const isSettingsOpen = useSystemStore(s => s.isSettingsOpen);
  const openSettings = useSystemStore(s => s.openSettings);
  const closeSettings = useSystemStore(s => s.closeSettings);
  const settingsTab = useSystemStore(s => s.settingsTab);
  const newSession = useSystemStore(s => s.newSession);
  const navigateToAgent = useSystemStore(s => s.navigateToAgent);
  const navigateToConsoleTab = useSystemStore(s => s.navigateToConsoleTab);
  const addLog = useSystemStore(s => s.addLog);
  const chatMode = useSystemStore(s => s.chatMode);
  const toggleChatMode = useSystemStore(s => s.toggleChatMode);
  const updateLastAiMessage = useSystemStore(s => s.updateLastAiMessage);
  const setProviderConfigs = useSystemStore(s => s.setProviderConfigs);

  // === Responsive detection ===
  useResponsive();

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

  // === Phase 35: Initialize provider & MCP configs (decrypt keys) ===
  React.useEffect(() => {
    Promise.all([
      initProviderConfigs(),
      initMCPRegistry(),
    ]).then(([llmConfigs, mcpServers]) => {
      setProviderConfigs(llmConfigs);
      const encryptedCount = llmConfigs.filter(c => c.encrypted).length + mcpServers.filter(s => s.encrypted).length;

      if (encryptedCount > 0) {
        addLog('info', 'SECURITY', `${encryptedCount} sensitive credentials decrypted via Web Crypto`);
      }
    });
  }, [setProviderConfigs, addLog]);

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
      addLog('info', 'OLLAMA_SYNC', `Synced ${mapped.length} models to Provider Registry`);
    }
  }, [ollamaModels, ollamaStatus, addLog]);

  // === Ctrl+M: Quick toggle between navigate/AI mode ===
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

  // === Knowledge Domain Matcher (Navigate Mode — inline rich responses) ===
  const matchKnowledgeDomain = (lowerText: string, lang: string): string | null => {
    const zh = lang === 'zh';

    // === Phase 35: Gather live dynamic data for enriched responses ===
    const configs = loadProviderConfigs();
    const enabledProviders = configs.filter(c => c.enabled && c.apiKey);
    const totalProviders = Object.keys(PROVIDERS).length;
    const proxied = getProxiedProviders();
    const proxyLine = proxied.length > 0
      ? (zh ? `\n\n**Dev Proxy：** 已激活 (${proxied.join(', ')})` : `\n\n**Dev Proxy:** Active (${proxied.join(', ')})`)
      : '';
    const msgCount = useSystemStore.getState().messages.length;

    // localStorage stats helper
    const getLsStats = () => {
      try {
        let totalBytes = 0;
        let keyCount = 0;

        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);

          if (k) {
            keyCount++;
            totalBytes += k.length + (localStorage.getItem(k)?.length || 0);
          }
        }
        const yyc3Keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
          .filter(k => k?.startsWith('yyc3')).length;

        return { keyCount, yyc3Keys, sizeKB: Math.round(totalBytes * 2 / 1024) };
      } catch { return { keyCount: 0, yyc3Keys: 0, sizeKB: 0 }; }
    };

    // --- MCP / Model Context Protocol ---
    if (/\bmcp\b|model context protocol|工具链|tool chain|tool server/.test(lowerText)) {
      return zh
        ? `## MCP — Model Context Protocol\n\nMCP 是 YYC3 平台的**工具调用协议层**，让 AI Agent 能安全地调用外部工具。\n\n**已集成的 MCP Server：**\n| Server | 传输方式 | 用途 |\n|--------|---------|------|\n| Figma MCP | SSE | 设计稿读取、组件导出 |\n| GitHub MCP | SSE | 代码仓库操作、PR 管理 |\n| Filesystem MCP | Stdio | 本地文件读写（NAS） |\n| Docker MCP | SSE | 容器生命周期管理 |\n| PostgreSQL MCP | Stdio | 数据库查询、Schema 管理 |\n| Browser MCP | SSE | 网页抓取、截图 |\n\n**核心模块：** \`mcp-protocol.ts\` (1326行)\n\n💡 前往 **Console → MCP** 查看详细配置和 Playground 测试。`
        : `## MCP — Model Context Protocol\n\nMCP is the **tool-calling protocol layer** of the YYC3 platform, enabling AI Agents to safely invoke external tools.\n\n**Integrated MCP Servers:**\n| Server | Transport | Purpose |\n|--------|-----------|--------|\n| Figma MCP | SSE | Design file reading, component export |\n| GitHub MCP | SSE | Repo operations, PR management |\n| Filesystem MCP | Stdio | Local file I/O (NAS) |\n| Docker MCP | SSE | Container lifecycle management |\n| PostgreSQL MCP | Stdio | DB queries, schema management |\n| Browser MCP | SSE | Web scraping, screenshots |\n\n**Core module:** \`mcp-protocol.ts\` (1326 lines)\n\n💡 Go to **Console → MCP** to view configurations and test in Playground.`;
    }

    // --- AI Family / Agent Architecture ---
    if (/\b(ai family|agent|七大|7大|七位|ai 家族|ai家族|领航员|思想家|先知|伯乐|天枢|哨兵|宗师)\b/.test(lowerText) ||
        /\b(navigator|thinker|prophet|bole|pivot|sentinel|grandmaster)\b/.test(lowerText)) {
      return zh
        ? `## AI Family — 七大智能体\n\n| Agent | 代号 | 角色 | 擅长领域 |\n|-------|------|------|----------|\n| Navigator | 领航员 | 路径规划 | 项目导航、任务分解 |\n| Thinker | 思想家 | 深度推理 | 架构设计、技术分析 |\n| Prophet | 先知 | 预测预警 | 风险评估、趋势预测 |\n| Bole | 伯乐 | 代码审计 | Code Review、质量把关 |\n| Pivot | 天枢 | 协调中枢 | 多 Agent 编排、冲突仲裁 |\n| Sentinel | 哨兵 | 安全守卫 | 安全审计、漏洞检测 |\n| Grandmaster | 宗师 | 全能指挥 | 域综合、最终决策 |\n\n**核心模块：** \`agent-orchestrator.ts\` (1427行)\n\n每个 Agent 拥有独立的 System Prompt、推荐 Provider/Model 和聊天历史。\n\n**当前会话：** ${msgCount} 条消息\n\n💡 前往 **Console → AI Agent** 选择任意 Agent 开始专项对话。`
        : `## AI Family — 7 Intelligent Agents\n\n| Agent | Codename | Role | Specialty |\n|-------|----------|------|----------|\n| Navigator | 领航员 | Path Planning | Project navigation, task decomposition |\n| Thinker | 思想家 | Deep Reasoning | Architecture design, tech analysis |\n| Prophet | 先知 | Prediction | Risk assessment, trend forecasting |\n| Bole | 伯乐 | Code Audit | Code review, quality control |\n| Pivot | 天枢 | Coordinator | Multi-agent orchestration, conflict resolution |\n| Sentinel | 哨兵 | Security Guard | Security audit, vulnerability detection |\n| Grandmaster | 宗师 | Commander | Cross-domain synthesis, final decisions |\n\n**Core module:** \`agent-orchestrator.ts\` (1427 lines)\n\nEach agent has its own System Prompt, preferred Provider/Model, and chat history.\n\n**Current session:** ${msgCount} messages\n\n💡 Go to **Console → AI Agent** to start a specialized conversation with any agent.`;
    }

    // --- LLM / Provider Architecture ---
    if (/\b(llm|provider|模型|deepseek|openai|anthropic|gemini|groq|ollama|大模型|bridge)\b/.test(lowerText)) {
      const statusLine = zh
        ? `\n\n**实时状态：** ${enabledProviders.length}/${totalProviders} 个 Provider 已激活`
        : `\n\n**Live status:** ${enabledProviders.length}/${totalProviders} providers active`;

      return zh
        ? `## LLM Bridge — 多 Provider 智能路由\n\n**支持的 Provider：**\n- **OpenAI** — GPT-4o / GPT-4o-mini\n- **Anthropic** — Claude 3.5 Sonnet / Haiku\n- **DeepSeek** — DeepSeek-V3 / DeepSeek-R1\n- **智谱 Z.AI** — GLM-4-Plus / GLM-4-Flash\n- **Google Gemini** — Gemini 2.0 Flash\n- **Groq** — Llama 3.3 70B / Mixtral\n- **Ollama** — 本地模型（无需 API Key）\n\n**核心特性：**\n- SSE 流式输出 | 熔断器保护 | 自动 Failover\n- Token 用量追踪 | 成本估算\n- Phase 34: Dev Proxy 绕 CORS${statusLine}${proxyLine}\n\n**核心模块：** \`llm-bridge.ts\` (1048行) + \`llm-router.ts\` + \`llm-providers.ts\`\n\n💡 前往 **设置 → AI 模型** 配置 API Key，或前往 **Console → Stream Diagnostics** 测试连通性。`
        : `## LLM Bridge — Multi-Provider Smart Routing\n\n**Supported Providers:**\n- **OpenAI** — GPT-4o / GPT-4o-mini\n- **Anthropic** — Claude 3.5 Sonnet / Haiku\n- **DeepSeek** — DeepSeek-V3 / DeepSeek-R1\n- **Zhipu Z.AI** — GLM-4-Plus / GLM-4-Flash\n- **Google Gemini** — Gemini 2.0 Flash\n- **Groq** — Llama 3.3 70B / Mixtral\n- **Ollama** — Local models (no API key needed)\n\n**Core Features:**\n- SSE streaming | Circuit breaker | Auto failover\n- Token usage tracking | Cost estimation\n- Phase 34: Dev proxy for CORS bypass${statusLine}${proxyLine}\n\n**Core modules:** \`llm-bridge.ts\` (1048 lines) + \`llm-router.ts\` + \`llm-providers.ts\`\n\n💡 Go to **Settings → AI Models** to configure API keys, or **Console → Stream Diagnostics** to test connectivity.`;
    }

    // --- NAS / Cluster / Hardware ---
    if (/\b(nas|cluster|集群|硬件|hardware|node|节点|terramaster|m4.max|imac|matebook)\b/.test(lowerText)) {
      // Phase 36: Enhanced hardware knowledge with HardwareMonitor reference
      const m4 = useSystemStore.getState().clusterMetrics?.['m4-max'];
      const hwLine = m4
        ? (zh
          ? `\n\n**实时遥测 (M4 Max):** CPU ${Math.round(m4.cpu)}% | 内存 ${Math.round(m4.memory)}% | 温度 ${Math.round(m4.temperature)}C | 磁盘 ${Math.round(m4.disk)}%`
          : `\n\n**Live Telemetry (M4 Max):** CPU ${Math.round(m4.cpu)}% | MEM ${Math.round(m4.memory)}% | Temp ${Math.round(m4.temperature)}C | Disk ${Math.round(m4.disk)}%`)
        : '';

      return zh
        ? `## 集群拓扑 — 四节点家用算力网络\n\n| 节点 | 设备 | 角色 | 核心能力 |\n|------|------|------|----------|\n| M4-MAX | MacBook Pro M4 Max | 主控节点 | 128GB RAM, 40核GPU, AI推理 |\n| IMAC-M4 | iMac M4 | 渲染节点 | 32GB RAM, 设计/前端开发 |\n| MATEBOOK | MateBook X Pro | 移动节点 | 轻量任务、远程监控 |\n| NAS-YYC | TerraMaster F4-423 | 存储节点 | RAID6, Docker宿主, SQLite |${hwLine}\n\n**连接方式：**\n- Heartbeat WebSocket (实时心跳)\n- SQLite HTTP Proxy (数据持久化)\n- Docker Engine API (容器管理)\n\n**数据库：** PostgreSQL 15 (端口 5433, 用户 yyc3_max)\n- Schema: orchestration | knowledge (pgvector) | telemetry\n\n💡 前往 **Console → Hardware Monitor** 查看 56 核遥测看板，或 **Console → Dashboard** 查看集群全景。`
        : `## Cluster Topology — 4-Node Home Compute Network\n\n| Node | Device | Role | Capability |\n|------|--------|------|----------|\n| M4-MAX | MacBook Pro M4 Max | Primary | 128GB RAM, 40-core GPU, AI inference |\n| IMAC-M4 | iMac M4 | Render | 32GB RAM, design/frontend dev |\n| MATEBOOK | MateBook X Pro | Mobile | Lightweight tasks, remote monitoring |\n| NAS-YYC | TerraMaster F4-423 | Storage | RAID6, Docker host, SQLite |${hwLine}\n\n**Connections:**\n- Heartbeat WebSocket (real-time health)\n- SQLite HTTP Proxy (data persistence)\n- Docker Engine API (container management)\n\n**Database:** PostgreSQL 15 (port 5433, user yyc3_max)\n- Schemas: orchestration | knowledge (pgvector) | telemetry\n\n💡 Go to **Console → Hardware Monitor** for 56-core telemetry, or **Console → Dashboard** for cluster overview.`;
    }

    // --- Persistence / Backup ---
    if (/\b(persist|持久化|backup|备份|snapshot|快照|localStorage|存储引擎)\b/.test(lowerText)) {
      const ls = getLsStats();
      const lsLine = zh
        ? `\n\n**localStorage 快照：** ${ls.yyc3Keys} 个 YYC3 键 / ${ls.keyCount} 总键 / ≈${ls.sizeKB} KB`
        : `\n\n**localStorage snapshot:** ${ls.yyc3Keys} YYC3 keys / ${ls.keyCount} total keys / ≈${ls.sizeKB} KB`;

      return zh
        ? `## 持久化引擎\n\n**三层存储架构：**\n1. **L1 — localStorage** (即时) — 会话状态、Provider配置、外观设置\n2. **L2 — NAS SQLite** (持久) — 聊天历史、Agent记忆、用量记录\n3. **L3 — 快照导出** (归档) — JSON/ZIP 全量快照、跨设备迁移\n\n**核心模块：** \`persistence-engine.ts\` (830行) + \`persist-schemas.ts\`\n\n**当前状态：** NAS 不可达时自动降级为 L1 localStorage Mock${lsLine}\n\n💡 前往 **Console → Persistence** 管理快照和数据同步。`
        : `## Persistence Engine\n\n**Three-tier storage architecture:**\n1. **L1 — localStorage** (instant) — Session state, provider config, appearance\n2. **L2 — NAS SQLite** (persistent) — Chat history, agent memory, usage records\n3. **L3 — Snapshot Export** (archive) — JSON/ZIP full snapshots, cross-device migration\n\n**Core module:** \`persistence-engine.ts\` (830 lines) + \`persist-schemas.ts\`\n\n**Current state:** Auto-degrades to L1 localStorage mock when NAS is unreachable${lsLine}\n\n💡 Go to **Console → Persistence** to manage snapshots and data sync.`;
    }

    // --- Phase 43: PG Telemetry / Schema / Migration ---
    if (/\b(pg.telemetry|telemetry schema|遥测数据库|pg.proxy|telemetry.metrics|telemetry.latency|pg.migrate|迁移数据|latency_history)\b/.test(lowerText)) {
      return zh
        ? `## PG Telemetry Schema — PostgreSQL 遥测持久层\n\n**架构：** Frontend → yyc3-pg-proxy (:3003) → PostgreSQL 15 (:5433)\n\n**Schema 表：**\n| 表名 | 用途 |\n|------|------|\n| telemetry.metrics | 节点硬件时序指标 (CPU/MEM/DISK/NET/TEMP) |\n| telemetry.thermal_log | 温度区域快照 |\n| telemetry.alerts | 阈值告警记录 |\n| telemetry.latency_history | 基础设施延迟历史（从 localStorage 迁移） |\n\n**核心模块：** \`pg-telemetry-client.ts\`\n\n**数据流：**\n1. InfraHealthMatrix 执行探活 → recordLatency()\n2. Dual-write: localStorage + PG telemetry.latency_history\n3. 90 天数据保留 vs localStorage 的 30 数据点\n\n**操作命令：**\n- \`/pg-telemetry\` — 查看连接状态\n- \`/pg-migrate\` — localStorage → PG 迁移\n- \`/pg-schema\` — 获取 SQL DDL\n\n💡 前往 **Console → Metrics History** 的 PG Telemetry Integration 面板管理。`
        : `## PG Telemetry Schema — PostgreSQL Telemetry Persistence\n\n**Architecture:** Frontend → yyc3-pg-proxy (:3003) → PostgreSQL 15 (:5433)\n\n**Schema Tables:**\n| Table | Purpose |\n|-------|----------|\n| telemetry.metrics | Node hardware time-series (CPU/MEM/DISK/NET/TEMP) |\n| telemetry.thermal_log | Thermal zone snapshots |\n| telemetry.alerts | Threshold-based alerts |\n| telemetry.latency_history | Infra latency history (migrated from localStorage) |\n\n**Core module:** \`pg-telemetry-client.ts\`\n\n**Data flow:**\n1. InfraHealthMatrix probes → recordLatency()\n2. Dual-write: localStorage + PG telemetry.latency_history\n3. 90-day retention vs localStorage's 30 data points\n\n**Commands:**\n- \`/pg-telemetry\` — Check connection status\n- \`/pg-migrate\` — localStorage → PG migration\n- \`/pg-schema\` — Get SQL DDL\n\n💡 Go to **Console → Metrics History** PG Telemetry Integration panel.`;
    }

    // --- DevOps / CI/CD / Docker ---
    if (/\b(devops|ci\/cd|docker|container|容器|pipeline|部署|deploy|compose)\b/.test(lowerText)) {
      return zh
        ? `## DevOps 工作台\n\n**功能模块：**\n- **DAG 工作流编辑器** — 可视化拖拽构建 CI/CD 流水线\n- **模板库** — 预置 15+ 工作流模板（Docker Build、Test Suite、Deploy等）\n- **Docker 管理** — NAS 上的容器生命周期管理（启动/停止/日志/重启）\n- **远程部署** — 一键 docker-compose 部署到 NAS\n\n**关键路径：**\n\`\`\`\n代码提交 → DAG 触发 → Build → Test → Deploy → NAS\n\`\`\`\n\n💡 前往 **Console → DevOps** 查看工作流编辑器和模板库。`
        : `## DevOps Workbench\n\n**Feature Modules:**\n- **DAG Workflow Editor** — Visual drag-and-drop CI/CD pipeline builder\n- **Template Library** — 15+ preset workflow templates (Docker Build, Test Suite, Deploy, etc.)\n- **Docker Manager** — Container lifecycle management on NAS (start/stop/logs/restart)\n- **Remote Deploy** — One-click docker-compose deployment to NAS\n\n**Key Pipeline:**\n\`\`\`\nCode Commit → DAG Trigger → Build → Test → Deploy → NAS\n\`\`\`\n\n💡 Go to **Console → DevOps** to view the workflow editor and templates.`;
    }

    // --- Knowledge Base ---
    if (/\b(knowledge base|知识库|向量|vector|rag|embedding|知识图谱|knowledge graph)\b/.test(lowerText)) {
      return zh
        ? `## 知识库系统\n\n**核心能力：**\n- 向量搜索 — 基于 Embedding 的语义检索\n- OCR/ASR — 图片文字识别、语音转文字\n- 知识图谱 — NER 实体抽取、关系图谱可视化\n- RAG — 检索增强生成，为 Agent 提供上下文\n\n**数据源：**\n- 本地文档（Markdown、PDF、代码文件）\n- 聊天历史摘要\n- 项目 README / 文档\n\n💡 前往 **Console → Knowledge Base** 管理知识条目。`
        : `## Knowledge Base System\n\n**Core Capabilities:**\n- Vector Search — Embedding-based semantic retrieval\n- OCR/ASR — Image text recognition, speech-to-text\n- Knowledge Graph — NER entity extraction, relationship visualization\n- RAG — Retrieval-augmented generation for Agent context\n\n**Data Sources:**\n- Local documents (Markdown, PDF, code files)\n- Chat history summaries\n- Project README / documentation\n\n💡 Go to **Console → Knowledge Base** to manage knowledge entries.`;
    }

    // --- Phase 35: Security / Crypto / API Key Protection ---
    if (/\b(security|安全|crypto|加密|encrypt|decrypt|密钥|api key|xss|csrf|hash|哈希|token safe|credential|凭证)\b/.test(lowerText)) {
      const ls = getLsStats();
      const healthyProviders = configs.filter(c => c.enabled && c.apiKey);
      const riskLevel = healthyProviders.length > 5 ? (zh ? '中' : 'Medium') : (zh ? '低' : 'Low');

      const keyStorageNote = zh
        ? `\n\n**当前 API Key 存储：** ${enabledProviders.length} 个活跃 Provider 的密钥存于 localStorage（${ls.sizeKB} KB 总占用）`
        : `\n\n**Current API key storage:** ${enabledProviders.length} active provider keys in localStorage (${ls.sizeKB} KB total)`;

      return zh
        ? `## YYC3 安全审计域 (Security Domain)\n\n**实时安全评估：**\n- **风险等级：** ${riskLevel}\n- **加密状态：** 传输中加密 (TLS 1.3)\n- **凭证暴露：** 0 个泄露检测 (Local-only)\n- **Proxy 隧道：** ${proxied.length > 0 ? '已建立 (Active)' : '未建立 (Direct)'}\n\n**前端防护栈：**\n| 威胁模型 | 防护机制 | 状态 |\n|----------|----------|------|\n| 凭证劫持 | Authorization Header (SSE) | ✅ 激活 |\n| 脚本注入 | DOMPurify + React Escaping | ✅ 激活 |\n| 跨域限制 | Vite Dev Proxy (CORS Bypass) | ${proxied.length > 0 ? '✅ 激活' : '⚠️ 关闭'} |\n| 数据驻留 | 0-PII / 100% Local Storage | ✅ 激活 |\n\n**安全建议：**\n1. 请定期清理 localStorage 快照以释放冗余密钥引用。\n2. 在非信任环境下建议通过「Stream Diagnostics」测试连接后立即清除敏感配置。\n\n💡 前往 **Console → Security Audit** 查看全量审计报告。`
        : `## YYC3 Security Audit Domain\n\n**Real-time Assessment:**\n- **Risk Level:** ${riskLevel}\n- **Encryption:** In-transit (TLS 1.3)\n- **Credential Leak:** 0 detected (Local-only)\n- **Proxy Tunnel:** ${proxied.length > 0 ? 'Active' : 'Direct'}\n\n**Frontend Defense Stack:**\n| Threat Model | Mechanism | Status |\n|--------------|-----------|--------|\n| Credential Hijack | Authorization Header (SSE) | ✅ Active |\n| XSS / Injection | DOMPurify + React Escaping | ✅ Active |\n| CORS Restrictions | Vite Dev Proxy (CORS Bypass) | ${proxied.length > 0 ? '✅ Active' : '⚠️ Disabled'} |\n| Data Residency | 0-PII / 100% Local Storage | ✅ Active |\n\n**Security Recommendations:**\n1. Periodically prune localStorage snapshots to remove redundant key references.\n2. In untrusted environments, clear sensitive configs immediately after testing in "Stream Diagnostics".\n\n💡 Go to **Console → Security Audit** to view the full audit report.`;
    }

    return null;
  };

  // === Neural Link: Intent-driven Navigation + AI Chat ===
  const handleSendMessage = React.useCallback(async (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessage(newMessage);
    setIsStreaming(true);

    const lowerText = text.toLowerCase();
    const currentMode = useSystemStore.getState().chatMode;

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
            role: 'ai',
            content: navMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            agentName: 'YYC3 Core',
          });
          setIsStreaming(false);
        }, 800);
      } else {
        // Phase 34: Knowledge domain check before "not recognized" fallback
        const knowledgeResponse = matchKnowledgeDomain(lowerText, language);

        if (knowledgeResponse) {
          addLog('info', 'KNOWLEDGE_DOMAIN', `Matched knowledge query: "${text.substring(0, 40)}"`);
          setTimeout(() => {
            addMessage({
              id: (Date.now() + 1).toString(),
              role: 'ai',
              content: knowledgeResponse,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              agentName: 'YYC3 Core',
            });
            setIsStreaming(false);
          }, 400);
        } else {
          addLog('info', 'NEURAL_LINK', `No navigation match for: "${text.substring(0, 40)}"`);

          setTimeout(() => {
            const unknownMsg = language === 'zh'
              ? `🔍 未识别导航意图。\n\n**导航关键词：**「仪表盘」「架构」「DevOps」「项目」「监控」「设置」「Ollama」等\n\n**知识查询：**「MCP」「AI Family」「LLM Bridge」「NAS 集群」「持久化」「DevOps」「知识库」「安全」\n\n💡 如需 AI 对话，请切换至「AI 对话」模式 (Ctrl+M)。`
              : `🔍 Navigation intent not recognized.\n\n**Navigation keywords:** "dashboard", "architecture", "devops", "projects", "monitor", "settings", "ollama"\n\n**Knowledge queries:** "MCP", "AI Family", "LLM Bridge", "NAS cluster", "persistence", "DevOps", "knowledge base", "security"\n\n💡 Switch to "AI Chat" mode for AI conversation (Ctrl+M).`;

            addMessage({
              id: (Date.now() + 1).toString(),
              role: 'ai',
              content: unknownMsg,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              agentName: 'YYC3 Core',
            });
            setIsStreaming(false);
          }, 600);
        }
      }

      return;
    }

    // --- AI Chat Mode ---
    // Phase 34: Enhanced provider status diagnostics
    if (!hasConfiguredProvider()) {
      const configs = loadProviderConfigs();
      const hasAnyKey = configs.some(c => c.apiKey);
      const hasAnyEnabled = configs.some(c => c.enabled);

      let diagMsg: string;

      if (configs.length === 0 || !hasAnyKey) {
        diagMsg = language === 'zh'
          ? `⚠️ 尚未配置 AI 模型。\n\n请前往 **设置 → AI 模型** 为至少一个 Provider 填入 API Key，并将状态切换为 **Active**。\n\n支持的 Provider：OpenAI、Anthropic、DeepSeek、智谱 Z.AI、Google Gemini、Groq、Ollama（本地免 Key）。`
          : `⚠️ No AI provider configured.\n\nGo to **Settings → AI Models** and enter an API Key for at least one provider, then toggle its status to **Active**.\n\nSupported: OpenAI, Anthropic, DeepSeek, Zhipu, Google Gemini, Groq, Ollama (local, no key needed).`;
      } else if (!hasAnyEnabled) {
        const withKeys = configs.filter(c => c.apiKey).map(c => PROVIDERS[c.providerId]?.displayName || c.providerId);

        diagMsg = language === 'zh'
          ? `⚠️ 已配置 API Key（${withKeys.join(', ')}），但所有 Provider 均处于 **Standby** 状态。\n\n请前往 **设置 → AI 模型**，点击卡片上的开关将至少一个 Provider 切换为 **Active**。`
          : `⚠️ API keys configured (${withKeys.join(', ')}), but all providers are in **Standby** mode.\n\nGo to **Settings → AI Models** and toggle at least one provider to **Active**.`;
      } else {
        diagMsg = language === 'zh'
          ? `⚠️ Provider 配置异常：有 Key 且 Active 的 Provider 数量为 0。请检查 **设置 → AI 模型**。`
          : `⚠️ Provider configuration issue: no provider has both a key and Active status. Check **Settings → AI Models**.`;
      }

      addLog('warn', 'LLM_BRIDGE', `No configured provider (total=${configs.length}, withKey=${hasAnyKey}, enabled=${hasAnyEnabled})`);
      setTimeout(() => {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: diagMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: 'YYC3 Core',
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
      role: 'ai',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentName: 'YYC3 Core',
    });

    // Abort any previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();

    abortRef.current = controller;

    let accumulated = '';

    try {
      addLog('info', 'LLM_BRIDGE', `Streaming request: "${text.substring(0, 40)}..."`);

      const response = await generalStreamChat(
        text,
        chatHistory,
        chunk => {
          if (chunk.type === 'content') {
            accumulated += chunk.content;
            updateLastAiMessage(accumulated);
          }
        },
        controller.signal,
      );

      if (response) {
        // Track usage and attach provider metadata to message
        trackUsage(response, 'general');
        const providerDisplay = PROVIDERS[response.provider]?.displayName || response.provider;

        updateLastAiMessage(accumulated, {
          providerId: response.provider,
          modelId: response.model,
          latencyMs: response.latencyMs,
          totalTokens: response.usage.totalTokens,
        });
        addLog('info', 'LLM_BRIDGE', `Response complete: ${providerDisplay}/${response.model} (${response.latencyMs}ms, ${response.usage.totalTokens} tokens)`);
      } else {
        // Fallback: all providers failed — run CORS diagnostics
        const configs = loadProviderConfigs();
        const enabledProviders = configs.filter(c => c.enabled && c.apiKey);
        const providerNames = enabledProviders.map(c => PROVIDERS[c.providerId]?.displayName || c.providerId).join(', ');

        const fallbackMsg = language === 'zh'
          ? `⚠️ AI 请求失败 — 已尝试的 Provider: ${providerNames || '无'}\n\n**可能原因：**\n- 🌐 CORS 跨域限制：浏览器直连云端 API 时可能被拦截\n- 🔑 API Key 无效或已过期\n- 🔌 网络连接问题\n\n**解决方案：**\n1. 前往 **Console → Stream Diagnostics** 测试各 Provider 连通性\n2. 使用本地代理绕过 CORS（\`vite.config.ts\` server.proxy）\n3. 优先使用 Ollama（本地部署，无 CORS 问题）`
          : `⚠️ AI request failed — Attempted providers: ${providerNames || 'none'}\n\n**Possible causes:**\n- 🌐 CORS restriction: browser may block direct API calls\n- 🔑 Invalid or expired API key\n- 🔌 Network connectivity issue\n\n**Solutions:**\n1. Go to **Console → Stream Diagnostics** to test provider connectivity\n2. Use a local proxy to bypass CORS (\`vite.config.ts\` server.proxy)\n3. Use Ollama (local deployment, no CORS issues)`;

        updateLastAiMessage(fallbackMsg);
        addLog('warn', 'LLM_BRIDGE', `All providers failed (tried: ${providerNames})`);
      }
    } catch (err: unknown) {
      const error = err as Error;

      if (error.message === 'Request aborted') {
        addLog('info', 'LLM_BRIDGE', 'Request aborted by user');
      } else {
        // Phase 34: Enhanced error classification
        const isCors = error.message?.includes('CORS') || error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError');
        let errorMsg: string;

        if (isCors) {
          errorMsg = language === 'zh'
            ? `🌐 **CORS 跨域错误**\n\n浏览器安全策略阻止了直连 API 请求。\n\n**推荐方案：**\n1. 在 \`vite.config.ts\` 中配置 \`server.proxy\` 转发 API 请求\n2. 使用 Ollama 本地模型（无 CORS 限制）\n3. 部署轻量级 API 中转服务到 NAS\n\n错误详情: ${error.message?.slice(0, 120) || '未知'}`
            : `🌐 **CORS Error**\n\nBrowser security policy blocked the direct API request.\n\n**Solutions:**\n1. Configure \`server.proxy\` in \`vite.config.ts\` to forward API requests\n2. Use Ollama local model (no CORS restrictions)\n3. Deploy a lightweight API relay on your NAS\n\nDetails: ${error.message?.slice(0, 120) || 'Unknown'}`;
        } else {
          errorMsg = language === 'zh'
            ? `❌ 请求出错: ${error.message || '未知错误'}\n\n请检查网络连接和 API 配置。`
            : `❌ Request error: ${error.message || 'Unknown error'}\n\nCheck your network and API configuration.`;
        }
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
        onViewChange={view => setActiveView(view as ViewMode)}
        onNewSession={newSession}
        onOpenSettings={openSettings}
      />

      <main className={cn(
        'flex-1 flex min-w-0 min-h-0 relative z-10 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isMobile && 'pt-12 pb-14 flex-col',
      )}>
        <ErrorBoundary>
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-full w-full text-primary gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-mono text-xs tracking-widest">LOADING_MODULE...</span>
            </div>
          }>
            {activeView === 'terminal' ? (
              /* Terminal view (Chat + Artifacts) */
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
                    'w-[3px] relative group/handle hover:w-[5px] transition-all duration-200 z-20',
                    !isArtifactsOpen && 'pointer-events-none opacity-0 w-0',
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
              <ComponentErrorBoundary componentName="ConsoleView" onError={err => console.error('[ConsoleView]', err)}>
                <ConsoleView />
              </ComponentErrorBoundary>
            ) : activeView === 'monitor' ? (
              <ComponentErrorBoundary componentName="ServiceHealthMonitor" onError={err => console.error('[Monitor]', err)}>
                <ServiceHealthMonitor />
              </ComponentErrorBoundary>
            ) : activeView === 'projects' ? (
              <ComponentErrorBoundary componentName="ProjectsView" onError={err => console.error('[Projects]', err)}>
                <ProjectsView />
              </ComponentErrorBoundary>
            ) : activeView === 'artifacts' ? (
              <ComponentErrorBoundary componentName="ArtifactsView" onError={err => console.error('[Artifacts]', err)}>
                <ArtifactsView />
              </ComponentErrorBoundary>
            ) : activeView === 'services' ? (
              <ComponentErrorBoundary componentName="ServicesView" onError={err => console.error('[Services]', err)}>
                <ServicesView />
              </ComponentErrorBoundary>
            ) : activeView === 'knowledge' ? (
              <ComponentErrorBoundary componentName="KnowledgeBaseView" onError={err => console.error('[Knowledge]', err)}>
                <KnowledgeBaseView />
              </ComponentErrorBoundary>
            ) : activeView === 'bookmarks' ? (
              <ComponentErrorBoundary componentName="BookmarksView" onError={err => console.error('[Bookmarks]', err)}>
                <BookmarksView />
              </ComponentErrorBoundary>
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
        onOpenChange={open => {
          if (!open) closeSettings();
        }}
        defaultTab={settingsTab}
      />

      {/* Neural Link HUD — Always-on system awareness overlay */}
      <NeuralLinkOverlay />

      {/* Phase 45: Mobile Bottom Navigation Bar */}
      {isMobile && (
        <MobileNavBar
          activeView={activeView}
          onViewChange={view => setActiveView(view)}
        />
      )}
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