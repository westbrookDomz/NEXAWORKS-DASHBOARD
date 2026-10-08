import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/animated-number";
import { formatMoney, sum, type Entry } from "@/lib/finance";
import { GRAIN_URI, HATCH_TRANSFORM } from "@/lib/textures";
import { easeOut } from "@/lib/motion";

const CX = 160;
const CY = 164;
const R = 150;
const r = 106;
const GAP = 5; // degrees between segments
const MIN_SWEEP = 3; // keep tiny non-zero segments visible

function point(angle: number, radius: number) {
  const a = (angle * Math.PI) / 180;
  return `${(CX + radius * Math.cos(a)).toFixed(2)} ${(CY - radius * Math.sin(a)).toFixed(2)}`;
}

/** Annular sector from angle a0 down to a1 (180 = left, 0 = right). */
function sector(a0: number, a1: number) {
  return [
    `M ${point(a0, R)}`,
    `A ${R} ${R} 0 0 1 ${point(a1, R)}`,
    `L ${point(a1, r)}`,
    `A ${r} ${r} 0 0 0 ${point(a0, r)}`,
    "Z",
  ].join(" ");
}

/** Share of billed money collected, with what is still owed split into pending and overdue. */
export default function CollectionGauge({ entries, intro }: { entries: Entry[]; intro: boolean }) {
  const id = useId().replace(/:/g, "");

  const { parts, collectedPct, total } = useMemo(() => {
    const collected = sum(entries, "paid");
    const pending = sum(entries.filter((e) => e.state === "Pending"), "balance");
    const overdue = sum(entries.filter((e) => e.state === "Overdue"), "balance");
    const total = collected + pending + overdue;
    return {
      total,
      collectedPct: total ? Math.round((collected / total) * 100) : 0,
      parts: [
        { key: "collected", label: "Collected", value: collected, fill: "var(--color-primary)", swatch: "bg-primary" },
        { key: "pending", label: "Pending", value: pending, fill: `url(#${id}-hatch)`, swatch: "hatch bg-ink/[0.06] hatch-strong" },
        { key: "overdue", label: "Overdue", value: overdue, fill: `url(#${id}-grain)`, swatch: "grain bg-vermilion/60" },
      ],
    };
  }, [entries, id]);

  const arcs = useMemo(() => {
    const visible = parts.filter((p) => p.value > 0);
    const available = 180 - GAP * Math.max(0, visible.length - 1);
    let cursor = 180;
    return visible.map((p) => {
      const sweep = Math.max(MIN_SWEEP, (p.value / (total || 1)) * available);
      const arc = { ...p, d: sector(cursor, Math.max(0, cursor - sweep)) };
      cursor -= sweep + GAP;
      return arc;
    });
  }, [parts, total]);

  const mid = (R + r) / 2;

  return (
    <section className="panel flex flex-col p-5 lg:p-6" aria-labelledby="collection-title">
      <h2 id="collection-title" className="text-lg">Collection</h2>
      <p className="mt-1 text-sm text-muted-foreground">How much of everything billed has come in.</p>

      <div className="relative mx-auto mt-6 w-full max-w-[340px]">
        <svg viewBox="0 0 320 172" className="w-full overflow-visible" role="img" aria-label={`${collectedPct}% of ${formatMoney(total)} collected`}>
          <defs>
            <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform={HATCH_TRANSFORM}>
              <rect width="6" height="6" style={{ fill: "var(--color-ink)", fillOpacity: 0.05 }} />
              <line x1="0" y1="0" x2="0" y2="6" strokeWidth="3" style={{ stroke: "var(--color-ink)", strokeOpacity: 0.4 }} />
            </pattern>
            <pattern id={`${id}-grain`} width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" style={{ fill: "var(--color-vermilion)", fillOpacity: 0.6 }} />
              <image href={GRAIN_URI} width="120" height="120" />
            </pattern>
            {/* Sweep: a thick stroke along the gauge's midline is drawn left to right and reveals the segments */}
            <mask id={`${id}-sweep`} maskUnits="userSpaceOnUse">
              <motion.path
                d={`M ${CX - mid} ${CY} A ${mid} ${mid} 0 0 1 ${CX + mid} ${CY}`}
                fill="none"
                stroke="white"
                strokeWidth={R - r + 16}
                initial={intro ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: easeOut }}
              />
            </mask>
          </defs>

          {arcs.length === 0 && <path d={sector(180, 0)} style={{ fill: "var(--color-ink)", fillOpacity: 0.05 }} />}
          <g mask={`url(#${id}-sweep)`}>
            {arcs.map((a) => (
              <path key={a.key} d={a.d} strokeWidth="6" strokeLinejoin="round" style={{ fill: a.fill, stroke: a.fill }} />
            ))}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
          <AnimatedNumber
            value={collectedPct}
            from={intro ? 0 : collectedPct}
            duration={1}
            format={(n) => `${n}%`}
            className="figure text-[44px] font-semibold leading-none"
          />
          <span className="mt-1.5 text-xs text-muted-foreground">of {formatMoney(total)} collected</span>
        </div>
      </div>

      <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-line pt-5">
        {parts.map((p) => (
          <div key={p.key} className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`size-2.5 shrink-0 rounded-[3px] ${p.swatch}`} />
              {p.label}
            </dt>
            <dd className="figure mt-1 truncate text-[15px] font-semibold">{formatMoney(p.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
