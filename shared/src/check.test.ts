import { describe, expect, it } from "vitest";
import { checkBuild, estimateWattage, problemsIfChosen } from "./check";
import type { Case, Cooler, Cpu, Gpu, Motherboard, PartBase, Psu, Ram } from "./types";

const base: PartBase = { id: 1, slug: "x", brand: "Test", name: "Test part", priceRupees: 1000, inStock: true };

const cpu = (o: Partial<Cpu> = {}): Cpu => ({
  ...base, brand: "AMD", name: "Ryzen 5 7600", socket: "AM5", cores: 6, threads: 12,
  baseClockGhz: "3.8", boostClockGhz: "5.1", tdpW: 65, memoryTypes: ["DDR5"],
  maxMemorySpeedMts: 5200, hasIntegratedGraphics: true, pcieVersion: 5, ...o,
});
const board = (o: Partial<Motherboard> = {}): Motherboard => ({
  ...base, socket: "AM5", chipset: "B650", formFactor: "Micro-ATX", memoryType: "DDR5",
  ramSlots: 4, maxRamGb: 192, maxRamSpeedMts: 7200, m2Slots: 2, sataPorts: 4, pcieVersion: 4, hasWifi: true, ...o,
});
const ram = (o: Partial<Ram> = {}): Ram => ({
  ...base, memoryType: "DDR5", modules: 2, capacityGb: 32, speedMts: 6000, casLatency: 30, heightMm: 33, rgb: false, ...o,
});
const gpu = (o: Partial<Gpu> = {}): Gpu => ({
  ...base, chipMaker: "NVIDIA", chipset: "RTX 4060", vramGb: 8, lengthMm: 199, slotWidth: "2.0",
  tdpW: 115, recommendedPsuW: 550, powerConnectors: "1x 8-pin", pcieVersion: 4, ...o,
});
const psu = (o: Partial<Psu> = {}): Psu => ({
  ...base, wattage: 750, efficiency: "80+ Gold", modular: "Full", formFactor: "ATX", has12v2x6: false, ...o,
});
const cooler = (o: Partial<Cooler> = {}): Cooler => ({
  ...base, type: "Air", sockets: ["AM5", "LGA1700"], tdpRatingW: 220, heightMm: 155, radiatorMm: null, ...o,
});
const pcCase = (o: Partial<Case> = {}): Case => ({
  ...base, motherboardSupport: ["ATX", "Micro-ATX", "Mini-ITX"], psuSupport: ["ATX"],
  maxGpuLengthMm: 360, maxCoolerHeightMm: 170, radiatorSupportMm: [240, 360], drives25: 2, drives35: 2, color: "Black", ...o,
});

const codes = (issues: { code: string }[]) => issues.map((i) => i.code);

describe("checkBuild", () => {
  it("finds no problems in a good build", () => {
    const issues = checkBuild({
      cpu: cpu(), motherboard: board(), ram: ram(), gpu: gpu(), psu: psu(), cooler: cooler(), case: pcCase(),
    });
    expect(issues).toEqual([]);
  });

  it("catches a CPU and motherboard with different sockets", () => {
    const issues = checkBuild({ cpu: cpu({ socket: "AM5" }), motherboard: board({ socket: "LGA1700" }) });
    expect(codes(issues)).toContain("cpu-socket");
  });

  it("catches DDR4 RAM on a DDR5 board", () => {
    const issues = checkBuild({ motherboard: board(), ram: ram({ memoryType: "DDR4" }) });
    expect(codes(issues)).toContain("ram-type");
  });

  it("catches a 4-stick kit on a 2-slot board", () => {
    const issues = checkBuild({ motherboard: board({ ramSlots: 2 }), ram: ram({ modules: 4 }) });
    expect(codes(issues)).toContain("ram-slots");
  });

  it("catches a GPU that is too long for the case", () => {
    const issues = checkBuild({ gpu: gpu({ lengthMm: 338 }), case: pcCase({ maxGpuLengthMm: 330 }) });
    expect(codes(issues)).toContain("case-gpu");
  });

  it("warns when the GPU only just fits", () => {
    const issues = checkBuild({ gpu: gpu({ lengthMm: 325 }), case: pcCase({ maxGpuLengthMm: 330 }) });
    expect(codes(issues)).toEqual(["case-gpu-tight"]);
  });

  it("catches a board that is too big for the case", () => {
    const issues = checkBuild({ motherboard: board({ formFactor: "ATX" }), case: pcCase({ motherboardSupport: ["Mini-ITX"] }) });
    expect(codes(issues)).toContain("case-board");
  });

  it("catches a cooler that is too weak for the CPU", () => {
    const issues = checkBuild({ cpu: cpu({ tdpW: 170 }), cooler: cooler({ tdpRatingW: 65 }) });
    expect(codes(issues)).toContain("cooler-tdp");
  });

  it("catches a radiator the case can't hold", () => {
    const issues = checkBuild({
      cooler: cooler({ type: "Liquid", heightMm: null, radiatorMm: 360 }),
      case: pcCase({ radiatorSupportMm: [240, 280] }),
    });
    expect(codes(issues)).toContain("case-radiator");
  });

  it("catches a power supply that is too small", () => {
    const issues = checkBuild({ cpu: cpu({ tdpW: 170 }), gpu: gpu({ tdpW: 360 }), psu: psu({ wattage: 550 }) });
    expect(codes(issues)).toContain("psu-low");
  });

  it("warns when a CPU without graphics has no GPU", () => {
    const issues = checkBuild({ cpu: cpu({ hasIntegratedGraphics: false }) });
    expect(codes(issues)).toContain("cpu-no-graphics");
  });
});

describe("estimateWattage", () => {
  it("is 0 for an empty build", () => {
    expect(estimateWattage({})).toBe(0);
  });

  it("adds CPU boost, GPU and the rest of the system", () => {
    expect(estimateWattage({ cpu: cpu(), gpu: gpu() })).toBe(275);
  });
});

describe("problemsIfChosen", () => {
  it("only reports errors about the part being picked", () => {
    const build = { cpu: cpu({ socket: "AM5" }) };
    expect(problemsIfChosen(build, "motherboard", board({ socket: "LGA1700" }))).toHaveLength(1);
    expect(problemsIfChosen(build, "motherboard", board({ socket: "AM5" }))).toHaveLength(0);
  });
});
