import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { snappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field h-10 pl-9 pr-9"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** A row of options where one pill slides to the chosen one (radio-style filter from the franchise reference). */
export function SegmentedFilter<T extends string>({
  id,
  options,
  value,
  onChange,
  counts,
  label,
}: {
  id: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  counts?: Partial<Record<T, number>>;
  label: string;
}) {
  return (
    <div className="flex h-10 items-center rounded-xl border border-line bg-raised p-1" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o)}
            className={cn(
              "relative flex h-full items-center gap-1.5 rounded-lg px-3 text-sm transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-lg bg-ink/[0.08]" transition={snappy} />}
            <span className="relative">{o}</span>
            {counts?.[o] != null && <span className="tnum relative text-xs text-muted-foreground">{counts[o]}</span>}
          </button>
        );
      })}
    </div>
  );
}
