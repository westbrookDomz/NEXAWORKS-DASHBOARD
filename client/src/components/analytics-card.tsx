import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { cn } from "@/lib/utils";

// Bar Chart Data
const barData = [
  { name: "Sat", value: 25000 },
  { name: "Sun", value: 18000 },
  { name: "Mon", value: 33500 }, // Active
  { name: "Thu", value: 22000 },
  { name: "Wed", value: 28000 },
  { name: "Thus", value: 15000 },
  { name: "Fri", value: 24000 },
];

// Gauge Chart Data
const gaugeData = [
  { name: "Profit", value: 70, color: "var(--color-primary)" }, // Yellow
  { name: "Loss", value: 20, color: "hsl(0, 0%, 25%)" },      // Dark Gray
  { name: "Return", value: 10, color: "hsl(0, 0%, 15%)" },     // Darker Gray
];

export default function AnalyticsCard() {
  return (
    <div className="w-full bg-card rounded-[2rem] p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Side: Revenue Analytics */}
      <div className="lg:col-span-8 flex flex-col h-[350px]">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-lg font-bold text-white mb-1">Revenue analytics</h3>
              {/* Using D for Dalasi */}
              <div className="text-3xl font-bold text-white bg-white/10 px-3 py-1 rounded-lg inline-block">D33,500</div>
           </div>
           <div className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-muted-foreground font-medium cursor-pointer hover:text-white transition-colors">
              This week v
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
                    fill={entry.name === 'Mon' ? 'var(--color-primary)' : 'url(#stripePattern)'}
                    stroke={entry.name === 'Mon' ? 'none' : 'hsl(0, 0%, 30%)'}
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
          <h3 className="text-lg font-bold text-white mb-1">Total Income</h3>
          <p className="text-xs text-muted-foreground">View your income in a certain period of time</p>
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
            <span className="text-4xl font-bold text-white tracking-tight">100K</span>
            <span className="text-xs text-muted-foreground mt-1">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between px-4 mt-auto">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span className="text-xs text-white font-medium">Profit</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#404040]"></div>
              <span className="text-xs text-muted-foreground">Loss</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#262626]"></div>
              <span className="text-xs text-muted-foreground">Return</span>
           </div>
        </div>
      </div>

    </div>
  );
}
