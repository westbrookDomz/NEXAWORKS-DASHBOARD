import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Car, Utensils, Shirt } from "lucide-react";

const projects = [
  { name: "Sukabumi", revenue: "$111.0K", budget: "$150.7K", type: "Automotive", var: "-$39.0K", varPct: "-35.0%", icon: Car },
  { name: "Sydney", revenue: "$261.7K", budget: "$483.2K", type: "Food & drink", var: "-$35.0K", varPct: "-11.1%", icon: Utensils },
  { name: "Tangerang", revenue: "$213.0K", budget: "$110.1K", type: "Fashion", var: "$72.0K", varPct: "+3.1%", icon: Shirt },
];

export default function ProjectTable() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground pl-0">Franchise</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Revenue</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Budget</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Type</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground text-right">$Var</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-medium text-muted-foreground text-right pr-0">%Var</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project, i) => (
            <TableRow key={i} className="border-border/30 hover:bg-white/5 transition-colors group">
              <TableCell className="font-medium text-foreground pl-0 py-4">{project.name}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">{project.revenue}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">{project.budget}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <project.icon className="w-3 h-3" />
                  {project.type}
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground">{project.var}</TableCell>
              <TableCell className={cn("text-right font-mono text-xs pr-0", project.varPct.startsWith("+") ? "text-primary" : "text-muted-foreground")}>
                 {project.varPct}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { cn } from "@/lib/utils";
