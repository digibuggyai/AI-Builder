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
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      setAtTop(y < 40);
      lastY.current = y;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = onLanding && atTop;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-3 z-40 px-3 transition-transform duration-300 ease-out ${
          hidden ? "-translate-y-[150%]" : "translate-y-0"
        }`}
      >
        <nav
          className={`mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-full border pr-2 pl-5 transition-[background-color,border-color,box-shadow] duration-300 ${
            overHero
              ? "border-transparent bg-transparent text-white"
              : "border-border bg-surface/90 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-md"
          }`}
        >
          <Link href="/" aria-label="Digibuggy PC Builder home" className="flex items-center gap-3">
            {overHero ? (
              <img src="/brand/digibuggy-logo-white.png" alt="Digibuggy" width={1920} height={214} className="h-4 w-auto" />
            ) : (
              <>
                <img src="/brand/digibuggy-logo-white.png" alt="Digibuggy" width={1920} height={214} className="h-4 w-auto light:hidden" />
                <img src="/brand/digibuggy-logo-dark.png" alt="Digibuggy" width={1920} height={214} className="hidden h-4 w-auto light:block" />
              </>
            )}
            <span
              className={`hidden border-l pl-3 font-display text-sm tracking-wide sm:inline ${
                overHero ? "border-white/25 text-white/70" : "border-border-strong text-muted"
              }`}
            >
              PC Builder
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {onLanding &&
              NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hidden rounded-full px-3 py-1.5 text-sm transition-colors md:block ${
                    overHero ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            <ThemeToggle className={overHero ? "text-white/75 hover:bg-white/10 hover:text-white" : undefined} />
            <Link
              href="/beginner"
              className={`ml-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                overHero ? "bg-white text-[#111] hover:bg-white/90" : "bg-foreground text-background hover:opacity-90"
              }`}
            >
              Start building
            </Link>
          </div>
        </nav>
      </header>
      {!onLanding && <div aria-hidden className="h-20" />}
    </>
  );
}
