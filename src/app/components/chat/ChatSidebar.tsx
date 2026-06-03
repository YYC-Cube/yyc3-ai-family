// ============================================================
// YYC3 AI Family — Chat Session Sidebar
// 富文本方案-03: 多会话管理侧边栏
// ============================================================

import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import type { ChatSession } from '@/lib/chat-types';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSid: string;
  onCreateSession: () => void;
  onSwitchSession: (sid: string) => void;
  onDeleteSession: (sid: string) => void;
  collapsed?: boolean;
}

export function ChatSidebar({
  sessions, currentSid,
  onCreateSession, onSwitchSession, onDeleteSession,
  collapsed,
}: ChatSidebarProps) {
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  if (collapsed) {
    return (
      <div className="w-12 border-r border-border/50 bg-background/60 flex flex-col items-center py-3 gap-2 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCreateSession}>
          <Plus className="w-4 h-4" />
        </Button>
        <div className="flex-1 flex flex-col items-center gap-1.5 overflow-y-auto">
          {sessions.map(s => (
            <button key={s.sid}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono transition-colors',
                s.sid === currentSid
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
              )}
              onClick={() => onSwitchSession(s.sid)}
              title={s.title}>
              {s.title.charAt(0)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-56 border-r border-border/50 bg-background/40 flex flex-col shrink-0">
      <div className="p-3 border-b border-border/30 flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">会话</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCreateSession}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-0.5">
          {sessions.map(s => (
            <div key={s.sid}
              className={cn(
                'group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-[11px]',
                s.sid === currentSid
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
              )}
              onClick={() => onSwitchSession(s.sid)}>
              <MessageSquare className="w-3 h-3 shrink-0 opacity-50" />
              <span className="flex-1 truncate font-mono">{s.title}</span>
              {confirmDelete === s.sid ? (
                <button className="text-red-400 hover:text-red-300 text-[10px] font-mono shrink-0"
                  onClick={e => { e.stopPropagation(); onDeleteSession(s.sid); setConfirmDelete(null); }}>
                  确认
                </button>
              ) : (
                <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 shrink-0"
                  onClick={e => { e.stopPropagation(); setConfirmDelete(s.sid); }}>
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
