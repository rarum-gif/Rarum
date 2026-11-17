import { Logo } from "@/components/bits";

// Ladebildschirm im Sunset-Look
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="animate-[pulse-soft_1.6s_ease-in-out_infinite]"><Logo /></div>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <div className="bg-sunset h-full w-1/2 animate-[sheen_1.2s_ease-in-out_infinite]" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">Lade die Welt …</p>
    </div>
  );
}
