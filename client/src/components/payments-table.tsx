import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { type Payment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal, 
  ArrowUpDown,
  Calendar as CalendarIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function PaymentsTable() {
  const { data: payments, isLoading, refetch, isRefetching } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  })?.sort((a, b) => {
    // Attempt to parse dates for sorting (assuming DD-MMM-YY or similar)
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    // Sort ascending (earliest first)
    return dateA.getTime() - dateB.getTime();
  });

  if (isLoading) {
    return (
      <Card className="border-white/5 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/5 bg-card/50 backdrop-blur-xl hover:border-white/10 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold text-white">Project Payments</CardTitle>
          <p className="text-sm text-muted-foreground">Manage and track your financial records</p>
        </div>
       <div className="flex items-center gap-2">
           <Button 
              variant="outline" 
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 gap-2"
              onClick={() => refetch()}
              disabled={isRefetching}
           >
              <ArrowUpDown className={cn("w-4 h-4", isRefetching && "animate-spin")} />
              {isRefetching ? "Syncing..." : "Refresh Data"}
           </Button>
           <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 gap-2">
              <Download className="w-4 h-4" />
              Export
           </Button>
           <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold">
              <Plus className="w-4 h-4" />
              Add Payment
           </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search clients, projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-black/20 border-white/10 text-sm focus-visible:ring-primary/20"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 gap-2">
                  <Filter className="w-4 h-4" />
                  Status: <span className="text-white">{statusFilter}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-white/10 text-white">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {["All", "Paid", "Pending"].map((status) => (
                  <DropdownMenuCheckboxItem 
                    key={status}
                    checked={statusFilter === status}
                    onCheckedChange={() => setStatusFilter(status)}
                    className="cursor-pointer hover:bg-white/5 focus:bg-white/5"
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[12px] pl-4">
                   <div className="w-4 h-4 rounded border border-white/20"></div>
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                <TableHead className="text-muted-foreground font-medium">Client</TableHead>
                <TableHead className="text-muted-foreground font-medium">Project</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium">Amount</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium">Balance</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments?.map((payment) => (
                <TableRow key={payment.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="pl-4">
                     <div className="w-4 h-4 rounded border border-white/20 group-hover:border-white/40 transition-colors"></div>
                  </TableCell>
                  <TableCell className="font-medium text-white/80">{payment.date}</TableCell>
                  <TableCell className="text-white font-medium">{payment.clientName}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[250px] truncate" title={payment.projectTitle}>
                    {payment.projectTitle}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "rounded-full px-2.5 py-0.5 border font-semibold transition-colors",
                         payment.status === 'Paid' 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                      )}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-white font-mono font-medium">
                    D{payment.totalAmount}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {payment.balance === "0.00" ? (
                      <span className="text-emerald-400/80">Paid</span>
                    ) : (
                      <span className="text-red-400">D{payment.balance}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredPayments?.length && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-48">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                       <Search className="w-8 h-8 mb-2 opacity-20" />
                       <p>No payments found matching your filters.</p>
                       <Button variant="link" onClick={() => {setSearchTerm(""); setStatusFilter("All")}} className="text-primary mt-2">
                          Clear Filters
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
