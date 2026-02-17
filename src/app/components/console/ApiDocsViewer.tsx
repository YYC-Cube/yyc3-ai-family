// ============================================================
// YYC3 Hacker Chatbot — API Documentation Viewer
// Phase 23: Comprehensive API Reference
// ============================================================

import * as React from 'react';
import {
  FileText, Search, ChevronRight, Copy, CheckCircle2,
  Server, Database, Cpu, Shield, Network, Box,
  Activity, Layers, ExternalLink, Code
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ApiEndpoint, ApiParameter, ApiResponse } from '@/lib/types';

// ============================================================
// API Registry — Full Documentation
// ============================================================

const API_DOCS: ApiEndpoint[] = [
  // --- NAS SQLite HTTP Proxy ---
  {
    id: 'sqlite-query',
    method: 'POST',
    path: '/api/db/query',
    summary: 'Execute SQL Query',
    description: 'Execute a SQL query against the NAS SQLite database. Supports SELECT, INSERT, UPDATE, DELETE statements with parameterized queries for SQL injection prevention.',
    category: 'NAS SQLite',
    requestBody: {
      contentType: 'application/json',
      schema: { db: 'string (database path)', sql: 'string (SQL statement)', params: 'array (bind parameters)' },
      example: JSON.stringify({ db: '/Volume2/yyc3/yyc3.db', sql: 'SELECT * FROM knowledge_base WHERE category = ?', params: ['devops'] }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Query executed successfully', example: JSON.stringify({ columns: ['id', 'title', 'category'], rows: [['1', 'Docker Guide', 'devops']], rowCount: 1, changesCount: 0 }, null, 2) },
      { status: 400, description: 'Invalid SQL or parameters' },
      { status: 500, description: 'Database error' },
    ],
    tags: ['database', 'sqlite', 'nas'],
  },
  {
    id: 'sqlite-test',
    method: 'POST',
    path: '/api/db/query',
    summary: 'Test SQLite Connection',
    description: 'Test connectivity to the NAS SQLite HTTP proxy by executing a simple version query.',
    category: 'NAS SQLite',
    requestBody: {
      contentType: 'application/json',
      schema: { db: 'string', sql: 'string' },
      example: JSON.stringify({ db: '/Volume2/yyc3/yyc3.db', sql: 'SELECT sqlite_version() as version', params: [] }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Connection successful', example: JSON.stringify({ columns: ['version'], rows: [['3.45.3']], rowCount: 1 }, null, 2) },
    ],
    tags: ['database', 'health'],
  },

  // --- Docker Engine API ---
  {
    id: 'docker-ping',
    method: 'GET',
    path: '/{version}/_ping',
    summary: 'Docker Engine Ping',
    description: 'Check if the Docker Engine is accessible and responding on the NAS (192.168.3.45:2375).',
    category: 'Docker Engine',
    parameters: [
      { name: 'version', in: 'path', required: true, type: 'string', description: 'API version (e.g., v1.41)', default: 'v1.41' },
    ],
    responses: [
      { status: 200, description: 'Docker Engine is alive', example: 'OK' },
      { status: 503, description: 'Docker Engine unreachable' },
    ],
    tags: ['docker', 'health'],
  },
  {
    id: 'docker-info',
    method: 'GET',
    path: '/{version}/info',
    summary: 'Docker System Info',
    description: 'Get detailed information about the Docker Engine including containers count, images, OS, kernel version, CPU, memory.',
    category: 'Docker Engine',
    parameters: [
      { name: 'version', in: 'path', required: true, type: 'string', description: 'API version', default: 'v1.41' },
    ],
    responses: [
      { status: 200, description: 'System information', example: JSON.stringify({ Containers: 7, ContainersRunning: 6, Images: 12, NCPU: 4, MemTotal: 34359738368, ServerVersion: '24.0.7' }, null, 2) },
    ],
    tags: ['docker', 'system'],
  },
  {
    id: 'docker-containers-list',
    method: 'GET',
    path: '/{version}/containers/json',
    summary: 'List Containers',
    description: 'List all Docker containers (running and stopped) on the NAS Docker Engine.',
    category: 'Docker Engine',
    parameters: [
      { name: 'version', in: 'path', required: true, type: 'string', description: 'API version', default: 'v1.41' },
      { name: 'all', in: 'query', required: false, type: 'boolean', description: 'Show all containers (including stopped)', default: 'true' },
    ],
    responses: [
      { status: 200, description: 'Container list', example: JSON.stringify([{ Id: 'abc123', Names: ['/yyc3-postgres'], Image: 'postgres:16', State: 'running', Status: 'Up 7 days' }], null, 2) },
    ],
    tags: ['docker', 'containers'],
  },
  {
    id: 'docker-container-start',
    method: 'POST',
    path: '/{version}/containers/{id}/start',
    summary: 'Start Container',
    description: 'Start a stopped container by ID.',
    category: 'Docker Engine',
    parameters: [
      { name: 'version', in: 'path', required: true, type: 'string', description: 'API version', default: 'v1.41' },
      { name: 'id', in: 'path', required: true, type: 'string', description: 'Container ID or name' },
    ],
    responses: [
      { status: 204, description: 'Container started' },
      { status: 304, description: 'Container already running' },
      { status: 404, description: 'Container not found' },
    ],
    tags: ['docker', 'containers'],
  },
  {
    id: 'docker-container-stop',
    method: 'POST',
    path: '/{version}/containers/{id}/stop',
    summary: 'Stop Container',
    description: 'Stop a running container by ID.',
    category: 'Docker Engine',
    parameters: [
      { name: 'version', in: 'path', required: true, type: 'string', description: 'API version', default: 'v1.41' },
      { name: 'id', in: 'path', required: true, type: 'string', description: 'Container ID or name' },
    ],
    responses: [
      { status: 204, description: 'Container stopped' },
      { status: 404, description: 'Container not found' },
    ],
    tags: ['docker', 'containers'],
  },
  {
    id: 'docker-container-logs',
    method: 'GET',
    path: '/{version}/containers/{id}/logs',
    summary: 'Get Container Logs',
    description: 'Retrieve stdout/stderr logs from a container.',
    category: 'Docker Engine',
    parameters: [
      { name: 'version', in: 'path', required: true, type: 'string', description: 'API version', default: 'v1.41' },
      { name: 'id', in: 'path', required: true, type: 'string', description: 'Container ID or name' },
      { name: 'stdout', in: 'query', required: false, type: 'boolean', description: 'Show stdout', default: 'true' },
      { name: 'stderr', in: 'query', required: false, type: 'boolean', description: 'Show stderr', default: 'true' },
      { name: 'tail', in: 'query', required: false, type: 'number', description: 'Number of lines to tail', default: '100' },
    ],
    responses: [
      { status: 200, description: 'Log output (text/plain)' },
      { status: 404, description: 'Container not found' },
    ],
    tags: ['docker', 'containers', 'logs'],
  },
  {
    id: 'docker-images-list',
    method: 'GET',
    path: '/{version}/images/json',
    summary: 'List Images',
    description: 'List all Docker images available on the NAS.',
    category: 'Docker Engine',
    parameters: [
      { name: 'version', in: 'path', required: true, type: 'string', description: 'API version', default: 'v1.41' },
    ],
    responses: [
      { status: 200, description: 'Image list' },
    ],
    tags: ['docker', 'images'],
  },
  {
    id: 'docker-image-pull',
    method: 'POST',
    path: '/{version}/images/create',
    summary: 'Pull Image',
    description: 'Pull a Docker image from a registry.',
    category: 'Docker Engine',
    parameters: [
      { name: 'version', in: 'path', required: true, type: 'string', description: 'API version', default: 'v1.41' },
      { name: 'fromImage', in: 'query', required: true, type: 'string', description: 'Image name (e.g., nginx:latest)' },
    ],
    responses: [
      { status: 200, description: 'Pull progress stream' },
      { status: 404, description: 'Image not found in registry' },
    ],
    tags: ['docker', 'images'],
  },

  // --- Ollama API ---
  {
    id: 'ollama-tags',
    method: 'GET',
    path: '/api/tags',
    summary: 'List Local Models',
    description: 'List all locally available Ollama models with their metadata (size, family, quantization, etc.).',
    category: 'Ollama',
    parameters: [],
    responses: [
      { status: 200, description: 'Model list', example: JSON.stringify({ models: [{ name: 'qwen2.5:72b', size: 41536843776, details: { parameter_size: '72B', family: 'qwen2' } }] }, null, 2) },
    ],
    tags: ['ollama', 'models'],
  },
  {
    id: 'ollama-ps',
    method: 'GET',
    path: '/api/ps',
    summary: 'List Running Models',
    description: 'List currently loaded models in memory/VRAM.',
    category: 'Ollama',
    parameters: [],
    responses: [
      { status: 200, description: 'Running models', example: JSON.stringify({ models: [{ name: 'qwen2.5:72b', size_vram: 41536843776 }] }, null, 2) },
    ],
    tags: ['ollama', 'models', 'status'],
  },
  {
    id: 'ollama-generate',
    method: 'POST',
    path: '/api/generate',
    summary: 'Generate Completion',
    description: 'Generate a text completion using a local model. Supports streaming.',
    category: 'Ollama',
    requestBody: {
      contentType: 'application/json',
      schema: { model: 'string', prompt: 'string', stream: 'boolean' },
      example: JSON.stringify({ model: 'qwen2.5:72b', prompt: 'Explain Docker in 50 words', stream: true }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Streaming NDJSON response', example: '{"response":"Docker is...","done":false}\n{"response":" a platform","done":false}\n{"done":true}' },
    ],
    tags: ['ollama', 'inference'],
  },
  {
    id: 'ollama-chat',
    method: 'POST',
    path: '/api/chat',
    summary: 'Chat Completion',
    description: 'Multi-turn chat completion using OpenAI-compatible message format.',
    category: 'Ollama',
    requestBody: {
      contentType: 'application/json',
      schema: { model: 'string', messages: 'array', stream: 'boolean' },
      example: JSON.stringify({ model: 'qwen2.5:72b', messages: [{ role: 'user', content: 'Hello' }], stream: true }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Streaming chat response' },
    ],
    tags: ['ollama', 'inference', 'chat'],
  },
  {
    id: 'ollama-pull',
    method: 'POST',
    path: '/api/pull',
    summary: 'Pull Model',
    description: 'Download a model from the Ollama registry.',
    category: 'Ollama',
    requestBody: {
      contentType: 'application/json',
      schema: { name: 'string', stream: 'boolean' },
      example: JSON.stringify({ name: 'qwen2.5:7b', stream: true }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Pull progress stream' },
    ],
    tags: ['ollama', 'models'],
  },
  {
    id: 'ollama-delete',
    method: 'DELETE',
    path: '/api/delete',
    summary: 'Delete Model',
    description: 'Delete a locally stored model.',
    category: 'Ollama',
    requestBody: {
      contentType: 'application/json',
      schema: { name: 'string' },
      example: JSON.stringify({ name: 'qwen2.5:7b' }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Model deleted' },
      { status: 404, description: 'Model not found' },
    ],
    tags: ['ollama', 'models'],
  },

  // --- OpenAI Compatible (LLM Bridge) ---
  {
    id: 'llm-chat-completions',
    method: 'POST',
    path: '/v1/chat/completions',
    summary: 'Chat Completions (OpenAI Format)',
    description: 'Send chat completion requests to any OpenAI-compatible provider (OpenAI, DeepSeek, Zhipu, Google, Groq, Ollama, LM Studio). The LLM Bridge automatically routes to the correct provider endpoint.',
    category: 'LLM Bridge',
    requestBody: {
      contentType: 'application/json',
      schema: { model: 'string', messages: 'array', temperature: 'number', max_tokens: 'number', stream: 'boolean' },
      example: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: 'Hello' }], temperature: 0.7, max_tokens: 4096, stream: true }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'SSE stream of chat completion chunks' },
      { status: 401, description: 'Authentication failed (invalid API key)' },
      { status: 429, description: 'Rate limited' },
    ],
    tags: ['llm', 'openai', 'streaming'],
  },
  {
    id: 'anthropic-messages',
    method: 'POST',
    path: '/v1/messages',
    summary: 'Messages (Anthropic Format)',
    description: 'Send message requests in Anthropic format for Claude models. System prompt is separate from messages array.',
    category: 'LLM Bridge',
    requestBody: {
      contentType: 'application/json',
      schema: { model: 'string', system: 'string', messages: 'array', max_tokens: 'number', stream: 'boolean' },
      example: JSON.stringify({ model: 'claude-sonnet-4-20250514', system: 'You are Navigator.', messages: [{ role: 'user', content: 'Analyze cluster load' }], max_tokens: 4096, stream: true }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'SSE stream with message_start, content_block_delta, message_delta events' },
      { status: 401, description: 'Invalid API key' },
    ],
    tags: ['llm', 'anthropic', 'streaming'],
  },

  // --- Heartbeat WebSocket ---
  {
    id: 'ws-heartbeat',
    method: 'GET',
    path: '/ws/heartbeat',
    summary: 'Heartbeat WebSocket',
    description: 'WebSocket endpoint for family presence heartbeat. Clients send periodic heartbeat messages and receive presence updates for all connected family members.',
    category: 'WebSocket',
    parameters: [],
    responses: [
      { status: 101, description: 'WebSocket upgrade', example: JSON.stringify({ type: 'heartbeat', deviceId: 'mbp-max', timestamp: Date.now(), payload: { status: 'online' } }, null, 2) },
    ],
    tags: ['websocket', 'realtime', 'family'],
  },

  // --- MCP JSON-RPC ---
  {
    id: 'mcp-jsonrpc',
    method: 'POST',
    path: '/mcp',
    summary: 'MCP Tool Invocation (JSON-RPC 2.0)',
    description: 'Invoke MCP tools via JSON-RPC 2.0 protocol. Supports filesystem, Docker, database, browser, and GitHub tools.',
    category: 'MCP',
    requestBody: {
      contentType: 'application/json',
      schema: { jsonrpc: '2.0', method: 'string', params: 'object', id: 'string|number' },
      example: JSON.stringify({ jsonrpc: '2.0', method: 'tools/call', params: { name: 'filesystem_read', arguments: { path: '/etc/hosts' } }, id: 1 }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'JSON-RPC response', example: JSON.stringify({ jsonrpc: '2.0', result: { content: [{ type: 'text', text: '127.0.0.1 localhost' }] }, id: 1 }, null, 2) },
    ],
    tags: ['mcp', 'tools', 'jsonrpc'],
  },
  {
    id: 'mcp-list-tools',
    method: 'POST',
    path: '/mcp',
    summary: 'List Available MCP Tools',
    description: 'List all registered MCP tools and their schemas.',
    category: 'MCP',
    requestBody: {
      contentType: 'application/json',
      schema: { jsonrpc: '2.0', method: 'tools/list', id: 'number' },
      example: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', params: {}, id: 1 }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Tool list', example: JSON.stringify({ jsonrpc: '2.0', result: { tools: [{ name: 'filesystem_read', description: 'Read file contents', inputSchema: { type: 'object', properties: { path: { type: 'string' } } } }] }, id: 1 }, null, 2) },
    ],
    tags: ['mcp', 'tools'],
  },

  // --- Persistence Engine ---
  {
    id: 'persist-snapshot',
    method: 'POST',
    path: '/api/db/query',
    summary: 'Write Metrics Snapshot',
    description: 'Persist a cluster metrics snapshot to the NAS SQLite database via the Persistence Engine. Used by the persistence-binding module for periodic state snapshots.',
    category: 'NAS SQLite',
    requestBody: {
      contentType: 'application/json',
      schema: { db: 'string', sql: 'string', params: 'array' },
      example: JSON.stringify({ db: '/Volume2/yyc3/yyc3.db', sql: "INSERT INTO metrics_snapshots (timestamp, node_id, cpu, memory, disk, network) VALUES (?, ?, ?, ?, ?, ?)", params: [Date.now(), 'm4-max', 45.2, 62.8, 31.5, 120.3] }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Snapshot persisted', example: JSON.stringify({ columns: [], rows: [], rowCount: 0, changesCount: 1 }, null, 2) },
    ],
    tags: ['database', 'persistence', 'metrics'],
  },
  {
    id: 'persist-knowledge-write',
    method: 'POST',
    path: '/api/db/query',
    summary: 'Knowledge Base CRUD',
    description: 'Create, read, update, or delete knowledge base entries. Supports dual-write to both localStorage and NAS SQLite.',
    category: 'NAS SQLite',
    requestBody: {
      contentType: 'application/json',
      schema: { db: 'string', sql: 'string', params: 'array' },
      example: JSON.stringify({ db: '/Volume2/yyc3/yyc3.db', sql: "INSERT INTO knowledge_base (id, title, content, category, tags, created_at) VALUES (?, ?, ?, ?, ?, ?)", params: ['kb-001', 'Docker Best Practices', 'Content here...', 'devops', 'docker,containers', Date.now()] }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Entry written', example: JSON.stringify({ changesCount: 1 }, null, 2) },
    ],
    tags: ['database', 'knowledge', 'crud'],
  },

  // --- Docker Compose (Remote Deploy) ---
  {
    id: 'docker-compose-up',
    method: 'POST',
    path: '/{version}/containers/create',
    summary: 'Create Container from Compose',
    description: 'Create a new container with full configuration (image, ports, volumes, env vars, restart policy) as part of remote Docker Compose deployment workflow.',
    category: 'Docker Engine',
    requestBody: {
      contentType: 'application/json',
      schema: { Image: 'string', ExposedPorts: 'object', HostConfig: 'object', Env: 'array' },
      example: JSON.stringify({ Image: 'nginx:latest', ExposedPorts: { '80/tcp': {} }, HostConfig: { PortBindings: { '80/tcp': [{ HostPort: '8080' }] }, RestartPolicy: { Name: 'unless-stopped' } }, Env: ['NGINX_HOST=yyc3.local'] }, null, 2),
    },
    parameters: [
      { name: 'version', in: 'path' as const, required: true, type: 'string', description: 'API version', default: 'v1.41' },
      { name: 'name', in: 'query' as const, required: false, type: 'string', description: 'Container name' },
    ],
    responses: [
      { status: 201, description: 'Container created', example: JSON.stringify({ Id: 'abc123def456', Warnings: [] }, null, 2) },
      { status: 409, description: 'Container name conflict' },
    ],
    tags: ['docker', 'containers', 'deploy'],
  },

  // --- Event Bus (Internal) ---
  {
    id: 'eventbus-emit',
    method: 'POST',
    path: '/internal/event-bus/emit',
    summary: 'Event Bus Emit (Internal)',
    description: 'Internal API for the five-dimensional typed Event Bus. Supports 500-capacity RingBuffer with categories: persist, orchestrate, mcp, system, security, ui. Not exposed externally — used by Agent orchestrator and MCP tool chain.',
    category: 'Internal',
    requestBody: {
      contentType: 'application/json',
      schema: { category: 'EventCategory', level: 'EventLevel', source: 'string', message: 'string', data: 'any' },
      example: JSON.stringify({ category: 'orchestrate', level: 'info', source: 'navigator', message: 'Multi-agent workflow initiated', data: { workflowId: 'wf-001', agents: ['thinker', 'sentinel'] } }, null, 2),
    },
    parameters: [],
    responses: [
      { status: 200, description: 'Event emitted to ring buffer' },
    ],
    tags: ['internal', 'events', 'bus'],
  },
];

// Category metadata
const CATEGORIES: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; host: string }> = {
  'NAS SQLite': { icon: Database, color: 'text-green-400', host: '192.168.3.45:8484' },
  'Docker Engine': { icon: Box, color: 'text-cyan-400', host: '192.168.3.45:2375' },
  'Ollama': { icon: Cpu, color: 'text-white', host: 'localhost:11434' },
  'LLM Bridge': { icon: Activity, color: 'text-amber-400', host: 'Multiple Providers' },
  'WebSocket': { icon: Network, color: 'text-purple-400', host: '192.168.3.45:9090' },
  'MCP': { icon: Layers, color: 'text-pink-400', host: 'localhost:8080' },
  'Internal': { icon: Shield, color: 'text-red-400', host: 'In-Process (Event Bus)' },
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  HEAD: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

// ============================================================
// Component
// ============================================================

export function ApiDocsViewer() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [expandedApi, setExpandedApi] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const categories = [...new Set(API_DOCS.map(a => a.category))];

  const filtered = API_DOCS.filter(api => {
    const matchesSearch = !searchQuery ||
      api.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.tags.some(t => t.includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || api.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl text-white tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary" />
            API Reference Documentation
          </h2>
          <p className="text-sm text-zinc-500 mt-1">{API_DOCS.length} endpoints across {categories.length} services</p>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] border-primary/20 text-primary px-3 py-1">
          v3.0.1-beta | Phase 23
        </Badge>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search APIs by name, path, or tag..."
            className="pl-9 bg-black/40 border-white/10 font-mono text-xs"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className={cn('text-xs border-white/10', !selectedCategory && 'bg-primary/10 text-primary border-primary/30')}
            onClick={() => setSelectedCategory(null)}
          >
            All ({API_DOCS.length})
          </Button>
          {categories.map(cat => {
            const catMeta = CATEGORIES[cat];
            const count = API_DOCS.filter(a => a.category === cat).length;
            const CatIcon = catMeta?.icon || Server;
            return (
              <Button
                key={cat}
                variant="outline"
                size="sm"
                className={cn(
                  'text-xs border-white/10 gap-1.5',
                  selectedCategory === cat && 'bg-white/10 border-white/20'
                )}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                <CatIcon className={cn('w-3 h-3', catMeta?.color || 'text-zinc-400')} />
                {cat} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* API List */}
      <ScrollArea className="max-h-[calc(100vh-16rem)]">
        <div className="space-y-3">
          {filtered.map(api => (
            <ApiCard
              key={api.id}
              api={api}
              expanded={expandedApi === api.id}
              onToggle={() => setExpandedApi(expandedApi === api.id ? null : api.id)}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-zinc-500 py-12 font-mono text-sm">
              No APIs match your search.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// --- Sub-components ---

function ApiCard({ api, expanded, onToggle, onCopy, copiedId }: {
  api: ApiEndpoint;
  expanded: boolean;
  onToggle: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const catMeta = CATEGORIES[api.category];

  return (
    <Card className={cn(
      'bg-zinc-900/40 border-white/5 transition-all cursor-pointer hover:border-white/10',
      expanded && 'border-primary/20'
    )}>
      <div className="flex items-center gap-3 p-4" onClick={onToggle}>
        <Badge className={cn('font-mono text-[10px] px-2 py-0.5 border shrink-0', METHOD_COLORS[api.method])}>
          {api.method}
        </Badge>
        <code className="text-xs text-zinc-300 font-mono truncate flex-1">{api.path}</code>
        <span className="text-xs text-zinc-400 hidden md:block">{api.summary}</span>
        <Badge variant="outline" className={cn('text-[9px] border-white/10 shrink-0', catMeta?.color)}>
          {api.category}
        </Badge>
        <ChevronRight className={cn('w-4 h-4 text-zinc-600 transition-transform shrink-0', expanded && 'rotate-90')} />
      </div>

      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Description */}
          <p className="text-xs text-zinc-400">{api.description}</p>

          {/* Host */}
          {catMeta && (
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
              <Server className="w-3 h-3" />
              Host: {catMeta.host}
            </div>
          )}

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap">
            {api.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-[9px] border-white/5 text-zinc-500">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Parameters */}
          {api.parameters && api.parameters.length > 0 && (
            <div>
              <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Parameters</h4>
              <div className="space-y-1">
                {api.parameters.map(param => (
                  <div key={param.name} className="flex items-center gap-2 text-xs bg-black/30 rounded px-3 py-2 border border-white/5">
                    <code className="text-primary font-mono">{param.name}</code>
                    <Badge variant="outline" className="text-[8px] px-1 py-0 border-white/10">{param.in}</Badge>
                    <span className="text-zinc-500">{param.type}</span>
                    {param.required && <Badge className="text-[8px] bg-red-500/20 text-red-400 px-1 py-0">required</Badge>}
                    <span className="text-zinc-600 ml-auto">{param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body */}
          {api.requestBody && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Request Body</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] gap-1 text-zinc-500"
                  onClick={(e) => { e.stopPropagation(); onCopy(api.requestBody!.example, `req-${api.id}`); }}
                >
                  {copiedId === `req-${api.id}` ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  Copy
                </Button>
              </div>
              <pre className="text-[11px] font-mono text-zinc-300 bg-black/40 rounded-lg p-3 overflow-x-auto border border-white/5">
                {api.requestBody.example}
              </pre>
            </div>
          )}

          {/* Responses */}
          <div>
            <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Responses</h4>
            <div className="space-y-2">
              {api.responses.map((res, i) => (
                <div key={i} className="bg-black/30 rounded-lg border border-white/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
                    <Badge className={cn(
                      'text-[10px] px-1.5 py-0',
                      res.status < 300 ? 'bg-green-500/20 text-green-400' :
                      res.status < 400 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    )}>
                      {res.status}
                    </Badge>
                    <span className="text-xs text-zinc-400">{res.description}</span>
                    {res.example && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-zinc-600 ml-auto"
                        onClick={(e) => { e.stopPropagation(); onCopy(res.example!, `res-${api.id}-${i}`); }}
                      >
                        {copiedId === `res-${api.id}-${i}` ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    )}
                  </div>
                  {res.example && (
                    <pre className="text-[10px] font-mono text-zinc-400 p-3 overflow-x-auto">
                      {res.example}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}