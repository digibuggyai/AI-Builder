"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/beginner", label: "Beginner" },
  { href: "/pro", label: "Pro" },
  { href: "/advanced", label: "Advanced" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const onLanding = pathname === "/";
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const goingDown = y > lastY.current;
      setHidden(goingDown && y > 80);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-3 z-40 px-3 transition-transform duration-300 ease-out ${
          hidden ? "-translate-y-[150%]" : "translate-y-0"
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 glass glow rounded-full border pr-2 pl-5 shadow-lg shadow-black/10">
          <Link href="/" aria-label="Digibuggy PC Builder home" className="flex items-center gap-3">
            <img src="/brand/digibuggy-logo-white.png" alt="Digibuggy" width={1920} height={214} className="h-4 w-auto light:hidden" />
            <img src="/brand/digibuggy-logo-dark.png" alt="Digibuggy" width={1920} height={214} className="hidden h-4 w-auto light:block" />
            <span className="hidden border-l border-border-strong pl-3 font-display text-sm font-light tracking-wide text-muted sm:inline">
              PC Builder
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {onLanding &&
              NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hidden rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground md:block"
                >
                  {item.label}
                </Link>
              ))}
            <ThemeToggle />
            <Link href="/beginner" className="btn-primary ml-1 rounded-full px-4 py-2 text-sm font-semibold">
              Start building
            </Link>
          </div>
        </nav>
      </header>
      <div aria-hidden className="h-20" />
    </>
  );
}
