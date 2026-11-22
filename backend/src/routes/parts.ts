import { USE_CASE_IDS, USE_CASES } from "@pcb/shared";
import { Hono } from "hono";
import { getCatalog } from "../context";

export const partsRoutes = new Hono();

partsRoutes.get("/parts", async (c) => c.json(await getCatalog()));

partsRoutes.get("/use-cases", (c) =>
  c.json(
    USE_CASE_IDS.map((id) => {
      const u = USE_CASES[id];
      return { id: u.id, label: u.label, description: u.description, needsGpu: u.needsGpu, split: u.split };
    }),
  ),
);
