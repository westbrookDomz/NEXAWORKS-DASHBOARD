
import PaymentsTable from "@/components/payments-table";
import { useQuery } from "@tanstack/react-query";
import { type Payment } from "@shared/schema";
import StatsCard from "@/components/stats-card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DollarSign, CheckCircle2, AlertOctagon, ArrowLeft } from "lucide-react";

export default function Payments() {
  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  // Calculate Stats
  const totalRevenue = payments?.reduce((acc, curr) => acc + parseFloat(curr.totalAmount.replace(/,/g, '')), 0) || 0;
  const totalPaid = payments?.reduce((acc, curr) => acc + parseFloat(curr.amountPaid.replace(/,/g, '')), 0) || 0;
  const totalBalance = payments?.reduce((acc, curr) => acc + parseFloat(curr.balance.replace(/,/g, '')), 0) || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-6 lg:px-8 py-6 animate-in-fade">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Financials</h1>
            <p className="text-muted-foreground mt-1">Overview of your project payments and invoices.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Invoiced" 
          value={`D${totalRevenue.toLocaleString()}`}
          subtext="All time revenue"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatsCard 
          title="Collected" 
          value={`D${totalPaid.toLocaleString()}`}
          subtext="Total amount received"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <StatsCard 
          title="Outstanding" 
          value={`D${totalBalance.toLocaleString()}`}
          subtext="Pending payments"
          icon={<AlertOctagon className="w-5 h-5 text-amber-500" />}
        />
      </div>

      <PaymentsTable />
    </div>
  );
}
