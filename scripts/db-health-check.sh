#!/bin/bash

# @file db-health-check.sh
# @description YYC³ AI-Family 数据库健康检查脚本，检查数据库连接状态和基本信息
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [database],[health-check],[monitoring]

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5433}
DB_NAME=${DB_NAME:-yyc3_aify}
DB_USER=${DB_USER:-yyc3_dev}

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ Error: DB_PASSWORD environment variable is required"
  exit 1
fi

echo "🏥 检查数据库健康状态..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
  SELECT
    COUNT(*) as total_tables,
    pg_size_pretty(pg_database_size('$DB_NAME')) as db_size,
    current_timestamp as check_time
  FROM information_schema.tables
  WHERE table_schema = 'public';
"

if [ $? -eq 0 ]; then
  echo "✅ 数据库健康状态正常"
else
  echo "❌ 数据库连接失败"
  exit 1
fi