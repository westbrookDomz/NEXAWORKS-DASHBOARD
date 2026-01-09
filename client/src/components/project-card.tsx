
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/mock-data";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "text-primary bg-primary/10 border-primary/20";
      case "Planning": return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
      case "Completed": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "On Hold": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-white bg-white/10";
    }
  };

  const getProgressColor = (status: string) => {
     switch (status) {
      case "In Progress": return "bg-primary";
      case "Planning": return "bg-zinc-500";
      case "Completed": return "bg-emerald-500";
      case "On Hold": return "bg-amber-500";
      default: return "bg-primary";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/5 p-6 rounded-3xl hover:bg-card/80 transition-all group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Section: Info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white">
            {project.logo}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-white tracking-tight">{project.title}</h3>
              <Badge variant="outline" className={cn("font-medium border px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider", getStatusColor(project.status))}>
                {project.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{project.client}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <div className="flex items-center gap-1.5">
                 <Clock className="w-3.5 h-3.5" />
                 {project.status === "Completed" ? `Completed ${project.completionDate}` : `Due ${project.dueDate}`}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Metrics & Actions */}
        <div className="flex items-center gap-8 flex-1 md:justify-end">
          
          {/* Budget */}
          <div className="text-right hidden md:block">
            <p className="text-xs text-muted-foreground font-medium mb-1">Budget</p>
            <p className="text-base font-bold text-white">{project.budget}</p>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-2 min-w-[140px]">
             <div className="flex justify-between text-xs font-medium">
               <span className="text-muted-foreground">Progress</span>
               <span className="text-white">{project.progress}%</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", getProgressColor(project.status))} 
                  style={{ width: `${project.progress}%` }}
                ></div>
             </div>
          </div>

          {/* Team */}
          <div className="flex -space-x-2 hidden lg:flex">
             {project.team.map((member, i) => (
                <Avatar key={i} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={`https://avatar.vercel.sh/${member}.svg?text=${member}`} />
                  <AvatarFallback className="text-[10px]">{member}</AvatarFallback>
                </Avatar>
             ))}
          </div>

          {/* Action */}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white rounded-full hover:bg-white/10">
            <MoreHorizontal className="w-5 h-5" />
          </Button>

        </div>
      </div>
    </Card>
  );
}
