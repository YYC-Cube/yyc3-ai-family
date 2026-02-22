import * as React from "react";
import { cn } from "@/lib/utils";
import { useSystemStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { AGENT_REGISTRY } from "@/lib/types";
import { loadAgentCustomConfig, getMergedAgents } from "@/lib/branding-config";
import { eventBus } from "@/lib/event-bus";
import { getLastInfraReport } from "@/lib/useInfraHealth";
import { loadProviderConfigs } from "@/lib/llm-bridge";
import { PROVIDERS } from "@/lib/llm-providers";
import { loadDeviceConfigs } from "@/lib/nas-client";
import { getAllLatencyHistories, syncLatencyToPg, queryPgLatencyHistory } from "@/lib/useInfraHealth";
import { getRunnerHealth, checkRunnerHealth, getGlobalExecutor } from "@/lib/useDAGExecutor";
import { getPgTelemetryConfig, setPgTelemetryConfig, getPgTelemetryState, checkPgTelemetryHealth, migrateLatencyToPostgres, getMigrationSQL, validateTelemetrySchema } from "@/lib/pg-telemetry-client";
import {
  Brain, Sparkles, Activity, Users, Network, Shield, Book,
  LayoutDashboard, Terminal, Wrench, HardDrive, Box, Cpu,
  Settings, Zap, Radio, Database, TestTube2, Rocket,
  MessageSquare, Compass, ArrowRight, Search, CornerDownLeft,
  Monitor, BarChart3, FileText, FlaskConical, Server,
  GitBranch, Play, RefreshCw, Trash2, Download, Upload,
  Eye, EyeOff, Command as CommandIcon,
  Gauge, Globe, Key, Clock, Wifi, Hash, Layers
} from "lucide-react";
import { ScrollArea } from "@/app/components/ui/scroll-area";

// ============================================================
// SlashCommandEngine — Smart Inline Command System
//
// Activated by typing `/` in the chat input:
//   /agent <name>     — Switch to a specific agent
//   /mode <nav|ai>    — Toggle chat mode
//   /go <target>      — Navigate to view/tab
//   /status           — Show system health summary
//   /deploy           — Quick DevOps actions
//   /mcp <tool>       — Invoke MCP tool
//   /clear            — Clear chat history
//   /diag             — Run diagnostics
//   /export           — Export current session
//   /theme            — Toggle theme settings
//   /help             — Show all commands
//
// Features:
//   - Fuzzy matching with Chinese + English keywords
//   - Auto-complete suggestions with descriptions
//   - Keyboard navigation (↑↓ Enter Esc)
//   - Contextual commands based on current view
//   - Agent personality injection
//
// Design: "/ is the universal entry point for power users"
// ============================================================

export interface SlashCommand {
  id: string;
  command: string;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: 'agent' | 'navigation' | 'action' | 'system' | 'devops';
  keywords: string[];
  action: (args?: string) => { consumed: boolean; response?: string; navigate?: () => void };
}

function buildCommands(): SlashCommand[] {
  const store = useSystemStore.getState();

  // Phase 51: Use merged agents (built-in + custom) for slash commands
  const allAgents = getMergedAgents(loadAgentCustomConfig());
  const agentCommands: SlashCommand[] = allAgents.map(agent => ({
    id: `agent-${agent.id}`,
    command: `/agent ${agent.id}`,
    label: `切换 ${agent.name}`,
    labelEn: `Switch to ${agent.nameEn}`,
    description: agent.desc,
    descriptionEn: agent.descEn,
    icon: Brain,
    color: agent.color,
    category: 'agent' as const,
    keywords: [agent.id, agent.name, agent.nameEn.toLowerCase(), agent.role.toLowerCase(), ...(agent.isCustom ? ['custom', '自定义'] : [])],
    action: () => {
      store.navigateToAgent(agent.id);
      return {
        consumed: true,
        response: `🤖 已切换至 **${agent.name}** (${agent.nameEn})${agent.isCustom ? ' [Custom]' : ''}\n\n> ${agent.desc}\n\n前往 Console → AI Agent 开始专项对话。`,
        navigate: () => store.navigateToAgent(agent.id),
      };
    },
  }));

  const navCommands: SlashCommand[] = [
    {
      id: 'go-dashboard', command: '/go dashboard', label: '总控台', labelEn: 'Dashboard',
      description: '打开集群总控仪表盘', descriptionEn: 'Open cluster dashboard',
      icon: LayoutDashboard, color: 'text-sky-400', category: 'navigation',
      keywords: ['dashboard', '仪表盘', '总控', 'home'],
      action: () => { store.navigateToConsoleTab('dashboard'); return { consumed: true }; },
    },
    {
      id: 'go-devops', command: '/go devops', label: 'DevOps 工作台', labelEn: 'DevOps Workspace',
      description: 'CI/CD 流水线和 DAG 编辑器', descriptionEn: 'CI/CD pipeline & DAG editor',
      icon: Terminal, color: 'text-emerald-400', category: 'navigation',
      keywords: ['devops', '运维', 'pipeline', 'ci/cd', '流水线'],
      action: () => { store.navigateToConsoleTab('devops'); return { consumed: true }; },
    },
    {
      id: 'go-mcp', command: '/go mcp', label: 'MCP 工具链', labelEn: 'MCP Hub',
      description: 'Model Context Protocol 工具管理', descriptionEn: 'MCP tool management',
      icon: Wrench, color: 'text-pink-400', category: 'navigation',
      keywords: ['mcp', '工具', 'tool', 'figma', 'github'],
      action: () => { store.navigateToConsoleTab('mcp'); return { consumed: true }; },
    },
    {
      id: 'go-persist', command: '/go persist', label: '持久化引擎', labelEn: 'Persistence',
      description: '三层存储与快照管理', descriptionEn: 'Three-tier storage & snapshots',
      icon: HardDrive, color: 'text-violet-400', category: 'navigation',
      keywords: ['persist', '持久化', 'storage', '存储', 'snapshot'],
      action: () => { store.navigateToConsoleTab('persist'); return { consumed: true }; },
    },
    {
      id: 'go-docker', command: '/go docker', label: 'Docker 管理', labelEn: 'Docker Manager',
      description: 'NAS 容器生命周期管理', descriptionEn: 'NAS container lifecycle',
      icon: Box, color: 'text-sky-400', category: 'navigation',
      keywords: ['docker', '容器', 'container', 'nas'],
      action: () => { store.navigateToConsoleTab('docker'); return { consumed: true }; },
    },
    {
      id: 'go-ollama', command: '/go ollama', label: 'Ollama 管理', labelEn: 'Ollama Manager',
      description: '本地模型管理与推理', descriptionEn: 'Local model management',
      icon: Cpu, color: 'text-purple-400', category: 'navigation',
      keywords: ['ollama', '本地模型', 'local', 'model'],
      action: () => { store.navigateToConsoleTab('ollama_manager'); return { consumed: true }; },
    },
    {
      id: 'go-orchestrate', command: '/go orchestrate', label: '协作编排', labelEn: 'Orchestrator',
      description: '多智能体协作编排工作流', descriptionEn: 'Multi-agent collaboration',
      icon: Network, color: 'text-cyan-400', category: 'navigation',
      keywords: ['orchestrate', '编排', '协作', 'collab', 'multi-agent'],
      action: () => { store.navigateToConsoleTab('orchestrate'); return { consumed: true }; },
    },
    {
      id: 'go-security', command: '/go security', label: '安全审计', labelEn: 'Security Audit',
      description: '安全态势与审计报告', descriptionEn: 'Security posture & audit',
      icon: Shield, color: 'text-red-400', category: 'navigation',
      keywords: ['security', '安全', 'audit', '审计'],
      action: () => { store.navigateToConsoleTab('security_audit'); return { consumed: true }; },
    },
    {
      id: 'go-hardware', command: '/go hardware', label: '硬件遥测', labelEn: 'Hardware Monitor',
      description: 'M4 Max 56核遥测看板', descriptionEn: 'M4 Max 56-core telemetry',
      icon: Monitor, color: 'text-orange-400', category: 'navigation',
      keywords: ['hardware', '硬件', 'telemetry', '遥测', 'monitor', 'cpu', 'gpu'],
      action: () => { store.navigateToConsoleTab('hardware_monitor'); return { consumed: true }; },
    },
    {
      id: 'go-settings', command: '/settings', label: '系统设置', labelEn: 'Settings',
      description: '打开系统配置面板', descriptionEn: 'Open settings panel',
      icon: Settings, color: 'text-zinc-400', category: 'navigation',
      keywords: ['settings', '设置', 'config', '配置'],
      action: () => { store.openSettings('general'); return { consumed: true }; },
    },
    {
      id: 'go-ops-scripts', command: '/go scripts', label: '运维脚本', labelEn: 'Ops Scripts',
      description: '一键生成运维 Shell 脚本', descriptionEn: 'One-click operation scripts',
      icon: FileText, color: 'text-amber-400', category: 'navigation',
      keywords: ['scripts', '脚本', 'ops', '运维', 'shell', 'bash'],
      action: () => { store.navigateToConsoleTab('ops_script'); return { consumed: true }; },
    },
    {
      id: 'go-manual', command: '/go manual', label: '操作手册', labelEn: 'Operation Manual',
      description: '打开系统操作指导手册', descriptionEn: 'Open system operation manual',
      icon: FileText, color: 'text-cyan-400', category: 'navigation',
      keywords: ['manual', '手册', 'guide', '指南', '帮助', 'documentation', '文档'],
      action: () => { store.navigateToConsoleTab('operation_manual'); return { consumed: true }; },
    },
    {
      id: 'go-nine-layers', command: '/go layers', label: '九层蓝图', labelEn: 'Nine-Layer Blueprint',
      description: '查看九层架构设计详细规划', descriptionEn: 'View nine-layer architecture blueprint',
      icon: Layers, color: 'text-indigo-400', category: 'navigation',
      keywords: ['layers', '九层', 'architecture', '架构', 'blueprint', '蓝图', 'nine', '设计'],
      action: () => { store.navigateToConsoleTab('nine_layer_architecture'); return { consumed: true }; },
    },
    {
      id: 'go-mode-control', command: '/go modes', label: '模式控制', labelEn: 'Mode Control',
      description: '打开 AI/导航模式控制面板', descriptionEn: 'Open AI/Navigate mode control panel',
      icon: Compass, color: 'text-amber-400', category: 'navigation',
      keywords: ['modes', '模式控制', 'mode-control', 'ai-mode', 'nav-mode', '切换'],
      action: () => { store.navigateToConsoleTab('mode_control'); return { consumed: true }; },
    },
    {
      id: 'go-pg-deploy', command: '/go pg-deploy', label: 'PG 代理部署', labelEn: 'PG Proxy Deploy',
      description: '打开 PG Proxy 部署工具包', descriptionEn: 'Open PG Proxy deployment toolkit',
      icon: Server, color: 'text-cyan-400', category: 'navigation',
      keywords: ['pg-deploy', 'proxy', '代理部署', 'pg-proxy', 'deploy-kit', '部署工具'],
      action: () => { store.navigateToConsoleTab('pg_proxy_deploy_kit'); return { consumed: true }; },
    },
  ];

  const actionCommands: SlashCommand[] = [
    {
      id: 'mode-toggle', command: '/mode', label: '切换模式', labelEn: 'Toggle Mode',
      description: '在导航模式和 AI 对话模式间切换', descriptionEn: 'Switch between Navigate & AI modes',
      icon: Compass, color: 'text-amber-400', category: 'action',
      keywords: ['mode', '模式', 'toggle', '切换', 'navigate', 'ai'],
      action: () => {
        store.toggleChatMode();
        const newMode = store.chatMode === 'ai' ? 'navigate' : 'ai';
        return { consumed: true, response: `🔄 已切换至 **${newMode === 'ai' ? 'AI 对话' : '导航'}** 模式` };
      },
    },
    {
      id: 'clear', command: '/clear', label: '空会话', labelEn: 'Clear Chat',
      description: '清空当前聊天记录', descriptionEn: 'Clear current chat history',
      icon: Trash2, color: 'text-red-400', category: 'action',
      keywords: ['clear', '清空', '清除', 'reset'],
      action: () => { store.clearMessages(); return { consumed: true }; },
    },
    {
      id: 'new-session', command: '/new', label: '新建会话', labelEn: 'New Session',
      description: '创建新的聊天会话', descriptionEn: 'Start a new chat session',
      icon: RefreshCw, color: 'text-emerald-400', category: 'action',
      keywords: ['new', '新建', 'session', '会话'],
      action: () => { store.newSession(); return { consumed: true }; },
    },
    {
      id: 'status', command: '/status', label: '系统状态', labelEn: 'System Status',
      description: '显示当前系统健康摘要', descriptionEn: 'Show system health summary',
      icon: Activity, color: 'text-emerald-400', category: 'system',
      keywords: ['status', '状态', 'health', '健康', '诊断'],
      action: () => {
        const s = useSystemStore.getState();
        const metrics = s.clusterMetrics?.['m4-max'];
        const statusEmoji = s.status === 'optimal' ? '🟢' : s.status === 'warning' ? '🟡' : '🔴';
        return {
          consumed: true,
          response: [
            `## ${statusEmoji} 系统状态报告`,
            '',
            `| 指标 | 值 |`,
            `|------|-----|`,
            `| 状态 | ${s.status.toUpperCase()} |`,
            `| CPU | ${s.cpuLoad}% |`,
            `| 内存 | ${metrics?.memory?.toFixed(0) ?? '--'}% |`,
            `| 延迟 | ${s.latency}ms |`,
            `| 温度 | ${metrics?.temperature?.toFixed(0) ?? '--'}°C |`,
            `| DB | ${s.dbConnected ? 'PG15 Connected' : 'Offline'} |`,
            `| 消息 | ${s.messages.length} |`,
            `| 日志 | ${s.logs.length} |`,
            '',
            `_${new Date().toLocaleTimeString()}_`,
          ].join('\n'),
        };
      },
    },
    {
      id: 'diag', command: '/diag', label: '运行诊断', labelEn: 'Run Diagnostics',
      description: '启动系统自诊断流程', descriptionEn: 'Start system self-diagnosis',
      icon: Radio, color: 'text-purple-400', category: 'system',
      keywords: ['diag', '诊断', 'diagnose', 'scan', '扫描'],
      action: () => {
        store.runDiagnosis();
        return { consumed: true, response: '🔍 已启动系统深度诊断...\n\n请查看 Console → Dashboard 获取实时诊断结果。' };
      },
    },
    {
      id: 'env', command: '/env', label: '环境状态', labelEn: 'Environment',
      description: '显示运行环境与连接状态全景', descriptionEn: 'Show runtime environment & connection status',
      icon: Globe, color: 'text-cyan-400', category: 'system',
      keywords: ['env', '环境', 'environment', '运行时', 'runtime', 'node', 'version'],
      action: () => {
        const s = useSystemStore.getState();
        const metrics = s.clusterMetrics?.['m4-max'];
        const lsKeys = (() => { try { let n = 0; for (let i = 0; i < localStorage.length; i++) { if (localStorage.key(i)?.startsWith('yyc3')) n++; } return n; } catch { return 0; } })();
        return {
          consumed: true,
          response: [
            '## 🌐 运行环境全景',
            '',
            '| 项目 | 值 |',
            '|------|-----|',
            `| Platform | Apple M4 Max (128GB Unified) |`,
            `| Hostname | yyc3-22 (192.168.3.22) |`,
            `| Runtime | Vite + React 18 + Tailwind v4 |`,
            `| State Mgmt | Zustand v5 |`,
            `| Browser | ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'} |`,
            `| Resolution | ${window.innerWidth}x${window.innerHeight} |`,
            `| DB | PostgreSQL 15 (port 5433, ${s.dbConnected ? 'CONNECTED' : 'OFFLINE'}) |`,
            `| Schemas | orchestration, knowledge (pgvector), telemetry |`,
            `| Storage | SN850X 2TB PCIe 4.0 |`,
            `| localStorage | ${lsKeys} YYC3 keys |`,
            `| CPU Load | ${s.cpuLoad}% |`,
            `| Temp | ${metrics?.temperature?.toFixed(0) ?? '--'}°C |`,
            `| Uptime | ${metrics?.uptime ? Math.floor(metrics.uptime / 3600) + 'h' : '--'} |`,
            '',
            `_Generated: ${new Date().toLocaleString()}_`,
          ].join('\n'),
        };
      },
    },
    {
      id: 'perf', command: '/perf', label: '性能快照', labelEn: 'Performance Snapshot',
      description: '采集当前性能指标快照', descriptionEn: 'Capture current performance metrics snapshot',
      icon: Gauge, color: 'text-orange-400', category: 'system',
      keywords: ['perf', '性能', 'performance', 'benchmark', 'snapshot', '快照', '指标'],
      action: () => {
        const s = useSystemStore.getState();
        const metrics = s.clusterMetrics;
        const m4 = metrics?.['m4-max'];
        const memInfo = typeof performance !== 'undefined' && (performance as any).memory
          ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)}MB`
          : 'N/A (non-Chrome)';

        store.addLog('info', 'PERF', 'Performance snapshot captured');
        eventBus.emit({
          category: 'system', type: 'system.perf_snapshot', level: 'info',
          source: 'SlashCmd', message: 'Performance snapshot captured',
          metadata: { cpuLoad: s.cpuLoad, latency: s.latency, messages: s.messages.length },
        });

        const nodes = metrics ? Object.entries(metrics).filter(([k]) => k !== 'timestamp').map(([k, v]) => {
          const n = v as any;
          return `| ${k} | ${Math.round(n.cpu)}% | ${Math.round(n.memory)}% | ${Math.round(n.temperature)}°C | ${Math.round(n.disk)}% |`;
        }) : ['| -- | -- | -- | -- | -- |'];

        return {
          consumed: true,
          response: [
            '## ⚡ 性能快照',
            '',
            '### 集群节点指标',
            '| Node | CPU | MEM | TEMP | DISK |',
            '|------|-----|-----|------|------|',
            ...nodes,
            '',
            '### 前端运行时',
            `| 指标 | 值 |`,
            `|------|-----|`,
            `| JS Heap | ${memInfo} |`,
            `| DOM Nodes | ${document.querySelectorAll('*').length} |`,
            `| Latency | ${s.latency}ms |`,
            `| Messages | ${s.messages.length} |`,
            `| Logs | ${s.logs.length} |`,
            `| EventBus | ${eventBus.totalEvents} events total |`,
            '',
            `_Captured: ${new Date().toLocaleTimeString()}_`,
          ].join('\n'),
        };
      },
    },
    {
      id: 'db', command: '/db', label: '数据库信息', labelEn: 'Database Info',
      description: '显示 PostgreSQL 15 连接和 Schema 信息', descriptionEn: 'Show PostgreSQL 15 connection & schema info',
      icon: Database, color: 'text-sky-400', category: 'system',
      keywords: ['db', '数据库', 'database', 'postgres', 'postgresql', 'schema', 'pg', 'sql'],
      action: () => {
        const s = useSystemStore.getState();
        store.addLog('info', 'DB', 'Database info requested via /db');
        return {
          consumed: true,
          response: [
            '## 🗄️ PostgreSQL 15 数据库',
            '',
            `**连接状态:** ${s.dbConnected ? '🟢 CONNECTED' : '🔴 OFFLINE'}`,
            `**主机:** 192.168.3.22:5433`,
            `**用户:** yyc3_max`,
            '',
            '### Schema 架构',
            '',
            '| Schema | 用途 | 核心表 |',
            '|--------|------|--------|',
            '| orchestration | 任务生命周期管理 | tasks, agent_sessions, workflows |',
            '| knowledge | pgvector 向量记忆 | documents, embeddings, chunks |',
            '| telemetry | 硬件遥测时序数据 | metrics, thermal_log, alerts |',
            '',
            '### 关键配置',
            '- **Extensions:** pgvector, pg_trgm, uuid-ossp',
            '- **Connection Pool:** max_connections=100',
            '- **WAL:** replica level, 1GB max',
            '- **Backup:** 每日增量 → NAS RAID6',
            '',
            '💡 前往 **Console → Hardware Monitor** 查看 PG15 详细状态。',
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('hardware_monitor'),
        };
      },
    },
    {
      id: 'ssh', command: '/ssh', label: 'SSH 连接', labelEn: 'SSH Connect',
      description: '显示 SSH 连接命令和节点信息', descriptionEn: 'Show SSH connection commands & node info',
      icon: Terminal, color: 'text-emerald-400', category: 'system',
      keywords: ['ssh', '远程', 'remote', 'connect', '连接', 'shell', 'terminal'],
      action: (args) => {
        const node = args?.trim() || 'nas';
        store.addLog('info', 'SSH', `SSH info requested: ${node}`);
        
        const nodes: Record<string, { host: string; user: string; desc: string }> = {
          nas: { host: '192.168.3.22', user: 'yyc3', desc: 'TerraMaster NAS (Docker Host)' },
          m4: { host: '192.168.3.22', user: 'yyc3', desc: 'M4 Max Primary Node' },
          imac: { host: '192.168.3.x', user: 'yyc3', desc: 'iMac M4 Render Node' },
        };
        const target = nodes[node] || nodes['nas'];

        return {
          consumed: true,
          response: [
            `## 🔐 SSH 连接信息 — ${node}`,
            '',
            `**节点:** ${target.desc}`,
            '',
            '```bash',
            `# SSH 连接`,
            `ssh ${target.user}@${target.host}`,
            '',
            `# 带端口转发 (PostgreSQL)`,
            `ssh -L 5433:localhost:5433 ${target.user}@${target.host}`,
            '',
            `# Docker 命令代理`,
            `ssh ${target.user}@${target.host} docker ps`,
            '',
            `# 文件传输`,
            `scp ./dist.tar.gz ${target.user}@${target.host}:/opt/yyc3/`,
            '```',
            '',
            '**可用节点:** `/ssh nas` | `/ssh m4` | `/ssh imac`',
          ].join('\n'),
        };
      },
    },
    {
      id: 'health', command: '/health', label: '基础设施健康', labelEn: 'Infra Health Check',
      description: '检查所有基础设施服务连通性', descriptionEn: 'Check all infrastructure service connectivity',
      icon: Activity, color: 'text-emerald-400', category: 'system',
      keywords: ['health', '健康', 'check', '检查', 'connectivity', '连通', 'infra', '基础设施', 'probe'],
      action: () => {
        const report = getLastInfraReport();
        store.addLog('info', 'HEALTH', 'Infrastructure health report requested via /health');
        eventBus.emit({
          category: 'system', type: 'system.health_report', level: 'info',
          source: 'SlashCmd', message: 'Infrastructure health report requested',
        });

        if (!report || report.status === 'idle') {
          return {
            consumed: true,
            response: [
              '## 🏥 基础设施健康检查',
              '',
              '⚠️ **尚未运行健康检查。**',
              '',
              '请前往 **Console → Dashboard** 的 Infrastructure Health Matrix 面板运行检查。',
              '或使用 `/go dashboard` 快速跳转。',
            ].join('\n'),
            navigate: () => store.navigateToConsoleTab('dashboard'),
          };
        }

        const statusEmoji = (s: string) => s === 'online' ? '🟢' : s === 'degraded' ? '🟡' : s === 'offline' ? '🔴' : '⚪';
        const { checks, summary, totalMs } = report;

        const deviceChecks = checks.filter(c => c.category === 'device');
        const serviceChecks = checks.filter(c => c.category === 'service');
        const runtimeChecks = checks.filter(c => c.category === 'runtime');
        const providerChecks = checks.filter(c => c.category === 'provider');

        return {
          consumed: true,
          response: [
            '## 🏥 基础设施健康报告',
            '',
            `**状态:** ${summary.online}/${summary.total} 在线 | ${summary.offline} 离线 | ${summary.degraded} 降级`,
            `**耗时:** ${totalMs}ms`,
            '',
            '### 集群节点',
            '| 节点 | 状态 | 延迟 | 详情 |',
            '|------|------|------|------|',
            ...deviceChecks.map(c => `| ${statusEmoji(c.status)} ${c.name} | ${c.status.toUpperCase()} | ${c.latencyMs ?? '--'}ms | ${c.detail || '--'} |`),
            '',
            '### 确服务',
            '| 服务 | 状态 | 延迟 | 端点 |',
            '|------|------|------|------|',
            ...serviceChecks.map(c => `| ${statusEmoji(c.status)} ${c.name} | ${c.status.toUpperCase()} | ${c.latencyMs ?? '--'}ms | ${c.endpoint || '--'} |`),
            '',
            '### 运行时',
            ...runtimeChecks.map(c => `- ${statusEmoji(c.status)} **${c.name}**: ${c.detail || c.status}`),
            ...providerChecks.map(c => `- ${statusEmoji(c.status)} **${c.name}**: ${c.detail || c.status}`),
            '',
            `_Last check: ${new Date(report.completedAt).toLocaleTimeString()}_`,
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('dashboard'),
        };
      },
    },
    {
      id: 'infra', command: '/infra', label: '基础设施拓扑', labelEn: 'Infrastructure Topology',
      description: '显示集群设备拓扑和服务端点', descriptionEn: 'Show cluster device topology & service endpoints',
      icon: Server, color: 'text-violet-400', category: 'system',
      keywords: ['infra', '基础设施', 'infrastructure', 'topology', '拓扑', 'cluster', '集群', 'node', '节点'],
      action: () => {
        const devices = loadDeviceConfigs();
        store.addLog('info', 'INFRA', 'Infrastructure topology requested via /infra');

        const deviceRows = devices.map(d => {
          const httpSvcs = d.services.filter(s => s.enabled).map(s => `${s.name}(:${s.port})`).join(', ');
          return `| ${d.displayName} | ${d.ip} | ${d.chip} | ${d.ram} | ${httpSvcs || 'None'} |`;
        });

        return {
          consumed: true,
          response: [
            '## 🖥️ 基础设施拓扑',
            '',
            '### 集群设备',
            '| 设备 | IP | 芯片 | 内存 | 服务 |',
            '|------|-----|------|------|------|',
            ...deviceRows,
            '',
            '### 核心服务端点',
            '| 服务 | 端点 | 协议 |',
            '|------|------|------|',
            '| PostgreSQL 15 | 192.168.3.22:5433 | TCP |',
            '| Ollama LLM | 192.168.3.22:11434 | HTTP |',
            '| Docker Engine | 192.168.3.45:2375 | HTTP |',
            '| SQLite Proxy | 192.168.3.45:8484 | HTTP |',
            '| Telemetry WS | 192.168.3.22:3001 | WebSocket |',
            '| NAS Web UI | 192.168.3.45:9898 | HTTPS |',
            '',
            '### 数据库 Schema (PG15)',
            '- `orchestration` — 任务/Agent会话/工作流',
            '- `knowledge` — pgvector 向量嵌入/知识块',
            '- `telemetry` — 硬件遥测/时序指标/告警',
            '',
            '💡 使用 `/health` 检查连通性，或 `/go hardware` 查看遥测。',
          ].join('\n'),
        };
      },
    },
    {
      id: 'model', command: '/model', label: '模型路由状态', labelEn: 'Model Routing Status',
      description: '显示当前 LLM Provider 和模型配置', descriptionEn: 'Show current LLM provider & model config',
      icon: Layers, color: 'text-pink-400', category: 'system',
      keywords: ['model', '模型', 'provider', 'routing', '路由', 'llm', 'config', 'switch'],
      action: () => {
        const configs = loadProviderConfigs();
        const enabled = configs.filter(c => c.enabled && c.apiKey);
        const totalProviders = Object.keys(PROVIDERS).length;
        store.addLog('info', 'MODEL', 'Model routing status requested via /model');

        const providerRows = Object.values(PROVIDERS).map(p => {
          const cfg = configs.find(c => c.providerId === p.id);
          const isEnabled = cfg?.enabled && cfg?.apiKey;
          const statusIcon = isEnabled ? '\u{1F7E2}' : '\u{26AA}';
          const modelName = cfg?.defaultModel || p.defaultModel;
          return `| ${statusIcon} ${p.displayName} | ${p.icon} | ${modelName} | ${isEnabled ? 'Active' : 'Inactive'} | ${p.models.length} |`;
        });

        return {
          consumed: true,
          response: [
            '## \u{1F9E0} LLM 模型路由状态',
            '',
            `**已激活:** ${enabled.length}/${totalProviders} providers`,
            '',
            '### Provider 列表',
            '| Provider | ID | 默认模型 | 状态 | 可用模型 |',
            '|----------|-----|---------|------|---------|',
            ...providerRows,
            '',
            '### 路由策略',
            '- **健康评分驱动** (0-100 HealthScore)',
            '- **三态熔断器** (CLOSED \u{2192} OPEN \u{2192} HALF_OPEN)',
            '- **自动 Failover** (链式降级)',
            '- **Dev Proxy** (Vite CORS 绕行)',
            '',
            '### 快捷操作',
            '- `/go ollama` \u{2192} 本地模型管理',
            '- `/settings` \u{2192} 打开模型配置面板',
            '- `/go scripts` \u{2192} 模型诊断脚本',
            '',
            `_${new Date().toLocaleTimeString()}_`,
          ].join('\n'),
          navigate: () => store.openSettings('models'),
        };
      },
    },
    {
      id: 'scripts', command: '/scripts', label: '运维脚本', labelEn: 'Ops Scripts',
      description: '打开一键运维脚本中心', descriptionEn: 'Open one-click operations script center',
      icon: FileText, color: 'text-amber-400', category: 'system',
      keywords: ['scripts', '脚本', 'ops', '运维', 'shell', 'bash', 'generate', '生成'],
      action: () => {
        store.addLog('info', 'OPS', 'Ops scripts center opened via /scripts');
        store.navigateToConsoleTab('ops_script');
        return {
          consumed: true,
          response: [
            '## \u{1F4DC} 运维脚本中心',
            '',
            '已跳转至 **Console \u{2192} Ops Scripts** 面板。',
            '',
            '### 可用脚本类别',
            '| 类别 | 脚本数 | 用途 |',
            '|------|--------|------|',
            '| Deploy | 2 | 一键部署 / Docker Compose |',
            '| Database | 2 | PG15 备份 / VACUUM 维护 |',
            '| Health | 1 | 全服务探活脚本 |',
            '| Backup | 1 | 系统快照归档 |',
            '| Model | 2 | Ollama 管理 / 路由诊断 |',
            '| Bootstrap | 2 | 遥测代理 / 系统初始化 |',
            '',
            '\u{1F4A1} 所有脚本可一键复制到剪贴板，直接在终端执行。',
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('ops_script'),
        };
      },
    },
    {
      id: 'telemetry', command: '/telemetry', label: '遥测代理管理', labelEn: 'Telemetry Agent',
      description: '管理 yyc3-telemetry-agent 部署与连接', descriptionEn: 'Manage telemetry agent deployment & connection',
      icon: Radio, color: 'text-pink-400', category: 'system',
      keywords: ['telemetry', '遥测', 'agent', '代理', 'hardware', 'monitor', 'stream', 'ws', 'websocket'],
      action: () => {
        store.addLog('info', 'TELEMETRY', 'Telemetry agent manager opened via /telemetry');
        store.navigateToConsoleTab('telemetry_agent_manager');
        return {
          consumed: true,
          response: [
            '## 📡 YYC3 遥测代理管理器',
            '',
            '已跳转至 **Console → Telemetry Agent** 面板。',
            '',
            '### 代理信息',
            '| 项目 | 值 |',
            '|------|-----|',
            '| 目标主机 | 192.168.3.22 (yyc3-22) |',
            '| WebSocket | ws://192.168.3.22:3001/telemetry |',
            '| HTTP API | http://192.168.3.22:3001/health |',
            '| SSE | http://192.168.3.22:3001/sse/telemetry |',
            '',
            '### 功能',
            '- 连接状态测试 (WS + HTTP)',
            '- 一键部署脚本生成',
            '- Node.js Agent 源码模板',
            '- launchd 服务配置',
            '- 数据源切换 (真实/模拟)',
            '',
            '💡 使用面板中的 **Test Connection** 验证代理部署状态。',
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('telemetry_agent_manager'),
        };
      },
    },
    {
      id: 'trends', command: '/trends', label: '延迟趋势', labelEn: 'Latency Trends',
      description: '查看基础设施服务延迟历史趋势', descriptionEn: 'View infrastructure service latency history trends',
      icon: BarChart3, color: 'text-cyan-400', category: 'system',
      keywords: ['trends', '趋势', 'latency', '延迟', 'history', '历史', 'chart', '图表'],
      action: () => {
        store.addLog('info', 'TRENDS', 'Latency trend data requested via /trends');
        const histories = getAllLatencyHistories();
        const serviceIds = ['svc-docker', 'svc-sqlite', 'svc-ollama', 'svc-pg15', 'svc-telemetry'];
        const serviceLabels: Record<string, string> = {
          'svc-docker': 'Docker Engine',
          'svc-sqlite': 'SQLite Proxy',
          'svc-ollama': 'Ollama LLM',
          'svc-pg15': 'PostgreSQL 15',
          'svc-telemetry': 'Telemetry WS',
        };

        const hasData = serviceIds.some(id => (histories[id]?.length || 0) > 0);

        if (!hasData) {
          return {
            consumed: true,
            response: [
              '## 📈 延迟趋势',
              '',
              '⚠️ 尚无延迟历史数据。',
              '',
              '请运行 **Infrastructure Health Check** 至少 2 次以生成趋势。',
              '前往 Console → Dashboard 或使用 `/health` 命令。',
            ].join('\n'),
            navigate: () => store.navigateToConsoleTab('dashboard'),
          };
        }

        const rows = serviceIds
          .filter(id => histories[id]?.length > 0)
          .map(id => {
            const entries = histories[id]!;
            const values = entries.map(e => e.latencyMs);
            const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
            const max = Math.max(...values);
            const min = Math.min(...values);
            const current = values[values.length - 1];
            const trend = values.length >= 2 ? values[values.length - 1] - values[values.length - 2] : 0;
            const trendIcon = trend > 20 ? '📈' : trend < -20 ? '📉' : '➡️';
            return `| ${serviceLabels[id]} | ${current}ms | ${avg}ms | ${min}ms | ${max}ms | ${trendIcon} ${trend > 0 ? '+' : ''}${trend}ms | ${entries.length} |`;
          });

        return {
          consumed: true,
          response: [
            '## 📈 基础设施延迟趋势',
            '',
            '| 服务 | 当前 | 平均 | 最低 | 最高 | 趋势 | 样本 |',
            '|------|------|------|------|------|------|------|',
            ...rows,
            '',
            '💡 前往 **Console → Dashboard → InfraHealthMatrix** 查看交互式趋势图。',
            '',
            `_Updated: ${new Date().toLocaleTimeString()}_`,
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('infra_health'),
        };
      },
    },
    {
      id: 'runner', command: '/runner', label: 'Runner 服务', labelEn: 'Runner Service',
      description: '查看 DAG 命令执行器 Runner 状态', descriptionEn: 'Check DAG command runner service status',
      icon: Play, color: 'text-amber-400', category: 'system',
      keywords: ['runner', '执行器', 'executor', 'real', 'pipeline', 'dag', 'service'],
      action: () => {
        const runner = getRunnerHealth();
        store.addLog('info', 'RUNNER', 'Runner service status requested via /runner');
        const statusEmoji = runner.status === 'online' ? '🟢' : runner.status === 'offline' ? '🔴' : runner.status === 'error' ? '🟡' : '⚪';
        return {
          consumed: true,
          response: [
            '## 🔧 YYC3 Runner Service',
            '',
            `**状态:** ${statusEmoji} ${runner.status.toUpperCase()}`,
            `**端点:** http://192.168.3.22:3002/api/execute`,
            runner.latencyMs !== undefined ? `**延迟:** ${runner.latencyMs}ms` : '',
            runner.version ? `**版本:** v${runner.version}` : '',
            runner.error ? `**错误:** ${runner.error}` : '',
            '',
            '### Runner 端点',
            '| 端点 | 方法 | 用途 |',
            '|------|------|------|',
            '| /api/execute | POST | 执行 Shell 命令 |',
            '| /health | GET | 健康检查 |',
            '| /api/history | GET | 执行历史 |',
            '',
            '💡 前往 **Console → Telemetry Agent → Runner Service** 获取部署脚本。',
          ].filter(Boolean).join('\\n'),
          navigate: () => store.navigateToConsoleTab('telemetry_agent_manager'),
        };
      },
    },
    {
      id: 'dag', command: '/dag', label: 'DAG 流水线状态', labelEn: 'DAG Pipeline Status',
      description: '查看当前 DAG 流水线执行状态汇总', descriptionEn: 'View current DAG pipeline execution summary',
      icon: GitBranch, color: 'text-purple-400', category: 'system',
      keywords: ['dag', '流水线', 'pipeline', 'execution', '执行', 'run', 'runs'],
      action: () => {
        store.addLog('info', 'DAG', 'DAG pipeline status requested via /dag');
        const executor = getGlobalExecutor();
        if (!executor || executor.runs.length === 0) {
          return {
            consumed: true,
            response: [
              '## ⚙️ DAG 流水线状态',
              '',
              '⚠️ 暂无流水线执行记录。',
              '',
              '### 触发方式',
              '- `/deploy` — 快速部署流水线',
              '- `/build` — 构建流水线',
              '- `/pipeline <name>` — 自定义流水线',
              '- CommandCenter → Quick Actions',
              '',
              `**执行模式:** ${executor?.executionMode || 'simulated'}`,
            ].join('\\n'),
            navigate: () => store.navigateToConsoleTab('dashboard'),
          };
        }
        const { runs, executionMode } = executor;
        const running = runs.filter(r => r.status === 'running');
        const succeeded = runs.filter(r => r.status === 'success');
        const failed = runs.filter(r => r.status === 'failed');
        const recentRows = runs.slice(0, 5).map(r => {
          const se = r.status === 'success' ? '✅' : r.status === 'failed' ? '❌' : r.status === 'running' ? '🔄' : '⏸️';
          const el = r.completedAt ? `${((r.completedAt - r.startedAt) / 1000).toFixed(1)}s` : `${((Date.now() - r.startedAt) / 1000).toFixed(0)}s+`;
          return `| ${se} ${r.name} | ${r.status} | ${el} | ${r.stages.length} | ${r.progress}% |`;
        });
        return {
          consumed: true,
          response: [
            '## ⚙️ DAG 流水线状态',
            '',
            `**执行模式:** ${executionMode === 'real' ? '🔧 REAL' : '🎮 SIM'}`,
            `**统计:** ${succeeded.length} ✅ | ${failed.length} ❌ | ${running.length} 🔄`,
            '',
            '| 名称 | 状态 | 耗时 | 阶段 | 进度 |',
            '|------|------|------|------|------|',
            ...recentRows,
          ].join('\\n'),
          navigate: () => store.navigateToConsoleTab('dashboard'),
        };
      },
    },
    {
      id: 'pg-telemetry', command: '/pg-telemetry', label: 'PG 遥测数据库', labelEn: 'PG Telemetry DB',
      description: '查看 PostgreSQL telemetry schema 连接状态', descriptionEn: 'Check PostgreSQL telemetry schema connection',
      icon: Database, color: 'text-cyan-400', category: 'system',
      keywords: ['pg-telemetry', 'telemetry-db', 'postgres', 'schema', '遥测数据库', 'pg-proxy', '持久化'],
      action: () => {
        const pgState = getPgTelemetryState();
        const pgConfig = getPgTelemetryConfig();
        store.addLog('info', 'PG_TELEMETRY', 'PG telemetry status requested via /pg-telemetry');
        const statusEmoji = pgState.status === 'connected' ? '🟢' : pgState.status === 'disconnected' ? '🔴' : pgState.status === 'error' ? '🟡' : '⚪';
        return {
          consumed: true,
          response: [
            '## 🗃️ PG Telemetry Schema',
            '',
            `**状态:** ${statusEmoji} ${pgState.status.toUpperCase()}`,
            `**代理端点:** ${pgConfig.baseUrl}`,
            `**已启用:** ${pgConfig.enabled ? '✅ 是' : '❌ 否'}`,
            pgState.latencyMs !== undefined ? `**延迟:** ${pgState.latencyMs}ms` : '',
            pgState.version ? `**版本:** ${pgState.version}` : '',
            pgState.tableCount !== undefined ? `**表数量:** ${pgState.tableCount}` : '',
            pgState.rowCount !== undefined ? `**总行数:** ${pgState.rowCount}` : '',
            pgState.error ? `**错误:** ${pgState.error}` : '',
            '',
            '### Schema 表结构',
            '| 表名 | 用途 |',
            '|------|------|',
            '| telemetry.metrics | 节点硬件时序指标 |',
            '| telemetry.thermal_log | 温度区域快照 |',
            '| telemetry.alerts | 阈值告警记录 |',
            '| telemetry.latency_history | 基础设施延迟历史 |',
            '',
            '### 操作指南',
            '- `/pg-migrate` — 将 localStorage 数据迁移到 PG',
            '- `/pg-schema` — 获取 SQL 迁移脚本',
            '- Console → Telemetry Agent → PG Schema tab — 部署配置',
            '',
            `_Last check: ${pgState.lastChecked ? new Date(pgState.lastChecked).toLocaleTimeString() : 'Never'}_`,
          ].filter(Boolean).join('\n'),
        };
      },
    },
    {
      id: 'pg-migrate', command: '/pg-migrate', label: '数据迁移到 PG', labelEn: 'Migrate to PG',
      description: '将 localStorage 延迟数据迁移到 PostgreSQL', descriptionEn: 'Migrate localStorage latency data to PostgreSQL',
      icon: Upload, color: 'text-cyan-400', category: 'system',
      keywords: ['pg-migrate', 'migrate', '迁移', 'postgresql', 'transfer', '转移', 'localStorage'],
      action: () => {
        const pgConfig = getPgTelemetryConfig();
        store.addLog('info', 'PG_MIGRATE', 'PG migration requested via /pg-migrate');

        if (!pgConfig.enabled) {
          return {
            consumed: true,
            response: [
              '## ⚠️ PG 遥测迁移',
              '',
              '**PG Telemetry 尚未启用。**',
              '',
              '### 启用步骤',
              '1. 在 192.168.3.22 部署 `yyc3-pg-proxy` 服务 (端口 3003)',
              '2. 运行 SQL 迁移脚本创建 telemetry schema',
              '3. 前往 Console → Metrics History → PG Telemetry 面板启用连接',
              '',
              '### 快捷操作',
              '- `/pg-schema` — 获取 SQL 迁移脚本',
              '- `/pg-telemetry` — 查看当前 PG 状态',
            ].join('\n'),
          };
        }

        const histories = getAllLatencyHistories();
        const totalEntries = Object.values(histories).reduce((sum, e) => sum + e.length, 0);

        if (totalEntries === 0) {
          return {
            consumed: true,
            response: [
              '## ℹ️ PG 遥测迁移',
              '',
              '**localStorage 中没有延迟历史数据可迁移。**',
              '',
              '请先运行 Infrastructure Health Check 生成数据。',
              '使用 `/health` 或前往 Console → Dashboard。',
            ].join('\n'),
          };
        }

        // Trigger async migration
        migrateLatencyToPostgres(histories).then(result => {
          const msg = result.success
            ? `✅ 迁移完成: ${result.insertedRecords}/${result.totalRecords} 条记录 (${result.durationMs}ms)`
            : `⚠️ 迁移部分失败: ${result.insertedRecords}/${result.totalRecords} 条记录, 失败: ${result.failedChecks.join(', ')}`;
          store.addLog(result.success ? 'success' : 'warn', 'PG_MIGRATE', msg);
        });

        return {
          consumed: true,
          response: [
            '## 🔄 开始 PG 遥测数据迁移',
            '',
            `**源:** localStorage (${Object.keys(histories).length} 个检查点, ${totalEntries} 条记录)`,
            `**目标:** ${pgConfig.baseUrl}/telemetry/latency_history`,
            '',
            '迁移已在后台启动，请检查 EventBus 事件流获取进度。',
            '',
            '💡 使用 `/pg-telemetry` 查看最终结果。',
          ].join('\n'),
        };
      },
    },
    {
      id: 'pg-deploy', command: '/pg-deploy', label: 'PG 代理部署', labelEn: 'PG Proxy Deploy',
      description: '打开 PG Proxy 部署工具包面板', descriptionEn: 'Open PG Proxy deployment toolkit panel',
      icon: Server, color: 'text-cyan-400', category: 'system',
      keywords: ['pg-deploy', 'deploy', '部署', 'proxy', '代理', 'pg-proxy', '3003'],
      action: () => {
        store.addLog('info', 'PG_DEPLOY', 'PG Proxy deploy toolkit opened via /pg-deploy');
        store.navigateToConsoleTab('pg_proxy_deploy_kit');
        return {
          consumed: true,
          response: [
            '## 🚀 PG Proxy 部署工具包',
            '',
            '已跳转至 **Console → PG 代理部署** 面板。',
            '',
            '### 部署流程',
            '1. **环境预检** — Node.js、PG15、yyc3_max 用户',
            '2. **生成文件** — pg-proxy.js v2、package.json',
            '3. **应用 Schema** — 4 张表 + 2 个视图',
            '4. **安装依赖** — express, pg, cors',
            '5. **启动服务** — node pg-proxy.js (端口 3003)',
            '6. **健康检查** — GET /health',
            '7. **Schema 验证** — 4 tables + 2 views',
            '',
            '### 快速命令',
            '```bash',
            'ssh yyc3@192.168.3.22',
            'cd /opt/yyc3/pg-proxy && npm install && node pg-proxy.js',
            '```',
            '',
            '💡 面板提供一键复制所有部署脚本。',
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('pg_proxy_deploy_kit'),
        };
      },
    },
    {
      id: 'pg-validate', command: '/pg-validate', label: 'Schema 验证', labelEn: 'Schema Validate',
      description: '验证 telemetry schema 表/视图是否完整', descriptionEn: 'Validate telemetry schema tables/views exist',
      icon: Shield, color: 'text-cyan-400', category: 'system',
      keywords: ['pg-validate', 'validate', '验证', 'schema', 'check', '检查', 'table'],
      action: () => {
        const pgConfig = getPgTelemetryConfig();
        store.addLog('info', 'PG_VALIDATE', 'Schema validation requested via /pg-validate');

        if (!pgConfig.enabled) {
          return {
            consumed: true,
            response: [
              '## ⚠️ Schema 验证',
              '',
              '**PG Telemetry 尚未启用。**',
              '',
              '请先启用 PG Telemetry：',
              '1. 前往 Console → PG 代理部署 → Connection 标签',
              '2. 开启 PG Telemetry 开关',
              '3. 测试连接',
              '',
              '💡 使用 `/pg-deploy` 打开部署面板。',
            ].join('\n'),
          };
        }

        // Trigger async validation
        validateTelemetrySchema().then(result => {
          const msg = result.valid
            ? `✅ Schema 验证通过: ${result.tables.length} 表已确认 (${result.latencyMs}ms)`
            : `⚠️ Schema 验证失败: ${result.error || '部分表缺失'} (${result.latencyMs}ms)`;
          store.addLog(result.valid ? 'success' : 'warn', 'PG_VALIDATE', msg);
        });

        return {
          consumed: true,
          response: [
            '## 🔍 Schema 验证已启动',
            '',
            `**目标:** ${pgConfig.baseUrl}/telemetry/validate`,
            '',
            '### 检查项目',
            '| 对象 | 类型 |',
            '|------|------|',
            '| telemetry.metrics | TABLE |',
            '| telemetry.thermal_log | TABLE |',
            '| telemetry.alerts | TABLE |',
            '| telemetry.latency_history | TABLE |',
            '| telemetry.v_latest_metrics | VIEW |',
            '| telemetry.v_latency_summary | VIEW |',
            '',
            '验证已在后台执行，请检查 EventBus 获取结果。',
            '',
            '💡 使用 `/pg-deploy` → Validate 标签查看详细结果。',
          ].join('\n'),
        };
      },
    },
    {
      id: 'pg-schema', command: '/pg-schema', label: 'PG Schema 脚本', labelEn: 'PG Schema SQL',
      description: '生成 telemetry schema SQL 迁移脚本', descriptionEn: 'Generate telemetry schema SQL migration script',
      icon: Database, color: 'text-cyan-400', category: 'system',
      keywords: ['pg-schema', 'schema', 'sql', 'migration', 'ddl', '建表', 'create table'],
      action: () => {
        store.addLog('info', 'PG_SCHEMA', 'Telemetry schema SQL requested via /pg-schema');
        const sql = getMigrationSQL();
        // Copy to clipboard
        try { navigator.clipboard.writeText(sql); } catch { /* ignore */ }
        return {
          consumed: true,
          response: [
            '## 📋 Telemetry Schema SQL 已生成',
            '',
            '**已复制到剪贴板！** 在 PG15 中执行以创建 telemetry schema。',
            '',
            '```sql',
            '-- 核心表:',
            '-- telemetry.metrics         — 节点硬件时序指标',
            '-- telemetry.thermal_log     — 温度区域快照',
            '-- telemetry.alerts          — 阈值告警',
            '-- telemetry.latency_history — 基础设施延迟记录',
            '--',
            '-- 视图:',
            '-- telemetry.v_latest_metrics  — 各节点最新指标',
            '-- telemetry.v_latency_summary — 延迟汇总统计',
            '```',
            '',
            '### 执行方式',
            '```bash',
            'psql -h 192.168.3.22 -p 5433 -U yyc3_max -d yyc3 -f telemetry_schema.sql',
            '```',
            '',
            '💡 前往 **Console → Telemetry Agent** 查看完整部署方案。',
          ].join('\n'),
        };
      },
    },
    {
      id: 'help', command: '/help', label: '命令帮助', labelEn: 'Command Help',
      description: '显示所有可用的斜杠命令', descriptionEn: 'Show all available slash commands',
      icon: FileText, color: 'text-zinc-400', category: 'system',
      keywords: ['help', '帮助', '命令', 'command', '?'],
      action: () => {
        return {
          consumed: true,
          response: [
            '## / 斜杠命令参考',
            '',
            '### 🤖 Agent 切换',
            '`/agent navigator` — 切换至领航员',
            '`/agent thinker` — 切换至思想家',
            '`/agent sentinel` — 切换至哨兵',
            '...其他: prophet, bole, pivot, grandmaster',
            '',
            '### 🧭 导航',
            '`/go dashboard` — 总控台',
            '`/go devops` — DevOps 工作台',
            '`/go mcp` — MCP 工具链',
            '`/go hardware` — 硬件遥测',
            '`/go security` — 安全审计',
            '`/settings` — 系统设置',
            '',
            '### ⚡ 操作',
            '`/mode` — 切换导航/AI模式',
            '`/status` — 系统状态报告',
            '`/diag` — 运行诊断',
            '`/clear` — 清空会话',
            '`/new` — 新建会话',
            '`/env` — 运行环境全景',
            '`/perf` — 性能快照',
            '`/db` — 数据库信息',
            '`/ssh [node]` — SSH 连接信息',
            '`/health` — 基础设施健康检查',
            '`/infra` — 基础设施拓扑',
            '`/model` — 模型路由状态',
            '`/scripts` — 运维脚本中心',
            '`/telemetry` — 遥测代理管理',
            '`/trends` — 延迟趋势分析',
            '`/runner` — Runner 服务状态',
            '`/dag` — DAG 流水线状态',
            '`/pg-telemetry` — PG 遥测数据库状态',
            '`/pg-migrate` — localStorage → PG 数据迁移',
            '`/pg-schema` — 生成 telemetry schema SQL',
            '',
            '### 🧭 Phase 45 新增',
            '`/go manual` — 系统操作手册',
            '`/go layers` — 九层架构蓝图',
            '`/go modes` — AI/导航模式控制面板',
            '',
            '### 🗃️ Phase 46 新增',
            '`/pg-deploy` — PG Proxy 部署工具包',
            '`/pg-validate` — Schema 完整性验证',
            '`/go pg-deploy` — 跳转到部署面板',
            '',
            '### 🚀 DevOps',
          ].join('\n'),
        };
      },
    },
  ];

  // Phase 37: DevOps slash commands — trigger DAG workflows
  const devopsCommands: SlashCommand[] = [
    {
      id: 'deploy', command: '/deploy', label: '快速部署', labelEn: 'Quick Deploy',
      description: '触发部署到 NAS Docker 或远程节点', descriptionEn: 'Deploy to NAS Docker or remote node',
      icon: Rocket, color: 'text-emerald-400', category: 'devops',
      keywords: ['deploy', '部署', 'release', '发布', 'ship', '上线'],
      action: (args) => {
        const target = args?.trim() || 'nas-docker';
        const dagId = `deploy-${Date.now().toString(36)}`;
        store.addLog('info', 'DEVOPS', `Deploy initiated: target=${target}, dagId=${dagId}`);
        store.navigateToConsoleTab('devops');

        eventBus.emit({
          category: 'system',
          type: 'devops.deploy_triggered',
          level: 'info',
          source: 'SlashCmd',
          message: `Deployment triggered: ${target}`,
          metadata: { target, dagId, timestamp: Date.now(), stages: ['build', 'test', 'push', 'deploy', 'verify'] },
        });

        const stages = [
          { name: 'Build', icon: '🔨', duration: '~2min' },
          { name: 'Test', icon: '🧪', duration: '~1min' },
          { name: 'Push Image', icon: '📦', duration: '~30s' },
          { name: 'Deploy', icon: '🚀', duration: '~1min' },
          { name: 'Health Check', icon: '💚', duration: '~15s' },
        ];

        return {
          consumed: true,
          response: [
            `## 🚀 部署工作流已触发`,
            '',
            `**目标:** \`${target}\``,
            `**DAG ID:** \`${dagId}\``,
            `**主机:** 192.168.3.22 (yyc3-22)`,
            '',
            '**流水线阶段:**',
            ...stages.map((s, i) => `${i + 1}. ${s.icon} **${s.name}** — ${s.duration}`),
            '',
            '```',
            `代码 → Build → Test → Push → Deploy → NAS (${target})`,
            '```',
            '',
            '💡 前往 **Console → DevOps** 工作台查看实时 DAG 执行进度。',
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('devops'),
        };
      },
    },
    {
      id: 'build', command: '/build', label: '触发构建', labelEn: 'Trigger Build',
      description: '运行 Docker 构建或前端打包', descriptionEn: 'Run Docker build or frontend bundle',
      icon: Play, color: 'text-sky-400', category: 'devops',
      keywords: ['build', '构建', 'compile', '编译', 'bundle', '打包', 'make'],
      action: (args) => {
        const service = args?.trim() || 'yyc3-chatbot';
        const buildId = `build-${Date.now().toString(36)}`;
        store.addLog('info', 'DEVOPS', `Build triggered: service=${service}`);
        store.navigateToConsoleTab('devops');

        eventBus.emit({
          category: 'system',
          type: 'devops.build_triggered',
          level: 'info',
          source: 'SlashCmd',
          message: `Build triggered: ${service}`,
          metadata: { service, buildId, type: service.includes('docker') ? 'docker' : 'vite' },
        });

        return {
          consumed: true,
          response: [
            `## 🔨 构建任务已触发`,
            '',
            `**服务:** \`${service}\``,
            `**Build ID:** \`${buildId}\``,
            `**类型:** ${service.includes('docker') ? 'Docker Image Build' : 'Vite Production Bundle'}`,
            '',
            '**构建步骤:**',
            '1. 📥 拉取依赖 (pnpm install)',
            '2. 🔍 类型检查 (tsc --noEmit)',
            '3. 🧪 单元测试 (vitest)',
            '4. 📦 生产构建 (vite build / docker build)',
            '',
            '💡 前往 **Console → DevOps** 查看构建日志。',
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('devops'),
        };
      },
    },
    {
      id: 'rollback', command: '/rollback', label: '回滚部署', labelEn: 'Rollback Deploy',
      description: '回滚到上一个稳定版本', descriptionEn: 'Rollback to previous stable version',
      icon: RefreshCw, color: 'text-amber-400', category: 'devops',
      keywords: ['rollback', '回滚', 'revert', '撤销', 'undo', '回退'],
      action: () => {
        store.addLog('warn', 'DEVOPS', 'Rollback initiated — reverting to previous stable version');
        store.navigateToConsoleTab('devops');

        eventBus.emit({
          category: 'system',
          type: 'devops.rollback_triggered',
          level: 'warn',
          source: 'SlashCmd',
          message: 'Deployment rollback initiated',
          metadata: { reason: 'manual', triggeredBy: 'slash_command' },
        });

        return {
          consumed: true,
          response: [
            `## ⏪ 部署回滚已启动`,
            '',
            '**回滚策略:** 蓝绿切换 (Blue-Green Swap)',
            '',
            '**执行步骤:**',
            '1. 🔍 识别上一个稳定镜像 tag',
            '2. 🔄 切换 Docker Compose 指向旧版本',
            '3. 🚀 重启容器组',
            '4. 💚 健康检查确认',
            '5. 📝 记录回滚事件到 telemetry schema',
            '',
            '⚠️ 回滚将在 30 秒内完成。如需取消请前往 DevOps 工作台。',
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('devops'),
        };
      },
    },
    {
      id: 'docker-cmd', command: '/docker', label: 'Docker 命令', labelEn: 'Docker Command',
      description: '快捷 Docker 容器操作 (ps/restart/stop/logs)', descriptionEn: 'Quick Docker container ops (ps/restart/stop/logs)',
      icon: Box, color: 'text-sky-400', category: 'devops',
      keywords: ['docker', '容器', 'container', 'ps', 'restart', 'stop', 'compose'],
      action: (args) => {
        const action = args?.trim().split(' ')[0] || 'ps';
        const containerArg = args?.trim().split(' ').slice(1).join(' ') || '';
        store.addLog('info', 'DEVOPS', `Docker command: ${action} ${containerArg}`);

        eventBus.emit({
          category: 'system',
          type: 'devops.docker_command',
          level: 'info',
          source: 'SlashCmd',
          message: `Docker: ${action} ${containerArg}`,
          metadata: { action, container: containerArg },
        });

        const actionDescriptions: Record<string, string> = {
          ps: '列出运行中的容器',
          restart: `重启容器: ${containerArg || '所有服务'}`,
          stop: `停止容器: ${containerArg || '所有服务'}`,
          logs: `查看容器日志: ${containerArg || '最近的'}`,
          up: '启动 docker-compose 服务栈',
          down: '停止并移除 docker-compose 服务栈',
          pull: '拉取最新镜像',
        };

        return {
          consumed: true,
          response: [
            `## 🐳 Docker 操作`,
            '',
            `**命令:** \`docker ${action} ${containerArg}\``,
            `**操作:** ${actionDescriptions[action] || action}`,
            `**主机:** 192.168.3.22 (NAS)`,
            '',
            '💡 前往 **Console → Docker** 查看容器管理面板，或 `/go docker` 直接跳转。',
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('docker'),
        };
      },
    },
    {
      id: 'pipeline', command: '/pipeline', label: '运行流水线', labelEn: 'Run Pipeline',
      description: '触发指定的 DAG 工作流流水线', descriptionEn: 'Trigger a named DAG workflow pipeline',
      icon: GitBranch, color: 'text-purple-400', category: 'devops',
      keywords: ['pipeline', '流水线', 'dag', 'workflow', '工作流', 'ci', 'cd'],
      action: (args) => {
        const pipelineName = args?.trim() || 'default';
        const runId = `run-${Date.now().toString(36)}`;
        store.addLog('info', 'DEVOPS', `Pipeline triggered: ${pipelineName} (${runId})`);
        store.navigateToConsoleTab('devops');

        eventBus.emit({
          category: 'system',
          type: 'devops.pipeline_triggered',
          level: 'info',
          source: 'SlashCmd',
          message: `Pipeline "${pipelineName}" triggered`,
          metadata: { pipelineName, runId, triggeredBy: 'slash_command' },
        });

        const templates: Record<string, { stages: string[]; desc: string }> = {
          default: { stages: ['Checkout', 'Install', 'Lint', 'Test', 'Build'], desc: '标准 CI 流水线' },
          'full-deploy': { stages: ['Checkout', 'Install', 'Test', 'Build', 'Push', 'Deploy', 'Verify'], desc: '完整部署流水线' },
          'test-only': { stages: ['Checkout', 'Install', 'Unit Test', 'Integration Test', 'Coverage Report'], desc: '纯测试流水线' },
          'docker-build': { stages: ['Checkout', 'Docker Build', 'Push Registry', 'Update Manifest'], desc: 'Docker 镜像构建' },
          'security-scan': { stages: ['Checkout', 'Dependency Audit', 'SAST Scan', 'Secret Detection', 'Report'], desc: '安全扫描流水线' },
        };

        const tmpl = templates[pipelineName] || templates['default'];

        return {
          consumed: true,
          response: [
            `## ⚙️ DAG 流水线已触发`,
            '',
            `**名称:** \`${pipelineName}\``,
            `**描述:** ${tmpl.desc}`,
            `**Run ID:** \`${runId}\``,
            '',
            '**DAG 阶段:**',
            '```',
            tmpl.stages.join(' → '),
            '```',
            '',
            `共 **${tmpl.stages.length}** 个阶段`,
            '',
            '**可用流水线模板:**',
            ...Object.entries(templates).map(([k, v]) => `- \`/pipeline ${k}\` — ${v.desc}`),
            '',
            '💡 前往 **Console → DevOps** 查看 DAG 编辑器和执行历史。',
          ].join('\n'),
          navigate: () => store.navigateToConsoleTab('devops'),
        };
      },
    },
    {
      id: 'logs', command: '/logs', label: '查看日志', labelEn: 'View Logs',
      description: '实时查看服务或容器日志', descriptionEn: 'Stream live service or container logs',
      icon: FileText, color: 'text-zinc-400', category: 'devops',
      keywords: ['logs', '日志', 'log', 'tail', 'stream', '查看'],
      action: (args) => {
        const service = args?.trim() || 'system';
        store.addLog('info', 'DEVOPS', `Log stream requested: ${service}`);

        eventBus.emit({
          category: 'system',
          type: 'devops.logs_requested',
          level: 'info',
          source: 'SlashCmd',
          message: `Log stream: ${service}`,
          metadata: { service },
        });

        const s = useSystemStore.getState();
        const recentLogs = s.logs.slice(-8).map(l =>
          `[${l.timestamp}] ${l.level.toUpperCase().padEnd(7)} ${l.source.padEnd(12)} ${l.message}`
        ).join('\n');

        return {
          consumed: true,
          response: [
            `## 📋 实时日志 — ${service}`,
            '',
            '```',
            recentLogs || '(暂无日志)',
            '```',
            '',
            `共 **${s.logs.length}** 条日志记录`,
            '',
            '💡 前往 **Console → Dashboard** 查看完整 LiveLogStream。',
          ].join('\n'),
        };
      },
    },
  ];

  return [...agentCommands, ...navCommands, ...actionCommands, ...devopsCommands];
}

// --- Fuzzy Match ---
function fuzzyMatch(query: string, targets: string[]): boolean {
  const q = query.toLowerCase();
  return targets.some(t => t.toLowerCase().includes(q));
}

// ============================================================
// Exported Components
// ============================================================

interface SlashCommandPanelProps {
  inputValue: string;
  isVisible: boolean;
  onSelectCommand: (cmd: SlashCommand) => void;
  onClose: () => void;
}

export function SlashCommandPanel({ inputValue, isVisible, onSelectCommand, onClose }: SlashCommandPanelProps) {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Build commands and filter
  const commands = React.useMemo(() => buildCommands(), []);
  
  const query = inputValue.startsWith('/') ? inputValue.slice(1).trim().toLowerCase() : '';
  
  const filtered = React.useMemo(() => {
    if (!query) return commands.slice(0, 12); // Show top 12 by default
    return commands.filter(cmd => {
      const searchTargets = [
        cmd.command,
        cmd.label,
        cmd.labelEn,
        ...cmd.keywords,
      ];
      return fuzzyMatch(query, searchTargets);
    }).slice(0, 10);
  }, [query, commands]);

  // Reset selection when filter changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length, query]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        onSelectCommand(filtered[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isVisible, filtered, selectedIndex, onSelectCommand, onClose]);

  if (!isVisible || filtered.length === 0) return null;

  // Group by category
  const grouped = filtered.reduce<Record<string, SlashCommand[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const categoryLabels: Record<string, { zh: string; en: string }> = {
    agent: { zh: '🤖 智能体', en: '🤖 Agents' },
    navigation: { zh: '🧭 导航', en: '🧭 Navigation' },
    action: { zh: '⚡ 操作', en: '⚡ Actions' },
    system: { zh: '🔧 系统', en: '🔧 System' },
    devops: { zh: '🚀 DevOps', en: '🚀 DevOps' },
  };

  let globalIdx = 0;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="mx-auto max-w-4xl bg-black/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <CommandIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              {zh ? '斜杠命令' : 'Slash Commands'}
            </span>
            {query && (
              <span className="text-[10px] font-mono text-primary">
                /{query}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-600">
            <span>{filtered.length} {zh ? '个匹配' : 'matches'}</span>
          </div>
        </div>

        {/* Commands List */}
        <ScrollArea className="max-h-[280px]">
          <div className="p-1.5">
            {Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-3 py-1 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                  {categoryLabels[category]?.[zh ? 'zh' : 'en'] || category}
                </div>
                {cmds.map(cmd => {
                  const thisIdx = globalIdx++;
                  const isSelected = thisIdx === selectedIndex;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group",
                        isSelected
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-white/5 border border-transparent"
                      )}
                      onClick={() => onSelectCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(thisIdx)}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center border shrink-0 transition-all",
                        isSelected
                          ? "bg-primary/10 border-primary/30"
                          : "bg-zinc-800/60 border-zinc-700/30"
                      )}>
                        <Icon className={cn("w-3.5 h-3.5", cmd.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-300 group-hover:text-white">
                            {zh ? cmd.label : cmd.labelEn}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-600">{cmd.command}</span>
                        </div>
                        <span className="text-[9px] text-zinc-600 truncate block">
                          {zh ? cmd.description : cmd.descriptionEn}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[8px] font-mono text-primary shrink-0">
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-1.5 border-t border-white/5 bg-zinc-900/30 flex items-center justify-between text-[8px] text-zinc-600 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[7px]">↑↓</kbd>
              {zh ? '选择' : 'navigate'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[7px]">↵</kbd>
              {zh ? '执行' : 'execute'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[7px]">Esc</kbd>
              {zh ? '关闭' : 'close'}
            </span>
          </div>
          <span className="text-zinc-700">{zh ? '输入 /help 查看所有命令' : 'Type /help for all commands'}</span>
        </div>
      </div>
    </div>
  );
}

// --- Hook for processing slash commands ---
export function useSlashCommands() {
  const commands = React.useMemo(() => buildCommands(), []);

  const executeCommand = React.useCallback((input: string): { consumed: boolean; response?: string; navigate?: () => void } | null => {
    if (!input.startsWith('/')) return null;

    const parts = input.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    // Direct command match
    for (const command of commands) {
      const cmdParts = command.command.split(/\s+/);
      if (cmd === cmdParts[0] && (cmdParts.length === 1 || args.toLowerCase().startsWith(cmdParts[1]?.toLowerCase() || ''))) {
        const result = command.action(args);
        if (result.consumed) {
          // Emit EventBus event for cross-module awareness
          eventBus.emit({
            category: command.category === 'agent' ? 'orchestrate' : command.category === 'navigation' ? 'ui' : 'system',
            type: command.category === 'agent' ? 'orchestrate.agent_switch' : `ui.slash_${command.id}`,
            level: 'info',
            source: 'SlashCmd',
            message: `Executed: ${input.trim()}`,
            metadata: { commandId: command.id, category: command.category, args },
          });
        }
        return result;
      }
    }

    // Fuzzy match by keywords
    for (const command of commands) {
      if (fuzzyMatch(cmd.slice(1), command.keywords)) {
        const result = command.action(args);
        if (result.consumed) {
          eventBus.emit({
            category: 'ui',
            type: `ui.slash_fuzzy_${command.id}`,
            level: 'info',
            source: 'SlashCmd',
            message: `Fuzzy executed: ${input.trim()} → ${command.command}`,
            metadata: { commandId: command.id, originalInput: input, matchedCommand: command.command },
          });
        }
        return result;
      }
    }

    return null;
  }, [commands]);

  return { executeCommand, commands };
}