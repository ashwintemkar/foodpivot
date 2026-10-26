"use client";

import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { money } from "@/lib/data";
import { seedOrders } from "@/lib/memory";
import { useDemoStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export function OrdersPage() {
  const hydrated = useHasHydrated();
  const storeOrders = useDemoStore((s) => s.orders);
  const orders = hydrated ? storeOrders : seedOrders;

  return (
    <>
      <PageHeading
        eyebrow="Your table, remembered"
        title="Orders"
        copy="The concierge uses this history — last kitchens, spend, and what you actually finished — to pick the next plate."
      />
      <div className="tabs">
        <button className="active" type="button">
          All orders
        </button>
        <button type="button">In progress</button>
        <button type="button">Delivered</button>
      </div>
      <div className="order-list">
        {orders.map((order) => (
          <article key={order.id}>
            <div className="order-icon">
              <ShoppingBag />
            </div>
            <div>
              <span>
                {order.date} · {order.id}
              </span>
              <h3>{order.restaurant}</h3>
              <p>{order.items.join(" · ")}</p>
            </div>
            <div>
              <span className="status">{order.status}</span>
              <strong>{money(order.total)}</strong>
            </div>
            <Link href={`/orders/${order.id}`}>
              View details <ChevronRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
