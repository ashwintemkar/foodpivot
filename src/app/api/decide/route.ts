import { applyModelPick, runConcierge, type ConciergeResult } from "@/lib/concierge";
import { askGemma, gemmaConfigured, gemmaModel } from "@/lib/gemma";
import type { SessionFilters, PlacedOrder, UserPreferences } from "@/lib/memory";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  prompt?: string;
  prefs?: UserPreferences;
  orders?: PlacedOrder[];
  filters?: SessionFilters;
  lastResult?: ConciergeResult | null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  if (!body.prompt || !body.prefs || !body.filters) {
    return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
  }
  const ruled = runConcierge({
    prompt: body.prompt,
    prefs: body.prefs,
    orders: body.orders ?? [],
    filters: body.filters,
    lastResult: body.lastResult,
  });
  if (ruled.confirmOrder || !gemmaConfigured()) {
    return NextResponse.json({ source: "rules", model: null, result: ruled });
  }
  const choice = await askGemma(
    ruled,
    body.prompt,
    (body.orders ?? []).slice(0, 4).map((order) => order.items[0]).filter(Boolean).join(", "),
  );
  const why = choice?.why?.trim().slice(0, 220);
  const applied = choice?.dishId && why ? applyModelPick(ruled, choice.dishId, why) : null;
  if (!applied) {
    return NextResponse.json({ source: "rules", model: gemmaModel(), result: ruled });
  }
  return NextResponse.json({ source: "gemma", model: gemmaModel(), result: applied });
}
