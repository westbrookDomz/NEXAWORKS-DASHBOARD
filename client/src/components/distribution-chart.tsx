import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "@/components/ui/card";

const data = [
  { name: "Brand Identity", value: 45, color: "hsl(170 100% 45%)" }, // Primary Cyan
  { name: "Web Design", value: 30, color: "hsl(260 100% 70%)" },    // Purple
  { name: "Social Media", value: 15, color: "hsl(30 100% 60%)" },     // Orange
  { name: "Consulting", value: 10, color: "hsl(210 100% 60%)" },    // Blue
];

export default function DistributionChart() {
  return (
    <div className="h-[420px] w-full border border-white/5 rounded-2xl p-6 bg-card/30 relative flex flex-col">
      <h3 className="text-lg font-medium text-muted-foreground mb-4">Revenue Distribution</h3>
      
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="stroke-background stroke-2"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                color: "hsl(var(--foreground))"
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend 
              verticalAlign="middle" 
              align="right"
              layout="vertical"
              iconType="circle"
              iconSize={8}
              formatter={(value, entry: any) => (
                <span className="text-sm text-muted-foreground ml-2">{value}</span>
              )}
              wrapperStyle={{ paddingLeft: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[100px]">
          <span className="text-3xl font-bold text-foreground">100%</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
        </div>
      </div>
    </div>
  );
}
