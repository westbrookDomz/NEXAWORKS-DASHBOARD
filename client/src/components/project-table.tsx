import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, CalendarClock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Updated data structure based on user request
const transactions = [
  { 
    date: "2024-11-24", 
    client: "TechStart Inc.", 
    project: "Brand Identity", 
    invoice: "INV-2024-001", 
    charged: "$5,000.00", 
    discount: "$0.00", 
    agreed: "$5,000.00", 
    paid: "$2,500.00", 
    balance: "$2,500.00", 
    total: "$5,000.00", 
    paymentDate: "2024-11-24", 
    status: "Partial", 
    method: "Bank Transfer", 
    notes: "50% deposit received" 
  },
  { 
    date: "2024-11-20", 
    client: "Global Ventures", 
    project: "Web Design", 
    invoice: "INV-2024-002", 
    charged: "$8,500.00", 
    discount: "$500.00", 
    agreed: "$8,000.00", 
    paid: "$8,000.00", 
    balance: "$0.00", 
    total: "$8,000.00", 
    paymentDate: "2024-11-22", 
    status: "Paid", 
    method: "Credit Card", 
    notes: "Paid in full" 
  },
  { 
    date: "2024-11-15", 
    client: "Acme Corp", 
    project: "Marketing Assets", 
    invoice: "INV-2024-003", 
    charged: "$3,200.00", 
    discount: "$0.00", 
    agreed: "$3,200.00", 
    paid: "$0.00", 
    balance: "$3,200.00", 
    total: "$3,200.00", 
    paymentDate: "-", 
    status: "Unpaid", 
    method: "-", 
    notes: "Invoice sent" 
  },
  { 
    date: "2024-11-10", 
    client: "Neon Cafe", 
    project: "Social Media Kit", 
    invoice: "INV-2024-004", 
    charged: "$1,500.00", 
    discount: "$100.00", 
    agreed: "$1,400.00", 
    paid: "$1,400.00", 
    balance: "$0.00", 
    total: "$1,400.00", 
    paymentDate: "2024-11-12", 
    status: "Paid", 
    method: "PayPal", 
    notes: "Early bird discount applied" 
  },
  { 
    date: "2024-11-05", 
    client: "Elevate Co.", 
    project: "App UI/UX", 
    invoice: "INV-2024-005", 
    charged: "$12,000.00", 
    discount: "$0.00", 
    agreed: "$12,000.00", 
    paid: "$4,000.00", 
    balance: "$8,000.00", 
    total: "$12,000.00", 
    paymentDate: "2024-11-05", 
    status: "Partial", 
    method: "Bank Transfer", 
    notes: "Milestone 1 paid" 
  },
];

export default function ClientTable() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="p-4 border-b border-border/40 flex justify-between items-center">
        <h3 className="font-semibold text-lg text-foreground">Recent Transactions</h3>
        <div className="flex gap-2">
           <Badge variant="outline" className="bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer transition-colors border-primary/20">
             Export CSV
           </Badge>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider font-medium text-muted-foreground pl-4">Date</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider font-medium text-muted-foreground">Client Name</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider font-medium text-muted-foreground">Project</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider font-medium text-muted-foreground">Invoice No.</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider font-medium text-muted-foreground text-right">Agreed</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider font-medium text-muted-foreground text-right">Paid</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider font-medium text-muted-foreground text-right">Balance</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider font-medium text-muted-foreground text-center">Status</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider font-medium text-muted-foreground">Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t, i) => (
              <TableRow key={i} className="border-border/30 hover:bg-white/5 transition-colors group">
                <TableCell className="font-mono text-xs text-muted-foreground pl-4 py-4 whitespace-nowrap">{t.date}</TableCell>
                <TableCell className="font-medium text-foreground whitespace-nowrap">{t.client}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{t.project}</TableCell>
                <TableCell className="font-mono text-xs text-primary whitespace-nowrap">{t.invoice}</TableCell>
                <TableCell className="text-right font-mono text-xs font-medium whitespace-nowrap">{t.agreed}</TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground whitespace-nowrap">{t.paid}</TableCell>
                <TableCell className={cn(
                  "text-right font-mono text-xs font-medium whitespace-nowrap",
                  t.balance === "$0.00" ? "text-muted-foreground" : "text-orange-400"
                )}>
                  {t.balance}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] px-2 py-0.5 h-5 min-w-[70px] justify-center border-none",
                      t.status === "Paid" ? "bg-emerald-500/10 text-emerald-400" : 
                      t.status === "Partial" ? "bg-blue-500/10 text-blue-400" : 
                      "bg-red-500/10 text-red-400"
                    )}
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
                   {t.method !== "-" && (
                     t.method.includes("Card") ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />
                   )}
                   {t.method}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
