import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import type { z } from "zod";
import { loadSheet, type SheetCategory, type SheetRow } from "./sheet";
import { extractSchemas } from "./spec-schemas";
import { caseRow, coolerRow, cpuRow, gpuRow, motherboardRow, psuRow, ramRow, storageRow } from "./seed-rows";

config({ path: "../../.env", quiet: true });

const MODEL = "claude-opus-5-5";
const CONCURRENCY = 3;
const MAX_PAGE_CHARS = 20_000;

const CATEGORIES: Record<SheetCategory, { file: string; columns: string[]; rule: z.ZodType }> = {
  cpu: { file: "cpus", rule: cpuRow, columns: ["socket", "cores", "threads", "baseClockGhz", "boostClockGhz", "tdpW", "memoryTypes", "maxMemorySpeedMts", "hasIntegratedGraphics", "pcieVersion"] },
  gpu: { file: "gpus", rule: gpuRow, columns: ["chipMaker", "chipset", "vramGb", "lengthMm", "slotWidth", "tdpW", "recommendedPsuW", "powerConnectors", "pcieVersion"] },
  motherboard: { file: "motherboards", rule: motherboardRow, columns: ["socket", "chipset", "formFactor", "memoryType", "ramSlots", "maxRamGb", "maxRamSpeedMts", "m2Slots", "sataPorts", "pcieVersion", "hasWifi"] },
  ram: { file: "ram", rule: ramRow, columns: ["memoryType", "modules", "capacityGb", "speedMts", "casLatency", "heightMm", "rgb"] },
  storage: { file: "storage", rule: storageRow, columns: ["type", "capacityGb", "pcieVersion", "readMbps", "writeMbps"] },
  psu: { file: "psus", rule: psuRow, columns: ["wattage", "efficiency", "modular", "formFactor", "has12v2x6"] },
  cooler: { file: "coolers", rule: coolerRow, columns: ["type", "sockets", "tdpRatingW", "heightMm", "radiatorMm"] },
  case: { file: "cases", rule: caseRow, columns: ["motherboardSupport", "psuSupport", "maxGpuLengthMm", "maxCoolerHeightMm", "radiatorSupportMm", "drives25", "drives35", "color"] },
};
const BASE_COLUMNS = ["slug", "brand", "name"];
const END_COLUMNS = ["url", "priceRupees"];

const FALSE_IF_MISSING = new Set(["hasWifi", "rgb", "has12v2x6"]);

const SYSTEM = `You extract PC part specifications from an Indian computer shop's product page.
Rules:
- Use ONLY facts written on the page. Never use outside knowledge, never estimate.
- If a value is not on the page, return null (or an empty list).
- Convert units: TB to GB (1 TB = 1000 GB), "MHz" memory speed to MT/s (same number).
- Socket "LGA 1700" is "LGA1700"; a socket not in the list is "OTHER".
- RAM capacity is the TOTAL of the kit (2 x 16 GB = 32).`;

const csvPath = (file: string) => `data/${file}.csv`;
const reviewPath = (file: string) => `data/review/${file}.csv`;

const csvValue = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const csvLine = (values: string[]) => values.map(csvValue).join(",") + "\n";

function readCsv(path: string): Record<string, string>[] {
  if (!existsSync(path)) return [];
  return parse(readFileSync(path, "utf8"), { columns: true, skip_empty_lines: true });
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function pageText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d|td|th)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8377;|&#x20b9;/gi, "₹")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function toCsvText(key: string, value: unknown): string {
  if (value == null) return FALSE_IF_MISSING.has(key) ? "false" : "";
  if (Array.isArray(value)) return value.join("|");
  return String(value);
}

type Result = { ok: true; record: Record<string, string> } | { ok: false; reason: string; data?: unknown };

async function extractOne(client: Anthropic, row: SheetRow, takenSlugs: Set<string>): Promise<Result> {
  const page = await fetch(row.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AIPCBuilder spec reader)" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!page.ok) return { ok: false, reason: `product page answered HTTP ${page.status}` };

  let text = pageText(await page.text());
  if (text.length > MAX_PAGE_CHARS) {
    console.warn(`   ⚠ page text is ${text.length} chars, using the first ${MAX_PAGE_CHARS}: ${row.url}`);
    text = text.slice(0, MAX_PAGE_CHARS);
  }

  const schema = extractSchemas[row.category];
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: zodOutputFormat(schema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Part type: ${row.category}\nName in our sheet: ${row.name}\n\n<page>\n${text}\n</page>`,
      },
    ],
  });

  if (response.stop_reason === "refusal") return { ok: false, reason: "model declined" };
  if (response.stop_reason === "max_tokens") return { ok: false, reason: "answer was cut off" };
  const answer = response.content.find((b) => b.type === "text");
  if (!answer || answer.type !== "text") return { ok: false, reason: "no answer" };

  const parsed = schema.safeParse(JSON.parse(answer.text));
  if (!parsed.success) return { ok: false, reason: "answer did not match the schema", data: answer.text };
  const data = parsed.data as Record<string, unknown>;

  let slug = slugify(String(data.name || row.name));
  if (takenSlugs.has(slug)) slug = slugify(`${slug}-${row.mpn ?? takenSlugs.size}`);
  const cfg = CATEGORIES[row.category];
  const record: Record<string, string> = { slug, brand: String(data.brand ?? ""), name: String(data.name || row.name) };
  for (const key of cfg.columns) record[key] = toCsvText(key, data[key]);
  record.url = row.url;
  record.priceRupees = toCsvText("priceRupees", row.priceRupees ?? data.priceRupees);

  const check = cfg.rule.safeParse(record);
  if (!check.success) {
    const problems = check.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { ok: false, reason: problems, data };
  }
  takenSlugs.add(slug);
  return { ok: true, record };
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const sheetId = process.env.SHEET_ID;
  if (!sheetId) throw new Error("SHEET_ID is missing in .env");
  const onlyCategory = arg("category") as SheetCategory | undefined;
  const limit = Number(arg("limit") ?? Infinity);
  if (onlyCategory && !(onlyCategory in CATEGORIES)) {
    throw new Error(`Unknown --category. Use one of: ${Object.keys(CATEGORIES).join(", ")}`);
  }

  const client = new Anthropic();
  mkdirSync("data/review", { recursive: true });

  const sheet = await loadSheet(sheetId);
  const done = new Set<string>();
  const takenSlugs = new Set<string>();
  for (const { file } of Object.values(CATEGORIES)) {
    for (const r of readCsv(csvPath(file))) {
      if (r.url) done.add(r.url);
      if (r.slug) takenSlugs.add(r.slug);
    }
    for (const r of readCsv(reviewPath(file))) if (r.url) done.add(r.url);
  }
  const todo = sheet
    .filter((r) => (!onlyCategory || r.category === onlyCategory) && (r.inStock || r.category === "case"))
    .filter((r) => !done.has(r.url))
    .slice(0, limit);

  console.log(`Sheet: ${sheet.length} parts. To extract now: ${todo.length}.`);

  let good = 0;
  let review = 0;
  const queue = [...todo];
  async function worker() {
    for (let row = queue.shift(); row; row = queue.shift()) {
      const cfg = CATEGORIES[row.category];
      try {
        const result = await extractOne(client, row, takenSlugs);
        if (result.ok) {
          const path = csvPath(cfg.file);
          const header = [...BASE_COLUMNS, ...cfg.columns, ...END_COLUMNS];
          if (!existsSync(path)) writeFileSync(path, csvLine(header));
          appendFileSync(path, csvLine(header.map((h) => result.record[h] ?? "")));
          good++;
          console.log(`✅ ${row.category.padEnd(11)} ${result.record.name}`);
        } else {
          writeReview(cfg.file, row, result.reason, result.data);
          review++;
          console.log(`📝 ${row.category.padEnd(11)} ${row.name} — ${result.reason}`);
        }
      } catch (err) {
        if (err instanceof Anthropic.AuthenticationError) throw new Error("ANTHROPIC_API_KEY is missing or wrong in .env");
        if (err instanceof Anthropic.RateLimitError) {
          queue.push(row);
          console.log("⏳ rate limited, waiting 20 s…");
          await new Promise((r) => setTimeout(r, 20_000));
          continue;
        }
        writeReview(cfg.file, row, err instanceof Error ? err.message : String(err));
        review++;
        console.log(`📝 ${row.category.padEnd(11)} ${row.name} — error`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`\nDone: ${good} ready in data/*.csv, ${review} to check in data/review/*.csv`);
  console.log("Next: fix any review rows, then run  pnpm --filter @pcb/db db:seed");
}

function writeReview(file: string, row: SheetRow, reason: string, data?: unknown) {
  const path = reviewPath(file);
  if (!existsSync(path)) writeFileSync(path, csvLine(["url", "name", "mpn", "reason", "extracted"]));
  appendFileSync(path, csvLine([row.url, row.name, row.mpn ?? "", reason, data ? JSON.stringify(data) : ""]));
}

main().catch((err) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exit(1);
});
