import {
  Compass, MessageSquare, Brain, ArrowRight, ArrowLeftRight,
  Zap, Settings, CheckCircle2, AlertTriangle,
  Clock, Shield,
  Sparkles, Globe, BookOpen, Layers, FileText, Keyboard, Search, Radio,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { eventBus } from '@/lib/event-bus';
import { useTranslation } from '@/lib/i18n';
import { loadProviderConfigs } from '@/lib/llm-bridge';
import { PROVIDERS } from '@/lib/llm-providers';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ============================================================
// ModeControlPanel — AI/Navigate Mode Multi-Dimensional Closed-Loop
// Phase 45: Complete mode management with transition tracking,
// contextual commands, and operation manual.
// ============================================================

interface ModeTransition {
  id: string;
  from: 'navigate' | 'ai';
  to: 'navigate' | 'ai';
  timestamp: number;
  trigger: string;
}

// --- Mode Transition History Store (session-scoped) ---
const modeHistory: ModeTransition[] = [];

function recordTransition(from: 'navigate' | 'ai', to: 'navigate' | 'ai', trigger: string) {
  modeHistory.unshift({
    id: `mt-${Date.now()}`,
    from, to,
    timestamp: Date.now(),
    trigger,
  });
  if (modeHistory.length > 50) modeHistory.pop();
}

export function ModeControlPanel() {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const chatMode = useSystemStore(s => s.chatMode);
  const toggleChatMode = useSystemStore(s => s.toggleChatMode);
  const _messages = useSystemStore(s => s.messages);
  const _activeView = useSystemStore(s => s.activeView);
  const _consoleTab = useSystemStore(s => s.consoleTab);
  const navigateToConsoleTab = useSystemStore(s => s.navigateToConsoleTab);
  const _setActiveView = useSystemStore(s => s.setActiveView);

  const [transitions, setTransitions] = React.useState<ModeTransition[]>([...modeHistory]);

  const handleToggle = () => {
    const from = chatMode;
    const to = chatMode === 'ai' ? 'navigate' : 'ai';

    toggleChatMode();
    recordTransition(from, to, 'ModeControlPanel');
    setTransitions([...modeHistory]);
    eventBus.emit({
      category: 'ui', type: 'ui.mode_switch', level: 'info',
      source: 'ModeControl', message: `Mode: ${from} → ${to}`,
    });
  };

  // Provider status
  const configs = loadProviderConfigs();
  const enabledProviders = configs.filter(c => c.enabled && c.apiKey);
  const hasProvider = enabledProviders.length > 0;

  // Contextual suggestions based on current mode
  const aiModeSuggestions = [
    { icon: MessageSquare, label: zh ? '与 AI 对话讨论问题' : 'Chat with AI about problems', color: 'text-emerald-400' },
    { icon: Brain, label: zh ? '使用 Agent 专项分析' : 'Use Agent for specialized analysis', color: 'text-amber-400' },
    { icon: FileText, label: zh ? '生成代码/脚本/文档' : 'Generate code/scripts/docs', color: 'text-sky-400' },
    { icon: Sparkles, label: zh ? '多 Provider 自动路由' : 'Multi-provider auto-routing', color: 'text-purple-400' },
    { icon: Shield, label: zh ? '安全审计咨询' : 'Security audit consultation', color: 'text-red-400' },
  ];

  const navModeSuggestions = [
    { icon: Compass, label: zh ? '输入关键词导航到任意模块' : 'Navigate to any module by keyword', color: 'text-amber-400' },
    { icon: Globe, label: zh ? '知识域智能问答 (无需 API Key)' : 'Knowledge domain Q&A (no API key)', color: 'text-cyan-400' },
    { icon: BookOpen, label: zh ? '查询平台架构/MCP/LLM 知识' : 'Query platform/MCP/LLM knowledge', color: 'text-emerald-400' },
    { icon: Search, label: zh ? '模糊匹配中英文关键词' : 'Fuzzy match CN/EN keywords', color: 'text-sky-400' },
    { icon: Zap, label: zh ? '零延迟即时跳转' : 'Zero-latency instant navigation', color: 'text-pink-400' },
  ];

  // Quick actions per mode
  const quickActions = chatMode === 'ai' ? [
    { label: '/status', desc: zh ? '系统状态' : 'System status', action: () => navigateToConsoleTab('dashboard') },
    { label: '/agent', desc: zh ? 'Agent 矩阵' : 'Agent matrix', action: () => navigateToConsoleTab('ai') },
    { label: '/model', desc: zh ? '模型路由' : 'Model routing', action: () => navigateToConsoleTab('stream_diagnostics') },
    { label: '/perf', desc: zh ? '性能快照' : 'Performance', action: () => navigateToConsoleTab('hardware_monitor') },
  ] : [
    { label: 'dashboard', desc: zh ? '总控台' : 'Dashboard', action: () => navigateToConsoleTab('dashboard') },
    { label: 'devops', desc: zh ? 'DevOps' : 'DevOps', action: () => navigateToConsoleTab('devops') },
    { label: 'hardware', desc: zh ? '硬件遥测' : 'HW Telemetry', action: () => navigateToConsoleTab('hardware_monitor') },
    { label: 'security', desc: zh ? '安全审计' : 'Security', action: () => navigateToConsoleTab('security_audit') },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl text-white tracking-tight flex items-center gap-3">
          <ArrowLeftRight className="w-7 h-7 text-amber-400" />
          {zh ? 'AI / 导航模式控制中心' : 'AI / Navigation Mode Control'}
        </h2>
        <Badge variant="outline" className="font-mono text-xs border-white/10 text-zinc-400">
          Phase 45 — Closed-Loop
        </Badge>
      </div>

      {/* Mode Switcher Card */}
      <Card className="bg-gradient-to-br from-zinc-900/80 to-black border-white/10 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Navigate Mode */}
            <button
              onClick={() => chatMode !== 'navigate' && handleToggle()}
              className={cn(
                'flex-1 p-5 rounded-xl border-2 transition-all w-full',
                chatMode === 'navigate'
                  ? 'border-amber-500/50 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 cursor-pointer',
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  chatMode === 'navigate' ? 'bg-amber-500/20' : 'bg-zinc-800',
                )}>
                  <Compass className={cn('w-5 h-5', chatMode === 'navigate' ? 'text-amber-400' : 'text-zinc-500')} />
                </div>
                <div className="text-left">
                  <div className={cn('font-mono text-sm', chatMode === 'navigate' ? 'text-amber-400' : 'text-zinc-500')}>
                    {zh ? '导航模式' : 'Navigate Mode'}
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono">NAV_MODE</div>
                </div>
                {chatMode === 'navigate' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400 ml-auto" />
                )}
              </div>
              <p className="text-xs text-zinc-500 text-left">
                {zh
                  ? '通过自然语言关键词快速导航至任意功能模块，无需 API Key，内置知识域问答。'
                  : 'Navigate to any module via natural language keywords. No API key needed, built-in knowledge Q&A.'}
              </p>
            </button>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggle}
                className="border-zinc-700 hover:border-primary hover:bg-primary/10 text-zinc-400 hover:text-primary"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </Button>
              <kbd className="text-[9px] font-mono text-zinc-600 px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                Ctrl+M
              </kbd>
            </div>

            {/* AI Mode */}
            <button
              onClick={() => chatMode !== 'ai' && handleToggle()}
              className={cn(
                'flex-1 p-5 rounded-xl border-2 transition-all w-full',
                chatMode === 'ai'
                  ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 cursor-pointer',
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  chatMode === 'ai' ? 'bg-emerald-500/20' : 'bg-zinc-800',
                )}>
                  <Brain className={cn('w-5 h-5', chatMode === 'ai' ? 'text-emerald-400' : 'text-zinc-500')} />
                </div>
                <div className="text-left">
                  <div className={cn('font-mono text-sm', chatMode === 'ai' ? 'text-emerald-400' : 'text-zinc-500')}>
                    {zh ? 'AI 对话模式' : 'AI Chat Mode'}
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono">AI_MODE</div>
                </div>
                {chatMode === 'ai' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />
                )}
              </div>
              <p className="text-xs text-zinc-500 text-left">
                {zh
                  ? '多 Provider 流式 AI 对话，支持 7 大 LLM 自动路由、Agent 专项对话、代码生成。'
                  : 'Multi-provider streaming AI chat with 7 LLM auto-routing, Agent specialization, code gen.'}
              </p>
              {!hasProvider && (
                <div className="flex items-center gap-1.5 mt-2 text-amber-500/80">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono">
                    {zh ? '需配置至少一个 Provider API Key' : 'Requires at least 1 Provider API Key'}
                  </span>
                </div>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contextual Suggestions */}
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className={cn('w-4 h-4', chatMode === 'ai' ? 'text-emerald-400' : 'text-amber-400')} />
              {zh ? '当前模式功能' : 'Current Mode Features'}
            </CardTitle>
            <CardDescription className="text-[10px] font-mono">
              {chatMode === 'ai' ? 'AI_MODE — Full LLM Capabilities' : 'NAV_MODE — Knowledge & Navigation'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(chatMode === 'ai' ? aiModeSuggestions : navModeSuggestions).map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors">
                <s.icon className={cn('w-4 h-4 shrink-0', s.color)} />
                <span className="text-xs text-zinc-300">{s.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-pink-400" />
              {zh ? '快捷操作' : 'Quick Actions'}
            </CardTitle>
            <CardDescription className="text-[10px] font-mono">
              {zh ? '常用命令一键执行' : 'One-click common commands'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={a.action}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <code className="text-[10px] font-mono text-primary px-1.5 py-0.5 bg-primary/10 rounded">{a.label}</code>
                  <span className="text-xs text-zinc-400">{a.desc}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Provider Status (AI Mode readiness) */}
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              {zh ? 'AI 模式就绪状态' : 'AI Mode Readiness'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PROVIDERS).slice(0, 7).map(p => {
                const cfg = configs.find(c => c.providerId === p.id);
                const isActive = cfg?.enabled && cfg?.apiKey;

                return (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className={cn('w-2 h-2 rounded-full', isActive ? 'bg-emerald-500' : 'bg-zinc-700')} />
                    <span className="text-[10px] font-mono text-zinc-400">{p.icon}</span>
                    <span className="text-[10px] font-mono text-zinc-500 truncate">{p.displayName}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] font-mono text-zinc-600 flex items-center justify-between pt-1">
              <span>{enabledProviders.length}/{Object.keys(PROVIDERS).length} active</span>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-500 hover:text-primary" onClick={() => useSystemStore.getState().openSettings('models')}>
                <Settings className="w-3 h-3 mr-1" />
                {zh ? '配置' : 'Configure'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mode Transition History */}
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" />
              {zh ? '模式切换历史' : 'Mode Transition History'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[160px]">
              {transitions.length === 0 ? (
                <div className="text-[10px] text-zinc-700 font-mono text-center py-6">
                  {zh ? '暂无切换记录' : 'No transitions recorded'}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {transitions.slice(0, 10).map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 p-1.5 rounded bg-white/[0.02]">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded',
                        t.from === 'ai' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10',
                      )}>
                        {t.from === 'ai' ? 'AI' : 'NAV'}
                      </span>
                      <ArrowRight className="w-3 h-3 text-zinc-700" />
                      <span className={cn(
                        'px-1.5 py-0.5 rounded',
                        t.to === 'ai' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10',
                      )}>
                        {t.to === 'ai' ? 'AI' : 'NAV'}
                      </span>
                      <span className="text-zinc-700 ml-auto">{new Date(t.timestamp).toLocaleTimeString()}</span>
                      <span className="text-zinc-700">{t.trigger}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Operation Manual: Mode Usage Guide */}
      <Card className="bg-zinc-900/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            {zh ? '模式操作手册' : 'Mode Operation Manual'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Navigate Mode Guide */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-amber-400">{zh ? '导航模式指南' : 'Navigate Mode Guide'}</span>
              </div>
              <div className="space-y-2 text-[11px] text-zinc-400">
                <p>{zh ? '1. 输入模块名称或功能关键词，系统自动匹配并跳转' : '1. Type module names or keywords for auto-navigation'}</p>
                <p>{zh ? '2. 支持中英文关键词混合匹配' : '2. Supports mixed CN/EN keyword matching'}</p>
                <p>{zh ? '3. 未匹配导航时自动查询知识域（MCP、LLM、集群等）' : '3. Falls back to knowledge domain queries (MCP, LLM, cluster, etc.)'}</p>
                <p>{zh ? '4. 无需 API Key，即开即用' : '4. No API key required, instant use'}</p>
                <div className="mt-3 p-3 bg-black/40 rounded-lg border border-amber-500/10">
                  <div className="text-[10px] text-amber-400 font-mono mb-2">{zh ? '示例关键词：' : 'Example keywords:'}</div>
                  <div className="flex flex-wrap gap-1">
                    {['dashboard', '仪表盘', 'devops', 'MCP', 'security', '安全', 'NAS', 'hardware', 'ollama', 'AI Family', '持久化', 'LLM Bridge'].map(k => (
                      <code key={k} className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400/80 rounded">{k}</code>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Mode Guide */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-emerald-400">{zh ? 'AI 对话模式指南' : 'AI Chat Mode Guide'}</span>
              </div>
              <div className="space-y-2 text-[11px] text-zinc-400">
                <p>{zh ? '1. 选择并激活至少一个 LLM Provider (设置 → AI 模型)' : '1. Activate at least 1 LLM provider (Settings → AI Models)'}</p>
                <p>{zh ? '2. 直接输入自然语言与 AI 对话，支持流式输出' : '2. Chat naturally with streaming AI responses'}</p>
                <p>{zh ? '3. 使用 / 斜杠命令执行系统操作（两种模式通用）' : '3. Use / slash commands for system ops (available in both modes)'}</p>
                <p>{zh ? '4. 检测到导航意图时会自动执行跳转 + AI 回复' : '4. Auto-navigates on nav intent detection + AI response'}</p>
                <div className="mt-3 p-3 bg-black/40 rounded-lg border border-emerald-500/10">
                  <div className="text-[10px] text-emerald-400 font-mono mb-2">{zh ? '支持的 Provider：' : 'Supported Providers:'}</div>
                  <div className="flex flex-wrap gap-1">
                    {['OpenAI', 'Anthropic', 'DeepSeek', '智谱 Z.AI', 'Gemini', 'Groq', 'Ollama'].map(p => (
                      <code key={p} className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400/80 rounded">{p}</code>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-mono text-zinc-500">{zh ? '键盘快捷键' : 'Keyboard Shortcuts'}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { keys: 'Ctrl+M', desc: zh ? '切换模式' : 'Toggle mode' },
                { keys: 'Ctrl+K', desc: zh ? '搜索面板' : 'Search palette' },
                { keys: 'Ctrl+H', desc: zh ? '显/隐 HUD' : 'Toggle HUD' },
                { keys: '/', desc: zh ? '斜杠命令' : 'Slash commands' },
              ].map(s => (
                <div key={s.keys} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[9px] font-mono text-zinc-400">{s.keys}</kbd>
                  <span className="text-[10px] text-zinc-500">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extension Suggestions */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-mono text-pink-400">{zh ? '拓展建议' : 'Extension Suggestions'}</span>
            </div>
            <div className="space-y-2 text-[11px] text-zinc-500">
              <p>• {zh ? '语音模式 (Voice Mode)：集成 Web Speech API 实现语音输入/TTS 输出' : 'Voice Mode: Integrate Web Speech API for voice input/TTS output'}</p>
              <p>• {zh ? '协作模式 (Collab Mode)：多用户共享 Agent 会话，WebSocket 实时同步' : 'Collab Mode: Multi-user shared Agent sessions with WebSocket sync'}</p>
              <p>• {zh ? '自动模式 (Auto Mode)：AI 根据输入内容自动判断最优模式并切换' : 'Auto Mode: AI auto-detects optimal mode based on input content'}</p>
              <p>• {zh ? '工作流模式 (Workflow Mode)：将多个命令串联为自动化工作流' : 'Workflow Mode: Chain multiple commands into automated workflows'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
