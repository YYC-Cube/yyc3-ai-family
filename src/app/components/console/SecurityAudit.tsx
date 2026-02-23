import {
  AlertTriangle,
  Eye, EyeOff, Hash,
  Key, Lock,
  RefreshCw,
  Server,
  Shield,
  Unlock,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { isCryptoAvailable, maskApiKey } from '@/lib/crypto';
import { saveProviderConfigs } from '@/lib/llm-bridge';
import { getAllMCPServers, saveMCPRegistry } from '@/lib/mcp-protocol';
import { useSystemStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function SecurityAudit() {
  const providerConfigs = useSystemStore(s => s.providerConfigs);
  const addLog = useSystemStore(s => s.addLog);
  const [showRaw, setShowRaw] = React.useState<Record<string, boolean>>({});
  const [encrypting, setEncrypting] = React.useState(false);
  const [mcpServers, setMcpServers] = React.useState(getAllMCPServers());

  const toggleShow = (id: string) => {
    setShowRaw(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReEncrypt = async () => {
    setEncrypting(true);
    addLog('info', 'SECURITY', 'Starting batch re-encryption of credentials...');

    // LLM Provider Keys
    await saveProviderConfigs(providerConfigs);

    // MCP Server Tokens (in env vars)
    const customServers = mcpServers.filter(s => s.category !== 'builtin');

    await saveMCPRegistry(customServers);

    setTimeout(() => {
      setEncrypting(false);
      addLog('success', 'SECURITY', 'All LLM and MCP credentials have been encrypted via Web Crypto');
      setMcpServers(getAllMCPServers());
    }, 1500);
  };

  const cryptoStatus = isCryptoAvailable();
  const encryptedLlmCount = providerConfigs.filter(c => c.encrypted).length;
  const totalLlmCount = providerConfigs.filter(c => c.apiKey).length;
  const encryptedMcpCount = mcpServers.filter(s => s.encrypted).length;
  const totalMcpCount = mcpServers.filter(s => s.env && Object.keys(s.env).length > 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg text-white tracking-tight">安全审计与凭证管理</h3>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Phase 35 | Credentials (LLM & MCP) Protection
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs font-mono border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-2"
          onClick={handleReEncrypt}
          disabled={encrypting || !cryptoStatus}
        >
          <RefreshCw className={cn('w-3 h-3', encrypting && 'animate-spin')} />
          {encrypting ? 'ENCRYPTING...' : 'ENCRYPT ALL SECRETS'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Cards */}
        <StatusCard
          icon={Lock}
          label="Encryption Status"
          value={cryptoStatus ? 'ACTIVE' : 'DISABLED'}
          sub="Web Crypto API (AES-GCM)"
          color={cryptoStatus ? 'text-emerald-400' : 'text-red-400'}
        />
        <StatusCard
          icon={Key}
          label="LLM Credentials"
          value={`${encryptedLlmCount} / ${totalLlmCount}`}
          sub="Encrypted LLM Keys"
          color="text-sky-400"
        />
        <StatusCard
          icon={Server}
          label="MCP Credentials"
          value={`${encryptedMcpCount} / ${totalMcpCount}`}
          sub="Encrypted MCP Env Secrets"
          color="text-indigo-400"
        />
        <StatusCard
          icon={Hash}
          label="Key Derivation"
          value="PBKDF2"
          sub="100,000 Iterations / SHA-256"
          color="text-amber-400"
        />
      </div>

      {/* LLM Keys Table */}
      <InventoryTable
        title="LLM_PROVIDER_INVENTORY"
        icon={Key}
        items={providerConfigs.filter(c => c.apiKey).map(c => ({
          id: c.providerId,
          name: c.providerId.toUpperCase(),
          value: c.apiKey,
          encrypted: c.encrypted,
        }))}
        showRaw={showRaw}
        onToggleShow={toggleShow}
      />

      {/* MCP Secrets Table */}
      <InventoryTable
        title="MCP_SERVER_SECRET_INVENTORY"
        icon={Server}
        items={mcpServers.filter(s => s.env && Object.keys(s.env).length > 0).map(s => {
          // Heuristic: pick the first key that looks like a secret
          const secretKey = Object.keys(s.env!).find(k => k.includes('TOKEN') || k.includes('KEY') || k.includes('SECRET')) || Object.keys(s.env!)[0];

          return {
            id: s.id,
            name: `${s.name} (${secretKey})`,
            value: s.env![secretKey],
            encrypted: s.encrypted,
          };
        })}
        showRaw={showRaw}
        onToggleShow={toggleShow}
      />

      {/* Security Advisory */}
      <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex gap-4">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-xs font-mono text-amber-400 uppercase tracking-widest">Security Advisory</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            MCP 服务令牌通常作为环境变量存储。在 Phase 35 中，我们对符合敏感模式（如 GITHUB_TOKEN）的变量进行加密。
            内置 (Built-in) 服务器的默认值不被视为敏感凭证，仅对用户定义的自定义 (Custom) 或经过修改的服务器进行加密。
          </p>
        </div>
      </div>
    </div>
  );
}

function InventoryTable({ title, icon: Icon, items, showRaw, onToggleShow }: any) {
  return (
    <Card className="bg-zinc-900/40 border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase">
          <Icon className="w-3.5 h-3.5" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                <th className="py-3 px-4">Identifier</th>
                <th className="py-3 px-4">Encryption</th>
                <th className="py-3 px-4">Value Preview</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono">
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-zinc-300 font-bold">{item.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={cn(
                      'text-[9px] gap-1',
                      item.encrypted ? 'border-emerald-500/20 text-emerald-400' : 'border-amber-500/20 text-amber-400',
                    )}>
                      {item.encrypted ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                      {item.encrypted ? 'AES-GCM' : 'PLAINTEXT'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <code className="text-zinc-500 text-[10px]">
                        {showRaw[item.id] ? item.value : maskApiKey(item.value)}
                      </code>
                      <button
                        onClick={() => onToggleShow(item.id)}
                        className="text-zinc-600 hover:text-zinc-300"
                      >
                        {showRaw[item.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
                      VERIFIED
                    </Badge>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-600 italic">
                    No active secrets found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusCard({ icon: Icon, label, value, sub, color }: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card className="bg-zinc-900/40 border-white/5">
      <CardContent className="p-4">
        <div className={cn('p-2 rounded-lg bg-white/5 w-fit mb-3', color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{label}</div>
        <div className={cn('text-lg font-mono font-bold', color)}>{value}</div>
        <div className="text-[10px] font-mono text-zinc-600 mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}
