import { BadgeCheck } from "lucide-react";
import { money } from "@/lib/data";

export function OrderBrief({
  compact = false,
  title = "Warm, bold & on time",
  points = ["Spicy, but not too oily", "Under ₹350 per person", "Delivery within 35 minutes"],
  score = 94,
}: {
  compact?: boolean;
  title?: string;
  points?: string[];
  score?: number;
}) {
  return (
    <aside className={`order-brief ${compact ? "compact" : ""}`}>
      <div className="brief-head">
        <span>THE ORDER BRIEF</span>
        <BadgeCheck size={17} />
      </div>
      <h3>{title}</h3>
      <ul>
        {points.map((point, index) => (
          <li key={point}>
            <span className={`dot ${index === 0 ? "orange" : index === 1 ? "green" : "ink"}`} />
            {point}
          </li>
        ))}
      </ul>
      <div className="brief-match">
        <span>Best match</span>
        <strong>{score}%</strong>
      </div>
    </aside>
  );
}

export function briefFromPick(
  name: string,
  restaurant: string,
  price: number,
  minutes: number,
  score: number,
  extra?: string[],
) {
  return {
    title: name,
    points: extra?.length ? extra : [`${restaurant}`, `${money(price)} per plate`, `${minutes} min delivery`],
    score,
  };
}
