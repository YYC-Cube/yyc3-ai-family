// ============================================================
// YYC3 AI Family — Enhanced Message Bubble
// 富文本方案-02: 折叠/引用/重新生成 + 现有完整功能
// ============================================================

import {
  User, Sparkles, Copy, Check, TerminalSquare, Layout, ShieldCheck,
  ChevronDown, ChevronUp, Quote, RefreshCw,
} from 'lucide-react';
import * as React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Button } from '@/app/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  onOpenArtifact?: (code: string, language: string) => void;
  agentName?: string;
  agentRole?: 'architect' | 'coder' | 'auditor' | 'orchestrator';
  /** 是否已折叠（长消息/代码块） */
  folded?: boolean;
  /** 切换折叠 */
  onToggleFold?: () => void;
  /** 重新生成（仅 AI 消息） */
  onRegenerate?: () => void;
  /** 引用追问 */
  onQuote?: () => void;
}

export function MessageBubble({
  role, content, timestamp, onOpenArtifact,
  agentName, agentRole,
  folded, onToggleFold, onRegenerate, onQuote,
}: MessageBubbleProps) {
  const { t } = useTranslation();
  const isUser = role === 'user';
  const hasLongContent = content.length > 600 || content.includes('```');

  const parts = content.split(/(```[\s\S]*?```)/g);

  const getAgentConfig = () => {
    switch (agentRole) {
      case 'architect':
        return { icon: Layout, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50', shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.2)]', label: t('agent.architect') };
      case 'coder':
        return { icon: TerminalSquare, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.2)]', label: t('agent.coder') };
      case 'auditor':
        return { icon: ShieldCheck, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50', shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.2)]', label: t('agent.auditor') };
      default:
        return { icon: Sparkles, color: 'text-green-400', bg: 'bg-primary/20', border: 'border-primary/50', shadow: 'shadow-[0_0_10px_rgba(14,165,233,0.2)]', label: t('agent.orchestrator') };
    }
  };

  const agentConfig = getAgentConfig();
  const AgentIcon = agentConfig.icon;
  const userLabel = t('agent.user');

  const displayContent = folded && hasLongContent
    ? content.slice(0, 300) + '\n\n...'
    : content;
  const displayParts = displayContent.split(/(```[\s\S]*?```)/g);

  return (
    <div className={cn(
      'flex gap-4 p-6 group transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 hover:bg-muted/5',
      isUser ? 'flex-row-reverse' : 'bg-muted/10 border border-transparent hover:border-border/30 rounded-lg hover:shadow-lg hover:-translate-y-0.5',
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center border shadow-sm mt-1 transition-transform group-hover:scale-105',
        isUser ? 'bg-slate-700/50 border-white/20 text-white shadow-none' : cn(agentConfig.bg, agentConfig.border, agentConfig.color, agentConfig.shadow),
      )}>
        {isUser ? <User className="w-4 h-4" /> : <AgentIcon className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 space-y-2 min-w-0 overflow-hidden', isUser ? 'text-right' : 'text-left')}>
        <div className="flex items-center gap-2 mb-1 justify-between">
          <div className={cn('flex items-center gap-2', isUser && 'flex-row-reverse ml-auto')}>
            <span className={cn('text-xs font-bold font-mono', isUser ? 'opacity-50' : agentConfig.color)}>
              {isUser ? userLabel : (agentName || 'yyc3_core')}
            </span>
            {!isUser && agentRole && (
              <span className={cn('text-[8px] px-1.5 py-0.5 rounded border font-mono tracking-wider', agentConfig.bg, agentConfig.border, agentConfig.color)}>
                {agentConfig.label}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">{timestamp}</span>
        </div>

        <div className={cn('text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90', isUser ? 'text-right' : 'text-left')}>
          {displayParts.map((part, index) => {
            if (part.startsWith('```')) {
              const codeContent = part.replace(/```[a-z]*\n?/, '').replace(/```$/, '');
              const language = part.match(/```([a-z]*)/)?.[1] || 'text';
              return (
                <div key={index} className="my-4 rounded-md overflow-hidden border border-border bg-[#0d0d0d] text-left shadow-lg group-hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] border-b border-white/5">
                    <span className="text-xs font-mono text-muted-foreground">{language}</span>
                    <div className="flex items-center gap-1">
                      {onOpenArtifact && (
                        <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px] text-primary hover:text-primary hover:bg-primary/10 font-mono"
                          onClick={() => onOpenArtifact(codeContent, language)}>
                          <TerminalSquare className="w-3 h-3" />OPEN_ARTIFACT
                        </Button>
                      )}
                      <CopyButton text={codeContent} />
                    </div>
                  </div>
                  <SyntaxHighlighter language={language} style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                    wrapLines={true} showLineNumbers={true}
                    lineNumberStyle={{ minWidth: '2.5em', paddingRight: '1em', color: '#555', textAlign: 'right' }}>
                    {codeContent}
                  </SyntaxHighlighter>
                </div>
              );
            }
            const inlineParts = part.split(/(`[^`]+`)/g);
            return (
              <span key={index}>
                {inlineParts.map((subPart, i) => {
                  if (subPart.startsWith('`') && subPart.endsWith('`')) {
                    return <code key={i} className="bg-muted/50 text-primary px-1.5 py-0.5 rounded text-xs font-mono border border-border/50 mx-0.5">{subPart.slice(1, -1)}</code>;
                  }
                  return subPart;
                })}
              </span>
            );
          })}
        </div>

        {/* 操作栏: 折叠/引用/重新生成 */}
        <div className={cn('flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity', isUser && 'flex-row-reverse')}>
          {!isUser && hasLongContent && onToggleFold && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={onToggleFold}>
              {folded ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronUp className="w-3 h-3 mr-1" />}
              {folded ? t('chat.expand_all') || '展开' : t('chat.collapse') || '折叠'}
            </Button>
          )}
          {!isUser && onRegenerate && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={onRegenerate}>
              <RefreshCw className="w-3 h-3 mr-1" />{t('chat.regenerate') || '重试'}
            </Button>
          )}
          {!isUser && onQuote && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={onQuote}>
              <Quote className="w-3 h-3 mr-1" />{t('chat.quote') || '引用'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
}
