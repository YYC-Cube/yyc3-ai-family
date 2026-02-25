#!/bin/bash

# @file test-modules-fixed.sh
# @description YYC³ AI-Family 功能模块测试脚本（修复版，减少误报）
# @author YYC³ Team
# @version 1.0.1
# @created 2026-02-26
# @tags [testing],[modules],[fixed]

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_service() {
  local name=$1
  local command=$2
  
  TOTAL=$((TOTAL + 1))
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC} | $name"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL${NC} | $name"
    FAIL=$((FAIL + 1))
  fi
}

# 测试 PostgreSQL（本机）
test_postgresql() {
  local db_host="localhost"
  local db_port="5433"
  local db_name="yyc3_devops"
  local db_user="yyc3_admin"
  
  TOTAL=$((TOTAL + 1))
  
  if PGPASSWORD=yyc3_admin_password psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC} | PostgreSQL 连接测试"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL${NC} | PostgreSQL 连接测试"
    FAIL=$((FAIL + 1))
  fi
}

# 测试 Ollama（本机）
test_ollama() {
  local port=11434
  
  TOTAL=$((TOTAL + 1))
  
  if curl -s --connect-timeout 3 "http://localhost:$port/api/tags" > /dev/null 2>&1; then
    local models=$(curl -s "http://localhost:$port/api/tags" | jq -r '.models | length' 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ PASS${NC} | Ollama 服务 (已安装 $models 个模型)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL${NC} | Ollama 服务"
    FAIL=$((FAIL + 1))
  fi
}

# 测试后端 API
test_backend() {
  local url="http://localhost:3177/api/v1/health"
  
  TOTAL=$((TOTAL + 1))
  
  if curl -s --connect-timeout 3 "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC} | 后端 API 健康检查"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL${NC} | 后端 API 健康检查"
    FAIL=$((FAIL + 1))
  fi
}

# 测试前端服务
test_frontend() {
  local port=3133
  
  TOTAL=$((TOTAL + 1))
  
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC} | 前端服务 (端口 $port)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL${NC} | 前端服务 (端口 $port)"
    FAIL=$((FAIL + 1))
  fi
}

# 测试智谱 API（可选）
test_zhipu_api() {
  local api_key="4032a1da19524f4580deb69ff7da73c3.4eBOnuVeVfjky6MM"
  
  TOTAL=$((TOTAL + 1))
  
  if curl -s --connect-timeout 5 \
    -H "Authorization: Bearer $api_key" \
    "https://open.bigmodel.cn/api/paas/v4/models" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC} | 智谱 API 验证"
    PASS=$((PASS + 1))
  else
    echo -e "${YELLOW}⚠️  WARN${NC} | 智谱 API 验证（网络问题或密钥过期）"
    WARN=$((WARN + 1))
  fi
}

# 测试项目文件
test_project_files() {
  local files=(
    "$PROJECT_ROOT/package.json"
    "$PROJECT_ROOT/pnpm-lock.yaml"
    "$PROJECT_ROOT/.env.local"
    "$PROJECT_ROOT/src/server/index.ts"
  )
  
  for file in "${files[@]}"; do
    TOTAL=$((TOTAL + 1))
    if [ -f "$file" ]; then
      echo -e "${GREEN}✅ PASS${NC} | 项目文件: $(basename $file)"
      PASS=$((PASS + 1))
    else
      echo -e "${RED}❌ FAIL${NC} | 项目文件: $(basename $file)"
      FAIL=$((FAIL + 1))
    fi
  done
}

# 主函数
main() {
  echo ""
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║         YYC³ 功能模块测试（修复版）                 ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo ""
  
  print_header "数据库模块"
  test_postgresql
  
  print_header "AI 模型模块"
  test_ollama
  test_zhipu_api
  
  print_header "服务模块"
  test_backend
  test_frontend
  
  print_header "项目文件"
  test_project_files
  
  # 计算健康度
  if [ $TOTAL -gt 0 ]; then
    HEALTH=$((PASS * 100 / TOTAL))
  else
    HEALTH=0
  fi
  
  # 评级
  if [ $HEALTH -ge 90 ]; then
    RATING="A (优秀)"
    EMOJI="🌟"
  elif [ $HEALTH -ge 80 ]; then
    RATING="B (良好)"
    EMOJI="✨"
  elif [ $HEALTH -ge 70 ]; then
    RATING="C (合格)"
    EMOJI="✅"
  elif [ $HEALTH -ge 60 ]; then
    RATING="D (需改进)"
    EMOJI="⚠️"
  else
    RATING="F (不合格)"
    EMOJI="❌"
  fi
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 测试结果"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  测试项总数: $TOTAL"
  echo "  ✅ 通过: $PASS"
  echo "  ⚠️  警告: $WARN"
  echo "  ❌ 失败: $FAIL"
  echo ""
  echo "  🏥 综合健康度: $HEALTH%"
  echo "  📋 评级: $EMOJI $RATING"
  echo ""
  
  if [ $HEALTH -ge 70 ]; then
    echo -e "${GREEN}✅ 测试通过！${NC}"
    exit 0
  else
    echo -e "${RED}❌ 测试未通过！${NC}"
    exit 1
  fi
}

main "$@"
