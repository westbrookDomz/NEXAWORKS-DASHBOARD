import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Repeat, UserRound, Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import StatsCard from "@/components/stats-card";
import { StatusBadge } from "@/components/status-badge";
import { SearchField, SegmentedFilter } from "@/components/filters";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import { useIntro } from "@/hooks/use-intro";
import { summariseClients, type ClientSummary } from "@/lib/clients";
import { formatDate, formatMoney } from "@/lib/finance";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SORTS = ["Most billed", "Recent", "Owing"] as const;
type Sort = (typeof SORTS)[number];

function CollectedBar({ client, intro, delay }: { client: ClientSummary; intro: boolean; delay: number }) {
  const share = client.billed ? (client.collected / client.billed) * 100 : 0;
  return (
    <div className="hatch hatch-soft h-2 overflow-hidden rounded-full bg-ink/[0.04]">
      <motion.div
        className={cn("h-full origin-left rounded-full", client.owed > 0 ? "bg-primary" : "bg-mint")}
        style={{ width: `${share}%` }}
        initial={intro ? { transform: "scaleX(0)" } : false}
        animate={{ transform: "scaleX(1)" }}
        transition={{ duration: 0.6, delay, ease: easeOut }}
      />
    </div>
  );
}

function ClientCard({ client, onOpen, intro, index }: { client: ClientSummary; onOpen: () => void; intro: boolean; index: number }) {
  return (
    <button
      onClick={onOpen}
      className="panel flex flex-col p-5 text-left transition-colors duration-150 hover:border-ink/15"
      aria-label={`${client.name}: open job history`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-raised font-display text-lg font-semibold">
          {client.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[17px] font-semibold">{client.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {client.jobs.length} {client.jobs.length === 1 ? "job" : "jobs"} since {formatDate(client.first, "MMM yyyy")}
          </p>
        </div>
        {client.overdue > 0 ? (
          <StatusBadge state="Overdue" />
        ) : client.owed > 0 ? (
          <StatusBadge state="Pending" />
        ) : (
          <StatusBadge state="Paid" />
        )}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-muted-foreground">Billed</dt>
          <dd className="figure mt-0.5 text-lg font-semibold">{formatMoney(client.billed)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{client.owed > 0 ? "Still owed" : "Collected"}</dt>
          <dd className={cn("figure mt-0.5 text-lg font-semibold", client.overdue > 0 ? "text-vermilion" : client.owed > 0 && "text-amber")}>
            {formatMoney(client.owed > 0 ? client.owed : client.collected)}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <CollectedBar client={client} intro={intro} delay={0.1 + Math.min(index, 8) * 0.04} />
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {client.methods.map((m) => (
          <span key={m} className="rounded-md border border-line px-2 py-0.5 text-[11px] text-muted-foreground">
            {m}
          </span>
        ))}
        {client.notes.map((n) => (
          <span key={n} className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
            {n}
          </span>
        ))}
      </div>
    </button>
  );
}

function ClientSheet({ client, onClose }: { client: ClientSummary | null; onClose: () => void }) {
  return (
    <Sheet open={Boolean(client)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 border-line p-0 sm:max-w-md">
        {client && (
          <>
            <div className="border-b border-line p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-raised font-display text-xl font-semibold">
                  {client.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <SheetTitle className="font-display text-xl">{client.name}</SheetTitle>
                  <SheetDescription>
                    Client since {formatDate(client.first, "MMMM yyyy")}, last job {formatDate(client.last, "d MMM yyyy")}
                  </SheetDescription>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ["Billed", client.billed, ""],
                  ["Collected", client.collected, ""],
                  ["Owed", client.owed, client.overdue > 0 ? "text-vermilion" : client.owed > 0 ? "text-amber" : ""],
                ].map(([label, value, tone]) => (
                  <div key={label as string} className="rounded-xl bg-raised p-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className={cn("figure mt-0.5 font-semibold", tone as string)}>{formatMoney(value as number)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <p className="px-3 pb-2 pt-2 text-xs font-medium text-muted-foreground">Job history</p>
              <ul>
                {client.jobs.map((e) => (
                  <li key={e.id} className="flex items-start justify-between gap-4 rounded-xl px-3 py-3 hover:bg-ink/[0.03]">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{e.project}</p>
                      <p className="tnum mt-0.5 text-xs text-muted-foreground">
                        {formatDate(e.issued)}
                        {e.invoiceNo ? `, invoice ${e.invoiceNo}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="tnum text-sm font-medium">{formatMoney(e.total)}</span>
                      <StatusBadge state={e.state} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function Customers() {
  const { entries, isLoading } = useEntries();
  const intro = useIntro("customers");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("Most billed");
  const [openName, setOpenName] = useState<string | null>(null);

  const clients = useMemo(() => summariseClients(entries), [entries]);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = clients.filter((c) => !q || c.name.toLowerCase().includes(q) || c.jobs.some((j) => j.project.toLowerCase().includes(q)));
    if (sort === "Recent") return list.sort((a, b) => (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0));
    if (sort === "Owing") return list.sort((a, b) => b.owed - a.owed || b.billed - a.billed);
    return list.sort((a, b) => b.billed - a.billed);
  }, [clients, search, sort]);

  const repeat = clients.filter((c) => c.jobs.length > 1).length;
  const owing = clients.filter((c) => c.owed > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Everyone the studio has billed, what they've paid and what they still owe." />

      <div className="grid gap-3 md:grid-cols-3">
        <StatsCard title="Clients" value={clients.length} format={(n) => `${n}`} icon={<UserRound />} hue="violet" note="On the payments sheet" intro={intro} />
        <StatsCard
          title="Come back for more"
          value={repeat}
          format={(n) => `${n}`}
          icon={<Repeat />}
          hue="primary"
          note={clients.length ? `${Math.round((repeat / clients.length) * 100)}% have booked more than one job` : undefined}
          intro={intro}
        />
        <StatsCard
          title="Owe money"
          value={owing.length}
          format={(n) => `${n}`}
          icon={<Wallet />}
          hue="amber"
          note={owing.length ? `${formatMoney(owing.reduce((a, c) => a + c.owed, 0))} between them` : "Everyone is paid up"}
          intro={intro}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField value={search} onChange={setSearch} placeholder="Search clients or projects" />
        <SegmentedFilter id="customer-sort" label="Sort" options={SORTS} value={sort} onChange={setSort} />
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-60 rounded-[var(--radius-panel)] bg-card" />
          ))}
        </div>
      ) : shown.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((c, i) => (
            <ClientCard key={c.name} client={c} index={i} intro={intro} onOpen={() => setOpenName(c.name)} />
          ))}
        </div>
      ) : (
        <div className="panel px-6 py-14 text-center">
          <p className="font-medium">{clients.length ? "No clients match." : "No clients yet."}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length ? "Try another name or project." : "Clients appear here once they're on the payments sheet."}
          </p>
        </div>
      )}

      <ClientSheet client={clients.find((c) => c.name === openName) ?? null} onClose={() => setOpenName(null)} />
    </div>
  );
}
