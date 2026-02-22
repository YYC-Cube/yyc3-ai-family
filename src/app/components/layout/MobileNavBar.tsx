import * as React from "react";
import { cn } from "@/lib/utils";
import { useSystemStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import type { ViewMode } from "@/lib/types";
import {
  Terminal, TerminalSquare, Activity, FolderOpen, Settings,
  MessageSquare, Compass, Brain, ChevronUp, ChevronDown,
  Package, Globe, BookOpen, Bookmark, MoreHorizontal, X,
  Cpu, Shield, Network, Database, Radio, Wrench, HardDrive,
  Monitor, FileText, Zap, ArrowLeftRight, Layers
} from "lucide-react";

// ============================================================
// MobileNavBar — Bottom Navigation + Swipe Gesture Support
// Phase 45: Mobile-friendly navigation with:
//   - Bottom tab bar with 5 primary actions
//   - Swipe up to reveal more modules
//   - Touch-optimized hit targets (min 44px)
//   - Mode indicator with tap-to-switch
//   - Haptic-like visual feedback
// ============================================================

interface MobileNavBarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function MobileNavBar({ activeView, onViewChange }: MobileNavBarProps) {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const chatMode = useSystemStore((s) => s.chatMode);
  const toggleChatMode = useSystemStore((s) => s.toggleChatMode);
  const consoleTab = useSystemStore((s) => s.consoleTab);
  const navigateToConsoleTab = useSystemStore((s) => s.navigateToConsoleTab);
  const openSettings = useSystemStore((s) => s.openSettings);

  const [moreOpen, setMoreOpen] = React.useState(false);

  // Swipe detection
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const moreSheetRef = React.useRef<HTMLDivElement>(null);

  // Handle touch start/end for swipe gestures on the main content
  React.useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;
      touchStartRef.current = null;

      // Only consider horizontal swipes that are fast enough and not too vertical
      if (elapsed > 400 || Math.abs(deltaY) > Math.abs(deltaX) * 0.8) return;
      if (Math.abs(deltaX) < 60) return;

      const views: ViewMode[] = ['terminal', 'console', 'monitor', 'projects', 'services'];
      const currentIdx = views.indexOf(activeView);
      if (currentIdx === -1) return;

      if (deltaX < 0 && currentIdx < views.length - 1) {
        // Swipe left → next view
        onViewChange(views[currentIdx + 1]);
      } else if (deltaX > 0 && currentIdx > 0) {
        // Swipe right → prev view
        onViewChange(views[currentIdx - 1]);
      }
    };

    // Attach to document body for global swipe detection
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeView, onViewChange]);

  // Close more panel on outside tap
  React.useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: Event) => {
      if (moreSheetRef.current && !moreSheetRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    setTimeout(() => document.addEventListener('touchstart', handler, { passive: true }), 100);
    return () => document.removeEventListener('touchstart', handler);
  }, [moreOpen]);

  // Primary nav items
  const primaryItems: { id: ViewMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { id: 'terminal', icon: Terminal, label: zh ? '终端' : 'Chat' },
    { id: 'console', icon: TerminalSquare, label: zh ? '控制台' : 'Console' },
    { id: 'monitor', icon: Activity, label: zh ? '监控' : 'Monitor' },
    { id: 'projects', icon: FolderOpen, label: zh ? '项目' : 'Projects' },
  ];

  // Console quick-access modules
  const consoleModules = [
    { id: 'dashboard', icon: Monitor, label: zh ? '总控台' : 'Dashboard', color: 'text-sky-400' },
    { id: 'ai', icon: Brain, label: zh ? 'AI 中心' : 'AI Core', color: 'text-amber-400' },
    { id: 'devops', icon: Terminal, label: 'DevOps', color: 'text-emerald-400' },
    { id: 'hardware_monitor', icon: Cpu, label: zh ? '硬件' : 'Hardware', color: 'text-orange-400' },
    { id: 'security_audit', icon: Shield, label: zh ? '安全' : 'Security', color: 'text-red-400' },
    { id: 'mcp', icon: Wrench, label: 'MCP', color: 'text-pink-400' },
    { id: 'persist', icon: HardDrive, label: zh ? '持久化' : 'Persist', color: 'text-violet-400' },
    { id: 'infra_health', icon: Activity, label: zh ? '基础设施' : 'Infra', color: 'text-emerald-400' },
    { id: 'docker', icon: Database, label: 'Docker', color: 'text-sky-400' },
    { id: 'ops_script', icon: FileText, label: zh ? '脚本' : 'Scripts', color: 'text-amber-400' },
    { id: 'mode_control', icon: ArrowLeftRight, label: zh ? '模式' : 'Modes', color: 'text-pink-400' },
    { id: 'operation_manual', icon: BookOpen, label: zh ? '手册' : 'Manual', color: 'text-cyan-400' },
    { id: 'nine_layer_architecture', icon: Layers, label: zh ? '九层' : '9-Layer', color: 'text-indigo-400' },
    { id: 'telemetry_agent_manager', icon: Radio, label: zh ? '遥测' : 'Telemetry', color: 'text-pink-400' },
  ];

  const moreViews = [
    { id: 'artifacts' as ViewMode, icon: Package, label: zh ? '产物' : 'Artifacts' },
    { id: 'services' as ViewMode, icon: Globe, label: zh ? '服务' : 'Services' },
    { id: 'knowledge' as ViewMode, icon: BookOpen, label: zh ? '知识库' : 'Knowledge' },
    { id: 'bookmarks' as ViewMode, icon: Bookmark, label: zh ? '收藏' : 'Bookmarks' },
  ];

  return (
    <>
      {/* More Sheet (slide up) */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div
            ref={moreSheetRef}
            className="relative bg-zinc-950 border-t border-white/10 rounded-t-2xl max-h-[70vh] overflow-auto animate-in slide-in-from-bottom duration-300 pb-safe"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>

            {/* Mode Switcher */}
            <div className="px-4 pb-3">
              <button
                onClick={() => { toggleChatMode(); }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  {chatMode === 'ai' ? (
                    <Brain className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Compass className="w-5 h-5 text-amber-400" />
                  )}
                  <div>
                    <div className={cn("text-xs font-mono", chatMode === 'ai' ? "text-emerald-400" : "text-amber-400")}>
                      {chatMode === 'ai' ? (zh ? 'AI 对话模式' : 'AI Chat Mode') : (zh ? '导航模式' : 'Navigate Mode')}
                    </div>
                    <div className="text-[10px] text-zinc-600">{zh ? '点击切换' : 'Tap to switch'}</div>
                  </div>
                </div>
                <ArrowLeftRight className="w-4 h-4 text-zinc-600" />
              </button>
            </div>

            {/* More Views */}
            <div className="px-4 pb-3">
              <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2 px-1">
                {zh ? '视图' : 'VIEWS'}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {moreViews.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { onViewChange(v.id); setMoreOpen(false); }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all min-h-[60px]",
                      activeView === v.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-zinc-900/50 text-zinc-500 border border-white/5 active:bg-zinc-800"
                    )}
                  >
                    <v.icon className="w-5 h-5" />
                    <span className="text-[10px] font-mono">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Console Modules */}
            <div className="px-4 pb-3">
              <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2 px-1">
                {zh ? '控制台模块' : 'CONSOLE MODULES'}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {consoleModules.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { React.startTransition(() => { navigateToConsoleTab(m.id); }); setMoreOpen(false); }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all min-h-[60px]",
                      activeView === 'console' && consoleTab === m.id
                        ? "bg-white/5 text-white border border-white/10"
                        : "bg-zinc-900/50 text-zinc-500 border border-white/5 active:bg-zinc-800"
                    )}
                  >
                    <m.icon className={cn("w-5 h-5", m.color)} />
                    <span className="text-[10px] font-mono">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="px-4 pb-6">
              <button
                onClick={() => { openSettings('general'); setMoreOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-white/5 active:bg-zinc-800 transition-colors"
              >
                <Settings className="w-5 h-5 text-zinc-500" />
                <span className="text-xs text-zinc-400">{zh ? '系统设置' : 'Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around h-14">
          {primaryItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-lg transition-all active:scale-95",
                  isActive ? "text-primary" : "text-zinc-600"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_rgba(14,165,233,0.5)]")} />
                <span className={cn("text-[9px] font-mono", isActive && "text-primary")}>{item.label}</span>
                {isActive && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-lg transition-all active:scale-95",
              moreOpen ? "text-primary" : "text-zinc-600"
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[9px] font-mono">{zh ? '更多' : 'More'}</span>
          </button>
        </div>
      </div>
    </>
  );
}