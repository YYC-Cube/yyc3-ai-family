// ============================================================
// YYC3 Hacker Chatbot — Zod Persistence Schemas
// Phase 26: Runtime validation for persistence domain records
//
// Provides schema validation for all data entering/leaving the
// persistence engine, replacing raw Record<string, unknown> casts
// with type-safe validated objects.
//
// Usage:
//   import { validateChatMessage, validateAgentMessage } from './persist-schemas';
//   const safe = validateChatMessage(rawData);
//   if (safe.success) { /* safe.data is typed ChatMessage */ }
// ============================================================

import { z } from 'zod';

// ============================================================
// 1. Chat Domain Schemas
// ============================================================

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'ai']),
  content: z.string(),
  timestamp: z.string(),
  agentName: z.string().optional(),
  agentRole: z.enum(['architect', 'coder', 'auditor', 'orchestrator']).optional(),
});

export type ValidatedChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type ValidatedChatSession = z.infer<typeof ChatSessionSchema>;

// ============================================================
// 2. Agent Domain Schemas
// ============================================================

export const AgentChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'ai']),
  content: z.string(),
  timestamp: z.string(),
  agentName: z.string().optional(),
  agentRole: z.enum(['architect', 'coder', 'auditor', 'orchestrator']).optional(),
});

export type ValidatedAgentChatMessage = z.infer<typeof AgentChatMessageSchema>;

export const AgentHistoryRecordSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  messages: z.array(AgentChatMessageSchema),
  updatedAt: z.string().optional(),
});

export type ValidatedAgentHistoryRecord = z.infer<typeof AgentHistoryRecordSchema>;

// ============================================================
// 3. Preferences Schema
// ============================================================

export const PreferencesSchema = z.object({
  language: z.enum(['zh', 'en']).optional(),
  accentColor: z.string().optional(),
  bgColor: z.string().optional(),
  borderColor: z.string().optional(),
  fontFamily: z.string().optional(),
  monoFontFamily: z.string().optional(),
  fontSize: z.number().optional(),
  scanline: z.boolean().optional(),
  glowEffect: z.boolean().optional(),
  glowColor: z.string().optional(),
  overlayOpacity: z.number().optional(),
  shadowIntensity: z.number().optional(),
  bgImageDataUrl: z.string().optional(),
});

export type ValidatedPreferences = z.infer<typeof PreferencesSchema>;

// ============================================================
// 4. System Log Schema
// ============================================================

export const SystemLogSchema = z.object({
  id: z.string(),
  level: z.enum(['info', 'warn', 'error', 'success']),
  source: z.string(),
  message: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ValidatedSystemLog = any;

// ============================================================
// 5. Metrics Snapshot Schema
// ============================================================

export const NodeMetricsSchema = z.object({
  cpu: z.number(),
  memory: z.number(),
  disk: z.number(),
  network: z.number().optional(),
  temperature: z.number().optional(),
});

export const MetricsSnapshotSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  nodes: z.record(z.string(), NodeMetricsSchema).optional(),
});

export type ValidatedMetricsSnapshot = any;

// ============================================================
// 6. Knowledge Base Schema
// ============================================================

export const KnowledgeEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  summary: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  linkedAgents: z.array(z.string()).optional(),
  source: z.string().optional(),
  importance: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  accessCount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ValidatedKnowledgeEntry = z.infer<typeof KnowledgeEntrySchema>;

// ============================================================
// 7. LLM Config Schema
// ============================================================

export const LLMProviderConfigSchema = z.object({
  providerId: z.string(),
  apiKey: z.string(),
  endpoint: z.string(),
  enabled: z.boolean(),
  defaultModel: z.string(),
});

export type ValidatedLLMProviderConfig = z.infer<typeof LLMProviderConfigSchema>;

// ============================================================
// 8. Validation Helpers
// ============================================================

/**
 * Validate a single record against a schema.
 * Returns { success: true, data } or { success: false, errors }.
 */
export function validateRecord<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as T };
  }
  return {
    success: false,
    errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
  };
}

/**
 * Validate an array of records, filtering out invalid ones.
 * Returns only records that pass validation.
 */
export function validateArray<T>(
  schema: z.ZodType<T>,
  data: unknown[]
): { valid: T[]; invalidCount: number; errors: string[] } {
  const valid: T[] = [];
  const errors: string[] = [];
  let invalidCount = 0;

  for (const item of data) {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data as T);
    } else {
      invalidCount++;
      errors.push(
        `Record ${invalidCount}: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`
      );
    }
  }

  return { valid, invalidCount, errors };
}

/**
 * Domain-specific validators for convenience
 */
export const validators = {
  chatMessage: (data: unknown) => validateRecord(ChatMessageSchema, data),
  chatSession: (data: unknown) => validateRecord(ChatSessionSchema, data),
  agentHistory: (data: unknown) => validateRecord(AgentHistoryRecordSchema, data),
  preferences: (data: unknown) => validateRecord(PreferencesSchema, data),
  systemLog: (data: unknown) => validateRecord(SystemLogSchema, data),
  knowledgeEntry: (data: unknown) => validateRecord(KnowledgeEntrySchema, data),
  llmConfig: (data: unknown) => validateRecord(LLMProviderConfigSchema, data),

  chatMessages: (data: unknown[]) => validateArray(ChatMessageSchema, data),
  systemLogs: (data: unknown[]) => validateArray(SystemLogSchema, data),
  knowledgeEntries: (data: unknown[]) => validateArray(KnowledgeEntrySchema, data),
  llmConfigs: (data: unknown[]) => validateArray(LLMProviderConfigSchema, data),
};
