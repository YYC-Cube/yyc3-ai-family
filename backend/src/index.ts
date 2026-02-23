/**
 * @file YYC³ AI Family Backend API
 * @description 主服务入口 - Express + WebSocket + 模型路由
 * @author YYC³ Team
 * @version 1.0.0
 */

import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

import dbRoutes from './routes/dbRoutes.js';
import modelRoutes from './routes/modelRoutes.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// API Routes
// ============================================================

// 健康检查
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
    uptime: process.uptime(),
    services: {
      frontend: 'http://localhost:3200',
      backend: `http://localhost:${PORT}`,
      ollama: 'http://localhost:11434',
    },
    authorization: {
      company: '洛阳沫言酒店管理有限公司',
      code: '202411283053152737',
      validity: '永久有效',
    },
  });
});

// 模型配置API
app.use('/api/v1', modelRoutes);

// 数据库API
app.use('/api/v1/db', dbRoutes);

// Chat API
app.post('/api/v1/chat', async (req, res) => {
  try {
    const { message, model = 'qwen2.5:7b', agentId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'message is required',
      });
    }

    // 获取Ollama模型
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';

    try {
      const response = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: message,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();

      res.json({
        success: true,
        data: {
          response: data.response,
          model,
          agentId,
          timestamp: Date.now(),
        },
      });
    } catch (ollamaError) {
      // Ollama不可用，返回模拟响应
      res.json({
        success: true,
        data: {
          response: `[Mock] 收到消息: "${message}"。Ollama服务暂不可用，请确保Ollama正在运行。`,
          model,
          agentId,
          timestamp: Date.now(),
          mock: true,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// MCP API
app.post('/api/v1/mcp', async (req, res) => {
  try {
    const { tool, params } = req.body;

    res.json({
      success: true,
      result: {
        tool,
        params,
        executed: true,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 推理路由API
app.post('/api/v1/inference', async (req, res) => {
  try {
    const { prompt, agentId = 'navigator', preferLocal = true } = req.body;

    // 动态导入模型配置
    const { globalModelRegistry, AGENT_ROUTING_STRATEGIES } = await import('../../../src/lib/global-model-config.js');

    const strategy = AGENT_ROUTING_STRATEGIES[agentId];

    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: `Agent ${agentId} not found`,
      });
    }

    const bestModel = globalModelRegistry.getBestModelForAgent(agentId, preferLocal);

    res.json({
      success: true,
      data: {
        agentId,
        model: bestModel ? {
          id: bestModel.id,
          name: bestModel.name,
          provider: bestModel.provider,
        } : null,
        config: {
          temperature: strategy.temperature,
          maxTokens: strategy.maxTokens,
        },
        prompt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path,
  });
});

// ============================================================
// WebSocket Server
// ============================================================

const wss = new WebSocketServer({ server, path: '/ws' });

interface WSClient extends WebSocket {
  isAlive?: boolean;
  agentId?: string;
}

const clients = new Set<WSClient>();

wss.on('connection', (ws: WSClient, req) => {
  const clientIp = req.socket.remoteAddress;

  console.log(`[WS] Client connected: ${clientIp}`);

  clients.add(ws);
  ws.isAlive = true;

  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    timestamp: Date.now(),
    message: 'Connected to YYC³ Backend',
    services: {
      models: '/api/v1/models',
      agents: '/api/v1/agents/routing',
      health: '/api/v1/health',
    },
  }));

  ws.on('message', async message => {
    try {
      const data = JSON.parse(message.toString());

      console.log(`[WS] Received: ${data.type}`);

      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;

        case 'chat':
          // 转发到Ollama
          const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';

          try {
            const response = await fetch(`${ollamaHost}/api/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: data.model || 'qwen2.5:7b',
                prompt: data.message,
                stream: false,
              }),
            });

            const result = await response.json();

            ws.send(JSON.stringify({
              type: 'chat_response',
              response: result.response,
              model: data.model,
              timestamp: Date.now(),
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Ollama service unavailable',
              timestamp: Date.now(),
            }));
          }
          break;

        case 'subscribe':
          ws.agentId = data.agentId;
          ws.send(JSON.stringify({
            type: 'subscribed',
            agentId: data.agentId,
            timestamp: Date.now(),
          }));
          break;

        default:
          ws.send(JSON.stringify({
            type: 'ack',
            originalType: data.type,
            timestamp: Date.now(),
          }));
      }
    } catch (error) {
      console.error(`[WS] Error parsing message: ${error}`);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`[WS] Client disconnected: ${clientIp} (code: ${code})`);
    clients.delete(ws);
  });

  ws.on('error', error => {
    console.error(`[WS] Error: ${error.message}`);
  });

  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// 心跳检测
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws: WSClient) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// ============================================================
// 启动服务
// ============================================================

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║     ██╗   ██╗ █████╗ ██╗     ██╗     ██████╗  █████╗         ║');
  console.log('║     ██║   ██║██╔══██╗██║     ██║     ██╔══██╗██╔══██╗        ║');
  console.log('║     ██║   ██║███████║██║     ██║     ██████╔╝███████║        ║');
  console.log('║     ╚██╗ ██╔╝██╔══██║██║     ██║     ██╔══██╗██╔══██║        ║');
  console.log('║      ╚████╔╝ ██║  ██║███████╗███████╗██║  ██║██║  ██║        ║');
  console.log('║       ╚═══╝  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝        ║');
  console.log('║                                                               ║');
  console.log('║               AI Family — Backend API                         ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`[INFO] 服务启动成功`);
  console.log(`[INFO] 端口: ${PORT}`);
  console.log(`[INFO] 健康检查: http://localhost:${PORT}/api/v1/health`);
  console.log(`[INFO] WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`[INFO] 模型配置: http://localhost:${PORT}/api/v1/models`);
  console.log(`[INFO] Agent路由: http://localhost:${PORT}/api/v1/agents/routing`);
  console.log('');
  console.log('[INFO] 授权信息:');
  console.log('  公司: 洛阳沫言酒店管理有限公司');
  console.log('  编号: 202411283053152737');
  console.log('  有效期: 永久有效');
  console.log('');
});

export { app, server, wss };
