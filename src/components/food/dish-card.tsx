"use client";

import Link from "next/link";
import { Clock3, Heart, MapPin, Plus, Star } from "lucide-react";
import type { Dish } from "@/lib/data";
import { foodPhotoClass, money } from "@/lib/data";
import { etaMinutes, formatKm, haversineKm, resolveOrigin } from "@/lib/geo";
import { useDemoStore } from "@/lib/store";

export function DishCard({ dish, ranked }: { dish: Dish; ranked?: number }) {
  const add = useDemoStore((s) => s.add);
  const favorites = useDemoStore((s) => s.favorites);
  const preferences = useDemoStore((s) => s.preferences);
  const toggle = useDemoStore((s) => s.toggleFavorite);
  const saved = favorites.includes(dish.id);
  const origin = resolveOrigin(preferences);
  const km = haversineKm(origin, dish);
  const eta = etaMinutes(km, dish.minutes);

  return (
    <article className="dish-card">
      <Link
        href={`/dish/${dish.id}`}
        className={`dish-image ${foodPhotoClass(dish.family)}`}
        style={{ backgroundPosition: dish.imagePosition }}
      >
        {ranked ? <span className="rank">#{ranked}</span> : null}
        <span
          className={`veg-dot ${dish.vegetarian ? "veg" : "nonveg"}`}
          aria-label={dish.vegetarian ? "Vegetarian" : "Non vegetarian"}
        />
      </Link>
      <button
        className={`heart ${saved ? "saved" : ""}`}
        type="button"
        onClick={() => toggle(dish.id)}
        aria-label="Toggle favorite"
      >
        <Heart size={18} fill={saved ? "currentColor" : "none"} />
      </button>
      <div className="dish-body">
        <span className="restaurant">
          {dish.restaurant} · {dish.area}
        </span>
        <Link href={`/dish/${dish.id}`}>
          <h3>{dish.name}</h3>
        </Link>
        <p>{dish.description}</p>
        <div className="meta">
          <span>
            <Star size={13} fill="currentColor" /> {dish.rating} dish · {dish.restaurantRating} kitchen
          </span>
          <span>
            <MapPin size={13} /> {formatKm(km)}
          </span>
          <span>
            <Clock3 size={13} /> {eta} min
          </span>
          <span>{"🌶".repeat(dish.spice)}</span>
        </div>
        <div className="dish-foot">
          <strong>{money(dish.price)}</strong>
          <button type="button" onClick={() => add(dish.id)}>
            Add <Plus size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
