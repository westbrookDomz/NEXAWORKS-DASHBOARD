import { motion } from "framer-motion";
import { formatDate, formatMoney } from "@/lib/finance";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface ProjectSummary {
  title: string;
  client: string;
  jobs: number;
  billed: number;
  collected: number;
  balance: number;
  started: Date | null;
  settledOn: Date | null;
  overdue: boolean;
}

/** One project: how much of its billing has come in. Solid = collected, hatched track = still owed. */
export default function ProjectCard({ project, intro, index }: { project: ProjectSummary; intro: boolean; index: number }) {
  const progress = project.billed ? Math.min(100, Math.round((project.collected / project.billed) * 100)) : 0;
  const done = project.balance <= 0 && project.collected > 0;

  return (
    <li className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 border-t border-line px-5 py-4 first:border-t-0 md:grid-cols-[auto_minmax(0,1fr)_120px_220px] lg:px-6">
      <span className="grid size-10 place-items-center rounded-xl bg-raised font-display text-base font-semibold">
        {project.client.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0">
        <p className="truncate font-medium" title={project.title}>
          {project.title}
        </p>
        <p className="mt-0.5 flex gap-3 truncate text-sm text-muted-foreground">
          <span className="truncate">
            {project.client}
            {project.jobs > 1 && `, ${project.jobs} jobs`}
          </span>
          <span className="tnum shrink-0 text-muted-foreground/70">
            {done && project.settledOn ? `Settled ${formatDate(project.settledOn)}` : project.started ? `Started ${formatDate(project.started)}` : ""}
          </span>
        </p>
      </div>

      <div className="col-start-2 md:col-start-auto md:text-right">
        <p className="text-xs text-muted-foreground">Billed</p>
        <p className="figure text-[15px] font-semibold">{formatMoney(project.billed)}</p>
      </div>

      <div className="col-start-2 md:col-start-auto">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className={cn(done ? "text-mint" : project.overdue ? "text-vermilion" : "text-muted-foreground")}>
            {done ? "Paid in full" : project.overdue ? `${formatMoney(project.balance)} overdue` : `${formatMoney(project.balance)} to collect`}
          </span>
          <span className="tnum font-medium">{progress}%</span>
        </div>
        <div className="hatch h-2 overflow-hidden rounded-full bg-ink/[0.04] hatch-soft">
          <motion.div
            className={cn("h-full origin-left rounded-full", done ? "bg-mint" : "bg-primary")}
            style={{ width: `${progress}%` }}
            initial={intro ? { transform: "scaleX(0)" } : false}
            animate={{ transform: "scaleX(1)" }}
            transition={{ duration: 0.7, delay: 0.1 + Math.min(index, 8) * 0.04, ease: easeOut }}
          />
        </div>
      </div>
    </li>
  );
}
