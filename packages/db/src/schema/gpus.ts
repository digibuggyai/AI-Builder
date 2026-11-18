import { integer, numeric, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { partColumns } from "./_shared";

export const gpuChipMaker = pgEnum("gpu_chip_maker", ["NVIDIA", "AMD", "Intel"]);

export const gpus = pgTable("gpus", {
  ...partColumns(),                                   // brand = card maker, e.g. "ZOTAC"
  chipMaker: gpuChipMaker("chip_maker").notNull(),    // who made the chip
  chipset: text("chipset").notNull(),                 // e.g. "RTX 5060 Ti"
  vramGb: integer("vram_gb").notNull(),
  lengthMm: integer("length_mm").notNull(),           // must fit the case
  slotWidth: numeric("slot_width", { precision: 2, scale: 1 }), // 2.0, 2.5, 3.0
  tdpW: integer("tdp_w").notNull(),
  recommendedPsuW: integer("recommended_psu_w").notNull(),
  powerConnectors: text("power_connectors"),          // e.g. "1x 8-pin", "1x 12V-2x6"
  pcieVersion: integer("pcie_version").notNull(),
});
