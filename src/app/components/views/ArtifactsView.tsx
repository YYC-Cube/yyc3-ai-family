import {
  Package, FileCode, Download, Eye, Clock,
  Search, Copy, Check,
  Terminal, Globe, Code, FileText, Image,
  Trash2, Star,
  Layers, Tag, GitCommit, Cpu, Sparkles,
  Plus, X, Save, ArrowLeft,
} from 'lucide-react';
import * as React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';


// --- Types ---

type ArtifactType = 'react' | 'api' | 'config' | 'script' | 'doc' | 'image' | 'schema';

interface ArtifactItem {
  id: string;
  title: string;
  type: ArtifactType;
  language: string;
  size: string;
  createdAt: string;
  generatedBy: string;
  agentColor: string;
  starred: boolean;
  version: string;
  preview: string;
  tags: string[];
}

// --- Initial Mock Data ---

const INITIAL_ARTIFACTS: ArtifactItem[] = [
  {
    id: 'art-001',
    title: 'ClusterTopology.tsx',
    type: 'react',
    language: 'TypeScript/React',
    size: '4.8 KB',
    createdAt: '2026-02-14 10:42',
    generatedBy: '智愈·领航员',
    agentColor: 'text-amber-500',
    starred: true,
    version: 'v3.2',
    preview: `export function ClusterTopology() {\n  const nodes = useClusterNodes();\n  return (\n    <div className="grid grid-cols-4 gap-4">\n      {nodes.map(node => (\n        <NodeCard key={node.id} {...node} />\n      ))}\n    </div>\n  );\n}`,
    tags: ['component', 'dashboard', 'topology'],
  },
  {
    id: 'art-002',
    title: 'agent-runtime-config.yaml',
    type: 'config',
    language: 'YAML',
    size: '2.1 KB',
    createdAt: '2026-02-13 16:30',
    generatedBy: '元启·天枢',
    agentColor: 'text-cyan-500',
    starred: false,
    version: 'v1.4',
    preview: `agents:\n  navigator:\n    model: claude-3.5-opus\n    temperature: 0.7\n    max_tokens: 8192\n    tools:\n      - search\n      - calculator\n      - code_interpreter`,
    tags: ['config', 'agents', 'runtime'],
  },
  {
    id: 'art-003',
    title: 'security-audit-report.md',
    type: 'doc',
    language: 'Markdown',
    size: '6.3 KB',
    createdAt: '2026-02-13 12:00',
    generatedBy: '卫安·哨兵',
    agentColor: 'text-red-500',
    starred: true,
    version: 'v2.0',
    preview: `# Security Audit Report\n## Summary\n- Threat Level: LOW\n- Vulnerabilities Found: 6 (0 Critical)\n- Compliance Status: PASS\n## Detailed Findings\n...`,
    tags: ['security', 'audit', 'report'],
  },
  {
    id: 'art-004',
    title: 'deploy-staging.sh',
    type: 'script',
    language: 'Bash',
    size: '1.2 KB',
    createdAt: '2026-02-12 20:15',
    generatedBy: '智愈·领航员',
    agentColor: 'text-amber-500',
    starred: false,
    version: 'v2.1',
    preview: `#!/bin/bash\n# YYC3 Staging Deployment Script\nset -euo pipefail\n\necho "Building Docker image..."\ndocker build -t yyc3-core:latest .\ndocker push registry.yyc3.local/yyc3-core:latest\nkubectl rollout restart deployment/yyc3-staging`,
    tags: ['deploy', 'staging', 'docker'],
  },
  {
    id: 'art-005',
    title: 'api-gateway-routes.ts',
    type: 'api',
    language: 'TypeScript',
    size: '3.7 KB',
    createdAt: '2026-02-12 14:00',
    generatedBy: '洞见·思想家',
    agentColor: 'text-blue-500',
    starred: false,
    version: 'v1.8',
    preview: `import { Router } from 'express';\n\nconst router = Router();\n\nrouter.get('/api/v1/agents', getAgents);\nrouter.post('/api/v1/agents/:id/chat', chatWithAgent);\nrouter.get('/api/v1/cluster/status', getClusterStatus);\nrouter.get('/api/v1/metrics', getMetrics);`,
    tags: ['api', 'routes', 'gateway'],
  },
  {
    id: 'art-006',
    title: 'knowledge-graph-schema.json',
    type: 'schema',
    language: 'JSON',
    size: '5.1 KB',
    createdAt: '2026-02-11 09:30',
    generatedBy: '格物·宗师',
    agentColor: 'text-green-500',
    starred: true,
    version: 'v1.2',
    preview: `{\n  "entities": {\n    "Agent": {\n      "properties": {\n        "name": "string",\n        "role": "string",\n        "capabilities": "string[]"\n      }\n    },\n    "Knowledge": {\n      "properties": {\n        "topic": "string",\n        "embeddings": "float[]"\n      }\n    }\n  }\n}`,
    tags: ['schema', 'knowledge', 'graph'],
  },
  {
    id: 'art-007',
    title: 'trend-prediction-model.py',
    type: 'script',
    language: 'Python',
    size: '8.4 KB',
    createdAt: '2026-02-10 17:45',
    generatedBy: '预见·先知',
    agentColor: 'text-purple-500',
    starred: false,
    version: 'v1.0',
    preview: `import torch\nfrom transformers import AutoModel\n\nclass TrendPredictor:\n    def __init__(self, window_size=90):\n        self.window_size = window_size\n        self.model = AutoModel.from_pretrained(\n            'yyc3/trend-v1'\n        )\n    \n    def predict(self, data):\n        return self.model(data)`,
    tags: ['ai', 'prediction', 'model'],
  },
  {
    id: 'art-008',
    title: 'DevOpsTerminal.tsx',
    type: 'react',
    language: 'TypeScript/React',
    size: '12.1 KB',
    createdAt: '2026-02-09 22:00',
    generatedBy: '智愈·领航员',
    agentColor: 'text-amber-500',
    starred: true,
    version: 'v2.5',
    preview: `export function DevOpsTerminal() {\n  return (\n    <Tabs defaultValue="pipeline">\n      <TabsTrigger value="pipeline">Pipeline</TabsTrigger>\n      <TabsTrigger value="containers">Containers</TabsTrigger>\n      <TabsTrigger value="shell">Shell</TabsTrigger>\n    </Tabs>\n  );\n}`,
    tags: ['component', 'devops', 'terminal'],
  },
];

// --- Type Config ---
const typeConfig: Record<ArtifactType, { icon: typeof FileCode; color: string; label: string }> = {
  react: { icon: Code, color: 'text-blue-400', label: 'React Component' },
  api: { icon: Globe, color: 'text-green-400', label: 'API Route' },
  config: { icon: Layers, color: 'text-amber-400', label: 'Configuration' },
  script: { icon: Terminal, color: 'text-purple-400', label: 'Script' },
  doc: { icon: FileText, color: 'text-cyan-400', label: 'Document' },
  image: { icon: Image, color: 'text-pink-400', label: 'Image' },
  schema: { icon: FileCode, color: 'text-orange-400', label: 'Schema' },
};

const AGENT_COLORS: Record<string, string> = {
  '智愈·领航员': 'text-amber-500',
  '洞见·思想家': 'text-blue-500',
  '预见·先知': 'text-purple-500',
  '知遇·伯乐': 'text-pink-500',
  '元启·天枢': 'text-cyan-500',
  '卫安·哨兵': 'text-red-500',
  '格物·宗师': 'text-green-500',
};

// --- Copy Button ---
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white" onClick={handleCopy}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );
}

// --- Create Artifact Dialog ---

interface CreateArtifactDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (artifact: ArtifactItem) => void;
}

function CreateArtifactDialog({ open, onClose, onCreate }: CreateArtifactDialogProps) {
  const [title, setTitle] = React.useState('');
  const [artifactType, setArtifactType] = React.useState<ArtifactType>('react');
  const [language, setLanguage] = React.useState('TypeScript');
  const [content, setContent] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [generatedBy, setGeneratedBy] = React.useState('智愈·领航员');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const sizeKb = (new TextEncoder().encode(content).length / 1024).toFixed(1);
    const newArtifact: ArtifactItem = {
      id: `art-${Date.now()}`,
      title: title.trim(),
      type: artifactType,
      language,
      size: `${sizeKb} KB`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      generatedBy,
      agentColor: AGENT_COLORS[generatedBy] ?? 'text-zinc-500',
      starred: false,
      version: 'v1.0',
      preview: content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    onCreate(newArtifact);
    setTitle('');
    setContent('');
    setTags('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[560px] max-h-[80vh] bg-zinc-900 border border-white/10 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-sm font-mono text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            NEW_ARTIFACT
          </h3>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">文件名 *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="component.tsx"
              className="bg-black/40 border-white/10 font-mono text-sm"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">类型</label>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(typeConfig) as ArtifactType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setArtifactType(t)}
                    className={cn(
                      'px-2 py-1 rounded text-[10px] font-mono transition-colors',
                      artifactType === t
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-zinc-500 hover:text-zinc-300 bg-white/5',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">生成者</label>
              <div className="flex flex-wrap gap-1">
                {Object.keys(AGENT_COLORS).map(agent => (
                  <button
                    key={agent}
                    type="button"
                    onClick={() => setGeneratedBy(agent)}
                    className={cn(
                      'px-2 py-1 rounded text-[10px] font-mono transition-colors',
                      generatedBy === agent
                        ? cn('bg-opacity-20 border', AGENT_COLORS[agent])
                        : 'text-zinc-500 hover:text-zinc-300 bg-white/5',
                    )}
                  >
                    {agent.split('·')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">语言</label>
            <Input
              value={language}
              onChange={e => setLanguage(e.target.value)}
              placeholder="TypeScript"
              className="bg-black/40 border-white/10 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">标签 (逗号分隔)</label>
            <Input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="component, ui, chart"
              className="bg-black/40 border-white/10 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1 block">内容 *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="// 在此粘贴代码..."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 resize-none focus:outline-none focus:border-primary/40 placeholder:text-zinc-600 min-h-[120px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <Button type="button" variant="ghost" className="text-xs font-mono" onClick={onClose}>CANCEL</Button>
            <Button type="submit" className="text-xs font-mono gap-1" disabled={!title.trim() || !content.trim()}>
              <Save className="w-3 h-3" /> CREATE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Component ---

export function ArtifactsView() {
  const [artifacts, setArtifacts] = React.useState<ArtifactItem[]>(INITIAL_ARTIFACTS);
  const [selectedArtifact, setSelectedArtifact] = React.useState<string | null>('art-001');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [showCreate, setShowCreate] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const addLog = useSystemStore(s => s.addLog);
  const isMobile = useSystemStore(s => s.isMobile);
  const isTablet = useSystemStore(s => s.isTablet);
  const [mobileShowDetail, setMobileShowDetail] = React.useState(false);

  const handleSelectArtifact = (id: string) => {
    setSelectedArtifact(id);
    if (isMobile) setMobileShowDetail(true);
  };

  const toggleStar = (id: string) => {
    setArtifacts(prev => prev.map(a =>
      a.id === id ? { ...a, starred: !a.starred } : a,
    ));
  };

  const filteredArtifacts = artifacts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || a.type === filterType;

    return matchesSearch && matchesType;
  });

  const selected = artifacts.find(a => a.id === selectedArtifact);
  const starredCount = artifacts.filter(a => a.starred).length;
  const totalSize = artifacts.reduce((acc, a) => acc + parseFloat(a.size), 0).toFixed(1);

  const handleCreate = (artifact: ArtifactItem) => {
    setArtifacts(prev => [artifact, ...prev]);
    setSelectedArtifact(artifact.id);
    addLog('success', 'ARTIFACTS', `Created artifact: ${artifact.title}`);
  };

  const handleDelete = (id: string) => {
    const art = artifacts.find(a => a.id === id);

    setArtifacts(prev => prev.filter(a => a.id !== id));
    if (selectedArtifact === id) setSelectedArtifact(null);
    setConfirmDelete(null);
    if (art) addLog('warn', 'ARTIFACTS', `Deleted artifact: ${art.title}`);
  };

  return (
    <div className="flex h-full bg-[#050505] text-foreground font-sans overflow-hidden animate-in fade-in duration-500 w-full">
      {isMobile ? (
        mobileShowDetail && selected ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-3 border-b border-white/5 bg-black/30">
              <Button variant="ghost" size="sm" className="text-xs font-mono gap-1 text-zinc-400" onClick={() => setMobileShowDetail(false)}>
                <ArrowLeft className="w-3 h-3" /> BACK
              </Button>
            </div>
            {renderDetail(selected)}
          </div>
        ) : (
          renderListPanel()
        )
      ) : (
        <PanelGroup direction="horizontal" className="h-full w-full">
          <Panel defaultSize={isTablet ? 40 : 32} minSize={22} maxSize={50} id="artifacts-list" order={1}>
            {renderListPanel()}
          </Panel>
          <PanelResizeHandle className="w-1 bg-white/5 hover:bg-primary/30 active:bg-primary/50 transition-colors cursor-col-resize relative group">
            <div className="absolute inset-y-0 -left-1 -right-1" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-zinc-600 group-hover:bg-primary/60 transition-colors" />
          </PanelResizeHandle>
          <Panel minSize={40} id="artifacts-detail" order={2}>
            <div className="flex-1 flex flex-col min-w-0 h-full">
              {selected ? renderDetail(selected) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500 font-mono text-sm">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Select an artifact to view details</p>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      )}

      <CreateArtifactDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[380px] bg-zinc-900 border border-red-500/20 rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-mono text-white">DELETE_ARTIFACT</h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {artifacts.find(a => a.id === confirmDelete)?.title}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              此操作不可逆。工件将被永久删除。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="text-xs font-mono" onClick={() => setConfirmDelete(null)}>
                CANCEL
              </Button>
              <Button
                variant="destructive"
                className="text-xs font-mono gap-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
                onClick={() => handleDelete(confirmDelete)}
              >
                <Trash2 className="w-3 h-3" /> CONFIRM_DELETE
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderListPanel() {
    return (
      <div className="h-full border-r border-white/5 flex flex-col bg-black/30">
        <div className="p-3 md:p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              工件日志
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] border-white/10 text-zinc-400">
                {artifacts.length} ARTIFACTS
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs font-mono border-primary/30 text-primary gap-1"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="w-3 h-3" />
                NEW
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <Input
              placeholder="搜索工件或标签..."
              className="pl-9 h-8 bg-zinc-900/60 border-white/5 text-xs font-mono"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {['all', 'react', 'api', 'config', 'script', 'doc', 'schema'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors',
                  filterType === type
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5',
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Artifact List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredArtifacts.map(artifact => {
              const config = typeConfig[artifact.type];
              const TypeIcon = config.icon;

              return (
                <button
                  key={artifact.id}
                  onClick={() => handleSelectArtifact(artifact.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all group',
                    selectedArtifact === artifact.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-white/5 border border-transparent',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border',
                      selectedArtifact === artifact.id
                        ? 'bg-primary/20 border-primary/30'
                        : 'bg-zinc-900 border-white/5',
                    )}>
                      <TypeIcon className={cn('w-4 h-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-zinc-200 truncate">{artifact.title}</span>
                        {artifact.starred && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-zinc-500">{artifact.size}</span>
                        <span className="text-[10px] text-zinc-600">·</span>
                        <span className={cn('text-[10px] font-mono', artifact.agentColor)}>{artifact.generatedBy}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {artifact.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredArtifacts.length === 0 && (
              <div className="text-center py-8 text-zinc-600 text-xs font-mono">
                NO_RESULTS
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Stats Footer */}
        <div className="p-3 border-t border-white/5 bg-black/20">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-mono text-white">{artifacts.length}</div>
              <div className="text-[9px] text-zinc-500 uppercase">Total</div>
            </div>
            <div>
              <div className="text-sm font-mono text-amber-500">{starredCount}</div>
              <div className="text-[9px] text-zinc-500 uppercase">Starred</div>
            </div>
            <div>
              <div className="text-sm font-mono text-cyan-500">{totalSize} KB</div>
              <div className="text-[9px] text-zinc-500 uppercase">Total Size</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDetail(sel: ArtifactItem) {
    return (
      <>
        <div className="p-4 md:p-6 border-b border-white/5 bg-black/20">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl text-white font-mono">{sel.title}</h2>
                <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-400">
                  {sel.version}
                </Badge>
                <Badge variant="outline" className={cn('text-[10px] font-mono', typeConfig[sel.type].color)}>
                  {typeConfig[sel.type].label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono flex-wrap">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Generated by: <span className={sel.agentColor}>{sel.generatedBy}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {sel.createdAt}
                </span>
                <span className="flex items-center gap-1">
                  <FileCode className="w-3 h-3" />
                  {sel.language}
                </span>
                <span>{sel.size}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <Button
                size="sm"
                variant="ghost"
                className={cn('h-8 text-xs font-mono gap-1', sel.starred ? 'text-amber-500' : 'text-zinc-400')}
                onClick={() => toggleStar(sel.id)}
              >
                <Star className={cn('w-3 h-3', sel.starred && 'fill-amber-500')} />
                {sel.starred ? 'Starred' : 'Star'}
              </Button>
              <CopyBtn text={sel.preview} />
              <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1">
                <Download className="w-3 h-3" /> Export
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs font-mono text-zinc-400 hover:text-red-500"
                onClick={() => setConfirmDelete(sel.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-4">
            <Tag className="w-3 h-3 text-zinc-500" />
            {sel.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-400">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Code Preview */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6">
            <Card className="bg-black/60 border-white/10 overflow-hidden">
              <CardHeader className="py-3 border-b border-white/5 bg-zinc-900/40">
                <CardTitle className="text-sm font-mono flex items-center justify-between text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    PREVIEW — {sel.title}
                  </div>
                  <div className="flex items-center gap-1">
                    <CopyBtn text={sel.preview} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="p-4 text-[12px] font-mono text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed">
                  {sel.preview.split('\n').map((line, i) => (
                    <div key={i} className="flex hover:bg-white/[0.02] transition-colors">
                      <span className="text-zinc-600 w-8 text-right pr-4 select-none shrink-0">{i + 1}</span>
                      <span className="flex-1">{line}</span>
                    </div>
                  ))}
                </pre>
              </CardContent>
            </Card>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-zinc-900/40 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span className="text-xs text-zinc-400 font-mono">Generation Info</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Model</span>
                      <span className="text-zinc-300">Claude 3.5 Opus</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tokens</span>
                      <span className="text-zinc-300">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Latency</span>
                      <span className="text-zinc-300">1.8s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/40 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitCommit className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-zinc-400 font-mono">Version History</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-300">{sel.version}</span>
                      <span className="text-zinc-500">current</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">v{(parseFloat(sel.version.slice(1)) - 0.1).toFixed(1)}</span>
                      <span className="text-zinc-600">2 days ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">v1.0</span>
                      <span className="text-zinc-600">initial</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/40 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-zinc-400 font-mono">Dependencies</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Imports</span>
                      <span className="text-zinc-300">4 modules</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Used By</span>
                      <span className="text-zinc-300">2 files</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Complexity</span>
                      <span className="text-zinc-300">Medium</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </>
    );
  }
}