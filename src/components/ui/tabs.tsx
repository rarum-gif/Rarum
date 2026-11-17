"use client";
import * as React from "react";
import * as T from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = T.Root;
export const TabsContent = T.Content;

export function TabsList({ className, ...props }: React.ComponentProps<typeof T.List>) {
  return <T.List className={cn("glass inline-flex rounded-2xl p-1", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof T.Trigger>) {
  return (
    <T.Trigger
      className={cn(
        "rounded-xl px-4 py-1.5 text-sm font-semibold text-fg-muted transition-all hover:text-white data-[state=active]:bg-sunset data-[state=active]:text-white data-[state=active]:shadow-[0_6px_18px_-6px_rgba(255,106,85,0.9)]",
        className,
      )}
      {...props}
    />
  );
}
