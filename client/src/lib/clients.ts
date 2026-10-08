import type { Entry } from "@/lib/finance";

export interface ClientSummary {
  name: string;
  jobs: Entry[];
  billed: number;
  collected: number;
  owed: number;
  overdue: number;
  first: Date | null;
  last: Date | null;
  methods: string[];
  notes: string[];
}

/** Rolls sheet entries up per client. Shared by Customers, Reviews and search. */
export function summariseClients(entries: Entry[]): ClientSummary[] {
  const map = new Map<string, ClientSummary>();
  for (const e of entries) {
    const c =
      map.get(e.client) ??
      { name: e.client, jobs: [], billed: 0, collected: 0, owed: 0, overdue: 0, first: null, last: null, methods: [], notes: [] };
    c.jobs.push(e);
    c.billed += e.total;
    c.collected += e.paid;
    c.owed += e.balance;
    if (e.state === "Overdue") c.overdue += e.balance;
    if (e.issued && (!c.first || e.issued < c.first)) c.first = e.issued;
    if (e.issued && (!c.last || e.issued > c.last)) c.last = e.issued;
    if (e.method && !c.methods.some((m) => m.toLowerCase() === e.method!.toLowerCase())) c.methods.push(e.method);
    const note = e.raw.notes?.trim();
    if (note && !c.notes.some((n) => n.toLowerCase() === note.toLowerCase())) c.notes.push(note);
    map.set(e.client, c);
  }
  return Array.from(map.values()).map((c) => ({
    ...c,
    jobs: c.jobs.sort((a, b) => (b.issued?.getTime() ?? 0) - (a.issued?.getTime() ?? 0)),
  }));
}
