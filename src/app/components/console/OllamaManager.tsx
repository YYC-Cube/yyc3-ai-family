// ============================================================
// YYC3 Hacker Chatbot — Ollama Local LLM Manager
// Phase 23: Local Model Discovery & Management
// ============================================================

import {
  Cpu, RefreshCw, Wifi, WifiOff, Download, Trash2,
  HardDrive, Zap, Settings, Play,
  Loader2, AlertTriangle, Server, MemoryStick, Clock,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import type { OllamaModelInfo } from '@/lib/types';
import { useOllamaDiscovery } from '@/lib/useOllamaDiscovery';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
}

export function OllamaManager() {
  const {
    status, models, runningModels, config, error,
    refresh, updateConfig, pullModel, deleteModel, generate,
  } = useOllamaDiscovery();

  const [pullInput, setPullInput] = React.useState('');
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullStatus, setPullStatus] = React.useState('');
  const [testModel, setTestModel] = React.useState<string | null>(null);
  const [testOutput, setTestOutput] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [endpointInput, setEndpointInput] = React.useState(config.endpoint);

  // Connection status styling
  const statusConfig = {
    connected: { icon: Wifi, label: 'CONNECTED', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    disconnected: { icon: WifiOff, label: 'DISCONNECTED', color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
    checking: { icon: Loader2, label: 'CHECKING...', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    error: { icon: AlertTriangle, label: 'ERROR', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  }[status];

  const StatusIcon = statusConfig.icon;

  // Pull handler
  const handlePull = async () => {
    if (!pullInput.trim()) return;
    setIsPulling(true);
    setPullStatus(`Pulling ${pullInput}...`);
    const ok = await pullModel(pullInput.trim());

    setPullStatus(ok ? `${pullInput} pulled successfully!` : `Failed to pull ${pullInput}`);
    setIsPulling(false);
    if (ok) {
      setPullInput('');
      refresh();
    }
  };

  // Quick test handler
  const handleTest = async (modelName: string) => {
    setTestModel(modelName);
    setTestOutput('');
    setIsGenerating(true);
    try {
      await generate(modelName, 'Say "Hello, YYC3!" in a cyberpunk style. Keep it under 50 words.', chunk => {
        setTestOutput(prev => prev + chunk);
      });
    } catch (err) {
      setTestOutput(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
    setIsGenerating(false);
  };

  // Delete handler
  const handleDelete = async (modelName: string) => {
    if (!window.confirm(`Delete model "${modelName}"? This cannot be undone.`)) return;
    await deleteModel(modelName);
    refresh();
  };

  // Save endpoint
  const handleSaveEndpoint = () => {
    updateConfig({ endpoint: endpointInput });
    setShowSettings(false);
    setTimeout(refresh, 200);
  };

  // Check if model is running
  const isRunning = (name: string) => runningModels.some(m => m.name === name || m.model === name);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-7 h-7 text-white" />
            Ollama 本地模型管理
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Auto-discover, manage, and test local LLM models</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn('font-mono text-[10px] border px-3 py-1 flex items-center gap-1.5', statusConfig.color, statusConfig.bg, statusConfig.border)}>
            <StatusIcon className={cn('w-3 h-3', status === 'checking' && 'animate-spin')} />
            {statusConfig.label}
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5 border-white/10" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Config</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-white/10" onClick={refresh} disabled={status === 'checking'}>
            <RefreshCw className={cn('w-3.5 h-3.5', status === 'checking' && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="bg-zinc-900/60 border-white/10 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-400 font-mono w-20 shrink-0">Endpoint</label>
              <Input
                value={endpointInput}
                onChange={e => setEndpointInput(e.target.value)}
                className="bg-black/40 border-white/10 font-mono text-xs h-8"
                placeholder="http://localhost:11434"
              />
              <Button size="sm" variant="outline" className="border-primary/30 text-primary shrink-0" onClick={handleSaveEndpoint}>
                Save
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoDiscover}
                  onChange={e => updateConfig({ autoDiscover: e.target.checked })}
                  className="accent-primary"
                />
                Auto-discover
              </label>
              <label className="flex items-center gap-2">
                <span>Poll interval:</span>
                <select
                  value={config.pollInterval}
                  onChange={e => updateConfig({ pollInterval: Number(e.target.value) })}
                  className="bg-black/60 border border-white/10 rounded px-2 py-0.5 text-xs"
                >
                  <option value={0}>Off</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>60s</option>
                </select>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Server} label="Endpoint" value={config.endpoint.replace('http://', '')} color="text-white" />
        <SummaryCard icon={HardDrive} label="Local Models" value={`${models.length}`} color="text-blue-400" />
        <SummaryCard icon={Zap} label="Running" value={`${runningModels.length}`} color="text-green-400" />
        <SummaryCard icon={MemoryStick} label="Total Size" value={formatBytes(models.reduce((s, m) => s + m.size, 0))} color="text-amber-400" />
      </div>

      {/* Pull Model */}
      <Card className="bg-zinc-900/40 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            Pull New Model
          </CardTitle>
          <CardDescription className="text-xs">Download a model from the Ollama registry. Example: qwen2.5:7b, llama3.2:3b, codestral:latest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={pullInput}
              onChange={e => setPullInput(e.target.value)}
              placeholder="Model name (e.g., qwen2.5:7b)"
              className="bg-black/40 border-white/10 font-mono text-xs"
              onKeyDown={e => e.key === 'Enter' && handlePull()}
              disabled={isPulling || status !== 'connected'}
            />
            <Button
              onClick={handlePull}
              disabled={isPulling || !pullInput.trim() || status !== 'connected'}
              className="gap-2 bg-primary shrink-0"
              size="sm"
            >
              {isPulling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Pull
            </Button>
          </div>
          {pullStatus && (
            <p className={cn('text-xs font-mono mt-2', pullStatus.includes('success') ? 'text-green-400' : pullStatus.includes('Failed') ? 'text-red-400' : 'text-amber-400')}>
              {pullStatus}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Model List */}
      <Card className="bg-zinc-900/40 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-400" />
            Discovered Models ({models.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {models.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm font-mono">
              {status === 'connected' ? 'No models found. Pull a model to get started.' : 'Connect to Ollama to discover models.'}
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="divide-y divide-white/5">
                {models.map(model => (
                  <ModelRow
                    key={model.name}
                    model={model}
                    running={isRunning(model.name)}
                    testing={testModel === model.name && isGenerating}
                    onTest={() => handleTest(model.name)}
                    onDelete={() => handleDelete(model.name)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Test Output */}
      {testModel && testOutput && (
        <Card className="bg-zinc-900/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Play className="w-4 h-4 text-green-400" />
              Test Output: <span className="text-primary font-mono">{testModel}</span>
              {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono text-zinc-300 bg-black/40 rounded-lg p-4 whitespace-pre-wrap max-h-48 overflow-auto">
              {testOutput}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Running Models */}
      {runningModels.length > 0 && (
        <Card className="bg-zinc-900/40 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              Currently Loaded in VRAM ({runningModels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {runningModels.map(rm => (
                <div key={rm.digest} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-xs text-green-400">{rm.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
                    <span>VRAM: {formatBytes(rm.size_vram)}</span>
                    <span>Size: {formatBytes(rm.size)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(rm.expires_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Sub-components ---

function SummaryCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="bg-zinc-900/40 border-white/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn('w-4 h-4', color)} />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">{label}</span>
        </div>
        <div className={cn('text-lg font-mono', color)}>{value}</div>
      </CardContent>
    </Card>
  );
}

function ModelRow({ model, running, testing, onTest, onDelete }: {
  model: OllamaModelInfo;
  running: boolean;
  testing: boolean;
  onTest: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono border shrink-0',
          running ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-zinc-800/60 border-white/5 text-zinc-400',
        )}>
          {running ? <Zap className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-200 font-mono truncate">{model.name}</span>
            {running && (
              <Badge variant="outline" className="text-[8px] border-green-500/20 text-green-500 px-1.5 py-0">LOADED</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-mono mt-0.5">
            <span>{model.details.parameter_size}</span>
            <span>{model.details.quantization_level}</span>
            <span>{model.details.family}</span>
            <span>{formatBytes(model.size)}</span>
            <span>{formatDate(model.modified_at)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
          onClick={onTest}
          disabled={testing}
        >
          {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          <span className="ml-1">Test</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/10"
          onClick={onDelete}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}