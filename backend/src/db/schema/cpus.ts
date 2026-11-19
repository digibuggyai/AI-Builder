import { boolean, integer, numeric, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { memoryType } from "./_shared";

export const cpuBrand = pgEnum("cpu_brand", ["Intel", "AMD"]);

export const cpus = pgTable("cpus", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  brand: cpuBrand("brand").notNull(),
  name: text("name").notNull(),
  socket: text("socket").notNull(),
  cores: integer("cores").notNull(),
  threads: integer("threads").notNull(),
  baseClockGhz: numeric("base_clock_ghz", { precision: 4, scale: 2 }),
  boostClockGhz: numeric("boost_clock_ghz", { precision: 4, scale: 2 }),
  tdpW: integer("tdp_w").notNull(),
  memoryTypes: memoryType("memory_types").array().notNull(),
  maxMemorySpeedMts: integer("max_memory_speed_mts"),
  hasIntegratedGraphics: boolean("has_integrated_graphics").notNull().default(false),
  pcieVersion: integer("pcie_version").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
