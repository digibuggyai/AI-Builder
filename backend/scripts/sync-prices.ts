import { config } from "dotenv";
import { and, createDb, eq, listings, priceHistory, retailers } from "../src/db";
import { loadSheet } from "./sheet";

config({ path: "../.env", quiet: true });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing in .env");
  if (!process.env.SHEET_ID) throw new Error("SHEET_ID missing in .env");
  const db = createDb(process.env.DATABASE_URL);

  const [md] = await db.select({ id: retailers.id }).from(retailers).where(eq(retailers.name, "MD Computers"));
  if (!md) throw new Error("No MD Computers retailer yet. Run db:seed first.");

  const sheet = await loadSheet(process.env.SHEET_ID);
  const ours = await db
    .select({ id: listings.id, url: listings.url, pricePaise: listings.pricePaise, inStock: listings.inStock })
    .from(listings)
    .where(eq(listings.retailerId, md.id));
  const byUrl = new Map(ours.map((l) => [l.url, l]));

  let changed = 0;
  let same = 0;
  let notInCatalog = 0;

  for (const row of sheet) {
    const listing = byUrl.get(row.url);
    if (!listing) {
      notInCatalog++;
      continue;
    }
    if (row.category === "case") continue;

    const pricePaise = row.priceRupees != null ? row.priceRupees * 100 : null;
    if (pricePaise === listing.pricePaise && row.inStock === listing.inStock) {
      same++;
      continue;
    }

    await db
      .update(listings)
      .set({ pricePaise, inStock: row.inStock, lastCheckedAt: row.updatedAt ?? new Date() })
      .where(and(eq(listings.id, listing.id), eq(listings.retailerId, md.id)));
    if (pricePaise != null) {
      await db.insert(priceHistory).values({
        listingId: listing.id,
        pricePaise,
        inStock: row.inStock,
        recordedAt: row.updatedAt ?? new Date(),
      });
    }
    changed++;
  }

  console.log(`✅ Prices: ${changed} updated, ${same} unchanged.`);
  console.log(`ℹ️  ${notInCatalog} sheet parts have no specs yet (run specs:extract to add them).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exit(1);
});
