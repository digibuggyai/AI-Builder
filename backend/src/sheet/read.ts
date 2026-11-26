import ExcelJS from "exceljs";

export type ProductCategory =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "cooler"
  | "case"
  | "monitor"
  | "peripheral";

export type SheetProduct = {
  key: string;
  tab: string;
  category: ProductCategory;
  group: string | null;
  name: string;
  details: string | null;
  skuId: string | null;
  url: string | null;
  pricePaise: number | null;
  inStock: boolean;
  color: string | null;
  notes: string | null;
  updatedAt: Date | null;
};

type Kind = "standard" | "monitors" | "cabinets";

const TABS: { tab: string; category: ProductCategory; kind: Kind }[] = [
  { tab: "Processor", category: "cpu", kind: "standard" },
  { tab: "Graphics Card", category: "gpu", kind: "standard" },
  { tab: "Motherboard", category: "motherboard", kind: "standard" },
  { tab: "Ram", category: "ram", kind: "standard" },
  { tab: "Storage Devices", category: "storage", kind: "standard" },
  { tab: "Power Supply", category: "psu", kind: "standard" },
  { tab: "CPU Cooler", category: "cooler", kind: "standard" },
  { tab: "Cabinets", category: "case", kind: "cabinets" },
  { tab: "Monitors", category: "monitor", kind: "monitors" },
  { tab: "Peripherals", category: "peripheral", kind: "standard" },
];

type Shade = "green" | "blue" | "red" | "purple" | null;

function shadeOf(cell: ExcelJS.Cell): { shade: Shade; argb: string | null } {
  const fill = cell.fill;
  if (!fill || fill.type !== "pattern" || fill.pattern !== "solid") return { shade: null, argb: null };
  const argb = fill.fgColor?.argb ?? null;
  if (!argb || argb.length !== 8) return { shade: null, argb: null };
  const r = parseInt(argb.slice(2, 4), 16);
  const g = parseInt(argb.slice(4, 6), 16);
  const b = parseInt(argb.slice(6, 8), 16);
  if (r >= 0xf0 && g >= 0xf0 && b >= 0xf0) return { shade: null, argb };
  if (r > 100 && b > 200 && g < 60) return { shade: "purple", argb };
  if (r > 200 && g < 80 && b < 80) return { shade: "red", argb };
  if (g > r + 30 && g > b + 30) return { shade: "green", argb };
  if (b > r + 30 && b >= g) return { shade: "blue", argb };
  return { shade: null, argb };
}

function rowShade(row: ExcelJS.Row, cols: number[]) {
  for (const c of cols) {
    const s = shadeOf(row.getCell(c));
    if (s.shade) return s;
  }
  return { shade: null as Shade, argb: null };
}

function text(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((t) => t.text).join("").trim();
    if ("text" in v && typeof v.text === "string") return v.text.trim();
    if ("hyperlink" in v && typeof v.hyperlink === "string") return v.hyperlink.trim();
    if ("result" in v && v.result != null) return String(v.result).trim();
  }
  return String(cell.text ?? "").trim();
}

function paise(cell: ExcelJS.Cell): number | null {
  const v = cell.value;
  let n: number | null = null;
  if (typeof v === "number") n = v;
  else if (v && typeof v === "object" && "result" in v && typeof v.result === "number") n = v.result;
  else {
    const s = text(cell);
    if (/\d/.test(s) && !/[a-z]{3,}/i.test(s.replace(/rs\.?|inr/gi, ""))) n = Number(s.replace(/[^\d.]/g, ""));
  }
  return n != null && Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
}

function date(cell: ExcelJS.Cell): Date | null {
  const v = cell.value;
  if (v instanceof Date) return v;
  return null;
}

function url(cell: ExcelJS.Cell): string | null {
  const s = text(cell);
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    const u = new URL(s);
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

function nameFromUrl(u: string | null): string | null {
  if (!u) return null;
  try {
    const parts = new URL(u).pathname.split("/").filter(Boolean);
    const at = parts.indexOf("product");
    const slug = (at >= 0 ? parts.slice(at + 1) : parts).reduce<string | undefined>(
      (best, p) => (!best || p.length > best.length ? p : best),
      undefined,
    );
    if (!slug) return null;
    return slug
      .split("-")
      .filter((w) => w.length > 0)
      .map((w) => (/^\d/.test(w) || w.length <= 3 ? w.toUpperCase() : w[0]!.toUpperCase() + w.slice(1)))
      .join(" ");
  } catch {
    return null;
  }
}

function peripheralGroup(name: string, heading: string | null) {
  if (/combo/i.test(name)) return "Keyboard & Mouse Combo";
  if (/keyboard/i.test(name)) return "Keyboard";
  if (/mouse/i.test(name)) return "Mouse";
  if (/headset|headphone/i.test(name)) return "Headset";
  if (/webcam|camera/i.test(name)) return "Webcam";
  if (/speaker/i.test(name)) return "Speakers";
  if (/windows|office/i.test(name)) return "Software";
  return heading;
}

const MONITOR_GROUPS: [RegExp, string][] = [
  [/programmer/i, "Programming"],
  [/premium/i, "Premium"],
  [/mobiuz/i, "Gaming (MOBIUZ)"],
  [/zowie|esports/i, "Esports (ZOWIE)"],
  [/mac/i, "Mac users"],
  [/designvue|graphic/i, "Graphic design"],
  [/photovue|photograph/i, "Photography"],
  [/mainstream/i, "Mainstream"],
];

function monitorGroup(raw: string) {
  return MONITOR_GROUPS.find(([re]) => re.test(raw))?.[1] ?? raw.replace(/\s+/g, " ").trim();
}

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

class Keys {
  private seen = new Map<string, number>();
  make(base: string) {
    const n = (this.seen.get(base) ?? 0) + 1;
    this.seen.set(base, n);
    return n === 1 ? base : `${base}#${n}`;
  }
}

function readStandard(ws: ExcelJS.Worksheet, tab: string, category: ProductCategory): SheetProduct[] {
  const out: SheetProduct[] = [];
  const keys = new Keys();
  let group: string | null = null;
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    if (n === 1) return;
    const sku = text(row.getCell(1));
    const unique = text(row.getCell(2));
    const link = url(row.getCell(3));
    const shade = rowShade(row, [4, 1, 2, 3]);

    if (category === "peripheral" && shade.shade === "red") {
      if (sku && !link && !/^url$/i.test(text(row.getCell(3)))) group = titleCase(sku);
      return;
    }

    const name = text(row.getCell(4)) || text(row.getCell(8)) || nameFromUrl(link);
    if (!name || (!link && !sku && !unique && !text(row.getCell(4)))) return;

    out.push({
      key: keys.make(`${tab}:${unique || sku || link || name}`.toLowerCase()),
      tab,
      category,
      group: category === "peripheral" ? peripheralGroup(name, group) : null,
      name,
      details: null,
      skuId: sku || unique || null,
      url: link,
      pricePaise: paise(row.getCell(7)),
      inStock: shade.shade === "green" || shade.shade === "blue",
      color: shade.argb,
      notes: text(row.getCell(9)) || null,
      updatedAt: date(row.getCell(10)),
    });
  });
  return out;
}

function msiGroup(model: string) {
  if (/^MAG/i.test(model)) return "MSI Gaming";
  if (/^MODERN/i.test(model)) return "MSI Modern";
  return "MSI Pro";
}

function readMonitors(ws: ExcelJS.Worksheet, tab: string): SheetProduct[] {
  const out: SheetProduct[] = [];
  const keys = new Keys();
  let group = "Mainstream";
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    if (n === 1) return;
    const model = text(row.getCell(1)).replace(/\s+/g, " ").trim();
    const cells = [1, 2, 3, 4, 5, 6].map((c) => text(row.getCell(c))).filter(Boolean);
    const shade = rowShade(row, [1, 2]);

    if (shade.shade === "purple" || (!model && cells.length > 0)) {
      if (cells[0] && !/^msi/i.test(cells[0])) group = monitorGroup(cells[0]);
      return;
    }
    if (!model || /^model$/i.test(model)) return;

    const brandCell = text(row.getCell(4));
    const brand = /msi/i.test(brandCell) ? "MSI" : /benq/i.test(brandCell) ? "BenQ" : brandCell.replace(/monitors?/i, "").trim();
    out.push({
      key: keys.make(`${tab}:${model}`.toLowerCase()),
      tab,
      category: "monitor",
      group: brand === "MSI" ? msiGroup(model) : group,
      name: `${brand} ${model}`.trim(),
      details: text(row.getCell(2)).replace(/\s+/g, " ") || null,
      skuId: model,
      url: null,
      pricePaise: paise(row.getCell(6)),
      inStock: true,
      color: shade.argb,
      notes: null,
      updatedAt: null,
    });
  });
  return out;
}

function readCabinets(ws: ExcelJS.Worksheet, tab: string): SheetProduct[] {
  const out: SheetProduct[] = [];
  const keys = new Keys();
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    if (n === 1) return;
    const unique = text(row.getCell(1));
    const name = text(row.getCell(2));
    const link = url(row.getCell(3));
    if (!name) return;
    const shade = rowShade(row, [2, 1]);
    out.push({
      key: keys.make(`${tab}:${unique || name}`.toLowerCase()),
      tab,
      category: "case",
      group: null,
      name,
      details: null,
      skuId: unique || null,
      url: link,
      pricePaise: null,
      inStock: shade.shade === "green" || shade.shade === "blue",
      color: shade.argb,
      notes: null,
      updatedAt: null,
    });
  });
  return out;
}

export async function downloadSheet(sheetId: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`, {
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`Sheet download failed: HTTP ${res.status}`);
  return res.arrayBuffer();
}

export async function readSheet(data: ArrayBuffer): Promise<{ products: SheetProduct[]; missingTabs: string[] }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(data);
  const products: SheetProduct[] = [];
  const missingTabs: string[] = [];
  for (const t of TABS) {
    const ws = wb.getWorksheet(t.tab);
    if (!ws) {
      missingTabs.push(t.tab);
      continue;
    }
    if (t.kind === "monitors") products.push(...readMonitors(ws, t.tab));
    else if (t.kind === "cabinets") products.push(...readCabinets(ws, t.tab));
    else products.push(...readStandard(ws, t.tab, t.category));
  }
  return { products, missingTabs };
}
