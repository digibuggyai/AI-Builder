import { integer, numeric, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { partColumns } from "./_shared";

export const panelType = pgEnum("panel_type", ["IPS", "VA", "TN", "OLED"]);

export const monitors = pgTable("monitors", {
  ...partColumns(),
  sizeInch: numeric("size_inch", { precision: 3, scale: 1 }).notNull(), // 27.0
  widthPx: integer("width_px").notNull(),     // 2560
  heightPx: integer("height_px").notNull(),   // 1440
  refreshHz: integer("refresh_hz").notNull(), // 165
  panel: panelType("panel").notNull(),
  responseMs: numeric("response_ms", { precision: 3, scale: 1 }),
});
