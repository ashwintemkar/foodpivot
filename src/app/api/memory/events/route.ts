import { recordAgentEvent, recordRecommendation, tigerStatus } from "@/lib/db/memory-repo";
import { currentDbUser } from "@/lib/db/session-user";

export const instant = false;

export async function POST(request: Request) {
  const user = await currentDbUser();
  const status = await tigerStatus();
  if (!status.connected) return Response.json({ saved: false, ...status });
  const body = (await request.json()) as {
    kind?: string;
    prompt?: string;
    pickDishId?: string;
    score?: number;
    applied?: string[];
  };
  if (user && body.kind === "concierge.recommend" && body.prompt && body.pickDishId) {
    await recordRecommendation(user.id, body.prompt, body.pickDishId, body.score ?? 0, body.applied ?? []);
  } else {
    await recordAgentEvent(user?.id ?? null, body.kind ?? "agent.event", body);
  }
  return Response.json({ saved: true, ...status });
}
