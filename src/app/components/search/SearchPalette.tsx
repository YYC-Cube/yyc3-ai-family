import {
  FileCode,
  MessageSquare,
  Hash,
  CornerDownLeft,
  Search,
  Terminal,
  Zap,
} from 'lucide-react';
import * as React from 'react';

import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useTranslation } from '@/lib/i18n';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'chat' | 'code' | 'file' | 'command';
  title: string;
  preview: string;
  timestamp?: string;
  action?: () => void;
}

interface SearchPaletteProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: SearchResult) => void;
}

// Mock Data (files / code / chat)
const MOCK_RESULTS: SearchResult[] = [
  { id: '1', type: 'file', title: 'Sidebar.tsx', preview: '/src/app/components/layout/Sidebar.tsx' },
  { id: '2', type: 'file', title: 'App.tsx', preview: '/src/app/App.tsx' },
  { id: '3', type: 'code', title: 'Rust Axum Server', preview: 'use axum::{routing::get, Router};' },
  { id: '4', type: 'code', title: 'React Button Component', preview: 'export const Button = React.forwardRef...' },
  { id: '5', type: 'chat', title: 'Microservice discussion', preview: 'How do I implement a health check...', timestamp: '10:42 AM' },
  { id: '6', type: 'chat', title: 'Agent Architecture', preview: 'The Architect agent suggests using MVC...', timestamp: 'Yesterday' },
];

// === Terminal Command Registry ===
// Searchable by Chinese keywords, English names, and descriptions
interface CommandDef {
  id: string;
  title: string;
  keywords: string[]; // searchable terms (zh + en)
  description: string;
  action: () => void;
}

function buildCommandRegistry(): CommandDef[] {
  const store = useSystemStore.getState();

  return [
    // === Views ===
    { id: 'cmd-terminal', title: '终端控制', keywords: ['终端', '聊天', 'terminal', 'chat'], description: '切换到终端聊天视图', action: () => store.setActiveView('terminal') },
    { id: 'cmd-console', title: '系统控制台', keywords: ['控制台', 'console', 'sys'], description: '打开系统控制台', action: () => store.setActiveView('console') },
    { id: 'cmd-monitor', title: '网络监控', keywords: ['监控', '网络', 'monitor', 'health', 'network'], description: '查看服务健康状态', action: () => store.setActiveView('monitor') },
    { id: 'cmd-projects', title: '项目目录', keywords: ['项目', 'projects', 'dir'], description: '浏览项目文件', action: () => store.setActiveView('projects') },
    { id: 'cmd-artifacts', title: '工件日志', keywords: ['工件', '制品', 'artifacts', 'log'], description: '查看生成的工件', action: () => store.setActiveView('artifacts') },

    // === Console Tabs ===
    { id: 'cmd-dashboard', title: '总控仪表盘', keywords: ['仪表盘', '总控', '诊断', 'dashboard', 'diagnostic'], description: '集群总控台 + 自诊断', action: () => store.navigateToConsoleTab('dashboard') },
    { id: 'cmd-devops', title: 'DevOps 运维', keywords: ['devops', '运维', '流水线', 'pipeline', 'ci/cd', 'dag', '工作流', 'workflow'], description: 'CI/CD 流水线 & DAG 工作流', action: () => store.navigateToConsoleTab('devops') },
    { id: 'cmd-architecture', title: '架构视图', keywords: ['架构', 'architecture', 'arch'], description: '系统架构拓扑', action: () => store.navigateToConsoleTab('architecture') },
    { id: 'cmd-mcp', title: 'MCP 工具链', keywords: ['mcp', '工具链', 'tool chain', 'figma', 'github'], description: 'MCP 工具管理', action: () => store.navigateToConsoleTab('mcp') },
    { id: 'cmd-persist', title: '持久化管理', keywords: ['持久化', '快照', '备份', 'persist', 'snapshot', 'backup'], description: '数据持久化 & 快照', action: () => store.navigateToConsoleTab('persist') },
    { id: 'cmd-orchestrate', title: '多智能体编排', keywords: ['编排', '协作', 'orchestrat', 'collaborat', 'multi-agent'], description: '智能体协作编排', action: () => store.navigateToConsoleTab('orchestrate') },
    { id: 'cmd-agent-identity', title: '智能体身份', keywords: ['身份', '角色卡', 'identity', 'role card'], description: '智能体身份配置', action: () => store.navigateToConsoleTab('agent_identity') },
    { id: 'cmd-family', title: '家人在线', keywords: ['家人', '在线', '陪伴', 'family', 'presence'], description: '家庭在线状态', action: () => store.navigateToConsoleTab('family_presence') },
    { id: 'cmd-knowledge', title: '知识库', keywords: ['知识', 'knowledge', 'kb'], description: '知识库管理', action: () => store.navigateToConsoleTab('knowledge_base') },
    { id: 'cmd-nas-deploy', title: 'NAS 部署工具', keywords: ['部署工具', 'deploy toolkit', '连通性', 'connectivity', 'nas'], description: 'NAS 连通性测试 & 部署', action: () => store.navigateToConsoleTab('nas_deployment') },
    { id: 'cmd-metrics-history', title: '历史指标', keywords: ['历史指标', '趋势', 'metrics history', 'trend'], description: '集群指标历史曲线', action: () => store.navigateToConsoleTab('metrics_history') },
    { id: 'cmd-remote-deploy', title: '远程容器部署', keywords: ['远程部署', '一键部署', 'docker compose', '容器部署', 'remote deploy'], description: 'Docker Compose 远程部署', action: () => store.navigateToConsoleTab('remote_docker_deploy') },
    { id: 'cmd-ollama', title: 'Ollama 本地模型', keywords: ['ollama', '本地模型', 'local model', '离线模型'], description: '本地 LLM 模型管理', action: () => store.navigateToConsoleTab('ollama_manager') },
    { id: 'cmd-api-docs', title: 'API 文档', keywords: ['api文档', 'api doc', '接口文档', 'api reference'], description: 'API 接口文档查看器', action: () => store.navigateToConsoleTab('api_docs') },
    { id: 'cmd-smoke-test', title: '冒烟测试', keywords: ['smoke', '烟雾测试', 'e2e', '冒烟'], description: 'E2E 冒烟测试套件', action: () => store.navigateToConsoleTab('smoke_test') },
    { id: 'cmd-test-framework', title: '测试框架', keywords: ['测试框架', 'test framework', '类型审计', 'type audit', '测试套件', 'test suite'], description: '测试框架 & 类型审计', action: () => store.navigateToConsoleTab('test_framework') },
    { id: 'cmd-settings', title: '系统设置', keywords: ['设置', 'settings', 'config', '配置'], description: '系统参数配置', action: () => store.openSettings('general') },

    // === Agents ===
    { id: 'cmd-navigator', title: 'Navigator 领航员', keywords: ['领航员', 'navigator', '任务分发'], description: '任务分发与路由智能体', action: () => store.navigateToAgent('navigator') },
    { id: 'cmd-sentinel', title: 'Sentinel 哨兵', keywords: ['哨兵', 'sentinel', '安全审计'], description: '安全审计与监控智能体', action: () => store.navigateToAgent('sentinel') },
    { id: 'cmd-thinker', title: 'Thinker 思想家', keywords: ['思想家', 'thinker', '深度推理'], description: '深度推理与分析智能体', action: () => store.navigateToAgent('thinker') },
    { id: 'cmd-prophet', title: 'Prophet 先知', keywords: ['先知', 'prophet', '预测'], description: '预测与趋势分析智能体', action: () => store.navigateToAgent('prophet') },
    { id: 'cmd-bole', title: 'Bole 伯乐', keywords: ['伯乐', 'bole', '资源优化'], description: '人才与资源优化智能体', action: () => store.navigateToAgent('bole') },
    { id: 'cmd-pivot', title: 'Pivot 天枢', keywords: ['天枢', 'pivot', '架构枢纽'], description: '架构核心枢纽智能体', action: () => store.navigateToAgent('pivot') },
    { id: 'cmd-grandmaster', title: 'Grandmaster 宗师', keywords: ['宗师', 'grandmaster', '总控', '决策'], description: '总控与决策智能体', action: () => store.navigateToAgent('grandmaster') },
  ];
}

export function SearchPalette({ query, isOpen, onClose, onSelect }: SearchPaletteProps) {
  const { t } = useTranslation();

  // Build command registry (uses store.getState, no subscription needed)
  const commands = React.useMemo(() => buildCommandRegistry(), []);

  if (!isOpen || !query) return null;

  const q = query.toLowerCase();

  // Escape special regex characters for Highlight
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Filter existing mock results
  const filteredMock = MOCK_RESULTS.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.preview.toLowerCase().includes(q),
  );

  // Filter commands by keyword matching
  const filteredCommands: SearchResult[] = commands
    .filter(cmd =>
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some(kw => kw.toLowerCase().includes(q)),
    )
    .map(cmd => ({
      id: cmd.id,
      type: 'command' as const,
      title: cmd.title,
      preview: cmd.description,
      action: cmd.action,
    }));

  const allResults = [...filteredMock, ...filteredCommands];

  const grouped = {
    command: filteredCommands,
    file: filteredMock.filter(i => i.type === 'file'),
    code: filteredMock.filter(i => i.type === 'code'),
    chat: filteredMock.filter(i => i.type === 'chat'),
  };

  const Highlight = ({ text }: { text: string }) => {
    if (!escapedQuery) return <>{text}</>;
    try {
      const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

      return (
        <>
          {parts.map((part, i) =>
            part.toLowerCase() === q ?
            <span key={i} className="bg-yellow-500/30 text-yellow-200 font-bold">{part}</span> :
            part,
          )}
        </>
      );
    } catch {
      return <>{text}</>;
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.action) {
      result.action();
      onClose();
    } else {
      onSelect(result);
    }
  };

  return (
    <div className="absolute top-14 left-6 right-6 md:w-[600px] bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-b-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-2 bg-muted/20 border-b border-white/5 flex justify-between">
        <span>{t('search.title')}</span>
        <span className="font-mono">{allResults.length} results</span>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="p-2 space-y-4">

          {/* Commands Group (shown first for terminal search) */}
          {grouped.command.length > 0 && (
            <div className="space-y-1">
              <h4 className="px-2 text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
                <Terminal className="w-3 h-3" /> {t('search.commands')}
              </h4>
              {grouped.command.map(item => (
                <CommandResultItem key={item.id} item={item} onSelect={() => handleSelect(item)} Highlight={Highlight} />
              ))}
            </div>
          )}

          {/* Files Group */}
          {grouped.file.length > 0 && (
            <div className="space-y-1">
              <h4 className="px-2 text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
                <FileCode className="w-3 h-3" /> {t('search.files')}
              </h4>
              {grouped.file.map(item => (
                <ResultItem key={item.id} item={item} onSelect={() => handleSelect(item)} Highlight={Highlight} />
              ))}
            </div>
          )}

          {/* Code Group */}
          {grouped.code.length > 0 && (
            <div className="space-y-1">
              <h4 className="px-2 text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
                <Hash className="w-3 h-3" /> {t('search.code')}
              </h4>
              {grouped.code.map(item => (
                <ResultItem key={item.id} item={item} onSelect={() => handleSelect(item)} Highlight={Highlight} />
              ))}
            </div>
          )}

          {/* Chat Group */}
          {grouped.chat.length > 0 && (
            <div className="space-y-1">
              <h4 className="px-2 text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> {t('search.chat')}
              </h4>
              {grouped.chat.map(item => (
                <ResultItem key={item.id} item={item} onSelect={() => handleSelect(item)} Highlight={Highlight} />
              ))}
            </div>
          )}

          {allResults.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">{t('search.no_results')} "{query}"</p>
              <p className="text-[10px] text-zinc-600 mt-2 font-mono">{t('search.cmd_hint')}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-2 bg-muted/30 border-t border-white/5 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
        <div className="flex gap-2">
          <span className="flex items-center gap-1"><kbd className="bg-background border px-1 rounded">↑↓</kbd> {t('search.navigate')}</span>
          <span className="flex items-center gap-1"><kbd className="bg-background border px-1 rounded">↵</kbd> {t('search.select')}</span>
        </div>
        <span>YYC3_INDEXER_V2</span>
      </div>
    </div>
  );
}

// Command-specific result item with action badge
function CommandResultItem({ item, onSelect, Highlight }: { item: SearchResult, onSelect: () => void, Highlight: React.ComponentType<{ text: string }> }) {
  return (
    <div
      onClick={onSelect}
      className="group flex items-start gap-3 p-2 rounded-md hover:bg-[#0EA5E9]/10 cursor-pointer transition-colors border border-transparent hover:border-[#0EA5E9]/20"
    >
      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 border border-[#0EA5E9]/30 text-[#0EA5E9] bg-[#0EA5E9]/5 transition-colors group-hover:bg-[#0EA5E9]/15">
        <Zap className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-foreground group-hover:text-[#0EA5E9] transition-colors">
            <Highlight text={item.title} />
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#0EA5E9]/10 text-[#0EA5E9] font-mono shrink-0">
            CMD
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5 group-hover:text-foreground/80">
          <Highlight text={item.preview} />
        </p>
      </div>

      <div className="opacity-0 group-hover:opacity-100 self-center transition-opacity duration-200">
        <CornerDownLeft className="w-3 h-3 text-[#0EA5E9]" />
      </div>
    </div>
  );
}

function ResultItem({ item, onSelect, Highlight }: { item: SearchResult, onSelect: () => void, Highlight: React.ComponentType<{ text: string }> }) {
  return (
    <div
      onClick={onSelect}
      className="group flex items-start gap-3 p-2 rounded-md hover:bg-primary/10 cursor-pointer transition-colors border border-transparent hover:border-primary/20"
    >
      <div className={cn(
        'w-8 h-8 rounded flex items-center justify-center shrink-0 border bg-background/50 transition-colors group-hover:bg-background/80',
        item.type === 'file' && 'border-blue-500/30 text-blue-400',
        item.type === 'code' && 'border-green-500/30 text-green-400',
        item.type === 'chat' && 'border-purple-500/30 text-purple-400',
      )}>
        {item.type === 'file' && <FileCode className="w-4 h-4" />}
        {item.type === 'code' && <Hash className="w-4 h-4" />}
        {item.type === 'chat' && <MessageSquare className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
            <Highlight text={item.title} />
          </span>
          {item.timestamp && <span className="text-[10px] text-muted-foreground font-mono">{item.timestamp}</span>}
        </div>
        <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5 group-hover:text-foreground/80">
          <Highlight text={item.preview} />
        </p>
      </div>

      <div className="opacity-0 group-hover:opacity-100 self-center transition-opacity duration-200">
        <CornerDownLeft className="w-3 h-3 text-muted-foreground" />
      </div>
    </div>
  );
}
