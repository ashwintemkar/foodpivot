import { saveOrder, tigerStatus } from "@/lib/db/memory-repo";
import { currentDbUser } from "@/lib/db/session-user";
import type { PlacedOrder } from "@/lib/memory";

export const instant = false;

export async function POST(request: Request) {
  const user = await currentDbUser();
  const status = await tigerStatus();
  if (!user || !status.connected) {
    return Response.json({ saved: false, ...status });
  }
  const order = (await request.json()) as PlacedOrder;
  try {
    const saved = await saveOrder(user.id, order);
    return Response.json({ saved, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save order";
    return Response.json({ saved: false, error: message, ...status }, { status: 400 });
  }
}
