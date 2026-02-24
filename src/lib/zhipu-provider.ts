/**
 * @file YYC³ Family-π³ Zhipu Provider Configuration
 * @description 智谱AI服务配置 - 终身商业授权
 * @author YYC³ Team
 * @version 1.0.0
 */

// ============================================================
// Types
// ============================================================

export interface ZhipuModelMeta {
  id: string;
  name: string;
  isFree: boolean;
  isAuthorized: boolean;
  contextWindow?: number;
  maxOutput?: number;
  supportsThinking?: boolean;
  supportsTools?: boolean;
  supportsVision?: boolean;
  usesCodingEndpoint?: boolean;
}

export interface ZhipuAuthorization {
  company: string;
  code: string;
  validity: string;
}

// ============================================================
// Constants
// ============================================================

export const ZHIPU_AUTHORIZATION: ZhipuAuthorization = {
  company: 'YanYuCloudCube (YYC³)',
  code: 'Zhipu-GLM5-Lifetime-2024',
  validity: '2024-02-21 至 2025-02-20',
};

export const ZHIPU_API_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
export const ZHIPU_CODING_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export const ZHIPU_MODELS: ZhipuModelMeta[] = [
  {
    id: 'codegeex4',
    name: 'CodeGeeX4-ALL-9B',
    isFree: false,
    isAuthorized: true,
    contextWindow: 128000,
    maxOutput: 8192,
  },
  {
    id: 'chatglm3-6b',
    name: 'ChatGLM3-6B',
    isFree: true,
    isAuthorized: true,
    contextWindow: 8192,
    maxOutput: 4096,
  },
  {
    id: 'glm-4-flash',
    name: 'GLM-4-Flash',
    isFree: true,
    isAuthorized: false,
    contextWindow: 128000,
    maxOutput: 4096,
  },
  {
    id: 'glm-4-plus',
    name: 'GLM-4-Plus',
    isFree: false,
    isAuthorized: false,
    contextWindow: 128000,
    maxOutput: 8192,
  },
];

// ============================================================
// Functions
// ============================================================

export function getZhipuAuthorizedModels(): ZhipuModelMeta[] {
  return ZHIPU_MODELS.filter(model => model.isAuthorized);
}

export function getZhipuFreeModels(): ZhipuModelMeta[] {
  return ZHIPU_MODELS.filter(model => model.isFree);
}

export function getZhipuProviderSummary(): {
  totalModels: number;
  authorizedModels: number;
  freeModels: number;
  apiEndpoint: string;
  thinkingCapable: number;
  visionCapable: number;
  toolCapable: number;
} {
  return {
    totalModels: ZHIPU_MODELS.length,
    authorizedModels: getZhipuAuthorizedModels().length,
    freeModels: getZhipuFreeModels().length,
    apiEndpoint: ZHIPU_API_ENDPOINT,
    thinkingCapable: ZHIPU_MODELS.filter(m => m.supportsThinking).length,
    visionCapable: ZHIPU_MODELS.filter(m => m.supportsVision).length,
    toolCapable: ZHIPU_MODELS.filter(m => m.supportsTools).length,
  };
}
