import { Hourglass, Receipt, Wallet } from "lucide-react";
import PaymentsTable from "@/components/payments-table";
import StatsCard from "@/components/stats-card";
import { PageHeader } from "@/components/page-header";
import { useEntries } from "@/hooks/use-entries";
import { formatMoney, sum } from "@/lib/finance";

const money = (n: number) => formatMoney(n);

export default function Payments() {
  const { entries } = useEntries();
  const billed = sum(entries, "total");
  const collected = sum(entries, "paid");
  const outstanding = sum(entries, "balance");
  const share = billed ? Math.round((collected / billed) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="What each client was billed, what they've paid and what's left." />
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <StatsCard title="Billed" value={billed} format={money} icon={<Receipt />} hue="primary" note={`${entries.length} jobs on the sheet`} />
          <StatsCard title="Collected" value={collected} format={money} icon={<Wallet />} hue="mint" note={`${share}% of everything billed`} />
          <StatsCard
            title="Outstanding"
            value={outstanding}
            format={money}
            icon={<Hourglass />}
            hue="amber"
            note={`${entries.filter((e) => e.balance > 0).length} jobs still owe money`}
          />
        </div>
        <PaymentsTable />
      </div>
    </div>
  );
}
