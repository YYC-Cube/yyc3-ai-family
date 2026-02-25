#!/bin/bash

# @file db-sync-precheck.sh
# @description YYC³ AI-Family 数据库同步预检脚本，执行提交前审核和代码审查
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [database],[pre-commit],[audit]

echo "🔍 开始数据库同步预检..."

# 1. 提交前审核清单检查
echo "📋 检查提交前审核清单..."
if [ -f "scripts/pre-commit-check.sh" ]; then
  bash scripts/pre-commit-check.sh || exit 1
else
  echo "⚠️  pre-commit-check.sh 未找到，跳过提交前审核"
fi

# 2. TypeScript类型检查
echo "🔍 TypeScript类型检查..."
if [ -f "package.json" ]; then
  pnpm run type-check || exit 1
else
  echo "⚠️  package.json 未找到，跳过类型检查"
fi

# 3. 数据库相关代码审查
echo "🗄️ 检查数据库相关代码..."
if git diff --name-only | grep -q "src/lib/\(db\|sql\|store\)"; then
  echo "⚠️  检测到数据库相关代码变更"
  echo "📝 需要额外审核："
  echo "  - SQL注入防护"
  echo "  - 参数化查询"
  echo "  - 事务管理"
  echo "  - 错误处理"
fi

# 4. 依赖安全扫描
echo "🔒 安全扫描..."
if [ -f "package.json" ]; then
  npm audit --production || exit 1
else
  echo "⚠️  package.json 未找到，跳过安全扫描"
fi

echo "✅ 预检审核通过！"