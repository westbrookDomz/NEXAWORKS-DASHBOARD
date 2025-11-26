import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart, ComposedChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
  { name: "week 1", val1: 20, val2: 30, val3: 40 },
  { name: "", val1: 35, val2: 45, val3: 30 },
  { name: "", val1: 25, val2: 40, val3: 35 },
  { name: "", val1: 45, val2: 55, val3: 50 },
  { name: "week 2", val1: 55, val2: 40, val3: 60 },
  { name: "", val1: 60, val2: 50, val3: 65 },
  { name: "", val1: 50, val2: 65, val3: 55 },
  { name: "", val1: 70, val2: 75, val3: 70 },
  { name: "week 3", val1: 65, val2: 80, val3: 75 },
  { name: "", val1: 80, val2: 70, val3: 85 },
  { name: "", val1: 75, val2: 90, val3: 80 },
  { name: "", val1: 85, val2: 85, val3: 90 },
  { name: "week 4", val1: 90, val2: 95, val3: 95 },
  { name: "", val1: 100, val2: 90, val3: 100 },
];

export default function RevenueChart() {
  return (
    <div className="h-full w-full min-h-[300px] relative">
      <div className="flex justify-between mb-6 px-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">
         <span>week 1</span>
         <span>week 2</span>
         <span>week 3</span>
         <span>week 4</span>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={true} horizontal={true} opacity={0.3} />
          
          {/* Hidden Axis for layout */}
          <XAxis dataKey="name" hide />
          <YAxis hide domain={[0, 110]} />
          
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
            itemStyle={{ color: "hsl(var(--primary))" }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
          />

          {/* Background Lines */}
          <Line type="monotone" dataKey="val2" stroke="hsl(260 100% 70%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(260 100% 70%)", strokeWidth: 0 }} strokeOpacity={0.5} />
          <Line type="monotone" dataKey="val3" stroke="hsl(30 100% 60%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(30 100% 60%)", strokeWidth: 0 }} strokeOpacity={0.5} />

          {/* Main Line */}
          <Area
            type="monotone"
            dataKey="val1"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="url(#colorGradient)"
          />
          <Line 
            type="monotone" 
            dataKey="val1" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3} 
            dot={{ r: 4, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2 }} 
          />
          
          {/* Floating Stats Overlay (Simulated) */}
          <g transform="translate(300, 200)">
             {/* This would typically be a custom HTML overlay, but for recharts pure SVG, we can't easily put complex HTML inside without foreignObject which has issues. 
                 Instead, we'll let the stats block below the chart handle detailed info.
             */}
          </g>
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Floating Legend/Info Box positioned absolutely */}
      <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-md border border-border p-3 rounded-lg shadow-lg">
         <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span>$1.3 M</span>
            <span className="text-green-400">▲ 10%</span>
         </div>
         <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span>2.3M</span>
            <span className="text-green-400">▲ 1.9 M</span>
         </div>
      </div>
    </div>
  );
}
