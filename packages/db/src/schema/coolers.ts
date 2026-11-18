import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { partColumns } from "./_shared";

export const coolerType = pgEnum("cooler_type", ["Air", "Liquid"]);

export const coolers = pgTable("coolers", {
  ...partColumns(),
  type: coolerType("type").notNull(),
  sockets: text("sockets").array().notNull(),
  tdpRatingW: integer("tdp_rating_w").notNull(),
  heightMm: integer("height_mm"),
  radiatorMm: integer("radiator_mm"),
});
