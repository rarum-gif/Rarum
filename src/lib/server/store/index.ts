import "server-only";
import path from "node:path";
import { isSupabaseConfigured } from "@/lib/config";
import type { ContentStore } from "./types";
import { FileStore } from "./file-store";
import { SupabaseStore } from "./supabase-store";

const g = globalThis as unknown as { __rarumStore?: ContentStore };

export function getStore(): ContentStore {
  if (!g.__rarumStore) {
    g.__rarumStore = isSupabaseConfigured()
      ? new SupabaseStore()
      : new FileStore(process.env.RARUM_DATA_FILE ?? path.join(process.cwd(), "data", "store.json"));
  }
  return g.__rarumStore;
}

export type { ContentStore };
