import type { ConciergeResult } from "./concierge";

export const DEFAULT_GEMMA = "gemma-4-26b-a4b-it";

export function gemmaModel() {
  return process.env.BACKBOARD_MODEL_NAME || DEFAULT_GEMMA;
}

export function gemmaProvider() {
  return process.env.BACKBOARD_LLM_PROVIDER || "google";
}

export function gemmaConfigured() {
  return Boolean(process.env.BACKBOARD_API_KEY);
}

type GemmaJson = { dishId?: string; why?: string };

export async function askGemma(result: ConciergeResult, prompt: string): Promise<GemmaJson | null> {
  const key = process.env.BACKBOARD_API_KEY;
  if (!key) return null;
  const menu = result.recommendations.map((row) => ({
    id: row.dish.id,
    name: row.dish.name,
    restaurant: row.dish.restaurant,
    family: row.dish.family,
    rupees: Math.round(row.dish.price / 100),
    minutes: row.dish.minutes,
    veg: row.dish.vegetarian,
  }));
  const response = await fetch("https://app.backboard.io/api/threads/messages", {
    method: "POST",
    headers: {
      "X-API-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      llm_provider: gemmaProvider(),
      model_name: gemmaModel(),
      memory: "off",
      json_output: true,
      system_prompt:
        'You choose dinner for someone who does not want to decide. Reply with JSON only: {"dishId":"one id from the menu","why":"one short sentence"}. Never invent an id. Prefer the plate that matches the mood with the least effort.',
      content: `Mood: ${prompt}\nMenu:\n${JSON.stringify(menu)}`,
    }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { content?: string };
  if (!payload.content) return null;
  const cleaned = payload.content.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  try {
    return JSON.parse(cleaned) as GemmaJson;
  } catch {
    return null;
  }
}
