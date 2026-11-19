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
import { CircleCheck, TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_META, formatINR } from "@/lib/parts";
import { PartPicker } from "./PartPicker";
import { PartSlot } from "./PartSlot";
import { Summary } from "./Summary";

type Selection = Partial<Record<Category, string>>;

const REQUIRED = CATEGORIES.filter((c) => CATEGORY_META[c].required);

const GROUPS: { title: string; categories: Category[] }[] = [
  { title: "Core parts", categories: ["cpu", "motherboard", "ram", "gpu"] },
  { title: "Storage & power", categories: ["storage", "psu"] },
  { title: "Cooling & case", categories: ["cooler", "case"] },
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
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-32 lg:pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-accent-text uppercase">◆ Advanced mode</p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Build your <span className="text-brand">PC</span>
          </h1>
          <p className="mt-2 text-muted">Pick each part. We check that everything fits as you go.</p>
        </div>
        <div className="w-full sm:w-56">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Progress</span>
            <span className="font-medium tabular-nums">
              {requiredDone} / {REQUIRED.length}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700 ease-(--ease)"
              style={{ width: `${(requiredDone / REQUIRED.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {GROUPS.map((group) => (
            <section key={group.title} aria-labelledby={`group-${group.title}`}>
              <h2
                id={`group-${group.title}`}
                className="mb-3 text-xs font-semibold tracking-widest text-muted uppercase"
              >
                {group.title}
              </h2>
              <ol className="space-y-3">
                {group.categories.map((c) => (
                  <PartSlot
                    key={c}
                    index={CATEGORIES.indexOf(c)}
                    category={c}
                    part={build[c]}
                    issues={issues.filter((i) => i.parts.includes(c) && build[c])}
                    onChoose={() => setPicking(c)}
                    onRemove={() => remove(c)}
                  />
                ))}
              </ol>
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

      <div className="fixed inset-x-0 bottom-0 glass-strong border-t border-border px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl font-bold tabular-nums">{formatINR(total)}</p>
            {chosen > 0 &&
              (errorCount > 0 ? (
                <p className="flex items-center gap-1 text-xs text-error">
                  <TriangleAlert className="size-3.5" aria-hidden /> {errorCount} to fix
                </p>
              ) : (
                <p className="flex items-center gap-1 text-xs text-ok">
                  <CircleCheck className="size-3.5" aria-hidden /> Everything fits
                </p>
              ))}
          </div>
          <a href="#summary" className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">
            View summary
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
