import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutGrid, 
  BarChart3, 
  FolderKanban, 
  Settings, 
  Search, 
  User, 
  Moon, 
  Bell, 
  ChevronDown,
  MapPin,
  Briefcase,
  Circle,
  CheckCircle2,
  Star,
  Maximize2,
  Users
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import profileImage from "@assets/generated_images/professional_creative_director_headshot.png";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-background border-r border-border/40 hidden md:flex flex-col h-screen overflow-y-auto scrollbar-none">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background font-bold text-xl">
            N
          </div>
          <span className="font-bold text-lg tracking-tight">Nexaworks</span>
        </div>

        <div className="px-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 bg-card border-none h-10 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>
        </div>

        <div className="flex-1 px-4 space-y-8">
          {/* Filter Section */}
          <div>
            <h3 className="px-2 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Filter</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground hover:bg-card rounded-xl h-10 px-3">
                <span className="flex items-center gap-3">
                  <FolderKanban className="w-4 h-4" />
                  Unpaid Invoices
                </span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
              <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground hover:bg-card rounded-xl h-10 px-3">
                <span className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4" />
                  Client Tag
                </span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </div>
          </div>

          {/* Timeframe Section */}
          <div>
            <h3 className="px-2 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Timeframe</h3>
            <RadioGroup defaultValue="month" className="space-y-1">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-card cursor-pointer group">
                <RadioGroupItem value="month" id="month" className="border-muted-foreground text-primary" />
                <Label htmlFor="month" className="text-sm font-medium text-foreground cursor-pointer flex-1">This Month</Label>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-card cursor-pointer group">
                <RadioGroupItem value="year" id="year" className="border-muted-foreground text-primary" />
                <Label htmlFor="year" className="text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer flex-1">This Year</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Status Section */}
           <div>
            <h3 className="px-2 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Status</h3>
            <RadioGroup defaultValue="all" className="space-y-1">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-card cursor-pointer group">
                <RadioGroupItem value="all" id="all" className="border-muted-foreground text-primary" />
                <Label htmlFor="all" className="text-sm font-medium text-foreground cursor-pointer flex-1">All</Label>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-card cursor-pointer group">
                <RadioGroupItem value="pending" id="pending" className="border-muted-foreground text-primary" />
                <Label htmlFor="pending" className="text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer flex-1">Pending Payment</Label>
              </div>
               <div className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-card cursor-pointer group">
                <RadioGroupItem value="completed" id="completed" className="border-muted-foreground text-primary" />
                <Label htmlFor="completed" className="text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer flex-1">Completed</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* CTA Card */}
        <div className="p-4 mt-4">
          <div className="bg-gradient-to-br from-primary/80 to-primary p-5 rounded-2xl text-primary-foreground relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>

             <div className="relative z-10">
               <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3">
                 <div className="w-4 h-4 text-white">⚡</div>
               </div>
               <h4 className="font-semibold text-sm leading-tight mb-1">Generate Invoice</h4>
               <p className="text-xs text-primary-foreground/80 mb-4 leading-relaxed">Create a new invoice quickly</p>
               
               <Button variant="secondary" size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-none justify-between group">
                 Create Now
                 <span className="group-hover:translate-x-1 transition-transform">→</span>
               </Button>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen bg-background overflow-hidden">
        {/* Header */}
        <header className="h-20 px-8 border-b border-border/40 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-8">
              <h1 className="text-xl font-medium">Financial Overview</h1>
              
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1.5 rounded-lg bg-card border border-border/50 text-sm text-muted-foreground">
                   Admin
                 </div>
                 <div className="flex items-center gap-2 text-sm font-medium">
                   Dominion
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Star className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Maximize2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="h-8 w-px bg-border mx-1"></div>
              <Avatar className="w-10 h-10 border border-border cursor-pointer">
                <AvatarImage src={profileImage} alt="Dominion" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
          {children}
        </div>
      </main>
    </div>
  );
}
