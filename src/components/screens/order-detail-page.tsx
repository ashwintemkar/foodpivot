"use client";

import Link from "next/link";
import { Check, MapPin, UtensilsCrossed } from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { dishById, money } from "@/lib/data";
import { seedOrders } from "@/lib/memory";
import { useDemoStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

const steps = ["Order created", "Confirmed", "Preparing", "Ready for pickup", "Out for delivery", "Delivered"];

export function OrderDetailPage({ id }: { id: string }) {
  const hydrated = useHasHydrated();
  const storeOrders = useDemoStore((s) => s.orders);
  const add = useDemoStore((s) => s.add);
  const orders = hydrated ? storeOrders : seedOrders;
  const order = orders.find((item) => item.id === id) ?? seedOrders.find((item) => item.id === id);
  const firstDish = order ? dishById[order.dishIds[0]] : undefined;
  const doneThrough = order?.status === "Delivered" ? 5 : order?.status === "Out for delivery" ? 4 : 2;

  if (!order) {
    return (
      <PageHeading
        eyebrow="Demo order"
        title={`Order ${id}`}
        copy="This order is not in local memory. Place one from the concierge and it will show up here."
      />
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="Demo order · No real purchase made"
        title={`Order ${order.id}`}
        copy={`${order.date} · ${order.restaurant}`}
      />
      <div className="tracking-layout">
        <section className="tracking-card">
          <div className="courier-line">
            <div className="order-icon">
              <UtensilsCrossed />
            </div>
            <div>
              <span>Current status</span>
              <h2>{order.status === "Delivered" ? "Delivered" : "Preparing your order"}</h2>
              <p>This stays on file so the next craving can reuse kitchen, budget and taste.</p>
            </div>
            <strong>{firstDish ? `${firstDish.minutes} min` : "—"}</strong>
          </div>
          <ol className="timeline">
            {steps.map((step, index) => (
              <li className={index <= doneThrough ? "done" : ""} key={step}>
                <span>{index < doneThrough ? <Check size={14} /> : index + 1}</span>
                <div>
                  <strong>{step}</strong>
                  <small>{index <= doneThrough ? "Recorded" : "Upcoming"}</small>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <aside className="summary-card">
          <span className="eyebrow">Order summary</span>
          <h3>{order.restaurant}</h3>
          <p>
            {order.items.map((item) => (
              <span key={item}>
                {item}
                <br />
              </span>
            ))}
          </p>
          <div className="total-line">
            <span>Total</span>
            <strong>{money(order.total)}</strong>
          </div>
          <div className="address-block">
            <MapPin />
            <div>
              <span>Deliver to</span>
              <strong>Jubilee Hills, Hyderabad</strong>
            </div>
          </div>
          {firstDish ? (
            <button className="button secondary full" type="button" onClick={() => add(firstDish.id)}>
              Reorder
            </button>
          ) : (
            <Link className="button secondary full" href="/concierge">
              Ask the concierge
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
