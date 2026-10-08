import { useMemo, useState } from "react";
import { useSearch } from "wouter";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { SearchField, SegmentedFilter } from "@/components/filters";
import { useEntries } from "@/hooks/use-entries";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatMoney, type PaymentState } from "@/lib/finance";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Paid", "Pending", "Overdue"] as const;
type Filter = (typeof FILTERS)[number];

export default function PaymentsTable() {
  const { entries, isLoading, refetch, isFetching } = useEntries();
  const params = new URLSearchParams(useSearch());
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [filter, setFilter] = useState<Filter>("All");

  const counts = useMemo(() => {
    const c: Partial<Record<Filter, number>> = { All: entries.length };
    for (const s of ["Paid", "Pending", "Overdue"] as PaymentState[]) c[s] = entries.filter((e) => e.state === s).length;
    return c;
  }, [entries]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries
      .filter((e) => filter === "All" || e.state === filter)
      .filter((e) => !q || e.client.toLowerCase().includes(q) || e.project.toLowerCase().includes(q))
      .sort((a, b) => (b.issued?.getTime() ?? 0) - (a.issued?.getTime() ?? 0));
  }, [entries, search, filter]);

  const exportRows = () =>
    downloadCsv(
      "nexaworks-payments.csv",
      ["Issued", "Client", "Project", "Status", "Amount", "Paid", "Balance", "Paid on", "Method"],
      rows.map((e) => [formatDate(e.issued), e.client, e.project, e.state, e.total, e.paid, e.balance, formatDate(e.paidOn), e.method ?? ""]),
    );

  return (
    <section className="panel overflow-hidden" aria-labelledby="payments-title">
      <div className="flex flex-col gap-4 p-5 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="payments-title" className="text-lg">All payments</h2>
            <p className="mt-1 text-sm text-muted-foreground">Every job from the studio sheet, newest first.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn(isFetching && "animate-spin")} />
              {isFetching ? "Syncing" : "Sync sheet"}
            </Button>
            <Button variant="outline" onClick={exportRows} disabled={!rows.length}>
              <Download />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField value={search} onChange={setSearch} placeholder="Search clients or projects" />
          <SegmentedFilter id="payments-filter" label="Status" options={FILTERS} value={filter} onChange={setFilter} counts={counts} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-black/25 text-left text-xs text-muted-foreground">
              <th className="py-2.5 pl-5 font-medium lg:pl-6">Issued</th>
              <th className="py-2.5 font-medium">Client</th>
              <th className="py-2.5 font-medium">Project</th>
              <th className="py-2.5 font-medium">Status</th>
              <th className="py-2.5 text-right font-medium">Amount</th>
              <th className="py-2.5 pr-5 text-right font-medium lg:pr-6">Balance</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="border-t border-line">
                  <td colSpan={6} className="px-5 py-3">
                    <Skeleton className="h-6 w-full bg-raised" />
                  </td>
                </tr>
              ))}
            {rows.map((e) => (
              <tr key={e.id} className="border-t border-line transition-colors hover:bg-white/[0.02]">
                <td className="tnum whitespace-nowrap py-3 pl-5 text-muted-foreground lg:pl-6">{formatDate(e.issued)}</td>
                <td className="py-3 pr-4 font-medium">{e.client}</td>
                <td className="max-w-[300px] truncate py-3 pr-4 text-muted-foreground" title={e.project}>
                  {e.project}
                </td>
                <td className="py-3">
                  <StatusBadge state={e.state} />
                </td>
                <td className="tnum py-3 text-right font-medium">{formatMoney(e.total, { decimals: true })}</td>
                <td className="tnum py-3 pr-5 text-right lg:pr-6">
                  {e.balance > 0 ? (
                    <span className={e.state === "Overdue" ? "text-vermilion" : "text-amber"}>{formatMoney(e.balance, { decimals: true })}</span>
                  ) : (
                    <span className="text-muted-foreground">Settled</span>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <p className="font-medium">No payments match.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try another name or status.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearch("");
                      setFilter("All");
                    }}
                  >
                    Clear filters
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
