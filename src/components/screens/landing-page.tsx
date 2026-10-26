"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { OrderBrief } from "@/components/food/order-brief";
import { AppFrame } from "@/components/layout/app-frame";
import { promptSuggestions } from "@/lib/data";
import { useDemoStore } from "@/lib/store";

export function LandingPage() {
  const setPrompt = useDemoStore((s) => s.setPrompt);

  return (
    <AppFrame landing>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={14} /> Your personal food concierge
          </span>
          <h1>
            Craving something?
            <br />
            <em>Let AI handle</em> the rest.
          </h1>
          <p>
            Tell FoodPilot what you&apos;re in the mood for. We&apos;ll find the right meal, compare your options, and
            prepare your order.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/login">
              Let AI find my food <ArrowRight size={17} />
            </Link>
            <Link className="button secondary" href="/discover">
              Explore food
            </Link>
          </div>
          <div className="prompt-row">
            {promptSuggestions.slice(0, 3).map((prompt) => (
              <Link href="/concierge" key={prompt} onClick={() => setPrompt(prompt)}>
                {prompt}
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo" role="img" aria-label="Indian biryani, paneer tikka and naan arranged on a table" />
          <OrderBrief />
          <span className="photo-caption">Tonight&apos;s table · curated in 18 sec</span>
        </div>
      </section>
      <section className="trust-strip">
        <div>
          <strong>30+</strong>
          <span>curated demo dishes</span>
        </div>
        <div>
          <strong>1 brief</strong>
          <span>instead of endless scrolling</span>
        </div>
        <div>
          <strong>Always</strong>
          <span>your approval before ordering</span>
        </div>
      </section>
      <section className="section editorial">
        <div>
          <span className="eyebrow">The effortless way to eat well</span>
          <h2>
            You bring the craving.
            <br />
            We do the comparing.
          </h2>
        </div>
        <ol className="steps">
          <li>
            <b>01</b>
            <h3>Say what you feel like</h3>
            <p>Natural language, dietary needs, budget, mood—say it your way.</p>
          </li>
          <li>
            <b>02</b>
            <h3>Review your order brief</h3>
            <p>See exactly what we understood and why each meal fits.</p>
          </li>
          <li>
            <b>03</b>
            <h3>Approve when it feels right</h3>
            <p>Customize, compare and confirm. Nothing happens without you.</p>
          </li>
        </ol>
      </section>
      <section className="section bento">
        <article className="bento-dark">
          <span className="eyebrow">Built around your life</span>
          <h2>
            Less searching.
            <br />
            Better dinners.
          </h2>
          <p>FoodPilot balances appetite, timing, budget and preferences—without turning dinner into a spreadsheet.</p>
          <Link href="/recommendations">
            See how matching works <ArrowRight size={16} />
          </Link>
        </article>
        <article className="food-panel">
          <div className="food-collage" />
          <h3>Real choices, clearly compared</h3>
          <p>Price, timing, diet, allergens and the tradeoffs that matter.</p>
        </article>
        <article className="privacy-panel">
          <ShieldCheck />
          <h3>Your approval is the final ingredient.</h3>
          <p>This local demo never charges money or places a real order. Sensitive food preferences remain under your control.</p>
        </article>
      </section>
      <footer>
        <div className="brand">
          <span className="brand-mark">
            <UtensilsCrossed size={18} />
          </span>{" "}
          FoodPilot AI
        </div>
        <p>A deterministic demo. No real purchases are made.</p>
        <Link href="/profile">Privacy & preferences</Link>
      </footer>
    </AppFrame>
  );
}
