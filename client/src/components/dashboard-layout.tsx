import { useState, useRef } from "react";
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
  Percent,
  FileText,
  CreditCard,
  CheckSquare,
  Folder
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import profileImage from "@assets/user_profile.jpg";
import logoImage from "@assets/nexaworks-logo.png";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Load from local storage on mount using lazy initialization
  const [currentProfileImage, setCurrentProfileImage] = useState(() => {
    return localStorage.getItem("profile_image") || profileImage;
  });

  const handleProfileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCurrentProfileImage(base64);
        localStorage.setItem("profile_image", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { icon: LayoutGrid, label: "Sales Overview", href: "/", active: true },
    { icon: Briefcase, label: "Projects", href: "/projects" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: FileText, label: "Invoices", href: "/invoices" },
    { icon: CreditCard, label: "Payments", href: "/payments" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
    { icon: CheckSquare, label: "Tasks", href: "/tasks" },
    { icon: Folder, label: "Files", href: "/files" },
  ];

  const productItems = [
    { icon: Percent, label: "Pricing", href: "/pricing" },
    { icon: MessageSquare, label: "Reviews", href: "/reviews" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-background hidden md:flex flex-col h-screen border-r border-border/0 relative z-20">
        {/* Fixed Header */}
        {/* Fixed Header */}
        <div className="px-4 pt-2 pb-0 flex items-center justify-center mb-0">
          <div className="w-full">
             <img src={logoImage} alt="Nexaworks Logo" className="w-full h-auto object-contain" />
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-6 space-y-8">
          {/* Menu Section */}
          <div>
            <h3 className="px-2 text-xs font-medium text-muted-foreground mb-4">Menu</h3>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer",
                    location === item.href 
                      ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(23,155,229,0.3)]"  
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Products Section */}
          <div>
            <h3 className="px-2 text-xs font-bold text-muted-foreground mb-4">Products</h3>
            <nav className="space-y-2">
              {productItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

           {/* General Section */}
           <div>
            <h3 className="px-2 text-xs font-bold text-muted-foreground mb-4">General</h3>
            <nav className="space-y-2">
                <Link href="/settings">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 cursor-pointer">
                    <Settings className="w-5 h-5" />
                    Settings
                  </div>
                </Link>
            </nav>
          </div>
        </div>

        {/* Fixed Footer / Logout */}
        <div className="p-6 mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
             <h1 className="text-2xl font-bold text-white">
               {location === "/projects" || location === "/invoices" ? "" : (
                 menuItems.find(item => item.href === location)?.label || 
                 productItems.find(item => item.href === location)?.label || 
                 (location === "/settings" ? "Settings" : "")
               )}
             </h1>
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
                 <div 
                    className="p-1 rounded-2xl border border-white/10 bg-card cursor-pointer hover:border-white/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                 >
                    <Avatar className="w-10 h-10 rounded-xl">
                      <AvatarImage src={currentProfileImage} alt="Dominion" className="object-cover w-full h-full" />
                      <AvatarFallback className="rounded-xl bg-primary text-primary-foreground font-bold">D</AvatarFallback>
                    </Avatar>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleProfileUpdate}
                    />
                 </div>
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto relative z-10 scrollbar-none">
          {children}
        </div>
      </main>
    </div>
  );
}
