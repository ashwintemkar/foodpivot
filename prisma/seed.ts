import { PrismaClient } from "@prisma/client";
import { dishes, restaurants } from "../src/lib/data";
import { defaultPreferences, seedOrders } from "../src/lib/memory";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);

  for (const restaurant of restaurants) {
    await prisma.restaurant.upsert({
      where: { id: restaurant.id },
      create: restaurant,
      update: {
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        minutes: restaurant.minutes,
        area: restaurant.area,
        lat: restaurant.lat,
        lng: restaurant.lng,
      },
    });
  }

  for (const dish of dishes) {
    await prisma.dish.upsert({
      where: { id: dish.id },
      create: {
        id: dish.id,
        restaurantId: dish.restaurantId,
        name: dish.name,
        cuisine: dish.cuisine,
        family: dish.family,
        pricePaise: dish.price,
        rating: dish.rating,
        minutes: dish.minutes,
        vegetarian: dish.vegetarian,
        vegan: dish.vegan,
        spice: dish.spice,
        oily: dish.oily,
        tags: dish.tags,
        allergens: dish.allergens,
        description: dish.description,
      },
      update: {
        name: dish.name,
        cuisine: dish.cuisine,
        family: dish.family,
        pricePaise: dish.price,
        rating: dish.rating,
        minutes: dish.minutes,
        vegetarian: dish.vegetarian,
        vegan: dish.vegan,
        spice: dish.spice,
        oily: dish.oily,
        tags: dish.tags,
        allergens: dish.allergens,
        description: dish.description,
      },
    });
  }

  try {
    await prisma.$executeRawUnsafe(
      `SELECT create_hypertable('agent_events', 'created_at', if_not_exists => TRUE);`,
    );
  } catch (error) {
    console.warn("Timescale hypertable skipped:", error);
  }

  const demo = await prisma.user.upsert({
    where: { email: "kiran@example.demo" },
    create: {
      id: "demo-kiran",
      email: "kiran@example.demo",
      name: defaultPreferences.displayName,
    },
    update: { name: defaultPreferences.displayName },
  });

  await prisma.userPreference.upsert({
    where: { userId: demo.id },
    create: {
      userId: demo.id,
      displayName: defaultPreferences.displayName,
      location: defaultPreferences.location,
      diet: defaultPreferences.diet,
      spiceTolerance: defaultPreferences.spiceTolerance,
      allergies: defaultPreferences.allergies,
      dislikes: defaultPreferences.dislikes,
      avoidOily: defaultPreferences.avoidOily,
      comfortBudgetPaise: defaultPreferences.comfortBudgetPaise,
      people: defaultPreferences.people,
      deliveryPriority: defaultPreferences.deliveryPriority,
      preferredCuisines: defaultPreferences.preferredCuisines,
    },
    update: {},
  });

  for (const order of seedOrders) {
    const existing = await prisma.order.findUnique({ where: { id: order.id } });
    if (existing) continue;
    const counts = new Map<string, number>();
    for (const dishId of order.dishIds) counts.set(dishId, (counts.get(dishId) ?? 0) + 1);
    await prisma.order.create({
      data: {
        id: order.id,
        userId: demo.id,
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
        history: { create: { status: order.status, note: "Seeded demo history" } },
      },
    });
  }

  await prisma.agentEvent.create({
    data: {
      userId: demo.id,
      kind: "tiger.seed",
      payload: { restaurants: restaurants.length, dishes: dishes.length },
    },
  });

  console.log(`Seeded Tiger Data: ${restaurants.length} kitchens, ${dishes.length} dishes.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
