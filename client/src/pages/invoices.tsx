import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Payment } from "@shared/schema";
import { FileText, Plus, Search, Filter, MoreHorizontal, Bell, HelpCircle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const invoices = useMemo(() => {
    if (!payments) return [];

    return payments
      .filter(p => p.invoiceNo && /\d/.test(p.invoiceNo)) // Strict filter: must contain at least one digit
      .map(p => {
       const balance = parseFloat(p.balance.replace(/[^0-9.-]+/g, "")) || 0;
       const total = parseFloat(p.totalAmount.replace(/[^0-9.-]+/g, "")) || 0;
       
       // Date parsing
       // Use raw date strings from sheet for display to ensure accuracy ("Issue Date")
       const issueDateStr = p.date;
       const paymentDateStr = p.paymentDate;

       // Calculate Due Date only for logic checks (Issue + 14 days)
       // We try to parse the issue date for this calculation
       const parsedIssueDate = new Date(issueDateStr);
       const isValidDate = !isNaN(parsedIssueDate.getTime());
       const calculationDate = isValidDate ? parsedIssueDate : new Date();
       
       const dueDate = new Date(calculationDate);
       dueDate.setDate(dueDate.getDate() + 14); 

       const isOverdue = balance > 0 && new Date() > dueDate;
       const isPaid = balance <= 0;
       
       let status: "Paid" | "Pending" | "Overdue" = "Pending";
       if (isPaid) status = "Paid";
       else if (isOverdue) status = "Overdue";

       // Determine subtext date (Payment Date if paid, otherwise Due Date)
       let dateSubtext = `Due ${isValidDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}`;
       
       if (isPaid && paymentDateStr && paymentDateStr.trim().length > 0) {
           dateSubtext = `Paid ${paymentDateStr}`;
       }

       return {
         id: p.invoiceNo,
         client: p.clientName,
         clientAvatar: p.clientName.charAt(0).toUpperCase(),
         date: issueDateStr || "N/A",
         dateSubtext, 
         amount: total,
         status,
         rawDate: calculationDate,
       };
    }).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()); // Newest first

  }, [payments]);

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-0 -mt-8 pb-6 animate-in-fade space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-transparent">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[300px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input 
                 placeholder="Search invoices..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-9 bg-card border-none ring-1 ring-white/5 focus-visible:ring-primary/20 rounded-xl text-white"
               />
            </div>
            <Button variant="outline" size="icon" className="bg-card border-none ring-1 ring-white/5 hover:bg-white/5 rounded-xl">
               <Filter className="w-4 h-4 text-muted-foreground" />
            </Button>
         </div>

         <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            New Invoice
         </Button>
      </div>

      {/* Compact Table */}
      <Card className="border-none bg-transparent">
         <div className="rounded-2xl border border-white/5 overflow-hidden bg-card/50 backdrop-blur-sm">
            <Table>
                <TableHeader className="bg-black/20">
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="w-[12px] pl-4">
                            <div className="w-4 h-4 rounded border border-white/20"></div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Invoice ID</TableHead>
                        <TableHead className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Client</TableHead>
                        <TableHead className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Date</TableHead>
                        <TableHead className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Status</TableHead>
                        <TableHead className="text-right text-muted-foreground font-medium uppercase text-xs tracking-wider">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Loading invoices...</TableCell>
                    </TableRow>
                ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Search className="w-8 h-8 mb-2 opacity-20" />
                            <p>No invoices found matching your filters.</p>
                        </div>
                    </TableCell>
                    </TableRow>
                ) : (
                    filteredInvoices.map((invoice) => (
                       <TableRow key={invoice.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                          <TableCell className="pl-4 py-3">
                             <div className="w-4 h-4 rounded border border-white/20 group-hover:border-white/40 transition-colors"></div>
                          </TableCell>
                          <TableCell className="py-3">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-white transition-colors">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-white">{invoice.id}</span>
                             </div>
                          </TableCell>
                          <TableCell className="py-3 font-medium text-gray-300">
                             {invoice.client}
                          </TableCell>
                          <TableCell className="py-3">
                             <div className="flex flex-col">
                                <span className="text-sm text-white font-medium">{invoice.date}</span>
                                <span className="text-xs text-muted-foreground">{invoice.dateSubtext}</span>
                             </div>
                          </TableCell>
                          <TableCell className="py-3">
                             <Badge 
                               variant="outline"
                               className={cn(
                                "rounded-full px-2.5 py-0.5 border font-semibold text-xs",
                                invoice.status === 'Paid' ? 'bg-primary/10 text-primary border-primary/20' : '',
                                invoice.status === 'Pending' ? 'bg-white/10 text-gray-300 border-white/10' : '',
                                invoice.status === 'Overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''
                               )}
                             >
                                {invoice.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right font-medium text-white">
                             D{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="py-3">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                       </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
         </div>
      </Card>
    </div>
  );
}
