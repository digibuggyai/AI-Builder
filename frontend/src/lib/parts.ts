import type { Category, PartByCategory } from "@pcb/shared";

export const CATEGORY_META: Record<
  Category,
  { label: string; short: string; noun: string; hint: string; required: boolean }
> = {
  cpu: { label: "Processor", short: "CPU", noun: "processor", hint: "Start here. It decides which motherboards fit.", required: true },
  motherboard: { label: "Motherboard", short: "Motherboard", noun: "motherboard", hint: "Has to match the CPU socket and the memory type.", required: true },
  ram: { label: "Memory", short: "RAM", noun: "memory kit", hint: "16 GB is fine for most games. 32 GB if you edit video.", required: true },
  gpu: { label: "Graphics card", short: "GPU", noun: "graphics card", hint: "Matters most for games. Long cards need a big case.", required: true },
  storage: { label: "Storage", short: "Storage", noun: "drive", hint: "An NVMe SSD makes Windows and games load quickly.", required: true },
  psu: { label: "Power supply", short: "PSU", noun: "power supply", hint: "Aim for about 30% more than the build draws.", required: true },
  cooler: { label: "CPU cooler", short: "Cooler", noun: "cooler", hint: "Rated for at least your CPU's wattage.", required: true },
  case: { label: "Case", short: "Case", noun: "case", hint: "Check its GPU length and cooler height limits.", required: true },
  monitor: { label: "Monitor", short: "Monitor", noun: "monitor", hint: "Skip it if you already have one.", required: false },
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatINR = (rupees: number | null) => (rupees == null ? "Price soon" : inr.format(rupees));

const size = (gb: number) => (gb >= 1000 ? `${gb / 1000} TB` : `${gb} GB`);
const resolutionName: Record<string, string> = {
  "1920x1080": "Full HD",
  "2560x1440": "QHD",
  "3840x2160": "4K",
  "3440x1440": "Ultrawide QHD",
};
const compact = (items: (string | null | false)[]) => items.filter((x): x is string => Boolean(x));

const chipMakers: { [K in Category]: (p: PartByCategory[K]) => string[] } = {
  cpu: (p) => compact([
    p.socket,
    `${p.cores} cores`,
    p.boostClockGhz && `up to ${Number(p.boostClockGhz)} GHz`,
    `${p.tdpW} W`,
    p.memoryTypes.join(" / "),
    !p.hasIntegratedGraphics && "No built-in graphics",
  ]),
  motherboard: (p) => compact([p.socket, p.chipset, p.formFactor, p.memoryType, `${p.m2Slots}× M.2`, p.hasWifi && "Wi-Fi"]),
  ram: (p) => compact([
    `${p.capacityGb} GB (${p.modules}×${p.capacityGb / p.modules} GB)`,
    p.memoryType,
    `${p.speedMts} MT/s`,
    p.casLatency != null && `CL${p.casLatency}`,
    p.rgb && "RGB",
  ]),
  gpu: (p) => compact([p.chipset, `${p.vramGb} GB`, `${p.lengthMm} mm long`, `${p.tdpW} W`]),
  storage: (p) => compact([p.type, size(p.capacityGb), p.readMbps != null && `${p.readMbps.toLocaleString("en-IN")} MB/s`]),
  psu: (p) => compact([`${p.wattage} W`, p.efficiency, `${p.modular === "Non" ? "Non" : p.modular}-modular`, p.formFactor]),
  cooler: (p) => compact([
    p.type === "Air" ? "Air" : `${p.radiatorMm} mm liquid`,
    `${p.tdpRatingW} W rated`,
    p.heightMm != null && `${p.heightMm} mm tall`,
  ]),
  case: (p) => compact([
    p.motherboardSupport.join(" / "),
    `GPU up to ${p.maxGpuLengthMm} mm`,
    `Cooler up to ${p.maxCoolerHeightMm} mm`,
    p.color,
  ]),
  monitor: (p) => compact([
    `${Number(p.sizeInch)}″`,
    resolutionName[`${p.widthPx}x${p.heightPx}`] ?? `${p.widthPx}×${p.heightPx}`,
    `${p.refreshHz} Hz`,
    p.panel,
  ]),
};

export function specChips<C extends Category>(category: C, part: PartByCategory[C]): string[] {
  const make = chipMakers[category] as (p: PartByCategory[C]) => string[];
  return make(part);
}
