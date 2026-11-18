import { serve } from "@hono/node-server";
import { CATEGORIES, checkBuild, estimateWattage, type Build, type Catalog } from "@pcb/compat";
import { createDb } from "@pcb/db";
import { config } from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
import { loadCatalog } from "./catalog";

config({ path: "../../.env", quiet: true });

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");
const db = createDb(process.env.DATABASE_URL);

let cached: { at: number; catalog: Catalog } | null = null;
async function getCatalog(): Promise<Catalog> {
  if (cached && Date.now() - cached.at < 60_000) return cached.catalog;
  const catalog = await loadCatalog(db);
  cached = { at: Date.now(), catalog };
  return catalog;
}

const app = new Hono();

app.use(logger());
app.use(
  "*",
  cors({ origin: (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",") }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.get("/parts", async (c) => c.json(await getCatalog()));

const checkBody = z.object(
  Object.fromEntries(CATEGORIES.map((cat) => [cat, z.string().optional()])) as Record<
    (typeof CATEGORIES)[number],
    z.ZodOptional<z.ZodString>
  >,
);

app.post("/builds/check", async (c) => {
  const parsed = checkBody.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Send JSON like { \"cpu\": \"amd-ryzen-5-7600\" }" }, 400);
  }

  const catalog = await getCatalog();
  const build: Record<string, unknown> = {};
  for (const cat of CATEGORIES) {
    const slug = parsed.data[cat];
    if (!slug) continue;
    const part = catalog[cat].find((p) => p.slug === slug);
    if (!part) return c.json({ error: `Unknown ${cat}: ${slug}` }, 404);
    build[cat] = part;
  }

  const typed = build as Build;
  const totalRupees = CATEGORIES.reduce((sum, cat) => sum + (typed[cat]?.priceRupees ?? 0), 0);
  return c.json({
    issues: checkBuild(typed),
    totalRupees,
    wattage: estimateWattage(typed),
  });
});

const port = Number(process.env.PORT ?? 4000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});
