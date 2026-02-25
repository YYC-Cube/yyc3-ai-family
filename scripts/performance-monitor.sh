#!/bin/bash

# @file performance-monitor.sh
# @description YYC³ AI-Family 性能监控指标收集脚本
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [monitoring],[performance],[metrics]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YYC³ 性能监控指标${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 配置
METRICS_DIR=${METRICS_DIR:-/var/log/yyc3/metrics}
mkdir -p "$METRICS_DIR" 2>/dev/null || METRICS_DIR="/tmp/yyc3-metrics"
mkdir -p "$METRICS_DIR"

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
METRICS_FILE="$METRICS_DIR/metrics-$(date +%Y%m%d).json"

# 函数：获取CPU使用率
get_cpu_usage() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//'
  else
    # Linux
    top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%id.*/\1/" | awk '{print 100 - $1}'
  fi
}

# 函数：获取内存使用率
get_memory_usage() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    vm_stat | perl -ne '/Pages free/ {print ($1 * 4096) / (1.0 * 1024 * 1024 * 1024) * 100.0}' | xargs printf "%.1f\n"
  else
    # Linux
    free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}'
  fi
}

# 函数：获取磁盘使用率
get_disk_usage() {
  df -h / | awk 'NR==2 {print $5}' | sed 's/%//'
}

# 函数：获取进程数量
get_process_count() {
  ps aux | wc -l
}

# 函数：检查服务状态
check_service_status() {
  local service_name=$1
  local port=$2
  
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "running"
  else
    echo "stopped"
  fi
}

# 函数：获取数据库连接数
get_db_connections() {
  local db_host=${1:-localhost}
  local db_port=${2:-5433}
  
  if command -v psql &> /dev/null; then
    PGPASSWORD=$DB_PASSWORD psql -h $db_host -p $db_port -U $DB_USER -d postgres -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null || echo "0"
  else
    echo "N/A"
  fi
}

# 函数：获取API响应时间
get_api_response_time() {
  local url=$1
  local timeout=${2:-5}
  
  if command -v curl &> /dev/null; then
    local start_time=$(date +%s%N)
    curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" >/dev/null 2>&1
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    echo "${duration}ms"
  else
    echo "N/A"
  fi
}

# 函数：收集系统指标
collect_system_metrics() {
  echo -e "${YELLOW}系统指标:${NC}"
  echo "----------------------------------------"
  
  local cpu=$(get_cpu_usage)
  local memory=$(get_memory_usage)
  local disk=$(get_disk_usage)
  local processes=$(get_process_count)
  
  echo "CPU 使用率: ${cpu}%"
  echo "内存使用率: ${memory}%"
  echo "磁盘使用率: ${disk}%"
  echo "进程数量: $processes"
  echo ""
  
  # 生成JSON
  cat << EOF
{
  "timestamp": "$TIMESTAMP",
  "system": {
    "cpu_usage": ${cpu},
    "memory_usage": ${memory},
    "disk_usage": ${disk},
    "process_count": $processes
  }
EOF
}

# 函数：收集服务指标
collect_service_metrics() {
  echo -e "${YELLOW}服务指标:${NC}"
  echo "----------------------------------------"
  
  # 检查各个服务
  local frontend_status=$(check_service_status "Frontend" "3200")
  local backend_status=$(check_service_status "Backend" "3001")
  local ollama_status=$(check_service_status "Ollama" "11434")
  
  echo "前端服务 (3200): $frontend_status"
  echo "后端服务 (3001): $backend_status"
  echo "Ollama服务 (11434): $ollama_status"
  echo ""
  
  # 生成JSON
  cat << EOF
,
  "services": {
    "frontend": {
      "port": 3200,
      "status": "$frontend_status"
    },
    "backend": {
      "port": 3001,
      "status": "$backend_status"
    },
    "ollama": {
      "port": 11434,
      "status": "$ollama_status"
    }
  }
EOF
}

# 函数：收集数据库指标
collect_database_metrics() {
  echo -e "${YELLOW}数据库指标:${NC}"
  echo "----------------------------------------"
  
  local db_connections=$(get_db_connections)
  local db_size=$(du -sh /opt/yyc3/data 2>/dev/null || echo "0")
  
  echo "活跃连接数: $db_connections"
  echo "数据库大小: $db_size"
  echo ""
  
  # 生成JSON
  cat << EOF
,
  "database": {
    "connections": $db_connections,
    "size": "$db_size"
  }
EOF
}

# 函数：收集应用指标
collect_application_metrics() {
  echo -e "${YELLOW}应用指标:${NC}"
  echo "----------------------------------------"
  
  # API响应时间
  local api_time=$(get_api_response_time "http://localhost:3001/api/health")
  
  echo "API响应时间: $api_time"
  echo ""
  
  # 生成JSON
  cat << EOF
,
  "application": {
    "api_response_time": "$api_time"
  }
EOF
}

# 函数：生成性能报告
generate_report() {
  echo ""
  echo -e "${YELLOW}性能报告:${NC}"
  echo "----------------------------------------"
  
  # 检查告警阈值
  local cpu=$(get_cpu_usage)
  local memory=$(get_memory_usage)
  local disk=$(get_disk_usage)
  
  local alerts=()
  
  if (( $(echo "$cpu > 80" | bc -l) )); then
    alerts+=("CPU使用率过高: ${cpu}%")
  fi
  
  if (( $(echo "$memory > 85" | bc -l) )); then
    alerts+=("内存使用率过高: ${memory}%")
  fi
  
  if (( $(echo "$disk > 90" | bc -l) )); then
    alerts+=("磁盘使用率过高: ${disk}%")
  fi
  
  if [ ${#alerts[@]} -gt 0 ]; then
    echo -e "${RED}⚠️  性能告警:${NC}"
    for alert in "${alerts[@]}"; do
      echo "   - $alert"
    done
  else
    echo -e "${GREEN}✅ 系统性能正常${NC}"
  fi
}

# 主函数：收集所有指标
main() {
  echo "开始收集性能指标..."
  echo ""
  
  # 收集指标
  echo "{" > "$METRICS_FILE"
  collect_system_metrics >> "$METRICS_FILE"
  collect_service_metrics >> "$METRICS_FILE"
  collect_database_metrics >> "$METRICS_FILE"
  collect_application_metrics >> "$METRICS_FILE"
  echo "}" >> "$METRICS_FILE"
  
  # 生成报告
  generate_report
  
  echo ""
  echo -e "${GREEN}✅ 指标收集完成${NC}"
  echo "   文件: $METRICS_FILE"
  echo ""
  
  # 显示文件大小
  local size=$(stat -f%z "$METRICS_FILE" 2>/dev/null || stat -c%s "$METRICS_FILE" 2>/dev/null)
  echo "   大小: $size bytes"
}

# 执行主函数
main

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}性能监控完成${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "建议:"
echo "  - 定期运行此脚本收集指标"
echo "  - 使用 cron 每小时运行一次"
echo "  - 监控指标趋势，及时发现性能问题"
echo ""
echo "cron配置示例:"
echo "  0 * * * * /path/to/performance-monitor.sh"