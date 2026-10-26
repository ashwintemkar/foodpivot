"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf, Plus, ShieldAlert, UtensilsCrossed, Utensils, Wheat } from "lucide-react";
import { useEffect, useState } from "react";
import { persistPreferences } from "@/lib/db/persist-client";
import { useDemoStore } from "@/lib/store";
import type { Diet } from "@/lib/data";
import { defaultPreferences } from "@/lib/memory";

const dietOptions: { label: string; value: Diet; copy: string; icon: typeof Leaf }[] = [
  { label: "Vegetarian", value: "veg", copy: "Paneer, dals and vegetable mains", icon: Leaf },
  { label: "Non-vegetarian", value: "nonveg", copy: "Chicken, goat, fish and veg", icon: Utensils },
  { label: "Vegan", value: "vegan", copy: "No dairy, eggs or honey", icon: Wheat },
  { label: "No default", value: "any", copy: "Ask me each time", icon: UtensilsCrossed },
];

const cuisineOptions = ["Hyderabadi", "South Indian", "Punjabi", "Bengali", "Modern Indian"];

export function OnboardingPage() {
  const router = useRouter();
  const preferences = useDemoStore((s) => s.preferences);
  const setPreferences = useDemoStore((s) => s.setPreferences);
  const [step, setStep] = useState(1);
  const [diet, setDiet] = useState<Diet>(defaultPreferences.diet);
  const [cuisines, setCuisines] = useState<string[]>(defaultPreferences.preferredCuisines);
  const [allergies, setAllergies] = useState(defaultPreferences.allergies.join(", "));
  const [dislikes, setDislikes] = useState(defaultPreferences.dislikes.join(", "));
  const [avoidOily, setAvoidOily] = useState(defaultPreferences.avoidOily);
  const [displayName, setDisplayName] = useState(defaultPreferences.displayName);
  const [location, setLocation] = useState(defaultPreferences.location);
  const [budget, setBudget] = useState(String(defaultPreferences.comfortBudgetPaise));

  useEffect(() => {
    setDiet(preferences.diet);
    setCuisines(preferences.preferredCuisines);
    setAllergies(preferences.allergies.join(", "));
    setDislikes(preferences.dislikes.join(", "));
    setAvoidOily(preferences.avoidOily);
    setDisplayName(preferences.displayName);
    setLocation(preferences.location);
    setBudget(String(preferences.comfortBudgetPaise));
  }, [preferences]);

  function toggleCuisine(item: string) {
    setCuisines((current) => (current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]));
  }

  function saveAndGo() {
    const next = {
      diet,
      preferredCuisines: cuisines,
      allergies: allergies.split(",").map((item) => item.trim()).filter(Boolean),
      dislikes: dislikes.split(",").map((item) => item.trim()).filter(Boolean),
      avoidOily,
      displayName: displayName.trim() || "Kiran",
      location,
      comfortBudgetPaise: Number(budget) || 35000,
    };
    setPreferences(next);
    void persistPreferences({ ...useDemoStore.getState().preferences, ...next });
    router.push("/concierge");
  }

  const titles = ["How do you like to eat?", "What should we watch for?", "Everyday details"] as const;
  const copy = [
    "These defaults help the concierge when you only name a craving.",
    "Allergies stay separate from dislikes. We never make medical guarantees.",
    "Budget and location narrow the list without taking control away.",
  ] as const;

  return (
    <div className="app-canvas onboarding">
      <Link href="/" className="onboarding-brand">
        <span className="brand-mark">
          <UtensilsCrossed size={16} />
        </span>
        FoodPilot <b>AI</b>
      </Link>
      <div className="onboarding-card">
        <div className="onboarding-top">
          <div>
            <span className="eyebrow">Make it yours</span>
            <ol className="onboarding-steps" aria-label="Onboarding progress">
              {[1, 2, 3].map((item) => (
                <li key={item} className={item === step ? "current" : item < step ? "done" : ""}>
                  {item}
                </li>
              ))}
            </ol>
          </div>
          <button className="text-button" type="button" onClick={() => router.push("/concierge")}>
            Skip for now
          </button>
        </div>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${step * 33.34}%` }} />
        </div>
        <section className="onboarding-body">
          <h1>{titles[step - 1]}</h1>
          <p>{copy[step - 1]}</p>
          {step === 1 ? (
            <>
              <fieldset className="onboarding-field">
                <legend>Food preference</legend>
                <div className="large-choices">
                  {dietOptions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        className={diet === item.value ? "selected" : ""}
                        type="button"
                        key={item.value}
                        onClick={() => setDiet(item.value)}
                      >
                        <Icon size={18} />
                        <strong>{item.label}</strong>
                        <span>{item.copy}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <fieldset className="onboarding-field">
                <legend>Cuisines you love</legend>
                <div className="tag-picker">
                  {cuisineOptions.map((item) => (
                    <button
                      type="button"
                      className={cuisines.includes(item) ? "selected" : ""}
                      key={item}
                      onClick={() => toggleCuisine(item)}
                    >
                      {item}
                      <Plus size={14} />
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          ) : null}
          {step === 2 ? (
            <div className="form-stack">
              <label>
                Food allergies
                <input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. peanuts, shellfish" />
              </label>
              <p className="form-note">
                <ShieldAlert size={14} /> Unknown allergen data is never marked safe.
              </p>
              <label>
                Ingredients you dislike
                <input value={dislikes} onChange={(e) => setDislikes(e.target.value)} placeholder="e.g. mushrooms, coriander" />
              </label>
              <label>
                Health-related preference (optional)
                <select value={avoidOily ? "oily" : "none"} onChange={(e) => setAvoidOily(e.target.value === "oily")}>
                  <option value="none">No preference</option>
                  <option value="oily">Avoid oily foods</option>
                </select>
              </label>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="form-stack two-col">
              <label>
                Display name
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </label>
              <label>
                Delivery location
                <input value={location} onChange={(e) => setLocation(e.target.value)} />
              </label>
              <label>
                Typical budget
                <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="35000">₹200–₹400</option>
                  <option value="18000">Under ₹200</option>
                  <option value="55000">₹400–₹700</option>
                </select>
              </label>
              <label>
                Delivery priority
                <select
                  value={preferences.deliveryPriority}
                  onChange={(e) => setPreferences({ deliveryPriority: e.target.value as typeof preferences.deliveryPriority })}
                >
                  <option value="balanced">Balanced</option>
                  <option value="fast">Fastest</option>
                  <option value="rated">Best rated</option>
                </select>
              </label>
            </div>
          ) : null}
        </section>
        <div className="onboarding-actions">
          {step > 1 ? (
            <button className="button secondary" type="button" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            className="button primary"
            type="button"
            onClick={() => (step < 3 ? setStep(step + 1) : saveAndGo())}
          >
            {step < 3 ? "Continue" : "Save & meet your concierge"} <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
