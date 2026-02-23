import {
  Play, CheckCircle2, XCircle, Loader2, Clock, Download, ChevronDown, ChevronRight,
  FlaskConical, Zap, Shield, AlertTriangle,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { runAllTests, type TestResult, type TestSuiteReport } from '@/lib/__tests__/core-test-suite';
import { cn } from '@/lib/utils';

// ============================================================
// Phase 25: Core Functionality Test Panel
// Visual runner for the programmatic test suite.
// Integrated into Console > Test Framework tab.
// ============================================================

interface SuiteGroup {
  name: string;
  results: TestResult[];
  passed: number;
  failed: number;
  expanded: boolean;
}

export function CoreTestPanel() {
  const [report, setReport] = React.useState<TestSuiteReport | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [expandedSuites, setExpandedSuites] = React.useState<Set<string>>(new Set());

  const handleRun = async () => {
    setIsRunning(true);
    setReport(null);
    // Small delay for UI to update
    await new Promise(r => setTimeout(r, 100));
    try {
      const result = await runAllTests();

      setReport(result);
      // Auto-expand failed suites
      const failedSuites = new Set<string>();

      for (const r of result.results) {
        if (r.status === 'FAIL') failedSuites.add(r.suite);
      }
      setExpandedSuites(failedSuites.size > 0 ? failedSuites : new Set(Object.keys(groupBySuite(result.results))));
    } catch (err) {
      console.error('Test runner error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleSuite = (name: string) => {
    setExpandedSuites(prev => {
      const next = new Set(prev);

      if (next.has(name)) next.delete(name);
      else next.add(name);

      return next;
    });
  };

  const suiteGroups = report ? groupBySuite(report.results) : {};

  const downloadReport = () => {
    if (!report) return;
    const text = generateMarkdownReport(report);
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `yyc3-test-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border p-4 flex items-center justify-between bg-muted/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-semibold">Core Functionality Tests</h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              Store / Navigation / LLM Bridge / Types / Persistence / i18n / Layout
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-mono"
              onClick={downloadReport}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs font-mono bg-primary hover:bg-primary/90"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Bar */}
      {report && (
        <div className="shrink-0 border-b border-border px-4 py-3 flex items-center gap-6 bg-background/50">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">
              {report.totalTests} tests
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-mono text-green-500">{report.passed} passed</span>
          </div>
          {report.failed > 0 && (
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-mono text-red-500">{report.failed} failed</span>
            </div>
          )}
          {report.skipped > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono text-amber-500">{report.skipped} skipped</span>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {report.duration.toFixed(1)}ms
            </span>
          </div>
          {/* Pass rate badge */}
          <div className={cn(
            'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold',
            report.failed === 0
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20',
          )}>
            {report.failed === 0 ? 'ALL PASS' : `${report.failed} FAILURES`}
          </div>
        </div>
      )}

      {/* Test Results */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {!report && !isRunning && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FlaskConical className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground font-mono mb-2">No test results yet</p>
              <p className="text-xs text-muted-foreground/60 font-mono">Click "Run All Tests" to execute the core test suite</p>
            </div>
          )}

          {isRunning && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-sm text-primary font-mono animate-pulse">Executing test suite...</p>
            </div>
          )}

          {report && Object.entries(suiteGroups).map(([suiteName, results]) => {
            const passed = results.filter(r => r.status === 'PASS').length;
            const failed = results.filter(r => r.status === 'FAIL').length;
            const isExpanded = expandedSuites.has(suiteName);
            const allPass = failed === 0;

            return (
              <div key={suiteName} className="border border-border rounded-lg overflow-hidden">
                <button
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    allPass ? 'bg-green-500/5 hover:bg-green-500/10' : 'bg-red-500/5 hover:bg-red-500/10',
                  )}
                  onClick={() => toggleSuite(suiteName)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <Shield className={cn('w-4 h-4 shrink-0', allPass ? 'text-green-500' : 'text-red-500')} />
                  <span className="text-xs font-mono font-semibold flex-1">{suiteName}</span>
                  <span className="text-[10px] font-mono text-green-500">{passed} pass</span>
                  {failed > 0 && (
                    <span className="text-[10px] font-mono text-red-500">{failed} fail</span>
                  )}
                  <span className="text-[10px] font-mono text-muted-foreground">{results.length} total</span>
                </button>

                {isExpanded && (
                  <div className="border-t border-border/50">
                    {results.map(r => (
                      <div
                        key={r.id}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 border-b border-border/30 last:border-b-0 text-xs font-mono',
                          r.status === 'FAIL' && 'bg-red-500/5',
                        )}
                      >
                        {r.status === 'PASS' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        ) : r.status === 'FAIL' ? (
                          <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="text-muted-foreground w-16 shrink-0">{r.id}</span>
                        <span className="flex-1 truncate">{r.name}</span>
                        <span className="text-muted-foreground/60 shrink-0">
                          {r.duration.toFixed(1)}ms
                        </span>
                        {r.error && (
                          <span className="text-red-400 max-w-[300px] truncate" title={r.error}>
                            {r.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function groupBySuite(results: TestResult[]): Record<string, TestResult[]> {
  const groups: Record<string, TestResult[]> = {};

  for (const r of results) {
    if (!groups[r.suite]) groups[r.suite] = [];
    groups[r.suite].push(r);
  }

  return groups;
}

function generateMarkdownReport(report: TestSuiteReport): string {
  const groups = groupBySuite(report.results);
  let md = `# YYC3 Core Test Report\n\n`;

  md += `> Generated: ${report.timestamp}\n`;
  md += `> Duration: ${report.duration.toFixed(1)}ms\n`;
  md += `> Result: **${report.passed}/${report.totalTests} PASSED** | ${report.failed} failed | ${report.skipped} skipped\n\n`;

  if (report.failed === 0) {
    md += `## Status: ALL TESTS PASSED\n\n`;
  } else {
    md += `## Status: ${report.failed} TEST FAILURES\n\n`;
  }

  md += `---\n\n`;

  for (const [suite, results] of Object.entries(groups)) {
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    md += `### ${suite} (${passed}/${results.length})\n\n`;
    md += `| ID | Test | Status | Time | Error |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const r of results) {
      const status = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'SKIP';

      md += `| ${r.id} | ${r.name} | ${status} | ${r.duration.toFixed(1)}ms | ${r.error || '-'} |\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `*Report generated by YYC3 Core Test Suite v2.0*\n`;

  return md;
}
