/** Mirrors the CSS motion tokens in index.css so Motion and CSS animations feel like one system. */
export const easeOut = [0.23, 1, 0.32, 1] as const;
export const easeInOut = [0.77, 0, 0.175, 1] as const;

/** Snappy, no bounce: for things clicked tens of times a day (nav pill, toggles). */
export const snappy = { type: "spring", duration: 0.32, bounce: 0 } as const;

/** Stagger step for groups entering together. */
export const STAGGER = 0.05;
