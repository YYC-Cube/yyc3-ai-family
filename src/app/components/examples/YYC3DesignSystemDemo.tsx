import * as React from 'react';

export interface YYC3DesignSystemDemoProps {}

export const YYC3DesignSystemDemo: React.FC<YYC3DesignSystemDemoProps> = () => {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">YYC3 Design System 集成示例</h1>
        <p className="text-muted-foreground">
          本示例展示如何使用 YYC3 Design System 的设计令牌和组件
        </p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">设计令牌示例</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">颜色令牌</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-primary" style={{ backgroundColor: 'var(--primary)' }} />
                  <span className="text-sm">Primary: var(--primary)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-secondary" style={{ backgroundColor: 'var(--secondary)' }} />
                  <span className="text-sm">Secondary: var(--secondary)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-destructive" style={{ backgroundColor: 'var(--destructive)' }} />
                  <span className="text-sm">Destructive: var(--destructive)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">圆角令牌</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-8 rounded-sm bg-muted" style={{ borderRadius: 'var(--radius-sm)' }} />
                  <span className="text-sm">SM: var(--radius-sm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-8 rounded bg-muted" style={{ borderRadius: 'var(--radius-md)' }} />
                  <span className="text-sm">MD: var(--radius-md)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-8 rounded-lg bg-muted" style={{ borderRadius: 'var(--radius-lg)' }} />
                  <span className="text-sm">LG: var(--radius-lg)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">动画令牌示例</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">淡入动画</h3>
              <div
                className="w-full h-16 bg-primary rounded flex items-center justify-center text-primary-foreground"
                style={{
                  animation: 'fadeIn 0.3s ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDirection: 'alternate',
                }}
              >
                Fade In
              </div>
            </div>

            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">滑入动画</h3>
              <div
                className="w-full h-16 bg-secondary rounded flex items-center justify-center text-secondary-foreground"
                style={{
                  animation: 'slideInUp 0.3s ease-out',
                  animationIterationCount: 'infinite',
                  animationDirection: 'alternate',
                }}
              >
                Slide Up
              </div>
            </div>

            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">缩放动画</h3>
              <div
                className="w-full h-16 bg-accent rounded flex items-center justify-center text-accent-foreground"
                style={{
                  animation: 'scaleIn 0.3s ease-out',
                  animationIterationCount: 'infinite',
                  animationDirection: 'alternate',
                }}
              >
                Scale In
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">阴影令牌示例</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">卡片阴影</h3>
              <div
                className="w-full h-24 bg-muted rounded flex items-center justify-center"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                Card Shadow
              </div>
            </div>

            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">弹出层阴影</h3>
              <div
                className="w-full h-24 bg-muted rounded flex items-center justify-center"
                style={{ boxShadow: 'var(--shadow-popover)' }}
              >
                Popover Shadow
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">字体令牌示例</h2>

          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">字体家族</h3>
              <div className="space-y-2">
                <p style={{ fontFamily: 'var(--typography-font-sans)' }}>
                  Sans Serif: Geist, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial
                </p>
                <p style={{ fontFamily: 'var(--typography-font-serif)' }}>
                  Serif: Source Serif 4, Georgia, 'Times New Roman', serif
                </p>
                <p style={{ fontFamily: 'var(--typography-font-mono)' }}>
                  Mono: Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace
                </p>
              </div>
            </div>

            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">字体大小</h3>
              <div className="space-y-2">
                <p style={{ fontSize: 'var(--font-size-heading-1)', lineHeight: 'var(--line-height-heading)' }}>
                  Heading 1: 2rem
                </p>
                <p style={{ fontSize: 'var(--font-size-heading-2)', lineHeight: 'var(--line-height-heading)' }}>
                  Heading 2: 1.5rem
                </p>
                <p style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height-body)' }}>
                  Body: 1rem
                </p>
                <p style={{ fontSize: 'var(--font-size-caption)', lineHeight: 'var(--line-height-body)' }}>
                  Caption: 0.875rem
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">使用说明</h2>

          <div className="p-4 bg-card rounded-lg border border-border space-y-3">
            <h3 className="text-lg font-medium">集成 YYC3 Design System</h3>

            <div className="space-y-2">
              <h4 className="font-medium">1. 设计令牌已集成到 theme.css</h4>
              <p className="text-sm text-muted-foreground">
                所有设计令牌（颜色、圆角、阴影、字体、动画）已自动集成到主项目的 theme.css 文件中。
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">2. 使用 CSS 变量</h4>
              <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                <code>{`const primaryColor = 'var(--primary)';
const borderRadius = 'var(--radius-default)';
const boxShadow = 'var(--shadow-card)';`}</code>
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">3. 在 React 组件中使用</h4>
              <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                <code>{`<div style={{
  backgroundColor: 'var(--primary)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
  fontFamily: 'var(--typography-font-sans)',
  animation: 'fadeIn 0.3s ease-in-out'
}}>
  YYC3 Design System
</div>`}</code>
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">4. Design System 组件路径</h4>
              <p className="text-sm text-muted-foreground">
                Design System 组件位于: <code className="px-2 py-1 bg-muted rounded">/yyc3-Design-System/src/components/</code>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">5. 构建设计令牌</h4>
              <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                <code>{`cd yyc3-Design-System
npm run build:tokens`}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};