import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { type Payment } from "@shared/schema";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parse } from "date-fns";

export default function AnalyticsCard() {
  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  // Process data for Bar Chart (Weekly Revenue)
  // For demo purposes, since data spans months, we'll aggregate by Month instead of Day of week "This Week"
  // to show something meaningful.
  
  // Aggregate by Month
  const monthlyDataMap = new Map<string, number>();
  
  payments?.forEach(p => {
    // p.date format is "23-Nov-2025"
    try {
      const date = parse(p.date, "d-MMM-yyyy", new Date());
      const monthKey = format(date, "MMM"); // Nov, Oct
      const amount = parseFloat(p.totalAmount.replace(/,/g, ''));
      monthlyDataMap.set(monthKey, (monthlyDataMap.get(monthKey) || 0) + amount);
    } catch (e) {
      // ignore invalid dates
    }
  });

  // Ensure logical month order
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec"];
  const barData = months.map(month => ({
    name: month,
    value: monthlyDataMap.get(month) || 0
  }));


  // Process data for Pie Chart (Paid vs Pending)
  const totalPaid = payments?.reduce((acc, curr) => acc + parseFloat(curr.amountPaid.replace(/,/g, '')), 0) || 0;
  const totalPending = payments?.reduce((acc, curr) => acc + parseFloat(curr.balance.replace(/,/g, '')), 0) || 0;
  const totalRevenue = totalPaid + totalPending;

  const gaugeData = [
    { name: "Paid", value: totalPaid, color: "var(--color-primary)" }, 
    { name: "Pending", value: totalPending, color: "hsl(0, 0%, 25%)" },
  ];

  return (
    <div 
      className="w-full bg-card rounded-[2rem] p-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
      style={{
        background: `
          linear-gradient(var(--color-card), var(--color-card)) padding-box,
          linear-gradient(to bottom right, var(--color-primary), black) border-box
        `,
        border: '1px solid transparent'
      }}
    >
      
      {/* Left Side: Revenue Analytics */}
      <div className="lg:col-span-8 flex flex-col h-[350px]">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-lg font-bold text-white mb-1">Revenue Analytics</h3>
              {/* Using D for Dalasi */}
              <div className="text-3xl font-bold text-white inline-block">
                D{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
           </div>
           <div className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-muted-foreground font-medium cursor-pointer hover:text-white transition-colors">
              Monthly View
           </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barGap={8}>
              <defs>
                 <pattern id="stripePattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                    <line x1="0" y="0" x2="0" y2="8" stroke="hsl(0, 0%, 30%)" strokeWidth="2" />
                 </pattern>
              </defs>
              <XAxis 
                 dataKey="name" 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fill: 'hsl(0, 0%, 40%)', fontSize: 12 }} 
                 dy={10}
              />
              <Tooltip 
                 cursor={{ fill: 'transparent' }}
                 content={({ active, payload }) => {
                    if (active && payload && payload.length && payload[0].value) {
                      return (
                        <div className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl transform -translate-y-2">
                          D{Number(payload[0].value).toLocaleString()}
                        </div>
                      );
                    }
                    return null;
                 }}
              />
              <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value > 0 ? 'var(--color-primary)' : 'url(#stripePattern)'}
                    stroke={entry.value > 0 ? 'none' : 'hsl(0, 0%, 30%)'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Side: Total Income */}
      <div className="lg:col-span-4 flex flex-col h-[350px] relative">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-1">Payment Status</h3>
          <p className="text-xs text-muted-foreground">Paid vs Pending Balance</p>
        </div>
        
        <div className="flex-1 min-h-0 relative -mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="70%"
                startAngle={180}
                endAngle={0}
                innerRadius={80}
                outerRadius={110}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                cornerRadius={10}
              >
                {gaugeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text Overlay */}
          <div className="absolute bottom-[30%] left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-white tracking-tight">
              {(totalPaid / (totalRevenue || 1) * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-muted-foreground mt-1">Collected</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between px-4 mt-auto">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span className="text-xs text-white font-medium">Paid</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#404040]"></div>
              <span className="text-xs text-muted-foreground">Pending</span>
           </div>
        </div>
      </div>

    </div>
  );
}
