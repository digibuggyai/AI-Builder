import { boolean, pgEnum, serial, text, timestamp } from "drizzle-orm/pg-core";

// ---------- Enums used by more than one table ----------

export const memoryType = pgEnum("memory_type", ["DDR4", "DDR5"]);

export const formFactor = pgEnum("form_factor", [
  "E-ATX",
  "ATX",
  "Micro-ATX",
  "Mini-ITX",
]);

// Which kind of part a row is about (used by listings and builds)
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

// ---------- Columns every part table has ----------
// A function, so each table gets its own fresh copy of the columns.
export const partColumns = () => ({
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // e.g. "msi-b650-gaming-plus-wifi"
  brand: text("brand").notNull(),        // e.g. "MSI"
  name: text("name").notNull(),          // full product name
  enabled: boolean("enabled").notNull().default(true), // admin can hide a part
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
