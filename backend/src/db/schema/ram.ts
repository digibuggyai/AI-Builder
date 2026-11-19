import { boolean, integer, pgTable } from "drizzle-orm/pg-core";
import { memoryType, partColumns } from "./_shared";

export const ramKits = pgTable("ram_kits", {
  ...partColumns(),
  memoryType: memoryType("memory_type").notNull(),
  modules: integer("modules").notNull(),
  capacityGb: integer("capacity_gb").notNull(),
  speedMts: integer("speed_mts").notNull(),
  casLatency: integer("cas_latency"),
  heightMm: integer("height_mm"),
  rgb: boolean("rgb").notNull().default(false),
});
