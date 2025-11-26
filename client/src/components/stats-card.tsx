import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export default function StatsCard({ title, value, change, trend, icon, className }: StatsCardProps) {
  return (
    <Card className={cn("glass-panel border-border/50 hover:border-primary/30 transition-colors", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-display tracking-tight">{value}</div>
        {change && (
          <p className={cn("text-xs flex items-center mt-2 font-medium", 
            trend === "up" ? "text-primary" : 
            trend === "down" ? "text-red-400" : 
            "text-muted-foreground"
          )}>
            {trend === "up" && <ArrowUpRight className="w-3 h-3 mr-1" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3 mr-1" />}
            {change}
            <span className="text-muted-foreground ml-1 font-normal">vs last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
