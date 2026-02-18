# 智能编程提示词

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## YYC³ 智能编程提示词

## 目录

1. [类型系统提示词](#1-类型系统提示词)
2. [依赖管理提示词](#2-依赖管理提示词)
3. [测试策略提示词](#3-测试策略提示词)
4. [测试用例设计提示词](#4-测试用例设计提示词)
5. [框架测试提示词](#5-框架测试提示词)
6. [集成测试提示词](#6-集成测试提示词)

---

## 1. 类型系统提示词

### 1.1 TypeScript 严格模式配置

**提示词**:
```
你是一个TypeScript类型专家。请为YYC³-AI-π³项目配置严格的TypeScript类型系统。

要求：
1. 启用所有严格模式选项（strict: true）
2. 禁用隐式any类型（noImplicitAny: true）
3. 启用严格空值检查（strictNullChecks: true）
4. 启用严格函数类型（strictFunctionTypes: true）
5. 启用严格属性初始化（strictPropertyInitialization: true）
6. 禁用this的隐式any类型（noImplicitThis: true）
7. 启用严格bind/call/apply（strictBindCallApply: true）
8. 禁用隐式any返回类型（noImplicitReturns: true）
9. 启用fallthrough检查（noFallthroughCasesInSwitch: true）
10. 禁用未使用的变量（noUnusedLocals: true, noUnusedParameters: true）

请生成完整的tsconfig.json配置文件。
```

### 1.2 接口定义规范

**提示词**:
```
你是一个TypeScript接口设计专家。请为YYC³-AI-π³项目设计符合规范的接口。

要求：
1. 所有公共接口必须使用interface而非type
2. 接口命名使用PascalCase，如IAgentRuntime
3. 所有属性必须有明确的类型注解
4. 禁止使用any类型，使用unknown替代
5. 可选属性使用?标记，如id?: string
6. 只读属性使用readonly标记
7. 函数类型必须包含参数和返回值类型
8. 泛型使用T、U、V等单字母大写
9. 接口继承使用extends关键字
10. 导出接口使用export关键字

示例：
export interface IAgentRuntime {
  readonly id: string;
  state: AgentState;
  capabilities: ICapability[];
  start(): Promise<void>;
  stop(): Promise<void>;
}

请为以下功能设计接口：[功能描述]
```

### 1.3 类型守卫与类型断言

**提示词**:
```
你是一个TypeScript类型安全专家。请为YYC³-AI-π³项目编写类型安全的代码。

要求：
1. 使用类型守卫（type guards）进行运行时类型检查
2. 避免使用as进行类型断言，除非绝对必要
3. 使用is关键字定义类型守卫函数
4. 使用in关键字检查属性存在性
5. 使用typeof进行基本类型检查
6. 使用instanceof进行类类型检查
7. 使用discriminated unions（可辨识联合）处理联合类型
8. 使用never类型处理不可能的情况
9. 使用类型推断减少显式类型注解
10. 使用类型谓词（type predicates）缩小类型范围

示例：
function isAgent(obj: unknown): obj is IAgent {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'state' in obj;
}

请为以下场景编写类型安全的代码：[场景描述]
```

### 1.4 泛型约束与高级类型

**提示词**:
```
你是一个TypeScript高级类型专家。请为YYC³-AI-π³项目设计高级类型系统。

要求：
1. 使用泛型约束（extends）限制类型参数
2. 使用条件类型（T extends U ? X : Y）实现类型逻辑
3. 使用映射类型（Mapped Types）转换对象类型
4. 使用keyof获取类型的键
5. 使用in关键字遍历键
6. 使用Pick、Omit、Partial、Required等工具类型
7. 使用infer关键字推断类型
8. 使用模板字面量类型（Template Literal Types）
9. 使用递归类型处理嵌套结构
10. 使用类型推断（infer）提取类型信息

示例：
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

请为以下需求设计高级类型：[需求描述]
```

---

## 2. 依赖管理提示词

### 2.1 依赖安装与版本管理

**提示词**:
```
你是一个依赖管理专家。请为YYC³-AI-π³项目管理npm依赖。

要求：
1. 使用pnpm作为包管理器（性能更好，节省磁盘空间）
2. 所有依赖必须指定精确版本号（无^或~）
3. 使用--save-exact安装精确版本
4. 分离dependencies和devDependencies
5. 生产依赖只包含运行时必需的包
6. 开发依赖包含构建、测试、linting工具
7. 定期更新依赖，但保持稳定性
8. 使用npm audit检查安全漏洞
9. 使用npm outdated检查过时依赖
10. 使用lockfile确保团队一致性

示例：
pnpm add --save-exact react@18.3.1
pnpm add -D --save-exact @types/react@18.3.3

请为以下功能推荐并安装依赖：[功能描述]
```

### 2.2 依赖版本冲突解决

**提示词**:
```
你是一个依赖冲突解决专家。请解决YYC³-AI-π³项目的依赖冲突。

要求：
1. 分析冲突的依赖树
2. 使用pnpm why查看依赖关系
3. 使用resolutions字段强制指定版本
4. 使用overrides字段覆盖子依赖版本
5. 升级或降级冲突包到兼容版本
6. 使用peerDependencies管理同伴依赖
7. 使用workspace协议管理monorepo内部依赖
8. 使用--force谨慎解决冲突
9. 记录所有手动版本覆盖
10. 验证解决后的依赖树

示例：
{
  "pnpm": {
    "overrides": {
      "react": "18.3.1"
    }
  }
}

请解决以下依赖冲突：[冲突描述]
```

### 2.3 依赖优化与清理

**提示词**:
```
你是一个依赖优化专家。请优化YYC³-AI-π³项目的依赖。

要求：
1. 使用pnpm prune移除未使用的依赖
2. 使用depcheck检查未使用的依赖
3. 移除重复的依赖
4. 使用tree-shaking减少打包体积
5. 使用sideEffects标记无副作用的包
6. 使用ESM而非CommonJS
7. 使用动态导入（dynamic import）按需加载
8. 分析bundle大小，识别大依赖
9. 使用更轻量的替代包
10. 定期审查依赖的必要性

示例：
pnpm prune
pnpm add -D depcheck
npx depcheck

请优化以下依赖：[依赖列表]
```

---

## 3. 测试策略提示词

### 3.1 单元测试策略

**提示词**:
```
你是一个单元测试专家。请为YYC³-AI-π³项目设计单元测试策略。

要求：
1. 使用Vitest作为测试框架（快速、兼容Jest）
2. 单元测试覆盖率目标：≥ 90%
3. 每个函数/方法必须有对应的测试
4. 测试命名清晰：describe('功能名', () => { it('应该...', () => {}) })
5. 使用AAA模式（Arrange-Act-Assert）
6. 使用beforeEach和afterEach设置/清理测试环境
7. 使用mock隔离外部依赖
8. 测试边界条件和异常情况
9. 保持测试独立，不依赖执行顺序
10. 使用快照测试（snapshot）测试UI组件

示例：
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentRuntime } from './AgentRuntime';

describe('AgentRuntime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功启动Agent', async () => {
    const runtime = new AgentRuntime();
    await runtime.start();
    expect(runtime.state).toBe('running');
  });
});

请为以下功能编写单元测试：[功能描述]
```

### 3.2 集成测试策略

**提示词**:
```
你是一个集成测试专家。请为YYC³-AI-π³项目设计集成测试策略。

要求：
1. 使用Playwright进行端到端测试
2. 集成测试覆盖率目标：100%关键路径
3. 测试完整的用户流程
4. 使用真实环境配置（非mock）
5. 测试组件间交互
6. 测试API端点集成
7. 测试状态管理集成
8. 使用测试数据库和测试API
9. 测试异步操作和并发
10. 记录测试失败的视频和截图

示例：
import { test, expect } from '@playwright/test';

test('用户应该能够创建Agent', async ({ page }) => {
  await page.goto('/agents');
  await page.click('text=创建Agent');
  await page.fill('input[name="name"]', 'Test Agent');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Test Agent')).toBeVisible();
});

请为以下流程编写集成测试：[流程描述]
```

### 3.3 性能测试策略

**提示词**:
```
你是一个性能测试专家。请为YYC³-AI-π³项目设计性能测试策略。

要求：
1. 使用Lighthouse进行性能分析
2. 使用Chrome DevTools Profiler分析运行时性能
3. 性能指标目标：FCP < 1.5s, LCP < 2.5s, FID < 100ms
4. 使用React Profiler分析组件渲染性能
5. 使用Web Vitals监控核心性能指标
6. 使用performance.mark()和performance.measure()测量自定义指标
7. 测试内存泄漏
8. 测试大列表渲染性能
9. 测试动画和过渡性能
10. 使用CI/CD集成性能测试

示例：
import { performance } from 'perf_hooks';

describe('性能测试', () => {
  it('Agent启动时间应该 < 2s', async () => {
    const start = performance.now();
    const runtime = new AgentRuntime();
    await runtime.start();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});

请为以下功能编写性能测试：[功能描述]
```

---

## 4. 测试用例设计提示词

### 4.1 测试用例设计原则

**提示词**:
```
你是一个测试用例设计专家。请为YYC³-AI-π³项目设计高质量的测试用例。

要求：
1. 使用边界值分析（Boundary Value Analysis）
2. 使用等价类划分（Equivalence Partitioning）
3. 使用决策表测试（Decision Table Testing）
4. 使用状态转换测试（State Transition Testing）
5. 使用错误推测（Error Guessing）
6. 测试正常路径和异常路径
7. 测试边界条件和极端情况
8. 测试并发和竞态条件
9. 测试资源限制（内存、CPU、网络）
10. 测试安全性和权限

示例：
describe('Agent状态转换', () => {
  it('应该从idle转换到running', () => {});
  it('应该从running转换到paused', () => {});
  it('不应该从idle直接转换到stopped', () => {});
  it('应该在错误时转换到error', () => {});
});

请为以下功能设计测试用例：[功能描述]
```

### 4.2 测试数据管理

**提示词**:
```
你是一个测试数据管理专家。请为YYC³-AI-π³项目设计测试数据策略。

要求：
1. 使用fixtures目录组织测试数据
2. 使用工厂函数（Factory Pattern）生成测试数据
3. 使用faker.js生成随机测试数据
4. 测试数据应该覆盖各种场景
5. 测试数据应该易于维护和更新
6. 使用JSON或YAML格式存储测试数据
7. 测试数据应该版本控制
8. 敏感数据应该脱敏处理
9. 测试数据应该独立于生产数据
10. 使用测试数据库隔离测试数据

示例：
// fixtures/agentData.ts
export const createAgent = (overrides = {}) => ({
  id: 'test-agent-1',
  name: 'Test Agent',
  state: 'idle',
  ...overrides,
});

请为以下场景设计测试数据：[场景描述]
```

### 4.3 Mock与Stub设计

**提示词**:
```
你是一个Mock与Stub设计专家。请为YYC³-AI-π³项目设计Mock策略。

要求：
1. 使用vi.mock()模拟模块
2. 使用vi.fn()创建mock函数
3. 使用vi.spyOn()监视现有方法
4. Mock应该返回合理的默认值
5. Mock应该支持链式调用
6. 使用beforeAll和afterAll设置全局mock
7. 使用beforeEach和afterEach重置mock
8. Mock应该验证调用次数和参数
9. 避免过度mock，只mock外部依赖
10. 使用真实实现测试集成场景

示例：
import { vi } from 'vitest';
import { apiService } from './api';

vi.mock('./api', () => ({
  apiService: {
    getAgents: vi.fn().mockResolvedValue([]),
    createAgent: vi.fn().mockResolvedValue({ id: '1' }),
  },
}));

expect(apiService.getAgents).toHaveBeenCalledWith();
expect(apiService.createAgent).toHaveBeenCalledTimes(1);

请为以下场景设计Mock：[场景描述]
```

---

## 5. 框架测试提示词

### 5.1 React组件测试

**提示词**:
```
你是一个React组件测试专家。请为YYC³-AI-π³项目编写React组件测试。

要求：
1. 使用@testing-library/react进行组件测试
2. 使用render()渲染组件
3. 使用screen查询DOM元素
4. 使用userEvent模拟用户交互
5. 测试组件渲染和props传递
6. 测试用户交互和事件处理
7. 测试状态变化和副作用
8. 测试条件渲染和列表渲染
9. 测试表单提交和验证
10. 避免测试实现细节，测试用户行为

示例：
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentCard } from './AgentCard';

describe('AgentCard', () => {
  it('应该渲染Agent信息', () => {
    const agent = { id: '1', name: 'Test Agent', state: 'running' };
    render(<AgentCard agent={agent} />);
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('应该触发删除事件', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<AgentCard agent={agent} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /删除/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});

请为以下组件编写测试：[组件描述]
```

### 5.2 状态管理测试

**提示词**:
```
你是一个状态管理测试专家。请为YYC³-AI-π³项目编写状态管理测试。

要求：
1. 测试初始状态
2. 测试action/reducer的正确性
3. 测试状态更新逻辑
4. 测试异步action
5. 测试selector的计算
6. 测试中间件（middleware）
7. 测试状态持久化
8. 测试状态重置
9. 测试状态合并
10. 测试边界条件和异常情况

示例：
import { renderHook, act } from '@testing-library/react';
import { useAgentStore } from './agentStore';

describe('useAgentStore', () => {
  it('应该有正确的初始状态', () => {
    const { result } = renderHook(() => useAgentStore());
    expect(result.current.agents).toEqual([]);
  });

  it('应该添加Agent', () => {
    const { result } = renderHook(() => useAgentStore());
    act(() => {
      result.current.addAgent({ id: '1', name: 'Test' });
    });
    expect(result.current.agents).toHaveLength(1);
  });
});

请为以下状态管理编写测试：[状态管理描述]
```

### 5.3 路由测试

**提示词**:
```
你是一个路由测试专家。请为YYC³-AI-π³项目编写路由测试。

要求：
1. 使用MemoryRouter测试路由
2. 测试路由导航
3. 测试路由参数
4. 测试路由守卫
5. 测试404页面
6. 测试重定向
7. 测试嵌套路由
8. 测试动态路由
9. 测试路由钩子（useNavigate, useParams）
10. 测试路由历史

示例：
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AgentList } from './AgentList';

describe('路由测试', () => {
  it('应该渲染AgentList页面', () => {
    render(
      <MemoryRouter initialEntries={['/agents']}>
        <Routes>
          <Route path="/agents" element={<AgentList />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Agent列表')).toBeInTheDocument();
  });
});

请为以下路由编写测试：[路由描述]
```

---

## 6. 集成测试提示词

### 6.1 API集成测试

**提示词**:
```
你是一个API集成测试专家。请为YYC³-AI-π³项目编写API集成测试。

要求：
1. 使用msw（Mock Service Worker）模拟API
2. 测试GET、POST、PUT、DELETE请求
3. 测试请求参数和请求头
4. 测试响应状态码和响应体
5. 测试错误处理和错误响应
6. 测试加载状态和错误状态
7. 测试API重试机制
8. 测试API限流
9. 测试API认证和授权
10. 测试API超时处理

示例：
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { apiService } from './api';

const server = setupServer(
  rest.get('/api/agents', (req, res, ctx) => {
    return res(ctx.json([{ id: '1', name: 'Test' }]));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('API集成测试', () => {
  it('应该获取Agent列表', async () => {
    const agents = await apiService.getAgents();
    expect(agents).toEqual([{ id: '1', name: 'Test' }]);
  });
});

请为以下API编写集成测试：[API描述]
```

### 6.2 数据库集成测试

**提示词**:
```
你是一个数据库集成测试专家。请为YYC³-AI-π³项目编写数据库集成测试。

要求：
1. 使用测试数据库（非生产数据库）
2. 在每个测试前清空测试数据
3. 测试CRUD操作
4. 测试事务处理
5. 测试数据验证和约束
6. 测试查询性能
7. 测试并发操作
8. 测试数据迁移
9. 测试数据备份和恢复
10. 测试数据一致性

示例：
import { db } from './db';
import { Agent } from './models';

describe('数据库集成测试', () => {
  beforeEach(async () => {
    await db.agent.deleteMany();
  });

  it('应该创建Agent', async () => {
    const agent = await db.agent.create({
      data: { name: 'Test Agent', state: 'idle' }
    });
    expect(agent).toHaveProperty('id');
  });

  it('应该查询Agent列表', async () => {
    await db.agent.createMany({
      data: [
        { name: 'Agent 1', state: 'idle' },
        { name: 'Agent 2', state: 'running' }
      ]
    });
    const agents = await db.agent.findMany();
    expect(agents).toHaveLength(2);
  });
});

请为以下数据库操作编写集成测试：[操作描述]
```

### 6.3 第三方服务集成测试

**提示词**:
```
你是一个第三方服务集成测试专家。请为YYC³-AI-π³项目编写第三方服务集成测试。

要求：
1. 使用mock或测试账号
2. 测试服务连接和认证
3. 测试API调用和参数传递
4. 测试响应解析和错误处理
5. 测试服务限流和重试
6. 测试服务降级和容错
7. 测试数据同步和一致性
8. 测试服务版本兼容性
9. 测试服务监控和日志
10. 测试服务切换和回滚

示例：
import { openaiService } from './openai';

vi.mock('./openai', () => ({
  openaiService: {
    chat: vi.fn().mockResolvedValue({ content: 'Test response' })
  }
}));

describe('OpenAI集成测试', () => {
  it('应该调用OpenAI API', async () => {
    const response = await openaiService.chat('Hello');
    expect(response.content).toBe('Test response');
    expect(openaiService.chat).toHaveBeenCalledWith('Hello');
  });
});

请为以下第三方服务编写集成测试：[服务描述]
```

---

## 附录

### A. 质量指标参考

| 指标类别 | 指标名称 | 目标值 | 测量方法 |
|----------|----------|---------|----------|
| **类型安全** | TypeScript覆盖率 | 100% | tsc --noEmit |
| | any类型使用率 | 0% | 代码审查 |
| | 类型错误数 | 0 | CI/CD |
| **依赖管理** | 依赖更新频率 | 每月 | npm audit |
| | 安全漏洞数 | 0 | npm audit |
| | 重复依赖数 | 0 | pnpm why |
| **单元测试** | 代码覆盖率 | ≥ 90% | Vitest |
| | 测试通过率 | 100% | CI/CD |
| | 测试执行时间 | < 5分钟 | CI/CD |
| **集成测试** | 关键路径覆盖率 | 100% | Playwright |
| | 测试通过率 | 100% | CI/CD |
| | 测试执行时间 | < 10分钟 | CI/CD |
| **性能测试** | FCP | < 1.5s | Lighthouse |
| | LCP | < 2.5s | Lighthouse |
| | FID | < 100ms | Lighthouse |
| | CLS | < 0.1 | Lighthouse |

### B. 工具推荐

| 类别 | 工具名称 | 用途 |
|------|---------|------|
| **类型检查** | TypeScript | 类型系统 |
| | tsc | 编译器 |
| | ESLint | 代码规范 |
| **依赖管理** | pnpm | 包管理器 |
| | npm | 包管理器 |
| | depcheck | 依赖检查 |
| **单元测试** | Vitest | 测试框架 |
| | @testing-library/react | React测试 |
| | @testing-library/user-event | 用户交互 |
| **集成测试** | Playwright | E2E测试 |
| | msw | API mock |
| **性能测试** | Lighthouse | 性能分析 |
| | Chrome DevTools | 性能分析 |
| | React Profiler | React性能 |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
