"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, Check, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { PriceBreakdown } from "@/components/cart/price-breakdown";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { dishes, money } from "@/lib/data";
import { etaMinutes, formatKm, haversineKm, resolveOrigin } from "@/lib/geo";
import { persistOrder } from "@/lib/db/persist-client";
import { useDemoStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export function CheckoutPage() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const cart = useDemoStore((s) => s.cart);
  const coupon = useDemoStore((s) => s.coupon);
  const orderPlaced = useDemoStore((s) => s.orderPlaced);
  const lastPlacedOrderId = useDemoStore((s) => s.lastPlacedOrderId);
  const placeOrder = useDemoStore((s) => s.placeOrder);
  const prompt = useDemoStore((s) => s.prompt);
  const preferences = useDemoStore((s) => s.preferences);
  const lines = cart
    .map((line) => ({ ...line, dish: dishes.find((dish) => dish.id === line.dishId) }))
    .filter((line): line is typeof line & { dish: NonNullable<(typeof dishes)[number]> } => Boolean(line.dish));
  const subtotal = lines.reduce((sum, line) => sum + line.dish.price * line.quantity, 0);
  const restaurant = lines[0]?.dish.restaurant ?? "your kitchen";
  const pick = lines[0]?.dish;
  const origin = resolveOrigin(preferences);
  const km = pick ? haversineKm(origin, pick) : 0;
  const minutes = pick ? etaMinutes(km, pick.minutes) : 30;

  if (!hydrated) {
    return <p className="form-note">Loading your staged order…</p>;
  }

  if (orderPlaced && lastPlacedOrderId) {
    return (
      <section className="success-screen">
        <span className="success-icon">
          <Check />
        </span>
        <span className="eyebrow">Demo order created</span>
        <h1>Kitchen is on it.</h1>
        <p>No purchase was made and no restaurant was contacted. This order is now part of the concierge&apos;s memory.</p>
        <button className="button primary" type="button" onClick={() => router.push(`/orders/${lastPlacedOrderId}`)}>
          Track demo order <ArrowRight />
        </button>
      </section>
    );
  }

  if (!lines.length) {
    return (
      <EmptyState
        title="Nothing to approve"
        copy="Ask the concierge for a meal, or add a dish, before checkout."
        action={
          <Link className="button primary" href="/concierge">
            Talk to the concierge
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="Final approval"
        title="Ready when you are."
        copy="Review every detail. FoodPilot cannot submit even this demo order until you explicitly approve it."
      />
      <div className="checkout-grid">
        <section className="approval-card">
          <div className="approval-title">
            <div>
              <span>ORDERING FROM</span>
              <h2>{restaurant}</h2>
              <p>
                {pick ? `${pick.restaurantRating} kitchen · ${pick.area}` : "Demo kitchen"} · {minutes} min ·{" "}
                {pick ? formatKm(km) : ""}
              </p>
            </div>
            <BadgeCheck />
          </div>
          {lines.map((line) => (
            <div className="approval-line" key={line.dish.id}>
              <span>{line.quantity}×</span>
              <div>
                <strong>{line.dish.name}</strong>
                <p>{line.dish.spice === 3 ? "Hot" : line.dish.spice === 2 ? "Medium" : "Mild"} spice · Regular portion</p>
              </div>
              <b>{money(line.dish.price * line.quantity)}</b>
            </div>
          ))}
          <div className="approval-details">
            <div>
              <MapPin />
              <span>
                <b>Delivery address</b>Home · {preferences.location}
              </span>
            </div>
            <div>
              <ShoppingBag />
              <span>
                <b>Payment</b>Demo payment · No charge
              </span>
            </div>
          </div>
          <div className="warning-box">
            <ShieldCheck />
            <p>
              <strong>Explicit approval required</strong>
              This creates a simulated order only. It does not charge money, contact a restaurant, or guarantee allergen
              safety.
            </p>
          </div>
          <button
            className="button primary full tall"
            type="button"
            onClick={() => {
              const order = placeOrder(prompt);
              if (order) {
                void persistOrder(order);
                router.replace(`/checkout`);
              }
            }}
          >
            Approve & place demo order <ArrowRight />
          </button>
        </section>
        <PriceBreakdown subtotal={subtotal} coupon={coupon} checkout />
      </div>
    </>
  );
}
