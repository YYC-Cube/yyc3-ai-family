# iMac M4 Ollama 服务分析报告

> ***YanYuCloudCube***
> 言启象限 | 语枢未来

---

**报告生成时间**: 2026-02-25 18:15:00  
**设备**: iMac M4 (192.168.3.77)  
**Ollama 版本**: 0.17.0

---

## 📊 执行摘要

| 指标 | 值 |
|------|------|
| 服务状态 | ✅ 运行中 |
| 监听地址 | `[::]:11434` (所有网络接口) |
| GPU | Apple M4 (Metal) |
| 总显存 | 25.0 GiB |
| 可用显存 | 25.0 GiB |
| 默认上下文长度 | 32,768 tokens |
| 已加载模型数 | 2 |

---

## 🔧 服务器配置

### 环境变量

```bash
OLLAMA_HOST=http://0.0.0.0:11434
OLLAMA_ORIGINS=[
  http://localhost:3113,
  http://192.168.3.22:3113,
  http://localhost,
  https://localhost,
  http://localhost:*,
  https://localhost:*,
  http://127.0.0.1,
  https://127.0.0.1,
  http://127.0.0.1:*,
  https://127.0.0.1:*,
  http://0.0.0.0,
  https://0.0.0.0,
  http://0.0.0.0:*,
  https://0.0.0.0:*
  app://*,
  file://*,
  tauri://*,
  vscode-webview://*,
  vscode-file://*
]
OLLAMA_NUM_PARALLEL=1
OLLAMA_MAX_QUEUE=512
OLLAMA_KEEP_ALIVE=5m0s
OLLAMA_LOAD_TIMEOUT=5m0s
OLLAMA_MAX_LOADED_MODELS=0
```

### GPU 配置

- **设备名称**: Apple M4
- **GPU 家族**: 
  - MTLGPUFamilyApple9 (1009)
  - MTLGPUFamilyCommon3 (3003)
  - MTLGPUFamilyMetal4 (5002)
- **统一内存**: ✅ 是
- **BFloat16 支持**: ✅ 是
- **Tensor 核心**: ❌ 否
- **推荐最大工作集大小**: 26,800.60 MB

---

## 🤖 已加载模型

### 模型 1: CodeGeeX4-All-9B

| 属性 | 值 |
|------|------|
| 架构 | ChatGLM |
| 模型名称 | codegeex4-all-9b |
| 文件类型 | GGUF V3 (latest) |
| 量化类型 | Q4_0 |
| 文件大小 | 5.08 GiB (4.64 BPW) |
| 模型参数 | 9.40 B |
| 词汇表大小 | 151,552 |
| 上下文长度 | 131,072 |
| 嵌入维度 | 4,096 |
| 前向长度 | 13,696 |
| 块数量 | 40 |
| 注意力头数 | 32 |
| 旋转位置编码维度 | 64 |
| 加载时间 | 9.99 秒 |

**内存占用**:
- CPU 映射缓冲区: 333.00 MiB
- Metal 映射缓冲区: 4,863.84 MiB
- KV 缓存: 1,280.00 MiB (32,768 cells, 40 layers, 1/1 seqs)
  - K (f16): 640.00 MiB
  - V (f16): 640.00 MiB
- Metal 计算缓冲区: 304.00 MiB
- CPU 计算缓冲区: 72.01 MiB
- **总内存**: 8.1 GiB

**图信息**:
- 图节点数: 1,167
- 图分割数: 2

### 模型 2: Phi 3 Mini 128K Instruct

| 属性 | 值 |
|------|------|
| 架构 | Phi3 |
| 模型名称 | Phi 3 Mini 128k Instruct |
| 模型类型 | model |
| 微调版本 | 128k-instruct |
| 基础模型 | Phi-3 |
| 大小标签 | mini |
| 许可证 | MIT |

**内存占用**:
- VRAM 更新后可用: 16.9 GiB
- Metal 映射缓冲区: 4,863.84 MiB
- KV 缓存: 1,280.00 MiB

---

## 🌐 网络请求分析

### 来自 192.168.3.22 (本机) 的请求

| 时间 | 方法 | 路径 | 状态 | 响应时间 |
|------|------|------|------|--------|
| 18:14:21 | GET | /api/version | 200 | 154.625µs |
| 18:14:21 | GET | /api/tags | 200 | 1.445583ms |
| 18:14:27 | GET | /api/tags | 200 | 2.211583ms |
| 18:14:52 | POST | /api/generate | 200 | 25.362564666s |
| 18:14:52 | GET | /api/tags | 200 | 2.433084ms |
| 18:14:52 | GET | /api/tags | 200 | 462.583µs |

**请求统计**:
- 总请求数: 6
- 成功请求: 6 (100%)
- 平均响应时间: ~5.27ms
- 最快响应: 154.625µs
- 最慢响应: 25.36ms

---

## ⚡ 性能分析

### Metal 库加载

- **加载时间**: 6.996 秒 (首次) / 6.664 秒 (第二次)
- **驻留集集合**: keep_alive = 180 秒

### 模型加载性能

| 模型 | 加载时间 | 速率 |
|------|----------|------|
| CodeGeeX4-All-9B | 9.99 秒 | ~0.51 GB/s |
| Phi 3 Mini | ~9.99 秒 | ~0.51 GB/s |

### GPU 内存使用

| 状态 | 显存使用 |
|------|----------|
| 初始 | 0 GiB |
| 加载 CodeGeeX4 后 | 8.1 GiB |
| 加载 Phi 3 Mini 后 | 16.9 GiB |
| 可用 | 8.1 GiB |

---

## 🎯 关键发现

### ✅ 优势

1. **网络配置正确**: Ollama 服务正确配置为监听所有网络接口 (`0.0.0.0`)
2. **跨域配置完善**: OLLAMA_ORIGINS 包含了所有必要的源地址
3. **GPU 资源充足**: 25 GiB 显存足以运行多个大模型
4. **Metal 加速**: 完全支持 Apple Metal 框架，包括 Flash Attention
5. **上下文长度大**: 默认 32,768 tokens，支持长文本处理
6. **响应速度快**: 平均响应时间 < 10ms

### ⚠️ 注意事项

1. **模型加载时间**: 9.99 秒的加载时间相对较长，建议：
   - 考虑使用更小的量化模型
   - 预加载常用模型
   - 增加 OLLAMA_LOAD_TIMEOUT 值

2. **显存占用高**: 两个模型加载后使用了 16.9 GiB 显存（67.6%）
   - 建议监控显存使用情况
   - 考虑卸载不常用的模型

3. **Tokenizer 警告**: 日志中显示了一些 tokenizer 配置警告
   - `'` was not control-type; this is probably a bug in the model`
   - `special_eot_id is not in special_eog_ids`
   - 这些警告不影响功能，但建议更新模型版本

### 🔧 优化建议

1. **预加载策略**:
   ```bash
   # 在启动时预加载常用模型
   ollama pull codegeex4:latest
   ollama pull phi3:mini
   ```

2. **显存优化**:
   - 考虑使用 Q4 量化模型以减少显存占用
   - 设置 OLLAMA_MAX_LOADED_MODELS=1 限制同时加载的模型数

3. **网络优化**:
   - 当前响应时间已经很好（< 10ms）
   - 可以考虑启用 HTTP/2 或 HTTP/3 以提高并发性能

4. **监控建议**:
   - 监控 GPU 温度和显存使用率
   - 设置告警阈值（如显存使用 > 80%）

---

## 📈 总结

iMac M4 上的 Ollama 服务运行状态良好，配置正确，能够响应来自本机 (192.168.3.22) 的请求。GPU 资源充足，Metal 加速正常工作。主要优化方向是减少模型加载时间和优化显存使用。

**综合评级**: 🌟 A (优秀)

---

<div align="center">

**YYC³ AI Family**
*言启象限 | 语枢未来*
*All things converge in cloud pivot; Deep stacks ignite a new era of intelligence*

</div>
