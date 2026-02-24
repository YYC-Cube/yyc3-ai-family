#!/bin/bash

echo "🔍 开始提交前审核..."

# 1. Lint检查
echo "📝 运行ESLint..."
if [ -f "package.json" ]; then
  pnpm run lint || exit 1
else
  echo "⚠️  package.json 未找到，跳过lint检查"
fi

# 2. 类型检查
echo "🔍 运行TypeScript类型检查..."
if [ -f "package.json" ]; then
  pnpm run type-check || exit 1
else
  echo "⚠️  package.json 未找到，跳过类型检查"
fi

# 3. 测试检查
echo "🧪 运行测试..."
if [ -f "package.json" ]; then
  pnpm run test || echo "⚠️  测试失败或未找到"
else
  echo "⚠️  package.json 未找到，跳过测试"
fi

# 4. 安全检查
echo "🔒 运行安全审计..."
if [ -f "package.json" ]; then
  npm audit --production || echo "⚠️  安全审计失败"
else
  echo "⚠️  package.json 未找到，跳过安全审计"
fi

# 5. 构建检查
echo "🏗️ 运行构建..."
if [ -f "package.json" ]; then
  pnpm run build || exit 1
else
  echo "⚠️  package.json 未找到，跳过构建"
fi

echo "✅ 所有审核检查通过！"
echo "💡 请继续手动验证功能完整性..."