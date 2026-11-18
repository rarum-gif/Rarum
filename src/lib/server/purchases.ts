import "server-only";
import type { Purchase } from "@/lib/game/economy";
import { serviceClient } from "./supabase";

export async function purchasesOf(userId: string): Promise<Purchase[]> {
  const { data, error } = await serviceClient().from("purchases").select("item_id, price, created_at").eq("user_id", userId).order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => ({ itemId: r.item_id as string, price: r.price as number, at: r.created_at as string }));
}
