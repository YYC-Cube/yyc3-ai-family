// ============================================================
// YYC3 Hacker Chatbot — Global Unified Type Definitions
// Phase 23: Centralized Type System
//
// All shared types, interfaces, and enums used across modules.
// Single source of truth for data contracts.
// ============================================================

// ============================================================
// 1. System-Level Types
// ============================================================

export type SystemStatus = 'optimal' | 'warning' | 'critical' | 'booting';
export type ViewMode = 'terminal' | 'console' | 'projects' | 'artifacts' | 'monitor' | 'services' | 'knowledge' | 'bookmarks';

export type ConsoleTabId =
  | 'dashboard' | 'ai' | 'agent_identity' | 'family_presence'
  | 'knowledge_base' | 'token_usage' | 'architecture' | 'docker'
  | 'devops' | 'mcp' | 'persist' | 'orchestrate' | 'nas_deployment'
  | 'metrics_history' | 'remote_docker_deploy' | 'ollama_manager'
  | 'api_docs' | 'settings' | 'smoke_test' | 'test_framework'
  | 'stream_diagnostics' | 'security_audit' | 'hardware_monitor';

export type Language = 'zh' | 'en';

// ============================================================
// 2. Agent Types
// ============================================================

export type AgentId =
  | 'navigator' | 'thinker' | 'prophet'
  | 'bole' | 'pivot' | 'sentinel' | 'grandmaster' | 'grace';

export type AgentRole = 'architect' | 'coder' | 'auditor' | 'orchestrator';

export interface AgentInfo {
  id: AgentId;
  name: string;
  nameEn: string;
  role: string;
  desc: string;
  descEn: string;
  icon: string; // lucide icon name
  color: string; // Tailwind text color
  bgColor: string; // Tailwind bg color
  borderColor: string;
}

export const AGENT_REGISTRY: AgentInfo[] = [
  { id: 'navigator', name: '言启·千行', nameEn: 'Navigator', role: 'Navigator', desc: '意图识别与任务路由', descEn: 'Intent recognition & task routing', icon: 'Brain', color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  { id: 'thinker', name: '语枢·万物', nameEn: 'Thinker', role: 'Thinker', desc: '数据分析与深度洞察', descEn: 'Data analysis & deep insight', icon: 'Sparkles', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  { id: 'prophet', name: '预见·先知', nameEn: 'Prophet', role: 'Prophet', desc: '趋势预测与风险前置', descEn: 'Trend prediction & risk assessment', icon: 'Activity', color: 'text-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  { id: 'bole', name: '知遇·伯乐', nameEn: 'Bole', role: 'Bole', desc: '个性化推荐与潜能发掘', descEn: 'Personalized recommendation & potential discovery', icon: 'Users', color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
  { id: 'pivot', name: '元启·天枢', nameEn: 'Pivot', role: 'Pivot', desc: '全局编排与决策中枢', descEn: 'Global orchestration & decision center', icon: 'Network', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
  { id: 'sentinel', name: '智云·守护', nameEn: 'Sentinel', role: 'Sentinel', desc: '行为审计与安全防护', descEn: 'Behavior audit & security protection', icon: 'Shield', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  { id: 'grandmaster', name: '格物·宗师', nameEn: 'Grandmaster', role: 'Grandmaster', desc: '代码分析与质量管控', descEn: 'Code analysis & quality control', icon: 'Book', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
  { id: 'grace', name: '创想·灵韵', nameEn: 'Grace', role: 'Creator', desc: '内容创作与创意生成', descEn: 'Content creation & creative generation', icon: 'Palette', color: 'text-violet-500', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
];

// ============================================================
// 3. Chat & Message Types
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  agentName?: string;
  agentRole?: AgentRole;
  attachments?: FileAttachment[];
  // Phase 34: Provider metadata for AI responses
  providerMeta?: {
    providerId: string;
    modelId: string;
    latencyMs: number;
    totalTokens: number;
    errorCode?: string; // set when request failed
  };
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  thinking?: boolean;
}

export interface ChatArtifact {
  code: string;
  language: string;
  title: string;
  type?: 'react' | 'text' | 'shell';
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string; // MIME type
  dataUrl?: string; // for preview
  content?: string; // text content
}

// ============================================================
// 4. Cluster & Device Types
// ============================================================

export type NodeId = 'm4-max' | 'imac-m4' | 'matebook' | 'yanyucloud';

export interface NodeMetricsSnapshot {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature: number;
  processes: number;
  uptime: number;
}

export interface ClusterMetricsSnapshot {
  'm4-max': NodeMetricsSnapshot;
  'imac-m4': NodeMetricsSnapshot;
  'matebook': NodeMetricsSnapshot;
  'yanyucloud': NodeMetricsSnapshot;
  timestamp: number;
}

export type DeviceStatus = 'online' | 'offline' | 'standby' | 'unknown';
export type ServiceStatus = 'up' | 'down' | 'unknown';
export type ServiceProtocol = 'http' | 'https' | 'ssh' | 'ws' | 'tcp';

// ============================================================
// 5. LLM & Provider Types
// ============================================================

export type LLMApiFormat = 'openai' | 'anthropic';

export type ProviderId =
  | 'openai' | 'anthropic' | 'deepseek' | 'zhipu'
  | 'google' | 'groq' | 'ollama' | 'lmstudio';

export type LLMErrorCode =
  | 'AUTH_FAILED' | 'RATE_LIMITED' | 'CONTEXT_TOO_LONG'
  | 'MODEL_NOT_FOUND' | 'NETWORK_ERROR' | 'CORS_ERROR'
  | 'TIMEOUT' | 'PROVIDER_ERROR' | 'UNKNOWN';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

// ============================================================
// 6. Ollama-Specific Types
// ============================================================

export interface OllamaModelInfo {
  name: string; // e.g., "qwen2.5:72b"
  model: string;
  modified_at: string;
  size: number; // bytes
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string; // e.g., "72B"
    quantization_level: string;
  };
}

export interface OllamaTagsResponse {
  models: OllamaModelInfo[];
}

export interface OllamaRunningModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  expires_at: string;
  size_vram: number;
}

export interface OllamaProcessResponse {
  models: OllamaRunningModel[];
}

export type OllamaConnectionStatus = 'connected' | 'disconnected' | 'checking' | 'error';

// ============================================================
// 7. Event Bus Types
// ============================================================

export type EventCategory =
  | 'persist' | 'orchestrate' | 'mcp'
  | 'system' | 'security' | 'ui';

export type EventLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

// ============================================================
// 8. DevOps Types
// ============================================================

export type DAGNodeType =
  | 'trigger' | 'build' | 'test' | 'security'
  | 'deploy' | 'notify' | 'approval' | 'script' | 'mcp-tool';

export type DAGNodeStatus = 'idle' | 'running' | 'success' | 'failed';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  source: string;
  message: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  category: string;
  desc: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isCustom: true;
}

export interface DAGNode {
  id: string;
  type: DAGNodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, string>;
  status?: DAGNodeStatus;
}

export interface DAGEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface DAGWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: DAGNode[];
  edges: DAGEdge[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 9. NAS Diagnostics Types
// ============================================================

export type DiagnosticStatus = 'HEALTHY' | 'PARTIAL' | 'DEGRADED' | 'CRITICAL';

export interface EndpointDiagnostic {
  id: string;
  name: string;
  url: string;
  status: 'ok' | 'timeout' | 'error' | 'pending';
  latencyMs: number;
  error?: string;
}

// ============================================================
// 10. API Documentation Types
// ============================================================

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  path: string;
  summary: string;
  description: string;
  category: string;
  requestBody?: {
    contentType: string;
    schema: Record<string, unknown>;
    example: string;
  };
  parameters?: ApiParameter[];
  responses: ApiResponse[];
  tags: string[];
}

export interface ApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'body';
  required: boolean;
  type: string;
  description: string;
  default?: string;
}

export interface ApiResponse {
  status: number;
  description: string;
  example?: string;
}

// ============================================================
// 11. Prompt Template Types
// ============================================================

export interface PromptTemplate {
  id: string;
  icon: string; // emoji
  label: string;
  labelEn: string;
  prompt: string;
  category: 'code' | 'devops' | 'analysis' | 'security' | 'creative' | 'general';
  color: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  { id: 'code-review', icon: '🔍', label: '代码审查', labelEn: 'Code Review', prompt: '请对以下代码进行全面审查，包括性能、安全性和可维护性分析：\n\n', category: 'code', color: 'text-blue-400' },
  { id: 'refactor', icon: '🔧', label: '代码重构', labelEn: 'Refactor', prompt: '请重构以下代码，优化结构和性能：\n\n', category: 'code', color: 'text-green-400' },
  { id: 'debug', icon: '🐛', label: '调试分析', labelEn: 'Debug', prompt: '请帮我分析并修复以下Bug：\n\n错误信息：', category: 'code', color: 'text-red-400' },
  { id: 'deploy', icon: '🚀', label: '部署方案', labelEn: 'Deploy Plan', prompt: '请为以下服务设计部署方案，包括Docker配置、环境变量和健康检查：\n\n', category: 'devops', color: 'text-amber-400' },
  { id: 'docker', icon: '🐳', label: 'Docker配置', labelEn: 'Docker Config', prompt: '请生成Docker Compose配置文件：\n\n服务需求：', category: 'devops', color: 'text-cyan-400' },
  { id: 'architecture', icon: '🏗️', label: '架构设计', labelEn: 'Architecture', prompt: '请针对以下需求进行系统架构设计，给出组件图和数据流：\n\n', category: 'analysis', color: 'text-purple-400' },
  { id: 'security-audit', icon: '🛡️', label: '安全审计', labelEn: 'Security Audit', prompt: '请对以下代码/配置进行安全审计，按OWASP Top 10标准评估：\n\n', category: 'security', color: 'text-red-500' },
  { id: 'performance', icon: '⚡', label: '性能优化', labelEn: 'Performance', prompt: '请分析以下代码的性能瓶颈，并给出优化建议：\n\n', category: 'analysis', color: 'text-yellow-400' },
  { id: 'explain', icon: '📖', label: '概念解释', labelEn: 'Explain', prompt: '请用三层递进方式解释以下技术概念（一句话→详解→深度扩展）：\n\n', category: 'general', color: 'text-emerald-400' },
  { id: 'test', icon: '🧪', label: '测试用例', labelEn: 'Test Cases', prompt: '请为以下功能编写全面的测试用例，包括单元测试和集成测试：\n\n', category: 'code', color: 'text-pink-400' },
  { id: 'api-design', icon: '📡', label: 'API设计', labelEn: 'API Design', prompt: '请设计RESTful API接口，包括端点、请求体、响应格式和错误理：\n\n', category: 'analysis', color: 'text-sky-400' },
  { id: 'troubleshoot', icon: '🔬', label: '故障排查', labelEn: 'Troubleshoot', prompt: '集群出现以下异常，请进行根因分析并给出修复步骤：\n\n症状：', category: 'devops', color: 'text-orange-400' },
];

// ============================================================
// 12. File Upload Constants
// ============================================================

export const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  document: ['.txt', '.md', '.pdf', '.doc', '.docx', '.csv', '.json', '.xml', '.yaml', '.yml', '.toml'],
  code: ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.cpp', '.c', '.h', '.css', '.html', '.sql', '.sh', '.bash', '.zsh', '.fish'],
  image: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'],
  config: ['.env', '.gitignore', '.dockerignore', '.editorconfig', 'Dockerfile', 'Makefile', '.prettierrc'],
  archive: ['.zip', '.tar', '.gz', '.tgz', '.7z'],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES = 10;

// ============================================================
// 13. Utility Type Helpers
// ============================================================

/** Make all properties optional except the specified ones */
export type RequiredPick<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/** Create a dictionary type */
export type Dict<T> = Record<string, T>;

/** Nullable type helper */
export type Nullable<T> = T | null;

// ============================================================
// 14. YYC3 Max Database & Hardware Types
// ============================================================

export interface LocalSystemSpecs {
  hostName: 'yyc3-22';
  chip: 'Apple-M4-Max';
  cores: { performance: 16; efficiency: 40 };
  ram: '128GB';
  storage: { main: '2TB SN850X'; extra: '2TB SN850X' };
  ssh: { user: 'yyc3-22'; host: '192.168.3.22'; port: 22 };
}

export interface DatabaseConfig {
  engine: 'PostgreSQL 15';
  port: 5433;
  user: 'yyc3_max';
  dbName: 'yyc3_orchestration';
  status: 'connected' | 'disconnected' | 'syncing';
}

export type CollaborationMode = 'pipeline' | 'parallel' | 'debate' | 'ensemble' | 'delegation';

export interface AgentResult {
  agentId: string;
  role: string;
  output: string;
  confidence: number;
  latencyMs: number;
  tokensUsed: number;
  timestamp: string;
  pendingToolCall?: {
    toolName: string;
    arguments: any;
    confirmed: boolean;
    result?: string;
  };
}

export interface CollaborationTask {
  id: string;
  intent: string;
  mode: CollaborationMode;
  status: 'pending' | 'executing' | 'consensus' | 'completed' | 'failed';
  agents: {
    agentId: string;
    status: 'idle' | 'thinking' | 'executing' | 'done';
  }[];
  results: AgentResult[];
  finalOutput?: string;
  totalLatencyMs: number;
  totalTokens: number;
  hardwareTelemetry?: HardwareSnapshot;
}

export interface HardwareSnapshot {
  cpuLoad: number[];
  ramUsedGB: number;
  diskIOps: number;
  gpuLoad: number;
  tempCelsius: number;
  timestamp: string;
}

export const YYC3_MAX_SPECS: LocalSystemSpecs = {
  hostName: 'yyc3-22',
  chip: 'Apple-M4-Max',
  cores: { performance: 16, efficiency: 40 },
  ram: '128GB',
  storage: { main: '2TB SN850X', extra: '2TB SN850X' },
  ssh: { user: 'yyc3-22', host: '192.168.3.22', port: 22 },
};

export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  engine: 'PostgreSQL 15',
  port: 5433,
  user: 'yyc3_max',
  dbName: 'yyc3_orchestration',
  status: 'disconnected',
};
