import { Switch, Route } from "wouter";
import { MotionConfig } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import Payments from "@/pages/payments";
import Placeholder from "@/pages/placeholder";
import Projects from "@/pages/projects";
import Reports from "@/pages/reports";
import Login from "@/pages/login";
import Customers from "@/pages/customers";
import Tasks from "@/pages/tasks";
import Files from "@/pages/files";
import Pricing from "@/pages/pricing";
import Reviews from "@/pages/reviews";
import { useAuth } from "@/hooks/use-auth";

import DashboardLayout from "@/components/dashboard-layout";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/projects" component={Projects} />
        <Route path="/customers" component={Customers} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/payments" component={Payments} />
        <Route path="/reports" component={Reports} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/files" component={Files} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/settings">{() => <Placeholder title="Settings" />}</Route>
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Gate() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="h-dvh bg-background" />;
  return user ? <Router /> : <Login />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Honour the OS reduced-motion setting everywhere Motion is used */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <Toaster />
          <Gate />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
