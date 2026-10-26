import { Heart, Search, ShoppingBag, WandSparkles } from "lucide-react";

export const mainNav = [
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/concierge", label: "AI Concierge", icon: WandSparkles },
  { href: "/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/favorites", label: "Favorites", icon: Heart },
] as const;
