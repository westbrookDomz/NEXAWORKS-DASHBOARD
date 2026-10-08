import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type Hue = "primary" | "violet" | "amber" | "mint";

const HUE: Record<Hue, { solid: string; hatch: string; text: string }> = {
  primary: { solid: "bg-primary", hatch: "[--hatch-color:rgb(23_155_229/0.55)] bg-primary/10", text: "text-primary" },
  violet: { solid: "bg-violet", hatch: "[--hatch-color:rgb(139_124_246/0.55)] bg-violet/10", text: "text-violet" },
  amber: { solid: "bg-amber", hatch: "[--hatch-color:rgb(242_181_68/0.55)] bg-amber/10", text: "text-amber" },
  mint: { solid: "bg-mint", hatch: "[--hatch-color:rgb(63_211_163/0.55)] bg-mint/10", text: "text-mint" },
};

interface StatsCardProps {
  title: string;
  value: number;
  format: (n: number) => string;
  icon?: ReactNode;
  /** Month-over-month change in percent; null when there is no prior month to compare. */
  delta?: number | null;
  /** Whether a rise is good news. Outstanding balance going up is not. */
  goodWhen?: "up" | "down";
  note?: string;
  hue?: Hue;
  /** Recent monthly values, oldest first. The latest month is drawn solid, earlier ones hatched. */
  spark?: { label: string; value: number }[];
  intro?: boolean;
}

export default function StatsCard({
  title,
  value,
  format,
  icon,
  delta,
  goodWhen = "up",
  note,
  hue = "primary",
  spark,
  intro = false,
}: StatsCardProps) {
  const h = HUE[hue];
  const max = spark ? Math.max(...spark.map((s) => s.value), 1) : 1;
  const good = delta == null ? null : goodWhen === "up" ? delta >= 0 : delta <= 0;

  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon && (
          <div className={cn("grid size-9 shrink-0 place-items-center rounded-[10px] bg-raised [&_svg]:size-[18px]", h.text)}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <AnimatedNumber
          value={value}
          format={format}
          from={intro ? 0 : value}
          className="figure text-[30px] font-semibold leading-none text-foreground"
        />
        {delta != null && (
          <span
            className={cn(
              "tnum inline-flex h-6 items-center gap-0.5 rounded-md px-1.5 text-xs font-medium",
              good ? "bg-mint/10 text-mint" : "bg-vermilion/10 text-vermilion",
            )}
          >
            {delta >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-5">
        {note && <p className="text-xs leading-snug text-muted-foreground">{note}</p>}
        {spark && spark.length > 0 && (
          <div className="flex h-9 shrink-0 items-end gap-1" aria-hidden="true">
            {spark.map((s, i) => {
              const last = i === spark.length - 1;
              return (
                <motion.span
                  key={s.label}
                  className={cn("w-2.5 origin-bottom rounded-[3px]", last ? h.solid : cn("hatch", h.hatch))}
                  style={{ height: `${Math.max(10, (s.value / max) * 100)}%` }}
                  initial={intro ? { transform: "scaleY(0)" } : false}
                  animate={{ transform: "scaleY(1)" }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.04, ease: easeOut }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
