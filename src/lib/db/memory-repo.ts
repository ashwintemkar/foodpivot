import { dishes } from "@/lib/data";
import { formatOrderStamp, type PlacedOrder, type UserPreferences } from "@/lib/memory";
import { getPrisma } from "./prisma";

export type TigerStatus = {
  configured: boolean;
  connected: boolean;
  provider: "tiger-data" | "mock";
  timescale: boolean;
};

function mapOrder(row: {
  id: string;
  restaurant: string;
  restaurantId: string;
  status: string;
  itemSubtotal: number;
  total: number;
  prompt: string | null;
  placedAt: Date;
  items: { dishId: string; quantity: number; name: string }[];
}): PlacedOrder {
  return {
    id: row.id,
    restaurant: row.restaurant,
    restaurantId: row.restaurantId,
    status: row.status as PlacedOrder["status"],
    itemSubtotal: row.itemSubtotal,
    total: row.total,
    prompt: row.prompt ?? undefined,
    createdAt: row.placedAt.getTime(),
    date: formatOrderStamp(row.placedAt),
    dishIds: row.items.flatMap((item) => Array.from({ length: item.quantity }, () => item.dishId)),
    items: row.items.map((item) => (item.quantity > 1 ? `${item.quantity}× ${item.name}` : item.name)),
  };
}

export async function tigerStatus(): Promise<TigerStatus> {
  const prisma = getPrisma();
  if (!prisma) {
    return { configured: false, connected: false, provider: "mock", timescale: false };
  }
  try {
    const rows = await prisma.$queryRaw<Array<{ extname: string }>>`
      SELECT extname FROM pg_extension WHERE extname = 'timescaledb'
    `;
    return {
      configured: true,
      connected: true,
      provider: "tiger-data",
      timescale: rows.length > 0,
    };
  } catch {
    return { configured: true, connected: false, provider: "mock", timescale: false };
  }
}

export async function ensureUser(input: { id: string; email: string; name?: string | null; image?: string | null }) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.user.upsert({
    where: { email: input.email },
    create: {
      id: input.id,
      email: input.email,
      name: input.name ?? undefined,
      image: input.image ?? undefined,
    },
    update: {
      name: input.name ?? undefined,
      image: input.image ?? undefined,
    },
  });
}

export async function loadMemory(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      orders: { include: { items: true }, orderBy: { placedAt: "desc" }, take: 24 },
    },
  });
  if (!user) return { preferences: null, orders: [] as PlacedOrder[] };
  return {
    preferences: user.preferences
      ? ({
          displayName: user.preferences.displayName,
          location: user.preferences.location,
          lat: user.preferences.lat ?? undefined,
          lng: user.preferences.lng ?? undefined,
          diet: user.preferences.diet as UserPreferences["diet"],
          spiceTolerance: user.preferences.spiceTolerance as UserPreferences["spiceTolerance"],
          allergies: user.preferences.allergies,
          dislikes: user.preferences.dislikes,
          avoidOily: user.preferences.avoidOily,
          comfortBudgetPaise: user.preferences.comfortBudgetPaise,
          people: user.preferences.people,
          deliveryPriority: user.preferences.deliveryPriority as UserPreferences["deliveryPriority"],
          preferredCuisines: user.preferences.preferredCuisines,
        } satisfies UserPreferences)
      : null,
    orders: user.orders.map(mapOrder),
  };
}

export async function savePreferences(userId: string, preferences: UserPreferences) {
  const prisma = getPrisma();
  if (!prisma) return false;
  await prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      displayName: preferences.displayName,
      location: preferences.location,
      lat: preferences.lat,
      lng: preferences.lng,
      diet: preferences.diet,
      spiceTolerance: preferences.spiceTolerance,
      allergies: preferences.allergies,
      dislikes: preferences.dislikes,
      avoidOily: preferences.avoidOily,
      comfortBudgetPaise: preferences.comfortBudgetPaise,
      people: preferences.people,
      deliveryPriority: preferences.deliveryPriority,
      preferredCuisines: preferences.preferredCuisines,
    },
    update: {
      displayName: preferences.displayName,
      location: preferences.location,
      lat: preferences.lat,
      lng: preferences.lng,
      diet: preferences.diet,
      spiceTolerance: preferences.spiceTolerance,
      allergies: preferences.allergies,
      dislikes: preferences.dislikes,
      avoidOily: preferences.avoidOily,
      comfortBudgetPaise: preferences.comfortBudgetPaise,
      people: preferences.people,
      deliveryPriority: preferences.deliveryPriority,
      preferredCuisines: preferences.preferredCuisines,
    },
  });
  await prisma.savedAddress.upsert({
    where: { id: `${userId}-home` },
    create: {
      id: `${userId}-home`,
      userId,
      label: "Home",
      line: preferences.location,
      lat: preferences.lat,
      lng: preferences.lng,
    },
    update: {
      line: preferences.location,
      lat: preferences.lat,
      lng: preferences.lng,
    },
  });
  return true;
}

export async function saveOrder(userId: string, order: PlacedOrder) {
  const prisma = getPrisma();
  if (!prisma) return false;
  const counts = new Map<string, number>();
  for (const dishId of order.dishIds) counts.set(dishId, (counts.get(dishId) ?? 0) + 1);
  await prisma.order.create({
    data: {
      id: order.id,
      userId,
      restaurantId: order.restaurantId,
      restaurant: order.restaurant,
      status: order.status,
      itemSubtotal: order.itemSubtotal,
      total: order.total,
      prompt: order.prompt,
      placedAt: new Date(order.createdAt),
      items: {
        create: [...counts.entries()].map(([dishId, quantity]) => {
          const dish = dishes.find((entry) => entry.id === dishId);
          return {
            dishId,
            quantity,
            name: dish?.name ?? dishId,
            price: dish?.price ?? 0,
          };
        }),
      },
      history: {
        create: { status: order.status, note: "Placed from FoodPilot concierge" },
      },
    },
  });
  await recordAgentEvent(userId, "order.placed", { orderId: order.id, restaurantId: order.restaurantId });
  return true;
}

export async function recordAgentEvent(userId: string | null, kind: string, payload: Record<string, unknown>) {
  const prisma = getPrisma();
  if (!prisma) return false;
  await prisma.agentEvent.create({
    data: { userId: userId ?? undefined, kind, payload },
  });
  return true;
}

export async function recordRecommendation(userId: string, prompt: string, pickDishId: string, score: number, applied: string[]) {
  const prisma = getPrisma();
  if (!prisma) return false;
  await prisma.recommendationRun.create({
    data: { userId, prompt, pickDishId, score, applied },
  });
  await recordAgentEvent(userId, "concierge.recommend", { prompt, pickDishId, score });
  return true;
}
