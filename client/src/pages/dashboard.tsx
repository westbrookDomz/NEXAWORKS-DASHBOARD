import DashboardLayout from "@/components/dashboard-layout";
import StatsCard from "@/components/stats-card";
import RevenueChart from "@/components/revenue-chart";
import ProjectTable from "@/components/project-table";
import FileUpload from "@/components/file-upload";
import { DecorativeShape, GridPattern } from "@/components/decorative-elements";
import { DollarSign, Briefcase, TrendingUp, Clock } from "lucide-react";
import glassShape from "@assets/generated_images/abstract_3d_glass_shape_neon_lime.png";
import chromeSphere from "@assets/generated_images/abstract_3d_chrome_sphere_dark.png";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="relative min-h-screen overflow-hidden">
        <GridPattern className="fixed inset-0 z-0" />
        
        {/* Ambient Background Elements */}
        <DecorativeShape className="top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[120px]" delay={0.2} />
        <DecorativeShape className="bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" delay={0.4} />

        {/* 3D Elements positioned decoratively */}
        <img 
          src={glassShape} 
          alt="Abstract Glass Element" 
          className="fixed top-20 right-[-50px] w-[300px] h-[300px] opacity-20 mix-blend-screen pointer-events-none z-0 animate-in-fade"
          style={{ animationDuration: '2s' }}
        />
        <img 
          src={chromeSphere} 
          alt="Abstract Chrome Sphere" 
          className="fixed bottom-20 left-[-50px] w-[200px] h-[200px] opacity-10 mix-blend-screen pointer-events-none z-0 rotate-180"
        />

        <div className="p-8 max-w-[1600px] mx-auto animate-in-fade relative z-10">
          <header className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-1">Overview</h2>
              <p className="text-muted-foreground">Welcome back, Jordan. Here's what's happening today.</p>
            </div>
            <div className="text-sm text-muted-foreground font-mono border border-border px-3 py-1 rounded-full bg-background/50 backdrop-blur-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </header>

          <FileUpload />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard 
              title="Total Revenue" 
              value="$124,500" 
              change="+12.5%" 
              trend="up"
              icon={<DollarSign className="h-4 w-4" />} 
            />
            <StatsCard 
              title="Active Projects" 
              value="12" 
              change="+2" 
              trend="up"
              icon={<Briefcase className="h-4 w-4" />} 
            />
            <StatsCard 
              title="Avg. Deal Size" 
              value="$8,400" 
              change="-1.2%" 
              trend="down"
              icon={<TrendingUp className="h-4 w-4" />} 
            />
            <StatsCard 
              title="Pending Invoices" 
              value="4" 
              change="Due soon" 
              trend="neutral"
              icon={<Clock className="h-4 w-4" />} 
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7 mb-8">
            <RevenueChart />
            <div className="col-span-4 lg:col-span-4">
               <ProjectTable />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
