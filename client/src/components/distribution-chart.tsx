import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

const data = [
  { name: "Profit", value: 70, color: "hsl(var(--primary))" }, // Yellow
  { name: "Loss", value: 20, color: "hsl(0, 0%, 25%)" },      // Dark Gray
  { name: "Return", value: 10, color: "hsl(0, 0%, 15%)" },     // Darker Gray
];

export default function DistributionChart() {
  return (
    <div className="h-full w-full bg-card rounded-[2rem] p-8 flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1">Total Income</h3>
        <p className="text-xs text-muted-foreground">View your income in a certain period of time</p>
      </div>
      
      <div className="flex-1 min-h-0 relative -mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
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
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text Overlay - Positioned manually for gauge effect */}
        <div className="absolute bottom-[30%] left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-white tracking-tight">100K</span>
          <span className="text-xs text-muted-foreground mt-1">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between px-4 mt-auto">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-primary"></div>
            <span className="text-xs text-muted-foreground">Profit</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-[#404040]"></div>
            <span className="text-xs text-muted-foreground">Loss</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-[#262626]"></div>
            <span className="text-xs text-muted-foreground">Return</span>
         </div>
      </div>
    </div>
  );
}
