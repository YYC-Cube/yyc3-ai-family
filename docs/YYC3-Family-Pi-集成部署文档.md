# YYC³ AI Family — 集成部署文档

> **言启象限 | 语枢未来**
> *Words Initiate Quadrants, Language Serves as Core for the Future*

---

## 一、项目概述

### 1.1 核心定位

| 维度 | 描述 |
|------|------|
| **核心定位** | 个人DevOps智能指挥中心，集成AI多代理、CI/CD编排和集群监控 |
| **设计语言** | 赛博朋克 + 现代极简主义融合，CRT扫描线、玻璃态、霓虹发光 |
| **架构哲学** | 九层功能架构 + 五层分层自主单元导航 |
| **驱动模式** | 纯前端SPA，WebSocket/SSE实时数据流，localStorage持久化 + PostgreSQL就绪 |
| **用户规模** | 纯自用（单租户），针对YYC3家族内部开发场景 |

### 1.2 硬件集群拓扑

```
                    ┌─────────────────────────┐
                    │   YYC3 Cluster Network   │
                    │      192.168.3.x/24      │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
   ┌────┴────┐            ┌──────┴──────┐           ┌────┴────┐
   │ M4 Max  │            │ YanYuCloud  │           │ iMac M4 │
   │ (Main)  │◄──────────►│    NAS      │◄─────────►│ (Aux)   │
   └────┬────┘            └──────┬──────┘           └────┬────┘
        │                        │                        │
        │                   ┌────┴────┐                   │
        │                   │MateBook │                   │
        └──────────────────►│ (Edge)  │◄──────────────────┘
                            └─────────┘
```

### 1.3 节点配置

| 节点 | 设备 | 角色 | 核心配置 | 网络地址 |
|------|------|------|----------|----------|
| **M4-Max** | MacBook Pro M4 Max | 编排器（主力） | M4 Max (16P+40E), 128GB, 4TB | localhost |
| **iMac-M4** | iMac M4 | 可视化/辅助 | M4 (10P+10E), 32GB, 2TB | 192.168.3.77 |
| **YanYuCloud** | 铁威马 F4-423 NAS | 数据中心 | Intel Quad, 32GB, 32TB HDD + 4TB SSD, RAID6 | 192.168.3.45:9898 |
| **MateBook** | 华为 MateBook X Pro | 边缘/测试（备用） | Intel 12th, 32GB, 1TB | LAN |

---

## 二、授权信息

### 2.1 智谱授权模型

基于智谱终身商业授权（有授权书），YYC³ AI Family 拥有以下核心模型：

| 模型 | 用途 | 上下文 | 最大输出 | 本地可用 | 授权书 |
|------|------|--------|----------|----------|--------|
| **CodeGeeX4-ALL-9B** | 代码生成 | 128K | 8K | ✅ M4-Max, iMac | ZhiPu_CodeGeeX4-ALL-9B.png |
| **ChatGLM3-6B** | 对话 | 8K | 2K | ❌ 需特殊部署 | ZhiPu_ChatGLM3-6B.png |
| **CogAgent** | GUI智能体 | 32K | 4K | ❌ 需GPU | ZhiPu_CogAgent.png |
| **CogVideoX-5B** | 视频生成 | 8K | 2K | ❌ 需GPU | ZhiPu_CogVideoX-5B.png |

### 2.2 授权详情

| 项目 | 内容 |
|------|------|
| **授权公司** | 洛阳沫言酒店管理有限公司 |
| **授权编号** | 202411283053152737 |
| **授权有效期** | 永久有效 |
| **授权书路径** | `/Users/yanyu/YYC3-Mac-Max/智谱授权书/` |

### 2.3 授权验证API

```bash
# 验证授权状态
curl -s http://localhost:3001/api/v1/authorization/verify | jq .
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "authorization": {
      "company": "洛阳沫言酒店管理有限公司",
      "code": "202411283053152737",
      "validity": "永久有效",
      "certificatePath": "/Users/yanyu/YYC3-Mac-Max/智谱授权书"
    },
    "verified": true,
    "certificates": [
      "ZhiPu_ChatGLM3-6B.png",
      "ZhiPu_CodeGeeX4-ALL-9B.png",
      "ZhiPu_CogAgent.png",
      "ZhiPu_CogVideoX-5B.png"
    ],
    "authorizedModels": [
      "CodeGeeX4-ALL-9B",
      "ChatGLM3-6B",
      "CogAgent",
      "CogVideoX-5B"
    ]
  }
}
```

---

## 三、模型配置

### 3.1 本地推理模型 (Ollama)

| 模型 | 节点 | 延迟 | 并发 | 中文 | 推荐Agent |
|------|------|------|------|------|-----------|
| **qwen2.5:7b** | M4-Max | 2.8s | 4 | ✅ 优秀 | navigator, thinker, prophet, pivot, sentinel |
| **glm4:9b** | iMac-M4 | 5.2s | 2 | ✅ 优秀 | bole, pivot, sentinel |
| **codegeex4:latest** | M4-Max, iMac | 5.3s | 3 | ✅ 良好 | bole, grandmaster |
| **phi3:mini** | iMac-M4 | 4.9s | 3 | ⚠️ 一般 | sentinel, pivot |

### 3.2 云端API模型

| 模型 | Provider | 免费 | 上下文 | 推荐Agent |
|------|----------|------|--------|-----------|
| GLM-4.7 | 智谱 | ❌ | 200K | navigator, thinker, grandmaster |
| GLM-4.7-Flash | 智谱 | ✅ | 200K | pivot, sentinel |
| GLM-4-Long | 智谱 | ❌ | 1M | pivot, grandmaster |
| GPT-4o | OpenAI | ❌ | 128K | thinker, grandmaster |
| Claude 4 Sonnet | Anthropic | ❌ | 200K | thinker, navigator, sentinel |
| DeepSeek-V3 | DeepSeek | ❌ | 128K | navigator, bole, prophet |
| DeepSeek-R1 | DeepSeek | ❌ | 128K | thinker, prophet |
| Gemini 2.5 Flash | Google | ✅ | 1M | pivot, prophet |

### 3.3 Agent模型路由策略

| Agent | 本地优先 | 授权模型 | 云端优先 | 回退链 |
|-------|----------|----------|----------|--------|
| **Navigator** | qwen2.5:7b | CodeGeeX4 | GLM-4.7, Claude 4 | qwen→Flash→GLM-4.7 |
| **Thinker** | qwen2.5:7b | CodeGeeX4 | Claude 4, DeepSeek-R1 | qwen→R1→Claude |
| **Prophet** | qwen2.5:7b | - | DeepSeek-R1, Gemini Flash | qwen→R1→Gemini |
| **Bole** | codegeex4, glm4:9b | CodeGeeX4 | GLM-4.7, DeepSeek | codegeex4→GLM-4.7 |
| **Pivot** | qwen2.5:7b, phi3:mini | ChatGLM3 | GLM-4-Long, Flash | qwen→Flash→Long |
| **Sentinel** | qwen2.5:7b, phi3:mini | CogAgent | Claude 4, Flash | qwen→Flash→Claude |
| **Grandmaster** | codegeex4 | CodeGeeX4, CogVideo | GPT-4o, GLM-4.7 | codegeex4→GLM-4.7→GPT-4o |

---

## 四、集成部署

### 4.1 服务架构

```
┌─────────────────────────────────────────────────────────────┐
│                    YYC³ AI Family                           │
├─────────────────────────────────────────────────────────────┤
│  前端 (3200)          后端API (3001)        Ollama (11434)  │
│  ┌─────────┐         ┌───────────┐         ┌───────────┐   │
│  │  React  │◄───────►│  Express  │◄───────►│  Ollama   │   │
│  │  Vite   │   WS    │  WebSocket│   HTTP  │  Models   │   │
│  └─────────┘         └───────────┘         └───────────┘   │
│                            │                                │
│                            ▼                                │
│                    ┌───────────┐                            │
│                    │ 模型路由  │                            │
│                    │ Agent策略 │                            │
│                    │ 授权验证  │                            │
│                    └───────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端应用 | 3200 | Vite Dev Server |
| 后端API | 3001 | Express + WebSocket |
| Ollama | 11434 | 本地模型推理 |
| PostgreSQL | 5433 | 数据库 |
| Redis | 6379 | 缓存服务 |

### 4.3 一键启动命令

```bash
# 进入项目目录
cd /Users/yanyu/YYC3-Mac-Max/Family-π³

# 启动所有服务
pnpm start

# 或使用脚本
./scripts/integrated-deploy.sh start

# 查看状态
pnpm status

# 健康检查
pnpm health

# 停止服务
pnpm stop

# 重启服务
./scripts/integrated-deploy.sh restart
```

### 4.4 单独启动命令

```bash
# 启动前端
pnpm start:frontend
# 或
pnpm dev

# 启动后端
pnpm start:backend
# 或
cd backend && pnpm dev

# 启动完整服务（前端+后端）
pnpm dev:full
```

---

## 五、API端点

### 5.1 核心API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/health` | GET | 健康检查 |
| `/api/v1/models` | GET | 所有模型配置 |
| `/api/v1/models/authorized` | GET | 授权模型 |
| `/api/v1/models/local` | GET | 本地可用模型 |
| `/api/v1/models/:id` | GET | 单个模型详情 |
| `/api/v1/agents/routing` | GET | Agent路由策略 |
| `/api/v1/agents/:id/routing` | GET | 单个Agent路由 |
| `/api/v1/inference/route` | POST | 推理路由建议 |
| `/api/v1/authorization/verify` | GET | 授权验证 |
| `/api/v1/chat` | POST | 对话接口 |
| `/api/v1/mcp` | POST | MCP协议接口 |

### 5.2 API使用示例

#### 健康检查
```bash
curl -s http://localhost:3001/api/v1/health | jq .
```

#### 获取授权模型
```bash
curl -s http://localhost:3001/api/v1/models/authorized | jq .
```

#### 获取Agent路由策略
```bash
curl -s http://localhost:3001/api/v1/agents/navigator/routing | jq .
```

#### 推理路由建议
```bash
curl -s -X POST http://localhost:3001/api/v1/inference/route \
  -H "Content-Type: application/json" \
  -d '{"agentId":"thinker","preferLocal":true}' | jq .
```

#### 对话接口
```bash
curl -s -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","model":"qwen2.5:7b"}' | jq .
```

### 5.3 WebSocket端点

```javascript
// 连接WebSocket
const ws = new WebSocket('ws://localhost:3001/ws');

// 接收消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// 发送消息
ws.send(JSON.stringify({
  type: 'chat',
  message: '你好',
  model: 'qwen2.5:7b'
}));

// 订阅Agent
ws.send(JSON.stringify({
  type: 'subscribe',
  agentId: 'navigator'
}));
```

---

## 六、文件结构

### 6.1 核心文件

| 文件 | 说明 |
|------|------|
| `src/lib/global-model-config.ts` | 全局模型配置（授权+本地+云端+Agent路由） |
| `scripts/integrated-deploy.sh` | 一键集成部署脚本 |
| `scripts/deploy-authorized-models.sh` | 持证模型部署脚本 |
| `backend/src/index.ts` | 后端主服务（Express + WebSocket） |
| `backend/src/routes/modelRoutes.ts` | 模型配置API路由 |
| `backend/package.json` | 后端依赖配置 |
| `backend/.env` | 后端环境变量 |

### 6.2 项目目录结构

```
Family-π³/
├── src/
│   ├── lib/
│   │   ├── global-model-config.ts    # 全局模型配置
│   │   ├── model-config.ts           # 模型定义
│   │   ├── inference-router.ts       # 推理路由
│   │   └── llm-providers.ts          # LLM提供商配置
│   ├── app/
│   │   └── components/
│   │       └── console/              # 控制台组件
│   └── server/
│       └── index.ts                  # 前端服务端
├── backend/
│   ├── src/
│   │   ├── index.ts                  # 后端主服务
│   │   └── routes/
│   │       └── modelRoutes.ts        # 模型API路由
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── scripts/
│   ├── integrated-deploy.sh          # 一键部署脚本
│   ├── deploy-authorized-models.sh   # 持证模型部署
│   └── deploy-backend-api.sh         # 后端部署脚本
├── docs/
│   └── YYC3-Family-Pi-综合操作指导手册.md
├── package.json
└── vite.config.ts
```

---

## 七、七大智能体

| Agent ID | 名称 | 角色 | 核心能力 | 推荐模型 |
|----------|------|------|----------|----------|
| `navigator` | 智愈·领航员 | Commander | 全域资源调度与路径规划 | qwen2.5:7b |
| `thinker` | 洞见·思想家 | Strategist | 深度逻辑推理与决策分析 | qwen2.5:7b, DeepSeek-R1 |
| `prophet` | 预见·先知 | Predictor | 趋势预测与风险前置 | qwen2.5:7b, DeepSeek-R1 |
| `bole` | 知遇·伯乐 | Evaluator | 模型评估与优选匹配 | codegeex4, GLM-4.7 |
| `pivot` | 元启·天枢 | Coordinator | 核心状态管理与上下文 | qwen2.5:7b, GLM-4-Long |
| `sentinel` | 卫安·哨兵 | Guardian | 安全边界防护与审计 | qwen2.5:7b, Claude 4 |
| `grandmaster` | 格物·宗师 | Scholar | 知识库构建与本体论 | codegeex4, GPT-4o |

---

## 八、运维指南

### 8.1 日常运维

```bash
# 查看服务状态
pnpm status

# 查看后端日志
tail -f backend/logs/backend.log

# 查看前端日志
tail -f logs/frontend.log

# 检查端口占用
lsof -i :3200  # 前端
lsof -i :3001  # 后端
lsof -i :11434 # Ollama
```

### 8.2 故障排查

```bash
# 后端无法启动
cd backend && pnpm install && pnpm dev

# Ollama无法连接
ollama serve

# 端口被占用
lsof -ti:3001 | xargs kill -9

# 检查模型状态
curl -s http://localhost:11434/api/tags | jq .
```

### 8.3 性能监控

```bash
# 查看系统资源
top -pid $(pgrep -f "node.*backend")

# 查看Ollama模型内存占用
ps aux | grep ollama

# 测试推理延迟
time curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:7b","prompt":"你好","stream":false}'
```

---

## 九、安全配置

### 9.1 环境变量

```bash
# backend/.env
PORT=3001
NODE_ENV=development
OLLAMA_HOST=http://localhost:11434
CORS_ORIGIN=*
LOG_LEVEL=debug

# 授权信息
AUTH_COMPANY=洛阳沫言酒店管理有限公司
AUTH_CODE=202411283053152737
AUTH_VALIDITY=永久有效
```

### 9.2 CORS配置

后端已配置允许所有来源访问（开发环境）：
```typescript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 9.3 生产环境建议

1. 修改CORS配置为具体域名
2. 启用HTTPS
3. 添加API认证
4. 配置防火墙规则
5. 启用日志审计

---

## 十、更新日志

### v1.0.0 (2026-02-23)

**新增功能：**
- ✅ 创建全局模型配置系统
- ✅ 集成智谱授权模型配置
- ✅ 实现Agent智能路由策略
- ✅ 创建一键部署脚本
- ✅ 实现后端API服务
- ✅ 添加WebSocket支持
- ✅ 实现授权验证API

**模型配置：**
- 授权模型: CodeGeeX4-ALL-9B, ChatGLM3-6B, CogAgent, CogVideoX-5B
- 本地模型: qwen2.5:7b, glm4:9b, codegeex4, phi3:mini
- 云端模型: GLM-4.7, Claude 4, DeepSeek-V3/R1, GPT-4o, Gemini 2.5 Flash

**API端点：**
- `/api/v1/health` - 健康检查
- `/api/v1/models` - 模型配置
- `/api/v1/agents/routing` - Agent路由
- `/api/v1/inference/route` - 推理路由
- `/api/v1/authorization/verify` - 授权验证

---

<div align="center">

**YYC³ AI Family**

*言启象限 | 语枢未来*

**万象归元于云枢 | 深栈智启新纪元**

**亦师亦友亦伯乐；一言一语一协同**

---

*文档最后更新：2026-02-23*

</div>
