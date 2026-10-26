import {
  BIRYANI_ID,
  DOSA_ID,
  KHICHDI_ID,
  RAITA_ID,
  dishById,
  payableTotal,
  type Diet,
  type Dish,
  type Spice,
} from "./data";

export type UserPreferences = {
  displayName: string;
  location: string;
  lat?: number;
  lng?: number;
  diet: Diet;
  spiceTolerance: Spice;
  allergies: string[];
  dislikes: string[];
  avoidOily: boolean;
  comfortBudgetPaise: number;
  people: number;
  deliveryPriority: "fast" | "balanced" | "rated";
  preferredCuisines: string[];
};

export type PlacedOrder = {
  id: string;
  restaurant: string;
  restaurantId: string;
  dishIds: string[];
  items: string[];
  itemSubtotal: number;
  total: number;
  status: "Delivered" | "Preparing" | "Out for delivery";
  date: string;
  createdAt: number;
  prompt?: string;
};

export type SessionFilters = {
  budgetPaise: number;
  diet: Diet;
  people: number;
  delivery: "fast" | "balanced" | "rated";
};

export type CartLine = { dishId: string; quantity: number };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export const defaultPreferences: UserPreferences = {
  displayName: "Kiran",
  location: "Jubilee Hills, Hyderabad",
  diet: "nonveg",
  spiceTolerance: 3,
  allergies: ["Peanuts"],
  dislikes: [],
  avoidOily: true,
  comfortBudgetPaise: 35000,
  people: 1,
  deliveryPriority: "fast",
  preferredCuisines: ["Hyderabadi", "South Indian"],
};

export const defaultFilters = (prefs: UserPreferences = defaultPreferences): SessionFilters => ({
  budgetPaise: prefs.comfortBudgetPaise,
  diet: prefs.diet,
  people: prefs.people,
  delivery: prefs.deliveryPriority,
});

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function seedOrder(
  id: string,
  dishIds: string[],
  createdAt: number,
  date: string,
  prompt: string,
  status: PlacedOrder["status"] = "Delivered",
): PlacedOrder {
  const mains = dishIds.map((dishId) => dishById[dishId]);
  const itemSubtotal = mains.reduce((sum, dish) => sum + dish.price, 0);
  const first = mains[0];
  return {
    id,
    restaurant: first.restaurant,
    restaurantId: first.restaurantId,
    dishIds,
    items: mains.map((dish) => dish.name),
    itemSubtotal,
    total: payableTotal(itemSubtotal, false),
    status,
    date,
    createdAt,
    prompt,
  };
}

export const seedOrders: PlacedOrder[] = [
  seedOrder("FP-24018", [BIRYANI_ID, RAITA_ID], Date.parse("2026-10-18T19:42:00+05:30"), "18 Oct, 7:42 pm", "the usual chicken biryani"),
  seedOrder("FP-23955", [BIRYANI_ID], Date.parse("2026-10-11T20:10:00+05:30"), "11 Oct, 8:10 pm", "feeling like biryani tonight"),
  seedOrder("FP-23891", [KHICHDI_ID], Date.parse("2026-10-12T13:08:00+05:30"), "12 Oct, 1:08 pm", "something light for lunch"),
  seedOrder("FP-23740", [DOSA_ID], Date.parse("2026-10-03T09:16:00+05:30"), "03 Oct, 9:16 am", "south indian breakfast"),
];

export function typicalItemSpend(orders: PlacedOrder[], family?: Dish["family"]) {
  const delivered = orders.filter((order) => order.status === "Delivered");
  const relevant = family
    ? delivered.filter((order) =>
        order.dishIds.some((id) => dishById[id]?.family === family || dishById[id]?.name.toLowerCase().includes(family)),
      )
    : delivered;
  const pool = (relevant.length ? relevant : delivered).slice(0, 6);
  if (!pool.length) return defaultPreferences.comfortBudgetPaise;
  const values = pool.map((order) => order.itemSubtotal).sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}

export function lastOrderMatching(orders: PlacedOrder[], familyOrName: string) {
  const needle = familyOrName.toLowerCase();
  return orders.find((order) =>
    order.items.some((item) => item.toLowerCase().includes(needle)) ||
    order.dishIds.some((id) => dishById[id]?.family === needle),
  );
}

export function formatOrderStamp(date = new Date()) {
  return formatOrderDate(date);
}

export function nextOrderId(existing: PlacedOrder[]) {
  const used = new Set(existing.map((order) => order.id));
  let n = 24100 + existing.length;
  while (used.has(`FP-${n}`)) n += 1;
  return `FP-${n}`;
}
