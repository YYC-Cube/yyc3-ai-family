---
@file: 999-YYC3-Family-AI-原型交互-运维指南.md
@description: YYC3-Family-AI原型交互运维指南，定义了基础设施运维手册和操作规范
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-17
@updated: 2026-02-17
@status: published
@tags: [原型交互],[运维指南],[基础设施]
---

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 999-YYC3-Family-AI-原型交互-运维指南

## 概述

本文档详细描述YYC³(YanYuCloudCube)-Family-AI-原型交互-运维指南相关内容，YYC³-Family-AI不仅仅是一个软件系统，而是一个"智能生命体"。它以"五化一体"为法则，以插件化架构为骨骼，以AI能力为灵魂，构建一个能够自我进化、持续学习的智能协同平台。

基于**行业应用开发全生命周期闭环架构**，本文档整合了**YYC3 -π³无边界设计理念**与**大数据技术栈**，为YYC3 Family-π³ Chatbot的Phase 22基础设施运维提供完整的操作手册。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景

YYC³(YanYuCloudCube)-Family-AI 本地一站式智能工作平台是一个**完全本地化、一体化、自进化**的智能工作生态系统。它以"五化一体"为法则，以Family-AI为核心，以多机协同为骨架，以NAS存储为基石，构建一个能够学习、积累、生成、迭代的闭环智能平台。

**Phase**: 22 Infrastructure Operations Manual

#### 1.2 文档目标
- 提供环境设置指南
- 定义NAS自动诊断系统
- 规范指标历史仪表盘
- 指导远程Docker部署
- 确保系统稳定运行

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

### 3. 环境设置

#### 3.1 必需的环境变量

将 `.env.example` 复制为 `.env` 并配置：

```bash
cp .env.example .env
```

**关键变量**：
- `VITE_NAS_HOST` - NAS IP地址 (默认: `192.168.3.45`)
- `VITE_DOCKER_API_PORT` - Docker Engine API端口 (默认: `2375`)
- `VITE_SQLITE_PROXY_PORT` - SQLite HTTP代理端口 (默认: `8484`)
- `VITE_HEARTBEAT_WS_PORT` - 心跳WebSocket端口 (默认: `9090`)

#### 3.2 网络先决条件

确保从开发机器到以下服务的网络连接：

| 服务 | 主机 | 端口 | 协议 |
|---------|------|------|----------|
| NAS TOS Web UI | 192.168.3.45 | 9898 | HTTPS |
| Docker Engine API | 192.168.3.45 | 2375 | HTTP |
| SQLite HTTP Proxy | 192.168.3.45 | 8484 | HTTP |
| Heartbeat WebSocket | 192.168.3.45 | 9090 | WS |
| Ollama (M4 Max) | 192.168.3.22 | 11434 | HTTP |

### 4. NAS自动诊断系统 (Phase 22)

#### 4.1 概述

NAS自动诊断系统在Console仪表盘加载时自动运行。它检查以下内容：

1. **NAS SQLite HTTP代理** - 测试 `http://192.168.3.45:8484/api/db/query`
2. **Docker Engine API** - 测试 `http://192.168.3.45:2375/v1.41/_ping`
3. **心跳WebSocket** - 测试 `ws://192.168.3.45:9090/ws/heartbeat`
4. **设备集群** - Ping所有4个设备 (M4 Max, iMac, MateBook, NAS)

#### 4.2 结果解读

| 状态 | 含义 | 操作 |
|--------|---------|--------|
| HEALTHY | 所有7项检查通过 | 无需操作 |
| PARTIAL | 部分检查警告 | 非关键；部署缺失服务 |
| DEGRADED | 部分检查失败 | 核心服务可能离线 |
| CRITICAL | 大部分检查失败 | 网络问题或NAS离线 |

#### 4.3 手动重新扫描

点击诊断面板中的"重新扫描"按钮重新运行所有检查。

### 5. 指标历史仪表盘 (Phase 22)

#### 5.1 数据源

指标由 `persistence-binding.ts` 模块每30秒自动归档。归档存储在 `localStorage` 中的 `yyc3-persist-metrics_snapshots` 键下。

#### 5.2 滚动窗口

- 最多保留100个快照 (可在 `persistence-binding.ts` 中配置)
- 以30秒间隔，这覆盖约50分钟的历史记录

#### 5.3 支持的指标

- **CPU使用率** - 每节点CPU利用率百分比
- **内存使用率** - 每节点内存利用率百分比
- **磁盘使用率** - 每节点磁盘利用率百分比
- **网络I/O** - 每节点网络吞吐量 (Mbps)
- **温度** - 每节点系统温度

#### 5.4 图表控制

- **指标选择器** - 在CPU/内存/磁盘/网络/温度之间切换
- **时间范围** - 按30分钟/1小时/6小时/全部过滤
- **图表类型** - 在面积图和折线图之间切换
- **节点过滤器** - 在图表上启用/禁用单个节点
- **导出** - 将当前图表数据下载为JSON

### 6. 远程Docker部署 (Phase 22)

#### 6.1 先决条件

1. Docker Engine API必须在 `http://192.168.3.45:2375` 可访问
2. Docker API必须启用远程访问 (本地网络中无TLS)
3. 所需镜像应在NAS本地可用或可从Docker Hub拉取

#### 6.2 可用服务模板

| 服务 | 镜像 | 端口 | 描述 |
|---------|-------|------|-------------|
| Heartbeat WS | `node:20-alpine` | 9090 | 家庭存在心跳中继 |
| SQLite Proxy | `yyc3/sqlite-http:latest` | 8484 | SQLite over HTTP API |
| Redis Cache | `redis:7-alpine` | 6379 | 键值缓存 |

### 7. 实施指南

#### 7.1 组件架构

**运维核心组件**：
- EnvironmentSetup：环境设置组件
- NASDiagnostics：NAS诊断组件
- MetricsHistoryDashboard：指标历史仪表盘
- RemoteDockerDeployment：远程Docker部署组件
- HealthMonitor：健康监控组件

#### 7.2 性能优化

**运维优化**：
- 指标采集优化
- 诊断缓存
- 日志压缩
- 告警去重

#### 7.3 可访问性

**无障碍设计**：
- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式
- 焦点管理

### 8. 维护与更新

#### 8.1 版本管理

- 运维指南版本：1.0.0
- 最后更新：2026-02-17
- 维护团队：YanYuCloudCube DevOps Team

#### 8.2 更新流程

1. 评估运维变更需求
2. 设计新的运维方案
3. 测试运维的可访问性和性能
4. 更新运维文档
5. 通知开发团队实施变更
6. 进行回归测试

#### 8.3 反馈收集

- 通过用户调研收集运维使用反馈
- 通过A/B测试验证运维方案效果
- 定期审查运维的有效性
- 收集开发团队的实现反馈

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
