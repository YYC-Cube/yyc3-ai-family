#!/bin/bash

# @file test-modules.sh
# @description YYC³ AI-Family 功能模块测试脚本，测试各功能模块的运行状态和连接性
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [testing],[modules],[connectivity]

# ============================================================
# YYC³ AI Family - 功能模块测试脚本
# 文件: /Users/yanyu/YYC3-Mac-Max/Family-π³/scripts/test-modules.sh
# 用途: 测试各功能模块的运行状态和连接性
#
# 模块分类:
#   M01 数据库模块 - PostgreSQL, pgvector, Redis
#   M02 AI模型模块 - Ollama (本地/NAS/iMac)
#   M03 LLM桥接模块 - Provider配置, 路由, 熔断
#   M04 MCP协议模块 - 工具注册, 执行
#   M05 持久化模块 - LocalStorage, NAS同步
#   M06 网络模块 - SSH, WebSocket, HTTP
# ============================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$PROJECT_ROOT/src"
LIB_DIR="$SRC_DIR/lib"

PASS=0
FAIL=0
WARN=0
TOTAL=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_service() {
  local name=$1
  local command=$2
  local critical=$3

  ((TOTAL++))
  printf "  %-40s" "$name"

  if eval "$command" &>/dev/null; then
    echo -e "${GREEN}✅ 正常${NC}"
    ((PASS++))
  else
    if [ "$critical" = "critical" ]; then
      echo -e "${RED}❌ 失败 (关键)${NC}"
      ((FAIL++))
    else
      echo -e "${YELLOW}⚠️ 警告${NC}"
      ((WARN++))
    fi
  fi
}

test_service_with_output() {
  local name=$1
  local command=$2
  local critical=$3

  ((TOTAL++))
  printf "  %-40s" "$name"

  local output
  output=$(eval "$command" 2>&1)
  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}✅ 正常${NC}"
    ((PASS++))
    if [ -n "$output" ]; then
      echo "      └─ $output"
    fi
  else
    if [ "$critical" = "critical" ]; then
      echo -e "${RED}❌ 失败${NC}"
      ((FAIL++))
    else
      echo -e "${YELLOW}⚠️ 警告${NC}"
      ((WARN++))
    fi
    if [ -n "$output" ]; then
      echo "      └─ 错误: $output"
    fi
  fi
}

echo "========================================"
echo "  YYC³ AI Family 功能模块测试"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# ============================================================
# M01 数据库模块
# ============================================================
print_header "M01 数据库模块 (Database)"

test_service "PostgreSQL 本地 (5433)" "nc -z -w 3 localhost 5433" "critical"
test_service "pgvector NAS (5434)" "nc -z -w 3 192.168.3.45 5434" "critical"
test_service "Redis 本地 (6379)" "nc -z -w 3 localhost 6379" "warning"

# PostgreSQL 连接测试
((TOTAL++))
printf "  %-40s" "PostgreSQL 连接测试"
if command -v psql &>/dev/null; then
  if PGPASSWORD=yyc3_admin_password psql -h localhost -p 5433 -U yyc3_admin -d yyc3_devops -c "SELECT 1" &>/dev/null; then
    echo -e "${GREEN}✅ 连接成功${NC}"
    ((PASS++))
  else
    echo -e "${YELLOW}⚠️ 连接失败${NC}"
    ((WARN++))
  fi
else
  echo -e "${YELLOW}⚠️ psql 未安装${NC}"
  ((WARN++))
fi

# pgvector 扩展检查
((TOTAL++))
printf "  %-40s" "pgvector 扩展检查"
if PGPASSWORD=yyc3_vector_2026 psql -h 192.168.3.45 -p 5434 -U yyc3 -d yyc3_vectors -c "SELECT extname FROM pg_extension WHERE extname='vector'" 2>/dev/null | grep -q "vector"; then
  echo -e "${GREEN}✅ 已安装${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️ 未检测到${NC}"
  ((WARN++))
fi

# ============================================================
# M02 AI 模型模块
# ============================================================
print_header "M02 AI 模型模块 (Ollama)"

test_service "Ollama M4 Max (11434)" "curl -s --connect-timeout 3 http://localhost:11434/api/version > /dev/null" "critical"
test_service "Ollama NAS (11434)" "curl -s --connect-timeout 3 http://192.168.3.45:11434/api/version > /dev/null" "warning"
test_service "Ollama iMac (11434)" "curl -s --connect-timeout 3 http://192.168.3.77:11434/api/version > /dev/null" "critical"

# 模型列表检查
((TOTAL++))
printf "  %-40s" "M4 Max 模型数量"
local_models=$(curl -s http://localhost:11434/api/tags 2>/dev/null | grep -o '"name"' | wc -l | xargs)
if [ "$local_models" -gt 0 ]; then
  echo -e "${GREEN}✅ $local_models 个模型${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️ 无模型${NC}"
  ((WARN++))
fi

((TOTAL++))
printf "  %-40s" "iMac 模型数量"
imac_models=$(curl -s http://192.168.3.77:11434/api/tags 2>/dev/null | grep -o '"name"' | wc -l | xargs)
if [ "$imac_models" -gt 0 ]; then
  echo -e "${GREEN}✅ $imac_models 个模型${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️ 无模型${NC}"
  ((WARN++))
fi

# 关键模型检查
for model in "qwen2.5:7b" "codegeex4" "nomic-embed-text"; do
  ((TOTAL++))
  printf "  %-40s" "模型 $model"
  if curl -s http://localhost:11434/api/tags 2>/dev/null | grep -q "\"$model\""; then
    echo -e "${GREEN}✅ 已部署${NC}"
    ((PASS++))
  else
    echo -e "${YELLOW}⚠️ 未部署${NC}"
    ((WARN++))
  fi
done

# ============================================================
# M03 LLM 桥接模块
# ============================================================
print_header "M03 LLM 桥接模块 (LLM Bridge)"

# Provider 配置检查
((TOTAL++))
printf "  %-40s" "Provider 配置文件"
if [ -f "$LIB_DIR/llm-providers.ts" ]; then
  echo -e "${GREEN}✅ 存在${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ 缺失${NC}"
  ((FAIL++))
fi

# Provider 数量统计
((TOTAL++))
printf "  %-40s" "已配置 Provider 数量"
provider_count=$(grep -c "id:" "$LIB_DIR/llm-providers.ts" 2>/dev/null || echo "0")
if [ "$provider_count" -ge 7 ]; then
  echo -e "${GREEN}✅ $provider_count 个${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️ $provider_count 个${NC}"
  ((WARN++))
fi

# LLM Router 检查
((TOTAL++))
printf "  %-40s" "LLM Router 模块"
if [ -f "$LIB_DIR/llm-router.ts" ]; then
  echo -e "${GREEN}✅ 存在${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ 缺失${NC}"
  ((FAIL++))
fi

# ============================================================
# M04 MCP 协议模块
# ============================================================
print_header "M04 MCP 协议模块 (MCP Protocol)"

((TOTAL++))
printf "  %-40s" "MCP Protocol 模块"
if [ -f "$LIB_DIR/mcp-protocol.ts" ]; then
  echo -e "${GREEN}✅ 存在${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ 缺失${NC}"
  ((FAIL++))
fi

# 工具注册检查
((TOTAL++))
printf "  %-40s" "MCP 工具定义"
tool_count=$(grep -c "name:" "$LIB_DIR/mcp-protocol.ts" 2>/dev/null || echo "0")
if [ "$tool_count" -ge 5 ]; then
  echo -e "${GREEN}✅ $tool_count 个工具${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️ $tool_count 个工具${NC}"
  ((WARN++))
fi

# ============================================================
# M05 持久化模块
# ============================================================
print_header "M05 持久化模块 (Persistence)"

((TOTAL++))
printf "  %-40s" "Persistence Engine"
if [ -f "$LIB_DIR/persistence-engine.ts" ]; then
  echo -e "${GREEN}✅ 存在${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ 缺失${NC}"
  ((FAIL++))
fi

((TOTAL++))
printf "  %-40s" "Persist Schemas"
if [ -f "$LIB_DIR/persist-schemas.ts" ]; then
  echo -e "${GREEN}✅ 存在${NC}"
  ((PASS++))
else
  echo -e "${RED}❌ 缺失${NC}"
  ((FAIL++))
fi

# ============================================================
# M06 网络模块
# ============================================================
print_header "M06 网络模块 (Network)"

test_service "NAS SSH (9557)" "nc -z -w 3 192.168.3.45 9557" "critical"
test_service "iMac SSH (22)" "nc -z -w 3 192.168.3.77 22" "critical"
test_service "NAS Docker API (2375)" "curl -s --connect-timeout 3 http://192.168.3.45:2375/_ping > /dev/null" "warning"
test_service "NAS SQLite HTTP (8484)" "curl -s --connect-timeout 3 http://192.168.3.45:8484/ > /dev/null" "warning"

# ============================================================
# 汇总报告
# ============================================================
echo ""
echo "========================================"
echo "  功能模块测试报告"
echo "========================================"
echo ""
echo "  📊 测试项总数: $TOTAL"
echo -e "  ${GREEN}✅ 通过: $PASS${NC}"
echo -e "  ${YELLOW}⚠️ 警告: $WARN${NC}"
echo -e "  ${RED}❌ 失败: $FAIL${NC}"
echo ""

# 计算健康度
HEALTH=$((PASS * 100 / TOTAL))
echo "  🏥 模块健康度: ${HEALTH}%"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}🎉 所有核心模块正常运行！${NC}"
  exit 0
elif [ $FAIL -le 2 ]; then
  echo -e "  ${YELLOW}⚠️ 存在少量问题，建议检查。${NC}"
  exit 0
else
  echo -e "  ${RED}❌ 存在多个关键问题，请立即处理。${NC}"
  exit 1
fi
