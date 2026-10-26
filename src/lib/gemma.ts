import type { ConciergeResult } from "./concierge";

export const DEFAULT_GEMMA = "google/gemma-4-26b-a4b-it";

export function gemmaModel() {
  return process.env.OPENROUTER_MODEL || DEFAULT_GEMMA;
}

export function gemmaConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

type GemmaJson = { dishId?: string; why?: string };

export async function askGemma(result: ConciergeResult, prompt: string): Promise<GemmaJson | null> {
  const key = process.env.OPENROUTER_API_KEY;
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
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: gemmaModel(),
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You choose dinner for someone who does not want to decide. Reply with JSON only: {\"dishId\":\"one id from the menu\",\"why\":\"one short sentence\"}. Never invent an id. Prefer the plate that matches the mood with the least effort.",
        },
        {
          role: "user",
          content: `Mood: ${prompt}\nMenu:\n${JSON.stringify(menu)}`,
        },
      ],
    }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = payload.choices?.[0]?.message?.content;
  if (!text) return null;
  try {
    return JSON.parse(text) as GemmaJson;
  } catch {
    return null;
  }
}
