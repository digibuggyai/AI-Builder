import { parse } from "csv-parse/sync";

export type SheetCategory = "cpu" | "gpu" | "motherboard" | "ram" | "storage" | "psu" | "cooler" | "case";

export type SheetRow = {
  category: SheetCategory;
  mpn: string | null;
  name: string;
  url: string;
  priceRupees: number | null;
  inStock: boolean;
  status: string;
  updatedAt: Date | null;
};

const TABS: { category: SheetCategory; gid: string }[] = [
  { category: "cpu", gid: "774529943" },
  { category: "gpu", gid: "1923511389" },
  { category: "motherboard", gid: "1731332850" },
  { category: "ram", gid: "0" },
  { category: "storage", gid: "393207274" },
  { category: "psu", gid: "171605242" },
  { category: "cooler", gid: "1643506838" },
  { category: "case", gid: "1214606391" },
];

export function cleanUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    u.search = "";
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function parsePrice(raw: string | undefined): number | null {
  if (!raw || !/\d/.test(raw)) return null;
  const n = Number(raw.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

function parseSheetDate(raw: string | undefined): Date | null {
  const m = raw?.match(/^(\d{1,2})-(\w{3})-(\d{4}) (\d{2}:\d{2}:\d{2})$/);
  if (!m) return null;
  const [, day, mon, year, time] = m;
  const month = MONTHS[mon!];
  if (!month) return null;
  return new Date(`${year}-${month}-${day!.padStart(2, "0")}T${time}+05:30`);
}

async function fetchTab(sheetId: string, gid: string): Promise<Record<string, string>[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`Sheet tab ${gid}: HTTP ${res.status}. Is the sheet shared with this account?`);
  return parse(await res.text(), {
    columns: (header: string[]) => header.map((h) => h.trim()),
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
}

export async function loadSheet(sheetId: string): Promise<SheetRow[]> {
  const rows: SheetRow[] = [];
  for (const { category, gid } of TABS) {
    for (const r of await fetchTab(sheetId, gid)) {
      const url = cleanUrl(r["URL"] ?? r["MD LINK"] ?? "");
      const name = (r["Product Name"] || r["NAME"] || "").trim();
      if (!url || !name) continue;

      const priceRupees = parsePrice(r["Price Now"]);
      const status = (r["Notes"] ?? "").split("|")[0]!.trim() || "UNKNOWN";
      rows.push({
        category,
        mpn: (r["Unique ID"] ?? "").trim() || null,
        name,
        url,
        priceRupees,
        inStock: priceRupees != null && status.startsWith("OK"),
        status,
        updatedAt: parseSheetDate(r["Last Updated"]),
      });
    }
  }
  return rows;
}
