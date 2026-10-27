"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { DishCard } from "@/components/food/dish-card";
import { OrderBrief, briefFromPick } from "@/components/food/order-brief";
import { PageHeading } from "@/components/ui/page-heading";
import { MockAIProvider, greetingFor } from "@/lib/concierge";
import { money, promptSuggestions } from "@/lib/data";
import { etaMinutes, formatKm, haversineKm, resolveOrigin } from "@/lib/geo";
import { persistConciergeRun } from "@/lib/db/persist-client";
import { useDemoStore } from "@/lib/store";
import { TigerStatus } from "@/components/layout/tiger-status";
import { useHasHydrated } from "@/lib/use-hydrated";

export function ConciergePage() {
  const prompt = useDemoStore((s) => s.prompt);
  const setPrompt = useDemoStore((s) => s.setPrompt);
  const preferences = useDemoStore((s) => s.preferences);
  const orders = useDemoStore((s) => s.orders);
  const filters = useDemoStore((s) => s.filters);
  const setFilters = useDemoStore((s) => s.setFilters);
  const messages = useDemoStore((s) => s.messages);
  const pushMessages = useDemoStore((s) => s.pushMessages);
  const lastResult = useDemoStore((s) => s.lastResult);
  const setLastResult = useDemoStore((s) => s.setLastResult);
  const replaceCart = useDemoStore((s) => s.replaceCart);
  const hydrated = useHasHydrated();
  const [draft, setDraft] = useState(prompt);
  const autoRan = useRef(false);
  const latestAssistantId = [...messages].reverse().find((message) => message.role === "assistant" && message.id.endsWith("-r"))?.id;

  useEffect(() => {
    setDraft(prompt);
  }, [prompt]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const local = MockAIProvider.recommend({
      prompt: trimmed,
      prefs: preferences,
      orders,
      filters,
      lastResult,
    });
    let result = local;
    let modelNote = "";
    try {
      const response = await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          prefs: preferences,
          orders,
          filters,
          lastResult,
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as { source?: string; model?: string | null; result?: typeof local };
        if (data.result) {
          result = data.result;
          modelNote = data.source === "gemma" && data.model ? ` That's the food. Places nearby already serve it.` : "";
        }
      }
    } catch {
      result = local;
    }
    replaceCart(result.prepared);
    setLastResult(result);
    setPrompt(trimmed);
    const pickLine = result.confirmOrder
      ? `I've staged ${result.pick.name} from ${result.pick.restaurant} (${money(result.pick.price)}, ${result.pick.minutes} min). Approve it on checkout — I never place an order without you.`
      : `${result.interpretation}\n\nI'll go with ${result.pick.name} from ${result.pick.restaurant} at ${money(result.pick.price)}. ${result.recommendations[0]?.reasons.join(" ")}${modelNote}`;
    pushMessages([
      { id: `u-${Date.now()}`, role: "user", text: trimmed },
      { id: `a-${Date.now()}-r`, role: "assistant", text: pickLine },
    ]);
    setDraft("");
    if (!result.confirmOrder) {
      void persistConciergeRun({
        prompt: trimmed,
        pickDishId: result.pick.id,
        score: result.recommendations[0]?.score ?? 0,
        applied: result.applied,
      });
    }
  }

  useEffect(() => {
    if (!hydrated || autoRan.current || !prompt.trim()) return;
    if (messages.some((message) => message.role === "user" && message.text === prompt)) {
      autoRan.current = true;
      return;
    }
    autoRan.current = true;
    ask(prompt);
  }, [hydrated, prompt, messages]);

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(draft || prompt);
  }

  const origin = resolveOrigin(preferences);
  const brief = lastResult
    ? briefFromPick(
        lastResult.pick.name,
        lastResult.pick.restaurant,
        lastResult.pick.price,
        lastResult.pick.minutes,
        lastResult.recommendations[0]?.score ?? 90,
        [
          `${lastResult.pick.restaurant} · ${lastResult.pick.restaurantRating} kitchen in ${lastResult.pick.area}`,
          `${formatKm(haversineKm(origin, lastResult.pick))} from ${origin.label.split(",")[0]}`,
          `${money(lastResult.pick.price)} · ${etaMinutes(haversineKm(origin, lastResult.pick), lastResult.pick.minutes)} min`,
        ],
      )
    : undefined;

  return (
    <>
      <PageHeading
        eyebrow="AI Concierge · remembers your table"
        title="What would you like to eat?"
        copy="Tell us the area, how you eat, and what the day looks like. We name the food. Nearby places that already serve it come after."
      />
      <div className="concierge-layout">
        <section className="chat-panel">
          <div className="demo-note">
            <Sparkles size={16} /> We name the food from your diet, your tags, and what you ate last. Nearby menus only show where that food already exists.
          </div>
          <div className="chat-history">
            {messages.length ? (
              messages.map((message) =>
                message.role === "user" ? (
                  <div className="user-message" key={message.id}>
                    {message.text}
                  </div>
                ) : (
                  <div className="assistant-message result" key={message.id}>
                    <span className="brand-mark">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <p className="assistant-copy">{message.text}</p>
                      {lastResult && message.id === latestAssistantId && brief ? (
                        <OrderBrief compact {...brief} />
                      ) : null}
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="assistant-message">
                <span className="brand-mark">
                  <Sparkles size={16} />
                </span>
                <p>{greetingFor(preferences, orders)}</p>
              </div>
            )}
          </div>
          {lastResult ? (
            <div className="concierge-actions">
              <Link className="button primary" href="/checkout">
                Approve this order <ArrowRight size={16} />
              </Link>
              <Link className="button secondary" href="/recommendations">
                Compare other matches
              </Link>
            </div>
          ) : null}
          <form className="composer" onSubmit={submit}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Food request"
              placeholder="Today I feel like eating biryani"
            />
            <button type="submit" aria-label="Send request">
              <ArrowRight />
            </button>
          </form>
          <div className="suggestions">
            {promptSuggestions.slice(0, 4).map((item) => (
              <button type="button" onClick={() => ask(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
        </section>
        <aside className="filter-rail">
          <span className="eyebrow">This request</span>
          <p className="memory-chip">
            Usual spend {money(filters.budgetPaise)} · {preferences.diet === "nonveg" ? "Non-veg" : preferences.diet} ·
            skip {preferences.allergies.join(", ") || "no listed allergens"}
          </p>
          <TigerStatus />
          <label>
            Budget <strong>{money(filters.budgetPaise)}</strong>
            <input
              type="range"
              min="15000"
              max="80000"
              step="1000"
              value={filters.budgetPaise}
              onChange={(e) => setFilters({ budgetPaise: Number(e.target.value) })}
            />
          </label>
          <label>
            Delivery
            <select
              value={filters.delivery}
              onChange={(e) => setFilters({ delivery: e.target.value as typeof filters.delivery })}
            >
              <option value="fast">As soon as possible</option>
              <option value="balanced">Under 45 minutes</option>
              <option value="rated">Best rated</option>
            </select>
          </label>
          <label>
            People
            <select value={filters.people} onChange={(e) => setFilters({ people: Number(e.target.value) })}>
              <option value={1}>1 person</option>
              <option value={2}>2 people</option>
              <option value={4}>Family of 4</option>
            </select>
          </label>
          <div>
            <span>Meal type</span>
            <div className="segmented">
              {(["any", "veg", "nonveg"] as const).map((diet) => (
                <button
                  type="button"
                  className={filters.diet === diet ? "selected" : ""}
                  onClick={() => setFilters({ diet })}
                  key={diet}
                >
                  {diet === "any" ? "Any" : diet === "veg" ? "Veg" : "Non-veg"}
                </button>
              ))}
            </div>
          </div>
          {lastResult ? (
            <ul className="applied-list">
              {lastResult.applied.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </aside>
      </div>
      {lastResult ? (
        <section className="result-section">
          <div className="section-title">
            <div>
              <span className="eyebrow">Staged from your history</span>
              <h2>I&apos;d order this unless you change it</h2>
            </div>
            <Link href="/checkout">
              Approve {lastResult.pick.name} <ArrowRight size={15} />
            </Link>
          </div>
          {lastResult.missing.length ? (
            <p className="form-note">{lastResult.missing.join(" ")}</p>
          ) : null}
          <div className="dish-grid">
            {lastResult.recommendations.map(({ dish, score, reasons }, index) => (
              <div key={dish.id}>
                <DishCard dish={dish} ranked={index + 1} />
                <p className="match-why">
                  {score}% · {reasons.join(" ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
