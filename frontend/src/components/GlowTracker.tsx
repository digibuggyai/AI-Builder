"use client";

import { useEffect } from "react";

export function GlowTracker() {
  useEffect(() => {
    let frame = 0;
    let x = -9999;
    let y = -9999;

    function update() {
      frame = 0;
      for (const el of document.querySelectorAll<HTMLElement>(".glow")) {
        const box = el.getBoundingClientRect();
        if (box.bottom < -200 || box.top > window.innerHeight + 200) continue;
        el.style.setProperty("--mx", `${x - box.left}px`);
        el.style.setProperty("--my", `${y - box.top}px`);
      }
    }

    function onMove(event: PointerEvent) {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
