import {
  Server, Database, Key, Sparkles, Briefcase, Monitor, Smartphone,
  Infinity, Settings, Layers, ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Clock, AlertTriangle, Code, Eye,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ============================================================
// NineLayerArchitecture — Detailed Nine-Layer Design Blueprint
// Phase 45: Core logic implementation planning with per-layer
// component mapping, file inventory, status tracking, and roadmap.
// ============================================================

interface LayerDetail {
  id: string;
  number: number;
  label: string;
  labelEn: string;
  desc: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  status: 'complete' | 'in-progress' | 'planned';
  progress: number; // 0-100
  components: { name: string; file: string; status: 'done' | 'wip' | 'todo' }[];
  dependencies: string[]; // depends on which layers
  keyFiles: string[];
  roadmap: string[];
  roadmapEn: string[];
}

const NINE_LAYERS: LayerDetail[] = [
  {
    id: 'L01', number: 1,
    label: 'L01 基础设施层', labelEn: 'L01 Infrastructure Layer',
    desc: '物理集群、网络拓扑、数据库连接、WebSocket 心跳', descEn: 'Physical cluster, network topology, DB connections, WebSocket heartbeat',
    icon: Server, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20',
    status: 'complete', progress: 95,
    components: [
      { name: 'DeviceCardManager', file: 'console/DeviceCardManager.tsx', status: 'done' },
      { name: 'ClusterTopology', file: 'console/ClusterTopology.tsx', status: 'done' },
      { name: 'InfraHealthMatrix', file: 'console/InfraHealthMatrix.tsx', status: 'done' },
      { name: 'HardwareMonitor', file: 'monitoring/HardwareMonitor.tsx', status: 'done' },
      { name: 'HeartbeatWebSocket', file: 'lib/useHeartbeatWebSocket.ts', status: 'done' },
      { name: 'TelemetryStream', file: 'lib/useTelemetryStream.ts', status: 'done' },
      { name: 'PgTelemetryClient', file: 'lib/pg-telemetry-client.ts', status: 'done' },
    ],
    dependencies: [],
    keyFiles: ['useInfraHealth.ts', 'useHeartbeatWebSocket.ts', 'pg-telemetry-client.ts', 'nas-client.ts'],
    roadmap: ['部署 yyc3-pg-proxy 到 192.168.3.22:3003', '实际连通 Telemetry WebSocket', '集群自动发现 (mDNS)'],
    roadmapEn: ['Deploy yyc3-pg-proxy to 192.168.3.22:3003', 'Connect live Telemetry WebSocket', 'Cluster auto-discovery (mDNS)'],
  },
  {
    id: 'L02', number: 2,
    label: 'L02 数据存储层', labelEn: 'L02 Data Persistence Layer',
    desc: '三层存储引擎 (localStorage → NAS SQLite → PG15)、快照管理、Schema 迁移', descEn: 'Three-tier storage (localStorage → NAS SQLite → PG15), snapshots, schema migration',
    icon: Database, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20',
    status: 'complete', progress: 90,
    components: [
      { name: 'PersistenceEngine', file: 'lib/persistence-engine.ts', status: 'done' },
      { name: 'PersistenceManager', file: 'console/PersistenceManager.tsx', status: 'done' },
      { name: 'PersistSchemas', file: 'lib/persist-schemas.ts', status: 'done' },
      { name: 'PersistenceBinding', file: 'lib/persistence-binding.ts', status: 'done' },
      { name: 'DatabaseSelector', file: 'console/DatabaseSelector.tsx', status: 'done' },
      { name: 'PgTelemetryClient', file: 'lib/pg-telemetry-client.ts', status: 'done' },
    ],
    dependencies: ['L01'],
    keyFiles: ['persistence-engine.ts', 'persist-schemas.ts', 'db-schema.ts', 'pg-telemetry-client.ts'],
    roadmap: ['执行 telemetry schema DDL 建表', '实现 PG → Frontend 反向查询', '增量同步策略优化'],
    roadmapEn: ['Execute telemetry schema DDL', 'Implement PG → Frontend reverse queries', 'Incremental sync optimization'],
  },
  {
    id: 'L03', number: 3,
    label: 'L03 核心服务层', labelEn: 'L03 Core Services Layer',
    desc: 'LLM Bridge、MCP 协议、Web Crypto 加密、事件总线、代理端点', descEn: 'LLM Bridge, MCP Protocol, Web Crypto, Event Bus, Proxy Endpoints',
    icon: Key, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20',
    status: 'complete', progress: 92,
    components: [
      { name: 'LLMBridge', file: 'lib/llm-bridge.ts', status: 'done' },
      { name: 'LLMRouter', file: 'lib/llm-router.ts', status: 'done' },
      { name: 'LLMProviders', file: 'lib/llm-providers.ts', status: 'done' },
      { name: 'MCPProtocol', file: 'lib/mcp-protocol.ts', status: 'done' },
      { name: 'WebCrypto', file: 'lib/crypto.ts', status: 'done' },
      { name: 'EventBus', file: 'lib/event-bus.ts', status: 'done' },
      { name: 'ProxyEndpoints', file: 'lib/proxy-endpoints.ts', status: 'done' },
    ],
    dependencies: ['L01', 'L02'],
    keyFiles: ['llm-bridge.ts', 'mcp-protocol.ts', 'crypto.ts', 'event-bus.ts', 'llm-router.ts'],
    roadmap: ['MCP Server 实际连通', 'LLM 响应缓存层', 'Provider 故障自愈'],
    roadmapEn: ['Connect live MCP Servers', 'LLM response caching layer', 'Provider auto-recovery'],
  },
  {
    id: 'L04', number: 4,
    label: 'L04 AI 智能层', labelEn: 'L04 AI Intelligence Layer',
    desc: '七大 Agent 编排、Agent Identity、协同工作流、Knowledge Base', descEn: '7 Agents orchestration, Agent Identity, collaborative workflows, Knowledge Base',
    icon: Sparkles, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20',
    status: 'complete', progress: 88,
    components: [
      { name: 'AgentOrchestrator', file: 'lib/agent-orchestrator.ts', status: 'done' },
      { name: 'AgentIdentity', file: 'lib/agent-identity.ts', status: 'done' },
      { name: 'AgentChatInterface', file: 'console/AgentChatInterface.tsx', status: 'done' },
      { name: 'AgentIdentityCard', file: 'console/AgentIdentityCard.tsx', status: 'done' },
      { name: 'AgentOrchestrator UI', file: 'console/AgentOrchestrator.tsx', status: 'done' },
      { name: 'KnowledgeBase', file: 'console/KnowledgeBase.tsx', status: 'done' },
    ],
    dependencies: ['L03'],
    keyFiles: ['agent-orchestrator.ts', 'agent-identity.ts', 'types.ts (AGENT_REGISTRY)'],
    roadmap: ['Agent 长期记忆持久化到 PG knowledge schema', 'RAG 向量检索集成', 'Agent 间任务委派链'],
    roadmapEn: ['Agent long-term memory in PG knowledge schema', 'RAG vector retrieval integration', 'Inter-agent task delegation chain'],
  },
  {
    id: 'L05', number: 5,
    label: 'L05 业务逻辑层', labelEn: 'L05 Business Logic Layer',
    desc: 'DevOps 流水线、Docker 管理、NAS 部署、运维脚本生成', descEn: 'DevOps pipelines, Docker management, NAS deployment, ops script generation',
    icon: Briefcase, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20',
    status: 'complete', progress: 85,
    components: [
      { name: 'DevOpsTerminal', file: 'console/DevOpsTerminal.tsx', status: 'done' },
      { name: 'WorkflowOrchestrator', file: 'console/WorkflowOrchestrator.tsx', status: 'done' },
      { name: 'DockerManager', file: 'console/DockerManager.tsx', status: 'done' },
      { name: 'NasDeploymentToolkit', file: 'console/NasDeploymentToolkit.tsx', status: 'done' },
      { name: 'RemoteDockerDeploy', file: 'console/RemoteDockerDeploy.tsx', status: 'done' },
      { name: 'OpsScriptGenerator', file: 'console/OpsScriptGenerator.tsx', status: 'done' },
      { name: 'DAGExecutor', file: 'lib/useDAGExecutor.ts', status: 'done' },
    ],
    dependencies: ['L01', 'L03', 'L04'],
    keyFiles: ['useDAGExecutor.ts', 'nas-client.ts'],
    roadmap: ['Runner 实际执行 Shell 命令', 'GitOps Webhook 集成', '蓝绿部署自动化'],
    roadmapEn: ['Runner actual Shell execution', 'GitOps Webhook integration', 'Blue-green deployment automation'],
  },
  {
    id: 'L06', number: 6,
    label: 'L06 应用表现层', labelEn: 'L06 Presentation Layer',
    desc: 'Chat UI、Artifacts、消息气泡、Welcome 页面、代码高亮', descEn: 'Chat UI, Artifacts, message bubbles, welcome page, code highlighting',
    icon: Monitor, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20',
    status: 'complete', progress: 93,
    components: [
      { name: 'ChatArea', file: 'chat/ChatArea.tsx', status: 'done' },
      { name: 'MessageBubble', file: 'chat/MessageBubble.tsx', status: 'done' },
      { name: 'ArtifactsPanel', file: 'chat/ArtifactsPanel.tsx', status: 'done' },
      { name: 'ClaudeWelcome', file: 'chat/ClaudeWelcome.tsx', status: 'done' },
      { name: 'SlashCommandEngine', file: 'chat/SlashCommandEngine.tsx', status: 'done' },
      { name: 'ConsoleView', file: 'console/ConsoleView.tsx', status: 'done' },
    ],
    dependencies: ['L04', 'L05'],
    keyFiles: ['ChatArea.tsx', 'SlashCommandEngine.tsx', 'ConsoleView.tsx'],
    roadmap: ['Markdown 渲染增强 (Mermaid 图表)', '代码编辑器集成', '多标签对话'],
    roadmapEn: ['Enhanced Markdown (Mermaid diagrams)', 'Code editor integration', 'Multi-tab conversations'],
  },
  {
    id: 'L07', number: 7,
    label: 'L07 用户交互层', labelEn: 'L07 Interaction Layer',
    desc: '移动端适配、滑动手势、响应式布局、触控优化、底部导航', descEn: 'Mobile adaptation, swipe gestures, responsive layout, touch optimization',
    icon: Smartphone, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20',
    status: 'in-progress', progress: 75,
    components: [
      { name: 'Sidebar (Mobile)', file: 'layout/Sidebar.tsx', status: 'done' },
      { name: 'MobileNavBar', file: 'layout/MobileNavBar.tsx', status: 'done' },
      { name: 'NeuralLink (Mobile)', file: 'monitoring/NeuralLinkOverlay.tsx', status: 'done' },
      { name: 'Responsive Hook', file: 'App.tsx (useResponsive)', status: 'done' },
      { name: 'SearchPalette', file: 'search/SearchPalette.tsx', status: 'done' },
    ],
    dependencies: ['L06'],
    keyFiles: ['Sidebar.tsx', 'MobileNavBar.tsx', 'NeuralLinkOverlay.tsx', 'App.tsx'],
    roadmap: ['PWA 离线支持', '语音输入集成', '暗色/亮色主题切换', 'iPad 横屏多面板'],
    roadmapEn: ['PWA offline support', 'Voice input integration', 'Dark/light theme toggle', 'iPad landscape multi-panel'],
  },
  {
    id: 'L08', number: 8,
    label: 'L08 扩展演进层', labelEn: 'L08 Evolution Layer',
    desc: '测试框架、烟雾测试、安全审计、API 文档、Token 分析', descEn: 'Test framework, smoke tests, security audit, API docs, token analytics',
    icon: Infinity, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20',
    status: 'complete', progress: 82,
    components: [
      { name: 'TestFrameworkRunner', file: 'console/TestFrameworkRunner.tsx', status: 'done' },
      { name: 'SmokeTestRunner', file: 'console/SmokeTestRunner.tsx', status: 'done' },
      { name: 'SecurityAudit', file: 'console/SecurityAudit.tsx', status: 'done' },
      { name: 'ApiDocsViewer', file: 'console/ApiDocsViewer.tsx', status: 'done' },
      { name: 'TokenUsageDashboard', file: 'console/TokenUsageDashboard.tsx', status: 'done' },
      { name: 'StreamDiagnostics', file: 'console/StreamDiagnostics.tsx', status: 'done' },
    ],
    dependencies: ['L03', 'L05', 'L06'],
    keyFiles: ['__tests__/', 'SecurityAudit.tsx', 'StreamDiagnostics.tsx'],
    roadmap: ['E2E 自动化测试 (Playwright)', 'CI 集成报告', '性能基准追踪'],
    roadmapEn: ['E2E automation (Playwright)', 'CI integration reports', 'Performance benchmark tracking'],
  },
  {
    id: 'L09', number: 9,
    label: 'L09 系统设置层', labelEn: 'L09 System Settings Layer',
    desc: '全局配置、外观定制、Provider 管理、i18n、快捷键', descEn: 'Global config, appearance customization, provider management, i18n, shortcuts',
    icon: Settings, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20',
    status: 'complete', progress: 90,
    components: [
      { name: 'SettingsModal', file: 'settings/SettingsModal.tsx', status: 'done' },
      { name: 'SettingsView', file: 'console/SettingsView.tsx', status: 'done' },
      { name: 'i18n Provider', file: 'lib/i18n.tsx', status: 'done' },
      { name: 'Zustand Store', file: 'lib/store.ts', status: 'done' },
      { name: 'NeuralLinkOverlay', file: 'monitoring/NeuralLinkOverlay.tsx', status: 'done' },
    ],
    dependencies: ['L06', 'L07'],
    keyFiles: ['store.ts', 'i18n.tsx', 'SettingsModal.tsx', 'types.ts'],
    roadmap: ['设置导出/导入跨设备同步', '主题市场（社区自定义主题）', '快捷键自定义'],
    roadmapEn: ['Settings export/import for cross-device sync', 'Theme marketplace (community themes)', 'Custom key bindings'],
  },
];

// --- Per-layer detail card ---
function LayerDetailCard({ layer, zh, onNavigate }: { layer: LayerDetail; zh: boolean; onNavigate: (tab: string) => void }) {
  const [expanded, setExpanded] = React.useState(false);

  const statusIcon = layer.status === 'complete' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
    layer.status === 'in-progress' ? <Clock className="w-4 h-4 text-amber-400" /> :
    <AlertTriangle className="w-4 h-4 text-zinc-500" />;

  const statusLabel = layer.status === 'complete' ? (zh ? '已完成' : 'Complete') :
    layer.status === 'in-progress' ? (zh ? '进行中' : 'In Progress') :
    (zh ? '规划中' : 'Planned');

  return (
    <Card className={cn('border overflow-hidden transition-all', layer.borderColor, 'bg-black/40')}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border', layer.bgColor, layer.borderColor)}>
                <layer.icon className={cn('w-5 h-5', layer.color)} />
              </div>
              <div>
                <CardTitle className={cn('text-sm', layer.color)}>
                  {zh ? layer.label : layer.labelEn}
                </CardTitle>
                <CardDescription className="text-[10px] mt-0.5">
                  {zh ? layer.desc : layer.descEn}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {statusIcon}
              <Badge variant="outline" className={cn(
                'text-[9px] font-mono',
                layer.status === 'complete' ? 'border-emerald-500/30 text-emerald-400' :
                layer.status === 'in-progress' ? 'border-amber-500/30 text-amber-400' :
                'border-zinc-700 text-zinc-500',
              )}>
                {layer.progress}%
              </Badge>
              {expanded ? <ChevronDown className="w-4 h-4 text-zinc-600" /> : <ChevronRight className="w-4 h-4 text-zinc-600" />}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-1000',
                layer.status === 'complete' ? 'bg-emerald-500' :
                layer.status === 'in-progress' ? 'bg-amber-500' : 'bg-zinc-600',
              )}
              style={{ width: `${layer.progress}%` }}
            />
          </div>
        </CardHeader>
      </button>

      {expanded && (
        <CardContent className="pt-0 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Components */}
          <div>
            <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-widest">
              {zh ? '组件清单' : 'Components'} ({layer.components.length})
            </div>
            <div className="space-y-1">
              {layer.components.map(c => (
                <div key={c.name} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <Code className="w-3 h-3 text-zinc-600" />
                    <span className="text-[10px] font-mono text-zinc-400">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-700">{c.file}</span>
                    <div className={cn('w-1.5 h-1.5 rounded-full',
                      c.status === 'done' ? 'bg-emerald-500' :
                      c.status === 'wip' ? 'bg-amber-500' : 'bg-zinc-600',
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          {layer.dependencies.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-widest">
                {zh ? '依赖层' : 'Dependencies'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {layer.dependencies.map(dep => {
                  const depLayer = NINE_LAYERS.find(l => l.id === dep);

                  return (
                    <Badge key={dep} variant="outline" className={cn('text-[9px] font-mono', depLayer?.borderColor)}>
                      <span className={depLayer?.color}>{dep}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Files */}
          <div>
            <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-widest">
              {zh ? '关键文件' : 'Key Files'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {layer.keyFiles.map(f => (
                <code key={f} className="text-[9px] font-mono text-zinc-600 px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                  {f}
                </code>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div>
            <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-widest">
              {zh ? '演进路线' : 'Roadmap'}
            </div>
            <div className="space-y-1.5">
              {(zh ? layer.roadmap : layer.roadmapEn).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <ArrowRight className="w-3 h-3 text-zinc-700 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function NineLayerArchitecture() {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const navigateToConsoleTab = useSystemStore(s => s.navigateToConsoleTab);

  // Summary stats
  const totalComponents = NINE_LAYERS.reduce((sum, l) => sum + l.components.length, 0);
  const doneComponents = NINE_LAYERS.reduce((sum, l) => sum + l.components.filter(c => c.status === 'done').length, 0);
  const avgProgress = Math.round(NINE_LAYERS.reduce((sum, l) => sum + l.progress, 0) / NINE_LAYERS.length);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl text-white tracking-tight flex items-center gap-3">
          <Layers className="w-7 h-7 text-indigo-400" />
          {zh ? '九层架构设计蓝图' : 'Nine-Layer Architecture Blueprint'}
        </h2>
        <Badge variant="outline" className="font-mono text-xs border-white/10 text-zinc-400">
          Phase 45 — Implementation Plan
        </Badge>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: zh ? '总组件数' : 'Total Components', value: `${doneComponents}/${totalComponents}`, color: 'text-emerald-400' },
          { label: zh ? '平均完成度' : 'Avg Progress', value: `${avgProgress}%`, color: 'text-sky-400' },
          { label: zh ? '已完成层' : 'Complete Layers', value: `${NINE_LAYERS.filter(l => l.status === 'complete').length}/9`, color: 'text-amber-400' },
          { label: zh ? '关键文件' : 'Key Files', value: `${NINE_LAYERS.reduce((sum, l) => sum + l.keyFiles.length, 0)}`, color: 'text-pink-400' },
        ].map(s => (
          <Card key={s.label} className="bg-zinc-900/50 border-white/5">
            <CardContent className="p-4 text-center">
              <div className={cn('text-lg font-mono', s.color)}>{s.value}</div>
              <div className="text-[10px] text-zinc-600 font-mono mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Layer Dependency Flow */}
      <Card className="bg-zinc-900/50 border-white/5">
        <CardContent className="p-4">
          <div className="text-[10px] font-mono text-zinc-600 mb-3 uppercase tracking-widest">
            {zh ? '层级依赖流' : 'Layer Dependency Flow'}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {NINE_LAYERS.map((l, i) => (
              <div key={l.id} className="contents">
                <div className={cn(
                  'px-3 py-1.5 rounded-lg border text-[10px] font-mono flex items-center gap-1.5 transition-all hover:scale-105',
                  l.bgColor, l.borderColor,
                )}>
                  <div className={cn('w-1.5 h-1.5 rounded-full',
                    l.status === 'complete' ? 'bg-emerald-500' :
                    l.status === 'in-progress' ? 'bg-amber-500' : 'bg-zinc-600',
                  )} />
                  <span className={l.color}>{l.id}</span>
                </div>
                {i < NINE_LAYERS.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-zinc-700 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layer Cards */}
      <div className="space-y-3">
        {NINE_LAYERS.map(layer => (
          <LayerDetailCard
            key={layer.id}
            layer={layer}
            zh={zh}
            onNavigate={navigateToConsoleTab}
          />
        ))}
      </div>

      {/* Overall Roadmap */}
      <Card className="bg-zinc-900/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-400" />
            {zh ? '全局演进预期' : 'Global Evolution Outlook'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                phase: zh ? '近期 (Phase 46-48)' : 'Near-term (Phase 46-48)',
                color: 'text-emerald-400',
                borderColor: 'border-emerald-500/20',
                items: zh
                  ? ['部署 yyc3-pg-proxy 完成端到端通道', 'Runner Service 实际执行 Shell', 'Telemetry WebSocket 真实数据流', 'MCP Server 实际连通']
                  : ['Deploy yyc3-pg-proxy for end-to-end', 'Runner Service real Shell execution', 'Live Telemetry WebSocket', 'Live MCP Server connections'],
              },
              {
                phase: zh ? '中期 (Phase 49-55)' : 'Mid-term (Phase 49-55)',
                color: 'text-amber-400',
                borderColor: 'border-amber-500/20',
                items: zh
                  ? ['RAG 向量检索 (pgvector)', 'Agent 长期记忆 PG 持久化', 'GitOps Webhook 集成', 'PWA 离线支持', 'E2E 自动化测试']
                  : ['RAG vector retrieval (pgvector)', 'Agent long-term memory in PG', 'GitOps Webhook integration', 'PWA offline support', 'E2E automated testing'],
              },
              {
                phase: zh ? '远期 (Phase 56+)' : 'Long-term (Phase 56+)',
                color: 'text-purple-400',
                borderColor: 'border-purple-500/20',
                items: zh
                  ? ['多用户协作 WebSocket', '语音交互模式', '自定义 Agent 创建器', '插件市场生态', '集群自动扩缩容']
                  : ['Multi-user WebSocket collaboration', 'Voice interaction mode', 'Custom Agent builder', 'Plugin marketplace', 'Cluster auto-scaling'],
              },
            ].map(p => (
              <div key={p.phase} className={cn('p-4 rounded-lg border bg-black/30', p.borderColor)}>
                <div className={cn('text-xs font-mono mb-3', p.color)}>{p.phase}</div>
                <div className="space-y-1.5">
                  {p.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-zinc-500">
                      <ArrowRight className="w-3 h-3 text-zinc-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}