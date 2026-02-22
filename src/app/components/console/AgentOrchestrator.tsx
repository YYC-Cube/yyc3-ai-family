import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Brain, Shield, Sparkles, Activity, Users, Network, Book,
  Play, Loader2, CheckCircle2, AlertCircle, Clock, ArrowRight,
  ChevronRight, Zap, Scale, GitPullRequest, BookOpen,
  AlertTriangle, Send, X, User, BarChart3, Layers,
  Eye, MessageCircle, Trophy, Target, Globe
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { useSystemStore } from "@/lib/store";
import {
  AGENT_CAPABILITIES,
  COLLABORATION_PRESETS,
  createTask,
  loadTasks,
  recommendAgents,
  simulateCollaboration,
  executeRealCollaboration,
  isRealLLMAvailable,
  type CollaborationTask,
  type CollaborationMode,
  type ExecutionMode,
  type AgentRole,
  type AgentExecutionStatus,
  type TimelineEvent,
  type AgentResult,
  type CollaborationPreset,
} from "@/lib/agent-orchestrator";

// --- Icon mapping ---
const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  navigator: Brain,
  thinker: Sparkles,
  prophet: Activity,
  bole: Users,
  pivot: Network,
  sentinel: Shield,
  grandmaster: Book,
};

const AGENT_COLORS: Record<string, string> = {
  navigator: 'text-amber-500',
  thinker: 'text-blue-500',
  prophet: 'text-purple-500',
  bole: 'text-pink-500',
  pivot: 'text-cyan-500',
  sentinel: 'text-red-500',
  grandmaster: 'text-green-500',
};

const AGENT_BG: Record<string, string> = {
  navigator: 'bg-amber-500/10',
  thinker: 'bg-blue-500/10',
  prophet: 'bg-purple-500/10',
  bole: 'bg-pink-500/10',
  pivot: 'bg-cyan-500/10',
  sentinel: 'bg-red-500/10',
  grandmaster: 'bg-green-500/10',
};

const MODE_ICONS: Record<CollaborationMode, React.ComponentType<{ className?: string }>> = {
  pipeline: ArrowRight,
  parallel: Layers,
  debate: Scale,
  ensemble: Trophy,
  delegation: Network,
};

const MODE_LABELS: Record<CollaborationMode, { label: string; labelZh: string; color: string }> = {
  pipeline: { label: 'Pipeline', labelZh: '串行接力', color: 'text-green-400' },
  parallel: { label: 'Parallel', labelZh: '并行汇总', color: 'text-blue-400' },
  debate: { label: 'Debate', labelZh: '辩论仲裁', color: 'text-purple-400' },
  ensemble: { label: 'Ensemble', labelZh: '集成共识', color: 'text-amber-400' },
  delegation: { label: 'Delegation', labelZh: '委托分工', color: 'text-cyan-400' },
};

const STATUS_BADGES: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  idle: { color: 'text-zinc-500', icon: Clock },
  thinking: { color: 'text-blue-400', icon: Brain },
  executing: { color: 'text-amber-400', icon: Zap },
  waiting: { color: 'text-purple-400', icon: Clock },
  done: { color: 'text-green-400', icon: CheckCircle2 },
  error: { color: 'text-red-400', icon: AlertCircle },
};

type ViewMode = 'presets' | 'create' | 'executing' | 'history' | 'detail';

export function AgentOrchestrator() {
  const addLog = useSystemStore((s) => s.addLog);
  const isMobile = useSystemStore((s) => s.isMobile);

  const [view, setView] = React.useState<ViewMode>('presets');
  const [tasks, setTasks] = React.useState<CollaborationTask[]>(loadTasks);

  // Create task state
  const [intent, setIntent] = React.useState('');
  const [selectedMode, setSelectedMode] = React.useState<CollaborationMode>('pipeline');
  const [selectedAgents, setSelectedAgents] = React.useState<Array<{ agentId: string; role: AgentRole }>>([]);
  const [recommendations, setRecommendations] = React.useState<ReturnType<typeof recommendAgents>>([]);
  const [execMode, setExecMode] = React.useState<ExecutionMode>('simulation');
  const [llmAvailable, setLlmAvailable] = React.useState(false);

  // Execution state
  const [activeTask, setActiveTask] = React.useState<CollaborationTask | null>(null);
  const [liveTimeline, setLiveTimeline] = React.useState<TimelineEvent[]>([]);
  const [liveAgentStatus, setLiveAgentStatus] = React.useState<Record<string, AgentExecutionStatus>>({});
  const [liveResults, setLiveResults] = React.useState<AgentResult[]>([]);
  const [isExecuting, setIsExecuting] = React.useState(false);

  // Detail view
  const [detailTask, setDetailTask] = React.useState<CollaborationTask | null>(null);

  const timelineEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTimeline]);

  // Check LLM availability on mount
  React.useEffect(() => {
    setLlmAvailable(isRealLLMAvailable());
  }, []);

  // Auto-recommend agents when intent or mode changes
  React.useEffect(() => {
    if (intent.length > 3) {
      const recs = recommendAgents(intent, selectedMode);
      setRecommendations(recs);
      setSelectedAgents(recs.map(r => ({ agentId: r.agentId, role: r.role })));
    }
  }, [intent, selectedMode]);

  const handleApplyPreset = (preset: CollaborationPreset) => {
    setSelectedMode(preset.mode);
    setSelectedAgents(preset.agents);
    setIntent(preset.template);
    setView('create');
  };

  const handleCreateAndExecute = async () => {
    if (!intent.trim() || selectedAgents.length === 0) return;

    const task = createTask(intent, selectedMode, selectedAgents);
    setActiveTask(task);
    setLiveTimeline(task.timeline);
    setLiveAgentStatus({});
    setLiveResults([]);
    setIsExecuting(true);
    setView('executing');

    addLog('info', 'ORCHESTRATOR', `Started ${selectedMode} collaboration with ${selectedAgents.length} agents`);

    try {
      const executeFn = execMode === 'real-llm' ? executeRealCollaboration : simulateCollaboration;
      const completed = await executeFn(task, {
        onTimelineEvent: (event) => {
          setLiveTimeline(prev => [...prev, event]);
        },
        onAgentStatusChange: (agentId, status) => {
          setLiveAgentStatus(prev => ({ ...prev, [agentId]: status }));
        },
        onResultReceived: (result) => {
          setLiveResults(prev => [...prev, result]);
        },
        onStatusChange: (status) => {
          setActiveTask(prev => prev ? { ...prev, status } : null);
        },
        onToolConfirmation: async (toolName, args, agentId) => {
          return true;
        },
        onComplete: (completedTask) => {
          setActiveTask(completedTask);
          setTasks(loadTasks());
          addLog('success', 'ORCHESTRATOR', `Collaboration completed. Consensus: ${Math.round((completedTask.consensusScore || 0) * 100)}%`);
        },
      });

      setIsExecuting(false);
    } catch (e) {
      setIsExecuting(false);
      addLog('error', 'ORCHESTRATOR', `Execution failed: ${e}`);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => {
      const exists = prev.find(a => a.agentId === agentId);
      if (exists) {
        return prev.filter(a => a.agentId !== agentId);
      } else {
        return [...prev, { agentId, role: prev.length === 0 ? 'lead' : 'contributor' }];
      }
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Network className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl text-white tracking-tight">Multi-Agent Orchestrator</h2>
            <p className="text-xs text-zinc-500 font-mono">Collaborative Workflow v17.2 | Intent-Co-Creation</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {(['presets', 'create', 'history'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase transition-colors",
                view === v ? "bg-primary/20 text-primary border border-primary/30" : "text-zinc-500 hover:text-zinc-300 bg-zinc-900/50 border border-white/5"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: Presets */}
      {view === 'presets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-zinc-400">Collaboration Templates</h3>
            <p className="text-[10px] text-zinc-600 font-mono">Select a preset or create custom collaboration</p>
          </div>
          <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2 xl:grid-cols-3")}>
            {COLLABORATION_PRESETS.map(preset => {
              const ModeIcon = MODE_ICONS[preset.mode];
              return (
                <Card
                  key={preset.id}
                  className="bg-zinc-900/40 border-white/5 cursor-pointer transition-all hover:border-white/20 hover:-translate-y-0.5 group"
                  onClick={() => handleApplyPreset(preset)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-sm flex items-center gap-2", MODE_LABELS[preset.mode].color)}>
                        <ModeIcon className="w-4 h-4" />
                        {preset.nameZh}
                      </CardTitle>
                      <Badge variant="outline" className={cn("text-[9px] font-mono", MODE_LABELS[preset.mode].color)}>
                        {preset.mode}
                      </Badge>
                    </div>
                    <CardDescription className="text-[11px] line-clamp-2">{preset.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1.5 mt-1">
                      {preset.agents.map(a => {
                        const Icon = AGENT_ICONS[a.agentId] || Brain;
                        return (
                          <div
                            key={a.agentId}
                            className={cn("w-7 h-7 rounded-full flex items-center justify-center", AGENT_BG[a.agentId])}
                            title={`${AGENT_CAPABILITIES[a.agentId]?.nameZh} (${a.role})`}
                          >
                            <Icon className={cn("w-3.5 h-3.5", AGENT_COLORS[a.agentId])} />
                          </div>
                        );
                      })}
                      <ArrowRight className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: Create */}
      {view === 'create' && (
        <div className="space-y-4">
          {/* Intent Input */}
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-500 mb-1 block">Task Intent (意图描述)</label>
                <textarea
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="Describe what you want the agents to collaboratively work on..."
                  rows={3}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-lg text-sm p-3 text-white resize-none focus:outline-none focus:border-primary/50 placeholder:text-zinc-600"
                />
              </div>

              {/* Mode Selector */}
              <div>
                <label className="text-xs font-mono text-zinc-500 mb-2 block">Collaboration Mode</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(MODE_LABELS) as [CollaborationMode, typeof MODE_LABELS[CollaborationMode]][]).map(([mode, meta]) => {
                    const ModeIcon = MODE_ICONS[mode];
                    return (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-mono",
                          selectedMode === mode
                            ? "bg-primary/10 border-primary/30 text-white"
                            : "border-white/5 text-zinc-500 hover:border-white/15"
                        )}
                      >
                        <ModeIcon className={cn("w-3.5 h-3.5", meta.color)} />
                        <span>{meta.labelZh}</span>
                        <span className="text-[9px] text-zinc-600">({meta.label})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Agent Selector */}
              <div>
                <label className="text-xs font-mono text-zinc-500 mb-2 block">
                  Agent Team
                  {recommendations.length > 0 && (
                    <span className="ml-2 text-[9px] text-primary">AI recommended</span>
                  )}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.values(AGENT_CAPABILITIES).map(cap => {
                    const Icon = AGENT_ICONS[cap.id] || Brain;
                    const isSelected = selectedAgents.some(a => a.agentId === cap.id);
                    const rec = recommendations.find(r => r.agentId === cap.id);
                    const assignment = selectedAgents.find(a => a.agentId === cap.id);

                    return (
                      <button
                        key={cap.id}
                        onClick={() => toggleAgent(cap.id)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left",
                          isSelected
                            ? "bg-white/5 border-white/20 text-white"
                            : "border-white/5 text-zinc-500 hover:border-white/15"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", AGENT_BG[cap.id])}>
                          <Icon className={cn("w-4 h-4", AGENT_COLORS[cap.id])} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono truncate">{cap.nameZh}</div>
                          <div className="text-[9px] text-zinc-600">
                            {assignment?.role || (rec ? `Score: ${rec.score}` : cap.specialties[0]?.slice(0, 12))}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Execution Mode Toggle (Phase 18.2) */}
              <div>
                <label className="text-xs font-mono text-zinc-500 mb-2 block">
                  Execution Engine
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExecMode('simulation')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-xs font-mono",
                      execMode === 'simulation'
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "border-white/5 text-zinc-500 hover:border-white/15"
                    )}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Simulation
                  </button>
                  <button
                    onClick={() => llmAvailable ? setExecMode('real-llm') : null}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-xs font-mono",
                      !llmAvailable && "opacity-40 cursor-not-allowed",
                      execMode === 'real-llm'
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "border-white/5 text-zinc-500 hover:border-white/15"
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Real LLM
                    {!llmAvailable && <span className="text-[8px] text-zinc-600">(No API Key)</span>}
                  </button>
                </div>
                {execMode === 'real-llm' && (
                  <p className="text-[9px] text-green-400/60 font-mono mt-1.5">
                    Each agent will call real LLM APIs via configured providers. Token costs apply.
                  </p>
                )}
              </div>

              {/* Execute Button */}
              <Button
                className="w-full h-10 text-sm font-mono gap-2"
                onClick={handleCreateAndExecute}
                disabled={!intent.trim() || selectedAgents.length === 0 || isExecuting}
              >
                <Play className="w-4 h-4" />
                Launch {selectedMode} Collaboration ({selectedAgents.length} Agents)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW: Executing */}
      {view === 'executing' && activeTask && (
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-12")}>
          {/* Agent Status Panel */}
          <div className={cn(isMobile ? "" : "col-span-3")}>
            <Card className="bg-black/40 border-white/10">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-xs font-mono text-zinc-400">Agent Status</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {activeTask.agents.map(agent => {
                  const Icon = AGENT_ICONS[agent.agentId] || Brain;
                  const status = liveAgentStatus[agent.agentId] || agent.status;
                  const StatusIcon = STATUS_BADGES[status]?.icon || Clock;
                  const statusColor = STATUS_BADGES[status]?.color || 'text-zinc-500';

                  return (
                    <div key={agent.agentId} className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/3">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", AGENT_BG[agent.agentId])}>
                        <Icon className={cn("w-3.5 h-3.5", AGENT_COLORS[agent.agentId])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-zinc-300 truncate">
                          {AGENT_CAPABILITIES[agent.agentId]?.nameZh}
                        </div>
                        <div className={cn("text-[9px] font-mono flex items-center gap-1", statusColor)}>
                          <StatusIcon className={cn("w-2.5 h-2.5", status === 'thinking' || status === 'executing' ? 'animate-pulse' : '')} />
                          {status}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-mono text-zinc-600">{agent.role}</Badge>
                    </div>
                  );
                })}

                {/* Task Status */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">Status</span>
                    <Badge className={cn(
                      "text-[9px]",
                      activeTask.status === 'completed' ? "bg-green-500/10 text-green-400" :
                      activeTask.status === 'failed' ? "bg-red-500/10 text-red-400" :
                      "bg-amber-500/10 text-amber-400"
                    )}>
                      {activeTask.status}
                    </Badge>
                  </div>
                  {activeTask.consensusScore && (
                    <div className="flex items-center justify-between text-[10px] font-mono mt-1">
                      <span className="text-zinc-500">Consensus</span>
                      <span className="text-green-400">{Math.round(activeTask.consensusScore * 100)}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline + Results */}
          <div className={cn("space-y-4", isMobile ? "" : "col-span-9")}>
            {/* Live Timeline */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Execution Timeline
                  {isExecuting && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[200px]">
                  <div className="p-3 space-y-1">
                    {liveTimeline.map(event => {
                      const Icon = event.agentId ? (AGENT_ICONS[event.agentId] || Brain) : Zap;
                      const color = event.agentId ? (AGENT_COLORS[event.agentId] || 'text-zinc-400') : 
                        event.type === 'task_completed' ? 'text-green-400' :
                        event.type === 'consensus_reached' ? 'text-amber-400' :
                        'text-zinc-400';

                      return (
                        <div key={event.id} className="flex items-start gap-2 text-[11px] font-mono">
                          <span className="text-[9px] text-zinc-700 w-16 shrink-0">
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <Icon className={cn("w-3 h-3 mt-0.5 shrink-0", color)} />
                          <span className="text-zinc-400">{event.message}</span>
                        </div>
                      );
                    })}
                    <div ref={timelineEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Agent Results */}
            {liveResults.length > 0 && (
              <Card className="bg-black/40 border-white/10">
                <CardHeader className="pb-2 border-b border-white/5">
                  <CardTitle className="text-xs font-mono text-zinc-400">Agent Outputs ({liveResults.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px]">
                    <div className="p-3 space-y-3">
                      {liveResults.map((result, i) => {
                        const Icon = AGENT_ICONS[result.agentId] || Brain;
                        const cap = AGENT_CAPABILITIES[result.agentId];
                        return (
                          <div key={i} className="p-3 bg-zinc-900/40 border border-white/5 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className={cn("w-4 h-4", AGENT_COLORS[result.agentId])} />
                                <span className="text-xs font-mono text-zinc-300">{cap?.nameZh || result.agentId}</span>
                                <Badge variant="outline" className="text-[8px] font-mono text-zinc-600">{result.role}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-600">
                                <span>{result.tokensUsed} tokens</span>
                                <span>{result.latencyMs}ms</span>
                                <span className="text-green-400">{Math.round(result.confidence * 100)}%</span>
                              </div>
                            </div>
                            <p className="text-[11px] text-zinc-400 whitespace-pre-wrap">{result.output}</p>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Final Output */}
            {activeTask.finalOutput && (
              <Card className="bg-black/40 border-primary/20">
                <CardHeader className="pb-2 border-b border-white/5">
                  <CardTitle className="text-xs font-mono text-primary flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Final Synthesized Output
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <ScrollArea className="max-h-[400px]">
                    <div className="text-[12px] text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {activeTask.finalOutput}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* VIEW: History */}
      {view === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono text-zinc-500 uppercase">Task History ({tasks.length})</h3>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 font-mono text-xs">
              <Network className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No collaboration tasks yet.</p>
              <p className="mt-1 text-zinc-700">Use presets or create a custom collaboration to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => {
                const ModeIcon = MODE_ICONS[task.mode];
                return (
                  <Card
                    key={task.id}
                    className="bg-zinc-900/40 border-white/5 cursor-pointer hover:border-white/15 transition-colors"
                    onClick={() => { setDetailTask(task); setActiveTask(task); setLiveTimeline(task.timeline); setLiveResults(task.results); setLiveAgentStatus({}); setView('executing'); }}
                  >
                    <CardContent className="p-3 flex items-center gap-4">
                      <ModeIcon className={cn("w-5 h-5 shrink-0", MODE_LABELS[task.mode].color)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-zinc-300 truncate">{task.title}</div>
                        <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-2 mt-0.5">
                          <span>{MODE_LABELS[task.mode].labelZh}</span>
                          <span>|</span>
                          <span>{task.agents.length} agents</span>
                          <span>|</span>
                          <span>{task.totalTokens} tokens</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn(
                          "text-[9px]",
                          task.status === 'completed' ? "bg-green-500/10 text-green-400" :
                          task.status === 'failed' ? "bg-red-500/10 text-red-400" :
                          "bg-zinc-500/10 text-zinc-400"
                        )}>
                          {task.status}
                        </Badge>
                        {task.consensusScore && (
                          <span className="text-[9px] font-mono text-green-400">{Math.round(task.consensusScore * 100)}%</span>
                        )}
                        <span className="text-[9px] text-zinc-700 font-mono">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                        <ChevronRight className="w-3 h-3 text-zinc-600" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: Detail */}
      {view === 'detail' && detailTask && (
        <div className="space-y-4">
          <Button size="sm" variant="ghost" className="text-zinc-400 gap-1" onClick={() => setView('history')}>
            <ArrowRight className="w-3 h-3 rotate-180" /> Back
          </Button>
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-4">
              <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap">
                {detailTask.finalOutput || JSON.stringify(detailTask, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}