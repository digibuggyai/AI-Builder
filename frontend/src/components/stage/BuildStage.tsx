"use client";

import { CATEGORIES, type Build, type Category, type Issue, type PartByCategory, type Ram } from "@pcb/shared";
import { useEffect, useRef, useState } from "react";
import { diagramStates } from "@/components/PcDiagram";
import { CATEGORY_META, formatINR } from "@/lib/parts";
import { PartArt } from "./PartArt";

type StageCategory = "motherboard" | "cpu" | "cooler" | "ram" | "gpu" | "storage" | "psu";

const SLOTS: Record<StageCategory, { left: number; top: number; width: number; height: number; z: number }> = {
  motherboard: { left: 6, top: 6, width: 64, height: 64, z: 1 },
  storage: { left: 17, top: 58.5, width: 27, height: 4.5, z: 2 },
  psu: { left: 6, top: 77, width: 46, height: 17, z: 2 },
  cpu: { left: 23, top: 17, width: 15, height: 12, z: 2 },
  ram: { left: 46.5, top: 9, width: 15, height: 29, z: 3 },
  cooler: { left: 17.5, top: 11, width: 26, height: 23, z: 4 },
  gpu: { left: 4, top: 43, width: 82, height: 12.5, z: 5 },
};

const ORDER: StageCategory[] = ["motherboard", "storage", "psu", "cpu", "ram", "cooler", "gpu"];

function Visual({ category, part }: { category: StageCategory; part: PartByCategory[Category] }) {
  if (part.imageUrl) {
    return (
      <img
        src={part.imageUrl}
        alt={part.name}
        referrerPolicy="no-referrer"
        className="h-full w-full rounded-md bg-white object-contain p-1 shadow-lg"
      />
    );
  }
  if (category === "ram") {
    const sticks = Math.min(Math.max((part as Ram).modules, 1), 4);
    return (
      <div className="flex h-full gap-[6%]">
        {Array.from({ length: sticks }, (_, i) => (
          <div key={i} className="h-full flex-1">
            <PartArt category="ram" part={part} />
          </div>
        ))}
      </div>
    );
  }
  return <PartArt category={category} part={part} />;
}

function CaseFan({ top }: { top: number }) {
  return (
    <svg viewBox="0 0 60 60" className="absolute right-[5%] w-[15%]" style={{ top: `${top}%` }} aria-hidden>
      <circle cx="30" cy="30" r="28" fill="#0c0e12" stroke="#2a313d" strokeWidth="2" />
      <g className="fan-spin">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d="M30 30 q 14 -5 18 -20 q -11 2 -18 20 z" fill="#2c3340" transform={`rotate(${a} 30 30)`} />
        ))}
      </g>
      <circle cx="30" cy="30" r="6" fill="#262c37" />
    </svg>
  );
}

export function BuildStage({ build, issues }: { build: Build; issues: Issue[] }) {
  const states = diagramStates(build, issues);
  const previous = useRef<Build>(build);
  const [latest, setLatest] = useState<Category | null>(null);

  useEffect(() => {
    const added = CATEGORIES.find((c) => build[c] && build[c]?.slug !== previous.current[c]?.slug);
    previous.current = build;
    if (added) setLatest(added);
  }, [build]);

  const latestPart = latest ? build[latest] : undefined;
  const caseState = states.case;

  return (
    <div>
      <div
        className={`relative aspect-[4/5] overflow-hidden rounded-2xl border-2 bg-[linear-gradient(160deg,#171b23,#0b0d11)] transition-colors ${
          caseState === "error" ? "border-error" : build.case ? "border-accent/70" : "border-border"
        }`}
        role="img"
        aria-label="Your PC being assembled"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.07),transparent_35%)]" />
        <div className="absolute top-[74%] right-[4%] left-[4%] h-px bg-[#2a313d]" />
        {build.case && [8, 28, 48].map((top) => <CaseFan key={top} top={top} />)}

        {ORDER.map((category) => {
          const slot = SLOTS[category];
          const part = build[category];
          const style = { left: `${slot.left}%`, top: `${slot.top}%`, width: `${slot.width}%`, height: `${slot.height}%`, zIndex: slot.z };
          if (!part) {
            return (
              <div
                key={`${category}-empty`}
                style={style}
                className="absolute grid place-items-center rounded-md border border-dashed border-[#343c4a] text-[10px] font-medium tracking-wide text-[#5d6779] uppercase"
              >
                {category === "cooler" ? "" : CATEGORY_META[category].short}
              </div>
            );
          }
          const state = states[category];
          return (
            <div
              key={`${category}-${part.slug}`}
              style={style}
              className={`stage-drop absolute ${state === "error" ? "stage-error" : "stage-land"}`}
              title={part.name}
            >
              <Visual category={category} part={part} />
            </div>
          );
        })}

        {build.case && (
          <p className="absolute top-3 left-3 max-w-[70%] truncate rounded-md bg-black/60 px-2 py-1 text-[11px] text-white/80">
            {build.case.name}
          </p>
        )}
      </div>

      {latestPart && latest && (
        <div key={`${latest}-${latestPart.slug}`} className="step-in mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#12151b] p-1.5">
            {latestPart.imageUrl ? (
              <img src={latestPart.imageUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
            ) : latest in SLOTS ? (
              <PartArt category={latest} part={latestPart} />
            ) : (
              <span className="text-[10px] text-white/70">{CATEGORY_META[latest].short}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Added {CATEGORY_META[latest].label.toLowerCase()}</p>
            <p className="truncate text-sm font-medium">{latestPart.name}</p>
          </div>
          <p className={`shrink-0 font-mono text-xs ${states[latest] === "error" ? "text-error" : "text-ok"}`}>
            {states[latest] === "error" ? "✗ check" : formatINR(latestPart.priceRupees)}
          </p>
        </div>
      )}
    </div>
  );
}
