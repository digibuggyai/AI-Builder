import { recommendBuild, resolveSelection, suggestParts, toSelection } from "@pcb/shared";
import { Hono } from "hono";
import { z } from "zod";
import { getCatalog } from "../context";
import { budget, category, selection, useCase } from "../schemas";

export const recommendRoutes = new Hono();

const recommendBody = z.object({ useCase, budgetRupees: budget });

recommendRoutes.post("/recommend", async (c) => {
  const parsed = recommendBody.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'Send JSON like { "useCase": "gaming-1080p", "budgetRupees": 100000 }' }, 400);
  }

  const result = recommendBuild(await getCatalog(), parsed.data.useCase, parsed.data.budgetRupees);
  if (!result.ok) return c.json(result);

  return c.json({
    ok: true,
    useCase: result.useCase,
    budgetRupees: result.budgetRupees,
    totalRupees: result.totalRupees,
    parts: toSelection(result.build),
    issues: result.issues,
  });
});

const suggestionsBody = z.object({
  category,
  useCase,
  budgetRupees: budget.optional(),
  build: selection,
});

recommendRoutes.post("/suggestions", async (c) => {
  const parsed = suggestionsBody.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'Send JSON like { "category": "cpu", "useCase": "gaming-1080p", "build": {} }' }, 400);
  }

  const catalog = await getCatalog();
  const { build, unknown } = resolveSelection(catalog, parsed.data.build);
  if (unknown.length > 0) return c.json({ error: `Unknown parts: ${unknown.join(", ")}` }, 404);

  return c.json(suggestParts(catalog, build, parsed.data.category, parsed.data.useCase, parsed.data.budgetRupees));
});
