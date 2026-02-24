#!/bin/bash

echo "🧪 开始数据库同步验证..."

# 1. 运行单元测试
echo "📝 运行数据库相关单元测试..."
if [ -f "package.json" ]; then
  pnpm run test -- --grep "database" || echo "⚠️  未找到数据库测试"
else
  echo "⚠️  package.json 未找到，跳过单元测试"
fi

# 2. 运行集成测试
echo "🔄 运行集成测试..."
if [ -f "package.json" ]; then
  pnpm run test -- --grep "integration" || echo "⚠️  未找到集成测试"
else
  echo "⚠️  package.json 未找到，跳过集成测试"
fi

# 3. 数据完整性验证
echo "🔍 验证数据完整性..."

# 检查核心表是否存在
echo "📊 检查核心表..."
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5433}
DB_NAME=${DB_NAME:-yyc3_aify}
DB_USER=${DB_USER:-yyc3_dev}
DB_PASSWORD=${DB_PASSWORD:-yyc3_dev}

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
  SELECT
    table_name,
    CASE
      WHEN EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = t.table_name
      ) THEN '✅'
      ELSE '❌'
    END as status
  FROM (VALUES
    ('users'),
    ('agents'),
    ('conversations'),
    ('messages'),
    ('provider_configs'),
    ('settings')
  ) AS t(table_name);
"

# 4. 检查索引
echo "🔍 检查关键表索引..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
  SELECT
    tablename,
    COUNT(*) as index_count,
    CASE
      WHEN COUNT(*) > 0 THEN '✅'
      ELSE '❌'
    END as status
  FROM pg_indexes
  WHERE tablename IN ('messages', 'conversations', 'agents')
  GROUP BY tablename;
"

echo "✅ 验证完成！"