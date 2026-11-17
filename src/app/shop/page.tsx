"use client";
import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Check, Lock, ShoppingBag, Sparkles } from "lucide-react";
import { useApp } from "@/components/providers";
import { PageHeader } from "@/components/bits";
import { SceneOverride } from "@/components/scene";
import { canBuy, cashMultiplier, SHOP, TIER_CASH } from "@/lib/game/economy";
import { formatCash } from "@/lib/game/wealth";
import { cn } from "@/lib/utils";

export default function ShopPage() {
  const { economy, purchases, wallet, buy, attemptsLoaded } = useApp();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ ok: boolean; text: string } | null>(null);
  const lvl = economy.level;
  const owned = new Set(purchases.map((p) => p.itemId));

  const onBuy = async (id: string, name: string) => {
    setBusy(id);
    const err = await buy(id);
    setBusy(null);
    setToast(err ? { ok: false, text: err } : { ok: true, text: `${name} gehört jetzt dir!` });
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div>
      <SceneOverride scene="marina" />
      <PageHeader eyebrow="Shop" title="Kauf dir dein Imperium" />

      <section className="glass mb-8 grid gap-4 rounded-[28px] p-5 sm:grid-cols-3 sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">Kontostand</p>
          <p className="font-num text-4xl font-semibold text-white">{attemptsLoaded ? formatCash(wallet.balance, { compact: false }) : "–"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">Level {lvl.level} · {lvl.title}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="bg-sunset h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.round(lvl.progress * 100)}%` }} transition={{ duration: 0.9 }} />
          </div>
          <p className="mt-1.5 font-num text-xs text-white/60">{lvl.xp} XP · noch {lvl.toNext} bis Level {lvl.level + 1}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">Pro richtige Antwort</p>
          <p className="font-num text-2xl font-semibold text-white">{formatCash(Math.round(TIER_CASH.known * cashMultiplier(lvl.level)))} – {formatCash(Math.round(TIER_CASH.legendary * cashMultiplier(lvl.level)))}</p>
          <p className="text-xs text-white/55">×{cashMultiplier(lvl.level).toFixed(1)} durch dein Level</p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHOP.map((item, i) => {
          const has = owned.has(item.id);
          const reason = has ? null : canBuy(item, economy, purchases);
          const locked = !has && economy.level.level < item.minLevel;
          return (
            <motion.article key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.05 }}
              className={cn("group relative overflow-hidden rounded-[24px] border bg-[rgba(12,8,22,0.6)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1", has ? "border-[var(--gold)]/60" : "border-white/12 hover:border-white/30")}>
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/wealth/${item.image}.webp`} alt="" loading="lazy" className={cn("h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-110", locked && "grayscale-[60%] brightness-75")} />
                <span className="absolute inset-0 bg-gradient-to-t from-[rgba(12,8,22,0.95)] via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur">{item.category}</span>
                {has && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-black"><Check className="size-3" />Dein</span>}
                {locked && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white"><Lock className="size-3" />Level {item.minLevel}</span>}
                <h3 className="font-display absolute bottom-2 left-4 text-4xl tracking-wide text-white">{item.name}</h3>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/70">{item.line}</p>
                  <p className="font-num text-xl font-semibold text-white">{formatCash(item.price, { compact: false })}</p>
                </div>
                {has ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)]"><Sparkles className="size-4" />Gekauft</span>
                ) : (
                  <button onClick={() => onBuy(item.id, item.name)} disabled={!!reason || busy === item.id}
                    className={cn("shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition-all", reason ? "cursor-not-allowed border border-white/15 text-white/45" : "btn-sunset hover:-translate-y-0.5")}>
                    {reason ? (locked ? "Gesperrt" : "Zu teuer") : busy === item.id ? "…" : "Kaufen"}
                  </button>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-white/60">
        <ShoppingBag className="mr-1 inline size-4" />Geld verdienst du mit jeder richtigen Antwort. <Link href="/play?mode=daily" className="font-semibold text-[var(--peach)] hover:text-white">Jetzt spielen ›</Link>
      </p>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={cn("fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border px-5 py-3 font-semibold backdrop-blur-xl", toast.ok ? "border-[var(--gold)]/50 bg-[rgba(30,20,6,0.85)] text-[var(--gold)]" : "border-white/20 bg-[rgba(12,8,22,0.85)] text-white")}
            role="status">
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
