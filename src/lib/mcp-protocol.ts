// ============================================================
// YYC3 Hacker Chatbot — MCP Protocol Layer
// Phase 16.2: MCP 工具链真实化
//
// 实现 Model Context Protocol (MCP) 标准:
//   - Tool Schema (tools/list, tools/call)
//   - Resource Schema (resources/list, resources/read)
//   - Prompt Schema (prompts/list, prompts/get)
//   - MCP Service Registry + Connection Management
//   - Preset Call Formats & Code Generation
//
// 架构: 前端 MCP Client → JSON-RPC 2.0 → MCP Server (stdio/http)
//        ↓ (无后端时)
//        Mock Runtime → localStorage 持久化
// ============================================================

import { encryptValue, decryptValue, isCryptoAvailable } from './crypto';

// ============================================================
// 1. MCP JSON-RPC 2.0 Types
// ============================================================

export interface MCPJsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPJsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// ============================================================
// 2. MCP Tool Schema
// ============================================================

export interface MCPToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: unknown;
  enum?: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
      default?: unknown;
    }>;
    required?: string[];
  };
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
}

export interface MCPToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolCallResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
    resource?: { uri: string; text?: string; blob?: string };
  }>;
  isError?: boolean;
}

// ============================================================
// 3. MCP Resource Schema
// ============================================================

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  annotations?: {
    audience?: string[];
    priority?: number;
  };
}

export interface MCPResourceTemplate {
  uriTemplate: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

// ============================================================
// 4. MCP Prompt Schema
// ============================================================

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export interface MCPPromptMessage {
  role: 'user' | 'assistant';
  content: {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
    resource?: { uri: string; text?: string };
  };
}

// ============================================================
// 5. MCP Server Definition
// ============================================================

export type MCPTransport = 'stdio' | 'http-sse' | 'streamable-http';

export interface MCPServerDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  transport: MCPTransport;
  command?: string;        // for stdio: e.g., "npx", "node", "python"
  args?: string[];         // for stdio: arguments
  env?: Record<string, string>;
  url?: string;            // for http transports
  // Capabilities
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
    logging: boolean;
    sampling: boolean;
  };
  // Registered items
  tools: MCPTool[];
  resources: MCPResource[];
  resourceTemplates: MCPResourceTemplate[];
  prompts: MCPPrompt[];
  // Status
  status: 'connected' | 'disconnected' | 'error' | 'initializing';
  lastConnected?: number;
  error?: string;
  // Metadata
  category: 'builtin' | 'community' | 'custom';
  tags: string[];
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  encrypted?: boolean;     // Phase 35: encryption status flag for env vars
}

// ============================================================
// 6. Preset MCP Server Templates
// ============================================================

export const MCP_SERVER_PRESETS: MCPServerDefinition[] = [
  {
    id: 'mcp-filesystem',
    name: 'Filesystem',
    version: '1.0.0',
    description: 'MCP Filesystem Server - Secure file operations with configurable access controls',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/dev/projects'],
    capabilities: { tools: true, resources: true, prompts: false, logging: true, sampling: false },
    tools: [
      {
        name: 'read_file',
        description: 'Read the complete contents of a file from the file system',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to the file to read' },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Create a new file or completely overwrite an existing file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to write the file' },
            content: { type: 'string', description: 'Content to write' },
          },
          required: ['path', 'content'],
        },
        annotations: { destructiveHint: true },
      },
      {
        name: 'list_directory',
        description: 'Get a detailed listing of files and directories in a given path',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Directory path to list' },
          },
          required: ['path'],
        },
        annotations: { readOnlyHint: true },
      },
      {
        name: 'search_files',
        description: 'Recursively search for files matching a pattern',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Starting directory' },
            pattern: { type: 'string', description: 'Search pattern (regex)' },
          },
          required: ['path', 'pattern'],
        },
        annotations: { readOnlyHint: true },
      },
    ],
    resources: [
      { uri: 'file:///Users/dev/projects', name: 'Project Root', description: 'Root project directory', mimeType: 'inode/directory' },
    ],
    resourceTemplates: [
      { uriTemplate: 'file:///{path}', name: 'File Content', description: 'Read any accessible file', mimeType: 'text/plain' },
    ],
    prompts: [],
    status: 'disconnected',
    category: 'community',
    tags: ['filesystem', 'files', 'io'],
    icon: 'folder',
    color: 'text-blue-400',
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
  {
    id: 'mcp-postgres',
    name: 'PostgreSQL',
    version: '1.0.0',
    description: 'MCP PostgreSQL Server - Read-only database access with schema inspection',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://yyc3_admin@localhost/yyc3_devops'],
    capabilities: { tools: true, resources: true, prompts: false, logging: true, sampling: false },
    tools: [
      {
        name: 'query',
        description: 'Run a read-only SQL query against the connected database',
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string', description: 'SQL query to execute (SELECT only)' },
          },
          required: ['sql'],
        },
        annotations: { readOnlyHint: true },
      },
    ],
    resources: [
      { uri: 'postgres://localhost/yyc3_devops/schema', name: 'Database Schema', description: 'Complete database schema', mimeType: 'application/json' },
    ],
    resourceTemplates: [
      { uriTemplate: 'postgres://localhost/yyc3_devops/tables/{table}', name: 'Table Schema', description: 'Schema for a specific table' },
    ],
    prompts: [],
    status: 'disconnected',
    category: 'community',
    tags: ['database', 'sql', 'postgres'],
    icon: 'database',
    color: 'text-cyan-400',
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
  {
    id: 'mcp-yyc3-cluster',
    name: 'YYC3 Cluster',
    version: '1.0.0',
    description: 'YYC3 Custom MCP Server - Cluster management, metrics, Docker operations',
    transport: 'stdio',
    command: 'node',
    args: ['./mcp-server/index.js'],
    env: {
      NAS_HOST: '192.168.3.45',
      NAS_PORT: '9898',
      DOCKER_PORT: '2375',
    },
    capabilities: { tools: true, resources: true, prompts: true, logging: true, sampling: true },
    tools: [
      {
        name: 'cluster_status',
        description: 'Get real-time health and metrics for all cluster nodes',
        inputSchema: {
          type: 'object',
          properties: {
            node: { type: 'string', description: 'Specific node ID or "all"', enum: ['all', 'm4-max', 'imac-m4', 'matebook', 'yanyucloud'] },
          },
        },
      },
      {
        name: 'docker_containers',
        description: 'List and manage Docker containers on NAS',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', description: 'Action to perform', enum: ['list', 'start', 'stop', 'restart', 'logs'] },
            container_id: { type: 'string', description: 'Container ID (for start/stop/restart/logs)' },
          },
          required: ['action'],
        },
      },
      {
        name: 'sqlite_query',
        description: 'Execute SQL query on NAS SQLite database',
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string', description: 'SQL query to execute' },
            db_path: { type: 'string', description: 'Database file path on NAS' },
          },
          required: ['sql'],
        },
      },
      {
        name: 'system_diagnostics',
        description: 'Run comprehensive system diagnostics across the cluster',
        inputSchema: {
          type: 'object',
          properties: {
            scope: { type: 'string', description: 'Diagnostic scope', enum: ['full', 'network', 'storage', 'compute', 'security'] },
          },
        },
      },
      {
        name: 'deploy_service',
        description: 'Deploy or update a service on the cluster',
        inputSchema: {
          type: 'object',
          properties: {
            service_name: { type: 'string', description: 'Service to deploy' },
            target_node: { type: 'string', description: 'Target deployment node' },
            image: { type: 'string', description: 'Docker image' },
            ports: { type: 'string', description: 'Port mapping (e.g., "8080:80")' },
          },
          required: ['service_name', 'image'],
        },
        annotations: { destructiveHint: true },
      },
    ],
    resources: [
      { uri: 'yyc3://metrics/cluster', name: 'Cluster Metrics', description: 'Real-time cluster health metrics', mimeType: 'application/json' },
      { uri: 'yyc3://projects/list', name: 'Project Registry', description: 'All registered YYC3 projects', mimeType: 'application/json' },
      { uri: 'yyc3://logs/recent', name: 'Recent Logs', description: 'Last 100 system log entries', mimeType: 'application/json' },
      { uri: 'yyc3://docker/containers', name: 'Docker Containers', description: 'NAS Docker container list', mimeType: 'application/json' },
      { uri: 'yyc3://config/devices', name: 'Device Configs', description: 'Cluster device configurations', mimeType: 'application/json' },
    ],
    resourceTemplates: [
      { uriTemplate: 'yyc3://metrics/{node_id}/{metric_type}', name: 'Node Metric', description: 'Specific metric for a node' },
      { uriTemplate: 'yyc3://docker/containers/{id}/logs', name: 'Container Logs', description: 'Logs for a specific container' },
    ],
    prompts: [
      {
        name: 'cluster_report',
        description: 'Generate a comprehensive cluster health report',
        arguments: [
          { name: 'timeframe', description: 'Report timeframe (1h, 6h, 24h, 7d)', required: false },
          { name: 'format', description: 'Output format (markdown, json, text)', required: false },
        ],
      },
      {
        name: 'incident_response',
        description: 'Guide through incident response for a cluster issue',
        arguments: [
          { name: 'severity', description: 'Incident severity (low, medium, high, critical)', required: true },
          { name: 'affected_node', description: 'Which node is affected', required: true },
        ],
      },
    ],
    status: 'disconnected',
    category: 'custom',
    tags: ['cluster', 'docker', 'nas', 'metrics', 'devops'],
    icon: 'server',
    color: 'text-amber-400',
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
  {
    id: 'mcp-github',
    name: 'GitHub',
    version: '1.0.0',
    description: 'MCP GitHub Server - Repository management, issues, PRs, and code search',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'YOUR_GITHUB_TOKEN' },
    capabilities: { tools: true, resources: true, prompts: false, logging: false, sampling: false },
    tools: [
      {
        name: 'search_repositories',
        description: 'Search for GitHub repositories',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            page: { type: 'number', description: 'Page number' },
          },
          required: ['query'],
        },
        annotations: { readOnlyHint: true },
      },
      {
        name: 'create_issue',
        description: 'Create a new issue in a GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            title: { type: 'string', description: 'Issue title' },
            body: { type: 'string', description: 'Issue body' },
          },
          required: ['owner', 'repo', 'title'],
        },
      },
      {
        name: 'get_file_contents',
        description: 'Get contents of a file or directory from a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            path: { type: 'string', description: 'File or directory path' },
            branch: { type: 'string', description: 'Branch name' },
          },
          required: ['owner', 'repo', 'path'],
        },
        annotations: { readOnlyHint: true },
      },
    ],
    resources: [],
    resourceTemplates: [
      { uriTemplate: 'github://{owner}/{repo}', name: 'Repository', description: 'GitHub repository' },
      { uriTemplate: 'github://{owner}/{repo}/issues', name: 'Issues', description: 'Repository issues' },
    ],
    prompts: [],
    status: 'disconnected',
    category: 'community',
    tags: ['github', 'git', 'code', 'repository'],
    icon: 'github',
    color: 'text-zinc-300',
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
  {
    id: 'mcp-web-search',
    name: 'Web Search',
    version: '1.0.0',
    description: 'MCP Web Search Server - Brave Search API integration for web and local search',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    env: { BRAVE_API_KEY: 'YOUR_BRAVE_API_KEY' },
    capabilities: { tools: true, resources: false, prompts: false, logging: false, sampling: false },
    tools: [
      {
        name: 'brave_web_search',
        description: 'Perform a web search using Brave Search API',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            count: { type: 'number', description: 'Number of results (max 20)' },
          },
          required: ['query'],
        },
        annotations: { readOnlyHint: true, openWorldHint: true },
      },
      {
        name: 'brave_local_search',
        description: 'Search for local businesses and places',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Local search query' },
            count: { type: 'number', description: 'Number of results' },
          },
          required: ['query'],
        },
        annotations: { readOnlyHint: true },
      },
    ],
    resources: [],
    resourceTemplates: [],
    prompts: [],
    status: 'disconnected',
    category: 'community',
    tags: ['search', 'web', 'brave'],
    icon: 'search',
    color: 'text-orange-400',
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
];

// ============================================================
// 7. MCP Call Format Presets
// ============================================================

export interface MCPCallPreset {
  id: string;
  name: string;
  description: string;
  method: string;
  paramsTemplate: Record<string, unknown>;
  exampleResponse: unknown;
  category: 'lifecycle' | 'tools' | 'resources' | 'prompts' | 'utilities';
}

export const MCP_CALL_PRESETS: MCPCallPreset[] = [
  // Lifecycle
  {
    id: 'initialize',
    name: 'Initialize',
    description: 'Initialize MCP connection with capability negotiation',
    method: 'initialize',
    category: 'lifecycle',
    paramsTemplate: {
      protocolVersion: '2025-03-26',
      capabilities: {
        roots: { listChanged: true },
        sampling: {},
      },
      clientInfo: {
        name: 'yyc3-hacker-chatbot',
        version: '1.0.0',
      },
    },
    exampleResponse: {
      protocolVersion: '2025-03-26',
      capabilities: { tools: { listChanged: true }, resources: { subscribe: true, listChanged: true } },
      serverInfo: { name: 'yyc3-cluster', version: '1.0.0' },
    },
  },
  {
    id: 'ping',
    name: 'Ping',
    description: 'Health check ping to verify server is alive',
    method: 'ping',
    category: 'lifecycle',
    paramsTemplate: {},
    exampleResponse: {},
  },
  // Tools
  {
    id: 'tools-list',
    name: 'List Tools',
    description: 'Enumerate all available tools from the server',
    method: 'tools/list',
    category: 'tools',
    paramsTemplate: {},
    exampleResponse: {
      tools: [
        { name: 'cluster_status', description: 'Get cluster health', inputSchema: { type: 'object', properties: {} } },
      ],
    },
  },
  {
    id: 'tools-call',
    name: 'Call Tool',
    description: 'Invoke a specific tool with arguments',
    method: 'tools/call',
    category: 'tools',
    paramsTemplate: {
      name: 'tool_name',
      arguments: {},
    },
    exampleResponse: {
      content: [{ type: 'text', text: 'Tool execution result...' }],
    },
  },
  // Resources
  {
    id: 'resources-list',
    name: 'List Resources',
    description: 'Enumerate available resources from the server',
    method: 'resources/list',
    category: 'resources',
    paramsTemplate: {},
    exampleResponse: {
      resources: [
        { uri: 'yyc3://metrics/cluster', name: 'Cluster Metrics', mimeType: 'application/json' },
      ],
    },
  },
  {
    id: 'resources-read',
    name: 'Read Resource',
    description: 'Read a specific resource by URI',
    method: 'resources/read',
    category: 'resources',
    paramsTemplate: {
      uri: 'yyc3://metrics/cluster',
    },
    exampleResponse: {
      contents: [{ uri: 'yyc3://metrics/cluster', mimeType: 'application/json', text: '{"status":"healthy"}' }],
    },
  },
  {
    id: 'resources-templates',
    name: 'List Resource Templates',
    description: 'Get URI templates for parameterized resources',
    method: 'resources/templates/list',
    category: 'resources',
    paramsTemplate: {},
    exampleResponse: {
      resourceTemplates: [
        { uriTemplate: 'yyc3://metrics/{node_id}', name: 'Node Metrics' },
      ],
    },
  },
  // Prompts
  {
    id: 'prompts-list',
    name: 'List Prompts',
    description: 'Enumerate available prompt templates',
    method: 'prompts/list',
    category: 'prompts',
    paramsTemplate: {},
    exampleResponse: {
      prompts: [
        { name: 'cluster_report', description: 'Generate cluster health report' },
      ],
    },
  },
  {
    id: 'prompts-get',
    name: 'Get Prompt',
    description: 'Get a specific prompt with arguments applied',
    method: 'prompts/get',
    category: 'prompts',
    paramsTemplate: {
      name: 'cluster_report',
      arguments: { timeframe: '24h', format: 'markdown' },
    },
    exampleResponse: {
      description: 'Cluster health report for last 24 hours',
      messages: [
        { role: 'user', content: { type: 'text', text: 'Generate a cluster health report...' } },
      ],
    },
  },
  // Utilities
  {
    id: 'logging',
    name: 'Set Log Level',
    description: 'Configure server-side logging level',
    method: 'logging/setLevel',
    category: 'utilities',
    paramsTemplate: {
      level: 'info',
    },
    exampleResponse: {},
  },
  {
    id: 'completion',
    name: 'Completion',
    description: 'Request argument auto-completion from the server',
    method: 'completion/complete',
    category: 'utilities',
    paramsTemplate: {
      ref: { type: 'ref/resource', uri: 'yyc3://metrics/' },
      argument: { name: 'node_id', value: 'm' },
    },
    exampleResponse: {
      completion: { values: ['m4-max', 'matebook'], total: 2, hasMore: false },
    },
  },
];

// ============================================================
// 8. MCP Service Registry (localStorage)
// ============================================================

const MCP_REGISTRY_KEY = 'yyc3-mcp-registry';

export function loadMCPRegistry(): MCPServerDefinition[] {
  try {
    const raw = localStorage.getItem(MCP_REGISTRY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

/**
 * Phase 35: Decrypt MCP credentials (tokens in env)
 */
export async function initMCPRegistry(): Promise<MCPServerDefinition[]> {
  try {
    const raw = localStorage.getItem(MCP_REGISTRY_KEY);
    if (!raw) return [];
    const servers = JSON.parse(raw) as MCPServerDefinition[];
    
    return await Promise.all(servers.map(async s => {
      if (s.env && s.encrypted) {
        const decryptedEnv: Record<string, string> = {};
        for (const [key, value] of Object.entries(s.env)) {
          decryptedEnv[key] = await decryptValue(value);
        }
        return { ...s, env: decryptedEnv, encrypted: false };
      }
      return s;
    }));
  } catch { return []; }
}

export async function saveMCPRegistry(servers: MCPServerDefinition[]): Promise<void> {
  try {
    const encryptEnabled = isCryptoAvailable();
    const processedServers = await Promise.all(servers.map(async s => {
      // Check if any env value might be a token (heuristic: ALL_CAPS or contains 'TOKEN', 'KEY', 'SECRET')
      const envKeys = s.env ? Object.keys(s.env) : [];
      const hasSensitiveKeys = envKeys.some(k => 
        k.toUpperCase().includes('TOKEN') || 
        k.toUpperCase().includes('KEY') || 
        k.toUpperCase().includes('SECRET') ||
        (k === k.toUpperCase() && k.length > 2)
      );

      if (s.env && hasSensitiveKeys && !s.encrypted && encryptEnabled) {
        const encryptedEnv: Record<string, string> = {};
        for (const [key, value] of Object.entries(s.env)) {
          encryptedEnv[key] = await encryptValue(value);
        }
        return { ...s, env: encryptedEnv, encrypted: true };
      }
      return s;
    }));
    localStorage.setItem(MCP_REGISTRY_KEY, JSON.stringify(processedServers));
  } catch { /* ignore */ }
}

export function getAllMCPServers(): MCPServerDefinition[] {
  const custom = loadMCPRegistry();
  const presetIds = new Set(custom.map(s => s.id));
  const presets = MCP_SERVER_PRESETS.filter(p => !presetIds.has(p.id));
  return [...presets, ...custom];
}

export async function registerMCPServer(server: MCPServerDefinition): Promise<void> {
  const existing = await initMCPRegistry(); // use decrypted versions for manipulation
  const idx = existing.findIndex(s => s.id === server.id);
  if (idx >= 0) {
    existing[idx] = server;
  } else {
    existing.push(server);
  }
  await saveMCPRegistry(existing);
}

export async function removeMCPServer(serverId: string): Promise<void> {
  const existing = (await initMCPRegistry()).filter(s => s.id !== serverId);
  await saveMCPRegistry(existing);
}

// ============================================================
// 9. MCP Call Execution (Mock Runtime)
// ============================================================

export interface MCPCallResult {
  success: boolean;
  method: string;
  serverId: string;
  latencyMs: number;
  response: MCPJsonRpcResponse;
  timestamp: number;
}

const MCP_CALL_LOG_KEY = 'yyc3-mcp-call-log';

export function logMCPCall(result: MCPCallResult): void {
  try {
    const log: MCPCallResult[] = JSON.parse(localStorage.getItem(MCP_CALL_LOG_KEY) || '[]');
    log.unshift(result);
    localStorage.setItem(MCP_CALL_LOG_KEY, JSON.stringify(log.slice(0, 200)));
  } catch { /* ignore */ }
}

export function getMCPCallLog(): MCPCallResult[] {
  try {
    return JSON.parse(localStorage.getItem(MCP_CALL_LOG_KEY) || '[]');
  } catch { return []; }
}

/**
 * Simulate an MCP call (mock runtime for frontend-only mode)
 */
export async function executeMCPCall(
  serverId: string,
  method: string,
  params: Record<string, unknown> = {}
): Promise<MCPCallResult> {
  const start = performance.now();
  const id = Date.now();

  // Simulate latency
  await new Promise(r => setTimeout(r, 200 + Math.random() * 500));

  const server = getAllMCPServers().find(s => s.id === serverId);
  if (!server) {
    const result: MCPCallResult = {
      success: false,
      method,
      serverId,
      latencyMs: Math.round(performance.now() - start),
      response: {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Server "${serverId}" not found` },
      },
      timestamp: Date.now(),
    };
    logMCPCall(result);
    return result;
  }

  let responseResult: unknown;

  switch (method) {
    case 'initialize':
      responseResult = {
        protocolVersion: '2025-03-26',
        capabilities: server.capabilities,
        serverInfo: { name: server.name, version: server.version },
      };
      break;
    case 'ping':
      responseResult = {};
      break;
    case 'tools/list':
      responseResult = { tools: server.tools };
      break;
    case 'tools/call': {
      const toolName = params.name as string;
      const tool = server.tools.find(t => t.name === toolName);
      if (tool) {
        responseResult = {
          content: [{ type: 'text', text: `[Mock] Tool "${toolName}" executed successfully with args: ${JSON.stringify(params.arguments || {})}` }],
        };
      } else {
        const errResult: MCPCallResult = {
          success: false,
          method,
          serverId,
          latencyMs: Math.round(performance.now() - start),
          response: {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `Tool "${toolName}" not found on server "${server.name}"` },
          },
          timestamp: Date.now(),
        };
        logMCPCall(errResult);
        return errResult;
      }
      break;
    }
    case 'resources/list':
      responseResult = { resources: server.resources };
      break;
    case 'resources/read': {
      const uri = params.uri as string;
      const res = server.resources.find(r => r.uri === uri);
      if (res) {
        responseResult = {
          contents: [{ uri, mimeType: res.mimeType || 'application/json', text: `[Mock] Resource data for ${uri}` }],
        };
      } else {
        responseResult = {
          contents: [{ uri, mimeType: 'text/plain', text: `[Mock] Resource "${uri}" - sample data` }],
        };
      }
      break;
    }
    case 'resources/templates/list':
      responseResult = { resourceTemplates: server.resourceTemplates };
      break;
    case 'prompts/list':
      responseResult = { prompts: server.prompts };
      break;
    case 'prompts/get': {
      const promptName = params.name as string;
      const prompt = server.prompts.find(p => p.name === promptName);
      responseResult = {
        description: prompt?.description || 'Unknown prompt',
        messages: [
          { role: 'user', content: { type: 'text', text: `[Mock] Prompt "${promptName}" with args: ${JSON.stringify(params.arguments || {})}` } },
        ],
      };
      break;
    }
    default:
      responseResult = { message: `[Mock] Method "${method}" executed` };
  }

  const result: MCPCallResult = {
    success: true,
    method,
    serverId,
    latencyMs: Math.round(performance.now() - start),
    response: {
      jsonrpc: '2.0',
      id,
      result: responseResult,
    },
    timestamp: Date.now(),
  };

  logMCPCall(result);
  return result;
}

// ============================================================
// 10. MCP Code Generator
// ============================================================

export function generateMCPServerCode(server: MCPServerDefinition): string {
  const toolHandlers = server.tools.map(tool => {
    const params = Object.entries(tool.inputSchema.properties)
      .map(([key, val]) => `    // ${key}: ${val.description || val.type}`)
      .join('\n');
    return `  // Tool: ${tool.name}
  // ${tool.description}
${params}`;
  }).join('\n\n');

  return `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "${server.name.toLowerCase().replace(/\s+/g, '-')}",
  version: "${server.version}",
}, {
  capabilities: {
    ${server.capabilities.tools ? 'tools: {},' : ''}
    ${server.capabilities.resources ? 'resources: {},' : ''}
    ${server.capabilities.prompts ? 'prompts: {},' : ''}
    ${server.capabilities.logging ? 'logging: {},' : ''}
  },
});

// ============================
// Tools Registration
// ============================
server.setRequestHandler("tools/list", async () => ({
  tools: ${JSON.stringify(server.tools, null, 4).replace(/\n/g, '\n  ')}
}));

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
${server.tools.map(t => `    case "${t.name}":
      // TODO: Implement ${t.name}
      return { content: [{ type: "text", text: "Result of ${t.name}" }] };`).join('\n\n')}
    default:
      throw new Error(\`Unknown tool: \${name}\`);
  }
});

${server.capabilities.resources ? `// ============================
// Resources Registration
// ============================
server.setRequestHandler("resources/list", async () => ({
  resources: ${JSON.stringify(server.resources, null, 4).replace(/\n/g, '\n  ')}
}));

server.setRequestHandler("resources/read", async (request) => {
  const { uri } = request.params;
  // TODO: Implement resource reading logic
  return {
    contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ status: "ok" }) }]
  };
});` : ''}

${server.capabilities.prompts ? `// ============================
// Prompts Registration
// ============================
server.setRequestHandler("prompts/list", async () => ({
  prompts: ${JSON.stringify(server.prompts, null, 4).replace(/\n/g, '\n  ')}
}));

server.setRequestHandler("prompts/get", async (request) => {
  const { name, arguments: args } = request.params;
  // TODO: Implement prompt generation logic
  return {
    messages: [{ role: "user", content: { type: "text", text: \`Generated prompt for \${name}\` } }]
  };
});` : ''}

// ============================
// Start Server
// ============================
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("${server.name} MCP server running on stdio");

/*
${toolHandlers}
*/
`;
}

export function generateMCPClientConfig(servers: MCPServerDefinition[]): string {
  const config: Record<string, unknown> = {
    mcpServers: {} as Record<string, unknown>,
  };

  for (const server of servers) {
    const entry: Record<string, unknown> = {};
    if (server.transport === 'stdio') {
      entry.command = server.command;
      entry.args = server.args;
      if (server.env && Object.keys(server.env).length > 0) {
        entry.env = server.env;
      }
    } else {
      entry.url = server.url;
    }
    (config.mcpServers as Record<string, unknown>)[server.name.toLowerCase().replace(/\s+/g, '-')] = entry;
  }

  return JSON.stringify(config, null, 2);
}

// ============================================================
// 11. Real MCP Transport Layer (Phase 18.3)
// ============================================================

/**
 * Transport connection state for HTTP-based MCP servers.
 * stdio transport cannot be used from a browser — those are for
 * CLI/desktop clients (Claude Desktop, Cursor, etc.)
 */

export interface MCPTransportConnection {
  serverId: string;
  transport: MCPTransport;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  url?: string;
  sessionId?: string;
  lastPing?: number;
  latencyMs?: number;
  error?: string;
}

const _connections = new Map<string, MCPTransportConnection>();

/**
 * Get active connection for a server
 */
export function getMCPConnection(serverId: string): MCPTransportConnection | undefined {
  return _connections.get(serverId);
}

/**
 * Get all active connections
 */
export function getAllMCPConnections(): MCPTransportConnection[] {
  return Array.from(_connections.values());
}

/**
 * Test connectivity to an HTTP-based MCP server
 */
export async function testMCPConnection(
  server: MCPServerDefinition
): Promise<{ success: boolean; latencyMs: number; error?: string; serverInfo?: string }> {
  if (server.transport === 'stdio') {
    return {
      success: false,
      latencyMs: 0,
      error: 'stdio transport cannot be directly connected from the browser. Use Claude Desktop or Cursor config instead.',
    };
  }

  if (!server.url) {
    return { success: false, latencyMs: 0, error: 'No URL configured for this server' };
  }

  const startTime = performance.now();

  try {
    // Send JSON-RPC 2.0 initialize request
    const initRequest: MCPJsonRpcRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {
          roots: { listChanged: true },
        },
        clientInfo: {
          name: 'yyc3-hacker-chatbot',
          version: '1.0.0',
        },
      },
    };

    const response = await fetch(server.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(server.env?.['AUTH_TOKEN'] ? { 'Authorization': `Bearer ${server.env['AUTH_TOKEN']}` } : {}),
      },
      body: JSON.stringify(initRequest),
      signal: AbortSignal.timeout(10000),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        success: false,
        latencyMs,
        error: `HTTP ${response.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await response.json() as MCPJsonRpcResponse;

    if (data.error) {
      return {
        success: false,
        latencyMs,
        error: `MCP Error ${data.error.code}: ${data.error.message}`,
      };
    }

    return {
      success: true,
      latencyMs,
      serverInfo: JSON.stringify(data.result, null, 2),
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - startTime);
    const err = error as Error;

    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return { success: false, latencyMs, error: 'Connection timeout (10s)' };
    }

    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      return { success: false, latencyMs, error: 'Network error — server unreachable or CORS blocked' };
    }

    return { success: false, latencyMs, error: err.message || 'Unknown error' };
  }
}

/**
 * Connect to an HTTP-based MCP server
 * Establishes session and discovers capabilities
 */
export async function connectMCPServer(
  server: MCPServerDefinition
): Promise<MCPTransportConnection> {
  const conn: MCPTransportConnection = {
    serverId: server.id,
    transport: server.transport,
    status: 'connecting',
  };
  _connections.set(server.id, conn);

  if (server.transport === 'stdio') {
    conn.status = 'error';
    conn.error = 'stdio transport not available in browser';
    return conn;
  }

  const testResult = await testMCPConnection(server);

  if (testResult.success) {
    conn.status = 'connected';
    conn.url = server.url;
    conn.latencyMs = testResult.latencyMs;
    conn.lastPing = Date.now();

    // Send initialized notification (per MCP spec)
    if (server.url) {
      try {
        await fetch(server.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
        });
      } catch { /* notification failures are non-critical */ }
    }
  } else {
    conn.status = 'error';
    conn.error = testResult.error;
    conn.latencyMs = testResult.latencyMs;
  }

  return conn;
}

/**
 * Disconnect from an MCP server
 */
export function disconnectMCPServer(serverId: string): void {
  _connections.delete(serverId);
}

/**
 * Execute a real JSON-RPC 2.0 call to a connected HTTP MCP server.
 * Falls back to mock execution if not connected.
 */
export async function executeRealMCPCall(
  serverId: string,
  method: string,
  params: Record<string, unknown> = {}
): Promise<MCPCallResult> {
  const start = performance.now();
  const id = Date.now();

  const conn = _connections.get(serverId);
  const server = getAllMCPServers().find(s => s.id === serverId);

  // If not connected or no URL, fall back to mock
  if (!conn || conn.status !== 'connected' || !conn.url) {
    return executeMCPCall(serverId, method, params);
  }

  try {
    const request: MCPJsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params: Object.keys(params).length > 0 ? params : undefined,
    };

    const response = await fetch(conn.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(server?.env?.['AUTH_TOKEN'] ? { 'Authorization': `Bearer ${server.env['AUTH_TOKEN']}` } : {}),
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30000),
    });

    const latencyMs = Math.round(performance.now() - start);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      const result: MCPCallResult = {
        success: false,
        method,
        serverId,
        latencyMs,
        response: {
          jsonrpc: '2.0',
          id,
          error: { code: -32000, message: `HTTP ${response.status}: ${errText.slice(0, 200)}` },
        },
        timestamp: Date.now(),
      };
      logMCPCall(result);
      return result;
    }

    const data = await response.json() as MCPJsonRpcResponse;

    const result: MCPCallResult = {
      success: !data.error,
      method,
      serverId,
      latencyMs,
      response: data,
      timestamp: Date.now(),
    };

    logMCPCall(result);
    conn.lastPing = Date.now();
    conn.latencyMs = latencyMs;
    return result;

  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    const err = error as Error;

    const result: MCPCallResult = {
      success: false,
      method,
      serverId,
      latencyMs,
      response: {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: err.message || 'Transport error' },
      },
      timestamp: Date.now(),
    };

    logMCPCall(result);

    // Mark connection as errored
    conn.status = 'error';
    conn.error = err.message;

    return result;
  }
}

/**
 * Smart MCP call executor — uses real transport if connected, mock otherwise
 */
export async function smartMCPCall(
  serverId: string,
  method: string,
  params: Record<string, unknown> = {}
): Promise<MCPCallResult> {
  const conn = _connections.get(serverId);

  // Emit to event bus
  try {
    const { eventBus } = await import('./event-bus');
    const mode = conn?.status === 'connected' ? 'REAL' : 'MOCK';
    eventBus.mcp('call', `[${mode}] ${method} → ${serverId}`, 'info', { serverId, method, mode });
  } catch { /* bus not available */ }

  if (conn?.status === 'connected') {
    return executeRealMCPCall(serverId, method, params);
  }

  return executeMCPCall(serverId, method, params);
}