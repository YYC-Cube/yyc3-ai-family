#!/bin/bash

# @file integrated-deploy.sh
# @description YYC³ AI-Family 一键集成部署脚本，全栈部署+模型配置+授权验证+健康检查
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [deployment],[full-stack],[automation]

# ============================================================
# YYC³ AI Family — 一键集成部署脚本
#
# 功能：全栈部署 + 模型配置 + 授权验证 + 健康检查
#
# 组件：
# - 前端应用 (Vite + React)
# - 后端API (Express + WebSocket)
# - 模型服务 (Ollama)
# - 授权验证 (智谱授权模型)
# - MCP协议
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 项目路径
PROJECT_DIR="/Users/yanyu/YYC3-Mac-Max/Family-π³"
BACKEND_DIR="${PROJECT_DIR}/backend"
SCRIPTS_DIR="${PROJECT_DIR}/scripts"

# 端口配置
FRONTEND_PORT=3133
BACKEND_PORT=3177
OLLAMA_PORT=11434

# 授权信息
AUTH_COMPANY="洛阳沫言酒店管理有限公司"
AUTH_CODE="202411283053152737"
AUTH_CERT_DIR="/Users/yanyu/YYC3-Mac-Max/智谱授权书"

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# 显示Banner
show_banner() {
    clear
    cat << 'EOF'
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     ██╗   ██╗ █████╗ ██╗     ██╗     ██████╗  █████╗         ║
    ║     ██║   ██║██╔══██╗██║     ██║     ██╔══██╗██╔══██╗        ║
    ║     ██║   ██║███████║██║     ██║     ██████╔╝███████║        ║
    ║     ╚██╗ ██╔╝██╔══██║██║     ██║     ██╔══██╗██╔══██║        ║
    ║      ╚████╔╝ ██║  ██║███████╗███████╗██║  ██║██║  ██║        ║
    ║       ╚═══╝  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝        ║
    ║                                                               ║
    ║               AI Family — 一键集成部署                        ║
    ║                                                               ║
    ║     言启象限 | 语枢未来                                        ║
    ║     Words Initiate Quadrants, Language Serves as Core        ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
EOF
    echo ""
    echo -e "    ${CYAN}授权信息${NC}"
    echo "    ─────────────────────────────────────────"
    echo -e "    授权公司: ${GREEN}${AUTH_COMPANY}${NC}"
    echo -e "    授权编号: ${GREEN}${AUTH_CODE}${NC}"
    echo -e "    授权有效期: ${GREEN}永久有效${NC}"
    echo ""
}

# 检查系统环境
check_environment() {
    log_step "检查系统环境..."

    local all_ok=true

    # Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_success "Node.js: ${NODE_VERSION}"
    else
        log_error "Node.js 未安装"
        all_ok=false
    fi

    # pnpm
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm -v)
        log_success "pnpm: ${PNPM_VERSION}"
    else
        log_error "pnpm 未安装"
        all_ok=false
    fi

    # Ollama
    if command -v ollama &> /dev/null; then
        OLLAMA_VERSION=$(ollama --version 2>&1 | head -1)
        log_success "Ollama: ${OLLAMA_VERSION}"
    else
        log_warning "Ollama 未安装（可选）"
    fi

    # 检查授权证书
    if [ -d "${AUTH_CERT_DIR}" ]; then
        CERT_COUNT=$(ls -1 "${AUTH_CERT_DIR}"/*.png 2>/dev/null | wc -l)
        log_success "授权证书: ${CERT_COUNT} 个"
    else
        log_warning "授权证书目录不存在"
    fi

    if [ "${all_ok}" = false ]; then
        log_error "环境检查失败，请安装缺失的依赖"
        exit 1
    fi
}

# 检查端口状态
check_ports() {
    log_step "检查端口状态..."

    local ports=(${FRONTEND_PORT} ${BACKEND_PORT} ${OLLAMA_PORT})
    local port_names=("前端" "后端API" "Ollama")

    for i in "${!ports[@]}"; do
        local port=${ports[$i]}
        local name=${port_names[$i]}

        if lsof -Pi :${port} -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "端口 ${port} (${name}) 已被占用"
        else
            log_success "端口 ${port} (${name}) 可用"
        fi
    done
}

# 检查Ollama服务
check_ollama() {
    log_step "检查Ollama服务..."

    if curl -s http://localhost:${OLLAMA_PORT}/api/tags > /dev/null 2>&1; then
        log_success "Ollama服务运行中"

        # 列出已安装模型
        local models=$(curl -s http://localhost:${OLLAMA_PORT}/api/tags | jq -r '.models[].name' 2>/dev/null)
        if [ -n "${models}" ]; then
            log_info "已安装模型:"
            echo "${models}" | while read model; do
                echo "  - ${model}"
            done
        fi
    else
        log_warning "Ollama服务未运行"
        log_info "启动Ollama服务..."
        ollama serve &
        sleep 3
    fi
}

# 安装前端依赖
install_frontend() {
    log_step "安装前端依赖..."

    cd "${PROJECT_DIR}"

    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --frozen-lockfile
    else
        pnpm install
    fi

    log_success "前端依赖安装完成"
}

# 安装后端依赖
install_backend() {
    log_step "安装后端依赖..."

    if [ -d "${BACKEND_DIR}" ]; then
        cd "${BACKEND_DIR}"

        if [ ! -f "package.json" ]; then
            log_info "后端项目不存在，运行部署脚本..."
            "${SCRIPTS_DIR}/deploy-backend-api.sh"
        else
            pnpm install
        fi

        log_success "后端依赖安装完成"
    else
        log_info "后端项目不存在，运行部署脚本..."
        "${SCRIPTS_DIR}/deploy-backend-api.sh"
    fi
}

# 启动后端服务
start_backend() {
    log_step "启动后端服务..."

    cd "${BACKEND_DIR}"

    # 检查端口
    if lsof -Pi :${BACKEND_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "后端服务已在运行"
        return 0
    fi

    # 创建日志目录
    mkdir -p logs

    # 启动服务
    nohup pnpm dev > logs/backend.log 2>&1 &
    BACKEND_PID=$!

    echo "${BACKEND_PID}" > logs/backend.pid

    log_info "等待后端服务启动..."
    sleep 5

    # 验证
    if curl -s http://localhost:${BACKEND_PORT}/api/v1/health > /dev/null 2>&1; then
        log_success "后端服务启动成功 (PID: ${BACKEND_PID})"
    else
        log_error "后端服务启动失败"
        cat logs/backend.log
        return 1
    fi
}

# 启动前端服务
start_frontend() {
    log_step "启动前端服务..."

    cd "${PROJECT_DIR}"

    # 检查端口
    if lsof -Pi :${FRONTEND_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "前端服务已在运行"
        return 0
    fi

    # 创建日志目录
    mkdir -p logs

    # 启动服务
    nohup pnpm dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!

    echo "${FRONTEND_PID}" > logs/frontend.pid

    log_info "等待前端服务启动..."
    sleep 8

    # 验证
    if curl -s http://localhost:${FRONTEND_PORT} > /dev/null 2>&1; then
        log_success "前端服务启动成功 (PID: ${FRONTEND_PID})"
    else
        log_error "前端服务启动失败"
        cat logs/frontend.log
        return 1
    fi
}

# 验证授权模型
verify_authorized_models() {
    log_step "验证授权模型..."

    local models=("codegeex4:latest" "qwen2.5:7b")
    local model_names=("CodeGeeX4-ALL-9B" "Qwen 2.5 7B")

    for i in "${!models[@]}"; do
        local model=${models[$i]}
        local name=${model_names[$i]}

        if curl -s http://localhost:${OLLAMA_PORT}/api/tags | jq -e ".models[] | select(.name == \"${model}\")" > /dev/null 2>&1; then
            log_success "${name}: 已安装"
        else
            log_warning "${name}: 未安装"
            log_info "安装命令: ollama pull ${model}"
        fi
    done
}

# 运行健康检查
run_health_check() {
    log_step "运行健康检查..."

    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                    健康检查报告                              │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""

    # 前端
    echo -e "${CYAN}[前端服务]${NC}"
    if curl -s http://localhost:${FRONTEND_PORT} > /dev/null 2>&1; then
        echo -e "  状态: ${GREEN}✅ 运行中${NC}"
        echo "  地址: http://localhost:${FRONTEND_PORT}"
    else
        echo -e "  状态: ${RED}❌ 未运行${NC}"
    fi
    echo ""

    # 后端
    echo -e "${CYAN}[后端API]${NC}"
    local health=$(curl -s http://localhost:${BACKEND_PORT}/api/v1/health 2>/dev/null)
    if [ -n "${health}" ]; then
        echo -e "  状态: ${GREEN}✅ 运行中${NC}"
        echo "  地址: http://localhost:${BACKEND_PORT}"
        echo "  健康检查: ${health}"
    else
        echo -e "  状态: ${RED}❌ 未运行${NC}"
    fi
    echo ""

    # Ollama
    echo -e "${CYAN}[Ollama服务]${NC}"
    if curl -s http://localhost:${OLLAMA_PORT}/api/tags > /dev/null 2>&1; then
        echo -e "  状态: ${GREEN}✅ 运行中${NC}"
        echo "  地址: http://localhost:${OLLAMA_PORT}"

        local model_count=$(curl -s http://localhost:${OLLAMA_PORT}/api/tags | jq '.models | length' 2>/dev/null)
        echo "  已安装模型: ${model_count} 个"
    else
        echo -e "  状态: ${RED}❌ 未运行${NC}"
    fi
    echo ""

    # 授权验证
    echo -e "${CYAN}[授权验证]${NC}"
    if [ -d "${AUTH_CERT_DIR}" ]; then
        local cert_count=$(ls -1 "${AUTH_CERT_DIR}"/*.png 2>/dev/null | wc -l)
        echo -e "  授权证书: ${GREEN}✅ ${cert_count} 个${NC}"
        echo "  证书目录: ${AUTH_CERT_DIR}"
    else
        echo -e "  授权证书: ${RED}❌ 未找到${NC}"
    fi
    echo ""

    echo "└─────────────────────────────────────────────────────────────┘"
}

# 显示服务信息
show_service_info() {
    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                    服务访问信息                              │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    echo -e "  ${GREEN}前端应用${NC}:    http://localhost:${FRONTEND_PORT}"
    echo -e "  ${GREEN}后端API${NC}:     http://localhost:${BACKEND_PORT}"
    echo -e "  ${GREEN}Ollama${NC}:       http://localhost:${OLLAMA_PORT}"
    echo ""
    echo -e "  ${CYAN}健康检查${NC}:     http://localhost:${BACKEND_PORT}/api/v1/health"
    echo -e "  ${CYAN}WebSocket${NC}:     ws://localhost:${BACKEND_PORT}/ws"
    echo ""
    echo "└─────────────────────────────────────────────────────────────┘"
}

# 停止所有服务
stop_all() {
    log_step "停止所有服务..."

    # 停止前端
    if [ -f "${PROJECT_DIR}/logs/frontend.pid" ]; then
        local pid=$(cat "${PROJECT_DIR}/logs/frontend.pid")
        if kill -0 ${pid} 2>/dev/null; then
            kill ${pid}
            log_success "前端服务已停止 (PID: ${pid})"
        fi
        rm -f "${PROJECT_DIR}/logs/frontend.pid"
    fi

    # 停止后端
    if [ -f "${BACKEND_DIR}/logs/backend.pid" ]; then
        local pid=$(cat "${BACKEND_DIR}/logs/backend.pid")
        if kill -0 ${pid} 2>/dev/null; then
            kill ${pid}
            log_success "后端服务已停止 (PID: ${pid})"
        fi
        rm -f "${BACKEND_DIR}/logs/backend.pid"
    fi

    # 清理端口
    for port in ${FRONTEND_PORT} ${BACKEND_PORT}; do
        if lsof -Pi :${port} -sTCP:LISTEN -t >/dev/null 2>&1; then
            lsof -ti:${port} | xargs kill -9 2>/dev/null || true
        fi
    done
}

# 显示帮助
show_help() {
    show_banner
    cat << EOF
用法: $0 <命令>

命令:
  start       启动所有服务（默认）
  stop        停止所有服务
  restart     重启所有服务
  status      查看服务状态
  health      运行健康检查
  install     安装所有依赖
  help        显示此帮助信息

示例:
  $0 start    # 启动所有服务
  $0 status   # 查看服务状态
  $0 health   # 运行健康检查

授权信息:
  公司: ${AUTH_COMPANY}
  编号: ${AUTH_CODE}
  有效期: 永久有效
EOF
}

# 主函数
main() {
    local command="${1:-start}"

    case "${command}" in
        start)
            show_banner
            check_environment
            check_ports
            check_ollama
            install_frontend
            install_backend
            start_backend
            start_frontend
            verify_authorized_models
            run_health_check
            show_service_info

            echo ""
            log_success "🎉 YYC³ AI Family 部署完成！"
            echo ""
            log_info "访问应用: http://localhost:${FRONTEND_PORT}"
            ;;
        stop)
            stop_all
            log_success "所有服务已停止"
            ;;
        restart)
            stop_all
            sleep 2
            main start
            ;;
        status)
            show_banner
            run_health_check
            ;;
        health)
            run_health_check
            ;;
        install)
            show_banner
            install_frontend
            install_backend
            log_success "所有依赖安装完成"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: ${command}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
