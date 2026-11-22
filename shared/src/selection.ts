import { CATEGORIES, type Build, type Catalog, type Category, type PartBase } from "./types";

export type Selection = Partial<Record<Category, string>>;

export function resolveSelection(catalog: Catalog, selection: Selection): { build: Build; unknown: string[] } {
  const build: Record<string, PartBase> = {};
  const unknown: string[] = [];
  for (const category of CATEGORIES) {
    const slug = selection[category];
    if (!slug) continue;
    const part = (catalog[category] as PartBase[]).find((p) => p.slug === slug);
    if (part) build[category] = part;
    else unknown.push(`${category}: ${slug}`);
  }
  return { build: build as Build, unknown };
}

export function toSelection(build: Build): Selection {
  const selection: Selection = {};
  for (const category of CATEGORIES) {
    const part = build[category];
    if (part) selection[category] = part.slug;
  }
  return selection;
}
