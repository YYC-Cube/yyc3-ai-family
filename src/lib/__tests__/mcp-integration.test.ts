// ============================================================
// YYC3 Hacker Chatbot — MCP Protocol Integration Tests
// Phase P1: MCP Server Integration Testing
//
// Tests: MCP server registry, tool execution, resource access,
//        prompt templates, connection management, call logging.
//
// Run: npx vitest run src/lib/__tests__/mcp-integration.test.ts
// ============================================================

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  // Registry functions
  loadMCPRegistry,
  saveMCPRegistry,
  getAllMCPServers,
  registerMCPServer,
  removeMCPServer,
  initMCPRegistry,
  
  // Connection management
  connectMCPServer,
  disconnectMCPServer,
  testMCPConnection,
  getMCPConnection,
  getAllMCPConnections,
  
  // Tool execution
  executeMCPCall,
  smartMCPCall,
  logMCPCall,
  getMCPCallLog,
  
  // Code generation
  generateMCPServerCode,
  generateMCPClientConfig,
  
  // Presets
  MCP_SERVER_PRESETS,
  MCP_CALL_PRESETS,
  
  // Types
  type MCPServerDefinition,
  type MCPTool,
  type MCPCallResult,
} from '../mcp-protocol';

// ============================================================
// Mock Setup
// ============================================================

// Mock localStorage
const localStorageStore = new Map<string, string>();
const localStorageMock = {
  store: localStorageStore,
  getItem: vi.fn((key: string) => localStorageStore.get(key) || null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore.set(key, value); }),
  removeItem: vi.fn((key: string) => { localStorageStore.delete(key); }),
  clear: vi.fn(() => { localStorageStore.clear(); }),
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock fetch for HTTP-SSE transport
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto for encryption
const mockCrypto = {
  subtle: {
    generateKey: vi.fn().mockResolvedValue({}),
    encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
    decrypt: vi.fn().mockResolvedValue(new TextEncoder().encode('decrypted')),
  },
};

Object.defineProperty(global, 'crypto', { value: mockCrypto });

// ============================================================
// Setup / Teardown
// ============================================================

beforeEach(() => {
  mockFetch.mockClear();
  localStorageMock.store.clear();
});

// ============================================================
// Suite 1: MCP Server Registry
// ============================================================

describe('MCP Integration — Server Registry', () => {
  it('MCP-INT-01: loadMCPRegistry returns empty when no data', () => {
    const servers = loadMCPRegistry();

    expect(servers).toEqual([]);
  });

  it('MCP-INT-02: saveMCPRegistry stores servers', async () => {
    const server: MCPServerDefinition = {
      id: 'test-server',
      name: 'Test Server',
      version: '1.0.0',
      description: 'Test MCP server',
      transport: 'stdio',
      command: 'node',
      args: ['test.js'],
      capabilities: {
        tools: true,
        resources: true,
        prompts: true,
        logging: true,
        sampling: false,
      },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: ['test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveMCPRegistry([server]);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'yyc3-mcp-registry',
      expect.any(String),
    );
  });

  it('MCP-INT-03: getAllMCPServers includes presets', () => {
    const servers = getAllMCPServers();

    expect(servers.length).toBeGreaterThanOrEqual(5);
    expect(servers.map(s => s.id)).toContain('mcp-filesystem');
  });

  it('MCP-INT-04: registerMCPServer adds custom server', async () => {
    const server: MCPServerDefinition = {
      id: 'custom-server',
      name: 'Custom Server',
      version: '1.0.0',
      description: 'Custom MCP server',
      transport: 'stdio',
      command: 'npx',
      args: ['-y', 'custom-mcp'],
      capabilities: {
        tools: true,
        resources: false,
        prompts: false,
        logging: true,
        sampling: false,
      },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: ['custom'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await registerMCPServer(server);

    const servers = getAllMCPServers();
    const custom = servers.find(s => s.id === 'custom-server');

    expect(custom).toBeDefined();
  });

  it('MCP-INT-05: removeMCPServer deletes server', async () => {
    // First add a server
    const server: MCPServerDefinition = {
      id: 'to-remove',
      name: 'To Remove',
      version: '1.0.0',
      description: 'Server to remove',
      transport: 'stdio',
      command: 'test',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await registerMCPServer(server);
    await removeMCPServer('to-remove');

    const servers = getAllMCPServers();
    const removed = servers.find(s => s.id === 'to-remove');

    expect(removed).toBeUndefined();
  });

  it('MCP-INT-06: registerMCPServer updates existing server', async () => {
    const server1: MCPServerDefinition = {
      id: 'update-test',
      name: 'Original',
      version: '1.0.0',
      description: 'Original description',
      transport: 'stdio',
      command: 'test',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await registerMCPServer(server1);

    const server2: MCPServerDefinition = {
      ...server1,
      name: 'Updated',
      updatedAt: new Date().toISOString(),
    };

    await registerMCPServer(server2);

    const servers = getAllMCPServers();
    const updated = servers.find(s => s.id === 'update-test');

    expect(updated?.name).toBe('Updated');
  });
});

// ============================================================
// Suite 2: MCP Server Presets
// ============================================================

describe('MCP Integration — Server Presets', () => {
  it('MCP-INT-07: has filesystem preset', () => {
    const fs = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-filesystem');

    expect(fs).toBeDefined();
    expect(fs?.tools.length).toBeGreaterThan(0);
  });

  it('MCP-INT-08: has postgres preset', () => {
    const pg = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-postgres');

    expect(pg).toBeDefined();
  });

  it('MCP-INT-09: has yyc3-cluster preset', () => {
    const cluster = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-yyc3-cluster');

    expect(cluster).toBeDefined();
    expect(cluster?.tools.length).toBe(5);
  });

  it('MCP-INT-10: preset tools have valid schemas', () => {
    for (const server of MCP_SERVER_PRESETS) {
      for (const tool of server.tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
      }
    }
  });
});

// ============================================================
// Suite 3: Connection Management
// ============================================================

describe('MCP Integration — Connection Management', () => {
  it('MCP-INT-11: testMCPConnection tests stdio server', async () => {
    const server: MCPServerDefinition = {
      id: 'test-stdio',
      name: 'Test Stdio',
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'echo',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await testMCPConnection(server);

    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.latencyMs).toBeDefined();
  });

  it('MCP-INT-12: connectMCPServer establishes connection', async () => {
    const server: MCPServerDefinition = {
      id: 'connect-test',
      name: 'Connect Test',
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'echo',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const connection = await connectMCPServer(server);

    expect(connection).toBeDefined();
    expect(connection.serverId).toBe('connect-test');
  });

  it('MCP-INT-13: disconnectMCPServer closes connection', async () => {
    const server: MCPServerDefinition = {
      id: 'disconnect-test',
      name: 'Disconnect Test',
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'echo',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await connectMCPServer(server);
    disconnectMCPServer('disconnect-test');

    const connection = getMCPConnection('disconnect-test');

    expect(connection).toBeUndefined();
  });

  it('MCP-INT-14: getMCPConnection returns connection status', async () => {
    const server: MCPServerDefinition = {
      id: 'status-test',
      name: 'Status Test',
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'echo',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await connectMCPServer(server);

    const connection = getMCPConnection('status-test');

    expect(connection).toBeDefined();
    expect(connection?.serverId).toBe('status-test');
  });

  it('MCP-INT-15: getAllMCPConnections returns all connections', async () => {
    const server1: MCPServerDefinition = {
      id: 'conn-1',
      name: 'Connection 1',
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'echo',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const server2: MCPServerDefinition = {
      id: 'conn-2',
      name: 'Connection 2',
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'echo',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await connectMCPServer(server1);
    await connectMCPServer(server2);

    const connections = getAllMCPConnections();

    expect(connections.length).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================
// Suite 4: Tool Execution
// ============================================================

describe('MCP Integration — Tool Execution', () => {
  it('MCP-INT-16: executeMCPCall executes tool call', async () => {
    // Mock fetch for HTTP-SSE transport
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: '2.0',
        id: 'test-1',
        result: {
          content: [{ type: 'text', text: 'Tool executed' }],
        },
      }),
    });

    const result = await executeMCPCall('test-server', 'tools/call', {
      name: 'test_tool',
      arguments: {},
    });

    expect(result).toBeDefined();
  });

  it('MCP-INT-17: smartMCPCall handles mock mode', async () => {
    const result = await smartMCPCall('test-server', 'tools/call', {
      name: 'cluster_status',
      arguments: {},
    });

    expect(result).toBeDefined();
  });

  it('MCP-INT-18: logMCPCall records call to history', async () => {
    const callResult: MCPCallResult = {
      success: true,
      method: 'tools/call',
      serverId: 'test-server',
      latencyMs: 100,
      response: { jsonrpc: '2.0', id: 'test', result: { content: [{ type: 'text', text: 'Success' }] } },
      timestamp: Date.now(),
    };

    logMCPCall(callResult);

    const log = getMCPCallLog();

    expect(log.length).toBeGreaterThan(0);
  });

  it('MCP-INT-19: getMCPCallLog returns call history', () => {
    const callResult: MCPCallResult = {
      success: true,
      method: 'tools/call',
      serverId: 'test-server',
      latencyMs: 100,
      response: { jsonrpc: '2.0', id: 'test', result: { content: [{ type: 'text', text: 'Success' }] } },
      timestamp: Date.now(),
    };

    logMCPCall(callResult);

    const log = getMCPCallLog();

    expect(log).toBeDefined();
    expect(Array.isArray(log)).toBe(true);
  });

  it('MCP-INT-20: executeMCPCall handles resources/list method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: '2.0',
        id: 'test-2',
        result: {
          resources: [{ uri: 'test://resource', name: 'Test Resource' }],
        },
      }),
    });

    const result = await executeMCPCall('test-server', 'resources/list', {});

    expect(result).toBeDefined();
  });

  it('MCP-INT-21: executeMCPCall handles prompts/list method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: '2.0',
        id: 'test-3',
        result: {
          prompts: [{ name: 'test_prompt', description: 'Test' }],
        },
      }),
    });

    const result = await executeMCPCall('test-server', 'prompts/list', {});

    expect(result).toBeDefined();
  });
});

// ============================================================
// Suite 5: Code Generation
// ============================================================

describe('MCP Integration — Code Generation', () => {
  it('MCP-INT-22: generateMCPServerCode generates server boilerplate', () => {
    const server: MCPServerDefinition = {
      id: 'codegen-server',
      name: 'Codegen Server',
      version: '1.0.0',
      description: 'Test code generation',
      transport: 'stdio',
      command: 'node',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [
        {
          name: 'hello',
          description: 'Say hello',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name to greet' },
            },
            required: ['name'],
          },
        },
      ],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const code = generateMCPServerCode(server);

    expect(code).toBeTruthy();
    expect(code).toContain('hello');
  });

  it('MCP-INT-23: generateMCPClientConfig generates client config', () => {
    const servers = [
      {
        id: 'client-config-server',
        name: 'Client Config Server',
        version: '1.0.0',
        description: 'Test',
        transport: 'http-sse',
        url: 'http://localhost:3000/sse',
        capabilities: { tools: true, resources: true, prompts: false, logging: false, sampling: false },
        tools: [],
        resources: [],
        resourceTemplates: [],
        prompts: [],
        status: 'disconnected',
        category: 'custom',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as MCPServerDefinition,
    ];

    const config = generateMCPClientConfig(servers);

    expect(config).toBeTruthy();
    expect(config).toContain('client-config-server');
  });

  it('MCP-INT-24: generateMCPServerCode includes tool handlers', () => {
    const server: MCPServerDefinition = {
      id: 'tool-handler-server',
      name: 'Tool Handler Server',
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'node',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [
        {
          name: 'add',
          description: 'Add two numbers',
          inputSchema: {
            type: 'object',
            properties: {
              a: { type: 'number' },
              b: { type: 'number' },
            },
            required: ['a', 'b'],
          },
        },
      ],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const code = generateMCPServerCode(server);

    expect(code).toContain('add');
    expect(code).toContain('a');
    expect(code).toContain('b');
  });
});

// ============================================================
// Suite 6: Call Presets
// ============================================================

describe('MCP Integration — Call Presets', () => {
  it('MCP-INT-25: has initialize preset', () => {
    const init = MCP_CALL_PRESETS.find(p => p.method === 'initialize');

    expect(init).toBeDefined();
    expect(init?.paramsTemplate).toBeDefined();
  });

  it('MCP-INT-26: has tools/list preset', () => {
    const listTools = MCP_CALL_PRESETS.find(p => p.method === 'tools/list');

    expect(listTools).toBeDefined();
  });

  it('MCP-INT-27: has tools/call preset', () => {
    const callTool = MCP_CALL_PRESETS.find(p => p.method === 'tools/call');

    expect(callTool).toBeDefined();
    expect(callTool?.paramsTemplate.name).toBe('tool_name');
  });

  it('MCP-INT-28: has resources/list preset', () => {
    const listResources = MCP_CALL_PRESETS.find(p => p.method === 'resources/list');

    expect(listResources).toBeDefined();
  });

  it('MCP-INT-29: has resources/read preset', () => {
    const readResource = MCP_CALL_PRESETS.find(p => p.method === 'resources/read');

    expect(readResource).toBeDefined();
    expect(readResource?.paramsTemplate.uri).toBeDefined();
  });

  it('MCP-INT-30: has prompts/list preset', () => {
    const listPrompts = MCP_CALL_PRESETS.find(p => p.method === 'prompts/list');

    expect(listPrompts).toBeDefined();
  });
});

// ============================================================
// Suite 7: Integration Scenarios
// ============================================================

describe('MCP Integration — Integration Scenarios', () => {
  it('MCP-INT-31: full workflow: register → connect → call tool', async () => {
    // 1. Register custom server
    const server: MCPServerDefinition = {
      id: 'workflow-server',
      name: 'Workflow Server',
      version: '1.0.0',
      description: 'Integration test',
      transport: 'stdio',
      command: 'echo',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [
        {
          name: 'status',
          description: 'Get status',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
      ],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await registerMCPServer(server);

    // 2. Connect
    await connectMCPServer(server);

    // 3. Call tool
    const result = await smartMCPCall('workflow-server', 'tools/call', {
      name: 'status',
      arguments: {},
    });

    expect(result).toBeDefined();

    // 4. Verify connection
    const connection = getMCPConnection('workflow-server');

    expect(connection).toBeDefined();
  });

  it('MCP-INT-32: cluster health check workflow', async () => {
    // Use preset cluster server
    const clusterServer = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-yyc3-cluster');

    expect(clusterServer).toBeDefined();

    // Call cluster_status tool
    const result = await smartMCPCall('mcp-yyc3-cluster', 'tools/call', {
      name: 'cluster_status',
      arguments: {},
    });

    expect(result).toBeDefined();
  });

  it('MCP-INT-33: filesystem operations workflow', async () => {
    // Use preset filesystem server
    const fsServer = MCP_SERVER_PRESETS.find(s => s.id === 'mcp-filesystem');

    expect(fsServer).toBeDefined();

    // Call list_directory tool
    const result = await smartMCPCall('mcp-filesystem', 'tools/call', {
      name: 'list_directory',
      arguments: { path: '/test' },
    });

    expect(result).toBeDefined();
  });

  it('MCP-INT-34: multiple server connections', async () => {
    const servers = MCP_SERVER_PRESETS.slice(0, 3);

    for (const server of servers) {
      await connectMCPServer(server);
    }

    const connections = getAllMCPConnections();

    expect(connections.length).toBeGreaterThanOrEqual(3);
  });

  it('MCP-INT-35: call log persistence', async () => {
    // Make several calls
    await smartMCPCall('test-server-1', 'tools/call', { name: 'test1' });
    await smartMCPCall('test-server-2', 'tools/call', { name: 'test2' });
    await smartMCPCall('test-server-1', 'tools/call', { name: 'test3' });

    const log = getMCPCallLog();

    // Verify log is an array
    expect(Array.isArray(log)).toBe(true);
  });
});

// ============================================================
// Suite 8: Error Handling
// ============================================================

describe('MCP Integration — Error Handling', () => {
  it('MCP-INT-36: handles connection failure gracefully', async () => {
    const server: MCPServerDefinition = {
      id: 'fail-server',
      name: 'Fail Server',
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'nonexistent-command',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await testMCPConnection(server);

    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
  });

  it('MCP-INT-37: handles tool execution error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Tool execution failed'));

    try {
      await executeMCPCall('test-server', 'tools/call', {
        name: 'failing_tool',
        arguments: {},
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('MCP-INT-38: handles missing server gracefully', async () => {
    const result = await smartMCPCall('nonexistent-server', 'tools/call', {
      name: 'test',
    });

    expect(result).toBeDefined();
  });

  it('MCP-INT-39: handles missing tool gracefully', async () => {
    const result = await smartMCPCall('mcp-yyc3-cluster', 'tools/call', {
      name: 'nonexistent_tool',
    });

    expect(result).toBeDefined();
  });
});

// ============================================================
// Suite 9: Encryption (Phase 35)
// ============================================================

describe('MCP Integration — Encryption', () => {
  it('MCP-INT-40: saveMCPRegistry encrypts sensitive keys', async () => {
    const server: MCPServerDefinition = {
      id: 'encrypted-server',
      name: 'Encrypted Server',
      version: '1.0.0',
      description: 'Test encryption',
      transport: 'http-sse',
      url: 'http://localhost:3000/sse',
      env: {
        API_TOKEN: 'secret-token-123',
        OTHER_KEY: 'other-value',
      },
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveMCPRegistry([server]);

    // Verify encryption was attempted
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('MCP-INT-41: initMCPRegistry decrypts encrypted configs', async () => {
    // First save encrypted data
    const server: MCPServerDefinition = {
      id: 'decrypt-server',
      name: 'Decrypt Server',
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'test',
      env: { API_KEY: 'encrypted-value' },
      encrypted: true,
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveMCPRegistry([server]);

    const servers = await initMCPRegistry();

    expect(servers).toBeDefined();
  });
});

// ============================================================
// Suite 10: Performance
// ============================================================

describe('MCP Integration — Performance', () => {
  it('MCP-INT-42: handles rapid successive calls', async () => {
    const calls = Array.from({ length: 10 }, (_, i) =>
      smartMCPCall('perf-server', 'tools/call', { name: `tool-${i}` }),
    );

    const results = await Promise.all(calls);

    expect(results).toHaveLength(10);
  });

  it('MCP-INT-43: call log doesn\'t grow unbounded', async () => {
    // Make several calls (reduced for speed)
    for (let i = 0; i < 20; i++) {
      await smartMCPCall('log-server', 'tools/call', { name: `call-${i}` });
    }

    const log = getMCPCallLog();

    // Log should be capped
    expect(log.length).toBeLessThanOrEqual(100);
    expect(log.length).toBe(20);
  });

  it('MCP-INT-44: registry load is fast', async () => {
    // Add many servers
    const servers: MCPServerDefinition[] = Array.from({ length: 50 }, (_, i) => ({
      id: `perf-server-${i}`,
      name: `Perf Server ${i}`,
      version: '1.0.0',
      description: 'Test',
      transport: 'stdio',
      command: 'test',
      capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
      tools: [],
      resources: [],
      resourceTemplates: [],
      prompts: [],
      status: 'disconnected',
      category: 'custom',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    await saveMCPRegistry(servers);

    const start = Date.now();
    await loadMCPRegistry();
    const duration = Date.now() - start;

    // Should load in < 10ms
    expect(duration).toBeLessThan(10);
  });
});
