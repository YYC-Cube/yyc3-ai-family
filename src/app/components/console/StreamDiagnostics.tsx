import {
  Play, CheckCircle2, XCircle, Loader2, Clock,
  RotateCcw, Zap, Radio, Wifi, WifiOff, Shield,
  ChevronDown, ChevronRight, Activity, Copy, Globe,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  loadProviderConfigs,
  hasConfiguredProvider,
  checkProviderHealth,
  generalStreamChat,
  type ProviderConfig,
  type ProviderHealthResult,
  type LLMMessage,
} from '@/lib/llm-bridge';
import { resolveProviderEndpoint, getProxiedProviders, isDevProxyAvailable } from '@/lib/proxy-endpoints';
import { cn } from '@/lib/utils';

// ============================================================
// Phase 28 — E2E Streaming Diagnostics Panel
//
// Provides visual diagnostics for the LLM streaming pipeline:
//   1. Provider connectivity check (health ping)
//   2. Circuit breaker status display
//   3. E2E streaming test (fire test message, display tokens)
//   4. Latency & throughput metrics
//
// Access: Console tab `stream_diagnostics` or via TestFramework
// ============================================================

type DiagPhase = 'idle' | 'checking' | 'streaming' | 'done' | 'error';

interface ProviderDiag {
  config: ProviderConfig;
  health: ProviderHealthResult | null;
  circuitState: string;
  checking: boolean;
}

interface StreamTestResult {
  providerId: string;
  model: string;
  firstTokenMs: number;
  totalMs: number;
  tokenCount: number;
  throughput: string; // tokens/sec
  outputPreview: string;
  success: boolean;
  error?: string;
}

const TEST_PROMPTS = [
  { id: 'ping', label: 'Ping (简单)', labelEn: 'Ping (Simple)', prompt: 'Reply with exactly: "YYC3 streaming OK"' },
  { id: 'count', label: '计数 (中等)', labelEn: 'Count (Medium)', prompt: 'Count from 1 to 10, each number on a new line.' },
  { id: 'code', label: '代码生成 (复杂)', labelEn: 'Code Gen (Complex)', prompt: 'Write a TypeScript function that checks if a string is a palindrome. Include JSDoc comments.' },
];

export function StreamDiagnostics() {
  const [phase, setPhase] = React.useState<DiagPhase>('idle');
  const [providers, setProviders] = React.useState<ProviderDiag[]>([]);
  const [selectedPrompt, setSelectedPrompt] = React.useState('ping');
  const [streamResult, setStreamResult] = React.useState<StreamTestResult | null>(null);
  const [streamOutput, setStreamOutput] = React.useState('');
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['providers', 'stream']));
  const abortRef = React.useRef<AbortController | null>(null);

  // Load providers on mount
  React.useEffect(() => {
    refreshProviders();
  }, []);

  const refreshProviders = () => {
    const configs = loadProviderConfigs();
    const diags: ProviderDiag[] = configs.map(config => ({
      config,
      health: null,
      circuitState: 'CLOSED',
      checking: false,
    }));

    setProviders(diags);
  };

  const checkAllHealth = async () => {
    setPhase('checking');
    const configs = loadProviderConfigs();
    const results: ProviderDiag[] = [];

    for (const config of configs) {
      setProviders(prev => prev.map(p =>
        p.config.providerId === config.providerId ? { ...p, checking: true } : p,
      ));

      const health = config.enabled && config.apiKey
        ? await checkProviderHealth(config.providerId, config.apiKey, resolveProviderEndpoint(config.providerId, config.endpoint))
        : { providerId: config.providerId, status: 'no_key' as const };

      results.push({
        config,
        health,
        circuitState: 'CLOSED',
        checking: false,
      });

      setProviders(prev => prev.map(p =>
        p.config.providerId === config.providerId
          ? { ...results.find(r => r.config.providerId === config.providerId)! }
          : p,
      ));
    }

    setProviders(results);
    setPhase('idle');
  };

  const runStreamTest = async () => {
    if (!hasConfiguredProvider()) {
      setPhase('error');
      setStreamResult({
        providerId: '-', model: '-', firstTokenMs: 0, totalMs: 0,
        tokenCount: 0, throughput: '0', outputPreview: '', success: false,
        error: 'No configured provider. Go to Settings > AI Models to add an API key.',
      });

      return;
    }

    setPhase('streaming');
    setStreamOutput('');
    setStreamResult(null);

    const prompt = TEST_PROMPTS.find(p => p.id === selectedPrompt)?.prompt ?? 'Hello';
    const history: LLMMessage[] = [];
    const abortController = new AbortController();

    abortRef.current = abortController;

    let accumulated = '';
    let tokenCount = 0;
    let firstTokenTime = 0;
    const startTime = performance.now();

    try {
      const response = await generalStreamChat(
        prompt,
        history,
        chunk => {
          if (chunk.content) {
            if (tokenCount === 0) {
              firstTokenTime = performance.now() - startTime;
            }
            tokenCount++;
            accumulated += chunk.content;
            setStreamOutput(accumulated);
          }
        },
        abortController.signal,
      );

      const totalMs = performance.now() - startTime;
      const throughput = totalMs > 0 ? ((tokenCount / totalMs) * 1000).toFixed(1) : '0';

      if (response) {
        setStreamResult({
          providerId: response.provider,
          model: response.model,
          firstTokenMs: Math.round(firstTokenTime),
          totalMs: Math.round(totalMs),
          tokenCount,
          throughput,
          outputPreview: accumulated.slice(0, 500),
          success: true,
        });
        setPhase('done');
      } else {
        setStreamResult({
          providerId: '-', model: '-', firstTokenMs: 0, totalMs: Math.round(totalMs),
          tokenCount: 0, throughput: '0', outputPreview: '', success: false,
          error: 'All providers failed. Check health status above.',
        });
        setPhase('error');
      }
    } catch (err) {
      const totalMs = performance.now() - startTime;

      setStreamResult({
        providerId: '-', model: '-', firstTokenMs: 0, totalMs: Math.round(totalMs),
        tokenCount, throughput: '0', outputPreview: accumulated, success: false,
        error: err instanceof Error ? err.message : String(err),
      });
      setPhase('error');
    }
  };

  const cancelStream = () => {
    abortRef.current?.abort();
    setPhase('idle');
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const copyOutput = () => {
    if (streamOutput) navigator.clipboard.writeText(streamOutput);
  };

  const enabledCount = providers.filter(p => p.config.enabled && p.config.apiKey).length;
  const healthyCount = providers.filter(p => p.health?.status === 'ok').length;
  const proxiedProviders = getProxiedProviders();
  const isProxyActive = proxiedProviders.length > 0;

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-black/20">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm tracking-wider text-primary">STREAM DIAGNOSTICS</h2>
            <p className="text-xs text-zinc-500">Phase 28 | E2E LLM Streaming Pipeline Verification</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Phase 35: PROXY ACTIVE badge */}
          {isProxyActive && (
            <Badge
              variant="outline"
              className="text-xs font-mono border border-sky-500/40 text-sky-400 bg-sky-500/5 gap-1"
              title={`Vite dev proxy active for: ${proxiedProviders.join(', ')}`}
            >
              <Globe className="w-3 h-3" />
              PROXY ACTIVE ({proxiedProviders.length})
            </Badge>
          )}
          <Badge variant="outline" className={cn(
            'text-xs font-mono border',
            enabledCount > 0 ? 'border-emerald-500/30 text-emerald-400' : 'border-zinc-700 text-zinc-500',
          )}>
            {enabledCount} provider{enabledCount !== 1 ? 's' : ''} enabled
          </Badge>
          <Button
            size="sm" variant="outline"
            onClick={refreshProviders}
            className="gap-1.5 border-zinc-700 text-xs"
          >
            <RotateCcw className="w-3 h-3" /> Refresh
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-4 pr-2">

          {/* Section 1: Provider Health */}
          <Card className="bg-zinc-900/40 border-zinc-800/50">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('providers')}>
              <CardTitle className="text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {expandedSections.has('providers') ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Provider Health & Circuit Breaker Status
                </span>
                <span className="text-zinc-500 font-mono">
                  {healthyCount}/{enabledCount} healthy
                </span>
              </CardTitle>
            </CardHeader>
            {expandedSections.has('providers') && (
              <CardContent className="pt-0">
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm" variant="outline"
                    onClick={checkAllHealth}
                    disabled={phase === 'checking'}
                    className="gap-1.5 border-zinc-700 text-xs w-fit mb-2"
                  >
                    {phase === 'checking'
                      ? <><Loader2 className="w-3 h-3 animate-spin" /> Checking...</>
                      : <><Zap className="w-3 h-3" /> Check All Providers</>
                    }
                  </Button>

                  {providers.length === 0 ? (
                    <p className="text-xs text-zinc-600 italic">No providers configured. Visit Settings &gt; AI Models.</p>
                  ) : (
                    <div className="grid gap-2">
                      {providers.map(p => (
                        <div
                          key={p.config.providerId}
                          className={cn(
                            'flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono',
                            !p.config.enabled ? 'bg-zinc-900/20 border-zinc-800/30 opacity-50' :
                            p.health?.status === 'ok' ? 'bg-emerald-500/5 border-emerald-500/20' :
                            p.health?.status === 'error' ? 'bg-red-500/5 border-red-500/20' :
                            'bg-zinc-900/30 border-zinc-800/40',
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {p.checking ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                            ) : p.health?.status === 'ok' ? (
                              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                            ) : p.health?.status === 'error' ? (
                              <WifiOff className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                              <Activity className="w-3.5 h-3.5 text-zinc-500" />
                            )}
                            <span className="text-zinc-300">{p.config.providerId}</span>
                            {isDevProxyAvailable(p.config.providerId) && (
                              <span className="text-[9px] text-sky-400/70 border border-sky-500/20 rounded px-1 py-px" title="Routed via Vite dev proxy">
                                PROXY
                              </span>
                            )}
                            {p.config.defaultModel && (
                              <span className="text-zinc-600">{p.config.defaultModel}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {p.health?.latencyMs !== undefined && (
                              <span className="text-zinc-500">{p.health.latencyMs}ms</span>
                            )}
                            <Badge variant="outline" className={cn(
                              'text-[10px] font-mono',
                              p.circuitState === 'CLOSED' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400',
                            )}>
                              CB: {p.circuitState}
                            </Badge>
                            <Badge variant="outline" className={cn(
                              'text-[10px] font-mono',
                              p.config.enabled ? 'border-emerald-500/30 text-emerald-400' : 'border-zinc-700 text-zinc-500',
                            )}>
                              {p.config.enabled ? 'ON' : 'OFF'}
                            </Badge>
                            {p.health?.error && (
                              <span className="text-red-400 max-w-[200px] truncate" title={p.health.error}>
                                {p.health.error}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 2: E2E Stream Test */}
          <Card className="bg-zinc-900/40 border-zinc-800/50">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('stream')}>
              <CardTitle className="text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {expandedSections.has('stream') ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  E2E Streaming Test
                </span>
                {streamResult && (
                  <span className={cn('font-mono', streamResult.success ? 'text-emerald-400' : 'text-red-400')}>
                    {streamResult.success ? 'PASS' : 'FAIL'}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            {expandedSections.has('stream') && (
              <CardContent className="pt-0">
                <div className="flex flex-col gap-3">
                  {/* Prompt selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500">Test prompt:</span>
                    {TEST_PROMPTS.map(tp => (
                      <button
                        key={tp.id}
                        onClick={() => setSelectedPrompt(tp.id)}
                        className={cn(
                          'px-2.5 py-1 rounded text-xs font-mono border transition-all',
                          selectedPrompt === tp.id
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-zinc-900/30 text-zinc-500 border-zinc-800/30 hover:text-zinc-300',
                        )}
                      >
                        {tp.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Run/Cancel button */}
                  <div className="flex items-center gap-2">
                    {phase === 'streaming' ? (
                      <Button size="sm" variant="destructive" onClick={cancelStream} className="gap-1.5 text-xs">
                        <XCircle className="w-3 h-3" /> Cancel
                      </Button>
                    ) : (
                      <Button
                        size="sm" variant="outline"
                        onClick={runStreamTest}
                        disabled={phase === 'checking'}
                        className="gap-1.5 border-primary/30 text-primary text-xs hover:bg-primary/10"
                      >
                        <Play className="w-3 h-3" /> Run Stream Test
                      </Button>
                    )}
                    {phase === 'streaming' && (
                      <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Streaming... ({streamOutput.length} chars)
                      </span>
                    )}
                  </div>

                  {/* Stream output */}
                  {(streamOutput || phase === 'streaming') && (
                    <div className="relative">
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <button
                          onClick={copyOutput}
                          className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                          title="Copy output"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <pre className={cn(
                        'p-3 rounded-lg border text-xs font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto',
                        'bg-zinc-950/50 border-zinc-800/50 text-zinc-300',
                        phase === 'streaming' && 'border-amber-500/20',
                      )}>
                        {streamOutput || '(waiting for tokens...)'}
                        {phase === 'streaming' && <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse ml-0.5" />}
                      </pre>
                    </div>
                  )}

                  {/* Results metrics */}
                  {streamResult && (
                    <div className={cn(
                      'p-3 rounded-lg border text-xs font-mono',
                      streamResult.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20',
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {streamResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={streamResult.success ? 'text-emerald-400' : 'text-red-400'}>
                          {streamResult.success ? 'E2E Stream Test PASSED' : 'E2E Stream Test FAILED'}
                        </span>
                      </div>

                      {streamResult.error ? (
                        <p className="text-red-400/80">{streamResult.error}</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="flex flex-col">
                            <span className="text-zinc-600">Provider</span>
                            <span className="text-zinc-300">{streamResult.providerId}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-zinc-600">Model</span>
                            <span className="text-zinc-300">{streamResult.model}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-zinc-600">First Token</span>
                            <span className="text-amber-400">{streamResult.firstTokenMs}ms</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-zinc-600">Total Time</span>
                            <span className="text-zinc-300">{streamResult.totalMs}ms</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-zinc-600">Chunks</span>
                            <span className="text-zinc-300">{streamResult.tokenCount}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-zinc-600">Throughput</span>
                            <span className="text-emerald-400">{streamResult.throughput} tok/s</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 3: Pipeline Architecture Reference */}
          <Card className="bg-zinc-900/40 border-zinc-800/50">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('architecture')}>
              <CardTitle className="text-xs flex items-center gap-2">
                {expandedSections.has('architecture') ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                Streaming Pipeline Architecture
              </CardTitle>
            </CardHeader>
            {expandedSections.has('architecture') && (
              <CardContent className="pt-0">
                <pre className="text-[11px] font-mono text-zinc-500 leading-relaxed whitespace-pre-wrap">
                  {`User Input
  -> handleSendMessage()
    -> hasConfiguredProvider() check
    -> Build LLMMessage[] (system + last 30 msgs + user)
    -> Create empty AI placeholder message
    -> generalStreamChat(text, history, onChunk, signal)
      -> LLMRouter.getFailoverChain(enabledProviders)
        -> [Circuit Breaker Gate per provider]
        -> streamChat() -> Provider SSE endpoint
        -> onChunk callback: accumulated += chunk.content
        -> updateLastAiMessage(accumulated) -> Zustand
      -> [on error: recordFailure -> try next provider]
    -> trackUsage(response, 'general')
    -> Log: provider / model / latency / tokens`}
                </pre>
              </CardContent>
            )}
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
}
