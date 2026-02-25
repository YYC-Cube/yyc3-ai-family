#!/bin/bash

# MCP服务器状态检查脚本
# 用途: 快速检查所有MCP服务器的运行状态

echo "🔍 YYC3 MCP 服务器状态检查"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数器
TOTAL=0
RUNNING=0
STOPPED=0
ERROR=0

# 1. 检查Claude Desktop进程
echo "📱 1. Claude Desktop 进程状态"
if pgrep -f "Claude" > /dev/null; then
    echo -e "${GREEN}✓${NC} Claude Desktop 正在运行"
    ((RUNNING++))
else
    echo -e "${RED}✗${NC} Claude Desktop 未运行"
    ((STOPPED++))
fi
((TOTAL++))
echo ""

# 2. 检查配置文件
echo "📄 2. MCP 配置文件状态"
CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}✓${NC} 配置文件存在: $CONFIG_FILE"

    # 验证JSON格式
    if python3 -m json.tool "$CONFIG_FILE" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} JSON 格式正确"
        ((RUNNING++))
    else
        echo -e "${RED}✗${NC} JSON 格式错误"
        ((ERROR++))
    fi

    # 统计配置的服务器数量
    SERVER_COUNT=$(python3 -c "import json; print(len(json.load(open('$CONFIG_FILE')).get('mcpServers', {})))" 2>/dev/null || echo "0")
    echo -e "${YELLOW}ℹ${NC} 已配置 $SERVER_COUNT 个 MCP 服务器"
else
    echo -e "${RED}✗${NC} 配置文件不存在: $CONFIG_FILE"
    ((ERROR++))
fi
((TOTAL++))
echo ""

# 3. 检查自定义服务器构建状态
echo "🔧 3. 自定义服务器构建状态"
CUSTOM_SERVER="/Users/yanyu/yyc3-claude/claude-prompts-mcp/server/dist/index.js"
if [ -f "$CUSTOM_SERVER" ]; then
    echo -e "${GREEN}✓${NC} claude-prompts 服务器已构建"
    FILE_SIZE=$(du -h "$CUSTOM_SERVER" | cut -f1)
    MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$CUSTOM_SERVER")
    echo -e "${YELLOW}ℹ${NC} 文件大小: $FILE_SIZE, 最后修改: $MODIFIED"
    ((RUNNING++))
else
    echo -e "${RED}✗${NC} claude-prompts 服务器未构建"
    echo -e "${YELLOW}ℹ${NC} 运行以下命令构建:"
    echo -e "   cd /Users/yanyu/yyc3-claude/claude-prompts-mcp/server && npm install && npm run build"
    ((ERROR++))
fi
((TOTAL++))
echo ""

# 4. 检查Node.js环境
echo "🟢 4. Node.js 环境状态"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js 已安装: $NODE_VERSION"

    # 检查版本是否满足要求 (>= v24)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 24 ]; then
        echo -e "${GREEN}✓${NC} 版本满足要求 (>= v24)"
        ((RUNNING++))
    else
        echo -e "${YELLOW}⚠${NC} 版本较低，建议升级到 v24+"
        ((ERROR++))
    fi
else
    echo -e "${RED}✗${NC} Node.js 未安装"
    ((ERROR++))
fi
((TOTAL++))
echo ""

# 5. 检查npm/npx
echo "📦 5. npm/npx 状态"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm 已安装: $NPM_VERSION"
    ((RUNNING++))
else
    echo -e "${RED}✗${NC} npm 未安装"
    ((ERROR++))
fi
((TOTAL++))
echo ""

# 6. 检查Docker环境（可选）
echo "🐳 6. Docker 状态"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    echo -e "${GREEN}✓${NC} Docker 已安装: $DOCKER_VERSION"

    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Docker 守护进程正在运行"
        ((RUNNING++))
    else
        echo -e "${YELLOW}⚠${NC} Docker 守护进程未运行"
        ((STOPPED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker 未安装（可选）"
fi
((TOTAL++))
echo ""

# 7. 检查环境变量文件
echo "🔐 7. 环境变量配置"
ENV_FILE="/Users/yanyu/yyc3-claude/.env.mcp"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✓${NC} 环境变量文件存在"

    # 检查关键环境变量
    if grep -q "GITHUB_PERSONAL_ACCESS_TOKEN" "$ENV_FILE"; then
        echo -e "${GREEN}✓${NC} GitHub 令牌已配置"
    else
        echo -e "${YELLOW}⚠${NC} GitHub 令牌未配置"
    fi

    if grep -q "BRAVE_API_KEY" "$ENV_FILE"; then
        echo -e "${GREEN}✓${NC} Brave API 密钥已配置"
    else
        echo -e "${YELLOW}⚠${NC} Brave API 密钥未配置"
    fi

    if grep -q "DATABASE_URL" "$ENV_FILE"; then
        echo -e "${GREEN}✓${NC} 数据库连接已配置"
    else
        echo -e "${YELLOW}⚠${NC} 数据库连接未配置"
    fi
    ((RUNNING++))
else
    echo -e "${RED}✗${NC} 环境变量文件不存在"
    echo -e "${YELLOW}ℹ${NC} 创建文件: $ENV_FILE"
    ((ERROR++))
fi
((TOTAL++))
echo ""

# 8. 检查网络连接
echo "🌐 8. 网络连接状态"
if ping -c 1 -W 2 192.168.3.45 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 数据库服务器 (192.168.3.45) 可达"
    ((RUNNING++))
else
    echo -e "${RED}✗${NC} 数据库服务器 (192.168.3.45) 不可达"
    ((ERROR++))
fi
((TOTAL++))
echo ""

# 9. 检查日志文件
echo "📝 9. 日志文件状态"
LOG_DIR="$HOME/Library/Logs/Claude"
if [ -d "$LOG_DIR" ]; then
    echo -e "${GREEN}✓${NC} 日志目录存在"

    # 检查最近的错误
    if [ -f "$LOG_DIR/main.log" ]; then
        ERROR_COUNT=$(grep -i "error" "$LOG_DIR/main.log" | tail -20 | wc -l | tr -d ' ')
        echo -e "${YELLOW}ℹ${NC} 最近20条日志中有 $ERROR_COUNT 个错误"
    fi
    ((RUNNING++))
else
    echo -e "${YELLOW}⚠${NC} 日志目录不存在"
    ((STOPPED++))
fi
((TOTAL++))
echo ""

# 10. 检查MCP进程
echo "⚙️  10. MCP 服务器进程"
MCP_PROCESSES=$(ps aux | grep -E "(mcp|claude-prompts)" | grep -v grep | wc -l | tr -d ' ')
if [ "$MCP_PROCESSES" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} 发现 $MCP_PROCESSES 个 MCP 相关进程"
    ps aux | grep -E "(mcp|claude-prompts)" | grep -v grep | awk '{print "   PID:", $2, "CMD:", $11, $12, $13}'
    ((RUNNING++))
else
    echo -e "${YELLOW}⚠${NC} 未发现 MCP 相关进程（正常，按需启动）"
    ((STOPPED++))
fi
((TOTAL++))
echo ""

# 总结
echo "================================"
echo "📊 状态总结"
echo "================================"
echo -e "总检查项: $TOTAL"
echo -e "${GREEN}正常运行: $RUNNING${NC}"
echo -e "${YELLOW}已停止: $STOPPED${NC}"
echo -e "${RED}错误: $ERROR${NC}"
echo ""

# 计算健康度
if [ $TOTAL -gt 0 ]; then
    HEALTH=$((RUNNING * 100 / TOTAL))
    echo "系统健康度: $HEALTH%"

    if [ $HEALTH -ge 80 ]; then
        echo -e "${GREEN}✓${NC} 系统状态良好"
    elif [ $HEALTH -ge 60 ]; then
        echo -e "${YELLOW}⚠${NC} 系统状态一般，建议检查"
    else
        echo -e "${RED}✗${NC} 系统状态较差，需要修复"
    fi
fi
echo ""

# 提供下一步建议
echo "================================"
echo "💡 下一步建议"
echo "================================"
if [ $ERROR -gt 0 ]; then
    echo "1. 修复上述错误项"
    echo "2. 运行: cd /Users/yanyu/yyc3-claude/automation-scripts && ./activate-mcp.sh"
fi
if [ $STOPPED -gt 0 ]; then
    echo "3. 启动已停止的服务"
fi
echo "4. 重启 Claude Desktop: killall Claude && open -a Claude"
echo "5. 查看 Claude 中的 MCP 服务器列表"
echo ""

exit 0
