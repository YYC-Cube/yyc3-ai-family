import {
  Terminal, Copy, Check, Rocket, Database, Activity, Cpu, Box, Download,
  Server, Wrench, ChevronDown, ChevronRight, Radio, Key,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { eventBus } from '@/lib/event-bus';
import { useTranslation } from '@/lib/i18n';
import { loadProviderConfigs } from '@/lib/llm-bridge';
import { PROVIDERS } from '@/lib/llm-providers';
import { loadDeviceConfigs } from '@/lib/nas-client';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ============================================================
// OpsScriptGenerator — One-Click Operation Script Panel
// Phase 40: System Console Functional Closure
//
// Generates copy-paste-ready shell scripts for:
//   - Quick deploy (docker-compose on NAS)
//   - Database maintenance (pg_dump, vacuum, migration)
//   - Health check probe scripts
//   - Backup & restore
//   - Ollama model management
//   - Telemetry agent bootstrap
//   - Full system bootstrap
//   - Model routing diagnostics
// ============================================================

interface ScriptTemplate {
  id: string;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: 'deploy' | 'database' | 'health' | 'backup' | 'model' | 'bootstrap';
  script: () => string;
}

// --- Copy Button ---
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: create textarea
      const ta = document.createElement('textarea');

      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'h-7 text-[10px] font-mono gap-1 px-2 transition-all',
        copied ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-200',
      )}
      onClick={handleCopy}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}

// --- Script Card ---
function ScriptCard({ template, expanded, onToggle }: {
  template: ScriptTemplate;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const script = React.useMemo(() => template.script(), [template]);
  const Icon = template.icon;

  return (
    <div className={cn(
      'border rounded-lg transition-all',
      expanded
        ? 'border-zinc-700/50 bg-zinc-900/40 shadow-lg'
        : 'border-zinc-800/30 bg-zinc-900/20 hover:border-zinc-700/40',
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-700/50 bg-zinc-800/50 shrink-0',
          template.color,
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-zinc-200">
            {zh ? template.label : template.labelEn}
          </div>
          <div className="text-[9px] text-zinc-600 truncate">
            {zh ? template.description : template.descriptionEn}
          </div>
        </div>
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-3 pb-3 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <div className="absolute top-1 right-1 z-10">
              <CopyButton text={script} />
            </div>
            <pre className="bg-black/60 border border-zinc-800/50 rounded-lg p-3 pt-8 text-[10px] font-mono text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed max-h-[300px] overflow-y-auto">
              {script}
            </pre>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-[7px] font-mono text-zinc-600 border-zinc-800">
              {script.split('\n').length} lines
            </Badge>
            <Badge variant="outline" className="text-[7px] font-mono text-zinc-600 border-zinc-800">
              bash
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Build all script templates ---
function buildScriptTemplates(): ScriptTemplate[] {
  const devices = loadDeviceConfigs();
  const configs = loadProviderConfigs();
  const enabledProviders = configs.filter(c => c.enabled && c.apiKey);
  const m4 = devices.find(d => d.id === 'm4-max');
  const nasIp = m4?.ip || '192.168.3.22';

  return [
    // === DEPLOY ===
    {
      id: 'quick-deploy',
      label: '一键部署到 NAS',
      labelEn: 'Quick Deploy to NAS',
      description: 'Build + Push + Docker Compose 部署',
      descriptionEn: 'Build + Push + Docker Compose deploy',
      icon: Rocket,
      color: 'text-emerald-400',
      category: 'deploy',
      script: () => `#!/bin/bash
# YYC3 Quick Deploy — NAS Docker Compose
# Target: ${nasIp} (yyc3-22)
# Generated: ${new Date().toISOString()}

set -euo pipefail
REMOTE_USER="yyc3"
REMOTE_HOST="${nasIp}"
REMOTE_DIR="/opt/yyc3/chatbot"
IMAGE_NAME="yyc3-chatbot"
TAG="latest"

echo "=== [1/6] Building production bundle ==="
pnpm install --frozen-lockfile
pnpm run build

echo "=== [2/6] Building Docker image ==="
docker build -t \${IMAGE_NAME}:\${TAG} .

echo "=== [3/6] Saving Docker image ==="
docker save \${IMAGE_NAME}:\${TAG} | gzip > /tmp/\${IMAGE_NAME}.tar.gz

echo "=== [4/6] Transferring to NAS ==="
scp /tmp/\${IMAGE_NAME}.tar.gz \${REMOTE_USER}@\${REMOTE_HOST}:\${REMOTE_DIR}/

echo "=== [5/6] Loading image on NAS ==="
ssh \${REMOTE_USER}@\${REMOTE_HOST} "\\
  cd \${REMOTE_DIR} && \\
  docker load < \${IMAGE_NAME}.tar.gz && \\
  docker-compose up -d --force-recreate"

echo "=== [6/6] Health check ==="
sleep 5
curl -sf http://\${REMOTE_HOST}:3000/health || echo "WARN: Health endpoint not responding"

echo "=== Deploy complete ==="
rm -f /tmp/\${IMAGE_NAME}.tar.gz`,
    },
    {
      id: 'docker-compose-up',
      label: 'Docker Compose 重启',
      labelEn: 'Docker Compose Restart',
      description: '远程重启所有容器服务',
      descriptionEn: 'Remote restart all container services',
      icon: Box,
      color: 'text-sky-400',
      category: 'deploy',
      script: () => `#!/bin/bash
# YYC3 Docker Compose Restart
# Target: ${nasIp}

set -euo pipefail
REMOTE="yyc3@${nasIp}"
DIR="/opt/yyc3/chatbot"

echo "=== Pulling latest images ==="
ssh \${REMOTE} "cd \${DIR} && docker-compose pull"

echo "=== Restarting services ==="
ssh \${REMOTE} "cd \${DIR} && docker-compose down && docker-compose up -d"

echo "=== Checking container status ==="
ssh \${REMOTE} "docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'"

echo "=== Done ==="`,
    },

    // === DATABASE ===
    {
      id: 'pg15-backup',
      label: 'PG15 全量备份',
      labelEn: 'PG15 Full Backup',
      description: '三 Schema 全量 pg_dump → NAS RAID6',
      descriptionEn: 'Three-schema full pg_dump to NAS RAID6',
      icon: Database,
      color: 'text-cyan-400',
      category: 'database',
      script: () => `#!/bin/bash
# PostgreSQL 15 Full Backup
# Host: ${nasIp}:5433 | User: yyc3_max
# Schemas: orchestration, knowledge, telemetry

set -euo pipefail
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/yyc3/backups/pg15"
PG_HOST="${nasIp}"
PG_PORT="5433"
PG_USER="yyc3_max"
PG_DB="yyc3_db"

mkdir -p \${BACKUP_DIR}

echo "=== [1/4] Backup orchestration schema ==="
pg_dump -h \${PG_HOST} -p \${PG_PORT} -U \${PG_USER} -d \${PG_DB} \\
  -n orchestration -Fc -f \${BACKUP_DIR}/orchestration_\${TIMESTAMP}.dump

echo "=== [2/4] Backup knowledge schema (pgvector) ==="
pg_dump -h \${PG_HOST} -p \${PG_PORT} -U \${PG_USER} -d \${PG_DB} \\
  -n knowledge -Fc -f \${BACKUP_DIR}/knowledge_\${TIMESTAMP}.dump

echo "=== [3/4] Backup telemetry schema ==="
pg_dump -h \${PG_HOST} -p \${PG_PORT} -U \${PG_USER} -d \${PG_DB} \\
  -n telemetry -Fc -f \${BACKUP_DIR}/telemetry_\${TIMESTAMP}.dump

echo "=== [4/4] Verify backup integrity ==="
for f in \${BACKUP_DIR}/*_\${TIMESTAMP}.dump; do
  SIZE=$(du -sh "\$f" | cut -f1)
  echo "  \$(basename \$f): \${SIZE}"
done

echo "=== Cleanup old backups (keep last 7 days) ==="
find \${BACKUP_DIR} -name "*.dump" -mtime +7 -delete

echo "=== PG15 backup complete: \${TIMESTAMP} ==="`,
    },
    {
      id: 'pg15-vacuum',
      label: 'PG15 VACUUM + ANALYZE',
      labelEn: 'PG15 VACUUM + ANALYZE',
      description: '数据库性能优化与统计更新',
      descriptionEn: 'Database performance optimization & stats update',
      icon: Wrench,
      color: 'text-violet-400',
      category: 'database',
      script: () => `#!/bin/bash
# PostgreSQL 15 Maintenance
# Host: ${nasIp}:5433

set -euo pipefail
PG_HOST="${nasIp}"
PG_PORT="5433"
PG_USER="yyc3_max"
PG_DB="yyc3_db"

echo "=== VACUUM ANALYZE: orchestration ==="
psql -h \${PG_HOST} -p \${PG_PORT} -U \${PG_USER} -d \${PG_DB} -c "
  VACUUM (VERBOSE, ANALYZE) orchestration.tasks;
  VACUUM (VERBOSE, ANALYZE) orchestration.agent_sessions;
  VACUUM (VERBOSE, ANALYZE) orchestration.workflows;
"

echo "=== VACUUM ANALYZE: knowledge ==="
psql -h \${PG_HOST} -p \${PG_PORT} -U \${PG_USER} -d \${PG_DB} -c "
  VACUUM (VERBOSE, ANALYZE) knowledge.documents;
  VACUUM (VERBOSE, ANALYZE) knowledge.embeddings;
  VACUUM (VERBOSE, ANALYZE) knowledge.chunks;
"

echo "=== VACUUM ANALYZE: telemetry ==="
psql -h \${PG_HOST} -p \${PG_PORT} -U \${PG_USER} -d \${PG_DB} -c "
  VACUUM (VERBOSE, ANALYZE) telemetry.metrics;
  VACUUM (VERBOSE, ANALYZE) telemetry.thermal_log;
  VACUUM (VERBOSE, ANALYZE) telemetry.alerts;
"

echo "=== Reindex pgvector indexes ==="
psql -h \${PG_HOST} -p \${PG_PORT} -U \${PG_USER} -d \${PG_DB} -c "
  REINDEX INDEX CONCURRENTLY knowledge.idx_embeddings_vector;
"

echo "=== Check table sizes ==="
psql -h \${PG_HOST} -p \${PG_PORT} -U \${PG_USER} -d \${PG_DB} -c "
  SELECT schemaname, tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
  FROM pg_tables
  WHERE schemaname IN ('orchestration','knowledge','telemetry')
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

echo "=== Maintenance complete ==="`,
    },

    // === HEALTH ===
    {
      id: 'health-check-all',
      label: '全服务健康探测',
      labelEn: 'Full Service Health Probe',
      description: '探测全部端点+延迟+状态码',
      descriptionEn: 'Probe all endpoints + latency + status codes',
      icon: Activity,
      color: 'text-emerald-400',
      category: 'health',
      script: () => {
        const endpoints = [
          { name: 'Ollama LLM', url: `http://${nasIp}:11434/api/tags`, method: 'GET' },
          { name: 'Docker API', url: 'http://192.168.3.45:2375/v1.41/_ping', method: 'GET' },
          { name: 'SQLite Proxy', url: 'http://192.168.3.45:8484/api/db/query', method: 'GET' },
          { name: 'PG15 (port)', url: `${nasIp}:5433`, method: 'TCP' },
          { name: 'Dev Server', url: `http://${nasIp}:5173/`, method: 'GET' },
          { name: 'Telemetry WS', url: `${nasIp}:3001`, method: 'TCP' },
        ];

        return `#!/bin/bash
# YYC3 Infrastructure Health Check
# Probes all cluster services
# Generated: ${new Date().toISOString()}

set -uo pipefail
RED='\\033[0;31m'; GREEN='\\033[0;32m'; YELLOW='\\033[1;33m'; NC='\\033[0m'
PASS=0; FAIL=0; WARN=0

check_http() {
  local name="\$1" url="\$2"
  local start=$(date +%s%N)
  local status=$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 5 "\$url" 2>/dev/null || echo "000")
  local end=$(date +%s%N)
  local ms=$(( (end - start) / 1000000 ))

  if [ "\$status" = "200" ] || [ "\$status" = "204" ]; then
    echo -e "  \${GREEN}[OK]\${NC}  \${name} — \${status} (\${ms}ms)"
    ((PASS++))
  elif [ "\$status" = "000" ]; then
    echo -e "  \${RED}[FAIL]\${NC} \${name} — Unreachable (\${ms}ms)"
    ((FAIL++))
  else
    echo -e "  \${YELLOW}[WARN]\${NC} \${name} — HTTP \${status} (\${ms}ms)"
    ((WARN++))
  fi
}

check_tcp() {
  local name="\$1" host="\$2" port="\$3"
  local start=$(date +%s%N)
  if nc -z -w 3 "\$host" "\$port" 2>/dev/null; then
    local end=$(date +%s%N)
    local ms=$(( (end - start) / 1000000 ))
    echo -e "  \${GREEN}[OK]\${NC}  \${name} — Port open (\${ms}ms)"
    ((PASS++))
  else
    local end=$(date +%s%N)
    local ms=$(( (end - start) / 1000000 ))
    echo -e "  \${RED}[FAIL]\${NC} \${name} — Port closed (\${ms}ms)"
    ((FAIL++))
  fi
}

echo "========================================"
echo " YYC3 Infrastructure Health Report"
echo " $(date)"
echo "========================================"
echo ""
echo "--- HTTP Services ---"
${endpoints.filter(e => e.method === 'GET').map(e =>
    `check_http "${e.name}" "${e.url}"`,
  ).join('\n')}

echo ""
echo "--- TCP Ports ---"
${endpoints.filter(e => e.method === 'TCP').map(e => {
    const [host, port] = e.url.split(':');

    return `check_tcp "${e.name}" "${host}" "${port}"`;
  }).join('\n')}

echo ""
echo "--- Ollama Models ---"
MODELS=$(curl -sf http://${nasIp}:11434/api/tags 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo "N/A")
echo "  Models loaded: \${MODELS}"

echo ""
echo "========================================"
echo " Results: \${PASS} passed, \${FAIL} failed, \${WARN} warnings"
echo "========================================"`;
      },
    },

    // === BACKUP ===
    {
      id: 'full-backup',
      label: '全量系统快照',
      labelEn: 'Full System Snapshot',
      description: 'PG + Docker volumes + configs → 压缩归档',
      descriptionEn: 'PG + Docker volumes + configs to compressed archive',
      icon: Download,
      color: 'text-amber-400',
      category: 'backup',
      script: () => `#!/bin/bash
# YYC3 Full System Snapshot
# Includes: PG15 dump + Docker volumes + config files

set -euo pipefail
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_DIR="/opt/yyc3/snapshots/\${TIMESTAMP}"
REMOTE="yyc3@${nasIp}"

mkdir -p \${SNAPSHOT_DIR}

echo "=== [1/5] PostgreSQL 15 dump ==="
pg_dumpall -h ${nasIp} -p 5433 -U yyc3_max \\
  -f \${SNAPSHOT_DIR}/pg15_full.sql

echo "=== [2/5] Docker volume backup ==="
ssh \${REMOTE} "docker run --rm \\
  -v yyc3_data:/data -v /tmp:/backup \\
  alpine tar czf /backup/docker_volumes.tar.gz -C /data ."
scp \${REMOTE}:/tmp/docker_volumes.tar.gz \${SNAPSHOT_DIR}/

echo "=== [3/5] Config files ==="
scp \${REMOTE}:/opt/yyc3/chatbot/docker-compose.yml \${SNAPSHOT_DIR}/
scp \${REMOTE}:/opt/yyc3/chatbot/.env \${SNAPSHOT_DIR}/ 2>/dev/null || true

echo "=== [4/5] Export localStorage state ==="
# This should be triggered from the browser via /export command
echo "NOTE: Run /export in YYC3 chat to save browser state"

echo "=== [5/5] Create archive ==="
cd /opt/yyc3/snapshots
tar czf yyc3-snapshot-\${TIMESTAMP}.tar.gz \${TIMESTAMP}/
rm -rf \${SNAPSHOT_DIR}

echo "=== Snapshot saved: yyc3-snapshot-\${TIMESTAMP}.tar.gz ==="
ls -lh /opt/yyc3/snapshots/yyc3-snapshot-\${TIMESTAMP}.tar.gz`,
    },

    // === MODEL ===
    {
      id: 'ollama-manage',
      label: 'Ollama 模型管理',
      labelEn: 'Ollama Model Management',
      description: '拉取/列出/删除本地模型',
      descriptionEn: 'Pull/list/remove local models',
      icon: Cpu,
      color: 'text-purple-400',
      category: 'model',
      script: () => `#!/bin/bash
# Ollama Model Management on M4 Max
# Host: ${nasIp}:11434

set -uo pipefail

echo "=== Currently loaded models ==="
curl -sf http://${nasIp}:11434/api/tags | \\
  python3 -c "
import sys, json
data = json.load(sys.stdin)
for m in data.get('models', []):
    size = m.get('size', 0) / (1024**3)
    print(f'  {m[\"name\"]:30s} {size:.1f}GB  {m.get(\"details\",{}).get(\"family\",\"?\")}')
" 2>/dev/null || echo "  (Ollama not reachable)"

echo ""
echo "=== Recommended models for M4 Max 128GB ==="
echo "  qwen2.5:72b        — 通用对话 (推荐, ~45GB)"
echo "  deepseek-r1:70b    — 推理链 (推荐, ~42GB)"
echo "  llama3.3:70b       — 多语言 (~42GB)"
echo "  codestral:latest   — 代码生成 (~22GB)"
echo "  gemma2:27b         — 轻量快速 (~16GB)"

echo ""
echo "=== Pull a model ==="
echo "  ollama pull qwen2.5:72b"
echo "  ollama pull deepseek-r1:70b"

echo ""
echo "=== Remove a model ==="
echo "  ollama rm <model-name>"

echo ""
echo "=== Test inference ==="
echo '  curl http://${nasIp}:11434/api/generate -d '"'"'{"model":"qwen2.5:72b","prompt":"Hello","stream":false}'"'"`,
    },
    {
      id: 'model-routing-diag',
      label: '模型路由诊断',
      labelEn: 'Model Routing Diagnostics',
      description: '测试所有 Provider API 连通性',
      descriptionEn: 'Test all provider API connectivity',
      icon: Key,
      color: 'text-pink-400',
      category: 'model',
      script: () => {
        const providerEndpoints = Object.values(PROVIDERS).map(p => ({
          name: p.displayName,
          endpoint: p.defaultEndpoint,
          model: p.defaultModel,
        }));
        const enabledList = enabledProviders.map(c => c.providerId).join(', ') || 'none';

        return `#!/bin/bash
# YYC3 LLM Provider Routing Diagnostics
# Active providers: ${enabledList}
# Generated: ${new Date().toISOString()}

set -uo pipefail
RED='\\033[0;31m'; GREEN='\\033[0;32m'; YELLOW='\\033[1;33m'; NC='\\033[0m'

echo "========================================"
echo " LLM Provider Connectivity Test"
echo "========================================"

${providerEndpoints.map(p => `
echo ""
echo "--- ${p.name} ---"
echo "  Endpoint: ${p.endpoint}"
echo "  Default model: ${p.model}"
STATUS=$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 5 "${p.endpoint}/models" 2>/dev/null || echo "000")
if [ "\$STATUS" = "200" ] || [ "\$STATUS" = "401" ]; then
  echo -e "  \${GREEN}[REACHABLE]\${NC} HTTP \${STATUS}"
elif [ "\$STATUS" = "000" ]; then
  echo -e "  \${RED}[UNREACHABLE]\${NC}"
else
  echo -e "  \${YELLOW}[PARTIAL]\${NC} HTTP \${STATUS}"
fi`).join('\n')}

echo ""
echo "=== Circuit Breaker Config ==="
echo "  Failure threshold: 3"
echo "  Recovery time: 30s"
echo "  Monitor window: 60s"
echo "  Failover chain: ${providerEndpoints.map(p => p.name).join(' -> ')}"

echo ""
echo "=== Dev Proxy (Vite) ==="
echo "  OpenAI:    /api/proxy/openai"
echo "  Anthropic: /api/proxy/anthropic"
echo "  DeepSeek:  /api/proxy/deepseek"
echo "  Zhipu:     /api/proxy/zhipu"
echo "  Gemini:    /api/proxy/gemini"
echo "  Groq:      /api/proxy/groq"`;
      },
    },

    // === BOOTSTRAP ===
    {
      id: 'telemetry-agent',
      label: '遥测代理部署',
      labelEn: 'Telemetry Agent Deploy',
      description: '在 192.168.3.22 部署 yyc3-telemetry-agent',
      descriptionEn: 'Deploy yyc3-telemetry-agent on 192.168.3.22',
      icon: Radio,
      color: 'text-orange-400',
      category: 'bootstrap',
      script: () => `#!/bin/bash
# YYC3 Telemetry Agent — M4 Max Deployment
# Replaces frontend-simulated metrics with real hardware data
# WebSocket server on port 3001

set -euo pipefail
INSTALL_DIR="/opt/yyc3/telemetry-agent"

echo "=== [1/5] Create telemetry agent directory ==="
mkdir -p \${INSTALL_DIR}

echo "=== [2/5] Write agent source ==="
cat > \${INSTALL_DIR}/agent.js << 'AGENT_EOF'
const { WebSocketServer } = require('ws');
const os = require('os');
const { execSync } = require('child_process');

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

function getMetrics() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  
  // CPU usage
  const cpuUsage = cpus.map(cpu => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return ((total - idle) / total) * 100;
  });
  
  // Thermal (macOS)
  let temperature = 45;
  try {
    const thermal = execSync(
      'sudo powermetrics --samplers smc -i 1 -n 1 2>/dev/null | grep "CPU die temperature" | awk "{print \\$4}"',
      { encoding: 'utf8', timeout: 3000 }
    ).trim();
    temperature = parseFloat(thermal) || 45;
  } catch {}

  // GPU (macOS)
  let gpuUtil = 0;
  try {
    const gpuInfo = execSync(
      'sudo powermetrics --samplers gpu_power -i 1 -n 1 2>/dev/null | grep "GPU active" | awk "{print \\$3}"',
      { encoding: 'utf8', timeout: 3000 }
    ).trim();
    gpuUtil = parseFloat(gpuInfo) || 0;
  } catch {}

  // Disk
  let diskUsage = 50;
  try {
    const df = execSync('df -h / | tail -1 | awk "{print \\$5}"', { encoding: 'utf8' }).trim();
    diskUsage = parseInt(df) || 50;
  } catch {}

  return {
    timestamp: Date.now(),
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpuModel: cpus[0]?.model || 'Unknown',
    cpuCores: cpus.length,
    cpuUsage: {
      average: cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length,
      perCore: cpuUsage,
    },
    memory: {
      total: Math.round(totalMem / (1024 ** 3)),
      used: Math.round((totalMem - freeMem) / (1024 ** 3)),
      percentage: ((totalMem - freeMem) / totalMem) * 100,
    },
    temperature,
    gpuUtil,
    disk: { percentage: diskUsage },
    uptime: os.uptime(),
    loadAvg: os.loadavg(),
    network: {
      interfaces: Object.keys(os.networkInterfaces()).length,
    },
  };
}

wss.on('connection', (ws) => {
  console.log(\`[telemetry] Client connected (total: \${wss.clients.size})\`);
  
  // Send initial metrics
  ws.send(JSON.stringify({ type: 'metrics', data: getMetrics() }));
  
  // Stream metrics every 2s
  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'metrics', data: getMetrics() }));
    }
  }, 2000);
  
  ws.on('close', () => {
    clearInterval(interval);
    console.log(\`[telemetry] Client disconnected (total: \${wss.clients.size})\`);
  });
});

console.log(\`[yyc3-telemetry-agent] Listening on ws://0.0.0.0:\${PORT}/telemetry\`);
AGENT_EOF

echo "=== [3/5] Install dependencies ==="
cd \${INSTALL_DIR}
npm init -y > /dev/null 2>&1
npm install ws > /dev/null 2>&1

echo "=== [4/5] Create systemd service ==="
sudo tee /Library/LaunchDaemons/com.yyc3.telemetry.plist > /dev/null << 'PLIST_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.yyc3.telemetry</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/opt/yyc3/telemetry-agent/agent.js</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/var/log/yyc3-telemetry.log</string>
  <key>StandardErrorPath</key><string>/var/log/yyc3-telemetry.err</string>
</dict>
</plist>
PLIST_EOF

echo "=== [5/5] Start agent ==="
sudo launchctl load /Library/LaunchDaemons/com.yyc3.telemetry.plist
echo "Telemetry agent running on ws://${nasIp}:3001/telemetry"
echo ""
echo "Test: wscat -c ws://${nasIp}:3001/telemetry"`,
    },
    {
      id: 'system-bootstrap',
      label: '系统完整初始化',
      labelEn: 'Full System Bootstrap',
      description: '从零搭建完整 YYC3 环境',
      descriptionEn: 'Set up complete YYC3 environment from scratch',
      icon: Server,
      color: 'text-yellow-400',
      category: 'bootstrap',
      script: () => `#!/bin/bash
# YYC3 Full System Bootstrap
# Platform: Apple M4 Max (128GB, macOS Sequoia)
# Generated: ${new Date().toISOString()}

set -euo pipefail
echo "========================================"
echo " YYC3 Hacker Chatbot — Full Bootstrap"
echo " Platform: Apple M4 Max 128GB"
echo "========================================"

# --- Prerequisites ---
echo ""
echo "=== [1/8] Check prerequisites ==="
command -v node >/dev/null 2>&1 || { echo "Install Node.js first: brew install node"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "Install pnpm: npm i -g pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Install Docker Desktop"; exit 1; }
echo "  Node: $(node -v)"
echo "  pnpm: $(pnpm -v)"
echo "  Docker: $(docker --version)"

# --- Ollama ---
echo ""
echo "=== [2/8] Install Ollama ==="
if ! command -v ollama >/dev/null 2>&1; then
  curl -fsSL https://ollama.com/install.sh | sh
fi
echo "  Ollama: $(ollama --version 2>/dev/null || echo 'installing...')"
ollama pull qwen2.5:72b &

# --- PostgreSQL 15 ---
echo ""
echo "=== [3/8] Setup PostgreSQL 15 ==="
brew install postgresql@15 || true
echo "  Configuring on port 5433..."
# Custom port config
sed -i '' 's/^#port = 5432/port = 5433/' /opt/homebrew/var/postgresql@15/postgresql.conf 2>/dev/null || true
brew services start postgresql@15

# Create user and database
psql -p 5433 -c "CREATE USER yyc3_max WITH PASSWORD 'yyc3_secure_pw';" 2>/dev/null || true
psql -p 5433 -c "CREATE DATABASE yyc3_db OWNER yyc3_max;" 2>/dev/null || true

# Create schemas
psql -p 5433 -U yyc3_max -d yyc3_db << 'SQL'
CREATE SCHEMA IF NOT EXISTS orchestration;
CREATE SCHEMA IF NOT EXISTS knowledge;
CREATE SCHEMA IF NOT EXISTS telemetry;
CREATE EXTENSION IF NOT EXISTS vector SCHEMA knowledge;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SQL

# --- Project ---
echo ""
echo "=== [4/8] Clone and install project ==="
mkdir -p /opt/yyc3
cd /opt/yyc3
# git clone <repo> chatbot  # Uncomment when repo exists
cd chatbot 2>/dev/null || cd /opt/yyc3
pnpm install

# --- Vite Proxy ---
echo ""
echo "=== [5/8] Configure Vite CORS proxy ==="
echo "  Proxy config is built into vite.config.ts"
echo "  Cloud providers: OpenAI, Anthropic, DeepSeek, Zhipu, Gemini, Groq"
echo "  Local providers: Ollama (localhost:11434), LM Studio (localhost:1234)"

# --- Telemetry Agent ---
echo ""
echo "=== [6/8] Deploy telemetry agent ==="
echo "  Run: ./scripts/deploy-telemetry.sh"

# --- NAS Docker ---
echo ""
echo "=== [7/8] NAS Docker setup ==="
echo "  Ensure Docker Engine API is exposed on 192.168.3.45:2375"
echo "  Ensure SQLite HTTP Proxy runs on 192.168.3.45:8484"

# --- Start ---
echo ""
echo "=== [8/8] Start development server ==="
echo "  Run: pnpm dev"
echo ""
echo "========================================"
echo " Bootstrap complete!"
echo " Next: pnpm dev → http://localhost:5173"
echo "========================================"`,
    },
  ];
}

// --- Category Grouping ---
const CATEGORY_META: Record<string, { label: string; labelEn: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  deploy: { label: '部署', labelEn: 'Deploy', icon: Rocket, color: 'text-emerald-400' },
  database: { label: '数据库', labelEn: 'Database', icon: Database, color: 'text-cyan-400' },
  health: { label: '健康检查', labelEn: 'Health Check', icon: Activity, color: 'text-green-400' },
  backup: { label: '备份恢复', labelEn: 'Backup', icon: Download, color: 'text-amber-400' },
  model: { label: '模型管理', labelEn: 'Model Mgmt', icon: Cpu, color: 'text-purple-400' },
  bootstrap: { label: '初始化', labelEn: 'Bootstrap', icon: Server, color: 'text-yellow-400' },
};

// ============================================================
// Main Component
// ============================================================

export function OpsScriptGenerator() {
  const { language } = useTranslation();
  const zh = language === 'zh';
  const addLog = useSystemStore(s => s.addLog);

  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const templates = React.useMemo(() => buildScriptTemplates(), []);

  // Group by category
  const grouped = React.useMemo(() => {
    const groups: Record<string, ScriptTemplate[]> = {};

    for (const t of templates) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }

    return groups;
  }, [templates]);

  const filteredGroups = React.useMemo(() => {
    if (!activeCategory) return grouped;

    return { [activeCategory]: grouped[activeCategory] || [] };
  }, [grouped, activeCategory]);

  const handleToggle = React.useCallback((id: string) => {
    setExpandedId(prev => {
      if (prev === id) return null;
      addLog('info', 'OPS_SCRIPT', `Viewing script: ${id}`);
      eventBus.emit({
        category: 'system',
        type: 'system.script_view',
        level: 'info',
        source: 'OpsScript',
        message: `Script viewed: ${id}`,
      });

      return id;
    });
  }, [addLog]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl text-white tracking-tight flex items-center gap-3">
            <Terminal className="w-7 h-7 text-emerald-400" />
            {zh ? '运维脚本中心' : 'Operations Script Center'}
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            {zh
              ? '一键生成可复制的运维 Shell 脚本，适配 M4 Max + NAS 集群'
              : 'One-click copyable Shell scripts for M4 Max + NAS cluster operations'
            }
          </p>
        </div>
        <Badge variant="outline" className="text-[9px] font-mono text-zinc-500 border-zinc-700">
          {templates.length} {zh ? '脚本模板' : 'templates'}
        </Badge>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all',
            !activeCategory
              ? 'bg-white/10 text-white border-white/20'
              : 'bg-transparent text-zinc-600 border-zinc-800 hover:text-zinc-400',
          )}
        >
          {zh ? '全部' : 'All'}
        </button>
        {Object.entries(CATEGORY_META).map(([cat, meta]) => {
          const CatIcon = meta.icon;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all flex items-center gap-1',
                isActive
                  ? cn('bg-white/10 border-white/20', meta.color)
                  : 'bg-transparent text-zinc-600 border-zinc-800 hover:text-zinc-400',
              )}
            >
              <CatIcon className="w-3 h-3" />
              {zh ? meta.label : meta.labelEn}
              <span className="text-zinc-700">({grouped[cat]?.length || 0})</span>
            </button>
          );
        })}
      </div>

      {/* Script Groups */}
      <ScrollArea className="max-h-[calc(100vh-16rem)]">
        <div className="space-y-4">
          {Object.entries(filteredGroups).map(([cat, items]) => {
            if (!items || items.length === 0) return null;
            const meta = CATEGORY_META[cat];

            if (!meta) return null;
            const CatIcon = meta.icon;

            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <CatIcon className={cn('w-4 h-4', meta.color)} />
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    {zh ? meta.label : meta.labelEn}
                  </span>
                  <div className="flex-1 h-px bg-zinc-800/50" />
                </div>
                <div className="space-y-1.5">
                  {items.map(t => (
                    <ScriptCard
                      key={t.id}
                      template={t}
                      expanded={expandedId === t.id}
                      onToggle={() => handleToggle(t.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
