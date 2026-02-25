#!/bin/bash

# @file deploy-authorized-models.sh
# @description YYC³ AI-Family 持证模型部署封装脚本，支持智谱授权模型部署
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [deployment],[models],[authorization]

# ============================================================
# YYC³ 持证模型部署封装脚本
# 
# 支持的智谱授权模型:
# - CodeGeeX4: 代码生成专用模型
# - CogAgent: GUI智能体模型  
# - CogVideo: 视频生成模型
# - GLM-3-6B: 开源对话模型
#
# 授权信息:
# - 授权公司: 洛阳沫言酒店管理有限公司
# - 授权编号: 202411283053152737
# - 授权有效期: 永久有效
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODELS_DIR="${SCRIPT_DIR}/authorized-models"
OLLAMA_MODELS_DIR="${HOME}/.ollama/models"
NAS_MODELS_DIR="/var/subvols/8vEbTxkKvwb/@/ollama/models"

# 授权信息
AUTH_COMPANY="洛阳沫言酒店管理有限公司"
AUTH_CODE="202411283053152737"
AUTH_VALIDITY="永久有效"

# 打印带颜色的消息
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查Ollama是否安装
check_ollama() {
    if ! command -v ollama &> /dev/null; then
        log_error "Ollama 未安装，请先安装 Ollama"
        log_info "安装命令: curl -fsSL https://ollama.com/install.sh | sh"
        exit 1
    fi
    log_success "Ollama 已安装: $(ollama --version)"
}

# 检查Ollama服务状态
check_ollama_service() {
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        log_success "Ollama 服务运行中"
        return 0
    else
        log_warning "Ollama 服务未运行，尝试启动..."
        ollama serve &
        sleep 3
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            log_success "Ollama 服务启动成功"
            return 0
        else
            log_error "Ollama 服务启动失败"
            return 1
        fi
    fi
}

# 列出已安装的模型
list_installed_models() {
    log_info "已安装的模型:"
    ollama list
}

# 创建授权模型目录
setup_model_dir() {
    mkdir -p "${MODELS_DIR}"
    mkdir -p "${MODELS_DIR}/modelfiles"
    log_success "模型目录已创建: ${MODELS_DIR}"
}

# 生成 CodeGeeX4 Modelfile
generate_codegeex4_modelfile() {
    local modelfile="${MODELS_DIR}/modelfiles/CodeGeeX4.Modelfile"
    
    cat > "${modelfile}" << 'EOF'
# CodeGeeX4 代码生成模型 Modelfile
# YYC³ 智谱终身商业授权

FROM codegeex4:latest

# 系统提示词 - 包含授权信息
SYSTEM """你是 CodeGeeX4 代码生成助手，由智谱AI开发，YYC³团队部署。

【授权信息】
- 授权公司: 洛阳沫言酒店管理有限公司
- 授权编号: 202411283053152737
- 授权有效期: 永久有效

【能力】
- 多语言代码生成 (Python, JavaScript, TypeScript, Go, Rust, Java, C++, etc.)
- 代码补全与优化
- 代码解释与文档生成
- Bug修复建议

请用专业、准确的方式回答编程相关问题。"""

# 参数配置
PARAMETER temperature 0.3
PARAMETER top_p 0.95
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 8192
PARAMETER stop "<|endoftext|>"
PARAMETER stop "<|user|>"
PARAMETER stop "<|assistant|"

# 标签
LICENSE "智谱AI 商业授权"
AUTHOR "智谱AI / YYC³ Team"
VERSION "4.0"
EOF

    log_success "CodeGeeX4 Modelfile 已生成: ${modelfile}"
}

# 生成 GLM-3-6B Modelfile (用于Ollama导入)
generate_glm3_modelfile() {
    local modelfile="${MODELS_DIR}/modelfiles/GLM-3-6B.Modelfile"
    local model_path="$1"
    
    if [ -z "${model_path}" ]; then
        log_warning "未指定GLM-3-6B模型文件路径，使用默认路径"
        model_path="${NAS_MODELS_DIR}/chatglm3-6b-ggml-q4_K_M.bin"
    fi
    
    cat > "${modelfile}" << EOF
# GLM-3-6B 开源对话模型 Modelfile
# YYC³ 智谱终身商业授权

FROM ${model_path}

# 系统提示词 - 包含授权信息
SYSTEM """你是由YYC³部署的ChatGLM3-6B助手，拥有完整的商用授权。

【授权信息】
- 授权公司: 洛阳沫言酒店管理有限公司
- 授权编号: 202411283053152737
- 授权有效期: 永久有效

请用专业、准确的中文回答用户的问题。"""

# 模板配置
TEMPLATE """{{ if .System }}
{{ .System }}</s>{{ end }}{{ if .Prompt }}
{{ .Prompt }}</s>{{ end }}
{{ .Response }}</s>"""

# 参数配置
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 2048

# 标签
LICENSE "智谱AI 商业授权"
AUTHOR "智谱AI / YYC³ Team"
VERSION "3-6B"
EOF

    log_success "GLM-3-6B Modelfile 已生成: ${modelfile}"
}

# 创建授权模型
create_authorized_model() {
    local model_name="$1"
    local modelfile="${MODELS_DIR}/modelfiles/${model_name}.Modelfile"
    
    if [ ! -f "${modelfile}" ]; then
        log_error "Modelfile 不存在: ${modelfile}"
        return 1
    fi
    
    log_info "创建授权模型: ${model_name}"
    ollama create "yyc3-${model_name,,}" -f "${modelfile}"
    
    if [ $? -eq 0 ]; then
        log_success "模型创建成功: yyc3-${model_name,,}"
    else
        log_error "模型创建失败"
        return 1
    fi
}

# 从Ollama官方拉取模型并添加授权
pull_and_authorize() {
    local model_name="$1"
    
    log_info "拉取模型: ${model_name}"
    ollama pull "${model_name}"
    
    case "${model_name}" in
        codegeex4:latest)
            generate_codegeex4_modelfile
            create_authorized_model "CodeGeeX4"
            ;;
        *)
            log_warning "未知的模型类型: ${model_name}"
            ;;
    esac
}

# 部署所有授权模型
deploy_all() {
    log_info "开始部署所有授权模型..."
    
    # 1. CodeGeeX4 (代码生成)
    if ollama list | grep -q "codegeex4"; then
        log_info "CodeGeeX4 已存在，跳过拉取"
    else
        pull_and_authorize "codegeex4:latest"
    fi
    
    # 2. 生成授权版本
    generate_codegeex4_modelfile
    create_authorized_model "CodeGeeX4"
    
    log_success "所有授权模型部署完成"
    list_installed_models
}

# 验证授权模型
verify_models() {
    log_info "验证授权模型..."
    
    local models=("yyc3-codegeex4")
    local all_ok=true
    
    for model in "${models[@]}"; do
        if ollama list | grep -q "${model}"; then
            log_success "模型已安装: ${model}"
        else
            log_warning "模型未安装: ${model}"
            all_ok=false
        fi
    done
    
    if [ "${all_ok}" = true ]; then
        log_success "所有授权模型验证通过"
    else
        log_warning "部分模型未安装，请运行部署命令"
    fi
}

# 测试模型响应
test_model() {
    local model_name="$1"
    
    log_info "测试模型: ${model_name}"
    log_info "发送测试请求..."
    
    local response=$(ollama run "${model_name}" "你好，请简短介绍一下你自己" --verbose 2>&1)
    
    echo "${response}"
    log_success "测试完成"
}

# 导出模型配置
export_config() {
    local config_file="${MODELS_DIR}/model-config.json"
    
    cat > "${config_file}" << EOF
{
  "authorized_models": [
    {
      "id": "CodeGeeX4",
      "name": "CodeGeeX4 (代码生成)",
      "provider": "zhipu",
      "ollama_name": "yyc3-codegeex4",
      "context_window": 128000,
      "max_output": 8192,
      "capabilities": ["coding", "reasoning"],
      "authorization": {
        "company": "${AUTH_COMPANY}",
        "code": "${AUTH_CODE}",
        "validity": "${AUTH_VALIDITY}"
      }
    },
    {
      "id": "CogAgent",
      "name": "CogAgent (GUI智能体)",
      "provider": "zhipu",
      "ollama_name": null,
      "context_window": 32000,
      "max_output": 4096,
      "capabilities": ["vision", "reasoning", "automation"],
      "authorization": {
        "company": "${AUTH_COMPANY}",
        "code": "${AUTH_CODE}",
        "validity": "${AUTH_VALIDITY}"
      }
    },
    {
      "id": "CogVideo",
      "name": "CogVideo (视频生成)",
      "provider": "zhipu",
      "ollama_name": null,
      "context_window": 8192,
      "max_output": 2048,
      "capabilities": ["video_generation"],
      "authorization": {
        "company": "${AUTH_COMPANY}",
        "code": "${AUTH_CODE}",
        "validity": "${AUTH_VALIDITY}"
      }
    },
    {
      "id": "GLM-3-6B",
      "name": "GLM-3-6B (开源)",
      "provider": "zhipu",
      "ollama_name": "yyc3-glm-3-6b",
      "context_window": 8192,
      "max_output": 2048,
      "capabilities": ["conversation", "reasoning"],
      "authorization": {
        "company": "${AUTH_COMPANY}",
        "code": "${AUTH_CODE}",
        "validity": "${AUTH_VALIDITY}"
      }
    }
  ],
  "deployment_info": {
    "deployed_at": "$(date -Iseconds)",
    "node": "$(hostname)",
    "platform": "$(uname -s)"
  }
}
EOF

    log_success "配置已导出: ${config_file}"
}

# 显示帮助
show_help() {
    cat << EOF
YYC³ 持证模型部署封装脚本

用法: $0 <命令> [参数]

命令:
  check       检查Ollama环境
  list        列出已安装模型
  deploy      部署所有授权模型
  verify      验证授权模型状态
  test <模型> 测试模型响应
  export      导出模型配置
  help        显示此帮助信息

授权模型:
  - CodeGeeX4: 代码生成专用模型
  - CogAgent: GUI智能体模型
  - CogVideo: 视频生成模型
  - GLM-3-6B: 开源对话模型

授权信息:
  - 授权公司: ${AUTH_COMPANY}
  - 授权编号: ${AUTH_CODE}
  - 授权有效期: ${AUTH_VALIDITY}

示例:
  $0 check              # 检查环境
  $0 deploy             # 部署所有模型
  $0 test yyc3-codegeex4  # 测试CodeGeeX4
EOF
}

# 主函数
main() {
    local command="${1:-help}"
    
    case "${command}" in
        check)
            check_ollama
            check_ollama_service
            ;;
        list)
            check_ollama_service
            list_installed_models
            ;;
        deploy)
            check_ollama
            check_ollama_service
            setup_model_dir
            deploy_all
            export_config
            ;;
        verify)
            check_ollama_service
            verify_models
            ;;
        test)
            check_ollama_service
            test_model "${2:-yyc3-codegeex4}"
            ;;
        export)
            setup_model_dir
            export_config
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
