# Family-π³ 本地全功能启动指南

## 🚀 本地全功能启动指南

### 快速启动（推荐）

```bash
# 1. 进入项目目录
cd /Users/yanyu/YYC3-Mac-Max/Family-π³

# 2. 安装依赖（首次）
pnpm install

# 3. 启动开发服务器
pnpm dev
```

访问：**<http://localhost:3113>**

---

### 全功能模式启动

```bash
# 方式 A：一键启动（前端 + 后端）
pnpm start:all

# 方式 B：分别启动
pnpm dev          # 前端 (端口 3113)
pnpm start:backend # 后端 API (端口 3113)
```

---

### 🔧 可选服务启动

| 服务 | 命令 | 端口 | 用途 |
|------|------|------|------|
| **Ollama** | `ollama serve` | 11434 | 本地 LLM 推理 |
| **PostgreSQL** | `./database/migrate.sh migrate` | 5433 | 数据持久化 |
| **Redis** | `redis-server` | 6379 | 缓存服务 |

---

### 📊 功能矩阵

| 功能 | 无服务 | 仅前端 | 全功能 |
|------|--------|--------|--------|
| UI 界面 | ✅ | ✅ | ✅ |
| AI 对话（云端） | ✅ | ✅ | ✅ |
| AI 对话（本地 Ollama） | ❌ | ❌ | ✅ |
| 数据持久化 | ✅ | ✅ | ✅ |
| 实时指标模拟 | ✅ | ✅ | ✅ |
| WebSocket 实时通信 | ❌ | ✅ | ✅ |
| 数据库存储 | ❌ | ❌ | ✅ |

---

### 💡 推荐配置

**日常开发**：

```bash
pnpm dev  # 仅前端，localStorage 持久化
```

**完整体验**：

```bash
# 终端 1：启动 Ollama
ollama serve

# 终端 2：启动项目
pnpm start:all
```

---

### ⚙️ AI 模型配置

在 UI 设置页面配置 API Key（设置 → AI 模型配置）：

| Provider | 获取地址 |
|----------|----------|
| OpenAI | <https://platform.openai.com/api-keys> |
| Anthropic | <https://console.anthropic.com/> |
| DeepSeek | <https://platform.deepseek.com/> |
| 智谱 | <https://open.bigmodel.cn/> |
| Google | <https://aistudio.google.com/> |
| Groq | <https://console.groq.com/> |

本地模型无需配置，确保 Ollama 运行即可。
