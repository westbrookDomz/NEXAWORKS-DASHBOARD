import DashboardLayout from "@/components/dashboard-layout";
import StatsCard from "@/components/stats-card";
import RevenueChart from "@/components/revenue-chart";
import DistributionChart from "@/components/distribution-chart";
import ProjectTable from "@/components/project-table";
import { ShoppingCart, UserPlus, Box, DollarSign, Calendar } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto animate-in-fade space-y-8">
        
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-bold text-white">Sales Overview</h2>
           <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-white/5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>April 10, 2025 - May 11, 2025</span>
           </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Sales" 
            value="2500" 
            variance="4.9%" 
            trend="up"
            subtext="Last month: 2345"
            icon={<ShoppingCart className="w-5 h-5" />}
          />
          <StatsCard 
            title="New Customer" 
            value="250" 
            variance="4.9%" 
            trend="up"
            subtext="Last month: 89"
            icon={<UserPlus className="w-5 h-5" />}
          />
          <StatsCard 
            title="Return products" 
            value="85" 
            variance="8.9%" 
            trend="down"
            subtext="Last month: 60"
            icon={<Box className="w-5 h-5" />}
          />
          <StatsCard 
            title="Total Sales" 
            value="$45,500" 
            variance="4.9%" 
            trend="up"
            subtext="Last month: $13,576"
            icon={<DollarSign className="w-5 h-5" />}
          />
        </div>

        {/* Middle Section: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[400px]">
          {/* Left: Bar Chart */}
          <div className="lg:col-span-8 h-full">
             <RevenueChart />
          </div>

          {/* Right: Gauge Chart */}
          <div className="lg:col-span-4 h-full">
             <DistributionChart />
          </div>
        </div>

        {/* Bottom Section: Table */}
        <div className="w-full">
           <ProjectTable />
        </div>

      </div>
    </DashboardLayout>
  );
}
