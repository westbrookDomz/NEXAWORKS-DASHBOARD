import { useMemo, useState } from "react";
import ProjectCard, { type ProjectSummary } from "@/components/project-card";
import { PageHeader } from "@/components/page-header";
import { SearchField } from "@/components/filters";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import { useIntro } from "@/hooks/use-intro";

export default function Projects() {
  const { entries, isLoading } = useEntries();
  const [search, setSearch] = useState("");
  const intro = useIntro("projects");

  // A project is every sheet row sharing a title; repeat jobs for the same brief roll up together.
  const projects = useMemo(() => {
    const map = new Map<string, ProjectSummary>();
    for (const e of entries) {
      if (!e.project) continue;
      const p = map.get(e.project) ?? {
        title: e.project,
        client: e.client,
        jobs: 0,
        billed: 0,
        collected: 0,
        balance: 0,
        started: e.issued,
        settledOn: null,
        overdue: false,
      };
      p.jobs += 1;
      p.billed += e.total;
      p.collected += e.paid;
      p.balance += e.balance;
      if (e.issued && (!p.started || e.issued < p.started)) p.started = e.issued;
      if (e.paidOn && (!p.settledOn || e.paidOn > p.settledOn)) p.settledOn = e.paidOn;
      if (e.state === "Overdue") p.overdue = true;
      map.set(e.project, p);
    }
    return Array.from(map.values()).sort((a, b) => (b.started?.getTime() ?? 0) - (a.started?.getTime() ?? 0));
  }, [entries]);

  const q = search.trim().toLowerCase();
  const filtered = projects.filter((p) => !q || p.title.toLowerCase().includes(q) || p.client.toLowerCase().includes(q));
  const open = filtered.filter((p) => p.balance > 0);
  const settled = filtered.filter((p) => p.balance <= 0);

  const group = (title: string, list: ProjectSummary[], offset: number, empty: string) => (
    <section className="panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4 lg:px-6">
        <h2 className="text-base">{title}</h2>
        <span className="tnum rounded-md bg-raised px-1.5 py-0.5 text-xs text-muted-foreground">{list.length}</span>
      </div>
      {list.length ? (
        <ul>
          {list.map((p, i) => (
            <ProjectCard key={p.title} project={p} intro={intro} index={offset + i} />
          ))}
        </ul>
      ) : (
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Each brief on the sheet, with how much of its billing has been collected."
        actions={<SearchField value={search} onChange={setSearch} placeholder="Search projects or clients" />}
      />

      {isLoading ? (
        <Skeleton className="h-80 rounded-[var(--radius-panel)] bg-card" />
      ) : (
        <div className="space-y-3">
          {group("Awaiting payment", open, 0, q ? "No open projects match." : "Every project is paid up.")}
          {group("Paid in full", settled, open.length, q ? "No settled projects match." : "Settled projects will show here.")}
        </div>
      )}
    </div>
  );
}
