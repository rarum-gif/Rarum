"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { useApp } from "./providers";
import { CharacterArt } from "./character";
import { ItemArt } from "./world/item-art";
import { BACKDROPS, FACIAL, HAIR_COLORS, HAIR_STYLES, SKINS, type Character } from "@/lib/game/character";
import { CATALOG, type WearSlot } from "@/lib/game/catalog";
import { cn } from "@/lib/utils";

const SLOTS: { slot: WearSlot; label: string; optional: boolean }[] = [
  { slot: "top", label: "Oberteil", optional: false },
  { slot: "head", label: "Kopf", optional: true },
  { slot: "eyes", label: "Brille", optional: true },
  { slot: "neck", label: "Hals", optional: true },
  { slot: "ears", label: "Ohren", optional: true },
];

function Swatch({ color, active, onClick, label, gradient }: { color: string; active: boolean; onClick: () => void; label: string; gradient?: string }) {
  return (
    <button onClick={onClick} aria-label={label} aria-pressed={active} title={label}
      className={cn("size-9 rounded-full transition-transform hover:scale-110", active ? "ring-2 ring-white ring-offset-2 ring-offset-[#120e20]" : "opacity-85")}
      style={{ background: gradient ?? color }} />
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={cn("rounded-full px-3 py-1.5 text-xs font-bold transition-colors", active ? "bg-white text-[#140d24]" : "border border-white/15 text-white/75 hover:text-white")}>
      {children}
    </button>
  );
}

export function CharacterCreator({ value, onChange, wardrobe = true }: { value: Character; onChange: (c: Character) => void; wardrobe?: boolean }) {
  const { owns } = useApp();
  const set = <K extends keyof Character>(k: K, v: Character[K]) => onChange({ ...value, [k]: v });
  const [tab, setTab] = React.useState<"look" | "outfit">("look");
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(240px,340px)_minmax(0,1fr)]">
      <div className="flex justify-center lg:sticky lg:top-24 lg:self-start">
        <motion.div key={value.preset} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="idle-breathe drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
          <CharacterArt c={value} size={300} />
        </motion.div>
      </div>
      <div className="glass rounded-[24px] p-4 sm:p-5">
        {wardrobe && (
          <div className="mb-4 flex gap-1.5">
            <Chip active={tab === "look"} onClick={() => setTab("look")}>Aussehen</Chip>
            <Chip active={tab === "outfit"} onClick={() => setTab("outfit")}>Outfit</Chip>
          </div>
        )}
        {tab === "look" ? (
          <div className="space-y-5">
            <Group label="Haut">{SKINS.map((s) => <Swatch key={s.id} color={s.color} label={s.id} active={value.skin === s.id} onClick={() => set("skin", s.id)} />)}</Group>
            <Group label="Frisur">{HAIR_STYLES.map((h) => <Chip key={h.id} active={value.hair === h.id} onClick={() => set("hair", h.id)}>{h.label}</Chip>)}</Group>
            <Group label="Haarfarbe">{HAIR_COLORS.map((h) => <Swatch key={h.id} color={h.color} label={h.id} active={value.hairColor === h.id} onClick={() => set("hairColor", h.id)} />)}</Group>
            <Group label="Bart">{FACIAL.map((f) => <Chip key={f.id} active={value.facial === f.id} onClick={() => set("facial", f.id)}>{f.label}</Chip>)}</Group>
            <Group label="Hintergrund">{BACKDROPS.map((b) => <Swatch key={b.id} color={b.from} gradient={`linear-gradient(140deg, ${b.from}, ${b.to})`} label={b.id} active={value.backdrop === b.id} onClick={() => set("backdrop", b.id)} />)}</Group>
          </div>
        ) : (
          <div className="space-y-5">
            {SLOTS.map(({ slot, label, optional }) => {
              const items = CATALOG.filter((i) => i.kind === "wear" && i.wear?.slot === slot && owns(i.id) > 0);
              return (
                <div key={slot}>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">{label}</p>
                  <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
                    {optional && (
                      <button onClick={() => set(slot, null)} aria-pressed={value[slot] === null} className={cn("grid h-20 w-16 shrink-0 place-items-center rounded-xl border text-xs font-bold text-white/70", value[slot] === null ? "border-white bg-white/10" : "border-white/12")}>Ohne</button>
                    )}
                    {items.map((it) => (
                      <button key={it.id} onClick={() => set(slot, it.id)} aria-pressed={value[slot] === it.id} title={it.name}
                        className={cn("h-20 w-16 shrink-0 overflow-hidden rounded-xl border bg-white/[0.04] p-0.5", value[slot] === it.id ? "border-white ring-2 ring-white/40" : "border-white/12 hover:border-white/30")}>
                        <ItemArt item={it} character={value} size={80} />
                      </button>
                    ))}
                    <Link href="/shop" className="grid h-20 w-16 shrink-0 place-items-center rounded-xl border border-dashed border-white/20 text-white/55 hover:text-white" title="Mehr im Shop"><ShoppingBag className="size-5" /></Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
