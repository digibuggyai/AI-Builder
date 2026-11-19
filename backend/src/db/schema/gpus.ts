import { integer, numeric, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { partColumns } from "./_shared";

export const gpuChipMaker = pgEnum("gpu_chip_maker", ["NVIDIA", "AMD", "Intel"]);

export const gpus = pgTable("gpus", {
  ...partColumns(),
  chipMaker: gpuChipMaker("chip_maker").notNull(),
  chipset: text("chipset").notNull(),
  vramGb: integer("vram_gb").notNull(),
  lengthMm: integer("length_mm").notNull(),
  slotWidth: numeric("slot_width", { precision: 2, scale: 1 }),
  tdpW: integer("tdp_w").notNull(),
  recommendedPsuW: integer("recommended_psu_w").notNull(),
  powerConnectors: text("power_connectors"),
  pcieVersion: integer("pcie_version").notNull(),
});
