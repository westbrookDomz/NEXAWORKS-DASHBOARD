import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Payment } from "@shared/schema";
import { toEntry } from "@/lib/finance";

/** Payments from the studio sheet, normalised into entries every screen can share. */
export function useEntries() {
  const query = useQuery<Payment[]>({ queryKey: ["/api/payments"] });
  const entries = useMemo(() => (query.data ?? []).map((p) => toEntry(p)), [query.data]);
  return { ...query, entries };
}
