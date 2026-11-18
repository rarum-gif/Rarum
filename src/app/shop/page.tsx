"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Crown, Lock, Sparkles } from "lucide-react";
import { useApp } from "@/components/providers";
import { SceneOverride } from "@/components/scene";
import { ItemArt } from "@/components/world/item-art";
import { CATALOG, CATEGORIES, type CatalogItem, type Category } from "@/lib/game/catalog";
import { canBuy, cashMultiplier, TIER_CASH } from "@/lib/game/economy";
import { formatCash } from "@/lib/game/wealth";
import { cn } from "@/lib/utils";

type Filter = "alle" | "kaufbar" | "besitz";

export default function ShopPage() {
  const { economy, purchases, wallet, buy, attemptsLoaded, owns, premium, character, saveCharacter } = useApp();
  const router = useRouter();
  const [cat, setCat] = React.useState<Category | "alle">("alle");
  const [filter, setFilter] = React.useState<Filter>("alle");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [unlocked, setUnlocked] = React.useState<CatalogItem | null>(null);
  const lvl = economy.level;

  const list = CATALOG.filter((i) => i.price > 0 && (cat === "alle" || i.category === cat)).filter((i) => {
    if (filter === "besitz") return owns(i.id) > 0;
    if (filter === "kaufbar") return !canBuy(i, economy, purchases, premium.active);
    return true;
  });

  const onBuy = async (item: CatalogItem) => {
    setBusy(item.id);
    setError(null);
    const err = await buy(item.id);
    setBusy(null);
    if (err) {
      setError(err);
      setTimeout(() => setError(null), 2600);
    } else setUnlocked(item);
  };

  const wear = async (item: CatalogItem) => {
    if (!character || !item.wear) return;
    await saveCharacter({ ...character, [item.wear.slot]: item.id });
    setUnlocked(null);
    router.push("/figur");
  };

  return (
    <div>
      <SceneOverride scene="marina" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl text-white sm:text-7xl">Shop</h1>
        <div className="flex flex-wrap gap-3">
          <div className="hud rounded-2xl px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">Kontostand</p>
            <p className="font-num text-2xl font-semibold text-white">{attemptsLoaded ? formatCash(wallet.balance, { compact: false }) : "–"}</p>
          </div>
          <div className="hud rounded-2xl px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">Level {lvl.level}</p>
            <p className="font-num text-2xl font-semibold text-white">{formatCash(Math.round(TIER_CASH.known * cashMultiplier(lvl.level)))}+<span className="text-sm text-white/55"> / Antwort</span></p>
          </div>
        </div>
      </div>

      <div className="sticky top-[100px] z-20 -mx-4 mb-5 flex flex-col gap-2 bg-gradient-to-b from-[rgba(10,7,18,0.85)] to-transparent px-4 pb-3 pt-1 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-16">
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
          {[{ id: "alle" as const, label: "Alles" }, ...CATEGORIES].map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors", cat === c.id ? "bg-white text-[#140d24]" : "border border-white/15 text-white/70 hover:text-white")}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["alle", "kaufbar", "besitz"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]", filter === f ? "bg-[var(--peach)]/25 text-[var(--peach)]" : "text-white/50 hover:text-white")}>
              {f === "alle" ? "Alle" : f === "kaufbar" ? "Kaufbar" : "Im Besitz"}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {list.map((item) => {
            const n = owns(item.id);
            const max = item.stack ?? 1;
            const reason = canBuy(item, economy, purchases, premium.active);
            const locked = economy.level.level < item.minLevel;
            const full = n >= max;
            return (
              <motion.article key={item.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}
                className={cn("group relative flex flex-col overflow-hidden rounded-[22px] border bg-[rgba(12,8,22,0.62)] backdrop-blur-md transition-colors", n > 0 ? "border-[var(--gold)]/50" : item.premium ? "border-[#b98cff]/45" : "border-white/12 hover:border-white/30")}>
                <div className={cn("relative flex h-36 items-end justify-center bg-[radial-gradient(circle_at_50%_70%,rgba(255,255,255,0.10),transparent_65%)] px-3 pt-3 transition-transform duration-500 group-hover:-translate-y-1", locked && "opacity-70 saturate-50")}>
                  <ItemArt item={item} character={character} size={130} />
                </div>
                <div className="absolute left-2.5 top-2.5 flex gap-1">
                  {item.premium && <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#8a4fff] to-[#ff2e88] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-white"><Crown className="size-3" />Premium</span>}
                  {locked && <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white"><Lock className="size-3" />Lvl {item.minLevel}</span>}
                </div>
                {n > 0 && <span className="absolute right-2.5 top-2.5 rounded-full bg-[var(--gold)] px-2 py-0.5 text-[10px] font-black text-black">{max > 1 ? `${n}/${max}` : "Dein"}</span>}
                <div className="mt-auto flex items-end justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-white">{item.name}</h3>
                    <p className="font-num text-base font-semibold text-white/85">{formatCash(item.price, { compact: item.price >= 100000 })}</p>
                  </div>
                  {full ? (
                    <Sparkles className="size-5 shrink-0 text-[var(--gold)]" />
                  ) : (
                    <button onClick={() => onBuy(item)} disabled={!!reason || busy === item.id} title={reason ?? "Kaufen"}
                      className={cn("shrink-0 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-all", reason ? "cursor-not-allowed border border-white/12 text-white/40" : "btn-sunset hover:-translate-y-0.5 active:scale-95")}>
                      {busy === item.id ? "…" : reason === "Nur mit Premium." ? "Premium" : locked ? "Gesperrt" : reason ? "Zu teuer" : "Kaufen"}
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {!premium.active && (
        <Link href="/premium" className="mt-8 flex items-center justify-between gap-3 rounded-[22px] border border-[#b98cff]/40 bg-gradient-to-r from-[rgba(138,79,255,0.25)] to-[rgba(255,46,136,0.18)] px-5 py-4 transition hover:-translate-y-0.5">
          <span className="flex items-center gap-3"><Crown className="size-6 text-[#d9c2ff]" /><span className="font-display text-3xl text-white">NNAXOS Premium</span></span>
          <span className="text-sm font-bold text-white/80">Ansehen ›</span>
        </Link>
      )}

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-white/20 bg-[rgba(12,8,22,0.9)] px-5 py-3 font-semibold text-white backdrop-blur-xl" role="status">
            {error}
          </motion.div>
        )}
        {unlocked && <UnlockModal item={unlocked} character={character} onClose={() => setUnlocked(null)} onPlace={() => router.push("/grundstueck")} onWear={() => wear(unlocked)} />}
      </AnimatePresence>
    </div>
  );
}

function UnlockModal({ item, character, onClose, onPlace, onWear }: { item: CatalogItem; character: ReturnType<typeof useApp>["character"]; onClose: () => void; onPlace: () => void; onWear: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div role="dialog" aria-label="Neu freigeschaltet" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", damping: 18, stiffness: 220 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-[var(--gold)]/50 bg-[rgba(18,12,30,0.96)] p-6 text-center">
        {/* Lichtstrahlen */}
        <motion.div className="pointer-events-none absolute left-1/2 top-[38%] size-[520px] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(242,193,78,0.22)_20deg,transparent_40deg,transparent_60deg,rgba(255,46,136,0.18)_80deg,transparent_100deg)]" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
        {Array.from({ length: 14 }, (_, i) => (
          <motion.span key={i} className="pointer-events-none absolute left-1/2 top-[38%] size-2 rounded-full" style={{ background: i % 2 ? "#f2c14e" : "#ff2e88" }}
            initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: Math.cos((i / 14) * Math.PI * 2) * 150, y: Math.sin((i / 14) * Math.PI * 2) * 110, opacity: 0 }} transition={{ duration: 1.1, ease: "easeOut" }} />
        ))}
        <p className="relative text-[11px] font-black uppercase tracking-[0.35em] text-[var(--gold)]">Neu freigeschaltet</p>
        <motion.div className="relative mx-auto my-4 flex h-44 items-end justify-center" initial={{ scale: 0.4, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 10, stiffness: 160, delay: 0.1 }}>
          <ItemArt item={item} character={character} size={170} />
        </motion.div>
        <h2 className="font-display relative text-4xl text-white">{item.name}</h2>
        <div className="relative mt-5 flex justify-center gap-2">
          {(item.kind === "place") && <button onClick={onPlace} className="btn-sunset rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em]">Platzieren</button>}
          {item.kind === "wear" && character && <button onClick={onWear} className="btn-sunset rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em]">Anziehen</button>}
          {(item.kind === "dock" || item.kind === "plot" || item.kind === "theme") && <button onClick={onPlace} className="btn-sunset rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em]">Ansehen</button>}
          <button onClick={onClose} className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white/80 hover:text-white">Weiter</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
