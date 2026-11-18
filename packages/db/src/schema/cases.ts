import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { formFactor, partColumns } from "./_shared";
import { psuFormFactor } from "./psus";

export const cases = pgTable("cases", {
  ...partColumns(),
  motherboardSupport: formFactor("motherboard_support").array().notNull(), // e.g. ["ATX","Micro-ATX"]
  psuSupport: psuFormFactor("psu_support").array().notNull(),
  maxGpuLengthMm: integer("max_gpu_length_mm").notNull(),
  maxCoolerHeightMm: integer("max_cooler_height_mm").notNull(),
  radiatorSupportMm: integer("radiator_support_mm").array().notNull(), // e.g. [240, 360]
  drives25: integer("drives_2_5").notNull().default(0), // 2.5" SSD bays
  drives35: integer("drives_3_5").notNull().default(0), // 3.5" HDD bays
  color: text("color"),
});
