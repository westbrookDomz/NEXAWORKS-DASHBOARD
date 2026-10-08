import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { formatMoney, monthlySeries, type Entry } from "@/lib/finance";
import { easeOut, snappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
] as const;

/** Axis top that splits into four round steps (6k, 12k, 18k, 24k rather than 6.25k...). */
function niceTop(max: number): number {
  if (max <= 0) return 4000;
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * pow >= raw)!;
  return step * pow * 4;
}

function axisLabel(n: number): string {
  if (n === 0) return "0";
  return n >= 1000 ? `D${+(n / 1000).toFixed(1)}k` : `D${n}`;
}

/**
 * Monthly billing by issue month. Each bar is what was invoiced; the solid part is what has
 * been collected and the hatched remainder is still owed.
 */
export default function BillingBars({ entries, intro }: { entries: Entry[]; intro: boolean }) {
  const [range, setRange] = useState<6 | 12>(6);
  const series = useMemo(() => monthlySeries(entries, range), [entries, range]);
  const latestWithData = useMemo(() => {
    for (let i = series.length - 1; i >= 0; i--) if (series[i].invoiced > 0) return i;
    return series.length - 1;
  }, [series]);
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? latestWithData;

  const top = niceTop(Math.max(...series.map((m) => m.invoiced), 0));
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const current = series[active];
  const n = series.length;

  return (
    <section className="panel flex flex-col p-5 lg:p-6" aria-labelledby="billing-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="billing-title" className="text-lg">Monthly billing</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px] bg-primary" /> Collected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="hatch size-2.5 rounded-[3px] bg-primary/15 hatch-primary" /> Still owed
            </span>
          </div>
        </div>

        <div className="flex rounded-xl border border-line bg-raised p-1" role="group" aria-label="Range">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => {
                setRange(r.months);
                setHovered(null);
              }}
              aria-pressed={range === r.months}
              className={cn(
                "relative h-7 rounded-lg px-3 text-xs font-medium transition-colors",
                range === r.months ? "text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {range === r.months && (
                <motion.span layoutId="range-pill" className="absolute inset-0 rounded-lg bg-foreground" transition={snappy} />
              )}
              <span className="relative">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex min-h-[320px] flex-1 gap-3">
        {/* Y axis, positioned on the same scale as the gridlines */}
        <div className="w-10 shrink-0 pb-7 pt-14 text-right text-[11px] text-muted-foreground/80 tnum">
          <div className="relative h-full">
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 -translate-y-1/2 leading-none" style={{ top: `${(1 - t) * 100}%` }}>
                {axisLabel(top * t)}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col pt-14">
          {/* Plot (top padding leaves room for the tooltip over the tallest bar) */}
          <div className="relative flex-1">
            {ticks.map((t) => (
              <div
                key={t}
                className={cn("absolute inset-x-0 border-t", t === 0 ? "border-ink/10" : "border-dashed border-ink/[0.06]")}
                style={{ top: `${(1 - t) * 100}%` }}
              />
            ))}

            {/* Tooltip rides on a column-wide track so it can move with transform alone */}
            {current && current.invoiced > 0 && (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10" style={{ width: `${100 / n}%` }}>
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-[var(--ease-in-out)] motion-reduce:transition-none"
                  style={{ transform: `translateX(${active * 100}%)` }}
                >
                  <div
                    className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
                    style={{ bottom: `calc(${(current.invoiced / top) * 100}% + 10px)` }}
                  >
                    <div className="whitespace-nowrap rounded-xl bg-foreground px-3 py-1.5 text-center text-background shadow-[var(--shadow-pop)]">
                      <p className="figure text-sm font-semibold leading-tight">{formatMoney(current.invoiced)}</p>
                      {current.outstanding > 0 && (
                        <p className="tnum text-[11px] leading-tight text-background/60">{formatMoney(current.outstanding)} owed</p>
                      )}
                    </div>
                    <span className="mt-1.5 size-3 rounded-full border-[3px] border-foreground bg-background" />
                  </div>
                </div>
              </div>
            )}

            <div className="absolute inset-0 flex items-end">
              {series.map((m, i) => {
                const isActive = i === active;
                const h = m.invoiced > 0 ? (m.invoiced / top) * 100 : 0;
                const paidShare = m.invoiced > 0 ? (m.collected / m.invoiced) * 100 : 0;
                return (
                  <button
                    key={m.key}
                    className="group flex h-full min-w-0 flex-1 items-end justify-center px-1.5 outline-none sm:px-3"
                    onPointerEnter={() => setHovered(i)}
                    onPointerLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    aria-label={`${format(m.date, "MMMM yyyy")}: invoiced ${formatMoney(m.invoiced)}, collected ${formatMoney(m.collected)}`}
                  >
                    {h > 0 ? (
                      <motion.div
                        className={cn(
                          "relative flex w-full max-w-[64px] origin-bottom flex-col overflow-hidden rounded-[10px] transition-colors duration-200",
                          "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card",
                        )}
                        style={{ height: `${h}%` }}
                        initial={intro ? { transform: "scaleY(0)" } : false}
                        animate={{ transform: "scaleY(1)" }}
                        transition={{ duration: 0.65, delay: 0.1 + i * 0.05, ease: easeOut }}
                      >
                        <div
                          className={cn(
                            "hatch flex-1 transition-colors duration-200",
                            isActive
                              ? "bg-primary/15 hatch-primary"
                              : "bg-ink/[0.03] hatch-soft",
                          )}
                        />
                        <div
                          className={cn(
                            "transition-colors duration-200",
                            isActive ? "bg-primary" : "bg-ink/[0.14]",
                            // 2px surface gap between the collected and owed segments
                            paidShare > 0 && paidShare < 100 && "border-t-2 border-card",
                          )}
                          style={{ height: `${paidShare}%` }}
                        />
                      </motion.div>
                    ) : (
                      <div className="hatch h-1.5 w-full max-w-[64px] rounded-full bg-ink/[0.03] hatch-soft" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* X axis */}
          <div className="flex h-7 items-end">
            {series.map((m, i) => (
              <span
                key={m.key}
                className={cn(
                  "flex-1 text-center text-xs transition-colors duration-200",
                  i === active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
