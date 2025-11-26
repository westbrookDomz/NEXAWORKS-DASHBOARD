import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";

export default function TopFranchiseCard() {
  return (
    <Card className="glass-panel border-border/50 bg-card p-6 rounded-2xl h-full flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Client</h3>
        <div className="space-y-1">
           <h4 className="text-2xl font-bold text-foreground tracking-tight">Elevate Co.</h4>
           <div className="flex items-center gap-2 text-xs text-muted-foreground">
             <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider">Premium</span>
             <span>•</span>
             <span>3 Projects</span>
           </div>
        </div>
      </div>

      <div className="space-y-4 mt-6 relative z-10">
         <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-emerald-400" />
               </div>
               <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total Paid</div>
                  <div className="text-sm font-bold text-foreground">$18,500</div>
               </div>
            </div>
         </div>

         <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
               </div>
               <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Outstanding</div>
                  <div className="text-sm font-bold text-foreground">$4,500</div>
               </div>
            </div>
         </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
         <span>Lifetime Value</span>
         <span className="text-primary font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            $23,000
         </span>
      </div>
    </Card>
  );
}
