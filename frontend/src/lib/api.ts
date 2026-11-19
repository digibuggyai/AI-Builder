import type { Catalog } from "@pcb/shared";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function getCatalog(): Promise<Catalog> {
  const res = await fetch(`${API_URL}/parts`, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`API answered ${res.status}`);
  return res.json();
}
