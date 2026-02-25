#!/bin/bash

# @file ollama-optimization.sh
# @description iMac M4 Ollama 服务优化脚本 - 减少模型加载时间和优化显存使用
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [optimization],[ollama],[performance]

# ============================================================
# YYC³ AI Family - iMac M4 Ollama 优化脚本
# 目标:
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
echo -e "${BOLD}  iMac M4 Ollama 优化工具${NC}"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# ============================================================
# 1. 检查当前状态
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  1. 检查当前状态${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 检查 Ollama 服务状态
if curl -s http://localhost:11434/api/version &>/dev/null; then
  echo -e "  ${GREEN}✅ Ollama 服务运行中${NC}"
  OLLAMA_VERSION=$(curl -s http://localhost:11434/api/version)
  echo "  版本: $OLLAMA_VERSION"
else
  echo -e "  ${RED}❌ Ollama 服务未运行${NC}"
  echo "  请先启动 Ollama 服务"
  exit 1
fi

# 获取已加载的模型
LOADED_MODELS=$(curl -s http://localhost:11434/api/tags 2>/dev/null | jq -r '.models[] | select(.running == true) | .name' 2>/dev/null || echo "")
if [ -n "$LOADED_MODELS" ]; then
  echo -e "  ${YELLOW}已加载模型:${NC}"
  echo "$LOADED_MODELS" | while read model; do
    echo "    - $model"
  done
else
  echo -e "  ${YELLOW}当前没有加载的模型${NC}"
fi

# ============================================================
# 2. 优化配置
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  2. 应用优化配置${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 设置环境变量
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_LOAD_TIMEOUT=10m0s
export OLLAMA_KEEP_ALIVE=10m0s
export OLLAMA_NUM_PARALLEL=1

echo -e "  ${GREEN}✅ 已设置优化环境变量:${NC}"
echo "    OLLAMA_MAX_LOADED_MODELS=1 (限制同时加载的模型数)"
echo "    OLLAMA_LOAD_TIMEOUT=10m0s (增加加载超时)"
echo "    OLLAMA_KEEP_ALIVE=10m0s (延长模型存活时间)"
echo "    OLLAMA_NUM_PARALLEL=1 (单线程加载)"

# ============================================================
# 3. 预加载常用模型
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  3. 预加载常用模型${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 常用模型列表
COMMON_MODELS=(
  "codegeex4:latest"
  "phi3:mini"
  "qwen2.5:7b"
  "nomic-embed-text:latest"
)

for model in "${COMMON_MODELS[@]}"; do
  echo ""
  echo -e "  ${YELLOW}检查模型: $model${NC}"
  
  # 检查模型是否已存在
  if curl -s http://localhost:11434/api/tags 2>/dev/null | grep -q "\"$model\""; then
    echo -e "    ${GREEN}✅ 模型已存在${NC}"
  else
    echo -e "    ${YELLOW}⏳ 拉取模型中...${NC}"
    ollama pull "$model"
  fi
done

# ============================================================
# 4. 显存优化建议
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  4. 显存优化建议${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "  ${GREEN}推荐操作:${NC}"
echo ""
echo "  1. 使用 Q4_K_S 量化模型（比 Q4_0 更高效）"
echo "  2. 设置较小的上下文长度（如 8192 或 16384）"
echo "  3. 定期清理未使用的模型"
echo "  4. 使用模型卸载命令释放显存"
echo ""
echo "  示例命令："
echo "    # 卸载当前模型"
echo "    curl -X POST http://localhost:11434/api/generate -d '{\"model\":\"codegeex4:latest\",\"keep_alive\":0}'"
echo ""
echo "    # 使用较小上下文"
echo "    curl -X POST http://localhost:11434/api/generate -d '{\"model\":\"codegeex4:latest\",\"prompt\":\"Hello\",\"options\":{\"num_ctx\":8192}}'"

# ============================================================
# 5. 性能测试
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  5. 性能测试${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 测试模型加载时间
echo ""
echo -e "  ${YELLOW}测试模型加载时间...${NC}"
for model in "phi3:mini" "codegeex4:latest"; do
  echo ""
  echo -e "  ${YELLOW}加载模型: $model${NC}"
  START_TIME=$(date +%s.%N)
  
  # 触发模型加载
  curl -s -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"$model\",\"prompt\":\"test\",\"stream\":false}" \
    &>/dev/null
  
  END_TIME=$(date +%s.%N)
  LOAD_TIME=$(echo "$END_TIME - $START_TIME" | bc)
  
  echo -e "    ${GREEN}加载时间: ${LOAD_TIME} 秒${NC}"
done

# ============================================================
# 6. 监控建议
# ============================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  6. 监控建议${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "  ${GREEN}建议监控指标:${NC}"
echo ""
echo "  1. GPU 使用率:"
echo "     sudo powermetrics --samplers gpu_power -i 1000"
echo ""
echo "  2. 显存使用情况:"
echo "     curl -s http://localhost:11434/api/tags | jq '.models | map({name, size})'"
echo ""
echo "  3. 响应时间:"
echo "     time curl -s http://localhost:11434/api/generate -X POST -H 'Content-Type: application/json' -d '{\"model\":\"phi3:mini\",\"prompt\":\"Hi\",\"stream\":false}'"
echo ""
echo "  4. 模型卸载状态:"
echo "     curl -s http://localhost:11434/api/tags | jq '.models[] | select(.running == true) | .name'"

# ============================================================
# 7. 优化总结
# ============================================================
echo ""
echo "========================================"
echo -e "${BOLD}  优化总结${NC}"
echo "========================================"
echo ""
echo -e "  ${GREEN}✅ 已完成的优化:${NC}"
echo ""
echo "  1. 设置环境变量以优化性能"
echo "  2. 预加载常用模型"
echo "  3. 提供显存优化建议"
echo "  4. 执行性能测试"
echo ""
echo -e "  ${YELLOW}⚠️  注意事项:${NC}"
echo ""
echo "  1. 重启 Ollama 服务以应用新的环境变量"
echo "  2. 监控显存使用，避免 OOM"
echo "  3. 根据实际使用情况调整参数"
echo ""
echo "  重启命令:"
echo -e "    ${CYAN}OLLAMA_MAX_LOADED_MODELS=1 OLLAMA_LOAD_TIMEOUT=10m0s OLLAMA_HOST=0.0.0.0 ollama serve${NC}"
echo ""
echo "========================================"
