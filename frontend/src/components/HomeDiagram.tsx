"use client";

import { useEffect, useState } from "react";
import { PcDiagram, type DiagramStates } from "./PcDiagram";

const frames: { states: DiagramStates; caption: string; tone: "muted" | "ok" | "error" }[] = [
  { states: {}, caption: "An empty case.", tone: "muted" },
  { states: { case: "ok", motherboard: "ok" }, caption: "B650M motherboard goes in.", tone: "muted" },
  { states: { case: "ok", motherboard: "ok", cpu: "ok" }, caption: "Ryzen 7 7800X3D. Socket AM5 matches.", tone: "ok" },
  { states: { case: "ok", motherboard: "ok", cpu: "ok", cooler: "ok" }, caption: "Tower cooler, rated for 220 W.", tone: "ok" },
  { states: { case: "ok", motherboard: "ok", cpu: "ok", cooler: "ok", ram: "ok" }, caption: "32 GB DDR5 kit. Same memory type as the board.", tone: "ok" },
  {
    states: { case: "error", motherboard: "ok", cpu: "ok", cooler: "ok", ram: "ok", gpu: "error" },
    caption: "RTX 5080 is 338 mm. This case only fits 330 mm.",
    tone: "error",
  },
  { states: { case: "ok", motherboard: "ok", cpu: "ok", cooler: "ok", ram: "ok", gpu: "ok" }, caption: "Swapped for a 304 mm card. It fits.", tone: "ok" },
  { states: { case: "ok", motherboard: "ok", cpu: "ok", cooler: "ok", ram: "ok", gpu: "ok", storage: "ok" }, caption: "NVMe SSD in the M.2 slot.", tone: "ok" },
  {
    states: { case: "ok", motherboard: "ok", cpu: "ok", cooler: "ok", ram: "ok", gpu: "ok", storage: "ok", psu: "ok" },
    caption: "850 W power supply, 39% to spare. Everything fits.",
    tone: "ok",
  },
];

const toneClass = { muted: "text-muted", ok: "text-ok", error: "text-error" };

export function HomeDiagram() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrame(frames.length - 1);
      return;
    }
    const last = frame === frames.length - 1;
    const timer = setTimeout(() => setFrame((f) => (f + 1) % frames.length), last ? 3200 : frame === 5 ? 2200 : 1300);
    return () => clearTimeout(timer);
  }, [frame]);

  const current = frames[frame]!;

  return (
    <figure className="dot-grid mx-auto w-full max-w-[400px] rounded-2xl glass glow border p-5">
      <div className="mx-auto max-w-[250px]">
        <PcDiagram states={current.states} label="A PC being assembled part by part" />
      </div>
      <figcaption className="mt-4 flex min-h-10 items-start gap-3 border-t border-border pt-3 text-xs sm:text-sm" aria-live="polite">
        <span className="tabular-nums text-xs text-muted ">Example ·{" "}
          {String(frame + 1).padStart(2, "0")}/{String(frames.length).padStart(2, "0")}
        </span>
        <span className={toneClass[current.tone]}>{current.caption}</span>
      </figcaption>
    </figure>
  );
}
