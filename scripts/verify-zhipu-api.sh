#!/bin/bash
# ============================================================
# YYC³ 智谱AI API密钥快速验证脚本
# 验证 .env.production 中的 ZHIPU_API_KEY 是否有效
# ============================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 YYC³ 智谱AI API密钥验证${NC}"
echo "================================"
echo ""

# 从 .env.production 读取 API 密钥
API_KEY=$(grep VITE_ZHIPU_API_KEY /Users/yanyu/Family-π³/.env.production | cut -d '=' -f2)

if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ 错误: 未找到 VITE_ZHIPU_API_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 找到 API 密钥: ${API_KEY:0:20}...${NC}"
echo ""

# 测试 API 连接
echo -e "${BLUE}📡 测试 API 连接...${NC}"
echo "端点: https://open.bigmodel.cn/api/paas/v4/chat/completions"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    https://open.bigmodel.cn/api/paas/v4/chat/completions \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "glm-4-flash",
        "messages": [
            {"role": "user", "content": "你好"}
        ],
        "max_tokens": 50
    }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "${BLUE}HTTP 状态码: ${HTTP_CODE}${NC}"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ API 连接成功！${NC}"
    echo ""
    echo -e "${BLUE}📝 API 响应:${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    
    # 提取回复内容
    CONTENT=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['choices'][0]['message']['content'])" 2>/dev/null)
    
    if [ ! -z "$CONTENT" ]; then
        echo -e "${GREEN}💬 AI 回复: $CONTENT${NC}"
        echo ""
    fi
    
    echo -e "${GREEN}🎉 智谱AI API密钥验证成功！${NC}"
    echo ""
    echo -e "${BLUE}📋 下一步操作:${NC}"
    echo "1. 运行基础对话示例:"
    echo "   cd /Users/yanyu/Family-π³/packages/bigmodel-sdk"
    echo "   export BIGMODEL_API_KEY='$API_KEY'"
    echo "   node dist/examples/simple-agent-chat.js"
    echo ""
    echo "2. 运行多智能体协作示例:"
    echo "   node dist/examples/multi-agent-pipeline.js"
    echo ""
    echo "3. 运行完整测试套件:"
    echo "   ./scripts/test-ai-interaction.sh"
    
else
    echo -e "${RED}❌ API 连接失败${NC}"
    echo ""
    echo -e "${YELLOW}📋 故障排查:${NC}"
    echo "1. 检查 API 密钥是否正确"
    echo "2. 检查网络连接"
    echo "3. 检查 API 配额是否用完"
    echo ""
    echo -e "${BLUE}📝 错误响应:${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi
