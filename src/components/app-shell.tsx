"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Archive, CalendarDays, Crown, Globe2, Home, Info, Infinity as InfinityIcon, LayoutGrid, Menu, Settings2, Shirt, ShoppingBag, Swords, Trophy, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MONETIZATION } from "@/lib/monetization";
import { formatCash } from "@/lib/game/wealth";
import { useApp } from "./providers";
import { AvatarBubble, Logo } from "./bits";
import { CharacterBadge } from "./character";
import { SceneBackground, SceneProvider } from "./scene";
import { PalmSilhouettes } from "./palms";

/** Menü wie bei einem Spiel: Spielen · Du · Mehr */
export const MENU = [
  {
    title: "Spielen",
    items: [
      { href: "/play?mode=daily", match: "/daily", label: "Daily Challenge", icon: CalendarDays },
      { href: "/ranked", label: "Ranked", icon: Swords },
      { href: "/weltkarte", label: "Weltkarte", icon: Globe2, badge: "Neu" },
      { href: "/packs", label: "Themen-Packs", icon: LayoutGrid },
      { href: "/unlimited", label: "Unlimited", icon: InfinityIcon },
      { href: "/archiv", label: "Archiv", icon: Archive },
    ],
  },
  {
    title: "Deine Welt",
    items: [
      { href: "/grundstueck", label: "Grundstück", icon: Home },
      { href: "/figur", label: "Figur", icon: Shirt },
      { href: "/shop", label: "Shop", icon: ShoppingBag },
    ],
  },
  {
    title: "Du",
    items: [
      { href: "/profil", label: "Profil", icon: User },
      { href: "/rangliste", label: "Rangliste", icon: Trophy },
    ],
  },
  {
    title: "Mehr",
    items: [
      ...(MONETIZATION ? [{ href: "/premium", label: "Premium", icon: Crown }] : []),
      { href: "/info", label: "So funktioniert's", icon: Info },
      { href: "/admin", label: "Redaktion", icon: Settings2 },
    ],
  },
] as const;

/** Spielfigur als Kopf-Ausschnitt – vor der Wahl der einfache Avatar */
export function PlayerAvatar({ size = 38 }: { size?: number }) {
  const { character, profile } = useApp();
  return character ? <CharacterBadge c={character} size={size} /> : <AvatarBubble id={profile.avatar} size={size} />;
}

function isActive(path: string, href: string, match?: string) {
  const h = match ?? href.split("?")[0].split("#")[0];
  return h === "/" ? path === "/" : path === h || path.startsWith(h + "/");
}

function WealthPill() {
  const { wallet, attemptsLoaded, economy } = useApp();
  return (
    <Link href="/shop" className="hud group flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm transition-colors hover:border-white/30" title="Kontostand · Shop">
      <span className="bg-sunset grid size-7 place-items-center rounded-full text-[13px] font-black text-white shadow-[0_0_18px_-4px_var(--sunset-pink)]">$</span>
      <span className="font-num font-semibold tabular-nums text-white">{attemptsLoaded ? formatCash(wallet.balance) : "–"}</span>
      <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/80 sm:inline">Lvl {economy.level.level}</span>
    </Link>
  );
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = usePathname() ?? "/";
  const { user, accountsEnabled, profile } = useApp();
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
              <Link href="/profil" onClick={onClose} className="flex items-center gap-3">
                <PlayerAvatar size={40} />
                <span className="block min-w-0 truncate font-semibold">{profile.name}</span>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** Festes Seitenmenü auf breiten Bildschirmen */
function Sidebar() {
  const path = usePathname() ?? "/";
  const { user, accountsEnabled, profile, wallet, economy, attemptsLoaded } = useApp();
  return (
    <aside className="sidebar fixed inset-y-0 left-0 z-30 hidden w-[var(--side-w)] flex-col border-r border-white/[0.07] lg:flex">
      <Link href="/" className="flex h-16 shrink-0 items-center px-5" aria-label="NNAXOS – Hauptmenü">
        <Logo />
      </Link>
      <nav className="scrollbar-none flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-3">
        {MENU.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((it) => {
                const active = isActive(path, it.href, "match" in it ? it.match : undefined);
                return (
                  <li key={it.href}>
                    <Link href={it.href} className={cn("side-item group", active && "side-item-active")}>
                      <it.icon className="size-[18px] shrink-0" />
                      <span className="flex-1 truncate">{it.label}</span>
                      {"badge" in it && it.badge && <span className="bg-sunset rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">{it.badge}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/[0.07] p-3">
        <Link href="/profil" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.06]">
          <PlayerAvatar size={40} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{profile.name}</span>
            <span className="font-num block text-xs text-white/55">Lvl {economy.level.level} · {attemptsLoaded ? formatCash(wallet.balance) : "–"}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}

/** Schnellnavigation unter dem Header (Handy und Tablet) */
const QUICK = [
  { href: "/daily", label: "Daily" },
  { href: "/ranked", label: "Ranked" },
  { href: "/weltkarte", label: "Weltkarte" },
  { href: "/packs", label: "Packs" },
  { href: "/grundstueck", label: "Grundstück" },
  { href: "/figur", label: "Figur" },
  { href: "/shop", label: "Shop" },
  { href: "/rangliste", label: "Rangliste" },
  { href: "/profil", label: "Profil" },
];

function SubNav() {
  const path = usePathname() ?? "/";
  return (
    <nav className="scrollbar-none -mb-px flex gap-1 overflow-x-auto px-4 pb-2 sm:px-6 lg:hidden" aria-label="Bereiche">
      {QUICK.map((q) => {
        const active = isActive(path, q.href);
        return (
          <Link key={q.href} href={q.href} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors", active ? "bg-white text-[#140d24]" : "text-white/65 hover:bg-white/10 hover:text-white")}>
            {q.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  const { worldLoaded, character } = useApp();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const playing = path.startsWith("/play") || path.startsWith("/start");

  // Erster Besuch: zuerst eine Spielfigur wählen
  React.useEffect(() => {
    if (worldLoaded && !character && path === "/") router.replace("/start");
  }, [worldLoaded, character, path, router]);
  const home = path === "/";
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => setOpen(false), [path]);

  return (
    <SceneProvider>
      <div className="shell relative isolate min-h-dvh" data-side={playing ? "0" : "1"}>
        <SceneBackground />
        {!playing && <PalmSilhouettes />}
        <div className="grain pointer-events-none fixed -inset-[10%] z-[1]" aria-hidden />
        {!playing && <Sidebar />}
        <div className="side-offset">
          <header className={cn("top-0 z-30", home ? "absolute inset-x-0 side-offset" : "sticky border-b border-white/[0.07] bg-[rgba(10,7,18,0.55)] backdrop-blur-xl")}>
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
              <span className={cn(!playing && "lg:hidden")}>
                <button onClick={() => setOpen(true)} className="icon-btn" aria-label="Menü öffnen" aria-expanded={open}>
                  <Menu className="size-5" />
                </button>
              </span>
              {!home && (
                <Link href="/" className={cn("shrink-0", !playing && "lg:hidden")} aria-label="NNAXOS – Hauptmenü">
                  <Logo />
                </Link>
              )}
              <div className="ml-auto flex items-center gap-2">
                {!playing && <WealthPill />}
                <span className="hidden sm:block lg:hidden"><Link href="/ranked" className="icon-btn" aria-label="Ranked" title="Ranked"><Crown className="size-5" /></Link></span>
                <Link href="/profil" className="rounded-full" aria-label="Profil">
                  <PlayerAvatar size={38} />
                </Link>
              </div>
            </div>
            {!home && !playing && <SubNav />}
          </header>

          <main className={cn("relative z-[2] mx-auto max-w-7xl px-4 sm:px-6", home ? "pb-16" : playing ? "pb-10 pt-4" : "pb-20 pt-6 sm:pt-10")}>{children}</main>

          {!playing && !home && (
            <footer className="relative z-[2] mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-4 px-6 pb-10 text-xs text-white/40">
              <Link href="/info" className="hover:text-white">So funktioniert&apos;s</Link>
              <Link href="/info#bilder" className="hover:text-white">Bildnachweise</Link>
            </footer>
          )}
        </div>
        <Drawer open={open} onClose={close} />
      </div>
    </SceneProvider>
  );
}
