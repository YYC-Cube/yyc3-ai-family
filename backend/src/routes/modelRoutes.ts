/**
 * @file 模型配置API路由
 * @description 提供模型配置、Agent路由策略、授权验证等API
 * @author YYC³ Team
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';

import {
  globalModelRegistry,
  getModelSummary,
  AUTHORIZED_MODELS,
  AGENT_ROUTING_STRATEGIES,
  printModelMatrix,
} from '../../../src/lib/global-model-config';

const router = Router();

// 授权信息
const AUTH_INFO = {
  company: '洛阳沫言酒店管理有限公司',
  code: '202411283053152737',
  validity: '永久有效',
  certificatePath: '/Users/yanyu/YYC3-Mac-Max/智谱授权书',
};

// ============================================================
// GET /api/v1/models - 获取所有模型配置
// ============================================================
router.get('/models', async (req: Request, res: Response) => {
  try {
    const summary = getModelSummary();
    const models = globalModelRegistry.getAllModels();

    res.json({
      success: true,
      data: {
        summary,
        models: models.map(m => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          tier: m.tier,
          categories: m.categories,
          contextWindow: m.contextWindow,
          maxOutput: m.maxOutput,
          localAvailable: m.deployment.local?.available || false,
          cloudAvailable: m.deployment.cloud?.available || false,
          isFree: m.pricing.isFree,
          recommendedAgents: m.recommendedAgents,
          isAuthorized: m.tier === 'authorized',
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// GET /api/v1/models/local - 获取本地可用模型
// ============================================================
router.get('/models/local', async (req: Request, res: Response) => {
  try {
    const models = globalModelRegistry.getLocalAvailableModels();

    res.json({
      success: true,
      data: models.map(m => ({
        id: m.id,
        name: m.name,
        ollamaName: m.deployment.local?.ollamaName,
        nodes: m.deployment.local?.nodes,
        performance: m.performance,
        recommendedAgents: m.recommendedAgents,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// GET /api/v1/models/authorized - 获取授权模型
// ============================================================
router.get('/models/authorized', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        authorization: AUTH_INFO,
        models: AUTHORIZED_MODELS.map(m => ({
          id: m.id,
          name: m.name,
          categories: m.categories,
          contextWindow: m.contextWindow,
          maxOutput: m.maxOutput,
          localAvailable: m.deployment.local?.available || false,
          cloudAvailable: m.deployment.cloud?.available || false,
          certificate: m.authorization?.certificatePath?.split('/').pop(),
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// GET /api/v1/models/:id - 获取单个模型详情
// ============================================================
router.get('/models/:id', async (req: Request, res: Response) => {
  try {
    const model = globalModelRegistry.getModel(req.params.id);

    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found',
      });
    }

    res.json({
      success: true,
      data: model,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// GET /api/v1/agents/routing - 获取Agent路由策略
// ============================================================
router.get('/agents/routing', async (req: Request, res: Response) => {
  try {
    const strategies = Object.values(AGENT_ROUTING_STRATEGIES);

    res.json({
      success: true,
      data: strategies.map(s => ({
        agentId: s.agentId,
        agentName: s.agentName,
        primaryUseCase: s.primaryUseCase,
        modelPriority: s.modelPriority,
        fallbackChain: s.fallbackChain,
        temperature: s.temperature,
        maxTokens: s.maxTokens,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// GET /api/v1/agents/:id/routing - 获取单个Agent路由策略
// ============================================================
router.get('/agents/:id/routing', async (req: Request, res: Response) => {
  try {
    const strategy = AGENT_ROUTING_STRATEGIES[req.params.id];

    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: 'Agent routing strategy not found',
      });
    }

    // 获取最佳模型
    const bestModel = globalModelRegistry.getBestModelForAgent(req.params.id, true);

    res.json({
      success: true,
      data: {
        strategy,
        bestModel: bestModel ? {
          id: bestModel.id,
          name: bestModel.name,
          provider: bestModel.provider,
          tier: bestModel.tier,
        } : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// POST /api/v1/inference/route - 获取推理路由建议
// ============================================================
router.post('/inference/route', async (req: Request, res: Response) => {
  try {
    const { agentId, taskType, preferLocal = true } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: 'agentId is required',
      });
    }

    const strategy = AGENT_ROUTING_STRATEGIES[agentId];

    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    // 获取最佳模型
    const bestModel = globalModelRegistry.getBestModelForAgent(agentId, preferLocal);

    // 获取所有可用模型
    const availableModels = strategy.fallbackChain
      .map(id => globalModelRegistry.getModel(id))
      .filter(m => m && (m.deployment.local?.available || m.deployment.cloud?.available));

    res.json({
      success: true,
      data: {
        agentId,
        taskType: taskType || strategy.primaryUseCase,
        recommended: bestModel ? {
          id: bestModel.id,
          name: bestModel.name,
          provider: bestModel.provider,
          tier: bestModel.tier,
          endpoint: bestModel.deployment.local?.available
            ? `http://localhost:11434`
            : bestModel.deployment.cloud?.endpoint,
          ollamaName: bestModel.deployment.local?.ollamaName,
        } : null,
        fallbackChain: availableModels.map(m => ({
          id: m!.id,
          name: m!.name,
          tier: m!.tier,
          localAvailable: m!.deployment.local?.available || false,
        })),
        config: {
          temperature: strategy.temperature,
          maxTokens: strategy.maxTokens,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// GET /api/v1/models/matrix - 获取模型配置矩阵（Markdown格式）
// ============================================================
router.get('/models/matrix', async (req: Request, res: Response) => {
  try {
    const matrix = printModelMatrix();

    res.type('text/markdown').send(matrix);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// GET /api/v1/authorization/verify - 验证授权状态
// ============================================================
router.get('/authorization/verify', async (req: Request, res: Response) => {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const certDir = AUTH_INFO.certificatePath;
    const certificates: string[] = [];

    if (fs.existsSync(certDir)) {
      const files = fs.readdirSync(certDir);

      files.forEach(file => {
        if (file.endsWith('.png')) {
          certificates.push(file);
        }
      });
    }

    res.json({
      success: true,
      data: {
        authorization: AUTH_INFO,
        verified: certificates.length > 0,
        certificates,
        authorizedModels: AUTHORIZED_MODELS.map(m => m.id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
