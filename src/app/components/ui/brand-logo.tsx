// ============================================================
// YYC3 AI Family — Unified Brand Logo Component
// Phase: 品牌一体化
//
// 统一品牌标识组件，从 branding-config 读取配置：
//   1. 有上传图片 → 显示图片
//   2. 无上传图片 → 显示内置 gradient SVG + logoText
//
// 所有 logo 展示位统一使用此组件，确保全局一致性。
// ============================================================

import * as React from 'react';

import { loadBranding, type BrandingConfig } from '@/lib/branding-config';
import { cn } from '@/lib/utils';

// ============================================================
// Inline SVG 品牌标志
// 零外部依赖，不会因 figma:asset 导入失败导致崩溃
// ============================================================

export function YYC3Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="YYC3 Logo"
    >
      <rect width="80" height="80" rx="16" fill="url(#yyc3-grad)" />
      <line x1="0" y1="27" x2="80" y2="27" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="0" y1="53" x2="80" y2="53" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="27" y1="0" x2="27" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="53" y1="0" x2="53" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
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
      <rect x="2" y="2" width="76" height="76" rx="14" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" />
      <defs>
        <linearGradient id="yyc3-grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============================================================
// BrandLogo — 统一的品牌标识组件
//
// Props:
//   size: 'sm' | 'md' | 'lg' (默认 'md')
//   showText: 是否在旁边显示应用名称（默认 false）
//   className: 额外样式
//
// 行为：
//   - 自动监听 branding-update 事件实现热更新
//   - 有 logoDataUrl 时显示上传图片
//   - 无 logoDataUrl 时显示 gradient SVG + logoText
// ============================================================

const SIZE_MAP = {
  sm: { container: 'w-8 h-8', svg: 'w-6 h-6', text: 'text-xs' },
  md: { container: 'w-12 h-12', svg: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-24 h-24', svg: 'w-20 h-20', text: 'text-base' },
} as const;

export function BrandLogo({
  size = 'md',
  showText = false,
  branding,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  branding?: BrandingConfig;
  className?: string;
}) {
  const [config, setConfig] = React.useState<BrandingConfig>(() => branding ?? loadBranding());

  React.useEffect(() => {
    if (branding) { setConfig(branding);

      return; }
    const handler = () => setConfig(loadBranding());

    window.addEventListener('yyc3-branding-update', handler);

    return () => window.removeEventListener('yyc3-branding-update', handler);
  }, [branding]);

  const sizeClass = SIZE_MAP[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          sizeClass.container,
          'rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10',
          'border border-white/10 flex items-center justify-center',
          'shadow-[0_0_50px_-10px_rgba(14,165,233,0.3)] overflow-hidden shrink-0',
        )}
      >
        {config.logoDataUrl ? (
          <img src={config.logoDataUrl} alt="logo" className="w-full h-full object-cover" />
        ) : (
          <YYC3Logo className={sizeClass.svg} />
        )}
      </div>
      {showText && (
        <div className="min-w-0">
          <div className={cn('font-mono tracking-wider text-primary glow-text truncate', sizeClass.text)}>
            {config.appName || 'YYC3_DEVOPS'}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">{config.tagline || 'v3.0.1-beta'}</p>
        </div>
      )}
    </div>
  );
}
