import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE = "__none";

/** Themed project picker. Radix Select can't hold an empty value, so "no project" uses a sentinel. */
export function ProjectSelect({
  value,
  onChange,
  projects,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  projects: string[];
  label: string;
  className?: string;
}) {
  return (
    <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-w-[min(440px,calc(100vw-2rem))]">
        <SelectItem value={NONE}>
          <span className="text-muted-foreground">No project</span>
        </SelectItem>
        {projects.length > 0 && <SelectSeparator />}
        {projects.map((p) => (
          <SelectItem key={p} value={p}>
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
