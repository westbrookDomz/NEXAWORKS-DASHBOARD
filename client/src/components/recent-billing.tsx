import { useMemo } from "react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney, type Entry } from "@/lib/finance";

const ORDER = { Overdue: 0, Pending: 1, Paid: 2 } as const;

/** Latest jobs billed, with anything unpaid pulled to the top. */
export default function RecentBilling({ entries }: { entries: Entry[] }) {
  const rows = useMemo(
    () =>
      [...entries]
        .sort(
          (a, b) =>
            ORDER[a.state] - ORDER[b.state] || (b.issued?.getTime() ?? 0) - (a.issued?.getTime() ?? 0),
        )
        .slice(0, 6),
    [entries],
  );

  return (
    <section className="panel overflow-hidden" aria-labelledby="recent-title">
      <div className="flex items-center justify-between gap-4 p-5 pb-4 lg:px-6">
        <div>
          <h2 id="recent-title" className="text-lg">Recent billing</h2>
          <p className="mt-1 text-sm text-muted-foreground">Unpaid work first, then the newest jobs.</p>
        </div>
        <Link
          href="/payments"
          className="pressable shrink-0 rounded-xl border border-line bg-raised px-3.5 py-2 text-sm font-medium transition-colors hover:bg-white/[0.07]"
        >
          All payments
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-black/25 text-left text-xs text-muted-foreground">
              <th className="py-2.5 pl-5 font-medium lg:pl-6">Client</th>
              <th className="py-2.5 font-medium">Project</th>
              <th className="py-2.5 font-medium">Issued</th>
              <th className="py-2.5 font-medium">Status</th>
              <th className="py-2.5 pr-5 text-right font-medium lg:pr-6">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-t border-line transition-colors hover:bg-white/[0.02]">
                <td className="py-3 pl-5 lg:pl-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-raised font-display text-sm font-semibold text-foreground">
                      {e.client.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium">{e.client}</span>
                  </div>
                </td>
                <td className="max-w-[260px] truncate py-3 pr-4 text-muted-foreground" title={e.project}>
                  {e.project}
                </td>
                <td className="tnum whitespace-nowrap py-3 pr-4 text-muted-foreground">{formatDate(e.issued)}</td>
                <td className="py-3">
                  <StatusBadge state={e.state} />
                </td>
                <td className="py-3 pr-5 text-right lg:pr-6">
                  <span className="tnum font-medium">{formatMoney(e.total)}</span>
                  {e.balance > 0 && (
                    <span className="tnum block text-xs text-muted-foreground">{formatMoney(e.balance)} owed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
