import { index, integer, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { partCategory } from "./_shared";

export const builds = pgTable("builds", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  mode: text("mode").notNull(),
  useCase: text("use_case"),
  budgetPaise: integer("budget_paise"),
  totalPaise: integer("total_paise"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const buildItems = pgTable(
  "build_items",
  {
    id: serial("id").primaryKey(),
    buildId: uuid("build_id")
      .notNull()
      .references(() => builds.id, { onDelete: "cascade" }),
    partCategory: partCategory("part_category").notNull(),
    partId: integer("part_id").notNull(),
    quantity: integer("quantity").notNull().default(1),
    pricePaise: integer("price_paise"),
  },
  (t) => [index("build_items_build_idx").on(t.buildId)],
);
