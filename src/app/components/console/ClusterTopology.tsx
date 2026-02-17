import * as React from "react";
import { cn } from "@/lib/utils";
import { Laptop, Server, Smartphone, Monitor, Database, HardDrive, Cpu, Wifi, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

const DEVICES = [
  {
    id: 'mbp-m4-max',
    name: 'MacBook Pro M4 Max',
    role: 'Orchestrator (Main)',
    icon: Laptop,
    specs: { cpu: 'M4 Max (16P+40E)', ram: '128GB', storage: '4TB' },
    status: 'online',
    load: 12,
    temp: 45,
    color: 'text-amber-500',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5'
  },
  {
    id: 'imac-m4',
    name: 'iMac M4',
    role: 'Visual/Auxiliary',
    icon: Monitor,
    specs: { cpu: 'M4 (10P+10E)', ram: '32GB', storage: '2TB' },
    status: 'online',
    load: 8,
    temp: 42,
    color: 'text-blue-500',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5'
  },
  {
    id: 'nas-yyc',
    name: 'YanYuCloud NAS',
    role: 'Data Center',
    icon: Database,
    specs: { cpu: 'Intel Quad', ram: '32GB', storage: '32TB HDD + 4TB SSD' },
    status: 'active',
    load: 45,
    temp: 51,
    color: 'text-purple-500',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5'
  },
  {
    id: 'huawei-x-pro',
    name: 'MateBook X Pro',
    role: 'Edge/Test',
    icon: Laptop,
    specs: { cpu: 'Ultra7 155H', ram: '32GB', storage: '1TB' },
    status: 'standby',
    load: 2,
    temp: 35,
    color: 'text-zinc-400',
    border: 'border-zinc-500/20',
    bg: 'bg-zinc-500/5'
  }
];

export function ClusterTopology() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500">
      {DEVICES.map((dev) => (
        <div 
          key={dev.id} 
          className={cn(
            "relative overflow-hidden rounded-xl border p-4 transition-all hover:scale-[1.02]",
            "bg-zinc-900/40 hover:bg-zinc-900/60",
            dev.border
          )}
        >
          {/* Background Pulse */}
          {dev.status === 'online' && (
             <div className={cn("absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-10 animate-pulse", dev.color.replace('text', 'bg'))} />
          )}

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg border", dev.bg, dev.border)}>
                <dev.icon className={cn("w-5 h-5", dev.color)} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">{dev.name}</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{dev.role}</p>
              </div>
            </div>
            <Badge variant="outline" className={cn("text-[10px] uppercase", dev.status === 'online' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-500/10 text-zinc-500')}>
              {dev.status}
            </Badge>
          </div>

          <div className="space-y-3 relative z-10">
            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded">
                    <Cpu className="w-3 h-3 opacity-70" />
                    <span>{dev.specs.cpu}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded">
                    <Activity className="w-3 h-3 opacity-70" />
                    <span>RAM: {dev.specs.ram}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1.5 bg-black/20 p-1.5 rounded">
                    <HardDrive className="w-3 h-3 opacity-70" />
                    <span>{dev.specs.storage}</span>
                </div>
            </div>

            {/* Live Metrics */}
            <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between items-center mb-1 text-[10px] text-zinc-500">
                    <span>System Load</span>
                    <span className={dev.color}>{dev.load}%</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className={cn("h-full transition-all duration-1000", dev.color.replace('text', 'bg'))} 
                        style={{ width: `${dev.load}%` }}
                    />
                </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
