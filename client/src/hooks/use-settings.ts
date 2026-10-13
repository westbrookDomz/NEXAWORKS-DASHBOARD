import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export interface Settings {
  profile: { displayName: string; role: string; photo: string | null };
  studio: { name: string; overdueDays: number; reviewTemplate: string };
  defaults: { reviewTemplate: string };
  security: { username: string | null; passwordSetIn: "settings" | "env" };
}

export interface SheetStatus {
  connected: boolean;
  title: string | null;
  url: string | null;
  error?: string;
}

/** A failed save, with the field it belongs to so the message can sit beside it. */
export class FieldError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

async function send<T>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new FieldError("Couldn’t reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new FieldError(data.message ?? "Couldn’t save. Try again.", data.field);
  return data as T;
}

const KEY = ["/api/settings"];

export const DEFAULT_OVERDUE_DAYS = 14;

export function useSettings() {
  const query = useQuery<Settings>({ queryKey: KEY });
  const onSaved = (data: Settings) => {
    queryClient.setQueryData(KEY, data);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
  };

  return {
    ...query,
    overdueDays: query.data?.studio.overdueDays ?? DEFAULT_OVERDUE_DAYS,
    saveProfile: useMutation({
      mutationFn: (p: Settings["profile"]) => send<Settings>("PUT", "/api/settings/profile", p),
      onSuccess: onSaved,
    }),
    saveStudio: useMutation({
      mutationFn: (s: Settings["studio"]) => send<Settings>("PUT", "/api/settings/studio", s),
      onSuccess: onSaved,
    }),
    saveCredentials: useMutation({
      mutationFn: (c: { username: string; currentPassword: string; newPassword?: string }) =>
        send<Settings>("POST", "/api/settings/credentials", c),
      onSuccess: (data) => {
        onSaved(data);
        queryClient.setQueryData(["/api/auth/session"], (s: Record<string, unknown> | undefined) => ({ ...s, user: data.security.username }));
      },
    }),
    signOutEverywhere: useMutation({
      mutationFn: () => send<{ ok: true }>("POST", "/api/settings/sign-out-everywhere"),
      onSuccess: () => {
        queryClient.setQueryData(["/api/auth/session"], (s: Record<string, unknown> | undefined) => ({ ...s, user: null }));
        queryClient.removeQueries({ queryKey: ["/api/payments"] });
        queryClient.removeQueries({ queryKey: KEY });
      },
    }),
  };
}

export function useSheetStatus() {
  return useQuery<SheetStatus>({ queryKey: ["/api/settings/sheet"], staleTime: 5 * 60_000 });
}
