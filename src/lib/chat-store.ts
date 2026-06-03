// ============================================================
// YYC3 AI Family — Chat Session Store
// 富文本方案-03: 多会话管理 + 全局搜索 + 导出
// ============================================================

import type { ChatMessage, ChatSession, SearchHit } from '@/lib/chat-types';

const STORAGE_KEY = 'yyc3-chat-sessions';

function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions: ChatSession[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch { /* quota */ }
}

function downloadFile(name: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');

  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ============================================================
// ChatStore interface
// ============================================================

export interface ChatStore {
  sessions: ChatSession[];
  currentSid: string;
  searchKey: string;
  searchResults: SearchHit[];

  init: () => void;
  createSession: (agentId?: string) => string;
  switchSession: (sid: string) => void;
  deleteSession: (sid: string) => void;
  updateSessionMessages: (sid: string, messages: ChatMessage[]) => void;
  getCurrentMessages: () => ChatMessage[];
  searchMessages: (keyword: string) => void;
  clearSearch: () => void;
  exportMd: (sid: string) => void;
  exportJson: (sid: string) => void;
}

export function createChatStore(): ChatStore {
  const sessions = loadSessions();
  const firstSid = sessions.length > 0 ? sessions[0].sid : '';

  const store: ChatStore = {
    sessions,
    currentSid: firstSid,
    searchKey: '',
    searchResults: [],

    init() {
      if (this.sessions.length === 0) this.createSession();
    },

    createSession(agentId?: string) {
      const sid = uid();

      this.sessions = [...this.sessions, {
        sid,
        title: `会话 ${new Date().toLocaleDateString()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        agentId,
      }];
      this.currentSid = sid;
      saveSessions(this.sessions);

      return sid;
    },

    switchSession(sid: string) {
      this.currentSid = sid;
    },

    deleteSession(sid: string) {
      this.sessions = this.sessions.filter(s => s.sid !== sid);
      if (this.currentSid === sid) {
        this.currentSid = this.sessions.length > 0 ? this.sessions[0].sid : '';
      }
      if (this.sessions.length === 0) this.createSession();
      saveSessions(this.sessions);
    },

    updateSessionMessages(sid: string, messages: ChatMessage[]) {
      this.sessions = this.sessions.map(s => {
        if (s.sid !== sid) return s;
        const firstUser = messages.find(m => m.role === 'user');
        const title = firstUser
          ? firstUser.content.slice(0, 28) + (firstUser.content.length > 28 ? '…' : '')
          : s.title;

        return { ...s, messages, updatedAt: Date.now(), title };
      });
      saveSessions(this.sessions);
    },

    getCurrentMessages() {
      const cur = this.sessions.find(s => s.sid === this.currentSid);

      return cur?.messages ?? [];
    },

    searchMessages(keyword: string) {
      this.searchKey = keyword;
      if (!keyword.trim()) {
        this.searchResults = [];

        return;
      }
      const lower = keyword.toLowerCase();
      const results: SearchHit[] = [];

      for (const s of this.sessions) {
        for (const msg of s.messages) {
          if (msg.content.toLowerCase().includes(lower)) {
            results.push({ sid: s.sid, sTitle: s.title, msg });
          }
        }
      }
      this.searchResults = results;
    },

    clearSearch() {
      this.searchKey = '';
      this.searchResults = [];
    },

    exportMd(sid: string) {
      const s = this.sessions.find(x => x.sid === sid);

      if (!s) return;
      let md = `# YYC³ AI-Family 对话\n\n**会话**: ${s.title}\n**导出**: ${new Date().toLocaleString()}\n\n---\n\n`;

      for (const m of s.messages) {
        md += `${m.role === 'user' ? '## 👤 用户' : '## 🤖 AI'}\n\n${m.content}\n\n`;
      }
      downloadFile(`${s.title.replace(/[\s/]+/g, '_')}.md`, md, 'text/markdown');
    },

    exportJson(sid: string) {
      const s = this.sessions.find(x => x.sid === sid);

      if (!s) return;
      const json = JSON.stringify({ title: s.title, exportedAt: new Date().toISOString(), messages: s.messages }, null, 2);

      downloadFile(`${s.title.replace(/[\s/]+/g, '_')}.json`, json, 'application/json');
    },
  };

  return store;
}
