// ============================================================
// YYC3 Hacker Chatbot — Smart LLM Router
// Phase 14.2: Dynamic Routing + Circuit Breaker + Auto Failover
//
// 设计原则:
//   1. 健康评分驱动路由 (HealthScore 0-100)
//   2. 三态熔断器 (CLOSED → OPEN → HALF_OPEN)
//   3. 自动 Failover 链 (Provider A → B → C → Template)
//   4. 指数退避重试 (仅针对 retryable 错误)
//   5. 实时负载感知 (并发计数 + 延迟滑动窗口)
//
// 调用链路 (Phase 14.2 升级):
//   Agent UI → llm-router.ts → [Circuit Breaker Check]
//                              → [Health Score Sort]
//                              → llm-bridge.streamChat()
//                              → [Failover on Error]
//                              → [Update Health Metrics]
//                              ↓ (all providers failed)
//                              → Template Response
// ============================================================

import type { LLMErrorCode } from './llm-bridge';

// ============================================================
// Circuit Breaker
// ============================================================

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number; // errors before OPEN (default: 3)
  recoveryTimeMs: number; // cooldown in OPEN before HALF_OPEN (default: 30s)
  successThreshold: number; // successes in HALF_OPEN before CLOSED (default: 1)
  monitorWindowMs: number; // sliding window for failure counting (default: 60s)
}

const DEFAULT_CB_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  recoveryTimeMs: 30_000,
  successThreshold: 1,
  monitorWindowMs: 60_000,
};

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  successCount: number; // for HALF_OPEN testing
  lastFailureTime: number;
  lastStateChange: number;
  recentErrors: { time: number; code: LLMErrorCode }[];
}

// ============================================================
// Health Score
// ============================================================

export interface ProviderHealthScore {
  providerId: string;
  score: number; // 0-100
  circuitState: CircuitState;
  avgLatencyMs: number;
  successRate: number; // 0.0-1.0
  totalRequests: number;
  recentErrors: number;
  activeConcurrency: number;
  lastUsed: number;
}

interface LatencySample {
  time: number;
  latencyMs: number;
  success: boolean;
  errorCode?: LLMErrorCode;
}

// ============================================================
// Router Class
// ============================================================

const ROUTER_STATE_KEY = 'yyc3-llm-router-state';
const MAX_SAMPLES = 50; // per-provider latency window
const MAX_CONCURRENCY = 3; // per-provider concurrent limit
const SCORE_DECAY_MS = 300_000; // health score error decay: 5 min

export class LLMRouter {
  private circuits = new Map<string, CircuitBreakerState>();
  private samples = new Map<string, LatencySample[]>();
  private concurrency = new Map<string, number>();
  private config: CircuitBreakerConfig;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = { ...DEFAULT_CB_CONFIG, ...config };
    this.loadState();
  }

  // ==========================
  // Circuit Breaker
  // ==========================

  private getCircuit(providerId: string): CircuitBreakerState {
    if (!this.circuits.has(providerId)) {
      this.circuits.set(providerId, {
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastFailureTime: 0,
        lastStateChange: Date.now(),
        recentErrors: [],
      });
    }

    return this.circuits.get(providerId)!;
  }

  /**
   * 检查 Provider 是否允许请求通过
   */
  canRequest(providerId: string): boolean {
    const cb = this.getCircuit(providerId);
    const now = Date.now();

    switch (cb.state) {
      case 'CLOSED':
        return true;

      case 'OPEN': {
        // Check if recovery time has passed
        const elapsed = now - cb.lastStateChange;

        if (elapsed >= this.config.recoveryTimeMs) {
          cb.state = 'HALF_OPEN';
          cb.lastStateChange = now;
          cb.successCount = 0;
          this.saveState();

          return true; // Allow one test request
        }

        return false;
      }

      case 'HALF_OPEN':
        // In HALF_OPEN, allow limited requests
        return (this.concurrency.get(providerId) || 0) < 1;

      default:
        return true;
    }
  }

  /**
   * 记录请求成功
   */
  recordSuccess(providerId: string, latencyMs: number): void {
    const cb = this.getCircuit(providerId);
    const now = Date.now();

    // Add sample
    this.addSample(providerId, { time: now, latencyMs, success: true });

    // Clean old errors outside window
    cb.recentErrors = cb.recentErrors.filter(
      e => now - e.time < this.config.monitorWindowMs,
    );

    switch (cb.state) {
      case 'CLOSED':
        // Reset failure count on success
        cb.failureCount = Math.max(0, cb.failureCount - 1);
        break;

      case 'HALF_OPEN':
        cb.successCount += 1;
        if (cb.successCount >= this.config.successThreshold) {
          cb.state = 'CLOSED';
          cb.failureCount = 0;
          cb.lastStateChange = now;
        }
        break;

      case 'OPEN':
        // Shouldn't happen, but handle gracefully
        cb.state = 'HALF_OPEN';
        cb.lastStateChange = now;
        break;
    }

    this.saveState();
  }

  /**
   * 记录请求失败
   */
  recordFailure(providerId: string, errorCode: LLMErrorCode, latencyMs: number): void {
    const cb = this.getCircuit(providerId);
    const now = Date.now();

    // Add sample
    this.addSample(providerId, { time: now, latencyMs, success: false, errorCode });

    // Track error
    cb.recentErrors.push({ time: now, code: errorCode });
    cb.recentErrors = cb.recentErrors.filter(
      e => now - e.time < this.config.monitorWindowMs,
    );

    cb.lastFailureTime = now;

    switch (cb.state) {
      case 'CLOSED':
        cb.failureCount += 1;
        // Non-retryable errors (AUTH) should open circuit faster
        const threshold = (errorCode === 'AUTH_FAILED' || errorCode === 'MODEL_NOT_FOUND')
          ? 1
          : this.config.failureThreshold;

        if (cb.failureCount >= threshold) {
          cb.state = 'OPEN';
          cb.lastStateChange = now;
        }
        break;

      case 'HALF_OPEN':
        // Test failed → back to OPEN with extended cooldown
        cb.state = 'OPEN';
        cb.lastStateChange = now;
        break;

      case 'OPEN':
        // Already open, just update timestamp
        break;
    }

    this.saveState();
  }

  // ==========================
  // Concurrency Tracking
  // ==========================

  acquireSlot(providerId: string): boolean {
    const current = this.concurrency.get(providerId) || 0;

    if (current >= MAX_CONCURRENCY) return false;
    this.concurrency.set(providerId, current + 1);

    return true;
  }

  releaseSlot(providerId: string): void {
    const current = this.concurrency.get(providerId) || 0;

    this.concurrency.set(providerId, Math.max(0, current - 1));
  }

  // ==========================
  // Health Score
  // ==========================

  getHealthScore(providerId: string): ProviderHealthScore {
    const cb = this.getCircuit(providerId);
    const providerSamples = this.samples.get(providerId) || [];
    const now = Date.now();

    // Filter to recent samples (last 5 minutes)
    const recentSamples = providerSamples.filter(s => now - s.time < SCORE_DECAY_MS);

    // Calculate metrics
    const totalRequests = recentSamples.length;
    const successSamples = recentSamples.filter(s => s.success);
    const successRate = totalRequests > 0 ? successSamples.length / totalRequests : 1.0;
    const avgLatencyMs = successSamples.length > 0
      ? successSamples.reduce((sum, s) => sum + s.latencyMs, 0) / successSamples.length
      : 0;

    // Calculate score
    let score = 100;

    // Circuit breaker penalty
    if (cb.state === 'OPEN') score -= 80;
    else if (cb.state === 'HALF_OPEN') score -= 30;

    // Error rate penalty
    score -= Math.round((1 - successRate) * 40);

    // Latency penalty (above 1000ms starts penalizing)
    if (avgLatencyMs > 1000) {
      score -= Math.min(20, Math.round((avgLatencyMs - 1000) / 500));
    }

    // Concurrency pressure
    const concurrency = this.concurrency.get(providerId) || 0;

    if (concurrency >= MAX_CONCURRENCY) score -= 15;
    else if (concurrency > 0) score -= concurrency * 3;

    // Recent errors boost penalty
    const recentErrors = cb.recentErrors.filter(
      e => now - e.time < this.config.monitorWindowMs,
    );

    score -= recentErrors.length * 5;

    // Clamp
    score = Math.max(0, Math.min(100, score));

    return {
      providerId,
      score,
      circuitState: cb.state,
      avgLatencyMs: Math.round(avgLatencyMs),
      successRate: Math.round(successRate * 100) / 100,
      totalRequests,
      recentErrors: recentErrors.length,
      activeConcurrency: concurrency,
      lastUsed: recentSamples.length > 0 ? recentSamples[recentSamples.length - 1].time : 0,
    };
  }

  /**
   * 获取所有 Provider 的健康评分
   */
  getAllHealthScores(): ProviderHealthScore[] {
    const allProviders = new Set<string>();

    this.circuits.forEach((_, k) => allProviders.add(k));
    this.samples.forEach((_, k) => allProviders.add(k));

    return Array.from(allProviders)
      .map(pid => this.getHealthScore(pid))
      .sort((a, b) => b.score - a.score);
  }

  // ==========================
  // Smart Routing
  // ==========================

  /**
   * 从候选 Provider 列表中选择最优路由
   * 基于: 健康评分 × 熔断器状态 × 并发负载 × 优先级权重
   *
   * @param candidates - 候选 Provider IDs (按优先级排序)
   * @returns 排好序的可用 Provider IDs
   */
  rankProviders(candidates: string[]): string[] {
    const scored = candidates.map((pid, index) => {
      const health = this.getHealthScore(pid);
      const canReq = this.canRequest(pid);

      // Priority weight: first candidate gets 10 bonus, decaying
      const priorityBonus = Math.max(0, 10 - index * 3);

      return {
        providerId: pid,
        effectiveScore: canReq ? health.score + priorityBonus : -1,
        health,
      };
    });

    return scored
      .filter(s => s.effectiveScore > 0)
      .sort((a, b) => b.effectiveScore - a.effectiveScore)
      .map(s => s.providerId);
  }

  /**
   * 获取 Failover 链
   * 返回按评分排序的 Provider 列表，排除已熔断的
   */
  getFailoverChain(candidates: string[]): string[] {
    return this.rankProviders(candidates);
  }

  // ==========================
  // Manual Controls
  // ==========================

  /**
   * 手动重置 Provider 的熔断器
   */
  resetCircuit(providerId: string): void {
    this.circuits.set(providerId, {
      state: 'CLOSED',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      lastStateChange: Date.now(),
      recentErrors: [],
    });
    this.saveState();
  }

  /**
   * 手动重置所有熔断器
   */
  resetAll(): void {
    this.circuits.clear();
    this.samples.clear();
    this.concurrency.clear();
    this.clearState();
  }

  /**
   * 获取路由器状态摘要 (用于 UI 显示)
   */
  getRouterSummary(): RouterSummary {
    const scores = this.getAllHealthScores();
    const healthy = scores.filter(s => s.circuitState === 'CLOSED' && s.score >= 50);
    const degraded = scores.filter(s => s.circuitState === 'HALF_OPEN' || (s.circuitState === 'CLOSED' && s.score < 50));
    const broken = scores.filter(s => s.circuitState === 'OPEN');

    return {
      totalProviders: scores.length,
      healthyCount: healthy.length,
      degradedCount: degraded.length,
      brokenCount: broken.length,
      overallHealth: scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
        : 100,
      providers: scores,
    };
  }

  // ==========================
  // Internal Helpers
  // ==========================

  private addSample(providerId: string, sample: LatencySample): void {
    if (!this.samples.has(providerId)) {
      this.samples.set(providerId, []);
    }
    const arr = this.samples.get(providerId)!;

    arr.push(sample);

    // Trim to max
    if (arr.length > MAX_SAMPLES) {
      arr.splice(0, arr.length - MAX_SAMPLES);
    }
  }

  // ==========================
  // Persistence
  // ==========================

  private saveState(): void {
    try {
      const data: Record<string, {
        circuit: CircuitBreakerState;
        samples: LatencySample[];
      }> = {};

      this.circuits.forEach((cb, pid) => {
        data[pid] = {
          circuit: cb,
          samples: (this.samples.get(pid) || []).slice(-20), // Save only recent
        };
      });

      localStorage.setItem(ROUTER_STATE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  }

  private loadState(): void {
    try {
      const raw = localStorage.getItem(ROUTER_STATE_KEY);

      if (!raw) return;

      const data = JSON.parse(raw) as Record<string, {
        circuit: CircuitBreakerState;
        samples: LatencySample[];
      }>;

      const now = Date.now();

      for (const [pid, entry] of Object.entries(data)) {
        // If circuit was OPEN and enough time has passed, reset to HALF_OPEN
        if (entry.circuit.state === 'OPEN') {
          const elapsed = now - entry.circuit.lastStateChange;

          if (elapsed >= this.config.recoveryTimeMs) {
            entry.circuit.state = 'HALF_OPEN';
            entry.circuit.lastStateChange = now;
            entry.circuit.successCount = 0;
          }
        }

        this.circuits.set(pid, entry.circuit);
        this.samples.set(pid, entry.samples || []);
      }
    } catch { /* ignore */ }
  }

  private clearState(): void {
    try { localStorage.removeItem(ROUTER_STATE_KEY); } catch { /* ignore */ }
  }
}

// ============================================================
// Types
// ============================================================

export interface RouterSummary {
  totalProviders: number;
  healthyCount: number;
  degradedCount: number;
  brokenCount: number;
  overallHealth: number; // 0-100
  providers: ProviderHealthScore[];
}

export interface FailoverResult {
  success: boolean;
  providerId: string;
  modelId: string;
  attemptedProviders: { providerId: string; error?: string }[];
  failoverCount: number;
}

// ============================================================
// Singleton Instance
// ============================================================

let _routerInstance: LLMRouter | null = null;

export function getRouter(): LLMRouter {
  if (!_routerInstance) {
    _routerInstance = new LLMRouter();
  }

  return _routerInstance;
}

/**
 * 重置路由器实例 (用于测试或配置变更后)
 */
export function resetRouter(): void {
  if (_routerInstance) {
    _routerInstance.resetAll();
  }
  _routerInstance = null;
}
