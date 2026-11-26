import { eq, lt, sql } from "drizzle-orm";
import { type Db, sheetProducts, syncRuns } from "../db";
import { downloadSheet, readSheet } from "./read";

export type SyncResult = {
  ok: boolean;
  rows: number;
  priceChanges: number;
  missingTabs: string[];
  error?: string;
};

let running: Promise<SyncResult> | null = null;

export function syncSheet(db: Db, trigger: string): Promise<SyncResult> {
  running ??= run(db, trigger).finally(() => {
    running = null;
  });
  return running;
}

async function run(db: Db, trigger: string): Promise<SyncResult> {
  const sheetId = process.env.SHEET_ID;
  const [log] = await db.insert(syncRuns).values({ trigger }).returning({ id: syncRuns.id });
  const startedAt = new Date();

  try {
    if (!sheetId) throw new Error("SHEET_ID is missing");
    const { products, missingTabs } = await readSheet(await downloadSheet(sheetId));
    if (products.length === 0) throw new Error("The sheet returned no products");

    const before = new Map(
      (await db.select({ key: sheetProducts.key, price: sheetProducts.sheetPricePaise }).from(sheetProducts)).map((r) => [
        r.key,
        r.price,
      ]),
    );
    let priceChanges = 0;
    for (const p of products) {
      if (before.has(p.key) && before.get(p.key) !== p.pricePaise) priceChanges++;
    }

    const now = new Date();
    for (let i = 0; i < products.length; i += 500) {
      const chunk = products.slice(i, i + 500);
      await db
        .insert(sheetProducts)
        .values(
          chunk.map((p) => ({
            key: p.key,
            tab: p.tab,
            category: p.category,
            group: p.group,
            name: p.name,
            details: p.details,
            skuId: p.skuId,
            url: p.url,
            sheetPricePaise: p.pricePaise,
            inStock: p.inStock,
            sheetColor: p.color,
            sheetNotes: p.notes,
            sheetUpdatedAt: p.updatedAt,
            active: true,
            lastSeenAt: now,
            updatedAt: now,
          })),
        )
        .onConflictDoUpdate({
          target: sheetProducts.key,
          set: {
            tab: sql`excluded.tab`,
            category: sql`excluded.category`,
            group: sql`excluded.group`,
            name: sql`excluded.name`,
            details: sql`excluded.details`,
            skuId: sql`excluded.sku_id`,
            url: sql`excluded.url`,
            sheetPricePaise: sql`excluded.sheet_price_paise`,
            inStock: sql`excluded.in_stock`,
            sheetColor: sql`excluded.sheet_color`,
            sheetNotes: sql`excluded.sheet_notes`,
            sheetUpdatedAt: sql`excluded.sheet_updated_at`,
            active: sql`true`,
            lastSeenAt: sql`excluded.last_seen_at`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
    }

    await db.update(sheetProducts).set({ active: false }).where(lt(sheetProducts.lastSeenAt, startedAt));

    const result = { ok: true, rows: products.length, priceChanges, missingTabs };
    await db
      .update(syncRuns)
      .set({ finishedAt: new Date(), ok: true, rows: products.length, priceChanges, error: missingTabs.length ? `Missing tabs: ${missingTabs.join(", ")}` : null })
      .where(eq(syncRuns.id, log!.id));
    console.log(`Sheet sync (${trigger}): ${products.length} rows, ${priceChanges} price changes`);
    return result;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await db.update(syncRuns).set({ finishedAt: new Date(), ok: false, error }).where(eq(syncRuns.id, log!.id));
    console.error(`Sheet sync (${trigger}) failed: ${error}`);
    return { ok: false, rows: 0, priceChanges: 0, missingTabs: [], error };
  }
}

export function startSheetSchedule(db: Db) {
  const minutes = Math.max(5, Number(process.env.SYNC_MINUTES ?? 30));
  setTimeout(() => void syncSheet(db, "startup"), 5_000);
  setInterval(() => void syncSheet(db, "schedule"), minutes * 60_000);
  console.log(`Sheet sync every ${minutes} minutes`);
}
