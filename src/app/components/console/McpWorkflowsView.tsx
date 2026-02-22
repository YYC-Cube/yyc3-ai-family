import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Copy, Check, FileCode, Shield, Cpu, Database,
  HardDrive, Wrench, Zap, Eye, Edit3, Save, X,
  Plus, Trash2, FolderOpen, Download, Upload,
  GitBranch, Box, Search, Figma, Loader2
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Input } from "@/app/components/ui/input";
import { useSystemStore } from "@/lib/store";
import type { CustomTemplate } from "@/lib/types";

// --- Types ---

interface WorkflowTemplate {
  id: string;
  name: string;
  category: 'mcp' | 'cicd' | 'deploy' | 'security' | 'backup' | 'monitoring';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  desc: string;
  content: string;
  isCustom?: boolean;
}

// --- Built-in Templates ---

const BUILTIN_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'mcp-figma', name: 'MCP: Figma Design Bridge', category: 'mcp', icon: Figma, color: 'text-pink-500',
    desc: 'Figma MCP Server — 设计稿实时同步与 Design-to-Code 管线',
    content: `{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": [
        "-y", "figma-developer-mcp",
        "--figma-api-key=YOUR_FIGMA_API_KEY"
      ],
      "env": {
        "FIGMA_API_KEY": "figd_xxxxxxxxxxxxxxxxxxxxxxxxx",
        "FIGMA_TEAM_ID": "your_team_id"
      }
    }
  }
}

// Figma MCP Capabilities:
// - figma_get_file: 获取 Figma 文件的完整设计数据
// - figma_get_node: 获取指定节点/组件的属性
// - figma_get_styles: 提取设计系统 Token (色彩/字体/间距)
// - figma_export_assets: 导出 SVG/PNG 资源到本地
// - figma_get_comments: 获取设计评审评论`,
  },
  {
    id: 'mcp-claude', name: 'MCP: Claude Desktop', category: 'mcp', icon: Cpu, color: 'text-amber-500',
    desc: 'Claude Desktop MCP Server 配置模板，连接本地 DevOps 工具链',
    content: `{
  "mcpServers": {
    "yyc3-devops": {
      "command": "node",
      "args": ["./mcp-server/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_NAME": "yyc3_devops"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y", "@modelcontextprotocol/server-filesystem",
        "/Users/dev/yyc3-projects"
      ]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y", "@modelcontextprotocol/server-postgres",
        "postgresql://yyc3_admin@localhost/yyc3_devops"
      ]
    }
  }
}`,
  },
  {
    id: 'mcp-custom', name: 'MCP: Custom Tool Server', category: 'mcp', icon: Wrench, color: 'text-cyan-500',
    desc: '自定义 MCP 工具服务端骨架 — TypeScript + Zod 验证',
    content: `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new Server({
  name: "yyc3-tools",
  version: "1.0.0",
}, { capabilities: { tools: {} } });

// Register tool: cluster status
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "cluster_status",
    description: "Get YYC3 cluster health and metrics",
    inputSchema: {
      type: "object",
      properties: {
        node: { type: "string", enum: ["m4-max","imac-m4","matebook","yanyucloud"] }
      }
    }
  }]
}));

server.setRequestHandler("tools/call", async (req) => {
  if (req.params.name === "cluster_status") {
    return { content: [{ type: "text", text: "All nodes healthy" }] };
  }
  throw new Error("Unknown tool");
});

const transport = new StdioServerTransport();
await server.connect(transport);`,
  },
  {
    id: 'mcp-resource', name: 'MCP: Resource Provider', category: 'mcp', icon: Database, color: 'text-emerald-500',
    desc: 'MCP Resource 提供器 — 暴露项目数据为 AI 可读资源',
    content: `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "yyc3-resources",
  version: "1.0.0",
}, { capabilities: { resources: {} } });

// List available resources
server.setRequestHandler("resources/list", async () => ({
  resources: [
    {
      uri: "yyc3://projects/list",
      name: "Project Registry",
      description: "All registered YYC3 projects",
      mimeType: "application/json"
    },
    {
      uri: "yyc3://metrics/cluster",
      name: "Cluster Metrics",
      description: "Real-time cluster health metrics",
      mimeType: "application/json"
    },
    {
      uri: "yyc3://logs/recent",
      name: "Recent Logs",
      description: "Last 100 system log entries",
      mimeType: "application/json"
    }
  ]
}));

// Read specific resource
server.setRequestHandler("resources/read", async (req) => {
  const uri = req.params.uri;
  if (uri === "yyc3://projects/list") {
    const projects = await fetchProjects(); // your DB query
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(projects) }] };
  }
  throw new Error(\`Unknown resource: \${uri}\`);
});

const transport = new StdioServerTransport();
await server.connect(transport);`,
  },
  {
    id: 'workflow-cicd', name: 'CI/CD: GitHub Actions', category: 'cicd', icon: GitBranch, color: 'text-green-500',
    desc: 'YYC3 标准 CI/CD 管线 — 构建 -> 测试 -> 安全扫描 -> 部署',
    content: `name: YYC3 CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: self-hosted  # M4 Max Runner
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - run: pnpm run lint

  test:
    needs: build
    runs-on: self-hosted
    steps:
      - run: pnpm run test -- --coverage
      - run: pnpm run test:integration

  security:
    needs: test
    steps:
      - run: pnpm audit --audit-level=high
      - run: trivy fs --severity HIGH,CRITICAL .

  deploy-staging:
    needs: security
    if: github.ref == 'refs/heads/develop'
    steps:
      - run: docker build -t yyc3-core:staging .
      - run: docker push registry.yyc3.local/yyc3-core:staging
      - run: kubectl rollout restart deploy/yyc3-staging`,
  },
  {
    id: 'deploy-compose', name: 'Docker Compose: Full Stack', category: 'deploy', icon: Box, color: 'text-blue-500',
    desc: 'YYC3 完整技术栈 Docker Compose — 含 Postgres, Redis, Nginx',
    content: `version: "3.9"
services:
  gateway:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/ssl/certs:ro
    depends_on: [api]

  api:
    build: .
    ports: ["3001:3001"]
    env_file: .env
    depends_on: [postgres, redis]
    deploy:
      resources:
        limits:
          cpus: "4.0"
          memory: 4G

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: yyc3_devops
      POSTGRES_USER: yyc3_admin
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --maxmemory 256mb

  worker:
    build:
      context: ./agent-runtime
    env_file: .env
    depends_on: [redis, postgres]

volumes:
  pg_data:`,
  },
  {
    id: 'security-audit', name: 'Security: Audit Workflow', category: 'security', icon: Shield, color: 'text-red-500',
    desc: '安全审计自动化 — SAST + 依赖扫描 + 密钥检测 + 合规报告',
    content: `#!/bin/bash
# YYC3 Security Audit Workflow
set -euo pipefail

echo "=== YYC3 Security Audit ==="
echo "Date: $(date)"
echo "Operator: $(whoami)"

# 1. Static Analysis (SAST)
echo "\\n[1/5] Running SAST scan..."
npx eslint --ext .ts,.tsx src/ --rule '{"no-eval":"error","no-implied-eval":"error"}'

# 2. Dependency Audit
echo "\\n[2/5] Auditing dependencies..."
pnpm audit --audit-level=moderate
npm_audit_result=$?

# 3. Secret Detection
echo "\\n[3/5] Scanning for secrets..."
npx secretlint "**/*" --secretlintrc .secretlintrc.json

# 4. License Compliance
echo "\\n[4/5] Checking license compliance..."
npx license-checker --production --onlyAllow "MIT;ISC;BSD-2-Clause;BSD-3-Clause;Apache-2.0"

# 5. Container Security
echo "\\n[5/5] Scanning container images..."
trivy image yyc3-core:latest --severity HIGH,CRITICAL

echo "\\n=== Audit Complete ==="
echo "Report saved to: ./reports/security-audit-$(date +%Y%m%d).md"`,
  },
  {
    id: 'backup-nas', name: 'Backup: YanYuCloud NAS', category: 'backup', icon: HardDrive, color: 'text-purple-500',
    desc: 'NAS 自动备份策略 — RAID6 快照 + 异地冷备 + 保留策略',
    content: `#!/bin/bash
# YYC3 NAS Backup Strategy — YanYuCloud F4-423
set -euo pipefail

NAS_IP="192.168.1.100"
NAS_SHARE="/volume1/yyc3-backups"
BACKUP_DIR="/mnt/yanyucloud/backups"

# 1. PostgreSQL Hot Backup
echo "[DB] Starting PostgreSQL backup..."
pg_dump -h localhost -U yyc3_admin -d yyc3_devops \\
  --format=custom --compress=9 \\
  -f "$BACKUP_DIR/db/yyc3_devops_$(date +%Y%m%d_%H%M).dump"

# 2. Application State
echo "[APP] Backing up application state..."
tar -czf "$BACKUP_DIR/app/state_$(date +%Y%m%d).tar.gz" \\
  --exclude='node_modules' --exclude='.git' \\
  /Users/dev/yyc3-core/

# 3. Docker Volumes
echo "[DOCKER] Backing up volumes..."
docker run --rm -v pg_data:/data -v "$BACKUP_DIR/volumes":/backup \\
  alpine tar -czf /backup/pg_data_$(date +%Y%m%d).tar.gz /data

# 4. Retention Policy (keep 30 days)
echo "[CLEANUP] Applying retention policy..."
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "[DONE] Backup complete. Total size: $(du -sh $BACKUP_DIR | cut -f1)"`,
  },
  {
    id: 'monitor-alerts', name: 'Monitor: Alert Rules', category: 'monitoring', icon: Zap, color: 'text-yellow-500',
    desc: 'Prometheus 告警规则 — CPU/内存/磁盘/服务健康预警',
    content: `# YYC3 Prometheus Alert Rules
groups:
  - name: yyc3_cluster_alerts
    interval: 30s
    rules:
      - alert: HighCPUUsage
        expr: node_cpu_usage_percent > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU on {{ $labels.node }}"
          description: "CPU usage at {{ $value }}%"

      - alert: MemoryPressure
        expr: node_memory_usage_percent > 90
        for: 2m
        labels:
          severity: critical

      - alert: DiskSpaceLow
        expr: node_disk_usage_percent > 85
        for: 10m
        labels:
          severity: warning

      - alert: NASRAIDDegraded
        expr: nas_raid_status != 1
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "YanYuCloud RAID degraded!"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical

      - alert: HighResponseLatency
        expr: http_request_duration_seconds > 2
        for: 5m
        labels:
          severity: warning`,
  },
];

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  mcp: { label: 'MCP', color: 'text-amber-500' },
  cicd: { label: 'CI/CD', color: 'text-green-500' },
  deploy: { label: 'Deploy', color: 'text-blue-500' },
  security: { label: 'Security', color: 'text-red-500' },
  backup: { label: 'Backup', color: 'text-purple-500' },
  monitoring: { label: 'Monitor', color: 'text-yellow-500' },
  custom: { label: 'Custom', color: 'text-pink-500' },
};

const PROJECTS_LIST = [
  { id: 'yyc3-core', name: 'yyc3-core', desc: 'YYC3 核心平台' },
  { id: 'yyc3-gateway', name: 'yyc3-gateway', desc: 'API 网关' },
  { id: 'yyc3-agent-runtime', name: 'yyc3-agent-runtime', desc: 'AI 智能体运行时' },
  { id: 'yyc3-data-pipeline', name: 'yyc3-data-pipeline', desc: '数据流水线' },
  { id: 'yyc3-mcp-tools', name: 'yyc3-mcp-tools', desc: 'MCP 工具服务集' },
  { id: 'yyc3-devops-infra', name: 'yyc3-devops-infra', desc: 'DevOps 基础设施' },
];

// --- localStorage helpers ---
const STORAGE_KEY = 'yyc3_custom_templates';

function loadCustomTemplates(): CustomTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomTemplates(templates: CustomTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

// --- Main Component ---

export function McpWorkflowsView() {
  const addLog = useSystemStore((s) => s.addLog);
  const isMobile = useSystemStore((s) => s.isMobile);

  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [filterCat, setFilterCat] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  // Editing
  const [editMode, setEditMode] = React.useState(false);
  const [editContent, setEditContent] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');

  // Custom Templates (localStorage)
  const [customTemplates, setCustomTemplates] = React.useState<CustomTemplate[]>(loadCustomTemplates);

  // Apply-to-project dialog
  const [showApplyDialog, setShowApplyDialog] = React.useState(false);
  const [applyTarget, setApplyTarget] = React.useState<string | null>(null);
  const [applySuccess, setApplySuccess] = React.useState(false);

  // Create new dialog
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [newCategory, setNewCategory] = React.useState('mcp');
  const [newContent, setNewContent] = React.useState('');

  // Phase 35: Apply progress
  const [applyProgress, setApplyProgress] = React.useState<{ step: number; label: string } | null>(null);

  // Merge templates
  const allTemplates: WorkflowTemplate[] = React.useMemo(() => [
    ...BUILTIN_TEMPLATES,
    ...customTemplates.map(ct => ({
      ...ct,
      icon: FileCode,
      color: 'text-pink-500',
      isCustom: true,
    } as WorkflowTemplate)),
  ], [customTemplates]);

  const filtered = React.useMemo(() => {
    let list = filterCat === 'all'
      ? allTemplates
      : filterCat === 'custom'
        ? allTemplates.filter(t => t.isCustom)
        : allTemplates.filter(t => t.category === filterCat);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
    }
    return list;
  }, [allTemplates, filterCat, searchQuery]);

  const selected = allTemplates.find(t => t.id === selectedTemplate);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    if (!selected) return;
    setEditMode(true);
    setEditContent(selected.content);
    setEditName(selected.name);
    setEditDesc(selected.desc);
  };

  const handleSaveEdit = () => {
    if (!selected) return;
    const now = new Date().toISOString();

    if (selected.isCustom) {
      // Update existing custom template
      const updated = customTemplates.map(ct =>
        ct.id === selected.id
          ? { ...ct, name: editName, desc: editDesc, content: editContent, updatedAt: now }
          : ct
      );
      setCustomTemplates(updated);
      saveCustomTemplates(updated);
      addLog('success', 'TEMPLATES', `Updated custom template: ${editName}`);
    } else {
      // Save as new custom template (fork from builtin)
      const newTemplate: CustomTemplate = {
        id: `custom-${Date.now()}`,
        name: `${editName} (Custom)`,
        category: selected.category,
        desc: editDesc,
        content: editContent,
        createdAt: now,
        updatedAt: now,
        isCustom: true,
      };
      const updated = [...customTemplates, newTemplate];
      setCustomTemplates(updated);
      saveCustomTemplates(updated);
      setSelectedTemplate(newTemplate.id);
      addLog('success', 'TEMPLATES', `Forked template as: ${newTemplate.name}`);
    }
    setEditMode(false);
  };

  const handleCreateTemplate = () => {
    if (!newName.trim() || !newContent.trim()) return;
    const now = new Date().toISOString();
    const template: CustomTemplate = {
      id: `custom-${Date.now()}`,
      name: newName,
      category: newCategory,
      desc: newDesc || 'Custom template',
      content: newContent,
      createdAt: now,
      updatedAt: now,
      isCustom: true,
    };
    const updated = [...customTemplates, template];
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    addLog('success', 'TEMPLATES', `Created custom template: ${newName}`);
    setShowCreateDialog(false);
    setNewName('');
    setNewDesc('');
    setNewContent('');
    setSelectedTemplate(template.id);
  };

  const handleDeleteCustom = (id: string) => {
    const tmpl = customTemplates.find(t => t.id === id);
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    if (selectedTemplate === id) setSelectedTemplate(null);
    if (tmpl) addLog('warn', 'TEMPLATES', `Deleted custom template: ${tmpl.name}`);
  };

  const handleApplyToProject = async () => {
    if (!selected || !applyTarget) return;
    
    // Phase 35: Multi-step "Smart" execution simulation
    const steps = [
      { label: 'Initializing deployment context...', delay: 600 },
      { label: 'Validating template schema...', delay: 800 },
      { label: `Establishing NAS connection (${applyTarget})...`, delay: 1000 },
      { label: 'Injecting workflow definitions...', delay: 1200 },
      { label: 'Synchronizing project state...', delay: 700 },
      { label: 'Verifying deployment checksums...', delay: 500 }
    ];

    addLog('info', 'DEVOPS', `Starting deployment of "${selected.name}" to "${applyTarget}"`);
    
    for (let i = 0; i < steps.length; i++) {
      setApplyProgress({ step: i + 1, label: steps[i].label });
      await new Promise(r => setTimeout(r, steps[i].delay));
    }

    setApplySuccess(true);
    setApplyProgress(null);
    addLog('success', 'DEVOPS', `Successfully applied template "${selected.name}" to project "${applyTarget}"`);
    
    setTimeout(() => {
      setShowApplyDialog(false);
      setApplyTarget(null);
      setApplySuccess(false);
    }, 2000);
  };

  const handleExport = () => {
    if (!selected) return;
    const blob = new Blob([selected.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.name.replace(/[^a-zA-Z0-9-]/g, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('info', 'TEMPLATES', `Exported template: ${selected.name}`);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 bg-zinc-900/50 border-white/10 text-xs font-mono"
          />
        </div>
        <Button
          size="sm"
          className="h-8 text-xs font-mono gap-1.5"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-3 h-3" /> New Template
        </Button>
        <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-500">
          {allTemplates.length} templates ({customTemplates.length} custom)
        </Badge>
      </div>

      {/* Category Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {['all', ...Object.keys(CATEGORY_META)].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase transition-colors",
              filterCat === cat
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-zinc-500 hover:text-zinc-300 bg-zinc-900/50 border border-white/5"
            )}
          >
            {cat === 'all' ? 'ALL' : CATEGORY_META[cat]?.label}
            {cat === 'custom' && customTemplates.length > 0 && (
              <span className="ml-1 text-[9px] text-pink-500">({customTemplates.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className={cn(
        "grid gap-3 md:gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      )}>
        {filtered.map(template => {
          const TIcon = template.icon;
          return (
            <Card
              key={template.id}
              className={cn(
                "bg-zinc-900/40 border-white/5 cursor-pointer transition-all hover:border-white/20 hover:-translate-y-0.5 group relative",
                selectedTemplate === template.id && "border-primary/30 ring-1 ring-primary/20"
              )}
              onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
            >
              {template.isCustom && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="text-[8px] bg-pink-500/20 text-pink-400 border-pink-500/30">CUSTOM</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shrink-0", template.color)}>
                    <TIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-mono text-zinc-200 truncate">{template.name}</CardTitle>
                    <Badge variant="outline" className={cn("text-[9px] font-mono mt-1", CATEGORY_META[template.category]?.color || 'text-zinc-400')}>
                      {CATEGORY_META[template.category]?.label || template.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-zinc-500 line-clamp-2">{template.desc}</p>
                <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm" variant="ghost"
                    className="h-6 px-2 text-[10px] font-mono text-zinc-400"
                    onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template.id); }}
                  >
                    <Eye className="w-3 h-3 mr-1" /> View
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="h-6 px-2 text-[10px] font-mono text-primary"
                    onClick={(e) => { e.stopPropagation(); handleCopy(template.content); }}
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    Copy
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="h-6 px-2 text-[10px] font-mono text-green-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template.id);
                      setShowApplyDialog(true);
                    }}
                  >
                    <FolderOpen className="w-3 h-3 mr-1" /> Apply
                  </Button>
                  {template.isCustom && (
                    <Button
                      size="sm" variant="ghost"
                      className="h-6 px-2 text-[10px] font-mono text-red-400"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCustom(template.id); }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-500 font-mono text-sm">
          <FileCode className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No templates found matching "{searchQuery || filterCat}"</p>
        </div>
      )}

      {/* Template Preview / Edit */}
      {selected && (
        <Card className="bg-black/60 border-white/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="py-3 border-b border-white/5 bg-zinc-900/40">
            <CardTitle className="text-sm font-mono flex items-center justify-between text-zinc-300">
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-4 h-4 text-primary shrink-0" />
                {editMode ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-6 text-xs font-mono bg-zinc-800 border-white/10 w-auto max-w-[200px]"
                  />
                ) : (
                  <span className="truncate">{selected.name}</span>
                )}
                {selected.isCustom && (
                  <Badge className="text-[8px] bg-pink-500/20 text-pink-400 border-pink-500/30 shrink-0">CUSTOM</Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {editMode ? (
                  <div className="contents">
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] font-mono text-green-400 gap-1" onClick={handleSaveEdit}>
                      <Save className="w-3 h-3" /> {selected.isCustom ? 'Save' : 'Fork & Save'}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] font-mono text-zinc-400 gap-1" onClick={() => setEditMode(false)}>
                      <X className="w-3 h-3" /> Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="contents">
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] font-mono text-amber-400 gap-1" onClick={handleStartEdit}>
                      <Edit3 className="w-3 h-3" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] font-mono text-green-400 gap-1"
                      onClick={() => setShowApplyDialog(true)}>
                      <FolderOpen className="w-3 h-3" /> Apply to Project
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] font-mono text-zinc-400 gap-1" onClick={handleExport}>
                      <Download className="w-3 h-3" /> Export
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] font-mono text-zinc-400 gap-1"
                      onClick={() => handleCopy(selected.content)}>
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] font-mono text-zinc-400" onClick={() => { setSelectedTemplate(null); setEditMode(false); }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          {editMode && (
            <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/20">
              <Input
                placeholder="Description..."
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="h-7 text-[11px] font-mono bg-zinc-800 border-white/10"
              />
            </div>
          )}

          <CardContent className="p-0">
            {editMode ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[350px] max-h-[500px] p-4 bg-transparent text-[11px] font-mono text-zinc-300 resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 leading-relaxed"
                spellCheck={false}
              />
            ) : (
              <ScrollArea className="max-h-[400px]">
                <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed">
                  {selected.content.split('\n').map((line, i) => (
                    <div key={i} className="flex hover:bg-white/[0.02]">
                      <span className="text-zinc-600 w-8 text-right pr-4 select-none shrink-0">{i + 1}</span>
                      <span className="flex-1">{line}</span>
                    </div>
                  ))}
                </pre>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Apply-to-Project Dialog */}
      {showApplyDialog && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-primary/20 rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 mx-4">
            {applySuccess ? (
              <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-sm font-mono text-green-400 mb-1 uppercase tracking-widest">Deployment Complete</h3>
                <p className="text-xs text-zinc-500 font-mono">
                  "{selected.name}" applied to {applyTarget}
                </p>
              </div>
            ) : applyProgress ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-[10px] font-mono text-primary mb-3 uppercase tracking-[0.2em]">Executing Workflow</h3>
                <div className="w-full bg-zinc-800 rounded-full h-1 mb-4 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500 ease-out" 
                    style={{ width: `${(applyProgress.step / 6) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400 font-mono animate-pulse">
                  [{applyProgress.step}/6] {applyProgress.label}
                </p>
              </div>
            ) : (
              <div className="contents">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono text-white">APPLY_TO_PROJECT</h3>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Template: {selected.name}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mb-4">
                  Select target project to apply this configuration template. Files will be created/updated in the project directory.
                </p>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {PROJECTS_LIST.map(project => (
                    <button
                      key={project.id}
                      onClick={() => setApplyTarget(project.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all flex items-center gap-3",
                        applyTarget === project.id
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-zinc-800/50 border border-white/5 hover:border-white/10"
                      )}
                    >
                      <FolderOpen className={cn(
                        "w-4 h-4 shrink-0",
                        applyTarget === project.id ? "text-primary" : "text-zinc-500"
                      )} />
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-zinc-200 truncate">{project.name}</div>
                        <div className="text-[10px] text-zinc-500">{project.desc}</div>
                      </div>
                      {applyTarget === project.id && (
                        <Check className="w-4 h-4 text-primary ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/5">
                  <Button variant="ghost" className="text-xs font-mono" onClick={() => { setShowApplyDialog(false); setApplyTarget(null); }}>
                    CANCEL
                  </Button>
                  <Button
                    className="text-xs font-mono gap-1.5"
                    disabled={!applyTarget}
                    onClick={handleApplyToProject}
                  >
                    <Upload className="w-3 h-3" /> APPLY_TEMPLATE
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create New Template Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-zinc-900 border border-primary/20 rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 mx-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="text-sm font-mono text-white">CREATE_TEMPLATE</h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  New custom workflow template
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Template name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9 text-xs font-mono bg-zinc-800 border-white/10"
              />
              <Input
                placeholder="Description..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="h-9 text-xs font-mono bg-zinc-800 border-white/10"
              />
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(CATEGORY_META).filter(([k]) => k !== 'custom').map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setNewCategory(key)}
                    className={cn(
                      "px-2.5 py-1 rounded text-[10px] font-mono transition-colors",
                      newCategory === key
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-zinc-500 bg-zinc-800 border border-white/5"
                    )}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Template content (YAML, JSON, Shell, TypeScript...)"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full min-h-[200px] p-3 bg-zinc-800 text-[11px] font-mono text-zinc-300 rounded-lg border border-white/10 resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/5">
              <Button variant="ghost" className="text-xs font-mono" onClick={() => setShowCreateDialog(false)}>
                CANCEL
              </Button>
              <Button
                className="text-xs font-mono gap-1.5"
                disabled={!newName.trim() || !newContent.trim()}
                onClick={handleCreateTemplate}
              >
                <Save className="w-3 h-3" /> CREATE
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}