import type { Catalog, Category } from "@pcb/shared";
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
} from "./db";

type Price = { priceRupees: number | null; inStock: boolean; buyUrl: string | null };

function isBetter(candidate: Price, current: Price | undefined): boolean {
  if (!current) return true;
  if (candidate.priceRupees == null) return false;
  if (current.priceRupees == null) return true;
  if (candidate.inStock !== current.inStock) return candidate.inStock;
  return candidate.priceRupees < current.priceRupees;
}

async function loadPrices(db: Db): Promise<Map<string, Price>> {
  const rows = await db
    .select({
      category: listings.partCategory,
      partId: listings.partId,
      pricePaise: listings.pricePaise,
      inStock: listings.inStock,
      url: listings.url,
    })
    .from(listings);

  const best = new Map<string, Price>();
  for (const r of rows) {
    const key = `${r.category}:${r.partId}`;
    const candidate: Price = {
      priceRupees: r.pricePaise == null ? null : r.pricePaise / 100,
      inStock: r.pricePaise != null && r.inStock,
      buyUrl: r.url.startsWith("http") ? r.url : null,
    };
    if (isBetter(candidate, best.get(key))) best.set(key, candidate);
  }
  return best;
}

function toPart<T extends { id: number; enabled: boolean; createdAt: Date }>(
  category: Category,
  row: T,
  prices: Map<string, Price>,
) {
  const { enabled: _enabled, createdAt: _createdAt, ...part } = row;
  const price = prices.get(`${category}:${row.id}`) ?? { priceRupees: null, inStock: false, buyUrl: null };
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
