"use client";
import * as React from "react";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({ className, children, title, description, ...props }: React.ComponentProps<typeof D.Content> & { title: string; description?: string }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-[rise_0.2s_ease-out]" />
      <D.Content
        className={cn(
          "fixed inset-x-3 bottom-3 z-50 max-h-[88vh] overflow-y-auto rounded-3xl border border-white/12 bg-[rgba(18,14,32,0.96)] p-6 backdrop-blur-xl shadow-[var(--shadow-lift)] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 data-[state=open]:animate-[rise_0.25s_ease-out]",
          className,
        )}
        {...props}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <D.Title className="font-display text-3xl text-white">{title}</D.Title>
            {description ? <D.Description className="mt-1 text-sm text-fg-muted">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
          </div>
          <D.Close className="-mr-2 -mt-1 rounded-full p-2 text-fg-subtle hover:bg-surface-2 hover:text-fg" aria-label="Schliessen">
            <X className="size-5" />
          </D.Close>
        </div>
        {children}
      </D.Content>
    </D.Portal>
  );
}
