import { ShieldCheck } from "lucide-react";

export function AllergyWarning({
  allergens,
  tone = "default",
}: {
  allergens?: string[];
  tone?: "default" | "amber";
}) {
  const detail = allergens?.length
    ? `Contains ${allergens.join(", ")}. Verify directly before ordering.`
    : "Allergen information not verified.";

  return (
    <div className={`warning-box ${tone === "amber" ? "amber" : ""}`}>
      <ShieldCheck />
      <p>
        <strong>Allergen information</strong>
        {detail}
      </p>
    </div>
  );
}
