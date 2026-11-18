"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useApp } from "@/components/providers";
import { CharacterArt } from "@/components/character";
import { CharacterCreator } from "@/components/character-creator";
import { Input } from "@/components/ui/input";
import { PRESETS, type Character } from "@/lib/game/character";
import { cn } from "@/lib/utils";

/** Erster Start: Figur wählen, anpassen, benennen – dann ins Spiel. */
function StartInner() {
  const { saveCharacter, saveProfile, profile, character } = useApp();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [step, setStep] = React.useState<0 | 1>(0);
  const [pick, setPick] = React.useState<Character | null>(character);
  const [name, setName] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!profile.guest || profile.name !== "Gast") setName(profile.name);
  }, [profile]);

  const choose = (i: number) => {
    const { name: n, role: _r, ...c } = PRESETS[i];
    setPick(c);
    if (!name) setName(n);
  };

  const finish = async () => {
    if (!pick) return;
    setBusy(true);
    setErr(null);
    const e1 = await saveCharacter(pick);
    const e2 = e1 ?? (name.trim() && name.trim() !== profile.name ? await saveProfile({ name: name.trim(), avatar: profile.avatar }) : null);
    setBusy(false);
    if (e1 || e2) return setErr(e1 ?? e2);
    router.replace(next);
  };

  return (
    <div className="mx-auto max-w-6xl py-4">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.section key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }}>
            <p className="text-center text-[11px] font-black uppercase tracking-[0.4em] text-[var(--peach)]">Willkommen auf Naxos</p>
            <h1 className="font-display mt-2 text-center text-6xl text-white sm:text-8xl">Wer bist du?</h1>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PRESETS.map((p, i) => {
                const active = pick?.preset === p.preset;
                return (
                  <motion.button key={p.preset} onClick={() => choose(i)} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -6 }}
                    aria-pressed={active}
                    className={cn("group relative overflow-hidden rounded-[26px] border-2 text-left transition-colors", active ? "border-white shadow-[0_0_0_4px_rgba(255,46,136,0.35)]" : "border-transparent")}>
                    <CharacterArt c={p} size={400} className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.04]" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-10">
                      <span className="font-display block text-3xl leading-none text-white">{p.name}</span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">{p.role}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <div className="sticky bottom-4 z-10 mt-8 flex justify-center">
              <button disabled={!pick} onClick={() => setStep(1)} className={cn("inline-flex items-center gap-3 rounded-2xl px-8 py-4 font-display text-3xl tracking-[0.1em]", pick ? "btn-sunset" : "border border-white/15 text-white/40")}>
                Weiter <ArrowRight className="size-6" />
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section key="edit" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"><ArrowLeft className="size-4" />Andere Figur</button>
              <div className="w-full max-w-xs">
                <label htmlFor="pname" className="mb-1 block text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Spielername</label>
                <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoComplete="off" />
              </div>
            </div>
            {pick && <CharacterCreator value={pick} onChange={setPick} wardrobe={false} />}
            {err && <p className="mt-4 text-center text-sm text-[var(--danger)]">{err}</p>}
            <div className="mt-8 flex justify-center">
              <button onClick={finish} disabled={busy} className="btn-sunset inline-flex items-center gap-3 rounded-2xl px-8 py-4 font-display text-3xl tracking-[0.1em]">
                {busy && <Loader2 className="size-6 animate-spin" />}Los geht&apos;s
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StartPage() {
  return (
    <React.Suspense fallback={null}>
      <StartInner />
    </React.Suspense>
  );
}
