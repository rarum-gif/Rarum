import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-line bg-white/6 px-4 text-[15px] text-fg placeholder:text-fg-subtle transition-colors focus:border-[var(--peach)] focus:outline-none focus:ring-4 focus:ring-[rgba(255,122,69,0.2)]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn("w-full rounded-xl border border-line bg-white/6 px-4 py-3 text-[15px] text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-fg-muted", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-11 w-full rounded-xl border border-line bg-[#1a1528] px-3 text-[15px] text-fg focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15", className)} {...props} />;
}
