#!/bin/bash

# ============================================================
# YYC3 AI Family — 本地后端 API 部署脚本
# Phase 52: L01 基础设施层真实连接验证
# ============================================================

set -e

PROJECT_DIR="/Users/yanyu/YYC3-Mac-Max/Family-π³"
BACKEND_DIR="${PROJECT_DIR}/backend"
PORT="3001"

echo "🚀 YYC3 AI Family — 本地后端 API 部署脚本"
echo "================================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js
check_nodejs() {
    echo "📡 检查 Node.js 环境..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}✅ Node.js 已安装: ${NODE_VERSION}${NC}"
        return 0
    else
        echo -e "${RED}❌ Node.js 未安装${NC}"
        echo "请安装 Node.js 20+: https://nodejs.org/"
        return 1
    fi
}

# 检查 pnpm
check_pnpm() {
    echo ""
    echo "📦 检查 pnpm..."
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm -v)
        echo -e "${GREEN}✅ pnpm 已安装: ${PNPM_VERSION}${NC}"
        return 0
    else
        echo -e "${RED}❌ pnpm 未安装${NC}"
        echo "请安装 pnpm: npm install -g pnpm"
        return 1
    fi
}

# 创建后端项目结构
create_backend_structure() {
    echo ""
    echo "📁 创建后端项目结构..."
    
    mkdir -p "${BACKEND_DIR}"/{src/{routes,middleware,utils},dist}
    
    echo -e "${GREEN}✅ 目录结构创建完成${NC}"
}

# 创建 package.json
create_package_json() {
    echo ""
    echo "📄 创建 package.json..."
    
    cat > "${BACKEND_DIR}/package.json" << 'EOF'
{
  "name": "yyc3-backend",
  "version": "1.0.0",
  "description": "YYC3 AI Family Backend API",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "ws": "^8.14.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/node": "^20.0.0",
    "@types/ws": "^8.5.0",
    "tsx": "^4.0.0",
    "typescript": "^5.3.0"
  }
}
EOF
    
    echo -e "${GREEN}✅ package.json 创建完成${NC}"
}

# 创建 tsconfig.json
create_tsconfig() {
    echo ""
    echo "⚙️  创建 tsconfig.json..."
    
    cat > "${BACKEND_DIR}/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
    
    echo -e "${GREEN}✅ tsconfig.json 创建完成${NC}"
}

# 创建主服务文件
create_main_server() {
    echo ""
    echo "🖥️  创建主服务文件..."
    
    cat > "${BACKEND_DIR}/src/index.ts" << 'EOF'
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { config } from 'dotenv';

config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/v1/chat', async (req, res) => {
  try {
    const { message, model } = req.body;
    res.json({
      success: true,
      response: `[Mock] Chat response for: ${message}`,
      model: model || 'default'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/v1/mcp', async (req, res) => {
  try {
    const { tool, params } = req.body;
    res.json({
      success: true,
      result: `[Mock] MCP tool ${tool} executed with params: ${JSON.stringify(params)}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[WS] Client connected: ${clientIp}`);
  
  ws.send(JSON.stringify({
    type: 'welcome',
    timestamp: Date.now(),
    message: 'Connected to YYC3 Backend'
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`[WS] Received: ${data.type}`);
      
      ws.send(JSON.stringify({
        type: 'ack',
        timestamp: Date.now(),
        originalType: data.type
      }));
    } catch (error) {
      console.error(`[WS] Error parsing message: ${error.message}`);
    }
  });
  
  ws.on('close', (code, reason) => {
    console.log(`[WS] Client disconnected: ${clientIp} (code: ${code})`);
  });
  
  ws.on('error', (error) => {
    console.error(`[WS] Error: ${error.message}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[INFO] YYC3 Backend API running on port ${PORT}`);
  console.log(`[INFO] WebSocket endpoint: ws://0.0.0.0:${PORT}/ws`);
  console.log(`[INFO] Health check: http://0.0.0.0:${PORT}/api/v1/health`);
});
EOF
    
    echo -e "${GREEN}✅ 主服务文件创建完成${NC}"
}

# 创建 .env 文件
create_env_file() {
    echo ""
    echo "🔐 创建 .env 文件..."
    
    cat > "${BACKEND_DIR}/.env" << EOF
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
LOG_LEVEL=debug
EOF
    
    echo -e "${GREEN}✅ .env 文件创建完成${NC}"
}

# 安装依赖
install_dependencies() {
    echo ""
    echo "📦 安装依赖..."
    
    cd "${BACKEND_DIR}"
    
    if [ -f "pnpm-lock.yaml" ]; then
        echo "检测到 pnpm-lock.yaml，使用 pnpm install..."
        pnpm install
    else
        echo "首次安装，使用 pnpm install..."
        pnpm install
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 依赖安装完成${NC}"
    else
        echo -e "${RED}❌ 依赖安装失败${NC}"
        return 1
    fi
}

# 启动服务
start_service() {
    echo ""
    echo "🚀 启动后端服务..."
    
    cd "${BACKEND_DIR}"
    
    # 检查端口是否被占用
    if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  端口 ${PORT} 已被占用${NC}"
        echo "正在尝试停止占用进程..."
        lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # 启动服务（后台运行）
    nohup pnpm dev > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    
    echo "后端服务 PID: ${BACKEND_PID}"
    echo "日志文件: ${BACKEND_DIR}/logs/backend.log"
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 5
    
    # 验证服务
    if curl -s http://localhost:${PORT}/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端服务启动成功${NC}"
        echo ""
        echo "服务信息："
        echo "  - 端口: ${PORT}"
        echo "  - 健康检查: http://localhost:${PORT}/api/v1/health"
        echo "  - WebSocket: ws://localhost:${PORT}/ws"
        echo "  - PID: ${BACKEND_PID}"
        echo ""
        echo "查看日志: tail -f ${BACKEND_DIR}/logs/backend.log"
        echo "停止服务: kill ${BACKEND_PID}"
        return 0
    else
        echo -e "${RED}❌ 后端服务启动失败${NC}"
        echo "查看日志: cat ${BACKEND_DIR}/logs/backend.log"
        return 1
    fi
}

# 验证服务
verify_service() {
    echo ""
    echo "🔍 验证后端服务..."
    echo "================================================"
    
    echo ""
    echo "1️⃣  健康检查端点"
    HEALTH_RESPONSE=$(curl -s http://localhost:${PORT}/api/v1/health)
    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ 健康检查通过${NC}"
        echo "   响应: ${HEALTH_RESPONSE}"
    else
        echo -e "   ${RED}❌ 健康检查失败${NC}"
    fi
    
    echo ""
    echo "2️⃣  端口监听状态"
    if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ 端口 ${PORT} 正在监听${NC}"
    else
        echo -e "   ${RED}❌ 端口 ${PORT} 未监听${NC}"
    fi
    
    echo ""
    echo "================================================"
}

# 主函数
main() {
    echo "开始部署本地后端 API 服务..."
    echo ""
    
    # 检查环境
    check_nodejs || exit 1
    check_pnpm || exit 1
    
    echo ""
    read -p "是否继续部署？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "部署已取消"
        exit 0
    fi
    
    # 创建项目结构
    create_backend_structure
    
    # 创建配置文件
    create_package_json
    create_tsconfig
    create_env_file
    
    # 创建主服务
    create_main_server
    
    # 安装依赖
    install_dependencies || exit 1
    
    # 创建日志目录
    mkdir -p "${BACKEND_DIR}/logs"
    
    # 启动服务
    start_service || exit 1
    
    # 验证服务
    verify_service
    
    echo ""
    echo -e "${GREEN}🎉 本地后端 API 部署完成！${NC}"
    echo ""
    echo "下一步："
    echo "  1. 在 AI Family 应用中验证连接"
    echo "  2. 检查 System Health 面板"
    echo "  3. 测试 API 端点"
    echo ""
}

# 执行主函数
main
