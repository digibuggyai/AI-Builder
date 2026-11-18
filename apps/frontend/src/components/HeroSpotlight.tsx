"use client";

import { useRef } from "react";

export function HeroSpotlight({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - box.left}px`);
    el.style.setProperty("--my", `${e.clientY - box.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={`group/spot relative isolate ${className ?? ""}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 -z-10 size-110 rounded-full bg-[radial-gradient(closest-side,var(--accent-tint),transparent)] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{ translate: "calc(var(--mx, 0px) - 50%) calc(var(--my, 0px) - 50%)" }}
      />
      {children}
    </div>
  );
}
