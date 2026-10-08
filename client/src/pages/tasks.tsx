import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProjectSelect } from "@/components/project-select";
import { Button } from "@/components/ui/button";
import { useEntries } from "@/hooks/use-entries";
import { newId, useLocalStore } from "@/hooks/use-local-store";
import { formatMoney } from "@/lib/finance";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Status = "todo" | "doing" | "done";

interface Task {
  id: string;
  title: string;
  project?: string;
  status: Status;
  created: number;
  /** Sheet entry this task follows up on, so the suggestion isn't offered twice. */
  source?: string;
}

const COLUMNS: { id: Status; label: string; empty: string }[] = [
  { id: "todo", label: "To do", empty: "Nothing waiting. Add a task above." },
  { id: "doing", label: "In progress", empty: "Move a task here when you start it." },
  { id: "done", label: "Done", empty: "Finished tasks land here." },
];

const NEXT: Record<Status, Status> = { todo: "doing", doing: "done", done: "todo" };

// Cards travel between columns with a short, nearly bounce-free spring.
const move = { type: "spring", duration: 0.4, bounce: 0.12 } as const;

function TaskCard({ task, onMove, onToggle, onDelete }: { task: Task; onMove: () => void; onToggle: () => void; onDelete: () => void }) {
  const done = task.status === "done";
  return (
    <motion.li
      layout
      layoutId={task.id}
      // Layout projection owns this element's transform, so scale uses Motion's own prop here.
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={move}
      className="group panel flex items-start gap-3 rounded-2xl p-3.5"
    >
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className={cn(
          "pressable mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-150",
          done ? "border-mint bg-mint text-background" : "border-ink/25 hover:border-primary",
        )}
      >
        <AnimatePresence initial={false}>
          {done && (
            <motion.span initial={{ opacity: 0, transform: "scale(0.6)" }} animate={{ opacity: 1, transform: "scale(1)" }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: easeOut }}>
              <Check className="size-3" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm leading-snug transition-colors", done && "text-muted-foreground line-through decoration-ink/30")}>{task.title}</p>
        {task.project && <p className="mt-1.5 truncate text-xs text-muted-foreground">{task.project}</p>}
      </div>

      <div className="flex shrink-0 gap-0.5">
        <button
          onClick={onMove}
          className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-ink/[0.06] hover:text-foreground"
          aria-label={done ? "Reopen" : task.status === "todo" ? "Start" : "Finish"}
          title={done ? "Reopen" : task.status === "todo" ? "Start" : "Finish"}
        >
          {done ? <RotateCcw className="size-3.5" /> : <ArrowRight className="size-3.5" />}
        </button>
        <button
          onClick={onDelete}
          className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-vermilion/10 hover:text-vermilion"
          aria-label={`Delete "${task.title}"`}
          title="Delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </motion.li>
  );
}

export default function Tasks() {
  const { entries } = useEntries();
  const [tasks, setTasks] = useLocalStore<Task[]>("studio-tasks", []);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");

  const projects = useMemo(() => Array.from(new Set(entries.map((e) => e.project).filter(Boolean))).sort(), [entries]);

  // Overdue invoices become one-click follow-up tasks.
  const suggestions = useMemo(
    () =>
      entries
        .filter((e) => e.state === "Overdue" && !tasks.some((t) => t.source === e.id))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 3),
    [entries, tasks],
  );

  const add = (t: Omit<Task, "id" | "created" | "status">) =>
    setTasks((prev) => [{ ...t, id: newId(), created: Date.now(), status: "todo" }, ...prev]);
  const update = (id: string, patch: Partial<Task>) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    add({ title: title.trim(), project: project || undefined });
    setTitle("");
  };

  const open = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={tasks.length ? `${open} open, ${tasks.length - open} done. Saved in this browser.` : "Studio to-dos, saved in this browser."}
      />

      <form onSubmit={submit} className="panel flex flex-col gap-2 p-3 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task, like 'Send final files to NHIA'"
          aria-label="Task"
          className="field flex-1"
        />
        <ProjectSelect value={project} onChange={setProject} projects={projects} label="Project" className="sm:w-64" />
        <Button type="submit" className="h-11" disabled={!title.trim()}>
          <Plus />
          Add task
        </Button>
      </form>

      {suggestions.length > 0 && (
        <section className="rounded-[var(--radius-panel)] border border-dashed border-vermilion/30 bg-vermilion/[0.04] p-4" aria-labelledby="followups">
          <h2 id="followups" className="text-sm font-semibold">Suggested follow-ups</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">These invoices are overdue on the sheet.</p>
          <ul className="mt-3 flex flex-col gap-2 lg:flex-row">
            {suggestions.map((e) => (
              <li key={e.id} className="flex flex-1 items-center justify-between gap-3 rounded-xl bg-card px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm">Chase {e.client}</p>
                  <p className="tnum truncate text-xs text-vermilion">{formatMoney(e.balance)} overdue</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => add({ title: `Chase ${e.client} for ${formatMoney(e.balance)}`, project: e.project, source: e.id })}
                >
                  <Plus />
                  Add
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <LayoutGroup>
        <div className="grid gap-3 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const list = tasks.filter((t) => t.status === col.id);
            return (
              <section key={col.id} className="rounded-[var(--radius-panel)] border border-line bg-ink/[0.02] p-2" aria-labelledby={`col-${col.id}`}>
                <div className="flex items-center gap-2 px-2.5 pb-2 pt-1.5">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      col.id === "todo" && "hatch hatch-strong bg-ink/10",
                      col.id === "doing" && "bg-primary",
                      col.id === "done" && "bg-mint",
                    )}
                  />
                  <h2 id={`col-${col.id}`} className="text-sm font-semibold">{col.label}</h2>
                  <span className="tnum text-xs text-muted-foreground">{list.length}</span>
                </div>
                <ul className="flex min-h-[120px] flex-col gap-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {list.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onMove={() => update(t.id, { status: NEXT[t.status] })}
                        onToggle={() => update(t.id, { status: t.status === "done" ? "todo" : "done" })}
                        onDelete={() => remove(t.id)}
                      />
                    ))}
                  </AnimatePresence>
                  {list.length === 0 && (
                    <li className="hatch hatch-faint grid flex-1 place-items-center rounded-2xl border border-dashed border-line px-4 py-8 text-center text-xs text-muted-foreground">
                      {col.empty}
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
