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

export async function askGemma(result: ConciergeResult, prompt: string, history: string): Promise<GemmaJson | null> {
  const key = process.env.BACKBOARD_API_KEY;
  if (!key) return null;
  const menu = result.recommendations.map((row) => ({
    id: row.dish.id,
    food: row.dish.name,
    tags: row.dish.tags,
    area: row.dish.area,
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
        'You decide what this person should eat next, not which restaurant is famous. Use their diet, tags, what today or tomorrow looks like, and what they ate last. Reply with JSON only: {"dishId":"one id from the menu","why":"one short sentence about the food"}. Never invent an id. Do not talk about ratings.',
      content: `What they want: ${prompt}\nEaten recently: ${history || "nothing on file"}\nFoods already on nearby menus:\n${JSON.stringify(menu)}`,
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
