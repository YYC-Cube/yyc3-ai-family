/**
 * @file YYC³ Family-π³ Model Configuration Manager
 * @description 模型配置管理器 - 支持智谱授权模型和Qwen本地模型
 * @author YYC³ Team
 * @version 1.0.0
 *
 * 功能:
 * - 统一管理云端和本地模型配置
 * - 支持智谱授权模型 (GLM-5, GLM-4.7, CodeGeeX4)
 * - 支持Qwen本地模型 (Qwen 2.5 7B/72B)
 * - 模型能力评估与路由
 * - 成本计算与优化建议
 */

import { type ProviderModel } from './llm-providers';

// ============================================================
// Types
// ============================================================

export interface ModelCapability {
  id: string;
  name: string;
  category: 'reasoning' | 'coding' | 'conversation' | 'vision' | 'long-context';
  score: number; // 0-100
  description: string;
}

export interface ModelPricing {
  inputPer1M: number; // USD per 1M tokens
  outputPer1M: number; // USD per 1M tokens
  isFree: boolean;
}

export interface ModelPerformance {
  avgLatencyMs: number;
  p95LatencyMs: number;
  throughput: number; // tokens per second
  maxConcurrent: number;
}

export interface EnhancedModelConfig extends ProviderModel {
  provider: string;
  capabilities: ModelCapability[];
  pricing: ModelPricing;
  performance?: ModelPerformance;
  recommendedAgents: string[];
  localAvailable?: boolean;
  quantization?: string;
}

export interface ModelRecommendation {
  model: EnhancedModelConfig;
  score: number;
  reasons: string[];
  warnings?: string[];
}

// ============================================================
// 智谱授权模型配置
// 终身商业授权模型 (有授权文件):
// - CodeGeeX4: 代码生成专用模型
// - CogAgent: GUI智能体模型
// - CogVideo: 视频生成模型
// - GLM-3-6B: 开源对话模型
// ============================================================

export const ZHIPU_AUTHORIZED_MODELS: EnhancedModelConfig[] = [
  {
    id: 'CodeGeeX4',
    name: 'CodeGeeX4 (代码生成)',
    provider: 'zhipu',
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    supportsTools: true,
    capabilities: [
      { id: 'coding', name: '代码生成', category: 'coding', score: 96, description: '专业代码生成，多语言支持' },
      { id: 'reasoning', name: '代码推理', category: 'reasoning', score: 88, description: '代码逻辑推理' },
      { id: 'conversation', name: '技术对话', category: 'conversation', score: 85, description: '技术问题解答' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: false },
    recommendedAgents: ['bole', 'grandmaster'],
  },
  {
    id: 'CogAgent',
    name: 'CogAgent (GUI智能体)',
    provider: 'zhipu',
    contextWindow: 32000,
    maxOutput: 4096,
    supportsStreaming: true,
    supportsVision: true,
    supportsTools: true,
    capabilities: [
      { id: 'vision', name: '视觉理解', category: 'vision', score: 94, description: 'GUI界面理解与操作' },
      { id: 'reasoning', name: '操作推理', category: 'reasoning', score: 90, description: '界面操作决策' },
      { id: 'coding', name: '自动化脚本', category: 'coding', score: 85, description: 'GUI自动化脚本生成' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: false },
    recommendedAgents: ['navigator', 'sentinel'],
  },
  {
    id: 'CogVideo',
    name: 'CogVideo (视频生成)',
    provider: 'zhipu',
    contextWindow: 8192,
    maxOutput: 2048,
    supportsStreaming: true,
    capabilities: [
      { id: 'vision', name: '视频生成', category: 'vision', score: 92, description: '文本到视频生成' },
      { id: 'conversation', name: '创意描述', category: 'conversation', score: 80, description: '视频创意理解' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: false },
    recommendedAgents: ['grandmaster'],
  },
  {
    id: 'GLM-3-6B',
    name: 'GLM-3-6B (开源)',
    provider: 'zhipu',
    contextWindow: 8192,
    maxOutput: 2048,
    supportsStreaming: true,
    localAvailable: false,
    capabilities: [
      { id: 'conversation', name: '对话', category: 'conversation', score: 82, description: '通用对话能力' },
      { id: 'reasoning', name: '推理', category: 'reasoning', score: 75, description: '基础推理' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: [],
  },
  {
    id: 'qwen2.5:7b',
    name: 'Qwen 2.5 7B (中文友好)',
    provider: 'ollama',
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    free: true,
    localAvailable: true,
    quantization: 'Q4_K_M',
    capabilities: [
      { id: 'conversation', name: '中文对话', category: 'conversation', score: 88, description: '中文理解优秀，自然语言处理' },
      { id: 'reasoning', name: '推理', category: 'reasoning', score: 80, description: '中等推理能力' },
      { id: 'coding', name: '代码生成', category: 'coding', score: 78, description: '基础代码生成' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    performance: { avgLatencyMs: 2800, p95LatencyMs: 3200, throughput: 45, maxConcurrent: 4 },
    recommendedAgents: ['pivot', 'sentinel', 'navigator'],
  },
  {
    id: 'GLM-4.7',
    name: 'GLM-4.7',
    provider: 'zhipu',
    contextWindow: 200000,
    maxOutput: 128000,
    supportsStreaming: true,
    supportsTools: true,
    capabilities: [
      { id: 'reasoning', name: '深度推理', category: 'reasoning', score: 90, description: '优秀推理能力' },
      { id: 'coding', name: '代码生成', category: 'coding', score: 88, description: '代码生成能力强' },
      { id: 'conversation', name: '对话理解', category: 'conversation', score: 94, description: '中文理解优秀' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: false },
    recommendedAgents: ['navigator', 'bole', 'pivot'],
  },
  {
    id: 'GLM-4.7-Flash',
    name: 'GLM-4.7 Flash (免费)',
    provider: 'zhipu',
    contextWindow: 200000,
    maxOutput: 128000,
    supportsStreaming: true,
    free: true,
    capabilities: [
      { id: 'conversation', name: '对话理解', category: 'conversation', score: 88, description: '快速响应' },
      { id: 'coding', name: '代码生成', category: 'coding', score: 80, description: '基础代码生成' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['pivot', 'sentinel'],
  },
  {
    id: 'GLM-4-Long',
    name: 'GLM-4 Long (1M 上下文)',
    provider: 'zhipu',
    contextWindow: 1000000,
    maxOutput: 4096,
    supportsStreaming: true,
    capabilities: [
      { id: 'long-context', name: '超长文本', category: 'long-context', score: 98, description: '1M上下文窗口' },
      { id: 'conversation', name: '对话理解', category: 'conversation', score: 85, description: '长文本对话' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: false },
    recommendedAgents: ['pivot', 'grandmaster'],
  },
];

// ============================================================
// Qwen 本地模型配置
// ============================================================

export const QWEN_LOCAL_MODELS: EnhancedModelConfig[] = [
  {
    id: 'qwen2.5:7b',
    name: 'Qwen 2.5 7B',
    provider: 'ollama',
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    free: true,
    localAvailable: true,
    quantization: 'Q4_K_M',
    capabilities: [
      { id: 'reasoning', name: '推理', category: 'reasoning', score: 78, description: '中等推理能力' },
      { id: 'coding', name: '代码生成', category: 'coding', score: 75, description: '基础代码生成' },
      { id: 'conversation', name: '对话', category: 'conversation', score: 82, description: '流畅对话' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    performance: { avgLatencyMs: 2800, p95LatencyMs: 3200, throughput: 45, maxConcurrent: 4 },
    recommendedAgents: ['navigator', 'thinker', 'prophet'],
  },
  {
    id: 'qwen2.5:72b',
    name: 'Qwen 2.5 72B',
    provider: 'ollama',
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    free: true,
    localAvailable: false, // 需要更大显存
    capabilities: [
      { id: 'reasoning', name: '深度推理', category: 'reasoning', score: 92, description: '强大推理能力' },
      { id: 'coding', name: '代码生成', category: 'coding', score: 90, description: '高质量代码' },
      { id: 'conversation', name: '对话', category: 'conversation', score: 94, description: '优秀对话' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['thinker', 'grandmaster'],
  },
  {
    id: 'codegeex4:latest',
    name: 'CodeGeeX4-ALL-9B',
    provider: 'ollama',
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    free: true,
    localAvailable: true,
    quantization: 'Q4_0',
    capabilities: [
      { id: 'coding', name: '代码生成', category: 'coding', score: 88, description: '专业代码生成' },
      { id: 'reasoning', name: '推理', category: 'reasoning', score: 75, description: '代码推理' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    performance: { avgLatencyMs: 5300, p95LatencyMs: 6200, throughput: 25, maxConcurrent: 3 },
    recommendedAgents: ['bole', 'grandmaster'],
  },
  {
    id: 'glm4:9b',
    name: 'GLM-4 9B (本地)',
    provider: 'ollama',
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    free: true,
    localAvailable: true,
    quantization: 'Q4_0',
    capabilities: [
      { id: 'conversation', name: '对话', category: 'conversation', score: 85, description: '中文对话优秀' },
      { id: 'reasoning', name: '推理', category: 'reasoning', score: 80, description: '良好推理' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    performance: { avgLatencyMs: 5200, p95LatencyMs: 5800, throughput: 28, maxConcurrent: 2 },
    recommendedAgents: ['bole', 'pivot', 'sentinel'],
  },
  {
    id: 'phi3:mini',
    name: 'Phi-3 Mini 3.8B',
    provider: 'ollama',
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    free: true,
    localAvailable: true,
    quantization: 'Q4_0',
    capabilities: [
      { id: 'conversation', name: '对话', category: 'conversation', score: 75, description: '快速响应' },
      { id: 'reasoning', name: '推理', category: 'reasoning', score: 70, description: '基础推理' },
    ],
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    performance: { avgLatencyMs: 4900, p95LatencyMs: 6500, throughput: 55, maxConcurrent: 3 },
    recommendedAgents: ['sentinel', 'pivot'],
  },
];

// ============================================================
// Model Registry
// ============================================================

class ModelConfigRegistry {
  private models = new Map<string, EnhancedModelConfig>();
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;

    // 注册智谱授权模型
    ZHIPU_AUTHORIZED_MODELS.forEach(model => {
      this.models.set(`${model.provider}:${model.id}`, model);
    });

    // 注册Qwen本地模型
    QWEN_LOCAL_MODELS.forEach(model => {
      this.models.set(`${model.provider}:${model.id}`, model);
    });

    this.initialized = true;
  }

  getAllModels(): EnhancedModelConfig[] {
    this.initialize();

    return Array.from(this.models.values());
  }

  getModel(provider: string, modelId: string): EnhancedModelConfig | undefined {
    this.initialize();

    return this.models.get(`${provider}:${modelId}`);
  }

  getModelsByProvider(provider: string): EnhancedModelConfig[] {
    this.initialize();

    return this.getAllModels().filter(m => m.provider === provider);
  }

  getLocalModels(): EnhancedModelConfig[] {
    this.initialize();

    return this.getAllModels().filter(m => m.provider === 'ollama' && m.localAvailable);
  }

  getModelsForAgent(agentId: string): EnhancedModelConfig[] {
    this.initialize();

    return this.getAllModels().filter(m => m.recommendedAgents.includes(agentId));
  }

  recommendModels(
    task: 'reasoning' | 'coding' | 'conversation' | 'vision' | 'long-context',
    constraints: {
      maxLatencyMs?: number;
      requireLocal?: boolean;
      preferFree?: boolean;
    } = {},
  ): ModelRecommendation[] {
    this.initialize();
    const recommendations: ModelRecommendation[] = [];

    for (const model of this.getAllModels()) {
      const capability = model.capabilities.find(c => c.category === task);

      if (!capability) continue;

      // 检查约束
      if (constraints.requireLocal && !model.localAvailable) continue;
      if (constraints.maxLatencyMs && model.performance && model.performance.p95LatencyMs > constraints.maxLatencyMs) continue;
      if (constraints.preferFree && !model.pricing.isFree) {
        // 非免费模型降低优先级
      }

      const score = this.calculateScore(model, task, constraints);
      const reasons: string[] = [];
      const warnings: string[] = [];

      // 生成推荐理由
      reasons.push(`${capability.name}能力评分: ${capability.score}/100`);
      if (model.pricing.isFree) reasons.push('免费使用');
      if (model.localAvailable) reasons.push('本地可用，无网络延迟');
      if (model.performance) {
        reasons.push(`平均延迟: ${model.performance.avgLatencyMs}ms`);
        if (model.performance.p95LatencyMs > 10000) {
          warnings.push('P95延迟较高，不适合实时交互');
        }
      }

      recommendations.push({ model, score, reasons, warnings });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private calculateScore(
    model: EnhancedModelConfig,
    task: 'reasoning' | 'coding' | 'conversation' | 'vision' | 'long-context',
    constraints: { maxLatencyMs?: number; requireLocal?: boolean; preferFree?: boolean },
  ): number {
    const capability = model.capabilities.find(c => c.category === task);

    if (!capability) return 0;

    let score = capability.score;

    // 免费加分
    if (model.pricing.isFree || constraints.preferFree) score += 10;

    // 本地可用加分
    if (model.localAvailable) score += 5;

    // 延迟惩罚
    if (model.performance && constraints.maxLatencyMs) {
      const latencyRatio = model.performance.p95LatencyMs / constraints.maxLatencyMs;

      if (latencyRatio > 1) score -= 20;
      else if (latencyRatio > 0.8) score -= 10;
    }

    // 上下文窗口加分
    if (model.contextWindow >= 200000) score += 5;
    if (model.contextWindow >= 1000000) score += 10;

    return Math.min(100, Math.max(0, score));
  }
}

export const modelRegistry = new ModelConfigRegistry();

// ============================================================
// Helper Functions
// ============================================================

export function getBestModelForAgent(agentId: string): EnhancedModelConfig | undefined {
  const models = modelRegistry.getModelsForAgent(agentId);

  if (models.length === 0) return undefined;

  // 优先选择本地可用的模型
  const localModels = models.filter(m => m.localAvailable);

  if (localModels.length > 0) {
    return localModels.sort((a, b) => {
      const aScore = a.capabilities[0]?.score || 0;
      const bScore = b.capabilities[0]?.score || 0;

      return bScore - aScore;
    })[0];
  }

  return models[0];
}

export function estimateCost(
  model: EnhancedModelConfig,
  inputTokens: number,
  outputTokens: number,
): number {
  if (model.pricing.isFree) return 0;
  const inputCost = (inputTokens / 1000000) * model.pricing.inputPer1M;
  const outputCost = (outputTokens / 1000000) * model.pricing.outputPer1M;

  return inputCost + outputCost;
}

export function formatModelInfo(model: EnhancedModelConfig): string {
  const lines = [
    `模型: ${model.name}`,
    `Provider: ${model.provider}`,
    `上下文窗口: ${(model.contextWindow / 1000).toFixed(0)}K tokens`,
    `最大输出: ${(model.maxOutput / 1000).toFixed(0)}K tokens`,
    `免费: ${model.pricing.isFree ? '是' : '否'}`,
  ];

  if (model.performance) {
    lines.push(`平均延迟: ${model.performance.avgLatencyMs}ms`);
    lines.push(`P95延迟: ${model.performance.p95LatencyMs}ms`);
  }

  if (model.capabilities.length > 0) {
    lines.push('能力评分:');
    model.capabilities.forEach(c => {
      lines.push(`  - ${c.name}: ${c.score}/100`);
    });
  }

  return lines.join('\n');
}
