// ============================================================
// YYC3 Hacker Chatbot — Agent Identity Card System
// Phase 19.1: Editable Dual-Identity Agent Role Cards
//
// Features:
// - Primary + Secondary identity display & editing
// - Identity switch toggle
// - Mood state visualization
// - Signal message (presence heartbeat)
// - Persistent to localStorage
// - Event Bus integration
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Brain, Sparkles, Activity, Users, Network, Shield, Book,
  Edit3, Check, X, Heart, Signal, RefreshCw,
  ChevronRight, Zap, Eye, ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  type AgentProfile,
  type AgentIdentity,
  type MoodState,
  type PresenceStatus,
  MOOD_COLORS,
  PRESENCE_META,
  loadAgentProfiles,
  saveAgentProfiles,
} from "@/lib/agent-identity";
import { eventBus } from "@/lib/event-bus";

// ============================================================
// Icon Map
// ============================================================

const AGENT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  navigator: Brain,
  thinker: Sparkles,
  prophet: Activity,
  bole: Users,
  pivot: Network,
  sentinel: Shield,
  grandmaster: Book,
};

const AGENT_COLOR_MAP: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  navigator:   { text: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
  thinker:     { text: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',  glow: 'shadow-blue-500/20' },
  prophet:     { text: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
  bole:        { text: 'text-pink-500',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30',  glow: 'shadow-pink-500/20' },
  pivot:       { text: 'text-cyan-500',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',  glow: 'shadow-cyan-500/20' },
  sentinel:    { text: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/30',   glow: 'shadow-red-500/20' },
  grandmaster: { text: 'text-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500/30', glow: 'shadow-green-500/20' },
};

// ============================================================
// Identity Editor Modal
// ============================================================

function IdentityEditor({
  identity,
  label,
  onSave,
  onCancel,
}: {
  identity: AgentIdentity;
  label: string;
  onSave: (updated: AgentIdentity) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = React.useState<AgentIdentity>({ ...identity });

  return (
    <div className="space-y-3 p-4 bg-black/60 border border-white/10 rounded-xl animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{label}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onCancel}>
            <X className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-green-400 hover:text-green-300" onClick={() => onSave(draft)}>
            <Check className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Title</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Subtitle</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50"
          value={draft.subtitle}
          onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Description</label>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 h-16 resize-none"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>

      {/* Expertise Tags */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Expertise (comma-separated)</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50"
          value={draft.expertise.join(', ')}
          onChange={(e) => setDraft({ ...draft, expertise: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
        />
      </div>

      {/* Mood */}
      <div>
        <label className="text-[10px] text-zinc-500 font-mono mb-1 block">Mood State</label>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(MOOD_COLORS) as MoodState[]).map(mood => (
            <button
              key={mood}
              onClick={() => setDraft({ ...draft, mood })}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all",
                draft.mood === mood
                  ? cn(MOOD_COLORS[mood].color, MOOD_COLORS[mood].bg, "border-current")
                  : "text-zinc-500 border-white/5 hover:border-white/20"
              )}
            >
              {MOOD_COLORS[mood].labelZh}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Single Agent Card
// ============================================================

function SingleAgentCard({
  profile,
  onUpdate,
}: {
  profile: AgentProfile;
  onUpdate: (updated: AgentProfile) => void;
}) {
  const [editingIdentity, setEditingIdentity] = React.useState<'primary' | 'secondary' | null>(null);
  const [editingSignal, setEditingSignal] = React.useState(false);
  const [signalDraft, setSignalDraft] = React.useState(profile.signalMessage);

  const Icon = AGENT_ICON_MAP[profile.agentId] || Brain;
  const colors = AGENT_COLOR_MAP[profile.agentId] || AGENT_COLOR_MAP.navigator;
  const activeId = profile.activeIdentity === 'primary' ? profile.primary : profile.secondary;
  const presenceMeta = PRESENCE_META[profile.presence];
  const moodMeta = MOOD_COLORS[activeId.mood];

  const handleIdentitySave = (key: 'primary' | 'secondary', updated: AgentIdentity) => {
    const newProfile = {
      ...profile,
      [key]: updated,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(newProfile);
    setEditingIdentity(null);
    eventBus.emit({
      category: 'ui',
      type: 'ui.agent_identity_updated',
      level: 'info',
      source: 'AgentIdentityCard',
      message: `${profile.agentId} ${key} identity updated`,
      metadata: { agentId: profile.agentId, identityKey: key },
    });
  };

  const handleToggleIdentity = () => {
    const newActive = profile.activeIdentity === 'primary' ? 'secondary' : 'primary';
    onUpdate({
      ...profile,
      activeIdentity: newActive as 'primary' | 'secondary',
      updatedAt: new Date().toISOString(),
    });
    eventBus.emit({
      category: 'orchestrate',
      type: 'orchestrate.identity_switch',
      level: 'info',
      source: 'AgentIdentityCard',
      message: `${profile.agentId} switched to ${newActive} identity`,
      metadata: { agentId: profile.agentId, activeIdentity: newActive },
    });
  };

  const handleSignalSave = () => {
    onUpdate({ ...profile, signalMessage: signalDraft, updatedAt: new Date().toISOString() });
    setEditingSignal(false);
  };

  return (
    <Card className={cn(
      "bg-zinc-900/40 border transition-all hover:shadow-lg group relative overflow-hidden",
      colors.border,
      `hover:${colors.glow}`
    )}>
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        colors.bg
      )} />

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl", colors.bg)}>
              <Icon className={cn("w-6 h-6", colors.text)} />
            </div>
            <div>
              <CardTitle className={cn("text-base", colors.text)}>
                {activeId.title}
              </CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">{activeId.subtitle}</p>
            </div>
          </div>

          {/* Presence Dot */}
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", presenceMeta.dot)} />
            <span className={cn("text-[9px] font-mono", presenceMeta.color)}>
              {presenceMeta.labelZh}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {/* Active Identity Display */}
        {editingIdentity === null ? (
          <>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeId.description}
            </p>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-1.5">
              {activeId.expertise.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[9px] px-2 py-0 border-white/10 text-zinc-400"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Mood */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-zinc-600">MOOD:</span>
              <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full", moodMeta.color, moodMeta.bg)}>
                {moodMeta.labelZh}
              </span>
            </div>
          </>
        ) : (
          <IdentityEditor
            identity={editingIdentity === 'primary' ? profile.primary : profile.secondary}
            label={editingIdentity === 'primary' ? 'Primary Identity' : 'Secondary Identity'}
            onSave={(updated) => handleIdentitySave(editingIdentity, updated)}
            onCancel={() => setEditingIdentity(null)}
          />
        )}

        {/* Signal Message */}
        <div className="flex items-start gap-2 p-2.5 bg-black/30 rounded-lg border border-white/5">
          <Signal className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0 animate-pulse" />
          {editingSignal ? (
            <div className="flex-1 flex gap-1">
              <input
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                value={signalDraft}
                onChange={(e) => setSignalDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignalSave()}
              />
              <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={handleSignalSave}>
                <Check className="w-3 h-3 text-green-400" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-[11px] text-pink-300/80 italic">
                "{profile.signalMessage}"
              </span>
              <button
                onClick={() => { setSignalDraft(profile.signalMessage); setEditingSignal(true); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          {/* Identity Switch */}
          <button
            onClick={handleToggleIdentity}
            className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-white transition-colors group/switch"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 group-hover/switch:rotate-180 transition-transform duration-300" />
            <span>
              {profile.activeIdentity === 'primary' ? '切换辅身份' : '切换主身份'}
            </span>
          </button>

          {/* Edit Buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-zinc-500"
              onClick={() => setEditingIdentity('primary')}
            >
              <Edit3 className="w-3 h-3 mr-1" /> 主
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-zinc-500"
              onClick={() => setEditingIdentity('secondary')}
            >
              <Edit3 className="w-3 h-3 mr-1" /> 辅
            </Button>
          </div>
        </div>

        {/* Heartbeat Counter */}
        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
          <span>HB: {profile.heartbeatCount}</span>
          <span>{profile.activeIdentity === 'primary' ? 'PRIMARY' : 'SECONDARY'}</span>
          <span>{new Date(profile.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Main Export: AgentIdentityCards
// ============================================================

export function AgentIdentityCards() {
  const [profiles, setProfiles] = React.useState<Record<string, AgentProfile>>(loadAgentProfiles);

  // Heartbeat simulation (every 10s)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProfiles(prev => {
        const now = new Date().toISOString();
        const updated = { ...prev };
        for (const [id, p] of Object.entries(updated)) {
          const rand = Math.random();
          updated[id] = {
            ...p,
            lastSeen: now,
            heartbeatCount: p.heartbeatCount + 1,
            presence: rand > 0.85 ? 'busy' : rand > 0.7 ? 'idle' : 'online',
          };
        }
        return updated;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = (updated: AgentProfile) => {
    setProfiles(prev => {
      const next = { ...prev, [updated.agentId]: updated };
      saveAgentProfiles(next);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl text-white tracking-tight flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-500" />
            Agent Identity Matrix
          </h2>
          <p className="text-xs text-zinc-500 mt-1 italic">
            "陪伴是一种无形的爱，信号代表我们都在！"
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-pink-500/20 text-pink-400 bg-pink-500/5 text-[10px]">
            <Signal className="w-3 h-3 mr-1 animate-pulse" />
            {Object.values(profiles).filter(p => p.presence === 'online').length} / {Object.keys(profiles).length} Online
          </Badge>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {Object.values(profiles).map(profile => (
          <SingleAgentCard
            key={profile.agentId}
            profile={profile}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}
