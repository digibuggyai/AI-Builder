"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "text-muted hover:bg-surface-2 hover:text-foreground" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={`grid size-8 place-items-center rounded-full transition-colors ${className}`}
    >
      <Sun className="size-4 light:hidden" aria-hidden />
      <Moon className="hidden size-4 light:block" aria-hidden />
    </button>
  );
}
