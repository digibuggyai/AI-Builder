import { index, integer, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { partCategory } from "./_shared";

// A saved PC. The id is a random UUID so share links can't be guessed
// (/build/3f2a9c1e-... instead of /build/1, /build/2, ...).
export const builds = pgTable("builds", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  mode: text("mode").notNull(),           // "beginner" | "pro" | "advanced"
  useCase: text("use_case"),              // e.g. "gaming-aaa"
  budgetPaise: integer("budget_paise"),
  totalPaise: integer("total_paise"),     // price when saved
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// The parts inside a build. A separate table, because one build
// can have several of the same kind (e.g. two SSDs).
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
    pricePaise: integer("price_paise"),   // price of this part when saved
  },
  (t) => [index("build_items_build_idx").on(t.buildId)],
);
