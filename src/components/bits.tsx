"use client";
import * as React from "react";
import { Bird, Clock3, Compass, Feather, HardDrive, Leaf, Moon, Mountain, Shell, Snowflake, Sprout, Sun, TreePine, Waves } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { TierId } from "@/lib/types";
import { AVATARS } from "@/lib/avatars";
import { cn, fmt } from "@/lib/utils";
import { useApp } from "./providers";

export const TIER_ORDER: TierId[] = ["known", "familiar", "unusual", "rare", "very_rare", "legendary"];
export const tierVar = (t: TierId) => `var(--tier-${t})`;

export function useTierLabel() {
  const { settings } = useApp();
  return React.useCallback((t: TierId) => settings.tiers.find((x) => x.id === t)?.label ?? t, [settings.tiers]);
}

/** Markenzeichen: ein stilisiertes Blatt mit Facette – „das seltene Fundstück“ */
export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <rect width="40" height="40" rx="12" fill="var(--forest-800)" />
        <path d="M20 8 C 29 12, 31 22, 20 32 C 9 22, 11 12, 20 8 Z" fill="var(--sand-300)" />
        <path d="M20 8 C 23 16, 23 24, 20 32" stroke="var(--forest-800)" strokeWidth="1.4" fill="none" />
        <path d="M20 18 L26 15 M20 24 L14 21" stroke="var(--forest-800)" strokeWidth="1.1" />
        <circle cx="29.5" cy="10.5" r="2.6" fill="var(--tier-legendary)" />
      </svg>
      {withText && <span className="font-display text-[22px] font-semibold tracking-tight">Rarum</span>}
    </span>
  );
}

const AVATAR_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = { Leaf, Mountain, Waves, Bird, TreePine, Sun, Moon, Feather, Compass, Sprout, Shell, Snowflake };

export function AvatarBubble({ id, size = 36, className }: { id?: string | null; size?: number; className?: string }) {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];
  const Icon = AVATAR_ICONS[a.icon] ?? Leaf;
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-white ring-2 ring-surface", className)} style={{ width: size, height: size, background: `linear-gradient(140deg, ${a.from}, ${a.to})` }} aria-hidden>
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </span>
  );
}

export function TierBadge({ tier, className }: { tier: TierId; className?: string }) {
  const label = useTierLabel()(tier);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", className)} style={{ color: tierVar(tier), background: `color-mix(in oklab, ${tierVar(tier)} 14%, transparent)` }}>
      <span className="size-1.5 rounded-full" style={{ background: tierVar(tier) }} />
      {label}
    </span>
  );
}

/** Sechsstufige Seltenheitsanzeige, füllt sich animiert bis zur erreichten Stufe */
export function RarityMeter({ tier, animate = true, className }: { tier: TierId | null; animate?: boolean; className?: string }) {
  const idx = tier ? TIER_ORDER.indexOf(tier) : -1;
  return (
    <div className={cn("flex items-end gap-1.5", className)} aria-label={tier ? `Seltenheitsstufe ${idx + 1} von 6` : "Keine Wertung"}>
      {TIER_ORDER.map((t, i) => (
        <motion.span
          key={t}
          className="block w-full rounded-full"
          style={{ height: 6 + i * 3, background: i <= idx ? tierVar(t) : "var(--surface-3)" }}
          initial={animate ? { scaleY: 0.3, opacity: 0.4 } : false}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: animate ? 0.15 + i * 0.09 : 0, type: "spring", stiffness: 260, damping: 18 }}
        />
      ))}
    </div>
  );
}

export function AnimatedNumber({ value, className, duration = 0.9 }: { value: number; className?: string; duration?: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const text = useTransform(spring, (v) => fmt(Math.round(v)));
  React.useEffect(() => {
    mv.set(value);
  }, [mv, value]);
  return <motion.span className={cn("tabular-nums", className)}>{text}</motion.span>;
}

export function useCountdown(targetIso: string | null | undefined, offset = 0) {
  const [now, setNow] = React.useState(() => Date.now() + offset);
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(t);
  }, [offset]);
  const ms = targetIso ? Math.max(0, new Date(targetIso).getTime() - now) : 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { ms, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` };
}

export function ResetCountdown({ className, prefix = "Neue Fragen in" }: { className?: string; prefix?: string }) {
  const { overview, serverOffset } = useApp();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const { label } = useCountdown(overview?.nextReset, serverOffset);
  return (
    <span className={cn("inline-flex items-center gap-1.5 tabular-nums", className)}>
      <Clock3 className="size-4 opacity-70" />
      {prefix} <span className="font-semibold">{mounted && overview ? label : "--:--:--"}</span>
    </span>
  );
}

export function StatTile({ label, value, hint, icon: Icon, className }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ComponentType<{ className?: string }>; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-4", className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-fg-subtle">
        {Icon && <Icon className="size-4" />}
        {label}
      </div>
      <div className="mt-1.5 font-display text-2xl font-medium tracking-tight">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-fg-muted">{hint}</div>}
    </div>
  );
}

export function LocalDataNotice({ className }: { className?: string }) {
  const { accountsEnabled, user } = useApp();
  if (user) return null;
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border border-dashed border-line-strong bg-surface-2/60 p-4 text-sm text-fg-muted", className)}>
      <HardDrive className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-medium text-fg">Lokale Daten:</span> Deine Ergebnisse werden nur in diesem Browser gespeichert.{" "}
        {accountsEnabled ? "Mit einem kostenlosen Konto kannst du sie auf allen Geräten synchronisieren." : "Konten und globale Ranglisten werden aktiv, sobald Supabase konfiguriert ist."}
      </p>
    </div>
  );
}

export function EmptyState({ icon: Icon = Sprout, title, children, className }: { icon?: React.ComponentType<{ className?: string }>; title: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-12 text-center", className)}>
      <span className="mb-4 rounded-full bg-accent-soft p-3 text-accent">
        <Icon className="size-6" />
      </span>
      <h3 className="font-display text-lg font-medium">{title}</h3>
      {children && <div className="mt-2 max-w-sm text-sm text-fg-muted">{children}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children, className }: { eyebrow?: string; title: string; children?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("mb-8 animate-rise", className)}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-3 max-w-2xl text-fg-muted">{children}</div>}
    </header>
  );
}

export function DifficultyDots({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Schwierigkeit ${value} von 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={cn("size-1.5 rounded-full", i <= Math.round(value) ? "bg-current" : "bg-current opacity-25")} />
      ))}
    </span>
  );
}
