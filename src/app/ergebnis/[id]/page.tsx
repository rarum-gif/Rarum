"use client";
import { use } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { RunSummary } from "@/components/run-summary";
import { EmptyState } from "@/components/bits";
import { Button } from "@/components/ui/button";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { attempts, attemptsLoaded } = useApp();
  const attempt = attempts.find((a) => a.id === id);
  if (!attemptsLoaded) return <div className="mx-auto max-w-3xl space-y-4"><div className="skeleton h-72 rounded-[28px]" /><div className="skeleton h-40 rounded-3xl" /></div>;
  if (!attempt)
    return (
      <EmptyState title="Ergebnis nicht gefunden">
        Dieses Ergebnis ist auf diesem Gerät nicht gespeichert.
        <div className="mt-4"><Button asChild><Link href="/">Zur Startseite</Link></Button></div>
      </EmptyState>
    );
  return <RunSummary attempt={attempt} previous={attempts.filter((a) => a.id !== attempt.id && a.finishedAt < attempt.finishedAt)} />;
}
