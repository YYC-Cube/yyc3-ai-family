// ============================================================
// YYC3 AI Family — Chat Extended Types
// 三文档集成的统一消息类型定义
// 兼容现有 ChatArea + MessageBubble 架构
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  folded: boolean;
  timestamp: number;
  agentName?: string;
  agentRole?: 'architect' | 'coder' | 'auditor' | 'orchestrator';
  /** 流式渲染进行中 */
  streaming?: boolean;
}

export interface ChatSession {
  sid: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  agentId?: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';

/** 跨会话搜索结果 */
export interface SearchHit {
  sid: string;
  sTitle: string;
  msg: ChatMessage;
}
