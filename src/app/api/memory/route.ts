import { loadMemory, savePreferences, tigerStatus } from "@/lib/db/memory-repo";
import { currentDbUser } from "@/lib/db/session-user";
import type { UserPreferences } from "@/lib/memory";

export const instant = false;

export async function GET() {
  const status = await tigerStatus();
  const user = await currentDbUser();
  if (!status.connected || !user) {
    return Response.json({ ...status, preferences: null, orders: [] });
  }
  const memory = await loadMemory(user.id);
  return Response.json({ ...status, ...memory });
}

export async function PUT(request: Request) {
  const user = await currentDbUser();
  const status = await tigerStatus();
  if (!user || !status.connected) {
    return Response.json({ saved: false, ...status });
  }
  const preferences = (await request.json()) as UserPreferences;
  const saved = await savePreferences(user.id, preferences);
  return Response.json({ saved, ...status });
}
