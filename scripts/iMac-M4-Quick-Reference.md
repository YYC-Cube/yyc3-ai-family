# iMac M4 Ollama 优化快速参考

> 快速命令和配置参考

---

## 🚀 快速启动

```bash
# 方式 1: 使用优化启动脚本（推荐）
bash /Users/yanyu/Family-π³/scripts/ollama-optimized-start.sh

# 方式 2: 手动启动
OLLAMA_HOST=0.0.0.0 OLLAMA_MAX_LOADED_MODELS=1 OLLAMA_LOAD_TIMEOUT=10m0s OLLAMA_KEEP_ALIVE=10m0s ollama serve
```

---

## ⚙️ 核心环境变量

```bash
OLLAMA_HOST=0.0.0.0:11434          # 监听所有网络接口
OLLAMA_MAX_LOADED_MODELS=1         # 限制同时加载的模型数
OLLAMA_LOAD_TIMEOUT=10m0s          # 增加加载超时
OLLAMA_KEEP_ALIVE=10m0s            # 延长模型存活时间
OLLAMA_NUM_PARALLEL=1              # 单线程加载
OLLAMA_DEBUG=INFO                  # 调试级别
```

---

## 🤖 推荐模型

| 用途 | 模型 | 命令 |
|------|------|------|
| 快速响应 | phi3:mini | `ollama pull phi3:mini` |
| 代码生成 | codegeex4:9b | `ollama pull codegeex4:9b` |
| 通用任务 | qwen2.5:7b | `ollama pull qwen2.5:7b` |

---

## 🔍 监控命令

```bash
# 查看 GPU 使用率
sudo powermetrics --samplers gpu_power -i 1000

# 查看显存使用
curl -s http://localhost:11434/api/tags | jq '.models | map({name, size, running})'

# 查看已加载模型
curl -s http://localhost:11434/api/tags | jq '.models[] | select(.running == true)'

# 测试响应时间
time curl -s http://localhost:11434/api/generate -X POST -H 'Content-Type: application/json' -d '{"model":"phi3:mini","prompt":"Hi","stream":false}'

# 查看日志
tail -f /tmp/ollama-optimized.log
```

---

## 🛠️ 常用操作

```bash
# 列出所有模型
ollama list

# 拉取模型
ollama pull <model>

# 删除模型
ollama rm <model>

# 清理缓存
ollama gc

# 卸载当前模型
curl -X POST http://localhost:11434/api/generate -d '{"model":"phi3:mini","keep_alive":0}'

# 停止服务
pkill -f "ollama serve"
```

---

## 📊 API 请求示例

### 基础请求

```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "phi3:mini",
    "prompt": "Hello, how are you?",
    "stream": false
  }'
```

### 优化上下文

```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "phi3:mini",
    "prompt": "Hello",
    "options": {
      "num_ctx": 8192,
      "num_batch": 512
    }
  }'
```

### 流式响应

```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "phi3:mini",
    "prompt": "Hello",
    "stream": true
  }'
```

---

## 🎯 性能目标

| 指标 | 目标值 |
|------|--------|
| 模型加载时间 | < 5 秒 |
| 显存使用率 | < 50% |
| 响应时间 | < 3ms |
| 并发模型数 | 1 |

---

## 📁 相关文件

| 文件 | 说明 |
|------|------|
| `ollama-optimized-start.sh` | 优化启动脚本 |
| `ollama-optimization.sh` | 优化工具脚本 |
| `ollama-optimization.env` | 环境变量配置 |
| `iMac-M4-Analysis.md` | 详细分析报告 |
| `iMac-M4-Optimization-Guide.md` | 完整优化指南 |

---

## 🔧 故障排查

### 服务无法启动

```bash
# 检查端口占用
lsof -i :11434

# 查看日志
tail -f /tmp/ollama-optimized.log
```

### 模型加载超时

```bash
# 增加超时时间
export OLLAMA_LOAD_TIMEOUT=15m0s

# 清理缓存
ollama gc
```

### 显存不足

```bash
# 卸载模型
curl -X POST http://localhost:11434/api/generate -d '{"model":"phi3:mini","keep_alive":0}'

# 使用更小的上下文
curl -X POST http://localhost:11434/api/generate -d '{"model":"phi3:mini","prompt":"Hi","options":{"num_ctx":4096}}'
```

### 网络连接失败

```bash
# 检查防火墙
sudo pfctl -s rules | grep 11434

# 测试连接
ping 192.168.3.22
telnet 192.168.3.22 11434
```

---

## 📞 获取帮助

- 查看完整指南: `cat /Users/yanyu/Family-π³/scripts/iMac-M4-Optimization-Guide.md`
- 查看分析报告: `cat /Users/yanyu/Family-π³/scripts/iMac-M4-Analysis.md`
- 运行优化工具: `bash /Users/yanyu/Family-π³/scripts/ollama-optimization.sh`

---

<div align="center">

**YYC³ AI Family**
*言启象限 | 语枢未来*

</div>
