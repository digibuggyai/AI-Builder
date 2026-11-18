import { integer, numeric, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { partColumns } from "./_shared";

export const panelType = pgEnum("panel_type", ["IPS", "VA", "TN", "OLED"]);

export const monitors = pgTable("monitors", {
  ...partColumns(),
  sizeInch: numeric("size_inch", { precision: 3, scale: 1 }).notNull(),
  widthPx: integer("width_px").notNull(),
  heightPx: integer("height_px").notNull(),
  refreshHz: integer("refresh_hz").notNull(),
  panel: panelType("panel").notNull(),
  responseMs: numeric("response_ms", { precision: 3, scale: 1 }),
});
