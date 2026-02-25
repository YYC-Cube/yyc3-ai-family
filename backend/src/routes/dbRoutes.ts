/**
 * @file YYC³ AI Family 数据闭环API路由
 * @description 数据库CRUD操作API，实现前端→API→DB→分析→优化的数据闭环
 * @author YYC³ Team
 * @version 1.0.0
 */

import { Request, Response, Router } from 'express';

import {
  agentRepository,
  conversationRepository,
  db,
  inferenceLogRepository,
  messageRepository,
  modelRepository,
  systemConfigRepository,
} from '../lib/database.js';

const router: Router = Router();

const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
};

// ============================================================
// Health Check
// ============================================================

router.get('/health', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const modelCount = (await modelRepository.findAll()).length;
    const agentCount = (await agentRepository.findAll()).length;

    res.json({
      status: 'ok',
      timestamp: Date.now(),
      version: '1.0.0',
      database: {
        connected: true,
        models: modelCount,
        agents: agentCount,
      },
      authorization: {
        company: process.env.AUTH_COMPANY || '洛阳沫言酒店管理有限公司',
        code: process.env.AUTH_CODE || '202411283053152737',
        validity: process.env.AUTH_VALIDITY || '永久有效',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// Models API
// ============================================================

router.get('/models', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const { tier, local, authorized } = req.query;

    let models;

    if (tier) {
      models = await modelRepository.findByTier(tier as string);
    } else if (local === 'true') {
      models = await modelRepository.findLocalAvailable();
    } else if (authorized === 'true') {
      models = await modelRepository.findAuthorized();
    } else {
      models = await modelRepository.findAll();
    }

    res.json({
      success: true,
      data: models,
      count: models.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/models/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const model = await modelRepository.findById(req.params.id as string);

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

router.get('/models/:id/stats', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const stats = await inferenceLogRepository.getStatsByModel(getParam(req.params.id), 24);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// Agents API
// ============================================================

router.get('/agents', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const agents = await agentRepository.findAll();

    res.json({
      success: true,
      data: agents,
      count: agents.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/agents/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const agent = await agentRepository.findById(getParam(req.params.id));

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// Conversations API
// ============================================================

router.get('/conversations', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const { userId, limit } = req.query;

    let conversations;

    if (userId) {
      conversations = await conversationRepository.findByUserId(
        userId as string,
        parseInt(limit as string) || 20,
      );
    } else {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    res.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/conversations', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const { title, agentId, modelId, userId, deviceId } = req.body;

    if (!agentId || !modelId) {
      return res.status(400).json({
        success: false,
        error: 'agentId and modelId are required',
      });
    }

    const id = await conversationRepository.create({
      title,
      agentId,
      modelId,
      userId,
      deviceId,
    });

    const conversation = await conversationRepository.findById(id);

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const conversation = await conversationRepository.findById(getParam(req.params.id));

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.patch('/conversations/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const { title, status, contextSummary } = req.body;

    await conversationRepository.update(getParam(req.params.id), {
      title,
      status,
      contextSummary,
    });

    const conversation = await conversationRepository.findById(getParam(req.params.id));

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.delete('/conversations/:id', async (req: Request, res: Response) => {
  try {
    await db.connect();

    await conversationRepository.delete(getParam(req.params.id));

    res.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// Messages API
// ============================================================

router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const { limit } = req.query;

    const messages = await messageRepository.findByConversationId(
      getParam(req.params.id),
      parseInt(limit as string) || 100,
    );

    res.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const conversationId = getParam(req.params.id);
    const {
      role,
      content,
      modelId,
      agentId,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      temperature,
    } = req.body;

    if (!role || !content) {
      return res.status(400).json({
        success: false,
        error: 'role and content are required',
      });
    }

    const messageId = await messageRepository.create({
      conversationId,
      role,
      content,
      modelId,
      agentId,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      temperature,
    });

    const messages = await messageRepository.findByConversationId(conversationId, 1);
    const message = messages.find((m: any) => m.id === messageId);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// Inference Logs API
// ============================================================

router.post('/inference-logs', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const {
      conversationId,
      messageId,
      modelId,
      agentId,
      requestType,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      firstTokenMs,
      status,
      errorMessage,
      nodeId,
      endpoint,
    } = req.body;

    if (!modelId || !requestType || !status) {
      return res.status(400).json({
        success: false,
        error: 'modelId, requestType, and status are required',
      });
    }

    const id = await inferenceLogRepository.create({
      conversationId,
      messageId,
      modelId,
      agentId,
      requestType,
      promptTokens: promptTokens || 0,
      completionTokens: completionTokens || 0,
      totalTokens: totalTokens || 0,
      latencyMs: latencyMs || 0,
      firstTokenMs,
      status,
      errorMessage,
      nodeId,
      endpoint,
    });

    // 更新Agent统计
    if (agentId) {
      await agentRepository.updateStats(agentId, {
        totalRequests: 1,
        totalTokens: totalTokens || 0,
      });
    }

    res.status(201).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/inference-logs', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const { modelId, agentId, limit } = req.query;

    let logs;

    if (modelId) {
      logs = await inferenceLogRepository.findByModelId(
        modelId as string,
        parseInt(limit as string) || 100,
      );
    } else if (agentId) {
      logs = await inferenceLogRepository.findByAgentId(
        agentId as string,
        parseInt(limit as string) || 100,
      );
    } else {
      return res.status(400).json({
        success: false,
        error: 'modelId or agentId is required',
      });
    }

    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// System Config API
// ============================================================

router.get('/config', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const config = await systemConfigRepository.getAll();

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/config/:key', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const key = getParam(req.params.key);
    const value = await systemConfigRepository.get(key);

    if (value === null) {
      return res.status(404).json({
        success: false,
        error: 'Config key not found',
      });
    }

    res.json({
      success: true,
      data: { key, value },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.put('/config/:key', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'value is required',
      });
    }

    const key = getParam(req.params.key);
    await systemConfigRepository.set(key, value);

    res.json({
      success: true,
      data: { key, value },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// Statistics API
// ============================================================

router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    await db.connect();

    const models = await modelRepository.findAll();
    const agents = await agentRepository.findAll();

    const localModels = models.filter((m: any) => m.local_available);
    const authorizedModels = models.filter((m: any) => m.is_authorized);
    const freeModels = models.filter((m: any) => m.is_free);

    res.json({
      success: true,
      data: {
        models: {
          total: models.length,
          local: localModels.length,
          authorized: authorizedModels.length,
          free: freeModels.length,
          byTier: {
            local: models.filter((m: any) => m.tier === 'local').length,
            'cloud-free': models.filter((m: any) => m.tier === 'cloud-free').length,
            'cloud-paid': models.filter((m: any) => m.tier === 'cloud-paid').length,
            authorized: authorizedModels.length,
          },
        },
        agents: {
          total: agents.length,
          byRole: agents.reduce(
            (acc: Record<string, number>, a: any) => {
              acc[a.role] = (acc[a.role] || 0) + 1;

              return acc;
            },
            {} as Record<string, number>,
          ),
        },
        authorization: {
          company: process.env.AUTH_COMPANY || '洛阳沫言酒店管理有限公司',
          code: process.env.AUTH_CODE || '202411283053152737',
          validity: process.env.AUTH_VALIDITY || '永久有效',
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

export default router;
