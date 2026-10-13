import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Payment } from "@shared/schema";
import { toEntry } from "@/lib/finance";
import { useSettings } from "@/hooks/use-settings";

/** Payments from the studio sheet, normalised into entries every screen can share. */
export function useEntries() {
  const query = useQuery<Payment[]>({ queryKey: ["/api/payments"] });
  const { overdueDays } = useSettings();
  const entries = useMemo(() => (query.data ?? []).map((p) => toEntry(p, overdueDays)), [query.data, overdueDays]);
  return { ...query, entries };
}
