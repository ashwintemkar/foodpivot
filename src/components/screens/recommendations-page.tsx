"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { OrderBrief, briefFromPick } from "@/components/food/order-brief";
import { PageHeading } from "@/components/ui/page-heading";
import { MockAIProvider } from "@/lib/concierge";
import { foodPhotoClass, money } from "@/lib/data";
import { useDemoStore } from "@/lib/store";

export function RecommendationsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const prompt = useDemoStore((s) => s.prompt);
  const preferences = useDemoStore((s) => s.preferences);
  const orders = useDemoStore((s) => s.orders);
  const filters = useDemoStore((s) => s.filters);
  const lastResult = useDemoStore((s) => s.lastResult);
  const replaceCart = useDemoStore((s) => s.replaceCart);
  const setLastResult = useDemoStore((s) => s.setLastResult);
  const result =
    lastResult ??
    MockAIProvider.recommend({
      prompt: prompt || "Today I feel like eating biryani.",
      prefs: preferences,
      orders,
      filters,
    });
  const top = result.recommendations[0];
  const brief = top
    ? briefFromPick(top.dish.name, top.dish.restaurant, top.dish.price, top.dish.minutes, top.score)
    : undefined;

  return (
    <>
      <PageHeading
        eyebrow="Your ranked shortlist"
        title="Good choices, explained."
        copy="Scores prefer highly rated kitchens close to your current address, then budget, diet and past orders."
        action={brief ? <OrderBrief compact {...brief} /> : null}
      />
      <div className="recommendation-list">
        {result.recommendations.map(({ dish, score, reasons }, index) => (
          <article key={dish.id} className="recommendation-row">
            <span className="big-rank">0{index + 1}</span>
            <div
              className={`mini-food ${foodPhotoClass(dish.family)}`}
              style={{ backgroundPosition: dish.imagePosition }}
            />
            <div className="recommend-copy">
              <span>{dish.restaurant}</span>
              <h2>{dish.name}</h2>
              <p>{reasons.join(" ")}</p>
              <div className="tag-row">
                {dish.tags.map((tag) => (
                  <b key={tag}>
                    <Check size={12} />
                    {tag}
                  </b>
                ))}
                <b className="warning">Allergens: {dish.allergens.length ? dish.allergens.join(", ") : "not verified"}</b>
              </div>
            </div>
            <div className="score">
              <strong>{score}%</strong>
              <span>match</span>
              <b>
                {money(dish.price)} · {dish.minutes} min
              </b>
              <button
                type="button"
                onClick={() => {
                  replaceCart([{ dishId: dish.id, quantity: Math.max(1, filters.people) }]);
                  setLastResult({ ...result, pick: dish, prepared: [{ dishId: dish.id, quantity: 1 }] });
                  setSelected((s) =>
                    s.includes(dish.id) ? s.filter((id) => id !== dish.id) : s.length < 3 ? [...s, dish.id] : s,
                  );
                }}
              >
                {selected.includes(dish.id) ? "Staged" : "Select meal"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {selected.length ? (
        <div className="compare-bar">
          <span>
            <strong>{selected.length} meal staged</strong> · Approve when it looks right
          </span>
          <Link href="/checkout">
            Go to approval <ArrowRight size={16} />
          </Link>
        </div>
      ) : null}
    </>
  );
}
