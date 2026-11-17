"use client";
import { motion } from "motion/react";
import { useApp } from "@/components/providers";
import { PackCard } from "@/components/pack-card";
import { PageHeader, ResetCountdown } from "@/components/bits";

export default function PacksPage() {
  const { packs, settings } = useApp();
  return (
    <div>
      <PageHeader eyebrow="Themen-Packs" title="15 Themenwelten – alle kostenlos">
        <ResetCountdown className="text-sm text-white/70" />
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <PackCard pack={p} className="h-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
