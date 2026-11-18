"use client";
import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Eye, Hammer, Loader2, Move, ShoppingBag, Trash2, X } from "lucide-react";
import { useApp } from "@/components/providers";
import { EstateView } from "@/components/world/estate-view";
import { CharacterBadge } from "@/components/character";
import { ENV_STYLE, ItemArt } from "@/components/world/item-art";
import { CATALOG, catalogItem, type EnvId } from "@/lib/game/catalog";
import { canPlaceAt, findFreeSpot, ownedEnvs, type Estate } from "@/lib/game/estate";
import { formatCash } from "@/lib/game/wealth";
import { cn } from "@/lib/utils";

type Armed = { id: string; uid?: string } | null;

export default function EstatePage() {
  const { estate, plot, saveEstate, purchases, owns, character, worldLoaded } = useApp();
  const [draft, setDraft] = React.useState<Estate>(estate);
  const [editing, setEditing] = React.useState(false);
  const [armed, setArmed] = React.useState<Armed>(null);
  const [hover, setHover] = React.useState<{ x: number; y: number }>({ x: -1, y: -1 });
  const [selected, setSelected] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved" | string>("idle");
  const first = React.useRef(true);

  React.useEffect(() => {
    if (!editing) setDraft(estate);
  }, [estate, editing]);

  const persist = React.useCallback(async (next: Estate) => {
    setDraft(next);
    setStatus("saving");
    const err = await saveEstate(next);
    setStatus(err ?? "saved");
  }, [saveEstate]);

  React.useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (status === "saved") { const t = setTimeout(() => setStatus("idle"), 1600); return () => clearTimeout(t); }
  }, [status]);

  const placeables = CATALOG.filter((i) => i.kind === "place" && owns(i.id) > 0);
  const boats = CATALOG.filter((i) => i.kind === "dock" && owns(i.id) > 0);
  const placedCount = (id: string) => draft.items.filter((p) => p.id === id).length;
  const envs = ownedEnvs(purchases);
  const value = draft.items.reduce((s, p) => s + (catalogItem(p.id)?.price ?? 0), 0) + boats.reduce((s, b) => s + b.price, 0);

  const onTile = (x: number, y: number) => {
    if (!armed) { setSelected(null); return; }
    if (!canPlaceAt(draft, armed.id, x, y, plot, armed.uid)) return;
    const items = armed.uid
      ? draft.items.map((p) => (p.uid === armed.uid ? { ...p, x, y } : p))
      : [...draft.items, { uid: `${armed.id}-${Date.now().toString(36)}`, id: armed.id, x, y }];
    void persist({ ...draft, items });
    // gleiches Objekt weiter platzieren, solange noch welche übrig sind
    if (armed.uid || placedCount(armed.id) + 1 >= owns(armed.id)) setArmed(null);
  };

  const arm = (id: string) => {
    setSelected(null);
    if (placedCount(id) >= owns(id)) return;
    setArmed({ id });
    setEditing(true);
  };

  const quickPlace = (id: string) => {
    const spot = findFreeSpot(draft, id, plot);
    if (!spot) return setStatus("Kein freier Platz – erweitere dein Grundstück im Shop.");
    void persist({ ...draft, items: [...draft.items, { uid: `${id}-${Date.now().toString(36)}`, id, x: spot.x, y: spot.y }] });
  };

  const remove = (uid: string) => {
    void persist({ ...draft, items: draft.items.filter((p) => p.uid !== uid) });
    setSelected(null);
  };

  const ghost = armed && hover.x >= 0 ? { id: armed.id, x: hover.x, y: hover.y, ok: canPlaceAt(draft, armed.id, hover.x, hover.y, plot, armed.uid) } : null;
  const sel = selected ? draft.items.find((p) => p.uid === selected) : null;

  if (!worldLoaded) return <div className="skeleton h-[60vh] rounded-[28px]" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-5xl text-white sm:text-7xl">Grundstück</h1>
          <p className="font-num mt-1 text-sm text-white/65">{plot} × {plot} Felder · Wert {formatCash(value)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence>
            {status !== "idle" && (
              <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("rounded-full px-3 py-1.5 text-xs font-bold", status === "saved" ? "bg-[var(--success)]/20 text-[var(--success)]" : status === "saving" ? "bg-white/10 text-white/70" : "bg-[var(--danger)]/20 text-[var(--danger)]")}>
                {status === "saving" ? <Loader2 className="inline size-3.5 animate-spin" /> : status === "saved" ? <><Check className="mr-1 inline size-3.5" />Gespeichert</> : status}
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={() => { setEditing((v) => !v); setArmed(null); setSelected(null); }} className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition-all", editing ? "bg-white text-[#140d24]" : "btn-sunset")}>
            {editing ? <><Eye className="size-4" />Ansehen</> : <><Hammer className="size-4" />Gestalten</>}
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative self-start">
          <EstateView
            estate={draft}
            size={plot}
            boats={boats}
            editing={editing}
            selected={selected}
            ghost={ghost}
            onTile={onTile}
            onHover={(x, y) => setHover({ x, y })}
            onItem={(uid) => { if (!armed) setSelected(uid); }}
            className="aspect-[4/3] w-full rounded-[28px] border border-white/12 shadow-[var(--shadow-lift)] sm:aspect-[16/10]"
          />
          {character && (
            <Link href="/figur" className="absolute bottom-3 left-3 hidden items-center gap-2 rounded-full border border-white/20 bg-black/45 py-1 pl-1 pr-3 text-xs font-bold text-white backdrop-blur sm:flex">
              <CharacterBadge c={character} size={32} />
              Dein Anwesen
            </Link>
          )}
          <AnimatePresence>
            {(armed || sel) && editing && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/15 bg-[rgba(12,8,22,0.85)] p-3 backdrop-blur-xl sm:inset-x-auto sm:right-3 sm:min-w-80">
                {armed ? (
                  <>
                    <span className="text-sm font-semibold text-white">{catalogItem(armed.id)?.name}: Feld antippen</span>
                    <button onClick={() => setArmed(null)} className="icon-btn" aria-label="Abbrechen"><X className="size-4" /></button>
                  </>
                ) : sel ? (
                  <>
                    <span className="text-sm font-semibold text-white">{catalogItem(sel.id)?.name}</span>
                    <span className="flex gap-2">
                      <button onClick={() => { setArmed({ id: sel.id, uid: sel.uid }); setSelected(null); }} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"><Move className="size-4" />Verschieben</button>
                      <button onClick={() => remove(sel.uid)} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--danger)]/25 px-3 py-2 text-xs font-bold text-white hover:bg-[var(--danger)]/40"><Trash2 className="size-4" />Einlagern</button>
                    </span>
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-4">
          <section className="glass rounded-[24px] p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Umgebung</p>
            <div className="grid grid-cols-3 gap-2">
              {(["strand", "downtown", "insel", "neon", "dach"] as EnvId[]).map((id) => {
                const has = envs.includes(id);
                return (
                  <button key={id} disabled={!has} onClick={() => void persist({ ...draft, env: id })} title={ENV_STYLE[id].label}
                    className={cn("relative h-14 overflow-hidden rounded-xl border text-[10px] font-bold uppercase tracking-wider text-white transition", draft.env === id ? "border-white ring-2 ring-white/40" : "border-white/15", !has && "opacity-35")}
                    style={{ background: ENV_STYLE[id].sky }}>
                    <span className="absolute inset-x-0 bottom-1 drop-shadow">{ENV_STYLE[id].label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="glass rounded-[24px] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Inventar</p>
              <Link href="/shop" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--peach)] hover:text-white"><ShoppingBag className="size-3.5" />Shop</Link>
            </div>
            {placeables.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 p-5 text-center">
                <p className="font-display text-2xl text-white">Noch leer</p>
                <Link href="/shop" className="btn-sunset mt-3 inline-block rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.14em]">Zum Shop</Link>
              </div>
            ) : (
              <div className="scrollbar-none grid max-h-[46vh] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 xl:grid-cols-3">
                {placeables.map((it) => {
                  const left = owns(it.id) - placedCount(it.id);
                  return (
                    <button key={it.id} onClick={() => (editing ? arm(it.id) : quickPlace(it.id))} disabled={left <= 0}
                      className={cn("group relative flex flex-col items-center rounded-xl border bg-white/[0.04] p-1.5 transition", armed?.id === it.id ? "border-[var(--cyan,#35e0ff)] bg-white/10" : "border-white/10 hover:border-white/30", left <= 0 && "opacity-40")}
                      title={it.name}>
                      <span className="h-16 w-full"><ItemArt item={it} size={64} /></span>
                      <span className="mt-1 w-full truncate text-[10px] font-semibold text-white/85">{it.name}</span>
                      <span className="font-num absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-[10px] font-bold text-white">{left}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {boats.length > 0 && <p className="mt-3 text-xs text-white/55">Boote liegen automatisch am Steg.</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}
