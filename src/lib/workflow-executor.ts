/**
 * @file YYC³ Family-π³ Workflow Executor
 * @description 工作流执行引擎 - 支持多步骤任务编排
 * @author YYC³ Team
 * @version 1.0.0
 *
 * 功能:
 * - 工作流定义与解析
 * - 多步骤任务编排
 * - 并行执行支持
 * - 条件分支支持
 * - LLM调用集成
 * - MCP工具调用集成
 * - 执行状态追踪
 */

import { executeMCPCall } from './mcp-protocol';
import { getBestModelForAgent, type EnhancedModelConfig } from './model-config';

// ============================================================
// Types
// ============================================================

export type WorkflowTriggerType = 'manual' | 'schedule' | 'event' | 'webhook';
export type WorkflowStepType = 'llm_call' | 'mcp_tool' | 'parallel' | 'condition' | 'transform' | 'delay';
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  cron?: string;
  event?: string;
  webhook?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  agent?: string;
  prompt?: string;
  server?: string;
  tool?: string;
  arguments?: Record<string, unknown>;
  branches?: WorkflowStep[];
  condition?: string;
  transform?: string;
  delayMs?: number;
  timeout?: number;
  retryCount?: number;
  onError?: 'continue' | 'stop' | 'retry';
}

export interface WorkflowOutput {
  type: 'response' | 'notification' | 'webhook';
  format?: 'json' | 'markdown' | 'text';
  channels?: string[];
  webhook?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  output: WorkflowOutput;
  metadata?: {
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  startTime: number;
  endTime?: number;
  input: Record<string, unknown>;
  context: WorkflowContext;
  result?: WorkflowResult;
  error?: string;
}

export interface WorkflowContext {
  input: Record<string, unknown>;
  steps: Record<string, StepResult>;
  variables: Record<string, unknown>;
}

export interface StepResult {
  id: string;
  status: 'success' | 'failed' | 'skipped';
  startTime: number;
  endTime: number;
  output: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowResult {
  success: boolean;
  output: unknown;
  metrics: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    totalDurationMs: number;
    tokenUsage?: {
      input: number;
      output: number;
      total: number;
    };
  };
}

// ============================================================
// Workflow Executor
// ============================================================

export class WorkflowExecutor {
  private executions = new Map<string, WorkflowExecution>();

  async execute(
    workflow: WorkflowDefinition,
    input: Record<string, unknown> = {},
  ): Promise<WorkflowResult> {
    const executionId = `${workflow.id}-${Date.now()}`;
    const context: WorkflowContext = {
      input,
      steps: {},
      variables: { ...input },
    };

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      status: 'running',
      startTime: Date.now(),
      input,
      context,
    };

    this.executions.set(executionId, execution);

    try {
      for (const step of workflow.steps) {
        const stepResult = await this.executeStep(step, context);

        context.steps[step.id] = stepResult;

        if (stepResult.status === 'failed' && this.shouldStopOnError(step)) {
          throw new Error(`Step ${step.id} failed: ${stepResult.error}`);
        }
      }

      const result = this.generateOutput(workflow, context);

      execution.status = 'completed';
      execution.endTime = Date.now();
      execution.result = result;

      return result;
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = Date.now();
      execution.error = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        output: null,
        metrics: {
          totalSteps: workflow.steps.length,
          completedSteps: Object.keys(context.steps).length,
          failedSteps: 1,
          totalDurationMs: execution.endTime - execution.startTime,
        },
      };
    }
  }

  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<StepResult> {
    const startTime = Date.now();

    try {
      let output: unknown;

      switch (step.type) {
        case 'llm_call':
          output = await this.executeLLMCall(step, context);
          break;
        case 'mcp_tool':
          output = await this.executeMCPTool(step, context);
          break;
        case 'parallel':
          output = await this.executeParallel(step, context);
          break;
        case 'condition':
          output = await this.executeCondition(step, context);
          break;
        case 'transform':
          output = this.executeTransform(step, context);
          break;
        case 'delay':
          output = await this.executeDelay(step);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      return {
        id: step.id,
        status: 'success',
        startTime,
        endTime: Date.now(),
        output,
      };
    } catch (error) {
      return {
        id: step.id,
        status: 'failed',
        startTime,
        endTime: Date.now(),
        output: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async executeLLMCall(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<unknown> {
    if (!step.agent) {
      throw new Error('LLM call step requires agent specification');
    }

    const model = getBestModelForAgent(step.agent);

    if (!model) {
      throw new Error(`No model available for agent: ${step.agent}`);
    }

    const prompt = this.interpolateTemplate(step.prompt || '', context);

    // 模拟LLM调用 - 实际实现需要集成真实的LLM API
    const response = await this.mockLLMCall(model, prompt, step.agent);

    return {
      agent: step.agent,
      model: model.name,
      prompt,
      response,
      timestamp: Date.now(),
    };
  }

  private async mockLLMCall(
    model: EnhancedModelConfig,
    prompt: string,
    agent: string,
  ): Promise<string> {
    // 模拟延迟
    const latency = model.performance?.avgLatencyMs || 3000;

    await new Promise(resolve => setTimeout(resolve, Math.min(latency, 1000)));

    // 返回模拟响应
    return `[${agent}@${model.name}] 处理完成: ${prompt.slice(0, 100)}...`;
  }

  private async executeMCPTool(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<unknown> {
    if (!step.server || !step.tool) {
      throw new Error('MCP tool step requires server and tool specification');
    }

    const args = this.interpolateObject(step.arguments || {}, context);

    // 调用MCP工具
    const result = await executeMCPCall(step.server, 'tools/call', {
      name: step.tool,
      arguments: args,
    });

    return result;
  }

  private async executeParallel(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<unknown> {
    if (!step.branches || step.branches.length === 0) {
      throw new Error('Parallel step requires branches');
    }

    const results = await Promise.all(
      step.branches.map(branch => this.executeStep(branch, context)),
    );

    return {
      branches: results,
      completedAt: Date.now(),
    };
  }

  private async executeCondition(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<unknown> {
    if (!step.condition) {
      throw new Error('Condition step requires condition expression');
    }

    const conditionResult = this.evaluateCondition(step.condition, context);

    if (conditionResult && step.branches && step.branches.length > 0) {
      return this.executeStep(step.branches[0], context);
    } if (!conditionResult && step.branches && step.branches.length > 1) {
      return this.executeStep(step.branches[1], context);
    }

    return { conditionMet: conditionResult };
  }

  private executeTransform(
    step: WorkflowStep,
    context: WorkflowContext,
  ): unknown {
    if (!step.transform) {
      throw new Error('Transform step requires transform expression');
    }

    // 简单的变换表达式支持
    const transform = step.transform;
    const variables = context.variables;

    // 支持 JSONPath 风格的路径
    if (transform.startsWith('$.')) {
      const path = transform.slice(2);
      const parts = path.split('.');
      let value: unknown = variables;

      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = (value as Record<string, unknown>)[part];
        } else {
          return null;
        }
      }

      return value;
    }

    return transform;
  }

  private async executeDelay(step: WorkflowStep): Promise<unknown> {
    const delayMs = step.delayMs || 1000;

    await new Promise(resolve => setTimeout(resolve, delayMs));

    return { delayed: delayMs };
  }

  private interpolateTemplate(template: string, context: WorkflowContext): string {
    let result = template;

    // 替换 {{input.xxx}} 格式
    result = result.replace(/\{\{input\.(\w+)\}\}/g, (_, key) => {
      return String(context.input[key] ?? '');
    });

    // 替换 {{steps.xxx.output}} 格式
    result = result.replace(/\{\{steps\.(\w+)\.(\w+)\}\}/g, (_, stepId, field) => {
      const step = context.steps[stepId];

      if (step && typeof step.output === 'object' && step.output !== null) {
        return String((step.output as Record<string, unknown>)[field] ?? '');
      }

      return '';
    });

    // 替换 {{variables.xxx}} 格式
    result = result.replace(/\{\{variables\.(\w+)\}\}/g, (_, key) => {
      return String(context.variables[key] ?? '');
    });

    return result;
  }

  private interpolateObject(obj: Record<string, unknown>, context: WorkflowContext): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = this.interpolateTemplate(value, context);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.interpolateObject(value as Record<string, unknown>, context);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private evaluateCondition(condition: string, context: WorkflowContext): boolean {
    // 简单的条件评估
    // 支持: {{steps.xxx.status}} === 'success'
    const match = condition.match(/\{\{(\w+)\.(\w+)\.(\w+)\}\}\s*(===|!==|==|!=)\s*['"](\w+)['"]/);

    if (match) {
      const [, scope, id, field, operator, value] = match;
      let actualValue: unknown;

      if (scope === 'steps') {
        actualValue = context.steps[id]?.[field as keyof StepResult];
      } else if (scope === 'variables') {
        actualValue = context.variables[id];
      } else {
        return false;
      }

      switch (operator) {
        case '===':
        case '==':
          return actualValue === value;
        case '!==':
        case '!=':
          return actualValue !== value;
        default:
          return false;
      }
    }

    return false;
  }

  private shouldStopOnError(step: WorkflowStep): boolean {
    return step.onError !== 'continue';
  }

  private generateOutput(workflow: WorkflowDefinition, context: WorkflowContext): WorkflowResult {
    const steps = Object.values(context.steps);
    const completedSteps = steps.filter(s => s.status === 'success').length;
    const failedSteps = steps.filter(s => s.status === 'failed').length;

    return {
      success: failedSteps === 0,
      output: context.steps,
      metrics: {
        totalSteps: workflow.steps.length,
        completedSteps,
        failedSteps,
        totalDurationMs: steps.reduce((sum, s) => sum + (s.endTime - s.startTime), 0),
      },
    };
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }
}

// ============================================================
// Preset Workflows
// ============================================================

export const PRESET_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'cluster-health-check',
    name: '集群健康检查',
    description: '定期检查所有节点健康状态',
    version: '1.0.0',
    trigger: {
      type: 'schedule',
      cron: '0 */6 * * *',
    },
    steps: [
      {
        id: 'check_nodes',
        name: '检查节点状态',
        type: 'parallel',
        branches: [
          {
            id: 'check_m4_max',
            name: '检查 M4 Max',
            type: 'mcp_tool',
            server: 'mcp-yyc3-cluster',
            tool: 'system_diagnostics',
            arguments: { node: 'm4-max' },
          },
          {
            id: 'check_imac',
            name: '检查 iMac M4',
            type: 'mcp_tool',
            server: 'mcp-yyc3-cluster',
            tool: 'system_diagnostics',
            arguments: { node: 'imac-m4' },
          },
          {
            id: 'check_nas',
            name: '检查 NAS',
            type: 'mcp_tool',
            server: 'mcp-yyc3-cluster',
            tool: 'system_diagnostics',
            arguments: { node: 'yanyucloud' },
          },
        ],
      },
      {
        id: 'analyze_results',
        name: '分析结果',
        type: 'llm_call',
        agent: 'prophet',
        prompt: '分析以下集群健康数据，给出风险评估：{{steps.check_nodes.output}}',
      },
      {
        id: 'generate_report',
        name: '生成报告',
        type: 'mcp_tool',
        server: 'mcp-yyc3-cluster',
        tool: 'cluster_status',
        arguments: { format: 'markdown' },
      },
    ],
    output: {
      type: 'notification',
      channels: ['console', 'log'],
    },
    metadata: {
      author: 'YYC³ Team',
      tags: ['cluster', 'health', 'monitoring'],
    },
  },
  {
    id: 'agent-collaboration',
    name: 'Agent协作分析',
    description: '多Agent协作完成复杂任务',
    version: '1.0.0',
    trigger: {
      type: 'manual',
    },
    steps: [
      {
        id: 'understand_task',
        name: '理解任务',
        type: 'llm_call',
        agent: 'pivot',
        prompt: '理解并分解任务：{{input.task}}',
      },
      {
        id: 'route_to_specialists',
        name: '分发到专家',
        type: 'parallel',
        branches: [
          {
            id: 'analysis',
            name: '深度分析',
            type: 'llm_call',
            agent: 'thinker',
            prompt: '深度分析：{{steps.understand_task.output}}',
          },
          {
            id: 'prediction',
            name: '风险预测',
            type: 'llm_call',
            agent: 'prophet',
            prompt: '预测风险：{{steps.understand_task.output}}',
          },
          {
            id: 'security',
            name: '安全审计',
            type: 'llm_call',
            agent: 'sentinel',
            prompt: '安全审计：{{steps.understand_task.output}}',
          },
        ],
      },
      {
        id: 'synthesize',
        name: '综合建议',
        type: 'llm_call',
        agent: 'navigator',
        prompt: `综合以下专家意见，给出最终建议：
- 分析结果：{{steps.route_to_specialists.branches[0].output}}
- 风险预测：{{steps.route_to_specialists.branches[1].output}}
- 安全建议：{{steps.route_to_specialists.branches[2].output}}`,
      },
    ],
    output: {
      type: 'response',
      format: 'json',
    },
    metadata: {
      author: 'YYC³ Team',
      tags: ['agent', 'collaboration', 'analysis'],
    },
  },
  {
    id: 'model-evaluation',
    name: '模型评估工作流',
    description: '评估模型性能并生成报告',
    version: '1.0.0',
    trigger: {
      type: 'manual',
    },
    steps: [
      {
        id: 'select_models',
        name: '选择待评估模型',
        type: 'transform',
        transform: '$.models',
      },
      {
        id: 'run_benchmarks',
        name: '运行基准测试',
        type: 'parallel',
        branches: [
          {
            id: 'latency_test',
            name: '延迟测试',
            type: 'llm_call',
            agent: 'bole',
            prompt: '测试模型响应延迟',
          },
          {
            id: 'quality_test',
            name: '质量测试',
            type: 'llm_call',
            agent: 'bole',
            prompt: '评估模型输出质量',
          },
        ],
      },
      {
        id: 'generate_report',
        name: '生成评估报告',
        type: 'llm_call',
        agent: 'grandmaster',
        prompt: '基于测试结果生成模型评估报告：{{steps.run_benchmarks.output}}',
      },
    ],
    output: {
      type: 'response',
      format: 'markdown',
    },
    metadata: {
      author: 'YYC³ Team',
      tags: ['model', 'evaluation', 'benchmark'],
    },
  },
];

// ============================================================
// Singleton Instance
// ============================================================

export const workflowExecutor = new WorkflowExecutor();

// ============================================================
// Helper Functions
// ============================================================

export function createCustomWorkflow(
  id: string,
  name: string,
  steps: WorkflowStep[],
): WorkflowDefinition {
  return {
    id,
    name,
    description: '自定义工作流',
    version: '1.0.0',
    trigger: { type: 'manual' },
    steps,
    output: { type: 'response', format: 'json' },
  };
}

export function runWorkflow(
  workflowId: string,
  input: Record<string, unknown> = {},
): Promise<WorkflowResult> {
  const workflow = PRESET_WORKFLOWS.find(w => w.id === workflowId);

  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowId}`);
  }

  return workflowExecutor.execute(workflow, input);
}
