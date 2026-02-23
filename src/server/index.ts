// ============================================================
// YYC3 Hacker Chatbot — Express Backend Microservice
// Phase 10: Production-ready REST + WebSocket Server
//
// 部署步骤:
// 1. mkdir yyc3-server && cd yyc3-server
// 2. npm init -y
// 3. npm i express pg cors ws dotenv uuid
// 4. npm i -D typescript @types/express @types/pg @types/ws @types/cors @types/uuid ts-node
// 5. 复制此文件及同目录下的 routes.ts、ws.ts 到项目中
// 6. 创建 .env 文件 (见下方模板)
// 7. npx ts-node index.ts
//
// .env 模板:
//   DB_HOST=localhost
//   DB_PORT=5432
//   DB_NAME=yyc3_devops
//   DB_USER=yyc3_admin
//   DB_PASSWORD=your_secure_password
//   SERVER_PORT=3001
//   WS_HEARTBEAT_MS=2000
//   CORS_ORIGIN=http://localhost:5173
// ============================================================

import http from 'http';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';

import { createRoutes } from './routes';
import { createWebSocketServer } from './ws';


dotenv.config();

// === PostgreSQL Connection Pool ===
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'yyc3_devops',
  user: process.env.DB_USER || 'yyc3_admin',
  password: process.env.DB_PASSWORD || '',
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时
  connectionTimeoutMillis: 5000, // 连接超时
});

// === Connection Test ===
pool.query('SELECT NOW()')
  .then(res => {
    console.log(`[DB] PostgreSQL connected — ${res.rows[0].now}`);
  })
  .catch((err: Error) => {
    console.error('[DB] PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

// === Express App ===
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.path}`);
  next();
});

// === Health Check ===
app.get('/api/v1/health', async (_req, res) => {
  try {
    const dbResult = await pool.query('SELECT 1');

    res.json({
      status: 'ok',
      db: dbResult.rows.length > 0 ? 'connected' : 'error',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '10.0.0',
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// === REST Routes ===
createRoutes(app, pool);

// === WebSocket Server ===
const wss = createWebSocketServer(server, pool);

// === Error Handler ===
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// === Start ===
const PORT = parseInt(process.env.SERVER_PORT || '3001', 10);

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║           YYC3 DevOps Backend v10.0              ║
║══════════════════════════════════════════════════║
║  HTTP:  http://localhost:${PORT}/api/v1            ║
║  WS:    ws://localhost:${PORT}/ws                  ║
║  DB:    PostgreSQL @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}           ║
╚══════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[SHUTDOWN] Closing connections...');
  wss.close();
  await pool.end();
  server.close();
  process.exit(0);
});

export { pool };
