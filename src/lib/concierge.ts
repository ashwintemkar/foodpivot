import {
  MockFoodContextEngine,
  dishById,
  dishes,
  money,
  type Diet,
  type Dish,
  type DishFamily,
} from "./data";
import {
  FALLBACK_DELIVERY_KM,
  MAX_DELIVERY_KM,
  etaMinutes,
  formatKm,
  haversineKm,
  resolveOrigin,
} from "./geo";
import {
  lastOrderMatching,
  typicalItemSpend,
  type CartLine,
  type PlacedOrder,
  type SessionFilters,
  type UserPreferences,
} from "./memory";

export type RankedDish = {
  dish: Dish;
  score: number;
  raw: number;
  reasons: string[];
};

export type ConciergeResult = {
  interpretation: string;
  applied: string[];
  recommendations: RankedDish[];
  prepared: CartLine[];
  pick: Dish;
  budgetPaise: number;
  missing: string[];
  confirmOrder: boolean;
  greeting: string;
};

const FAMILY_ALIASES: Record<string, DishFamily> = {
  biryani: "biryani",
  biriyani: "biryani",
  pulao: "biryani",
  "fried rice": "biryani",
  dosa: "south",
  idli: "south",
  sambar: "south",
  uttapam: "south",
  tikka: "tandoor",
  tandoori: "tandoor",
  kebab: "kebab",
  galouti: "kebab",
  khichdi: "comfort",
  poha: "comfort",
  dal: "dal",
  curry: "curry",
  "butter chicken": "curry",
  roll: "street",
  misal: "street",
  kulcha: "bread",
  thali: "comfort",
};

const CONFIRM =
  /^(yes|yeah|yep|yup|ok|okay|sure|go ahead|please do|order it|order this|place it|place the order|confirm|do it|sounds good)\b/i;

function rupeesToPaise(value: number) {
  return value < 1000 ? value * 100 : value;
}

function extractBudget(prompt: string) {
  const under = prompt.match(/under\s*₹?\s*(\d{2,5})/i);
  if (under) return rupeesToPaise(Number(under[1]));
  const rupee = prompt.match(/₹\s*(\d{2,5})/);
  if (rupee) return rupeesToPaise(Number(rupee[1]));
  return null;
}

function extractFamily(prompt: string): DishFamily | undefined {
  const lower = prompt.toLowerCase();
  const keys = Object.keys(FAMILY_ALIASES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return FAMILY_ALIASES[key];
  }
  return undefined;
}

function dietFromPrompt(prompt: string, fallback: Diet): Diet {
  const lower = prompt.toLowerCase();
  if (/\bvegan\b/.test(lower)) return "vegan";
  if (/\bveg(etarian)?\b/.test(lower) && !/non[-\s]?veg/.test(lower)) return "veg";
  if (/non[-\s]?veg/.test(lower) || /\bchicken\b|\bmutton\b|\bgoat\b|\bfish\b/.test(lower)) return "nonveg";
  return fallback;
}

function hardDietOk(dish: Dish, diet: Diet) {
  if (diet === "vegan") return dish.vegan;
  if (diet === "veg") return dish.vegetarian;
  return true;
}

function allergenHit(dish: Dish, allergies: string[]) {
  return allergies.find((allergy) =>
    dish.allergens.some((item) => item.toLowerCase() === allergy.toLowerCase()) ||
    dish.name.toLowerCase().includes(allergy.toLowerCase()),
  );
}

export function greetingFor(prefs: UserPreferences, orders: PlacedOrder[]) {
  const lastBiryani = lastOrderMatching(orders, "biryani");
  const typical = typicalItemSpend(orders);
  const name = prefs.displayName.split(" ")[0];
  const { meal } = MockFoodContextEngine.context();
  const memory = lastBiryani
    ? `Last biryani was ${lastBiryani.items[0]} from ${lastBiryani.restaurant}.`
    : "I don't have a biryani habit on file yet.";
  return `Hey ${name}. ${meal} usual spend is about ${money(typical)}. ${memory} What are you in the mood for?`;
}

function scoreDish(
  dish: Dish,
  prompt: string,
  family: DishFamily | undefined,
  budget: number,
  prefs: UserPreferences,
  filters: SessionFilters,
  orders: PlacedOrder[],
  hardBudget: boolean,
  origin: ReturnType<typeof resolveOrigin>,
  maxKm: number,
) {
  const reasons: string[] = [];
  const lower = prompt.toLowerCase();
  let score = 40;
  const km = haversineKm(origin, dish);
  const eta = etaMinutes(km, dish.minutes);
  const wantRated = filters.delivery === "rated" || /best|good rating|highly rated|top rated|good/.test(lower);

  if (!hardDietOk(dish, filters.diet)) return null;
  const allergy = allergenHit(dish, prefs.allergies);
  if (allergy) return null;
  if (prefs.dislikes.some((item) => dish.name.toLowerCase().includes(item.toLowerCase()))) return null;
  if (hardBudget && dish.price > budget) return null;
  if (dish.family === "comfort" && dish.price < 8000 && family && family !== "comfort") return null;
  if (km > maxKm) return null;

  if (family && dish.family === family) {
    score += 24;
    reasons.push(`Matches “${family}”.`);
  } else if (family && dish.name.toLowerCase().includes(family)) {
    score += 16;
    reasons.push(`Name matches ${family}.`);
  } else if (lower.split(/\W+/).some((word) => word.length > 3 && dish.name.toLowerCase().includes(word))) {
    score += 10;
  }

  const dishQuality = Math.round((dish.rating - 4) * 22);
  const kitchenQuality = Math.round((dish.restaurantRating - 4) * 20);
  score += dishQuality + kitchenQuality;
  if (dish.rating >= 4.6 && dish.restaurantRating >= 4.5) {
    reasons.push(`${dish.rating} plate at a ${dish.restaurantRating} kitchen in ${dish.area}.`);
  } else if (wantRated) {
    reasons.push(`Kitchen rated ${dish.restaurantRating}.`);
  }

  if (km <= 2) score += 18;
  else if (km <= 4) score += 10;
  else if (km <= 6) score += 3;
  else score -= Math.round((km - 6) * 6);
  reasons.push(`${formatKm(km)} from ${origin.label.split(",")[0]} · ${eta} min.`);

  const orderedThis = orders.filter((order) => order.dishIds.includes(dish.id));
  if (orderedThis.length) {
    score += 10 + Math.min(orderedThis.length, 2) * 4;
    reasons.push(`You ordered this ${orderedThis.length === 1 ? "before" : `${orderedThis.length} times`}.`);
  }

  const restaurantHits = orders.filter((order) => order.restaurantId === dish.restaurantId);
  if (restaurantHits.length && !orderedThis.length) {
    score += 5;
  }

  if (prefs.preferredCuisines.includes(dish.cuisine) || prefs.preferredCuisines.includes(dish.family)) {
    score += 5;
  }

  if (dish.price <= budget) {
    score += 8;
  } else if (dish.price <= budget * 1.12) {
    score += 1;
  } else {
    score -= 16;
  }

  if (prefs.avoidOily || /not too oily|not oily|light/.test(lower)) {
    if (dish.oily) score -= 12;
    else score += 5;
  }

  if (/spicy|hot|bold/.test(lower) && dish.spice === 3) {
    score += 8;
  } else if (Math.abs(dish.spice - prefs.spiceTolerance) === 0) {
    score += 3;
  } else if (dish.spice > prefs.spiceTolerance) {
    score -= 6;
  }

  if (filters.delivery === "fast" || /quick|fast|soon/.test(lower)) {
    if (eta <= 30) score += 8;
    else score -= 5;
  }

  if (wantRated) {
    score += Math.round((dish.rating + dish.restaurantRating - 8.4) * 10);
  }

  if (/protein/.test(lower) && !dish.vegetarian) score += 5;

  if (!reasons.length) reasons.push("Solid rating and available now.");
  const raw = Math.round(score);
  return { dish, score: Math.max(40, Math.min(98, raw)), raw, reasons: reasons.slice(0, 3) };
}

function buildInterpretation(
  prompt: string,
  family: DishFamily | undefined,
  budget: number,
  filters: SessionFilters,
  lastSimilar: PlacedOrder | undefined,
  originLabel: string,
  maxKm: number,
) {
  const craving = family ?? "something that fits tonight";
  const history = lastSimilar
    ? `Last time that meant ${lastSimilar.items[0]} from ${lastSimilar.restaurant}.`
    : "No direct match in past orders, so I'm using rating, distance and budget.";
  return `I read “${prompt.trim()}” as ${craving} near ${originLabel}, within ${maxKm} km, about ${money(budget)}, ${filters.diet === "any" ? "any diet" : filters.diet}. ${history}`;
}

export function runConcierge(input: {
  prompt: string;
  prefs: UserPreferences;
  orders: PlacedOrder[];
  filters: SessionFilters;
  lastResult?: ConciergeResult | null;
}): ConciergeResult {
  const prompt = input.prompt.trim();
  const { prefs, orders, filters } = input;

  if (input.lastResult && CONFIRM.test(prompt)) {
    return {
      ...input.lastResult,
      confirmOrder: true,
      interpretation: `Keeping ${input.lastResult.pick.name} from ${input.lastResult.pick.restaurant}. Approve on checkout — I won't place it without you.`,
      greeting: "",
      missing: [],
    };
  }

  const usual = /\bthe usual\b/i.test(prompt);
  const lastDish = orders[0] ? dishById[orders[0].dishIds[0]] : undefined;
  const family = extractFamily(prompt) || (usual ? lastDish?.family : undefined);
  const mentionedBudget = extractBudget(prompt);
  const hardBudget = Boolean(mentionedBudget) || /under/.test(prompt.toLowerCase());
  const budget =
    mentionedBudget ??
    (family ? typicalItemSpend(orders, family) : typicalItemSpend(orders)) ??
    filters.budgetPaise;
  const diet = dietFromPrompt(prompt, filters.diet);
  const nextFilters = { ...filters, diet };
  const lastSimilar = family ? lastOrderMatching(orders, family) : orders[0];
  const origin = resolveOrigin(prefs);
  const nearby = dishes.filter((dish) => haversineKm(origin, dish) <= MAX_DELIVERY_KM);
  const maxKm = nearby.some((dish) => !family || dish.family === family) ? MAX_DELIVERY_KM : FALLBACK_DELIVERY_KM;

  const scored = dishes
    .map((dish) => scoreDish(dish, prompt, family, budget, prefs, nextFilters, orders, hardBudget, origin, maxKm))
    .filter((row): row is RankedDish => Boolean(row))
    .sort(
      (a, b) =>
        b.raw - a.raw ||
        haversineKm(origin, a.dish) - haversineKm(origin, b.dish) ||
        b.dish.restaurantRating - a.dish.restaurantRating,
    );
  const focused = family ? scored.filter((row) => row.dish.family === family) : scored;
  const pool = focused.length ? focused : scored;
  const peak = pool[0]?.raw || 1;
  const ranked = pool.slice(0, 4).map((row) => ({
    ...row,
    score: Math.max(64, Math.min(98, Math.round((row.raw / peak) * 98))),
  }));

  const fallback = ranked[0] ?? {
    dish: dishes[0],
    score: 60,
    raw: 60,
    reasons: ["Defaulting to the house biryani while I learn more."],
  };
  const pick = fallback.dish;
  const prepared: CartLine[] = [{ dishId: pick.id, quantity: Math.max(1, filters.people) }];

  const lastHadRaita =
    family === "biryani" &&
    lastSimilar?.dishIds.includes("dish-15") &&
    pick.family === "biryani" &&
    pick.restaurantId === dishById["dish-1"]?.restaurantId;
  if (lastHadRaita && filters.people === 1) {
    prepared.push({ dishId: "dish-15", quantity: 1 });
  }

  const applied = [
    family ? `Craving: ${family}` : "Craving: open",
    `Deliver to: ${origin.label} (within ${maxKm} km)`,
    `Prefer kitchens rated 4.5+ and highly rated ${family ?? "plates"}`,
    `Budget: ${money(budget)}${mentionedBudget ? " (you said so)" : " (from past orders)"}`,
    `Diet: ${diet}`,
    prefs.allergies.length ? `Avoid listed allergens: ${prefs.allergies.join(", ")}` : "No allergy filter",
  ];

  const missing: string[] = [];
  if (!family) missing.push("A dish or cuisine would let me skip the guesswork next time.");
  if (lastHadRaita) missing.push("I added mint raita because you ordered it with this biryani last time. Remove it if you don't want it.");

  return {
    interpretation: buildInterpretation(prompt, family, budget, nextFilters, lastSimilar, origin.label, maxKm),
    applied,
    recommendations: ranked.length ? ranked : [fallback],
    prepared,
    pick,
    budgetPaise: budget,
    missing,
    confirmOrder: false,
    greeting: "",
  };
}

export interface AIProvider {
  recommend(input: {
    prompt: string;
    prefs: UserPreferences;
    orders: PlacedOrder[];
    filters: SessionFilters;
    lastResult?: ConciergeResult | null;
  }): ConciergeResult;
}

export function applyModelPick(result: ConciergeResult, dishId: string, why: string): ConciergeResult | null {
  const match = result.recommendations.find((row) => row.dish.id === dishId);
  if (!match) return null;
  const rest = result.recommendations.filter((row) => row.dish.id !== dishId);
  const chosen = {
    ...match,
    reasons: [why, ...match.reasons].filter(Boolean).slice(0, 3),
  };
  return {
    ...result,
    pick: match.dish,
    prepared: [{ dishId: match.dish.id, quantity: result.prepared[0]?.quantity || 1 }],
    recommendations: [chosen, ...rest],
    interpretation: `${why} ${result.interpretation}`,
  };
}

export const MockAIProvider: AIProvider = {
  recommend: runConcierge,
};
