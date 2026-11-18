import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { partCategory } from "./_shared";

export const retailers = pgTable("retailers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  websiteUrl: text("website_url").notNull(),
  enabled: boolean("enabled").notNull().default(true),
});

export const listings = pgTable(
  "listings",
  {
    id: serial("id").primaryKey(),
    partCategory: partCategory("part_category").notNull(),
    partId: integer("part_id").notNull(),
    retailerId: integer("retailer_id")
      .notNull()
      .references(() => retailers.id),
    url: text("url").notNull(),
    pricePaise: integer("price_paise"),
    inStock: boolean("in_stock").notNull().default(true),
    lastCheckedAt: timestamp("last_checked_at"),
  },
  (t) => [
    uniqueIndex("listings_retailer_url_idx").on(t.retailerId, t.url),
    index("listings_part_idx").on(t.partCategory, t.partId),
  ],
);

export const priceHistory = pgTable(
  "price_history",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    pricePaise: integer("price_paise").notNull(),
    inStock: boolean("in_stock").notNull(),
    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  },
  (t) => [index("price_history_listing_time_idx").on(t.listingId, t.recordedAt)],
);
