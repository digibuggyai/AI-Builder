import { boolean, index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const sheetProducts = pgTable(
  "sheet_products",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull().unique(),
    tab: text("tab").notNull(),
    category: text("category").notNull(),
    group: text("group"),
    name: text("name").notNull(),
    details: text("details"),
    skuId: text("sku_id"),
    url: text("url"),
    sheetPricePaise: integer("sheet_price_paise"),
    overridePricePaise: integer("override_price_paise"),
    inStock: boolean("in_stock").notNull().default(false),
    sheetColor: text("sheet_color"),
    sheetNotes: text("sheet_notes"),
    sheetUpdatedAt: timestamp("sheet_updated_at"),
    active: boolean("active").notNull().default(true),
    lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("sheet_products_category_idx").on(t.category)],
);

export const syncRuns = pgTable("sync_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  finishedAt: timestamp("finished_at"),
  ok: boolean("ok"),
  rows: integer("rows"),
  priceChanges: integer("price_changes"),
  error: text("error"),
  trigger: text("trigger").notNull(),
});
