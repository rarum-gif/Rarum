import type { Metadata } from "next";
import { usesDefaultAdminPassword } from "@/lib/server/admin";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = { title: "Redaktion", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <AdminClient defaultPw={usesDefaultAdminPassword()} />;
}
