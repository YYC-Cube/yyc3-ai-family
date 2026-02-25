#!/bin/bash
# YYC3 Dev CLI - 零摩擦AI协同开发命令行工具
# 版本: 1.0.0
# 作者: YYC³ + Claude AI

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logo
function show_logo() {
    echo -e "${CYAN}"
    cat << "EOF"
   ____      _ __        __
  / __ \____(_) /_____ _/ /___  ____  ____  ____ _
 / /_/ / __ \/ / __/ _ \/ / __ \/ __ \/ __ \/ _ `/
/ _, _/ /_/ / / /_/  __/ / /_/ / / / / / / /  _/
/_/ |_|\____/_/\__/\___/_/\____/_/ /_/_/ /_/\__, /
                                            /____/
    ${NC}万象归元于云枢 | 深栈智启新纪元${CYAN}
EOF
    echo -e "${NC}"
}

# 帮助信息
function show_help() {
    show_logo
    cat << EOF
${GREEN}YYC3 Dev CLI - 零摩擦AI协同开发工具${NC}

${YELLOW}用法:${NC}
    yyc3 <command> [options]

${YELLOW}核心命令:${NC}
    init        初始化新项目
    dev         启动开发服务器
    build       构建生产版本
    test        运行测试
    deploy      部署项目

${YELLOW}AI辅助:${NC}
    ai          AI代码生成和分析
    review      AI代码审查
    commit      AI生成commit信息
    fix         AI自动修复错误

${YELLOW}项目管理:${NC}
    deps        依赖管理
    docs        生成文档
    clean       清理缓存和临时文件

${YELLOW}工具:${NC}
    --version   显示版本信息
    --help      显示帮助信息

${YELLOW}示例:${NC}
    yyc3 init my-app --template=nextjs
    yyc3 dev --port=3000
    yyc3 ai generate component UserCard
    yyc3 review --auto-fix
    yyc3 deploy vercel --prod

更多命令详情: yyc3 <command> --help
EOF
}

# 检查环境
function check_env() {
    echo -e "${BLUE}🔍 检查开发环境...${NC}"

    # 检查Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo -e "  ${GREEN}✓${NC} Node.js: $NODE_VERSION"
    else
        echo -e "  ${RED}✗${NC} Node.js 未安装"
        exit 1
    fi

    # 检查Bun
    if command -v bun &> /dev/null; then
        BUN_VERSION=$(bun -v)
        echo -e "  ${GREEN}✓${NC} Bun: $BUN_VERSION"
    else
        echo -e "  ${YELLOW}⚠${NC} Bun 未安装 (推荐安装)"
    fi

    # 检查Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | awk '{print $3}')
        echo -e "  ${GREEN}✓${NC} Git: $GIT_VERSION"
    else
        echo -e "  ${RED}✗${NC} Git 未安装"
        exit 1
    fi

    # 检查Claude
    if command -v claude &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} Claude Code 已安装"
    else
        echo -e "  ${YELLOW}⚠${NC} Claude Code 未安装"
    fi

    # 检查Ollama
    if command -v ollama &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} Ollama 已安装"
    else
        echo -e "  ${YELLOW}⚠${NC} Ollama 未安装"
    fi

    echo ""
}

# 初始化项目
function cmd_init() {
    show_logo
    check_env

    PROJECT_NAME=$1
    if [ -z "$PROJECT_NAME" ]; then
        read -p "请输入项目名称: " PROJECT_NAME
    fi

    echo -e "${GREEN}📦 创建项目: $PROJECT_NAME${NC}"

    # 使用Next.js创建项目
    bun create next-app $PROJECT_NAME --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

    cd $PROJECT_NAME

    # 添加YYC3标准配置
    echo -e "${BLUE}📝 添加YYC3配置...${NC}"

    # 创建.env.local
    cat > .env.local << EOF
# YYC3 标准配置
NEXT_PUBLIC_APP_NAME=$PROJECT_NAME
NEXT_PUBLIC_AI_PROVIDER=glm
NEXT_PUBLIC_AI_MODEL=glm-4.7
EOF

    # 创建YYC3配置文件
    mkdir -p .yyc3
    cat > .yyc3/config.json << EOF
{
  "projectName": "$PROJECT_NAME",
  "version": "1.0.0",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "ai": {
    "provider": "glm",
    "model": "glm-4.7",
    "enabled": true
  },
  "features": {
    "testing": true,
    "ci": true,
    "monitoring": true
  }
}
EOF

    # 创建标准目录结构
    mkdir -p {components,lib,hooks,types,styles,docs,tests}

    echo -e "${GREEN}✅ 项目创建成功!${NC}"
    echo ""
    echo -e "${CYAN}快速开始:${NC}"
    echo -e "  cd $PROJECT_NAME"
    echo -e "  yyc3 dev"
}

# 启动开发服务器
function cmd_dev() {
    echo -e "${GREEN}🚀 启动开发服务器...${NC}"

    # 检查是否存在package.json
    if [ -f "package.json" ]; then
        # 使用Bun启动
        if command -v bun &> /dev/null; then
            bun run dev
        else
            npm run dev
        fi
    else
        echo -e "${RED}错误: 未找到package.json${NC}"
        exit 1
    fi
}

# 构建项目
function cmd_build() {
    echo -e "${GREEN}🔨 构建生产版本...${NC}"

    if [ -f "package.json" ]; then
        if command -v bun &> /dev/null; then
            bun run build
        else
            npm run build
        fi
    else
        echo -e "${RED}错误: 未找到package.json${NC}"
        exit 1
    fi
}

# 运行测试
function cmd_test() {
    echo -e "${GREEN}🧪 运行测试...${NC}"

    if [ -f "package.json" ]; then
        if command -v bun &> /dev/null; then
            bun test
        else
            npm test
        fi
    else
        echo -e "${RED}错误: 未找到package.json${NC}"
        exit 1
    fi
}

# AI代码生成
function cmd_ai() {
    AI_ACTION=$1
    shift

    case $AI_ACTION in
        generate)
            echo -e "${GREEN}🤖 AI代码生成...${NC}"
            # 调用Claude进行代码生成
            claude --dangerously-skip-permissions "Generate $@"
            ;;
        analyze)
            echo -e "${GREEN}📊 AI分析...${NC}"
            claude --dangerously-skip-permissions "Analyze $@"
            ;;
        review)
            echo -e "${GREEN}👁️ AI审查...${NC}"
            claude --dangerously-skip-permissions "Review $@"
            ;;
        *)
            echo -e "${YELLOW}AI命令:${NC}"
            echo "  generate    生成代码"
            echo "  analyze     分析代码"
            echo "  review      审查代码"
            ;;
    esac
}

# 代码审查
function cmd_review() {
    echo -e "${GREEN}🔍 AI代码审查...${NC}"
    claude --dangerously-skip-permissions "Review the current codebase and suggest improvements"
}

# 智能提交
function cmd_commit() {
    echo -e "${GREEN}📝 AI生成commit信息...${NC}"

    # 检查是否有更改
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}没有需要提交的更改${NC}"
        return
    fi

    # 添加所有更改
    git add .

    # 生成commit信息
    COMMIT_MSG=$(claude --dangerously-skip-permissions "Generate a concise git commit message for these changes: $(git diff --cached --stat)")

    # 提交
    git commit -m "$COMMIT_MSG

    🤖 Generated with Claude Code
    Co-Authored-By: Claude <noreply@anthropic.com>"

    echo -e "${GREEN}✅ 提交成功!${NC}"
}

# 部署
function cmd_deploy() {
    PLATFORM=$1

    case $PLATFORM in
        vercel)
            echo -e "${GREEN}🚀 部署到Vercel...${NC}"
            vercel --prod
            ;;
        ecs)
            echo -e "${GREEN}🚀 部署到阿里云ECS...${NC}"
            # 添加ECS部署逻辑
            ;;
        nas)
            echo -e "${GREEN}🚀 部署到NAS...${NC}"
            # 添加NAS部署逻辑
            ;;
        *)
            echo -e "${YELLOW}部署平台:${NC}"
            echo "  vercel      Vercel平台"
            echo "  ecs         阿里云ECS"
            echo "  nas         NAS服务器"
            ;;
    esac
}

# 依赖管理
function cmd_deps() {
    ACTION=$1

    case $ACTION in
        check)
            echo -e "${GREEN}📦 检查依赖更新...${NC}"
            if command -v bun &> /dev/null; then
                bun outdated
            else
                npm outdated
            fi
            ;;
        update)
            echo -e "${GREEN}⬆️  更新依赖...${NC}"
            if command -v bun &> /dev/null; then
                bun update
            else
                npm update
            fi
            ;;
        audit)
            echo -e "${GREEN}🔒 安全审计...${NC}"
            if command -v bun &> /dev/null; then
                bun audit
            else
                npm audit
            fi
            ;;
        *)
            echo -e "${YELLOW}依赖管理:${NC}"
            echo "  check       检查更新"
            echo "  update      更新依赖"
            echo "  audit       安全审计"
            ;;
    esac
}

# 生成文档
function cmd_docs() {
    echo -e "${GREEN}📚 生成项目文档...${NC}"

    # 使用AI生成README
    if [ ! -f "README.md" ]; then
        claude --dangerously-skip-permissions "Generate a comprehensive README.md for this project based on the codebase structure"
    fi

    echo -e "${GREEN}✅ 文档生成完成!${NC}"
}

# 清理
function cmd_clean() {
    echo -e "${GREEN}🧹 清理缓存和临时文件...${NC}"

    # 清理Next.js缓存
    rm -rf .next

    # 清理node_modules
    if [ "$1" == "--all" ]; then
        rm -rf node_modules
        echo -e "${YELLOW}已删除node_modules，请重新安装依赖${NC}"
    fi

    echo -e "${GREEN}✅ 清理完成!${NC}"
}

# 主函数
function main() {
    COMMAND=$1
    shift || true

    case $COMMAND in
        init)
            cmd_init "$@"
            ;;
        dev)
            cmd_dev
            ;;
        build)
            cmd_build
            ;;
        test)
            cmd_test
            ;;
        ai)
            cmd_ai "$@"
            ;;
        review)
            cmd_review
            ;;
        commit)
            cmd_commit
            ;;
        deploy)
            cmd_deploy "$@"
            ;;
        deps)
            cmd_deps "$@"
            ;;
        docs)
            cmd_docs
            ;;
        clean)
            cmd_clean "$@"
            ;;
        --version|-v)
            echo "YYC3 Dev CLI v1.0.0"
            ;;
        --help|-h|"")
            show_help
            ;;
        *)
            echo -e "${RED}错误: 未知命令 '$COMMAND'${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
