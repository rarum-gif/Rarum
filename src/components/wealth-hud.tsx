"use client";
import * as React from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { formatCash } from "@/lib/game/wealth";

/** Kontostand der laufenden Runde – zählt weich hoch. */
export function CashCounter({ cash, className }: { cash: number; className?: string }) {
  const mv = useMotionValue(cash);
  const spring = useSpring(mv, { duration: 800, bounce: 0 });
  const text = useTransform(spring, (v) => formatCash(Math.round(v), { compact: false }));
  React.useEffect(() => {
    mv.set(cash);
  }, [cash, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}

export function RunCashBadge({ cash, level }: { cash: number; level: number }) {
  return (
    <div className="hud flex items-center gap-2 rounded-xl py-1 pl-1 pr-3">
      <span className="bg-sunset grid size-8 place-items-center rounded-lg text-sm font-black text-white">$</span>
      <span className="leading-tight">
        <CashCounter cash={cash} className="font-num block text-lg font-semibold tabular-nums text-white" />
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Level {level}</span>
      </span>
    </div>
  );
}

/** "+120 $" fliegt hoch, wenn eine Antwort Geld bringt */
export function CashPop({ pop }: { pop: { amount: number; key: number } | null }) {
  return (
    <AnimatePresence>
      {pop && pop.amount > 0 && (
        <motion.div
          key={pop.key}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, -10, -30, -60], scale: [0.8, 1.15, 1, 1] }}
          transition={{ duration: 1.6, times: [0, 0.2, 0.6, 1] }}
          className="pointer-events-none fixed right-6 top-24 z-50 font-num text-3xl font-bold text-[var(--gold)] drop-shadow-[0_4px_20px_rgba(242,193,78,0.6)] sm:right-[max(1.5rem,calc(50vw-22rem))]"
          aria-hidden
        >
          +{formatCash(pop.amount, { compact: false })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
