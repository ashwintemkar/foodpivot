"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      /* demo-only persistence */
    }
  }

  return (
    <button className="icon-button" type="button" aria-label="Toggle theme" onClick={toggle}>
      {mounted ? (
        <>
          <span className="dark:hidden">
            <Moon size={18} />
          </span>
          <span className="hidden dark:inline">
            <Sun size={18} />
          </span>
        </>
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}
