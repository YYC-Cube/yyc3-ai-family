/**
 * @file YYC³ Family-π³ Inference Router
 * @description 推理矩阵路由器 - 实现小型模型推理矩阵
 * @author YYC³ Team
 * @version 1.0.0
 *
 * 功能:
 * - 多节点负载均衡
 * - 模型智能路由
 * - 并发控制
 * - 延迟优化
 * - 故障转移
 * - 性能监控
 */

import { AGENT_ROUTES } from './llm-providers';


// ============================================================
// Types
// ============================================================

export interface InferenceNode {
  id: string;
  name: string;
  host: string;
  port: number;
  weight: number;
  maxConcurrent: number;
  currentLoad: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastHealthCheck: number;
  avgLatencyMs: number;
  models: string[];
}

export interface InferenceRequest {
  agentId: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
}

export interface InferenceResult {
  success: boolean;
  response?: string;
  model: string;
  node: string;
  latencyMs: number;
  tokensUsed?: {
    input: number;
    output: number;
  };
  error?: string;
  timestamp: number;
}

export interface InferenceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  throughput: number;
  errorRate: number;
  nodeMetrics: Record<string, NodeMetrics>;
}

export interface NodeMetrics {
  requests: number;
  avgLatencyMs: number;
  errorRate: number;
  currentLoad: number;
}

// ============================================================
// Node Registry
// ============================================================

const DEFAULT_NODES: InferenceNode[] = [
  {
    id: 'm4-max',
    name: 'MacBook Pro M4 Max',
    host: 'localhost',
    port: 11434,
    weight: 0.7,
    maxConcurrent: 4,
    currentLoad: 0,
    status: 'healthy',
    lastHealthCheck: Date.now(),
    avgLatencyMs: 2800,
    models: ['qwen2.5:7b', 'codegeex4:latest', 'glm4:9b', 'glm-3-6b'],
  },
  {
    id: 'imac-m4',
    name: 'iMac M4',
    host: '192.168.3.77',
    port: 11434,
    weight: 0.3,
    maxConcurrent: 2,
    currentLoad: 0,
    status: 'healthy',
    lastHealthCheck: Date.now(),
    avgLatencyMs: 5200,
    models: ['glm4:9b', 'phi3:mini', 'codegeex4:latest', 'glm-3-6b'],
  },
];

// ============================================================
// Inference Router Class
// ============================================================

export class InferenceRouter {
  private nodes = new Map<string, InferenceNode>();
  private metrics: InferenceMetrics;
  private healthCheckInterval?: ReturnType<typeof setInterval>;

  constructor(nodes: InferenceNode[] = DEFAULT_NODES) {
    nodes.forEach(node => this.nodes.set(node.id, node));

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatencyMs: 0,
      p95LatencyMs: 0,
      throughput: 0,
      errorRate: 0,
      nodeMetrics: {},
    };

    nodes.forEach(node => {
      this.metrics.nodeMetrics[node.id] = {
        requests: 0,
        avgLatencyMs: 0,
        errorRate: 0,
        currentLoad: 0,
      };
    });
  }

  async route(request: InferenceRequest): Promise<InferenceResult> {
    const startTime = Date.now();

    this.metrics.totalRequests++;

    try {
      // 1. 选择最优节点
      const node = this.selectNode(request);

      if (!node) {
        throw new Error('No available nodes');
      }

      // 2. 选择最优模型
      const model = this.selectModel(request.agentId, node);

      if (!model) {
        throw new Error(`No model available for agent: ${request.agentId}`);
      }

      // 3. 执行推理
      const result = await this.executeInference(node, model, request);

      // 4. 更新指标
      this.updateMetrics(node.id, Date.now() - startTime, true);

      return result;
    } catch (error) {
      this.metrics.failedRequests++;

      return {
        success: false,
        model: 'unknown',
        node: 'unknown',
        latencyMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      };
    }
  }

  private selectNode(request: InferenceRequest): InferenceNode | undefined {
    const availableNodes = Array.from(this.nodes.values()).filter(
      node => node.status !== 'unhealthy' && node.currentLoad < node.maxConcurrent,
    );

    if (availableNodes.length === 0) {
      return undefined;
    }

    // 高优先级任务优先选择主节点
    if (request.priority === 'high') {
      const primaryNode = availableNodes.find(n => n.id === 'm4-max');

      if (primaryNode && primaryNode.status === 'healthy') {
        return primaryNode;
      }
    }

    // 基于权重和负载的选择
    const scoredNodes = availableNodes.map(node => ({
      node,
      score: this.calculateNodeScore(node, request),
    }));

    scoredNodes.sort((a, b) => b.score - a.score);

    return scoredNodes[0].node;
  }

  private calculateNodeScore(node: InferenceNode, request: InferenceRequest): number {
    let score = 100;

    // 负载惩罚
    const loadRatio = node.currentLoad / node.maxConcurrent;

    score -= loadRatio * 30;

    // 延迟惩罚
    if (node.avgLatencyMs > 5000) {
      score -= 20;
    } else if (node.avgLatencyMs > 3000) {
      score -= 10;
    }

    // 权重加成
    score += node.weight * 20;

    // 健康状态
    if (node.status === 'degraded') {
      score -= 15;
    }

    // 温度参数影响（低温度=高精度，优先选择低延迟节点）
    if (request.temperature !== undefined && request.temperature < 0.3) {
      if (node.avgLatencyMs < 3000) {
        score += 10;
      }
    }

    return score;
  }

  private selectModel(agentId: string, node: InferenceNode): string | undefined {
    const agentRoute = AGENT_ROUTES[agentId];

    if (!agentRoute) {
      return node.models[0];
    }

    // 查找节点支持的推荐模型
    for (const modelId of agentRoute.preferredModels) {
      if (node.models.includes(modelId)) {
        return modelId;
      }
    }

    // 回退到节点默认模型
    return node.models[0];
  }

  private async executeInference(
    node: InferenceNode,
    modelId: string,
    request: InferenceRequest,
  ): Promise<InferenceResult> {
    const startTime = Date.now();

    // 增加负载
    node.currentLoad++;

    try {
      const url = `http://${node.host}:${node.port}/api/generate`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelId,
          prompt: request.prompt,
          stream: false,
          options: {
            temperature: request.temperature ?? 0.7,
            num_predict: request.maxTokens ?? 2048,
          },
        }),
        signal: request.timeout
          ? AbortSignal.timeout(request.timeout)
          : AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        response: data.response || '',
        model: modelId,
        node: node.id,
        latencyMs,
        tokensUsed: {
          input: data.prompt_eval_count || 0,
          output: data.eval_count || 0,
        },
        timestamp: Date.now(),
      };
    } finally {
      // 减少负载
      node.currentLoad--;
    }
  }

  private updateMetrics(nodeId: string, latencyMs: number, success: boolean): void {
    const nodeMetrics = this.metrics.nodeMetrics[nodeId];

    if (!nodeMetrics) return;

    nodeMetrics.requests++;
    nodeMetrics.avgLatencyMs =
      (nodeMetrics.avgLatencyMs * (nodeMetrics.requests - 1) + latencyMs) / nodeMetrics.requests;

    if (!success) {
      nodeMetrics.errorRate =
        (nodeMetrics.errorRate * (nodeMetrics.requests - 1) + 1) / nodeMetrics.requests;
    }

    this.metrics.successfulRequests++;
    this.metrics.avgLatencyMs =
      (this.metrics.avgLatencyMs * (this.metrics.totalRequests - 1) + latencyMs) /
      this.metrics.totalRequests;
  }

  // ============================================================
  // Health Check
  // ============================================================

  startHealthCheck(intervalMs = 30000): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllNodesHealth();
    }, intervalMs);
  }

  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  private async checkAllNodesHealth(): Promise<void> {
    const checks = Array.from(this.nodes.values()).map(node => this.checkNodeHealth(node));

    await Promise.allSettled(checks);
  }

  private async checkNodeHealth(node: InferenceNode): Promise<void> {
    try {
      const url = `http://${node.host}:${node.port}/api/tags`;

      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        node.status = 'healthy';
        node.lastHealthCheck = Date.now();
      } else {
        node.status = 'degraded';
      }
    } catch {
      node.status = 'unhealthy';
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  getNodes(): InferenceNode[] {
    return Array.from(this.nodes.values());
  }

  getNode(nodeId: string): InferenceNode | undefined {
    return this.nodes.get(nodeId);
  }

  getMetrics(): InferenceMetrics {
    return { ...this.metrics };
  }

  addNode(node: InferenceNode): void {
    this.nodes.set(node.id, node);
    this.metrics.nodeMetrics[node.id] = {
      requests: 0,
      avgLatencyMs: 0,
      errorRate: 0,
      currentLoad: 0,
    };
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    delete this.metrics.nodeMetrics[nodeId];
  }

  updateNodeWeight(nodeId: string, weight: number): void {
    const node = this.nodes.get(nodeId);

    if (node) {
      node.weight = Math.max(0, Math.min(1, weight));
    }
  }
}

// ============================================================
// Singleton Instance
// ============================================================

export const inferenceRouter = new InferenceRouter();

// ============================================================
// Helper Functions
// ============================================================

export async function quickInference(
  agentId: string,
  prompt: string,
  options: Partial<InferenceRequest> = {},
): Promise<string> {
  const result = await inferenceRouter.route({
    agentId,
    prompt,
    ...options,
  });

  if (!result.success) {
    throw new Error(result.error || 'Inference failed');
  }

  return result.response || '';
}

export function getBestNodeForAgent(agentId: string): InferenceNode | undefined {
  const nodes = inferenceRouter.getNodes();
  const agentRoute = AGENT_ROUTES[agentId];

  if (!agentRoute) {
    return nodes.find(n => n.status === 'healthy');
  }

  // 查找支持推荐模型的节点
  for (const modelId of agentRoute.preferredModels) {
    const node = nodes.find(n =>
      n.status === 'healthy' &&
      n.models.includes(modelId) &&
      n.currentLoad < n.maxConcurrent,
    );

    if (node) return node;
  }

  return nodes.find(n => n.status === 'healthy' && n.currentLoad < n.maxConcurrent);
}

export function getInferenceMatrixStatus(): {
  nodes: InferenceNode[];
  metrics: InferenceMetrics;
  recommendations: string[];
  } {
  const nodes = inferenceRouter.getNodes();
  const metrics = inferenceRouter.getMetrics();
  const recommendations: string[] = [];

  // 生成优化建议
  nodes.forEach(node => {
    if (node.status === 'unhealthy') {
      recommendations.push(`节点 ${node.name} 不可用，请检查连接`);
    }
    if (node.currentLoad >= node.maxConcurrent * 0.8) {
      recommendations.push(`节点 ${node.name} 负载过高 (${node.currentLoad}/${node.maxConcurrent})`);
    }
    if (node.avgLatencyMs > 10000) {
      recommendations.push(`节点 ${node.name} 延迟过高 (${node.avgLatencyMs}ms)`);
    }
  });

  if (metrics.errorRate > 0.1) {
    recommendations.push(`整体错误率过高 (${(metrics.errorRate * 100).toFixed(1)}%)`);
  }

  return { nodes, metrics, recommendations };
}
