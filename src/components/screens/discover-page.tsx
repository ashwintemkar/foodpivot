"use client";

import Link from "next/link";
import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { DishCard } from "@/components/food/dish-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { dishes } from "@/lib/data";

export function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [veg, setVeg] = useState(false);
  const [cuisine, setCuisine] = useState("All");
  const cuisines = useMemo(() => ["All", ...Array.from(new Set(dishes.map((d) => d.cuisine)))], []);
  const filtered = dishes.filter(
    (dish) =>
      (!query || `${dish.name} ${dish.restaurant}`.toLowerCase().includes(query.toLowerCase())) &&
      (!veg || dish.vegetarian) &&
      (cuisine === "All" || dish.cuisine === cuisine),
  );

  return (
    <>
      <PageHeading
        eyebrow="Explore with intent"
        title="Find your next favourite."
        copy="Curated dishes from fictional demo kitchens, matched to your moment."
      />
      <section className="search-bar">
        <Search />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes or restaurants" aria-label="Search dishes" />
        <button className={veg ? "selected" : ""} type="button" onClick={() => setVeg(!veg)}>
          Vegetarian
        </button>
      </section>
      <div className="filter-strip">
        {cuisines.map((item) => (
          <button className={cuisine === item ? "selected" : ""} type="button" onClick={() => setCuisine(item)} key={item}>
            {item}
          </button>
        ))}
      </div>
      <article className="featured">
        <div>
          <span className="eyebrow">Kitchen of the week</span>
          <h2>Monsoon Table</h2>
          <p>Hyderabadi comfort food, slow-cooked for rainy evenings.</p>
          <div className="meta">
            <span>
              <Star size={14} fill="currentColor" /> 4.8
            </span>
            <span>24–30 min</span>
          </div>
          <Link className="button light" href="/dish/dish-1">
            Explore the menu
          </Link>
        </div>
        <div className="featured-photo" />
      </article>
      <section>
        <div className="section-title">
          <h2>{filtered.length} delicious directions</h2>
          <span>Mock restaurant data</span>
        </div>
        {filtered.length ? (
          <div className="dish-grid">
            {filtered.slice(0, 12).map((dish) => (
              <DishCard dish={dish} key={dish.id} />
            ))}
          </div>
        ) : (
          <EmptyState title="No dishes found" copy="Try a broader search or clear your vegetarian filter." />
        )}
      </section>
    </>
  );
}
