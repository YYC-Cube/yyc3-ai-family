# 第 2 阶段: 多 Agent 协作测试清单

## 协作模式说明

### 1. Pipeline（串行接力）
- **流程**: A → B → C → D 顺序执行
- **用途**: 代码审核、工作流处理
- **预设模板**: code-review-pipeline
- **特点**: 每个Agent依次处理前序输出

### 2. Parallel（并行汇总）
- **流程**: A + B + C + D → Merge
- **用途**: 多角度分析、知识库并行
- **预设模板**: knowledge-parallel
- **特点**: 同时执行，最后汇总

### 3. Debate（辩论仲裁）
- **流程**: A vs B → Judge C
- **用途**: 方案对比、技术决策
- **预设模板**: architecture-debate
- **特点**: 观点对立，第三方仲裁

### 4. Ensemble（集成共识）
- **流程**: A + B + C → Consensus
- **用途**: 安全评估、风险分析
- **预设模板**: security-ensemble
- **特点**: 独立评估，共识决策

### 5. Delegation（委托分工）
- **流程**: A → [subTask→B, subTask→C]
- **用途**: DevOps任务、复杂项目
- **预设模板**: devops-delegation
- **特点**: 任务分解，并行执行

## 手动测试步骤

由于多 Agent 协作需要UI交互，以下是详细的测试步骤：

### 步骤 1: 启动应用
```bash
bun run dev
# 打开 http://localhost:3113
```

### 步骤 2: 进入 Agent Orchestrator
1. 点击顶栏的 "Agent Orchestrator" 或导航到相应页面
2. 查看可用的预设模板卡片

### 步骤 3: 测试模拟执行（无需API Key）

#### 测试 3.1: Pipeline 模式
1. 选择预设 "代码审核流水线"
2. 点击 "应用预设"
3. 确认执行模式为 "Simulation"（模拟）
4. 点击 "Launch Pipeline Collaboration"
5. 观察执行过程:
   - Agent 状态变化（idle → thinking → executing → done）
   - 时间线事件
   - 最终合成报告
6. 验证要点:
   - ✓ Navigator → Thinker → Sentinel 顺序执行
   - ✓ 每个 Agent 处理前序的输出
   - ✓ 最终报告包含所有 Agent 的贡献

#### 测试 3.2: Parallel 模式
1. 选择预设 "知识库并行分析"
2. 应用预设并启动
3. 验证要点:
   - ✓ Thinker + Prophet + Bole 同时执行
   - ✓ 最后由 Grandmaster 汇总
   - ✓ 并行执行的效率优势

#### 测试 3.3: Debate 模式
1. 选择预设 "架构方案辩论"
2. 应用预设并启动
3. 验证要点:
   - ✓ Thinker vs Prophet 观点对立
   - ✓ Navigator 进行仲裁
   - ✓ 最终的平衡结论

#### 测试 3.4: Ensemble 模式
1. 选择预设 "安全评估集成"
2. 应用预设并启动
3. 验证要点:
   - ✓ 所有 Agent 独立评估
   - ✓ 共识机制运行
   - ✓ 综合评分结果

#### 测试 3.5: Delegation 模式
1. 选择预设 "DevOps 委托分工"
2. 应用预设并启动
3. 验证要点:
   - ✓ Navigator 分解任务
   - ✓ Pivot/Prophet/Sentinel 并行执行子任务
   - ✓ 任务汇总完成

### 步骤 4: 测试自定义创建
1. 选择协作模式（任意一种）
2. 输入任务描述: "分析 React 18 的并发特性"
3. 观察系统推荐的 Agent 组合
4. 可选：手动调整 Agent 选择
5. 启动执行
6. 验证要点:
   - ✓ 推荐算法准确性
   - ✓ Agent 分配合理性
   - ✓ 执行过程流畅

### 步骤 5: 测试真实 LLM 执行（可选）
1. 确保已配置 Provider API Key
2. 创建新任务时选择 "Real LLM" 执行引擎
3. 输入测试任务
4. 启动执行
5. 验证要点:
   - ✓ 真实的 LLM API 调用
   - ✓ Provider/Model 信息显示
   - ✓ Token 使用统计
   - ✓ 延迟时间合理

## 预期结果

### 模拟执行
- ✅ Agent 状态正确变化
- ✅ 时间线事件完整
- ✅ 输出内容合理
- ✅ 执行时间 5-15 秒

### 真实 LLM 执行
- ✅ API 调用成功
- ✅ 响应质量高
- ✅ Token 统计准确
- ✅ 延迟 1-5 秒/Agent

## 功能完整性评估

- [ ] Pipeline 模式完全可用
- [ ] Parallel 模式完全可用
- [ ] Debate 模式完全可用
- [ ] Ensemble 模式完全可用
- [ ] Delegation 模式完全可用

- [ ] 模拟执行功能正常
- [ ] 真实 LLM 执行功能正常
- [ ] Agent 推荐算法准确
- [ ] 错误处理机制完善

