import {
  Play, Plus, Trash2, Save,
  Shield, Box, Zap, Terminal, Bell,
  CheckCircle2, Lock, Wrench,
  X, ChevronDown, Loader2,
  ArrowRight, Upload, Maximize2,
  Network, Settings,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useSystemStore } from '@/lib/store';
import type { DAGNode, DAGEdge, DAGWorkflow } from '@/lib/types';
import { cn } from '@/lib/utils';

// --- Constants ---

const NODE_WIDTH = 160;
const NODE_HEIGHT = 64;

type NodeType = DAGNode['type'];

interface NodeTypeInfo {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const NODE_TYPES: Record<NodeType, NodeTypeInfo> = {
  'trigger': { label: 'Trigger', icon: Zap, color: 'text-amber-400', bgColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.3)' },
  'build': { label: 'Build', icon: Box, color: 'text-blue-400', bgColor: 'rgba(96,165,250,0.08)', borderColor: 'rgba(96,165,250,0.3)' },
  'test': { label: 'Test', icon: CheckCircle2, color: 'text-green-400', bgColor: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.3)' },
  'security': { label: 'Security', icon: Shield, color: 'text-red-400', bgColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.3)' },
  'deploy': { label: 'Deploy', icon: Upload, color: 'text-purple-400', bgColor: 'rgba(192,132,252,0.08)', borderColor: 'rgba(192,132,252,0.3)' },
  'notify': { label: 'Notify', icon: Bell, color: 'text-cyan-400', bgColor: 'rgba(34,211,238,0.08)', borderColor: 'rgba(34,211,238,0.3)' },
  'approval': { label: 'Approval', icon: Lock, color: 'text-orange-400', bgColor: 'rgba(251,146,60,0.08)', borderColor: 'rgba(251,146,60,0.3)' },
  'script': { label: 'Script', icon: Terminal, color: 'text-emerald-400', bgColor: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.3)' },
  'mcp-tool': { label: 'MCP Tool', icon: Wrench, color: 'text-pink-400', bgColor: 'rgba(244,114,182,0.08)', borderColor: 'rgba(244,114,182,0.3)' },
};

// --- Preset Workflows ---

const PRESET_WORKFLOWS: DAGWorkflow[] = [
  {
    id: 'preset-cicd',
    name: 'Standard CI/CD Pipeline',
    description: '标准 CI/CD 管线：触发 -> 构建 -> 测试 -> 安全 -> 部署',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Git Push', x: 60, y: 120, config: { event: 'push', branch: 'main' } },
      { id: 'n2', type: 'build', label: 'Build & Lint', x: 280, y: 80, config: { cmd: 'pnpm build && pnpm lint' } },
      { id: 'n3', type: 'test', label: 'Unit Tests', x: 280, y: 200, config: { cmd: 'pnpm test --coverage' } },
      { id: 'n4', type: 'security', label: 'SAST + Audit', x: 500, y: 120, config: { tool: 'trivy + eslint-security' } },
      { id: 'n5', type: 'approval', label: 'Manual Gate', x: 720, y: 120, config: { approver: 'Level 5' } },
      { id: 'n6', type: 'deploy', label: 'Deploy Staging', x: 940, y: 80, config: { env: 'staging' } },
      { id: 'n7', type: 'notify', label: 'Slack Notify', x: 940, y: 200, config: { channel: '#devops' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n1', target: 'n3' },
      { id: 'e3', source: 'n2', target: 'n4' },
      { id: 'e4', source: 'n3', target: 'n4' },
      { id: 'e5', source: 'n4', target: 'n5' },
      { id: 'e6', source: 'n5', target: 'n6' },
      { id: 'e7', source: 'n5', target: 'n7' },
    ],
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'preset-mcp',
    name: 'MCP Tool Chain',
    description: 'MCP 智能工具链：触发 -> MCP 调用 -> 脚本处理 -> 通知',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Schedule', x: 60, y: 140, config: { cron: '0 */6 * * *' } },
      { id: 'n2', type: 'mcp-tool', label: 'Cluster Check', x: 280, y: 140, config: { tool: 'cluster_status' } },
      { id: 'n3', type: 'script', label: 'Analyze Data', x: 500, y: 80, config: { script: 'analyze_metrics.py' } },
      { id: 'n4', type: 'mcp-tool', label: 'DB Query', x: 500, y: 220, config: { tool: 'postgres_query' } },
      { id: 'n5', type: 'script', label: 'Generate Report', x: 720, y: 140, config: { script: 'gen_report.ts' } },
      { id: 'n6', type: 'notify', label: 'Email Report', x: 940, y: 140, config: { to: 'ops@yyc3.local' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n2', target: 'n4' },
      { id: 'e4', source: 'n3', target: 'n5' },
      { id: 'e5', source: 'n4', target: 'n5' },
      { id: 'e6', source: 'n5', target: 'n6' },
    ],
    createdAt: '2026-02-12T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'preset-backup',
    name: 'Backup & Recovery',
    description: '自动备份流程：触发 -> 数据库备份 -> 文件备份 -> NAS同步 -> 验证',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Daily 02:00', x: 60, y: 140, config: { cron: '0 2 * * *' } },
      { id: 'n2', type: 'script', label: 'PG Dump', x: 280, y: 80, config: { cmd: 'pg_dump' } },
      { id: 'n3', type: 'script', label: 'File Archive', x: 280, y: 220, config: { cmd: 'tar -czf' } },
      { id: 'n4', type: 'deploy', label: 'NAS Sync', x: 500, y: 140, config: { target: 'YanYuCloud' } },
      { id: 'n5', type: 'test', label: 'Verify Backup', x: 720, y: 140, config: { check: 'integrity' } },
      { id: 'n6', type: 'notify', label: 'Report Status', x: 940, y: 140, config: { channel: '#backup-log' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n1', target: 'n3' },
      { id: 'e3', source: 'n2', target: 'n4' },
      { id: 'e4', source: 'n3', target: 'n4' },
      { id: 'e5', source: 'n4', target: 'n5' },
      { id: 'e6', source: 'n5', target: 'n6' },
    ],
    createdAt: '2026-02-13T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
];

// --- localStorage ---
const STORAGE_KEY = 'yyc3_dag_workflows';

function loadWorkflows(): DAGWorkflow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveWorkflows(wfs: DAGWorkflow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wfs));
}

// --- Helpers ---
function uid() { return Math.random().toString(36).substring(2, 10); }

// --- Main Component ---

export function WorkflowOrchestrator() {
  const addLog = useSystemStore(s => s.addLog);
  const isMobile = useSystemStore(s => s.isMobile);

  // Workflow list
  const [customWorkflows, setCustomWorkflows] = React.useState<DAGWorkflow[]>(loadWorkflows);
  const allWorkflows = React.useMemo(() => [...PRESET_WORKFLOWS, ...customWorkflows], [customWorkflows]);

  // Active workflow
  const [activeWorkflowId, setActiveWorkflowId] = React.useState<string>(PRESET_WORKFLOWS[0].id);
  const [nodes, setNodes] = React.useState<DAGNode[]>(PRESET_WORKFLOWS[0].nodes);
  const [edges, setEdges] = React.useState<DAGEdge[]>(PRESET_WORKFLOWS[0].edges);
  const [workflowName, setWorkflowName] = React.useState(PRESET_WORKFLOWS[0].name);

  // Interaction state
  const [draggingNode, setDraggingNode] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = React.useState<string | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [showNodePalette, setShowNodePalette] = React.useState(false);
  const [showWorkflowList, setShowWorkflowList] = React.useState(false);
  const [editNodeConfig, setEditNodeConfig] = React.useState(false);

  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Canvas pan/offset
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });

  // Load workflow
  const loadWorkflow = React.useCallback((wf: DAGWorkflow) => {
    setActiveWorkflowId(wf.id);
    setNodes(wf.nodes.map(n => ({ ...n, status: 'idle' })));
    setEdges([...wf.edges]);
    setWorkflowName(wf.name);
    setSelectedNode(null);
    setConnectingFrom(null);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // --- Node Drag ---
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom) return;
    const node = nodes.find(n => n.id === nodeId);

    if (!node) return;

    const svgRect = svgRef.current?.getBoundingClientRect();

    if (!svgRect) return;

    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - svgRect.left - node.x - panOffset.x,
      y: e.clientY - svgRect.top - node.y - panOffset.y,
    });
    setSelectedNode(nodeId);
  };

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (draggingNode) {
      const svgRect = svgRef.current?.getBoundingClientRect();

      if (!svgRect) return;
      const newX = Math.max(0, e.clientX - svgRect.left - dragOffset.x - panOffset.x);
      const newY = Math.max(0, e.clientY - svgRect.top - dragOffset.y - panOffset.y);

      setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x: newX, y: newY } : n));
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;

      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, dragOffset, panOffset, isPanning, panStart]);

  const handleMouseUp = React.useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
  }, []);

  // --- Pan ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedNode(null);
    }
  };

  // --- Connection ---
  const handleOutputPortClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom) {
      // Cancel
      setConnectingFrom(null);
    } else {
      setConnectingFrom(nodeId);
    }
  };

  const handleInputPortClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom !== nodeId) {
      // Check no duplicate
      const exists = edges.some(ed => ed.source === connectingFrom && ed.target === nodeId);

      if (!exists) {
        setEdges(prev => [...prev, { id: `e-${uid()}`, source: connectingFrom, target: nodeId }]);
      }
    }
    setConnectingFrom(null);
  };

  // --- Add Node ---
  const handleAddNode = (type: NodeType) => {
    const newNode: DAGNode = {
      id: `n-${uid()}`,
      type,
      label: NODE_TYPES[type].label,
      x: 200 + Math.random() * 200 - panOffset.x,
      y: 100 + Math.random() * 200 - panOffset.y,
      config: {},
      status: 'idle',
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
    setShowNodePalette(false);
  };

  // --- Delete ---
  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  };

  // --- Save Workflow ---
  const handleSave = () => {
    const now = new Date().toISOString();
    const isPreset = PRESET_WORKFLOWS.some(p => p.id === activeWorkflowId);

    if (isPreset) {
      // Fork as custom
      const newWf: DAGWorkflow = {
        id: `wf-${uid()}`,
        name: `${workflowName} (Custom)`,
        description: 'Forked custom workflow',
        nodes: [...nodes],
        edges: [...edges],
        createdAt: now,
        updatedAt: now,
      };
      const updated = [...customWorkflows, newWf];

      setCustomWorkflows(updated);
      saveWorkflows(updated);
      setActiveWorkflowId(newWf.id);
      addLog('success', 'WORKFLOW', `Saved workflow: ${newWf.name}`);
    } else {
      // Update existing custom
      const updated = customWorkflows.map(wf =>
        wf.id === activeWorkflowId
          ? { ...wf, name: workflowName, nodes: [...nodes], edges: [...edges], updatedAt: now }
          : wf,
      );

      setCustomWorkflows(updated);
      saveWorkflows(updated);
      addLog('success', 'WORKFLOW', `Updated workflow: ${workflowName}`);
    }
  };

  // --- New Workflow ---
  const handleNewWorkflow = () => {
    const now = new Date().toISOString();
    const wf: DAGWorkflow = {
      id: `wf-${uid()}`,
      name: 'New Workflow',
      description: '',
      nodes: [
        { id: `n-${uid()}`, type: 'trigger', label: 'Start', x: 60, y: 140, config: {}, status: 'idle' },
      ],
      edges: [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...customWorkflows, wf];

    setCustomWorkflows(updated);
    saveWorkflows(updated);
    loadWorkflow(wf);
    addLog('info', 'WORKFLOW', 'Created new workflow');
  };

  // --- Delete Workflow ---
  const handleDeleteWorkflow = (wfId: string) => {
    const updated = customWorkflows.filter(w => w.id !== wfId);

    setCustomWorkflows(updated);
    saveWorkflows(updated);
    if (activeWorkflowId === wfId) {
      loadWorkflow(PRESET_WORKFLOWS[0]);
    }
    addLog('warn', 'WORKFLOW', 'Deleted custom workflow');
  };

  // --- Execute Simulation ---
  const handleExecute = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    addLog('info', 'WORKFLOW', `Executing workflow: ${workflowName}`);

    // BFS-like execution simulation
    const triggerNodes = nodes.filter(n => n.type === 'trigger');

    if (triggerNodes.length === 0) {
      setIsExecuting(false);

      return;
    }

    // Reset all to idle
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));

    // Build adjacency
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    nodes.forEach(n => { adj[n.id] = []; inDegree[n.id] = 0; });
    edges.forEach(e => {
      adj[e.source]?.push(e.target);
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    });

    // Topological layers
    const layers: string[][] = [];
    let queue = triggerNodes.map(n => n.id);
    const visited = new Set<string>();

    while (queue.length > 0) {
      layers.push([...queue]);
      queue.forEach(id => visited.add(id));
      const next: string[] = [];

      queue.forEach(id => {
        adj[id]?.forEach(target => {
          if (!visited.has(target) && !next.includes(target)) {
            next.push(target);
          }
        });
      });
      queue = next;
    }

    // Animate layers
    layers.forEach((layer, i) => {
      setTimeout(() => {
        setNodes(prev => prev.map(n =>
          layer.includes(n.id) ? { ...n, status: 'running' } : n,
        ));
      }, i * 1200);

      setTimeout(() => {
        setNodes(prev => prev.map(n =>
          layer.includes(n.id)
            ? { ...n, status: Math.random() > 0.1 ? 'success' : 'failed' }
            : n,
        ));
      }, i * 1200 + 900);
    });

    setTimeout(() => {
      setIsExecuting(false);
      addLog('success', 'WORKFLOW', `Workflow execution complete: ${workflowName}`);
    }, layers.length * 1200 + 1000);
  };

  // --- Render Bezier Edge ---
  const renderEdge = (edge: DAGEdge) => {
    const src = nodes.find(n => n.id === edge.source);
    const tgt = nodes.find(n => n.id === edge.target);

    if (!src || !tgt) return null;

    const x1 = src.x + NODE_WIDTH;
    const y1 = src.y + NODE_HEIGHT / 2;
    const x2 = tgt.x;
    const y2 = tgt.y + NODE_HEIGHT / 2;
    const cpX = Math.abs(x2 - x1) * 0.4;

    const isActive = src.status === 'running' || (src.status === 'success' && tgt.status === 'running');

    return (
      <g key={edge.id} className="cursor-pointer group/edge" onClick={() => handleDeleteEdge(edge.id)}>
        <path
          d={`M ${x1} ${y1} C ${x1 + cpX} ${y1}, ${x2 - cpX} ${y2}, ${x2} ${y2}`}
          fill="none"
          stroke="transparent"
          strokeWidth={12}
        />
        <path
          d={`M ${x1} ${y1} C ${x1 + cpX} ${y1}, ${x2 - cpX} ${y2}, ${x2} ${y2}`}
          fill="none"
          stroke={isActive ? '#38bdf8' : 'rgba(255,255,255,0.12)'}
          strokeWidth={isActive ? 2.5 : 1.5}
          strokeDasharray={isActive ? '' : ''}
          className="transition-all duration-500 group-hover/edge:stroke-red-500/60"
        />
        {isActive && (
          <circle r="3" fill="#38bdf8">
            <animateMotion
              dur="1.5s"
              repeatCount="indefinite"
              path={`M ${x1} ${y1} C ${x1 + cpX} ${y1}, ${x2 - cpX} ${y2}, ${x2} ${y2}`}
            />
          </circle>
        )}
        {/* Arrow head */}
        <polygon
          points={`${x2 - 8},${y2 - 4} ${x2},${y2} ${x2 - 8},${y2 + 4}`}
          fill={isActive ? '#38bdf8' : 'rgba(255,255,255,0.15)'}
          className="transition-colors group-hover/edge:fill-red-500/60"
        />
      </g>
    );
  };

  // --- Render Node ---
  const renderNode = (node: DAGNode) => {
    const info = NODE_TYPES[node.type];
    const NodeIcon = info.icon;
    const isSelected = selectedNode === node.id;
    const isConnecting = connectingFrom === node.id;

    const statusBorder =
      node.status === 'running' ? 'rgba(56,189,248,0.6)' :
      node.status === 'success' ? 'rgba(74,222,128,0.6)' :
      node.status === 'failed' ? 'rgba(248,113,113,0.6)' :
      isSelected ? 'rgba(14,165,233,0.5)' :
      info.borderColor;

    return (
      <g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        onMouseDown={e => handleNodeMouseDown(e, node.id)}
        className="cursor-grab active:cursor-grabbing"
      >
        {/* Glow effect */}
        {(node.status === 'running' || isSelected) && (
          <rect
            x={-3} y={-3}
            width={NODE_WIDTH + 6} height={NODE_HEIGHT + 6}
            rx={12} ry={12}
            fill="none"
            stroke={node.status === 'running' ? 'rgba(56,189,248,0.3)' : 'rgba(14,165,233,0.2)'}
            strokeWidth={2}
            className={node.status === 'running' ? 'animate-pulse' : ''}
          />
        )}

        {/* Node body */}
        <rect
          width={NODE_WIDTH} height={NODE_HEIGHT}
          rx={10} ry={10}
          fill={info.bgColor}
          stroke={statusBorder}
          strokeWidth={isSelected ? 2 : 1}
        />

        {/* Icon */}
        <foreignObject x={10} y={12} width={24} height={24}>
          <NodeIcon className={cn('w-5 h-5', info.color)} />
        </foreignObject>

        {/* Label */}
        <text x={40} y={27} fill="white" fontSize={11} fontFamily="monospace" fontWeight="bold">
          {node.label.length > 14 ? node.label.slice(0, 14) + '..' : node.label}
        </text>

        {/* Type badge */}
        <text x={40} y={46} fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="monospace">
          {info.label}
          {node.status === 'running' && ' ...'}
          {node.status === 'success' && ' OK'}
          {node.status === 'failed' && ' ERR'}
        </text>

        {/* Status indicator */}
        {node.status && node.status !== 'idle' && (
          <circle
            cx={NODE_WIDTH - 12} cy={12} r={4}
            fill={
              node.status === 'running' ? '#38bdf8' :
              node.status === 'success' ? '#4ade80' :
              '#f87171'
            }
            className={node.status === 'running' ? 'animate-pulse' : ''}
          />
        )}

        {/* Input port (left) */}
        <circle
          cx={0} cy={NODE_HEIGHT / 2} r={6}
          fill={isConnecting ? 'transparent' : 'rgba(255,255,255,0.05)'}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          className="cursor-crosshair hover:fill-primary/30 hover:stroke-primary/60 transition-colors"
          onClick={e => handleInputPortClick(e, node.id)}
        />

        {/* Output port (right) */}
        <circle
          cx={NODE_WIDTH} cy={NODE_HEIGHT / 2} r={6}
          fill={isConnecting ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.05)'}
          stroke={isConnecting ? 'rgba(14,165,233,0.6)' : 'rgba(255,255,255,0.2)'}
          strokeWidth={isConnecting ? 2 : 1}
          className="cursor-crosshair hover:fill-primary/30 hover:stroke-primary/60 transition-colors"
          onClick={e => handleOutputPortClick(e, node.id)}
        />
      </g>
    );
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Workflow selector */}
        <div className="relative">
          <Button
            size="sm" variant="outline"
            className="h-8 text-xs font-mono border-white/10 gap-1.5 min-w-[180px] justify-between"
            onClick={() => setShowWorkflowList(!showWorkflowList)}
          >
            <Network className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">{workflowName}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </Button>

          {showWorkflowList && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <ScrollArea className="max-h-[300px]">
                <div className="p-1.5">
                  {allWorkflows.map(wf => (
                    <div key={wf.id}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors group/item',
                        activeWorkflowId === wf.id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-zinc-300',
                      )}
                    >
                      <button
                        className="flex-1 text-left min-w-0"
                        onClick={() => { loadWorkflow(wf); setShowWorkflowList(false); }}
                      >
                        <div className="text-xs font-mono truncate">{wf.name}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{wf.description}</div>
                      </button>
                      {!PRESET_WORKFLOWS.some(p => p.id === wf.id) && (
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100"
                          onClick={e => { e.stopPropagation(); handleDeleteWorkflow(wf.id); }}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-white/5 p-1.5">
                <Button size="sm" variant="ghost" className="w-full h-8 text-xs font-mono gap-1 text-zinc-400"
                  onClick={() => { handleNewWorkflow(); setShowWorkflowList(false); }}>
                  <Plus className="w-3 h-3" /> New Workflow
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1"
            onClick={() => setShowNodePalette(!showNodePalette)}>
            <Plus className="w-3 h-3" /> Add Node
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs font-mono border-white/10 gap-1"
            onClick={handleSave}>
            <Save className="w-3 h-3" /> Save
          </Button>
          <Button
            size="sm"
            className={cn('h-8 text-xs font-mono gap-1', isExecuting && 'animate-pulse')}
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {isExecuting ? 'Running...' : 'Execute'}
          </Button>
        </div>

        {connectingFrom && (
          <Badge className="text-[10px] font-mono bg-primary/20 text-primary border-primary/30 animate-pulse">
            Click target node input port...
            <button className="ml-2" onClick={() => setConnectingFrom(null)}>
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-500">
            {nodes.length} nodes / {edges.length} edges
          </Badge>
        </div>
      </div>

      {/* Node Palette */}
      {showNodePalette && (
        <Card className="bg-zinc-900/60 border-white/10 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-3">
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(NODE_TYPES) as [NodeType, NodeTypeInfo][]).map(([type, info]) => {
                const Icon = info.icon;

                return (
                  <button
                    key={type}
                    onClick={() => handleAddNode(type)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-xs font-mono"
                  >
                    <Icon className={cn('w-3.5 h-3.5', info.color)} />
                    <span className="text-zinc-300">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canvas + Detail Panel */}
      <div className={cn('flex gap-4', isMobile && 'flex-col')}>
        {/* SVG Canvas */}
        <div
          ref={containerRef}
          className={cn(
            'relative bg-black/40 border border-white/10 rounded-xl overflow-hidden',
            isMobile ? 'h-[50vh]' : 'flex-1 h-[520px]',
          )}
        >
          {/* Grid pattern */}
          <svg
            ref={svgRef}
            className="w-full h-full select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={handleCanvasMouseDown}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <g transform={`translate(${panOffset.x}, ${panOffset.y})`}>
              {/* Edges */}
              {edges.map(renderEdge)}

              {/* Nodes */}
              {nodes.map(renderNode)}
            </g>

            {/* Empty state */}
            {nodes.length === 0 && (
              <text x="50%" y="50%" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={14} fontFamily="monospace">
                Click "Add Node" to start building your workflow
              </text>
            )}
          </svg>

          {/* Canvas controls */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-zinc-900/80 border-white/10"
              onClick={() => setPanOffset({ x: 0, y: 0 })}>
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Node Inspector Panel */}
        {selectedNodeData && (
          <Card className={cn(
            'bg-zinc-900/60 border-white/10 animate-in slide-in-from-right-4 duration-200',
            isMobile ? 'w-full' : 'w-72 shrink-0',
          )}>
            <CardHeader className="py-3 border-b border-white/5">
              <CardTitle className="text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {React.createElement(NODE_TYPES[selectedNodeData.type].icon, {
                    className: cn('w-4 h-4', NODE_TYPES[selectedNodeData.type].color),
                  })}
                  <span className="text-zinc-300">Node Inspector</span>
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0"
                  onClick={() => setSelectedNode(null)}>
                  <X className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              {/* Label */}
              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 block">Label</label>
                <Input
                  value={selectedNodeData.label}
                  onChange={e => setNodes(prev => prev.map(n =>
                    n.id === selectedNode ? { ...n, label: e.target.value } : n,
                  ))}
                  className="h-7 text-xs font-mono bg-zinc-800 border-white/10"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 block">Type</label>
                <Badge variant="outline" className={cn('text-[10px] font-mono', NODE_TYPES[selectedNodeData.type].color)}>
                  {NODE_TYPES[selectedNodeData.type].label}
                </Badge>
              </div>

              {/* Config */}
              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 flex items-center justify-between">
                  Config
                  <Button size="sm" variant="ghost" className="h-5 px-1 text-[9px]"
                    onClick={() => setEditNodeConfig(!editNodeConfig)}>
                    <Settings className="w-3 h-3" />
                  </Button>
                </label>
                {editNodeConfig ? (
                  <textarea
                    value={JSON.stringify(selectedNodeData.config, null, 2)}
                    onChange={e => {
                      try {
                        const config = JSON.parse(e.target.value);

                        setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, config } : n,
                        ));
                      } catch {/* ignore invalid JSON */}
                    }}
                    className="w-full h-24 p-2 bg-zinc-800 text-[10px] font-mono text-zinc-300 rounded border border-white/10 resize-none focus:outline-none"
                    spellCheck={false}
                  />
                ) : (
                  <div className="space-y-1">
                    {Object.entries(selectedNodeData.config).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-[10px] font-mono px-2 py-1 bg-zinc-800/50 rounded">
                        <span className="text-zinc-500">{key}</span>
                        <span className="text-zinc-300 truncate max-w-[120px]">{val}</span>
                      </div>
                    ))}
                    {Object.keys(selectedNodeData.config).length === 0 && (
                      <p className="text-[10px] text-zinc-600 font-mono">No config set</p>
                    )}
                  </div>
                )}
              </div>

              {/* Connections */}
              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 block">Connections</label>
                <div className="space-y-1">
                  {edges.filter(e => e.source === selectedNode || e.target === selectedNode).map(e => {
                    const otherNode = nodes.find(n => n.id === (e.source === selectedNode ? e.target : e.source));

                    return (
                      <div key={e.id} className="flex items-center justify-between text-[10px] font-mono px-2 py-1 bg-zinc-800/50 rounded">
                        <span className="text-zinc-400">
                          {e.source === selectedNode ? '→' : '←'} {otherNode?.label || 'unknown'}
                        </span>
                        <Button size="sm" variant="ghost" className="h-4 w-4 p-0"
                          onClick={() => handleDeleteEdge(e.id)}>
                          <X className="w-2.5 h-2.5 text-red-400" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-white/5 flex gap-2">
                <Button size="sm" variant="ghost" className="flex-1 h-7 text-[10px] font-mono text-primary gap-1"
                  onClick={() => handleOutputPortClick({ stopPropagation: () => {} } as React.MouseEvent, selectedNode!)}>
                  <ArrowRight className="w-3 h-3" /> Connect
                </Button>
                <Button size="sm" variant="ghost" className="flex-1 h-7 text-[10px] font-mono text-red-400 gap-1"
                  onClick={() => handleDeleteNode(selectedNode!)}>
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Help */}
      <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono flex-wrap">
        <span>Drag nodes to reposition</span>
        <span className="text-zinc-700">|</span>
        <span>Click output port (right) then input port (left) to connect</span>
        <span className="text-zinc-700">|</span>
        <span>Click edge to delete</span>
        <span className="text-zinc-700">|</span>
        <span>Drag canvas background to pan</span>
      </div>
    </div>
  );
}