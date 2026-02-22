#!/bin/bash
# YYC³ AI Family - 项目启动测试清单
# 文件: /Users/yanyu/YYC3-Mac-Max/Family-π³/scripts/startup-test.sh
# 用途: 全面测试集群服务状态

set -e

echo "========================================"
echo "  YYC³ AI Family 项目启动测试"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

PASS=0
FAIL=0
WARN=0

test_service() {
  local name=$1
  local command=$2
  local critical=$3
  
  printf "%-35s" "$name"
  if eval "$command" &>/dev/null; then
    echo "✅ 通过"
    ((PASS++))
  else
    if [ "$critical" = "critical" ]; then
      echo "❌ 失败 (关键)"
      ((FAIL++))
    else
      echo "⚠️ 警告"
      ((WARN++))
    fi
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 网络连接测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_service "NAS SSH (9557)" "nc -z -w 3 192.168.3.45 9557" "critical"
test_service "NAS Web (9898)" "curl -s --connect-timeout 3 http://192.168.3.45:9898 > /dev/null" "warning"
test_service "iMac SSH (22)" "nc -z -w 3 192.168.3.77 22" "critical"
test_service "iMac Ollama (11434)" "curl -s --connect-timeout 3 http://192.168.3.77:11434/api/version > /dev/null" "critical"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️ 数据库连接测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_service "PostgreSQL 本地 (5433)" "nc -z -w 3 localhost 5433" "critical"
test_service "pgvector NAS (5434)" "nc -z -w 3 192.168.3.45 5434" "critical"
test_service "Redis 本地 (6379)" "nc -z -w 3 localhost 6379" "warning"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 AI 模型服务测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_service "Ollama M4 Max (11434)" "curl -s --connect-timeout 3 http://localhost:11434/api/version > /dev/null" "critical"
test_service "Ollama NAS (11434)" "curl -s --connect-timeout 3 http://192.168.3.45:11434/api/version > /dev/null" "warning"
test_service "Ollama iMac (11434)" "curl -s --connect-timeout 3 http://192.168.3.77:11434/api/version > /dev/null" "critical"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Web 服务测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_service "Frontend (3200)" "nc -z -w 3 localhost 3200" "warning"
test_service "API Server (3210)" "nc -z -w 3 localhost 3210" "warning"
test_service "WebSocket (3001)" "nc -z -w 3 localhost 3001" "warning"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 NAS 服务测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_service "Docker API (2375)" "curl -s --connect-timeout 3 http://192.168.3.45:2375/_ping > /dev/null" "warning"
test_service "SQLite HTTP (8484)" "curl -s --connect-timeout 3 http://192.168.3.45:8484/ > /dev/null" "warning"
test_service "WS Relay (9090)" "curl -s --connect-timeout 3 http://192.168.3.45:9090/ > /dev/null" "warning"
echo ""

echo "========================================"
echo "  测试结果统计"
echo "========================================"
echo "  ✅ 通过: $PASS"
echo "  ⚠️ 警告: $WARN"
echo "  ❌ 失败: $FAIL"
echo "========================================"
echo ""

if [ $FAIL -gt 0 ]; then
  echo "❌ 存在关键服务未启动，请检查后重试"
  exit 1
elif [ $WARN -gt 0 ]; then
  echo "⚠️ 部分服务未启动，但不影响核心功能"
  echo ""
  echo "启动建议:"
  echo "  - Frontend: cd Family-π³/AI-Family && pnpm dev"
  echo "  - API: cd Family-π³/API && pnpm dev"
  echo "  - Redis: brew services start redis"
  exit 0
else
  echo "✅ 所有服务正常，可以启动项目"
  exit 0
fi
