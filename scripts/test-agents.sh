#!/bin/bash

# @file test-agents.sh
# @description YYC³ AI-Family 七大智能体集成测试脚本，测试七大智能体的模型连接和推理能力
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [testing],[agents],[ai]

# ============================================================
# YYC³ AI Family - 七大智能体集成测试
# 文件: /Users/yanyu/YYC3-Mac-Max/Family-π³/scripts/test-agents.sh
# 用途: 测试七大智能体的模型连接和推理能力
#
# 七大智能体:
#   Navigator  (智愈·领航员) - 全域资源调度
#   Thinker    (洞见·思想家) - 深度逻辑推理
#   Prophet    (预见·先知)   - 趋势预测
#   Bole       (知遇·伯乐)   - 模型评估
#   Pivot      (元启·天枢)   - 核心协调
#   Sentinel   (卫安·哨兵)   - 安全防护
#   Grandmaster(格物·宗师)   - 知识库构建
# ============================================================

set -e

PASS=0
FAIL=0
WARN=0
TOTAL=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_header() {
  echo ""
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${MAGENTA}  $1${NC}"
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_agent_model() {
  local agent_name=$1
  local model=$2
  local endpoint=$3
  local test_prompt=$4
  
  ((TOTAL++))
  printf "  %-20s" "$agent_name"
  
  # 检查模型是否存在
  local model_check
  model_check=$(curl -s "$endpoint/api/tags" 2>/dev/null | grep -o "\"$model\"" | head -1)
  
  if [ -z "$model_check" ]; then
    echo -e "${YELLOW}⚠️ 模型未部署${NC}"
    ((WARN++))
    return
  fi
  
  # 测试推理
  local response
  response=$(curl -s --connect-timeout 10 --max-time 30 \
    "$endpoint/api/generate" \
    -H "Content-Type: application/json" \
    -d "{\"model\": \"$model\", \"prompt\": \"$test_prompt\", \"stream\": false}" 2>/dev/null)
  
  if echo "$response" | grep -q "response"; then
    local latency=$(echo "$response" | grep -o '"total_duration":[0-9]*' | grep -o '[0-9]*' || echo "0")
    local latency_ms=$((latency / 1000000))
    echo -e "${GREEN}✅ 正常 (${latency_ms}ms)${NC}"
    ((PASS++))
  else
    echo -e "${RED}❌ 推理失败${NC}"
    ((FAIL++))
  fi
}

test_agent_config() {
  local agent_id=$1
  local agent_name=$2
  local expected_model=$3
  local expected_endpoint=$4
  
  ((TOTAL++))
  printf "  %-20s" "$agent_name 配置"
  
  # 检查 AGENT_REGISTRY
  if grep -q "$agent_id" /Users/yanyu/YYC3-Mac-Max/Family-π³/src/lib/types.ts 2>/dev/null; then
    echo -e "${GREEN}✅ 已注册${NC}"
    ((PASS++))
  else
    echo -e "${RED}❌ 未注册${NC}"
    ((FAIL++))
  fi
}

echo "========================================"
echo "  YYC³ AI Family 七大智能体集成测试"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# ============================================================
# 智能体注册表检查
# ============================================================
print_header "智能体注册表 (Agent Registry)"

for agent in "navigator" "thinker" "prophet" "bole" "pivot" "sentinel" "grandmaster"; do
  ((TOTAL++))
  printf "  %-20s" "$agent"
  if grep -q "id: '$agent'" /Users/yanyu/YYC3-Mac-Max/Family-π³/src/lib/types.ts 2>/dev/null; then
    echo -e "${GREEN}✅ 已注册${NC}"
    ((PASS++))
  else
    echo -e "${RED}❌ 未注册${NC}"
    ((FAIL++))
  fi
done

# ============================================================
# Navigator (智愈·领航员) - M4 Max
# ============================================================
print_header "Navigator (智愈·领航员)"

test_agent_model "qwen2.5:7b" "qwen2.5:7b" "http://localhost:11434" "导航测试"
test_agent_model "nomic-embed" "nomic-embed-text" "http://localhost:11434" "嵌入测试"

# ============================================================
# Thinker (洞见·思想家) - Cloud API
# ============================================================
print_header "Thinker (洞见·思想家)"

((TOTAL++))
printf "  %-20s" "DeepSeek API"
if [ -n "$DEEPSEEK_API_KEY" ]; then
  echo -e "${GREEN}✅ 已配置${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️ 未配置环境变量${NC}"
  ((WARN++))
fi

((TOTAL++))
printf "  %-20s" "CodeGeeX4 备用"
if curl -s http://localhost:11434/api/tags 2>/dev/null | grep -q "codegeex4"; then
  echo -e "${GREEN}✅ 已部署${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️ 未部署${NC}"
  ((WARN++))
fi

# ============================================================
# Prophet (预见·先知) - M4 Max
# ============================================================
print_header "Prophet (预见·先知)"

test_agent_model "qwen2.5:7b" "qwen2.5:7b" "http://localhost:11434" "预测测试"

# ============================================================
# Bole (知遇·伯乐) - iMac M4
# ============================================================
print_header "Bole (知遇·伯乐)"

test_agent_model "codegeex4" "codegeex4:latest" "http://192.168.3.77:11434" "代码评估测试"

# ============================================================
# Pivot (元启·天枢) - iMac M4
# ============================================================
print_header "Pivot (元启·天枢)"

test_agent_model "glm4:9b" "glm4:9b" "http://192.168.3.77:11434" "协调测试"

# ============================================================
# Sentinel (卫安·哨兵) - iMac M4
# ============================================================
print_header "Sentinel (卫安·哨兵)"

test_agent_model "phi3:mini" "phi3:mini" "http://192.168.3.77:11434" "安全检查测试"
test_agent_model "phi3:14b" "phi3:14b" "http://192.168.3.77:11434" "深度安全分析"

# ============================================================
# Grandmaster (格物·宗师) - Cloud API
# ============================================================
print_header "Grandmaster (格物·宗师)"

((TOTAL++))
printf "  %-20s" "DeepSeek API"
if [ -n "$DEEPSEEK_API_KEY" ]; then
  echo -e "${GREEN}✅ 已配置${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️ 未配置环境变量${NC}"
  ((WARN++))
fi

# ============================================================
# 智能体协作测试
# ============================================================
print_header "智能体协作 (Collaboration)"

((TOTAL++))
printf "  %-20s" "Agent Orchestrator"
if [ -f "/Users/yanyu/YYC3-Mac-Max/Family-π³/src/lib/agent-orchestrator.ts" ]; then
  echo -e "${GREEN}✅ 存在${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ 缺失${NC}"
  ((FAIL++))
fi

((TOTAL++))
printf "  %-20s" "协作模式定义"
if grep -q "CollaborationMode" /Users/yanyu/YYC3-Mac-Max/Family-π³/src/lib/agent-orchestrator.ts 2>/dev/null; then
  echo -e "${GREEN}✅ 已定义${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️ 未找到${NC}"
  ((WARN++))
fi

# 检查协作模式
for mode in "pipeline" "parallel" "debate" "ensemble" "delegation"; do
  ((TOTAL++))
  printf "  %-20s" "$mode 模式"
  if grep -q "'$mode'" /Users/yanyu/YYC3-Mac-Max/Family-π³/src/lib/agent-orchestrator.ts 2>/dev/null; then
    echo -e "${GREEN}✅ 支持${NC}"
    ((PASS++))
  else
    echo -e "${YELLOW}⚠️ 未支持${NC}"
    ((WARN++))
  fi
done

# ============================================================
# 模型分布统计
# ============================================================
print_header "模型分布统计 (Model Distribution)"

echo ""
echo "  📍 M4 Max (localhost:11434):"
curl -s http://localhost:11434/api/tags 2>/dev/null | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | while read model; do
  echo "     - $model"
done

echo ""
echo "  📍 iMac M4 (192.168.3.77:11434):"
curl -s http://192.168.3.77:11434/api/tags 2>/dev/null | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | while read model; do
  echo "     - $model"
done

# ============================================================
# 汇总报告
# ============================================================
echo ""
echo "========================================"
echo "  七大智能体测试报告"
echo "========================================"
echo ""
echo "  📊 测试项总数: $TOTAL"
echo -e "  ${GREEN}✅ 通过: $PASS${NC}"
echo -e "  ${YELLOW}⚠️ 警告: $WARN${NC}"
echo -e "  ${RED}❌ 失败: $FAIL${NC}"
echo ""

# 计算智能体就绪度
READY=$((PASS * 100 / TOTAL))
echo "  🤖 智能体就绪度: ${READY}%"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}🎉 所有智能体已就绪！${NC}"
  exit 0
elif [ $FAIL -le 3 ]; then
  echo -e "  ${YELLOW}⚠️ 部分智能体需要配置。${NC}"
  exit 0
else
  echo -e "  ${RED}❌ 多个智能体未就绪，请检查部署。${NC}"
  exit 1
fi
