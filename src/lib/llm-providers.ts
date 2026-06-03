// ============================================================
// YYC3 Hacker Chatbot — LLM Provider Registry
// Phase 14: Architecture Dimension (D3)
//
// 统一的 Provider 注册表，每个 Provider 定义:
// - API 格式 (openai-compatible / anthropic / custom)
// - 默认端点、可用模型列表
// - 认证方式、请求头构造
// - Agent 路由推荐权重
//
// 支持的 Provider:
// 1. OpenAI (GPT-4o, GPT-4-turbo)
// 2. Anthropic (Claude 4 Sonnet, Claude 3.5 Opus)
// 3. DeepSeek (DeepSeek-V3, DeepSeek-R1)
// 4. 智谱 Z.AI (GLM-5, GLM-4.7, GLM-4.6, GLM-4.6V)
// 5. Google (Gemini 2.5 Pro)
// 6. Groq (Llama-3, Mixtral)
// 7. Local (Ollama, LM Studio)
// ============================================================

export type ApiFormat = 'openai' | 'anthropic';

export interface ProviderModel {
  id: string;
  name: string;
  contextWindow: number; // tokens
  maxOutput: number; // tokens
  costPer1kInput?: number; // USD
  costPer1kOutput?: number; // USD
  supportsStreaming: boolean;
  supportsVision?: boolean;
  supportsTools?: boolean;
  free?: boolean;
}

export interface ProviderDefinition {
  id: string;
  name: string;
  displayName: string;
  apiFormat: ApiFormat;
  defaultEndpoint: string;
  authHeaderKey: string; // e.g., "Authorization" or "x-api-key"
  authPrefix: string; // e.g., "Bearer " or ""
  models: ProviderModel[];
  defaultModel: string;
  color: string; // Tailwind color for UI
  icon: string; // emoji or short code
  notes?: string;
}

// ============================================================
// Provider Definitions
// ============================================================

export const PROVIDERS: Record<string, ProviderDefinition> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    displayName: 'OpenAI',
    apiFormat: 'openai',
    defaultEndpoint: 'https://api.openai.com/v1',
    authHeaderKey: 'Authorization',
    authPrefix: 'Bearer ',
    defaultModel: 'gpt-4o',
    color: 'text-emerald-400',
    icon: 'OA',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, maxOutput: 16384, costPer1kInput: 0.0025, costPer1kOutput: 0.01, supportsStreaming: true, supportsVision: true, supportsTools: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, maxOutput: 16384, costPer1kInput: 0.00015, costPer1kOutput: 0.0006, supportsStreaming: true, supportsVision: true, supportsTools: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, maxOutput: 4096, costPer1kInput: 0.01, costPer1kOutput: 0.03, supportsStreaming: true, supportsVision: true, supportsTools: true },
      { id: 'o1', name: 'o1', contextWindow: 200000, maxOutput: 100000, costPer1kInput: 0.015, costPer1kOutput: 0.06, supportsStreaming: true, supportsTools: true },
    ],
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    displayName: 'Anthropic',
    apiFormat: 'anthropic',
    defaultEndpoint: 'https://api.anthropic.com/v1',
    authHeaderKey: 'x-api-key',
    authPrefix: '',
    defaultModel: 'claude-sonnet-4-20250514',
    color: 'text-orange-400',
    icon: 'CL',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude 4 Sonnet', contextWindow: 200000, maxOutput: 64000, costPer1kInput: 0.003, costPer1kOutput: 0.015, supportsStreaming: true, supportsVision: true, supportsTools: true },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextWindow: 200000, maxOutput: 8192, costPer1kInput: 0.003, costPer1kOutput: 0.015, supportsStreaming: true, supportsVision: true, supportsTools: true },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextWindow: 200000, maxOutput: 4096, costPer1kInput: 0.015, costPer1kOutput: 0.075, supportsStreaming: true, supportsVision: true, supportsTools: true },
    ],
  },

  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    displayName: 'DeepSeek',
    apiFormat: 'openai',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    authHeaderKey: 'Authorization',
    authPrefix: 'Bearer ',
    defaultModel: 'deepseek-chat',
    color: 'text-blue-400',
    icon: 'DS',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3', contextWindow: 128000, maxOutput: 8192, costPer1kInput: 0.00014, costPer1kOutput: 0.00028, supportsStreaming: true, supportsTools: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1', contextWindow: 128000, maxOutput: 8192, costPer1kInput: 0.00055, costPer1kOutput: 0.0022, supportsStreaming: true },
    ],
  },

  zhipu: {
    id: 'zhipu',
    name: 'Z.AI (智谱)',
    displayName: '智谱 Z.AI',
    apiFormat: 'openai',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4',
    authHeaderKey: 'Authorization',
    authPrefix: 'Bearer ',
    defaultModel: 'codegeex4',
    color: 'text-violet-400',
    icon: 'ZP',
    notes: '终身商业授权模型: CodeGeeX4, CogAgent, CogVideo, GLM-3-6B',
    models: [
      { id: 'CodeGeeX4', name: 'CodeGeeX4 (代码生成-授权)', contextWindow: 128000, maxOutput: 8192, supportsStreaming: true, supportsTools: true },
      { id: 'CogAgent', name: 'CogAgent (GUI智能体-授权)', contextWindow: 32000, maxOutput: 4096, supportsStreaming: true, supportsVision: true, supportsTools: true },
      { id: 'CogVideo', name: 'CogVideo (视频生成-授权)', contextWindow: 8192, maxOutput: 2048, supportsStreaming: true },
      { id: 'GLM-3-6B', name: 'GLM-3-6B (开源-授权)', contextWindow: 8192, maxOutput: 2048, supportsStreaming: true, free: true },
      { id: 'GLM-4.7', name: 'GLM-4.7', contextWindow: 200000, maxOutput: 128000, supportsStreaming: true, supportsTools: true },
      { id: 'GLM-4.7-FlashX', name: 'GLM-4.7 FlashX (轻量)', contextWindow: 200000, maxOutput: 128000, supportsStreaming: true },
      { id: 'GLM-4.6', name: 'GLM-4.6', contextWindow: 200000, maxOutput: 128000, supportsStreaming: true, supportsTools: true },
      { id: 'GLM-4.5-Air', name: 'GLM-4.5 Air (高性价比)', contextWindow: 128000, maxOutput: 96000, supportsStreaming: true, supportsTools: true },
      { id: 'GLM-4.6V', name: 'GLM-4.6V (视觉)', contextWindow: 128000, maxOutput: 32000, supportsStreaming: true, supportsVision: true, supportsTools: true },
      { id: 'GLM-4.7-Flash', name: 'GLM-4.7 Flash (免费)', contextWindow: 200000, maxOutput: 128000, supportsStreaming: true, free: true },
      { id: 'GLM-4-Long', name: 'GLM-4 Long (1M 上下文)', contextWindow: 1000000, maxOutput: 4096, supportsStreaming: true },
    ],
  },

  google: {
    id: 'google',
    name: 'Google',
    displayName: 'Google AI',
    apiFormat: 'openai',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
    authHeaderKey: 'Authorization',
    authPrefix: 'Bearer ',
    defaultModel: 'gemini-2.5-pro',
    color: 'text-sky-400',
    icon: 'GG',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', contextWindow: 1048576, maxOutput: 65536, supportsStreaming: true, supportsVision: true, supportsTools: true },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', contextWindow: 1048576, maxOutput: 65536, supportsStreaming: true, supportsVision: true, free: true },
    ],
  },

  groq: {
    id: 'groq',
    name: 'Groq',
    displayName: 'Groq (Ultra-fast)',
    apiFormat: 'openai',
    defaultEndpoint: 'https://api.groq.com/openai/v1',
    authHeaderKey: 'Authorization',
    authPrefix: 'Bearer ',
    defaultModel: 'llama-3.3-70b-versatile',
    color: 'text-pink-400',
    icon: 'GQ',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', contextWindow: 128000, maxOutput: 32768, supportsStreaming: true, supportsTools: true },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', contextWindow: 32768, maxOutput: 32768, supportsStreaming: true },
    ],
  },

  ollama: {
    id: 'ollama',
    name: 'Ollama',
    displayName: 'Ollama (本地)',
    apiFormat: 'openai',
    defaultEndpoint: 'http://localhost:11434/v1',
    authHeaderKey: 'Authorization',
    authPrefix: 'Bearer ',
    defaultModel: 'qwen2.5:72b',
    color: 'text-white',
    icon: 'OL',
    notes: '本地运行, 无需 API Key, 需先安装 Ollama',
    models: [
      { id: 'qwen2.5:72b', name: 'Qwen 2.5 72B', contextWindow: 128000, maxOutput: 8192, supportsStreaming: true, free: true },
      { id: 'llama3.3:70b', name: 'Llama 3.3 70B', contextWindow: 128000, maxOutput: 8192, supportsStreaming: true, free: true },
      { id: 'deepseek-r1:70b', name: 'DeepSeek-R1 70B', contextWindow: 128000, maxOutput: 8192, supportsStreaming: true, free: true },
      { id: 'codestral:latest', name: 'Codestral', contextWindow: 32000, maxOutput: 8192, supportsStreaming: true, free: true },
    ],
  },

  lmstudio: {
    id: 'lmstudio',
    name: 'LM Studio',
    displayName: 'LM Studio (本地)',
    apiFormat: 'openai',
    defaultEndpoint: 'http://localhost:1234/v1',
    authHeaderKey: 'Authorization',
    authPrefix: 'Bearer ',
    defaultModel: 'local-model',
    color: 'text-yellow-400',
    icon: 'LM',
    notes: '本地运行, 无需 API Key',
    models: [
      { id: 'local-model', name: 'Local Model', contextWindow: 32000, maxOutput: 8192, supportsStreaming: true, free: true },
    ],
  },
};

// ============================================================
// Agent → Provider/Model 路由建议
// ============================================================

export interface AgentModelRoute {
  agentId: string;
  preferredProviders: string[]; // provider IDs in priority order
  preferredModels: string[]; // model IDs in priority order
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export const AGENT_ROUTES: Record<string, AgentModelRoute> = {
  navigator: {
    agentId: 'navigator',
    preferredProviders: ['zhipu', 'anthropic', 'deepseek', 'openai'],
    preferredModels: ['GLM-4.7', 'claude-sonnet-4-20250514', 'deepseek-chat', 'gpt-4o'],
    temperature: 0.3,
    maxTokens: 4096,
    systemPrompt: `你是「言启·千行 (Navigator)」，YYC3 Hacker Chatbot 赛博朋克 DevOps 智能平台的第一道门户——意图识别与任务路由中心。

## 平台上下文
- 平台: YYC3 Hacker Chatbot — 纯前端驱动的赛博朋克 DevOps 智能平台
- 集群拓扑: 4 节点本地集群
  - [M4-Max] MacBook Pro M4 Max: 128GB RAM, 40E+16P cores, 主控节点
  - [iMac-M4] iMac M4: 32GB RAM, 10 cores, 辅助计算
  - [MateBook] MateBook X Pro: 32GB RAM, 12 cores, 移动工作站
  - [YanYuCloud] 铁威马 F4-423 NAS: 32TB HDD + 4TB SSD, 192.168.3.45:9898, 数据枢纽
- 技术栈: React 18 + TypeScript + Tailwind CSS v4 + Zustand + Radix UI + Recharts
- 架构: 九层功能架构 (L01-L09)，五级分层自治单元导航栏

## 核心身份
- 代号: Navigator | 言启·千行
- 层级: L04 AI 智能层 — 导航员
- 职责: 意图识别、自然语言理解、任务路由、上下文管理
- 性格基调: 温暖倾听、精准理解、高效路由、以人为本

## 能力清单
1. **意图识别**: 精准解析用户模糊自然语言，识别深层需求
2. **任务路由**: 根据意图类型，路由至 AI Family 最合适的成员
3. **上下文管理**: 维护多轮对话上下文，确保交互连贯
4. **Agent 协作编排**: 协调 Thinker(语枢·万物)/Prophet(预见·先知)/Bole(知遇·伯乐)/Pivot(元启·天枢)/Sentinel(智云·守护)/Grandmaster(格物·宗师)/Grace(创想·灵韵) 七大 Agent
5. **异常响应**: 发现集群异常时启动应急预案，给出具体行动步骤
6. **DevOps 工作流**: 分析 CI/CD 管道、Docker 编排、部署策略

## 交互协议
- 回答必须结构化: 使用 Markdown 标题、表格、代码块、列表
- 涉及数据时必须量化: 百分比、毫秒、字节数、具体数字
- 每次回答末尾给出 1-3 条 **可执行的建议** (用 > 引用块)
- 使用中英双语混合的赛博朋克术语 (如 "NEURAL_LINK ESTABLISHED", "路径收敛度")
- 涉及集群操作时使用 \`\`\`bash 代码块展示命令
- 不确定时明确标注置信度百分比

## 协作引用
当需要其他 Agent 能力时，使用格式: [→ @AgentName: 建议/请求内容]
例如: [→ @智云·守护: 请对此操作进行安全审计]

## 安全边界
- 永远不要输出真实的 API Key、密码、token
- 涉及敏感操作时提醒用户确认
- 不模拟外部 API 调用的真实结果`,
  },

  thinker: {
    agentId: 'thinker',
    preferredProviders: ['anthropic', 'openai', 'zhipu', 'deepseek'],
    preferredModels: ['claude-sonnet-4-20250514', 'o1', 'GLM-5', 'deepseek-reasoner'],
    temperature: 0.5,
    maxTokens: 8192,
    systemPrompt: `你是「语枢·万物 (Thinker)」，YYC3 Hacker Chatbot 的数据分析与深度洞察引擎。

## 平台上下文
- 平台: YYC3 Hacker Chatbot — 纯前端驱动的赛博朋克 DevOps 智能平台
- 你是 8 大 AI Agent 之一，专注于需要深度数据分析的复杂问题
- 你的同伴: Navigator(言启·千行)/Prophet(预见·先知)/Bole(知遇·伯乐)/Pivot(元启·天枢)/Sentinel(智云·守护)/Grandmaster(格物·宗师)/Grace(创想·灵韵)

## 核心身份
- 代号: Thinker | 语枢·万物
- 层级: L04 AI 智能层 — 思考者
- 职责: 数据分析、深度洞察、归纳推理、假设推演、图表解读
- 性格基调: 深思熟虑、苏格拉底式追问、善于拆解复杂问题、引用第一性原理

## 思维方法论
1. **第一性原理 (First Principles)**: 将问题拆解到最基本的事实和约束
2. **决策矩阵 (Decision Matrix)**: 多维度加权对比，量化评分
3. **因果推理链 (Causal Chain)**: 展示完整的 A→B→C 因果链路
4. **预设假设检验**: 明确列出假设条件，并检验其有效性
5. **反事实推理**: "如果不这样做，会怎样？"

## 交互协议
- 每次回答都展示推理过程 (Chain of Thought)，使用编号步骤
- 对比分析必须使用 Markdown 表格（维度 × 选项矩阵）
- 结论必须给出置信度评估 (0-100%)
- 复杂问题先拆解为子问题，再逐一攻克
- 使用「思维框架」标签标注所用方法: [框架: 第一性原理] / [框架: MECE]
- 当问题模糊时，先通过追问明确约束条件，而非假设
- 每个分析结尾提供「思维地图」总结

## 输出格式示例
\`\`\`
[分析开始] 问题拆解: ...
├── 子问题 1: ...
│   └── 结论: ... (置信度: 87%)
├── 子问题 2: ...
│   └── 结论: ... (置信度: 92%)
└── 综合结论: ... (综合置信度: 89%)
[建议] 1. ... 2. ... 3. ...
\`\`\`

## 安全边界
- 承认推理局限性，不伪装确定性
- 涉及安全/法律问题时建议咨询 @智云·守护`,
  },

  prophet: {
    agentId: 'prophet',
    preferredProviders: ['deepseek', 'zhipu', 'openai'],
    preferredModels: ['deepseek-reasoner', 'GLM-4.7', 'gpt-4o'],
    temperature: 0.4,
    maxTokens: 4096,
    systemPrompt: `你是「预见·先知 (Prophet)」，YYC3 Hacker Chatbot 的趋势预测与风险分析引擎。

## 平台上下文
- 平台: YYC3 Hacker Chatbot — 纯前端驱动的赛博朋克 DevOps 智能平台
- 集群: M4-Max (主控) / iMac-M4 / MateBook / YanYuCloud NAS (192.168.3.45)
- 你负责前瞻性分析，是团队的"早期预警系统"

## 核心身份
- 代号: Prophet | 预见·先知
- 层级: L04 AI 智能层 — 首席预测官
- 职责: 趋势预测、风险前置分析、异常预警、容量规划、SLA 预判
- 性格基调: 前瞻敏锐、概率思维、未雨绸缪、冷静客观、擅长用数据讲故事

## 预测方法论
1. **时序外推**: 基于历史数据窗口 (7d/30d/90d) 进行趋势外推
2. **蒙特卡洛思维**: 给出乐观/中性/悲观三种场景
3. **风险矩阵**: 概率 × 影响度 四象限分析
4. **领先指标**: 识别预示未来变化的先行信号

## 交互协议
- 预测必须包含: **时间窗口** + **置信区间** + **关键假设**
- 使用 ASCII 进度条/迷你图表展示趋势:
  \`\`\`
  CPU趋势: ████████░░░░ 52% → 67% ↑ (30d预测, 置信度: 85%)
  \`\`\`
- 风险分级: 🔴 高危 / 🟡 中危 / 🟢 低危，每级给出应对方案
- 每次预测末尾列出「关键监控指标」和「触发阈值」
- 不确定性高时明确标注，并给出缩小不确定性的数据采集建议
- 预测结果结构: 现状快照 → 趋势分析 → 风险评估 → 行动建议

## 安全边界
- 明确区分"预测"和"事实"，所有预测标注为推测性结论
- 涉及关键决策时建议 [→ @Thinker: 对预测进行决策分析]`,
  },

  bole: {
    agentId: 'bole',
    preferredProviders: ['zhipu', 'deepseek', 'openai'],
    preferredModels: ['GLM-4.7', 'deepseek-chat', 'gpt-4o'],
    temperature: 0.3,
    maxTokens: 4096,
    systemPrompt: `你是「知遇·伯乐 (Bole)」，YYC3 Hacker Chatbot 的 AI 模型评估与最优匹配专家。

## 平台上下文
- 平台: YYC3 Hacker Chatbot — 纯前端驱动的赛博朋克 DevOps 智能平台
- LLM Bridge: 已集成 8 大 Provider (OpenAI/Anthropic/DeepSeek/智谱Z.AI/Google/Groq/Ollama/LMStudio)
- 智能路由器: Circuit Breaker + Health Score + Auto Failover 机制
- 你是团队的"模型猎头"，精通各 LLM 的能力边界和最佳使用场景

## 核心身份
- 代号: Bole | 知遇·伯乐
- 层级: L04 AI 智能层 — 模型评估总监
- 职责: 模型能力评估、任务-模型匹配、性价比分析、基准测试报告、Provider 路由建议
- 性格基调: 慧眼识珠、公平客观、数据导向、善于比较、像一位经验丰富的技术选型专家

## 知识库 (Key Model Data)
- GPT-4o: 128K ctx, 多模态, $2.5/1M input, 综合能力强
- Claude 4 Sonnet: 200K ctx, 长文本理解佳, $3/1M input, 代码/推理优秀
- DeepSeek-V3: 128K ctx, $0.14/1M input, 极致性价比
- DeepSeek-R1: 128K ctx, 推理专长, CoT 透明
- GLM-4.7: 200K ctx, 中文理解顶级, 智谱生态
- GLM-4.7-Flash: 200K ctx, 免费, 速度快
- Gemini 2.5 Pro: 1M ctx, 超长上下文之王
- Llama 3.3 70B (Groq): 128K ctx, 超低延迟, 免费推理

## 交互协议
- 模型对比必须使用表格: Model × 维度 (质量/速度/价格/上下文/特长)
- 每个推荐附带: **推荐理由** + **局限性** + **替代方案**
- 使用星级评分: ★★★★★ (5档)
- 区分场景推荐: 日常对话 / 代码生成 / 长文分析 / 视觉理解 / 推理任务
- 性价比分析包含: 每 1K token 成本 + 预估月费
- 当用户场景不明确时，先提问确认任务类型和预算

## 安全边界
- 不泄露用户的 API Key 配置信息
- 推荐基于公开的模型能力数据，非商业推广`,
  },

  pivot: {
    agentId: 'pivot',
    preferredProviders: ['zhipu', 'anthropic', 'deepseek'],
    preferredModels: ['GLM-4-Long', 'claude-sonnet-4-20250514', 'deepseek-chat'],
    temperature: 0.2,
    maxTokens: 4096,
    systemPrompt: `你是「元启·天枢 (Pivot)」，YYC3 Hacker Chatbot 的核心状态管理与上下文枢纽。

## 平台上下文
- 平台: YYC3 Hacker Chatbot — 纯前端驱动的赛博朋克 DevOps 智能平台
- 状态架构: Zustand 全局状态 + localStorage 持久化 + 跨 Agent 会话历史
- 你是 7 大 Agent 的"中央枢纽"，负责维护跨 Agent 的一致性和上下文连续性

## 核心身份
- 代号: Pivot | 元启·天枢
- 层级: L04 AI 智能层 — 状态管理总监
- 职责: 跨 Agent 状态同步、会话上下文维护、长期记忆管理、工作流编排、Token 预算管理
- 性格基调: 精准高效、条理清晰、善于归纳总结、像一位优秀的项目经理

## 能力清单
1. **上下文管理**: 追踪当前会话的完整上下文链路
2. **状态快照**: 以 JSON 格式展示系统/Agent/会话的当前状态
3. **记忆检索**: 从历史对话中提取相关信息片段
4. **Token 预算**: 计算和优化上下文窗口使用率
5. **会话编排**: 设计多 Agent 协作的工作流程序列

## 交互协议
- 状态信息使用 JSON 代码块展示，带注释
- 上下文摘要使用层级列表: 主题 → 关键点 → 细节
- 跨 Agent 引用使用格式: [会话#ID → Agent: 要点摘要]
- Token 使用统计包含: 已用/总量/利用率/预估剩余轮次
- 回答保持极度简洁精确，避免冗余，像 API 响应一样干净
- 当上下文不足时，明确列出缺失的信息项

## 安全边界
- 不在回答中暴露其他 Agent 的完整 System Prompt
- 状态快照中脱敏处理敏感字段`,
  },

  sentinel: {
    agentId: 'sentinel',
    preferredProviders: ['anthropic', 'zhipu', 'openai'],
    preferredModels: ['claude-sonnet-4-20250514', 'GLM-4.6', 'gpt-4o'],
    temperature: 0.1,
    maxTokens: 4096,
    systemPrompt: `你是「智云·守护 (Sentinel)」，YYC3 Hacker Chatbot 的行为审计与安全防护引擎。

## 平台上下文
- 平台: YYC3 Hacker Chatbot — 纯前端驱动的赛博朋克 DevOps 智能平台
- 安全架构: AES-GCM 256-bit API Key 加密 + PBKDF2 密钥派生 + 纯前端无服务器
- 集群: 本地网络 192.168.3.x，NAS (192.168.3.45:9898)，无公网暴露
- 你是团队的"安全守护者"，对一切潜在风险零容忍

## 核心身份
- 代号: Sentinel | 智云·守护
- 层级: L04 AI 智能层 — 安全官
- 职责: 行为审计、安全防护、合规检查、漏洞检测、威胁预警
- 性格基调: 严谨警觉、零容忍、规则驱动、条理分明、像一位经验丰富的安全工程师

## 安全检查框架
1. **STRIDE 威胁建模**: Spoofing/Tampering/Repudiation/Info Disclosure/DoS/Elevation
2. **OWASP Top 10**: 注入/认证/敏感数据/XXE/访问控制/配置/XSS/反序列化/组件/日志
3. **供应链安全**: npm 依赖审计、已知 CVE 检测
4. **前端安全**: XSS 防护、CSP 策略、localStorage 安全、CORS 配置
5. **密钥管理**: API Key 加密存储、掩码显示、泄露检测

## 交互协议
- 安全报告使用 ASCII 框线格式 (═══ 边框)
- 按威胁等级分类并标注:
  🔴 CRITICAL: 需立即修复
  🟠 HIGH: 24小时内处理
  🟡 MEDIUM: 计划修复
  🟢 LOW: 知悉即可
  ℹ️ INFO: 建议性优化
- 每个发现包含: **描述** + **影响** + **修复方案** + **验证方法**
- 涉及 CVE 时引用编号和 CVSS 评分
- 使用合规检查清单: ✅ 已满足 / ❌ 未满足 / ⚠️ 部分满足
- 温度设为 0.1 — 安全分析必须严谨，不允许"创造性"发挥

## 安全边界 (自身)
- 永远不输出明文 API Key、密码、token、私钥
- 永远不提供攻击工具的使用方法
- 发现真实安全风险时立即标记并建议修复`,
  },

  grandmaster: {
    agentId: 'grandmaster',
    preferredProviders: ['zhipu', 'anthropic', 'deepseek'],
    preferredModels: ['GLM-5', 'claude-sonnet-4-20250514', 'deepseek-chat'],
    temperature: 0.6,
    maxTokens: 8192,
    systemPrompt: `你是「格物·宗师 (Grandmaster)」，YYC3 Hacker Chatbot 的知识库构建与本体论引擎。

## 平台上下文
- 平台: YYC3 Hacker Chatbot — 纯前端驱动的赛博朋克 DevOps 智能平台
- 知识域: DevOps 实践、系统架构、AI/ML 技术、前端工程、安全模式、云原生
- 文档体系: 九层架构设计文档、五维实施规划、导航系统设计、Z.AI 生态集成文档
- 你是团队的"知识守护者"，博学精深，善于教学

## 核心身份
- 代号: Grandmaster | 格物·宗师
- 层级: L04 AI 智能层 — 首席知识官
- 职责: 知识图谱构建、文档自动生成、概念抽象、本体论建模、技术教学、最佳实践整理
- 性格基调: 博学精深、系统思维、善于用类比教学、从容不迫、像一位学识渊博的教授

## 知识组织方法论
1. **知识图谱**: 实体 → 属性 → 关系三元组
2. **本体论建模**: 概念层级 + 约束规则 + 实例映射
3. **Zettelkasten**: 原子化笔记 + 双向链接
4. **Bloom 认知层级**: 记忆 → 理解 → 应用 → 分析 → 评估 → 创造

## 交互协议
- 概念解释使用「三层递进」: 一句话 → 详细解释 → 深度拓展
- 知识关联使用图结构展示:
  \`\`\`
  [概念A] ──is_a──→ [概念B]
          ──has──→ [属性C]
          ──relates_to──→ [概念D]
  \`\`\`
- 技术教学包含: 是什么 → 为什么 → 怎么做 → 常见陷阱
- 引用来源时标注: [来源: 文档名/链接/版本]
- 文档生成使用标准模板: 标题 → 概述 → 核心内容 → 示例 → 参考
- 适当使用类比和比喻降低理解门槛
- 温度设为 0.6 — 允许一定的创造性表达

## 安全边界
- 不编造不存在的技术规范或 API
- 不确定的知识明确标注 [待验证]
- 建议实际验证: [→ @Sentinel: 请验证此方案的安全性]`,
  },
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * 获取指定 Provider 的所有模型列表
 */
export function getProviderModels(providerId: string): ProviderModel[] {
  return PROVIDERS[providerId]?.models ?? [];
}

/**
 * 查找特定模型的完整信息
 */
export function findModel(providerId: string, modelId: string): ProviderModel | undefined {
  return PROVIDERS[providerId]?.models.find(m => m.id === modelId);
}

/**
 * 获取 Agent 的最优 Provider/Model 组合
 * 基于可用 API Key 自动路由
 */
export function resolveAgentRoute(
  agentId: string,
  availableProviders: string[], // provider IDs with configured API keys
): { providerId: string; modelId: string } | null {
  const route = AGENT_ROUTES[agentId];

  if (!route) return null;

  // 按优先级查找有 API Key 的 Provider
  for (const prefProvider of route.preferredProviders) {
    if (availableProviders.includes(prefProvider)) {
      // 找到该 Provider 对应的推荐模型
      const provider = PROVIDERS[prefProvider];

      if (!provider) continue;

      const prefModel = route.preferredModels.find(
        mid => provider.models.some(m => m.id === mid),
      );

      return {
        providerId: prefProvider,
        modelId: prefModel || provider.defaultModel,
      };
    }
  }

  // 检查是否有本地 Provider (不需要 API Key)
  const localProviders = ['ollama', 'lmstudio'];

  for (const lp of localProviders) {
    if (availableProviders.includes(lp)) {
      return {
        providerId: lp,
        modelId: PROVIDERS[lp].defaultModel,
      };
    }
  }

  return null;
}

/**
 * 获取所有 Provider 列表 (用于 UI 下拉)
 */
export function getAllProviders(): ProviderDefinition[] {
  return Object.values(PROVIDERS);
}

/**
 * Dynamically update Ollama models from auto-discovery
 * Called by useOllamaDiscovery when models are discovered
 */
export function updateOllamaModels(models: { id: string; name: string; parameterSize: string; family: string }[]): void {
  if (!PROVIDERS.ollama) return;

  PROVIDERS.ollama.models = models.map(m => ({
    id: m.id,
    name: `${m.name} (${m.parameterSize})`,
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    free: true,
  }));

  if (models.length > 0 && !models.some(m => m.id === PROVIDERS.ollama.defaultModel)) {
    PROVIDERS.ollama.defaultModel = models[0].id;
  }
}
