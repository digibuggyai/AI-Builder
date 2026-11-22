import { describe, expect, it } from "vitest";
import { recommendBuild, suggestParts } from "./recommend";
import { cpuScore, gpuScore } from "./scores";
import type { Case, Catalog, Cooler, Cpu, Gpu, Motherboard, PartBase, Psu, Ram, Storage } from "./types";

let nextId = 1;
const base = (slug: string, priceRupees: number): PartBase => ({
  id: nextId++,
  slug,
  brand: "Test",
  name: slug,
  priceRupees,
  inStock: true,
  buyUrl: null, imageUrl: null,
});

const cpu = (slug: string, price: number, o: Partial<Cpu>): Cpu => ({
  ...base(slug, price),
  brand: "AMD",
  socket: "AM5",
  cores: 6,
  threads: 12,
  baseClockGhz: "3.8",
  boostClockGhz: "5.1",
  tdpW: 65,
  memoryTypes: ["DDR5"],
  maxMemorySpeedMts: 5200,
  hasIntegratedGraphics: true,
  pcieVersion: 5,
  ...o,
});

const board = (slug: string, price: number, o: Partial<Motherboard>): Motherboard => ({
  ...base(slug, price),
  socket: "AM5",
  chipset: "B650",
  formFactor: "Micro-ATX",
  memoryType: "DDR5",
  ramSlots: 4,
  maxRamGb: 192,
  maxRamSpeedMts: 7200,
  m2Slots: 2,
  sataPorts: 4,
  pcieVersion: 4,
  hasWifi: true,
  ...o,
});

const ram = (slug: string, price: number, o: Partial<Ram>): Ram => ({
  ...base(slug, price),
  memoryType: "DDR5",
  modules: 2,
  capacityGb: 32,
  speedMts: 6000,
  casLatency: 30,
  heightMm: 33,
  rgb: false,
  ...o,
});

const gpu = (slug: string, price: number, o: Partial<Gpu>): Gpu => ({
  ...base(slug, price),
  chipMaker: "NVIDIA",
  chipset: "RTX 4060",
  vramGb: 8,
  lengthMm: 199,
  slotWidth: "2.0",
  tdpW: 115,
  recommendedPsuW: 550,
  powerConnectors: "1x 8-pin",
  pcieVersion: 4,
  ...o,
});

const drive = (slug: string, price: number, o: Partial<Storage>): Storage => ({
  ...base(slug, price),
  type: "NVMe",
  capacityGb: 1000,
  pcieVersion: 4,
  readMbps: 5000,
  writeMbps: 4000,
  ...o,
});

const psu = (slug: string, price: number, o: Partial<Psu>): Psu => ({
  ...base(slug, price),
  wattage: 550,
  efficiency: "80+ Bronze",
  modular: "Non",
  formFactor: "ATX",
  has12v2x6: false,
  ...o,
});

const cooler = (slug: string, price: number, o: Partial<Cooler>): Cooler => ({
  ...base(slug, price),
  type: "Air",
  sockets: ["AM5", "LGA1700"],
  tdpRatingW: 220,
  heightMm: 155,
  radiatorMm: null,
  ...o,
});

const pcCase = (slug: string, price: number, o: Partial<Case>): Case => ({
  ...base(slug, price),
  motherboardSupport: ["ATX", "Micro-ATX", "Mini-ITX"],
  psuSupport: ["ATX"],
  maxGpuLengthMm: 360,
  maxCoolerHeightMm: 170,
  radiatorSupportMm: [240, 360],
  drives25: 2,
  drives35: 2,
  color: "Black",
  ...o,
});

const shop: Catalog = {
  cpu: [
    cpu("ryzen-5-7600", 18000, { name: "Ryzen 5 7600" }),
    cpu("ryzen-7-7800x3d", 36000, { name: "Ryzen 7 7800X3D", cores: 8, threads: 16, boostClockGhz: "5.0", tdpW: 120 }),
    cpu("core-i5-12400f", 10500, {
      name: "Core i5-12400F",
      brand: "Intel",
      socket: "LGA1700",
      boostClockGhz: "4.4",
      memoryTypes: ["DDR4", "DDR5"],
      hasIntegratedGraphics: false,
    }),
  ],
  motherboard: [
    board("b650m", 15000, {}),
    board("h610m-ddr4", 6500, { socket: "LGA1700", chipset: "H610", memoryType: "DDR4", ramSlots: 2, maxRamGb: 64, m2Slots: 1 }),
  ],
  ram: [
    ram("ddr5-32gb", 10000, {}),
    ram("ddr5-16gb", 5500, { capacityGb: 16 }),
    ram("ddr4-16gb", 4000, { memoryType: "DDR4", capacityGb: 16 }),
  ],
  gpu: [
    gpu("rtx-4060", 28000, {}),
    gpu("rtx-5070-ti", 85000, { chipset: "RTX 5070 Ti", vramGb: 16, lengthMm: 304, tdpW: 300, recommendedPsuW: 750 }),
  ],
  storage: [drive("nvme-1tb", 5500, {}), drive("nvme-500gb", 3200, { capacityGb: 500 })],
  psu: [psu("psu-550", 3800, {}), psu("psu-850", 10500, { wattage: 850, efficiency: "80+ Gold", modular: "Full" })],
  cooler: [
    cooler("tower-cooler", 3000, {}),
    cooler("low-profile", 5000, { tdpRatingW: 65, heightMm: 37, sockets: ["AM5"] }),
  ],
  case: [pcCase("atx-case", 8000, {}), pcCase("itx-case", 8500, { motherboardSupport: ["Mini-ITX"] })],
  monitor: [],
};

describe("scores", () => {
  it("knows common graphics chips, including Ti and Super models", () => {
    expect(gpuScore({ chipset: "RTX 5070 Ti", name: "" })).toBe(82);
    expect(gpuScore({ chipset: "GeForce RTX 5070", name: "" })).toBe(67);
    expect(gpuScore({ chipset: "Radeon RX 9070 XT", name: "" })).toBe(86);
    expect(gpuScore({ chipset: "Mystery GPU", name: "" })).toBeNull();
  });

  it("rates X3D processors higher for gaming", () => {
    const x3d = shop.cpu[1]!;
    expect(cpuScore(x3d, true)).toBeGreaterThan(cpuScore({ ...x3d, name: "Ryzen 7 7700X" }, true));
  });
});

describe("recommendBuild", () => {
  it("picks the best GPU and CPU that fit a 1080p gaming budget", () => {
    const result = recommendBuild(shop, "gaming-1080p", 110000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.build.gpu?.slug).toBe("rtx-4060");
    expect(result.build.cpu?.slug).toBe("ryzen-7-7800x3d");
    expect(result.totalRupees).toBeLessThanOrEqual(110000);
    expect(result.issues.filter((i) => i.level === "error")).toEqual([]);
  });

  it("uses a 16 GB card and a big enough power supply for 1440p", () => {
    const result = recommendBuild(shop, "gaming-1440p", 250000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.build.gpu?.slug).toBe("rtx-5070-ti");
    expect(result.build.psu?.slug).toBe("psu-850");
    expect(result.build.ram?.capacityGb).toBeGreaterThanOrEqual(32);
  });

  it("skips the graphics card for office PCs when the CPU has graphics built in", () => {
    const result = recommendBuild(shop, "office", 60000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.build.gpu).toBeUndefined();
    expect(result.build.cpu?.hasIntegratedGraphics).toBe(true);
  });

  it("explains when the budget is too low", () => {
    const result = recommendBuild(shop, "gaming-1080p", 20000);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.cheapestRupees).toBeGreaterThan(20000);
  });
});

describe("suggestParts", () => {
  it("recommends a motherboard that matches the chosen CPU", () => {
    const result = suggestParts(shop, { cpu: shop.cpu[0] }, "motherboard", "gaming-1080p", 110000);
    expect(result.recommendedSlug).toBe("b650m");
    const intelBoard = result.options.find((o) => o.slug === "h610m-ddr4");
    expect(intelBoard?.fits).toBe(false);
    expect(intelBoard?.problems.length).toBeGreaterThan(0);
  });

  it("recommends the fastest GPU inside the budget share", () => {
    const result = suggestParts(shop, {}, "gpu", "gaming-1080p", 110000);
    expect(result.recommendedSlug).toBe("rtx-4060");
  });
});
