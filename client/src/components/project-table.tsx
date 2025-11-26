import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

const transactions = [
  { 
    id: "#656758",
    date: "2 May 2025", 
    client: "Amanda Beier V", 
    category: "Shoes, Shirt", 
    status: "Pending", 
    items: "2 Items",
    total: "$264.77"
  },
  { 
    id: "#656759",
    date: "Order ID", 
    client: "Order ID", 
    category: "Shoes, Shirt", 
    status: "Completed", 
    items: "3 Items",
    total: "$284.77"
  },
  { 
    id: "#656760",
    date: "Order ID", 
    client: "Order ID", 
    category: "Shoes, Shirt", 
    status: "Completed", 
    items: "3 Items",
    total: "$284.77"
  },
];

export default function ProjectTable() {
  return (
    <div className="w-full bg-card rounded-[2rem] p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
         <h3 className="text-lg font-bold text-white">Recent Orders</h3>
         
         <div className="flex items-center gap-3">
            <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input 
                 placeholder="Search..." 
                 className="pl-10 bg-background border-none h-10 rounded-xl text-sm"
               />
               <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white/10 rounded">
                  <Search className="w-3 h-3 text-white" />
               </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2.5 bg-background rounded-xl text-sm text-muted-foreground cursor-pointer hover:text-white border border-white/5">
               <SlidersHorizontal className="w-4 h-4" />
               Sort by
            </div>
         </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-xs text-muted-foreground">
               <th className="pb-2 pl-4 font-medium flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                     <div className="w-2 h-1 bg-white/20 rounded-sm"></div>
                     <div className="w-2 h-1 bg-white/20 rounded-sm"></div>
                  </div>
                  Order ID
               </th>
               <th className="pb-2 font-medium">Date</th>
               <th className="pb-2 font-medium">Customer</th>
               <th className="pb-2 font-medium">Category</th>
               <th className="pb-2 font-medium">States</th>
               <th className="pb-2 font-medium">Item</th>
               <th className="pb-2 pr-4 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
             {transactions.map((t, i) => (
               <tr key={i} className="group">
                  <td className="py-4 pl-4 bg-background/50 first:rounded-l-2xl group-hover:bg-background transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded border border-white/20"></div>
                        <span className="text-sm font-medium text-muted-foreground">{t.id}</span>
                     </div>
                  </td>
                  <td className="py-4 bg-background/50 group-hover:bg-background transition-colors text-sm text-white font-medium">{t.date}</td>
                  <td className="py-4 bg-background/50 group-hover:bg-background transition-colors text-sm text-white font-medium">{t.client}</td>
                  <td className="py-4 bg-background/50 group-hover:bg-background transition-colors text-sm text-white font-medium">{t.category}</td>
                  <td className="py-4 bg-background/50 group-hover:bg-background transition-colors">
                     <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                        t.status === 'Pending' 
                           ? 'text-red-400 border-red-500/20 bg-red-500/10' 
                           : 'text-green-400 border-green-500/20 bg-green-500/10'
                     }`}>
                        {t.status}
                     </span>
                  </td>
                  <td className="py-4 bg-background/50 group-hover:bg-background transition-colors text-sm text-white font-medium">{t.items}</td>
                  <td className="py-4 pr-4 bg-background/50 last:rounded-r-2xl group-hover:bg-background transition-colors text-sm text-white font-bold text-right">{t.total}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
