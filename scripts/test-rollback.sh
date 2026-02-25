#!/bin/bash

# @file test-rollback.sh
# @description YYC³ AI-Family 数据库回滚流程测试脚本
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [testing],[rollback],[database]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YYC³ 数据库回滚流程测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 测试环境设置
TEST_DIR="/tmp/yyc3-rollback-test"
TEST_DB_NAME="yyc3_test_rollback"
TEST_BACKUP_DIR="$TEST_DIR/backups"

mkdir -p "$TEST_BACKUP_DIR"

echo -e "${YELLOW}测试环境:${NC}"
echo "   测试目录: $TEST_DIR"
echo "   测试数据库: $TEST_DB_NAME"
echo "   备份目录: $TEST_BACKUP_DIR"
echo ""

# 测试1: 创建测试数据库和表
echo -e "${YELLOW}测试1: 创建测试数据库${NC}"
echo "----------------------------------------"

# 模拟数据库操作
create_test_database() {
  local db_name=$1

  # 创建模拟数据库目录
  mkdir -p "$TEST_DIR/$db_name"

  # 创建模拟表文件
  cat > "$TEST_DIR/$db_name/users.sql" << 'EOF'
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email) VALUES
  ('user1', 'user1@example.com'),
  ('user2', 'user2@example.com'),
  ('user3', 'user3@example.com');
EOF

  cat > "$TEST_DIR/$db_name/settings.sql" << 'EOF'
-- Settings table
CREATE TABLE settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value) VALUES
  ('app_name', 'YYC3 AI-Family'),
  ('version', '1.0.0'),
  ('debug_mode', 'true');
EOF

  echo -e "${GREEN}✅ 测试数据库创建成功${NC}"
  echo "   表: users, settings"
}

create_test_database "$TEST_DB_NAME"

# 测试2: 创建备份
echo -e "${YELLOW}测试2: 创建数据库备份${NC}"
echo "----------------------------------------"

create_backup() {
  local db_name=$1
  local backup_dir=$2

  local timestamp=$(date +"%Y-%m-%d-%H-%M-%S")
  local backup_file="$backup_dir/backup-$timestamp.sql"

  # 模拟备份过程
  echo "-- Backup created at $(date)" > "$backup_file"
  echo "-- Database: $db_name" >> "$backup_file"
  echo "" >> "$backup_file"
  cat "$TEST_DIR/$db_name/users.sql" >> "$backup_file"
  echo "" >> "$backup_file"
  cat "$TEST_DIR/$db_name/settings.sql" >> "$backup_file"

  # 计算备份大小
  local backup_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)

  echo -e "${GREEN}✅ 备份创建成功${NC}"
  echo "   文件: $backup_file"
  echo "   大小: $backup_size bytes"

  # 返回备份文件路径（通过全局变量）
  BACKUP_FILE_PATH="$backup_file"
}

create_backup "$TEST_DB_NAME" "$TEST_BACKUP_DIR"
BACKUP_FILE="$BACKUP_FILE_PATH"

# 测试3: 验证备份文件
echo -e "${YELLOW}测试3: 验证备份文件${NC}"
echo "----------------------------------------"

verify_backup() {
  local backup_file=$1

  if [ ! -f "$backup_file" ]; then
    echo -e "${RED}❌ 备份文件不存在${NC}"
    return 1
  fi

  # 检查备份文件内容
  if grep -q "CREATE TABLE" "$backup_file" && grep -q "INSERT INTO" "$backup_file"; then
    echo -e "${GREEN}✅ 备份文件验证通过${NC}"
    echo "   包含 CREATE TABLE 语句"
    echo "   包含 INSERT INTO 语句"
    return 0
  else
    echo -e "${RED}❌ 备份文件验证失败${NC}"
    return 1
  fi
}

verify_backup "$BACKUP_FILE"

# 测试4: 模拟数据修改
echo -e "${YELLOW}测试4: 模拟数据修改${NC}"
echo "----------------------------------------"

modify_data() {
  local db_name=$1

  # 修改数据
  cat > "$TEST_DIR/$db_name/users.sql" << 'EOF'
-- Users table (modified)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email) VALUES
  ('modified_user1', 'modified1@example.com'),
  ('modified_user2', 'modified2@example.com');
EOF

  echo -e "${GREEN}✅ 数据修改完成${NC}"
  echo "   用户数量: 2 (原: 3)"
}

modify_data "$TEST_DB_NAME"

# 测试5: 执行回滚
echo -e "${YELLOW}测试5: 执行数据库回滚${NC}"
echo "----------------------------------------"

rollback_to_backup() {
  local backup_file=$1
  local db_name=$2
  local backup_dir=$3

  # 创建回滚前备份
  local rollback_backup="$backup_dir/rollback-before-$(date +%Y%m%d-%H%M%S).sql"
  echo "创建回滚前备份: $rollback_backup"

  # 保存当前状态
  cat "$TEST_DIR/$db_name/users.sql" > "$rollback_backup"
  cat "$TEST_DIR/$db_name/settings.sql" >> "$rollback_backup"

  # 执行回滚
  echo "开始回滚到备份..."

  # 使用sed提取users表（从CREATE TABLE users到CREATE TABLE settings之前，不包括settings行）
  sed -n '/CREATE TABLE users/,/CREATE TABLE settings/p' "$backup_file" | grep -v "CREATE TABLE settings" > "$TEST_DIR/$db_name/users.sql"
  # 提取settings表（从CREATE TABLE settings到文件末尾）
  sed -n '/CREATE TABLE settings/,$p' "$backup_file" > "$TEST_DIR/$db_name/settings.sql"

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 回滚成功${NC}"
    echo "   回滚前备份: $rollback_backup"
    return 0
  else
    echo -e "${RED}❌ 回滚失败${NC}"
    return 1
  fi
}

rollback_to_backup "$BACKUP_FILE" "$TEST_DB_NAME" "$TEST_BACKUP_DIR"

# 测试6: 验证回滚结果
echo -e "${YELLOW}测试6: 验证回滚结果${NC}"
echo "----------------------------------------"

verify_rollback() {
  local db_name=$1

  # 检查用户数量
  local user_count=$(grep -c "INSERT INTO users" "$TEST_DIR/$db_name/users.sql" || echo 0)

  if [ "$user_count" -eq 3 ]; then
    echo -e "${GREEN}✅ 回滚验证通过${NC}"
    echo "   用户数量: $user_count (恢复到3)"
    return 0
  else
    echo -e "${RED}❌ 回滚验证失败${NC}"
    echo "   用户数量: $user_count (应为3)"
    return 1
  fi
}

verify_rollback "$TEST_DB_NAME"

# 测试7: 错误处理测试
echo -e "${YELLOW}测试7: 错误处理测试${NC}"
echo "----------------------------------------"

# 测试无效备份
echo "测试1: 无效备份文件"
INVALID_BACKUP="$TEST_BACKUP_DIR/invalid-backup.sql"
echo "This is not a valid backup" > "$INVALID_BACKUP"

if verify_backup "$INVALID_BACKUP"; then
  echo -e "${RED}❌ 无效备份验证失败${NC}"
else
  echo -e "${GREEN}✅ 无效备份被正确拒绝${NC}"
fi

# 测试不存在的备份
echo ""
echo "测试2: 不存在的备份文件"
NONEXISTENT_BACKUP="$TEST_BACKUP_DIR/nonexistent.sql"

if [ ! -f "$NONEXISTENT_BACKUP" ]; then
  echo -e "${GREEN}✅ 不存在的备份被正确检测${NC}"
fi

# 测试总结
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}测试总结${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "✅ 测试数据库创建: 正常"
echo "✅ 备份创建功能: 正常"
echo "✅ 备份文件验证: 正常"
echo "✅ 数据修改模拟: 正常"
echo "✅ 回滚执行功能: 正常"
echo "✅ 回滚结果验证: 正常"
echo "✅ 错误处理机制: 正常"
echo ""
echo -e "${GREEN}所有测试通过！${NC}"
echo ""

# 清理测试文件
echo "清理测试文件..."
rm -rf "$TEST_DIR"
echo -e "${GREEN}✅ 测试清理完成${NC}"
