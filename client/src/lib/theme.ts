import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

export type Theme = "dark" | "light";
/** What the person chose; "system" follows the device's own light or dark setting. */
export type ThemePreference = Theme | "system";

const KEY = "theme";
const META: Record<Theme, string> = { dark: "#0c0e12", light: "#edf0f4" };
const listeners = new Set<() => void>();

export function getTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  // Freeze colour transitions so the whole page changes in one step instead of smearing.
  root.classList.add("theme-switching");
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META[theme]);
  // Re-render synchronously so the view transition captures charts in their new colours.
  flushSync(() => listeners.forEach((l) => l()));
}

/**
 * Switches theme. With an origin point, the new theme grows out of it as a circle
 * (rare action, so it gets the one expressive transition). Reduced motion swaps instantly.
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }, preference: ThemePreference = theme) {
  savePreference(preference);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
  const thaw = () => requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("theme-switching")));
  if (!origin || reduce || !doc.startViewTransition) {
    apply(theme);
    thaw();
    return;
  }
  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const transition = doc.startViewTransition(() => apply(theme));
  transition.finished.finally(thaw);
  transition.ready.then(() => {
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

const darkQuery = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
const systemTheme = (): Theme => (darkQuery?.matches === false ? "light" : "dark");

function savePreference(pref: ThemePreference) {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* private mode: the choice just won't persist */
  }
}

export function getPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "system" ? v : "dark";
  } catch {
    return "dark";
  }
}

/** Sets the remembered choice (Settings → Appearance). "system" resolves to the device's setting now and later. */
export function setPreference(pref: ThemePreference, origin?: { x: number; y: number }) {
  const resolved = pref === "system" ? systemTheme() : pref;
  if (resolved === getTheme()) {
    savePreference(pref);
    listeners.forEach((l) => l());
    return;
  }
  setTheme(resolved, origin, pref);
}

// While following the device, flip when the device flips.
darkQuery?.addEventListener("change", () => {
  if (getPreference() === "system") setTheme(systemTheme(), undefined, "system");
});

export function usePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, getPreference, () => "dark");
}
