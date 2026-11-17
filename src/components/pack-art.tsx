"use client";
import { cn } from "@/lib/utils";
import { sceneSrc } from "./scene";

/** Titelbild eines Themen-Packs (generierte Bildwelt oder eigenes Foto). */
export function PackArt({ packId, className, image, alt, variant = "card" }: { packId: string; className?: string; image?: string | null; alt?: string; variant?: "card" | "full" }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image || sceneSrc(packId, variant === "card" ? "card" : "full")} alt={alt ?? ""} loading="lazy" decoding="async" className={cn("h-full w-full object-cover", className)} />;
}
