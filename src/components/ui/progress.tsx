import { cn } from "@/lib/utils";

export function Progress({ value, className, barClassName, style }: { value: number; className?: string; barClassName?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-3", className)} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("bg-sunset h-full rounded-full shadow-[0_0_12px_rgba(255,106,85,0.8)] transition-[width] duration-700 ease-out", barClassName)} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, ...style }} />
    </div>
  );
}
