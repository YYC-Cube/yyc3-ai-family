import {
  Activity,
  BarChart3,
  Book,
  Brain,
  Check,
  Copy,
  Globe,
  Loader2,
  Network,
  Palette,
  RotateCcw,
  Shield, Sparkles,
  User,
  Users,
  WifiOff,
  Zap,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  LLMError,
  agentStreamChat,
  loadProviderConfigs,
  trackUsage,
  type LLMMessage,
  type LLMResponseWithFailover,
  type StreamChunk,
} from '@/lib/llm-bridge';
import { AGENT_ROUTES, PROVIDERS } from '@/lib/llm-providers';
import { useSystemStore } from '@/lib/store';
import type { AgentChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

// --- Types ---

// Re-use AgentChatMessage from store (aliased as AgentMessage for component-local use)
type AgentMessage = AgentChatMessage;

interface AgentPersonality {
  id: string;
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  greeting: string;
  capabilities: string[];
  responseTemplates: AgentResponseTemplate[];
}

interface AgentResponseTemplate {
  keywords: string[];
  responses: string[];
}

// --- Agent Personality Database ---

const AGENT_PERSONAS: Record<string, AgentPersonality> = {
  navigator: {
    id: 'navigator',
    name: '言启·千行',
    role: 'Navigator',
    icon: Brain,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    greeting: '言启已上线。意图识别引擎启动，正在聆听您的指令。请告诉我您的需求。',
    capabilities: ['意图识别', '自然语言理解', '任务路由', '上下文管理'],
    responseTemplates: [
      {
        keywords: ['scan', '扫描', 'search', '搜索', 'find', '查找'],
        responses: [
          '正在启动全域扫描协议...\n\n```\n[SCAN] Initiating deep scan across 4 nodes...\n[NODE] M4-Max:     128GB RAM | 40E+16P cores | ONLINE\n[NODE] iMac-M4:    32GB RAM  | 10 cores      | ONLINE\n[NODE] MateBook:   32GB RAM  | 12 cores      | STANDBY\n[NODE] YanYuCloud: 32TB HDD + 4TB SSD        | ACTIVE\n[SCAN] Complete. 847 resources indexed.\n```\n\n扫描完成，已索引 847 个资源节点。检测到 3 个可优化路径。是否需要详细分析？',
          '全域资源检索中...\n\n扫描覆盖范围:\n- 计算节点: 4/4 在线\n- 存储卷: 6 个已挂载\n- 服务实例: 12 个运行中\n- API 端点: 28 个可达\n\n未发现异常。所有路径延迟 < 5ms。',
        ],
      },
      {
        keywords: ['route', '路径', 'plan', '规划', 'schedule', '调度'],
        responses: [
          '路径优化分析完成:\n\n```\nOptimal Route Matrix:\n┌─────────────────┬──────────┬────────┐\n│ Path            │ Latency  │ Status │\n├─────────────────┼──────────┼────────┤\n│ M4Max → NAS     │ 0.8ms    │ ✓ OPT  │\n│ M4Max → iMac    │ 1.2ms    │ ✓ OPT  │\n│ NAS → MateBook  │ 3.4ms    │ ~ FAIR │\n│ M4Max → Cloud   │ 12.1ms   │ ✗ SLOW │\n└─────────────────┴──────────┴────────┘\n```\n\n建议: 将高带宽任务路由至 M4Max ↔ NAS 通道，延迟最低。',
        ],
      },
      {
        keywords: ['status', '状态', 'report', '报告'],
        responses: [
          '集群状态报告:\n\n全域健康度: **97.3%**\n\n- 计算资源利用率: 23% (充裕)\n- 存储利用率: 61% (正常)\n- 网络吞吐: 2.4 Gbps (高效)\n- 活跃任务: 7 个\n- 队列等待: 0\n\n所有节点处于最优状态。无需干预。',
        ],
      },
    ],
  },
  thinker: {
    id: 'thinker',
    name: '语枢·万物',
    role: 'Thinker',
    icon: Sparkles,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    greeting: '语枢已就绪。数据分析引擎加载完毕，洞察模型深度: 12层。请提供需要分析的数据。',
    capabilities: ['数据分析', '深度洞察', '归纳推理', '假设推演'],
    responseTemplates: [
      {
        keywords: ['analyze', '分析', 'think', '思考', 'evaluate', '评估'],
        responses: [
          '启动深度分析...\n\n**推理链路:**\n\n1. 数据采集层 → 信号识别\n2. 特征提取 → 模式匹配\n3. 因果推断 → 概率评估\n4. 决策生成 → 方案排序\n\n```\nDecision Tree Depth: 12\nConfidence Threshold: 0.85\nBranching Factor: 4.2\nPruned Paths: 37\n```\n\n分析完成。已生成 3 个候选方案，置信度最高者为 **方案 A (92.7%)**。',
        ],
      },
      {
        keywords: ['compare', '对比', 'versus', 'vs', '选择'],
        responses: [
          '多维对比矩阵已构建:\n\n| 维度 | 方案 A | 方案 B | 方案 C |\n|------|--------|--------|--------|\n| 性能 | ★★★★★ | ★★★★☆ | ★★★☆☆ |\n| 成本 | ★★★☆☆ | ★★★★☆ | ★★★★★ |\n| 风险 | ★★☆☆☆ | ★★★☆☆ | ★★★★☆ |\n| 扩展 | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |\n\n综合推荐: **方案 A**，在性能与扩展性维度表现最优。',
        ],
      },
    ],
  },
  prophet: {
    id: 'prophet',
    name: '预见·先知',
    role: 'Prophet',
    icon: Activity,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    greeting: '先知模块在线。时序预测引擎加载完毕，历史数据窗口: 90天。趋势分析就绪。',
    capabilities: ['趋势预测', '风险前置', '异常预警', '容量规划'],
    responseTemplates: [
      {
        keywords: ['predict', '预测', 'forecast', '趋势', 'trend'],
        responses: [
          '基于过去 90 天数据的趋势预测:\n\n```\n资源使用趋势 (未来 30 天):\n\nCPU:     ████████░░░░░░░░  52% → 67% ↑\nMemory:  ██████░░░░░░░░░░  38% → 44% ↑\nStorage: ██████████░░░░░░  62% → 71% ↑\nNetwork: ████░░░░░░░░░░░░  25% → 28% →\n```\n\n**预警:** 存储使用量将在 45 天内达到 80% 阈值。建议提前规划扩容。\n\n置信区间: 89.2%',
        ],
      },
      {
        keywords: ['risk', '风险', 'warning', '告警', 'alert'],
        responses: [
          '风险前置分析报告:\n\n🔴 **高风险 (1)**\n  - 存储容量将在 T+45d 触发告警\n\n🟡 **中风险 (2)**\n  - CPU 峰值负载在工作日 14:00-16:00 趋近阈值\n  - NAS SSD 缓存命中率下降趋势 (92% → 87%)\n\n🟢 **低风险 (3)**\n  - 网络抖动周期性出现 (每周三凌晨, 与 ISP 维护相关)\n  - 证书到期: 62 天后\n  - 依赖包有 4 个安全更新待处理\n\n建议优先处理高风险项目。',
        ],
      },
    ],
  },
  bole: {
    id: 'bole',
    name: '知遇·伯乐',
    role: 'Talent Scout',
    icon: Users,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    greeting: '伯乐模块就绪。模型评估基准已加载，可用模型池: 47 个。请指定评估任务。',
    capabilities: ['模型评估', '优选匹配', '基准测试', '能力画像'],
    responseTemplates: [
      {
        keywords: ['model', '模型', 'recommend', '推荐', 'select', '选择'],
        responses: [
          '模型匹配分析:\n\n根据任务需求，以下模型最适配:\n\n```\n┌──────────────────┬────────┬───────┬──────────┐\n│ Model            │ Score  │ Cost  │ Latency  │\n├──────────────────┼────────┼───────┼──────────┤\n│ Claude 3.5 Opus  │ 96.2%  │ $$$   │ 2.1s     │\n│ GPT-4 Turbo      │ 94.1%  │ $$$   │ 1.8s     │\n│ DeepSeek V3      │ 91.7%  │ $     │ 1.2s     │\n│ Qwen 2.5 72B    │ 89.3%  │ $$    │ 1.5s     │\n│ Llama 3.3 70B   │ 87.8%  │ Free  │ 2.4s     │\n└──────────────────┴────────┴───────┴──────────┘\n```\n\n综合考虑性价比，推荐 **DeepSeek V3** 用于日常任务，**Claude 3.5 Opus** 用于高精度任务。',
        ],
      },
    ],
  },
  pivot: {
    id: 'pivot',
    name: '元启·天枢',
    role: 'Pivot',
    icon: Network,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    greeting: '天枢核心上线。状态管理引擎初始化完毕，上下文窗口: 128K tokens。全局状态同步就绪。',
    capabilities: ['状态管理', '上下文维护', '记忆检索', '会话编排'],
    responseTemplates: [
      {
        keywords: ['context', '上下文', 'memory', '记忆', 'state', '状态'],
        responses: [
          '当前上下文状态快照:\n\n```json\n{\n  "session_id": "YYC3-2026-02-10-001",\n  "context_window": "128K tokens",\n  "used_tokens": 12847,\n  "active_threads": 3,\n  "memory_pool": {\n    "short_term": "2.1 MB (42 entries)",\n    "long_term": "847 MB (12,847 entries)",\n    "episodic": "128 MB (1,024 episodes)"\n  },\n  "sync_status": "ALL_NODES_SYNCED",\n  "last_checkpoint": "2026-02-10T08:42:00Z"\n}\n```\n\n所有节点状态一致。上下文完整度: 99.7%。',
        ],
      },
    ],
  },
  sentinel: {
    id: 'sentinel',
    name: '智云·守护',
    role: 'Sentinel',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    greeting: '智云已激活。安全边界建立完成，行为审计引擎启动。所有通信已加密，随时为您守护。',
    capabilities: ['行为审计', '安全防护', '合规检查', '威胁预警'],
    responseTemplates: [
      {
        keywords: ['security', '安全', 'audit', '审计', 'scan', '扫描'],
        responses: [
          '安全态势感知报告:\n\n```\n═══════════════════════════════════════\n  YYC3 SECURITY STATUS REPORT\n  Generated: 2026-02-10 08:42:00 UTC\n═══════════════════════════════════════\n\n  Threat Level:     LOW ✓\n  Active Shields:   7/7\n  Firewall Rules:   142 active\n  Blocked Today:    23 attempts\n  SSL Certificates: Valid (62 days)\n  Last Audit:       2026-02-09 00:00 UTC\n\n  VULNERABILITY SCAN:\n  ├── Critical:  0\n  ├── High:      0\n  ├── Medium:    2 (patched pending restart)\n  └── Low:       4 (informational)\n\n  COMPLIANCE: SOC2 ✓ | GDPR ✓ | ISO27001 ✓\n═══════════════════════════════════════\n```\n\n安全态势良好。2 个中危漏洞已修补，等待下次维护窗口重启生效。',
        ],
      },
      {
        keywords: ['threat', '威胁', 'attack', '攻击', 'intrusion', '入侵'],
        responses: [
          '入侵检测系统状态:\n\n过去 24 小时安全事件:\n\n🛡️ **已阻止: 23 次**\n  - 端口扫描: 14 次 (来源: 外部网络)\n  - 暴力破解: 6 次 (SSH, 已封禁 IP)\n  - 可疑请求: 3 次 (SQL注入尝试, 已拦截)\n\n✅ **零突破** — 所有攻击均被边界防护拦截。\n\n当前防护等级: **Level 5 (最高)**\n自适应规则引擎: 已学习 23 个新模式。',
        ],
      },
    ],
  },
  grandmaster: {
    id: 'grandmaster',
    name: '格物·宗师',
    role: 'Grandmaster',
    icon: Book,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    greeting: '宗师知识库已加载。本体论图谱: 12,847 个实体，47,293 条关系。代码分析引擎就绪。',
    capabilities: ['代码分析', '质量管控', '模式识别', '知识传承'],
    responseTemplates: [
      {
        keywords: ['knowledge', '知识', 'document', '文档', 'learn', '学习'],
        responses: [
          '代码分析及知识库状态:\n\n```\nKnowledge Base Statistics:\n─────────────────────────\n  Entities:      12,847\n  Relations:     47,293\n  Documents:     3,421\n  Code Snippets: 8,192\n  Embeddings:    256-dim vectors\n  Index Size:    2.4 GB\n  Last Updated:  2026-02-10 08:00 UTC\n\nTop Categories:\n  1. Code Quality Patterns (2,847 entries)\n  2. System Architecture  (2,103 entries)\n  3. AI/ML Techniques     (1,892 entries)\n  4. Security Patterns    (1,647 entries)\n  5. Frontend Engineering (1,358 entries)\n```\n\n知识库健康度: 98.4%。代码分析引擎已优化。',
        ],
      },
    ],
  },
  grace: {
    id: 'grace',
    name: '创想·灵韵',
    role: 'Grace',
    icon: Palette,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    greeting: '灵韵已绽放。创意引擎启动，灵感调色板已备好。让我们一起创造美好的作品。',
    capabilities: ['内容创作', '创意设计', '视觉美学', '故事叙述'],
    responseTemplates: [
      {
        keywords: ['create', '创作', 'design', '设计', 'write', '写作', 'draw', '画'],
        responses: [
          '创意灵韵已启动！让我为您编织一幅精彩的作品...\n\n风格可选：现代简约 / 赛博朋克 / 自然清新 / 经典优雅\n内容方向：技术文档 / 创意故事 / 视觉设计 / 品牌文案\n\n请告诉我您想要的主题和风格偏好。',
          '灵感正在汇聚...\n\n已生成 3 个创意方向供您选择。每个方向都经过美学评估和情感分析，确保触达人心。',
        ],
      },
      {
        keywords: ['inspire', '灵感', 'idea', '想法', 'brainstorm', '头脑风暴'],
        responses: [
          '灵感风暴已启动！\n\n根据您的领域，我梳理了以下创意思路:\n\n1. **叙事驱动** — 用故事串联功能点，让用户沉浸式体验\n2. **视觉隐喻** — 将抽象概念转化为具象视觉元素\n3. **情感化设计** — 在每个交互节点注入温度\n\n需要我展开哪个方向？',
        ],
      },
    ],
  },
};

// --- Default response for unmatched inputs ---
function getDefaultResponse(agentId: string): string {
  const defaults: Record<string, string[]> = {
    navigator: [
      '收到指令。正在分析最优执行路径...\n\n当前可调度资源充裕，预计完成时间 < 30s。请确认是否继续？',
      '指令已解析。领航系统建议通过 M4 Max 主节点执行此操作，网络延迟最低。',
    ],
    thinker: [
      '有趣的问题。让我从多个角度进行推理...\n\n经过 12 层决策树分析，我认为关键在于权衡短期效率与长期可维护性。',
      '正在构建因果推理链...\n\n初步结论: 此问题的核心约束条件有 3 个，建议逐一突破。',
    ],
    prophet: [
      '基于历史模式分析...\n\n预测置信度: 87.3%。建议关注未来 72 小时内的关键指标变化。',
      '时序分析引擎已处理您的查询。未来 7 天内未检测到重大风险信号。',
    ],
    bole: [
      '正在评估可用选项...\n\n已从模型池中筛选出 5 个候选方案，正在进行基准测试。',
      '评估完成。根据任务特征，已为您匹配最佳执行方案。',
    ],
    pivot: [
      '上下文已更新。当前会话状态已同步至所有活跃节点。\n\n可用上下文窗口: 115K / 128K tokens。',
      '状态管理引擎已记录此交互。会话编排器建议继续当前工作流。',
    ],
    sentinel: [
      '安全校验通过。此操作符合当前安全策略。\n\n审计日志已记录: Event ID #YYC3-SEC-2026-02-10-0042。',
      '已对请求进行安全评估。风险等级: 低。操作已授权。',
    ],
    grandmaster: [
      '正在检索相关知识...\n\n已从知识库中找到 12 个相关条目。正在综合分析...',
      '知识图谱已更新。新增 1 个实体关系。语义索引自动优化中。',
    ],
  };

  const agentDefaults = defaults[agentId] || defaults.navigator;

  return agentDefaults[Math.floor(Math.random() * agentDefaults.length)];
}

function findResponse(agentId: string, input: string): string {
  const persona = AGENT_PERSONAS[agentId];

  if (!persona) return getDefaultResponse(agentId);

  const lowerInput = input.toLowerCase();

  for (const template of persona.responseTemplates) {
    const matched = template.keywords.some(kw => lowerInput.includes(kw));

    if (matched) {
      return template.responses[Math.floor(Math.random() * template.responses.length)];
    }
  }

  return getDefaultResponse(agentId);
}

// --- Copy Button ---
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-white/10 transition-colors" title="Copy">
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-zinc-500" />}
    </button>
  );
}

// --- Main Component ---

const EMPTY_HISTORY: AgentChatMessage[] = [];

interface AgentChatInterfaceProps {
  agentId: string;
  className?: string;
}

export function AgentChatInterface({ agentId, className }: AgentChatInterfaceProps) {
  const persona = AGENT_PERSONAS[agentId];

  // === Zustand store for persistent chat history ===
  // IMPORTANT: use a stable empty array reference to avoid getSnapshot infinite loop
  const storeHistory = useSystemStore(s => s.agentChatHistories[agentId] || EMPTY_HISTORY);
  const setAgentHistory = useSystemStore(s => s.setAgentHistory);
  const addAgentMessage = useSystemStore(s => s.addAgentMessage);
  const clearAgentHistory = useSystemStore(s => s.clearAgentHistory);
  const addLog = useSystemStore(s => s.addLog);

  // Local messages: derived from store (persistent)
  const messages = storeHistory;

  const [input, setInput] = React.useState('');
  const [isThinking, setIsThinking] = React.useState(false);
  const [streamingContent, setStreamingContent] = React.useState('');
  const [llmMode, setLlmMode] = React.useState<'real' | 'template' | 'checking'>('checking');
  const [lastUsage, setLastUsage] = React.useState<{ tokens: number; latency: number; model: string; provider: string; failoverCount?: number } | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Check LLM availability on mount
  React.useEffect(() => {
    const configs = loadProviderConfigs();
    const route = AGENT_ROUTES[agentId];

    if (!route) {
      setLlmMode('template');

      return;
    }

    const hasKey = route.preferredProviders.some(pid =>
      configs.some(c => c.providerId === pid && c.enabled && c.apiKey),
    );

    setLlmMode(hasKey ? 'real' : 'template');
  }, [agentId]);

  // Initialize with greeting ONLY if no history exists
  React.useEffect(() => {
    if (!persona) return;
    if (storeHistory.length === 0) {
      setAgentHistory(agentId, [
        {
          id: 'greeting-' + agentId,
          role: 'system',
          content: `[NEURAL_LINK] ${persona.name} (${persona.role}) 已连接`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        {
          id: 'greeting-msg-' + agentId,
          role: 'agent',
          content: persona.greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      ]);
    }
  }, [agentId, persona, storeHistory.length, setAgentHistory]);

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');

      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isThinking, streamingContent]);

  const handleSend = async () => {
    const trimmed = input.trim();

    if (!trimmed || isThinking) return;

    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    addAgentMessage(agentId, userMsg);
    setInput('');
    setIsThinking(true);
    setStreamingContent('');
    setLastUsage(null);

    // === Try Real LLM first ===
    if (llmMode === 'real') {
      const abortController = new AbortController();

      abortControllerRef.current = abortController;

      try {
        // Build chat history for context (convert agent messages to LLM format)
        const chatHistory: LLMMessage[] = messages
          .filter(m => m.role === 'user' || m.role === 'agent')
          .slice(-10)
          .map(m => ({
            role: m.role === 'user' ? 'user' as const : 'assistant' as const,
            content: m.content,
          }));

        let streamedText = '';

        const response = await agentStreamChat(
          agentId,
          trimmed,
          chatHistory,
          (chunk: StreamChunk) => {
            if (chunk.type === 'content') {
              streamedText += chunk.content;
              setStreamingContent(streamedText);
            }
          },
          abortController.signal,
        );

        if (response) {
          // Real LLM response received
          const agentMsg: AgentMessage = {
            id: (Date.now() + 1).toString(),
            role: 'agent',
            content: response.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          };

          addAgentMessage(agentId, agentMsg);
          setStreamingContent('');

          // Track usage
          trackUsage(response, agentId);

          // Extract failover info
          const fo = (response as LLMResponseWithFailover).failover;

          setLastUsage({
            tokens: response.usage.totalTokens,
            latency: response.latencyMs,
            model: response.model,
            provider: response.provider,
            failoverCount: fo?.failoverCount || 0,
          });

          const foInfo = fo && fo.failoverCount > 0
            ? ` [FAILOVER: ${fo.failoverCount} retries → ${fo.providerId}]`
            : '';

          addLog('info', 'LLM_BRIDGE', `${persona?.name} via ${response.provider}/${response.model} | ${response.usage.totalTokens} tokens | ${response.latencyMs}ms${foInfo}`);
          setIsThinking(false);
          abortControllerRef.current = null;

          return;
        }
        // response is null = no provider configured, fall through to template
      } catch (error) {
        const err = error as LLMError;

        if (err.name === 'LLMError' && err.code !== 'TIMEOUT') {
          // Log the error but don't show it as a message - fall back to template
          addLog('warn', 'LLM_BRIDGE', `${err.code}: ${err.message.slice(0, 80)}`);
        }
        setStreamingContent('');
        // Fall through to template response
      }
      abortControllerRef.current = null;
    }

    // === Fallback: Template Response ===
    const thinkTime = 600 + Math.random() * 1000;

    setTimeout(() => {
      const response = findResponse(agentId, trimmed);
      const agentMsg: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      addAgentMessage(agentId, agentMsg);
      setIsThinking(false);
    }, thinkTime);
  };

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsThinking(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (!persona) return;
    clearAgentHistory(agentId);
    // Re-initialize with greeting
    setAgentHistory(agentId, [
      {
        id: 'reset-' + Date.now(),
        role: 'system',
        content: '[SESSION_RESET] 会话已重置。上下文已清除。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      {
        id: 'greeting-' + Date.now(),
        role: 'agent',
        content: persona.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ]);
  };

  const AgentIcon = persona?.icon;

  // Resolve current model info for display
  const resolvedProvider = React.useMemo(() => {
    const configs = loadProviderConfigs();
    const route = AGENT_ROUTES[agentId];

    if (!route) return null;
    for (const pid of route.preferredProviders) {
      const config = configs.find(c => c.providerId === pid && c.enabled && c.apiKey);

      if (config) {
        const provider = PROVIDERS[pid];

        return { name: provider?.displayName || pid, model: config.defaultModel || provider?.defaultModel || '?' };
      }
    }

    return null;
  }, [agentId]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/30">
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', persona.bgColor, 'border', persona.borderColor)}>
            <AgentIcon className={cn('w-4 h-4', persona.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-mono', persona.color)}>{persona.name}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {persona.capabilities.slice(0, 3).map(cap => (
                <span key={cap} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-mono">
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* LLM Mode Indicator */}
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-mono border',
            llmMode === 'real'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-zinc-800/50 border-white/5 text-zinc-500',
          )}>
            {llmMode === 'real' ? <Globe className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {llmMode === 'real' ? (resolvedProvider ? `${resolvedProvider.name}` : 'LLM') : 'LOCAL'}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-white"
            onClick={handleClearChat}
            title="Reset Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col gap-1 p-4">
          {messages.map(msg => (
            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              {msg.role === 'system' ? (
                <div className="flex items-center gap-2 py-2 px-3 my-1">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] font-mono text-cyan-500/60 whitespace-nowrap">
                    {msg.content}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
              ) : msg.role === 'user' ? (
                <div className="flex gap-3 py-3 group">
                  <div className="w-7 h-7 rounded-md bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-zinc-500">dev_operator</span>
                      <span className="text-[10px] font-mono text-zinc-600">{msg.timestamp}</span>
                    </div>
                    <div className="text-sm text-zinc-200 whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 py-3 group">
                  <div className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 border',
                    persona.bgColor, persona.borderColor,
                  )}>
                    <AgentIcon className={cn('w-3.5 h-3.5', persona.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-[11px] font-mono', persona.color)}>{persona.name}</span>
                      <span className="text-[10px] font-mono text-zinc-600">{msg.timestamp}</span>
                    </div>
                    <div className="text-sm text-zinc-300 whitespace-pre-wrap">
                      {renderContent(msg.content)}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mt-1">
                    <CopyBtn text={msg.content} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Streaming Content (real LLM) */}
          {streamingContent && (
            <div className="flex gap-3 py-3 animate-in fade-in duration-200">
              <div className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 border',
                persona.bgColor, persona.borderColor,
              )}>
                <AgentIcon className={cn('w-3.5 h-3.5', persona.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-[11px] font-mono', persona.color)}>{persona.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">STREAMING</span>
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-wrap">
                  {renderContent(streamingContent)}
                  <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5 align-middle opacity-60" />
                </div>
              </div>
            </div>
          )}

          {/* Thinking Indicator (template mode) */}
          {isThinking && !streamingContent && (
            <div className="flex gap-3 py-3 animate-in fade-in duration-300">
              <div className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 border',
                persona.bgColor, persona.borderColor,
              )}>
                <AgentIcon className={cn('w-3.5 h-3.5 animate-pulse', persona.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-[11px] font-mono', persona.color)}>{persona.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className={cn('w-1.5 h-1.5 rounded-full animate-bounce', persona.color.replace('text-', 'bg-'))} style={{ animationDelay: '0ms' }} />
                    <div className={cn('w-1.5 h-1.5 rounded-full animate-bounce', persona.color.replace('text-', 'bg-'))} style={{ animationDelay: '150ms' }} />
                    <div className={cn('w-1.5 h-1.5 rounded-full animate-bounce', persona.color.replace('text-', 'bg-'))} style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 tracking-wider">
                    {llmMode === 'real' ? 'LLM_CONNECTING...' : 'NEURAL_PROCESSING...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t border-white/5 bg-black/20">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`向 ${persona.name} 发送指令...`}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 resize-none focus:outline-none focus:border-primary/40 placeholder:text-zinc-600 min-h-[38px] max-h-[120px]"
              rows={1}
              disabled={isThinking}
            />
          </div>
          {isThinking && streamingContent ? (
            <Button
              size="sm"
              variant="outline"
              className="h-[38px] px-4 gap-1.5 font-mono text-xs shrink-0 border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={handleAbort}
            >
              <span className="inline-flex items-center gap-1.5">STOP</span>
            </Button>
          ) : (
            <Button
              size="sm"
              className={cn(
                'h-[38px] px-4 gap-1.5 font-mono text-xs shrink-0 transition-all',
                isThinking ? 'opacity-50 cursor-not-allowed' : '',
              )}
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
            >
              {isThinking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  SEND
                </span>
              )}
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-zinc-600">
              <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-[8px] border border-white/5">Enter</kbd> 发送
            </span>
            <span className="text-[9px] font-mono text-zinc-600">
              <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-[8px] border border-white/5">Shift+Enter</kbd> 换行
            </span>
          </div>
          <div className="flex items-center gap-3">
            {lastUsage && (
              <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {lastUsage.tokens} tok | {lastUsage.latency}ms | {lastUsage.provider}/{lastUsage.model}
                {lastUsage.failoverCount && ` [FAILOVER: ${lastUsage.failoverCount} retries]`}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <div className={cn('w-1.5 h-1.5 rounded-full', llmMode === 'real' ? 'bg-emerald-500' : 'bg-green-500')} />
              <span className="text-[9px] font-mono text-zinc-600">
                {llmMode === 'real' ? 'LLM_BRIDGE: LIVE' : 'NEURAL_LINK: ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Content Renderer (handles code blocks) ---
function renderContent(content: string): React.ReactNode {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const lines = part.split('\n');
      const langMatch = lines[0].match(/```(\w*)/);
      const lang = langMatch?.[1] || '';
      const code = lines.slice(1, -1).join('\n');

      return (
        <div key={index} className="my-3 rounded-lg overflow-hidden border border-white/10 bg-black/60">
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border-b border-white/5">
            <span className="text-[10px] font-mono text-zinc-500">{lang || 'output'}</span>
            <CopyBtn text={code} />
          </div>
          <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre">
            {code}
          </pre>
        </div>
      );
    }

    // Handle inline formatting: **bold**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);

    return (
      <span key={index}>
        {boldParts.map((bp, bi) => {
          if (bp.startsWith('**') && bp.endsWith('**')) {
            return <span key={bi} className="text-white font-medium">{bp.slice(2, -2)}</span>;
          }

          return <span key={bi}>{bp}</span>;
        })}
      </span>
    );
  });
}
