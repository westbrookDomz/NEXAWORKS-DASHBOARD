import StatsCard from "@/components/stats-card";
import AnalyticsCard from "@/components/analytics-card";
import { ShoppingCart, UserPlus, Box, DollarSign, Calendar } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { type Payment } from "@shared/schema";
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, parse } from "date-fns";

export default function Dashboard() {
  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  // Helper to parse "DD-MMM-YY" or standard dates
  const parseDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    return new Date(); // Fallback
  };

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const filterByDateRange = (items: Payment[] = [], start: Date, end: Date) => {
    return items.filter(p => {
      const date = parseDate(p.date);
      return isWithinInterval(date, { start, end });
    });
  };

  const currentMonthPayments = filterByDateRange(payments, currentMonthStart, currentMonthEnd);
  const lastMonthPayments = filterByDateRange(payments, lastMonthStart, lastMonthEnd);

  const calculateMetrics = (items: Payment[]) => {
    const revenue = items.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount.replace(/[^0-9.-]+/g, "")) || 0), 0);
    const collected = items.reduce((acc, curr) => acc + (parseFloat(curr.amountPaid.replace(/[^0-9.-]+/g, "")) || 0), 0);
    const balance = items.reduce((acc, curr) => acc + (parseFloat(curr.balance.replace(/[^0-9.-]+/g, "")) || 0), 0);
    const clients = new Set(items.map(p => p.clientName)).size;
    return { revenue, collected, balance, clients };
  };

  const currentMetrics = calculateMetrics(currentMonthPayments);
  const lastMetrics = calculateMetrics(lastMonthPayments);
  const allTimeMetrics = calculateMetrics(payments || []);

  const calculateVariance = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueVariance = calculateVariance(currentMetrics.revenue, lastMetrics.revenue);
  const clientsVariance = calculateVariance(currentMetrics.clients, lastMetrics.clients);
  const balanceVariance = calculateVariance(currentMetrics.balance, lastMetrics.balance);
  const collectedVariance = calculateVariance(currentMetrics.collected, lastMetrics.collected);

  const formatVariance = (val: number) => `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;

  return (
    <div className="max-w-[1600px] mx-auto animate-in-fade flex flex-col gap-6 px-8 pb-8 pt-2">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={`D${allTimeMetrics.revenue.toLocaleString()}`}
          variance={formatVariance(revenueVariance)}
          trend={revenueVariance >= 0 ? "up" : "down"}
          subtext="All time revenue"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatsCard 
          title="Active Clients" 
          value={allTimeMetrics.clients.toString()} 
          variance={formatVariance(clientsVariance)}
          trend={clientsVariance >= 0 ? "up" : "down"}
          subtext="Unique customers"
          icon={<UserPlus className="w-5 h-5" />}
        />
        <StatsCard 
          title="Outstanding Balance" 
          value={`D${allTimeMetrics.balance.toLocaleString()}`}
          variance={formatVariance(balanceVariance)}
          trend={balanceVariance >= 0 ? "up" : "down"}
          subtext="Pending payments"
          icon={<Box className="w-5 h-5" />}
        />
        <StatsCard 
          title="Total Collected" 
          value={`D${allTimeMetrics.collected.toLocaleString()}`}
          variance={formatVariance(collectedVariance)}
          trend={collectedVariance >= 0 ? "up" : "down"}
          subtext="Cash in hand"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
      </div>

      {/* Middle Section: Combined Analytics Card */}
      <div>
         <AnalyticsCard />
      </div>

    </div>
  );
}
