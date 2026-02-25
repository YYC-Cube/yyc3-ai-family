#!/bin/bash

# @file test-nine-layers.sh
# @description YYC³ AI-Family 九层架构测试脚本，按九层架构逐层验证模块完整性
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [testing],[architecture],[nine-layers]

# ============================================================
# YYC³ AI Family - 九层架构测试脚本
# 文件: /Users/yanyu/YYC3-Mac-Max/Family-π³/scripts/test-nine-layers.sh
# 用途: 按九层架构逐层验证模块完整性
#
# 架构映射:
#   L01 基础设施层 - nas-client, pg-telemetry, proxy-endpoints, crypto
#   L02 布局层     - Sidebar, MobileNavBar, ResizablePanels
#   L03 可视化层   - ConsoleView, CyberSkeleton
#   L04 智能体层   - agent-orchestrator, AgentChatInterface
#   L05 LLM桥接层  - llm-bridge, llm-providers, llm-router
#   L06 MCP协议层  - mcp-protocol
#   L07 持久化层   - persistence-engine, persist-schemas
#   L08 错误恢复层 - ComponentErrorBoundary
#   L09 品牌定制层 - SettingsModal
# ============================================================

set -e

PROJECT_ROOT="/Users/yanyu/YYC3-Mac-Max/Family-π³"
SRC_DIR="$PROJECT_ROOT/src"
LIB_DIR="$SRC_DIR/lib"
COMPONENTS_DIR="$SRC_DIR/app/components"

PASS=0
FAIL=0
WARN=0
TOTAL=0

print_header() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  $1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

test_file() {
  local file=$1
  local name=$2
  ((TOTAL++))
  printf "  %-45s" "$name"
  if [ -f "$file" ]; then
    echo "✅ 存在"
    ((PASS++))
  else
    echo "❌ 缺失"
    ((FAIL++))
  fi
}

test_dir() {
  local dir=$1
  local name=$2
  ((TOTAL++))
  printf "  %-45s" "$name"
  if [ -d "$dir" ]; then
    local count=$(find "$dir" -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ $count 文件"
    ((PASS++))
  else
    echo "❌ 目录缺失"
    ((FAIL++))
  fi
}

test_export() {
  local file=$1
  local export=$2
  local name=$3
  ((TOTAL++))
  printf "  %-45s" "$name"
  if [ -f "$file" ] && grep -q "export.*$export" "$file" 2>/dev/null; then
    echo "✅ 已导出"
    ((PASS++))
  else
    echo "⚠️ 未找到"
    ((WARN++))
  fi
}

echo "========================================"
echo "  YYC³ AI Family 九层架构测试"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# ============================================================
# L01 基础设施层 (Infrastructure)
# ============================================================
print_header "L01 基础设施层 (Infrastructure)"

test_file "$LIB_DIR/nas-client.ts" "nas-client.ts"
test_file "$LIB_DIR/pg-telemetry-client.ts" "pg-telemetry-client.ts"
test_file "$LIB_DIR/proxy-endpoints.ts" "proxy-endpoints.ts"
test_file "$LIB_DIR/crypto.ts" "crypto.ts"
test_file "$LIB_DIR/utils.ts" "utils.ts"

test_export "$LIB_DIR/nas-client.ts" "DEFAULT_DEVICES" "DEFAULT_DEVICES 注册表"
test_export "$LIB_DIR/proxy-endpoints.ts" "resolveProviderEndpoint" "resolveProviderEndpoint"

# ============================================================
# L02 布局层 (Layout)
# ============================================================
print_header "L02 布局层 (Layout)"

test_file "$COMPONENTS_DIR/layout/Sidebar.tsx" "Sidebar.tsx"
test_file "$COMPONENTS_DIR/layout/MobileNavBar.tsx" "MobileNavBar.tsx"
test_file "$COMPONENTS_DIR/ui/resizable.tsx" "resizable.tsx"
test_file "$COMPONENTS_DIR/ui/resizable-panels.tsx" "resizable-panels.tsx"

# ============================================================
# L03 可视化层 (Visualization)
# ============================================================
print_header "L03 可视化层 (Visualization)"

test_file "$COMPONENTS_DIR/console/ConsoleView.tsx" "ConsoleView.tsx"
test_file "$COMPONENTS_DIR/ui/cyber-skeleton.tsx" "cyber-skeleton.tsx"
test_file "$COMPONENTS_DIR/monitoring/HardwareMonitor.tsx" "HardwareMonitor.tsx"
test_file "$COMPONENTS_DIR/monitoring/ServiceHealthMonitor.tsx" "ServiceHealthMonitor.tsx"

test_dir "$COMPONENTS_DIR/console" "Console 面板组件"

# ============================================================
# L04 智能体层 (Agents)
# ============================================================
print_header "L04 智能体层 (Agents)"

test_file "$LIB_DIR/agent-orchestrator.ts" "agent-orchestrator.ts"
test_file "$LIB_DIR/agent-identity.ts" "agent-identity.ts"
test_file "$COMPONENTS_DIR/console/AgentChatInterface.tsx" "AgentChatInterface.tsx"
test_file "$COMPONENTS_DIR/console/AgentIdentityCard.tsx" "AgentIdentityCard.tsx"
test_file "$COMPONENTS_DIR/console/AgentOrchestrator.tsx" "AgentOrchestrator.tsx"

test_export "$LIB_DIR/types.ts" "AGENT_REGISTRY" "AGENT_REGISTRY 智能体注册表"
test_export "$LIB_DIR/types.ts" "AgentId" "AgentId 类型定义"

# ============================================================
# L05 LLM 桥接层 (LLM Bridge)
# ============================================================
print_header "L05 LLM 桥接层 (LLM Bridge)"

test_file "$LIB_DIR/llm-bridge.ts" "llm-bridge.ts"
test_file "$LIB_DIR/llm-providers.ts" "llm-providers.ts"
test_file "$LIB_DIR/llm-router.ts" "llm-router.ts"

test_export "$LIB_DIR/llm-bridge.ts" "agentStreamChat" "agentStreamChat 函数"
test_export "$LIB_DIR/llm-bridge.ts" "streamChat" "streamChat 函数"
test_export "$LIB_DIR/llm-bridge.ts" "LLMError" "LLMError 类"
test_export "$LIB_DIR/llm-providers.ts" "PROVIDERS" "PROVIDERS 配置"
test_export "$LIB_DIR/llm-router.ts" "getRouter" "getRouter 路由器"

# ============================================================
# L06 MCP 协议层 (MCP Protocol)
# ============================================================
print_header "L06 MCP 协议层 (MCP Protocol)"

test_file "$LIB_DIR/mcp-protocol.ts" "mcp-protocol.ts"

test_export "$LIB_DIR/mcp-protocol.ts" "executeMCPCall" "executeMCPCall 函数"
test_export "$LIB_DIR/mcp-protocol.ts" "MCPToolRegistry" "MCPToolRegistry 类"
test_export "$LIB_DIR/mcp-protocol.ts" "generateMCPServerCode" "generateMCPServerCode 函数"

# ============================================================
# L07 持久化层 (Persistence)
# ============================================================
print_header "L07 持久化层 (Persistence)"

test_file "$LIB_DIR/persistence-engine.ts" "persistence-engine.ts"
test_file "$LIB_DIR/persist-schemas.ts" "persist-schemas.ts"
test_file "$LIB_DIR/persistence-binding.ts" "persistence-binding.ts"

test_export "$LIB_DIR/persistence-engine.ts" "PersistenceEngine" "PersistenceEngine 类"
test_export "$LIB_DIR/persistence-engine.ts" "LocalStorageAdapter" "LocalStorageAdapter 类"

# ============================================================
# L08 错误恢复层 (Error Recovery)
# ============================================================
print_header "L08 错误恢复层 (Error Recovery)"

test_file "$COMPONENTS_DIR/console/ComponentErrorBoundary.tsx" "ComponentErrorBoundary.tsx"

test_export "$COMPONENTS_DIR/console/ComponentErrorBoundary.tsx" "ComponentErrorBoundary" "ComponentErrorBoundary 组件"

# ============================================================
# L09 品牌定制层 (Branding)
# ============================================================
print_header "L09 品牌定制层 (Branding)"

test_file "$LIB_DIR/branding-config.ts" "branding-config.ts"
test_file "$COMPONENTS_DIR/settings/SettingsModal.tsx" "SettingsModal.tsx"

test_export "$LIB_DIR/branding-config.ts" "BrandingConfig" "BrandingConfig 类型"
test_export "$LIB_DIR/branding-config.ts" "defaultBranding" "defaultBranding 配置"

# ============================================================
# 核心模块测试
# ============================================================
print_header "核心模块 (Core Modules)"

test_file "$LIB_DIR/store.ts" "store.ts (Zustand)"
test_file "$LIB_DIR/event-bus.ts" "event-bus.ts"
test_file "$LIB_DIR/api.ts" "api.ts"
test_file "$LIB_DIR/types.ts" "types.ts"
test_file "$SRC_DIR/app/App.tsx" "App.tsx"

test_export "$LIB_DIR/store.ts" "useStore" "useStore Hook"
test_export "$LIB_DIR/event-bus.ts" "eventBus" "eventBus 实例"

# ============================================================
# 测试文件检查
# ============================================================
print_header "测试覆盖 (Test Coverage)"

test_dir "$LIB_DIR/__tests__" "测试文件目录"

test_file "$LIB_DIR/__tests__/store.test.ts" "store.test.ts"
test_file "$LIB_DIR/__tests__/llm-bridge.test.ts" "llm-bridge.test.ts"
test_file "$LIB_DIR/__tests__/persistence-engine.test.ts" "persistence-engine.test.ts"
test_file "$LIB_DIR/__tests__/nas-client.test.ts" "nas-client.test.ts"
test_file "$LIB_DIR/__tests__/mcp-protocol.test.ts" "mcp-protocol.test.ts"
test_file "$LIB_DIR/__tests__/core-test-suite.ts" "core-test-suite.ts"

# ============================================================
# UI 组件库检查
# ============================================================
print_header "UI 组件库 (UI Components)"

test_dir "$COMPONENTS_DIR/ui" "UI 基础组件"

# 关键 UI 组件
for comp in button card dialog tabs input textarea select checkbox switch slider; do
  test_file "$COMPONENTS_DIR/ui/${comp}.tsx" "${comp}.tsx"
done

# ============================================================
# 服务端模块检查
# ============================================================
print_header "服务端模块 (Server)"

test_file "$SRC_DIR/server/index.ts" "server/index.ts"
test_file "$SRC_DIR/server/routes.ts" "server/routes.ts"
test_file "$SRC_DIR/server/ws.ts" "server/ws.ts"

# ============================================================
# 汇总报告
# ============================================================
echo ""
echo "========================================"
echo "  九层架构测试报告"
echo "========================================"
echo ""
echo "  📊 测试项总数: $TOTAL"
echo "  ✅ 通过: $PASS"
echo "  ⚠️ 警告: $WARN"
echo "  ❌ 失败: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "  🎉 九层架构完整性验证通过！"
  exit 0
else
  echo "  ⚠️ 存在 $FAIL 个缺失模块，请检查。"
  exit 1
fi
