#!/bin/bash

# ============================================================
# YYC3 AI Family — NAS 服务一键部署脚本
# Phase 52: L01 基础设施层真实连接验证
# ============================================================

set -e

NAS_HOST="192.168.3.45"
NAS_USER="admin"
NAS_SSH_PORT="22"

echo "🚀 YYC3 AI Family — NAS 服务部署脚本"
echo "================================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 SSH 连接
check_ssh_connection() {
    echo "📡 检查 NAS SSH 连接..."
    if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -p ${NAS_SSH_PORT} ${NAS_USER}@${NAS_HOST} "echo '连接成功'" 2>/dev/null; then
        echo -e "${GREEN}✅ NAS SSH 连接正常${NC}"
        return 0
    else
        echo -e "${RED}❌ 无法连接到 NAS (${NAS_HOST}:${NAS_SSH_PORT})${NC}"
        echo ""
        echo "请检查："
        echo "  1. NAS 是否已开机"
        echo "  2. SSH 服务是否已启用（端口 ${NAS_SSH_PORT}）"
        echo "  3. 网络连接是否正常"
        echo "  4. 防火墙是否允许 SSH 连接"
        echo ""
        return 1
    fi
}

# 部署 SQLite HTTP 代理
deploy_sqlite_proxy() {
    echo ""
    echo "📦 部署 SQLite HTTP 代理服务（端口 8484）..."
    echo "------------------------------------------------"
    
    ssh -p ${NAS_SSH_PORT} ${NAS_USER}@${NAS_HOST} << 'ENDSSH'
        set -e
        
        # 创建工作目录
        mkdir -p /volume1/docker/yyc3/sqlite-proxy
        cd /volume1/docker/yyc3/sqlite-proxy
        
        # 创建 Dockerfile
        cat > Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
RUN npm install -g sqlite-http-server
EXPOSE 8484
CMD ["sqlite-http-server", "--port", "8484", "--db-path", "/data", "--cors"]
EOF
        
        # 创建 docker-compose.yml
        cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  sqlite-proxy:
    build: .
    container_name: yyc3-sqlite-proxy
    restart: unless-stopped
    ports:
      - "8484:8484"
    volumes:
      - /volume2/yyc3:/data
    environment:
      - NODE_ENV=production
      - TZ=Asia/Shanghai
    networks:
      - yyc3-net
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  yyc3-net:
    driver: bridge
EOF
        
        # 停止旧容器（如果存在）
        docker-compose down 2>/dev/null || true
        
        # 构建并启动
        docker-compose up -d --build
        
        # 等待服务启动
        echo "等待服务启动..."
        sleep 5
        
        # 检查容器状态
        if docker ps | grep -q yyc3-sqlite-proxy; then
            echo "✅ SQLite HTTP 代理服务启动成功"
            docker logs yyc3-sqlite-proxy --tail 10
        else
            echo "❌ SQLite HTTP 代理服务启动失败"
            docker logs yyc3-sqlite-proxy 2>/dev/null || true
            exit 1
        fi
ENDSSH
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SQLite HTTP 代理部署完成${NC}"
        return 0
    else
        echo -e "${RED}❌ SQLite HTTP 代理部署失败${NC}"
        return 1
    fi
}

# 启用 Docker Remote API
enable_docker_api() {
    echo ""
    echo "🐳 启用 Docker Remote API（端口 2375）..."
    echo "------------------------------------------------"
    
    ssh -p ${NAS_SSH_PORT} ${NAS_USER}@${NAS_HOST} << 'ENDSSH'
        set -e
        
        # 备份原配置
        if [ -f /etc/docker/daemon.json ]; then
            sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup.$(date +%Y%m%d_%H%M%S)
            echo "已备份原配置文件"
        fi
        
        # 创建新配置
        sudo mkdir -p /etc/docker
        cat << 'EOF' | sudo tee /etc/docker/daemon.json
{
  "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"],
  "tlsverify": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF
        
        echo "配置文件已更新"
        
        # 重启 Docker 服务
        echo "重启 Docker 服务..."
        sudo systemctl restart docker
        
        # 等待 Docker 启动
        sleep 5
        
        # 验证配置
        if docker info > /dev/null 2>&1; then
            echo "✅ Docker 服务运行正常"
            
            # 测试 API 端口
            if curl -s --connect-timeout 3 http://localhost:2375/v1.41/_ping > /dev/null 2>&1; then
                echo "✅ Docker Remote API (2375) 已启用"
            else
                echo "⚠️  Docker Remote API 端口未响应，请检查防火墙"
            fi
        else
            echo "❌ Docker 服务启动失败"
            sudo journalctl -u docker -n 20 --no-pager
            exit 1
        fi
ENDSSH
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker Remote API 启用完成${NC}"
        return 0
    else
        echo -e "${RED}❌ Docker Remote API 启用失败${NC}"
        return 1
    fi
}

# 部署 WebSocket 心跳中继
deploy_heartbeat_relay() {
    echo ""
    echo "🔌 部署 WebSocket 心跳中继服务（端口 9090）..."
    echo "------------------------------------------------"
    
    ssh -p ${NAS_SSH_PORT} ${NAS_USER}@${NAS_HOST} << 'ENDSSH'
        set -e
        
        # 创建工作目录
        mkdir -p /volume1/docker/yyc3/heartbeat-relay
        cd /volume1/docker/yyc3/heartbeat-relay
        
        # 创建 package.json
        cat > package.json << 'EOF'
{
  "name": "yyc3-heartbeat-relay",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "ws": "^8.14.0"
  }
}
EOF
        
        # 创建 server.js
        cat > server.js << 'EOF'
const WebSocket = require('ws');
const http = require('http');

const PORT = 9090;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('YYC3 Heartbeat Relay Service');
});

const wss = new WebSocket.Server({ 
  server, 
  path: '/ws/heartbeat',
  clientTracking: true
});

console.log(`[INFO] Heartbeat relay starting on port ${PORT}`);

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[INFO] Client connected: ${clientIp}`);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`[INFO] Received: ${data.type} from ${clientIp}`);
      
      ws.send(JSON.stringify({
        type: 'heartbeat-ack',
        timestamp: Date.now(),
        status: 'alive',
        serverTime: new Date().toISOString()
      }));
    } catch (err) {
      console.error(`[ERROR] Failed to parse message: ${err.message}`);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`[INFO] Client disconnected: ${clientIp} (code: ${code})`);
  });

  ws.on('error', (err) => {
    console.error(`[ERROR] WebSocket error: ${err.message}`);
  });

  ws.send(JSON.stringify({
    type: 'welcome',
    timestamp: Date.now(),
    message: 'Connected to YYC3 Heartbeat Relay'
  }));
});

wss.on('listening', () => {
  console.log(`[INFO] WebSocket server listening on port ${PORT}`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[INFO] HTTP server listening on port ${PORT}`);
});
EOF
        
        # 创建 Dockerfile
        cat > Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 9090
CMD ["node", "server.js"]
EOF
        
        # 创建 docker-compose.yml
        cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  heartbeat-relay:
    build: .
    container_name: yyc3-heartbeat-relay
    restart: unless-stopped
    ports:
      - "9090:9090"
    environment:
      - NODE_ENV=production
      - TZ=Asia/Shanghai
    networks:
      - yyc3-net
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  yyc3-net:
    driver: bridge
EOF
        
        # 停止旧容器（如果存在）
        docker-compose down 2>/dev/null || true
        
        # 构建并启动
        docker-compose up -d --build
        
        # 等待服务启动
        echo "等待服务启动..."
        sleep 5
        
        # 检查容器状态
        if docker ps | grep -q yyc3-heartbeat-relay; then
            echo "✅ WebSocket 心跳中继服务启动成功"
            docker logs yyc3-heartbeat-relay --tail 10
        else
            echo "❌ WebSocket 心跳中继服务启动失败"
            docker logs yyc3-heartbeat-relay 2>/dev/null || true
            exit 1
        fi
ENDSSH
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ WebSocket 心跳中继部署完成${NC}"
        return 0
    else
        echo -e "${RED}❌ WebSocket 心跳中继部署失败${NC}"
        return 1
    fi
}

# 验证所有服务
verify_services() {
    echo ""
    echo "🔍 验证 NAS 服务连接状态..."
    echo "================================================"
    
    echo ""
    echo "1️⃣  SQLite HTTP 代理（8484）"
    if curl -s --connect-timeout 5 -X POST http://${NAS_HOST}:8484/api/db/query \
        -H "Content-Type: application/json" \
        -d '{"db":"/volume2/yyc3/yyc3.db","sql":"SELECT 1 as test","params":[]}' \
        > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ 连接成功${NC}"
    else
        echo -e "   ${RED}❌ 连接失败${NC}"
    fi
    
    echo ""
    echo "2️⃣  Docker Remote API（2375）"
    if curl -s --connect-timeout 5 http://${NAS_HOST}:2375/v1.41/_ping > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ 连接成功${NC}"
    else
        echo -e "   ${RED}❌ 连接失败${NC}"
    fi
    
    echo ""
    echo "3️⃣  WebSocket 心跳中继（9090）"
    if curl -s --connect-timeout 5 http://${NAS_HOST}:9090 > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ 连接成功${NC}"
    else
        echo -e "   ${RED}❌ 连接失败${NC}"
    fi
    
    echo ""
    echo "================================================"
}

# 主函数
main() {
    echo ""
    echo "开始部署 NAS 服务..."
    echo ""
    
    # 检查 SSH 连接
    if ! check_ssh_connection; then
        exit 1
    fi
    
    echo ""
    read -p "是否继续部署？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "部署已取消"
        exit 0
    fi
    
    # 部署服务
    deploy_sqlite_proxy
    enable_docker_api
    deploy_heartbeat_relay
    
    # 验证服务
    verify_services
    
    echo ""
    echo -e "${GREEN}🎉 NAS 服务部署完成！${NC}"
    echo ""
    echo "下一步："
    echo "  1. 在 AI Family 应用中验证连接状态"
    echo "  2. 检查 System Health 面板"
    echo "  3. 运行诊断测试"
    echo ""
}

# 执行主函数
main
