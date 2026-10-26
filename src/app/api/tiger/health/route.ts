import { tigerStatus } from "@/lib/db/memory-repo";

export const instant = false;

export async function GET() {
  const status = await tigerStatus();
  return Response.json(status);
}
