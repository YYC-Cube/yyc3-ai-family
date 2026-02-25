#!/bin/bash

# ===== YYC³ 协作区域快速启动脚本 =====
# 版本: v3.0
# 最后更新: 2025-12-06
# 用途: YanYu 和 Claude 协作的快速启动入口

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 路径配置
WORKSPACE_ROOT="/Users/yanyu/www"
COLLABORATION_AREA="$WORKSPACE_ROOT/yyc3-22"
CLAUDE_WORKSPACE="$WORKSPACE_ROOT/claude-workspace"

# 显示欢迎信息
echo -e "${CYAN}🤝 YYC³ 人机协作启动器${NC}"
echo -e "${PURPLE}=====================================${NC}"
echo -e "${BLUE}协作区域: $COLLABORATION_AREA${NC}"
echo -e "${BLUE}工作空间: $WORKSPACE_ROOT${NC}"
echo ""

# 检查协作状态
check_collaboration_status() {
    echo -e "${BLUE}🔍 检查协作状态...${NC}"

    # 检查目录结构
    local required_dirs=("$COLLABORATION_AREA"/{shared,drafts,reviews,decisions,handoff})
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            echo -e "  ✅ $(basename "$dir") 目录存在"
        else
            echo -e "  ❌ $(basename "$dir") 目录不存在"
        fi
    done

    # 检查Claude工作状态
    if [[ -f "$CLAUDE_WORKSPACE/.session" ]]; then
        local session_id
        session_id=$(grep CLAUDE_SESSION_ID "$CLAUDE_WORKSPACE/.session" | cut -d: -f2 | tr -d ' ')
        local last_active
        last_active=$(grep LAST_ACTIVE "$CLAUDE_WORKSPACE/.session" | cut -d: -f2- | tr -d ' ')
        echo -e "  🤖 Claude会话: $session_id"
        echo -e "  📅 最后活跃: $last_active"
    else
        echo -e "  ❌ Claude会话文件不存在"
    fi

    # 统计协作数据
    local shared_count=0
    local drafts_count=0
    local reviews_count=0
    local handoffs_count=0

    if [[ -d "$COLLABORATION_AREA/shared" ]]; then
        shared_count=$(find "$COLLABORATION_AREA/shared" -name "*.json" -type f 2>/dev/null | wc -l)
    fi
    if [[ -d "$COLLABORATION_AREA/drafts" ]]; then
        drafts_count=$(find "$COLLABORATION_AREA/drafts" -type f 2>/dev/null | wc -l)
    fi
    if [[ -d "$COLLABORATION_AREA/reviews" ]]; then
        reviews_count=$(find "$COLLABORATION_AREA/reviews" -name "*.json" -type f 2>/dev/null | wc -l)
    fi
    if [[ -d "$COLLABORATION_AREA/handoff" ]]; then
        handoffs_count=$(find "$COLLABORATION_AREA/handoff" -name "handoff_*.json" -type f 2>/dev/null | wc -l)
    fi

    echo -e "  📁 共享项目: $shared_count 个"
    echo -e "  📝 草稿文件: $drafts_count 个"
    echo -e "  👀 待审查: $reviews_count 个"
    echo -e "  🤝 工作交接: $handoffs_count 个"
}

# 显示主菜单
show_main_menu() {
    echo ""
    echo -e "${YELLOW}🎯 选择协作操作:${NC}"
    echo -e "${PURPLE}=====================================${NC}"
    echo -e "${GREEN}1${NC}) 📋 查看Claude工作状态"
    echo -e "${GREEN}2${NC}) 🤝 创建/更新项目"
    echo -e "${GREEN}3${NC}) 👀 查看待审查内容"
    echo -e "${GREEN}4${NC}) 📝 管理草稿文件"
    echo -e "${GREEN}5${NC}) 🔍 查看工作交接"
    echo -e "${GREEN}6${NC}) 🛠️ 启动Claude工作流"
    echo -e "${GREEN}7${NC}) 📊 协作统计报告"
    echo -e "${GREEN}8${NC}) 🧹 清理和优化"
    echo -e "${GREEN}0${NC}) 🚪 退出"
    echo ""
}

# 查看Claude工作状态
view_claude_status() {
    echo -e "${CYAN}🤖 Claude 工作状态详情${NC}"
    echo -e "${PURPLE}=====================================${NC}"

    # 检查会话文件
    if [[ -f "$CLAUDE_WORKSPACE/.session" ]]; then
        echo -e "${BLUE}会话信息:${NC}"
        cat "$CLAUDE_WORKSPACE/.session"
        echo ""
    else
        echo -e "${YELLOW}⚠️ Claude会话文件不存在${NC}"
        echo ""
    fi

    # 检查今日计划
    local today_plan="$CLAUDE_WORKSPACE/today-plans/plan-$(date +%Y%m%d).md"
    if [[ -f "$today_plan" ]]; then
        echo -e "${BLUE}今日工作计划 (最后10行):${NC}"
        tail -10 "$today_plan" | nl
        echo ""
    else
        echo -e "${YELLOW}⚠️ 今日计划不存在${NC}"
        echo ""
    fi

    # 检查最新交接
    local latest_handoff
    latest_handoff=$(find "$COLLABORATION_AREA/handoff" -name "handoff_*.json" -type f -exec ls -t {} + 2>/dev/null | head -1)

    if [[ -n "$latest_handoff" ]]; then
        echo -e "${BLUE}最新工作交接:${NC}"
        if command -v jq >/dev/null 2>&1; then
            local timestamp
            local next_steps
            timestamp=$(jq -r '.timestamp' "$latest_handoff" 2>/dev/null)
            next_steps=$(jq -r '.nextSteps[0] // "无内容"' "$latest_handoff" 2>/dev/null)
            echo -e "  📅 时间: $timestamp"
            echo -e "  📝 内容: $next_steps"
        else
            echo -e "  📁 文件: $(basename "$latest_handoff")"
        fi
        echo ""
    fi
}

# 创建或更新项目
manage_projects() {
    echo -e "${CYAN}🤝 项目管理${NC}"
    echo -e "${PURPLE}=====================================${NC}"

    echo -e "${YELLOW}选择操作:${NC}"
    echo -e "  ${GREEN}1${NC}) 创建新项目"
    echo -e "  ${GREEN}2${NC}) 查看现有项目"
    echo -e "  ${GREEN}3${NC}) 更新项目状态"
    echo -e "  ${GREEN}4${NC}) 删除项目"
    echo -e "  ${GREEN}0${NC}) 返回主菜单"
    echo ""

    read -p "请选择 (0-4): " choice

    case $choice in
        1)
            create_new_project
            ;;
        2)
            view_projects
            ;;
        3)
            update_project_status
            ;;
        4)
            delete_project
            ;;
        0|*)
            return
            ;;
    esac
}

# 创建新项目
create_new_project() {
    echo -e "${BLUE}📝 创建新项目${NC}"

    read -p "项目名称: " project_name
    if [[ -z "$project_name" ]]; then
        echo -e "${RED}❌ 项目名称不能为空${NC}"
        return
    fi

    echo -e "${YELLOW}项目类型:${NC}"
    echo "  1) web-app - Web应用"
    echo "  2) api-service - API服务"
    echo "  3) microservice - 微服务"
    echo "  4) library - 工具库"
    echo "  5) other - 其他"

    read -p "选择项目类型 (1-5): " type_choice

    local project_type="web-app"
    case $type_choice in
        1) project_type="web-app" ;;
        2) project_type="api-service" ;;
        3) project_type="microservice" ;;
        4) project_type="library" ;;
        5) project_type="other" ;;
        *) project_type="web-app" ;;
    esac

    read -p "项目描述 (可选): " project_description

    # 生成项目ID
    local project_id="proj_$(date +%Y%m%d_%H%M%S)_$(openssl rand -hex 4)"

    # 创建项目文件
    local project_file="$COLLABORATION_AREA/shared/${project_id}.json"

    cat > "$project_file" << EOF
{
  "id": "$project_id",
  "name": "$project_name",
  "type": "$project_type",
  "status": "draft",
  "owner": "user",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "lastAccessedBy": "user",
  "collaborators": ["claude", "user"],
  "description": "$project_description",
  "technologies": [],
  "dependencies": [],
  "requirements": [],
  "milestones": []
}
EOF

    echo -e "${GREEN}✅ 项目已创建: $project_name${NC}"
    echo -e "${CYAN}项目ID: $project_id${NC}"
    echo -e "${CYAN}项目文件: $project_file${NC}"
}

# 查看现有项目
view_projects() {
    echo -e "${BLUE}📁 现有项目列表${NC}"
    echo -e "${PURPLE}=====================================${NC}"

    local project_count=0
    find "$COLLABORATION_AREA/shared" -name "*.json" -type f 2>/dev/null | while read -r project_file; do
        ((project_count++))

        if command -v jq >/dev/null 2>&1; then
            local project_name
            local project_type
            local project_status
            local created_at
            local owner

            project_name=$(jq -r '.name // "Unknown"' "$project_file" 2>/dev/null)
            project_type=$(jq -r '.type // "unknown"' "$project_file" 2>/dev/null)
            project_status=$(jq -r '.status // "unknown"' "$project_file" 2>/dev/null)
            created_at=$(jq -r '.createdAt // "unknown"' "$project_file" 2>/dev/null)
            owner=$(jq -r '.owner // "unknown"' "$project_file" 2>/dev/null)

            local status_emoji="❓"
            case "$project_status" in
                "draft") status_emoji="📝" ;;
                "development") status_emoji="🚧" ;;
                "review") status_emoji="👀" ;;
                "complete") status_emoji="✅" ;;
            esac

            echo -e "${GREEN}$project_count.$status_emoji $project_name${NC}"
            echo -e "   📁 类型: $project_type"
            echo -e "   👤 负责人: $owner"
            echo -e "   📅 创建时间: $created_at"
            echo -e "   📄 文件: $(basename "$project_file")"
            echo ""
        else
            echo -e "${GREEN}$project_count.$(basename "$project_file")${NC}"
            echo ""
        fi
    done

    if [[ $project_count -eq 0 ]]; then
        echo -e "${YELLOW}⚠️ 没有找到项目${NC}"
    fi
}

# 启动Claude工作流
start_claude_workflow() {
    echo -e "${CYAN}🛠️ 启动Claude工作流${NC}"
    echo -e "${PURPLE}=====================================${NC}"

    if [[ -f "$WORKSPACE_ROOT/scripts/claude-workflow.sh" ]]; then
        echo -e "${BLUE}执行Claude工作流脚本...${NC}"
        cd "$WORKSPACE_ROOT"
        ./scripts/claude-workflow.sh
    else
        echo -e "${RED}❌ Claude工作流脚本不存在${NC}"
        echo -e "${YELLOW}请检查: $WORKSPACE_ROOT/scripts/claude-workflow.sh${NC}"
    fi
}

# 协作统计报告
show_collaboration_stats() {
    echo -e "${CYAN}📊 协作统计报告${NC}"
    echo -e "${PURPLE}=====================================${NC}"

    # 基本统计
    local shared_count=0
    local drafts_count=0
    local reviews_count=0
    local handoffs_count=0

    if [[ -d "$COLLABORATION_AREA/shared" ]]; then
        shared_count=$(find "$COLLABORATION_AREA/shared" -name "*.json" -type f 2>/dev/null | wc -l)
    fi
    if [[ -d "$COLLABORATION_AREA/drafts" ]]; then
        drafts_count=$(find "$COLLABORATION_AREA/drafts" -type f 2>/dev/null | wc -l)
    fi
    if [[ -d "$COLLABORATION_AREA/reviews" ]]; then
        reviews_count=$(find "$COLLABORATION_AREA/reviews" -name "*.json" -type f 2>/dev/null | wc -l)
    fi
    if [[ -d "$COLLABORATION_AREA/handoff" ]]; then
        handoffs_count=$(find "$COLLABORATION_AREA/handoff" -name "handoff_*.json" -type f 2>/dev/null | wc -l)
    fi

    echo -e "${BLUE}📁 文件统计:${NC}"
    echo -e "  🤝 共享项目: $shared_count 个"
    echo -e "  📝 草稿文件: $drafts_count 个"
    echo -e "  👀 待审查: $reviews_count 个"
    echo -e "  🔄 工作交接: $handoffs_count 个"

    # 时间统计
    echo ""
    echo -e "${BLUE}📅 时间统计:${NC}"

    # 今日统计
    local today=$(date +%Y%m%d)
    local today_handoffs=0
    if [[ -d "$COLLABORATION_AREA/handoff" ]]; then
        today_handoffs=$(find "$COLLABORATION_AREA/handoff" -name "handoff_${today}_*.json" -type f 2>/dev/null | wc -l)
    fi
    echo -e "  📅 今日交接: $today_handoffs 次"

    # 本周统计
    local week_start=$(date -v-7d +%Y%m%d 2>/dev/null || date -d '7 days ago' +%Y%m%d)
    local week_handoffs=0
    if [[ -d "$COLLABORATION_AREA/handoff" ]]; then
        week_handoffs=$(find "$COLLABORATION_AREA/handoff" -name "handoff_{$week_start..$today}_*.json" -type f 2>/dev/null | wc -l)
    fi
    echo -e "  📊 本周交接: $week_handoffs 次"

    # 存储空间统计
    echo ""
    echo -e "${BLUE}💾 存储统计:${NC}"
    local collab_size
    collab_size=$(du -sh "$COLLABORATION_AREA" 2>/dev/null | cut -f1)
    echo -e "  📦 协作区大小: $collab_size"

    # 活跃度统计
    echo ""
    echo -e "${BLUE}🔥 活跃度统计:${NC}"

    # 最新活动时间
    local latest_activity=0
    local latest_file=""
    find "$COLLABORATION_AREA" -type f -exec stat -f %m {} + 2>/dev/null | sort -nr | head -1 > /tmp/latest_time.txt
    if [[ -s /tmp/latest_time.txt ]]; then
        latest_activity=$(cat /tmp/latest_time.txt)
        latest_file=$(find "$COLLABORATION_AREA" -type f -exec stat -f "%m %N" {} + 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2-)
        local latest_date=$(date -r "$latest_activity" "+%Y-%m-%d %H:%M:%S")
        echo -e "  🕐 最新活动: $latest_date"
        echo -e "  📄 最新文件: $(basename "$latest_file")"
    fi

    rm -f /tmp/latest_time.txt

    # 项目类型分布
    if [[ $shared_count -gt 0 ]] && command -v jq >/dev/null 2>&1; then
        echo ""
        echo -e "${BLUE}📊 项目类型分布:${NC}"
        local web_apps=0
        local api_services=0
        local microservices=0
        local libraries=0
        local others=0

        find "$COLLABORATION_AREA/shared" -name "*.json" -type f | while read -r project_file; do
            local project_type
            project_type=$(jq -r '.type // "unknown"' "$project_file" 2>/dev/null)

            case "$project_type" in
                "web-app") ((web_apps++)) ;;
                "api-service") ((api_services++)) ;;
                "microservice") ((microservices++)) ;;
                "library") ((libraries++)) ;;
                *) ((others++)) ;;
            esac
        done

        echo -e "  🌐 Web应用: $web_apps 个"
        echo -e "  🔌 API服务: $api_services 个"
        echo -e "  ⚡ 微服务: $microservices 个"
        echo -e "  📚 工具库: $libraries 个"
        echo -e "  📦 其他: $others 个"
    fi
}

# 主循环
main_loop() {
    while true; do
        show_main_menu
        read -p "请选择 (0-8): " choice

        case $choice in
            1)
                view_claude_status
                ;;
            2)
                manage_projects
                ;;
            3)
                echo -e "${CYAN}👀 待审查内容${NC}"
                echo -e "${PURPLE}=====================================${NC}"
                # 这里可以添加审查内容查看逻辑
                echo "功能开发中..."
                ;;
            4)
                echo -e "${CYAN}📝 草稿文件管理${NC}"
                echo -e "${PURPLE}=====================================${NC}"
                # 这里可以添加草稿管理逻辑
                echo "功能开发中..."
                ;;
            5)
                echo -e "${CYAN}🔍 工作交接查看${NC}"
                echo -e "${PURPLE}=====================================${NC}"
                if [[ -f "$WORKSPACE_ROOT/scripts/claude-handoff.sh" ]]; then
                    cd "$WORKSPACE_ROOT"
                    ./scripts/claude-handoff.sh --show
                else
                    echo -e "${RED}❌ 交接脚本不存在${NC}"
                fi
                ;;
            6)
                start_claude_workflow
                ;;
            7)
                show_collaboration_stats
                ;;
            8)
                echo -e "${CYAN}🧹 清理和优化${NC}"
                echo -e "${PURPLE}=====================================${NC}"
                echo "功能开发中..."
                ;;
            0|*)
                echo -e "${GREEN}👋 退出协作启动器${NC}"
                break
                ;;
        esac

        echo ""
        read -p "按回车键继续..." dummy
    done
}

# 主函数
main() {
    # 检查是否在正确的目录
    if [[ ! -d "$COLLABORATION_AREA" ]]; then
        echo -e "${RED}❌ 协作区域不存在: $COLLABORATION_AREA${NC}"
        echo -e "${YELLOW}请检查YYC³项目结构${NC}"
        exit 1
    fi

    # 显示协作状态
    check_collaboration_status

    # 开始主循环
    main_loop
}

# 执行主函数
main "$@"