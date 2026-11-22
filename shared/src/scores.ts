import type { Cpu, Gpu } from "./types";

const GPU_SCORES: [string, number][] = [
  ["RTX 5090", 140],
  ["RTX 4090", 115],
  ["RTX 5080", 100],
  ["RTX 4080 SUPER", 95],
  ["RTX 4080", 92],
  ["RTX 5070 TI", 82],
  ["RTX 4070 TI SUPER", 78],
  ["RTX 4070 TI", 72],
  ["RTX 5070", 67],
  ["RTX 4070 SUPER", 66],
  ["RTX 4070", 58],
  ["RTX 5060 TI", 52],
  ["RTX 4060 TI", 46],
  ["RTX 5060", 45],
  ["RTX 4060", 38],
  ["RTX 5050", 34],
  ["RTX 3060 TI", 40],
  ["RTX 3060", 33],
  ["RTX 3050 6GB", 17],
  ["RTX 3050", 22],
  ["GTX 1650", 14],
  ["RX 7900 XTX", 98],
  ["RX 7900 XT", 85],
  ["RX 9070 XT", 86],
  ["RX 9070", 78],
  ["RX 7800 XT", 68],
  ["RX 7700 XT", 55],
  ["RX 9060 XT", 52],
  ["RX 7600 XT", 40],
  ["RX 7600", 38],
  ["RX 6600", 32],
  ["ARC B580", 42],
  ["ARC B570", 36],
  ["ARC A750", 34],
];

const LONGEST_FIRST = [...GPU_SCORES].sort((a, b) => b[0].length - a[0].length);

function normalise(text: string): string {
  return ` ${text.toUpperCase().replace(/GEFORCE|RADEON|NVIDIA|INTEL/g, " ").replace(/[^A-Z0-9]+/g, " ").trim()} `;
}

function lookup(text: string): number | null {
  const haystack = normalise(text);
  for (const [chip, score] of LONGEST_FIRST) {
    if (haystack.includes(` ${chip} `)) return score;
  }
  return null;
}

export function gpuScore(gpu: Pick<Gpu, "chipset" | "name">): number | null {
  return lookup(gpu.chipset) ?? lookup(gpu.name);
}

export function cpuScore(cpu: Pick<Cpu, "name" | "cores" | "threads" | "boostClockGhz" | "baseClockGhz">, gaming: boolean): number {
  const clock = Number(cpu.boostClockGhz ?? cpu.baseClockGhz ?? 3.5);
  if (gaming) {
    const cache = /X3D/i.test(cpu.name) ? 1.25 : 1;
    return Math.min(cpu.cores, 8) * clock * cache;
  }
  return (cpu.cores + (cpu.threads - cpu.cores) * 0.3) * clock;
}
