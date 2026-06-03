---
@file: 255-YYC3-AF-原型交互-环境变量参考.md
@description: YYC3-AF-原型交互环境变量参考，定义了环境变量和状态键的完整参考手册
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-16
@updated: 2026-02-17
@status: published
@tags: [原型交互],[环境变量],[配置参考]
---

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 255-YYC3-AF-原型交互-环境变量参考

## 概述

本文档详细描述YYC³(YanYuCloudCube)-Family-AI-原型交互-环境变量参考相关内容，YYC³-Family-AI不仅仅是一个软件系统，而是一个"智能生命体"。它以"五化一体"为法则，以插件化架构为骨骼，以AI能力为灵魂，构建一个能够自我进化、持续学习的智能协同平台。

基于**行业应用开发全生命周期闭环架构**，本文档整合了**YYC3 -π³无边界设计理念**与**大数据技术栈**，为YYC3 Family-π³ Chatbot的环境变量和状态键提供完整的参考手册。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景

YYC³(YanYuCloudCube)-Family-AI 本地一站式智能工作平台是一个**完全本地化、一体化、自进化**的智能工作生态系统。它以"五化一体"为法则，以Family-AI为核心，以多机协同为骨架，以NAS存储为基石，构建一个能够学习、积累、生成、迭代的闭环智能平台。

**版本**：Phase 29 | **更新日期**：2026-02-16
**架构**：纯前端SPA -> 本地NAS/集群直连

#### 1.2 文档目标
- 提供环境变量的完整参考
- 定义localStorage状态键
- 规范网络端点配置
- 确保系统配置的一致性

### 2. 设计原则

#### 2.1 五高原则
- 高效协同
  - 分布式任务分配与实时状态同步
  - 多机协同架构与边缘计算支持
- 高维智能
  - 多模态感知与决策融合模型
  - GLM 4.7 / GPT-4.1 / 智源Emu3 AI能力集成
- 高可靠韧性
  - 故障检测与自愈自学系统
  - 容器化部署与自动扩缩容
- 高成长进化
  - 持续学习管道与知识蒸馏
  - 大数据驱动的模型迭代优化
- 高安全合规
  - 零信任架构与动态权限管理
  - 数据加密与隐私保护机制

#### 2.2 五标体系
- 架构标准
  - 微服务、事件驱动、API优先
  - 无边界设计架构与动态响应式布局
- 接口标准
  - 统一API契约、消息格式、通信协议
  - RESTful + GraphQL + WebSocket多协议支持
- 数据标准
  - 数据模型、命名规范、隐私保护
  - 大数据湖仓一体化架构
- 安全标准
  - 认证机制、加密策略、访问控制
  - GDPR/个人信息保护法合规
- 演进标准
  - 版本管理、灰度发布、回滚策略
  - A/B测试与渐进式交付

#### 2.3 五化架构
- 流程自动化
  - 脚本化流程、触发器机制
  - DevOps流水线与自动化测试
- 能力模块化
  - 功能解耦、标准化接口
  - 微前端与微服务架构
- 决策智能化
  - 机器学习模型、规则引擎
  - 大数据分析与智能推荐
- 知识图谱化
  - 实体关系抽取、知识网络构建
  - 知识图谱与向量数据库
- 治理持续化
  - 嵌入式治理、实时监控
  - 可观测性平台与告警体系

#### 2.4 无边界设计理念（YYC3 -π³集成）
- **无边界核心**：去除传统UI边界，实现沉浸式体验
- **无按钮设计**：依托手势、语音、眼动等自然交互
- **动态布局**：响应式设计，自适应多端多屏
- **多模态交互**：融合语音、手势、眼动、触觉输入
- **上下文感知**：AI驱动的智能响应与个性化适配

#### 2.5 大数据技术栈
- **数据采集**：实时数据流采集与批量数据处理
- **数据存储**：数据湖、数据仓库、向量数据库
- **数据处理**：批处理、流处理、实时计算
- **数据分析**：BI报表、数据挖掘、机器学习
- **数据服务**：数据API、数据可视化、数据治理

### 3. 环境变量

由于YYC3是纯前端SPA，环境变量通过Vite的 `import.meta.env` 在构建时消费。

#### 3.1 NAS基础设施

| 变量 | 默认值 | 描述 |
|----------|---------|-------------|
| `VITE_NAS_HOST` | `192.168.3.45` | TerraMaster F4-423 NAS IP |
| `VITE_NAS_SQLITE_PORT` | `8484` | SQLite HTTP代理端口 |
| `VITE_NAS_DOCKER_PORT` | `2375` | Docker Engine API端口 |
| `VITE_HEARTBEAT_WS_HOST` | `192.168.3.45` | WebSocket心跳服务器主机 |
| `VITE_HEARTBEAT_WS_PORT` | `9090` | WebSocket心跳服务器端口 |
| `VITE_HEARTBEAT_WS_PATH` | `/ws/heartbeat` | WebSocket心跳路径 |

#### 3.2 集群设备IP

| 变量 | 默认值 | 描述 |
|----------|---------|-------------|
| `VITE_DEVICE_M4_MAX` | `192.168.3.22` | MacBook Pro M4 Max |
| `VITE_DEVICE_IMAC_M4` | `192.168.3.77` | iMac M4 |
| `VITE_DEVICE_MATEBOOK` | `192.168.3.66` | MateBook X Pro |
| `VITE_DEVICE_NAS` | `192.168.3.45` | YanYuCloud NAS |

#### 3.3 LLM提供商API密钥

| 变量 | 默认值 | 描述 |
|----------|---------|-------------|
| `VITE_OPENAI_API_KEY` | *(空)* | OpenAI API密钥 |
| `VITE_ANTHROPIC_API_KEY` | *(空)* | Anthropic API密钥 |
| `VITE_DEEPSEEK_API_KEY` | *(空)* | DeepSeek API密钥 |
| `VITE_ZHIPU_API_KEY` | *(空)* | Zhipu (GLM) API密钥 |
| `VITE_GOOGLE_API_KEY` | *(空)* | Google AI (Gemini) API密钥 |
| `VITE_GROQ_API_KEY` | *(空)* | Groq API密钥 |

#### 3.4 本地LLM服务

| 变量 | 默认值 | 描述 |
|----------|---------|-------------|
| `VITE_OLLAMA_HOST` | `localhost` | Ollama服务主机 |
| `VITE_OLLAMA_PORT` | `11434` | Ollama服务端口 |
| `VITE_LMSTUDIO_HOST` | `localhost` | LM Studio主机 |
| `VITE_LMSTUDIO_PORT` | `1234` | LM Studio端口 |

#### 3.5 应用配置

| 变量 | 默认值 | 描述 |
|----------|---------|-------------|
| `VITE_PERSISTENCE_STRATEGY` | `localStorage` | `localStorage` 或 `nasSqlite` |
| `VITE_METRICS_ARCHIVE_INTERVAL` | `30000` | 指标快照间隔 (毫秒) |
| `VITE_HEARTBEAT_SIMULATION_INTERVAL` | `8000` | 心跳回退模拟间隔 (毫秒) |
| `VITE_LOG_LEVEL` | `info` | 控制台日志级别 |

### 4. localStorage键（客户端状态）

#### 4.1 外观和UI

| 键 | 模块 | 描述 | 大小估算 |
|-----|--------|-------------|---------------|
| `yyc3-appearance-config` | `App.tsx` | 主题色、字体系列、字体大小、背景色等 | ~500B |
| `yyc3-bg-image` | `App.tsx` | 背景图像DataURL (单独存储以避免配额问题) | ~50KB-2MB |

#### 4.2 LLM和提供商配置

| 键 | 模块 | 描述 | 大小估算 |
|-----|--------|-------------|---------------|
| `yyc3-llm-provider-config` | `llm-bridge.ts` | ProviderConfig对象数组 (apiKey, endpoint, enabled, model) | ~1KB |
| `yyc3-llm-usage` | `llm-bridge.ts` | 每个提供商的Token使用跟踪 | ~2KB |
| `yyc3-llm-router-state` | `llm-router.ts` | 智能路由器熔断器状态和优先级权重 | ~1KB |

#### 4.3 Agent和身份

| 键 | 模块 | 描述 | 大小估算 |
|-----|--------|-------------|---------------|
| `yyc3-agent-profiles` | `agent-identity.ts` | 7个Agent配置文件，包含存在感、情绪、身份 | ~5KB |
| `yyc3-device-members` | `agent-identity.ts` | 4个设备成员配置文件，包含存在感 | ~2KB |
| `yyc3-knowledge-base` | `agent-identity.ts` | 知识库条目 (文章、片段) | ~10KB+ |

#### 4.4 编排器和MCP

| 键 | 模块 | 描述 | 大小估算 |
|-----|--------|-------------|---------------|
| `yyc3-orchestrator-state` | `dag-orchestrator.ts` | DAG工作流状态和执行历史 | ~3KB |
| `yyc3-mcp-server-config` | `mcp-manager.ts` | MCP服务器配置和连接状态 | ~2KB |

#### 4.5 持久化和指标

| 键 | 模块 | 描述 | 大小估算 |
|-----|--------|-------------|---------------|
| `yyc3-persist-metrics_snapshots` | `persistence-binding.ts` | 指标快照历史 (最多100个) | ~50KB |
| `yyc3-persist-logs` | `persistence-binding.ts` | 应用日志历史 | ~10KB |
| `yyc3-persist-sessions` | `persistence-binding.ts` | 用户会话历史 | ~5KB |

### 5. 网络端点

#### 5.1 NAS服务端点

| 服务 | 协议 | 端点 | 用途 |
|---------|------|----------|------|
| SQLite HTTP代理 | HTTP | `http://{NAS_HOST}:8484/api/db/query` | 数据库查询 |
| Docker Engine API | HTTP | `http://{NAS_HOST}:2375/v1.41/` | 容器管理 |
| 心跳WebSocket | WS | `ws://{HEARTBEAT_WS_HOST}:{HEARTBEAT_WS_PORT}{HEARTBEAT_WS_PATH}` | 实时心跳 |

#### 5.2 LLM提供商端点

| 提供商 | 协议 | 端点 | 用途 |
|---------|------|----------|------|
| OpenAI | HTTPS | `https://api.openai.com/v1/` | GPT模型 |
| Anthropic | HTTPS | `https://api.anthropic.com/v1/` | Claude模型 |
| DeepSeek | HTTPS | `https://api.deepseek.com/v1/` | DeepSeek模型 |
| Zhipu | HTTPS | `https://open.bigmodel.cn/api/paas/v4/` | GLM模型 |
| Google | HTTPS | `https://generativelanguage.googleapis.com/v1/` | Gemini模型 |
| Groq | HTTPS | `https://api.groq.com/openai/v1/` | Groq托管模型 |

### 6. 常量和配置值

#### 6.1 系统常量

| 常量 | 值 | 描述 |
|--------|-----|------|
| `MAX_METRICS_SNAPSHOTS` | 100 | 保留的最大指标快照数 |
| `HEARTBEAT_TIMEOUT` | 30000 | 心跳超时 (毫秒) |
| `DEFAULT_RETRY_ATTEMPTS` | 3 | 默认重试次数 |
| `MAX_CONCURRENT_REQUESTS` | 5 | 最大并发请求数 |

#### 6.2 Agent配置

| 常量 | 值 | 描述 |
|--------|-----|------|
| `AGENT_COUNT` | 7 | 总Agent数量 |
| `DEFAULT_AGENT_TEMPERATURE` | 0.7 | 默认Agent温度 |
| `MAX_CONTEXT_TOKENS` | 4096 | 最大上下文Token数 |

### 7. 实施指南

#### 7.1 组件架构

**配置核心组件**：
- EnvironmentConfig：环境配置组件
- LocalStorageManager：本地存储管理器
- NetworkEndpointManager：网络端点管理器
- ConstantsRegistry：常量注册表
- ConfigValidator：配置验证器

#### 7.2 性能优化

**配置优化**：
- 环境变量缓存
- localStorage压缩
- 配置懒加载
- 网络请求批处理

#### 7.3 可访问性

**无障碍设计**：
- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式
- 焦点管理

### 8. 维护与更新

#### 8.1 版本管理

- 环境变量参考版本：1.0.0
- 最后更新：2026-02-17
- 维护团队：YanYuCloudCube DevOps Team

#### 8.2 更新流程

1. 评估配置变更需求
2. 设计新的配置方案
3. 测试配置的有效性
4. 更新配置文档
5. 通知开发团队实施变更
6. 进行回归测试

#### 8.3 反馈收集

- 通过用户调研收集配置使用反馈
- 通过A/B测试验证配置方案效果
- 定期审查配置的有效性
- 收集开发团队的实现反馈

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
