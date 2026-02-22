// ============================================================
// YYC3 Hacker Chatbot — Zustand Store Unit Tests (Vitest)
// Phase 48: Test Coverage Enhancement (P1)
//
// Tests all core store actions: navigation, layout, chat,
// agent history, settings, system actions, composite actions.
//
// Run: npx vitest run src/lib/__tests__/store.test.ts
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { useSystemStore } from '../store';
import type { ChatMessage, ViewMode } from '../types';

// Helper: reset store to pristine defaults
function resetStore() {
  useSystemStore.setState({
    activeView: 'terminal',
    consoleTab: 'dashboard',
    consoleAgent: null,
    chatMode: 'navigate',
    messages: [],
    isStreaming: false,
    isArtifactsOpen: false,
    activeArtifact: null,
    agentChatHistories: {},
    navFavorites: [],
    isSettingsOpen: false,
    settingsTab: 'general',
    providerConfigs: [],
    sidebarCollapsed: true,
    sidebarPinned: false,
    isMobile: false,
    isTablet: false,
    status: 'optimal',
    latency: 42,
    cpuLoad: 12,
    clusterMetrics: null,
    logs: [],
    dbConnected: false,
  });
}

// ============================================================
// Suite 1: Default State
// ============================================================

describe('Store — Default State', () => {
  beforeEach(resetStore);

  it('ST-01: has correct default values', () => {
    const s = useSystemStore.getState();
    expect(s.activeView).toBe('terminal');
    expect(s.consoleTab).toBe('dashboard');
    expect(s.consoleAgent).toBeNull();
    expect(s.chatMode).toBe('navigate');
    expect(s.messages).toEqual([]);
    expect(s.isStreaming).toBe(false);
    expect(s.isArtifactsOpen).toBe(false);
    expect(s.activeArtifact).toBeNull();
    expect(s.agentChatHistories).toEqual({});
    expect(s.navFavorites).toEqual([]);
    expect(s.isSettingsOpen).toBe(false);
    expect(s.settingsTab).toBe('general');
    expect(s.sidebarCollapsed).toBe(true);
    expect(s.sidebarPinned).toBe(false);
    expect(s.isMobile).toBe(false);
    expect(s.isTablet).toBe(false);
    expect(s.status).toBe('optimal');
    expect(s.logs).toEqual([]);
    expect(s.dbConnected).toBe(false);
  });
});

// ============================================================
// Suite 2: Navigation Actions
// ============================================================

describe('Store — Navigation Actions', () => {
  beforeEach(resetStore);

  it('ST-02: setActiveView iterates all views', () => {
    const views: ViewMode[] = [
      'terminal', 'console', 'projects', 'artifacts',
      'monitor', 'services', 'knowledge', 'bookmarks',
    ];
    for (const view of views) {
      useSystemStore.getState().setActiveView(view);
      expect(useSystemStore.getState().activeView).toBe(view);
    }
  });

  it('ST-03: setConsoleTab updates tab', () => {
    useSystemStore.getState().setConsoleTab('devops');
    expect(useSystemStore.getState().consoleTab).toBe('devops');
  });

  it('ST-04: setConsoleAgent sets agent id', () => {
    useSystemStore.getState().setConsoleAgent('navigator');
    expect(useSystemStore.getState().consoleAgent).toBe('navigator');
    useSystemStore.getState().setConsoleAgent(null);
    expect(useSystemStore.getState().consoleAgent).toBeNull();
  });

  it('ST-05: navigateToAgent sets view=console, tab=ai, agent=id', () => {
    useSystemStore.getState().navigateToAgent('sentinel');
    const s = useSystemStore.getState();
    expect(s.activeView).toBe('console');
    expect(s.consoleTab).toBe('ai');
    expect(s.consoleAgent).toBe('sentinel');
  });

  it('ST-06: navigateToConsoleTab sets view=console, tab, agent=null', () => {
    useSystemStore.getState().navigateToAgent('navigator'); // pre-set agent
    useSystemStore.getState().navigateToConsoleTab('devops');
    const s = useSystemStore.getState();
    expect(s.activeView).toBe('console');
    expect(s.consoleTab).toBe('devops');
    expect(s.consoleAgent).toBeNull();
  });
});

// ============================================================
// Suite 3: Layout & Responsive Actions
// ============================================================

describe('Store — Layout Actions', () => {
  beforeEach(resetStore);

  it('ST-07: sidebar collapse/expand', () => {
    useSystemStore.getState().setSidebarCollapsed(false);
    expect(useSystemStore.getState().sidebarCollapsed).toBe(false);
    useSystemStore.getState().setSidebarCollapsed(true);
    expect(useSystemStore.getState().sidebarCollapsed).toBe(true);
  });

  it('ST-08: toggleSidebarPin pins and expands', () => {
    expect(useSystemStore.getState().sidebarPinned).toBe(false);
    useSystemStore.getState().toggleSidebarPin();
    expect(useSystemStore.getState().sidebarPinned).toBe(true);
    expect(useSystemStore.getState().sidebarCollapsed).toBe(false);
  });

  it('ST-09: toggleSidebarPin unpins and collapses', () => {
    useSystemStore.getState().toggleSidebarPin(); // pin
    useSystemStore.getState().toggleSidebarPin(); // unpin
    expect(useSystemStore.getState().sidebarPinned).toBe(false);
    expect(useSystemStore.getState().sidebarCollapsed).toBe(true);
  });

  it('ST-10: mobile and tablet setters', () => {
    useSystemStore.getState().setIsMobile(true);
    expect(useSystemStore.getState().isMobile).toBe(true);
    useSystemStore.getState().setIsTablet(true);
    expect(useSystemStore.getState().isTablet).toBe(true);
    useSystemStore.getState().setIsMobile(false);
    expect(useSystemStore.getState().isMobile).toBe(false);
  });
});

// ============================================================
// Suite 4: Chat Actions
// ============================================================

describe('Store — Chat Actions', () => {
  beforeEach(resetStore);

  it('ST-11: setChatMode directly', () => {
    useSystemStore.getState().setChatMode('ai');
    expect(useSystemStore.getState().chatMode).toBe('ai');
    useSystemStore.getState().setChatMode('navigate');
    expect(useSystemStore.getState().chatMode).toBe('navigate');
  });

  it('ST-12: toggleChatMode alternates navigate/ai', () => {
    expect(useSystemStore.getState().chatMode).toBe('navigate');
    useSystemStore.getState().toggleChatMode();
    expect(useSystemStore.getState().chatMode).toBe('ai');
    useSystemStore.getState().toggleChatMode();
    expect(useSystemStore.getState().chatMode).toBe('navigate');
  });

  it('ST-13: addMessage — immutability check', () => {
    const before = useSystemStore.getState().messages;
    const msg: ChatMessage = {
      id: 'msg-1', role: 'user', content: 'Hello', timestamp: '12:00',
    };
    useSystemStore.getState().addMessage(msg);
    const after = useSystemStore.getState().messages;
    expect(after).toHaveLength(1);
    expect(after[0].content).toBe('Hello');
    expect(before).toHaveLength(0);
    expect(before).not.toBe(after);
  });

  it('ST-14: addMessage — multiple messages', () => {
    useSystemStore.getState().addMessage({ id: '1', role: 'user', content: 'A', timestamp: '12:00' });
    useSystemStore.getState().addMessage({ id: '2', role: 'ai', content: 'B', timestamp: '12:01' });
    useSystemStore.getState().addMessage({ id: '3', role: 'user', content: 'C', timestamp: '12:02' });
    expect(useSystemStore.getState().messages).toHaveLength(3);
  });

  it('ST-15: updateLastAiMessage updates AI content', () => {
    useSystemStore.getState().addMessage({ id: 'u1', role: 'user', content: 'Q', timestamp: '12:00' });
    useSystemStore.getState().addMessage({ id: 'a1', role: 'ai', content: '', timestamp: '12:01', agentName: 'YYC3 Core' });
    useSystemStore.getState().updateLastAiMessage('chunk1');
    expect(useSystemStore.getState().messages[1].content).toBe('chunk1');
    useSystemStore.getState().updateLastAiMessage('chunk1+chunk2');
    expect(useSystemStore.getState().messages[1].content).toBe('chunk1+chunk2');
  });

  it('ST-16: updateLastAiMessage is no-op when last message is user', () => {
    useSystemStore.getState().addMessage({ id: 'u1', role: 'user', content: 'User msg', timestamp: '12:00' });
    useSystemStore.getState().updateLastAiMessage('Should not appear');
    expect(useSystemStore.getState().messages[0].content).toBe('User msg');
    expect(useSystemStore.getState().messages).toHaveLength(1);
  });

  it('ST-17: updateLastAiMessage with providerMeta', () => {
    useSystemStore.getState().addMessage({ id: 'a1', role: 'ai', content: '', timestamp: '12:00' });
    const meta = { providerId: 'openai', modelId: 'gpt-4o', latencyMs: 500, totalTokens: 100 };
    useSystemStore.getState().updateLastAiMessage('Response text', meta);
    const msg = useSystemStore.getState().messages[0];
    expect(msg.content).toBe('Response text');
    expect(msg.providerMeta).toEqual(meta);
  });

  it('ST-18: setMessages replaces entire array', () => {
    useSystemStore.getState().addMessage({ id: '1', role: 'user', content: 'old', timestamp: '12:00' });
    const newMsgs: ChatMessage[] = [
      { id: 'n1', role: 'user', content: 'new1', timestamp: '13:00' },
      { id: 'n2', role: 'ai', content: 'new2', timestamp: '13:01' },
    ];
    useSystemStore.getState().setMessages(newMsgs);
    expect(useSystemStore.getState().messages).toHaveLength(2);
    expect(useSystemStore.getState().messages[0].content).toBe('new1');
  });

  it('ST-19: clearMessages empties array', () => {
    useSystemStore.getState().addMessage({ id: '1', role: 'user', content: 'test', timestamp: '12:00' });
    useSystemStore.getState().clearMessages();
    expect(useSystemStore.getState().messages).toHaveLength(0);
  });

  it('ST-20: streaming state setter', () => {
    useSystemStore.getState().setIsStreaming(true);
    expect(useSystemStore.getState().isStreaming).toBe(true);
    useSystemStore.getState().setIsStreaming(false);
    expect(useSystemStore.getState().isStreaming).toBe(false);
  });
});

// ============================================================
// Suite 5: Artifacts Panel
// ============================================================

describe('Store — Artifacts Panel', () => {
  beforeEach(resetStore);

  it('ST-21: toggleArtifactsPanel', () => {
    useSystemStore.getState().toggleArtifactsPanel();
    expect(useSystemStore.getState().isArtifactsOpen).toBe(true);
    useSystemStore.getState().toggleArtifactsPanel();
    expect(useSystemStore.getState().isArtifactsOpen).toBe(false);
  });

  it('ST-22: setActiveArtifact opens panel', () => {
    useSystemStore.getState().setActiveArtifact({
      code: 'console.log("test")', language: 'javascript', title: 'test.js',
    });
    expect(useSystemStore.getState().isArtifactsOpen).toBe(true);
    expect(useSystemStore.getState().activeArtifact).not.toBeNull();
  });

  it('ST-23: setActiveArtifact(null) closes panel', () => {
    useSystemStore.getState().setActiveArtifact({ code: 'x', language: 'ts', title: 'x.ts' });
    useSystemStore.getState().setActiveArtifact(null);
    expect(useSystemStore.getState().isArtifactsOpen).toBe(false);
    expect(useSystemStore.getState().activeArtifact).toBeNull();
  });
});

// ============================================================
// Suite 6: Agent Chat History
// ============================================================

describe('Store — Agent Chat History', () => {
  beforeEach(resetStore);

  it('ST-24: getAgentHistory returns empty array for unknown agent', () => {
    expect(useSystemStore.getState().getAgentHistory('unknown')).toEqual([]);
  });

  it('ST-25: addAgentMessage and getAgentHistory', () => {
    useSystemStore.getState().addAgentMessage('navigator', {
      id: 'am-1', role: 'user', content: 'Hello nav', timestamp: '12:00',
    });
    const history = useSystemStore.getState().getAgentHistory('navigator');
    expect(history).toHaveLength(1);
    expect(history[0].content).toBe('Hello nav');
  });

  it('ST-26: clearAgentHistory', () => {
    useSystemStore.getState().addAgentMessage('sentinel', {
      id: 'am-1', role: 'user', content: 'test', timestamp: '12:00',
    });
    useSystemStore.getState().clearAgentHistory('sentinel');
    expect(useSystemStore.getState().getAgentHistory('sentinel')).toHaveLength(0);
  });

  it('ST-27: setAgentHistory replaces messages for agent', () => {
    useSystemStore.getState().addAgentMessage('thinker', {
      id: 'old', role: 'user', content: 'old', timestamp: '12:00',
    });
    useSystemStore.getState().setAgentHistory('thinker', [
      { id: 'new1', role: 'user', content: 'new', timestamp: '13:00' },
    ]);
    const h = useSystemStore.getState().getAgentHistory('thinker');
    expect(h).toHaveLength(1);
    expect(h[0].content).toBe('new');
  });

  it('ST-28: multiple agents are independent', () => {
    useSystemStore.getState().addAgentMessage('navigator', {
      id: 'n1', role: 'user', content: 'nav', timestamp: '12:00',
    });
    useSystemStore.getState().addAgentMessage('sentinel', {
      id: 's1', role: 'user', content: 'sen', timestamp: '12:00',
    });
    expect(useSystemStore.getState().getAgentHistory('navigator')).toHaveLength(1);
    expect(useSystemStore.getState().getAgentHistory('sentinel')).toHaveLength(1);
    useSystemStore.getState().clearAgentHistory('navigator');
    expect(useSystemStore.getState().getAgentHistory('navigator')).toHaveLength(0);
    expect(useSystemStore.getState().getAgentHistory('sentinel')).toHaveLength(1);
  });
});

// ============================================================
// Suite 7: Settings Actions
// ============================================================

describe('Store — Settings Actions', () => {
  beforeEach(resetStore);

  it('ST-29: openSettings with default tab', () => {
    useSystemStore.getState().openSettings();
    expect(useSystemStore.getState().isSettingsOpen).toBe(true);
    expect(useSystemStore.getState().settingsTab).toBe('general');
  });

  it('ST-30: openSettings with specific tab', () => {
    useSystemStore.getState().openSettings('models');
    expect(useSystemStore.getState().isSettingsOpen).toBe(true);
    expect(useSystemStore.getState().settingsTab).toBe('models');
  });

  it('ST-31: closeSettings', () => {
    useSystemStore.getState().openSettings('models');
    useSystemStore.getState().closeSettings();
    expect(useSystemStore.getState().isSettingsOpen).toBe(false);
  });

  it('ST-32: setSettingsTab', () => {
    useSystemStore.getState().setSettingsTab('security');
    expect(useSystemStore.getState().settingsTab).toBe('security');
  });

  it('ST-33: setProviderConfigs', () => {
    useSystemStore.getState().setProviderConfigs([
      { providerId: 'openai', apiKey: 'sk-test', endpoint: '', enabled: true, defaultModel: 'gpt-4o' },
    ]);
    expect(useSystemStore.getState().providerConfigs).toHaveLength(1);
    expect(useSystemStore.getState().providerConfigs[0].providerId).toBe('openai');
  });
});

// ============================================================
// Suite 8: Navigation Favorites
// ============================================================

describe('Store — Navigation Favorites', () => {
  beforeEach(resetStore);

  it('ST-34: toggleNavFavorite adds item', () => {
    useSystemStore.getState().toggleNavFavorite('fav-1');
    expect(useSystemStore.getState().navFavorites).toContain('fav-1');
  });

  it('ST-35: toggleNavFavorite removes on second call', () => {
    useSystemStore.getState().toggleNavFavorite('fav-1');
    useSystemStore.getState().toggleNavFavorite('fav-1');
    expect(useSystemStore.getState().navFavorites).not.toContain('fav-1');
  });

  it('ST-36: setNavFavorites replaces list', () => {
    useSystemStore.getState().toggleNavFavorite('old');
    useSystemStore.getState().setNavFavorites(['a', 'b', 'c']);
    expect(useSystemStore.getState().navFavorites).toEqual(['a', 'b', 'c']);
  });
});

// ============================================================
// Suite 9: System Actions
// ============================================================

describe('Store — System Actions', () => {
  beforeEach(resetStore);

  it('ST-37: setStatus', () => {
    useSystemStore.getState().setStatus('critical');
    expect(useSystemStore.getState().status).toBe('critical');
  });

  it('ST-38: addLog creates entry with id and timestamp', () => {
    useSystemStore.getState().addLog('info', 'TEST', 'Test message');
    const logs = useSystemStore.getState().logs;
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('info');
    expect(logs[0].source).toBe('TEST');
    expect(logs[0].message).toBe('Test message');
    expect(logs[0].id).toBeDefined();
    expect(logs[0].timestamp).toBeDefined();
  });

  it('ST-39: addLog prepends (newest first)', () => {
    useSystemStore.getState().addLog('info', 'A', 'First');
    useSystemStore.getState().addLog('warn', 'B', 'Second');
    const logs = useSystemStore.getState().logs;
    expect(logs[0].message).toBe('Second');
    expect(logs[1].message).toBe('First');
  });

  it('ST-40: addLog caps at 100 entries', () => {
    for (let i = 0; i < 120; i++) {
      useSystemStore.getState().addLog('info', 'BULK', `Log ${i}`);
    }
    expect(useSystemStore.getState().logs.length).toBeLessThanOrEqual(100);
  });

  it('ST-41: setDbConnected', () => {
    useSystemStore.getState().setDbConnected(true);
    expect(useSystemStore.getState().dbConnected).toBe(true);
  });

  it('ST-42: updateMetrics sets cluster metrics + derived cpu/latency', () => {
    const nodeMetrics = { cpu: 55.5, memory: 40, disk: 30, network: 10, temperature: 45, processes: 200, uptime: 3600 };
    useSystemStore.getState().updateMetrics({
      'm4-max': nodeMetrics,
      'imac-m4': { ...nodeMetrics, cpu: 30 },
      'matebook': { ...nodeMetrics, cpu: 25 },
      'yanyucloud': { ...nodeMetrics, cpu: 20 },
      timestamp: Date.now(),
    });
    const s = useSystemStore.getState();
    expect(s.clusterMetrics).not.toBeNull();
    expect(s.cpuLoad).toBe(56); // Math.round(55.5)
    expect(s.latency).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// Suite 10: Composite Actions
// ============================================================

describe('Store — Composite Actions', () => {
  beforeEach(resetStore);

  it('ST-43: newSession resets view, messages, artifacts, streaming', () => {
    useSystemStore.getState().setActiveView('console');
    useSystemStore.getState().addMessage({ id: '1', role: 'user', content: 'test', timestamp: '12:00' });
    useSystemStore.getState().setIsArtifactsOpen(true);
    useSystemStore.getState().setIsStreaming(true);
    useSystemStore.getState().newSession();
    const s = useSystemStore.getState();
    expect(s.activeView).toBe('terminal');
    expect(s.messages).toHaveLength(0);
    expect(s.isArtifactsOpen).toBe(false);
    expect(s.isStreaming).toBe(false);
    expect(s.activeArtifact).toBeNull();
  });

  it('ST-44: runDiagnosis sets warning status initially', () => {
    useSystemStore.getState().runDiagnosis();
    const s = useSystemStore.getState();
    expect(s.status).toBe('warning');
    expect(s.cpuLoad).toBe(85);
    expect(s.logs.length).toBeGreaterThanOrEqual(1);
  });
});
