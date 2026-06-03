# 贡献指南 · Contributing to YYC³ AI-Family

> **YanYuCloudCube™** | **言启象限 · 语枢未来**
>
> *万象归元于云枢 | 深栈智启新纪元*

---

首先感谢您对 **YYC³ AI-Family** 的关注！本项目遵循 **"实用为基、效率为积"** 的理念，致力于构建一个人机协同的智能开发环境。

在贡献之前，请花几分钟阅读以下指南，这能帮助我们更好地协作。

## 📋 目录

1. [行为准则](#1-行为准则)
2. [贡献方式](#2-贡献方式)
3. [开发流程](#3-开发流程)
4. [代码规范](#4-代码规范)
5. [提交规范](#5-提交规范)
6. [PR 流程](#6-pr-流程)
7. [测试要求](#7-测试要求)
8. [文档要求](#8-文档要求)
9. [文化理念](#9-文化理念)

---

## 1. 行为准则

本项目采用 [贡献者公约](CODE_OF_CONDUCT.md) 作为行为准则。我们承诺维护一个开放、友好、包容的社区环境。

**核心原则**：
- **尊重**：尊重每一位贡献者，无论技能水平
- **包容**：欢迎不同背景的参与者
- **协作**：以建设性态度沟通
- **人机协同**：延续 AI-Family 文化，视 AI 为伙伴

## 2. 贡献方式

您可以通过以下方式贡献：

### 代码贡献
- 🐛 修复 Bug
- ✨ 添加新功能
- 🎨 优化 UI/UX
- ⚡ 提升性能
- 🔧 完善存储架构

### 非代码贡献
- 📝 完善文档
- 🐞 提交 Issue
- 💡 提出建议
- 🌐 翻译国际化
- 🧪 编写测试

## 3. 开发流程

```bash
# 1. Fork 仓库
# 2. 克隆到本地
git clone https://github.com/你的用户名/Family-π³.git
cd Family-π³

# 3. 安装依赖
pnpm install

# 4. 创建特性分支
git checkout -b feature/your-feature-name

# 5. 启动开发服务器
pnpm dev

# 6. 进行修改并测试
pnpm test            # 运行测试
pnpm lint            # 代码检查
pnpm type-check      # 类型检查

# 7. 提交并推送
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# 8. 创建 Pull Request
```

## 4. 代码规范

### 4.1 TypeScript

- 使用 **TypeScript 严格模式**
- 避免 `any` 类型，优先使用泛型
- 接口定义以 `I` 开头（可选），类型以 `Type` 结尾
- 使用 `type` 而非 `interface` 定义联合类型

```typescript
// ✅ 正确
interface UserConfig {
  name: string;
  age?: number;
}

type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

// ❌ 避免
const data: any = fetchData();
```

### 4.2 React 组件

- 使用函数组件 + Hooks
- 组件文件使用 `.tsx` 扩展名
- 纯 UI 组件放在 `src/app/components/ui/`
- 业务组件放在对应模块目录
- 使用 `cn()` 工具函数处理 className 合并

```typescript
// ✅ 正确
export function MyComponent({ className }: { className?: string }) {
  return <div className={cn('base-style', className)}>...</div>;
}
```

### 4.3 存储层规范

- L1（localStorage）：偏好设置、缓存键值、当前状态
- L2（IndexedDB）：Agent 对话、集群指标、系统日志
- L3（NAS SQLite）：持久化备份、历史数据

```typescript
// ✅ 通过 StorageOrchestrator 统一操作
import { getStorageOrchestrator } from '@/lib/storage/storage-orchestrator';
const orchestrator = getStorageOrchestrator();
await orchestrator.write('preferences', data);
```

### 4.4 样式规范

- 使用 Tailwind CSS 原子类
- 避免内联样式
- 颜色使用设计令牌变量（`primary`, `muted`, `border` 等）
- 赛博朋克风格保持一致

## 5. 提交规范

本项目采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>: <简短描述>

[可选的详细描述]

[可选的脚注]
```

### 类型说明

| 类型 | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: add CRDT merge strategy` |
| `fix` | 修复 Bug | `fix: resolve CrossTab sync race condition` |
| `docs` | 文档变更 | `docs: update storage architecture` |
| `style` | 样式变更 | `style: adjust glassmorphism opacity` |
| `refactor` | 重构 | `refactor: extract BrandLogo component` |
| `test` | 测试 | `test: add StorageOrchestrator tests` |
| `chore` | 构建/依赖 | `chore: upgrade dexie to 4.4.3` |
| `perf` | 性能优化 | `perf: add CacheManager TTL layer` |

### 示例

```
feat(storage): add CrossTab BroadcastChannel sync

- Add unified BroadcastChannel for multi-tab storage sync
- Domain-routed messages for selective rehydration
- Auto-degrade when BroadcastChannel unavailable

Closes #123
```

## 6. PR 流程

1. **确保 Fork 与上游同步**
2. **通过所有 CI 检查**（lint + type-check + test + build）
3. **PR 标题遵循提交规范**
4. **描述中说明变更内容和动机**
5. **关联相关 Issue**
6. **等待 Review**（通常 1-3 天）

### PR 检查清单

- [ ] 代码通过 `pnpm lint` 检查
- [ ] 代码通过 `pnpm type-check` 检查
- [ ] 测试通过 `pnpm test`
- [ ] 构建通过 `pnpm build`
- [ ] 新增功能有对应测试
- [ ] 文档已更新（如需要）
- [ ] 提交信息符合规范

## 7. 测试要求

### 测试层级

```
         /\
        /  \
       / E2E \     — 端到端测试
      /--------\
     /   集成    \  — 集成测试
    /------------\
   /    单元测试    \ — 单元测试
  /------------------\
```

### 测试规范

- 单元测试使用 Vitest
- E2E 测试使用 Playwright
- 测试文件放在 `src/lib/__tests__/` 目录
- 测试覆盖率目标：核心模块 > 85%

```typescript
// ✅ 正确
import { describe, it, expect } from 'vitest';
import { mergeRecordArrays } from '@/lib/storage/crdt';

describe('mergeRecordArrays', () => {
  it('should merge by id with timestamp win', () => {
    const result = mergeRecordArrays(local, remote);
    expect(result.merged).toHaveLength(3);
  });
});
```

## 8. 文档要求

### 文档结构

```
docs/
├── YYC3-AF-创新范式⭐️/     # 核心理念（五高五标五化、九层架构）
├── YYC3-AF-原始文档/        # 全生命周期文档
│   ├── YYC3-AF-架构设计/
│   ├── YYC3-AF-API文档/
│   ├── YYC3-AF-导航组件/
│   ├── YYC3-AF-数据库/
│   └── ...
└── ...
```

### 文档规范

- 使用 Markdown 格式
- 中英文均可，核心文档建议双语
- 代码示例使用 fenced code block 并标注语言
- 表格清晰，对齐规范
- 保留 `YanYuCloudCube™` 品牌标识

## 9. 文化理念

YYC³ AI-Family 不仅是一个软件项目，更是一种**人机协同的文化实践**。

### Family AI 核心价值

```
AI 不是工具，而是伙伴
八大智能体如同家庭成员：
  - Navigator 言启·千行  — 导航员
  - Thinker 语枢·万物     — 思考者
  - Prophet 预见·先知     — 预言家
  - Bole 知遇·伯乐       — 伯乐
  - Pivot 元启·天枢       — 决策者
  - Sentinel 智云·守护    — 守护者
  - Grandmaster 格物·宗师  — 宗师
  - Grace 创想·灵韵       — 创作者
```

### 五高五标五化

| 五高 | 五标 | 五化 |
|------|------|------|
| 高可用性 | 标准化接口 | 自动化 |
| 高性能 | 标准化数据 | 智能化 |
| 高安全性 | 标准化流程 | 可视化 |
| 高可扩展性 | 标准化组件 | 容器化 |
| 高智能化 | 标准化文档 | 生态化 |

---

## 开源协议

通过贡献代码，您同意您的贡献将采用项目的 **MIT 开源协议**。

---

> **YanYuCloudCube™** | **言启象限 · 语枢未来**
>
> *万象归元于云枢 | 深栈智启新纪元*
>
> **Words Initiate Quadrants, Language Serves as Core for Future**
