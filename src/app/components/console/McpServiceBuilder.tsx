import {
  Server, Wrench, Database, Globe, Zap, Copy, Check, Play, Eye, Code, ChevronDown,
  ChevronRight, FileCode, Settings, RefreshCw, Download,
  ArrowRight, Send, Clock, AlertCircle, CheckCircle2,
  BookOpen, X,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  getAllMCPServers,
  getMCPCallLog,
  generateMCPServerCode,
  generateMCPClientConfig,
  MCP_CALL_PRESETS,
  smartMCPCall,
  testMCPConnection,
  connectMCPServer,
  disconnectMCPServer,
  getMCPConnection,
  getAllMCPConnections,
  type MCPServerDefinition,
  type MCPTool,
  type MCPCallResult,
  type MCPCallPreset,
  type MCPTransportConnection,
} from '@/lib/mcp-protocol';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// --- Icon mapping ---
const TRANSPORT_COLORS: Record<string, string> = {
  'stdio': 'text-green-400',
  'http-sse': 'text-blue-400',
  'streamable-http': 'text-purple-400',
};

const CATEGORY_BADGES: Record<string, { label: string; color: string }> = {
  builtin: { label: 'BUILTIN', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  community: { label: 'COMMUNITY', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  custom: { label: 'CUSTOM', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
};

type TabId = 'registry' | 'explorer' | 'playground' | 'codegen' | 'log';

export function McpServiceBuilder() {
  const addLog = useSystemStore(s => s.addLog);
  const isMobile = useSystemStore(s => s.isMobile);

  const [activeTab, setActiveTab] = React.useState<TabId>('registry');
  const [servers, _setServers] = React.useState<MCPServerDefinition[]>(getAllMCPServers);
  const [selectedServer, setSelectedServer] = React.useState<string | null>(null);
  const [selectedTool, setSelectedTool] = React.useState<MCPTool | null>(null);
  const [expandedServer, setExpandedServer] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [callLog, setCallLog] = React.useState<MCPCallResult[]>(getMCPCallLog);

  // Playground state
  const [pgServerId, setPgServerId] = React.useState('');
  const [pgMethod, setPgMethod] = React.useState('');
  const [pgParams, setPgParams] = React.useState('{}');
  const [pgResult, setPgResult] = React.useState<MCPCallResult | null>(null);
  const [pgLoading, setPgLoading] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<MCPCallPreset | null>(null);

  // Connection state (Phase 18.3)
  const [connections, setConnections] = React.useState<Record<string, MCPTransportConnection>>({});
  const [connectingId, setConnectingId] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<{ serverId: string; success: boolean; latencyMs: number; error?: string; serverInfo?: string } | null>(null);

  const server = servers.find(s => s.id === selectedServer);

  // Refresh connections state
  const refreshConnections = React.useCallback(() => {
    const conns: Record<string, MCPTransportConnection> = {};

    for (const c of getAllMCPConnections()) {
      conns[c.serverId] = c;
    }
    setConnections(conns);
  }, []);

  React.useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  const handleTestConnection = async (srv: MCPServerDefinition) => {
    setConnectingId(srv.id);
    setTestResult(null);
    try {
      const result = await testMCPConnection(srv);

      setTestResult({ serverId: srv.id, ...result });
      addLog(
        result.success ? 'success' : 'warn',
        'MCP',
        `Connection test → ${srv.name}: ${result.success ? 'OK' : result.error} (${result.latencyMs}ms)`,
      );
    } catch (e) {
      addLog('error', 'MCP', `Connection test failed: ${e}`);
    }
    setConnectingId(null);
  };

  const handleConnect = async (srv: MCPServerDefinition) => {
    setConnectingId(srv.id);
    try {
      const conn = await connectMCPServer(srv);

      refreshConnections();
      addLog(
        conn.status === 'connected' ? 'success' : 'error',
        'MCP',
        `Connect → ${srv.name}: ${conn.status} ${conn.error || ''}`,
      );
    } catch (e) {
      addLog('error', 'MCP', `Connect failed: ${e}`);
    }
    setConnectingId(null);
  };

  const handleDisconnect = (serverId: string) => {
    disconnectMCPServer(serverId);
    refreshConnections();
    addLog('info', 'MCP', `Disconnected from ${serverId}`);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExecuteCall = async () => {
    if (!pgServerId || !pgMethod) return;
    setPgLoading(true);
    try {
      const params = JSON.parse(pgParams);
      const result = await smartMCPCall(pgServerId, pgMethod, params);

      setPgResult(result);
      setCallLog(getMCPCallLog());
      const conn = getMCPConnection(pgServerId);
      const mode = conn?.status === 'connected' ? 'REAL' : 'MOCK';

      addLog(
        result.success ? 'success' : 'error',
        'MCP',
        `[${mode}] ${pgMethod} → ${pgServerId}: ${result.success ? 'OK' : 'FAILED'} (${result.latencyMs}ms)`,
      );
    } catch (e) {
      addLog('error', 'MCP', `Call failed: ${e}`);
    } finally {
      setPgLoading(false);
    }
  };

  const handleApplyPreset = (preset: MCPCallPreset) => {
    setSelectedPreset(preset);
    setPgMethod(preset.method);
    setPgParams(JSON.stringify(preset.paramsTemplate, null, 2));
    if (!pgServerId && servers.length > 0) {
      setPgServerId(servers[0].id);
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'registry', label: 'Registry', icon: Server },
    { id: 'explorer', label: 'Explorer', icon: Eye },
    { id: 'playground', label: 'Playground', icon: Play },
    { id: 'codegen', label: 'Code Gen', icon: Code },
    { id: 'log', label: 'Call Log', icon: Clock },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Wrench className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl text-white tracking-tight">MCP Service Builder</h2>
            <p className="text-xs text-zinc-500 font-mono">Model Context Protocol Tool Chain v16.2</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-500">
            {servers.length} servers / {servers.reduce((s, sv) => s + sv.tools.length, 0)} tools
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-500">
            {callLog.length} calls logged
          </Badge>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-white/5 pb-0.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-t-lg transition-colors',
              activeTab === tab.id
                ? 'bg-white/5 text-white border-b-2 border-primary'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/3',
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Registry */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3')}>
            {servers.map(srv => {
              const conn = connections[srv.id];

              return (
                <Card
                  key={srv.id}
                  className={cn(
                    'bg-zinc-900/40 border-white/5 cursor-pointer transition-all hover:border-white/20 group',
                    selectedServer === srv.id && 'border-primary/30 ring-1 ring-primary/20',
                  )}
                  onClick={() => setSelectedServer(selectedServer === srv.id ? null : srv.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Server className={cn('w-4 h-4 shrink-0', srv.color || 'text-zinc-400')} />
                        <CardTitle className="text-sm font-mono text-zinc-200 truncate">{srv.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className={CATEGORY_BADGES[srv.category]?.color || ''}>{CATEGORY_BADGES[srv.category]?.label}</Badge>
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          conn?.status === 'connected' ? 'bg-green-500 animate-pulse' :
                          conn?.status === 'error' ? 'bg-red-500' :
                          srv.status === 'connected' ? 'bg-green-500' :
                          srv.status === 'error' ? 'bg-red-500' :
                          'bg-zinc-600',
                        )} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-[11px] text-zinc-500 line-clamp-2">{srv.description}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className={cn('text-[9px] font-mono', TRANSPORT_COLORS[srv.transport])}>
                        {srv.transport}
                      </Badge>
                      {srv.capabilities.tools && <Badge variant="outline" className="text-[9px] font-mono text-amber-400">tools:{srv.tools.length}</Badge>}
                      {srv.capabilities.resources && <Badge variant="outline" className="text-[9px] font-mono text-cyan-400">res:{srv.resources.length}</Badge>}
                      {srv.capabilities.prompts && <Badge variant="outline" className="text-[9px] font-mono text-purple-400">prompts:{srv.prompts.length}</Badge>}
                    </div>
                    {conn && (
                      <div className={cn(
                        'flex items-center gap-1.5 text-[9px] font-mono px-2 py-1 rounded border',
                        conn.status === 'connected'
                          ? 'text-green-400 border-green-500/20 bg-green-500/5'
                          : conn.status === 'error'
                          ? 'text-red-400 border-red-500/20 bg-red-500/5'
                          : 'text-zinc-500 border-white/5',
                      )}>
                        {conn.status === 'connected' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                        {conn.status.toUpperCase()}
                        {conn.latencyMs !== undefined && <span className="text-zinc-600 ml-auto">{conn.latencyMs}ms</span>}
                      </div>
                    )}
                    {srv.tags.length > 0 && !conn && (
                      <div className="flex flex-wrap gap-1">
                        {srv.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="text-[9px] text-zinc-600 font-mono">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Connection Panel (appears when server selected) */}
          {selectedServer && server && (
            <Card className="bg-black/40 border-white/10 animate-in slide-in-from-bottom-4 duration-300">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-sm font-mono text-zinc-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Connection — {server.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {server.transport === 'stdio' ? (
                      <Badge variant="outline" className="text-[9px] text-zinc-500">stdio: use CLI config</Badge>
                    ) : (
                      <>
                        {connections[server.id]?.status === 'connected' ? (
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono gap-1 text-red-400"
                            onClick={() => handleDisconnect(server.id)}>
                            <X className="w-3 h-3" /> Disconnect
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono gap-1 text-cyan-400"
                              onClick={() => handleTestConnection(server)}
                              disabled={connectingId === server.id}>
                              {connectingId === server.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                              Test
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono gap-1 text-green-400"
                              onClick={() => handleConnect(server)}
                              disabled={connectingId === server.id}>
                              {connectingId === server.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                              Connect
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div>
                    <span className="text-zinc-500">Transport</span>
                    <div className={cn('mt-0.5', TRANSPORT_COLORS[server.transport])}>{server.transport}</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">URL</span>
                    <div className="mt-0.5 text-zinc-300 truncate">{server.url || server.command || 'Not configured'}</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Capabilities</span>
                    <div className="mt-0.5 text-zinc-300">
                      {[
                        server.capabilities.tools && 'Tools',
                        server.capabilities.resources && 'Resources',
                        server.capabilities.prompts && 'Prompts',
                        server.capabilities.logging && 'Logging',
                        server.capabilities.sampling && 'Sampling',
                      ].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Status</span>
                    <div className={cn('mt-0.5',
                      connections[server.id]?.status === 'connected' ? 'text-green-400' :
                      connections[server.id]?.status === 'error' ? 'text-red-400' :
                      'text-zinc-500',
                    )}>
                      {connections[server.id]?.status?.toUpperCase() || 'DISCONNECTED'}
                      {connections[server.id]?.latencyMs !== undefined && ` (${connections[server.id]?.latencyMs}ms)`}
                    </div>
                  </div>
                </div>

                {/* Connection test result */}
                {testResult && testResult.serverId === server.id && (
                  <div className={cn(
                    'p-3 rounded-lg border text-xs font-mono',
                    testResult.success
                      ? 'bg-green-500/5 border-green-500/20 text-green-400'
                      : 'bg-red-500/5 border-red-500/20 text-red-400',
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {testResult.success ? 'Connection successful' : 'Connection failed'}
                      <span className="text-zinc-500 ml-auto">{testResult.latencyMs}ms</span>
                    </div>
                    {testResult.error && <p className="text-[10px] text-zinc-400 mt-1">{String(testResult.error)}</p>}
                    {testResult.serverInfo && (
                      <pre className="text-[10px] text-zinc-400 mt-1 overflow-auto max-h-[100px]">
                        {testResult.serverInfo}
                      </pre>
                    )}
                  </div>
                )}

                {/* Connection error detail */}
                {connections[server.id]?.error && (
                  <div className="p-2 rounded border border-red-500/20 bg-red-500/5 text-[10px] text-red-400 font-mono">
                    {connections[server.id]?.error}
                  </div>
                )}

                {/* stdio instructions */}
                {server.transport === 'stdio' && (
                  <div className="p-3 rounded-lg border border-white/5 bg-zinc-900/50 text-[11px] text-zinc-400 font-mono space-y-2">
                    <p className="text-zinc-500">stdio servers run as local processes. Add to your IDE config:</p>
                    <pre className="text-cyan-300 bg-black/50 p-2 rounded text-[10px] overflow-auto">
                      {`${server.command} ${(server.args || []).join(' ')}`}
                    </pre>
                    <p className="text-zinc-600">Use the Code Gen tab to generate the full configuration.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB: Explorer */}
      {activeTab === 'explorer' && (
        <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-12')}>
          {/* Server List */}
          <div className={cn('space-y-2', isMobile ? '' : 'col-span-4')}>
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider px-1">Servers</h3>
            <ScrollArea className="h-[500px]">
              {servers.map(srv => (
                <div key={srv.id}>
                  <button
                    onClick={() => setExpandedServer(expandedServer === srv.id ? null : srv.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors',
                      expandedServer === srv.id ? 'bg-white/5 text-white' : 'text-zinc-400 hover:bg-white/3',
                    )}
                  >
                    {expandedServer === srv.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <Server className={cn('w-3.5 h-3.5', srv.color)} />
                    <span className="text-xs font-mono truncate">{srv.name}</span>
                    <span className="ml-auto text-[9px] text-zinc-600">{srv.tools.length}T</span>
                  </button>
                  {expandedServer === srv.id && (
                    <div className="ml-6 mt-1 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                      {srv.tools.length > 0 && (
                        <div>
                          <span className="text-[9px] text-amber-500 font-mono uppercase px-2">Tools</span>
                          {srv.tools.map(tool => (
                            <button
                              key={tool.name}
                              onClick={() => setSelectedTool(selectedTool?.name === tool.name ? null : tool)}
                              className={cn(
                                'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono transition-colors',
                                selectedTool?.name === tool.name ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-500 hover:text-zinc-300',
                              )}
                            >
                              <Wrench className="w-3 h-3" />
                              <span className="truncate">{tool.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {srv.resources.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[9px] text-cyan-500 font-mono uppercase px-2">Resources</span>
                          {srv.resources.map(res => (
                            <div key={res.uri} className="px-2 py-1 text-[11px] text-zinc-500 font-mono truncate">
                              <Database className="w-3 h-3 inline mr-1 text-cyan-500" />
                              {res.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {srv.prompts.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[9px] text-purple-500 font-mono uppercase px-2">Prompts</span>
                          {srv.prompts.map(p => (
                            <div key={p.name} className="px-2 py-1 text-[11px] text-zinc-500 font-mono truncate">
                              <BookOpen className="w-3 h-3 inline mr-1 text-purple-500" />
                              {p.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Tool Detail */}
          <div className={cn(isMobile ? '' : 'col-span-8')}>
            {selectedTool ? (
              <Card className="bg-black/40 border-white/10">
                <CardHeader className="pb-2 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono text-amber-400 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      {selectedTool.name}
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      {selectedTool.annotations?.readOnlyHint && (
                        <Badge variant="outline" className="text-[8px] text-green-400">READ-ONLY</Badge>
                      )}
                      {selectedTool.annotations?.destructiveHint && (
                        <Badge variant="outline" className="text-[8px] text-red-400">DESTRUCTIVE</Badge>
                      )}
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono gap-1"
                        onClick={() => {
                          setPgServerId(expandedServer || '');
                          setPgMethod('tools/call');
                          setPgParams(JSON.stringify({ name: selectedTool.name, arguments: {} }, null, 2));
                          setActiveTab('playground');
                        }}>
                        <Play className="w-3 h-3" /> Try
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-3">
                  <p className="text-xs text-zinc-400">{selectedTool.description}</p>
                  <div>
                    <h4 className="text-[10px] text-zinc-500 font-mono uppercase mb-2">Input Schema</h4>
                    <pre className="text-[11px] font-mono text-zinc-300 bg-black/50 p-3 rounded-lg border border-white/5 overflow-auto max-h-[300px]">
                      {JSON.stringify(selectedTool.inputSchema, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-zinc-500 font-mono uppercase mb-2">JSON-RPC Call</h4>
                    <pre className="text-[11px] font-mono text-cyan-300 bg-black/50 p-3 rounded-lg border border-white/5 overflow-auto">
                      {`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "${selectedTool.name}",
    "arguments": ${JSON.stringify(
                        Object.fromEntries(
                          Object.entries(selectedTool.inputSchema.properties).map(([k, v]) => [k, v.default || `<${v.type}>`]),
                        ), null, 4).replace(/\n/g, '\n    ')}
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-zinc-600 font-mono text-xs">
                <div className="text-center">
                  <Wrench className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>Select a tool from the server list to inspect</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Playground */}
      {activeTab === 'playground' && (
        <div className="space-y-4">
          {/* Preset Buttons */}
          <div>
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Preset Calls</h3>
            <div className="flex flex-wrap gap-1.5">
              {MCP_CALL_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-[10px] font-mono border transition-colors',
                    selectedPreset?.id === preset.id
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'text-zinc-500 border-white/5 hover:border-white/15 hover:text-zinc-300 bg-zinc-900/50',
                  )}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
            {/* Request */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-xs font-mono text-zinc-400">Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">Server</label>
                  <select
                    value={pgServerId}
                    onChange={e => setPgServerId(e.target.value)}
                    className="w-full h-8 bg-zinc-900 border border-white/10 rounded text-xs font-mono px-2 text-white"
                  >
                    <option value="">Select server...</option>
                    {servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">Method</label>
                  <Input
                    value={pgMethod}
                    onChange={e => setPgMethod(e.target.value)}
                    placeholder="tools/call"
                    className="h-8 bg-zinc-900 border-white/10 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">Params (JSON)</label>
                  <textarea
                    value={pgParams}
                    onChange={e => setPgParams(e.target.value)}
                    rows={8}
                    className="w-full bg-zinc-900 border border-white/10 rounded text-[11px] font-mono p-3 text-cyan-300 resize-none focus:outline-none focus:border-primary/50"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full h-8 text-xs font-mono gap-1.5"
                  onClick={handleExecuteCall}
                  disabled={pgLoading || !pgServerId || !pgMethod}
                >
                  {pgLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  {pgLoading ? 'Executing...' : 'Execute Call'}
                </Button>
              </CardContent>
            </Card>

            {/* Response */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                  Response
                  {pgResult && (
                    <div className="flex items-center gap-2">
                      {pgResult.success ? (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> OK
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px]">
                          <AlertCircle className="w-3 h-3 mr-1" /> ERROR
                        </Badge>
                      )}
                      <span className="text-[9px] text-zinc-600">{pgResult.latencyMs}ms</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                {pgResult ? (
                  <div className="space-y-2">
                    <ScrollArea className="h-[280px]">
                      <pre className="text-[11px] font-mono text-green-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(pgResult.response, null, 2)}
                      </pre>
                    </ScrollArea>
                    <Button
                      size="sm" variant="ghost"
                      className="h-6 text-[10px] font-mono gap-1 text-zinc-400"
                      onClick={() => handleCopy(JSON.stringify(pgResult.response, null, 2))}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                    </Button>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-zinc-600 font-mono text-xs">
                    Execute a call to see the response
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: Code Gen */}
      {activeTab === 'codegen' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {servers.map(srv => (
              <button
                key={srv.id}
                onClick={() => setSelectedServer(srv.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-colors',
                  selectedServer === srv.id
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'text-zinc-500 border-white/5 hover:border-white/15 bg-zinc-900/50',
                )}
              >
                {srv.name}
              </button>
            ))}
          </div>

          {server && (
            <div className="space-y-4">
              {/* Server Code */}
              <Card className="bg-black/40 border-white/10">
                <CardHeader className="pb-2 border-b border-white/5">
                  <CardTitle className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-amber-400" />
                      MCP Server Code — {server.name}
                    </span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono gap-1 text-zinc-400"
                        onClick={() => handleCopy(generateMCPServerCode(server))}>
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono gap-1 text-zinc-400"
                        onClick={() => {
                          const blob = new Blob([generateMCPServerCode(server)], { type: 'text/typescript' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');

                          a.href = url;
                          a.download = `mcp-${server.id}.ts`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}>
                        <Download className="w-3 h-3" /> Export .ts
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <ScrollArea className="h-[400px]">
                    <pre className="text-[11px] font-mono text-cyan-300 whitespace-pre-wrap">
                      {generateMCPServerCode(server)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Client Config */}
              <Card className="bg-black/40 border-white/10">
                <CardHeader className="pb-2 border-b border-white/5">
                  <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-cyan-400" />
                    Claude Desktop / Cursor Config
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <pre className="text-[11px] font-mono text-green-300 bg-black/50 p-3 rounded-lg border border-white/5 overflow-auto max-h-[200px]">
                    {generateMCPClientConfig([server])}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB: Call Log */}
      {activeTab === 'log' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono text-zinc-500 uppercase">Recent MCP Calls ({callLog.length})</h3>
            <Button size="sm" variant="ghost" className="h-6 text-[10px] font-mono text-zinc-500"
              onClick={() => setCallLog(getMCPCallLog())}>
              <RefreshCw className="w-3 h-3 mr-1" /> Refresh
            </Button>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {callLog.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 font-mono text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No MCP calls logged yet. Use the Playground to make calls.
                </div>
              ) : callLog.map((call, i) => (
                <div
                  key={`${call.timestamp}-${i}`}
                  className="flex items-center gap-3 px-3 py-2.5 bg-zinc-900/40 border border-white/5 rounded-lg text-xs font-mono"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    call.success ? 'bg-green-500' : 'bg-red-500',
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-300 truncate">{call.method}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                      <span className="text-zinc-500 truncate">{call.serverId}</span>
                    </div>
                  </div>
                  <span className="text-zinc-600 shrink-0">{call.latencyMs}ms</span>
                  <span className="text-zinc-700 shrink-0 text-[9px]">
                    {new Date(call.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}