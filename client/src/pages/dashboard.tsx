import DashboardLayout from "@/components/dashboard-layout";
import StatsCard from "@/components/stats-card";
import RevenueChart from "@/components/revenue-chart";
import DistributionChart from "@/components/distribution-chart";
import ProjectTable from "@/components/project-table";
import TopFranchiseCard from "@/components/top-franchise-card";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto animate-in-fade space-y-8">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Charged" 
            value="$30.2 K" 
            variance="$5.2 K" 
            trend="up"
            chartColor="primary"
            data={[30, 40, 35, 50, 45, 60, 55, 70, 65]}
          />
          <StatsCard 
            title="Amount Paid" 
            value="$15.9 K" 
            variance="$2.1 K" 
            trend="up"
            chartColor="purple"
            data={[20, 30, 25, 40, 35, 45, 40, 50, 45]}
          />
          <StatsCard 
            title="Outstanding Balance" 
            value="$13.7 K" 
            variance="15%" 
            trend="down"
            chartColor="orange"
            data={[50, 45, 40, 55, 50, 45, 40, 35, 30]}
          />
          <StatsCard 
            title="Total Discounts" 
            value="$600" 
            variance="-100" 
            trend="down"
            chartColor="blue"
            data={[10, 15, 10, 20, 15, 25, 20, 15, 10]}
          />
        </div>

        {/* Middle Section: Overview Breakdown & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Distribution Chart */}
          <div className="lg:col-span-4">
             <DistributionChart />
          </div>

          {/* Right: Revenue Chart */}
          <div className="lg:col-span-8 h-[420px] border border-white/5 rounded-2xl p-6 bg-card/30 relative">
             <RevenueChart />
          </div>
        </div>

        {/* Bottom Section: Transactions & Client */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-6">
             <h3 className="text-lg font-medium text-muted-foreground">Recent Invoices</h3>
             <ProjectTable />
          </div>
          
          <div className="lg:col-span-3 h-full">
             <TopFranchiseCard />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
