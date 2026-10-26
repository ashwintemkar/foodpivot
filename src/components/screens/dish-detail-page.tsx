"use client";

import { Clock3, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { AllergyWarning } from "@/components/food/allergy-warning";
import { dishes, foodPhotoClass, money } from "@/lib/data";
import { useDemoStore } from "@/lib/store";

export function DishDetailPage({ id }: { id: string }) {
  const dish = dishes.find((item) => item.id === id) ?? dishes[0];
  const add = useDemoStore((s) => s.add);
  const [quantity, setQuantity] = useState(1);
  const [spice, setSpice] = useState("Medium");

  return (
    <div className="dish-detail">
      <div
        className={`dish-hero-photo ${foodPhotoClass(dish.family)}`}
        style={{ backgroundPosition: dish.imagePosition }}
      >
        <span className="image-label">Illustrative demo photography</span>
      </div>
      <section className="dish-info">
        <span className="eyebrow">
          {dish.restaurant} · {dish.cuisine}
        </span>
        <h1>{dish.name}</h1>
        <p className="lead">{dish.description}</p>
        <div className="meta large">
          <span>
            <Star size={15} fill="currentColor" /> {dish.rating}
          </span>
          <span>
            <Clock3 size={15} /> {dish.minutes} min
          </span>
          <span>{dish.vegetarian ? "Vegetarian" : "Non-vegetarian"}</span>
        </div>
        <div className="detail-section">
          <h2>What&apos;s inside</h2>
          <p>Basmati rice, house spice blend, caramelised onion, fresh herbs and saffron. Ingredient detail is illustrative.</p>
          <AllergyWarning allergens={dish.allergens} tone="amber" />
        </div>
        <div className="detail-section">
          <h2>Make it yours</h2>
          <label className="choice-label">Spice level</label>
          <div className="choice-row">
            {["Mild", "Medium", "Hot"].map((item) => (
              <button className={spice === item ? "selected" : ""} type="button" onClick={() => setSpice(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
          <label className="checkbox">
            <input type="checkbox" /> Add mint raita <span>+₹45</span>
          </label>
          <label className="checkbox">
            <input type="checkbox" /> Add salan <span>+₹35</span>
          </label>
          <label className="choice-label" htmlFor="instructions">
            Special instructions
          </label>
          <textarea id="instructions" placeholder="Optional note for the kitchen" />
        </div>
      </section>
      <aside className="purchase-card">
        <span className="eyebrow">Your selection</span>
        <h3>{dish.name}</h3>
        <p>{spice} spice · Regular portion</p>
        <div className="quantity">
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            <Minus />
          </button>
          <span>{quantity}</span>
          <button type="button" onClick={() => setQuantity(quantity + 1)}>
            <Plus />
          </button>
        </div>
        <div className="purchase-total">
          <span>Total</span>
          <strong>{money(dish.price * quantity)}</strong>
        </div>
        <button
          className="button primary full"
          type="button"
          onClick={() => {
            for (let i = 0; i < quantity; i++) add(dish.id);
          }}
        >
          Add to cart <ShoppingBag size={17} />
        </button>
        <p className="fine">Mock menu item · no real restaurant affiliation</p>
      </aside>
    </div>
  );
}
