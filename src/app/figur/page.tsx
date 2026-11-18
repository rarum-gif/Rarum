"use client";
import * as React from "react";
import Link from "next/link";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { useApp } from "@/components/providers";
import { CharacterCreator } from "@/components/character-creator";
import { presetOf, type Character } from "@/lib/game/character";
import { cn } from "@/lib/utils";

export default function FigurePage() {
  const { character, saveCharacter, worldLoaded, profile } = useApp();
  const [draft, setDraft] = React.useState<Character | null>(character);
  const [state, setState] = React.useState<"idle" | "busy" | "done" | string>("idle");
  React.useEffect(() => {
    if (character && !draft) setDraft(character);
  }, [character, draft]);
  if (!worldLoaded) return <div className="skeleton h-[60vh] rounded-[28px]" />;
  if (!character || !draft) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-5xl text-white">Noch keine Figur</h1>
        <Link href="/start" className="btn-sunset mt-6 inline-block rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-[0.16em]">Figur wählen</Link>
      </div>
    );
  }
  const dirty = JSON.stringify(draft) !== JSON.stringify(character);
  const save = async () => {
    setState("busy");
    const e = await saveCharacter(draft);
    setState(e ?? "done");
    if (!e) setTimeout(() => setState("idle"), 1500);
  };
  const p = presetOf(draft.preset);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--peach)]">{p?.role}</p>
          <h1 className="font-display text-5xl text-white sm:text-7xl">{profile.guest && profile.name === "Gast" ? p?.name : profile.name}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDraft(character)} disabled={!dirty} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white/80 disabled:opacity-40"><RotateCcw className="size-4" />Zurück</button>
          <button onClick={save} disabled={!dirty || state === "busy"} className={cn("inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em]", dirty ? "btn-sunset" : "border border-white/15 text-white/50")}>
            {state === "busy" ? <Loader2 className="size-4 animate-spin" /> : state === "done" ? <Check className="size-4" /> : null}Speichern
          </button>
        </div>
      </div>
      {state !== "idle" && state !== "busy" && state !== "done" && <p className="text-sm text-[var(--danger)]">{state}</p>}
      <CharacterCreator value={draft} onChange={setDraft} />
    </div>
  );
}
