"use client";

import { useRef } from "react";

export function FooterWordmark({ text = "Digibuggy" }: { text?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - box.left}px`);
    el.style.setProperty("--y", `${e.clientY - box.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} className="group relative overflow-hidden select-none" aria-hidden>
      <p className="wordmark wordmark-base">{text}</p>
      <p className="wordmark wordmark-glow absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">{text}</p>
    </div>
  );
}
