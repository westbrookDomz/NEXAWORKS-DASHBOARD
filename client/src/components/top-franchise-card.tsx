import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function TopFranchiseCard() {
  return (
    <Card className="glass-panel border-border/50 bg-card p-6 rounded-2xl h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Franchise</h3>
        <div className="space-y-1">
           <h4 className="text-lg font-semibold text-foreground">Sukabumi Tercinta</h4>
           <div className="flex items-center gap-2 text-xs text-muted-foreground">
             <span>28 outlets</span>
             <span>•</span>
             <span className="flex items-center gap-1 text-orange-400">
               <Star className="w-3 h-3 fill-current" /> 5.0
             </span>
           </div>
        </div>
      </div>

      <div className="flex items-end justify-between mt-6">
         <div className="space-y-3 text-xs">
            <div>
              <div className="text-muted-foreground mb-0.5">Net Profit</div>
              <div className="font-bold text-foreground flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                $1.9M
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-0.5">Gross Profit</div>
              <div className="font-bold text-foreground flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                $1.9M
              </div>
            </div>
         </div>

         <div className="flex items-end gap-2 h-20">
            <div className="w-6 h-[60%] bg-primary rounded-t-sm"></div>
            <div className="w-6 h-[100%] bg-primary/30 rounded-t-sm relative overflow-hidden">
               {/* Striped pattern simulation */}
               <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, #fff 25%, #fff 50%, transparent 50%, transparent 75%, #fff 75%, #fff 100%)', backgroundSize: '4px 4px' }}></div>
            </div>
         </div>
      </div>
    </Card>
  );
}
