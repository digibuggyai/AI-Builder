import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";
import { formFactor, memoryType, partColumns } from "./_shared";

export const motherboards = pgTable("motherboards", {
  ...partColumns(),
  socket: text("socket").notNull(),
  chipset: text("chipset").notNull(),
  formFactor: formFactor("form_factor").notNull(),
  memoryType: memoryType("memory_type").notNull(),
  ramSlots: integer("ram_slots").notNull(),
  maxRamGb: integer("max_ram_gb").notNull(),
  maxRamSpeedMts: integer("max_ram_speed_mts"),
  m2Slots: integer("m2_slots").notNull(),
  sataPorts: integer("sata_ports").notNull(),
  pcieVersion: integer("pcie_version").notNull(),
  hasWifi: boolean("has_wifi").notNull().default(false),
});
