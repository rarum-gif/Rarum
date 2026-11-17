// Ruhige Waldlandschaft für den Daily-Challenge-Bereich
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2c21" />
          <stop offset="0.65" stopColor="#3a5e46" />
          <stop offset="1" stopColor="#6b7a3a" />
        </linearGradient>
        <radialGradient id="hsun" cx="0.78" cy="0.32" r="0.35">
          <stop offset="0" stopColor="#f3e2b0" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#e0d2ae" stopOpacity="0.35" />
          <stop offset="1" stopColor="#e0d2ae" stopOpacity="0" />
        </radialGradient>
        <filter id="hgrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.3 0" />
        </filter>
      </defs>
      <rect width="800" height="400" fill="url(#hsky)" />
      <rect width="800" height="400" fill="url(#hsun)" />
      <circle cx="624" cy="128" r="26" fill="#f6ead0" opacity="0.9" />
      <path d="M0 250 Q 90 200 180 232 T 360 222 T 540 236 T 720 210 T 800 220 V400 H0 Z" fill="#4f6b45" opacity="0.55" />
      <path d="M0 280 Q 120 240 220 268 T 420 256 T 620 272 T 800 250 V400 H0 Z" fill="#2f4a33" opacity="0.8" />
      {Array.from({ length: 26 }, (_, i) => {
        const x = i * 32 + ((i * 17) % 13);
        const h = 46 + ((i * 29) % 38);
        return <path key={i} d={`M${x} ${300 - h} L${x + 13} 312 L${x - 13} 312 Z M${x} ${300 - h * 0.62} L${x + 17} 322 L${x - 17} 322 Z`} fill="#1d3124" />;
      })}
      <path d="M0 318 Q 160 300 320 314 T 640 306 T 800 312 V400 H0 Z" fill="#162519" />
      <rect width="800" height="400" filter="url(#hgrain)" opacity="0.45" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
