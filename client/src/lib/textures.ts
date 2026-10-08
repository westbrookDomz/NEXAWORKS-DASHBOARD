/** Same grain as the CSS `--grain` token in index.css, for use inside SVG patterns. */
export const GRAIN_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.4 -0.45'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E";

/** The hatch angle in SVG terms: vertical lines turned to the 51deg slant of the Nexaworks mark. */
export const HATCH_TRANSFORM = "rotate(-39)";
