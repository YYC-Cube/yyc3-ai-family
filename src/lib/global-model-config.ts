/**
 * @file YYC³ Family-π³ 完整模型配置方案
 * @description 总指挥视角 - 协同全局模型配置
 * @author YYC³ Team
 * @version 2.0.0
 *
 * 授权模型 (有授权书):
 * - ChatGLM3-6B: 开源对话模型
 * - CodeGeeX4-ALL-9B: 代码生成专用
 * - CogAgent: GUI智能体
 * - CogVideoX-5B: 视频生成
 *
 * 配置策略:
 * 1. 本地推理优先 - 低延迟、无成本
 * 2. 云端API补充 - 高能力、复杂任务
 * 3. 授权模型专用 - 特定场景
 * 4. Agent智能路由 - 任务匹配
 */

// ============================================================
// Types
// ============================================================

export type ModelTier = 'local' | 'cloud-free' | 'cloud-paid' | 'authorized';
export type ModelCategory = 'reasoning' | 'coding' | 'conversation' | 'vision' | 'video' | 'automation';

export interface GlobalModelConfig {
  id: string;
  name: string;
  provider: string;
  tier: ModelTier;
  categories: ModelCategory[];
  contextWindow: number;
  maxOutput: number;
  supportsStreaming: boolean;
  supportsVision?: boolean;
  supportsTools?: boolean;

  // 部署信息
  deployment: {
    local?: {
      available: boolean;
      nodes: string[];
      ollamaName?: string;
    };
    cloud?: {
      available: boolean;
      endpoint: string;
      requiresAuth: boolean;
    };
  };

  // 性能指标
  performance?: {
    avgLatencyMs: number;
    p95LatencyMs: number;
    throughput: number;
    maxConcurrent: number;
  };

  // 成本信息
  pricing: {
    inputPer1M: number;
    outputPer1M: number;
    isFree: boolean;
  };

  // Agent推荐
  recommendedAgents: string[];

  // 授权信息
  authorization?: {
    company: string;
    code: string;
    validity: string;
    certificatePath?: string;
  };
}

// ============================================================
// 智谱授权模型配置 (有授权书)
// ============================================================

export const AUTHORIZED_MODELS: GlobalModelConfig[] = [
  {
    id: 'CodeGeeX4-ALL-9B',
    name: 'CodeGeeX4-ALL-9B (授权)',
    provider: 'zhipu',
    tier: 'authorized',
    categories: ['coding', 'reasoning'],
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    supportsTools: true,
    deployment: {
      local: {
        available: true,
        nodes: ['m4-max', 'imac-m4'],
        ollamaName: 'codegeex4:latest',
      },
      cloud: {
        available: true,
        endpoint: 'https://open.bigmodel.cn/api/paas/v4',
        requiresAuth: true,
      },
    },
    performance: {
      avgLatencyMs: 5300,
      p95LatencyMs: 6200,
      throughput: 25,
      maxConcurrent: 3,
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['bole', 'grandmaster'],
    authorization: {
      company: '洛阳沫言酒店管理有限公司',
      code: '202411283053152737',
      validity: '永久有效',
      certificatePath: '/Users/yanyu/YYC3-Mac-Max/智谱授权书/ZhiPu_CodeGeeX4-ALL-9B.png',
    },
  },
  {
    id: 'ChatGLM3-6B',
    name: 'ChatGLM3-6B (授权)',
    provider: 'zhipu',
    tier: 'authorized',
    categories: ['conversation', 'reasoning'],
    contextWindow: 8192,
    maxOutput: 2048,
    supportsStreaming: true,
    deployment: {
      local: {
        available: false, // 需要特殊部署
        nodes: [],
        ollamaName: 'chatglm3:6b',
      },
      cloud: {
        available: true,
        endpoint: 'https://open.bigmodel.cn/api/paas/v4',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['pivot'],
    authorization: {
      company: '洛阳沫言酒店管理有限公司',
      code: '202411283053152737',
      validity: '永久有效',
      certificatePath: '/Users/yanyu/YYC3-Mac-Max/智谱授权书/ZhiPu_ChatGLM3-6B.png',
    },
  },
  {
    id: 'CogAgent',
    name: 'CogAgent (授权)',
    provider: 'zhipu',
    tier: 'authorized',
    categories: ['vision', 'automation', 'reasoning'],
    contextWindow: 32000,
    maxOutput: 4096,
    supportsStreaming: true,
    supportsVision: true,
    supportsTools: true,
    deployment: {
      local: {
        available: false, // 需要GPU推理
        nodes: [],
      },
      cloud: {
        available: true,
        endpoint: 'https://open.bigmodel.cn/api/paas/v4',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['navigator', 'sentinel'],
    authorization: {
      company: '洛阳沫言酒店管理有限公司',
      code: '202411283053152737',
      validity: '永久有效',
      certificatePath: '/Users/yanyu/YYC3-Mac-Max/智谱授权书/ZhiPu_CogAgent.png',
    },
  },
  {
    id: 'CogVideoX-5B',
    name: 'CogVideoX-5B (授权)',
    provider: 'zhipu',
    tier: 'authorized',
    categories: ['video', 'vision'],
    contextWindow: 8192,
    maxOutput: 2048,
    supportsStreaming: true,
    deployment: {
      local: {
        available: false, // 需要GPU推理
        nodes: [],
      },
      cloud: {
        available: true,
        endpoint: 'https://open.bigmodel.cn/api/paas/v4',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['grandmaster'],
    authorization: {
      company: '洛阳沫言酒店管理有限公司',
      code: '202411283053152737',
      validity: '永久有效',
      certificatePath: '/Users/yanyu/YYC3-Mac-Max/智谱授权书/ZhiPu_CogVideoX-5B.png',
    },
  },
];

// ============================================================
// 本地推理模型 (Ollama)
// ============================================================

export const LOCAL_MODELS: GlobalModelConfig[] = [
  {
    id: 'qwen2.5:7b',
    name: 'Qwen 2.5 7B (本地)',
    provider: 'ollama',
    tier: 'local',
    categories: ['conversation', 'reasoning', 'coding'],
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    deployment: {
      local: {
        available: true,
        nodes: ['m4-max'],
        ollamaName: 'qwen2.5:7b',
      },
    },
    performance: {
      avgLatencyMs: 2800,
      p95LatencyMs: 3200,
      throughput: 45,
      maxConcurrent: 4,
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['navigator', 'thinker', 'prophet', 'pivot', 'sentinel'],
  },
  {
    id: 'glm4:9b',
    name: 'GLM-4 9B (本地)',
    provider: 'ollama',
    tier: 'local',
    categories: ['conversation', 'reasoning'],
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    deployment: {
      local: {
        available: true,
        nodes: ['imac-m4'],
        ollamaName: 'glm4:9b',
      },
    },
    performance: {
      avgLatencyMs: 5200,
      p95LatencyMs: 5800,
      throughput: 28,
      maxConcurrent: 2,
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['bole', 'pivot', 'sentinel'],
  },
  {
    id: 'phi3:mini',
    name: 'Phi-3 Mini 3.8B (本地)',
    provider: 'ollama',
    tier: 'local',
    categories: ['conversation', 'reasoning'],
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    deployment: {
      local: {
        available: true,
        nodes: ['imac-m4'],
        ollamaName: 'phi3:mini',
      },
    },
    performance: {
      avgLatencyMs: 4900,
      p95LatencyMs: 6500,
      throughput: 55,
      maxConcurrent: 3,
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['sentinel', 'pivot'],
  },
];

// ============================================================
// 云端API模型 (智谱)
// ============================================================

export const ZHIPU_CLOUD_MODELS: GlobalModelConfig[] = [
  {
    id: 'GLM-4.7',
    name: 'GLM-4.7 (云端)',
    provider: 'zhipu',
    tier: 'cloud-paid',
    categories: ['reasoning', 'coding', 'conversation'],
    contextWindow: 200000,
    maxOutput: 128000,
    supportsStreaming: true,
    supportsTools: true,
    deployment: {
      cloud: {
        available: true,
        endpoint: 'https://open.bigmodel.cn/api/paas/v4',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: false },
    recommendedAgents: ['navigator', 'thinker', 'grandmaster'],
  },
  {
    id: 'GLM-4.7-Flash',
    name: 'GLM-4.7 Flash (免费云端)',
    provider: 'zhipu',
    tier: 'cloud-free',
    categories: ['conversation', 'reasoning'],
    contextWindow: 200000,
    maxOutput: 128000,
    supportsStreaming: true,
    deployment: {
      cloud: {
        available: true,
        endpoint: 'https://open.bigmodel.cn/api/paas/v4',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['pivot', 'sentinel'],
  },
  {
    id: 'GLM-4-Long',
    name: 'GLM-4 Long (1M上下文)',
    provider: 'zhipu',
    tier: 'cloud-paid',
    categories: ['conversation', 'reasoning'],
    contextWindow: 1000000,
    maxOutput: 4096,
    supportsStreaming: true,
    deployment: {
      cloud: {
        available: true,
        endpoint: 'https://open.bigmodel.cn/api/paas/v4',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: false },
    recommendedAgents: ['pivot', 'grandmaster'],
  },
];

// ============================================================
// 云端API模型 (其他Provider)
// ============================================================

export const EXTERNAL_CLOUD_MODELS: GlobalModelConfig[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    tier: 'cloud-paid',
    categories: ['reasoning', 'coding', 'conversation', 'vision'],
    contextWindow: 128000,
    maxOutput: 16384,
    supportsStreaming: true,
    supportsVision: true,
    supportsTools: true,
    deployment: {
      cloud: {
        available: true,
        endpoint: 'https://api.openai.com/v1',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 2.5, outputPer1M: 10, isFree: false },
    recommendedAgents: ['thinker', 'grandmaster'],
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude 4 Sonnet',
    provider: 'anthropic',
    tier: 'cloud-paid',
    categories: ['reasoning', 'coding', 'conversation', 'vision'],
    contextWindow: 200000,
    maxOutput: 64000,
    supportsStreaming: true,
    supportsVision: true,
    supportsTools: true,
    deployment: {
      cloud: {
        available: true,
        endpoint: 'https://api.anthropic.com/v1',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 3, outputPer1M: 15, isFree: false },
    recommendedAgents: ['thinker', 'navigator', 'sentinel'],
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek-V3',
    provider: 'deepseek',
    tier: 'cloud-paid',
    categories: ['reasoning', 'coding', 'conversation'],
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    supportsTools: true,
    deployment: {
      cloud: {
        available: true,
        endpoint: 'https://api.deepseek.com/v1',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 0.14, outputPer1M: 0.28, isFree: false },
    recommendedAgents: ['navigator', 'bole', 'prophet'],
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek-R1',
    provider: 'deepseek',
    tier: 'cloud-paid',
    categories: ['reasoning'],
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    deployment: {
      cloud: {
        available: true,
        endpoint: 'https://api.deepseek.com/v1',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 0.55, outputPer1M: 2.2, isFree: false },
    recommendedAgents: ['thinker', 'prophet'],
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (免费)',
    provider: 'google',
    tier: 'cloud-free',
    categories: ['reasoning', 'conversation', 'vision'],
    contextWindow: 1048576,
    maxOutput: 65536,
    supportsStreaming: true,
    supportsVision: true,
    deployment: {
      cloud: {
        available: true,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
        requiresAuth: true,
      },
    },
    pricing: { inputPer1M: 0, outputPer1M: 0, isFree: true },
    recommendedAgents: ['pivot', 'prophet'],
  },
];

// ============================================================
// Agent 模型路由策略
// ============================================================

export interface AgentRoutingStrategy {
  agentId: string;
  agentName: string;
  primaryUseCase: string;
  modelPriority: {
    local: string[]; // 本地模型优先级
    authorized: string[]; // 授权模型优先级
    cloud: string[]; // 云端模型优先级
  };
  fallbackChain: string[];
  temperature: number;
  maxTokens: number;
}

export const AGENT_ROUTING_STRATEGIES: Record<string, AgentRoutingStrategy> = {
  navigator: {
    agentId: 'navigator',
    agentName: '智愈·领航员',
    primaryUseCase: '全域资源调度与路径规划',
    modelPriority: {
      local: ['qwen2.5:7b'],
      authorized: ['CodeGeeX4-ALL-9B'],
      cloud: ['GLM-4.7', 'claude-sonnet-4-20250514', 'deepseek-chat'],
    },
    fallbackChain: ['qwen2.5:7b', 'GLM-4.7-Flash', 'GLM-4.7'],
    temperature: 0.3,
    maxTokens: 4096,
  },
  thinker: {
    agentId: 'thinker',
    agentName: '洞见·思想家',
    primaryUseCase: '深度逻辑推理与决策分析',
    modelPriority: {
      local: ['qwen2.5:7b'],
      authorized: ['CodeGeeX4-ALL-9B'],
      cloud: ['claude-sonnet-4-20250514', 'deepseek-reasoner', 'gpt-4o'],
    },
    fallbackChain: ['qwen2.5:7b', 'deepseek-reasoner', 'claude-sonnet-4-20250514'],
    temperature: 0.5,
    maxTokens: 8192,
  },
  prophet: {
    agentId: 'prophet',
    agentName: '预见·先知',
    primaryUseCase: '趋势预测与风险前置',
    modelPriority: {
      local: ['qwen2.5:7b'],
      authorized: [],
      cloud: ['deepseek-reasoner', 'GLM-4.7', 'gemini-2.5-flash'],
    },
    fallbackChain: ['qwen2.5:7b', 'deepseek-reasoner', 'gemini-2.5-flash'],
    temperature: 0.4,
    maxTokens: 4096,
  },
  bole: {
    agentId: 'bole',
    agentName: '知遇·伯乐',
    primaryUseCase: '模型评估与优选匹配',
    modelPriority: {
      local: ['codegeex4:latest', 'glm4:9b'],
      authorized: ['CodeGeeX4-ALL-9B'],
      cloud: ['GLM-4.7', 'deepseek-chat'],
    },
    fallbackChain: ['codegeex4:latest', 'GLM-4.7', 'deepseek-chat'],
    temperature: 0.3,
    maxTokens: 4096,
  },
  pivot: {
    agentId: 'pivot',
    agentName: '元启·天枢',
    primaryUseCase: '核心状态管理与上下文',
    modelPriority: {
      local: ['qwen2.5:7b', 'phi3:mini'],
      authorized: ['ChatGLM3-6B'],
      cloud: ['GLM-4-Long', 'GLM-4.7-Flash', 'gemini-2.5-flash'],
    },
    fallbackChain: ['qwen2.5:7b', 'GLM-4.7-Flash', 'GLM-4-Long'],
    temperature: 0.2,
    maxTokens: 4096,
  },
  sentinel: {
    agentId: 'sentinel',
    agentName: '卫安·哨兵',
    primaryUseCase: '安全边界防护与审计',
    modelPriority: {
      local: ['qwen2.5:7b', 'phi3:mini'],
      authorized: ['CogAgent'],
      cloud: ['claude-sonnet-4-20250514', 'GLM-4.7-Flash'],
    },
    fallbackChain: ['qwen2.5:7b', 'GLM-4.7-Flash', 'claude-sonnet-4-20250514'],
    temperature: 0.1,
    maxTokens: 4096,
  },
  grandmaster: {
    agentId: 'grandmaster',
    agentName: '格物·宗师',
    primaryUseCase: '知识库构建与本体论',
    modelPriority: {
      local: ['codegeex4:latest'],
      authorized: ['CodeGeeX4-ALL-9B', 'CogVideoX-5B'],
      cloud: ['gpt-4o', 'GLM-4.7', 'claude-sonnet-4-20250514'],
    },
    fallbackChain: ['codegeex4:latest', 'GLM-4.7', 'gpt-4o'],
    temperature: 0.4,
    maxTokens: 8192,
  },
};

// ============================================================
// 全局模型注册表
// ============================================================

class GlobalModelRegistry {
  private allModels = new Map<string, GlobalModelConfig>();

  constructor() {
    this.loadModels();
  }

  private loadModels(): void {
    [
      ...AUTHORIZED_MODELS,
      ...LOCAL_MODELS,
      ...ZHIPU_CLOUD_MODELS,
      ...EXTERNAL_CLOUD_MODELS,
    ].forEach(model => {
      this.allModels.set(model.id, model);
    });
  }

  getAllModels(): GlobalModelConfig[] {
    return Array.from(this.allModels.values());
  }

  getModel(id: string): GlobalModelConfig | undefined {
    return this.allModels.get(id);
  }

  getModelsByTier(tier: ModelTier): GlobalModelConfig[] {
    return this.getAllModels().filter(m => m.tier === tier);
  }

  getModelsByCategory(category: ModelCategory): GlobalModelConfig[] {
    return this.getAllModels().filter(m => m.categories.includes(category));
  }

  getLocalAvailableModels(): GlobalModelConfig[] {
    return this.getAllModels().filter(m => m.deployment.local?.available);
  }

  getAuthorizedModels(): GlobalModelConfig[] {
    return this.getAllModels().filter(m => m.tier === 'authorized');
  }

  getAgentRoutingStrategy(agentId: string): AgentRoutingStrategy | undefined {
    return AGENT_ROUTING_STRATEGIES[agentId];
  }

  getBestModelForAgent(agentId: string, preferLocal = true): GlobalModelConfig | undefined {
    const strategy = AGENT_ROUTING_STRATEGIES[agentId];

    if (!strategy) return undefined;

    // 优先本地模型
    if (preferLocal) {
      for (const modelId of strategy.modelPriority.local) {
        const model = this.getModel(modelId);

        if (model?.deployment.local?.available) {
          return model;
        }
      }
    }

    // 回退链
    for (const modelId of strategy.fallbackChain) {
      const model = this.getModel(modelId);

      if (model) {
        if (model.deployment.local?.available || model.deployment.cloud?.available) {
          return model;
        }
      }
    }

    return undefined;
  }
}

export const globalModelRegistry = new GlobalModelRegistry();

// ============================================================
// Helper Functions
// ============================================================

export function getModelSummary(): {
  total: number;
  byTier: Record<ModelTier, number>;
  localAvailable: number;
  authorized: number;
  } {
  const models = globalModelRegistry.getAllModels();

  return {
    total: models.length,
    byTier: {
      local: models.filter(m => m.tier === 'local').length,
      'cloud-free': models.filter(m => m.tier === 'cloud-free').length,
      'cloud-paid': models.filter(m => m.tier === 'cloud-paid').length,
      authorized: models.filter(m => m.tier === 'authorized').length,
    },
    localAvailable: models.filter(m => m.deployment.local?.available).length,
    authorized: models.filter(m => m.tier === 'authorized').length,
  };
}

export function printModelMatrix(): string {
  const lines: string[] = [
    '# YYC³ 模型配置矩阵',
    '',
    '## 授权模型 (有授权书)',
    '',
    '| 模型 | 用途 | 本地可用 | 云端可用 | 推荐Agent |',
    '|------|------|----------|----------|-----------|',
  ];

  AUTHORIZED_MODELS.forEach(m => {
    const local = m.deployment.local?.available ? '✅' : '❌';
    const cloud = m.deployment.cloud?.available ? '✅' : '❌';

    lines.push(`| ${m.name} | ${m.categories.join(', ')} | ${local} | ${cloud} | ${m.recommendedAgents.join(', ')} |`);
  });

  lines.push('', '## 本地推理模型', '');
  lines.push('| 模型 | 节点 | 延迟 | 推荐Agent |');
  lines.push('|------|------|------|-----------|');

  LOCAL_MODELS.forEach(m => {
    const nodes = m.deployment.local?.nodes.join(', ') || '-';
    const latency = m.performance ? `${m.performance.avgLatencyMs}ms` : '-';

    lines.push(`| ${m.name} | ${nodes} | ${latency} | ${m.recommendedAgents.join(', ')} |`);
  });

  lines.push('', '## 云端API模型', '');
  lines.push('| 模型 | Provider | 免费 | 推荐Agent |');
  lines.push('|------|----------|------|-----------|');

  [...ZHIPU_CLOUD_MODELS, ...EXTERNAL_CLOUD_MODELS].forEach(m => {
    const free = m.pricing.isFree ? '✅' : '💰';

    lines.push(`| ${m.name} | ${m.provider} | ${free} | ${m.recommendedAgents.join(', ')} |`);
  });

  return lines.join('\n');
}
