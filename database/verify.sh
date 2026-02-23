#!/bin/bash
# ============================================================
# YYC³ AI Family — 数据库链路验证脚本
#
# 功能:
# - 验证数据库连接
# - 验证Schema完整性
# - 验证初始数据
# - 验证API端点
# - 生成验证报告
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 数据库配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-yyc3_aify}"
DB_USER="${DB_USER:-yyc3_aify}"
DB_PASSWORD="${DB_PASSWORD:-Yyc3_Aify_2026_Secure!}"

# API配置
API_HOST="${API_HOST:-localhost}"
API_PORT="${API_PORT:-3001}"
API_BASE="http://${API_HOST}:${API_PORT}/api/v1"

# 计数器
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASS_COUNT++)); }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; ((WARN_COUNT++)); }
log_error() { echo -e "${RED}[FAIL]${NC} $1"; ((FAIL_COUNT++)); }
log_section() { echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"; }

# 检查命令
check_command() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# ============================================================
# 1. 数据库连接验证
# ============================================================

verify_database_connection() {
    log_section "1. 数据库连接验证"

    # 检查PostgreSQL
    if ! check_command psql; then
        log_error "psql 未安装"
        return 1
    fi
    log_success "psql 已安装"

    # 检查连接
    export PGPASSWORD="${DB_PASSWORD}"

    if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1" > /dev/null 2>&1; then
        log_success "数据库连接成功"
    else
        log_error "数据库连接失败"
        unset PGPASSWORD
        return 1
    fi

    # 检查数据库版本
    local version=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT version()")
    log_info "PostgreSQL 版本: ${version}"

    unset PGPASSWORD
}

# ============================================================
# 2. Schema完整性验证
# ============================================================

verify_schema() {
    log_section "2. Schema完整性验证"

    export PGPASSWORD="${DB_PASSWORD}"

    # 检查Schema
    local schemas=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM information_schema.schemata
        WHERE schema_name IN ('core', 'telemetry', 'analytics')
    ")

    if [ "${schemas}" -ge 3 ]; then
        log_success "Schema 完整 (${schemas} 个)"
    else
        log_error "Schema 不完整 (${schemas} 个)"
    fi

    # 检查核心表
    local expected_tables=(
        "core.models"
        "core.agents"
        "core.conversations"
        "core.messages"
        "core.inference_logs"
        "core.authorizations"
        "core.user_preferences"
        "core.system_config"
        "telemetry.node_metrics"
        "telemetry.service_latency"
        "analytics.usage_stats"
    )

    for table in "${expected_tables[@]}"; do
        local schema=$(echo $table | cut -d'.' -f1)
        local name=$(echo $table | cut -d'.' -f2)

        local exists=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = '${schema}' AND table_name = '${name}'
            )
        ")

        if [ "${exists}" = "t" ]; then
            log_success "表 ${table} 存在"
        else
            log_error "表 ${table} 不存在"
        fi
    done

    # 检查扩展
    local extensions=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto')
    ")

    if [ "${extensions}" -ge 2 ]; then
        log_success "必要扩展已安装"
    else
        log_warning "部分扩展未安装"
    fi

    unset PGPASSWORD
}

# ============================================================
# 3. 初始数据验证
# ============================================================

verify_initial_data() {
    log_section "3. 初始数据验证"

    export PGPASSWORD="${DB_PASSWORD}"

    # 检查模型数据
    local model_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM core.models
    ")

    if [ "${model_count}" -ge 10 ]; then
        log_success "模型数据完整 (${model_count} 个)"
    else
        log_warning "模型数据不足 (${model_count} 个)"
    fi

    # 检查Agent数据
    local agent_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM core.agents
    ")

    if [ "${agent_count}" -eq 7 ]; then
        log_success "Agent数据完整 (${agent_count} 个)"
    else
        log_error "Agent数据不完整 (${agent_count} 个, 应为 7 个)"
    fi

    # 检查授权数据
    local auth_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM core.authorizations WHERE is_verified = true
    ")

    if [ "${auth_count}" -ge 4 ]; then
        log_success "授权数据完整 (${auth_count} 个)"
    else
        log_warning "授权数据不足 (${auth_count} 个)"
    fi

    # 检查系统配置
    local config_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM core.system_config
    ")

    if [ "${config_count}" -ge 10 ]; then
        log_success "系统配置完整 (${config_count} 个)"
    else
        log_warning "系统配置不足 (${config_count} 个)"
    fi

    # 检查授权模型
    local authorized_models=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT string_agg(id, ', ') FROM core.models WHERE is_authorized = true
    ")

    log_info "授权模型: ${authorized_models}"

    unset PGPASSWORD
}

# ============================================================
# 4. API端点验证
# ============================================================

verify_api_endpoints() {
    log_section "4. API端点验证"

    # 检查curl
    if ! check_command curl; then
        log_error "curl 未安装"
        return 1
    fi

    # 检查后端服务
    if curl -s "${API_BASE}/db/health" > /dev/null 2>&1; then
        log_success "后端服务运行中"
    else
        log_warning "后端服务未运行，跳过API验证"
        return 0
    fi

    # 测试健康检查
    local health=$(curl -s "${API_BASE}/db/health")
    if echo "${health}" | grep -q '"status":"ok"'; then
        log_success "健康检查端点正常"
    else
        log_error "健康检查端点异常"
    fi

    # 测试模型API
    local models=$(curl -s "${API_BASE}/db/models")
    if echo "${models}" | grep -q '"success":true'; then
        log_success "模型API正常"
    else
        log_error "模型API异常"
    fi

    # 测试Agent API
    local agents=$(curl -s "${API_BASE}/db/agents")
    if echo "${agents}" | grep -q '"success":true'; then
        log_success "Agent API正常"
    else
        log_error "Agent API异常"
    fi

    # 测试统计API
    local stats=$(curl -s "${API_BASE}/db/stats/overview")
    if echo "${stats}" | grep -q '"success":true'; then
        log_success "统计API正常"
    else
        log_error "统计API异常"
    fi
}

# ============================================================
# 5. 数据闭环验证
# ============================================================

verify_data_loop() {
    log_section "5. 数据闭环验证"

    export PGPASSWORD="${DB_PASSWORD}"

    # 测试插入会话
    log_info "测试会话插入..."
    local conv_id=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        INSERT INTO core.conversations (agent_id, model_id)
        VALUES ('navigator', 'qwen2.5:7b')
        RETURNING id
    " | tr -d ' ')

    if [ -n "${conv_id}" ]; then
        log_success "会话插入成功: ${conv_id}"
    else
        log_error "会话插入失败"
    fi

    # 测试插入消息
    log_info "测试消息插入..."
    local msg_id=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        INSERT INTO core.messages (conversation_id, role, content)
        VALUES ('${conv_id}', 'user', '测试消息')
        RETURNING id
    " | tr -d ' ')

    if [ -n "${msg_id}" ]; then
        log_success "消息插入成功: ${msg_id}"
    else
        log_error "消息插入失败"
    fi

    # 测试触发器
    log_info "测试触发器..."
    local msg_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT message_count FROM core.conversations WHERE id = '${conv_id}'
    " | tr -d ' ')

    if [ "${msg_count}" -eq 1 ]; then
        log_success "触发器正常工作"
    else
        log_error "触发器未触发"
    fi

    # 测试插入推理日志
    log_info "测试推理日志插入..."
    local log_id=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        INSERT INTO core.inference_logs (model_id, agent_id, request_type, prompt_tokens, completion_tokens, total_tokens, latency_ms, status)
        VALUES ('qwen2.5:7b', 'navigator', 'chat', 10, 20, 30, 500, 'success')
        RETURNING id
    " | tr -d ' ')

    if [ -n "${log_id}" ]; then
        log_success "推理日志插入成功: ${log_id}"
    else
        log_error "推理日志插入失败"
    fi

    # 清理测试数据
    log_info "清理测试数据..."
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
        DELETE FROM core.conversations WHERE id = '${conv_id}'
    " > /dev/null 2>&1

    log_success "测试数据已清理"

    unset PGPASSWORD
}

# ============================================================
# 6. 生成验证报告
# ============================================================

generate_report() {
    log_section "验证报告"

    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                    验证结果汇总                              │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    echo -e "  ${GREEN}通过: ${PASS_COUNT}${NC}"
    echo -e "  ${YELLOW}警告: ${WARN_COUNT}${NC}"
    echo -e "  ${RED}失败: ${FAIL_COUNT}${NC}"
    echo ""

    local total=$((PASS_COUNT + WARN_COUNT + FAIL_COUNT))
    local score=$((PASS_COUNT * 100 / total))

    echo "  综合评分: ${score}%"

    if [ ${FAIL_COUNT} -eq 0 ]; then
        echo -e "  状态: ${GREEN}数据库链路完整${NC}"
    else
        echo -e "  状态: ${RED}数据库链路存在问题${NC}"
    fi

    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                    数据库连接信息                            │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    echo "  主机: ${DB_HOST}:${DB_PORT}"
    echo "  数据库: ${DB_NAME}"
    echo "  用户: ${DB_USER}"
    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                    API端点信息                               │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    echo "  健康检查: ${API_BASE}/db/health"
    echo "  模型列表: ${API_BASE}/db/models"
    echo "  Agent列表: ${API_BASE}/db/agents"
    echo "  统计概览: ${API_BASE}/db/stats/overview"
    echo ""
}

# ============================================================
# 主函数
# ============================================================

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║           YYC³ AI Family — 数据库链路验证                     ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""

    # 执行验证
    verify_database_connection
    verify_schema
    verify_initial_data
    verify_api_endpoints
    verify_data_loop

    # 生成报告
    generate_report
}

main "$@"
