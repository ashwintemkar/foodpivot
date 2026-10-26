"use client";

import Link from "next/link";
import { MapPin, Minus, Plus, Trash2 } from "lucide-react";
import { PriceBreakdown } from "@/components/cart/price-breakdown";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { dishes, foodPhotoClass, money } from "@/lib/data";
import { useDemoStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export function CartPage() {
  const hydrated = useHasHydrated();
  const { cart, setQuantity, remove, clearCart, coupon, applyCoupon, preferences } = useDemoStore();
  const lines = cart.map((line) => ({ ...line, dish: dishes.find((dish) => dish.id === line.dishId)! }));
  const subtotal = lines.reduce((sum, line) => sum + line.dish.price * line.quantity, 0);

  if (!hydrated) {
    return <p className="form-note">Loading your cart…</p>;
  }

  if (!lines.length) {
    return (
      <EmptyState
        title="Your table is empty"
        copy="Browse dishes or ask the concierge to prepare a shortlist."
        action={
          <Link className="button primary" href="/discover">
            Explore dishes
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="Smart cart"
        title="One last look before approval."
        copy="Items are from a fictional demo kitchen."
        action={
          <button className="text-button danger" type="button" onClick={clearCart}>
            Clear cart
          </button>
        }
      />
      <div className="checkout-grid">
        <section className="cart-lines">
          {lines.map(({ dish, quantity }) => (
            <article className="cart-line" key={dish.id}>
              <div
                className={`mini-food ${foodPhotoClass(dish.family)}`}
                style={{ backgroundPosition: dish.imagePosition }}
              />
              <div>
                <span>{dish.restaurant}</span>
                <h3>{dish.name}</h3>
                <p>Medium spice · Regular portion</p>
                <button className="text-button" type="button">
                  Edit customisation
                </button>
              </div>
              <div className="quantity">
                <button type="button" onClick={() => setQuantity(dish.id, quantity - 1)}>
                  <Minus size={14} />
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity(dish.id, quantity + 1)}>
                  <Plus size={14} />
                </button>
              </div>
              <strong>{money(dish.price * quantity)}</strong>
              <button className="trash" type="button" onClick={() => remove(dish.id)} aria-label="Remove item">
                <Trash2 size={17} />
              </button>
            </article>
          ))}
          <div className="address-block">
            <MapPin />
            <div>
              <span>Delivering to</span>
              <strong>Home · {preferences.location}</strong>
              <p>Leave with security if unavailable.</p>
            </div>
            <button className="text-button" type="button">
              Change
            </button>
          </div>
        </section>
        <PriceBreakdown subtotal={subtotal} coupon={coupon} onCoupon={applyCoupon} />
      </div>
    </>
  );
}
