import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { easeOut } from "@/lib/motion";

/**
 * Counts from the value currently on screen to the new one, so a figure arriving from the sheet
 * (or changing after a sync) reads as a change rather than a jump. Writes to the DOM directly
 * to avoid re-rendering on every frame.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 0.9,
  from = 0,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  /** Starting value on mount. Pass `value` to show the figure without counting. */
  from?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(from);
  const formatRef = useRef(format);
  formatRef.current = format;
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      shown.current = value;
      node.textContent = formatRef.current(value);
      return;
    }
    const controls = animate(shown.current, value, {
      duration,
      ease: easeOut,
      onUpdate: (v) => {
        shown.current = v;
        node.textContent = formatRef.current(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {format(reduce ? value : Math.round(shown.current))}
    </span>
  );
}
