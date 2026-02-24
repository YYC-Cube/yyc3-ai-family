#!/bin/bash

set -e

echo "🚀 YYC³ AI-Family 数据库智能同步"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 阶段1: 预检审核
echo ""
echo "📋 阶段1: 预检审核"
bash scripts/db-sync-precheck.sh

# 阶段2: 数据库健康检查
echo ""
echo "🏥 阶段2: 数据库健康检查"
bash scripts/db-health-check.sh

# 阶段3: 验证
echo ""
echo "🧪 阶段3: 自动验证"
bash scripts/db-sync-verify.sh

# 阶段4: 创建备份（如果需要）
echo ""
echo "💾 阶段4: 创建数据库备份（可选）"
read -p "是否创建数据库备份? (yes/no): " create_backup
if [ "$create_backup" = "yes" ]; then
  BACKUP_DIR=${BACKUP_DIR:-/opt/yyc3/backups}
  mkdir -p $BACKUP_DIR

  DB_HOST=${DB_HOST:-localhost}
  DB_PORT=${DB_PORT:-5433}
  DB_NAME=${DB_NAME:-yyc3_aify}
  DB_USER=${DB_USER:-yyc3_dev}
  DB_PASSWORD=${DB_PASSWORD:-yyc3_dev}

  TIMESTAMP=$(date +"%Y-%m-%d-%H-%M-%S")
  BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql"

  echo "💾 创建备份: $BACKUP_FILE"
  PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE

  if [ $? -eq 0 ]; then
    echo "✅ 备份创建成功: $BACKUP_FILE"
  else
    echo "❌ 备份创建失败"
    exit 1
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 数据库同步完成！"
echo ""
echo "📋 下一步："
echo "  1. 查看验证报告"
echo "  2. 检查应用功能"
echo "  3. 如有问题，使用备份文件回滚"
echo ""