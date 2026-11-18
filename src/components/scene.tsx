"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

/**
 * Zentrale Hintergrund-Komponente. Jede Seite hat eine eigene Bildwelt:
 * Welten (sunset, oceandrive, downtown, night, coast, dusk, marina) oder
 * eine Pack-Welt (Pack-ID). Seiten können die Welt per <SceneOverride/> setzen.
 */

export const WORLDS = ["sunset", "oceandrive", "downtown", "night", "coast", "dusk", "marina"] as const;

const ROUTE_SCENES: [RegExp, string][] = [
  [/^\/$/, "sunset"],
  [/^\/daily/, "oceandrive"],
  [/^\/packs\/?$/, "coast"],
  [/^\/unlimited/, "night"],
  [/^\/archiv/, "dusk"],
  [/^\/rangliste/, "downtown"],
  [/^\/profil/, "marina"],
  [/^\/admin/, "night"],
  [/^\/ergebnis/, "dusk"],
  [/^\/info/, "coast"],
  [/^\/play/, "night"],
];

export function sceneSrc(name: string, variant: "full" | "mobile" | "card" = "full") {
  const isWorld = (WORLDS as readonly string[]).includes(name);
  if (isWorld) return variant === "mobile" ? `/images/backgrounds/${name}-mobile.webp` : `/images/backgrounds/${name}.webp`;
  return variant === "card" ? `/images/themes/${name}-card.webp` : `/images/themes/${name}.webp`;
}

const Ctx = React.createContext<{ override: string | null; setOverride: (s: string | null) => void }>({ override: null, setOverride: () => {} });

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = React.useState<string | null>(null);
  return <Ctx.Provider value={{ override, setOverride }}>{children}</Ctx.Provider>;
}

/** Setzt die Hintergrundwelt der aktuellen Seite */
export function SceneOverride({ scene }: { scene: string | null | undefined }) {
  const { setOverride } = React.useContext(Ctx);
  React.useEffect(() => {
    if (scene) setOverride(scene);
    return () => setOverride(null);
  }, [scene, setOverride]);
  return null;
}

export function SceneBackground({ dim = 0.55 }: { dim?: number }) {
  const path = usePathname() ?? "/";
  const { override } = React.useContext(Ctx);
  const reduce = useReducedMotion();
  const routeScene = ROUTE_SCENES.find(([re]) => re.test(path))?.[1] ?? (path.startsWith("/packs/") ? path.split("/")[2] : "sunset");
  const scene = override ?? routeScene;
  const playing = path.startsWith("/play");

  // sanfte Parallaxe mit der Maus
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const tx = useTransform(sx, (v) => v * -14);
  const ty = useTransform(sy, (v) => v * -10);
  React.useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  const isWorld = (WORLDS as readonly string[]).includes(scene);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--warm-black)]" aria-hidden>
      <motion.div key={scene} className="absolute -inset-6" style={{ x: tx, y: ty }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
        <picture>
          {isWorld && <source media="(max-width: 640px)" srcSet={sceneSrc(scene, "mobile")} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sceneSrc(scene)} alt="" className="kenburns h-full w-full object-cover" decoding="async" fetchPriority="high" />
        </picture>
      </motion.div>
      {/* lebendiger Sunset-Schimmer */}
      <div className="skyshift absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,122,69,0.25),transparent_70%)]" />
      {/* Lesbarkeit: Verlauf von oben nach unten */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(10,8,18,${dim * 0.55}) 0%, rgba(10,8,18,${dim * 0.75}) 40%, rgba(10,8,18,${playing ? 0.9 : dim + 0.25}) 100%)` }} />
      {playing && <div className="absolute inset-0 backdrop-blur-[3px]" />}
    </div>
  );
}
