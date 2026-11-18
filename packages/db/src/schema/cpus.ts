import { boolean, integer, numeric, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { memoryType } from "./_shared";

// An enum = a column that only allows a fixed list of values
export const cpuBrand = pgEnum("cpu_brand", ["Intel", "AMD"]);

// CPUs keep their own columns because brand is an enum here (only Intel or AMD).
export const cpus = pgTable("cpus", {
  id: serial("id").primaryKey(),                  // 1, 2, 3... set automatically
  slug: text("slug").notNull().unique(),          // e.g. "amd-ryzen-5-7600"
  brand: cpuBrand("brand").notNull(),
  name: text("name").notNull(),                   // e.g. "Ryzen 5 7600"
  socket: text("socket").notNull(),               // e.g. "AM5", "LGA1700"
  cores: integer("cores").notNull(),
  threads: integer("threads").notNull(),
  baseClockGhz: numeric("base_clock_ghz", { precision: 4, scale: 2 }),
  boostClockGhz: numeric("boost_clock_ghz", { precision: 4, scale: 2 }),
  tdpW: integer("tdp_w").notNull(),               // power use in watts
  memoryTypes: memoryType("memory_types").array().notNull(), // ["DDR5"] or ["DDR4","DDR5"]
  maxMemorySpeedMts: integer("max_memory_speed_mts"),
  hasIntegratedGraphics: boolean("has_integrated_graphics").notNull().default(false),
  pcieVersion: integer("pcie_version").notNull(), // 4 or 5
  enabled: boolean("enabled").notNull().default(true), // admin can hide a part
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
