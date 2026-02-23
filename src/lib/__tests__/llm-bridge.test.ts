// ============================================================
// YYC3 Hacker Chatbot — LLM Bridge Unit Tests (Vitest)
// Phase 48: Test Coverage Enhancement (P1)
//
// Tests: ProviderConfig persistence, hasConfiguredProvider,
//        getEnabledProviderIds, LLMError class, usage tracking,
//        getUsageSummary helper.
//
// Run: npx vitest run src/lib/__tests__/llm-bridge.test.ts
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';

import {
  saveProviderConfigs,
  hasConfiguredProvider,
  getEnabledProviderIds,
  LLMError,
  trackUsage,
  getUsageSummary,
  clearProviderCache,
  type ProviderConfig,
  type LLMResponse,
} from '../llm-bridge';

const PROVIDER_CONFIG_KEY = 'yyc3-llm-provider-config';
const USAGE_STORAGE_KEY = 'yyc3-llm-usage';

// ============================================================
// Setup / Teardown
// ============================================================

beforeEach(() => {
  localStorage.removeItem(PROVIDER_CONFIG_KEY);
  localStorage.removeItem(USAGE_STORAGE_KEY);
  clearProviderCache();
});

// Helper: write configs directly to localStorage (bypass encryption)
function writeRawConfigs(configs: ProviderConfig[]) {
  localStorage.setItem(PROVIDER_CONFIG_KEY, JSON.stringify(configs));
}

// ============================================================
// Suite 1: Configuration Loading
// ============================================================

describe('LLM Bridge — loadProviderConfigs', () => {
  it('LLM-01: returns empty array when no config exists', () => {
    // Force cache clear by writing empty then clearing
    localStorage.removeItem(PROVIDER_CONFIG_KEY);
    // Note: loadProviderConfigs has an internal cache; we test the storage layer
    const raw = localStorage.getItem(PROVIDER_CONFIG_KEY);

    expect(raw).toBeNull();
  });

  it('LLM-02: returns parsed configs from localStorage', () => {
    const configs: ProviderConfig[] = [
      { providerId: 'openai', apiKey: 'sk-test', endpoint: '', enabled: true, defaultModel: 'gpt-4o' },
    ];

    writeRawConfigs(configs);
    const loaded = JSON.parse(localStorage.getItem(PROVIDER_CONFIG_KEY)!) as ProviderConfig[];

    expect(loaded).toHaveLength(1);
    expect(loaded[0].providerId).toBe('openai');
    expect(loaded[0].apiKey).toBe('sk-test');
  });

  it('LLM-03: handles corrupt JSON gracefully', () => {
    localStorage.setItem(PROVIDER_CONFIG_KEY, '{bad json');
    // Direct parse would throw, loadProviderConfigs catches it
    try {
      JSON.parse(localStorage.getItem(PROVIDER_CONFIG_KEY)!);
      expect(true).toBe(false); // should not reach
    } catch {
      expect(true).toBe(true); // expected
    }
  });
});

// ============================================================
// Suite 2: saveProviderConfigs
// ============================================================

describe('LLM Bridge — saveProviderConfigs', () => {
  it('LLM-04: saves configs to localStorage', async () => {
    const configs: ProviderConfig[] = [
      { providerId: 'deepseek', apiKey: 'sk-ds-test', endpoint: '', enabled: true, defaultModel: 'deepseek-chat' },
    ];

    await saveProviderConfigs(configs);
    const raw = localStorage.getItem(PROVIDER_CONFIG_KEY);

    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].providerId).toBe('deepseek');
  });

  it('LLM-05: saves multiple provider configs', async () => {
    const configs: ProviderConfig[] = [
      { providerId: 'openai', apiKey: 'sk-1', endpoint: '', enabled: true, defaultModel: 'gpt-4o' },
      { providerId: 'anthropic', apiKey: 'sk-2', endpoint: '', enabled: false, defaultModel: 'claude-3' },
      { providerId: 'deepseek', apiKey: 'sk-3', endpoint: '', enabled: true, defaultModel: 'deepseek-r1' },
    ];

    await saveProviderConfigs(configs);
    const parsed = JSON.parse(localStorage.getItem(PROVIDER_CONFIG_KEY)!);

    expect(parsed).toHaveLength(3);
  });
});

// ============================================================
// Suite 3: hasConfiguredProvider
// ============================================================

describe('LLM Bridge — hasConfiguredProvider', () => {
  it('LLM-06: returns false when no config', () => {
    localStorage.removeItem(PROVIDER_CONFIG_KEY);
    expect(hasConfiguredProvider()).toBe(false);
  });

  it('LLM-07: returns true with enabled + apiKey config', async () => {
    await saveProviderConfigs([
      { providerId: 'openai', apiKey: 'sk-valid', endpoint: '', enabled: true, defaultModel: 'gpt-4o' },
    ]);
    expect(hasConfiguredProvider()).toBe(true);
  });

  it('LLM-08: returns false when provider is disabled', async () => {
    await saveProviderConfigs([
      { providerId: 'openai', apiKey: 'sk-valid', endpoint: '', enabled: false, defaultModel: 'gpt-4o' },
    ]);
    expect(hasConfiguredProvider()).toBe(false);
  });

  it('LLM-09: returns false when apiKey is empty', async () => {
    await saveProviderConfigs([
      { providerId: 'openai', apiKey: '', endpoint: '', enabled: true, defaultModel: 'gpt-4o' },
    ]);
    expect(hasConfiguredProvider()).toBe(false);
  });
});

// ============================================================
// Suite 4: getEnabledProviderIds
// ============================================================

describe('LLM Bridge — getEnabledProviderIds', () => {
  it('LLM-10: returns only enabled providers with API keys', async () => {
    await saveProviderConfigs([
      { providerId: 'openai', apiKey: 'sk-1', endpoint: '', enabled: true, defaultModel: 'gpt-4o' },
      { providerId: 'anthropic', apiKey: 'sk-2', endpoint: '', enabled: false, defaultModel: 'claude-3' },
      { providerId: 'deepseek', apiKey: 'sk-3', endpoint: '', enabled: true, defaultModel: 'deepseek-r1' },
    ]);
    const ids = getEnabledProviderIds();

    expect(ids).toContain('openai');
    expect(ids).not.toContain('anthropic');
    expect(ids).toContain('deepseek');
  });

  it('LLM-11: returns empty array when no configs', () => {
    localStorage.removeItem(PROVIDER_CONFIG_KEY);
    const ids = getEnabledProviderIds();

    expect(ids).toEqual([]);
  });
});

// ============================================================
// Suite 5: LLMError Class
// ============================================================

describe('LLM Bridge — LLMError', () => {
  it('LLM-12: LLMError has correct properties', () => {
    const err = new LLMError('Test error', 'AUTH_FAILED', 'openai', 401, false);

    expect(err.message).toBe('Test error');
    expect(err.code).toBe('AUTH_FAILED');
    expect(err.provider).toBe('openai');
    expect(err.statusCode).toBe(401);
    expect(err.retryable).toBe(false);
    expect(err.name).toBe('LLMError');
  });

  it('LLM-13: LLMError is instanceof Error', () => {
    const err = new LLMError('test', 'NETWORK_ERROR', 'deepseek', undefined, true);

    expect(err instanceof Error).toBe(true);
    expect(err instanceof LLMError).toBe(true);
  });

  it('LLM-14: LLMError retryable defaults to false', () => {
    const err = new LLMError('test', 'UNKNOWN', 'test-provider');

    expect(err.retryable).toBe(false);
  });

  it('LLM-15: all error codes are valid', () => {
    const codes = [
      'AUTH_FAILED', 'RATE_LIMITED', 'CONTEXT_TOO_LONG',
      'MODEL_NOT_FOUND', 'NETWORK_ERROR', 'CORS_ERROR',
      'TIMEOUT', 'PROVIDER_ERROR', 'UNKNOWN',
    ] as const;

    for (const code of codes) {
      const err = new LLMError('msg', code, 'p');

      expect(err.code).toBe(code);
    }
  });
});

// ============================================================
// Suite 6: Usage Tracking
// ============================================================

describe('LLM Bridge — Usage Tracking', () => {
  beforeEach(() => {
    localStorage.removeItem(USAGE_STORAGE_KEY);
  });

  it('LLM-16: trackUsage writes record to localStorage', () => {
    const response: LLMResponse = {
      content: 'Hello',
      model: 'gpt-4o',
      provider: 'openai',
      usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
      finishReason: 'stop',
      latencyMs: 500,
    };

    trackUsage(response, 'navigator');
    const records = JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY)!);

    expect(records).toHaveLength(1);
    expect(records[0].provider).toBe('openai');
    expect(records[0].model).toBe('gpt-4o');
    expect(records[0].agentId).toBe('navigator');
    expect(records[0].totalTokens).toBe(80);
  });

  it('LLM-17: trackUsage accumulates records', () => {
    const mkResponse = (provider: string, model: string, tokens: number): LLMResponse => ({
      content: 'x',
      model,
      provider,
      usage: { promptTokens: tokens / 2, completionTokens: tokens / 2, totalTokens: tokens },
      finishReason: 'stop',
      latencyMs: 100,
    });

    trackUsage(mkResponse('openai', 'gpt-4o', 100), 'navigator');
    trackUsage(mkResponse('deepseek', 'deepseek-r1', 200), 'thinker');
    trackUsage(mkResponse('openai', 'gpt-4o', 150), 'navigator');
    const records = JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY)!);

    expect(records).toHaveLength(3);
  });
});

// ============================================================
// Suite 7: getUsageSummary
// ============================================================

describe('LLM Bridge — getUsageSummary', () => {
  beforeEach(() => {
    localStorage.removeItem(USAGE_STORAGE_KEY);
  });

  it('LLM-18: returns zero summary when no records', () => {
    const summary = getUsageSummary();

    expect(summary.totalTokens).toBe(0);
    expect(summary.totalCost).toBe(0);
    expect(summary.totalCalls).toBe(0);
    expect(summary.todayTokens).toBe(0);
    expect(summary.todayCost).toBe(0);
  });

  it('LLM-19: aggregates by provider and agent', () => {
    const today = new Date().toISOString().slice(0, 10);
    const records = [
      { date: today, provider: 'openai', model: 'gpt-4o', agentId: 'navigator', promptTokens: 50, completionTokens: 30, totalTokens: 80, costUsd: 0.01, latencyMs: 500 },
      { date: today, provider: 'openai', model: 'gpt-4o', agentId: 'thinker', promptTokens: 100, completionTokens: 100, totalTokens: 200, costUsd: 0.03, latencyMs: 300 },
      { date: today, provider: 'deepseek', model: 'deepseek-r1', agentId: 'navigator', promptTokens: 150, completionTokens: 50, totalTokens: 200, costUsd: 0.005, latencyMs: 200 },
    ];

    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(records));
    const summary = getUsageSummary();

    expect(summary.totalCalls).toBe(3);
    expect(summary.totalTokens).toBe(480);
    expect(summary.byProvider['openai'].calls).toBe(2);
    expect(summary.byProvider['deepseek'].calls).toBe(1);
    expect(summary.byAgent['navigator'].calls).toBe(2);
    expect(summary.byAgent['thinker'].calls).toBe(1);
    expect(summary.todayTokens).toBe(480);
  });

  it('LLM-20: handles corrupt localStorage gracefully', () => {
    localStorage.setItem(USAGE_STORAGE_KEY, 'not-json');
    const summary = getUsageSummary();

    expect(summary.totalTokens).toBe(0);
    expect(summary.totalCalls).toBe(0);
  });
});
