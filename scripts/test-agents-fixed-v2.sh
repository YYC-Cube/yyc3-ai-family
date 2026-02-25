#!/bin/bash

# @file test-agents-fixed-v2.sh
# @description YYC³ AI-Family 七大智能体测试脚本（修复版 v2，完全移除特殊字符）
# @author YYC³ Team
# @version 1.0.2
# @created 2026-02-26
# @tags [testing],[agents],[fixed-v2]

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PASS=0
FAIL=0
WARN=0
TOTAL=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_header() {
  echo ""
  echo -e "${MAGENTA}================================================${NC}"
  echo -e "${MAGENTA}  $1${NC}"
  echo -e "${MAGENTA}================================================${NC}"
}

# 测试智能体配置文件
test_agent_configs() {
  local agents=(
    "Navigator"
    "Thinker"
    "Prophet"
    "Bole"
    "Pivot"
    "Sentinel"
    "Grandmaster"
  )
  
  for agent in "${agents[@]}"; do
    TOTAL=$((TOTAL + 1))
    
    # 检查是否有相关的配置或代码文件
    local found=0
    
    # 检查 src/lib 目录
    if [ -d "$PROJECT_ROOT/src/lib" ]; then
      if find "$PROJECT_ROOT/src/lib" -name "*${agent}*" 2>/dev/null | grep -q .; then
        found=1
      fi
    fi
    
    # 检查 packages/bigmodel-sdk 目录
    if [ -d "$PROJECT_ROOT/packages/bigmodel-sdk" ]; then
      if find "$PROJECT_ROOT/packages/bigmodel-sdk" -name "*${agent}*" 2>/dev/null | grep -q .; then
        found=1
      fi
    fi
    
    if [ $found -eq 1 ]; then
      echo -e "${GREEN}[PASS]${NC} | $agent 配置"
      PASS=$((PASS + 1))
    else
      echo -e "${YELLOW}[WARN]${NC} | $agent 配置 (未找到，可能使用默认配置)"
      WARN=$((WARN + 1))
    fi
  done
}

# 测试 Ollama 模型
test_ollama_models() {
  local port=11434
  
  TOTAL=$((TOTAL + 1))
  
  if curl -s --connect-timeout 3 "http://localhost:$port/api/tags" > /dev/null 2>&1; then
    local models=$(curl -s "http://localhost:$port/api/tags" | jq -r '.models[].name' 2>/dev/null)
    echo -e "${GREEN}[PASS]${NC} | Ollama 模型列表"
    echo -e "${MAGENTA}已安装的模型:${NC}"
    if [ -n "$models" ]; then
      echo "$models" | while read model; do
        echo "  - $model"
      done
    fi
    PASS=$((PASS + 1))
  else
    echo -e "${RED}[FAIL]${NC} | Ollama 模型列表"
    FAIL=$((FAIL + 1))
  fi
}

# 测试 AI 集成
test_ai_integration() {
  TOTAL=$((TOTAL + 1))
  
  # 检查是否有 AI SDK
  if [ -f "$PROJECT_ROOT/packages/bigmodel-sdk/index.ts" ]; then
    echo -e "${GREEN}[PASS]${NC} | AI SDK 集成"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}[FAIL]${NC} | AI SDK 集成"
    FAIL=$((FAIL + 1))
  fi
}

# 测试数据库连接
test_database_connection() {
  local db_host="localhost"
  local db_port="5433"
  local db_name="yyc3_devops"
  local db_user="yyc3_admin"
  
  TOTAL=$((TOTAL + 1))
  
  if PGPASSWORD=yyc3_admin_password psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}[PASS]${NC} | 数据库连接"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}[FAIL]${NC} | 数据库连接"
    FAIL=$((FAIL + 1))
  fi
}

# 主函数
main() {
  echo ""
  echo "================================================"
  echo "         YYC³ 七大智能体测试 (修复版 v2)"
  echo "================================================"
  echo ""
  
  print_header "智能体配置"
  test_agent_configs
  
  print_header "AI 模型"
  test_ollama_models
  
  print_header "AI 集成"
  test_ai_integration
  
  print_header "数据库连接"
  test_database_connection
  
  # 计算健康度
  if [ $TOTAL -gt 0 ]; then
    HEALTH=$((PASS * 100 / TOTAL))
  else
    HEALTH=0
  fi
  
  # 评级
  if [ $HEALTH -ge 90 ]; then
    RATING="A (优秀)"
  elif [ $HEALTH -ge 80 ]; then
    RATING="B (良好)"
  elif [ $HEALTH -ge 70 ]; then
    RATING="C (合格)"
  elif [ $HEALTH -ge 60 ]; then
    RATING="D (需改进)"
  else
    RATING="F (不合格)"
  fi
  
  echo ""
  echo "================================================"
  echo "测试结果"
  echo "================================================"
  echo ""
  echo "  测试项总数: $TOTAL"
  echo "  [通过]: $PASS"
  echo "  [警告]: $WARN"
  echo "  [失败]: $FAIL"
  echo ""
  echo "  综合健康度: $HEALTH%"
  echo "  评级: $RATING"
  echo ""
  
  if [ $HEALTH -ge 70 ]; then
    echo -e "${GREEN}[SUCCESS] 测试通过！${NC}"
    exit 0
  else
    echo -e "${RED}[ERROR] 测试未通过！${NC}"
    exit 1
  fi
}

main "$@"
