import { boolean, integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { partColumns } from "./_shared";

export const psuEfficiency = pgEnum("psu_efficiency", [
  "80+ White",
  "80+ Bronze",
  "80+ Gold",
  "80+ Platinum",
  "80+ Titanium",
]);
export const psuModular = pgEnum("psu_modular", ["Full", "Semi", "Non"]);
export const psuFormFactor = pgEnum("psu_form_factor", ["ATX", "SFX"]);

export const psus = pgTable("psus", {
  ...partColumns(),
  wattage: integer("wattage").notNull(),
  efficiency: psuEfficiency("efficiency").notNull(),
  modular: psuModular("modular").notNull(),
  formFactor: psuFormFactor("form_factor").notNull().default("ATX"),
  has12v2x6: boolean("has_12v_2x6").notNull().default(false), // new GPU power plug
});
