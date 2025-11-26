import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts";

const data = [
  { name: "Sat", value: 25000 },
  { name: "Sun", value: 18000 },
  { name: "Mon", value: 33500 }, // Active
  { name: "Thu", value: 22000 },
  { name: "Wed", value: 28000 },
  { name: "Thus", value: 15000 },
  { name: "Fri", value: 24000 },
];

export default function RevenueChart() {
  return (
    <div className="h-full w-full bg-card rounded-[2rem] p-8 flex flex-col">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h3 className="text-lg font-bold text-white mb-1">Revenue analytics</h3>
            <div className="text-3xl font-bold text-white">$33,500</div>
         </div>
         <div className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-muted-foreground font-medium cursor-pointer hover:text-white transition-colors">
            This week v
         </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
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
                        ${Number(payload[0].value).toLocaleString()}
                      </div>
                    );
                  }
                  return null;
               }}
            />
            <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.name === 'Mon' ? 'hsl(var(--primary))' : 'url(#stripePattern)'}
                  stroke={entry.name === 'Mon' ? 'none' : 'hsl(0, 0%, 30%)'}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
