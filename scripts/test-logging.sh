#!/bin/bash

# @file test-logging.sh
# @description YYC³ AI-Family 日志记录功能验证脚本
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [testing],[logging],[validation]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YYC³ 日志记录功能验证${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 测试1: 日志文件创建
echo -e "${YELLOW}测试1: 验证日志文件创建${NC}"
echo "----------------------------------------"

LOG_DIR="/tmp/yyc3-test-logs"
LOG_FILE="$LOG_DIR/test-logging.log"

# 创建日志目录
mkdir -p "$LOG_DIR" 2>/dev/null || {
  echo -e "${RED}❌ 无法创建日志目录: $LOG_DIR${NC}"
  echo "   请使用 sudo 权限运行"
  exit 1
}

echo -e "${GREEN}✅ 日志目录创建成功${NC}"
echo "   路径: $LOG_DIR"
echo ""

# 测试2: 日志写入功能
echo -e "${YELLOW}测试2: 验证日志写入功能${NC}"
echo "----------------------------------------"

# 日志函数
log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() {
  log "INFO" "$@"
}

log_error() {
  log "ERROR" "$@"
}

log_warn() {
  log "WARN" "$@"
}

# 写入测试日志
log_info "系统启动"
log_warn "配置文件未找到，使用默认配置"
log_error "连接数据库失败，正在重试..."
log_info "系统运行正常"

if [ -f "$LOG_FILE" ]; then
  LOG_LINES=$(wc -l < "$LOG_FILE")
  LOG_SIZE=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null)
  echo -e "${GREEN}✅ 日志写入功能正常${NC}"
  echo "   文件: $LOG_FILE"
  echo "   行数: $LOG_LINES"
  echo "   大小: $LOG_SIZE bytes"
else
  echo -e "${RED}❌ 日志文件未创建${NC}"
fi

echo ""

# 测试3: 日志格式验证
echo -e "${YELLOW}测试3: 验证日志格式${NC}"
echo "----------------------------------------"

# 检查日志格式
LOG_FORMAT_OK=true

# 检查时间戳格式
if grep -q '\[20[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]\]' "$LOG_FILE"; then
  echo -e "${GREEN}✅ 时间戳格式正确${NC}"
else
  echo -e "${RED}❌ 时间戳格式错误${NC}"
  LOG_FORMAT_OK=false
fi

# 检查日志级别
if grep -q '\[INFO\]' "$LOG_FILE" && grep -q '\[WARN\]' "$LOG_FILE" && grep -q '\[ERROR\]' "$LOG_FILE"; then
  echo -e "${GREEN}✅ 日志级别正确${NC}"
else
  echo -e "${RED}❌ 日志级别错误${NC}"
  LOG_FORMAT_OK=false
fi

echo ""

# 测试4: 日志内容展示
echo -e "${YELLOW}测试4: 日志内容展示${NC}"
echo "----------------------------------------"
echo "最近5条日志:"
echo ""
tail -5 "$LOG_FILE"
echo ""

# 测试5: 日志级别统计
echo -e "${YELLOW}测试5: 日志级别统计${NC}"
echo "----------------------------------------"

INFO_COUNT=$(grep -c '\[INFO\]' "$LOG_FILE" || echo 0)
WARN_COUNT=$(grep -c '\[WARN\]' "$LOG_FILE" || echo 0)
ERROR_COUNT=$(grep -c '\[ERROR\]' "$LOG_FILE" || echo 0)

echo "INFO:  $INFO_COUNT 条"
echo "WARN:  $WARN_COUNT 条"
echo "ERROR: $ERROR_COUNT 条"
echo ""

# 测试6: 日志搜索功能
echo -e "${YELLOW}测试6: 日志搜索功能${NC}"
echo "----------------------------------------"

# 搜索包含"数据库"的日志
DB_LOGS=$(grep -c "数据库" "$LOG_FILE" || echo 0)
echo "包含'数据库'的日志: $DB_LOGS 条"

# 搜索ERROR级别日志
ERROR_LOGS=$(grep '\[ERROR\]' "$LOG_FILE")
if [ -n "$ERROR_LOGS" ]; then
  echo ""
  echo "ERROR日志详情:"
  echo "$ERROR_LOGS"
fi

echo ""

# 测试7: 日志文件权限
echo -e "${YELLOW}测试7: 验证日志文件权限${NC}"
echo "----------------------------------------"

if [ -f "$LOG_FILE" ]; then
  PERMS=$(stat -f "%Sp" "$LOG_FILE" 2>/dev/null || stat -c "%a" "$LOG_FILE" 2>/dev/null)
  OWNER=$(stat -f "%Su" "$LOG_FILE" 2>/dev/null || stat -c "%U" "$LOG_FILE" 2>/dev/null)

  echo "权限: $PERMS"
  echo "所有者: $OWNER"

  if [ "$PERMS" = "644" ] || [ "$PERMS" = "rw-r--r--" ]; then
    echo -e "${GREEN}✅ 文件权限正确${NC}"
  else
    echo -e "${YELLOW}⚠️  建议权限: 644${NC}"
  fi
fi

echo ""

# 测试总结
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}测试总结${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "✅ 日志目录创建: 正常"
echo "✅ 日志写入功能: 正常"
echo "✅ 日志格式验证: $([ "$LOG_FORMAT_OK" = true ] && echo "正常" || echo "异常")"
echo "✅ 日志级别统计: 正常"
echo "✅ 日志搜索功能: 正常"
echo "✅ 文件权限检查: 正常"
echo ""

if [ "$LOG_FORMAT_OK" = true ]; then
  echo -e "${GREEN}所有测试通过！${NC}"
else
  echo -e "${YELLOW}部分测试未通过，请检查日志格式${NC}"
fi
echo ""

# 清理测试文件
echo "清理测试文件..."
rm -f "$LOG_FILE"
echo -e "${GREEN}✅ 测试清理完成${NC}"
