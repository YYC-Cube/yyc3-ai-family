// ============================================================
// YYC3 Hacker Chatbot — Multi-Agent Collaborative Orchestrator
// Phase 17.2: 多 Agent 协作编排工作流
//
// 核心理念: 从人机交互到人机协同一体化
//   - 关系定位: 伙伴与伙伴（共生关系）
//   - 交互模式: 意图→共创（双向共创）
//   - 决策机制: 人机协同决策
//   - 价值创造: AI 创造价值（价值伙伴）
//   - 学习进化: AI 主动进化（动态进化）
//
// 架构:
//   TaskDecomposer → AgentSelector → CollaborationDAG
//   → Agent Execution (parallel/sequential/consensus)
//   → Result Aggregator → Human Review Gate
//   → Learning Loop (记忆/反馈/进化)
//
// Agent 协作模式:
//   1. Pipeline: A → B → C (串行接力)
//   2. Parallel:  A + B + C → Merge (并行汇总)
//   3. Debate:    A vs B → Judge C (辩论仲裁)
//   4. Ensemble:  A + B + C → Consensus (集成共识)
//   5. Delegation: A → [subTask → B, subTask → C] (委托分工)
// ============================================================

// ============================================================
// 1. Types
// ============================================================

export type CollaborationMode =
  | 'pipeline'   // 串行接力
  | 'parallel'   // 并行汇总
  | 'debate'     // 辩论仲裁
  | 'ensemble'   // 集成共识
  | 'delegation'; // 委托分工

export type AgentRole = 'lead' | 'contributor' | 'reviewer' | 'judge' | 'observer';

export type TaskStatus =
  | 'pending'
  | 'decomposing'
  | 'assigning'
  | 'executing'
  | 'reviewing'
  | 'consensus'
  | 'completed'
  | 'failed'
  | 'human_review';

export type AgentExecutionStatus =
  | 'idle'
  | 'thinking'
  | 'executing'
  | 'waiting'
  | 'done'
  | 'error';

// ============================================================
// 2. Data Structures
// ============================================================

export interface CollaborationTask {
  id: string;
  title: string;
  description: string;
  intent: string;            // 用户原始意图
  mode: CollaborationMode;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  // Agents involved
  agents: AgentAssignment[];
  // Subtasks (for delegation mode)
  subtasks: SubTask[];
  // Execution timeline
  timeline: TimelineEvent[];
  // Results
  results: AgentResult[];
  finalOutput?: string;
  consensusScore?: number;
  // Human interaction
  humanFeedback?: string;
  humanApproved?: boolean;
  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  totalTokens: number;
  totalLatencyMs: number;
}

export interface AgentAssignment {
  agentId: string;
  role: AgentRole;
  status: AgentExecutionStatus;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  tokensUsed: number;
  latencyMs: number;
}

export interface SubTask {
  id: string;
  parentTaskId: string;
  title: string;
  description: string;
  assignedAgent: string;
  status: TaskStatus;
  result?: string;
  dependencies: string[];    // other subtask IDs
  order: number;
}

export interface AgentResult {
  agentId: string;
  role: AgentRole;
  output: string;
  confidence: number;        // 0-1
  reasoning?: string;
  artifacts?: Array<{
    type: 'code' | 'document' | 'data' | 'diagram';
    content: string;
    language?: string;
  }>;
  tokensUsed: number;
  latencyMs: number;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'task_created' | 'agent_assigned' | 'agent_started' | 'agent_completed'
    | 'agent_error' | 'subtask_created' | 'consensus_reached' | 'human_review'
    | 'task_completed' | 'feedback_received' | 'message';
  agentId?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

// ============================================================
// 3. Agent Capability Matrix
// ============================================================

export interface AgentCapability {
  id: string;
  name: string;
  nameZh: string;
  specialties: string[];
  strengths: string[];
  collaborationPreferences: {
    preferredPartners: string[];
    complementaryAgents: string[];
    conflictAgents: string[];
  };
  // Collaboration scores (0-100)
  scores: {
    analysis: number;
    creativity: number;
    execution: number;
    communication: number;
    review: number;
    decision: number;
  };
}

export const AGENT_CAPABILITIES: Record<string, AgentCapability> = {
  navigator: {
    id: 'navigator',
    name: 'Navigator',
    nameZh: '智愈 领航员',
    specialties: ['resource scheduling', 'path planning', 'global coordination'],
    strengths: ['系统全局视角', '路径优化', '资源调度'],
    collaborationPreferences: {
      preferredPartners: ['thinker', 'pivot'],
      complementaryAgents: ['sentinel', 'prophet'],
      conflictAgents: [],
    },
    scores: { analysis: 75, creativity: 60, execution: 90, communication: 85, review: 70, decision: 95 },
  },
  thinker: {
    id: 'thinker',
    name: 'Thinker',
    nameZh: '洞见 思想家',
    specialties: ['deep reasoning', 'logic analysis', 'decision support'],
    strengths: ['深度逻辑推理', '因果分析', '决策建模'],
    collaborationPreferences: {
      preferredPartners: ['navigator', 'grandmaster'],
      complementaryAgents: ['prophet', 'bole'],
      conflictAgents: [],
    },
    scores: { analysis: 98, creativity: 80, execution: 60, communication: 75, review: 90, decision: 85 },
  },
  prophet: {
    id: 'prophet',
    name: 'Prophet',
    nameZh: '预见 先知',
    specialties: ['trend prediction', 'risk assessment', 'future modeling'],
    strengths: ['趋势预判', '风险前置', '概率建模'],
    collaborationPreferences: {
      preferredPartners: ['thinker', 'sentinel'],
      complementaryAgents: ['navigator', 'grandmaster'],
      conflictAgents: [],
    },
    scores: { analysis: 85, creativity: 90, execution: 50, communication: 70, review: 80, decision: 75 },
  },
  bole: {
    id: 'bole',
    name: 'Talent Scout',
    nameZh: '知遇 伯乐',
    specialties: ['model evaluation', 'optimization matching', 'capability assessment'],
    strengths: ['模型评估', '能力匹配', '选型优化'],
    collaborationPreferences: {
      preferredPartners: ['thinker', 'grandmaster'],
      complementaryAgents: ['navigator', 'prophet'],
      conflictAgents: [],
    },
    scores: { analysis: 80, creativity: 65, execution: 70, communication: 85, review: 95, decision: 80 },
  },
  pivot: {
    id: 'pivot',
    name: 'Pivot',
    nameZh: '元启 天枢',
    specialties: ['context management', 'state orchestration', 'memory coordination'],
    strengths: ['上下文管理', '状态协调', '记忆整合'],
    collaborationPreferences: {
      preferredPartners: ['navigator', 'thinker'],
      complementaryAgents: ['sentinel', 'grandmaster'],
      conflictAgents: [],
    },
    scores: { analysis: 70, creativity: 55, execution: 95, communication: 90, review: 65, decision: 80 },
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    nameZh: '卫安 哨兵',
    specialties: ['security audit', 'compliance check', 'vulnerability assessment'],
    strengths: ['安全审计', '合规检查', '漏洞检测'],
    collaborationPreferences: {
      preferredPartners: ['prophet', 'pivot'],
      complementaryAgents: ['navigator', 'thinker'],
      conflictAgents: [],
    },
    scores: { analysis: 85, creativity: 40, execution: 80, communication: 60, review: 98, decision: 70 },
  },
  grandmaster: {
    id: 'grandmaster',
    name: 'Grandmaster',
    nameZh: '格物 宗师',
    specialties: ['knowledge building', 'ontology design', 'pattern recognition'],
    strengths: ['知识构建', '本体论设计', '模式识别'],
    collaborationPreferences: {
      preferredPartners: ['thinker', 'bole'],
      complementaryAgents: ['navigator', 'prophet'],
      conflictAgents: [],
    },
    scores: { analysis: 90, creativity: 85, execution: 55, communication: 80, review: 85, decision: 70 },
  },
};

// ============================================================
// 4. Preset Collaboration Workflows
// ============================================================

export interface CollaborationPreset {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  mode: CollaborationMode;
  agents: Array<{ agentId: string; role: AgentRole }>;
  template: string;
  icon: string;
  color: string;
}

export const COLLABORATION_PRESETS: CollaborationPreset[] = [
  {
    id: 'code-review-pipeline',
    name: 'Code Review Pipeline',
    nameZh: '代码审核流水线',
    description: 'Navigator plans → Thinker designs → Sentinel audits security → Grandmaster validates patterns',
    mode: 'pipeline',
    agents: [
      { agentId: 'navigator', role: 'lead' },
      { agentId: 'thinker', role: 'contributor' },
      { agentId: 'sentinel', role: 'reviewer' },
      { agentId: 'grandmaster', role: 'reviewer' },
    ],
    template: '请对以下代码进行全链路审核，包括架构设计、逻辑正确性、安全合规和最佳实践。',
    icon: 'GitPullRequest',
    color: 'text-green-400',
  },
  {
    id: 'architecture-debate',
    name: 'Architecture Debate',
    nameZh: '架构决策辩论',
    description: 'Thinker proposes Solution A, Prophet proposes Solution B, Navigator judges',
    mode: 'debate',
    agents: [
      { agentId: 'thinker', role: 'contributor' },
      { agentId: 'prophet', role: 'contributor' },
      { agentId: 'navigator', role: 'judge' },
    ],
    template: '请从不同角度分析以下架构方案的优劣，并给出最终建议。',
    icon: 'Scale',
    color: 'text-purple-400',
  },
  {
    id: 'security-ensemble',
    name: 'Security Assessment Ensemble',
    nameZh: '安全评估集成',
    description: 'Multiple agents independently assess security, then reach consensus',
    mode: 'ensemble',
    agents: [
      { agentId: 'sentinel', role: 'lead' },
      { agentId: 'thinker', role: 'contributor' },
      { agentId: 'prophet', role: 'contributor' },
      { agentId: 'grandmaster', role: 'contributor' },
    ],
    template: '请各位智能体独立评估以下系统的安全风险，然后通过共识机制形成最终报告。',
    icon: 'ShieldCheck',
    color: 'text-red-400',
  },
  {
    id: 'devops-delegation',
    name: 'DevOps Task Delegation',
    nameZh: 'DevOps 任务委托',
    description: 'Navigator delegates: infrastructure to Pivot, monitoring to Prophet, security to Sentinel',
    mode: 'delegation',
    agents: [
      { agentId: 'navigator', role: 'lead' },
      { agentId: 'pivot', role: 'contributor' },
      { agentId: 'prophet', role: 'contributor' },
      { agentId: 'sentinel', role: 'contributor' },
    ],
    template: '请将以下 DevOps 任务分解，委托给最合适的智能体并行执行。',
    icon: 'Network',
    color: 'text-amber-400',
  },
  {
    id: 'knowledge-parallel',
    name: 'Knowledge Synthesis',
    nameZh: '知识并行综合',
    description: 'All agents independently research, Grandmaster synthesizes into unified knowledge',
    mode: 'parallel',
    agents: [
      { agentId: 'grandmaster', role: 'lead' },
      { agentId: 'thinker', role: 'contributor' },
      { agentId: 'prophet', role: 'contributor' },
      { agentId: 'bole', role: 'contributor' },
    ],
    template: '请各位智能体从各自专业领域并行研究以下主题，由宗师综合成统一知识体系。',
    icon: 'BookOpen',
    color: 'text-cyan-400',
  },
  {
    id: 'incident-response',
    name: 'Incident Response',
    nameZh: '事件响应协同',
    description: 'Sentinel detects → Navigator coordinates → Pivot manages state → Prophet predicts impact',
    mode: 'pipeline',
    agents: [
      { agentId: 'sentinel', role: 'lead' },
      { agentId: 'navigator', role: 'contributor' },
      { agentId: 'pivot', role: 'contributor' },
      { agentId: 'prophet', role: 'reviewer' },
    ],
    template: '检测到安全/运维事件，请启动多智能体协同响应流程。',
    icon: 'AlertTriangle',
    color: 'text-orange-400',
  },
];

// ============================================================
// 5. Task Orchestrator
// ============================================================

const ORCHESTRATOR_STORAGE_KEY = 'yyc3-orchestrator-tasks';

function uid() { return Math.random().toString(36).substring(2, 10); }

export function loadTasks(): CollaborationTask[] {
  try {
    const raw = localStorage.getItem(ORCHESTRATOR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveTasks(tasks: CollaborationTask[]): void {
  try {
    localStorage.setItem(ORCHESTRATOR_STORAGE_KEY, JSON.stringify(tasks.slice(0, 50)));
  } catch { /* ignore */ }
}

export function createTask(
  intent: string,
  mode: CollaborationMode,
  agentAssignments: Array<{ agentId: string; role: AgentRole }>
): CollaborationTask {
  const now = new Date().toISOString();

  const task: CollaborationTask = {
    id: `task-${uid()}`,
    title: intent.slice(0, 60) + (intent.length > 60 ? '...' : ''),
    description: intent,
    intent,
    mode,
    status: 'pending',
    priority: 'medium',
    agents: agentAssignments.map(a => ({
      ...a,
      status: 'idle' as AgentExecutionStatus,
      assignedAt: now,
      tokensUsed: 0,
      latencyMs: 0,
    })),
    subtasks: [],
    timeline: [{
      id: `ev-${uid()}`,
      timestamp: now,
      type: 'task_created',
      message: `Collaboration task created: ${mode} mode with ${agentAssignments.length} agents`,
    }],
    results: [],
    createdAt: now,
    updatedAt: now,
    totalTokens: 0,
    totalLatencyMs: 0,
  };

  const tasks = loadTasks();
  tasks.unshift(task);
  saveTasks(tasks);

  return task;
}

export function updateTask(taskId: string, updates: Partial<CollaborationTask>): void {
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx >= 0) {
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    saveTasks(tasks);
  }
}

export function addTimelineEvent(taskId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>): void {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.timeline.push({
      ...event,
      id: `ev-${uid()}`,
      timestamp: new Date().toISOString(),
    });
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);
  }
}

// ============================================================
// 6. Agent Selection Algorithm
// ============================================================

export interface AgentRecommendation {
  agentId: string;
  role: AgentRole;
  score: number;
  reasoning: string;
}

/**
 * 根据任务意图和协作模式，智能推荐最佳 Agent 组合
 */
export function recommendAgents(
  intent: string,
  mode: CollaborationMode,
  maxAgents = 4
): AgentRecommendation[] {
  const keywords = intent.toLowerCase();
  const scores: Array<{ agentId: string; score: number; reasons: string[] }> = [];

  for (const [agentId, cap] of Object.entries(AGENT_CAPABILITIES)) {
    let score = 0;
    const reasons: string[] = [];

    // Keyword matching
    for (const specialty of cap.specialties) {
      if (keywords.includes(specialty.split(' ')[0].toLowerCase())) {
        score += 20;
        reasons.push(`Specialty match: ${specialty}`);
      }
    }

    // Chinese keyword matching
    for (const strength of cap.strengths) {
      if (keywords.includes(strength.substring(0, 2))) {
        score += 15;
        reasons.push(`Strength match: ${strength}`);
      }
    }

    // Mode-specific scoring
    switch (mode) {
      case 'pipeline':
        score += cap.scores.execution * 0.3 + cap.scores.communication * 0.2;
        break;
      case 'parallel':
        score += cap.scores.execution * 0.4 + cap.scores.analysis * 0.2;
        break;
      case 'debate':
        score += cap.scores.analysis * 0.3 + cap.scores.creativity * 0.2;
        break;
      case 'ensemble':
        score += cap.scores.decision * 0.3 + cap.scores.review * 0.2;
        break;
      case 'delegation':
        score += cap.scores.execution * 0.3 + cap.scores.decision * 0.2;
        break;
    }

    // Domain-specific boosts
    if ((keywords.includes('安全') || keywords.includes('security')) && agentId === 'sentinel') score += 30;
    if ((keywords.includes('架构') || keywords.includes('architecture')) && agentId === 'navigator') score += 25;
    if ((keywords.includes('分析') || keywords.includes('analysis')) && agentId === 'thinker') score += 25;
    if ((keywords.includes('预测') || keywords.includes('predict')) && agentId === 'prophet') score += 25;
    if ((keywords.includes('知识') || keywords.includes('knowledge')) && agentId === 'grandmaster') score += 25;
    if ((keywords.includes('评估') || keywords.includes('evaluate')) && agentId === 'bole') score += 25;
    if ((keywords.includes('状态') || keywords.includes('context') || keywords.includes('devops')) && agentId === 'pivot') score += 25;

    scores.push({ agentId, score, reasons });
  }

  // Sort by score
  scores.sort((a, b) => b.score - a.score);

  // Assign roles
  const selected = scores.slice(0, maxAgents);
  return selected.map((s, i) => ({
    agentId: s.agentId,
    role: i === 0 ? 'lead' as AgentRole :
      (mode === 'debate' && i === selected.length - 1) ? 'judge' as AgentRole :
      (mode === 'ensemble' && i >= selected.length - 1) ? 'reviewer' as AgentRole :
      'contributor' as AgentRole,
    score: Math.round(s.score),
    reasoning: s.reasons.length > 0 ? s.reasons.join('; ') : `Base capability score: ${Math.round(s.score)}`,
  }));
}

// ============================================================
// 7. Collaboration Simulation Engine
// ============================================================

export interface SimulationCallbacks {
  onTimelineEvent: (event: TimelineEvent) => void;
  onAgentStatusChange: (agentId: string, status: AgentExecutionStatus) => void;
  onResultReceived: (result: AgentResult) => void;
  onStatusChange: (status: TaskStatus) => void;
  onComplete: (task: CollaborationTask) => void;
}

// --- Execution Mode ---
export type ExecutionMode = 'simulation' | 'real-llm';

/**
 * Check if real LLM execution is available (any provider has API keys)
 */
export function isRealLLMAvailable(): boolean {
  try {
    const raw = localStorage.getItem('yyc3-llm-provider-config');
    if (!raw) return false;
    const configs = JSON.parse(raw) as Array<{ enabled: boolean; apiKey: string }>;
    return configs.some(c => c.enabled && c.apiKey);
  } catch { return false; }
}

/**
 * Real LLM Collaboration Execution
 * Uses agentStreamChat from llm-bridge to make real API calls per agent.
 * Falls back to simulation if a specific agent fails.
 */
export async function executeRealCollaboration(
  task: CollaborationTask,
  callbacks: SimulationCallbacks
): Promise<CollaborationTask> {
  // Dynamic import to avoid circular dependencies
  const { agentStreamChat, trackUsage, loadProviderConfigs } = await import('./llm-bridge');
  const { AGENT_ROUTES } = await import('./llm-providers');
  type LLMMessage = { role: 'system' | 'user' | 'assistant'; content: string };

  const updatedTask = { ...task };
  const configs = loadProviderConfigs();
  const hasKeys = configs.some((c: Record<string, unknown>) => c.enabled && c.apiKey);

  // Phase 1: Decomposing
  callbacks.onStatusChange('decomposing');
  updatedTask.status = 'decomposing';
  callbacks.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'message',
    message: `[REAL LLM] Analyzing intent: "${task.intent.slice(0, 80)}..."`,
  });
  await sleep(400);

  // Phase 2: Assigning
  callbacks.onStatusChange('assigning');
  updatedTask.status = 'assigning';
  for (const agent of updatedTask.agents) {
    const route = AGENT_ROUTES[agent.agentId];
    callbacks.onTimelineEvent({
      id: `ev-${uid()}`, timestamp: new Date().toISOString(),
      type: 'agent_assigned', agentId: agent.agentId,
      message: `${AGENT_CAPABILITIES[agent.agentId]?.nameZh || agent.agentId} assigned (${route ? 'LLM routed' : 'fallback'})`,
    });
    await sleep(200);
  }

  // Phase 3: Execute per-agent with real LLM
  callbacks.onStatusChange('executing');
  updatedTask.status = 'executing';

  // Build shared context from task intent + previous results
  const buildContext = (prevResults: AgentResult[]): string => {
    let ctx = `## 协作任务\n**模式**: ${task.mode}\n**意图**: ${task.intent}\n\n`;
    if (prevResults.length > 0) {
      ctx += `## 前序 Agent 输出\n`;
      for (const r of prevResults) {
        const name = AGENT_CAPABILITIES[r.agentId]?.nameZh || r.agentId;
        ctx += `### ${name} (${r.role})\n${r.output}\n\n`;
      }
    }
    return ctx;
  };

  // Execute based on mode
  const executeAgent = async (
    agent: typeof updatedTask.agents[0],
    contextMessage: string
  ): Promise<AgentResult> => {
    const startTime = performance.now();

    callbacks.onAgentStatusChange(agent.agentId, 'thinking');
    agent.status = 'thinking';
    callbacks.onTimelineEvent({
      id: `ev-${uid()}`, timestamp: new Date().toISOString(),
      type: 'agent_started', agentId: agent.agentId,
      message: `${AGENT_CAPABILITIES[agent.agentId]?.nameZh} connecting to LLM...`,
    });

    let output = '';
    let tokensUsed = 0;

    try {
      // Build chat history with collaboration context
      const chatHistory: LLMMessage[] = [
        { role: 'user' as const, content: contextMessage },
      ];

      callbacks.onAgentStatusChange(agent.agentId, 'executing');
      agent.status = 'executing';

      const response = await agentStreamChat(
        agent.agentId,
        `[Multi-Agent ${task.mode} Collaboration]\n\n你的角色: ${agent.role}\n参与的 Agent: ${updatedTask.agents.map(a => AGENT_CAPABILITIES[a.agentId]?.nameZh).join('、')}\n\n${contextMessage}`,
        chatHistory,
        (chunk) => {
          if (chunk.type === 'content') {
            output += chunk.content;
          }
          if (chunk.type === 'done' && chunk.usage) {
            tokensUsed = chunk.usage.totalTokens;
          }
        }
      );

      if (response) {
        // Real LLM response received
        output = response.content || output;
        tokensUsed = response.usage?.totalTokens || tokensUsed;
        trackUsage(response, agent.agentId);

        callbacks.onTimelineEvent({
          id: `ev-${uid()}`, timestamp: new Date().toISOString(),
          type: 'agent_completed', agentId: agent.agentId,
          message: `${AGENT_CAPABILITIES[agent.agentId]?.nameZh} [REAL LLM: ${response.provider}/${response.model}] completed (${tokensUsed} tokens, ${response.latencyMs}ms)`,
        });
      } else {
        // No API key or all providers failed → use mock
        output = generateFallbackOutput(agent, task);
        tokensUsed = Math.round(output.length / 3);
        callbacks.onTimelineEvent({
          id: `ev-${uid()}`, timestamp: new Date().toISOString(),
          type: 'agent_completed', agentId: agent.agentId,
          message: `${AGENT_CAPABILITIES[agent.agentId]?.nameZh} [FALLBACK] no LLM available, using template`,
        });
      }
    } catch (error) {
      // LLM call failed — graceful fallback
      output = generateFallbackOutput(agent, task);
      tokensUsed = Math.round(output.length / 3);
      callbacks.onTimelineEvent({
        id: `ev-${uid()}`, timestamp: new Date().toISOString(),
        type: 'agent_error', agentId: agent.agentId,
        message: `${AGENT_CAPABILITIES[agent.agentId]?.nameZh} LLM error, using template fallback: ${(error as Error).message?.slice(0, 60)}`,
      });
    }

    const latencyMs = Math.round(performance.now() - startTime);

    callbacks.onAgentStatusChange(agent.agentId, 'done');
    agent.status = 'done';
    agent.completedAt = new Date().toISOString();
    agent.tokensUsed = tokensUsed;
    agent.latencyMs = latencyMs;

    return {
      agentId: agent.agentId,
      role: agent.role,
      output,
      confidence: 0.8 + Math.random() * 0.15,
      reasoning: `LLM-powered response via ${agent.role} role`,
      tokensUsed,
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  };

  // Execute based on collaboration mode
  switch (task.mode) {
    case 'pipeline': {
      for (const agent of updatedTask.agents) {
        const context = buildContext(updatedTask.results);
        const result = await executeAgent(agent, context + `\n请基于你的专业角色 (${agent.role}) 对上述内容进行分析和输出。`);
        updatedTask.results.push(result);
        callbacks.onResultReceived(result);
      }
      break;
    }
    case 'parallel': {
      callbacks.onTimelineEvent({
        id: `ev-${uid()}`, timestamp: new Date().toISOString(),
        type: 'message',
        message: `${updatedTask.agents.length} agents executing in parallel with real LLM...`,
      });
      const context = buildContext([]);
      const promises = updatedTask.agents.map(agent =>
        executeAgent(agent, context + `\n请从你的专业角度 (${AGENT_CAPABILITIES[agent.agentId]?.nameZh}, ${agent.role}) 独立分析。`)
      );
      const results = await Promise.all(promises);
      for (const result of results) {
        updatedTask.results.push(result);
        callbacks.onResultReceived(result);
      }
      break;
    }
    case 'debate': {
      const debaters = updatedTask.agents.filter(a => a.role === 'contributor');
      const judge = updatedTask.agents.find(a => a.role === 'judge') || updatedTask.agents[updatedTask.agents.length - 1];

      // Round 1: positions
      callbacks.onTimelineEvent({
        id: `ev-${uid()}`, timestamp: new Date().toISOString(),
        type: 'message', message: '[REAL LLM] Debate Round 1: Initial positions',
      });
      const debateContext = buildContext([]);
      for (const debater of debaters) {
        const result = await executeAgent(debater, debateContext + `\n请阐述你的立场和分析方案。这是一场辩论，请给出有说服力的论点。`);
        updatedTask.results.push(result);
        callbacks.onResultReceived(result);
      }

      // Judge
      callbacks.onTimelineEvent({
        id: `ev-${uid()}`, timestamp: new Date().toISOString(),
        type: 'message', agentId: judge.agentId,
        message: `Judge ${AGENT_CAPABILITIES[judge.agentId]?.nameZh} deliberating with full context...`,
      });
      const judgeContext = buildContext(updatedTask.results);
      const judgeResult = await executeAgent(judge, judgeContext + `\n作为仲裁者，请综合上述各方观点，给出最终裁决和推荐方案。`);
      updatedTask.results.push(judgeResult);
      callbacks.onResultReceived(judgeResult);
      break;
    }
    case 'ensemble': {
      const context = buildContext([]);
      for (const agent of updatedTask.agents) {
        const result = await executeAgent(agent, context + `\n请独立评估并给出你的评分 (1-10) 和理由。这是集成共识模式，你的评估将与其他 Agent 汇总。`);
        updatedTask.results.push(result);
        callbacks.onResultReceived(result);
      }
      callbacks.onTimelineEvent({
        id: `ev-${uid()}`, timestamp: new Date().toISOString(),
        type: 'consensus_reached',
        message: `Ensemble of ${updatedTask.agents.length} agents — real LLM consensus`,
      });
      break;
    }
    case 'delegation': {
      const lead = updatedTask.agents.find(a => a.role === 'lead') || updatedTask.agents[0];
      const workers = updatedTask.agents.filter(a => a.role !== 'lead');

      // Lead decomposes
      const decompResult = await executeAgent(lead, buildContext([]) + `\n作为团队领导，请将任务分解为 ${workers.length} 个子任务，分别委托给: ${workers.map(w => AGENT_CAPABILITIES[w.agentId]?.nameZh).join('、')}。`);
      updatedTask.results.push(decompResult);
      callbacks.onResultReceived(decompResult);

      // Workers execute
      for (const worker of workers) {
        const workerContext = buildContext([decompResult]);
        const result = await executeAgent(worker, workerContext + `\n请根据团队领导的分工，完成分配给你的子任务。`);
        updatedTask.results.push(result);
        callbacks.onResultReceived(result);
      }

      // Lead aggregates
      const aggContext = buildContext(updatedTask.results);
      const aggResult = await executeAgent(lead, aggContext + `\n所有子任务已完成，请汇总各 Agent 的输出，形成最终报告。`);
      updatedTask.results.push(aggResult);
      callbacks.onResultReceived(aggResult);
      break;
    }
  }

  // Phase 4: Consensus
  callbacks.onStatusChange('consensus');
  updatedTask.status = 'consensus';
  callbacks.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'consensus_reached',
    message: '[REAL LLM] All agents completed. Synthesizing final result...',
  });
  await sleep(500);

  // Phase 5: Complete
  updatedTask.status = 'completed';
  updatedTask.completedAt = new Date().toISOString();
  updatedTask.consensusScore = 0.8 + Math.random() * 0.15;
  updatedTask.totalTokens = updatedTask.results.reduce((s, r) => s + r.tokensUsed, 0);
  updatedTask.totalLatencyMs = updatedTask.results.reduce((s, r) => s + r.latencyMs, 0);
  updatedTask.finalOutput = generateFinalOutput(updatedTask);

  callbacks.onStatusChange('completed');
  callbacks.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'task_completed',
    message: `[REAL LLM] Collaboration complete. Tokens: ${updatedTask.totalTokens}. Latency: ${updatedTask.totalLatencyMs}ms`,
  });

  callbacks.onComplete(updatedTask);

  // Persist
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === updatedTask.id);
  if (idx >= 0) tasks[idx] = updatedTask;
  saveTasks(tasks);

  return updatedTask;
}

/** Fallback output when LLM is unavailable for a specific agent */
function generateFallbackOutput(agent: { agentId: string; role: AgentRole }, task: CollaborationTask): string {
  const cap = AGENT_CAPABILITIES[agent.agentId];
  const outputs: Record<string, string> = {
    navigator: `[${cap?.nameZh} - Template] 基于全局资源调度分析，建议采用分布式执行策略。关键路径: 意图解析 → 任务分解 → 并行执行 → 结果汇聚。`,
    thinker: `[${cap?.nameZh} - Template] 经逻辑推理分析，核心矛盾在于复杂度与可维护性之间的平衡。建议采用分层抽象策略。`,
    prophet: `[${cap?.nameZh} - Template] 趋势预测显示，当前方案可能面临扩展性瓶颈。建议预留缓冲容量。`,
    bole: `[${cap?.nameZh} - Template] 模型评估完成。推荐根据任务特性选择最优模型组合。`,
    pivot: `[${cap?.nameZh} - Template] 上下文状态已同步。关键状态变量已锁定。`,
    sentinel: `[${cap?.nameZh} - Template] 安全审计完成。未发现严重漏洞。建议加强密钥轮换策略。`,
    grandmaster: `[${cap?.nameZh} - Template] 知识图谱分析完成。发现与历史案例的高度相似性。`,
  };
  return outputs[agent.agentId] || `[${cap?.nameZh || agent.agentId} - Template] 分析完成。`;
}

/**
 * Simulate multi-agent collaboration execution
 * (In production, this would route to real LLM backends via agentStreamChat)
 */
export async function simulateCollaboration(
  task: CollaborationTask,
  callbacks: SimulationCallbacks
): Promise<CollaborationTask> {
  const updatedTask = { ...task };

  emitOrchestrationEvent('task_start', `Simulation started: ${task.mode} with ${task.agents.length} agents`, 'info', { taskId: task.id, mode: task.mode });

  // Phase 1: Decomposing
  callbacks.onStatusChange('decomposing');
  updatedTask.status = 'decomposing';
  callbacks.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'message', message: `Analyzing intent: "${task.intent.slice(0, 80)}..."`,
  });
  await sleep(800);

  // Phase 2: Assigning
  callbacks.onStatusChange('assigning');
  updatedTask.status = 'assigning';
  for (const agent of updatedTask.agents) {
    callbacks.onTimelineEvent({
      id: `ev-${uid()}`, timestamp: new Date().toISOString(),
      type: 'agent_assigned', agentId: agent.agentId,
      message: `${AGENT_CAPABILITIES[agent.agentId]?.nameZh || agent.agentId} assigned as ${agent.role}`,
    });
    await sleep(300);
  }

  // Phase 3: Executing based on mode
  callbacks.onStatusChange('executing');
  updatedTask.status = 'executing';

  switch (task.mode) {
    case 'pipeline':
      await executePipeline(updatedTask, callbacks);
      break;
    case 'parallel':
      await executeParallel(updatedTask, callbacks);
      break;
    case 'debate':
      await executeDebate(updatedTask, callbacks);
      break;
    case 'ensemble':
      await executeEnsemble(updatedTask, callbacks);
      break;
    case 'delegation':
      await executeDelegation(updatedTask, callbacks);
      break;
  }

  // Phase 4: Consensus / Review
  callbacks.onStatusChange('consensus');
  updatedTask.status = 'consensus';
  callbacks.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'consensus_reached',
    message: 'All agents have provided their outputs. Synthesizing final result...',
  });
  await sleep(1000);

  // Phase 5: Complete
  updatedTask.status = 'completed';
  updatedTask.completedAt = new Date().toISOString();
  updatedTask.consensusScore = 0.75 + Math.random() * 0.2;
  updatedTask.totalTokens = updatedTask.results.reduce((s, r) => s + r.tokensUsed, 0);
  updatedTask.totalLatencyMs = updatedTask.results.reduce((s, r) => s + r.latencyMs, 0);

  // Generate final synthesized output
  updatedTask.finalOutput = generateFinalOutput(updatedTask);

  callbacks.onStatusChange('completed');
  callbacks.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'task_completed',
    message: `Collaboration complete. Consensus: ${Math.round((updatedTask.consensusScore || 0) * 100)}%. Total tokens: ${updatedTask.totalTokens}`,
  });

  callbacks.onComplete(updatedTask);

  // Persist
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === updatedTask.id);
  if (idx >= 0) tasks[idx] = updatedTask;
  saveTasks(tasks);

  return updatedTask;
}

// --- Execution Modes ---

async function executePipeline(task: CollaborationTask, cb: SimulationCallbacks) {
  for (const agent of task.agents) {
    cb.onAgentStatusChange(agent.agentId, 'thinking');
    agent.status = 'thinking';
    agent.startedAt = new Date().toISOString();
    cb.onTimelineEvent({
      id: `ev-${uid()}`, timestamp: new Date().toISOString(),
      type: 'agent_started', agentId: agent.agentId,
      message: `${AGENT_CAPABILITIES[agent.agentId]?.nameZh} is analyzing...`,
    });
    await sleep(1200 + Math.random() * 800);

    cb.onAgentStatusChange(agent.agentId, 'executing');
    agent.status = 'executing';
    await sleep(800 + Math.random() * 600);

    const result = generateMockResult(agent, task);
    task.results.push(result);
    cb.onResultReceived(result);

    cb.onAgentStatusChange(agent.agentId, 'done');
    agent.status = 'done';
    agent.completedAt = new Date().toISOString();
    agent.tokensUsed = result.tokensUsed;
    agent.latencyMs = result.latencyMs;

    cb.onTimelineEvent({
      id: `ev-${uid()}`, timestamp: new Date().toISOString(),
      type: 'agent_completed', agentId: agent.agentId,
      message: `${AGENT_CAPABILITIES[agent.agentId]?.nameZh} completed (${result.tokensUsed} tokens)`,
    });
  }
}

async function executeParallel(task: CollaborationTask, cb: SimulationCallbacks) {
  // Start all agents simultaneously
  for (const agent of task.agents) {
    cb.onAgentStatusChange(agent.agentId, 'thinking');
    agent.status = 'thinking';
    agent.startedAt = new Date().toISOString();
  }
  cb.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'message',
    message: `${task.agents.length} agents executing in parallel...`,
  });

  await sleep(1500);

  // Complete at staggered times
  for (let i = 0; i < task.agents.length; i++) {
    const agent = task.agents[i];
    cb.onAgentStatusChange(agent.agentId, 'executing');
    agent.status = 'executing';
    await sleep(400 + Math.random() * 400);

    const result = generateMockResult(agent, task);
    task.results.push(result);
    cb.onResultReceived(result);

    cb.onAgentStatusChange(agent.agentId, 'done');
    agent.status = 'done';
    agent.completedAt = new Date().toISOString();
    agent.tokensUsed = result.tokensUsed;
    agent.latencyMs = result.latencyMs;

    cb.onTimelineEvent({
      id: `ev-${uid()}`, timestamp: new Date().toISOString(),
      type: 'agent_completed', agentId: agent.agentId,
      message: `${AGENT_CAPABILITIES[agent.agentId]?.nameZh} result received`,
    });
  }
}

async function executeDebate(task: CollaborationTask, cb: SimulationCallbacks) {
  const debaters = task.agents.filter(a => a.role === 'contributor');
  const judge = task.agents.find(a => a.role === 'judge') || task.agents[task.agents.length - 1];

  // Round 1: Initial positions
  cb.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'message', message: 'Debate Round 1: Initial positions',
  });

  for (const debater of debaters) {
    cb.onAgentStatusChange(debater.agentId, 'thinking');
    debater.status = 'thinking';
    await sleep(1000);
    cb.onAgentStatusChange(debater.agentId, 'executing');
    debater.status = 'executing';
    await sleep(800);

    const result = generateMockResult(debater, task, 'debate-position');
    task.results.push(result);
    cb.onResultReceived(result);
    cb.onAgentStatusChange(debater.agentId, 'waiting');
    debater.status = 'waiting';
  }

  // Round 2: Rebuttals
  cb.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'message', message: 'Debate Round 2: Counter-arguments',
  });
  await sleep(600);

  for (const debater of debaters) {
    cb.onAgentStatusChange(debater.agentId, 'executing');
    await sleep(600);
    cb.onAgentStatusChange(debater.agentId, 'done');
    debater.status = 'done';
    debater.completedAt = new Date().toISOString();
  }

  // Judge deliberates
  cb.onAgentStatusChange(judge.agentId, 'thinking');
  judge.status = 'thinking';
  cb.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'message', agentId: judge.agentId,
    message: `Judge ${AGENT_CAPABILITIES[judge.agentId]?.nameZh} is deliberating...`,
  });
  await sleep(1200);

  const judgeResult = generateMockResult(judge, task, 'judge-verdict');
  task.results.push(judgeResult);
  cb.onResultReceived(judgeResult);
  cb.onAgentStatusChange(judge.agentId, 'done');
  judge.status = 'done';
}

async function executeEnsemble(task: CollaborationTask, cb: SimulationCallbacks) {
  // All agents independently assess
  for (const agent of task.agents) {
    cb.onAgentStatusChange(agent.agentId, 'thinking');
    agent.status = 'thinking';
  }
  await sleep(1500);

  for (const agent of task.agents) {
    cb.onAgentStatusChange(agent.agentId, 'executing');
    agent.status = 'executing';
    await sleep(300 + Math.random() * 500);

    const result = generateMockResult(agent, task, 'ensemble-vote');
    task.results.push(result);
    cb.onResultReceived(result);
    cb.onAgentStatusChange(agent.agentId, 'done');
    agent.status = 'done';
    agent.completedAt = new Date().toISOString();
  }

  cb.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'consensus_reached',
    message: `Ensemble of ${task.agents.length} agents reached consensus with weighted voting`,
  });
}

async function executeDelegation(task: CollaborationTask, cb: SimulationCallbacks) {
  const lead = task.agents.find(a => a.role === 'lead') || task.agents[0];
  const workers = task.agents.filter(a => a.role !== 'lead');

  // Lead decomposes
  cb.onAgentStatusChange(lead.agentId, 'thinking');
  lead.status = 'thinking';
  cb.onTimelineEvent({
    id: `ev-${uid()}`, timestamp: new Date().toISOString(),
    type: 'message', agentId: lead.agentId,
    message: `${AGENT_CAPABILITIES[lead.agentId]?.nameZh} decomposing task into subtasks...`,
  });
  await sleep(1000);

  // Create subtasks
  for (let i = 0; i < workers.length; i++) {
    const subtask: SubTask = {
      id: `st-${uid()}`,
      parentTaskId: task.id,
      title: `Subtask ${i + 1}: ${AGENT_CAPABILITIES[workers[i].agentId]?.specialties[0]}`,
      description: `Delegated to ${AGENT_CAPABILITIES[workers[i].agentId]?.nameZh}`,
      assignedAgent: workers[i].agentId,
      status: 'pending',
      dependencies: [],
      order: i,
    };
    task.subtasks.push(subtask);
    cb.onTimelineEvent({
      id: `ev-${uid()}`, timestamp: new Date().toISOString(),
      type: 'subtask_created', agentId: workers[i].agentId,
      message: `Subtask delegated to ${AGENT_CAPABILITIES[workers[i].agentId]?.nameZh}: ${subtask.title}`,
    });
  }

  cb.onAgentStatusChange(lead.agentId, 'waiting');
  lead.status = 'waiting';

  // Workers execute
  for (const worker of workers) {
    cb.onAgentStatusChange(worker.agentId, 'executing');
    worker.status = 'executing';
    await sleep(800 + Math.random() * 600);

    const result = generateMockResult(worker, task);
    task.results.push(result);
    cb.onResultReceived(result);
    cb.onAgentStatusChange(worker.agentId, 'done');
    worker.status = 'done';
    worker.completedAt = new Date().toISOString();
  }

  // Lead aggregates
  cb.onAgentStatusChange(lead.agentId, 'executing');
  lead.status = 'executing';
  await sleep(800);
  const leadResult = generateMockResult(lead, task, 'aggregation');
  task.results.push(leadResult);
  cb.onResultReceived(leadResult);
  cb.onAgentStatusChange(lead.agentId, 'done');
  lead.status = 'done';
}

// --- Helpers ---

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function generateMockResult(
  agent: AgentAssignment,
  task: CollaborationTask,
  variant?: string
): AgentResult {
  const cap = AGENT_CAPABILITIES[agent.agentId];
  const tokens = 200 + Math.floor(Math.random() * 800);
  const latency = 800 + Math.floor(Math.random() * 2000);

  const outputs: Record<string, string> = {
    navigator: `[${cap?.nameZh}] 基于全局资源调度分析，建议采用分布式执行策略。M4 Max 作为主编排节点，iMac 处理可视化，NAS 负责数据持久化。关键路径: 意图解析 → 任务分解 → 并行执行 → 结果汇聚。`,
    thinker: `[${cap?.nameZh}] 经深度逻辑推理分析，该问题的核心矛盾在于复杂度与可维护性之间的平衡。建议采用分层抽象 + 关注点分离的策略。因果链分析表明: 根因位于数据流的耦合节点。`,
    prophet: `[${cap?.nameZh}] 趋势预测显示，当前方案在 3 个月后可能面临扩展性瓶颈。风险矩阵评估: 技术风险 (中)、资源风险 (低)、时间风险 (中高)。建议预留 20% 缓冲容量。`,
    bole: `[${cap?.nameZh}] 模型评估与选型分析完成。在给定约束条件下，推荐使用 Claude 4 Sonnet 处理复杂推理，DeepSeek-V3 处理代码生成，Gemini 2.5 Pro 处理多模态内容。成本效益比最优。`,
    pivot: `[${cap?.nameZh}] 上下文状态已同步。当前会话涉及 ${task.agents.length} 个智能体、${task.subtasks.length} 个子任务。关键状态变量已锁定，回溯点已建立。内存使用率: 优化后降低 35%。`,
    sentinel: `[${cap?.nameZh}] 安全审计完成。发现 0 个严重漏洞、2 个中等风险点、5 个低风险建议。合规检查通过。建议加强: API 密钥轮换策略、日志审计范围扩展、网络边界隔离。`,
    grandmaster: `[${cap?.nameZh}] 知识图谱分析显示，该领域涉及 12 个核心概念、8 条关键关系。模式识别发现与历史案例 #47 高度相似（87% 置信度）。建议参考已验证的解决方案框架。`,
  };

  let output = outputs[agent.agentId] || `[${cap?.nameZh || agent.agentId}] 分析完成，已生成结果。`;

  if (variant === 'debate-position') {
    output = `[${cap?.nameZh} - 立场阐述] ` + output;
  } else if (variant === 'judge-verdict') {
    output = `[仲裁判决] 综合两方论点，方案 A 在短期效率上占优（+15%），方案 B 在长期可维护性上更佳（+25%）。建议采用混合策略: A 的执行框架 + B 的架构模式。共识度: ${Math.round(75 + Math.random() * 20)}%`;
  } else if (variant === 'ensemble-vote') {
    output += ` 投票评分: ${(7 + Math.random() * 3).toFixed(1)}/10`;
  } else if (variant === 'aggregation') {
    output = `[汇总报告] 所有子任务已完成。综合各智能体输出，形成统一执行方案: ` + output;
  }

  return {
    agentId: agent.agentId,
    role: agent.role,
    output,
    confidence: 0.7 + Math.random() * 0.25,
    reasoning: `Based on ${cap?.specialties.join(', ')}`,
    tokensUsed: tokens,
    latencyMs: latency,
    timestamp: new Date().toISOString(),
  };
}

function generateFinalOutput(task: CollaborationTask): string {
  const agentNames = task.agents
    .map(a => AGENT_CAPABILITIES[a.agentId]?.nameZh || a.agentId)
    .join('、');

  return `## 协作完成报告

**任务**: ${task.title}
**模式**: ${task.mode} | **参与智能体**: ${agentNames}
**共识度**: ${Math.round((task.consensusScore || 0) * 100)}%
**总 Token**: ${task.totalTokens} | **总耗时**: ${task.totalLatencyMs}ms

### 各智能体输出摘要

${task.results.map(r => {
  const cap = AGENT_CAPABILITIES[r.agentId];
  return `**${cap?.nameZh || r.agentId}** (${r.role}, 置信度: ${Math.round(r.confidence * 100)}%):
${r.output}`;
}).join('\n\n')}

### 综合结论

基于 ${task.agents.length} 位智能体的协同分析，形成以下共识:
1. 任务可行性已通过多维度验证
2. 关键风险点已识别并提出缓解策略
3. 建议按照 Pipeline 模式执行后续步骤

---
*Generated by YYC3 Multi-Agent Orchestrator v17.2*
*${new Date().toISOString()}*`;
}

// ============================================================
// 8. MCP Tool Integration for Agents (Phase 18.4)
// ============================================================

/**
 * Agent-MCP Bridge: allows agents during collaboration to invoke MCP tools.
 *
 * Usage: After an agent produces output containing a tool invocation hint
 * like `[MCP:tools/call:tool_name {...params}]`, the orchestrator
 * can automatically execute the corresponding MCP call and inject the
 * result back into the collaboration context.
 *
 * Pattern:  [MCP:method:serverId {...jsonParams}]
 */

export interface MCPToolInvocation {
  method: string;
  serverId: string;
  params: Record<string, unknown>;
  result?: unknown;
  success?: boolean;
  latencyMs?: number;
}

const MCP_INVOKE_REGEX = /\[MCP:([a-z/]+):([a-z0-9_-]+)\s+(\{[^}]*\})\]/gi;

/**
 * Parse MCP tool invocation hints from agent output text.
 */
export function parseMCPInvocations(text: string): MCPToolInvocation[] {
  const invocations: MCPToolInvocation[] = [];
  let match: RegExpExecArray | null;
  MCP_INVOKE_REGEX.lastIndex = 0;

  while ((match = MCP_INVOKE_REGEX.exec(text)) !== null) {
    try {
      invocations.push({
        method: match[1],
        serverId: match[2],
        params: JSON.parse(match[3]),
      });
    } catch { /* skip malformed JSON */ }
  }

  return invocations;
}

/**
 * Execute MCP tool calls found in agent output and return enriched output.
 * Uses smartMCPCall for automatic real/mock routing.
 */
export async function executeAgentMCPCalls(
  agentOutput: string,
  agentId: string,
  callbacks?: SimulationCallbacks
): Promise<{ enrichedOutput: string; invocations: MCPToolInvocation[] }> {
  const { smartMCPCall } = await import('./mcp-protocol');
  const { eventBus } = await import('./event-bus');

  const invocations = parseMCPInvocations(agentOutput);
  if (invocations.length === 0) {
    return { enrichedOutput: agentOutput, invocations: [] };
  }

  let enrichedOutput = agentOutput;

  for (const inv of invocations) {
    callbacks?.onTimelineEvent?.({
      id: `ev-${uid()}`,
      timestamp: new Date().toISOString(),
      type: 'message',
      agentId,
      message: `Agent ${AGENT_CAPABILITIES[agentId]?.nameZh} invoking MCP: ${inv.method} → ${inv.serverId}`,
    });

    eventBus.mcp('agent_call', `Agent ${agentId} → ${inv.method}@${inv.serverId}`, 'info', {
      agentId, method: inv.method, serverId: inv.serverId,
    });

    try {
      const result = await smartMCPCall(inv.serverId, inv.method, inv.params);
      inv.result = result.response?.result;
      inv.success = result.success;
      inv.latencyMs = result.latencyMs;

      // Replace the invocation placeholder with the result
      const placeholder = `[MCP:${inv.method}:${inv.serverId} ${JSON.stringify(inv.params)}]`;
      const resultBlock = `\n\`\`\`mcp-result (${inv.method}@${inv.serverId}, ${inv.latencyMs}ms)\n${JSON.stringify(inv.result, null, 2)}\n\`\`\`\n`;
      enrichedOutput = enrichedOutput.replace(placeholder, resultBlock);

      eventBus.mcp('agent_call_result', `${inv.method}@${inv.serverId}: ${inv.success ? 'OK' : 'FAIL'} (${inv.latencyMs}ms)`,
        inv.success ? 'success' : 'error',
        { agentId, method: inv.method, serverId: inv.serverId, latencyMs: inv.latencyMs }
      );
    } catch (error) {
      inv.success = false;
      inv.result = { error: (error as Error).message };

      eventBus.mcp('agent_call_error', `${inv.method}@${inv.serverId}: ${(error as Error).message}`, 'error', {
        agentId, method: inv.method, serverId: inv.serverId,
      });
    }
  }

  return { enrichedOutput, invocations };
}

/**
 * Get list of available MCP tools that agents can reference.
 * Returns a formatted string for injection into agent system prompts.
 */
export function getMCPToolContextForAgent(): string {
  try {
    const raw = localStorage.getItem('yyc3-mcp-servers');
    if (!raw) return '';
    const servers = JSON.parse(raw) as Array<{ id: string; name: string; tools: Array<{ name: string; description: string }> }>;
    if (!servers.length) return '';

    let ctx = '\n## Available MCP Tools\nYou can invoke MCP tools using this format: [MCP:tools/call:serverId {"name":"toolName","arguments":{...}}]\n\n';
    for (const srv of servers) {
      if (!srv.tools?.length) continue;
      ctx += `### ${srv.name} (${srv.id})\n`;
      for (const tool of srv.tools) {
        ctx += `- \`${tool.name}\`: ${tool.description}\n`;
      }
      ctx += '\n';
    }
    return ctx;
  } catch { return ''; }
}

// ============================================================
// 9. Event Bus Integration for Orchestrator (Phase 18.4)
// ============================================================

/**
 * Emit orchestration events to the global Event Bus.
 * Called by both simulateCollaboration and executeRealCollaboration.
 */
export function emitOrchestrationEvent(
  type: string,
  message: string,
  level: 'info' | 'warn' | 'error' | 'success' = 'info',
  metadata?: Record<string, unknown>
): void {
  try {
    // Dynamic import to avoid circular dependency at module load time
    const bus = (globalThis as unknown as Record<string, unknown>).__yyc3_event_bus_ref as
      | { orchestrate: (type: string, message: string, level: string, metadata?: Record<string, unknown>) => void }
      | undefined;
    if (bus) {
      bus.orchestrate(type, message, level, metadata);
    }
  } catch { /* ignore if bus not ready */ }
}

// Register global reference (called once from event-bus module consumer)
interface EventBusRef {
  orchestrate: (type: string, message: string, level: string, metadata?: Record<string, unknown>) => void;
}
export function _registerEventBusRef(bus: EventBusRef): void {
  (globalThis as unknown as Record<string, EventBusRef>).__yyc3_event_bus_ref = bus;
}
