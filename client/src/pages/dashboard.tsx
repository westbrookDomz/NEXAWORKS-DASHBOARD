import DashboardLayout from "@/components/dashboard-layout";
import StatsCard from "@/components/stats-card";
import RevenueChart from "@/components/revenue-chart";
import OverviewBreakdown from "@/components/overview-breakdown";
import ProjectTable from "@/components/project-table";
import TopFranchiseCard from "@/components/top-franchise-card";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto animate-in-fade space-y-8">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Revenue" 
            value="$52 M" 
            variance="$2.3M" 
            trend="up"
            chartColor="primary"
            data={[30, 40, 35, 50, 45, 60, 55, 70, 65]}
          />
          <StatsCard 
            title="Net Revenue" 
            value="$24 M" 
            variance="$1.3M" 
            trend="up"
            chartColor="purple"
            data={[20, 30, 25, 40, 35, 45, 40, 50, 45]}
          />
          <StatsCard 
            title="Gross Profit" 
            value="$1.9 M" 
            variance="$10%" 
            trend="down"
            chartColor="orange"
            data={[50, 45, 40, 55, 50, 45, 40, 35, 30]}
          />
          <StatsCard 
            title="Total Envelopes" 
            value="50K" 
            variance="-2.7K" 
            trend="down"
            chartColor="blue"
            data={[60, 55, 65, 60, 70, 65, 75, 70, 80]}
          />
        </div>

        {/* Middle Section: Overview Breakdown & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Breakdown List */}
          <div className="lg:col-span-5 space-y-6">
             <h3 className="text-lg font-medium text-muted-foreground">Overview Breakdown</h3>
             <OverviewBreakdown />
          </div>

          {/* Right: Chart */}
          <div className="lg:col-span-7 h-[400px] border border-white/5 rounded-2xl p-4 bg-card/30 relative">
             <RevenueChart />
          </div>
        </div>

        {/* Bottom Section: Revenue Details & Franchise */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
             <h3 className="text-lg font-medium text-muted-foreground">Revenue Details</h3>
             <ProjectTable />
          </div>
          
          <div className="lg:col-span-4 h-full">
             <TopFranchiseCard />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
