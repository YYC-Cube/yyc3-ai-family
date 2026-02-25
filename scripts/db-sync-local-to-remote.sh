#!/bin/bash

# @file db-sync-local-to-remote.sh
# @description YYC³ 本地数据库同步到远程（本机备份）
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-26
# @tags [database],[sync],[backup]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 数据库配置
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5433"
LOCAL_DB_NAME="yyc3_devops"
LOCAL_DB_USER="yyc3_admin"
LOCAL_DB_PASSWORD="yyc3_admin_password"

# 备份目录
BACKUP_DIR="/Users/yanyu/Family-π³/backups/database"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/yyc3-backup-${TIMESTAMP}.sql"

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# 创建备份目录
mkdir -p "${BACKUP_DIR}"

# 同步数据库
sync_database() {
    log_info "开始同步本地数据库..."
    log_info "源: ${LOCAL_DB_HOST}:${LOCAL_DB_PORT}/${LOCAL_DB_NAME}"
    
    # 检查数据库连接
    if ! PGPASSWORD="${LOCAL_DB_PASSWORD}" psql -h "${LOCAL_DB_HOST}" -p "${LOCAL_DB_PORT}" -U "${LOCAL_DB_USER}" -d "${LOCAL_DB_NAME}" -c "SELECT 1" > /dev/null 2>&1; then
        log_error "数据库连接失败"
        return 1
    fi
    
    # 创建备份
    log_info "创建数据库备份: ${BACKUP_FILE}"
    PGPASSWORD="${LOCAL_DB_PASSWORD}" pg_dump \
        -h "${LOCAL_DB_HOST}" \
        -p "${LOCAL_DB_PORT}" \
        -U "${LOCAL_DB_USER}" \
        -d "${LOCAL_DB_NAME}" \
        --format=plain \
        --no-owner \
        --no-acl \
        --verbose \
        > "${BACKUP_FILE}" 2>&1 | grep -v "pg_dump:" || true
    
    # 验证备份
    if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
        local size=$(du -h "${BACKUP_FILE}" | cut -f1)
        log_success "备份创建成功: ${size}"
        
        # 压缩备份
        log_info "压缩备份文件..."
        gzip "${BACKUP_FILE}"
        local compressed_file="${BACKUP_FILE}.gz"
        local compressed_size=$(du -h "${compressed_file}" | cut -f1)
        
        log_success "压缩完成: ${compressed_size}"
        
        # 创建最新链接
        ln -sf "${compressed_file}" "${BACKUP_DIR}/latest.sql.gz"
        log_success "最新备份链接已创建: ${BACKUP_DIR}/latest.sql.gz"
        
        # 清理旧备份（保留最近7天）
        log_info "清理7天前的旧备份..."
        find "${BACKUP_DIR}" -name "yyc3-backup-*.sql.gz" -type f -mtime +7 -delete
        log_success "旧备份清理完成"
        
        # 显示备份信息
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "数据库同步完成"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "备份文件: ${compressed_file}"
        echo "大小: ${compressed_size}"
        echo "最新备份: ${BACKUP_DIR}/latest.sql.gz"
        echo ""
        
        # 恢复命令提示
        echo "恢复命令："
        echo "  gunzip -c ${compressed_file} | PGPASSWORD=${LOCAL_DB_PASSWORD} psql -h ${LOCAL_DB_HOST} -p ${LOCAL_DB_PORT} -U ${LOCAL_DB_USER} -d ${LOCAL_DB_NAME}"
        echo ""
        
        return 0
    else
        log_error "备份创建失败"
        return 1
    fi
}

# 主函数
main() {
    echo ""
    echo "🗄️  YYC³ 数据库同步"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    sync_database
    
    if [ $? -eq 0 ]; then
        log_success "🎉 数据库同步完成！"
    else
        log_error "❌ 数据库同步失败"
        exit 1
    fi
}

main "$@"
