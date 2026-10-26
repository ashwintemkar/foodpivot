"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { mainNav } from "@/lib/navigation";

export function MobileBottomNav() {
  const path = usePathname();
  const items = [{ href: "/", label: "Home", icon: Home }, ...mainNav.slice(0, 3)];

  return (
    <nav className="mobile-bottom" aria-label="Mobile navigation">
      {items.map(({ href, label, icon: Icon }) => (
        <Link href={href} key={href} className={path === href ? "active" : ""}>
          <Icon size={19} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
