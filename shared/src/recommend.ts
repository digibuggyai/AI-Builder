import { checkBuild, problemsIfChosen } from "./check";
import { USE_CASES, type UseCase, type UseCaseId } from "./profiles";
import { cpuScore, gpuScore } from "./scores";
import type { Build, Catalog, Category, Cpu, Gpu, Issue, PartByCategory, Ram, Storage } from "./types";

type AnyPart = PartByCategory[Category];

const FILL_ORDER = ["motherboard", "ram", "storage", "cooler", "psu", "case"] as const;
const MAX_ATTEMPTS = 400;

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function buyable<T extends AnyPart>(parts: T[]): T[] {
  return parts.filter((p) => p.priceRupees != null && p.inStock);
}

export function totalRupees(build: Build): number {
  return Object.values(build).reduce((sum, part) => sum + (part?.priceRupees ?? 0), 0);
}

export function meetsNeeds(category: Category, part: AnyPart, useCase: UseCase): boolean {
  if (category === "cpu") return (part as Cpu).cores >= useCase.minCores;
  if (category === "gpu") return (part as Gpu).vramGb >= useCase.minVramGb;
  if (category === "ram") return (part as Ram).capacityGb >= useCase.minRamGb;
  if (category === "storage") {
    const drive = part as Storage;
    return drive.capacityGb >= useCase.minStorageGb && drive.type !== "HDD";
  }
  return true;
}

function fitsCleanly(build: Build, category: Category, part: AnyPart): boolean {
  const next = { ...build, [category]: part } as Build;
  return !checkBuild(next).some((issue) => issue.parts.includes(category));
}

function cheapestClean(catalog: Catalog, build: Build, category: Category, useCase: UseCase): AnyPart | undefined {
  return buyable(catalog[category] as AnyPart[])
    .filter((p) => meetsNeeds(category, p, useCase) && fitsCleanly(build, category, p))
    .sort((a, b) => a.priceRupees! - b.priceRupees!)[0];
}

function completeBuild(catalog: Catalog, start: Build, useCase: UseCase): Build | null {
  let build: Build = { ...start };
  for (const category of FILL_ORDER) {
    const part = cheapestClean(catalog, build, category, useCase);
    if (!part) return null;
    build = { ...build, [category]: part } as Build;
  }
  return build;
}

type Pair = { cpu: Cpu; gpu: Gpu | undefined; price: number; score: number };

function rankedPairs(catalog: Catalog, useCase: UseCase): Pair[] {
  const cpus = buyable(catalog.cpu).filter((c) => meetsNeeds("cpu", c, useCase));
  const gpus: (Gpu | undefined)[] = useCase.needsGpu
    ? buyable(catalog.gpu).filter((g) => meetsNeeds("gpu", g, useCase))
    : [undefined, ...buyable(catalog.gpu)];

  const maxCpu = Math.max(1, ...cpus.map((c) => cpuScore(c, useCase.gaming)));
  const maxGpuPrice = Math.max(1, ...gpus.map((g) => g?.priceRupees ?? 0));
  const gpuValue = (g: Gpu) => gpuScore(g) ?? ((g.priceRupees ?? 0) / maxGpuPrice) * 100;
  const maxGpu = Math.max(1, ...gpus.map((g) => (g ? gpuValue(g) : 0)));

  const pairs: Pair[] = [];
  for (const gpu of gpus) {
    for (const cpu of cpus) {
      const g = gpu ? gpuValue(gpu) / maxGpu : 0;
      const c = cpuScore(cpu, useCase.gaming) / maxCpu;
      pairs.push({
        cpu,
        gpu,
        price: cpu.priceRupees! + (gpu?.priceRupees ?? 0),
        score: useCase.gpuWeight * g + (1 - useCase.gpuWeight) * c,
      });
    }
  }
  return pairs;
}

function tryPair(catalog: Catalog, pair: Pair, useCase: UseCase): Build | null {
  const start: Build = pair.gpu ? { gpu: pair.gpu } : {};
  if (!fitsCleanly(start, "cpu", pair.cpu)) return null;
  return completeBuild(catalog, { ...start, cpu: pair.cpu }, useCase);
}

export type Recommendation =
  | { ok: true; useCase: UseCaseId; budgetRupees: number; build: Build; totalRupees: number; issues: Issue[] }
  | { ok: false; reason: string; cheapestRupees: number | null };

export function recommendBuild(catalog: Catalog, useCaseId: UseCaseId, budgetRupees: number): Recommendation {
  const useCase = USE_CASES[useCaseId];
  const pairs = rankedPairs(catalog, useCase);

  const withinBudget = pairs
    .filter((p) => p.price < budgetRupees)
    .sort((a, b) => b.score - a.score || a.price - b.price);

  for (const pair of withinBudget.slice(0, MAX_ATTEMPTS)) {
    const build = tryPair(catalog, pair, useCase);
    if (build && totalRupees(build) <= budgetRupees) {
      return { ok: true, useCase: useCaseId, budgetRupees, build, totalRupees: totalRupees(build), issues: checkBuild(build) };
    }
  }

  let cheapest: number | null = null;
  for (const pair of [...pairs].sort((a, b) => a.price - b.price).slice(0, 60)) {
    const build = tryPair(catalog, pair, useCase);
    if (build) cheapest = Math.min(cheapest ?? Infinity, totalRupees(build));
  }

  return cheapest == null
    ? { ok: false, reason: `There aren't enough parts in stock to build a ${useCase.label.toLowerCase()} PC right now.`, cheapestRupees: null }
    : { ok: false, reason: `The cheapest ${useCase.label.toLowerCase()} build we can make right now costs ${rupees(cheapest)}.`, cheapestRupees: cheapest };
}

export type SuggestionOption = { slug: string; fits: boolean; meetsNeeds: boolean; problems: Issue[] };

export type Suggestions = {
  category: Category;
  recommendedSlug: string | null;
  reason: string | null;
  options: SuggestionOption[];
};

export function suggestParts(
  catalog: Catalog,
  build: Build,
  category: Category,
  useCaseId: UseCaseId,
  budgetRupees?: number,
): Suggestions {
  const useCase = USE_CASES[useCaseId];
  const parts = buyable(catalog[category] as AnyPart[]);

  const options = parts.map((part) => {
    const problems = problemsIfChosen(build, category, part);
    return { part, fits: problems.length === 0, meetsNeeds: meetsNeeds(category, part, useCase), problems };
  });
  const candidates = options.filter((o) => o.fits && o.meetsNeeds).map((o) => o.part);

  const share = category === "monitor" ? undefined : useCase.split[category];
  const target = budgetRupees && share ? budgetRupees * share * 1.15 : Infinity;

  let recommended: AnyPart | undefined;
  let reason: string | null = null;

  if (category === "gpu" || category === "cpu") {
    const score = (p: AnyPart) =>
      category === "gpu" ? (gpuScore(p as Gpu) ?? 0) : cpuScore(p as Cpu, useCase.gaming);
    const affordable = candidates.filter((p) => p.priceRupees! <= target);
    recommended = [...(affordable.length > 0 ? affordable : candidates)].sort(
      (a, b) => score(b) - score(a) || a.priceRupees! - b.priceRupees!,
    )[0];
    if (recommended) {
      reason =
        target === Infinity
          ? `The fastest option that fits your other parts, for ${useCase.label.toLowerCase()}.`
          : `The fastest option at around ${rupees(target)} or less, for ${useCase.label.toLowerCase()}.`;
    }
  } else {
    const clean = candidates.filter((p) => fitsCleanly(build, category, p));
    recommended = [...(clean.length > 0 ? clean : candidates)].sort((a, b) => a.priceRupees! - b.priceRupees!)[0];
    if (recommended) reason = "The cheapest option that works with everything you've picked, with room to spare.";
  }

  const order = (o: (typeof options)[number]) => (o.part === recommended ? 0 : o.fits && o.meetsNeeds ? 1 : o.fits ? 2 : 3);
  options.sort((a, b) => order(a) - order(b) || a.part.priceRupees! - b.part.priceRupees!);

  return {
    category,
    recommendedSlug: recommended?.slug ?? null,
    reason,
    options: options.map((o) => ({ slug: o.part.slug, fits: o.fits, meetsNeeds: o.meetsNeeds, problems: o.problems })),
  };
}
