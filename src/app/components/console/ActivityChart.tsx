import * as React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

interface DataPoint {
  time: number;
  value: number;
}

export function ActivityChart({ 
  color = "#8b5cf6", 
  height = "100%", 
  label = "Neural Load" 
}: { 
  color?: string; 
  height?: string | number;
  label?: string;
}) {
  const [data, setData] = React.useState<DataPoint[]>([]);

  React.useEffect(() => {
    // Generate initial data
    const initialData: DataPoint[] = [];
    for (let i = 0; i < 20; i++) {
      initialData.push({ time: i, value: 20 + Math.random() * 30 });
    }
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const lastTime = prev[prev.length - 1].time;
        const newValue = Math.max(10, Math.min(90, prev[prev.length - 1].value + (Math.random() - 0.5) * 20));
        
        const newEntry: DataPoint = { time: lastTime + 1, value: newValue };
        return [...prev.slice(1), newEntry];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
       <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">{label}</span>
          <span className="text-xs font-mono font-bold" style={{ color }}>
            {data.length > 0 ? Math.round(data[data.length - 1].value) : 0}%
          </span>
       </div>
       <div style={{ height: typeof height === 'number' ? height - 20 : 'calc(100% - 20px)' }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
            <defs>
                <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <Tooltip 
                contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }}
                itemStyle={{ color: color }}
                labelStyle={{ display: 'none' }}
            />
            <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#gradient-${label})`} 
                isAnimationActive={false} // Disable internal animation for smoother real-time updates
            />
            </AreaChart>
        </ResponsiveContainer>
       </div>
    </div>
  );
}