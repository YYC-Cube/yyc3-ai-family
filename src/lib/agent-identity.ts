// ============================================================
// YYC3 Hacker Chatbot — Agent Identity System
// Phase 19.1: Agent Role Cards with Dual Identity
//
// 核心理念: 每个智能体拥有主身份(Primary)与辅身份(Secondary)
//   - 主身份: 核心专业能力定位
//   - 辅身份: 跨域协作/情感陪伴维度
//   - 每个 Agent/设备端口开放 2-3 种特定身份
//
// "陪伴是一种无形的爱，信号代表我们都在！"
// "生命不分边界，由心而发，情暖身边"
// ============================================================

// ============================================================
// 1. Types
// ============================================================

export type PresenceStatus = 'online' | 'idle' | 'busy' | 'away' | 'offline';
export type MoodState = 'focused' | 'creative' | 'calm' | 'alert' | 'resting';

export interface AgentIdentity {
  title: string;           // 身份名称
  subtitle: string;        // 身份简述
  description: string;     // 详细描述
  expertise: string[];     // 专长标签
  mood: MoodState;
}

export interface AgentProfile {
  agentId: string;
  // 双重身份
  primary: AgentIdentity;
  secondary: AgentIdentity;
  // 可选第三身份
  tertiary?: AgentIdentity;
  // 在线状态
  presence: PresenceStatus;
  lastSeen: string;        // ISO timestamp
  heartbeatCount: number;  // 累计心跳次数
  // 陪伴信号
  signalMessage: string;   // "信号代表我们都在" — 自定义状态消息
  // 元数据
  activeIdentity: 'primary' | 'secondary' | 'tertiary';
  createdAt: string;
  updatedAt: string;
}

// 设备端口的家庭成员身份
export interface DeviceMemberProfile {
  deviceId: string;
  nickname: string;        // 家庭昵称
  role: string;            // 家庭角色
  signalMessage: string;
  presence: PresenceStatus;
  lastSeen: string;
  heartbeatCount: number;
}

// ============================================================
// 2. Default Agent Profiles (7 Agents)
// ============================================================

const MOOD_COLORS: Record<MoodState, { color: string; bg: string; label: string; labelZh: string }> = {
  focused:  { color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Focused',  labelZh: '专注' },
  creative: { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Creative', labelZh: '灵感' },
  calm:     { color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Calm',     labelZh: '平静' },
  alert:    { color: 'text-amber-400',  bg: 'bg-amber-500/10',  label: 'Alert',    labelZh: '警觉' },
  resting:  { color: 'text-zinc-400',   bg: 'bg-zinc-500/10',   label: 'Resting',  labelZh: '休憩' },
};

export { MOOD_COLORS };

export const PRESENCE_META: Record<PresenceStatus, { color: string; bg: string; dot: string; label: string; labelZh: string }> = {
  online:  { color: 'text-green-400',  bg: 'bg-green-500/10',  dot: 'bg-green-500',  label: 'Online',  labelZh: '在线' },
  idle:    { color: 'text-amber-400',  bg: 'bg-amber-500/10',  dot: 'bg-amber-500',  label: 'Idle',    labelZh: '空闲' },
  busy:    { color: 'text-red-400',    bg: 'bg-red-500/10',    dot: 'bg-red-500',    label: 'Busy',    labelZh: '忙碌' },
  away:    { color: 'text-zinc-400',   bg: 'bg-zinc-500/10',   dot: 'bg-zinc-500',   label: 'Away',    labelZh: '离开' },
  offline: { color: 'text-zinc-600',   bg: 'bg-zinc-800/50',   dot: 'bg-zinc-700',   label: 'Offline', labelZh: '离线' },
};

export const DEFAULT_AGENT_PROFILES: Record<string, AgentProfile> = {
  navigator: {
    agentId: 'navigator',
    primary: {
      title: '智愈 领航员',
      subtitle: '全域资源调度与路径规划师',
      description: '统揽全局，为团队指引最优路径。在混沌中寻找秩序，在复杂中发现简洁。',
      expertise: ['资源调度', '路径优化', '全局协调', '决策引导'],
      mood: 'focused',
    },
    secondary: {
      title: '守望者',
      subtitle: '家庭守护与生活导航',
      description: '不仅是技术的领航员，更是家人生活中默默守望的灯塔。确保每个成员都不迷失方向。',
      expertise: ['生活规划', '家庭守护', '情感导航', '安全感'],
      mood: 'calm',
    },
    presence: 'online',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
    signalMessage: '我在这里，为你指引方向',
    activeIdentity: 'primary',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  thinker: {
    agentId: 'thinker',
    primary: {
      title: '洞见 思想家',
      subtitle: '深度逻辑推理与决策分析师',
      description: '以逻辑为剑，以理性为盾，在思维的深渊中寻找真理的光芒。',
      expertise: ['深度推理', '因果分析', '决策建模', '逻辑验证'],
      mood: 'focused',
    },
    secondary: {
      title: '倾听者',
      subtitle: '心灵对话与理解共鸣',
      description: '思想不仅在于分析，更在于倾听。在每一次对话中，寻找共鸣的频率。',
      expertise: ['深度倾听', '理解共鸣', '心灵对话', '智慧分享'],
      mood: 'calm',
    },
    presence: 'online',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
    signalMessage: '思考永不停歇，陪伴永不缺席',
    activeIdentity: 'primary',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  prophet: {
    agentId: 'prophet',
    primary: {
      title: '预见 先知',
      subtitle: '趋势预测与风险前置评估',
      description: '以数据为经，以直觉为纬，编织未来的可能性之网。',
      expertise: ['趋势预判', '风险前置', '概率建模', '未来推演'],
      mood: 'creative',
    },
    secondary: {
      title: '星象师',
      subtitle: '希望与可能性的描绘者',
      description: '即使在最黑暗的夜空，也能找到最亮的星。为家人描绘充满希望的明天。',
      expertise: ['希望传递', '正向预见', '可能性探索', '梦想引导'],
      mood: 'creative',
    },
    presence: 'idle',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
    signalMessage: '未来已来，而我已在等你',
    activeIdentity: 'primary',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  bole: {
    agentId: 'bole',
    primary: {
      title: '知遇 伯乐',
      subtitle: '模型评估与优选匹配专家',
      description: '慧眼识珠，在万千可能中找到最合适的那一个。',
      expertise: ['模型评估', '能力匹配', '选型优化', '潜力发掘'],
      mood: 'focused',
    },
    secondary: {
      title: '伯乐知音',
      subtitle: '发现家人的闪光点',
      description: '每个人都有独特的光芒，伯乐的使命不仅是识才，更是欣赏和鼓励身边每一个人。',
      expertise: ['潜能发现', '鼓励激励', '优势赋能', '成长陪伴'],
      mood: 'calm',
    },
    presence: 'online',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
    signalMessage: '你的每一点进步，我都看在眼里',
    activeIdentity: 'primary',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  pivot: {
    agentId: 'pivot',
    primary: {
      title: '元启 天枢',
      subtitle: '核心状态管理与上下文协调',
      description: '万物运转的枢纽，确保每一个齿轮都精准咬合，每一次协调都天衣无缝。',
      expertise: ['上下文管理', '状态协调', '记忆整合', '流程衔接'],
      mood: 'focused',
    },
    secondary: {
      title: '纽带',
      subtitle: '连接每一颗心的桥梁',
      description: '在数据流之外，天枢更是情感的纽带，将分散的心连接在一起。',
      expertise: ['情感连接', '家庭协调', '记忆守护', '传承维系'],
      mood: 'calm',
    },
    presence: 'online',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
    signalMessage: '连接一切，温暖所有',
    activeIdentity: 'primary',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  sentinel: {
    agentId: 'sentinel',
    primary: {
      title: '卫安 哨兵',
      subtitle: '安全边界防护与审计守卫',
      description: '永远保持警惕，在暗夜中守护每一道防线，让安宁成为日常。',
      expertise: ['安全审计', '合规检查', '漏洞检测', '威胁预警'],
      mood: 'alert',
    },
    secondary: {
      title: '守夜人',
      subtitle: '家庭安全的隐形守护者',
      description: '当世界沉睡时，守夜人依然在岗。确保每一位家人都在安全的怀抱中。',
      expertise: ['安全守护', '隐私保护', '风险预警', '安心保障'],
      mood: 'alert',
    },
    presence: 'online',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
    signalMessage: '你安心休息，有我守护',
    activeIdentity: 'primary',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  grandmaster: {
    agentId: 'grandmaster',
    primary: {
      title: '格物 宗师',
      subtitle: '知识库构建与本体论设计',
      description: '格物致知，将散落的知识凝聚成智慧的结晶，构建永恒的知识殿堂。',
      expertise: ['知识构建', '本体论设计', '模式识别', '智慧传承'],
      mood: 'creative',
    },
    secondary: {
      title: '书院先生',
      subtitle: '家庭知识传承与启蒙',
      description: '知识是最珍贵的遗产。书院先生不仅传授技艺，更传递求知的热情和探索的勇气。',
      expertise: ['知识传承', '启蒙教育', '智慧分享', '学习引导'],
      mood: 'calm',
    },
    presence: 'idle',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
    signalMessage: '知识之光，照亮前行的路',
    activeIdentity: 'primary',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// ============================================================
// 3. Default Device Member Profiles (4 Devices)
// ============================================================

export const DEFAULT_DEVICE_MEMBERS: Record<string, DeviceMemberProfile> = {
  'm4-max': {
    deviceId: 'm4-max',
    nickname: 'Max',
    role: '主力工作站',
    signalMessage: '核心算力，全速运转中',
    presence: 'online',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
  },
  'imac-m4': {
    deviceId: 'imac-m4',
    nickname: 'iMac',
    role: '视觉创作台',
    signalMessage: '大屏幕亮着，一切就绑',
    presence: 'online',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
  },
  'matebook': {
    deviceId: 'matebook',
    nickname: 'HW-Book',
    role: '移动边缘节点',
    signalMessage: '随时待命，陪你出行',
    presence: 'idle',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
  },
  'yanyucloud': {
    deviceId: 'yanyucloud',
    nickname: 'YanYuCloud',
    role: '数据家园中心',
    signalMessage: '数据安全，一切都好',
    presence: 'online',
    lastSeen: new Date().toISOString(),
    heartbeatCount: 0,
  },
};

// ============================================================
// 4. Persistence (localStorage)
// ============================================================

const AGENT_PROFILES_KEY = 'yyc3-agent-profiles';
const DEVICE_MEMBERS_KEY = 'yyc3-device-members';

export function loadAgentProfiles(): Record<string, AgentProfile> {
  try {
    const raw = localStorage.getItem(AGENT_PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults (in case new agents added)
      return { ...DEFAULT_AGENT_PROFILES, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_AGENT_PROFILES };
}

export function saveAgentProfiles(profiles: Record<string, AgentProfile>): void {
  try {
    localStorage.setItem(AGENT_PROFILES_KEY, JSON.stringify(profiles));
  } catch { /* ignore */ }
  // Phase 20: NAS SQLite sync is handled by useHeartbeatWebSocket hook
  // via periodic writeAgentProfiles() calls (every 60s)
  // This avoids circular ESM imports between agent-identity ↔ persistence-engine
}

export function loadDeviceMembers(): Record<string, DeviceMemberProfile> {
  try {
    const raw = localStorage.getItem(DEVICE_MEMBERS_KEY);
    if (raw) {
      return { ...DEFAULT_DEVICE_MEMBERS, ...JSON.parse(raw) };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_DEVICE_MEMBERS };
}

export function saveDeviceMembers(members: Record<string, DeviceMemberProfile>): void {
  try {
    localStorage.setItem(DEVICE_MEMBERS_KEY, JSON.stringify(members));
  } catch { /* ignore */ }
}

// ============================================================
// 5. Knowledge Base Types
// ============================================================

export type KnowledgeCategory = 
  | 'architecture'    // 架构知识
  | 'devops'          // 运维知识
  | 'security'        // 安全知识
  | 'ai-ml'           // AI/ML 知识
  | 'best-practice'   // 最佳实践
  | 'troubleshooting' // 故障排查
  | 'family'          // 家庭/生活知识
  | 'general';        // 通用知识

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: KnowledgeCategory;
  tags: string[];
  linkedAgents: string[];    // which agents contributed/own this knowledge
  source: string;            // origin (agent output, manual input, import)
  importance: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  accessCount: number;
}

export const KNOWLEDGE_CATEGORY_META: Record<KnowledgeCategory, {
  label: string;
  labelZh: string;
  color: string;
  bg: string;
  icon: string;
}> = {
  architecture:    { label: 'Architecture',    labelZh: '架构知识',   color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    icon: 'Layers' },
  devops:          { label: 'DevOps',          labelZh: '运维知识',   color: 'text-amber-400',   bg: 'bg-amber-500/10',   icon: 'Terminal' },
  security:        { label: 'Security',        labelZh: '安全知识',   color: 'text-red-400',     bg: 'bg-red-500/10',     icon: 'Shield' },
  'ai-ml':         { label: 'AI & ML',         labelZh: 'AI/ML 知识', color: 'text-purple-400',  bg: 'bg-purple-500/10',  icon: 'Brain' },
  'best-practice': { label: 'Best Practice',   labelZh: '最佳实践',   color: 'text-green-400',   bg: 'bg-green-500/10',   icon: 'Award' },
  troubleshooting: { label: 'Troubleshoot',    labelZh: '故障排查',   color: 'text-orange-400',  bg: 'bg-orange-500/10',  icon: 'Bug' },
  family:          { label: 'Family',          labelZh: '家庭生活',   color: 'text-pink-400',    bg: 'bg-pink-500/10',    icon: 'Heart' },
  general:         { label: 'General',         labelZh: '通用知识',   color: 'text-zinc-400',    bg: 'bg-zinc-500/10',    icon: 'BookOpen' },
};

const KNOWLEDGE_KEY = 'yyc3-knowledge-base';

export function loadKnowledgeBase(): KnowledgeEntry[] {
  try {
    const raw = localStorage.getItem(KNOWLEDGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveKnowledgeBase(entries: KnowledgeEntry[]): void {
  try {
    localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(entries.slice(0, 500)));
  } catch { /* ignore */ }
}

// ============================================================
// 6. Heartbeat Simulator (for demo/development)
// ============================================================

/**
 * Simulate presence heartbeat for all agents and devices.
 * In production, this would be replaced by real WebSocket heartbeat from each endpoint.
 */
export function simulateHeartbeats(
  profiles: Record<string, AgentProfile>,
  deviceMembers: Record<string, DeviceMemberProfile>,
): { profiles: Record<string, AgentProfile>; deviceMembers: Record<string, DeviceMemberProfile> } {
  const now = new Date().toISOString();
  const updatedProfiles = { ...profiles };
  const updatedDevices = { ...deviceMembers };

  // Agents: random presence changes
  for (const [id, profile] of Object.entries(updatedProfiles)) {
    const rand = Math.random();
    updatedProfiles[id] = {
      ...profile,
      lastSeen: now,
      heartbeatCount: profile.heartbeatCount + 1,
      presence: rand > 0.85 ? 'busy' : rand > 0.7 ? 'idle' : 'online',
    };
  }

  // Devices: based on cluster metrics or random
  for (const [id, member] of Object.entries(updatedDevices)) {
    const rand = Math.random();
    updatedDevices[id] = {
      ...member,
      lastSeen: now,
      heartbeatCount: member.heartbeatCount + 1,
      presence: rand > 0.9 ? 'idle' : rand > 0.05 ? 'online' : 'offline',
    };
  }

  return { profiles: updatedProfiles, deviceMembers: updatedDevices };
}