import { useMemo } from "react";
import { format } from "date-fns";
import { Hourglass, Receipt, Users, Wallet } from "lucide-react";
import StatsCard from "@/components/stats-card";
import BillingBars from "@/components/billing-bars";
import CollectionGauge from "@/components/collection-gauge";
import RecentBilling from "@/components/recent-billing";
import TopClients from "@/components/top-clients";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import { useIntro } from "@/hooks/use-intro";
import { change, formatMoney, monthlySeries, sum } from "@/lib/finance";

const money = (n: number) => formatMoney(n);
const count = (n: number) => n.toLocaleString("en-US");

export default function Dashboard() {
  const { entries, isLoading, isError, refetch } = useEntries();
  const intro = useIntro("overview");

  const data = useMemo(() => {
    const series = monthlySeries(entries, 6);
    const latest = series[series.length - 1];
    const prev = series[series.length - 2];
    const spark = (key: "invoiced" | "collected" | "outstanding" | "clients") =>
      series.map((m) => ({ label: m.key, value: m[key] }));
    const firstDated = entries.map((e) => e.issued).filter(Boolean).sort((a, b) => a!.getTime() - b!.getTime())[0];

    return {
      series,
      latest,
      prev,
      spark,
      latestLabel: latest ? format(latest.date, "MMM yyyy") : "",
      latestShort: latest ? format(latest.date, "MMM") : "",
      span: firstDated && latest ? `${format(firstDated, "MMM")} to ${format(latest.date, "MMM yyyy")}` : null,
      billed: sum(entries, "total"),
      collected: sum(entries, "paid"),
      outstanding: sum(entries, "balance"),
      clients: new Set(entries.map((e) => e.client)).size,
      overdue: entries.filter((e) => e.state === "Overdue").length,
    };
  }, [entries]);

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Overview" />
        <div className="panel flex flex-col items-start gap-4 p-6">
          <div>
            <h2 className="text-lg">Couldn't load the payments sheet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Check the sheet connection in .env, then try again.</p>
          </div>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Overview" description="Loading the payments sheet" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[164px] rounded-[var(--radius-panel)] bg-card" />
          ))}
        </div>
        <div className="grid gap-3 xl:grid-cols-12">
          <Skeleton className="h-[440px] rounded-[var(--radius-panel)] bg-card xl:col-span-8" />
          <Skeleton className="h-[440px] rounded-[var(--radius-panel)] bg-card xl:col-span-4" />
        </div>
      </div>
    );
  }

  const { latest, prev, latestLabel, latestShort } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={data.span ? `Studio billing from ${data.span}. Month changes compare ${latestLabel} with the month before.` : "No billing records yet."}
      />

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total billed"
            value={data.billed}
            format={money}
            icon={<Receipt />}
            hue="primary"
            delta={latest && prev ? change(latest.invoiced, prev.invoiced) : null}
            note={latest ? `${formatMoney(latest.invoiced)} billed in ${latestShort}` : undefined}
            spark={data.spark("invoiced")}
            intro={intro}
          />
          <StatsCard
            title="Clients"
            value={data.clients}
            format={count}
            icon={<Users />}
            hue="violet"
            delta={latest && prev ? change(latest.clients, prev.clients) : null}
            note={latest ? `${latest.clients} billed in ${latestShort}` : undefined}
            spark={data.spark("clients")}
            intro={intro}
          />
          <StatsCard
            title="Outstanding"
            value={data.outstanding}
            format={money}
            icon={<Hourglass />}
            hue="amber"
            goodWhen="down"
            note={data.overdue ? `${data.overdue} ${data.overdue === 1 ? "invoice is" : "invoices are"} overdue` : "Nothing overdue"}
            spark={data.spark("outstanding")}
            intro={intro}
          />
          <StatsCard
            title="Collected"
            value={data.collected}
            format={money}
            icon={<Wallet />}
            hue="mint"
            delta={latest && prev ? change(latest.collected, prev.collected) : null}
            note={latest ? `${formatMoney(latest.collected)} of ${latestShort} billing` : undefined}
            spark={data.spark("collected")}
            intro={intro}
          />
        </div>

        <div className="grid gap-3 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <BillingBars entries={entries} intro={intro} />
          </div>
          <div className="xl:col-span-4 [&>section]:h-full">
            <CollectionGauge entries={entries} intro={intro} />
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-8">
            <RecentBilling entries={entries} />
          </div>
          <div className="xl:col-span-4 [&>section]:h-full">
            <TopClients entries={entries} intro={intro} />
          </div>
        </div>
      </div>
    </div>
  );
}
