#!/bin/bash

# @file log-rotation.sh
# @description YYC³ AI-Family 日志轮转机制实现脚本
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [logging],[rotation],[maintenance]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
LOG_DIR=${LOG_DIR:-/var/log/yyc3}
MAX_SIZE_MB=${MAX_SIZE_MB:-100}
MAX_FILES=${MAX_FILES:-10}
COMPRESS_DAYS=${COMPRESS_DAYS:-7}
DELETE_DAYS=${DELETE_DAYS:-30}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YYC³ 日志轮转机制${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}配置信息:${NC}"
echo "   日志目录: $LOG_DIR"
echo "   最大文件大小: ${MAX_SIZE_MB}MB"
echo "   最大文件数量: $MAX_FILES"
echo "   压缩天数: $COMPRESS_DAYS"
echo "   删除天数: $DELETE_DAYS"
echo ""

# 创建日志目录
mkdir -p "$LOG_DIR" 2>/dev/null || {
  echo -e "${RED}❌ 无法创建日志目录${NC}"
  exit 1
}

# 函数：获取文件大小（MB）
get_file_size_mb() {
  local file=$1
  local size_bytes=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
  echo "scale=2; $size_bytes / 1024 / 1024" | bc
}

# 函数：压缩旧日志
compress_old_logs() {
  local days=$1
  local count=0
  
  echo -e "${YELLOW}压缩 $days 天前的日志文件...${NC}"
  
  find "$LOG_DIR" -name "*.log" -type f -mtime +$days -print | while IFS= read -r file; do
    if [ -f "$file" ]; then
      local compressed="${file}.gz"
      if [ ! -f "$compressed" ]; then
        gzip -c "$file" > "$compressed"
        if [ $? -eq 0 ]; then
          rm -f "$file"
          ((count++))
          echo "   压缩: $(basename "$file")"
        fi
      fi
    fi
  done
  
  echo -e "${GREEN}✅ 压缩了 $count 个日志文件${NC}"
}

# 函数：删除过期的压缩日志
delete_old_logs() {
  local days=$1
  local count=0
  
  echo -e "${YELLOW}删除 $days 天前的压缩日志...${NC}"
  
  find "$LOG_DIR" -name "*.log.gz" -type f -mtime +$days -delete -print 2>/dev/null | while IFS= read -r file; do
    ((count++))
    echo "   删除: $(basename "$file")"
  done
  
  echo -e "${GREEN}✅ 删除了 $count 个过期日志${NC}"
}

# 函数：清理超大日志文件
cleanup_large_logs() {
  local max_size_mb=$1
  local count=0
  
  echo -e "${YELLOW}检查超过 ${max_size_mb}MB 的日志文件...${NC}"
  
  find "$LOG_DIR" -name "*.log" -type f -size +${max_size_mb}M -print | while IFS= read -r file; do
    local size=$(get_file_size_mb "$file")
    echo "   发现大文件: $(basename "$file") (${size}MB)"
    
    # 压缩大文件
    local compressed="${file}.gz"
    if [ ! -f "$compressed" ]; then
      gzip -c "$file" > "$compressed"
      if [ $? -eq 0 ]; then
        # 清空原文件
        > "$file"
        echo "   压缩并清空: $(basename "$file")"
        ((count++))
      fi
    fi
  done
  
  echo -e "${GREEN}✅ 处理了 $count 个大文件${NC}"
}

# 函数：限制日志文件数量
limit_log_files() {
  local max_files=$1
  
  echo -e "${YELLOW}限制日志文件数量为 $max_files...${NC}"
  
  # 获取所有日志文件（包括压缩的）
  local total_files=$(find "$LOG_DIR" -name "*.log*" -type f | wc -l)
  
  if [ "$total_files" -gt "$max_files" ]; then
    local to_delete=$((total_files - max_files))
    echo "   当前文件数: $total_files"
    echo "   需要删除: $to_delete"
    
    # 按修改时间排序，删除最旧的文件
    find "$LOG_DIR" -name "*.log*" -type f -printf '%T@ %p\n' | \
      sort -n | head -n "$to_delete" | cut -d' ' -f2- | \
      while IFS= read -r file; do
        rm -f "$file"
        echo "   删除: $(basename "$file")"
      done
    
    echo -e "${GREEN}✅ 删除了 $to_delete 个旧文件${NC}"
  else
    echo -e "${GREEN}✅ 文件数量在限制范围内 ($total_files/$max_files)${NC}"
  fi
}

# 函数：生成日志摘要
generate_log_summary() {
  echo ""
  echo -e "${YELLOW}日志摘要:${NC}"
  echo "----------------------------------------"
  
  # 统计日志文件
  local log_count=$(find "$LOG_DIR" -name "*.log" -type f | wc -l)
  local gz_count=$(find "$LOG_DIR" -name "*.log.gz" -type f | wc -l)
  local total_size=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1)
  
  echo "   活跃日志文件: $log_count"
  echo "   压缩日志文件: $gz_count"
  echo "   总大小: $total_size"
  
  # 显示最大的5个日志文件
  echo ""
  echo "   最大的5个日志文件:"
  find "$LOG_DIR" -name "*.log*" -type f -printf '%s %p\n' | \
    sort -rn | head -n 5 | while read size file; do
      local size_mb=$(echo "scale=2; $size / 1024 / 1024" | bc)
      echo "     $(basename "$file") - ${size_mb}MB"
    done
}

# 执行日志轮转
echo -e "${BLUE}开始日志轮转...${NC}"
echo ""

# 1. 压缩旧日志
compress_old_logs "$COMPRESS_DAYS"
echo ""

# 2. 删除过期日志
delete_old_logs "$DELETE_DAYS"
echo ""

# 3. 清理超大日志
cleanup_large_logs "$MAX_SIZE_MB"
echo ""

# 4. 限制文件数量
limit_log_files "$MAX_FILES"
echo ""

# 5. 生成摘要
generate_log_summary

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 日志轮转完成${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "下次运行建议: 每天运行一次"
echo "cron配置示例: 0 2 * * * /path/to/log-rotation.sh"