import { useMemo } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import { useIntro } from "@/hooks/use-intro";
import { downloadCsv } from "@/lib/csv";
import { formatMoney, monthlySeries } from "@/lib/finance";
import { easeOut } from "@/lib/motion";

const axisTick = { fill: "#8a93a3", fontSize: 12 };
const kLabel = (v: number) => (v >= 1000 ? `D${+(v / 1000).toFixed(1)}k` : `D${v}`);

export default function Reports() {
  const { entries, isLoading } = useEntries();
  const intro = useIntro("reports");

  const months = useMemo(() => monthlySeries(entries, 12), [entries]);
  const chart = months.map((m) => ({ name: m.label, full: format(m.date, "MMMM yyyy"), billed: m.invoiced, collected: m.collected }));

  const clients = useMemo(() => {
    const map = new Map<string, { name: string; billed: number; collected: number }>();
    for (const e of entries) {
      const c = map.get(e.client) ?? { name: e.client, billed: 0, collected: 0 };
      c.billed += e.total;
      c.collected += e.paid;
      map.set(e.client, c);
    }
    return Array.from(map.values()).sort((a, b) => b.billed - a.billed);
  }, [entries]);
  const maxClient = clients[0]?.billed || 1;

  const exportMonths = () =>
    downloadCsv(
      "nexaworks-monthly-report.csv",
      ["Month", "Billed", "Collected", "Outstanding"],
      months.map((m) => [format(m.date, "MMM yyyy"), m.invoiced, m.collected, m.outstanding]),
    );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" />
        <Skeleton className="h-[420px] rounded-[var(--radius-panel)] bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Twelve months of billing and collection, ending with the latest month on the sheet."
        actions={
          <Button variant="outline" onClick={exportMonths} disabled={!months.length}>
            <Download />
            Export CSV
          </Button>
        }
      />

      <div className="space-y-3">
        <div className="grid gap-3 xl:grid-cols-12">
          <section className="panel p-5 lg:p-6 xl:col-span-8" aria-labelledby="trend-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 id="trend-title" className="text-lg">Billed and collected</h2>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded-full bg-primary" /> Collected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0 w-4 border-t-2 border-dashed border-white/50" /> Billed
                </span>
              </div>
            </div>
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="collected-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#179be5" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#179be5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgb(255 255 255 / 0.06)" strokeDasharray="4 4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={axisTick} tickFormatter={kLabel} width={52} />
                  <Tooltip
                    cursor={{ stroke: "rgb(255 255 255 / 0.25)", strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof chart)[number];
                      return (
                        <div className="rounded-xl border border-line bg-popover px-3 py-2 text-xs shadow-[0_8px_24px_rgb(0_0_0/0.4)]">
                          <p className="mb-1 font-medium">{d.full}</p>
                          <p className="tnum flex justify-between gap-6 text-muted-foreground">
                            Collected <span className="text-foreground">{formatMoney(d.collected)}</span>
                          </p>
                          <p className="tnum flex justify-between gap-6 text-muted-foreground">
                            Billed <span className="text-foreground">{formatMoney(d.billed)}</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke="#179be5"
                    strokeWidth={2}
                    fill="url(#collected-fill)"
                    activeDot={{ r: 5, stroke: "#14171c", strokeWidth: 2, fill: "#179be5" }}
                    isAnimationActive={intro}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="billed"
                    stroke="rgb(255 255 255 / 0.5)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 4, stroke: "#14171c", strokeWidth: 2, fill: "#eef1f5" }}
                    isAnimationActive={intro}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel p-5 lg:p-6 xl:col-span-4" aria-labelledby="clients-title">
            <h2 id="clients-title" className="text-lg">By client</h2>
            <p className="mt-1 text-sm text-muted-foreground">Billed, with the collected part solid.</p>
            <ul className="mt-5 space-y-4">
              {clients.slice(0, 6).map((c, i) => (
                <li key={c.name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate">{c.name}</span>
                    <span className="tnum shrink-0 text-muted-foreground">{formatMoney(c.billed)}</span>
                  </div>
                  <div className="mt-1.5 h-2.5" style={{ width: `${(c.billed / maxClient) * 100}%` }}>
                    <motion.div
                      className="hatch flex h-full origin-left overflow-hidden rounded-full bg-primary/10 [--hatch-color:rgb(23_155_229/0.7)]"
                      initial={intro ? { transform: "scaleX(0)" } : false}
                      animate={{ transform: "scaleX(1)" }}
                      transition={{ duration: 0.6, delay: 0.15 + i * 0.05, ease: easeOut }}
                    >
                      <div className="h-full rounded-full bg-primary" style={{ width: `${c.billed ? (c.collected / c.billed) * 100 : 0}%` }} />
                    </motion.div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Monthly breakdown: the table view of the chart above, with an inline collection bar */}
        <section className="panel overflow-hidden" aria-labelledby="breakdown-title">
          <h2 id="breakdown-title" className="px-5 pb-4 pt-5 text-lg lg:px-6">Monthly breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-black/25 text-left text-xs text-muted-foreground">
                  <th className="py-2.5 pl-5 font-medium lg:pl-6">Month</th>
                  <th className="py-2.5 text-right font-medium">Billed</th>
                  <th className="py-2.5 text-right font-medium">Collected</th>
                  <th className="py-2.5 text-right font-medium">Outstanding</th>
                  <th className="py-2.5 pl-8 pr-5 font-medium lg:pr-6">Collection rate</th>
                </tr>
              </thead>
              <tbody>
                {[...months].reverse().filter((m) => m.invoiced > 0).map((m) => {
                  const rate = Math.round((m.collected / m.invoiced) * 100);
                  return (
                    <tr key={m.key} className="border-t border-line transition-colors hover:bg-white/[0.02]">
                      <td className="py-3 pl-5 font-medium lg:pl-6">{format(m.date, "MMMM yyyy")}</td>
                      <td className="tnum py-3 text-right">{formatMoney(m.invoiced)}</td>
                      <td className="tnum py-3 text-right">{formatMoney(m.collected)}</td>
                      <td className={`tnum py-3 text-right ${m.outstanding > 0 ? "text-amber" : "text-muted-foreground"}`}>
                        {formatMoney(m.outstanding)}
                      </td>
                      <td className="py-3 pl-8 pr-5 lg:pr-6">
                        <div className="flex items-center gap-3">
                          <div className="hatch h-2 flex-1 overflow-hidden rounded-full bg-white/[0.04] [--hatch-color:rgb(255_255_255/0.14)]">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="tnum w-10 text-right">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
