#!/bin/bash
# ============================================================
# YYC³ AI Family — 数据库迁移脚本
#
# 功能:
# - 创建数据库
# - 创建用户
# - 执行Schema迁移
# - 验证迁移结果
#
# 使用:
# ./migrate.sh [command]
#
# 命令:
# - create-db: 创建数据库和用户
# - migrate: 执行迁移
# - rollback: 回滚迁移
# - verify: 验证迁移
# - reset: 重置数据库
# - seed: 插入初始数据
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SCHEMA_DIR="${SCRIPT_DIR}/schema"

# 数据库配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-yyc3_aify}"
DB_USER="${DB_USER:-yyc3_aify}"
DB_PASSWORD="${DB_PASSWORD:-Yyc3_Aify_2026_Secure!}"

# 管理员配置
ADMIN_USER="${ADMIN_USER:-yanyu}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查PostgreSQL
check_postgres() {
    log_info "检查 PostgreSQL..."

    if ! command -v psql &> /dev/null; then
        log_error "psql 未安装"
        exit 1
    fi

    if ! command -v pg_isready &> /dev/null; then
        log_error "pg_isready 未安装"
        exit 1
    fi

    # 检查连接
    if pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" > /dev/null 2>&1; then
        log_success "PostgreSQL 连接正常"
    else
        log_error "PostgreSQL 连接失败"
        log_info "请确保 PostgreSQL 正在运行: pg_isready -h ${DB_HOST} -p ${DB_PORT}"
        exit 1
    fi
}

# 创建数据库和用户
create_database() {
    log_info "创建数据库和用户..."

    # 设置密码环境变量
    export PGPASSWORD="${ADMIN_PASSWORD}"

    # 创建用户
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d postgres -c "
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
                CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
            END IF;
        END
        \$\$;
    " || log_warning "用户可能已存在"

    # 创建数据库
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d postgres -c "
        CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
    " 2>/dev/null || log_warning "数据库可能已存在"

    # 授权
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d postgres -c "
        GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
    "

    # 启用扩展
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d "${DB_NAME}" -c "
        CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
        CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";
    "

    # 尝试启用 pgvector (可选)
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d "${DB_NAME}" -c "
        CREATE EXTENSION IF NOT EXISTS \"vector\";
    " 2>/dev/null || log_warning "pgvector 扩展未安装 (可选)"

    log_success "数据库和用户创建完成"

    unset PGPASSWORD
}

# 执行迁移
run_migration() {
    log_info "执行数据库迁移..."

    export PGPASSWORD="${DB_PASSWORD}"

    # 按顺序执行迁移文件
    for file in "${SCHEMA_DIR}"/*.sql; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            log_info "执行: ${filename}"

            psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "$file"

            if [ $? -eq 0 ]; then
                log_success "${filename} 执行成功"
            else
                log_error "${filename} 执行失败"
                unset PGPASSWORD
                exit 1
            fi
        fi
    done

    unset PGPASSWORD
    log_success "数据库迁移完成"
}

# 验证迁移
verify_migration() {
    log_info "验证数据库迁移..."

    export PGPASSWORD="${DB_PASSWORD}"

    # 检查表
    local tables=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema IN ('core', 'telemetry', 'analytics')
    ")

    log_info "创建的表数量: ${tables}"

    # 检查模型数据
    local models=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM core.models
    ")

    log_info "模型数量: ${models}"

    # 检查Agent数据
    local agents=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM core.agents
    ")

    log_info "Agent数量: ${agents}"

    # 检查授权数据
    local auths=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT COUNT(*) FROM core.authorizations
    ")

    log_info "授权记录: ${auths}"

    unset PGPASSWORD

    log_success "验证完成"
}

# 重置数据库
reset_database() {
    log_warning "这将删除所有数据！"
    read -p "确定要重置数据库吗？(yes/no): " -r
    echo

    if [[ ! $REPLY == "yes" ]]; then
        log_info "操作已取消"
        exit 0
    fi

    log_info "重置数据库..."

    export PGPASSWORD="${ADMIN_PASSWORD}"

    # 终止所有连接
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d postgres -c "
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${DB_NAME}'
        AND pid <> pg_backend_pid();
    "

    # 删除数据库
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d postgres -c "
        DROP DATABASE IF EXISTS ${DB_NAME};
    "

    # 删除用户
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${ADMIN_USER}" -d postgres -c "
        DROP USER IF EXISTS ${DB_USER};
    "

    unset PGPASSWORD

    log_success "数据库已重置"

    # 重新创建
    create_database
    run_migration
}

# 导出数据
export_data() {
    log_info "导出数据..."

    local backup_dir="${PROJECT_DIR}/backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${backup_dir}/yyc3_aify_${timestamp}.sql"

    mkdir -p "${backup_dir}"

    export PGPASSWORD="${DB_PASSWORD}"

    pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
        --format=plain \
        --no-owner \
        --no-acl \
        > "${backup_file}"

    unset PGPASSWORD

    log_success "数据已导出: ${backup_file}"
}

# 导入数据
import_data() {
    local backup_file="${1}"

    if [ -z "${backup_file}" ]; then
        log_error "请指定备份文件"
        exit 1
    fi

    if [ ! -f "${backup_file}" ]; then
        log_error "备份文件不存在: ${backup_file}"
        exit 1
    fi

    log_info "导入数据: ${backup_file}"

    export PGPASSWORD="${DB_PASSWORD}"

    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${backup_file}"

    unset PGPASSWORD

    log_success "数据导入完成"
}

# 显示状态
show_status() {
    log_info "数据库状态..."

    export PGPASSWORD="${DB_PASSWORD}"

    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                    数据库状态                                │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""

    # 连接信息
    echo -e "${CYAN}[连接信息]${NC}"
    echo "  主机: ${DB_HOST}:${DB_PORT}"
    echo "  数据库: ${DB_NAME}"
    echo "  用户: ${DB_USER}"
    echo ""

    # 数据库大小
    local db_size=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT pg_size_pretty(pg_database_size('${DB_NAME}'))
    ")
    echo -e "${CYAN}[数据库大小]${NC}"
    echo "  ${db_size}"
    echo ""

    # 表统计
    echo -e "${CYAN}[表统计]${NC}"
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
        SELECT
            schemaname as schema,
            COUNT(*) as tables,
            SUM(n_live_tup) as rows
        FROM pg_stat_user_tables
        WHERE schemaname IN ('core', 'telemetry', 'analytics')
        GROUP BY schemaname
        ORDER BY schemaname
    "
    echo ""

    # 模型统计
    echo -e "${CYAN}[模型统计]${NC}"
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
        SELECT tier, COUNT(*) as count
        FROM core.models
        GROUP BY tier
        ORDER BY tier
    "
    echo ""

    # Agent统计
    echo -e "${CYAN}[Agent统计]${NC}"
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
        SELECT id, name_cn, total_requests
        FROM core.agents
        ORDER BY total_requests DESC
    "
    echo ""

    unset PGPASSWORD
}

# 显示帮助
show_help() {
    cat << EOF
YYC³ AI Family 数据库迁移脚本

用法: $0 <命令> [参数]

命令:
  create-db     创建数据库和用户
  migrate       执行迁移
  verify        验证迁移
  reset         重置数据库
  export        导出数据
  import <file> 导入数据
  status        显示状态
  help          显示帮助

环境变量:
  DB_HOST       数据库主机 (默认: localhost)
  DB_PORT       数据库端口 (默认: 5433)
  DB_NAME       数据库名称 (默认: yyc3_aify)
  DB_USER       数据库用户 (默认: yyc3_aify)
  DB_PASSWORD   数据库密码

示例:
  $0 create-db              # 创建数据库
  $0 migrate                # 执行迁移
  $0 verify                 # 验证迁移
  $0 status                 # 显示状态
  $0 export                 # 导出数据
  $0 import backup.sql      # 导入数据
EOF
}

# 主函数
main() {
    local command="${1:-help}"

    case "${command}" in
        create-db)
            check_postgres
            create_database
            ;;
        migrate)
            check_postgres
            run_migration
            ;;
        verify)
            check_postgres
            verify_migration
            ;;
        reset)
            check_postgres
            reset_database
            ;;
        export)
            check_postgres
            export_data
            ;;
        import)
            check_postgres
            import_data "${2}"
            ;;
        status)
            check_postgres
            show_status
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
