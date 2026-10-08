import { useMemo } from "react";
import { motion } from "framer-motion";
import { BadgePercent, Scissors, Tags } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import StatsCard from "@/components/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import { useIntro } from "@/hooks/use-intro";
import { useLocalStore } from "@/hooks/use-local-store";
import { formatMoney, toNumber, type Entry } from "@/lib/finance";
import { easeOut } from "@/lib/motion";

/** Services the studio sells, matched from project titles on the sheet. First match wins. */
const SERVICES: { id: string; label: string; match: RegExp }[] = [
  { id: "flyers", label: "Flyers and adverts", match: /flyer|advert|poster/i },
  { id: "banners", label: "Banners and signage", match: /banner|signage|roll[- ]?up|billboard/i },
  { id: "logos", label: "Logos and identity", match: /logo|brand|identity/i },
  { id: "cards", label: "Business cards and stationery", match: /business card|letterhead|stationery/i },
  { id: "documents", label: "Documents, manuals and plans", match: /manual|document|report|plan|slides|powerpoint|profile|booklet|magazine/i },
  { id: "other", label: "Other design work", match: /.*/ },
];

interface ServiceStats {
  id: string;
  label: string;
  jobs: Entry[];
  min: number;
  max: number;
  avg: number;
  median: number;
  discountAvg: number;
}

function stats(entries: Entry[]): ServiceStats[] {
  return SERVICES.map((s) => {
    const jobs = entries.filter((e) => SERVICES.find((x) => x.match.test(e.project))?.id === s.id);
    const prices = jobs.map((e) => toNumber(e.raw.agreedAmount) || e.total).sort((a, b) => a - b);
    const charged = jobs.map((e) => toNumber(e.raw.amountCharged));
    const discounts = jobs.map((e, i) => (charged[i] ? toNumber(e.raw.discount) / charged[i] : 0));
    return {
      id: s.id,
      label: s.label,
      jobs,
      min: prices[0] ?? 0,
      max: prices[prices.length - 1] ?? 0,
      avg: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      median: prices.length ? prices[Math.floor(prices.length / 2)] : 0,
      discountAvg: discounts.length ? (discounts.reduce((a, b) => a + b, 0) / discounts.length) * 100 : 0,
    };
  }).filter((s) => s.jobs.length > 0);
}

const roundPrice = (n: number) => Math.round(n / 100) * 100;

export default function Pricing() {
  const { entries, isLoading } = useEntries();
  const intro = useIntro("pricing");
  const [listPrices, setListPrices] = useLocalStore<Record<string, number>>("studio-list-prices", {});

  const services = useMemo(() => stats(entries), [entries]);
  const scaleMax = Math.max(...services.map((s) => Math.max(s.max, listPrices[s.id] ?? 0)), 1) * 1.08;

  const discounted = entries.filter((e) => toNumber(e.raw.discount) > 0);
  const totalDiscount = discounted.reduce((a, e) => a + toNumber(e.raw.discount), 0);
  const totalCharged = entries.reduce((a, e) => a + toNumber(e.raw.amountCharged), 0);
  const biggest = [...discounted].sort((a, b) => toNumber(b.raw.discount) - toNumber(a.raw.discount)).slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing"
        description="What the studio has charged for each kind of work, from every job on the sheet. Set a list price to quote from."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatsCard title="Discounts given" value={totalDiscount} format={(n) => formatMoney(n)} icon={<Scissors />} hue="amber" note="Taken off quoted prices" intro={intro} />
        <StatsCard
          title="Average discount"
          value={totalCharged ? Math.round((totalDiscount / totalCharged) * 100) : 0}
          format={(n) => `${n}%`}
          icon={<BadgePercent />}
          hue="violet"
          note="Of everything quoted"
          intro={intro}
        />
        <StatsCard
          title="Jobs discounted"
          value={discounted.length}
          format={(n) => `${n}`}
          icon={<Tags />}
          hue="primary"
          note={`Out of ${entries.length} jobs`}
          intro={intro}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <section className="panel overflow-hidden xl:col-span-8" aria-labelledby="rates-title">
          <div className="flex flex-wrap items-end justify-between gap-3 p-5 pb-4 lg:px-6">
            <div>
              <h2 id="rates-title" className="text-lg">Rate card</h2>
              <p className="mt-1 text-sm text-muted-foreground">List prices are saved in this browser.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-5 rounded-full bg-primary/45" /> Range charged
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2 border-card bg-primary ring-1 ring-primary" /> Average
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-0.5 rounded-full bg-foreground" /> List price
              </span>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="m-5 h-64 bg-raised" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="bg-sunken text-left text-xs text-muted-foreground">
                    <th className="py-2.5 pl-5 font-medium lg:pl-6">Service</th>
                    <th className="w-[38%] py-2.5 font-medium">What you've charged</th>
                    <th className="py-2.5 pl-6 text-right font-medium">Avg discount</th>
                    <th className="py-2.5 pl-6 pr-5 text-right font-medium lg:pr-6">List price</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => {
                    const list = listPrices[s.id];
                    return (
                      <tr key={s.id} className="border-t border-line">
                        <td className="py-3.5 pl-5 lg:pl-6">
                          <p className="font-medium">{s.label}</p>
                          <p className="tnum text-xs text-muted-foreground">
                            {s.jobs.length} {s.jobs.length === 1 ? "job" : "jobs"}, avg {formatMoney(s.avg)}
                          </p>
                        </td>
                        <td className="py-3.5">
                          <div className="hatch hatch-faint relative h-3 rounded-full bg-ink/[0.04]" title={`${formatMoney(s.min)} to ${formatMoney(s.max)}`}>
                            <motion.div
                              className="absolute inset-y-0 origin-left rounded-full bg-primary/45"
                              style={{ left: `${(s.min / scaleMax) * 100}%`, width: `max(12px, ${((s.max - s.min) / scaleMax) * 100}%)` }}
                              initial={intro ? { transform: "scaleX(0)" } : false}
                              animate={{ transform: "scaleX(1)" }}
                              transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: easeOut }}
                            />
                            <span
                              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary"
                              style={{ left: `${(s.avg / scaleMax) * 100}%` }}
                            />
                            {list ? (
                              <span
                                className="absolute -top-1 h-5 w-0.5 -translate-x-1/2 rounded-full bg-foreground transition-[left] duration-200"
                                style={{ left: `${(list / scaleMax) * 100}%` }}
                              />
                            ) : null}
                          </div>
                          <div className="tnum mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                            <span>{formatMoney(s.min)}</span>
                            <span>{formatMoney(s.max)}</span>
                          </div>
                        </td>
                        <td className="tnum py-3.5 pl-6 text-right text-muted-foreground">{s.discountAvg.toFixed(0)}%</td>
                        <td className="py-3.5 pl-6 pr-5 text-right lg:pr-6">
                          <label className="relative inline-flex items-center">
                            <span className="sr-only">List price for {s.label}</span>
                            <span className="pointer-events-none absolute left-3 text-sm text-muted-foreground">D</span>
                            <input
                              type="number"
                              min={0}
                              step={100}
                              inputMode="numeric"
                              value={list ?? ""}
                              placeholder={String(roundPrice(s.median))}
                              onChange={(e) =>
                                setListPrices((p) => {
                                  const next = { ...p };
                                  if (e.target.value === "") delete next[s.id];
                                  else next[s.id] = Number(e.target.value);
                                  return next;
                                })
                              }
                              className="field tnum h-9 w-28 pl-7 text-right"
                            />
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel p-5 lg:p-6 xl:col-span-4" aria-labelledby="discounts-title">
          <h2 id="discounts-title" className="text-lg">Biggest discounts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Quoted price against what was agreed.</p>
          <ul className="mt-5 space-y-4">
            {biggest.map((e) => {
              const charged = toNumber(e.raw.amountCharged);
              const agreed = toNumber(e.raw.agreedAmount);
              return (
                <li key={e.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium">{e.client}</p>
                    <p className="tnum shrink-0 text-sm text-amber">−{formatMoney(toNumber(e.raw.discount))}</p>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{e.project}</p>
                  {/* Agreed (solid) inside quoted (hatched): the hatched end is what was given away */}
                  <div className="hatch hatch-amber mt-2 h-2 overflow-hidden rounded-full bg-amber/10">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${charged ? (agreed / charged) * 100 : 0}%` }} />
                  </div>
                  <p className="tnum mt-1 text-[11px] text-muted-foreground">
                    Quoted {formatMoney(charged)}, agreed {formatMoney(agreed)}
                  </p>
                </li>
              );
            })}
            {!biggest.length && <li className="text-sm text-muted-foreground">No discounts on the sheet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
