import type { Catalog, Category } from "@pcb/compat";
import {
  cases,
  coolers,
  cpus,
  eq,
  gpus,
  listings,
  monitors,
  motherboards,
  psus,
  ramKits,
  storage,
  type Db,
} from "@pcb/db";

type Price = { priceRupees: number | null; inStock: boolean };

async function loadPrices(db: Db): Promise<Map<string, Price>> {
  const rows = await db
    .select({
      category: listings.partCategory,
      partId: listings.partId,
      pricePaise: listings.pricePaise,
      inStock: listings.inStock,
    })
    .from(listings);

  const best = new Map<string, Price>();
  for (const r of rows) {
    if (r.pricePaise == null) continue;
    const key = `${r.category}:${r.partId}`;
    const rupees = r.pricePaise / 100;
    const current = best.get(key);
    const better =
      !current ||
      (r.inStock && !current.inStock) ||
      (r.inStock === current.inStock && rupees < (current.priceRupees ?? Infinity));
    if (better) best.set(key, { priceRupees: rupees, inStock: r.inStock });
  }
  return best;
}

function toPart<T extends { id: number; enabled: boolean; createdAt: Date }>(
  category: Category,
  row: T,
  prices: Map<string, Price>,
) {
  const { enabled: _enabled, createdAt: _createdAt, ...part } = row;
  const price = prices.get(`${category}:${row.id}`) ?? { priceRupees: null, inStock: false };
  return { ...part, ...price };
}

export async function loadCatalog(db: Db): Promise<Catalog> {
  const [prices, cpu, motherboard, ram, gpu, store, psu, cooler, pcCase, monitor] = await Promise.all([
    loadPrices(db),
    db.select().from(cpus).where(eq(cpus.enabled, true)),
    db.select().from(motherboards).where(eq(motherboards.enabled, true)),
    db.select().from(ramKits).where(eq(ramKits.enabled, true)),
    db.select().from(gpus).where(eq(gpus.enabled, true)),
    db.select().from(storage).where(eq(storage.enabled, true)),
    db.select().from(psus).where(eq(psus.enabled, true)),
    db.select().from(coolers).where(eq(coolers.enabled, true)),
    db.select().from(cases).where(eq(cases.enabled, true)),
    db.select().from(monitors).where(eq(monitors.enabled, true)),
  ]);

  return {
    cpu: cpu.map((r) => toPart("cpu", r, prices)),
    motherboard: motherboard.map((r) => toPart("motherboard", r, prices)),
    ram: ram.map((r) => toPart("ram", r, prices)),
    gpu: gpu.map((r) => toPart("gpu", r, prices)),
    storage: store.map((r) => toPart("storage", r, prices)),
    psu: psu.map((r) => toPart("psu", r, prices)),
    cooler: cooler.map((r) => toPart("cooler", r, prices)),
    case: pcCase.map((r) => toPart("case", r, prices)),
    monitor: monitor.map((r) => toPart("monitor", r, prices)),
  };
}
