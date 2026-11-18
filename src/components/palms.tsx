/** Palmen-Silhouetten im Vordergrund – wiegen sich langsam im Wind (nur CSS, sehr leicht) */
function Palm({ x, h, flip = false, delay = 0, scale = 1 }: { x: number; h: number; flip?: boolean; delay?: number; scale?: number }) {
  const top = 400 - h;
  const frond = (rot: number, len: number, i: number) => (
    <path key={i} d={`M0 0 C ${len * 0.35} -${len * 0.28} ${len * 0.7} -${len * 0.18} ${len} ${len * 0.22} C ${len * 0.62} ${len * 0.02} ${len * 0.3} ${len * 0.02} 0 0 Z`} transform={`rotate(${rot})`} />
  );
  return (
    <g transform={`translate(${x} 0) scale(${flip ? -scale : scale} ${scale})`} style={{ transformOrigin: `${x}px 400px` }}>
      <path d={`M0 400 C 6 ${400 - h * 0.4} 22 ${400 - h * 0.75} 30 ${top}`} stroke="currentColor" strokeWidth={9} fill="none" strokeLinecap="round" />
      <g transform={`translate(30 ${top})`}>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-3;4;-3" dur="6.5s" begin={`${delay}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
          {[-170, -140, -105, -70, -35, -5, 20].map((r, i) => frond(r, 70 + (i % 3) * 14, i))}
        </g>
      </g>
    </g>
  );
}

export function PalmSilhouettes() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1] hidden h-[46vh] text-[#07040d] opacity-80 md:block" aria-hidden>
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMinYMax meet" className="absolute bottom-0 left-0 h-full">
        <Palm x={10} h={330} delay={0} />
        <Palm x={70} h={250} delay={-1.6} scale={0.85} />
      </svg>
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMaxYMax meet" className="absolute bottom-0 right-0 h-full">
        <Palm x={390} h={350} flip delay={-0.8} />
        <Palm x={330} h={240} flip delay={-2.4} scale={0.8} />
      </svg>
    </div>
  );
}
