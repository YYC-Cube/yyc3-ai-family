// ============================================================
// YYC3 Hacker Chatbot — Zod Schema Validation Tests (Vitest)
// Phase 26: Runtime validation for persistence domains
//
// Run: npx vitest run src/lib/__tests__/persist-schemas.test.ts
// ============================================================

import { describe, it, expect } from 'vitest';

import {
  ChatMessageSchema,
  ChatSessionSchema,
  AgentHistoryRecordSchema,
  AgentChatMessageSchema,
  PreferencesSchema,
  SystemLogSchema,
  KnowledgeEntrySchema,
  LLMProviderConfigSchema,
  NodeMetricsSchema,
  MetricsSnapshotSchema,
  validateRecord,
  validateArray,
  validators,
} from '../persist-schemas';

// ============================================================
// Suite 1: ChatMessage Schema
// ============================================================

describe('ChatMessageSchema', () => {
  it('ZOD-01: validates a correct chat message', () => {
    const msg = {
      id: 'msg-1',
      role: 'user',
      content: 'Hello world',
      timestamp: '12:00',
    };
    const result = ChatMessageSchema.safeParse(msg);

    expect(result.success).toBe(true);
  });

  it('ZOD-02: validates an AI message with optional fields', () => {
    const msg = {
      id: 'msg-2',
      role: 'ai',
      content: 'Response',
      timestamp: '12:01',
      agentName: 'YYC3 Core',
      agentRole: 'architect',
    };
    const result = ChatMessageSchema.safeParse(msg);

    expect(result.success).toBe(true);
  });

  it('ZOD-03: rejects message with invalid role', () => {
    const msg = {
      id: 'msg-3',
      role: 'system', // invalid
      content: 'test',
      timestamp: '12:00',
    };
    const result = ChatMessageSchema.safeParse(msg);

    expect(result.success).toBe(false);
  });

  it('ZOD-04: rejects message without required fields', () => {
    const msg = { id: 'msg-4', role: 'user' };
    const result = ChatMessageSchema.safeParse(msg);

    expect(result.success).toBe(false);
  });

  it('ZOD-05: rejects message with number content', () => {
    const msg = {
      id: 'msg-5',
      role: 'user',
      content: 12345, // should be string
      timestamp: '12:00',
    };
    const result = ChatMessageSchema.safeParse(msg);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 2: ChatSession Schema
// ============================================================

describe('ChatSessionSchema', () => {
  it('ZOD-06: validates a complete chat session', () => {
    const session = {
      id: 'sess-1',
      title: 'Test Session',
      messages: [
        { id: 'm1', role: 'user', content: 'Hi', timestamp: '12:00' },
        { id: 'm2', role: 'ai', content: 'Hello!', timestamp: '12:01' },
      ],
      createdAt: '2026-02-16T00:00:00Z',
    };
    const result = ChatSessionSchema.safeParse(session);

    expect(result.success).toBe(true);
  });

  it('ZOD-07: rejects session with invalid messages array', () => {
    const session = {
      id: 'sess-2',
      title: 'Bad',
      messages: ['not-an-object'],
      createdAt: '2026-02-16',
    };
    const result = ChatSessionSchema.safeParse(session);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 3: AgentHistoryRecord Schema
// ============================================================

describe('AgentHistoryRecordSchema', () => {
  it('ZOD-08: validates agent history record', () => {
    const record = {
      id: 'navigator',
      agentId: 'navigator',
      messages: [
        { id: 'a1', role: 'user', content: 'Hello navigator', timestamp: '12:00' },
      ],
    };
    const result = AgentHistoryRecordSchema.safeParse(record);

    expect(result.success).toBe(true);
  });
});

// ============================================================
// Suite 4: Preferences Schema
// ============================================================

describe('PreferencesSchema', () => {
  it('ZOD-09: validates full preferences', () => {
    const prefs = {
      language: 'zh',
      accentColor: '#0EA5E9',
      bgColor: '#050505',
      fontFamily: 'Inter',
      fontSize: 16,
      scanline: true,
      glowEffect: false,
    };
    const result = PreferencesSchema.safeParse(prefs);

    expect(result.success).toBe(true);
  });

  it('ZOD-10: validates empty preferences (all optional)', () => {
    const result = PreferencesSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('ZOD-11: rejects invalid language', () => {
    const prefs = { language: 'fr' };
    const result = PreferencesSchema.safeParse(prefs);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 5: SystemLog Schema
// ============================================================

describe('SystemLogSchema', () => {
  it('ZOD-12: validates system log entry', () => {
    const log = {
      id: 'log-1',
      level: 'info',
      source: 'TEST',
      message: 'Test message',
      timestamp: '2026-02-16T12:00:00Z',
    };
    const result = SystemLogSchema.safeParse(log);

    expect(result.success).toBe(true);
  });

  it('ZOD-13: rejects invalid log level', () => {
    const log = {
      id: 'log-2',
      level: 'debug', // not in enum
      source: 'TEST',
      message: 'Test',
      timestamp: '12:00',
    };
    const result = SystemLogSchema.safeParse(log);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 6: KnowledgeEntry Schema
// ============================================================

describe('KnowledgeEntrySchema', () => {
  it('ZOD-14: validates knowledge entry', () => {
    const entry = {
      id: 'kb-1',
      title: 'Test Article',
      content: 'Some content',
      category: 'general',
      tags: ['test', 'demo'],
      importance: 'high',
    };
    const result = KnowledgeEntrySchema.safeParse(entry);

    expect(result.success).toBe(true);
  });

  it('ZOD-15: rejects entry without required category', () => {
    const entry = { id: 'kb-2', title: 'No Category' };
    const result = KnowledgeEntrySchema.safeParse(entry);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 7: LLMProviderConfig Schema
// ============================================================

describe('LLMProviderConfigSchema', () => {
  it('ZOD-16: validates LLM provider config', () => {
    const config = {
      providerId: 'openai',
      apiKey: 'sk-test-key',
      endpoint: 'https://api.openai.com/v1',
      enabled: true,
      defaultModel: 'gpt-4o',
    };
    const result = LLMProviderConfigSchema.safeParse(config);

    expect(result.success).toBe(true);
  });

  it('ZOD-17: rejects config with missing apiKey', () => {
    const config = {
      providerId: 'openai',
      endpoint: '',
      enabled: true,
      defaultModel: 'gpt-4o',
    };
    const result = LLMProviderConfigSchema.safeParse(config);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 8: Validation Helpers
// ============================================================

describe('validateRecord helper', () => {
  it('ZOD-18: returns success with typed data', () => {
    const result = validateRecord(ChatMessageSchema, {
      id: 'x', role: 'user', content: 'test', timestamp: '12:00',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('x');
      expect(result.data.role).toBe('user');
    }
  });

  it('ZOD-19: returns errors for invalid data', () => {
    const result = validateRecord(ChatMessageSchema, { id: 123 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});

describe('validateArray helper', () => {
  it('ZOD-20: filters valid records from mixed array', () => {
    const data = [
      { id: '1', role: 'user', content: 'ok', timestamp: '12:00' },
      { id: '2', role: 'invalid', content: 'bad' }, // invalid
      { id: '3', role: 'ai', content: 'good', timestamp: '12:01' },
    ];
    const result = validateArray(ChatMessageSchema, data);

    expect(result.valid.length).toBe(2);
    expect(result.invalidCount).toBe(1);
    expect(result.errors.length).toBe(1);
  });

  it('ZOD-21: handles empty array', () => {
    const result = validateArray(ChatMessageSchema, []);

    expect(result.valid.length).toBe(0);
    expect(result.invalidCount).toBe(0);
  });
});

// ============================================================
// Suite 9: Domain Validators
// ============================================================

describe('Domain validators', () => {
  it('ZOD-22: validators.chatMessage works', () => {
    const result = validators.chatMessage({
      id: 'v1', role: 'user', content: 'test', timestamp: '12:00',
    });

    expect(result.success).toBe(true);
  });

  it('ZOD-23: validators.llmConfig works', () => {
    const result = validators.llmConfig({
      providerId: 'deepseek',
      apiKey: 'sk-test',
      endpoint: '',
      enabled: true,
      defaultModel: 'deepseek-chat',
    });

    expect(result.success).toBe(true);
  });

  it('ZOD-24: validators.chatMessages filters array', () => {
    const result = validators.chatMessages([
      { id: '1', role: 'user', content: 'a', timestamp: '12:00' },
      { bad: true },
      { id: '3', role: 'ai', content: 'c', timestamp: '12:02' },
    ]);

    expect(result.valid.length).toBe(2);
    expect(result.invalidCount).toBe(1);
  });
});

// ============================================================
// Suite 10: NodeMetrics Schema (Phase 29)
// ============================================================

describe('NodeMetricsSchema', () => {
  it('ZOD-25: validates complete node metrics', () => {
    const metrics = {
      cpu: 42.5,
      memory: 68.2,
      disk: 55.0,
      network: 120.5,
      temperature: 62.3,
    };
    const result = NodeMetricsSchema.safeParse(metrics);

    expect(result.success).toBe(true);
  });

  it('ZOD-26: validates minimal node metrics (only required fields)', () => {
    const metrics = { cpu: 10, memory: 20, disk: 30 };
    const result = NodeMetricsSchema.safeParse(metrics);

    expect(result.success).toBe(true);
  });

  it('ZOD-27: rejects node metrics with missing cpu', () => {
    const metrics = { memory: 50, disk: 60 };
    const result = NodeMetricsSchema.safeParse(metrics);

    expect(result.success).toBe(false);
  });

  it('ZOD-28: rejects node metrics with string value', () => {
    const metrics = { cpu: 'high', memory: 50, disk: 60 };
    const result = NodeMetricsSchema.safeParse(metrics);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 11: MetricsSnapshot Schema (Phase 29)
// ============================================================

describe('MetricsSnapshotSchema', () => {
  it('ZOD-29: validates complete metrics snapshot', () => {
    const snapshot = {
      id: 'snap-1',
      timestamp: '2026-02-16T12:00:00Z',
      nodes: {
        'm4-max': { cpu: 25, memory: 60, disk: 45 },
        'yanyucloud': { cpu: 15, memory: 40, disk: 70, temperature: 55 },
      },
    };
    const result = MetricsSnapshotSchema.safeParse(snapshot);

    expect(result.success).toBe(true);
  });

  it('ZOD-30: validates snapshot without optional nodes', () => {
    const snapshot = {
      id: 'snap-2',
      timestamp: '2026-02-16T12:05:00Z',
    };
    const result = MetricsSnapshotSchema.safeParse(snapshot);

    expect(result.success).toBe(true);
  });

  it('ZOD-31: rejects snapshot with invalid node metrics', () => {
    const snapshot = {
      id: 'snap-3',
      timestamp: '2026-02-16T12:10:00Z',
      nodes: {
        'm4-max': { cpu: 'bad' }, // invalid: string instead of number
      },
    };
    const result = MetricsSnapshotSchema.safeParse(snapshot);

    expect(result.success).toBe(false);
  });

  it('ZOD-32: rejects snapshot without required id', () => {
    const snapshot = { timestamp: '2026-02-16T12:15:00Z' };
    const result = MetricsSnapshotSchema.safeParse(snapshot);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 12: AgentChatMessage Schema (Phase 29)
// ============================================================

describe('AgentChatMessageSchema', () => {
  it('ZOD-33: validates agent chat message', () => {
    const msg = {
      id: 'acm-1',
      role: 'ai',
      content: 'Agent response',
      timestamp: '12:00',
      agentName: 'Navigator',
      agentRole: 'architect',
    };
    const result = AgentChatMessageSchema.safeParse(msg);

    expect(result.success).toBe(true);
  });

  it('ZOD-34: validates minimal agent chat message', () => {
    const msg = {
      id: 'acm-2',
      role: 'user',
      content: 'Question',
      timestamp: '12:01',
    };
    const result = AgentChatMessageSchema.safeParse(msg);

    expect(result.success).toBe(true);
  });

  it('ZOD-35: rejects agent chat message with invalid agentRole', () => {
    const msg = {
      id: 'acm-3',
      role: 'ai',
      content: 'test',
      timestamp: '12:02',
      agentRole: 'manager', // not in enum
    };
    const result = AgentChatMessageSchema.safeParse(msg);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 13: Edge Cases & Boundary Tests (Phase 29)
// ============================================================

describe('Edge cases', () => {
  it('ZOD-36: null input is rejected by all schemas', () => {
    expect(ChatMessageSchema.safeParse(null).success).toBe(false);
    expect(SystemLogSchema.safeParse(null).success).toBe(false);
    expect(MetricsSnapshotSchema.safeParse(null).success).toBe(false);
    expect(LLMProviderConfigSchema.safeParse(null).success).toBe(false);
  });

  it('ZOD-37: undefined input is rejected by all schemas', () => {
    expect(ChatMessageSchema.safeParse(undefined).success).toBe(false);
    expect(ChatSessionSchema.safeParse(undefined).success).toBe(false);
    expect(KnowledgeEntrySchema.safeParse(undefined).success).toBe(false);
  });

  it('ZOD-38: empty string id passes ChatMessage (string type, no min constraint)', () => {
    const msg = { id: '', role: 'user', content: '', timestamp: '' };
    const result = ChatMessageSchema.safeParse(msg);

    expect(result.success).toBe(true);
  });

  it('ZOD-39: validateArray with all invalid items returns zero valid', () => {
    const data = [
      { nope: true },
      { also: 'bad' },
      42,
    ];
    const result = validateArray(ChatMessageSchema, data);

    expect(result.valid.length).toBe(0);
    expect(result.invalidCount).toBe(3);
    expect(result.errors.length).toBe(3);
  });

  it('ZOD-40: system log with optional metadata passes', () => {
    const log = {
      id: 'log-meta',
      level: 'warn',
      source: 'BRIDGE',
      message: 'Rate limited',
      timestamp: '12:00',
      metadata: { provider: 'openai', retryAfter: 30 },
    };
    const result = SystemLogSchema.safeParse(log);

    expect(result.success).toBe(true);
  });

  it('ZOD-41: preferences with all optional appearance fields', () => {
    const prefs = {
      language: 'en',
      accentColor: '#0EA5E9',
      bgColor: '#050505',
      borderColor: '#1E293B',
      fontFamily: 'Inter',
      monoFontFamily: 'JetBrains Mono',
      fontSize: 14,
      scanline: false,
      glowEffect: true,
      glowColor: '#0EA5E9',
      overlayOpacity: 0.05,
      shadowIntensity: 0.3,
      bgImageDataUrl: 'data:image/png;base64,ABC',
    };
    const result = PreferencesSchema.safeParse(prefs);

    expect(result.success).toBe(true);
  });

  it('ZOD-42: knowledge entry with all optional fields populated', () => {
    const entry = {
      id: 'kb-full',
      title: 'Full Entry',
      content: 'Detailed content here',
      summary: 'Brief summary',
      category: 'devops',
      tags: ['docker', 'k8s', 'ci-cd'],
      linkedAgents: ['navigator', 'sentinel'],
      source: 'manual',
      importance: 'critical',
      accessCount: 42,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-02-16T12:00:00Z',
    };
    const result = KnowledgeEntrySchema.safeParse(entry);

    expect(result.success).toBe(true);
  });

  it('ZOD-43: validators.systemLog convenience works', () => {
    const result = validators.systemLog({
      id: 'sl-1', level: 'error', source: 'MCP', message: 'Timeout', timestamp: '12:00',
    });

    expect(result.success).toBe(true);
  });

  it('ZOD-44: validators.systemLogs filters array', () => {
    const result = validators.systemLogs([
      { id: '1', level: 'info', source: 'A', message: 'ok', timestamp: '12:00' },
      { id: '2', level: 'invalid_level', source: 'B', message: 'bad', timestamp: '12:01' },
    ]);

    expect(result.valid.length).toBe(1);
    expect(result.invalidCount).toBe(1);
  });
});