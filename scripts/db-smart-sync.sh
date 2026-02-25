#!/bin/bash

# @file db-smart-sync.sh
# @description YYC³ AI-Family 数据库智能同步脚本，包含预检审核、健康检查、验证、备份和错误恢复功能
# @author YYC³ Team
# @version 2.0.0
# @created 2026-02-25
# @updated 2026-02-25
# @tags [database],[sync],[backup],[recovery]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  local log_file="${LOG_FILE_PATH:-/tmp/yyc3-logs}/db-sync.log"
  mkdir -p "$(dirname "$log_file")" 2>/dev/null || true
  echo "[$timestamp] [$level] $message" | tee -a "$log_file"
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

# 错误处理函数
handle_error() {
  local exit_code=$?
  local line_number=$1
  log_error "脚本在第 $line_number 行失败，退出码: $exit_code"
  
  if [ "$BACKUP_CREATED" = "true" ] && [ -n "$BACKUP_FILE" ]; then
    log_warn "检测到备份文件: $BACKUP_FILE"
    read -p "是否要回滚到备份? (yes/no): " rollback
    if [ "$rollback" = "yes" ]; then
      log_info "开始回滚到备份..."
      rollback_to_backup "$BACKUP_FILE"
    fi
  fi
  
  exit $exit_code
}

trap 'handle_error $LINENO' ERR

# 回滚函数
rollback_to_backup() {
  local backup_file=$1
  
  if [ ! -f "$backup_file" ]; then
    log_error "备份文件不存在: $backup_file"
    return 1
  fi
  
  log_info "从备份恢复数据库: $backup_file"
  
  DB_HOST=${DB_HOST:-localhost}
  DB_PORT=${DB_PORT:-5433}
  DB_NAME=${DB_NAME:-yyc3_aify}
  DB_USER=${DB_USER:-yyc3_dev}
  
  if [ -z "$DB_PASSWORD" ]; then
    log_error "DB_PASSWORD environment variable is required"
    return 1
  fi
  
  # 创建回滚前的备份
  ROLLBACK_BACKUP="$BACKUP_DIR/rollback-before-$(date +%Y%m%d-%H%M%S).sql"
  log_info "创建回滚前备份: $ROLLBACK_BACKUP"
  PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > "$ROLLBACK_BACKUP"
  
  if [ $? -eq 0 ]; then
    log_info "回滚前备份创建成功"
  else
    log_warn "回滚前备份创建失败，继续回滚"
  fi
  
  # 删除当前数据库
  log_info "删除当前数据库..."
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
  
  # 重新创建数据库
  log_info "重新创建数据库..."
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
  
  # 恢复备份
  log_info "恢复数据库..."
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "$backup_file"
  
  if [ $? -eq 0 ]; then
    log_info "✅ 数据库回滚成功"
    log_info "回滚前备份: $ROLLBACK_BACKUP"
    return 0
  else
    log_error "❌ 数据库回滚失败"
    log_error "请手动恢复: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $backup_file"
    return 1
  fi
}

# 创建备份函数
create_backup() {
  BACKUP_DIR=${BACKUP_DIR:-/opt/yyc3/backups}
  mkdir -p $BACKUP_DIR
  
  DB_HOST=${DB_HOST:-localhost}
  DB_PORT=${DB_PORT:-5433}
  DB_NAME=${DB_NAME:-yyc3_aify}
  DB_USER=${DB_USER:-yyc3_dev}
  
  if [ -z "$DB_PASSWORD" ]; then
    log_error "DB_PASSWORD environment variable is required"
    return 1
  fi
  
  TIMESTAMP=$(date +"%Y-%m-%d-%H-%M-%S")
  BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql"
  
  log_info "创建备份: $BACKUP_FILE"
  
  # 使用pg_dump创建备份
  PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    > "$BACKUP_FILE" 2>&1 | tee -a "$BACKUP_FILE.log"
  
  if [ $? -eq 0 ]; then
    # 验证备份文件
    BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    if [ "$BACKUP_SIZE" -gt 0 ]; then
      log_info "✅ 备份创建成功: $BACKUP_FILE"
      log_info "备份大小: $BACKUP_SIZE bytes"
      BACKUP_CREATED="true"
      return 0
    else
      log_error "❌ 备份文件为空"
      return 1
    fi
  else
    log_error "❌ 备份创建失败"
    return 1
  fi
}

# 验证备份函数
verify_backup() {
  local backup_file=$1
  
  if [ ! -f "$backup_file" ]; then
    log_error "备份文件不存在: $backup_file"
    return 1
  fi
  
  log_info "验证备份文件: $backup_file"
  
  # 检查备份文件是否包含有效的SQL
  if grep -q "PostgreSQL database dump" "$backup_file" || grep -q "CREATE TABLE" "$backup_file"; then
    log_info "✅ 备份文件验证通过"
    return 0
  else
    log_error "❌ 备份文件验证失败"
    return 1
  fi
}

# 清理旧备份函数
cleanup_old_backups() {
  local backup_dir=${1:-/opt/yyc3/backups}
  local keep_days=${2:-7}
  
  log_info "清理 $keep_days 天前的旧备份..."
  
  find "$backup_dir" -name "backup-*.sql" -type f -mtime +$keep_days -print0 | while IFS= read -r -d '' file; do
    log_info "删除旧备份: $file"
    rm -f "$file"
  done
  
  log_info "✅ 旧备份清理完成"
}

# 主流程
main() {
  echo "🚀 YYC³ AI-Family 数据库智能同步"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_info "开始数据库同步流程"
  
  BACKUP_CREATED="false"
  
  # 阶段1: 预检审核
  echo ""
  echo "📋 阶段1: 预检审核"
  log_info "执行预检审核"
  
  # 检查是否跳过预检
  if [ "$SKIP_PRE_CHECK" = "true" ]; then
    echo "⚠️  跳过预检审核（SKIP_PRE_CHECK=true）"
    log_info "跳过预检审核"
  else
    bash scripts/db-sync-precheck.sh || {
      log_error "预检审核失败"
      exit 1
    }
  fi
  
  # 阶段2: 数据库健康检查
  echo ""
  echo "🏥 阶段2: 数据库健康检查"
  log_info "执行数据库健康检查"
  bash scripts/db-health-check.sh || {
    log_error "数据库健康检查失败"
    exit 1
  }
  
  # 阶段3: 验证
  echo ""
  echo "🧪 阶段3: 自动验证"
  log_info "执行自动验证"
  bash scripts/db-sync-verify.sh || {
    log_error "自动验证失败"
    exit 1
  }
  
  # 阶段4: 创建备份（如果需要）
  echo ""
  echo "💾 阶段4: 创建数据库备份（可选）"
  read -p "是否创建数据库备份? (yes/no): " create_backup
  
  if [ "$create_backup" = "yes" ]; then
    create_backup || {
      log_error "备份创建失败，终止流程"
      exit 1
    }
    
    verify_backup "$BACKUP_FILE" || {
      log_error "备份验证失败，终止流程"
      exit 1
    }
    
    # 询问是否清理旧备份
    read -p "是否清理7天前的旧备份? (yes/no): " cleanup
    if [ "$cleanup" = "yes" ]; then
      cleanup_old_backups "$BACKUP_DIR" 7
    fi
  fi
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ 数据库同步完成！"
  log_info "数据库同步流程完成"
  
  echo ""
  echo "📋 下一步："
  echo "  1. 查看验证报告"
  echo "  2. 检查应用功能"
  if [ "$BACKUP_CREATED" = "true" ]; then
    echo "  3. 如有问题，使用备份文件回滚: $BACKUP_FILE"
    echo "  4. 回滚命令: bash scripts/db-smart-sync.sh --rollback $BACKUP_FILE"
  fi
  echo ""
  echo "📝 日志文件: $log_file"
  echo ""
}

# 处理命令行参数
if [ "$1" = "--rollback" ] && [ -n "$2" ]; then
  log_info "执行回滚操作"
  rollback_to_backup "$2"
  exit $?
fi

# 执行主流程
main
