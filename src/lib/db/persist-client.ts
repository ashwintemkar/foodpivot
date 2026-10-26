import type { PlacedOrder, UserPreferences } from "@/lib/memory";

export async function persistPreferences(preferences: UserPreferences) {
  try {
    await fetch("/api/memory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
  } catch {
    /* Demo still works without Tiger Data. */
  }
}

export async function persistOrder(order: PlacedOrder) {
  try {
    await fetch("/api/memory/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
  } catch {
    /* Demo still works without Tiger Data. */
  }
}

export async function persistConciergeRun(input: {
  prompt: string;
  pickDishId: string;
  score: number;
  applied: string[];
}) {
  try {
    await fetch("/api/memory/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "concierge.recommend", ...input }),
    });
  } catch {
    /* ignore */
  }
}
