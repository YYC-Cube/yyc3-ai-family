// ============================================================
// YYC3 Hacker Chatbot — Ollama Local LLM Auto-Discovery
// Phase 23: Local Model Integration
//
// Automatically discover and manage local Ollama models:
// - Probe Ollama API at configurable endpoint
// - List available models via /api/tags
// - Check running models via /api/ps
// - Pull new models via /api/pull
// - Generate completions via /api/generate
// - Auto-register discovered models in provider registry
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  OllamaModelInfo,
  OllamaTagsResponse,
  OllamaRunningModel,
  OllamaProcessResponse,
  OllamaConnectionStatus,
} from './types';

// ============================================================
// Configuration
// ============================================================

const OLLAMA_CONFIG_KEY = 'yyc3-ollama-config';

export interface OllamaConfig {
  endpoint: string;       // default: http://localhost:11434
  autoDiscover: boolean;  // auto-discover on mount
  pollInterval: number;   // ms, 0 = no polling
}

const DEFAULT_CONFIG: OllamaConfig = {
  endpoint: 'http://localhost:11434',
  autoDiscover: true,
  pollInterval: 30000, // 30s
};

export function loadOllamaConfig(): OllamaConfig {
  try {
    const raw = localStorage.getItem(OLLAMA_CONFIG_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

export function saveOllamaConfig(config: OllamaConfig): void {
  try {
    localStorage.setItem(OLLAMA_CONFIG_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

// ============================================================
// Ollama API Client
// ============================================================

async function ollamaFetch<T>(
  endpoint: string,
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${endpoint.replace(/\/$/, '')}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Ollama API ${res.status}: ${await res.text()}`);
    }

    return await res.json() as T;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ============================================================
// Public API Functions
// ============================================================

export async function ollamaListModels(endpoint: string): Promise<OllamaModelInfo[]> {
  const res = await ollamaFetch<OllamaTagsResponse>(endpoint, '/api/tags');
  return res.models || [];
}

export async function ollamaListRunning(endpoint: string): Promise<OllamaRunningModel[]> {
  try {
    const res = await ollamaFetch<OllamaProcessResponse>(endpoint, '/api/ps');
    return res.models || [];
  } catch {
    return [];
  }
}

export async function ollamaPing(endpoint: string): Promise<boolean> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/tags`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export interface OllamaPullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

export async function ollamaPullModel(
  endpoint: string,
  modelName: string,
  onProgress?: (progress: OllamaPullProgress) => void,
  signal?: AbortSignal
): Promise<boolean> {
  const url = `${endpoint.replace(/\/$/, '')}/api/pull`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
      signal,
    });

    if (!res.ok || !res.body) return false;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const progress = JSON.parse(line) as OllamaPullProgress;
          onProgress?.(progress);
        } catch { /* skip */ }
      }
    }

    return true;
  } catch {
    return false;
  }
}

export async function ollamaDeleteModel(
  endpoint: string,
  modelName: string
): Promise<boolean> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/api/delete`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ollamaGenerate(
  endpoint: string,
  model: string,
  prompt: string,
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const url = `${endpoint.replace(/\/$/, '')}/api/generate`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: true }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama generate failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const data = JSON.parse(line);
        if (data.response) {
          result += data.response;
          onChunk?.(data.response);
        }
      } catch { /* skip */ }
    }
  }

  return result;
}

// ============================================================
// React Hook
// ============================================================

export interface UseOllamaDiscoveryResult {
  status: OllamaConnectionStatus;
  models: OllamaModelInfo[];
  runningModels: OllamaRunningModel[];
  config: OllamaConfig;
  error: string | null;
  // Actions
  refresh: () => Promise<void>;
  updateConfig: (cfg: Partial<OllamaConfig>) => void;
  pullModel: (name: string) => Promise<boolean>;
  deleteModel: (name: string) => Promise<boolean>;
  generate: (model: string, prompt: string, onChunk?: (text: string) => void) => Promise<string>;
}

export function useOllamaDiscovery(): UseOllamaDiscoveryResult {
  const [config, setConfig] = useState<OllamaConfig>(loadOllamaConfig);
  const [status, setStatus] = useState<OllamaConnectionStatus>('checking');
  const [models, setModels] = useState<OllamaModelInfo[]>([]);
  const [runningModels, setRunningModels] = useState<OllamaRunningModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const discover = useCallback(async () => {
    setStatus('checking');
    setError(null);

    try {
      const reachable = await ollamaPing(config.endpoint);
      if (!reachable) {
        setStatus('disconnected');
        setModels([]);
        setRunningModels([]);
        return;
      }

      const [modelList, running] = await Promise.all([
        ollamaListModels(config.endpoint),
        ollamaListRunning(config.endpoint),
      ]);

      setModels(modelList);
      setRunningModels(running);
      setStatus('connected');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setStatus('error');
    }
  }, [config.endpoint]);

  // Auto-discover on mount
  useEffect(() => {
    if (config.autoDiscover) {
      discover();
    }
  }, [config.autoDiscover, discover]);

  // Polling
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (config.pollInterval > 0 && config.autoDiscover) {
      pollRef.current = setInterval(discover, config.pollInterval);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [config.pollInterval, config.autoDiscover, discover]);

  const updateConfig = useCallback((update: Partial<OllamaConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...update };
      saveOllamaConfig(next);
      return next;
    });
  }, []);

  const pullModel = useCallback(async (name: string): Promise<boolean> => {
    return ollamaPullModel(config.endpoint, name);
  }, [config.endpoint]);

  const deleteModel = useCallback(async (name: string): Promise<boolean> => {
    const ok = await ollamaDeleteModel(config.endpoint, name);
    if (ok) {
      setModels(prev => prev.filter(m => m.name !== name));
    }
    return ok;
  }, [config.endpoint]);

  const generate = useCallback(async (
    model: string,
    prompt: string,
    onChunk?: (text: string) => void
  ): Promise<string> => {
    return ollamaGenerate(config.endpoint, model, prompt, onChunk);
  }, [config.endpoint]);

  return {
    status,
    models,
    runningModels,
    config,
    error,
    refresh: discover,
    updateConfig,
    pullModel,
    deleteModel,
    generate,
  };
}
