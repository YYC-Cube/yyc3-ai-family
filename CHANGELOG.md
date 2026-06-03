# 变更日志 · Changelog

> **YanYuCloudCube™** | **言启象限 · 语枢未来**
>
> *万象归元于云枢 | 深栈智启新纪元*

---

所有显著变更将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [0.35.0] - 2026-05-26

### 🌟 新增

- **三层存储架构**
  - `StorageOrchestrator` 智能分层路由（L1 localStorage → L2 IndexedDB → L3 NAS SQLite）
  - 自动降级：上层不可用时自动切换到下层
- **CrossTab BroadcastChannel 同步**
  - 多标签页实时存储变更感知
  - 域路由消息，各层按需响应
- **CRDT 冲突合并原语**
  - LWW Register 时间戳决胜
  - `mergeRecordArrays` 数组级无冲突合并
  - 集成 `StorageOrchestrator.syncUpstream()` 防 NAS 同步冲突
- **CacheManager TTL 缓存层**
  - IndexedDB 读取 30s TTL 缓存
  - write() 自动失效缓存
  - 命中率统计
- **`migrate-storage.ts` 迁移工具**
  - `migrateKey` / `migrateKeyAsArray` / `scanLegacyKeys` / `batchMigrate`
- **`BrandLogo` 统一品牌组件**
  - 支持上传图片 / gradient SVG / 自定义文字三种模式
  - 三种尺寸（sm / md / lg）
  - 自动监听品牌配置热更新
- **Grace 创想·灵韵** — 第八位 AI 智能体（内容创作与创意生成）

### 🔧 改进

- **纯前端一体化重构**：删除 `backend/`、`src/server/`、`deploy/`、`docker-compose.yml`
- 删除 Express/PostgreSQL 后端依赖和 14 个后端脚本命令
- 重写 `api.ts`：从 REST API 客户端 → 纯前端 localStorage 持久化层
- `packages/bigmodel-sdk` 独立管理，不耦合主项目
- Vite 端口从 3133 改为 3003
- `env.d.ts` 精简为仅 `vite/client` 引用（移除所有 `declare module` 阴影声明）

### 🐛 修复

- 修复 `Button`/`Badge` 组件 `variant`/`size` 类型丢失（class-variance-authority 链断裂）
- 修复 `ProjectsView`/`ArtifactsView`/`ArtifactsPanel` `react-resizable-panels` 导入崩溃
- 修复 `storage-encryption.ts` `Uint8Array` → `BufferSource` TS 5.7+ 兼容
- 修复 `StorageDashboard.tsx` 7 处 `no-nested-ternary` 警告
- 修复 `ArtifactsPanel.tsx` CSS 重复 `duration` 冲突
- 排除 `e2e/` 和 `src/lib/__tests__/` 从 tsconfig（独立测试项目）

### 🏗️ 架构变更

```
旧: SPA + Express 后端 + PostgreSQL
新: 纯前端 SPA，三层存储：
    L1 localStorage → L2 IndexedDB → L3 NAS SQLite
    辅助层: BroadcastChannel + CRDT + CacheManager
```

---

## [0.34.0] - 2026-04-25

### 🌟 新增

- PWA 支持（离线缓存 + 可安装）
- 语音输入（Web Speech API）
- MCP 协议集成（6 个预设服务器）
- DAG 工作流编排器
- Docker 容器状态监控
- 品牌自定义（appName / tagline / logo 上传）
- 290+ E2E 测试用例

### 🔧 改进

- 迁移至 Vite 6 + Tailwind v4
- 优化 ConsoleView 导航性能
- 更新 Zustand 到 v5
- 完善五级导航系统

### 🐛 修复

- Figma asset 导入崩溃（改为内联 SVG）
- 多个 React.lazy 懒加载边界情况

---

## [0.33.0] - 2026-04-01

### 🌟 新增

- 七大 AI 智能体协作系统
- 九层架构视图可视化
- 五级导航系统 L1-L5
- DevOps 运维中心

### 🔧 改进

- 重写 Sidebar 为 hover-sensing 自适应
- 完善 SettingsModal 品牌配置界面

---

## [0.32.0] - 2026-03-15

### 🌟 新增

- 8 个 LLM 提供商集成（OpenAI、Anthropic、DeepSeek、智谱等）
- Ollama 本地模型管理
- WebSocket 实时指标流

### 🔧 改进

- 重构 AgentChatInterface 状态管理
- 优化 ClusterTopology 拓扑图渲染

---

## [0.31.0] - 2026-03-01

### 🌟 新增

- 初始化 Zustand store 统一状态管理
- 多 Tab ConsoleView 视图系统
- 30+ Console 视图组件

### 🔧 改进

- 从 Context API 迁移到 Zustand
- 重写 chat 流式响应

---

## [0.30.0] - 2026-02-15

### 🌟 新增

- 首个可运行版本
- React + Vite + Tailwind 基础框架
- shadcn/ui 40+ 组件集成
- 基础聊天界面

---

## 版本路线图

| 版本 | 预计 | 主题 |
|------|------|------|
| 0.36.0 | 2026-06 | 性能优化 + 测试覆盖提升 |
| 0.37.0 | 2026-07 | MCP 扩展生态 + 插件市场 |
| 0.38.0 | 2026-08 | 国际化完整 + 主题系统 |
| 1.0.0 | 2026-09 | 正式发布 + API 稳定 |

---

> **YanYuCloudCube™** | **言启象限 · 语枢未来**
>
> *万象归元于云枢 | 深栈智启新纪元*
>
> **Words Initiate Quadrants, Language Serves as Core for Future**
