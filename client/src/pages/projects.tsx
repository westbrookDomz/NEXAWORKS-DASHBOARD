
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import ProjectCard from "@/components/project-card";
import { type Payment } from "@shared/schema";
import { type Project } from "@/lib/mock-data";

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const projects = useMemo(() => {
    if (!payments) return [];

    const projectMap = new Map<string, Project>();

    payments.forEach(p => {
      // Normalize Title
      const title = p.projectTitle.trim();
      if (!title) return;

      const amount = parseFloat(p.totalAmount.replace(/[^0-9.-]+/g, "")) || 0;
      const paid = parseFloat(p.amountPaid.replace(/[^0-9.-]+/g, "")) || 0;
      const balance = parseFloat(p.balance.replace(/[^0-9.-]+/g, "")) || 0;

      if (projectMap.has(title)) {
        const existing = projectMap.get(title)!;
        // Update existing aggregation
        const currentBudget = parseFloat(existing.budget.replace(/[^0-9.-]+/g, "")) || 0;
        const newBudget = currentBudget + amount;
        
        // rudimentary progress recalc
        // We'll recalculate detailed progress after summing everything up if we wanted perfection, 
        // but for now let's just create a list of "raw" projects first then aggregate.
        // Actually, let's keep it simple: we rely on standardizing the project entry.
        // If there are multiple invoices, we sum them.
        
        // Store raw sums for final calculation
        existing.budget = (currentBudget + amount).toString(); 
        // We are using the string field to store temporary sum, allow me to handle this cleaner below.
      } else {
        // Create new
        const isCompleted = p.status === 'Paid' || balance <= 0;
        
        projectMap.set(title, {
          id: p.id,
          title: title,
          client: p.clientName,
          logo: p.clientName.charAt(0).toUpperCase(),
          budget: amount.toString(), // Temp storage
          status: isCompleted ? "Completed" : "In Progress",
          progress: 0, // calc later
          dueDate: p.date, // Use invoice date as proxy for start/due for now
          completionDate: p.paymentDate || undefined,
          team: ["User"] // Default
        });
      }
    });

    // Final Pass to format strings and calculate progress
    return Array.from(projectMap.values()).map(proj => {
        // Re-sum totals from the raw payments to be accurate
        const projectPayments = payments.filter(p => p.projectTitle.trim() === proj.title);
        const totalBudget = projectPayments.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount.replace(/[^0-9.-]+/g, "")) || 0), 0);
        const totalPaid = projectPayments.reduce((acc, curr) => acc + (parseFloat(curr.amountPaid.replace(/[^0-9.-]+/g, "")) || 0), 0);
        const totalBalance = projectPayments.reduce((acc, curr) => acc + (parseFloat(curr.balance.replace(/[^0-9.-]+/g, "")) || 0), 0);

        const progress = totalBudget > 0 ? Math.min(100, Math.round((totalPaid / totalBudget) * 100)) : 0;
        const isCompleted = totalBalance <= 0 && totalPaid > 0;
        
        return {
            ...proj,
            budget: `D${totalBudget.toLocaleString()}`,
            progress: progress,
            status: isCompleted ? "Completed" : "In Progress",
            // If completed, use the latest payment date. If active, use standard date
            completionDate: isCompleted ? projectPayments.map(p => p.paymentDate).sort().pop() : undefined
        } as Project;
    });

  }, [payments]);


  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProjects = filteredProjects.filter(p => p.status !== "Completed");
  const completedProjects = filteredProjects.filter(p => p.status === "Completed");

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-6 lg:px-8 pt-2 pb-6 animate-in-fade">
      
      {/* Header */}
      <div className="flex flex-col gap-6">
        
        {/* Top Row: Title & New Project Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Projects</h1>
            <p className="text-muted-foreground">Manage ongoing work and view project history.</p>
          </div>
          
          <Link href="/projects/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2">
                <Plus className="w-4 h-4" />
                New Project
            </Button>
          </Link>
        </div>

        {/* Bottom Row: Search & Filter */}
        <div className="flex items-center gap-3">
            <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
            <Input 
                placeholder="Search projects..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[300px] bg-black/20 border-white/10 text-sm focus-visible:ring-primary/20 rounded-xl"
            />
            </div>
            <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 rounded-xl">
            <Filter className="w-4 h-4" />
            </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading projects...</div>
      ) : (
        <>
            {/* Active Projects Section */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                Active Projects
                <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    {activeProjects.length}
                </span>
                </h2>
                <div className="space-y-4">
                    {activeProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                    ))}
                    {activeProjects.length === 0 && (
                    <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-muted-foreground">
                        No active projects found.
                    </div>
                    )}
                </div>
            </section>

            {/* Completed Projects Section */}
            {completedProjects.length > 0 && (
                <section className="space-y-4 pt-4">
                <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                    Recently Completed
                    <span className="text-xs font-normal text-muted-foreground/50 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    {completedProjects.length}
                </span>
                </h2>
                <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                    {completedProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
                </section>
            )}
        </>
      )}

    </div>
  );
}
