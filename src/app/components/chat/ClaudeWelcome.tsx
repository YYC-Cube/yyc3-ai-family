import { Sparkles, Terminal, Activity } from 'lucide-react';
import * as React from 'react';

import { BrandLogo } from '@/app/components/ui/brand-logo';
import { Button } from '@/app/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export function ClaudeWelcome({ onQuickAction }: { onQuickAction: (text: string) => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="relative">
        <BrandLogo size="lg" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-background rounded-full border border-border flex items-center justify-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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
          onClick={() => onQuickAction('Build a React component for a data dashboard')}
        />
        <QuickAction
          icon={Activity}
          label={t('chat.quick_action_2')}
          onClick={() => onQuickAction('Deploy microservice to cluster-alpha')}
        />
        <QuickAction
          icon={Sparkles}
          label={t('chat.quick_action_3')}
          onClick={() => onQuickAction('Scan current project for security vulnerabilities')}
        />
      </div>
    </div>
  );
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
  );
}
