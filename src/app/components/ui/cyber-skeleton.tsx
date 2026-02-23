import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

// ============================================================
// CyberSkeleton — Cyberpunk-style loading skeleton
// Replaces plain spinners with glitch-line shimmer animations
// for lazy-loaded console panels and heavy views.
//
// Variants:
//   spinner — default, centered icon + label
//   card    — header + 4-card grid + content area
//   chart   — toolbar + bar-chart placeholder (heights memoized)
//   table   — header row + 6 data rows (widths memoized)
//   pulse   — compact pulsing dots for modal / inline loading
// ============================================================

interface CyberSkeletonProps {
  /** Loading label shown below spinner */
  label?: string;
  /** Accent color class (e.g. "text-primary", "text-amber-500") */
  accentColor?: string;
  /** Minimum height for the skeleton container */
  minHeight?: string;
  /** Show structural skeleton blocks (card layout) */
  variant?: 'spinner' | 'card' | 'chart' | 'table' | 'pulse';
}

function ShimmerBar({ className, delay = 0, style }: { className?: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        'rounded bg-white/[0.03] overflow-hidden relative',
        className,
      )}
      style={style}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
          animationDelay: `${delay}ms`,
        }}
      />
    </div>
  );
}

// --- Pre-compute random seeds so heights/widths are stable across re-renders ---
function useStableRandoms(count: number, min: number, range: number): number[] {
  return React.useMemo(() => {
    return Array.from({ length: count }, () => min + Math.random() * range);
  }, [count, min, range]);
}

export function CyberSkeleton({
  label = 'LOADING_MODULE...',
  accentColor = 'text-primary',
  minHeight = 'h-64',
  variant = 'spinner',
}: CyberSkeletonProps) {

  // Chart variant: 16 stable bar heights (20-90%)
  const chartBarHeights = useStableRandoms(16, 20, 70);

  // Table variant: 30 stable width multipliers (0.7-1.0) for 6 rows × 5 cols
  const tableWidthFactors = useStableRandoms(30, 0.7, 0.3);

  // ─── CARD ───
  if (variant === 'card') {
    return (
      <div className={cn('animate-in fade-in duration-300', minHeight)}>
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <ShimmerBar className="w-7 h-7 rounded-lg" />
          <div className="space-y-2">
            <ShimmerBar className="w-48 h-4" delay={100} />
            <ShimmerBar className="w-32 h-2.5" delay={200} />
          </div>
        </div>
        {/* Cards grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-zinc-900/30 p-4 space-y-3">
              <ShimmerBar className="w-8 h-8 rounded-lg" delay={i * 80} />
              <ShimmerBar className="w-20 h-2.5" delay={i * 80 + 100} />
              <ShimmerBar className="w-14 h-5" delay={i * 80 + 200} />
            </div>
          ))}
        </div>
        {/* Large content area */}
        <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-4">
          <ShimmerBar className="w-40 h-3 mb-4" delay={400} />
          <ShimmerBar className="w-full h-[180px] rounded-lg" delay={500} />
        </div>
        {/* Spinner indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Loader2 className={cn('w-3.5 h-3.5 animate-spin', accentColor)} />
          <span className={cn('font-mono text-[10px] tracking-widest opacity-60', accentColor)}>
            {label}
          </span>
        </div>
      </div>
    );
  }

  // ─── CHART (memoized bar heights) ───
  if (variant === 'chart') {
    return (
      <div className={cn('animate-in fade-in duration-300', minHeight)}>
        {/* Toolbar skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <ShimmerBar className="w-6 h-6 rounded-lg" />
          <ShimmerBar className="w-36 h-4" delay={100} />
          <div className="ml-auto flex gap-2">
            <ShimmerBar className="w-16 h-6 rounded-md" delay={200} />
            <ShimmerBar className="w-16 h-6 rounded-md" delay={250} />
            <ShimmerBar className="w-16 h-6 rounded-md" delay={300} />
          </div>
        </div>
        {/* Chart area skeleton — heights are stable via useMemo */}
        <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-4">
          <div className="flex items-end gap-1 h-[200px]">
            {chartBarHeights.map((h, i) => (
              <div key={i} className="flex-1" style={{ height: `${h}%` }}>
                <ShimmerBar className="w-full h-full rounded-t" delay={i * 40} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Loader2 className={cn('w-3.5 h-3.5 animate-spin', accentColor)} />
          <span className={cn('font-mono text-[10px] tracking-widest opacity-60', accentColor)}>
            {label}
          </span>
        </div>
      </div>
    );
  }

  // ─── TABLE (memoized row widths) ───
  if (variant === 'table') {
    const baseWidths = [80, 120, 100, 60, 80];

    return (
      <div className={cn('animate-in fade-in duration-300', minHeight)}>
        <div className="flex items-center gap-3 mb-4">
          <ShimmerBar className="w-6 h-6 rounded-lg" />
          <ShimmerBar className="w-48 h-4" delay={100} />
        </div>
        <div className="rounded-xl border border-white/5 bg-zinc-900/30 overflow-hidden">
          {/* Table header */}
          <div className="flex gap-4 px-4 py-3 border-b border-white/5">
            {baseWidths.map((w, i) => (
              <ShimmerBar key={i} className="h-2.5" style={{ width: w }} delay={i * 60} />
            ))}
          </div>
          {/* Table rows — widths are stable via useMemo */}
          {[0, 1, 2, 3, 4, 5].map(row => (
            <div key={row} className="flex gap-4 px-4 py-2.5 border-b border-white/[0.02]">
              {baseWidths.map((w, col) => (
                <ShimmerBar
                  key={col}
                  className="h-2"
                  style={{ width: w * tableWidthFactors[row * 5 + col] }}
                  delay={row * 50 + col * 30}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Loader2 className={cn('w-3.5 h-3.5 animate-spin', accentColor)} />
          <span className={cn('font-mono text-[10px] tracking-widest opacity-60', accentColor)}>
            {label}
          </span>
        </div>
      </div>
    );
  }

  // ─── PULSE — compact for modals / inline slots ───
  if (variant === 'pulse') {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300',
        minHeight,
      )}>
        {/* Three pulsing dots with staggered animation */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full opacity-80',
                accentColor.replace('text-', 'bg-'),
              )}
              style={{
                animation: 'pulse-dot 1.4s ease-in-out infinite',
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
        {/* Subtle label */}
        <span className={cn('font-mono text-[10px] tracking-widest opacity-50', accentColor)}>
          {label}
        </span>
        {/* Inline style for the pulse-dot keyframes (self-contained) */}
        <style>{`
          @keyframes pulse-dot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
            40% { transform: scale(1.2); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ─── DEFAULT: spinner variant ───
  return (
    <div className={cn('flex items-center justify-center gap-2', minHeight)}>
      <Loader2 className={cn('w-5 h-5 animate-spin', accentColor)} />
      <span className={cn('font-mono text-xs tracking-widest', accentColor)}>
        {label}
      </span>
    </div>
  );
}
