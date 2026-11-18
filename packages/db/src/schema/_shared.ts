import { boolean, pgEnum, serial, text, timestamp } from "drizzle-orm/pg-core";

export const memoryType = pgEnum("memory_type", ["DDR4", "DDR5"]);

export const formFactor = pgEnum("form_factor", [
  "E-ATX",
  "ATX",
  "Micro-ATX",
  "Mini-ITX",
]);

export const partCategory = pgEnum("part_category", [
  "cpu",
  "gpu",
  "motherboard",
  "ram",
  "storage",
  "psu",
  "cooler",
  "case",
  "monitor",
]);

export const partColumns = () => ({
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
