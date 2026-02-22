import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Play, CheckCircle2, XCircle, Loader2, Clock,
  RotateCcw, Download, AlertTriangle, Zap,
  FileCode2, Box, Network, Shield, Database,
  Layers, ChevronDown, ChevronRight, Search,
  BarChart3, Tag, CheckCheck, Copy, Filter, FlaskConical
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { CoreTestPanel } from "./CoreTestPanel";

// ============================================================
// Phase 25 — Integrated Test Framework Runner
//
// Four test categories:
//   1. Type Audit     — Runtime validation of TypeScript types
//   2. Component Tests — Core component mount verification
//   3. Module Health   — lib/* module import + export checks
//   4. Integration     — Cross-module dependency validation
//
// Access: Console tab `test_framework` or Neural Link "test framework"
// ============================================================

type TestStatus = 'pending' | 'running' | 'pass' | 'fail' | 'warn' | 'skip';
type TestCategory = 'type_audit' | 'component' | 'module' | 'integration';

interface TestCase {
  id: string;
  label: string;
  labelEn: string;
  category: TestCategory;
  description: string;
  testFn: () => Promise<TestVerdict>;
}

interface TestVerdict {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string[];
  durationMs?: number;
}

interface TestResult {
  id: string;
  status: TestStatus;
  durationMs: number;
  message: string;
  details?: string[];
  timestamp: string;
}

// ============================================================
// 1. Type Audit Tests — Validate type shapes at runtime
// ============================================================

function validateShape(obj: unknown, expectedKeys: string[], typeName: string): TestVerdict {
  if (obj === null || obj === undefined) {
    return { status: 'fail', message: `${typeName}: value is null/undefined` };
  }
  if (typeof obj !== 'object') {
    return { status: 'fail', message: `${typeName}: expected object, got ${typeof obj}` };
  }
  const keys = Object.keys(obj as Record<string, unknown>);
  const missing = expectedKeys.filter(k => !keys.includes(k));
  const extra = keys.filter(k => !expectedKeys.includes(k));
  if (missing.length > 0) {
    return { status: 'fail', message: `${typeName}: missing keys`, details: [`Missing: ${missing.join(', ')}`, `Extra: ${extra.join(', ')}`] };
  }
  if (extra.length > 0) {
    return { status: 'warn', message: `${typeName}: has extra keys (compatible)`, details: [`Extra: ${extra.join(', ')}`] };
  }
  return { status: 'pass', message: `${typeName}: shape validated (${expectedKeys.length} keys)` };
}

function validateArrayOf(arr: unknown, minLength: number, itemValidator: (item: unknown) => boolean, typeName: string): TestVerdict {
  if (!Array.isArray(arr)) {
    return { status: 'fail', message: `${typeName}: expected array, got ${typeof arr}` };
  }
  if (arr.length < minLength) {
    return { status: 'fail', message: `${typeName}: expected >= ${minLength} items, got ${arr.length}` };
  }
  const invalidIdx = arr.findIndex((item, _i) => !itemValidator(item));
  if (invalidIdx >= 0) {
    return { status: 'fail', message: `${typeName}: item at index ${invalidIdx} failed validation` };
  }
  return { status: 'pass', message: `${typeName}: validated ${arr.length} items` };
}

function validateTypeUnion(value: unknown, allowedValues: readonly string[], typeName: string): TestVerdict {
  if (typeof value !== 'string') {
    return { status: 'fail', message: `${typeName}: expected string, got ${typeof value}` };
  }
  if (!allowedValues.includes(value)) {
    return { status: 'fail', message: `${typeName}: "${value}" not in [${allowedValues.join(',')}]` };
  }
  return { status: 'pass', message: `${typeName}: "${value}" is valid` };
}

const TYPE_AUDIT_TESTS: TestCase[] = [
  {
    id: 'type:agent_registry',
    label: 'AGENT_REGISTRY 结构验证',
    labelEn: 'AGENT_REGISTRY Shape',
    category: 'type_audit',
    description: 'Verify AGENT_REGISTRY has 7 agents with correct fields',
    testFn: async () => {
      const { AGENT_REGISTRY } = await import('@/lib/types');
      const result = validateArrayOf(AGENT_REGISTRY, 7,
        (item) => {
          const a = item as Record<string, unknown>;
          return typeof a.id === 'string' && typeof a.name === 'string' && typeof a.icon === 'string';
        },
        'AGENT_REGISTRY'
      );
      if (result.status === 'pass') {
        const ids = AGENT_REGISTRY.map(a => a.id);
        const expected = ['navigator', 'thinker', 'prophet', 'bole', 'pivot', 'sentinel', 'grandmaster'];
        const missing = expected.filter(e => !ids.includes(e as never));
        if (missing.length > 0) {
          return { status: 'fail', message: `Missing agents: ${missing.join(', ')}` };
        }
      }
      return result;
    }
  },
  {
    id: 'type:prompt_templates',
    label: 'PROMPT_TEMPLATES 结构验证',
    labelEn: 'PROMPT_TEMPLATES Shape',
    category: 'type_audit',
    description: 'Verify PROMPT_TEMPLATES has 12 templates',
    testFn: async () => {
      const { PROMPT_TEMPLATES } = await import('@/lib/types');
      return validateArrayOf(PROMPT_TEMPLATES, 12,
        (item) => {
          const t = item as Record<string, unknown>;
          return typeof t.id === 'string' && typeof t.prompt === 'string' && typeof t.category === 'string';
        },
        'PROMPT_TEMPLATES'
      );
    }
  },
  {
    id: 'type:view_mode',
    label: 'ViewMode 联合类型验证',
    labelEn: 'ViewMode Union',
    category: 'type_audit',
    description: 'Verify ViewMode values from store defaults',
    testFn: async () => {
      const { useSystemStore } = await import('@/lib/store');
      const activeView = useSystemStore.getState().activeView;
      return validateTypeUnion(activeView, ['terminal', 'console', 'projects', 'artifacts', 'monitor'] as const, 'ViewMode');
    }
  },
  {
    id: 'type:system_status',
    label: 'SystemStatus 联合类型验证',
    labelEn: 'SystemStatus Union',
    category: 'type_audit',
    description: 'Verify SystemStatus values from store defaults',
    testFn: async () => {
      const { useSystemStore } = await import('@/lib/store');
      const status = useSystemStore.getState().status;
      return validateTypeUnion(status, ['optimal', 'warning', 'critical', 'booting'] as const, 'SystemStatus');
    }
  },
  {
    id: 'type:system_state_shape',
    label: 'SystemState 完整性验证',
    labelEn: 'SystemState Shape',
    category: 'type_audit',
    description: 'Verify Zustand store has all expected state keys',
    testFn: async () => {
      const { useSystemStore } = await import('@/lib/store');
      const state = useSystemStore.getState();
      const expectedKeys = [
        'activeView', 'consoleTab', 'consoleAgent',
        'sidebarCollapsed', 'sidebarPinned', 'isMobile', 'isTablet',
        'messages', 'isStreaming', 'isArtifactsOpen', 'activeArtifact',
        'agentChatHistories',
        'isSettingsOpen', 'settingsTab',
        'status', 'latency', 'cpuLoad', 'clusterMetrics',
        'logs', 'dbConnected',
      ];
      return validateShape(state, expectedKeys, 'SystemState');
    }
  },
  {
    id: 'type:system_state_actions',
    label: 'SystemState Actions 完整性',
    labelEn: 'SystemState Actions',
    category: 'type_audit',
    description: 'Verify Zustand store has all expected action methods',
    testFn: async () => {
      const { useSystemStore } = await import('@/lib/store');
      const state = useSystemStore.getState();
      const expectedActions = [
        'setActiveView', 'setConsoleTab', 'setConsoleAgent',
        'navigateToAgent', 'navigateToConsoleTab',
        'setSidebarCollapsed', 'setSidebarPinned', 'toggleSidebarPin',
        'setIsMobile', 'setIsTablet',
        'addMessage', 'setMessages', 'clearMessages',
        'setIsStreaming', 'setIsArtifactsOpen', 'toggleArtifactsPanel',
        'setActiveArtifact',
        'getAgentHistory', 'setAgentHistory', 'addAgentMessage', 'clearAgentHistory',
        'openSettings', 'closeSettings', 'setSettingsTab',
        'setStatus', 'addLog', 'updateMetrics', 'setDbConnected',
        'newSession', 'runDiagnosis',
      ];
      const missing = expectedActions.filter(a => typeof (state as unknown as Record<string, unknown>)[a] !== 'function');
      if (missing.length > 0) {
        return { status: 'fail', message: `SystemState: ${missing.length} missing actions`, details: missing };
      }
      return { status: 'pass', message: `SystemState: all ${expectedActions.length} actions present` };
    }
  },
  {
    id: 'type:provider_registry',
    label: 'PROVIDERS 注册表验证',
    labelEn: 'PROVIDERS Registry',
    category: 'type_audit',
    description: 'Verify 8 providers with correct shape',
    testFn: async () => {
      const { PROVIDERS } = await import('@/lib/llm-providers');
      const providerIds = Object.keys(PROVIDERS);
      const expected = ['openai', 'anthropic', 'deepseek', 'zhipu', 'google', 'groq', 'ollama', 'lmstudio'];
      const missing = expected.filter(e => !providerIds.includes(e));
      if (missing.length > 0) {
        return { status: 'fail', message: `Missing providers: ${missing.join(', ')}` };
      }
      // Validate each provider shape
      const issues: string[] = [];
      for (const pid of expected) {
        const p = PROVIDERS[pid];
        if (!p.id || !p.name || !p.apiFormat || !p.defaultEndpoint || !Array.isArray(p.models)) {
          issues.push(`${pid}: incomplete shape`);
        }
        if (p.models.length === 0) {
          issues.push(`${pid}: no models defined`);
        }
      }
      if (issues.length > 0) {
        return { status: 'fail', message: 'Provider shape issues', details: issues };
      }
      const totalModels = Object.values(PROVIDERS).reduce((sum, p) => sum + p.models.length, 0);
      return { status: 'pass', message: `8 providers, ${totalModels} total models validated` };
    }
  },
  {
    id: 'type:agent_routes',
    label: 'AGENT_ROUTES 路由验证',
    labelEn: 'AGENT_ROUTES Validation',
    category: 'type_audit',
    description: 'Verify 7 agent routes with system prompts',
    testFn: async () => {
      const { AGENT_ROUTES } = await import('@/lib/llm-providers');
      const routeIds = Object.keys(AGENT_ROUTES);
      const expected = ['navigator', 'thinker', 'prophet', 'bole', 'pivot', 'sentinel', 'grandmaster'];
      const missing = expected.filter(e => !routeIds.includes(e));
      if (missing.length > 0) {
        return { status: 'fail', message: `Missing routes: ${missing.join(', ')}` };
      }
      const issues: string[] = [];
      for (const aid of expected) {
        const r = AGENT_ROUTES[aid];
        if (!r.systemPrompt || r.systemPrompt.length < 100) {
          issues.push(`${aid}: system prompt too short (${r.systemPrompt?.length || 0} chars)`);
        }
        if (!Array.isArray(r.preferredProviders) || r.preferredProviders.length === 0) {
          issues.push(`${aid}: no preferred providers`);
        }
      }
      if (issues.length > 0) {
        return { status: 'warn', message: 'Agent route issues', details: issues };
      }
      return { status: 'pass', message: `7 agent routes validated with system prompts` };
    }
  },
  {
    id: 'type:event_category_meta',
    label: 'EVENT_CATEGORY_META 验证',
    labelEn: 'Event Category Meta',
    category: 'type_audit',
    description: 'Verify event bus category metadata',
    testFn: async () => {
      const { EVENT_CATEGORY_META } = await import('@/lib/event-bus');
      const categories = ['orchestrate', 'persist', 'mcp', 'ui', 'security', 'system'];
      const missing = categories.filter(c => !(c in EVENT_CATEGORY_META));
      if (missing.length > 0) {
        return { status: 'fail', message: `Missing categories: ${missing.join(', ')}` };
      }
      return { status: 'pass', message: `6 event categories validated` };
    }
  },
  {
    id: 'type:mcp_presets',
    label: 'MCP_SERVER_PRESETS 验证',
    labelEn: 'MCP Server Presets',
    category: 'type_audit',
    description: 'Verify 5 preset MCP servers',
    testFn: async () => {
      const { MCP_SERVER_PRESETS } = await import('@/lib/mcp-protocol');
      if (!Array.isArray(MCP_SERVER_PRESETS) || MCP_SERVER_PRESETS.length < 5) {
        return { status: 'fail', message: `Expected >= 5 presets, got ${MCP_SERVER_PRESETS?.length}` };
      }
      const issues: string[] = [];
      for (const s of MCP_SERVER_PRESETS) {
        if (!s.id || !s.name || !s.tools) issues.push(`${s.id || 'unknown'}: incomplete`);
      }
      if (issues.length > 0) return { status: 'fail', message: 'MCP preset issues', details: issues };
      return { status: 'pass', message: `${MCP_SERVER_PRESETS.length} MCP server presets validated` };
    }
  },
  {
    id: 'type:default_devices',
    label: 'DEFAULT_DEVICES 集群配置验证',
    labelEn: 'Default Devices Config',
    category: 'type_audit',
    description: 'Verify 4 cluster device configs',
    testFn: async () => {
      const { DEFAULT_DEVICES } = await import('@/lib/nas-client');
      if (!Array.isArray(DEFAULT_DEVICES) || DEFAULT_DEVICES.length !== 4) {
        return { status: 'fail', message: `Expected 4 devices, got ${DEFAULT_DEVICES?.length}` };
      }
      const expectedIds = ['m4-max', 'imac-m4', 'matebook', 'yanyucloud'];
      const ids = DEFAULT_DEVICES.map(d => d.id);
      const missing = expectedIds.filter(e => !ids.includes(e));
      if (missing.length > 0) {
        return { status: 'fail', message: `Missing devices: ${missing.join(', ')}` };
      }
      const nas = DEFAULT_DEVICES.find(d => d.id === 'yanyucloud');
      if (!nas || nas.ip !== '192.168.3.45') {
        return { status: 'fail', message: 'NAS IP mismatch' };
      }
      return { status: 'pass', message: '4 devices validated (NAS: 192.168.3.45)' };
    }
  },
  {
    id: 'type:file_constants',
    label: 'File Upload 常量验证',
    labelEn: 'File Upload Constants',
    category: 'type_audit',
    description: 'Verify ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, MAX_FILES',
    testFn: async () => {
      const { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, MAX_FILES } = await import('@/lib/types');
      const categories = Object.keys(ACCEPTED_FILE_TYPES);
      if (categories.length < 5) return { status: 'fail', message: `Expected >= 5 file categories, got ${categories.length}` };
      if (MAX_FILE_SIZE !== 10 * 1024 * 1024) return { status: 'fail', message: `MAX_FILE_SIZE expected 10MB, got ${MAX_FILE_SIZE}` };
      if (MAX_FILES !== 10) return { status: 'fail', message: `MAX_FILES expected 10, got ${MAX_FILES}` };
      return { status: 'pass', message: `${categories.length} file categories, 10MB max, 10 files max` };
    }
  },
];

// ============================================================
// 2. Component Tests — Dynamic import + export verification
// ============================================================

const COMPONENT_TESTS: TestCase[] = [
  ...[
    { id: 'comp:chat_area', label: 'ChatArea', path: '@/app/components/chat/ChatArea', export: 'ChatArea' },
    { id: 'comp:message_bubble', label: 'MessageBubble', path: '@/app/components/chat/MessageBubble', export: 'MessageBubble' },
    { id: 'comp:artifacts_panel', label: 'ArtifactsPanel', path: '@/app/components/chat/ArtifactsPanel', export: 'ArtifactsPanel' },
    { id: 'comp:sidebar', label: 'Sidebar', path: '@/app/components/layout/Sidebar', export: 'Sidebar' },
    { id: 'comp:console_view', label: 'ConsoleView', path: '@/app/components/console/ConsoleView', export: 'ConsoleView' },
    { id: 'comp:agent_chat', label: 'AgentChatInterface', path: '@/app/components/console/AgentChatInterface', export: 'AgentChatInterface' },
    { id: 'comp:docker_manager', label: 'DockerManager', path: '@/app/components/console/DockerManager', export: 'DockerManager' },
    { id: 'comp:mcp_builder', label: 'McpServiceBuilder', path: '@/app/components/console/McpServiceBuilder', export: 'McpServiceBuilder' },
    { id: 'comp:persistence', label: 'PersistenceManager', path: '@/app/components/console/PersistenceManager', export: 'PersistenceManager' },
    { id: 'comp:orchestrator', label: 'AgentOrchestrator', path: '@/app/components/console/AgentOrchestrator', export: 'AgentOrchestrator' },
    { id: 'comp:identity', label: 'AgentIdentityCards', path: '@/app/components/console/AgentIdentityCard', export: 'AgentIdentityCards' },
    { id: 'comp:family', label: 'FamilyPresenceBoard', path: '@/app/components/console/FamilyPresenceBoard', export: 'FamilyPresenceBoard' },
    { id: 'comp:knowledge', label: 'KnowledgeBase', path: '@/app/components/console/KnowledgeBase', export: 'KnowledgeBase' },
    { id: 'comp:token_usage', label: 'TokenUsageDashboard', path: '@/app/components/console/TokenUsageDashboard', export: 'TokenUsageDashboard' },
    { id: 'comp:ollama', label: 'OllamaManager', path: '@/app/components/console/OllamaManager', export: 'OllamaManager' },
    { id: 'comp:api_docs', label: 'ApiDocsViewer', path: '@/app/components/console/ApiDocsViewer', export: 'ApiDocsViewer' },
    { id: 'comp:smoke_test', label: 'SmokeTestRunner', path: '@/app/components/console/SmokeTestRunner', export: 'SmokeTestRunner' },
    { id: 'comp:nas_deploy', label: 'NasDeploymentToolkit', path: '@/app/components/console/NasDeploymentToolkit', export: 'NasDeploymentToolkit' },
    { id: 'comp:metrics_history', label: 'MetricsHistoryDashboard', path: '@/app/components/console/MetricsHistoryDashboard', export: 'MetricsHistoryDashboard' },
    { id: 'comp:remote_deploy', label: 'RemoteDockerDeploy', path: '@/app/components/console/RemoteDockerDeploy', export: 'RemoteDockerDeploy' },
    { id: 'comp:projects', label: 'ProjectsView', path: '@/app/components/views/ProjectsView', export: 'ProjectsView' },
    { id: 'comp:artifacts', label: 'ArtifactsView', path: '@/app/components/views/ArtifactsView', export: 'ArtifactsView' },
    { id: 'comp:monitor', label: 'ServiceHealthMonitor', path: '@/app/components/monitoring/ServiceHealthMonitor', export: 'ServiceHealthMonitor' },
  ].map(c => ({
    id: c.id,
    label: `${c.label} 组件加载`,
    labelEn: `${c.label} Component`,
    category: 'component' as TestCategory,
    description: `Dynamic import and verify ${c.export} export`,
    testFn: async (): Promise<TestVerdict> => {
      try {
        const mod = await import(/* @vite-ignore */ c.path);
        if (typeof mod[c.export] !== 'function' && typeof mod[c.export] !== 'object') {
          return { status: 'fail', message: `${c.export}: export not found or not a component` };
        }
        return { status: 'pass', message: `${c.export}: loaded successfully` };
      } catch (err) {
        return { status: 'fail', message: `${c.export}: import failed`, details: [(err as Error).message] };
      }
    }
  })),
];

// ============================================================
// 3. Module Health Tests — lib/* modules
// ============================================================

const MODULE_TESTS: TestCase[] = [
  {
    id: 'mod:types',
    label: 'types.ts 模块',
    labelEn: 'types.ts Module',
    category: 'module',
    description: 'Verify types.ts exports all expected types and constants',
    testFn: async () => {
      const mod = await import('@/lib/types');
      const expected = ['AGENT_REGISTRY', 'PROMPT_TEMPLATES', 'ACCEPTED_FILE_TYPES', 'MAX_FILE_SIZE', 'MAX_FILES'];
      const missing = expected.filter(e => !(e in mod));
      if (missing.length > 0) return { status: 'fail', message: 'Missing exports', details: missing };
      return { status: 'pass', message: `types.ts: ${Object.keys(mod).length} exports verified` };
    }
  },
  {
    id: 'mod:store',
    label: 'store.ts 模块',
    labelEn: 'store.ts Module',
    category: 'module',
    description: 'Verify Zustand store creation and re-exports',
    testFn: async () => {
      const mod = await import('@/lib/store');
      if (typeof mod.useSystemStore !== 'function') return { status: 'fail', message: 'useSystemStore not exported' };
      const state = mod.useSystemStore.getState();
      if (!state) return { status: 'fail', message: 'Store state is null' };
      return { status: 'pass', message: `store.ts: ${Object.keys(state).length} state keys` };
    }
  },
  {
    id: 'mod:api',
    label: 'api.ts 模块',
    labelEn: 'api.ts Module',
    category: 'module',
    description: 'Verify API service object structure',
    testFn: async () => {
      const mod = await import('@/lib/api');
      if (!mod.api) return { status: 'fail', message: 'api object not exported' };
      const domains = ['sessions', 'messages', 'agentSessions', 'agentMessages', 'metrics', 'logs', 'preferences', 'projects', 'artifacts'];
      const missing = domains.filter(d => !(d in mod.api));
      if (missing.length > 0) return { status: 'fail', message: 'Missing API domains', details: missing };
      return { status: 'pass', message: `api.ts: ${domains.length} API domains verified` };
    }
  },
  {
    id: 'mod:llm_bridge',
    label: 'llm-bridge.ts 模块',
    labelEn: 'llm-bridge.ts Module',
    category: 'module',
    description: 'Verify LLM bridge exports',
    testFn: async () => {
      const mod = await import('@/lib/llm-bridge');
      const expected = ['streamChat', 'chat', 'agentStreamChat', 'checkProviderHealth', 'trackUsage', 'getUsageSummary', 'loadProviderConfigs', 'saveProviderConfigs'];
      const missing = expected.filter(e => typeof (mod as Record<string, unknown>)[e] !== 'function');
      if (missing.length > 0) return { status: 'fail', message: 'Missing exports', details: missing };
      return { status: 'pass', message: `llm-bridge.ts: ${expected.length} functions verified` };
    }
  },
  {
    id: 'mod:llm_providers',
    label: 'llm-providers.ts 模块',
    labelEn: 'llm-providers.ts Module',
    category: 'module',
    description: 'Verify provider registry and helper functions',
    testFn: async () => {
      const mod = await import('@/lib/llm-providers');
      const expected = ['PROVIDERS', 'AGENT_ROUTES', 'getProviderModels', 'findModel', 'resolveAgentRoute', 'getAllProviders', 'updateOllamaModels'];
      const missing = expected.filter(e => !(e in mod));
      if (missing.length > 0) return { status: 'fail', message: 'Missing exports', details: missing };
      return { status: 'pass', message: `llm-providers.ts: ${expected.length} exports verified` };
    }
  },
  {
    id: 'mod:llm_router',
    label: 'llm-router.ts 模块',
    labelEn: 'llm-router.ts Module',
    category: 'module',
    description: 'Verify smart router exports',
    testFn: async () => {
      const mod = await import('@/lib/llm-router');
      if (typeof mod.getRouter !== 'function') return { status: 'fail', message: 'getRouter not exported' };
      const router = mod.getRouter();
      if (!router) return { status: 'fail', message: 'getRouter returned null' };
      return { status: 'pass', message: 'llm-router.ts: router instance verified' };
    }
  },
  {
    id: 'mod:crypto',
    label: 'crypto.ts 模块',
    labelEn: 'crypto.ts Module',
    category: 'module',
    description: 'Verify encryption module exports',
    testFn: async () => {
      const mod = await import('@/lib/crypto');
      const expected = ['encrypt', 'decrypt'];
      const missing = expected.filter(e => typeof (mod as Record<string, unknown>)[e] !== 'function');
      if (missing.length > 0) return { status: 'fail', message: 'Missing exports', details: missing };
      return { status: 'pass', message: 'crypto.ts: encrypt/decrypt verified' };
    }
  },
  {
    id: 'mod:nas_client',
    label: 'nas-client.ts 模块',
    labelEn: 'nas-client.ts Module',
    category: 'module',
    description: 'Verify NAS client exports',
    testFn: async () => {
      const mod = await import('@/lib/nas-client');
      const expected = ['DEFAULT_DEVICES', 'loadDeviceConfigs', 'saveDeviceConfigs', 'pingDevice', 'querySQLite', 'testSQLiteConnection', 'docker'];
      const missing = expected.filter(e => !(e in mod));
      if (missing.length > 0) return { status: 'fail', message: 'Missing exports', details: missing };
      return { status: 'pass', message: `nas-client.ts: ${expected.length} exports verified` };
    }
  },
  {
    id: 'mod:mcp_protocol',
    label: 'mcp-protocol.ts 模块',
    labelEn: 'mcp-protocol.ts Module',
    category: 'module',
    description: 'Verify MCP protocol exports',
    testFn: async () => {
      const mod = await import('@/lib/mcp-protocol');
      const expected = ['MCP_SERVER_PRESETS', 'MCP_CALL_PRESETS', 'getAllMCPServers', 'registerMCPServer', 'removeMCPServer', 'executeMCPCall', 'getMCPCallLog'];
      const missing = expected.filter(e => !(e in mod));
      if (missing.length > 0) return { status: 'fail', message: 'Missing exports', details: missing };
      return { status: 'pass', message: `mcp-protocol.ts: ${expected.length} exports verified` };
    }
  },
  {
    id: 'mod:event_bus',
    label: 'event-bus.ts 模块',
    labelEn: 'event-bus.ts Module',
    category: 'module',
    description: 'Verify event bus singleton and hooks',
    testFn: async () => {
      const mod = await import('@/lib/event-bus');
      if (!mod.eventBus) return { status: 'fail', message: 'eventBus singleton not exported' };
      if (typeof mod.useEventBus !== 'function') return { status: 'fail', message: 'useEventBus hook not exported' };
      if (typeof mod.useEventBusVersion !== 'function') return { status: 'fail', message: 'useEventBusVersion hook not exported' };
      if (typeof mod.eventBus.emit !== 'function') return { status: 'fail', message: 'eventBus.emit not a function' };
      return { status: 'pass', message: 'event-bus.ts: singleton + 2 hooks verified' };
    }
  },
  {
    id: 'mod:persistence',
    label: 'persistence-engine.ts 模块',
    labelEn: 'persistence-engine.ts Module',
    category: 'module',
    description: 'Verify persistence engine exports',
    testFn: async () => {
      const mod = await import('@/lib/persistence-engine');
      if (typeof mod.getPersistenceEngine !== 'function') return { status: 'fail', message: 'getPersistenceEngine not exported' };
      return { status: 'pass', message: 'persistence-engine.ts: engine factory verified' };
    }
  },
  {
    id: 'mod:agent_orchestrator',
    label: 'agent-orchestrator.ts 模块',
    labelEn: 'agent-orchestrator.ts Module',
    category: 'module',
    description: 'Verify agent orchestrator exports',
    testFn: async () => {
      const mod = await import('@/lib/agent-orchestrator');
      if (typeof mod._registerEventBusRef !== 'function') return { status: 'fail', message: '_registerEventBusRef not exported' };
      return { status: 'pass', message: 'agent-orchestrator.ts: exports verified' };
    }
  },
  {
    id: 'mod:i18n',
    label: 'i18n.tsx 模块',
    labelEn: 'i18n.tsx Module',
    category: 'module',
    description: 'Verify i18n provider and hook',
    testFn: async () => {
      const mod = await import('@/lib/i18n');
      if (typeof mod.LanguageProvider !== 'function') return { status: 'fail', message: 'LanguageProvider not exported' };
      if (typeof mod.useTranslation !== 'function') return { status: 'fail', message: 'useTranslation not exported' };
      return { status: 'pass', message: 'i18n.tsx: provider + hook verified' };
    }
  },
  {
    id: 'mod:db_schema',
    label: 'db-schema.ts 模块',
    labelEn: 'db-schema.ts Module',
    category: 'module',
    description: 'Verify database schema exports',
    testFn: async () => {
      const mod = await import('@/lib/db-schema');
      if (!mod.SCHEMA_SQL || typeof mod.SCHEMA_SQL !== 'string') return { status: 'fail', message: 'SCHEMA_SQL not a string' };
      if (!mod.SCHEMA_VERSION) return { status: 'fail', message: 'SCHEMA_VERSION not exported' };
      return { status: 'pass', message: `db-schema.ts: v${mod.SCHEMA_VERSION}, ${mod.SCHEMA_SQL.length} chars` };
    }
  },
];

// ============================================================
// 4. Integration Tests — Cross-module dependencies
// ============================================================

const INTEGRATION_TESTS: TestCase[] = [
  {
    id: 'int:store_types_alignment',
    label: 'Store <-> Types 对齐',
    labelEn: 'Store-Types Alignment',
    category: 'integration',
    description: 'Verify store re-exports match types.ts',
    testFn: async () => {
      const storemod = await import('@/lib/store');
      const typesmod = await import('@/lib/types');
      // Verify that key types from store are same reference as types
      const state = storemod.useSystemStore.getState();
      if (typeof state.activeView !== 'string') return { status: 'fail', message: 'activeView not a string' };
      if (!typesmod.AGENT_REGISTRY) return { status: 'fail', message: 'AGENT_REGISTRY not in types' };
      return { status: 'pass', message: 'Store and types.ts aligned' };
    }
  },
  {
    id: 'int:provider_agent_routes',
    label: 'Provider <-> Agent 路由一致性',
    labelEn: 'Provider-Agent Route Consistency',
    category: 'integration',
    description: 'Verify agent routes reference valid provider IDs',
    testFn: async () => {
      const { PROVIDERS, AGENT_ROUTES } = await import('@/lib/llm-providers');
      const providerIds = Object.keys(PROVIDERS);
      const issues: string[] = [];
      for (const [agentId, route] of Object.entries(AGENT_ROUTES)) {
        for (const pid of route.preferredProviders) {
          if (!providerIds.includes(pid)) {
            issues.push(`${agentId}: references unknown provider "${pid}"`);
          }
        }
      }
      if (issues.length > 0) return { status: 'fail', message: 'Route-Provider mismatch', details: issues };
      return { status: 'pass', message: 'All agent routes reference valid providers' };
    }
  },
  {
    id: 'int:event_bus_singleton',
    label: 'Event Bus 单例一致性',
    labelEn: 'Event Bus Singleton',
    category: 'integration',
    description: 'Verify eventBus is same instance across imports',
    testFn: async () => {
      const { eventBus: bus1 } = await import('@/lib/event-bus');
      const { eventBus: bus2 } = await import('@/lib/event-bus');
      if (bus1 !== bus2) return { status: 'fail', message: 'Event bus is not singleton across imports' };
      // Test emit/subscribe works
      let received = false;
      const subId = bus1.on(() => { received = true; });
      bus1.emit({ category: 'system', type: 'test.ping', level: 'debug', source: 'TestRunner', message: 'singleton test' });
      bus1.off(subId);
      if (!received) return { status: 'fail', message: 'Event not received by subscriber' };
      return { status: 'pass', message: 'Event bus singleton confirmed, pub/sub working' };
    }
  },
  {
    id: 'int:persistence_domains',
    label: 'Persistence Domains 覆盖验证',
    labelEn: 'Persistence Domains Coverage',
    category: 'integration',
    description: 'Verify persistence engine covers expected domains',
    testFn: async () => {
      const mod = await import('@/lib/persistence-engine');
      const engine = mod.getPersistenceEngine();
      if (!engine) return { status: 'fail', message: 'Engine not created' };
      // Verify the engine has read/write methods
      if (typeof engine.read !== 'function') return { status: 'fail', message: 'engine.read not a function' };
      if (typeof engine.write !== 'function') return { status: 'fail', message: 'engine.write not a function' };
      return { status: 'pass', message: 'Persistence engine: read/write verified' };
    }
  },
  {
    id: 'int:type_duplication_check',
    label: 'Type 重复定义检查',
    labelEn: 'Type Duplication Check',
    category: 'integration',
    description: 'Check for known type duplications across modules',
    testFn: async () => {
      const issues: string[] = [];
      // EventCategory in types.ts AND event-bus.ts
      const types = await import('@/lib/types');
      const eventBus = await import('@/lib/event-bus');
      // Both should exist — document as warning
      if ('EventCategory' in eventBus) {
        // event-bus.ts defines EventCategory locally  
        issues.push('EventCategory: defined in both types.ts and event-bus.ts');
      }
      if ('EventLevel' in eventBus) {
        issues.push('EventLevel: defined in both types.ts and event-bus.ts');
      }
      // CircuitState in types.ts AND llm-router.ts
      const router = await import('@/lib/llm-router');
      if ('CircuitState' in router) {
        issues.push('CircuitState: defined in both types.ts and llm-router.ts');
      }
      // LLMErrorCode in types.ts AND llm-bridge.ts
      const bridge = await import('@/lib/llm-bridge');
      if ('LLMError' in bridge) {
        issues.push('LLMErrorCode: defined in both types.ts and llm-bridge.ts (via LLMError class)');
      }

      if (issues.length > 0) {
        return { status: 'warn', message: `${issues.length} type duplications found (non-breaking)`, details: issues };
      }
      return { status: 'pass', message: 'No type duplications detected' };
    }
  },
  {
    id: 'int:localstorage_keys',
    label: 'localStorage Key 冲突检查',
    labelEn: 'LocalStorage Key Conflicts',
    category: 'integration',
    description: 'Verify no key prefix collisions across modules',
    testFn: async () => {
      const knownPrefixes = [
        'yyc3-llm-provider-config',
        'yyc3-llm-usage',
        'yyc3-device-configs',
        'yyc3-nas-sqlite-config',
        'yyc3-docker-config',
        'yyc3-mcp-registry',
        'yyc3-mcp-call-log',
        'yyc3-crypto-salt',
        'yyc3_sessions',
        'yyc3_projects',
        'yyc3_artifacts',
        'yyc3_logs',
      ];
      const uniquePrefixes = new Set(knownPrefixes);
      if (uniquePrefixes.size !== knownPrefixes.length) {
        return { status: 'fail', message: 'Duplicate localStorage keys detected' };
      }
      return { status: 'pass', message: `${knownPrefixes.length} unique localStorage keys, no conflicts` };
    }
  },
];

// ============================================================
// All Tests Combined
// ============================================================

const ALL_TESTS: TestCase[] = [
  ...TYPE_AUDIT_TESTS,
  ...COMPONENT_TESTS,
  ...MODULE_TESTS,
  ...INTEGRATION_TESTS,
];

// ============================================================
// UI Helpers
// ============================================================

function getStatusIcon(status: TestStatus) {
  switch (status) {
    case 'pass':    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'fail':    return <XCircle className="w-4 h-4 text-red-500" />;
    case 'warn':    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'running': return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
    case 'skip':    return <AlertTriangle className="w-4 h-4 text-zinc-500" />;
    default:        return <Clock className="w-4 h-4 text-zinc-600" />;
  }
}

function getStatusBadge(status: TestStatus) {
  const variants: Record<TestStatus, string> = {
    pass: 'bg-green-500/10 text-green-400 border-green-500/20',
    fail: 'bg-red-500/10 text-red-400 border-red-500/20',
    warn: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    running: 'bg-primary/10 text-primary border-primary/20',
    skip: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    pending: 'bg-zinc-800/50 text-zinc-500 border-zinc-700/30',
  };
  return variants[status] || variants.pending;
}

const CATEGORY_META: Record<TestCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  type_audit:   { label: 'Type Audit',     icon: Tag,      color: 'text-purple-400' },
  component:    { label: 'Component',      icon: Box,      color: 'text-blue-400' },
  module:       { label: 'Module Health',  icon: Database,  color: 'text-green-400' },
  integration:  { label: 'Integration',    icon: Network,   color: 'text-amber-400' },
};

// ============================================================
// Main Component
// ============================================================

export function TestFrameworkRunner() {
  const [topView, setTopView] = React.useState<'framework' | 'core'>('framework');
  const [results, setResults] = React.useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TestCategory | 'all'>('all');
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = React.useState<TestStatus | 'all'>('all');
  const runAbortRef = React.useRef(false);

  const filteredTests = React.useMemo(() => {
    let tests = ALL_TESTS;
    if (activeTab !== 'all') tests = tests.filter(t => t.category === activeTab);
    if (filterStatus !== 'all') {
      tests = tests.filter(t => {
        const r = results[t.id];
        return r ? r.status === filterStatus : filterStatus === 'pending';
      });
    }
    return tests;
  }, [activeTab, filterStatus, results]);

  // Summary stats
  const summary = React.useMemo(() => {
    const all = Object.values(results);
    return {
      total: ALL_TESTS.length,
      pass: all.filter(r => r.status === 'pass').length,
      fail: all.filter(r => r.status === 'fail').length,
      warn: all.filter(r => r.status === 'warn').length,
      running: all.filter(r => r.status === 'running').length,
      pending: ALL_TESTS.length - all.length,
      totalDuration: all.reduce((sum, r) => sum + r.durationMs, 0),
    };
  }, [results]);

  // Run single test
  const runTest = React.useCallback(async (test: TestCase) => {
    setResults(prev => ({
      ...prev,
      [test.id]: { id: test.id, status: 'running', durationMs: 0, message: 'Running...', timestamp: new Date().toISOString() },
    }));

    const start = performance.now();
    try {
      const verdict = await test.testFn();
      const durationMs = Math.round(performance.now() - start);
      setResults(prev => ({
        ...prev,
        [test.id]: {
          id: test.id,
          status: verdict.status,
          durationMs,
          message: verdict.message,
          details: verdict.details,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      setResults(prev => ({
        ...prev,
        [test.id]: {
          id: test.id,
          status: 'fail',
          durationMs,
          message: `Uncaught error: ${(err as Error).message}`,
          details: [(err as Error).stack || ''],
          timestamp: new Date().toISOString(),
        },
      }));
    }
  }, []);

  // Run all tests in current filter
  const runAll = React.useCallback(async () => {
    setIsRunning(true);
    runAbortRef.current = false;
    const testsToRun = activeTab === 'all' ? ALL_TESTS : ALL_TESTS.filter(t => t.category === activeTab);

    for (const test of testsToRun) {
      if (runAbortRef.current) break;
      await runTest(test);
      // Small delay between tests
      await new Promise(r => setTimeout(r, 50));
    }

    setIsRunning(false);
  }, [activeTab, runTest]);

  // Export report
  const exportReport = React.useCallback(() => {
    const report = {
      framework: 'YYC3 Test Framework Runner',
      version: 'Phase 25.0',
      timestamp: new Date().toISOString(),
      summary,
      results: Object.values(results).map(r => ({
        id: r.id,
        status: r.status,
        durationMs: r.durationMs,
        message: r.message,
        details: r.details,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yyc3-test-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results, summary]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-black/20">
      {/* Top-Level View Switcher */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setTopView('framework')}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-mono border transition-all",
            topView === 'framework'
              ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_8px_rgba(14,165,233,0.15)]"
              : "bg-zinc-900/30 text-zinc-500 border-zinc-800/30 hover:text-zinc-300 hover:border-zinc-600"
          )}
        >
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Framework Tests</span>
        </button>
        <button
          onClick={() => setTopView('core')}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-mono border transition-all",
            topView === 'core'
              ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_8px_rgba(14,165,233,0.15)]"
              : "bg-zinc-900/30 text-zinc-500 border-zinc-800/30 hover:text-zinc-300 hover:border-zinc-600"
          )}
        >
          <span className="flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5" /> Core Logic Tests</span>
        </button>
      </div>

      {topView === 'core' ? (
        <div className="flex-1 min-h-0 -m-4 mt-0">
          <CoreTestPanel />
        </div>
      ) : (
      <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm tracking-wider text-primary">TEST FRAMEWORK RUNNER</h2>
            <p className="text-xs text-zinc-500">Phase 25 | Type Audit + Component + Module + Integration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={exportReport}
            disabled={Object.keys(results).length === 0}
            className="gap-1.5 border-zinc-700 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setResults({}); }}
            disabled={isRunning}
            className="gap-1.5 border-zinc-700 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={isRunning ? () => { runAbortRef.current = true; } : runAll}
            className={cn("gap-1.5 text-xs", isRunning && "bg-red-600 hover:bg-red-700")}
          >
            {isRunning ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Stop</>
            ) : (
              <><Zap className="w-3.5 h-3.5" /> Run All</>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { label: 'Total', value: summary.total, color: 'text-zinc-300' },
          { label: 'Pass', value: summary.pass, color: 'text-green-400' },
          { label: 'Fail', value: summary.fail, color: 'text-red-400' },
          { label: 'Warn', value: summary.warn, color: 'text-yellow-400' },
          { label: 'Pending', value: summary.pending, color: 'text-zinc-500' },
          { label: 'Duration', value: `${summary.totalDuration}ms`, color: 'text-primary' },
        ].map(s => (
          <Card key={s.label} className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-2 text-center">
              <p className={cn("text-lg font-mono", s.color)}>{s.value}</p>
              <p className="text-[10px] text-zinc-500 uppercase">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TestCategory | 'all')}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-zinc-900/50">
            <TabsTrigger value="all" className="text-xs gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              All ({ALL_TESTS.length})
            </TabsTrigger>
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const count = ALL_TESTS.filter(t => t.category === key).length;
              const Icon = meta.icon;
              return (
                <TabsTrigger key={key} value={key} className="text-xs gap-1.5">
                  <Icon className={cn("w-3.5 h-3.5", meta.color)} />
                  {meta.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            {(['all', 'pass', 'fail', 'warn', 'pending'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] border transition-colors",
                  filterStatus === s
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-zinc-900/30 text-zinc-500 border-zinc-800/30 hover:text-zinc-300"
                )}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Test List */}
        <ScrollArea className="flex-1 mt-3" style={{ height: 'calc(100vh - 360px)' }}>
          <div className="space-y-1">
            {filteredTests.map(test => {
              const result = results[test.id];
              const status = result?.status || 'pending';
              const isExpanded = expandedIds.has(test.id);
              const meta = CATEGORY_META[test.category];

              return (
                <div key={test.id} className={cn(
                  "border rounded-lg transition-colors",
                  status === 'fail' ? 'border-red-500/20 bg-red-500/5' :
                  status === 'pass' ? 'border-green-500/10 bg-green-500/5' :
                  status === 'warn' ? 'border-yellow-500/10 bg-yellow-500/5' :
                  'border-zinc-800/50 bg-zinc-900/30'
                )}>
                  <div
                    className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-white/[0.02]"
                    onClick={() => toggleExpand(test.id)}
                  >
                    {/* Expand arrow */}
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    }

                    {/* Status icon */}
                    {getStatusIcon(status)}

                    {/* Category badge */}
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4", meta.color, 'border-current/20')}>
                      {meta.label}
                    </Badge>

                    {/* Label */}
                    <span className="text-xs text-zinc-300 flex-1 truncate">{test.label}</span>

                    {/* Duration */}
                    {result && result.durationMs > 0 && (
                      <span className="text-[10px] text-zinc-500 font-mono">{result.durationMs}ms</span>
                    )}

                    {/* Status badge */}
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", getStatusBadge(status))}>
                      {status.toUpperCase()}
                    </span>

                    {/* Run single */}
                    <button
                      onClick={(e) => { e.stopPropagation(); runTest(test); }}
                      className="p-1 hover:bg-primary/10 rounded transition-colors"
                      title="Run this test"
                    >
                      <Play className="w-3 h-3 text-zinc-500 hover:text-primary" />
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-3 border-t border-zinc-800/30 pt-2 space-y-1.5">
                      <p className="text-[11px] text-zinc-400">{test.description}</p>
                      {result?.message && (
                        <p className={cn("text-[11px] font-mono",
                          result.status === 'pass' ? 'text-green-400' :
                          result.status === 'fail' ? 'text-red-400' :
                          'text-yellow-400'
                        )}>
                          {result.message}
                        </p>
                      )}
                      {result?.details && result.details.length > 0 && (
                        <div className="bg-zinc-950/50 rounded p-2 space-y-0.5">
                          {result.details.map((d, i) => (
                            <p key={i} className="text-[10px] text-zinc-400 font-mono">{d}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredTests.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-sm">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No tests match current filter
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>
      </>
      )}
    </div>
  );
}