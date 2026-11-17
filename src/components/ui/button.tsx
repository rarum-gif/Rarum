import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-2xl font-semibold transition-all duration-300 select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg:last-child]:translate-x-0.5",
  {
    variants: {
      variant: {
        primary: "bg-sunset text-white glow-sunset hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_50px_-10px_rgba(255,106,85,0.95)] before:absolute before:inset-y-0 before:left-0 before:w-1/3 before:bg-white/25 before:blur-md before:-translate-x-[150%] hover:before:animate-[sheen_0.9s_ease-out]",
        secondary: "glass text-fg hover:border-white/30 hover:bg-white/10",
        ghost: "text-fg-muted hover:text-white hover:bg-white/8",
        sand: "bg-sunset text-white glow-sunset uppercase tracking-[0.12em] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_50px_-10px_rgba(255,106,85,0.95)] before:absolute before:inset-y-0 before:left-0 before:w-1/3 before:bg-white/25 before:blur-md before:-translate-x-[150%] hover:before:animate-[sheen_0.9s_ease-out]",
        danger: "bg-danger-soft text-danger border border-[rgba(255,93,115,0.3)] hover:brightness-110",
        outlineLight: "border border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15 hover:border-white/50",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-[15px] [&_svg]:size-[18px]",
        lg: "h-14 px-8 text-[15px] [&_svg]:size-5",
        icon: "h-10 w-10 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";

export { buttonVariants };
