"use client";

import {
  CATEGORIES,
  checkBuild,
  estimateWattage,
  type Build,
  type Catalog,
  type Category,
  type PartBase,
} from "@pcb/shared";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_META, formatINR } from "@/lib/parts";
import { ModeSwitch } from "@/components/ModeSwitch";
import { ImportPanel } from "./ImportPanel";
import { PartPicker } from "./PartPicker";
import { PartSlot } from "./PartSlot";
import { Summary } from "./Summary";

type Selection = Partial<Record<Category, string>>;

const REQUIRED = CATEGORIES.filter((c) => CATEGORY_META[c].required);

const GROUPS: { title: string; categories: Category[] }[] = [
  { title: "Core", categories: ["cpu", "motherboard", "ram", "gpu"] },
  { title: "Storage and power", categories: ["storage", "psu"] },
  { title: "Cooling and case", categories: ["cooler", "case"] },
  { title: "Extras", categories: ["monitor"] },
];

export function Builder({ catalog }: { catalog: Catalog }) {
  const searchParams = useSearchParams();

  const [selection, setSelection] = useState<Selection>(() => {
    const start: Selection = {};
    for (const c of CATEGORIES) {
      const slug = searchParams.get(c);
      if (slug && (catalog[c] as PartBase[]).some((p) => p.slug === slug)) start[c] = slug;
    }
    return start;
  });
  const [picking, setPicking] = useState<Category | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    for (const c of CATEGORIES) {
      const slug = selection[c];
      if (slug) params.set(c, slug);
    }
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [selection]);

  const build = useMemo(() => {
    const result: Record<string, PartBase> = {};
    for (const c of CATEGORIES) {
      const slug = selection[c];
      const part = slug ? (catalog[c] as PartBase[]).find((p) => p.slug === slug) : undefined;
      if (part) result[c] = part;
    }
    return result as Build;
  }, [selection, catalog]);

  const issues = useMemo(() => checkBuild(build), [build]);
  const total = CATEGORIES.reduce((sum, c) => sum + (build[c]?.priceRupees ?? 0), 0);
  const wattage = estimateWattage(build);
  const chosen = CATEGORIES.filter((c) => build[c]).length;
  const requiredDone = REQUIRED.filter((c) => build[c]).length;
  const errorCount = issues.filter((i) => i.level === "error").length;

  const choose = (category: Category, slug: string) => {
    setSelection((s) => ({ ...s, [category]: slug }));
    setPicking(null);
  };
  const remove = (category: Category) =>
    setSelection((s) => {
      const next = { ...s };
      delete next[category];
      return next;
    });

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-28 lg:pb-16">
      <div className="mb-6">
        <ModeSwitch />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your <em>build.</em></h1>
          <p className="mt-1 text-sm text-muted">Add parts in any order. Each one is checked against the rest.</p>
        </div>
        <p className="tabular-nums text-sm text-muted">
          <span className="text-foreground">{requiredDone}</span> of {REQUIRED.length} required parts
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ImportPanel onImport={(imported) => setSelection((s) => ({ ...s, ...imported }))} />
          {GROUPS.map((group) => (
            <section key={group.title} aria-label={group.title}>
              <h2 className="mb-2 text-xs font-medium text-muted">{group.title}</h2>
              <ul className="divide-y divide-border overflow-hidden rounded-lg glass glow border blobs card-hover">
                {group.categories.map((c) => (
                  <PartSlot
                    key={c}
                    category={c}
                    part={build[c]}
                    available={catalog[c].length}
                    issues={issues.filter((i) => i.parts.includes(c) && build[c])}
                    onChoose={() => setPicking(c)}
                    onRemove={() => remove(c)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Summary
          build={build}
          issues={issues}
          total={total}
          wattage={wattage}
          chosen={chosen}
          onReset={() => setSelection({})}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="tabular-nums text-lg font-medium ">{formatINR(total)}</p>
            <p className={`text-xs ${errorCount > 0 ? "text-error" : "text-muted"}`}>
              {chosen === 0
                ? "No parts yet"
                : errorCount > 0
                  ? `${errorCount} ${errorCount === 1 ? "problem" : "problems"} to fix`
                  : "No problems found"}
            </p>
          </div>
          <a href="#summary" className="btn-secondary rounded-xl px-3 py-1.5 text-sm font-medium">
            Summary
          </a>
        </div>
      </div>

      <PartPicker
        category={picking}
        catalog={catalog}
        build={build}
        onSelect={choose}
        onClose={() => setPicking(null)}
      />
    </div>
  );
}
