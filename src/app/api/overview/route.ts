import { getOverview } from "@/lib/server/daily";
import { handle, json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export const GET = handle(async () => json(await getOverview()));
