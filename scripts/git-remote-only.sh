#!/bin/bash

# @file git-remote-only.sh
# @description YYC³ Git 远程提交脚本（只提交到远程，本地工作目录保持干净）
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-26
# @tags [git],[remote],[commit]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# 检查Git状态
check_git_status() {
    log_info "检查Git状态..."
    
    # 检查是否有未提交的更改
    local status=$(git status --porcelain 2>/dev/null || echo "")
    
    if [ -z "$status" ]; then
        log_warning "没有需要提交的更改"
        return 1
    fi
    
    # 显示更改的文件
    echo ""
    echo "更改的文件："
    git status --short | sed 's/^/  /'
    echo ""
    
    return 0
}

# 添加所有更改
stage_changes() {
    log_info "暂存所有更改..."
    
    # 添加所有更改
    git add -A
    
    # 显示暂存的文件
    echo ""
    echo "已暂存的文件："
    git diff --cached --name-only | sed 's/^/  /' || true
    echo ""
}

# 创建提交
create_commit() {
    local message="$1"
    
    if [ -z "$message" ]; then
        message="chore: 自动提交 $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    log_info "创建提交..."
    git commit -m "$message"
    log_success "提交创建成功"
}

# 推送到远程
push_to_remote() {
    local branch="${1:-main}"
    
    log_info "推送到远程仓库..."
    
    # 检查远程分支是否存在
    if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
        log_info "远程分支 $branch 已存在，执行推送..."
        git push origin "$branch"
    else
        log_info "远程分支 $branch 不存在，执行首次推送..."
        git push -u origin "$branch"
    fi
    
    log_success "推送成功"
}

# 显示远程仓库信息
show_remote_info() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "远程仓库信息"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    git remote -v | sed 's/^/  /'
    
    echo ""
    echo "当前分支: $(git branch --show-current 2>/dev/null || echo 'unknown')"
    echo "最新提交: $(git log -1 --pretty=format:'%h - %s' 2>/dev/null || echo 'unknown')"
    echo ""
}

# 主函数
main() {
    local commit_message="$1"
    local branch="${2:-main}"
    
    echo ""
    echo "📦 YYC³ Git 远程提交"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 检查是否在Git仓库中
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "当前目录不是Git仓库"
        return 1
    fi
    
    # 检查Git状态
    if ! check_git_status; then
        return 0
    fi
    
    # 确认提交
    echo -n "是否继续提交并推送到远程？(y/n): "
    read -r confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "操作已取消"
        return 0
    fi
    
    echo ""
    
    # 执行提交流程
    stage_changes
    
    # 询问提交消息
    if [ -z "$commit_message" ]; then
        echo "请输入提交消息（留空使用默认消息）："
        read -r user_message
        if [ -n "$user_message" ]; then
            commit_message="$user_message"
        fi
    fi
    
    create_commit "$commit_message"
    push_to_remote "$branch"
    
    # 显示远程信息
    show_remote_info
    
    echo ""
    log_success "🎉 远程提交完成！"
    echo ""
    log_info "本地工作目录保持干净，所有更改已推送到远程仓库"
    echo ""
}

# 显示帮助
show_help() {
    cat << EOF
用法: $0 [提交消息] [分支]

参数:
  提交消息    可选，提交消息
  分支        可选，目标分支（默认：main）

示例:
  $0                                    # 使用默认消息提交到main分支
  $0 "feat: 添加新功能"                 # 指定提交消息
  $0 "fix: 修复bug" develop              # 提交到develop分支

注意:
  - 此脚本只提交到远程仓库
  - 本地工作目录保持干净
  - 自动添加所有更改
EOF
}

# 处理参数
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# 执行主函数
main "$@"
