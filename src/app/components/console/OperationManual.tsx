import {
  BookOpen, Terminal, Brain, Compass, Shield, Network, Database,
  Cpu, Activity, HardDrive, Radio, FileText,
  ChevronRight, ChevronDown, Globe, BarChart3,
  Box, Wrench, Monitor, ArrowRight, Command, Keyboard,
  AlertTriangle,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ============================================================
// OperationManual — Complete System Operation Guide
// Phase 45: Comprehensive guide covering all modules, commands,
// workflows, and troubleshooting for the YYC3 platform.
// ============================================================

interface ManualSection {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  titleEn: string;
  color: string;
}

const SECTIONS: ManualSection[] = [
  { id: 'overview', icon: Globe, title: '系统概览', titleEn: 'System Overview', color: 'text-sky-400' },
  { id: 'modes', icon: Compass, title: '模式操作', titleEn: 'Mode Operations', color: 'text-amber-400' },
  { id: 'console', icon: Terminal, title: '控制台模块', titleEn: 'Console Modules', color: 'text-emerald-400' },
  { id: 'commands', icon: Command, title: '斜杠命令', titleEn: 'Slash Commands', color: 'text-pink-400' },
  { id: 'agents', icon: Brain, title: 'AI 智能体', titleEn: 'AI Agents', color: 'text-purple-400' },
  { id: 'infra', icon: Activity, title: '基础设施', titleEn: 'Infrastructure', color: 'text-cyan-400' },
  { id: 'shortcuts', icon: Keyboard, title: '快捷键', titleEn: 'Shortcuts', color: 'text-violet-400' },
  { id: 'troubleshoot', icon: AlertTriangle, title: '故障排除', titleEn: 'Troubleshooting', color: 'text-red-400' },
];

function CollapsibleSection({ title, children, defaultOpen = false }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors text-left"
      >
        {title}
        {open ? <ChevronDown className="w-4 h-4 text-zinc-600 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />}
      </button>
      {open && <div className="p-4 bg-black/30 border-t border-white/5">{children}</div>}
    </div>
  );
}

export function OperationManual() {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const [activeSection, setActiveSection] = React.useState('overview');
  const navigateToConsoleTab = useSystemStore(s => s.navigateToConsoleTab);
  const isMobile = useSystemStore(s => s.isMobile);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-cyan-400" />
          {zh ? 'YYC3 系统操作手册' : 'YYC3 System Operation Manual'}
        </h2>
        <Badge variant="outline" className="font-mono text-xs border-white/10 text-zinc-400">
          v3.0 — Phase 45
        </Badge>
      </div>

      <div className={cn('flex gap-6', isMobile ? 'flex-col' : '')}>
        {/* Section Navigation */}
        <div className={cn('shrink-0', isMobile ? 'w-full' : 'w-48')}>
          <div className={cn(
            'sticky top-4 bg-zinc-900/50 border border-white/5 rounded-lg p-2',
            isMobile ? 'flex flex-wrap gap-1' : 'space-y-1',
          )}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left w-full',
                  isMobile ? 'w-auto' : '',
                  activeSection === s.id
                    ? 'bg-white/5 text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]',
                )}
              >
                <s.icon className={cn('w-3.5 h-3.5 shrink-0', activeSection === s.id ? s.color : '')} />
                <span className="text-xs font-mono truncate">{zh ? s.title : s.titleEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* System Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <Card className="bg-zinc-900/50 border-white/5">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-sky-400" />
                    {zh ? '平台架构' : 'Platform Architecture'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-400">
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-primary mb-1">{zh ? '技术栈' : 'Tech Stack'}</div>
                      <p>• React 18 + TypeScript + Tailwind CSS v4</p>
                      <p>• Zustand v5 {zh ? '全局状态管理' : 'Global State'}</p>
                      <p>• Web Crypto (AES-GCM) {zh ? '本地加密' : 'Local Encryption'}</p>
                      <p>• SSE {zh ? '流式通信' : 'Streaming'} + WebSocket {zh ? '实时心跳' : 'Heartbeat'}</p>
                      <p>• PostgreSQL 15 (pgvector) @ 192.168.3.22:5433</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-primary mb-1">{zh ? '核心能力' : 'Core Capabilities'}</div>
                      <p>• 7 LLM Provider {zh ? '智能路由' : 'Smart Routing'}</p>
                      <p>• 7 AI Agent {zh ? '协同编排' : 'Orchestration'}</p>
                      <p>• MCP {zh ? '工具协议' : 'Tool Protocol'} (6 Servers)</p>
                      <p>• DAG CI/CD {zh ? '流水线' : 'Pipeline'}</p>
                      <p>• {zh ? '九层架构设计' : 'Nine-Layer Architecture'}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-black/40 rounded-lg border border-sky-500/10">
                    <div className="text-[10px] font-mono text-sky-400 mb-2">{zh ? '集群拓扑' : 'Cluster Topology'}</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { name: 'M4 Max', desc: '128GB, 40GPU', color: 'text-amber-400' },
                        { name: 'iMac M4', desc: '32GB, Render', color: 'text-blue-400' },
                        { name: 'MateBook', desc: 'Mobile Node', color: 'text-green-400' },
                        { name: 'NAS F4-423', desc: 'RAID6, Docker', color: 'text-cyan-400' },
                      ].map(n => (
                        <div key={n.name} className="p-2 rounded bg-white/[0.02] border border-white/5">
                          <div className={cn('text-[10px] font-mono', n.color)}>{n.name}</div>
                          <div className="text-[9px] text-zinc-600">{n.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mode Operations */}
          {activeSection === 'modes' && (
            <div className="space-y-4">
              <CollapsibleSection defaultOpen title={
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white">{zh ? '导航模式 (Navigate Mode)' : 'Navigate Mode'}</span>
                </div>
              }>
                <div className="space-y-3 text-xs text-zinc-400">
                  <p className="text-zinc-300">{zh ? '导航模式是 YYC3 的默认启动模式，无需 API Key 即可使用。' : 'Navigate mode is the default, requires no API key.'}</p>
                  <div className="space-y-1.5">
                    <p>• {zh ? '输入任意功能关键词（中/英文），系统自动匹配并跳转目标模块' : 'Type any keyword (CN/EN) to auto-navigate to target module'}</p>
                    <p>• {zh ? '未匹配导航意图时，自动查询内置知识域返回富文本答案' : 'Falls back to built-in knowledge domain with rich-text answers'}</p>
                    <p>• {zh ? '知识域覆盖：MCP、AI Family、LLM Bridge、集群拓扑、持久化、DevOps、安全、PG Telemetry' : 'Knowledge domains: MCP, AI Family, LLM Bridge, Cluster, Persistence, DevOps, Security, PG Telemetry'}</p>
                    <p>• {zh ? '切换方式：Ctrl+M / 顶栏模式按钮 / /mode 斜杠命令' : 'Switch: Ctrl+M / top bar button / /mode slash command'}</p>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection defaultOpen title={
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-white">{zh ? 'AI 对话模式 (AI Chat Mode)' : 'AI Chat Mode'}</span>
                </div>
              }>
                <div className="space-y-3 text-xs text-zinc-400">
                  <p className="text-zinc-300">{zh ? 'AI 模式连接 7 大 LLM Provider，提供真实 AI 对话能力。' : 'AI mode connects 7 LLM providers for real AI conversation.'}</p>
                  <div className="space-y-1.5">
                    <p>• {zh ? '前置条件：至少配置一个 Provider 的 API Key 并设为 Active' : 'Prerequisite: Configure at least 1 provider API key as Active'}</p>
                    <p>• {zh ? '支持 SSE 流式输出，Token 用量实时追踪' : 'SSE streaming output with real-time token tracking'}</p>
                    <p>• {zh ? '自动 Failover：首选 Provider 失败时链式降级到下一个' : 'Auto failover: chains to next provider on failure'}</p>
                    <p>• {zh ? '智能导航检测：AI 模式下输入 "打开 dashboard" 等指令会自动跳转 + AI 回复' : 'Smart nav detection: "open dashboard" auto-navigates + AI responds'}</p>
                    <p>• {zh ? '斜杠命令在两种模式中均可使用' : 'Slash commands work in both modes'}</p>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-white">{zh ? '模式联动闭环' : 'Mode Closed-Loop Integration'}</span>
                </div>
              }>
                <div className="space-y-3 text-xs text-zinc-400">
                  <div className="p-3 bg-black/40 rounded-lg border border-pink-500/10 font-mono text-[10px]">
                    <div className="text-pink-400 mb-2">{zh ? '闭环流程：' : 'Closed-Loop Flow:'}</div>
                    <p className="text-zinc-500">
                      {zh
                        ? '导航模式 → 关键词跳转 → 到达目标模块 → 切换 AI 模式 → 与 AI 讨论该模块 → /status 检查结果 → 导航模式继续巡检'
                        : 'Nav Mode → Keyword Jump → Target Module → Switch AI Mode → Discuss with AI → /status check → Nav Mode patrol'}
                    </p>
                  </div>
                  <p>{zh ? '• NeuralLink HUD 实时显示当前模式状态和面包屑导航' : '• NeuralLink HUD shows real-time mode status and breadcrumb nav'}</p>
                  <p>{zh ? '• EventBus 记录所有模式切换事件，可在 HUD 事件流中查看' : '• EventBus logs all mode transitions, viewable in HUD event feed'}</p>
                  <p>{zh ? '• Console → 模式控制面板 可查看完整切换历史和 Provider 就绪状态' : '• Console → Mode Control Panel shows full history and provider readiness'}</p>
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Console Modules */}
          {activeSection === 'console' && (
            <div className="space-y-3">
              {[
                { id: 'dashboard', icon: Monitor, label: zh ? '总控台' : 'Dashboard', desc: zh ? '集群拓扑、实时指标、日志流、Command Center、基础设施健康检查' : 'Cluster topology, real-time metrics, logs, Command Center, infra health', color: 'text-sky-400' },
                { id: 'ai', icon: Brain, label: zh ? '智愈中心' : 'AI Core', desc: zh ? '7 大 Agent 矩阵，选择任意 Agent 开始专项对话（各 Agent 拥有独立 System Prompt 和推荐模型）' : '7 Agent matrix with specialized conversations per agent', color: 'text-amber-400' },
                { id: 'devops', icon: Terminal, label: 'DevOps', desc: zh ? 'DAG 工作流编辑器、CI/CD 流水线、模板库（15+ 预置）、实时执行状态追踪' : 'DAG workflow editor, CI/CD pipelines, 15+ templates, real-time execution tracking', color: 'text-emerald-400' },
                { id: 'hardware_monitor', icon: Cpu, label: zh ? '硬件遥测' : 'HW Telemetry', desc: zh ? 'M4 Max 56 核 CPU/GPU 遥测看板、温度监控、进程列表、性能历史图表' : 'M4 Max 56-core CPU/GPU telemetry, thermal monitoring, process list', color: 'text-orange-400' },
                { id: 'mcp', icon: Wrench, label: 'MCP', desc: zh ? 'Model Context Protocol 工具管理、Server 配置、Playground 测试、MCP 工作流可视化' : 'MCP tool management, server config, playground testing, workflow visualization', color: 'text-pink-400' },
                { id: 'security_audit', icon: Shield, label: zh ? '安全审计' : 'Security Audit', desc: zh ? '安全态势评估、凭证扫描、依赖审计、XSS/CSRF 检测、合规性报告' : 'Security posture, credential scan, dependency audit, XSS/CSRF detection', color: 'text-red-400' },
                { id: 'persist', icon: HardDrive, label: zh ? '持久化' : 'Persistence', desc: zh ? '三层存储引擎管理、快照创建/恢复/导出、NAS SQLite 同步' : 'Three-tier storage, snapshot create/restore/export, NAS SQLite sync', color: 'text-violet-400' },
                { id: 'infra_health', icon: Activity, label: zh ? '基础设施' : 'Infra Health', desc: zh ? '全服务连通性探活、延迟历史趋势、设备/服务/运行时/Provider 四维检查' : 'Full service connectivity probes, latency trends, 4-dimensional checks', color: 'text-emerald-400' },
                { id: 'metrics_history', icon: BarChart3, label: zh ? '历史指标' : 'Metrics History', desc: zh ? '长时间序列指标图表、PG Telemetry Integration 面板、数据迁移管理' : 'Long-term metrics charts, PG Telemetry integration, data migration', color: 'text-cyan-400' },
                { id: 'ops_script', icon: FileText, label: zh ? '运维脚本' : 'Ops Scripts', desc: zh ? '一键生成 Shell 脚本（部署/备份/健康检查/Ollama/初始化），复制即用' : 'One-click shell scripts (deploy/backup/health/ollama/init), copy to run', color: 'text-amber-400' },
                { id: 'telemetry_agent_manager', icon: Radio, label: zh ? '遥测代理' : 'Telemetry Agent', desc: zh ? 'yyc3-telemetry-agent 部署管理、Runner Service、PG Schema 配置' : 'Telemetry agent deployment, Runner Service, PG Schema config', color: 'text-pink-400' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => navigateToConsoleTab(m.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-white/5 hover:bg-zinc-900/80 hover:border-white/10 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                    <m.icon className={cn('w-5 h-5', m.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-200 flex items-center gap-2">
                      {m.label}
                      <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-[10px] text-zinc-600 truncate">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Slash Commands Reference */}
          {activeSection === 'commands' && (
            <Card className="bg-zinc-900/50 border-white/5">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {[
                    {
                      cat: zh ? '🤖 Agent 切换' : '🤖 Agent Switch',
                      cmds: [
                        { cmd: '/agent <name>', desc: zh ? '切换至指定 Agent (navigator, thinker, prophet, bole, pivot, sentinel, grandmaster)' : 'Switch to specified agent' },
                      ],
                    },
                    {
                      cat: zh ? '🧭 导航' : '🧭 Navigation',
                      cmds: [
                        { cmd: '/go dashboard', desc: zh ? '总控台' : 'Dashboard' },
                        { cmd: '/go devops', desc: zh ? 'DevOps 工作台' : 'DevOps workspace' },
                        { cmd: '/go mcp', desc: 'MCP Hub' },
                        { cmd: '/go hardware', desc: zh ? '硬件遥测' : 'HW Telemetry' },
                        { cmd: '/go security', desc: zh ? '安全审计' : 'Security Audit' },
                        { cmd: '/go scripts', desc: zh ? '运维脚本' : 'Ops Scripts' },
                        { cmd: '/settings', desc: zh ? '系统设置' : 'Settings' },
                      ],
                    },
                    {
                      cat: zh ? '🔧 系统' : '🔧 System',
                      cmds: [
                        { cmd: '/status', desc: zh ? '系统状态报告' : 'System status report' },
                        { cmd: '/env', desc: zh ? '运行环境全景' : 'Runtime environment overview' },
                        { cmd: '/perf', desc: zh ? '性能快照' : 'Performance snapshot' },
                        { cmd: '/db', desc: zh ? '数据库信息' : 'Database info' },
                        { cmd: '/health', desc: zh ? '基础设施健康检查' : 'Infra health check' },
                        { cmd: '/infra', desc: zh ? '基础设施拓扑' : 'Infra topology' },
                        { cmd: '/model', desc: zh ? '模型路由状态' : 'Model routing status' },
                        { cmd: '/trends', desc: zh ? '延迟趋势分析' : 'Latency trend analysis' },
                        { cmd: '/ssh [node]', desc: zh ? 'SSH 连接信息' : 'SSH connection info' },
                        { cmd: '/runner', desc: 'Runner Service' },
                        { cmd: '/dag', desc: 'DAG Pipeline' },
                        { cmd: '/pg-telemetry', desc: 'PG Telemetry DB' },
                        { cmd: '/pg-migrate', desc: zh ? 'localStorage → PG 迁移' : 'localStorage → PG migration' },
                        { cmd: '/pg-schema', desc: zh ? 'telemetry schema SQL' : 'telemetry schema SQL' },
                      ],
                    },
                    {
                      cat: zh ? '⚡ 操作' : '⚡ Actions',
                      cmds: [
                        { cmd: '/mode', desc: zh ? '切换导航/AI模式' : 'Toggle nav/AI mode' },
                        { cmd: '/clear', desc: zh ? '清空会话' : 'Clear chat' },
                        { cmd: '/new', desc: zh ? '新建会话' : 'New session' },
                        { cmd: '/diag', desc: zh ? '运行诊断' : 'Run diagnostics' },
                      ],
                    },
                    {
                      cat: '🚀 DevOps',
                      cmds: [
                        { cmd: '/deploy [target]', desc: zh ? '触发部署到 NAS Docker' : 'Deploy to NAS Docker' },
                        { cmd: '/build [service]', desc: zh ? '触发构建' : 'Trigger build' },
                        { cmd: '/rollback', desc: zh ? '回滚部署' : 'Rollback deploy' },
                        { cmd: '/docker [action]', desc: zh ? 'Docker 操作 (ps/restart/stop/logs)' : 'Docker ops' },
                        { cmd: '/pipeline [name]', desc: zh ? '运行 DAG 流水线' : 'Run DAG pipeline' },
                        { cmd: '/logs [service]', desc: zh ? '查看日志' : 'View logs' },
                      ],
                    },
                  ].map(group => (
                    <div key={group.cat}>
                      <div className="text-xs font-mono text-zinc-400 mb-2 pb-1 border-b border-white/5">{group.cat}</div>
                      <div className="space-y-1">
                        {group.cmds.map(c => (
                          <div key={c.cmd} className="flex items-center gap-3 py-1.5">
                            <code className="text-[10px] font-mono text-primary px-2 py-0.5 bg-primary/10 rounded min-w-[140px] shrink-0">{c.cmd}</code>
                            <span className="text-[10px] text-zinc-500">{c.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Agents */}
          {activeSection === 'agents' && (
            <div className="space-y-3">
              {[
                { id: 'navigator', name: zh ? '领航员 Navigator' : 'Navigator', desc: zh ? '全域资源调度与路径规划。擅长项目导航、任务分解、工作流编排。' : 'Global resource scheduling and path planning.', color: 'text-amber-400', model: 'GPT-4o / DeepSeek-V3' },
                { id: 'thinker', name: zh ? '思想家 Thinker' : 'Thinker', desc: zh ? '深度逻辑推理与决策分析。擅长架构设计、技术选型、方案评估。' : 'Deep logic reasoning and decision analysis.', color: 'text-blue-400', model: 'Claude 3.5 Sonnet' },
                { id: 'prophet', name: zh ? '先知 Prophet' : 'Prophet', desc: zh ? '趋势预测与风险前置。擅长风险评估、性能预测、容量规划。' : 'Trend prediction and risk forecasting.', color: 'text-purple-400', model: 'Gemini 2.0 Flash' },
                { id: 'bole', name: zh ? '伯乐 Bole' : 'Bole', desc: zh ? '模型评估与优选匹配。擅长 Code Review、质量把关、最佳实践推荐。' : 'Model evaluation and code quality.', color: 'text-pink-400', model: 'GPT-4o / Claude' },
                { id: 'pivot', name: zh ? '天枢 Pivot' : 'Pivot', desc: zh ? '核心状态管理与上下文。擅长多 Agent 协调、冲突仲裁、状态同步。' : 'Core state management and coordination.', color: 'text-cyan-400', model: 'DeepSeek-V3' },
                { id: 'sentinel', name: zh ? '哨兵 Sentinel' : 'Sentinel', desc: zh ? '安全边界防护与审计。擅长安全审计、漏洞检测、合规性检查。' : 'Security boundary defense and audit.', color: 'text-red-400', model: 'Claude 3.5 Sonnet' },
                { id: 'grandmaster', name: zh ? '宗师 Grandmaster' : 'Grandmaster', desc: zh ? '知识库构建与本体论。擅长跨域综合分析、最终决策、知识图谱构建。' : 'Knowledge base construction and ontology.', color: 'text-green-400', model: 'GPT-4o / Claude' },
              ].map(a => (
                <button
                  key={a.id}
                  onClick={() => useSystemStore.getState().navigateToAgent(a.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-white/5 hover:bg-zinc-900/80 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                    <Brain className={cn('w-5 h-5', a.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-sm', a.color)}>{a.name}</div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{a.desc}</p>
                    <div className="text-[9px] font-mono text-zinc-700 mt-1">{zh ? '推荐模型：' : 'Recommended: '}{a.model}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Infrastructure */}
          {activeSection === 'infra' && (
            <div className="space-y-4">
              <Card className="bg-zinc-900/50 border-white/5">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    {zh ? '数据库架构' : 'Database Architecture'}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-zinc-400">
                      <thead>
                        <tr className="border-b border-white/5 text-zinc-500">
                          <th className="text-left py-2 pr-4 font-mono">Schema</th>
                          <th className="text-left py-2 pr-4 font-mono">{zh ? '用途' : 'Purpose'}</th>
                          <th className="text-left py-2 font-mono">{zh ? '核心表' : 'Core Tables'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        <tr><td className="py-2 pr-4 text-cyan-400 font-mono">orchestration</td><td className="py-2 pr-4">{zh ? '任务生命周期管理' : 'Task lifecycle'}</td><td className="py-2 font-mono text-zinc-600">tasks, agent_sessions, workflows</td></tr>
                        <tr><td className="py-2 pr-4 text-emerald-400 font-mono">knowledge</td><td className="py-2 pr-4">{zh ? 'pgvector 向量记忆' : 'pgvector memory'}</td><td className="py-2 font-mono text-zinc-600">documents, embeddings, chunks</td></tr>
                        <tr><td className="py-2 pr-4 text-amber-400 font-mono">telemetry</td><td className="py-2 pr-4">{zh ? '硬件遥测时序' : 'HW telemetry'}</td><td className="py-2 font-mono text-zinc-600">metrics, thermal_log, alerts, latency_history</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600 pt-2 border-t border-white/5">
                    PostgreSQL 15 | Port 5433 | User: yyc3_max | Extensions: pgvector, pg_trgm, uuid-ossp
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-white/5">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-violet-400" />
                    {zh ? '服务端点' : 'Service Endpoints'}
                  </h3>
                  <div className="space-y-1.5">
                    {[
                      { name: 'PostgreSQL 15', endpoint: '192.168.3.22:5433', proto: 'TCP' },
                      { name: 'Ollama LLM', endpoint: '192.168.3.22:11434', proto: 'HTTP' },
                      { name: 'Docker Engine', endpoint: '192.168.3.45:2375', proto: 'HTTP' },
                      { name: 'SQLite Proxy', endpoint: '192.168.3.45:8484', proto: 'HTTP' },
                      { name: 'Telemetry WS', endpoint: '192.168.3.22:3177', proto: 'WebSocket' },
                      { name: 'Runner Service', endpoint: '192.168.3.22:3002', proto: 'HTTP' },
                      { name: 'PG Proxy', endpoint: '192.168.3.22:3003', proto: 'HTTP' },
                    ].map(s => (
                      <div key={s.name} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[10px] font-mono">
                        <span className="text-zinc-400">{s.name}</span>
                        <span className="text-zinc-600">{s.endpoint}</span>
                        <span className="text-zinc-700">{s.proto}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          {activeSection === 'shortcuts' && (
            <Card className="bg-zinc-900/50 border-white/5">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { keys: 'Ctrl+M / ⌘M', desc: zh ? '切换导航/AI模式' : 'Toggle nav/AI mode' },
                    { keys: 'Ctrl+K / ⌘K', desc: zh ? '打开搜索面板' : 'Open search palette' },
                    { keys: 'Ctrl+H / ⌘H', desc: zh ? '显示/隐藏 NeuralLink HUD' : 'Toggle NeuralLink HUD' },
                    { keys: '/', desc: zh ? '激活斜杠命令' : 'Activate slash commands' },
                    { keys: '↑ / ↓', desc: zh ? '斜杠命令列表导航' : 'Navigate command list' },
                    { keys: 'Enter', desc: zh ? '执行选中的斜杠命令' : 'Execute selected command' },
                    { keys: 'Escape', desc: zh ? '关闭命令面板/弹窗' : 'Close command panel/modal' },
                    { keys: 'Ctrl+Enter', desc: zh ? '发送消息' : 'Send message' },
                  ].map(s => (
                    <div key={s.keys} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-[10px] font-mono text-zinc-400 min-w-[100px] text-center">{s.keys}</kbd>
                      <span className="text-xs text-zinc-400">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Troubleshooting */}
          {activeSection === 'troubleshoot' && (
            <div className="space-y-4">
              {[
                { q: zh ? 'AI 模式无响应' : 'AI mode not responding', a: zh ? '检查 设置 → AI 模型，确保至少一个 Provider 有 API Key 且状态为 Active。使用 /model 查看路由状态。如遇 CORS 错误，配置 vite.config.ts server.proxy 或使用 Ollama 本地模型。' : 'Check Settings → AI Models, ensure at least 1 provider has API key and Active status. Use /model to check routing. For CORS errors, configure vite server.proxy or use Ollama.', icon: Brain, color: 'text-emerald-400' },
                { q: zh ? 'NAS/Docker 连接失败' : 'NAS/Docker connection failed', a: zh ? '确认 192.168.3.45:2375 Docker Engine API 可达。运行 /health 检查所有服务连通性。检查防火墙规则，确认 Docker 已启用远程 API。' : 'Verify 192.168.3.45:2375 Docker Engine API is reachable. Run /health to check all services. Check firewall rules.', icon: Box, color: 'text-sky-400' },
                { q: zh ? 'PostgreSQL 连接离线' : 'PostgreSQL offline', a: zh ? '确认 192.168.3.22:5433 PG15 服务运行中 (ssh yyc3@192.168.3.22 → systemctl status postgresql)。使用 /db 查看数据库信息，/pg-telemetry 检查 telemetry schema。' : 'Verify PG15 is running on 192.168.3.22:5433. Use /db and /pg-telemetry for diagnostics.', icon: Database, color: 'text-cyan-400' },
                { q: zh ? '性能指标异常' : 'Abnormal metrics', a: zh ? '使用 /perf 采集性能快照，/health 检查基础设施。前往 Console → Hardware Monitor 查看 M4 Max 56 核详细遥测。高 CPU 通常由 AI 推理任务引起。' : 'Use /perf for snapshot, /health for infra check. Go to Console → Hardware Monitor for M4 Max telemetry.', icon: Activity, color: 'text-amber-400' },
                { q: zh ? '斜杠命令不生效' : 'Slash commands not working', a: zh ? '确认以 / 开头输入。检查命令拼写，使用 /help 查看所有可用命令。部分命令需要特定模块处于活跃状态。' : 'Ensure input starts with /. Check spelling. Use /help for all available commands.', icon: Command, color: 'text-pink-400' },
              ].map((item, i) => (
                <CollapsibleSection key={i} title={
                  <div className="flex items-center gap-2">
                    <item.icon className={cn('w-4 h-4', item.color)} />
                    <span className="text-sm text-white">{item.q}</span>
                  </div>
                }>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.a}</p>
                </CollapsibleSection>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
