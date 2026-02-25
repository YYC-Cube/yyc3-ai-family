#!/bin/bash

# @file ollama-optimized-start.sh
# @description iMac M4 Ollama 优化启动脚本
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [optimization],[ollama],[startup]

# ============================================================
# YYC³ AI Family - iMac M4 Ollama 优化启动脚本
# 优化目标:
#   1. 减少模型加载时间
#   2. 优化显存使用
#   3. 提升连接性能
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo "========================================"
echo -e "${BOLD}  iMac M4 Ollama 优化启动${NC}"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# ============================================================
# 1. 停止现有服务
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  1. 停止现有 Ollama 服务${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 查找并停止现有 Ollama 进程
OLLAMA_PID=$(pgrep -f "ollama serve")
if [ -n "$OLLAMA_PID" ]; then
  echo -e "  ${YELLOW}发现运行中的 Ollama 进程 (PID: $OLLAMA_PID)${NC}"
  kill $OLLAMA_PID
  sleep 2
  
  # 检查是否成功停止
  if pgrep -f "ollama serve" > /dev/null; then
    echo -e "  ${RED}❌ 无法停止 Ollama 服务${NC}"
    echo -e "  ${YELLOW}请手动停止后重试${NC}"
    exit 1
  else
    echo -e "  ${GREEN}✅ Ollama 服务已停止${NC}"
  fi
else
  echo -e "  ${GREEN}✅ 没有运行中的 Ollama 服务${NC}"
fi

# ============================================================
# 2. 设置优化环境变量
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  2. 设置优化环境变量${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 网络配置
export OLLAMA_HOST=0.0.0.0:11434

# 模型加载优化
export OLLAMA_LOAD_TIMEOUT=10m0s
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_KEEP_ALIVE=10m0s
export OLLAMA_NUM_PARALLEL=1

# 性能优化
export OLLAMA_DEBUG=INFO
export OLLAMA_FLASH_ATTENTION=false

echo -e "  ${GREEN}✅ 环境变量已设置:${NC}"
echo ""
echo "  ${CYAN}网络配置:${NC}"
echo "    OLLAMA_HOST=$OLLAMA_HOST"
echo ""
echo "  ${CYAN}模型加载优化:${NC}"
echo "    OLLAMA_LOAD_TIMEOUT=$OLLAMA_LOAD_TIMEOUT"
echo "    OLLAMA_MAX_LOADED_MODELS=$OLLAMA_MAX_LOADED_MODELS"
echo "    OLLAMA_KEEP_ALIVE=$OLLAMA_KEEP_ALIVE"
echo "    OLLAMA_NUM_PARALLEL=$OLLAMA_NUM_PARALLEL"
echo ""
echo "  ${CYAN}性能优化:${NC}"
echo "    OLLAMA_DEBUG=$OLLAMA_DEBUG"
echo "    OLLAMA_FLASH_ATTENTION=$OLLAMA_FLASH_ATTENTION"

# ============================================================
# 3. 预加载常用模型
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  3. 预加载常用模型${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 常用模型列表（按优先级排序）
PRIORITY_MODELS=(
  "phi3:mini"
  "codegeex4:latest"
  "qwen2.5:7b"
)

echo ""
echo -e "  ${YELLOW}检查模型可用性...${NC}"
for model in "${PRIORITY_MODELS[@]}"; do
  if ollama list | grep -q "$model"; then
    echo -e "    ${GREEN}✅ $model${NC}"
  else
    echo -e "    ${YELLOW}⚠️  $model (未安装)${NC}"
  fi
done

# ============================================================
# 4. 启动 Ollama 服务
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  4. 启动 Ollama 服务${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${BOLD}启动命令:${NC}"
echo -e "${CYAN}OLLAMA_HOST=0.0.0.0 OLLAMA_MAX_LOADED_MODELS=1 OLLAMA_LOAD_TIMEOUT=10m0s OLLAMA_KEEP_ALIVE=10m0s ollama serve${NC}"
echo ""

# 启动服务（后台运行）
nohup ollama serve > /tmp/ollama-optimized.log 2>&1 &
OLLAMA_PID=$!

echo -e "  ${GREEN}✅ Ollama 服务已启动 (PID: $OLLAMA_PID)${NC}"
echo -e "  ${YELLOW}日志文件: /tmp/ollama-optimized.log${NC}"

# ============================================================
# 5. 等待服务就绪
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  5. 等待服务就绪${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "  ${YELLOW}等待服务启动...${NC}"

MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s http://localhost:11434/api/version &>/dev/null; then
    echo -e "  ${GREEN}✅ 服务已就绪！${NC}"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo -n "."
  sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo ""
  echo -e "  ${RED}❌ 服务启动超时${NC}"
  echo -e "  ${YELLOW}请检查日志: tail -f /tmp/ollama-optimized.log${NC}"
  exit 1
fi

# ============================================================
# 6. 验证配置
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  6. 验证配置${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "  ${YELLOW}服务信息:${NC}"

# 获取版本信息
VERSION=$(curl -s http://localhost:11434/api/version)
echo "    版本: $VERSION"

# 检查监听地址
if curl -s http://192.168.3.22:11434/api/version &>/dev/null; then
  echo -e "    ${GREEN}✅ 网络连接正常 (192.168.3.22:11434)${NC}"
else
  echo -e "    ${YELLOW}⚠️  网络连接测试失败${NC}"
fi

# 获取已加载模型
LOADED_MODELS=$(curl -s http://localhost:11434/api/tags 2>/dev/null | jq -r '.models[] | select(.running == true) | .name' 2>/dev/null || echo "")
if [ -n "$LOADED_MODELS" ]; then
  echo "    已加载模型:"
  echo "$LOADED_MODELS" | while read model; do
    echo "      - $model"
  done
else
  echo "    已加载模型: 无"
fi

# ============================================================
# 7. 性能测试
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  7. 性能测试${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "  ${YELLOW}测试响应时间...${NC}"

# 测试 API 版本请求
START_TIME=$(date +%s.%N)
curl -s http://localhost:11434/api/version > /dev/null
END_TIME=$(date +%s.%N)
RESPONSE_TIME=$(echo "$END_TIME - $START_TIME" | bc)

echo -e "    ${GREEN}API 版本请求: ${RESPONSE_TIME} 秒${NC}"

# ============================================================
# 8. 完成
# ============================================================
echo ""
echo "========================================"
echo -e "${BOLD}  启动完成！${NC}"
echo "========================================"
echo ""
echo -e "  ${GREEN}✅ Ollama 服务已成功启动并优化${NC}"
echo ""
echo "  ${CYAN}服务信息:${NC}"
echo "    PID: $OLLAMA_PID"
echo "    监听地址: 0.0.0.0:11434"
echo "    日志文件: /tmp/ollama-optimized.log"
echo ""
echo "  ${CYAN}管理命令:${NC}"
echo "    查看日志: tail -f /tmp/ollama-optimized.log"
echo "    停止服务: kill $OLLAMA_PID"
echo "    查看模型: ollama list"
echo "    拉取模型: ollama pull <model>"
echo ""
echo "  ${CYAN}优化配置:${NC}"
echo "    最大加载模型数: 1"
echo "    加载超时: 10 分钟"
echo "    模型存活时间: 10 分钟"
echo ""
echo "========================================"
