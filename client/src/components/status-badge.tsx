import { cn } from "@/lib/utils";
import type { PaymentState } from "@/lib/finance";

const STYLES: Record<PaymentState, string> = {
  Paid: "text-mint bg-mint/10 border-mint/20",
  Pending: "text-amber bg-amber/10 border-amber/20",
  Overdue: "text-vermilion bg-vermilion/10 border-vermilion/25",
};

export function StatusBadge({ state, className }: { state: PaymentState; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-medium",
        STYLES[state],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {state}
    </span>
  );
}
