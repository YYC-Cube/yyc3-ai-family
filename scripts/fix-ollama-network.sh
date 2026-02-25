#!/bin/bash
# ============================================================
# YYC³ Ollama 网络配置修复脚本
# 修复 Ollama 只监听 localhost 而不监听网络接口的问题
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 YYC³ Ollama 网络配置修复${NC}"
echo "================================"
echo ""

# 获取本机IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo -e "${BLUE}📍 本机IP: ${LOCAL_IP}${NC}"
echo ""

# 检查当前状态
echo -e "${BLUE}1️⃣ 检查 Ollama 服务状态...${NC}"

if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    OLLAMA_VERSION=$(curl -s http://localhost:11434/api/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Ollama localhost:11434 正常 (版本: ${OLLAMA_VERSION})${NC}"
else
    echo -e "${RED}❌ Ollama localhost:11434 未运行${NC}"
    echo ""
    echo -e "${YELLOW}请先启动 Ollama:${NC}"
    echo "  ollama serve"
    exit 1
fi

if curl -s --connect-timeout 2 http://${LOCAL_IP}:11434/api/version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama ${LOCAL_IP}:11434 正常${NC}"
    echo ""
    echo -e "${GREEN}🎉 Ollama 网络配置已正确！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Ollama ${LOCAL_IP}:11434 无法访问${NC}"
    echo -e "${YELLOW}   Ollama 只监听了 localhost，需要配置监听所有网络接口${NC}"
fi

echo ""
echo -e "${BLUE}2️⃣ 配置 Ollama 监听所有网络接口...${NC}"
echo ""

# 方法1: 设置环境变量 (临时)
echo -e "${BLUE}方法1: 临时配置 (重启后失效)${NC}"
echo "执行以下命令:"
echo ""
echo "  # 设置 Ollama 监听所有接口"
echo "  launchctl setenv OLLAMA_HOST \"0.0.0.0\""
echo "  launchctl setenv OLLAMA_ORIGINS \"*\""
echo ""
echo "  # 重启 Ollama"
echo "  pkill ollama"
echo "  ollama serve &"
echo ""

# 方法2: 创建启动脚本 (永久)
echo -e "${BLUE}方法2: 永久配置 (推荐)${NC}"
echo "创建 Ollama 启动脚本:"
echo ""

OLLAMA_SCRIPT="$HOME/start-ollama-network.sh"
cat > "$OLLAMA_SCRIPT" << 'EOF'
#!/bin/bash
# Ollama 网络启动脚本

export OLLAMA_HOST=0.0.0.0
export OLLAMA_ORIGINS=*

# 停止现有服务
pkill ollama 2>/dev/null

# 启动 Ollama
nohup ollama serve > /tmp/ollama.log 2>&1 &

echo "✅ Ollama 已启动，监听所有网络接口"
echo "📍 本地访问: http://localhost:11434"
echo "🌐 网络访问: http://$(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1):11434"
EOF

chmod +x "$OLLAMA_SCRIPT"
echo -e "${GREEN}✅ 启动脚本已创建: ${OLLAMA_SCRIPT}${NC}"
echo ""
echo "使用方法:"
echo "  ${OLLAMA_SCRIPT}"
echo ""

# 方法3: macOS LaunchAgent (开机自启)
echo -e "${BLUE}方法3: macOS LaunchAgent (开机自启)${NC}"
echo ""

PLIST_FILE="$HOME/Library/LaunchAgents/com.ollama.network.plist"
cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ollama.network</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/ollama</string>
        <string>serve</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>OLLAMA_HOST</key>
        <string>0.0.0.0</string>
        <key>OLLAMA_ORIGINS</key>
        <string>*</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/ollama.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/ollama-error.log</string>
</dict>
</plist>
EOF

echo -e "${GREEN}✅ LaunchAgent 配置已创建: ${PLIST_FILE}${NC}"
echo ""
echo "加载 LaunchAgent:"
echo "  launchctl load ${PLIST_FILE}"
echo ""

# 验证步骤
echo -e "${BLUE}3️⃣ 验证步骤${NC}"
echo ""
echo "执行以下命令验证配置:"
echo ""
echo "  # 1. 测试本地访问"
echo "  curl http://localhost:11434/api/version"
echo ""
echo "  # 2. 测试网络访问"
echo "  curl http://${LOCAL_IP}:11434/api/version"
echo ""
echo "  # 3. 查看监听端口"
echo "  lsof -i :11434"
echo ""

# 快速修复
echo -e "${YELLOW}⚡ 快速修复 (立即生效)${NC}"
echo ""
echo "执行以下命令立即启用网络访问:"
echo ""
echo "  export OLLAMA_HOST=0.0.0.0"
echo "  export OLLAMA_ORIGINS=*"
echo "  pkill ollama"
echo "  ollama serve &"
echo ""
echo "或者直接运行我们创建的脚本:"
echo "  ${OLLAMA_SCRIPT}"
echo ""

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✅ 修复方案已准备完毕！${NC}"
echo ""
echo -e "${YELLOW}建议:${NC}"
echo "1. 临时测试: 使用方法1的命令"
echo "2. 日常使用: 使用 ${OLLAMA_SCRIPT}"
echo "3. 开机自启: 加载 LaunchAgent 配置"
echo ""
