import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Save, RotateCcw, Shield, Cpu, Monitor, Wifi, 
  Terminal, Eye, Volume2, Lock, FileText, Server
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";

export function SettingsView() {
  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Mock Config State based on user provided ENV
  const [config, setConfig] = React.useState({
    local_chip: "Apple-M4-Max",
    local_ram: "128GB",
    nas_name: "YanYuCloud",
    nas_raid: "RAID6_HDD=4x8T",
    auth_level: "Level 5 (Architect)",
    debug_mode: true,
    holographic_ui: true,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setIsDirty(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">System Configuration</h2>
           <p className="text-zinc-500">L09 Global Environment Variables</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="border-white/10 text-zinc-400 hover:text-white" onClick={() => setIsDirty(false)} disabled={!isDirty}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
           </Button>
           <Button 
              className={cn("bg-primary hover:bg-primary/90 text-primary-foreground", saving && "animate-pulse")}
              onClick={handleSave}
              disabled={!isDirty && !saving}
           >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Writing to ROM..." : "Commit Changes"}
           </Button>
        </div>
      </div>

      <Tabs defaultValue="cluster" className="space-y-6">
        <TabsList className="bg-zinc-900/50 border border-white/5 p-1 h-auto">
           <TabsTrigger value="cluster" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Server className="w-4 h-4 mr-2" />
              Cluster Map
           </TabsTrigger>
           <TabsTrigger value="interface" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              Interface
           </TabsTrigger>
           <TabsTrigger value="security" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Security
           </TabsTrigger>
        </TabsList>

        {/* CLUSTER CONFIG */}
        <TabsContent value="cluster" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Node */}
              <Card className="bg-zinc-900/40 border-white/5">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                       <Cpu className="w-4 h-4 text-amber-500" />
                       Primary Node (Orchestrator)
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-zinc-400 text-xs uppercase">Chip Architecture</Label>
                       <div className="flex gap-2">
                          <Input 
                            value={config.local_chip} 
                            onChange={(e) => { setConfig({...config, local_chip: e.target.value}); setIsDirty(true); }}
                            className="bg-black/50 border-white/10 font-mono text-amber-500" 
                          />
                          <Badge variant="outline" className="border-amber-500/20 text-amber-500">ARM64</Badge>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-zinc-400 text-xs uppercase">Memory Allocation</Label>
                       <Input 
                            value={config.local_ram} 
                            onChange={(e) => { setConfig({...config, local_ram: e.target.value}); setIsDirty(true); }}
                            className="bg-black/50 border-white/10 font-mono" 
                       />
                    </div>
                 </CardContent>
              </Card>

              {/* Storage Node */}
              <Card className="bg-zinc-900/40 border-white/5">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                       <DatabaseIcon className="w-4 h-4 text-purple-500" />
                       Persistence Layer (NAS)
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-zinc-400 text-xs uppercase">Hostname</Label>
                       <Input 
                            value={config.nas_name} 
                            onChange={(e) => { setConfig({...config, nas_name: e.target.value}); setIsDirty(true); }}
                            className="bg-black/50 border-white/10 font-mono text-purple-500" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-zinc-400 text-xs uppercase">RAID Configuration</Label>
                       <Input 
                            value={config.nas_raid} 
                            onChange={(e) => { setConfig({...config, nas_raid: e.target.value}); setIsDirty(true); }}
                            className="bg-black/50 border-white/10 font-mono" 
                       />
                    </div>
                 </CardContent>
              </Card>
           </div>
           
           {/* Raw Config Editor */}
           <Card className="bg-zinc-900/40 border-white/5 mt-4">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    Raw Environment Variables (.env)
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <textarea 
                    className="w-full h-48 bg-black/50 border border-white/10 rounded-md p-4 font-mono text-xs text-zinc-300 focus:outline-none focus:border-primary/50 resize-none"
                    defaultValue={`# ===== YYC³ 环境变量配置 =====
# 最后更新时间: 2026-02-09

LOCAL_MBP_CHIP=Apple-M4-Max
LOCAL_MBP_CORES=16P+40E
LOCAL_MBP_RAM=128GB
LOCAL_IMAC_CHIP=Apple-M4
NAS_NAME=YanYuCloud
NAS_RAM=32GB
Volume1=RAID6_HDD=4x8T-WD-HA340`}
                    onChange={() => setIsDirty(true)}
                 />
              </CardContent>
           </Card>
        </TabsContent>

        {/* INTERFACE SETTINGS */}
        <TabsContent value="interface" className="space-y-4">
            <Card className="bg-zinc-900/40 border-white/5">
                <CardHeader>
                    <CardTitle className="text-base">Visuals & Haptics</CardTitle>
                    <CardDescription>Customize your neural link experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base text-zinc-200">Holographic UI</Label>
                            <p className="text-xs text-zinc-500">Enable 3D transforms and depth effects</p>
                        </div>
                        <Switch checked={config.holographic_ui} onCheckedChange={(c) => { setConfig({...config, holographic_ui: c}); setIsDirty(true); }} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base text-zinc-200">System Sounds</Label>
                            <p className="text-xs text-zinc-500">Play feedback sounds on interaction</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base text-zinc-200">Reduced Motion</Label>
                            <p className="text-xs text-zinc-500">Simplify animations for faster response</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* SECURITY SETTINGS */}
        <TabsContent value="security" className="space-y-4">
             <Card className="bg-red-900/10 border-red-500/20">
                <CardHeader>
                    <CardTitle className="text-base text-red-400 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Access Control
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase">Current Clearance</Label>
                            <Input value={config.auth_level} disabled className="bg-black/50 border-red-500/20 text-red-400" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase">Encryption Key</Label>
                            <Input type="password" value="******************" disabled className="bg-black/50 border-red-500/20 text-red-400" />
                         </div>
                     </div>
                     <div className="pt-4 border-t border-red-500/20">
                        <Button variant="destructive" className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50">
                            Initiate Lockdown Protocol
                        </Button>
                     </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Icon helper
function DatabaseIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
    )
}
