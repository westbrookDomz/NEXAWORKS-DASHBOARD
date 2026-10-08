import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { NexaMark } from "@/components/brand/nexa-mark";
import { useAuth } from "@/hooks/use-auth";
import { easeOut, STAGGER } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Bars on the brand panel: a quiet preview of the board. Hatched = still owed, solid = collected.
const PREVIEW_BARS = [0.42, 0.3, 0.58, 0.46, 0.72, 0.9];

type Phase = "idle" | "submitting" | "success";

export default function Login() {
  const { login, completeLogin, configured } = useAuth();
  const reduce = useReducedMotion();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);

  const rise = (i: number) => ({
    initial: { opacity: 0, transform: reduce ? "translateY(0px)" : "translateY(8px)" },
    animate: { opacity: 1, transform: "translateY(0px)" },
    transition: { duration: 0.5, delay: 0.25 + i * STAGGER, ease: easeOut },
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "idle") return;
    setError(null);
    setPhase("submitting");
    try {
      const { user } = await login.mutateAsync({ username, password });
      setPhase("success");
      // Let the check mark register before handing off to the dashboard.
      window.setTimeout(() => completeLogin(user), reduce ? 150 : 520);
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Sign-in failed. Try again.");
      setShakeKey((k) => k + 1);
      passwordRef.current?.select();
    }
  }

  return (
    <motion.div
      className="min-h-dvh bg-background p-3 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-3"
      initial={{ opacity: 1, transform: "scale(1)" }}
      animate={phase === "success" ? { opacity: 0, transform: reduce ? "scale(1)" : "scale(0.985)" } : { opacity: 1, transform: "scale(1)" }}
      transition={{ duration: 0.28, delay: phase === "success" ? 0.3 : 0, ease: easeOut }}
    >
      {/* Brand panel */}
      <motion.section
        className="panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        <div className="hatch pointer-events-none absolute inset-0 opacity-[0.35] hatch-faint" />

        <div className="relative flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-display text-base font-semibold text-foreground">Nexaworks</span>
          <span className="h-4 w-px bg-ink/15" />
          DesignBoard Pro
        </div>

        <div className="relative">
          <NexaMark animated delay={0.1} className="h-auto w-[min(360px,70%)] text-primary" />
          <p className="mt-10 max-w-[26ch] font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
            Every invoice, payment and project on one board.
          </p>
        </div>

        <div className="relative flex h-28 items-end gap-2.5" aria-hidden="true">
          {PREVIEW_BARS.map((h, i) => {
            const last = i === PREVIEW_BARS.length - 1;
            return (
              <motion.div
                key={i}
                className={cn(
                  "w-10 origin-bottom rounded-[10px]",
                  last ? "bg-primary" : "hatch bg-ink/[0.04] hatch-soft",
                )}
                style={{ height: `${h * 100}%` }}
                initial={{ transform: reduce ? "scaleY(1)" : "scaleY(0)", opacity: reduce ? 0 : 1 }}
                animate={{ transform: "scaleY(1)", opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 + i * STAGGER, ease: easeOut }}
              />
            );
          })}
        </div>
      </motion.section>

      {/* Form */}
      <section className="flex min-h-[calc(100dvh-1.5rem)] items-center justify-center px-4 lg:min-h-0">
        <div className="w-full max-w-[360px]">
          <motion.div {...rise(0)} className="mb-10 lg:hidden">
            <NexaMark animated className="h-7 w-auto text-primary" />
          </motion.div>

          <motion.h1 {...rise(0)} className="text-[28px]">
            Sign in
          </motion.h1>
          <motion.p {...rise(1)} className="mt-2 text-sm text-muted-foreground">
            Use your studio account to open the board.
          </motion.p>

          <form key={shakeKey} onSubmit={onSubmit} className={cn("mt-8 space-y-4", shakeKey > 0 && "animate-shake")} noValidate>
            <motion.div {...rise(2)} className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="field"
                aria-invalid={Boolean(error)}
              />
            </motion.div>

            <motion.div {...rise(3)} className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-11"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </motion.div>

            <AnimatePresence initial={false}>
              {error && (
                <motion.p
                  id="login-error"
                  role="alert"
                  className="text-sm text-vermilion"
                  initial={{ opacity: 0, transform: "translateY(-4px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: easeOut }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div {...rise(4)} className="pt-2">
              <button
                type="submit"
                disabled={phase !== "idle"}
                className={cn(
                  "pressable relative h-11 w-full overflow-hidden rounded-xl font-medium text-primary-foreground",
                  phase === "success" ? "bg-mint text-background" : "bg-primary hover:bg-primary-hover",
                  "disabled:cursor-default",
                )}
              >
                {/* Blur bridges the label/spinner/check swap so it reads as one control changing state */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={phase}
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, filter: "blur(4px)", transform: "translateY(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)", transform: "translateY(-6px)" }}
                    transition={{ duration: 0.2, ease: easeOut }}
                  >
                    {phase === "idle" && "Sign in"}
                    {phase === "submitting" && (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Signing in
                      </>
                    )}
                    {phase === "success" && (
                      <>
                        <Check className="size-4" strokeWidth={2.5} /> Signed in
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </motion.div>
          </form>

          {!configured && (
            <motion.p
              {...rise(5)}
              role="status"
              className="mt-6 rounded-xl border border-vermilion/25 bg-vermilion/[0.06] p-3 text-xs leading-relaxed text-vermilion"
            >
              Sign-in isn't set up on this server yet. Add APP_USERNAME and APP_PASSWORD to .env, then restart it.
            </motion.p>
          )}
        </div>
      </section>
    </motion.div>
  );
}
