#!/bin/bash
# ============================================================
# YYC³ AI Family - 综合测试报告工具
# 文件: /Users/yanyu/YYC3-Mac-Max/Family-π³/scripts/test-comprehensive.sh
# 用途: 执行全量测试并生成综合报告
#
# 测试维度:
#   D1 九层架构完整性
#   D2 功能模块连接性
#   D3 七大智能体就绪度
#   D4 数据库服务状态
#   D5 AI 模型服务状态
#   D6 网络连通性
# ============================================================

set -e

SCRIPT_DIR="/Users/yanyu/YYC3-Mac-Max/Family-π³/scripts"
REPORT_DIR="/Users/yanyu/YYC3-Mac-Max/Family-π³/test-reports"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
REPORT_FILE="$REPORT_DIR/comprehensive-report-$TIMESTAMP.md"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

mkdir -p "$REPORT_DIR"

echo "========================================"
echo -e "${BOLD}  YYC³ AI Family 综合测试报告${NC}"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# 初始化报告文件
cat > "$REPORT_FILE" << EOF
# YYC³ AI Family 综合测试报告

> ***YanYuCloudCube***
> 言启象限 | 语枢未来

---

**报告生成时间**: $(date '+%Y-%m-%d %H:%M:%S')
**测试执行者**: YYC³ Test Framework
**项目版本**: 0.33.0

---

## 📋 测试概览

| 维度 | 测试项 | 通过 | 警告 | 失败 | 健康度 |
|------|--------|------|------|------|--------|
EOF

# ============================================================
# D1 九层架构测试
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  D1 九层架构完整性测试${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

D1_OUTPUT=$("$SCRIPT_DIR/test-nine-layers.sh" 2>&1 || true)
D1_PASS=$(echo "$D1_OUTPUT" | grep "✅ 通过:" | grep -o '[0-9]*' || echo "0")
D1_WARN=$(echo "$D1_OUTPUT" | grep "⚠️ 警告:" | grep -o '[0-9]*' || echo "0")
D1_FAIL=$(echo "$D1_OUTPUT" | grep "❌ 失败:" | grep -o '[0-9]*' || echo "0")
D1_TOTAL=$((D1_PASS + D1_WARN + D1_FAIL))
D1_HEALTH=$((D1_PASS * 100 / (D1_TOTAL > 0 ? D1_TOTAL : 1)))

echo "  测试项: $D1_TOTAL | 通过: $D1_PASS | 警告: $D1_WARN | 失败: $D1_FAIL"
echo "  健康度: ${D1_HEALTH}%"

# ============================================================
# D2 功能模块测试
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  D2 功能模块连接性测试${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

D2_OUTPUT=$("$SCRIPT_DIR/test-modules.sh" 2>&1 || true)
D2_PASS=$(echo "$D2_OUTPUT" | grep "✅ 通过:" | grep -o '[0-9]*' || echo "0")
D2_WARN=$(echo "$D2_OUTPUT" | grep "⚠️ 警告:" | grep -o '[0-9]*' || echo "0")
D2_FAIL=$(echo "$D2_OUTPUT" | grep "❌ 失败:" | grep -o '[0-9]*' || echo "0")
D2_TOTAL=$((D2_PASS + D2_WARN + D2_FAIL))
D2_HEALTH=$((D2_PASS * 100 / (D2_TOTAL > 0 ? D2_TOTAL : 1)))

echo "  测试项: $D2_TOTAL | 通过: $D2_PASS | 警告: $D2_WARN | 失败: $D2_FAIL"
echo "  健康度: ${D2_HEALTH}%"

# ============================================================
# D3 智能体测试
# ============================================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}  D3 七大智能体就绪度测试${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

D3_OUTPUT=$("$SCRIPT_DIR/test-agents.sh" 2>&1 || true)
D3_PASS=$(echo "$D3_OUTPUT" | grep "✅ 通过:" | grep -o '[0-9]*' || echo "0")
D3_WARN=$(echo "$D3_OUTPUT" | grep "⚠️ 警告:" | grep -o '[0-9]*' || echo "0")
D3_FAIL=$(echo "$D3_OUTPUT" | grep "❌ 失败:" | grep -o '[0-9]*' || echo "0")
D3_TOTAL=$((D3_PASS + D3_WARN + D3_FAIL))
D3_HEALTH=$((D3_PASS * 100 / (D3_TOTAL > 0 ? D3_TOTAL : 1)))

echo "  测试项: $D3_TOTAL | 通过: $D3_PASS | 警告: $D3_WARN | 失败: $D3_FAIL"
echo "  健康度: ${D3_HEALTH}%"

# ============================================================
# D4 数据库服务测试
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  D4 数据库服务状态测试${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

D4_PASS=0
D4_WARN=0
D4_FAIL=0

# PostgreSQL 本地
printf "  %-30s" "PostgreSQL 本地 (5433)"
if nc -z -w 3 localhost 5433 2>/dev/null; then
  echo -e "${GREEN}✅ 正常${NC}"
  ((D4_PASS++))
else
  echo -e "${RED}❌ 失败${NC}"
  ((D4_FAIL++))
fi

# pgvector NAS
printf "  %-30s" "pgvector NAS (5434)"
if nc -z -w 3 192.168.3.45 5434 2>/dev/null; then
  echo -e "${GREEN}✅ 正常${NC}"
  ((D4_PASS++))
else
  echo -e "${RED}❌ 失败${NC}"
  ((D4_FAIL++))
fi

# Redis
printf "  %-30s" "Redis 本地 (6379)"
if nc -z -w 3 localhost 6379 2>/dev/null; then
  echo -e "${GREEN}✅ 正常${NC}"
  ((D4_PASS++))
else
  echo -e "${YELLOW}⚠️ 未启动${NC}"
  ((D4_WARN++))
fi

D4_TOTAL=$((D4_PASS + D4_WARN + D4_FAIL))
D4_HEALTH=$((D4_PASS * 100 / (D4_TOTAL > 0 ? D4_TOTAL : 1)))

echo "  健康度: ${D4_HEALTH}%"

# ============================================================
# D5 AI 模型服务测试
# ============================================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}  D5 AI 模型服务状态测试${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

D5_PASS=0
D5_WARN=0
D5_FAIL=0

# Ollama 各节点
for endpoint in "localhost:11434" "192.168.3.45:11434" "192.168.3.77:11434"; do
  printf "  %-30s" "Ollama $endpoint"
  if curl -s --connect-timeout 3 "http://$endpoint/api/version" &>/dev/null; then
    echo -e "${GREEN}✅ 正常${NC}"
    ((D5_PASS++))
  else
    echo -e "${RED}❌ 失败${NC}"
    ((D5_FAIL++))
  fi
done

D5_TOTAL=$((D5_PASS + D5_WARN + D5_FAIL))
D5_HEALTH=$((D5_PASS * 100 / (D5_TOTAL > 0 ? D5_TOTAL : 1)))

echo "  健康度: ${D5_HEALTH}%"

# ============================================================
# D6 网络连通性测试
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  D6 网络连通性测试${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

D6_PASS=0
D6_WARN=0
D6_FAIL=0

# SSH 连接
printf "  %-30s" "NAS SSH (9557)"
if nc -z -w 3 192.168.3.45 9557 2>/dev/null; then
  echo -e "${GREEN}✅ 正常${NC}"
  ((D6_PASS++))
else
  echo -e "${RED}❌ 失败${NC}"
  ((D6_FAIL++))
fi

printf "  %-30s" "iMac SSH (22)"
if nc -z -w 3 192.168.3.77 22 2>/dev/null; then
  echo -e "${GREEN}✅ 正常${NC}"
  ((D6_PASS++))
else
  echo -e "${RED}❌ 失败${NC}"
  ((D6_FAIL++))
fi

# NAS 服务
printf "  %-30s" "NAS Docker API (2375)"
if curl -s --connect-timeout 3 http://192.168.3.45:2375/_ping &>/dev/null; then
  echo -e "${GREEN}✅ 正常${NC}"
  ((D6_PASS++))
else
  echo -e "${YELLOW}⚠️ 未响应${NC}"
  ((D6_WARN++))
fi

D6_TOTAL=$((D6_PASS + D6_WARN + D6_FAIL))
D6_HEALTH=$((D6_PASS * 100 / (D6_TOTAL > 0 ? D6_TOTAL : 1)))

echo "  健康度: ${D6_HEALTH}%"

# ============================================================
# 汇总计算
# ============================================================
TOTAL_PASS=$((D1_PASS + D2_PASS + D3_PASS + D4_PASS + D5_PASS + D6_PASS))
TOTAL_WARN=$((D1_WARN + D2_WARN + D3_WARN + D4_WARN + D5_WARN + D6_WARN))
TOTAL_FAIL=$((D1_FAIL + D2_FAIL + D3_FAIL + D4_FAIL + D5_FAIL + D6_FAIL))
TOTAL_ALL=$((TOTAL_PASS + TOTAL_WARN + TOTAL_FAIL))
OVERALL_HEALTH=$((TOTAL_PASS * 100 / (TOTAL_ALL > 0 ? TOTAL_ALL : 1)))

# ============================================================
# 生成报告
# ============================================================
cat >> "$REPORT_FILE" << EOF
| D1 九层架构 | $D1_TOTAL | $D1_PASS | $D1_WARN | $D1_FAIL | ${D1_HEALTH}% |
| D2 功能模块 | $D2_TOTAL | $D2_PASS | $D2_WARN | $D2_FAIL | ${D2_HEALTH}% |
| D3 智能体 | $D3_TOTAL | $D3_PASS | $D3_WARN | $D3_FAIL | ${D3_HEALTH}% |
| D4 数据库 | $D4_TOTAL | $D4_PASS | $D4_WARN | $D4_FAIL | ${D4_HEALTH}% |
| D5 AI模型 | $D5_TOTAL | $D5_PASS | $D5_WARN | $D5_FAIL | ${D5_HEALTH}% |
| D6 网络 | $D6_TOTAL | $D6_PASS | $D6_WARN | $D6_FAIL | ${D6_HEALTH}% |
| **总计** | **$TOTAL_ALL** | **$TOTAL_PASS** | **$TOTAL_WARN** | **$TOTAL_FAIL** | **${OVERALL_HEALTH}%** |

---

## 📊 详细测试结果

### D1 九层架构完整性

\`\`\`
$(echo "$D1_OUTPUT" | tail -20)
\`\`\`

### D2 功能模块连接性

\`\`\`
$(echo "$D2_OUTPUT" | tail -20)
\`\`\`

### D3 七大智能体就绪度

\`\`\`
$(echo "$D3_OUTPUT" | tail -20)
\`\`\`

### D4 数据库服务状态

| 服务 | 端口 | 状态 |
|------|------|------|
| PostgreSQL 本地 | 5433 | $([ $D4_PASS -ge 1 ] && echo "✅ 正常" || echo "❌ 异常") |
| pgvector NAS | 5434 | $([ $D4_PASS -ge 2 ] && echo "✅ 正常" || echo "❌ 异常") |
| Redis | 6379 | $([ $D4_WARN -eq 0 ] && echo "✅ 正常" || echo "⚠️ 未启动") |

### D5 AI 模型服务状态

| 节点 | 端点 | 状态 |
|------|------|------|
| M4 Max | localhost:11434 | $(curl -s --connect-timeout 2 http://localhost:11434/api/version &>/dev/null && echo "✅ 正常" || echo "❌ 异常") |
| NAS | 192.168.3.45:11434 | $(curl -s --connect-timeout 2 http://192.168.3.45:11434/api/version &>/dev/null && echo "✅ 正常" || echo "❌ 异常") |
| iMac M4 | 192.168.3.77:11434 | $(curl -s --connect-timeout 2 http://192.168.3.77:11434/api/version &>/dev/null && echo "✅ 正常" || echo "❌ 异常") |

### D6 网络连通性

| 连接 | 端口 | 状态 |
|------|------|------|
| NAS SSH | 9557 | $(nc -z -w 2 192.168.3.45 9557 2>/dev/null && echo "✅ 正常" || echo "❌ 异常") |
| iMac SSH | 22 | $(nc -z -w 2 192.168.3.77 22 2>/dev/null && echo "✅ 正常" || echo "❌ 异常") |
| NAS Docker API | 2375 | $(curl -s --connect-timeout 2 http://192.168.3.45:2375/_ping &>/dev/null && echo "✅ 正常" || echo "⚠️ 未响应") |

---

## 🎯 健康度评估

EOF

# 健康度评级
if [ $OVERALL_HEALTH -ge 90 ]; then
  GRADE="A (优秀)"
  GRADE_EMOJI="🌟"
elif [ $OVERALL_HEALTH -ge 80 ]; then
  GRADE="B (良好)"
  GRADE_EMOJI="✅"
elif [ $OVERALL_HEALTH -ge 70 ]; then
  GRADE="C (合格)"
  GRADE_EMOJI="⚠️"
elif [ $OVERALL_HEALTH -ge 60 ]; then
  GRADE="D (需改进)"
  GRADE_EMOJI="🔶"
else
  GRADE="F (不合格)"
  GRADE_EMOJI="❌"
fi

cat >> "$REPORT_FILE" << EOF

| 指标 | 数值 |
|------|------|
| **综合健康度** | ${OVERALL_HEALTH}% |
| **评级** | $GRADE_EMOJI $GRADE |
| **通过率** | $((TOTAL_PASS * 100 / TOTAL_ALL))% |
| **警告数** | $TOTAL_WARN |
| **失败数** | $TOTAL_FAIL |

---

## 📝 建议与改进

EOF

# 根据测试结果生成建议
if [ $D1_FAIL -gt 0 ]; then
  echo "- 🔧 九层架构存在缺失模块，请检查 L0$D1_FAIL 层组件" >> "$REPORT_FILE"
fi

if [ $D2_FAIL -gt 0 ]; then
  echo "- 🔌 功能模块连接异常，请检查服务状态和网络配置" >> "$REPORT_FILE"
fi

if [ $D3_WARN -gt 3 ]; then
  echo "- 🤖 部分智能体模型未部署，建议完成模型部署以启用完整功能" >> "$REPORT_FILE"
fi

if [ $D4_WARN -gt 0 ]; then
  echo "- 💾 Redis 服务未启动，建议启动以启用缓存功能" >> "$REPORT_FILE"
fi

if [ $OVERALL_HEALTH -ge 90 ]; then
  echo "- ✅ 系统状态良好，可以正常启动项目进行测试" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

---

## 🚀 快速启动命令

\`\`\`bash
# 启动前端
cd /Users/yanyu/YYC3-Mac-Max/Family-π³
pnpm dev

# 启动后端服务
pnpm run server:dev

# 运行单元测试
pnpm test

# 类型检查
pnpm type-check
\`\`\`

---

<div align="center">

**YYC³ AI Family**

*言启象限 | 语枢未来*

**万象归元于云枢 | 深栈智启新纪元**

---

*报告生成时间: $(date '+%Y-%m-%d %H:%M:%S')*

</div>
EOF

# ============================================================
# 输出汇总
# ============================================================
echo ""
echo "========================================"
echo -e "${BOLD}  综合测试报告${NC}"
echo "========================================"
echo ""
echo "  📊 测试项总数: $TOTAL_ALL"
echo -e "  ${GREEN}✅ 通过: $TOTAL_PASS${NC}"
echo -e "  ${YELLOW}⚠️ 警告: $TOTAL_WARN${NC}"
echo -e "  ${RED}❌ 失败: $TOTAL_FAIL${NC}"
echo ""
echo -e "  ${BOLD}🏥 综合健康度: ${OVERALL_HEALTH}%${NC}"
echo -e "  ${BOLD}📋 评级: $GRADE_EMOJI $GRADE${NC}"
echo ""
echo "  📄 详细报告: $REPORT_FILE"
echo ""

if [ $TOTAL_FAIL -eq 0 ]; then
  echo -e "  ${GREEN}🎉 系统状态良好，可以启动项目！${NC}"
  exit 0
elif [ $TOTAL_FAIL -le 3 ]; then
  echo -e "  ${YELLOW}⚠️ 存在少量问题，建议检查后启动。${NC}"
  exit 0
else
  echo -e "  ${RED}❌ 存在多个问题，请先修复后再启动。${NC}"
  exit 1
fi
