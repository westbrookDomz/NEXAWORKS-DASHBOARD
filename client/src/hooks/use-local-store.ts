import { useCallback, useEffect, useState } from "react";

/**
 * State saved in this browser's localStorage, kept in sync across open tabs.
 * Used for studio data the payments sheet doesn't hold (tasks, reviews, list prices).
 */
export function useLocalStore<T>(key: string, initial: T) {
  const read = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [value, setValue] = useState<T>(read);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, read]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* storage full or blocked: keep the in-memory value */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
