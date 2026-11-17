// Filmischer Bildhintergrund für Hero-Bereiche
export function HeroArt({ className, src = "/images/dashboard/daily.webp" }: { className?: string; src?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" aria-hidden className={`${className ?? ""} object-cover`} />;
}
