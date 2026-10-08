import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

export type Theme = "dark" | "light";

const KEY = "theme";
const META: Record<Theme, string> = { dark: "#0c0e12", light: "#edf0f4" };
const listeners = new Set<() => void>();

export function getTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode: theme just won't persist */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META[theme]);
  // Re-render synchronously so the view transition captures charts in their new colours.
  flushSync(() => listeners.forEach((l) => l()));
}

/**
 * Switches theme. With an origin point, the new theme grows out of it as a circle
 * (rare action, so it gets the one expressive transition). Reduced motion swaps instantly.
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!origin || reduce || !doc.startViewTransition) {
    apply(theme);
    return;
  }
  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  doc.startViewTransition(() => apply(theme)).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 480, easing: "cubic-bezier(0.23, 1, 0.32, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "dark");
}

/** Chart colours for libraries that take literal values (Recharts attributes can't read CSS variables). */
export const CHART = {
  dark: { tick: "#8a93a3", grid: "rgb(255 255 255 / 0.06)", cursor: "rgb(255 255 255 / 0.25)", primary: "#179be5", ink: "#eef1f5", inkSoft: "rgb(255 255 255 / 0.5)", surface: "#14171c" },
  light: { tick: "#5d6676", grid: "rgb(15 19 24 / 0.08)", cursor: "rgb(15 19 24 / 0.25)", primary: "#0e8ad3", ink: "#0f1318", inkSoft: "rgb(15 19 24 / 0.45)", surface: "#ffffff" },
} as const;
