import { cn } from "@/lib/utils";

export function Progress({ value, className, barClassName, style }: { value: number; className?: string; barClassName?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-3", className)} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full bg-accent transition-[width] duration-700 ease-out", barClassName)} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, ...style }} />
    </div>
  );
}
