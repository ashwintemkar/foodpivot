"use client";

import { Check, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { signOutAction } from "@/app/login/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { PageHeading } from "@/components/ui/page-heading";
import type { Diet } from "@/lib/data";
import { persistPreferences } from "@/lib/db/persist-client";
import { useDemoStore } from "@/lib/store";
import { TigerStatus } from "@/components/layout/tiger-status";

export function ProfilePage() {
  const preferences = useDemoStore((s) => s.preferences);
  const orders = useDemoStore((s) => s.orders);
  const setPreferences = useDemoStore((s) => s.setPreferences);
  const resetMemory = useDemoStore((s) => s.resetMemory);
  const { data: session } = useSession();
  const email = session?.user?.email ?? "Not signed in";
  const name = session?.user?.name ?? preferences.displayName;
  const [diet, setDiet] = useState<Diet>(preferences.diet);
  const [budget, setBudget] = useState(String(preferences.comfortBudgetPaise));
  const [allergies, setAllergies] = useState(preferences.allergies.join(", "));
  const [saved, setSaved] = useState(false);

  function save() {
    const patch = {
      diet,
      comfortBudgetPaise: Number(budget) || preferences.comfortBudgetPaise,
      allergies: allergies.split(",").map((item) => item.trim()).filter(Boolean),
    };
    setPreferences(patch);
    void persistPreferences({ ...useDemoStore.getState().preferences, ...patch });
    setSaved(true);
  }

  function exportData() {
    const blob = new Blob(
      [JSON.stringify({ preferences, orders }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "foodpilot-demo-memory.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeading
        eyebrow="Your FoodPilot"
        title="Profile & preferences"
        copy="This is what the concierge actually uses when you say you feel like biryani."
      />
      <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-avatar">{name.slice(0, 2).toUpperCase()}</div>
          <h2>{name}</h2>
          <p>{email}</p>
          <span>{preferences.location}</span>
          <TigerStatus />
          <p className="form-note">
            {session?.user?.email === "kiran@example.demo"
              ? "Development demo session — not a Google account."
              : "Signed in with Google."}{" "}
            {orders.length} remembered orders.
          </p>
          <form action={signOutAction}>
            <AuthSubmitButton className="button secondary full">Sign out</AuthSubmitButton>
          </form>
        </aside>
        <section className="settings">
          <div className="settings-group">
            <h2>Food preferences</h2>
            <label>
              Default diet
              <select value={diet} onChange={(e) => setDiet(e.target.value as Diet)}>
                <option value="nonveg">Non-vegetarian</option>
                <option value="veg">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="any">No default</option>
              </select>
            </label>
            <label>
              Comfort budget
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="18000">Under ₹200 per person</option>
                <option value="35000">₹200–₹400 per person</option>
                <option value="55000">₹400–₹700 per person</option>
              </select>
            </label>
            <label>
              Allergies
              <input value={allergies} onChange={(e) => setAllergies(e.target.value)} />
            </label>
            <div className="warning-box amber">
              <ShieldCheck />
              <p>Allergy data is illustrative. FoodPilot does not guarantee medical safety.</p>
            </div>
          </div>
          <div className="settings-group danger-zone">
            <h2>Privacy controls</h2>
            <p>Export or remove saved preferences and demo order history from this browser.</p>
            <div>
              <button type="button" onClick={exportData}>
                Export demo data
              </button>
              <button type="button" onClick={() => resetMemory()}>
                Delete demo data
              </button>
            </div>
          </div>
          <button className="button primary" type="button" onClick={save}>
            {saved ? (
              <>
                <Check /> Saved
              </>
            ) : (
              "Save preferences"
            )}
          </button>
        </section>
      </div>
    </>
  );
}
