import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  variance: string;
  trend?: "up" | "down" | "neutral";
  subtext?: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ 
  title, 
  value, 
  variance, 
  trend = "up", 
  subtext = "Last month: D13,576",
  icon
}: StatsCardProps) {
  
  return (
    <Card className="bg-card border-none p-6 rounded-[2rem] relative group hover:bg-card/80 transition-colors">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-muted-foreground font-medium text-sm">{title}</h3>
        {icon && (
          <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white bg-white/5">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <div className={cn(
          "px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1",
          trend === "up" ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500"
        )}>
          {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {variance}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground/60 font-medium">
        {subtext}
      </p>
    </Card>
  );
}
