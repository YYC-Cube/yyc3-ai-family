// ============================================================
// YYC3 AI Family — Chat Toolbar
// 富文本方案-03: 搜索 / 导出 / 主题切换
// 无侵入式挂载到 ChatArea 头部
// ============================================================

import { FileJson, FileText, Monitor, Moon, Sun } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/app/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import type { ThemeMode } from '@/lib/chat-types';
import { cn } from '@/lib/utils';

interface ChatToolbarProps {
  onExportMd?: () => void;
  onExportJson?: () => void;
  theme?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

export function ChatToolbar({ onExportMd, onExportJson, theme, onThemeChange }: ChatToolbarProps) {
  const [themeOpen, setThemeOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-1">
      {/* 导出按钮组 */}
      {onExportMd && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onExportMd}>
              <FileText className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[10px] font-mono">导出 Markdown</TooltipContent>
        </Tooltip>
      )}
      {onExportJson && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onExportJson}>
              <FileJson className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[10px] font-mono">导出 JSON</TooltipContent>
        </Tooltip>
      )}

      {/* 主题切换 */}
      {onThemeChange && (
        <div className="relative">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setThemeOpen(!themeOpen)}>
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> :
              theme === 'light' ? <Sun className="w-3.5 h-3.5" /> :
                <Monitor className="w-3.5 h-3.5" />}
          </Button>
          {themeOpen && (
            <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-1.5 z-50 flex gap-1">
              {(['system', 'light', 'dark'] as ThemeMode[]).map(m => (
                <button key={m}
                  className={cn(
                    'px-2.5 py-1.5 rounded text-[10px] font-mono transition-colors',
                    theme === m ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                  onClick={() => { onThemeChange(m); setThemeOpen(false); }}>
                  {m === 'system' ? '自动' : m === 'light' ? '浅色' : '暗黑'}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
