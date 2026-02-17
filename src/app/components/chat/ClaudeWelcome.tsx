import * as React from "react";
import { Sparkles, Terminal, Activity } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useTranslation } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Inline SVG brand logo — replaces the previous `figma:asset/bbf3e3fa…` import.
// Rationale: the figma:asset virtual module is session-specific; if the asset
// hash is unavailable the static import fails and cascades up through
// ChatArea → App → total crash. An inline SVG has zero external dependencies.
// ---------------------------------------------------------------------------
function YYC3Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="YYC3 Logo"
    >
      {/* Gem-blue rounded base */}
      <rect width="80" height="80" rx="16" fill="url(#yyc3-grad)" />
      {/* Grid overlay for cyberpunk feel */}
      <line x1="0" y1="27" x2="80" y2="27" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="0" y1="53" x2="80" y2="53" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="27" y1="0" x2="27" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="53" y1="0" x2="53" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      {/* "Y3" monogram */}
      <text
        x="40"
        y="52"
        fontFamily="'JetBrains Mono', 'Fira Code', monospace"
        fontSize="32"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
        letterSpacing="0.05em"
      >
        Y3
      </text>
      {/* Subtle glow ring */}
      <rect
        x="2"
        y="2"
        width="76"
        height="76"
        rx="14"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
        fill="none"
      />
      <defs>
        <linearGradient id="yyc3-grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ClaudeWelcome({ onQuickAction }: { onQuickAction: (text: string) => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
       <div className="relative">
         <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-white/10 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(14,165,233,0.3)] animate-pulse-slow overflow-hidden">
            <YYC3Logo className="w-20 h-20" />
         </div>
         <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-background rounded-full border border-border flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
         </div>
       </div>

       <div className="space-y-2 max-w-md">
         <h2 className="text-2xl font-bold font-mono tracking-tight glow-text">{t('chat.welcome_title')}</h2>
         <p className="text-sm text-muted-foreground font-mono">
           {t('chat.welcome_subtitle')}
         </p>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
          <QuickAction
            icon={Terminal}
            label={t('chat.quick_action_1')}
            onClick={() => onQuickAction("Build a React component for a data dashboard")}
          />
           <QuickAction
            icon={Activity}
            label={t('chat.quick_action_2')}
            onClick={() => onQuickAction("Deploy microservice to cluster-alpha")}
          />
           <QuickAction
            icon={Sparkles}
            label={t('chat.quick_action_3')}
            onClick={() => onQuickAction("Scan current project for security vulnerabilities")}
          />
       </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>, label: string, onClick: () => void }) {
  return (
    <Button
      variant="outline"
      className="h-auto py-4 flex flex-col items-center gap-3 border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1"
      onClick={onClick}
    >
      <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground text-center text-wrap">{label}</span>
    </Button>
  )
}
