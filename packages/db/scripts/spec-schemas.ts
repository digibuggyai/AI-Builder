import { z } from "zod";
import type { SheetCategory } from "./sheet";

const n = z.number().nullable();
const int = z.number().int().nullable();
const socket = z.enum(["AM4", "AM5", "LGA1700", "LGA1851", "OTHER"]);
const memory = z.enum(["DDR4", "DDR5"]);
const formFactor = z.enum(["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"]);

const common = {
  brand: z.string().describe("Brand name, e.g. 'MSI', 'AMD', 'Corsair'"),
  name: z.string().describe("Clean product name without the category word, e.g. 'MSI MAG B650 Tomahawk WiFi'"),
  priceRupees: n.describe("Selling price on the page in rupees, null if not shown"),
  inStock: z.boolean().nullable().describe("true if the page says in stock / available"),
};

export const extractSchemas = {
  cpu: z.object({
    ...common,
    socket,
    cores: int,
    threads: int,
    baseClockGhz: n,
    boostClockGhz: n,
    tdpW: int.describe("Base power / TDP in watts"),
    memoryTypes: z.array(memory).describe("Every memory type the CPU supports"),
    maxMemorySpeedMts: int.describe("Highest officially supported memory speed in MT/s"),
    hasIntegratedGraphics: z.boolean().nullable(),
    pcieVersion: int,
  }),
  gpu: z.object({
    ...common,
    chipMaker: z.enum(["NVIDIA", "AMD", "Intel"]),
    chipset: z.string().describe("GPU model, e.g. 'RTX 5060 Ti', 'RX 9070 XT'"),
    vramGb: int,
    lengthMm: int.describe("Card length in mm"),
    slotWidth: n,
    tdpW: int.describe("Board / total graphics power in watts"),
    recommendedPsuW: int,
    powerConnectors: z.string().nullable().describe("e.g. '1x 8-pin', '1x 12V-2x6'"),
    pcieVersion: int,
  }),
  motherboard: z.object({
    ...common,
    socket,
    chipset: z.string().nullable(),
    formFactor: formFactor.nullable(),
    memoryType: memory.nullable(),
    ramSlots: int,
    maxRamGb: int,
    maxRamSpeedMts: int,
    m2Slots: int,
    sataPorts: int,
    pcieVersion: int.describe("PCIe version of the main x16 graphics slot"),
    hasWifi: z.boolean().nullable(),
  }),
  ram: z.object({
    ...common,
    memoryType: memory.nullable(),
    modules: int.describe("Number of sticks in the kit"),
    capacityGb: int.describe("TOTAL kit capacity in GB"),
    speedMts: int,
    casLatency: int,
    heightMm: int,
    rgb: z.boolean().nullable(),
  }),
  storage: z.object({
    ...common,
    type: z.enum(["NVMe", "SATA SSD", "HDD"]).nullable(),
    capacityGb: int.describe("Capacity in GB (1 TB = 1000)"),
    pcieVersion: int.describe("Only for NVMe drives"),
    readMbps: int,
    writeMbps: int,
  }),
  psu: z.object({
    ...common,
    wattage: int,
    efficiency: z.enum(["80+ White", "80+ Bronze", "80+ Gold", "80+ Platinum", "80+ Titanium"]).nullable(),
    modular: z.enum(["Full", "Semi", "Non"]).nullable(),
    formFactor: z.enum(["ATX", "SFX"]).nullable(),
    has12v2x6: z.boolean().nullable().describe("Has a 12V-2x6 / 12VHPWR / 16-pin GPU cable"),
  }),
  cooler: z.object({
    ...common,
    type: z.enum(["Air", "Liquid"]).nullable(),
    sockets: z.array(socket).describe("Supported CPU sockets"),
    tdpRatingW: int.describe("Rated cooling capacity in watts"),
    heightMm: int.describe("Air coolers only: height in mm"),
    radiatorMm: int.describe("Liquid coolers only: radiator size, e.g. 240 or 360"),
  }),
  case: z.object({
    ...common,
    motherboardSupport: z.array(formFactor),
    psuSupport: z.array(z.enum(["ATX", "SFX"])),
    maxGpuLengthMm: int,
    maxCoolerHeightMm: int,
    radiatorSupportMm: z.array(z.number().int()).describe("Every radiator size that fits, e.g. [240, 280, 360]"),
    drives25: int,
    drives35: int,
    color: z.string().nullable(),
  }),
} satisfies Record<SheetCategory, z.ZodType>;

export type Extracted = { [K in SheetCategory]: z.infer<(typeof extractSchemas)[K]> };
