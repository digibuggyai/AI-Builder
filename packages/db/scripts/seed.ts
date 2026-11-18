import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import type { z } from "zod";
import {
  cases,
  coolers,
  cpus,
  createDb,
  eq,
  gpus,
  listings,
  monitors,
  motherboards,
  notInArray,
  psus,
  ramKits,
  retailers,
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

const MD = { name: "MD Computers", websiteUrl: "https://mdcomputers.in" };

function loadCsv<T extends z.ZodType>(file: string, schema: T, errors: string[]): z.infer<T>[] {
  const records: Record<string, string>[] = parse(readFileSync(file, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const good: z.infer<T>[] = [];
  records.forEach((record, i) => {
    const result = schema.safeParse(record);
    if (result.success) {
      good.push(result.data);
    } else {
      for (const issue of result.error.issues) {
        errors.push(`${file} line ${i + 2}, ${issue.path.join(".")}: ${issue.message}`);
      }
    }
  });
  return good;
}

type Link = { category: typeof listings.$inferInsert.partCategory; partId: number; url?: string; priceRupees: number | null };

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing in .env");
  const db = createDb(process.env.DATABASE_URL);

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

  await db.transaction(async (tx) => {
    const links: Link[] = [];

    for (const { url, priceRupees, ...part } of data.cpus) {
      const [saved] = await tx.insert(cpus).values(part)
        .onConflictDoUpdate({ target: cpus.slug, set: { ...part, enabled: true } }).returning({ id: cpus.id });
      links.push({ category: "cpu", partId: saved!.id, url, priceRupees });
    }
    for (const { url, priceRupees, ...part } of data.gpus) {
      const [saved] = await tx.insert(gpus).values(part)
        .onConflictDoUpdate({ target: gpus.slug, set: { ...part, enabled: true } }).returning({ id: gpus.id });
      links.push({ category: "gpu", partId: saved!.id, url, priceRupees });
    }
    for (const { url, priceRupees, ...part } of data.motherboards) {
      const [saved] = await tx.insert(motherboards).values(part)
        .onConflictDoUpdate({ target: motherboards.slug, set: { ...part, enabled: true } }).returning({ id: motherboards.id });
      links.push({ category: "motherboard", partId: saved!.id, url, priceRupees });
    }
    for (const { url, priceRupees, ...part } of data.ram) {
      const [saved] = await tx.insert(ramKits).values(part)
        .onConflictDoUpdate({ target: ramKits.slug, set: { ...part, enabled: true } }).returning({ id: ramKits.id });
      links.push({ category: "ram", partId: saved!.id, url, priceRupees });
    }
    for (const { url, priceRupees, ...part } of data.storage) {
      const [saved] = await tx.insert(storage).values(part)
        .onConflictDoUpdate({ target: storage.slug, set: { ...part, enabled: true } }).returning({ id: storage.id });
      links.push({ category: "storage", partId: saved!.id, url, priceRupees });
    }
    for (const { url, priceRupees, ...part } of data.psus) {
      const [saved] = await tx.insert(psus).values(part)
        .onConflictDoUpdate({ target: psus.slug, set: { ...part, enabled: true } }).returning({ id: psus.id });
      links.push({ category: "psu", partId: saved!.id, url, priceRupees });
    }
    for (const { url, priceRupees, ...part } of data.coolers) {
      const [saved] = await tx.insert(coolers).values(part)
        .onConflictDoUpdate({ target: coolers.slug, set: { ...part, enabled: true } }).returning({ id: coolers.id });
      links.push({ category: "cooler", partId: saved!.id, url, priceRupees });
    }
    for (const { url, priceRupees, ...part } of data.cases) {
      const [saved] = await tx.insert(cases).values(part)
        .onConflictDoUpdate({ target: cases.slug, set: { ...part, enabled: true } }).returning({ id: cases.id });
      links.push({ category: "case", partId: saved!.id, url, priceRupees });
    }
    for (const { url, priceRupees, ...part } of data.monitors) {
      const [saved] = await tx.insert(monitors).values(part)
        .onConflictDoUpdate({ target: monitors.slug, set: { ...part, enabled: true } }).returning({ id: monitors.id });
      links.push({ category: "monitor", partId: saved!.id, url, priceRupees });
    }

    await tx.update(cpus).set({ enabled: false }).where(notInArray(cpus.slug, data.cpus.map((r) => r.slug)));
    await tx.update(gpus).set({ enabled: false }).where(notInArray(gpus.slug, data.gpus.map((r) => r.slug)));
    await tx.update(motherboards).set({ enabled: false }).where(notInArray(motherboards.slug, data.motherboards.map((r) => r.slug)));
    await tx.update(ramKits).set({ enabled: false }).where(notInArray(ramKits.slug, data.ram.map((r) => r.slug)));
    await tx.update(storage).set({ enabled: false }).where(notInArray(storage.slug, data.storage.map((r) => r.slug)));
    await tx.update(psus).set({ enabled: false }).where(notInArray(psus.slug, data.psus.map((r) => r.slug)));
    await tx.update(coolers).set({ enabled: false }).where(notInArray(coolers.slug, data.coolers.map((r) => r.slug)));
    await tx.update(cases).set({ enabled: false }).where(notInArray(cases.slug, data.cases.map((r) => r.slug)));
    await tx.update(monitors).set({ enabled: false }).where(notInArray(monitors.slug, data.monitors.map((r) => r.slug)));

    const [demo] = await tx.select({ id: retailers.id }).from(retailers).where(eq(retailers.name, "Demo Store"));
    if (demo) {
      await tx.delete(listings).where(eq(listings.retailerId, demo.id));
      await tx.delete(retailers).where(eq(retailers.id, demo.id));
      console.log("🧹 removed the old demo prices");
    }

    const [md] = await tx.insert(retailers).values(MD)
      .onConflictDoUpdate({ target: retailers.name, set: MD }).returning({ id: retailers.id });
    if (!md) throw new Error("Could not create the MD Computers retailer");

    for (const link of links) {
      if (!link.url) continue;
      await tx.insert(listings)
        .values({
          partCategory: link.category,
          partId: link.partId,
          retailerId: md.id,
          url: link.url,
          pricePaise: link.priceRupees != null ? link.priceRupees * 100 : null,
          inStock: link.priceRupees != null,
          lastCheckedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [listings.retailerId, listings.url],
          set: { partCategory: link.category, partId: link.partId },
        });
    }
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
