import * as React from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * SafeChartContainer — wraps Recharts ResponsiveContainer with dimension safety.
 * Only renders children once the container has measured positive width and height,
 * preventing the "width(-1) and height(-1)" Recharts error.
 */
export function SafeChartContainer({
  children,
  width = '100%',
  height = '100%',
  minWidth = 0,
  minHeight = 0,
  className,
  style,
}: {
  children: React.ReactElement;
  width?: string | number;
  height?: string | number;
  minWidth?: number;
  minHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    const check = () => {
      const rect = el.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        setIsReady(true);
      } else {
        // Reset when container collapses (tab switch, panel collapse)
        setIsReady(false);
      }
    };

    // Initial check
    check();

    // Use ResizeObserver for layout changes
    let observer: ResizeObserver | undefined;

    try {
      observer = new ResizeObserver(() => {
        check();
      });
      observer.observe(el);
    } catch {
      // Fallback: retry with requestAnimationFrame
      const raf = requestAnimationFrame(check);

      return () => cancelAnimationFrame(raf);
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: 1, ...style }}
    >
      {isReady ? (
        <ResponsiveContainer
          width={width}
          height={height}
          minWidth={minWidth}
          minHeight={minHeight}
          debounce={50}
        >
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}