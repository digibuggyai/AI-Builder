"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MODES = [
  { href: "/beginner", label: "Beginner", hint: "Build it for me" },
  { href: "/pro", label: "Pro", hint: "Guided build" },
  { href: "/advanced", label: "Advanced", hint: "Full control" },
];

export function ModeSwitch() {
  const pathname = usePathname();

  return (
    <nav aria-label="Build mode" className="inline-flex glass glow rounded-xl border p-1">
      {MODES.map((mode) => {
        const active = pathname.startsWith(mode.href);
        return (
          <Link
            key={mode.href}
            href={mode.href}
            aria-current={active ? "page" : undefined}
            title={mode.hint}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              active ? "bg-accent text-accent-ink shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {mode.label}
          </Link>
        );
      })}
    </nav>
  );
}
