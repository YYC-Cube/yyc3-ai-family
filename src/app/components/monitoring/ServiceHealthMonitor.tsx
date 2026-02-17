import * as React from "react";
import { cn } from "@/lib/utils";
import { Activity, Server, Database, Shield, Zap, Wifi, Lock, TrendingUp, AlertCircle, Fingerprint } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Badge } from "@/app/components/ui/badge";
import { useSystemStore } from "@/lib/store";

// --- Type Definitions ---

type ServiceStatus = 'HEALTHY' | 'SECURE' | 'OPTIMIZED' | 'ENCRYPTED' | 'CLEAN' | 'DEGRADED';

interface HealthMetrics {
  uptime: number;
  latency: number;
  requests: number;
  errors: number;
  podCount: number;
  securityScore: number;
}

interface MetricBoxProps {
  label: string;
  value: string;
  color: string;
}

interface ServiceCardProps {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: ServiceStatus;
  details: string[];
  borderColor?: string;
  textColor?: string;
}

interface LogEntryProps {
  time: string;
  msg: string;
  type?: 'warn' | 'info';
}

export function ServiceHealthMonitor() {
  const { t } = useTranslation();
  const isMobile = useSystemStore((s) => s.isMobile);

  const [metrics, setMetrics] = React.useState<HealthMetrics>({
    uptime: 99.99,
    latency: 24,
    requests: 1240,
    errors: 0,
    podCount: 3, // Initial scalable pods
    securityScore: 100
  });
  
  const [scalingEvent, setScalingEvent] = React.useState<string | null>(null);

  // Simulation effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        // Simulating Scale Out Event
        const newReq = prev.requests + Math.floor(Math.random() * 50);
        let newPods = prev.podCount;
        let event = null;

        if (newReq > 2000 && prev.podCount < 10) {
            newPods = Math.min(prev.podCount + 1, 10);
            event = `High Load Detected (${newReq} rps). Scaling out to ${newPods} pods.`;
        } else if (newReq < 800 && prev.podCount > 2) {
            newPods = Math.max(prev.podCount - 1, 2);
            event = `Load Normalized. Scaling down to ${newPods} pods.`;
        }

        if (event) setScalingEvent(event);
        setTimeout(() => setScalingEvent(null), 3000);

        return {
            uptime: 99.99,
            latency: 20 + Math.floor(Math.random() * 15),
            requests: newReq > 2500 ? 1000 : newReq, // Reset loop
            errors: Math.random() > 0.98 ? prev.errors + 1 : prev.errors,
            podCount: newPods,
            securityScore: 98 // Static high score
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 w-full bg-[#050505] text-foreground font-mono p-3 md:p-6 overflow-hidden flex flex-col relative animate-in fade-in duration-500">
       <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-[5] bg-[length:100%_2px,3px_100%]"></div>
       
       <div className="flex items-center justify-between mb-4 md:mb-8 border-b border-border/50 pb-3 md:pb-4 flex-wrap gap-3">
         <div>
           <h2 className="text-base md:text-xl tracking-wider text-primary flex items-center gap-2">
             <Activity className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
             SYSTEM_HEALTH_MONITOR
           </h2>
           <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Real-time infrastructure telemetry</p>
         </div>
         <div className={cn("flex gap-3 md:gap-4 text-xs", isMobile && "w-full justify-between")}>
            <MetricBox label="UPTIME" value={`${metrics.uptime}%`} color="text-green-400" />
            <MetricBox label="LATENCY" value={`${metrics.latency}ms`} color={metrics.latency > 30 ? "text-yellow-400" : "text-green-400"} />
            <MetricBox label="REQ/SEC" value={metrics.requests.toString()} color="text-blue-400" />
            {!isMobile && <MetricBox label="SEC_SCORE" value={`${metrics.securityScore}/100`} color="text-purple-400" />}
         </div>
       </div>

       <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
             {/* Scalability Section */}
             <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      AUTO_SCALING_GROUP (ASG-Primary)
                   </h3>
                   <Badge variant="outline" className="text-xs font-mono text-primary border-primary/50">
                      {metrics.podCount} PODS ACTIVE
                   </Badge>
                </div>
                <div className="h-24 border border-dashed border-border/50 bg-muted/5 rounded-lg p-4 flex items-center gap-2 overflow-x-auto relative">
                   {Array.from({ length: metrics.podCount }).map((_, i) => (
                      <div key={i} className="min-w-[80px] h-16 bg-primary/10 border border-primary/30 rounded flex flex-col items-center justify-center animate-in zoom-in-90 duration-300">
                         <Server className="w-5 h-5 text-primary mb-1" />
                         <span className="text-[9px] text-primary/80">POD-{i+1}</span>
                      </div>
                   ))}
                   {/* Ghost Pod for visualization */}
                   <div className="min-w-[80px] h-16 border border-dashed border-muted-foreground/20 rounded flex flex-col items-center justify-center opacity-50">
                      <span className="text-[9px] text-muted-foreground">Auto-Scale</span>
                   </div>
                   
                   {scalingEvent && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded shadow-lg animate-in slide-in-from-right-10 fade-out duration-3000">
                         {scalingEvent}
                      </div>
                   )}
                </div>
             </div>

             {/* Security Section */}
             <ServiceCard 
               name="Identity & Access" 
               icon={Fingerprint} 
               status="SECURE" 
               details={["MFA: Enforced", "Session: Valid (JWT)", "RBAC: Active"]}
               borderColor="border-purple-500/30"
               textColor="text-purple-400"
             />
             <ServiceCard 
               name="Data Encryption" 
               icon={Lock} 
               status="ENCRYPTED" 
               details={["At-Rest: AES-256", "In-Transit: TLS 1.3", "Keys: Rotated"]}
               borderColor="border-purple-500/30"
               textColor="text-purple-400"
             />
              <ServiceCard 
               name="Vulnerability Scanner" 
               icon={AlertCircle} 
               status="CLEAN" 
               details={["CVEs Found: 0", "Last Scan: 2m ago", "Coverage: 100%"]}
               borderColor="border-green-500/30"
               textColor="text-green-400"
             />

             {/* Standard Services */}
             <ServiceCard 
               name="API Gateway" 
               icon={Server} 
               status="HEALTHY" 
               details={["Rate Limit: OK", "Circuit Breaker: Closed"]}
             />
             <ServiceCard 
               name="Database Shards" 
               icon={Database} 
               status="HEALTHY" 
               details={["Sharding: Key-Based", "Replication: Async"]}
             />
             <ServiceCard 
               name="CDN Edge" 
               icon={Wifi} 
               status="OPTIMIZED" 
               details={["Cache: 95%", "Latency: 12ms"]}
             />
          </div>

          <div className="mt-8 p-6 border border-border/50 rounded-lg bg-muted/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
             <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
               <Zap className="w-4 h-4 text-yellow-400" />
               SYSTEM_EVENT_LOG
             </h3>
             <div className="space-y-2 text-xs text-muted-foreground font-mono">
               <LogEntry time="10:43:22" msg="[SECURITY] Blocked suspicious SQL injection attempt from IP 192.168.x.x" type="warn" />
               <LogEntry time="10:43:10" msg="[SCALE] Auto-scaling trigger: CPU utilization > 75%." />
               <LogEntry time="10:42:01" msg="[HA] Detected high latency on Node-02. Traffic rerouted." />
               <LogEntry time="10:41:45" msg="[PERF] Cache warming completed. Hit rate 95%." />
             </div>
          </div>
       </ScrollArea>
    </div>
  );
}

function MetricBox({ label, value, color }: MetricBoxProps) {
  return (
    <div className="text-right">
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className={cn("text-lg font-bold font-mono", color)}>{value}</div>
    </div>
  )
}

function ServiceCard({ name, icon: Icon, status, details, borderColor, textColor }: ServiceCardProps) {
  return (
    <div className={cn(
        "p-4 rounded-lg border bg-card/30 hover:bg-card/50 transition-all hover:-translate-y-1 group",
        borderColor || "border-border"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
              "w-10 h-10 rounded flex items-center justify-center transition-colors",
              textColor ? "bg-background border border-current" : "bg-primary/10 group-hover:bg-primary/20"
          )}>
            <Icon className={cn("w-5 h-5", textColor || "text-primary")} />
          </div>
          <div>
            <h4 className="font-bold text-sm">{name}</h4>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded border",
              status === 'HEALTHY' || status === 'SECURE' || status === 'OPTIMIZED' || status === 'ENCRYPTED' || status === 'CLEAN' 
                ? "border-green-500/30 text-green-400 bg-green-500/10" 
                : "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
            )}>{status}</span>
          </div>
        </div>
        <div className="flex gap-1">
           <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", textColor ? textColor.replace('text-', 'bg-') : "bg-green-500")}></div>
        </div>
      </div>
      <div className="space-y-1.5">
        {details.map((detail: string, i: number) => (
          <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span className="w-1 h-1 rounded-full bg-border"></span>
            {detail}
          </div>
        ))}
      </div>
    </div>
  )
}

function LogEntry({ time, msg, type }: LogEntryProps) {
  return (
    <div className={cn(
        "flex gap-4 border-l border-border/30 pl-3 hover:bg-white/5 py-1",
        type === 'warn' && "border-red-500/50 text-red-300"
    )}>
      <span className="text-primary/70">{time}</span>
      <span>{msg}</span>
    </div>
  )
}