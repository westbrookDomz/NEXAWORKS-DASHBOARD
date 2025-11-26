import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutGrid, 
  BarChart3, 
  FolderKanban, 
  Settings, 
  Search, 
  Bell, 
  Briefcase,
  LogOut,
  HelpCircle,
  MessageSquare,
  ShoppingBag,
  Users,
  Percent
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import profileImage from "@assets/generated_images/professional_creative_director_headshot.png";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/", active: true },
    { icon: ShoppingBag, label: "Orders", href: "/orders", badge: "12" },
    { icon: BarChart3, label: "Insights", href: "/insights" },
    { icon: FolderKanban, label: "Updates", href: "/updates" },
  ];

  const productItems = [
    { icon: Briefcase, label: "Store", href: "/store", badge: "50+" },
    { icon: Percent, label: "Discount", href: "/discount" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: MessageSquare, label: "Feedback", href: "/feedback" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-background hidden md:flex flex-col h-screen overflow-y-auto scrollbar-none p-6 border-r border-border/0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 text-primary animate-pulse-slow">
             {/* Simple Star/Spark Icon similar to reference */}
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
               <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
             </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Nexaworks</span>
        </div>

        <div className="space-y-8 flex-1">
          {/* Menu Section */}
          <div>
            <h3 className="px-2 text-xs font-medium text-muted-foreground mb-4">Menu</h3>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer",
                    item.active 
                      ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(233,249,54,0.3)]" 
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        item.active ? "bg-black/10 text-black" : "bg-white/10 text-white"
                      )}>{item.badge}</span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Products Section */}
          <div>
            <h3 className="px-2 text-xs font-medium text-muted-foreground mb-4">Products</h3>
            <nav className="space-y-2">
              {productItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className="text-xs bg-white text-black px-1.5 py-0.5 rounded font-bold">{item.badge}</span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

           {/* General Section */}
           <div>
            <h3 className="px-2 text-xs font-medium text-muted-foreground mb-4">General</h3>
            <nav className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 cursor-pointer">
                  <Settings className="w-5 h-5" />
                  Settings
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 cursor-pointer">
                  <HelpCircle className="w-5 h-5" />
                  Help Desk
                </div>
            </nav>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <Button variant="outline" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 border-none bg-white/5 h-12 rounded-xl">
            <LogOut className="w-5 h-5 mr-3" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen bg-background overflow-hidden relative">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

        {/* Header */}
        <header className="h-24 px-8 flex items-center justify-between shrink-0 relative z-10">
           <div className="flex-1 max-w-md">
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
               <Input 
                 placeholder="Search product" 
                 className="pl-12 bg-card border-none h-12 rounded-2xl text-sm focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 text-xs text-muted-foreground">
                  <span className="border border-white/10 px-1.5 rounded bg-white/5">K</span>
                  <span className="border border-white/10 px-1.5 rounded bg-white/5">⌘</span>
               </div>
             </div>
           </div>

           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-card text-muted-foreground hover:text-white border border-white/5">
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-card text-muted-foreground hover:text-white border border-white/5 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <div className="flex items-center gap-3 pl-2">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-white leading-none mb-1">Dominion</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                 </div>
                 <div className="p-1 rounded-2xl border border-white/10 bg-card">
                    <Avatar className="w-10 h-10 rounded-xl cursor-pointer">
                      <AvatarImage src={profileImage} alt="Dominion" />
                      <AvatarFallback className="rounded-xl bg-primary text-primary-foreground font-bold">D</AvatarFallback>
                    </Avatar>
                 </div>
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 pt-0 relative z-10 scrollbar-none">
          {children}
        </div>
      </main>
    </div>
  );
}
