import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface BreakdownItem {
  label: string;
  revenue: string;
  variance: number; // percentage for progress bar
  amount: string;
  percentage: string;
  color: "primary" | "purple" | "orange" | "blue" | "gray";
}

const items: BreakdownItem[] = [
  { label: "P&I", revenue: "$2.3M", variance: 65, amount: "$320.2K", percentage: "54%", color: "primary" },
  { label: "Envel/Addr", revenue: "$4.0M", variance: 45, amount: "$650.1K", percentage: "36%", color: "primary" },
  { label: "Smart Products", revenue: "$1.1M", variance: 30, amount: "$120.0K", percentage: "78%", color: "primary" },
  { label: "Digital", revenue: "$900K", variance: 55, amount: "$244.9K", percentage: "49%", color: "primary" },
  { label: "Other", revenue: "$1.0M", variance: 40, amount: "$109.0K", percentage: "40%", color: "primary" },
  { label: "Total", revenue: "$6.2M", variance: 25, amount: "$111.0K", percentage: "21%", color: "primary" },
];

export default function OverviewBreakdown() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-4 mb-4 text-xs text-muted-foreground uppercase tracking-wider font-medium px-2">
        <div className="col-span-3"></div>
        <div className="col-span-2 text-right">Rev</div>
        <div className="col-span-3 text-center">Variance</div>
        <div className="col-span-2 text-right">$</div>
        <div className="col-span-2 text-right">%</div>
      </div>
      
      <div className="space-y-5">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center px-2 group hover:bg-white/5 py-2 rounded-lg transition-colors">
            <div className="col-span-3 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
              {item.label}
            </div>
            <div className="col-span-2 text-right text-sm font-bold text-orange-400/90">
              {item.revenue}
            </div>
            <div className="col-span-3 px-2">
               <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${item.variance}%` }}
                 />
               </div>
            </div>
            <div className="col-span-2 text-right text-sm font-bold text-orange-400/90">
              {item.amount}
            </div>
            <div className="col-span-2 text-right text-sm font-medium text-muted-foreground">
              {item.percentage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
