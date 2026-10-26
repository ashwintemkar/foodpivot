"use client";

import { DishCard } from "@/components/food/dish-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { dishes } from "@/lib/data";
import { useDemoStore } from "@/lib/store";

export function FavoritesPage() {
  const favorites = useDemoStore((s) => s.favorites);
  const favoriteDishes = dishes.filter((dish) => favorites.includes(dish.id));

  return (
    <>
      <PageHeading eyebrow="Saved for later" title="Your favourites." copy="A small shelf of dishes worth returning to." />
      {favoriteDishes.length ? (
        <div className="dish-grid">
          {favoriteDishes.map((dish) => (
            <DishCard dish={dish} key={dish.id} />
          ))}
        </div>
      ) : (
        <EmptyState title="No favourites yet" copy="Tap the heart on any dish to keep it here." />
      )}
    </>
  );
}
