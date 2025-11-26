import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Triangle } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  variance: string;
  varianceLabel?: string;
  trend?: "up" | "down" | "neutral";
  chartColor?: "primary" | "purple" | "orange" | "blue";
  data?: number[];
}

export default function StatsCard({ 
  title, 
  value, 
  variance, 
  varianceLabel, 
  trend = "neutral", 
  chartColor = "primary",
  data = [40, 30, 50, 40, 60, 55, 70, 60, 80]
}: StatsCardProps) {
  
  const getColorClass = (color: string) => {
    switch(color) {
      case "primary": return "bg-primary";
      case "purple": return "bg-[#a78bfa]"; // Tailwind purple-400 equivalent
      case "orange": return "bg-[#fb923c]"; // Tailwind orange-400 equivalent
      case "blue": return "bg-[#60a5fa]";   // Tailwind blue-400 equivalent
      default: return "bg-primary";
    }
  };

  const getTextColorClass = (color: string) => {
    switch(color) {
      case "primary": return "text-primary";
      case "purple": return "text-[#a78bfa]";
      case "orange": return "text-[#fb923c]";
      case "blue": return "text-[#60a5fa]";
      default: return "text-primary";
    }
  };

  return (
    <Card className="glass-panel border-border/50 bg-card p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">Variance</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-bold flex items-center gap-1", getTextColorClass(chartColor))}>
              {variance}
              <Triangle className={cn("w-2 h-2 fill-current rotate-0", trend === "down" && "rotate-180")} />
            </span>
            <span className="text-2xl font-bold text-foreground ml-auto">{value}</span>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
             <span className="text-xs text-muted-foreground font-medium">Jan</span>
             {/* Custom Mini Bar Chart */}
             <div className="flex-1 h-2 flex items-end gap-[2px]">
               {data.map((h, i) => (
                 <div 
                   key={i} 
                   className={cn("w-full rounded-sm opacity-30 group-hover:opacity-60 transition-opacity", getColorClass(chartColor))}
                   style={{ height: `${h}%` }} 
                 />
               ))}
               {/* Last bar is active/bright */}
               <div 
                   className={cn("w-full rounded-sm", getColorClass(chartColor))}
                   style={{ height: `65%` }} 
               />
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
