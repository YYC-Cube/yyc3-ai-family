import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Bug, Home } from "lucide-react";
import { Button } from "@/app/components/ui/button";

// ============================================================
// ComponentErrorBoundary — Phase 50
// Reusable local error boundary for critical sub-components.
// Provides cyberpunk-styled error recovery UI with:
//   - Component-specific error context
//   - Retry (re-mount) functionality
//   - Expandable error details
//   - Optional "go home" fallback
//   - Error logging callback
// ============================================================

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  /** Display name of the wrapped component (e.g. "HardwareMonitor") */
  componentName?: string;
  /** Accent color for the error card (Tailwind text color class) */
  accentColor?: string;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** If true, show a "Return to Dashboard" button */
  showHomeAction?: boolean;
  /** Optional action for "Return to Dashboard" */
  onGoHome?: () => void;
  /** Compact mode for smaller panels */
  compact?: boolean;
  /** Custom fallback element (overrides default UI) */
  fallback?: React.ReactNode;
}

interface ComponentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
  retryCount: number;
}

export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ComponentErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to console
    console.error(
      `[ComponentErrorBoundary] ${this.props.componentName || "Unknown"} crashed:`,
      error,
      errorInfo
    );

    // Invoke optional callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: prev.retryCount + 1,
    }));
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const {
        componentName = "MODULE",
        accentColor = "text-red-500",
        showHomeAction = false,
        onGoHome,
        compact = false,
      } = this.props;
      const { error, errorInfo, showDetails, retryCount } = this.state;

      const bgAccent = accentColor.replace("text-", "bg-").replace("/", "/");
      const borderAccent = accentColor.replace("text-", "border-");

      if (compact) {
        return (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-mono text-red-400">
                {componentName} FAULT
              </span>
              <span className="text-[10px] font-mono text-zinc-600 ml-2 truncate">
                {error?.message?.slice(0, 60) || "Unknown error"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
              onClick={this.handleRetry}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              RETRY
            </Button>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center min-h-[200px] p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md">
            <div className={cn(
              "rounded-xl border bg-black/60 backdrop-blur-sm overflow-hidden",
              borderAccent ? `border-red-500/20` : "border-white/10"
            )}>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-red-500/5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-red-400">{componentName}_FAULT</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600">
                    RECOVERY_PROTOCOL | RETRY_COUNT: {retryCount}
                  </span>
                </div>
              </div>

              {/* Error Summary */}
              <div className="px-4 py-3 space-y-3">
                <div className="text-xs font-mono text-zinc-400 bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                  <span className="text-red-400">ERR:</span>{" "}
                  <span className="text-zinc-300">{error?.message || "Unknown error"}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 font-mono text-xs border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={this.handleRetry}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    RETRY_MODULE
                  </Button>
                  {showHomeAction && onGoHome && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 font-mono text-xs border-white/10 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                      onClick={onGoHome}
                    >
                      <Home className="w-3.5 h-3.5" />
                      DASHBOARD
                    </Button>
                  )}
                </div>

                {/* Expandable Details */}
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors w-full"
                >
                  <Bug className="w-3 h-3" />
                  STACK_TRACE
                  {showDetails ? (
                    <ChevronUp className="w-3 h-3 ml-auto" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-auto" />
                  )}
                </button>

                {showDetails && errorInfo && (
                  <div className="rounded-lg border border-white/5 bg-black/40 overflow-hidden">
                    <pre className="p-3 text-[9px] font-mono text-zinc-600 overflow-x-auto overflow-y-auto max-h-[200px] whitespace-pre-wrap break-all">
                      {error?.stack || "No stack trace available"}
                      {"\n\n--- Component Stack ---\n"}
                      {errorInfo.componentStack || "N/A"}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
