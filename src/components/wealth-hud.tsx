"use client";
import * as React from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { TrendingUp } from "lucide-react";
import { cashOf, formatCash, STAGES, stageFor } from "@/lib/game/wealth";
import { cn } from "@/lib/utils";

/** Laufender Kontostand der Runde – zählt weich hoch wie ein Spielautomat. */
export function CashCounter({ points, className }: { points: number; className?: string }) {
  const mv = useMotionValue(cashOf(points));
  const spring = useSpring(mv, { duration: 900, bounce: 0 });
  const text = useTransform(spring, (v) => formatCash(Math.round(v / 1000) * 1000));
  React.useEffect(() => {
    mv.set(cashOf(points));
  }, [points, mv]);
  return <motion.span className={cn("font-num tabular-nums", className)}>{text}</motion.span>;
}

/** Kopfzeile: Kontostand + aktuelle Stufe */
export function WealthBadge({ points, max }: { points: number; max: number }) {
  const { stage } = stageFor(points, max);
  return (
    <div className="hud flex items-center gap-2 rounded-xl py-1 pl-1 pr-3">
      <span className="bg-sunset grid size-8 place-items-center rounded-lg text-sm font-black text-white">$</span>
      <span className="leading-tight">
        <CashCounter points={points} className="block text-lg font-semibold text-white" />
        <AnimatePresence mode="wait">
          <motion.span key={stage.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
            {stage.name}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

/** Vertikale Leiter am Bildschirmrand (Desktop) – die Markierung klettert mit jeder Antwort. */
export function WealthRail({ points, max }: { points: number; max: number }) {
  const p = max > 0 ? Math.min(1, points / max) : 0;
  const { index } = stageFor(points, max);
  return (
    <div className="pointer-events-none fixed bottom-24 right-5 top-28 z-20 hidden w-40 xl:block" aria-hidden>
      <div className="absolute bottom-0 right-3 top-0 w-[3px] rounded-full bg-white/10">
        <motion.div className="bg-sunset absolute bottom-0 left-0 right-0 rounded-full shadow-[0_0_18px_var(--sunset-pink)]" initial={false} animate={{ height: `${p * 100}%` }} transition={{ type: "spring", damping: 22, stiffness: 90 }} />
      </div>
      {STAGES.map((s, i) => (
        <div key={s.id} className="absolute right-0 flex translate-y-1/2 items-center gap-2" style={{ bottom: `${s.at * 100}%` }}>
          <span className={cn("text-right text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-500", i <= index ? "text-white" : "text-white/30")}>{s.name}</span>
          <span className={cn("size-[9px] rounded-full border transition-all duration-500", i <= index ? "border-white bg-[var(--sunset-pink)] shadow-[0_0_10px_var(--sunset-pink)]" : "border-white/30 bg-black/40")} />
        </div>
      ))}
    </div>
  );
}

/** Kurze Einblendung beim Erreichen einer neuen Stufe */
export function StageToast({ points, max }: { points: number; max: number }) {
  const { index, stage } = stageFor(points, max);
  const prev = React.useRef(index);
  const [show, setShow] = React.useState<null | typeof stage>(null);
  React.useEffect(() => {
    if (index > prev.current) {
      setShow(stage);
      const t = setTimeout(() => setShow(null), 2600);
      prev.current = index;
      return () => clearTimeout(t);
    }
    prev.current = index;
  }, [index, stage]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={show.id}
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 18, stiffness: 220 }}
          className="fixed left-1/2 top-20 z-50 w-[min(92vw,420px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/25 bg-[rgba(12,8,22,0.85)] shadow-[0_30px_80px_-20px_rgba(255,46,136,0.7)] backdrop-blur-xl"
          role="status"
        >
          <div className="flex items-center gap-3 p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/wealth/${show.image}.webp`} alt="" className="h-14 w-20 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--peach)]"><TrendingUp className="size-3.5" />Aufgestiegen</p>
              <p className="font-display text-3xl leading-none tracking-wide text-white">{show.name}</p>
              <p className="truncate text-xs text-white/65">{show.line}</p>
            </div>
          </div>
          <motion.span className="bg-sunset block h-0.5" initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 2.6, ease: "linear" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
