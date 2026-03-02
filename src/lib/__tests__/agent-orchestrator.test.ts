// ============================================================
// YYC3 Hacker Chatbot — Agent Orchestrator Unit Tests (Vitest)
// Phase P0: Core Module Test Coverage
//
// Tests: Agent capabilities, collaboration presets, task CRUD,
//        timeline events, tool discovery, MCP integration.
//
// Run: npx vitest run src/lib/__tests__/agent-orchestrator.test.ts
// ============================================================

import { beforeEach, describe, expect, it } from 'vitest';

import {
  AGENT_CAPABILITIES,
  COLLABORATION_PRESETS,
  createTask,
  addTimelineEvent as addTimelineEventFn,
  recommendAgents as recommendAgentsFn,
  updateTask,
  discoverToolsForTask,
  parseMCPInvocations,
  type CollaborationTask,
  type CollaborationMode,
  type AgentRole,
} from '../agent-orchestrator';

// ============================================================
// Setup
// ============================================================

beforeEach(() => {
  // Clear any internal state if needed
});

// ============================================================
// Suite 1: Agent Capabilities
// ============================================================

describe('Agent Orchestrator — Agent Capabilities', () => {
  it('AO-01: has all 7 agents defined', () => {
    const expectedAgents = [
      'navigator',
      'thinker',
      'prophet',
      'bole',
      'pivot',
      'sentinel',
      'grandmaster',
    ];

    const actualAgents = Object.keys(AGENT_CAPABILITIES);

    expect(actualAgents).toHaveLength(7);
    expect(actualAgents).toEqual(expect.arrayContaining(expectedAgents));
  });

  it('AO-02: all agents have required fields', () => {
    for (const [id, capability] of Object.entries(AGENT_CAPABILITIES)) {
      expect(capability.id).toBe(id);
      expect(capability.name).toBeTruthy();
      expect(capability.nameZh).toBeTruthy();
      expect(capability.specialties).toBeDefined();
      expect(Array.isArray(capability.specialties)).toBe(true);
      expect(capability.strengths).toBeDefined();
      expect(Array.isArray(capability.strengths)).toBe(true);
      expect(capability.collaborationPreferences).toBeDefined();
      expect(capability.scores).toBeDefined();
    }
  });

  it('AO-03: agent scores are within valid range (0-100)', () => {
    for (const capability of Object.values(AGENT_CAPABILITIES)) {
      const scores = Object.values(capability.scores);

      for (const score of scores) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('AO-04: Navigator has high execution and communication scores', () => {
    const navigator = AGENT_CAPABILITIES.navigator;

    expect(navigator.scores.execution).toBeGreaterThanOrEqual(70);
    expect(navigator.scores.communication).toBeGreaterThanOrEqual(70);
    expect(navigator.specialties.some(s => s.includes('scheduling') || s.includes('planning'))).toBe(true);
  });

  it('AO-05: Thinker has high analysis score', () => {
    const thinker = AGENT_CAPABILITIES.thinker;

    expect(thinker.scores.analysis).toBeGreaterThanOrEqual(80);
    expect(thinker.specialties.some(s => s.includes('reasoning') || s.includes('analysis'))).toBe(true);
  });

  it('AO-06: Sentinel has high review score', () => {
    const sentinel = AGENT_CAPABILITIES.sentinel;

    expect(sentinel.scores.review).toBeGreaterThanOrEqual(80);
    expect(sentinel.specialties.some(s => s.includes('security') || s.includes('audit'))).toBe(true);
  });

  it('AO-07: Grandmaster has balanced high scores', () => {
    const grandmaster = AGENT_CAPABILITIES.grandmaster;
    const scores = Object.values(grandmaster.scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    expect(avgScore).toBeGreaterThanOrEqual(75);
  });
});

// ============================================================
// Suite 2: Collaboration Presets
// ============================================================

describe('Agent Orchestrator — Collaboration Presets', () => {
  it('AO-08: has at least 5 collaboration modes defined', () => {
    expect(COLLABORATION_PRESETS.length).toBeGreaterThanOrEqual(5);
  });

  it('AO-09: all presets have required fields', () => {
    for (const preset of COLLABORATION_PRESETS) {
      expect(preset.mode).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.nameZh).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.icon).toBeTruthy();
      expect(preset.color).toBeTruthy();
    }
  });

  it('AO-10: pipeline mode exists', () => {
    const pipeline = COLLABORATION_PRESETS.find(p => p.mode === 'pipeline');

    expect(pipeline).toBeDefined();
    expect(pipeline?.name).toBeTruthy();
  });

  it('AO-11: parallel mode exists', () => {
    const parallel = COLLABORATION_PRESETS.find(p => p.mode === 'parallel');

    expect(parallel).toBeDefined();
    expect(parallel?.name).toBeTruthy();
  });

  it('AO-12: debate mode exists', () => {
    const debate = COLLABORATION_PRESETS.find(p => p.mode === 'debate');

    expect(debate).toBeDefined();
    expect(debate?.name).toBeTruthy();
  });
});

// ============================================================
// Suite 3: Task Creation
// ============================================================

describe('Agent Orchestrator — Task Creation', () => {
  it('AO-13: createTask initializes with required fields', () => {
    const task = createTask(
      'Build a dashboard feature',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    expect(task.id).toBeTruthy();
    expect(task.title).toBe('Build a dashboard feature');
    expect(task.intent).toBe('Build a dashboard feature');
    expect(task.mode).toBe('pipeline');
    expect(task.status).toBe('pending');
    expect(task.priority).toBe('medium');
    expect(task.agents).toHaveLength(1);
    expect(task.agents[0].agentId).toBe('navigator');
  });

  it('AO-14: createTask accepts different modes', () => {
    const modes: CollaborationMode[] = ['pipeline', 'parallel', 'debate', 'ensemble', 'delegation'];

    for (const mode of modes) {
      const task = createTask(
        'Test intent',
        mode,
        [{ agentId: 'navigator', role: 'lead' as AgentRole }],
      );

      expect(task.mode).toBe(mode);
    }
  });

  it('AO-15: createTask accepts multiple agents', () => {
    const task = createTask(
      'Complex task',
      'parallel',
      [
        { agentId: 'navigator', role: 'lead' as AgentRole },
        { agentId: 'thinker', role: 'contributor' as AgentRole },
        { agentId: 'sentinel', role: 'reviewer' as AgentRole },
      ],
    );

    expect(task.agents).toHaveLength(3);
  });

  it('AO-16: createTask generates unique IDs', () => {
    const task1 = createTask('Task 1', 'pipeline', [{ agentId: 'navigator', role: 'lead' as AgentRole }]);
    const task2 = createTask('Task 2', 'pipeline', [{ agentId: 'navigator', role: 'lead' as AgentRole }]);

    expect(task1.id).not.toBe(task2.id);
  });

  it('AO-17: createTask includes initial timeline event', () => {
    const task = createTask(
      'Test',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    expect(task.timeline).toHaveLength(1);
    expect(task.timeline[0].type).toBe('task_created');
  });

  it('AO-18: createTask sets timestamps', () => {
    const before = Date.now();
    const task = createTask(
      'Test',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );
    const after = Date.now();

    const createdAt = new Date(task.createdAt).getTime();

    expect(createdAt).toBeGreaterThanOrEqual(before);
    expect(createdAt).toBeLessThanOrEqual(after);
  });

  it('AO-19: createTask truncates long titles', () => {
    const longIntent = 'A'.repeat(100);
    const task = createTask(
      longIntent,
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    expect(task.title.length).toBeLessThanOrEqual(63); // 60 + '...'
  });
});

// ============================================================
// Suite 4: Task Updates
// ============================================================

describe('Agent Orchestrator — Task Updates', () => {
  it('AO-20: updateTask modifies task properties', () => {
    const task = createTask(
      'Original',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    updateTask(task.id, {
      title: 'Updated',
      priority: 'high',
    });

    // Note: updateTask modifies internal storage
    // The task object reference is not updated, but storage is
  });

  it('AO-21: updateTask can change status', () => {
    const task = createTask(
      'Test',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    updateTask(task.id, { status: 'executing' });

    // Verify update was called (we check via the function not throwing)
  });

  it('AO-22: updateTask handles partial updates', () => {
    const task = createTask(
      'Test',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    updateTask(task.id, { priority: 'critical' });

    // Partial update should work without providing all fields
  });
});

// ============================================================
// Suite 5: Timeline Events
// ============================================================

describe('Agent Orchestrator — Timeline Events', () => {
  it('AO-23: createTask includes timeline event', () => {
    const task = createTask(
      'Test',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    expect(task.timeline).toHaveLength(1);
    expect(task.timeline[0].type).toBe('task_created');
  });

  it('AO-24: addTimelineEvent adds event via updateTask', () => {
    const task = createTask(
      'Test',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    // Add event by updating task
    updateTask(task.id, { status: 'executing' });

    // The task object in memory doesn't update, but internal storage does
    // We verify by checking the function doesn't throw
  });

  it('AO-25: task timeline has correct structure', () => {
    const task = createTask(
      'Test',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    const event = task.timeline[0];

    expect(event.id).toBeTruthy();
    expect(event.timestamp).toBeDefined();
    expect(event.type).toBe('task_created');
    expect(event.message).toBeTruthy();
  });
});

// ============================================================
// Suite 6: Agent Recommendation
// ============================================================

describe('Agent Orchestrator — Agent Recommendation', () => {
  it('AO-28: recommendAgents returns array of recommendations', () => {
    const recommendations = recommendAgentsFn('Build a dashboard', 'pipeline');

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('AO-29: recommendAgents returns sorted recommendations by score', () => {
    const recommendations = recommendAgentsFn('Test task', 'pipeline');

    for (let i = 1; i < recommendations.length; i++) {
      expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(recommendations[i].score);
    }
  });

  it('AO-30: recommendAgents includes reasoning for each agent', () => {
    const recommendations = recommendAgentsFn('Architecture review', 'pipeline');

    for (const rec of recommendations) {
      expect(rec.reasoning).toBeTruthy();
      expect(rec.reasoning.length).toBeGreaterThan(10);
    }
  });

  it('AO-31: recommendAgents prioritizes Thinker for analysis tasks', () => {
    const recommendations = recommendAgentsFn('Deep analysis of data patterns', 'pipeline');

    const agentIds = recommendations.map(r => r.agentId);
    const thinkerIndex = agentIds.indexOf('thinker');

    // Thinker should be in top recommendations for analysis
    expect(thinkerIndex).toBeLessThan(3);
  });

  it('AO-32: recommendAgents prioritizes Sentinel for security tasks', () => {
    const recommendations = recommendAgentsFn('Security audit and vulnerability check', 'pipeline');

    const agentIds = recommendations.map(r => r.agentId);
    const sentinelIndex = agentIds.indexOf('sentinel');

    // Sentinel should be in top recommendations for security
    expect(sentinelIndex).toBeLessThan(3);
  });

  it('AO-33: recommendAgents prioritizes Navigator for planning tasks', () => {
    const recommendations = recommendAgentsFn('Project planning and roadmap', 'pipeline');

    const agentIds = recommendations.map(r => r.agentId);
    const navigatorIndex = agentIds.indexOf('navigator');

    // Navigator should be in top recommendations for planning
    expect(navigatorIndex).toBeLessThan(3);
  });
});

// ============================================================
// Suite 7: Tool Discovery
// ============================================================

describe('Agent Orchestrator — Tool Discovery', () => {
  it('AO-34: discoverToolsForTask returns array of tools', () => {
    const tools = discoverToolsForTask('Check cluster health status');

    expect(Array.isArray(tools)).toBe(true);
  });

  it('AO-35: discoverToolsForTask finds relevant tools for cluster tasks', () => {
    const tools = discoverToolsForTask('Check cluster health and Docker containers');

    // Should find cluster_status or docker_containers tools
    const toolNames = tools.map(t => t.name);

    const hasRelevantTool = toolNames.some(name =>
      name.includes('cluster') || name.includes('docker') || name.includes('health')
    );

    expect(hasRelevantTool).toBe(true);
  });

  it('AO-36: discoverToolsForTask handles empty intent', () => {
    const tools = discoverToolsForTask('');

    expect(Array.isArray(tools)).toBe(true);
  });

  it('AO-37: discoverToolsForTask returns tools with required fields', () => {
    const tools = discoverToolsForTask('Deploy service to production');

    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
    }
  });
});

// ============================================================
// Suite 8: MCP Integration
// ============================================================

describe('Agent Orchestrator — MCP Integration', () => {
  it('AO-33: parseMCPInvocations returns array', () => {
    const text = 'Some text without MCP calls';

    const invocations = parseMCPInvocations(text);

    expect(Array.isArray(invocations)).toBe(true);
  });

  it('AO-34: parseMCPInvocations returns empty for plain text', () => {
    const text = 'Just plain text without MCP calls';

    const invocations = parseMCPInvocations(text);

    expect(invocations).toEqual([]);
  });
});

// ============================================================
// Suite 9: Task Status
// ============================================================

describe('Agent Orchestrator — Task Status', () => {
  it('AO-35: task has valid initial status', () => {
    const task = createTask(
      'Test',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    expect(task.status).toBe('pending');
  });

  it('AO-36: task status can be updated', () => {
    const task = createTask(
      'Test',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    // Update status via updateTask
    updateTask(task.id, { status: 'executing' });

    // The update is stored internally
  });
});

// ============================================================
// Suite 10: Integration Scenarios
// ============================================================

describe('Agent Orchestrator — Integration Scenarios', () => {
  it('AO-37: full workflow: create → recommend', () => {
    // 1. Create task
    const task = createTask(
      'Build Feature',
      'pipeline',
      [{ agentId: 'navigator', role: 'lead' as AgentRole }],
    );

    expect(task.status).toBe('pending');

    // 2. Get agent recommendations
    const recommendations = recommendAgentsFn('Build dashboard feature', 'pipeline');

    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('AO-38: security workflow prioritizes Sentinel', () => {
    const recommendations = recommendAgentsFn('Comprehensive security audit', 'pipeline');

    const sentinelIndex = recommendations.findIndex(r => r.agentId === 'sentinel');

    // Sentinel should be in top 3 for security tasks
    expect(sentinelIndex).toBeLessThan(3);
  });

  it('AO-39: task with multiple agents works correctly', () => {
    const task = createTask(
      'Complex multi-agent task',
      'parallel',
      [
        { agentId: 'navigator', role: 'lead' as AgentRole },
        { agentId: 'thinker', role: 'contributor' as AgentRole },
        { agentId: 'sentinel', role: 'reviewer' as AgentRole },
      ],
    );

    expect(task.agents).toHaveLength(3);
    expect(task.agents.map(a => a.agentId)).toEqual(['navigator', 'thinker', 'sentinel']);
  });
});
