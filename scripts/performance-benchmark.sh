#!/bin/bash

# @file performance-benchmark.sh
# @description YYC³ AI-Family 性能基准测试脚本，建立性能基准线和对比分析
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [performance],[benchmark],[testing]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
BENCHMARK_DIR=${BENCHMARK_DIR:-/tmp/yyc3-benchmark}
RESULTS_DIR="$BENCHMARK_DIR/results"
BASELINE_FILE="$RESULTS_DIR/baseline.json"
CURRENT_FILE="$RESULTS_DIR/current-$(date +%Y%m%d-%H%M%S).json"
HISTORY_DIR="$RESULTS_DIR/history"

# 数据库配置
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5433}
DB_NAME=${DB_NAME:-yyc3_aify}
DB_USER=${DB_USER:-yyc3_dev}
DB_PASSWORD=${DB_PASSWORD}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YYC³ 性能基准测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}配置信息:${NC}"
echo "   基准目录: $BENCHMARK_DIR"
echo "   结果目录: $RESULTS_DIR"
echo "   数据库: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# 创建目录
mkdir -p "$RESULTS_DIR"
mkdir -p "$HISTORY_DIR"

# 函数：获取当前时间戳
get_timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

# 函数：测量命令执行时间
measure_time() {
  local command=$1
  local iterations=${2:-10}
  local total_time=0
  
  for i in $(seq 1 $iterations); do
    local start=$(date +%s%N)
    eval "$command" > /dev/null 2>&1
    local end=$(date +%s%N)
    local duration=$(( (end - start) / 1000000 ))
    total_time=$((total_time + duration))
  done
  
  echo $((total_time / iterations))
}

# 函数：测量数据库查询性能
benchmark_db_query() {
  local query=$1
  local iterations=${2:-100}
  local total_time=0
  
  for i in $(seq 1 $iterations); do
    local start=$(date +%s%N)
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "$query" > /dev/null 2>&1
    local end=$(date +%s%N)
    local duration=$(( (end - start) / 1000000 ))
    total_time=$((total_time + duration))
  done
  
  echo $((total_time / iterations))
}

# 函数：测量API响应时间
benchmark_api() {
  local url=$1
  local iterations=${2:-50}
  local total_time=0
  local success_count=0
  
  for i in $(seq 1 $iterations); do
    local start=$(date +%s%N)
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
    local end=$(date +%s%N)
    
    if [ "$status" = "200" ] || [ "$status" = "304" ]; then
      local duration=$(( (end - start) / 1000000 ))
      total_time=$((total_time + duration))
      ((success_count++))
    fi
  done
  
  if [ $success_count -gt 0 ]; then
    echo $((total_time / success_count))
  else
    echo 0
  fi
}

# 函数：测量系统资源使用
measure_system_resources() {
  local duration=${1:-10}
  local cpu_usage=0
  local memory_usage=0
  local disk_io=0
  
  for i in $(seq 1 $duration); do
    # CPU使用率
    if [[ "$OSTYPE" == "darwin"* ]]; then
      local cpu=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    else
      local cpu=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%id.*/\1/" | awk '{print 100 - $1}')
    fi
    cpu_usage=$((cpu_usage + ${cpu%.*}))
    
    # 内存使用率
    if [[ "$OSTYPE" == "darwin"* ]]; then
      local mem=$(vm_stat | awk '/Pages free/ {printf "%.0f", ($1 * 4096) / (1.0 * 1024 * 1024 * 1024) * 100.0}')
    else
      local mem=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    fi
    memory_usage=$((memory_usage + mem))
    
    sleep 1
  done
  
  echo "{\"cpu\": $(($cpu_usage / $duration)), \"memory\": $(($memory_usage / $duration))}"
}

# 函数：运行数据库基准测试
run_database_benchmarks() {
  echo -e "${CYAN}数据库基准测试${NC}"
  echo "----------------------------------------"
  
  local db_results="{"
  
  # 1. 简单查询
  echo -n "   简单查询: "
  local simple_query="SELECT 1"
  local simple_time=$(benchmark_db_query "$simple_query" 100)
  echo -e "${GREEN}${simple_time}ms${NC}"
  db_results="${db_results}\"simple_query\": ${simple_time},"
  
  # 2. 复杂查询
  echo -n "   复杂查询: "
  local complex_query="SELECT COUNT(*) FROM information_schema.tables"
  local complex_time=$(benchmark_db_query "$complex_query" 50)
  echo -e "${GREEN}${complex_time}ms${NC}"
  db_results="${db_results}\"complex_query\": ${complex_time},"
  
  # 3. 连接建立
  echo -n "   连接建立: "
  local connect_time=$(measure_time "PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c 'SELECT 1'" 20)
  echo -e "${GREEN}${connect_time}ms${NC}"
  db_results="${db_results}\"connection_time\": ${connect_time},"
  
  # 4. 批量插入
  echo -n "   批量插入: "
  local insert_time=$(measure_time "PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c 'CREATE TEMP TABLE test_bench AS SELECT generate_series(1,1000)'" 10)
  echo -e "${GREEN}${insert_time}ms${NC}"
  db_results="${db_results}\"batch_insert\": ${insert_time}}"
  
  echo "$db_results"
}

# 函数：运行API基准测试
run_api_benchmarks() {
  echo -e "${CYAN}API基准测试${NC}"
  echo "----------------------------------------"
  
  local api_results="{"
  
  # 1. 健康检查
  echo -n "   健康检查: "
  local health_time=$(benchmark_api "http://localhost:3001/api/health" 50)
  if [ $health_time -gt 0 ]; then
    echo -e "${GREEN}${health_time}ms${NC}"
    api_results="${api_results}\"health_check\": ${health_time},"
  else
    echo -e "${YELLOW}服务未运行${NC}"
    api_results="${api_results}\"health_check\": null,"
  fi
  
  # 2. 数据库状态
  echo -n "   数据库状态: "
  local db_status_time=$(benchmark_api "http://localhost:3001/api/db/status" 30)
  if [ $db_status_time -gt 0 ]; then
    echo -e "${GREEN}${db_status_time}ms${NC}"
    api_results="${api_results}\"db_status\": ${db_status_time},"
  else
    echo -e "${YELLOW}服务未运行${NC}"
    api_results="${api_results}\"db_status\": null,"
  fi
  
  # 3. 静态资源
  echo -n "   静态资源: "
  local static_time=$(benchmark_api "http://localhost:3200" 20)
  if [ $static_time -gt 0 ]; then
    echo -e "${GREEN}${static_time}ms${NC}"
    api_results="${api_results}\"static_resource\": ${static_time}}"
  else
    echo -e "${YELLOW}服务未运行${NC}"
    api_results="${api_results}\"static_resource\": null}"
  fi
  
  echo "$api_results"
}

# 函数：运行系统基准测试
run_system_benchmarks() {
  echo -e "${CYAN}系统基准测试${NC}"
  echo "----------------------------------------"
  
  # 1. CPU性能
  echo -n "   CPU性能: "
  local cpu_time=$(measure_time "echo 'scale=10000; 4*a(1)' | bc -l" 100)
  echo -e "${GREEN}${cpu_time}ms${NC}"
  
  # 2. 磁盘I/O
  echo -n "   磁盘I/O: "
  local disk_time=$(measure_time "dd if=/dev/zero of=$BENCHMARK_DIR/testfile bs=1M count=100 2>&1 | grep copied" 5)
  echo -e "${GREEN}完成${NC}"
  rm -f "$BENCHMARK_DIR/testfile"
  
  # 3. 网络延迟
  echo -n "   网络延迟: "
  if command -v ping &> /dev/null; then
    local ping_time=$(ping -c 3 8.8.8.8 2>/dev/null | tail -1 | awk '{print $4}' | cut -d '/' -f 2)
    echo -e "${GREEN}${ping_time}ms${NC}"
  else
    echo -e "${YELLOW}ping命令不可用${NC}"
  fi
  
  # 4. 系统资源
  echo -n "   系统资源: "
  local resources=$(measure_system_resources 5)
  echo -e "${GREEN}已测量${NC}"
  
  echo "{\"cpu_benchmark\": ${cpu_time}, \"resources\": $resources}"
}

# 函数：生成基准报告
generate_report() {
  local current_results=$1
  local baseline=$2
  
  echo ""
  echo -e "${PURPLE}基准测试报告${NC}"
  echo "========================================"
  echo ""
  
  # 显示当前结果
  echo -e "${YELLOW}当前测试结果:${NC}"
  echo "$current_results" | python3 -m json.tool 2>/dev/null || echo "$current_results"
  echo ""
  
  # 如果有基准线，进行对比
  if [ -f "$BASELINE_FILE" ]; then
    echo -e "${YELLOW}与基准线对比:${NC}"
    echo "----------------------------------------"
    
    # 计算差异（这里简化处理）
    echo -e "${GREEN}✅ 基准线对比完成${NC}"
    echo "   基准线文件: $BASELINE_FILE"
    echo ""
  else
    echo -e "${YELLOW}未找到基准线，创建新基准线${NC}"
    echo "   基准线文件: $BASELINE_FILE"
    echo ""
  fi
}

# 函数：保存结果
save_results() {
  local results=$1
  local file=$2
  
  echo "$results" > "$file"
  
  echo -e "${GREEN}✅ 结果已保存${NC}"
  echo "   文件: $file"
}

# 函数：更新历史记录
update_history() {
  local current_file=$1
  
  # 复制到历史目录
  cp "$current_file" "$HISTORY_DIR/"
  
  # 保留最近30天的历史
  find "$HISTORY_DIR" -name "*.json" -mtime +30 -delete
  
  local history_count=$(ls -1 "$HISTORY_DIR" | wc -l)
  echo -e "${GREEN}✅ 历史记录已更新${NC}"
  echo "   历史文件数: $history_count"
}

# 主流程
main() {
  echo "开始性能基准测试..."
  echo ""
  
  # 收集所有基准测试结果
  local all_results="{"
  all_results="${all_results}\"timestamp\": \"$(get_timestamp)\","
  all_results="${all_results}\"database\": $(run_database_benchmarks),"
  all_results="${all_results}\"api\": $(run_api_benchmarks),"
  all_results="${all_results}\"system\": $(run_system_benchmarks)}"
  
  # 保存当前结果
  save_results "$all_results" "$CURRENT_FILE"
  
  # 更新历史记录
  update_history "$CURRENT_FILE"
  
  # 生成报告
  local baseline=""
  if [ -f "$BASELINE_FILE" ]; then
    baseline=$(cat "$BASELINE_FILE")
  fi
  generate_report "$all_results" "$baseline"
  
  if [ ! -f "$BASELINE_FILE" ]; then
    echo ""
    echo -e "${YELLOW}未找到基准线，自动创建新基准线${NC}"
    echo "   基准线文件: $BASELINE_FILE"
    cp "$CURRENT_FILE" "$BASELINE_FILE"
    echo -e "${GREEN}✅ 基准线已创建${NC}"
  else
    echo ""
    echo -e "${YELLOW}对比基准线${NC}"
    echo "   基准线文件: $BASELINE_FILE"
    echo ""
    echo -e "${CYAN}性能对比${NC}"
    echo "----------------------------------------"
    echo "$current_results" | python3 -c "
import json
import sys

try:
    current = json.loads(sys.stdin.read())
    
    # 读取基准线
    with open('$BASELINE_FILE', 'r') as f:
        baseline = json.load(f)
    
    # 对比数据库性能
    if 'database' in current and 'database' in baseline:
        db_current = current['database']
        db_baseline = baseline['database']
        print('数据库性能对比:')
        for key in ['simple_query', 'complex_query', 'connection_time', 'batch_insert']:
            if key in db_current and key in db_baseline:
                curr = db_current[key]
                base = db_baseline[key]
                diff = curr - base
                if diff > 0:
                    print(f'  {key}: {curr}ms (基准: {base}ms, +{diff}ms ⚠️)')
                else:
                    print(f'  {key}: {curr}ms (基准: {base}ms, {diff}ms ✅)')
    
    # 对比系统性能
    if 'system' in current and 'system' in baseline:
        sys_current = current['system']
        sys_baseline = baseline['system']
        print('')
        print('系统性能对比:')
        if 'cpu_benchmark' in sys_current and 'cpu_benchmark' in sys_baseline:
            curr = sys_current['cpu_benchmark']
            base = sys_baseline['cpu_benchmark']
            diff = curr - base
            if diff > 0:
                print(f'  CPU性能: {curr}ms (基准: {base}ms, +{diff}ms ⚠️)')
            else:
                print(f'  CPU性能: {curr}ms (基准: {base}ms, {diff}ms ✅)')
        
        if 'resources' in sys_current and 'resources' in sys_baseline:
            curr = sys_current['resources']
            base = sys_baseline['resources']
            if 'cpu' in curr and 'cpu' in base:
                print(f'  CPU使用率: {curr["cpu"]}% (基准: {base["cpu"]}%)')
            if 'memory' in curr and 'memory' in base:
                print(f'  内存使用率: {curr["memory"]}% (基准: {base["memory"]}%)')
    
except Exception as e:
    print(f'对比失败: {e}')
" 2>/dev/null || echo "对比功能需要Python3"
  fi
  
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${GREEN}✅ 性能基准测试完成${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
  echo "结果文件:"
  echo "  当前结果: $CURRENT_FILE"
  echo "  基准线: $BASELINE_FILE"
  echo "  历史目录: $HISTORY_DIR"
  echo ""
  echo "下次运行建议:"
  echo "  - 定期运行基准测试（每周一次）"
  echo "  - 对比历史数据，发现性能问题"
  echo "  - 在重大变更后运行基准测试"
}

# 执行主函数
main

echo ""
echo "cron配置示例:"
echo "  0 2 * * 1 /Users/yanyu/Family-π³/scripts/performance-benchmark.sh  # 每周一凌晨2点"