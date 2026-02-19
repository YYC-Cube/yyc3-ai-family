# 创建环境加载脚本
cat > ~/load-yyc3-env.sh << 'EOF'
#!/bin/bash
# 加载 YYC3 环境变量

export $(grep -v '^#' /Volumes/Build/yyc3_aify/.env | xargs)

echo "✅ YYC3 环境变量已加载"
echo "📊 当前配置:"
echo "  - 项目: $PROJECT_NAME v$PROJECT_VERSION"
echo "  - 端口: $DEV_SERVER_PORT"
echo "  - 数据库: $POSTGRES_DEV_HOST:$POSTGRES_DEV_PORT/$POSTGRES_DEV_DATABASE"
echo "  - 存储路径: $STORAGE_ROOT"
EOF

chmod +x ~/load-yyc3-env.sh
