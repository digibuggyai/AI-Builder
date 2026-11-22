import type { Catalog } from "@pcb/shared";
import { config } from "dotenv";
import { loadCatalog } from "./catalog";
import { createDb } from "./db";

config({ path: "../.env", quiet: true });

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");

export const db = createDb(process.env.DATABASE_URL);

let cached: { at: number; catalog: Catalog } | null = null;

export async function getCatalog(): Promise<Catalog> {
  if (cached && Date.now() - cached.at < 60_000) return cached.catalog;
  const catalog = await loadCatalog(db);
  cached = { at: Date.now(), catalog };
  return catalog;
}
