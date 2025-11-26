import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

const projects = [
  { id: "P-001", client: "Acme Corp", project: "Brand Identity Redesign", status: "In Progress", budget: "$12,500", due: "2024-12-15" },
  { id: "P-002", client: "TechStart", project: "Web App UI Kit", status: "Completed", budget: "$8,200", due: "2024-11-20" },
  { id: "P-003", client: "Global Ventures", project: "Investor Pitch Deck", status: "Pending", budget: "$4,500", due: "2024-12-05" },
  { id: "P-004", client: "Neon Cafe", project: "Social Media Assets", status: "In Progress", budget: "$2,800", due: "2024-12-10" },
  { id: "P-005", client: "Elevate", project: "Marketing Website", status: "Completed", budget: "$15,000", due: "2024-11-15" },
];

export default function ProjectTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = projects.filter(p => 
    p.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="glass-panel border-border/50 col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium">Recent Projects</CardTitle>
          <CardDescription>Track your active client work and status</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9 bg-background/50 border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="p-2 bg-background/50 border border-border rounded-md hover:bg-accent/50 cursor-pointer transition-colors">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground">ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Client</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Project</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground text-right">Budget</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground text-right">Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id} className="border-border/50 hover:bg-white/5 transition-colors">
                <TableCell className="font-mono text-muted-foreground text-xs">{project.id}</TableCell>
                <TableCell className="font-medium">{project.client}</TableCell>
                <TableCell>{project.project}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      project.status === "In Progress" ? "border-blue-500/50 text-blue-400 bg-blue-500/10" :
                      project.status === "Completed" ? "border-primary/50 text-primary bg-primary/10" :
                      "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                    }
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{project.budget}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">{project.due}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
