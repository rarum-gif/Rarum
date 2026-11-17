import { Suspense } from "react";
import type { Metadata } from "next";
import { PlayClient } from "./play-client";

export const metadata: Metadata = { title: "Spielen" };

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <PlayClient />
    </Suspense>
  );
}
