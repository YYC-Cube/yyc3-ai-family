// ============================================================
// YYC3 Hacker Chatbot — Unified LLM Bridge
// Phase 14.1: Intelligence Dimension (D1)
// Phase 14.2: Smart Router + Circuit Breaker + Auto Failover
//
// 统一封装 OpenAI / Anthropic / DeepSeek / 智谱 Z.AI API
// 核心设计原则:
//   - One Interface, Multiple Providers
//   - Streaming First (SSE)
//   - Graceful Degradation (API → Template Fallback)
//   - Token Tracking
//   - Provider-agnostic message format
//   - [14.2] Circuit Breaker + Dynamic Health Routing
//   - [14.2] Auto Failover Chain with retry
//
// 调用链路 (Phase 14.2):
//   Agent UI → agentStreamChat()
//            → LLMRouter.getFailoverChain()
//            → [Circuit Breaker Gate]
//            → streamChat() → Provider API (SSE)
//            → [on error: LLMRouter.recordFailure → try next provider]
//            → [on success: LLMRouter.recordSuccess]
//            ↓ (all providers failed)
//            → Template Response (null return)
// ============================================================

import { PROVIDERS, AGENT_ROUTES, type ProviderDefinition } from './llm-providers';
import { getRouter, type FailoverResult } from './llm-router';
import { resolveProviderEndpoint } from './proxy-endpoints';
import { encryptValue, decryptValue, isCryptoAvailable } from './crypto';

// ============================================================
// Types
// ============================================================

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequestOptions {
  providerId: string;
  modelId: string;
  messages: LLMMessage[];
  apiKey: string;
  endpoint?: string;       // override default endpoint
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
  proxyUrl?: string;       // optional CORS proxy
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage: TokenUsage;
  finishReason: string;
  latencyMs: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface StreamChunk {
  type: 'content' | 'done' | 'error';
  content: string;
  usage?: TokenUsage;
  finishReason?: string;
}

export type StreamCallback = (chunk: StreamChunk) => void;

export class LLMError extends Error {
  constructor(
    message: string,
    public code: LLMErrorCode,
    public provider: string,
    public statusCode?: number,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export type LLMErrorCode =
  | 'AUTH_FAILED'
  | 'RATE_LIMITED'
  | 'CONTEXT_TOO_LONG'
  | 'MODEL_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'CORS_ERROR'
  | 'TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'UNKNOWN';

// ============================================================
// Configuration Storage
// ============================================================

const PROVIDER_CONFIG_KEY = 'yyc3-llm-provider-config';
let _cachedConfigs: ProviderConfig[] = [];

export interface ProviderConfig {
  providerId: string;
  apiKey: string;          // may be encrypted or plaintext
  endpoint: string;        // override endpoint
  enabled: boolean;
  defaultModel: string;
  encrypted?: boolean;     // Phase 35: encryption status flag
}

export function loadProviderConfigs(): ProviderConfig[] {
  if (_cachedConfigs.length > 0) return _cachedConfigs;
  try {
    const raw = localStorage.getItem(PROVIDER_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export async function saveProviderConfigs(configs: ProviderConfig[]) {
  try {
    const encryptEnabled = isCryptoAvailable();
    const processedConfigs = await Promise.all(configs.map(async c => {
      if (c.apiKey && !c.encrypted && encryptEnabled) {
        return { ...c, apiKey: await encryptValue(c.apiKey), encrypted: true };
      }
      return c;
    }));
    localStorage.setItem(PROVIDER_CONFIG_KEY, JSON.stringify(processedConfigs));
    _cachedConfigs = configs.map(c => ({ ...c, encrypted: false })); // keep decrypted in cache
  } catch { /* ignore */ }
}

/**
 * Phase 35: Async initialization of configs (decryption)
 */
export async function initProviderConfigs(): Promise<ProviderConfig[]> {
  try {
    const raw = localStorage.getItem(PROVIDER_CONFIG_KEY);
    if (!raw) return [];
    const configs = JSON.parse(raw) as ProviderConfig[];
    
    const decrypted = await Promise.all(configs.map(async c => {
      if (c.apiKey && c.encrypted) {
        try {
          return { ...c, apiKey: await decryptValue(c.apiKey), encrypted: false };
        } catch { return c; }
      }
      return c;
    }));
    
    _cachedConfigs = decrypted;
    return decrypted;
  } catch { return []; }
}

export function getProviderConfig(providerId: string): ProviderConfig | undefined {
  return loadProviderConfigs().find(c => c.providerId === providerId);
}

/**
 * 获取所有已配置 API Key 的 Provider IDs
 */
export function getEnabledProviderIds(): string[] {
  const configs = loadProviderConfigs();
  const enabled: string[] = [];

  for (const config of configs) {
    if (config.enabled && config.apiKey) {
      enabled.push(config.providerId);
    }
  }

  // 本地 Provider 总是可用 (不需要 API Key)
  if (!enabled.includes('ollama')) {
    // We'll check connectivity separately
  }

  return enabled;
}

// ============================================================
// Request Builders
// ============================================================

interface BuildResult {
  url: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * 构建 OpenAI 兼容格式请求
 */
function buildOpenAIRequest(
  provider: ProviderDefinition,
  opts: LLMRequestOptions
): BuildResult {
  const endpoint = opts.endpoint || provider.defaultEndpoint;
  const url = `${endpoint.replace(/\/$/, '')}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (opts.apiKey) {
    headers[provider.authHeaderKey] = `${provider.authPrefix}${opts.apiKey}`;
  }

  const body = JSON.stringify({
    model: opts.modelId,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 4096,
    stream: opts.stream ?? true,
  });

  return { url, headers, body };
}

/**
 * 构建 Anthropic 格式请求
 */
function buildAnthropicRequest(
  provider: ProviderDefinition,
  opts: LLMRequestOptions
): BuildResult {
  const endpoint = opts.endpoint || provider.defaultEndpoint;
  const url = `${endpoint.replace(/\/$/, '')}/messages`;

  // Extract system message
  const systemMsg = opts.messages.find(m => m.role === 'system');
  const chatMessages = opts.messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'x-api-key': opts.apiKey || '',
  };

  const body = JSON.stringify({
    model: opts.modelId,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.7,
    stream: opts.stream ?? true,
    ...(systemMsg ? { system: systemMsg.content } : {}),
    messages: chatMessages,
  });

  return { url, headers, body };
}

/**
 * 根据 Provider 的 API 格式构建请求
 */
function buildRequest(opts: LLMRequestOptions): BuildResult {
  const provider = PROVIDERS[opts.providerId];
  if (!provider) {
    throw new LLMError(
      `Unknown provider: ${opts.providerId}`,
      'PROVIDER_ERROR',
      opts.providerId
    );
  }

  switch (provider.apiFormat) {
    case 'anthropic':
      return buildAnthropicRequest(provider, opts);
    case 'openai':
    default:
      return buildOpenAIRequest(provider, opts);
  }
}

// ============================================================
// SSE Stream Parsers
// ============================================================

/**
 * 解析 OpenAI SSE 流
 */
async function* parseOpenAIStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<StreamChunk> {
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === ':') continue;

        if (trimmed === 'data: [DONE]') {
          yield { type: 'done', content: '' };
          return;
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const choice = data.choices?.[0];

            if (choice?.delta?.content) {
              yield { type: 'content', content: choice.delta.content };
            }

            if (choice?.finish_reason && choice.finish_reason !== 'null') {
              yield {
                type: 'done',
                content: '',
                finishReason: choice.finish_reason,
                usage: data.usage ? {
                  promptTokens: data.usage.prompt_tokens || 0,
                  completionTokens: data.usage.completion_tokens || 0,
                  totalTokens: data.usage.total_tokens || 0,
                } : undefined,
              };
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 解析 Anthropic SSE 流
 */
async function* parseAnthropicStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<StreamChunk> {
  const decoder = new TextDecoder();
  let buffer = '';
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));

            switch (data.type) {
              case 'message_start':
                inputTokens = data.message?.usage?.input_tokens || 0;
                break;

              case 'content_block_delta':
                if (data.delta?.text) {
                  yield { type: 'content', content: data.delta.text };
                }
                break;

              case 'message_delta':
                outputTokens = data.usage?.output_tokens || 0;
                if (data.delta?.stop_reason) {
                  yield {
                    type: 'done',
                    content: '',
                    finishReason: data.delta.stop_reason,
                    usage: {
                      promptTokens: inputTokens,
                      completionTokens: outputTokens,
                      totalTokens: inputTokens + outputTokens,
                    },
                  };
                }
                break;

              case 'message_stop':
                yield {
                  type: 'done',
                  content: '',
                  usage: {
                    promptTokens: inputTokens,
                    completionTokens: outputTokens,
                    totalTokens: inputTokens + outputTokens,
                  },
                };
                break;
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================================
// Core API Functions
// ============================================================

/**
 * 流式调用 LLM API
 *
 * @param opts - 请求选项
 * @param onChunk - 流式回调 (每个 token 触发)
 * @returns 完整响应 (流结束后)
 */
export async function streamChat(
  opts: LLMRequestOptions,
  onChunk: StreamCallback
): Promise<LLMResponse> {
  const startTime = performance.now();
  const provider = PROVIDERS[opts.providerId];

  if (!provider) {
    throw new LLMError(
      `Provider "${opts.providerId}" not found`,
      'PROVIDER_ERROR',
      opts.providerId
    );
  }

  const request = buildRequest({ ...opts, stream: true });
  let response: Response;

  try {
    response = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      signal: opts.signal,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === 'AbortError') {
      throw new LLMError('Request aborted', 'TIMEOUT', opts.providerId);
    }

    // Check for CORS error
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      throw new LLMError(
        `Network error connecting to ${provider.name}. This may be a CORS issue. Consider using a local proxy.`,
        'CORS_ERROR',
        opts.providerId,
        undefined,
        true
      );
    }

    throw new LLMError(
      `Network error: ${err.message}`,
      'NETWORK_ERROR',
      opts.providerId,
      undefined,
      true
    );
  }

  // Handle HTTP errors
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    const errorCode = mapHttpStatusToCode(response.status);

    throw new LLMError(
      `${provider.name} API error (${response.status}): ${errorBody.slice(0, 200)}`,
      errorCode,
      opts.providerId,
      response.status,
      response.status === 429 || response.status >= 500
    );
  }

  // Parse SSE stream
  if (!response.body) {
    throw new LLMError(
      'Response body is null',
      'PROVIDER_ERROR',
      opts.providerId
    );
  }

  const reader = response.body.getReader();
  const parser = provider.apiFormat === 'anthropic'
    ? parseAnthropicStream(reader)
    : parseOpenAIStream(reader);

  let fullContent = '';
  let finalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  let finishReason = 'stop';

  for await (const chunk of parser) {
    if (chunk.type === 'content') {
      fullContent += chunk.content;
      onChunk(chunk);
    } else if (chunk.type === 'done') {
      if (chunk.usage) finalUsage = chunk.usage;
      if (chunk.finishReason) finishReason = chunk.finishReason;
      onChunk(chunk);
    } else if (chunk.type === 'error') {
      onChunk(chunk);
    }
  }

  const latencyMs = performance.now() - startTime;

  // Estimate tokens if provider didn't return usage
  if (finalUsage.totalTokens === 0) {
    finalUsage = estimateTokens(opts.messages, fullContent);
  }

  return {
    content: fullContent,
    model: opts.modelId,
    provider: opts.providerId,
    usage: finalUsage,
    finishReason,
    latencyMs: Math.round(latencyMs),
  };
}

/**
 * 非流式调用 (同步等待完整响应)
 */
export async function chat(opts: LLMRequestOptions): Promise<LLMResponse> {
  const startTime = performance.now();
  const provider = PROVIDERS[opts.providerId];

  if (!provider) {
    throw new LLMError(
      `Provider "${opts.providerId}" not found`,
      'PROVIDER_ERROR',
      opts.providerId
    );
  }

  const request = buildRequest({ ...opts, stream: false });

  let response: Response;
  try {
    response = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      signal: opts.signal,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === 'AbortError') {
      throw new LLMError('Request aborted', 'TIMEOUT', opts.providerId);
    }
    throw new LLMError(
      `Network error: ${err.message}`,
      'NETWORK_ERROR',
      opts.providerId,
      undefined,
      true
    );
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new LLMError(
      `${provider.name} API error (${response.status}): ${errorBody.slice(0, 200)}`,
      mapHttpStatusToCode(response.status),
      opts.providerId,
      response.status,
      response.status === 429 || response.status >= 500
    );
  }

  const data = await response.json();
  const latencyMs = performance.now() - startTime;

  if (provider.apiFormat === 'anthropic') {
    const content = data.content?.[0]?.text || '';
    return {
      content,
      model: opts.modelId,
      provider: opts.providerId,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      finishReason: data.stop_reason || 'stop',
      latencyMs: Math.round(latencyMs),
    };
  }

  // OpenAI format
  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content || '',
    model: opts.modelId,
    provider: opts.providerId,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
    finishReason: choice?.finish_reason || 'stop',
    latencyMs: Math.round(latencyMs),
  };
}

// ============================================================
// Agent-Specific API
// ============================================================

/**
 * 为指定 Agent 发送消息 (自动路由 Provider/Model)
 *
 * @param agentId - Agent ID (navigator, thinker, etc.)
 * @param userMessage - 用户消息
 * @param chatHistory - 聊天历史 (用于上下文)
 * @param onChunk - 流式回调
 * @param signal - AbortSignal
 * @param overrideSystemPrompt - Phase 35: 可选的系统提示词覆盖 (用于注入工具等)
 * @returns LLMResponse 或 null (如果降级为模板)
 */
export async function agentStreamChat(
  agentId: string,
  userMessage: string,
  chatHistory: LLMMessage[],
  onChunk: StreamCallback,
  signal?: AbortSignal,
  overrideSystemPrompt?: string
): Promise<LLMResponse | null> {
  const route = AGENT_ROUTES[agentId];
  if (!route) return null;

  // 查找有 API Key 的 Provider
  const configs = loadProviderConfigs();
  const enabledIds = configs
    .filter(c => c.enabled && c.apiKey)
    .map(c => c.providerId);

  if (enabledIds.length === 0) return null;

  // 构建消息列表: System Prompt + 聊天历史 + 新消息
  const messages: LLMMessage[] = [
    { role: 'system', content: overrideSystemPrompt || route.systemPrompt },
    ...chatHistory.slice(-20),
    { role: 'user', content: userMessage },
  ];

  // === Phase 14.2: Smart Router with Failover ===
  const router = getRouter();

  // 从 Agent 的推荐列表中找出有 Key 的候选 Providers
  const candidates = route.preferredProviders.filter(pid => enabledIds.includes(pid));
  if (candidates.length === 0) return null;

  // 通过 Router 健康评分 + 熔断器排序得到 Failover 链
  const failoverChain = router.getFailoverChain(candidates);
  if (failoverChain.length === 0) return null;

  // 记录 Failover 路径
  const attemptLog: { providerId: string; modelId: string; error?: string }[] = [];

  for (const providerId of failoverChain) {
    const config = configs.find(c => c.providerId === providerId);
    if (!config || !config.apiKey) continue;

    // 检查熔断器
    if (!router.canRequest(providerId)) {
      attemptLog.push({ providerId, modelId: '-', error: 'CIRCUIT_OPEN' });
      continue;
    }

    // 获取并发槽
    if (!router.acquireSlot(providerId)) {
      attemptLog.push({ providerId, modelId: '-', error: 'MAX_CONCURRENCY' });
      continue;
    }

    // 解析该 Provider 的最佳模型
    const provider = PROVIDERS[providerId];
    if (!provider) { router.releaseSlot(providerId); continue; }

    const modelId = route.preferredModels.find(
      mid => provider.models.some(m => m.id === mid)
    ) || config.defaultModel || provider.defaultModel;

    try {
      const response = await streamChat(
        {
          providerId,
          modelId,
          messages,
          apiKey: config.apiKey,
          endpoint: resolveProviderEndpoint(providerId, config.endpoint),
          temperature: route.temperature,
          maxTokens: route.maxTokens,
          stream: true,
          signal,
        },
        onChunk
      );

      // 成功 → 更新路由器健康指标
      router.recordSuccess(providerId, response.latencyMs);
      router.releaseSlot(providerId);

      // 在响应中附加 Failover 信息
      (response as LLMResponseWithFailover).failover = {
        success: true,
        providerId,
        modelId,
        attemptedProviders: attemptLog,
        failoverCount: attemptLog.length,
      };

      return response;
    } catch (error) {
      router.releaseSlot(providerId);
      const err = error as LLMError;

      // 用户主动中止 — 不要 failover
      if (err.code === 'TIMEOUT' && err.message === 'Request aborted') {
        throw err;
      }

      // 记录失败
      router.recordFailure(providerId, err.code, err.retryable ? 500 : 0);
      attemptLog.push({
        providerId,
        modelId,
        error: `${err.code}: ${err.message?.slice(0, 60) || 'unknown'}`,
      });

      // 非重试类错误 (�� AUTH_FAILED) 对该 provider 不重试，继续 failover
      // 重试类错误 (RATE_LIMITED, PROVIDER_ERROR) 也继续 failover
      continue;
    }
  }

  // 所有 Provider 都失败 — 降级为模板
  return null;
}

// Extended response type with failover info
export interface LLMResponseWithFailover extends LLMResponse {
  failover?: FailoverResult;
}

// ============================================================
// General Chat API (for main ChatArea — not agent-specific)
// ============================================================

const YYC3_SYSTEM_PROMPT = `You are YYC3 Core, the central AI assistant of the "YYC3 Hacker Chatbot" — a cyberpunk DevOps intelligence platform built with React 18 + TypeScript + Tailwind CSS v4, running as a pure-frontend SPA that connects to a local NAS cluster.

## Your Identity
- Name: YYC3 Core (闫宇宸 Cloud 3.0)
- Role: The "brain" of a 4-node home cluster (MacBook Pro M4 Max, iMac M4, MateBook X Pro, TerraMaster NAS F4-423)
- You are powered by whichever LLM provider the user has configured (DeepSeek, OpenAI, Anthropic, etc.)

## Platform Architecture
- 7 AI Agents: Navigator(领航员), Thinker(思想家), Prophet(先知), Bole(伯乐), Pivot(天枢), Sentinel(哨兵), Grandmaster(宗师)
- MCP (Model Context Protocol) tool integration: Figma, GitHub, Filesystem, Docker, PostgreSQL, Browser
- NAS direct connection: SQLite HTTP Proxy, Docker Engine API, Heartbeat WebSocket
- Knowledge Base: vector search, OCR/ASR multimodal, knowledge graph NER

## Capabilities
- Code generation, review, debugging, and refactoring
- DevOps guidance (Docker, CI/CD, monitoring, deployment)
- System architecture design and tech discussions
- NAS and cluster management advice
- Knowledge base queries and analysis

## Critical Rules
1. NEVER fabricate terminal/shell output. You cannot execute commands. If asked "ollama list" or "docker ps", explain that you're a chat AI and guide the user to the Console tab or terminal.
2. NEVER pretend to have direct access to the filesystem, database, or running services. You can advise, but not execute.
3. When discussing platform features, reference real module names (llm-bridge.ts, mcp-protocol.ts, agent-orchestrator.ts, etc.).
4. Respond in the same language as the user's message (Chinese/English).
5. Be concise and actionable. Use Markdown formatting.
6. If the user asks about system status, guide them to the appropriate Console tab (Dashboard, Monitoring, etc.).`;

/**
 * General-purpose streaming chat for the main ChatArea.
 * Automatically selects the best available provider.
 *
 * @returns LLMResponse or null if no provider is available
 */
export async function generalStreamChat(
  userMessage: string,
  chatHistory: LLMMessage[],
  onChunk: StreamCallback,
  signal?: AbortSignal
): Promise<LLMResponse | null> {
  const configs = loadProviderConfigs();
  const enabledConfigs = configs.filter(c => c.enabled && c.apiKey);

  if (enabledConfigs.length === 0) return null;

  // Build messages: system prompt + history + user message
  const messages: LLMMessage[] = [
    { role: 'system', content: YYC3_SYSTEM_PROMPT },
    ...chatHistory.slice(-30),
    { role: 'user', content: userMessage },
  ];

  // Use router for smart provider selection
  const router = getRouter();
  const candidateIds = enabledConfigs.map(c => c.providerId);
  const failoverChain = router.getFailoverChain(candidateIds);

  for (const providerId of failoverChain) {
    const config = enabledConfigs.find(c => c.providerId === providerId);
    if (!config) continue;

    if (!router.canRequest(providerId)) continue;
    if (!router.acquireSlot(providerId)) continue;

    const provider = PROVIDERS[providerId];
    if (!provider) { router.releaseSlot(providerId); continue; }

    const modelId = config.defaultModel || provider.defaultModel;

    try {
      const response = await streamChat(
        {
          providerId,
          modelId,
          messages,
          apiKey: config.apiKey,
          endpoint: resolveProviderEndpoint(providerId, config.endpoint),
          temperature: 0.7,
          maxTokens: 4096,
          stream: true,
          signal,
        },
        onChunk
      );

      router.recordSuccess(providerId, response.latencyMs);
      router.releaseSlot(providerId);
      return response;
    } catch (error) {
      router.releaseSlot(providerId);
      const err = error as LLMError;
      if (err.code === 'TIMEOUT' && err.message === 'Request aborted') throw err;
      router.recordFailure(providerId, err.code, err.retryable ? 500 : 0);
      continue;
    }
  }

  return null;
}

/**
 * Check if any LLM provider has a valid API key configured.
 */
export function hasConfiguredProvider(): boolean {
  const configs = loadProviderConfigs();
  return configs.some(c => c.enabled && c.apiKey);
}

// ============================================================
// Provider Health Check
// ============================================================

export interface ProviderHealthResult {
  providerId: string;
  status: 'ok' | 'error' | 'no_key';
  latencyMs?: number;
  error?: string;
  model?: string;
}

/**
 * 检测 Provider 连通性
 */
export async function checkProviderHealth(
  providerId: string,
  apiKey: string,
  endpoint?: string
): Promise<ProviderHealthResult> {
  const provider = PROVIDERS[providerId];
  if (!provider) {
    return { providerId, status: 'error', error: 'Unknown provider' };
  }

  if (!apiKey && !['ollama', 'lmstudio'].includes(providerId)) {
    return { providerId, status: 'no_key' };
  }

  const startTime = performance.now();

  try {
    // Send a minimal request to test connectivity
    const response = await chat({
      providerId,
      modelId: provider.defaultModel,
      messages: [{ role: 'user', content: 'Hi' }],
      apiKey,
      endpoint,
      maxTokens: 5,
      temperature: 0,
      stream: false,
    });

    return {
      providerId,
      status: 'ok',
      latencyMs: Math.round(performance.now() - startTime),
      model: response.model,
    };
  } catch (error) {
    const err = error as LLMError;
    return {
      providerId,
      status: 'error',
      latencyMs: Math.round(performance.now() - startTime),
      error: err.message?.slice(0, 100) || 'Unknown error',
    };
  }
}

// ============================================================
// Usage Tracking
// ============================================================

const USAGE_STORAGE_KEY = 'yyc3-llm-usage';

export interface UsageRecord {
  date: string;  // YYYY-MM-DD
  provider: string;
  model: string;
  agentId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
}

export function trackUsage(
  response: LLMResponse,
  agentId: string
): void {
  try {
    const records: UsageRecord[] = JSON.parse(
      localStorage.getItem(USAGE_STORAGE_KEY) || '[]'
    );

    const model = PROVIDERS[response.provider]?.models.find(
      m => m.id === response.model
    );

    const costUsd = model
      ? (response.usage.promptTokens / 1000 * (model.costPer1kInput || 0)) +
        (response.usage.completionTokens / 1000 * (model.costPer1kOutput || 0))
      : 0;

    records.push({
      date: new Date().toISOString().slice(0, 10),
      provider: response.provider,
      model: response.model,
      agentId,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      costUsd: Math.round(costUsd * 10000) / 10000,
      latencyMs: response.latencyMs,
    });

    // Keep last 1000 records
    const trimmed = records.slice(-1000);
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

export function getUsageSummary(): {
  totalTokens: number;
  totalCost: number;
  totalCalls: number;
  byProvider: Record<string, { tokens: number; cost: number; calls: number }>;
  byAgent: Record<string, { tokens: number; cost: number; calls: number }>;
  todayTokens: number;
  todayCost: number;
} {
  try {
    const records: UsageRecord[] = JSON.parse(
      localStorage.getItem(USAGE_STORAGE_KEY) || '[]'
    );

    const today = new Date().toISOString().slice(0, 10);
    const summary = {
      totalTokens: 0,
      totalCost: 0,
      totalCalls: records.length,
      byProvider: {} as Record<string, { tokens: number; cost: number; calls: number }>,
      byAgent: {} as Record<string, { tokens: number; cost: number; calls: number }>,
      todayTokens: 0,
      todayCost: 0,
    };

    for (const r of records) {
      summary.totalTokens += r.totalTokens;
      summary.totalCost += r.costUsd;

      if (r.date === today) {
        summary.todayTokens += r.totalTokens;
        summary.todayCost += r.costUsd;
      }

      // By provider
      if (!summary.byProvider[r.provider]) {
        summary.byProvider[r.provider] = { tokens: 0, cost: 0, calls: 0 };
      }
      summary.byProvider[r.provider].tokens += r.totalTokens;
      summary.byProvider[r.provider].cost += r.costUsd;
      summary.byProvider[r.provider].calls += 1;

      // By agent
      if (!summary.byAgent[r.agentId]) {
        summary.byAgent[r.agentId] = { tokens: 0, cost: 0, calls: 0 };
      }
      summary.byAgent[r.agentId].tokens += r.totalTokens;
      summary.byAgent[r.agentId].cost += r.costUsd;
      summary.byAgent[r.agentId].calls += 1;
    }

    summary.totalCost = Math.round(summary.totalCost * 10000) / 10000;
    summary.todayCost = Math.round(summary.todayCost * 10000) / 10000;

    return summary;
  } catch {
    return {
      totalTokens: 0, totalCost: 0, totalCalls: 0,
      byProvider: {}, byAgent: {},
      todayTokens: 0, todayCost: 0,
    };
  }
}

// ============================================================
// Helpers
// ============================================================

function mapHttpStatusToCode(status: number): LLMErrorCode {
  switch (status) {
    case 401: case 403: return 'AUTH_FAILED';
    case 429: return 'RATE_LIMITED';
    case 400: return 'CONTEXT_TOO_LONG';
    case 404: return 'MODEL_NOT_FOUND';
    default: return status >= 500 ? 'PROVIDER_ERROR' : 'UNKNOWN';
  }
}

/**
 * 粗略估算 Token 数 (当 API 不返回 usage 时)
 * 规则: ~4 chars per token (English), ~2 chars per token (Chinese)
 */
function estimateTokens(
  messages: LLMMessage[],
  completionText: string
): TokenUsage {
  const promptChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  const completionChars = completionText.length;

  // Heuristic: detect Chinese content ratio
  const allText = messages.map(m => m.content).join('') + completionText;
  const chineseRatio = (allText.match(/[\u4e00-\u9fff]/g) || []).length / Math.max(allText.length, 1);
  const charsPerToken = 4 - chineseRatio * 2; // 4 for English, 2 for Chinese

  const promptTokens = Math.ceil(promptChars / charsPerToken);
  const completionTokens = Math.ceil(completionChars / charsPerToken);

  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
  };
}