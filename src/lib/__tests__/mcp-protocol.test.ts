// ============================================================
// YYC3 Hacker Chatbot — MCP Protocol Unit Tests (Vitest)
// Phase 48: Test Coverage Enhancement (P1)
//
// Tests: Server presets, tool schemas, registry CRUD,
//        executeMCPCall (tools, resources, prompts, lifecycle),
//        code generation, call log, rich mock data.
//
// Run: npx vitest run src/lib/__tests__/mcp-protocol.test.ts
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MCP_SERVER_PRESETS,
  MCP_CALL_PRESETS,
  loadMCPRegistry,
  saveMCPRegistry,
  getAllMCPServers,
  executeMCPCall,
  logMCPCall,
  getMCPCallLog,
  generateMCPServerCode,
  generateMCPClientConfig,
  type MCPServerDefinition,
  type MCPCallResult,
  type MCPTool,
} from '../mcp-protocol';

const MCP_REGISTRY_KEY = 'yyc3-mcp-registry';
const MCP_CALL_LOG_KEY = 'yyc3-mcp-call-log';

// ============================================================
// Setup
// ============================================================

beforeEach(() => {
  localStorage.removeItem(MCP_REGISTRY_KEY);
  localStorage.removeItem(MCP_CALL_LOG_KEY);
});

// ============================================================
// Suite 1: MCP Server Presets
// ============================================================

describe('MCP Protocol — Server Presets', () => {
  it('MCP-01: has at least 5 preset servers', () => {
    expect(MCP_SERVER_PRESETS.length).toBeGreaterThanOrEqual(5);
  });

  it('MCP-02: all presets have required fields', () => {
    for (const server of MCP_SERVER_PRESETS) {
      expect(server.id).toBeTruthy();
      expect(server.name).toBeTruthy();
      expect(server.version).toBeTruthy();
      expect(server.description).toBeTruthy();
      expect(['stdio', 'http-sse', 'streamable-http']).toContain(server.transport);
      expect(server.capabilities).toBeDefined();
      expect(Array.isArray(server.tools)).toBe(true);
      expect(Array.isArray(server.resources)).toBe(true);
      expect(Array.isArray(server.prompts)).toBe(true);
      expect(['connected', 'disconnected', 'error', 'initializing']).toContain(server.status);
      expect(['builtin', 'community', 'custom']).toContain(server.category);
      expect(Array.isArray(server.tags)).toBe(true);
    }
  });

  it('MCP-03: preset IDs are unique', () => {
    const ids = MCP_SERVER_PRESETS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('MCP-04: expected servers present', () => {
    const ids = MCP_SERVER_PRESETS.map(s => s.id);
    expect(ids).toContain('mcp-filesystem');
    expect(ids).toContain('mcp-postgres');
    expect(ids).toContain('mcp-yyc3-cluster');
    expect(ids).toContain('mcp-github');
    expect(ids).toContain('mcp-web-search');
  });

  it('MCP-05: yyc3-cluster has 5 tools', () => {
    const cluster = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-yyc3-cluster');
    expect(cluster).toBeDefined();
    expect(cluster!.tools).toHaveLength(5);
    const toolNames = cluster!.tools.map(t => t.name);
    expect(toolNames).toContain('cluster_status');
    expect(toolNames).toContain('docker_containers');
    expect(toolNames).toContain('sqlite_query');
    expect(toolNames).toContain('system_diagnostics');
    expect(toolNames).toContain('deploy_service');
  });

  it('MCP-06: filesystem server has 4 tools', () => {
    const fs = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-filesystem');
    expect(fs!.tools).toHaveLength(4);
  });

  it('MCP-07: postgres server has query tool', () => {
    const pg = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-postgres');
    expect(pg!.tools).toHaveLength(1);
    expect(pg!.tools[0].name).toBe('query');
    expect(pg!.tools[0].annotations?.readOnlyHint).toBe(true);
  });
});

// ============================================================
// Suite 2: MCP Tool Schema Validation
// ============================================================

describe('MCP Protocol — Tool Schemas', () => {
  it('MCP-08: all tools have valid inputSchema', () => {
    for (const server of MCP_SERVER_PRESETS) {
      for (const tool of server.tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
        expect(typeof tool.inputSchema.properties).toBe('object');
      }
    }
  });

  it('MCP-09: tools with required params have required array', () => {
    for (const server of MCP_SERVER_PRESETS) {
      for (const tool of server.tools) {
        if (tool.inputSchema.required) {
          expect(Array.isArray(tool.inputSchema.required)).toBe(true);
          // Every required param should exist in properties
          for (const req of tool.inputSchema.required) {
            expect(tool.inputSchema.properties[req]).toBeDefined();
          }
        }
      }
    }
  });

  it('MCP-10: destructive tools have annotations', () => {
    const cluster = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-yyc3-cluster');
    const deploy = cluster!.tools.find(t => t.name === 'deploy_service');
    expect(deploy!.annotations?.destructiveHint).toBe(true);

    const fs = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-filesystem');
    const write = fs!.tools.find(t => t.name === 'write_file');
    expect(write!.annotations?.destructiveHint).toBe(true);
  });
});

// ============================================================
// Suite 3: MCP Call Presets
// ============================================================

describe('MCP Protocol — Call Presets', () => {
  it('MCP-11: has presets for all MCP methods', () => {
    const methods = MCP_CALL_PRESETS.map(p => p.method);
    expect(methods).toContain('initialize');
    expect(methods).toContain('ping');
    expect(methods).toContain('tools/list');
    expect(methods).toContain('tools/call');
    expect(methods).toContain('resources/list');
    expect(methods).toContain('resources/read');
    expect(methods).toContain('prompts/list');
    expect(methods).toContain('prompts/get');
  });

  it('MCP-12: call presets have all required fields', () => {
    for (const preset of MCP_CALL_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.method).toBeTruthy();
      expect(preset.paramsTemplate).toBeDefined();
      expect(preset.exampleResponse).toBeDefined();
      expect(['lifecycle', 'tools', 'resources', 'prompts', 'utilities']).toContain(preset.category);
    }
  });

  it('MCP-13: preset IDs are unique', () => {
    const ids = MCP_CALL_PRESETS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ============================================================
// Suite 4: MCP Registry CRUD
// ============================================================

describe('MCP Protocol — Registry', () => {
  it('MCP-14: loadMCPRegistry returns empty when no data', () => {
    const registry = loadMCPRegistry();
    expect(registry).toEqual([]);
  });

  it('MCP-15: saveMCPRegistry + loadMCPRegistry round-trip', async () => {
    const servers: MCPServerDefinition[] = [{
      id: 'custom-test',
      name: 'Test Server',
      version: '1.0.0',
      description: 'A test server',
      transport: 'stdio',
      command: 'node',
      args: ['server.js'],
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: ['test'],
      createdAt: '2026-02-21T00:00:00Z',
      updatedAt: '2026-02-21T00:00:00Z',
    }];
    await saveMCPRegistry(servers);
    const loaded = loadMCPRegistry();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('custom-test');
    expect(loaded[0].name).toBe('Test Server');
  });

  it('MCP-16: getAllMCPServers includes presets and custom', async () => {
    await saveMCPRegistry([{
      id: 'custom-server',
      name: 'Custom',
      version: '1.0.0',
      description: 'Custom server',
      transport: 'stdio',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: '2026-02-21',
      updatedAt: '2026-02-21',
    }]);
    const all = getAllMCPServers();
    expect(all.length).toBeGreaterThan(MCP_SERVER_PRESETS.length);
    expect(all.find(s => s.id === 'custom-server')).toBeDefined();
    expect(all.find(s => s.id === 'mcp-filesystem')).toBeDefined();
  });

  it('MCP-17: custom server overrides preset with same ID', async () => {
    await saveMCPRegistry([{
      ...MCP_SERVER_PRESETS[0],
      name: 'Override Name',
    }]);
    const all = getAllMCPServers();
    const overridden = all.find(s => s.id === MCP_SERVER_PRESETS[0].id);
    expect(overridden!.name).toBe('Override Name');
    // Should not have duplicate IDs
    const idCounts = all.reduce((acc, s) => {
      acc[s.id] = (acc[s.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    expect(Object.values(idCounts).every(c => c === 1)).toBe(true);
  });

  it('MCP-18: handles corrupt registry gracefully', () => {
    localStorage.setItem(MCP_REGISTRY_KEY, 'not-json');
    const registry = loadMCPRegistry();
    expect(registry).toEqual([]);
  });
});

// ============================================================
// Suite 5: MCP Call Log
// ============================================================

describe('MCP Protocol — Call Log', () => {
  it('MCP-19: getMCPCallLog returns empty when no data', () => {
    expect(getMCPCallLog()).toEqual([]);
  });

  it('MCP-20: logMCPCall stores entry', () => {
    const entry: MCPCallResult = {
      success: true,
      method: 'tools/list',
      serverId: 'mcp-filesystem',
      latencyMs: 42,
      response: { jsonrpc: '2.0', id: 1, result: { tools: [] } },
      timestamp: Date.now(),
    };
    logMCPCall(entry);
    const log = getMCPCallLog();
    expect(log).toHaveLength(1);
    expect(log[0].method).toBe('tools/list');
  });

  it('MCP-21: call log capped at 200 entries', () => {
    for (let i = 0; i < 210; i++) {
      logMCPCall({
        success: true,
        method: 'ping',
        serverId: 'test',
        latencyMs: i,
        response: { jsonrpc: '2.0', id: i, result: {} },
        timestamp: Date.now(),
      });
    }
    const log = getMCPCallLog();
    expect(log.length).toBeLessThanOrEqual(200);
  });

  it('MCP-22: newest entries first in log', () => {
    logMCPCall({
      success: true, method: 'first', serverId: 'test', latencyMs: 1,
      response: { jsonrpc: '2.0', id: 1, result: {} }, timestamp: 1000,
    });
    logMCPCall({
      success: true, method: 'second', serverId: 'test', latencyMs: 2,
      response: { jsonrpc: '2.0', id: 2, result: {} }, timestamp: 2000,
    });
    const log = getMCPCallLog();
    expect(log[0].method).toBe('second');
    expect(log[1].method).toBe('first');
  });
});

// ============================================================
// Suite 6: executeMCPCall — Lifecycle & Tools
// ============================================================

describe('MCP Protocol — executeMCPCall', () => {
  it('MCP-23: initialize returns server info', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'initialize');
    expect(result.success).toBe(true);
    const res = result.response.result as Record<string, unknown>;
    expect(res.protocolVersion).toBe('2025-03-26');
    expect(res.serverInfo).toBeDefined();
    expect((res.serverInfo as Record<string, unknown>).name).toBe('YYC3 Cluster');
  });

  it('MCP-24: ping returns success', async () => {
    const result = await executeMCPCall('mcp-filesystem', 'ping');
    expect(result.success).toBe(true);
    expect(result.response.result).toEqual({});
  });

  it('MCP-25: tools/list returns server tools', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'tools/list');
    expect(result.success).toBe(true);
    const res = result.response.result as { tools: MCPTool[] };
    expect(res.tools).toHaveLength(5);
  });

  it('MCP-26: tools/call with valid tool returns structured data', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'tools/call', {
      name: 'cluster_status',
      arguments: { node: 'all' },
    });
    expect(result.success).toBe(true);
    const res = result.response.result as { content: Array<{ type: string; text?: string }> };
    expect(res.content).toBeDefined();
    expect(res.content[0].type).toBe('text');
    expect(res.content[0].text).toBeTruthy();
    // Should contain structured JSON
    const parsed = JSON.parse(res.content[0].text!);
    expect(parsed.cluster).toBe('yyc3-family');
    expect(parsed.nodes).toBeDefined();
  });

  it('MCP-27: tools/call with unknown tool returns error', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'tools/call', {
      name: 'nonexistent_tool',
      arguments: {},
    });
    expect(result.success).toBe(false);
    expect(result.response.error).toBeDefined();
    expect(result.response.error!.code).toBe(-32602);
  });

  it('MCP-28: unknown server returns error', async () => {
    const result = await executeMCPCall('nonexistent-server', 'ping');
    expect(result.success).toBe(false);
    expect(result.response.error).toBeDefined();
    expect(result.response.error!.code).toBe(-32601);
  });
});

// ============================================================
// Suite 7: executeMCPCall — Resources
// ============================================================

describe('MCP Protocol — Resources', () => {
  it('MCP-29: resources/list returns resource list', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'resources/list');
    expect(result.success).toBe(true);
    const res = result.response.result as { resources: unknown[] };
    expect(res.resources.length).toBeGreaterThan(0);
  });

  it('MCP-30: resources/read returns structured content', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'resources/read', {
      uri: 'yyc3://metrics/cluster',
    });
    expect(result.success).toBe(true);
    const res = result.response.result as { contents: Array<{ uri: string; text?: string; mimeType?: string }> };
    expect(res.contents).toBeDefined();
    expect(res.contents[0].uri).toBe('yyc3://metrics/cluster');
    expect(res.contents[0].mimeType).toBe('application/json');
    const parsed = JSON.parse(res.contents[0].text!);
    expect(parsed.cluster).toBe('yyc3-family');
  });

  it('MCP-31: resources/templates/list returns templates', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'resources/templates/list');
    expect(result.success).toBe(true);
    const res = result.response.result as { resourceTemplates: unknown[] };
    expect(res.resourceTemplates.length).toBeGreaterThan(0);
  });
});

// ============================================================
// Suite 8: executeMCPCall — Prompts
// ============================================================

describe('MCP Protocol — Prompts', () => {
  it('MCP-32: prompts/list returns prompt list', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'prompts/list');
    expect(result.success).toBe(true);
    const res = result.response.result as { prompts: unknown[] };
    expect(res.prompts.length).toBeGreaterThanOrEqual(2);
  });

  it('MCP-33: prompts/get cluster_report returns meaningful message', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'prompts/get', {
      name: 'cluster_report',
      arguments: { timeframe: '24h', format: 'markdown' },
    });
    expect(result.success).toBe(true);
    const res = result.response.result as { messages: Array<{ role: string; content: { text: string } }> };
    expect(res.messages).toHaveLength(1);
    expect(res.messages[0].role).toBe('user');
    expect(res.messages[0].content.text).toContain('24h');
    expect(res.messages[0].content.text).toContain('markdown');
  });

  it('MCP-34: prompts/get incident_response returns meaningful message', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'prompts/get', {
      name: 'incident_response',
      arguments: { severity: 'high', affected_node: 'yanyucloud' },
    });
    expect(result.success).toBe(true);
    const res = result.response.result as { messages: Array<{ role: string; content: { text: string } }> };
    expect(res.messages[0].content.text).toContain('HIGH');
    expect(res.messages[0].content.text).toContain('yanyucloud');
  });
});

// ============================================================
// Suite 9: Rich Mock Data (Phase 47)
// ============================================================

describe('MCP Protocol — Rich Mock Data', () => {
  it('MCP-35: docker_containers list returns structured JSON', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'tools/call', {
      name: 'docker_containers',
      arguments: { action: 'list' },
    });
    const content = (result.response.result as { content: Array<{ text: string }> }).content[0].text;
    const data = JSON.parse(content);
    expect(data.containers).toBeDefined();
    expect(data.total).toBeGreaterThan(0);
    expect(data.running).toBeDefined();
  });

  it('MCP-36: sqlite_query returns structured result', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'tools/call', {
      name: 'sqlite_query',
      arguments: { sql: 'SELECT * FROM yyc3_persist' },
    });
    const content = (result.response.result as { content: Array<{ text: string }> }).content[0].text;
    const data = JSON.parse(content);
    expect(data.columns).toBeDefined();
    expect(data.rows).toBeDefined();
  });

  it('MCP-37: system_diagnostics returns comprehensive data', async () => {
    const result = await executeMCPCall('mcp-yyc3-cluster', 'tools/call', {
      name: 'system_diagnostics',
      arguments: { scope: 'full' },
    });
    const content = (result.response.result as { content: Array<{ text: string }> }).content[0].text;
    const data = JSON.parse(content);
    expect(data.scope).toBe('full');
    expect(data.network).toBeDefined();
    expect(data.storage).toBeDefined();
    expect(data.recommendation).toBeDefined();
  });

  it('MCP-38: filesystem read_file returns typed content', async () => {
    const result = await executeMCPCall('mcp-filesystem', 'tools/call', {
      name: 'read_file',
      arguments: { path: '/src/lib/mcp-protocol.ts' },
    });
    const content = (result.response.result as { content: Array<{ text: string }> }).content[0].text;
    expect(content).toBeTruthy();
    expect(content).toContain('import');
  });

  it('MCP-39: github search_repositories returns results', async () => {
    const result = await executeMCPCall('mcp-github', 'tools/call', {
      name: 'search_repositories',
      arguments: { query: 'yyc3' },
    });
    const content = (result.response.result as { content: Array<{ text: string }> }).content[0].text;
    const data = JSON.parse(content);
    expect(data.items).toBeDefined();
    expect(data.total_count).toBeGreaterThan(0);
  });

  it('MCP-40: web search returns structured results', async () => {
    const result = await executeMCPCall('mcp-web-search', 'tools/call', {
      name: 'brave_web_search',
      arguments: { query: 'MCP protocol' },
    });
    const content = (result.response.result as { content: Array<{ text: string }> }).content[0].text;
    const data = JSON.parse(content);
    expect(data.results).toBeDefined();
    expect(data.total).toBeGreaterThan(0);
  });

  it('MCP-41: resource mock for different URIs', async () => {
    const uris = [
      'yyc3://projects/list',
      'yyc3://logs/recent',
      'yyc3://docker/containers',
      'yyc3://config/devices',
    ];
    for (const uri of uris) {
      const result = await executeMCPCall('mcp-yyc3-cluster', 'resources/read', { uri });
      const res = result.response.result as { contents: Array<{ text: string }> };
      expect(res.contents[0].text).toBeTruthy();
      const parsed = JSON.parse(res.contents[0].text);
      expect(parsed).toBeDefined();
    }
  });
});

// ============================================================
// Suite 10: Code Generation
// ============================================================

describe('MCP Protocol — Code Generation', () => {
  it('MCP-42: generateMCPServerCode produces valid Node.js code', () => {
    const server = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-yyc3-cluster')!;
    const code = generateMCPServerCode(server);
    expect(code).toContain('import { Server }');
    expect(code).toContain('StdioServerTransport');
    expect(code).toContain('tools/list');
    expect(code).toContain('tools/call');
    expect(code).toContain('cluster_status');
    expect(code).toContain('docker_containers');
    expect(code).toContain('resources/list');
    expect(code).toContain('prompts/list');
    expect(code).toContain('server.connect');
  });

  it('MCP-43: generated code contains real tool implementations', () => {
    const server = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-filesystem')!;
    const code = generateMCPServerCode(server);
    expect(code).toContain('readFile');
    expect(code).toContain('writeFile');
    expect(code).toContain('readdir');
    expect(code).toContain('grep');
  });

  it('MCP-44: generateMCPClientConfig produces valid JSON', () => {
    const servers = MCP_SERVER_PRESETS.slice(0, 3);
    const config = generateMCPClientConfig(servers);
    const parsed = JSON.parse(config);
    expect(parsed.mcpServers).toBeDefined();
    expect(Object.keys(parsed.mcpServers).length).toBe(3);
  });
});

// ============================================================
// Suite 11: executeMCPCall — logging integration
// ============================================================

describe('MCP Protocol — Call Logging', () => {
  it('MCP-45: executeMCPCall automatically logs calls', async () => {
    await executeMCPCall('mcp-filesystem', 'ping');
    const log = getMCPCallLog();
    expect(log.length).toBeGreaterThanOrEqual(1);
    expect(log[0].method).toBe('ping');
    expect(log[0].serverId).toBe('mcp-filesystem');
    expect(log[0].success).toBe(true);
    expect(log[0].latencyMs).toBeGreaterThan(0);
    expect(log[0].timestamp).toBeGreaterThan(0);
  });

  it('MCP-46: error calls are also logged', async () => {
    await executeMCPCall('nonexistent', 'ping');
    const log = getMCPCallLog();
    expect(log[0].success).toBe(false);
    expect(log[0].serverId).toBe('nonexistent');
  });

  it('MCP-47: unknown method returns message with supported methods', async () => {
    const result = await executeMCPCall('mcp-filesystem', 'unknown/method');
    expect(result.success).toBe(true); // method handling returns result, not error
    const res = result.response.result as { message: string; supportedMethods: string[] };
    expect(res.message).toContain('not recognized');
    expect(res.supportedMethods).toContain('tools/list');
    expect(res.supportedMethods).toContain('resources/read');
  });
});
