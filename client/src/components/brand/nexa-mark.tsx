import { motion, useReducedMotion } from "framer-motion";
import { easeOut } from "@/lib/motion";

/**
 * The Nexaworks mark redrawn as three slanted strokes (the traced SVGs in attached_assets
 * are too heavy to animate). With `animated`, each stroke wipes in along its own slant.
 */
const STROKES = [
  "M0 0 H98 L245 185 H148 Z",
  "M121 0 H218 L308 113 L399 0 H496 L349 185 H268 Z",
];

export function NexaMark({
  className,
  animated = false,
  delay = 0,
}: {
  className?: string;
  animated?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 496 185" className={className} aria-hidden="true">
      {STROKES.map((d, i) =>
        animated ? (
          <motion.path
            key={i}
            d={d}
            fill="currentColor"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)", opacity: 1 }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: reduce ? 0.3 : 0.7, delay: delay + i * 0.12, ease: easeOut }}
          />
        ) : (
          <path key={i} d={d} fill="currentColor" />
        ),
      )}
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <NexaMark className="h-[18px] w-auto text-primary" />
        <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">Nexaworks</span>
      </div>
    </div>
  );
}
