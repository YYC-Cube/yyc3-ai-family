#!/bin/bash
# YYC3 Claude信任目录管理脚本
# 快速设置Claude Code信任目录

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CONFIG_PATH="/Users/yanyu/Library/Application Support/Claude/config.json"

echo -e "${BLUE}🔐 YYC3 Claude信任目录管理${NC}"
echo ""

# 检查配置文件
if [ ! -f "$CONFIG_PATH" ]; then
    echo -e "${YELLOW}⚠️  配置文件不存在${NC}"
    exit 1
fi

# 函数：信任目录
trust_directory() {
    local dir_path=$1
    echo -e "${GREEN}✓ 信任目录: $dir_path${NC}"

    jq --arg dir "$dir_path" '
      if .projects[$dir] == null then
        .projects[$dir] = {
          "allowedTools": [],
          "mcpContextUris": [],
          "mcpServers": {},
          "enabledMcpjsonServers": [],
          "disabledMcpjsonServers": [],
          "hasTrustDialogAccepted": true,
          "projectOnboardingSeenCount": 1,
          "hasClaudeMdExternalIncludesApproved": false,
          "hasClaudeMdExternalIncludesWarningShown": false
        }
      else
        .projects[$dir].hasTrustDialogAccepted = true
      end
    ' "$CONFIG_PATH" > /tmp/claude-config-temp.json

    mv /tmp/claude-config-temp.json "$CONFIG_PATH"
}

# 函数：查看已信任目录
list_trusted() {
    echo -e "${BLUE}📋 已信任的目录:${NC}"
    echo ""

    jq -r '.projects | to_entries[] | select(.value.hasTrustDialogAccepted == true) | "  ✓ " + .key' "$CONFIG_PATH"
}

# 函数：撤销信任
untrust_directory() {
    local dir_path=$1
    echo -e "${YELLOW}✗ 撤销信任: $dir_path${NC}"

    jq --arg dir "$dir_path" '.projects[$dir].hasTrustDialogAccepted = false' "$CONFIG_PATH" > /tmp/claude-config-temp.json
    mv /tmp/claude-config-temp.json "$CONFIG_PATH"
}

# 主命令
case $1 in
    trust)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}用法: $0 trust <目录路径>${NC}"
            echo ""
            echo "示例:"
            echo "  $0 trust /Users/yanyu/my-project"
            exit 1
        fi
        trust_directory "$2"
        echo -e "${GREEN}✅ 目录已设置为信任状态${NC}"
        echo -e "${YELLOW}⚠️  请重启Claude Code使设置生效${NC}"
        ;;

    list|ls)
        list_trusted
        ;;

    untrust)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}用法: $0 untrust <目录路径>${NC}"
            exit 1
        fi
        untrust_directory "$2"
        echo -e "${GREEN}✅ 已撤销目录信任${NC}"
        ;;

    trust-all)
        echo -e "${BLUE}🚀 信任所有YYC3常用目录...${NC}"
        trust_directory "/Users/yanyu"
        trust_directory "/Users/yanyu/Documents"
        trust_directory "/Users/yanyu/www"
        trust_directory "/Users/yanyu/yyc3-claude"
        trust_directory "/Users/yanyu/claude-workspace"
        echo -e "${GREEN}✅ 所有目录已设置为信任状态${NC}"
        echo -e "${YELLOW}⚠️  请重启Claude Code使设置生效${NC}"
        ;;

    *)
        echo "YYC3 Claude信任目录管理"
        echo ""
        echo "用法: $0 <command> [args]"
        echo ""
        echo "命令:"
        echo "  trust <path>     信任指定目录"
        echo "  trust-all        信任所有YYC3常用目录"
        echo "  list            列出所有已信任目录"
        echo "  untrust <path>   撤销目录信任"
        echo ""
        echo "示例:"
        echo "  $0 trust /Users/yanyu/my-project"
        echo "  $0 trust-all"
        echo "  $0 list"
        exit 1
        ;;
esac
