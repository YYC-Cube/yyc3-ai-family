#!/bin/bash

# @file pre-commit-check.sh
# @description YYC³ AI-Family 提交前审核脚本，确保代码质量和安全性
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [pre-commit],[quality],[security]

set -e

echo "🔍 开始提交前审核..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Lint检查
echo ""
echo "📝 阶段1: 运行ESLint..."
if [ -f "package.json" ]; then
  pnpm run lint
  if [ $? -eq 0 ]; then
    echo "✅ ESLint检查通过"
  else
    echo "❌ ESLint检查失败"
    exit 1
  fi
else
  echo "⚠️  package.json 未找到，跳过Lint检查"
fi

# 2. 类型检查
echo ""
echo "🔍 阶段2: 运行TypeScript类型检查..."
if [ -f "package.json" ]; then
  pnpm run type-check
  if [ $? -eq 0 ]; then
    echo "✅ TypeScript类型检查通过"
  else
    echo "❌ TypeScript类型检查失败"
    exit 1
  fi
else
  echo "⚠️  package.json 未找到，跳过类型检查"
fi

# 3. 测试检查
echo ""
echo "🧪 阶段3: 运行测试..."
if [ -f "package.json" ]; then
  pnpm run test
  if [ $? -eq 0 ]; then
    echo "✅ 测试通过"
  else
    echo "❌ 测试失败"
    exit 1
  fi
else
  echo "⚠️  package.json 未找到，跳过测试"
fi

# 4. 安全检查
echo ""
echo "🔒 阶段4: 运行安全审计..."
if [ -f "package.json" ]; then
  npm audit --production
  if [ $? -eq 0 ]; then
    echo "✅ 安全审计通过"
  else
    echo "❌ 安全审计发现漏洞"
    echo "💡 请运行 'npm audit fix' 修复已知漏洞"
    exit 1
  fi
else
  echo "⚠️  package.json 未找到，跳过安全审计"
fi

# 5. 检查硬编码密钥
echo ""
echo "🔑 阶段5: 检查硬编码密钥..."
if grep -r "sk-" "src/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
  echo "❌ 发现硬编码的API密钥（sk-前缀）"
  echo "💡 请使用环境变量存储敏感信息"
  exit 1
else
  echo "✅ 未发现硬编码密钥"
fi

# 6. 检查console.log
echo ""
echo "📋 阶段6: 检查console.log..."
if grep -r "console.log" "src/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
  echo "⚠️  发现console.log语句"
  echo "💡 生产代码应移除所有console.log"
  read -p "是否继续提交? (yes/no): " continue
  if [ "$continue" != "yes" ]; then
    echo "❌ 已取消提交"
    exit 1
  fi
else
  echo "✅ 未发现console.log"
fi

# 7. 检查文件头注释
echo ""
echo "📄 阶段7: 检查文件头注释..."
MISSING_HEADER=0
for file in $(find "src/" -name "*.ts" -o -name "*.tsx" | head -10); do
  if ! grep -q "@file" "$file"; then
    echo "⚠️  文件缺少文件头注释: $file"
    MISSING_HEADER=$((MISSING_HEADER + 1))
  fi
done

if [ $MISSING_HEADER -eq 0 ]; then
  echo "✅ 文件头注释检查通过"
else
  echo "⚠️  发现 $MISSING_HEADER 个文件缺少文件头注释"
  read -p "是否继续提交? (yes/no): " continue
  if [ "$continue" != "yes" ]; then
    echo "❌ 已取消提交"
    exit 1
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 所有审核检查通过！"
echo ""
echo "📋 下一步："
echo "  1. 查看修改内容"
echo "  2. 编写提交信息"
echo "  3. 执行 git commit"
echo ""
