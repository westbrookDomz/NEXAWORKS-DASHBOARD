import { Link } from "wouter";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Payment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart, 
  Pie, 
  Cell
} from "recharts";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Download, 
  Calendar as CalendarIcon,
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ['#179be5', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#eab308'];

export default function Reports() {
  const { data: payments, isLoading, refetch, isRefetching } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const stats = useMemo(() => {
    if (!payments) return { 
      revenue: 0, 
      invoiced: 0, 
      outstanding: 0, 
      trendData: [], 
      clientData: [] 
    };

    const revenue = payments.reduce((acc, p) => acc + (parseFloat(p.amountPaid.replace(/[^0-9.-]+/g, "")) || 0), 0);
    const invoiced = payments.reduce((acc, p) => acc + (parseFloat(p.totalAmount.replace(/[^0-9.-]+/g, "")) || 0), 0);
    const outstanding = payments.reduce((acc, p) => acc + (parseFloat(p.balance.replace(/[^0-9.-]+/g, "")) || 0), 0);

    // Process Trend Data (Group by Month)
    const trendMap = new Map<string, number>();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize current year months
    const currentYear = new Date().getFullYear();
    months.forEach(m => trendMap.set(`${m} ${currentYear}`, 0));

    payments.forEach(p => {
        const date = new Date(p.date);
        if (isNaN(date.getTime())) return;
        const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
        // We track 'invoiced' amount for trend or 'collected'? Let's use 'collected' (amountPaid) for Revenue Trend
        const amount = parseFloat(p.amountPaid.replace(/[^0-9.-]+/g, "")) || 0;
        if (trendMap.has(key)) {
            trendMap.set(key, (trendMap.get(key) || 0) + amount);
        }
    });

    // Convert map to array and sort by date 
    // Simplified: Just taking the predefined keys in order for this year to show a nice curve
    const trendData = Array.from(trendMap.entries()).map(([name, value]) => ({ name: name.split(' ')[0], value }));

    // Process Client Data (Group by Client for Pie Chart)
    const clientMap = new Map<string, number>();
    payments.forEach(p => {
        const amount = parseFloat(p.amountPaid.replace(/[^0-9.-]+/g, "")) || 0;
        if (amount > 0) {
            clientMap.set(p.clientName, (clientMap.get(p.clientName) || 0) + amount);
        }
    });
    
    const clientData = Array.from(clientMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5

    return { revenue, invoiced, outstanding, trendData, clientData };
  }, [payments]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 animate-in-fade space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-6">
         {/* Top Bar matching other pages */}
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Reports</h1>
        </div>

        {/* Action Bar */}
       <div className="flex items-center justify-between">
            <Button variant="outline" className="bg-card border-white/10 text-white hover:bg-white/5 gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground"/>
                Last 12 Months
            </Button>
            <div className="flex items-center gap-2">
               <Button 
                  variant="outline" 
                  className="bg-card border-white/10 text-white hover:bg-white/5 gap-2"
                  onClick={() => refetch()}
                  disabled={isRefetching}
               >
                  <TrendingUp className={cn("w-4 h-4", isRefetching && "animate-spin")} />
                  {isRefetching ? "Syncing..." : "Refresh Data"}
               </Button>
               <Button className="bg-[#179be5] text-white hover:bg-[#148bc9] font-semibold rounded-xl gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
               </Button>
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm relative overflow-hidden">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="text-3xl font-bold text-white">D{stats.revenue.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-[#179be5]">
                    <TrendingUp className="w-3 h-3" />
                    <span>Calculated from payments</span>
                </div>
                <div className="absolute top-4 right-4 p-2 bg-[#179be5]/10 rounded-lg text-[#179be5]">
                    <TrendingUp className="w-4 h-4" />
                </div>
             </CardContent>
          </Card>

          {/* Expenses Card (Replaced with Outstanding for now as requested by constraint) */}
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm relative overflow-hidden">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="text-3xl font-bold text-white">D{stats.outstanding.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-amber-500">
                    <TrendingDown className="w-3 h-3" />
                    <span>Pending collection</span>
                </div>
                <div className="absolute top-4 right-4 p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <TrendingDown className="w-4 h-4" />
                </div>
             </CardContent>
          </Card>

          {/* Net Profit Card (Replaced with Total Invoiced) */}
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm relative overflow-hidden">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoiced</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="text-3xl font-bold text-white">D{stats.invoiced.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-blue-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>Gross volume</span>
                </div>
                <div className="absolute top-4 right-4 p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <DollarSign className="w-4 h-4" />
                </div>
             </CardContent>
          </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Trend Line Chart */}
          <Card className="lg:col-span-2 border-white/5 bg-card/50 backdrop-blur-sm">
             <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Revenue Trend</CardTitle>
             </CardHeader>
             <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#179be5" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#179be5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6b7280', fontSize: 12 }} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={(val) => `D${val/1000}k`}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#179be5' }}
                                formatter={(value: number) => [`D${value.toLocaleString()}`, "Revenue"]}
                            />
                            <CartesianGrid vertical={false} stroke="#27272a" />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#179be5" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
             </CardContent>
          </Card>

          {/* Breakdown Chart */}
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
             <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Revenue by Client</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.clientData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.clientData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: number) => [`D${value.toLocaleString()}`, "Revenue"]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Centered Total */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-2xl font-bold text-white">D{stats.revenue.toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 space-y-3">
                    {stats.clientData.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-gray-300">{entry.name}</span>
                            </div>
                            <span className="font-medium text-white">D{entry.value.toLocaleString(undefined, { notation: "compact" })}</span>
                        </div>
                    ))}
                </div>
             </CardContent>
          </Card>

      </div>
    </div>
  );
}
