import { create } from 'zustand';

import { eventBus } from './event-bus';
import { type ProviderConfig } from './llm-bridge';
import type {
  SystemStatus,
  ViewMode,
  LogEntry,
  ChatMessage,
  ChatArtifact,
  AgentChatMessage,
  NodeMetricsSnapshot,
  ClusterMetricsSnapshot,
  CustomTemplate,
  DAGNode,
  DAGEdge,
  DAGWorkflow,
} from './types';

// Re-export types for backward compatibility
// (consumers importing from '@/lib/store' will still work)
export type {
  SystemStatus,
  ViewMode,
  LogEntry,
  ChatMessage,
  ChatArtifact,
  AgentChatMessage,
  NodeMetricsSnapshot,
  ClusterMetricsSnapshot,
  CustomTemplate,
  DAGNode,
  DAGEdge,
  DAGWorkflow,
};

// ============================================================
// YYC3 Hacker Chatbot — Global State Store
// Phase 24.5: Type definitions unified → @/lib/types.ts
// All type interfaces now imported from centralized type source.
// ============================================================

export interface SystemState {
  // === Navigation ===
  activeView: ViewMode;
  consoleTab: string;
  consoleAgent: string | null;

  // === Layout & Responsive ===
  sidebarCollapsed: boolean;
  sidebarPinned: boolean;
  isMobile: boolean;
  isTablet: boolean;

  // === Chat (Terminal) ===
  chatMode: 'navigate' | 'ai';
  messages: ChatMessage[];
  isStreaming: boolean;
  isArtifactsOpen: boolean;
  activeArtifact: ChatArtifact | null;

  // === Agent Chat Histories (persistent across agent switches) ===
  agentChatHistories: Record<string, AgentChatMessage[]>;

  // === Navigation Favorites (ArtifactsPanel project nav) ===
  navFavorites: string[];

  // === Settings ===
  isSettingsOpen: boolean;
  settingsTab: string;
  providerConfigs: ProviderConfig[];

  // === System Health ===
  status: SystemStatus;
  latency: number;
  cpuLoad: number;

  // === Real-time Cluster Metrics ===
  clusterMetrics: ClusterMetricsSnapshot | null;

  // === Data Streams ===
  logs: LogEntry[];

  // === Database Connection ===
  dbConnected: boolean;

  // === Navigation Actions ===
  setActiveView: (view: ViewMode) => void;
  setConsoleTab: (tab: string) => void;
  setConsoleAgent: (agentId: string | null) => void;
  navigateToAgent: (agentId: string) => void;
  navigateToConsoleTab: (tab: string) => void;

  // === Layout Actions ===
  setSidebarCollapsed: (val: boolean) => void;
  setSidebarPinned: (val: boolean) => void;
  toggleSidebarPin: () => void;
  setIsMobile: (val: boolean) => void;
  setIsTablet: (val: boolean) => void;

  // === Chat Actions ===
  setChatMode: (mode: 'navigate' | 'ai') => void;
  toggleChatMode: () => void;
  addMessage: (msg: ChatMessage) => void;
  updateLastAiMessage: (content: string, meta?: ChatMessage['providerMeta']) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  clearMessages: () => void;
  setIsStreaming: (val: boolean) => void;
  setIsArtifactsOpen: (val: boolean) => void;
  toggleArtifactsPanel: () => void;
  setActiveArtifact: (artifact: ChatArtifact | null) => void;

  // === Agent Chat Actions ===
  getAgentHistory: (agentId: string) => AgentChatMessage[];
  setAgentHistory: (agentId: string, messages: AgentChatMessage[]) => void;
  addAgentMessage: (agentId: string, msg: AgentChatMessage) => void;
  clearAgentHistory: (agentId: string) => void;

  // === Settings Actions ===
  openSettings: (tab?: string) => void;
  closeSettings: () => void;
  setSettingsTab: (tab: string) => void;
  setProviderConfigs: (configs: ProviderConfig[]) => void;

  // === Navigation Favorites Actions ===
  setNavFavorites: (ids: string[]) => void;
  toggleNavFavorite: (id: string) => void;

  // === System Actions ===
  setStatus: (status: SystemStatus) => void;
  addLog: (level: LogEntry['level'], source: string, message: string) => void;
  updateMetrics: (metrics: ClusterMetricsSnapshot) => void;
  setDbConnected: (connected: boolean) => void;

  // === Composite Actions ===
  newSession: () => void;
  runDiagnosis: () => void;
}

// --- Store ---

export const useSystemStore = create<SystemState>((set, get) => ({
  // Navigation
  activeView: 'terminal',
  consoleTab: 'dashboard',
  consoleAgent: null,

  // Layout
  sidebarCollapsed: true,
  sidebarPinned: false,
  isMobile: false,
  isTablet: false,

  // Chat
  chatMode: 'navigate',
  messages: [],
  isStreaming: false,
  isArtifactsOpen: false,
  activeArtifact: null,

  // Agent Chat Histories
  agentChatHistories: {},

  // Navigation Favorites
  navFavorites: [],

  // Settings
  isSettingsOpen: false,
  settingsTab: 'general',
  providerConfigs: [],

  // System Health
  status: 'optimal',
  latency: 42,
  cpuLoad: 12,

  // Real-time Cluster Metrics
  clusterMetrics: null,

  // Data Streams
  logs: [],

  // Database Connection
  dbConnected: false,

  // === Navigation Actions ===
  setActiveView: view => set({ activeView: view }),
  setConsoleTab: tab => set({ consoleTab: tab }),
  setConsoleAgent: agentId => set({ consoleAgent: agentId }),

  navigateToAgent: agentId => {
    set({
      activeView: 'console',
      consoleTab: 'ai',
      consoleAgent: agentId,
    });
    eventBus.emit({ category: 'orchestrate', type: 'orchestrate.agent_switch', level: 'info', source: 'Store', message: `Switched to agent: ${agentId}`, metadata: { agentId } });
  },

  navigateToConsoleTab: tab => {
    set({
      activeView: 'console',
      consoleTab: tab,
      consoleAgent: null,
    });
    eventBus.emit({ category: 'ui', type: 'ui.navigate', level: 'info', source: 'Store', message: `Navigated to console/${tab}`, metadata: { tab } });
  },

  // === Layout Actions ===
  setSidebarCollapsed: val => set({ sidebarCollapsed: val }),
  setSidebarPinned: val => set({ sidebarPinned: val }),
  toggleSidebarPin: () => set(state => ({
    sidebarPinned: !state.sidebarPinned,
    sidebarCollapsed: state.sidebarPinned, // if unpinning, collapse
  })),
  setIsMobile: val => set({ isMobile: val }),
  setIsTablet: val => set({ isTablet: val }),

  // === Chat Actions ===
  setChatMode: mode => set({ chatMode: mode }),
  toggleChatMode: () => set(state => ({
    chatMode: state.chatMode === 'navigate' ? 'ai' : 'navigate',
  })),
  addMessage: msg => set(state => ({
    messages: [...state.messages, msg],
  })),
  updateLastAiMessage: (content, meta) => set(state => {
    const lastMessage = state.messages[state.messages.length - 1];

    if (lastMessage && lastMessage.role === 'ai') {
      return {
        messages: [
          ...state.messages.slice(0, -1),
          { ...lastMessage, content, ...(meta ? { providerMeta: meta } : {}) },
        ],
      };
    }

    return state;
  }),
  setMessages: msgs => set({ messages: msgs }),

  clearMessages: () => set({ messages: [] }),

  setIsStreaming: val => set({ isStreaming: val }),

  setIsArtifactsOpen: val => set({ isArtifactsOpen: val }),

  toggleArtifactsPanel: () => set(state => ({
    isArtifactsOpen: !state.isArtifactsOpen,
  })),

  setActiveArtifact: artifact => set({
    activeArtifact: artifact,
    isArtifactsOpen: artifact !== null,
  }),

  // === Agent Chat Actions ===
  getAgentHistory: agentId => {
    return get().agentChatHistories[agentId] ?? [];
  },

  setAgentHistory: (agentId, messages) => set(state => ({
    agentChatHistories: {
      ...state.agentChatHistories,
      [agentId]: messages,
    },
  })),

  addAgentMessage: (agentId, msg) => set(state => ({
    agentChatHistories: {
      ...state.agentChatHistories,
      [agentId]: [...(state.agentChatHistories[agentId] ?? []), msg],
    },
  })),

  clearAgentHistory: agentId => set(state => ({
    agentChatHistories: {
      ...state.agentChatHistories,
      [agentId]: [],
    },
  })),

  // === Settings Actions ===
  openSettings: (tab = 'general') => set({
    isSettingsOpen: true,
    settingsTab: tab,
  }),

  closeSettings: () => set({ isSettingsOpen: false }),

  setSettingsTab: tab => set({ settingsTab: tab }),

  setProviderConfigs: configs => set({ providerConfigs: configs }),

  // === Navigation Favorites Actions ===
  setNavFavorites: ids => set({ navFavorites: ids }),

  toggleNavFavorite: id => set(state => ({
    navFavorites: state.navFavorites.includes(id)
      ? state.navFavorites.filter(favId => favId !== id)
      : [...state.navFavorites, id],
  })),

  // === System Actions ===
  setStatus: status => set({ status }),

  addLog: (level, source, message) => set(state => ({
    logs: [
      {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString(),
        level,
        source,
        message,
      },
      ...state.logs.slice(0, 99), // 扩展到 100 条
    ],
  })),

  updateMetrics: metrics => set({
    clusterMetrics: metrics,
    cpuLoad: Math.round(metrics['m4-max'].cpu),
    latency: Math.max(1, Math.round(5 + Math.random() * 3)),
  }),

  setDbConnected: connected => set({ dbConnected: connected }),

  // === Composite Actions ===
  newSession: () => {
    set({
      activeView: 'terminal',
      messages: [],
      isArtifactsOpen: false,
      activeArtifact: null,
      isStreaming: false,
    });
    eventBus.emit({ category: 'ui', type: 'ui.new_session', level: 'info', source: 'Store', message: 'New chat session created' });
  },

  runDiagnosis: () => {
    set({ status: 'warning', cpuLoad: 85 });
    get().addLog('warn', 'SYSTEM', 'Starting deep diagnosis scan...');
    eventBus.system('diagnosis.start', 'Deep system diagnosis initiated', 'warn');

    setTimeout(() => {
      get().addLog('info', 'KERNEL', 'Checking memory integrity...');
      eventBus.system('diagnosis.memory', 'Memory integrity check in progress', 'info');
    }, 1000);

    setTimeout(() => {
      get().addLog('info', 'KERNEL', 'Scanning RAID6 integrity...');
      eventBus.system('diagnosis.storage', 'RAID6 integrity scan in progress', 'info');
    }, 1800);

    setTimeout(() => {
      get().addLog('success', 'KERNEL', 'All checks passed. System optimized.');
      set({ status: 'optimal', cpuLoad: 24, latency: 5 });
      eventBus.system('diagnosis.complete', 'All checks passed — system optimized', 'success');
    }, 2500);
  },
}));