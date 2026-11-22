import { CATEGORIES, checkBuild, estimateWattage, resolveSelection, totalRupees, toSelection } from "@pcb/shared";
import { Hono } from "hono";
import { z } from "zod";
import { db, getCatalog } from "../context";
import { buildItems, builds, eq } from "../db";
import { budget, selection, useCase } from "../schemas";

export const buildRoutes = new Hono();

buildRoutes.post("/builds/check", async (c) => {
  const parsed = selection.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Send JSON like { "cpu": "amd-ryzen-5-7600" }' }, 400);

  const { build, unknown } = resolveSelection(await getCatalog(), parsed.data);
  if (unknown.length > 0) return c.json({ error: `Unknown parts: ${unknown.join(", ")}` }, 404);

  return c.json({ issues: checkBuild(build), totalRupees: totalRupees(build), wattage: estimateWattage(build) });
});

const saveBody = z.object({
  mode: z.enum(["beginner", "pro", "advanced"]),
  useCase: useCase.optional(),
  budgetRupees: budget.optional(),
  parts: selection,
});

buildRoutes.post("/builds", async (c) => {
  const parsed = saveBody.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Send JSON like { "mode": "advanced", "parts": { "cpu": "..." } }' }, 400);

  const { build, unknown } = resolveSelection(await getCatalog(), parsed.data.parts);
  if (unknown.length > 0) return c.json({ error: `Unknown parts: ${unknown.join(", ")}` }, 404);
  if (Object.keys(build).length === 0) return c.json({ error: "A build needs at least one part" }, 400);

  const total = totalRupees(build);
  const id = await db.transaction(async (tx) => {
    const [saved] = await tx
      .insert(builds)
      .values({
        mode: parsed.data.mode,
        useCase: parsed.data.useCase,
        budgetPaise: parsed.data.budgetRupees != null ? parsed.data.budgetRupees * 100 : null,
        totalPaise: total * 100,
      })
      .returning({ id: builds.id });

    const items = CATEGORIES.flatMap((category) => {
      const part = build[category];
      return part
        ? [{ buildId: saved!.id, partCategory: category, partId: part.id, pricePaise: part.priceRupees != null ? part.priceRupees * 100 : null }]
        : [];
    });
    await tx.insert(buildItems).values(items);
    return saved!.id;
  });

  return c.json({ id }, 201);
});

buildRoutes.get("/builds/:id", async (c) => {
  const id = c.req.param("id");
  if (!z.uuid().safeParse(id).success) return c.json({ error: "Not a valid build id" }, 400);

  const [saved] = await db.select().from(builds).where(eq(builds.id, id));
  if (!saved) return c.json({ error: "Build not found" }, 404);

  const items = await db.select().from(buildItems).where(eq(buildItems.buildId, id));
  const catalog = await getCatalog();
  const parts: Record<string, string> = {};
  for (const item of items) {
    const part = catalog[item.partCategory].find((p) => p.id === item.partId);
    if (part) parts[item.partCategory] = part.slug;
  }
  const { build } = resolveSelection(catalog, parts);

  return c.json({
    id: saved.id,
    mode: saved.mode,
    useCase: saved.useCase,
    budgetRupees: saved.budgetPaise != null ? saved.budgetPaise / 100 : null,
    savedTotalRupees: saved.totalPaise != null ? saved.totalPaise / 100 : null,
    currentTotalRupees: totalRupees(build),
    parts: toSelection(build),
    createdAt: saved.createdAt,
  });
});
