"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, UtensilsCrossed, X } from "lucide-react";
import { LocationPicker } from "./location-picker";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { mainNav } from "@/lib/navigation";
import { useDemoStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
  const path = usePathname();
  const hydrated = useHasHydrated();
  const cartCount = useDemoStore((s) => s.cart.reduce((total, line) => total + line.quantity, 0));
  const shownCart = hydrated ? cartCount : 0;
  const { data: session, status } = useSession();
  const initials = (session?.user?.name ?? "KS")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [menu, setMenu] = useState(false);

  return (
    <header className="site-header" suppressHydrationWarning>
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="FoodPilot home">
          <span className="brand-mark">
            <UtensilsCrossed size={18} />
          </span>
          <span>
            FoodPilot <b>AI</b>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {mainNav.map((item) => (
            <Link className={path.startsWith(item.href) ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <LocationPicker />
          <ThemeToggle />
          <Link className="cart-button" href="/cart" aria-label={`Cart with ${shownCart} items`}>
            <ShoppingBag size={18} />
            <span>{shownCart}</span>
          </Link>
          {status === "authenticated" ? (
            <Link className="avatar" href="/profile" aria-label="Profile">
              {initials}
            </Link>
          ) : (
            <Link className="sign-in-link" href="/login">
              {status === "loading" ? "…" : "Sign in"}
            </Link>
          )}
          <button className="mobile-menu" type="button" onClick={() => setMenu(!menu)} aria-label="Open menu">
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {menu ? (
        <nav className="mobile-dropdown" aria-label="Mobile menu">
          {mainNav.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setMenu(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
