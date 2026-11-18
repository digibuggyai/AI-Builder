import { boolean, integer, pgTable } from "drizzle-orm/pg-core";
import { memoryType, partColumns } from "./_shared";

// A RAM kit = what you buy in one box, e.g. 2 x 16 GB
export const ramKits = pgTable("ram_kits", {
  ...partColumns(),
  memoryType: memoryType("memory_type").notNull(),
  modules: integer("modules").notNull(),           // number of sticks
  capacityGb: integer("capacity_gb").notNull(),    // total, e.g. 32
  speedMts: integer("speed_mts").notNull(),        // e.g. 6000
  casLatency: integer("cas_latency"),              // e.g. 30 (lower = faster)
  heightMm: integer("height_mm"),                  // tall RAM can hit big air coolers
  rgb: boolean("rgb").notNull().default(false),
});
