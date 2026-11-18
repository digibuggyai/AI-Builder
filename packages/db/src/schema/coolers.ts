import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { partColumns } from "./_shared";

export const coolerType = pgEnum("cooler_type", ["Air", "Liquid"]);

export const coolers = pgTable("coolers", {
  ...partColumns(),
  type: coolerType("type").notNull(),
  sockets: text("sockets").array().notNull(),  // e.g. ["AM5","AM4","LGA1700"]
  tdpRatingW: integer("tdp_rating_w").notNull(), // heat it can handle
  heightMm: integer("height_mm"),              // Air only: must fit the case
  radiatorMm: integer("radiator_mm"),          // Liquid only: 120, 240, 280, 360
});
