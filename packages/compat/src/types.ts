export type MemoryType = "DDR4" | "DDR5";
export type FormFactor = "E-ATX" | "ATX" | "Micro-ATX" | "Mini-ITX";
export type PsuFormFactor = "ATX" | "SFX";

export type PartBase = {
  id: number;
  slug: string;
  brand: string;
  name: string;
  priceRupees: number | null;
  inStock: boolean;
};

export type Cpu = PartBase & {
  brand: "Intel" | "AMD";
  socket: string;
  cores: number;
  threads: number;
  baseClockGhz: string | null;
  boostClockGhz: string | null;
  tdpW: number;
  memoryTypes: MemoryType[];
  maxMemorySpeedMts: number | null;
  hasIntegratedGraphics: boolean;
  pcieVersion: number;
};

export type Gpu = PartBase & {
  chipMaker: "NVIDIA" | "AMD" | "Intel";
  chipset: string;
  vramGb: number;
  lengthMm: number;
  slotWidth: string | null;
  tdpW: number;
  recommendedPsuW: number;
  powerConnectors: string | null;
  pcieVersion: number;
};

export type Motherboard = PartBase & {
  socket: string;
  chipset: string;
  formFactor: FormFactor;
  memoryType: MemoryType;
  ramSlots: number;
  maxRamGb: number;
  maxRamSpeedMts: number | null;
  m2Slots: number;
  sataPorts: number;
  pcieVersion: number;
  hasWifi: boolean;
};

export type Ram = PartBase & {
  memoryType: MemoryType;
  modules: number;
  capacityGb: number;
  speedMts: number;
  casLatency: number | null;
  heightMm: number | null;
  rgb: boolean;
};

export type Storage = PartBase & {
  type: "NVMe" | "SATA SSD" | "HDD";
  capacityGb: number;
  pcieVersion: number | null;
  readMbps: number | null;
  writeMbps: number | null;
};

export type Psu = PartBase & {
  wattage: number;
  efficiency: string;
  modular: "Full" | "Semi" | "Non";
  formFactor: PsuFormFactor;
  has12v2x6: boolean;
};

export type Cooler = PartBase & {
  type: "Air" | "Liquid";
  sockets: string[];
  tdpRatingW: number;
  heightMm: number | null;
  radiatorMm: number | null;
};

export type Case = PartBase & {
  motherboardSupport: FormFactor[];
  psuSupport: PsuFormFactor[];
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  radiatorSupportMm: number[];
  drives25: number;
  drives35: number;
  color: string | null;
};

export type Monitor = PartBase & {
  sizeInch: string;
  widthPx: number;
  heightPx: number;
  refreshHz: number;
  panel: "IPS" | "VA" | "TN" | "OLED";
  responseMs: string | null;
};

export const CATEGORIES = [
  "cpu",
  "motherboard",
  "ram",
  "gpu",
  "storage",
  "psu",
  "cooler",
  "case",
  "monitor",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type PartByCategory = {
  cpu: Cpu;
  motherboard: Motherboard;
  ram: Ram;
  gpu: Gpu;
  storage: Storage;
  psu: Psu;
  cooler: Cooler;
  case: Case;
  monitor: Monitor;
};

export type Catalog = { [K in Category]: PartByCategory[K][] };

export type Build = { [K in Category]?: PartByCategory[K] };

export type Issue = {
  level: "error" | "warning";
  code: string;
  parts: Category[];
  message: string;
};
