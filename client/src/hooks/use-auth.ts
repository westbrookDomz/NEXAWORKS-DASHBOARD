import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export interface AuthSession {
  /** False when the server has no credentials set; sign-in can't succeed until it does. */
  configured: boolean;
  user: string | null;
}

const SESSION_KEY = ["/api/auth/session"];

async function readSession(): Promise<AuthSession> {
  const res = await fetch("/api/auth/session", { credentials: "include" });
  const type = res.headers.get("content-type") ?? "";
  // No API (client-only dev mode): show the sign-in screen; signing in will explain the server isn't reachable.
  if (!res.ok || !type.includes("application/json")) return { configured: true, user: null };
  return res.json();
}

export function useAuth() {
  const session = useQuery({ queryKey: SESSION_KEY, queryFn: readSession, staleTime: Infinity });

  const login = useMutation({
    mutationFn: async (input: { username: string; password: string }) => {
      let res: Response;
      try {
        res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(input),
        });
      } catch {
        throw new Error("Couldn't reach the server. Check that it's running and try again.");
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? "Sign-in failed. Try again.");
      return body as { user: string };
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    },
    onSuccess: () => {
      queryClient.setQueryData<AuthSession>(SESSION_KEY, (s) => ({ configured: s?.configured ?? true, user: null }));
      queryClient.removeQueries({ queryKey: ["/api/payments"] });
    },
  });

  /** Called after the success animation finishes, so the dashboard mounts once the hand-off is done. */
  const completeLogin = (user: string) =>
    queryClient.setQueryData<AuthSession>(SESSION_KEY, (s) => ({ configured: s?.configured ?? true, user }));

  return {
    user: session.data?.user ?? null,
    configured: session.data?.configured ?? true,
    isLoading: session.isLoading,
    login,
    logout,
    completeLogin,
  };
}
