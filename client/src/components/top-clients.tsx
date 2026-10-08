import { useMemo } from "react";
import { motion } from "framer-motion";
import { formatMoney, type Entry } from "@/lib/finance";
import { easeOut } from "@/lib/motion";

/** Biggest client by money billed, then the runners-up by share. */
export default function TopClients({ entries, intro }: { entries: Entry[]; intro: boolean }) {
  const clients = useMemo(() => {
    const map = new Map<string, { name: string; jobs: number; invoiced: number; collected: number }>();
    for (const e of entries) {
      const c = map.get(e.client) ?? { name: e.client, jobs: 0, invoiced: 0, collected: 0 };
      c.jobs += 1;
      c.invoiced += e.total;
      c.collected += e.paid;
      map.set(e.client, c);
    }
    return Array.from(map.values()).sort((a, b) => b.invoiced - a.invoiced);
  }, [entries]);

  const top = clients[0];
  const rest = clients.slice(1, 4);
  const total = clients.reduce((a, c) => a + c.invoiced, 0) || 1;

  if (!top) return null;
  const collectedH = top.invoiced ? (top.collected / top.invoiced) * 100 : 0;

  return (
    <section className="panel flex flex-col p-5 lg:p-6" aria-labelledby="top-title">
      <h2 id="top-title" className="text-lg">Top client</h2>

      <div className="mt-4 flex gap-4">
        <div className="min-w-0 flex-1 rounded-2xl border border-line bg-raised/60 p-4">
          <p className="truncate font-display text-lg font-semibold">{top.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {top.jobs} {top.jobs === 1 ? "job" : "jobs"}, {Math.round((top.invoiced / total) * 100)}% of billing
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-2">
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" /> Collected
              </dt>
              <dd className="figure mt-0.5 text-[15px] font-semibold">{formatMoney(top.collected)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="hatch size-2 rounded-full bg-primary/20 hatch-primary" /> Billed
              </dt>
              <dd className="figure mt-0.5 text-[15px] font-semibold">{formatMoney(top.invoiced)}</dd>
            </div>
          </dl>
        </div>

        {/* Twin bars from the franchise reference: billed (hatched) beside collected (solid) */}
        <div className="flex h-[132px] items-end gap-2 self-end" aria-hidden="true">
          <motion.div
            className="w-9 origin-bottom rounded-[10px] bg-primary"
            style={{ height: `${Math.max(6, collectedH)}%` }}
            initial={intro ? { transform: "scaleY(0)" } : false}
            animate={{ transform: "scaleY(1)" }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
          />
          <motion.div
            className="hatch h-full w-9 origin-bottom rounded-[10px] bg-primary/15 hatch-primary"
            initial={intro ? { transform: "scaleY(0)" } : false}
            animate={{ transform: "scaleY(1)" }}
            transition={{ duration: 0.6, delay: 0.36, ease: easeOut }}
          />
        </div>
      </div>

      {rest.length > 0 && (
        <ul className="mt-5 space-y-3 border-t border-line pt-5">
          {rest.map((c, i) => (
            <li key={c.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{c.name}</span>
                <span className="tnum shrink-0 text-muted-foreground">{formatMoney(c.invoiced)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.05]">
                <motion.div
                  className="h-full origin-left rounded-full bg-ink/30"
                  style={{ width: `${(c.invoiced / top.invoiced) * 100}%` }}
                  initial={intro ? { transform: "scaleX(0)" } : false}
                  animate={{ transform: "scaleX(1)" }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.05, ease: easeOut }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
