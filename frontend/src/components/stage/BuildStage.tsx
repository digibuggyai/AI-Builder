"use client";

import { CATEGORIES, estimateWattage, type Build, type Category, type Issue } from "@pcb/shared";
import { useEffect, useRef, useState } from "react";
import { diagramStates } from "@/components/PcDiagram";
import { CATEGORY_META, formatINR } from "@/lib/parts";
import { PartArt } from "./PartArt";

type Region = { left: number; top: number; width: number; height: number };
type Photo = { src: string; alt: string; regions: Record<Exclude<Category, "monitor">, Region> };

const PHOTOS: Record<"white" | "black", Photo> = {
  white: {
    src: "/builds/white.jpg",
    alt: "A white Digibuggy build with lit fans",
    regions: {
      case: { left: 19, top: 19, width: 66, height: 76 },
      motherboard: { left: 33, top: 26, width: 29, height: 30 },
      cpu: { left: 40, top: 40, width: 8, height: 10 },
      cooler: { left: 38, top: 37, width: 12, height: 15 },
      ram: { left: 46, top: 36, width: 6, height: 17 },
      gpu: { left: 25, top: 55, width: 37, height: 13 },
      storage: { left: 35, top: 67, width: 20, height: 4 },
      psu: { left: 22, top: 70, width: 38, height: 10 },
    },
  },
  black: {
    src: "/builds/black.jpg",
    alt: "A black Digibuggy build with an RTX graphics card",
    regions: {
      case: { left: 13, top: 10, width: 73, height: 86 },
      motherboard: { left: 30, top: 24, width: 33, height: 34 },
      cpu: { left: 35.5, top: 33, width: 6, height: 8 },
      cooler: { left: 34, top: 31, width: 9, height: 12 },
      ram: { left: 45, top: 31, width: 5, height: 15 },
      gpu: { left: 19, top: 47, width: 46, height: 11 },
      storage: { left: 48, top: 58, width: 13, height: 3 },
      psu: { left: 18, top: 66, width: 31, height: 16 },
    },
  },
};

const ORDER = ["motherboard", "psu", "storage", "cpu", "ram", "cooler", "gpu"] as const;
const CORE = ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "cooler", "case"] as const;

const clip = (r: Region) =>
  `inset(${r.top}% ${100 - r.left - r.width}% ${100 - r.top - r.height}% ${r.left}% round 10px)`;

type Tone = "ok" | "warn" | "bad";
const TONE: Record<Tone, string> = {
  ok: "border-ok/40 bg-ok-tint text-ok",
  warn: "border-warn/40 bg-warn-tint text-warn",
  bad: "border-error/40 bg-error-tint text-error",
};

function specChecks(build: Build): { tone: Tone; text: string }[] {
  const { cpu, motherboard: board, ram, gpu, cooler, psu, case: pcCase } = build;
  const checks: { tone: Tone; text: string }[] = [];
  if (cpu && board) {
    checks.push(cpu.socket === board.socket ? { tone: "ok", text: `${cpu.socket} ✓` } : { tone: "bad", text: `${cpu.socket} ≠ ${board.socket}` });
  }
  if (ram && board) {
    checks.push(ram.memoryType === board.memoryType ? { tone: "ok", text: `${ram.memoryType} ✓` } : { tone: "bad", text: `${ram.memoryType} ≠ ${board.memoryType}` });
  }
  if (gpu && pcCase) {
    const spare = pcCase.maxGpuLengthMm - gpu.lengthMm;
    checks.push({ tone: spare < 0 ? "bad" : spare < 15 ? "warn" : "ok", text: `GPU ${gpu.lengthMm} mm · fits ${pcCase.maxGpuLengthMm}` });
  }
  if (cooler?.type === "Air" && cooler.heightMm != null && pcCase) {
    checks.push({ tone: cooler.heightMm <= pcCase.maxCoolerHeightMm ? "ok" : "bad", text: `Cooler ${cooler.heightMm} mm · max ${pcCase.maxCoolerHeightMm}` });
  }
  if (cooler && cpu) {
    checks.push({ tone: cooler.tdpRatingW >= cpu.tdpW ? "ok" : "bad", text: `${cooler.tdpRatingW} W cooling · CPU ${cpu.tdpW} W` });
  }
  const wattage = estimateWattage(build);
  if (psu && wattage > 0) {
    const load = wattage / psu.wattage;
    checks.push({ tone: load >= 1 ? "bad" : load > 0.77 ? "warn" : "ok", text: `${wattage} W of ${psu.wattage} W` });
  }
  return checks;
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

  const photo = PHOTOS[build.case?.color?.toLowerCase().includes("white") ? "white" : "black"];
  const complete = CORE.every((c) => build[c]) && !issues.some((i) => i.level === "error");
  const baseFilter = complete
    ? "none"
    : build.case
      ? "grayscale(0.7) brightness(0.42)"
      : "grayscale(1) brightness(0.22)";
  const checks = specChecks(build);
  const latestPart = latest ? build[latest] : undefined;

  return (
    <div>
      <div
        className={`relative aspect-square overflow-hidden rounded-2xl border bg-black ${
          states.case === "error" ? "border-error" : complete ? "border-accent/60" : "border-border"
        }`}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-700 ease-out"
          style={{ filter: baseFilter }}
        />

        {!complete &&
          ORDER.map((category) => {
            const part = build[category];
            if (!part) return null;
            const region = photo.regions[category];
            const state = states[category];
            return (
              <div key={`${category}-${part.slug}`}>
                <img
                  src={photo.src}
                  alt=""
                  aria-hidden
                  className="region-in absolute inset-0 h-full w-full object-cover"
                  style={{ clipPath: clip(region) }}
                />
                <span
                  aria-hidden
                  className={`absolute rounded-[10px] ${state === "error" ? "region-error" : "region-ring"}`}
                  style={{ left: `${region.left}%`, top: `${region.top}%`, width: `${region.width}%`, height: `${region.height}%` }}
                />
              </div>
            );
          })}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
          <p className="truncate text-xs text-white/80">{build.case ? build.case.name : "Pick a case to set the look"}</p>
          {complete ? (
            <span className="step-in shrink-0 rounded-md bg-accent px-2 py-1 font-mono text-[11px] font-semibold text-accent-ink">Build complete</span>
          ) : (
            <span className="shrink-0 font-mono text-[11px] text-white/60">
              {CORE.filter((c) => build[c]).length}/{CORE.length} parts
            </span>
          )}
        </div>
      </div>

      {checks.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Fit checks">
          {checks.map((c) => (
            <li key={c.text} className={`step-in rounded-md border px-2 py-0.5 font-mono text-[11px] ${TONE[c.tone]}`}>
              {c.text}
            </li>
          ))}
        </ul>
      )}

      {latestPart && latest && (
        <div key={`${latest}-${latestPart.slug}`} className="step-in mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#12151b] p-1.5">
            {latestPart.imageUrl ? (
              <img src={latestPart.imageUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
            ) : latest !== "case" && latest !== "monitor" ? (
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
