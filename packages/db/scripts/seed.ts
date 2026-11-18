// Loads parts from CSV files into the database.
// Run: pnpm --filter @pcb/db db:seed
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import type { z } from "zod";
import {
  cases,
  coolers,
  cpus,
  createDb,
  gpus,
  monitors,
  motherboards,
  psus,
  ramKits,
  storage,
} from "../src/index";
import {
  caseRow,
  coolerRow,
  cpuRow,
  gpuRow,
  monitorRow,
  motherboardRow,
  psuRow,
  ramRow,
  storageRow,
} from "./seed-rows";

config({ path: "../../.env", quiet: true });

// ---------- Read + check a CSV file ----------
// Returns the good rows, and adds any problems to the shared `errors` list.
function loadCsv<T extends z.ZodType>(file: string, schema: T, errors: string[]): z.infer<T>[] {
  const records: Record<string, string>[] = parse(readFileSync(file, "utf8"), {
    columns: true,          // first line = column names
    skip_empty_lines: true,
    trim: true,
  });

  const good: z.infer<T>[] = [];
  records.forEach((record, i) => {
    const result = schema.safeParse(record);
    if (result.success) {
      good.push(result.data);
    } else {
      // i + 2 because line 1 is the header and humans count from 1
      for (const issue of result.error.issues) {
        errors.push(`${file} line ${i + 2}, ${issue.path.join(".")}: ${issue.message}`);
      }
    }
  });
  return good;
}

// ---------- Main ----------
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing in .env");
  const db = createDb(process.env.DATABASE_URL);

  // 1. Check EVERY file first. Collect all problems before saving anything.
  const errors: string[] = [];
  const data = {
    cpus: loadCsv("data/cpus.csv", cpuRow, errors),
    gpus: loadCsv("data/gpus.csv", gpuRow, errors),
    motherboards: loadCsv("data/motherboards.csv", motherboardRow, errors),
    ram: loadCsv("data/ram.csv", ramRow, errors),
    storage: loadCsv("data/storage.csv", storageRow, errors),
    psus: loadCsv("data/psus.csv", psuRow, errors),
    coolers: loadCsv("data/coolers.csv", coolerRow, errors),
    cases: loadCsv("data/cases.csv", caseRow, errors),
    monitors: loadCsv("data/monitors.csv", monitorRow, errors),
  };

  if (errors.length > 0) {
    console.error(`\n❌ ${errors.length} problem(s) found. Nothing was saved:\n`);
    errors.forEach((e) => console.error("  " + e));
    process.exit(1);
  }

  // 2. Save everything in ONE transaction: all rows are saved, or none are.
  // "Upsert" = insert, or update if this slug already exists. Safe to re-run.
  await db.transaction(async (tx) => {
    for (const row of data.cpus)
      await tx.insert(cpus).values(row).onConflictDoUpdate({ target: cpus.slug, set: row });
    for (const row of data.gpus)
      await tx.insert(gpus).values(row).onConflictDoUpdate({ target: gpus.slug, set: row });
    for (const row of data.motherboards)
      await tx.insert(motherboards).values(row).onConflictDoUpdate({ target: motherboards.slug, set: row });
    for (const row of data.ram)
      await tx.insert(ramKits).values(row).onConflictDoUpdate({ target: ramKits.slug, set: row });
    for (const row of data.storage)
      await tx.insert(storage).values(row).onConflictDoUpdate({ target: storage.slug, set: row });
    for (const row of data.psus)
      await tx.insert(psus).values(row).onConflictDoUpdate({ target: psus.slug, set: row });
    for (const row of data.coolers)
      await tx.insert(coolers).values(row).onConflictDoUpdate({ target: coolers.slug, set: row });
    for (const row of data.cases)
      await tx.insert(cases).values(row).onConflictDoUpdate({ target: cases.slug, set: row });
    for (const row of data.monitors)
      await tx.insert(monitors).values(row).onConflictDoUpdate({ target: monitors.slug, set: row });
  });

  for (const [name, rows] of Object.entries(data)) {
    console.log(`✅ ${name}: ${rows.length} saved`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
