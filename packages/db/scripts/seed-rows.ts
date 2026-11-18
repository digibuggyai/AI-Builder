// The rules each CSV row must follow before it may enter the database.
import { z } from "zod";

// ---------- Helpers: turn CSV text into the right types ----------
// Every CSV value arrives as text, e.g. "65", "true", "DDR4|DDR5".

const int = z.coerce.number().int().positive();          // "65" → 65
const optionalInt = z.preprocess(                         // "" → null
  (v) => (v === "" ? null : v),
  z.coerce.number().int().positive().nullable(),
);
const decimal = z.string().regex(/^\d+(\.\d+)?$/, "must be a number like 4.4");
const optionalDecimal = z.preprocess((v) => (v === "" ? null : v), decimal.nullable());
const optionalText = z.preprocess((v) => (v === "" ? null : v), z.string().nullable());
// Careful: z.coerce.boolean() turns "false" into true! So we check the text ourselves.
const bool = z.enum(["true", "false"]).transform((v) => v === "true");
const list = z.string().transform((s) => s.split("|").map((x) => x.trim())); // "A|B" → ["A","B"]

// ---------- Allowed values (must match the database enums) ----------
const socket = z.enum(["AM4", "AM5", "LGA1700", "LGA1851"]); // a typo like "LGA 1700" fails here
const memory = z.enum(["DDR4", "DDR5"]);
const formFactor = z.enum(["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"]);
const psuForm = z.enum(["ATX", "SFX"]);
const pcie = z.coerce.number().int().min(3).max(5);

// Columns every part has
const base = {
  slug: z.string().regex(/^[a-z0-9-]+$/, "use lowercase letters, numbers and dashes"),
  brand: z.string().min(1),
  name: z.string().min(1),
};

// ---------- One schema per CSV file ----------

export const cpuRow = z.object({
  ...base,
  brand: z.enum(["Intel", "AMD"]),
  socket,
  cores: int,
  threads: int,
  baseClockGhz: decimal,
  boostClockGhz: decimal,
  tdpW: int,
  memoryTypes: list.pipe(z.array(memory).min(1)),
  maxMemorySpeedMts: optionalInt,
  hasIntegratedGraphics: bool,
  pcieVersion: pcie,
});

export const gpuRow = z.object({
  ...base,
  chipMaker: z.enum(["NVIDIA", "AMD", "Intel"]),
  chipset: z.string().min(1),
  vramGb: int,
  lengthMm: int,
  slotWidth: optionalDecimal,
  tdpW: int,
  recommendedPsuW: int,
  powerConnectors: optionalText,
  pcieVersion: pcie,
});

export const motherboardRow = z.object({
  ...base,
  socket,
  chipset: z.string().min(1),
  formFactor,
  memoryType: memory,
  ramSlots: int,
  maxRamGb: int,
  maxRamSpeedMts: optionalInt,
  m2Slots: z.coerce.number().int().min(0),
  sataPorts: z.coerce.number().int().min(0),
  pcieVersion: pcie,
  hasWifi: bool,
});

export const ramRow = z.object({
  ...base,
  memoryType: memory,
  modules: int,
  capacityGb: int,
  speedMts: int,
  casLatency: optionalInt,
  heightMm: optionalInt,
  rgb: bool,
});

export const storageRow = z.object({
  ...base,
  type: z.enum(["NVMe", "SATA SSD", "HDD"]),
  capacityGb: int,
  pcieVersion: z.preprocess((v) => (v === "" ? null : v), pcie.nullable()),
  readMbps: optionalInt,
  writeMbps: optionalInt,
});

export const psuRow = z.object({
  ...base,
  wattage: int,
  efficiency: z.enum(["80+ White", "80+ Bronze", "80+ Gold", "80+ Platinum", "80+ Titanium"]),
  modular: z.enum(["Full", "Semi", "Non"]),
  formFactor: psuForm,
  has12v2x6: bool,
});

export const coolerRow = z.object({
  ...base,
  type: z.enum(["Air", "Liquid"]),
  sockets: list.pipe(z.array(socket).min(1)),
  tdpRatingW: int,
  heightMm: optionalInt,
  radiatorMm: optionalInt,
});

export const caseRow = z.object({
  ...base,
  motherboardSupport: list.pipe(z.array(formFactor).min(1)),
  psuSupport: list.pipe(z.array(psuForm).min(1)),
  maxGpuLengthMm: int,
  maxCoolerHeightMm: int,
  radiatorSupportMm: list.pipe(z.array(z.string().regex(/^\d+$/, "must be a whole number").transform(Number))),
  drives25: z.coerce.number().int().min(0),
  drives35: z.coerce.number().int().min(0),
  color: optionalText,
});

export const monitorRow = z.object({
  ...base,
  sizeInch: decimal,
  widthPx: int,
  heightPx: int,
  refreshHz: int,
  panel: z.enum(["IPS", "VA", "TN", "OLED"]),
  responseMs: optionalDecimal,
});
