/**
 * Lightweight resizable panel system — replaces react-resizable-panels
 * which doesn't export correctly via ESM.sh in this environment.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────

interface PanelGroupProps {
  direction: "horizontal" | "vertical";
  className?: string;
  children: React.ReactNode;
  autoSaveId?: string;
}

interface PanelProps {
  defaultSize?: number;   // percentage
  minSize?: number;       // percentage
  maxSize?: number;       // percentage
  collapsible?: boolean;
  collapsedSize?: number;
  id?: string;
  order?: number;
  className?: string;
  children: React.ReactNode;
  onCollapse?: () => void;
  onExpand?: () => void;
  style?: React.CSSProperties;
}

interface PanelResizeHandleProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ImperativePanelHandle {
  collapse: () => void;
  expand: (size?: number) => void;
  isCollapsed: () => boolean;
  isExpanded: () => boolean;
}

// ─── Context for parent→child communication ──────────────────────────

interface PanelGroupContextValue {
  direction: "horizontal" | "vertical";
  /** Map of panel id → current flex basis (percentage) */
  sizes: Map<string, number>;
  /** Request a resize from a handle between two panels */
  onResize: (handleIndex: number, delta: number) => void;
  registerPanel: (id: string, defaultSize: number, index: number) => void;
  collapsePanel: (id: string) => void;
  expandPanel: (id: string, size?: number) => void;
  isPanelCollapsed: (id: string) => boolean;
}

const PanelGroupContext = React.createContext<PanelGroupContextValue | null>(null);

// ─── PanelGroup ──────────────────────────────────────────────────────

export function PanelGroup({ direction, className, children, autoSaveId }: PanelGroupProps) {
  const [sizes, setSizes] = React.useState<Map<string, number>>(new Map());
  const panelMeta = React.useRef<Map<string, { defaultSize: number; index: number }>>(new Map());
  const collapsedPanels = React.useRef<Set<string>>(new Set());
  const defaultSizes = React.useRef<Map<string, number>>(new Map());

  // Load saved sizes
  React.useEffect(() => {
    if (!autoSaveId) return;
    try {
      const saved = localStorage.getItem(`panel-sizes-${autoSaveId}`);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, number>;
        setSizes(new Map(Object.entries(parsed)));
      }
    } catch { /* ignore */ }
  }, [autoSaveId]);

  // Save sizes
  React.useEffect(() => {
    if (!autoSaveId || sizes.size === 0) return;
    try {
      const obj: Record<string, number> = {};
      sizes.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem(`panel-sizes-${autoSaveId}`, JSON.stringify(obj));
    } catch { /* ignore */ }
  }, [autoSaveId, sizes]);

  const registerPanel = React.useCallback((id: string, defaultSize: number, index: number) => {
    panelMeta.current.set(id, { defaultSize, index });
    defaultSizes.current.set(id, defaultSize);
    setSizes(prev => {
      if (prev.has(id)) return prev;
      const next = new Map(prev);
      next.set(id, defaultSize);
      return next;
    });
  }, []);

  const collapsePanel = React.useCallback((id: string) => {
    collapsedPanels.current.add(id);
    setSizes(prev => {
      const next = new Map(prev);
      next.set(id, 0);
      return next;
    });
  }, []);

  const expandPanel = React.useCallback((id: string, size?: number) => {
    collapsedPanels.current.delete(id);
    setSizes(prev => {
      const next = new Map(prev);
      next.set(id, size ?? defaultSizes.current.get(id) ?? 50);
      return next;
    });
  }, []);

  const isPanelCollapsed = React.useCallback((id: string) => {
    return collapsedPanels.current.has(id);
  }, []);

  const onResize = React.useCallback((handleIndex: number, delta: number) => {
    setSizes(prev => {
      const entries = Array.from(prev.entries()).sort((a, b) => {
        const ma = panelMeta.current.get(a[0]);
        const mb = panelMeta.current.get(b[0]);
        return (ma?.index ?? 0) - (mb?.index ?? 0);
      });
      if (handleIndex < 0 || handleIndex >= entries.length - 1) return prev;
      const [keyA] = entries[handleIndex];
      const [keyB] = entries[handleIndex + 1];
      const sizeA = prev.get(keyA) ?? 50;
      const sizeB = prev.get(keyB) ?? 50;
      const newA = Math.max(5, Math.min(95, sizeA + delta));
      const newB = Math.max(5, Math.min(95, sizeB - delta));
      const next = new Map(prev);
      next.set(keyA, newA);
      next.set(keyB, newB);
      return next;
    });
  }, []);

  const ctx: PanelGroupContextValue = React.useMemo(() => ({
    direction,
    sizes,
    onResize,
    registerPanel,
    collapsePanel,
    expandPanel,
    isPanelCollapsed,
  }), [direction, sizes, onResize, registerPanel, collapsePanel, expandPanel, isPanelCollapsed]);

  return (
    <PanelGroupContext.Provider value={ctx}>
      <div
        className={cn(
          "flex overflow-hidden",
          direction === "horizontal" ? "flex-row" : "flex-col",
          className
        )}
      >
        {children}
      </div>
    </PanelGroupContext.Provider>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────

export const Panel = React.forwardRef<ImperativePanelHandle, PanelProps>(function Panel(
  { defaultSize = 50, minSize, maxSize, id, order = 0, className, children, collapsible, onCollapse, onExpand, style },
  ref
) {
  const ctx = React.useContext(PanelGroupContext);
  const panelId = id ?? React.useId();

  React.useEffect(() => {
    ctx?.registerPanel(panelId, defaultSize, order);
  }, [ctx, panelId, defaultSize, order]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentSize = ctx?.sizes.get(panelId) ?? defaultSize;
  const isCollapsed = currentSize === 0;

  // Fire callbacks
  const prevCollapsed = React.useRef(isCollapsed);
  React.useEffect(() => {
    if (isCollapsed && !prevCollapsed.current) onCollapse?.();
    if (!isCollapsed && prevCollapsed.current) onExpand?.();
    prevCollapsed.current = isCollapsed;
  }, [isCollapsed, onCollapse, onExpand]);

  // Imperative handle
  React.useImperativeHandle(ref, () => ({
    collapse: () => ctx?.collapsePanel(panelId),
    expand: (size?: number) => ctx?.expandPanel(panelId, size),
    isCollapsed: () => (ctx?.sizes.get(panelId) ?? defaultSize) === 0,
    isExpanded: () => (ctx?.sizes.get(panelId) ?? defaultSize) > 0,
  }), [ctx, panelId, defaultSize]);

  const isHorizontal = ctx?.direction === "horizontal";
  const sizeStyle: React.CSSProperties = isCollapsed
    ? { [isHorizontal ? 'width' : 'height']: 0, overflow: 'hidden', flex: 'none' }
    : {
        flex: `${currentSize} 1 0%`,
        [isHorizontal ? 'minWidth' : 'minHeight']: minSize ? `${minSize}%` : undefined,
        [isHorizontal ? 'maxWidth' : 'maxHeight']: maxSize ? `${maxSize}%` : undefined,
      };

  return (
    <div className={cn("overflow-hidden", className)} style={{ ...sizeStyle, ...style }}>
      {children}
    </div>
  );
});

// ─── PanelResizeHandle ───────────────────────────────────────────────

export function PanelResizeHandle({ className, children }: PanelResizeHandleProps) {
  const ctx = React.useContext(PanelGroupContext);
  const handleRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Determine this handle's index by counting preceding Panel siblings
  const handleIndex = React.useRef(0);

  React.useEffect(() => {
    if (!handleRef.current || !handleRef.current.parentElement) return;
    const parent = handleRef.current.parentElement;
    const siblings = Array.from(parent.children);
    let panelCount = 0;
    for (const child of siblings) {
      if (child === handleRef.current) break;
      if (!child.getAttribute('data-resize-handle')) panelCount++;
    }
    handleIndex.current = panelCount - 1;
  });

  const onPointerDown = React.useCallback((e: React.PointerEvent) => {
    if (!ctx) return;
    e.preventDefault();
    setIsDragging(true);

    const isHorizontal = ctx.direction === "horizontal";
    const startPos = isHorizontal ? e.clientX : e.clientY;
    const parentEl = handleRef.current?.parentElement;
    const parentSize = parentEl
      ? (isHorizontal ? parentEl.offsetWidth : parentEl.offsetHeight)
      : 1000;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
      const deltaPx = currentPos - startPos;
      const deltaPct = (deltaPx / parentSize) * 100;
      if (Math.abs(deltaPct) > 0.2) {
        ctx.onResize(handleIndex.current, deltaPct);
      }
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [ctx]);

  return (
    <div
      ref={handleRef}
      data-resize-handle="true"
      className={cn(
        "shrink-0 select-none touch-none",
        ctx?.direction === "horizontal" ? "cursor-col-resize" : "cursor-row-resize",
        isDragging && "bg-primary/30",
        className
      )}
      onPointerDown={onPointerDown}
    >
      {children}
    </div>
  );
}
