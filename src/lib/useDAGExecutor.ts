import { useCallback, useRef, useState } from 'react';

import { eventBus } from './event-bus';
import { useSystemStore } from './store';

// ============================================================
// YYC3 — DAG Pipeline Execution Engine
// Phase 38→41: Real-time pipeline execution with EventBus progress
//
// Simulates multi-stage DAG pipeline execution:
//   1. Each stage runs sequentially with realistic timing
//   2. Every stage transition emits EventBus events
//   3. Progress is tracked in Zustand store
//   4. Supports cancel/abort mid-pipeline
//   5. NeuralLinkOverlay picks up events automatically
//
// Phase 41 additions:
//   - Execution mode: 'simulated' | 'real'
//   - Real mode: HTTP POST to runner API on 192.168.3.22
//   - Graceful fallback to simulation if real endpoint unavailable
//   - Execution logs from remote runner
//
// Phase 42 additions:
//   - executeReal() fully wired into stage execution loop
//   - Per-stage real/simulated fallback with logs
//   - Runner health check function
//   - Global runner status singleton
//
// Usage:
//   const { execute, cancel, runs, executionMode, setExecutionMode } = useDAGExecutor();
//   execute('deploy', ['Build', 'Test', 'Push', 'Deploy'], { target: 'nas' });
// ============================================================

export type StageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled';
export type ExecutionMode = 'simulated' | 'real';

export interface PipelineStage {
  name: string;
  status: StageStatus;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  logs: string[];
}

export interface PipelineRun {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  stages: PipelineStage[];
  startedAt: number;
  completedAt?: number;
  metadata: Record<string, unknown>;
  progress: number; // 0-100
}

// Stage execution timing ranges (ms) for realistic simulation
const STAGE_TIMING: Record<string, [number, number]> = {
  'Checkout': [800, 1500],
  'Install': [2000, 4000],
  'Lint': [1000, 2000],
  'Type Check': [1500, 3000],
  'Unit Test': [2000, 4000],
  'Integration Test': [3000, 6000],
  'Test': [2000, 4000],
  'Build': [3000, 6000],
  'Docker Build': [4000, 8000],
  'Push': [1500, 3000],
  'Push Image': [2000, 4000],
  'Push Registry': [1500, 3000],
  'Deploy': [2000, 4000],
  'Health Check': [1000, 2000],
  'Verify': [1000, 2000],
  'SAST Scan': [3000, 5000],
  'Dependency Audit': [2000, 3000],
  'Secret Detection': [1500, 2500],
  'Report': [800, 1500],
  'Coverage Report': [1500, 2500],
  'Update Manifest': [800, 1500],
  'Notify': [500, 1000],
  'Approval': [1000, 2000],
};

function getStageDelay(stageName: string): number {
  const range = STAGE_TIMING[stageName] || [1000, 3000];

  return range[0] + Math.random() * (range[1] - range[0]);
}

// Stage-specific log generation
function generateStageLogs(stageName: string, metadata: Record<string, unknown>): string[] {
  const target = (metadata.target as string) || 'default';
  const service = (metadata.service as string) || 'yyc3-chatbot';

  const logMap: Record<string, string[]> = {
    'Checkout': [`git clone --depth=1 main`, `HEAD at ${Math.random().toString(36).slice(2, 9)}`],
    'Install': [`pnpm install --frozen-lockfile`, `Packages: 847 added`, `node_modules: 312MB`],
    'Lint': [`eslint --ext .ts,.tsx src/`, `0 errors, 2 warnings`],
    'Type Check': [`tsc --noEmit --strict`, `Checking 142 files...`, `No errors found`],
    'Unit Test': [`vitest run --coverage`, `Tests: 87 passed, 0 failed`, `Coverage: 78.3%`],
    'Integration Test': [`vitest run --config vitest.integration.ts`, `Tests: 24 passed`, `DB connection: OK`],
    'Test': [`vitest run`, `Tests: 111 passed, 0 failed`, `Time: 8.2s`],
    'Build': [`vite build --mode production`, `dist/: 2.4MB (gzipped: 680KB)`, `Build time: 4.2s`],
    'Docker Build': [`docker build -t ${service}:latest .`, `Layer cache: 6/8 hit`, `Image size: 245MB`],
    'Push': [`docker push ${target}/${service}:latest`, `Pushed: sha256:a8f3...`],
    'Push Image': [`docker push 192.168.3.22:5000/${service}`, `Upload: 245MB`, `Digest: sha256:${Math.random().toString(36).slice(2, 10)}`],
    'Push Registry': [`Push to registry: 192.168.3.22:5000`, `Tag: latest`, `Size: 245MB`],
    'Deploy': [`ssh yyc3@192.168.3.22 docker-compose up -d`, `Container ${service}: recreated`, `Network: yyc3_net`],
    'Health Check': [`curl -sf http://192.168.3.22:3000/health`, `Status: 200 OK`, `Response: {"status":"healthy"}`],
    'Verify': [`Integration smoke test...`, `All endpoints responding`, `Latency: 12ms avg`],
    'SAST Scan': [`semgrep scan --config auto`, `Rules: 347 checked`, `Findings: 0 critical, 1 warning`],
    'Dependency Audit': [`pnpm audit --production`, `Vulnerabilities: 0 critical, 0 high`, `2 moderate (acceptable)`],
    'Secret Detection': [`gitleaks detect --source .`, `No secrets detected`, `Files scanned: 234`],
    'Report': [`Generating report...`, `Saved to: /reports/${new Date().toISOString().slice(0, 10)}.html`],
    'Coverage Report': [`istanbul report lcov`, `Lines: 78.3%`, `Branches: 64.2%`, `Functions: 82.1%`],
    'Update Manifest': [`kubectl set image deployment/${service}`, `Manifest updated`, `Rollout status: progressing`],
    'Notify': [`Slack webhook: #deployments`, `Message sent`, `Teams: @devops`],
    'Approval': [`Auto-approved (policy: fast-track)`, `Approver: system`],
  };

  return logMap[stageName] || [`Executing: ${stageName}`, `Done.`];
}

// Failure probability (low but realistic)
function shouldStageFail(stageName: string): boolean {
  const failRates: Record<string, number> = {
    'Unit Test': 0.05,
    'Integration Test': 0.08,
    'Test': 0.05,
    'SAST Scan': 0.03,
    'Deploy': 0.04,
    'Health Check': 0.06,
  };

  return Math.random() < (failRates[stageName] || 0.02);
}

// ============================================================
// Phase 41: Real Runner — SSH/Docker API via HTTP endpoint
// ============================================================

const RUNNER_API_URL = 'http://192.168.3.22:3002/api/execute';

interface RealRunnerResult {
  success: boolean;
  exitCode: number;
  stdout: string[];
  stderr: string[];
  durationMs: number;
}

// Stage → shell command mapping for real execution
function getStageCommand(stageName: string, metadata: Record<string, unknown>): string {
  const service = (metadata.service as string) || 'yyc3-chatbot';
  const target = (metadata.target as string) || 'nas-docker';

  const cmdMap: Record<string, string> = {
    'Checkout': `cd /opt/yyc3/${service} && git pull --rebase origin main`,
    'Install': `cd /opt/yyc3/${service} && pnpm install --frozen-lockfile`,
    'Lint': `cd /opt/yyc3/${service} && pnpm lint`,
    'Type Check': `cd /opt/yyc3/${service} && pnpm tsc --noEmit`,
    'Unit Test': `cd /opt/yyc3/${service} && pnpm test`,
    'Integration Test': `cd /opt/yyc3/${service} && pnpm test:integration`,
    'Test': `cd /opt/yyc3/${service} && pnpm test`,
    'Build': `cd /opt/yyc3/${service} && pnpm build`,
    'Docker Build': `docker build -t ${service}:latest /opt/yyc3/${service}`,
    'Push': `docker push ${target}/${service}:latest`,
    'Push Image': `docker push 192.168.3.22:5000/${service}:latest`,
    'Deploy': `cd /opt/yyc3/${service} && docker-compose up -d --build`,
    'Health Check': `curl -sf http://localhost:3000/health`,
    'Verify': `curl -sf http://localhost:3000/api/status`,
    'SAST Scan': `cd /opt/yyc3/${service} && npx semgrep scan --config auto`,
    'Dependency Audit': `cd /opt/yyc3/${service} && pnpm audit --production`,
    'Secret Detection': `cd /opt/yyc3/${service} && npx gitleaks detect --source .`,
    'Report': `echo "Report generated at $(date)"`,
    'Coverage Report': `cd /opt/yyc3/${service} && pnpm test:coverage`,
    'Notify': `echo "Notification sent via webhook"`,
    'Approval': `echo "Auto-approved by policy"`,
  };

  return cmdMap[stageName] || `echo "Executing: ${stageName}"`;
}

async function executeReal(
  stageName: string,
  metadata: Record<string, unknown>,
): Promise<RealRunnerResult> {
  const command = getStageCommand(stageName, metadata);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(RUNNER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, stage: stageName, metadata }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json() as RealRunnerResult;

      return data;
    }

    return {
      success: false, exitCode: res.status,
      stdout: [`HTTP ${res.status}: ${res.statusText}`],
      stderr: ['Runner API returned error'],
      durationMs: 0,
    };
  } catch (err) {
    return {
      success: false, exitCode: -1,
      stdout: [],
      stderr: [`Runner API unreachable: ${err instanceof Error ? err.message : 'Unknown error'}`, `Endpoint: ${RUNNER_API_URL}`],
      durationMs: 0,
    };
  }
}

// ============================================================
// Phase 42: Runner Health Check & Status Singleton
// ============================================================

export type RunnerStatus = 'unknown' | 'checking' | 'online' | 'offline' | 'error';

interface RunnerHealthState {
  status: RunnerStatus;
  latencyMs?: number;
  lastChecked?: number;
  version?: string;
  uptime?: number;
  error?: string;
}

let _runnerHealth: RunnerHealthState = { status: 'unknown' };
const _runnerListeners = new Set<() => void>();

export function getRunnerHealth(): RunnerHealthState {
  return _runnerHealth;
}

function setRunnerHealth(state: RunnerHealthState) {
  _runnerHealth = state;
  _runnerListeners.forEach(fn => fn());
}

export function onRunnerHealthChange(fn: () => void): () => void {
  _runnerListeners.add(fn);

  return () => { _runnerListeners.delete(fn); };
}

export async function checkRunnerHealth(): Promise<RunnerHealthState> {
  setRunnerHealth({ ...getRunnerHealth(), status: 'checking' });
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(RUNNER_API_URL.replace('/api/execute', '/health'), {
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json() as { status?: string; uptime?: number; version?: string };
      const state: RunnerHealthState = {
        status: 'online',
        latencyMs,
        lastChecked: Date.now(),
        version: data.version || '1.0.0',
        uptime: data.uptime,
      };

      setRunnerHealth(state);

      return state;
    }
    const state: RunnerHealthState = {
      status: 'error',
      latencyMs,
      lastChecked: Date.now(),
      error: `HTTP ${res.status}`,
    };

    setRunnerHealth(state);

    return state;
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const state: RunnerHealthState = {
      status: 'offline',
      latencyMs,
      lastChecked: Date.now(),
      error: err instanceof Error ? err.message : 'Unknown',
    };

    setRunnerHealth(state);

    return state;
  }
}

// ============================================================
// Main Hook
// ============================================================

export function useDAGExecutor() {
  const addLog = useSystemStore(s => s.addLog);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const abortRefs = useRef<Map<string, boolean>>(new Map());
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('simulated');

  const execute = useCallback(async (
    pipelineName: string,
    stageNames: string[],
    metadata: Record<string, unknown> = {},
  ): Promise<PipelineRun> => {
    const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;

    const stages: PipelineStage[] = stageNames.map(name => ({
      name,
      status: 'pending' as StageStatus,
      logs: [],
    }));

    const run: PipelineRun = {
      id: runId,
      name: pipelineName,
      status: 'running',
      stages,
      startedAt: Date.now(),
      metadata,
      progress: 0,
    };

    abortRefs.current.set(runId, false);
    setRuns(prev => [run, ...prev.slice(0, 9)]); // keep last 10

    // Emit start event
    addLog('info', 'DAG_EXECUTOR', `Pipeline "${pipelineName}" started [${runId}]`);
    eventBus.emit({
      category: 'system',
      type: 'devops.pipeline_started',
      level: 'info',
      source: 'DAG_EXEC',
      message: `Pipeline "${pipelineName}" started`,
      metadata: { runId, pipelineName, stageCount: stageNames.length, ...metadata },
    });

    // Execute stages sequentially
    let allSuccess = true;

    for (let i = 0; i < stages.length; i++) {
      // Check abort
      if (abortRefs.current.get(runId)) {
        stages[i].status = 'cancelled';
        for (let j = i + 1; j < stages.length; j++) {
          stages[j].status = 'skipped';
        }
        allSuccess = false;
        break;
      }

      const stage = stages[i];

      stage.status = 'running';
      stage.startedAt = Date.now();

      const progress = Math.round(((i) / stages.length) * 100);

      // Update run state
      const updatedRun: PipelineRun = { ...run, stages: [...stages], progress };

      setRuns(prev => prev.map(r => r.id === runId ? updatedRun : r));

      // Emit stage start
      eventBus.emit({
        category: 'system',
        type: 'devops.stage_started',
        level: 'info',
        source: 'DAG_EXEC',
        message: `[${i + 1}/${stages.length}] ${stage.name} started`,
        metadata: { runId, pipelineName, stageName: stage.name, stageIndex: i, progress },
      });

      addLog('info', 'DAG_EXEC', `[${pipelineName}] Stage ${i + 1}/${stages.length}: ${stage.name} (${executionMode})`);

      // Phase 42: Branch execution based on mode
      let failed = false;

      if (executionMode === 'real') {
        // === REAL MODE: Call runner API on 192.168.3.22 ===
        addLog('info', 'DAG_EXEC', `[REAL] Executing: ${getStageCommand(stage.name, metadata).slice(0, 80)}...`);
        const realResult = await executeReal(stage.name, metadata);

        // Check abort after real execution
        if (abortRefs.current.get(runId)) {
          stage.status = 'cancelled';
          for (let j = i + 1; j < stages.length; j++) { stages[j].status = 'skipped'; }
          allSuccess = false;
          break;
        }

        if (realResult.exitCode === -1) {
          // Runner unreachable — fallback to simulated for this stage
          addLog('warn', 'DAG_EXEC', `[REAL→SIM] Runner unreachable, falling back to simulation for ${stage.name}`);
          eventBus.emit({
            category: 'system', type: 'devops.runner_fallback', level: 'warn', source: 'DAG_EXEC',
            message: `Runner API unreachable, stage "${stage.name}" using simulated execution`,
            metadata: { runId, stageName: stage.name, error: realResult.stderr.join('; ') },
          });
          // Simulated fallback
          const delay = getStageDelay(stage.name);

          await new Promise(resolve => setTimeout(resolve, delay));
          failed = shouldStageFail(stage.name);
          stage.completedAt = Date.now();
          stage.durationMs = stage.completedAt - (stage.startedAt || 0);
          stage.logs = [
            `⚠️ FALLBACK: Runner API unreachable, simulated execution`,
            ...realResult.stderr,
            '---',
            ...generateStageLogs(stage.name, metadata),
          ];
        } else {
          // Real execution completed
          stage.completedAt = Date.now();
          stage.durationMs = realResult.durationMs || (stage.completedAt - (stage.startedAt || 0));
          stage.logs = [
            `🔧 REAL EXECUTION (192.168.3.22:3002)`,
            `$ ${getStageCommand(stage.name, metadata)}`,
            '---',
            ...realResult.stdout,
            ...(realResult.stderr.length > 0 ? ['--- stderr ---', ...realResult.stderr] : []),
            `Exit code: ${realResult.exitCode} | Duration: ${realResult.durationMs}ms`,
          ];
          failed = !realResult.success;
        }
      } else {
        // === SIMULATED MODE: Original behavior ===
        const delay = getStageDelay(stage.name);

        await new Promise(resolve => setTimeout(resolve, delay));

        // Check abort again after delay
        if (abortRefs.current.get(runId)) {
          stage.status = 'cancelled';
          for (let j = i + 1; j < stages.length; j++) { stages[j].status = 'skipped'; }
          allSuccess = false;
          break;
        }

        failed = shouldStageFail(stage.name);
        stage.completedAt = Date.now();
        stage.durationMs = stage.completedAt - (stage.startedAt || 0);
        stage.logs = generateStageLogs(stage.name, metadata);
      }

      if (failed) {
        stage.status = 'failed';
        stage.logs.push(`ERROR: ${stage.name} failed after ${stage.durationMs}ms`);
        allSuccess = false;

        // Mark remaining stages as skipped
        for (let j = i + 1; j < stages.length; j++) {
          stages[j].status = 'skipped';
        }

        eventBus.emit({
          category: 'system',
          type: 'devops.stage_failed',
          level: 'error',
          source: 'DAG_EXEC',
          message: `[${i + 1}/${stages.length}] ${stage.name} FAILED (${stage.durationMs}ms)`,
          metadata: { runId, pipelineName, stageName: stage.name, durationMs: stage.durationMs },
        });

        addLog('error', 'DAG_EXEC', `[${pipelineName}] ${stage.name} FAILED (${stage.durationMs}ms)`);
        break;
      } else {
        stage.status = 'success';

        eventBus.emit({
          category: 'system',
          type: 'devops.stage_completed',
          level: 'success',
          source: 'DAG_EXEC',
          message: `[${i + 1}/${stages.length}] ${stage.name} completed (${stage.durationMs}ms)`,
          metadata: { runId, pipelineName, stageName: stage.name, durationMs: stage.durationMs },
        });
      }
    }

    // Finalize run
    const finalProgress = 100;
    const finalStatus = abortRefs.current.get(runId) ? 'cancelled'
      : allSuccess ? 'success' : 'failed';

    const finalRun: PipelineRun = {
      ...run,
      stages: [...stages],
      status: finalStatus,
      completedAt: Date.now(),
      progress: finalProgress,
    };

    setRuns(prev => prev.map(r => r.id === runId ? finalRun : r));
    abortRefs.current.delete(runId);

    // Emit completion event
    const totalDuration = (finalRun.completedAt || Date.now()) - finalRun.startedAt;

    eventBus.emit({
      category: 'system',
      type: `devops.pipeline_${finalStatus}`,
      level: finalStatus === 'success' ? 'success' : finalStatus === 'cancelled' ? 'warn' : 'error',
      source: 'DAG_EXEC',
      message: `Pipeline "${pipelineName}" ${finalStatus} (${(totalDuration / 1000).toFixed(1)}s)`,
      metadata: { runId, pipelineName, status: finalStatus, totalDurationMs: totalDuration, stagesCompleted: stages.filter(s => s.status === 'success').length },
    });

    addLog(
      finalStatus === 'success' ? 'success' : finalStatus === 'cancelled' ? 'warn' : 'error',
      'DAG_EXEC',
      `Pipeline "${pipelineName}" ${finalStatus} in ${(totalDuration / 1000).toFixed(1)}s`,
    );

    return finalRun;
  }, [addLog]);

  const cancel = useCallback((runId: string) => {
    abortRefs.current.set(runId, true);
    addLog('warn', 'DAG_EXEC', `Pipeline ${runId} cancellation requested`);
    eventBus.emit({
      category: 'system',
      type: 'devops.pipeline_cancel',
      level: 'warn',
      source: 'DAG_EXEC',
      message: `Pipeline ${runId} cancel requested`,
      metadata: { runId },
    });
  }, [addLog]);

  const clearRuns = useCallback(() => {
    setRuns([]);
  }, []);

  return { execute, cancel, clearRuns, runs, executionMode, setExecutionMode };
}

// ============================================================
// Store integration: Global pipeline runs (singleton-ish)
// ============================================================

// For cross-component access without prop drilling
let _globalExecutor: ReturnType<typeof useDAGExecutor> | null = null;

export function registerGlobalExecutor(executor: ReturnType<typeof useDAGExecutor>) {
  _globalExecutor = executor;
}

export function getGlobalExecutor() {
  return _globalExecutor;
}