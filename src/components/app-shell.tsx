"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Archive, CalendarDays, Crown, Info, Infinity as InfinityIcon, LayoutGrid, Menu, Settings2, Swords, Trophy, User, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cashOf, formatCash } from "@/lib/game/wealth";
import { useApp } from "./providers";
import { AvatarBubble, Logo } from "./bits";
import { SceneBackground, SceneProvider } from "./scene";

/** Menü wie bei einem Spiel: Spielen · Du · Mehr */
export const MENU = [
  {
    title: "Spielen",
    items: [
      { href: "/play?mode=daily", match: "/daily", label: "Daily Challenge", hint: "7 Fragen · einmal am Tag", icon: CalendarDays },
      { href: "/ranked", label: "Ranked", hint: "Wochenliga gegen alle", icon: Swords, badge: "Neu" },
      { href: "/unlimited", label: "Unlimited", hint: "Endlos weiterspielen", icon: InfinityIcon },
      { href: "/archiv", label: "Archiv", hint: "Verpasste Tage nachholen", icon: Archive },
      { href: "/packs", label: "Themen-Packs", hint: "15 Welten · eigene Tages-Sets", icon: LayoutGrid },
    ],
  },
  {
    title: "Du",
    items: [
      { href: "/profil", label: "Mein NNAXOS", hint: "Vermögen, Serie, Abzeichen", icon: User },
      { href: "/rangliste", label: "Rangliste", hint: "Tag · Woche · Allzeit", icon: Trophy },
      { href: "/profil#freunde", match: "/__friends", label: "Freunde", hint: "Einladen & vergleichen", icon: Users },
    ],
  },
  {
    title: "Mehr",
    items: [
      { href: "/info", label: "So funktioniert's", hint: "Regeln, Punkte, FAQ", icon: Info },
      { href: "/admin", label: "Redaktion", hint: "Fragen & Sets verwalten", icon: Settings2 },
    ],
  },
] as const;

function isActive(path: string, href: string, match?: string) {
  const h = match ?? href.split("?")[0].split("#")[0];
  return h === "/" ? path === "/" : path === h || path.startsWith(h + "/");
}

function WealthPill() {
  const { stats, attemptsLoaded, level } = useApp();
  return (
    <Link href="/profil" className="hud group flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm transition-colors hover:border-white/30" title="Dein Vermögen">
      <span className="bg-sunset grid size-7 place-items-center rounded-full text-[13px] font-black text-white shadow-[0_0_18px_-4px_var(--sunset-pink)]">$</span>
      <span className="font-num font-semibold tabular-nums text-white">{attemptsLoaded ? formatCash(cashOf(stats.totalPoints)) : "–"}</span>
      <span className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-white/55 sm:inline">{level.current.name}</span>
    </Link>
  );
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = usePathname() ?? "/";
  const { user, accountsEnabled } = useApp();
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-label="Menü"
            className="drawer fixed inset-y-0 left-0 z-50 flex w-[min(88vw,380px)] flex-col overflow-y-auto border-r border-white/10"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <Logo />
              <button onClick={onClose} className="icon-btn" aria-label="Menü schliessen"><X className="size-5" /></button>
            </div>
            <nav className="flex-1 space-y-6 px-3 pb-6 pt-4">
              {MENU.map((group, gi) => (
                <div key={group.title}>
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">{group.title}</p>
                  <ul className="space-y-1">
                    {group.items.map((it, i) => {
                      const active = isActive(path, it.href, "match" in it ? it.match : undefined);
                      return (
                        <motion.li key={it.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 + gi * 0.08 + i * 0.035, duration: 0.35 }}>
                          <Link
                            href={it.href}
                            onClick={onClose}
                            className={cn("menu-item group", active && "menu-item-active")}
                          >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 transition-colors group-hover:border-white/25">
                              <it.icon className="size-5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="font-display flex items-center gap-2 text-[22px] leading-none tracking-wide">
                                {it.label}
                                {"badge" in it && it.badge && <span className="bg-sunset rounded px-1.5 py-0.5 font-sans text-[9px] font-black uppercase tracking-[0.15em] text-white">{it.badge}</span>}
                              </span>
                              <span className="mt-1 block truncate text-xs text-white/55">{it.hint}</span>
                            </span>
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="border-t border-white/10 p-5">
              {user ? (
                <Link href="/profil" onClick={onClose} className="flex items-center gap-3">
                  <AvatarBubble id={user.avatar} size={40} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{user.username}</span>
                    <span className="text-xs text-white/55">Angemeldet · Fortschritt im Konto</span>
                  </span>
                </Link>
              ) : accountsEnabled ? (
                <Link href="/login" onClick={onClose} className="btn-sunset block rounded-xl px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.18em]">Anmelden &amp; Fortschritt sichern</Link>
              ) : (
                <p className="text-xs leading-relaxed text-white/50">Demo-Modus: Dein Fortschritt wird auf diesem Gerät gespeichert. Komplett kostenlos, ohne Werbung.</p>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  const { user } = useApp();
  const [open, setOpen] = React.useState(false);
  const playing = path.startsWith("/play");
  const home = path === "/";
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => setOpen(false), [path]);

  return (
    <SceneProvider>
      <div className="relative isolate min-h-dvh">
        <SceneBackground />
        <div className="grain pointer-events-none fixed -inset-[10%] z-[1]" aria-hidden />
        <header className={cn("top-0 z-30", home ? "absolute inset-x-0" : "sticky border-b border-white/[0.07] bg-[rgba(10,7,18,0.5)] backdrop-blur-xl")}>
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setOpen(true)} className="icon-btn" aria-label="Menü öffnen" aria-expanded={open}>
              <Menu className="size-5" />
            </button>
            {!home && (
              <Link href="/" className="shrink-0" aria-label="NNAXOS – Hauptmenü">
                <Logo />
              </Link>
            )}
            <div className="ml-auto flex items-center gap-2">
              {!playing && <WealthPill />}
              <Link href="/ranked" className="icon-btn hidden sm:grid" aria-label="Ranked" title="Ranked"><Crown className="size-5" /></Link>
              <Link href="/profil" className="rounded-full" aria-label="Profil">
                <AvatarBubble id={user?.avatar} size={38} />
              </Link>
            </div>
          </div>
        </header>

        <main className={cn("relative z-[2] mx-auto max-w-6xl px-4 sm:px-6", home ? "pb-16" : playing ? "pb-10 pt-4" : "pb-20 pt-6 sm:pt-10")}>{children}</main>

        {!playing && !home && (
          <footer className="relative z-[2] mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 pb-10 text-xs text-white/40">
            <span>NNAXOS – je seltener die Antwort, desto reicher du.</span>
            <span className="flex gap-4">
              <Link href="/info" className="hover:text-white">So funktioniert&apos;s</Link>
              <Link href="/info#bilder" className="hover:text-white">Bildnachweise</Link>
            </span>
          </footer>
        )}
        <Drawer open={open} onClose={close} />
      </div>
    </SceneProvider>
  );
}
