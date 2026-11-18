import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";
import { formFactor, memoryType, partColumns } from "./_shared";

export const motherboards = pgTable("motherboards", {
  ...partColumns(),
  socket: text("socket").notNull(),                 // must match the CPU
  chipset: text("chipset").notNull(),               // e.g. "B650"
  formFactor: formFactor("form_factor").notNull(),  // must fit the case
  memoryType: memoryType("memory_type").notNull(),  // must match the RAM
  ramSlots: integer("ram_slots").notNull(),
  maxRamGb: integer("max_ram_gb").notNull(),
  maxRamSpeedMts: integer("max_ram_speed_mts"),
  m2Slots: integer("m2_slots").notNull(),
  sataPorts: integer("sata_ports").notNull(),
  pcieVersion: integer("pcie_version").notNull(),
  hasWifi: boolean("has_wifi").notNull().default(false),
});
