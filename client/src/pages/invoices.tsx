import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { SearchField, SegmentedFilter } from "@/components/filters";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import { formatDate, formatMoney, PAYMENT_TERMS_DAYS } from "@/lib/finance";

const FILTERS = ["All", "Paid", "Pending", "Overdue"] as const;
type Filter = (typeof FILTERS)[number];

export default function Invoices() {
  const { entries, isLoading } = useEntries();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  // Only rows with a real invoice number; the sheet also logs jobs billed without one.
  const invoices = useMemo(
    () => entries.filter((e) => e.invoiceNo).sort((a, b) => (b.issued?.getTime() ?? 0) - (a.issued?.getTime() ?? 0)),
    [entries],
  );

  const counts = useMemo(() => {
    const c: Partial<Record<Filter, number>> = { All: invoices.length };
    for (const s of ["Paid", "Pending", "Overdue"] as const) c[s] = invoices.filter((e) => e.state === s).length;
    return c;
  }, [invoices]);

  const rows = invoices.filter((e) => {
    const q = search.trim().toLowerCase();
    return (filter === "All" || e.state === filter) && (!q || e.invoiceNo!.toLowerCase().includes(q) || e.client.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description={`Invoices issued from the studio sheet. Unpaid invoices are overdue ${PAYMENT_TERMS_DAYS} days after issue.`}
      />

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <SearchField value={search} onChange={setSearch} placeholder="Search invoice numbers or clients" />
          <SegmentedFilter id="invoice-filter" label="Status" options={FILTERS} value={filter} onChange={setFilter} counts={counts} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="bg-sunken text-left text-xs text-muted-foreground">
                <th className="py-2.5 pl-5 font-medium lg:pl-6">Invoice</th>
                <th className="py-2.5 font-medium">Client</th>
                <th className="py-2.5 font-medium">Issued</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="py-2.5 pr-5 text-right font-medium lg:pr-6">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }, (_, i) => (
                  <tr key={i} className="border-t border-line">
                    <td colSpan={5} className="px-5 py-3">
                      <Skeleton className="h-8 w-full bg-raised" />
                    </td>
                  </tr>
                ))}
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-line transition-colors hover:bg-ink/[0.02]">
                  <td className="py-3 pl-5 lg:pl-6">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-lg bg-raised text-muted-foreground">
                        <FileText className="size-4" />
                      </span>
                      <span className="tnum font-medium">{e.invoiceNo}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">{e.client}</td>
                  <td className="py-3 pr-4">
                    <span className="tnum block">{formatDate(e.issued)}</span>
                    <span className="tnum block text-xs text-muted-foreground">
                      {e.state === "Paid" && e.paidOn ? `Paid ${formatDate(e.paidOn)}` : `Due ${formatDate(e.due)}`}
                    </span>
                  </td>
                  <td className="py-3">
                    <StatusBadge state={e.state} />
                  </td>
                  <td className="tnum py-3 pr-5 text-right font-medium lg:pr-6">{formatMoney(e.total, { decimals: true })}</td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <p className="font-medium">{invoices.length ? "No invoices match." : "No invoices yet."}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {invoices.length ? "Try another number, client or status." : "Add an invoice number to a row in the sheet and it will show here."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
