import { timingSafeEqual } from "node:crypto";
import { and, asc, desc, eq, ilike, isNotNull, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../context";
import { sheetProducts, syncRuns } from "../db";
import { syncSheet } from "../sheet/sync";

export const adminRoutes = new Hono();

function sameToken(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

adminRoutes.use("/admin/*", async (c, next) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 12) return c.json({ error: "Admin is not set up. Add ADMIN_TOKEN (12+ characters) to the backend." }, 503);
  const given = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!sameToken(given, expected)) return c.json({ error: "Wrong admin password" }, 401);
  await next();
});

const effective = sql<number | null>`coalesce(${sheetProducts.overridePricePaise}, ${sheetProducts.sheetPricePaise})`;

adminRoutes.get("/admin/summary", async (c) => {
  const rows = await db
    .select({
      category: sheetProducts.category,
      total: sql<number>`count(*)::int`,
      inStock: sql<number>`count(*) filter (where ${sheetProducts.inStock})::int`,
      missingPrice: sql<number>`count(*) filter (where ${effective} is null)::int`,
      overridden: sql<number>`count(*) filter (where ${sheetProducts.overridePricePaise} is not null)::int`,
    })
    .from(sheetProducts)
    .where(eq(sheetProducts.active, true))
    .groupBy(sheetProducts.category);
  const [lastRun] = await db.select().from(syncRuns).orderBy(desc(syncRuns.startedAt)).limit(1);
  const [lastOk] = await db.select().from(syncRuns).where(eq(syncRuns.ok, true)).orderBy(desc(syncRuns.startedAt)).limit(1);
  return c.json({ categories: rows, lastRun: lastRun ?? null, lastSuccess: lastOk ?? null });
});

const listQuery = z.object({
  category: z.string().min(1).max(20),
  filter: z.enum(["all", "missing", "override", "prebook"]).default("all"),
  q: z.string().max(100).optional(),
});

adminRoutes.get("/admin/products", async (c) => {
  const parsed = listQuery.safeParse(c.req.query());
  if (!parsed.success) return c.json({ error: "Bad query" }, 400);
  const { category, filter, q } = parsed.data;

  const conditions = [eq(sheetProducts.active, true), eq(sheetProducts.category, category)];
  if (filter === "missing") conditions.push(sql`${effective} is null`);
  if (filter === "override") conditions.push(isNotNull(sheetProducts.overridePricePaise));
  if (filter === "prebook") conditions.push(eq(sheetProducts.inStock, false));
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    conditions.push(or(ilike(sheetProducts.name, like), ilike(sheetProducts.skuId, like))!);
  }

  const rows = await db
    .select({
      id: sheetProducts.id,
      name: sheetProducts.name,
      group: sheetProducts.group,
      skuId: sheetProducts.skuId,
      url: sheetProducts.url,
      sheetPricePaise: sheetProducts.sheetPricePaise,
      overridePricePaise: sheetProducts.overridePricePaise,
      inStock: sheetProducts.inStock,
      sheetUpdatedAt: sheetProducts.sheetUpdatedAt,
      sheetNotes: sheetProducts.sheetNotes,
    })
    .from(sheetProducts)
    .where(and(...conditions))
    .orderBy(asc(sql`${effective} is not null`), asc(sheetProducts.group), asc(sheetProducts.name))
    .limit(3000);
  return c.json({ products: rows });
});

const priceBody = z.object({
  priceRupees: z.number().int().positive().max(10_000_000).nullable(),
});

adminRoutes.patch("/admin/products/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: "Bad id" }, 400);
  const parsed = priceBody.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Price must be a whole number of rupees, or empty to clear" }, 400);

  const [row] = await db
    .update(sheetProducts)
    .set({
      overridePricePaise: parsed.data.priceRupees == null ? null : parsed.data.priceRupees * 100,
      updatedAt: new Date(),
    })
    .where(eq(sheetProducts.id, id))
    .returning({ id: sheetProducts.id, overridePricePaise: sheetProducts.overridePricePaise });
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

adminRoutes.post("/admin/sync", async (c) => {
  const result = await syncSheet(db, "admin");
  return c.json(result, result.ok ? 200 : 502);
});
