import { Send, Paperclip, Globe, Columns, Search, Loader2, Plus, Mic, Brain, Cpu, Sparkles, Zap, ChevronRight, Figma, CheckCircle2, XCircle, Command, FileUp, FolderUp, X, Lightbulb, File, Image, Settings, Github, Compass, MessageSquare } from 'lucide-react';
import * as React from 'react';

import { SearchPalette } from '@/app/components/search/SearchPalette';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useTranslation } from '@/lib/i18n';
import { useSystemStore } from '@/lib/store';
import { PROMPT_TEMPLATES, MAX_FILE_SIZE, MAX_FILES } from '@/lib/types';
import type { FileAttachment, PromptTemplate } from '@/lib/types';
import { cn } from '@/lib/utils';

import { ClaudeWelcome } from './ClaudeWelcome';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  agentName?: string;
  agentRole?: 'architect' | 'coder' | 'auditor' | 'orchestrator';
}

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onOpenArtifact: (code: string, language: string) => void;
  isArtifactsOpen: boolean;
  onToggleArtifacts: () => void;
  onOpenSettings?: (tab?: string) => void;
}

export function ChatArea({
  messages,
  isStreaming,
  onSendMessage,
  onOpenArtifact,
  isArtifactsOpen,
  onToggleArtifacts,
  onOpenSettings,
}: ChatAreaProps) {
  const { t } = useTranslation();
  const chatMode = useSystemStore(s => s.chatMode);
  const toggleChatMode = useSystemStore(s => s.toggleChatMode);
  const [inputValue, setInputValue] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Quick Selector State
  const [isQuickSelectorOpen, setIsQuickSelectorOpen] = React.useState(false);
  const quickSelectorRef = React.useRef<HTMLDivElement>(null);

  // Prompt Templates State
  const [isPromptMenuOpen, setIsPromptMenuOpen] = React.useState(false);
  const promptMenuRef = React.useRef<HTMLDivElement>(null);

  // File Upload State
  const [attachments, setAttachments] = React.useState<FileAttachment[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  // Voice State
  const [isListening, setIsListening] = React.useState(false);
  const voiceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const [voiceSupported, setVoiceSupported] = React.useState(false);

  // Check Web Speech API support
  React.useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    setVoiceSupported(!!SR);
  }, []);

  // Close Quick Selector on outside click
  React.useEffect(() => {
    if (!isQuickSelectorOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (quickSelectorRef.current && !quickSelectorRef.current.contains(e.target as Node)) {
        setIsQuickSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, [isQuickSelectorOpen]);

  // Close Prompt Menu on outside click
  React.useEffect(() => {
    if (!isPromptMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (promptMenuRef.current && !promptMenuRef.current.contains(e.target as Node)) {
        setIsPromptMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, [isPromptMenuOpen]);

  // File handling
  const processFiles = React.useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = MAX_FILES - attachments.length;
    const filesToAdd = fileArray.slice(0, remaining);

    filesToAdd.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File ${file.name} exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);

        return;
      }

      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      // Read content for text files
      if (file.type.startsWith('text/') || file.name.match(/\.(ts|tsx|js|jsx|py|go|rs|java|cpp|c|h|css|html|sql|sh|bash|md|json|yaml|yml|toml|xml|csv|env|gitignore)$/i)) {
        const reader = new FileReader();

        reader.onload = e => {
          attachment.content = e.target?.result as string;
          setAttachments(prev => [...prev.filter(a => a.id !== attachment.id), attachment]);
        };
        reader.readAsText(file);
      }

      // Read preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onload = e => {
          attachment.dataUrl = e.target?.result as string;
          setAttachments(prev => [...prev.filter(a => a.id !== attachment.id), attachment]);
        };
        reader.readAsDataURL(file);
      }

      setAttachments(prev => [...prev, attachment]);
    });
  }, [attachments.length]);

  // Drag and drop
  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Prompt template selection
  const handlePromptSelect = (template: PromptTemplate) => {
    setInputValue(prev => prev + template.prompt);
    setIsPromptMenuOpen(false);
  };

  // Voice listening — real Web Speech API integration
  const handleVoiceToggle = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isListening) {
      // Stop listening
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (voiceTimerRef.current) {
        clearTimeout(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }

      return;
    }

    if (SR) {
      const recognition = new SR();

      recognition.lang = 'zh-CN'; // supports Chinese + English
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setInputValue(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        recognitionRef.current = null;
        // Fallback for permission denied or not allowed
        if (event.error === 'not-allowed') {
          setInputValue(prev => prev + (prev ? ' ' : '') + '[Mic permission denied]');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);

      // Auto-stop after 30 seconds to prevent runaway
      voiceTimerRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
        setIsListening(false);
        voiceTimerRef.current = null;
      }, 30000);
    } else {
      // Fallback: no Web Speech API
      setIsListening(true);
      voiceTimerRef.current = setTimeout(() => {
        setIsListening(false);
        voiceTimerRef.current = null;
        setInputValue(prev => prev + (prev ? ' ' : '') + '[Speech API not supported in this browser]');
      }, 2000);
    }
  };

  // Cleanup voice timer on unmount
  React.useEffect(() => {
    return () => {
      if (voiceTimerRef.current) {
        clearTimeout(voiceTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');

      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isStreaming]);

  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsQuickSelectorOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsQuickSelectorOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    // Build message with attachments info
    let messageText = inputValue;

    if (attachments.length > 0) {
      const fileList = attachments.map(a => `[${a.name} (${formatFileSize(a.size)})]`).join(', ');

      messageText = messageText ? `${messageText}\n\nAttached files: ${fileList}` : `Attached files: ${fileList}`;
      // Include text content from files
      attachments.forEach(a => {
        if (a.content) {
          messageText += `\n\n--- ${a.name} ---\n${a.content.slice(0, 5000)}${a.content.length > 5000 ? '\n... (truncated)' : ''}`;
        }
      });
    }
    onSendMessage(messageText);
    setInputValue('');
    setAttachments([]);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Allow all symbols - do not prevent any character input
  };

  return (
    <div className="h-full flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

      {/* Top Bar */}
      <div className="h-12 md:h-14 border-b border-border flex items-center justify-between px-3 md:px-6 bg-background/20 backdrop-blur-sm z-20 relative shrink-0">
        <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-lg relative">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={t('chat.search_placeholder')}
              className="pl-9 h-9 bg-background/40 border-border/50 text-xs rounded-lg focus-visible:ring-primary/30 transition-all focus:bg-background/60"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (e.target.value) setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery) setIsSearchOpen(true);
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            {/* Search Dropdown / Palette */}
            <SearchPalette
              query={searchQuery}
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onSelect={result => {
                console.log('Navigating to', result);
                setIsSearchOpen(false);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Chat Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-1.5 text-xs font-mono transition-all hover:scale-[1.02] active:scale-[0.98] px-2.5',
                 chatMode === 'ai'
                   ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                   : 'text-amber-400 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
            )}
            onClick={toggleChatMode}
            title={`${chatMode === 'ai' ? t('chat.mode_ai_desc') : t('chat.mode_navigate_desc')} (Ctrl+M)`}
          >
            {chatMode === 'ai' ? (
                 <MessageSquare className="w-3.5 h-3.5" />
               ) : (
                 <Compass className="w-3.5 h-3.5" />
               )}
            <span className="hidden sm:inline">{chatMode === 'ai' ? t('chat.mode_ai') : t('chat.mode_navigate')}</span>
          </Button>

          <div className="w-px h-5 bg-border/50 mx-0.5" />

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-2 text-xs font-mono transition-all hover:scale-[1.02] active:scale-[0.98]',
                 isArtifactsOpen
                   ? 'text-[#0EA5E9] bg-[#0EA5E9]/10 shadow-[0_0_10px_rgba(14,165,233,0.15)]'
                   : 'text-muted-foreground hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/5',
            )}
            onClick={onToggleArtifacts}
          >
            <Columns className="w-4 h-4" />
            <span className="hidden sm:inline">{t('chat.artifacts')}</span>
          </Button>

          <div className="w-px h-5 bg-border/50 mx-0.5" />

          {onOpenSettings && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-primary hover:bg-primary/10 transition-all rounded-full"
                onClick={() => onOpenSettings('gitops')}
                title={t('sidebar.gitops')}
              >
                <Github className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-primary hover:bg-primary/10 transition-all rounded-full"
                onClick={() => onOpenSettings('general')}
                title={t('sidebar.settings')}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 relative min-h-0 overflow-hidden" onClick={() => setIsSearchOpen(false)}>
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="flex flex-col pb-4">
            {messages.length === 0 ? (
                <div className="h-full min-h-[calc(100vh-280px)] flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
                  <ClaudeWelcome onQuickAction={onSendMessage} />
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-4 md:p-8 max-w-4xl mx-auto w-full">
                  {messages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      role={msg.role}
                      content={msg.content}
                      timestamp={msg.timestamp}
                      onOpenArtifact={onOpenArtifact}
                      agentName={msg.agentName}
                      agentRole={msg.agentRole}
                    />
                  ))}
                  {isStreaming && (
                    <div className="pl-16 flex items-center gap-2 text-primary/50 text-xs font-mono animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-primary/50" />
                      <span className="tracking-widest">{t('chat.busy')}...</span>
                    </div>
                  )}
                </div>
              )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div
        className="shrink-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-20"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center z-30 pointer-events-none">
            <div className="text-primary font-mono text-sm flex items-center gap-2">
              <FileUp className="w-5 h-5" />
              Drop files here to attach
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto relative rounded-xl border border-border bg-muted/10 backdrop-blur-md shadow-2xl shadow-black/50 focus-within:ring-1 focus-within:ring-primary/30 transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(14,165,233,0.1)]">
          {/* File Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 pb-0">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/20 rounded-lg text-xs group">
                  {att.type.startsWith('image/') ? (
                    att.dataUrl ? (
                      <img src={att.dataUrl} alt={att.name} className="w-6 h-6 rounded object-cover" />
                    ) : (
                      <Image className="w-3.5 h-3.5 text-primary" />
                    )
                  ) : (
                    <File className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span className="text-zinc-300 max-w-[120px] truncate">{att.name}</span>
                  <span className="text-zinc-600 text-[10px]">{formatFileSize(att.size)}</span>
                  <button onClick={() => removeAttachment(att.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDownInput}
            placeholder={chatMode === 'ai' ? t('chat.placeholder_ai') : t('chat.placeholder')}
            className="w-full bg-transparent border-0 p-4 min-h-[60px] max-h-[200px] resize-none focus:outline-none text-sm font-sans placeholder:text-muted-foreground/40 text-foreground"
          />

          <div className="flex items-center justify-between p-2 pl-4 border-t border-white/5">
            <div className="flex items-center gap-1">
              {/* File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; }}
                accept="*/*"
              />
              <input
                ref={folderInputRef}
                type="file"
                multiple
                className="hidden"
                // @ts-expect-error - webkitdirectory is not in standard types
                webkitdirectory=""
                onChange={e => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors hover:scale-110"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors hover:scale-110"
                onClick={() => folderInputRef.current?.click()}
                title="Upload folder"
              >
                <FolderUp className="w-3.5 h-3.5" />
              </Button>

              {/* Prompt Templates */}
              <div className="relative" ref={promptMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 rounded-full transition-all hover:scale-110',
                      isPromptMenuOpen
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10',
                  )}
                  onClick={() => setIsPromptMenuOpen(!isPromptMenuOpen)}
                  title="Prompt templates"
                >
                  <Lightbulb className="w-4 h-4" />
                </Button>
                {isPromptMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-[260px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/50">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Prompt Templates</span>
                    </div>
                    <ScrollArea className="max-h-[300px]">
                      <div className="p-1.5">
                        {PROMPT_TEMPLATES.map(tpl => (
                          <button
                            key={tpl.id}
                            onClick={() => handlePromptSelect(tpl)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors group text-left"
                          >
                            <span className="text-base shrink-0">{tpl.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className={cn('text-xs group-hover:text-white truncate', tpl.color)}>{tpl.label}</div>
                              <div className="text-[9px] text-zinc-600 truncate">{tpl.labelEn}</div>
                            </div>
                            <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Quick Selector: Model & MCP */}
              <div className="relative" ref={quickSelectorRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 rounded-full transition-all hover:scale-110',
                      isQuickSelectorOpen
                        ? 'text-primary bg-primary/10 rotate-45'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10',
                  )}
                  onClick={() => setIsQuickSelectorOpen(!isQuickSelectorOpen)}
                >
                  <Plus className="w-4 h-4 transition-transform" />
                </Button>
                {isQuickSelectorOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/50">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Quick Select</span>
                    </div>
                    {/* Models Section */}
                    <div className="p-2">
                      <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest px-2 mb-1">Models</div>
                      {[
                        { id: 'claude-4', name: 'Claude 4 Sonnet', desc: 'Latest reasoning model', icon: Brain, color: 'text-amber-400' },
                        { id: 'gpt-4o', name: 'GPT-4o', desc: 'OpenAI multimodal', icon: Sparkles, color: 'text-green-400' },
                        { id: 'deepseek-r1', name: 'DeepSeek-R1', desc: 'Open-source reasoning', icon: Cpu, color: 'text-blue-400' },
                        { id: 'glm-4', name: 'GLM-4 (智谱)', desc: 'Zhipu AI large model', icon: Zap, color: 'text-emerald-400' },
                        { id: 'gemini-2', name: 'Gemini 2.5 Pro', desc: 'Google latest', icon: Zap, color: 'text-purple-400' },
                        { id: 'ollama', name: 'Ollama (本地)', desc: 'Local LLM inference', icon: Cpu, color: 'text-white' },
                      ].map(model => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setInputValue(prev => prev + `@${model.id} `);
                            setIsQuickSelectorOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group text-left"
                        >
                          <div className={cn('w-6 h-6 rounded flex items-center justify-center bg-zinc-800/60 border border-white/5 shrink-0', model.color)}>
                            <model.icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-zinc-200 group-hover:text-white truncate">{model.name}</div>
                            <div className="text-[9px] text-zinc-600 truncate">{model.desc}</div>
                          </div>
                          <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                    {/* MCP Section */}
                    <div className="p-2 border-t border-white/5">
                      <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest px-2 mb-1">MCP Tools</div>
                      {[
                        { id: 'mcp-figma', name: 'Figma MCP', desc: 'Design-to-code pipeline', color: 'text-pink-400', validated: true },
                        { id: 'mcp-github', name: 'GitHub MCP', desc: 'Code & repo access', color: 'text-zinc-300', validated: true },
                        { id: 'mcp-filesystem', name: 'Filesystem MCP', desc: 'Local file operations', color: 'text-cyan-400', validated: true },
                        { id: 'mcp-postgres', name: 'PostgreSQL MCP', desc: 'Database queries', color: 'text-blue-400', validated: true },
                        { id: 'mcp-browser', name: 'Browser MCP', desc: 'Web automation', color: 'text-pink-400', validated: false },
                        { id: 'mcp-docker', name: 'Docker MCP', desc: 'Container orchestration', color: 'text-sky-400', validated: true },
                      ].map(mcp => (
                        <button
                          key={mcp.id}
                          onClick={() => {
                            setInputValue(prev => prev + `/${mcp.id} `);
                            setIsQuickSelectorOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group text-left"
                        >
                          <div className={cn('w-6 h-6 rounded flex items-center justify-center bg-zinc-800/60 border border-white/5 shrink-0 text-[8px] font-mono', mcp.color)}>
                            {mcp.id === 'mcp-figma' ? <Figma className="w-3.5 h-3.5" /> : 'MC'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-zinc-200 group-hover:text-white truncate flex items-center gap-1.5">
                              {mcp.name}
                              {mcp.validated ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-zinc-600 shrink-0" />
                                )}
                            </div>
                            <div className="text-[9px] text-zinc-600 truncate">{mcp.desc}</div>
                          </div>
                          <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                    {/* Keyboard Hints */}
                    <div className="px-3 py-2 border-t border-white/5 bg-zinc-900/30 flex items-center justify-between text-[9px] text-zinc-600 font-mono">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[8px]">↑↓</kbd> navigate</span>
                        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[8px]">↵</kbd> select</span>
                        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[8px]">Esc</kbd> close</span>
                      </div>
                      <span className="flex items-center gap-1"><Command className="w-2.5 h-2.5" /><kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[8px]">J</kbd></span>
                    </div>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full text-xs font-normal transition-colors hover:scale-105">
                <Globe className="w-3 h-3" />
                <span className="hidden sm:inline">{t('chat.web_search')}</span>
              </Button>
              {/* Voice Input */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={handleVoiceToggle}
                  size="icon"
                  title={voiceSupported ? (isListening ? 'Stop listening' : 'Start voice input (Web Speech API)') : 'Speech API not supported'}
                  className={cn(
                    'h-8 w-8 rounded-full transition-all hover:scale-110',
                      isListening
                        ? 'text-red-400 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10',
                  )}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                {isListening && (
                  <>
                    {/* Pulsing rings animation */}
                    <div className="absolute inset-0 rounded-full border border-red-500/40 animate-ping pointer-events-none" />
                    <div className="absolute -inset-1 rounded-full border border-red-500/20 animate-pulse pointer-events-none" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={(!inputValue.trim() && attachments.length === 0) || isStreaming}
              size="sm"
              className={cn(
                'rounded-lg px-4 gap-2 transition-all duration-300 font-mono text-xs font-bold hover:scale-105 active:scale-95',
                  isStreaming ? 'bg-muted cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:shadow-[0_0_25px_rgba(14,165,233,0.6)]',
              )}
            >
              {isStreaming ? (
                  <>
                    <span>{t('chat.busy')}</span>
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </>
                ) : (
                  <>
                    <span>{t('chat.execute')}</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
            </Button>
          </div>
        </div>
        <div className="flex justify-center mt-3 gap-4 opacity-50">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>{t('chat.system_ready')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <span className="text-primary">{t('chat.latency')}:</span> 24ms
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}