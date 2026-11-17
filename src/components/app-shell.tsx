"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Archive, CalendarDays, Flame, Home, Infinity as InfinityIcon, LayoutGrid, Menu, Settings2, Trophy, User, X } from "lucide-react";
import { cn, fmt } from "@/lib/utils";
import { useApp } from "./providers";
import { AvatarBubble, Logo } from "./bits";
import { SceneBackground, SceneProvider } from "./scene";

export const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/daily", label: "Daily Quiz", icon: CalendarDays },
  { href: "/packs", label: "Themen-Packs", icon: LayoutGrid },
  { href: "/unlimited", label: "Unlimited", icon: InfinityIcon },
  { href: "/archiv", label: "Archiv", icon: Archive },
  { href: "/rangliste", label: "Rangliste", icon: Trophy },
  { href: "/profil", label: "Profil", icon: User },
] as const;

const MOBILE = ["/", "/daily", "/packs", "/unlimited"];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

function ScorePill() {
  const { stats, attemptsLoaded } = useApp();
  return (
    <div className="hud flex items-center gap-1 rounded-full px-1 py-1 text-sm font-num">
      <span className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5" title="Aktuelle Serie">
        <Flame className={cn("size-4", stats.streak.current > 0 ? "text-[var(--sunset-orange)]" : "text-fg-subtle")} />
        <span className="font-semibold tabular-nums">{attemptsLoaded ? stats.streak.current : "–"}</span>
      </span>
      <span className="h-4 w-px bg-line" />
      <span className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5" title="Gesamtpunkte">
        <span className="bg-sunset size-2 rounded-full" />
        <span className="font-semibold tabular-nums">{attemptsLoaded ? fmt(stats.totalPoints) : "–"}</span>
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  const { user } = useApp();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const playing = path.startsWith("/play");
  const admin = path.startsWith("/admin");

  React.useEffect(() => setMoreOpen(false), [path]);

  return (
    <SceneProvider>
    <div className="relative isolate min-h-dvh">
      <SceneBackground />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(12,10,20,0.45)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="shrink-0" aria-label="Rarum – Startseite">
            <Logo />
          </Link>
          {!playing && (
            <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Hauptnavigation">
              {NAV.slice(0, 6).map((n) => (
                <Link key={n.href} href={n.href} className={cn("group relative rounded-full px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors", isActive(path, n.href) ? "text-white" : "text-fg-muted hover:text-white")}>
                  {n.label}
                  <span className={cn("absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-sunset transition-transform duration-300", isActive(path, n.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                </Link>
              ))}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-2">
            {!admin && <ScorePill />}
            <Link href="/profil" className="hidden rounded-full sm:block" aria-label="Profil">
              <AvatarBubble id={user?.avatar} size={36} />
            </Link>
          </div>
        </div>
      </header>

      <main className={cn("relative mx-auto max-w-6xl px-4 sm:px-6", playing ? "pb-10 pt-4" : "pb-32 pt-6 sm:pt-10 lg:pb-16")}>{children}</main>

      {!playing && (
        <footer className="mx-auto hidden max-w-6xl items-center justify-between px-6 pb-10 text-xs text-fg-subtle lg:flex">
          <span>Rarum – das Quiz der seltenen Antworten. Komplett kostenlos, ohne Werbung.</span>
          <span className="flex gap-4">
            <Link href="/info" className="hover:text-fg">So funktioniert&apos;s</Link>
            <Link href="/admin" className="inline-flex items-center gap-1 hover:text-fg"><Settings2 className="size-3.5" />Redaktion</Link>
          </span>
        </footer>
      )}

      {!playing && (
        <nav className="safe-bottom fixed inset-x-3 bottom-3 z-30 rounded-3xl border border-white/12 bg-[rgba(14,11,24,0.78)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:hidden" aria-label="Navigation">
          <div className="mx-auto grid max-w-md grid-cols-5 px-2">
            {NAV.filter((n) => MOBILE.includes(n.href)).map((n) => {
              const active = isActive(path, n.href);
              return (
                <Link key={n.href} href={n.href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-fg" : "text-fg-subtle")}>
                  <span className={cn("rounded-full px-4 py-1 transition-all", active && "bg-sunset text-white shadow-[0_6px_20px_-6px_rgba(255,106,85,0.9)]")}>
                    <n.icon className="size-5" />
                  </span>
                  {n.label === "Themen-Packs" ? "Packs" : n.label === "Daily Quiz" ? "Daily" : n.label}
                </Link>
              );
            })}
            <button onClick={() => setMoreOpen(true)} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", ["/archiv", "/rangliste", "/profil"].some((h) => isActive(path, h)) ? "text-fg" : "text-fg-subtle")}>
              <span className="rounded-full px-4 py-1"><Menu className="size-5" /></span>
              Mehr
            </button>
          </div>
        </nav>
      )}

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-forest-950/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMoreOpen(false)} />
            <motion.div className="safe-bottom fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/12 bg-[rgba(16,12,28,0.95)] p-5 backdrop-blur-xl lg:hidden" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 320 }}>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-2xl">Mehr</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setMoreOpen(false)} className="rounded-full p-2 text-fg-muted hover:bg-surface-2" aria-label="Schliessen"><X className="size-5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-2xl border border-line px-4 py-3.5 text-sm font-medium", isActive(path, n.href) ? "bg-sunset text-white" : "bg-white/5")}>
                    <n.icon className="size-5" />
                    {n.label}
                  </Link>
                ))}
                <Link href="/info" className="flex items-center gap-3 rounded-2xl border border-line bg-white/5 px-4 py-3.5 text-sm font-medium">
                  <Settings2 className="size-5" />
                  So funktioniert&apos;s
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </SceneProvider>
  );
}
