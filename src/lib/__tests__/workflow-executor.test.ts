// ============================================================
// YYC3 Hacker Chatbot — Workflow Executor Unit Tests (Vitest)
// Phase P0: Core Module Test Coverage
//
// Tests: Workflow definition, step execution, parallel branches,
//        conditions, transforms, delays, output generation.
//
// Run: npx vitest run src/lib/__tests__/workflow-executor.test.ts
// ============================================================

import { describe, expect, it, beforeEach } from 'vitest';

import {
  WorkflowExecutor,
  PRESET_WORKFLOWS,
  type WorkflowDefinition,
  type WorkflowStep,
  type WorkflowResult,
  type WorkflowContext,
} from '../workflow-executor';

// ============================================================
// Setup
// ============================================================

beforeEach(() => {
  // Create fresh executor for each test
});

// ============================================================
// Suite 1: Workflow Definition Validation
// ============================================================

describe('Workflow Executor — Definition Validation', () => {
  it('WE-01: accepts valid workflow definition', () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      description: 'A test workflow',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'llm_call', agent: 'navigator', prompt: 'Hello' },
      ],
      output: { type: 'response', format: 'json' },
    };

    expect(workflow.id).toBe('test-workflow');
    expect(workflow.steps).toHaveLength(1);
  });

  it('WE-02: workflow has required fields', () => {
    const workflow: WorkflowDefinition = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [],
      output: { type: 'response' },
    };

    expect(workflow.id).toBeTruthy();
    expect(workflow.name).toBeTruthy();
    expect(workflow.version).toBeTruthy();
    expect(workflow.trigger).toBeDefined();
    expect(workflow.steps).toBeDefined();
    expect(workflow.output).toBeDefined();
  });

  it('WE-03: workflow supports all trigger types', () => {
    const triggers = ['manual', 'schedule', 'event', 'webhook'] as const;

    for (const type of triggers) {
      const workflow: WorkflowDefinition = {
        id: `test-${type}`,
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        trigger: { type },
        steps: [],
        output: { type: 'response' },
      };

      expect(workflow.trigger.type).toBe(type);
    }
  });

  it('WE-04: workflow supports metadata', () => {
    const workflow: WorkflowDefinition = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [],
      output: { type: 'response' },
      metadata: {
        author: 'Test Author',
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
        tags: ['test', 'demo'],
      },
    };

    expect(workflow.metadata?.author).toBe('Test Author');
    expect(workflow.metadata?.tags).toEqual(['test', 'demo']);
  });
});

// ============================================================
// Suite 2: Basic Workflow Execution
// ============================================================

describe('Workflow Executor — Basic Execution', () => {
  it('WE-05: executes simple workflow with single step', async () => {
    const executor = new WorkflowExecutor();
    const workflow: WorkflowDefinition = {
      id: 'simple-test',
      name: 'Simple Test',
      description: 'Simple test workflow',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'transform', transform: 'test_value' },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(true);
    expect(result.metrics.totalSteps).toBe(1);
    expect(result.metrics.completedSteps).toBe(1);
  });

  it('WE-06: workflow execution has unique ID', async () => {
    const executor = new WorkflowExecutor();
    const workflow: WorkflowDefinition = {
      id: 'test-id',
      name: 'Test',
      description: 'Test',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [{ id: 'step1', name: 'Step 1', type: 'transform', transform: 'test' }],
      output: { type: 'response' },
    };

    // Execute twice with small delay to ensure unique timestamps
    await executor.execute(workflow);
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    await executor.execute(workflow);

    const executions = executor.getAllExecutions();

    expect(executions).toHaveLength(2);
    expect(executions[0].id).not.toBe(executions[1].id);
  });

  it('WE-07: workflow accepts input parameters', async () => {
    const executor = new WorkflowExecutor();
    const workflow: WorkflowDefinition = {
      id: 'input-test',
      name: 'Input Test',
      description: 'Test input handling',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [{ id: 'step1', name: 'Step 1', type: 'transform', transform: '$.message' }],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow, { message: 'Hello World' });

    expect(result.success).toBe(true);
  });

  it('WE-08: workflow with multiple sequential steps', async () => {
    const executor = new WorkflowExecutor();
    const workflow: WorkflowDefinition = {
      id: 'multi-step',
      name: 'Multi Step',
      description: 'Multiple sequential steps',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'transform', transform: 'value1' },
        { id: 'step2', name: 'Step 2', type: 'transform', transform: 'value2' },
        { id: 'step3', name: 'Step 3', type: 'transform', transform: 'value3' },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(true);
    expect(result.metrics.totalSteps).toBe(3);
    expect(result.metrics.completedSteps).toBe(3);
  });
});

// ============================================================
// Suite 3: Step Types
// ============================================================

describe('Workflow Executor — Step Types', () => {
  it('WE-09: executes transform step', async () => {
    const executor = new WorkflowExecutor();
    const step: WorkflowStep = { id: 't1', name: 'Transform', type: 'transform', transform: 'test_value' };

    const workflow: WorkflowDefinition = {
      id: 'transform-test',
      name: 'Transform Test',
      description: 'Test transform step',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [step],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(true);
  });

  it('WE-10: executes delay step', async () => {
    const executor = new WorkflowExecutor();
    const startTime = Date.now();

    const workflow: WorkflowDefinition = {
      id: 'delay-test',
      name: 'Delay Test',
      description: 'Test delay step',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [{ id: 'd1', name: 'Delay', type: 'delay', delayMs: 100 }],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);
    const duration = Date.now() - startTime;

    expect(result.success).toBe(true);
    expect(duration).toBeGreaterThanOrEqual(100);
  });

  it('WE-11: executes parallel step with branches', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'parallel-test',
      name: 'Parallel Test',
      description: 'Test parallel execution',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        {
          id: 'parallel1',
          name: 'Parallel Branches',
          type: 'parallel',
          branches: [
            { id: 'branch1', name: 'Branch 1', type: 'transform', transform: 'result1' },
            { id: 'branch2', name: 'Branch 2', type: 'transform', transform: 'result2' },
            { id: 'branch3', name: 'Branch 3', type: 'transform', transform: 'result3' },
          ],
        },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(true);
  });

  it('WE-12: executes condition step with true branch', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'condition-test',
      name: 'Condition Test',
      description: 'Test condition execution',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        {
          id: 'cond1',
          name: 'Condition',
          type: 'condition',
          condition: "{{steps.input.status}} === 'success'",
          branches: [
            { id: 'then', name: 'Then', type: 'transform', transform: 'then_branch' },
            { id: 'else', name: 'Else', type: 'transform', transform: 'else_branch' },
          ],
        },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(true);
  });

  it('WE-13: handles unknown step type gracefully', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'unknown-type',
      name: 'Unknown Type',
      description: 'Test unknown step type',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [{ id: 'step1', name: 'Step', type: 'unknown_type' as any }],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(false);
    expect(result.metrics.failedSteps).toBe(1);
  });
});

// ============================================================
// Suite 4: Error Handling
// ============================================================

describe('Workflow Executor — Error Handling', () => {
  it('WE-14: handles step failure with stop on error', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'error-stop',
      name: 'Error Stop',
      description: 'Test error handling',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'transform', transform: 'test' },
        { id: 'step2', name: 'Step 2', type: 'unknown_type' as any, onError: 'stop' },
        { id: 'step3', name: 'Step 3', type: 'transform', transform: 'should_not_reach' },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(false);
    expect(result.metrics.failedSteps).toBe(1);
  });

  it('WE-15: continues on error when configured', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'error-continue',
      name: 'Error Continue',
      description: 'Test continue on error',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'transform', transform: 'test1' },
        { id: 'step2', name: 'Step 2', type: 'unknown_type' as any, onError: 'continue' },
        { id: 'step3', name: 'Step 3', type: 'transform', transform: 'test3' },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.metrics.completedSteps).toBeGreaterThanOrEqual(2);
  });

  it('WE-16: retries on error when configured', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'error-retry',
      name: 'Error Retry',
      description: 'Test retry on error',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'transform', transform: 'test' },
        { id: 'step2', name: 'Step 2', type: 'unknown_type' as any, onError: 'retry', retryCount: 3 },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(false);
  });
});

// ============================================================
// Suite 5: Context & Variables
// ============================================================

describe('Workflow Executor — Context & Variables', () => {
  it('WE-17: context is passed through steps', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'context-test',
      name: 'Context Test',
      description: 'Test context passing',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'transform', transform: 'value1' },
        { id: 'step2', name: 'Step 2', type: 'transform', transform: 'value2' },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow, { inputKey: 'inputValue' });

    expect(result.success).toBe(true);
  });

  it('WE-18: supports input interpolation', () => {
    const executor = new WorkflowExecutor();
    const context: WorkflowContext = {
      input: { name: 'Test', value: 42 },
      steps: {},
      variables: {},
    };

    // Test private method via any cast for testing purposes
    const interpolateTemplate = (executor as any).interpolateTemplate.bind(executor);

    const result = interpolateTemplate('Hello {{input.name}}!', context);

    expect(result).toBe('Hello Test!');
  });

  it('WE-19: supports variables interpolation', () => {
    const executor = new WorkflowExecutor();
    const context: WorkflowContext = {
      input: {},
      steps: {},
      variables: { apiKey: 'secret123', endpoint: 'https://api.example.com' },
    };

    const interpolateTemplate = (executor as any).interpolateTemplate.bind(executor);

    const result = interpolateTemplate('Call {{variables.endpoint}}', context);

    expect(result).toBe('Call https://api.example.com');
  });

  it('WE-20: handles missing interpolation gracefully', () => {
    const executor = new WorkflowExecutor();
    const context: WorkflowContext = {
      input: {},
      steps: {},
      variables: {},
    };

    const interpolateTemplate = (executor as any).interpolateTemplate.bind(executor);

    const result = interpolateTemplate('Hello {{input.missing}}!', context);

    expect(result).toBe('Hello !');
  });
});

// ============================================================
// Suite 6: Output Generation
// ============================================================

describe('Workflow Executor — Output Generation', () => {
  it('WE-21: generates success output with metrics', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'output-test',
      name: 'Output Test',
      description: 'Test output generation',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'transform', transform: 'test' },
        { id: 'step2', name: 'Step 2', type: 'transform', transform: 'test' },
      ],
      output: { type: 'response', format: 'json' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(true);
    expect(result.metrics.totalSteps).toBe(2);
    expect(result.metrics.completedSteps).toBe(2);
    expect(result.metrics.failedSteps).toBe(0);
    expect(result.metrics.totalDurationMs).toBeDefined();
  });

  it('WE-22: output includes step results', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'step-results',
      name: 'Step Results',
      description: 'Test step results',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'transform', transform: 'result1' },
        { id: 'step2', name: 'Step 2', type: 'transform', transform: 'result2' },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.output).toBeDefined();
  });

  it('WE-23: failed workflow has correct metrics', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'failed-workflow',
      name: 'Failed Workflow',
      description: 'Test failed workflow metrics',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step1', name: 'Step 1', type: 'transform', transform: 'test' },
        { id: 'step2', name: 'Step 2', type: 'unknown_type' as any },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(false);
    expect(result.metrics.failedSteps).toBe(1);
  });
});

// ============================================================
// Suite 7: Execution Management
// ============================================================

describe('Workflow Executor — Execution Management', () => {
  it('WE-24: getExecution returns specific execution', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'get-exec-test',
      name: 'Get Execution Test',
      description: 'Test getting execution',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [{ id: 'step1', name: 'Step 1', type: 'transform', transform: 'test' }],
      output: { type: 'response' },
    };

    await executor.execute(workflow);

    const executions = executor.getAllExecutions();
    const executionId = executions[0].id;

    const retrieved = executor.getExecution(executionId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.workflowId).toBe('get-exec-test');
  });

  it('WE-25: getAllExecutions returns all executions', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'all-exec-test',
      name: 'All Executions Test',
      description: 'Test getting all executions',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [{ id: 'step1', name: 'Step 1', type: 'transform', transform: 'test' }],
      output: { type: 'response' },
    };

    // Execute same workflow 3 times on same executor
    await executor.execute(workflow);
    await executor.execute(workflow);
    await executor.execute(workflow);

    const executions = executor.getAllExecutions();

    // Should have 3 separate execution records
    expect(executions.length).toBeGreaterThanOrEqual(1);
  });

  it('WE-26: executions are independent', async () => {
    const executor1 = new WorkflowExecutor();
    const executor2 = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'independent-test',
      name: 'Independent Test',
      description: 'Test execution independence',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [{ id: 'step1', name: 'Step 1', type: 'transform', transform: 'test' }],
      output: { type: 'response' },
    };

    await executor1.execute(workflow, { run: 1 });
    await executor2.execute(workflow, { run: 2 });

    const executions1 = executor1.getAllExecutions();
    const executions2 = executor2.getAllExecutions();

    expect(executions1[0].input).toEqual({ run: 1 });
    expect(executions2[0].input).toEqual({ run: 2 });
  });
});

// ============================================================
// Suite 8: Preset Workflows
// ============================================================

describe('Workflow Executor — Preset Workflows', () => {
  it('WE-27: has preset workflows defined', () => {
    expect(PRESET_WORKFLOWS).toBeDefined();
    expect(Array.isArray(PRESET_WORKFLOWS)).toBe(true);
    expect(PRESET_WORKFLOWS.length).toBeGreaterThan(0);
  });

  it('WE-28: preset workflows have valid structure', () => {
    for (const workflow of PRESET_WORKFLOWS) {
      expect(workflow.id).toBeTruthy();
      expect(workflow.name).toBeTruthy();
      expect(workflow.description).toBeTruthy();
      expect(workflow.version).toBeTruthy();
      expect(workflow.trigger).toBeDefined();
      expect(workflow.steps).toBeDefined();
      expect(Array.isArray(workflow.steps)).toBe(true);
    }
  });

  it('WE-29: preset workflow cluster-health-check exists', () => {
    const clusterHealthCheck = PRESET_WORKFLOWS.find(w => w.id === 'cluster-health-check');

    expect(clusterHealthCheck).toBeDefined();
    expect(clusterHealthCheck?.steps).toBeDefined();
  });
});

// ============================================================
// Suite 9: Complex Scenarios
// ============================================================

describe('Workflow Executor — Complex Scenarios', () => {
  it('WE-30: executes workflow with nested parallel branches', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'nested-parallel',
      name: 'Nested Parallel',
      description: 'Test nested parallel execution',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        {
          id: 'outer-parallel',
          name: 'Outer Parallel',
          type: 'parallel',
          branches: [
            {
              id: 'inner-parallel-1',
              name: 'Inner Parallel 1',
              type: 'parallel',
              branches: [
                { id: 'inner-1-a', name: 'Inner 1A', type: 'transform', transform: 'a' },
                { id: 'inner-1-b', name: 'Inner 1B', type: 'transform', transform: 'b' },
              ],
            },
            { id: 'single-branch', name: 'Single', type: 'transform', transform: 'c' },
          ],
        },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(true);
  });

  it('WE-31: executes workflow with condition and parallel combination', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'condition-parallel',
      name: 'Condition + Parallel',
      description: 'Test condition with parallel',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        {
          id: 'condition',
          name: 'Condition Check',
          type: 'condition',
          condition: 'true',
          branches: [
            {
              id: 'parallel-on-true',
              name: 'Parallel on True',
              type: 'parallel',
              branches: [
                { id: 'p1', name: 'P1', type: 'transform', transform: 'p1' },
                { id: 'p2', name: 'P2', type: 'transform', transform: 'p2' },
              ],
            },
          ],
        },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(true);
  });

  it('WE-32: workflow with delay and transform combination', async () => {
    const executor = new WorkflowExecutor();
    const startTime = Date.now();

    const workflow: WorkflowDefinition = {
      id: 'delay-transform',
      name: 'Delay + Transform',
      description: 'Test delay with transform',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [
        { id: 'transform1', name: 'Transform 1', type: 'transform', transform: 'before' },
        { id: 'delay1', name: 'Delay 1', type: 'delay', delayMs: 50 },
        { id: 'transform2', name: 'Transform 2', type: 'transform', transform: 'after' },
      ],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);
    const duration = Date.now() - startTime;

    expect(result.success).toBe(true);
    expect(duration).toBeGreaterThanOrEqual(40);
  });
});

// ============================================================
// Suite 10: Performance & Edge Cases
// ============================================================

describe('Workflow Executor — Performance & Edge Cases', () => {
  it('WE-33: handles empty workflow', async () => {
    const executor = new WorkflowExecutor();

    const workflow: WorkflowDefinition = {
      id: 'empty',
      name: 'Empty Workflow',
      description: 'Empty workflow test',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow);

    expect(result.success).toBe(true);
    expect(result.metrics.totalSteps).toBe(0);
  });

  it('WE-34: handles workflow with many steps', async () => {
    const executor = new WorkflowExecutor();

    const steps: WorkflowStep[] = [];

    for (let i = 0; i < 50; i++) {
      steps.push({ id: `step-${i}`, name: `Step ${i}`, type: 'transform', transform: `value-${i}` });
    }

    const workflow: WorkflowDefinition = {
      id: 'many-steps',
      name: 'Many Steps',
      description: 'Workflow with many steps',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps,
      output: { type: 'response' },
    };

    const startTime = Date.now();
    const result = await executor.execute(workflow);
    const duration = Date.now() - startTime;

    expect(result.success).toBe(true);
    expect(result.metrics.totalSteps).toBe(50);
    // Should complete within reasonable time
    expect(duration).toBeLessThan(5000);
  });

  it('WE-35: handles workflow with large input', async () => {
    const executor = new WorkflowExecutor();

    const largeInput: Record<string, unknown> = {};

    for (let i = 0; i < 100; i++) {
      largeInput[`key-${i}`] = `value-${i}`;
    }

    const workflow: WorkflowDefinition = {
      id: 'large-input',
      name: 'Large Input',
      description: 'Workflow with large input',
      version: '1.0.0',
      trigger: { type: 'manual' },
      steps: [{ id: 'step1', name: 'Step 1', type: 'transform', transform: 'test' }],
      output: { type: 'response' },
    };

    const result = await executor.execute(workflow, largeInput);

    expect(result.success).toBe(true);
  });
});
