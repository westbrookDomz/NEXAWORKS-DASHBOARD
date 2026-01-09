import { Switch, Route } from "wouter";
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

import DashboardLayout from "@/components/dashboard-layout";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/projects" component={Projects} />
        <Route path="/customers" component={() => <Placeholder title="Customers" />} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/payments" component={Payments} />
        <Route path="/reports" component={Reports} />
        <Route path="/tasks" component={() => <Placeholder title="Tasks" />} />
        <Route path="/files" component={() => <Placeholder title="Files" />} />
        <Route path="/pricing" component={() => <Placeholder title="Pricing" />} />
        <Route path="/reviews" component={() => <Placeholder title="Reviews" />} />
        <Route path="/settings" component={() => <Placeholder title="Settings" />} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
