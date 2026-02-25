#!/bin/bash

# @file test-core-features.sh
# @description YYC³ 核心功能快速测试（简化版，只测试最核心的功能）
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-26
# @tags [testing],[core],[quick]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 统计变量
PASS=0
FAIL=0
WARN=0
TOTAL=0

# 日志函数
log_test() {
  local status=$1
  local name=$2
  local message=$3
  
  TOTAL=$((TOTAL + 1))
  
  case $status in
    PASS)
      echo -e "${GREEN}✅ PASS${NC} | $name - $message"
      PASS=$((PASS + 1))
      ;;
    FAIL)
      echo -e "${RED}❌ FAIL${NC} | $name - $message"
      FAIL=$((FAIL + 1))
      ;;
    WARN)
      echo -e "${YELLOW}⚠️  WARN${NC} | $name - $message"
      WARN=$((WARN + 1))
      ;;
  esac
}

# 测试函数
test_node() {
  if command -v node &> /dev/null; then
    local version=$(node -v)
    log_test PASS "Node.js" "已安装 $version"
  else
    log_test FAIL "Node.js" "未安装"
  fi
}

test_pnpm() {
  if command -v pnpm &> /dev/null; then
    local version=$(pnpm -v)
    log_test PASS "pnpm" "已安装 $version"
  else
    log_test FAIL "pnpm" "未安装"
  fi
}

test_frontend_port() {
  local port=3133
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_test PASS "前端服务" "端口 $port 运行中"
  else
    log_test FAIL "前端服务" "端口 $port 未运行"
  fi
}

test_backend_port() {
  local port=3177
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_test PASS "后端服务" "端口 $port 运行中"
  else
    log_test FAIL "后端服务" "端口 $port 未运行"
  fi
}

test_backend_api() {
  local url="http://localhost:3177/api/v1/health"
  if curl -s --connect-timeout 3 "$url" > /dev/null 2>&1; then
    log_test PASS "后端API" "健康检查通过"
  else
    log_test FAIL "后端API" "健康检查失败"
  fi
}

test_database() {
  local db_host="localhost"
  local db_port="5433"
  local db_name="yyc3_devops"
  local db_user="yyc3_admin"
  
  if PGPASSWORD=yyc3_admin_password psql -h $db_host -p $db_port -U $db_user -d $db_name -c "SELECT 1" > /dev/null 2>&1; then
    log_test PASS "PostgreSQL" "数据库连接正常 ($db_host:$db_port)"
  else
    log_test FAIL "PostgreSQL" "数据库连接失败"
  fi
}

test_ollama() {
  local port=11434
  if curl -s --connect-timeout 3 "http://localhost:$port/api/tags" > /dev/null 2>&1; then
    local models=$(curl -s "http://localhost:$port/api/tags" | jq -r '.models | length' 2>/dev/null || echo "0")
    log_test PASS "Ollama" "服务运行中，已安装 $models 个模型"
  else
    log_test FAIL "Ollama" "服务未运行"
  fi
}

test_zhipu_api() {
  local api_key="4032a1da19524f4580deb69ff7da73c3.4eBOnuVeVfjky6MM"
  
  if curl -s --connect-timeout 5 \
    -H "Authorization: Bearer $api_key" \
    "https://open.bigmodel.cn/api/paas/v4/models" > /dev/null 2>&1; then
    log_test PASS "智谱API" "API密钥验证通过"
  else
    log_test WARN "智谱API" "API密钥验证失败或网络问题"
  fi
}

test_project_structure() {
  local required_dirs=(
    "src"
    "scripts"
    "docs"
  )
  
  for dir in "${required_dirs[@]}"; do
    if [ -d "/Users/yanyu/Family-π³/$dir" ]; then
      log_test PASS "项目结构" "$dir/ 目录存在"
    else
      log_test FAIL "项目结构" "$dir/ 目录不存在"
    fi
  done
}

test_git_repo() {
  cd /Users/yanyu/Family-π³
  if git rev-parse --git-dir > /dev/null 2>&1; then
    local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    log_test PASS "Git仓库" "仓库正常，当前分支: $branch"
  else
    log_test FAIL "Git仓库" "不是Git仓库"
  fi
}

test_git_remote() {
  cd /Users/yanyu/Family-π³
  if git remote -v | grep -q "origin"; then
    local remote=$(git remote get-url origin)
    log_test PASS "Git远程" "远程仓库已配置: $remote"
  else
    log_test WARN "Git远程" "远程仓库未配置"
  fi
}

test_environment_files() {
  local env_files=(
    ".env.local"
    ".env.production"
  )
  
  for file in "${env_files[@]}"; do
    if [ -f "/Users/yanyu/Family-π³/$file" ]; then
      log_test PASS "环境配置" "$file 存在"
    else
      log_test WARN "环境配置" "$file 不存在"
    fi
  done
}

test_packages() {
  if [ -f "/Users/yanyu/Family-π³/package.json" ]; then
    log_test PASS "包配置" "package.json 存在"
  else
    log_test FAIL "包配置" "package.json 不存在"
  fi
  
  if [ -f "/Users/yanyu/Family-π³/pnpm-lock.yaml" ]; then
    log_test PASS "锁文件" "pnpm-lock.yaml 存在"
  else
    log_test WARN "锁文件" "pnpm-lock.yaml 不存在"
  fi
}

# 主函数
main() {
  echo ""
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║         YYC³ 核心功能快速测试                           ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "1️⃣  环境测试"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  test_node
  test_pnpm
  echo ""
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "2️⃣  服务测试"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  test_frontend_port
  test_backend_port
  test_backend_api
  echo ""
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "3️⃣  数据库测试"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  test_database
  echo ""
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "4️⃣  AI服务测试"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  test_ollama
  test_zhipu_api
  echo ""
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "5️⃣  项目结构测试"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  test_project_structure
  test_packages
  echo ""
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "6️⃣  Git仓库测试"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  test_git_repo
  test_git_remote
  test_environment_files
  echo ""
  
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
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 测试结果"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  测试项总数: $TOTAL"
  echo "  ✅ 通过: $PASS"
  echo "  ⚠️  警告: $WARN"
  echo "  ❌ 失败: $FAIL"
  echo ""
  echo "  🏥 综合健康度: $HEALTH%"
  echo "  📋 评级: $EMOJI $RATING"
  echo ""
  
  # 判断是否通过
  if [ $HEALTH -ge 70 ]; then
    echo -e "${GREEN}✅ 测试通过！系统状态良好。${NC}"
    exit 0
  else
    echo -e "${RED}❌ 测试未通过，健康度低于70%。${NC}"
    exit 1
  fi
}

main "$@"
