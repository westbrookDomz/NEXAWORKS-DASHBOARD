import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Copy, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ClientCombobox } from "@/components/client-combobox";
import { Button } from "@/components/ui/button";
import { useEntries } from "@/hooks/use-entries";
import { newId, useLocalStore } from "@/hooks/use-local-store";
import { useToast } from "@/hooks/use-toast";
import { summariseClients } from "@/lib/clients";
import { formatDate } from "@/lib/finance";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  client: string;
  rating: number;
  quote: string;
  project?: string;
  date: number;
}

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-amber text-amber" : "text-ink/20")} />
      ))}
    </span>
  );
}

/** Star input: hover previews, and the chosen star gives a small pop (rare action, so a little delight is fine). */
function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const reduce = useReducedMotion();
  const shown = hover || value;
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating" onPointerLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onPointerEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          animate={value === n && !reduce ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, times: [0, 0.35, 1], ease: easeOut }}
          className="grid size-9 place-items-center rounded-lg transition-colors hover:bg-amber/10"
        >
          <Star className={cn("size-6 transition-colors duration-100", n <= shown ? "fill-amber text-amber" : "text-ink/25")} />
        </motion.button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { entries } = useEntries();
  const { toast } = useToast();
  const [reviews, setReviews] = useLocalStore<Review[]>("studio-reviews", []);
  const [client, setClient] = useState("");
  const [rating, setRating] = useState(0);
  const [quote, setQuote] = useState("");

  const clients = useMemo(() => summariseClients(entries), [entries]);

  const average = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  // Paid-up clients without a review yet: the best moment to ask.
  const askable = clients
    .filter((c) => c.owed === 0 && !reviews.some((r) => r.client === c.name))
    .sort((a, b) => (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0))
    .slice(0, 3);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.trim() || !rating) return;
    const latest = clients.find((c) => c.name === client)?.jobs[0];
    setReviews((prev) => [{ id: newId(), client: client.trim(), rating, quote: quote.trim(), project: latest?.project, date: Date.now() }, ...prev]);
    setClient("");
    setRating(0);
    setQuote("");
    toast({ title: "Review saved" });
  };

  const ask = async (name: string, project?: string) => {
    const message = `Hi ${name}, thank you for working with Nexaworks${project ? ` on ${project}` : ""}. If you were happy with the result, would you share a line or two about the experience? It really helps the studio.`;
    try {
      await navigator.clipboard.writeText(message);
      toast({ title: "Message copied", description: `Paste it into your chat with ${name}.` });
    } catch {
      toast({ variant: "destructive", title: "Couldn't copy", description: "Your browser blocked clipboard access." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="What clients say about the work. Saved in this browser; keep the best ones for the portfolio." />

      <div className="grid gap-3 xl:grid-cols-12">
        {/* Summary */}
        <section className="panel p-5 lg:p-6 xl:col-span-4" aria-labelledby="rating-title">
          <h2 id="rating-title" className="text-lg">Rating</h2>
          <div className="mt-4 flex items-end gap-3">
            <span className="figure text-[52px] font-semibold leading-none">{reviews.length ? average.toFixed(1) : "–"}</span>
            <div className="pb-1.5">
              <Stars value={average} />
              <p className="mt-1 text-xs text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
          <ul className="mt-6 space-y-2.5">
            {distribution.map((d, i) => (
              <li key={d.n} className="flex items-center gap-3 text-xs">
                <span className="tnum w-3 text-muted-foreground">{d.n}</span>
                <div className="hatch hatch-soft h-2 flex-1 overflow-hidden rounded-full bg-ink/[0.04]">
                  <div
                    className="h-full origin-left rounded-full bg-amber transition-transform duration-300 ease-[var(--ease-out)] motion-reduce:transition-none"
                    style={{ transform: `scaleX(${d.count / maxCount})`, transitionDelay: `${i * 30}ms` }}
                  />
                </div>
                <span className="tnum w-4 text-right text-muted-foreground">{d.count}</span>
              </li>
            ))}
          </ul>

          {askable.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-sm font-medium">Ask for a review</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Paid-up clients who haven't left one yet.</p>
              <ul className="mt-3 space-y-1">
                {askable.map((c) => (
                  <li key={c.name} className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 hover:bg-ink/[0.03]">
                    <span className="truncate text-sm">{c.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => ask(c.name, c.jobs[0]?.project)}>
                      <Copy />
                      Copy request
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Log a review */}
        <form onSubmit={save} className="panel flex flex-col gap-4 p-5 lg:p-6 xl:col-span-8" aria-labelledby="log-title">
          <div>
            <h2 id="log-title" className="text-lg">Log a review</h2>
            <p className="mt-1 text-sm text-muted-foreground">Write down what a client said after a job.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="review-client" className="text-sm font-medium">Client</label>
              <ClientCombobox id="review-client" value={client} onChange={setClient} options={clients.map((c) => c.name)} />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium">Rating</span>
              <StarInput value={rating} onChange={setRating} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="review-quote" className="text-sm font-medium">What they said</label>
            <textarea
              id="review-quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={3}
              className="field h-auto resize-none py-3"
              placeholder="“The flyers were ready a day early and looked better than we imagined.”"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!client.trim() || !rating}>
              Save review
            </Button>
          </div>
        </form>
      </div>

      {reviews.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {reviews.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: easeOut }}
                className="panel group relative flex flex-col p-5"
              >
                <Stars value={r.rating} />
                {r.quote && <blockquote className="mt-4 font-display text-[17px] leading-snug">“{r.quote}”</blockquote>}
                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.client}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.project ? `${r.project}, ` : ""}
                      {formatDate(new Date(r.date))}
                    </p>
                  </div>
                  <button
                    onClick={() => setReviews((prev) => prev.filter((x) => x.id !== r.id))}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-vermilion/10 hover:text-vermilion"
                    aria-label={`Delete review from ${r.client}`}
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="hatch hatch-faint rounded-[var(--radius-panel)] border border-dashed border-line px-6 py-12 text-center">
          <p className="font-medium">No reviews yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Log what a client said after a job, or copy a review request for a paid-up client.</p>
        </div>
      )}
    </div>
  );
}
